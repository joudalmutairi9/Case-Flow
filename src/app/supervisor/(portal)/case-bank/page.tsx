import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/Card";
import { ToggleUrgentButton, WithdrawCaseForm } from "@/components/supervisor/BankActions";

export default async function SupervisorCaseBankPage() {
  const cases = await prisma.clinicalCase.findMany({
    where: { status: "IN_BANK" },
    include: { patient: true, specialty: true, procedure: true },
    orderBy: { reviewedAt: "asc" },
  });

  const now = new Date();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">بنك الحالات</h1>
        <p className="text-sm text-muted">الحالات المعتمدة والمتاحة حالياً للحجز من الطلاب</p>
      </div>

      <Card title={`الحالات المتاحة (${cases.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-right text-muted">
                <th className="pb-2">رقم الحالة</th>
                <th className="pb-2">التخصص/الإجراء</th>
                <th className="pb-2">في البنك منذ</th>
                <th className="pb-2">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => {
                const daysInBank = c.reviewedAt
                  ? Math.floor((now.getTime() - c.reviewedAt.getTime()) / (24 * 60 * 60 * 1000))
                  : 0;
                return (
                  <tr key={c.id} className="border-b border-border align-top last:border-0">
                    <td className="py-2 font-mono text-xs" dir="ltr">
                      {c.caseNumber}
                    </td>
                    <td className="py-2">
                      {c.specialty.nameAr} / {c.procedure.nameAr}
                      {c.urgentFlagged && (
                        <span className="mr-2">
                          <Badge tone="danger">عاجلة</Badge>
                        </span>
                      )}
                    </td>
                    <td className="py-2">
                      {daysInBank} يوم{" "}
                      {daysInBank >= 14 && <Badge tone="warning">تحتاج مراجعة</Badge>}
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <ToggleUrgentButton caseId={c.id} urgent={c.urgentFlagged} />
                        <WithdrawCaseForm caseId={c.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {cases.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-muted">
                    لا توجد حالات متاحة في البنك حالياً.
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
