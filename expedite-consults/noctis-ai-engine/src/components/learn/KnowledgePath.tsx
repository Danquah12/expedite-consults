import type { FeedPost } from "@/lib/feed-data";
import { filmText, graphPath, lessonOnNode } from "@/lib/knowledge-graph";
import { learningProfile, type SkillLevel } from "@/lib/learning-profile";
import { useFeedStore } from "@/lib/feed-store";

function skillFor(label: string, levels: { name: string; level: SkillLevel }[]) {
  const hit = levels.find((row) => row.name.toLowerCase() === label.toLowerCase());
  return hit?.level ?? null;
}

export function KnowledgePath({ post, onOpen }: { post: FeedPost; onOpen?: (id: string) => void }) {
  const posts = useFeedStore((s) => s.posts);
  const watch = useFeedStore((s) => s.dayWatch);
  const passed = useFeedStore((s) => s.drillPassed);
  const missed = useFeedStore((s) => s.drillMissed);
  const path = graphPath(filmText(post));
  if (path.length < 2) return null;
  const levels = learningProfile(posts, watch, passed, missed).houses.flatMap((house) => house.skills);

  return (
    <section>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Foundations</h3>
      <p className="mt-1 text-xs text-muted">Each step is a concept this subject rests on. A level appears only if you have practiced it.</p>
      <ol className="mt-2 space-y-1">
        {path.map((node, index) => {
          const lesson = lessonOnNode(node, posts, post.id);
          const level = skillFor(node.label, levels);
          return (
            <li key={node.id}>
              <div className="rounded-xl bg-elevated px-3 py-2">
                <p className="text-sm font-semibold">{node.label}</p>
                <p className="text-[11px] text-muted">{level ? `Your skill → ${level}` : "Not practiced yet"}</p>
                {index === 0 ? <p className="mt-1 text-xs text-muted">Question · {post.teach.prompt}</p> : null}
                {lesson && onOpen ? (
                  <button type="button" onClick={() => onOpen(lesson.id)} className="mt-1 text-xs font-semibold text-primary">
                    Lesson · {lesson.teach.stamp}
                  </button>
                ) : null}
              </div>
              {index < path.length - 1 ? <p className="py-0.5 text-center text-xs text-muted">↓</p> : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
