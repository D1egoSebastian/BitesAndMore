import "server-only";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ApiClient } from "../api/client";
import { ApiError } from "../api/errors";
import { toUserMessage } from "../api/messages";
import { createAuthorizedApi } from "../api/server";
import { clearSessionToken, EXPIRED_LOGIN_PATH, readSessionToken } from "../session/server";

type RunResult<T> = { ok: true; data: T } | { ok: false; message: string; error: unknown };

type RunOptions = {
  /**
   * By default any 401 ends the session (FR-007-3). Change-password is the exception:
   * there a 401 means "current password is wrong" (FR-007-11).
   */
  unauthorizedIsError?: boolean;
};

/**
 * Runs an authenticated API call from a Server Action. Every action verifies the session
 * itself (the proxy is only an optimistic first check). Expired or rejected sessions clear
 * the cookie and send the admin back to the login page with a notice.
 */
export async function runAdminAction<T>(
  call: (api: ApiClient) => Promise<T>,
  options: RunOptions = {},
): Promise<RunResult<T>> {
  const token = await readSessionToken();
  if (!token) return endSession();

  try {
    return { ok: true, data: await call(createAuthorizedApi(token)) };
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized && !options.unauthorizedIsError) {
      return endSession();
    }
    return { ok: false, message: toUserMessage(error), error };
  }
}

async function endSession(): Promise<never> {
  await clearSessionToken();
  redirect(EXPIRED_LOGIN_PATH);
}

/** Public pages are cached for 60 s; refresh them right after the admin changes content. */
export function refreshPublicSite(): void {
  revalidatePath("/", "layout");
}
