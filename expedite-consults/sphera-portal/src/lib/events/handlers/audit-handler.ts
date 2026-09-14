import { DomainEvent, eventBus } from "../index";

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipHash?: string;
  metadata?: any;
  createdAt: string;
}

const auditLogBuffer: AuditLogEntry[] = [];

export function getAuditLogs(): AuditLogEntry[] {
  return auditLogBuffer;
}

export async function handleAuditLogEvent(event: DomainEvent) {
  const sensitiveEvents = [
    "CONTENT_CREATED",
    "CONTENT_REPORTED",
    "MODERATION_ACTION_TAKEN",
  ];

  if (sensitiveEvents.includes(event.type) || event.type.includes("DELETED")) {
    const entry: AuditLogEntry = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      actorId: event.actorId,
      action: event.type,
      resourceType: event.contentType || "POST",
      resourceId: event.contentId || "general",
      metadata: event.metadata,
      createdAt: event.timestamp,
    };
    auditLogBuffer.unshift(entry);
    if (auditLogBuffer.length > 2000) auditLogBuffer.pop();
  }
}

eventBus.subscribeAll(handleAuditLogEvent);
