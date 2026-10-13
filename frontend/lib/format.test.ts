import { describe, expect, it } from "vitest";
import { displayPrice, displayText } from "./format";

describe("displayPrice", () => {
  it("shows free-text prices exactly as the API returns them", () => {
    expect(displayPrice("RD$1,800")).toBe("RD$1,800");
    expect(displayPrice("Desde RD$350")).toBe("Desde RD$350");
    expect(displayPrice("Precio a consultar")).toBe("Precio a consultar");
  });

  it("only trims surrounding whitespace", () => {
    expect(displayPrice("  RD$ 1.800,00  ")).toBe("RD$ 1.800,00");
  });

  it("returns null when there is no price to show", () => {
    expect(displayPrice(null)).toBeNull();
    expect(displayPrice(undefined)).toBeNull();
    expect(displayPrice("   ")).toBeNull();
  });
});

describe("displayText", () => {
  it("returns trimmed text or null when blank", () => {
    expect(displayText("  Hola ")).toBe("Hola");
    expect(displayText("")).toBeNull();
    expect(displayText(null)).toBeNull();
  });
});
