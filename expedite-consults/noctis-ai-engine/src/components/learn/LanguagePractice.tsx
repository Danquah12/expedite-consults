import { useState } from "react";
import { LANG_LOOP, LANGS } from "@/lib/ingest-sources";
import { useFeedStore } from "@/lib/feed-store";
import { cn } from "@/lib/utils";

export function LanguagePractice() {
  const [lang, setLang] = useState<(typeof LANGS)[number]>("English");
  const openModal = useFeedStore((s) => s.openModal);

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-border">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Language hall</p>
      <h2 className="mt-1 font-display text-lg font-semibold">Not another playlist. A loop.</h2>
      <p className="mt-1 text-sm text-muted">{LANG_LOOP.join(" → ")}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {LANGS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setLang(item)}
            className={cn(
              "min-h-11 rounded-full px-3 text-xs font-semibold",
              lang === item ? "bg-primary text-primary-fg" : "bg-elevated",
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted">
        {lang}: listen to the clip, then speak a take. The studio is the conversation partner.
      </p>
      <button
        type="button"
        onClick={() => openModal({ type: "recorder" })}
        className="mt-3 min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
      >
        Speak {lang} on air
      </button>
    </section>
  );
}

export function SpeakCoach() {
  const openModal = useFeedStore((s) => s.openModal);
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-border">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Communication</p>
      <h2 className="mt-1 font-display text-lg font-semibold">The coach is the studio.</h2>
      <p className="mt-1 text-sm text-muted">
        Public speaking, interviews, debate, storytelling. Write the prompt. Record a timed take. Teleprompter follows your voice.
      </p>
      <button
        type="button"
        onClick={() => openModal({ type: "recorder" })}
        className="mt-3 min-h-11 rounded-full bg-elevated px-4 text-xs font-semibold"
      >
        Record a 60s take
      </button>
    </section>
  );
}