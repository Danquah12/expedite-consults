import { Link } from "@tanstack/react-router";
import { CONTROL_FAMILIES } from "@/lib/nist-desk";

export function FamiliesLesson({
  compact = false,
  intro = true,
  onPick,
}: {
  compact?: boolean;
  intro?: boolean;
  onPick?: (id: string) => void;
}) {
  const list = compact
    ? CONTROL_FAMILIES.filter((f) => ["AC", "IA", "AU", "IR", "CA", "CM", "SC", "SI", "SR", "RA", "PT"].includes(f.id))
    : CONTROL_FAMILIES;
  return (
    <section className="space-y-3">
      {intro ? (
        <header className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">800-53B · families</p>
          <h2 className="mt-1 font-display text-xl font-semibold">Select a family. Study enforces Examine next.</h2>
          <p className="mt-2 text-sm text-muted">
            800-53 is the catalog. 800-53B is the baseline. Your pick stays on the learning tab.
          </p>
        </header>
      ) : null}
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {list.map((fam) => (
          <li key={fam.id}>
            {onPick ? (
              <button
                type="button"
                onClick={() => onPick(fam.id)}
                className="block w-full rounded-2xl bg-surface p-4 text-left shadow-border"
              >
                <p className="font-mono text-[11px] text-primary">{fam.id}</p>
                <p className="font-display text-base font-semibold">{fam.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{fam.line}</p>
                <p className="mt-2 font-mono text-[10px] text-subtle">{fam.examples}</p>
                <p className="mt-1 text-[11px] font-semibold text-primary">Select · Examine on Study</p>
              </button>
            ) : (
              <Link
                to="/study"
                search={{ desk: "nist", family: fam.id, step: "examine" }}
                className="block rounded-2xl bg-surface p-4 shadow-border"
              >
                <p className="font-mono text-[11px] text-primary">{fam.id}</p>
                <p className="font-display text-base font-semibold">{fam.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{fam.line}</p>
                <p className="mt-2 font-mono text-[10px] text-subtle">{fam.examples}</p>
                <p className="mt-1 text-[11px] font-semibold text-primary">{fam.desk} · Open on Study</p>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}