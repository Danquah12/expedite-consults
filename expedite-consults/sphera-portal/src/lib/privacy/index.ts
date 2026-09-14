import { Visibility } from "@/generated/client";
import { db } from "@/lib/db";

export async function canUserViewContent(
  viewerId: string | null,
  authorId: string,
  visibility: Visibility
): Promise<boolean> {
  // Public content is visible to everyone
  if (visibility === Visibility.PUBLIC) return true;

  // Anonymous viewer cannot see non-public content
  if (!viewerId) return false;

  // Author can always see their own content
  if (viewerId === authorId) return true;

  // Private content is only visible to the author
  if (visibility === Visibility.PRIVATE) return false;

  // Friends-only content requires accepted friendship
  if (visibility === Visibility.FRIENDS) {
    const friendship = await db.friendship.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { senderId: viewerId, receiverId: authorId },
          { senderId: authorId, receiverId: viewerId },
        ],
      },
    }).catch(() => null);

    return !!friendship;
  }

  return true;
}
