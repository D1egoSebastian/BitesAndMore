"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { cn } from "@/lib/cn";
import { cloudinaryBlurLoader, cloudinaryPhotoLoader, isCloudinaryUrl, isVectorSource } from "@/lib/media/cloudinary";
import { chooseFit, containBox } from "@/lib/media/fit";

type AdaptiveImageProps = {
  src: string;
  alt: string;
  /** Width of the frame at each breakpoint, as accurate as possible (it drives the srcset choice). */
  sizes: string;
  preload?: boolean;
  draggable?: boolean;
  /** "adaptive" (default) picks cover or contain per photo; "cover" always fills (small admin thumbnails). */
  fit?: "adaptive" | "cover";
  /** Classes for the layer that holds the photo and its backdrop, e.g. a hover zoom. */
  className?: string;
};

type Size = { width: number; height: number };
type FrameSize = Size & { dpr: number };

/** Current frame size and screen density; keeps the previous object when nothing changed. */
function readFrame(element: HTMLElement, current: FrameSize | null): FrameSize {
  const next = { width: element.clientWidth, height: element.clientHeight, dpr: window.devicePixelRatio || 1 };
  return current && current.width === next.width && current.height === next.height && current.dpr === next.dpr
    ? current
    : next;
}

/**
 * Real pixel size of the loaded resource. `naturalWidth` of an <img> with a `w` srcset is
 * density-corrected (it divides by the descriptor/slot ratio, not by what the server returned),
 * so a second, srcset-less image is pointed at the same URL: it comes from the memory cache.
 */
function measureResource(img: HTMLImageElement): Promise<Size> {
  const probe = new window.Image();
  probe.src = img.currentSrc || img.src;
  const read = () => ({ width: probe.naturalWidth, height: probe.naturalHeight });
  if (probe.complete && probe.naturalWidth > 0) return Promise.resolve(read());
  return new Promise((resolve) => {
    probe.onload = () => resolve(read());
    probe.onerror = () => resolve({ width: 0, height: 0 });
  });
}

/**
 * Photo that adapts to its frame (spec 012, ADR-026). Fills a positioned parent like
 * `<Image fill className="object-cover">` did. Once the photo has loaded and the frame is
 * measured, `chooseFit` decides: "cover" when the aspect ratios are close and the photo is sharp
 * enough; otherwise "contain": the whole photo, centered and never over-enlarged (`containBox`),
 * over a blurred, slightly darkened copy of itself. Until then the frame shows its pastel tone and
 * the photo fades in afterwards (instantly with reduced motion; always visible without JavaScript).
 * Cloudinary photos are requested with a `c_limit` loader, so they are never enlarged server side.
 */
export function AdaptiveImage({ src, alt, sizes, preload, draggable, fit = "adaptive", className }: AdaptiveImageProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState<FrameSize | null>(null);
  const [natural, setNatural] = useState<Size & { src: string } | null>(null);
  const adaptive = fit === "adaptive";
  const cloudinary = isCloudinaryUrl(src);
  const vector = isVectorSource(src);

  useEffect(() => {
    const element = frameRef.current;
    if (!adaptive || !element) return;
    const observer = new ResizeObserver(() => setFrame((current) => readFrame(element, current)));
    observer.observe(element);
    return () => observer.disconnect();
  }, [adaptive]);

  function onLoad(event: SyntheticEvent<HTMLImageElement>) {
    if (!adaptive) return;
    // Also measured here: ResizeObserver only reports during a rendering step, which may come later.
    const element = frameRef.current;
    if (element) setFrame((current) => readFrame(element, current));
    const loadedSrc = src;
    void measureResource(event.currentTarget).then((size) => setNatural({ ...size, src: loadedSrc }));
  }

  // Only trust a measurement of the current source (the same instance may get a new src).
  const measured = natural && natural.src === src && natural.width > 0 ? natural : null;
  const input =
    measured && frame && frame.width > 0 && frame.height > 0
      ? { imageW: measured.width, imageH: measured.height, frameW: frame.width, frameH: frame.height, dpr: frame.dpr, vector }
      : null;
  const mode = adaptive ? (input ? chooseFit(input) : null) : "cover";
  const box = mode === "contain" && input ? containBox(input) : null;
  const ready = mode !== null;

  return (
    <div
      ref={frameRef}
      data-adaptive-image=""
      data-ready={ready ? "true" : "false"}
      data-fit={mode ?? undefined}
      className="absolute inset-0 overflow-hidden transition-opacity duration-500 ease-out-soft motion-reduce:transition-none"
    >
      <div className={cn("absolute inset-0", className)}>
        {adaptive && (
          // Decorative backdrop: always requested (it is tiny) so it is ready when contain is chosen.
          <div aria-hidden="true" className={cn("absolute inset-0 transition-opacity duration-300", mode === "contain" ? "opacity-100" : "opacity-0")}>
            <Image
              src={src}
              alt=""
              fill
              sizes="64px"
              loader={cloudinary ? cloudinaryBlurLoader : undefined}
              draggable={false}
              className="scale-125 select-none object-cover blur-xl brightness-[0.82] saturate-[0.8]"
            />
          </div>
        )}
        <div
          className="absolute inset-0 m-auto"
          style={box ? { width: box.width, height: box.height } : { width: "100%", height: "100%" }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            preload={preload}
            loader={cloudinary ? cloudinaryPhotoLoader : undefined}
            draggable={draggable}
            onLoad={onLoad}
            className="select-none object-cover"
          />
        </div>
      </div>
    </div>
  );
}
