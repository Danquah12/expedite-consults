import { useEffect, useState } from "react";
import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { Button } from "@/components/ui/button";
import { HallSpread } from "@/components/learn/HallSpread";
import { BATTLE_BANK } from "@/lib/insight";
import { hallsOn } from "@/lib/hall-surfaces";
import { XP } from "@/lib/learn";
import { useFeedStore } from "@/lib/feed-store";
import { cn } from "@/lib/utils";
import type { ClinicDeskId } from "@/lib/ingest-sources";

export const Route = createFileRoute("/battle")({ component: BattlePage });

function BattlePage() {
  const awardXp = useFeedStore((s) => s.awardXp);
  const clinicDesk = useFeedStore((s) => s.clinicDesk);
  const hash = useRouterState({ select: (s) => s.location.hash.replace("#", "") });
  const battleHalls = hallsOn("battle");
  const start =
    battleHalls.some((h) => h.id === hash) ? hash : battleHalls.some((h) => h.id === clinicDesk) ? clinicDesk : battleHalls[0]!.id;
  const [hall, setHall] = useState(start);
  const [pick, setPick] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const q = BATTLE_BANK.find((b) => b.hall === hall) ?? BATTLE_BANK[0]!;
  const ok = q.options.find((o) => o.id === pick)?.ok;

  useEffect(() => {
    if (hallsOn("battle").some((h) => h.id === hash)) {
      setHall(hash);
      setPick(null);
      setDone(false);
    }
  }, [hash]);

  return (
    <AppShell>
      <ClinicFrame>
        <header className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Study · Battle</p>
          <h1 className="mt-1 font-display text-2xl font-semibold">Hall vs hall</h1>
          <p className="mt-2 text-sm text-muted">One question per hall. No comments. Pass it for XP.</p>
          <Link to="/study" search={{ desk: undefined, family: undefined, step: undefined }} className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
            Back to Study
          </Link>
        </header>
        <HallSpread
          tab="battle"
          active={hall}
          onPick={(id: ClinicDeskId) => {
            setHall(id);
            setPick(null);
            setDone(false);
          }}
        />
        <section className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-sm font-semibold">{q.prompt}</p>
          <div className="mt-3 space-y-1.5">
            {q.options.map((o) => (
              <button
                key={o.id}
                type="button"
                disabled={done}
                onClick={() => setPick(o.id)}
                className={cn(
                  "w-full rounded-xl px-3 py-2 text-left text-sm",
                  pick === o.id ? "bg-primary text-primary-fg" : "bg-elevated hover:bg-bg",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
          <Button
            className="mt-4 w-full"
            disabled={!pick || done}
            onClick={() => {
              setDone(true);
              if (ok) awardXp(XP.drill);
            }}
          >
            {done ? (ok ? "Correct — XP in" : "Wrong. Rewatch the Spark.") : "Lock in"}
          </Button>
        </section>
      </ClinicFrame>
    </AppShell>
  );
}
