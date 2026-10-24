import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { liveViewers, remainingSec, useCampusBeat } from "@/lib/campus-live";
import { formatClock, formatCount } from "@/lib/format";
import { ClipCaption } from "@/components/feed/ClipCaption";
import { useFeedStore } from "@/lib/feed-store";

export function LiveBroadcastModal({ open, streamId }: { open: boolean; streamId: string }) {
  const liveStreams = useFeedStore((s) => s.liveStreams);
  const closeModal = useFeedStore((s) => s.closeModal);
  const stream = liveStreams.find((s) => s.id === streamId);
  const { t } = useCampusBeat(1000);
  const idx = Math.max(0, liveStreams.findIndex((s) => s.id === streamId));

  if (!stream) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeModal()}>
      <DialogContent className="w-[min(92vw,560px)] overflow-hidden p-0">
        <div className="relative aspect-video bg-bg">
          <img src={stream.thumbnail} alt="" className="h-full w-full object-cover" />
          <span className="live-pulse absolute left-3 top-3 rounded-md bg-live px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary-fg">
            DROP
          </span>
          <span className="absolute right-3 top-3 rounded-md bg-bg/70 px-2 py-0.5 font-mono text-[11px]">
            {formatCount(liveViewers(stream.viewers, t, idx))}
          </span>
          <ClipCaption
            kicker="Drop"
            body={stream.title}
            meta={`${stream.name} · ${formatClock(remainingSec(stream.endsInMin, t, idx))} · ${formatCount(liveViewers(stream.viewers, t, idx))}`}
          />
        </div>
        <div className="p-5">
          <DialogHeader>
            <DialogTitle>{stream.title}</DialogTitle>
            <DialogDescription>
              {stream.name} · {stream.category}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted">
            Drop is open. Bring a question, pass the Echo after, take the stamp.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
