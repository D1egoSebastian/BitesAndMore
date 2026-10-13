/**
 * Upload sizing and the "small photo" hint of the admin panel (spec 012, ADR-026).
 * Pure, so it is unit tested; the browser-only part lives in resize-image.ts.
 */

/** Room under the 4 MB Server Action body limit (next.config.ts) for the multipart overhead. */
export const UPLOAD_BYTE_BUDGET = 3.5 * 1024 * 1024;

/** Larger photos add weight without visible gain on the site (the widest frame is about 1440 px at 2x). */
export const MAX_LONG_SIDE = 2560;

/** Below these long sides the panel suggests a larger photo; the upload still goes ahead. */
export const PRODUCT_MIN_LONG_SIDE = 1000;
export const SERVICE_MIN_LONG_SIDE = 1600;

export type EncodeAttempt = { width: number; height: number; quality: number };

/** Tried in order until the JPEG fits the budget: best quality first, then lower quality, then smaller. */
const ATTEMPTS: ReadonlyArray<{ longSide: number; quality: number }> = [
  { longSide: MAX_LONG_SIDE, quality: 0.9 },
  { longSide: MAX_LONG_SIDE, quality: 0.82 },
  { longSide: 2048, quality: 0.82 },
  { longSide: 1600, quality: 0.8 },
];

const isPositive = (value: number) => Number.isFinite(value) && value > 0;

/**
 * Null when the original file can be uploaded untouched (fits the budget and is not larger than
 * 2560 px). Otherwise the re-encoding attempts, never enlarging the photo and without repeats.
 */
export function planUpload({ width, height, bytes }: { width: number; height: number; bytes: number }): EncodeAttempt[] | null {
  if (!isPositive(width) || !isPositive(height)) return null;
  const longSide = Math.max(width, height);
  if (bytes <= UPLOAD_BYTE_BUDGET && longSide <= MAX_LONG_SIDE) return null;

  const attempts: EncodeAttempt[] = [];
  for (const { longSide: target, quality } of ATTEMPTS) {
    const scale = Math.min(1, target / longSide);
    const attempt = { width: Math.round(width * scale), height: Math.round(height * scale), quality };
    const repeated = attempts.some(
      (other) => other.width === attempt.width && other.height === attempt.height && other.quality === attempt.quality,
    );
    if (!repeated) attempts.push(attempt);
  }
  return attempts;
}

/** Friendly, non-blocking hint shown next to the preview when a photo is small. */
export function photoSizeWarning({
  width,
  height,
  minLongSide,
}: {
  width: number;
  height: number;
  minLongSide: number;
}): string | null {
  if (!isPositive(width) || !isPositive(height)) return null;
  if (Math.max(width, height) >= minLongSide) return null;
  const side = height > width ? "de alto" : "de ancho";
  return `Esta foto es pequeña (${width} × ${height} px). Se verá más nítida una de al menos ${minLongSide} px ${side}.`;
}
