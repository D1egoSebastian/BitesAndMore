"use client";

import Image from "next/image";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type KeyboardEvent,
  type SyntheticEvent,
} from "react";
import { uploadImage } from "@/app/admin/actions";
import {
  addServiceImageAction,
  deleteServiceImageAction,
  reorderServiceImagesAction,
  updateServiceImageCaptionAction,
} from "@/app/admin/(panel)/servicios/gallery-actions";
import { AlertIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { adminNote, adminPanel, buttonQuiet, buttonSecondary, inputBase } from "@/components/ui/styles";
import { SERVICE_MIN_LONG_SIDE, photoSizeWarning } from "@/lib/admin/image-size";
import { prepareImageForUpload } from "@/lib/admin/resize-image";
import type { ServiceImage } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import {
  MAX_SERVICE_IMAGES,
  galleryCountLabel,
  moveItem,
  remainingGallerySlots,
  sortServiceImages,
} from "@/lib/service-gallery";
import { ConfirmButton } from "./ConfirmButton";
import { PhotoSizeNote } from "./PhotoSizeNote";
import { useToast } from "./Toaster";

type UploadStatus = "waiting" | "uploading" | "done" | "error";
type UploadEntry = { key: string; name: string; status: UploadStatus; message?: string };

const STATUS_LABEL: Record<UploadStatus, string> = {
  waiting: "En espera",
  uploading: "Subiendo…",
  done: "Agregada",
  error: "No se pudo agregar",
};

function sameImages(a: ServiceImage[], b: ServiceImage[]): boolean {
  return (
    a.length === b.length &&
    a.every((image, i) => image.id === b[i].id && image.caption === b[i].caption && image.url === b[i].url)
  );
}

/**
 * Gallery of a service in the admin panel (spec 011): add one or several photos (resized in the
 * browser and uploaded one at a time, with per-file progress), caption, reorder with accessible
 * "Subir"/"Bajar" buttons and delete with confirmation. Every change is saved at once through
 * Server Actions, which refresh the public pages. Lives outside the service <form>.
 */
export function ServiceGallery({ serviceId, images }: { serviceId: number; images: ServiceImage[] | null | undefined }) {
  const serverImages = sortServiceImages(images);
  const [items, setItems] = useState<ServiceImage[]>(serverImages);
  const [syncedFrom, setSyncedFrom] = useState<ServiceImage[]>(serverImages);
  const [uploads, setUploads] = useState<UploadEntry[]>([]);
  const [uploading, setUploading] = useState(false);
  const [reordering, startReorder] = useTransition();
  const [announcement, setAnnouncement] = useState("");
  const pendingFocus = useRef<{ id: number; direction: "up" | "down" } | null>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const inputId = useId();
  const headingId = useId();
  const hintId = useId();
  const toast = useToast();

  // Every gallery action revalidates the site, so the page re-renders with fresh images:
  // adopt them (the "adjust state when props change" pattern, without an effect).
  if (!sameImages(serverImages, syncedFrom)) {
    setSyncedFrom(serverImages);
    setItems(serverImages);
  }

  // Keep keyboard focus on the moved photo's button after reordering.
  useEffect(() => {
    const target = pendingFocus.current;
    if (!target || !listRef.current) return;
    pendingFocus.current = null;
    const preferred = listRef.current.querySelector<HTMLButtonElement>(
      `[data-move="${target.id}-${target.direction}"]:not(:disabled)`,
    );
    const other = listRef.current.querySelector<HTMLButtonElement>(
      `[data-move="${target.id}-${target.direction === "up" ? "down" : "up"}"]`,
    );
    (preferred ?? other)?.focus();
  }, [items]);

  const remaining = remainingGallerySlots(items.length);
  const full = remaining === 0;

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    const images = files.filter((file) => file.type.startsWith("image/"));
    if (images.length < files.length) {
      toast.show("Algunos archivos no son imágenes y no se agregaron. Usa fotos en JPG, PNG o WebP.", "error");
    }
    const accepted = images.slice(0, remaining);
    if (images.length > accepted.length) {
      toast.show(
        accepted.length === 0
          ? `La galería ya tiene ${MAX_SERVICE_IMAGES} fotos, el máximo.`
          : `Solo caben ${accepted.length} fotos más (máximo ${MAX_SERVICE_IMAGES}). Agregamos las primeras.`,
        "error",
      );
    }
    if (accepted.length === 0) return;

    const batch: UploadEntry[] = accepted.map((file, index) => ({
      key: `${Date.now()}-${index}`,
      name: file.name || `Foto ${index + 1}`,
      status: "waiting",
    }));
    setUploads(batch);
    setUploading(true);

    const update = (key: string, patch: Partial<UploadEntry>) =>
      setUploads((current) => current.map((entry) => (entry.key === key ? { ...entry, ...patch } : entry)));

    let added = 0;
    // One at a time: Server Actions are queued anyway and the API assigns the order on arrival.
    for (const [index, file] of accepted.entries()) {
      const { key } = batch[index];
      update(key, { status: "uploading" });
      try {
        const prepared = await prepareImageForUpload(file);
        const formData = new FormData();
        formData.append("file", prepared, prepared.name);
        const upload = await uploadImage(formData);
        if (!upload.ok) {
          update(key, { status: "error", message: upload.message });
          continue;
        }
        const result = await addServiceImageAction(serviceId, upload.url);
        if (!result.ok) {
          update(key, { status: "error", message: result.message });
          continue;
        }
        added += 1;
        setItems((current) => (current.some((image) => image.id === result.data.id) ? current : [...current, result.data]));
        update(key, { status: "done" });
      } catch {
        update(key, { status: "error", message: "No pudimos subir la foto. Comprueba tu conexión e inténtalo otra vez." });
      }
    }

    setUploading(false);
    // Keep only the failures on screen, with their reason.
    setUploads((current) => current.filter((entry) => entry.status === "error"));
    if (added === accepted.length) {
      toast.show(added === 1 ? "Agregamos la foto a la galería." : `Agregamos ${added} fotos a la galería.`, "success");
    } else {
      toast.show(`Agregamos ${added} de ${accepted.length} fotos. Revisa los errores en la galería.`, "error");
    }
  }

  function move(index: number, direction: "up" | "down") {
    const previous = items;
    const next = moveItem(previous, index, direction === "up" ? -1 : 1);
    const moved = previous[index];
    pendingFocus.current = { id: moved.id, direction };
    setItems(next);
    setAnnouncement(`Foto movida a la posición ${next.indexOf(moved) + 1} de ${next.length}.`);

    startReorder(async () => {
      const result = await reorderServiceImagesAction(
        serviceId,
        next.map((image) => image.id),
      );
      if (!result.ok) {
        setItems(previous);
        toast.show(result.message, "error");
      }
    });
  }

  async function saveCaption(image: ServiceImage, value: string) {
    const caption = value.trim() || null;
    if (caption === (image.caption ?? null)) return;

    const result = await updateServiceImageCaptionAction(serviceId, image.id, caption);
    if (result.ok) {
      setItems((current) => current.map((item) => (item.id === image.id ? result.data : item)));
      toast.show(caption ? "Guardamos el pie de foto." : "Quitamos el pie de foto.", "success");
    } else {
      toast.show(result.message, "error");
    }
  }

  async function remove(image: ServiceImage) {
    const result = await deleteServiceImageAction(serviceId, image.id);
    if (result.status === "success") {
      setItems((current) => current.filter((item) => item.id !== image.id));
      headingRef.current?.focus();
    }
    return result;
  }

  return (
    <section aria-labelledby={headingId} className={cn(adminPanel, "mt-8")}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id={headingId} ref={headingRef} tabIndex={-1} className="text-xl sm:text-2xl">
          Galería
        </h2>
        <p className="text-sm font-semibold text-muted" aria-live="polite">
          {galleryCountLabel(items.length)} fotos
        </p>
      </div>
      <p id={hintId} className="mt-2 max-w-[60ch] text-muted">
        Fotos de trabajos de este servicio. En la página de servicios se muestran después de la foto principal, en
        este orden. Se guardan al momento: no hace falta pulsar «Guardar cambios». Cualquier foto sirve; las de
        al menos {SERVICE_MIN_LONG_SIDE} px de ancho se ven más nítidas.
      </p>

      <div className="mt-5 flex flex-col items-start gap-2">
        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          className="peer sr-only"
          aria-describedby={hintId}
          onChange={handleFiles}
          disabled={uploading || full}
        />
        <label
          htmlFor={inputId}
          className={cn(
            buttonSecondary,
            "cursor-pointer peer-focus-visible:shadow-[0_0_0_2px_var(--pink)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cocoa peer-focus-visible:outline-solid",
            (uploading || full) && "pointer-events-none opacity-60",
          )}
        >
          {uploading ? "Subiendo fotos…" : "Agregar fotos"}
        </label>
        <p className="text-sm text-muted">
          {full
            ? `La galería está completa (máximo ${MAX_SERVICE_IMAGES} fotos). Elimina alguna para agregar otra.`
            : `Puedes elegir varias a la vez. Caben ${remaining} más.`}
        </p>
      </div>

      {uploads.length > 0 && (
        <ul aria-label="Fotos en proceso" className="mt-4 flex flex-col gap-2">
          {uploads.map((entry) => (
            <li
              key={entry.key}
              className={cn(
                "flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl px-4 py-2.5",
                entry.status === "error" ? "bg-raspberry/10" : "bg-surface",
              )}
            >
              {entry.status === "error" ? (
                <AlertIcon className="size-4 shrink-0 text-raspberry" />
              ) : entry.status === "done" ? (
                <CheckIcon className="size-4 shrink-0" />
              ) : (
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-4 shrink-0 rounded-full border-2 border-cocoa/30",
                    entry.status === "uploading" && "animate-spin border-t-cocoa",
                  )}
                />
              )}
              <span className="min-w-0 flex-1 truncate font-semibold">{entry.name}</span>
              <span className={cn("text-sm", entry.status === "error" ? "font-semibold text-raspberry" : "text-muted")}>
                {STATUS_LABEL[entry.status]}
                {entry.message ? `: ${entry.message}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {items.length === 0 ? (
        <p className={cn(adminNote, "mt-6")}>
          Aún no hay fotos en la galería. Mientras tanto, la página de servicios muestra solo la foto principal o, si
          no hay, una ilustración.
        </p>
      ) : (
        <ol ref={listRef} className="mt-6 flex flex-col divide-y divide-border border-y border-border">
          {items.map((image, index) => (
            <GalleryRow
              key={image.id}
              image={image}
              position={index + 1}
              total={items.length}
              busy={reordering || uploading}
              onMove={(direction) => move(index, direction)}
              onCaption={(value) => saveCaption(image, value)}
              onDelete={() => remove(image)}
            />
          ))}
        </ol>
      )}
    </section>
  );
}

type GalleryRowProps = {
  image: ServiceImage;
  position: number;
  total: number;
  busy: boolean;
  onMove: (direction: "up" | "down") => void;
  onCaption: (value: string) => Promise<void>;
  onDelete: () => ReturnType<typeof deleteServiceImageAction>;
};

function GalleryRow({ image, position, total, busy, onMove, onCaption, onDelete }: GalleryRowProps) {
  const captionId = useId();
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const sizeWarning = size ? photoSizeWarning({ ...size, minLongSide: SERVICE_MIN_LONG_SIDE }) : null;

  // The thumbnail is unoptimized (the stored original, no srcset): its natural size is the photo's.
  function onThumbnailLoad(event: SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    setSize({ width: naturalWidth, height: naturalHeight });
  }
  const saving = useRef(false);
  const label = `foto ${position} de ${total}`;

  // Enter saves and keeps focus; leaving the field saves too. One request at a time.
  async function commit(value: string) {
    if (saving.current) return;
    saving.current = true;
    try {
      await onCaption(value);
    } finally {
      saving.current = false;
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void commit(event.currentTarget.value);
    }
  }

  return (
    <li className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        <span aria-hidden="true" className="w-6 shrink-0 text-center font-semibold tabular-nums text-muted">
          {position}
        </span>
        <div className="flex w-28 shrink-0 flex-col gap-1">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-surface">
            <Image
              src={image.url}
              alt={image.caption ?? `Foto ${position} de la galería`}
              fill
              sizes="112px"
              unoptimized
              onLoad={onThumbnailLoad}
              className="object-cover"
            />
          </div>
          <p className="min-h-4 text-center text-xs tabular-nums text-muted">
            {size && (
              <>
                <span className="sr-only">Resolución: </span>
                {size.width} × {size.height} px
              </>
            )}
          </p>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <label htmlFor={captionId} className="text-sm font-semibold">
          Pie de foto <span className="font-normal text-muted">(opcional)</span>
        </label>
        <input
          id={captionId}
          defaultValue={image.caption ?? ""}
          maxLength={200}
          placeholder="Ej: Mesa de dulces para un bautizo"
          autoComplete="off"
          onBlur={(event) => void commit(event.currentTarget.value)}
          onKeyDown={onKeyDown}
          className={cn(inputBase, "mt-1.5 min-h-11")}
        />
        {sizeWarning && <PhotoSizeNote message={sizeWarning} className="mt-2" />}
      </div>

      <div className="flex items-center gap-1 sm:self-end">
        <button
          type="button"
          data-move={`${image.id}-up`}
          className={cn(buttonQuiet, "px-3")}
          aria-label={`Subir la ${label}`}
          disabled={busy || position === 1}
          onClick={() => onMove("up")}
        >
          <ChevronLeftIcon className="size-5 rotate-90" />
          <span className="sr-only sm:not-sr-only">Subir</span>
        </button>
        <button
          type="button"
          data-move={`${image.id}-down`}
          className={cn(buttonQuiet, "px-3")}
          aria-label={`Bajar la ${label}`}
          disabled={busy || position === total}
          onClick={() => onMove("down")}
        >
          <ChevronRightIcon className="size-5 rotate-90" />
          <span className="sr-only sm:not-sr-only">Bajar</span>
        </button>
        <ConfirmButton
          triggerLabel="Eliminar"
          triggerAriaLabel={`Eliminar la ${label}`}
          triggerClassName={cn(buttonQuiet, "text-raspberry")}
          title="¿Eliminar esta foto?"
          description="La foto se quitará de la galería y de la página de servicios. Esta acción no se puede deshacer."
          confirmLabel="Eliminar foto"
          onConfirm={onDelete}
        />
      </div>
    </li>
  );
}
