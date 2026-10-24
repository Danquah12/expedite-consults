import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  Clapperboard,
  Compass,
  FileText,
  Globe,
  GraduationCap,
  HelpCircle,
  Layers,
  Play,
  PlusCircle,
  Radio,
  Search,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import {
  CORE_VIBE_PROMISE_STAGES,
  DISCOVER_CONTENT_ITEMS,
  buildJourneyFromDiscoverContent,
  feedPostToDiscoverItem,
  getAdaptiveLearningActions,
  getDiscoverMenuChannel,
  linkContentToJourney,
  listDiscoverContent,
  mapDiscoverTypeToInteractiveId,
  markDiscoverItemReviewed,
  matchContentToJourney,
  readDiscoverJourneyState,
  toggleBookmarkDiscoverItem,
  writeDiscoverJourneyState,
  type DiscoverContentCategory,
  type DiscoverContentItem,
  type DiscoverJourneyBridgeState,
  type DiscoverMenuChannelId,
  type InteractiveContentTypeId,
} from "@/lib/discover-journey-bridge";
import type { FeedPost } from "@/lib/feed-data";
import {
  EMPTY_JOURNEY,
  JOURNEY_PATHS,
  pathForTopic,
  readJourney,
  writeJourney,
  type JourneyPath,
  type JourneyStore,
} from "@/lib/journey-paths";
import { cn } from "@/lib/utils";

const CONTENT_TYPE_TABS: {
  id: InteractiveContentTypeId;
  label: string;
  sampleItemId: string;
}[] = [
  {
    id: "video-reel",
    label: "Video or Reel",
    sampleItemId: "disc-aws-intro",
  },
  {
    id: "article-analysis",
    label: "Article or analysis",
    sampleItemId: "disc-aws-iam-article",
  },
  {
    id: "course-certification",
    label: "Professional course or certification",
    sampleItemId: "disc-cyber-packets-reel",
  },
  {
    id: "project-demo",
    label: "Practical project or demonstration",
    sampleItemId: "disc-carpentry-framing-demo",
  },
];

export function DiscoverDesk({
  onOpenJourney,
}: {
  onOpenJourney?: (builtCourseTitle?: string) => void;
}) {
  const [journeyStore, setJourneyStore] = useState<JourneyStore>(EMPTY_JOURNEY);
  const [bridge, setBridge] = useState<DiscoverJourneyBridgeState>(() =>
    readDiscoverJourneyState(),
  );
  const [query, setQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<"all" | DiscoverMenuChannelId>("all");
  const [categoryFilter, setCategoryFilter] = useState<
    DiscoverContentCategory | "all" | "bookmarked"
  >("all");
  const [interactiveType, setInteractiveType] =
    useState<InteractiveContentTypeId>("video-reel");
  const [openMenuCardId, setOpenMenuCardId] = useState<string | null>(null);

  // Modals for the 4 unified Learning Actions
  const [previewItem, setPreviewItem] = useState<DiscoverContentItem | null>(null);
  const [explainItem, setExplainItem] = useState<DiscoverContentItem | null>(null);
  const [quizItem, setQuizItem] = useState<DiscoverContentItem | null>(null);
  const [quizSelectedIdx, setQuizSelectedIdx] = useState<number | null>(null);
  const [planPreviewItem, setPlanPreviewItem] =
    useState<DiscoverContentItem | null>(null);
  const [addModalItem, setAddModalItem] = useState<DiscoverContentItem | null>(
    null,
  );
  const [selectedTargetJourneyId, setSelectedTargetJourneyId] =
    useState<string>("");
  const [selectedTargetModuleId, setSelectedTargetModuleId] =
    useState<string>("");
  const [banner, setBanner] = useState<{
    tone: "ok" | "warn" | "err";
    text: string;
  } | null>(null);

  useEffect(() => {
    setJourneyStore(readJourney());
    setBridge(readDiscoverJourneyState());
    const onSync = () => {
      setJourneyStore(readJourney());
      setBridge(readDiscoverJourneyState());
    };
    window.addEventListener("vibe-discover-journey-sync", onSync);
    return () => window.removeEventListener("vibe-discover-journey-sync", onSync);
  }, []);

  const activeJourney: JourneyPath = useMemo(() => {
    const id = journeyStore.activeId || journeyStore.subjectId || "web";
    if (journeyStore.custom && journeyStore.custom.id === id) {
      return journeyStore.custom;
    }
    return (
      JOURNEY_PATHS.find((p) => p.id === id) ??
      pathForTopic(journeyStore.topic || id)
    );
  }, [journeyStore]);

  const items = useMemo(() => {
    const base =
      categoryFilter === "bookmarked"
        ? DISCOVER_CONTENT_ITEMS.filter((item) =>
            bridge.bookmarkedContentIds.includes(item.id),
          )
        : listDiscoverContent({
            query,
            category: categoryFilter === "all" ? "all" : categoryFilter,
            includeEntertainment: true,
          });
    if (channelFilter === "all") return base;
    return base.filter((item) => getDiscoverMenuChannel(item) === channelFilter);
  }, [query, categoryFilter, channelFilter, bridge.bookmarkedContentIds]);

  const adaptiveSandboxActions = useMemo(
    () => getAdaptiveLearningActions(interactiveType),
    [interactiveType],
  );

  function updateBridge(next: DiscoverJourneyBridgeState) {
    setBridge(next);
    writeDiscoverJourneyState(next);
  }

  function handlePrimaryAction(item: DiscoverContentItem) {
    setPreviewItem(item);
    setOpenMenuCardId(null);
    if (!bridge.viewedContentIds.includes(item.id)) {
      updateBridge({
        ...bridge,
        viewedContentIds: [...bridge.viewedContentIds, item.id],
      });
    }
  }

  function handleOpenAddModal(item: DiscoverContentItem) {
    const match = matchContentToJourney(item, activeJourney);
    setOpenMenuCardId(null);
    setAddModalItem(item);
    setSelectedTargetJourneyId(match.matchedJourney.id);
    setSelectedTargetModuleId(match.matchedModule.id);
  }

  function handleRunUnifiedAction(
    actionId: "open" | "explain" | "journey" | "quiz",
    item: DiscoverContentItem,
  ) {
    setOpenMenuCardId(null);
    if (actionId === "open") {
      handlePrimaryAction(item);
      return;
    }
    if (actionId === "explain") {
      setExplainItem(item);
      return;
    }
    if (actionId === "journey") {
      handleOpenAddModal(item);
      return;
    }
    if (actionId === "quiz") {
      setQuizSelectedIdx(null);
      setQuizItem(item);
    }
  }

  function handleConfirmAddToJourney() {
    if (!addModalItem) return;
    const match = matchContentToJourney(addModalItem, activeJourney);
    const targetJourney =
      selectedTargetJourneyId === activeJourney.id
        ? activeJourney
        : JOURNEY_PATHS.find((p) => p.id === selectedTargetJourneyId) ??
          match.matchedJourney;

    const targetMod =
      targetJourney.modules.find((m) => m.id === selectedTargetModuleId) ??
      targetJourney.modules[0]!;
    const targetLesson = targetMod.lessons[0]!;

    const result = linkContentToJourney(bridge, addModalItem.id, targetJourney, {
      moduleId: targetMod.id,
      lessonId: targetLesson.id,
    });

    if (!result.ok) {
      setBanner({ tone: "err", text: result.error || "Could not link content." });
      setAddModalItem(null);
      return;
    }

    updateBridge(result.state);
    setBanner({
      tone: "ok",
      text: `Intelligent Match: Attached “${addModalItem.title}” (${addModalItem.id}) to ${targetJourney.subject} → ${targetMod.title} (${targetLesson.title}). Original Discover media record preserved.`,
    });
    setAddModalItem(null);
  }

  function handleConfirmBuildJourney(item: DiscoverContentItem) {
    const built = buildJourneyFromDiscoverContent(bridge, item.id);
    if (!built.ok || !built.journey) {
      setBanner({
        tone: "err",
        text: built.error || "Unable to generate journey from this resource.",
      });
      return;
    }

    updateBridge(built.state);
    const nextStore: JourneyStore = {
      ...journeyStore,
      seen: true,
      activeId: built.journey.id,
      subjectId: built.journey.id,
      topic: built.journey.subject,
      custom: built.journey,
      activeJourneys: Array.from(
        new Set([built.journey.id, ...(journeyStore.activeJourneys ?? [])]),
      ),
    };
    setJourneyStore(nextStore);
    writeJourney(nextStore);
    setPlanPreviewItem(null);
    setBanner({
      tone: "ok",
      text: `Noctis created your 5-stage “${built.journey.subject}” Journey and attached “${item.title}” to Module ${item.suggestedModuleIndex + 1}.`,
    });

    if (onOpenJourney) {
      onOpenJourney(built.journey.subject);
    }
  }

  return (
    <div className="space-y-5 text-[#F5F7FB]">
      {/* 1. CORE 6-STAGE PROMISE OF VIBE / NOCTIS (Discover → Journey → Learn → Practise → Prove → Advance) */}
      <section className="rounded-[1.6rem] border border-[#2D3B50] bg-gradient-to-br from-[#121C2D] via-[#0E1624] to-[#1D1A14] p-5 shadow-xl md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F2C567]">
              DISCOVER · JOURNEY · LEARN · PRACTISE · PROVE · ADVANCE
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#F5F7FB] md:text-4xl">
              Discover something worth learning.{" "}
              <span className="text-[#F2C567]">Advance toward real outcomes.</span>
            </h1>
            <p className="mt-1.5 max-w-3xl text-xs text-[#B6C2D4] md:text-sm">
              Discover is where you find useful knowledge and opportunities across <strong className="text-[#F5F7FB]">Academy</strong>, <strong className="text-[#F5F7FB]">Reels</strong>, and <strong className="text-[#F5F7FB]">News & Analysis</strong>. Journey turns that interest into a structured plan, multimedia lessons, safe simulations, verified projects, and career credentials.
            </p>
          </div>

          {/* Quick Resume Journey Button (Preserves Navigation & Progress) */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenJourney ? (
              <button
                type="button"
                onClick={() => onOpenJourney()}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#F2C567] px-4 text-xs font-semibold text-[#1a1408] shadow-md transition hover:brightness-105"
              >
                <Compass className="size-4" />
                Resume Journey ({activeJourney.subject}) <ArrowRight className="size-3.5" />
              </button>
            ) : (
              <Link
                to="/home"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#F2C567] px-4 text-xs font-semibold text-[#1a1408] shadow-md transition hover:brightness-105"
              >
                <Compass className="size-4" />
                Resume Journey ({activeJourney.subject}) <ArrowRight className="size-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* 6-Stage Core Promise Strip */}
        <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {CORE_VIBE_PROMISE_STAGES.map((s, idx) => (
            <div
              key={s.stage}
              className={cn(
                "rounded-2xl border p-3",
                idx === 0
                  ? "border-[#F2C567] bg-[#F2C567]/12"
                  : "border-[#2D3B50] bg-[#0B1220]/90",
              )}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F2C567]">
                {s.step}. {s.stage}
              </span>
              <p className="mt-1 text-[11px] leading-snug text-[#D8E1EE]">
                {s.promise}
              </p>
            </div>
          ))}
        </div>

        {/* Reconciled Discover Menu Channels (Academy, Reels, News & Analysis) */}
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#F2C567]">
              Discover Channels — Filter cards below or open full channel
            </span>
            {channelFilter !== "all" ? (
              <button
                type="button"
                onClick={() => setChannelFilter("all")}
                className="text-xs font-semibold text-[#F2C567] hover:underline"
              >
                Show all Discover channels ({DISCOVER_CONTENT_ITEMS.length})
              </button>
            ) : null}
          </div>

          <div className="grid gap-2.5 md:grid-cols-3">
            {/* 1. Academy */}
            <div
              className={cn(
                "flex items-center justify-between gap-3 rounded-3xl border px-4 py-3 transition",
                channelFilter === "academy"
                  ? "border-[#F2C567] bg-[linear-gradient(165deg,#3a2c1c_0%,#241910_55%,#1a140e_100%)] ring-1 ring-[#F2C567]"
                  : "border-[#e4b86a]/45 bg-[linear-gradient(165deg,#3a2c1c_0%,#241910_55%,#1a140e_100%)] hover:border-[#F2C567]",
              )}
            >
              <button
                type="button"
                onClick={() =>
                  setChannelFilter(channelFilter === "academy" ? "all" : "academy")
                }
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e4b86a]/18 text-[#f6e3b0]">
                  <GraduationCap className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#f6f1e8]">
                    Academy
                  </span>
                  <span className="block truncate text-xs text-[#d7c4a2]">
                    Discover, practice, and apply
                  </span>
                </span>
              </button>
              <Link
                to="/"
                hash="feed"
                className="shrink-0 rounded-full border border-[#e4b86a]/50 bg-black/30 px-2.5 py-1 text-[11px] font-semibold text-[#f6e3b0] hover:bg-[#e4b86a] hover:text-[#1a1408]"
              >
                Open Feed →
              </Link>
            </div>

            {/* 2. Reels */}
            <div
              className={cn(
                "flex items-center justify-between gap-3 rounded-3xl border px-4 py-3 transition",
                channelFilter === "reels"
                  ? "border-[#F2C567] bg-[linear-gradient(165deg,#3a2c1c_0%,#241910_55%,#1a140e_100%)] ring-1 ring-[#F2C567]"
                  : "border-[#e4b86a]/45 bg-[linear-gradient(165deg,#3a2c1c_0%,#241910_55%,#1a140e_100%)] hover:border-[#F2C567]",
              )}
            >
              <button
                type="button"
                onClick={() =>
                  setChannelFilter(channelFilter === "reels" ? "all" : "reels")
                }
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e4b86a]/18 text-[#f6e3b0]">
                  <Clapperboard className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#f6f1e8]">
                    Reels
                  </span>
                  <span className="block truncate text-xs text-[#d7c4a2]">
                    Short clips by hall
                  </span>
                </span>
              </button>
              <Link
                to="/reels"
                className="shrink-0 rounded-full border border-[#e4b86a]/50 bg-black/30 px-2.5 py-1 text-[11px] font-semibold text-[#f6e3b0] hover:bg-[#e4b86a] hover:text-[#1a1408]"
              >
                Open Reels →
              </Link>
            </div>

            {/* 3. News & Analysis */}
            <div
              className={cn(
                "flex items-center justify-between gap-3 rounded-3xl border px-4 py-3 transition",
                channelFilter === "news"
                  ? "border-[#F2C567] bg-[linear-gradient(165deg,#3a2c1c_0%,#241910_55%,#1a140e_100%)] ring-1 ring-[#F2C567]"
                  : "border-[#e4b86a]/45 bg-[linear-gradient(165deg,#3a2c1c_0%,#241910_55%,#1a140e_100%)] hover:border-[#F2C567]",
              )}
            >
              <button
                type="button"
                onClick={() =>
                  setChannelFilter(channelFilter === "news" ? "all" : "news")
                }
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e4b86a]/18 text-[#f6e3b0]">
                  <Radio className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#f6f1e8]">
                    News & Analysis
                  </span>
                  <span className="block truncate text-xs text-[#d7c4a2]">
                    The story, and what to study next
                  </span>
                </span>
              </button>
              <Link
                to="/news"
                className="shrink-0 rounded-full border border-[#e4b86a]/50 bg-black/30 px-2.5 py-1 text-[11px] font-semibold text-[#f6e3b0] hover:bg-[#e4b86a] hover:text-[#1a1408]"
              >
                Open News →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE UNIFIED "LEARNING ACTIONS" MENU SANDBOX ("Try the proposed interaction") */}
      <section className="rounded-[1.6rem] border border-[#2D3B50] bg-[#111A29] p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#F2C567]">
              Unified “Learning Actions” Menu · Try the Proposed Interaction
            </p>
            <h2 className="mt-0.5 font-display text-lg font-bold text-[#F5F7FB] md:text-xl">
              Select a content type to see how its unified Learning Actions adapt
            </h2>
            <p className="mt-0.5 text-xs text-[#A9B6C9]">
              Rather than crowding every card with many buttons, one consistent Learning Actions menu adapts its 4 actions to the content type.
            </p>
          </div>
        </div>

        {/* Content Type Selector Pills */}
        <div className="mt-3 flex flex-wrap gap-2">
          {CONTENT_TYPE_TABS.map((tab) => {
            const active = interactiveType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setInteractiveType(tab.id)}
                className={cn(
                  "rounded-xl border px-3.5 py-2 text-xs font-semibold transition",
                  active
                    ? "border-[#F2C567] bg-[#F2C567] text-[#1a1408] shadow-sm"
                    : "border-[#2D3B50] bg-[#0B1220] text-[#D8E1EE] hover:border-[#F2C567]/50",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Adaptive 4-Action Grid for Selected Content Type */}
        <div className="mt-3.5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {adaptiveSandboxActions.map((act) => {
            const currentTab =
              CONTENT_TYPE_TABS.find((t) => t.id === interactiveType) ??
              CONTENT_TYPE_TABS[0]!;
            const sampleItem =
              DISCOVER_CONTENT_ITEMS.find(
                (i) => i.id === currentTab.sampleItemId,
              ) ?? DISCOVER_CONTENT_ITEMS[0]!;

            return (
              <button
                key={act.id}
                type="button"
                onClick={() => handleRunUnifiedAction(act.id, sampleItem)}
                className="group flex flex-col justify-between rounded-2xl border border-[#263449] bg-[#0B1220] p-3.5 text-left transition hover:border-[#F2C567]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#F5F7FB] group-hover:text-[#F2C567]">
                      {act.title}
                    </span>
                    <span className="rounded-full border border-[#F2C567]/40 bg-[#F2C567]/10 px-2 py-0.5 text-[10px] font-semibold text-[#F2C567]">
                      {act.badge}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-[#9FB0C7]">
                    {act.description}
                  </p>
                </div>
                <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#F2C567]">
                  Try on “{sampleItem.topic}” <ArrowRight className="size-3" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Status Banner */}
      {banner ? (
        <div
          className={cn(
            "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs font-medium",
            banner.tone === "ok"
              ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-200"
              : banner.tone === "warn"
                ? "border-amber-500/40 bg-amber-950/30 text-amber-200"
                : "border-rose-500/40 bg-rose-950/30 text-rose-200",
          )}
        >
          <span>{banner.text}</span>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="rounded-lg px-2 py-0.5 text-xs font-semibold hover:bg-white/10"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {/* 3. SEARCH & CATEGORY FILTER BAR + DISCOVER CARDS GRID */}
      <section className="rounded-[1.6rem] border border-[#2D3B50] bg-[#111A29] p-5 shadow-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["all", "All Discover Content"],
                ["certification", "Certifications (AWS, Cyber)"],
                ["skilled-trade", "Skilled Trades (Carpentry, Masonry, Auto)"],
                ["educational", "Academic & Web Design"],
                ["entertainment", "Entertainment & Social"],
                [
                  "bookmarked",
                  `Bookmarked (${bridge.bookmarkedContentIds.length})`,
                ],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setCategoryFilter(id)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                  categoryFilter === id
                    ? "bg-[#F2C567] text-[#1a1408]"
                    : "border border-[#2D3B50] bg-[#0B1220] text-[#A9B6C9] hover:border-[#F2C567]/50 hover:text-[#F5F7FB]",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="flex min-w-[250px] items-center gap-2 rounded-xl border border-[#2D3B50] bg-[#0B1220] px-3 py-1.5 focus-within:border-[#F2C567]">
            <Search className="size-4 text-[#F2C567]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Discover videos, articles, trades..."
              className="h-6 w-full bg-transparent text-xs text-[#F5F7FB] outline-none placeholder:text-[#7E90A8]"
            />
          </label>
        </div>

        {/* DISCOVER CONTENT CARDS GRID WITH UNIFIED "LEARNING ACTIONS" MENU */}
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const isBookmarked = bridge.bookmarkedContentIds.includes(item.id);
            const isViewed = bridge.viewedContentIds.includes(item.id);
            const existingLinks = bridge.links.filter(
              (l) => l.contentId === item.id,
            );
            const match = matchContentToJourney(item, activeJourney);
            const cardActions = getAdaptiveLearningActions(
              mapDiscoverTypeToInteractiveId(item.type, item.category),
            );
            const menuOpen = openMenuCardId === item.id;

            return (
              <article
                key={item.id}
                className={cn(
                  "flex flex-col justify-between overflow-hidden rounded-2xl border bg-[#0B1220] transition",
                  item.isEducational
                    ? "border-[#263449] hover:border-[#F2C567]/60"
                    : "border-[#2D3B50]/60 opacity-95",
                )}
              >
                <div>
                  {/* Card Thumbnail + Type & Skill Level Overlay */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#141E2D]">
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-transparent to-black/40" />
                    <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full border border-[#F2C567]/60 bg-[#1B150B]/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F2C567]">
                        {getDiscoverMenuChannel(item) === "academy"
                          ? "Academy"
                          : getDiscoverMenuChannel(item) === "reels"
                            ? "Reels"
                            : getDiscoverMenuChannel(item) === "news"
                              ? "News & Analysis"
                              : "Entertainment"}
                      </span>
                      <span className="rounded-full bg-[#0B1220]/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F2C567]">
                        {item.type} · {item.skillLevel}
                      </span>
                      <span className="rounded-full bg-[#0B1220]/85 px-2.5 py-0.5 text-[10px] font-semibold text-[#D8E1EE]">
                        {item.topic}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateBridge(toggleBookmarkDiscoverItem(bridge, item.id))
                      }
                      aria-label="Bookmark content without creating a journey"
                      className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-[#0B1220]/85 text-[#F5F7FB] hover:text-[#F2C567]"
                    >
                      <Bookmark
                        className={cn(
                          "size-4",
                          isBookmarked && "fill-[#F2C567] text-[#F2C567]",
                        )}
                      />
                    </button>
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-[#D8E1EE]">
                      <span className="font-medium">{item.durationOrLength}</span>
                      <span className="font-mono text-[10px] text-[#9FB0C7]">
                        ID: {item.id}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2 text-[11px] text-[#9FB0C7]">
                      <span className="truncate font-semibold text-[#D8E1EE]">
                        {item.source.name} · {item.source.author}
                      </span>
                      {isViewed ? (
                        <span className="shrink-0 text-[10px] text-[#F2C567]">
                          Viewed (Exposure)
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-1.5 text-base font-bold leading-snug text-[#F5F7FB]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#A9B6C9]">
                      {item.summary}
                    </p>

                    {/* Feature 1: Intelligent Content-to-Course Matching Banner */}
                    {item.isEducational ? (
                      <div className="mt-3 rounded-xl border border-[#1E2B3E] bg-[#111A29] p-2.5 text-[11px]">
                        <p className="font-semibold text-[#F2C567]">
                          1. Intelligent Content-to-Course Match:
                        </p>
                        <p className="mt-0.5 text-[#D8E1EE]">
                          {item.learningObjectives[0]}
                        </p>
                        <p className="mt-1 text-[10px] text-[#8FA1B8]">
                          {match.hasMatchingActiveJourney
                            ? `✓ Matches your active ${activeJourney.subject} journey (${match.matchedModule.title})`
                            : `→ Attaches to ${match.matchedJourney.subject} (${match.matchedModule.title})`}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3 rounded-xl border border-[#2D3B50] bg-[#141E2D]/60 p-2.5 text-[11px] text-[#9FB0C7]">
                        General social & entertainment post — kept separate from formal learning plans unless you explicitly choose to explore a topic from it.
                      </div>
                    )}

                    {/* Trade Safety & Supervision Note */}
                    {item.safetyAndSupervisionNote ? (
                      <div className="mt-2 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-950/20 p-2 text-[11px] text-amber-200">
                        <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-[#F2C567]" />
                        <span>{item.safetyAndSupervisionNote}</span>
                      </div>
                    ) : null}

                    {/* Linked Badge if already added to a Journey */}
                    {existingLinks.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {existingLinks.map((l) => (
                          <span
                            key={l.linkId}
                            className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/30 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300"
                          >
                            <CheckCircle2 className="size-3" /> Linked to {l.journeyTitle}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* UNIFIED "LEARNING ACTIONS" FOOTER */}
                <div className="relative border-t border-[#1E2B3E] bg-[#0E1624] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {/* Primary Watch / Read / Explore Button */}
                    <button
                      type="button"
                      onClick={() => handlePrimaryAction(item)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#2D3B50] bg-[#141E2D] px-3 text-xs font-semibold text-[#F5F7FB] hover:border-[#F2C567]"
                    >
                      {item.primaryAction === "Watch" ? (
                        <Play className="size-3.5 text-[#F2C567]" />
                      ) : item.primaryAction === "Read" ? (
                        <FileText className="size-3.5 text-[#F2C567]" />
                      ) : (
                        <Compass className="size-3.5 text-[#F2C567]" />
                      )}
                      {item.primaryAction}
                    </button>

                    {/* Unified "Learning Actions ▾" Menu Button (plus quick Build Journey CTA) */}
                    {item.isEducational ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuCardId(menuOpen ? null : item.id)
                          }
                          className={cn(
                            "inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition",
                            menuOpen
                              ? "border-[#F2C567] bg-[#F2C567] text-[#1a1408]"
                              : "border-[#F2C567]/50 bg-[#F2C567]/12 text-[#F2C567] hover:bg-[#F2C567]/20",
                          )}
                        >
                          <Sparkles className="size-3.5" />
                          Learning Actions
                          <ChevronDown className="size-3.5" />
                        </button>
                      </div>
                    ) : null}
                  </div>

                  {/* Expanded Unified Learning Actions Menu */}
                  {menuOpen && item.isEducational ? (
                    <div className="mt-2.5 space-y-1.5 rounded-2xl border border-[#F2C567]/45 bg-[#111A29] p-2.5 shadow-xl">
                      <p className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F2C567]">
                        Unified Learning Actions ({item.type})
                      </p>
                      {cardActions.map((act) => (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => handleRunUnifiedAction(act.id, item)}
                          className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition hover:bg-[#1B2739]"
                        >
                          <div>
                            <p className="font-semibold text-[#F5F7FB]">
                              {act.title}
                            </p>
                            <p className="text-[11px] text-[#9FB0C7]">
                              {act.description}
                            </p>
                          </div>
                          <span className="ml-2 shrink-0 rounded-full border border-[#2D3B50] bg-[#0B1220] px-2 py-0.5 text-[10px] text-[#F2C567]">
                            {act.badge}
                          </span>
                        </button>
                      ))}
                      <div className="border-t border-[#1E2B3E] pt-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuCardId(null);
                            setPlanPreviewItem(item);
                          }}
                          className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-[#F2C567] to-[#E5B14C] px-3 py-2 text-left text-xs font-semibold text-[#1a1408]"
                        >
                          <span>Build a 5-Stage Journey with Noctis</span>
                          <ArrowRight className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* MODAL 1: INLINE RESOURCE VIEWER (Watch or resume / Read) */}
      {previewItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl border border-[#F2C567]/50 bg-[#111A29] p-5 text-[#F5F7FB] shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F2C567]">
                  {previewItem.type} · {previewItem.topic} · {previewItem.skillLevel}
                </span>
                <h3 className="mt-1 text-xl font-bold">{previewItem.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="rounded-full border border-[#2D3B50] p-1.5 text-[#A9B6C9] hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-3 overflow-hidden rounded-2xl border border-[#2D3B50] bg-[#0B1220]">
              {previewItem.mediaUrl.endsWith(".mp4") ? (
                <video
                  src={previewItem.mediaUrl}
                  poster={previewItem.posterUrl}
                  controls
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <img
                  src={previewItem.posterUrl}
                  alt={previewItem.title}
                  className="aspect-video w-full object-cover"
                />
              )}
            </div>

            <p className="mt-3 text-sm leading-relaxed text-[#D8E1EE]">
              {previewItem.summary}
            </p>

            {previewItem.learningObjectives.length > 0 ? (
              <div className="mt-3 rounded-2xl border border-[#263449] bg-[#0B1220] p-3.5 text-xs">
                <p className="font-semibold text-[#F2C567]">Learning Objectives:</p>
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[#D8E1EE]">
                  {previewItem.learningObjectives.map((obj) => (
                    <li key={obj}>{obj}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className="mt-3 rounded-xl border border-[#2D3B50] bg-[#0B1220] p-2.5 text-[11px] text-[#9FB0C7]">
              <strong className="text-[#F2C567]">Mastery Integrity Rule: </strong>
              Watching a video or reading an article records Exposure in your activity log, not Mastery. Mastery is earned by completing the lesson practice and passing the 80% module check in Journey.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  updateBridge(markDiscoverItemReviewed(bridge, previewItem.id));
                  setBanner({
                    tone: "ok",
                    text: `Marked “${previewItem.title}” as reviewed (Exposure recorded; complete lesson check in Journey to prove mastery).`,
                  });
                  setPreviewItem(null);
                }}
                className="rounded-xl border border-[#2D3B50] bg-[#0B1220] px-3.5 py-2 text-xs font-semibold text-[#D8E1EE] hover:border-[#F2C567]"
              >
                Mark as reviewed
              </button>
              {previewItem.isEducational ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const item = previewItem;
                      setPreviewItem(null);
                      handleOpenAddModal(item);
                    }}
                    className="rounded-xl border border-[#F2C567]/50 bg-[#F2C567]/15 px-3.5 py-2 text-xs font-semibold text-[#F2C567]"
                  >
                    Add to Journey
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const item = previewItem;
                      setPreviewItem(null);
                      setPlanPreviewItem(item);
                    }}
                    className="rounded-xl bg-[#F2C567] px-4 py-2 text-xs font-semibold text-[#1a1408]"
                  >
                    Build a Journey with Noctis →
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* MODAL 2: SUMMARISE AND EXPLAIN (Noctis Context Tutor + Ghana / US Regional Examples) */}
      {explainItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl border border-[#F2C567]/50 bg-[#111A29] p-5 text-[#F5F7FB] shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F2C567]">
                  Learning Action · Summarise & Explain with Noctis
                </span>
                <h3 className="mt-1 text-xl font-bold">{explainItem.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setExplainItem(null)}
                className="rounded-full border border-[#2D3B50] p-1.5 text-[#A9B6C9] hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-2xl border border-[#263449] bg-[#0B1220] p-3.5">
                <p className="font-semibold text-[#F2C567]">
                  Plain-Language Summary:
                </p>
                <p className="mt-1 leading-relaxed text-[#D8E1EE]">
                  {explainItem.summary}
                </p>
              </div>

              <div className="rounded-2xl border border-[#263449] bg-[#0B1220] p-3.5">
                <p className="font-semibold text-[#F2C567]">
                  Key Learning Objectives:
                </p>
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[#D8E1EE]">
                  {explainItem.learningObjectives.map((obj) => (
                    <li key={obj}>{obj}</li>
                  ))}
                </ul>
              </div>

              {explainItem.regionalExamples ? (
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#263449] bg-[#0B1220] p-3">
                    <p className="inline-flex items-center gap-1.5 font-semibold text-[#F2C567]">
                      <Globe className="size-3.5" /> Regional Context · Ghana:
                    </p>
                    <p className="mt-1 text-[#D8E1EE]">
                      {explainItem.regionalExamples.ghana}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#263449] bg-[#0B1220] p-3">
                    <p className="inline-flex items-center gap-1.5 font-semibold text-[#F2C567]">
                      <Globe className="size-3.5" /> Regional Context · United States:
                    </p>
                    <p className="mt-1 text-[#D8E1EE]">
                      {explainItem.regionalExamples.unitedStates}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="rounded-2xl border border-[#263449] bg-[#0B1220] p-3">
                <p className="font-semibold text-[#F2C567]">
                  Verified Source & Licensing:
                </p>
                <p className="mt-1 text-[#D8E1EE]">
                  {explainItem.source.name} · {explainItem.source.author} ({explainItem.source.license})
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const item = explainItem;
                    setExplainItem(null);
                    handleOpenAddModal(item);
                  }}
                  className="rounded-xl bg-[#F2C567] px-4 py-2 text-xs font-semibold text-[#1a1408]"
                >
                  Add to Journey →
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* MODAL 3: CREATE A QUIZ (Instant Comprehension Check on Discover Content) */}
      {quizItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-[#F2C567]/50 bg-[#111A29] p-5 text-[#F5F7FB] shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F2C567]">
                  Learning Action · Create a Quiz
                </span>
                <h3 className="mt-1 text-lg font-bold">{quizItem.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setQuizItem(null)}
                className="rounded-full border border-[#2D3B50] p-1.5 text-[#A9B6C9] hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            {(() => {
              const q = quizItem.quickQuiz ?? {
                question: `Which outcome best demonstrates understanding of “${quizItem.title}”?`,
                options: [
                  quizItem.learningObjectives[0] ??
                    `Apply the core method from ${quizItem.topic} in a verified exercise`,
                  "Watch the clip passively without testing comprehension",
                  "Skip prerequisite safety and verification checks",
                ],
                correctIndex: 0,
                explanation:
                  "Vibe/Noctis requires demonstrated understanding and practical verification rather than passive viewing.",
              };

              return (
                <div className="mt-4 space-y-3 text-xs">
                  <p className="text-sm font-semibold text-[#F5F7FB]">
                    {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, idx) => {
                      const picked = quizSelectedIdx === idx;
                      const isCorrect = idx === q.correctIndex;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setQuizSelectedIdx(idx)}
                          className={cn(
                            "block w-full rounded-2xl border p-3 text-left transition",
                            picked
                              ? isCorrect
                                ? "border-emerald-400 bg-emerald-950/35 text-emerald-200"
                                : "border-rose-400 bg-rose-950/35 text-rose-200"
                              : "border-[#2D3B50] bg-[#0B1220] text-[#D8E1EE] hover:border-[#F2C567]/50",
                          )}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {quizSelectedIdx !== null ? (
                    <div
                      className={cn(
                        "rounded-2xl border p-3",
                        quizSelectedIdx === q.correctIndex
                          ? "border-emerald-500/40 bg-emerald-950/25 text-emerald-200"
                          : "border-amber-500/40 bg-amber-950/25 text-amber-200",
                      )}
                    >
                      <p className="font-bold">
                        {quizSelectedIdx === q.correctIndex
                          ? "✓ Correct — Concept Verified"
                          : "Not quite — Review Rationale:"}
                      </p>
                      <p className="mt-1">{q.explanation}</p>
                    </div>
                  ) : null}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const item = quizItem;
                        setQuizItem(null);
                        setPlanPreviewItem(item);
                      }}
                      className="rounded-xl bg-[#F2C567] px-4 py-2 text-xs font-semibold text-[#1a1408]"
                    >
                      Build Full Journey for {quizItem.topic} →
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : null}

      {/* MODAL 4: ADD TO JOURNEY (Intelligent Content-to-Course Matching) */}
      {addModalItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-[#F2C567]/50 bg-[#111A29] p-5 text-[#F5F7FB] shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F2C567]">
                  Intelligent Content-to-Course Matching · Add to Journey
                </span>
                <h3 className="mt-1 text-lg font-bold">{addModalItem.title}</h3>
                <p className="mt-0.5 text-xs text-[#A9B6C9]">
                  Content ID: <code className="text-[#F2C567]">{addModalItem.id}</code> · Source: {addModalItem.source.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddModalItem(null)}
                className="rounded-full border border-[#2D3B50] p-1.5 text-[#A9B6C9] hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            {(() => {
              const match = matchContentToJourney(addModalItem, activeJourney);
              const targetPool = [
                activeJourney,
                ...JOURNEY_PATHS.filter((p) => p.id !== activeJourney.id),
              ];
              const chosenJourney =
                targetPool.find((p) => p.id === selectedTargetJourneyId) ??
                activeJourney;

              return (
                <div className="mt-4 space-y-3 text-xs">
                  <div className="rounded-2xl border border-[#F2C567]/35 bg-[#0B1220] p-3">
                    <p className="font-semibold text-[#F2C567]">
                      Noctis Match Recommendation:
                    </p>
                    <p className="mt-1 text-[#D8E1EE]">{match.whyRelevant}</p>
                  </div>

                  <label className="block">
                    <span className="font-semibold text-[#B6C2D4]">
                      Select Target Journey:
                    </span>
                    <select
                      value={chosenJourney.id}
                      onChange={(e) => {
                        const nextJ =
                          targetPool.find((p) => p.id === e.target.value) ??
                          activeJourney;
                        setSelectedTargetJourneyId(nextJ.id);
                        setSelectedTargetModuleId(nextJ.modules[0]?.id ?? "");
                      }}
                      className="mt-1 h-10 w-full rounded-xl border border-[#2D3B50] bg-[#0B1220] px-3 text-xs font-semibold text-[#F5F7FB]"
                    >
                      {targetPool.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.subject} {p.id === activeJourney.id ? "(Active Journey)" : ""}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="font-semibold text-[#B6C2D4]">
                      Select Target Module & Lesson:
                    </span>
                    <select
                      value={selectedTargetModuleId}
                      onChange={(e) => setSelectedTargetModuleId(e.target.value)}
                      className="mt-1 h-10 w-full rounded-xl border border-[#2D3B50] bg-[#0B1220] px-3 text-xs font-semibold text-[#F5F7FB]"
                    >
                      {chosenJourney.modules.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title} → {m.lessons[0]?.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const item = addModalItem;
                        setAddModalItem(null);
                        setPlanPreviewItem(item);
                      }}
                      className="rounded-xl border border-[#2D3B50] bg-[#0B1220] px-3.5 py-2 text-xs font-semibold text-[#F2C567]"
                    >
                      Or Build a New 5-Stage Journey
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmAddToJourney}
                      className="rounded-xl bg-[#F2C567] px-4 py-2 text-xs font-semibold text-[#1a1408]"
                    >
                      Confirm & Link to Lesson →
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : null}

      {/* MODAL 5: BUILD A JOURNEY WITH NOCTIS (Reviewable 5-Stage Curriculum Plan) */}
      {planPreviewItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl border border-[#F2C567]/60 bg-[#111A29] p-5 text-[#F5F7FB] shadow-2xl">
            {(() => {
              const generated = buildJourneyFromDiscoverContent(
                bridge,
                planPreviewItem.id,
              );
              const plan = generated.journey;
              if (!plan) return null;

              return (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#F2C567]">
                        Noctis Curriculum Generator · Review Before Starting
                      </span>
                      <h3 className="mt-1 text-xl font-bold">
                        {plan.subject} Learning Plan
                      </h3>
                      <p className="mt-0.5 text-xs text-[#A9B6C9]">
                        Built from Discover resource:{" "}
                        <strong className="text-[#F5F7FB]">
                          {planPreviewItem.title}
                        </strong>{" "}
                        ({planPreviewItem.type} · {planPreviewItem.skillLevel})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPlanPreviewItem(null)}
                      className="rounded-full border border-[#2D3B50] p-1.5 text-[#A9B6C9] hover:text-white"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  {planPreviewItem.safetyAndSupervisionNote ? (
                    <div className="mt-3 rounded-2xl border border-amber-500/40 bg-amber-950/25 p-3 text-xs text-amber-200">
                      <strong className="text-[#F2C567]">
                        Trade Safety & Supervised Practice Requirement:{" "}
                      </strong>
                      {planPreviewItem.safetyAndSupervisionNote}
                    </div>
                  ) : null}

                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#F2C567]">
                      Noctis 5-Stage Learning Plan:
                    </p>
                    {plan.modules.map((mod, idx) => (
                      <div
                        key={mod.id}
                        className={cn(
                          "rounded-2xl border p-3 text-xs",
                          idx === planPreviewItem.suggestedModuleIndex
                            ? "border-[#F2C567] bg-[#F2C567]/10"
                            : "border-[#263449] bg-[#0B1220]",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-[#F5F7FB]">
                            {mod.title}
                          </span>
                          {idx === planPreviewItem.suggestedModuleIndex ? (
                            <span className="rounded-full bg-[#F2C567] px-2.5 py-0.5 text-[10px] font-bold text-[#1a1408]">
                              Original Discover {planPreviewItem.type} attached here
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#9FB0C7]">
                              {mod.stage}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[#B6C2D4]">{mod.summary}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#1E2B3E] pt-3">
                    <span className="text-xs text-[#9FB0C7]">
                      Progress will be tracked in Journey, and Discover will continue to supply lesson-aware resources.
                    </span>
                    <button
                      type="button"
                      onClick={() => handleConfirmBuildJourney(planPreviewItem)}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#F2C567] to-[#E5B14C] px-4 text-xs font-semibold text-[#1a1408] shadow-md hover:brightness-105"
                    >
                      <Sparkles className="size-4" /> Activate Journey & Open Workspace →
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Compact Unified "Learning Actions" menu bar for existing FeedPost cards in /#feed (Academy)
 */
export function PostDiscoverBridgeBar({ post }: { post: FeedPost }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string>("");
  const item = useMemo(() => feedPostToDiscoverItem(post), [post]);
  const actions = useMemo(
    () =>
      getAdaptiveLearningActions(
        mapDiscoverTypeToInteractiveId(item.type, item.category),
      ),
    [item.type, item.category],
  );

  if (!item.isEducational) return null;

  function handleAddToActiveJourney() {
    const store = readJourney();
    const id = store.activeId || store.subjectId || "web";
    const activeJourney =
      store.custom && store.custom.id === id
        ? store.custom
        : JOURNEY_PATHS.find((p) => p.id === id) ??
          pathForTopic(store.topic || id);
    const bridge = readDiscoverJourneyState();
    const res = linkContentToJourney(bridge, item.id, activeJourney, {
      catalog: [item, ...DISCOVER_CONTENT_ITEMS],
    });
    if (!res.ok) {
      setStatus(res.error || "Already linked to this lesson.");
      return;
    }
    writeDiscoverJourneyState(res.state);
    setStatus(`Attached to ${activeJourney.subject} (${res.link?.lessonId})!`);
  }

  function handleBuildJourney() {
    const store = readJourney();
    const bridge = readDiscoverJourneyState();
    const built = buildJourneyFromDiscoverContent(bridge, item.id, [
      item,
      ...DISCOVER_CONTENT_ITEMS,
    ]);
    if (!built.ok || !built.journey) {
      setStatus(built.error || "Could not build journey.");
      return;
    }
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
    setStatus(`Built 5-stage “${built.journey.subject}” Journey!`);
  }

  return (
    <div className="mt-2.5 rounded-2xl border border-[#e4b86a]/35 bg-elevated px-3 py-2 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold text-primary">
          Learn from this · {item.topic}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-7 items-center gap-1 rounded-full border border-primary/40 px-2.5 text-[11px] font-semibold text-primary hover:bg-primary/10"
          >
            <Sparkles className="size-3" /> Learning Actions <ChevronDown className="size-3" />
          </button>
          <button
            type="button"
            onClick={handleBuildJourney}
            className="inline-flex h-7 items-center gap-1 rounded-full bg-primary px-2.5 text-[11px] font-semibold text-primary-fg"
          >
            Build a Journey
          </button>
        </div>
      </div>

      {open ? (
        <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {actions.map((act) => (
            <button
              key={act.id}
              type="button"
              onClick={() => {
                if (act.id === "journey") {
                  handleAddToActiveJourney();
                } else if (act.id === "explain") {
                  setStatus(`Noctis Summary: ${item.learningObjectives[0] ?? item.summary}`);
                } else if (act.id === "quiz") {
                  setStatus(`Quiz Prompt: ${item.learningObjectives[0]}`);
                } else {
                  setStatus(`Opened ${item.title} (${item.id})`);
                }
              }}
              className="rounded-xl border border-border bg-surface p-2 text-left text-[11px] hover:border-primary"
            >
              <span className="font-semibold text-fg">{act.title}</span>
              <span className="block text-muted">{act.description}</span>
            </button>
          ))}
        </div>
      ) : null}

      {status ? (
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted">
          <span>{status}</span>
          <Link to="/home" className="font-semibold text-primary hover:underline">
            Open Journey →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
