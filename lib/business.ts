import type { BusinessInfo } from "./api/types";
import { displayText } from "./format";

export const DEFAULT_BUSINESS_NAME = "Bites and More";

export function businessNameOf(info: BusinessInfo | null): string {
  return displayText(info?.businessName) ?? DEFAULT_BUSINESS_NAME;
}
