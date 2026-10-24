import { Link } from "@tanstack/react-router";
import { useFeedStore } from "@/lib/feed-store";
import { GOALS, levelFromXp } from "@/lib/learn";
import { OPENING_TABS } from "@/lib/openings";
import { SourceLink } from "@/components/feed/EndHold";
import { nextPullAt } from "@/lib/ingest-sources";
import { formatWhen } from "@/lib/format";
import { scrollToFeed } from "@/lib/syndicate";
import { tilToday } from "@/lib/today-learned";
import { hymnOfDay } from "@/lib/hymn-desk";

export function DailyBrief() {
  const xp = useFeedStore((s) => s.xp);
  const goal = useFeedStore((s) => s.goal);
  const posts = useFeedStore((s) => s.posts);
  const passed = useFeedStore((s) => s.drillPassed);
  const echos = useFeedStore((s) => s.echosDone);
  const ingestAt = useFeedStore((s) => s.ingestAt);
  const toggleFlip = useFeedStore((s) => s.toggleFlip);
  const lvl = levelFromXp(xp);
  const meta = GOALS.find((g) => g.id === goal);
  const next = posts.find((p) => p.lane === "learn" && !passed[p.id]);
  const streak = Math.min(30, 3 + echos);
  const house = posts.filter((p) => !p.id.startsWith("in-") && !p.id.startsWith("u-")).length;
  const til = tilToday();
  const hymn = hymnOfDay();

  return (
    <section className="overflow-hidden rounded-2xl bg-surface shadow-border">
      <div className="bg-wash-ember px-3 py-3 sm:px-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Academy</p>
            <h2 className="mt-0.5 truncate font-display text-base font-semibold">Knowledge becomes skill through practice.</h2>
            <p className="mt-0.5 truncate text-[11px] text-muted">
              {streak}-day · {meta?.label} · Lv {lvl.level}
              {house ? ` · ${house} house` : ""}
              {ingestAt ? ` · Next ${formatWhen(nextPullAt())}` : ""}
            </p>
          </div>
          {next ? (
            <button
              type="button"
              onClick={() => {
                toggleFlip(next.id);
                scrollToFeed(next.id);
              }}
              className="shrink-0 rounded-full bg-primary px-3 py-2 text-[11px] font-semibold text-primary-fg"
            >
              {next?.teach?.stamp ?? "Open"}
            </button>
          ) : (
            <span className="shrink-0 text-[11px] text-subtle">All stamps</span>
          )}
        </div>
        <p className="mt-2 text-[12px] leading-snug text-caption">
          <span className="font-semibold">{til.title}.</span> {til.line}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5 px-3 py-2.5">
        <Link
          to="/study"
          search={{ desk: "nist", family: undefined, step: "watch" }}
          className="inline-flex min-h-9 shrink-0 items-center rounded-full bg-elevated px-3 py-1.5 text-[11px] font-semibold text-muted hover:text-fg"
        >
          NIST 800-53
        </Link>
        <Link
          to="/study"
          search={{ desk: "pentest", family: undefined, step: "watch" }}
          className="inline-flex min-h-9 shrink-0 items-center rounded-full bg-elevated px-3 py-1.5 text-[11px] font-semibold text-muted hover:text-fg"
        >
          Pentest
        </Link>
        <Link
          to="/music"
          className="inline-flex min-h-9 shrink-0 items-center rounded-full bg-elevated px-3 py-1.5 text-[11px] font-semibold text-muted hover:text-fg"
        >
          {hymn.title}
        </Link>
        {OPENING_TABS.slice(0, 4).map((t) => (
          <Link
            key={t.id}
            to="/openings"
            hash={t.id}
            className="inline-flex min-h-9 shrink-0 items-center rounded-full bg-elevated px-3 py-1.5 text-[11px] font-semibold text-muted hover:text-fg"
          >
            {t.label}
          </Link>
        ))}
        <Link to="/you" className="inline-flex min-h-9 shrink-0 items-center rounded-full bg-elevated px-3 py-1.5 text-[11px] font-semibold text-muted hover:text-fg">
          Proof
        </Link>
      </div>
      <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.14em] text-subtle">
        Source · <SourceLink />
      </p>
    </section>
  );
}
