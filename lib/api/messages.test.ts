import { describe, expect, it } from "vitest";
import { ApiError } from "./errors";
import { toUserMessage } from "./messages";

describe("toUserMessage", () => {
  it("translates known API duplicate messages to Spanish", () => {
    expect(toUserMessage(new ApiError(400, "that product already exist!"))).toBe(
      "Ya existe un producto con ese nombre.",
    );
    expect(toUserMessage(new ApiError(400, "that category already exist!"))).toBe(
      "Ya existe una categoría con ese nombre.",
    );
    expect(toUserMessage(new ApiError(400, "that service already exist"))).toBe(
      "Ya existe un servicio con ese nombre.",
    );
  });

  it("translates the change-password validation messages", () => {
    expect(
      toUserMessage(new ApiError(400, "the new password must be at least 8 characters long")),
    ).toBe("La nueva contraseña debe tener al menos 8 caracteres.");
    expect(
      toUserMessage(new ApiError(400, "the new password must be different from the current one")),
    ).toBe("La nueva contraseña debe ser distinta de la actual.");
  });

  it("falls back to the raw API message for unknown 400 messages", () => {
    expect(toUserMessage(new ApiError(400, "Invalid image file"))).toBe("Invalid image file");
  });

  it("explains network failures and server errors without apologizing", () => {
    expect(toUserMessage(new ApiError(0, null))).toMatch(/No pudimos conectar/);
    expect(toUserMessage(new ApiError(500, null))).toMatch(/servidor/);
  });

  it("explains 404s", () => {
    expect(toUserMessage(new ApiError(404, "product not found"))).toMatch(/ya no existe/i);
  });

  it("handles unexpected non-API errors", () => {
    expect(toUserMessage(new Error("x"))).toMatch(/No pudimos completar/);
  });
});
