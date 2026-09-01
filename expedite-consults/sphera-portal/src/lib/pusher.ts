import Pusher from "pusher";
import PusherClient from "pusher-js";

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || "dummy_app_id",
  key: process.env.PUSHER_APP_KEY || "dummy_app_key",
  secret: process.env.PUSHER_APP_SECRET || "dummy_app_secret",
  cluster: process.env.PUSHER_CLUSTER || "mt1",
  useTLS: true,
});

// Client-side Pusher singleton
let pusherClientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (typeof window === "undefined") {
    throw new Error("getPusherClient must be called on the client side");
  }

  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_APP_KEY || "dummy_client_key",
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1",
      }
    );
  }

  return pusherClientInstance;
}

// Channel naming helpers — consistent naming prevents typos
export const pusherChannels = {
  userNotifications: (userId: string) => `private-user-${userId}`,
  postUpdates: (postId: string) => `post-${postId}`,
  conversation: (conversationId: string) => `conversation-${conversationId}`,
  userPresence: (userId: string) => `presence-user-${userId}`,
};

export const pusherEvents = {
  newNotification: "new-notification",
  likeUpdate: "like-update",
  commentAdded: "comment-added",
  newMessage: "new-message",
  messageReaction: "message-reaction",
  messageRead: "message-read",
  userTyping: "user-typing",
};
