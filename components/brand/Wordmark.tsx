import { cn } from "@/lib/cn";

/**
 * Text wordmark of the approved design: "Bites" in Bricolage with a small "and more" after it.
 * `showTagline` is hidden on very small screens, where the header only has room for "Bites".
 */
export function Wordmark({ className, tagline = true }: { className?: string; tagline?: boolean }) {
  return (
    <span className={cn("font-display inline-flex items-baseline gap-1.5 font-bold leading-none text-wordmark", className)}>
      Bites
      {tagline && <span className="hidden font-sans text-[0.8125rem] font-medium tracking-normal text-muted sm:inline">and more</span>}
    </span>
  );
}
