"use client";

import Link from "next/link";
import { buttonPrimary, buttonText } from "@/components/ui/styles";

export default function AdminError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl">No pudimos cargar esta sección</h1>
      <p className="mt-3 max-w-[60ch] text-muted">
        El servidor de datos no respondió. Si acaba de estar inactivo, puede tardar unos segundos en
        despertar. Tus datos guardados no se perdieron.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="button" onClick={() => unstable_retry()} className={buttonPrimary}>
          Reintentar
        </button>
        <Link href="/admin" className={buttonText}>
          Ir al inicio del panel
        </Link>
      </div>
    </div>
  );
}
