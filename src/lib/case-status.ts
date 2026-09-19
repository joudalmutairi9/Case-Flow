import type { CaseStatus } from "@prisma/client";

export const CASE_STATUS_LABEL_AR: Record<CaseStatus, string> = {
  DRAFT: "مسودة",
  PENDING_REVIEW: "بانتظار اعتماد المشرف",
  NEEDS_REVISION: "معادة للتعديل",
  REJECTED: "مرفوضة",
  IN_BANK: "في البنك (متاحة)",
  BOOKED: "محجوزة",
  SCHEDULED: "مجدولة",
  IN_TREATMENT: "قيد العلاج",
  PENDING_EVALUATION: "بانتظار التقييم",
  COMPLETED: "مكتملة وموثقة",
  CANCELLED: "ملغاة",
};

export const CASE_STATUS_TONE: Record<
  CaseStatus,
  "default" | "success" | "warning" | "danger"
> = {
  DRAFT: "default",
  PENDING_REVIEW: "warning",
  NEEDS_REVISION: "danger",
  REJECTED: "danger",
  IN_BANK: "success",
  BOOKED: "warning",
  SCHEDULED: "warning",
  IN_TREATMENT: "default",
  PENDING_EVALUATION: "warning",
  COMPLETED: "success",
  CANCELLED: "default",
};
