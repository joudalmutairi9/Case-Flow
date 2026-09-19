"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { writeAuditLog } from "@/lib/audit";
import { transitionCase } from "@/lib/case-lifecycle";
import type { ActionState } from "./auth";
import type { Difficulty } from "@prisma/client";

export async function approveCaseAction(
  caseId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supervisor = await requireRole("SUPERVISOR");
  const specialtyId = String(formData.get("specialtyId") ?? "") || undefined;
  const difficulty = (String(formData.get("difficulty") ?? "") || undefined) as
    | Difficulty
    | undefined;
  const requiredLevel = String(formData.get("requiredLevel") ?? "") || undefined;

  await transitionCase(
    caseId,
    "IN_BANK",
    supervisor.userId,
    {
      supervisorId: supervisor.userId,
      reviewedAt: new Date(),
      reviewNote: null,
      ...(specialtyId && { specialtyId }),
      ...(difficulty && { difficulty }),
      ...(requiredLevel && { requiredLevel }),
    },
    "اعتمدها المشرف وطُرحت في بنك الحالات."
  );

  await writeAuditLog({
    userId: supervisor.userId,
    action: "CASE_APPROVED",
    entityType: "ClinicalCase",
    entityId: caseId,
  });

  revalidatePath("/supervisor/review-queue");
  return { ok: true };
}

export async function requestRevisionAction(
  caseId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supervisor = await requireRole("SUPERVISOR");
  const note = String(formData.get("note") ?? "").trim();
  if (!note) return { error: "يجب كتابة ملاحظة توضح سبب الإعادة." };

  await transitionCase(
    caseId,
    "NEEDS_REVISION",
    supervisor.userId,
    { supervisorId: supervisor.userId, reviewedAt: new Date(), reviewNote: note },
    note
  );

  await writeAuditLog({
    userId: supervisor.userId,
    action: "CASE_RETURNED_FOR_REVISION",
    entityType: "ClinicalCase",
    entityId: caseId,
  });

  revalidatePath("/supervisor/review-queue");
  return { ok: true };
}

export async function rejectCaseAction(
  caseId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supervisor = await requireRole("SUPERVISOR");
  const note = String(formData.get("note") ?? "").trim();
  if (!note) return { error: "يجب كتابة سبب الرفض." };

  await transitionCase(
    caseId,
    "REJECTED",
    supervisor.userId,
    { supervisorId: supervisor.userId, reviewedAt: new Date(), reviewNote: note },
    note
  );

  await writeAuditLog({
    userId: supervisor.userId,
    action: "CASE_REJECTED",
    entityType: "ClinicalCase",
    entityId: caseId,
  });

  revalidatePath("/supervisor/review-queue");
  return { ok: true };
}

export async function markUrgentAction(caseId: string, urgent: boolean) {
  const supervisor = await requireRole("SUPERVISOR");
  await prisma.clinicalCase.update({ where: { id: caseId }, data: { urgentFlagged: urgent } });
  await writeAuditLog({
    userId: supervisor.userId,
    action: urgent ? "CASE_MARKED_URGENT" : "CASE_UNMARKED_URGENT",
    entityType: "ClinicalCase",
    entityId: caseId,
  });
  revalidatePath("/supervisor/case-bank");
}

export async function withdrawFromBankAction(
  caseId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supervisor = await requireRole("SUPERVISOR");
  const note = String(formData.get("note") ?? "").trim() || "سُحبت من البنك من قبل المشرف.";

  await transitionCase(
    caseId,
    "CANCELLED",
    supervisor.userId,
    { supervisorId: supervisor.userId },
    note
  );

  await writeAuditLog({
    userId: supervisor.userId,
    action: "CASE_WITHDRAWN",
    entityType: "ClinicalCase",
    entityId: caseId,
  });

  revalidatePath("/supervisor/case-bank");
  return { ok: true };
}

export async function cancelBookingBySupervisorAction(
  caseId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supervisor = await requireRole("SUPERVISOR");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) return { error: "يجب ذكر سبب إلغاء الحجز." };

  await transitionCase(
    caseId,
    "IN_BANK",
    supervisor.userId,
    { studentId: null, studentProfileId: null, bookedAt: null, appointmentConfirmBy: null },
    `ألغى المشرف الحجز: ${reason}`
  );

  await writeAuditLog({
    userId: supervisor.userId,
    action: "BOOKING_CANCELLED_BY_SUPERVISOR",
    entityType: "ClinicalCase",
    entityId: caseId,
    metadata: { reason },
  });

  revalidatePath("/supervisor/students");
  return { ok: true };
}

export async function signStartTreatmentAction(caseId: string) {
  const supervisor = await requireRole("SUPERVISOR");
  await transitionCase(
    caseId,
    "IN_TREATMENT",
    supervisor.userId,
    { supervisorId: supervisor.userId },
    "وقّع المشرف على بدء العلاج."
  );
  await writeAuditLog({
    userId: supervisor.userId,
    action: "TREATMENT_STARTED",
    entityType: "ClinicalCase",
    entityId: caseId,
  });
  revalidatePath("/supervisor/review-queue");
}

export async function approveTreatmentPlanAction(caseId: string) {
  const supervisor = await requireRole("SUPERVISOR");
  await prisma.clinicalCase.update({
    where: { id: caseId },
    data: { treatmentPlanApprovedAt: new Date() },
  });
  await writeAuditLog({
    userId: supervisor.userId,
    action: "TREATMENT_PLAN_APPROVED",
    entityType: "ClinicalCase",
    entityId: caseId,
  });
  revalidatePath("/supervisor/review-queue");
}

export async function evaluateCaseAction(
  caseId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supervisor = await requireRole("SUPERVISOR");
  const score = Number(formData.get("score") ?? 0);
  const rubricNotes = String(formData.get("rubricNotes") ?? "").trim() || null;
  const passed = String(formData.get("passed")) === "true";

  if (score < 0 || score > 100) return { error: "الدرجة يجب أن تكون بين 0 و 100." };

  await prisma.evaluation.upsert({
    where: { caseId },
    update: { score, rubricNotes, passed, supervisorId: supervisor.userId },
    create: { caseId, score, rubricNotes, passed, supervisorId: supervisor.userId },
  });

  await transitionCase(
    caseId,
    passed ? "COMPLETED" : "IN_TREATMENT",
    supervisor.userId,
    {},
    passed ? "اعتمد المشرف الإنجاز واحتُسبت الحالة." : "طلب المشرف إعادة الإجراء."
  );

  await writeAuditLog({
    userId: supervisor.userId,
    action: "CASE_EVALUATED",
    entityType: "ClinicalCase",
    entityId: caseId,
    metadata: { score, passed },
  });

  revalidatePath("/supervisor/review-queue");
  return { ok: true };
}
