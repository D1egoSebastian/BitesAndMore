/** Trimmed text field, or null when empty. */
export function readText(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

/** Positive integer field (ids), or null. */
export function readId(formData: FormData, name: string): number | null {
  const value = readText(formData, name);
  if (!value || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return id > 0 ? id : null;
}

export function readCheckbox(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}
