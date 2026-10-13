import Link from "next/link";
import type { ReactNode } from "react";
import { navLink } from "@/components/ui/styles";

type PageHeadingProps = {
  title: string;
  description?: ReactNode;
  back?: { href: string; label: string };
  actions?: ReactNode;
};

export function PageHeading({ title, description, back, actions }: PageHeadingProps) {
  return (
    <div className="mb-8">
      {back && (
        <Link href={back.href} className={`${navLink} inline-flex min-h-11 items-center text-sm text-muted`}>
          {back.label}
        </Link>
      )}
      <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl">{title}</h1>
        {actions}
      </div>
      {description && <p className="mt-2 max-w-[62ch] text-muted">{description}</p>}
    </div>
  );
}
