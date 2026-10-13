"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { WhatsAppIcon } from "@/components/ui/icons";
import { buttonPrimary, buttonPrimarySmall } from "@/components/ui/styles";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";

type OrderActionsProps = {
  whatsAppUrl: string;
  productName: string;
  price: string | null;
};

/**
 * Main "Pedir por WhatsApp" button plus, on phones, a sticky bottom bar with the price and the
 * same action. The bar slides in once the main button has scrolled out of view (above the
 * viewport) and leaves when it comes back, so price and action stay reachable (Baymard PDP).
 */
export function OrderActions({ whatsAppUrl, productName, price }: OrderActionsProps) {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [showBar, setShowBar] = useState(false);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const target = buttonRef.current;
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      setShowBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <a
        ref={buttonRef}
        href={whatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${buttonPrimary} w-full sm:w-auto`}
      >
        <WhatsAppIcon />
        Pedir por WhatsApp
      </a>

      {/* Marker for the footer padding rule in globals.css (phones only). */}
      <span data-order-bar hidden />

      <AnimatePresence>
        {showBar && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:hidden"
            initial={{ y: reduceMotion ? 0 : "100%", opacity: reduceMotion ? 0 : 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reduceMotion ? 0 : "100%", opacity: reduceMotion ? 0 : 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between gap-4 px-4">
              <div className="min-w-0">
                <p className="truncate text-sm text-muted">{productName}</p>
                {price && <p className="truncate font-semibold">{price}</p>}
              </div>
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${buttonPrimarySmall} shrink-0`}
              >
                <WhatsAppIcon className="size-[1.125rem]" />
                Pedir por WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
