import Link from "next/link";
import type { Product } from "@/lib/api/types";
import { displayPrice } from "@/lib/format";
import { ProductMedia } from "./ProductMedia";

/**
 * The whole card is one link: 4:5 pastel tile with the photo, then name, category and price.
 * Hover (pointer devices): the tile lifts 6 px, the photo zooms a little and a white "Ver detalle"
 * chip slides up from its bottom edge. Press: scales to 0.98. Only transform and opacity change,
 * so nothing around the card reflows.
 */
export function ProductCard({ product, preload = false }: { product: Product; preload?: boolean }) {
  const price = displayPrice(product.price);
  const name = product.name ?? "Producto";
  const category = product.category?.name?.trim();

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group flex flex-col gap-2.5 rounded-3xl transition duration-300 ease-out-soft active:scale-[0.98] sm:gap-3.5 [touch-action:manipulation]"
    >
      <div className="transition-transform duration-400 ease-out-soft group-hover:-translate-y-1.5 group-focus-visible:-translate-y-1.5">
        <ProductMedia
          product={product}
          preload={preload}
          rounded="rounded-[1.25rem] sm:rounded-3xl"
          sizes="(min-width: 1200px) 255px, (min-width: 1024px) 22vw, (min-width: 640px) 30vw, 46vw"
          imageClassName="transition-transform duration-600 ease-out-soft group-hover:scale-105"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-4 bottom-4 hidden h-11 translate-y-[4.5rem] items-center justify-center rounded-full bg-white text-sm font-semibold opacity-0 shadow-[0_6px_18px_-8px_rgb(69_22_28/0.35)] transition duration-400 ease-out-soft group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 sm:flex"
          >
            Ver detalle
          </span>
        </ProductMedia>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-sans text-[0.9375rem] font-semibold leading-snug tracking-normal sm:text-[1.0625rem]">{name}</h3>
        {category && <p className="hidden text-sm text-muted sm:block">{category}</p>}
        {price && <p className="text-sm font-semibold text-muted sm:text-base sm:text-foreground">{price}</p>}
      </div>
    </Link>
  );
}

/** Responsive product grid: 2 columns on phones, 3 on tablets, 4 on desktop. */
export const productGrid =
  "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-7 sm:gap-y-9 lg:grid-cols-4";
