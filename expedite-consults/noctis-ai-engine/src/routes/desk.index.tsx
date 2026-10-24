import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { commandOverview } from "@/lib/command-api";
import { listAudit } from "@/lib/admin-api";
import { COMMAND_MAP, HEALTH } from "@/lib/command-catalog";
import { listMemberEvidence } from "@/lib/activity-api";
import { DeskBars, DeskHead, DeskStat, deskClock } from "@/components/desk/DeskHead";

export const Route = createFileRoute("/desk/")({ component: DeskHome });

const RANGES = [
  { id: "1" as const, label: "Today" },
  { id: "7" as const, label: "7 days" },
  { id: "30" as const, label: "30 days" },
  { id: "90" as const, label: "90 days" },
];

function DeskHome() {
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("7");
  const [stats, setStats] = useState<Awaited<ReturnType<typeof commandOverview>> | null>(null);
  const [audit, setAudit] = useState<Awaited<ReturnType<typeof listAudit>>>([]);
  const [acts, setActs] = useState<Awaited<ReturnType<typeof listMemberEvidence>>>([]);
  const [checked, setChecked] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setErr(null);
    void commandOverview({ data: range })
      .then(setStats)
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : "Overview unavailable"));
    void listAudit()
      .then(setAudit)
      .catch(() => setAudit([]));
  }, [range]);

  useEffect(() => {
    let stop = false;
    const load = () => {
      void listMemberEvidence()
        .then((rows) => {
          if (stop) return;
          setActs(rows);
          setChecked(new Date().toISOString());
        })
        .catch(() => {
          if (!stop) setActs([]);
        });
    };
    load();
    const timer = window.setInterval(load, 5000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <DeskHead
          kicker="Overview"
          title="Live command"
          note="Desk reads Noctis in real time — members, ledger pulls, reports, and holds. Private messages stay off this plane."
        />
        <div className="flex flex-wrap gap-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${range === r.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <section className="flex flex-wrap items-center gap-3 rounded-2xl bg-surface px-4 py-3 shadow-border">
        <span className="size-2 rounded-full bg-ok" />
        <p className="text-sm font-medium">Noctis data plane connected</p>
        <p className="text-xs text-subtle">Users · ingest ledger · trust queue · jobs</p>
      </section>

      {err ? <p className="text-xs text-live">{err}</p> : null}
      {stats ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          <DeskStat label="Accounts" value={stats.accounts} />
          <DeskStat label="Signed in" value={stats.signedIn} />
          <DeskStat label="Notes" value={stats.notes} />
          <DeskStat label="Ledger" value={stats.clips} />
          <DeskStat label="Mods" value={stats.mods} />
          <DeskStat label="Cases" value={stats.cases} />
          <DeskStat label="Holds" value={stats.holds} />
          <DeskStat label="Operators" value={stats.operators} />
        </div>
      ) : (
        <div className="h-28 animate-pulse rounded-2xl bg-elevated" />
      )}

      <section className="rounded-2xl bg-surface p-5 shadow-border">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-subtle">Live activity</p>
          <p className="text-[11px] text-subtle">{checked ? deskClock(checked) : "Checking…"}</p>
          <Link to="/desk/notes" className="text-xs font-semibold text-muted underline-offset-4 hover:underline">
            Open notes
          </Link>
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          {acts.length ? (
            acts.slice(0, 8).map((row) => (
              <li key={row.id} className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate">
                  <span className="font-semibold">{row.who}</span>
                  <span className="text-muted"> · {row.detail}</span>
                </span>
                <span className="shrink-0 text-[11px] text-subtle">{deskClock(row.at)}</span>
              </li>
            ))
          ) : (
            <li className="text-sm text-muted">No activity stored on this site yet.</li>
          )}
        </ul>
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-subtle">Trust queue</p>
          <div className="mt-4">
            <DeskBars rows={stats?.trust.length ? stats.trust : [{ label: "No open cases", n: 0 }]} />
          </div>
          <Link to="/desk/safety" className="mt-4 inline-block text-xs font-semibold text-muted underline-offset-4 hover:underline">
            Open safety
          </Link>
        </section>
        <section className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-subtle">Ledger by hall</p>
          <div className="mt-4">
            <DeskBars rows={stats?.halls.length ? stats.halls : [{ label: "Pull the ledger to fill halls", n: 0 }]} />
          </div>
        </section>
      </div>

      <section className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-subtle">Command map</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {COMMAND_MAP.map((g) => (
            <div key={g.group}>
              <p className="text-[13px] font-semibold">{g.group}</p>
              <ul className="mt-2 space-y-1">
                {g.items.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="flex items-center justify-between gap-2 py-0.5 text-sm text-muted hover:text-fg">
                      <span>{item.label}</span>
                      <span className="text-[10px] uppercase tracking-wide text-subtle">{item.state}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-subtle">Audit</p>
          <ul className="mt-3 space-y-2 text-sm">
            {audit.length ? (
              audit.slice(0, 8).map((row) => (
                <li key={row.id} className="flex justify-between gap-3 border-b border-border py-2 last:border-0">
                  <span className="text-muted">
                    {row.action}
                    {row.detail ? ` · ${row.detail}` : ""}
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-subtle">{deskClock(row.created_at)}</span>
                </li>
              ))
            ) : (
              <li className="text-subtle">No operator actions yet.</li>
            )}
          </ul>
          <Link to="/desk/audit" className="mt-3 inline-block text-xs font-semibold text-muted underline-offset-4 hover:underline">
            Full log
          </Link>
        </section>
        <section className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-subtle">System health</p>
          <ul className="mt-3 space-y-2">
            {HEALTH.map((h) => (
              <li key={h.id} className="flex items-center justify-between text-sm">
                <span>{h.label}</span>
                <span className={h.state === "healthy" ? "flex items-center gap-2 text-xs font-medium text-ok" : "flex items-center gap-2 text-xs font-medium text-live"}>
                  <span className={`size-1.5 rounded-full ${h.state === "healthy" ? "bg-ok" : "bg-live"}`} />
                  {h.state}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
