import { and, desc, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, feedItems, ingestRuns, type FeedItem, type SourceRef } from "@/db/schema";
import { activeProvider, rewriteWithAI } from "./ai";
import { getCategory, isCategory, type CategorySlug } from "./categories";
import { classify, detectAudiences, detectLawStatus, similarity, tokens } from "./classify";
import { CATEGORY_CONTEXT, tipsFor } from "./context";
import { ensureSchema } from "./ensure-schema";
import { fetchArticleContext, fetchFeed } from "./feeds";
import { slugify, stripHtml } from "./format";
import { resolveArticleImage } from "./images";
import { getSource, SOURCES } from "./sources";
import { translateDeVi } from "./translate";

const INTERVAL_MIN = Number(process.env.INGEST_INTERVAL_MINUTES || 30);
const MAX_AI = Number(process.env.INGEST_MAX_AI || 6);
const MAX_AUTO = Number(process.env.INGEST_MAX_AUTO || 10);
const MIN_RELEVANCE = 4;

const g = globalThis as typeof globalThis & { __nhipducIngest?: Promise<IngestResult> | null };

export type IngestResult = { fetched: number; created: number; log: string[]; skipped?: boolean };

export async function lastRun() {
  await ensureSchema();
  const [run] = await db.select().from(ingestRuns).orderBy(desc(ingestRuns.startedAt)).limit(1);
  return run ?? null;
}

/** Run ingestion unless a successful one finished recently. Safe to call from many places (single-flight). */
export async function maybeIngest(): Promise<void> {
  try {
    if (g.__nhipducIngest) return;
    const run = await lastRun();
    if (
      run &&
      run.finishedAt &&
      run.fetched > 0 &&
      Date.now() - run.startedAt.getTime() < INTERVAL_MIN * 60 * 1000
    ) {
      return;
    }
    await runIngest();
  } catch (e) {
    console.error("[ingest] maybeIngest failed", e);
  }
}

export function runIngest(): Promise<IngestResult> {
  if (g.__nhipducIngest) return g.__nhipducIngest;
  g.__nhipducIngest = doIngest().finally(() => {
    g.__nhipducIngest = null;
  });
  return g.__nhipducIngest;
}

export function isIngesting(): boolean {
  return !!g.__nhipducIngest;
}

async function doIngest(): Promise<IngestResult> {
  await ensureSchema();
  const provider = activeProvider();
  const log: string[] = [];
  const [run] = await db.insert(ingestRuns).values({ mode: provider ? `ai:${provider}` : "auto" }).returning();

  // 1) Crawl RSS feeds (metadata + teaser only).
  let fetched = 0;
  const results = await Promise.allSettled(SOURCES.map(async (s) => ({ s, items: await fetchFeed(s) })));

  // Compute reference clock from the live RSS feeds themselves so local PC clock skew never drops valid news!
  let latestFeedTimestamp = 0;
  for (const r of results) {
    if (r.status === "fulfilled") {
      for (const it of r.value.items) {
        const t = it.publishedAt.getTime();
        if (!Number.isNaN(t) && t > latestFeedTimestamp && t <= Date.now() + 24 * 3600 * 1000) {
          latestFeedTimestamp = t;
        }
      }
    }
  }
  const refNow = latestFeedTimestamp > 0 ? latestFeedTimestamp : Date.now();
  const cutoff = refNow - 96 * 3600 * 1000;

  for (const r of results) {
    if (r.status === "rejected") {
      log.push(`Lỗi nguồn: ${String(r.reason).slice(0, 120)}`);
      continue;
    }
    const { s, items } = r.value;
    const rows = items
      .filter((i) => i.publishedAt.getTime() >= cutoff)
      .map((i) => {
        const c = classify(i.title, i.summary, s.domestic);
        return {
          sourceId: s.id,
          guid: i.guid,
          url: i.url,
          title: i.title,
          summary: i.summary,
          publishedAt: i.publishedAt,
          relevance: c.relevance,
          category: c.category,
          status: c.relevance >= MIN_RELEVANCE ? "new" : "skipped",
        };
      });
    if (rows.length) {
      const inserted = await db.insert(feedItems).values(rows).onConflictDoNothing().returning({ id: feedItems.id });
      fetched += inserted.length;
    }
    log.push(`${s.name} (${s.id}): ${items.length} tin (${rows.filter((x) => x.status === "new").length} tin đạt ngưỡng)`);
  }

  // 2) Expire stale queue entries relative to refNow.
  await db
    .update(feedItems)
    .set({ status: "skipped" })
    .where(and(eq(feedItems.status, "new"), lt(feedItems.publishedAt, new Date(cutoff))));

  // 3) Pick candidates & cluster corroborating outlets covering the same story.
  const candidates = await db
    .select()
    .from(feedItems)
    .where(eq(feedItems.status, "new"))
    .orderBy(desc(feedItems.relevance), desc(feedItems.publishedAt))
    .limit(80);

  const recent = await db
    .select({ t: articles.sourceTitle, img: articles.image })
    .from(articles)
    .orderBy(desc(articles.publishedAt))
    .limit(80);
  const seen = recent.filter((r) => r.t).map((r) => tokens(r.t as string));
  const usedImages = new Set<string>(recent.map((r) => r.img).filter(Boolean));

  const limit = provider ? MAX_AI : MAX_AUTO;
  const picked: { primary: FeedItem; related: FeedItem[] }[] = [];
  const dupes: number[] = [];

  // Group deduplicated clusters first
  const allClusters: { primary: FeedItem; related: FeedItem[] }[] = [];
  for (const c of candidates) {
    const tk = tokens(c.title);
    if (seen.some((s) => similarity(s, tk) >= 0.58)) {
      dupes.push(c.id);
      continue;
    }
    const existingCluster = allClusters.find((cluster) => similarity(tokens(cluster.primary.title), tk) >= 0.45);
    if (existingCluster) {
      existingCluster.related.push(c);
      dupes.push(c.id);
      continue;
    }
    allClusters.push({ primary: c, related: [] });
    seen.push(tk);
  }

  // Round-robin across categories first so each ingest batch covers Politics, Law, Migration, Economy, Life, and Vietnamese Community
  const usedCategories = new Set<string>();
  for (const cl of allClusters) {
    if (picked.length >= limit) break;
    if (!usedCategories.has(cl.primary.category)) {
      picked.push(cl);
      usedCategories.add(cl.primary.category);
    }
  }
  for (const cl of allClusters) {
    if (picked.length >= limit) break;
    if (!picked.includes(cl)) {
      picked.push(cl);
    }
  }
  if (dupes.length) await db.update(feedItems).set({ status: "duplicate" }).where(inArray(feedItems.id, dupes));

  // 4) Write in-depth Vietnamese articles.
  let created = 0;
  for (const cluster of picked) {
    const item = cluster.primary;
    await db.update(feedItems).set({ status: "processing" }).where(eq(feedItems.id, item.id));
    try {
      const ok = provider
        ? await publishWithAI(item, cluster.related, usedImages).catch(async (e) => {
            log.push(`AI lỗi (${item.id}): ${String(e).slice(0, 140)} → dùng tin vắn`);
            return publishBrief(item, usedImages);
          })
        : await publishBrief(item, usedImages);
      await db.update(feedItems).set({ status: ok ? "done" : "error" }).where(eq(feedItems.id, item.id));
      if (ok) created++;
    } catch (e) {
      log.push(`Lỗi xử lý ${item.id}: ${String(e).slice(0, 140)}`);
      await db.update(feedItems).set({ status: "error", error: String(e).slice(0, 500) }).where(eq(feedItems.id, item.id));
    }
  }

  log.push(`Đã thêm ${fetched} tin mới vào hàng đợi, xuất bản ${created} bài chuyên sâu (${provider ? `AI: ${provider}` : "tin vắn tự động"}).`);
  await db
    .update(ingestRuns)
    .set({ finishedAt: new Date(), fetched, created, log: log.join("\n") })
    .where(eq(ingestRuns.id, run.id));
  return { fetched, created, log };
}

function uniqueSlug(title: string, id: number): string {
  return `${slugify(title) || "tin"}-${id.toString(36)}`;
}

async function publishWithAI(item: FeedItem, relatedItems: FeedItem[] = [], usedImages?: Set<string>): Promise<boolean> {
  const src = getSource(item.sourceId);
  const primaryContext = await fetchArticleContext(item.url);

  const extraContexts: string[] = [];
  const sourcesJson: SourceRef[] = [
    {
      name: src?.name ?? item.sourceId,
      url: item.url,
      title: item.title,
    },
  ];

  for (const rel of relatedItems.slice(0, 2)) {
    const relSrc = getSource(rel.sourceId);
    const relName = relSrc?.name ?? rel.sourceId;
    sourcesJson.push({ name: relName, url: rel.url, title: rel.title });
    const relCtx = await fetchArticleContext(rel.url);
    if (relCtx) {
      extraContexts.push(`\n--- Dữ kiện bổ sung từ ${relName} (${rel.title}) ---\n${relCtx.slice(0, 3500)}`);
    } else if (rel.summary) {
      extraContexts.push(`\n--- Tóm tắt từ ${relName} (${rel.title}) ---\n${rel.summary}`);
    }
  }

  const combinedContext = [primaryContext, ...extraContexts].filter(Boolean).join("\n\n").slice(0, 13000);

  const out = await rewriteWithAI({
    sourceName: src?.name ?? item.sourceId,
    title: item.title,
    summary: item.summary,
    context: combinedContext,
    categoryHint: (isCategory(item.category) ? item.category : "thoi-su") as CategorySlug,
    corroboratingSources: sourcesJson.slice(1),
  });

  const slug = uniqueSlug(out.title, item.id);
  const img = await resolveArticleImage({
    slug,
    category: out.category,
    imagePrompt: out.imagePrompt,
    imageSearchQuery: out.imageSearchQuery,
    preferMode: out.preferVisualMode,
    usedUrls: usedImages,
  });

  await db
    .insert(articles)
    .values({
      slug,
      title: out.title,
      sapo: out.sapo,
      body: out.body,
      keyPoints: out.keyPoints,
      vnImpact: out.vnImpact,
      glossary: out.glossary,
      lawStatus: out.lawStatus,
      audienceTargets: out.audienceTargets,
      imagePrompt: out.imagePrompt,
      sourcesJson,
      category: out.category,
      tags: out.tags,
      image: img.src,
      imageCredit: img.credit,
      sourceName: src?.name ?? item.sourceId,
      sourceUrl: item.url,
      sourceTitle: item.title,
      kind: "feature",
      mode: "ai",
      relevance: item.relevance,
      feedItemId: item.id,
      publishedAt: new Date(),
    })
    .onConflictDoNothing();
  return true;
}

async function publishBrief(item: FeedItem, usedImages?: Set<string>): Promise<boolean> {
  const src = getSource(item.sourceId);
  const sourceName = src?.name ?? item.sourceId;
  const title = await translateDeVi(item.title);
  const sapo = item.summary ? await translateDeVi(item.summary.slice(0, 450)) : title;
  const category = (isCategory(item.category) ? item.category : "thoi-su") as CategorySlug;
  const tips = tipsFor(`${item.title} ${item.summary}`);
  const parts = [
    `Theo ghi nhận từ ${sourceName}, ${sapo.charAt(0).toLowerCase()}${sapo.slice(1)}`,
    `## Bối cảnh chính sách tại Đức`,
    CATEGORY_CONTEXT[category],
  ];
  if (tips.length) parts.push(`## Người Việt tại Đức cần lưu ý`, tips.map((t) => `- ${t}`).join("\n"));
  const slug = uniqueSlug(title, item.id);
  const img = await resolveArticleImage({
    slug,
    category,
    imageSearchQuery: `${category === "chinh-tri" ? "Bundestag Berlin" : "Germany city life"}`,
    preferMode: "photo",
    usedUrls: usedImages,
  });
  await db
    .insert(articles)
    .values({
      slug,
      title,
      sapo,
      body: parts.join("\n\n"),
      keyPoints: [],
      vnImpact: tips.length ? tips.join(" ") : null,
      glossary: [],
      lawStatus: detectLawStatus(`${item.title} ${item.summary}`),
      audienceTargets: detectAudiences(`${item.title} ${item.summary}`),
      sourcesJson: [{ name: sourceName, url: item.url, title: item.title }],
      category,
      tags: [getCategory(category).short],
      image: img.src,
      imageCredit: img.credit,
      sourceName,
      sourceUrl: item.url,
      sourceTitle: item.title,
      kind: "brief",
      mode: "auto",
      relevance: item.relevance,
      feedItemId: item.id,
      publishedAt: new Date(),
    })
    .onConflictDoNothing();
  return true;
}

/**
 * Nâng cấp một bài viết ngắn (brief / bài cũ) thành bài phân tích chuyên sâu 1.000–1.500 chữ bằng AI + Ảnh mới.
 */
export async function upgradeArticleWithAI(articleId: number): Promise<boolean> {
  await ensureSchema();
  const [a] = await db.select().from(articles).where(eq(articles.id, articleId)).limit(1);
  if (!a) return false;

  const context = a.sourceUrl ? await fetchArticleContext(a.sourceUrl) : a.body;
  const out = await rewriteWithAI({
    sourceName: a.sourceName || "Báo chí Đức",
    title: a.sourceTitle || a.title,
    summary: a.sapo,
    context: context || a.body,
    categoryHint: (isCategory(a.category) ? a.category : "thoi-su") as CategorySlug,
    corroboratingSources: (a.sourcesJson ?? []).slice(1),
  });

  const img = await resolveArticleImage({
    slug: a.slug,
    category: out.category,
    imagePrompt: out.imagePrompt,
    imageSearchQuery: out.imageSearchQuery,
    preferMode: out.preferVisualMode,
  });

  await db
    .update(articles)
    .set({
      title: out.title,
      sapo: out.sapo,
      body: out.body,
      keyPoints: out.keyPoints,
      vnImpact: out.vnImpact,
      glossary: out.glossary,
      lawStatus: out.lawStatus,
      audienceTargets: out.audienceTargets,
      imagePrompt: out.imagePrompt,
      category: out.category,
      tags: out.tags,
      image: img.src,
      imageCredit: img.credit,
      kind: "feature",
      mode: "ai",
    })
    .where(eq(articles.id, articleId));
  return true;
}

/**
 * Cào trực tiếp một URL bài báo Đức bất kỳ và biên soạn ngay bài phân tích chuyên sâu theo giọng văn tòa soạn.
 */
export async function ingestCustomUrl(url: string, categoryHint: CategorySlug = "thoi-su"): Promise<string | null> {
  await ensureSchema();
  const cleanUrl = url.trim();
  if (!/^https?:\/\//i.test(cleanUrl)) return null;

  const res = await fetch(cleanUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0 Safari/537.36" },
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Không tải được trang (${res.status})`);
  const html = await res.text();
  const titleMatch =
    html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const descMatch =
    html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);

  const rawTitle = stripHtml(titleMatch?.[1] || "Aktuelle Nachrichten aus Deutschland");
  const rawSummary = stripHtml(descMatch?.[1] || "");
  const hostname = new URL(cleanUrl).hostname.replace(/^www\./, "");
  const context = await fetchArticleContext(cleanUrl);
  const c = classify(rawTitle, rawSummary, true);

  const out = await rewriteWithAI({
    sourceName: hostname,
    title: rawTitle,
    summary: rawSummary,
    context,
    categoryHint: categoryHint !== "thoi-su" ? categoryHint : c.category,
  });

  const slug = `${slugify(out.title) || "bai-phan-tich"}-${Date.now().toString(36).slice(-4)}`;
  const img = await resolveArticleImage({
    slug,
    category: out.category,
    imagePrompt: out.imagePrompt,
    imageSearchQuery: out.imageSearchQuery,
    preferMode: out.preferVisualMode,
  });

  await db.insert(articles).values({
    slug,
    title: out.title,
    sapo: out.sapo,
    body: out.body,
    keyPoints: out.keyPoints,
    vnImpact: out.vnImpact,
    glossary: out.glossary,
    lawStatus: out.lawStatus,
    audienceTargets: out.audienceTargets,
    imagePrompt: out.imagePrompt,
    sourcesJson: [{ name: hostname, url: cleanUrl, title: rawTitle }],
    category: out.category,
    tags: out.tags,
    image: img.src,
    imageCredit: img.credit,
    sourceName: hostname,
    sourceUrl: cleanUrl,
    sourceTitle: rawTitle,
    kind: "feature",
    mode: "ai",
    relevance: Math.max(25, c.relevance),
    featured: true,
    publishedAt: new Date(),
  });

  return slug;
}

export async function queueStats() {
  await ensureSchema();
  const rows = await db
    .select({ status: feedItems.status, n: sql<number>`count(*)::int` })
    .from(feedItems)
    .groupBy(feedItems.status);
  return Object.fromEntries(rows.map((r) => [r.status, r.n])) as Record<string, number>;
}
