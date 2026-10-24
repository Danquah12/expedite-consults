import { memo } from "react";
import { Bookmark, BadgeCheck, Volume2, VolumeX } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { FeedComment, FeedPost } from "@/lib/feed-data";
import { personByUsername } from "@/lib/directory";
import { ME } from "@/lib/current-user";
import { useFeedStore } from "@/lib/feed-store";
import { DrillQuiz } from "@/components/learn/DrillQuiz";
import { eduMark, VERIFY_LABEL } from "@/lib/edu-meta";
import { FeedMediaCard } from "@/components/feed/FeedMediaCard";
import { PostActionBar } from "@/components/feed/PostActionBar";
import { PostDiscoverBridgeBar } from "@/components/discover/DiscoverDesk";
import { EchoText } from "@/components/feed/EchoField";
import { withSourceLinks } from "@/components/feed/EndHold";
import { englishHear } from "@/lib/english-hear";
import { wakeSound } from "@/lib/playback";
import { cn } from "@/lib/utils";

const NO_COMMENTS: FeedComment[] = [];

function RecentComments({ postId, seeded }: { postId: string; seeded: FeedComment[] }) {
  const extra = useFeedStore((s) => s.engage[postId]?.comments) ?? NO_COMMENTS;
  const list = [...seeded, ...extra].slice(-3);
  if (!list.length) return null;
  return (
    <div className="mt-3 space-y-2 border-t border-border pt-3">
      {list.map((c) => (
        <div key={c.id} className="flex gap-2">
          <img src={c.avatar} alt="" className="size-6 rounded-full object-cover" />
          <p className="min-w-0 text-xs">
            <span className="font-semibold">{c.name} </span>
            <span className="text-muted">
              <EchoText text={c.text} />
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}

export const PostCard = memo(function PostCard({ post }: { post: FeedPost }) {
  const savedOn = useFeedStore((s) => s.engage[post.id]?.saved ?? post.isSaved);
  const toggleFollow = useFeedStore((s) => s.toggleFollow);
  const toggleFlip = useFeedStore((s) => s.toggleFlip);
  const flipped = useFeedStore((s) => s.flipped[post.id]);
  const passed = useFeedStore((s) => s.drillPassed[post.id]);
  const person = personByUsername(post.author.username);
  const mark = eduMark(post);
  const hear = englishHear(post);
  const isMuted = useFeedStore((s) => s.isMuted);
  const audible = post.mediaType === "video" || post.mediaType === "audio";
  const film = post.mediaType === "video" || Boolean(post.youtubeId);

  if (!post.author || !post.teach) return null;
  if (film) {
    return (
      <article id={`post-${post.id}`} className="clinic-stage">
        <div className="flex flex-col items-stretch gap-4">
          <div className="mx-auto min-w-0 w-full max-w-[46rem]">
            <header className="mb-2 flex items-center justify-between gap-2 px-1">
              <Link to="/u/$username" params={{ username: post.author.username }} className="flex min-w-0 items-center gap-2">
                <img src={post.author.avatar} alt="" className="size-8 rounded-full object-cover" loading="lazy" decoding="async" />
                <span className="min-w-0">
                  <span className="flex items-center gap-1">
                    <span className="block truncate text-sm font-semibold">{post.author.name}</span>
                    {person?.verified ? <BadgeCheck className="size-3.5 shrink-0 text-primary" /> : null}
                  </span>
                  <span className="block truncate text-[11px] text-muted">{post.teach.stamp}</span>
                </span>
              </Link>
              <span className="flex items-center gap-1">
                {audible ? (
                  <button
                    type="button"
                    onClick={() => {
                      useFeedStore.getState().toggleMute(post.id);
                      wakeSound();
                    }}
                    aria-label={isMuted ? "Sound off" : "Sound on"}
                    className="grid size-8 place-items-center rounded-full text-fg"
                  >
                    {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                  </button>
                ) : null}
                <button type="button" onClick={() => useFeedStore.getState().toggleSave(post.id)} aria-label="Save">
                  <Bookmark className={cn("size-4", savedOn && "fill-primary text-primary")} />
                </button>
                {post.author.username !== ME.username ? (
                  <button type="button" onClick={() => toggleFollow(post.author.username)} className="text-xs font-semibold text-primary">
                    {post.isFollowing ? "Following" : "Follow"}
                  </button>
                ) : null}
              </span>
            </header>
            <FeedMediaCard post={post} />
            <PostActionBar post={post} />
          </div>
          <aside data-read className="mx-auto w-full max-w-[46rem]">
            {hear ? (
              <p className="mt-3 rounded-2xl bg-elevated px-3 py-2 text-sm leading-relaxed">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">In English · {hear.tongue}</span>
                {hear.line}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => toggleFlip(post.id)}
              className="mt-3 w-full rounded-full bg-primary py-2 text-xs font-semibold text-primary-fg"
            >
              {passed ? "Stamp earned" : flipped ? "Hide quiz" : "Test your understanding"}
            </button>
            {flipped ? (
              <div className="mt-3">
                <DrillQuiz post={post} />
              </div>
            ) : null}
            <PostDiscoverBridgeBar post={post} />
            <RecentComments postId={post.id} seeded={post.commentsList ?? []} />
          </aside>
        </div>
      </article>
    );
  }

  return (
    <article id={`post-${post.id}`} className="overflow-hidden rounded-none bg-surface shadow-border sm:rounded-3xl">
      <header className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
        <Link to="/u/$username" params={{ username: post.author.username }} className="flex min-w-0 items-center gap-2.5">
          <img src={post.author.avatar} alt="" className="size-9 rounded-full object-cover" loading="lazy" decoding="async" />
          <span className="min-w-0">
            <span className="flex items-center gap-1">
              <span className="block truncate text-sm font-semibold">{post.author.name}</span>
              {person?.verified ? <BadgeCheck className="size-3.5 shrink-0 text-primary" /> : null}
            </span>
            <span className="block text-[11px] uppercase tracking-wider text-primary">
              {VERIFY_LABEL[mark.verify]} · {mark.kind}
            </span>
          </span>
        </Link>
        <span className="flex items-center gap-2">
          {audible ? (
            <button
              type="button"
              onClick={() => {
                useFeedStore.getState().toggleMute(post.id);
                wakeSound();
              }}
              aria-label={isMuted ? "Sound off" : "Sound on"}
              className="grid size-9 place-items-center rounded-full text-fg"
            >
              {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
          ) : null}
          <button type="button" onClick={() => useFeedStore.getState().toggleSave(post.id)} aria-label="Save">
            <Bookmark className={cn("size-4", savedOn && "fill-primary text-primary")} />
          </button>
          {post.author.username !== ME.username ? (
            <button
              type="button"
              onClick={() => toggleFollow(post.author.username)}
              className="text-xs font-semibold text-primary"
            >
              {post.isFollowing ? "Following" : "Follow"}
            </button>
          ) : null}
        </span>
      </header>

      <FeedMediaCard post={post} />
      <PostActionBar post={post} />

      <div className="px-3 py-3 sm:px-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">{post.teach.stamp}</p>
        <p className="mt-1 text-sm leading-relaxed">{withSourceLinks(post.caption)}</p>
        {hear ? (
          <p className="mt-2 rounded-xl bg-elevated px-3 py-2 text-sm leading-relaxed">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">In English · {hear.tongue}</span>
            {hear.line}
          </p>
        ) : null}
        {post.hashtags.length ? (
          <p className="mt-1 text-xs font-semibold text-primary">{post.hashtags.join(" ")}</p>
        ) : null}
        <button
          type="button"
          onClick={() => toggleFlip(post.id)}
          className="mt-3 w-full rounded-full bg-primary py-2 text-xs font-semibold text-primary-fg"
        >
          {passed ? "Stamp earned" : flipped ? "Hide quiz" : "Test your understanding"}
        </button>
        {flipped ? (
          <div className="mt-3">
            <DrillQuiz post={post} />
          </div>
        ) : null}
        <PostDiscoverBridgeBar post={post} />
        <RecentComments postId={post.id} seeded={post.commentsList ?? []} />
      </div>
    </article>
  );
});
