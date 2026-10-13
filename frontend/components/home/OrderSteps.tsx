"use client";

import { motion, type Transition, type Variants } from "framer-motion";
import { duration, easeOut, revealViewport } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";

type OrderStepsProps = {
  hasWhatsApp: boolean;
  /** "wide": three animated steps on the home band. "compact": static stacked list (contact page). */
  variant?: "wide" | "compact";
  headingLevel?: "h3" | "p";
};

/** Time between one step and the next while the sequence plays. */
const STEP_SECONDS = 0.35;
/** Pastel fill of each numbered badge. */
const BADGE_TONES = ["bg-blush", "bg-butter", "bg-sage"] as const;
/** Bouncier variant of the motion spring, for the number badges popping in. */
const POP = { type: "spring", stiffness: 380, damping: 18 } as const;

function orderSteps(hasWhatsApp: boolean) {
  return [
    {
      title: "Elige tu postre o servicio",
      body: "Mira el catálogo de postres o los servicios para tu evento y elige lo que necesitas.",
    },
    {
      title: hasWhatsApp ? "Escríbenos por WhatsApp" : "Escríbenos con el nombre del producto o servicio",
      body: hasWhatsApp
        ? "Con un clic se abre el chat con el producto o servicio ya escrito."
        : "Usa los datos de la página de contacto y cuéntanos qué te gustaría.",
    },
    {
      title: "Coordinamos la entrega",
      body: "Acordamos la fecha, los detalles y la forma de recogida o entrega.",
    },
  ];
}

/**
 * The real ordering sequence. Numbered because order matters.
 * "wide" plays the sequence when it scrolls into view: each number pops in with a spring, its
 * text rises, and a pink line draws (SVG pathLength 0 → 1) towards the next step, so the eye
 * follows 1 → 2 → 3. Vertical line on phones, horizontal from tablet up.
 */
export function OrderSteps({ hasWhatsApp, variant = "wide", headingLevel = "h3" }: OrderStepsProps) {
  const steps = orderSteps(hasWhatsApp);
  const Heading = headingLevel;
  const reduceMotion = usePrefersReducedMotion();

  if (variant === "compact") {
    return (
      <ol className="flex flex-col gap-5">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span
              aria-hidden="true"
              className={`font-display flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-accent text-base font-bold ${BADGE_TONES[index % BADGE_TONES.length]}`}
            >
              {index + 1}
            </span>
            <div className="pt-1">
              <Heading className="font-sans text-base font-semibold tracking-normal">
                <span className="sr-only">Paso {index + 1}: </span>
                {step.title}
              </Heading>
              <p className="mt-1 text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    );
  }

  const timed = (transition: Transition, index: number, offset = 0): Transition =>
    reduceMotion ? { duration: 0 } : { ...transition, delay: index * STEP_SECONDS + offset };

  return (
    <motion.ol
      className="grid gap-5 md:grid-cols-3 md:gap-10"
      initial="hidden"
      whileInView="show"
      viewport={revealViewport}
    >
      {steps.map((step, index) => {
        const badge: Variants = {
          hidden: { opacity: 0, scale: 0.4 },
          show: { opacity: 1, scale: 1, transition: timed({ scale: POP, opacity: { duration: duration.fast } }, index) },
        };
        const text: Variants = {
          hidden: { opacity: 0, y: 12 },
          show: { opacity: 1, y: 0, transition: timed({ duration: duration.slow, ease: easeOut }, index, 0.1) },
        };
        const line: Variants = {
          hidden: { pathLength: 0 },
          show: { pathLength: 1, transition: timed({ duration: 0.5, ease: easeOut }, index, 0.2) },
        };

        return (
          <li key={step.title} className="relative flex gap-4 md:flex-col md:gap-5">
            {index < steps.length - 1 && (
              <>
                {/* Phones: from below this badge down to the next one. */}
                <svg
                  aria-hidden="true"
                  className="absolute left-[23px] top-[3.5rem] h-[calc(100%-2.75rem)] w-0.5 overflow-visible text-accent md:hidden"
                >
                  <motion.line x1="1" y1="0" x2="1" y2="100%" stroke="currentColor" strokeWidth="2" strokeLinecap="round" variants={line} />
                </svg>
                {/* Tablet and up: from the right of this badge to the left of the next one. */}
                <svg
                  aria-hidden="true"
                  className="absolute left-[4rem] top-[27px] hidden h-0.5 w-[calc(100%-2rem)] overflow-visible text-accent md:block"
                >
                  <motion.line x1="0" y1="1" x2="100%" y2="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" variants={line} />
                </svg>
              </>
            )}
            <motion.span
              aria-hidden="true"
              variants={badge}
              className={`font-display relative flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-accent text-xl font-bold md:size-14 md:text-[1.375rem] ${BADGE_TONES[index % BADGE_TONES.length]}`}
            >
              {index + 1}
            </motion.span>
            <motion.div variants={text} className="pt-1.5 md:pt-0">
              <Heading className="font-display text-xl font-bold md:text-2xl">
                <span className="sr-only">Paso {index + 1}: </span>
                {step.title}
              </Heading>
              <p className="mt-1 max-w-[20em] leading-relaxed text-muted md:mt-2">{step.body}</p>
            </motion.div>
          </li>
        );
      })}
    </motion.ol>
  );
}
