import type { FeedPost } from "@/lib/feed-data";
import { studyHouse } from "@/lib/study-this";
import { houseIntel } from "@/lib/house-intel";
import { learningProfile } from "@/lib/learning-profile";
import { useFeedStore } from "@/lib/feed-store";
import { scrollToFeed } from "@/lib/syndicate";
import { cn } from "@/lib/utils";

export const STUDY_LENSES = ["For you", "Bible", "Cyber", "Science", "Engineering", "Wildlife"] as const;
export type StudyLens = (typeof STUDY_LENSES)[number];

export function filmsForLens(posts: FeedPost[], lens: StudyLens) {
  if (lens === "For you") return posts;
  return posts.filter((post) => studyHouse(post) === lens);
}

export function SubjectRail({
  lens,
  onLens,
  posts,
}: {
  lens: StudyLens;
  onLens: (lens: StudyLens) => void;
  posts: FeedPost[];
}) {
  const passed = useFeedStore((s) => s.drillPassed);
  const watch = useFeedStore((s) => s.dayWatch);
  const library = useFeedStore((s) => s.posts);
  const intel = houseIntel(library, watch, passed);
  const missed = useFeedStore((s) => s.drillMissed);
  const practice = learningProfile(library, watch, passed, missed).practice;
  const next = posts.find((post) => !passed[post.id]) ?? intel.open;

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Subject</p>
      <div className="flex flex-wrap gap-1.5">
        {STUDY_LENSES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onLens(item)}
            className={cn(
              "inline-flex min-h-9 shrink-0 items-center rounded-full px-3 py-1.5 text-[11px] font-semibold",
              lens === item ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
            )}
          >
            {item}
          </button>
        ))}
      </div>
      {next ? (
        <button
          type="button"
          onClick={() => scrollToFeed(next.id)}
          className="w-full rounded-xl bg-elevated px-3 py-2 text-left"
        >
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-primary">Next lesson · {studyHouse(next)}</span>
          <span className="mt-0.5 block text-sm font-semibold">{next.teach?.stamp || "Open the film"}</span>
          <span className="mt-1 block text-xs leading-snug text-muted">{intel.line}</span>
        </button>
      ) : (
        <p className="text-xs text-muted">Nothing in {lens} is seated yet.</p>
      )}
      {practice ? <p className="text-xs font-semibold text-primary">{practice.house} · {practice.name} → {practice.level}</p> : null}
    </div>
  );
}
