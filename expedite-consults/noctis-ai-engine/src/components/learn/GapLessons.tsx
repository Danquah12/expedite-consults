import { useEffect, useState } from "react";
import { listKnowledgeGaps, passKnowledgeGap } from "@/lib/customer-api";
import { gapLesson } from "@/lib/knowledge-gaps";
import { cn } from "@/lib/utils";

type Lesson = { concept: string; house: string; passes: number };

export function GapLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [pick, setPick] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    void listKnowledgeGaps()
      .then((roll) => setLessons(roll.lessons))
      .catch(() => setLessons([]));
  }, []);

  if (!lessons.length) return null;
  const current = lessons.find((row) => row.concept === open) ?? null;
  const draft = current ? gapLesson(current.concept) : null;
  const choices = draft
    ? [
        { id: "ok", label: draft.answer, ok: true },
        { id: "w1", label: draft.wrong[0], ok: false },
        { id: "w2", label: draft.wrong[1], ok: false },
      ]
    : [];

  return (
    <section className="rounded-2xl bg-surface p-4 shadow-border">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Seated from a gap</p>
      <p className="mt-1 text-sm text-muted">These lessons exist because stored checks showed more misses than passes.</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {lessons.map((row) => (
          <button
            key={row.concept}
            type="button"
            onClick={() => {
              setOpen(row.concept);
              setPick(null);
              setNote(null);
            }}
            className={cn("min-h-11 rounded-full px-3 text-xs font-semibold", open === row.concept ? "bg-primary text-primary-fg" : "bg-elevated text-muted")}
          >
            {row.concept}
          </button>
        ))}
      </div>
      {draft && current ? (
        <div className="mt-3">
          <p className="text-sm leading-relaxed">{draft.line}</p>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm">
            {draft.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="mt-3 text-sm font-semibold">{draft.prompt}</p>
          <div className="mt-2 space-y-1.5">
            {choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => {
                  setPick(choice.id);
                  if (!choice.ok) {
                    setNote("That does not close the gap.");
                    return;
                  }
                  void passKnowledgeGap({ data: { name: current.concept } })
                    .then(() => setNote("Pass recorded. The next count should show this concept moving."))
                    .catch(() => setNote("The check is right. The count could not be stored."));
                }}
                className={cn("w-full rounded-xl px-3 py-2 text-left text-sm", pick === choice.id ? "bg-primary text-primary-fg" : "bg-elevated")}
              >
                {choice.label}
              </button>
            ))}
          </div>
          {note ? <p className="mt-2 text-xs text-primary">{note}</p> : null}
          <p className="mt-2 text-[11px] text-muted">{current.passes} recorded passes on this lesson.</p>
        </div>
      ) : null}
    </section>
  );
}
