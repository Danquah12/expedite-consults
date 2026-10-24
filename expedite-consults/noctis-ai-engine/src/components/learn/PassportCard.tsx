import { useState } from "react";
import type { FeedPost } from "@/lib/feed-data";
import type { DayWatch } from "@/lib/shuffle";
import { passportBars, passportOn, setPassport } from "@/lib/passport";

export function PassportCard({ posts, watch, passed }: { posts: FeedPost[]; watch: DayWatch; passed: Record<string, boolean> }) {
  const [on, setOn] = useState(passportOn);
  const bars = passportBars(posts, watch, passed);

  return (
    <section className="mt-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Knowledge passport</p>
        <button
          type="button"
          onClick={() => {
            const next = !on;
            setPassport(next);
            setOn(next);
          }}
          className="text-xs font-semibold text-primary"
        >
          {on ? "Turn off" : "Keep a record"}
        </button>
      </div>
      {!on ? (
        <p className="mt-1 text-sm text-muted">Off. This is a learning record on this device. It is not a political profile, and it is not sent as a score.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {bars.map((bar) => (
            <li key={bar.label}>
              <div className="flex justify-between text-xs">
                <span className="font-semibold">{bar.label}</span>
                <span className="text-muted">{bar.seen ? `${bar.pass} of ${bar.seen} checks` : "No check yet"}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-elevated">
                <div className="h-full bg-primary" style={{ width: `${bar.pct}%` }} />
              </div>
            </li>
          ))}
          <li className="text-[11px] text-muted">The bar is checks passed among checks you started in that track. It is not a measure of the whole field.</li>
        </ul>
      )}
    </section>
  );
}
