import { describe, expect, it } from "vitest";
import { dessertKindOf, PASTEL_TONES, toneForCategory, toneForServiceType } from "./tones";

describe("toneForCategory", () => {
  it("assigns the four pastel tones to the first four categories in order", () => {
    expect([1, 2, 3, 4].map(toneForCategory)).toEqual(["blush", "butter", "sage", "lilac"]);
  });

  it("cycles through the tones for later categories", () => {
    expect(toneForCategory(5)).toBe("blush");
    expect(toneForCategory(8)).toBe("lilac");
  });

  it("is stable for the same id", () => {
    expect(toneForCategory(7)).toBe(toneForCategory(7));
  });

  it("falls back to sugar when there is no valid category", () => {
    expect(toneForCategory(null)).toBe("sugar");
    expect(toneForCategory(undefined)).toBe("sugar");
    expect(toneForCategory(0)).toBe("sugar");
    expect(toneForCategory(Number.NaN)).toBe("sugar");
  });

  it("only ever returns a known tone", () => {
    for (let id = 1; id <= 20; id += 1) {
      expect(PASTEL_TONES).toContain(toneForCategory(id));
    }
  });
});

describe("toneForServiceType", () => {
  it("gives each service type its own tone", () => {
    expect(toneForServiceType("Reposteria")).toBe("blush");
    expect(toneForServiceType("EventsPlanner")).toBe("butter");
    expect(toneForServiceType("DesayunosPersonalizados")).toBe("sage");
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
