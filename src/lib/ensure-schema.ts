import { sql } from "drizzle-orm";
import { db } from "@/db";

const g = globalThis as typeof globalThis & { __nhipducSchema?: Promise<void> };

/** Idempotent schema bootstrap & migration so both fresh and existing databases work seamlessly. */
export function ensureSchema(): Promise<void> {
  if (!g.__nhipducSchema) {
    g.__nhipducSchema = (async () => {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS feed_items (
          id serial PRIMARY KEY,
          source_id text NOT NULL,
          guid text NOT NULL,
          url text NOT NULL,
          title text NOT NULL,
          summary text DEFAULT '' NOT NULL,
          published_at timestamp with time zone DEFAULT now() NOT NULL,
          fetched_at timestamp with time zone DEFAULT now() NOT NULL,
          status text DEFAULT 'new' NOT NULL,
          relevance integer DEFAULT 0 NOT NULL,
          category text DEFAULT 'thoi-su' NOT NULL,
          error text,
          CONSTRAINT feed_items_guid_unique UNIQUE (guid)
        );
      `);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS feed_items_status_idx ON feed_items (status);`);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS articles (
          id serial PRIMARY KEY,
          slug text NOT NULL,
          title text NOT NULL,
          sapo text NOT NULL,
          body text NOT NULL,
          key_points jsonb DEFAULT '[]'::jsonb NOT NULL,
          vn_impact text,
          glossary jsonb DEFAULT '[]'::jsonb NOT NULL,
          law_status text,
          audience_targets jsonb DEFAULT '[]'::jsonb NOT NULL,
          image_prompt text,
          sources_json jsonb DEFAULT '[]'::jsonb NOT NULL,
          category text NOT NULL,
          tags jsonb DEFAULT '[]'::jsonb NOT NULL,
          image text NOT NULL,
          image_credit text NOT NULL,
          source_name text,
          source_url text,
          source_title text,
          kind text DEFAULT 'feature' NOT NULL,
          mode text DEFAULT 'editorial' NOT NULL,
          relevance integer DEFAULT 0 NOT NULL,
          featured boolean DEFAULT false NOT NULL,
          views integer DEFAULT 0 NOT NULL,
          feed_item_id integer,
          published_at timestamp with time zone DEFAULT now() NOT NULL,
          created_at timestamp with time zone DEFAULT now() NOT NULL,
          CONSTRAINT articles_slug_unique UNIQUE (slug)
        );
      `);
      await db.execute(sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS glossary jsonb DEFAULT '[]'::jsonb NOT NULL;`);
      await db.execute(sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS law_status text;`);
      await db.execute(sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS audience_targets jsonb DEFAULT '[]'::jsonb NOT NULL;`);
      await db.execute(sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_prompt text;`);
      await db.execute(sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS sources_json jsonb DEFAULT '[]'::jsonb NOT NULL;`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS articles_category_idx ON articles (category);`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS articles_published_idx ON articles (published_at);`);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ingest_runs (
          id serial PRIMARY KEY,
          started_at timestamp with time zone DEFAULT now() NOT NULL,
          finished_at timestamp with time zone,
          mode text DEFAULT 'auto' NOT NULL,
          fetched integer DEFAULT 0 NOT NULL,
          created integer DEFAULT 0 NOT NULL,
          log text
        );
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS subscribers (
          id serial PRIMARY KEY,
          email text NOT NULL,
          created_at timestamp with time zone DEFAULT now() NOT NULL,
          CONSTRAINT subscribers_email_unique UNIQUE (email)
        );
      `);
      const { seedIfEmpty } = await import("./seed");
      await seedIfEmpty();
    })().catch((e) => {
      g.__nhipducSchema = undefined;
      throw e;
    });
  }
  return g.__nhipducSchema;
}
