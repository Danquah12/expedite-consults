import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Compass,
  FileText,
  FlaskConical,
  GraduationCap,
  Layers,
  Play,
  Presentation,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { openNoctis } from "@/lib/ask-noctis";
import {
  COURSE_GROUPS,
  searchCourses,
} from "@/lib/course-catalog";
import {
  computeJourneyIndicators,
  JOURNEY_PATHS,
  NOCTIS_GUIDE_ACTIONS,
  pathForNamedCourse,
  readJourney,
  writeJourney,
  type JourneyModule,
  type JourneyPath,
  type JourneyStore,
  type NoctisGuideActionId,
} from "@/lib/journey-paths";
import {
  buildAuthorisedNoctisLessonContext,
  buildSharedCurriculumRecord,
  completeLearnActivity,
  getMyJourneyLessons,
  JOURNEY_TO_LEARN_CONNECTIONS,
  LEARN_FORMAT_CARDS,
  listAllSharedJourneys,
  readLearnPosition,
  resolveActiveJourney,
  resolveContinueLearningTarget,
  resolveJourneyActionToLearn,
  validateLearnRouteAccess,
  writeLearnPosition,
  type JourneyToLearnActionId,
  type LearnActivityType,
  type LearnFormatId,
  type SharedCurriculumRecord,
} from "@/lib/journey-learn-bridge";
import { cn } from "@/lib/utils";

export type LearnDeskProps = {
  initialJourneyId?: string;
  initialModuleId?: string;
  initialLessonId?: string;
  initialActivity?: LearnActivityType;
  initialFormat?: LearnFormatId;
  onOpenJourney?: () => void;
};

const FORMAT_ICONS: Record<LearnFormatId, typeof Play> = {
  video: Play,
  slides: Presentation,
  practice: ClipboardCheck,
  notes: FileText,
  labs: FlaskConical,
  noctis: Sparkles,
};

export function LearnDesk({
  initialJourneyId,
  initialModuleId,
  initialLessonId,
  initialActivity,
  initialFormat,
  onOpenJourney,
}: LearnDeskProps) {
  const navigate = useNavigate();
  const [store, setStore] = useState<JourneyStore>(() => readJourney());
  const [searchQuery, setSearchQuery] = useState("");
  const [workspaceMode, setWorkspaceMode] = useState<
    "home" | "player" | "module-list" | "progress" | "certificate"
  >(() => {
    if (initialLessonId) return "player";
    if (initialActivity === "module-list" || initialModuleId) return "module-list";
    if (initialActivity === "progress") return "progress";
    if (initialActivity === "certificate") return "certificate";
    return "home";
  });

  // Validate route access if route parameters are provided
  const routeValidation = useMemo(
    () =>
      validateLearnRouteAccess({
        journeyId: initialJourneyId,
        moduleId: initialModuleId,
        lessonId: initialLessonId,
        store,
      }),
    [initialJourneyId, initialModuleId, initialLessonId, store],
  );

  const savedPosition = useMemo(() => readLearnPosition(store), [store]);

  // Active curriculum record (shared between Journey and Learn)
  const [currentRecord, setCurrentRecord] = useState<SharedCurriculumRecord>(() => {
    if (routeValidation.valid && routeValidation.record) {
      return routeValidation.record;
    }
    const posCheck = validateLearnRouteAccess({
      journeyId: savedPosition.journeyId,
      moduleId: savedPosition.moduleId,
      lessonId: savedPosition.lessonId,
      store,
    });
    if (posCheck.valid && posCheck.record) {
      return posCheck.record;
    }
    const active = resolveActiveJourney(store);
    return buildSharedCurriculumRecord(
      active,
      active.modules[0]!,
      active.modules[0]!.lessons[0]!,
    );
  });

  const [activeFormat, setActiveFormat] = useState<LearnFormatId>(
    initialFormat ??
      (initialActivity === "practice"
        ? "practice"
        : initialActivity === "project"
          ? "labs"
          : initialActivity === "noctis"
            ? "noctis"
            : savedPosition.formatTab ?? "video"),
  );

  const [slideIndex, setSlideIndex] = useState(0);
  const [adaptiveMode, setAdaptiveMode] = useState<
    "none" | "analogy" | "stepByStep" | "visualWalkthrough"
  >("none");
  const [practiceText, setPracticeText] = useState("");
  const [quizChoice, setQuizChoice] = useState<number | null>(null);
  const [projectDraft, setProjectDraft] = useState("");
  const [activityFeedback, setActivityFeedback] = useState<{
    tone: "emerald" | "amber" | "gold";
    message: string;
    remediation?: string;
    nextAction?: string;
  } | null>(null);

  const [noctisAction, setNoctisAction] = useState<NoctisGuideActionId>("simpler");
  const [customNoctisQuestion, setCustomNoctisQuestion] = useState("");
  const [submittedNoctisQuestion, setSubmittedNoctisQuestion] = useState("");
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<string>("all");

  // Synchronise state when route props change
  useEffect(() => {
    const freshStore = readJourney();
    setStore(freshStore);
    const check = validateLearnRouteAccess({
      journeyId: initialJourneyId,
      moduleId: initialModuleId,
      lessonId: initialLessonId,
      store: freshStore,
    });
    if (check.valid && check.record) {
      setCurrentRecord(check.record);
      const draft =
        freshStore.practiceDrafts?.[check.record.journeyId]?.[check.record.lessonId] ?? "";
      setPracticeText(draft);
      setProjectDraft(freshStore.projects[check.record.journeyId] ?? "");
      if (initialLessonId) {
        setWorkspaceMode("player");
      } else if (initialModuleId || initialActivity === "module-list") {
        setWorkspaceMode("module-list");
      } else if (initialActivity === "progress") {
        setWorkspaceMode("progress");
      } else if (initialActivity === "certificate") {
        setWorkspaceMode("certificate");
      }
      if (initialActivity === "practice") setActiveFormat("practice");
      else if (initialActivity === "project") setActiveFormat("labs");
      else if (initialActivity === "noctis") setActiveFormat("noctis");
      else if (initialFormat) setActiveFormat(initialFormat);
    }
  }, [initialJourneyId, initialModuleId, initialLessonId, initialActivity, initialFormat]);

  // Keep practice & project drafts synced when switching lessons
  useEffect(() => {
    const savedPractice =
      store.practiceDrafts?.[currentRecord.journeyId]?.[currentRecord.lessonId] ?? "";
    setPracticeText(savedPractice);
    setProjectDraft(store.projects[currentRecord.journeyId] ?? "");
    setSlideIndex(0);
    setQuizChoice(null);
    setActivityFeedback(null);
  }, [currentRecord.journeyId, currentRecord.lessonId, store.practiceDrafts, store.projects]);

  const continueTarget = useMemo(
    () => resolveContinueLearningTarget(store),
    [store],
  );

  const { allActiveJourneys, myLessons, recommendedLessons } = useMemo(
    () => getMyJourneyLessons(store),
    [store],
  );

  const allSharedJourneys = useMemo(() => listAllSharedJourneys(store), [store]);

  const indicators = useMemo(
    () => computeJourneyIndicators(currentRecord.journey, store),
    [currentRecord.journey, store],
  );

  const noctisContext = useMemo(
    () =>
      buildAuthorisedNoctisLessonContext(
        currentRecord,
        store,
        noctisAction,
        submittedNoctisQuestion,
      ),
    [currentRecord, store, noctisAction, submittedNoctisQuestion],
  );

  // Filtered My Lessons when user types in the search bar
  const filteredMyLessons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return myLessons;
    return myLessons.filter(
      (item) =>
        item.record.lesson.title.toLowerCase().includes(q) ||
        item.record.module.title.toLowerCase().includes(q) ||
        item.record.journey.title.toLowerCase().includes(q) ||
        item.record.journey.subject.toLowerCase().includes(q) ||
        item.record.lesson.doThis.toLowerCase().includes(q),
    );
  }, [myLessons, searchQuery]);

  // Explore Courses (users can discover & study courses without creating a Journey first)
  const exploreJourneys = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allSharedJourneys.filter((j) => {
      if (!q) return true;
      return (
        j.title.toLowerCase().includes(q) ||
        j.subject.toLowerCase().includes(q) ||
        j.blurb.toLowerCase().includes(q) ||
        j.modules.some((m) => m.title.toLowerCase().includes(q))
      );
    });
  }, [allSharedJourneys, searchQuery]);

  const catalogMatches = useMemo(() => {
    const q = searchQuery.trim();
    if (q.length >= 2) {
      return searchCourses(q, 9).map((hit) => ({
        groupId: hit.groupId,
        groupTitle: hit.group,
        providerName: hit.track,
        courseName: hit.course,
      }));
    }
    const group =
      selectedCatalogCategory === "all"
        ? COURSE_GROUPS[0]
        : COURSE_GROUPS.find((g) => g.id === selectedCatalogCategory) ?? COURSE_GROUPS[0];
    return (group?.tracks ?? [])
      .flatMap((t) =>
        t.courses.map((courseName) => ({
          groupId: group!.id,
          groupTitle: group!.name,
          providerName: t.name,
          courseName,
        })),
      )
      .slice(0, 6);
  }, [searchQuery, selectedCatalogCategory]);

  function openRecordInPlayer(
    record: SharedCurriculumRecord,
    format: LearnFormatId = "video",
    mode: "player" | "module-list" | "progress" | "certificate" = "player",
  ) {
    // Record Exposure when opening a lesson in the player (never awards mastery automatically)
    const sync = completeLearnActivity(store, {
      journeyId: record.journeyId,
      moduleId: record.moduleId,
      lessonId: record.lessonId,
      type: "view-lesson",
    });
    setStore(sync.store);
    setCurrentRecord(record);
    setActiveFormat(format);
    setWorkspaceMode(mode);
    writeLearnPosition(
      {
        journeyId: record.journeyId,
        moduleId: record.moduleId,
        lessonId: record.lessonId,
        activity:
          mode === "module-list"
            ? "module-list"
            : mode === "progress"
              ? "progress"
              : mode === "certificate"
                ? "certificate"
                : format === "practice"
                  ? "practice"
                  : format === "labs"
                    ? "project"
                    : format === "noctis"
                      ? "noctis"
                      : "lesson",
        formatTab: format,
      },
      sync.store,
    );
  }

  function handleJourneyActionTrigger(
    actionId: JourneyToLearnActionId,
    opts?: { journey?: JourneyPath; moduleId?: string; lessonId?: string },
  ) {
    const resolved = resolveJourneyActionToLearn(actionId, {
      journey: opts?.journey ?? currentRecord.journey,
      moduleId: opts?.moduleId ?? currentRecord.moduleId,
      lessonId: opts?.lessonId ?? currentRecord.lessonId,
      store,
    });
    setStore(resolved.store);
    setCurrentRecord(resolved.record);
    setActiveFormat(resolved.formatTab);
    if (resolved.activity === "module-list") {
      setWorkspaceMode("module-list");
    } else if (resolved.activity === "progress") {
      setWorkspaceMode("progress");
    } else if (resolved.activity === "certificate") {
      setWorkspaceMode("certificate");
    } else {
      setWorkspaceMode("player");
    }
  }

  function studyCourseWithoutJourneyFirst(courseTitle: string) {
    // Check if it matches an existing shared journey first so we never duplicate a course
    const existing = allSharedJourneys.find(
      (j) =>
        j.subject.toLowerCase() === courseTitle.toLowerCase() ||
        j.title.toLowerCase() === courseTitle.toLowerCase(),
    );
    const targetJourney = existing ?? pathForNamedCourse(courseTitle);
    if (!existing) {
      const nextStore: JourneyStore = {
        ...store,
        custom: targetJourney,
      };
      writeJourney(nextStore);
      setStore(nextStore);
    }
    const firstMod = targetJourney.modules[0]!;
    const firstLesson = firstMod.lessons[0]!;
    const rec = buildSharedCurriculumRecord(targetJourney, firstMod, firstLesson);
    openRecordInPlayer(rec, "video", "player");
  }

  function handleCompletePractice() {
    const res = completeLearnActivity(store, {
      journeyId: currentRecord.journeyId,
      moduleId: currentRecord.moduleId,
      lessonId: currentRecord.lessonId,
      type: "complete-practice",
      practiceResponse: practiceText,
    });
    setStore(res.store);
    setActivityFeedback({
      tone: "gold",
      message: res.feedbackMessage,
      nextAction: res.nextRecommendedAction,
    });
  }

  function handleGradeQuiz() {
    if (quizChoice === null) return;
    const res = completeLearnActivity(store, {
      journeyId: currentRecord.journeyId,
      moduleId: currentRecord.moduleId,
      lessonId: currentRecord.lessonId,
      type: "submit-quiz",
      quizChoice,
    });
    setStore(res.store);
    setActivityFeedback({
      tone: res.quizPassed ? "emerald" : "amber",
      message: res.feedbackMessage,
      remediation: res.remediationRecommendation,
      nextAction: res.nextRecommendedAction,
    });
  }

  function handleSaveProject() {
    const res = completeLearnActivity(store, {
      journeyId: currentRecord.journeyId,
      moduleId: currentRecord.moduleId,
      lessonId: currentRecord.lessonId,
      type: "submit-project",
      projectSubmission: projectDraft,
    });
    setStore(res.store);
    setActivityFeedback({
      tone: res.indicators.projectEvaluation.verified ? "emerald" : "gold",
      message: res.feedbackMessage,
      nextAction: res.nextRecommendedAction,
    });
  }

  // If an invalid route parameter was passed, show a clear, actionable validation error state
  if (!routeValidation.valid) {
    return (
      <div className="mx-auto max-w-4xl rounded-3xl border border-amber-400/40 bg-[#0E1726] p-6 text-[#F5F7FB] shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
          Curriculum Access & Route Validation
        </p>
        <h2 className="mt-1 font-display text-xl font-semibold">
          Requested lesson or module could not be verified
        </h2>
        <p className="mt-2 text-sm text-[#A9B6C9]">{routeValidation.error}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/learn"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#F2C567] px-4 text-xs font-semibold text-[#1a1408]"
          >
            Return to Learn Homepage
          </Link>
          <Link
            to="/home"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#2D3B50] bg-[#141E2D] px-4 text-xs font-semibold text-[#F5F7FB]"
          >
            Open My Journey
          </Link>
        </div>
      </div>
    );
  }

  const slides = currentRecord.lesson.slides?.length
    ? currentRecord.lesson.slides
    : [
        {
          heading: currentRecord.lesson.title,
          bullets: [
            currentRecord.module.summary,
            `Practical step: ${currentRecord.lesson.doThis}`,
            ...(currentRecord.lesson.objectives ?? []),
          ],
          takeaway: currentRecord.lesson.doThis,
        },
      ];
  const activeSlide = slides[slideIndex] ?? slides[0]!;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 text-[#F5F7FB]">
      {/* Top Persistent Journey <-> Learn Synchronisation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#2D3B50] bg-[#0E1726]/95 px-4 py-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setWorkspaceMode("home")}
            className={cn(
              "inline-flex items-center gap-1.5 font-semibold transition",
              workspaceMode === "home"
                ? "text-[#F2C567]"
                : "text-[#D8E1EE] hover:text-[#F2C567]",
            )}
          >
            <BookOpen className="size-4 text-[#F2C567]" />
            Learn with Noctis
          </button>
          <span className="text-[#5E6E85]">/</span>
          <span className="font-semibold text-[#F5F7FB]">
            {currentRecord.journey.title}
          </span>
          <span className="rounded-full border border-[#2D3B50] bg-[#141E2D] px-2.5 py-0.5 text-[11px] font-semibold text-[#A9B6C9]">
            Module {currentRecord.moduleIndex + 1} · Lesson {currentRecord.lessonIndex + 1}
          </span>
          <span className="rounded-full border border-[#F2C567]/40 bg-[#F2C567]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#F2C567]">
            Mastery: {indicators.knowledgeMasteryPct}% ({indicators.masteryTier})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              ["home", "Learn Home"],
              ["module-list", "Module Lessons"],
              ["player", "Lesson Player"],
              ["progress", "My Progress"],
              ["certificate", "Certificate"],
            ] as const
          ).map(([modeId, label]) => (
            <button
              key={modeId}
              type="button"
              onClick={() => setWorkspaceMode(modeId)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition",
                workspaceMode === modeId
                  ? "bg-[#F2C567] text-[#1a1408]"
                  : "border border-[#2D3B50] bg-[#141E2D] text-[#A9B6C9] hover:text-[#F5F7FB]",
              )}
            >
              {label}
            </button>
          ))}
          {onOpenJourney ? (
            <button
              type="button"
              onClick={onOpenJourney}
              className="inline-flex items-center gap-1 rounded-full border border-[#F2C567]/50 bg-[#1a140e] px-3 py-1 text-xs font-semibold text-[#F2C567] hover:bg-[#241910]"
            >
              <Compass className="size-3.5" /> Return to Journey
            </button>
          ) : (
            <Link
              to="/home"
              className="inline-flex items-center gap-1 rounded-full border border-[#F2C567]/50 bg-[#1a140e] px-3 py-1 text-xs font-semibold text-[#F2C567] hover:bg-[#241910]"
            >
              <Compass className="size-3.5" /> Return to Journey
            </Link>
          )}
        </div>
      </div>

      {/* SECTION 1: LEARN HOMEPAGE (Matches Screenshot 3 "Learn with Noctis" + 3 Main Areas) */}
      {workspaceMode === "home" ? (
        <>
          {/* Main Learn with Noctis Hero Card (Screenshot 3 exact layout) */}
          <section
            aria-label="Learn with Noctis"
            className="rounded-3xl border border-[#2D3B50] bg-[#0B1220] p-5 shadow-xl md:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-[#F5F7FB] md:text-3xl">
                  Learn with Noctis
                </h1>
                <p className="mt-1 text-sm text-[#A9B6C9]">
                  Continue your journey or explore lessons from any subject.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  openRecordInPlayer(continueTarget.record, "noctis", "player")
                }
                title="Ask Noctis with current lesson context"
                className="grid size-11 shrink-0 place-items-center rounded-2xl border border-[#F2C567]/40 bg-[#F2C567]/10 text-[#F2C567] transition hover:bg-[#F2C567]/20"
              >
                <Sparkles className="size-5" />
              </button>
            </div>

            {/* Search bar */}
            <div className="relative mt-5">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#7E8FA6]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, lessons, or topics..."
                className="h-12 w-full rounded-2xl border border-[#2D3B50] bg-[#141E2D] pl-11 pr-4 text-sm text-[#F5F7FB] placeholder:text-[#7E8FA6] focus:border-[#F2C567] focus:outline-none"
              />
            </div>

            {/* 1. Continue Learning Card (Gold-bordered active journey resume card from Screenshot 3) */}
            <div className="mt-5 rounded-2xl border-2 border-[#F2C567]/70 bg-[#111A2B] p-4 shadow-lg md:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border border-[#F2C567]/50 bg-[#F2C567]/15 text-[#F2C567]">
                    <ShieldCheck className="size-5" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-[#F5F7FB] md:text-lg">
                        {continueTarget.record.lesson.title}
                      </h2>
                      <span className="rounded-full border border-[#F2C567]/40 bg-[#F2C567]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#F2C567]">
                        {continueTarget.lessonStatus}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#A9B6C9]">
                      {continueTarget.subtitle}
                    </p>
                  </div>
                </div>

                {/* Quick active journey switcher so user can switch between any journey */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {JOURNEY_PATHS.map((j) => {
                    const isActive = j.id === continueTarget.record.journeyId;
                    return (
                      <button
                        key={j.id}
                        type="button"
                        onClick={() =>
                          handleJourneyActionTrigger("start-journey", { journey: j })
                        }
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                          isActive
                            ? "bg-[#F2C567] text-[#1a1408]"
                            : "border border-[#2D3B50] bg-[#141E2D] text-[#A9B6C9] hover:text-[#F5F7FB]",
                        )}
                      >
                        {j.subject}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#1F2C40]">
                  <div
                    className="h-full rounded-full bg-[#F2C567] transition-all duration-300"
                    style={{ width: `${Math.max(8, continueTarget.progressPct)}%` }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#A9B6C9]">
                  <span>
                    Journey progress: {continueTarget.progressPct}% · Verified mastery:{" "}
                    {continueTarget.masteryPct}%
                  </span>
                  <span>
                    Shared IDs: {continueTarget.record.journeyId} /{" "}
                    {continueTarget.record.moduleId} / {continueTarget.record.lessonId}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    openRecordInPlayer(
                      continueTarget.record,
                      continueTarget.formatTab,
                      "player",
                    )
                  }
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#E5BA63] px-5 text-sm font-bold text-[#1a1408] shadow-md transition hover:bg-[#f0c975]"
                >
                  {continueTarget.buttonLabel}
                </button>
                <Link
                  to="/learn/lessons/$lessonId"
                  params={{ lessonId: continueTarget.record.lessonId }}
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-[#2D3B50] bg-[#141E2D] px-4 text-xs font-semibold text-[#F5F7FB] hover:border-[#F2C567]"
                >
                  Direct Link ↗
                </Link>
              </div>
            </div>

            {/* 5. Explore learning formats (Exact 3x2 grid from Screenshot 3) */}
            <div className="mt-6">
              <h3 className="text-sm font-bold text-[#F5F7FB]">
                Explore learning formats
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {LEARN_FORMAT_CARDS.map((card) => {
                  const Icon = FORMAT_ICONS[card.id];
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() =>
                        openRecordInPlayer(continueTarget.record, card.id, "player")
                      }
                      className="group flex flex-col items-center justify-center rounded-2xl border border-[#243247] bg-[#131D2E] p-4 text-center transition hover:-translate-y-0.5 hover:border-[#F2C567]"
                    >
                      <span className="grid size-9 place-items-center rounded-full bg-[#F2C567]/15 text-[#F2C567] transition group-hover:bg-[#F2C567] group-hover:text-[#1a1408]">
                        <Icon className="size-4" />
                      </span>
                      <span className="mt-2.5 text-sm font-semibold text-[#F5F7FB]">
                        {card.label}
                      </span>
                      <span className="mt-1 text-[11px] text-[#8FA1B8]">
                        {card.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SECTION 2: MY LESSONS (Lessons from all active journeys) & RECOMMENDED LESSONS */}
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
            <section
              aria-label="My Lessons"
              className="rounded-3xl border border-[#2D3B50] bg-[#0E1726] p-5 shadow-lg"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#F2C567]">
                    Shared Curriculum · Active Journeys ({allActiveJourneys.length})
                  </p>
                  <h2 className="mt-0.5 font-display text-lg font-bold text-[#F5F7FB]">
                    My Lessons (From My Journeys)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setWorkspaceMode("module-list")}
                  className="rounded-xl border border-[#2D3B50] bg-[#141E2D] px-3 py-1.5 text-xs font-semibold text-[#F2C567] hover:border-[#F2C567]"
                >
                  View by Module ({currentRecord.journey.modules.length}) →
                </button>
              </div>

              <ul className="mt-4 space-y-2.5">
                {filteredMyLessons.slice(0, 10).map(({ record, status, isCurrent }) => (
                  <li
                    key={`${record.journeyId}-${record.lessonId}`}
                    className={cn(
                      "rounded-2xl border p-3.5 transition",
                      isCurrent
                        ? "border-[#F2C567] bg-[#162235]"
                        : status === "Completed"
                          ? "border-emerald-500/35 bg-[#112230]"
                          : status === "Needs Revision"
                            ? "border-amber-400/45 bg-[#241C16]"
                            : "border-[#2D3B50] bg-[#141E2D]/80",
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full bg-[#0B1220] px-2 py-0.5 text-[10px] font-semibold text-[#F2C567]">
                            {record.journey.subject} · M{record.moduleIndex + 1}.L
                            {record.lessonIndex + 1}
                          </span>
                          <span className="rounded-full border border-[#2D3B50] px-2 py-0.5 text-[10px] font-semibold text-[#A9B6C9]">
                            {record.lesson.kind}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                              status === "Completed"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : status === "Needs Revision"
                                  ? "bg-amber-500/20 text-amber-300"
                                  : status === "In Progress" ||
                                      status === "Awaiting Assessment"
                                    ? "bg-[#F2C567]/20 text-[#F2C567]"
                                    : "bg-[#1F2C40] text-[#9AA9BC]",
                            )}
                          >
                            {status}
                          </span>
                          {isCurrent ? (
                            <span className="rounded-full bg-[#F2C567] px-2 py-0.5 text-[10px] font-bold text-[#1a1408]">
                              Current Position
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1.5 text-sm font-semibold text-[#F5F7FB]">
                          {record.lesson.title}
                        </p>
                        <p className="mt-0.5 text-xs text-[#A9B6C9]">
                          {record.lesson.doThis}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openRecordInPlayer(record, "video", "player")}
                          className="rounded-xl bg-[#F2C567] px-3 py-1.5 text-xs font-semibold text-[#1a1408] hover:bg-[#f5d07e]"
                        >
                          Open Lesson
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            openRecordInPlayer(record, "practice", "player")
                          }
                          className="rounded-xl border border-[#2D3B50] bg-[#0B1220] px-2.5 py-1.5 text-xs font-semibold text-[#A9B6C9] hover:text-[#F5F7FB]"
                        >
                          Quiz
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Recommended Lessons + How Journey & Learn Connect */}
            <div className="space-y-5">
              <section
                aria-label="Recommended Lessons"
                className="rounded-3xl border border-[#2D3B50] bg-[#0E1726] p-5 shadow-lg"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#F2C567]">
                  Adaptive Curriculum Queue
                </p>
                <h2 className="mt-0.5 font-display text-lg font-bold text-[#F5F7FB]">
                  Recommended Lessons & Remediation
                </h2>
                <p className="mt-1 text-xs text-[#A9B6C9]">
                  Prioritises any module flagged for revision after a quiz check, then your next unverified lesson.
                </p>

                <ul className="mt-3.5 space-y-2.5">
                  {recommendedLessons.map(({ record, reason, priority }) => (
                    <li
                      key={`rec-${record.journeyId}-${record.lessonId}`}
                      className={cn(
                        "rounded-2xl border p-3.5",
                        priority === "revision"
                          ? "border-amber-400/45 bg-[#241C16]"
                          : "border-[#2D3B50] bg-[#141E2D]",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                            priority === "revision"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-[#F2C567]/15 text-[#F2C567]",
                          )}
                        >
                          {priority === "revision" ? "Revision Priority" : "Next Step"}
                        </span>
                        <span className="text-[11px] font-semibold text-[#A9B6C9]">
                          {record.journey.subject}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm font-semibold text-[#F5F7FB]">
                        {record.lesson.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[#A9B6C9]">{reason}</p>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openRecordInPlayer(record, "video", "player")}
                          className="rounded-xl bg-[#F2C567] px-3 py-1.5 text-xs font-semibold text-[#1a1408]"
                        >
                          Study Lesson →
                        </button>
                        <button
                          type="button"
                          onClick={() => openRecordInPlayer(record, "noctis", "player")}
                          className="rounded-xl border border-[#2D3B50] bg-[#0B1220] px-3 py-1.5 text-xs font-semibold text-[#F2C567]"
                        >
                          Ask Noctis
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 1. How the two tabs connect (Screenshot 2 visual flow) */}
              <section
                aria-label="How Journey and Learn Connect"
                className="rounded-3xl border border-[#2D3B50] bg-[#0B1220] p-5 shadow-lg"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#F2C567]">
                  1. Shared Curriculum Architecture
                </p>
                <h3 className="mt-0.5 font-display text-base font-bold text-[#F5F7FB]">
                  How Journey & Learn Connect
                </h3>
                <div className="mt-3 space-y-2 text-center">
                  <div className="rounded-2xl border border-[#2D3B50] bg-[#141E2D] p-3">
                    <p className="text-xs font-bold text-[#F5F7FB]">Journey</p>
                    <p className="text-[11px] text-[#A9B6C9]">
                      Choose a goal, create a roadmap, and select a module.
                    </p>
                  </div>
                  <div className="text-xs font-bold text-[#F2C567]">↓</div>
                  <div className="rounded-2xl border-2 border-[#F2C567] bg-[#192538] p-3">
                    <p className="text-xs font-bold text-[#F2C567]">Learn</p>
                    <p className="text-[11px] text-[#F5F7FB]">
                      Open the correct lesson with video, slides, explanations, notes, and exercises.
                    </p>
                  </div>
                  <div className="text-xs font-bold text-[#F2C567]">↓</div>
                  <div className="rounded-2xl border border-[#2D3B50] bg-[#141E2D] p-3">
                    <p className="text-xs font-bold text-[#F5F7FB]">
                      Practice and prove understanding
                    </p>
                    <p className="text-[11px] text-[#A9B6C9]">
                      Complete the quiz or practical activity and receive feedback.
                    </p>
                  </div>
                  <div className="text-xs font-bold text-[#F2C567]">⇅</div>
                  <div className="rounded-2xl border border-[#2D3B50] bg-[#141E2D] p-3">
                    <p className="text-xs font-bold text-[#F2C567]">Noctis</p>
                    <p className="text-[11px] text-[#A9B6C9]">
                      Explains difficult concepts, identifies gaps, and recommends the next lesson.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* SECTION 4: EXPLORE COURSES (Study any course without creating a Journey first!) */}
          <section
            aria-label="Explore Courses"
            className="rounded-3xl border border-[#2D3B50] bg-[#0E1726] p-5 shadow-lg"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#F2C567]">
                  Open Exploration · No Journey Required First
                </p>
                <h2 className="mt-0.5 font-display text-lg font-bold text-[#F5F7FB]">
                  Explore Courses & Study Immediately
                </h2>
                <p className="mt-0.5 text-xs text-[#A9B6C9]">
                  Open any flagship subject or professional certification course directly in the Lesson Player without creating a Journey first, or start a tracked Journey at any time.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedCatalogCategory("all")}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    selectedCatalogCategory === "all"
                      ? "bg-[#F2C567] text-[#1a1408]"
                      : "border border-[#2D3B50] bg-[#141E2D] text-[#A9B6C9]",
                  )}
                >
                  Featured Flagships
                </button>
                {COURSE_GROUPS.slice(0, 5).map((grp) => (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => setSelectedCatalogCategory(grp.id)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      selectedCatalogCategory === grp.id
                        ? "bg-[#F2C567] text-[#1a1408]"
                        : "border border-[#2D3B50] bg-[#141E2D] text-[#A9B6C9]",
                    )}
                  >
                    {grp.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Flagship Shared Courses */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {exploreJourneys.map((j) => {
                const firstMod = j.modules[0]!;
                const firstLes = firstMod.lessons[0]!;
                const rec = buildSharedCurriculumRecord(j, firstMod, firstLes);
                const jInd = computeJourneyIndicators(j, store);
                return (
                  <div
                    key={j.id}
                    className="flex flex-col justify-between rounded-2xl border border-[#2D3B50] bg-[#141E2D] p-4 transition hover:border-[#F2C567]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-[#F2C567]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#F2C567]">
                          {j.subject}
                        </span>
                        <span className="text-[11px] font-semibold text-[#A9B6C9]">
                          {j.modules.length} modules · {jInd.totalLessonsCount} lessons
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-bold text-[#F5F7FB]">
                        {j.title}
                      </h3>
                      <p className="mt-1 text-xs text-[#A9B6C9]">{j.blurb}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openRecordInPlayer(rec, "video", "player")}
                        className="flex-1 rounded-xl bg-[#F2C567] px-3 py-2 text-xs font-semibold text-[#1a1408] hover:bg-[#f5d07e]"
                      >
                        Study Lesson 1 Now
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentRecord(rec);
                          setWorkspaceMode("module-list");
                        }}
                        className="rounded-xl border border-[#2D3B50] bg-[#0B1220] px-3 py-2 text-xs font-semibold text-[#F5F7FB] hover:border-[#F2C567]"
                      >
                        Modules
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Catalogue Quick-Study Cards (Certifications & Skilled Trades) */}
            <div className="mt-4 border-t border-[#2D3B50] pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#A9B6C9]">
                Professional Certifications & Skilled Trades (Instant Lesson Player Access)
              </p>
              <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {catalogMatches.map((item) => (
                  <div
                    key={`${item.providerName}-${item.courseName}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[#2D3B50] bg-[#0B1220] p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold text-[#F2C567]">
                        {item.providerName}
                      </p>
                      <p className="truncate text-xs font-semibold text-[#F5F7FB]">
                        {item.courseName}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => studyCourseWithoutJourneyFirst(item.courseName)}
                      className="shrink-0 rounded-xl border border-[#F2C567]/50 bg-[#F2C567]/15 px-3 py-1.5 text-xs font-semibold text-[#F2C567] hover:bg-[#F2C567] hover:text-[#1a1408]"
                    >
                      Open in Learn →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 3 TABLE: Connect Each Action in Journey to Learn (Screenshot 4) */}
          <section
            aria-label="Journey to Learn Action Mapping"
            className="rounded-3xl border border-[#2D3B50] bg-[#0E1726] p-5 shadow-lg"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#F2C567]">
              3. Connected Stage Routing
            </p>
            <h2 className="mt-0.5 font-display text-lg font-bold text-[#F5F7FB]">
              Journey Action → Learn Destination Matrix
            </h2>
            <p className="mt-1 text-xs text-[#A9B6C9]">
              Every stage in Journey links directly to its corresponding Learn function while preserving your current lesson position.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#2D3B50] text-[#A9B6C9]">
                    <th className="py-2.5 pr-4 font-semibold">Journey action</th>
                    <th className="py-2.5 pr-4 font-semibold">Destination in Learn</th>
                    <th className="py-2.5 text-right font-semibold">Try Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D3B50]/60">
                  {JOURNEY_TO_LEARN_CONNECTIONS.map((row) => (
                    <tr key={row.actionId}>
                      <td className="py-2.5 pr-4 font-semibold text-[#F5F7FB]">
                        {row.journeyAction}
                      </td>
                      <td className="py-2.5 pr-4 text-[#A9B6C9]">
                        {row.learnDestination}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleJourneyActionTrigger(row.actionId)}
                          className="rounded-lg border border-[#F2C567]/40 bg-[#F2C567]/10 px-2.5 py-1 text-[11px] font-semibold text-[#F2C567] hover:bg-[#F2C567] hover:text-[#1a1408]"
                        >
                          Open in Learn →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      {/* MODULE LESSON LIST VIEW (/learn/journeys/$journeyId/modules/$moduleId) */}
      {workspaceMode === "module-list" ? (
        <section
          aria-label="Module Lesson List"
          className="rounded-3xl border border-[#2D3B50] bg-[#0E1726] p-5 shadow-xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">
                Shared Curriculum · {currentRecord.journey.title}
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-[#F5F7FB]">
                Roadmap Modules & Lesson List
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setWorkspaceMode("home")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#2D3B50] bg-[#141E2D] px-3.5 py-2 text-xs font-semibold text-[#F5F7FB]"
            >
              <ArrowLeft className="size-3.5" /> Back to Learn Home
            </button>
          </div>

          {/* Module Selector Tabs */}
          <div className="mt-4 flex flex-wrap gap-2">
            {currentRecord.journey.modules.map((m, idx) => {
              const isSelected = m.id === currentRecord.moduleId;
              const passedMod = (store.checks[currentRecord.journeyId] ?? []).includes(
                m.id,
              );
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    const rec = buildSharedCurriculumRecord(
                      currentRecord.journey,
                      m,
                      m.lessons[0]!,
                    );
                    setCurrentRecord(rec);
                    writeLearnPosition(
                      {
                        journeyId: rec.journeyId,
                        moduleId: rec.moduleId,
                        lessonId: rec.lessonId,
                        activity: "module-list",
                      },
                      store,
                    );
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition",
                    isSelected
                      ? "bg-[#F2C567] text-[#1a1408]"
                      : "border border-[#2D3B50] bg-[#141E2D] text-[#A9B6C9] hover:text-[#F5F7FB]",
                  )}
                >
                  {passedMod ? <Check className="size-3.5" /> : null}
                  {idx + 1}. {m.title}
                </button>
              );
            })}
          </div>

          {/* Selected Module Detail & Lessons */}
          <div className="mt-5 rounded-2xl border border-[#2D3B50] bg-[#141E2D] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">
                  Module {currentRecord.moduleIndex + 1} ·{" "}
                  {currentRecord.module.stage ?? "Core Curriculum"}
                </span>
                <h3 className="mt-0.5 text-lg font-bold text-[#F5F7FB]">
                  {currentRecord.module.title}
                </h3>
                <p className="mt-1 text-xs text-[#A9B6C9]">
                  {currentRecord.module.summary}
                </p>
              </div>
              <Link
                to="/learn/journeys/$journeyId/modules/$moduleId"
                params={{
                  journeyId: currentRecord.journeyId,
                  moduleId: currentRecord.moduleId,
                }}
                className="rounded-xl border border-[#2D3B50] bg-[#0B1220] px-3 py-1.5 text-xs font-semibold text-[#F2C567]"
              >
                Module Permalink ↗
              </Link>
            </div>

            <ol className="mt-4 space-y-2.5">
              {currentRecord.module.lessons.map((les, idx) => {
                const rec = buildSharedCurriculumRecord(
                  currentRecord.journey,
                  currentRecord.module,
                  les,
                );
                const practiced = (
                  store.practicesDone?.[rec.journeyId] ?? []
                ).includes(les.id);
                const viewed = (store.lessonsViewed?.[rec.journeyId] ?? []).includes(
                  les.id,
                );
                return (
                  <li
                    key={les.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#2D3B50] bg-[#0B1220] p-3.5"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-[#F2C567]">
                          Lesson {idx + 1}
                        </span>
                        <span className="rounded-full border border-[#2D3B50] px-2 py-0.5 text-[10px] font-semibold text-[#A9B6C9]">
                          {les.kind}
                        </span>
                        {practiced ? (
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                            Practice Done
                          </span>
                        ) : viewed ? (
                          <span className="rounded-full bg-[#F2C567]/20 px-2 py-0.5 text-[10px] font-semibold text-[#F2C567]">
                            In Progress
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm font-semibold text-[#F5F7FB]">
                        {les.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[#A9B6C9]">{les.doThis}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openRecordInPlayer(rec, "video", "player")}
                        className="rounded-xl bg-[#F2C567] px-3.5 py-2 text-xs font-semibold text-[#1a1408]"
                      >
                        Open in Player →
                      </button>
                      <button
                        type="button"
                        onClick={() => openRecordInPlayer(rec, "practice", "player")}
                        className="rounded-xl border border-[#2D3B50] bg-[#141E2D] px-3 py-2 text-xs font-semibold text-[#F5F7FB]"
                      >
                        Practice & Quiz
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      ) : null}

      {/* SECTION D: FULL MULTI-FORMAT LESSON PLAYER (/learn/lessons/$lessonId) */}
      {workspaceMode === "player" ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          {/* Left Main Lesson Delivery Studio */}
          <section
            aria-label="Lesson Player"
            className="space-y-4 rounded-3xl border border-[#2D3B50] bg-[#0E1726] p-5 shadow-xl"
          >
            {/* Header & Breadcrumb */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#2D3B50] pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#F2C567]">
                  <span className="font-semibold uppercase tracking-wider">
                    {currentRecord.journey.subject} · Module{" "}
                    {currentRecord.moduleIndex + 1}: {currentRecord.module.title}
                  </span>
                  <span>·</span>
                  <span className="rounded-full border border-[#F2C567]/40 bg-[#F2C567]/10 px-2 py-0.5 text-[10px]">
                    Lesson ID: {currentRecord.lessonId} (v{currentRecord.curriculumVersion})
                  </span>
                </div>
                <h2 className="mt-1 font-display text-xl font-bold text-[#F5F7FB] md:text-2xl">
                  Lesson {currentRecord.lessonIndex + 1} of{" "}
                  {currentRecord.module.lessons.length}: {currentRecord.lesson.title}
                </h2>
                <p className="mt-1 text-xs text-[#A9B6C9]">
                  Objective: {currentRecord.lesson.doThis}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWorkspaceMode("module-list")}
                  className="rounded-xl border border-[#2D3B50] bg-[#141E2D] px-3 py-1.5 text-xs font-semibold text-[#A9B6C9] hover:text-[#F5F7FB]"
                >
                  Module Lessons
                </button>
                <button
                  type="button"
                  onClick={() => setWorkspaceMode("home")}
                  className="rounded-xl border border-[#2D3B50] bg-[#141E2D] px-3 py-1.5 text-xs font-semibold text-[#F2C567]"
                >
                  Learn Home
                </button>
              </div>
            </div>

            {/* Lesson Switcher within Current Module */}
            <div className="flex flex-wrap gap-2">
              {currentRecord.module.lessons.map((les, idx) => {
                const isActiveLesson = les.id === currentRecord.lessonId;
                return (
                  <button
                    key={les.id}
                    type="button"
                    onClick={() => {
                      const rec = buildSharedCurriculumRecord(
                        currentRecord.journey,
                        currentRecord.module,
                        les,
                      );
                      openRecordInPlayer(rec, activeFormat, "player");
                    }}
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-xs font-semibold transition",
                      isActiveLesson
                        ? "bg-[#F2C567] text-[#1a1408]"
                        : "border border-[#2D3B50] bg-[#141E2D] text-[#A9B6C9] hover:text-[#F5F7FB]",
                    )}
                  >
                    Lesson {idx + 1}: {les.title}
                  </button>
                );
              })}
            </div>

            {/* 6 Format Tabs inside Lesson Player */}
            <div className="flex flex-wrap gap-1.5 rounded-2xl border border-[#2D3B50] bg-[#0B1220] p-1.5">
              {LEARN_FORMAT_CARDS.map((tab) => {
                const Icon = FORMAT_ICONS[tab.id];
                const on = activeFormat === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveFormat(tab.id);
                      writeLearnPosition(
                        {
                          journeyId: currentRecord.journeyId,
                          moduleId: currentRecord.moduleId,
                          lessonId: currentRecord.lessonId,
                          activity:
                            tab.id === "practice"
                              ? "practice"
                              : tab.id === "labs"
                                ? "project"
                                : tab.id === "noctis"
                                  ? "noctis"
                                  : "lesson",
                          formatTab: tab.id,
                        },
                        store,
                      );
                    }}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition",
                      on
                        ? "bg-[#F2C567] text-[#1a1408]"
                        : "text-[#A9B6C9] hover:bg-[#141E2D] hover:text-[#F5F7FB]",
                    )}
                  >
                    <Icon className="size-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* FORMAT 1: VIDEO & TRANSCRIPT */}
            {activeFormat === "video" ? (
              <div className="space-y-4 rounded-2xl border border-[#2D3B50] bg-[#0B1220] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-[#F2C567]/15 px-3 py-1 text-xs font-semibold text-[#F2C567]">
                    Video Lesson & Synchronized Transcript
                  </span>
                  <span className="text-xs text-[#A9B6C9]">
                    Duration:{" "}
                    {currentRecord.lesson.videoScript?.durationSec
                      ? `${Math.round(currentRecord.lesson.videoScript.durationSec / 60)} min`
                      : `${currentRecord.lesson.durationMinutes ?? 6} min`}
                  </span>
                </div>

                {/* Visual Presentation Canvas */}
                <div className="rounded-2xl border border-[#2D3B50] bg-[linear-gradient(145deg,#162235_0%,#0B1220_100%)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">
                    Visual Demonstration Cue
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#F5F7FB]">
                    {currentRecord.lesson.videoScript?.visualCue ??
                      `Live walkthrough: ${currentRecord.lesson.doThis}`}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[#D8E1EE]">
                    “
                    {currentRecord.lesson.videoScript?.hook ??
                      currentRecord.module.summary}
                    ”
                  </p>
                </div>

                {/* Full Transcript */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A9B6C9]">
                    Lesson Transcript
                  </h4>
                  <div className="mt-2 space-y-2 text-sm leading-relaxed text-[#D8E1EE]">
                    {(
                      currentRecord.lesson.videoScript?.narration ?? [
                        currentRecord.lesson.notes ?? currentRecord.module.summary,
                        `Action to perform: ${currentRecord.lesson.doThis}`,
                      ]
                    ).map((para, idx) => (
                      <p
                        key={idx}
                        className="rounded-xl border border-[#1E2B3E] bg-[#141E2D]/70 p-3"
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {/* FORMAT 2: SLIDES & NOTES */}
            {activeFormat === "slides" ? (
              <div className="space-y-4 rounded-2xl border border-[#2D3B50] bg-[#0B1220] p-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#F2C567]/15 px-3 py-1 text-xs font-semibold text-[#F2C567]">
                    Slide {slideIndex + 1} of {slides.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={slideIndex === 0}
                      onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
                      className="rounded-xl border border-[#2D3B50] bg-[#141E2D] px-3 py-1.5 text-xs font-semibold text-[#F5F7FB] disabled:opacity-40"
                    >
                      ← Prev
                    </button>
                    <button
                      type="button"
                      disabled={slideIndex >= slides.length - 1}
                      onClick={() =>
                        setSlideIndex((i) => Math.min(slides.length - 1, i + 1))
                      }
                      className="rounded-xl border border-[#2D3B50] bg-[#141E2D] px-3 py-1.5 text-xs font-semibold text-[#F5F7FB] disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#F2C567]/40 bg-[#141E2D] p-5">
                  <h3 className="font-display text-lg font-bold text-[#F5F7FB]">
                    {activeSlide.heading}
                  </h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#D8E1EE]">
                    {activeSlide.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                  <div className="mt-4 rounded-xl border border-[#F2C567]/30 bg-[#0B1220] p-3 text-xs text-[#F2C567]">
                    <strong>Key Takeaway:</strong> {activeSlide.takeaway}
                  </div>
                </div>
              </div>
            ) : null}

            {/* FORMAT 3: PRACTICE & QUIZZES (/learn/lessons/$lessonId/practice) */}
            {activeFormat === "practice" ? (
              <div className="space-y-5 rounded-2xl border border-[#2D3B50] bg-[#0B1220] p-4">
                {/* Part A: Low-stakes Hands-on Practice Exercise */}
                <div className="rounded-2xl border border-[#2D3B50] bg-[#141E2D] p-4">
                  <span className="rounded-full bg-[#F2C567]/15 px-3 py-1 text-xs font-semibold text-[#F2C567]">
                    Step 1 · Guided Practice Activity
                  </span>
                  <h3 className="mt-2 text-base font-bold text-[#F5F7FB]">
                    {currentRecord.lesson.practicalTask?.prompt ??
                      currentRecord.lesson.doThis}
                  </h3>
                  <p className="mt-1 text-xs text-[#A9B6C9]">
                    Hint:{" "}
                    {currentRecord.lesson.practicalTask?.hint ??
                      `Apply ${currentRecord.lesson.title} in your own words or code.`}
                  </p>
                  <textarea
                    rows={3}
                    value={practiceText}
                    onChange={(e) => setPracticeText(e.target.value)}
                    placeholder="Write your practical solution, command, or explanation here..."
                    className="mt-3 w-full rounded-xl border border-[#2D3B50] bg-[#0B1220] p-3 text-sm text-[#F5F7FB] placeholder:text-[#7E8FA6] focus:border-[#F2C567] focus:outline-none"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleCompletePractice}
                      className="rounded-xl bg-[#F2C567] px-4 py-2 text-xs font-semibold text-[#1a1408]"
                    >
                      Save Practice Activity
                    </button>
                    <span className="text-xs text-[#A9B6C9]">
                      Auto-syncs with Journey & My Progress
                    </span>
                  </div>
                </div>

                {/* Part B: Formal Module Mastery Assessment Check */}
                <div className="rounded-2xl border border-[#F2C567]/40 bg-[#141E2D] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-[#F2C567]/20 px-3 py-1 text-xs font-semibold text-[#F2C567]">
                      Step 2 · Formal Module Mastery Check ({currentRecord.assessmentId})
                    </span>
                    <span className="text-xs text-[#A9B6C9]">
                      Passing proves understanding & updates Journey mastery
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#F5F7FB]">
                    {currentRecord.module.check.prompt}
                  </p>
                  <div className="mt-3 space-y-2">
                    {currentRecord.module.check.choices.map((optionText, idx) => (
                      <label
                        key={idx}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition",
                          quizChoice === idx
                            ? "border-[#F2C567] bg-[#1F2C40] text-[#F5F7FB]"
                            : "border-[#2D3B50] bg-[#0B1220] text-[#D8E1EE]",
                        )}
                      >
                        <input
                          type="radio"
                          name="learn-quiz-choice"
                          checked={quizChoice === idx}
                          onChange={() => setQuizChoice(idx)}
                          className="mt-1"
                        />
                        <span>{optionText}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      disabled={quizChoice === null}
                      onClick={handleGradeQuiz}
                      className="rounded-xl bg-[#F2C567] px-4 py-2.5 text-xs font-bold text-[#1a1408] disabled:opacity-40"
                    >
                      Submit & Verify Mastery
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNoctisAction("wrong-answer");
                        setActiveFormat("noctis");
                      }}
                      className="rounded-xl border border-[#2D3B50] bg-[#0B1220] px-3.5 py-2.5 text-xs font-semibold text-[#F2C567]"
                    >
                      Ask Noctis to Explain This Check
                    </button>
                  </div>
                </div>

                {activityFeedback ? (
                  <div
                    className={cn(
                      "rounded-2xl border p-4 text-xs",
                      activityFeedback.tone === "emerald"
                        ? "border-emerald-400/50 bg-emerald-950/30 text-emerald-200"
                        : activityFeedback.tone === "amber"
                          ? "border-amber-400/50 bg-amber-950/30 text-amber-200"
                          : "border-[#F2C567]/50 bg-[#F2C567]/10 text-[#F5F7FB]",
                    )}
                  >
                    <p className="font-semibold">{activityFeedback.message}</p>
                    {activityFeedback.remediation ? (
                      <p className="mt-1.5 text-amber-300">
                        <strong>Remediation Recommendation:</strong>{" "}
                        {activityFeedback.remediation}
                      </p>
                    ) : null}
                    {activityFeedback.nextAction ? (
                      <p className="mt-1.5 text-[#F2C567]">
                        <strong>Next Recommended Action:</strong>{" "}
                        {activityFeedback.nextAction}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* FORMAT 4: READING, NOTES, WORKED EXAMPLE, DIAGRAM & VOCABULARY */}
            {activeFormat === "notes" ? (
              <div className="space-y-4 rounded-2xl border border-[#2D3B50] bg-[#0B1220] p-4">
                <div className="rounded-2xl border border-[#2D3B50] bg-[#141E2D] p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">
                    Plain-Language Study Notes
                  </span>
                  <p className="mt-2 text-sm leading-relaxed text-[#D8E1EE]">
                    {currentRecord.lesson.notes ?? currentRecord.module.summary}
                  </p>
                </div>

                {/* Worked Example */}
                {currentRecord.lesson.workedExample ? (
                  <div className="rounded-2xl border border-[#2D3B50] bg-[#141E2D] p-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">
                      Worked Example — {currentRecord.lesson.workedExample.scenario}
                    </span>
                    <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-xs text-[#D8E1EE]">
                      {currentRecord.lesson.workedExample.steps.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                    <p className="mt-2.5 text-xs font-semibold text-emerald-300">
                      Result: {currentRecord.lesson.workedExample.result}
                    </p>
                  </div>
                ) : null}

                {/* Adaptive Re-explanations */}
                {currentRecord.lesson.adaptiveExplanations ? (
                  <div className="rounded-2xl border border-[#2D3B50] bg-[#141E2D] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">
                      Need a Different Angle? (Adaptive Explanations)
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(
                        [
                          ["analogy", "Simple Analogy"],
                          ["stepByStep", "Step-by-Step"],
                          ["visualWalkthrough", "Visual Walkthrough"],
                        ] as const
                      ).map(([modeKey, label]) => (
                        <button
                          key={modeKey}
                          type="button"
                          onClick={() => setAdaptiveMode(modeKey)}
                          className={cn(
                            "rounded-xl px-3 py-1.5 text-xs font-semibold",
                            adaptiveMode === modeKey
                              ? "bg-[#F2C567] text-[#1a1408]"
                              : "border border-[#2D3B50] bg-[#0B1220] text-[#A9B6C9]",
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {adaptiveMode !== "none" ? (
                      <p className="mt-3 rounded-xl border border-[#F2C567]/30 bg-[#0B1220] p-3 text-xs leading-relaxed text-[#F5F7FB]">
                        {currentRecord.lesson.adaptiveExplanations[adaptiveMode]}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* FORMAT 5: PRACTICAL LABS & PROJECTS (/learn/lessons/$lessonId/project) */}
            {activeFormat === "labs" ? (
              <div className="space-y-4 rounded-2xl border border-[#2D3B50] bg-[#0B1220] p-4">
                <div className="rounded-2xl border border-[#F2C567]/40 bg-[#141E2D] p-4">
                  <span className="rounded-full bg-[#F2C567]/15 px-3 py-1 text-xs font-semibold text-[#F2C567]">
                    Practical Lab & Final Project ({currentRecord.projectId})
                  </span>
                  <h3 className="mt-2 text-base font-bold text-[#F5F7FB]">
                    {currentRecord.journey.project}
                  </h3>
                  <p className="mt-1 text-xs text-[#A9B6C9]">
                    Lesson Lab Task: {currentRecord.lesson.doThis}
                  </p>

                  {currentRecord.journey.projectRubric?.length ? (
                    <div className="mt-3 space-y-1.5">
                      <p className="text-xs font-semibold text-[#F2C567]">
                        Rubric Acceptance Criteria:
                      </p>
                      {currentRecord.journey.projectRubric.map((r) => (
                        <div
                          key={r.id}
                          className="rounded-xl border border-[#2D3B50] bg-[#0B1220] p-2.5 text-xs"
                        >
                          <strong className="text-[#F5F7FB]">{r.criterion}:</strong>{" "}
                          <span className="text-[#A9B6C9]">{r.description}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <textarea
                    rows={4}
                    value={projectDraft}
                    onChange={(e) => setProjectDraft(e.target.value)}
                    placeholder="Paste or describe your completed lab/project deliverable to evaluate against the course rubric..."
                    className="mt-3 w-full rounded-xl border border-[#2D3B50] bg-[#0B1220] p-3 text-sm text-[#F5F7FB] placeholder:text-[#7E8FA6] focus:border-[#F2C567] focus:outline-none"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleSaveProject}
                      className="rounded-xl bg-[#F2C567] px-4 py-2 text-xs font-bold text-[#1a1408]"
                    >
                      Submit & Evaluate Project
                    </button>
                    <span className="text-xs text-[#A9B6C9]">
                      Current Rubric Score: {indicators.projectEvaluation.scorePct}%
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            {/* FORMAT 6: LESSON-AWARE ASK NOCTIS */}
            {activeFormat === "noctis" ? (
              <div className="space-y-4 rounded-2xl border border-[#F2C567]/45 bg-[#0B1220] p-4">
                <div>
                  <span className="rounded-full bg-[#F2C567]/15 px-3 py-1 text-xs font-semibold text-[#F2C567]">
                    Authorised Lesson-Aware Noctis Guide
                  </span>
                  <h3 className="mt-2 text-base font-bold text-[#F5F7FB]">
                    Noctis already knows your current lesson: “{currentRecord.lesson.title}”
                  </h3>
                  <p className="mt-1 text-xs text-[#A9B6C9]">
                    You never need to repeat the lesson or course title. Noctis is pre-loaded with your active journey, module objectives, assessment history, and knowledge gaps.
                  </p>
                </div>

                {/* 8 Context-Aware Noctis Guide Actions */}
                <div className="flex flex-wrap gap-1.5">
                  {NOCTIS_GUIDE_ACTIONS.map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setNoctisAction(act.id)}
                      className={cn(
                        "rounded-xl px-3 py-1.5 text-xs font-semibold transition",
                        noctisAction === act.id
                          ? "bg-[#F2C567] text-[#1a1408]"
                          : "border border-[#2D3B50] bg-[#141E2D] text-[#A9B6C9] hover:text-[#F5F7FB]",
                      )}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>

                {/* Generated Grounded Tutor Reply */}
                <div className="rounded-2xl border border-[#2D3B50] bg-[#141E2D] p-4">
                  <h4 className="text-sm font-bold text-[#F2C567]">
                    {noctisContext.tutorResponse.heading}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#F5F7FB]">
                    {noctisContext.tutorResponse.body}
                  </p>
                  <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-xs text-[#D8E1EE]">
                    {noctisContext.tutorResponse.bullets.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                  {noctisContext.recommendedRevision ? (
                    <div className="mt-3 rounded-xl border border-amber-400/40 bg-amber-950/30 p-2.5 text-xs text-amber-200">
                      <strong>Recommended Revision:</strong>{" "}
                      {noctisContext.recommendedRevision}
                    </div>
                  ) : null}
                </div>

                {/* Ask a custom question with full lesson context */}
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={customNoctisQuestion}
                    onChange={(e) => setCustomNoctisQuestion(e.target.value)}
                    placeholder={`Ask Noctis anything about "${currentRecord.lesson.title}"...`}
                    className="h-10 flex-1 rounded-xl border border-[#2D3B50] bg-[#141E2D] px-3 text-xs text-[#F5F7FB] placeholder:text-[#7E8FA6]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedNoctisQuestion(customNoctisQuestion);
                      openNoctis(noctisContext.contextualPrompt);
                    }}
                    className="rounded-xl bg-[#F2C567] px-4 py-2 text-xs font-bold text-[#1a1408]"
                  >
                    Open in Full Noctis Chat ↗
                  </button>
                </div>
              </div>
            ) : null}

            {/* Bottom Lesson Navigation (Prev / Next Lesson or Practice & Quiz) */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#2D3B50] pt-4">
              <button
                type="button"
                onClick={() => {
                  if (currentRecord.lessonIndex > 0) {
                    const prevLes =
                      currentRecord.module.lessons[currentRecord.lessonIndex - 1]!;
                    openRecordInPlayer(
                      buildSharedCurriculumRecord(
                        currentRecord.journey,
                        currentRecord.module,
                        prevLes,
                      ),
                      "video",
                      "player",
                    );
                  } else if (currentRecord.moduleIndex > 0) {
                    const prevMod =
                      currentRecord.journey.modules[currentRecord.moduleIndex - 1]!;
                    openRecordInPlayer(
                      buildSharedCurriculumRecord(
                        currentRecord.journey,
                        prevMod,
                        prevMod.lessons[prevMod.lessons.length - 1]!,
                      ),
                      "video",
                      "player",
                    );
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#2D3B50] bg-[#141E2D] px-4 py-2.5 text-xs font-semibold text-[#F5F7FB]"
              >
                <ChevronLeft className="size-4" /> Previous Lesson
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveFormat("practice")}
                  className="rounded-xl border border-[#F2C567]/50 bg-[#F2C567]/15 px-4 py-2.5 text-xs font-semibold text-[#F2C567]"
                >
                  Practice & Prove Understanding
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextLessonInMod =
                      currentRecord.module.lessons[currentRecord.lessonIndex + 1];
                    if (nextLessonInMod) {
                      openRecordInPlayer(
                        buildSharedCurriculumRecord(
                          currentRecord.journey,
                          currentRecord.module,
                          nextLessonInMod,
                        ),
                        "video",
                        "player",
                      );
                    } else {
                      const nextMod =
                        currentRecord.journey.modules[currentRecord.moduleIndex + 1];
                      if (nextMod) {
                        openRecordInPlayer(
                          buildSharedCurriculumRecord(
                            currentRecord.journey,
                            nextMod,
                            nextMod.lessons[0]!,
                          ),
                          "video",
                          "player",
                        );
                      } else {
                        setActiveFormat("labs");
                      }
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#F2C567] px-4 py-2.5 text-xs font-bold text-[#1a1408]"
                >
                  Next Lesson <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Right Sidebar: Authorised Noctis Context & Shared Progress Record */}
          <aside className="space-y-4">
            <div className="rounded-3xl border border-[#2D3B50] bg-[#0E1726] p-4 shadow-lg">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#F2C567]">
                Shared Curriculum Record
              </p>
              <h3 className="mt-0.5 text-sm font-bold text-[#F5F7FB]">
                Synchronised Journey & Learn State
              </h3>
              <dl className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-[#8FA1B8]">Course / Journey ID:</dt>
                  <dd className="font-mono font-semibold text-[#F5F7FB]">
                    {currentRecord.journeyId}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#8FA1B8]">Module ID:</dt>
                  <dd className="font-mono font-semibold text-[#F5F7FB]">
                    {currentRecord.moduleId}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#8FA1B8]">Lesson ID:</dt>
                  <dd className="font-mono font-semibold text-[#F2C567]">
                    {currentRecord.lessonId}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#8FA1B8]">Assessment ID:</dt>
                  <dd className="font-mono font-semibold text-[#F5F7FB]">
                    {currentRecord.assessmentId}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#8FA1B8]">Mastery Tier:</dt>
                  <dd className="font-semibold text-[#F2C567]">
                    {indicators.masteryTier} ({indicators.knowledgeMasteryPct}%)
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-3xl border border-[#2D3B50] bg-[#0E1726] p-4 shadow-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-[#F2C567]" />
                <h3 className="text-sm font-bold text-[#F5F7FB]">
                  Noctis Lesson Companion
                </h3>
              </div>
              <p className="mt-1 text-xs text-[#A9B6C9]">
                Active Lesson: <strong className="text-[#F5F7FB]">{noctisContext.lessonTitle}</strong>
              </p>
              <div className="mt-2.5 space-y-1.5">
                {noctisContext.lessonObjectives.slice(0, 2).map((obj, i) => (
                  <p
                    key={i}
                    className="rounded-xl border border-[#2D3B50] bg-[#141E2D] p-2 text-[11px] text-[#D8E1EE]"
                  >
                    • {obj}
                  </p>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setActiveFormat("noctis")}
                className="mt-3 w-full rounded-xl bg-[#F2C567] py-2 text-xs font-bold text-[#1a1408]"
              >
                Explain This Lesson with Noctis
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {/* MY PROGRESS VIEW IN LEARN */}
      {workspaceMode === "progress" ? (
        <section
          aria-label="Learner Progress and Competency Evidence"
          className="rounded-3xl border border-[#2D3B50] bg-[#0E1726] p-5 shadow-xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">
                Shared Progress & Mastery Engine
              </p>
              <h2 className="mt-0.5 font-display text-2xl font-bold text-[#F5F7FB]">
                {currentRecord.journey.title} — Competency Evidence
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setWorkspaceMode("home")}
              className="rounded-xl border border-[#2D3B50] bg-[#141E2D] px-3.5 py-2 text-xs font-semibold text-[#F5F7FB]"
            >
              ← Back to Learn Home
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#2D3B50] bg-[#141E2D] p-4">
              <p className="text-xs text-[#A9B6C9]">Curriculum Progress</p>
              <p className="mt-1 text-2xl font-bold text-[#F5F7FB]">
                {indicators.learningProgressPct}%
              </p>
              <p className="mt-1 text-[11px] text-[#8FA1B8]">
                {indicators.completedLessonsCount}/{indicators.totalLessonsCount} lessons engaged
              </p>
            </div>
            <div className="rounded-2xl border border-[#2D3B50] bg-[#141E2D] p-4">
              <p className="text-xs text-[#A9B6C9]">Verified Knowledge Mastery</p>
              <p className="mt-1 text-2xl font-bold text-[#F2C567]">
                {indicators.knowledgeMasteryPct}%
              </p>
              <p className="mt-1 text-[11px] text-[#8FA1B8]">
                {indicators.passedChecksCount}/{indicators.totalModulesCount} module checks passed
              </p>
            </div>
            <div className="rounded-2xl border border-[#2D3B50] bg-[#141E2D] p-4">
              <p className="text-xs text-[#A9B6C9]">Hands-on Practice</p>
              <p className="mt-1 text-2xl font-bold text-[#F5F7FB]">
                {indicators.practicesCompletedCount}
              </p>
              <p className="mt-1 text-[11px] text-[#8FA1B8]">
                Practical activities & checks completed
              </p>
            </div>
            <div className="rounded-2xl border border-[#2D3B50] bg-[#141E2D] p-4">
              <p className="text-xs text-[#A9B6C9]">Current Mastery Tier</p>
              <p className="mt-1 text-2xl font-bold text-emerald-300">
                {indicators.masteryTier}
              </p>
              <p className="mt-1 text-[11px] text-[#8FA1B8]">
                {indicators.readinessLabel}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* CERTIFICATE & COMPLETION VIEW IN LEARN */}
      {workspaceMode === "certificate" ? (
        <section
          aria-label="Certificate and Completion Requirements"
          className="rounded-3xl border border-[#F2C567]/50 bg-[#0E1726] p-6 shadow-xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-[#F2C567]/15 text-[#F2C567]">
                <Award className="size-6" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">
                  Completion Requirements & Eligible Achievements
                </p>
                <h2 className="font-display text-2xl font-bold text-[#F5F7FB]">
                  {currentRecord.journey.title}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setWorkspaceMode("home")}
              className="rounded-xl border border-[#2D3B50] bg-[#141E2D] px-3.5 py-2 text-xs font-semibold text-[#F5F7FB]"
            >
              ← Back to Learn Home
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#2D3B50] bg-[#141E2D] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">
                Completion Requirements
              </p>
              <ul className="mt-2.5 space-y-2 text-xs text-[#D8E1EE]">
                <li>
                  • Pass all {indicators.totalModulesCount} module mastery checks (
                  {indicators.passedChecksCount}/{indicators.totalModulesCount} complete)
                </li>
                <li>
                  • Submit and verify the Final Project rubric (
                  {indicators.projectEvaluation.scorePct}% rubric match)
                </li>
                <li>
                  • Watching videos alone records Exposure only and never unlocks a certificate.
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-[#2D3B50] bg-[#141E2D] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">
                Licensing & Credential Notice
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#A9B6C9]">
                Vibe / Noctis issues a verified Course Completion Record once all module checks and the final project rubric are satisfied. Official vendor certifications or state trade licences must be obtained from the relevant accrediting body.
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
