import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite, type PgliteDatabase } from "drizzle-orm/pglite";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim() || "";
const isRemotePostgres = /^postgres(ql)?:\/\//i.test(databaseUrl);

type DbInstance = NodePgDatabase<Record<string, never>> | PgliteDatabase<Record<string, never>>;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __thauDucPglite?: PGlite;
  __thauDucDb?: DbInstance;
};

function createDb(): DbInstance {
  if (globalForDb.__thauDucDb) {
    return globalForDb.__thauDucDb;
  }

  if (isRemotePostgres) {
    const pool =
      globalForDb.__arenaNextJsPostgresqlPool ??
      new Pool({
        connectionString: databaseUrl,
      });
    globalForDb.__arenaNextJsPostgresqlPool = pool;
    const instance = drizzlePg(pool);
    globalForDb.__thauDucDb = instance;
    return instance;
  }

  const dataDir =
    databaseUrl && !databaseUrl.startsWith("pglite://")
      ? path.resolve(process.cwd(), databaseUrl)
      : path.join(process.cwd(), "data", "pgdata");
  fs.mkdirSync(path.dirname(dataDir), { recursive: true });

  const client = globalForDb.__thauDucPglite ?? new PGlite(dataDir);
  globalForDb.__thauDucPglite = client;
  const instance = drizzlePglite(client);
  globalForDb.__thauDucDb = instance;
  return instance;
}

export const db = createDb() as NodePgDatabase<Record<string, never>>;
