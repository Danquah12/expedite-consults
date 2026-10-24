import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { searchDirectory } from "@/lib/directory";
import { useFeedStore } from "@/lib/feed-store";
import { noteEvent, topSubjects } from "@/lib/learn-events";

export const Route = createFileRoute("/explore")({ component: ExplorePage });

function ExplorePage() {
  const posts = useFeedStore((s) => s.posts);
  const [q, setQ] = useState("");
  const result = useMemo(() => searchDirectory(q, posts), [q, posts]);
  const suggested = topSubjects();

  function look(value: string) {
    setQ(value);
    if (value.trim().length > 2) noteEvent("search", value.trim());
  }

  return (
    <AppShell>
      <ClinicFrame>
        <header className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Explore</p>
          <h1 className="mt-1 font-display text-2xl font-semibold">Find it across Noctis</h1>
          <input
            value={q}
            onChange={(e) => look(e.target.value)}
            placeholder="Cybersecurity, a person, a lesson, a community."
            className="mt-3 w-full rounded-xl bg-elevated px-3 py-2 text-sm outline-none"
          />
          <p className="mt-2 text-xs text-muted">Videos, people, communities, and lessons in one search.</p>
          {suggested.length ? <p className="mt-2 text-xs text-muted">From your learning: {suggested.join(" · ")}</p> : null}
        </header>
        <section className="rounded-2xl bg-surface p-4 shadow-border">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Educational hub</h2>
          <p className="mt-1 text-sm text-muted">MIT, TED, Khan, NASA — embedded. Coursera and edX stay on their site.</p>
          <Link to="/hub" className="mt-2 inline-block text-xs font-semibold text-primary">
            Open the hub
          </Link>
        </section>
        <section className="rounded-2xl bg-surface p-4 shadow-border">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">People</h2>
          <ul className="mt-2 space-y-2">
            {result.people.slice(0, 6).map((p) => (
              <li key={p.username}>
                <Link to="/u/$username" params={{ username: p.username }} className="flex items-center gap-2.5">
                  <img src={p.avatar} alt="" className="size-8 rounded-full object-cover" />
                  <span>
                    <span className="block text-sm font-semibold">{p.name}</span>
                    <span className="block text-[11px] text-subtle">{p.bio}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl bg-surface p-4 shadow-border">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Communities</h2>
          <ul className="mt-2 space-y-2">
            {result.crews.slice(0, 6).map((crew) => (
              <li key={crew.id}>
                <Link to="/calls" className="block text-sm">
                  <span className="font-semibold">{crew.name}</span>
                  <span className="block text-xs text-muted">{crew.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl bg-surface p-4 shadow-border">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Lessons</h2>
          <ul className="mt-2 space-y-2">
            {result.posts.slice(0, 6).map((p) => (
              <li key={`lesson-${p.id}`}>
                <Link to="/study" className="block text-sm">
                  <span className="font-semibold">{p.teach.stamp}</span>
                  <span className="block text-xs text-muted">{p.teach.hook}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl bg-surface p-4 shadow-border">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Videos</h2>
          <ul className="mt-2 space-y-2">
            {result.posts.slice(0, 8).map((p) => (
              <li key={p.id}>
                <Link to="/" hash={`post-${p.id}`} className="block text-sm">
                  <span className="font-semibold">{p.teach.stamp}</span>
                  <span className="block text-xs text-muted">{p.teach.hook}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </ClinicFrame>
    </AppShell>
  );
}
