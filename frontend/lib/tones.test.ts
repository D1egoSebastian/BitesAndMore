import { describe, expect, it } from "vitest";
import { dessertKindOf, PASTEL_TONES, toneForCategory, toneForServiceType } from "./tones";

describe("toneForCategory", () => {
  it("assigns the four pastel tones to the first four categories in order", () => {
    expect([1, 2, 3, 4].map(toneForCategory)).toEqual(["rose-tint", "caramel-tint", "sand-tint", "sand-tint-deep"]);
  });

  it("cycles through the tones for later categories", () => {
    expect(toneForCategory(5)).toBe("rose-tint");
    expect(toneForCategory(8)).toBe("sand-tint-deep");
  });

  it("is stable for the same id", () => {
    expect(toneForCategory(7)).toBe(toneForCategory(7));
  });

  it("falls back to the sand surface when there is no valid category", () => {
    expect(toneForCategory(null)).toBe("surface");
    expect(toneForCategory(undefined)).toBe("surface");
    expect(toneForCategory(0)).toBe("surface");
    expect(toneForCategory(Number.NaN)).toBe("surface");
  });

  it("only ever returns a known tone", () => {
    for (let id = 1; id <= 20; id += 1) {
      expect(PASTEL_TONES).toContain(toneForCategory(id));
    }
  });
});

describe("toneForServiceType", () => {
  it("gives each service type its own tone", () => {
    expect(toneForServiceType("Reposteria")).toBe("rose-tint");
    expect(toneForServiceType("EventsPlanner")).toBe("caramel-tint");
    expect(toneForServiceType("DesayunosPersonalizados")).toBe("sand-tint");
  });
});

describe("dessertKindOf", () => {
  it("recognizes the illustration from the category name, ignoring case and accents", () => {
    expect(dessertKindOf("Pasteles")).toBe("cake");
    expect(dessertKindOf("Cupcakes")).toBe("cupcake");
    expect(dessertKindOf("GALLETAS")).toBe("cookie");
    expect(dessertKindOf("Postres individuales")).toBe("flan");
  });

  it("falls back to the cake for unknown or missing names", () => {
    expect(dessertKindOf("Bebidas")).toBe("cake");
    expect(dessertKindOf(null)).toBe("cake");
    expect(dessertKindOf("")).toBe("cake");
  });
});
