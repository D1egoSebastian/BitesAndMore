import type { Metadata } from "next";
import Link from "next/link";
import { OccasionArt } from "@/components/media/DessertArt";
import { MediaImage } from "@/components/media/MediaImage";
import { Reveal } from "@/components/motion/Reveal";
import { WhatsAppIcon } from "@/components/ui/icons";
import { buttonSecondary, pageContainer, pageTitle, sectionTitle, textLink } from "@/components/ui/styles";
import { getBusinessInfo, publicApi } from "@/lib/api/server";
import { cn } from "@/lib/cn";
import { buildWhatsAppContactUrl } from "@/lib/contact";
import { displayPrice, displayText } from "@/lib/format";
import { groupServicesByType } from "@/lib/services";
import { toneForServiceType } from "@/lib/tones";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Servicios",
  description: "Repostería por encargo, organización de eventos y desayunos personalizados.",
};

export default async function ServicesPage() {
  const [services, info] = await Promise.all([publicApi.getServices(), getBusinessInfo()]);
  const groups = groupServicesByType(services);

  return (
    <div className="pb-20">
      <div className={`${pageContainer} pt-10 sm:pt-16`}>
        <h1 className={pageTitle}>Servicios</h1>
        <p className="mt-3 max-w-[34em] text-muted sm:mt-4 sm:text-lg">
          Además de nuestros postres, te ayudamos a preparar tus celebraciones. Consulta disponibilidad y precio por
          WhatsApp.
        </p>

        {groups.length > 1 && (
          <nav aria-label="Tipos de servicio" className="mt-6">
            <ul className="flex flex-wrap gap-2">
              {groups.map((group) => (
                <li key={group.type}>
                  <a
                    href={`#${group.anchor}`}
                    className="inline-flex min-h-11 items-center rounded-full border-[1.5px] border-border bg-white px-[1.125rem] py-2 text-[0.9375rem] font-medium transition duration-200 ease-spring hover:-translate-y-px hover:border-accent active:scale-[0.97] [touch-action:manipulation]"
                  >
                    {group.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {groups.length === 0 && (
          <p className="mt-10 max-w-[60ch]">
            Muy pronto publicaremos nuestros servicios. Mientras tanto,{" "}
            <Link href="/contacto" className={textLink}>
              escríbenos
            </Link>{" "}
            y cuéntanos qué necesitas.
          </p>
        )}
      </div>

      {groups.map((group, groupIndex) => (
        <section
          key={group.type}
          id={group.anchor}
          aria-labelledby={`${group.anchor}-titulo`}
          className={cn("scroll-mt-20 sm:scroll-mt-24", groupIndex % 2 === 1 ? "bg-surface" : "bg-white")}
        >
          <div className={`${pageContainer} py-14 md:py-20`}>
            <Reveal>
              <h2 id={`${group.anchor}-titulo`} className={sectionTitle}>
                {group.label}
              </h2>
            </Reveal>
            <ul className="mt-10 flex flex-col gap-14 md:gap-20">
              {group.services.map((service, index) => {
                const name = service.name ?? group.label;
                const price = displayPrice(service.price);
                const description = displayText(service.description);
                const whatsApp = buildWhatsAppContactUrl(info?.whatsAppNumber, `Hola! Me interesa ${name}`);
                const imageRight = index % 2 === 1;

                return (
                  <Reveal as="li" key={service.id} className="group grid items-center gap-6 md:grid-cols-2 md:gap-12 lg:gap-16">
                    <MediaImage
                      src={service.imageUrl}
                      alt={name}
                      name={service.name}
                      aspect="aspect-[4/3]"
                      rounded="rounded-[2rem]"
                      tone={toneForServiceType(group.type)}
                      art={<OccasionArt type={group.type} className="w-full" />}
                      sizes="(min-width: 1152px) 540px, (min-width: 768px) 46vw, 92vw"
                      imageClassName="transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
                      className={cn(imageRight && "md:order-2")}
                    />
                    <div>
                      <h3 className="text-2xl sm:text-[1.75rem]">{name}</h3>
                      {price && <p className="mt-2 text-lg font-semibold">{price}</p>}
                      {description && (
                        <p className="mt-4 max-w-[60ch] whitespace-pre-line leading-relaxed">{description}</p>
                      )}
                      <div className="mt-6">
                        {whatsApp ? (
                          <a href={whatsApp} target="_blank" rel="noopener noreferrer" className={buttonSecondary}>
                            <WhatsAppIcon />
                            Consultar por WhatsApp
                          </a>
                        ) : (
                          <Link href="/contacto" className={buttonSecondary}>
                            Consultar
                          </Link>
                        )}
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        </section>
      ))}
    </div>
  );
}
