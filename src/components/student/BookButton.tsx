"use client";

import { useActionState } from "react";
import { bookCaseAction } from "@/lib/actions/booking";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function BookButton({ caseId }: { caseId: string }) {
  const [state, formAction] = useActionState(async () => bookCaseAction(caseId), null);
  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <SubmitButton>حجز الحالة</SubmitButton>
      {state?.error && <span className="text-xs text-danger">{state.error}</span>}
    </form>
  );
}
