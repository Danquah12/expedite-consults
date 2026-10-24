import { Send } from "lucide-react";
import type { FeedPost } from "@/lib/feed-data";
import { ME } from "@/lib/current-user";
import { fileClip, actLine, useFeedStore } from "@/lib/feed-store";
import { ClipActions } from "@/components/feed/ClipActions";

export function PostActionBar({ post }: { post: FeedPost }) {
  const openModal = useFeedStore((s) => s.openModal);

  return (
    <div className="border-t border-border">
      <div className="flex items-stretch">
        <span className="hidden shrink-0 items-center px-3 sm:flex">
          <img src={ME.avatarUrl} alt="" className="size-7 rounded-full object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <ClipActions post={post} layout="bar" />
        </div>
        <button
          type="button"
          onClick={() => {
            fileClip(post.id, actLine("send"), `send:${post.id}`);
            openModal({ type: "send", postId: post.id });
          }}
          className="flex min-h-12 items-center gap-1.5 px-3 text-xs font-semibold text-muted hover:bg-elevated"
        >
          <Send className="size-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
}
