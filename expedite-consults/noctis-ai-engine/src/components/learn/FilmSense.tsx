import type { FeedPost } from "@/lib/feed-data";
import { LearningThread } from "@/components/learn/LearningThread";

/** Notes under a film: a lesson, a check, and the next idea. Not a second caption. */
export function FilmSense({ post }: { post: FeedPost }) {
  return <LearningThread post={post} />;
}
