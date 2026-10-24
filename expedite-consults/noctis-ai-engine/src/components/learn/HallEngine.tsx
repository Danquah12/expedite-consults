import { useMemo, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { HALL_CARDS, TICKETS, TICKET_FACE, careerOf, type HallCard, type TicketId } from "@/lib/hall";
import { liveHallCards } from "@/lib/hall-live";
import { GOALS, levelFromXp } from "@/lib/learn";
import { useFeedStore } from "@/lib/feed-store";
import { youtubeIdOf, youtubePoster } from "@/lib/youtube";
import { NoctisMoves } from "@/components/noctis/NoctisMoves";
import { askFilm } from "@/components/learn/VideoAskSheet";
import { cn } from "@/lib/utils";
import { lessonStatus, raiseDna, readLesson, saveLesson, strandsFor } from "@/lib/hall-record";
import { markMission, readMission } from "@/lib/noctis-os";
import { CERT_TRACKS } from "@/lib/cert-academy";

const WATCH_KEY = "hall-watch";
const CONTINUE_KEY = "hall-continue";

function readWatch(): Record<string, number> {
  try {
    const raw = sessionStorage.getItem(WATCH_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function poster(card: HallCard) {
  const yt = youtubeIdOf(card.post);
  return card.posterUrl || (yt ? youtubePoster(yt) : card.mediaUrl);
}

const READY = "vibetok-hall-ready";
const READY_SEEN = "vibetok-hall-ready-seen";

function readReady(): Record<string, number> {
  try {
    const raw = localStorage.getItem(READY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function lessonSeen(id: string) {
  try {
    const raw = JSON.parse(localStorage.getItem(READY_SEEN) || "[]") as string[];
    return Array.isArray(raw) && raw.includes(id);
  } catch {
    return false;
  }
}

function noteLesson(card: HallCard) {
  let seen: string[] = [];
  try {
    const raw = JSON.parse(localStorage.getItem(READY_SEEN) || "[]") as string[];
    seen = Array.isArray(raw) ? raw : [];
  } catch {
    seen = [];
  }
  if (seen.includes(card.id)) return readReady()[card.ticket] ?? 0;
  const book = readReady();
  book[card.ticket] = Math.min(100, (book[card.ticket] ?? 0) + 1);
  localStorage.setItem(READY, JSON.stringify(book));
  localStorage.setItem(READY_SEEN, JSON.stringify([card.id, ...seen].slice(0, 80)));
  const text = `${card.title} ${card.post.teach.hook} ${card.post.caption}`;
  raiseDna(strandsFor(card.ticket, text), 1);
  return book[card.ticket];
}

function certFor(card: HallCard) {
  const face = TICKET_FACE[card.ticket];
  const text = `${card.title} ${card.post.teach.hook} ${card.post.caption} ${face?.skill ?? ""}`;
  const rules: [RegExp, string][] = [
    [/security\+|comptia|cia triad|\bcyber\b|malware/i, "secplus"],
    [/\bnclex\b|nursing/i, "nclex"],
    [/\baws\b/i, "aws"],
    [/azure|az-900/i, "azure"],
    [/google cloud|\bgcp\b/i, "gcp"],
    [/\bccna\b|\bcisco\b/i, "cisco"],
    [/cissp/i, "cissp"],
    [/\bcisa\b/i, "cisa"],
    [/\bpmp\b/i, "pmp"],
    [/\bcka\b|kubernetes/i, "cka"],
  ];
  const id = rules.find(([test]) => test.test(text))?.[1];
  return CERT_TRACKS.find((row) => row.id === id) ?? null;
}

function outcomes(card: HallCard) {
  const face = TICKET_FACE[card.ticket];
  const rows = [face?.skill, card.post.teach.hook].filter((row): row is string => Boolean(row && row.trim()));
  return [...new Set(rows)].slice(0, 2);
}

export function HallEngine() {
  const posts = useFeedStore((s) => s.posts);
  const goal = useFeedStore((s) => s.goal);
  const xp = useFeedStore((s) => s.xp);
  const passed = useFeedStore((s) => s.drillPassed);
  const stamps = useFeedStore((s) => s.earnedStamps);
  const openModal = useFeedStore((s) => s.openModal);
  const awardXp = useFeedStore((s) => s.awardXp);
  const toggleSave = useFeedStore((s) => s.toggleSave);
  const sharePost = useFeedStore((s) => s.sharePost);
  const [track, setTrack] = useState<TicketId | "all">("all");
  const [continued, setContinued] = useState(() => (typeof sessionStorage === "undefined" ? "" : sessionStorage.getItem(CONTINUE_KEY) || ""));
  const [watched, setWatched] = useState(readWatch);
  const meta = GOALS.find((item) => item.id === goal);
  const lvl = levelFromXp(xp);
  const live = liveHallCards(posts);
  const cards = useMemo(() => {
    const seen = new Set<string>();
    const rows: HallCard[] = [];
    const seated = live.flatMap((card) => {
      const ticketId = careerOf({ ...card.post, title: card.title });
      const ticket = TICKETS.find((row) => row.id === ticketId);
      if (!ticket) return [];
      return [{ ...card, ticket: ticket.id, hall: ticket.hall, badge: ticket.label }];
    });
    for (const card of [...HALL_CARDS, ...seated]) {
      const key = card.post.id || card.id;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push(card);
    }
    return rows;
  }, [live]);
  const shown = track === "all" ? cards : cards.filter((card) => card.ticket === track);
  const next = shown.find((card) => !passed[card.post.id]) ?? shown[0];
  const face = next ? TICKET_FACE[next.ticket] : null;
  const current = cards.find((card) => card.id === continued) ?? next;

  function progress(card: HallCard) {
    if (passed[card.post.id]) return 100;
    return Math.max(readLesson(card.id).progress, watched[card.id] ?? 0);
  }

  function watch(card: HallCard) {
    const pct = passed[card.post.id] ? 100 : Math.max(watched[card.id] ?? 0, 35);
    const nextWatch = { ...watched, [card.id]: pct };
    setWatched(nextWatch);
    sessionStorage.setItem(WATCH_KEY, JSON.stringify(nextWatch));
    sessionStorage.setItem(CONTINUE_KEY, card.id);
    setContinued(card.id);
    saveLesson(card.id, { progress: pct });
    noteLesson(card);
    const mission = markMission("watch");
    if (mission.rewarded) awardXp(50);
    openModal({ type: "hall-drill", ticket: card.ticket, cardId: card.id });
  }

  function addJourney(card: HallCard) {
    sessionStorage.setItem(CONTINUE_KEY, card.id);
    setContinued(card.id);
  }

  return (
    <div className="space-y-4">
      <header className="rounded-3xl border border-[#e4b86a]/50 bg-surface p-6 shadow-border">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Hall</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">The learning engine</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">A film only counts when it becomes a lesson: summary, notes, quiz, career, and progress on your journey.</p>
      </header>

      <section className="rounded-3xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-subtle">My Journey</p>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Current goal</dt>
            <dd className="mt-1 text-sm font-semibold">{meta?.label ?? "Set a goal"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Current path</dt>
            <dd className="mt-1 text-sm font-semibold">{face?.path ?? "Pick a track"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Progress</dt>
            <dd className="mt-1 text-sm font-semibold">{lvl.pct}%</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Recommended next</dt>
            <dd className="mt-1">
              {next ? (
                <button type="button" onClick={() => watch(next)} className="text-left text-sm font-semibold">
                  {next.title}
                </button>
              ) : (
                <span className="text-sm font-semibold">No lesson yet</span>
              )}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted">Recommended by Vibe</p>
      </section>

      <section>
        <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-subtle">Career tracks</p>
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
          <Track on={track === "all"} label="All" onClick={() => setTrack("all")} />
          {TICKETS.map((ticket) => (
            <Track key={ticket.id} on={track === ticket.id} label={ticket.label} onClick={() => setTrack(ticket.id)} />
          ))}
        </div>
      </section>

      <section>
        <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-subtle">Recommended for you</p>
        <p className="px-1 text-xs text-muted">
          {track === "all"
            ? "A lesson sits on a trade only when the film itself is about that trade."
            : `Only ${TICKETS.find((row) => row.id === track)?.label} lessons. Nothing else is moved here to fill the row.`}
        </p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {shown.length ? shown.map((card) => (
            <AssetCard
              key={card.id}
              card={card}
              pct={progress(card)}
              status={passed[card.post.id] ? "Completed" : lessonStatus(progress(card))}
              saved={Boolean(card.post.isSaved)}
              onWatch={() => watch(card)}
              onSave={() => toggleSave(card.post.id)}
              onShare={() => void sharePost(card.post.id)}
              onJourney={() => addJourney(card)}
            />
          )) : (
            <p className="text-sm text-muted">No lesson on this track yet.</p>
          )}
        </div>
      </section>

      {current ? (
        <section className="rounded-3xl bg-surface p-5 shadow-border">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-subtle">Continue learning</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{current.title}</p>
              <p className="mt-1 text-xs text-muted">{progress(current)}% · {TICKET_FACE[current.ticket]?.career}</p>
            </div>
            <button type="button" onClick={() => watch(current)} className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-fg">
              Watch
            </button>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-elevated">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress(current)}%` }} />
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-subtle">Certifications</p>
        <ul className="mt-3 space-y-2">
          {(stamps.length ? stamps : ["None stamped yet"]).map((stamp) => (
            <li key={stamp} className="text-sm font-semibold">{stamp}</li>
          ))}
        </ul>
        <Link to="/hub" className="mt-3 inline-flex text-sm font-semibold text-primary">Open the hub</Link>
      </section>

      <section className="rounded-3xl border border-[#e4b86a]/40 bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Ask Noctis</p>
        <button
          type="button"
          className="mt-3 inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg"
          onClick={() => {
            const card = current ?? next;
            if (!card) return;
            askFilm({ postId: card.post.id, title: card.title, caption: card.post.caption, youtubeId: youtubeIdOf(card.post) || undefined });
          }}
        >
          Ask Noctis about this
        </button>
        <div className="mt-3">
          <NoctisMoves
            toVibe
            picture={(() => {
              const card = current ?? next;
              const shot = card ? poster(card) : "";
              return /^https:\/\//i.test(shot) && !/\.(mp4|webm|mov)(\?|$)/i.test(shot) ? shot : "";
            })()}
            items={[
              { label: "Explain this film", ask: `This Hall film is "${next?.title ?? "the film on screen"}". Explain it and the picture with it. Stay on this Hall film.` },
              { label: "Create notes", ask: `This Hall film is "${next?.title ?? "the film on screen"}". Write notes from this film only.` },
              { label: "Generate quiz", ask: `This Hall film is "${next?.title ?? "the film on screen"}". Make a short quiz from this film only.` },
              { label: "Show career paths", ask: `This Hall film is "${next?.title ?? "the film on screen"}". Which careers does this Hall film point to?` },
              { label: "Show resources", ask: `This Hall film is "${next?.title ?? "the film on screen"}". Which resources on Hall support this film?` },
            ]}
          />
        </div>
      </section>
    </div>
  );
}

function Track({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("inline-flex min-h-9 shrink-0 items-center rounded-full px-3 text-[12px] font-semibold", on ? "bg-primary text-primary-fg" : "bg-elevated text-muted")}
    >
      {label}
    </button>
  );
}

function AssetCard({
  card,
  pct,
  status,
  saved,
  onWatch,
  onSave,
  onShare,
  onJourney,
}: {
  card: HallCard;
  pct: number;
  status: string;
  saved: boolean;
  onWatch: () => void;
  onSave: () => void;
  onShare: () => void;
  onJourney: () => void;
}) {
  const router = useRouter();
  const face = TICKET_FACE[card.ticket];
  const career = TICKETS.find((row) => row.id === card.ticket)?.label ?? card.ticket;
  const authored = card.id.startsWith("c-");
  const learned = outcomes(card);
  const cert = certFor(card);
  const dna = strandsFor(card.ticket, `${card.title} ${card.post.teach.hook}`);
  const ready = readReady()[card.ticket];
  const mission = readMission();
  return (
    <article className="overflow-hidden rounded-3xl bg-surface shadow-border">
      <button type="button" onClick={onWatch} className="block w-full text-left">
        <span className="relative block aspect-video bg-elevated">
          <img src={poster(card)} alt="" className="h-full w-full object-cover" />
          <span className="absolute left-2 top-2 rounded-full bg-[#e4b86a] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#1a1408]">
            {career}
          </span>
        </span>
        <span className="block px-3 pt-3">
          <span className="block text-sm font-semibold leading-snug">{card.title}</span>
          <span className="mt-1 block text-[11px] text-muted">
            {authored ? `${face?.minutes} · ${face?.level} · ${career}` : career}
          </span>
          <span className="mt-0.5 block text-[11px] text-muted">{authored ? face?.skill : card.post.teach.stamp}</span>
          <span className="mt-2 block text-[11px] leading-snug text-muted">
            You will learn: {learned.length ? learned.join(" · ") : "Not stored."}
          </span>
          <span className="mt-1 block text-[11px] text-muted">
            Certification: {cert ? cert.label : "None stored for this lesson."}
          </span>
          <span className="mt-1 block text-[11px] text-muted">
            DNA: {lessonSeen(card.id) ? dna.map((name) => `${name} +1`).join(" · ") : "Recorded when you open the lesson."}
          </span>
          <span className="mt-1 block text-[11px] text-muted">
            Readiness: {ready ? `${career} ${ready}%` : "Not counted until you open the lesson."}
          </span>
          <span className="mt-1 block text-[11px] text-muted">
            Today: Watch {mission.watch ? "done" : "open"} · Quiz {mission.quiz ? "done" : "open"} · Ask {mission.ask ? "done" : "open"}
          </span>
        </span>
      </button>
      <div className="px-3 pb-3 pt-2">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-subtle">
          <span>{status}</span>
          <span>{pct}%</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-elevated">
          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Mini onClick={onWatch}>Open</Mini>
          <Mini onClick={onSave}>{saved ? "Saved" : "Save"}</Mini>
          <Mini onClick={onShare}>Share</Mini>
          <Mini onClick={onJourney}>Add to journey</Mini>
          <button
            type="button"
            onClick={() => {
              const shot = poster(card);
              sessionStorage.setItem("vibe-ask", `This Hall film is "${card.title}". Explain it. Look at the picture with it. Stay on this Hall film.`);
              if (/^https:\/\//i.test(shot) && !/\.(mp4|webm|mov)(\?|$)/i.test(shot)) sessionStorage.setItem("vibe-picture", shot);
              else sessionStorage.removeItem("vibe-picture");
              void router.navigate({ to: "/noctis" });
              useFeedStore.getState().closeModal();
            }}
            className="inline-flex min-h-8 items-center rounded-full bg-primary px-2.5 text-[11px] font-semibold text-primary-fg"
          >
            Ask Noctis
          </button>
        </div>
      </div>
    </article>
  );
}

function Mini({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex min-h-8 items-center rounded-full bg-elevated px-2.5 text-[11px] font-semibold">
      {children}
    </button>
  );
}
