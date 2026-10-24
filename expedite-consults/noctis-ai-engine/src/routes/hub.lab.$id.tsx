import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { CYBER_LOOP, labById, type LabStep } from "@/lib/cyber-labs";
import { toolsForLab, librariesForLab } from "@/lib/axiom-clinic";
import { StudyLinks } from "@/components/learn/StudyLinks";
import { TailorLesson } from "@/components/learn/TailorLesson";
import { AssessLesson } from "@/components/learn/AssessLesson";
import { CLINIC_PATH } from "@/lib/attack-path";
import { AttackPathGraph } from "@/components/learn/AttackPathGraph";
import { SOURCE } from "@/lib/source";
import { useFeedStore } from "@/lib/feed-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hub/lab/$id")({ component: LabPage });

const STEPS: { id: LabStep; label: string }[] = [
  { id: "watch", label: "Watch" },
  { id: "learn", label: "Learn" },
  { id: "practice", label: "Practice" },
  { id: "test", label: "Test" },
  { id: "certify", label: "Certify" },
];

function LabPage() {
  const { id } = Route.useParams();
  const lab = labById(id);
  const tools = toolsForLab(id);
  const libs = librariesForLab(id);
  const earnStamp = useFeedStore((s) => s.earnStamp);
  const earned = useFeedStore((s) => s.earnedStamps);
  const [step, setStep] = useState<LabStep>("watch");
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [fix, setFix] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [tested, setTested] = useState(false);
  const [pathOpened, setPathOpened] = useState<string[]>([]);

  const foundOk = useMemo(() => {
    if (!lab) return false;
    return lab.findings.every((f) => Boolean(marked[f.id]) === f.ok);
  }, [lab, marked]);
  const fixOk = Boolean(lab?.fix.options.find((o) => o.id === fix)?.ok);
  const testScore = lab ? lab.test.reduce((n, q, i) => n + (answers[i] === q.ok ? 1 : 0), 0) : 0;
  const testOk = Boolean(lab && tested && testScore === lab.test.length);
  const ready = foundOk && fixOk && testOk;
  const held = Boolean(lab && earned.includes(lab.badge));

  if (!lab) {
    return (
      <AppShell>
        <ClinicFrame>
          <p className="p-5 text-sm text-muted">No such lab.</p>
          <Link to="/hub/cyber" className="px-5 text-xs font-semibold text-primary">
            Cyber pulse
          </Link>
        </ClinicFrame>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ClinicFrame>
        <header className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            {lab.cloud} lab · {SOURCE}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold">{lab.title}</h1>
          <p className="mt-2 text-sm text-muted">{CYBER_LOOP.join(" → ")}</p>
          <p className="mt-2 text-[11px] text-subtle">Hypothetical tenant. We do not touch your cloud.</p>
        </header>

        <nav className="flex gap-1 overflow-x-auto scrollbar-none">
          {STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              className={cn(
                "min-h-11 shrink-0 rounded-full px-3 text-xs font-semibold",
                step === s.id ? "bg-primary text-primary-fg" : "bg-surface text-muted shadow-border",
              )}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {step === "watch" ? (
          <section className="rounded-2xl bg-surface p-5 shadow-border">
            <h2 className="font-display text-lg font-semibold">Watch</h2>
            <p className="mt-2 text-sm text-muted">{lab.watch.title}</p>
            <a href={lab.watch.href} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
              Open the film at source
            </a>
            <StudyLinks title="Study library" links={libs} />
            <button type="button" onClick={() => setStep("learn")} className="mt-4 block min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
              I watched — learn
            </button>
          </section>
        ) : null}

        {step === "learn" ? (
          <section className="rounded-2xl bg-surface p-5 shadow-border">
            <h2 className="font-display text-lg font-semibold">Learn</h2>
            <ul className="mt-3 space-y-2">
              {lab.learn.map((line) => (
                <li key={line} className="text-sm text-muted">
                  {line}
                </li>
              ))}
            </ul>
            <StudyLinks title="Read before you practice" links={libs} />
            {lab.id === "ctem" ? (
              <div className="mt-4 space-y-3">
                <TailorLesson compact />
                <AssessLesson compact />
              </div>
            ) : null}
            {tools.length ? (
              <StudyLinks
                title="Then the AXIOM desk"
                links={tools.map((t) => ({ label: `Launch ${t.title.split("(")[0]!.trim()}`, href: t.href }))}
              />
            ) : null}
            <button type="button" onClick={() => setStep("practice")} className="mt-4 min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
              Practice
            </button>
          </section>
        ) : null}

        {step === "practice" ? (
          <section className="rounded-2xl bg-surface p-5 shadow-border">
            <h2 className="font-display text-lg font-semibold">Practice — find it, then fix it</h2>
            {tools.length ? (
              <div className="mt-4 space-y-4">
                {tools.map((tool) => (
                  <article key={tool.id} className="rounded-2xl bg-elevated p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{tool.title}</p>
                    <ol className="mt-2 list-decimal space-y-1 pl-5">
                      {tool.procedure.map((step) => (
                        <li key={step} className="text-xs leading-relaxed text-muted">
                          {step}
                        </li>
                      ))}
                    </ol>
                    <StudyLinks
                      title="External study"
                      links={[
                        { label: "Launch AXIOM", href: tool.href },
                        { label: tool.watch.title, href: `https://www.youtube.com/watch?v=${tool.watch.youtubeId}` },
                        ...tool.library,
                      ]}
                    />
                  </article>
                ))}
              </div>
            ) : (
              <StudyLinks title="Study library" links={libs} />
            )}
            {lab.id === "path" ? (
              <div className="mt-4">
                <AttackPathGraph
                  opened={pathOpened}
                  onOpen={(nid) => setPathOpened((p) => (p.includes(nid) ? p : [...p, nid]))}
                />
                {pathOpened.length === CLINIC_PATH.length ? (
                  <p className="mt-3 text-xs font-semibold text-primary">Path complete. Internet reached the jewel. Now mark the findings.</p>
                ) : null}
              </div>
            ) : null}
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-subtle">{lab.evidence.label}</p>
            <pre className="mt-3 overflow-x-auto rounded-2xl bg-bg p-3 text-[11px] leading-relaxed text-fg">{lab.evidence.body}</pre>
            <p className="mt-4 text-sm font-semibold">Mark every real finding. Leave the decoy.</p>
            <ul className="mt-2 space-y-1.5">
              {lab.findings.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => setMarked((m) => ({ ...m, [f.id]: !m[f.id] }))}
                    className={cn("flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm", marked[f.id] ? "bg-elevated text-fg" : "bg-bg text-muted")}
                  >
                    {f.label}
                  </button>
                </li>
              ))}
            </ul>
            {Object.keys(marked).length ? (
              <p className={cn("mt-2 text-xs font-semibold", foundOk ? "text-primary" : "text-muted")}>
                {foundOk ? "Findings hold." : "Not yet — a decoy is on, or a real one is off."}
              </p>
            ) : null}
            <p className="mt-4 text-sm font-semibold">{lab.fix.prompt}</p>
            <div className="mt-2 space-y-1.5">
              {lab.fix.options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setFix(o.id)}
                  className={cn("flex min-h-11 w-full rounded-xl px-3 text-left text-sm", fix === o.id ? "bg-elevated text-fg" : "bg-bg text-muted")}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {fix ? (
              <p className={cn("mt-2 text-xs font-semibold", fixOk ? "text-primary" : "text-muted")}>
                {fixOk ? "Fix holds." : "That makes it worse."}
              </p>
            ) : null}
            <button type="button" onClick={() => setStep("test")} className="mt-4 min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
              Test
            </button>
          </section>
        ) : null}

        {step === "test" ? (
          <section className="rounded-2xl bg-surface p-5 shadow-border">
            <h2 className="font-display text-lg font-semibold">Test</h2>
            <ol className="mt-3 space-y-4">
              {lab.test.map((q, i) => (
                <li key={q.q}>
                  <p className="text-sm font-semibold">{q.q}</p>
                  <div className="mt-2 space-y-1.5">
                    {q.options.map((opt, j) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAnswers((a) => ({ ...a, [i]: j }))}
                        className={cn("flex min-h-11 w-full rounded-xl px-3 text-left text-sm", answers[i] === j ? "bg-elevated text-fg" : "bg-bg text-muted")}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => setTested(true)}
              className="mt-4 min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
            >
              {tested ? `${testScore} / ${lab.test.length}` : "Score"}
            </button>
            {tested ? (
              <button type="button" onClick={() => setStep("certify")} className="mt-3 block min-h-11 text-xs font-semibold text-primary">
                Certify
              </button>
            ) : null}
          </section>
        ) : null}

        {step === "certify" ? (
          <section className="rounded-2xl bg-surface p-5 shadow-border">
            <h2 className="font-display text-lg font-semibold">Certify → Build → Share</h2>
            {!ready ? (
              <p className="mt-2 text-sm text-muted">Finish findings, the fix, and the test. Then the badge drops.</p>
            ) : held ? (
              <p className="mt-2 text-sm">
                Badge held: <span className="font-semibold">{lab.badge}</span>. Build the next lab. Share the stamp from You.
              </p>
            ) : (
              <button
                type="button"
                onClick={() => earnStamp(lab.badge)}
                className="mt-4 min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
              >
                Take {lab.badge}
              </button>
            )}
            <Link to="/hub/cyber" className="mt-4 block min-h-11 text-xs font-semibold text-primary">
              More labs this week
            </Link>
          </section>
        ) : null}
      </ClinicFrame>
    </AppShell>
  );
}
