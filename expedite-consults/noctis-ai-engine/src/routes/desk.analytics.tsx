import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { platformReport } from "@/lib/activity-api";
import { DeskHead } from "@/components/desk/DeskHead";

export const Route = createFileRoute("/desk/analytics")({ component: DeskAnalytics });

type Report = Awaited<ReturnType<typeof platformReport>>;

function Cells({ rows, empty }: { rows: Report["studied"]; empty: string }) {
  if (!rows.length) return <p className="mt-1 text-sm text-muted">{empty}</p>;
  return (
    <ul className="mt-1 space-y-1 text-sm">
      {rows.map((row) => (
        <li key={row.label}>
          {row.label} · {row.people} people · {row.events} events
        </li>
      ))}
    </ul>
  );
}

function DeskAnalytics() {
  const [report, setReport] = useState<Report | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void platformReport()
      .then((next) => {
        setReport(next);
        setErr(null);
      })
      .catch((caught: unknown) => setErr(caught instanceof Error ? caught.message : "The aggregate could not be loaded"));
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <DeskHead
        kicker="Analytics"
        title="Platform patterns"
        note={report?.note || "Counts only. A group smaller than 5 people is left out. Names and raw questions are not shown."}
      />
      {err ? <p className="rounded-xl bg-surface px-4 py-3 text-sm text-muted">{err}</p> : null}
      {report ? (
        <div className="space-y-4">
          <section className="rounded-2xl bg-surface p-4 shadow-border">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Most studied subjects</p>
            <Cells rows={report.studied} empty="No subject has 5 people yet." />
          </section>
          <section className="rounded-2xl bg-surface p-4 shadow-border">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Most difficult lessons</p>
            <Cells rows={report.difficult} empty="No lesson has more misses than passes across 5 people." />
          </section>
          <section className="rounded-2xl bg-surface p-4 shadow-border">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Drop-off</p>
            <p className="mt-1 text-sm">{report.dropoff === null ? "Hidden. Fewer than 5 people started study without a later check." : `${report.dropoff} people studied and have no later check.`}</p>
          </section>
          <section className="rounded-2xl bg-surface p-4 shadow-border">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Knowledge gaps</p>
            <Cells rows={report.gaps} empty="No gap is shared by 5 people." />
          </section>
          <section className="rounded-2xl bg-surface p-4 shadow-border">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Popular topics</p>
            <Cells rows={report.topics} empty="No topic has 5 people yet." />
          </section>
          <section className="rounded-2xl bg-surface p-4 shadow-border">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Learning progression</p>
            <p className="mt-1 text-sm">{report.progression === null ? "Hidden. Fewer than 5 people have a check after a study action." : `${report.progression} people checked something after they studied.`}</p>
          </section>
          <section className="rounded-2xl bg-surface p-4 shadow-border">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Content quality</p>
            <p className="mt-1 text-sm">{report.quality}</p>
          </section>
          <section className="rounded-2xl bg-surface p-4 shadow-border">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Search trends</p>
            <p className="mt-1 text-xs text-muted">Only the subject bucket. The search words are not stored on this page.</p>
            <Cells rows={report.searches} empty="No search subject has 5 people yet." />
          </section>
          <section className="rounded-2xl bg-surface p-4 shadow-border">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Engagement</p>
            <p className="mt-1 text-xs text-muted">Action counts. This is not minutes on screen.</p>
            <Cells rows={report.engagement} empty="No action has 5 people yet." />
          </section>
          <section className="rounded-2xl bg-surface p-4 shadow-border">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Completion</p>
            <p className="mt-1 text-sm">{report.completion === null ? "Hidden until at least 5 people have studied and 5 have passed a check." : `${report.completion}% of people who studied also passed a check.`}</p>
          </section>
        </div>
      ) : err ? null : (
        <p className="text-sm text-muted">Loading the aggregate.</p>
      )}
    </div>
  );
}
