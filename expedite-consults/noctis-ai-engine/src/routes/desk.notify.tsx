import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { listNotes } from "@/lib/admin-api";
import { listSettings, setSetting } from "@/lib/command-api";
import { NOTIFY_TEMPLATES } from "@/lib/command-catalog";
import { DeskHead } from "@/components/desk/DeskHead";

export const Route = createFileRoute("/desk/notify")({ component: DeskNotify });

function DeskNotify() {
  const [settings, setSettings] = useState<Awaited<ReturnType<typeof listSettings>>>([]);
  const [notes, setNotes] = useState<Awaited<ReturnType<typeof listNotes>>>([]);
  const load = () => {
    void listSettings().then(setSettings).catch(() => setSettings([]));
    void listNotes().then(setNotes).catch(() => setNotes([]));
  };
  useEffect(() => {
    load();
  }, []);
  const hold = settings.find((s) => s.key === "comment_hold")?.value ?? "off";
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <DeskHead
        kicker="Notifications"
        title="Signals"
        note="Templates the clinic can send. Private messages are never listed here. A reported message appears only as an ID on Trust & safety."
      />
      <section className="rounded-2xl bg-surface p-4 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Comment hold</p>
        <p className="mt-2 text-sm text-muted">New comments wait for review when this is on.</p>
        <button
          type="button"
          className="mt-3 rounded-full bg-elevated px-3 py-1.5 text-xs font-semibold"
          onClick={() => void setSetting({ data: { key: "comment_hold", value: hold === "on" ? "off" : "on" } }).then(load)}
        >
          {hold === "on" ? "Holding comments" : "Comments live"}
        </button>
      </section>
      <ul className="space-y-2">
        {notes.slice(0, 8).map((row) => (
          <li key={row.id} className="rounded-2xl bg-surface px-4 py-3 shadow-border">
            <p className="text-sm font-semibold">{row.author}</p>
            <p className="mt-1 text-sm text-muted">{row.body}</p>
          </li>
        ))}
        {NOTIFY_TEMPLATES.map((t) => (
          <li key={t.id} className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3 shadow-border">
            <span className="text-sm">{t.label}</span>
            <span className="text-[11px] uppercase tracking-wide text-subtle">{t.channel}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
