import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/Card";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { BulkImportForm } from "@/components/admin/BulkImportForm";
import { ResetPasswordButton } from "@/components/admin/ResetPasswordButton";
import { toggleUserStatusAction, unlockUserAction } from "@/lib/actions/users";
import { ROLE_LABEL_AR } from "@/lib/portals";

export default async function AdminUsersPage() {
  const [users, specialties] = await Promise.all([
    prisma.user.findMany({
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
        <CreateUserForm specialties={specialties} />
      </Card>

      <Card title="استيراد جماعي (Excel)">
        <BulkImportForm />
      </Card>

      <Card title={`كل المستخدمين (${users.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
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
