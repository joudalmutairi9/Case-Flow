import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/Card";
import { getStudentProgress } from "@/lib/progress";
import { CancelBookingForm } from "@/components/supervisor/CancelBookingForm";

export default async function SupervisorStudentsPage() {
  const students = await prisma.studentProfile.findMany({
    include: {
      user: true,
      bookedCases: {
        where: { status: { in: ["BOOKED", "SCHEDULED", "IN_TREATMENT"] } },
        include: { patient: true, specialty: true },
      },
    },
    orderBy: { user: { fullName: "asc" } },
  });

  const withProgress = await Promise.all(
    students.map(async (s) => ({ ...s, progress: await getStudentProgress(s.id, s.level) }))
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">تقدم الطلاب</h1>
        <p className="text-sm text-muted">نسبة الإنجاز الإجمالية مقابل حصص التخرج للفترة النشطة</p>
      </div>

      <Card title={`الطلاب (${students.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-x-2 text-sm">
            <thead>
              <tr className="border-b border-border text-right text-muted">
                <th className="pb-2">الطالب</th>
                <th className="pb-2">المستوى</th>
                <th className="pb-2">نسبة الإنجاز</th>
                <th className="pb-2">حجوزات مفتوحة</th>
              </tr>
            </thead>
            <tbody>
              {withProgress.map((s) => (
                <tr key={s.id} className="border-b border-border align-top last:border-0">
                  <td className="py-2">{s.user.fullName}</td>
                  <td className="py-2">{s.level}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-page-bg">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${s.progress.percent}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted">
                        {s.progress.completed}/{s.progress.required} ({s.progress.percent}%)
                      </span>
                    </div>
                  </td>
                  <td className="py-2">
                    {s.bookedCases.length === 0 ? (
                      <span className="text-muted">لا يوجد</span>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {s.bookedCases.map((c) => (
                          <div key={c.id} className="flex items-center gap-2">
                            <Badge>{c.specialty.nameAr}</Badge>
                            <CancelBookingForm caseId={c.id} />
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-muted">
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
