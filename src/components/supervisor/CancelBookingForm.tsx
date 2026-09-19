"use client";

import { useActionState } from "react";
import { cancelBookingBySupervisorAction } from "@/lib/actions/review";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function CancelBookingForm({ caseId }: { caseId: string }) {
  const [state, formAction] = useActionState(cancelBookingBySupervisorAction.bind(null, caseId), {});
  return (
    <form action={formAction} className="flex items-center gap-2">
      <input
        name="reason"
        required
        placeholder="سبب الإلغاء"
        className="rounded-lg border border-border bg-white px-2 py-1 text-xs"
      />
      <SubmitButton variant="danger" className="text-xs">
        إلغاء الحجز
      </SubmitButton>
      {state?.error && <span className="text-xs text-danger">{state.error}</span>}
    </form>
  );
}
