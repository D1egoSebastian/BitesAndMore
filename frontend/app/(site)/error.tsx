"use client";

import Link from "next/link";
import { buttonPrimary, buttonText, pageContainer, pageTitle } from "@/components/ui/styles";

export default function SiteError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <div className={`${pageContainer} pb-24 pt-12 sm:pt-20`}>
      <h1 className={pageTitle}>No pudimos cargar esta página</h1>
      <p className="mt-4 max-w-[60ch] text-lg text-muted">
        El catálogo no respondió a tiempo. Suele pasar cuando el servidor se está iniciando después
        de un rato sin visitas. Vuelve a intentarlo en unos segundos.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="button" onClick={() => unstable_retry()} className={buttonPrimary}>
          Reintentar
        </button>
        <Link href="/" className={buttonText}>
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
