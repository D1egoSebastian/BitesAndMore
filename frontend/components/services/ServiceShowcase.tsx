"use client";

import { animate, motion, useInView, useMotionValue, type PanInfo } from "framer-motion";
import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { AdaptiveImage } from "@/components/media/AdaptiveImage";
import { OccasionArt } from "@/components/media/DessertArt";
import { Reveal } from "@/components/motion/Reveal";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon, WhatsAppIcon } from "@/components/ui/icons";
import { buttonOnPhoto, buttonPrimary, pageContainer } from "@/components/ui/styles";
import type { ServiceType } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { swipeDirection, wrapSlideIndex } from "@/lib/hero-slides";
import type { ServiceSlide } from "@/lib/service-gallery";
import { TONE_BG, toneForServiceType } from "@/lib/tones";

/** Time each photo stays on screen while autoplaying (approved design: 5.5 s). */
const SLIDE_SECONDS = 5.5;
/** Photo dissolve. Slower than the UI tokens on purpose, as in the hero carousel. */
const CROSSFADE_SECONDS = 1;
/** Ken Burns: the visible photo slowly grows to this scale while on screen. */
const KEN_BURNS_SCALE = 1.08;
/** 44 px dots that fit beside the pause button on a 360 px phone; with more photos, phones get arrows. */
const MAX_PHONE_DOTS = 6;

// ----- One pause button for every carousel on the page -----

type PlaybackContext = { userPaused: boolean; toggle: () => void };

const Playback = createContext<PlaybackContext>({ userPaused: false, toggle: () => {} });

/** Shares a single pause/play state between all the service carousels (approved design). */
export function ServiceCarouselProvider({ children }: { children: ReactNode }) {
  const [userPaused, setUserPaused] = useState(false);
  const toggle = useCallback(() => setUserPaused((value) => !value), []);
  const value = useMemo(() => ({ userPaused, toggle }), [userPaused, toggle]);
  return <Playback.Provider value={value}>{children}</Playback.Provider>;
}

function subscribeToVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

const isTabHidden = () => document.hidden;
const isTabHiddenOnServer = () => false;

// ----- A service section -----

export type ServiceCarouselProps = {
  anchor: string;
  name: string;
  type: ServiceType;
  description: string | null;
  price: string | null;
  /** "Consultar por WhatsApp" (external wa.me link) or "Consultar" (link to /contacto). */
  cta: { href: string; label: string; external: boolean };
  slides: ServiceSlide[];
  /** Only the first section of the page preloads its first photo (likely LCP). */
  preload: boolean;
};

/**
 * Full-width section of one service on /servicios (spec 011) following the WAI-ARIA carousel
 * pattern: the cover and gallery photos crossfade every 5.5 s with a slow Ken Burns zoom. Autoplay
 * pauses with the shared pause button, while the pointer is over the section, while keyboard focus
 * is inside it, while it is off screen and while the tab is hidden; it never starts with reduced
 * motion. Photos change with the dots, the arrows (from tablet up), a horizontal swipe or the
 * left/right keys. Without photos the section is a pastel tile with the service type illustration.
 */
export function ServiceCarousel({ anchor, name, type, description, price, cta, slides, preload }: ServiceCarouselProps) {
  const count = slides.length;
  const titleId = useId();
  const slidesId = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const { userPaused, toggle } = useContext(Playback);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [keyboardInside, setKeyboardInside] = useState(false);
  const tabHidden = useSyncExternalStore(subscribeToVisibility, isTabHidden, isTabHiddenOnServer);
  const onScreen = useInView(sectionRef, { amount: 0.35 });

  const isCarousel = count > 1;
  const manyPhotos = count > MAX_PHONE_DOTS;
  const canAutoplay = isCarousel && !reduceMotion;
  const playing = canAutoplay && !userPaused && !hovered && !keyboardInside && !tabHidden && onScreen;

  const progress = useMotionValue(0);
  const move = useCallback((delta: number) => setIndex((current) => wrapSlideIndex(current, delta, count)), [count]);

  useEffect(() => {
    progress.set(0);
  }, [index, progress]);

  useEffect(() => {
    if (!playing) return;
    // Resumes from where it was paused instead of restarting the photo.
    const controls = animate(progress, 1, {
      duration: (1 - progress.get()) * SLIDE_SECONDS,
      ease: "linear",
      onComplete: () => move(1),
    });
    return () => controls.stop();
  }, [playing, index, progress, move]);

  if (count === 0) {
    return <FallbackSection anchor={anchor} titleId={titleId} name={name} type={type} description={description} price={price} cta={cta} />;
  }

  function onPointerEnter(event: PointerEvent) {
    if (event.pointerType === "mouse") setHovered(true);
  }

  function onPointerLeave(event: PointerEvent) {
    if (event.pointerType === "mouse") setHovered(false);
  }

  function onFocus(event: FocusEvent<HTMLElement>) {
    // Only keyboard focus stops the rotation (WAI); a mouse click on a dot must not freeze it.
    if (event.target instanceof HTMLElement && event.target.matches(":focus-visible")) setKeyboardInside(true);
  }

  function onBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setKeyboardInside(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!isCarousel) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
  }

  function onPanEnd(_event: unknown, info: PanInfo) {
    // Vertical gestures scroll the page; only clearly horizontal swipes change the photo.
    if (Math.abs(info.offset.y) > Math.abs(info.offset.x)) return;
    const direction = swipeDirection(info.offset.x, info.velocity.x);
    if (direction !== 0) move(direction);
  }

  const active = slides[index];

  return (
    <motion.section
      ref={sectionRef}
      id={anchor}
      aria-labelledby={isCarousel ? undefined : titleId}
      aria-label={isCarousel ? name : undefined}
      aria-roledescription={isCarousel ? "carrusel" : undefined}
      className="relative isolate flex min-h-[35rem] scroll-mt-20 flex-col justify-end overflow-hidden bg-sugar touch-pan-y sm:scroll-mt-24 md:min-h-[41.25rem]"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onPanEnd={isCarousel ? onPanEnd : undefined}
    >
      <div id={slidesId} aria-live={isCarousel && !playing ? "polite" : "off"} className="absolute inset-0 -z-10">
        {slides.map((slide, position) => (
          <Slide
            key={slide.id}
            slide={slide}
            label={isCarousel ? `${position + 1} de ${count}` : null}
            active={position === index}
            playing={playing}
            reduceMotion={reduceMotion}
            preload={preload && position === 0}
          />
        ))}
      </div>

      {/* Phones: dark from the bottom. Tablet up: dark from the left, plus a soft band behind the controls. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-cocoa/90 from-0% via-cocoa/55 via-45% to-cocoa/0 to-75% md:bg-linear-to-r md:from-cocoa/80 md:via-cocoa/45 md:via-42% md:to-72%"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 hidden bg-linear-to-t from-cocoa/45 to-cocoa/0 to-35% md:block" />

      <div className={cn(pageContainer, "on-dark flex flex-col gap-3 pb-5 pt-24 text-white md:gap-[1.125rem] md:pb-14")}>
        <Reveal className="flex flex-col gap-3 md:gap-[1.125rem]">
          <h2 id={titleId} className="max-w-[9em] text-[2.25rem] leading-[1.02] text-balance md:text-[4rem] md:leading-none">
            {name}
          </h2>
          {description && (
            <p className="max-w-[28em] whitespace-pre-line text-[0.9375rem] leading-normal text-white/90 md:text-[1.1875rem] md:leading-[1.55]">
              {description}
            </p>
          )}
          <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-[1.125rem] md:mt-1.5">
            <CtaLink cta={cta} onPhoto />
            {price && <p className="text-base font-semibold">{price}</p>}
          </div>
        </Reveal>

        {(isCarousel || active.caption) && (
          // Phones: counter and caption on one line, controls below. Tablet up: one row under a hairline.
          <div className="mt-1 flex flex-col gap-1 md:mt-[1.375rem] md:flex-row md:items-center md:justify-between md:gap-6 md:border-t md:border-white/25 md:pt-[1.375rem]">
            <p className="flex min-w-0 items-baseline gap-2 text-sm text-white/90 md:gap-3.5 md:text-[0.9375rem]">
              {isCarousel && (
                <span className="shrink-0 font-semibold tabular-nums text-white">
                  <span className="sr-only">Foto </span>
                  {index + 1} / {count}
                </span>
              )}
              {active.caption && <span className="truncate">{active.caption}</span>}
            </p>

            {isCarousel && (
              <div className="-ml-2 flex items-center justify-between gap-2 md:ml-0 md:shrink-0 md:justify-end md:gap-3.5">
                <div
                  role="group"
                  aria-label={`Elegir foto de ${name}`}
                  className={cn("flex items-center", manyPhotos && "max-md:hidden")}
                >
                  {slides.map((slide, position) => (
                    <button
                      key={slide.id}
                      type="button"
                      aria-label={`Ver foto ${position + 1} de ${count}`}
                      aria-current={position === index ? "true" : undefined}
                      aria-controls={slidesId}
                      onClick={() => setIndex(position)}
                      className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full [touch-action:manipulation]"
                    >
                      <span
                        className={cn(
                          "block h-2 rounded-full transition-[width,background-color] duration-500 ease-out-soft",
                          position === index ? "w-7 bg-white md:w-8" : "w-2 bg-white/45",
                        )}
                      />
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 md:gap-3.5">
                  {canAutoplay && (
                    <ControlButton label={userPaused ? "Reanudar los carruseles" : "Pausar los carruseles"} onClick={toggle}>
                      {userPaused ? <PlayIcon /> : <PauseIcon />}
                    </ControlButton>
                  )}
                  {/* Phones show the arrows only when the dots would not fit. */}
                  <ControlButton label="Foto anterior" controls={slidesId} onClick={() => move(-1)} className={cn(!manyPhotos && "max-md:hidden")}>
                    <ChevronLeftIcon />
                  </ControlButton>
                  <ControlButton label="Foto siguiente" controls={slidesId} onClick={() => move(1)} className={cn(!manyPhotos && "max-md:hidden")}>
                    <ChevronRightIcon />
                  </ControlButton>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.section>
  );
}

type SlideProps = {
  slide: ServiceSlide;
  /** "n de total" for a carousel; null when the service has a single photo. */
  label: string | null;
  active: boolean;
  playing: boolean;
  reduceMotion: boolean;
  preload: boolean;
};

/**
 * Photos stay stacked; the active one fades in on top while the previous one waits underneath until
 * the dissolve ends, so the background never shows through mid-fade (same technique as the hero).
 */
function Slide({ slide, label, active, playing, reduceMotion, preload }: SlideProps) {
  const scale = useMotionValue(1);

  useEffect(() => {
    if (reduceMotion) {
      scale.set(1);
      return;
    }
    if (!active) {
      const reset = animate(scale, 1, { duration: 0, delay: CROSSFADE_SECONDS * 2 });
      return () => reset.stop();
    }
    if (!playing) return; // Paused: the zoom freezes with the photo.
    const remaining = ((KEN_BURNS_SCALE - scale.get()) / (KEN_BURNS_SCALE - 1)) * (SLIDE_SECONDS + CROSSFADE_SECONDS);
    const zoom = animate(scale, KEN_BURNS_SCALE, { duration: remaining, ease: "linear" });
    return () => zoom.stop();
  }, [active, playing, reduceMotion, scale]);

  const group = label ? { role: "group" as const, "aria-roledescription": "diapositiva", "aria-label": label } : {};

  return (
    <motion.div
      {...group}
      aria-hidden={!active}
      inert={!active}
      className="absolute inset-0"
      style={{ zIndex: active ? 1 : 0 }}
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{
        duration: reduceMotion ? 0 : CROSSFADE_SECONDS,
        delay: active || reduceMotion ? 0 : CROSSFADE_SECONDS,
        ease: "easeInOut",
      }}
    >
      <motion.div className={active ? "absolute inset-0 will-change-transform" : "absolute inset-0"} style={{ scale }}>
        {/* Full-bleed: small photos are shown whole over a blurred copy instead of being enlarged (spec 012). */}
        <AdaptiveImage src={slide.src} alt={slide.alt} preload={preload} draggable={false} sizes="100vw" fit="cover" />
      </motion.div>
    </motion.div>
  );
}

/** Round translucent control (44 px) over the photo: pause, previous, next. */
function ControlButton({
  label,
  controls,
  onClick,
  className,
  children,
}: {
  label: string;
  controls?: string;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-controls={controls}
      aria-label={label}
      className={cn(
        "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-white/60 bg-white/12 text-white backdrop-blur-sm transition duration-200 ease-spring hover:scale-[1.06] hover:bg-white/28 active:scale-[0.94] [touch-action:manipulation]",
        className,
      )}
    >
      {children}
    </button>
  );
}

function CtaLink({ cta, onPhoto }: { cta: ServiceCarouselProps["cta"]; onPhoto: boolean }) {
  const className = onPhoto
    ? buttonOnPhoto
    : buttonPrimary;
  const content = (
    <>
      {cta.external && <WhatsAppIcon />}
      {cta.label}
    </>
  );
  return cta.external ? (
    <a href={cta.href} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <Link href={cta.href} className={className}>
      {content}
    </Link>
  );
}

/** A service without photos: pastel tile with its type illustration, never an empty frame. */
function FallbackSection({
  anchor,
  titleId,
  name,
  type,
  description,
  price,
  cta,
}: Pick<ServiceCarouselProps, "anchor" | "name" | "type" | "description" | "price" | "cta"> & { titleId: string }) {
  return (
    <section
      id={anchor}
      aria-labelledby={titleId}
      className={cn(
        "relative isolate flex min-h-[35rem] scroll-mt-20 flex-col justify-end overflow-hidden sm:scroll-mt-24 md:min-h-[41.25rem]",
        TONE_BG[toneForServiceType(type)],
      )}
    >
      <div
        aria-hidden="true"
        className="float-gentle absolute left-1/2 top-10 -z-10 w-[min(62vw,16rem)] -translate-x-1/2 md:left-auto md:right-[8%] md:top-1/2 md:w-[min(34vw,24rem)] md:translate-x-0 md:-translate-y-1/2"
      >
        <OccasionArt type={type} className="w-full" />
      </div>
      <div className={cn(pageContainer, "pb-8 pt-72 md:pb-14 md:pt-24")}>
        <Reveal className="flex flex-col gap-3 md:max-w-[34rem] md:gap-[1.125rem]">
          <h2 id={titleId} className="max-w-[9em] text-[2.25rem] leading-[1.02] text-balance md:text-[4rem] md:leading-none">
            {name}
          </h2>
          {description && (
            <p className="max-w-[28em] whitespace-pre-line text-[0.9375rem] leading-normal text-muted md:text-[1.1875rem] md:leading-[1.55]">
              {description}
            </p>
          )}
          <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-[1.125rem] md:mt-1.5">
            <CtaLink cta={cta} onPhoto={false} />
            {price && <p className="text-base font-semibold">{price}</p>}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
