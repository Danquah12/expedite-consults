import { Camera, Clapperboard, PenLine } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFeedStore } from "@/lib/feed-store";

const ACTS = [
  { id: "recorder", label: "On air", blurb: "News, lesson, pulpit, screen share, teleprompter.", icon: Camera },
  { id: "composer", label: "Write", blurb: "A post, a question, an Echo.", icon: PenLine },
  { id: "story", label: "Story", blurb: "A short plate for the tray.", icon: Clapperboard },
] as const;

export function CreateDesk({ open }: { open: boolean }) {
  const closeModal = useFeedStore((s) => s.closeModal);
  const openModal = useFeedStore((s) => s.openModal);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeModal()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create</DialogTitle>
          <DialogDescription>Pick a desk. The plate stays the same.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {ACTS.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                type="button"
                onClick={() => openModal({ type: act.id === "composer" ? "composer" : "recorder" })}
                className="flex min-h-14 items-center gap-3 rounded-2xl bg-elevated px-3 py-3 text-left"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-surface text-primary">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{act.label}</span>
                  <span className="block text-xs text-muted">{act.blurb}</span>
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
