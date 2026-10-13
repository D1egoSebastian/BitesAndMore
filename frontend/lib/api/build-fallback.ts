import "server-only";
import { connection } from "next/server";

/** True only while `next build` prerenders pages; Next.js sets this phase itself. */
export function isStaticBuild(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

/**
 * Loads public data for a page. When the API fails while the page is being prerendered (for
 * example while its host restarts during a deploy), the build must not fail: the page opts into
 * request-time rendering and uses `fallback`. At runtime errors still propagate, so Next keeps
 * serving the last good cached page.
 */
export async function loadOrFallback<T>(load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load();
  } catch (error) {
    if (!isStaticBuild()) throw error;
    await connection();
    return fallback;
  }
}
