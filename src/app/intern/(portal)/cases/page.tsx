import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/Card";
import { getSession } from "@/lib/session";
import { CASE_STATUS_LABEL_AR, CASE_STATUS_TONE } from "@/lib/case-status";

export default async function InternCasesPage() {
  const session = await getSession();
  const cases = await prisma.clinicalCase.findMany({
    where: { internId: session!.userId },
    include: { patient: true, specialty: true, procedure: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">سجل حالاتي</h1>
        <p className="text-sm text-muted">كل الحالات التي أنشأتها بجميع مراحلها</p>
      </div>

      <Card title={`الحالات (${cases.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-right text-muted">
                <th className="pb-2">رقم الحالة</th>
                <th className="pb-2">المريض</th>
                <th className="pb-2">التخصص/الإجراء</th>
                <th className="pb-2">الحالة</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="py-2 font-mono text-xs" dir="ltr">
                    {c.caseNumber}
                  </td>
                  <td className="py-2">{c.patient.fullName}</td>
                  <td className="py-2">
                    {c.specialty.nameAr} / {c.procedure.nameAr}
                  </td>
                  <td className="py-2">
                    <Badge tone={CASE_STATUS_TONE[c.status]}>{CASE_STATUS_LABEL_AR[c.status]}</Badge>
                  </td>
                  <td className="py-2">
                    <Link href={`/intern/cases/${c.id}`} className="text-primary hover:underline">
                      عرض
                    </Link>
                  </td>
                </tr>
              ))}
              {cases.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-muted">
                    لا توجد حالات مسجلة بعد.
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
