import type { Metadata } from "next";
import { NotFoundContent } from "@/components/site/NotFoundContent";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SkipLink } from "@/components/site/SkipLink";
import { getBusinessInfo } from "@/lib/api/server";
import { businessNameOf } from "@/lib/business";
import { buildWhatsAppContactUrl } from "@/lib/contact";

export const metadata: Metadata = { title: "Página no encontrada" };

/** Unmatched URLs render outside the (site) group, so this page brings its own header and footer. */
export default async function RootNotFound() {
  const info = await getBusinessInfo().catch(() => null);
  const businessName = businessNameOf(info);
  const whatsAppUrl = buildWhatsAppContactUrl(info?.whatsAppNumber, "Hola! Quiero hacer un pedido");

  return (
    <>
      <SkipLink />
      <SiteHeader businessName={businessName} whatsAppUrl={whatsAppUrl} />
      <main id="contenido" className="flex-1">
        <NotFoundContent />
      </main>
      <SiteFooter info={info} businessName={businessName} />
    </>
  );
}
