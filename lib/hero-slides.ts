import type { Product } from "./api/types";
import { latestAvailableProducts } from "./catalog";

export interface HeroSlide {
  id: string;
  src: string;
  /** Spanish, descriptive. */
  alt: string;
  /** Only real products get a caption, linking to their page. */
  caption?: { label: string; href: string; /** "Category · price", when the product has them. */ meta?: string };
}

/** The carousel never shows more than this many slides. */
export const HERO_SLIDE_LIMIT = 5;

/** Below this many product photos, curated photos fill the carousel up to the limit. */
export const HERO_SLIDE_MIN_PRODUCTS = 4;

const GENERIC_ALT = "Postre de Bites and More";

function unsplash(photoId: string): string {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1200&q=80`;
}

/**
 * Curated dessert photos for the hero carousel while the catalog has few photos.
 * PLACEHOLDERS: these Unsplash photos are not the business's own work. Replace them with
 * Bites and More's photos as soon as they are available (see ADR-019).
 */
export const FALLBACK_HERO_SLIDES: readonly HeroSlide[] = [
  {
    id: "fallback-cake",
    src: unsplash("1578985545062-69928b1d9587"),
    alt: "Pastel de chocolate con cobertura brillante y rosetas de crema",
  },
  {
    id: "fallback-cupcakes",
    src: unsplash("1563729784474-d77dbb933a9e"),
    alt: "Cupcakes con crema rosa y fresas sobre una bandeja",
  },
  {
    id: "fallback-cookies",
    src: unsplash("1499636136210-6f4ee915583e"),
    alt: "Galletas con chispas de chocolate recién horneadas",
  },
  {
    id: "fallback-macarons",
    src: unsplash("1558326567-98ae2405596b"),
    alt: "Macarons de colores pastel apilados",
  },
  {
    id: "fallback-breakfast",
    src: unsplash("1484723091739-30a097e8f929"),
    alt: "Desayuno de pan francés con plátano, arándanos y azúcar glas",
  },
];

function captionMeta(product: Product): string | undefined {
  const parts = [product.category?.name?.trim(), product.price?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

function productSlide(product: Product): HeroSlide {
  const name = product.name?.trim() || null;
  const slug = product.slug?.trim() || null;
  const meta = captionMeta(product);
  return {
    id: `product-${product.id}`,
    src: (product.imageUrl ?? "").trim(),
    alt: name ?? GENERIC_ALT,
    ...(name && slug ? { caption: { label: name, href: `/producto/${slug}`, ...(meta ? { meta } : {}) } } : {}),
  };
}

/**
 * Slides for the home hero: the newest available products with a photo first (max 5);
 * when there are fewer than 4, curated photos fill the carousel up to 5.
 */
export function heroSlides(products: Product[]): HeroSlide[] {
  const withPhoto = products.filter((product) => product.imageUrl?.trim());
  const fromProducts = latestAvailableProducts(withPhoto, HERO_SLIDE_LIMIT).map(productSlide);
  if (fromProducts.length >= HERO_SLIDE_MIN_PRODUCTS) return fromProducts;
  return [...fromProducts, ...FALLBACK_HERO_SLIDES.slice(0, HERO_SLIDE_LIMIT - fromProducts.length)];
}

/** Index after moving `delta` slides, wrapping around both ends. */
export function wrapSlideIndex(current: number, delta: number, count: number): number {
  if (count <= 0) return 0;
  return (((current + delta) % count) + count) % count;
}

const SWIPE_DISTANCE_PX = 60;
const SWIPE_VELOCITY_PX_S = 500;

/**
 * Decides what a horizontal drag means: 1 = next slide (swipe left), -1 = previous, 0 = stay.
 * A drag counts when it travels far enough or is a fast flick.
 */
export function swipeDirection(offsetX: number, velocityX: number): -1 | 0 | 1 {
  if (offsetX <= -SWIPE_DISTANCE_PX || velocityX <= -SWIPE_VELOCITY_PX_S) return 1;
  if (offsetX >= SWIPE_DISTANCE_PX || velocityX >= SWIPE_VELOCITY_PX_S) return -1;
  return 0;
}
