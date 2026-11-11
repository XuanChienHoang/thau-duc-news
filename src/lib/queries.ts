import { type Article, getArticles, saveArticles } from "./storage";

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

export async function getLatest(
  opts: { limit?: number; category?: string; exclude?: number[]; kind?: "brief" | "long"; offset?: number } = {},
): Promise<ArticleCard[]> {
  let list = getArticles();

  if (opts.category) {
    list = list.filter((a) => a.category === opts.category);
  }
  if (opts.exclude && opts.exclude.length > 0) {
    const set = new Set(opts.exclude);
    list = list.filter((a) => !set.has(a.id));
  }
  if (opts.kind === "brief") {
    list = list.filter((a) => a.kind === "brief");
  } else if (opts.kind === "long") {
    list = list.filter((a) => a.kind !== "brief");
  }

  list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const offset = opts.offset ?? 0;
  const limit = opts.limit ?? 20;
  return list.slice(offset, offset + limit);
}

export async function countByCategory(category: string): Promise<number> {
  const list = getArticles();
  return list.filter((a) => a.category === category).length;
}

/** Lead story: the most relevant long-form piece from recent days, weighted by recency. */
export async function getLead(): Promise<ArticleCard | null> {
  const list = getArticles().filter((a) => a.kind !== "brief");
  if (!list.length) {
    const all = getArticles();
    return all.length ? all[0] : null;
  }

  const now = Date.now();
  const scored = list.map((a) => {
    const hoursAgo = Math.max(0, (now - new Date(a.publishedAt).getTime()) / (3600 * 1000));
    const score = a.relevance + (a.featured ? 15 : 0) - hoursAgo / 3;
    return { a, score };
  });

  scored.sort((x, y) => y.score - x.score);
  return scored[0]?.a ?? list[0] ?? null;
}

export async function getMostRead(limit = 5): Promise<ArticleCard[]> {
  const cutoff = Date.now() - 30 * 24 * 3600 * 1000;
  const list = getArticles().filter((a) => new Date(a.publishedAt).getTime() >= cutoff);
  list.sort((a, b) => (b.views || 0) - (a.views || 0));
  return list.slice(0, limit);
}

export async function getGuides(limit = 4): Promise<ArticleCard[]> {
  const list = getArticles().filter((a) => a.kind === "guide");
  list.sort((a, b) => b.relevance - a.relevance);
  return list.slice(0, limit);
}

export async function getArticle(slug: string): Promise<Article | null> {
  const list = getArticles();
  return list.find((a) => a.slug === slug) ?? null;
}

export async function getRelated(a: Article, limit = 4): Promise<ArticleCard[]> {
  const list = getArticles().filter((item) => item.category === a.category && item.id !== a.id);
  list.sort((x, y) => new Date(y.publishedAt).getTime() - new Date(x.publishedAt).getTime());
  return list.slice(0, limit);
}

export async function searchArticles(q: string): Promise<ArticleCard[]> {
  const term = q.trim().toLowerCase();
  if (!term) return [];
  const list = getArticles().filter(
    (a) =>
      a.title.toLowerCase().includes(term) ||
      a.sapo.toLowerCase().includes(term) ||
      a.body.toLowerCase().includes(term),
  );
  list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return list.slice(0, 40);
}

export async function incrementViews(slug: string): Promise<void> {
  const list = getArticles();
  const target = list.find((a) => a.slug === slug);
  if (target) {
    target.views = (target.views || 0) + 1;
    saveArticles(list);
  }
}
