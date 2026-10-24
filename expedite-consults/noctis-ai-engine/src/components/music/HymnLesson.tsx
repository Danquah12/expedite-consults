import { useState } from "react";
import { BookOpen, History, Music2, Star } from "lucide-react";
import type { FeedPost } from "@/lib/feed-data";
import { hymnForm, hymnPeriod, readSavedHymns, toggleSavedHymn, type HymnCard } from "@/lib/hymn-desk";
import { SOURCE } from "@/lib/source";
import { cn } from "@/lib/utils";

type Pane = "listen" | "verse" | "history" | "scripture" | "form" | "quiz";

export function HymnLesson({
  hymn,
  film,
  onListen,
  featured,
}: {
  hymn: HymnCard;
  film?: FeedPost;
  onListen: (id?: string) => void;
  featured?: boolean;
}) {
  const [pane, setPane] = useState<Pane>("listen");
  const [saved, setSaved] = useState(() => readSavedHymns().includes(hymn.id));
  const [pick, setPick] = useState<string | null>(null);

  return (
    <article className="rounded-2xl bg-surface p-4 shadow-border sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{featured ? "Hymn of the day" : "Learn the hymn"}</p>
      <div className="mt-1 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-semibold">{hymn.title}</h2>
          <p className="mt-1 text-sm text-muted">
            {hymn.writer} · {hymn.year} · {hymnPeriod(hymn)}
          </p>
          <p className="mt-0.5 text-[11px] text-subtle">
            {hymn.rights === "pd" ? "Text public domain · recording embedded" : "Official embed · not re-hosted"}
          </p>
        </div>
        <button
          type="button"
          aria-pressed={saved}
          onClick={() => setSaved(toggleSavedHymn(hymn.id).includes(hymn.id))}
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-full",
            saved ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
          )}
        >
          <Star className={cn("size-4", saved && "fill-current")} />
          <span className="sr-only">{saved ? "Saved" : "Save"}</span>
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(
          [
            ["listen", "Listen"],
            ["verse", "Lyrics"],
            ["history", "History"],
            ["scripture", "Scripture"],
            ["form", "Form"],
            ["quiz", "Quiz"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setPane(id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold",
              pane === id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-4 text-sm leading-relaxed text-fg">
        {pane === "listen" ? (
          <div>
            <p className="text-muted">{hymn.theme}</p>
            <button
              type="button"
              onClick={() => onListen(film?.id)}
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
            >
              <Music2 className="size-4" />
              {film ? "Play this hymn" : "Find a performance in the hall"}
            </button>
            <p className="mt-2 text-[11px] text-subtle">Noctis film · {SOURCE}</p>
          </div>
        ) : null}
        {pane === "verse" ? <blockquote className="border-l-2 border-primary pl-3 italic text-muted">{hymn.verse}</blockquote> : null}
        {pane === "history" ? (
          <p className="flex gap-2 text-muted">
            <History className="mt-0.5 size-4 shrink-0 text-primary" />
            {hymn.history}
          </p>
        ) : null}
        {pane === "scripture" ? (
          <p className="flex gap-2 text-muted">
            <BookOpen className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              <span className="font-semibold text-fg">{hymn.scripture}</span>
              <span className="mt-1 block">{hymn.theme}</span>
            </span>
          </p>
        ) : null}
        {pane === "form" ? (
          <p className="text-muted">
            <span className="font-semibold text-fg">{hymnForm(hymn)}</span>
            <span className="mt-1 block">Piano, organ, guitar, and choir versions stay on the official embed. We do not re-host the recording.</span>
          </p>
        ) : null}
        {pane === "quiz" ? (
          <div className="space-y-2">
            <p className="font-semibold">{hymn.prompt}</p>
            {[
              { id: "a", label: hymn.ok, ok: true },
              { id: "b", label: hymn.wrong[0], ok: false },
              { id: "c", label: hymn.wrong[1], ok: false },
            ].map((opt) => {
              const shown = pick !== null;
              const on = pick === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPick(opt.id)}
                  className={cn(
                    "flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm",
                    shown && opt.ok ? "bg-primary/15 text-fg" : on ? "bg-elevated text-fg" : "bg-elevated text-muted",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
            {pick ? <p className="text-xs text-muted">{pick === "a" ? "Kept." : "Look again at the text."}</p> : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
