import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { PageHeading } from "@/components/admin/PageHeading";
import { MediaImage } from "@/components/media/MediaImage";
import { adminList, adminNote, buttonPrimary, buttonQuiet } from "@/components/ui/styles";
import { adminReadApi } from "@/lib/api/server";
import { displayPrice } from "@/lib/format";
import { groupServicesByType } from "@/lib/services";
import { deleteService } from "./actions";

export const metadata: Metadata = { title: "Servicios" };

export default async function AdminServicesPage() {
  const services = await adminReadApi.getServices();
  const groups = groupServicesByType(services);

  return (
    <>
      <PageHeading
        title="Servicios"
        description="Se muestran en la página de servicios, agrupados por tipo."
        actions={
          <Link href="/admin/servicios/nuevo" className={buttonPrimary}>
            Nuevo servicio
          </Link>
        }
      />

      {groups.length === 0 && (
        <p className={adminNote}>Todavía no hay servicios. Crea el primero para que aparezca en el sitio.</p>
      )}

      <div className="flex flex-col gap-10">
        {groups.map((group) => (
          <section key={group.type} aria-labelledby={`grupo-${group.anchor}`}>
            <h2 id={`grupo-${group.anchor}`} className="mb-2 text-xl sm:text-2xl">
              {group.label}
            </h2>
            <ul className={adminList}>
              {group.services.map((service) => {
                const name = service.name ?? "Sin nombre";
                const price = displayPrice(service.price);
                return (
                  <li key={service.id} className="grid grid-cols-[4rem_minmax(0,1fr)] gap-x-4 gap-y-3 py-4 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:items-center">
                    <MediaImage src={service.imageUrl} alt="" name={service.name} aspect="aspect-square" rounded="rounded-lg" sizes="64px" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{name}</p>
                      {price && <p className="text-sm text-muted">{price}</p>}
                    </div>
                    <div className="col-span-2 flex flex-wrap gap-2 sm:col-span-1 sm:justify-end">
                      <Link href={`/admin/servicios/${service.id}`} className={buttonQuiet} aria-label={`Editar ${name}`}>
                        Editar
                      </Link>
                      <ConfirmButton
                        triggerLabel="Eliminar"
                        triggerAriaLabel={`Eliminar ${name}`}
                        title={`¿Eliminar «${name}»?`}
                        description={<p>El servicio desaparecerá del sitio. Esta acción no se puede deshacer.</p>}
                        confirmLabel="Eliminar servicio"
                        onConfirm={deleteService.bind(null, service.id, name)}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
