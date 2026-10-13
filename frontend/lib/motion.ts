// Shared motion tokens (see ../docs/design-system.md, "Movimiento"). Every framer-motion
// animation on the site uses these values so the whole interface shares one rhythm.

/** Durations in seconds: fast for feedback, base for state changes, slow for entrances. */
export const duration = { fast: 0.15, base: 0.25, slow: 0.45 } as const;

/** Default spring for interactive elements (nav pill, press, pop-ins, dialogs). */
export const spring = { type: "spring", stiffness: 380, damping: 32 } as const;

/** Delay between items of a staggered list or grid. */
export const stagger = 0.04;

/** Deceleration curve for arrivals (matches --ease-out-soft in globals.css). */
export const easeOut = [0.22, 1, 0.36, 1] as const;

/** Acceleration curve for departures. */
export const easeIn = [0.4, 0, 1, 1] as const;

const EXIT_RATIO = 0.65;
const STAGGER_CAP = 12;

/** Exits are shorter than entrances (~65%) so the interface feels responsive. */
export function exitDuration(enter: number): number {
  return enter * EXIT_RATIO;
}

/** Stagger delay for the item at `index`, capped so long grids never keep people waiting. */
export function staggerDelay(index: number): number {
  return Math.min(Math.max(index, 0), STAGGER_CAP) * stagger;
}

/** Scroll reveals fire once, slightly before the element is fully on screen. */
export const revealViewport = { once: true, amount: 0.2, margin: "0px 0px -8% 0px" } as const;
