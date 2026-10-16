"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import Link from "next/link";
import { Suspense, useState, type CSSProperties } from "react";
import { buttonSecondary, filterChip } from "@/components/ui/styles";
import type { Product } from "@/lib/api/types";
import { productCountLabel, type CategoryFilter } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { duration, easeOut, exitDuration, spring } from "@/lib/motion";

const STAGGER_CAP = 12;
import { CATEGORY_PARAM, CategoryParamSync } from "./CategoryParamSync";
import { ProductCard, productGrid } from "./ProductCard";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";

type ProductCatalogProps = {
  /** Available products only. */
  products: Product[];
  filters: CategoryFilter[];
};

/**
 * Client-side filter over the server-fetched catalog. The selected category is mirrored in
 * the URL (?categoria=slug) so filtered views can be shared and reloaded. The page is static
 * (ISR), so the category in the URL is read on the client and applied after hydration; an
 * unknown slug shows every product.
 */
export function ProductCatalog({ products, filters }: ProductCatalogProps) {
  const [selected, setSelected] = useState<string | null>(null);
  // The first render staggers the grid in (CSS); after a filter change items scale in together.
  const [hasFiltered, setHasFiltered] = useState(false);
  const reduceMotion = usePrefersReducedMotion();

  const active = filters.find((filter) => filter.slug === selected) ?? null;
  const visible = active ? products.filter((product) => product.categoryId === active.category.id) : products;

  function select(slug: string | null) {
    setSelected(slug);
    setHasFiltered(true);
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set(CATEGORY_PARAM, slug);
    else url.searchParams.delete(CATEGORY_PARAM);
    // Next.js syncs native history updates with useSearchParams (CategoryParamSync).
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }

  const chips: Array<{ slug: string | null; label: string; count: number }> = [
    { slug: null, label: "Todos", count: products.length },
    ...filters.map((filter) => ({ slug: filter.slug, label: filter.category.name ?? "Sin nombre", count: filter.count })),
  ];

  const countLabel = (
    <p className="text-[0.9375rem] text-muted" aria-live="polite">
      {productCountLabel(visible.length)}
      {active ? ` en ${active.category.name}` : ""}
    </p>
  );

  return (
    <>
      <Suspense fallback={null}>
        <CategoryParamSync onChange={setSelected} />
      </Suspense>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 sm:mt-10">
        {filters.length > 0 ? (
          <LayoutGroup id="category-filter">
            <div role="group" aria-label="Filtrar por categoría" className="flex flex-wrap gap-2.5">
              {chips.map((chip) => {
                const isActive = chip.slug === (active ? active.slug : null);
                return (
                  <button
                    key={chip.slug ?? "all"}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => select(chip.slug)}
                    className={cn(
                      filterChip,
                      isActive ? "border-transparent" : "border-border bg-white hover:-translate-y-px hover:border-accent",
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="active-category-chip"
                        aria-hidden="true"
                        className="absolute -inset-[1.5px] rounded-full border-[1.5px] border-accent bg-rose-tint-strong"
                        transition={reduceMotion ? { duration: 0 } : spring}
                      />
                    )}
                    <span className="relative">{chip.label}</span>
                    <span className="relative text-[0.8125rem] opacity-70">({chip.count})</span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
        ) : null}
        {countLabel}
      </div>

      {visible.length > 0 ? (
        <motion.ul layout={!reduceMotion} className={cn(productGrid, "mt-8 sm:mt-10")}>
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((product, index) => (
              <motion.li
                key={product.id}
                layout={!reduceMotion}
                // First load: CSS stagger (plays before hydration, so the grid is never hidden waiting for JS).
                className={hasFiltered ? undefined : "stagger-in"}
                style={{ "--i": Math.min(index, STAGGER_CAP) } as CSSProperties}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: reduceMotion ? { duration: 0 } : { duration: duration.base, ease: easeOut },
                }}
                exit={{
                  opacity: 0,
                  scale: 0.96,
                  transition: { duration: reduceMotion ? 0 : exitDuration(duration.base) },
                }}
                transition={reduceMotion ? { duration: 0 } : { layout: spring }}
              >
                <ProductCard product={product} preload={index < 2} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <div className="mt-8 max-w-[60ch] rounded-3xl bg-caramel-tint px-6 py-8 sm:px-8">
          <p className="text-lg font-semibold">
            {active ? `Por ahora no hay productos en ${active.category.name}.` : "Estamos preparando el catálogo."}
          </p>
          <p className="mt-2 text-muted">
            {active
              ? "Mira las otras categorías o escríbenos para un pedido especial."
              : "Muy pronto verás aquí nuestros postres. Mientras tanto, escríbenos y cuéntanos qué te gustaría."}
          </p>
          <div className="mt-6">
            {active ? (
              <button type="button" onClick={() => select(null)} className={buttonSecondary}>
                Ver todos los productos
              </button>
            ) : (
              <Link href="/contacto" className={buttonSecondary}>
                Ir a contacto
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
