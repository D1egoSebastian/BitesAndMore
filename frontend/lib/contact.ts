/**
 * General wa.me link for the contact page. The API only builds per-product links,
 * so the frontend mirrors its rule: digits only, null when there is nothing to call.
 */
export function buildWhatsAppContactUrl(number: string | null | undefined, message?: string): string | null {
  const digits = (number ?? "").replace(/\D/g, "");
  if (!digits) return null;
  return message ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : `https://wa.me/${digits}`;
}

/** Minimum digits for a number that includes a country code (e.g. 1 + 809 + 7 digits = 11). */
const MIN_WHATSAPP_DIGITS = 8;

/** Admin input → digits only. Empty means "no WhatsApp"; too short is rejected. */
export function normalizeWhatsAppNumber(
  value: string | null | undefined,
): { ok: true; value: string | null } | { ok: false } {
  if (!value?.trim()) return { ok: true, value: null };
  const digits = value.replace(/\D/g, "");
  if (digits.length < MIN_WHATSAPP_DIGITS) return { ok: false };
  return { ok: true, value: digits };
}

const SOCIAL_ORIGINS = {
  instagram: "https://www.instagram.com",
  facebook: "https://www.facebook.com",
} as const;

export type SocialNetwork = keyof typeof SOCIAL_ORIGINS;

/** Accepts a handle ("@bites", "bites") or a full http(s) URL. */
export function buildSocialUrl(network: SocialNetwork, value: string | null | undefined): string | null {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return null;

  const handle = trimmed.replace(/^@+/, "").replace(/^\/+|\/+$/g, "");
  if (!handle) return null;
  return `${SOCIAL_ORIGINS[network]}/${encodeURI(handle)}`;
}

/** "@bites" for handles, the bare host/path for URLs. Used as visible link text. */
export function socialLabel(value: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}
