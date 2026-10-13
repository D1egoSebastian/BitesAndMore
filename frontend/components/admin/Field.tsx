import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { inputBase } from "@/components/ui/styles";

type FieldShellProps = { id: string; label: string; hint?: ReactNode; optional?: boolean; children: ReactNode };

function FieldShell({ id, label, hint, optional, children }: FieldShellProps) {
  return (
    <div>
      <label htmlFor={id} className="font-semibold">
        {label}
        {optional && <span className="font-normal text-muted"> (opcional)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
    </div>
  );
}

type BaseProps = { id: string; label: string; hint?: ReactNode; optional?: boolean };

export function TextField({ id, label, hint, optional, ...input }: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell id={id} label={label} hint={hint} optional={optional}>
      <input id={id} name={id} aria-describedby={hint ? `${id}-hint` : undefined} className={inputBase} {...input} />
    </FieldShell>
  );
}

export function TextAreaField({
  id,
  label,
  hint,
  optional,
  ...textarea
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell id={id} label={label} hint={hint} optional={optional}>
      <textarea
        id={id}
        name={id}
        rows={4}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={`${inputBase} min-h-28 leading-relaxed`}
        {...textarea}
      />
    </FieldShell>
  );
}

export function SelectField({
  id,
  label,
  hint,
  optional,
  children,
  ...select
}: BaseProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell id={id} label={label} hint={hint} optional={optional}>
      <select id={id} name={id} aria-describedby={hint ? `${id}-hint` : undefined} className={inputBase} {...select}>
        {children}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({
  id,
  label,
  hint,
  ...input
}: Omit<BaseProps, "optional"> & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        name={id}
        type="checkbox"
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="mt-1 size-5 shrink-0 cursor-pointer accent-primary"
        {...input}
      />
      <div>
        <label htmlFor={id} className="font-semibold">
          {label}
        </label>
        {hint && (
          <p id={`${id}-hint`} className="text-sm text-muted">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
