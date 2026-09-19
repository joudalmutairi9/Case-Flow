"use client";

import { useActionState } from "react";
import { createPatientAction } from "@/lib/actions/patients";
import { SubmitButton } from "@/components/ui/SubmitButton";

const inputCls =
  "rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function PatientForm() {
  const [state, formAction] = useActionState(createPatientAction, {});

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className="text-sm font-medium">الاسم الرباعي</span>
        <input name="fullName" required className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">رقم الهوية / الإقامة</span>
        <input name="nationalId" required dir="ltr" className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">الجوال</span>
        <input name="phone" required dir="ltr" className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">تاريخ الميلاد</span>
        <input name="dob" type="date" required className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">الجنس</span>
        <select name="gender" className={inputCls} defaultValue="MALE">
          <option value="MALE">ذكر</option>
          <option value="FEMALE">أنثى</option>
        </select>
      </label>
      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className="text-sm font-medium">العنوان (اختياري)</span>
        <input name="address" className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">جهة الاتصال للطوارئ (اختياري)</span>
        <input name="emergencyContact" className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">الأمراض المزمنة (اختياري)</span>
        <input name="chronicConditions" placeholder="سكري، ضغط..." className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className="text-sm font-medium">الحساسية (اختياري)</span>
        <input name="allergies" className={inputCls} />
      </label>

      {state?.error && (
        <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger sm:col-span-2">
          {state.error}
        </p>
      )}

      <div className="sm:col-span-2">
        <SubmitButton>تسجيل المريض وفتح الملف</SubmitButton>
      </div>
    </form>
  );
}
