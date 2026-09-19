import { prisma } from "@/lib/prisma";
import { buildCaseWhere, type ReportFilters } from "@/lib/report-filters";
import { CASE_STATUS_LABEL_AR } from "@/lib/case-status";
import { currentWeekRange } from "@/lib/week";
import { PrintButton } from "@/components/admin/PrintButton";
import { getSettings } from "@/lib/settings";

export default async function ReportPrintPage({
  searchParams,
}: {
  searchParams: Promise<ReportFilters>;
}) {
  const filters = await searchParams;
  const { start, end } = currentWeekRange();
  const settings = await getSettings();

  const [cases, specialties, studentsCount, internsCount, supervisorsCount] = await Promise.all([
    prisma.clinicalCase.findMany({
      where: buildCaseWhere(filters),
      include: { patient: true, specialty: true, procedure: true, intern: true, student: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    prisma.specialty.findMany({ where: { isActive: true }, include: { _count: { select: { cases: true } } } }),
    prisma.studentProfile.count(),
    prisma.internProfile.count(),
    prisma.supervisorProfile.count(),
  ]);

  const weekCreated = cases.filter((c) => c.createdAt >= start && c.createdAt < end).length;
  const weekBooked = cases.filter((c) => c.bookedAt && c.bookedAt >= start && c.bookedAt < end).length;
  const weekCompleted = cases.filter(
    (c) => c.status === "COMPLETED" && c.updatedAt >= start && c.updatedAt < end
  ).length;

  return (
    <div className="mx-auto max-w-4xl p-8 text-sm text-card-foreground print:p-0">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{settings.hospitalName}</h1>
          <p className="text-muted">التقرير الأسبوعي السريع للحالات السريرية</p>
          <p className="text-xs text-muted">
            الفترة: {start.toLocaleDateString("ar-SA")} إلى{" "}
            {new Date(end.getTime() - 86400000).toLocaleDateString("ar-SA")}
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold">{weekCreated}</p>
          <p className="text-muted">حالات نزلت هذا الأسبوع</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold">{weekBooked}</p>
          <p className="text-muted">حالات أُخذت هذا الأسبوع</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold">{weekCompleted}</p>
          <p className="text-muted">حالات أُنجزت هذا الأسبوع</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold">{studentsCount}</p>
          <p className="text-muted">عدد الطلاب</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold">{internsCount}</p>
          <p className="text-muted">عدد أطباء الامتياز</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold">{supervisorsCount}</p>
          <p className="text-muted">عدد المشرفين</p>
        </div>
      </div>

      <h2 className="mt-8 mb-2 font-bold">إجمالي الحالات حسب الخدمة</h2>
      <table className="w-full border-collapse text-right">
        <tbody>
          {specialties.map((s) => (
            <tr key={s.id} className="border-b">
              <td className="py-1">{s.nameAr}</td>
              <td className="py-1 font-bold">{s._count.cases}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-8 mb-2 font-bold">تفاصيل الحالات ({cases.length})</h2>
      <table className="w-full border-collapse text-right text-xs">
        <thead>
          <tr className="border-b">
            <th className="py-1">رقم الحالة</th>
            <th className="py-1">المريض</th>
            <th className="py-1">الخدمة</th>
            <th className="py-1">طبيب الامتياز</th>
            <th className="py-1">الطالب</th>
            <th className="py-1">الحالة</th>
            <th className="py-1">تاريخ النزول</th>
            <th className="py-1">تاريخ الأخذ</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="py-1" dir="ltr">{c.caseNumber}</td>
              <td className="py-1">{c.patient.fullName}</td>
              <td className="py-1">{c.procedure.nameAr}</td>
              <td className="py-1">{c.intern.fullName}</td>
              <td className="py-1">{c.student?.fullName ?? "—"}</td>
              <td className="py-1">{CASE_STATUS_LABEL_AR[c.status]}</td>
              <td className="py-1">{c.createdAt.toLocaleDateString("ar-SA")}</td>
              <td className="py-1">{c.bookedAt ? c.bookedAt.toLocaleDateString("ar-SA") : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-10 text-center text-xs text-muted">
        جميع الحقوق محفوظة — {settings.hospitalName}
      </p>
    </div>
  );
}
