"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useId, useRef, useState, type ChangeEvent, type SyntheticEvent } from "react";
import { uploadImage } from "@/app/admin/actions";
import { ImagePlaceholder } from "@/components/media/MediaImage";
import { PRODUCT_MIN_LONG_SIDE, photoSizeWarning } from "@/lib/admin/image-size";
import { prepareImageForUpload } from "@/lib/admin/resize-image";
import { PhotoSizeNote } from "./PhotoSizeNote";
import { buttonQuiet, buttonSecondary } from "@/components/ui/styles";
import { useToast } from "./Toaster";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";

type ImageUploadProps = {
  /** Name of the hidden input that carries the final URL. */
  name: string;
  label: string;
  initialUrl: string | null;
  /** Used for the placeholder letter. */
  itemName: string | null;
  onBusyChange?: (busy: boolean) => void;
  /** Long side below which a "small photo" hint is shown (spec 012). Products by default. */
  minLongSide?: number;
};

/**
 * Picks a photo, previews it immediately, uploads it through a Server Action and keeps the
 * returned Cloudinary URL in a hidden input. The preview crossfades between images. When the
 * previewed photo (the chosen file or the stored original) is small, a non-blocking hint suggests
 * a larger one.
 */
export function ImageUpload({
  name,
  label,
  initialUrl,
  itemName,
  onBusyChange,
  minLongSide = PRODUCT_MIN_LONG_SIDE,
}: ImageUploadProps) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [preview, setPreview] = useState<string | null>(initialUrl);
  const [previewSize, setPreviewSize] = useState<{ src: string; width: number; height: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const statusId = useId();
  const toast = useToast();
  const reduceMotion = usePrefersReducedMotion();

  function setBusy(busy: boolean) {
    setUploading(busy);
    onBusyChange?.(busy);
  }

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.show("El archivo no es una imagen. Usa una foto en JPG, PNG o WebP.", "error");
      return;
    }

    setBusy(true);
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      const prepared = await prepareImageForUpload(file);
      const formData = new FormData();
      formData.append("file", prepared, prepared.name);
      const result = await uploadImage(formData);

      if (result.ok) {
        setUrl(result.url);
        setPreview(result.url);
        toast.show("Imagen subida. Guarda los cambios para conservarla.", "success");
      } else {
        setPreview(url);
        toast.show(result.message, "error");
      }
    } catch {
      setPreview(url);
      toast.show("No pudimos subir la imagen. Comprueba tu conexión e inténtalo otra vez.", "error");
    } finally {
      URL.revokeObjectURL(localPreview);
      setBusy(false);
    }
  }

  function removeImage() {
    setUrl(null);
    setPreview(null);
  }

  // The preview is unoptimized (no srcset), so its natural size is the real size of the photo.
  function onPreviewLoad(event: SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (preview) setPreviewSize({ src: preview, width: naturalWidth, height: naturalHeight });
  }

  const sizeWarning =
    preview && previewSize?.src === preview
      ? photoSizeWarning({ width: previewSize.width, height: previewSize.height, minLongSide })
      : null;

  return (
    <fieldset>
      <legend className="font-semibold">{label}</legend>
      <input type="hidden" name={name} value={url ?? ""} />

      <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="media-frame w-40 shrink-0">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface">
            <AnimatePresence initial={false}>
              <motion.div
                key={preview ?? "placeholder"}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: uploading ? 0.6 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.35 }}
              >
                {preview ? (
                  <Image
                    src={preview}
                    alt="Vista previa de la imagen"
                    fill
                    sizes="160px"
                    unoptimized
                    onLoad={onPreviewLoad}
                    className="object-cover"
                  />
                ) : (
                  <ImagePlaceholder name={itemName} label="" />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/*"
            className="peer sr-only"
            aria-describedby={statusId}
            onChange={handleChange}
            disabled={uploading}
          />
          <label htmlFor={inputId} className={`${buttonSecondary} cursor-pointer peer-focus-visible:shadow-[0_0_0_2px_var(--pink)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cocoa peer-focus-visible:outline-solid ${uploading ? "pointer-events-none opacity-60" : ""}`}>
            {url ? "Cambiar imagen" : "Elegir imagen"}
          </label>
          {url && !uploading && (
            <button type="button" className={buttonQuiet} onClick={removeImage}>
              Quitar imagen
            </button>
          )}
          <p id={statusId} className="text-sm text-muted" aria-live="polite">
            {uploading
              ? "Subiendo imagen…"
              : url
                ? "La imagen se guardará con los cambios."
                : "Sin imagen: el sitio mostrará un recuadro neutro con la inicial del nombre."}
          </p>
          <div aria-live="polite">{sizeWarning && <PhotoSizeNote message={sizeWarning} />}</div>
        </div>
      </div>
    </fieldset>
  );
}
