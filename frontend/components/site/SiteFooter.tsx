import Link from "next/link";
import type { ReactNode } from "react";
import type { BusinessInfo } from "@/lib/api/types";
import { buildSocialUrl, buildWhatsAppContactUrl } from "@/lib/contact";
import { displayText } from "@/lib/format";
import { Reveal } from "@/components/motion/Reveal";
import { FacebookIcon, InstagramIcon, PhoneIcon, WhatsAppIcon } from "@/components/ui/icons";
import { buttonRose, pageContainer } from "@/components/ui/styles";
import { scrollStaggerDelay } from "@/lib/motion";

type FooterContact = { href: string; label: string; icon: ReactNode; external: boolean };

const footerLink =
  "group/link inline-flex min-h-11 items-center gap-2.5 rounded-md text-white/85 transition-colors duration-200 hover:text-white";

/** Pink underline that draws from left to right on hover and keyboard focus (transform only). */
function LinkLabel({ children }: { children: ReactNode }) {
  return (
    <span className="relative after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-accent after:transition-transform after:duration-300 after:ease-out-soft group-hover/link:after:scale-x-100 group-focus-visible/link:after:scale-x-100">
      {children}
    </span>
  );
}

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/servicios", label: "Servicios" },
  { href: "/contacto", label: "Contacto" },
];

/** Cocoa footer with white text: text wordmark, rose WhatsApp button (when configured), navigation and contact. */
export function SiteFooter({ info, businessName }: { info: BusinessInfo | null; businessName: string }) {
  const whatsApp = buildWhatsAppContactUrl(info?.whatsAppNumber);
  const phone = displayText(info?.phoneNumber);
  const instagram = buildSocialUrl("instagram", info?.instagram);
  const facebook = buildSocialUrl("facebook", info?.facebook);

  const contacts: FooterContact[] = [];
  if (whatsApp) contacts.push({ href: whatsApp, label: "WhatsApp", icon: <WhatsAppIcon />, external: true });
  if (phone) contacts.push({ href: `tel:${phone.replace(/[^\d+]/g, "")}`, label: phone, icon: <PhoneIcon />, external: false });
  if (instagram) contacts.push({ href: instagram, label: "Instagram", icon: <InstagramIcon />, external: true });
  if (facebook) contacts.push({ href: facebook, label: "Facebook", icon: <FacebookIcon />, external: true });

  return (
    <footer className="site-footer on-dark relative bg-cocoa text-white">
      <div className={`${pageContainer} grid gap-10 pb-10 pt-14 sm:grid-cols-2 sm:pt-[4.5rem] lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-12`}>
        {/* The three blocks rise one after another as the footer comes into view (spec 013). */}
        <Reveal className="flex flex-col items-start gap-4">
          <p className="font-display text-[1.875rem] font-bold leading-none sm:text-4xl">{businessName}</p>
          <p className="max-w-[36ch] text-white/80">Postres caseros por encargo.</p>
          {whatsApp && (
            <a href={whatsApp} target="_blank" rel="noopener noreferrer" className={buttonRose}>
              Pedir por WhatsApp
            </a>
          )}
        </Reveal>

        <Reveal delay={scrollStaggerDelay(1)}>
          <nav aria-labelledby="footer-nav">
            <h2 id="footer-nav" className="font-sans text-base font-semibold tracking-normal">
              Navegación
            </h2>
            <ul className="mt-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLink}>
                    <LinkLabel>{link.label}</LinkLabel>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Reveal>

        {contacts.length > 0 && (
          <Reveal delay={scrollStaggerDelay(2)}>
            <h2 className="font-sans text-base font-semibold tracking-normal">Contacto</h2>
            <ul className="mt-2">
              {contacts.map((contact) => (
                <li key={contact.label}>
                  <a
                    href={contact.href}
                    {...(contact.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={footerLink}
                  >
                    {contact.icon}
                    <LinkLabel>{contact.label}</LinkLabel>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
      <div className="border-t border-white/10">
        <p className={`${pageContainer} py-6 text-sm text-white/75`}>
          © {new Date().getFullYear()} {businessName}
        </p>
      </div>
    </footer>
  );
}
