import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { listIngestLog, setMod } from "@/lib/admin-api";
import { pullClinic } from "@/lib/ingest-api";
import { pullSlot } from "@/lib/ingest-sources";
import { visitorSeed } from "@/lib/shuffle";
import { useFeedStore } from "@/lib/feed-store";

export const Route = createFileRoute("/desk/ledger")({ component: DeskLedger });

function DeskLedger() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listIngestLog>>>([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const load = () => void listIngestLog().then(setRows).catch(() => setRows([]));
  useEffect(() => {
    load();
  }, []);

  async function pullNow() {
    setBusy(true);
    setNote(null);
    try {
      const res = await pullClinic({ data: { slot: pullSlot(), salt: visitorSeed("desk") } });
      if (res.ok) {
        useFeedStore.getState().absorbIngest(res.posts, res.rows);
        setNote(`${res.rows.length} clips seated into Noctis`);
      } else setNote(res.error);
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Ledger</p>
          <h1 className="mt-1 font-sans text-2xl font-semibold">What Noctis is seating</h1>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void pullNow()}
          className="min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
        >
          {busy ? "Pulling…" : "Pull into Noctis now"}
        </button>
      </header>
      {note ? <p className="text-xs text-muted">{note}</p> : null}
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.id} className="rounded-2xl bg-surface p-4 shadow-border">
            <p className="text-sm font-semibold">{row.title}</p>
            <p className="mt-1 text-xs text-muted">
              {row.house} · {row.desk ?? "hall"} · slot {row.slot}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="rounded-full bg-elevated px-3 py-1.5 text-[11px] font-semibold"
                onClick={() => void setMod({ data: { postId: row.post_id, youtubeId: row.youtube_id, status: "hide" } }).then(load)}
              >
                Hide on Noctis
              </button>
              <button
                type="button"
                className="rounded-full bg-elevated px-3 py-1.5 text-[11px] font-semibold"
                onClick={() => void setMod({ data: { postId: row.post_id, youtubeId: row.youtube_id, status: "feature" } }).then(load)}
              >
                Feature
              </button>
            </div>
          </li>
        ))}
        {!rows.length ? <li className="rounded-2xl bg-surface px-4 py-8 text-center text-sm text-muted">No durable ledger rows yet. Pull to seat clips.</li> : null}
      </ul>
    </div>
  );
}
