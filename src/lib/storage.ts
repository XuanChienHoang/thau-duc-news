import fs from "node:fs";
import path from "node:path";
import { type CategorySlug } from "./categories";
import { type AudienceTarget, type LawStatus } from "./classify";
import { SEEDS } from "./seed";

export type GlossaryItem = {
  term: string;
  vi: string;
  explain: string;
};

export type SourceRef = {
  name: string;
  url: string;
  title: string;
};

export type Article = {
  id: number;
  slug: string;
  title: string;
  sapo: string;
  body: string;
  keyPoints: string[];
  vnImpact: string | null;
  glossary: GlossaryItem[];
  lawStatus: LawStatus | null;
  audienceTargets: AudienceTarget[];
  imagePrompt: string | null;
  sourcesJson: SourceRef[];
  category: CategorySlug;
  tags: string[];
  image: string;
  imageCredit: string;
  sourceName: string | null;
  sourceUrl: string | null;
  sourceTitle: string | null;
  kind: string;
  mode: string;
  relevance: number;
  featured: boolean;
  views: number;
  feedItemId: number | null;
  publishedAt: string; // ISO string
  createdAt: string;
};

export type FeedItem = {
  id: number;
  sourceId: string;
  guid: string;
  url: string;
  title: string;
  summary: string;
  publishedAt: string;
  fetchedAt: string;
  status: string;
  relevance: number;
  category: CategorySlug;
  error?: string | null;
};

export type IngestRun = {
  id: number;
  startedAt: string;
  finishedAt: string | null;
  mode: string;
  fetched: number;
  created: number;
  log: string | null;
};

function resolveDataDir(): string {
  const candidates = [
    path.join(process.cwd(), "content", "articles"),
    path.join(__dirname, "..", "..", "content", "articles"),
    path.resolve(process.cwd(), "08_MEDIA", "german-news-aggregator-website", "content", "articles"),
    path.resolve(__dirname, "..", "content", "articles"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

const DATA_DIR = resolveDataDir();
const ARTICLES_FILE = path.join(DATA_DIR, "index.json");
const QUEUE_FILE = path.join(DATA_DIR, "queue.json");
const RUNS_FILE = path.join(DATA_DIR, "runs.json");
const SUBS_FILE = path.join(DATA_DIR, "subscribers.json");

function isReadOnlyError(err: unknown): boolean {
  const code = (err as { code?: string })?.code;
  return code === "EROFS" || code === "EACCES" || code === "EPERM";
}

function safeWriteJson(filePath: string, data: unknown): boolean {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    if (isReadOnlyError(err)) {
      return false;
    }
    throw err;
  }
}

function buildInitialSeeds(): Article[] {
  const now = Date.now();
  let idCounter = 1;
  return SEEDS.map((s) => ({
    id: idCounter++,
    slug: s.slug,
    title: s.title,
    sapo: s.sapo,
    body: s.body,
    keyPoints: s.keyPoints || [],
    vnImpact: s.vnImpact || null,
    glossary: s.glossary || [],
    lawStatus: s.lawStatus || null,
    audienceTargets: s.audienceTargets || [],
    imagePrompt: null,
    sourcesJson: [],
    category: s.category,
    tags: s.tags || [],
    image: s.image,
    imageCredit: s.imageCredit,
    sourceName: null,
    sourceUrl: null,
    sourceTitle: null,
    kind: s.kind || "feature",
    mode: "editorial",
    relevance: s.relevance || 30,
    featured: s.featured || false,
    views: Math.floor(250 + (idCounter * 41) % 600),
    feedItemId: null,
    publishedAt: new Date(now - (s.hoursAgo || 1) * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  }));
}

function ensureFiles() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(ARTICLES_FILE)) {
      safeWriteJson(ARTICLES_FILE, buildInitialSeeds());
    }
    if (!fs.existsSync(QUEUE_FILE)) {
      safeWriteJson(QUEUE_FILE, []);
    }
    if (!fs.existsSync(RUNS_FILE)) {
      safeWriteJson(RUNS_FILE, []);
    }
    if (!fs.existsSync(SUBS_FILE)) {
      safeWriteJson(SUBS_FILE, []);
    }
  } catch (err) {
    if (!isReadOnlyError(err)) {
      console.error("[storage] ensureFiles error:", err);
    }
  }
}

const gCache = globalThis as typeof globalThis & {
  __thauducArticlesCache?: { mtimeMs: number; items: Article[] };
};

export function getArticles(): Article[] {
  ensureFiles();
  try {
    if (!fs.existsSync(ARTICLES_FILE)) {
      return buildInitialSeeds();
    }
    const stat = fs.statSync(ARTICLES_FILE);
    if (gCache.__thauducArticlesCache && gCache.__thauducArticlesCache.mtimeMs === stat.mtimeMs) {
      return gCache.__thauducArticlesCache.items;
    }
    const raw = fs.readFileSync(ARTICLES_FILE, "utf-8");
    const items = JSON.parse(raw) as Article[];
    gCache.__thauducArticlesCache = { mtimeMs: stat.mtimeMs, items };
    return items;
  } catch {
    return buildInitialSeeds();
  }
}

export function saveArticles(items: Article[]): boolean {
  ensureFiles();
  const ok = safeWriteJson(ARTICLES_FILE, items);
  if (ok) {
    gCache.__thauducArticlesCache = undefined;
  }
  return ok;
}

export function getFeedQueue(): FeedItem[] {
  ensureFiles();
  try {
    const raw = fs.readFileSync(QUEUE_FILE, "utf-8");
    return JSON.parse(raw) as FeedItem[];
  } catch {
    return [];
  }
}

export function saveFeedQueue(items: FeedItem[]): boolean {
  ensureFiles();
  return safeWriteJson(QUEUE_FILE, items);
}

export function getIngestRuns(): IngestRun[] {
  ensureFiles();
  try {
    const raw = fs.readFileSync(RUNS_FILE, "utf-8");
    return JSON.parse(raw) as IngestRun[];
  } catch {
    return [];
  }
}

export function saveIngestRuns(runs: IngestRun[]): boolean {
  ensureFiles();
  return safeWriteJson(RUNS_FILE, runs);
}

export function getSubscribers(): { id: number; email: string; createdAt: string }[] {
  ensureFiles();
  try {
    const raw = fs.readFileSync(SUBS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addSubscriber(email: string): "added" | "exists" | "readonly" {
  ensureFiles();
  const list = getSubscribers();
  if (list.some((s) => s.email.toLowerCase() === email.toLowerCase())) {
    return "exists";
  }
  list.push({
    id: list.length + 1,
    email: email.toLowerCase(),
    createdAt: new Date().toISOString(),
  });
  return safeWriteJson(SUBS_FILE, list) ? "added" : "readonly";
}
