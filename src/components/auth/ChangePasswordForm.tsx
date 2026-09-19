"use client";

import { useActionState } from "react";
import { changePasswordAction, type ActionState } from "@/lib/actions/auth";
import type { PortalKey } from "@/lib/portals";

const initialState: ActionState = {};

export function ChangePasswordForm({ portal, forced }: { portal: PortalKey; forced?: boolean }) {
  const action = changePasswordAction.bind(null, portal);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {forced && (
        <p className="rounded-lg bg-warning-bg px-3 py-2 text-sm text-warning">
          هذه كلمة مرور مؤقتة. يجب تغييرها قبل المتابعة.
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">كلمة المرور الحالية</label>
        <input
          type="password"
          name="currentPassword"
          required
          autoComplete="current-password"
          className="rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">كلمة المرور الجديدة</label>
        <input
          type="password"
          name="newPassword"
          required
          autoComplete="new-password"
          className="rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">تأكيد كلمة المرور الجديدة</label>
        <input
          type="password"
          name="confirmPassword"
          required
          autoComplete="new-password"
          className="rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <p className="text-xs text-muted">
        8 أحرف على الأقل، وتحتوي على حرف كبير وصغير ورقم ورمز.
      </p>
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
        {pending ? "جاري الحفظ..." : "حفظ كلمة المرور الجديدة"}
      </button>
    </form>
  );
}
