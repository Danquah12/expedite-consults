import { recommendPost, sourcePipes, type DeskNote } from "@/lib/recommend-engine";
import { nextFromFilm } from "@/lib/learning-path";
import { useFeedStore } from "@/lib/feed-store";
import type { FeedPost } from "@/lib/feed-data";

function filmOf(post: FeedPost) {
  return {
    id: post.id,
    title: post.teach.hook || post.caption,
    text: `${post.teach.stamp} ${post.teach.hook} ${post.caption} ${post.hashtags.join(" ")}`,
  };
}

export function RecommendDesks({ post, library }: { post: FeedPost; library: FeedPost[] }) {
  const notes = recommendPost(post, library);
  const next = nextFromFilm(filmOf(post), library.map(filmOf));
  const setPlayingId = useFeedStore((s) => s.setPlayingId);
  return (
    <section className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Recommendation</p>
      <div className="grid gap-2">
        {notes.map((note) => (
          <DeskRow key={note.desk} note={note} />
        ))}
      </div>
      {next ? (
        <div className="rounded-2xl bg-elevated px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Next concepts</p>
          <p className="mt-0.5 text-sm leading-relaxed">{next.because}</p>
          {next.lessons.length ? (
            <ul className="mt-2 space-y-1">
              {next.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <button type="button" className="text-left text-sm font-semibold text-primary" onClick={() => setPlayingId(lesson.id)}>
                    {lesson.title}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-xs text-muted">No other film on the clinic matches {next.then || "the next step"} yet.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}

function DeskRow({ note }: { note: DeskNote }) {
  const body = (
    <>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{note.title}</p>
      <p className="mt-0.5 text-sm leading-relaxed">{note.line}</p>
      {note.steps?.length ? (
        <ol className="mt-2 space-y-1">
          {note.steps.map((step, index) => (
            <li key={step.title}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{step.title}</p>
              <p className="text-sm leading-relaxed">{step.line}</p>
              {index < (note.steps?.length ?? 0) - 1 ? <p className="py-0.5 text-xs text-muted">↓</p> : null}
            </li>
          ))}
        </ol>
      ) : null}
    </>
  );
  if (!note.href) return <div className="rounded-2xl bg-elevated px-3 py-2.5">{body}</div>;
  return (
    <a href={note.href} target="_blank" rel="noreferrer" className="block rounded-2xl bg-elevated px-3 py-2.5 hover:bg-surface">
      {body}
    </a>
  );
}

export function SourcePipes() {
  const pipes = sourcePipes();
  return (
    <div className="flex flex-wrap gap-1.5">
      {pipes.map((pipe) => (
        <a
          key={pipe.id}
          href={pipe.href}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-elevated px-2.5 py-1 text-[11px] font-semibold"
        >
          {pipe.name}
        </a>
      ))}
    </div>
  );
}
