"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";
import { cn } from "@/lib/cn";
import { easeOut, reveal, revealTransition, revealViewport, scrollStagger, spring } from "@/lib/motion";

/*
 * Scroll reveals for content below the fold (Notion-like): blocks rise 16 px and fade in once
 * when they enter the viewport. They use transform/opacity only and never change the layout (no
 * CLS). The start state is written into the server HTML by framer-motion, so globals.css shows
 * the ".scroll-reveal" elements at once when JavaScript is off. Above-the-fold entrances use the
 * CSS classes in globals.css instead, so they play before hydration.
 */

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "section";
  /** Seconds to wait after entering the viewport. */
  delay?: number;
};

const revealElements = { div: motion.div, li: motion.li, section: motion.section };

/** Fades a block in and lifts it 16 px when it scrolls into view (headings, blocks). */
export function Reveal({ children, className, as = "div", delay = 0 }: RevealProps) {
  const reduceMotion = usePrefersReducedMotion();
  const Element = revealElements[as];
  return (
    <Element
      className={cn("scroll-reveal", className)}
      initial={{ opacity: 0, y: reveal.rise }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={revealViewport}
      transition={revealTransition({ reduceMotion, delay })}
    >
      {children}
    </Element>
  );
}

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: scrollStagger, delayChildren: 0.05 } },
};

const itemVariants: Record<"rise" | "scale", Variants> = {
  rise: {
    hidden: { opacity: 0, y: reveal.rise },
    show: { opacity: 1, y: 0, transition: { duration: reveal.duration, ease: easeOut } },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.94 },
    show: { opacity: 1, scale: 1, transition: { scale: spring, opacity: { duration: reveal.duration, ease: easeOut } } },
  },
};

/** Reduced motion: items appear at once, without movement or fade. */
const instantVariants: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0 } } };
const instantListVariants: Variants = { hidden: {}, show: {} };

/** A list whose items enter one after another (70 ms apart) when it scrolls into view. */
export function StaggerList({ children, className }: { children: ReactNode; className?: string }) {
  const reduceMotion = usePrefersReducedMotion();
  return (
    <motion.ul
      className={className}
      variants={reduceMotion ? instantListVariants : listVariants}
      initial="hidden"
      whileInView="show"
      viewport={revealViewport}
    >
      {children}
    </motion.ul>
  );
}

/** Item of a StaggerList: "rise" lifts it 16 px, "scale" grows it from 94% with a spring. */
export function StaggerItem({
  children,
  className,
  variant = "rise",
}: {
  children: ReactNode;
  className?: string;
  variant?: "rise" | "scale";
}) {
  const reduceMotion = usePrefersReducedMotion();
  return (
    <motion.li
      className={cn("scroll-reveal", className)}
      variants={reduceMotion ? instantVariants : itemVariants[variant]}
    >
      {children}
    </motion.li>
  );
}
