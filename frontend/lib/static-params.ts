import type { Product } from "./api/types";
import { availableProducts } from "./catalog";

export type ProductSlugParam = { slug: string };

/** Params for the product pages prerendered at build time: visible products with a usable slug, once each. */
export function productSlugParams(products: Product[]): ProductSlugParam[] {
  const slugs = new Set<string>();
  for (const product of availableProducts(products)) {
    const slug = product.slug?.trim();
    if (slug) slugs.add(slug);
  }
  return [...slugs].map((slug) => ({ slug }));
}

/**
 * Never fails: if the API is down or still waking up during `next build`, no product page is
 * prerendered and each one is generated on its first visit instead (dynamicParams).
 */
export async function loadProductSlugParams(loadProducts: () => Promise<Product[]>): Promise<ProductSlugParam[]> {
  try {
    return productSlugParams(await loadProducts());
  } catch {
    return [];
  }
}
