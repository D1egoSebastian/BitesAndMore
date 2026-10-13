"use server";

import { readId, readText } from "@/lib/admin/form-data";
import { failure, success, type FormState } from "@/lib/admin/form-state";
import { refreshPublicSite, runAdminAction } from "@/lib/admin/run";

/** Creates a category, or updates it when the form carries an id. */
export async function saveCategory(_previous: FormState, formData: FormData): Promise<FormState> {
  const id = readId(formData, "id");
  const name = readText(formData, "name");
  if (!name) return failure("Escribe el nombre de la categoría.");

  const input = { name, description: readText(formData, "description") };
  const result = await runAdminAction((api) => (id ? api.updateCategory(id, input) : api.createCategory(input)));
  if (!result.ok) return failure(result.message);

  refreshPublicSite();
  return success(id ? `Guardamos los cambios de «${name}».` : `Creamos la categoría «${name}».`);
}

/** The API deletes the category's products in cascade; the UI warns before calling this. */
export async function deleteCategory(id: number, name: string, productCount: number): Promise<FormState> {
  const result = await runAdminAction((api) => api.deleteCategory(id));
  if (!result.ok) return failure(result.message);

  refreshPublicSite();
  if (productCount === 0) return success(`Eliminamos la categoría «${name}».`);
  return success(
    `Eliminamos «${name}» y ${productCount === 1 ? "su producto" : `sus ${productCount} productos`}.`,
  );
}
