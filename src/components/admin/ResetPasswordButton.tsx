"use client";

import { useActionState } from "react";
import { resetUserPasswordAction } from "@/lib/actions/users";
import { IconActionButton } from "@/components/ui/IconActionButton";
import { KeyIcon } from "@/components/ui/Icons";

export function ResetPasswordButton({ userId }: { userId: string }) {
  const [state, formAction] = useActionState<
    { tempPassword?: string } | null,
    FormData
  >(async () => resetUserPasswordAction(userId), null);

  return (
    <div className="flex flex-col items-start gap-1">
      <form action={formAction}>
        <IconActionButton tone="tertiary" label="إعادة تعيين كلمة المرور" icon={<KeyIcon size={16} />} />
      </form>
      {state?.tempPassword && (
        <span className="rounded bg-success-bg px-2 py-1 text-xs text-success" dir="ltr">
          {state.tempPassword}
        </span>
      )}
    </div>
  );
}
