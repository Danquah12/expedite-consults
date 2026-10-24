import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { askStudy } from "@/lib/knowledge-api";
import { readClaim, type MediaRead } from "@/lib/media-literacy";
import type { StudyCard } from "@/lib/knowledge-types";
import { useFeedStore } from "@/lib/feed-store";
import { HumanSeat } from "@/components/learn/HumanSeat";

function Row({ label, body }: { label: string; body: string }) {
  return (
    <section>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</h3>
      <p className="mt-1 text-sm leading-relaxed">{body}</p>
    </section>
  );
}

function Sources({ label, rows }: { label: string; rows: MediaRead["primary"] }) {
  return (
    <section>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</h3>
      {rows.length ? (
        <ul className="mt-1 space-y-1.5">
          {rows.slice(0, 4).map((row) => (
            <li key={`${row.source}-${row.href}`} className="text-sm">
              <a href={row.href} target="_blank" rel="noreferrer" className="font-semibold text-primary underline-offset-2 hover:underline">
                {row.source}
              </a>
              <span className="mt-0.5 block text-xs text-muted">{row.passage.slice(0, 180)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-muted">None retrieved.</p>
      )}
    </section>
  );
}

export function MediaAnalyzeSheet({ open, claim, offered }: { open: boolean; claim: string; offered?: string }) {
  const closeModal = useFeedStore((s) => s.closeModal);
  const [card, setCard] = useState<StudyCard | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!open || !claim.trim()) return;
    let stop = false;
    setChecking(true);
    setCard(null);
    void askStudy({ data: { question: claim.slice(0, 400) } })
      .then((next) => {
        if (!stop) setCard(next);
      })
      .catch(() => {
        if (!stop) setCard(null);
      })
      .finally(() => {
        if (!stop) setChecking(false);
      });
    return () => {
      stop = true;
    };
  }, [open, claim]);

  if (!open) return null;
  const read = readClaim(claim, checking ? null : card, offered);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeModal()}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Analyze</DialogTitle>
          <DialogDescription>Investigate the claim. This does not decide it for you.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Row label="Claim" body={read.claim || "No claim was given."} />
          <Row label="Evidence provided" body={read.offered} />
          {checking ? <p className="text-sm text-muted">Checking the library before anything is called established.</p> : null}
          <Sources label="Primary sources" rows={read.primary} />
          <Sources label="Independent sources" rows={read.independent} />
          <Row label="What is established" body={checking ? "Still checking." : read.established} />
          <Row label="What remains uncertain" body={checking ? "Still checking." : read.uncertain} />
          <Row label="Different interpretations" body={read.interpretations} />
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Original source</h3>
            {read.original ? (
              <a href={read.original.href} target="_blank" rel="noreferrer" className="mt-1 block text-sm font-semibold text-primary">
                {read.original.source}
              </a>
            ) : (
              <p className="mt-1 text-sm text-muted">No original was retrieved. The claim stays unverified.</p>
            )}
          </section>
          <p className="text-[11px] text-muted">{checking ? "Nothing has been guessed." : read.note}</p>
          <HumanSeat />
        </div>
      </DialogContent>
    </Dialog>
  );
}
