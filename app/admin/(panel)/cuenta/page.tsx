import type { Metadata } from "next";
import { PageHeading } from "@/components/admin/PageHeading";
import { PasswordForm } from "@/components/admin/PasswordForm";
import { buttonSecondary } from "@/components/ui/styles";
import { logout } from "../../actions";

export const metadata: Metadata = { title: "Cuenta" };

export default function AccountPage() {
  return (
    <>
      <PageHeading title="Cuenta" description="Cambia tu contraseña o cierra la sesión en este dispositivo." />

      <section aria-labelledby="cambiar-contrasena">
        <h2 id="cambiar-contrasena" className="mb-4 text-xl sm:text-2xl">
          Cambiar contraseña
        </h2>
        <PasswordForm />
      </section>

      <section aria-labelledby="cerrar-sesion" className="mt-12">
        <h2 id="cerrar-sesion" className="text-xl sm:text-2xl">
          Cerrar sesión
        </h2>
        <p className="mt-2 max-w-[60ch] text-muted">
          La sesión dura 8 horas. Ciérrala si usas un dispositivo compartido.
        </p>
        <form action={logout} className="mt-4">
          <button type="submit" className={buttonSecondary}>
            Cerrar sesión
          </button>
        </form>
      </section>
    </>
  );
}
