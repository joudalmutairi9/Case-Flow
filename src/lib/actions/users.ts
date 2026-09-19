"use server";

import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { hashPassword, generateTemporaryPassword } from "@/lib/password";
import { writeAuditLog } from "@/lib/audit";
import type { Role } from "@prisma/client";
import type { ActionState } from "./auth";

export async function createUserAction(
  _prev: ActionState & { tempPassword?: string },
  formData: FormData
): Promise<ActionState & { tempPassword?: string }> {
  const admin = await requireRole("SUPER_ADMIN");

  const role = String(formData.get("role")) as Role;
  const fullName = String(formData.get("fullName") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const expiresRaw = String(formData.get("accountExpiresAt") ?? "");

  if (!fullName || !username || !role) {
    return { error: "الاسم واسم المستخدم والدور حقول إلزامية." };
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return { error: "اسم المستخدم مستخدم بالفعل." };
  }

  const tempPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(tempPassword);

  try {
    const user = await prisma.user.create({
      data: {
        role,
        fullName,
        username,
        email,
        phone,
        passwordHash,
        mustChangePassword: true,
        accountExpiresAt: expiresRaw ? new Date(expiresRaw) : null,
      },
    });

    if (role === "STUDENT") {
      const studentNumber = String(formData.get("studentNumber") ?? "").trim();
      const level = String(formData.get("level") ?? "").trim();
      if (!studentNumber || !level) {
        await prisma.user.delete({ where: { id: user.id } });
        return { error: "الرقم الجامعي والمستوى إلزاميان للطالب." };
      }
      await prisma.studentProfile.create({
        data: { userId: user.id, studentNumber, level },
      });
    } else if (role === "INTERN") {
      await prisma.internProfile.create({
        data: {
          userId: user.id,
          rotationLabel: String(formData.get("rotationLabel") ?? "") || null,
          department: String(formData.get("department") ?? "") || null,
        },
      });
    } else if (role === "SUPERVISOR") {
      const specialtyId = String(formData.get("specialtyId") ?? "") || null;
      await prisma.supervisorProfile.create({
        data: { userId: user.id, specialtyId },
      });
    }

    await writeAuditLog({
      userId: admin.userId,
      action: "USER_CREATED",
      entityType: "User",
      entityId: user.id,
      metadata: { role, username },
    });

    revalidatePath("/admin/users");
    return { ok: true, tempPassword };
  } catch {
    return { error: "تعذر إنشاء الحساب. تحقق من البيانات المدخلة." };
  }
}

export async function toggleUserStatusAction(userId: string, disable: boolean) {
  const admin = await requireRole("SUPER_ADMIN");
  await prisma.user.update({
    where: { id: userId },
    data: { status: disable ? "DISABLED" : "ACTIVE" },
  });
  await writeAuditLog({
    userId: admin.userId,
    action: disable ? "USER_DISABLED" : "USER_ENABLED",
    entityType: "User",
    entityId: userId,
  });
  revalidatePath("/admin/users");
}

export async function unlockUserAction(userId: string) {
  const admin = await requireRole("SUPER_ADMIN");
  await prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });
  await writeAuditLog({
    userId: admin.userId,
    action: "USER_UNLOCKED",
    entityType: "User",
    entityId: userId,
  });
  revalidatePath("/admin/users");
}

export async function resetUserPasswordAction(
  userId: string
): Promise<{ tempPassword: string }> {
  const admin = await requireRole("SUPER_ADMIN");
  const tempPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(tempPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, mustChangePassword: true, failedLoginAttempts: 0, lockedUntil: null },
  });
  await writeAuditLog({
    userId: admin.userId,
    action: "USER_PASSWORD_RESET_BY_ADMIN",
    entityType: "User",
    entityId: userId,
  });
  revalidatePath("/admin/users");
  return { tempPassword };
}

export type BulkImportResult = {
  createdCount: number;
  rejected: { row: number; reason: string }[];
};

export async function bulkImportUsersAction(
  _prev: BulkImportResult | null,
  formData: FormData
): Promise<BulkImportResult> {
  const admin = await requireRole("SUPER_ADMIN");
  const file = formData.get("file") as File | null;
  const role = String(formData.get("role") ?? "") as Role;

  if (!file || (role !== "STUDENT" && role !== "INTERN")) {
    return { createdCount: 0, rejected: [{ row: 0, reason: "الملف أو الدور غير صالح." }] };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });

  const rejected: { row: number; reason: string }[] = [];
  let createdCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2; // header row is 1
    const fullName = String(row["الاسم"] ?? row["fullName"] ?? "").trim();
    const username = String(row["اسم المستخدم"] ?? row["username"] ?? "").trim();
    const idNumber = String(
      row["الرقم الجامعي"] ?? row["studentNumber"] ?? row["رقم الامتياز"] ?? ""
    ).trim();
    const level = String(row["المستوى"] ?? row["level"] ?? "").trim();

    if (!fullName || !username) {
      rejected.push({ row: rowNumber, reason: "الاسم أو اسم المستخدم مفقود." });
      continue;
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      rejected.push({ row: rowNumber, reason: "اسم المستخدم مكرر." });
      continue;
    }

    if (role === "STUDENT" && (!idNumber || !level)) {
      rejected.push({ row: rowNumber, reason: "الرقم الجامعي أو المستوى مفقود." });
      continue;
    }

    const tempPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(tempPassword);

    const user = await prisma.user.create({
      data: { role, fullName, username, passwordHash, mustChangePassword: true },
    });

    if (role === "STUDENT") {
      await prisma.studentProfile.create({
        data: { userId: user.id, studentNumber: idNumber, level },
      });
    } else {
      await prisma.internProfile.create({
        data: { userId: user.id, rotationLabel: level || null },
      });
    }
    createdCount++;
  }

  await writeAuditLog({
    userId: admin.userId,
    action: "USERS_BULK_IMPORTED",
    metadata: { role, createdCount, rejectedCount: rejected.length },
  });

  revalidatePath("/admin/users");
  return { createdCount, rejected };
}
