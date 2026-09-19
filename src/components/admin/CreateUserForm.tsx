"use client";

import { useActionState, useState } from "react";
import { createUserAction } from "@/lib/actions/users";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ROLE_LABEL_AR } from "@/lib/portals";
import type { Role } from "@prisma/client";

const ROLES: Role[] = ["STUDENT", "INTERN", "SUPERVISOR", "RECORDS", "SUPER_ADMIN"];

export function CreateUserForm({
  specialties,
}: {
  specialties: { id: string; nameAr: string }[];
}) {
  const [state, formAction] = useActionState(createUserAction, {});
  const [role, setRole] = useState<Role>("STUDENT");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="الاسم الكامل">
          <input name="fullName" required className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </Field>
        <Field label="اسم المستخدم">
          <input name="username" required className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </Field>
        <Field label="الدور">
          <select
            name="role"
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL_AR[r]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="البريد الإلكتروني (اختياري)">
          <input name="email" type="email" className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </Field>
        <Field label="الجوال (اختياري)">
          <input name="phone" className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </Field>
        <Field label="تاريخ انتهاء الحساب (اختياري)">
          <input name="accountExpiresAt" type="date" className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </Field>

        {role === "STUDENT" && (
          <>
            <Field label="الرقم الجامعي">
              <input name="studentNumber" required className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </Field>
            <Field label="المستوى الدراسي">
              <input name="level" required placeholder="مثال: BDS4" className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </Field>
          </>
        )}

        {role === "INTERN" && (
          <>
            <Field label="فترة الدورة">
              <input name="rotationLabel" className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </Field>
            <Field label="القسم">
              <input name="department" className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </Field>
          </>
        )}

        {role === "SUPERVISOR" && (
          <Field label="التخصص">
            <select name="specialtyId" className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
              <option value="">— اختر —</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameAr}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>

      {state?.error && (
        <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{state.error}</p>
      )}
      {state?.tempPassword && (
        <p className="rounded-lg bg-success-bg px-3 py-2 text-sm text-success">
          تم إنشاء الحساب. كلمة المرور المؤقتة: <b dir="ltr">{state.tempPassword}</b> — يجب على
          المستخدم تغييرها عند أول دخول.
        </p>
      )}

      <SubmitButton>إنشاء الحساب</SubmitButton>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-card-foreground">{label}</span>
      {children}
    </label>
  );
}
