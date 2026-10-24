import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  HIRE_SEATS,
  labForStamp,
  rankHires,
  readPostedHires,
  stampNames,
  writePostedHire,
  type HireSeat,
} from "@/lib/hire-desk";
import { SOURCE } from "@/lib/source";
import { JOB_LAUNCHPAD, RESUME_CLINIC } from "@/lib/openings";
import { useFeedStore } from "@/lib/feed-store";
import { cn } from "@/lib/utils";

export function HireDesk() {
  const stamps = useFeedStore((s) => s.earnedStamps);
  const [posted, setPosted] = useState<HireSeat[]>(() => readPostedHires());
  const [mine, setMine] = useState(true);
  const [open, setOpen] = useState(false);
  const seats = useMemo(() => {
    const all = rankHires([...posted, ...HIRE_SEATS], stamps);
    if (!mine) return all;
    const held = new Set(stamps);
    const match = all.filter((s) => held.has(s.stamp));
    return match.length ? match : all;
  }, [posted, stamps, mine]);
  const held = new Set(stamps);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        Employers ask for a clinic stamp. Apply on the official board. {SOURCE} does not take a cut of USAJOBS.
      </p>
      <p className="text-xs">
        <Link to="/hub/stamps" className="font-semibold text-primary">
          How stamps are verified
        </Link>
        <span className="text-subtle"> · </span>
        <Link to="/hub/cert/$id" params={{ id: "cisa" }} className="font-semibold text-primary">
          ISACA CISA requirements
        </Link>
      </p>
      <a
        href={JOB_LAUNCHPAD.href}
        target="_blank"
        rel="noreferrer"
        className="block rounded-2xl bg-elevated p-5 shadow-border"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{JOB_LAUNCHPAD.name}</p>
        <h2 className="mt-1 font-display text-lg font-semibold">{JOB_LAUNCHPAD.title}</h2>
        <p className="mt-1 text-sm text-muted">{JOB_LAUNCHPAD.line}</p>
        <p className="mt-2 text-[11px] font-semibold text-primary">Open Training Launch pad</p>
      </a>
      <a
        href={RESUME_CLINIC.href}
        target="_blank"
        rel="noreferrer"
        className="block rounded-2xl bg-elevated p-5 shadow-border"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{RESUME_CLINIC.name}</p>
        <h2 className="mt-1 font-display text-lg font-semibold">{RESUME_CLINIC.title}</h2>
        <p className="mt-1 text-sm text-muted">{RESUME_CLINIC.line}</p>
        <p className="mt-2 text-[11px] font-semibold text-primary">Open CareerSuite</p>
      </a>
      {stamps.length ? (
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {stamps.slice(0, 8).map((name) => (
            <span key={name} className="shrink-0 rounded-full bg-primary/15 px-3 py-1.5 text-[11px] font-semibold text-primary">
              {name}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-subtle">Earn a stamp in a range lab. Then the seats light up.</p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMine(true)}
          className={cn(
            "min-h-11 rounded-full px-3 text-xs font-semibold",
            mine ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
          )}
        >
          My stamps
        </button>
        <button
          type="button"
          onClick={() => setMine(false)}
          className={cn(
            "min-h-11 rounded-full px-3 text-xs font-semibold",
            !mine ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
          )}
        >
          All seats
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="min-h-11 rounded-full bg-elevated px-3 text-xs font-semibold"
        >
          Post a hire
        </button>
      </div>
      {open ? <HireForm onSave={(seat) => setPosted(writePostedHire(seat))} onDone={() => setOpen(false)} /> : null}
      {seats.map((seat) => {
        const ready = held.has(seat.stamp);
        const labId = labForStamp(seat.stamp);
        return (
          <article key={seat.id} className={cn("rounded-2xl p-5 shadow-border", ready ? "bg-elevated" : "bg-surface")}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              {ready ? "Stamp held" : "Stamp required"} · {seat.stamp}
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold">{seat.title}</h2>
            <p className="mt-0.5 text-xs text-muted">
              {seat.org} · {seat.place}
            </p>
            <p className="mt-2 text-sm leading-relaxed">{seat.line}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ready ? (
                <a
                  href={seat.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg"
                >
                  Apply at {seat.board}
                </a>
              ) : labId ? (
                <Link
                  to="/hub/lab/$id"
                  params={{ id: labId }}
                  className="inline-flex min-h-11 items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg"
                >
                  Earn {seat.stamp}
                </Link>
              ) : (
                <Link to="/hub/tracks" className="inline-flex min-h-11 items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg">
                  Earn the stamp
                </Link>
              )}
              <a
                href={seat.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center rounded-full bg-surface px-3 text-xs font-semibold"
              >
                Official board
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function HireForm({ onSave, onDone }: { onSave: (seat: HireSeat) => void; onDone: () => void }) {
  const names = stampNames();
  const [title, setTitle] = useState("");
  const [org, setOrg] = useState("");
  const [href, setHref] = useState("https://");
  const [stamp, setStamp] = useState(names[0] ?? "Packet ghost");

  function submit() {
    const name = title.trim();
    const company = org.trim();
    let url = href.trim();
    if (!name || !company) return;
    if (!/^https:\/\//i.test(url)) return;
    onSave({
      id: `u-${Date.now()}`,
      title: name,
      org: company,
      place: "Posted in hall",
      stamp,
      href: url,
      board: company,
      line: `Requires ${stamp}. Apply only on the official URL.`,
    });
    onDone();
  }

  return (
    <form
      className="space-y-3 rounded-2xl bg-surface p-5 shadow-border"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Require a stamp</p>
      <label className="block text-xs font-semibold">
        Role
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 min-h-11 w-full rounded-2xl bg-elevated px-3 text-sm outline-none"
          placeholder="Cloud security intern"
        />
      </label>
      <label className="block text-xs font-semibold">
        Organization
        <input
          value={org}
          onChange={(e) => setOrg(e.target.value)}
          className="mt-1 min-h-11 w-full rounded-2xl bg-elevated px-3 text-sm outline-none"
          placeholder="Your firm"
        />
      </label>
      <label className="block text-xs font-semibold">
        Stamp
        <select
          value={stamp}
          onChange={(e) => setStamp(e.target.value)}
          className="mt-1 min-h-11 w-full rounded-2xl bg-elevated px-3 text-sm outline-none"
        >
          {names.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-semibold">
        Official apply URL (https)
        <input
          value={href}
          onChange={(e) => setHref(e.target.value)}
          className="mt-1 min-h-11 w-full rounded-2xl bg-elevated px-3 text-sm outline-none"
          placeholder="https://"
        />
      </label>
      <p className="text-[11px] text-subtle">HTTPS only. We do not host applications. No ads.</p>
      <button type="submit" className="min-h-11 w-full rounded-full bg-primary text-xs font-semibold text-primary-fg">
        Seat the hire
      </button>
    </form>
  );
}
