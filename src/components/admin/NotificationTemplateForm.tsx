"use client";

import { useActionState } from "react";
import { upsertNotificationTemplateAction } from "@/lib/actions/settings";
import { SubmitButton } from "@/components/ui/SubmitButton";

const inputCls =
  "rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function NotificationTemplateForm({
  template,
}: {
  template?: {
    eventKey: string;
    titleAr: string;
    bodyAr: string;
    channel: string;
  };
}) {
  const [state, formAction] = useActionState(upsertNotificationTemplateAction, {});
  return (
    <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className="text-sm font-medium">مفتاح الحدث</span>
        <input
          name="eventKey"
          required
          readOnly={!!template}
          defaultValue={template?.eventKey}
          placeholder="مثال: CASE_PENDING_REVIEW"
          className={`${inputCls} ${template ? "bg-page-bg" : ""}`}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">العنوان</span>
        <input name="titleAr" required defaultValue={template?.titleAr} className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">القناة</span>
        <select name="channel" defaultValue={template?.channel ?? "IN_APP"} className={inputCls}>
          <option value="IN_APP">داخل المنصة</option>
          <option value="EMAIL">بريد إلكتروني</option>
          <option value="SMS">SMS</option>
        </select>
      </label>
      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className="text-sm font-medium">نص الرسالة</span>
        <textarea
          name="bodyAr"
          required
          rows={2}
          defaultValue={template?.bodyAr}
          className={inputCls}
        />
      </label>
      <div className="sm:col-span-2">
        <SubmitButton>{template ? "تحديث القالب" : "إضافة قالب"}</SubmitButton>
        {state?.error && <p className="mt-2 text-sm text-danger">{state.error}</p>}
        {state?.ok && <p className="mt-2 text-sm text-success">تم الحفظ.</p>}
      </div>
    </form>
  );
}
