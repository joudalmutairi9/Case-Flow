"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { writeAuditLog } from "@/lib/audit";
import type { Difficulty, ClinicType } from "@prisma/client";
import type { ActionState } from "./auth";

// ---- Specialties ----

export async function createSpecialtyAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireRole("SUPER_ADMIN");
  const code = String(formData.get("code") ?? "").trim();
  const nameAr = String(formData.get("nameAr") ?? "").trim();
  const nameEn = String(formData.get("nameEn") ?? "").trim();

  if (!code || !nameAr || !nameEn) {
    return { error: "جميع الحقول إلزامية." };
  }

  try {
    const specialty = await prisma.specialty.create({ data: { code, nameAr, nameEn } });
    await writeAuditLog({
      userId: admin.userId,
      action: "SPECIALTY_CREATED",
      entityType: "Specialty",
      entityId: specialty.id,
    });
  } catch {
    return { error: "الرمز مستخدم بالفعل." };
  }
  revalidatePath("/admin/reference/specialties");
  return { ok: true };
}

export async function toggleSpecialtyAction(id: string, isActive: boolean) {
  await requireRole("SUPER_ADMIN");
  await prisma.specialty.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/reference/specialties");
}

// ---- Procedures ----

export async function createProcedureAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireRole("SUPER_ADMIN");
  const specialtyId = String(formData.get("specialtyId") ?? "");
  const nameAr = String(formData.get("nameAr") ?? "").trim();
  const nameEn = String(formData.get("nameEn") ?? "").trim();
  const difficulty = String(formData.get("difficulty") ?? "MEDIUM") as Difficulty;

  if (!specialtyId || !nameAr || !nameEn) {
    return { error: "جميع الحقول إلزامية." };
  }

  const procedure = await prisma.procedure.create({
    data: { specialtyId, nameAr, nameEn, difficulty },
  });
  await writeAuditLog({
    userId: admin.userId,
    action: "PROCEDURE_CREATED",
    entityType: "Procedure",
    entityId: procedure.id,
  });
  revalidatePath("/admin/reference/specialties");
  return { ok: true };
}

export async function toggleProcedureAction(id: string, isActive: boolean) {
  await requireRole("SUPER_ADMIN");
  await prisma.procedure.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/reference/specialties");
}

// ---- Clinics ----

export async function createClinicAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireRole("SUPER_ADMIN");
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "STUDENT") as ClinicType;

  if (!name) return { error: "اسم العيادة إلزامي." };

  const clinic = await prisma.clinic.create({ data: { name, type } });
  await writeAuditLog({
    userId: admin.userId,
    action: "CLINIC_CREATED",
    entityType: "Clinic",
    entityId: clinic.id,
  });
  revalidatePath("/admin/reference/clinics");
  return { ok: true };
}

export async function toggleClinicAction(id: string, isActive: boolean) {
  await requireRole("SUPER_ADMIN");
  await prisma.clinic.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/reference/clinics");
}

// ---- Academic periods & quotas ----

export async function createAcademicPeriodAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireRole("SUPER_ADMIN");
  const name = String(formData.get("name") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");

  if (!name || !startDate || !endDate) {
    return { error: "جميع الحقول إلزامية." };
  }

  const period = await prisma.academicPeriod.create({
    data: { name, startDate: new Date(startDate), endDate: new Date(endDate) },
  });
  await writeAuditLog({
    userId: admin.userId,
    action: "ACADEMIC_PERIOD_CREATED",
    entityType: "AcademicPeriod",
    entityId: period.id,
  });
  revalidatePath("/admin/reference/quotas");
  return { ok: true };
}

export async function setActivePeriodAction(id: string) {
  await requireRole("SUPER_ADMIN");
  await prisma.$transaction([
    prisma.academicPeriod.updateMany({ data: { isActive: false }, where: {} }),
    prisma.academicPeriod.update({ where: { id }, data: { isActive: true } }),
  ]);
  revalidatePath("/admin/reference/quotas");
}

export async function upsertQuotaAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireRole("SUPER_ADMIN");
  const level = String(formData.get("level") ?? "").trim();
  const specialtyId = String(formData.get("specialtyId") ?? "");
  const academicTermId = String(formData.get("academicTermId") ?? "");
  const requiredCount = Number(formData.get("requiredCount") ?? 0);

  if (!level || !specialtyId || !academicTermId || requiredCount <= 0) {
    return { error: "جميع الحقول إلزامية والعدد يجب أن يكون أكبر من صفر." };
  }

  await prisma.graduationQuota.upsert({
    where: { level_specialtyId_academicTermId: { level, specialtyId, academicTermId } },
    update: { requiredCount },
    create: { level, specialtyId, academicTermId, requiredCount },
  });

  await writeAuditLog({
    userId: admin.userId,
    action: "QUOTA_UPSERTED",
    entityType: "GraduationQuota",
    metadata: { level, specialtyId, academicTermId, requiredCount },
  });

  revalidatePath("/admin/reference/quotas");
  return { ok: true };
}
