import { useEffect, useState } from "react";
import { CREATOR_KINDS } from "@/lib/creator-market";
import { draftCreatorWork, listCreatorWorks, listMyWorks, publishCreatorWork } from "@/lib/creator-api";
import { teacherPack } from "@/lib/teacher-pack";
import { curatedCard } from "@/lib/knowledge-engine";
import { markCreated } from "@/lib/learning-loop";

export function CreatorMarket() {
  const [works, setWorks] = useState<Awaited<ReturnType<typeof listCreatorWorks>>>([]);
  const [mine, setMine] = useState<Awaited<ReturnType<typeof listMyWorks>>>([]);
  const [kind, setKind] = useState<(typeof CREATOR_KINDS)[number]["id"]>("lesson");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [note, setNote] = useState("");

  function load() {
    void listCreatorWorks().then(setWorks).catch(() => setWorks([]));
    void listMyWorks().then(setMine).catch(() => setMine([]));
  }

  useEffect(() => {
    load();
  }, []);

  const chosen = CREATOR_KINDS.find((item) => item.id === kind) ?? CREATOR_KINDS[1];

  return (
    <section className="rounded-2xl bg-surface p-4 shadow-border">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Creator shelf</p>
      <p className="mt-1 text-sm text-muted">A film, a lesson, or a tutor already lives on Noctis. It is listed here only after you publish it. A draft is not public. Nothing is copied from another school.</p>
      <ul className="mt-3 space-y-2">
        {works.length ? works.map((work) => (
          <li key={work.id} className="rounded-xl bg-elevated px-3 py-2 text-sm">
            <p className="font-semibold">{work.title}</p>
            <p className="text-xs text-muted">{work.kind} · {work.author}</p>
            <p className="mt-1">{work.body}</p>
          </li>
        )) : <li className="text-sm text-muted">Nothing is published yet.</li>}
      </ul>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {CREATOR_KINDS.map((item) => (
          <button key={item.id} type="button" onClick={() => setKind(item.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${item.id === kind ? "bg-primary text-primary-fg" : "bg-elevated"}`}>
            {item.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">{chosen.from}</p>
      <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" className="mt-2 min-h-11 w-full rounded-xl bg-elevated px-3 text-sm" />
      <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="The work itself" className="mt-2 min-h-24 w-full rounded-xl bg-elevated px-3 py-2 text-sm" />
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          className="min-h-11 rounded-full bg-elevated px-4 text-sm font-semibold"
          onClick={() => {
            const card = curatedCard(title);
            setBody(teacherPack(title || chosen.label, card ? { sentence: card.sentence, steps: card.steps, source: card.evidence[0]?.source || "" } : null));
          }}
        >
          Draft with Vibe
        </button>
        <button
          type="button"
          className="min-h-11 rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg"
          onClick={() => {
            void draftCreatorWork({ data: { kind, title, body } })
              .then(() => {
                markCreated();
                setNote("Saved as a draft. It is not public until you publish it.");
                setTitle("");
                setBody("");
                load();
              })
              .catch((err: unknown) => setNote(err instanceof Error ? err.message : "Sign in to save a draft."));
          }}
        >
          Save draft
        </button>
      </div>
      {mine.length ? (
        <ul className="mt-3 space-y-2">
          {mine.map((work) => (
            <li key={work.id} className="flex items-center justify-between gap-2 text-sm">
              <span>{work.title} · {work.status}</span>
              {work.status === "draft" ? (
                <button type="button" className="rounded-full bg-elevated px-3 py-1.5 text-xs font-semibold" onClick={() => void publishCreatorWork({ data: { id: work.id } }).then(() => { setNote("Published."); load(); }).catch((err: unknown) => setNote(err instanceof Error ? err.message : "Could not publish."))}>
                  Publish
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {note ? <p className="mt-2 text-sm">{note}</p> : null}
    </section>
  );
}
