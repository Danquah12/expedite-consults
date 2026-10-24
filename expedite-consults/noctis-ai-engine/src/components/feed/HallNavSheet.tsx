import { Link } from "@tanstack/react-router";
import { Phone, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HALL_AREAS } from "@/lib/hall-nav";
import { useFeedStore } from "@/lib/feed-store";
import { ThemePicker } from "@/components/layout/ThemePicker";

export function HallNavSheet({ open }: { open: boolean }) {
  const closeModal = useFeedStore((s) => s.closeModal);
  const openModal = useFeedStore((s) => s.openModal);
  const enterReels = useFeedStore((s) => s.enterReels);
  const openClinic = useFeedStore((s) => s.openClinic);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeModal()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Noctis</DialogTitle>
          <DialogDescription>Home is the journey. Vibe is the intelligence. Discover, Learn, and Work sit around them.</DialogDescription>
        </DialogHeader>
        <section className="rounded-2xl bg-elevated px-3 py-3">
          <ThemePicker />
        </section>
        <Link
          to="/calls"
          onClick={() => closeModal()}
          className="mt-2 flex min-h-12 w-full items-center gap-3 rounded-2xl bg-elevated px-3 py-2 text-left"
        >
          <Phone className="size-4 text-primary" />
          <span className="min-w-0">
            <span className="block text-sm font-semibold">Chat</span>
            <span className="block text-xs text-muted">Message a group, or call them in the app or on the phone</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => openModal({ type: "settings" })}
          className="mt-2 flex min-h-12 w-full items-center gap-3 rounded-2xl bg-elevated px-3 py-2 text-left"
        >
          <Settings className="size-4 text-primary" />
          <span className="min-w-0">
            <span className="block text-sm font-semibold">Settings</span>
            <span className="block text-xs text-muted">Sound, goal, and the full theme list</span>
          </span>
        </button>
        <nav className="mt-3 grid gap-1.5" aria-label="Hall pages">
          {HALL_AREAS.map((area) => (
            <div key={area.id}>
              <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-subtle">{area.label}</p>
              {area.tabs.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    hash={item.hash ?? (item.to === "/" ? "feed" : "")}
                    onClick={() => {
                      if (item.to === "/") openClinic();
                      if (item.to === "/reels") enterReels();
                      closeModal();
                    }}
                    className="flex min-h-12 items-center gap-3 rounded-2xl px-3 py-2 hover:bg-elevated"
                  >
                    <Icon className="size-4 text-primary" />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="block text-xs text-muted">{item.blurb}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </DialogContent>
    </Dialog>
  );
}
