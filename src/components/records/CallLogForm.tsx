"use client";

import { useActionState } from "react";
import { logCallAction } from "@/lib/actions/patients";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function CallLogForm({ patientId }: { patientId: string }) {
  const action = logCallAction.bind(null, patientId);
  const [state, formAction] = useActionState(action, {});

  const inputCls =
    "rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">الاتجاه</span>
        <select name="direction" className={inputCls}>
          <option value="OUTBOUND">صادرة</option>
          <option value="INBOUND">واردة</option>
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">النوع</span>
        <select name="type" className={inputCls}>
          <option value="REMINDER">تذكير</option>
          <option value="CONFIRMATION">تأكيد</option>
          <option value="FOLLOW_UP">متابعة</option>
          <option value="COMPLAINT">شكوى</option>
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">النتيجة</span>
        <input name="outcome" className={inputCls} />
      </label>
      <SubmitButton>تسجيل المكالمة</SubmitButton>
      {state?.ok && <span className="text-sm text-success">تم التسجيل.</span>}
    </form>
  );
}
