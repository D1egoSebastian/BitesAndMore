import { describe, expect, it } from "vitest";
import type { Product } from "./api/types";
import {
  availableProducts,
  buildCategoryFilters,
  countProductsByCategory,
  featuredProducts,
  findCategoryBySlug,
  latestAvailableProducts,
  productCountLabel,
  relatedProducts,
} from "./catalog";

function makeProduct(overrides: Partial<Product>): Product {
  return {
    id: 1,
    name: "Producto",
    slug: "producto",
    description: null,
    price: null,
    imageUrl: null,
    categoryId: 1,
    category: null,
    isAvailable: true,
    createdDate: "2026-10-01T00:00:00Z",
    whatsAppUrl: null,
    ...overrides,
  };
}

describe("availableProducts", () => {
  it("keeps only products with isAvailable = true", () => {
    const products = [
      makeProduct({ id: 1, isAvailable: true }),
      makeProduct({ id: 2, isAvailable: false }),
      makeProduct({ id: 3, isAvailable: true }),
    ];

    expect(availableProducts(products).map((p) => p.id)).toEqual([1, 3]);
  });

  it("returns an empty list when nothing is available", () => {
    expect(availableProducts([makeProduct({ isAvailable: false })])).toEqual([]);
  });
});

describe("latestAvailableProducts", () => {
  it("returns the newest available products first, limited to the requested amount", () => {
    const products = [
      makeProduct({ id: 1, createdDate: "2026-09-01T00:00:00Z" }),
      makeProduct({ id: 2, createdDate: "2026-10-03T00:00:00Z" }),
      makeProduct({ id: 3, createdDate: "2026-10-05T00:00:00Z", isAvailable: false }),
      makeProduct({ id: 4, createdDate: "2026-10-02T00:00:00Z" }),
      makeProduct({ id: 5, createdDate: null }),
    ];

    expect(latestAvailableProducts(products, 2).map((p) => p.id)).toEqual([2, 4]);
  });

  it("puts products without a creation date last", () => {
    const products = [
      makeProduct({ id: 1, createdDate: null }),
      makeProduct({ id: 2, createdDate: "2026-10-03T00:00:00Z" }),
    ];

    expect(latestAvailableProducts(products, 6).map((p) => p.id)).toEqual([2, 1]);
  });
});

describe("countProductsByCategory", () => {
  it("counts every product (visible or hidden) per category id", () => {
    const products = [
      makeProduct({ id: 1, categoryId: 1 }),
      makeProduct({ id: 2, categoryId: 1, isAvailable: false }),
      makeProduct({ id: 3, categoryId: 2 }),
    ];

    const counts = countProductsByCategory(products);

    expect(counts.get(1)).toBe(2);
    expect(counts.get(2)).toBe(1);
    expect(counts.get(3)).toBeUndefined();
  });
});

describe("findCategoryBySlug", () => {
  const categories = [
    { id: 1, name: "Pasteles", description: null },
    { id: 2, name: "Postres individuales", description: null },
  ];

  it("finds a category by the slug of its name", () => {
    expect(findCategoryBySlug(categories, "postres-individuales")?.id).toBe(2);
  });

  it("returns null for unknown or missing slugs", () => {
    expect(findCategoryBySlug(categories, "galletas")).toBeNull();
    expect(findCategoryBySlug(categories, undefined)).toBeNull();
  });
});

describe("buildCategoryFilters", () => {
  const categories = [
    { id: 1, name: "Pasteles", description: null },
    { id: 2, name: "Galletas", description: null },
    { id: 3, name: "Cupcakes", description: null },
  ];

  it("counts only available products per category and the total", () => {
    const products = [
      makeProduct({ id: 1, categoryId: 1 }),
      makeProduct({ id: 2, categoryId: 1 }),
      makeProduct({ id: 3, categoryId: 1, isAvailable: false }),
      makeProduct({ id: 4, categoryId: 2 }),
    ];

    const result = buildCategoryFilters(products, categories);

    expect(result.total).toBe(3);
    expect(result.filters.map((filter) => [filter.category.id, filter.count])).toEqual([
      [2, 1],
      [1, 2],
    ]);
  });

  it("omits categories without visible products and sorts the rest by name", () => {
    const products = [makeProduct({ id: 1, categoryId: 3 }), makeProduct({ id: 2, categoryId: 2 })];

    const result = buildCategoryFilters(products, categories);

    expect(result.filters.map((filter) => filter.category.name)).toEqual(["Cupcakes", "Galletas"]);
  });

  it("exposes the slug used in ?categoria=", () => {
    const products = [makeProduct({ categoryId: 1 })];

    expect(buildCategoryFilters(products, categories).filters[0].slug).toBe("pasteles");
  });

  it("returns no filters and a zero total for an empty catalog", () => {
    expect(buildCategoryFilters([], categories)).toEqual({ total: 0, filters: [] });
  });
});

describe("productCountLabel", () => {
  it("uses the singular only for one product", () => {
    expect(productCountLabel(0)).toBe("0 productos");
    expect(productCountLabel(1)).toBe("1 producto");
    expect(productCountLabel(8)).toBe("8 productos");
  });
});

describe("featuredProducts", () => {
  function many(count: number) {
    return Array.from({ length: count }, (_, index) =>
      makeProduct({ id: index + 1, createdDate: `2026-09-${String(index + 1).padStart(2, "0")}T00:00:00Z` }),
    );
  }

  it("shows up to 8 of the newest available products", () => {
    expect(featuredProducts(many(11)).map((p) => p.id)).toEqual([11, 10, 9, 8, 7, 6, 5, 4]);
  });

  it("rounds down to full rows of 4 so the grid has no gaps", () => {
    expect(featuredProducts(many(7))).toHaveLength(4);
    expect(featuredProducts(many(4))).toHaveLength(4);
  });

  it("shows whatever exists when there are fewer than 4", () => {
    expect(featuredProducts(many(3))).toHaveLength(3);
    expect(featuredProducts([])).toEqual([]);
  });

  it("never includes hidden products", () => {
    const products = [...many(4), makeProduct({ id: 99, isAvailable: false, createdDate: "2026-12-01T00:00:00Z" })];

    expect(featuredProducts(products).map((p) => p.id)).not.toContain(99);
  });
});

describe("relatedProducts", () => {
  it("returns other available products of the same category, newest first, up to the limit", () => {
    const current = makeProduct({ id: 1, categoryId: 1 });
    const products = [
      current,
      makeProduct({ id: 2, categoryId: 1, createdDate: "2026-09-01T00:00:00Z" }),
      makeProduct({ id: 3, categoryId: 1, createdDate: "2026-10-01T00:00:00Z" }),
      makeProduct({ id: 4, categoryId: 2 }),
      makeProduct({ id: 5, categoryId: 1, isAvailable: false }),
      makeProduct({ id: 6, categoryId: 1, createdDate: "2026-08-01T00:00:00Z" }),
    ];

    expect(relatedProducts(products, current, 2).map((p) => p.id)).toEqual([3, 2]);
  });

  it("returns an empty list when the product is alone in its category", () => {
    const current = makeProduct({ id: 1, categoryId: 1 });

    expect(relatedProducts([current, makeProduct({ id: 2, categoryId: 2 })], current, 4)).toEqual([]);
  });
});
