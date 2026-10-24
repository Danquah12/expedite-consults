import type { FeedPost } from "@/lib/feed-data";
import { learningBoard } from "@/lib/learning-board";
import { learningRewards } from "@/lib/learning-rewards";
import { teacherPlan } from "@/lib/personal-teacher";
import { askedVibe, markedCreated, openedStudy, vibeLoop } from "@/lib/learning-loop";
import { learnerGraph } from "@/lib/learner-graph";
import { LOOP_LESSONS, loadLoop } from "@/lib/learner-loop";
import { GOALS } from "@/lib/learn";
import { knowledgeGap } from "@/lib/knowledge-gap";
import { useFeedStore } from "@/lib/feed-store";

function asFilm(post: FeedPost) {
  return {
    id: post.id,
    title: post.teach.hook || post.caption,
    text: `${post.teach.stamp} ${post.teach.hook} ${post.caption} ${post.hashtags.join(" ")}`,
  };
}

export function LearningBoard() {
  const posts = useFeedStore((s) => s.posts);
  const played = useFeedStore((s) => s.dayWatch.played);
  const passed = useFeedStore((s) => s.drillPassed);
  const missed = useFeedStore((s) => s.drillMissed);
  const films = posts.map(asFilm);
  const passedIds = Object.keys(passed).filter((id) => passed[id]);
  const board = learningBoard(films, played, passedIds);
  const gap = knowledgeGap(films, played, passedIds, Object.keys(missed).filter((id) => missed[id] > 0));
  const goal = useFeedStore((s) => s.goal);
  const plan = teacherPlan({
    films,
    played,
    passed: passedIds,
    missed: Object.keys(missed).filter((id) => missed[id] > 0),
    goal: GOALS.find((item) => item.id === goal)?.label || "not set",
    bars: board.bars,
  });
  const learned = LOOP_LESSONS.some((lesson) => {
    const save = loadLoop(lesson.track);
    return save.passed.includes(lesson.id) || (save.lessonId === lesson.id && save.stage !== "assess");
  });
  const quizzed = passedIds.length > 0 || ["Cyber", "Bible", "Science", "Engineering"].some((track) => loadLoop(track).passed.length > 0);
  const engage = useFeedStore((s) => s.engage);
  const shared = Object.values(engage).some((row) => (row.shareDelta ?? 0) > 0 || row.reposted);
  const discussed = Object.values(engage).some((row) => (row.comments?.length ?? 0) > 0);
  const loop = vibeLoop({
    discovered: played.length > 0,
    watched: played.length > 0,
    understood: openedStudy(),
    asked: askedVibe(),
    learned,
    quizzed,
    mastered: board.bars.some((bar) => bar.percent >= 100),
    created: markedCreated(),
    shared,
    discussed,
  });
  const graph = learnerGraph({
    understood: plan.understood,
    studied: plan.studied,
    missing: plan.missing,
    goal: plan.goal,
    completed: passedIds.length,
  });
  const crews = useFeedStore((s) => s.joinedCrews);
  const rewards = learningRewards(board, crews);

  return (
    <section className="rounded-2xl bg-surface p-4 shadow-border">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Discover, understand, learn, discuss, create</p>
      {gap ? <p className="mt-2 text-sm leading-relaxed">{gap.line}</p> : null}
      <div className="mt-3 rounded-2xl bg-elevated p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Personal teacher</p>
        <p className="mt-1 text-sm leading-relaxed">{plan.lesson}</p>
        <ol className="mt-3 space-y-1">
          {loop.steps.map((step) => (
            <li key={step.id} className="text-sm">
              <span className="text-muted">{step.state === "done" ? "Done" : step.state === "now" ? "Now" : "Later"}</span>
              {" · "}
              {step.label}
            </li>
          ))}
        </ol>
        <p className="mt-2 text-xs text-muted">{loop.better}</p>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Your graph</p>
        <ul className="mt-1 space-y-1 text-sm">
          <li>Knows: {graph.knows.length ? graph.knows.join(", ") : "nothing checked"}</li>
          <li>Learning: {graph.learning.length ? graph.learning.join(", ") : "nothing in progress"}</li>
          <li>Interested in: {graph.interested}</li>
          <li>Completed checks: {graph.completed}</li>
          <li>Weak in: {graph.weak.length ? graph.weak.join(", ") : "no gap named"}</li>
          <li>Wants to learn: {graph.wants}</li>
        </ul>
      </div>
      <ul className="mt-3 space-y-3">
        {board.bars.map((bar) => (
          <li key={bar.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold">{bar.label}</span>
              <span className="text-muted">{bar.percent}%</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-elevated">
              <div className="h-full rounded-full bg-primary" style={{ width: `${bar.percent}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted">{bar.detail}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl bg-elevated px-3 py-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">Lessons</dt>
          <dd className="font-semibold">{board.lessons}</dd>
        </div>
        <div className="rounded-xl bg-elevated px-3 py-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">Quizzes</dt>
          <dd className="font-semibold">{board.quizzes}</dd>
        </div>
        <div className="rounded-xl bg-elevated px-3 py-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">Knowledge areas</dt>
          <dd className="font-semibold">{board.areas}</dd>
        </div>
        <div className="rounded-xl bg-elevated px-3 py-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">Current streak</dt>
          <dd className="font-semibold">{board.streak} {board.streak === 1 ? "day" : "days"}</dd>
        </div>
      </dl>
      <div className="mt-4 border-t border-elevated pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Learning rewards</p>
        <p className="mt-1 text-xs text-muted">{rewards.boardNote}</p>
        <p className="mt-2 text-sm"><span className="font-semibold">{rewards.points}</span> learning points · {rewards.level}</p>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted">Achievements</p>
        <ul className="mt-1 space-y-1">
          {rewards.achievements.map((item) => (
            <li key={item.name} className="text-sm">
              <span className="font-semibold">{item.earned ? "Earned" : "Not yet"} · {item.name}.</span> {item.because}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted">Certificates</p>
        <ul className="mt-1 space-y-1">
          {rewards.certificates.map((item) => (
            <li key={item.subject} className="text-sm">{item.subject}: {item.earned ? "Earned" : "Not earned"}</li>
          ))}
        </ul>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted">Challenge</p>
        <p className="mt-1 text-sm">{rewards.challenge}</p>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted">Subject mastery</p>
        <p className="mt-1 text-sm">{rewards.mastery.length ? rewards.mastery.join(", ") : "None yet. A full subject has to be checked."}</p>
        <p className="mt-3 text-sm">{rewards.team}</p>
        <p className="mt-1 text-sm text-muted">{rewards.community}</p>
      </div>
    </section>
  );
}
