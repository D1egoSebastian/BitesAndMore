"use client";

import { useState } from "react";
import Link from "next/link";
import { saveProduct } from "@/app/admin/(panel)/productos/actions";
import type { Category, Product } from "@/lib/api/types";
import { adminNote, adminPanel, textLink } from "@/components/ui/styles";
import { AdminForm } from "./AdminForm";
import { CheckboxField, SelectField, TextAreaField, TextField } from "./Field";
import { ImageUpload } from "./ImageUpload";

type ProductFormProps = {
  product: Product | null;
  categories: Category[];
};

export function ProductForm({ product, categories }: ProductFormProps) {
  const [uploading, setUploading] = useState(false);
  const editing = product !== null;

  if (categories.length === 0) {
    return (
      <p className={adminNote}>
        Antes de crear productos necesitas al menos una categoría.{" "}
        <Link href="/admin/categorias" className={textLink}>
          Crear una categoría
        </Link>
      </p>
    );
  }

  return (
    <AdminForm
      action={saveProduct}
      submitLabel={editing ? "Guardar cambios" : "Crear producto"}
      successHref="/admin/productos"
      cancelHref="/admin/productos"
      busy={uploading}
      className={adminPanel}
    >
      {editing && <input type="hidden" name="id" value={product.id} />}
      <TextField id="name" label="Nombre" required maxLength={120} defaultValue={product?.name ?? ""} autoComplete="off" />
      <SelectField id="categoryId" label="Categoría" required defaultValue={product?.categoryId ?? ""}>
        <option value="" disabled>
          Elige una categoría
        </option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name ?? `Categoría ${category.id}`}
          </option>
        ))}
      </SelectField>
      <TextField
        id="price"
        label="Precio"
        optional
        hint="Se muestra tal como lo escribas. Ej: RD$1,800 o Desde RD$350"
        defaultValue={product?.price ?? ""}
        autoComplete="off"
      />
      <TextAreaField id="description" label="Descripción" optional defaultValue={product?.description ?? ""} />
      <ImageUpload
        name="imageUrl"
        label="Foto"
        initialUrl={product?.imageUrl ?? null}
        itemName={product?.name ?? null}
        onBusyChange={setUploading}
      />
      <CheckboxField
        id="isAvailable"
        label="Visible en el sitio"
        hint="Desmárcalo para ocultar el producto sin borrarlo."
        defaultChecked={product?.isAvailable ?? true}
      />
    </AdminForm>
  );
}
