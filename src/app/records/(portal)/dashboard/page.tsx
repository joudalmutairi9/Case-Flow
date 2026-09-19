import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/Kpi";
import { currentWeekRange } from "@/lib/week";

export default async function RecordsDashboardPage() {
  const { start, end } = currentWeekRange();

  const [
    newPatients,
    weekAppointments,
    attended,
    noShow,
    weekCalls,
    inboundCalls,
    totalPatients,
    clinics,
  ] = await Promise.all([
    prisma.patient.count({ where: { createdAt: { gte: start, lt: end } } }),
    prisma.appointment.count({ where: { scheduledAt: { gte: start, lt: end } } }),
    prisma.appointment.count({
      where: { scheduledAt: { gte: start, lt: end }, attendance: "ATTENDED" },
    }),
    prisma.appointment.count({
      where: { scheduledAt: { gte: start, lt: end }, attendance: "NO_SHOW" },
    }),
    prisma.call.count({ where: { createdAt: { gte: start, lt: end } } }),
    prisma.call.count({ where: { createdAt: { gte: start, lt: end }, direction: "INBOUND" } }),
    prisma.patient.count(),
    prisma.clinic.count({ where: { isActive: true } }),
  ]);

  const outboundCalls = weekCalls - inboundCalls;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-card-foreground">التقرير الأسبوعي السريع</h1>
          <p className="text-sm text-muted">
            الفترة: {start.toLocaleDateString("ar-SA")} إلى{" "}
            {new Date(end.getTime() - 86400000).toLocaleDateString("ar-SA")}
          </p>
        </div>
        <Link
          href="/records/patients/export.csv"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          سحب بيانات المرضى (CSV)
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="مرضى جدد هذا الأسبوع" value={newPatients} />
        <KpiCard label="زيارات هذا الأسبوع" value={weekAppointments} />
        <KpiCard label="حضور" value={attended} tone="success" />
        <KpiCard label="عدم حضور" value={noShow} tone={noShow > 0 ? "danger" : "default"} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="إجمالي المكالمات" value={weekCalls} />
        <KpiCard label="واردة" value={inboundCalls} />
        <KpiCard label="صادرة" value={outboundCalls} />
        <KpiCard label="إجمالي ملفات المرضى" value={totalPatients} />
      </div>

      <Card title="ملاحظة">
        <p className="text-sm text-muted">
          عدد العيادات النشطة حالياً: <b>{clinics}</b>. مؤشرات الإشغال التفصيلية وتصدير PDF
          الكامل ستُفعَّل مع دخول بيانات المواعيد الفعلية في المرحلة القادمة.
        </p>
      </Card>
    </div>
  );
}
