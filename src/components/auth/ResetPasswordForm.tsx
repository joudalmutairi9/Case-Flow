"use client";

import { useActionState } from "react";
import { resetPasswordAction, type ActionState } from "@/lib/actions/auth";
import type { PortalKey } from "@/lib/portals";

const initialState: ActionState = {};

export function ResetPasswordForm({ portal, token }: { portal: PortalKey; token: string }) {
  const action = resetPasswordAction.bind(null, portal, token);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">كلمة المرور الجديدة</label>
        <input
          type="password"
          name="newPassword"
          required
          className="rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">تأكيد كلمة المرور</label>
        <input
          type="password"
          name="confirmPassword"
          required
          className="rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
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
        {pending ? "جاري الحفظ..." : "تعيين كلمة المرور"}
      </button>
    </form>
  );
}
