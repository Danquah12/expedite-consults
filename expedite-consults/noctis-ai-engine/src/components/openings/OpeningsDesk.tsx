import { useEffect, useMemo, useState } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { HireDesk } from "@/components/openings/HireDesk";
import { OPENING_TABS, TUTOR_HINTS, JOB_LAUNCHPAD, openingsForHall, type Opening, type OpeningKind } from "@/lib/openings";
import { useFeedStore } from "@/lib/feed-store";
import { scrollToFeed } from "@/lib/syndicate";
import { cn } from "@/lib/utils";
import { HallSpread } from "@/components/learn/HallSpread";
import { LedgerLane } from "@/components/feed/LedgerLane";

const KINDS: OpeningKind[] = OPENING_TABS.map((t) => t.id);

export function OpeningsDesk({ bare = false }: { bare?: boolean }) {
  const hash = useRouterState({ select: (s) => s.location.hash.replace("#", "") });
  const start = KINDS.includes(hash as OpeningKind) ? (hash as OpeningKind) : "challenge";
  const [tab, setTab] = useState<OpeningKind>(start);

  useEffect(() => {
    if (KINDS.includes(hash as OpeningKind)) setTab(hash as OpeningKind);
  }, [hash]);
  const meta = OPENING_TABS.find((t) => t.id === tab);

  return (
    <div className="space-y-4">
      {bare ? null : (
        <header className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Seats</p>
          <h1 className="mt-1 font-display text-2xl font-semibold">A reason to come back.</h1>
          <p className="mt-2 text-sm text-muted">Challenge, hire by stamp, certs, boards. The academy is where you practice.</p>
        </header>
      )}
      <HallSpread tab="openings" />
      <LedgerLane tab="career" />
      <div className="flex flex-wrap gap-2">
        {OPENING_TABS.map((t) => (
          <Link
            key={t.id}
            to="/openings"
            hash={t.id}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-xs font-semibold",
              tab === t.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <p className="text-xs text-subtle">{meta?.hint}</p>
      {tab === "tutor" ? <TutorDesk /> : tab === "hire" ? <HireDesk /> : <List kind={tab} />}
    </div>
  );
}

function List({ kind }: { kind: Exclude<OpeningKind, "tutor"> }) {
  const ticket = useFeedStore((s) => s.ticket);
  const stamps = useFeedStore((s) => s.earnedStamps);
  const clinicDesk = useFeedStore((s) => s.clinicDesk);
  const rows = openingsForHall(kind, ticket, stamps, clinicDesk);
  return (
    <div className="space-y-2">
      {kind === "jobs" ? (
        <a
          href={JOB_LAUNCHPAD.href}
          target="_blank"
          rel="noreferrer"
          className="block rounded-2xl bg-surface p-4 shadow-border ring-1 ring-primary"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Expedite Consults</p>
          <p className="mt-1 font-display text-lg font-semibold">Training Launch pad</p>
          <p className="mt-0.5 text-xs text-muted">expedite-consults.vercel.app/launchpad</p>
          <p className="mt-2 text-sm leading-relaxed">Training, then the next seat. This opens the Expedite Training Launch pad.</p>
          <p className="mt-2 text-[11px] font-semibold text-primary">Open Training Launch pad</p>
        </a>
      ) : null}
      {kind === "jobs" || kind === "certs" || kind === "boards" ? (
        <p className="text-xs text-muted">
          Sorted to your ticket and stamps. Every link is the official body. We do not sell vouchers or copy exams.
        </p>
      ) : null}
      {rows.filter((row) => row.id !== "j-launchpad").map((row) => (
        <OpeningCard key={row.id} row={row} hot={kind === "jobs" && Boolean(row.stamp && stamps.includes(row.stamp))} />
      ))}
    </div>
  );
}

function OpeningCard({ row, hot }: { row: Opening; hot?: boolean }) {
  const router = useRouter();
  const body = (
    <>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{row.tag}</p>
      <p className="mt-1 font-display text-lg font-semibold">{row.title}</p>
      <p className="mt-0.5 text-xs text-muted">{row.place}</p>
      <p className="mt-2 text-sm leading-relaxed">{row.line}</p>
      {row.board ? (
        <p className="mt-2 text-[11px] font-semibold text-primary">
          {hot ? "Stamp matches · " : ""}Open at {row.board}
        </p>
      ) : null}
    </>
  );
  const shell = cn("block w-full rounded-2xl p-4 text-left shadow-border", hot ? "bg-elevated" : "bg-surface");

  if (row.postId) {
    const id = row.postId;
    return (
      <button
        type="button"
        className={shell}
        onClick={() => {
          void router.navigate({ to: "/", hash: "feed" });
          window.setTimeout(() => scrollToFeed(id), 160);
        }}
      >
        {body}
      </button>
    );
  }
  if (row.href?.startsWith("http")) {
    return (
      <a href={row.href} target="_blank" rel="noreferrer" className={shell}>
        {body}
      </a>
    );
  }
  if (row.href?.startsWith("/")) {
    const href = row.href;
    return (
      <button type="button" className={shell} onClick={() => router.history.push(href)}>
        {body}
      </button>
    );
  }
  return <article className={shell}>{body}</article>;
}

function TutorDesk() {
  const posts = useFeedStore((s) => s.posts);
  const [q, setQ] = useState("");
  const plan = useMemo(() => {
    const text = q.trim().toLowerCase();
    if (!text) return [];
    const words = text.split(/\s+/).filter((w) => w.length > 3);
    return posts
      .filter((p) => {
        const hay = `${p.caption} ${p.teach.stamp} ${p.teach.hook} ${p.hashtags.join(" ")}`.toLowerCase();
        return words.some((w) => hay.includes(w));
      })
      .slice(0, 3);
  }, [posts, q]);

  return (
    <div className="space-y-3">
      <label className="block rounded-2xl bg-surface p-4 shadow-border">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Teach me</span>
        <textarea
          value={q}
          onChange={(e) => setQ(e.target.value)}
          rows={3}
          placeholder="I have an exam tomorrow on organic chemistry."
          className="mt-2 w-full resize-none bg-transparent text-sm outline-none placeholder:text-subtle"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {TUTOR_HINTS.map((hint) => (
          <button
            key={hint}
            type="button"
            onClick={() => setQ(hint)}
            className="min-h-11 rounded-full bg-elevated px-3 text-xs font-semibold text-muted"
          >
            {hint}
          </button>
        ))}
      </div>
      {q.trim() && !plan.length ? (
        <p className="text-sm text-muted">No clinic matches that line yet. Try a stamp you can see in the feed.</p>
      ) : null}
      {plan.map((post, i) => (
        <Link
          key={post.id}
          to="/"
          hash={`post-${post.id}`}
          onClick={() => window.setTimeout(() => scrollToFeed(post.id), 160)}
          className="block rounded-2xl bg-surface p-4 shadow-border"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
            Step {i + 1} · {post.teach.stamp}
          </p>
          <p className="mt-1 font-display text-lg font-semibold">{post.teach.hook}</p>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{post.caption}</p>
        </Link>
      ))}
    </div>
  );
}
