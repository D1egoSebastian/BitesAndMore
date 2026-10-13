import Image from "next/image";
import { cn } from "@/lib/cn";

type LogoProps = {
  /** Intrinsic size in px (the source file is a 150 px square). Override the rendered size with className. */
  size?: number;
  className?: string;
  alt?: string;
  preload?: boolean;
};

/** The JPEG logo has a white background: it sits naturally on white; on sugar, `logo-blend` removes the box. */
export function Logo({ size = 72, className, alt = "Bites and More", preload = false }: LogoProps) {
  return (
    <Image
      src="/brand/bitesandmore.jpg"
      alt={alt}
      width={size}
      height={size}
      preload={preload}
      className={cn("logo-blend select-none", className)}
    />
  );
}
