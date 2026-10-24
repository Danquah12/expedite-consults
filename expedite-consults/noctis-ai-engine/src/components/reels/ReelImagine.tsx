import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import type { FeedPost } from "@/lib/feed-data";
import { readImagine, startImagine, bringImagineFile } from "@/lib/imagine-api";
import { useCurrentUser } from "@/lib/auth/use-current-user";

const places = [
  ["linkedin", "LinkedIn"],
  ["whatsapp", "WhatsApp"],
  ["facebook", "Facebook"],
  ["instagram", "Instagram"],
  ["x", "X"],
] as const;

function lineName(name?: string | null) {
  const clean = (name || "Vibe")
    .replace(/\s*@\s*vibetok\s*$/i, "")
    .replace(/[^\p{L}\p{M}\p{N}\s.'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = clean.split(" ").filter(Boolean);
  const full = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
  return `${full} @ Noctis`;
}

function reelWords(post: FeedPost) {
  return [post.caption, post.teach?.hook, post.teach?.stamp].filter(Boolean).join(". ").replace(/\s+/g, " ").trim();
}

function wordParts(text: string) {
  const words = text.split(/\s+/).filter(Boolean);
  const size = Math.max(1, Math.ceil(words.length / 3));
  return [0, 1, 2].map((part) => words.slice(part * size, (part + 1) * size).join(" ") || words.slice(0, size).join(" ") || text);
}

function stillOf(post: FeedPost) {
  const raw = post.posterUrl || (post.mediaType === "image" ? post.mediaUrl : "");
  if (!raw.startsWith("https://")) return "";
  if (/localhost|127\.0\.0\.1|grok\.me/i.test(raw)) return "";
  return raw;
}

export function ReelImagine({ post, active }: { post: FeedPost; active: boolean }) {
  const person = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [films, setFilms] = useState<string[]>([]);
  const [show, setShow] = useState(0);
  const [picked, setPicked] = useState<string[]>(["whatsapp"]);
  const [who, setWho] = useState("");
  const [job, setJob] = useState("");
  const filmsRef = useRef<string[]>([]);

  useEffect(() => {
    if (active) return;
    setOpen(false);
  }, [active]);

  useEffect(() => {
    const id = job;
    if (!id) return;
    let stop = false;
    const look = async () => {
      const polled = await readImagine({ data: { requestId: id } }).catch(() => null);
      const bag = polled && typeof polled === "object" ? (polled as { status?: string; video?: string; error?: string; result?: { status?: string; video?: string; error?: string } }) : {};
      const inner = bag.result && typeof bag.result === "object" ? bag.result : bag;
      if (stop) return;
      if (inner.video) {
        const next = [...filmsRef.current, inner.video];
        filmsRef.current = next;
        setFilms(next);
        setJob("");
        if (next.length < 3) {
          setNote(`Imagine is making the 45 second film. Part ${next.length + 1} of 3.`);
          void makePart(next.length);
        } else {
          setBusy(false);
          setNote("The 45 second film is ready. Send it out.");
        }
        return;
      }
      if (inner.status === "failed") {
        setBusy(false);
        setJob("");
        setNote(stoppedNote(inner.error));
        return;
      }
      window.setTimeout(() => void look(), 4000);
    };
    const timer = window.setTimeout(() => void look(), 4000);
    return () => {
      stop = true;
      window.clearTimeout(timer);
    };
  }, [job]);

  async function makePart(part: number) {
    const words = wordParts(reelWords(post));
    const spoken = words[part] || words[0];
    try {
      const result = await startImagine({
        data: {
          prompt: `Part ${part + 1} of 3 in one 45 second vertical film. This part lasts 15 seconds and continues the same lesson. Do not restart the story. ${spoken}`,
          words: spoken,
          kind: "speech",
          image: stillOf(post),
        },
      });
      const bag = result && typeof result === "object" ? (result as { requestId?: string; error?: string; result?: { requestId?: string; error?: string } }) : {};
      const inner = bag.result && typeof bag.result === "object" ? bag.result : bag;
      if (!inner.requestId) {
        setBusy(false);
        setNote(inner.error || (filmsRef.current.length ? "The rest of the film did not start." : "Imagine did not start."));
        return;
      }
      setJob(inner.requestId);
    } catch {
      setBusy(false);
      setNote("Imagine could not start.");
    }
  }

  function stoppedNote(error?: string) {
    return filmsRef.current.length ? `${error || "Imagine stopped."} ${filmsRef.current.length * 15} seconds are ready.` : error || "Imagine could not finish the film.";
  }

  async function make() {
    if (busy) return;
    filmsRef.current = [];
    setFilms([]);
    setShow(0);
    setBusy(true);
    setJob("");
    setNote("Imagine is making a 45 second film. Part 1 of 3.");
    await makePart(0);
  }

  async function send() {
    const sources = filmsRef.current.length ? filmsRef.current : films;
    if (!sources.length) return;
    const chosen = places.filter(([id]) => picked.includes(id));
    if (!chosen.length) {
      setNote("Check a place first.");
      return;
    }
    const line = lineName(who || person?.displayName);
    const words = reelWords(post);
    const message = `${line}\n\n${words}\n\n45 second film, reimagined on Noctis\nhttps://noctis.social/reels`;
    setNote("Attaching the 45 second film…");
    const files: File[] = [];
    for (let index = 0; index < sources.length; index += 1) {
      try {
        const brought = await bringImagineFile({ data: { url: sources[index] } });
        const bag = brought && typeof brought === "object" ? (brought as { file?: string; mime?: string; result?: { file?: string; mime?: string } }) : {};
        const inner = bag.result && typeof bag.result === "object" ? bag.result : bag;
        if (!inner.file) continue;
        const res = await fetch(inner.file);
        const blob = await res.blob();
        files.push(new File([blob], `vibetok-reel-${index + 1}.mp4`, { type: inner.mime || "video/mp4" }));
      } catch {
        /* try the next part */
      }
    }
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      /* the film can still go */
    }
    if (files.length && typeof navigator.share === "function") {
      const payload: ShareData = { files, title: line, text: message };
      try {
        if (typeof navigator.canShare !== "function" || navigator.canShare(payload)) {
          await navigator.share(payload);
          setNote("The 45 second film is going out.");
          return;
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    const href =
      picked.includes("whatsapp")
        ? `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`
        : picked.includes("x")
          ? `https://x.com/intent/post?text=${encodeURIComponent(message)}`
          : picked.includes("facebook")
            ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://noctis.social/reels")}`
            : picked.includes("linkedin")
              ? `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(message)}`
              : "https://www.instagram.com/";
    window.open(href, "_blank", "noopener,noreferrer");
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    });
    setNote(files.length ? "The 45 second film downloaded in three parts and the words are copied. Attach them, then paste." : "The words are copied. The film link is in the message.");
  }

  return (
    <>
      <button
        type="button"
        aria-label="Reimagine this reel"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((on) => !on);
        }}
        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-[#e4b86a]/70 bg-[#12141c] px-3 text-xs font-semibold text-[#e4b86a]"
      >
        <Sparkles className="size-3.5" />
        Imagine
      </button>
      {open ? (
        <div
          className="pointer-events-auto fixed inset-x-3 bottom-28 z-[70] rounded-2xl border border-[#e4b86a]/50 bg-[#0c1018]/95 p-3 text-left shadow-float sm:left-auto sm:right-4 sm:w-[22rem]"
          onClick={(event) => event.stopPropagation()}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e4b86a]">Imagine</p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-300">{reelWords(post)}</p>
          {films[show] ? (
            <video
              key={films[show]}
              src={films[show]}
              controls
              autoPlay
              playsInline
              className="mt-2 aspect-[9/16] max-h-64 w-full rounded-xl bg-black object-cover"
              onEnded={() => {
                if (show + 1 < films.length) setShow(show + 1);
              }}
            />
          ) : null}
          <p className="mt-1 text-[11px] text-zinc-500">{films.length ? `${Math.min(films.length, 3) * 15} of 45 seconds` : "45 seconds"}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => void make()} disabled={busy} className="h-8 rounded-full bg-[#e4b86a] px-3 text-xs font-semibold text-[#1a1408] disabled:opacity-40">
              {busy ? "Making" : films.length ? "Make another" : "Reimagine"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="h-8 rounded-full px-2 text-xs text-zinc-400">
              Close
            </button>
          </div>
          {films.length ? (
            <div className="mt-2">
              <input
                value={who || lineName(person?.displayName)}
                onChange={(event) => setWho(event.target.value)}
                aria-label="Name on the post"
                className="w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs text-zinc-100"
              />
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                {places.map(([id, label]) => (
                  <label key={id} className="inline-flex items-center gap-1.5 text-[11px] text-zinc-200">
                    <input
                      type="checkbox"
                      checked={picked.includes(id)}
                      onChange={() => setPicked((rows) => (rows.includes(id) ? rows.filter((row) => row !== id) : [...rows, id]))}
                      className="size-3.5 accent-[#e4b86a]"
                    />
                    {label}
                  </label>
                ))}
                <button type="button" onClick={() => void send()} className="h-8 rounded-full bg-white px-3 text-xs font-semibold text-black">
                  Send
                </button>
              </div>
            </div>
          ) : null}
          {note ? <p className="mt-2 text-[11px] text-zinc-400">{note}</p> : null}
        </div>
      ) : null}
    </>
  );
}
