export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.DISABLE_AUTO_INGEST === "1") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const g = globalThis as typeof globalThis & { __nhipducTimer?: boolean };
  if (g.__nhipducTimer) return;
  g.__nhipducTimer = true;

  const minutes = Number(process.env.INGEST_INTERVAL_MINUTES || 30);
  const tick = async () => {
    try {
      const { maybeIngest } = await import("./lib/ingest");
      await maybeIngest();
    } catch (e) {
      console.error("[scheduler] ingest failed", e);
    }
  };
  // First crawl shortly after boot, then on a fixed interval.
  setTimeout(tick, 20_000).unref?.();
  setInterval(tick, minutes * 60 * 1000).unref?.();
}
