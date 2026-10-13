"use client";

import { adminPanel } from "@/components/ui/styles";
import { changePassword } from "@/app/admin/(panel)/cuenta/actions";
import { AdminForm } from "./AdminForm";
import { TextField } from "./Field";

export function PasswordForm() {
  return (
    <AdminForm
      action={changePassword}
      submitLabel="Cambiar contraseña"
      pendingLabel="Cambiando contraseña…"
      resetOnSuccess
      className={adminPanel}
    >
      <TextField id="currentPassword" label="Contraseña actual" type="password" autoComplete="current-password" required />
      <TextField
        id="newPassword"
        label="Nueva contraseña"
        type="password"
        autoComplete="new-password"
        hint="Al menos 8 caracteres y distinta de la actual."
        minLength={8}
        required
      />
      <TextField id="confirmPassword" label="Repite la nueva contraseña" type="password" autoComplete="new-password" minLength={8} required />
    </AdminForm>
  );
}
