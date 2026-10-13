import type { ComponentProps } from "react";
import { DessertArt } from "@/components/media/DessertArt";
import { MediaImage } from "@/components/media/MediaImage";
import type { Product } from "@/lib/api/types";
import { dessertKindOf, toneForCategory } from "@/lib/tones";

type ProductMediaProps = Omit<ComponentProps<typeof MediaImage>, "src" | "name" | "tone" | "art" | "alt"> & {
  product: Product;
  alt?: string;
};

/** Product photo whose placeholder follows the category: its pastel tone and its illustration. */
export function ProductMedia({ product, alt = "", ...rest }: ProductMediaProps) {
  return (
    <MediaImage
      {...rest}
      src={product.imageUrl}
      alt={alt}
      name={product.name}
      tone={toneForCategory(product.categoryId)}
      art={<DessertArt kind={dessertKindOf(product.category?.name)} className="w-full" />}
    />
  );
}
