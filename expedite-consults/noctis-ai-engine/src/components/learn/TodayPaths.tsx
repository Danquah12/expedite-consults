import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { dayKey, todayLearned, LEARN_PATHS, PATH_LEVELS, type TilSlot } from "@/lib/today-learned";
import { cn } from "@/lib/utils";

const SLOT_LABEL: Record<TilSlot, string> = {
  science: "Science",
  history: "History",
  cyber: "Cyber",
  word: "Word",
  money: "Money",
  tech: "Tech",
  think: "Philosophy",
  care: "Care",
  culture: "Culture",
  research: "Research",
};

export function TodayLearned() {
  const items = useMemo(() => todayLearned(), []);
  const key = `sphera-til-${dayKey()}`;
  const [done, setDone] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
    } catch {
      return [];
    }
  });

  function toggle(slot: string) {
    const next = done.includes(slot) ? done.filter((s) => s !== slot) : [...done, slot];
    setDone(next);
    localStorage.setItem(key, JSON.stringify(next));
  }

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-border">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Today I learned</p>
      <h2 className="mt-1 font-display text-lg font-semibold">Ten things worth learning today.</h2>
      <p className="mt-1 text-sm text-muted">
        A daily habit. New set at midnight UTC. {done.length}/10 marked on this device.
      </p>
      <ol className="mt-4 space-y-3">
        {items.map((item, i) => (
          <li key={item.slot} className="border-t border-border pt-3">
            <button type="button" onClick={() => toggle(item.slot)} className="flex w-full items-start gap-3 text-left">
              <span
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                  done.includes(item.slot) ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
                )}
              >
                {i + 1}
              </span>
              <span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle">
                  {SLOT_LABEL[item.slot]}
                </span>
                <span className="mt-0.5 block text-sm font-semibold">{item.title}</span>
                <span className="mt-0.5 block text-sm text-muted">{item.line}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function LearnPaths() {
  const [id, setId] = useState<(typeof LEARN_PATHS)[number]["id"]>("cyber");
  const [level, setLevel] = useState<(typeof PATH_LEVELS)[number]>("Beginner");
  const path = LEARN_PATHS.find((p) => p.id === id)!;
  const steps = path.levels[level];
  const storeKey = `sphera-path-${id}-${level}`;
  const [done, setDone] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storeKey) ?? "[]") as number[];
    } catch {
      return [];
    }
  });

  function mark(i: number) {
    const next = done.includes(i) ? done.filter((n) => n !== i) : [...done, i];
    setDone(next);
    localStorage.setItem(storeKey, JSON.stringify(next));
  }

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-border">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Learning paths</p>
      <h2 className="mt-1 font-display text-lg font-semibold">A sequence. Not video → video → video.</h2>
      <p className="mt-1 text-sm text-muted">{PATH_LEVELS.join(" → ")}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {LEARN_PATHS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setId(p.id);
              setLevel("Beginner");
              try {
                setDone(JSON.parse(localStorage.getItem(`sphera-path-${p.id}-Beginner`) ?? "[]") as number[]);
              } catch {
                setDone([]);
              }
            }}
            className={cn(
              "min-h-11 rounded-full px-3 text-xs font-semibold",
              id === p.id ? "bg-primary text-primary-fg" : "bg-elevated",
            )}
          >
            {p.title}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {PATH_LEVELS.map((lv) => (
          <button
            key={lv}
            type="button"
            onClick={() => {
              setLevel(lv);
              try {
                setDone(JSON.parse(localStorage.getItem(`sphera-path-${id}-${lv}`) ?? "[]") as number[]);
              } catch {
                setDone([]);
              }
            }}
            className={cn(
              "min-h-11 rounded-full px-3 text-xs font-semibold",
              level === lv ? "bg-primary text-primary-fg" : "bg-elevated",
            )}
          >
            {lv}
          </button>
        ))}
      </div>
      <ol className="mt-4 space-y-2">
        {steps.map((step, i) => (
          <li key={step}>
            <button
              type="button"
              onClick={() => mark(i)}
              className={cn(
                "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm",
                done.includes(i) ? "bg-primary text-primary-fg" : "bg-elevated",
              )}
            >
              <span className="tabular-nums text-xs font-semibold">{i + 1}</span>
              {step}
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-sm text-muted">
        {done.length}/{steps.length} · {path.capstone}
      </p>
      {path.href === "/hub/range" ? (
        <Link to="/hub/range" className="mt-2 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
          Open the range
        </Link>
      ) : path.href === "/study" ? (
        <Link
          to="/study"
          search={{ desk: undefined, family: undefined, step: undefined }}
          className="mt-2 inline-flex min-h-11 items-center text-xs font-semibold text-primary"
        >
          Open Study
        </Link>
      ) : path.href === "/hub/tracks" ? (
        <Link to="/hub/tracks" className="mt-2 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
          Open tracks
        </Link>
      ) : path.href === "/hub/careers" ? (
        <Link to="/hub/careers" className="mt-2 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
          Open careers
        </Link>
      ) : path.href === "/paths" ? (
        <Link to="/paths" className="mt-2 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
          Open your map
        </Link>
      ) : path.href === "/hall" ? (
        <Link to="/hall" className="mt-2 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
          Open tickets
        </Link>
      ) : (
        <Link to="/openings" className="mt-2 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
          Open openings
        </Link>
      )}
    </section>
  );
}