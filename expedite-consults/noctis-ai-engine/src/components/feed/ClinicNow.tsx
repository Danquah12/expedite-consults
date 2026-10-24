import { useState } from "react";
import { StoriesTray } from "@/components/feed/StoriesTray";
import { BeingWatched } from "@/components/feed/BeingWatched";
import { ListenRail } from "@/components/feed/ListenRail";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "sparks", label: "Sparks" },
  { id: "watched", label: "Watched" },
  { id: "listen", label: "Listen" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export function ClinicNow() {
  const [tab, setTab] = useState<Tab>("sparks");

  return (
    <section className="rounded-2xl bg-surface p-3 shadow-border">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Now</p>
        <div className="flex rounded-full bg-elevated p-0.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-semibold",
                tab === t.id ? "bg-surface text-fg shadow-border" : "text-muted",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3">
        {tab === "sparks" ? <StoriesTray /> : tab === "watched" ? <BeingWatched bare /> : <ListenRail bare />}
      </div>
    </section>
  );
}
