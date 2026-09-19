"use client";

import { useActionState } from "react";
import {
  confirmAppointmentAction,
  cancelBookingAction,
  uploadTreatmentPlanAction,
  submitCompletionAction,
} from "@/lib/actions/booking";
import { SubmitButton } from "@/components/ui/SubmitButton";

const inputCls =
  "rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function ConfirmAppointmentForm({
  caseId,
  clinics,
}: {
  caseId: string;
  clinics: { id: string; name: string }[];
}) {
  const [state, formAction] = useActionState(confirmAppointmentAction.bind(null, caseId), {});
  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg bg-page-bg p-3">
      <p className="text-xs text-muted">
        يجب تأكيد الموعد مع المريض خلال 24 ساعة من الحجز، وتجهيز الأدوات، وتوقيع المشرف قبل البدء.
      </p>
      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium">العيادة</span>
          <select name="clinicId" required className={inputCls}>
            {clinics.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium">الموعد</span>
          <input name="scheduledAt" type="datetime-local" required className={inputCls} />
        </label>
      </div>
      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" name="acknowledged" className="rounded border-border" />
        أقر بقراءة إرشادات الحجز والبروتوكول السريري
      </label>
      <div>
        <SubmitButton>تأكيد الموعد</SubmitButton>
      </div>
      {state?.error && <p className="text-xs text-danger">{state.error}</p>}
    </form>
  );
}

export function CancelBookingForm({ caseId }: { caseId: string }) {
  const [state, formAction] = useActionState(cancelBookingAction.bind(null, caseId), {});
  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input name="reason" required placeholder="سبب الإلغاء" className={`${inputCls} text-xs`} />
      <SubmitButton variant="danger" className="text-xs">
        إلغاء الحجز
      </SubmitButton>
      {state?.error && <span className="text-xs text-danger">{state.error}</span>}
    </form>
  );
}

export function TreatmentPlanForm({ caseId }: { caseId: string }) {
  const [state, formAction] = useActionState(uploadTreatmentPlanAction.bind(null, caseId), {});
  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input
        name="treatmentPlanFileUrl"
        required
        placeholder="رابط ملف خطة العلاج"
        className={`${inputCls} text-xs`}
      />
      <SubmitButton className="text-xs">رفع خطة العلاج</SubmitButton>
      {state?.error && <span className="text-xs text-danger">{state.error}</span>}
      {state?.ok && <span className="text-xs text-success">تم الرفع، بانتظار اعتماد المشرف.</span>}
    </form>
  );
}

export function CompletionForm({ caseId }: { caseId: string }) {
  const [state, formAction] = useActionState(submitCompletionAction.bind(null, caseId), {});
  return (
    <form action={formAction} className="flex flex-col gap-2">
      <textarea
        name="completionSummary"
        required
        rows={2}
        placeholder="ملخص الإجراء المنجز (الخطوات، المواد المستخدمة...)"
        className={inputCls}
      />
      <div>
        <SubmitButton>رفع ملخص الإنجاز</SubmitButton>
      </div>
      {state?.error && <p className="text-xs text-danger">{state.error}</p>}
    </form>
  );
}
