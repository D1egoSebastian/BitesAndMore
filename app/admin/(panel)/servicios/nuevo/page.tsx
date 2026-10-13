import type { Metadata } from "next";
import { PageHeading } from "@/components/admin/PageHeading";
import { ServiceForm } from "@/components/admin/ServiceForm";

export const metadata: Metadata = { title: "Nuevo servicio" };

export default function NewServicePage() {
  return (
    <>
      <PageHeading title="Nuevo servicio" back={{ href: "/admin/servicios", label: "Volver a servicios" }} />
      <ServiceForm service={null} />
    </>
  );
}
