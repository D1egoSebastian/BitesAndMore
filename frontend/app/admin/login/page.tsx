import type { Metadata } from "next";
import { Wordmark } from "@/components/brand/Wordmark";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { expired } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white px-6 py-10 sm:px-10">
        <p className="text-center text-4xl">
          <Wordmark />
        </p>
        <h1 className="mt-6 text-center text-2xl sm:text-3xl">Iniciar sesión</h1>
        <p className="mt-1 text-center text-muted">Panel de administración</p>
        {expired === "1" && (
          <p role="status" className="mt-6 rounded-xl bg-surface px-4 py-3">
            Tu sesión terminó. Inicia sesión de nuevo para continuar.
          </p>
        )}
        <LoginForm />
      </div>
    </main>
  );
}
