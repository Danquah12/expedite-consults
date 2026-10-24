import { useState } from "react";
import { loadCommunityBrief } from "@/lib/customer-api";

type Brief = NonNullable<Awaited<ReturnType<typeof loadCommunityBrief>>>;

export function CommunityBrief({ crewId }: { crewId: string }) {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "empty" | "ready">("idle");

  function load() {
    setState("loading");
    void loadCommunityBrief({ data: { crewId } })
      .then((next) => {
        if (!next) {
          setState("empty");
          return;
        }
        setBrief(next);
        setState("ready");
      })
      .catch(() => setState("empty"));
  }

  if (state === "idle") {
    return (
      <button type="button" onClick={load} className="mt-3 text-xs font-semibold text-primary">
        This week
      </button>
    );
  }
  if (state === "loading") return <p className="mt-3 text-xs text-muted">Counting stored discussions from the last 7 days.</p>;
  if (!brief || state === "empty") return <p className="mt-3 text-xs text-muted">No brief is stored for this community.</p>;

  return (
    <div className="mt-3 space-y-2 rounded-xl bg-elevated p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{brief.title}</p>
      <p className="text-sm font-semibold">{brief.discussions} discussions stored this week</p>
      <p className="text-[11px] text-muted">Only comments that name a subject in this community. A seed member count is not used.</p>
      <div>
        <p className="text-xs font-semibold">Most discussed</p>
        {brief.subjects.length ? (
          <ol className="mt-1 list-decimal pl-4 text-sm">
            {brief.subjects.map((row) => (
              <li key={row.name}>{row.name} · {row.count}</li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted">No subject was named in a stored comment.</p>
        )}
      </div>
      <p className="text-sm">Unanswered questions · {brief.unanswered}</p>
      <p className="text-sm">Lessons already seated · {brief.lessons}</p>
      <p className="text-sm">Concepts with more misses than passes · {brief.misunderstood.length ? brief.misunderstood.join(", ") : "none stored"}</p>
      <div>
        <p className="text-xs font-semibold">Reading from the comments</p>
        {brief.reading.length ? (
          <ul className="mt-1 space-y-1">
            {brief.reading.map((href) => (
              <li key={href}>
                <a href={href} target="_blank" rel="noreferrer" className="text-xs text-primary">
                  {href}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No link was written in those comments.</p>
        )}
      </div>
    </div>
  );
}
