import type { Category, Product } from "./api/types";
import { slugify } from "./slug";

/** The public API also returns hidden products; the site must only show available ones. */
export function availableProducts(products: Product[]): Product[] {
  return products.filter((product) => product.isAvailable);
}

function createdTime(product: Product): number {
  const time = product.createdDate ? Date.parse(product.createdDate) : Number.NaN;
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
}

export function latestAvailableProducts(products: Product[], limit: number): Product[] {
  return availableProducts(products)
    .sort((a, b) => createdTime(b) - createdTime(a))
    .slice(0, limit);
}

/** Counts all products (visible and hidden) per category, for the cascade-delete warning. */
export function countProductsByCategory(products: Product[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const product of products) {
    counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1);
  }
  return counts;
}

export function categorySlug(category: Category): string {
  return slugify(category.name) || String(category.id);
}

export function findCategoryBySlug(categories: Category[], slug: string | null | undefined): Category | null {
  if (!slug) return null;
  return categories.find((category) => categorySlug(category) === slug) ?? null;
}

export interface CategoryFilter {
  category: Category;
  slug: string;
  /** Visible (available) products in this category. */
  count: number;
}

/**
 * Filter chips for the catalog: only categories with at least one visible product,
 * sorted by name, each with its result count (Baymard: show counts on filters).
 */
export function buildCategoryFilters(
  products: Product[],
  categories: Category[],
): { total: number; filters: CategoryFilter[] } {
  const visible = availableProducts(products);
  const counts = countProductsByCategory(visible);
  const filters = categories
    .filter((category) => (counts.get(category.id) ?? 0) > 0)
    .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "es"))
    .map((category) => ({ category, slug: categorySlug(category), count: counts.get(category.id) ?? 0 }));
  return { total: visible.length, filters };
}

export function productCountLabel(count: number): string {
  return count === 1 ? "1 producto" : `${count} productos`;
}

const FEATURED_MAX = 8;
const FEATURED_ROW = 4;

/** Newest available products for the home grid: 8, else 4, so desktop rows are always full. */
export function featuredProducts(products: Product[]): Product[] {
  const latest = latestAvailableProducts(products, FEATURED_MAX);
  if (latest.length < FEATURED_ROW) return latest;
  return latest.slice(0, latest.length - (latest.length % FEATURED_ROW));
}

/** Other visible products of the same category, newest first. */
export function relatedProducts(products: Product[], current: Product, limit: number): Product[] {
  return latestAvailableProducts(
    products.filter((product) => product.categoryId === current.categoryId && product.id !== current.id),
    limit,
  );
}
