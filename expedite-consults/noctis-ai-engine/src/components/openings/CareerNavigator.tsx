import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CAREERS,
  CAREER_TREES,
  EDUCATIONS,
  EMPTY_PROFILE,
  INCOMES,
  INTERESTS,
  STYLES,
  advise,
  careerById,
  gapFor,
  money,
  recommend,
  type CareerProfile,
  type Education,
  type Income,
  type Interest,
  type TreeNode,
  type WorkStyle,
} from "@/lib/career-nav";
import { scanCareer, type CareerScan } from "@/lib/career-copilot-api";
import { OpeningsDesk } from "@/components/openings/OpeningsDesk";
import { GrowDesk } from "@/components/openings/GrowDesk";
import { RESUME_CLINIC } from "@/lib/openings";
import { cn } from "@/lib/utils";
import { useFeedStore } from "@/lib/feed-store";
import { GOALS } from "@/lib/learn";
import { readDna } from "@/lib/hall-record";
import { LEARN_PATHS } from "@/lib/today-learned";
import { PATH_FIT, fitFor, readinessFor, strandHits } from "@/lib/career-fit";
import { CareerDetail } from "@/components/openings/CareerDetail";

const KEY = "vibetok-career-nav";
const SECTIONS = [
  { id: "discover", label: "Discover" },
  { id: "assess", label: "Assessment" },
  { id: "roadmap", label: "Roadmap" },
  { id: "gap", label: "Gap" },
  { id: "mentor", label: "Ask Noctis" },
  { id: "tree", label: "Tree" },
  { id: "seats", label: "Seats" },
  { id: "grow", label: "Grow" },
] as const;

type Section = (typeof SECTIONS)[number]["id"];

export function CareerNavigator() {
  const [profile, setProfile] = useState<CareerProfile>(EMPTY_PROFILE);
  const [section, setSection] = useState<Section>("discover");
  const [grow, setGrow] = useState<"Road" | "Certs" | "Coach">("Road");
  const [step, setStep] = useState(0);
  const [ask, setAsk] = useState("");
  const [brief, setBrief] = useState<CareerScan | null>(null);
  const [scanning, setScanning] = useState(false);
  const [dna, setDna] = useState<Record<string, number>>({});
  const [pathId, setPathId] = useState("");
  const goal = useFeedStore((s) => s.goal);
  const goalLabel = GOALS.find((item) => item.id === goal)?.label ?? "Not set";

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setProfile({ ...EMPTY_PROFILE, ...(JSON.parse(raw) as CareerProfile) });
      setDna(readDna());
      setPathId(localStorage.getItem("vibetok-path-current") || "");
    } catch {
      /* fresh profile */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(profile));
  }, [profile]);

  const picks = useMemo(() => recommend(profile), [profile]);
  const career = careerById(profile.careerId);
  const ready = profile.interests.length > 0 && profile.styles.length > 0 && profile.education && profile.income;
  const pathTitle = LEARN_PATHS.find((item) => item.id === pathId)?.title ?? "";
  const forYou = CAREERS.filter((item) => (pathId && PATH_FIT[pathId]?.includes(item.id)) || strandHits(item, dna).length > 0).slice(0, 3);

  function choose(id: string) {
    setProfile((cur) => ({ ...cur, careerId: id }));
    setSection("roadmap");
  }

  function toggleStage(id: string) {
    setProfile((cur) => ({
      ...cur,
      done: cur.done.includes(id) ? cur.done.filter((item) => item !== id) : [...cur.done, id],
    }));
  }

  return (
    <div className="space-y-4">
      <header className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Career Navigator</p>
        <h1 className="mt-1 font-display text-2xl font-semibold">What should you pursue, and what is the next step?</h1>
        <p className="mt-2 text-sm text-muted">
          Recommended from your goal, your path, and your Knowledge DNA. A match is shown only when one of those already lines up.
        </p>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Goal</dt>
            <dd className="font-semibold">{goalLabel}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Path</dt>
            <dd className="font-semibold">{pathTitle || "None started"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">For you</dt>
            <dd className="font-semibold">{forYou.length ? forYou.map((item) => item.name).join(" · ") : "No career matches yet."}</dd>
          </div>
        </dl>
      </header>

      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        <Link to="/" className="shrink-0 rounded-2xl bg-surface px-3 py-3 text-sm font-semibold shadow-border">Videos</Link>
        <button type="button" onClick={() => { setGrow("Road"); setSection("grow"); }} className="shrink-0 rounded-2xl bg-surface px-3 py-3 text-left text-sm font-semibold shadow-border">Career paths</button>
        <button type="button" onClick={() => { setGrow("Certs"); setSection("grow"); }} className="shrink-0 rounded-2xl bg-surface px-3 py-3 text-left text-sm font-semibold shadow-border">Certifications</button>
        <button type="button" onClick={() => setSection("seats")} className="shrink-0 rounded-2xl bg-surface px-3 py-3 text-left text-sm font-semibold shadow-border">Opportunities</button>
        <button type="button" onClick={() => { setGrow("Coach"); setSection("grow"); }} className="shrink-0 rounded-2xl bg-surface px-3 py-3 text-left text-sm font-semibold shadow-border">Career coach</button>
      </div>
      <Link to="/hub/fleet" className="block rounded-2xl bg-surface p-4 shadow-border">
        <p className="text-sm font-semibold">Want to try the work before you choose?</p>
        <p className="mt-1 text-sm text-muted">Open a course in security, software, research, or the cloud.</p>
      </Link>

      <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSection(item.id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-2 text-xs font-semibold",
              section === item.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {section === "grow" ? <GrowDesk open={grow} /> : null}

      {section === "discover" ? (
        <section className="space-y-2">
          <div className="rounded-2xl bg-surface p-4 shadow-border">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Career coach</p>
            <textarea
              value={ask}
              onChange={(event) => setAsk(event.target.value)}
              rows={2}
              placeholder="Can I become this, and what is the next stored stage?"
              className="mt-3 w-full rounded-xl bg-elevated px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={scanning}
              onClick={() => {
                setSection("mentor");
                setScanning(true);
                void scanCareer({ data: { question: ask, careerId: profile.careerId, background: profile.background, done: profile.done } })
                  .then((next) => setBrief(next))
                  .catch(() =>
                    setBrief({
                      verdict: advise(ask, career, profile.done),
                      steps: [],
                      time: career?.years ?? "",
                      pay: career ? `${money(career.salaryMin)}–${money(career.salaryMax)}` : "",
                      hits: [],
                      google: `https://www.google.com/search?q=${encodeURIComponent(ask || "career path steps")}`,
                    }),
                  )
                  .finally(() => setScanning(false));
              }}
              className="mt-3 min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
            >
              {scanning ? "Reading…" : "Ask the coach"}
            </button>
          </div>
          <p className="text-xs text-muted">{ready ? "From your answers. Open one to see the road." : "Open a career for the detail page. Readiness uses DNA, the matching path, and checked certifications only."}</p>
          {(ready ? picks.map((row) => row.career) : CAREERS).map((item) => {
            const fit = fitFor(item, pathId, pathTitle, dna);
            const readyScore = readinessFor(item, pathId, dna, profile.done);
            return (
            <button key={item.id} type="button" onClick={() => choose(item.id)} className="block w-full rounded-2xl bg-surface p-4 text-left shadow-border">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{item.category}</p>
                  <p className="mt-1 font-display text-lg font-semibold">{item.name}</p>
                </div>
                <p className="shrink-0 text-right">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-subtle">Readiness</span>
                  <span className="text-xl font-semibold tabular-nums">{readyScore.score == null ? "—" : `${readyScore.score}%`}</span>
                </p>
              </div>
              <p className="mt-1 text-sm text-muted">{item.description}</p>
              <p className="mt-2 text-xs text-muted">{money(item.salaryMin)}–{money(item.salaryMax)} · {item.years}</p>
              {fit ? <p className="mt-1 text-xs text-muted">Match {fit.score}%. {fit.reasons.join(". ")}.</p> : null}
            </button>
            );
          })}
        </section>
      ) : null}

      {section === "assess" ? <Assessment profile={profile} step={step} setStep={setStep} setProfile={setProfile} onDone={() => setSection("discover")} /> : null}

      {section === "roadmap" ? (
        career ? (
          <CareerDetail
            career={career}
            done={profile.done}
            background={profile.background}
            dna={dna}
            pathId={pathId}
            pathTitle={pathTitle}
            onToggle={toggleStage}
            onOpportunities={() => setSection("seats")}
            onAsk={(prompt) => {
              setAsk(prompt);
              setSection("mentor");
            }}
          />
        ) : (
          <Empty onPick={() => setSection("discover")} />
        )
      ) : null}

      {section === "gap" ? (
        career ? (
          <Gap career={career} done={profile.done} background={profile.background} onBackground={(background) => setProfile((cur) => ({ ...cur, background }))} />
        ) : (
          <Empty onPick={() => setSection("discover")} />
        )
      ) : null}

      {section === "mentor" ? (
        <section className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Copilot</p>
          <h2 className="mt-1 font-display text-xl font-semibold">How you walk this path</h2>
          <p className="mt-1 text-sm text-muted">
            Ask in your own words. The copilot reads public career pages, lays the steps in order, and keeps the same question open on Google.
          </p>
          <textarea
            value={ask}
            onChange={(event) => setAsk(event.target.value)}
            rows={3}
            placeholder="I am 38 and I work in retail. Can I become a cybersecurity engineer?"
            className="mt-3 w-full rounded-xl bg-elevated px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={scanning}
            onClick={() => {
              setScanning(true);
              void scanCareer({ data: { question: ask, careerId: profile.careerId, background: profile.background, done: profile.done } })
                .then((next) => setBrief(next))
                .catch(() =>
                  setBrief({
                    verdict: advise(ask, career, profile.done),
                    steps: [],
                    time: career?.years ?? "",
                    pay: career ? `${money(career.salaryMin)}–${money(career.salaryMax)}` : "",
                    hits: [],
                    google: `https://www.google.com/search?q=${encodeURIComponent(ask || "career path steps")}`,
                  }),
                )
                .finally(() => setScanning(false));
            }}
            className="mt-3 min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
          >
            {scanning ? "Reading…" : "Scan and advise"}
          </button>
          {brief ? <Brief brief={brief} /> : null}
        </section>
      ) : null}

      {section === "tree" ? (
        <section className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Career tree</p>
          <ul className="mt-3 space-y-3">
            {CAREER_TREES.map((node) => (
              <Tree key={node.name} node={node} />
            ))}
          </ul>
        </section>
      ) : null}

      {section === "seats" ? <OpeningsDesk bare /> : null}

      <p className="text-xs text-muted">
        The map is free. A resume review and interview coaching sit in{" "}
        <a href={RESUME_CLINIC.href} target="_blank" rel="noreferrer" className="font-semibold text-primary">
          {RESUME_CLINIC.name}
        </a>
        .
      </p>
    </div>
  );
}

function Assessment({
  profile,
  step,
  setStep,
  setProfile,
  onDone,
}: {
  profile: CareerProfile;
  step: number;
  setStep: (n: number) => void;
  setProfile: (next: CareerProfile | ((cur: CareerProfile) => CareerProfile)) => void;
  onDone: () => void;
}) {
  const prompts = ["What interests you most?", "How do you want the work to feel?", "What school have you finished?", "What should the seat pay?"];
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-border">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Step {step + 1} of 4</p>
      <h2 className="mt-1 font-display text-xl font-semibold">{prompts[step]}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {step === 0
          ? INTERESTS.map((item) => (
              <Toggle key={item} on={profile.interests.includes(item)} label={item} onClick={() => setProfile((cur) => ({ ...cur, interests: flip(cur.interests, item) }))} />
            ))
          : null}
        {step === 1
          ? STYLES.map((item) => (
              <Toggle key={item} on={profile.styles.includes(item)} label={item} onClick={() => setProfile((cur) => ({ ...cur, styles: flip(cur.styles, item) }))} />
            ))
          : null}
        {step === 2
          ? EDUCATIONS.map((item) => (
              <Toggle key={item} on={profile.education === item} label={item} onClick={() => setProfile((cur) => ({ ...cur, education: item as Education }))} />
            ))
          : null}
        {step === 3
          ? INCOMES.map((item) => (
              <Toggle key={item} on={profile.income === item} label={item} onClick={() => setProfile((cur) => ({ ...cur, income: item as Income }))} />
            ))
          : null}
      </div>
      <div className="mt-4 flex gap-2">
        {step > 0 ? (
          <button type="button" onClick={() => setStep(step - 1)} className="min-h-11 rounded-full bg-elevated px-4 text-xs font-semibold">
            Back
          </button>
        ) : null}
        {step < 3 ? (
          <button type="button" onClick={() => setStep(step + 1)} className="min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
            Next
          </button>
        ) : (
          <button type="button" onClick={onDone} className="min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
            See careers
          </button>
        )}
      </div>
    </section>
  );
}

function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn("min-h-11 rounded-full px-3 text-xs font-semibold", on ? "bg-primary text-primary-fg" : "bg-elevated text-muted")}>
      {label}
    </button>
  );
}

function flip<T>(list: T[], item: T) {
  return list.includes(item) ? list.filter((row) => row !== item) : [...list, item];
}

function Gap({
  career,
  done,
  background,
  onBackground,
}: {
  career: NonNullable<ReturnType<typeof careerById>>;
  done: string[];
  background: string;
  onBackground: (value: string) => void;
}) {
  const gap = gapFor(career, done, background);
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-border">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Where you are, and where the seat is</p>
      <h2 className="mt-1 font-display text-xl font-semibold">{career.name}</h2>
      <p className="mt-1 text-sm text-muted">{gap.percent}% of this map is checked. About {gap.months} months of the remaining stages.</p>
      <label className="mt-3 block text-xs font-semibold text-muted">
        Already on your record
        <textarea
          value={background}
          onChange={(event) => onBackground(event.target.value)}
          rows={2}
          placeholder="Security+, two years on a help desk"
          className="mt-1 w-full rounded-xl bg-elevated px-3 py-2 text-sm font-normal text-fg"
        />
      </label>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-subtle">Still open</p>
      <ul className="mt-1 space-y-1">
        {gap.missing.map((stage) => (
          <li key={stage.id} className="text-sm">
            {stage.title}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">Skills this road keeps asking for: {career.skills.join(", ")}.</p>
    </section>
  );
}

function Brief({ brief }: { brief: CareerScan }) {
  return (
    <div className="mt-4 space-y-3 text-sm">
      <p className="leading-relaxed">{brief.verdict}</p>
      {brief.steps.length ? (
        <ol className="space-y-1">
          {brief.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}
      {brief.time ? <p className="text-muted">Time · {brief.time}</p> : null}
      {brief.pay ? <p className="text-muted">Pay · {brief.pay}</p> : null}
      {brief.hits.length ? (
        <ul className="space-y-2">
          {brief.hits.map((hit) => (
            <li key={hit.href}>
              <a href={hit.href} target="_blank" rel="noreferrer" className="font-semibold text-primary">
                {hit.title}
              </a>
              {hit.note ? <span className="mt-0.5 block text-xs text-muted">{hit.note}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
      <a href={brief.google} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-xs font-semibold text-primary">
        Same question on Google
      </a>
    </div>
  );
}

function Tree({ node }: { node: TreeNode }) {
  return (
    <li>
      <p className="text-sm font-semibold">{node.name}</p>
      {node.children ? (
        <ul className="mt-1 space-y-1 border-l border-border pl-3">
          {node.children.map((child) => (
            <Tree key={child.name} node={child} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function Empty({ onPick }: { onPick: () => void }) {
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-border">
      <p className="text-sm text-muted">Pick a career first.</p>
      <button type="button" onClick={onPick} className="mt-3 min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
        Discover
      </button>
    </section>
  );
}
