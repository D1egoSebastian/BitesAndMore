import { describe, expect, it } from "vitest";
import {
  duration,
  easeOut,
  exitDuration,
  reveal,
  revealTransition,
  scrollStagger,
  scrollStaggerDelay,
  spring,
  stagger,
  staggerDelay,
} from "./motion";

describe("motion tokens", () => {
  it("defines the shared durations, spring and stagger", () => {
    expect(duration).toEqual({ fast: 0.15, base: 0.25, slow: 0.45 });
    expect(spring).toEqual({ type: "spring", stiffness: 380, damping: 32 });
    expect(stagger).toBe(0.04);
  });
});

describe("exitDuration", () => {
  it("makes exits about 65% of the enter duration", () => {
    expect(exitDuration(duration.base)).toBeCloseTo(0.1625);
    expect(exitDuration(duration.slow)).toBeCloseTo(0.2925);
  });
});

describe("staggerDelay", () => {
  it("delays each item by one stagger step", () => {
    expect(staggerDelay(0)).toBe(0);
    expect(staggerDelay(3)).toBeCloseTo(0.12);
  });

  it("caps long lists so the last items do not wait too long", () => {
    expect(staggerDelay(40)).toBeCloseTo(staggerDelay(12));
  });
});

describe("scroll reveal tokens", () => {
  it("rises 16 px over about 0.6 s", () => {
    expect(reveal).toEqual({ rise: 16, duration: 0.6 });
  });

  it("staggers scroll-revealed items 60 to 80 ms apart", () => {
    expect(scrollStagger).toBeGreaterThanOrEqual(0.06);
    expect(scrollStagger).toBeLessThanOrEqual(0.08);
  });
});

describe("scrollStaggerDelay", () => {
  it("delays each scroll-revealed item by one scroll stagger step", () => {
    expect(scrollStaggerDelay(0)).toBe(0);
    expect(scrollStaggerDelay(2)).toBeCloseTo(0.14);
  });

  it("ignores negative indexes and caps long grids like staggerDelay", () => {
    expect(scrollStaggerDelay(-1)).toBe(0);
    expect(scrollStaggerDelay(40)).toBeCloseTo(scrollStaggerDelay(12));
  });
});

describe("revealTransition", () => {
  it("eases the reveal over the reveal duration after its delay", () => {
    expect(revealTransition({ reduceMotion: false, delay: 0.08 })).toEqual({
      duration: 0.6,
      ease: easeOut,
      delay: 0.08,
    });
  });

  it("defaults to no delay", () => {
    expect(revealTransition({ reduceMotion: false })).toMatchObject({ duration: 0.6, delay: 0 });
  });

  it("is instant with reduced motion, whatever the delay", () => {
    expect(revealTransition({ reduceMotion: true, delay: 0.3 })).toMatchObject({ duration: 0, delay: 0 });
  });
});
