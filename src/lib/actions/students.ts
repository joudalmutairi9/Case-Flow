"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { writeAuditLog } from "@/lib/audit";
import type { ActionState } from "./auth";

export async function promoteStudentAction(
  studentProfileId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireRole("SUPER_ADMIN");
  const newLevel = String(formData.get("newLevel") ?? "").trim();
  if (!newLevel) return { error: "أدخل المستوى الجديد." };

  const before = await prisma.studentProfile.findUnique({ where: { id: studentProfileId } });

  await prisma.studentProfile.update({
    where: { id: studentProfileId },
    data: { level: newLevel },
  });

  await writeAuditLog({
    userId: admin.userId,
    action: "STUDENT_PROMOTED",
    entityType: "StudentProfile",
    entityId: studentProfileId,
    metadata: { from: before?.level, to: newLevel },
  });

  revalidatePath("/admin/students");
  return { ok: true };
}
