import { useState } from "react";
import { CIVIC_LESSONS } from "@/lib/civic-literacy";
import { useFeedStore } from "@/lib/feed-store";
import { cn } from "@/lib/utils";

export function CivicDesk() {
  const [openId, setOpenId] = useState(CIVIC_LESSONS[0]?.id ?? "");
  const [pick, setPick] = useState<string | null>(null);
  const [claim, setClaim] = useState("");
  const openModal = useFeedStore((s) => s.openModal);
  const lesson = CIVIC_LESSONS.find((row) => row.id === openId) ?? CIVIC_LESSONS[0];
  if (!lesson) return null;
  const choices = [
    { id: "ok", label: lesson.answer, ok: true },
    { id: "w1", label: lesson.wrong[0], ok: false },
    { id: "w2", label: lesson.wrong[1], ok: false },
  ];
  const chosen = choices.find((row) => row.id === pick);

  return (
    <div className="space-y-3">
      <section className="rounded-2xl bg-surface p-4 shadow-border">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Civic knowledge</p>
        <p className="mt-1 text-sm leading-relaxed">Tools for understanding and taking part. Not instructions about which side to take.</p>
        <label className="mt-3 block text-[11px] font-semibold uppercase tracking-wider text-muted" htmlFor="civic-claim">
          Analyze a claim
        </label>
        <textarea
          id="civic-claim"
          value={claim}
          onChange={(event) => setClaim(event.target.value)}
          placeholder="Paste a claim. Example: Scientists have proven X."
          className="mt-1 min-h-20 w-full rounded-xl bg-elevated px-3 py-2 text-sm outline-none"
        />
        <button
          type="button"
          disabled={claim.trim().length < 8}
          onClick={() => openModal({ type: "analyze", claim: claim.trim() })}
          className="mt-2 min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg disabled:opacity-40"
        >
          Analyze
        </button>
        <button
          type="button"
          disabled={claim.trim().length < 8}
          onClick={() => openModal({ type: "think", claim: claim.trim() })}
          className="ml-2 mt-2 min-h-11 rounded-full bg-elevated px-4 text-xs font-semibold disabled:opacity-40"
        >
          Think
        </button>
      </section>
      <div className="hall-scroll flex gap-1.5 pb-1">
        {CIVIC_LESSONS.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => {
              setOpenId(row.id);
              setPick(null);
            }}
            className={cn(
              "min-h-11 shrink-0 rounded-full px-3 text-xs font-semibold",
              row.id === lesson.id ? "bg-primary text-primary-fg" : "bg-surface text-muted",
            )}
          >
            {row.title.replace(/^How (to |)/, "")}
          </button>
        ))}
      </div>
      <article className="rounded-2xl bg-surface p-4 shadow-border">
        <h2 className="font-display text-xl font-semibold">{lesson.title}</h2>
        <p className="mt-2 text-sm leading-relaxed">{lesson.tool}</p>
        <ol className="mt-3 list-decimal space-y-1 pl-4 text-sm">
          {lesson.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted">Check</p>
        <p className="mt-1 text-sm font-semibold">{lesson.prompt}</p>
        <div className="mt-2 space-y-1.5">
          {choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => setPick(choice.id)}
              className={cn(
                "w-full rounded-xl px-3 py-2 text-left text-sm",
                pick === choice.id ? "bg-primary text-primary-fg" : "bg-elevated",
              )}
            >
              {choice.label}
            </button>
          ))}
        </div>
        {chosen ? <p className="mt-2 text-xs text-primary">{chosen.ok ? "That is the tool." : "That answer picks a side or skips the document. Try the tool."}</p> : null}
        <a href={lesson.href} target="_blank" rel="noreferrer" className="mt-4 block text-sm font-semibold text-primary">
          {lesson.source}
        </a>
        <p className="mt-2 text-[11px] text-muted">This lesson does not tell you how to vote, which party to join, or which cause to serve.</p>
      </article>
    </div>
  );
}
