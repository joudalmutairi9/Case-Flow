"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { loginAction, type ActionState } from "@/lib/actions/auth";
import type { PortalKey } from "@/lib/portals";

const initialState: ActionState = {};

export function LoginForm({
  portal,
  usernameHint,
}: {
  portal: PortalKey;
  usernameHint: string;
}) {
  const action = loginAction.bind(null, portal);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="username" className="text-sm font-medium text-card-foreground">
          اسم المستخدم
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          required
          placeholder={usernameHint}
          className="rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-card-foreground">
          كلمة المرور
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 left-2 text-xs text-muted hover:text-primary"
          >
            {showPassword ? "إخفاء" : "إظهار"}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-muted">
          <input type="checkbox" name="remember" className="rounded border-border" />
          تذكرني
        </label>
        <Link href={`/${portal}/forgot-password`} className="text-primary hover:underline">
          نسيت كلمة المرور؟
        </Link>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "جاري الدخول..." : "تسجيل الدخول"}
      </button>
    </form>
  );
}
