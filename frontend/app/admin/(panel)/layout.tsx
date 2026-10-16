import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { ToastProvider } from "@/components/admin/Toaster";
import { Wordmark } from "@/components/brand/Wordmark";
import { ExternalIcon } from "@/components/ui/icons";
import { buttonQuiet, navLink } from "@/components/ui/styles";
import { requireSessionForPage } from "@/lib/session/server";
import { logout } from "../actions";

function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit" className={buttonQuiet}>
        Cerrar sesión
      </button>
    </form>
  );
}

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  await requireSessionForPage();

  return (
    <ToastProvider>
      <div className="min-h-screen w-full bg-white md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-screen flex-col gap-8 border-r border-border bg-surface px-4 py-6 md:flex">
          <Link href="/admin" className="self-start rounded-full px-2 py-1" aria-label="Inicio del panel">
            <Wordmark alt="" className="h-12" />
          </Link>
          <AdminNav layout="sidebar" />
          <div className="mt-auto flex flex-col items-start gap-1">
            <Link href="/" target="_blank" className={`${navLink} inline-flex min-h-11 items-center gap-2 px-4 text-muted`}>
              Ver el sitio
              <ExternalIcon />
            </Link>
            <LogoutButton />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="border-b border-border bg-white px-4 pt-2 md:hidden">
            <div className="flex items-center justify-between">
              <Link href="/admin" className="rounded-full px-1 py-2" aria-label="Inicio del panel">
                <Wordmark alt="" className="h-11" />
              </Link>
              <LogoutButton />
            </div>
            <div className="mt-1">
              <AdminNav layout="tabs" />
            </div>
          </header>
          <main className="flex-1 px-4 py-8 sm:px-6 md:px-10 md:py-10">
            <div className="mx-auto w-full max-w-4xl">{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
