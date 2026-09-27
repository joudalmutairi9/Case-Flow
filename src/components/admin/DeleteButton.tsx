"use client";

import { useActionState } from "react";
import { IconActionButton } from "@/components/ui/IconActionButton";
import { TrashIcon } from "@/components/ui/Icons";
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
        <IconActionButton tone="danger" label={label} icon={<TrashIcon size={16} />} />
      </form>
      {state?.error && <span className="text-xs text-danger">{state.error}</span>}
    </div>
  );
}
