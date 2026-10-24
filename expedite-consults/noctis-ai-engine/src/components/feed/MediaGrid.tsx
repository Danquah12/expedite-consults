import type { FeedPost } from "@/lib/feed-data";
import { useFeedStore } from "@/lib/feed-store";
import { ClipCaption } from "@/components/feed/ClipCaption";
import { StudyThisButton } from "@/components/feed/StudyThisButton";

export function MediaGrid({ posts }: { posts: FeedPost[] }) {
  const openReel = useFeedStore((s) => s.openReel);
  const toggleFlip = useFeedStore((s) => s.toggleFlip);

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {posts.map((post) => {
        const src = post.posterUrl ?? post.mediaUrl;
        return (
          <button
            key={post.id}
            type="button"
            onClick={() => {
              if (post.mediaType === "video" || post.mediaType === "audio") openReel(post.id);
              else toggleFlip(post.id);
            }}
            className="clip-plate relative aspect-square overflow-hidden bg-elevated" data-plate="tile"
          >
            {post.mediaType !== "image" && src ? (
              <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
            ) : post.mediaType === "image" ? (
              <img src={post.mediaUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <span className="grid h-full place-items-center px-2 text-[10px] text-muted">{post.teach.stamp}</span>
            )}
            <ClipCaption size="tile" kicker={post.mediaType === "video" ? "Play" : post.teach.stamp} body={post.caption} />
            <StudyThisButton postId={post.id} quiet className="absolute bottom-1 right-1 z-10 min-h-7 bg-bg/85 px-2 text-[10px] text-fg" />
          </button>
        );
      })}
    </div>
  );
}
