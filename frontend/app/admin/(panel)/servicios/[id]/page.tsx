import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/admin/PageHeading";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { adminReadApi } from "@/lib/api/server";

export const metadata: Metadata = { title: "Editar servicio" };

export default async function EditServicePage({ params }: PageProps<"/admin/servicios/[id]">) {
  const { id } = await params;
  const serviceId = Number(id);
  if (!Number.isInteger(serviceId) || serviceId <= 0) notFound();

  const service = await adminReadApi.getServiceById(serviceId);
  if (!service) notFound();

  return (
    <>
      <PageHeading
        title={`Editar «${service.name ?? "servicio"}»`}
        back={{ href: "/admin/servicios", label: "Volver a servicios" }}
      />
      <ServiceForm service={service} />
    </>
  );
}
