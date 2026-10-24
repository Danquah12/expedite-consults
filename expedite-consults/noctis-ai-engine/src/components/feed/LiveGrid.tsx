import { useFeedStore } from "@/lib/feed-store";
import { liveViewers, remainingSec, useCampusBeat } from "@/lib/campus-live";
import { formatClock, formatCount } from "@/lib/format";

export function LiveGrid() {
  const liveStreams = useFeedStore((s) => s.liveStreams);
  const openModal = useFeedStore((s) => s.openModal);
  const { t } = useCampusBeat(1000);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
      {liveStreams.map((stream, i) => (
        <button
          key={stream.id}
          type="button"
          onClick={() => openModal({ type: "live", streamId: stream.id })}
          className="overflow-hidden rounded-3xl bg-surface p-1.5 text-left shadow-border"
        >
          <span className="clip-plate relative block aspect-video" data-plate="tile">
            <img src={stream.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <span className="live-pulse absolute left-2 top-2 rounded-md bg-live px-1.5 py-0.5 font-mono text-[9px] font-bold text-primary-fg">
              DROP
            </span>
            <span className="absolute inset-x-2 bottom-2">
              <span className="clip-type block line-clamp-2 text-sm font-semibold leading-snug [text-wrap:balance]">{stream.title}</span>
              <span className="clip-meta mt-0.5 block text-[11px]">
                {stream.name} · {formatClock(remainingSec(stream.endsInMin, t, i))} · {formatCount(liveViewers(stream.viewers, t, i))}
              </span>
            </span>
          </span>
          <span className="block p-3">
            <span className="mt-0.5 block truncate text-xs text-muted">{stream.category}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
