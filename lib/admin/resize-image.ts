// Browser-only helper: phone photos are often larger than the 4 MB Server Action limit.

const MAX_BYTES = 3.5 * 1024 * 1024;
const MAX_DIMENSION = 2000;

/** Returns the file untouched when it is small enough; otherwise a JPEG no wider/taller than 2000 px. */
export async function prepareImageForUpload(file: File): Promise<File> {
  if (file.size <= MAX_BYTES || typeof createImageBitmap !== "function") return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return file;
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) return file;

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}
