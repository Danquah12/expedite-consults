import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { AccountRail } from "@/components/layout/AccountRail";
import { KnowledgeDna } from "@/components/learn/KnowledgeDna";
import { MediaGrid } from "@/components/feed/MediaGrid";
import { ME } from "@/lib/current-user";
import { GOALS, levelFromXp } from "@/lib/learn";
import { SPARK_LIMIT } from "@/lib/engine";
import { useFeedStore } from "@/lib/feed-store";
import { postsByUser } from "@/lib/directory";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { IdentityCard } from "@/components/learn/IdentityCard";
import { SignalsCard } from "@/components/learn/SignalsCard";
import { NoctisMoves } from "@/components/noctis/NoctisMoves";
import { CAREERS } from "@/lib/career-nav";
import { readinessFor } from "@/lib/career-fit";
import { readBook, readDna, readHours } from "@/lib/hall-record";
import { LEARN_PATHS } from "@/lib/today-learned";
import { readEvents } from "@/lib/learn-events";

export const Route = createFileRoute("/you")({ component: YouPage });

function YouPage() {
  const hash = useRouterState({ select: (s) => s.location.hash }).replace(/^#/, "");
  const xp = useFeedStore((s) => s.xp);
  const goal = useFeedStore((s) => s.goal);
  const sparks = useFeedStore((s) => s.sparks);
  const echosDone = useFeedStore((s) => s.echosDone);
  const stamps = useFeedStore((s) => s.earnedStamps);
  const posts = useFeedStore((s) => s.posts);
  const mine = postsByUser(posts, ME.username);
  const lvl = levelFromXp(xp);
  const meta = GOALS.find((g) => g.id === goal);
  const { user } = useCurrentUserState();
  const name = user?.displayName ?? ME.name;
  const drills = Object.keys(useFeedStore((s) => s.drillPassed)).length;
  const [record, setRecord] = useState({
    path: "",
    hours: 0,
    certs: [] as string[],
    ready: [] as string[],
    skills: [] as string[],
    started: 0,
    finished: 0,
    quizzes: 0,
    notes: 0,
    paths: 0,
    activity: [] as string[],
  });

  useEffect(() => {
    const pathId = localStorage.getItem("vibetok-path-current") || "";
    const dna = readDna();
    let done: string[] = [];
    try {
      const saved = JSON.parse(localStorage.getItem("vibetok-career-nav") || "") as { done?: string[] };
      done = Array.isArray(saved.done) ? saved.done : [];
    } catch {
      done = [];
    }
    const certs = CAREERS.flatMap((career) =>
      career.stages.filter((stage) => stage.type === "Certification" && done.includes(stage.id)).map((stage) => `${stage.title} · ${career.name}`),
    );
    const ready = CAREERS.flatMap((career) => {
      const score = readinessFor(career, pathId, dna, done);
      return score.score == null ? [] : [`${career.name} ${score.score}% · ${score.level}`];
    }).slice(0, 4);
    const book = Object.values(readBook());
    let paths = 0;
    try {
      const started = JSON.parse(localStorage.getItem("vibetok-path-started") || "[]") as unknown;
      paths = Array.isArray(started) ? started.length : 0;
    } catch {
      paths = 0;
    }
    setRecord({
      path: LEARN_PATHS.find((item) => item.id === pathId)?.title || "",
      hours: readHours(),
      certs,
      ready,
      skills: Object.entries(dna).filter(([, value]) => value > 0).map(([label, value]) => `${label} ${value}`),
      started: book.filter((lesson) => lesson.progress > 0).length,
      finished: book.filter((lesson) => lesson.progress >= 100).length,
      quizzes: book.filter((lesson) => lesson.score).length,
      notes: book.filter((lesson) => lesson.notes).length,
      paths,
      activity: readEvents().slice(-6).reverse().map((row) => `${row.kind}: ${row.subject}`),
    });
  }, []);

  if (hash === "proof") {
    return (
      <AppShell>
        <ClinicFrame>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Proof</p>
          <p className="text-sm text-muted">What is stored and can be traced. This page does not change how Vibe behaves.</p>
          <Link to="/you" className="text-xs font-semibold text-primary">Back to Profile</Link>
          <section className="rounded-2xl bg-surface p-5 shadow-border">
            <h1 className="font-display text-xl font-semibold">{name}</h1>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Stat label="Level" value={lvl.level} />
              <Stat label="XP" value={xp} />
              <Stat label="Echoes" value={echosDone} />
            </div>
            <p className="mt-3 text-xs text-muted">Sparks {sparks}/{SPARK_LIMIT}. Goal: {meta?.label ?? "Not set"}.</p>
          </section>
          <section className="rounded-2xl bg-surface p-5 shadow-border">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Stamps</h2>
            {stamps.length ? (
              <ul className="mt-2 flex flex-wrap gap-2">
                {stamps.map((stamp) => (
                  <li key={stamp} className="rounded-full bg-elevated px-3 py-1 text-xs font-semibold">{stamp}</li>
                ))}
              </ul>
            ) : <p className="mt-2 text-sm text-muted">No stamp is stored.</p>}
            <p className="mt-2 text-xs text-muted">A stamp name is stored. A date and a verification score are not.</p>
          </section>
          <section className="rounded-2xl bg-surface p-5 shadow-border">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Recorded skills</h2>
            <p className="mt-2 text-sm">{record.skills.length ? record.skills.join(" · ") : "No DNA strand has a score yet."}</p>
            <p className="mt-1 text-xs text-muted">A verified skill score needs lesson, quiz, and assessment counts for that skill. Those counts are not stored per skill, so none is marked verified.</p>
            <h2 className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">Career readiness</h2>
            <p className="mt-2 text-sm">{record.ready.length ? record.ready.join(" · ") : "Not scored. A path, DNA strand, or checked certification is required."}</p>
            <h2 className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">Certifications</h2>
            <p className="mt-2 text-sm">{record.certs.length ? record.certs.join(" · ") : "No certification stage is checked."}</p>
            <h2 className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">Path</h2>
            <p className="mt-2 text-sm">{record.path || "No path is started."} {record.paths ? `· ${record.paths} started` : ""}</p>
            <h2 className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">Learning evidence</h2>
            <p className="mt-2 text-sm">Hall lessons started {record.started}. Completed {record.finished}. Quizzes scored {record.quizzes}. Notes saved {record.notes}. Drills passed {drills}. Learning hours {record.hours}. Posts {mine.length}.</p>
          </section>
          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Learning archive</h2>
            {mine.length ? <MediaGrid posts={mine} /> : <p className="text-sm text-muted">No post is stored on this profile.</p>}
          </div>
          <NoctisMoves items={[{ label: "Ask Noctis", ask: "What can I prove from my stamps, DNA, path, and checked certifications? Use only the stored record." }]} />
        </ClinicFrame>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ClinicFrame>
        <div className="xl:hidden">
          <AccountRail />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Profile</p>
        <p className="text-sm text-muted">How Noctis should behave for you. Achievements stay on Proof.</p>
        <section className="rounded-2xl bg-surface p-5 shadow-border">
          <div className="flex items-center gap-3">
            <img src={user?.profileImageUrl ?? ME.avatarUrl} alt="" className="size-14 rounded-full object-cover" />
            <div>
              <h1 className="font-display text-xl font-semibold">{name}</h1>
              <p className="text-xs text-muted">{user?.primaryEmail ?? `@${ME.username}`}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted">{ME.bio}</p>
          <p className="mt-2 text-xs text-muted">Goal: {meta?.label ?? "Not set"}. Path: {record.path || "None started"}.</p>
          <Link to="/you" hash="proof" className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-primary">Open Proof</Link>
        </section>
        <IdentityCard part="persona" />
        <section className="rounded-2xl bg-surface p-5 shadow-border">
          <KnowledgeDna compact />
          <p className="mt-2 text-xs text-muted">A change over time is not stored, so no growth trend is shown.</p>
        </section>
        <IdentityCard part="access" />
        <SignalsCard />
        <section className="rounded-2xl bg-surface p-5 shadow-border">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Activity</h2>
          {record.activity.length ? (
            <ul className="mt-2 space-y-1 text-sm">{record.activity.map((line) => <li key={line}>{line}</li>)}</ul>
          ) : (
            <p className="mt-2 text-sm text-muted">No learning signal is stored. Signals stay off until you turn them on, and they are kept for 14 days.</p>
          )}
        </section>
        <section className="rounded-2xl bg-surface p-5 shadow-border">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Account</h2>
          <p className="mt-2 text-sm text-muted">Hall settings and color are in the account card. Notifications, connected accounts, and a password screen are not stored here.</p>
        </section>
        <NoctisMoves items={[{ label: "Ask Noctis", ask: "What do you already know about how I want Noctis to behave? Use only my persona, goal, and the sources I allowed." }]} />
      </ClinicFrame>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="rounded-xl bg-elevated px-3 py-2">
      <span className="block font-mono text-sm font-semibold tabular-nums">{value}</span>
      <span className="block text-[10px] uppercase tracking-wider text-subtle">{label}</span>
    </span>
  );
}
