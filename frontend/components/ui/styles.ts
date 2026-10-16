// Shared class recipes. Kept as strings so Server and Client Components can both use them.
// Colors use the semantic tokens from app/globals.css (primary, surface, muted, border, accent, link)
// and the brand tints (rose-tint, caramel-tint, sand-tint, sand-tint-deep, rose-tint-strong).

// Press feedback: every button springs down to 97% while pressed (ease-spring, ~lib/motion.ts spring).
const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 ease-spring cursor-pointer active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 [touch-action:manipulation]";

// Hover lift for the main actions (only on devices with a pointer: Tailwind 4 hover variant).
const buttonLift =
  "hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_rgb(69_22_28/0.35)] active:translate-y-0 disabled:hover:translate-y-0 disabled:hover:shadow-none";

/** Main call to action: cocoa with white text, 52 px tall. */
export const buttonPrimary = `${buttonBase} ${buttonLift} min-h-[3.25rem] bg-primary px-7 py-2.5 text-base text-primary-foreground hover:bg-primary/90`;

/** Compact primary (header, sticky order bar). Still a 44 px target. */
export const buttonPrimarySmall = `${buttonBase} ${buttonLift} min-h-11 bg-primary px-5 py-2 text-sm text-primary-foreground hover:bg-primary/90`;

/** WhatsApp action (footer): raspberry with white text (9.9:1). Works on white and on cocoa. */
export const buttonWhatsApp = `${buttonBase} ${buttonLift} min-h-[3.25rem] bg-raspberry px-7 py-2.5 text-base text-white hover:bg-raspberry/90`;

/** White button over photos (service carousels on /servicios): cocoa text. */
export const buttonOnPhoto = `${buttonBase} ${buttonLift} min-h-[3.25rem] bg-white px-7 py-2.5 text-base text-foreground hover:bg-white/90`;

/** Outlined secondary action: 2 px cocoa line, rose tint fill on hover. */
export const buttonSecondary = `${buttonBase} ${buttonLift} min-h-[3.25rem] border-2 border-primary bg-transparent px-7 py-2 text-base text-foreground hover:bg-rose-tint`;

/** Text button beside a primary button: underline turns rose on hover. */
export const buttonText =
  "inline-flex min-h-12 items-center gap-2 rounded-md px-1 font-semibold text-foreground underline decoration-foreground/30 decoration-2 underline-offset-[6px] transition duration-200 ease-spring hover:decoration-accent active:scale-[0.97] [touch-action:manipulation]";

/** Low-emphasis action inside lists (Editar, Cerrar sesión). */
export const buttonQuiet = `${buttonBase} min-h-11 px-4 py-2 text-foreground hover:bg-surface`;

/** Destructive confirmation. Raspberry is the only "danger" tone in the palette. */
export const buttonDanger = `${buttonBase} min-h-11 bg-raspberry px-5 py-2 text-white hover:bg-raspberry/90`;

/** Inline link inside running text. */
export const textLink =
  "font-semibold text-link underline decoration-1 underline-offset-4 transition-colors hover:decoration-accent hover:decoration-2";

/** Quiet navigational link (breadcrumbs, "Ver todos"): inherits its color, rose underline on hover. */
export const navLink =
  "font-semibold underline decoration-transparent decoration-2 underline-offset-[6px] transition-colors hover:decoration-accent";

export const pageContainer = "mx-auto w-full max-w-[75rem] px-4 sm:px-6 lg:px-12";

/** Inputs: sand fill with a 3:1 border (WCAG 1.4.11). Cocoa text on sand: 7.7:1. */
export const inputBase =
  "block w-full rounded-[10px] border border-cocoa-muted/75 bg-surface px-4 py-2.5 text-foreground placeholder:text-muted disabled:opacity-60";

/** Section heading on public pages (34 px on phones, 48 px from tablet). */
export const sectionTitle = "text-[2.125rem] leading-[1.05] sm:text-[3rem]";

/** Page title (Productos, Servicios, Contacto): 40 px on phones, 64 px from tablet. */
export const pageTitle = "text-[2.5rem] leading-none sm:text-[4rem]";

/** Filter chip shell: hairline border; the pressed tint is a sliding rose-tint-strong layer inside. */
export const filterChip =
  "relative inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] px-[1.125rem] py-2 text-[0.9375rem] font-medium transition duration-200 ease-spring active:scale-[0.97] [touch-action:manipulation]";

/** Admin: white form panel with a hairline border. No shadow. */
export const adminPanel = "rounded-xl border border-border bg-white p-5 sm:p-8";

/** Admin: list with hairline dividers; rows tint softly on hover. */
export const adminList =
  "divide-y divide-border border-y border-border [&>li]:transition-colors [&>li]:duration-150 [&>li:hover]:bg-surface/60";

/** Admin: neutral note (empty states, hints). */
export const adminNote = "rounded-xl bg-surface px-5 py-4";
