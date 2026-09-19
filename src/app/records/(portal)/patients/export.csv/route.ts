import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { writeAuditLog } from "@/lib/audit";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const staff = await requireRole("RECORDS", "SUPER_ADMIN");

  const patients = await prisma.patient.findMany({ orderBy: { createdAt: "desc" } });

  const header = [
    "MRN",
    "الاسم",
    "رقم الهوية",
    "تاريخ الميلاد",
    "الجنس",
    "الجوال",
    "الحالة",
    "تاريخ التسجيل",
  ];

  const rows = patients.map((p) =>
    [
      p.mrn,
      p.fullName,
      p.nationalId,
      p.dob.toISOString().slice(0, 10),
      p.gender === "MALE" ? "ذكر" : "أنثى",
      p.phone,
      p.status === "ACTIVE" ? "نشط" : "مؤرشف",
      p.createdAt.toISOString().slice(0, 10),
    ]
      .map((v) => csvEscape(String(v)))
      .join(",")
  );

  const csv = "﻿" + [header.join(","), ...rows].join("\n");

  await writeAuditLog({
    userId: staff.userId,
    action: "PATIENTS_EXPORTED",
    metadata: { count: patients.length },
  });

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="patients-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
