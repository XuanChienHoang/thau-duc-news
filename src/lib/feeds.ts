import { XMLParser } from "fast-xml-parser";
import { stripHtml } from "./format";
import type { Source } from "./sources";

export type ParsedItem = {
  guid: string;
  url: string;
  title: string;
  summary: string;
  publishedAt: Date;
  originOutlet?: string;
};

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  removeNSPrefix: true,
  processEntities: true,
});

function text(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (Array.isArray(v)) return text(v[0]);
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    if ("#text" in o) return text(o["#text"]);
    if ("@_href" in o) return text(o["@_href"]);
  }
  return "";
}

function arr<T>(v: T | T[] | undefined): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export async function fetchFeed(source: Source): Promise<ParsedItem[]> {
  const res = await fetch(source.url, {
    headers: { "User-Agent": UA, Accept: "application/rss+xml, application/xml, text/xml" },
    signal: AbortSignal.timeout(14000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${source.id}: HTTP ${res.status}`);
  const xml = await res.text();
  const doc = parser.parse(xml) as Record<string, unknown>;

  type RawItem = Record<string, unknown>;
  let raw: RawItem[] = [];
  const rss = doc.rss as { channel?: { item?: RawItem | RawItem[] } } | undefined;
  const rdf = doc.RDF as { item?: RawItem | RawItem[] } | undefined;
  const feed = doc.feed as { entry?: RawItem | RawItem[] } | undefined;
  if (rss?.channel) raw = arr(rss.channel.item);
  else if (rdf) raw = arr(rdf.item);
  else if (feed) raw = arr(feed.entry);

  const items: ParsedItem[] = [];
  for (const it of raw.slice(0, 35)) {
    let title = stripHtml(text(it.title));
    let originOutlet: string | undefined;

    // Google News RSS titles end with " - Outlet Name"
    if (source.tier === "radar" && title.includes(" - ")) {
      const idx = title.lastIndexOf(" - ");
      if (idx > 20) {
        originOutlet = title.slice(idx + 3).trim();
        title = title.slice(0, idx).trim();
      }
    }
    if (!originOutlet && it.source) {
      originOutlet = stripHtml(text(it.source));
    }

    let url = text(it.link);
    if (!url && it["@_about"]) url = text(it["@_about"]);
    if (!title || !url) continue;
    url = url.trim();

    const rawDesc = text(it.description) || text(it.summary) || text(it.encoded);
    const summary = stripHtml(rawDesc).slice(0, 900);
    const dateStr = text(it.pubDate) || text(it.date) || text(it.updated) || text(it.published);
    const parsed = dateStr ? new Date(dateStr) : new Date();
    const guid = `${source.id}:${text(it.guid) || url}`.slice(0, 500);
    items.push({
      guid,
      url,
      title,
      summary,
      publishedAt: Number.isNaN(parsed.getTime()) ? new Date() : parsed,
      originOutlet,
    });
  }
  return items;
}

/**
 * Extract rich, structured factual context from a German news article page (JSON-LD + article body + headings).
 * Used ONLY in memory as transient background facts for the AI editor — never stored or republished verbatim.
 */
export async function fetchArticleContext(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(14000),
      cache: "no-store",
    });
    if (!res.ok) return "";
    const html = await res.text();
    const chunks: string[] = [];

    // 1) Extract JSON-LD NewsArticle / Article metadata & articleBody if present
    const ldMatches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    for (const m of ldMatches) {
      try {
        const parsed = JSON.parse(m[1].trim());
        const nodes = Array.isArray(parsed) ? parsed : parsed["@graph"] ? parsed["@graph"] : [parsed];
        for (const n of nodes) {
          if (n && typeof n === "object") {
            if (typeof n.description === "string" && n.description.length > 40) {
              chunks.push(stripHtml(n.description));
            }
            if (typeof n.articleBody === "string" && n.articleBody.length > 80) {
              chunks.push(stripHtml(n.articleBody));
            }
          }
        }
      } catch {
        // ignore malformed JSON-LD
      }
    }

    // 2) Focus on <article> or <main> if available to avoid nav/footer noise
    const articleMatch = html.match(/<article[\s\S]*?<\/article>/i) || html.match(/<main[\s\S]*?<\/main>/i);
    const scopeHtml = articleMatch ? articleMatch[0] : html;

    // 3) Extract headings and substantial paragraphs
    const blockMatches = [...scopeHtml.matchAll(/<(h2|h3|p|li)[^>]*>([\s\S]*?)<\/\1>/gi)];
    for (const m of blockMatches) {
      const tag = m[1].toLowerCase();
      const cleaned = stripHtml(m[2]);
      if (!cleaned) continue;
      if (/cookie|javascript|newsletter|abonnieren|datenschutz|impressum|anzeige|werbung|kommentare|mehr zum thema/i.test(cleaned)) {
        continue;
      }
      if ((tag === "h2" || tag === "h3") && cleaned.length > 15 && cleaned.length < 160) {
        chunks.push(`\n[Tiêu đề mục gốc]: ${cleaned}`);
      } else if (tag === "p" && cleaned.length > 55) {
        chunks.push(cleaned);
      } else if (tag === "li" && cleaned.length > 45 && cleaned.length < 300) {
        chunks.push(`• ${cleaned}`);
      }
    }

    // Deduplicate paragraphs while preserving order
    const unique = [...new Set(chunks)];
    return unique.join("\n").slice(0, 11000);
  } catch {
    return "";
  }
}
