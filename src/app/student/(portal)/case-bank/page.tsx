import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/Card";
import { getSession } from "@/lib/session";
import { getStudentProgress } from "@/lib/progress";
import { releaseExpiredBookings } from "@/lib/case-lifecycle";
import { BookButton } from "@/components/student/BookButton";

function calcAge(dob: Date) {
  const diff = Date.now() - dob.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function maskName(name: string) {
  const parts = name.trim().split(" ");
  return parts[0] + " " + "*".repeat(Math.max(3, (parts[1]?.length ?? 4)));
}

export default async function StudentCaseBankPage({
  searchParams,
}: {
  searchParams: Promise<{ specialty?: string; urgent?: string }>;
}) {
  await releaseExpiredBookings();
  const { specialty, urgent } = await searchParams;
  const session = await getSession();

  const profile = await prisma.studentProfile.findUnique({ where: { userId: session!.userId } });
  if (!profile) return <p className="text-sm text-danger">تعذر إيجاد الملف الأكاديمي.</p>;

  const progress = await getStudentProgress(profile.id, profile.level);
  const missingSpecialties = new Set(
    progress.items.filter((i) => i.completed < i.required).map((i) => i.specialtyNameAr)
  );

  const [specialties, cases] = await Promise.all([
    prisma.specialty.findMany({ where: { isActive: true } }),
    prisma.clinicalCase.findMany({
      where: {
        status: "IN_BANK",
        requiredLevel: profile.level,
        ...(specialty ? { specialtyId: specialty } : {}),
        ...(urgent === "1" ? { priority: "URGENT" } : {}),
      },
      include: { patient: true, specialty: true, procedure: true, intern: true, radiographs: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const sorted = [...cases].sort((a, b) => {
    const aMatch = missingSpecialties.has(a.specialty.nameAr) ? 0 : 1;
    const bMatch = missingSpecialties.has(b.specialty.nameAr) ? 0 : 1;
    return aMatch - bMatch;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">الحالات المتاحة للحجز الفوري</h1>
        <p className="text-sm text-muted">مطابقة لمستواك الدراسي ({profile.level})</p>
      </div>

      <Card>
        <form className="flex flex-wrap items-end gap-3" method="get">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">التخصص</span>
            <select name="specialty" defaultValue={specialty ?? ""} className="rounded-lg border border-border bg-white px-3 py-2 text-sm">
              <option value="">الكل</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameAr}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="urgent" value="1" defaultChecked={urgent === "1"} className="rounded border-border" />
            عرض الحالات العاجلة فقط
          </label>
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">تصفية</button>
        </form>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((c) => {
          const isMatch = missingSpecialties.has(c.specialty.nameAr);
          return (
            <div key={c.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex flex-wrap gap-1.5">
                {isMatch && <Badge tone="success">مطابق لمتطلبك الناقص</Badge>}
                {c.priority === "URGENT" && <Badge tone="danger">عاجل</Badge>}
              </div>
              <div>
                <p className="font-mono text-xs text-muted" dir="ltr">
                  {c.caseNumber} · FDI {c.toothFdi ?? "—"}
                </p>
                <p className="font-bold">{c.procedure.nameAr}</p>
                <p className="text-sm text-muted">{c.specialty.nameAr}</p>
              </div>
              <p className="text-sm">
                {maskName(c.patient.fullName)} · {calcAge(c.patient.dob)} سنة ·{" "}
                {c.patient.gender === "MALE" ? "ذكر" : "أنثى"}
              </p>
              <p className="text-xs text-muted">طبيب الامتياز المُحيل: {c.intern.fullName}</p>
              <p className="text-xs text-muted">
                الأشعة المتوفرة: {c.radiographs.length > 0 ? c.radiographs.map((r) => r.type).join("، ") : "لا يوجد"}
              </p>
              <div className="mt-auto flex justify-end">
                <BookButton caseId={c.id} />
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <p className="col-span-full text-center text-sm text-muted">لا توجد حالات متاحة مطابقة حالياً.</p>
        )}
      </div>
    </div>
  );
}
