"use client";

import { useActionState, useState } from "react";
import {
  approveCaseAction,
  requestRevisionAction,
  rejectCaseAction,
  signStartTreatmentAction,
  approveTreatmentPlanAction,
  evaluateCaseAction,
} from "@/lib/actions/review";
import { SubmitButton } from "@/components/ui/SubmitButton";

const inputCls =
  "rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function ApprovalPanel({
  caseId,
  specialties,
  currentSpecialtyId,
  currentDifficulty,
  currentLevel,
}: {
  caseId: string;
  specialties: { id: string; nameAr: string }[];
  currentSpecialtyId: string;
  currentDifficulty: string;
  currentLevel: string;
}) {
  const approve = useActionState(approveCaseAction.bind(null, caseId), {});
  const revise = useActionState(requestRevisionAction.bind(null, caseId), {});
  const reject = useActionState(rejectCaseAction.bind(null, caseId), {});
  const [mode, setMode] = useState<"approve" | "revise" | "reject" | null>(null);

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-3">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setMode(mode === "approve" ? null : "approve")}
          className="rounded-lg bg-success px-3 py-1.5 text-xs font-bold text-white"
        >
          اعتماد وطرح في البنك
        </button>
        <button
          onClick={() => setMode(mode === "revise" ? null : "revise")}
          className="rounded-lg bg-warning px-3 py-1.5 text-xs font-bold text-white"
        >
          إعادة للتعديل
        </button>
        <button
          onClick={() => setMode(mode === "reject" ? null : "reject")}
          className="rounded-lg bg-danger px-3 py-1.5 text-xs font-bold text-white"
        >
          رفض
        </button>
      </div>

      {mode === "approve" && (
        <form action={approve[1]} className="flex flex-wrap items-end gap-3 rounded-lg bg-page-bg p-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium">التخصص (يمكن التعديل)</span>
            <select name="specialtyId" defaultValue={currentSpecialtyId} className={inputCls}>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameAr}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium">الصعوبة</span>
            <select name="difficulty" defaultValue={currentDifficulty} className={inputCls}>
              <option value="SIMPLE">بسيط</option>
              <option value="MEDIUM">متوسط</option>
              <option value="COMPLEX">معقد</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium">المستوى المناسب</span>
            <input name="requiredLevel" defaultValue={currentLevel} className={inputCls} />
          </label>
          <SubmitButton>تأكيد الاعتماد</SubmitButton>
          {approve[0]?.error && <p className="text-sm text-danger">{approve[0].error}</p>}
        </form>
      )}

      {mode === "revise" && (
        <form action={revise[1]} className="flex flex-col gap-2 rounded-lg bg-page-bg p-3">
          <textarea
            name="note"
            required
            rows={2}
            placeholder="اكتب سبب الإعادة للتعديل..."
            className={inputCls}
          />
          <div>
            <SubmitButton variant="ghost">إرسال للتعديل</SubmitButton>
          </div>
          {revise[0]?.error && <p className="text-sm text-danger">{revise[0].error}</p>}
        </form>
      )}

      {mode === "reject" && (
        <form action={reject[1]} className="flex flex-col gap-2 rounded-lg bg-page-bg p-3">
          <textarea name="note" required rows={2} placeholder="سبب الرفض..." className={inputCls} />
          <div>
            <SubmitButton variant="danger">تأكيد الرفض</SubmitButton>
          </div>
          {reject[0]?.error && <p className="text-sm text-danger">{reject[0].error}</p>}
        </form>
      )}
    </div>
  );
}

export function SignStartTreatmentButton({ caseId }: { caseId: string }) {
  const [, formAction] = useActionState(async () => {
    await signStartTreatmentAction(caseId);
    return null;
  }, null);
  return (
    <form action={formAction}>
      <SubmitButton>توقيع بدء العلاج</SubmitButton>
    </form>
  );
}

export function ApproveTreatmentPlanButton({ caseId }: { caseId: string }) {
  const [, formAction] = useActionState(async () => {
    await approveTreatmentPlanAction(caseId);
    return null;
  }, null);
  return (
    <form action={formAction}>
      <SubmitButton variant="ghost">اعتماد خطة العلاج</SubmitButton>
    </form>
  );
}

export function EvaluationForm({ caseId }: { caseId: string }) {
  const [state, formAction] = useActionState(evaluateCaseAction.bind(null, caseId), {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-lg bg-page-bg p-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium">الدرجة (0-100)</span>
        <input name="score" type="number" min={0} max={100} required className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium">النتيجة</span>
        <select name="passed" className={inputCls} defaultValue="true">
          <option value="true">اعتماد الإنجاز</option>
          <option value="false">طلب إعادة</option>
        </select>
      </label>
      <label className="flex flex-col gap-1.5 grow">
        <span className="text-xs font-medium">ملاحظات</span>
        <input name="rubricNotes" className={inputCls} />
      </label>
      <SubmitButton>حفظ التقييم</SubmitButton>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
