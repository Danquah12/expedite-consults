import { DomainEvent, eventBus, UniversalContentType } from "../index";

export type InteractionType =
  | "VIEW"
  | "LIKE"
  | "COMMENT"
  | "SHARE"
  | "SAVE"
  | "CLICK"
  | "FOLLOW_CREATOR"
  | "NOT_INTERESTED"
  | "REPORT"
  | "COMPLETE"
  | "REWATCH";

export interface ContentInteractionRecord {
  id: string;
  userId: string;
  contentType: UniversalContentType;
  contentId: string;
  interactionType: InteractionType;
  durationMs?: number;
  completionRate?: number;
  metadata?: any;
  createdAt: string;
}

// In-memory interaction buffer with periodic database / analytical log sync
const interactionBuffer: ContentInteractionRecord[] = [];

export function getInteractionRecords(userId?: string): ContentInteractionRecord[] {
  if (userId) {
    return interactionBuffer.filter((i) => i.userId === userId);
  }
  return interactionBuffer;
}

export async function handleTelemetryEvent(event: DomainEvent) {
  if (!event.contentId) return;

  let interactionType: InteractionType | null = null;
  switch (event.type) {
    case "CONTENT_VIEWED":
      interactionType = "VIEW";
      break;
    case "POST_LIKED":
    case "REEL_LIKED":
      interactionType = "LIKE";
      break;
    case "COMMENT_ADDED":
      interactionType = "COMMENT";
      break;
    case "CONTENT_SAVED":
      interactionType = "SAVE";
      break;
    case "CONTENT_SHARED":
      interactionType = "SHARE";
      break;
    case "CREATOR_FOLLOWED":
      interactionType = "FOLLOW_CREATOR";
      break;
    case "REEL_COMPLETED":
      interactionType = "COMPLETE";
      break;
    case "REEL_WATCHED":
      interactionType = (event.metadata?.completionRate || 0) >= 0.95 ? "COMPLETE" : "VIEW";
      break;
    case "CONTENT_NOT_INTERESTED":
      interactionType = "NOT_INTERESTED";
      break;
    case "CONTENT_REPORTED":
      interactionType = "REPORT";
      break;
    default:
      break;
  }

  if (interactionType) {
    const record: ContentInteractionRecord = {
      id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: event.actorId,
      contentType: event.contentType || "POST",
      contentId: event.contentId,
      interactionType,
      durationMs: event.metadata?.durationMs || 0,
      completionRate: event.metadata?.completionRate,
      metadata: event.metadata,
      createdAt: event.timestamp,
    };

    interactionBuffer.unshift(record);
    if (interactionBuffer.length > 5000) interactionBuffer.pop();
  }
}

// Register telemetry for all relevant domain events
eventBus.subscribeAll(handleTelemetryEvent);
