import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/Card";
import { CASE_STATUS_LABEL_AR, CASE_STATUS_TONE } from "@/lib/case-status";
import type { CaseStatus } from "@prisma/client";

const TABS: { key: "ALL" | "SUBMITTED" | "IN_BANK" | "TAKEN" | "COMPLETED"; label: string; statuses?: CaseStatus[] }[] = [
  { key: "ALL", label: "الكل" },
  { key: "SUBMITTED", label: "نزلت (بانتظار الاعتماد)", statuses: ["PENDING_REVIEW", "NEEDS_REVISION"] },
  { key: "IN_BANK", label: "متاحة بالبنك", statuses: ["IN_BANK"] },
  {
    key: "TAKEN",
    label: "أُخذت (محجوزة)",
    statuses: ["BOOKED", "SCHEDULED", "IN_TREATMENT", "PENDING_EVALUATION"],
  },
  { key: "COMPLETED", label: "مكتملة", statuses: ["COMPLETED"] },
];

export default async function AdminCaseBankPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const { tab, q } = await searchParams;
  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];

  const cases = await prisma.clinicalCase.findMany({
    where: {
      ...(activeTab.statuses ? { status: { in: activeTab.statuses } } : {}),
      ...(q
        ? {
            OR: [
              { caseNumber: { contains: q, mode: "insensitive" } },
              { patient: { fullName: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: { patient: true, specialty: true, procedure: true, intern: true, student: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">بنك الحالات السريرية</h1>
        <p className="text-sm text-muted">كل الحالات — النازلة، المتاحة، المأخوذة، والمكتملة</p>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <Link
                key={t.key}
                href={`/admin/case-bank?tab=${t.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  activeTab.key === t.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-page-bg text-muted hover:text-primary"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>
          <form method="get" className="flex gap-2">
            <input type="hidden" name="tab" value={activeTab.key} />
            <input
              name="q"
              defaultValue={q}
              placeholder="بحث برقم الحالة أو اسم المريض"
              className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm"
            />
            <button className="rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground">
              بحث
            </button>
          </form>
        </div>
      </Card>

      <Card title={`النتائج (${cases.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-right text-muted">
                <th className="pb-2">رقم الحالة</th>
                <th className="pb-2">المريض</th>
                <th className="pb-2">التخصص/الإجراء</th>
                <th className="pb-2">طبيب الامتياز</th>
                <th className="pb-2">الطالب</th>
                <th className="pb-2">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="py-2 font-mono text-xs" dir="ltr">{c.caseNumber}</td>
                  <td className="py-2">{c.patient.fullName}</td>
                  <td className="py-2">{c.specialty.nameAr} / {c.procedure.nameAr}</td>
                  <td className="py-2">{c.intern.fullName}</td>
                  <td className="py-2">{c.student?.fullName ?? "—"}</td>
                  <td className="py-2">
                    <Badge tone={CASE_STATUS_TONE[c.status]}>{CASE_STATUS_LABEL_AR[c.status]}</Badge>
                  </td>
                </tr>
              ))}
              {cases.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-muted">
                    لا توجد حالات مطابقة.
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
