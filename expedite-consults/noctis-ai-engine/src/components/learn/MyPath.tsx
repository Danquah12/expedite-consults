import type { FeedPost } from "@/lib/feed-data";
import { myLearningPath, type PathFilm } from "@/lib/learning-path";
import { GOALS } from "@/lib/learn";
import { useFeedStore } from "@/lib/feed-store";

function asFilm(post: FeedPost): PathFilm {
  return {
    id: post.id,
    title: post.teach.hook || post.caption,
    text: `${post.teach.stamp} ${post.teach.hook} ${post.caption} ${post.hashtags.join(" ")}`,
  };
}

export function MyPath() {
  const posts = useFeedStore((s) => s.posts);
  const played = useFeedStore((s) => s.dayWatch.played);
  const passed = useFeedStore((s) => s.drillPassed);
  const setPlayingId = useFeedStore((s) => s.setPlayingId);
  const closeModal = useFeedStore((s) => s.closeModal);
  const goal = useFeedStore((s) => s.goal);
  const goalLabel = GOALS.find((item) => item.id === goal)?.label;
  const paths = myLearningPath(posts.map(asFilm), played, Object.keys(passed).filter((id) => passed[id]), { goal: goalLabel });

  if (!paths.length) {
    return <p className="mt-3 text-sm text-muted">No path yet. A watch and a check start one. A like does not.</p>;
  }

  return (
    <div className="mt-4 space-y-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">My learning path</p>
      {paths.map((path) => (
        <section key={path.house}>
          <p className="text-sm font-semibold">{path.house}</p>
          <p className="mt-1 text-sm leading-relaxed">{path.because}</p>
          <p className="mt-1 text-xs text-muted">{path.why}. Not what other people watched.</p>
          <ol className="mt-2 space-y-1">
            {path.steps.map((step, index) => (
              <li key={step.id}>
                <p className="text-sm">
                  <span className="text-muted">{step.state === "done" ? "Done" : step.state === "next" ? "Next" : step.state === "gap" ? "Not checked" : "Later"}</span>
                  {" · "}
                  {step.label}
                </p>
                {index < path.steps.length - 1 ? <p className="text-xs text-muted">↓</p> : null}
              </li>
            ))}
          </ol>
          {path.next?.lessons.length ? (
            <ul className="mt-2 space-y-1">
              {path.next.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <button
                    type="button"
                    className="text-left text-sm font-semibold text-primary"
                    onClick={() => {
                      setPlayingId(lesson.id);
                      closeModal();
                    }}
                  >
                    {lesson.title}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}
