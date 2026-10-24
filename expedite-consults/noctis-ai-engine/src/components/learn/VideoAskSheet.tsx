import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { askAboutVideo, askResearch, loadVideoLesson } from "@/lib/video-mind-api";
import type { VideoLesson } from "@/lib/video-mind";
import { useFeedStore } from "@/lib/feed-store";
import { youtubeIdOf, youtubePoster, youtubeWatch } from "@/lib/youtube";

function topicKeys(value: string) {
  const stop = new Set(["master", "english", "video", "learn", "about", "this", "that", "with", "from", "your", "film", "lesson", "sound", "watch", "youtube", "intro", "class", "explained", "tutorial"]);
  return value.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3 && !stop.has(word));
}

export function askFilm(film: { postId?: string; title?: string; caption?: string; youtubeId?: string }) {
  useFeedStore.getState().openModal({
    type: "video",
    postId: film.postId || film.youtubeId || `lesson-${(film.title || "ask").slice(0, 48)}`,
    title: film.title,
    caption: film.caption,
    youtubeId: film.youtubeId,
  });
}

export function VideoAskSheet({ open, postId, title: givenTitle = "", caption: givenCaption = "", youtubeId: givenYt = "" }: { open: boolean; postId: string; title?: string; caption?: string; youtubeId?: string }) {
  const closeModal = useFeedStore((s) => s.closeModal);
  const posts = useFeedStore((s) => s.posts);
  const post = posts.find((row) => row.id === postId);
  const [lesson, setLesson] = useState<VideoLesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [mode, setMode] = useState<"ask" | "tutor">("ask");
  const [tutorTurns, setTutorTurns] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [report, setReport] = useState("");
  const [researching, setResearching] = useState(false);
  const [details, setDetails] = useState(false);
  const [quizPick, setQuizPick] = useState<Record<number, number>>({});

  const hook = post?.teach.hook || givenTitle;
  const caption = post?.caption || givenCaption;
  const authorName = post?.author?.name || "";
  const youtubeId = (post ? youtubeIdOf(post) : "") || givenYt;

  useEffect(() => {
    if (!open || (!hook && !caption && !youtubeId)) return;
    let stop = false;
    setLesson(null);
    setFailure("");
    setAnswer("");
    setReport("");
    setTutorTurns([]);
    setDetails(false);
    setLoading(true);
    void loadVideoLesson({
      data: { title: hook || caption, caption, author: authorName, youtubeId },
    })
      .then((next) => {
        if (stop) return;
        if (next && "error" in next && !("title" in next)) setFailure(next.error);
        else setLesson(next as VideoLesson);
      })
      .catch(() => {
        if (!stop) setFailure("The lesson did not come back.");
      })
      .finally(() => {
        if (!stop) setLoading(false);
      });
    return () => {
      stop = true;
    };
  }, [open, postId, hook, caption, authorName, youtubeId]);

  if (!open || (!post && !givenTitle && !givenCaption && !givenYt)) return null;

  const title = lesson?.title || post?.teach.hook || givenTitle || "This film";
  const keys = topicKeys(`${post?.teach.hook || givenTitle} ${post?.caption || givenCaption}`);
  const related = !post || keys.length < 2
    ? []
    : posts
        .filter((row) => row.id !== post.id && row.mediaType === "video")
        .map((row) => ({ row, score: topicKeys(`${row.teach.hook} ${row.caption}`).filter((word) => keys.includes(word)).length }))
        .filter((row) => row.score >= 2)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
        .map((row) => row.row);
  const watchHref = post && youtubeIdOf(post) ? youtubeWatch(youtubeIdOf(post)!) : post?.mediaUrl.startsWith("http") ? post.mediaUrl : givenYt ? `https://www.youtube.com/watch?v=${givenYt}` : "";

  async function ask(text: string, nextMode: "ask" | "tutor" = mode) {
    const q = text.trim();
    if (!q || asking || !lesson) return;
    setMode(nextMode);
    setAsking(true);
    setAnswer("");
    const history = nextMode === "tutor" ? tutorTurns : [];
    try {
      const reply = await askAboutVideo({
        data: {
          mode: nextMode,
          question: q,
          turns: history,
          packet: {
            title: lesson.title,
            description: lesson.description,
            spoken: lesson.spoken,
            notes: lesson.notes,
            concepts: lesson.concepts,
            sources: lesson.sources,
          },
        },
      });
      const textReply = reply && "text" in reply ? reply.text : "";
      const error = reply && "error" in reply ? reply.error : "";
      if (error && !textReply) setFailure(error);
      else {
        setAnswer(textReply);
        if (nextMode === "tutor") {
          const next: { role: "user" | "assistant"; content: string }[] = [...history, { role: "user", content: q }, { role: "assistant", content: textReply }];
          setTutorTurns(next.slice(-8));
        }
      }
    } catch {
      setFailure("Vibe could not answer that.");
    } finally {
      setAsking(false);
      setQuestion("");
    }
  }

  async function research() {
    if (researching) return;
    setResearching(true);
    setReport("");
    try {
      const reply = await askResearch({ data: { question: `Research ${title}` } });
      if (reply && "text" in reply) setReport(reply.text);
      else if (reply && "error" in reply) setFailure(reply.error);
    } catch {
      setFailure("The research note did not come back.");
    } finally {
      setResearching(false);
    }
  }

  const poster = (youtubeId && youtubePoster(youtubeId)) || post?.posterUrl || "";

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeModal()}>
      <DialogContent className="w-[min(94vw,560px)]">
        {poster ? (
          <img src={poster} alt="" className="aspect-video w-full rounded-2xl object-cover" />
        ) : null}
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {[authorName, lesson?.subject, lesson?.difficulty, ...(lesson?.topics || [])].filter((part) => part && part !== title).join(" · ") || "Lesson"}
          </DialogDescription>
        </DialogHeader>
        {loading ? <p className="text-sm text-muted">Building the lesson…</p> : null}
        {failure ? <p className="text-sm text-red-400">{failure}</p> : null}
        {lesson ? (
          <div className="space-y-4 text-sm leading-relaxed">
            <p className="text-xs text-muted">{lesson.spokenNote}</p>
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Introduction</p>
              <p className="mt-1">{lesson.plain || lesson.summary || "This lesson is still being written."}</p>
            </section>
            {lesson.points.length ? (
              <section>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">The most important things to learn</p>
                <ol className="mt-2 list-decimal space-y-2 pl-4">
                  {lesson.points.map((row) => <li key={row}>{row}</li>)}
                </ol>
              </section>
            ) : null}
            {lesson.vocabulary.length ? (
              <section>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Words</p>
                <ul className="mt-1 space-y-1">{lesson.vocabulary.map((row) => <li key={row.term}><span className="font-semibold">{row.term}. </span>{row.says}</li>)}</ul>
              </section>
            ) : null}
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Practise what you learned</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" className="min-h-11 rounded-full bg-elevated px-3 text-xs font-semibold" onClick={() => void ask("Explain this simply.", "ask")}>Explain simply</button>
                <button type="button" className="min-h-11 rounded-full bg-elevated px-3 text-xs font-semibold" onClick={() => void ask("Give me a quiz.", "ask")}>Take a quiz</button>
                <button type="button" className="min-h-11 rounded-full bg-elevated px-3 text-xs font-semibold" onClick={() => void ask("Practise what I learned. Give me one thing to say or do, then wait.", "tutor")}>Practise speaking</button>
                <button type="button" className="min-h-11 rounded-full bg-elevated px-3 text-xs font-semibold" onClick={() => void ask("What should I study next?", "ask")}>Study next</button>
              </div>
            </section>
            {lesson.quiz.length ? (
              <section>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Quiz</p>
                <ul className="mt-2 space-y-3">
                  {lesson.quiz.map((row, index) => (
                    <li key={row.ask}>
                      <p className="font-semibold">{row.ask}</p>
                      <div className="mt-1 flex flex-col gap-1">
                        {row.choices.map((choice, choiceIndex) => {
                          const picked = quizPick[index];
                          const show = picked !== undefined;
                          const right = show && choiceIndex === row.answer;
                          const wrong = show && picked === choiceIndex && choiceIndex !== row.answer;
                          return (
                            <button
                              key={choice}
                              type="button"
                              className={`min-h-11 rounded-xl px-3 text-left text-sm ${right ? "bg-primary text-primary-fg" : wrong ? "bg-elevated text-red-400" : "bg-elevated"}`}
                              onClick={() => setQuizPick((prev) => ({ ...prev, [index]: choiceIndex }))}
                            >
                              {choice}
                            </button>
                          );
                        })}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {lesson.beginner || lesson.objectives[0] ? (
              <section>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Apply</p>
                <p className="mt-1">{lesson.objectives[0] || lesson.beginner}</p>
              </section>
            ) : null}
            {related.length ? (
              <section>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Continue learning</p>
                <ul className="mt-1 space-y-1">
                  {related.map((row) => (
                    <li key={row.id}>
                      <button
                        type="button"
                        className="text-left font-semibold"
                        onClick={() => {
                          useFeedStore.getState().setPlayingId(row.id);
                          closeModal();
                        }}
                      >
                        {row.teach.hook || row.caption}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            <button type="button" className="min-h-11 text-xs font-semibold text-primary" onClick={() => setDetails((on) => !on)}>
              {details ? "Hide video details and sources" : "Video details and sources"}
            </button>
            {details ? (
              <div className="space-y-3 text-xs text-muted">
                {lesson.spoken ? <p className="whitespace-pre-wrap text-sm">{lesson.spoken.slice(0, 4000)}</p> : <p>{lesson.spokenNote}</p>}
                {watchHref ? <a href={watchHref} target="_blank" rel="noreferrer" className="inline-flex font-semibold text-primary">Open the film</a> : null}
                {lesson.sources.length ? (
                  <ul className="space-y-2">
                    {lesson.sources.map((row) => (
                      <li key={row.href}>
                        <a href={row.href} target="_blank" rel="noreferrer" className="font-semibold text-primary">{row.title}</a>
                        <span className="mt-0.5 block">{row.note}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p>No matching reading was retrieved.</p>}
              </div>
            ) : null}
            {tutorTurns.length ? (
              <div className="space-y-2 rounded-2xl bg-elevated px-3 py-3">
                {tutorTurns.map((turn, index) => (
                  <p key={`${turn.role}-${index}`}><span className="font-semibold">{turn.role === "user" ? "You. " : "Tutor. "}</span>{turn.content}</p>
                ))}
              </div>
            ) : null}
            {answer && mode === "ask" ? <p className="rounded-2xl bg-elevated px-3 py-3">{answer}</p> : null}
            {asking ? <p className="text-xs text-muted">Vibe is reading the film notes…</p> : null}
            {report ? <p className="whitespace-pre-wrap rounded-2xl bg-elevated px-3 py-3">{report}</p> : null}
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void ask(question, mode);
              }}
            >
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder={mode === "tutor" ? "Answer the tutor" : "Ask about this video"}
                className="min-h-11 min-w-0 flex-1 rounded-full bg-elevated px-3 text-sm outline-none"
              />
              <button type="submit" disabled={asking || !question.trim()} className="min-h-11 rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg disabled:opacity-40">
                Ask
              </button>
            </form>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
