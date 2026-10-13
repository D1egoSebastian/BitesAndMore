"use server";

import { redirect } from "next/navigation";
import type { UploadResult } from "@/lib/admin/form-state";
import { runAdminAction } from "@/lib/admin/run";
import { clearSessionToken, LOGIN_PATH } from "@/lib/session/server";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export async function logout(): Promise<void> {
  await clearSessionToken();
  redirect(LOGIN_PATH);
}

/** Forwards the image to POST /api/upload (multipart, field "file") and returns the Cloudinary URL. */
export async function uploadImage(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Elige una imagen antes de subirla." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, message: "El archivo no es una imagen. Usa una foto en JPG, PNG o WebP." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, message: "La imagen pesa más de 4 MB. Elige una foto más liviana." };
  }

  const result = await runAdminAction((api) => api.uploadImage(file, file.name || "imagen.jpg"));
  return result.ok ? { ok: true, url: result.data } : { ok: false, message: result.message };
}
