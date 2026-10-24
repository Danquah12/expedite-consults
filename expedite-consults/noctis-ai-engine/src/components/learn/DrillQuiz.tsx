import { useRef, useState } from "react";
import type { FeedPost, Teach } from "@/lib/feed-data";
import { filmNotes } from "@/lib/study-this";
import { useFeedStore } from "@/lib/feed-store";
import { Button } from "@/components/ui/button";
import { MistakeWalk } from "@/components/learn/MistakeWalk";
import { cn } from "@/lib/utils";

function drillTeach(post: FeedPost): Teach {
  const filler = /what belongs on this clinic|a louder clip|whatever trended/i.test(
    `${post.teach.prompt} ${post.teach.options.map((o) => o.label).join(" ")}`,
  );
  if (!filler) return post.teach;
  const note = filmNotes(post)[0];
  const claim = note?.onFilm ?? post.teach.hook;
  return {
    ...post.teach,
    prompt: `What does the line on the film mean? “${claim}”`,
    options: [
      { id: "a", label: note?.means.slice(0, 140) ?? claim, ok: true },
      { id: "b", label: "Only the channel name, with no claim", ok: false },
      { id: "c", label: "Whatever happened to be trending", ok: false },
    ],
  };
}

export function DrillQuiz({ post }: { post: FeedPost }) {
  const teach = drillTeach(post);
  const completeDrill = useFeedStore((s) => s.completeDrill);
  const noteStruggle = useFeedStore((s) => s.noteStruggle);
  const passed = useFeedStore((s) => s.drillPassed[post.id]);
  const [pick, setPick] = useState<string | null>(null);
  const pickRef = useRef<string | null>(null);
  const [done, setDone] = useState(false);
  const chosen = teach.options.find((o) => o.id === pick);
  const ok = chosen?.ok;

  return (
    <div className="rounded-2xl bg-elevated p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">60s drill · {post.teach.stamp}</p>
      <p className="mt-2 text-sm font-semibold">{teach.prompt}</p>
      <div className="mt-3 space-y-1.5">
        {teach.options.map((o) => (
          <button
            key={o.id}
            type="button"
            disabled={done || passed}
            onClick={() => {
              pickRef.current = o.id;
              setPick(o.id);
            }}
            className={cn(
              "w-full rounded-xl px-3 py-2 text-left text-sm",
              pick === o.id ? "bg-primary text-primary-fg" : "bg-surface hover:bg-bg",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      {passed ? (
        <p className="mt-3 text-xs text-primary">Stamp earned. The map stays private.</p>
      ) : (
        <Button
          className="mt-3 w-full"
          disabled={!pick && !pickRef.current}
          onClick={() => {
            const id = pickRef.current ?? pick;
            const hit = teach.options.find((o) => o.id === id)?.ok;
            setDone(true);
            if (hit) completeDrill(post.id);
            else noteStruggle(post.id);
          }}
        >
          {done ? (ok ? "Passed" : "Walk the mix-up") : "Submit"}
        </Button>
      )}
      {done && !ok && !passed ? (
        <MistakeWalk
          post={post}
          chosen={chosen?.label ?? ""}
          onRetry={() => {
            setDone(false);
            setPick(null);
            pickRef.current = null;
          }}
        />
      ) : null}
    </div>
  );
}
