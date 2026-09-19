"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { writeAuditLog } from "@/lib/audit";
import type { ActionState } from "./auth";

export async function createSupervisionGroupAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireRole("SUPER_ADMIN");
  const name = String(formData.get("name") ?? "").trim();
  const supervisorId = String(formData.get("supervisorId") ?? "");

  if (!name || !supervisorId) {
    return { error: "اسم المجموعة والمشرف إلزاميان." };
  }

  let group;
  try {
    group = await prisma.supervisionGroup.create({
      data: { name, supervisorId },
    });
  } catch {
    return { error: "تعذر إنشاء المجموعة. تأكد من اختيار مشرف صالح." };
  }
  await writeAuditLog({
    userId: admin.userId,
    action: "SUPERVISION_GROUP_CREATED",
    entityType: "SupervisionGroup",
    entityId: group.id,
  });
  revalidatePath("/admin/groups");
  return { ok: true };
}

export async function assignStudentToGroupAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireRole("SUPER_ADMIN");
  const studentProfileId = String(formData.get("studentProfileId") ?? "");
  const groupId = String(formData.get("groupId") ?? "") || null;

  if (!studentProfileId) return { error: "اختر الطالب أولاً." };

  await prisma.studentProfile.update({
    where: { id: studentProfileId },
    data: { groupId },
  });
  await writeAuditLog({
    userId: admin.userId,
    action: "STUDENT_ASSIGNED_TO_GROUP",
    entityType: "StudentProfile",
    entityId: studentProfileId,
    metadata: { groupId },
  });
  revalidatePath("/admin/groups");
  return { ok: true };
}

export async function assignInternToGroupAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireRole("SUPER_ADMIN");
  const internProfileId = String(formData.get("internProfileId") ?? "");
  const groupId = String(formData.get("groupId") ?? "") || null;

  if (!internProfileId) return { error: "اختر الطبيب أولاً." };

  await prisma.internProfile.update({
    where: { id: internProfileId },
    data: { groupId },
  });
  await writeAuditLog({
    userId: admin.userId,
    action: "INTERN_ASSIGNED_TO_GROUP",
    entityType: "InternProfile",
    entityId: internProfileId,
    metadata: { groupId },
  });
  revalidatePath("/admin/groups");
  return { ok: true };
}
