import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/Card";
import { toggleUserStatusAction, unlockUserAction, deleteUserAction } from "@/lib/actions/users";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ToggleStatusButton, UnlockButton } from "@/components/admin/ToggleStatusButton";

export default async function InternsPage() {
  const interns = await prisma.internProfile.findMany({
    include: { user: true, group: true },
    orderBy: { user: { fullName: "asc" } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-card-foreground">أطباء الامتياز</h1>
          <p className="text-sm text-muted">فتح وإغلاق حسابات أطباء الامتياز ومتابعة دوراتهم</p>
        </div>
        <Link
          href="/admin/users?role=INTERN"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          + طبيب امتياز جديد
        </Link>
      </div>

      <Card title={`القائمة (${interns.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-x-2 text-sm">
            <thead>
              <tr className="border-b border-border text-right text-muted">
                <th className="pb-2">الاسم</th>
                <th className="pb-2">اسم المستخدم</th>
                <th className="pb-2">القسم / الدورة</th>
                <th className="pb-2">المجموعة</th>
                <th className="pb-2">الحالة</th>
                <th className="pb-2">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {interns.map((i) => {
                const isLocked = i.user.lockedUntil && i.user.lockedUntil > new Date();
                return (
                  <tr key={i.id} className="border-b border-border align-top last:border-0">
                    <td className="py-2.5">{i.user.fullName}</td>
                    <td className="py-2.5" dir="ltr">{i.user.username}</td>
                    <td className="py-2.5 text-muted">
                      {i.department ?? "—"} {i.rotationLabel ? `— ${i.rotationLabel}` : ""}
                    </td>
                    <td className="py-2.5 text-muted">{i.group?.name ?? "بدون مجموعة"}</td>
                    <td className="py-2.5">
                      {isLocked ? (
                        <Badge tone="danger">مقفل</Badge>
                      ) : i.user.status === "ACTIVE" ? (
                        <Badge tone="success">نشط</Badge>
                      ) : (
                        <Badge tone="warning">معطّل</Badge>
                      )}
                    </td>
                    <td className="py-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <ToggleStatusButton
                          action={toggleUserStatusAction.bind(null, i.user.id, i.user.status === "ACTIVE")}
                          active={i.user.status === "ACTIVE"}
                          activeLabel="إغلاق الحساب"
                          inactiveLabel="فتح الحساب"
                        />
                        {isLocked && <UnlockButton action={unlockUserAction.bind(null, i.user.id)} />}
                        <DeleteButton
                          action={deleteUserAction.bind(null, i.user.id)}
                          confirmMessage={`تأكيد حذف حساب طبيب الامتياز "${i.user.fullName}"؟ لا يمكن التراجع.`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {interns.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-muted">
                    لا يوجد أطباء امتياز مسجلون بعد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
