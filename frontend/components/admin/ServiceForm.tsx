"use client";

import { adminNote, adminPanel } from "@/components/ui/styles";
import { useState } from "react";
import { saveService } from "@/app/admin/(panel)/servicios/actions";
import { SERVICE_TYPES, type Service } from "@/lib/api/types";
import { SERVICE_MIN_LONG_SIDE } from "@/lib/admin/image-size";
import { MAX_SERVICE_IMAGES } from "@/lib/service-gallery";
import { serviceTypeLabel } from "@/lib/services";
import { AdminForm } from "./AdminForm";
import { SelectField, TextAreaField, TextField } from "./Field";
import { ImageUpload } from "./ImageUpload";

export function ServiceForm({ service }: { service: Service | null }) {
  const [uploading, setUploading] = useState(false);
  const editing = service !== null;

  return (
    <AdminForm
      action={saveService}
      submitLabel={editing ? "Guardar cambios" : "Crear servicio"}
      successHref="/admin/servicios"
      cancelHref="/admin/servicios"
      busy={uploading}
      className={adminPanel}
    >
      {editing && <input type="hidden" name="id" value={service.id} />}
      <TextField id="name" label="Nombre" required maxLength={120} defaultValue={service?.name ?? ""} autoComplete="off" />
      <SelectField
        id="serviceType"
        label="Tipo de servicio"
        hint="Define en qué sección de la página de servicios aparece."
        required
        defaultValue={service?.serviceType ?? ""}
      >
        <option value="" disabled>
          Elige un tipo
        </option>
        {SERVICE_TYPES.map((type) => (
          <option key={type} value={type}>
            {serviceTypeLabel(type)}
          </option>
        ))}
      </SelectField>
      <TextField
        id="price"
        label="Precio"
        optional
        hint="Se muestra tal como lo escribas. Ej: Desde RD$2,500 o A cotizar"
        defaultValue={service?.price ?? ""}
        autoComplete="off"
      />
      <TextAreaField id="description" label="Descripción" optional defaultValue={service?.description ?? ""} />
      <ImageUpload
        name="imageUrl"
        label="Foto principal"
        initialUrl={service?.imageUrl ?? null}
        itemName={service?.name ?? null}
        onBusyChange={setUploading}
        minLongSide={SERVICE_MIN_LONG_SIDE}
      />
      {!editing && (
        <p className={adminNote}>
          <span className="font-semibold">Galería:</span> después de crear el servicio podrás agregar hasta{" "}
          {MAX_SERVICE_IMAGES} fotos de trabajos desde la página de edición.
        </p>
      )}
    </AdminForm>
  );
}
