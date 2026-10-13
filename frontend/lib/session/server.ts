import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isTokenExpired, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "./token";

export const LOGIN_PATH = "/admin/login";
export const EXPIRED_LOGIN_PATH = "/admin/login?expired=1";

/** Returns the stored JWT if it exists and has not expired. */
export async function readSessionToken(): Promise<string | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token && !isTokenExpired(token) ? token : null;
}

/** Only callable from Server Actions or Route Handlers. */
export async function storeSessionToken(token: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/** Only callable from Server Actions or Route Handlers. */
export async function clearSessionToken(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/** For Server Components: sends visitors without a valid session to the login page. */
export async function requireSessionForPage(): Promise<void> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) redirect(LOGIN_PATH);
  if (isTokenExpired(raw)) redirect(EXPIRED_LOGIN_PATH);
}
