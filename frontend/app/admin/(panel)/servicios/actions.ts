"use server";

import { readId, readText } from "@/lib/admin/form-data";
import { failure, success, type FormState } from "@/lib/admin/form-state";
import { refreshPublicSite, runAdminAction } from "@/lib/admin/run";
import type { ServiceInput } from "@/lib/api/types";
import { isServiceType } from "@/lib/services";

/** Creates a service, or updates it when the form carries an id. */
export async function saveService(_previous: FormState, formData: FormData): Promise<FormState> {
  const id = readId(formData, "id");
  const name = readText(formData, "name");
  const serviceType = readText(formData, "serviceType");

  if (!name) return failure("Escribe el nombre del servicio.");
  if (!isServiceType(serviceType)) return failure("Elige el tipo de servicio.");

  const input: ServiceInput = {
    name,
    serviceType,
    description: readText(formData, "description"),
    price: readText(formData, "price"),
    imageUrl: readText(formData, "imageUrl"),
  };

  const result = await runAdminAction((api) => (id ? api.updateService(id, input) : api.createService(input)));
  if (!result.ok) return failure(result.message);

  refreshPublicSite();
  return success(id ? `Guardamos los cambios de «${name}».` : `Creamos el servicio «${name}».`);
}

export async function deleteService(id: number, name: string): Promise<FormState> {
  const result = await runAdminAction((api) => api.deleteService(id));
  if (!result.ok) return failure(result.message);

  refreshPublicSite();
  return success(`Eliminamos «${name}».`);
}
