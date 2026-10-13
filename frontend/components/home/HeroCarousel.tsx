"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  type MotionValue,
  type PanInfo,
} from "framer-motion";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from "@/components/ui/icons";
import { swipeDirection, wrapSlideIndex, type HeroSlide } from "@/lib/hero-slides";
import { duration, easeOut, exitDuration, spring } from "@/lib/motion";
import { HeroBite } from "./HeroBite";
import { AdaptiveImage } from "@/components/media/AdaptiveImage";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";

/** Time each slide stays on screen while autoplaying. */
const SLIDE_SECONDS = 5;
/** Crossfade between slides. Slower than the UI tokens on purpose: it is a photo dissolve. */
const CROSSFADE_SECONDS = 0.7;
/** Ken Burns: the visible photo slowly grows to this scale over its time on screen. */
const KEN_BURNS_SCALE = 1.08;

const IMAGE_SIZES = "(min-width: 1024px) 520px, (min-width: 768px) 45vw, (min-width: 552px) 520px, 92vw";

function subscribeToVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

const isTabHidden = () => document.hidden;
const isTabHiddenOnServer = () => false;

/**
 * Home hero carousel inside THE BITE frame (WAI-ARIA carousel pattern).
 * Autoplays every 5 s with a crossfade and a slow Ken Burns zoom. Autoplay pauses while the
 * pointer is over it, while keyboard focus is inside it, while the tab is hidden, and with the
 * visible pause button; it never starts under prefers-reduced-motion. Slides change with the
 * arrows, the dots, a swipe/drag or the left/right keys.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const count = slides.length;
  const reduceMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [keyboardInside, setKeyboardInside] = useState(false);
  const tabHidden = useSyncExternalStore(subscribeToVisibility, isTabHidden, isTabHiddenOnServer);
  const slidesId = useId();

  const canAutoplay = count > 1 && !reduceMotion;
  const playing = canAutoplay && !userPaused && !hovered && !keyboardInside && !tabHidden;

  // 0..1 progress of the current slide; drives the timer and the active dot's fill.
  const progress = useMotionValue(0);

  const move = useCallback((delta: number) => setIndex((current) => wrapSlideIndex(current, delta, count)), [count]);

  useEffect(() => {
    progress.set(0);
  }, [index, progress]);

  useEffect(() => {
    if (!playing) return;
    // Resumes from where it was paused instead of restarting the slide.
    const controls = animate(progress, 1, {
      duration: (1 - progress.get()) * SLIDE_SECONDS,
      ease: "linear",
      onComplete: () => move(1),
    });
    return () => controls.stop();
  }, [playing, index, progress, move]);

  function onPointerEnter(event: PointerEvent) {
    if (event.pointerType === "mouse") setHovered(true);
  }

  function onPointerLeave(event: PointerEvent) {
    if (event.pointerType === "mouse") setHovered(false);
  }

  function onFocus(event: FocusEvent<HTMLDivElement>) {
    // Only keyboard focus stops the rotation (WAI); a mouse click on a dot must not freeze it.
    if (event.target instanceof HTMLElement && event.target.matches(":focus-visible")) setKeyboardInside(true);
  }

  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setKeyboardInside(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
  }

  function onDragEnd(_event: unknown, info: PanInfo) {
    const direction = swipeDirection(info.offset.x, info.velocity.x);
    if (direction !== 0) move(direction);
  }

  const active = slides[index];

  return (
    <div
      role="region"
      aria-roledescription="carrusel"
      aria-label="Nuestros postres"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      <HeroBite>
        <motion.div
          id={slidesId}
          aria-live={playing ? "off" : "polite"}
          className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
          drag={count > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={onDragEnd}
        >
          {slides.map((slide, position) => (
            <Slide
              key={slide.id}
              slide={slide}
              label={`${position + 1} de ${count}`}
              active={position === index}
              playing={playing}
              reduceMotion={reduceMotion}
              preload={position === 0}
            />
          ))}
        </motion.div>

        {/* Caption of real products: name and link to its page. Outside the drag layer so a swipe never clicks it. */}
        <AnimatePresence initial={false} mode="popLayout">
          {active?.caption && (
            <motion.div
              key={active.id}
              className="absolute bottom-3.5 left-3.5 z-10 max-w-[calc(100%-1.75rem)] sm:bottom-6 sm:left-6 sm:max-w-[calc(100%-3rem)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { duration: duration.slow, ease: easeOut, delay: 0.15 } }}
              exit={{ opacity: 0, y: 6, transition: { duration: exitDuration(duration.base) } }}
            >
              <Link
                href={active.caption.href}
                className="group/caption flex items-center gap-3 rounded-full bg-white py-2 pl-2 pr-5 shadow-[0_8px_24px_-8px_rgb(59_37_34/0.25)] transition duration-200 ease-spring hover:-translate-y-0.5 sm:gap-3.5 sm:py-2.5 sm:pl-2.5 sm:pr-6"
              >
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blush sm:size-9"
                >
                  <CheckIcon className="size-[1.125rem]" />
                </span>
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="sr-only">Ver producto: </span>
                  <span className="truncate text-sm font-semibold decoration-accent decoration-2 underline-offset-4 group-hover/caption:underline sm:text-[0.9375rem]">
                    {active.caption.label}
                  </span>
                  {active.caption.meta && (
                    <span className="hidden truncate text-[0.8125rem] text-muted sm:block">{active.caption.meta}</span>
                  )}
                </span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </HeroBite>

      {count > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3 sm:mt-5">
          <div role="group" aria-label="Elegir diapositiva" className="-ml-1.5 flex items-center">
            {slides.map((slide, position) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Ir a la diapositiva ${position + 1}`}
                aria-current={position === index ? "true" : undefined}
                aria-controls={slidesId}
                onClick={() => setIndex(position)}
                className="inline-flex h-11 min-w-6 cursor-pointer items-center justify-center rounded-full px-1 [touch-action:manipulation]"
              >
                <span
                  className={`relative block h-2 overflow-hidden rounded-full bg-line transition-[width] duration-500 ease-out-soft ${
                    position === index ? "w-9" : "w-2"
                  }`}
                >
                  {position === index && <DotFill progress={progress} full={!playing} />}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            {canAutoplay && (
              <ControlButton
                onClick={() => setUserPaused((value) => !value)}
                label={userPaused ? "Reanudar el carrusel" : "Pausar el carrusel"}
              >
                {userPaused ? <PlayIcon /> : <PauseIcon />}
              </ControlButton>
            )}
            <ControlButton controls={slidesId} label="Diapositiva anterior" onClick={() => move(-1)}>
              <ChevronLeftIcon />
            </ControlButton>
            <ControlButton controls={slidesId} label="Diapositiva siguiente" onClick={() => move(1)}>
              <ChevronRightIcon />
            </ControlButton>
          </div>
        </div>
      )}
    </div>
  );
}

type SlideProps = {
  slide: HeroSlide;
  label: string;
  active: boolean;
  playing: boolean;
  reduceMotion: boolean;
  preload: boolean;
};

/**
 * All slides stay stacked; the active one fades in on top while the previous one waits
 * underneath until the dissolve ends, so the background never shows through mid-fade.
 */
function Slide({ slide, label, active, playing, reduceMotion, preload }: SlideProps) {
  const scale = useMotionValue(1);

  useEffect(() => {
    if (reduceMotion) {
      scale.set(1);
      return;
    }
    if (!active) {
      // Reset the zoom once this slide is fully hidden.
      const reset = animate(scale, 1, { duration: 0, delay: CROSSFADE_SECONDS * 2 });
      return () => reset.stop();
    }
    if (!playing) return; // Paused: the zoom freezes with the slide.
    const remaining = ((KEN_BURNS_SCALE - scale.get()) / (KEN_BURNS_SCALE - 1)) * (SLIDE_SECONDS + CROSSFADE_SECONDS);
    const zoom = animate(scale, KEN_BURNS_SCALE, { duration: remaining, ease: "linear" });
    return () => zoom.stop();
  }, [active, playing, reduceMotion, scale]);

  return (
    <motion.div
      role="group"
      aria-roledescription="diapositiva"
      aria-label={label}
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
        <AdaptiveImage src={slide.src} alt={slide.alt} preload={preload} draggable={false} sizes={IMAGE_SIZES} />
      </motion.div>
    </motion.div>
  );
}

/** Active dot: a pink fill that grows with the slide's progress; shows full when not autoplaying. */
function DotFill({ progress, full }: { progress: MotionValue<number>; full: boolean }) {
  return (
    <motion.span
      className="absolute inset-0 origin-left rounded-full bg-accent"
      style={full ? { scaleX: 1 } : { scaleX: progress }}
    />
  );
}

/** Round white control (44 px) with a soft shadow: pause, previous, next. */
function ControlButton({
  label,
  controls,
  onClick,
  children,
}: {
  label: string;
  controls?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-controls={controls}
      aria-label={label}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={spring}
      className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-cocoa shadow-[0_4px_14px_-2px_rgb(59_37_34/0.18)] [touch-action:manipulation]"
    >
      {children}
    </motion.button>
  );
}
