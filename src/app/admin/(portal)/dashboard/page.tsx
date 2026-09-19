import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/Kpi";
import { DonutChart } from "@/components/ui/DonutChart";
import { currentWeekRange } from "@/lib/week";
import { getSession } from "@/lib/session";

export default async function AdminDashboardPage() {
  const session = await getSession();
  const { start, end } = currentWeekRange();

  const [
    totalCases,
    takenCases,
    transferredPatients,
    totalPatients,
    completedServices,
    specialties,
    studentsCount,
    internsCount,
    supervisorsCount,
    lockedCount,
    weekCreated,
    weekBooked,
    weekCompleted,
    recentLogins,
  ] = await Promise.all([
    prisma.clinicalCase.count(),
    prisma.clinicalCase.count({ where: { studentId: { not: null } } }),
    prisma.patient.count({ where: { cases: { some: {} } } }),
    prisma.patient.count(),
    prisma.clinicalCase.count({ where: { status: "COMPLETED" } }),
    prisma.specialty.findMany({
      where: { isActive: true },
      include: { _count: { select: { cases: true } } },
      orderBy: { nameAr: "asc" },
    }),
    prisma.studentProfile.count(),
    prisma.internProfile.count(),
    prisma.supervisorProfile.count(),
    prisma.user.count({ where: { lockedUntil: { gt: new Date() } } }),
    prisma.clinicalCase.count({ where: { createdAt: { gte: start, lt: end } } }),
    prisma.clinicalCase.count({ where: { bookedAt: { gte: start, lt: end } } }),
    prisma.clinicalCase.count({
      where: { status: "COMPLETED", updatedAt: { gte: start, lt: end } },
    }),
    prisma.auditLog.findMany({
      where: { action: { in: ["LOGIN_SUCCESS", "LOGIN_FAILED"] } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const remainingCases = totalCases - takenCases;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-primary p-6 text-primary-foreground">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">مرحباً، {session!.fullName}</h1>
            <p className="mt-1 text-sm text-white/80">نظرة عامة على المنصة</p>
          </div>
          <Link
            href="/admin/reports"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-foreground"
          >
            مركز التقارير
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="إجمالي الحالات (أطباء الامتياز)" value={totalCases} />
        <KpiCard label="إجمالي الحالات المحوّلة" value={transferredPatients} />
        <KpiCard label="إجمالي المرضى" value={totalPatients} />
        <KpiCard label="إجمالي الخدمات المنجزة" value={completedServices} tone="success" />
      </div>

      <Card title="توزيع الحالات — المأخوذة مقابل المتبقية">
        <DonutChart
          centerLabel="إجمالي الحالات النازلة"
          segments={[
            { label: "أُخذت (حجزها طالب)", value: takenCases, color: "#1baf7a" },
            { label: "متبقية لم تُؤخذ بعد", value: remainingCases, color: "#eda100" },
          ]}
        />
      </Card>

      <Card title="إجمالي الحالات حسب الخدمة">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {specialties.map((s) => (
            <div key={s.id} className="rounded-xl border border-border p-3 text-center">
              <p className="text-2xl font-bold text-primary">{s._count.cases}</p>
              <p className="text-xs text-muted">إجمالي خدمة {s.nameAr}</p>
            </div>
          ))}
          {specialties.length === 0 && (
            <p className="col-span-full text-sm text-muted">لا توجد تخصصات نشطة بعد.</p>
          )}
        </div>
      </Card>

      <Card title="الملخص الأسبوعي للحالات">
        <div className="grid grid-cols-3 gap-4">
          <KpiCard label="حالات نزلت هذا الأسبوع" value={weekCreated} />
          <KpiCard label="حالات أُخذت هذا الأسبوع" value={weekBooked} tone="warning" />
          <KpiCard label="حالات أُنجزت هذا الأسبوع" value={weekCompleted} tone="success" />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="عدد الطلاب" value={studentsCount} />
        <KpiCard label="عدد أطباء الامتياز" value={internsCount} />
        <KpiCard label="عدد المشرفين" value={supervisorsCount} />
        <KpiCard label="حسابات مقفلة" value={lockedCount} tone={lockedCount > 0 ? "danger" : "default"} />
      </div>

      <Card title="آخر عمليات الدخول">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-x-2 text-sm">
            <thead>
              <tr className="border-b border-border text-right text-muted">
                <th className="pb-2">المستخدم</th>
                <th className="pb-2">النتيجة</th>
                <th className="pb-2">الوقت</th>
                <th className="pb-2">IP</th>
              </tr>
            </thead>
            <tbody>
              {recentLogins.map((log) => (
                <tr key={log.id} className="border-b border-border last:border-0">
                  <td className="py-2">{log.actorUsername ?? "—"}</td>
                  <td className="py-2">
                    {log.action === "LOGIN_SUCCESS" ? (
                      <span className="text-success">ناجحة</span>
                    ) : (
                      <span className="text-danger">فاشلة</span>
                    )}
                  </td>
                  <td className="py-2">{log.createdAt.toLocaleString("ar-SA")}</td>
                  <td className="py-2 text-muted">{log.ip ?? "—"}</td>
                </tr>
              ))}
              {recentLogins.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-muted">
                    لا توجد بيانات بعد.
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
