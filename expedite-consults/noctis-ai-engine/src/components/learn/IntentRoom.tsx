import { HallDirectory } from "@/components/feed/HallDirectory";
import { IntentRail } from "@/components/feed/IntentRail";
import { PostCard } from "@/components/feed/PostCard";
import { ClipCaption } from "@/components/feed/ClipCaption";
import { INTENT_PAGES } from "@/lib/intent-pages";
import { postsForIntent, type IntentId } from "@/lib/learn";
import { useFeedStore } from "@/lib/feed-store";
import { formatCount } from "@/lib/format";
import type { FeedPost } from "@/lib/feed-data";

export function IntentRoom({ intent }: { intent: IntentId }) {
  const posts = useFeedStore((s) => s.posts);
  const page = INTENT_PAGES[intent];
  const list = postsForIntent(posts, intent);

  return (
    <div className="flex flex-col gap-5">
      <IntentRail />
      <header className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{page.kicker}</p>
        <h1 className="mt-1 font-display text-2xl font-semibold">{page.title}</h1>
        <p className="mt-2 text-sm text-muted">{page.blurb}</p>
      </header>
      {page.layout === "jobs" ? (
        <>
          <HallDirectory />
          <JobsLayout posts={list} />
        </>
      ) : null}
      {page.layout === "rank" ? <RankLayout posts={list} /> : null}
      {page.layout === "gallery" ? <GalleryLayout posts={list} /> : null}
      {page.layout === "lab" || page.layout === "brief" || page.layout === "modules"
        ? list.map((p) => <PostCard key={p.id} post={p} />)
        : null}
    </div>
  );
}

function JobsLayout({ posts }: { posts: FeedPost[] }) {
  const openModal = useFeedStore((s) => s.openModal);
  return (
    <div className="space-y-3">
      {posts.map((p) => (
        <article key={p.id} className="rounded-2xl bg-surface p-4 shadow-border">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{p.teach.stamp}</p>
          <h2 className="mt-1 font-display text-lg font-semibold">{p.author.name}</h2>
          <p className="mt-1 text-sm text-muted">{p.caption}</p>
          <button
            type="button"
            className="mt-3 text-xs font-semibold text-primary"
            onClick={() => openModal({ type: "lesson", postId: p.id })}
          >
            Open the Echo
          </button>
        </article>
      ))}
    </div>
  );
}

function RankLayout({ posts }: { posts: FeedPost[] }) {
  const openModal = useFeedStore((s) => s.openModal);
  return (
    <ol className="space-y-2">
      {posts.map((p, i) => (
        <li key={p.id}>
          <button
            type="button"
            onClick={() => openModal({ type: "lesson", postId: p.id })}
            className="flex w-full items-center gap-3 rounded-2xl bg-surface p-3 text-left shadow-border"
          >
            <span className="font-display text-xl font-semibold text-primary">{i + 1}</span>
            <img src={p.posterUrl ?? p.mediaUrl} alt="" className="size-12 rounded-lg object-cover" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{p.teach.hook}</span>
              <span className="block text-xs text-muted">{formatCount(p.views)} watching</span>
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}

function GalleryLayout({ posts }: { posts: FeedPost[] }) {
  const openModal = useFeedStore((s) => s.openModal);
  return (
    <div className="grid grid-cols-2 gap-2">
      {posts.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => openModal({ type: "lesson", postId: p.id })}
          className="relative overflow-hidden rounded-2xl bg-surface text-left shadow-border"
        >
          <img src={p.posterUrl ?? p.mediaUrl} alt="" className="aspect-square w-full object-cover" />
          <ClipCaption size="tile" kicker={p.teach.stamp} body={p.caption} />
        </button>
      ))}
    </div>
  );
}
