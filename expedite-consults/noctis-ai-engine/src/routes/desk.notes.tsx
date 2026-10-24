import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { listNotes, reviseNote } from "@/lib/admin-api";
import { listMemberEvidence } from "@/lib/activity-api";
import { DeskHead, deskClock } from "@/components/desk/DeskHead";
import { readQueuedNotes, syncFiledNotes, type QueuedNote } from "@/lib/feed-store";

export const Route = createFileRoute("/desk/notes")({ component: DeskNotes });

const MARKS = ["keep", "done", "drop"] as const;

type Saved = Awaited<ReturnType<typeof listNotes>>[number];

const FILTERS = [
  { id: "All", actions: null },
  { id: "Sign in", actions: ["sign-in", "sign-out", "account"] },
  { id: "Watch", actions: ["watch"] },
  { id: "Search", actions: ["search"] },
  { id: "Like", actions: ["like", "unlike", "save", "repost", "share"] },
  { id: "Comment", actions: ["comment", "send", "note"] },
  { id: "Follow", actions: ["follow", "subscribe"] },
  { id: "Study", actions: ["study", "study-join", "study-leave", "study-chat", "check", "stamp", "community"] },
  { id: "Vibe", actions: ["vibe"] },
] as const;

function DeskNotes() {
  const [rows, setRows] = useState<Saved[]>([]);
  const [evidence, setEvidence] = useState<Awaited<ReturnType<typeof listMemberEvidence>>>([]);
  const [waiting, setWaiting] = useState<QueuedNote[]>([]);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("All");
  const [checked, setChecked] = useState("");
  const load = () => {
    syncFiledNotes();
    setWaiting(readQueuedNotes());
    void listMemberEvidence()
      .then((next) => {
        setEvidence(next);
        setChecked(new Date().toISOString());
        setErr(null);
      })
      .catch((caught: unknown) => {
        setErr(caught instanceof Error ? caught.message : "Could not load the trail");
      });
    void listNotes()
      .then((next) => {
        setRows(next);
        const saved = new Set(next.map((row) => row.token).filter(Boolean));
        setWaiting(readQueuedNotes().filter((row) => !saved.has(row.token)));
      })
      .catch(() => undefined);
  };
  useEffect(() => {
    load();
    const timer = window.setInterval(load, 5000);
    const onStore = (event: StorageEvent) => {
      if (event.key === "vibetok-notes-queue") load();
    };
    window.addEventListener("storage", onStore);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", onStore);
    };
  }, []);

  function mark(id: number, status: (typeof MARKS)[number]) {
    void reviseNote({ data: { id, status, revise: drafts[id] ?? "" } }).then(load);
  }

  const chosen = FILTERS.find((item) => item.id === filter) ?? FILTERS[0];
  const shown = evidence.filter((row) => !chosen.actions || (chosen.actions as readonly string[]).includes(row.action));
  const count = (id: (typeof FILTERS)[number]["id"]) => {
    const chip = FILTERS.find((item) => item.id === id);
    if (!chip?.actions) return evidence.length;
    return evidence.filter((row) => (chip.actions as readonly string[]).includes(row.action)).length;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <DeskHead
        kicker="Notes"
        title="What members did"
        note="Live record for this site. Sign-ins, watches, searches, likes, comments, follows, study, and Vibe questions land here. This page checks every 5 seconds."
      />
      <section className="rounded-2xl bg-surface p-4 shadow-border" aria-label="Desk Note Public Screening and Archive Sources">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Desk Note · Public Screening &amp; Archive Sources</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Verified public-domain and open-license film collections wired into Noctis Study, Clinic, and Reels:
        </p>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
          <a
            href="https://www.loc.gov/collections/national-screening-room/?utm_source=chatgpt.com"
            target="_blank"
            rel="noreferrer"
            className="group rounded-xl bg-elevated p-3 transition hover:ring-1 hover:ring-primary/50"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Library of Congress</p>
            <p className="mt-1 text-xs font-semibold text-fg group-hover:underline">National Screening Room ↗</p>
            <p className="mt-1 text-[11px] leading-snug text-muted">
              Historic actualities, newsreels, scientific films, and preserved American memory from the Library of Congress Moving Image Research Center.
            </p>
          </a>
          <a
            href="https://archive.org/details/movies?utm_source=chatgpt.com"
            target="_blank"
            rel="noreferrer"
            className="group rounded-xl bg-elevated p-3 transition hover:ring-1 hover:ring-primary/50"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Internet Archive</p>
            <p className="mt-1 text-xs font-semibold text-fg group-hover:underline">Moving Image Archive · Movies ↗</p>
            <p className="mt-1 text-[11px] leading-snug text-muted">
              Open-access cinema, Prelinger Archives, NASA flight reels, lectures, and public-domain documentary films.
            </p>
          </a>
          <a
            href="https://pixabay.com/"
            target="_blank"
            rel="noreferrer"
            className="group rounded-xl bg-elevated p-3 transition hover:ring-1 hover:ring-primary/50"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Pixabay Commons</p>
            <p className="mt-1 text-xs font-semibold text-fg group-hover:underline">Free HD &amp; 4K Video Downloads ↗</p>
            <p className="mt-1 text-[11px] leading-snug text-muted">
              Royalty-free MP4 motion clips and B-roll cleared for direct native playback in Noctis Reels.
            </p>
          </a>
        </div>
        <div className="mt-3 rounded-xl bg-elevated p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
            Free Non-YouTube Educational Videos by Course Lane (Direct .MP4 Downloads)
          </p>
          <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-muted">
            <li>
              <strong className="text-fg">Computer Science, AI &amp; Engineering (MIT OCW / Internet Archive):</strong>{" "}
              <a href="https://archive.org/details/mit_ocw" target="_blank" rel="noreferrer" className="text-primary underline">
                archive.org/details/mit_ocw
              </a>{" "}
              &amp;{" "}
              <a href="https://ocw.mit.edu/search/?f=Lecture%20Videos" target="_blank" rel="noreferrer" className="text-primary underline">
                MIT OCW Lecture Videos
              </a>{" "}
              — Click <em>Download Video (.mp4)</em> under any lecture (CC BY-NC-SA) or use the Internet Archive direct <code>/download/&lt;item&gt;/&lt;file&gt;.mp4</code> link.
            </li>
            <li>
              <strong className="text-fg">Cybersecurity, NIST RMF &amp; Cloud Defense:</strong>{" "}
              <a href="https://www.nist.gov/video-gallery" target="_blank" rel="noreferrer" className="text-primary underline">
                NIST Public-Domain Video Gallery
              </a>{" "}
              &amp;{" "}
              <a href="https://archive.org/details/computerchronicles" target="_blank" rel="noreferrer" className="text-primary underline">
                Internet Archive Computing &amp; Security Collection
              </a>{" "}
              — U.S. government public-domain MP4s with zero YouTube dependency.
            </li>
            <li>
              <strong className="text-fg">Medicine, Nursing &amp; Public Health (NIH / CDC / NLM):</strong>{" "}
              <a href="https://collections.nlm.nih.gov/?f%5Bdrep2.format%5D%5B%5D=moving+image" target="_blank" rel="noreferrer" className="text-primary underline">
                NIH National Library of Medicine Digital Films
              </a>{" "}
              &amp;{" "}
              <a href="https://wwwn.cdc.gov/iknow/video/" target="_blank" rel="noreferrer" className="text-primary underline">
                CDC Public Health Media
              </a>{" "}
              — Public-domain clinical &amp; biomedical MP4 files.
            </li>
            <li>
              <strong className="text-fg">Space, Earth &amp; Physics (NASA / NOAA):</strong>{" "}
              <a href="https://images.nasa.gov/" target="_blank" rel="noreferrer" className="text-primary underline">
                images.nasa.gov (Filter by Video)
              </a>{" "}
              &amp;{" "}
              <a href="https://svs.gsfc.nasa.gov/" target="_blank" rel="noreferrer" className="text-primary underline">
                NASA Scientific Visualization Studio
              </a>{" "}
              — Every clip has a direct 1080p/4K <code>.mp4</code> download button (100% public domain).
            </li>
            <li>
              <strong className="text-fg">History, Civics &amp; Archival Cinema:</strong>{" "}
              <a href="https://www.loc.gov/collections/national-screening-room/?utm_source=chatgpt.com" target="_blank" rel="noreferrer" className="text-primary underline">
                LOC National Screening Room
              </a>{" "}
              &amp;{" "}
              <a href="https://archive.org/details/movies?utm_source=chatgpt.com" target="_blank" rel="noreferrer" className="text-primary underline">
                Internet Archive Movies
              </a>{" "}
              — Choose <em>MP4</em> in the download box on any film page and drop the file into <code>public/media/clips/</code> or paste the <code>.mp4</code> URL into <code>src/lib/feed-data.ts</code> / <code>src/lib/other-films.ts</code>.
            </li>
          </ul>
        </div>
      </section>
      <p className="text-xs text-muted">{checked ? `Last check ${deskClock(checked)}` : "Checking…"}</p>
      <div className="flex flex-wrap gap-1">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === item.id ? "bg-primary text-primary-fg" : "bg-surface text-muted shadow-border"}`}
          >
            {item.id} {count(item.id)}
          </button>
        ))}
        <button type="button" onClick={load} className="rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-muted shadow-border">
          Refresh
        </button>
      </div>
      {err ? <p className="text-sm text-live">{err}</p> : null}
      <ul className="space-y-2">
        {shown.map((row) => (
          <li key={row.id} className="rounded-2xl bg-surface p-4 shadow-border">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{row.action}</p>
            <p className="mt-1 text-sm font-semibold">{row.who}</p>
            <p className="mt-1 text-sm leading-relaxed">{row.detail}</p>
            <p className="mt-1 text-[11px] text-subtle">
              {row.email || "No email on this row"} · {deskClock(row.at)}
            </p>
          </li>
        ))}
        {!shown.length && !err ? (
          <li className="rounded-2xl bg-surface px-4 py-8 text-center text-sm text-muted">
            Nothing in {filter === "All" ? "this list" : filter} yet. A sign-in, watch, search, or like on this site is written within a few seconds.
          </li>
        ) : null}
      </ul>
      {rows.length || waiting.length ? (
        <section className="space-y-2">
          <h2 className="font-sans text-lg font-semibold">Review a note</h2>
          <ul className="space-y-2">
            {waiting.map((row) => (
              <li key={row.token} className="rounded-2xl bg-surface p-4 shadow-border">
                <p className="text-sm font-semibold">{row.author}</p>
                <p className="mt-1 text-sm">{row.text}</p>
                <p className="mt-1 text-[11px] text-subtle">
                  Waiting to save · {deskClock(row.at)}
                  {row.error ? ` · ${row.error}` : ""}
                </p>
              </li>
            ))}
            {rows.map((row) => (
              <li key={row.id} className="rounded-2xl bg-surface p-4 shadow-border">
                <p className="text-sm font-semibold">{row.author}</p>
                <p className="mt-1 text-sm">{row.body}</p>
                <p className="mt-1 text-[11px] text-subtle">
                  {row.status} · {deskClock(row.created_at)}
                </p>
                <input
                  value={drafts[row.id] ?? row.revise ?? ""}
                  onChange={(e) => setDrafts((cur) => ({ ...cur, [row.id]: e.target.value }))}
                  placeholder="What we will change"
                  className="mt-3 w-full rounded-xl bg-elevated px-3 py-2 text-sm outline-none"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {MARKS.map((status) => (
                    <button key={status} type="button" onClick={() => mark(row.id, status)} className="rounded-full bg-elevated px-3 py-1.5 text-[11px] font-semibold capitalize">
                      {status}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
