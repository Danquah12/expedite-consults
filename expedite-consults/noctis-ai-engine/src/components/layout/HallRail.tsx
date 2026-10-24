import { useEffect, useState } from "react";
import { onWire, wireLines } from "@/lib/customer-hold";
import { LayoutGrid, Settings } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { STAMPS } from "@/lib/feed-data";
import { GOALS, levelFromXp } from "@/lib/learn";
import { SPARK_LIMIT } from "@/lib/engine";
import { LANE_LABEL, type VibeLane } from "@/lib/noctis";
import { HALL_GROUPS, tabIsActive } from "@/lib/hall-nav";
import { useFeedStore } from "@/lib/feed-store";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ME } from "@/lib/current-user";
import { vt } from "@/lib/locale";
import { leaveHall } from "@/lib/auth/client";
import { scrollToFeed } from "@/lib/syndicate";

const LANES: VibeLane[] = ["learn", "laugh", "local"];

export function HallRail() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const hash = useRouterState({ select: (s) => s.location.hash });
  const xp = useFeedStore((s) => s.xp);
  const mix = useFeedStore((s) => s.vibeMix);
  const boostLane = useFeedStore((s) => s.boostLane);
  const goal = useFeedStore((s) => s.goal);
  const sparks = useFeedStore((s) => s.sparks);
  const echosDone = useFeedStore((s) => s.echosDone);
  const earnedStamps = useFeedStore((s) => s.earnedStamps);
  const drillPassed = useFeedStore((s) => s.drillPassed);
  const posts = useFeedStore((s) => s.posts);
  const setMix = useFeedStore((s) => s.setMix);
  const toggleFlip = useFeedStore((s) => s.toggleFlip);
  const enterReels = useFeedStore((s) => s.enterReels);
  const openClinic = useFeedStore((s) => s.openClinic);
  const openModal = useFeedStore((s) => s.openModal);
  const lvl = levelFromXp(xp);
  const goalMeta = GOALS.find((g) => g.id === goal);
  const next = posts.find((p) => p.lane === "learn" && !drillPassed[p.id]) ?? posts.find((p) => p.lane === "learn");
  const stamps = STAMPS.filter((s) => earnedStamps.includes(s.name)).slice(0, 4);
  const poster = next?.posterUrl ?? (next?.mediaType === "image" ? next.mediaUrl : undefined);

  return (
    <aside className="desk-rail sticky top-[calc(3.25rem+env(safe-area-inset-top))] z-30 max-h-[calc(100dvh-3.75rem-env(safe-area-inset-top))] w-16 shrink-0 self-start overflow-y-auto scrollbar-none min-[1200px]:top-[calc(3.75rem+env(safe-area-inset-top))] min-[1200px]:max-h-[calc(100dvh-4.25rem-env(safe-area-inset-top))] min-[1200px]:w-56 min-[1200px]:pr-2">
      <div>
        <Link
          to="/you"
          aria-label="Your profile"
          className="mx-auto mb-3 grid size-11 place-items-center overflow-hidden rounded-full bg-surface shadow-border min-[1200px]:hidden"
        >
          <img src={ME.avatarUrl} alt="" className="size-11 object-cover" />
        </Link>
        <div className="overflow-hidden rounded-3xl bg-surface shadow-border">
          <div className="relative hidden px-4 pb-4 pt-5 min-[1200px]:block">
            <span className="absolute inset-y-5 left-0 w-0.5 rounded-full bg-primary" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-subtle">{vt("Your progress")}</p>
            <p className="mt-1 text-xs text-muted">
              Lv {lvl.level} · {lvl.into}/{lvl.next} XP
            </p>
            <p className="mt-1 text-xs text-subtle">{vt(goalMeta?.blurb ?? "University of Ghana")}</p>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              <Stat label={vt("Sparks")} value={`${sparks}/${SPARK_LIMIT}`} />
              <Stat label={vt("Echoes")} value={echosDone} />
            </div>
          </div>
          <Separator className="hidden min-[1200px]:block" />
          <nav className="space-y-0.5 p-1.5 min-[1200px]:p-2" aria-label="Hall">
            <Link
              to="/start"
              aria-label={vt("Cards")}
              title={vt("Cards")}
              className="flex items-center justify-center gap-3 rounded-xl px-0 py-2.5 text-sm font-medium text-primary min-[1200px]:justify-start min-[1200px]:px-3 min-[1200px]:py-2"
            >
              <LayoutGrid className="size-5 shrink-0 min-[1200px]:size-4" />
              <span className="hidden min-[1200px]:inline">{vt("Cards")}</span>
            </Link>
            {HALL_GROUPS.map((group) => (
              <div key={group.label} className="pt-1">
                <p className="hidden px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-subtle min-[1200px]:block">{vt(group.label)}</p>
                {group.tabs.map((item) => {
              const Icon = item.icon;
              const active = tabIsActive(path, item.to, item.hash, hash);
              return (
                <div key={`${item.to}-${item.hash ?? item.label}`}>
                <Link
                  to={item.to}
                  hash={item.hash ?? (item.to === "/" ? "feed" : "")}
                  aria-label={vt(item.label)}
                  title={vt(item.label)}
                  onClick={() => {
                    if (item.to === "/") openClinic();
                    if (item.to === "/reels") enterReels();
                  }}
                  className={cn(
                    "flex items-center justify-center gap-3 rounded-xl px-0 py-2.5 text-sm font-medium transition-colors duration-150 min-[1200px]:justify-start min-[1200px]:px-3 min-[1200px]:py-2",
                    active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated hover:text-fg",
                  )}
                >
                  <Icon className={cn("size-5 shrink-0 min-[1200px]:size-4", active && "text-primary")} />
                  <span className="hidden min-[1200px]:inline">{vt(item.label)}</span>
                </Link>
                </div>
              );
                })}
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                void leaveHall();
              }}
              className="flex w-full items-center justify-center gap-3 rounded-xl px-0 py-2.5 text-sm font-medium text-muted hover:bg-elevated hover:text-fg min-[1200px]:justify-start min-[1200px]:px-3 min-[1200px]:py-2"
            >
              <span className="hidden min-[1200px]:inline">Sign out</span>
              <span className="min-[1200px]:hidden">Out</span>
            </button>
          </nav>
          <button
            type="button"
            aria-label="Settings"
            title="Settings"
            onClick={() => openModal({ type: "settings" })}
            className="mx-auto mb-2 mt-1 grid size-11 place-items-center rounded-xl text-muted hover:bg-elevated hover:text-fg min-[1200px]:hidden"
          >
            <Settings className="size-5" />
          </button>
          <div className="hidden min-[1200px]:block">
            <Separator />
            <section className="px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Clinic diet</p>
              <div className="mt-3 flex h-16 items-end gap-2">
                {LANES.map((lane) => (
                  <button
                    key={lane}
                    type="button"
                    onClick={() => boostLane(lane)}
                    className="group flex h-full flex-1 flex-col justify-end gap-1"
                    aria-label={`${vt("Boost")} ${vt(LANE_LABEL[lane])}`}
                  >
                    <span
                      className={cn("w-full rounded-md", lane === "learn" ? "bg-primary" : "bg-elevated group-hover:bg-muted")}
                      style={{ height: `${Math.max(12, mix[lane])}%` }}
                    />
                    <span className="text-center font-mono text-[10px] tabular-nums text-subtle">{mix[lane]}</span>
                  </button>
                ))}
              </div>
              <div className="mt-1 flex gap-2">
                {LANES.map((lane) => (
                  <span key={lane} className="flex-1 text-center text-[10px] font-medium text-muted">
                    {vt(LANE_LABEL[lane])}
                  </span>
                ))}
              </div>
            </section>
            {next ? (
              <>
                <Separator />
                <section className="px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">Next drill</p>
                  <button
                    type="button"
                    onClick={() => {
                      setMix({ learn: 70, laugh: 15, local: 15 });
                      toggleFlip(next.id);
                      scrollToFeed(next.id);
                    }}
                    className="mt-2 w-full overflow-hidden rounded-2xl bg-elevated text-left shadow-border"
                  >
                    {poster ? <img src={poster} alt="" className="h-20 w-full object-cover" /> : <div className="h-20 bg-bg" />}
                    <span className="block px-2.5 py-2">
                      <span className="block truncate text-xs font-semibold">{next.teach.stamp}</span>
                      <span className="block truncate text-[11px] text-muted">{next.author.name}</span>
                    </span>
                  </button>
                </section>
              </>
            ) : null}
            {stamps.length ? (
              <>
                <Separator />
                <section className="px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">Stamps</p>
                  <ul className="mt-2 space-y-1.5">
                    {stamps.map((s) => (
                      <li key={s.id} className="truncate text-xs font-medium text-fg">
                        {s.name}
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            ) : null}
            <Separator />
            <HallWire />
          </div>
        </div>
      </div>
    </aside>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="rounded-xl bg-elevated px-2.5 py-2">
      <span className="block font-mono text-sm font-semibold tabular-nums">{value}</span>
      <span className="block text-[10px] font-medium uppercase tracking-wider text-subtle">{label}</span>
    </span>
  );
}

function wireText(text: string) {
  const mark = " earned ";
  const at = text.indexOf(mark);
  if (at < 1) return vt(text);
  return `${text.slice(0, at)} ${vt("earned")} ${vt(text.slice(at + mark.length))}`;
}

function HallWire() {
  const [i, setI] = useState(0);
  const [stored, setStored] = useState(wireLines);
  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % 5), 4200);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => onWire(() => setStored(wireLines())), []);
  const rows = stored.length
    ? stored.slice(0, 5).map((text, idx) => ({ id: `db-${idx}`, text }))
    : [{ id: "quiet", text: "The hall wire shows members when they earn a stamp." }];
  return (
    <section className="px-4 py-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
        <span className="live-pulse size-1.5 rounded-full bg-primary" />
        Hall wire
      </p>
      <ol className="mt-3 space-y-0">
        {rows.map((item, idx) => (
          <li key={item.id} className="flex gap-2.5">
            <span className="flex w-2.5 flex-col items-center">
              <span className={cn("mt-1 size-1.5 rounded-full", idx === i % rows.length ? "bg-primary" : "bg-elevated")} />
              {idx < rows.length - 1 ? <span className="w-px flex-1 bg-border" /> : null}
            </span>
            <p className={cn("pb-3 text-xs leading-snug", idx === i % rows.length ? "text-fg" : "text-subtle")}>{wireText(item.text)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}