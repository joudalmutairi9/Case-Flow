import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/Card";
import { getSession } from "@/lib/session";
import { getStudentProgress } from "@/lib/progress";
import { releaseExpiredBookings } from "@/lib/case-lifecycle";

export default async function StudentDashboardPage() {
  await releaseExpiredBookings();
  const session = await getSession();

  const profile = await prisma.studentProfile.findUnique({ where: { userId: session!.userId } });
  if (!profile) {
    return <p className="text-sm text-danger">تعذر إيجاد الملف الأكاديمي لهذا الحساب.</p>;
  }

  const [progress, thisWeekCount, nextAppointment] = await Promise.all([
    getStudentProgress(profile.id, profile.level),
    prisma.clinicalCase.count({
      where: { studentProfileId: profile.id, status: { in: ["BOOKED", "SCHEDULED"] } },
    }),
    prisma.appointment.findFirst({
      where: { case: { studentProfileId: profile.id }, scheduledAt: { gte: new Date() }, cancelledAt: null },
      orderBy: { scheduledAt: "asc" },
      include: { case: { include: { patient: true, procedure: true } }, clinic: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">مرحباً، {session!.fullName}</h1>
        <p className="text-sm text-muted">المستوى: {profile.level}</p>
      </div>

      <Card title="إجمالي المتطلبات السريرية المنجزة">
        <div className="flex items-center gap-4">
          <div className="h-3 w-full max-w-md overflow-hidden rounded-full bg-page-bg">
            <div className="h-full bg-accent" style={{ width: `${progress.percent}%` }} />
          </div>
          <span className="whitespace-nowrap text-sm font-bold text-primary">
            {progress.completed} من {progress.required} ({progress.percent}%)
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {progress.items.map((item) => (
          <div key={item.specialtyNameAr} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-sm font-bold">{item.specialtyNameAr}</p>
            <p className="mt-1 text-lg font-bold text-primary">
              {item.completed}/{item.required}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-page-bg">
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.min(100, (item.completed / Math.max(item.required, 1)) * 100)}%` }}
              />
            </div>
            {item.completed >= item.required ? (
              <Badge tone="success">مكتمل</Badge>
            ) : (
              <span className="text-xs text-muted">المتبقي {item.required - item.completed}</span>
            )}
          </div>
        ))}
      </div>

      <Card title="الموعد السريري القادم">
        {nextAppointment ? (
          <div className="text-sm">
            <p className="font-bold">
              {nextAppointment.case.patient.fullName} — {nextAppointment.case.procedure.nameAr}
            </p>
            <p className="text-muted">
              {nextAppointment.scheduledAt.toLocaleString("ar-SA")} · {nextAppointment.clinic.name}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">لا يوجد موعد مؤكد قادم.</p>
        )}
      </Card>

      <Card title="حالات هذا الأسبوع">
        <p className="text-2xl font-bold text-primary">{thisWeekCount}</p>
        <p className="text-sm text-muted">بانتظار الإنجاز</p>
      </Card>
    </div>
  );
}
