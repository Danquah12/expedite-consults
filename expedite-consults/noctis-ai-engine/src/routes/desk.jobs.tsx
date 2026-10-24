import { createFileRoute } from "@tanstack/react-router";
import { HIRE_SEATS } from "@/lib/hire-desk";
import { DeskHead, DeskOpen, DeskStat } from "@/components/desk/DeskHead";

export const Route = createFileRoute("/desk/jobs")({ component: DeskJobs });

function DeskJobs() {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <DeskHead
        kicker="Jobs"
        title="Openings desk"
        note="Official boards only. The clinic’s Openings tab reads this list. Flag a listing from Trust if a recruiter looks off-board."
      />
      <DeskOpen to="/openings" label="Career Navigator" />
      <DeskStat label="Live seats" value={HIRE_SEATS.length} />
      <ul className="space-y-2">
        {HIRE_SEATS.map((j) => (
          <li key={j.id} className="rounded-2xl bg-surface px-4 py-3 shadow-border">
            <p className="text-sm font-semibold">{j.title}</p>
            <p className="mt-1 text-xs text-muted">
              {j.org} · {j.place} · stamp {j.stamp}
            </p>
            <a href={j.href} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold underline-offset-4 hover:underline">
              Official board
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
