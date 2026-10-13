"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { easeOut } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";

/** The frame settles in with CSS (.media-enter, 450 ms); the bite follows. */
const BITE_DELAY_SECONDS = 0.5;
const BITE_SECONDS = 0.45;

/**
 * THE BITE — the site's only signature element, the frame of the home hero carousel.
 * The frame settles in (CSS, so the first photo is visible before hydration), then a bite is
 * taken out of its top-right corner (mask circles grow from 0 to full size) and the pink circle
 * behind it shows through. It animates once per page load; the slides change inside it.
 * Under prefers-reduced-motion every transition has zero duration, so it renders final at once.
 * Initial values are identical on server and client to keep hydration stable.
 */
export function HeroBite({ children }: { children: ReactNode }) {
  const reduceMotion = usePrefersReducedMotion();
  const seconds = (value: number) => (reduceMotion ? 0 : value);
  const biteTransition = { duration: seconds(BITE_SECONDS), delay: seconds(BITE_DELAY_SECONDS), ease: easeOut };

  return (
    <div className="bite-frame media-enter relative">
      {/* Pink circle peeking through the bite. It sits behind the frame and only shows where the bite is. */}
      {/* Clipped to the frame so the circle never sticks out past the image edges. */}
      <span aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-[1.75rem] md:rounded-[2.25rem]">
        <motion.span
          className="absolute right-[-4.5cqw] top-[-4.5cqw] size-[32cqw] rounded-full bg-accent"
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={biteTransition}
        />
      </span>
      <motion.div
        className="bite-mask relative aspect-square overflow-hidden rounded-[1.75rem] bg-surface md:aspect-[4/5] md:rounded-[2.25rem]"
        initial={{ "--bite": 0 } as Record<string, number>}
        animate={{ "--bite": 1 } as Record<string, number>}
        transition={biteTransition}
      >
        {children}
      </motion.div>
    </div>
  );
}
