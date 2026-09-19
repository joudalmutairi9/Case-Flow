import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/Card";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const patients = await prisma.patient.findMany({
    where: q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { mrn: { contains: q, mode: "insensitive" } },
            { nationalId: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-card-foreground">ملفات المرضى</h1>
          <p className="text-sm text-muted">البحث بالاسم أو رقم الملف أو الهوية أو الجوال</p>
        </div>
        <Link
          href="/records/patients/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          + تسجيل مريض جديد
        </Link>
      </div>

      <Card>
        <form className="flex gap-3" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="ابحث..."
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm sm:w-80"
          />
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            بحث
          </button>
        </form>
      </Card>

      <Card title={`النتائج (${patients.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-x-2 text-sm">
            <thead>
              <tr className="border-b border-border text-right text-muted">
                <th className="pb-2">رقم الملف</th>
                <th className="pb-2">الاسم</th>
                <th className="pb-2">الجوال</th>
                <th className="pb-2">الحالة</th>
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
                  <td className="py-2" dir="ltr">
                    {p.phone}
                  </td>
                  <td className="py-2">
                    {p.status === "ACTIVE" ? (
                      <Badge tone="success">نشط</Badge>
                    ) : (
                      <Badge tone="warning">مؤرشف</Badge>
                    )}
                  </td>
                  <td className="py-2">
                    <Link href={`/records/patients/${p.id}`} className="text-primary hover:underline">
                      عرض الملف
                    </Link>
                  </td>
                </tr>
              ))}
              {patients.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-muted">
                    لا توجد نتائج.
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
