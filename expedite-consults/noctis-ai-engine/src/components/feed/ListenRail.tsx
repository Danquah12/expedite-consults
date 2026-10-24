import { MUSIC_POSTS, MUSIC_ROOMS } from "@/lib/music-feed";
import { useFeedStore } from "@/lib/feed-store";
import { formatCount } from "@/lib/format";
import { shuffleWith } from "@/lib/shuffle";
import { scrollToFeed } from "@/lib/syndicate";

export function ListenRail({ bare }: { bare?: boolean }) {
  const boostLane = useFeedStore((s) => s.boostLane);
  const deckSeed = useFeedStore((s) => s.deckSeed);
  const clips = shuffleWith(MUSIC_POSTS, deckSeed + 89).slice(0, 6);

  function open(id: string) {
    boostLane("laugh");
    const st = useFeedStore.getState();
    if (st.pipId && st.pipId !== id) st.closePip();
    st.setPlayingId(id);
    scrollToFeed(id);
  }

  return (
    <section>
      {bare ? null : (
        <div className="flex items-baseline justify-between px-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Listen</p>
          <p className="text-[11px] text-subtle">Music, then a clinic</p>
        </div>
      )}
      <div className={bare ? "flex gap-2 overflow-x-auto pb-1 scrollbar-none" : "mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-none"}>
        {MUSIC_ROOMS.map((room) => (
          <button
            key={room.id}
            type="button"
            onClick={() => open(room.posts[0])}
            className="shrink-0 rounded-full bg-elevated px-3 py-1.5 text-xs font-semibold text-muted hover:text-fg"
          >
            {room.label}
          </button>
        ))}
      </div>
      <div className="hall-scroll mt-2 flex gap-3 pb-1">
        {clips.map((post) => (
          <button key={post.id} type="button" onClick={() => open(post.id)} className="w-44 shrink-0 text-left">
            <span className="clip-plate relative block aspect-video overflow-hidden rounded-xl bg-elevated" data-plate="tile">
              <img src={post.posterUrl} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
              <span className="absolute left-2 top-2 rounded-md bg-bg/75 px-1.5 py-0.5 font-mono text-[10px] text-caption backdrop-blur-sm">
                {formatCount(post.views)}
              </span>
            </span>
            <span className="mt-1.5 block truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              {post.musicTitle}
            </span>
            <span className="mt-0.5 line-clamp-1 block text-sm font-semibold leading-snug">{post.teach.hook}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
