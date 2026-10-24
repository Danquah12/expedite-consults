import { Link } from "@tanstack/react-router";

export function deskWhen(value: unknown, chars = 16) {
  if (value instanceof Date) return value.toISOString().slice(0, chars);
  if (typeof value === "string") return value.slice(0, chars);
  if (value == null) return "—";
  return String(value).slice(0, chars);
}

/** Full local date and clock, including seconds. */
export function deskClock(value: unknown) {
  const raw = value instanceof Date ? value.toISOString() : typeof value === "string" ? value : "";
  const t = Date.parse(raw);
  if (!Number.isFinite(t)) return deskWhen(value, 19);
  return new Date(t).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function DeskHead({ kicker, title, note }: { kicker: string; title: string; note?: string }) {
  return (
    <header className="max-w-3xl">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">{kicker}</p>
      <h1 className="mt-1.5 font-sans text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
      {note ? <p className="mt-2 text-sm leading-relaxed text-muted">{note}</p> : null}
    </header>
  );
}

export function DeskOpen({ to, label }: { to: "/" | "/music" | "/study" | "/hub" | "/openings" | "/campus" | "/ledger" | "/reels"; label: string }) {
  return (
    <Link to={to} className="inline-flex min-h-9 items-center rounded-full bg-elevated px-3 text-xs font-semibold text-fg">
      Open on Noctis · {label}
    </Link>
  );
}

export function DeskStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-surface px-4 py-3 shadow-border">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-subtle">{label}</p>
      <p className="mt-1.5 font-sans text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
    </div>
  );
}

export function DeskBars({ rows }: { rows: { label: string; n: number }[] }) {
  const max = Math.max(...rows.map((r) => r.n), 1);
  return (
    <ul className="space-y-2.5">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="mb-1 flex justify-between text-xs">
            <span>{row.label}</span>
            <span className="tabular-nums text-subtle">{row.n}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((row.n / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
