"use client";

import { useActionState, useState } from "react";
import { promoteStudentAction } from "@/lib/actions/students";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function PromoteStudentForm({ studentProfileId, currentLevel }: { studentProfileId: string; currentLevel: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(promoteStudentAction.bind(null, studentProfileId), {});

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs font-bold text-primary hover:underline">
        ترقية المستوى
      </button>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input
        name="newLevel"
        defaultValue={currentLevel}
        className="w-24 rounded-lg border border-border bg-white px-2 py-1 text-xs"
      />
      <SubmitButton className="text-xs">حفظ</SubmitButton>
      {state?.error && <span className="text-xs text-danger">{state.error}</span>}
    </form>
  );
}
