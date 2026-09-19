"use client";

import { useActionState } from "react";
import { markUrgentAction, withdrawFromBankAction } from "@/lib/actions/review";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function ToggleUrgentButton({ caseId, urgent }: { caseId: string; urgent: boolean }) {
  const [, formAction] = useActionState(async () => {
    await markUrgentAction(caseId, !urgent);
    return null;
  }, null);
  return (
    <form action={formAction}>
      <SubmitButton variant="ghost" className="text-xs">
        {urgent ? "إلغاء التمييز العاجل" : "تمييز كعاجلة"}
      </SubmitButton>
    </form>
  );
}

export function WithdrawCaseForm({ caseId }: { caseId: string }) {
  const [state, formAction] = useActionState(withdrawFromBankAction.bind(null, caseId), {});
  return (
    <form action={formAction} className="flex items-center gap-2">
      <input
        name="note"
        placeholder="سبب السحب (اختياري)"
        className="rounded-lg border border-border bg-white px-2 py-1 text-xs"
      />
      <SubmitButton variant="danger" className="text-xs">
        سحب من البنك
      </SubmitButton>
      {state?.error && <span className="text-xs text-danger">{state.error}</span>}
    </form>
  );
}
