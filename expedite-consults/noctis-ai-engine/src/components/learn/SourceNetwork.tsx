import { useEffect, useMemo, useRef, useState } from "react";
import { YoutubeFrame } from "@/components/feed/YoutubeFrame";
import { SayToNoctis } from "@/components/learn/SayToNoctis";
import {
  askLecture,
  desksFor,
  DESKS,
  groupedHouses,
  LICENSE_LABEL,
  NETWORK,
  PRESENTED_BY,
  learningPath,
  shelvesFor,
  TRUSTED,
  WORLDS,
  type DeskId,
  type LicenseMark,
  type NetworkHouse,
  type WorldId,
} from "@/lib/source-network";
import { offerFurtherStudy } from "@/lib/further-study";
import { isAiClip } from "@/lib/ai-cut";
import { pauseAllYoutube, youtubePoster } from "@/lib/youtube";
import { useFeedStore } from "@/lib/feed-store";
import { cn } from "@/lib/utils";

const EMPTY_HOUSES: string[] = [];

const MARK: Record<LicenseMark, string> = {
  open: "text-primary",
  embed: "text-primary",
  partner: "text-muted",
  external: "text-subtle",
  creator: "text-primary",
  restricted: "text-subtle",
};

const ASKS: { id: string; label: string }[] = [
  { id: "explain", label: "Explain this" },
  { id: "quiz", label: "Give me a drill" },
  { id: "papers", label: "Related papers" },
  { id: "jobs", label: "What jobs" },
  { id: "beginner", label: "Beginner take" },
];

function HouseCard({ house, onPlay }: { house: NetworkHouse; onPlay: (id: string) => void }) {
  return (
    <li className="rounded-2xl bg-surface p-4 shadow-border">
      <p className={cn("text-[11px] font-semibold uppercase tracking-wider", MARK[house.license])}>
        {LICENSE_LABEL[house.license]}
      </p>
      <p className="mt-1 font-display text-base font-semibold">{house.name}</p>
      <p className="mt-1 text-xs text-muted">{house.blurb}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onPlay(house.id)}
          className="min-h-11 rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg"
        >
          Open object
        </button>
        <a
          href={house.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center rounded-full bg-elevated px-3 text-xs font-semibold text-fg"
        >
          Open house
        </a>
      </div>
    </li>
  );
}

function LearnObject({ house, onClose }: { house: NetworkHouse; onClose: () => void }) {
  const isMuted = useFeedStore((s) => s.isMuted);
  const unlockSound = useFeedStore((s) => s.unlockSound);
  const toggleMute = useFeedStore((s) => s.toggleMute);
  const gated = useFeedStore((s) => Boolean(house.youtubeId && s.blockedYoutube.includes(house.youtubeId)));
  const [ask, setAsk] = useState("explain");
  const answer = useMemo(() => askLecture(house, ask), [house, ask]);
  const chain = useMemo(() => learningPath(house), [house]);
  const film =
    house.youtubeId &&
    !gated &&
    !isAiClip({ id: house.id, caption: `${house.name} ${house.blurb}`, teach: { hook: house.concepts.join(" "), stamp: house.shelf } });

  return (
    <article className="overflow-hidden rounded-2xl bg-surface shadow-border">
      {film ? (
        <YoutubeFrame
          postId={`net-${house.id}`}
          youtubeId={house.youtubeId!}
          posterUrl={youtubePoster(house.youtubeId!)}
          playing
          muted={isMuted}
          onToggle={() => {
            unlockSound();
            toggleMute(`net-${house.id}`);
          }}
          onEnded={() => offerFurtherStudy(house.name)}
        />
      ) : house.license === "embed" && house.href ? (
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={house.href}
            title={house.name}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-elevated px-5">
          <p className="text-center text-sm text-muted">
            {gated
              ? "This film is not available here. Open the original house."
              : `${house.name} does not publish a public embed. We send you to the original. We do not copy the file.`}
          </p>
          <a
            href={house.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
          >
            Play at source
          </a>
        </div>
      )}
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              {house.shelf} · {LICENSE_LABEL[house.license]}
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold">{house.name}</h3>
            <p className="mt-1 text-sm text-muted">{house.blurb}</p>
            <div className="mt-2">
              <SayToNoctis youtubeId={house.youtubeId} title={house.name} />
            </div>
          </div>
          <button type="button" onClick={onClose} className="min-h-11 shrink-0 rounded-full bg-elevated px-3 text-xs font-semibold">
            Close
          </button>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Source · {PRESENTED_BY}</p>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle">Key concepts</p>
          <p className="mt-1 text-sm">{house.concepts.join(" · ")}</p>
        </div>
        {house.papers?.length ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle">Papers</p>
            <ul className="mt-1 space-y-1">
              {house.papers.map((p) => (
                <li key={p.href}>
                  <a href={p.href} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary">
                    {p.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {house.jobs?.length ? (
          <p className="text-sm text-muted">Jobs on this path · {house.jobs.join(" · ")}</p>
        ) : null}
        {chain ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle">
              {house.desk === "cyber" || house.desk === "careers" ? "Skill path" : "Research path"}
            </p>
            <ol className="mt-2 space-y-1.5">
              {chain.map((step, i) => (
                <li key={step.step} className="flex items-baseline gap-2 text-sm">
                  <span className="w-24 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-primary">{step.step}</span>
                  {step.href ? (
                    <a href={step.href} target="_blank" rel="noreferrer" className="font-semibold text-fg">
                      {step.label}
                    </a>
                  ) : (
                    <span className="text-muted">{step.label}</span>
                  )}
                  {i < chain.length - 1 ? <span className="text-subtle">→</span> : null}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle">Ask this house</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ASKS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAsk(a.id)}
                className={cn(
                  "min-h-11 rounded-full px-3 text-xs font-semibold",
                  ask === a.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
                )}
              >
                {a.label}
              </button>
            ))}
          </div>
          <p className="mt-3 rounded-xl bg-elevated p-3 text-sm leading-relaxed">{answer}</p>
        </div>
      </div>
    </article>
  );
}

export function SourceNetwork() {
  const [world, setWorld] = useState<WorldId>("learn");
  const desks = desksFor(world);
  const [desk, setDesk] = useState<DeskId>(desks[0].id);
  const [shelf, setShelf] = useState<string | "all">("all");
  const [watch, setWatch] = useState<string | null>(null);
  const objectRef = useRef<HTMLDivElement>(null);
  const shelves = shelvesFor(desk);
  const groups = groupedHouses(desk, shelf);
  const waveHouses = useFeedStore((s) => s.ingestLog[0]?.houses) ?? EMPTY_HOUSES;
  const hotNames = useMemo(() => new Set(waveHouses.map((n) => n.toLowerCase())), [waveHouses]);
  const ordered = useMemo(
    () =>
      groups.map((g) => ({
        ...g,
        houses: [...g.houses]
          .filter((h) => !isAiClip({ id: h.id, caption: `${h.name} ${h.blurb}`, teach: { hook: h.concepts.join(" "), stamp: h.shelf } }))
          .sort((a, b) => Number(hotNames.has(b.name.toLowerCase())) - Number(hotNames.has(a.name.toLowerCase()))),
      })),
    [groups, hotNames],
  );
  const playing = NETWORK.find((h) => h.id === watch) ?? null;

  useEffect(() => {
    if (!watch) {
      pauseAllYoutube();
      return;
    }
    pauseAllYoutube();
    useFeedStore.getState().setPlayingId(`net-${watch}`);
    const t = window.setTimeout(() => {
      objectRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
    return () => window.clearTimeout(t);
  }, [watch]);

  function pickWorld(id: WorldId) {
    const next = desksFor(id)[0];
    setWorld(id);
    setDesk(next.id);
    setShelf("all");
    setWatch(null);
  }

  function pickTrusted(worldId: WorldId, deskId: DeskId) {
    setWorld(worldId);
    setDesk(deskId);
    setShelf("all");
    setWatch(null);
  }

  return (
    <section className="space-y-3">
      <div className="space-y-3 rounded-2xl bg-surface p-4 shadow-border">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Houses · {PRESENTED_BY}</p>
          <h2 className="mt-1 font-display text-lg font-semibold">World, then desk, then shelf.</h2>
        </div>

        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Shortcut</p>
          <div className="flex flex-wrap gap-1.5">
            {TRUSTED.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => pickTrusted(t.world, t.desk)}
                className={cn(
                  "min-h-9 rounded-full px-3 text-xs font-semibold",
                  desk === t.desk ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">World</p>
          <div className="flex flex-wrap gap-1.5">
            {WORLDS.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => pickWorld(w.id)}
                className={cn(
                  "min-h-9 rounded-full px-3 text-xs font-semibold",
                  world === w.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
                )}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Desk</p>
          <div className="flex flex-wrap gap-1.5">
            {desks.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setDesk(d.id);
                  setShelf("all");
                  setWatch(null);
                }}
                className={cn(
                  "min-h-9 rounded-full px-3 text-xs font-semibold",
                  desk === d.id ? "bg-fg text-bg" : "bg-elevated text-muted",
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {shelves.length > 1 ? (
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Shelf</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setShelf("all")}
                className={cn("min-h-9 rounded-full px-3 text-xs font-semibold", shelf === "all" ? "bg-fg text-bg" : "bg-elevated text-muted")}
              >
                All
              </button>
              {shelves.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setShelf(s === shelf ? "all" : s)}
                  className={cn("min-h-9 rounded-full px-3 text-xs font-semibold", shelf === s ? "bg-fg text-bg" : "bg-elevated text-muted")}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div
        ref={objectRef}
        className="scroll-mt-[calc(7.25rem+env(safe-area-inset-top))] md:scroll-mt-[calc(4.5rem+env(safe-area-inset-top))]"
      >
        {playing ? <LearnObject house={playing} onClose={() => setWatch(null)} /> : null}
      </div>

      {ordered.map((g) => (
        <div key={g.shelf} className="space-y-2">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-subtle">
            {DESKS.find((d) => d.id === desk)?.label} · {g.shelf}
            <span className="ml-1 font-mono">{g.houses.length}</span>
          </p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {g.houses.map((h) => (
              <HouseCard key={h.id} house={h} onPlay={setWatch} />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
