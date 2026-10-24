import { useEffect, useRef, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { NoctisMark } from "@/components/brand/NoctisMark";
import { renderVibePaper } from "@/lib/paper-sheet";
import { useRouterState } from "@tanstack/react-router";
import { askStudy } from "@/lib/knowledge-api";
import { askNoctis } from "@/lib/noctis-api";
import { RESEARCH_LABS } from "@/lib/research-labs";
import { CYBER_BENCH } from "@/lib/cyber-bench";
import { STUDY_COPILOTS } from "@/lib/study-copilots";
import { TUTORS } from "@/lib/tutors";
import { asksToBeTaught, teacherPlan } from "@/lib/personal-teacher";
import { learningBoard } from "@/lib/learning-board";
import { GOALS } from "@/lib/learn";
import { useFeedStore } from "@/lib/feed-store";
import type { Evidence } from "@/lib/knowledge-types";
import type { StudyCard } from "@/lib/knowledge-types";

const CONFIDENCE: Record<StudyCard["confidence"], string> = {
  verified: "Evidence strength: High",
  supported: "Evidence strength: Moderate",
  insufficient: "Insufficient evidence",
};

function evidenceRank(row: Evidence) {
  const hay = `${row.type} ${row.source} ${row.relevance}`.toLowerCase();
  if (/bible|king james|exact stored/.test(hay)) return "Primary";
  if (/nvd|cisa|rfc|nist|standard|specification/.test(hay)) return "Official";
  if (/wikipedia|encyclopedia/.test(hay)) return "Secondary";
  return "Unverified";
}

export function SermonPage({ steps, verse }: { steps: string[]; verse: string }) {
  const title = steps[0] && !steps[0].includes("\n") && steps[0].length < 80 ? steps[0] : "";
  const parts = title ? steps.slice(1) : steps;
  return (
    <div className="rounded-2xl bg-[#f6f1e7] px-5 py-6 text-[#1c1612] shadow-border">
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a5a2b]">Sermon</p>
      {title ? <h3 className="mt-2 text-center font-display text-2xl font-semibold leading-tight">{title}</h3> : null}
      <blockquote className="mx-auto mt-4 max-w-prose border-y border-[#e4d3b8] py-3 text-center font-display text-lg leading-snug">{verse}</blockquote>
      <div className="mx-auto mt-2 max-w-prose">
        {parts.map((step) => {
          const [head, ...rest] = step.split(/\n\n/);
          const titled = rest.length > 0 && head.length < 48;
          const body = titled ? rest.join("\n\n") : step;
          return (
            <section key={step.slice(0, 48)} className="mt-6">
              {titled ? <h4 className="font-display text-lg font-semibold text-[#6e4520]">{head}</h4> : null}
              <p className="mt-2 text-[15px] leading-8">{body}</p>
            </section>
          );
        })}
      </div>
    </div>
  );
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

async function shareFiles(files: File[], text: string) {
  if (!files.length || typeof navigator.share !== "function") return false;
  const data: ShareData = { files, text, title: "Written by Noctis · Noctis Clinic" };
  try {
    if (typeof navigator.canShare === "function" && !navigator.canShare(data)) return false;
    await navigator.share(data);
    return true;
  } catch (err) {
    if ((err as Error).name === "AbortError") return true;
    return false;
  }
}

function PaperShare({ title, lede, source, steps }: { title: string; lede: string; source: string; steps: string[] }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(true);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pages, setPages] = useState<string[]>([]);
  const pack = useRef<{ pdf: File; images: File[] } | null>(null);
  const body = steps.join("\n");

  useEffect(() => {
    let cancel = false;
    setBusy(true);
    void renderVibePaper({ title, lede, source, steps, fit: "full" })
      .then((sheet) => {
        if (cancel) return;
        pack.current = { pdf: sheet.pdf, images: sheet.images };
        const nextPages = sheet.images.map((file) => URL.createObjectURL(file));
        const nextPdf = URL.createObjectURL(sheet.pdf);
        setPages((prev) => {
          prev.forEach((url) => URL.revokeObjectURL(url));
          return nextPages;
        });
        setPdfUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return nextPdf;
        });
        setNote("Paper is ready. Press a platform to open the share menu and choose who receives it.");
      })
      .catch((err: unknown) => {
        if (!cancel) setNote(err instanceof Error ? err.message : "The paper could not be formatted.");
      })
      .finally(() => {
        if (!cancel) setBusy(false);
      });
    return () => {
      cancel = true;
    };
  }, [title, lede, source, body]);

  async function send(where: "phone" | "whatsapp" | "linkedin" | "facebook" | "instagram" | "x" | "copy") {
    const sheet = pack.current;
    if (!sheet) {
      setNote("The paper is still formatting. Press again in a moment.");
      return;
    }
    const text = "Written by Noctis · Noctis Clinic";
    if (where !== "copy") {
      const shared = (await shareFiles(sheet.images, text)) || (await shareFiles([sheet.pdf], text));
      if (shared) {
        const line = "The share menu is open. Select the app, then choose who receives the two-page paper.";
        setNote(line);
        toast.success(line);
        return;
      }
    }
    downloadFile(sheet.pdf);
    const sites: Record<string, string> = {
      whatsapp: "https://web.whatsapp.com/",
      linkedin: "https://www.linkedin.com/feed/?shareActive=true",
      facebook: "https://www.facebook.com/",
      instagram: "https://www.instagram.com/",
      x: "https://x.com/compose/post",
    };
    const site = sites[where];
    const opened = site ? window.open(site, "_blank", "noopener,noreferrer") : null;
    const line = opened
      ? `${where} is open. This browser has no share menu, so attach the downloaded vibetok-white-paper.pdf.`
      : "The two-page paper downloaded. Attach vibetok-white-paper.pdf in the app you opened.";
    setNote(line);
    toast.success(line);
  }

  const button = "min-h-11 rounded-full bg-elevated px-3 text-xs font-semibold disabled:opacity-50";
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Send this paper</p>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" disabled={busy} onClick={() => void send("phone")} className="min-h-11 rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg disabled:opacity-50">
          {busy ? "Formatting…" : "Share from this phone"}
        </button>
        <button type="button" disabled={busy} onClick={() => void send("whatsapp")} className={button}>WhatsApp</button>
        <button type="button" disabled={busy} onClick={() => void send("linkedin")} className={button}>LinkedIn</button>
        <button type="button" disabled={busy} onClick={() => void send("facebook")} className={button}>Facebook</button>
        <button type="button" disabled={busy} onClick={() => void send("instagram")} className={button}>Instagram</button>
        <button type="button" disabled={busy} onClick={() => void send("x")} className={button}>X</button>
        <button type="button" disabled={busy} onClick={() => void send("copy")} className={button}>Copy paper</button>
      </div>
      {pages.map((url, index) => (
        <img key={url} src={url} alt={`Noctis paper page ${index + 1}`} className="w-full rounded-2xl bg-[#0b1220] object-contain" />
      ))}
      {pdfUrl ? (
        <a href={pdfUrl} download="vibetok-white-paper.pdf" className="inline-flex min-h-11 items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg">
          Download the two-page paper
        </a>
      ) : null}
      {note ? <p className="text-xs text-muted">{note}</p> : null}
    </div>
  );
}

export function PaperPage({ steps, lede, source }: { steps: string[]; lede: string; source: string }) {
  const title = steps[0] && !steps[0].includes("\n") && steps[0].length < 80 ? steps[0] : "White paper";
  const parts = title === steps[0] ? steps.slice(1) : steps;
  return (
    <div className="space-y-3">
    <div className="rounded-2xl bg-[#f7f7f4] px-5 py-6 text-[#1a1d23] shadow-border">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3d5a80]">White paper</p>
      <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">{title}</h3>
      <div className="mt-3 flex items-center gap-3">
        <NoctisMark className="size-11" title="Noctis" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a5e22]">Written by</p>
          <p className="font-display text-base font-semibold leading-tight">Noctis</p>
          <p className="text-[11px] text-[#5c6570]">Noctis Clinic</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-[#5c6570]">{source || "Retrieved source"}</p>
      <p className="mt-4 max-w-prose text-[15px] leading-7">{lede}</p>
      <div className="mt-2 max-w-prose">
        {parts.map((step) => {
          const [head, ...rest] = step.split(/\n\n/);
          const titled = rest.length > 0 && head.length < 48;
          return (
            <section key={step.slice(0, 48)} className="mt-6">
              {titled ? <h4 className="font-display text-lg font-semibold text-[#1d3557]">{head}</h4> : null}
              <p className="mt-2 whitespace-pre-line text-[15px] leading-8">
                {(titled ? rest.join("\n\n") : step).split(/(https?:\/\/[^\s]+)/g).map((part, index) =>
                  /^https?:\/\//.test(part) ? (
                    <a key={`${part}-${index}`} href={part} target="_blank" rel="noreferrer" className="underline">
                      {part}
                    </a>
                  ) : (
                    <span key={index}>{part}</span>
                  ),
                )}
              </p>
            </section>
          );
        })}
      </div>
      <img src="/brand/lockup.jpg" alt="Written by Noctis, Noctis Clinic" className="mt-8 h-24 w-full rounded-xl object-cover object-center" />
    </div>
    <PaperShare title={title} lede={lede} source={source} steps={parts} />
    </div>
  );
}

export function StudyCopilot() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [card, setCard] = useState<StudyCard | null>(null);
  const [vibe, setVibe] = useState("");
  const [err, setErr] = useState("");
  const [labId, setLabId] = useState<string>("cyber");
  const [tutorId, setTutorId] = useState<(typeof TUTORS)[number]["id"]>("bible");
  const [labsOpen, setLabsOpen] = useState(false);
  const lab = RESEARCH_LABS.find((item) => item.id === labId) ?? RESEARCH_LABS[0]!;
  const tutor = TUTORS.find((item) => item.id === tutorId) ?? TUTORS[0];
  const copilot = STUDY_COPILOTS.find((item) => item.id === tutor.copilot) ?? null;
  const [subjectId, setSubjectId] = useState("");
  const subject = copilot?.modes.find((mode) => mode.id === subjectId) ?? null;

  function topicOf(ask: string) {
    const tail = ask.split(":").slice(1).join(":").trim();
    return tail || ask;
  }

  async function answerWithVibe(question: string, area: string) {
    const asked = question.trim() || `Teach ${area}.`;
    setQ(asked);
    setOpen(true);
    setBusy(true);
    setErr("");
    setVibe("");
    const prompt = [
      `You are Vibe, the ${tutor.label}.`,
      `The subject area is ${area}.`,
      "Answer the question inside that subject. Teach it in plain language: the idea, one example, and what to remember.",
      tutor.id === "bible" ? "Quote a verse only when you are sure of the wording. If you are not sure, say so." : "",
      tutor.id === "cyber" ? "Teach defense. Do not write an exploit." : "",
      `Do not stop because a short note was missing. Stay on ${area}.`,
      `Question: ${asked}`,
    ].filter(Boolean).join("\n");
    try {
      const reply = await askNoctis({ data: { turns: [{ role: "user", content: prompt }], skill: "talk", desk: "study" } });
      const bag = reply && typeof reply === "object" && "result" in reply ? (reply as { result?: { text?: string; error?: string } }).result ?? reply : reply;
      const text = bag && typeof bag === "object" && "text" in bag && typeof (bag as { text?: unknown }).text === "string" ? (bag as { text: string }).text : "";
      const failure = bag && typeof bag === "object" && "error" in bag && typeof (bag as { error?: unknown }).error === "string" ? (bag as { error: string }).error : "";
      if (!text.trim()) setErr(failure || "Vibe did not answer.");
      else setVibe(text.trim());
    } catch {
      setErr("Vibe did not answer.");
    } finally {
      setBusy(false);
    }
  }

  function frame(text: string) {
    const next = text.trim();
    if (!next) return next;
    if (/copilot,/i.test(next) || /this film|this lesson|hall lesson|sermon|white paper|write a study note|use only these facts|overview of the book|\d\s*:\s*\d|^research this\b|^teach me\b|teacher:|tutor:|mentor:|instructor:|coach:|assistant:/i.test(next)) return next;
    if (RESEARCH_LABS.some((item) => item.prompts.some((prompt) => prompt.q === next))) return `Research this as a ${lab.role}. ${next}`;
    if (tutor.copilot && copilot) return `${copilot.label} copilot, ${copilot.modes[0].label}: ${next}`;
    return `${tutor.label}: ${next}`;
  }

  async function ask(text?: string, teach = false) {
    const raw = (text ?? q).trim();
    if (asksToBeTaught(raw)) {
      const posts = useFeedStore.getState().posts;
      const played = useFeedStore.getState().dayWatch.played;
      const passed = useFeedStore.getState().drillPassed;
      const missed = useFeedStore.getState().drillMissed;
      const goal = GOALS.find((item) => item.id === useFeedStore.getState().goal)?.label || "not set";
      const films = posts.map((post) => ({
        id: post.id,
        title: post.teach.hook || post.caption,
        text: `${post.teach.stamp} ${post.teach.hook} ${post.caption} ${post.hashtags.join(" ")}`,
      }));
      const passedIds = Object.keys(passed).filter((id) => passed[id]);
      const plan = teacherPlan({
        films,
        played,
        passed: passedIds,
        missed: Object.keys(missed).filter((id) => missed[id] > 0),
        goal,
        bars: learningBoard(films, played, passedIds).bars,
      });
      setQ(raw);
      setOpen(true);
      setBusy(false);
      setErr("");
      setCard({
        question: raw,
        sentence: plan.nextLesson,
        domain: "teacher",
        confidence: plan.studied.length ? "supported" : "insufficient",
        steps: [
          plan.studied.length ? `Studied: ${plan.studied.join(", ")}` : "Studied: nothing yet",
          `Understands: ${plan.understood.join(", ") || "nothing checked"}`,
          `Does not understand yet: ${plan.missing.join(", ") || "no gap named"}`,
          `Difficulty: ${plan.difficulty}`,
          `Progress: ${plan.progress}`,
          `Goal: ${plan.goal}`,
          `Today's lesson: ${plan.nextLesson}`,
        ],
        evidence: [],
        next: [],
        note: "Personal teacher. Built from this record only. A later course was not invented.",
      });
      return;
    }
    const next = frame(raw);
    if (!next) return;
    setQ(raw);
    setOpen(true);
    setBusy(true);
    setErr("");
    try {
      setCard(await askStudy({ data: { question: next, teach } }));
      requestAnimationFrame(() => document.getElementById("study-paper")?.scrollIntoView({ block: "start" }));
    } catch {
      setCard(null);
      setErr("The library did not answer. Nothing was invented.");
    } finally {
      setBusy(false);
    }
  }

  const askRef = useRef(ask);
  askRef.current = ask;

  useEffect(() => {
    const onAsk = (ev: Event) => {
      const detail = (ev as CustomEvent<string>).detail;
      if (typeof detail === "string" && detail.trim()) void askRef.current(detail, /about|teach/i.test(detail));
    };
    window.addEventListener("study:ask", onAsk);
    return () => window.removeEventListener("study:ask", onAsk);
  }, []);

  if (path === "/noctis") return null;
  const hint =
    path === "/home"
      ? "What should I do on this journey today?"
      : path === "/hall" || path.startsWith("/study")
        ? "Teach the film I am looking at."
        : path.startsWith("/news")
          ? "Why does this story matter, and what should I study?"
          : path === "/reels"
            ? "What is this clip teaching?"
            : path.startsWith("/openings")
              ? "Which role does this prepare me for?"
              : path.startsWith("/market")
                ? "Which tool fits the goal I am on?"
                : "What should I look at next?";

  return (
    <>
      <div className={`fixed right-3 z-40 flex max-w-[16rem] flex-col items-end gap-2 ${path === "/reels" ? "bottom-[calc(1rem+env(safe-area-inset-bottom))]" : "bottom-[calc(4.6rem+env(safe-area-inset-bottom))]"}`}>
        <button
          type="button"
          onClick={() => void ask(hint)}
          className="rounded-2xl border border-[#e4b86a]/50 bg-surface/95 px-3 py-2 text-left shadow-float backdrop-blur-md"
        >
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Noctis recommendation</span>
          <span className="mt-0.5 block text-xs font-semibold leading-snug">{hint}</span>
        </button>
        <button
          type="button"
          onClick={() => void ask(q.trim() || hint)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg shadow-float"
        >
          <Sparkles className="size-4" />
          Ask Noctis
        </button>
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-bg/70 p-3 sm:items-center" onClick={() => setOpen(false)}>
          <section
            className="max-h-[min(92dvh,52rem)] w-full max-w-2xl overflow-y-auto rounded-3xl bg-surface p-4 shadow-float"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">{tutor.label}</p>
                <h2 className="mt-1 font-display text-2xl font-semibold">Noctis tutors</h2>
                <p className="mt-1 text-sm text-muted">{tutor.voice}</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="grid size-11 place-items-center rounded-full bg-elevated">
                <X className="size-4" />
              </button>
            </div>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const area = subject?.label || tutor.label;
                void answerWithVibe(q.trim() || (subject ? topicOf(subject.ask) : tutor.starter), area);
              }}
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={subject ? `Ask Noctis about ${subject.label}` : `Ask the ${tutor.label}`}
                className="min-h-11 min-w-0 flex-1 rounded-full bg-elevated px-4 text-sm"
              />
              <button type="submit" className="min-h-11 rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg">
                {busy ? "…" : "Ask"}
              </button>
            </form>
            <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
              {TUTORS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTutorId(item.id);
                    setSubjectId("");
                  }}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${item.id === tutor.id ? "bg-primary text-primary-fg" : "bg-elevated"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">Noctis answers questions in {subject?.label || tutor.label}.</p>
            {tutor.id === "cyber" ? (
              <div className="mt-2 rounded-xl bg-elevated p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Cyber bench</p>
                <p className="mt-1 text-xs text-muted">Lessons only. There is no machine to attack and no shell.</p>
                <ul className="mt-2 space-y-1">
                  {CYBER_BENCH.map((item) => (
                    <li key={item.id} className="text-sm"><span className="font-semibold">{item.title}. </span>{item.line}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="mt-2 flex flex-col gap-1.5">
              {copilot ? copilot.modes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    setSubjectId(mode.id);
                    void answerWithVibe(topicOf(mode.ask), mode.label);
                  }}
                  className={`rounded-xl px-3 py-2 text-left text-sm font-semibold ${subject?.id === mode.id ? "bg-primary text-primary-fg" : "bg-elevated"}`}
                >
                  {mode.label}
                </button>
              )) : (
                <button type="button" onClick={() => void ask(tutor.starter)} className="rounded-xl bg-elevated px-3 py-2 text-left text-sm font-semibold">
                  {tutor.starter}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => void ask(q.trim() ? `Research this topic: ${q.trim()}` : `Research this topic: ${tutor.starter}`)}
              className="mt-2 min-h-11 rounded-full bg-elevated px-4 text-left text-sm font-semibold"
            >
              Research this topic
            </button>
            <button type="button" onClick={() => setLabsOpen((open) => !open)} className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              {labsOpen ? "Hide research lab" : "Research lab"}
            </button>
            {labsOpen ? (
            <>
            <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
              {RESEARCH_LABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLabId(item.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${item.id === lab.id ? "bg-primary text-primary-fg" : "bg-elevated"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-col gap-1.5">
              {lab.prompts.map((prompt) => (
                <button key={prompt.label} type="button" onClick={() => void ask(prompt.q)} className="rounded-xl bg-elevated px-3 py-2 text-left text-sm font-semibold">
                  {prompt.label}
                </button>
              ))}
            </div>
            </>
            ) : null}
            {err ? <p className="mt-4 text-sm text-live">{err}</p> : null}
            {vibe ? (
              <article className="mt-4 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Noctis · {subject?.label || tutor.label}</p>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{vibe}</div>
              </article>
            ) : null}
            {card ? (
              <article className="mt-4 space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                  {/white paper is two pages/i.test(card.note)
                    ? "White paper"
                    : /sermon was written|sermon is at least two pages/i.test(card.note)
                      ? "Sermon"
                      : CONFIDENCE[card.confidence]}
                </p>
                {/sermon was written|sermon is at least two pages|white paper is two pages/i.test(card.note) ? null : (
                  <h3 className="font-display text-xl font-semibold leading-snug">{card.sentence}</h3>
                )}
                {/white paper is two pages/i.test(card.note) ? (
                  <PaperPage steps={card.steps} lede={card.sentence} source={card.evidence[0]?.source || ""} />
                ) : /sermon was written|sermon is at least two pages/i.test(card.note) ? (
                  <SermonPage steps={card.steps} verse={card.sentence} />
                ) : (
                  <ol className="space-y-1 text-sm text-muted">
                    {card.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                )}
                <dl className="grid gap-2 rounded-2xl bg-elevated p-3 text-sm">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Sources</dt>
                    <dd className="mt-1">{card.evidence.length ? card.evidence.map((row) => row.source).join(" · ") : "None retrieved"}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Evidence</dt>
                    <dd className="mt-1 text-muted">{card.evidence.find((row) => row.passage)?.passage?.slice(0, 320) || card.sentence}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Related documents</dt>
                    <dd className="mt-1">{card.next.length ? card.next.join(" · ") : "None retrieved"}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Last verified</dt>
                    <dd className="mt-1">{new Date().toISOString().slice(0, 10)}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Confidence</dt>
                    <dd className="mt-1">{CONFIDENCE[card.confidence].replace("Evidence strength: ", "")}</dd>
                  </div>
                </dl>
                  {card.evidence.map((row) => (
                    <a key={`${row.source}-${row.href}`} href={row.href} target="_blank" rel="noreferrer" className="block rounded-2xl bg-wash-ember p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">{row.source}</p>
                      <p className="mt-1 text-xs text-muted">{evidenceRank(row)} · {row.type} · {row.relevance}</p>
                      {row.passage ? <p className="mt-2 text-sm leading-snug">{row.passage}</p> : null}
                    </a>
                  ))}
                {card.next.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {card.next.map((item) => (
                      <button key={item} type="button" onClick={() => void ask(`Teach me the book of ${item}`, true)} className="rounded-full bg-elevated px-3 py-1.5 text-xs font-semibold">
                        {item}
                      </button>
                    ))}
                  </div>
                ) : null}
                <p className="text-xs text-subtle">{card.note}</p>
                {/study note is written/i.test(card.note) ? null : (
                  <button
                    type="button"
                    onClick={() => {
                      const subject = card.question
                        .replace(/^research this(?: topic)?:\s*/i, "")
                        .replace(/^.*?white paper(?:\s+on|\s+about|\s+from)?\s*/i, "")
                        .trim() || card.sentence.slice(0, 180);
                      void ask(
                        card.domain === "bible"
                          ? `Write a study note on ${subject}. Use only stored verses. If none were stored, say so. Do not write a sermon.`
                          : `Write a study note on ${subject}. Use only what was retrieved. Do not invent a source.`,
                      );
                    }}
                    disabled={busy}
                    className="min-h-11 rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg disabled:opacity-60"
                  >
                    {busy ? "Writing the note" : "Write a study note"}
                  </button>
                )}
              </article>
            ) : null}
          </section>
        </div>
      ) : null}
    </>
  );
}
