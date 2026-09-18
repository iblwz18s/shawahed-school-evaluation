import { prisma } from './db';

interface RecordAuditParams {
  userId?: string | null;
  userName?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export async function recordAuditLog({
  userId,
  userName,
  action,
  entityType,
  entityId,
  metadata,
}: RecordAuditParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: userId || null,
        userName: userName || null,
        action,
        entityType,
        entityId: entityId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error('فشل في تسجيل سجل التدقيق:', error);
  }
}
