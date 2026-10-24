import { useEffect, useRef, useState } from "react";
import { Bookmark } from "lucide-react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import {
  HALLS,
  HALL_SHIFTS,
  HALL_UNIONS,
  TICKETS,
  TICKET_FACE,
  type HallCard,
  type HallId,
  type TicketId,
} from "@/lib/hall";
import { useFeedStore } from "@/lib/feed-store";
import { scrollToFeed } from "@/lib/syndicate";
import { cn } from "@/lib/utils";
import { liveHallCards } from "@/lib/hall-live";
import { SCRIPTURE_CARDS } from "@/lib/hall-scripture";
import { youtubeIdOf, youtubePoster } from "@/lib/youtube";
import { HallSpread } from "@/components/learn/HallSpread";

export function HallDirectory({ compact }: { compact?: boolean }) {
  const hall = useFeedStore((s) => s.hall);
  const ticket = useFeedStore((s) => s.ticket);
  const lens = useFeedStore((s) => s.hallLens);
  const setHall = useFeedStore((s) => s.setHall);
  const setTicket = useFeedStore((s) => s.setTicket);
  const setHallLens = useFeedStore((s) => s.setHallLens);
  const saved = useFeedStore((s) => s.posts.filter((p) => p.isSaved).length);
  const posts = useFeedStore((s) => s.posts);
  const live = liveHallCards(posts, hall);
  const cards = live.length ? live : [];
  const hallMeta = hall === "all" ? null : HALL_UNIONS[hall];
  const hash = useRouterState({ select: (s) => s.location.hash.replace("#", "") });
  const router = useRouter();
  const tickets = hall === "all" ? TICKETS : TICKETS.filter((t) => t.hall === hall);

  useEffect(() => {
    if (compact || !hash) return;
    if (HALLS.some((h) => h.id === hash)) setHall(hash as HallId);
    if (TICKETS.some((t) => t.id === hash)) setTicket(hash as TicketId);
  }, [compact, hash, setHall, setTicket]);

  function pickHall(id: HallId) {
    setHall(id);
    if (!compact) void router.navigate({ to: "/hall", hash: id, replace: true });
  }

  function pickTicket(id: TicketId) {
    setTicket(id);
    if (!compact) void router.navigate({ to: "/hall", hash: id, replace: true });
  }

  function openInClinic() {
    void router.navigate({ to: "/", hash: "feed" });
    const first = cards[0]?.postId ?? cards[0]?.post.id;
    if (first) window.setTimeout(() => scrollToFeed(first), 160);
  }

  return (
    <section className="min-w-0 max-w-full space-y-2">
      <div className="rounded-2xl bg-surface p-3 shadow-border">
        {compact ? (
          <>
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <HallSpread tab="clinic" />
            </div>
            <LensIcon active={lens === "saved"} onClick={() => setHallLens(lens === "saved" ? null : "saved")} icon={Bookmark} label={`${saved} saved`} />
          </div>
          {lens !== "shifts" ? <HallStrip cards={cards} /> : null}
          </>
        ) : (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Hall</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {HALLS.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => pickHall(h.id)}
                  className={cn(
                    "inline-flex min-h-9 items-center rounded-full px-3 text-[12px] font-semibold",
                    hall === h.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
                  )}
                >
                  {h.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Ticket</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tickets.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => pickTicket(t.id)}
                  className={cn(
                    "inline-flex min-h-9 items-center rounded-full px-3 text-[12px] font-semibold",
                    ticket === t.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Look</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <DeskChip active={lens === "union"} onClick={() => setHallLens(lens === "union" ? null : "union")} label="Union" />
              <DeskChip active={lens === "saved"} onClick={() => setHallLens(lens === "saved" ? null : "saved")} label={`Saved ${saved}`} />
              <DeskChip active={lens === "sos"} onClick={() => setHallLens(lens === "sos" ? null : "sos")} label="SOS" />
              <DeskChip active={lens === "shifts"} onClick={() => setHallLens(lens === "shifts" ? null : "shifts")} label="Shifts" />
              <button type="button" onClick={openInClinic} className="inline-flex min-h-9 items-center rounded-full bg-primary px-3 text-[12px] font-semibold text-primary-fg">
                Open in Academy
              </button>
            </div>
          </>
        )}
      </div>

      {lens === "union" && hallMeta ? (
        <LensPanel kicker="Union" title={hallMeta.name} body={`${hallMeta.members} on shift · ${hallMeta.blurb}`} />
      ) : null}
      {lens === "sos" ? (
        <LensPanel
          kicker="SOS"
          title={`Stuck on ${TICKETS.find((t) => t.id === ticket)?.label}?`}
          body="Ask the person on this ticket. Fifteen minutes. Bring the drill you failed."
        />
      ) : null}
      {lens === "shifts" ? (
        <div className="rounded-3xl bg-surface p-4 shadow-border">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Tonight on the hall</p>
          <ul className="mt-3 space-y-2">
            {HALL_SHIFTS.map((s) => (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => pickTicket(s.ticket)}
                  className="flex min-h-11 w-full items-center justify-between rounded-2xl bg-elevated px-3 py-2 text-left"
                >
                  <span className="text-sm font-semibold">{s.title}</span>
                  <span className="font-mono text-xs text-primary">{s.when}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {lens === "saved" ? (
        <LensPanel kicker="Saved" title={`${saved} clinics pinned`} body="Open a Spark, tap bookmark, it lives on this ticket." />
      ) : null}

      {lens !== "shifts" && !compact ? (
        <section className="space-y-2">
          <div className="px-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
              {TICKETS.find((t) => t.id === ticket)?.label ?? "This ticket"}
            </p>
            <p className="text-xs text-muted">Films for the ticket you picked. Tap one to open the drill.</p>
          </div>
          <HallRow cards={cards} />
        </section>
      ) : null}

      {lens !== "shifts" && !compact ? (
        <section className="space-y-2">
          <div className="px-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Scripture</p>
            <p className="text-xs text-muted">Reading, deep study, and the hard questions. One film each.</p>
          </div>
          <HallRow cards={SCRIPTURE_CARDS} />
        </section>
      ) : null}

      {compact ? null : (
        <p className="px-1 text-xs text-muted">
          Pick a hall, then a ticket. The films below follow that choice.
        </p>
      )}
    </section>
  );
}

function LensIcon({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Bookmark;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "grid size-12 place-items-center rounded-2xl",
        active ? "bg-primary text-primary-fg" : "text-muted hover:bg-elevated hover:text-fg",
      )}
    >
      <Icon className="size-3.5" />
    </button>
  );
}

function LensPanel({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return (
    <div className="rounded-3xl bg-surface p-4 shadow-border">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">{kicker}</p>
      <h2 className="mt-1 font-display text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </div>
  );
}

function HallStrip({ cards }: { cards: HallCard[] }) {
  const viewport = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [spot, setSpot] = useState(0);
  const [burst, setBurst] = useState(true);

  function nearest() {
    const root = viewport.current;
    if (!root) return 0;
    const box = root.getBoundingClientRect();
    const mid = box.left + box.width / 2;
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.right < box.left + 8 || r.left > box.right - 8) return;
      const dist = Math.abs(r.left + r.width / 2 - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  }

  useEffect(() => {
    const watch = () => setSpot(nearest());
    watch();
    const id = window.setInterval(watch, 480);
    return () => window.clearInterval(id);
  }, [cards.length]);

  useEffect(() => {
    setBurst(true);
    const stop = window.setTimeout(() => setBurst(false), 1700);
    const again = window.setTimeout(() => setBurst(true), 3400);
    return () => {
      window.clearTimeout(stop);
      window.clearTimeout(again);
    };
  }, [spot]);

  if (!cards.length) return null;

  function row(prefix: string, live: boolean) {
    return cards.map((card, index) => (
      <HallMediaCard
        key={`${prefix}-${card.id}`}
        card={card}
        strip
        nudge={index}
        preview={live && burst && index === spot}
        moving
        cardRef={live ? (node) => { cardRefs.current[index] = node; } : undefined}
      />
    ));
  }

  return (
    <div ref={viewport} className="hall-run mt-3">
      <div className="hall-marquee" style={{ animationDuration: `${Math.max(28, cards.length * 2.8)}s` }}>
        <div className="flex shrink-0 gap-2 pr-2">{row("a", true)}</div>
        <div className="flex shrink-0 gap-2 pr-2" aria-hidden>{row("b", false)}</div>
      </div>
    </div>
  );
}

function DeskChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 items-center rounded-full px-3 text-[12px] font-semibold",
        active ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
      )}
    >
      {label}
    </button>
  );
}

function HallRow({ cards }: { cards: HallCard[] }) {
  if (!cards.length) return <p className="px-1 text-xs text-muted">No film is seated on this ticket yet.</p>;
  return (
    <div className="flex gap-3 overflow-x-auto px-1 pb-2">
      {cards.map((card) => (
        <HallMediaCard key={card.id} card={card} strip />
      ))}
    </div>
  );
}

function HallMediaCard({
  card,
  hero,
  strip,
  nudge = 0,
  moving = false,
  preview = false,
  cardRef,
}: {
  card: HallCard;
  hero?: boolean;
  strip?: boolean;
  nudge?: number;
  moving?: boolean;
  preview?: boolean;
  cardRef?: (node: HTMLDivElement | null) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const openModal = useFeedStore((s) => s.openModal);
  const setTicket = useFeedStore((s) => s.setTicket);
  const ticketLabel = card.badge ?? TICKETS.find((t) => t.id === card.ticket)?.label ?? card.ticket;
  const face = TICKET_FACE[card.ticket];
  const yt = youtubeIdOf(card.post);
  const breathe = strip ? { animationDelay: `${-(nudge % 8) * 0.7}s` } : undefined;

  useEffect(() => {
    if (strip) return;
    const node = videoRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void node.play().catch(() => undefined);
        else node.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [card.mediaUrl, strip]);

  useEffect(() => {
    const node = videoRef.current;
    if (!strip || !preview || !node) return;
    node.muted = true;
    node.currentTime = 0;
    void node.play().catch(() => undefined);
    return () => node.pause();
  }, [strip, preview, card.mediaUrl]);

  function open() {
    setTicket(card.ticket);
    openModal({ type: "hall-drill", ticket: card.ticket, cardId: card.id });
  }

  return (
    <div
      role="button"
      tabIndex={0}
      ref={cardRef}
      onClick={open}
      onPointerDown={moving ? (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        e.stopPropagation();
        open();
      } : undefined}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      className={cn(
        "clip-plate group relative overflow-hidden rounded-3xl bg-elevated text-left",
        strip ? "hall-card" : hero ? "col-span-2 aspect-[16/9]" : "aspect-[4/3]",
      )}
    >
      {yt ? (
        <img
          src={card.posterUrl || youtubePoster(yt)}
          alt=""
          className={cn("pointer-events-none absolute inset-0 h-full w-full object-cover", strip && "hall-breathe")}
          style={breathe}
        />
      ) : card.mediaType === "video" ? (
        <video
          ref={videoRef}
          src={card.mediaUrl}
          poster={card.posterUrl}
          muted
          loop={!strip}
          playsInline
          preload="metadata"
          disablePictureInPicture
          className={cn("pointer-events-none absolute inset-0 h-full w-full object-cover", strip && "hall-breathe")}
          style={breathe}
        />
      ) : (
        <img
          src={card.mediaUrl}
          alt=""
          className={cn("pointer-events-none absolute inset-0 h-full w-full object-cover", strip ? "hall-breathe" : "kenburns")}
          style={breathe}
        />
      )}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent" />
      <span className="absolute left-2.5 top-2.5 rounded-full bg-[#e4b86a] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#1a1408]">
        {ticketLabel}
      </span>
      {card.mediaType === "video" ? (
        <span className="absolute right-3 top-3 rounded-md bg-live px-1.5 py-0.5 font-mono text-[9px] font-bold text-primary-fg">
          LIVE
        </span>
      ) : null}
      <span className={cn("absolute inset-x-2 bottom-2.5", strip && "inset-x-2.5 bottom-3")}>
        <span className={cn("block font-display font-semibold text-white [text-wrap:balance]", strip ? "line-clamp-2 text-[13px] leading-snug" : "text-[15px] leading-snug")}>
          {card.title}
        </span>
        {face ? (
          <span className="mt-1 block text-[10px] font-medium leading-snug text-white/80">
            {face.minutes} · {face.level} · {face.path}
            <span className="block">{face.skill} · {face.career}</span>
          </span>
        ) : null}
        {strip ? null : (
          <span className="clip-meta mt-1 block text-[11px]">
            {card.mentor} · {card.shift}
          </span>
        )}
      </span>
    </div>
  );
}
