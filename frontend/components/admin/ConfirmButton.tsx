"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState, useTransition, type ReactNode } from "react";
import type { FormState } from "@/lib/admin/form-state";
import { buttonDanger, buttonQuiet, buttonSecondary } from "@/components/ui/styles";
import { duration, exitDuration, spring } from "@/lib/motion";
import { useToast } from "./Toaster";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";

type ConfirmButtonProps = {
  triggerLabel: string;
  /** Accessible name for the trigger when the visible label is ambiguous in a list. */
  triggerAriaLabel?: string;
  triggerClassName?: string;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  onConfirm: () => Promise<FormState>;
};

/** Destructive actions always ask first, in a modal dialog that springs in (scale + fade). */
export function ConfirmButton({
  triggerLabel,
  triggerAriaLabel,
  triggerClassName = buttonQuiet,
  title,
  description,
  confirmLabel,
  onConfirm,
}: ConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const reduceMotion = usePrefersReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) {
        setOpen(false);
        triggerRef.current?.focus();
      }
      // Keep focus inside the dialog: it only has two buttons.
      if (event.key === "Tab") {
        const first = cancelRef.current;
        const last = confirmRef.current;
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, pending]);

  function confirm() {
    startTransition(async () => {
      const result = await onConfirm();
      if (result.status === "success") {
        toast.show(result.message, "success");
        setOpen(false);
      } else if (result.status === "error") {
        toast.show(result.message, "error");
        close();
      }
    });
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        aria-label={triggerAriaLabel}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex items-end justify-center bg-cocoa/50 p-4 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: reduceMotion ? 0 : duration.base } }}
            exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : exitDuration(duration.base) } }}
            onClick={(event) => {
              if (event.target === event.currentTarget && !pending) close();
            }}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              className="w-full max-w-md rounded-2xl border border-border bg-white p-6 sm:p-8"
              initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.94, y: reduceMotion ? 0 : 12 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                transition: reduceMotion ? { duration: 0 } : { ...spring, opacity: { duration: duration.base } },
              }}
              exit={{
                opacity: 0,
                scale: reduceMotion ? 1 : 0.96,
                y: reduceMotion ? 0 : 8,
                transition: { duration: reduceMotion ? 0 : exitDuration(duration.base) },
              }}
            >
              <h2 id={titleId} className="text-xl sm:text-2xl">
                {title}
              </h2>
              <div id={descriptionId} className="mt-3 text-foreground">
                {description}
              </div>
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button ref={cancelRef} type="button" className={buttonSecondary} onClick={close} disabled={pending}>
                  Cancelar
                </button>
                <button ref={confirmRef} type="button" className={buttonDanger} onClick={confirm} disabled={pending}>
                  {pending ? "Eliminando…" : confirmLabel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
