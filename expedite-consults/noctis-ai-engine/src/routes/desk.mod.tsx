import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { clearMod, listMods } from "@/lib/admin-api";
import { useFeedStore } from "@/lib/feed-store";

export const Route = createFileRoute("/desk/mod")({ component: DeskMod });

function DeskMod() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listMods>>>([]);
  const load = () => void listMods().then(setRows).catch(() => setRows([]));
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    rows.filter((r) => r.status === "hide" && r.youtube_id).forEach((r) => useFeedStore.getState().dropGatedYoutube(r.youtube_id!));
  }, [rows]);
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Moderation</p>
        <h1 className="mt-1 font-sans text-2xl font-semibold">Pins, hides, features</h1>
        <p className="mt-2 text-sm text-muted">Hides apply to Noctis immediately. This list is the desk record, not a clinic tab.</p>
      </header>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 shadow-border">
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-wide">{row.status}</p>
              <p className="truncate text-xs text-muted">{row.post_id}</p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-full bg-elevated px-3 py-1.5 text-[11px] font-semibold"
              onClick={() => void clearMod({ data: row.id }).then(load)}
            >
              Clear
            </button>
          </li>
        ))}
        {!rows.length ? <li className="rounded-2xl bg-surface px-4 py-8 text-center text-sm text-muted">No moderation yet.</li> : null}
      </ul>
    </div>
  );
}
