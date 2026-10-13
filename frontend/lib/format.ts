/** Returns trimmed text, or null when there is nothing to show. */
export function displayText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Prices are free text (ADR-002): shown exactly as entered, never parsed or reformatted. */
export function displayPrice(price: string | null | undefined): string | null {
  return displayText(price);
}
