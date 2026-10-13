"use client";

import { AnimatePresence, LayoutGroup, motion, type Variants } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { WhatsAppIcon } from "@/components/ui/icons";
import { buttonPrimary, buttonPrimarySmall } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { duration, easeOut, exitDuration, spring, stagger } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";

type NavLink = { href: string; label: string; match: string[] };

const LINKS: NavLink[] = [
  { href: "/", label: "Inicio", match: [] },
  { href: "/productos", label: "Productos", match: ["/productos", "/producto"] },
  { href: "/servicios", label: "Servicios", match: ["/servicios"] },
  { href: "/contacto", label: "Contacto", match: ["/contacto"] },
];

function isActive(pathname: string, link: NavLink) {
  if (link.href === "/") return pathname === "/";
  return link.match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

const menuList: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: 0.05 } },
};

const menuItem: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: duration.base, ease: easeOut } },
};

/**
 * Main navigation. Desktop: pill links; the current page has a pink outline pill that slides
 * between items with a shared layoutId spring when the route changes; inactive items fade in a
 * sugar background on hover. Phones: hamburger with a panel whose items enter staggered.
 */
export function SiteNav({ whatsAppUrl }: { whatsAppUrl: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  const panelId = useId();
  const seconds = (value: number) => (reduceMotion ? 0 : value);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <div className="hidden items-center gap-3 md:flex lg:gap-4">
        <nav aria-label="Principal">
          <LayoutGroup id="site-nav">
            <ul className="flex items-center gap-1">
              {LINKS.map((link) => {
                const active = isActive(pathname, link);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative inline-flex min-h-11 items-center rounded-full px-3.5 text-[0.9375rem] font-medium transition-colors duration-200 lg:px-5",
                        !active && "hover:bg-surface",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="site-nav-active"
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full border-2 border-accent"
                          transition={reduceMotion ? { duration: 0 } : spring}
                        />
                      )}
                      <span className="relative">{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </LayoutGroup>
        </nav>
        {whatsAppUrl && (
          <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" className={buttonPrimarySmall}>
            Pedir por WhatsApp
          </a>
        )}
      </div>

      <button
        type="button"
        className="relative inline-flex size-11 cursor-pointer items-center justify-center rounded-full border-2 border-accent bg-white transition duration-200 ease-spring hover:bg-blush active:scale-[0.94] md:hidden"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true" className="relative block h-3.5 w-5">
          <motion.span
            className="absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current"
            animate={open ? { y: 6, rotate: 45 } : { y: 0, rotate: 0 }}
            transition={reduceMotion ? { duration: 0 } : spring}
          />
          <motion.span
            className="absolute left-0 top-[6px] h-0.5 w-5 rounded-full bg-current"
            animate={{ opacity: open ? 0 : 1, scaleX: open ? 0.4 : 1 }}
            transition={{ duration: seconds(duration.fast) }}
          />
          <motion.span
            className="absolute left-0 top-[12px] h-0.5 w-5 rounded-full bg-current"
            animate={open ? { y: -6, rotate: -45 } : { y: 0, rotate: 0 }}
            transition={reduceMotion ? { duration: 0 } : spring}
          />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            className="absolute inset-x-0 top-full border-b border-border bg-white shadow-[0_18px_30px_-24px_rgb(59_37_34/0.5)] md:hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: seconds(duration.base), ease: easeOut } }}
            exit={{ opacity: 0, y: -8, transition: { duration: seconds(exitDuration(duration.base)) } }}
          >
            <nav aria-label="Principal" className="px-4 pb-5 pt-3">
              <motion.ul className="flex flex-col gap-1" variants={menuList} initial="hidden" animate="show">
                {LINKS.map((link) => {
                  const active = isActive(pathname, link);
                  return (
                    <motion.li key={link.href} variants={menuItem}>
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "font-display flex min-h-14 items-center rounded-full border-2 px-5 text-xl transition-colors duration-200",
                          active ? "border-accent" : "border-transparent active:bg-blush",
                        )}
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  );
                })}
              </motion.ul>
              {whatsAppUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: seconds(duration.base), ease: easeOut, delay: seconds(LINKS.length * stagger + 0.05) }}
                >
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className={`${buttonPrimary} mt-4 w-full`}
                  >
                    <WhatsAppIcon />
                    Pedir por WhatsApp
                  </a>
                </motion.div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
