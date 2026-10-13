import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { OrderActions } from "@/components/catalog/OrderActions";
import { ProductCard, productGrid } from "@/components/catalog/ProductCard";
import { ProductMedia } from "@/components/catalog/ProductMedia";
import { Reveal, StaggerItem, StaggerList } from "@/components/motion/Reveal";
import { navLink, pageContainer, sectionTitle, textLink } from "@/components/ui/styles";
import { publicApi } from "@/lib/api/server";
import { categorySlug, relatedProducts } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { displayPrice, displayText } from "@/lib/format";
import { loadProductSlugParams } from "@/lib/static-params";
import { TONE_BG, toneForCategory } from "@/lib/tones";

export const revalidate = 60;

/** Products created after the build are rendered on their first visit and then cached (ISR). */
export const dynamicParams = true;

/** Prerenders every visible product so visitors never wait on a sleeping API (ADR-024). */
export function generateStaticParams() {
  return loadProductSlugParams(() => publicApi.getProducts());
}

const RELATED_LIMIT = 4;

/** Unknown slugs and hidden products are both "not found" for visitors (FR-006-6). */
const getVisibleProduct = cache(async (slug: string) => {
  const product = await publicApi.getProductBySlug(slug);
  return product && product.isAvailable ? product : null;
});

export async function generateMetadata({ params }: PageProps<"/producto/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getVisibleProduct(slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name ?? "Producto",
    description: displayText(product.description) ?? undefined,
  };
}

export default async function ProductPage({ params }: PageProps<"/producto/[slug]">) {
  const { slug } = await params;
  const product = await getVisibleProduct(slug);
  if (!product) notFound();

  // Suggestions are optional: if they fail, the product page still renders.
  const sameCategory = await publicApi.getProducts(product.categoryId).catch(() => []);
  const related = relatedProducts(sameCategory, product, RELATED_LIMIT);

  const name = product.name ?? "Producto";
  const price = displayPrice(product.price);
  const description = displayText(product.description);
  const category = product.category?.name ? product.category : null;
  const categoryHref = category ? `/productos?categoria=${categorySlug(category)}` : null;

  return (
    <div className={`${pageContainer} pb-24 pt-6 sm:pt-8`}>
      <nav aria-label="Ruta de navegación">
        <ol className="flex flex-wrap items-center gap-x-2 text-sm text-muted">
          <li>
            <Link href="/productos" className={cn(navLink, "inline-flex min-h-11 items-center text-muted")}>
              Productos
            </Link>
          </li>
          {category && categoryHref && (
            <li className="flex items-center gap-x-2">
              <span aria-hidden="true">/</span>
              <Link href={categoryHref} className={cn(navLink, "inline-flex min-h-11 items-center text-muted")}>
                {category.name}
              </Link>
            </li>
          )}
        </ol>
      </nav>

      <article className="mt-2 grid gap-8 md:mt-4 md:grid-cols-2 md:gap-12 lg:gap-16">
        <ProductMedia
          product={product}
          alt={name}
          preload
          sizes="(min-width: 1200px) 520px, (min-width: 768px) 46vw, 92vw"
          rounded="rounded-[2rem]"
          className="media-enter"
        />
        <div className="md:pt-4">
          {category && (
            <p
              className={cn(
                "inline-flex rounded-full px-3.5 py-1 text-sm font-medium",
                TONE_BG[toneForCategory(product.categoryId)],
              )}
            >
              {category.name}
            </p>
          )}
          <h1 className="mt-3 text-[2.25rem] leading-[1.05] sm:text-5xl">{name}</h1>
          {price && <p className="mt-4 text-xl font-semibold">{price}</p>}
          {description && <p className="mt-6 max-w-[62ch] whitespace-pre-line text-lg leading-relaxed">{description}</p>}

          <div className="mt-8">
            {product.whatsAppUrl ? (
              <OrderActions whatsAppUrl={product.whatsAppUrl} productName={name} price={price} />
            ) : (
              <p className="max-w-[50ch]">
                ¿Te gustaría pedirlo?{" "}
                <Link href="/contacto" className={textLink}>
                  Escríbenos desde la página de contacto
                </Link>
                .
              </p>
            )}
          </div>

          <div className="mt-8 rounded-3xl bg-surface p-6">
            <h2 className="font-sans text-base font-semibold tracking-normal">Cómo pedir</h2>
            <p className="mt-1 max-w-[52ch] text-muted">
              {product.whatsAppUrl
                ? "El botón abre WhatsApp con el nombre del producto ya escrito. Te confirmamos el precio final, la fecha y la entrega."
                : "Cuéntanos qué producto quieres y para cuándo. Te confirmamos el precio final, la fecha y la entrega."}
            </p>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="relacionados" className="mt-20">
          <Reveal>
            <h2 id="relacionados" className={sectionTitle}>
              También te puede gustar
            </h2>
          </Reveal>
          <StaggerList className={cn(productGrid, "mt-8")}>
            {related.map((item) => (
              <StaggerItem key={item.id}>
                <ProductCard product={item} />
              </StaggerItem>
            ))}
          </StaggerList>
        </section>
      )}
    </div>
  );
}
