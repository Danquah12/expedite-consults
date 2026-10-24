import { Link } from "@tanstack/react-router";
import type { Career } from "@/lib/career-nav";
import { gapFor, money } from "@/lib/career-nav";
import { fitFor, pathsForCareer, readinessFor, strandHits } from "@/lib/career-fit";

export function CareerDetail({
  career,
  done,
  background,
  dna,
  pathId,
  pathTitle,
  onToggle,
  onOpportunities,
  onAsk,
}: {
  career: Career;
  done: string[];
  background: string;
  dna: Record<string, number>;
  pathId: string;
  pathTitle: string;
  onToggle: (id: string) => void;
  onOpportunities: () => void;
  onAsk: (prompt: string) => void;
}) {
  const gap = gapFor(career, done, background);
  const fit = fitFor(career, pathId, pathTitle, dna);
  const ready = readinessFor(career, pathId, dna, done);
  const certs = career.stages.filter((stage) => stage.type === "Certification");
  const next = gap.missing.slice(0, 4);
  const known = background.toLowerCase();
  const strengths = career.skills.filter((skill) => known.includes(skill.toLowerCase()) || strandHits(career, dna).some(([name]) => skill.toLowerCase().includes(name.toLowerCase().split(" ")[0] || "___")));
  const weak = career.skills.filter((skill) => !strengths.includes(skill));
  const paths = pathsForCareer(career.id);
  const hits = strandHits(career, dna);

  return (
    <article className="space-y-3 rounded-2xl bg-surface p-5 shadow-border">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Career</p>
      <h2 className="font-display text-2xl font-semibold">{career.name}</h2>
      <p className="text-sm text-muted">{career.category}</p>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Salary</dt>
          <dd className="font-semibold">{money(career.salaryMin)}–{money(career.salaryMax)}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Demand</dt>
          <dd className="font-semibold">{career.demand}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Match</dt>
          <dd className="font-semibold">{fit ? `${fit.score}%` : "Not scored"}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Readiness</dt>
          <dd className="font-semibold">{ready.score == null ? "Not scored" : `${ready.score}% · ${ready.level}`}</dd>
        </div>
      </dl>
      <p className="text-sm leading-relaxed">{career.description}</p>
      {fit ? <p className="text-sm text-muted">Recommended because {fit.reasons.join(". ")}.</p> : <p className="text-sm text-muted">Not recommended yet. Your path and DNA do not name this career.</p>}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Next steps</p>
        {next.length ? (
          <ol className="mt-1 list-decimal space-y-1 pl-4 text-sm">
            {next.map((stage) => (
              <li key={stage.id}>{stage.title}</li>
            ))}
          </ol>
        ) : (
          <p className="mt-1 text-sm text-muted">Every stored stage is checked.</p>
        )}
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Skills</p>
        <p className="mt-1 text-sm">Strengths: {strengths.length ? strengths.join(" · ") : "None recorded."}</p>
        <p className="mt-1 text-sm">Still open: {weak.length ? weak.join(" · ") : "None stored."}</p>
        <p className="mt-1 text-xs text-muted">Road checked {gap.percent}%. About {gap.months} months remain on the stages you have not checked.</p>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Readiness parts</p>
        {ready.parts.length ? (
          <ul className="mt-1 space-y-1 text-sm">
            {ready.parts.map((part) => (
              <li key={part.label}>{part.label} {part.score}% · weight {part.weight}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-muted">No DNA, path, or certification progress is stored for this career.</p>
        )}
        <p className="mt-1 text-xs text-muted">Hall progress, a skill assessment, and a portfolio are not stored, so they are left out of the score.</p>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Knowledge DNA</p>
        <p className="mt-1 text-sm">{hits.length ? hits.map(([name, value]) => `${name} ${value}`).join(" · ") : "No strand matches this career."}</p>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Paths</p>
        <p className="mt-1 text-sm">{paths.length ? paths.join(" · ") : "No path is stored for this career."}</p>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Certifications</p>
        <ul className="mt-1 space-y-1">
          {certs.length ? certs.map((stage) => (
            <li key={stage.id}>
              <button type="button" onClick={() => onToggle(stage.id)} className="text-left text-sm font-semibold">
                {done.includes(stage.id) ? "Checked · " : ""}{stage.title}
              </button>
            </li>
          )) : <li className="text-sm text-muted">None stored on this road.</li>}
        </ul>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Roadmap</p>
        <ol className="mt-2 space-y-2">
          {career.stages.map((stage, index) => (
            <li key={stage.id}>
              <button type="button" onClick={() => onToggle(stage.id)} className="text-left text-sm">
                <span className="font-semibold">{index + 1}. {stage.title}</span>
                <span className="mt-0.5 block text-xs text-muted">{stage.type}{done.includes(stage.id) ? " · checked" : ""}{stage.months ? ` · about ${stage.months} months` : ""}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to="/hall" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-3 text-xs font-semibold">Hall</Link>
        <Link to="/paths" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-3 text-xs font-semibold">Paths</Link>
        <Link to="/study" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-3 text-xs font-semibold">Lessons and materials</Link>
        <button type="button" onClick={onOpportunities} className="inline-flex min-h-11 items-center rounded-full bg-elevated px-3 text-xs font-semibold">Opportunities</button>
      </div>
      <p className="text-xs text-muted">No Hall lesson list, mentor, or book is stored for this career.</p>
      <button
        type="button"
        onClick={() => onAsk(`Can I become a ${career.name}? Use only the salary, stages, and skills stored for this career.`)}
        className="min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
      >
        Ask the career coach
      </button>
    </article>
  );
}
