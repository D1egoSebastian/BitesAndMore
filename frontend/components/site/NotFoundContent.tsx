import Link from "next/link";
import { CookieIcon } from "@/components/ui/icons";
import { buttonPrimary, buttonText, pageContainer, pageTitle } from "@/components/ui/styles";

export function NotFoundContent() {
  return (
    <div className={`${pageContainer} pb-24 pt-12 sm:pt-20`}>
      <div className="flex size-14 items-center justify-center rounded-full bg-rose-tint">
        <CookieIcon className="size-7" />
      </div>
      <h1 className={`mt-6 ${pageTitle}`}>No encontramos esta página</h1>
      <p className="mt-4 max-w-[60ch] text-lg text-muted">
        Puede que el producto ya no esté disponible o que el enlace haya cambiado. Lo que buscas
        seguramente sigue en el catálogo.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link href="/productos" className={buttonPrimary}>
          Ver productos
        </Link>
        <Link href="/" className={buttonText}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
