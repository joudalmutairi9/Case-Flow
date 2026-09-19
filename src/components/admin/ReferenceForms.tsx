"use client";

import { useActionState } from "react";
import {
  createSpecialtyAction,
  createProcedureAction,
  toggleSpecialtyAction,
  toggleProcedureAction,
  createClinicAction,
  toggleClinicAction,
  createAcademicPeriodAction,
  setActivePeriodAction,
  upsertQuotaAction,
} from "@/lib/actions/reference-data";
import type { ActionState } from "@/lib/actions/auth";
import { STUDENT_LEVELS } from "@/lib/levels";
import { SubmitButton } from "@/components/ui/SubmitButton";

const inputCls =
  "rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

function ErrorOrOk({ state }: { state: ActionState }) {
  if (state?.error) return <p className="text-sm text-danger">{state.error}</p>;
  if (state?.ok) return <p className="text-sm text-success">تم الحفظ بنجاح.</p>;
  return null;
}

export function CreateSpecialtyForm() {
  const [state, formAction] = useActionState(createSpecialtyAction, {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">الرمز</span>
        <input name="code" required placeholder="ENDO" className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">الاسم بالعربية</span>
        <input name="nameAr" required className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">الاسم بالإنجليزية</span>
        <input name="nameEn" required className={inputCls} />
      </label>
      <SubmitButton>إضافة تخصص</SubmitButton>
      <ErrorOrOk state={state} />
    </form>
  );
}

export function ToggleSpecialtyButton({ id, isActive }: { id: string; isActive: boolean }) {
  return (
    <form action={toggleSpecialtyAction.bind(null, id, !isActive)}>
      <SubmitButton variant="ghost" className="text-xs">
        {isActive ? "تعطيل" : "تفعيل"}
      </SubmitButton>
    </form>
  );
}

export function CreateProcedureForm({
  specialties,
}: {
  specialties: { id: string; nameAr: string }[];
}) {
  const [state, formAction] = useActionState(createProcedureAction, {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">التخصص</span>
        <select name="specialtyId" required className={inputCls}>
          {specialties.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nameAr}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">الاسم بالعربية</span>
        <input name="nameAr" required className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">الاسم بالإنجليزية</span>
        <input name="nameEn" required className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">مستوى الصعوبة</span>
        <select name="difficulty" className={inputCls} defaultValue="MEDIUM">
          <option value="SIMPLE">بسيط</option>
          <option value="MEDIUM">متوسط</option>
          <option value="COMPLEX">معقد</option>
        </select>
      </label>
      <SubmitButton>إضافة إجراء</SubmitButton>
      <ErrorOrOk state={state} />
    </form>
  );
}

export function ToggleProcedureButton({ id, isActive }: { id: string; isActive: boolean }) {
  return (
    <form action={toggleProcedureAction.bind(null, id, !isActive)}>
      <SubmitButton variant="ghost" className="text-xs">
        {isActive ? "تعطيل" : "تفعيل"}
      </SubmitButton>
    </form>
  );
}

export function CreateClinicForm() {
  const [state, formAction] = useActionState(createClinicAction, {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">اسم العيادة</span>
        <input name="name" required className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">النوع</span>
        <select name="type" className={inputCls} defaultValue="STUDENT">
          <option value="STUDENT">عيادة طلاب</option>
          <option value="SPECIALTY">عيادة تخصصية</option>
        </select>
      </label>
      <SubmitButton>إضافة عيادة</SubmitButton>
      <ErrorOrOk state={state} />
    </form>
  );
}

export function ToggleClinicButton({ id, isActive }: { id: string; isActive: boolean }) {
  return (
    <form action={toggleClinicAction.bind(null, id, !isActive)}>
      <SubmitButton variant="ghost" className="text-xs">
        {isActive ? "تعطيل" : "تفعيل"}
      </SubmitButton>
    </form>
  );
}

export function CreateAcademicPeriodForm() {
  const [state, formAction] = useActionState(createAcademicPeriodAction, {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">اسم الفترة</span>
        <input name="name" required placeholder="الفصل الأول 2026" className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">تاريخ البداية</span>
        <input name="startDate" type="date" required className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">تاريخ النهاية</span>
        <input name="endDate" type="date" required className={inputCls} />
      </label>
      <SubmitButton>إضافة فترة</SubmitButton>
      <ErrorOrOk state={state} />
    </form>
  );
}

export function SetActivePeriodButton({ id, isActive }: { id: string; isActive: boolean }) {
  if (isActive) return <span className="text-xs text-success">الفترة النشطة</span>;
  return (
    <form action={setActivePeriodAction.bind(null, id)}>
      <SubmitButton variant="ghost" className="text-xs">
        تفعيل هذه الفترة
      </SubmitButton>
    </form>
  );
}

export function UpsertQuotaForm({
  specialties,
  periods,
}: {
  specialties: { id: string; nameAr: string }[];
  periods: { id: string; name: string }[];
}) {
  const [state, formAction] = useActionState(upsertQuotaAction, {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">المستوى الدراسي</span>
        <select name="level" required defaultValue="" className={inputCls}>
          <option value="" disabled>
            — اختر —
          </option>
          {STUDENT_LEVELS.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">التخصص</span>
        <select name="specialtyId" required className={inputCls}>
          {specialties.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nameAr}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">الفترة الأكاديمية</span>
        <select name="academicTermId" required className={inputCls}>
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">العدد المطلوب</span>
        <input name="requiredCount" type="number" min={1} required className={inputCls} />
      </label>
      <SubmitButton>حفظ الحصة</SubmitButton>
      <ErrorOrOk state={state} />
    </form>
  );
}
