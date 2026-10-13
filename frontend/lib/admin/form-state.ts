// Result shape shared by admin Server Actions and the client forms that call them.

export type FormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export const idleFormState: FormState = { status: "idle" };

export function success(message: string): FormState {
  return { status: "success", message };
}

export function failure(message: string): FormState {
  return { status: "error", message };
}

export type UploadResult = { ok: true; url: string } | { ok: false; message: string };
