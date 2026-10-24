import { useEffect, useState } from "react";
import { BRIEFS, CERT_HUBS, CHALLENGES, COACH_PATH, DEMAND, JOURNEY, MENTORS, MICROS, NOTE_KINDS, PREP, QUIZ, ROADMAP, TOOLS } from "@/lib/grow-desk";
import { cn } from "@/lib/utils";

const DESKS = ["Road", "Certs", "Summary", "News", "Market", "Mentors", "Micro", "Pay", "Challenges", "Quiz", "Prep", "Coach", "Notes", "Tools", "Journey"] as const;
type Desk = (typeof DESKS)[number];
const DAY = "vibetok-grow-days";
const NOTES = "vibetok-grow-notes";

export function GrowDesk({ open }: { open?: Desk }) {
  const [desk, setDesk] = useState<Desk>(open ?? "Road");
  const [cert, setCert] = useState<(typeof CERT_HUBS)[number] | null>(null);
  const [days, setDays] = useState<Record<string, number>>({});
  const [picked, setPicked] = useState<number[]>([]);
  const [years, setYears] = useState("0–2");
  const [ask, setAsk] = useState("I am a help desk technician. How do I become a Security Engineer?");
  const [noteKind, setNoteKind] = useState<(typeof NOTE_KINDS)[number]>("Note");
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<{ kind: string; text: string }[]>([]);
  const [toolGroup, setToolGroup] = useState("Cybersecurity");

  useEffect(() => {
    if (open) setDesk(open);
  }, [open]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DAY);
      if (raw) setDays(JSON.parse(raw) as Record<string, number>);
      const saved = localStorage.getItem(NOTES);
      if (saved) setNotes(JSON.parse(saved) as { kind: string; text: string }[]);
    } catch {
      /* fresh */
    }
  }, []);

  function mark(id: string, total: number) {
    setDays((cur) => {
      const next = { ...cur, [id]: Math.min(total, (cur[id] ?? 0) + 1) };
      localStorage.setItem(DAY, JSON.stringify(next));
      return next;
    });
  }

  const score = QUIZ.reduce((n, row, i) => n + (picked[i] === row.ok ? 1 : 0), 0);
  const answered = picked.filter((n) => n != null).length;

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
        {DESKS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setDesk(item)}
            className={cn("shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold", desk === item ? "bg-primary text-primary-fg" : "bg-surface text-muted")}
          >
            {item}
          </button>
        ))}
      </div>

      {desk === "Road" ? (
        <ol className="space-y-2">
          {ROADMAP.map((step, i) => (
            <li key={step} className="rounded-2xl bg-surface px-4 py-3 text-sm shadow-border">
              <span className="text-muted">Step {i + 1}. </span>
              {step}
            </li>
          ))}
          <li className="rounded-2xl bg-elevated px-4 py-3 text-xs leading-relaxed text-muted">
            Pay for this title is published by the Bureau of Labor Statistics, not guessed here. Information security analysts, May 2024: median $124,910. Range $69,660 to $186,420.{" "}
            <a className="underline" href="https://www.bls.gov/ooh/computer-and-information-technology/information-security-analysts.htm" target="_blank" rel="noreferrer">
              Open the page
            </a>
            . Training: CompTIA objectives and a home lab. Jobs:{" "}
            <a className="underline" href="https://www.usajobs.gov/Search/Results?k=cybersecurity" target="_blank" rel="noreferrer">
              USAJOBS
            </a>
            .
          </li>
        </ol>
      ) : null}

      {desk === "Certs" ? (
        <div className="space-y-2">
          {CERT_HUBS.map((row) => (
            <button key={row.id} type="button" onClick={() => setCert(cert?.id === row.id ? null : row)} className="block w-full rounded-2xl bg-surface p-4 text-left shadow-border">
              <p className="font-semibold">{row.name}</p>
              <p className="text-xs text-muted">{row.vendor} · {row.difficulty}</p>
              {cert?.id === row.id ? (
                <div className="mt-2 space-y-1 text-sm">
                  <p>Time · {row.time}</p>
                  <p>Cost · {row.cost}</p>
                  <p>Before · {row.prerequisites}</p>
                  <p>Tip · {row.tips}</p>
                  <p>Jobs · {row.jobs}</p>
                  <a href={row.href} target="_blank" rel="noreferrer" className="inline-block text-xs font-semibold text-primary" onClick={(e) => e.stopPropagation()}>
                    Official page
                  </a>
                </div>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      {desk === "Summary" ? (
        <article className="space-y-2 rounded-2xl bg-surface p-4 shadow-border">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">3-minute summary · How SIEM works</p>
          <p className="text-sm leading-relaxed">A SIEM collects logs, turns them into events, and raises an alert when a rule matches. The analyst reads the alert, checks the host, and writes what happened.</p>
          <p className="text-sm">Takeaways · Logs are not the attack. The timeline is. A rule can be wrong.</p>
          <p className="text-sm">Quote · “Name the host, the user, and the time before you name the malware.”</p>
          <p className="text-sm">Skills · Search, triage, writing.</p>
          <p className="text-sm">Next · Security+, then a lab search, then a SOC seat.</p>
        </article>
      ) : null}

      {desk === "News" ? (
        <ul className="space-y-2">
          {BRIEFS.map((row) => (
            <li key={row.id} className="rounded-2xl bg-surface p-4 shadow-border">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{row.field}</p>
              <p className="mt-1 text-sm">What happened · {row.happened}</p>
              <p className="text-sm">Why it matters · {row.matters}</p>
              <p className="text-sm">Careers · {row.careers}</p>
              <p className="text-sm">Skill · {row.skill}</p>
              <a href={row.href} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-semibold text-primary">Source</a>
            </li>
          ))}
        </ul>
      ) : null}

      {desk === "Market" ? (
        <ul className="space-y-2">
          {DEMAND.map((row) => (
            <li key={row.skill} className="rounded-2xl bg-surface p-4 shadow-border">
              <p className="font-semibold">{row.skill}</p>
              <p className="mt-1 text-sm text-muted">{row.outlook}</p>
              <a href={row.href} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-semibold text-primary">Open</a>
            </li>
          ))}
          <li className="text-xs text-muted">Job counts and city pay change monthly. Use the Labor Department and the employer’s posting, not a frozen number.</li>
        </ul>
      ) : null}

      {desk === "Mentors" ? (
        <ul className="space-y-2">
          {MENTORS.map((row) => (
            <li key={row.title} className="rounded-2xl bg-surface p-4 shadow-border">
              <p className="font-semibold">{row.title}</p>
              <p className="mt-1 text-sm text-muted">{row.line}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {desk === "Micro" ? (
        <ul className="space-y-2">
          {MICROS.map((row) => (
            <li key={row.title} className="rounded-2xl bg-surface p-4 shadow-border">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{row.seconds} seconds</p>
              <p className="mt-1 font-semibold">{row.title}</p>
              <p className="mt-1 text-sm leading-relaxed">{row.line}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {desk === "Pay" ? (
        <form className="space-y-3 rounded-2xl bg-surface p-4 shadow-border" onSubmit={(e) => e.preventDefault()}>
          <label className="block text-sm">
            Experience
            <select value={years} onChange={(e) => setYears(e.target.value)} className="mt-1 w-full rounded-xl bg-elevated px-3 py-2">
              {["0–2", "2–5", "5–10", "10+"].map((row) => (
                <option key={row}>{row}</option>
              ))}
            </select>
          </label>
          <p className="text-sm leading-relaxed">
            Information security analyst, United States, May 2024. {years === "0–2" ? "The low end of the published range is $69,660." : years === "10+" ? "The high end of the published range is $186,420." : "The median is $124,910."} A certification moves you along the roadmap. It does not set the wage. Location is on the Bureau of Labor Statistics state tables.
          </p>
          <a className="text-xs font-semibold text-primary" href="https://www.bls.gov/oes/current/oes151212.htm" target="_blank" rel="noreferrer">
            State and metro wages
          </a>
          <p className="text-sm">Promotion · SOC analyst → detection → security engineer → architect.</p>
        </form>
      ) : null}

      {desk === "Challenges" ? (
        <ul className="space-y-2">
          {CHALLENGES.map((row) => (
            <li key={row.id} className="rounded-2xl bg-surface p-4 shadow-border">
              <p className="font-semibold">{row.title}</p>
              <p className="mt-1 text-sm text-muted">{row.line}</p>
              <p className="mt-2 text-xs">Day {days[row.id] ?? 0} of {row.days}</p>
              <button type="button" onClick={() => mark(row.id, row.days)} className="mt-2 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-fg">
                Mark today
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {desk === "Quiz" ? (
        <div className="space-y-3">
          {QUIZ.map((row, i) => (
            <fieldset key={row.q} className="rounded-2xl bg-surface p-4 shadow-border">
              <legend className="text-sm font-semibold">{row.q}</legend>
              <div className="mt-2 space-y-1">
                {row.options.map((option, n) => (
                  <label key={option} className="flex items-center gap-2 text-sm">
                    <input type="radio" name={`q-${i}`} checked={picked[i] === n} onChange={() => setPicked((cur) => { const next = [...cur]; next[i] = n; return next; })} />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          {answered === QUIZ.length ? (
            <p className="rounded-2xl bg-elevated p-4 text-sm">
              {score} of {QUIZ.length}. {score >= 4 ? "You can start Security+ or AZ-900 objectives." : "Replay the 60-second lessons, then try again."}
            </p>
          ) : null}
        </div>
      ) : null}

      {desk === "Prep" ? (
        <div className="space-y-3">
          <a href={PREP.resume} target="_blank" rel="noreferrer" className="block rounded-2xl bg-surface p-4 shadow-border">
            <p className="font-semibold">Resume clinic</p>
            <p className="mt-1 text-sm text-muted">Tailor the resume to the seat, then apply on the official board.</p>
          </a>
          <section className="rounded-2xl bg-surface p-4 shadow-border">
            <p className="font-semibold">Interview questions</p>
            <ul className="mt-2 space-y-1 text-sm">{PREP.questions.map((q) => <li key={q}>{q}</li>)}</ul>
          </section>
          <section className="rounded-2xl bg-surface p-4 shadow-border">
            <p className="font-semibold">Salary negotiation</p>
            <ul className="mt-2 space-y-1 text-sm">{PREP.negotiate.map((q) => <li key={q}>{q}</li>)}</ul>
          </section>
          <section className="rounded-2xl bg-surface p-4 shadow-border">
            <p className="font-semibold">Mock interview</p>
            <p className="mt-1 text-sm text-muted">Answer the first question out loud. Record it on the Record tab. Watch it once. Cut the filler.</p>
          </section>
          <section className="rounded-2xl bg-surface p-4 shadow-border">
            <p className="font-semibold">LinkedIn</p>
            <ul className="mt-2 space-y-1 text-sm">{PREP.linkedinTips.map((q) => <li key={q}>{q}</li>)}</ul>
            <a href={PREP.linkedin} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-primary">Open LinkedIn</a>
          </section>
        </div>
      ) : null}

      {desk === "Coach" ? (
        <div className="space-y-3">
          <label className="block text-sm">
            Ask
            <textarea value={ask} onChange={(e) => setAsk(e.target.value)} rows={3} className="mt-1 w-full rounded-xl bg-surface px-3 py-2" />
          </label>
          {/help desk/i.test(ask) && /security engineer/i.test(ask) ? (
            <ol className="space-y-2">
              {COACH_PATH.map((row) => (
                <li key={row.step} className="rounded-2xl bg-surface p-4 shadow-border">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{row.step}</p>
                  <p className="mt-1 text-sm">{row.line}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="rounded-2xl bg-elevated p-4 text-sm">Name the job you have and the job you want. The help-desk to security-engineer path is ready.</p>
          )}
        </div>
      ) : null}

      {desk === "Notes" ? (
        <div className="space-y-3">
          <form
            className="space-y-2 rounded-2xl bg-surface p-4 shadow-border"
            onSubmit={(e) => {
              e.preventDefault();
              const text = noteText.trim();
              if (!text) return;
              const next = [{ kind: noteKind, text }, ...notes].slice(0, 40);
              setNotes(next);
              setNoteText("");
              localStorage.setItem(NOTES, JSON.stringify(next));
            }}
          >
            <select value={noteKind} onChange={(e) => setNoteKind(e.target.value as (typeof NOTE_KINDS)[number])} className="w-full rounded-xl bg-elevated px-3 py-2 text-sm">
              {NOTE_KINDS.map((kind) => <option key={kind}>{kind}</option>)}
            </select>
            <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={3} placeholder="A tip, a lab step, a template" className="w-full rounded-xl bg-elevated px-3 py-2 text-sm" />
            <button type="submit" className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-fg">Save on this device</button>
          </form>
          <ul className="space-y-2">
            {notes.map((row, i) => (
              <li key={`${row.kind}-${i}`} className="rounded-2xl bg-surface p-4 shadow-border">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{row.kind}</p>
                <p className="mt-1 text-sm">{row.text}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {desk === "Tools" ? (
        <div className="space-y-2">
          <div className="flex gap-1.5">
            {["Cybersecurity", "IT", "AI"].map((group) => (
              <button key={group} type="button" onClick={() => setToolGroup(group)} className={cn("rounded-full px-3 py-1.5 text-[11px] font-semibold", toolGroup === group ? "bg-primary text-primary-fg" : "bg-surface text-muted")}>
                {group}
              </button>
            ))}
          </div>
          {TOOLS.filter((row) => row.group === toolGroup).map((row) => (
            <article key={row.name} className="rounded-2xl bg-surface p-4 shadow-border">
              <a href={row.href} target="_blank" rel="noreferrer" className="font-semibold hover:underline">{row.name}</a>
              <p className="mt-1 text-sm">{row.does}</p>
              <p className="mt-1 text-sm text-muted">Path · {row.path}</p>
              <p className="text-xs text-muted">Certs · {row.cert} · Jobs · {row.jobs}</p>
            </article>
          ))}
        </div>
      ) : null}

      {desk === "Journey" ? (
        <ol className="space-y-2">
          {JOURNEY.map((row, i) => (
            <li key={row.title} className="rounded-2xl bg-surface p-4 shadow-border">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Step {i + 1}</p>
              <p className="font-semibold">{row.title}</p>
              <p className="mt-1 text-sm">{row.note}</p>
              <p className="mt-1 text-xs text-muted">Cert · {row.cert}</p>
            </li>
          ))}
          <li className="text-xs leading-relaxed text-muted">
            Dollar figures in stories are not wages. The published median for information security analysts was $124,910 in May 2024.{" "}
            <a className="underline" href="https://www.bls.gov/ooh/computer-and-information-technology/information-security-analysts.htm" target="_blank" rel="noreferrer">Bureau of Labor Statistics</a>
          </li>
        </ol>
      ) : null}
    </div>
  );
}
