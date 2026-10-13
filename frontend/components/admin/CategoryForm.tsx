"use client";

import { adminPanel } from "@/components/ui/styles";
import { saveCategory } from "@/app/admin/(panel)/categorias/actions";
import type { Category } from "@/lib/api/types";
import { AdminForm } from "./AdminForm";
import { TextAreaField, TextField } from "./Field";

/** Inline "new category" form when `category` is null; edit form otherwise. */
export function CategoryForm({ category }: { category: Category | null }) {
  const editing = category !== null;

  return (
    <AdminForm
      action={saveCategory}
      submitLabel={editing ? "Guardar cambios" : "Crear categoría"}
      successHref={editing ? "/admin/categorias" : undefined}
      cancelHref={editing ? "/admin/categorias" : undefined}
      resetOnSuccess={!editing}
      className={adminPanel}
    >
      {editing && <input type="hidden" name="id" value={category.id} />}
      <TextField id="name" label="Nombre" required maxLength={80} defaultValue={category?.name ?? ""} autoComplete="off" />
      <TextAreaField id="description" label="Descripción" optional rows={2} defaultValue={category?.description ?? ""} />
    </AdminForm>
  );
}
