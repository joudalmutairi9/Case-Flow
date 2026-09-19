"use client";

import { useActionState } from "react";
import { updateSettingsAction } from "@/lib/actions/settings";
import { SubmitButton } from "@/components/ui/SubmitButton";

const inputCls =
  "rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const [state, formAction] = useActionState(updateSettingsAction, {});
  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">اسم المستشفى</span>
        <input name="hospitalName" defaultValue={settings.hospitalName} className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">المنطقة الزمنية</span>
        <input name="timezone" defaultValue={settings.timezone} className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">الحد الأقصى للحجوزات المفتوحة لكل طالب</span>
        <input
          name="maxOpenBookingsPerStudent"
          type="number"
          min={1}
          defaultValue={settings.maxOpenBookingsPerStudent}
          className={inputCls}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">مهلة تأكيد الموعد (ساعات)</span>
        <input
          name="appointmentConfirmHours"
          type="number"
          min={1}
          defaultValue={settings.appointmentConfirmHours}
          className={inputCls}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">مهلة الإلغاء قبل الموعد (ساعات)</span>
        <input
          name="cancellationHours"
          type="number"
          min={1}
          defaultValue={settings.cancellationHours}
          className={inputCls}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">مدة بقاء الحالة في البنك قبل التنبيه (أيام)</span>
        <input
          name="bankExpiryDays"
          type="number"
          min={1}
          defaultValue={settings.bankExpiryDays}
          className={inputCls}
        />
      </label>
      <div className="sm:col-span-2">
        <SubmitButton>حفظ الإعدادات</SubmitButton>
        {state?.ok && <p className="mt-2 text-sm text-success">تم الحفظ.</p>}
      </div>
    </form>
  );
}
