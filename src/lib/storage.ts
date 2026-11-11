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

const DATA_DIR = path.join(process.cwd(), "content", "articles");
const ARTICLES_FILE = path.join(DATA_DIR, "index.json");
const QUEUE_FILE = path.join(DATA_DIR, "queue.json");
const RUNS_FILE = path.join(DATA_DIR, "runs.json");
const SUBS_FILE = path.join(DATA_DIR, "subscribers.json");

function ensureFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(ARTICLES_FILE)) {
    const now = Date.now();
    let idCounter = 1;
    const initial: Article[] = SEEDS.map((s: any) => ({
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
    fs.writeFileSync(ARTICLES_FILE, JSON.stringify(initial, null, 2), "utf-8");
  }

  if (!fs.existsSync(QUEUE_FILE)) {
    fs.writeFileSync(QUEUE_FILE, JSON.stringify([], null, 2), "utf-8");
  }

  if (!fs.existsSync(RUNS_FILE)) {
    fs.writeFileSync(RUNS_FILE, JSON.stringify([], null, 2), "utf-8");
  }

  if (!fs.existsSync(SUBS_FILE)) {
    fs.writeFileSync(SUBS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

export function getArticles(): Article[] {
  ensureFiles();
  try {
    const raw = fs.readFileSync(ARTICLES_FILE, "utf-8");
    return JSON.parse(raw) as Article[];
  } catch {
    return [];
  }
}

export function saveArticles(items: Article[]): void {
  ensureFiles();
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(items, null, 2), "utf-8");
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

export function saveFeedQueue(items: FeedItem[]): void {
  ensureFiles();
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(items, null, 2), "utf-8");
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

export function saveIngestRuns(runs: IngestRun[]): void {
  ensureFiles();
  fs.writeFileSync(RUNS_FILE, JSON.stringify(runs, null, 2), "utf-8");
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

export function addSubscriber(email: string): boolean {
  ensureFiles();
  const list = getSubscribers();
  if (list.some((s) => s.email.toLowerCase() === email.toLowerCase())) {
    return false;
  }
  list.push({
    id: list.length + 1,
    email: email.toLowerCase(),
    createdAt: new Date().toISOString(),
  });
  fs.writeFileSync(SUBS_FILE, JSON.stringify(list, null, 2), "utf-8");
  return true;
}
