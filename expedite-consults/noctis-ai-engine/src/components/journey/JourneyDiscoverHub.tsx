import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  Bookmark,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Compass,
  Cpu,
  FileCheck2,
  FileText,
  Globe,
  GraduationCap,
  HelpCircle,
  Layers,
  Play,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  Wrench,
  X,
} from "lucide-react";
import {
  CAREER_OCCUPATIONS,
  CERTIFICATION_READINESS_TRACKS,
  DISCOVER_CONTENT_ITEMS,
  PRACTICAL_SIMULATIONS,
  getJourneyRecommendations,
  linkContentToJourney,
  markDiscoverItemReviewed,
  readDiscoverJourneyState,
  removeContentLink,
  toggleSaveForLaterDiscoverItem,
  writeDiscoverJourneyState,
  type DiscoverContentItem,
  type DiscoverJourneyBridgeState,
} from "@/lib/discover-journey-bridge";
import {
  JOURNEY_PATHS,
  computeJourneyIndicators,
  type JourneyLesson,
  type JourneyModule,
  type JourneyPath,
  type JourneyStore,
} from "@/lib/journey-paths";
import { cn } from "@/lib/utils";

type CapabilityTab =
  | "matching"
  | "career"
  | "simulator"
  | "passport"
  | "ask"
  | "retention"
  | "crews"
  | "cert-readiness"
  | "multilingual"
  | "verification";

const TEN_CAPABILITY_TABS: {
  id: CapabilityTab;
  num: number;
  label: string;
  shortTitle: string;
  benefit: string;
}[] = [
  {
    id: "matching",
    num: 1,
    label: "1. Content-to-Course Match",
    shortTitle: "Intelligent content-to-course matching",
    benefit: "Discover and Journey stay connected.",
  },
  {
    id: "career",
    num: 2,
    label: "2. Career Journey Builder",
    shortTitle: "Career Journey Builder",
    benefit: "Connects learning to employment and career development.",
  },
  {
    id: "simulator",
    num: 3,
    label: "3. Practical Skills Simulator",
    shortTitle: "Practical Skills Simulator",
    benefit: "Users practise doing, not just watching.",
  },
  {
    id: "passport",
    num: 4,
    label: "4. Skills Passport",
    shortTitle: "Skills Passport",
    benefit: "Learners can show evidence of their abilities.",
  },
  {
    id: "ask",
    num: 5,
    label: "5. Ask Noctis in Lesson",
    shortTitle: "Ask Noctis About Anything in a Lesson",
    benefit: "Turns passive content into interactive learning.",
  },
  {
    id: "retention",
    num: 6,
    label: "6. Retention Coach",
    shortTitle: "Knowledge Retention Coach",
    benefit: "Measures lasting understanding, not just immediate quiz scores.",
  },
  {
    id: "crews",
    num: 7,
    label: "7. Study Crews & Mentors",
    shortTitle: "Study Crews and Mentors",
    benefit: "Makes learning social and collaborative.",
  },
  {
    id: "cert-readiness",
    num: 8,
    label: "8. Certification Readiness",
    shortTitle: "Certification Readiness Centre",
    benefit: "Makes certification preparation structured and measurable.",
  },
  {
    id: "multilingual",
    num: 9,
    label: "9. Multilingual & Accessible",
    shortTitle: "Multilingual and Accessible Learning",
    benefit: "Expands access to more learners (Ghana, US & global).",
  },
  {
    id: "verification",
    num: 10,
    label: "10. Quality & Verification",
    shortTitle: "Learning Quality and Source Verification",
    benefit: "Improves trust and reduces misleading learning content.",
  },
];

export function JourneyDiscoverHub({
  path,
  activeModule,
  activeLesson,
  store,
  onResumeLesson,
  onBuildPath,
  onSelectSubject,
  onOpenDiscover,
  onOpenNoctisTutor,
}: {
  path: JourneyPath;
  activeModule: JourneyModule;
  activeLesson: JourneyLesson;
  store: JourneyStore;
  onResumeLesson: () => void;
  onBuildPath: (topic: string) => void;
  onSelectSubject: (target: JourneyPath) => void;
  onOpenDiscover?: () => void;
  onOpenNoctisTutor: (promptText: string) => void;
}) {
  const [bridge, setBridge] = useState<DiscoverJourneyBridgeState>(() =>
    readDiscoverJourneyState(),
  );
  const [inlineItem, setInlineItem] = useState<DiscoverContentItem | null>(null);
  const [capTab, setCapTab] = useState<CapabilityTab>("career");
  const [selectedCareerId, setSelectedCareerId] = useState<string>(
    CAREER_OCCUPATIONS[0]!.id,
  );
  const [selectedSimId, setSelectedSimId] = useState<string>(
    PRACTICAL_SIMULATIONS[0]!.id,
  );
  const [simOptionId, setSimOptionId] = useState<string | null>(null);
  const [selectedCertId, setSelectedCertId] = useState<string>(
    CERTIFICATION_READINESS_TRACKS[0]!.id,
  );
  const [language, setLanguage] = useState<"English" | "Twi" | "Français" | "Español">(
    "English",
  );
  const [playbackSpeed, setPlaybackSpeed] = useState<"0.75x" | "1.0x" | "1.25x" | "1.5x">(
    "1.0x",
  );
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [joinedCrewIds, setJoinedCrewIds] = useState<string[]>([
    "crew-cloud",
    "crew-trades",
  ]);
  const [notice, setNotice] = useState<string>("");

  useEffect(() => {
    setBridge(readDiscoverJourneyState());
    const onSync = () => setBridge(readDiscoverJourneyState());
    window.addEventListener("vibe-discover-journey-sync", onSync);
    return () => window.removeEventListener("vibe-discover-journey-sync", onSync);
  }, []);

  function updateBridge(next: DiscoverJourneyBridgeState) {
    setBridge(next);
    writeDiscoverJourneyState(next);
  }

  const recommendations = useMemo(
    () =>
      getJourneyRecommendations(
        path,
        activeModule,
        activeLesson,
        store,
        bridge,
      ),
    [path, activeModule, activeLesson, store, bridge],
  );

  const indicators = useMemo(
    () => computeJourneyIndicators(path, store),
    [path, store],
  );

  const passedSet = useMemo(
    () => new Set(store.checks[path.id] ?? []),
    [store.checks, path.id],
  );
  const nextIncompleteModule =
    path.modules.find((m) => !passedSet.has(m.id)) ?? activeModule;
  const nextIncompleteLesson =
    nextIncompleteModule.lessons[0] ?? activeLesson;

  const relatedPaths = useMemo(
    () => JOURNEY_PATHS.filter((p) => p.id !== path.id).slice(0, 4),
    [path.id],
  );

  const activeCareer =
    CAREER_OCCUPATIONS.find((c) => c.id === selectedCareerId) ??
    CAREER_OCCUPATIONS[0]!;
  const activeSim =
    PRACTICAL_SIMULATIONS.find((s) => s.id === selectedSimId) ??
    PRACTICAL_SIMULATIONS[0]!;
  const activeCert =
    CERTIFICATION_READINESS_TRACKS.find((c) => c.id === selectedCertId) ??
    CERTIFICATION_READINESS_TRACKS[0]!;

  return (
    <div className="space-y-5">
      {/* =====================================================================
          JOURNEY — THE LEARNING WORKSPACE: THREE CORE CONNECTED SECTIONS
          1. Continue learning
          2. Content for your journey (from Discover, with "Why relevant")
          3. Explore your next step
         ===================================================================== */}
      <section className="rounded-[1.6rem] border border-[#2D3B50] bg-[#111A29] p-5 shadow-xl md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2B3E] pb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#F2C567]">
              Discover ↔ Journey Learning Workspace
            </p>
            <h2 className="mt-0.5 font-display text-xl font-bold text-[#F5F7FB] md:text-2xl">
              Your Active Learning Workspace · {path.subject}
            </h2>
            <p className="mt-0.5 text-xs text-[#A9B6C9]">
              Resume your next incomplete lesson, study lesson-aware resources linked from Discover without losing your place, or explore your next career step.
            </p>
          </div>
          {onOpenDiscover ? (
            <button
              type="button"
              onClick={onOpenDiscover}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#F2C567]/50 bg-[#F2C567]/12 px-4 text-xs font-semibold text-[#F2C567] hover:bg-[#F2C567]/20"
            >
              <Compass className="size-4" /> Open Discover Exploration Screen ↗
            </button>
          ) : null}
        </div>

        {notice ? (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-3.5 py-2 text-xs text-emerald-200">
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              className="font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        ) : null}

        {/* SECTION 1: CONTINUE LEARNING */}
        <div className="mt-4 rounded-2xl border border-[#F2C567]/45 bg-gradient-to-r from-[#172336] via-[#131E2E] to-[#1D1A14] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F2C567]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F2C567]">
                Section 1 · Continue Learning
              </span>
              <h3 className="mt-1.5 text-base font-bold text-[#F5F7FB] md:text-lg">
                Next Incomplete Lesson: {nextIncompleteModule.title} →{" "}
                <span className="text-[#F2C567]">{nextIncompleteLesson.title}</span>
              </h3>
              <p className="mt-1 text-xs text-[#B6C2D4]">
                {nextIncompleteModule.summary} · Mastery Tier:{" "}
                <strong className="text-[#F2C567]">{indicators.masteryTier}</strong>{" "}
                ({indicators.knowledgeMasteryPct}% verified)
              </p>
            </div>
            <button
              type="button"
              onClick={onResumeLesson}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-[#F2C567] to-[#E5B14C] px-5 text-xs font-semibold text-[#1a1408] shadow-md transition hover:brightness-105"
            >
              <Play className="size-4 fill-current" /> Resume Lesson Now
            </button>
          </div>
        </div>

        {/* SECTION 2: CONTENT FOR YOUR JOURNEY (Recommended & Linked from Discover) */}
        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#F2C567]">
                Section 2 · Content for Your Journey (From Discover)
              </span>
              <p className="mt-0.5 text-xs text-[#A9B6C9]">
                Videos, articles, slides, and practical demonstrations matched to{" "}
                <strong className="text-[#F5F7FB]">{path.subject}</strong> and{" "}
                <strong className="text-[#F2C567]">{activeLesson.title}</strong>. Open any resource inline without losing your lesson position.
              </p>
            </div>
            <span className="rounded-full border border-[#2D3B50] bg-[#0B1220] px-3 py-1 text-[11px] font-semibold text-[#D8E1EE]">
              {recommendations.filter((r) => r.isLinkedToJourney).length} linked ·{" "}
              {recommendations.length} recommended
            </span>
          </div>

          <div className="mt-3 grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
            {recommendations.map((rec) => {
              const { item } = rec;
              return (
                <article
                  key={item.id}
                  className={cn(
                    "flex flex-col justify-between rounded-2xl border p-4 transition",
                    rec.isLinkedToJourney
                      ? "border-[#F2C567] bg-[#152033]"
                      : "border-[#263449] bg-[#0B1220] hover:border-[#F2C567]/50",
                  )}
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="rounded-full border border-[#2D3B50] bg-[#111A29] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F2C567]">
                        {item.type} · {item.skillLevel}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {rec.isLinkedToJourney ? (
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                            Linked to Journey
                          </span>
                        ) : null}
                        {rec.isReviewed ? (
                          <span className="rounded-full bg-[#F2C567]/20 px-2 py-0.5 text-[10px] font-semibold text-[#F2C567]">
                            Reviewed (Exposure)
                          </span>
                        ) : null}
                        {rec.isSavedForLater ? (
                          <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
                            Saved for later
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <h4 className="mt-2 text-sm font-bold text-[#F5F7FB]">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-xs text-[#9FB0C7]">
                      {item.source.name} · {item.durationOrLength}
                    </p>

                    {/* Mandatory "Why it is relevant to the learner's current goal" */}
                    <div className="mt-2.5 rounded-xl border border-[#223044] bg-[#111A29] p-2.5 text-[11px]">
                      <p className="font-semibold text-[#F2C567]">
                        Why Noctis recommends this for your goal:
                      </p>
                      <p className="mt-0.5 leading-relaxed text-[#D8E1EE]">
                        {rec.whyRecommended}
                      </p>
                      {rec.prerequisiteAlert ? (
                        <p className="mt-1 text-[10px] text-amber-300">
                          {rec.prerequisiteAlert}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Resource Actions (Open Inline, Save for Later, Mark Reviewed, Add/Remove Link) */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-1.5 border-t border-[#1E2B3E] pt-3">
                    <button
                      type="button"
                      onClick={() => setInlineItem(item)}
                      className="inline-flex h-8 items-center gap-1 rounded-xl bg-[#F2C567] px-3 text-[11px] font-semibold text-[#1a1408]"
                    >
                      <Play className="size-3" /> {item.primaryAction} Inline
                    </button>

                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          updateBridge(
                            toggleSaveForLaterDiscoverItem(bridge, item.id),
                          );
                          setNotice(
                            rec.isSavedForLater
                              ? `Removed “${item.title}” from Saved for later.`
                              : `Saved “${item.title}” for later without leaving your lesson.`,
                          );
                        }}
                        className="rounded-lg border border-[#2D3B50] bg-[#141E2D] px-2 py-1 text-[10px] font-semibold text-[#B6C2D4] hover:text-white"
                      >
                        {rec.isSavedForLater ? "Saved ✓" : "Save for later"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateBridge(markDiscoverItemReviewed(bridge, item.id));
                          setNotice(
                            `Marked “${item.title}” as reviewed (recorded as Exposure; pass module check for Mastery).`,
                          );
                        }}
                        className="rounded-lg border border-[#2D3B50] bg-[#141E2D] px-2 py-1 text-[10px] font-semibold text-[#B6C2D4] hover:text-white"
                      >
                        {rec.isReviewed ? "Reviewed ✓" : "Mark reviewed"}
                      </button>

                      {rec.isLinkedToJourney && rec.linkId ? (
                        <button
                          type="button"
                          onClick={() => {
                            updateBridge(removeContentLink(bridge, rec.linkId!));
                            setNotice(
                              `Removed link to “${item.title}” from this Journey (original Discover resource is preserved).`,
                            );
                          }}
                          title="Remove link (preserves original Discover item)"
                          className="rounded-lg border border-rose-500/35 bg-rose-950/30 p-1 text-rose-300 hover:bg-rose-950/50"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const res = linkContentToJourney(
                              bridge,
                              item.id,
                              path,
                              {
                                moduleId: activeModule.id,
                                lessonId: activeLesson.id,
                              },
                            );
                            if (res.ok) {
                              updateBridge(res.state);
                              setNotice(
                                `Linked “${item.title}” to ${activeLesson.title}.`,
                              );
                            } else {
                              setNotice(res.error || "Already linked.");
                            }
                          }}
                          className="rounded-lg border border-[#F2C567]/40 bg-[#F2C567]/10 px-2 py-1 text-[10px] font-semibold text-[#F2C567]"
                        >
                          + Link
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: EXPLORE YOUR NEXT STEP */}
        <div className="mt-5 border-t border-[#1E2B3E] pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#F2C567]">
                Section 3 · Explore Your Next Step
              </span>
              <p className="mt-0.5 text-xs text-[#A9B6C9]">
                Find related courses, advance to an industry certification or skilled trade, or start a new learning path.
              </p>
            </div>
          </div>

          <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedPaths.map((rel) => (
              <button
                key={rel.id}
                type="button"
                onClick={() => onSelectSubject(rel)}
                className="flex flex-col justify-between rounded-2xl border border-[#263449] bg-[#0B1220] p-3.5 text-left transition hover:border-[#F2C567]"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F2C567]">
                    Related Journey
                  </span>
                  <h4 className="mt-1 text-sm font-bold text-[#F5F7FB]">
                    {rel.subject}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-[11px] text-[#9FB0C7]">
                    {rel.blurb}
                  </p>
                </div>
                <span className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[#F2C567]">
                  Switch or preview path <ArrowRight className="size-3" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          THE 10 RECOMMENDED VIBE / NOCTIS CAPABILITIES SUITE (Screenshots 1–3)
         ===================================================================== */}
      <section className="rounded-[1.6rem] border border-[#2D3B50] bg-[#111A29] p-5 shadow-xl md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#F2C567]">
              10 Core Capabilities · Opportunity, Practice, Proof & Career Progression
            </p>
            <h2 className="mt-0.5 font-display text-xl font-bold text-[#F5F7FB] md:text-2xl">
              Discover Opportunities → Practise Skills → Prove Ability → Advance Careers
            </h2>
          </div>
        </div>

        {/* 10 Capability Selector Pills */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {TEN_CAPABILITY_TABS.map((t) => {
            const active = capTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setCapTab(t.id)}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-xs font-semibold transition",
                  active
                    ? "border-[#F2C567] bg-[#F2C567] text-[#1a1408] shadow-sm"
                    : "border-[#2D3B50] bg-[#0B1220] text-[#B6C2D4] hover:border-[#F2C567]/50 hover:text-[#F5F7FB]",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Active Capability Panel */}
        <div className="mt-4 rounded-2xl border border-[#263449] bg-[#0B1220] p-4 md:p-5">
          {(() => {
            const meta =
              TEN_CAPABILITY_TABS.find((t) => t.id === capTab) ??
              TEN_CAPABILITY_TABS[0]!;
            return (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2B3E] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F2C567]">
                    Capability #{meta.num}
                  </span>
                  <h3 className="text-lg font-bold text-[#F5F7FB]">
                    {meta.shortTitle}
                  </h3>
                </div>
                <span className="rounded-full border border-emerald-500/35 bg-emerald-950/30 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Benefit: {meta.benefit}
                </span>
              </div>
            );
          })()}

          {/* 1. INTELLIGENT CONTENT-TO-COURSE MATCHING */}
          {capTab === "matching" ? (
            <div className="space-y-3 text-xs">
              <p className="text-[#D8E1EE]">
                Noctis recognises when a Discover video, article, slide deck, or trade demonstration relates to an existing course and offers to attach it directly to the matching module and lesson instead of making you start from scratch.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {DISCOVER_CONTENT_ITEMS.filter((i) => i.isEducational)
                  .slice(0, 6)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between rounded-xl border border-[#263449] bg-[#111A29] p-3"
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#F2C567]">
                          {item.type} · {item.topic}
                        </span>
                        <p className="mt-1 font-bold text-[#F5F7FB]">
                          {item.title}
                        </p>
                        <p className="mt-1 text-[11px] text-[#9FB0C7]">
                          Target Course ID: <code>{item.courseId}</code> (Module{" "}
                          {item.suggestedModuleIndex + 1})
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const res = linkContentToJourney(
                            bridge,
                            item.id,
                            path,
                            {
                              moduleId: activeModule.id,
                              lessonId: activeLesson.id,
                            },
                          );
                          if (res.ok) {
                            updateBridge(res.state);
                            setNotice(
                              `Attached “${item.title}” to ${path.subject} → ${activeLesson.title}.`,
                            );
                          } else {
                            setNotice(res.error || "Already attached.");
                          }
                        }}
                        className="mt-3 inline-flex items-center justify-center gap-1 rounded-lg bg-[#F2C567] px-3 py-1.5 text-[11px] font-semibold text-[#1a1408]"
                      >
                        <PlusCircle className="size-3" /> Attach to Current Lesson
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ) : null}

          {/* 2. CAREER JOURNEY BUILDER */}
          {capTab === "career" ? (
            <div className="space-y-4 text-xs">
              <div className="flex flex-wrap gap-2">
                {CAREER_OCCUPATIONS.map((occ) => (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => setSelectedCareerId(occ.id)}
                    className={cn(
                      " inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 font-semibold transition",
                      occ.id === activeCareer.id
                        ? "border-[#F2C567] bg-[#F2C567] text-[#1a1408]"
                        : "border-[#2D3B50] bg-[#111A29] text-[#D8E1EE] hover:border-[#F2C567]/50",
                    )}
                  >
                    <Briefcase className="size-3.5" />
                    {occ.title}
                  </button>
                ))}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-[#263449] bg-[#111A29] p-3.5">
                  <p className="font-bold text-[#F2C567]">
                    Required Core Skills ({activeCareer.title}):
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-[#D8E1EE]">
                    {activeCareer.coreSkills.map((sk) => (
                      <li key={sk}>{sk}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-[#263449] bg-[#111A29] p-3.5">
                  <p className="font-bold text-[#F2C567]">
                    Structured Training & Target Credentials:
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-[#D8E1EE]">
                    {activeCareer.structuredTraining.map((tr) => (
                      <li key={tr}>{tr}</li>
                    ))}
                  </ul>
                  <p className="mt-2 font-semibold text-[#F2C567]">
                    Target Credentials:{" "}
                    <span className="font-normal text-[#D8E1EE]">
                      {activeCareer.targetCredentials.join(" · ")}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-[#263449] bg-[#111A29] p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-[#F2C567]">
                    Practical Experience Milestone:
                  </p>
                  <p className="mt-0.5 text-[#D8E1EE]">
                    {activeCareer.practicalExperience}
                  </p>
                  <p className="mt-1 text-[11px] text-[#9FB0C7]">
                    {activeCareer.licensingDistinction}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onBuildPath(activeCareer.courseTopic)}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#F2C567] px-4 text-xs font-semibold text-[#1a1408]"
                >
                  <Sparkles className="size-3.5" /> Build {activeCareer.title} Journey →
                </button>
              </div>
            </div>
          ) : null}

          {/* 3. PRACTICAL SKILLS SIMULATOR */}
          {capTab === "simulator" ? (
            <div className="space-y-4 text-xs">
              <div className="flex flex-wrap gap-2">
                {PRACTICAL_SIMULATIONS.map((sim) => {
                  const done = bridge.completedSimulationIds.includes(sim.id);
                  return (
                    <button
                      key={sim.id}
                      type="button"
                      onClick={() => {
                        setSelectedSimId(sim.id);
                        setSimOptionId(null);
                      }}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 font-semibold transition",
                        sim.id === activeSim.id
                          ? "border-[#F2C567] bg-[#F2C567] text-[#1a1408]"
                          : "border-[#2D3B50] bg-[#111A29] text-[#D8E1EE]",
                      )}
                    >
                      <Cpu className="size-3.5" />
                      {sim.domain}
                      {done ? " ✓" : ""}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-xl border border-[#263449] bg-[#111A29] p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F2C567]">
                  Safe Interactive Simulation · {activeSim.domain}
                </span>
                <h4 className="mt-1 text-base font-bold text-[#F5F7FB]">
                  {activeSim.title}
                </h4>
                <p className="mt-1 rounded-lg bg-[#0B1220] px-3 py-1.5 font-mono text-[11px] text-[#F2C567]">
                  Telemetry / Specs: {activeSim.contextData}
                </p>
                <p className="mt-2.5 text-sm text-[#D8E1EE]">
                  {activeSim.prompt}
                </p>

                <div className="mt-3 space-y-2">
                  {activeSim.options.map((opt) => {
                    const picked = simOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSimOptionId(opt.id);
                          if (
                            opt.correct &&
                            !bridge.completedSimulationIds.includes(activeSim.id)
                          ) {
                            updateBridge({
                              ...bridge,
                              completedSimulationIds: [
                                ...bridge.completedSimulationIds,
                                activeSim.id,
                              ],
                            });
                          }
                        }}
                        className={cn(
                          "block w-full rounded-xl border p-3 text-left transition",
                          picked
                            ? opt.correct
                              ? "border-emerald-400 bg-emerald-950/35 text-emerald-200"
                              : "border-rose-400 bg-rose-950/35 text-rose-200"
                            : "border-[#2D3B50] bg-[#0B1220] text-[#D8E1EE] hover:border-[#F2C567]/50",
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {simOptionId ? (
                  <div className="mt-3 rounded-xl border border-[#F2C567]/40 bg-[#0B1220] p-3 text-[#D8E1EE]">
                    {
                      activeSim.options.find((o) => o.id === simOptionId)
                        ?.feedback
                    }
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* 4. SKILLS PASSPORT */}
          {capTab === "passport" ? (
            <div className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-[#263449] bg-[#111A29] p-3.5">
                <span className="font-semibold text-[#F2C567]">
                  Demonstrated Mastery Tier
                </span>
                <p className="mt-1 text-lg font-bold text-[#F5F7FB]">
                  {indicators.masteryTier}
                </p>
                <p className="mt-1 text-[#9FB0C7]">
                  {indicators.knowledgeMasteryPct}% module assessments passed
                </p>
              </div>
              <div className="rounded-xl border border-[#263449] bg-[#111A29] p-3.5">
                <span className="font-semibold text-[#F2C567]">
                  Verified Practical Simulations
                </span>
                <p className="mt-1 text-lg font-bold text-[#F5F7FB]">
                  {bridge.completedSimulationIds.length} /{" "}
                  {PRACTICAL_SIMULATIONS.length}
                </p>
                <p className="mt-1 text-[#9FB0C7]">
                  Hands-on fault diagnosis & estimating
                </p>
              </div>
              <div className="rounded-xl border border-[#263449] bg-[#111A29] p-3.5">
                <span className="font-semibold text-[#F2C567]">
                  Portfolio Projects Verified
                </span>
                <p className="mt-1 text-lg font-bold text-[#F5F7FB]">
                  {store.projects[path.id]?.trim() ? "1 Verified" : "In Progress"}
                </p>
                <p className="mt-1 text-[#9FB0C7]">
                  Rubric-audited capstone deliverable
                </p>
              </div>
              <div className="rounded-xl border border-[#263449] bg-[#111A29] p-3.5">
                <span className="font-semibold text-[#F2C567]">
                  Discover Resources Reviewed
                </span>
                <p className="mt-1 text-lg font-bold text-[#F5F7FB]">
                  {bridge.reviewedContentIds.length} items
                </p>
                <p className="mt-1 text-[#9FB0C7]">
                  Tracked separately from mastery
                </p>
              </div>
            </div>
          ) : null}

          {/* 5. ASK NOCTIS ABOUT ANYTHING IN A LESSON */}
          {capTab === "ask" ? (
            <div className="space-y-3 text-xs">
              <p className="text-[#D8E1EE]">
                Ask questions about any video, slide, diagram, article, or quiz in{" "}
                <strong className="text-[#F2C567]">{activeLesson.title}</strong>. Noctis answers in context, cites verified sources, and offers a simpler explanation or regional example.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  `Explain “${activeLesson.title}” in plain language with a real-world analogy`,
                  `Give me a worked step-by-step example for ${activeModule.title}`,
                  `What are the most common mistakes learners make on the ${activeModule.title} check?`,
                  `Cite the verified primary sources and standards for ${path.subject}`,
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => onOpenNoctisTutor(q)}
                    className="rounded-xl border border-[#F2C567]/45 bg-[#111A29] px-3.5 py-2 text-left text-xs font-semibold text-[#F5F7FB] hover:border-[#F2C567]"
                  >
                    <Sparkles className="mr-1.5 inline size-3.5 text-[#F2C567]" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* 6. KNOWLEDGE RETENTION COACH */}
          {capTab === "retention" ? (
            <div className="space-y-3 text-xs">
              <p className="text-[#D8E1EE]">
                Spaced revision schedule for <strong className="text-[#F2C567]">{path.subject}</strong> — revisits concepts after a delay to measure lasting recall and application, not just immediate quiz scores.
              </p>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {path.modules.slice(0, 4).map((m, idx) => {
                  const done = passedSet.has(m.id);
                  const intervals = ["24 hours", "3 days", "7 days", "14 days"];
                  return (
                    <div
                      key={m.id}
                      className="rounded-xl border border-[#263449] bg-[#111A29] p-3"
                    >
                      <span className="text-[10px] font-bold uppercase text-[#F2C567]">
                        Recall Interval · +{intervals[idx]}
                      </span>
                      <p className="mt-1 font-bold text-[#F5F7FB]">{m.title}</p>
                      <p className="mt-1 text-[11px] text-[#9FB0C7]">
                        Status:{" "}
                        {done
                          ? "Passed initial check — scheduled for delayed application prompt"
                          : "Priority review — complete foundational check first"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* 7. STUDY CREWS AND MENTORS */}
          {capTab === "crews" ? (
            <div className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  id: "crew-cloud",
                  name: "Cloud & DevOps Architects Crew",
                  mentor: "Kwesi Danquah · Principal Architect",
                  topic: "AWS, Azure, Kubernetes & Terraform peer reviews",
                },
                {
                  id: "crew-trades",
                  name: "Master Trade & Craft Shop",
                  mentor: "Master Yaw Osei · NCCER / ASE",
                  topic: "Carpentry, masonry, electrical & automotive diagnostics",
                },
                {
                  id: "crew-cyber",
                  name: "Cyber SOC & Detection Lab",
                  mentor: "Zainab Bello · SOC Lead",
                  topic: "CompTIA Security+, Splunk SIEM & OWASP triage",
                },
                {
                  id: "crew-web",
                  name: "Web & Product Studio Crew",
                  mentor: "Efua Asante · Design Systems",
                  topic: "Responsive HTML/CSS/React & WCAG critique",
                },
              ].map((crew) => {
                const joined = joinedCrewIds.includes(crew.id);
                return (
                  <div
                    key={crew.id}
                    className="flex flex-col justify-between rounded-xl border border-[#263449] bg-[#111A29] p-3.5"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#F2C567]">
                        Moderated Study Crew
                      </span>
                      <p className="mt-1 font-bold text-[#F5F7FB]">
                        {crew.name}
                      </p>
                      <p className="mt-1 text-[11px] text-[#D8E1EE]">
                        Mentor: {crew.mentor}
                      </p>
                      <p className="mt-1 text-[11px] text-[#9FB0C7]">
                        {crew.topic}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setJoinedCrewIds((prev) =>
                          prev.includes(crew.id)
                            ? prev.filter((id) => id !== crew.id)
                            : [...prev, crew.id],
                        )
                      }
                      className={cn(
                        "mt-3 rounded-lg px-3 py-1.5 text-[11px] font-semibold",
                        joined
                          ? "border border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
                          : "bg-[#F2C567] text-[#1a1408]",
                      )}
                    >
                      {joined ? "Joined Crew ✓" : "Join Study Crew"}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* 8. CERTIFICATION READINESS CENTRE */}
          {capTab === "cert-readiness" ? (
            <div className="space-y-4 text-xs">
              <div className="flex flex-wrap gap-2">
                {CERTIFICATION_READINESS_TRACKS.map((tr) => (
                  <button
                    key={tr.id}
                    type="button"
                    onClick={() => setSelectedCertId(tr.id)}
                    className={cn(
                      "rounded-xl border px-3 py-1.5 font-semibold transition",
                      tr.id === activeCert.id
                        ? "border-[#F2C567] bg-[#F2C567] text-[#1a1408]"
                        : "border-[#2D3B50] bg-[#111A29] text-[#D8E1EE]",
                    )}
                  >
                    {tr.provider} · {tr.credential.split("(")[0]}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-[#263449] bg-[#111A29] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#F2C567]">
                      Official Exam Objective Mapping · {activeCert.provider}
                    </span>
                    <h4 className="text-base font-bold text-[#F5F7FB]">
                      {activeCert.credential}
                    </h4>
                  </div>
                  <a
                    href={activeCert.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[#F2C567] hover:underline"
                  >
                    Official Exam Guide ↗
                  </a>
                </div>

                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {activeCert.domains.map((dom) => (
                    <div
                      key={dom.name}
                      className="rounded-xl border border-[#2D3B50] bg-[#0B1220] p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#F5F7FB]">
                          {dom.name}
                        </span>
                        <span className="rounded-full bg-[#F2C567]/15 px-2 py-0.5 text-[10px] font-bold text-[#F2C567]">
                          {dom.weightPct}% weight
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-[#9FB0C7]">
                        Mapped Vibe Lesson: {dom.mappedLessonTopic}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {/* 9. MULTILINGUAL AND ACCESSIBLE LEARNING */}
          {capTab === "multilingual" ? (
            <div className="space-y-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 rounded-xl border border-[#2D3B50] bg-[#111A29] px-3 py-2">
                  <Globe className="size-4 text-[#F2C567]" />
                  <span className="font-semibold text-[#B6C2D4]">Language:</span>
                  <select
                    value={language}
                    onChange={(e) =>
                      setLanguage(
                        e.target.value as
                          | "English"
                          | "Twi"
                          | "Français"
                          | "Español",
                      )
                    }
                    className="bg-transparent font-bold text-[#F5F7FB] outline-none"
                  >
                    <option value="English" className="bg-[#0B1220]">
                      English
                    </option>
                    <option value="Twi" className="bg-[#0B1220]">
                      Twi (Ghana)
                    </option>
                    <option value="Français" className="bg-[#0B1220]">
                      Français
                    </option>
                    <option value="Español" className="bg-[#0B1220]">
                      Español
                    </option>
                  </select>
                </label>

                <label className="flex items-center gap-2 rounded-xl border border-[#2D3B50] bg-[#111A29] px-3 py-2">
                  <span className="font-semibold text-[#B6C2D4]">
                    Playback Speed:
                  </span>
                  {(["0.75x", "1.0x", "1.25x", "1.5x"] as const).map((sp) => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => setPlaybackSpeed(sp)}
                      className={cn(
                        "rounded-lg px-2 py-0.5 font-semibold",
                        playbackSpeed === sp
                          ? "bg-[#F2C567] text-[#1a1408]"
                          : "text-[#A9B6C9]",
                      )}
                    >
                      {sp}
                    </button>
                  ))}
                </label>

                <button
                  type="button"
                  onClick={() => setCaptionsEnabled((v) => !v)}
                  className={cn(
                    "rounded-xl border px-3 py-2 font-semibold",
                    captionsEnabled
                      ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
                      : "border-[#2D3B50] bg-[#111A29] text-[#A9B6C9]",
                  )}
                >
                  Captions & Transcript: {captionsEnabled ? "ON ✓" : "OFF"}
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#263449] bg-[#111A29] p-3.5">
                  <p className="font-bold text-[#F2C567]">
                    Local Example · Ghana (Accra, Kumasi, Tamale & Takoradi):
                  </p>
                  <p className="mt-1 text-[#D8E1EE]">
                    Applies {path.subject} to Ghana standards — e.g., ECG/Energy Commission solar microgrid sizing, sandcrete block & tropical timber framing, or low-latency mobile web apps for West African networks.
                  </p>
                </div>
                <div className="rounded-xl border border-[#263449] bg-[#111A29] p-3.5">
                  <p className="font-bold text-[#F2C567]">
                    Local Example · United States (OSHA, NEC, IRC, ASE & EPA):
                  </p>
                  <p className="mt-1 text-[#D8E1EE]">
                    Applies {path.subject} to U.S. regulatory & industry standards — e.g., OSHA 1926 jobsite safety, IRC 16-inch stud framing, EPA Section 608 refrigerant rules, ASE A1–A8 diagnostics, and WCAG/ADA accessibility.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* 10. LEARNING QUALITY AND SOURCE VERIFICATION */}
          {capTab === "verification" ? (
            <div className="grid gap-2.5 text-xs sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-emerald-500/35 bg-emerald-950/20 p-3">
                <span className="font-bold text-emerald-300">
                  ✓ Claim & Source Audit
                </span>
                <p className="mt-1 text-[#D8E1EE]">
                  0 unsupported claims. Every lesson links to verified documentation (W3C, MDN, NIST, OWASP, OpenStax, NCCER, AWS).
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/35 bg-emerald-950/20 p-3">
                <span className="font-bold text-emerald-300">
                  ✓ Certification Objectives
                </span>
                <p className="mt-1 text-[#D8E1EE]">
                  Verified 2026-10-22. Legacy Splunk and vendor credentials explicitly flagged with verification notes.
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/35 bg-emerald-950/20 p-3">
                <span className="font-bold text-emerald-300">
                  ✓ Slide & Video Sync
                </span>
                <p className="mt-1 text-[#D8E1EE]">
                  Video lessons, slide decks, notes, and quizzes are generated from one shared lesson specification.
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/35 bg-emerald-950/20 p-3">
                <span className="font-bold text-emerald-300">
                  ✓ Licensing Boundaries
                </span>
                <p className="mt-1 text-[#D8E1EE]">
                  Clearly separates Vibe completion certificates from state trade licences, OSHA cards, ASE experience, and clinical boards.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* INLINE LINKED RESOURCE MODAL (Opens without losing lesson position) */}
      {inlineItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl border border-[#F2C567]/50 bg-[#111A29] p-5 text-[#F5F7FB] shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F2C567]">
                  Inline Discover Resource · Lesson Position Preserved ({activeLesson.title})
                </span>
                <h3 className="mt-1 text-xl font-bold">{inlineItem.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setInlineItem(null)}
                className="rounded-full border border-[#2D3B50] p-1.5 text-[#A9B6C9] hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-3 overflow-hidden rounded-2xl border border-[#2D3B50] bg-[#0B1220]">
              {inlineItem.mediaUrl.endsWith(".mp4") ? (
                <video
                  src={inlineItem.mediaUrl}
                  poster={inlineItem.posterUrl}
                  controls
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <img
                  src={inlineItem.posterUrl}
                  alt={inlineItem.title}
                  className="aspect-video w-full object-cover"
                />
              )}
            </div>

            <p className="mt-3 text-sm text-[#D8E1EE]">{inlineItem.summary}</p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  updateBridge(markDiscoverItemReviewed(bridge, inlineItem.id));
                  setNotice(
                    `Marked “${inlineItem.title}” as reviewed (Exposure recorded).`,
                  );
                  setInlineItem(null);
                }}
                className="rounded-xl bg-[#F2C567] px-4 py-2 text-xs font-semibold text-[#1a1408]"
              >
                Mark as Reviewed & Return to Lesson →
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
