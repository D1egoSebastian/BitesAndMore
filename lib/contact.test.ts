import { describe, expect, it } from "vitest";
import { buildSocialUrl, buildWhatsAppContactUrl, normalizeWhatsAppNumber } from "./contact";

describe("normalizeWhatsAppNumber", () => {
  it("keeps only digits", () => {
    expect(normalizeWhatsAppNumber("+1 (809) 123-4567")).toEqual({ ok: true, value: "18091234567" });
  });

  it("accepts an empty value as 'no number'", () => {
    expect(normalizeWhatsAppNumber(null)).toEqual({ ok: true, value: null });
    expect(normalizeWhatsAppNumber("  ")).toEqual({ ok: true, value: null });
  });

  it("rejects numbers too short to include a country code", () => {
    expect(normalizeWhatsAppNumber("1234567")).toEqual({ ok: false });
  });

  it("rejects text without digits", () => {
    expect(normalizeWhatsAppNumber("pronto")).toEqual({ ok: false });
  });
});

describe("buildWhatsAppContactUrl", () => {
  it("keeps only the digits of the configured number", () => {
    expect(buildWhatsAppContactUrl("+1 (809) 123-4567")).toBe("https://wa.me/18091234567");
  });

  it("returns null when the number is missing or has no digits", () => {
    expect(buildWhatsAppContactUrl(null)).toBeNull();
    expect(buildWhatsAppContactUrl(undefined)).toBeNull();
    expect(buildWhatsAppContactUrl("")).toBeNull();
    expect(buildWhatsAppContactUrl("   ")).toBeNull();
    expect(buildWhatsAppContactUrl("sin número")).toBeNull();
  });

  it("can prefill a message", () => {
    expect(buildWhatsAppContactUrl("18091234567", "Hola! Quiero hacer un pedido")).toBe(
      "https://wa.me/18091234567?text=Hola!%20Quiero%20hacer%20un%20pedido",
    );
  });
});

describe("buildSocialUrl", () => {
  it("builds a profile URL from a handle, with or without @", () => {
    expect(buildSocialUrl("instagram", "@bitesandmore")).toBe("https://www.instagram.com/bitesandmore");
    expect(buildSocialUrl("facebook", "bitesandmore")).toBe("https://www.facebook.com/bitesandmore");
  });

  it("keeps full https URLs as they are", () => {
    expect(buildSocialUrl("instagram", "https://instagram.com/bites")).toBe("https://instagram.com/bites");
  });

  it("returns null for empty values", () => {
    expect(buildSocialUrl("instagram", null)).toBeNull();
    expect(buildSocialUrl("facebook", "  ")).toBeNull();
    expect(buildSocialUrl("facebook", "@")).toBeNull();
  });

  it("rejects non-http schemes", () => {
    expect(buildSocialUrl("facebook", "javascript:alert(1)")).toBeNull();
  });
});
