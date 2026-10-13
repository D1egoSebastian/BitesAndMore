import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SkipLink } from "@/components/site/SkipLink";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { getBusinessInfo } from "@/lib/api/server";
import { businessNameOf } from "@/lib/business";
import { buildWhatsAppContactUrl } from "@/lib/contact";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const info = await getBusinessInfo();
  const businessName = businessNameOf(info);
  const whatsAppUrl = buildWhatsAppContactUrl(info?.whatsAppNumber, "Hola! Quiero hacer un pedido");

  return (
    <>
      <SkipLink />
      <SiteHeader businessName={businessName} whatsAppUrl={whatsAppUrl} />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <SiteFooter info={info} businessName={businessName} />
      <WhatsAppFab whatsAppUrl={whatsAppUrl} />
    </>
  );
}
