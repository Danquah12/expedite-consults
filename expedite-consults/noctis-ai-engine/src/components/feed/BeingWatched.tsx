import { useFeedStore } from "@/lib/feed-store";
import { youtubeIdOf } from "@/lib/youtube";
import { formatCount } from "@/lib/format";
import { shuffleWith } from "@/lib/shuffle";
import { scrollToFeed } from "@/lib/syndicate";
import { cn } from "@/lib/utils";

export function BeingWatched({ bare }: { bare?: boolean }) {
  const posts = useFeedStore((s) => s.posts);
  const deckSeed = useFeedStore((s) => s.deckSeed);
  const watched = shuffleWith(
    posts.filter((p) => youtubeIdOf(p)),
    deckSeed + 71,
  ).slice(0, 6);

  if (!watched.length) return null;

  return (
    <section>
      {bare ? null : (
        <div className="flex items-baseline justify-between px-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Being watched</p>
          <p className="text-[11px] text-subtle">{watched.length} clips</p>
        </div>
      )}
      <div className={cn("hall-scroll flex gap-3 pb-1", !bare && "mt-2")}>
        {watched.map((post) => (
          <button
            key={post.id}
            type="button"
            onClick={() => {
              const st = useFeedStore.getState();
              if (st.pipId && st.pipId !== post.id) st.closePip();
              st.setPlayingId(post.id);
              scrollToFeed(post.id);
            }}
            className="w-44 shrink-0 text-left"
          >
            <span className="clip-plate relative block aspect-video overflow-hidden rounded-xl bg-elevated" data-plate="tile">
              <img src={post.posterUrl} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
              <span className="absolute left-2 top-2 rounded-md bg-bg/75 px-1.5 py-0.5 font-mono text-[10px] text-caption backdrop-blur-sm">
                {formatCount(post.views)}
              </span>
            </span>
            <span className="mt-1.5 block truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              {post.teach.stamp}
            </span>
            <span className="mt-0.5 line-clamp-1 block text-sm font-semibold leading-snug">{post.teach.hook}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
