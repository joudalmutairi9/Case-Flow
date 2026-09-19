"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { writeAuditLog } from "@/lib/audit";
import { SETTINGS_KEYS, SETTINGS_DEFAULTS } from "@/lib/settings";
import type { ActionState } from "./auth";

export async function updateSettingsAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireRole("SUPER_ADMIN");

  await prisma.$transaction(
    SETTINGS_KEYS.map((key) => {
      const value = String(formData.get(key) ?? SETTINGS_DEFAULTS[key]);
      return prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    })
  );

  await writeAuditLog({ userId: admin.userId, action: "SETTINGS_UPDATED" });
  revalidatePath("/admin/settings");
  return { ok: true };
}

// ---- Notification templates ----

export async function upsertNotificationTemplateAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireRole("SUPER_ADMIN");
  const eventKey = String(formData.get("eventKey") ?? "").trim();
  const titleAr = String(formData.get("titleAr") ?? "").trim();
  const bodyAr = String(formData.get("bodyAr") ?? "").trim();
  const channel = String(formData.get("channel") ?? "IN_APP") as
    | "IN_APP"
    | "EMAIL"
    | "SMS";

  if (!eventKey || !titleAr || !bodyAr) {
    return { error: "جميع الحقول إلزامية." };
  }

  await prisma.notificationTemplate.upsert({
    where: { eventKey },
    update: { titleAr, bodyAr, channel },
    create: { eventKey, titleAr, bodyAr, channel },
  });

  await writeAuditLog({
    userId: admin.userId,
    action: "NOTIFICATION_TEMPLATE_SAVED",
    metadata: { eventKey },
  });

  revalidatePath("/admin/notification-templates");
  return { ok: true };
}
