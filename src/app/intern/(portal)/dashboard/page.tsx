import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/Kpi";
import { getSession } from "@/lib/session";

export default async function InternDashboardPage() {
  const session = await getSession();
  const internId = session!.userId;

  const [total, inBank, booked, pendingReview, needsRevision, bySpecialty] = await Promise.all([
    prisma.clinicalCase.count({ where: { internId } }),
    prisma.clinicalCase.count({ where: { internId, status: "IN_BANK" } }),
    prisma.clinicalCase.count({
      where: { internId, status: { in: ["BOOKED", "SCHEDULED", "IN_TREATMENT", "PENDING_EVALUATION", "COMPLETED"] } },
    }),
    prisma.clinicalCase.count({ where: { internId, status: "PENDING_REVIEW" } }),
    prisma.clinicalCase.count({ where: { internId, status: "NEEDS_REVISION" } }),
    prisma.clinicalCase.groupBy({
      by: ["specialtyId"],
      where: { internId },
      _count: { _all: true },
    }),
  ]);

  const specialties = await prisma.specialty.findMany({
    where: { id: { in: bySpecialty.map((b) => b.specialtyId) } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">مرحباً، {session!.fullName}</h1>
        <p className="text-sm text-muted">طبيب امتياز — قسم الفرز والتشخيص</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="إجمالي الحالات المسجلة" value={total} />
        <KpiCard label="حالات حجزها الطلاب" value={booked} />
        <KpiCard label="بانتظار اعتماد المشرف" value={pendingReview} tone="warning" />
        <KpiCard label="بحاجة تعديل" value={needsRevision} tone={needsRevision > 0 ? "danger" : "default"} />
      </div>

      <Card title="توزيع الحالات حسب التخصص">
        {bySpecialty.length === 0 ? (
          <p className="text-sm text-muted">لا توجد حالات مسجلة بعد.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {bySpecialty.map((row) => (
              <li key={row.specialtyId} className="flex items-center justify-between">
                <span>{specialties.find((s) => s.id === row.specialtyId)?.nameAr ?? "—"}</span>
                <span className="font-bold text-primary">{row._count._all}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-muted">حالات في البنك حالياً: {inBank}</p>
      </Card>
    </div>
  );
}
