import type { Metadata } from "next";
import Link from "next/link";
import { AvailabilityToggle } from "@/components/admin/AvailabilityToggle";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { PageHeading } from "@/components/admin/PageHeading";
import { MediaImage } from "@/components/media/MediaImage";
import { adminList, adminNote, buttonPrimary, buttonQuiet } from "@/components/ui/styles";
import { adminReadApi } from "@/lib/api/server";
import { displayPrice } from "@/lib/format";
import { deleteProduct, setProductAvailability } from "./actions";

export const metadata: Metadata = { title: "Productos" };

export default async function AdminProductsPage() {
  const products = await adminReadApi.getProducts();
  const sorted = [...products].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "es"));
  const hidden = products.filter((product) => !product.isAvailable).length;

  return (
    <>
      <PageHeading
        title="Productos"
        description={
          products.length > 0
            ? `${products.length} en total${hidden > 0 ? `, ${hidden} oculto${hidden === 1 ? "" : "s"} del sitio` : ""}. Los productos ocultos no se ven en el sitio, pero no se borran.`
            : undefined
        }
        actions={
          <Link href="/admin/productos/nuevo" className={buttonPrimary}>
            Nuevo producto
          </Link>
        }
      />

      {sorted.length === 0 ? (
        <p className={adminNote}>Todavía no hay productos. Crea el primero para que aparezca en el sitio.</p>
      ) : (
        <ul className={adminList}>
          {sorted.map((product) => {
            const name = product.name ?? "Sin nombre";
            const price = displayPrice(product.price);
            return (
              <li key={product.id} className="grid grid-cols-[4rem_minmax(0,1fr)] gap-x-4 gap-y-3 py-4 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:items-center">
                <MediaImage src={product.imageUrl} alt="" name={product.name} aspect="aspect-square" rounded="rounded-lg" sizes="64px" />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{name}</p>
                  <p className="text-sm text-muted">
                    {product.category?.name ?? "Sin categoría"}
                    {price && <span className="block sm:inline sm:before:content-[',_']">{price}</span>}
                  </p>
                </div>
                <div className="col-span-2 flex flex-wrap items-center gap-2 sm:col-span-1 sm:justify-end">
                  <AvailabilityToggle
                    key={`${product.id}-${product.isAvailable}`}
                    productName={name}
                    isAvailable={product.isAvailable}
                    onToggle={setProductAvailability.bind(null, product.id)}
                  />
                  <Link href={`/admin/productos/${product.id}`} className={buttonQuiet} aria-label={`Editar ${name}`}>
                    Editar
                  </Link>
                  <ConfirmButton
                    triggerLabel="Eliminar"
                    triggerAriaLabel={`Eliminar ${name}`}
                    title={`¿Eliminar «${name}»?`}
                    description={
                      <p>
                        El producto desaparecerá del sitio y del panel. Si solo quieres dejar de mostrarlo, usa el
                        interruptor de visibilidad.
                      </p>
                    }
                    confirmLabel="Eliminar producto"
                    onConfirm={deleteProduct.bind(null, product.id, name)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
