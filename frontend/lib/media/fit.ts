/**
 * Adaptive fit for photos in fixed-aspect frames (spec 012, ADR-026). Pure, so it is unit tested.
 *
 * "cover" fills the frame (cropping a little); "contain" shows the whole photo, centered, never
 * enlarged beyond what still looks sharp, over a blurred copy of itself.
 */

/** Cover only when the aspect ratios differ by at most 20 %: at most 1/6 of the photo is cropped. */
export const ASPECT_TOLERANCE = 0.2;

/** Cover only when the photo has at least 75 % of the device pixels the frame needs (max 1.33x upscale). */
export const MIN_COVER_RESOLUTION = 0.75;

/** Screens denser than 2x are judged like 2x: the difference is not visible at reading distance. */
export const DPR_CAP = 2;

/** In contain mode a photo is never shown larger than 1.25x its natural size in CSS pixels... */
export const MAX_CONTAIN_CSS_SCALE = 1.25;

/** ...nor with more than 2 device pixels per photo pixel. */
export const MAX_CONTAIN_DEVICE_SCALE = 2;

export type Fit = "cover" | "contain";

export type FitInput = {
  /** Natural size of the loaded photo, in image pixels. */
  imageW: number;
  imageH: number;
  /** Size of the frame, in CSS pixels. */
  frameW: number;
  frameH: number;
  /** window.devicePixelRatio. */
  dpr: number;
  /** SVG: scales without losing sharpness, so only the aspect ratio matters. */
  vector?: boolean;
};

const isPositive = (value: number) => Number.isFinite(value) && value > 0;

function validSizes({ imageW, imageH, frameW, frameH }: FitInput): boolean {
  return isPositive(imageW) && isPositive(imageH) && isPositive(frameW) && isPositive(frameH);
}

function effectiveDpr(dpr: number): number {
  return isPositive(dpr) ? dpr : 1;
}

export function chooseFit(input: FitInput): Fit {
  if (!validSizes(input)) return "contain";
  const { imageW, imageH, frameW, frameH, vector } = input;

  const imageAspect = imageW / imageH;
  const frameAspect = frameW / frameH;
  const aspectGap = Math.max(imageAspect, frameAspect) / Math.min(imageAspect, frameAspect) - 1;
  if (aspectGap > ASPECT_TOLERANCE + 1e-9) return "contain";
  if (vector) return "cover";

  const dpr = Math.min(effectiveDpr(input.dpr), DPR_CAP);
  // Covering scales the photo by the larger of the two ratios: the smaller share is the binding axis.
  const resolution = Math.min(imageW / (frameW * dpr), imageH / (frameH * dpr));
  return resolution >= MIN_COVER_RESOLUTION - 1e-9 ? "cover" : "contain";
}

/** Size in CSS pixels of the photo in contain mode: whole, inside the frame, never over-enlarged. */
export function containBox(input: FitInput): { width: number; height: number } {
  const { imageW, imageH, frameW, frameH, vector } = input;
  if (!validSizes(input)) {
    return { width: Math.max(0, Math.round(frameW) || 0), height: Math.max(0, Math.round(frameH) || 0) };
  }

  let scale = Math.min(frameW / imageW, frameH / imageH);
  if (!vector) {
    scale = Math.min(scale, MAX_CONTAIN_CSS_SCALE, MAX_CONTAIN_DEVICE_SCALE / effectiveDpr(input.dpr));
  }
  return { width: Math.round(imageW * scale), height: Math.round(imageH * scale) };
}
