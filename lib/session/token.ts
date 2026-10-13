/** Name of the httpOnly cookie that holds the admin JWT. */
export const SESSION_COOKIE = "bam_session";

/** Matches the API default token lifetime (Jwt:ExpiresMinutes = 480). */
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
}

/**
 * Optimistic expiry check (no signature verification: the API stays the authority).
 * Malformed tokens count as expired so they are never trusted.
 */
export function isTokenExpired(token: string, now: Date = new Date()): boolean {
  const payload = token.split(".")[1];
  if (!payload) return true;

  try {
    const claims: unknown = JSON.parse(decodeBase64Url(payload));
    if (!claims || typeof claims !== "object" || !("exp" in claims) || typeof claims.exp !== "number") {
      return true;
    }
    return claims.exp * 1000 <= now.getTime();
  } catch {
    return true;
  }
}
