import { and, desc, eq, gte, ilike, ne, notInArray, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { articles, type Article } from "@/db/schema";
import { ensureSchema } from "./ensure-schema";

export type ArticleCard = Pick<
  Article,
  | "id"
  | "slug"
  | "title"
  | "sapo"
  | "category"
  | "image"
  | "imageCredit"
  | "kind"
  | "mode"
  | "lawStatus"
  | "audienceTargets"
  | "sourceName"
  | "publishedAt"
  | "views"
  | "relevance"
>;

const cardCols = {
  id: articles.id,
  slug: articles.slug,
  title: articles.title,
  sapo: articles.sapo,
  category: articles.category,
  image: articles.image,
  imageCredit: articles.imageCredit,
  kind: articles.kind,
  mode: articles.mode,
  lawStatus: articles.lawStatus,
  audienceTargets: articles.audienceTargets,
  sourceName: articles.sourceName,
  publishedAt: articles.publishedAt,
  views: articles.views,
  relevance: articles.relevance,
};

export async function getLatest(
  opts: { limit?: number; category?: string; exclude?: number[]; kind?: "brief" | "long"; offset?: number } = {},
) {
  await ensureSchema();
  const conds: SQL[] = [];
  if (opts.category) conds.push(eq(articles.category, opts.category));
  if (opts.exclude?.length) conds.push(notInArray(articles.id, opts.exclude));
  if (opts.kind === "brief") conds.push(eq(articles.kind, "brief"));
  if (opts.kind === "long") conds.push(ne(articles.kind, "brief"));
  return db
    .select(cardCols)
    .from(articles)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(articles.publishedAt))
    .limit(opts.limit ?? 20)
    .offset(opts.offset ?? 0);
}

export async function countByCategory(category: string): Promise<number> {
  await ensureSchema();
  const [r] = await db.select({ n: sql<number>`count(*)::int` }).from(articles).where(eq(articles.category, category));
  return r?.n ?? 0;
}

/** Lead story: the most relevant long-form piece from the last days, weighted by recency. */
export async function getLead(): Promise<ArticleCard | null> {
  await ensureSchema();
  const [lead] = await db
    .select(cardCols)
    .from(articles)
    .where(ne(articles.kind, "brief"))
    .orderBy(
      desc(sql`${articles.relevance} + case when ${articles.featured} then 15 else 0 end - extract(epoch from (now() - ${articles.publishedAt})) / 3600 / 3`),
    )
    .limit(1);
  if (lead) return lead;
  const [any] = await getLatest({ limit: 1 });
  return any ?? null;
}

export async function getMostRead(limit = 5) {
  await ensureSchema();
  return db
    .select(cardCols)
    .from(articles)
    .where(gte(articles.publishedAt, new Date(Date.now() - 21 * 24 * 3600 * 1000)))
    .orderBy(desc(articles.views))
    .limit(limit);
}

export async function getGuides(limit = 4) {
  await ensureSchema();
  return db.select(cardCols).from(articles).where(eq(articles.kind, "guide")).orderBy(desc(articles.relevance)).limit(limit);
}

export async function getArticle(slug: string): Promise<Article | null> {
  await ensureSchema();
  const [a] = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  return a ?? null;
}

export async function getRelated(a: Article, limit = 4) {
  await ensureSchema();
  return db
    .select(cardCols)
    .from(articles)
    .where(and(eq(articles.category, a.category), ne(articles.id, a.id)))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}

export async function searchArticles(q: string) {
  await ensureSchema();
  const term = `%${q.replace(/[%_]/g, "")}%`;
  return db
    .select(cardCols)
    .from(articles)
    .where(or(ilike(articles.title, term), ilike(articles.sapo, term), ilike(articles.body, term)))
    .orderBy(desc(articles.publishedAt))
    .limit(40);
}

export async function incrementViews(slug: string) {
  await ensureSchema();
  await db.update(articles).set({ views: sql`${articles.views} + 1` }).where(eq(articles.slug, slug));
}
