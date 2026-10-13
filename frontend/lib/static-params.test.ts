import { describe, expect, it } from "vitest";
import type { Product } from "./api/types";
import { ApiError } from "./api/errors";
import { loadProductSlugParams, productSlugParams } from "./static-params";

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
    createdDate: null,
    whatsAppUrl: null,
    ...overrides,
  };
}

describe("productSlugParams", () => {
  it("returns one { slug } per available product", () => {
    const products = [makeProduct({ id: 1, slug: "pastel" }), makeProduct({ id: 2, slug: "galletas" })];

    expect(productSlugParams(products)).toEqual([{ slug: "pastel" }, { slug: "galletas" }]);
  });

  it("skips hidden products, which must keep returning 404", () => {
    const products = [makeProduct({ id: 1, slug: "visible" }), makeProduct({ id: 2, slug: "oculto", isAvailable: false })];

    expect(productSlugParams(products)).toEqual([{ slug: "visible" }]);
  });

  it("skips products without a usable slug", () => {
    const products = [
      makeProduct({ id: 1, slug: null }),
      makeProduct({ id: 2, slug: "" }),
      makeProduct({ id: 3, slug: "   " }),
      makeProduct({ id: 4, slug: "ok" }),
    ];

    expect(productSlugParams(products)).toEqual([{ slug: "ok" }]);
  });

  it("removes duplicated slugs", () => {
    const products = [makeProduct({ id: 1, slug: "pastel" }), makeProduct({ id: 2, slug: "pastel" })];

    expect(productSlugParams(products)).toEqual([{ slug: "pastel" }]);
  });

  it("returns an empty list for an empty catalog", () => {
    expect(productSlugParams([])).toEqual([]);
  });
});

describe("loadProductSlugParams", () => {
  it("builds the params from the loaded products", async () => {
    const params = await loadProductSlugParams(async () => [makeProduct({ slug: "pastel" })]);

    expect(params).toEqual([{ slug: "pastel" }]);
  });

  it("returns an empty list when the API is unreachable, so the build does not fail", async () => {
    const params = await loadProductSlugParams(async () => {
      throw new ApiError(0, null);
    });

    expect(params).toEqual([]);
  });

  it("returns an empty list when the API answers with an error status", async () => {
    const params = await loadProductSlugParams(() => Promise.reject(new ApiError(503, null)));

    expect(params).toEqual([]);
  });
});
