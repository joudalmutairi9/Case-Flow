"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { writeAuditLog } from "@/lib/audit";
import type { ActionState } from "./auth";
import type { CallDirection, CallType } from "@prisma/client";

async function generateMrn() {
  const year = new Date().getFullYear();
  const count = await prisma.patient.count({
    where: { mrn: { startsWith: `MRN-${year}-` } },
  });
  return `MRN-${year}-${String(count + 1).padStart(5, "0")}`;
}

export async function createPatientAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const staff = await requireRole("RECORDS", "SUPER_ADMIN");

  const fullName = String(formData.get("fullName") ?? "").trim();
  const nationalId = String(formData.get("nationalId") ?? "").trim();
  const dob = String(formData.get("dob") ?? "");
  const gender = String(formData.get("gender") ?? "MALE") as "MALE" | "FEMALE";
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim() || null;
  const emergencyContact = String(formData.get("emergencyContact") ?? "").trim() || null;
  const chronicConditions = String(formData.get("chronicConditions") ?? "").trim() || null;
  const allergies = String(formData.get("allergies") ?? "").trim() || null;

  if (!fullName || !nationalId || !dob || !phone) {
    return { error: "الاسم ورقم الهوية وتاريخ الميلاد والجوال حقول إلزامية." };
  }

  // MR-02: prevent duplicates by national ID.
  const existing = await prisma.patient.findUnique({ where: { nationalId } });
  if (existing) {
    return {
      error: `رقم الهوية مسجل مسبقاً للمريض "${existing.fullName}" برقم ملف ${existing.mrn}.`,
    };
  }

  const mrn = await generateMrn();

  const patient = await prisma.patient.create({
    data: {
      mrn,
      nationalId,
      fullName,
      dob: new Date(dob),
      gender,
      phone,
      address,
      emergencyContact,
      chronicConditions,
      allergies,
      createdById: staff.userId,
    },
  });

  await writeAuditLog({
    userId: staff.userId,
    action: "PATIENT_REGISTERED",
    entityType: "Patient",
    entityId: patient.id,
    metadata: { mrn },
  });

  revalidatePath("/records/patients");
  redirect(`/records/patients/${patient.id}`);
}

export async function archivePatientAction(patientId: string) {
  const staff = await requireRole("RECORDS", "SUPER_ADMIN");
  await prisma.patient.update({ where: { id: patientId }, data: { status: "ARCHIVED" } });
  await writeAuditLog({
    userId: staff.userId,
    action: "PATIENT_ARCHIVED",
    entityType: "Patient",
    entityId: patientId,
  });
  revalidatePath("/records/patients");
}

export async function logCallAction(
  patientId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const staff = await requireRole("RECORDS", "SUPER_ADMIN");
  const direction = String(formData.get("direction") ?? "OUTBOUND") as CallDirection;
  const type = String(formData.get("type") ?? "REMINDER") as CallType;
  const outcome = String(formData.get("outcome") ?? "").trim() || null;

  await prisma.call.create({
    data: { patientId, direction, type, outcome, handledById: staff.userId },
  });

  await writeAuditLog({
    userId: staff.userId,
    action: "CALL_LOGGED",
    entityType: "Patient",
    entityId: patientId,
    metadata: { direction, type },
  });

  revalidatePath(`/records/patients/${patientId}`);
  return { ok: true };
}
