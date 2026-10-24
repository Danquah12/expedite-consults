import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { playbackReport, readPlaybackTools, setPlaybackTool } from "@/lib/playback-desk";
import { DeskHead, DeskStat } from "@/components/desk/DeskHead";

export const Route = createFileRoute("/desk/playback")({ component: DeskPlayback });

function DeskPlayback() {
  const [report, setReport] = useState<Awaited<ReturnType<typeof playbackReport>> | null>(null);
  const [tools, setTools] = useState<Awaited<ReturnType<typeof readPlaybackTools>>>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = () => {
    setErr(null);
    void playbackReport()
      .then(setReport)
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : "Playback report unavailable"));
    void readPlaybackTools().then(setTools).catch(() => setTools([]));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <DeskHead
        kicker="Playback"
        title="Autoplay and video"
        note="How films start when they scroll into view, and the switches that keep one player running at a time."
      />

      {err ? <p className="text-xs text-live">{err}</p> : null}

      {report ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <DeskStat label="In view" value={report.focus} />
          <DeskStat label="Started" value={report.started} />
          <DeskStat label="Hit rate" value={`${report.hit}%`} />
          <DeskStat label="Needed a tap" value={report.tapped} />
          <DeskStat label="Slow to start" value={report.stalled} />
          <DeskStat label="Avg start" value={report.avgMs ? `${(report.avgMs / 1000).toFixed(1)}s` : "—"} />
        </div>
      ) : (
        <div className="h-28 animate-pulse rounded-2xl bg-elevated" />
      )}

      <section className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Optimization</p>
        <ul className="space-y-2">
          {tools.map((tool) => (
            <li key={tool.key} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 shadow-border">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{tool.label}</p>
                <p className="text-xs text-muted">{tool.detail}</p>
              </div>
              <button
                type="button"
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${tool.value === "on" ? "bg-primary text-primary-fg" : "bg-elevated text-muted"}`}
                onClick={() =>
                  void setPlaybackTool({ data: { key: tool.key, value: tool.value === "on" ? "off" : "on" } }).then(load)
                }
              >
                {tool.value === "on" ? "On" : "Off"}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-surface px-4 py-3 text-sm leading-relaxed text-muted shadow-border">
        Films begin muted so the browser will autoplay, then sound opens if the hall is unmuted. A start under 4.5s counts as clean. Anything slower is marked slow.
      </section>
    </div>
  );
}
