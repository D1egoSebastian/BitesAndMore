import type { Metadata } from "next";
import Link from "next/link";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { PageHeading } from "@/components/admin/PageHeading";
import { adminList, adminNote, buttonQuiet } from "@/components/ui/styles";
import { adminReadApi } from "@/lib/api/server";
import { countProductsByCategory, productCountLabel } from "@/lib/catalog";
import { deleteCategory } from "./actions";

export const metadata: Metadata = { title: "Categorías" };

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([adminReadApi.getCategories(), adminReadApi.getProducts()]);
  const counts = countProductsByCategory(products);
  const sorted = [...categories].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "es"));

  return (
    <>
      <PageHeading
        title="Categorías"
        description="Agrupan los productos y aparecen como filtros en la página de productos."
      />

      {sorted.length === 0 ? (
        <p className={adminNote}>Todavía no hay categorías. Crea la primera con el formulario de abajo.</p>
      ) : (
        <ul className={adminList}>
          {sorted.map((category) => {
            const name = category.name ?? "Sin nombre";
            const count = counts.get(category.id) ?? 0;
            return (
              <li key={category.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold">{name}</p>
                  <p className="text-sm text-muted">{productCountLabel(count)}</p>
                  {category.description && <p className="mt-1 max-w-[60ch] text-sm text-muted">{category.description}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/categorias/${category.id}`} className={buttonQuiet} aria-label={`Editar ${name}`}>
                    Editar
                  </Link>
                  <ConfirmButton
                    triggerLabel="Eliminar"
                    triggerAriaLabel={`Eliminar ${name}`}
                    title={`¿Eliminar la categoría «${name}»?`}
                    description={
                      count > 0 ? (
                        <p>
                          <strong className="text-raspberry">
                            También se eliminarán {count === 1 ? "su producto" : `sus ${count} productos`}
                          </strong>
                          , incluidos los ocultos. Esta acción no se puede deshacer. Si quieres conservarlos, muévelos
                          antes a otra categoría desde la página de cada producto.
                        </p>
                      ) : (
                        <p>Esta categoría no tiene productos. Esta acción no se puede deshacer.</p>
                      )
                    }
                    confirmLabel={count > 0 ? `Eliminar categoría y ${productCountLabel(count)}` : "Eliminar categoría"}
                    onConfirm={deleteCategory.bind(null, category.id, name, count)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <section aria-labelledby="nueva-categoria" className="mt-12">
        <h2 id="nueva-categoria" className="mb-4 text-xl sm:text-2xl">
          Nueva categoría
        </h2>
        <CategoryForm category={null} />
      </section>
    </>
  );
}
