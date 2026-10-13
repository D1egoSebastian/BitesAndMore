import type { Metadata } from "next";
import { PageHeading } from "@/components/admin/PageHeading";
import { ProductForm } from "@/components/admin/ProductForm";
import { adminReadApi } from "@/lib/api/server";

export const metadata: Metadata = { title: "Nuevo producto" };

export default async function NewProductPage() {
  const categories = await adminReadApi.getCategories();

  return (
    <>
      <PageHeading title="Nuevo producto" back={{ href: "/admin/productos", label: "Volver a productos" }} />
      <ProductForm product={null} categories={categories} />
    </>
  );
}
