import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";

export default async function AdminTodayPage() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const appointments = await prisma.appointment.findMany({
    where: { scheduledAt: { gte: start, lt: end }, cancelledAt: null },
    include: {
      clinic: true,
      case: { include: { patient: true, student: true, procedure: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">مواعيد اليوم</h1>
        <p className="text-sm text-muted">{start.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
      <Card title={`المواعيد (${appointments.length})`}>
        <table className="w-full border-separate border-spacing-x-2 text-sm">
          <thead>
            <tr className="border-b border-border text-right text-muted">
              <th className="pb-2">الوقت</th>
              <th className="pb-2">المريض</th>
              <th className="pb-2">الإجراء</th>
              <th className="pb-2">الطالب</th>
              <th className="pb-2">العيادة</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id} className="border-b border-border last:border-0">
                <td className="py-2">{a.scheduledAt.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</td>
                <td className="py-2">{a.case.patient.fullName}</td>
                <td className="py-2">{a.case.procedure.nameAr}</td>
                <td className="py-2">{a.case.student?.fullName ?? "—"}</td>
                <td className="py-2">{a.clinic.name}</td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-muted">
                  لا توجد مواعيد اليوم.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
