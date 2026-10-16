import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Brand logo ("Bites" with "Catering & More"), a single-colour PNG with transparent background.
 * Sizes come from `className` (set a height; the width follows the aspect ratio). Pass `alt=""` when
 * the surrounding link already has an accessible name. `inverse` renders it white for cocoa surfaces.
 */
export function Wordmark({ className, inverse = false, alt = "Bites and More" }: { className?: string; inverse?: boolean; alt?: string }) {
  return (
    <Image
      src="/brand/logo-bites-2026.png"
      alt={alt}
      width={1590}
      height={842}
      className={cn("block w-auto max-w-none", inverse && "brightness-0 invert", className)}
    />
  );
}
