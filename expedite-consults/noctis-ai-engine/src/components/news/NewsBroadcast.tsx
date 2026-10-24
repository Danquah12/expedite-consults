import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Radio } from "lucide-react";
import { toast } from "sonner";
import { knowledgeAsset } from "@/lib/knowledge-asset";
import { KnowledgeActions } from "@/components/learn/KnowledgeActions";
import { DESK_NOTE_URL, NEWS_REGIONS, NEWS_STATIONS, type NewsStation } from "@/lib/news-stations";
import { loadLiveNews, type NewsStory } from "@/lib/news-api";
import { pauseAllYoutube, ytCommand, ytListen } from "@/lib/youtube";
import { askFilm } from "@/components/learn/VideoAskSheet";
import { useFeedStore } from "@/lib/feed-store";
import { applyHeadline, readHeadline, type HeadlineImpact } from "@/lib/reel-services";
import { renderVibePaper } from "@/lib/paper-sheet";
import { cn } from "@/lib/utils";

function liveSrc(videoId: string) {
  const q = new URLSearchParams({
    autoplay: "1",
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
    controls: "0",
    enablejsapi: "1",
    fs: "1",
    iv_load_policy: "3",
    disablekb: "1",
  });
  if (typeof window !== "undefined") q.set("origin", window.location.origin);
  return `https://www.youtube-nocookie.com/embed/${videoId}?${q.toString()}`;
}

function ago(iso: string) {
  const mins = Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 60_000));
  if (!Number.isFinite(mins)) return "";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return "";
}

function when(story: NewsStory) {
  if (story.live) return "Live";
  return ago(story.publishedAt);
}

function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

async function shareNewsFiles(files: File[]) {
  if (!files.length || typeof navigator.share !== "function") return false;
  const data: ShareData = { files, title: "Noctis news", text: "Written by Noctis · Noctis Clinic" };
  try {
    if (typeof navigator.canShare === "function" && !navigator.canShare(data)) return false;
    await navigator.share(data);
    return true;
  } catch (err) {
    if ((err as Error).name === "AbortError") return true;
    return false;
  }
}

function NewsSend({
  title,
  station,
  region,
  href,
  impact,
}: {
  title: string;
  station: string;
  region: string;
  href: string;
  impact: HeadlineImpact;
}) {
  const [note, setNote] = useState("");
  const [ready, setReady] = useState(false);
  const pack = useRef<{ pdf: File; images: File[] } | null>(null);
  const evidence = `Reported. Sources reviewed: 1. Primary: ${station}. Secondary: none opened.`;
  const career = impact.career ? `${impact.career}${impact.skill ? ` · ${impact.skill}` : ""}` : "This headline does not name a career.";
  const paths = impact.paths.length ? impact.paths.join(" · ") : "This headline does not name a path.";
  const dna = impact.dna.length ? impact.dna.map((name) => `${name} +1`).join(" · ") : "No strand in this headline.";
  const journey = `${impact.path ? `Current path: ${impact.path}. ` : "Current path: not named. "}${impact.skill ? `Related skill: ${impact.skill}. ` : "Related skill: not named. "}${impact.progress != null ? `Progress: ${impact.progress}%.` : "Progress: not counted."}`;
  const steps = [
    `Evidence\n\n${evidence}`,
    "Why it matters\n\nUse this report as a reason to study, not as the last word. Check the source, then the lesson that teaches the idea behind it.",
    `Career impact\n\n${career}`,
    `Related paths\n\n${paths}`,
    `Knowledge DNA\n\n${dna}`,
    `Journey impact\n\n${journey}`,
    `References\n\n1. ${station}. ${region}. ${href}`,
  ];

  useEffect(() => {
    let cancel = false;
    setReady(false);
    pack.current = null;
    void renderVibePaper({
      title,
      lede: title,
      source: `${station} · ${region}`,
      steps,
      fit: "full",
    })
      .then((sheet) => {
        if (cancel) return;
        pack.current = { pdf: sheet.pdf, images: sheet.images };
        setReady(true);
      })
      .catch(() => {
        if (!cancel) setNote("The news card could not be formatted.");
      });
    return () => {
      cancel = true;
    };
  }, [title, station, region, href, career, paths, dna, journey, evidence]);

  async function send(where: string) {
    const file = pack.current;
    if (!file) {
      setNote("The news card is still formatting. Press again in a moment.");
      return;
    }
    const shared = (file.images.length ? await shareNewsFiles(file.images) : false) || (await shareNewsFiles([file.pdf]));
    if (shared) {
      const line = `Share menu is open for ${where}. The Noctis logo is on the news.`;
      setNote(line);
      toast.success(line);
      return;
    }
    file.images.forEach(downloadFile);
    if (!file.images.length) downloadFile(file.pdf);
    const sites: Record<string, string> = {
      whatsapp: "https://web.whatsapp.com/",
      linkedin: "https://www.linkedin.com/feed/?shareActive=true",
      facebook: "https://www.facebook.com/",
      instagram: "https://www.instagram.com/",
      x: "https://x.com/compose/post",
    };
    if (sites[where]) window.open(sites[where], "_blank", "noopener,noreferrer");
    setNote(`${where} is open. Attach vibetok-white-paper.pdf. It has the story, the evidence, and the Noctis logo.`);
  }

  const button = "min-h-11 rounded-full bg-elevated px-3 text-xs font-semibold disabled:opacity-50";
  return (
    <div id="news-send" className="mt-4 space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Send this news</p>
      <div className="flex flex-wrap gap-1.5">
        {(["whatsapp", "linkedin", "facebook", "instagram", "x"] as const).map((name) => (
          <button key={name} type="button" disabled={!ready} onClick={() => void send(name)} className={button}>
            {name === "x" ? "X" : name[0]!.toUpperCase() + name.slice(1)}
          </button>
        ))}
      </div>
      {note ? <p className="text-xs text-muted">{note}</p> : <p className="text-xs text-muted">{ready ? "The formatted story is ready, with the evidence and the Noctis logo." : "Formatting the story…"}</p>}
    </div>
  );
}

export function NewsBroadcast() {
  const [station, setStation] = useState<NewsStation>(NEWS_STATIONS[0]!);
  const [stories, setStories] = useState<NewsStory[]>([]);
  const [ready, setReady] = useState(false);
  const [picked, setPicked] = useState("");
  const setPlayingId = useFeedStore((s) => s.setPlayingId);
  const closePip = useFeedStore((s) => s.closePip);
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [applied, setApplied] = useState("");
  const desk = stories.filter((row) => row.id === station.id);
  const videoId = (desk.find((row) => row.videoId === picked) ?? desk[0])?.videoId;
  const onAir = desk.find((row) => row.videoId === videoId) ?? desk[0];

  useEffect(() => {
    const title = onAir?.title || station.name;
    sessionStorage.setItem("vibe-news", JSON.stringify({ title, category: station.name, topic: station.region }));
    sessionStorage.setItem("vibe-place", "news");
    if (onAir?.title) applyHeadline(onAir.title, station.name);
    setApplied(onAir?.title || station.name);
  }, [onAir?.title, station.name, station.region]);

  function holdPlace(change: () => void) {
    const y = window.scrollY;
    change();
    const pin = () => window.scrollTo(0, y);
    window.setTimeout(pin, 0);
    window.setTimeout(pin, 80);
  }

  function choose(row: NewsStation) {
    holdPlace(() => {
      setStation(row.id === "desk-note" ? { ...row, site: DESK_NOTE_URL } : row);
      setPicked("");
    });
  }

  function pickStory(id: string) {
    holdPlace(() => setPicked(id));
  }

  useEffect(() => {
    setPlayingId(null);
    closePip();
    pauseAllYoutube();
  }, [station.id, setPlayingId, closePip]);

  useEffect(() => {
    let stop = false;
    void loadLiveNews()
      .then((rows) => {
        if (stop) return;
        setStories(rows);
        setReady(true);
      })
      .catch(() => setReady(true));
    return () => {
      stop = true;
    };
  }, []);

  useEffect(() => {
    setTime(0);
    setDuration(0);
    const iframe = frame.current;
    if (!iframe || !videoId) return;
    const kick = () => ytListen(iframe);
    iframe.addEventListener("load", kick);
    const onMsg = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;
      let payload: unknown = event.data;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload) as unknown;
        } catch {
          return;
        }
      }
      if (!payload || typeof payload !== "object") return;
      const box = payload as { event?: string; info?: { currentTime?: number; duration?: number } | number };
      if (box.event === "onError") {
        setStories((prev) => prev.filter((row) => row.videoId !== videoId));
        setPicked("");
        return;
      }
      const info = box.info;
      if (!info || typeof info === "number") return;
      if (typeof info.currentTime === "number" && Number.isFinite(info.currentTime)) setTime(info.currentTime);
      if (typeof info.duration === "number" && info.duration > 0 && Number.isFinite(info.duration)) setDuration(info.duration);
    };
    window.addEventListener("message", onMsg);
    const clock = window.setInterval(() => {
      ytCommand(iframe, "getCurrentTime");
      ytCommand(iframe, "getDuration");
    }, 500);
    return () => {
      iframe.removeEventListener("load", kick);
      window.removeEventListener("message", onMsg);
      window.clearInterval(clock);
    };
  }, [videoId]);

  function seek(event: MouseEvent<HTMLButtonElement>) {
    if (duration <= 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const at = ratio * duration;
    ytCommand(frame.current, "seekTo", [at, true]);
    setTime(at);
  }

  const progress = duration > 0 ? Math.min(100, Math.max(0, (time / duration) * 100)) : 100;

  return (
    <section className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-4">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-fg">
          <Radio className="size-5" />
        </span>
        <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-semibold tracking-tight">News & Analysis</h1>
          {NEWS_STATIONS.filter((row) => row.site).map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => choose(row)}
              className={cn(
                "min-h-11 rounded-full px-3.5 text-sm font-semibold",
                station.id === row.id ? "bg-primary text-primary-fg" : "bg-elevated text-fg shadow-border",
              )}
            >
              {row.name}
            </button>
          ))}
        </div>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Each desk plays stories from the last day. A clip is labeled by how long ago it aired, not by an old broadcast.
          </p>
        </div>
      </div>

      <div id="news-live" ref={stage} className="sticky top-[calc(3.25rem+env(safe-area-inset-top))] z-20 bg-bg pb-2 sm:top-[calc(3.75rem+env(safe-area-inset-top))]">
      {station.site ? (
        <div>
          <iframe
            key={station.id === "desk-note" ? DESK_NOTE_URL : station.site}
            title={station.name}
            src={station.id === "desk-note" ? DESK_NOTE_URL : station.site}
            className="mt-4 h-[min(78dvh,52rem)] w-full rounded-3xl bg-black shadow-border"
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
          />
          <a href={station.id === "desk-note" ? DESK_NOTE_URL : station.site} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-primary">
            Open {station.name}
          </a>
        </div>
      ) : videoId ? (
        <div className="mt-4 overflow-hidden rounded-3xl bg-black shadow-border">
          <div className="relative aspect-video w-full">
            <iframe
              key={videoId}
              ref={frame}
              title={`${station.name} live`}
              src={liveSrc(videoId)}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-black" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-black" />
            <div className="pointer-events-none absolute bottom-16 right-0 h-12 w-40 bg-black" />
          </div>
          <button
            type="button"
            aria-label="Playback position"
            onClick={seek}
            className="block h-1.5 w-full border-0 bg-white/20 p-0"
          >
            <span className="block h-full bg-[#e10600]" style={{ width: `${progress}%` }} />
          </button>
        </div>
      ) : !ready ? (
        <div className="mt-4 grid aspect-video place-items-center rounded-3xl bg-elevated px-6 text-center shadow-border">
          <p className="max-w-md text-sm font-semibold">Checking stories from the last day.</p>
        </div>
      ) : (
        <div className="mt-4 grid aspect-video place-items-center rounded-3xl bg-elevated px-6 text-center shadow-border">
          <p className="max-w-md text-sm font-semibold">
            {station.name} has no story from the last day that we can play here.
          </p>
        </div>
      )}
      </div>
      <p className="mt-2 text-sm font-semibold">
        {station.name}
        <span className="ml-2 font-medium text-muted">
          {station.site ? "Credibility desk" : desk[0] ? when(desk.find((row) => row.videoId === videoId) ?? desk[0]) : ready ? "Nothing in the last day" : "Checking"} · {station.region}
        </span>
      </p>
      {station.site ? null : desk.length > 0 ? (
        <ul className="mt-3 space-y-1">
          {desk.map((story) => {
            const on = story.videoId === videoId;
            return (
              <li key={story.videoId}>
                <div className={cn("flex items-center gap-2 rounded-xl px-3 py-2", on ? "bg-elevated" : "hover:bg-elevated")}>
                  <button type="button" onClick={() => pickStory(story.videoId)} className="min-w-0 flex-1 text-left">
                    <span className={cn("block text-sm", on && "font-semibold")}>{story.title}</span>
                    <span className="text-xs text-muted">{when(story)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => pickStory(story.videoId)}
                    className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-fg"
                  >
                    Send
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
      {(() => {
        const story = desk.find((row) => row.videoId === videoId) ?? desk[0];
        if (!story) return null;
        const impact = readHeadline(story.title, station.name);
        void applied;
        return (
          <section className="mt-4 rounded-3xl border border-[#e4b86a]/40 bg-surface p-4 shadow-border">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Vibe Analysis</p>
            <h2 className="mt-1 text-base font-semibold">{story.title}</h2>
            <p className="mt-1 text-xs text-muted">{station.name} · {station.region}</p>
            <p className="mt-3 text-sm leading-relaxed">Use this report as a reason to study, not as the last word. Check the source, then the lesson behind it.</p>
            {impact.career || impact.paths.length || impact.dna.length || impact.path || impact.skill || impact.progress != null ? (
            <dl className="mt-3 space-y-2 text-sm leading-relaxed">
              {impact.career ? (
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Career</dt>
                  <dd className="mt-0.5">{impact.career}{impact.skill ? ` · ${impact.skill}` : ""}</dd>
                </div>
              ) : null}
              {impact.paths.length ? (
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Paths</dt>
                  <dd className="mt-0.5">{impact.paths.join(" · ")}</dd>
                </div>
              ) : null}
              {impact.dna.length ? (
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Knowledge</dt>
                  <dd className="mt-0.5">{impact.dna.join(" · ")}</dd>
                </div>
              ) : null}
              {impact.path || impact.skill || impact.progress != null ? (
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Journey</dt>
                  <dd className="mt-0.5">
                    {[impact.path, impact.skill, impact.progress != null ? `${impact.progress}%` : ""].filter(Boolean).join(" · ")}
                  </dd>
                </div>
              ) : null}
            </dl>
            ) : null}
            <div className="mt-4">
              <KnowledgeActions
                asset={knowledgeAsset({
                  id: story.videoId || story.title,
                  title: story.title,
                  source: station.name,
                  category: "News",
                  summary: story.title,
                  why: "Use this report as a reason to study, not as the last word.",
                  insight: impact.career || "",
                })}
                groups={[
                  { label: "Study", asks: ["Explain", "Study this", "Create quiz", "Create notes"] },
                  { label: "Connect", asks: ["Show careers", "Show certifications", "Show resources", "Add to journey"] },
                ]}
              />
              <button
                type="button"
                className="mt-3 inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg"
                onClick={() => askFilm({ title: story.title, caption: `${station.name}. ${story.title}`, youtubeId: story.videoId })}
              >
                Ask Noctis about this
              </button>
              <NewsSend
                title={story.title}
                station={station.name}
                region={station.region}
                href={story.videoId ? `https://www.youtube.com/watch?v=${story.videoId}` : station.site || ""}
                impact={impact}
              />
            </div>
          </section>
        );
      })()}

      <div className="mt-5 space-y-4">
        {NEWS_REGIONS.map((region) => (
          <div key={region}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-subtle">{region}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {NEWS_STATIONS.filter((row) => row.region === region && !row.site).map((row) => {
                const on = row.id === station.id;
                const up = stories.some((story) => story.id === row.id);
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => choose(row)}
                    className={cn(
                      "min-h-11 rounded-full px-3.5 text-sm font-semibold",
                      on ? "bg-primary text-primary-fg" : up ? "bg-elevated text-fg" : "bg-elevated text-muted",
                    )}
                  >
                    {row.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
