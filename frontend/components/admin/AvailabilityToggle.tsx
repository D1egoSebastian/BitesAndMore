"use client";

import { useState, useTransition } from "react";
import type { FormState } from "@/lib/admin/form-state";
import { cn } from "@/lib/cn";
import { useToast } from "./Toaster";

type AvailabilityToggleProps = {
  productName: string;
  isAvailable: boolean;
  onToggle: (next: boolean) => Promise<FormState>;
};

/** Shows or hides a product on the public site without deleting it (FR-007-6). */
export function AvailabilityToggle({ productName, isAvailable, onToggle }: AvailabilityToggleProps) {
  const [checked, setChecked] = useState(isAvailable);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  function toggle() {
    const next = !checked;
    setChecked(next);
    startTransition(async () => {
      const result = await onToggle(next);
      if (result.status === "error") {
        setChecked(!next);
        toast.show(result.message, "error");
      } else if (result.status === "success") {
        toast.show(result.message, "success");
      }
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`Visible en el sitio: ${productName}`}
      onClick={toggle}
      disabled={pending}
      className="inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-full py-1 pr-2 text-sm font-semibold transition duration-200 ease-spring active:scale-[0.97] disabled:cursor-wait disabled:opacity-60 [touch-action:manipulation]"
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-[1.5px] transition-colors duration-200",
          checked ? "border-primary bg-primary" : "border-cocoa-muted/75 bg-surface",
        )}
      >
        <span
          className={cn(
            "absolute size-5 rounded-full transition duration-300 ease-spring",
            checked ? "translate-x-[1.35rem] bg-white" : "translate-x-0.5 bg-cocoa-muted",
          )}
        />
      </span>
      <span className={checked ? "text-foreground" : "text-muted"}>{checked ? "Visible" : "Oculto"}</span>
    </button>
  );
}
