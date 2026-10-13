import type { Metadata } from "next";
import { ProductCatalog } from "@/components/catalog/ProductCatalog";
import { pageContainer, pageTitle } from "@/components/ui/styles";
import { publicApi } from "@/lib/api/server";
import { availableProducts, buildCategoryFilters } from "@/lib/catalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Productos",
  description: "Pasteles, cupcakes, galletas y postres hechos en casa. Elige el tuyo y pídelo por WhatsApp.",
};

export default async function ProductsPage({ searchParams }: PageProps<"/productos">) {
  const [{ categoria }, products, categories] = await Promise.all([
    searchParams,
    publicApi.getProducts(),
    publicApi.getCategories(),
  ]);

  const available = availableProducts(products);
  // Only offer filters that lead somewhere: categories with at least one visible product.
  const { filters } = buildCategoryFilters(available, categories);
  const requested = typeof categoria === "string" ? filters.find((filter) => filter.slug === categoria) : undefined;

  return (
    <div className={`${pageContainer} pb-24 pt-10 sm:pt-16`}>
      <h1 className={pageTitle}>Productos</h1>
      <p className="mt-3 max-w-[34em] text-muted sm:mt-4 sm:text-lg">
        Elige tu postre y pídelo por WhatsApp. Filtra por categoría para encontrarlo más rápido.
      </p>
      <ProductCatalog products={available} filters={filters} initialCategorySlug={requested?.slug ?? null} />
    </div>
  );
}
