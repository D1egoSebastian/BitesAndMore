import type { ReactNode } from "react";
import { AdaptiveImage } from "@/components/media/AdaptiveImage";
import { CookieIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { TONE_BG, type Tone } from "@/lib/tones";

type MediaImageProps = {
  src: string | null;
  /** Empty string when the image is decorative (e.g. the name is the link text right next to it). */
  alt: string;
  /** Used for the placeholder letter when there is no image and no art. */
  name: string | null;
  sizes: string;
  /** Tailwind aspect class. The frame always reserves its space, so images never shift the layout. */
  aspect?: string;
  /** Tailwind radius class. */
  rounded?: string;
  /** Pastel tone behind the photo; it is what shows while loading and when there is no photo. */
  tone?: Tone;
  /** Illustration shown instead of the cookie and initial when there is no photo. */
  art?: ReactNode;
  className?: string;
  /** Class for the photo layer, e.g. the product card hover scale. */
  imageClassName?: string;
  preload?: boolean;
  /** "adaptive" (default, spec 012) or "cover" for small admin thumbnails. */
  fit?: "adaptive" | "cover";
  /** Overlay rendered inside the frame, above the photo (e.g. the product card "Ver detalle" chip). */
  children?: ReactNode;
};

/**
 * Product and service photos: fixed aspect, 24 px radius, pastel placeholder when there is no
 * photo. The photo is an AdaptiveImage (spec 012): it covers the frame when it fits and is sharp
 * enough, otherwise it is shown whole over a blurred copy of itself. `.svg` sources (the local
 * mockups in /public/mock) are served as-is: next/image skips optimization for them automatically.
 */
export function MediaImage({
  src,
  alt,
  name,
  sizes,
  aspect = "aspect-[4/5]",
  rounded = "rounded-3xl",
  tone = "sugar",
  art,
  className,
  imageClassName,
  preload,
  fit,
  children,
}: MediaImageProps) {
  return (
    <div className={cn("media-frame relative overflow-hidden", TONE_BG[tone], aspect, rounded, className)}>
      {src ? (
        <AdaptiveImage src={src} alt={alt} sizes={sizes} preload={preload} fit={fit} className={imageClassName} />
      ) : (
        <ImagePlaceholder name={name} label={alt} art={art} tone={tone} />
      )}
      {children}
    </div>
  );
}

/**
 * Pastel tile with a small illustration (or, without art, a cookie and the name's initial).
 * Never a broken image.
 */
export function ImagePlaceholder({
  name,
  label,
  art,
  tone = "sugar",
}: {
  name: string | null;
  label: string;
  art?: ReactNode;
  tone?: Tone;
}) {
  const letter = name?.trim().charAt(0).toUpperCase() || "B";
  const a11y = label ? { role: "img" as const, "aria-label": label } : { "aria-hidden": true as const };

  if (art) {
    return (
      <div {...a11y} className={cn("absolute inset-0 flex items-center justify-center", TONE_BG[tone])}>
        <div className="flex w-[66%] items-center justify-center">{art}</div>
      </div>
    );
  }

  return (
    <div
      {...a11y}
      className={cn("absolute inset-0 flex flex-col items-center justify-center gap-[3cqw]", TONE_BG[tone])}
    >
      <CookieIcon className="size-[clamp(0.9rem,13cqw,2.25rem)] text-foreground" />
      <span className="font-display text-[clamp(0.9rem,18cqw,3.5rem)] leading-none text-muted">{letter}</span>
    </div>
  );
}
