/**
 * Cloudinary delivery URLs for next/image (spec 012, ADR-026). Pure, so it is unit tested.
 *
 * Photos are requested with automatic format and quality and `c_limit`, so Cloudinary never
 * enlarges them: asking for 1920 px of a 547 px photo returns 547 px. The loaders are passed per
 * component (`loader` prop) only for Cloudinary sources; every other image keeps Next's default.
 */

const UPLOAD_PREFIX = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/;

/** Every transformation this module produces starts like this, which makes rebuilding idempotent. */
const OWN_TRANSFORMATION = /^f_auto,q_auto[:,]/;

const VERSION = /^v\d+$/;

/** Cloudinary transformation parameter keys, so a folder like `my_folder` is not taken for one. */
const TRANSFORMATION_KEYS = new Set([
  "a", "ac", "af", "ar", "b", "bo", "br", "c", "co", "cs", "d", "dl", "dn", "dpr", "du", "e", "eo",
  "f", "fl", "fn", "fps", "g", "h", "if", "ki", "l", "o", "p", "pg", "q", "r", "so", "sp", "t", "u",
  "vc", "vs", "w", "x", "y", "z",
]);

function isTransformation(component: string): boolean {
  if (component === "" || VERSION.test(component)) return false;
  return component.split(",").every((part) => {
    const separator = part.indexOf("_");
    if (separator <= 0) return false;
    const key = part.slice(0, separator);
    return TRANSFORMATION_KEYS.has(key) || key.startsWith("$");
  });
}

export function isCloudinaryUrl(src: string): boolean {
  return UPLOAD_PREFIX.test(src);
}

/** SVG sources scale without losing sharpness. */
export function isVectorSource(src: string): boolean {
  return /\.svg$/i.test(src.split(/[?#]/)[0]);
}

const px = (width: number) => Math.max(1, Math.round(width));

/** The photo itself: automatic format, good automatic quality, never enlarged, exact width. */
export function photoTransformation(width: number): string {
  return `f_auto,q_auto:good,c_limit,w_${px(width)},dpr_1`;
}

/** The backdrop behind a contained photo: tiny, low quality and already blurred. */
export function blurTransformation(width: number): string {
  return `f_auto,q_auto:low,c_limit,w_${px(width)},e_blur:400`;
}

/**
 * Inserts `transformation` into a Cloudinary upload URL: after any transformation already in the
 * URL (they apply first), before the version and the public id (folders included). If the last
 * transformation is one of ours, it is replaced instead of stacked. Other URLs are returned as is.
 */
export function cloudinaryUrl(src: string, transformation: string): string {
  const match = UPLOAD_PREFIX.exec(src);
  if (!match) return src;
  const [, prefix, rest] = match;
  const components = rest.split("/");

  // With a version, everything before it is a transformation; without one, use the key list.
  const versionAt = components.findIndex((component) => VERSION.test(component));
  let transformationCount = 0;
  if (versionAt >= 0) {
    transformationCount = versionAt;
  } else {
    while (transformationCount < components.length - 1 && isTransformation(components[transformationCount])) {
      transformationCount += 1;
    }
  }

  const transformations = components.slice(0, transformationCount);
  if (transformations.length > 0 && OWN_TRANSFORMATION.test(transformations[transformations.length - 1])) {
    transformations.pop();
  }
  return prefix + [...transformations, transformation, ...components.slice(transformationCount)].join("/");
}

type LoaderArgs = { src: string; width: number; quality?: number };

/** next/image loader for Cloudinary photos (one URL per srcset width). */
export function cloudinaryPhotoLoader({ src, width }: LoaderArgs): string {
  return cloudinaryUrl(src, photoTransformation(width));
}

/** next/image loader for the blurred backdrop of a contained Cloudinary photo. */
export function cloudinaryBlurLoader({ src, width }: LoaderArgs): string {
  return cloudinaryUrl(src, blurTransformation(width));
}
