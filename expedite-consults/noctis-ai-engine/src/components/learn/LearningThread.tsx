import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { FeedPost } from "@/lib/feed-data";
import { layTell } from "@/lib/plain-meaning";
import { loadFilmBrief, type FilmBrief } from "@/lib/knowledge-api";
import { useFeedStore } from "@/lib/feed-store";
import { scrollToFeed, scrollToReel } from "@/lib/syndicate";
import { addHours, raiseDna, readDna } from "@/lib/hall-record";
import { evidenceLevel, knowledgeAsset } from "@/lib/knowledge-asset";
import { KnowledgeActions } from "@/components/learn/KnowledgeActions";
import { SayToNoctis } from "@/components/learn/SayToNoctis";
import { youtubeIdOf } from "@/lib/youtube";

const STUDY_KEY = "vt-study-said";

function studiedIds() {
  try {
    const raw = JSON.parse(localStorage.getItem(STUDY_KEY) || "[]") as unknown;
    return new Set(Array.isArray(raw) ? raw.filter((id) => typeof id === "string") : []);
  } catch {
    return new Set<string>();
  }
}

function markStudied(id: string) {
  const ids = studiedIds();
  ids.add(id);
  localStorage.setItem(STUDY_KEY, JSON.stringify([...ids].slice(-400)));
}

const TITLE_STOP = new Set([
  "about", "after", "also", "been", "before", "earth", "film", "from", "have", "human", "humans", "into", "just", "learn", "learning", "more", "only", "over", "people", "really", "revealed", "shocking", "some", "source", "such", "than", "that", "their", "there", "this", "truth", "video", "watch", "what", "when", "where", "which", "will", "with", "world", "your",
]);

function plainTitle(text: string) {
  const clean = text
    .replace(/&/g, "&")
    .replace(/"/g, '"')
    .replace(/&#39;|'/g, "'")
    .replace(/presented by.+$/i, "")
    .replace(/source\s*[·•|:–-]\s*.*/i, "")
    .replace(/expedite consults.*/i, "")
    .replace(/#\w+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const parts = clean.split(/\s*[.|]\s+/).map((part) => part.trim()).filter(Boolean);
  const once = parts.length >= 2 && parts[0]!.toLowerCase() === parts[1]!.toLowerCase() ? parts[0]! : clean;
  const half = Math.floor(once.length / 2);
  const left = once.slice(0, half).trim();
  const right = once.slice(half).trim();
  const title = left.length > 8 && left.toLowerCase() === right.toLowerCase() ? left : once;
  return title.replace(/[.?!]+$/g, "").trim();
}

function filmTitle(post: FeedPost) {
  const hook = plainTitle(post.teach.hook || "");
  const caption = plainTitle((post.caption || "").split(/\.\s*Film\b/i)[0] || "");
  if (hook.length > 6 && hook.length < 90) return hook;
  if (caption.length > 6 && caption.length < 110) return caption;
  return plainTitle(post.teach.stamp || "This film");
}

function subjectKeys(text: string) {
  return [...new Set(text.toLowerCase().replace(/&/g, " and ").split(/[^a-z0-9]+/))].filter((word) => word.length > 4 && !TITLE_STOP.has(word));
}

function uniqueLines(lines: string[]) {
  const seen = new Set<string>();
  return lines.filter((line) => {
    const key = line.trim().toLowerCase();
    if (key.length < 8 || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const jobs = new Map<string, Promise<FilmBrief | null>>();

function ask(post: FeedPost, story: string) {
  const id = `${post.youtubeId || post.id}:src13`;
  let job = jobs.get(id);
  if (!job) {
    job = loadFilmBrief({
      data: { id: post.youtubeId || post.id, title: [post.teach.hook, post.teach.stamp, filmTitle(post)].filter(Boolean).join(". "), author: post.author?.name ?? "", story },
    })
      .then((next) => {
        if (!next) jobs.delete(id);
        return next;
      })
      .catch(() => {
        jobs.delete(id);
        return null;
      });
    jobs.set(id, job);
  }
  return job;
}

export function LearningThread({ post }: { post: FeedPost }) {
  const local = uniqueLines(layTell(post));
  const [brief, setBrief] = useState<FilmBrief | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [step, setStep] = useState<"read" | "cover" | "check" | "kept">("read");
  const [showAnswer, setShowAnswer] = useState(false);
  const [moreWords, setMoreWords] = useState(false);
  const box = useRef<HTMLElement>(null);
  const lines = local;
  const keep = lines[lines.length - 1] ?? local[local.length - 1] ?? "";
  const subject = brief?.subject ?? filmTitle(post);
  const posts = useFeedStore((s) => s.posts);
  const openModal = useFeedStore((s) => s.openModal);
  const asset = knowledgeAsset({
    id: post.id,
    title: subject,
    source: brief?.source || "",
    creator: post.author?.name || "",
    category: post.teach.stamp,
    summary: brief?.fact || post.teach.hook,
    insight: `${lines[0] || post.teach.hook} ${post.caption}`,
    why: brief?.helps || "",
    confidence: brief?.truth ?? null,
  });
  const strands = asset.knowledgeTags;
  const careers = asset.careerTags;
  const paths = asset.path;
  const kin = useMemo(() => {
    const mine = subjectKeys(`${post.teach.stamp} ${post.teach.hook} ${subject}`).slice(0, 6);
    if (!mine.length) return [];
    const stamp = post.teach.stamp.toLowerCase();
    const broad = /^(learn|film|video|study|clinic|hub|reel|music|all|watch)$/i.test(stamp);
    return posts
      .filter((row) => {
        if (row.id === post.id || row.mediaType !== "video") return false;
        const theirs = subjectKeys(`${row.teach.stamp} ${row.teach.hook} ${row.caption}`);
        const shared = mine.filter((word) => theirs.includes(word));
        const sameStamp = !broad && stamp.length > 3 && row.teach.stamp.toLowerCase() === stamp;
        return (sameStamp && shared.length >= 1) || shared.length >= 2;
      })
      .slice(0, 4);
  }, [posts, subject, post.id, post.teach.hook, post.teach.stamp]);

  useEffect(() => {
    const node = box.current;
    if (!node) return;
    let stop = false;
    const run = () => {
      setWaiting(true);
      void ask(post, local.join(" ")).then((next) => {
        if (stop) return;
        setBrief(next);
        setWaiting(false);
      });
    };
    const watch = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          watch.disconnect();
          run();
        }
      },
      { rootMargin: "240px" },
    );
    watch.observe(node);
    if (studiedIds().has(post.youtubeId || post.id)) setStep("kept");
    return () => {
      stop = true;
      watch.disconnect();
    };
  }, [post.id, post.youtubeId]);

  return (
    <section ref={box} data-read className="space-y-3 px-4 py-3">
      <div className="rounded-2xl bg-elevated px-3 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Vibe Analysis</p>
        <p className="mt-1 text-sm font-semibold">{subject}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">Evidence, context, evidence match, sources, and why it matters. Classroom is the practice after the film.</p>
        {brief?.bars?.length ? (
          <div className="mt-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Evidence</p>
            <ul className="mt-2 space-y-2">
            {brief.bars.map((bar) => (
              <li key={bar.label} className="grid grid-cols-[7.5rem_1fr] items-center gap-2">
                <span className="truncate text-xs text-muted">{bar.label}</span>
                <span className="h-2 overflow-hidden rounded-full bg-bg">
                  <span className="block h-2 rounded-full bg-primary" style={{ width: `${Math.max(12, bar.score * 20)}%` }} />
                </span>
              </li>
            ))}
            </ul>
          </div>
        ) : null}
        {brief ? (
          <div className="mt-4">
            <div className="rounded-2xl bg-bg px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Evidence match</p>
                  <p className="mt-1 text-4xl font-semibold tabular-nums leading-none">{brief.cites?.length ? `${brief.truth ?? 0}%` : "—"}</p>
                  <p className="mt-2 text-sm font-semibold">{brief.cites?.length ? evidenceLevel(brief.truth ?? 0) : "Not scored"}</p>
                  <p className="mt-2 text-sm text-muted">
                    {brief.cites?.length
                      ? `${brief.cites.length} ${brief.cites.length === 1 ? "page is" : "pages are"} about this subject.`
                      : "No page about this subject was opened."}
                  </p>
                  {brief.cites?.length ? (
                    <p className="mt-1 text-sm text-muted">
                      {brief.factsOnRecord ?? 0} of {brief.factsChecked ?? 0} words from the film appear on those pages.
                    </p>
                  ) : null}
                </div>
                {brief.href ? (
                  <a
                    href={brief.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`See source page: ${brief.source || "source"}`}
                    onClick={(event) => event.stopPropagation()}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-amber-300 px-4 text-sm font-bold text-black"
                  >
                    See source
                  </a>
                ) : null}
              </div>
              <p className="mt-3 text-sm leading-relaxed">
                {brief.cites?.length
                  ? "This is how many of the film’s own words showed up on a page about the same subject. It is not a grade of the film."
                  : "No respected page about this subject was found, so this film is not scored."}
              </p>
              {brief.cites?.length ? (
                <div className="mt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Supporting sources</p>
                  <ul className="mt-2 space-y-2 text-sm leading-relaxed">
                  {brief.cites.map((cite) => (
                    <li key={cite.href}>
                      <a href={cite.href} target="_blank" rel="noreferrer" className="font-semibold text-primary" onClick={(event) => event.stopPropagation()}>
                        {cite.house} — {cite.title}
                      </a>
                    </li>
                  ))}
                  </ul>
                </div>
              ) : null}
              {brief.checkedFacts?.length || brief.missedFacts?.length ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setMoreWords((open) => !open);
                  }}
                  className="mt-3 min-h-11 rounded-full bg-elevated px-4 text-sm font-semibold"
                >
                  {moreWords ? "Hide words" : "More words"}
                </button>
              ) : null}
              {moreWords ? (
                <div className="mt-3 space-y-2 text-sm leading-relaxed">
                  {brief.checkedFacts?.length ? <p><span className="font-semibold">On the page. </span>{brief.checkedFacts.join(", ")}</p> : null}
                  {brief.missedFacts?.length ? <p><span className="font-semibold">Not on the page. </span>{brief.missedFacts.join(", ")}</p> : null}
                </div>
              ) : null}
            </div>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">What the cited page supports</p>
            <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-bg">
              <span className="h-3 bg-emerald-400" style={{ width: `${brief.backed}%` }} />
              <span className="h-3 bg-amber-300" style={{ width: `${brief.opinion}%` }} />
              <span className="h-3 bg-muted/40" style={{ width: `${brief.unclear}%` }} />
            </div>
            <ul className="mt-2 space-y-1 text-xs">
              <li>On a page about this subject · {brief.backed ?? 0}%</li>
              <li>Not found on those pages · {brief.unclear ?? 0}%</li>
            </ul>
            {(brief.opinion ?? 0) > 0 && brief.opinionLine ? (
              <p className="mt-3 text-sm leading-relaxed">{brief.opinionLine}</p>
            ) : null}
            {brief.fact ? (
              <p className="mt-2 text-sm leading-relaxed">
                <span className="font-semibold">{brief.href ? "The fact. " : "What the film says. "}</span>
                {brief.fact}{" "}
                {brief.href ? (
                  <a href={brief.href} target="_blank" rel="noreferrer" className="text-primary">
                    Reference: {brief.source}
                  </a>
                ) : null}
              </p>
            ) : null}
            <p className="mt-2 text-xs text-muted">
              {brief.href
                ? "Green is the share found on the sources listed above. Gray was checked and was not on those pages."
                : "No public page matched this film, so the words below are the film's own view. They were not checked as a fact."}
            </p>
          </div>
        ) : null}
        {brief?.helps ? (
          <p className="mt-3 text-sm leading-relaxed">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Why it matters</span>
            {brief.helps}
          </p>
        ) : null}
        <div className="mt-3 space-y-2 text-sm">
          <p>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Knowledge DNA</span>
            {strands.length ? strands.map((name) => `${name} ${readDna()[name] ?? 0}. +1 when you can say this.`).join(" ") : "No strand is stored for this film."}
          </p>
          <p>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Careers</span>
            {careers.length ? careers.join(" · ") : "No career card matches this film."}
          </p>
          {careers.length ? <Link to="/openings" className="inline-flex font-semibold text-primary">Open career</Link> : null}
          <p>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Paths</span>
            {paths.length ? paths.join(" · ") : "No path matches this film."}
          </p>
          {paths.length ? <Link to="/paths" className="inline-flex font-semibold text-primary">Open paths</Link> : null}
          <p>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Journey</span>
            5 marks and 0.1 hours when you can say this.{kin[0] ? ` Suggested next: ${filmTitle(kin[0])}.` : " No next film is stored."}
          </p>
        </div>
      </div>
      <div className="space-y-2 rounded-2xl bg-elevated px-3 py-3 text-sm leading-relaxed">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Vibe insight</p>
        {step === "cover" ? (
          <p>The words are covered. Say what this film is about before you look.</p>
        ) : (
          lines.map((line) => <p key={line}>{line}</p>)
        )}
        {step === "check" ? (
          <div className="rounded-xl bg-bg px-3 py-3">
            <p className="text-sm font-semibold">What should you remember about {subject}?</p>
            {showAnswer ? <p className="mt-2">{keep}</p> : <p className="mt-2 text-muted">Answer it in your own words first.</p>}
          </div>
        ) : null}
        {waiting && !brief ? <p className="text-xs text-muted">Reading a public source for this film…</p> : null}
        <div className="flex flex-wrap gap-2 pt-1">
          {step === "read" ? (
            <button type="button" className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-fg" onClick={() => setStep("cover")}>
              Study this
            </button>
          ) : null}
          {step === "cover" ? (
            <button type="button" className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-fg" onClick={() => setStep("check")}>
              Check myself
            </button>
          ) : null}
          {step === "check" && !showAnswer ? (
            <button type="button" className="rounded-full bg-bg px-3 py-1.5 text-xs font-semibold" onClick={() => setShowAnswer(true)}>
              Show the answer
            </button>
          ) : null}
          {step === "check" && showAnswer ? (
            <button
              type="button"
              className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-fg"
              onClick={() => {
                markStudied(post.youtubeId || post.id);
                if (strands.length) raiseDna(strands, 1);
                addHours(0.1);
                useFeedStore.getState().awardXp(5);
                setStep("kept");
              }}
            >
              I can say this
            </button>
          ) : null}
          {step === "kept" ? <p className="text-xs font-semibold text-primary">You studied this. You can say it without the film.</p> : null}
          <button
            type="button"
            className="min-h-11 rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg"
            onClick={(event) => {
              event.stopPropagation();
              openModal({ type: "video", postId: post.id });
            }}
          >
            Ask about this video
          </button>
          <SayToNoctis youtubeId={youtubeIdOf(post)} title={subject} />
          <div className="basis-full">
            <KnowledgeActions asset={asset} />
          </div>
          {step !== "read" ? (
            <button
              type="button"
              className="rounded-full bg-bg px-3 py-1.5 text-xs font-semibold"
              onClick={() => {
                setShowAnswer(false);
                setStep("read");
              }}
            >
              Read it again
            </button>
          ) : null}
        </div>
      </div>
      {kin.length ? (
        <div className="rounded-2xl bg-elevated px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Continue understanding</p>
          <ul className="mt-2 space-y-2">
            {kin.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  className="text-left text-sm font-semibold"
                  onClick={() => {
                    useFeedStore.getState().setPlayingId(row.id);
                    if (document.querySelector(`[data-reel="${row.id}"]`)) scrollToReel(row.id);
                    else scrollToFeed(row.id);
                  }}
                >
                  {filmTitle(row)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
