import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LEARN_TRACKS } from "@/lib/command-catalog";
import { CLINIC_DESKS } from "@/lib/ingest-sources";
import { HYMNS } from "@/lib/hymn-desk";
import { DeskHead, DeskOpen, DeskStat } from "@/components/desk/DeskHead";
import { listKnowledgeGaps, listCommunityHealth, seatKnowledgeGap } from "@/lib/customer-api";
import { sideOf, conceptCounts, curriculumQueue } from "@/lib/knowledge-gaps";
import { PLATFORM_MAP, AI_MAP, RAG_STEPS } from "@/lib/platform-map";
import { useFeedStore } from "@/lib/feed-store";

export const Route = createFileRoute("/desk/learn")({ component: DeskLearn });

function DeskLearn() {
  const posts = useFeedStore((s) => s.posts);
  const watch = useFeedStore((s) => s.dayWatch);
  const passed = useFeedStore((s) => s.drillPassed);
  const missed = useFeedStore((s) => s.drillMissed);
  const local = conceptCounts(posts, watch, passed, missed);
  const [roll, setRoll] = useState<Awaited<ReturnType<typeof listKnowledgeGaps>> | null>(null);
  const [health, setHealth] = useState<Awaited<ReturnType<typeof listCommunityHealth>> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  function load() {
    void listKnowledgeGaps()
      .then((next) => {
        setRoll(next);
        setErr(null);
      })
      .catch((caught: unknown) => setErr(caught instanceof Error ? caught.message : "Gap count unavailable"));
    void listCommunityHealth()
      .then((next) => setHealth(next))
      .catch(() => setHealth(null));
  }

  useEffect(() => {
    load();
  }, []);

  const stored = roll?.rows ?? [];
  const struggle = stored.filter((row) => sideOf(row) === "struggle");
  const understood = stored.filter((row) => sideOf(row) === "understood");
  const localStruggle = local.filter((row) => sideOf(row) === "struggle");
  const teachNext = curriculumQueue([
    ...stored.map((row) => ({ name: row.name, passed: row.passed, missed: row.missed })),
    ...local.map((row) => ({ name: row.name, passed: row.passed, missed: row.missed, seen: row.seen })),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <DeskHead kicker="Learning" title="Learning control" note="Courses, halls, hymn lessons, and tracks the clinic already seats. This is the layer that makes Noctis more than a feed." />
      <section className="rounded-2xl bg-surface p-4 shadow-border">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Knowledge gaps</p>
        <p className="mt-1 text-sm text-muted">
          Counted clinics: {roll?.learners ?? 0}. A concept is a gap only when stored misses are at least the stored passes. The number is the clinics that reported, not a guess.
        </p>
        {err ? <p className="mt-2 text-sm text-live">{err}</p> : null}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Understood</p>
            {understood.length ? (
              <ul className="mt-1 space-y-1 text-sm">
                {understood.map((row) => (
                  <li key={row.name}>{row.name} · {row.passed} passed · {row.learners} clinics</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-muted">No concept has a clean pass yet.</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Struggle</p>
            {struggle.length ? (
              <ul className="mt-1 space-y-2 text-sm">
                {struggle.map((row) => (
                  <li key={row.name}>
                    <p>{row.name} · {row.missed} missed · {row.passed} passed</p>
                    <p className="text-xs text-primary">There is a learning gap around {row.name.toLowerCase()}.</p>
                    <button
                      type="button"
                      className="mt-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-fg"
                      onClick={() => {
                        void seatKnowledgeGap({ data: { name: row.name, house: row.house } })
                          .then(() => {
                            setNote(`Lesson seated for ${row.name}. It appears on Study.`);
                            load();
                          })
                          .catch(() => setNote("The lesson could not be seated."));
                      }}
                    >
                      Seat a lesson
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-muted">No stored concept has more misses than passes.</p>
            )}
          </div>
        </div>
        {localStruggle.length ? (
          <p className="mt-3 text-xs text-muted">
            This clinic, not yet in the count: {localStruggle.map((row) => row.name).join(", ")}.
          </p>
        ) : null}
        {note ? <p className="mt-2 text-xs text-primary">{note}</p> : null}
      </section>
      <section className="rounded-2xl bg-surface p-4 shadow-border">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">What to teach next</p>
        <p className="mt-1 text-sm text-muted">Built from stored misses and checks that were started and not finished. Not from a guessed crowd of learners.</p>
        {teachNext.length ? (
          <ul className="mt-2 space-y-2">
            {teachNext.map((row) => (
              <li key={`${row.name}-${row.why}`} className="text-sm">
                <span className="font-semibold">{row.name}. </span>
                <span className="text-muted">{row.why}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">Nothing in the stored checks is waiting for a new lesson.</p>
        )}
      </section>
      <section className="rounded-2xl bg-surface p-4 shadow-border">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">AI map</p>
        <p className="mt-1 text-sm text-muted">Core, knowledge, and memory feed the agents. Verify stamps the answer before it is shown.</p>
        <p className="mt-2 text-xs text-muted">{RAG_STEPS.join(" → ")}</p>
        <div className="mt-3 space-y-4">
          {[...new Set(AI_MAP.map((row) => row.layer))].map((layer) => (
            <div key={layer}>
              <p className="text-sm font-semibold">{layer}</p>
              <ul className="mt-1 space-y-2">
                {AI_MAP.filter((row) => row.layer === layer).map((row) => (
                  <li key={row.name} className="rounded-xl bg-elevated px-3 py-2">
                    <p className="text-sm">
                      <span className="font-semibold">{row.name}. </span>
                      <span className="text-primary">{row.state}.</span>
                    </p>
                    <p className="text-sm text-muted">{row.note}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted">
                      {row.module} · {row.api} · {row.store} · {row.button}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl bg-surface p-4 shadow-border">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">What is actually built</p>
        <ul className="mt-2 space-y-2">
          {PLATFORM_MAP.map((row) => (
            <li key={row.name} className="text-sm">
              <span className="font-semibold">{row.name}. </span>
              <span className="text-primary">{row.state}. </span>
              <span className="text-muted">{row.note}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-2xl bg-surface p-4 shadow-border">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Community health</p>
        <p className="mt-1 text-sm text-muted">
          Last {health?.notes ?? 0} stored notes. Likes are listed and then set aside. A blank signal means it was not stored.
        </p>
        <ul className="mt-3 space-y-2">
          {(health?.signals ?? []).map((signal) => (
            <li key={signal.id} className="rounded-xl bg-elevated px-3 py-2">
              <p className="text-sm font-semibold">{signal.label}</p>
              <p className="text-sm text-primary">{signal.value}</p>
              <p className="text-xs text-muted">{signal.detail}</p>
            </li>
          ))}
        </ul>
      </section>
      <div className="flex flex-wrap gap-2">
        <DeskOpen to="/study" label="Study" />
        <DeskOpen to="/hub" label="Hub" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <DeskStat label="Halls" value={CLINIC_DESKS.length} />
        <DeskStat label="Tracks" value={LEARN_TRACKS.length} />
        <DeskStat label="Hymn lessons" value={HYMNS.length} />
      </div>
      <ul className="space-y-2">
        {LEARN_TRACKS.map((t) => (
          <li key={t.id} className="rounded-2xl bg-surface px-4 py-3 shadow-border">
            <p className="text-sm font-semibold">{t.label}</p>
            <p className="mt-1 text-xs text-muted">{t.objects}</p>
          </li>
        ))}
      </ul>
      <ul className="flex flex-wrap gap-1">
        {CLINIC_DESKS.map((d) => (
          <li key={d.id} className="rounded-full bg-elevated px-3 py-1.5 text-xs font-semibold text-muted">
            {d.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
