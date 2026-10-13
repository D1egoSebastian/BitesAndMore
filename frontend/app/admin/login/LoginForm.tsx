"use client";

import { useActionState } from "react";
import { AlertIcon } from "@/components/ui/icons";
import { buttonPrimary, inputBase } from "@/components/ui/styles";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { status: "idle" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const username = state.status === "error" ? state.username : "";

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      <div>
        <label htmlFor="username" className="font-semibold">
          Usuario
        </label>
        <input
          key={`username-${username}`}
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          defaultValue={username}
          className={`${inputBase} mt-2`}
        />
      </div>
      <div>
        <label htmlFor="password" className="font-semibold">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={`${inputBase} mt-2`}
        />
      </div>

      {state.status === "error" && (
        <p role="alert" className="flex items-start gap-3 rounded-xl border border-raspberry/40 bg-white px-4 py-3 font-semibold text-raspberry">
          <AlertIcon className="mt-0.5 size-5 shrink-0" />
          <span>{state.message}</span>
        </p>
      )}

      <button type="submit" className={`${buttonPrimary} mt-2 w-full`} disabled={pending}>
        {pending ? "Iniciando sesión…" : "Iniciar sesión"}
      </button>
    </form>
  );
}
