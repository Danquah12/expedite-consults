import { useState } from "react";
import { CERT_LOOP } from "@/lib/ingest-sources";
import { CERT_TRACKS } from "@/lib/cert-academy";
import { RESUME_CLINIC } from "@/lib/openings";
import { scoreInterview } from "@/lib/interview-api";
import { cn } from "@/lib/utils";

const SEATS = [
  {
    id: "soc",
    label: "SOC analyst",
    q: "Walk me through how you would triage a phishing alert that already has a click.",
  },
  {
    id: "nurse",
    label: "Nurse",
    q: "A patient is short of breath after a new med. What do you do first, and why?",
  },
  {
    id: "dev",
    label: "Developer",
    q: "Tell me about a time a production bug was yours. What did you do after?",
  },
] as const;

function starScore(text: string) {
  const t = text.toLowerCase();
  const hits = ["situation", "task", "action", "result", "i ", "we ", "because"].filter((k) => t.includes(k)).length;
  const words = text.trim().split(/\s+/).length;
  if (words < 40) return { score: 3, note: "Too short. Situation, then what you did, then the result." };
  if (hits >= 4 && words >= 80) return { score: 8, note: "STAR is visible. Name the metric on retry." };
  if (hits >= 2) return { score: 6, note: "Action is there. Add the result in numbers." };
  return { score: 4, note: "Say I/we. Then the action. Then what changed." };
}

export function MockInterview() {
  const [seatId, setSeatId] = useState<(typeof SEATS)[number]["id"]>("soc");
  const [answer, setAnswer] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const seat = SEATS.find((s) => s.id === seatId)!;

  async function score() {
    if (busy) return;
    setBusy(true);
    const local = starScore(answer);
    try {
      const res = await scoreInterview({ data: { seat: seat.label, question: seat.q, answer } });
      if (res.ok && res.text) setNote(res.text);
      else setNote(`Rubric ${local.score}/10. ${local.note}`);
    } catch {
      setNote(`Rubric ${local.score}/10. ${local.note}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-border">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Career hall · mock interview</p>
      <h2 className="mt-1 font-display text-lg font-semibold">Answer. Get scored. Retry.</h2>
      <p className="mt-1 text-sm text-muted">
        STAR: Situation → Task → Action → Result. Resume still lives at {RESUME_CLINIC.name}.
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {SEATS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setSeatId(s.id);
              setNote(null);
            }}
            className={cn(
              "min-h-11 rounded-full px-3 text-xs font-semibold",
              seatId === s.id ? "bg-primary text-primary-fg" : "bg-elevated",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm font-semibold leading-snug">{seat.q}</p>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={5}
        placeholder="Speak in writing. I did… because… the result was…"
        className="mt-3 w-full rounded-xl bg-elevated px-3 py-2 text-sm"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void score()}
          disabled={busy}
          className="min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg disabled:opacity-60"
        >
          {busy ? "Scoring…" : "Score this take"}
        </button>
        <a href={RESUME_CLINIC.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-xs font-semibold text-primary">
          Resume clinic
        </a>
      </div>
      {note ? <p className="mt-3 whitespace-pre-wrap text-sm text-muted">{note}</p> : null}
    </section>
  );
}

export function CertAcademy() {
  const [id, setId] = useState<(typeof CERT_TRACKS)[number]["id"]>("secplus");
  const [step, setStep] = useState<(typeof CERT_LOOP)[number]>("Certification");
  const [pick, setPick] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, string[]>>(() => {
    try {
      return JSON.parse(localStorage.getItem("sphera-cert-progress") ?? "{}") as Record<string, string[]>;
    } catch {
      return {};
    }
  });
  const track = CERT_TRACKS.find((t) => t.id === id)!;

  function mark() {
    const next = { ...done, [id]: Array.from(new Set([...(done[id] ?? []), step])) };
    setDone(next);
    localStorage.setItem("sphera-cert-progress", JSON.stringify(next));
  }

  const steps = done[id] ?? [];

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-border">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Certification academy</p>
      <h2 className="mt-1 font-display text-lg font-semibold">A path. Not a pile of videos.</h2>
      <p className="mt-1 text-sm text-muted">{CERT_LOOP.join(" → ")}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {CERT_TRACKS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setId(t.id);
              setPick(null);
              setStep("Certification");
            }}
            className={cn(
              "min-h-11 rounded-full px-3 text-xs font-semibold",
              id === t.id ? "bg-primary text-primary-fg" : "bg-elevated",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {CERT_LOOP.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s)}
            className={cn(
              "min-h-11 rounded-full px-3 text-xs font-semibold",
              step === s ? "bg-primary text-primary-fg" : "bg-elevated",
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm">{track.card}</p>
      {step === "Flashcards" || step === "Questions" || step === "Mock exam" ? (
        <div className="mt-3 space-y-2">
          <p className="text-sm font-semibold">{track.prompt}</p>
          {[track.ok, track.no].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setPick(label)}
              className={cn(
                "flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm",
                pick === label ? "bg-primary text-primary-fg" : "bg-elevated",
              )}
            >
              {label}
            </button>
          ))}
          {pick ? (
            <p className="text-sm text-muted">{pick === track.ok ? "Keep that. Then the official outline." : "Wrong room. Read the card again."}</p>
          ) : null}
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={mark} className="min-h-11 rounded-full bg-elevated px-4 text-xs font-semibold">
          Mark {step} done
        </button>
        <a href={track.href} target={track.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="text-xs font-semibold text-primary">
          Official {track.label}
        </a>
        <span className="text-xs text-subtle">{steps.length}/{CERT_LOOP.length} on this device</span>
      </div>
    </section>
  );
}