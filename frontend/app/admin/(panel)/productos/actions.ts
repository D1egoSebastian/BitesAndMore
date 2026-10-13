"use server";

import { readCheckbox, readId, readText } from "@/lib/admin/form-data";
import { failure, success, type FormState } from "@/lib/admin/form-state";
import { refreshPublicSite, runAdminAction } from "@/lib/admin/run";
import type { Product, ProductInput } from "@/lib/api/types";

function toInput(product: Product): ProductInput {
  return {
    name: product.name ?? "",
    description: product.description,
    price: product.price,
    imageUrl: product.imageUrl,
    categoryId: product.categoryId,
    isAvailable: product.isAvailable,
  };
}

/** Creates a product, or updates it when the form carries an id. */
export async function saveProduct(_previous: FormState, formData: FormData): Promise<FormState> {
  const id = readId(formData, "id");
  const name = readText(formData, "name");
  const categoryId = readId(formData, "categoryId");

  if (!name) return failure("Escribe el nombre del producto.");
  if (!categoryId) return failure("Elige una categoría.");

  const input: ProductInput = {
    name,
    description: readText(formData, "description"),
    price: readText(formData, "price"),
    imageUrl: readText(formData, "imageUrl"),
    categoryId,
    isAvailable: readCheckbox(formData, "isAvailable"),
  };

  const result = await runAdminAction((api) => (id ? api.updateProduct(id, input) : api.createProduct(input)));
  if (!result.ok) return failure(result.message);

  refreshPublicSite();
  return success(id ? `Guardamos los cambios de «${name}».` : `Creamos «${name}».`);
}

export async function deleteProduct(id: number, name: string): Promise<FormState> {
  const result = await runAdminAction((api) => api.deleteProduct(id));
  if (!result.ok) return failure(result.message);

  refreshPublicSite();
  return success(`Eliminamos «${name}».`);
}

/** PUT needs the whole product, so read it first and change only isAvailable. */
export async function setProductAvailability(id: number, isAvailable: boolean): Promise<FormState> {
  const result = await runAdminAction(async (api) => {
    const product = await api.getProductById(id);
    if (!product) return null;
    return api.updateProduct(id, { ...toInput(product), isAvailable });
  });

  if (!result.ok) return failure(result.message);
  if (!result.data) return failure("Este producto ya no existe. Recarga la lista para ver los datos actuales.");

  refreshPublicSite();
  const name = result.data.name ?? "El producto";
  return success(isAvailable ? `«${name}» ya se ve en el sitio.` : `«${name}» quedó oculto del sitio.`);
}
