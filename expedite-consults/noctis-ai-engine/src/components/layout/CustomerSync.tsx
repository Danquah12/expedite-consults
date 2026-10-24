import { useEffect } from "react";
import { loadClinicState, listRoster, saveClinicState } from "@/lib/customer-api";
import { useFeedStore } from "@/lib/feed-store";
import { knowledgeDna } from "@/lib/insight";
import { conceptCounts } from "@/lib/knowledge-gaps";
import { setRoster, setWireLines } from "@/lib/customer-hold";
import type { GoalId } from "@/lib/learn";

const GOALS: GoalId[] = ["job", "exam", "skill", "business", "events", "hobby"];

function snapshot() {
  const now = useFeedStore.getState();
  return {
    learn: now.vibeMix.learn,
    play: now.vibeMix.laugh,
    local: now.vibeMix.local,
    xp: now.xp,
    sparks: now.sparks,
    echoes: now.echosDone,
    goal: now.goal,
    stamps: now.earnedStamps,
    drills: Object.keys(now.drillPassed).filter((id) => now.drillPassed[id]),
    strands: knowledgeDna(now.drillPassed).map((r) => ({ name: r.name, pct: r.pct })),
    crews: now.joinedCrews,
    wire: [] as string[],
    concepts: conceptCounts(now.posts, now.dayWatch, now.drillPassed, now.drillMissed).map((row) => ({
      name: row.name,
      house: row.house,
      passed: row.passed,
      missed: row.missed,
    })),
  };
}

/** Pull the signed-in clinic out of Postgres, then write diet, stamps, drills, and strands back. */
export function CustomerSync() {
  useEffect(() => {
    let stop = false;
    let ready = false;
    void loadClinicState()
      .then((row) => {
        if (stop || !row) return;
        const passed: Record<string, boolean> = {};
        for (const id of row.drills) passed[id] = true;
        useFeedStore.setState({
          vibeMix: { learn: row.learn, laugh: row.play, local: row.local },
          xp: row.xp,
          sparks: row.sparks,
          echosDone: row.echoes,
          goal: GOALS.includes(row.goal as GoalId) ? (row.goal as GoalId) : useFeedStore.getState().goal,
          earnedStamps: row.stamps.length ? row.stamps : useFeedStore.getState().earnedStamps,
          drillPassed: row.drills.length ? { ...useFeedStore.getState().drillPassed, ...passed } : useFeedStore.getState().drillPassed,
          joinedCrews: row.crews.length ? row.crews : useFeedStore.getState().joinedCrews,
        });
        if (row.wire.length) setWireLines(row.wire);
      })
      .catch(() => undefined)
      .finally(() => {
        ready = true;
        if (!stop) {
          void saveClinicState({ data: snapshot() })
            .catch(() => undefined)
            .finally(() => {
              if (stop) return;
              void listRoster()
                .then((roster) => {
                  if (!stop) setRoster(roster);
                })
                .catch(() => undefined);
            });
        }
      });

    let timer = 0;
    const unsub = useFeedStore.subscribe((state, prev) => {
      if (!ready) return;
      if (
        state.vibeMix === prev.vibeMix &&
        state.xp === prev.xp &&
        state.earnedStamps === prev.earnedStamps &&
        state.drillPassed === prev.drillPassed &&
        state.drillMissed === prev.drillMissed &&
        state.dayWatch === prev.dayWatch &&
        state.joinedCrews === prev.joinedCrews &&
        state.sparks === prev.sparks &&
        state.echosDone === prev.echosDone &&
        state.goal === prev.goal
      ) {
        return;
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void saveClinicState({ data: snapshot() }).catch(() => undefined);
      }, 700);
    });
    return () => {
      stop = true;
      ready = false;
      unsub();
      window.clearTimeout(timer);
    };
  }, []);
  return null;
}
