import { runIngest } from "@/lib/ingest";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Trigger a crawl. Protect with CRON_SECRET (?secret=... or Authorization: Bearer ...) when set. */
async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const url = new URL(req.url);
    const given = url.searchParams.get("secret") || req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (given !== secret) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const result = await runIngest();
  return Response.json({ ok: true, ...result });
}

export const GET = handle;
export const POST = handle;
