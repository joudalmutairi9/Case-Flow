import "server-only";
import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

async function hash(pwd: string) {
  return bcrypt.hash(pwd, 12);
}

export const DEMO_CREDENTIALS = [
  { portal: "admin", label: "السوبر أدمن", url: "/admin/login", username: "sa.admin", password: "Adm#2026Temp" },
  { portal: "records", label: "السجلات الطبية", url: "/records/login", username: "rec.1001", password: "Rec#2026Temp" },
  { portal: "intern", label: "طبيب الامتياز", url: "/intern/login", username: "int.fahad", password: "Int#2026Temp" },
  { portal: "student", label: "الطالب", url: "/student/login", username: "443012345", password: "Std#2026Temp" },
  { portal: "supervisor", label: "الطبيب المشرف", url: "/supervisor/login", username: "sup.2001", password: "Sup#2026Temp" },
] as const;

/**
 * Idempotent (all upserts): safe to call more than once against the same
 * database. Shared by the standalone `prisma db seed` CLI script and the
 * protected `/api/admin/seed` route so production can be bootstrapped
 * without a local DB connection.
 */
export async function seedDatabase(prisma: PrismaClient) {
  // Internal account used to attribute automated transitions (e.g. auto-releasing
  // expired bookings back to the bank). Disabled so it can never log in.
  await prisma.user.upsert({
    where: { username: "system.automation" },
    update: {},
    create: {
      username: "system.automation",
      fullName: "النظام (عمليات تلقائية)",
      role: "SUPER_ADMIN",
      status: "DISABLED",
      passwordHash: await hash(crypto.randomUUID()),
      mustChangePassword: false,
    },
  });

  // ---- Demo portal accounts (BRD §5.3) — temporary passwords, must be
  // changed on first login, and deleted before going to production. ----
  await prisma.user.upsert({
    where: { username: "sa.admin" },
    update: {},
    create: {
      username: "sa.admin",
      fullName: "مدير النظام",
      role: "SUPER_ADMIN",
      passwordHash: await hash("Adm#2026Temp"),
    },
  });

  await prisma.user.upsert({
    where: { username: "rec.1001" },
    update: {},
    create: {
      username: "rec.1001",
      fullName: "موظف السجلات الطبية",
      role: "RECORDS",
      passwordHash: await hash("Rec#2026Temp"),
    },
  });

  const intern = await prisma.user.upsert({
    where: { username: "int.fahad" },
    update: {},
    create: {
      username: "int.fahad",
      fullName: "د. فهد بن سلطان العتيبي",
      role: "INTERN",
      passwordHash: await hash("Int#2026Temp"),
    },
  });
  await prisma.internProfile.upsert({
    where: { userId: intern.id },
    update: {},
    create: { userId: intern.id, rotationLabel: "الفصل الأول 2026", department: "الفرز والتشخيص" },
  });

  const supervisorUser = await prisma.user.upsert({
    where: { username: "sup.2001" },
    update: {},
    create: {
      username: "sup.2001",
      fullName: "أ.د. عبدالرحمن الصالح",
      role: "SUPERVISOR",
      passwordHash: await hash("Sup#2026Temp"),
    },
  });

  // ---- Reference data ----
  const specialtiesData = [
    { code: "ENDO", nameAr: "علاج عصب وجذور", nameEn: "Endodontics" },
    { code: "RESTO", nameAr: "الترميمية والحشوات", nameEn: "Restorative" },
    { code: "OMFS", nameAr: "جراحة الفم والوجه والفكين", nameEn: "Oral Surgery" },
    { code: "PERIO", nameAr: "علاج اللثة والوقاية", nameEn: "Periodontics" },
    { code: "PEDO", nameAr: "طب أسنان الأطفال", nameEn: "Pediatric Dentistry" },
    { code: "PROSTHO", nameAr: "التركيبات", nameEn: "Prosthodontics" },
  ];

  const specialties = new Map<string, string>();
  for (const s of specialtiesData) {
    const created = await prisma.specialty.upsert({
      where: { code: s.code },
      update: {},
      create: s,
    });
    specialties.set(s.code, created.id);
  }

  const proceduresData = [
    { code: "ENDO", nameAr: "علاج عصب جذر واحد", nameEn: "Pulpectomy", difficulty: "MEDIUM" as const },
    { code: "RESTO", nameAr: "حشوة تجميلية درجة II", nameEn: "Class II MO", difficulty: "SIMPLE" as const },
    { code: "OMFS", nameAr: "خلع جراحي", nameEn: "Surgical Extraction", difficulty: "COMPLEX" as const },
    { code: "PERIO", nameAr: "كشط جذري وتلبيس", nameEn: "Scaling & Root Planing", difficulty: "MEDIUM" as const },
    { code: "PEDO", nameAr: "حشوة لبنية", nameEn: "Primary Tooth Restoration", difficulty: "SIMPLE" as const },
    { code: "PROSTHO", nameAr: "تاج كامل", nameEn: "Full Crown", difficulty: "COMPLEX" as const },
  ];

  for (const p of proceduresData) {
    const specialtyId = specialties.get(p.code)!;
    const existing = await prisma.procedure.findFirst({ where: { specialtyId, nameEn: p.nameEn } });
    if (!existing) {
      await prisma.procedure.create({
        data: { specialtyId, nameAr: p.nameAr, nameEn: p.nameEn, difficulty: p.difficulty },
      });
    }
  }

  await prisma.supervisorProfile.upsert({
    where: { userId: supervisorUser.id },
    update: {},
    create: { userId: supervisorUser.id, specialtyId: specialties.get("ENDO") },
  });

  // ---- Clinics ----
  const clinicNames = [
    { name: "عيادة الطلاب 1", type: "STUDENT" as const },
    { name: "عيادة الطلاب 2", type: "STUDENT" as const },
    { name: "العيادة التخصصية — علاج الجذور", type: "SPECIALTY" as const },
  ];
  for (const c of clinicNames) {
    const existing = await prisma.clinic.findFirst({ where: { name: c.name } });
    if (!existing) await prisma.clinic.create({ data: c });
  }

  // ---- Academic period + quotas (example numbers from the BRD) ----
  let period = await prisma.academicPeriod.findFirst({ where: { isActive: true } });
  if (!period) {
    period = await prisma.academicPeriod.create({
      data: {
        name: "الفصل الأول 2026",
        startDate: new Date("2026-09-01"),
        endDate: new Date("2026-12-31"),
        isActive: true,
      },
    });
  }

  const quotas: [string, number][] = [
    ["ENDO", 5],
    ["RESTO", 8],
    ["OMFS", 3],
    ["PERIO", 4],
  ];
  for (const [code, requiredCount] of quotas) {
    await prisma.graduationQuota.upsert({
      where: {
        level_specialtyId_academicTermId: {
          level: "BDS4",
          specialtyId: specialties.get(code)!,
          academicTermId: period.id,
        },
      },
      update: { requiredCount },
      create: {
        level: "BDS4",
        specialtyId: specialties.get(code)!,
        academicTermId: period.id,
        requiredCount,
      },
    });
  }

  // ---- Demo student ----
  const studentUser = await prisma.user.upsert({
    where: { username: "443012345" },
    update: {},
    create: {
      username: "443012345",
      fullName: "أحمد الحربي",
      role: "STUDENT",
      passwordHash: await hash("Std#2026Temp"),
    },
  });
  await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: { userId: studentUser.id, studentNumber: "443012345", level: "BDS4", academicTermId: period.id },
  });

  return DEMO_CREDENTIALS;
}
