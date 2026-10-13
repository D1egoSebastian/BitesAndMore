import type { Metadata } from "next";
import { BusinessForm } from "@/components/admin/BusinessForm";
import { PageHeading } from "@/components/admin/PageHeading";
import { adminReadApi } from "@/lib/api/server";

export const metadata: Metadata = { title: "Datos del negocio" };

export default async function BusinessInfoPage() {
  const info = await adminReadApi.getBusinessInfo();

  return (
    <>
      <PageHeading
        title="Datos del negocio"
        description={
          info
            ? "Se muestran en la portada, en la página de contacto y en el pie de cada página. Los campos vacíos no aparecen en el sitio."
            : "Todavía no hay datos guardados. Completa lo que tengas; los campos vacíos no aparecen en el sitio."
        }
      />
      <BusinessForm info={info} />
    </>
  );
}
