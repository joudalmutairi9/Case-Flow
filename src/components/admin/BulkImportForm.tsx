"use client";

import { useActionState } from "react";
import { bulkImportUsersAction, type BulkImportResult } from "@/lib/actions/users";
import { SubmitButton } from "@/components/ui/SubmitButton";

const initial: BulkImportResult = { createdCount: 0, rejected: [] };

export function BulkImportForm() {
  const [state, formAction] = useActionState(bulkImportUsersAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        استيراد جماعي للطلاب أو أطباء الامتياز من ملف Excel. الأعمدة المتوقعة: الاسم، اسم
        المستخدم، الرقم الجامعي، المستوى.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">الدور</span>
          <select
            name="role"
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="STUDENT">طالب</option>
            <option value="INTERN">طبيب امتياز</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">ملف Excel</span>
          <input
            type="file"
            name="file"
            accept=".xlsx,.xls,.csv"
            required
            className="text-sm"
          />
        </label>
        <SubmitButton>استيراد</SubmitButton>
      </div>

      {state.createdCount > 0 && (
        <p className="rounded-lg bg-success-bg px-3 py-2 text-sm text-success">
          تم إنشاء {state.createdCount} حساب بنجاح.
        </p>
      )}
      {state.rejected.length > 0 && (
        <div className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">
          <p className="font-medium">أسطر مرفوضة ({state.rejected.length}):</p>
          <ul className="mt-1 list-inside list-disc">
            {state.rejected.slice(0, 10).map((r, i) => (
              <li key={i}>
                السطر {r.row}: {r.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
