import type { JSX } from "react";
import type { ServiceType } from "@/lib/api/types";
import type { DessertKind } from "@/lib/tones";

/*
 * Flat illustrations from the approved design. They are the "no photo yet" state of product and
 * service images, drawn on a pastel tile, so an empty catalog still looks intentional.
 * Decorative: always aria-hidden (the frame carries the accessible name when needed).
 */

type ArtProps = { className?: string };

function Cake({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={className}>
      <ellipse cx="100" cy="166" rx="78" ry="12" fill="#fff" opacity=".7" />
      <rect x="44" y="96" width="112" height="64" rx="12" fill="#7A4A3A" />
      <rect x="38" y="82" width="124" height="26" rx="13" fill="#fff" />
      <circle cx="62" cy="112" r="8" fill="#fff" />
      <circle cx="104" cy="116" r="9" fill="#fff" />
      <circle cx="138" cy="110" r="7" fill="#fff" />
      <circle cx="100" cy="68" r="11" fill="#C94F6D" />
      <path d="M100 58c2-10 10-14 16-14-1 8-7 13-16 14z" fill="#8FAE8B" />
    </svg>
  );
}

function Cupcake({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={className}>
      <path d="M58 118h84l-10 50H68z" fill="#CFA4B0" />
      <path d="M78 118l4 50M100 118v50M122 118l-4 50" stroke="#fff" strokeWidth="3" opacity=".6" />
      <ellipse cx="100" cy="116" rx="46" ry="14" fill="#fff" />
      <ellipse cx="100" cy="94" rx="36" ry="16" fill="#fff" />
      <ellipse cx="100" cy="72" rx="24" ry="14" fill="#fff" />
      <circle cx="100" cy="52" r="8" fill="#C94F6D" />
      <circle cx="82" cy="98" r="2.5" fill="#CFA4B0" />
      <circle cx="118" cy="92" r="2.5" fill="#8FAE8B" />
      <circle cx="104" cy="112" r="2.5" fill="#C59C67" />
    </svg>
  );
}

function Cookie({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={className}>
      <circle cx="100" cy="104" r="64" fill="#C59C67" />
      <circle cx="100" cy="104" r="64" fill="none" stroke="#C48C52" strokeWidth="4" strokeDasharray="3 9" />
      <circle cx="74" cy="84" r="8" fill="#5A3A30" />
      <circle cx="116" cy="76" r="7" fill="#5A3A30" />
      <circle cx="130" cy="112" r="9" fill="#5A3A30" />
      <circle cx="90" cy="124" r="8" fill="#5A3A30" />
      <circle cx="64" cy="116" r="5" fill="#5A3A30" />
      <circle cx="108" cy="144" r="6" fill="#5A3A30" />
    </svg>
  );
}

function Flan({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={className}>
      <path d="M46 120h108l-10 38H56z" fill="#C59C67" />
      <ellipse cx="100" cy="120" rx="54" ry="14" fill="#E9B97E" />
      <path d="M52 118c4-28 28-40 48-40s44 12 48 40z" fill="#F3C98B" />
    </svg>
  );
}

const DESSERTS: Record<DessertKind, (props: ArtProps) => JSX.Element> = {
  cake: Cake,
  cupcake: Cupcake,
  cookie: Cookie,
  flan: Flan,
};

/** Product illustration for a category kind. Size it with className (e.g. `w-[66%]`). */
export function DessertArt({ kind, className }: { kind: DessertKind; className?: string }) {
  const Art = DESSERTS[kind];
  return <Art className={className} />;
}

function Celebration({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={className}>
      <ellipse cx="100" cy="166" rx="78" ry="12" fill="#fff" opacity=".7" />
      <rect x="44" y="96" width="112" height="64" rx="12" fill="#7A4A3A" />
      <rect x="38" y="82" width="124" height="26" rx="13" fill="#fff" />
      <circle cx="100" cy="68" r="11" fill="#C94F6D" />
    </svg>
  );
}

function Confetti({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={className}>
      <circle cx="60" cy="110" r="38" fill="#CFA4B0" />
      <circle cx="130" cy="96" r="30" fill="#fff" />
      <circle cx="104" cy="148" r="26" fill="#8FAE8B" opacity=".8" />
    </svg>
  );
}

function Gift({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={className}>
      <rect x="30" y="80" width="140" height="80" rx="14" fill="#fff" />
      <path d="M30 106h140" stroke="#CFA4B0" strokeWidth="10" />
      <path
        d="M100 80c-18-30-48-14-30 6M100 80c18-30 48-14 30 6"
        fill="none"
        stroke="#CFA4B0"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
}

const OCCASIONS: Record<ServiceType, (props: ArtProps) => JSX.Element> = {
  Reposteria: Celebration,
  EventsPlanner: Confetti,
  DesayunosPersonalizados: Gift,
};

/** Illustration for a service type: celebration cake, confetti, gift box. */
export function OccasionArt({ type, className }: { type: ServiceType; className?: string }) {
  const Art = OCCASIONS[type];
  return <Art className={className} />;
}
