import "server-only";
import { prisma } from "./prisma";

export async function writeAuditLog(entry: {
  userId?: string | null;
  actorUsername?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
  success?: boolean;
}) {
  await prisma.auditLog.create({
    data: {
      userId: entry.userId ?? null,
      actorUsername: entry.actorUsername ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
      ip: entry.ip ?? null,
      userAgent: entry.userAgent ?? null,
      success: entry.success ?? true,
    },
  });
}
