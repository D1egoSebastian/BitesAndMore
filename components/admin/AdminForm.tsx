"use client";

import { useRouter } from "next/navigation";
import { startTransition, useActionState, useRef, type FormEvent, type ReactNode } from "react";
import { idleFormState, type FormState } from "@/lib/admin/form-state";
import Link from "next/link";
import { AlertIcon } from "@/components/ui/icons";
import { buttonPrimary, buttonText } from "@/components/ui/styles";
import { useToast } from "./Toaster";

type AdminFormProps = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  pendingLabel?: string;
  /** Where to go after a successful save. Stay on the page when omitted. */
  successHref?: string;
  cancelHref?: string;
  /** Clear the fields after success (e.g. the inline "new category" form). */
  resetOnSuccess?: boolean;
  /** Extra reason to block submission, e.g. an image still uploading. */
  busy?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Admin form wrapper. Submits through a Server Action without React's automatic form reset,
 * so a 400 from the API is shown next to the form and nothing the admin typed is lost.
 */
export function AdminForm({
  action,
  submitLabel,
  pendingLabel = "Guardando…",
  successHref,
  cancelHref,
  resetOnSuccess = false,
  busy = false,
  className,
  children,
}: AdminFormProps) {
  const router = useRouter();
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, dispatch, pending] = useActionState(async (previous: FormState, formData: FormData) => {
    const result = await action(previous, formData);
    if (result.status === "success") {
      toast.show(result.message, "success");
      if (resetOnSuccess) formRef.current?.reset();
      if (successHref) router.push(successHref);
    }
    return result;
  }, idleFormState);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={className}>
      <div className="flex flex-col gap-6">{children}</div>

      {state.status === "error" && (
        <p role="alert" className="mt-6 flex items-start gap-3 rounded-xl border border-raspberry/40 bg-white px-4 py-3 font-semibold text-raspberry">
          <AlertIcon className="mt-0.5 size-5 shrink-0" />
          <span>{state.message}</span>
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-6">
        <button type="submit" className={buttonPrimary} disabled={pending || busy}>
          {pending ? pendingLabel : submitLabel}
        </button>
        {cancelHref && (
          <Link href={cancelHref} className={buttonText}>
            Cancelar
          </Link>
        )}
      </div>
    </form>
  );
}
