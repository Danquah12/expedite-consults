import { useMemo, useState } from "react";
import { FLEET_CATALOG, FLEET_DESKS, FLEET_HUB, type FleetDesk } from "@/lib/fleet-academy";
import { cn } from "@/lib/utils";

function spoken(blurb: string) {
  return blurb.replace(/^\d+\s+Modules,\s+\d+\s+Topics\.\s*/i, "");
}

function article(name: string) {
  return /^[aeiou]/i.test(name.trim()) ? "an" : "a";
}

function forPeople(jobs: string[]) {
  const phrase = (job: string) => `${article(job)} ${job}`;
  if (jobs.length === 0) return "";
  if (jobs.length === 1) return `Written for ${phrase(jobs[0])}.`;
  const last = jobs[jobs.length - 1]!;
  return `Written for ${jobs.slice(0, -1).map(phrase).join(", ")}, or ${phrase(last)}.`;
}

export function FleetAcademy() {
  const [desk, setDesk] = useState<FleetDesk | "all">("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const needle = query.trim().toLowerCase();
  const shown = useMemo(
    () =>
      FLEET_CATALOG.filter((badge) => {
        if (desk !== "all" && badge.desk !== desk) return false;
        if (!needle) return true;
        const hay = [badge.name, badge.shelf, badge.blurb, ...badge.concepts, ...badge.jobs].join(" ").toLowerCase();
        return hay.includes(needle);
      }),
    [desk, needle],
  );
  const open = shown.find((badge) => badge.id === openId) ?? null;

  return (
    <div className="space-y-4">
      <header className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">A course, not a clip</p>
        <h1 className="mt-1 font-display text-2xl font-semibold">What do you want to get good at?</h1>
        <p className="mt-2 text-sm text-muted">Pick one subject and stay with it. The lesson opens here, so you do not have to leave.</p>
        <a href={FLEET_HUB} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary">
          I want this on its own page
        </a>
      </header>

      <div className="space-y-3">
        <label className="block">
          <span className="sr-only">Search courses</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try security, Spark, or the job you want"
            className="min-h-11 w-full rounded-2xl bg-surface px-4 text-sm shadow-border"
          />
        </label>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {FLEET_DESKS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setDesk(item.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-2 text-xs font-semibold",
                desk === item.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-2">
        {shown.map((badge) => {
          const on = badge.id === open?.id;
          return (
            <li key={badge.id}>
              <button
                type="button"
                onClick={() => setOpenId(on ? null : badge.id)}
                className={cn("w-full rounded-2xl bg-surface px-4 py-4 text-left shadow-border", on && "ring-2 ring-primary")}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">{badge.shelf}</span>
                <span className="mt-1 block font-display text-base font-semibold">{badge.name}</span>
                <span className="mt-1 block text-sm text-muted">{spoken(badge.blurb)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {shown.length === 0 ? <p className="text-sm text-muted">Nothing by that name. Try a shorter word.</p> : null}

      {open ? (
        <section className="space-y-3 rounded-2xl bg-surface p-4 shadow-border">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{open.shelf}</p>
              <h2 className="mt-1 font-display text-lg font-semibold">{open.name}</h2>
              <p className="mt-2 text-sm text-muted">{spoken(open.blurb)}</p>
            </div>
            <a
              href={open.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-elevated px-4 text-sm font-semibold"
            >
              Open it larger
            </a>
          </div>
          <p className="text-sm text-muted">{forPeople(open.jobs)}</p>
          <p className="text-sm text-muted">You will meet {open.concepts.join(", ")}.</p>
          <iframe title={open.name} src={open.href} className="h-[70dvh] min-h-[28rem] w-full rounded-xl bg-bg shadow-border" />
        </section>
      ) : (
        <p className="text-sm text-muted">Choose one. The lesson opens underneath, and you can keep reading.</p>
      )}
    </div>
  );
}
