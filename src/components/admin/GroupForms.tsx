"use client";

import { useActionState } from "react";
import {
  createSupervisionGroupAction,
  assignStudentToGroupAction,
  assignInternToGroupAction,
} from "@/lib/actions/groups";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { ActionState } from "@/lib/actions/auth";

const inputCls =
  "rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

function ErrorOrOk({ state }: { state: ActionState }) {
  if (state?.error) return <p className="text-sm text-danger">{state.error}</p>;
  if (state?.ok) return <p className="text-sm text-success">تم الحفظ.</p>;
  return null;
}

export function CreateGroupForm({
  supervisors,
}: {
  supervisors: { id: string; fullName: string }[];
}) {
  const [state, formAction] = useActionState(createSupervisionGroupAction, {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">اسم المجموعة</span>
        <input name="name" required className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">المشرف</span>
        <select name="supervisorId" required className={inputCls}>
          {supervisors.map((s) => (
            <option key={s.id} value={s.id}>
              {s.fullName}
            </option>
          ))}
        </select>
      </label>
      <SubmitButton>إنشاء مجموعة</SubmitButton>
      <ErrorOrOk state={state} />
    </form>
  );
}

export function AssignStudentForm({
  students,
  groups,
}: {
  students: { id: string; fullName: string }[];
  groups: { id: string; name: string }[];
}) {
  const [state, formAction] = useActionState(assignStudentToGroupAction, {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">الطالب</span>
        <select name="studentProfileId" required className={inputCls}>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.fullName}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">المجموعة</span>
        <select name="groupId" required className={inputCls}>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </label>
      <SubmitButton>تعيين</SubmitButton>
      <ErrorOrOk state={state} />
    </form>
  );
}

export function AssignInternForm({
  interns,
  groups,
}: {
  interns: { id: string; fullName: string }[];
  groups: { id: string; name: string }[];
}) {
  const [state, formAction] = useActionState(assignInternToGroupAction, {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">طبيب الامتياز</span>
        <select name="internProfileId" required className={inputCls}>
          {interns.map((s) => (
            <option key={s.id} value={s.id}>
              {s.fullName}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">المجموعة</span>
        <select name="groupId" required className={inputCls}>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </label>
      <SubmitButton>تعيين</SubmitButton>
      <ErrorOrOk state={state} />
    </form>
  );
}
