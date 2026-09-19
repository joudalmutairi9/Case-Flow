"use client";

import { useActionState, useMemo, useState } from "react";
import { createCaseAction } from "@/lib/actions/cases";
import { resubmitCaseAction } from "@/lib/actions/cases";
import { useFormStatus } from "react-dom";

const inputCls =
  "rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

type Patient = { id: string; fullName: string; mrn: string };
type Specialty = { id: string; nameAr: string };
type Procedure = { id: string; nameAr: string; specialtyId: string; difficulty: string };

function Buttons() {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="submit"
        name="intent"
        value="draft"
        disabled={pending}
        className="rounded-lg border border-border px-4 py-2 text-sm font-bold text-card-foreground hover:bg-page-bg disabled:opacity-60"
      >
        حفظ كمسودة
      </button>
      <button
        type="submit"
        name="intent"
        value="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "جارٍ الإرسال..." : "إرسال للمشرف للاعتماد"}
      </button>
    </div>
  );
}

export function CaseForm({
  patients,
  specialties,
  procedures,
  defaultPatientId,
  existingCase,
}: {
  patients: Patient[];
  specialties: Specialty[];
  procedures: Procedure[];
  defaultPatientId?: string;
  existingCase?: {
    id: string;
    patientId: string;
    chiefComplaint: string;
    medicalHistoryNote: string | null;
    clinicalExamNote: string;
    toothFdi: string | null;
    specialtyId: string;
    procedureId: string;
    difficulty: string;
    requiredLevel: string;
    priority: string;
    priorityReason: string | null;
    notesForStudent: string | null;
    reviewNote?: string | null;
  };
}) {
  const action = existingCase
    ? resubmitCaseAction.bind(null, existingCase.id)
    : createCaseAction;
  const [state, formAction] = useActionState(action, {});
  const [specialtyId, setSpecialtyId] = useState(existingCase?.specialtyId ?? "");
  const [priority, setPriority] = useState(existingCase?.priority ?? "NORMAL");

  const filteredProcedures = useMemo(
    () => procedures.filter((p) => p.specialtyId === specialtyId),
    [procedures, specialtyId]
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {existingCase?.reviewNote && (
        <p className="rounded-lg bg-warning-bg px-3 py-2 text-sm text-warning">
          ملاحظة المشرف: {existingCase.reviewNote}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-sm font-medium">المريض</span>
          <select
            name="patientId"
            required
            defaultValue={existingCase?.patientId ?? defaultPatientId ?? ""}
            disabled={!!existingCase}
            className={inputCls}
          >
            <option value="">— اختر المريض —</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} ({p.mrn})
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-sm font-medium">الشكوى الرئيسية</span>
          <input
            name="chiefComplaint"
            required
            defaultValue={existingCase?.chiefComplaint}
            className={inputCls}
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-sm font-medium">التاريخ الطبي والأدوية والحساسية</span>
          <textarea
            name="medicalHistoryNote"
            rows={2}
            defaultValue={existingCase?.medicalHistoryNote ?? ""}
            className={inputCls}
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-sm font-medium">الفحص السريري والتشخيص</span>
          <textarea
            name="clinicalExamNote"
            required
            rows={3}
            defaultValue={existingCase?.clinicalExamNote}
            className={inputCls}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">رقم السن (FDI)</span>
          <input
            name="toothFdi"
            placeholder="مثال: 46"
            defaultValue={existingCase?.toothFdi ?? ""}
            className={inputCls}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">المستوى الدراسي المناسب</span>
          <input
            name="requiredLevel"
            required
            placeholder="مثال: BDS4"
            defaultValue={existingCase?.requiredLevel}
            className={inputCls}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">التخصص</span>
          <select
            name="specialtyId"
            required
            value={specialtyId}
            onChange={(e) => setSpecialtyId(e.target.value)}
            className={inputCls}
          >
            <option value="">— اختر —</option>
            {specialties.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nameAr}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">الإجراء المطلوب</span>
          <select
            name="procedureId"
            required
            defaultValue={existingCase?.procedureId ?? ""}
            disabled={!specialtyId}
            className={inputCls}
          >
            <option value="">— اختر التخصص أولاً —</option>
            {filteredProcedures.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nameAr}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">مستوى الصعوبة</span>
          <select
            name="difficulty"
            defaultValue={existingCase?.difficulty ?? "MEDIUM"}
            className={inputCls}
          >
            <option value="SIMPLE">بسيط</option>
            <option value="MEDIUM">متوسط</option>
            <option value="COMPLEX">معقد</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">الأولوية</span>
          <select
            name="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className={inputCls}
          >
            <option value="NORMAL">عادية</option>
            <option value="URGENT">عاجلة</option>
          </select>
        </label>

        {priority === "URGENT" && (
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-sm font-medium">سبب الأولوية العاجلة</span>
            <input
              name="priorityReason"
              defaultValue={existingCase?.priorityReason ?? ""}
              className={inputCls}
            />
          </label>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">نوع الأشعة (اختياري)</span>
          <select name="radiographType" defaultValue="" className={inputCls}>
            <option value="">لا تتطلب</option>
            <option value="PA">ذروية PA</option>
            <option value="BITEWING">مجنّحة Bitewing</option>
            <option value="OPG">بانورامية OPG</option>
            <option value="CBCT">مقطعية CBCT</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">رابط ملف الأشعة (اختياري)</span>
          <input name="radiographUrl" placeholder="رابط الملف المرفوع" className={inputCls} />
        </label>

        <label className="flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            name="consentConfirmed"
            defaultChecked={false}
            className="rounded border-border"
          />
          <span className="text-sm">تم توثيق موافقة المريض على العلاج بواسطة طالب</span>
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-sm font-medium">ملاحظات للطالب (اختياري)</span>
          <textarea
            name="notesForStudent"
            rows={2}
            defaultValue={existingCase?.notesForStudent ?? ""}
            className={inputCls}
          />
        </label>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{state.error}</p>
      )}

      <Buttons />
    </form>
  );
}
