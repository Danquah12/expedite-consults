import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { listMods, setMod } from "@/lib/admin-api";
import { HYMN_ROOMS, HYMNS } from "@/lib/hymn-desk";
import { DeskOpen } from "@/components/desk/DeskHead";

export const Route = createFileRoute("/desk/music")({ component: DeskMusic });

function DeskMusic() {
  const [featured, setFeatured] = useState<Set<string>>(new Set());
  const load = () =>
    void listMods()
      .then((rows) => setFeatured(new Set(rows.filter((r) => r.status === "feature").map((r) => r.post_id))))
      .catch(() => setFeatured(new Set()));
  useEffect(() => {
    load();
  }, []);
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Music</p>
        <h1 className="mt-1 font-sans text-2xl font-semibold">Hymn library on Noctis</h1>
        <p className="mt-2 text-sm text-muted">{HYMNS.length} lessons · {HYMN_ROOMS.length - 1} rooms. Feature a hymn and Noctis seats it first.</p>
      </header>
      <DeskOpen to="/music" label="Music" />
      <ul className="space-y-2">
        {HYMNS.map((h) => (
          <li key={h.id} className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 shadow-border">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{h.title}</p>
              <p className="text-xs text-muted">
                {h.writer} · {h.year} · {h.rights === "pd" ? "public-domain text" : "embed"}
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-full bg-elevated px-3 py-1.5 text-[11px] font-semibold"
              onClick={() => void setMod({ data: { postId: h.id, youtubeId: h.youtubeId, status: "feature" } }).then(load)}
            >
              {featured.has(h.id) ? "Featured" : "Feature"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
