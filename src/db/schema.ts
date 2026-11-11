import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

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

/** Raw items discovered from RSS feeds of German news outlets (only metadata + teaser). */
export const feedItems = pgTable(
  "feed_items",
  {
    id: serial("id").primaryKey(),
    sourceId: text("source_id").notNull(),
    guid: text("guid").notNull().unique(),
    url: text("url").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull().default(""),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
    status: text("status").notNull().default("new"),
    relevance: integer("relevance").notNull().default(0),
    category: text("category").notNull().default("thoi-su"),
    error: text("error"),
  },
  (t) => [index("feed_items_status_idx").on(t.status)],
);

/** Vietnamese articles written by the editorial pipeline. */
export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    sapo: text("sapo").notNull(),
    body: text("body").notNull(),
    keyPoints: jsonb("key_points").$type<string[]>().notNull().default([]),
    vnImpact: text("vn_impact"),
    glossary: jsonb("glossary").$type<GlossaryItem[]>().notNull().default([]),
    lawStatus: text("law_status"),
    audienceTargets: jsonb("audience_targets").$type<string[]>().notNull().default([]),
    imagePrompt: text("image_prompt"),
    sourcesJson: jsonb("sources_json").$type<SourceRef[]>().notNull().default([]),
    category: text("category").notNull(),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    image: text("image").notNull(),
    imageCredit: text("image_credit").notNull(),
    sourceName: text("source_name"),
    sourceUrl: text("source_url"),
    sourceTitle: text("source_title"),
    kind: text("kind").notNull().default("feature"),
    mode: text("mode").notNull().default("editorial"),
    relevance: integer("relevance").notNull().default(0),
    featured: boolean("featured").notNull().default(false),
    views: integer("views").notNull().default(0),
    feedItemId: integer("feed_item_id"),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("articles_category_idx").on(t.category),
    index("articles_published_idx").on(t.publishedAt),
  ],
);

export const ingestRuns = pgTable("ingest_runs", {
  id: serial("id").primaryKey(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  mode: text("mode").notNull().default("auto"),
  fetched: integer("fetched").notNull().default(0),
  created: integer("created").notNull().default(0),
  log: text("log"),
});

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type FeedItem = typeof feedItems.$inferSelect;
