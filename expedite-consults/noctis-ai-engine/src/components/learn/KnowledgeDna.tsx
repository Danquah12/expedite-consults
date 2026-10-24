import { useState } from "react";
import { knowledgeDna } from "@/lib/insight";
import { hallDrilling, hallStrand } from "@/lib/campus-live";
import { TREES } from "@/lib/learn";
import { useFeedStore } from "@/lib/feed-store";
import { cn } from "@/lib/utils";
import { readDna } from "@/lib/hall-record";

export function KnowledgeDna({ beat = 0, live = false, compact = false }: { beat?: number; live?: boolean; compact?: boolean }) {
  const passed = useFeedStore((s) => s.drillPassed);
  const rows = knowledgeDna(passed);
  const extra = [
    { name: "Leadership", pct: 0, share: 0 },
    { name: "AI", pct: 0, share: 0 },
    { name: "Cloud computing", pct: 0, share: 0 },
    { name: "Engineering", pct: 0, share: 0 },
  ];
  const boost = readDna();
  const shown = [...rows, ...extra].map((row) => ({ ...row, pct: Math.max(row.pct, boost[row.name] ?? 0) }));
  const [full, setFull] = useState(false);
  const ranked = shown.slice().sort((a, b) => b.pct - a.pct);
  const top = ranked[0];
  const visible = compact && !full ? ranked.slice(0, 5) : shown;

  return (
    <section>
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
        {live ? <span className="live-pulse size-1.5 rounded-full bg-primary" /> : null}
        Knowledge DNA
      </p>
      <div className="mt-3 space-y-2">
        {visible.map((r) => {
          const tree = TREES.find((t) => t.name === r.name);
          const hall = live && tree ? hallStrand(tree.id, beat) : 0;
          const drilling = live && tree ? hallDrilling(tree.id, beat) : 0;
          return (
            <div key={r.name}>
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="truncate">{r.name}</span>
                <span className="flex items-baseline gap-1.5 font-mono tabular-nums text-muted">
                  {live && drilling ? <span className="text-[10px] text-subtle">{drilling}</span> : null}
                  <span>{r.pct}%</span>
                </span>
              </div>
              <div className={cn("relative mt-1 h-1.5 overflow-hidden rounded-full bg-elevated", live && "dna-scan")}>
                {live ? (
                  <span className="dna-fill absolute inset-y-0 left-0 rounded-full bg-muted/55" style={{ width: `${hall}%` }} />
                ) : null}
                <span className="dna-fill relative block h-full rounded-full bg-primary" style={{ width: `${r.pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      {compact ? (
        <button type="button" onClick={() => setFull((open) => !open)} className="mt-3 text-xs font-semibold text-primary">
          {full ? "Top 5" : "View full DNA"}
        </button>
      ) : null}
      {top && top.pct >= 50 ? (
        <p className="mt-3 text-xs text-subtle">Heavy on {top.name}.</p>
      ) : live ? (
        <p className="mt-3 text-xs text-subtle">Hall strands drift. Yours color when you pass a drill.</p>
      ) : (
        <p className="mt-3 text-xs text-subtle">Pass a drill to color a strand. The map stays private.</p>
      )}
    </section>
  );
}
