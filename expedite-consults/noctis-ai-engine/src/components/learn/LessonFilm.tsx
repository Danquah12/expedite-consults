import { useEffect, useMemo, useRef, useState } from "react";
import { YoutubeFrame } from "@/components/feed/YoutubeFrame";
import { PostActionBar } from "@/components/feed/PostActionBar";
import { ReactBar } from "@/components/feed/ReactMarks";
import { StudyLinks } from "@/components/learn/StudyLinks";
import { FilmSense } from "@/components/learn/FilmSense";
import type { CurriculumFilm } from "@/lib/curriculum";
import type { FeedPost } from "@/lib/feed-data";
import { offerFurtherStudy } from "@/lib/further-study";
import { SOURCE } from "@/lib/source";
import { advanceClinic, scrollClipToTop } from "@/lib/syndicate";
import { useFeedStore } from "@/lib/feed-store";
import { holdPlay, observeFocus, useClipFocus } from "@/lib/playback";
import { pauseAllYoutube } from "@/lib/youtube";
import { shuffleWith } from "@/lib/shuffle";
import { cn } from "@/lib/utils";

function filmPost(film: CurriculumFilm): FeedPost {
  return {
    id: `lesson-${film.id}`,
    author: { name: film.house, username: "hub", avatar: "/media/avatars/kwesi.jpg" },
    caption: film.title,
    lane: "learn",
    mediaType: "video",
    mediaUrl: film.mediaUrl ?? film.href,
    posterUrl: film.posterUrl,
    youtubeId: film.youtubeId || undefined,
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    hashtags: [],
    teach: { hook: film.title, stamp: "Hub", prompt: "", options: [] },
  };
}

export function LessonFilm({
  film,
  active,
  onPlay,
}: {
  film: CurriculumFilm;
  active: boolean;
  onPlay: () => void;
}) {
  const isMuted = useFeedStore((s) => s.isMuted);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !film.mediaUrl) return;
    el.muted = isMuted;
    if (active) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [active, isMuted, film.mediaUrl]);

  return (
    <article data-lesson-film={film.id} className="mx-auto w-full max-w-[46rem] overflow-hidden rounded-2xl bg-surface shadow-border">
      {film.mediaUrl ? (
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          <video
            ref={videoRef}
            src={film.mediaUrl}
            poster={film.posterUrl}
            controls
            playsInline
            preload="metadata"
            muted={isMuted}
            onPlay={onPlay}
            onEnded={() => {
              offerFurtherStudy(film.title);
              advanceClinic(`lesson-${film.id}`);
            }}
            className="h-full w-full object-contain"
          />
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/75 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 backdrop-blur-sm">
            Direct MP4 · Open Course
          </span>
        </div>
      ) : (
        <YoutubeFrame
          postId={`lesson-${film.id}`}
          youtubeId={film.youtubeId}
          playing={active}
          muted={isMuted}
          onToggle={onPlay}
          onEnded={() => {
            offerFurtherStudy(film.title);
            advanceClinic(`lesson-${film.id}`);
          }}
        />
      )}
      <div className="px-3 pb-2">
        <ReactBar postId={`lesson-${film.id}`} />
      </div>
      <PostActionBar post={filmPost(film)} />
      <div className="space-y-2 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
          {film.house} · {SOURCE}
        </p>
        <h3 className="font-display text-base font-semibold leading-snug">{film.title}</h3>
        <FilmSense post={filmPost(film)} />
        <StudyLinks title="At source" links={[{ label: `Open ${film.house}`, href: film.href }]} />
      </div>
    </article>
  );
}

export function FilmStudio({
  films,
  kicker = "Curriculum films",
  title,
  auto,
  pin,
}: {
  films: CurriculumFilm[];
  kicker?: string;
  title?: string;
  auto?: boolean;
  pin?: boolean;
}) {
  const [order, setOrder] = useState<string[] | null>(null);
  const [salt] = useState(() => (Math.random() * 0x7fffffff) ^ Date.now());
  const shown = useMemo(() => {
    const directMp4 = films.filter((f) => Boolean(f.mediaUrl));
    const ytFilms = films.filter((f) => !f.mediaUrl);
    const mixed = [...directMp4, ...shuffleWith(ytFilms, salt)];
    if (!order) return mixed;
    const byId = new Map(mixed.map((film) => [film.id, film]));
    const ranked = order.map((id) => byId.get(id)).filter((film): film is CurriculumFilm => film != null);
    const rest = mixed.filter((film) => !order.includes(film.id));
    return [...ranked, ...rest];
  }, [films, order, salt]);
  const playingId = useFeedStore((s) => s.playingId);
  const setPlayingId = useFeedStore((s) => s.setPlayingId);
  const first = shown[0]?.id ?? null;
  const filmKey = shown.map((f) => f.id).join("|");
  const focus = useClipFocus("[data-lesson-film]", "data-lesson-film", filmKey);
  const [active, setActive] = useState<string | null>(pin ? first : null);

  useEffect(() => {
    const onPermute = (ev: Event) => {
      const detail = (ev as CustomEvent<{ fromId: string; next: string }>).detail;
      if (!detail?.next?.startsWith("lesson-") || detail.next === detail.fromId) return;
      const nextId = detail.next.slice("lesson-".length);
      if (!shown.some((film) => film.id === nextId)) return;
      setActive(nextId);
      setOrder((prev) => {
        const ids = (prev ?? shown.map((film) => film.id)).filter((id) => id !== detail.fromId.replace(/^lesson-/, "") && id !== nextId);
        return [nextId, ...shuffleWith(ids, Date.now() >>> 0), detail.fromId.replace(/^lesson-/, "")];
      });
    };
    window.addEventListener("clip:permute", onPermute);
    return () => window.removeEventListener("clip:permute", onPermute);
  }, [shown]);

  useEffect(() => {
    if (focus) setActive((cur) => (cur === focus ? cur : focus));
  }, [focus]);

  useEffect(() => {
    if (!playingId) return;
    if (playingId.startsWith("lesson-")) {
      const id = playingId.slice("lesson-".length);
      if (filmKey.split("|").includes(id)) setActive((cur) => (cur === id ? cur : id));
      return;
    }
    if (!pin) setActive(null);
  }, [playingId, filmKey, pin]);

  useEffect(() => {
    if (!active) return;
    const next = `lesson-${active}`;
    if (useFeedStore.getState().playingId === next) return;
    holdPlay(900);
    pauseAllYoutube();
    setPlayingId(next);
  }, [active, setPlayingId]);

  useEffect(() => {
    if (!pin || !first) return;
    const t = window.setTimeout(() => scrollClipToTop(first), 80);
    const t2 = window.setTimeout(() => scrollClipToTop(first), 360);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [pin, first]);

  if (!shown.length) return null;

  return (
    <section className="space-y-3">
      {title && !pin ? (
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{kicker}</p>
          <h2 className="mt-1 font-display text-xl font-semibold">{title}</h2>
        </header>
      ) : null}
      <div className="space-y-3">
        {shown.map((film) => (
          <LessonFilm
            key={film.id}
            film={film}
            active={active === film.id}
            onPlay={() => {
              holdPlay(900);
              setActive(film.id);
              setPlayingId(`lesson-${film.id}`);
              const show = () => scrollClipToTop(film.id);
              show();
              window.setTimeout(show, 120);
            }}
          />
        ))}
      </div>
    </section>
  );
}

export function CampusStrip({ films }: { films: CurriculumFilm[] }) {
  const playingId = useFeedStore((s) => s.playingId);
  const setPlayingId = useFeedStore((s) => s.setPlayingId);
  const [active, setActive] = useState<string | null>(films[0]?.id ?? null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playingId || playingId.startsWith("lesson-")) return;
    setActive(null);
  }, [playingId]);

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const nodes = [...root.querySelectorAll<HTMLElement>("[data-lesson-film]")];
    return observeFocus(
      nodes,
      (el) => el.getAttribute("data-lesson-film"),
      (id) => {
        if (id) setActive(id);
      },
      { root, min: 0.45, rootMargin: "0px" },
    );
  }, [films]);

  return (
    <div ref={scroller} className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 scrollbar-none">
      {films.map((film) => (
        <div key={film.id} className={cn("w-[78%] shrink-0 sm:w-[70%]")}>
          <LessonFilm
            film={film}
            active={active === film.id}
            onPlay={() => {
              holdPlay(900);
              setActive(film.id);
              setPlayingId(`lesson-${film.id}`);
            }}
          />
        </div>
      ))}
    </div>
  );
}