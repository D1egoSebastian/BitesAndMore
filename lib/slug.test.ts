import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases, removes accents and joins words with hyphens", () => {
    expect(slugify("Postres Individuales")).toBe("postres-individuales");
    expect(slugify("Repostería fina")).toBe("reposteria-fina");
    expect(slugify("  Niño & Café  ")).toBe("nino-cafe");
  });

  it("returns an empty string for null or symbol-only input", () => {
    expect(slugify(null)).toBe("");
    expect(slugify("¡¿?!")).toBe("");
  });
});
