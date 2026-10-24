import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { YoutubeFrame } from "@/components/feed/YoutubeFrame";
import { SOURCE } from "@/lib/source";
import { thisCyberWeek, levelMap, type Brief } from "@/lib/cyber-week";
import { CYBER_LABS } from "@/lib/cyber-labs";
import { useFeedStore } from "@/lib/feed-store";
import { offerFurtherStudy } from "@/lib/further-study";
import { youtubePoster } from "@/lib/youtube";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hub/cyber")({ component: CyberWeekPage });

function CyberWeekPage() {
  const pack = useMemo(() => thisCyberWeek(), []);
  const isMuted = useFeedStore((s) => s.isMuted);
  const unlockSound = useFeedStore((s) => s.unlockSound);
  const toggleMute = useFeedStore((s) => s.toggleMute);
  const [play, setPlay] = useState(true);
  const feature = pack.films[0];
  const levels = useMemo(() => levelMap(), []);

  return (
    <AppShell>
      <ClinicFrame>
        <header className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Cyber week {pack.week} · {SOURCE}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold">What is trending in cybersecurity</h1>
          <p className="mt-2 text-sm text-muted">
            Cloud, AI, identity, supply chain. The catalog on Hub stays. This page turns every week.
          </p>
          <Link to="/hub" className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
            Back to Hub
          </Link>
          <Link to="/hub/tracks" className="ml-4 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
            All tracks
          </Link>
          <Link to="/hub/fleet" className="ml-4 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
            Study the defense course
          </Link>
        </header>

        {feature?.youtubeId ? (
          <YoutubeFrame
            postId={`week-${feature.id}`}
            youtubeId={feature.youtubeId}
            posterUrl={youtubePoster(feature.youtubeId)}
            playing={play}
            muted={isMuted}
            onToggle={() => {
              unlockSound();
              setPlay(true);
              toggleMute(`week-${feature.id}`);
            }}
            onEnded={() => offerFurtherStudy(feature.name)}
          />
        ) : null}

        <BriefCard item={pack.threat} />
        <BriefCard item={pack.cloud} />
        <BriefCard item={pack.ai} />
        <BriefCard item={pack.defend} />
        <BriefCard item={pack.red} />
        <BriefCard item={pack.grc} />
        <BriefCard item={pack.lab} accent />

        <section className="rounded-2xl bg-surface p-5 shadow-border">
          <h2 className="font-display text-lg font-semibold">Cybersecurity labs</h2>
          <p className="mt-1 text-xs text-muted">Watch → Learn → Practice → Test → Certify → Build → Share. Hypothetical tenants only.</p>
          <ul className="mt-3 space-y-2">
            {CYBER_LABS.map((lab) => (
              <li key={lab.id}>
                <Link
                  to="/hub/lab/$id"
                  params={{ id: lab.id }}
                  className="flex min-h-11 items-center justify-between rounded-xl px-2 hover:bg-elevated"
                >
                  <span>
                    <span className="block text-sm font-semibold">{lab.title}</span>
                    <span className="text-[11px] text-muted">{lab.cloud} · {lab.badge}</span>
                  </span>
                  <span className="text-[11px] font-semibold text-primary">Enter</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-surface p-5 shadow-border">
          <h2 className="font-display text-lg font-semibold">Ten films this week</h2>
          <p className="mt-1 text-xs text-muted">Official embeds only. License-gated tools stay at the vendor.</p>
          <ol className="mt-3 space-y-2">
            {pack.films.map((film, i) => (
              <li key={film.id}>
                <a
                  href={film.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-11 items-center justify-between gap-3 rounded-xl px-2 hover:bg-elevated"
                >
                  <span className="min-w-0">
                    <span className="font-mono text-[11px] text-subtle">{String(i + 1).padStart(2, "0")}</span>
                    <span className="ml-2 text-sm font-semibold">{film.name}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-muted">{film.shelf}</span>
                  </span>
                  <span className="shrink-0 text-[11px] font-semibold text-primary">Open</span>
                </a>
              </li>
            ))}
          </ol>
        </section>

        <WeekQuiz items={pack.quiz} />

        <section className="rounded-2xl bg-surface p-5 shadow-border">
          <h2 className="font-display text-lg font-semibold">Content map</h2>
          <p className="mt-1 text-xs text-muted">Beginner → Professional. Hub holds the houses. This is the path.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {levels.map((row) => (
              <article key={row.level} className="rounded-2xl bg-elevated p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{row.level}</p>
                <ul className="mt-2 space-y-1">
                  {row.houses.map((h) => (
                    <li key={h.id} className="text-sm">
                      {h.name}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </ClinicFrame>
    </AppShell>
  );
}

function BriefCard({ item, accent }: { item: Brief; accent?: boolean }) {
  return (
    <article className={cn("rounded-2xl p-5 shadow-border", accent ? "bg-elevated" : "bg-surface")}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{item.kicker}</p>
      <h2 className="mt-1 font-display text-lg font-semibold">{item.title}</h2>
      <p className="mt-2 text-sm text-muted">{item.body}</p>
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-primary"
      >
        Open the source
      </a>
    </article>
  );
}

function WeekQuiz({ items }: { items: { q: string; options: string[]; ok: number }[] }) {
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);
  const score = items.reduce((n, item, i) => n + (picked[i] === item.ok ? 1 : 0), 0);

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-border">
      <h2 className="font-display text-lg font-semibold">Quiz of the week</h2>
      <p className="mt-1 text-xs text-muted">Ten questions. No timer. The lab still matters more.</p>
      <ol className="mt-4 space-y-4">
        {items.map((item, i) => (
          <li key={item.q}>
            <p className="text-sm font-semibold">
              {i + 1}. {item.q}
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              {item.options.map((opt, j) => {
                const on = picked[i] === j;
                const reveal = done && j === item.ok;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setPicked((p) => ({ ...p, [i]: j }))}
                    className={cn(
                      "min-h-11 rounded-xl px-3 text-left text-sm",
                      reveal ? "bg-primary/20 text-fg" : on ? "bg-elevated text-fg" : "bg-bg text-muted",
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => setDone(true)}
        className="mt-4 min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
      >
        {done ? `${score} / ${items.length} held` : "Score the week"}
      </button>
    </section>
  );
}
