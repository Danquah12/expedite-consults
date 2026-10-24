import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { listFailedSignIns, listMembers, setHold } from "@/lib/command-api";
import { DeskHead } from "@/components/desk/DeskHead";

export const Route = createFileRoute("/desk/users")({ component: DeskUsers });

function signedWhen(value?: string) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return {
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    date: d.toLocaleDateString("en-US"),
  };
}

const HOLDS = ["active", "verified", "suspended", "locked", "disabled"] as const;

function MemberGroup({
  title,
  rows,
  pick,
  onPick,
  empty,
}: {
  title: string;
  rows: { id: string; name: string; campus: string; status: string; last?: string; live: boolean; avatar: string; kind: string }[];
  pick: string | null;
  onPick: (id: string) => void;
  empty: string;
}) {
  return (
    <section className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
        {title}
        <span className="ml-2 tabular-nums">{rows.length}</span>
      </p>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => onPick(row.id)}
              className={`flex w-full items-center gap-3 rounded-2xl bg-surface px-3 py-3 text-left shadow-border ${pick === row.id ? "ring-1 ring-primary" : ""}`}
            >
              <img src={row.avatar} alt="" className="size-10 rounded-full object-cover" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold">{row.name}</span>
                  {row.live ? <span className="size-1.5 shrink-0 rounded-full bg-ok" /> : null}
                </span>
                <span className="block truncate text-xs text-muted">{row.campus || "No email"}</span>
                <span className="block truncate text-[11px] capitalize text-subtle">{row.live ? "signed in" : row.status}</span>
              </span>
              {signedWhen(row.last) ? (
                <span className="shrink-0 text-right leading-none">
                  <span className="block text-[12px] font-semibold tabular-nums">{signedWhen(row.last)?.time}</span>
                  <span className="mt-0.5 block text-[11px] tabular-nums text-subtle">{signedWhen(row.last)?.date}</span>
                </span>
              ) : (
                <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-subtle">{row.status}</span>
              )}
            </button>
          </li>
        ))}
        {!rows.length ? <li className="rounded-2xl bg-surface px-4 py-6 text-center text-sm text-muted">{empty}</li> : null}
      </ul>
    </section>
  );
}

function DeskUsers() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listMembers>>>([]);
  const [misses, setMisses] = useState<Awaited<ReturnType<typeof listFailedSignIns>>>([]);
  const [q, setQ] = useState("");
  const [pick, setPick] = useState<string | null>(null);
  const [status, setStatus] = useState<(typeof HOLDS)[number]>("suspended");
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("7 days");
  const [note, setNote] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const load = (query = q) => {
    void listMembers({ data: query })
      .then((next) => {
        setErr(null);
        setRows(next);
        setReady(true);
      })
      .catch((caught: unknown) => {
        setRows([]);
        setReady(true);
        setErr(caught instanceof Error ? caught.message : "Could not load members");
      });
    void listFailedSignIns().then(setMisses).catch(() => setMisses([]));
  };
  useEffect(() => {
    const t = setTimeout(() => load(q), 200);
    const poll = setInterval(() => load(q), 5000);
    return () => {
      clearTimeout(t);
      clearInterval(poll);
    };
  }, [q]);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => `${r.name} ${r.username} ${r.title} ${r.campus}`.toLowerCase().includes(s));
  }, [rows, q]);
  const liveRows = filtered.filter((r) => r.live);
  const otherRows = filtered.filter((r) => !r.live);
  const people = filtered.filter((r) => r.kind === "registered").length;
  const member = rows.find((r) => r.id === pick) ?? null;

  return (
    <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-3">
        <DeskHead
          kicker="Users"
          title="Directory"
          note="This is every account saved on this website. Someone who only tapped Google and got turned away is not a member yet. They stay in the failed list until they finish with email and a password."
        />
        {err ? <p className="text-sm text-live">{err}</p> : null}
        <p className="text-xs text-subtle">
          {liveRows.length} signed in now · {people} {people === 1 ? "account" : "accounts"}. This list is only for the website in the address bar. On Campus on a different address is a different list.
        </p>
        <input
          className="min-h-11 w-full rounded-xl bg-elevated px-3 text-sm"
          placeholder="Name, email, campus"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {!rows.length && !ready ? <div className="h-24 animate-pulse rounded-2xl bg-elevated" /> : null}
        {ready ? (
          <>
            <MemberGroup title="Signed in now" rows={liveRows} pick={pick} onPick={setPick} empty="No one is signed in on this site right now." />
            <MemberGroup title="Not signed in" rows={otherRows} pick={pick} onPick={setPick} empty={liveRows.length ? "Everyone with an account is signed in now." : "No accounts in this database yet. A sign-in on the preview does not appear on the published site."} />
          </>
        ) : null}
        <div className="rounded-2xl bg-surface p-4 shadow-border">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Tried to sign in and failed</p>
          <ul className="mt-3 space-y-2">
            {misses.map((row) => (
              <li key={row.id} className="rounded-xl bg-elevated px-3 py-2">
                <p className="text-sm font-semibold">{row.email}</p>
                <p className="text-xs text-muted">
                  {row.door === "desk" ? "Desk" : "Noctis"} · {/provider not found/i.test(row.reason) ? "Google did not open an account. No member was saved." : row.reason}
                </p>
                <p className="text-[11px] tabular-nums text-subtle">
                  {signedWhen(row.at)?.time} {signedWhen(row.at)?.date}
                </p>
                <p className="text-[11px] text-subtle">{row.where}</p>
                <p className="text-[11px] text-subtle">{row.from}</p>
              </li>
            ))}
            {!misses.length ? <li className="text-sm text-muted">No failed sign-ins yet.</li> : null}
          </ul>
        </div>
      </div>
      <aside className="rounded-2xl bg-surface p-4 shadow-border lg:sticky lg:top-4 h-fit">
        {member ? (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">360° profile</p>
            <p className="mt-2 text-sm font-semibold">{member.name}</p>
            <p className="text-xs text-muted">
              @{member.username} · {member.kind} · {member.status}
            </p>
            {member.kind === "registered" && signedWhen(member.signedIn?.at || member.last) ? (
              <div className="mt-3 space-y-2 text-sm">
                <p>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Signed in</span>
                  <span className="font-semibold tabular-nums">{signedWhen(member.signedIn?.at || member.last)?.time}</span>
                  <span className="ml-2 tabular-nums text-muted">{signedWhen(member.signedIn?.at || member.last)?.date}</span>
                </p>
                <p>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Location</span>
                  {member.signedIn?.where || "Place not recorded yet"}
                </p>
                <p>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Login coming from</span>
                  {member.signedIn?.from || "Not recorded"}
                </p>
                <p>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Account created</span>
                  <span className="tabular-nums">{signedWhen(member.created?.at)?.date} {signedWhen(member.created?.at)?.time}</span>
                  <span className="mt-1 block">{member.created?.where || "Place was not recorded"}</span>
                </p>
              </div>
            ) : null}
            <p className="mt-3 text-xs text-subtle">Activity, posts, and followers stay on the clinic. Desk holds classification, warnings, and security — not private messages.</p>
            <form
              className="mt-4 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                setNote(null);
                void setHold({ data: { userId: member.id, status, reason, duration } })
                  .then(() => {
                    setReason("");
                    setNote("Hold written to the audit log.");
                    load();
                  })
                  .catch((err: unknown) => setNote(err instanceof Error ? err.message : "Failed"));
              }}
            >
              <select className="min-h-11 w-full rounded-xl bg-elevated px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value as (typeof HOLDS)[number])}>
                {HOLDS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <input className="min-h-11 w-full rounded-xl bg-elevated px-3 text-sm" placeholder="Reason (required)" value={reason} onChange={(e) => setReason(e.target.value)} required />
              <input className="min-h-11 w-full rounded-xl bg-elevated px-3 text-sm" placeholder="Duration" value={duration} onChange={(e) => setDuration(e.target.value)} />
              <button type="submit" className="flex min-h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-fg">
                Confirm action
              </button>
              {note ? <p className="text-xs text-muted">{note}</p> : null}
            </form>
          </>
        ) : (
          <p className="text-sm text-muted">Select a member.</p>
        )}
      </aside>
    </div>
  );
}
