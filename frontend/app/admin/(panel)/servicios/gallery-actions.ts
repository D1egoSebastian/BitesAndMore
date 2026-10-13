"use server";

import { failure, success, type FormState } from "@/lib/admin/form-state";
import { refreshPublicSite, runAdminAction } from "@/lib/admin/run";
import type { ServiceImage } from "@/lib/api/types";

// Server Actions of the service gallery (spec 011). Each one verifies the session through
// runAdminAction (a 401 ends it) and refreshes the public pages after a successful change.

export type GalleryResult<T = undefined> = { ok: true; data: T } | { ok: false; message: string };

const MAX_URL_LENGTH = 2048;
const MAX_CAPTION_LENGTH = 200;
const INVALID_REQUEST = "No pudimos procesar la solicitud. Recarga la página e inténtalo otra vez.";

function isId(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function cleanCaption(caption: unknown): string | null | undefined {
  if (caption === null || caption === undefined) return null;
  if (typeof caption !== "string") return undefined;
  const trimmed = caption.trim();
  if (trimmed.length > MAX_CAPTION_LENGTH) return undefined;
  return trimmed || null;
}

/** Adds an already uploaded photo (URL from uploadImage) at the end of the gallery. */
export async function addServiceImageAction(
  serviceId: number,
  url: string,
): Promise<GalleryResult<ServiceImage>> {
  const cleanUrl = typeof url === "string" ? url.trim() : "";
  if (!isId(serviceId) || !cleanUrl || cleanUrl.length > MAX_URL_LENGTH) {
    return { ok: false, message: INVALID_REQUEST };
  }

  const result = await runAdminAction((api) => api.addServiceImage(serviceId, { url: cleanUrl, caption: null }));
  if (!result.ok) return { ok: false, message: result.message };

  refreshPublicSite();
  return { ok: true, data: result.data };
}

/** Changes the caption of one photo; a blank caption removes it. */
export async function updateServiceImageCaptionAction(
  serviceId: number,
  imageId: number,
  caption: string | null,
): Promise<GalleryResult<ServiceImage>> {
  const clean = cleanCaption(caption);
  if (!isId(serviceId) || !isId(imageId)) return { ok: false, message: INVALID_REQUEST };
  if (clean === undefined) {
    return { ok: false, message: `El pie de foto admite hasta ${MAX_CAPTION_LENGTH} caracteres.` };
  }

  const result = await runAdminAction((api) => api.updateServiceImageCaption(serviceId, imageId, clean));
  if (!result.ok) return { ok: false, message: result.message };

  refreshPublicSite();
  return { ok: true, data: result.data };
}

/** Removes one photo from the gallery (the file stays in Cloudinary, as with replaced covers). */
export async function deleteServiceImageAction(serviceId: number, imageId: number): Promise<FormState> {
  if (!isId(serviceId) || !isId(imageId)) return failure(INVALID_REQUEST);

  const result = await runAdminAction((api) => api.deleteServiceImage(serviceId, imageId));
  if (!result.ok) return failure(result.message);

  refreshPublicSite();
  return success("Eliminamos la foto de la galería.");
}

/** Saves the new order. imageIds must list every photo of the service exactly once. */
export async function reorderServiceImagesAction(serviceId: number, imageIds: number[]): Promise<GalleryResult> {
  if (!isId(serviceId) || !Array.isArray(imageIds) || !imageIds.every(isId)) {
    return { ok: false, message: INVALID_REQUEST };
  }

  const result = await runAdminAction((api) => api.reorderServiceImages(serviceId, imageIds));
  if (!result.ok) return { ok: false, message: result.message };

  refreshPublicSite();
  return { ok: true, data: undefined };
}
