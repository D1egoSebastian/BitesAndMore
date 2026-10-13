import { productGrid } from "@/components/catalog/ProductCard";
import { pageContainer } from "@/components/ui/styles";
import { cn } from "@/lib/cn";

/** Loading state: sugar blocks shaped like the page that is coming. */
export function PageSkeleton({ variant = "grid" }: { variant?: "grid" | "rows" }) {
  return (
    <div className={`${pageContainer} pb-20 pt-8 sm:pt-12`} role="status" aria-live="polite">
      <span className="sr-only">Cargando…</span>
      <div aria-hidden="true" className="animate-pulse">
        <div className="h-10 w-56 max-w-full rounded-lg bg-surface sm:h-12" />
        <div className="mt-4 h-5 w-[28rem] max-w-full rounded-md bg-surface" />

        {variant === "grid" ? (
          <>
            <div className="mt-8 flex flex-wrap gap-2">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="h-11 w-28 rounded-full bg-surface" />
              ))}
            </div>
            <div className={cn(productGrid, "mt-10")}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => (
                <div key={item}>
                  <div className="aspect-[4/5] rounded-3xl bg-surface" />
                  <div className="mt-3 h-5 w-3/4 rounded-md bg-surface" />
                  <div className="mt-2 h-4 w-1/3 rounded-md bg-surface" />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-12 flex flex-col gap-12">
            {[0, 1].map((item) => (
              <div key={item} className="grid gap-6 md:grid-cols-2 md:gap-12">
                <div className="aspect-[4/3] rounded-3xl bg-surface" />
                <div className="md:pt-4">
                  <div className="h-8 w-2/3 rounded-md bg-surface" />
                  <div className="mt-4 h-5 w-1/3 rounded-md bg-surface" />
                  <div className="mt-6 h-4 w-full rounded-md bg-surface" />
                  <div className="mt-2 h-4 w-5/6 rounded-md bg-surface" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
