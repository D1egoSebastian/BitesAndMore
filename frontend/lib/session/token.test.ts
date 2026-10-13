import { describe, expect, it } from "vitest";
import { isTokenExpired } from "./token";

function makeJwt(payload: Record<string, unknown>): string {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.signature`;
}

describe("isTokenExpired", () => {
  const now = new Date("2026-10-06T12:00:00Z");
  const nowSeconds = Math.floor(now.getTime() / 1000);

  it("is false while exp is in the future", () => {
    expect(isTokenExpired(makeJwt({ exp: nowSeconds + 3600 }), now)).toBe(false);
  });

  it("is true once exp has passed", () => {
    expect(isTokenExpired(makeJwt({ exp: nowSeconds - 1 }), now)).toBe(true);
  });

  it("treats malformed tokens or tokens without exp as expired", () => {
    expect(isTokenExpired("not-a-jwt", now)).toBe(true);
    expect(isTokenExpired(makeJwt({ sub: "1" }), now)).toBe(true);
    expect(isTokenExpired("", now)).toBe(true);
  });
});
