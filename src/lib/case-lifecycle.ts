import "server-only";
import { prisma } from "./prisma";
import type { CaseStatus } from "@prisma/client";

export async function generateCaseNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.clinicalCase.count({
    where: { caseNumber: { startsWith: `DEN-${year}-` } },
  });
  return `DEN-${year}-${String(1000 + count + 1)}`;
}

export async function transitionCase(
  caseId: string,
  toStatus: CaseStatus,
  changedById: string,
  extra: Record<string, unknown> = {},
  note?: string
) {
  const current = await prisma.clinicalCase.findUniqueOrThrow({ where: { id: caseId } });

  await prisma.$transaction([
    prisma.clinicalCase.update({
      where: { id: caseId },
      data: { status: toStatus, ...extra },
    }),
    prisma.caseStatusHistory.create({
      data: {
        caseId,
        fromStatus: current.status,
        toStatus,
        changedById,
        note,
      },
    }),
  ]);
}

let systemUserId: string | null = null;
async function getSystemUserId() {
  if (systemUserId) return systemUserId;
  const user = await prisma.user.findUnique({ where: { username: "system.automation" } });
  systemUserId = user?.id ?? null;
  return systemUserId;
}

/** BR-04: a booking not confirmed within the settings window returns to the bank automatically. */
export async function releaseExpiredBookings() {
  const expired = await prisma.clinicalCase.findMany({
    where: { status: "BOOKED", appointmentConfirmBy: { lt: new Date() } },
    select: { id: true },
  });
  if (expired.length === 0) return;

  const changedById = await getSystemUserId();
  if (!changedById) return;

  for (const { id } of expired) {
    await prisma.$transaction([
      prisma.clinicalCase.update({
        where: { id },
        data: {
          status: "IN_BANK",
          studentId: null,
          studentProfileId: null,
          bookedAt: null,
          appointmentConfirmBy: null,
        },
      }),
      prisma.caseStatusHistory.create({
        data: {
          caseId: id,
          fromStatus: "BOOKED",
          toStatus: "IN_BANK",
          changedById,
          note: "انتهت مهلة تأكيد الموعد (24 ساعة) فعادت الحالة تلقائياً للبنك.",
        },
      }),
    ]);
  }
}
