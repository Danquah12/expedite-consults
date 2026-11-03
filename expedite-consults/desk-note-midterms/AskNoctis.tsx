import { useEffect, useRef, useState } from "react";

/**
 * "Ask Noctis" popup for Desk Note. Stays on the Desk Note page and calls the Noctis API.
 *
 * Setup in Desk Note:
 *   1. Set VITE_NOCTIS_URL to the Noctis deployment origin, no trailing slash
 *      (the Noctis project must have this site's origin in DESK_NOTE_ORIGINS).
 *   2. Render <AskNoctis /> once, e.g. in the header next to the Settings button.
 *
 * Uses the same Tailwind tokens as the rest of Desk Note.
 */

type Msg = { role: "user" | "assistant"; content: string; sources?: { title: string; source: string; asOf: string }[] };

const NOCTIS_URL: string =
  ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_NOCTIS_URL || "").replace(/\/$/, "");

const SUGGESTIONS = [
  "How is a hearing score calculated?",
  "Who is favored to win the House?",
  "What did the September jobs report say?",
];

export default function AskNoctis({ endpoint = `${NOCTIS_URL}/api/desk-note` }: { endpoint?: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [msgs, busy]);

  async function ask(q: string) {
    const question = q.trim();
    if (!question || busy) return;
    if (!NOCTIS_URL && endpoint.startsWith("/")) {
      setError("Noctis is not connected. Set VITE_NOCTIS_URL.");
      return;
    }
    setError("");
    setText("");
    const history = msgs.slice(-6).map(({ role, content }) => ({ role, content }));
    setMsgs((m) => [...m, { role: "user", content: question }]);
    setBusy(true);
    abortRef.current?.abort();
    const ctl = new AbortController();
    abortRef.current = ctl;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history }),
        signal: ctl.signal,
      });
      const data = (await res.json().catch(() => ({}))) as { answer?: string; error?: string; sources?: Msg["sources"] };
      if (!res.ok || !data.answer) throw new Error(data.error || "Noctis could not answer that.");
      setMsgs((m) => [...m, { role: "assistant", content: data.answer!, sources: data.sources }]);
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError((e as Error).message || "Noctis could not be reached.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-semibold"
      >
        Ask Noctis
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ask-noctis-title"
            className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-card border border-border bg-bg sm:rounded-card"
          >
            <header className="flex items-start justify-between gap-3 border-b border-border p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Answered by Noctis</p>
                <h2 id="ask-noctis-title" className="font-display text-xl font-medium">Ask about Desk Note</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid size-11 place-items-center rounded-lg border border-border bg-surface text-lg"
              >
                ×
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
              {msgs.length === 0 && (
                <div>
                  <p className="text-sm text-muted">
                    Ask how a score works, what a rating means, or what a briefing says. Answers come from Desk Note's notes, not a verdict.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => ask(s)}
                        className="min-h-10 rounded-lg border border-border bg-surface px-3 text-left text-sm font-semibold"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "user"
                      ? "ml-8 rounded-lg bg-primary px-3 py-2 text-sm text-primary-fg"
                      : "mr-8 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  }
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  {m.sources && m.sources.length > 0 && (
                    <p className="mt-2 text-xs text-muted">
                      Based on: {m.sources.map((s) => `${s.title} (${s.asOf})`).join("; ")}
                    </p>
                  )}
                </div>
              ))}

              {busy && <p className="text-sm text-muted">Noctis is answering…</p>}
              {error && (
                <p role="alert" className="rounded-lg border border-border bg-surface px-3 py-2 text-sm">
                  {error}
                </p>
              )}
              <div ref={endRef} />
            </div>

            <form
              className="flex gap-2 border-t border-border p-4"
              onSubmit={(e) => {
                e.preventDefault();
                ask(text);
              }}
            >
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={800}
                placeholder="Ask Noctis about Desk Note"
                aria-label="Question for Noctis"
                className="min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none"
              />
              <button
                type="submit"
                disabled={busy || !text.trim()}
                className="min-h-11 shrink-0 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-fg disabled:opacity-50"
              >
                Ask
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
