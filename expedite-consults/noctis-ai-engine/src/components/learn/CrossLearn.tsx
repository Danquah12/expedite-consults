import type { FeedPost } from "@/lib/feed-data";
import { bridgesFor } from "@/lib/cross-learn";
import { filmText } from "@/lib/knowledge-graph";

export function CrossLearn({ post }: { post: FeedPost }) {
  const bridges = bridgesFor(filmText(post));
  if (!bridges.length) return null;
  return (
    <section>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Related knowledge</h3>
      <p className="mt-1 text-xs text-muted">A map of neighboring fields. It is not a claim that you have studied them.</p>
      <ul className="mt-2 space-y-1">
        {bridges.map((bridge) => (
          <li key={`${bridge.to}-${bridge.via}`} className="rounded-xl bg-elevated px-3 py-2 text-sm">
            <span className="font-semibold">{bridge.to}</span>
            <span className="text-muted"> → {bridge.via}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
