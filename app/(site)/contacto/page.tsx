import type { Metadata } from "next";
import type { ReactNode } from "react";
import { OrderSteps } from "@/components/home/OrderSteps";
import { FacebookIcon, InstagramIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/ui/icons";
import { pageContainer, pageTitle, textLink } from "@/components/ui/styles";
import { getBusinessInfo } from "@/lib/api/server";
import { buildSocialUrl, buildWhatsAppContactUrl, socialLabel } from "@/lib/contact";
import { displayText } from "@/lib/format";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos por WhatsApp o síguenos en redes para hacer tu pedido.",
};

type ContactItem = { key: string; label: string; icon: ReactNode; content: ReactNode };

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={textLink}>
      {children}
    </a>
  );
}

export default async function ContactPage() {
  const info = await getBusinessInfo();

  const whatsApp = buildWhatsAppContactUrl(info?.whatsAppNumber, "Hola! Quiero hacer un pedido");
  const whatsAppNumber = displayText(info?.whatsAppNumber);
  const phone = displayText(info?.phoneNumber);
  const address = displayText(info?.address);
  const instagramUrl = buildSocialUrl("instagram", info?.instagram);
  const facebookUrl = buildSocialUrl("facebook", info?.facebook);

  const items: ContactItem[] = [];
  if (whatsApp && whatsAppNumber) {
    items.push({
      key: "whatsapp",
      label: "WhatsApp",
      icon: <WhatsAppIcon />,
      content: <ExternalLink href={whatsApp}>Escribir al +{whatsAppNumber.replace(/\D/g, "")}</ExternalLink>,
    });
  }
  if (phone) {
    items.push({
      key: "phone",
      label: "Teléfono",
      icon: <PhoneIcon />,
      content: (
        <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className={textLink}>
          {phone}
        </a>
      ),
    });
  }
  if (address) {
    items.push({ key: "address", label: "Dirección", icon: <PinIcon />, content: <span className="whitespace-pre-line">{address}</span> });
  }
  if (instagramUrl && info?.instagram) {
    items.push({
      key: "instagram",
      label: "Instagram",
      icon: <InstagramIcon />,
      content: <ExternalLink href={instagramUrl}>{socialLabel(info.instagram)}</ExternalLink>,
    });
  }
  if (facebookUrl && info?.facebook) {
    items.push({
      key: "facebook",
      label: "Facebook",
      icon: <FacebookIcon />,
      content: <ExternalLink href={facebookUrl}>{socialLabel(info.facebook)}</ExternalLink>,
    });
  }

  return (
    <div className={`${pageContainer} pb-24 pt-10 sm:pt-16`}>
      <div className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
        <div>
          <h1 className={pageTitle}>Contacto</h1>
          {items.length === 0 ? (
            <p className="mt-4 max-w-[60ch] text-lg text-muted">
              Muy pronto publicaremos nuestros datos de contacto. Vuelve a visitarnos en unos días.
            </p>
          ) : (
            <>
              <p className="mt-3 max-w-[52ch] text-muted">
                {whatsApp
                  ? "La forma más rápida de pedir es por WhatsApp. Cuéntanos qué te gustaría y para cuándo lo necesitas."
                  : "Escríbenos o síguenos en redes. Te responderemos lo antes posible."}
              </p>
              <dl className="mt-8 divide-y divide-border border-y border-border">
                {items.map((item) => (
                  <div key={item.key} className="flex gap-4 py-5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blush">
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <dt className="text-sm text-muted">{item.label}</dt>
                      <dd className="mt-0.5 break-words">{item.content}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>

        <aside aria-labelledby="como-funciona" className="self-start rounded-[2rem] bg-butter p-6 sm:p-8 md:mt-2">
          <h2 id="como-funciona" className="text-2xl">
            Cómo funcionan los pedidos
          </h2>
          <p className="mt-2 text-muted">No hay carrito ni pagos en línea: todo se coordina por mensaje.</p>
          <div className="mt-6">
            <OrderSteps hasWhatsApp={whatsApp !== null} variant="compact" headingLevel="p" />
          </div>
        </aside>
      </div>
    </div>
  );
}
