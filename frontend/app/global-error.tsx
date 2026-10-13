"use client";

import "./globals.css";

export default function GlobalError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <html lang="es">
      <body className="flex min-h-screen items-center justify-center bg-white px-4">
        <main className="max-w-xl">
          <h1 className="text-3xl">El sitio no pudo cargarse</h1>
          <p className="mt-4 text-muted">
            Algo falló antes de que la página terminara de prepararse. Vuelve a intentarlo en unos segundos.
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="mt-8 inline-flex min-h-12 cursor-pointer items-center rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
