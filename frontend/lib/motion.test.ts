import { describe, expect, it } from "vitest";
import { duration, exitDuration, spring, stagger, staggerDelay } from "./motion";

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
