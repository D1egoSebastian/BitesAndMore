import type { ServiceType } from "./api/types";

/**
 * Soft pastel tones used as the colour system of the site (see ../docs/design-system.md).
 * Each tone is a token in app/globals.css (`bg-blush`, `bg-butter`, ...).
 */
export const PASTEL_TONES = ["blush", "butter", "sage", "lilac"] as const;

export type PastelTone = (typeof PASTEL_TONES)[number];
export type Tone = PastelTone | "sugar";

/**
 * Static class map. Tailwind only generates classes it finds as complete strings, so the tone
 * name must never be interpolated into a class.
 */
export const TONE_BG: Record<Tone, string> = {
  blush: "bg-blush",
  butter: "bg-butter",
  sage: "bg-sage",
  lilac: "bg-lilac",
  sugar: "bg-sugar",
};

/** A category keeps the same tone everywhere: ids 1..4 take the four tones in order, then repeat. */
export function toneForCategory(categoryId: number | null | undefined): Tone {
  if (typeof categoryId !== "number" || !Number.isInteger(categoryId) || categoryId < 1) return "sugar";
  return PASTEL_TONES[(categoryId - 1) % PASTEL_TONES.length];
}

const SERVICE_TONES: Record<ServiceType, PastelTone> = {
  Reposteria: "blush",
  EventsPlanner: "butter",
  DesayunosPersonalizados: "sage",
};

export function toneForServiceType(type: ServiceType): PastelTone {
  return SERVICE_TONES[type];
}

export type DessertKind = "cake" | "cupcake" | "cookie" | "flan";

/** Which line illustration a photo-less product shows, chosen from its category name. */
export function dessertKindOf(categoryName: string | null | undefined): DessertKind {
  const name = (categoryName ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
  if (name.includes("cupcake")) return "cupcake";
  if (name.includes("galleta")) return "cookie";
  if (name.includes("postre") || name.includes("flan")) return "flan";
  return "cake";
}
