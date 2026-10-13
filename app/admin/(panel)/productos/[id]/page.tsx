import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/admin/PageHeading";
import { ProductForm } from "@/components/admin/ProductForm";
import { adminReadApi } from "@/lib/api/server";

export const metadata: Metadata = { title: "Editar producto" };

export default async function EditProductPage({ params }: PageProps<"/admin/productos/[id]">) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) notFound();

  const [product, categories] = await Promise.all([
    adminReadApi.getProductById(productId),
    adminReadApi.getCategories(),
  ]);
  if (!product) notFound();

  return (
    <>
      <PageHeading title={`Editar «${product.name ?? "producto"}»`} back={{ href: "/admin/productos", label: "Volver a productos" }} />
      <ProductForm product={product} categories={categories} />
    </>
  );
}
