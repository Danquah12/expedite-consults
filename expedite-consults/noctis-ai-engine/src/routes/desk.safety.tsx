import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { decideCase, listCases } from "@/lib/command-api";
import { SAFETY_CATS } from "@/lib/command-catalog";
import { DeskHead } from "@/components/desk/DeskHead";
import { safetySignal } from "@/lib/safety-signal";

export const Route = createFileRoute("/desk/safety")({ component: DeskSafety });

function DeskSafety() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listCases>>>([]);
  const [cat, setCat] = useState<string>("all");
  const [pick, setPick] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [screen, setScreen] = useState("");
  const [held, setHeld] = useState<string | null>(null);
  const load = () => void listCases().then(setRows).catch(() => setRows([]));
  useEffect(() => {
    load();
  }, []);
  const filtered = useMemo(() => (cat === "all" ? rows : rows.filter((r) => r.category === cat)), [rows, cat]);
  const item = rows.find((r) => r.id === pick) ?? null;
  const counts = SAFETY_CATS.map((c) => ({ ...c, n: rows.filter((r) => r.category === c.id).length || c.seed }));

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <DeskHead kicker="Trust & safety" title="Moderation queue" note="A machine can hold a report. It cannot hide, ban, or close a case. A person writes the decision, and the member can appeal." />
      <section className="rounded-2xl bg-surface p-4 shadow-border">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Screen a report</p>
        <p className="mt-1 text-sm text-muted">Looks for spam, scams, harassment, bullying, dangerous medical claims, coordinated pile-ons, fake identity, and requests for harm. Manipulated media is not judged from words. A person has to watch the file.</p>
        <textarea value={screen} onChange={(event) => setScreen(event.target.value)} className="mt-3 min-h-24 w-full rounded-xl bg-elevated px-3 py-2 text-sm" placeholder="Paste the reported words" />
        <button
          type="button"
          onClick={() => {
            const hit = safetySignal(screen);
            setHeld(hit ? `${hit.kind}. ${hit.why} ${hit.hold}` : "No signal. That is not a finding that the text is fine. A person can still open a case.");
          }}
          className="mt-2 min-h-11 rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg"
        >
          Hold for review
        </button>
        {held ? <p className="mt-2 text-sm leading-relaxed">{held}</p> : null}
      </section>
      <div className="flex flex-wrap gap-1">
        <button type="button" onClick={() => setCat("all")} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${cat === "all" ? "bg-primary text-primary-fg" : "bg-elevated text-muted"}`}>
          All
        </button>
        {counts.map((c) => (
          <button key={c.id} type="button" onClick={() => setCat(c.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${cat === c.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted"}`}>
            {c.label} {c.n}
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <ul className="space-y-2">
          {filtered.map((row) => (
            <li key={row.id}>
              <button type="button" onClick={() => setPick(row.id)} className={`w-full rounded-2xl bg-surface p-4 text-left shadow-border ${pick === row.id ? "ring-1 ring-primary" : ""}`}>
                <p className="text-sm font-semibold">{row.case_no}</p>
                <p className="mt-1 text-xs text-muted">
                  {row.category} · {row.priority} · {row.status} · {row.reports} reports · AI {row.ai_score ?? "—"}
                </p>
              </button>
            </li>
          ))}
        </ul>
        <aside className="h-fit rounded-2xl bg-surface p-4 shadow-border">
          {item ? (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Case</p>
              <p className="mt-2 text-sm font-semibold">{item.case_no}</p>
              <p className="mt-2 text-sm text-muted">{item.reason}</p>
              <p className="mt-2 text-xs text-subtle">
                {item.target_kind} · {item.target_id}
              </p>
              <form
                className="mt-4 space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setMsg(null);
                  void decideCase({ data: { id: item.id, status: "actioned", note } })
                    .then(() => {
                      setNote("");
                      setMsg("Decision logged.");
                      load();
                    })
                    .catch((err: unknown) => setMsg(err instanceof Error ? err.message : "Failed"));
                }}
              >
                <textarea className="min-h-24 w-full rounded-xl bg-elevated p-3 text-sm" placeholder="Decision note (required)" value={note} onChange={(e) => setNote(e.target.value)} required />
                <button type="submit" className="flex min-h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-fg">
                  Action and log
                </button>
                <button
                  type="button"
                  className="flex min-h-11 w-full items-center justify-center rounded-xl bg-elevated text-sm font-semibold"
                  onClick={() => void decideCase({ data: { id: item.id, status: "closed", note: note || "No violation" } }).then(load)}
                >
                  Close — no violation
                </button>
                {msg ? <p className="text-xs text-muted">{msg}</p> : null}
              </form>
            </>
          ) : (
            <p className="text-sm text-muted">Pick a case.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
