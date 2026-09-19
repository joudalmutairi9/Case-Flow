"use client";

import { useActionState } from "react";
import { forgotPasswordAction, type ActionState } from "@/lib/actions/auth";
import type { PortalKey } from "@/lib/portals";

const initialState: ActionState = {};

export function ForgotPasswordForm({ portal }: { portal: PortalKey }) {
  const action = forgotPasswordAction.bind(null, portal);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">اسم المستخدم</label>
        <input
          name="username"
          required
          className="rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      {state?.error && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            state.ok ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
          }`}
          role="alert"
        >
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
      </button>
    </form>
  );
}
