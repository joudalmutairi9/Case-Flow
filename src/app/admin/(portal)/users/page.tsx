import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/Card";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { BulkImportForm } from "@/components/admin/BulkImportForm";
import { ResetPasswordButton } from "@/components/admin/ResetPasswordButton";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { toggleUserStatusAction, unlockUserAction, deleteUserAction } from "@/lib/actions/users";
import { ROLE_LABEL_AR } from "@/lib/portals";
import Link from "next/link";
import type { Role } from "@prisma/client";

const ROLE_TABS: { key: Role | "ALL"; label: string }[] = [
  { key: "ALL", label: "الكل" },
  { key: "STUDENT", label: "الطلاب" },
  { key: "INTERN", label: "أطباء الامتياز" },
  { key: "SUPERVISOR", label: "المشرفون" },
  { key: "RECORDS", label: "السجلات" },
  { key: "SUPER_ADMIN", label: "السوبر أدمن" },
];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const activeRole = (ROLE_TABS.find((r) => r.key === role)?.key ?? "ALL") as Role | "ALL";

  const [users, specialties] = await Promise.all([
    prisma.user.findMany({
      where: activeRole === "ALL" ? {} : { role: activeRole },
      orderBy: { createdAt: "desc" },
      include: { studentProfile: true, internProfile: true, supervisorProfile: true },
    }),
    prisma.specialty.findMany({ where: { isActive: true } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">إدارة المستخدمين</h1>
        <p className="text-sm text-muted">إنشاء وتعديل وتعطيل حسابات كل البوابات</p>
      </div>

      <Card title="إنشاء حساب جديد">
        <CreateUserForm
          specialties={specialties}
          defaultRole={activeRole === "ALL" ? "STUDENT" : activeRole}
        />
      </Card>

      <Card title="استيراد جماعي (Excel)">
        <BulkImportForm />
      </Card>

      <Card
        title={`كل المستخدمين (${users.length})`}
        action={
          <div className="flex flex-wrap gap-2">
            {ROLE_TABS.map((t) => (
              <Link
                key={t.key}
                href={t.key === "ALL" ? "/admin/users" : `/admin/users?role=${t.key}`}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  activeRole === t.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-page-bg text-muted hover:text-primary"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-x-2 text-sm">
            <thead>
              <tr className="border-b border-border text-right text-muted">
                <th className="pb-2">الاسم</th>
                <th className="pb-2">اسم المستخدم</th>
                <th className="pb-2">الدور</th>
                <th className="pb-2">الحالة</th>
                <th className="pb-2">آخر دخول</th>
                <th className="pb-2">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isLocked = user.lockedUntil && user.lockedUntil > new Date();
                return (
                  <tr key={user.id} className="border-b border-border align-top last:border-0">
                    <td className="py-2.5">
                      {user.fullName}
                      {user.mustChangePassword && (
                        <span className="mr-2 text-xs text-warning">(بانتظار تغيير كلمة المرور)</span>
                      )}
                    </td>
                    <td className="py-2.5" dir="ltr">
                      {user.username}
                    </td>
                    <td className="py-2.5">{ROLE_LABEL_AR[user.role]}</td>
                    <td className="py-2.5">
                      {isLocked ? (
                        <Badge tone="danger">مقفل</Badge>
                      ) : user.status === "ACTIVE" ? (
                        <Badge tone="success">نشط</Badge>
                      ) : (
                        <Badge tone="warning">معطّل</Badge>
                      )}
                    </td>
                    <td className="py-2.5 text-muted">
                      {user.lastLoginAt ? user.lastLoginAt.toLocaleString("ar-SA") : "—"}
                    </td>
                    <td className="py-2.5">
                      <div className="flex flex-wrap gap-2">
                        <form action={toggleUserStatusAction.bind(null, user.id, user.status === "ACTIVE")}>
                          <SubmitButton variant="ghost" className="text-xs">
                            {user.status === "ACTIVE" ? "تعطيل" : "تفعيل"}
                          </SubmitButton>
                        </form>
                        {isLocked && (
                          <form action={unlockUserAction.bind(null, user.id)}>
                            <SubmitButton variant="ghost" className="text-xs">
                              فتح القفل
                            </SubmitButton>
                          </form>
                        )}
                        <ResetPasswordButton userId={user.id} />
                        <DeleteButton
                          action={deleteUserAction.bind(null, user.id)}
                          confirmMessage={`تأكيد حذف حساب "${user.fullName}"؟ لا يمكن التراجع عن هذا الإجراء.`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
