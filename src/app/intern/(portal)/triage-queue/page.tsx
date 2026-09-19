import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";

export default async function TriageQueuePage() {
  const patients = await prisma.patient.findMany({
    where: { status: "ACTIVE", cases: { none: {} } },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">قائمة انتظار الفرز</h1>
        <p className="text-sm text-muted">المرضى المسجَّلون من السجلات الطبية ولم تُنشأ لهم حالة سريرية بعد</p>
      </div>

      <Card title={`بانتظار الفحص (${patients.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-x-2 text-sm">
            <thead>
              <tr className="border-b border-border text-right text-muted">
                <th className="pb-2">رقم الملف</th>
                <th className="pb-2">الاسم</th>
                <th className="pb-2">تاريخ التسجيل</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="py-2 font-mono text-xs" dir="ltr">
                    {p.mrn}
                  </td>
                  <td className="py-2">{p.fullName}</td>
                  <td className="py-2 text-muted">{p.createdAt.toLocaleDateString("ar-SA")}</td>
                  <td className="py-2">
                    <Link
                      href={`/intern/cases/new?patientId=${p.id}`}
                      className="text-primary hover:underline"
                    >
                      فحص وتسجيل حالة
                    </Link>
                  </td>
                </tr>
              ))}
              {patients.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-muted">
                    لا يوجد مرضى بانتظار الفرز حالياً.
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
