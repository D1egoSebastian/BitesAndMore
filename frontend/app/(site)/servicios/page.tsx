import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { ServiceCarousel, ServiceCarouselProvider } from "@/components/services/ServiceShowcase";
import { WhatsAppIcon } from "@/components/ui/icons";
import { buttonPrimary, pageContainer, pageTitle, textLink } from "@/components/ui/styles";
import { getBusinessInfo, publicApi } from "@/lib/api/server";
import { buildWhatsAppContactUrl } from "@/lib/contact";
import { displayPrice, displayText } from "@/lib/format";
import { buildServiceWhatsAppUrl, serviceShowcaseGroups } from "@/lib/service-gallery";

// Static with ISR (spec 010): no searchParams or cookies here, so the build keeps this page as ○.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Servicios",
  description: "Organización de eventos, desayunos personalizados y repostería por encargo.",
};

const chipClass =
  "inline-flex min-h-11 shrink-0 items-center rounded-full border-[1.5px] border-border bg-white px-4 py-2 text-sm font-medium transition duration-200 ease-spring hover:border-accent hover:bg-blush active:scale-[0.97] sm:px-[1.125rem] sm:text-[0.9375rem] [touch-action:manipulation]";

export default async function ServicesPage() {
  const [services, info] = await Promise.all([publicApi.getServices(), getBusinessInfo()]);
  const groups = serviceShowcaseGroups(services);
  const sections = groups.flatMap((group) => group.sections);
  const eventWhatsApp = buildWhatsAppContactUrl(info?.whatsAppNumber, "Hola! Quiero consultar por un evento");

  return (
    <div>
      <div className={`${pageContainer} flex flex-col gap-3.5 pb-5 pt-5 sm:gap-5 sm:pb-12 sm:pt-16`}>
        <h1 className={`${pageTitle} hero-reveal`}>Servicios</h1>
        <p
          className="hero-reveal max-w-[34em] text-[1.0625rem] leading-relaxed text-muted sm:text-[1.1875rem]"
          style={{ "--delay": "100ms" } as CSSProperties}
        >
          <span className="hidden sm:inline">Además de nuestros postres, te ayudamos a preparar tus celebraciones. </span>
          Mira algunos de nuestros trabajos y consulta disponibilidad y precio por WhatsApp.
        </p>

        {sections.length === 0 && (
          <p className="mt-4 max-w-[60ch]">
            Muy pronto publicaremos nuestros servicios. Mientras tanto,{" "}
            <Link href="/contacto" className={textLink}>
              escríbenos
            </Link>{" "}
            y cuéntanos qué necesitas.
          </p>
        )}
      </div>

      {sections.length > 1 && (
        <nav
          aria-label="Servicios"
          className="hero-reveal mx-auto w-full max-w-[75rem] pb-5 sm:px-6 sm:pb-12 lg:px-12"
          style={{ "--delay": "200ms" } as CSSProperties}
        >
          {/* Phones: one horizontal row that scrolls inside itself. Tablet up: chips wrap. */}
          <ul className="flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:flex-wrap sm:gap-2.5 sm:overflow-visible sm:px-0">
            {sections.map((section) => (
              <li key={section.anchor} className="shrink-0">
                <a href={`#${section.anchor}`} className={chipClass}>
                  {section.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {sections.length > 0 && (
        <ServiceCarouselProvider>
          <div className="flex flex-col gap-3 md:gap-4">
            {groups.map((group) => (
              // The type anchor (#events-planner, ...) is what the home page tiles link to.
              <div key={group.type} id={group.anchor} className="flex scroll-mt-20 flex-col gap-3 sm:scroll-mt-24 md:gap-4">
                {group.sections.map((section) => {
                  const whatsApp = buildServiceWhatsAppUrl(info?.whatsAppNumber, section.name);
                  return (
                    <ServiceCarousel
                      key={section.anchor}
                      anchor={section.anchor}
                      name={section.name}
                      type={section.service.serviceType}
                      description={displayText(section.service.description)}
                      price={displayPrice(section.service.price)}
                      cta={
                        whatsApp
                          ? { href: whatsApp, label: "Consultar por WhatsApp", external: true }
                          : { href: "/contacto", label: "Consultar", external: false }
                      }
                      slides={section.slides}
                      preload={section === sections[0]}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </ServiceCarouselProvider>
      )}

      <section aria-labelledby="evento" className={`${pageContainer} py-10 md:py-24`}>
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
          <div className="flex max-w-[36em] flex-col gap-2.5">
            <h2 id="evento" className="text-[1.875rem] leading-[1.05] md:text-[2.75rem]">
              ¿Tienes un evento en mente?
            </h2>
            <p className="text-muted md:text-lg">
              Cuéntanos la fecha, el número de invitados y la idea. Te respondemos con una propuesta y el precio.
            </p>
          </div>
          {eventWhatsApp ? (
            <a href={eventWhatsApp} target="_blank" rel="noopener noreferrer" className={`${buttonPrimary} shrink-0`}>
              <WhatsAppIcon />
              Escríbenos por WhatsApp
            </a>
          ) : (
            <Link href="/contacto" className={`${buttonPrimary} shrink-0`}>
              Ver formas de contacto
            </Link>
          )}
        </Reveal>
      </section>
    </div>
  );
}
