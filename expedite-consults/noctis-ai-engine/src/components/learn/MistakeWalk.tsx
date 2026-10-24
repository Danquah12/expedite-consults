import { useState } from "react";
import type { FeedPost } from "@/lib/feed-data";

export function MistakeWalk({ post, chosen, onRetry }: { post: FeedPost; chosen: string; onRetry: () => void }) {
  const right = post.teach.options.find((option) => option.ok)?.label ?? post.teach.hook;
  const [practice, setPractice] = useState<string | null>(null);
  const practiceHit = practice === "film";

  return (
    <div className="mt-3 space-y-2 text-sm">
      <p className="font-semibold">Let’s figure out why this was confusing.</p>
      <p><span className="font-semibold">Question. </span>{post.teach.prompt}</p>
      <p><span className="font-semibold">You chose. </span>{chosen || "No line was selected."}</p>
      <p><span className="font-semibold">The mix-up. </span>That line is not the film’s answer. The film’s answer is: {right}.</p>
      <p><span className="font-semibold">Why it is easy to mix up. </span>The other lines are nearby. The film does not say they are the answer.</p>
      <p><span className="font-semibold">A simpler line from the film. </span>{post.teach.hook}</p>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">Practice</p>
      <p>Which line did the film give?</p>
      {[
        { id: "film", label: post.teach.hook },
        { id: "pick", label: chosen || "The line you chose" },
        { id: "none", label: "Neither line was in the film" },
      ].map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => setPractice(option.id)}
          className={`block w-full rounded-xl px-3 py-2 text-left ${practice === option.id ? "bg-primary text-primary-fg" : "bg-surface"}`}
        >
          {option.label}
        </button>
      ))}
      {practice ? (
        <p className="text-xs text-primary">
          {practiceHit
            ? "That is the film’s line. The original check is still open."
            : "That is not the film’s line. Read the simpler line again."}
        </p>
      ) : null}
      {practiceHit ? (
        <button type="button" onClick={onRetry} className="text-xs font-semibold text-primary">
          Try the original check
        </button>
      ) : null}
    </div>
  );
}
