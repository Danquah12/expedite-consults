import { db } from "@/lib/db";
import { ReportReason, ReportStatus } from "@/generated/client";
import { emitDomainEvent } from "@/lib/events";

export interface ModerationCase {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: string;
  reason: ReportReason;
  details?: string;
  status: ReportStatus;
  actionTaken?: string;
  createdAt: string;
}

const moderationCases: ModerationCase[] = [];

export async function fileReport(data: {
  reporterId: string;
  targetId: string;
  targetType?: string;
  reason: ReportReason;
  details?: string;
}): Promise<ModerationCase> {
  const newCase: ModerationCase = {
    id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    reporterId: data.reporterId,
    targetId: data.targetId,
    targetType: data.targetType || "POST",
    reason: data.reason,
    details: data.details,
    status: ReportStatus.PENDING,
    createdAt: new Date().toISOString(),
  };

  moderationCases.unshift(newCase);

  // Emit domain event for audit and screening
  await emitDomainEvent("CONTENT_REPORTED", data.reporterId, {
    contentId: data.targetId,
    contentType: "POST",
    metadata: { reason: data.reason, details: data.details },
  });

  // Also write to DB report table if available
  try {
    await db.report.create({
      data: {
        reporterId: data.reporterId,
        entityId: data.targetId,
        entityType: data.targetType || "POST",
        reason: data.reason,
        details: data.details,
        status: ReportStatus.PENDING,
      },
    }).catch(() => {});
  } catch {}

  return newCase;
}

export async function softDeleteContent(
  targetId: string,
  deletedById: string,
  reason: string = "User requested deletion"
) {
  try {
    await db.post.update({
      where: { id: targetId },
      data: {
        deletedAt: new Date(),
      },
    }).catch(() => {});

    await emitDomainEvent("MODERATION_ACTION_TAKEN", deletedById, {
      contentId: targetId,
      metadata: { action: "SOFT_DELETE", reason },
    });

    return { success: true, targetId, deletedAt: new Date().toISOString() };
  } catch (error) {
    console.error("[softDeleteContent Error]:", error);
    return { success: false, error };
  }
}
