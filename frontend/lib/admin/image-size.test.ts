import { describe, expect, it } from "vitest";
import {
  MAX_LONG_SIDE,
  PRODUCT_MIN_LONG_SIDE,
  SERVICE_MIN_LONG_SIDE,
  UPLOAD_BYTE_BUDGET,
  photoSizeWarning,
  planUpload,
} from "./image-size";

const MB = 1024 * 1024;

describe("planUpload", () => {
  it("keeps the original when it fits the budget and is not too large", () => {
    expect(planUpload({ width: 2000, height: 1500, bytes: 2 * MB })).toBeNull();
    expect(planUpload({ width: MAX_LONG_SIDE, height: 1440, bytes: UPLOAD_BYTE_BUDGET })).toBeNull();
  });

  it("budget leaves room under the 4 MB Server Action limit", () => {
    expect(UPLOAD_BYTE_BUDGET).toBeLessThan(4 * MB);
  });

  it("downscales a heavy phone photo to 2560 px at quality 0.9 first", () => {
    const attempts = planUpload({ width: 4032, height: 3024, bytes: 5 * MB });
    expect(attempts?.[0]).toEqual({ width: 2560, height: 1920, quality: 0.9 });
  });

  it("steps down quality, then size, only as later attempts", () => {
    expect(planUpload({ width: 4032, height: 3024, bytes: 5 * MB })).toEqual([
      { width: 2560, height: 1920, quality: 0.9 },
      { width: 2560, height: 1920, quality: 0.82 },
      { width: 2048, height: 1536, quality: 0.82 },
      { width: 1600, height: 1200, quality: 0.8 },
    ]);
  });

  it("processes a light photo whose long side exceeds 2560 px", () => {
    expect(planUpload({ width: 3000, height: 6000, bytes: 1 * MB })?.[0]).toEqual({ width: 1280, height: 2560, quality: 0.9 });
  });

  it("never upscales a heavy photo that is already small, and never repeats an attempt", () => {
    // A 1200 x 900 PNG that weighs 6 MB: re-encode at its own size.
    expect(planUpload({ width: 1200, height: 900, bytes: 6 * MB })).toEqual([
      { width: 1200, height: 900, quality: 0.9 },
      { width: 1200, height: 900, quality: 0.82 },
      { width: 1200, height: 900, quality: 0.8 },
    ]);
  });

  it("does nothing with invalid dimensions", () => {
    expect(planUpload({ width: 0, height: 0, bytes: 9 * MB })).toBeNull();
  });
});

describe("photoSizeWarning", () => {
  it("warns about a small landscape service photo", () => {
    expect(photoSizeWarning({ width: 547, height: 365, minLongSide: SERVICE_MIN_LONG_SIDE })).toBe(
      "Esta foto es pequeña (547 × 365 px). Se verá más nítida una de al menos 1600 px de ancho.",
    );
  });

  it("speaks of height for a portrait photo", () => {
    expect(photoSizeWarning({ width: 600, height: 800, minLongSide: PRODUCT_MIN_LONG_SIDE })).toBe(
      "Esta foto es pequeña (600 × 800 px). Se verá más nítida una de al menos 1000 px de alto.",
    );
  });

  it("is silent at or above the threshold", () => {
    expect(photoSizeWarning({ width: 1600, height: 900, minLongSide: SERVICE_MIN_LONG_SIDE })).toBeNull();
    expect(photoSizeWarning({ width: 800, height: 1000, minLongSide: PRODUCT_MIN_LONG_SIDE })).toBeNull();
  });

  it("uses the product threshold for products", () => {
    expect(photoSizeWarning({ width: 554, height: 554, minLongSide: PRODUCT_MIN_LONG_SIDE })).toBe(
      "Esta foto es pequeña (554 × 554 px). Se verá más nítida una de al menos 1000 px de ancho.",
    );
  });

  it("is silent when the size is unknown", () => {
    expect(photoSizeWarning({ width: 0, height: 0, minLongSide: SERVICE_MIN_LONG_SIDE })).toBeNull();
  });
});
