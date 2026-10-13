import Link from "next/link";
import type { CSSProperties } from "react";
import { ProductCard, productGrid } from "@/components/catalog/ProductCard";
import { HeroBackdrop } from "@/components/home/HeroBackdrop";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { HeroHeadline } from "@/components/home/HeroHeadline";
import { OccasionTiles } from "@/components/home/OccasionTiles";
import { OrderSteps } from "@/components/home/OrderSteps";
import { Reveal, StaggerItem, StaggerList } from "@/components/motion/Reveal";
import { buttonPrimary, buttonSecondary, navLink, pageContainer, sectionTitle } from "@/components/ui/styles";
import { loadOrFallback } from "@/lib/api/build-fallback";
import { getBusinessInfo, publicApi } from "@/lib/api/server";
import { featuredProducts } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { buildWhatsAppContactUrl } from "@/lib/contact";
import { displayText } from "@/lib/format";
import { heroSlides } from "@/lib/hero-slides";

export const revalidate = 60;

/** The home page shows one row of the newest products. */
const HOME_FEATURED_COUNT = 4;

const NEUTRAL_SUBTEXT =
  "Pasteles, cupcakes, galletas y mesas de dulces hechos en casa, con cariño e ingredientes de calidad.";

export default async function HomePage() {
  const [info, products, services] = await Promise.all([
    getBusinessInfo(),
    loadOrFallback(() => publicApi.getProducts(), []),
    loadOrFallback(() => publicApi.getServices(), []),
  ]);

  const mission = displayText(info?.mission);
  const vision = displayText(info?.vision);
  const whatsApp = buildWhatsAppContactUrl(info?.whatsAppNumber, "Hola! Quiero hacer un pedido");
  const featured = featuredProducts(products).slice(0, HOME_FEATURED_COUNT);
  const slides = heroSlides(products);

  return (
    <>
      <section className="relative isolate overflow-x-clip">
        <HeroBackdrop />
        {/*
          Phones: headline and text, carousel, then the buttons. From tablet up the carousel takes the
          right column and the text and the buttons stack in the left one, centered on it.
        */}
        <div
          className={`${pageContainer} grid gap-6 pb-14 pt-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] md:grid-rows-[1fr_1fr] md:gap-x-12 md:gap-y-0 md:pb-24 md:pt-12 lg:grid-cols-[minmax(0,1fr)_32.5rem] lg:gap-x-[4.5rem]`}
        >
          <div className="flex flex-col gap-5 md:col-start-1 md:row-start-1 md:gap-7 md:self-end">
            <HeroHeadline
              text="Postres caseros por encargo"
              className="text-[2.875rem] leading-none md:text-[3.5rem] lg:text-[4.75rem] xl:text-[5.25rem] xl:leading-[0.98]"
            />
            <p
              className="hero-reveal max-w-[30em] text-[1.0625rem] leading-relaxed text-muted md:text-[1.1875rem]"
              style={{ "--delay": "300ms" } as CSSProperties}
            >
              {mission ?? NEUTRAL_SUBTEXT}
            </p>
          </div>

          <div className="mx-auto w-full max-w-[32.5rem] md:col-start-2 md:row-span-2 md:row-start-1 md:mr-0 md:self-center">
            <HeroCarousel slides={slides} />
          </div>

          <div
            className="hero-reveal flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3.5 md:col-start-1 md:row-start-2 md:mt-7 md:self-start"
            style={{ "--delay": "420ms" } as CSSProperties}
          >
            <Link href="/productos" className={buttonPrimary}>
              Ver productos
            </Link>
            {whatsApp && (
              <a href={whatsApp} target="_blank" rel="noopener noreferrer" className={buttonSecondary}>
                Pedir por WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="ocasiones" className="bg-sugar py-12 md:py-24">
        <div className={pageContainer}>
          <Reveal>
            <h2 id="ocasiones" className={sectionTitle}>
              Para cada ocasión
            </h2>
            <p className="mt-2.5 max-w-[60ch] text-muted md:text-lg">
              Además de nuestros postres, te acompañamos en tus celebraciones.
            </p>
          </Reveal>
          <div className="mt-6 md:mt-10">
            <OccasionTiles services={services} />
          </div>
        </div>
      </section>

      <section aria-labelledby="destacados" className={`${pageContainer} pb-4 pt-12 md:pb-10 md:pt-24`}>
        <Reveal className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 md:items-end">
          <h2 id="destacados" className={sectionTitle}>
            Destacados
          </h2>
          {featured.length > 0 && (
            <Link href="/productos" className={cn(navLink, "inline-flex min-h-11 items-center")}>
              <span className="md:hidden">Ver todos</span>
              <span className="hidden md:inline">Ver todos los productos</span>
            </Link>
          )}
        </Reveal>
        {featured.length > 0 ? (
          <StaggerList className={cn(productGrid, "mt-6 md:mt-10")}>
            {featured.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerList>
        ) : (
          <p className="mt-4 max-w-[60ch] text-muted">
            Estamos preparando el catálogo. Muy pronto verás aquí nuestros postres.
          </p>
        )}
      </section>

      <section aria-labelledby="como-pedir" className={`${pageContainer} pb-12 pt-8 md:pb-24 md:pt-[4.5rem]`}>
        <Reveal>
          <h2 id="como-pedir" className={sectionTitle}>
            Cómo pedir
          </h2>
        </Reveal>
        <div className="mt-6 md:mt-12">
          <OrderSteps hasWhatsApp={whatsApp !== null} />
        </div>
      </section>

      {/*
        Approved design (spec 011): heading and mission on the left, the vision on a butter tile on the
        right (stacked on phones). The mission is also the hero subtext. Each part hides when its field is
        empty, and the whole section when both are.
      */}
      {(mission || vision) && (
        <section aria-labelledby="sobre-nosotros" className={`${pageContainer} pb-12 md:pb-24`}>
          <div className={cn("grid gap-4 md:items-stretch md:gap-7", vision && "md:grid-cols-2")}>
            <Reveal className="flex flex-col justify-center gap-3.5 md:pr-6">
              <h2 id="sobre-nosotros" className={sectionTitle}>
                Sobre nosotros
              </h2>
              {mission && (
                <p className="max-w-[30em] whitespace-pre-line leading-relaxed text-muted md:text-lg">{mission}</p>
              )}
            </Reveal>
            {vision && (
              <Reveal delay={0.08} className="flex flex-col gap-2 rounded-3xl bg-butter p-6 md:gap-3 md:rounded-[2rem] md:p-10">
                <h3 className="text-[1.375rem] md:text-[1.625rem]">Nuestra visión</h3>
                <p className="max-w-[60ch] whitespace-pre-line leading-relaxed text-muted">{vision}</p>
              </Reveal>
            )}
          </div>
        </section>
      )}
    </>
  );
}
