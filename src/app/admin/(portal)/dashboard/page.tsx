import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/Kpi";

export default async function AdminDashboardPage() {
  const [
    activeByRole,
    lockedCount,
    casesInBank,
    casesBooked,
    casesCompleted,
    recentLogins,
  ] = await Promise.all([
    prisma.user.groupBy({
      by: ["role"],
      where: { status: "ACTIVE" },
      _count: { _all: true },
    }),
    prisma.user.count({ where: { lockedUntil: { gt: new Date() } } }),
    prisma.clinicalCase.count({ where: { status: "IN_BANK" } }),
    prisma.clinicalCase.count({
      where: { status: { in: ["BOOKED", "SCHEDULED", "IN_TREATMENT"] } },
    }),
    prisma.clinicalCase.count({ where: { status: "COMPLETED" } }),
    prisma.auditLog.findMany({
      where: { action: { in: ["LOGIN_SUCCESS", "LOGIN_FAILED"] } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const roleCount = (role: string) =>
    activeByRole.find((r) => r.role === role)?._count._all ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">لوحة السوبر أدمن</h1>
        <p className="text-sm text-muted">نظرة عامة على المستخدمين النشطين وحالة الحالات السريرية</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="الطلاب النشطون" value={roleCount("STUDENT")} />
        <KpiCard label="أطباء الامتياز" value={roleCount("INTERN")} />
        <KpiCard label="المشرفون" value={roleCount("SUPERVISOR")} />
        <KpiCard label="موظفو السجلات" value={roleCount("RECORDS")} />
        <KpiCard label="حسابات مقفلة" value={lockedCount} tone={lockedCount > 0 ? "danger" : "default"} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="حالات في البنك" value={casesInBank} tone="warning" />
        <KpiCard label="حالات محجوزة/قيد العلاج" value={casesBooked} />
        <KpiCard label="حالات مكتملة" value={casesCompleted} tone="success" />
      </div>

      <Card title="آخر عمليات الدخول">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
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
