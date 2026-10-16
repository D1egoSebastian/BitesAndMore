"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertIcon, CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { duration, exitDuration, spring } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";

type ToastTone = "success" | "error";
type Toast = { id: number; message: string; tone: ToastTone };
type ToastApi = { show: (message: string, tone?: ToastTone) => void };

const ToastContext = createContext<ToastApi | null>(null);

const VISIBLE_MS = 4500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const reduceMotion = usePrefersReducedMotion();

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message: string, tone: ToastTone = "success") => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-2), { id, message, tone }]);
      window.setTimeout(() => dismiss(id), VISIBLE_MS);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:left-auto sm:right-6 sm:w-96"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout={!reduceMotion}
              initial={{ opacity: 0, x: reduceMotion ? 0 : 48, scale: reduceMotion ? 1 : 0.96 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                transition: reduceMotion ? { duration: 0 } : { ...spring, opacity: { duration: duration.base } },
              }}
              exit={{
                opacity: 0,
                x: reduceMotion ? 0 : 48,
                transition: { duration: reduceMotion ? 0 : exitDuration(duration.base) },
              }}
              transition={reduceMotion ? { duration: 0 } : { layout: spring }}
              className={cn(
                "on-dark pointer-events-auto flex w-full items-start gap-3 rounded-xl px-4 py-3 font-semibold",
                toast.tone === "success" ? "bg-cocoa text-white" : "bg-raspberry text-white",
              )}
            >
              {toast.tone === "success" ? (
                <CheckIcon className="mt-0.5 size-5 shrink-0 text-caramel" />
              ) : (
                <AlertIcon className="mt-0.5 size-5 shrink-0" />
              )}
              <span className="flex-1">{toast.message}</span>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="-my-2 -mr-2 inline-flex min-h-10 cursor-pointer items-center rounded-full px-2 text-sm underline underline-offset-2"
              >
                Cerrar
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>");
  return context;
}
