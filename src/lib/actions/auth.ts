"use server";

import { redirect } from "next/navigation";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, getSession } from "@/lib/session";
import {
  hashPassword,
  verifyPassword,
  validatePasswordPolicy,
  isPasswordReused,
  PASSWORD_HISTORY_LIMIT,
} from "@/lib/password";
import { writeAuditLog } from "@/lib/audit";
import { getRequestMeta } from "@/lib/request-meta";
import { PORTALS, ROLE_TO_PORTAL, type PortalKey } from "@/lib/portals";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const GENERIC_LOGIN_ERROR = "اسم المستخدم أو كلمة المرور غير صحيحة.";

export type ActionState = { error?: string; ok?: boolean };

export async function loginAction(
  portal: PortalKey,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const { ip, userAgent } = await getRequestMeta();

  if (!username || !password) {
    return { error: GENERIC_LOGIN_ERROR };
  }

  const config = PORTALS[portal];
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || user.role !== config.role) {
    await writeAuditLog({
      action: "LOGIN_FAILED",
      actorUsername: username,
      metadata: { reason: "not_found_or_wrong_portal", portal },
      ip,
      userAgent,
      success: false,
    });
    return { error: GENERIC_LOGIN_ERROR };
  }

  if (user.status !== "ACTIVE") {
    await writeAuditLog({
      userId: user.id,
      action: "LOGIN_FAILED",
      actorUsername: username,
      metadata: { reason: "account_disabled" },
      ip,
      userAgent,
      success: false,
    });
    return { error: "الحساب معطّل. يرجى مراجعة السوبر أدمن." };
  }

  if (user.accountExpiresAt && user.accountExpiresAt < new Date()) {
    await writeAuditLog({
      userId: user.id,
      action: "LOGIN_FAILED",
      actorUsername: username,
      metadata: { reason: "account_expired" },
      ip,
      userAgent,
      success: false,
    });
    return { error: "انتهت صلاحية هذا الحساب." };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil(
      (user.lockedUntil.getTime() - Date.now()) / 60000
    );
    await writeAuditLog({
      userId: user.id,
      action: "LOGIN_FAILED",
      actorUsername: username,
      metadata: { reason: "locked" },
      ip,
      userAgent,
      success: false,
    });
    return {
      error: `الحساب مقفل مؤقتاً بسبب محاولات فاشلة متكررة. حاول بعد ${minutesLeft} دقيقة.`,
    };
  }

  const passwordOk = await verifyPassword(password, user.passwordHash);

  if (!passwordOk) {
    const failedAttempts = user.failedLoginAttempts + 1;
    const locked = failedAttempts >= MAX_FAILED_ATTEMPTS;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: locked ? 0 : failedAttempts,
        lockedUntil: locked
          ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
          : null,
      },
    });
    await writeAuditLog({
      userId: user.id,
      action: "LOGIN_FAILED",
      actorUsername: username,
      metadata: { reason: "wrong_password", failedAttempts, locked },
      ip,
      userAgent,
      success: false,
    });
    return { error: GENERIC_LOGIN_ERROR };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  });

  await createSession({
    userId: user.id,
    username: user.username,
    role: user.role,
    fullName: user.fullName,
    mustChangePassword: user.mustChangePassword,
  });

  await writeAuditLog({
    userId: user.id,
    action: "LOGIN_SUCCESS",
    actorUsername: username,
    ip,
    userAgent,
  });

  if (user.mustChangePassword) {
    redirect(`/${portal}/change-password`);
  }
  redirect(`/${portal}/dashboard`);
}

export async function logoutAction() {
  const session = await getSession();
  if (session) {
    await writeAuditLog({
      userId: session.userId,
      action: "LOGOUT",
      actorUsername: session.username,
    });
  }
  await destroySession();
  const portal = session ? ROLE_TO_PORTAL[session.role] : "admin";
  redirect(`/${portal}/login`);
}

export async function changePasswordAction(
  portal: PortalKey,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect(`/${portal}/login`);

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword !== confirmPassword) {
    return { error: "كلمة المرور الجديدة وتأكيدها غير متطابقين." };
  }

  const policyError = validatePasswordPolicy(newPassword, session.username);
  if (policyError) return { error: policyError };

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { passwordHistory: { orderBy: { createdAt: "desc" }, take: PASSWORD_HISTORY_LIMIT } },
  });
  if (!user) redirect(`/${portal}/login`);

  const currentOk = await verifyPassword(currentPassword, user!.passwordHash);
  if (!currentOk) {
    return { error: "كلمة المرور الحالية غير صحيحة." };
  }

  const reused = await isPasswordReused(
    newPassword,
    [user!.passwordHash, ...user!.passwordHistory.map((p) => p.passwordHash)]
  );
  if (reused) {
    return { error: "لا يمكن تكرار آخر 3 كلمات مرور مستخدمة." };
  }

  const newHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.passwordHistory.create({
      data: { userId: user!.id, passwordHash: user!.passwordHash },
    }),
    prisma.user.update({
      where: { id: user!.id },
      data: { passwordHash: newHash, mustChangePassword: false },
    }),
  ]);

  await writeAuditLog({
    userId: user!.id,
    action: "PASSWORD_CHANGED",
    actorUsername: user!.username,
  });

  await createSession({
    userId: user!.id,
    username: user!.username,
    role: user!.role,
    fullName: user!.fullName,
    mustChangePassword: false,
  });

  redirect(`/${portal}/dashboard`);
}

export async function forgotPasswordAction(
  portal: PortalKey,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const username = String(formData.get("username") ?? "").trim();
  const config = PORTALS[portal];
  const genericOk: ActionState = {
    ok: true,
    error:
      "إذا كان الحساب موجوداً، سيصلك رابط إعادة تعيين كلمة المرور خلال دقائق.",
  };

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || user.role !== config.role || user.status !== "ACTIVE") {
    return genericOk;
  }

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });

  await writeAuditLog({
    userId: user.id,
    action: "PASSWORD_RESET_REQUESTED",
    actorUsername: username,
  });

  // TODO(production): send `resetUrl` via the hospital's email/SMS provider
  // (see AUTH-05). No provider is configured yet, so in this environment the
  // link is returned directly to the requester for development/demo use.
  const resetUrl = `/${portal}/reset-password/${rawToken}`;
  return {
    ok: true,
    error: `تم إنشاء رابط إعادة التعيين (بيئة تجريبية، لا يوجد مزوّد بريد/SMS بعد): ${resetUrl}`,
  };
}

export async function resetPasswordAction(
  portal: PortalKey,
  token: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword !== confirmPassword) {
    return { error: "كلمة المرور الجديدة وتأكيدها غير متطابقين." };
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt < new Date()
  ) {
    return { error: "الرابط غير صالح أو منتهي الصلاحية." };
  }

  const policyError = validatePasswordPolicy(
    newPassword,
    resetToken.user.username
  );
  if (policyError) return { error: policyError };

  const history = await prisma.passwordHistory.findMany({
    where: { userId: resetToken.userId },
    orderBy: { createdAt: "desc" },
    take: PASSWORD_HISTORY_LIMIT,
  });
  const reused = await isPasswordReused(newPassword, [
    resetToken.user.passwordHash,
    ...history.map((h) => h.passwordHash),
  ]);
  if (reused) {
    return { error: "لا يمكن تكرار آخر 3 كلمات مرور مستخدمة." };
  }

  const newHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.passwordHistory.create({
      data: { userId: resetToken.userId, passwordHash: resetToken.user.passwordHash },
    }),
    prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  await writeAuditLog({
    userId: resetToken.userId,
    action: "PASSWORD_RESET_COMPLETED",
    actorUsername: resetToken.user.username,
  });

  redirect(`/${portal}/login`);
}
