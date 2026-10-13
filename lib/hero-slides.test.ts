import { describe, expect, it } from "vitest";
import type { Product } from "./api/types";
import {
  FALLBACK_HERO_SLIDES,
  HERO_SLIDE_LIMIT,
  heroSlides,
  swipeDirection,
  wrapSlideIndex,
} from "./hero-slides";

function makeProduct(overrides: Partial<Product>): Product {
  return {
    id: 1,
    name: "Pastel de chocolate",
    slug: "pastel-de-chocolate",
    description: null,
    price: null,
    imageUrl: "https://res.cloudinary.com/demo/image/upload/cake.jpg",
    categoryId: 1,
    category: null,
    isAvailable: true,
    createdDate: "2026-10-01T00:00:00Z",
    whatsAppUrl: null,
    ...overrides,
  };
}

function manyProducts(count: number): Product[] {
  return Array.from({ length: count }, (_, index) =>
    makeProduct({
      id: index + 1,
      name: `Postre ${index + 1}`,
      slug: `postre-${index + 1}`,
      imageUrl: `https://res.cloudinary.com/demo/image/upload/${index + 1}.jpg`,
      createdDate: `2026-09-${String(index + 1).padStart(2, "0")}T00:00:00Z`,
    }),
  );
}

describe("FALLBACK_HERO_SLIDES", () => {
  it("has five curated dessert photos with Spanish alt text and no captions", () => {
    expect(FALLBACK_HERO_SLIDES).toHaveLength(5);
    for (const slide of FALLBACK_HERO_SLIDES) {
      expect(slide.src).toMatch(/^https:\/\/images\.unsplash\.com\/photo-[\w-]+\?auto=format&fit=crop&w=1200&q=80$/);
      expect(slide.alt.trim().length).toBeGreaterThan(10);
      expect(slide.caption).toBeUndefined();
    }
  });

  it("uses unique ids and photos", () => {
    expect(new Set(FALLBACK_HERO_SLIDES.map((slide) => slide.id)).size).toBe(5);
    expect(new Set(FALLBACK_HERO_SLIDES.map((slide) => slide.src)).size).toBe(5);
  });
});

describe("heroSlides", () => {
  it("shows only the curated photos when there are no products", () => {
    expect(heroSlides([])).toEqual(FALLBACK_HERO_SLIDES);
  });

  it("puts real products first, newest first, with a caption linking to the product", () => {
    const slides = heroSlides(manyProducts(5));

    expect(slides).toHaveLength(HERO_SLIDE_LIMIT);
    expect(slides[0]).toEqual({
      id: "product-5",
      src: "https://res.cloudinary.com/demo/image/upload/5.jpg",
      alt: "Postre 5",
      caption: { label: "Postre 5", href: "/producto/postre-5" },
    });
    expect(slides.map((slide) => slide.id)).toEqual(["product-5", "product-4", "product-3", "product-2", "product-1"]);
  });

  it("caps the carousel at five slides", () => {
    expect(heroSlides(manyProducts(9))).toHaveLength(5);
  });

  it("does not add curated photos once there are at least four product photos", () => {
    const slides = heroSlides(manyProducts(4));

    expect(slides).toHaveLength(4);
    expect(slides.every((slide) => slide.id.startsWith("product-"))).toBe(true);
  });

  it("fills up to five slides with curated photos when there are fewer than four product photos", () => {
    const slides = heroSlides(manyProducts(2));

    expect(slides).toHaveLength(5);
    expect(slides.slice(0, 2).map((slide) => slide.id)).toEqual(["product-2", "product-1"]);
    expect(slides.slice(2)).toEqual(FALLBACK_HERO_SLIDES.slice(0, 3));
  });

  it("skips hidden products and products without a photo", () => {
    const products = [
      makeProduct({ id: 1, isAvailable: false }),
      makeProduct({ id: 2, imageUrl: null }),
      makeProduct({ id: 3, imageUrl: "   " }),
      makeProduct({ id: 4 }),
    ];

    const slides = heroSlides(products);

    expect(slides[0].id).toBe("product-4");
    expect(slides.filter((slide) => slide.id.startsWith("product-"))).toHaveLength(1);
  });

  it("falls back to a generic alt and drops the caption link when name or slug are missing", () => {
    const [noName] = heroSlides([makeProduct({ id: 1, name: "  " })]);
    const [noSlug] = heroSlides([makeProduct({ id: 2, slug: null })]);

    expect(noName.alt).toBe("Postre de Bites and More");
    expect(noName.caption).toBeUndefined();
    expect(noSlug.alt).toBe("Pastel de chocolate");
    expect(noSlug.caption).toBeUndefined();
  });
});

describe("wrapSlideIndex", () => {
  it("moves forward and backward, wrapping at both ends", () => {
    expect(wrapSlideIndex(0, 1, 5)).toBe(1);
    expect(wrapSlideIndex(4, 1, 5)).toBe(0);
    expect(wrapSlideIndex(0, -1, 5)).toBe(4);
    expect(wrapSlideIndex(2, -1, 5)).toBe(1);
  });

  it("returns 0 for an empty carousel", () => {
    expect(wrapSlideIndex(0, 1, 0)).toBe(0);
  });
});

describe("swipeDirection", () => {
  it("goes to the next slide on a long enough swipe to the left", () => {
    expect(swipeDirection(-80, 0)).toBe(1);
  });

  it("goes to the previous slide on a long enough swipe to the right", () => {
    expect(swipeDirection(80, 0)).toBe(-1);
  });

  it("accepts a short but fast flick", () => {
    expect(swipeDirection(-20, -800)).toBe(1);
    expect(swipeDirection(20, 800)).toBe(-1);
  });

  it("ignores small, slow drags", () => {
    expect(swipeDirection(-30, -100)).toBe(0);
    expect(swipeDirection(0, 0)).toBe(0);
  });
});

describe("heroSlides caption details", () => {
  it("adds the category and the price to the caption when the product has them", () => {
    const [slide] = heroSlides([
      makeProduct({
        id: 7,
        name: "Pastel de chocolate",
        slug: "pastel-de-chocolate",
        price: "RD$1,800",
        category: { id: 1, name: "Pasteles", description: null },
      }),
    ]);

    expect(slide.caption).toEqual({
      label: "Pastel de chocolate",
      href: "/producto/pastel-de-chocolate",
      meta: "Pasteles · RD$1,800",
    });
  });

  it("uses only what exists and leaves the meta out when there is nothing to show", () => {
    const [onlyPrice] = heroSlides([makeProduct({ id: 1, price: " RD$250 " })]);
    const [onlyCategory] = heroSlides([
      makeProduct({ id: 2, category: { id: 3, name: " Galletas ", description: null } }),
    ]);
    const [neither] = heroSlides([makeProduct({ id: 3 })]);

    expect(onlyPrice.caption?.meta).toBe("RD$250");
    expect(onlyCategory.caption?.meta).toBe("Galletas");
    expect(neither.caption).not.toHaveProperty("meta");
  });
});
