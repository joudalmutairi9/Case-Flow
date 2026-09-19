"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { writeAuditLog } from "@/lib/audit";
import { transitionCase, releaseExpiredBookings } from "@/lib/case-lifecycle";
import { getSettings } from "@/lib/settings";
import type { ActionState } from "./auth";

async function getStudentProfile(userId: string) {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error("Student profile not found");
  return profile;
}

export async function bookCaseAction(caseId: string): Promise<ActionState> {
  const student = await requireRole("STUDENT");
  await releaseExpiredBookings();

  const profile = await getStudentProfile(student.userId);
  const settings = await getSettings();
  const maxOpen = Number(settings.maxOpenBookingsPerStudent);
  const confirmHours = Number(settings.appointmentConfirmHours);

  const openCount = await prisma.clinicalCase.count({
    where: {
      studentProfileId: profile.id,
      status: { in: ["BOOKED", "SCHEDULED", "IN_TREATMENT"] },
    },
  });
  if (openCount >= maxOpen) {
    return { error: `تجاوزت الحد الأقصى للحجوزات المفتوحة (${maxOpen}).` };
  }

  // Atomic guard: only one student can win the booking (BR-02).
  const result = await prisma.clinicalCase.updateMany({
    where: { id: caseId, status: "IN_BANK" },
    data: {
      status: "BOOKED",
      studentId: student.userId,
      studentProfileId: profile.id,
      bookedAt: new Date(),
      appointmentConfirmBy: new Date(Date.now() + confirmHours * 60 * 60 * 1000),
    },
  });

  if (result.count === 0) {
    return { error: "لم تعد هذه الحالة متاحة، حجزها طالب آخر للتو." };
  }

  await prisma.caseStatusHistory.create({
    data: { caseId, fromStatus: "IN_BANK", toStatus: "BOOKED", changedById: student.userId, note: "حجزها الطالب." },
  });

  await writeAuditLog({
    userId: student.userId,
    action: "CASE_BOOKED",
    entityType: "ClinicalCase",
    entityId: caseId,
  });

  revalidatePath("/student/case-bank");
  revalidatePath("/student/my-cases");
  return { ok: true };
}

export async function confirmAppointmentAction(
  caseId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const student = await requireRole("STUDENT");
  const clinicId = String(formData.get("clinicId") ?? "");
  const scheduledAt = String(formData.get("scheduledAt") ?? "");
  const acknowledged = formData.get("acknowledged") === "on";

  if (!clinicId || !scheduledAt) return { error: "اختر العيادة والموعد." };
  if (!acknowledged) return { error: "يجب الإقرار بقراءة بروتوكول الحجز." };

  const clinicalCase = await prisma.clinicalCase.findUnique({ where: { id: caseId } });
  if (!clinicalCase || clinicalCase.studentId !== student.userId || clinicalCase.status !== "BOOKED") {
    return { error: "لا يمكن تأكيد هذا الموعد." };
  }

  await prisma.appointment.create({
    data: { caseId, clinicId, scheduledAt: new Date(scheduledAt) },
  });

  await transitionCase(caseId, "SCHEDULED", student.userId, {}, "أكّد الطالب الموعد مع المريض.");

  await writeAuditLog({
    userId: student.userId,
    action: "APPOINTMENT_CONFIRMED",
    entityType: "ClinicalCase",
    entityId: caseId,
  });

  revalidatePath("/student/my-cases");
  return { ok: true };
}

export async function cancelBookingAction(
  caseId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const student = await requireRole("STUDENT");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) return { error: "يجب ذكر سبب الإلغاء." };

  const settings = await getSettings();
  const cancellationHours = Number(settings.cancellationHours);

  const clinicalCase = await prisma.clinicalCase.findUnique({
    where: { id: caseId },
    include: { appointments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!clinicalCase || clinicalCase.studentId !== student.userId) {
    return { error: "الحالة غير موجودة." };
  }

  const appointment = clinicalCase.appointments[0];
  const isLate =
    appointment &&
    appointment.scheduledAt.getTime() - Date.now() < cancellationHours * 60 * 60 * 1000;

  if (appointment) {
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { cancelledAt: new Date(), cancelReason: reason },
    });
  }

  await transitionCase(
    caseId,
    "IN_BANK",
    student.userId,
    { studentId: null, studentProfileId: null, bookedAt: null, appointmentConfirmBy: null },
    `ألغى الطالب الحجز (${isLate ? "إلغاء متأخر" : "إلغاء ضمن المهلة"}): ${reason}`
  );

  await writeAuditLog({
    userId: student.userId,
    action: isLate ? "LATE_CANCELLATION" : "CASE_CANCELLED",
    entityType: "ClinicalCase",
    entityId: caseId,
    metadata: { reason },
  });

  revalidatePath("/student/case-bank");
  revalidatePath("/student/my-cases");
  return { ok: true };
}

export async function uploadTreatmentPlanAction(
  caseId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const student = await requireRole("STUDENT");
  const fileUrl = String(formData.get("treatmentPlanFileUrl") ?? "").trim();
  if (!fileUrl) return { error: "أضف رابط ملف خطة العلاج." };

  await prisma.clinicalCase.updateMany({
    where: { id: caseId, studentId: student.userId },
    data: { treatmentPlanFileUrl: fileUrl },
  });

  await writeAuditLog({
    userId: student.userId,
    action: "TREATMENT_PLAN_UPLOADED",
    entityType: "ClinicalCase",
    entityId: caseId,
  });

  revalidatePath("/student/my-cases");
  return { ok: true };
}

export async function submitCompletionAction(
  caseId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const student = await requireRole("STUDENT");
  const summary = String(formData.get("completionSummary") ?? "").trim();
  if (!summary) return { error: "اكتب ملخص الإجراء المنجز." };

  const clinicalCase = await prisma.clinicalCase.findUnique({ where: { id: caseId } });
  if (!clinicalCase || clinicalCase.studentId !== student.userId || clinicalCase.status !== "IN_TREATMENT") {
    return { error: "لا يمكن رفع ملخص الإنجاز في هذه المرحلة." };
  }

  await transitionCase(
    caseId,
    "PENDING_EVALUATION",
    student.userId,
    { completionSummary: summary },
    "رفع الطالب ملخص الإنجاز بانتظار تقييم المشرف."
  );

  await writeAuditLog({
    userId: student.userId,
    action: "COMPLETION_SUBMITTED",
    entityType: "ClinicalCase",
    entityId: caseId,
  });

  revalidatePath("/student/my-cases");
  return { ok: true };
}
