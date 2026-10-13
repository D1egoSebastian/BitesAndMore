"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";

const LINKS = [
  { href: "/admin", label: "Inicio", exact: true },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/servicios", label: "Servicios" },
  { href: "/admin/negocio", label: "Negocio" },
  { href: "/admin/cuenta", label: "Cuenta" },
];

/**
 * Sidebar on desktop, scrollable top tabs on mobile. Pink marks the active item only; the marker
 * slides to the new item with the shared spring when the page changes.
 */
export function AdminNav({ layout }: { layout: "sidebar" | "tabs" }) {
  const pathname = usePathname();
  const reduceMotion = usePrefersReducedMotion();

  return (
    <nav aria-label="Panel">
      <ul className={cn(layout === "sidebar" ? "flex flex-col gap-0.5" : "-mx-4 flex gap-1 overflow-x-auto px-4")}>
        {LINKS.map((link) => {
          const active = link.exact ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-11 items-center font-semibold transition-colors",
                  layout === "sidebar"
                    ? cn("rounded-lg px-4 py-2", active ? "bg-white" : "text-muted hover:bg-white/70 hover:text-foreground")
                    : cn("px-3 py-2", active ? "" : "text-muted hover:text-foreground"),
                )}
              >
                {active && (
                  <motion.span
                    layoutId={`admin-nav-marker-${layout}`}
                    transition={reduceMotion ? { duration: 0 } : spring}
                    aria-hidden="true"
                    className={cn(
                      "absolute rounded-full bg-accent",
                      layout === "sidebar" ? "inset-y-2.5 left-1.5 w-1" : "inset-x-3 bottom-0 h-[3px]",
                    )}
                  />
                )}
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
