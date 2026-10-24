import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { THINK_STEPS, readThink, writeThink, type ThinkId } from "@/lib/thinking-coach";
import { useFeedStore } from "@/lib/feed-store";
import { HumanSeat } from "@/components/learn/HumanSeat";

export function ThinkingCoachSheet({ open, claim }: { open: boolean; claim: string }) {
  const closeModal = useFeedStore((s) => s.closeModal);
  const [notes, setNotes] = useState<Partial<Record<ThinkId, string>>>({});

  useEffect(() => {
    if (!open) return;
    setNotes(readThink(claim));
  }, [open, claim]);

  function setLine(id: ThinkId, value: string) {
    const next = { ...notes, [id]: value };
    setNotes(next);
    writeThink(claim, next);
  }

  const done = THINK_STEPS.every((step) => (notes[step.id] ?? "").trim().length > 0);
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeModal()}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thinking coach</DialogTitle>
          <DialogDescription>Let’s examine it. The coach asks. You reason. It does not supply the conclusion.</DialogDescription>
        </DialogHeader>
        <p className="rounded-xl bg-elevated px-3 py-2 text-sm leading-relaxed">{claim || "No argument was given."}</p>
        <ol className="mt-3 space-y-3">
          {THINK_STEPS.map((step, index) => (
            <li key={step.id}>
              <label className="text-sm font-semibold" htmlFor={`think-${step.id}`}>
                {index + 1}. {step.ask}
              </label>
              <textarea
                id={`think-${step.id}`}
                value={notes[step.id] ?? ""}
                onChange={(event) => setLine(step.id, event.target.value)}
                className="mt-1 min-h-16 w-full rounded-xl bg-elevated px-3 py-2 text-sm outline-none"
              />
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-muted">
          {done
            ? "You walked the argument. The coach did not decide whether it is convincing."
            : "Leave a line blank if you do not know yet. Missing information is part of the work."}
        </p>
        <HumanSeat />
      </DialogContent>
    </Dialog>
  );
}
