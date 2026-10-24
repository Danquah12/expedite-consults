import type { FeedPost, Teach } from "@/lib/feed-data";

export type ProofQ = {
  prompt: string;
  options: { id: string; label: string; ok: boolean }[];
};

function turn(options: ProofQ["options"], salt: number) {
  const n = ((salt % options.length) + options.length) % options.length;
  return options.slice(n).concat(options.slice(0, n)).map((o, i) => ({ ...o, id: "abc"[i] ?? "a" }));
}

/** Three checks from the clip's own lesson. No extra content bank. */
export function proofQuestions(post: FeedPost): ProofQ[] {
  const teach: Teach = post.teach;
  const wrong = teach.options.filter((o) => !o.ok).map((o) => o.label);
  const salt = post.id.length + post.teach.stamp.length;
  return [
    { prompt: teach.prompt, options: teach.options },
    {
      prompt: "Which stamp does a pass write on your account?",
      options: turn(
        [
          { id: "a", label: teach.stamp, ok: true },
          { id: "b", label: wrong[0] || "A like", ok: false },
          { id: "c", label: wrong[1] || "A repost", ok: false },
        ],
        salt,
      ),
    },
    {
      prompt: "What should you remember from this clip?",
      options: turn(
        [
          { id: "a", label: teach.hook, ok: true },
          { id: "b", label: wrong[0] || "Scroll past it", ok: false },
          { id: "c", label: "Only the view count", ok: false },
        ],
        salt + 1,
      ),
    },
  ];
}
