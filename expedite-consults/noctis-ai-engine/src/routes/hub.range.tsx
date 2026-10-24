import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { RANGE_LOOP, RANGE_ROOMS } from "@/lib/cyber-careers";
import { SOURCE } from "@/lib/source";
import { useFeedStore } from "@/lib/feed-store";

export const Route = createFileRoute("/hub/range")({ component: RangePage });

function RangePage() {
  const stamps = useFeedStore((s) => s.earnedStamps);

  return (
    <AppShell>
      <ClinicFrame>
        <header className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Cyber range · {SOURCE}</p>
          <h1 className="mt-1 font-display text-2xl font-semibold">Isolated rooms. Hypothetical tenants.</h1>
          <p className="mt-2 text-sm text-muted">{RANGE_LOOP.join(" → ")}</p>
          <p className="mt-2 text-[11px] text-subtle">We do not attach to your cloud. We do not copy vendor labs.</p>
        </header>
        <ul className="space-y-3">
          {RANGE_ROOMS.map((room) => {
            const held = stamps.includes(room.credential);
            return (
              <li key={room.id} className="rounded-2xl bg-surface p-5 shadow-border">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle">{room.env}</p>
                <h2 className="mt-1 font-display text-lg font-semibold">{room.title}</h2>
                <p className="mt-1 text-sm text-muted">
                  {held ? `Credential held: ${room.credential}` : `Earn: ${room.credential}`}
                </p>
                <Link
                  to="/hub/lab/$id"
                  params={{ id: room.labId }}
                  className="mt-3 inline-flex min-h-11 items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg"
                >
                  Enter range
                </Link>
              </li>
            );
          })}
        </ul>
        <Link to="/hub/careers" className="text-xs font-semibold text-primary">
          Career paths
        </Link>
      </ClinicFrame>
    </AppShell>
  );
}
