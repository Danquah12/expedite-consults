/**
 * SpheraNet Event-Driven Architecture Core Bus
 * Decouples mutations from side-effects (Notifications, Telemetry, Recommendations, Creator Analytics, Audit Logs)
 */

export type DomainEventType =
  | "CONTENT_CREATED"
  | "POST_LIKED"
  | "POST_UNLIKED"
  | "REEL_LIKED"
  | "REEL_WATCHED"
  | "REEL_COMPLETED"
  | "COMMENT_ADDED"
  | "CONTENT_SAVED"
  | "CONTENT_SHARED"
  | "CREATOR_FOLLOWED"
  | "CREATOR_UNFOLLOWED"
  | "CONTENT_VIEWED"
  | "CONTENT_NOT_INTERESTED"
  | "CONTENT_REPORTED"
  | "MODERATION_ACTION_TAKEN";

export type UniversalContentType =
  | "POST"
  | "REEL"
  | "STORY"
  | "BOUNTY"
  | "ARTICLE"
  | "EVENT"
  | "LISTING"
  | "COMMUNITY_POST";

export interface DomainEvent<T = any> {
  id: string;
  type: DomainEventType;
  actorId: string;
  contentType?: UniversalContentType;
  contentId?: string;
  targetAuthorId?: string;
  timestamp: string;
  metadata?: T;
}

export type DomainEventHandler = (event: DomainEvent) => Promise<void> | void;

class DomainEventBus {
  private handlers: Map<DomainEventType, DomainEventHandler[]> = new Map();
  private globalHandlers: DomainEventHandler[] = [];

  subscribe(type: DomainEventType, handler: DomainEventHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
  }

  subscribeAll(handler: DomainEventHandler) {
    this.globalHandlers.push(handler);
  }

  async emit(event: Omit<DomainEvent, "id" | "timestamp"> & { id?: string; timestamp?: string }) {
    const fullEvent: DomainEvent = {
      id: event.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: event.timestamp || new Date().toISOString(),
      ...event,
    };

    // Execute handlers asynchronously without blocking caller
    Promise.resolve().then(async () => {
      // 1. Call global handlers
      for (const handler of this.globalHandlers) {
        try {
          await handler(fullEvent);
        } catch (err) {
          console.error(`[EventBus Global Handler Error] for ${fullEvent.type}:`, err);
        }
      }

      // 2. Call type-specific handlers
      const typeHandlers = this.handlers.get(fullEvent.type) || [];
      for (const handler of typeHandlers) {
        try {
          await handler(fullEvent);
        } catch (err) {
          console.error(`[EventBus Handler Error] for ${fullEvent.type}:`, err);
        }
      }
    });

    return fullEvent;
  }
}

export const eventBus = new DomainEventBus();

export async function emitDomainEvent(
  type: DomainEventType,
  actorId: string,
  data?: {
    contentType?: UniversalContentType;
    contentId?: string;
    targetAuthorId?: string;
    metadata?: any;
  }
) {
  return eventBus.emit({
    type,
    actorId,
    contentType: data?.contentType,
    contentId: data?.contentId,
    targetAuthorId: data?.targetAuthorId,
    metadata: data?.metadata,
  });
}
