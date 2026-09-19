import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/Card";
import { CASE_STATUS_LABEL_AR, CASE_STATUS_TONE } from "@/lib/case-status";

export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const [patients, cases] = query
    ? await Promise.all([
        prisma.patient.findMany({
          where: {
            OR: [
              { fullName: { contains: query, mode: "insensitive" } },
              { mrn: { contains: query, mode: "insensitive" } },
              { nationalId: { contains: query, mode: "insensitive" } },
              { phone: { contains: query, mode: "insensitive" } },
            ],
          },
          take: 20,
        }),
        prisma.clinicalCase.findMany({
          where: {
            OR: [
              { caseNumber: { contains: query, mode: "insensitive" } },
              { patient: { fullName: { contains: query, mode: "insensitive" } } },
            ],
          },
          include: { patient: true, specialty: true, procedure: true },
          take: 20,
        }),
      ])
    : [[], []];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">البحث</h1>
        <p className="text-sm text-muted">
          {query ? `نتائج البحث عن "${query}"` : "اكتب اسمًا أو رقم ملف أو رقم حالة في مربع البحث أعلى الصفحة"}
        </p>
      </div>

      {query && (
        <>
          <Card title={`المرضى (${patients.length})`}>
            <ul className="flex flex-col gap-2 text-sm">
              {patients.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span>
                    {p.fullName} <span className="text-muted" dir="ltr">— {p.mrn}</span>
                  </span>
                  <Link href={`/records/patients/${p.id}`} className="text-primary hover:underline">
                    عرض الملف
                  </Link>
                </li>
              ))}
              {patients.length === 0 && <li className="text-muted">لا يوجد مرضى مطابقون.</li>}
            </ul>
          </Card>

          <Card title={`الحالات السريرية (${cases.length})`}>
            <ul className="flex flex-col gap-2 text-sm">
              {cases.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span>
                    <span className="font-mono text-xs text-muted" dir="ltr">{c.caseNumber}</span>{" "}
                    {c.patient.fullName} — {c.specialty.nameAr} / {c.procedure.nameAr}
                  </span>
                  <Badge tone={CASE_STATUS_TONE[c.status]}>{CASE_STATUS_LABEL_AR[c.status]}</Badge>
                </li>
              ))}
              {cases.length === 0 && <li className="text-muted">لا توجد حالات مطابقة.</li>}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
