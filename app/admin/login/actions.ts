"use server";

import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/errors";
import { toUserMessage } from "@/lib/api/messages";
import { adminReadApi } from "@/lib/api/server";
import { readText } from "@/lib/admin/form-data";
import { storeSessionToken } from "@/lib/session/server";

export type LoginState = { status: "idle" } | { status: "error"; message: string; username: string };

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const username = readText(formData, "username") ?? "";
  const password = formData.get("password");

  if (!username || typeof password !== "string" || !password) {
    return { status: "error", message: "Escribe tu usuario y tu contraseña.", username };
  }

  let token: string;
  try {
    // The API field is called "email", but the seeded admin may use any username.
    token = await adminReadApi.login(username, password);
  } catch (error) {
    const message =
      error instanceof ApiError && error.isUnauthorized
        ? "Usuario o contraseña incorrectos."
        : toUserMessage(error);
    return { status: "error", message, username };
  }

  await storeSessionToken(token);
  redirect("/admin");
}
