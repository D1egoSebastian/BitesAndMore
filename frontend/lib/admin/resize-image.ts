// Browser-only helper (spec 012): keep uploads as close to the original as the 4 MB Server Action
// limit allows. The sizing decisions are pure and tested in image-size.ts.

import { UPLOAD_BYTE_BUDGET, planUpload } from "./image-size";

function encodeJpeg(bitmap: ImageBitmap, width: number, height: number, quality: number): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return Promise.resolve(null);
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, width, height);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

/**
 * Returns the file untouched when it fits the upload budget and its long side is at most 2560 px.
 * Otherwise re-encodes it as JPEG: 2560 px at quality 0.9 first, lowering quality and then size
 * only while it is still over the budget. EXIF orientation is applied while decoding, so the
 * re-encoded photo (which has no EXIF) keeps the right way up. If the browser cannot decode the
 * file (e.g. HEIC), the original is uploaded and the server decides.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  if (typeof createImageBitmap !== "function") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  try {
    const attempts = planUpload({ width: bitmap.width, height: bitmap.height, bytes: file.size });
    if (!attempts) return file;

    let best: Blob | null = null;
    for (const { width, height, quality } of attempts) {
      const blob = await encodeJpeg(bitmap, width, height, quality);
      if (!blob) continue;
      best = blob;
      if (blob.size <= UPLOAD_BYTE_BUDGET) break;
    }
    if (!best) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([best], name, { type: "image/jpeg" });
  } finally {
    bitmap.close();
  }
}
