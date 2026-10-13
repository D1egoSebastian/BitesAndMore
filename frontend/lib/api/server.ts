import "server-only";
import { cache } from "react";
import { API_URL, PUBLIC_REVALIDATE_SECONDS } from "../config";
import { createApiClient } from "./client";

/** Cache tag shared by every public read, so admin writes can refresh the whole site at once. */
export const CATALOG_TAG = "catalog";

/** Public reads: cached on the server and refreshed every minute (no token, no CORS). */
export const publicApi = createApiClient({
  baseUrl: API_URL,
  readInit: { next: { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [CATALOG_TAG] } },
});

/** Deduplicated per request: the layout and the page both need the business info. */
export const getBusinessInfo = cache(() => publicApi.getBusinessInfo());

/** Admin reads always hit the API so the panel shows the current state. */
export const adminReadApi = createApiClient({
  baseUrl: API_URL,
  readInit: { cache: "no-store" },
});

export function createAuthorizedApi(token: string) {
  return createApiClient({ baseUrl: API_URL, token, readInit: { cache: "no-store" } });
}
