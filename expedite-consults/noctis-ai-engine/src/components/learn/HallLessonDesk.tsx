import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { HallCard } from "@/lib/hall";
import { HALL_CARDS, TICKET_FACE } from "@/lib/hall";
import { studyLesson } from "@/lib/study-this";
import { useFeedStore } from "@/lib/feed-store";
import { GOALS, levelFromXp } from "@/lib/learn";
import { CERT_TRACKS } from "@/lib/cert-academy";
import {
  addHours,
  lessonStatus,
  raiseDna,
  readLesson,
  saveLesson,
  strandsFor,
  type HallLessonRecord,
  type HallPost,
} from "@/lib/hall-record";
import { markMission } from "@/lib/noctis-os";
import { knowledgeAsset } from "@/lib/knowledge-asset";
import { layBlocks } from "@/lib/plain-meaning";
import { KnowledgeActions } from "@/components/learn/KnowledgeActions";
import { LessonHead } from "@/components/learn/StudyThisPanel";
import { loadVideoLesson } from "@/lib/video-mind-api";
import type { VideoLesson } from "@/lib/video-mind";
import { youtubeIdOf, youtubePoster } from "@/lib/youtube";
import { cn } from "@/lib/utils";

function questionsFor(card: HallCard, count: number) {
  const face = TICKET_FACE[card.ticket];
  const lesson = studyLesson(card.post, []);
  const right = card.post.teach.options.find((option) => option.ok)?.label ?? card.post.teach.hook;
  const bank = [
    { ask: card.post.teach.prompt, choices: card.post.teach.options.map((option) => option.label), answer: Math.max(0, card.post.teach.options.findIndex((option) => option.ok)) },
    { ask: "What should this lesson leave you able to do?", choices: [card.post.teach.hook, "Skip the idea and remember only the title", "Treat the caption as optional"], answer: 0 },
    { ask: "Which career track is this lesson for?", choices: [face?.career ?? "This trade", "No trade", "A different hall"], answer: 0 },
    { ask: "Which line is the lesson summary?", choices: [lesson.summary, "A headline with no claim", "Whatever was trending"], answer: 0 },
    { ask: "What is a key concept in this lesson?", choices: [lesson.concepts[0] ?? card.post.teach.stamp, "The channel name only", "An unrelated stamp"], answer: 0 },
    { ask: "What is the skill on this card?", choices: [face?.skill ?? right, "Memorizing the thumbnail", "Ignoring the drill"], answer: 0 },
  ];
  const rows = [];
  for (let i = 0; i < count; i += 1) rows.push(bank[i % bank.length]!);
  return rows;
}

function readReady(ticket: string) {
  try {
    const raw = JSON.parse(localStorage.getItem("vibetok-hall-ready") || "{}") as Record<string, number>;
    return raw[ticket] ?? 0;
  } catch {
    return 0;
  }
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

export function HallLessonDesk({ card }: { card: HallCard }) {
  const posts = useFeedStore((s) => s.posts);
  const completeDrill = useFeedStore((s) => s.completeDrill);
  const awardXp = useFeedStore((s) => s.awardXp);
  const openModal = useFeedStore((s) => s.openModal);
  const goal = useFeedStore((s) => s.goal);
  const xp = useFeedStore((s) => s.xp);
  const lesson = studyLesson(card.post, posts);
  const blocks = layBlocks(card.post);
  const said = blocks.find((block) => block.label === "Said simply")?.text.trim() || card.title;
  const keep = (blocks.find((block) => block.label === "Keep this")?.text || "").replace(/^Keep this:\s*/i, "").trim();
  const takeaway = keep && !said.toLowerCase().includes(keep.toLowerCase()) ? keep : "";
  const hook = card.post.teach.hook.trim();
  const prompt = card.post.teach.prompt.trim();
  const already = [said, takeaway, card.title].map((line) => line.toLowerCase());
  const covered = (line: string) => already.some((item) => item.includes(line.toLowerCase()) || line.toLowerCase().includes(item));
  const showHook = hook.length > 0 && !covered(hook);
  const showPrompt = prompt.length > 0 && prompt.toLowerCase() !== hook.toLowerCase() && !covered(prompt);
  const right = card.post.teach.options.find((option) => option.ok)?.label ?? "";
  const summary = said && said.toLowerCase() !== right.toLowerCase() && !card.title.toLowerCase().includes(said.toLowerCase()) ? said : "";
  const concepts = lesson.concepts.filter((line) => !/^(shop|ticket|clinic|hall)$/i.test(line.trim()));
  const terms = lesson.definitions.filter((row) => row.term.trim().length < 28 && !said.toLowerCase().includes(row.says.trim().toLowerCase()));
  const face = TICKET_FACE[card.ticket];
  const goalLabel = GOALS.find((item) => item.id === goal)?.label ?? "Set a goal";
  const lvl = levelFromXp(xp);
  const dna = strandsFor(card.ticket, `${card.title} ${card.post.teach.hook} ${card.post.caption}`);
  const cert = certFor(card);
  const next = HALL_CARDS.find((row) => row.ticket === card.ticket && row.id !== card.id) ?? HALL_CARDS.find((row) => row.id !== card.id) ?? null;
  const ready = readReady(card.ticket);
  const [record, setRecord] = useState<HallLessonRecord>(() => readLesson(card.id));
  const [size, setSize] = useState<5 | 10 | 20>(5);
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const quiz = useMemo(() => questionsFor(card, size), [card, size]);

  useEffect(() => {
    const nextRecord = saveLesson(card.id, { progress: Math.max(readLesson(card.id).progress, 15) });
    setRecord(nextRecord);
    addHours(0.2);
  }, [card.id]);

  function generateNotes() {
    const notes = {
      study: said,
      bullets: lesson.concepts.map((line) => `• ${line}`).join("\n"),
      revision: takeaway || said,
    };
    setRecord(saveLesson(card.id, { notes, progress: 55 }));
  }

  function exportNotes() {
    if (!record.notes) return;
    const body = `${card.title}\n\nStudy notes\n${record.notes.study}\n\nBullet summary\n${record.notes.bullets}\n\nRevision notes\n${record.notes.revision}\n`;
    const blob = new Blob([body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${card.id}-notes.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function grade() {
    let correct = 0;
    const weak: string[] = [];
    quiz.forEach((row, index) => {
      if (picks[index] === row.answer) correct += 1;
      else weak.push(row.ask);
    });
    const score = { correct, total: quiz.length, weak: weak.slice(0, 3), at: new Date().toISOString() };
    const passed = correct / quiz.length >= 0.6;
    setRecord(saveLesson(card.id, { score, progress: passed ? 100 : 70 }));
    awardXp(passed ? 25 : 5);
    if (passed) {
      completeDrill(card.post.id);
      raiseDna(strandsFor(card.ticket, `${card.title} ${card.post.caption}`));
      const mission = markMission("quiz");
      if (mission.rewarded) awardXp(50);
    }
  }

  function postNote() {
    const text = draft.trim();
    if (!text) return;
    const thread = record.thread.slice();
    if (replyTo) {
      const host = thread.find((row) => row.id === replyTo);
      if (host) host.replies = [...host.replies, { id: `${Date.now()}`, text }];
    } else {
      thread.unshift({ id: `${Date.now()}`, text, likes: 0, hidden: false, replies: [] });
    }
    setDraft("");
    setReplyTo(null);
    setRecord(saveLesson(card.id, { thread, progress: Math.max(record.progress, 40) }));
  }

  function patchPost(id: string, patch: Partial<HallPost>) {
    const thread = record.thread.map((row) => (row.id === id ? { ...row, ...patch } : row));
    setRecord(saveLesson(card.id, { thread }));
  }

  const [taught, setTaught] = useState<VideoLesson | null>(null);
  const yt = youtubeIdOf(card.post);
  const poster = card.posterUrl || card.post.posterUrl || (yt ? youtubePoster(yt) : "");
  const filmTitle = card.title || card.post.teach.hook;
  const intro = taught?.plain || [
    `This lesson is about ${filmTitle}.`,
    card.post.caption && card.post.caption !== filmTitle ? card.post.caption : `The subject is ${face?.career || card.post.teach.stamp}.`,
    summary ? summary : `You should leave able to use the idea, not only remember the title.`,
    `Read it once, then try the quiz on this page.`,
  ].filter(Boolean).join(" ");

  useEffect(() => {
    let stop = false;
    setTaught(null);
    void loadVideoLesson({
      data: { title: filmTitle, caption: card.post.caption, author: card.mentor, youtubeId: yt || "" },
    })
      .then((next) => {
        if (!stop && next && "plain" in next) setTaught(next);
      })
      .catch(() => undefined);
    return () => {
      stop = true;
    };
  }, [card.id, filmTitle, card.post.caption, card.mentor, yt]);

  return (
    <div className="mb-4 space-y-3 text-fg">
      <LessonHead
        title={filmTitle}
        subject={[taught?.subject || face?.career, taught?.difficulty || face?.level, card.post.teach.stamp].filter(Boolean).join(" · ")}
        intro={intro}
        poster={poster}
      />
      {taught?.points.length ? (
        <section className="rounded-2xl bg-elevated p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">The most important things to learn</p>
          <ol className="mt-2 list-decimal space-y-2 pl-4 text-sm">
            {taught.points.map((row) => <li key={row}>{row}</li>)}
          </ol>
        </section>
      ) : null}
      <section className="rounded-2xl bg-elevated p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Hall lesson</p>
        <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Current goal</dt>
            <dd className="mt-0.5 font-semibold">{goalLabel}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Current path</dt>
            <dd className="mt-0.5 font-semibold">{face?.path ?? "Not stored"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Journey progress</dt>
            <dd className="mt-0.5 font-semibold">{lvl.pct}%</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted">{face?.minutes ?? "Duration not stored"} · {face?.level ?? "Difficulty not stored"} · {face?.career ?? card.ticket}</p>
        <p className="mt-1 text-xs text-muted">Readiness: {ready ? `${face?.career ?? card.ticket} ${ready}%` : "Not counted yet."}</p>
        <p className="mt-1 text-xs text-muted">Source: {card.mentor || "Not stored"}</p>
        <p className="mt-2 text-xs font-semibold">{lessonStatus(record.progress)} · {record.progress}% complete</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
          <div className="h-full rounded-full bg-primary" style={{ width: `${record.progress}%` }} />
        </div>
      </section>

      <section className="rounded-2xl bg-elevated p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Vibe summary</p>
        {summary ? <p className="mt-2 text-sm leading-relaxed">{summary}</p> : <p className="mt-2 text-sm leading-relaxed">Use Ask Noctis. It walks the move, the study, the quiz, and the sources. The title is not repeated here.</p>}
        {concepts.length ? (
          <>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-subtle">Key concepts</p>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-sm">{concepts.slice(0, 4).map((line) => <li key={line}>{line}</li>)}</ul>
          </>
        ) : null}
        {takeaway ? (
          <>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-subtle">Key takeaway</p>
            <p className="mt-1 text-sm leading-relaxed">{takeaway}</p>
          </>
        ) : null}
        {terms.length ? (
          <>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-subtle">Important terms</p>
            <ul className="mt-1 space-y-1 text-sm">
              {terms.map((row) => (
                <li key={row.term}><span className="font-semibold">{row.term}.</span> {row.says}</li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      {showHook || face?.skill ? (
        <section className="rounded-2xl bg-elevated p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Learning outcome</p>
          {showHook ? <p className="mt-1 text-sm leading-relaxed">{hook}</p> : null}
          {face?.skill ? <p className="mt-1 text-sm">Skill: {face.skill}</p> : null}
        </section>
      ) : null}

      {showPrompt ? (
        <section className="rounded-2xl bg-elevated p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Check</p>
          <p className="mt-1 text-sm leading-relaxed">{prompt}</p>
        </section>
      ) : null}

      <section className="rounded-2xl border border-[#e4b86a]/40 bg-elevated p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Ask Noctis</p>
        <p className="mt-1 text-xs text-muted">The answer stays on this film: {card.title}</p>
        <div className="mt-2">
          <KnowledgeActions
            asset={knowledgeAsset({
              id: card.id,
              title: card.title,
              source: card.mentor,
              category: face?.career ?? card.ticket,
              summary: [said, takeaway].filter(Boolean).join(" "),
              insight: showHook ? hook : takeaway,
              why: showPrompt ? prompt : "",
            })}
          />
        </div>
      </section>

      <section className="rounded-2xl bg-elevated p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Notes</p>
          <button type="button" onClick={generateNotes} className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-fg">Generate notes</button>
        </div>
        {record.notes ? (
          <div className="mt-3 space-y-2 text-sm">
            <p className="font-semibold">Study notes</p>
            <p className="leading-relaxed">{record.notes.study}</p>
            <p className="whitespace-pre-wrap">{record.notes.bullets}</p>
            <p className="whitespace-pre-wrap text-muted">{record.notes.revision}</p>
            <button type="button" onClick={exportNotes} className="rounded-full bg-surface px-3 py-1.5 text-[11px] font-semibold">Export notes</button>
          </div>
        ) : <p className="mt-2 text-sm text-muted">Notes stay on this lesson and count toward your journey after you generate them.</p>}
      </section>

      <section className="rounded-2xl bg-elevated p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Quiz me</p>
        <div className="mt-2 flex gap-1.5">
          {([5, 10, 20] as const).map((count) => (
            <button key={count} type="button" onClick={() => { setSize(count); setPicks({}); }} className={cn("rounded-full px-3 py-1.5 text-[11px] font-semibold", size === count ? "bg-primary text-primary-fg" : "bg-surface")}>{count} questions</button>
          ))}
        </div>
        <ol className="mt-3 space-y-3">
          {quiz.map((row, index) => (
            <li key={`${row.ask}-${index}`}>
              <p className="text-sm font-semibold">{index + 1}. {row.ask}</p>
              <div className="mt-1 space-y-1">
                {row.choices.map((choice, choiceIndex) => (
                  <button key={choice} type="button" onClick={() => setPicks((cur) => ({ ...cur, [index]: choiceIndex }))} className={cn("block w-full rounded-xl px-3 py-2 text-left text-sm", picks[index] === choiceIndex ? "bg-primary text-primary-fg" : "bg-surface")}>{choice}</button>
                ))}
              </div>
            </li>
          ))}
        </ol>
        <button type="button" onClick={grade} className="mt-3 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-fg">Score quiz</button>
        {record.score ? (
          <div className="mt-3 text-sm">
            <p className="font-semibold">Score {record.score.correct} / {record.score.total}</p>
            <p className="mt-1">Correct {record.score.correct}. Incorrect {record.score.total - record.score.correct}.</p>
            {record.score.weak.length ? <p className="mt-1 text-muted">Weak areas: {record.score.weak.join(" · ")}</p> : <p className="mt-1 text-muted">No weak area on this pass.</p>}
            <p className="mt-1 text-xs text-muted">Saved to My Journey as marks and, if you passed, as a stamp.</p>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl bg-elevated p-4 text-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Career connections</p>
        <p className="mt-1 font-semibold">{face?.career}</p>
        <p className="mt-1 text-xs text-muted">Salary is not stored for this lesson.</p>
        <Link to="/openings" className="mt-2 inline-flex font-semibold text-primary">Open career</Link>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-subtle">Related certifications</p>
        <p className="mt-1">{cert ? cert.label : "None stored for this lesson."}</p>
        {cert ? <a href={cert.href} target="_blank" rel="noreferrer" className="mt-2 inline-flex font-semibold text-primary">Open the cert outline</a> : null}
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-subtle">Knowledge DNA</p>
        <p className="mt-1">{dna.map((name) => `${name} +1`).join(" · ")}. Recorded when you opened the lesson.</p>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-subtle">Journey impact</p>
        <p className="mt-1">Hours +0.2 on open. A passed quiz awards 25 marks. A missed quiz awards 5. Level progress {lvl.pct}%.</p>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-subtle">Path</p>
        <p className="mt-1">Path: {face?.path}</p>
        <Link to="/paths" className="mt-2 inline-flex font-semibold text-primary">Continue path</Link>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-subtle">Resources</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link to="/market" className="rounded-full bg-surface px-3 py-1.5 text-xs font-semibold">Tools</Link>
          <Link to="/study" search={{ desk: undefined, family: undefined, step: undefined }} className="rounded-full bg-surface px-3 py-1.5 text-xs font-semibold">Courses</Link>
          <Link to="/hub" className="rounded-full bg-surface px-3 py-1.5 text-xs font-semibold">Labs</Link>
        </div>
        <p className="mt-2 text-xs text-muted">Only desks that exist. No book is attached unless the lesson names one.</p>
      </section>

      <section className="rounded-2xl bg-elevated p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Discussion</p>
        <div className="mt-2 flex gap-2">
          <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={replyTo ? "Write a reply" : "Ask a question"} className="min-h-10 min-w-0 flex-1 rounded-full bg-surface px-3 text-sm" />
          <button type="button" onClick={postNote} className="rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg">{replyTo ? "Reply" : "Post"}</button>
        </div>
        <ul className="mt-3 space-y-2">
          {record.thread.filter((row) => !row.hidden).map((row) => (
            <li key={row.id} className="rounded-xl bg-surface px-3 py-2 text-sm">
              <p>{row.text}</p>
              <div className="mt-1 flex gap-2 text-[11px] font-semibold text-muted">
                <button type="button" onClick={() => patchPost(row.id, { likes: row.likes + 1 })}>Like {row.likes}</button>
                <button type="button" onClick={() => setReplyTo(row.id)}>Reply</button>
                <button type="button" onClick={() => patchPost(row.id, { hidden: true })}>Report</button>
              </div>
              {row.replies.map((reply) => <p key={reply.id} className="mt-1 pl-3 text-muted">{reply.text}</p>)}
            </li>
          ))}
        </ul>
      </section>

      {next ? (
        <section className="rounded-2xl bg-elevated p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Next recommended lesson</p>
          <p className="mt-1 text-sm font-semibold">{next.title}</p>
          <button type="button" onClick={() => openModal({ type: "hall-drill", ticket: next.ticket, cardId: next.id })} className="mt-2 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-fg">Open next</button>
        </section>
      ) : null}
    </div>
  );
}
