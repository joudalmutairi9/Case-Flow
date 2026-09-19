"use client";

import { useActionState, useState } from "react";
import { promoteStudentAction } from "@/lib/actions/students";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { STUDENT_LEVELS } from "@/lib/levels";

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

  const isKnownLevel = (STUDENT_LEVELS as readonly string[]).includes(currentLevel);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <select
        name="newLevel"
        defaultValue={currentLevel}
        className="rounded-lg border border-border bg-white px-2 py-1 text-xs"
      >
        {!isKnownLevel && <option value={currentLevel}>{currentLevel} (حالي)</option>}
        {STUDENT_LEVELS.map((lvl) => (
          <option key={lvl} value={lvl}>
            {lvl}
          </option>
        ))}
      </select>
      <SubmitButton className="text-xs">حفظ</SubmitButton>
      {state?.error && <span className="text-xs text-danger">{state.error}</span>}
    </form>
  );
}
