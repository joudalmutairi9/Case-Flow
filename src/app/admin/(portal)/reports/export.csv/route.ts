import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { buildCaseWhere, type ReportFilters } from "@/lib/report-filters";
import { CASE_STATUS_LABEL_AR } from "@/lib/case-status";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(request: NextRequest) {
  await requireRole("SUPER_ADMIN");

  const params = request.nextUrl.searchParams;
  const filters: ReportFilters = {
    studentName: params.get("studentName") ?? undefined,
    internName: params.get("internName") ?? undefined,
    procedureId: params.get("procedureId") ?? undefined,
    bookedFrom: params.get("bookedFrom") ?? undefined,
    bookedTo: params.get("bookedTo") ?? undefined,
    createdFrom: params.get("createdFrom") ?? undefined,
    createdTo: params.get("createdTo") ?? undefined,
  };

  const cases = await prisma.clinicalCase.findMany({
    where: buildCaseWhere(filters),
    include: { patient: true, specialty: true, procedure: true, intern: true, student: true },
    orderBy: { createdAt: "desc" },
  });

  const header = [
    "رقم الحالة",
    "المريض",
    "التخصص",
    "الخدمة",
    "طبيب الامتياز",
    "الطالب",
    "الحالة",
    "تاريخ نزول الحالة",
    "تاريخ أخذ الحالة",
  ];

  const rows = cases.map((c) =>
    [
      c.caseNumber,
      c.patient.fullName,
      c.specialty.nameAr,
      c.procedure.nameAr,
      c.intern.fullName,
      c.student?.fullName ?? "",
      CASE_STATUS_LABEL_AR[c.status],
      c.createdAt.toISOString().slice(0, 10),
      c.bookedAt ? c.bookedAt.toISOString().slice(0, 10) : "",
    ]
      .map((v) => csvEscape(String(v)))
      .join(",")
  );

  const csv = "﻿" + [header.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="clinical-cases-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
