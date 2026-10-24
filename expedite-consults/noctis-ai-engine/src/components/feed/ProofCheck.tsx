import { useMemo, useState } from "react";
import type { FeedPost } from "@/lib/feed-data";
import { proofQuestions } from "@/lib/proof-check";
import { useFeedStore } from "@/lib/feed-store";
import { XP, levelFromXp } from "@/lib/learn";
import { knowledgeDna } from "@/lib/insight";
import { dismissFurtherStudy } from "@/lib/further-study";

export function ProofCheck({ post, onDone }: { post: FeedPost; onDone: () => void }) {
  const questions = useMemo(() => proofQuestions(post), [post]);
  const [picked, setPicked] = useState<(string | null)[]>(() => questions.map(() => null));
  const [miss, setMiss] = useState<number | null>(null);
  const [won, setWon] = useState(false);
  const xp = useFeedStore((s) => s.xp);
  const passed = useFeedStore((s) => s.drillPassed);

  function pick(index: number, id: string, ok: boolean) {
    if (won) return;
    const next = picked.slice();
    next[index] = ok ? id : null;
    setPicked(next);
    if (!ok) {
      setMiss(index);
      return;
    }
    setMiss(null);
    if (next.every(Boolean)) {
      useFeedStore.getState().completeDrill(post.id);
      setWon(true);
      dismissFurtherStudy();
      window.setTimeout(onDone, 400);
    }
  }

  if (won) {
    const lvl = levelFromXp(xp);
    const strand = knowledgeDna(passed).slice().sort((a, b) => b.pct - a.pct)[0];
    return (
      <div className="rounded-2xl bg-surface p-4 shadow-border" onClick={(e) => e.stopPropagation()}>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Proof filed</p>
        <p className="mt-1 text-sm font-semibold">
          +{XP.drill} XP · {post.teach.stamp}
        </p>
        <p className="mt-1 text-xs text-muted">
          Level {lvl.level}
          {strand ? ` · ${strand.name} ${strand.pct}%` : ""}. The stamp is on your account, not just a like.
        </p>
        <button type="button" onClick={onDone} className="mt-3 min-h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-fg">
          Next clip
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
      {questions.map((q, index) => (
        <section key={q.prompt} className="rounded-2xl bg-surface p-3 shadow-border">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Proof {index + 1} of {questions.length}
          </p>
          <p className="mt-1 text-sm font-semibold">{q.prompt}</p>
          <div className="mt-2 space-y-1.5">
            {q.options.map((o) => {
              const on = picked[index] === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => pick(index, o.id, o.ok)}
                  className={`min-h-11 w-full rounded-xl px-3 text-left text-sm ${on ? "bg-primary text-primary-fg" : "bg-elevated"}`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          {miss === index ? <p className="mt-2 text-xs text-live">Not yet. Remember: {post.teach.hook}</p> : null}
        </section>
      ))}
    </div>
  );
}
