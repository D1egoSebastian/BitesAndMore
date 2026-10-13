"use client";

import { adminPanel } from "@/components/ui/styles";
import { saveBusinessInfo } from "@/app/admin/(panel)/negocio/actions";
import type { BusinessInfo } from "@/lib/api/types";
import { AdminForm } from "./AdminForm";
import { TextAreaField, TextField } from "./Field";

export function BusinessForm({ info }: { info: BusinessInfo | null }) {
  return (
    <AdminForm action={saveBusinessInfo} submitLabel="Guardar cambios" className={adminPanel}>
      <TextField
        id="businessName"
        label="Nombre del negocio"
        optional
        hint="Si lo dejas vacío, el sitio usa «Bites and More»."
        defaultValue={info?.businessName ?? ""}
        autoComplete="organization"
      />
      <TextAreaField
        id="mission"
        label="Misión"
        optional
        hint="Aparece en la portada, debajo del título principal."
        rows={3}
        defaultValue={info?.mission ?? ""}
      />
      <TextAreaField id="vision" label="Visión" optional hint="Aparece en la portada, en la sección «Sobre nosotras»." rows={3} defaultValue={info?.vision ?? ""} />
      <TextField
        id="whatsAppNumber"
        label="Número de WhatsApp"
        optional
        hint="Incluye el código de país, solo números. Ej: 18091234567"
        inputMode="numeric"
        autoComplete="tel"
        defaultValue={info?.whatsAppNumber ?? ""}
      />
      <TextField
        id="phoneNumber"
        label="Teléfono"
        optional
        type="tel"
        autoComplete="tel"
        defaultValue={info?.phoneNumber ?? ""}
      />
      <TextAreaField id="address" label="Dirección" optional rows={2} defaultValue={info?.address ?? ""} />
      <TextField
        id="instagram"
        label="Instagram"
        optional
        hint="Tu usuario o el enlace a tu perfil. Ej: @bitesandmore"
        autoCapitalize="none"
        spellCheck={false}
        defaultValue={info?.instagram ?? ""}
      />
      <TextField
        id="facebook"
        label="Facebook"
        optional
        hint="Tu usuario o el enlace a tu página."
        autoCapitalize="none"
        spellCheck={false}
        defaultValue={info?.facebook ?? ""}
      />
    </AdminForm>
  );
}
