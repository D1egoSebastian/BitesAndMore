"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;
const getServerSnapshot = () => false;

/**
 * True when the visitor asks for reduced motion. Hydration-safe replacement for framer-motion's
 * useReducedMotion, which reads the media query during the first client render and makes
 * markup that depends on it (pause button, aria-live, inline styles) differ from the server HTML.
 * Here the first client render matches the server (false) and React re-renders with the real value.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
