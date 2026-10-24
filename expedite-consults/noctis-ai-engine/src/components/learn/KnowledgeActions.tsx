import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { HALL_ASKS, hallAnswer } from "@/lib/hall-teach";
import { markMission } from "@/lib/noctis-os";
import type { KnowledgeAsset } from "@/lib/knowledge-asset";
import {
  DISCOVER_CONTENT_ITEMS,
  buildJourneyFromDiscoverContent,
  discoverItemFromKnowledgeAsset,
  linkContentToJourney,
  readDiscoverJourneyState,
  writeDiscoverJourneyState,
} from "@/lib/discover-journey-bridge";
import { JOURNEY_PATHS, pathForTopic, readJourney, writeJourney } from "@/lib/journey-paths";

type Ask = (typeof HALL_ASKS)[number];

export function KnowledgeActions({
  asset,
  asks = HALL_ASKS,
  groups,
}: {
  asset: KnowledgeAsset;
  asks?: readonly Ask[];
  groups?: { label: string; asks: readonly Ask[] }[];
}) {
  const [note, setNote] = useState("");
  const [shots, setShots] = useState<{ src: string; title: string }[]>([]);
  const rows = groups ?? [{ label: "", asks }];

  function run(label: Ask) {
    if (label === "Add to journey") {
      markMission("ask");
      const discoverItem = discoverItemFromKnowledgeAsset(asset);
      const store = readJourney();
      const id = store.activeId || store.subjectId || "web";
      const activeJourney =
        store.custom && store.custom.id === id
          ? store.custom
          : JOURNEY_PATHS.find((p) => p.id === id) ?? pathForTopic(store.topic || id);
      const bridge = readDiscoverJourneyState();
      const res = linkContentToJourney(bridge, discoverItem.id, activeJourney, {
        catalog: [discoverItem, ...DISCOVER_CONTENT_ITEMS],
      });
      if (res.ok) {
        writeDiscoverJourneyState(res.state);
        setNote(
          `“${asset.title}” is now linked on your journey (${activeJourney.subject} → ${res.link?.lessonId}). Open My Journey to study it alongside your lessons.`,
        );
      } else {
        setNote(res.error || `“${asset.title}” is on your journey.`);
      }
      setShots([]);
      return;
    }
    const answer = hallAnswer(asset.title, label, {
      careers: asset.careerTags,
      certs: asset.certificationTags,
    });
    setNote(answer.text);
    setShots(answer.shots);
  }

  function handleBuildJourneyFromAsset() {
    markMission("ask");
    const discoverItem = discoverItemFromKnowledgeAsset(asset);
    const store = readJourney();
    const bridge = readDiscoverJourneyState();
    const built = buildJourneyFromDiscoverContent(bridge, discoverItem.id, [
      discoverItem,
      ...DISCOVER_CONTENT_ITEMS,
    ]);
    if (built.ok && built.journey) {
      writeDiscoverJourneyState(built.state);
      writeJourney({
        ...store,
        seen: true,
        activeId: built.journey.id,
        subjectId: built.journey.id,
        topic: built.journey.subject,
        custom: built.journey,
        activeJourneys: Array.from(
          new Set([built.journey.id, ...(store.activeJourneys ?? [])]),
        ),
      });
      setNote(
        `Noctis built a 5-stage “${built.journey.subject}” learning journey from “${asset.title}” and attached this report to Module 1 on your journey.`,
      );
      setShots([]);
    }
  }

  return (
    <div>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label || "asks"}>
            {row.label ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                {row.label}
              </p>
            ) : null}
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {row.asks.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => run(label)}
                  className="inline-flex min-h-9 items-center rounded-full border border-[#e4b86a]/50 bg-elevated px-3 text-[11px] font-semibold"
                >
                  {label}
                </button>
              ))}
              {row.asks.includes("Add to journey") ? (
                <button
                  type="button"
                  onClick={handleBuildJourneyFromAsset}
                  className="inline-flex min-h-9 items-center rounded-full bg-primary px-3 text-[11px] font-semibold text-primary-fg"
                >
                  Build a Journey
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      {note ? (
        <div className="mt-3 rounded-2xl bg-elevated p-3 text-sm leading-relaxed">
          {shots.length ? (
            <div className="mb-3 grid grid-cols-2 gap-2">
              {shots.map((shot) => (
                <img
                  key={shot.src}
                  src={shot.src}
                  alt={shot.title}
                  className="aspect-video w-full rounded-xl object-cover"
                />
              ))}
            </div>
          ) : null}
          <p className="whitespace-pre-wrap">{note}</p>
          {note.includes("on your journey") ? (
            <Link
              to="/start"
              search={{ door: "journey" }}
              className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
            >
              Open My Journey →
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}