"use server";

import { ApiError } from "@/lib/api/errors";
import { failure, success, type FormState } from "@/lib/admin/form-state";
import { runAdminAction } from "@/lib/admin/run";

const MIN_PASSWORD_LENGTH = 8;

function readPassword(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function changePassword(_previous: FormState, formData: FormData): Promise<FormState> {
  const currentPassword = readPassword(formData, "currentPassword");
  const newPassword = readPassword(formData, "newPassword");
  const confirmPassword = readPassword(formData, "confirmPassword");

  if (!currentPassword) return failure("Escribe tu contraseña actual.");
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return failure("La nueva contraseña debe tener al menos 8 caracteres.");
  }
  if (newPassword !== confirmPassword) return failure("La confirmación no coincide con la nueva contraseña.");

  // An expired session is detected before calling the API, so a 401 here can only mean
  // the current password is wrong (FR-007-11).
  const result = await runAdminAction((api) => api.changePassword(currentPassword, newPassword), {
    unauthorizedIsError: true,
  });

  if (!result.ok) {
    if (result.error instanceof ApiError && result.error.isUnauthorized) {
      return failure("La contraseña actual no es correcta.");
    }
    return failure(result.message);
  }

  return success("Contraseña actualizada. Úsala la próxima vez que inicies sesión.");
}
