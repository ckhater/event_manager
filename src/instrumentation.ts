// Runs once when the server starts (dev + production runtime).
// Fail fast on bad configuration — but never during `next build`,
// where env is legitimately absent (pages prerender without it).
export async function register(): Promise<void> {
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  await import("./lib/env");
}
