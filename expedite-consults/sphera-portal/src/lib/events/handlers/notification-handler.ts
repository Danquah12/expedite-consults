import { DomainEvent, eventBus } from "../index";
import { db } from "@/lib/db";
import { NotificationType } from "@/generated/client";

export async function handleNotificationEvent(event: DomainEvent) {
  const { type, actorId, contentId, targetAuthorId, metadata } = event;

  // Don't notify self-actions
  if (!targetAuthorId || targetAuthorId === actorId) return;

  try {
    let notifType: NotificationType | null = null;
    let message = "";

    switch (type) {
      case "POST_LIKED":
      case "REEL_LIKED":
        notifType = NotificationType.POST_LIKE;
        message = "liked your post";
        break;
      case "COMMENT_ADDED":
        notifType = NotificationType.POST_COMMENT;
        message = `commented: "${(metadata?.text || "").slice(0, 40)}"`;
        break;
      case "CREATOR_FOLLOWED":
        notifType = NotificationType.FOLLOW;
        message = "started following you";
        break;
      case "CONTENT_SAVED":
        notifType = NotificationType.POST_SHARE;
        message = "saved your post to their Sovereign Vault";
        break;
      default:
        break;
    }

    if (notifType) {
      await db.notification.create({
        data: {
          userId: targetAuthorId,
          actorId,
          type: notifType,
          entityId: contentId,
          entityType: event.contentType || "POST",
          message,
        },
      }).catch((err) => {
        console.warn("[Notification Handler] DB Notice:", err.message || err);
      });
    }
  } catch (err) {
    console.warn("[Notification Handler Error]:", err);
  }
}

// Register notification handler
eventBus.subscribe("POST_LIKED", handleNotificationEvent);
eventBus.subscribe("REEL_LIKED", handleNotificationEvent);
eventBus.subscribe("COMMENT_ADDED", handleNotificationEvent);
eventBus.subscribe("CREATOR_FOLLOWED", handleNotificationEvent);
eventBus.subscribe("CONTENT_SAVED", handleNotificationEvent);
