import { useEffect, useRef, useState, type ReactNode } from "react";
import { Radio, Users } from "lucide-react";
import { CREWS } from "@/lib/feed-data";
import { liveViewers, remainingSec, useCampusBeat } from "@/lib/campus-live";
import { onRoster, onWire, rosterDrops, rosterPeople, wireLines } from "@/lib/customer-hold";
import { formatClock, formatCount } from "@/lib/format";
import { useFeedStore } from "@/lib/feed-store";
import { Link } from "@tanstack/react-router";
import { KnowledgeDna } from "@/components/learn/KnowledgeDna";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "dna", label: "DNA" },
  { id: "drops", label: "Open drops" },
  { id: "campus", label: "On campus" },
  { id: "crews", label: "Crews" },
] as const;

type DeskTab = (typeof TABS)[number]["id"];

export function LiveSidebar() {
  return (
    <aside
      className="sticky top-[calc(3.75rem+env(safe-area-inset-top))] z-30 hidden max-h-[calc(100dvh-4.25rem-env(safe-area-inset-top))] w-[272px] shrink-0 self-start overflow-y-auto scrollbar-none min-[1200px]:block"
      data-live-rail
      aria-label="Campus rail"
    >
      <CampusStack />
    </aside>
  );
}

export function InsightsDrawer() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="insights-fab fixed bottom-[calc(4.6rem+env(safe-area-inset-bottom))] left-3 z-40 min-h-11 items-center rounded-full bg-surface px-4 text-xs font-semibold shadow-float"
        onClick={() => setOpen(true)}
      >
        Insights
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 bg-bg/70" onClick={() => setOpen(false)}>
          <aside
            className="absolute inset-y-0 right-0 w-[min(100%,22rem)] overflow-y-auto bg-surface p-4 shadow-float"
            aria-label="Insights"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Insights</p>
              <button type="button" onClick={() => setOpen(false)} className="min-h-11 rounded-full bg-elevated px-3 text-xs font-semibold">
                Close
              </button>
            </div>
            <CampusStack compact />
          </aside>
        </div>
      ) : null}
    </>
  );
}

export function MobileCampusDesk() {
  const [tab, setTab] = useState<DeskTab>("dna");
  return (
    <section className="rounded-2xl bg-surface p-3 shadow-border xl:hidden" aria-label="Campus desk" data-campus-desk>
      <div className="flex gap-1 overflow-x-auto scrollbar-none">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "min-h-11 shrink-0 rounded-full px-3 text-xs font-semibold",
              tab === item.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-3">
        <CampusPane tab={tab} />
      </div>
    </section>
  );
}

function CampusStack({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <CampusPane tab="dna" framed compact={compact} />
      <WireStrip />
      <CampusPane tab="drops" framed />
      <CampusPane tab="campus" framed />
      <CampusPane tab="crews" framed />
    </div>
  );
}

function CampusPane({ tab, framed = false, compact = false }: { tab: DeskTab; framed?: boolean; compact?: boolean }) {
  const liveStreams = useFeedStore((s) => s.liveStreams);
  const openModal = useFeedStore((s) => s.openModal);
  const joinedCrews = useFeedStore((s) => s.joinedCrews);
  const { t, reduced } = useCampusBeat(1000);
  const [here, setHere] = useState(rosterPeople);
  const [hosted, setHosted] = useState(rosterDrops);
  useEffect(() => onRoster(() => {
    setHere(rosterPeople());
    setHosted(rosterDrops());
  }), []);
  const campus = here;
  const drops = hosted.length
    ? hosted
    : liveStreams.map((stream) => ({
        id: stream.id,
        title: stream.title,
        listeners: stream.viewers,
        name: stream.name,
        username: stream.username,
        avatar: stream.avatar,
      }));
  const inner =
    tab === "dna" ? (
      <>
        <KnowledgeDna beat={t} live compact={compact} />
        <button
          type="button"
          onClick={() => openModal({ type: "smarter" })}
          className="mt-4 w-full rounded-full bg-elevated py-2 text-xs font-semibold transition-transform duration-150 ease-out active:scale-[0.96]"
        >
          Make me smarter
        </button>
      </>
    ) : tab === "drops" ? (
      <>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
            <Radio className="size-3.5 text-primary" />
            Open drops
          </h3>
          <span className="inline-flex min-h-8 items-center gap-1 rounded-full bg-primary/15 px-2 text-[10px] font-semibold text-primary">
            <span className="drop-eq" aria-hidden>
              <span />
              <span />
              <span />
            </span>
            {drops.length}
          </span>
        </div>
        {drops.length ? (
          <VerticalDrift height={framed ? 188 : 156} reduced={reduced}>
            {(copy) =>
              drops.map((stream, i) => (
                <button
                  key={`${copy}-${stream.id}`}
                  type="button"
                  tabIndex={copy === "b" ? -1 : 0}
                  onClick={() => openModal({ type: "live", streamId: stream.id })}
                  className="flex min-h-11 w-full items-center justify-between rounded-xl px-2 text-left hover:bg-elevated"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="relative shrink-0">
                      <img src={stream.avatar} alt="" className="size-9 rounded-full object-cover ring-2 ring-primary" />
                      <span className="live-pulse absolute -bottom-0.5 -right-0.5 rounded-sm bg-live px-1 font-mono text-[8px] font-bold text-primary-fg">
                        DROP
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold">{stream.name}</span>
                      <span className="block max-w-[160px] truncate text-[11px] text-subtle">
                        {formatClock(remainingSec(30, t, i))} · {stream.title}
                      </span>
                    </span>
                  </div>
                  <span className="ml-2 shrink-0 font-mono text-[11px] font-semibold tabular-nums text-primary">
                    {formatCount(liveViewers(stream.listeners, t, i))}
                  </span>
                </button>
              ))
            }
          </VerticalDrift>
        ) : (
          <p className="text-xs text-muted">No one is live. A drop appears when a member starts one.</p>
        )}
      </>
    ) : tab === "campus" ? (
      <>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">On campus</h3>
        {campus.length ? (
        <VerticalDrift height={framed ? 148 : 132} reduced={reduced} speed={0.02}>
          {(copy) =>
            campus.map((person) => (
              <Link
                key={`${copy}-${person.id}`}
                to="/u/$username"
                params={{ username: person.username }}
                tabIndex={copy === "b" ? -1 : 0}
                className="flex min-h-11 items-center gap-2.5 rounded-xl px-1 hover:bg-elevated"
              >
                <span className="relative shrink-0">
                  <img src={person.avatar} alt="" className="size-8 rounded-full object-cover" />
                  <span className="live-pulse absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-primary ring-2 ring-surface" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold">{person.name}</span>
                  <span className="block truncate text-[11px] text-subtle">{person.place}</span>
                </span>
              </Link>
            ))
          }
        </VerticalDrift>
        ) : (
          <p className="text-xs text-muted">No one is on campus yet. Signed-in members show up here.</p>
        )}
      </>
    ) : (
      <>
        <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
          <Users className="size-3.5" />
          Crews
        </h3>
        {CREWS.filter((c) => joinedCrews.includes(c.id)).length ? (
          CREWS.filter((c) => joinedCrews.includes(c.id)).map((c) => (
            <Link key={c.id} to="/campus" className="flex min-h-11 flex-col justify-center rounded-xl px-2 hover:bg-elevated">
              <span className="text-xs font-semibold">{c.name}</span>
              <span className="block text-[11px] text-muted">{c.stamp}</span>
            </Link>
          ))
        ) : (
          <p className="text-xs text-muted">Join a crew on campus.</p>
        )}
        <Link to="/campus" className="mt-2 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
          Browse all crews
        </Link>
      </>
    );

  if (!framed) return inner;
  return <section className="rounded-2xl bg-surface p-4 shadow-border">{inner}</section>;
}

function WireStrip() {
  const [stored, setStored] = useState(wireLines);
  useEffect(() => onWire(() => setStored(wireLines())), []);
  const line = stored.length ? stored.join(" · ") : "The hall wire shows members when they earn a stamp.";
  return (
    <section className="overflow-hidden rounded-2xl bg-surface shadow-border">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <span className="live-pulse size-1.5 rounded-full bg-primary" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Wire</span>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="live-wire-track pr-10 text-[11px] text-muted">
            <span className="pr-10">{line}</span>
            <span className="pr-10" aria-hidden>
              {line}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function VerticalDrift({
  height,
  speed = 0.026,
  reduced,
  children,
}: {
  height: number;
  speed?: number;
  reduced: boolean;
  children: (copy: "a" | "b") => ReactNode;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const y = useRef(0);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      const wrapAt = first.current?.offsetHeight ?? 0;
      if (!paused.current && wrapAt > height * 1.05 && track.current) {
        y.current += dt * speed;
        if (y.current >= wrapAt) y.current -= wrapAt;
        track.current.style.transform = `translate3d(0, ${-y.current}px, 0)`;
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [reduced, speed, height]);

  if (reduced) {
    return (
      <div className="space-y-1.5 overflow-y-auto scrollbar-none" style={{ maxHeight: height }}>
        {children("a")}
      </div>
    );
  }

  return (
    <div
      ref={viewport}
      className="overflow-hidden"
      style={{ height }}
      onPointerEnter={() => {
        paused.current = true;
      }}
      onPointerLeave={() => {
        paused.current = false;
      }}
      onFocusCapture={() => {
        paused.current = true;
      }}
      onBlurCapture={() => {
        paused.current = false;
      }}
    >
      <div ref={track} className="will-change-transform">
        <div ref={first} className="space-y-1.5 pb-1.5">
          {children("a")}
        </div>
        <div className="space-y-1.5" aria-hidden>
          {children("b")}
        </div>
      </div>
    </div>
  );
}
