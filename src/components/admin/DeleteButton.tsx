"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { ActionState } from "@/lib/actions/auth";

export function DeleteButton({
  action,
  confirmMessage,
  label = "حذف",
}: {
  action: () => Promise<ActionState>;
  confirmMessage: string;
  label?: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(async () => action(), {});

  return (
    <div className="flex flex-col items-start gap-1">
      <form
        action={formAction}
        onSubmit={(e) => {
          if (!window.confirm(confirmMessage)) e.preventDefault();
        }}
      >
        <SubmitButton variant="danger" className="text-xs">
          {label}
        </SubmitButton>
      </form>
      {state?.error && <span className="text-xs text-danger">{state.error}</span>}
    </div>
  );
}
