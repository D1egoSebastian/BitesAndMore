"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Sticky header. At the top of the page it is plain white; once the page scrolls it turns
 * slightly translucent with a backdrop blur, a hairline border and a soft shadow (300 ms).
 */
export function HeaderFrame({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // React skips re-renders when the boolean does not change, so no throttling is needed.
    const update = () => setScrolled(window.scrollY > 4);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-out-soft",
        scrolled
          ? "border-border bg-white/80 shadow-[0_6px_24px_-18px_rgb(69_22_28/0.5)] backdrop-blur-md backdrop-saturate-150"
          : "border-transparent bg-white",
      )}
    >
      {children}
    </header>
  );
}
