import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { YoutubeFrame } from "@/components/feed/YoutubeFrame";
import { useFeedStore } from "@/lib/feed-store";
import { SOURCE } from "@/lib/source";
import { cn } from "@/lib/utils";

type RoomId = "kids" | "women";
type Band = "5-7" | "8-10" | "11-13" | "14-17";

type KidsLesson = {
  id: string;
  shelf: string;
  title: string;
  house: string;
  learn: string;
  ask: string;
  answer: string;
  bands: Band[];
  youtubeId?: string;
};

const BANDS: Band[] = ["5-7", "8-10", "11-13", "14-17"];
const GUARD_KEY = "vibetok-kids-guard";

const KIDS: KidsLesson[] = [
  { id: "early", shelf: "Early learning", title: "The letter A", house: "Khan Academy Kids", learn: "A letter has a name and a sound. A is the first letter.", ask: "What is the first letter?", answer: "A", bands: ["5-7", "8-10"], youtubeId: "0MF9QOCrddQ" },
  { id: "read", shelf: "Reading & writing", title: "How words are built", house: "Kids Academy", learn: "Letters stand for sounds. Sounds join into a word you can say.", ask: "What do letters stand for?", answer: "Sounds.", bands: ["5-7", "8-10", "11-13"], youtubeId: "izqfrq_vpv4" },
  { id: "math", shelf: "Mathematics", title: "Put groups together", house: "Kids hall", learn: "Addition means putting two groups into one group and counting them all.", ask: "What is 3 + 4?", answer: "7", bands: ["5-7", "8-10", "11-13", "14-17"] },
  { id: "science", shelf: "Science & nature", title: "How a seed becomes a plant", house: "SciShow Kids", learn: "A seed needs water, warmth, and light. The root grows down. The shoot grows up.", ask: "What grows down first?", answer: "The root.", bands: ["5-7", "8-10", "11-13", "14-17"], youtubeId: "tkFPyue5X3Q" },
  { id: "code", shelf: "Coding & technology", title: "A computer follows steps", house: "Kids hall", learn: "A program is a list of steps in order. If a step is missing, the result changes.", ask: "What is a program?", answer: "A list of steps in order.", bands: ["8-10", "11-13", "14-17"] },
  { id: "build", shelf: "Engineering & building", title: "How a rocket leaves the ground", house: "NASA Space Place", learn: "A rocket pushes hard enough to lift off and reach space.", ask: "What carries tools into space?", answer: "A rocket.", bands: ["8-10", "11-13", "14-17"], youtubeId: "o2FFtPPM3iY" },
  { id: "space", shelf: "Science & nature", title: "Our solar neighborhood", house: "NASA", learn: "One star, the Sun, plus planets, asteroids, and comets.", ask: "What is the star called?", answer: "The Sun.", bands: ["11-13", "14-17"], youtubeId: "s9L_JvEvvCY" },
  { id: "arts", shelf: "Arts & creativity", title: "Draw the plant", house: "Kids hall", learn: "Draw a seed, a root going down, and a shoot going up. Label each part.", ask: "Which part grows up?", answer: "The shoot.", bands: ["5-7", "8-10", "11-13"] },
  { id: "faith", shelf: "Bible & faith", title: "A short kindness lesson", house: "Kids hall", learn: "A simple reading: be kind, tell the truth, and ask a grown-up when you do not understand.", ask: "Who do you ask when a lesson is confusing?", answer: "A grown-up.", bands: ["5-7", "8-10", "11-13", "14-17"] },
  { id: "life", shelf: "Life skills", title: "Your name stays private", house: "Kids hall", learn: "Do not type your full name, school, or home address into a chat. Ask a grown-up first.", ask: "Should you post your home address?", answer: "No.", bands: ["5-7", "8-10", "11-13", "14-17"] },
  { id: "money", shelf: "Financial literacy", title: "Save a coin", house: "Kids hall", learn: "Money you do not spend today is still yours tomorrow. That is saving.", ask: "What is saving?", answer: "Keeping money for later.", bands: ["8-10", "11-13", "14-17"] },
  { id: "career", shelf: "Career exploration", title: "What a scientist does", house: "Kids hall", learn: "A scientist asks a question, tests it, and writes down what happened. The job comes after years of study.", ask: "What does a scientist do first?", answer: "Asks a question.", bands: ["11-13", "14-17"] },
];

const WOMEN = [
  { id: "cyber", title: "Cybersecurity", steps: ["Basics", "Networks", "Ethical testing", "Forensics", "Cloud", "Careers", "Certifications"], to: "/study" as const, search: { desk: "path" }, note: "Open the cyber path already on Study." },
  { id: "eng", title: "Engineering", steps: ["Civil", "Mechanical", "Electrical", "Aerospace", "Robotics", "Software", "Careers"], to: "/study" as const, search: { desk: "eng" }, note: "Open the engineering desk." },
  { id: "stem", title: "STEM & research", steps: ["The missing names", "The counted gap", "A next paper", "A lab", "A mentor"], youtubeId: "386kmzBH4Co", note: "Women in science, told with the record, not a slogan." },
  { id: "science", title: "Science", steps: ["Question", "Method", "Evidence", "Paper", "Replication"], to: "/study" as const, search: { desk: "sci" }, note: "Open the science path." },
  { id: "business", title: "Business & entrepreneurship", steps: ["Problem", "Customer", "Offer", "Price", "First sale"], note: "A business starts with a person who needs something, not with a logo." },
  { id: "money", title: "Financial literacy", steps: ["Income", "Spending", "Saving", "Debt", "A plan"], note: "Know what comes in, what goes out, and what is left." },
  { id: "lead", title: "Leadership", steps: ["Listen", "Decide", "Explain", "Review"], note: "Leadership is a practice, not a title." },
  { id: "digital", title: "Digital skills", steps: ["Files", "Search", "Privacy", "A safe password"], note: "A long private password beats a short shared one." },
  { id: "edu", title: "Education", steps: ["A goal", "A course", "Practice", "A check", "The next course"], to: "/openings" as const, note: "Career Navigator holds the longer road." },
  { id: "career", title: "Career development", steps: ["Role", "Skills", "Proof", "Application"], to: "/openings" as const, note: "Match a role to the skills you can show." },
];

const STAGES = ["Learn", "Practice", "Connect", "Build", "Mentor"] as const;

function readGuard(): { band: Band; cap: number; pin: string } {
  try {
    const raw = JSON.parse(localStorage.getItem(GUARD_KEY) || "{}") as { band?: Band; cap?: number; pin?: string };
    return {
      band: BANDS.includes(raw.band as Band) ? (raw.band as Band) : "8-10",
      cap: raw.cap === 2 || raw.cap === 3 || raw.cap === 5 ? raw.cap : 3,
      pin: typeof raw.pin === "string" ? raw.pin : "",
    };
  } catch {
    return { band: "8-10", cap: 3, pin: "" };
  }
}

export function CircleDesk() {
  const [room, setRoom] = useState<RoomId>("kids");
  const [guard, setGuard] = useState(readGuard);
  const [pinTry, setPinTry] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [parent, setParent] = useState(false);
  const [shelf, setShelf] = useState("Science & nature");
  const [lessonId, setLessonId] = useState("science");
  const [seen, setSeen] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [report, setReport] = useState("");
  const [sent, setSent] = useState(false);
  const [pathId, setPathId] = useState("cyber");
  const [stage, setStage] = useState<(typeof STAGES)[number]>("Learn");
  const isMuted = useFeedStore((s) => s.isMuted);
  const unlockSound = useFeedStore((s) => s.unlockSound);
  const toggleMute = useFeedStore((s) => s.toggleMute);
  const setPlayingId = useFeedStore((s) => s.setPlayingId);

  useEffect(() => {
    localStorage.setItem(GUARD_KEY, JSON.stringify(guard));
  }, [guard]);

  const allowed = KIDS.filter((item) => item.bands.includes(guard.band));
  const shelves = [...new Set(allowed.map((item) => item.shelf))];
  const onShelf = allowed.filter((item) => item.shelf === shelf);
  const lesson = allowed.find((item) => item.id === lessonId) ?? onShelf[0] ?? allowed[0];
  const paused = seen >= guard.cap;
  const locked = Boolean(guard.pin) && !unlocked;
  const path = WOMEN.find((item) => item.id === pathId) ?? WOMEN[0]!;
  const young = guard.band === "5-7" || guard.band === "8-10";

  function saveBand(band: Band) {
    if (locked) return;
    setGuard({ ...guard, band });
    const next = KIDS.find((item) => item.bands.includes(band));
    if (next) {
      setShelf(next.shelf);
      setLessonId(next.id);
    }
  }

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => { setRoom("kids"); setPlayingId(null); }} className={cn("min-h-16 rounded-2xl px-3 text-left", room === "kids" ? "bg-primary text-primary-fg" : "bg-surface shadow-border")}>
          <span className="block text-sm font-semibold">Kids hall</span>
          <span className={cn("mt-0.5 block text-xs", room === "kids" ? "text-primary-fg/80" : "text-muted")}>Safety, short lessons, a stop.</span>
        </button>
        <button type="button" onClick={() => { setRoom("women"); setPlayingId(null); }} className={cn("min-h-16 rounded-2xl px-3 text-left", room === "women" ? "bg-primary text-primary-fg" : "bg-surface shadow-border")}>
          <span className="block text-sm font-semibold">Women</span>
          <span className={cn("mt-0.5 block text-xs", room === "women" ? "text-primary-fg/80" : "text-muted")}>Learn, practice, connect, build, mentor.</span>
        </button>
      </div>

      {room === "kids" ? (
        <>
          <div className="rounded-2xl bg-surface px-4 py-4 shadow-border">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Kids · {SOURCE}</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">One lesson. Then a stop.</h2>
            <p className="mt-1 text-sm text-muted">Chat is off in this hall. Nothing here is an ad. A grown-up sets the age.</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {BANDS.map((band) => (
                <button key={band} type="button" onClick={() => saveBand(band)} className={cn("min-h-11 rounded-full px-3 text-xs font-semibold", guard.band === band ? "bg-primary text-primary-fg" : "bg-elevated text-muted")}>
                  Ages {band}
                </button>
              ))}
              <button type="button" onClick={() => setParent((v) => !v)} className="min-h-11 rounded-full bg-elevated px-3 text-xs font-semibold">
                Grown-up
              </button>
            </div>
            {locked ? <p className="mt-2 text-xs text-muted">The age is locked. A grown-up can open it below.</p> : null}
            {young ? <p className="mt-2 text-xs text-muted">Messages stay off for ages {guard.band}. Recommendations stop after {guard.cap} lessons.</p> : null}
          </div>

          {parent ? (
            <div className="space-y-2 rounded-2xl bg-surface p-4 shadow-border">
              <p className="text-sm font-semibold">Grown-up controls</p>
              <p className="text-xs text-muted">This lock stays on this device. It is not a full child-privacy program. Have a lawyer review COPPA and your state rules before children use a public account.</p>
              <label className="block text-xs font-semibold text-muted">
                Lessons before a break
                <select value={guard.cap} onChange={(e) => !locked && setGuard({ ...guard, cap: Number(e.target.value) })} className="mt-1 w-full rounded-xl bg-elevated px-3 py-2 text-sm text-fg">
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                </select>
              </label>
              <label className="block text-xs font-semibold text-muted">
                {guard.pin ? "Enter the lock to change the age" : "Set a 4-digit lock"}
                <input value={pinTry} onChange={(e) => setPinTry(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" className="mt-1 w-full rounded-xl bg-elevated px-3 py-2 text-sm text-fg" />
              </label>
              <div className="flex flex-wrap gap-2">
                {!guard.pin ? (
                  <button type="button" onClick={() => { if (pinTry.length === 4) { setGuard({ ...guard, pin: pinTry }); setPinTry(""); setUnlocked(true); } }} className="min-h-11 rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg">Save lock</button>
                ) : (
                  <button type="button" onClick={() => { if (pinTry === guard.pin) { setUnlocked(true); setPinTry(""); } }} className="min-h-11 rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg">Unlock</button>
                )}
                {unlocked && guard.pin ? (
                  <button type="button" onClick={() => { setGuard({ ...guard, pin: "" }); setUnlocked(false); }} className="min-h-11 rounded-full bg-elevated px-3 text-xs font-semibold">Remove lock</button>
                ) : null}
              </div>
              <label className="block text-xs font-semibold text-muted">
                Report something that should not be here
                <textarea value={report} onChange={(e) => setReport(e.target.value)} rows={2} className="mt-1 w-full rounded-xl bg-elevated px-3 py-2 text-sm font-normal text-fg" />
              </label>
              <button type="button" onClick={() => { if (!report.trim()) return; const prev = JSON.parse(localStorage.getItem("vibetok-kids-reports") || "[]") as string[]; localStorage.setItem("vibetok-kids-reports", JSON.stringify([report.trim(), ...prev].slice(0, 20))); setReport(""); setSent(true); }} className="min-h-11 rounded-full bg-elevated px-3 text-xs font-semibold">
                Save report on this device
              </button>
              {sent ? <p className="text-xs text-muted">Saved on this device for a grown-up. It was not posted to the hall.</p> : null}
            </div>
          ) : null}

          <div className="flex gap-1.5 overflow-x-auto">
            {shelves.map((name) => (
              <button key={name} type="button" onClick={() => { setShelf(name); const first = allowed.find((item) => item.shelf === name); if (first) { setLessonId(first.id); setReveal(false); } }} className={cn("min-h-11 shrink-0 rounded-full px-3 text-xs font-semibold", shelf === name ? "bg-primary text-primary-fg" : "bg-surface text-muted")}>
                {name}
              </button>
            ))}
          </div>

          {paused ? (
            <div className="rounded-2xl bg-surface p-5 shadow-border">
              <p className="font-display text-xl font-semibold">Time for a break.</p>
              <p className="mt-1 text-sm text-muted">You finished {guard.cap} lessons. The hall stops on purpose. A grown-up can raise the number.</p>
              <button type="button" onClick={() => setSeen(0)} className="mt-3 min-h-11 rounded-full bg-elevated px-3 text-xs font-semibold">Start a new sitting</button>
            </div>
          ) : lesson ? (
            <article className="overflow-hidden rounded-2xl bg-surface shadow-border">
              {lesson.youtubeId ? (
                <YoutubeFrame
                  postId={`kids-${lesson.id}`}
                  youtubeId={lesson.youtubeId}
                  playing
                  muted={isMuted}
                  onToggle={() => { unlockSound(); toggleMute(`kids-${lesson.id}`); setPlayingId(`kids-${lesson.id}`); }}
                  onEnded={() => setSeen((n) => n + 1)}
                />
              ) : (
                <div className="bg-elevated px-4 py-8">
                  <p className="font-display text-2xl font-semibold">{lesson.title}</p>
                </div>
              )}
              <div className="space-y-2 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{lesson.shelf} · {lesson.house}</p>
                <h3 className="font-display text-2xl font-semibold">{lesson.title}</h3>
                <p className="text-base leading-relaxed">{lesson.learn}</p>
                <p className="text-sm font-semibold">{lesson.ask}</p>
                <button type="button" onClick={() => setReveal((v) => !v)} className="min-h-11 rounded-full bg-elevated px-3 text-xs font-semibold">{reveal ? "Hide answer" : "Show answer"}</button>
                {reveal ? <p className="text-sm">{lesson.answer}</p> : null}
                <p className="text-xs text-muted">Lesson {Math.min(seen + 1, guard.cap)} of {guard.cap} this sitting. The next film does not start by itself.</p>
              </div>
            </article>
          ) : null}

          <ul className="space-y-2">
            {(onShelf.length ? onShelf : allowed).map((item) => (
              <li key={item.id}>
                <button type="button" disabled={paused} onClick={() => { setLessonId(item.id); setShelf(item.shelf); setReveal(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={cn("flex w-full rounded-2xl px-4 py-3 text-left shadow-border", item.id === lesson?.id ? "bg-primary text-primary-fg" : "bg-surface")}>
                  <span>
                    <span className="block text-sm font-semibold">{item.title}</span>
                    <span className={cn("block text-xs", item.id === lesson?.id ? "text-primary-fg/80" : "text-muted")}>{item.shelf}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-surface px-4 py-3 text-xs text-muted shadow-border">
            Path for this age: {guard.band === "5-7" ? "Letters → sounds → a plant → kindness." : guard.band === "8-10" ? "Reading → numbers → nature → how things are built." : "Science → space → how a job in science starts."}
          </p>
        </>
      ) : (
        <>
          <div className="rounded-2xl bg-surface px-4 py-4 shadow-border">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Women · {SOURCE}</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">Knowledge and the work that follows.</h2>
            <p className="mt-1 text-sm text-muted">This is not the kids hall. Learn the subject, practice it, meet the field, build a piece of work, then mentor.</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {STAGES.map((name) => (
                <button key={name} type="button" onClick={() => setStage(name)} className={cn("min-h-11 rounded-full px-3 text-xs font-semibold", stage === name ? "bg-primary text-primary-fg" : "bg-elevated text-muted")}>
                  {name}
                </button>
              ))}
            </div>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {WOMEN.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => setPathId(item.id)} className={cn("h-full w-full rounded-2xl px-4 py-3 text-left shadow-border", item.id === path.id ? "bg-primary text-primary-fg" : "bg-surface")}>
                  <span className="block text-sm font-semibold">{item.title}</span>
                  <span className={cn("mt-1 block text-xs", item.id === path.id ? "text-primary-fg/80" : "text-muted")}>{item.steps.slice(0, 3).join(" → ")}</span>
                </button>
              </li>
            ))}
          </ul>
          <article className="space-y-3 rounded-2xl bg-surface p-4 shadow-border">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{stage}</p>
            <h3 className="font-display text-xl font-semibold">{path.title}</h3>
            <ol className="space-y-1 text-sm">
              {path.steps.map((step, index) => (
                <li key={step}>{index + 1}. {step}</li>
              ))}
            </ol>
            <p className="text-sm text-muted">{path.note}</p>
            {"youtubeId" in path && path.youtubeId ? (
              <YoutubeFrame postId={`women-${path.id}`} youtubeId={path.youtubeId} playing muted={isMuted} onToggle={() => { unlockSound(); toggleMute(`women-${path.id}`); }} />
            ) : null}
            {"to" in path && path.to ? (
              <Link to={path.to} search={"search" in path ? path.search : undefined} className="inline-flex min-h-11 items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg">
                Open this path
              </Link>
            ) : null}
            {stage === "Mentor" ? (
              <p className="text-sm">A mentor profile will hold lessons, answers, and projects from a verified professional. No sample person is shown here as if they had signed in.</p>
            ) : null}
            {stage === "Connect" ? <p className="text-sm">Use Study groups for people on the same path. Do not use the kids hall for this.</p> : null}
            {stage === "Build" ? <p className="text-sm">A finished path should leave a piece of work: a lab note, a short paper, or a project you can show.</p> : null}
          </article>
        </>
      )}
    </section>
  );
}
