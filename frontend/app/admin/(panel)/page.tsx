import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/admin/PageHeading";
import { AlertIcon } from "@/components/ui/icons";
import { buttonSecondary, navLink, textLink } from "@/components/ui/styles";
import { adminReadApi } from "@/lib/api/server";
import { buildWhatsAppContactUrl } from "@/lib/contact";

export const metadata: Metadata = { title: "Inicio" };

const SHORTCUTS = [
  { href: "/admin/productos/nuevo", label: "Nuevo producto" },
  { href: "/admin/categorias", label: "Nueva categoría" },
  { href: "/admin/servicios/nuevo", label: "Nuevo servicio" },
  { href: "/admin/negocio", label: "Editar datos del negocio" },
];

export default async function DashboardPage() {
  const [products, categories, services, info] = await Promise.all([
    adminReadApi.getProducts(),
    adminReadApi.getCategories(),
    adminReadApi.getServices(),
    adminReadApi.getBusinessInfo(),
  ]);

  const visible = products.filter((product) => product.isAvailable).length;
  const hidden = products.length - visible;
  const hasWhatsApp = buildWhatsAppContactUrl(info?.whatsAppNumber) !== null;

  const stats = [
    {
      label: "Productos",
      value: products.length,
      detail: hidden > 0 ? `${visible} visibles, ${hidden} ocultos` : `${visible} visibles`,
      href: "/admin/productos",
    },
    { label: "Categorías", value: categories.length, detail: null, href: "/admin/categorias" },
    { label: "Servicios", value: services.length, detail: null, href: "/admin/servicios" },
  ];

  return (
    <>
      <PageHeading title="Inicio" description="Desde aquí gestionas lo que se ve en el sitio." />

      {!hasWhatsApp && (
        <div role="note" className="mb-8 flex items-start gap-3 rounded-xl bg-surface px-5 py-4">
          <AlertIcon className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-semibold">Todavía no hay número de WhatsApp.</p>
            <p className="mt-1">
              Sin él, los botones «Pedir por WhatsApp» no aparecen en el sitio.{" "}
              <Link href="/admin/negocio" className={textLink}>
                Agregar el número
              </Link>
            </p>
          </div>
        </div>
      )}

      <dl className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border px-6 py-5">
            <dt className="font-semibold">
              <Link href={stat.href} className={`${navLink} inline-flex min-h-11 items-center`}>
                {stat.label}
              </Link>
            </dt>
            <dd className="font-display text-4xl">{stat.value}</dd>
            {stat.detail && <dd className="mt-1 text-sm text-muted">{stat.detail}</dd>}
          </div>
        ))}
      </dl>

      <section aria-labelledby="atajos" className="mt-12">
        <h2 id="atajos" className="text-xl sm:text-2xl">
          Atajos
        </h2>
        <ul className="mt-4 flex flex-wrap gap-3">
          {SHORTCUTS.map((shortcut) => (
            <li key={shortcut.href}>
              <Link href={shortcut.href} className={buttonSecondary}>
                {shortcut.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
