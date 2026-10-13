import "server-only";

/** Origin of BitesAndMore.API. Server-only: the browser never talks to the API directly. */
export const API_URL = (process.env.API_URL || "http://localhost:5047").replace(/\/+$/, "");

/** Seconds a public page may serve cached API data before refreshing it in the background. */
export const PUBLIC_REVALIDATE_SECONDS = 60;
