import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { openNoctis } from "@/lib/ask-noctis";
import type { FeedPost } from "@/lib/feed-data";
import { studyLesson } from "@/lib/study-this";
import { DrillQuiz } from "@/components/learn/DrillQuiz";
import { KnowledgePath } from "@/components/learn/KnowledgePath";
import { CrossLearn } from "@/components/learn/CrossLearn";
import { HumanSeat } from "@/components/learn/HumanSeat";
import { LevelExplain } from "@/components/learn/LevelExplain";
import { askStudy } from "@/lib/knowledge-api";
import { loadVideoLesson } from "@/lib/video-mind-api";
import type { VideoLesson } from "@/lib/video-mind";
import type { StudyCard } from "@/lib/knowledge-types";
import { useFeedStore } from "@/lib/feed-store";
import { youtubeIdOf, youtubePoster } from "@/lib/youtube";

export function LessonHead({ title, subject, intro, poster }: { title: string; subject: string; intro: string; poster?: string }) {
  const line = intro.replace(/\s+/g, " ").trim();
  const same = line.toLowerCase() === title.replace(/\s+/g, " ").trim().toLowerCase();
  return (
    <header className="space-y-2">
      {poster ? <img src={poster} alt="" className="aspect-video w-full rounded-2xl object-cover" /> : null}
      <h2 className="font-display text-xl font-semibold leading-snug">{title}</h2>
      {subject ? <p className="text-xs font-semibold text-muted">{subject}</p> : null}
      {line && !same ? <p className="text-sm leading-relaxed">{line}</p> : null}
    </header>
  );
}

export function StudyThisPanel({ post, onNext }: { post: FeedPost; onNext?: (id: string) => void }) {
  const posts = useFeedStore((s) => s.posts);
  const openModal = useFeedStore((s) => s.openModal);
  const lesson = studyLesson(post, posts);
  const [face, setFace] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [retrieved, setRetrieved] = useState<StudyCard | null>(null);
  const [taught, setTaught] = useState<VideoLesson | null>(null);
  const [checking, setChecking] = useState(true);
  const computerFilm = lesson.house === "Cyber" || /cyber|github|nvd|cve|malware|software|programming|computer|linux|kubernetes/i.test(`${post.teach.stamp} ${post.teach.hook} ${post.caption}`);
  const evidence = (retrieved?.evidence ?? []).filter((row) => {
    if (!row.passage.trim()) return false;
    const computerRow = /github|nvd|exploit-db|exploitdb|\bcwe\b|\bcve\b/i.test(`${row.source} ${row.type} ${row.href}`);
    if (!computerFilm && computerRow) return false;
    if (!row.passage.trim() && computerRow) return false;
    return true;
  });
  const card = lesson.cards[face];
  const filmTitle = post.teach.hook || post.caption || "This film";
  const yt = youtubeIdOf(post);
  const poster = post.posterUrl || (yt ? youtubePoster(yt) : "");
  const intro = taught?.plain || [
    `This ${lesson.house} lesson is about ${filmTitle}.`,
    post.caption && post.caption !== filmTitle ? post.caption : `You will learn the idea, not only the name of the film.`,
    `By the end you should be able to explain it in your own words and try one example.`,
  ].filter(Boolean).join(" ");

  useEffect(() => {
    let stop = false;
    setChecking(true);
    setRetrieved(null);
    const question = `${post.teach.stamp}. ${post.teach.hook}`.slice(0, 400);
    void askStudy({ data: { question } })
      .then((next) => {
        if (!stop) setRetrieved(next);
      })
      .catch(() => {
        if (!stop) setRetrieved(null);
      })
      .finally(() => {
        if (!stop) setChecking(false);
      });
    return () => {
      stop = true;
    };
  }, [post.id, post.teach.hook, post.teach.stamp]);

  useEffect(() => {
    let stop = false;
    setTaught(null);
    void loadVideoLesson({
      data: { title: filmTitle, caption: post.caption, author: post.author?.name || "", youtubeId: yt || "" },
    })
      .then((next) => {
        if (!stop && next && "plain" in next) setTaught(next);
      })
      .catch(() => undefined);
    return () => {
      stop = true;
    };
  }, [post.id, filmTitle, post.caption, post.author?.name, yt]);

  function openLesson(id: string) {
    if (onNext) onNext(id);
    else openModal({ type: "lesson", postId: id });
  }

  return (
    <div className="min-w-0 space-y-4 break-words">
      <LessonHead title={filmTitle} subject={[taught?.subject || lesson.house, taught?.difficulty || lesson.level].filter(Boolean).join(" · ")} intro={intro} poster={poster} />
      {taught?.points.length ? (
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">The most important things to learn</h3>
          <ol className="mt-2 list-decimal space-y-2 pl-4 text-sm">
            {taught.points.map((row) => <li key={row}>{row}</li>)}
          </ol>
        </section>
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        {["Video", "Summary", "Notes", "Quiz", "Discussion", "Ask Noctis", "Career", "Certification", "Resources"].map((label) => (
          <span key={label} className="rounded-full border border-[#e4b86a]/40 bg-elevated px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            {label}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {[lesson.house, lesson.kind, lesson.level].map((chip) => (
          <span key={chip} className="rounded-full bg-elevated px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
            {chip}
          </span>
        ))}
        <button
          type="button"
          onClick={() => openModal({ type: "analyze", claim: post.teach.hook, offered: post.caption })}
          className="rounded-full bg-elevated px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary"
        >
          Analyze
        </button>
        <button
          type="button"
          onClick={() => openModal({ type: "think", claim: post.teach.hook })}
          className="rounded-full bg-elevated px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary"
        >
          Think
        </button>
      </div>

      <LevelExplain post={post} />

      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">The story of this film</h3>
        <div className="mt-2 space-y-2 rounded-2xl bg-elevated px-4 py-4">
          {lesson.thread.map((step) => (
            <p key={step.title} className="text-sm leading-relaxed">
              {step.line}
            </p>
          ))}
        </div>
      </section>

      <section id="study-notes">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Notes</h3>
        <p className="mt-1 text-sm leading-relaxed">{post.caption}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{post.teach.hook}</p>
      </section>

      <section id="study-summary">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Summary · this film</h3>
        <p className="mt-1 text-sm leading-relaxed">{lesson.summary}</p>
      </section>

      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Key concepts</h3>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {lesson.concepts.map((concept) => (
            <span key={concept} className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
              {concept}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Definitions</h3>
        <ul className="mt-1 space-y-1.5">
          {lesson.definitions.map((row) => (
            <li key={row.term} className="rounded-xl bg-elevated px-3 py-2 text-sm">
              <span className="font-semibold">{row.term}. </span>
              <span className="text-muted">{row.says}</span>
            </li>
          ))}
          {evidence.slice(0, 2).map((row) => (
            <li key={row.href} className="rounded-xl bg-elevated px-3 py-2 text-sm">
              <span className="font-semibold">{row.source}. </span>
              <span className="text-muted">{row.passage.slice(0, 220)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-1 text-[11px] text-muted">A definition is the film’s line, or a passage that was retrieved. Nothing else was written in.</p>
      </section>

      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Important facts</h3>
        <ul className="mt-1 list-disc space-y-1 pl-4 text-sm">
          {lesson.facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      </section>

      <section id="study-beginner">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Beginner</h3>
        <p className="mt-1 text-sm leading-relaxed">{lesson.beginner}</p>
      </section>

      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Advanced</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">{lesson.advanced}</p>
      </section>

      <section id="study-sources">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Retrieved</h3>
        {checking ? <p className="mt-1 text-sm text-muted">Checking the library before anything is written.</p> : null}
        {!checking && !retrieved ? <p className="mt-1 text-sm text-muted">The library did not answer. Nothing was guessed.</p> : null}
        {retrieved ? (
          <div className="mt-1 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{retrieved.confidence}</p>
            <p className="text-sm leading-relaxed">{retrieved.sentence}</p>
            <p className="text-[11px] text-muted">{retrieved.note}</p>
            <ul className="space-y-1.5">
              {evidence.slice(0, 4).map((row) => (
                <li key={`${row.source}-${row.href}`} className="text-sm">
                  <a href={row.href} target="_blank" rel="noreferrer" className="font-semibold text-primary underline-offset-2 hover:underline">
                    {row.source}
                  </a>
                  <span className="mt-0.5 block text-xs text-muted">{row.type} · {row.passage.slice(0, 180)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <KnowledgePath post={post} onOpen={openLesson} />
      <CrossLearn post={post} />

      {lesson.related.length ? (
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Related lessons</h3>
          <div className="mt-1 space-y-1.5">
            {lesson.related.map((row) => (
              <button key={row.id} type="button" onClick={() => openLesson(row.id)} className="w-full rounded-xl bg-elevated px-3 py-2 text-left">
                <span className="block text-sm font-semibold">{row.teach.stamp}</span>
                <span className="block text-xs text-muted">{row.teach.hook}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Further reading</h3>
        <ul className="mt-1 space-y-1.5">
          {lesson.sources.map((source) => (
            <li key={source.title} className="text-sm">
              {source.href ? (
                <a href={source.href} target="_blank" rel="noreferrer" className="font-semibold text-primary underline-offset-2 hover:underline">
                  {source.title}
                </a>
              ) : (
                <span className="font-semibold">{source.title}</span>
              )}
              <span className="mt-0.5 block text-xs text-muted">{source.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Flashcards</h3>
        <button
          type="button"
          onClick={() => setFlipped((on) => !on)}
          className="mt-1 min-h-24 w-full rounded-2xl bg-elevated px-4 py-4 text-left"
        >
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-primary">{flipped ? "Answer" : "Question"} · {face + 1} of {lesson.cards.length}</span>
          <span className="mt-2 block text-sm font-semibold">{flipped ? card.back : card.front}</span>
        </button>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            className="rounded-full bg-elevated px-3 py-1.5 text-xs font-semibold"
            onClick={() => {
              setFlipped(false);
              setFace((n) => (n + lesson.cards.length - 1) % lesson.cards.length);
            }}
          >
            Previous card
          </button>
          <button
            type="button"
            className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-fg"
            onClick={() => {
              setFlipped(false);
              setFace((n) => (n + 1) % lesson.cards.length);
            }}
          >
            Next card
          </button>
        </div>
      </section>

      <section id="study-quiz">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Quiz</h3>
        <div className="mt-1">
          <DrillQuiz post={post} />
        </div>
      </section>

      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Discuss</h3>
        <ol className="mt-1 list-decimal space-y-1.5 pl-4 text-sm leading-snug">
          {lesson.discuss.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </section>
      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Ask Noctis</h3>
        <p className="mt-1 text-sm leading-relaxed">Vibe answers this film as soon as the page opens.</p>
        <button
          type="button"
          onClick={() => openNoctis(
            `This film is "${post.teach.stamp}: ${post.teach.hook}". Explain this film. Look at the picture with it. Use only this film. Do not switch to another subject.`,
            post.posterUrl || (post.mediaType === "image" ? post.mediaUrl : ""),
          )}
          className="mt-2 inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg"
        >
          Ask Noctis about this film
        </button>
      </section>
      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Where this film goes</h3>
        <div className="mt-2 grid gap-2">
          <Link to="/openings" className="rounded-2xl bg-elevated px-3 py-3">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-primary">Career</span>
            <span className="mt-1 block text-sm">Map {post.teach.stamp} onto the next role.</span>
          </Link>
          <Link to="/hub" className="rounded-2xl bg-elevated px-3 py-3">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-primary">Certification</span>
            <span className="mt-1 block text-sm">See the course and credential this film supports.</span>
          </Link>
          <Link to="/market" className="rounded-2xl bg-elevated px-3 py-3">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-primary">Resources</span>
            <span className="mt-1 block text-sm">Tools and training that support this kind of work.</span>
          </Link>
        </div>
      </section>
      <HumanSeat />
    </div>
  );
}
