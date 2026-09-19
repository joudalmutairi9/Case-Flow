import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/Card";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { toggleUserStatusAction, unlockUserAction } from "@/lib/actions/users";
import { PromoteStudentForm } from "@/components/admin/PromoteStudentForm";
import { getStudentProgress } from "@/lib/progress";

export default async function StudentsPage() {
  const students = await prisma.studentProfile.findMany({
    include: { user: true, group: true },
    orderBy: { user: { fullName: "asc" } },
  });

  const withProgress = await Promise.all(
    students.map(async (s) => ({ ...s, progress: await getStudentProgress(s.id, s.level) }))
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-card-foreground">بوابة الطلاب والمتطلبات</h1>
          <p className="text-sm text-muted">
            فتح حسابات الطلاب ومتابعة تقدمهم في المتطلبات السريرية وترقية مستواهم الدراسي
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/reference/quotas"
            className="rounded-lg border border-border px-4 py-2 text-sm font-bold text-card-foreground hover:bg-page-bg"
          >
            إدارة الحصص حسب المستوى
          </Link>
          <Link
            href="/admin/users?role=STUDENT"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          >
            + طالب جديد
          </Link>
        </div>
      </div>

      <Card title={`الطلاب (${students.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-right text-muted">
                <th className="pb-2">الاسم</th>
                <th className="pb-2">الرقم الجامعي</th>
                <th className="pb-2">المستوى</th>
                <th className="pb-2">المجموعة</th>
                <th className="pb-2">تقدم المتطلبات</th>
                <th className="pb-2">الحالة</th>
                <th className="pb-2">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {withProgress.map((s) => {
                const isLocked = s.user.lockedUntil && s.user.lockedUntil > new Date();
                return (
                  <tr key={s.id} className="border-b border-border align-top last:border-0">
                    <td className="py-2.5">{s.user.fullName}</td>
                    <td className="py-2.5" dir="ltr">{s.studentNumber}</td>
                    <td className="py-2.5">
                      <div className="flex flex-col items-start gap-1">
                        <span>{s.level}</span>
                        <PromoteStudentForm studentProfileId={s.id} currentLevel={s.level} />
                      </div>
                    </td>
                    <td className="py-2.5 text-muted">{s.group?.name ?? "بدون مجموعة"}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-page-bg">
                          <div className="h-full bg-primary" style={{ width: `${s.progress.percent}%` }} />
                        </div>
                        <span className="text-xs text-muted">
                          {s.progress.completed}/{s.progress.required}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5">
                      {isLocked ? (
                        <Badge tone="danger">مقفل</Badge>
                      ) : s.user.status === "ACTIVE" ? (
                        <Badge tone="success">نشط</Badge>
                      ) : (
                        <Badge tone="warning">معطّل</Badge>
                      )}
                    </td>
                    <td className="py-2.5">
                      <div className="flex flex-wrap gap-2">
                        <form action={toggleUserStatusAction.bind(null, s.user.id, s.user.status === "ACTIVE")}>
                          <SubmitButton variant="ghost" className="text-xs">
                            {s.user.status === "ACTIVE" ? "تعطيل" : "تفعيل"}
                          </SubmitButton>
                        </form>
                        {isLocked && (
                          <form action={unlockUserAction.bind(null, s.user.id)}>
                            <SubmitButton variant="ghost" className="text-xs">
                              فتح القفل
                            </SubmitButton>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-muted">
                    لا يوجد طلاب مسجلون بعد.
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
