import { Link } from "@tanstack/react-router";
import { eduMark } from "@/lib/edu-meta";
import type { FeedPost } from "@/lib/feed-data";
import { cn } from "@/lib/utils";

export function LearnMark({
  post,
  onChapter,
  compact,
  className,
}: {
  post: FeedPost;
  onChapter?: (t: number) => void;
  compact?: boolean;
  className?: string;
}) {
  const mark = eduMark(post);
  const skills = mark.skills.slice(0, 3);
  if (compact && (!mark.chapters || !onChapter)) return null;
  if (!skills.length && !mark.chapters && !mark.paper && !mark.courseId) return null;

  return (
    <div className={cn(compact ? "flex items-center gap-2 overflow-x-auto scrollbar-none" : "space-y-2", className)}>
      {compact ? (
        mark.chapters && onChapter ? (
          mark.chapters.map((c) => (
            <button
              key={c.t}
              type="button"
              onClick={() => onChapter(c.t)}
              className="shrink-0 rounded-full bg-elevated px-2.5 py-1 text-[11px] font-semibold text-muted hover:text-fg"
            >
              {fmt(c.t)} {c.label}
            </button>
          ))
        ) : null
      ) : (
        <>
          {skills.length ? (
            <p className="text-xs text-muted">
              {skills.join(" · ")}
              {mark.school ? ` · ${mark.school}` : ""}
            </p>
          ) : mark.school ? (
            <p className="text-xs text-muted">{mark.school}</p>
          ) : null}
          {mark.chapters && onChapter ? (
            <div className="flex gap-1 overflow-x-auto scrollbar-none">
              {mark.chapters.map((c) => (
                <button
                  key={c.t}
                  type="button"
                  onClick={() => onChapter(c.t)}
                  className="shrink-0 rounded-full bg-bg/55 px-2.5 py-1 text-xs font-semibold text-caption backdrop-blur-md"
                >
                  {fmt(c.t)} {c.label}
                </button>
              ))}
            </div>
          ) : null}
          {mark.paper || mark.courseId || mark.projectId ? (
            <p className="flex flex-wrap gap-3 text-xs font-semibold">
              {mark.paper ? (
                <a href={mark.paper} target="_blank" rel="noreferrer" className="text-primary">
                  Paper
                </a>
              ) : null}
              {mark.courseId ? (
                <Link to="/hub/course/$id" params={{ id: mark.courseId }} className="text-primary">
                  Course
                </Link>
              ) : null}
              {mark.projectId ? (
                <Link to="/hub/project/$id" params={{ id: mark.projectId }} className="text-primary">
                  Research
                </Link>
              ) : null}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

function fmt(t: number) {
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
