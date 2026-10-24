import { toast } from "sonner";
import { Heart, MessageCircle, Repeat2, GraduationCap, Lightbulb } from "lucide-react";
import type { FeedPost } from "@/lib/feed-data";
import { useFeedStore } from "@/lib/feed-store";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ClipActions({ post, layout }: { post: FeedPost; layout: "bar" | "rail" | "row" }) {
  const mark = useFeedStore((s) => s.engage[post.id]);
  const liked = mark?.liked ?? post.isLiked;
  const likes = post.likes + (mark?.likeDelta ?? 0);
  const comments = post.comments + (mark?.comments?.length ?? 0);
  const shares = post.shares + (mark?.shareDelta ?? 0);
  const reposted = mark?.reposted ?? Boolean(post.isReposted);
  const toggleLike = useFeedStore((s) => s.toggleLike);
  const toggleRepost = useFeedStore((s) => s.toggleRepost);
  const openModal = useFeedStore((s) => s.openModal);

  function like(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    const was = liked;
    toggleLike(post.id, { x: e.clientX, y: e.clientY }, layout === "rail" ? "Liked this reel" : undefined);
    toast.success(was ? "Like removed" : "Liked");
  }

  function comment(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    openModal({ type: "comments", postId: post.id });
  }

  function repost(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!reposted) toggleRepost(post.id, layout === "rail" ? "Reposted this reel" : undefined);
    toast.success(reposted ? "Share this repost" : "Reposted");
    openModal({ type: "send", postId: post.id });
  }

  function study(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    openModal({ type: "video", postId: post.id, title: post.teach.hook, caption: post.caption, youtubeId: post.youtubeId });
  }

  function meaning(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    openModal({ type: "meaning", postId: post.id });
  }

  if (layout === "rail") {
    return (
      <>
        <Rail label="Like" count={likes} active={liked} onClick={like}>
          <Heart className={cn("size-6", liked && "fill-current")} />
        </Rail>
        <Rail label="Comment" count={comments} onClick={comment}>
          <MessageCircle className="size-6" />
        </Rail>
        <Rail label="Repost" count={shares} active={reposted} onClick={repost}>
          <Repeat2 className="size-6" />
        </Rail>
        <Rail label="Study" onClick={study}>
          <GraduationCap className="size-6" />
        </Rail>
        <Rail label="Meaning" onClick={meaning}>
          <Lightbulb className="size-6" />
        </Rail>
      </>
    );
  }

  if (layout === "row") {
    return (
      <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-muted">
        <TextAct label="Like" count={likes} active={liked} onClick={like} />
        <TextAct label="Comment" count={comments} onClick={comment} />
        <TextAct label="Repost" count={shares} active={reposted} onClick={repost} />
        <TextAct label="Study" onClick={study} />
        <TextAct label="Meaning" onClick={meaning} />
      </div>
    );
  }

  return (
    <div className="flex items-stretch border-t border-border">
      <Bar label="Like" count={likes} active={liked} onClick={like}>
        <Heart className={cn("size-4", liked && "fill-current")} />
      </Bar>
      <Bar label="Comment" count={comments} onClick={comment}>
        <MessageCircle className="size-4" />
      </Bar>
      <Bar label="Repost" count={shares} active={reposted} onClick={repost}>
        <Repeat2 className="size-4" />
      </Bar>
      <Bar label="Study" onClick={study}>
        <GraduationCap className="size-4" />
      </Bar>
      <Bar label="Meaning" onClick={meaning}>
        <Lightbulb className="size-4" />
      </Bar>
    </div>
  );
}

function Rail({
  label,
  count,
  active,
  onClick,
  children,
}: {
  label: string;
  count?: number;
  active?: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className={cn("clip-type relative z-10 text-xs font-semibold touch-manipulation", active && "text-primary")}>
      <span className="mx-auto grid size-11 place-items-center">{children}</span>
      {count != null ? <span className="mt-0.5 block font-mono text-[11px]">{formatCount(count)}</span> : <span className="mt-0.5 block text-[10px]">{label}</span>}
    </button>
  );
}

function Bar({
  label,
  count,
  active,
  onClick,
  children,
}: {
  label: string;
  count?: number;
  active?: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex min-h-12 flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold text-muted hover:bg-elevated",
        active && "text-primary",
      )}
    >
      {children}
      <span className="clip-act-label">{label}</span>
      {count != null ? <span className="font-mono text-[11px]">{formatCount(count)}</span> : null}
    </button>
  );
}

function TextAct({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active?: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button type="button" onClick={onClick} className={cn(active && "text-primary")}>
      {label}
      {count != null ? ` ${formatCount(count)}` : ""}
    </button>
  );
}
