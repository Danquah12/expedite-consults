import { useState } from "react";
import { cn } from "@/lib/utils";

const CLAIMS = [
  {
    id: "climate",
    claim: "Global mean temperature has risen since 1880.",
    source: "NOAA / NASA records",
    picks: [
      { id: "s", label: "Supported — instrument record agrees", ok: "supported" },
      { id: "o", label: "Opinion — a preference, not a measurement", ok: "opinion" },
      { id: "c", label: "Contradicted — the record is flat", ok: "wrong" },
    ],
    verdict: "supported" as const,
    note: "Treat the claim as evidence-bearing. Then read the method, not the headline.",
  },
  {
    id: "ai",
    claim: "Large language models understand the world the way people do.",
    source: "Philosophy of AI seminar",
    picks: [
      { id: "s", label: "Supported — next-token skill is understanding", ok: "wrong" },
      { id: "u", label: "Unclear — depends what “understand” means", ok: "unclear" },
      { id: "c", label: "Contradicted — they have no world model at all", ok: "wrong" },
    ],
    verdict: "unclear" as const,
    note: "Define the term before you score the claim. That is the philosophy move.",
  },
  {
    id: "policy",
    claim: "This platform should ban every entertainment clip.",
    source: "Hall argument",
    picks: [
      { id: "s", label: "Supported — learning requires silence", ok: "wrong" },
      { id: "o", label: "Opinion — a value, not a fact", ok: "opinion" },
      { id: "c", label: "Contradicted by the rebalance rule", ok: "wrong" },
    ],
    verdict: "opinion" as const,
    note: "Separate ought from is. Then argue the value in the open.",
  },
] as const;

export function ArgumentLab() {
  const [id, setId] = useState<(typeof CLAIMS)[number]["id"]>("climate");
  const [pick, setPick] = useState<string | null>(null);
  const claim = CLAIMS.find((c) => c.id === id)!;
  const chosen = claim.picks.find((p) => p.id === pick);

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-border">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Argument lab</p>
      <h2 className="mt-1 font-display text-lg font-semibold">Claim, then evidence. Not a vibe.</h2>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {CLAIMS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setId(c.id);
              setPick(null);
            }}
            className={cn(
              "min-h-11 rounded-full px-3 text-xs font-semibold",
              id === c.id ? "bg-primary text-primary-fg" : "bg-elevated",
            )}
          >
            {c.source}
          </button>
        ))}
      </div>
      <p className="mt-4 font-display text-base font-semibold leading-snug">{claim.claim}</p>
      <p className="mt-1 text-xs text-subtle">{claim.source}</p>
      <div className="mt-3 space-y-2">
        {claim.picks.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPick(p.id)}
            className={cn(
              "flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm",
              pick === p.id ? "bg-primary text-primary-fg" : "bg-elevated",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      {chosen ? (
        <p className="mt-3 text-sm text-muted">
          {chosen.ok === claim.verdict ? "That is the move." : "Score the claim, not the mood."} {claim.note}
        </p>
      ) : null}
    </section>
  );
}