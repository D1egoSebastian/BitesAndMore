import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { PageHeading } from "@/components/admin/PageHeading";
import { adminReadApi } from "@/lib/api/server";

export const metadata: Metadata = { title: "Editar categoría" };

export default async function EditCategoryPage({ params }: PageProps<"/admin/categorias/[id]">) {
  const { id } = await params;
  const categoryId = Number(id);
  if (!Number.isInteger(categoryId) || categoryId <= 0) notFound();

  const categories = await adminReadApi.getCategories();
  const category = categories.find((item) => item.id === categoryId);
  if (!category) notFound();

  return (
    <>
      <PageHeading
        title={`Editar «${category.name ?? "categoría"}»`}
        back={{ href: "/admin/categorias", label: "Volver a categorías" }}
      />
      <CategoryForm category={category} />
    </>
  );
}
