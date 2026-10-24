import type { FeedPost } from "@/lib/feed-data";
import { LearningThread } from "@/components/learn/LearningThread";

export function ReelLearnSide({ post }: { post: FeedPost }) {
  return <LearningThread post={post} />;
}
