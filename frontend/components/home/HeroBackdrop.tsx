"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";

/**
 * Decorative depth behind the hero: two soft radial blobs (rose tint top right, caramel tint left) that
 * drift slowly on their own (CSS .blob-drift) and shift a little against the scroll. Radial
 * gradients are already soft, so no blur filter is needed (cheaper on phones). Both motions are
 * off under prefers-reduced-motion.
 */
export function HeroBackdrop() {
  const reduceMotion = usePrefersReducedMotion();
  const { scrollY } = useScroll();
  const roseY = useTransform(scrollY, [0, 700], [0, 90]);
  const caramelY = useTransform(scrollY, [0, 700], [0, -50]);

  return (
    // The container fades out towards the bottom so the blobs never end in a hard edge.
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden [mask-image:linear-gradient(to_bottom,#000_60%,transparent)]"
    >
      <motion.div
        style={reduceMotion ? undefined : { y: roseY }}
        className="absolute -right-44 -top-28 size-[26rem] md:-right-40 md:-top-32 md:size-[38.75rem]"
      >
        <div className="blob-drift size-full rounded-full bg-[radial-gradient(circle,var(--rose-tint)_0%,transparent_68%)]" />
      </motion.div>
      <motion.div
        style={reduceMotion ? undefined : { y: caramelY }}
        className="absolute -left-56 top-[22rem] size-[22rem] md:size-[35rem]"
      >
        <div
          className="blob-drift size-full rounded-full bg-[radial-gradient(circle,var(--caramel-tint)_0%,transparent_68%)]"
          style={{ animationDelay: "-5s" }}
        />
      </motion.div>
    </div>
  );
}
