"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Every framer-motion animation follows the visitor's "reduce motion" setting: transforms and
 * layout animations become instant. Components that drive motion by hand (carousel autoplay,
 * parallax, path drawing) also check useReducedMotion themselves.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
