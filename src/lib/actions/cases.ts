"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { writeAuditLog } from "@/lib/audit";
import { generateCaseNumber } from "@/lib/case-lifecycle";
import type { ActionState } from "./auth";
import type { Difficulty, Priority, RadiographType } from "@prisma/client";

function readCaseFields(formData: FormData) {
  return {
    patientId: String(formData.get("patientId") ?? ""),
    chiefComplaint: String(formData.get("chiefComplaint") ?? "").trim(),
    medicalHistoryNote: String(formData.get("medicalHistoryNote") ?? "").trim() || null,
    clinicalExamNote: String(formData.get("clinicalExamNote") ?? "").trim(),
    toothFdi: String(formData.get("toothFdi") ?? "").trim() || null,
    specialtyId: String(formData.get("specialtyId") ?? ""),
    procedureId: String(formData.get("procedureId") ?? ""),
    difficulty: String(formData.get("difficulty") ?? "MEDIUM") as Difficulty,
    requiredLevel: String(formData.get("requiredLevel") ?? "").trim(),
    priority: String(formData.get("priority") ?? "NORMAL") as Priority,
    priorityReason: String(formData.get("priorityReason") ?? "").trim() || null,
    consentConfirmed: formData.get("consentConfirmed") === "on",
    notesForStudent: String(formData.get("notesForStudent") ?? "").trim() || null,
    radiographType: String(formData.get("radiographType") ?? "") as RadiographType | "",
    radiographUrl: String(formData.get("radiographUrl") ?? "").trim(),
  };
}

async function upsertCase(
  internId: string,
  fields: ReturnType<typeof readCaseFields>,
  submit: boolean,
  existingId?: string
) {
  if (
    !fields.patientId ||
    !fields.chiefComplaint ||
    !fields.clinicalExamNote ||
    !fields.specialtyId ||
    !fields.procedureId ||
    !fields.requiredLevel
  ) {
    return { error: "الحقول الأساسية إلزامية (المريض، الشكوى، الفحص، التخصص، الإجراء، المستوى)." };
  }

  if (submit && !fields.consentConfirmed) {
    return { error: "لا يمكن إرسال الحالة للاعتماد دون تأكيد موافقة المريض على العلاج." };
  }

  const status = submit ? "PENDING_REVIEW" : "DRAFT";
  const data = {
    patientId: fields.patientId,
    internId,
    chiefComplaint: fields.chiefComplaint,
    medicalHistoryNote: fields.medicalHistoryNote,
    clinicalExamNote: fields.clinicalExamNote,
    toothFdi: fields.toothFdi,
    specialtyId: fields.specialtyId,
    procedureId: fields.procedureId,
    difficulty: fields.difficulty,
    requiredLevel: fields.requiredLevel,
    priority: fields.priority,
    priorityReason: fields.priorityReason,
    consentConfirmed: fields.consentConfirmed,
    notesForStudent: fields.notesForStudent,
    status: status as "DRAFT" | "PENDING_REVIEW",
  };

  let caseId = existingId;
  if (existingId) {
    await prisma.clinicalCase.update({ where: { id: existingId }, data });
  } else {
    const caseNumber = await generateCaseNumber();
    const created = await prisma.clinicalCase.create({ data: { ...data, caseNumber } });
    caseId = created.id;
  }

  if (fields.radiographType && fields.radiographUrl) {
    await prisma.radiograph.create({
      data: { caseId: caseId!, type: fields.radiographType, fileUrl: fields.radiographUrl },
    });
  }

  await prisma.caseStatusHistory.create({
    data: {
      caseId: caseId!,
      toStatus: status,
      changedById: internId,
      note: submit ? "أُرسلت للمشرف للاعتماد." : "حُفظت كمسودة.",
    },
  });

  return { ok: true, caseId: caseId! };
}

export async function createCaseAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const intern = await requireRole("INTERN");
  const submit = String(formData.get("intent")) === "submit";
  const fields = readCaseFields(formData);

  const result = await upsertCase(intern.userId, fields, submit);
  if (result.error) return { error: result.error };

  await writeAuditLog({
    userId: intern.userId,
    action: submit ? "CASE_SUBMITTED" : "CASE_DRAFT_SAVED",
    entityType: "ClinicalCase",
    entityId: result.caseId,
  });

  revalidatePath("/intern/dashboard");
  revalidatePath("/intern/cases");
  redirect(`/intern/cases/${result.caseId}`);
}

export async function resubmitCaseAction(
  caseId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const intern = await requireRole("INTERN");
  const existing = await prisma.clinicalCase.findUnique({ where: { id: caseId } });
  if (!existing || existing.internId !== intern.userId) {
    return { error: "الحالة غير موجودة." };
  }
  if (existing.status !== "NEEDS_REVISION" && existing.status !== "DRAFT") {
    return { error: "لا يمكن تعديل حالة بعد اعتمادها أو حجزها." };
  }

  const submit = String(formData.get("intent")) === "submit";
  const fields = readCaseFields(formData);
  const result = await upsertCase(intern.userId, fields, submit, caseId);
  if (result.error) return { error: result.error };

  await writeAuditLog({
    userId: intern.userId,
    action: submit ? "CASE_RESUBMITTED" : "CASE_DRAFT_UPDATED",
    entityType: "ClinicalCase",
    entityId: caseId,
  });

  revalidatePath("/intern/cases");
  redirect(`/intern/cases/${caseId}`);
}
