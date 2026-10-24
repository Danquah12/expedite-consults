import { useEffect, useState } from "react";
import { knowledgeGap } from "@/lib/knowledge-gap";
import { LearningBoard } from "@/components/learn/LearningBoard";
import { CreatorMarket } from "@/components/learn/CreatorMarket";
import { useFeedStore } from "@/lib/feed-store";
import { STAGES, lessonById, loadLoop, missesFor, nextLesson, saveLoop, LOOP_TRACKS, type LoopSave, type StageId } from "@/lib/learner-loop";
import { cn } from "@/lib/utils";

type Check = { id: string; prompt: string; ok: string; no: string };

function Choice({ check, onPick }: { check: Check; onPick: (correct: boolean) => void }) {
  const [pick, setPick] = useState<string | null>(null);
  return (
    <div className="mt-3 space-y-2">
      <p className="text-sm font-semibold">{check.prompt}</p>
      {[check.ok, check.no].map((label) => (
        <button
          key={label}
          type="button"
          onClick={() => {
            if (pick) return;
            setPick(label);
            onPick(label === check.ok);
          }}
          className={cn("flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm", pick === label ? "bg-primary text-primary-fg" : "bg-elevated")}
        >
          {label}
        </button>
      ))}
      {pick ? <p className="text-sm text-muted">{pick === check.ok ? "That matches the lesson." : "Not yet. The path will reteach this."}</p> : null}
    </div>
  );
}

export function LearningEngine() {
  const [track, setTrack] = useState<(typeof LOOP_TRACKS)[number]>("Cyber");
  const [row, setRow] = useState<LoopSave>(() => loadLoop("Cyber"));
  const [quizAt, setQuizAt] = useState(0);
  const lesson = lessonById(row.lessonId);
  const upcoming = nextLesson(lesson);
  const posts = useFeedStore((s) => s.posts);
  const played = useFeedStore((s) => s.dayWatch.played);
  const passed = useFeedStore((s) => s.drillPassed);
  const drillMissed = useFeedStore((s) => s.drillMissed);
  const gap = knowledgeGap(
    posts.map((post) => ({
      id: post.id,
      title: post.teach.hook || post.caption,
      text: `${post.teach.stamp} ${post.teach.hook} ${post.caption} ${post.hashtags.join(" ")}`,
    })),
    played,
    Object.keys(passed).filter((id) => passed[id]),
    Object.keys(drillMissed).filter((id) => drillMissed[id] > 0),
  );
  const missed = missesFor(lesson, row.misses);

  useEffect(() => {
    const saved = loadLoop(track);
    setRow(saved);
    setQuizAt(0);
  }, [track]);

  function commit(next: LoopSave) {
    setRow(next);
    saveLoop(track, next);
  }

  function go(stage: StageId, misses = row.misses) {
    commit({ ...row, stage, misses });
  }

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-border">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Learning engine</p>
      <h2 className="mt-1 font-display text-lg font-semibold">Vibe teaches. A video is not the path.</h2>
      <p className="mt-2 text-xs text-muted">{STAGES.map((stage) => stage.label).join(" → ")}</p>
      {gap ? (
        <div className="mt-4 rounded-2xl bg-elevated p-3">
          <p className="text-sm leading-relaxed">{gap.line}</p>
          <button
            type="button"
            onClick={() => {
              setTrack(gap.track);
              const next = { lessonId: gap.lessonId, stage: "assess" as const, misses: [], passed: loadLoop(gap.track).passed };
              setRow(next);
              saveLoop(gap.track, next);
              setQuizAt(0);
            }}
            className="mt-3 min-h-11 rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg"
          >
            Start the vectors lesson
          </button>
        </div>
      ) : null}
      <div className="mt-4">
        <LearningBoard />
      </div>
      <div className="mt-4">
        <CreatorMarket />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {LOOP_TRACKS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setTrack(name)}
            className={cn("min-h-11 rounded-full px-3 text-xs font-semibold", track === name ? "bg-primary text-primary-fg" : "bg-elevated")}
          >
            {name}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm font-semibold">{lesson.title}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {STAGES.map((stage) => (
          <span key={stage.id} className={cn("rounded-full px-2 py-1 text-[10px] font-semibold", row.stage === stage.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted")}>
            {stage.label}
          </span>
        ))}
      </div>

      {row.stage === "assess" ? (
        <Choice
          key={`${lesson.id}-assess`}
          check={lesson.assess}
          onPick={(correct) => {
            const misses = correct ? row.misses.filter((id) => id !== lesson.assess.id) : [...new Set([...row.misses, lesson.assess.id])];
            commit({ ...row, stage: "teach", misses });
          }}
        />
      ) : null}

      {row.stage === "teach" ? (
        <div className="mt-3">
          <p className="text-sm leading-relaxed">{lesson.teach}</p>
          <button type="button" onClick={() => go("practice")} className="mt-3 min-h-11 rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg">
            Practice
          </button>
        </div>
      ) : null}

      {row.stage === "practice" ? (
        <Choice
          key={`${lesson.id}-practice`}
          check={lesson.practice}
          onPick={(correct) => {
            const misses = correct ? row.misses.filter((id) => id !== lesson.practice.id) : [...new Set([...row.misses, lesson.practice.id])];
            setQuizAt(0);
            commit({ ...row, stage: "quiz", misses });
          }}
        />
      ) : null}

      {row.stage === "quiz" && lesson.quiz[quizAt] ? (
        <Choice
          key={`${lesson.id}-${lesson.quiz[quizAt].id}`}
          check={lesson.quiz[quizAt]}
          onPick={(correct) => {
            const id = lesson.quiz[quizAt].id;
            const misses = correct ? row.misses.filter((item) => item !== id) : [...new Set([...row.misses, id])];
            if (quizAt + 1 < lesson.quiz.length) {
              setQuizAt(quizAt + 1);
              commit({ ...row, misses });
              return;
            }
            commit({ ...row, stage: "evaluate", misses });
          }}
        />
      ) : null}

      {row.stage === "evaluate" ? (
        <div className="mt-3">
          <p className="text-sm">{missed.length ? `${missed.length} check${missed.length === 1 ? "" : "s"} missed.` : "Every check matched the lesson."}</p>
          <button type="button" onClick={() => go(missed.length ? "weakness" : "advance")} className="mt-3 min-h-11 rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg">
            {missed.length ? "See the weakness" : "Advance"}
          </button>
        </div>
      ) : null}

      {row.stage === "weakness" ? (
        <div className="mt-3">
          {missed.length ? (
            <ul className="space-y-1 text-sm">
              {missed.map((check) => (
                <li key={check.id}>{check.miss}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm">No weakness on this lesson.</p>
          )}
          <button type="button" onClick={() => go(missed.length ? "remediate" : "advance")} className="mt-3 min-h-11 rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg">
            {missed.length ? "Reteach the miss" : "Advance"}
          </button>
        </div>
      ) : null}

      {row.stage === "remediate" ? (
        <div className="mt-3 space-y-2">
          {missed.map((check) => (
            <p key={check.id} className="text-sm leading-relaxed">{check.fix}</p>
          ))}
          <button
            type="button"
            onClick={() => {
              setQuizAt(0);
              commit({ ...row, stage: "practice", misses: [] });
            }}
            className="min-h-11 rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg"
          >
            Try this lesson again
          </button>
        </div>
      ) : null}

      {row.stage === "advance" ? (
        <div className="mt-3">
          <p className="text-sm">{upcoming ? `Next on ${track}: ${upcoming.title}.` : `You finished the ${track} lessons on this path.`}</p>
          {upcoming ? (
            <button
              type="button"
              onClick={() => {
                const passed = [...new Set([...row.passed, lesson.id])];
                commit({ lessonId: upcoming.id, stage: "assess", misses: [], passed });
              }}
              className="mt-3 min-h-11 rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg"
            >
              Start {upcoming.title}
            </button>
          ) : (
            <p className="mt-2 text-sm text-muted">Passed: {row.passed.concat(lesson.id).filter((id, index, list) => list.indexOf(id) === index).length} on this track. The path stays on this browser.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
