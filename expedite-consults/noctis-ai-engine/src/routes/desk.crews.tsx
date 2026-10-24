import { createFileRoute } from "@tanstack/react-router";
import { CREWS } from "@/lib/feed-data";
import { DeskHead, DeskOpen, DeskStat } from "@/components/desk/DeskHead";

export const Route = createFileRoute("/desk/crews")({ component: DeskCrews });

function DeskCrews() {
  const members = CREWS.reduce((n, c) => n + c.members, 0);
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <DeskHead kicker="Communities" title="Crews" note="Campus crews the clinic already seats. Desk watches membership and stamps — it does not post as a crew." />
      <DeskOpen to="/campus" label="Crews" />
      <div className="grid grid-cols-2 gap-2">
        <DeskStat label="Crews" value={CREWS.length} />
        <DeskStat label="Members seated" value={members.toLocaleString()} />
      </div>
      <ul className="space-y-2">
        {CREWS.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 shadow-border">
            <span>
              <span className="block text-sm font-semibold">{c.name}</span>
              <span className="block text-xs text-muted">{c.blurb}</span>
            </span>
            <span className="shrink-0 text-xs tabular-nums text-subtle">{c.members.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
