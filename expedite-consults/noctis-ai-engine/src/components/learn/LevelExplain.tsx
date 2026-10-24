import { useState } from "react";
import type { FeedPost } from "@/lib/feed-data";
import { useFeedStore } from "@/lib/feed-store";

const LEVELS = ["Simply", "Normally", "Technically", "Age 12", "Example", "Mathematics", "Test me", "Debate", "Sources"] as const;
type Level = (typeof LEVELS)[number];

function filmLines(text: string, size: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  for (let i = 0; i < words.length && lines.length < 4; i += size) lines.push(words.slice(i, i + size).join(" "));
  return lines;
}

export function LevelExplain({ post }: { post: FeedPost }) {
  const openModal = useFeedStore((s) => s.openModal);
  const [level, setLevel] = useState<Level>("Normally");
  const hook = post.teach.hook;
  const more = post.caption.length > hook.length + 40 ? post.caption : "";
  const math = post.caption.match(/(\d[\d,.]*%?|\bformula\b|\bequation\b)/gi) ?? [];

  let body = hook;
  if (level === "Simply") body = filmLines(hook, 8).join(" ");
  if (level === "Normally") body = hook;
  if (level === "Technically") body = more || "This film does not go past the normal line.";
  if (level === "Age 12") body = filmLines(hook, 8).join(". ");
  if (level === "Example") body = `The film’s own line: ${hook}`;
  if (level === "Mathematics") body = math.length ? `Numbers in the film: ${[...new Set(math)].slice(0, 6).join(", ")}` : "This film does not show mathematics.";

  return (
    <section>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">At your level</h3>
      <div className="mt-1 flex flex-wrap gap-1">
        {LEVELS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => {
              setLevel(name);
              if (name === "Test me") document.getElementById("study-quiz")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
              if (name === "Debate") openModal({ type: "think", claim: hook });
              if (name === "Sources") document.getElementById("study-sources")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }}
            className={`rounded-full px-2 py-1 text-[10px] font-semibold ${level === name ? "bg-primary text-primary-fg" : "bg-elevated text-muted"}`}
          >
            {name}
          </button>
        ))}
      </div>
      {level === "Test me" || level === "Debate" || level === "Sources" ? (
        <p className="mt-2 text-sm text-muted">
          {level === "Test me" ? "The check is below. It uses the film’s question." : null}
          {level === "Debate" ? "The thinking coach is open. It asks. It does not decide." : null}
          {level === "Sources" ? "Primary lines are the retrieved passages below. If none were retrieved, the claim stays unverified." : null}
        </p>
      ) : (
        <p className="mt-2 text-sm leading-relaxed">{body}</p>
      )}
      <p className="mt-1 text-[11px] text-muted">Every line is from this film, or a statement that the film did not say more.</p>
    </section>
  );
}