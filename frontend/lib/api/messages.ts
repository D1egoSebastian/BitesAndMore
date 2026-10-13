import { ApiError } from "./errors";

// The backend writes its validation messages in English; the admin panel speaks Spanish.
const KNOWN_API_MESSAGES: Record<string, string> = {
  "that product already exist!": "Ya existe un producto con ese nombre.",
  "that category already exist!": "Ya existe una categoría con ese nombre.",
  "that service already exist": "Ya existe un servicio con ese nombre.",
  "product not found": "Este producto ya no existe. Recarga la lista para ver los datos actuales.",
  "the new password must be at least 8 characters long": "La nueva contraseña debe tener al menos 8 caracteres.",
  "the new password must be different from the current one": "La nueva contraseña debe ser distinta de la actual.",
  "no file provided": "Elige una imagen antes de subirla.",
  "the image url is required": "Elige una foto antes de agregarla.",
  "a service can have at most 12 images": "La galería ya tiene 12 fotos, el máximo. Elimina alguna para agregar otra.",
  "the order must list each image of the service exactly once":
    "La galería cambió mientras la ordenabas. Recarga la página e inténtalo otra vez.",
  "image not found": "Esta foto ya no existe. Recarga la página para ver la galería actual.",
};

/** Turns any thrown value into a Spanish message that explains what happened. */
export function toUserMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "No pudimos completar la acción. Revisa los datos e inténtalo otra vez.";
  }

  const known = error.apiMessage ? KNOWN_API_MESSAGES[error.apiMessage.trim()] : undefined;
  if (known) return known;

  if (error.isNetworkError) {
    return "No pudimos conectar con el servidor. Comprueba tu conexión e inténtalo otra vez en unos segundos.";
  }
  if (error.isUnauthorized) return "Tu sesión terminó. Inicia sesión de nuevo para continuar.";
  if (error.isNotFound) return "Este elemento ya no existe. Recarga la página para ver los datos actuales.";
  if (error.status === 400 && error.apiMessage) return error.apiMessage;
  if (error.status >= 500) {
    return "El servidor tuvo un problema al procesar la solicitud. Inténtalo otra vez en unos minutos.";
  }
  return "No pudimos completar la acción. Revisa los datos e inténtalo otra vez.";
}
