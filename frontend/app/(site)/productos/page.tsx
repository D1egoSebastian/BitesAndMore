import type { Metadata } from "next";
import { ProductCatalog } from "@/components/catalog/ProductCatalog";
import { pageContainer, pageTitle } from "@/components/ui/styles";
import { loadOrFallback } from "@/lib/api/build-fallback";
import { publicApi } from "@/lib/api/server";
import { availableProducts, buildCategoryFilters } from "@/lib/catalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Productos",
  description: "Pasteles, cupcakes, galletas y postres hechos en casa. Elige el tuyo y pídelo por WhatsApp.",
};

/**
 * Static (ISR): it must not read searchParams, which would make every visit wait on the API.
 * The ?categoria= filter is applied on the client by ProductCatalog (ADR-024).
 */
export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    loadOrFallback(() => publicApi.getProducts(), []),
    loadOrFallback(() => publicApi.getCategories(), []),
  ]);

  const available = availableProducts(products);
  // Only offer filters that lead somewhere: categories with at least one visible product.
  const { filters } = buildCategoryFilters(available, categories);

  return (
    <div className={`${pageContainer} pb-24 pt-10 sm:pt-16`}>
      <h1 className={pageTitle}>Productos</h1>
      <p className="mt-3 max-w-[34em] text-muted sm:mt-4 sm:text-lg">
        Elige tu postre y pídelo por WhatsApp. Filtra por categoría para encontrarlo más rápido.
      </p>
      <ProductCatalog products={available} filters={filters} />
    </div>
  );
}
