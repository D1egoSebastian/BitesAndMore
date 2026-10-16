"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/ui/icons";
import { duration, exitDuration, spring } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";

/**
 * Floating WhatsApp action for phones (raspberry pill, "Pedir") (hidden from md up, where the header has the button).
 * Only rendered when a number is configured, and never on product pages, which have their own
 * sticky order bar. Springs in after 1 s so it does not compete with the page entrance; it sits
 * above the bottom safe area.
 */
export function WhatsAppFab({ whatsAppUrl }: { whatsAppUrl: string | null }) {
  const pathname = usePathname();
  const reduceMotion = usePrefersReducedMotion();
  const visible = whatsAppUrl !== null && !pathname.startsWith("/producto/");

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          key="whatsapp-fab"
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Pedir por WhatsApp"
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-20 inline-flex h-[3.25rem] items-center justify-center gap-2 rounded-full bg-raspberry px-6 font-semibold text-white shadow-[0_10px_24px_-6px_rgb(69_22_28/0.4)] [touch-action:manipulation] md:hidden"
          initial={{ opacity: 0, scale: 0.5, y: 16 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            transition: reduceMotion ? { duration: 0 } : { ...spring, delay: 1, opacity: { duration: duration.base, delay: 1 } },
          }}
          exit={{ opacity: 0, scale: 0.5, y: 16, transition: { duration: exitDuration(duration.base) } }}
          whileTap={{ scale: 0.92 }}
        >
          <WhatsAppIcon className="size-5" />
          Pedir
        </motion.a>
      )}
    </AnimatePresence>
  );
}
