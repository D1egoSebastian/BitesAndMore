"use server";

import { readText } from "@/lib/admin/form-data";
import { failure, success, type FormState } from "@/lib/admin/form-state";
import { refreshPublicSite, runAdminAction } from "@/lib/admin/run";
import type { BusinessInfoInput } from "@/lib/api/types";
import { normalizeWhatsAppNumber } from "@/lib/contact";

/** PUT /api/businessinfo replaces every field, so the whole form is always sent. */
export async function saveBusinessInfo(_previous: FormState, formData: FormData): Promise<FormState> {
  const whatsApp = normalizeWhatsAppNumber(readText(formData, "whatsAppNumber"));
  if (!whatsApp.ok) {
    return failure("Escribe el número de WhatsApp completo, con el código de país. Ej: 18091234567");
  }

  const input: BusinessInfoInput = {
    businessName: readText(formData, "businessName"),
    mission: readText(formData, "mission"),
    vision: readText(formData, "vision"),
    phoneNumber: readText(formData, "phoneNumber"),
    whatsAppNumber: whatsApp.value,
    address: readText(formData, "address"),
    instagram: readText(formData, "instagram"),
    facebook: readText(formData, "facebook"),
  };

  const result = await runAdminAction((api) => api.updateBusinessInfo(input));
  if (!result.ok) return failure(result.message);

  refreshPublicSite();
  return success("Guardamos los datos del negocio.");
}
