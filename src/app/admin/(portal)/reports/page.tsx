import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";

type Filters = {
  studentName?: string;
  internName?: string;
  procedureId?: string;
  bookedFrom?: string;
  bookedTo?: string;
  createdFrom?: string;
  createdTo?: string;
};

function buildQuery(filters: Filters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  return params.toString();
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Filters>;
}) {
  const filters = await searchParams;
  const procedures = await prisma.procedure.findMany({
    include: { specialty: true },
    orderBy: { nameAr: "asc" },
  });

  const qs = buildQuery(filters);
  const inputCls =
    "rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">مركز استخراج وتصدير التقارير</h1>
        <p className="text-sm text-muted">التقارير الأكاديمية والسريرية — فلترة وتصدير</p>
      </div>

      <Card title="فلاتر التصدير">
        <form method="get" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">اسم الطالب</span>
            <input name="studentName" defaultValue={filters.studentName} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">اسم طبيب الامتياز</span>
            <input name="internName" defaultValue={filters.internName} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">الخدمة</span>
            <select name="procedureId" defaultValue={filters.procedureId ?? ""} className={inputCls}>
              <option value="">الكل</option>
              {procedures.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.specialty.nameAr} — {p.nameAr}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">تاريخ أخذ الحالة (من)</span>
            <input type="date" name="bookedFrom" defaultValue={filters.bookedFrom} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">تاريخ أخذ الحالة (إلى)</span>
            <input type="date" name="bookedTo" defaultValue={filters.bookedTo} className={inputCls} />
          </label>
          <div />
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">تاريخ نزول الحالة (من)</span>
            <input type="date" name="createdFrom" defaultValue={filters.createdFrom} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">تاريخ نزول الحالة (إلى)</span>
            <input type="date" name="createdTo" defaultValue={filters.createdTo} className={inputCls} />
          </label>
          <div className="flex items-end">
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
              تطبيق الفلاتر
            </button>
          </div>
        </form>
      </Card>

      <Card title="التصدير">
        <div className="flex flex-wrap gap-3">
          <a
            href={`/admin/reports/export.csv${qs ? `?${qs}` : ""}`}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          >
            سحب بيانات Excel (CSV)
          </a>
          <a
            href={`/admin/reports/print${qs ? `?${qs}` : ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-foreground"
          >
            تحميل تقرير أسبوعي (PDF)
          </a>
        </div>
        <p className="mt-3 text-xs text-muted">
          زر &quot;تحميل تقرير أسبوعي (PDF)&quot; يفتح صفحة تقرير جاهزة للطباعة، احفظها كـ PDF من نافذة الطباعة
          (Ctrl/Cmd + P ← حفظ كـ PDF).
        </p>
      </Card>
    </div>
  );
}
