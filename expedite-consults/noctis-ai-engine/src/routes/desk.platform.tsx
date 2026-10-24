import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { listFlags, listSettings, setFlag, setSetting } from "@/lib/command-api";
import { DeskHead } from "@/components/desk/DeskHead";
import { APPROVED_SOURCES } from "@/lib/approved-sources";

export const Route = createFileRoute("/desk/platform")({ component: DeskPlatform });

function DeskPlatform() {
  const [flags, setFlags] = useState<Awaited<ReturnType<typeof listFlags>>>([]);
  const [settings, setSettings] = useState<Awaited<ReturnType<typeof listSettings>>>([]);
  const load = () => {
    void listFlags().then(setFlags).catch(() => setFlags([]));
    void listSettings().then(setSettings).catch(() => setSettings([]));
  };
  useEffect(() => {
    load();
  }, []);
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <DeskHead kicker="Platform" title="Flags and configuration" note="Release a surface to a percent of visitors without rebuilding the clinic. Outside services cannot register themselves." />
      <section className="rounded-2xl bg-surface p-4 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Approved sources</p>
        <ul className="mt-2 space-y-2">
          {APPROVED_SOURCES.map((source) => (
            <li key={source.id}>
              <p className="text-sm font-semibold">{source.name} · {source.state}</p>
              <p className="text-xs text-muted">{source.line}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Feature flags</p>
        <ul className="space-y-2">
          {flags.map((f) => (
            <li key={f.key} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-surface px-4 py-3 shadow-border">
              <div>
                <p className="text-sm font-semibold">{f.label}</p>
                <p className="text-xs text-muted">
                  {f.state} · {f.pct}%
                </p>
              </div>
              <div className="flex gap-1">
                {(["on", "beta", "off"] as const).map((state) => (
                  <button
                    key={state}
                    type="button"
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${f.state === state ? "bg-primary text-primary-fg" : "bg-elevated text-muted"}`}
                    onClick={() => void setFlag({ data: { key: f.key, state, pct: state === "off" ? 0 : state === "beta" ? 25 : 100 } }).then(load)}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Registration and limits</p>
        <ul className="space-y-2">
          {settings.map((s) => (
            <li key={s.key} className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 shadow-border">
              <span className="text-sm">{s.key.replaceAll("_", " ")}</span>
              <button
                type="button"
                className="rounded-full bg-elevated px-3 py-1.5 text-[11px] font-semibold"
                onClick={() => {
                  const next = window.prompt(s.key, s.value);
                  if (next != null && next !== s.value) void setSetting({ data: { key: s.key, value: next } }).then(load);
                }}
              >
                {s.value}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
