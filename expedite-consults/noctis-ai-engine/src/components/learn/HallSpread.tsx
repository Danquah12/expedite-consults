import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
import { CLINIC_DESKS, type ClinicDeskId } from "@/lib/ingest-sources";
import { desksInWing, hallsOn, wingOf, wingsOn, type HallTabId, type HallWingId } from "@/lib/hall-surfaces";
import { useFeedStore } from "@/lib/feed-store";
import { favoriteDesk } from "@/lib/shuffle";
import { writeReelCat, type ReelCat } from "@/lib/reel-cats";
import { cn } from "@/lib/utils";

function deskLabel(id: ClinicDeskId) {
  return CLINIC_DESKS.find((d) => d.id === id)?.label ?? id;
}

export function HallSpread({
  tab,
  active,
  onPick,
}: {
  tab: HallTabId;
  active?: string;
  onPick?: (id: ClinicDeskId) => void;
}) {
  const halls = hallsOn(tab);
  const setClinicDesk = useFeedStore((s) => s.setClinicDesk);
  const clinicDesk = useFeedStore((s) => s.clinicDesk);
  const setHall = useFeedStore((s) => s.setHall);
  const setTicket = useFeedStore((s) => s.setTicket);
  const toggleCrew = useFeedStore((s) => s.toggleCrew);
  const router = useRouter();
  const current = (active ?? (halls.some((h) => h.id === clinicDesk) ? clinicDesk : undefined)) as ClinicDeskId | "all" | undefined;
  const [openWing, setOpenWing] = useState<HallWingId>("all");
  const [menu, setMenu] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const shownWing = current && current !== "all" ? wingOf(current) : openWing;
  const desks = desksInWing(shownWing, tab);
  const wings = wingsOn(tab);
  const activeWing = wings.find((w) => w.id === shownWing) ?? wings[0];

  useEffect(() => {
    if (!menu) return;
    function hide(ev: PointerEvent) {
      if (!box.current?.contains(ev.target as Node)) setMenu(false);
    }
    document.addEventListener("pointerdown", hide);
    return () => document.removeEventListener("pointerdown", hide);
  }, [menu]);

  function pick(id: ClinicDeskId | "all") {
    if (id === "all") {
      setClinicDesk("all");
      setOpenWing("all");
      return;
    }
    const row = halls.find((h) => h.id === id);
    if (!row) return;
    if (tab === "clinic") {
      setClinicDesk(id === clinicDesk ? "all" : id);
      if (id === clinicDesk) setOpenWing(wingOf(id));
      onPick?.(id);
      return;
    }
    setClinicDesk(id);
    if (onPick) {
      onPick(id);
      return;
    }
    if (tab === "reels") {
      writeReelCat((row.reel ?? id) as ReelCat);
      void router.navigate({ to: "/reels" });
      return;
    }
    if (tab === "study") {
      void router.navigate({
        to: "/study",
        search: { desk: row.study === "all" ? undefined : row.study, family: undefined, step: undefined },
      });
      return;
    }
    if (tab === "hub" && row.hub) {
      void router.navigate({ to: row.hub });
      return;
    }
    if (tab === "tickets" && row.ticketHall && row.ticketHall !== "all") {
      setHall(row.ticketHall);
      if (row.ticket) setTicket(row.ticket);
      void router.navigate({ to: "/hall", hash: row.ticketHall });
      return;
    }
    if (tab === "openings") {
      void router.navigate({ to: "/openings", hash: row.opening ?? id });
      return;
    }
    if (tab === "crews" && row.crew) {
      toggleCrew(row.crew);
      window.setTimeout(() => {
        document.querySelector(`[data-crew="${row.crew}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 40);
      return;
    }
    if (tab === "ledger") return;
    if (tab === "map") {
      void router.navigate({ to: "/paths", hash: row.map ?? id });
      return;
    }
    if (tab === "battle") {
      void router.navigate({ to: "/battle", hash: id });
    }
  }

  function pickWing(id: HallWingId) {
    setOpenWing(id);
    setMenu(false);
    if (id === "all") {
      setClinicDesk("all");
      return;
    }
    const inWing = desksInWing(id, tab);
    if (current && current !== "all" && !inWing.includes(current)) setClinicDesk("all");
  }

  return (
    <div ref={box} className="relative min-w-0">
      <button
        type="button"
        aria-expanded={menu}
        onClick={() => setMenu((v) => !v)}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl bg-elevated px-3.5 text-left"
      >
        <span className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Hall</span>
          <span className="mt-0.5 block truncate font-display text-sm font-semibold">{activeWing?.label ?? "All"}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-[11px] text-muted">
          <span className="hidden max-w-[10rem] truncate sm:inline">{activeWing?.line}</span>
          <ChevronDown className={cn("size-4 transition-transform duration-150", menu && "rotate-180")} />
        </span>
      </button>
      {menu ? (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-2xl bg-surface p-1 shadow-float">
          {wings.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={(ev) => {
                ev.stopPropagation();
                pickWing(w.id);
              }}
              className={cn(
                "flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 text-left",
                shownWing === w.id ? "bg-elevated text-fg" : "text-muted hover:bg-elevated hover:text-fg",
              )}
            >
              <span className="text-[13px] font-semibold">{w.label}</span>
              <span className="truncate text-[11px] text-subtle">{w.line}</span>
            </button>
          ))}
        </div>
      ) : null}
      {shownWing !== "all" && desks.length ? (
        <div className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-1 px-0.5">
          {desks.map((id, i) => (
            <span key={id} className="inline-flex items-center">
              {i ? <span className="mr-1 text-subtle">·</span> : null}
              <button
                type="button"
                data-taste={id}
                onClick={() => pick(id)}
                className={cn(
                  "min-h-11 rounded-md px-1.5 text-[12px] font-semibold",
                  current === id ? "text-primary" : "text-muted hover:text-fg",
                )}
              >
                {deskLabel(id)}
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function HallJump({ tab }: { tab: HallTabId }) {
  const halls = hallsOn(tab);
  const clinicDesk = useFeedStore((s) => s.clinicDesk);
  const setClinicDesk = useFeedStore((s) => s.setClinicDesk);
  const row = useRef<HTMLDivElement>(null);
  const shown = halls.filter((h) => h.hub);
  useEffect(() => {
    const current = useFeedStore.getState().clinicDesk;
    const fav = current !== "all" ? current : favoriteDesk(useFeedStore.getState().dayWatch);
    if (!fav) return;
    row.current?.querySelector(`[data-taste="${fav}"]`)?.scrollIntoView({ inline: "center", block: "nearest" });
  }, []);
  return (
    <div ref={row} className="hall-tabs flex min-w-0 gap-1.5">
      {shown.map((h) => {
        const label = deskLabel(h.id);
        if (!h.hub) return null;
        return (
          <Link
            key={h.id}
            to={h.hub}
            data-taste={h.id}
            onClick={() => setClinicDesk(h.id)}
            className={cn(
              "inline-flex min-h-11 shrink-0 snap-start items-center rounded-full px-3 text-[12px] font-semibold",
              clinicDesk === h.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
