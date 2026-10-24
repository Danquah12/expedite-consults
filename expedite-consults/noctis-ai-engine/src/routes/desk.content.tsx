import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { listIngestLog, listMods, setMod } from "@/lib/admin-api";
import { DeskHead, DeskOpen } from "@/components/desk/DeskHead";

export const Route = createFileRoute("/desk/content")({ component: DeskContent });

function DeskContent() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listIngestLog>>>([]);
  const [mods, setMods] = useState<Awaited<ReturnType<typeof listMods>>>([]);
  const load = () => {
    void listIngestLog().then(setRows).catch(() => setRows([]));
    void listMods().then(setMods).catch(() => setMods([]));
  };
  useEffect(() => {
    load();
  }, []);
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <DeskHead kicker="Content" title="CMS" note="Ledger clips seated on Noctis. Hide, feature, or pin — the clinic reads these holds." />
      <DeskOpen to="/" label="Clinic" />
      <p className="text-xs text-subtle">{mods.length} active mods · {rows.length} ledger rows</p>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.id} className="rounded-2xl bg-surface p-4 shadow-border">
            <p className="text-sm font-semibold">{row.title}</p>
            <p className="mt-1 text-xs text-muted">
              {row.house} · {row.desk ?? "hall"} · {row.youtube_id}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" className="rounded-full bg-elevated px-3 py-1.5 text-[11px] font-semibold" onClick={() => void setMod({ data: { postId: row.post_id, youtubeId: row.youtube_id, status: "hide", note: "Desk hide" } }).then(load)}>
                Hide
              </button>
              <button type="button" className="rounded-full bg-elevated px-3 py-1.5 text-[11px] font-semibold" onClick={() => void setMod({ data: { postId: row.post_id, youtubeId: row.youtube_id, status: "feature", note: "Desk feature" } }).then(load)}>
                Feature
              </button>
              <button type="button" className="rounded-full bg-elevated px-3 py-1.5 text-[11px] font-semibold" onClick={() => void setMod({ data: { postId: row.post_id, youtubeId: row.youtube_id, status: "pin", note: "Desk pin" } }).then(load)}>
                Pin
              </button>
            </div>
          </li>
        ))}
        {!rows.length ? <li className="rounded-2xl bg-surface px-4 py-8 text-center text-sm text-muted">No durable clips yet. Pull from Ledger.</li> : null}
      </ul>
    </div>
  );
}
