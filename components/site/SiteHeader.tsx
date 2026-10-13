import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { pageContainer } from "@/components/ui/styles";
import { HeaderFrame } from "./HeaderFrame";
import { SiteNav } from "./SiteNav";

type SiteHeaderProps = {
  businessName: string;
  /** General wa.me link; null when no WhatsApp number is configured. */
  whatsAppUrl: string | null;
};

export function SiteHeader({ businessName, whatsAppUrl }: SiteHeaderProps) {
  return (
    <HeaderFrame>
      <div className={`${pageContainer} flex h-[4.25rem] items-center justify-between gap-4 sm:h-[4.75rem]`}>
        <Link
          href="/"
          className="-ml-1 shrink-0 rounded-full px-1 py-1.5 text-[1.75rem] sm:text-[1.875rem]"
          aria-label={`${businessName}, ir al inicio`}
        >
          <Wordmark />
        </Link>
        <SiteNav whatsAppUrl={whatsAppUrl} />
      </div>
    </HeaderFrame>
  );
}
