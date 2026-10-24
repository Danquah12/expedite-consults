import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  Atom,
  Award,
  BookOpen,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  Code2,
  Cog,
  Compass,
  Factory,
  FileText,
  Globe,
  GraduationCap,
  HelpCircle,
  Heart,
  Landmark,
  Languages,
  Laptop,
  Layers,
  Leaf,
  Monitor,
  Palette,
  Play,
  RefreshCw,
  Scale,
  Search,
  Shield,
  Sigma,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Truck,
  Utensils,
  Wrench,
  Zap,
} from "lucide-react";
import { openNoctis } from "@/lib/ask-noctis";
import { studyAsks } from "@/lib/study-pass";
import {
  COURSE_GROUPS,
  getCourseRecordDetails,
  getGroupCourseCount,
  getTotalCatalogCourseCount,
  RELEASE_WAVES,
  searchCourses,
  type ReleaseWaveId,
} from "@/lib/course-catalog";
import {
  CONTENT_PIPELINE_STEPS,
  computeJourneyIndicators,
  depthLine,
  EMPTY_JOURNEY,
  evaluateProjectSubmission,
  generateNoctisTutorResponse,
  getJourneyLifecycleState,
  JOURNEY_PATHS,
  LEARNING_AGENTS,
  NOCTIS_GUIDE_ACTIONS,
  orchestratorBrief,
  pathForNamedCourse,
  pathForTopic,
  readJourney,
  writeJourney,
  type JourneyGoal,
  type JourneyLevel,
  type JourneyModule,
  type JourneyPath,
  type JourneyStore,
  type JourneyTimeCommitment,
  type NoctisGuideActionId,
} from "@/lib/journey-paths";
import {
  readLearnPosition,
  resolveJourneyActionToLearn,
  writeLearnPosition,
  type JourneyToLearnActionId,
} from "@/lib/journey-learn-bridge";
import { DiscoverDesk } from "@/components/discover/DiscoverDesk";
import { JourneyDiscoverHub } from "@/components/journey/JourneyDiscoverHub";
import { cn } from "@/lib/utils";

type Screen =
  | "home"
  | "discover"
  | "review"
  | "path"
  | "lesson"
  | "check"
  | "project"
  | "progress"
  | "agents"
  | "done";

type LessonFormatTab = "video" | "slides" | "notes" | "diagram" | "vocab";
type AdaptiveMode = "none" | "analogy" | "stepByStep" | "visualWalkthrough";

const ICONS = {
  science: Atom,
  tech: Laptop,
  dev: Code2,
  data: Sigma,
  geo: Globe,
  web: Monitor,
  cyber: Shield,
  eng: Cog,
  bible: BookOpen,
  business: Landmark,
  health: Heart,
  arts: Palette,
  lang: Languages,
  agri: Leaf,
  env: Leaf,
  energy: Sun,
  observe: Activity,
  math: Sigma,
  history: Landmark,
  build: Wrench,
  auto: Car,
  mep: Zap,
  make: Factory,
  move: Truck,
  design: Palette,
  hosp: Utensils,
  edu: GraduationCap,
  law: Scale,
} as const;

const POPULAR_PATHS: {
  id: string;
  subject: string;
  subtitle: string;
  cover: string;
}[] = [
  {
    id: "science",
    subject: "Science",
    subtitle: "Explore the world and beyond",
    cover: "/media/posts/calc.jpg",
  },
  {
    id: "geo",
    subject: "Geography",
    subtitle: "People, places and our planet",
    cover: "/media/covers/harmattan.jpg",
  },
  {
    id: "web",
    subject: "Web Design",
    subtitle: "Build for the web",
    cover: "/media/hall/developer.jpg",
  },
  {
    id: "cyber",
    subject: "Cybersecurity",
    subtitle: "Stay safe in a digital world",
    cover: "/media/covers/ctf.jpg",
  },
  {
    id: "bible",
    subject: "Bible Study",
    subtitle: "Learn and grow in faith",
    cover: "/media/desk/pulpit.jpg",
  },
  {
    id: "eng",
    subject: "Engineering",
    subtitle: "Solve real world problems",
    cover: "/media/hall/builders.jpg",
  },
];

const GOAL_LABELS: Record<JourneyGoal, string> = {
  understand: "Understand fundamentals clearly",
  project: "Build and publish a real project",
  career: "Prepare for a career or trade",
  exam: "Prepare for an exam or credential",
};

export function JourneyDesk({ onOpenLearn }: { onOpenLearn?: () => void } = {}) {
  const [store, setStore] = useState<JourneyStore>(EMPTY_JOURNEY);
  const [draft, setDraft] = useState("");
  const [screen, setScreen] = useState<Screen>("home");
  const [pending, setPending] = useState<JourneyPath | null>(null);
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [lessonAt, setLessonAt] = useState(0);
  const [formatTab, setFormatTab] = useState<LessonFormatTab>("video");
  const [slideIndex, setSlideIndex] = useState(0);
  const [adaptiveMode, setAdaptiveMode] = useState<AdaptiveMode>("none");
  const [practiceInput, setPracticeInput] = useState("");
  const [practiceSaved, setPracticeSaved] = useState(false);
  const [choice, setChoice] = useState<number | null>(null);
  const [marked, setMarked] = useState<"right" | "wrong" | null>(null);
  const [retentionChoice, setRetentionChoice] = useState<number | null>(null);
  const [retentionMarked, setRetentionMarked] = useState<"right" | "wrong" | null>(null);
  const [projectDraft, setProjectDraft] = useState("");
  const [showCatalogDrawer, setShowCatalogDrawer] = useState(false);
  const [noctisAction, setNoctisAction] = useState<NoctisGuideActionId>("simpler");

  useEffect(() => {
    const saved = readJourney();
    setStore(saved);
    setProjectDraft(saved.projects[saved.activeId] ?? "");
    const savedPos = readLearnPosition(saved);
    const resolved = resolvePath(saved);
    if (savedPos.journeyId === resolved.id) {
      const modMatch = resolved.modules.find((m) => m.id === savedPos.moduleId);
      if (modMatch) {
        setModuleId(modMatch.id);
        const lesIdx = modMatch.lessons.findIndex((l) => l.id === savedPos.lessonId);
        if (lesIdx >= 0) setLessonAt(lesIdx);
      }
    }
  }, []);

  const path = useMemo(() => resolvePath(store), [store]);
  const passed = useMemo(() => new Set(store.checks[path.id] ?? []), [store.checks, path.id]);
  const nextModule = path.modules.find((item) => !passed.has(item.id)) ?? null;
  const module =
    path.modules.find((item) => item.id === moduleId) ?? nextModule ?? path.modules[0]!;
  const currentLesson = module.lessons[lessonAt] ?? module.lessons[0]!;

  const indicators = useMemo(() => computeJourneyIndicators(path, store), [path, store]);
  const brief = useMemo(() => orchestratorBrief(path, store), [path, store]);
  const lifecycleState = useMemo(() => getJourneyLifecycleState(path, store), [path, store]);
  const tutorReply = useMemo(
    () => generateNoctisTutorResponse(noctisAction, path, module, currentLesson, store),
    [noctisAction, path, module, currentLesson, store],
  );
  const projectDone = indicators.projectsCompletedCount > 0;

  function save(next: JourneyStore) {
    setStore(next);
    writeJourney(next);
  }

  function jumpToLearn(
    actionId: JourneyToLearnActionId,
    opts?: { journey?: JourneyPath; moduleId?: string; lessonId?: string },
  ) {
    const resolved = resolveJourneyActionToLearn(actionId, {
      journey: opts?.journey ?? path,
      moduleId: opts?.moduleId ?? module.id,
      lessonId: opts?.lessonId ?? currentLesson?.id,
      store,
    });
    setStore(resolved.store);
    if (onOpenLearn) {
      onOpenLearn();
    } else if (typeof window !== "undefined") {
      window.location.assign(resolved.routePath);
    }
  }

  function recordLessonViewed(pathId: string, lessonId: string, baseStore = store) {
    const currentViewed = baseStore.lessonsViewed?.[pathId] ?? [];
    if (currentViewed.includes(lessonId)) return baseStore;
    const updated: JourneyStore = {
      ...baseStore,
      lessonsViewed: {
        ...(baseStore.lessonsViewed ?? {}),
        [pathId]: [...currentViewed, lessonId],
      },
    };
    save(updated);
    return updated;
  }

  function selectSubjectQuickly(nextPath: JourneyPath, topicOverride = "") {
    const following: JourneyStore = {
      ...store,
      activeId: nextPath.id,
      topic: topicOverride || nextPath.subject,
    };
    save(following);
    setProjectDraft(following.projects[nextPath.id] ?? "");
    setModuleId(nextPath.modules[0]?.id ?? null);
    if (nextPath.modules[0]?.lessons[0]) {
      writeLearnPosition(
        {
          journeyId: nextPath.id,
          moduleId: nextPath.modules[0].id,
          lessonId: nextPath.modules[0].lessons[0].id,
          activity: "lesson",
          formatTab: "video",
        },
        following,
      );
    }
  }

  function review(next: JourneyPath, customTopic?: string) {
    if (customTopic !== undefined) {
      setDraft(customTopic);
    }
    setPending(next);
    setScreen("review");
  }

  function startJourneyDirectly(targetPath: JourneyPath, topicText?: string) {
    const firstMod = targetPath.modules[0];
    const firstLesson = firstMod?.lessons[0];
    const following: JourneyStore = {
      ...store,
      activeId: targetPath.id,
      topic: (topicText ?? draft).trim() || targetPath.subject,
      seen: true,
    };
    const withView = firstLesson
      ? recordLessonViewed(targetPath.id, firstLesson.id, following)
      : following;
    save(withView);
    setProjectDraft(withView.projects[targetPath.id] ?? "");
    setModuleId(firstMod?.id ?? null);
    setLessonAt(0);
    if (firstMod && firstLesson) {
      writeLearnPosition(
        {
          journeyId: targetPath.id,
          moduleId: firstMod.id,
          lessonId: firstLesson.id,
          activity: "lesson",
          formatTab: "video",
        },
        withView,
      );
    }
    try {
      sessionStorage.setItem(
        "noctis-study",
        ((topicText ?? draft).trim() || targetPath.title).slice(0, 140),
      );
    } catch {
      /* sessionStorage optional */
    }
    setScreen("path");
  }

  function createJourney() {
    if (!pending) return;
    startJourneyDirectly(pending, draft);
  }

  function openLesson(item: JourneyModule, index = 0, initialTab: LessonFormatTab = "video") {
    const targetLesson = item.lessons[index] ?? item.lessons[0];
    setModuleId(item.id);
    setLessonAt(index);
    setFormatTab(initialTab);
    setSlideIndex(0);
    setAdaptiveMode("none");
    setChoice(null);
    setMarked(null);
    if (targetLesson) {
      const updatedStore = recordLessonViewed(path.id, targetLesson.id);
      writeLearnPosition(
        {
          journeyId: path.id,
          moduleId: item.id,
          lessonId: targetLesson.id,
          activity: "lesson",
          formatTab: initialTab === "slides" ? "slides" : initialTab === "notes" ? "notes" : "video",
        },
        updatedStore,
      );
      const savedDraft = store.practiceDrafts?.[path.id]?.[targetLesson.id] ?? "";
      setPracticeInput(savedDraft);
      setPracticeSaved((store.practicesDone?.[path.id] ?? []).includes(targetLesson.id));
    }
    setScreen("lesson");
  }

  function savePracticeTask() {
    if (!currentLesson || practiceInput.trim().length < 8) return;
    const doneForPath = store.practicesDone?.[path.id] ?? [];
    const nextDone = doneForPath.includes(currentLesson.id)
      ? doneForPath
      : [...doneForPath, currentLesson.id];
    const nextDraftsForPath = {
      ...(store.practiceDrafts?.[path.id] ?? {}),
      [currentLesson.id]: practiceInput.trim(),
    };
    const nextStore: JourneyStore = {
      ...store,
      seen: true,
      practicesDone: {
        ...(store.practicesDone ?? {}),
        [path.id]: nextDone,
      },
      practiceDrafts: {
        ...(store.practiceDrafts ?? {}),
        [path.id]: nextDraftsForPath,
      },
    };
    save(nextStore);
    setPracticeSaved(true);
  }

  function ask(item: JourneyModule, simpler = false) {
    const lesson = item.lessons[lessonAt] ?? item.lessons[0];
    const subject = path.subject;
    const lessonTitle = lesson?.title ?? item.title;
    try {
      sessionStorage.setItem("noctis-study", subject.slice(0, 140));
    } catch {
      /* optional */
    }
    const question = simpler
      ? `I missed the ${lessonTitle} check for ${subject}. Explain it differently using a simple analogy and step-by-step breakdown.\n\nWrite the full study board: study notes, who gives the exam, where I register, what it covers, what I must practise, one worked example, practice, and what to study next.\nThe check I missed was: ${item.check.prompt}\nDo not stop at the check. If the length, price, or passing score is not on the vendor page, write "not on record." Do not invent a URL. Noctis does not issue this exam.`
      : `Teach me ${subject}. This lesson is ${lessonTitle} (${item.title}).\nLevel: ${store.level}. ${depthLine(store.level)}\n\nWrite the study notes, who gives the exam, where I register, what it covers, and what I must practise. Then one worked example, practice, and what to study next.\nIf the length, price, or passing score is not on the vendor page, write "not on record." Do not invent a URL. Noctis does not issue this exam.`;
    openNoctis(question);
  }

  function grade(item: JourneyModule) {
    if (choice === null) return;
    const right = choice === item.check.answer;
    setMarked(right ? "right" : "wrong");
    if (!right) {
      const currentRev = store.revisionQueue?.[path.id] ?? [];
      if (!currentRev.includes(item.id)) {
        save({
          ...store,
          seen: true,
          revisionQueue: {
            ...(store.revisionQueue ?? {}),
            [path.id]: [...currentRev, item.id],
          },
        });
      }
      return;
    }
    const ids = passed.has(item.id)
      ? store.checks[path.id] ?? []
      : [...(store.checks[path.id] ?? []), item.id];
    const cleanedRev = (store.revisionQueue?.[path.id] ?? []).filter((id) => id !== item.id);
    const following: JourneyStore = {
      ...store,
      seen: true,
      checks: { ...store.checks, [path.id]: ids },
      revisionQueue: { ...(store.revisionQueue ?? {}), [path.id]: cleanedRev },
    };
    save(following);
  }

  function gradeRetention(item: JourneyModule) {
    const rCheck = item.retentionCheck ?? item.check;
    if (retentionChoice === null) return;
    const ok = retentionChoice === rCheck.answer;
    setRetentionMarked(ok ? "right" : "wrong");
    if (!ok) return;
    const cur = store.retentionPassed?.[path.id] ?? [];
    if (!cur.includes(item.id)) {
      save({
        ...store,
        retentionPassed: {
          ...(store.retentionPassed ?? {}),
          [path.id]: [...cur, item.id],
        },
      });
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl text-[#F5F7FB]">
      {/* Persistent Journey Workspace Bar (Developer Spec v1.0 Screens 01–10) */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#2D3B50] bg-[#0E1726]/95 px-4 py-2.5 shadow-md">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setScreen("home")}
            className={cn(
              "inline-flex items-center gap-1 font-semibold transition",
              screen === "home" ? "text-[#F2C567]" : "text-[#D8E1EE] hover:text-[#F2C567]",
            )}
          >
            {screen !== "home" ? <ChevronLeft className="size-4" /> : null}
            Vibe · Noctis Journey
          </button>
          <span className="text-[#5E6E85]">/</span>
          <span className="font-semibold text-[#F5F7FB]">{path.title}</span>
          <span className="rounded-full border border-[#2D3B50] bg-[#141E2D] px-2.5 py-0.5 text-[11px] font-semibold text-[#A9B6C9]">
            State: {lifecycleState}
          </span>
          <span className="rounded-full border border-[#F2C567]/40 bg-[#F2C567]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#F2C567]">
            Tier: {indicators.masteryTier}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => jumpToLearn("continue-learning")}
            className="inline-flex items-center gap-1 rounded-full border border-[#F2C567] bg-[#F2C567]/15 px-3 py-1 text-xs font-semibold text-[#F2C567] transition hover:bg-[#F2C567] hover:text-[#1a1408]"
          >
            <BookOpen className="size-3.5" /> Open in Learn →
          </button>
          <button
            type="button"
            onClick={() => setScreen("discover")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition",
              screen === "discover"
                ? "bg-[#F2C567] text-[#1a1408]"
                : "border border-[#2D3B50] bg-[#141E2D] text-[#A9B6C9] hover:text-[#F5F7FB]",
            )}
          >
            02 · Discover
          </button>
          {(
            [
              ["path", "04 · Roadmap"],
              ["lesson", "05 · Lesson Player"],
              ["check", "06 · Practice & Quiz"],
              ["project", "07 · Projects"],
              ["progress", "08 · My Progress"],
              ["agents", "09 · Noctis & 8 Agents"],
              ["done", "10 · Certificate"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setScreen(id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition",
                screen === id
                  ? "bg-[#F2C567] text-[#1a1408]"
                  : "border border-[#2D3B50] bg-[#141E2D] text-[#A9B6C9] hover:text-[#F5F7FB]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20.5rem]">
        {/* MAIN LEFT COLUMN */}
        <div className="min-w-0 space-y-5">
          {screen === "discover" ? (
            <DiscoverDesk
              onOpenJourney={() => {
                const refreshed = readJourney();
                setStore(refreshed);
                setScreen("home");
              }}
            />
          ) : null}

          {screen === "home" ? (
            <>
              <HomeDashboard
                path={path}
                store={store}
                draft={draft}
                onDraft={setDraft}
                indicators={indicators}
                passed={passed}
                nextModule={nextModule}
                showCatalogDrawer={showCatalogDrawer}
                onToggleCatalog={() => setShowCatalogDrawer((v) => !v)}
                onSelectSubject={(p) => selectSubjectQuickly(p)}
                onBuildPath={(topicText) => {
                  const resolved = pathForNamedCourse(topicText);
                  review(resolved, topicText);
                }}
                onStartDirectly={(target) => startJourneyDirectly(target)}
                onOpenModule={(m) => openLesson(m, 0)}
                onContinue={() =>
                  setScreen(projectDone ? "done" : nextModule ? "path" : "project")
                }
                onOpenAgents={() => setScreen("agents")}
                onOpenProgress={() => setScreen("progress")}
                onUpdateCalibration={(patch) => save({ ...store, ...patch })}
              />

              <JourneyDiscoverHub
                path={path}
                activeModule={module}
                activeLesson={currentLesson}
                store={store}
                onResumeLesson={() =>
                  openLesson(nextModule ?? module, nextModule ? 0 : lessonAt, "video")
                }
                onBuildPath={(topicText) => {
                  const resolved = pathForNamedCourse(topicText);
                  review(resolved, topicText);
                }}
                onSelectSubject={(target) => selectSubjectQuickly(target)}
                onOpenDiscover={() => setScreen("discover")}
                onOpenNoctisTutor={(promptText) => openNoctis(promptText)}
              />
            </>
          ) : null}

          {screen === "review" && pending ? (
            <Shell
              stepBadge="STEP 1 & 2 — CALIBRATE & REVIEW YOUR LEARNING PATH"
              title={`Review Roadmap: ${pending.title}`}
              onBack={() => setScreen("home")}
            >
              <p className="text-sm text-[#A9B6C9]">{pending.blurb}</p>
              <div className="mt-3 rounded-2xl border border-[#F2C567]/30 bg-[#0B1220] p-3.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">
                  Defined Outcome (What completing this journey means)
                </p>
                <p className="mt-1 text-sm font-semibold text-[#F5F7FB]">{pending.outcome}</p>
                <p className="mt-1 text-xs text-[#A9B6C9]">
                  Final practical endpoint: {pending.project}
                </p>
              </div>

              {/* Learner calibration controls (Step 1) */}
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <label className="block rounded-2xl border border-[#2D3B50] bg-[#0B1220] p-3 text-xs font-semibold uppercase tracking-wider text-[#A9B6C9]">
                  1. Current knowledge
                  <select
                    value={store.level}
                    onChange={(event) =>
                      save({ ...store, level: event.target.value as JourneyLevel })
                    }
                    className="mt-1.5 block h-9 w-full rounded-xl border border-[#2D3B50] bg-[#141E2D] px-2.5 text-sm font-semibold text-[#F5F7FB]"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </label>

                <label className="block rounded-2xl border border-[#2D3B50] bg-[#0B1220] p-3 text-xs font-semibold uppercase tracking-wider text-[#A9B6C9]">
                  2. Learning goal
                  <select
                    value={store.goal ?? "project"}
                    onChange={(event) =>
                      save({ ...store, goal: event.target.value as JourneyGoal })
                    }
                    className="mt-1.5 block h-9 w-full rounded-xl border border-[#2D3B50] bg-[#141E2D] px-2.5 text-sm font-semibold text-[#F5F7FB]"
                  >
                    <option value="understand">Understand essentials</option>
                    <option value="project">Build a real project</option>
                    <option value="career">Career / trade readiness</option>
                    <option value="exam">Exam / credential prep</option>
                  </select>
                </label>

                <label className="block rounded-2xl border border-[#2D3B50] bg-[#0B1220] p-3 text-xs font-semibold uppercase tracking-wider text-[#A9B6C9]">
                  3. Time commitment
                  <select
                    value={store.timeCommitment ?? "30 min/day"}
                    onChange={(event) =>
                      save({
                        ...store,
                        timeCommitment: event.target.value as JourneyTimeCommitment,
                      })
                    }
                    className="mt-1.5 block h-9 w-full rounded-xl border border-[#2D3B50] bg-[#141E2D] px-2.5 text-sm font-semibold text-[#F5F7FB]"
                  >
                    <option value="15 min/day">15 min/day (Steady)</option>
                    <option value="30 min/day">30 min/day (Standard)</option>
                    <option value="1 hr/day">1 hr/day (Intensive)</option>
                  </select>
                </label>
              </div>
              <p className="mt-2 text-xs text-[#A9B6C9]">
                Calibration: <strong className="text-[#F5F7FB]">{store.level}</strong> —{" "}
                {depthLine(store.level)} · Goal:{" "}
                <strong className="text-[#F5F7FB]">
                  {GOAL_LABELS[store.goal ?? "project"]}
                </strong>
              </p>

              {/* Entry prerequisites */}
              {pending.entryRequirements?.length ? (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#A9B6C9]">
                  <span className="font-semibold uppercase tracking-wider text-[#F2C567]">
                    Prerequisites:
                  </span>
                  {pending.entryRequirements.map((req) => (
                    <span
                      key={req}
                      className="rounded-full border border-[#2D3B50] bg-[#0B1220] px-2.5 py-1"
                    >
                      {req}
                    </span>
                  ))}
                </div>
              ) : null}

              {/* Ordered modules with stages & lesson counts */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#A9B6C9]">
                  <span>Your Learning Roadmap ({pending.modules.length} modules)</span>
                  <span>Sequence: Foundations → Core → Practice → Project</span>
                </div>
                <ol className="mt-2.5 space-y-2.5">
                  {pending.modules.map((item, index) => (
                    <li
                      key={item.id}
                      className="rounded-2xl border border-[#2D3B50] bg-[#1B2739]/80 px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[#F5F7FB]">
                          {index + 1}. {item.title}
                        </p>
                        <div className="flex items-center gap-2">
                          {item.stage ? (
                            <span className="rounded-full border border-[#F2C567]/40 bg-[#F2C567]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#F2C567]">
                              {item.stage}
                            </span>
                          ) : null}
                          <span className="text-xs font-semibold text-[#A9B6C9]">
                            {item.lessonCountLabel ?? `${item.lessons.length} lessons`}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-[#A9B6C9]">{item.summary}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <p className="mt-3 text-xs text-[#A9B6C9]">
                Note: This is structured training on Vibe / Noctis. Official third-party vendor exams or state licences come from their respective issuing bodies.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={createJourney}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#F2C567] px-5 text-sm font-semibold text-[#1a1408] shadow-md hover:bg-[#f5d07e]"
                >
                  Create my journey & start Module 1 <ArrowRight className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => jumpToLearn("start-journey", { journey: pending })}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#F2C567] bg-[#0B1220] px-5 text-sm font-semibold text-[#F2C567] hover:bg-[#141E2D]"
                >
                  Start this journey in Learn →
                </button>
              </div>
            </Shell>
          ) : null}

          {screen === "path" ? (
            <Shell
              stepBadge={`STEP 2 — STRUCTURED LEARNING ROADMAP · ${passed.size} OF ${path.modules.length} MODULES VERIFIED`}
              title={path.title}
              onBack={() => setScreen("home")}
            >
              <p className="text-sm text-[#A9B6C9]">{path.blurb}</p>
              <div className="mt-3 grid gap-3 rounded-2xl border border-[#2D3B50] bg-[#0B1220] p-3.5 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#F2C567]">
                    What to learn next
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#F5F7FB]">
                    {nextModule
                      ? `Module ${path.modules.findIndex((m) => m.id === nextModule.id) + 1}: ${nextModule.title}`
                      : "All module checks passed — complete your Final Project"}
                  </p>
                  <p className="mt-0.5 text-xs text-[#A9B6C9]">
                    {nextModule
                      ? nextModule.summary
                      : "Open the Final Project screen to submit and verify your work."}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#F2C567]">
                    What completing this journey means
                  </p>
                  <p className="mt-1 text-sm text-[#F5F7FB]">{path.outcome}</p>
                  <p className="mt-0.5 text-xs text-[#A9B6C9]">
                    Watching a video alone never counts as mastery. Each module requires passing its check.
                  </p>
                </div>
              </div>

              <ol className="mt-4 space-y-2.5">
                {path.modules.map((item, index) => {
                  const done = passed.has(item.id);
                  const isNext = !done && nextModule?.id === item.id;
                  const needsRev = (store.revisionQueue?.[path.id] ?? []).includes(item.id);
                  return (
                    <li key={item.id}>
                      <div
                        className={cn(
                          "rounded-2xl border p-4 transition",
                          done
                            ? "border-emerald-500/40 bg-[#132232]"
                            : isNext
                              ? "border-[#F2C567] bg-[#1B2739]"
                              : "border-[#2D3B50] bg-[#0B1220]/80",
                        )}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={cn(
                                  "grid size-6 place-items-center rounded-full text-xs font-bold",
                                  done
                                    ? "bg-emerald-400 text-[#0B1220]"
                                    : isNext
                                      ? "bg-[#F2C567] text-[#1a1408]"
                                      : "bg-[#2D3B50] text-[#A9B6C9]",
                                )}
                              >
                                {done ? <Check className="size-3.5" /> : index + 1}
                              </span>
                              <span className="text-base font-semibold text-[#F5F7FB]">
                                {index + 1}. {item.title}
                              </span>
                              {item.stage ? (
                                <span className="rounded-full border border-[#2D3B50] bg-[#0B1220] px-2.5 py-0.5 text-[11px] font-semibold text-[#F2C567]">
                                  {item.stage}
                                </span>
                              ) : null}
                              <span className="text-xs font-semibold text-[#A9B6C9]">
                                {item.lessonCountLabel ?? `${item.lessons.length} lessons`}
                              </span>
                              {needsRev ? (
                                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                                  Needs revision
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1.5 text-sm text-[#A9B6C9]">{item.summary}</p>
                            {item.prerequisites?.length ? (
                              <p className="mt-1 text-xs text-[#7E8FA6]">
                                Prerequisites: {item.prerequisites.join(" · ")}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex shrink-0 flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openLesson(item, 0)}
                              className={cn(
                                "h-10 rounded-xl px-3.5 text-xs font-semibold",
                                isNext
                                  ? "bg-[#F2C567] text-[#1a1408]"
                                  : "border border-[#2D3B50] bg-[#141E2D] text-[#F5F7FB] hover:border-[#F2C567]",
                              )}
                            >
                              {done ? "Review lessons" : isNext ? "Start module →" : "Preview module"}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                jumpToLearn("select-module", {
                                  journey: path,
                                  moduleId: item.id,
                                  lessonId: item.lessons[0]?.id,
                                })
                              }
                              className="h-10 rounded-xl border border-[#F2C567]/50 bg-[#0B1220] px-3 text-xs font-semibold text-[#F2C567] hover:bg-[#141E2D]"
                            >
                              Open in Learn ↗
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setModuleId(item.id);
                                setChoice(null);
                                setMarked(null);
                                setScreen("check");
                              }}
                              className="h-10 rounded-xl border border-[#2D3B50] bg-[#0B1220] px-3 text-xs font-semibold text-[#A9B6C9] hover:text-[#F5F7FB]"
                            >
                              {done ? "Checked ✓" : "Prove understanding"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => (nextModule ? openLesson(nextModule) : setScreen("project"))}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#F2C567] px-5 text-sm font-semibold text-[#1a1408]"
                >
                  {nextModule ? `Continue learning: ${nextModule.title}` : "Open Final Project & Certificate"}
                  <ArrowRight className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => jumpToLearn("continue-learning")}
                  className="h-12 rounded-2xl border border-[#F2C567] bg-[#0B1220] px-4 text-xs font-semibold text-[#F2C567] hover:bg-[#141E2D]"
                >
                  Continue in Learn Player ↗
                </button>
                <button
                  type="button"
                  onClick={() => setScreen("progress")}
                  className="h-12 rounded-2xl border border-[#2D3B50] bg-[#0B1220] px-4 text-xs font-semibold text-[#A9B6C9] hover:text-[#F5F7FB]"
                >
                  View 6 Progress Indicators
                </button>
              </div>
            </Shell>
          ) : null}

          {screen === "lesson" ? (
            <Shell
              stepBadge={`STEP 3 — MULTI-FORMAT LESSON STUDIO · ${module.title.toUpperCase()}`}
              title={`Lesson ${lessonAt + 1} of ${module.lessons.length}: ${currentLesson?.title}`}
              onBack={() => setScreen("path")}
            >
              {/* Lesson switcher pills inside module */}
              <div className="flex flex-wrap gap-2">
                {module.lessons.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openLesson(module, idx, formatTab)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-semibold",
                      idx === lessonAt
                        ? "bg-[#F2C567] text-[#1a1408]"
                        : "border border-[#2D3B50] bg-[#0B1220] text-[#A9B6C9]",
                    )}
                  >
                    {idx + 1}. {item.title} ({item.kind})
                  </button>
                ))}
              </div>

              {/* Multi-format tabs generated from the shared Lesson Specification */}
              <div className="mt-4 flex flex-wrap gap-1.5 border-b border-[#2D3B50] pb-3">
                {(
                  [
                    ["video", "Narrated Video & Script"],
                    ["slides", `Slide Deck (${currentLesson.slides?.length ?? 3})`],
                    ["notes", "Plain-Language Notes & Example"],
                    ["diagram", "Concept Diagram"],
                    ["vocab", "Vocabulary & Verified Sources"],
                  ] as const
                ).map(([tabId, label]) => (
                  <button
                    key={tabId}
                    type="button"
                    onClick={() => setFormatTab(tabId)}
                    className={cn(
                      "rounded-xl px-3 py-2 text-xs font-semibold transition",
                      formatTab === tabId
                        ? "bg-[#1B2739] text-[#F2C567] ring-1 ring-[#F2C567]/50"
                        : "bg-[#0B1220] text-[#A9B6C9] hover:text-[#F5F7FB]",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Format Content Panel */}
              <div className="mt-4 rounded-2xl border border-[#2D3B50] bg-[#0B1220] p-4">
                {formatTab === "video" ? (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F2C567]/15 px-3 py-1 text-xs font-semibold text-[#F2C567]">
                        <Play className="size-3.5 fill-current" /> Short Explanatory Video / Narrated Walkthrough
                      </span>
                      <span className="text-xs text-[#A9B6C9]">
                        {currentLesson.videoScript?.durationSec ?? 90}s narrated lesson · Shared Lesson Spec{" "}
                        {currentLesson.version}
                      </span>
                    </div>
                    <div className="mt-3 rounded-2xl border border-[#2D3B50] bg-gradient-to-br from-[#141E2D] via-[#0F1726] to-[#1B2739] p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">
                        Visual Scene Cue
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#F5F7FB]">
                        {currentLesson.videoScript?.visualCue ?? module.summary}
                      </p>
                      <div className="mt-4 space-y-2 border-l-2 border-[#F2C567] pl-3.5">
                        {(currentLesson.videoScript?.narration ?? [currentLesson.doThis]).map(
                          (line, i) => (
                            <p key={i} className="text-sm leading-relaxed text-[#D8E1EE]">
                              {line}
                            </p>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}

                {formatTab === "slides" ? (
                  <div>
                    {(() => {
                      const slides = currentLesson.slides ?? [];
                      const activeSlide = slides[slideIndex] ?? slides[0];
                      if (!activeSlide) return <p className="text-sm">{currentLesson.doThis}</p>;
                      return (
                        <div>
                          <div className="flex items-center justify-between text-xs text-[#A9B6C9]">
                            <span className="font-semibold uppercase tracking-wider text-[#F2C567]">
                              Slide {slideIndex + 1} of {slides.length}
                            </span>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                disabled={slideIndex === 0}
                                onClick={() => setSlideIndex((s) => Math.max(0, s - 1))}
                                className="rounded-lg border border-[#2D3B50] px-2.5 py-1 text-xs font-semibold disabled:opacity-40"
                              >
                                Prev Slide
                              </button>
                              <button
                                type="button"
                                disabled={slideIndex >= slides.length - 1}
                                onClick={() =>
                                  setSlideIndex((s) => Math.min(slides.length - 1, s + 1))
                                }
                                className="rounded-lg border border-[#2D3B50] px-2.5 py-1 text-xs font-semibold disabled:opacity-40"
                              >
                                Next Slide
                              </button>
                            </div>
                          </div>
                          <h4 className="mt-2 font-display text-xl font-semibold text-[#F5F7FB]">
                            {activeSlide.heading}
                          </h4>
                          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-[#D8E1EE]">
                            {activeSlide.bullets.map((b) => (
                              <li key={b}>{b}</li>
                            ))}
                          </ul>
                          <p className="mt-3 rounded-xl bg-[#141E2D] px-3 py-2 text-xs font-semibold text-[#F2C567]">
                            Key Takeaway: {activeSlide.takeaway}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                ) : null}

                {formatTab === "notes" ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">
                        Plain-Language Study Notes
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#D8E1EE]">
                        {currentLesson.notes ?? module.summary}
                      </p>
                    </div>
                    {currentLesson.workedExample ? (
                      <div className="rounded-xl border border-[#2D3B50] bg-[#141E2D] p-3.5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">
                          Worked Example — {currentLesson.workedExample.scenario}
                        </p>
                        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[#D8E1EE]">
                          {currentLesson.workedExample.steps.map((st) => (
                            <li key={st}>{st}</li>
                          ))}
                        </ol>
                        <p className="mt-2 text-xs font-semibold text-emerald-300">
                          Result: {currentLesson.workedExample.result}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {formatTab === "diagram" ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">
                      {currentLesson.diagram?.title ?? "Concept Flow Diagram"}
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      {(currentLesson.diagram?.nodes ?? []).map((node, i) => (
                        <div
                          key={node.label}
                          className="rounded-xl border border-[#F2C567]/35 bg-[#141E2D] p-3"
                        >
                          <span className="text-xs font-bold text-[#F2C567]">
                            Stage {i + 1}
                          </span>
                          <p className="mt-1 text-sm font-semibold text-[#F5F7FB]">
                            {node.label}
                          </p>
                          <p className="mt-1 text-xs text-[#A9B6C9]">{node.detail}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2.5 text-xs text-[#A9B6C9]">
                      {currentLesson.diagram?.flowCaption}
                    </p>
                  </div>
                ) : null}

                {formatTab === "vocab" ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">
                        Key Vocabulary
                      </p>
                      <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                        {(currentLesson.vocabulary ?? []).map((v) => (
                          <div
                            key={v.term}
                            className="rounded-xl border border-[#2D3B50] bg-[#141E2D] p-3"
                          >
                            <dt className="text-sm font-semibold text-[#F2C567]">{v.term}</dt>
                            <dd className="mt-1 text-xs text-[#D8E1EE]">{v.definition}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">
                        Verified Source References & Provenance
                      </p>
                      <ul className="mt-2 space-y-2">
                        {(path.sources ?? []).map((src) => (
                          <li
                            key={src.id}
                            className="rounded-xl border border-[#2D3B50] bg-[#141E2D] p-3 text-xs"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <a
                                href={src.href}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-[#F2C567] hover:underline"
                              >
                                {src.title} ({src.publisher})
                              </a>
                              <span className="rounded-full border border-[#2D3B50] px-2 py-0.5 text-[10px] text-[#A9B6C9]">
                                {src.license}
                              </span>
                            </div>
                            <p className="mt-1 text-[#A9B6C9]">{src.verifiedClaim}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Adaptive Teaching Agent: Explain Differently When Confused (Step 3 Requirement) */}
              <div className="mt-4 rounded-2xl border border-[#2D3B50] bg-[#141E2D] p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-[#F2C567]">
                    Confused? Ask the Teaching Agent to explain this concept differently:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        ["analogy", "Real-world Analogy"],
                        ["stepByStep", "Step-by-Step Breakdown"],
                        ["visualWalkthrough", "Visual Mental Model"],
                      ] as const
                    ).map(([mode, label]) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() =>
                          setAdaptiveMode(adaptiveMode === mode ? "none" : mode)
                        }
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          adaptiveMode === mode
                            ? "bg-[#F2C567] text-[#1a1408]"
                            : "border border-[#2D3B50] bg-[#0B1220] text-[#D8E1EE]",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {adaptiveMode !== "none" && currentLesson.adaptiveExplanations ? (
                  <p className="mt-2.5 rounded-xl border border-[#F2C567]/30 bg-[#0B1220] p-3 text-sm leading-relaxed text-[#F5F7FB]">
                    {currentLesson.adaptiveExplanations[adaptiveMode]}
                  </p>
                ) : null}
              </div>

              {/* Guided Practice Activity inside the lesson (Distinguishes Exposure from Practice) */}
              <div className="mt-4 rounded-2xl border border-[#2D3B50] bg-[#0B1220] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">
                    Hands-On Practice Task (Moves you from Exposure → Practice)
                  </p>
                  {practiceSaved ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="size-3.5" /> Practice recorded
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm font-semibold text-[#F5F7FB]">
                  {currentLesson.practicalTask?.prompt ?? currentLesson.doThis}
                </p>
                <p className="mt-0.5 text-xs text-[#A9B6C9]">
                  {currentLesson.practicalTask?.hint ??
                    "Reading or watching alone does not count as mastery. Write your short practice response below."}
                </p>
                <textarea
                  value={practiceInput}
                  onChange={(e) => {
                    setPracticeInput(e.target.value);
                    setPracticeSaved(false);
                  }}
                  placeholder="Write your short practice response or worked step here..."
                  className="mt-2.5 h-20 w-full resize-none rounded-xl border border-[#2D3B50] bg-[#141E2D] p-2.5 text-sm text-[#F5F7FB] outline-none focus:border-[#F2C567]"
                />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={savePracticeTask}
                    className="h-9 rounded-xl bg-[#F2C567] px-3.5 text-xs font-semibold text-[#1a1408]"
                  >
                    Save practice activity
                  </button>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => ask(module)}
                      className="h-9 rounded-full border border-[#F2C567] px-3 text-xs font-semibold text-[#F2C567]"
                    >
                      Ask Noctis Tutor
                    </button>
                    {studyAsks(`${path.title}. ${currentLesson?.title ?? module.title}`)
                      .slice(0, 2)
                      .map((row) => (
                        <button
                          key={row.label}
                          type="button"
                          onClick={() => openNoctis(row.ask)}
                          className="h-9 rounded-full border border-[#2D3B50] px-3 text-xs font-semibold text-[#A9B6C9] hover:text-[#F5F7FB]"
                        >
                          {row.label}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  disabled={lessonAt === 0}
                  onClick={() => openLesson(module, Math.max(0, lessonAt - 1), formatTab)}
                  className="h-11 flex-1 rounded-2xl border border-[#2D3B50] text-sm font-semibold disabled:opacity-40"
                >
                  Previous Lesson
                </button>
                <button
                  type="button"
                  onClick={() =>
                    lessonAt < module.lessons.length - 1
                      ? openLesson(module, lessonAt + 1, formatTab)
                      : setScreen("check")
                  }
                  className="h-11 flex-1 rounded-2xl bg-[#F2C567] text-sm font-semibold text-[#1a1408]"
                >
                  {lessonAt < module.lessons.length - 1
                    ? "Next Lesson →"
                    : "Prove Understanding (Take Module Check) →"}
                </button>
              </div>

              <div className="mt-5 border-t border-[#2D3B50] pt-4">
                <JourneyDiscoverHub
                  path={path}
                  activeModule={module}
                  activeLesson={currentLesson}
                  store={store}
                  onResumeLesson={() => openLesson(module, lessonAt, formatTab)}
                  onBuildPath={(topicText) => {
                    const resolved = pathForNamedCourse(topicText);
                    review(resolved, topicText);
                  }}
                  onSelectSubject={(target) => selectSubjectQuickly(target)}
                  onOpenDiscover={() => setScreen("discover")}
                  onOpenNoctisTutor={(promptText) => openNoctis(promptText)}
                />
              </div>
            </Shell>
          ) : null}

          {screen === "check" ? (
            <Shell
              stepBadge={`STEP 4 — MEASURE REAL UNDERSTANDING · ${module.title.toUpperCase()}`}
              title="Show That You Understand"
              onBack={() => setScreen("lesson")}
            >
              <p className="text-xs text-[#A9B6C9]">
                Assessment Agent Check for <strong className="text-[#F5F7FB]">{module.title}</strong>. Watching a video alone does not count as mastery — passing this check verifies concept proficiency.
              </p>
              <p className="mt-3 text-base font-semibold text-[#F5F7FB]">{module.check.prompt}</p>
              <div className="mt-3 space-y-2">
                {module.check.choices.map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setChoice(index)}
                    className={cn(
                      "block w-full rounded-2xl border px-4 py-3 text-left text-sm transition",
                      choice === index
                        ? "border-[#F2C567] bg-[#1B2739] font-semibold"
                        : "border-[#2D3B50] bg-[#0B1220]",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => grade(module)}
                className="mt-4 h-11 w-full rounded-2xl bg-[#F2C567] text-sm font-semibold text-[#1a1408]"
              >
                Verify my answer
              </button>

              {marked === "wrong" ? (
                <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4">
                  <p className="text-sm font-semibold text-amber-300">
                    Not yet — added to your Progress Coach revision list.
                  </p>
                  <p className="mt-1 text-sm text-[#D8E1EE]">{module.check.why}</p>
                  {module.check.remediation ? (
                    <p className="mt-1.5 text-xs text-[#A9B6C9]">
                      Remediation tip: {module.check.remediation}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => ask(module, true)}
                      className="rounded-xl bg-[#F2C567] px-3.5 py-2 text-xs font-semibold text-[#1a1408]"
                    >
                      Ask Noctis to explain the miss differently
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAdaptiveMode("analogy");
                        setScreen("lesson");
                      }}
                      className="rounded-xl border border-[#2D3B50] px-3.5 py-2 text-xs font-semibold text-[#F5F7FB]"
                    >
                      Re-open lesson with Analogy mode
                    </button>
                  </div>
                </div>
              ) : null}

              {marked === "right" ? (
                <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4">
                  <p className="text-sm font-semibold text-emerald-300">
                    Verified! That counts toward your Knowledge Mastery.
                  </p>
                  <p className="mt-1 text-sm text-[#D8E1EE]">{module.check.why}</p>

                  {/* Spaced Retention Quick Check */}
                  <div className="mt-4 border-t border-[#2D3B50] pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">
                      Retention Lock-In (Confirm long-term recall)
                    </p>
                    <p className="mt-1 text-xs text-[#A9B6C9]">
                      Can you apply this concept in your own words or confirm the recall check?
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRetentionChoice(module.check.answer);
                          gradeRetention(module);
                          setScreen(
                            passed.size >= path.modules.length ? "project" : "path",
                          );
                        }}
                        className="h-10 rounded-xl bg-[#F2C567] px-4 text-xs font-semibold text-[#1a1408]"
                      >
                        {passed.size >= path.modules.length
                          ? "Continue to Final Project →"
                          : "Continue to Next Module →"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </Shell>
          ) : null}

          {screen === "project" ? (
            <Shell
              stepBadge="STEP 5 — REACH A MEANINGFUL ENDPOINT (PROJECT AGENT EVALUATION)"
              title="Final Practical Project & Rubric Evaluation"
              onBack={() => setScreen("path")}
            >
              <div className="rounded-2xl border border-[#F2C567]/35 bg-[#0B1220] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">
                  Subject-Specific Capstone Challenge ({path.subject})
                </p>
                <p className="mt-1 text-sm font-semibold text-[#F5F7FB]">{path.project}</p>
                <p className="mt-1 text-xs text-[#A9B6C9]">
                  Expected learning outcome: {path.outcome}
                </p>
              </div>

              {/* Project Rubric Checklist */}
              {path.projectRubric?.length ? (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#A9B6C9]">
                    Project Agent Evaluation Rubric ({indicators.projectEvaluation.scorePct}% met)
                  </p>
                  <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                    {path.projectRubric.map((r) => {
                      const met = indicators.projectEvaluation.passedCriteria.includes(r.id);
                      return (
                        <li
                          key={r.id}
                          className={cn(
                            "rounded-xl border p-3 text-xs",
                            met
                              ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-200"
                              : "border-[#2D3B50] bg-[#0B1220] text-[#A9B6C9]",
                          )}
                        >
                          <div className="flex items-center justify-between font-semibold text-[#F5F7FB]">
                            <span>{r.criterion}</span>
                            <span>{met ? "Verified ✓" : "Required"}</span>
                          </div>
                          <p className="mt-1">{r.description}</p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              <textarea
                value={projectDraft}
                onChange={(event) => setProjectDraft(event.target.value)}
                placeholder="Describe or paste what you built, analysed, or calculated, addressing each rubric point above..."
                className="mt-4 h-36 w-full resize-none rounded-2xl border border-[#2D3B50] bg-[#0B1220] p-3.5 text-sm text-[#F5F7FB] outline-none focus:border-[#F2C567]"
              />

              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const nextStore = {
                      ...store,
                      seen: true,
                      projects: { ...store.projects, [path.id]: projectDraft },
                    };
                    save(nextStore);
                    const evalResult = evaluateProjectSubmission(path, projectDraft);
                    if (evalResult.verified && passed.size === path.modules.length) {
                      setScreen("done");
                    }
                  }}
                  className="h-11 flex-1 rounded-2xl bg-[#F2C567] px-5 text-sm font-semibold text-[#1a1408]"
                >
                  Submit & Evaluate Project
                </button>
                {projectDone ? (
                  <button
                    type="button"
                    onClick={() => setScreen("done")}
                    className="h-11 rounded-2xl border border-emerald-400/50 bg-emerald-950/30 px-4 text-xs font-semibold text-emerald-300"
                  >
                    Open Learning Report & Certificate →
                  </button>
                ) : null}
              </div>

              <p className="mt-2 text-xs text-[#A9B6C9]">
                {passed.size === path.modules.length
                  ? indicators.projectEvaluation.verified
                    ? "All module checks and project rubric criteria are verified!"
                    : `Include details for the remaining rubric items (${indicators.projectEvaluation.missingCriteria.map((m) => m.criterion).join(", ")}) to unlock completion.`
                  : `${path.modules.length - passed.size} module check(s) are still open. Pass all module checks so your project can be certified.`}
              </p>
            </Shell>
          ) : null}

          {screen === "progress" ? (
            <Shell
              stepBadge="SECTION 6 — VERIFIABLE PROGRESS ENGINE (6 MEANINGFUL INDICATORS)"
              title="What Is Actually Done & Verified"
              onBack={() => setScreen("home")}
            >
              <p className="text-sm text-[#A9B6C9]">
                Vibe / Noctis separates <strong className="text-[#F5F7FB]">Exposure</strong> (watching/reading),{" "}
                <strong className="text-[#F5F7FB]">Practice</strong> (hands-on tasks),{" "}
                <strong className="text-[#F5F7FB]">Proficiency</strong> (passed checks), and{" "}
                <strong className="text-[#F5F7FB]">Mastery</strong> (verified checks + completed project).
              </p>

              {/* 4-Stage Mastery Tier Bar */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                {(["Exposure", "Practice", "Proficiency", "Mastery"] as const).map((tier) => {
                  const active = indicators.masteryTier === tier;
                  return (
                    <div
                      key={tier}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-center text-xs font-semibold",
                        active
                          ? "border-[#F2C567] bg-[#F2C567]/15 text-[#F2C567]"
                          : "border-[#2D3B50] bg-[#0B1220] text-[#A9B6C9]",
                      )}
                    >
                      {tier}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Row
                  label="1. Curriculum completion (Exposure & Practice)"
                  value={`${indicators.completedLessonsCount}/${indicators.totalLessonsCount} lessons studied (${indicators.learningProgressPct}%)`}
                  note="Formula: Count of lessons viewed or practised divided by total lessons. Never mixed with quiz mastery."
                />
                <Row
                  label="2. Knowledge mastery (Assessment performance)"
                  value={`${indicators.knowledgeMasteryPct}% (${indicators.passedChecksCount}/${indicators.totalModulesCount} checks passed)`}
                  note="Formula: (Passed module mastery checks ÷ Total modules) × 100. Watching a video alone contributes 0%."
                />
                <Row
                  label="3. Competency mastery (Demonstrated skills)"
                  value={
                    indicators.skillsDemonstrated.length
                      ? indicators.skillsDemonstrated.join(", ")
                      : "None verified yet"
                  }
                  note="Formula: Modules where both lesson activity and formal assessment check have been verified."
                />
                <Row
                  label="4. Retention check results"
                  value={`${indicators.retentionPct}% (${indicators.retentionCount}/${indicators.totalModulesCount} modules retained)`}
                  note="Formula: (Passed spaced retention checks ÷ Total modules) × 100."
                />
                <Row
                  label="5. Practical work & project rubric"
                  value={
                    indicators.projectsCompletedCount
                      ? `1 Verified (${path.title} — ${indicators.projectEvaluation.scorePct}% rubric)`
                      : `0 Completed (${indicators.projectEvaluation.scorePct}% rubric criteria matched)`
                  }
                  note="Formula: (Matched project rubric criteria ÷ Total rubric criteria) × 100; requires ≥ 75% + all module checks."
                />
                <Row
                  label="6. Readiness for subsequent modules"
                  value={`${indicators.readinessPct}% — ${indicators.readinessLabel}`}
                  note="Formula: 65% Knowledge Mastery + 35% Verified Project Rubric (80% threshold required)."
                />
              </div>

              {indicators.needsRevision.length ? (
                <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-950/20 p-3.5 text-xs">
                  <p className="font-semibold text-amber-300">
                    Concepts needing revision (Progress Coach):
                  </p>
                  <p className="mt-1 text-[#D8E1EE]">{indicators.needsRevision.join(" · ")}</p>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => setScreen(nextModule ? "path" : "project")}
                className="mt-4 h-11 w-full rounded-2xl bg-[#F2C567] text-sm font-semibold text-[#1a1408]"
              >
                {nextModule ? `Identify & close next gap: ${nextModule.title}` : "Open Final Project"}
              </button>
            </Shell>
          ) : null}

          {screen === "agents" ? (
            <Shell
              stepBadge="SCREEN 09 & SECTION 3/5 — NOCTIS LEARNING GUIDE & 8-AGENT ORCHESTRATOR"
              title="Noctis Context-Aware Learning Guide & 8 Specialized AI Agents"
              onBack={() => setScreen("home")}
            >
              {/* Screen 09: Noctis Context-Aware Learning Guide (8 Required Actions + Grounded Citations) */}
              <div className="rounded-2xl border border-[#F2C567]/50 bg-[#0B1220] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">
                      Screen 09 · Noctis Context-Aware Learning Guide
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-[#F5F7FB]">
                      Context: {path.title} → {module.title} → {currentLesson.title} ({store.level})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => ask(module)}
                    className="rounded-xl bg-[#F2C567] px-3.5 py-1.5 text-xs font-semibold text-[#1a1408]"
                  >
                    Open Full Noctis Chat →
                  </button>
                </div>

                {/* 8 Required Noctis Quick-Action Buttons */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {NOCTIS_GUIDE_ACTIONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setNoctisAction(item.id)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                        noctisAction === item.id
                          ? "bg-[#F2C567] text-[#1a1408]"
                          : "border border-[#2D3B50] bg-[#141E2D] text-[#D8E1EE] hover:border-[#F2C567]/60",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Grounded Tutor Response with Citations & Uncertainty Rule */}
                <div className="mt-3 rounded-xl border border-[#2D3B50] bg-[#141E2D] p-3.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#F2C567]">
                    {tutorReply.heading}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#F5F7FB]">
                    {tutorReply.body}
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-[#D8E1EE]">
                    {tutorReply.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                  {tutorReply.citations.length ? (
                    <div className="mt-3 border-t border-white/10 pt-2.5">
                      <p className="text-[11px] font-semibold text-[#F2C567]">
                        Verified Source Citations ({tutorReply.citations.length}):
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {tutorReply.citations.map((c) => (
                          <a
                            key={c.id}
                            href={c.href}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-[#2D3B50] bg-[#0B1220] px-2.5 py-1 text-[11px] text-[#D8E1EE] hover:border-[#F2C567]"
                          >
                            {c.title} ({c.publisher} · {c.license})
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <p className="mt-2 text-[11px] text-[#8FA1B8]">{tutorReply.uncertaintyNote}</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[#F2C567]/40 bg-[#0B1220] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">
                      Active Orchestrator State
                    </p>
                    <p className="mt-1 text-base font-semibold text-[#F5F7FB]">
                      {brief.activeStage}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#F2C567]/15 px-3 py-1 text-xs font-semibold text-[#F2C567]">
                    {brief.connectedSourcesCount} Approved Source Networks Connected
                  </span>
                </div>
                <p className="mt-2 text-xs text-[#A9B6C9]">
                  Next Orchestrated Action:{" "}
                  <strong className="text-[#F5F7FB]">{brief.nextActionLabel}</strong>
                </p>
              </div>

              {/* 8 Specialized Agent Roles */}
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#A9B6C9]">
                  Coordinated Learning Agent Architecture (Shared Course State & Provenance)
                </p>
                <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
                  {LEARNING_AGENTS.map((agent) => (
                    <div
                      key={agent.id}
                      className="rounded-2xl border border-[#2D3B50] bg-[#0B1220] p-3.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#F2C567]">
                          {agent.number === 0
                            ? agent.name
                            : `${agent.number}. ${agent.name}`}
                        </span>
                        <span className="rounded-full border border-[#2D3B50] px-2 py-0.5 text-[10px] text-[#A9B6C9]">
                          {agent.role}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#D8E1EE]">
                        {agent.responsibility}
                      </p>
                      <p className="mt-2 text-[11px] text-[#8FA1B8]">
                        Outputs: {agent.outputs.join(" · ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5-Stage Structured Content Pipeline */}
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#A9B6C9]">
                  5-Stage Structured Content Pipeline (How Vibe Finds & Verifies Material)
                </p>
                <ol className="mt-2.5 space-y-2">
                  {CONTENT_PIPELINE_STEPS.map((st) => (
                    <li
                      key={st.code}
                      className="flex items-start gap-3 rounded-2xl border border-[#2D3B50] bg-[#0B1220] p-3"
                    >
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#F2C567] text-xs font-bold text-[#1a1408]">
                        {st.code}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-[#F5F7FB]">{st.title}</p>
                          <span className="text-[11px] font-semibold text-[#F2C567]">
                            {st.artifact}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#A9B6C9]">{st.summary}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </Shell>
          ) : null}

          {screen === "done" ? (
            <Shell
              stepBadge="STEP 5 — VERIFIED LEARNING REPORT & COMPLETION RECORD"
              title={`Journey Complete: ${path.title}`}
              onBack={() => setScreen("home")}
            >
              <div className="rounded-2xl border-2 border-[#F2C567] bg-gradient-to-br from-[#1B2538] via-[#111927] to-[#1E1910] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-12 place-items-center rounded-full bg-[#F2C567] text-[#1a1408]">
                      <Award className="size-6" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F2C567]">
                        Vibe + Noctis Verified Completion Certificate
                      </p>
                      <h3 className="font-display text-2xl font-semibold text-[#F5F7FB]">
                        {path.title} ({store.level})
                      </h3>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-400/50 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                    100% Mastery & Project Verified
                  </span>
                </div>

                <p className="mt-3 text-sm text-[#D8E1EE]">
                  <strong>Demonstrated Outcome:</strong> {path.outcome}
                </p>

                <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#A9B6C9]">
                      Checks Passed
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-[#F2C567]">
                      {passed.size} of {path.modules.length} modules (100%)
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#A9B6C9]">
                      Rubric Score
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-[#F2C567]">
                      {indicators.projectEvaluation.scorePct}% Verified
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#A9B6C9]">
                      Competencies
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-[#F5F7FB]">
                      {indicators.skillsDemonstrated.join(" · ")}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-[#A9B6C9]">
                  Note: This record certifies completion of the Vibe + Noctis learning journey and project rubric on this device. External vendor certifications or state licences are issued only by their official governing bodies.
                </p>
              </div>

              {/* Recommended Next Steps */}
              {path.nextSteps?.length ? (
                <div className="mt-4 rounded-2xl border border-[#2D3B50] bg-[#0B1220] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">
                    Recommended Next Steps
                  </p>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-[#D8E1EE]">
                    {path.nextSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => setScreen("home")}
                className="mt-4 h-11 w-full rounded-2xl bg-[#F2C567] text-sm font-semibold text-[#1a1408]"
              >
                Pick another learning journey
              </button>
            </Shell>
          ) : null}
        </div>

        {/* PERSISTENT RIGHT SIDEBAR (Matches Screenshot 2 + 6 Meaningful Indicators) */}
        <aside className="space-y-4">
          {/* Card 1: Your AI Guide — Vibe + Noctis */}
          <section className="rounded-[1.5rem] border border-[#F2C567]/35 bg-[#111A29] p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-full border border-[#F2C567]/60 bg-[#F2C567]/10 text-[#F2C567] shadow-[0_0_20px_rgba(242,197,103,0.2)]">
                <Sparkles className="size-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-[#F5F7FB]">Your AI guide</h3>
                <p className="text-xs font-semibold text-[#F2C567]">Vibe + Noctis</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#B6C2D4]">
              I’ll research trusted sources, explain the essentials, and guide you step by step.
            </p>

            {/* 3 Format Action Tiles matching Screenshot 2 */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => openLesson(module, lessonAt, "video")}
                className="flex flex-col items-center rounded-2xl border border-[#263449] bg-[#0B1220] p-2.5 text-center transition hover:border-[#F2C567]"
              >
                <span className="grid size-8 place-items-center rounded-xl bg-[#F2C567]/15 text-[#F2C567]">
                  <Play className="size-4 fill-current" />
                </span>
                <span className="mt-2 text-xs font-semibold text-[#F5F7FB]">Short videos</span>
                <span className="mt-0.5 text-[10px] leading-tight text-[#8FA1B8]">
                  Clear, focused explanations
                </span>
              </button>

              <button
                type="button"
                onClick={() => openLesson(module, lessonAt, "slides")}
                className="flex flex-col items-center rounded-2xl border border-[#263449] bg-[#0B1220] p-2.5 text-center transition hover:border-[#F2C567]"
              >
                <span className="grid size-8 place-items-center rounded-xl bg-[#F2C567]/15 text-[#F2C567]">
                  <FileText className="size-4" />
                </span>
                <span className="mt-2 text-xs font-semibold text-[#F5F7FB]">Slide lessons</span>
                <span className="mt-0.5 text-[10px] leading-tight text-[#8FA1B8]">
                  Structured learning
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setModuleId(module.id);
                  setChoice(null);
                  setMarked(null);
                  setScreen("check");
                }}
                className="flex flex-col items-center rounded-2xl border border-[#263449] bg-[#0B1220] p-2.5 text-center transition hover:border-[#F2C567]"
              >
                <span className="grid size-8 place-items-center rounded-xl bg-[#F2C567]/15 text-[#F2C567]">
                  <HelpCircle className="size-4" />
                </span>
                <span className="mt-2 text-xs font-semibold text-[#F5F7FB]">
                  Practice & quizzes
                </span>
                <span className="mt-0.5 text-[10px] leading-tight text-[#8FA1B8]">
                  Test and build skills
                </span>
              </button>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => ask(module)}
                className="h-9 flex-1 rounded-xl border border-[#F2C567]/50 bg-[#F2C567]/10 text-xs font-semibold text-[#F2C567] hover:bg-[#F2C567]/20"
              >
                Ask Vibe / Noctis
              </button>
              <button
                type="button"
                onClick={() => setScreen("agents")}
                className="h-9 rounded-xl border border-[#263449] bg-[#0B1220] px-3 text-xs font-semibold text-[#B6C2D4] hover:text-[#F5F7FB]"
              >
                8 AI Agents
              </button>
            </div>
          </section>

          {/* Card 2: How progress works (Matches Screenshot 2 + Section 6 Indicators) */}
          <section className="rounded-[1.5rem] border border-[#263449] bg-[#111A29] p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#F5F7FB]">How progress works</h3>
              <button
                type="button"
                onClick={() => setScreen("progress")}
                className="text-xs font-semibold text-[#F2C567] hover:underline"
              >
                All 6 metrics →
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              <div className="flex items-center justify-between rounded-2xl border border-[#263449] bg-[#0B1220] px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400">
                    <BookOpen className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-[#F5F7FB]">Lessons completed</p>
                    <p className="text-[11px] text-[#8FA1B8]">Watch, read and learn</p>
                  </div>
                </div>
                <span className="grid size-8 place-items-center rounded-full border border-[#F2C567]/40 bg-[#F2C567]/10 text-xs font-bold text-[#F2C567]">
                  {indicators.completedLessonsCount}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-[#263449] bg-[#0B1220] px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-purple-500/15 text-purple-400">
                    <TrendingUp className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-[#F5F7FB]">Skills mastered</p>
                    <p className="text-[11px] text-[#8FA1B8]">Build real knowledge</p>
                  </div>
                </div>
                <span className="grid size-8 place-items-center rounded-full border border-[#F2C567]/40 bg-[#F2C567]/10 text-xs font-bold text-[#F2C567]">
                  {indicators.passedChecksCount}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-[#263449] bg-[#0B1220] px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-amber-500/15 text-[#F2C567]">
                    <Award className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-[#F5F7FB]">Final project</p>
                    <p className="text-[11px] text-[#8FA1B8]">Apply what you’ve learned</p>
                  </div>
                </div>
                <span className="grid size-8 place-items-center rounded-full border border-[#F2C567]/40 bg-[#F2C567]/10 text-xs font-bold text-[#F2C567]">
                  {indicators.projectsCompletedCount}
                </span>
              </div>
            </div>

            {/* Compact 6-indicator summary bar */}
            <div className="mt-3 rounded-xl border border-[#263449] bg-[#0B1220]/70 p-2.5 text-[11px] text-[#8FA1B8]">
              <div className="flex justify-between">
                <span>Knowledge mastery:</span>
                <strong className="text-[#F5F7FB]">{indicators.knowledgeMasteryPct}%</strong>
              </div>
              <div className="mt-1 flex justify-between">
                <span>Retention score:</span>
                <strong className="text-[#F5F7FB]">{indicators.retentionPct}%</strong>
              </div>
              <div className="mt-1 flex justify-between">
                <span>Readiness tier:</span>
                <strong className="text-[#F2C567]">{indicators.masteryTier}</strong>
              </div>
            </div>
          </section>

          {/* Card 3: Small steps. Big progress. Callout matching Screenshot 2 */}
          <section className="rounded-[1.5rem] border border-[#F2C567]/45 bg-gradient-to-br from-[#231B10] via-[#18140E] to-[#121824] p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#F2C567]/15 text-[#F2C567]">
                <Target className="size-5" />
              </span>
              <div>
                <p className="font-display text-base font-semibold text-[#F2C567]">
                  Small steps. Big progress.
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#D7C4A2]">
                  Pick a topic, follow the path, and build real skills with Vibe / Noctis.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function resolvePath(store: JourneyStore): JourneyPath {
  if (store.custom && store.custom.id === store.activeId) {
    return store.custom;
  }
  return (
    JOURNEY_PATHS.find((item) => item.id === store.activeId) ??
    pathForTopic(store.topic || store.activeId)
  );
}

function HomeDashboard({
  path,
  store,
  draft,
  onDraft,
  indicators,
  passed,
  nextModule,
  showCatalogDrawer,
  onToggleCatalog,
  onSelectSubject,
  onBuildPath,
  onStartDirectly,
  onOpenModule,
  onContinue,
  onOpenAgents,
  onOpenProgress,
  onUpdateCalibration,
}: {
  path: JourneyPath;
  store: JourneyStore;
  draft: string;
  onDraft: (v: string) => void;
  indicators: ReturnType<typeof computeJourneyIndicators>;
  passed: Set<string>;
  nextModule: JourneyModule | null;
  showCatalogDrawer: boolean;
  onToggleCatalog: () => void;
  onSelectSubject: (path: JourneyPath) => void;
  onBuildPath: (topic: string) => void;
  onStartDirectly: (path: JourneyPath) => void;
  onOpenModule: (module: JourneyModule) => void;
  onContinue: () => void;
  onOpenAgents: () => void;
  onOpenProgress: () => void;
  onUpdateCalibration: (patch: Partial<JourneyStore>) => void;
}) {
  const [waveFilter, setWaveFilter] = useState<"all" | ReleaseWaveId>("all");
  const [groupId, setGroupId] = useState(COURSE_GROUPS[0].id);
  const [trackFilter, setTrackFilter] = useState<string>("all");
  const [trackName, setTrackName] = useState(COURSE_GROUPS[0].tracks[0].name);
  const [course, setCourse] = useState(COURSE_GROUPS[0].tracks[0].courses[0]);
  const [courseQuery, setCourseQuery] = useState("");
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(
    path.modules[0]?.id ?? null,
  );

  const totalCatalogCourses = useMemo(() => getTotalCatalogCourseCount(), []);

  const visibleGroups =
    waveFilter === "all"
      ? COURSE_GROUPS
      : COURSE_GROUPS.filter((item) => item.waveId === waveFilter);
  const group =
    visibleGroups.find((item) => item.id === groupId) ??
    visibleGroups[0] ??
    COURSE_GROUPS[0]!;
  const track = group.tracks.find((item) => item.name === trackName) ?? group.tracks[0]!;

  // Build the list of course cards to display:
  // If user typed a global search query inside the catalogue, search across all visible groups;
  // otherwise show courses in the selected Category (filtered by selected Provider/Trade pill or all providers in that Category).
  const catalogCards = useMemo(() => {
    const q = courseQuery.trim().toLowerCase();
    const cards: {
      groupId: string;
      groupName: string;
      sectionTag: string;
      trackName: string;
      courseName: string;
    }[] = [];

    if (q.length > 0) {
      for (const gItem of visibleGroups) {
        for (const tItem of gItem.tracks) {
          for (const cItem of tItem.courses) {
            if (
              `${gItem.sectionTag} ${gItem.name} ${tItem.name} ${cItem}`
                .toLowerCase()
                .includes(q)
            ) {
              cards.push({
                groupId: gItem.id,
                groupName: gItem.name,
                sectionTag: gItem.sectionTag,
                trackName: tItem.name,
                courseName: cItem,
              });
            }
          }
        }
      }
      return cards;
    }

    const activeTracks =
      trackFilter === "all"
        ? group.tracks
        : group.tracks.filter((tItem) => tItem.name === trackFilter);

    for (const tItem of activeTracks) {
      for (const cItem of tItem.courses) {
        cards.push({
          groupId: group.id,
          groupName: group.name,
          sectionTag: group.sectionTag,
          trackName: tItem.name,
          courseName: cItem,
        });
      }
    }
    return cards;
  }, [courseQuery, visibleGroups, group, trackFilter]);

  const courseRecord = useMemo(
    () => getCourseRecordDetails(group.id, track.name, course),
    [group.id, track.name, course],
  );
  const hits = searchCourses(draft);

  function handleFormSubmit(event: FormEvent) {
    event.preventDefault();
    const chosen = draft.trim() || path.subject;
    onBuildPath(chosen);
  }

  function pickWave(nextWave: "all" | ReleaseWaveId) {
    setWaveFilter(nextWave);
    const pool =
      nextWave === "all"
        ? COURSE_GROUPS
        : COURSE_GROUPS.filter((item) => item.waveId === nextWave);
    const firstGroup = pool[0] ?? COURSE_GROUPS[0]!;
    setGroupId(firstGroup.id);
    setTrackFilter("all");
    setTrackName(firstGroup.tracks[0]!.name);
    setCourse(firstGroup.tracks[0]!.courses[0]!);
    setCourseQuery("");
  }

  function pickGroup(id: string) {
    const next = COURSE_GROUPS.find((item) => item.id === id) ?? COURSE_GROUPS[0]!;
    setGroupId(next.id);
    setTrackFilter("all");
    setTrackName(next.tracks[0]!.name);
    setCourse(next.tracks[0]!.courses[0]!);
    setCourseQuery("");
  }

  function pickTrackFilter(nextTrack: string) {
    setTrackFilter(nextTrack);
    if (nextTrack !== "all") {
      const found = group.tracks.find((item) => item.name === nextTrack);
      if (found && found.courses[0]) {
        setTrackName(found.name);
        setCourse(found.courses[0]);
      }
    }
  }

  const stageCards =
    path.stagePreviews ??
    path.modules.slice(0, 4).map((m, idx) => ({
      step: idx + 1,
      title: m.title,
      description: m.summary,
      totalLessons: m.lessons.length,
      icon: (["code", "file", "devices", "cloud"] as const)[idx] ?? "code",
    }));

  return (
    <div className="space-y-5">
      {/* 1. HERO SECTION (Matches Screenshot 2) */}
      <section className="relative overflow-hidden rounded-[1.6rem] border border-[#2D3B50] bg-gradient-to-br from-[#121C2D] via-[#0E1624] to-[#1D1A14] p-5 shadow-xl md:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-[#F2C567]/10 blur-3xl" />

        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F2C567]">
            LEARN · PRACTICE · BUILD · GROW
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#F5F7FB] md:text-5xl">
            Your learning journey, <span className="text-[#F2C567]">made clear</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#B6C2D4] md:text-base">
            Choose an idea. We’ll build the path from beginner to confident: learn through videos and slides, practise, prove understanding, and complete a real project.
          </p>

          {/* Prominent Plain-Language Search / Topic Input + Build CTA */}
          <form
            onSubmit={handleFormSubmit}
            className="mt-5 flex flex-col gap-2.5 rounded-2xl border border-[#F2C567]/45 bg-[#0B1220]/90 p-2 shadow-inner sm:flex-row sm:items-center"
          >
            <label className="flex min-w-0 flex-1 items-center gap-3 px-3 py-1">
              <Search className="size-5 shrink-0 text-[#B6C2D4]" />
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold text-[#B6C2D4]">
                  What do you want to learn?
                </span>
                <input
                  value={draft}
                  onChange={(event) => onDraft(event.target.value)}
                  placeholder="e.g. AWS Solutions Architect, Carpentry, Splunk, CompTIA Security+, ASE Brakes, Web Design..."
                  className="h-7 w-full bg-transparent text-sm font-medium text-[#F5F7FB] outline-none placeholder:text-[#6E7F96]"
                />
              </div>
            </label>
            <button
              type="submit"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F2C567] to-[#E5B14C] px-5 text-sm font-semibold text-[#1a1408] shadow-md transition hover:brightness-105"
            >
              Build my learning path <ArrowRight className="size-4" />
            </button>
          </form>

          {/* Search Autocomplete Hits */}
          {hits.length > 0 ? (
            <ul className="mt-1.5 max-h-56 overflow-auto rounded-2xl border border-[#2D3B50] bg-[#0B1220] py-1 shadow-xl">
              {hits.map((hit) => (
                <li key={`${hit.groupId}-${hit.track}-${hit.course}`}>
                  <button
                    type="button"
                    onClick={() => {
                      onDraft("");
                      onBuildPath(hit.course);
                    }}
                    className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-[#1B2739]"
                  >
                    <span>
                      <span className="font-semibold text-[#F5F7FB]">{hit.course}</span>
                      <span className="ml-2 text-xs text-[#A9B6C9]">
                        {hit.group} · {hit.track}
                      </span>
                    </span>
                    <span className="text-xs font-semibold text-[#F2C567]">
                      Build path →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {/* Subject Pills Row matching Screenshot 2 */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {JOURNEY_PATHS.map((item) => {
              const active = item.id === path.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectSubject(item)}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-xs font-semibold transition",
                    active
                      ? "border-[#F2C567] bg-[#F2C567]/15 text-[#F2C567] shadow-[0_0_12px_rgba(242,197,103,0.18)]"
                      : "border-[#2D3B50] bg-[#0B1220]/70 text-[#D8E1EE] hover:border-[#F2C567]/50",
                  )}
                >
                  {iconFor(item.id, true)}
                  {item.subject}
                </button>
              );
            })}
            <button
              type="button"
              onClick={onToggleCatalog}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-xs font-semibold transition",
                showCatalogDrawer
                  ? "border-[#F2C567] bg-[#F2C567] text-[#1a1408] shadow-[0_0_16px_rgba(242,197,103,0.3)]"
                  : "border-[#F2C567]/55 bg-[#141E2D] text-[#F5F7FB] hover:border-[#F2C567] hover:bg-[#1B2739]",
              )}
            >
              <Layers className={cn("size-3.5", showCatalogDrawer ? "text-[#1a1408]" : "text-[#F2C567]")} />
              <span>
                {showCatalogDrawer
                  ? "Hide courses & trades catalogue"
                  : "Browse 250+ courses & trades"}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold",
                  showCatalogDrawer
                    ? "bg-[#1a1408]/15 text-[#1a1408]"
                    : "bg-[#F2C567]/15 text-[#F2C567]",
                )}
              >
                {totalCatalogCourses}+
              </span>
            </button>
          </div>

          {/* Expandable 4-Level Hierarchical Course, Certification & Skilled Trades Card Showcase (Sections 1–20) */}
          {showCatalogDrawer ? (
            <div className="mt-5 space-y-5 rounded-3xl border border-[#2D3B50] bg-[#0B1220]/95 p-4 shadow-2xl md:p-6">
              {/* Top Header & Important Certification / Licensing Distinction Banner */}
              <div className="flex flex-col gap-3 border-b border-[#1E2B3E] pb-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#F2C567]/40 bg-[#F2C567]/15 px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#F2C567]">
                      Vibe / Noctis Catalogue · Sections 1–20
                    </span>
                    <span className="rounded-full border border-[#2D3B50] bg-[#141E2D] px-2.5 py-0.5 text-[11px] font-semibold text-[#D8E1EE]">
                      {COURSE_GROUPS.length} Professional Categories · {totalCatalogCourses} Courses & Skilled Trades
                    </span>
                  </div>
                  <h2 className="mt-2 font-display text-xl font-bold text-[#F5F7FB] md:text-2xl">
                    Professional Courses, Certifications & Skilled Trades Catalogue
                  </h2>
                  <p className="mt-1 text-xs text-[#A9B6C9]">
                    Organised into <strong className="text-[#F5F7FB]">Professional Categories</strong> → <strong className="text-[#F5F7FB]">Certification Providers or Skilled Trades</strong> → <strong className="text-[#F5F7FB]">Individual Course Cards</strong> → <strong className="text-[#F2C567]">Noctis Learning Journey & Practical Assessment</strong>.
                  </p>
                </div>

                {/* Live Filter Input across all courses & trades */}
                <label className="flex min-w-[260px] items-center gap-2.5 rounded-2xl border border-[#2D3B50] bg-[#141E2D] px-3.5 py-2 focus-within:border-[#F2C567]">
                  <Search className="size-4 shrink-0 text-[#F2C567]" />
                  <input
                    value={courseQuery}
                    onChange={(event) => setCourseQuery(event.target.value)}
                    placeholder="Filter cards (e.g. AWS, Splunk, Carpentry, Masonry, ASE, Welding, CompTIA)..."
                    className="h-6 w-full bg-transparent text-xs text-[#F5F7FB] outline-none placeholder:text-[#7E90A8]"
                  />
                  {courseQuery ? (
                    <button
                      type="button"
                      onClick={() => setCourseQuery("")}
                      className="text-[11px] font-semibold text-[#F2C567] hover:underline"
                    >
                      Clear
                    </button>
                  ) : null}
                </label>
              </div>

              {/* Important Distinction Callout */}
              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-xs leading-relaxed text-[#D8E1EE]">
                <strong className="text-[#F2C567]">Important Distinction — Training vs. Official Certification or Trade Licence: </strong>
                Vibe provides structured training, exam preparation, practical exercises, and Vibe completion certificates. An official industry certification (e.g., AWS, Microsoft, CompTIA, Cisco, ISC2, Splunk, PMI) or regulated trade/clinical licence (e.g., state electrical/plumbing/contractor licence, EPA Section 608, ASE experience qualification, AWS Certified Welder test, CDL, FAA Part 107, or state healthcare licence) must come from the relevant certification body, licensing authority, or approved assessment provider.
              </div>

              {/* Section 20: 4 Release Waves Filter Bar */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#A9B6C9]">
                    Step 1 · Filter by Release Wave or View All {COURSE_GROUPS.length} Categories
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => pickWave("all")}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                      waveFilter === "all"
                        ? "bg-[#F2C567] text-[#1a1408] shadow-sm"
                        : "border border-[#2D3B50] bg-[#141E2D] text-[#A9B6C9] hover:border-[#F2C567]/50 hover:text-[#F5F7FB]",
                    )}
                  >
                    All Release Waves ({COURSE_GROUPS.length} categories · {totalCatalogCourses} courses)
                  </button>
                  {RELEASE_WAVES.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => pickWave(w.id)}
                      className={cn(
                        "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                        waveFilter === w.id
                          ? "bg-[#F2C567] text-[#1a1408] shadow-sm"
                          : "border border-[#2D3B50] bg-[#141E2D] text-[#A9B6C9] hover:border-[#F2C567]/50 hover:text-[#F5F7FB]",
                      )}
                    >
                      {w.shortLabel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level 1: Categorized Professional Category Cards Grid */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#F2C567]">
                    Level 1 · Select a Professional Category ({visibleGroups.length} categories shown)
                  </p>
                  <span className="text-xs text-[#A9B6C9]">
                    Active category: <strong className="text-[#F5F7FB]">{group.name}</strong> ({getGroupCourseCount(group)} courses across {group.tracks.length} providers/trades)
                  </span>
                </div>

                <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {visibleGroups.map((item) => {
                    const active = item.id === group.id && !courseQuery.trim();
                    const count = getGroupCourseCount(item);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => pickGroup(item.id)}
                        className={cn(
                          "group flex flex-col justify-between rounded-2xl border p-3.5 text-left transition",
                          active
                            ? "border-[#F2C567] bg-gradient-to-br from-[#1B2739] to-[#191A16] shadow-[0_0_20px_rgba(242,197,103,0.15)]"
                            : "border-[#263449] bg-[#111A29] hover:border-[#F2C567]/50 hover:bg-[#152033]",
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#F2C567]">
                              {iconFor(item.id, true)}
                              {item.sectionTag}
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                active
                                  ? "bg-[#F2C567] text-[#1a1408]"
                                  : "border border-[#2D3B50] bg-[#0B1220] text-[#A9B6C9]",
                              )}
                            >
                              {count} courses
                            </span>
                          </div>
                          <h3 className="mt-2 text-sm font-bold text-[#F5F7FB] group-hover:text-[#F2C567]">
                            {item.name}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[#9FB0C7]">
                            {item.summary}
                          </p>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between border-t border-[#1F2C40] pt-2 text-[10px] text-[#8FA1B8]">
                          <span>{item.tracks.length} providers / trades</span>
                          <span className="font-semibold text-[#F2C567]">
                            {active ? "Selected ✓" : "View cards →"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Level 2: Certification Provider or Skilled Trade Filter Pills */}
              {!courseQuery.trim() ? (
                <div className="rounded-2xl border border-[#263449] bg-[#111A29] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#F2C567]">
                        Level 2 · Certification Providers & Skilled Trades in {group.name}
                      </p>
                      <p className="mt-0.5 text-xs text-[#9FB0C7]">
                        {group.credentialNote}
                      </p>
                    </div>
                    <span className="rounded-full border border-[#2D3B50] bg-[#0B1220] px-3 py-1 text-xs font-semibold text-[#D8E1EE]">
                      Showing {catalogCards.length} course cards
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => pickTrackFilter("all")}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition",
                        trackFilter === "all"
                          ? "border-[#F2C567] bg-[#F2C567] text-[#1a1408]"
                          : "border-[#2D3B50] bg-[#0B1220] text-[#D8E1EE] hover:border-[#F2C567]/50",
                      )}
                    >
                      All in {group.name} ({getGroupCourseCount(group)})
                    </button>
                    {group.tracks.map((tItem) => {
                      const active = trackFilter === tItem.name;
                      return (
                        <button
                          key={tItem.name}
                          type="button"
                          onClick={() => pickTrackFilter(tItem.name)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition",
                            active
                              ? "border-[#F2C567] bg-[#F2C567] text-[#1a1408]"
                              : "border-[#2D3B50] bg-[#0B1220] text-[#D8E1EE] hover:border-[#F2C567]/50",
                          )}
                        >
                          <Wrench className={cn("size-3", active ? "text-[#1a1408]" : "text-[#F2C567]")} />
                          <span>{tItem.name}</span>
                          <span
                            className={cn(
                              "rounded-full px-1.5 py-0.2 text-[10px]",
                              active ? "bg-[#1a1408]/15 text-[#1a1408]" : "bg-[#141E2D] text-[#9FB0C7]",
                            )}
                          >
                            {tItem.courses.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Level 3: Categorized Course, Certification & Skilled Trade Cards Grid */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#F2C567]">
                      Level 3 · Course, Certification & Skilled Trade Cards ({catalogCards.length})
                    </p>
                    <p className="mt-0.5 text-xs text-[#A9B6C9]">
                      {courseQuery.trim()
                        ? `Matching "${courseQuery}" across ${visibleGroups.length} categories`
                        : `${group.name} ${trackFilter === "all" ? "— All Providers & Trades" : `→ ${trackFilter}`}`}
                    </p>
                  </div>
                </div>

                {catalogCards.length === 0 ? (
                  <div className="mt-3 rounded-2xl border border-[#2D3B50] bg-[#111A29] p-6 text-center">
                    <p className="text-sm font-semibold text-[#F5F7FB]">
                      No catalogue cards matched “{courseQuery}”.
                    </p>
                    <p className="mt-1 text-xs text-[#A9B6C9]">
                      You can still build a custom Noctis Learning Journey for “{courseQuery}” directly!
                    </p>
                    <button
                      type="button"
                      onClick={() => onBuildPath(courseQuery.trim())}
                      className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl bg-[#F2C567] px-4 text-xs font-semibold text-[#1a1408]"
                    >
                      <Sparkles className="size-3.5" /> Build Custom Learning Journey for “{courseQuery.trim()}”
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                    {catalogCards.map((card) => {
                      const details = getCourseRecordDetails(
                        card.groupId,
                        card.trackName,
                        card.courseName,
                      );
                      const isInspected =
                        group.id === card.groupId &&
                        track.name === card.trackName &&
                        course === card.courseName;

                      const levelBadgeColor =
                        details.level === "Beginner"
                          ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-300"
                          : details.level === "Intermediate"
                            ? "border-sky-400/35 bg-sky-500/15 text-sky-300"
                            : details.level === "Advanced"
                              ? "border-amber-400/40 bg-amber-500/15 text-amber-300"
                              : "border-[#F2C567]/40 bg-[#F2C567]/12 text-[#F2C567]";

                      return (
                        <article
                          key={`${card.groupId}-${card.trackName}-${card.courseName}`}
                          className={cn(
                            "flex flex-col justify-between rounded-2xl border p-4 transition hover:-translate-y-0.5",
                            isInspected
                              ? "border-[#F2C567] bg-gradient-to-b from-[#172336] to-[#111A29] ring-1 ring-[#F2C567]/50"
                              : "border-[#263449] bg-[#111A29] hover:border-[#F2C567]/50",
                          )}
                        >
                          <div>
                            {/* Top Row: Provider / Trade Badge + Level Pill */}
                            <div className="flex items-start justify-between gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#2D3B50] bg-[#0B1220] px-2.5 py-1 text-[10px] font-semibold text-[#D8E1EE]">
                                {iconFor(card.groupId, true)}
                                <span className="truncate">{card.trackName}</span>
                              </span>
                              <span
                                className={cn(
                                  "shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold",
                                  levelBadgeColor,
                                )}
                              >
                                {details.level}
                              </span>
                            </div>

                            {/* Category breadcrumb */}
                            <p className="mt-2.5 text-[10px] font-bold uppercase tracking-wider text-[#F2C567]">
                              {card.sectionTag} · {card.groupName}
                            </p>

                            {/* Course / Certification Title */}
                            <h4 className="mt-0.5 text-base font-bold leading-snug text-[#F5F7FB]">
                              {card.courseName}
                            </h4>

                            {/* Study Hours & Formats */}
                            <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px]">
                              <span className="rounded-lg border border-[#263449] bg-[#0B1220] px-2 py-0.5 text-[#B6C2D4]">
                                ⏱ {details.estimatedHours}
                              </span>
                              <span className="rounded-lg border border-[#263449] bg-[#0B1220] px-2 py-0.5 text-[#B6C2D4]">
                                Video · Slides · Lab · 80% Check
                              </span>
                            </div>

                            {/* Issuing Authority & Official Distinction */}
                            <div className="mt-3 rounded-xl border border-[#223044] bg-[#0B1220]/90 p-2.5 text-[11px]">
                              <p className="font-semibold text-[#F2C567]">
                                {details.certificationProvider}
                              </p>
                              <p className="mt-1 line-clamp-2 leading-relaxed text-[#9FB0C7]">
                                {details.officialExamOrLicensingRequirements}
                              </p>
                            </div>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-[#1E2B3E] pt-3">
                            <button
                              type="button"
                              onClick={() => {
                                setGroupId(card.groupId);
                                setTrackName(card.trackName);
                                setCourse(card.courseName);
                              }}
                              className={cn(
                                "inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition",
                                isInspected
                                  ? "border-[#F2C567] bg-[#F2C567]/15 text-[#F2C567]"
                                  : "border-[#2D3B50] bg-[#0B1220] text-[#B6C2D4] hover:border-[#F2C567]/50 hover:text-[#F5F7FB]",
                              )}
                            >
                              <FileText className="size-3.5 text-[#F2C567]" />
                              {isInspected ? "Spec Open ↓" : "13-Field Spec"}
                            </button>

                            <button
                              type="button"
                              onClick={() => onBuildPath(card.courseName)}
                              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#F2C567] to-[#E5B14C] px-3.5 text-xs font-semibold text-[#1a1408] shadow-sm transition hover:brightness-105"
                            >
                              Start Journey <ArrowRight className="size-3.5" />
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 19: Complete 13-Field Course Record Details Inspector */}
              <div className="rounded-2xl border border-[#F2C567]/40 bg-[#141E2D] p-4 shadow-lg md:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F2C567]">
                      Section 19 · 13-Field Course Record Inspector · {courseRecord.waveLabel}
                    </span>
                    <h4 className="mt-0.5 text-lg font-bold text-[#F5F7FB]">
                      {courseRecord.title}{" "}
                      <span className="text-sm font-normal text-[#A9B6C9]">
                        ({courseRecord.category} → {courseRecord.providerOrOccupation})
                      </span>
                    </h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="rounded-full border border-[#F2C567]/40 bg-[#F2C567]/10 px-2.5 py-0.5 font-semibold text-[#F2C567]">
                      {courseRecord.level}
                    </span>
                    <span className="rounded-full border border-[#2D3B50] bg-[#0B1220] px-2.5 py-0.5 text-[#A9B6C9]">
                      {courseRecord.estimatedHours}
                    </span>
                    <span className="rounded-full border border-[#2D3B50] bg-[#0B1220] px-2.5 py-0.5 text-[#A9B6C9]">
                      Verified: {courseRecord.lastVerifiedDate}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid gap-2.5 text-xs sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl border border-[#2D3B50] bg-[#0B1220] p-3">
                    <span className="font-semibold text-[#F2C567]">1. Certification / Licensing Authority:</span>
                    <p className="mt-1 text-[#D8E1EE]">{courseRecord.certificationProvider}</p>
                  </div>
                  <div className="rounded-xl border border-[#2D3B50] bg-[#0B1220] p-3">
                    <span className="font-semibold text-[#F2C567]">2. Prerequisites & Safety Rules:</span>
                    <p className="mt-1 text-[#D8E1EE]">{courseRecord.prerequisites}</p>
                  </div>
                  <div className="rounded-xl border border-[#2D3B50] bg-[#0B1220] p-3">
                    <span className="font-semibold text-[#F2C567]">3. Formats & Assessment Method:</span>
                    <p className="mt-1 text-[#D8E1EE]">
                      {courseRecord.formatsIncluded} · {courseRecord.assessmentMethod}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#2D3B50] bg-[#0B1220] p-3">
                    <span className="font-semibold text-[#F2C567]">4. Final Demonstration & Portfolio Artifact:</span>
                    <p className="mt-1 text-[#D8E1EE]">{courseRecord.finalDemonstration}</p>
                  </div>
                  <div className="rounded-xl border border-[#2D3B50] bg-[#0B1220] p-3">
                    <span className="font-semibold text-[#F2C567]">5. Validity & Renewal Policy:</span>
                    <p className="mt-1 text-[#D8E1EE]">{courseRecord.validityAndRenewal}</p>
                  </div>
                  <div className="rounded-xl border border-[#2D3B50] bg-[#0B1220] p-3">
                    <span className="font-semibold text-[#F2C567]">6. Course & Official Exam Pricing:</span>
                    <p className="mt-1 text-[#D8E1EE]">{courseRecord.coursePrice}</p>
                  </div>
                </div>

                <p className="mt-2.5 rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-xs text-[#D8E1EE]">
                  <strong className="text-[#F2C567]">Official Exam & Licensing Distinction: </strong>
                  {courseRecord.officialExamOrLicensingRequirements}
                </p>

                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2">
                  {courseRecord.officialRegistrationUrl ? (
                    <a
                      href={courseRecord.officialRegistrationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-[#F2C567] hover:underline"
                    >
                      Official Provider / Licensing Page ({courseRecord.providerOrOccupation}) ↗
                    </a>
                  ) : (
                    <span className="text-xs text-[#8FA1B8]">
                      Self-directed practical skill pathway on Vibe / Noctis
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onBuildPath(course)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#F2C567] px-4 text-xs font-semibold text-[#1a1408] shadow-md hover:brightness-105"
                  >
                    <Sparkles className="size-3.5" /> Level 4: Build Noctis Learning Journey for “{course}”
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* 2. EXAMPLE / ACTIVE JOURNEY CARD (Matches Screenshot 2 + Section 4 Interactive Roadmap) */}
      <section className="rounded-[1.6rem] border border-[#2D3B50] bg-[#111A29] p-5 shadow-xl md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <span className="grid size-13 shrink-0 place-items-center rounded-2xl border border-indigo-400/30 bg-indigo-500/20 text-indigo-300">
              {iconFor(path.id, true)}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#F2C567]">
                  {store.seen ? "ACTIVE LEARNING JOURNEY" : "EXAMPLE JOURNEY"}
                </p>
                <span className="text-xs text-[#8FA1B8]">
                  · {path.tagline ?? `${store.level} level · ${path.modules.length} modules · Final project`}
                </span>
              </div>
              <h2 className="mt-0.5 font-display text-2xl font-bold text-[#F5F7FB]">
                {path.id === "web" ? "Learn Web Design" : path.title}
              </h2>
              <p className="mt-0.5 text-sm text-[#B6C2D4]">{path.blurb}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onStartDirectly(path)}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#F2C567]/60 bg-[#1B2333] px-5 text-xs font-semibold text-[#F2C567] transition hover:bg-[#F2C567] hover:text-[#1a1408]"
            >
              {passed.size > 0 ? "Continue this journey" : "Start this journey"}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>

        {/* 4-Step Horizontal Stage Cards with Arrows (Matches Screenshot 2) */}
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {stageCards.map((card, idx) => {
            const targetMod = path.modules[Math.min(idx, path.modules.length - 1)]!;
            const modDone = passed.has(targetMod.id);
            const completedInStage = modDone
              ? card.totalLessons
              : idx === 0 && passed.size === 0
                ? Math.min(3, card.totalLessons)
                : idx === 1 && passed.size === 0
                  ? Math.min(1, card.totalLessons)
                  : 0;
            const barPct = Math.round((completedInStage / Math.max(1, card.totalLessons)) * 100);
            const StageIcon =
              card.icon === "code"
                ? Code2
                : card.icon === "file"
                  ? FileText
                  : card.icon === "devices"
                    ? Monitor
                    : CloudUpload;

            return (
              <div key={card.step} className="relative flex items-stretch">
                <button
                  type="button"
                  onClick={() => onOpenModule(targetMod)}
                  className="flex w-full flex-col justify-between rounded-2xl border border-[#263449] bg-[#0B1220] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#F2C567]/60"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full border border-[#F2C567]/60 bg-[#F2C567]/10 text-xs font-bold text-[#F2C567]">
                        {card.step}
                      </span>
                      <h3 className="text-sm font-semibold text-[#F5F7FB]">{card.title}</h3>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-[#9FB0C7]">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1C283B]">
                      <span
                        className="block h-full rounded-full bg-[#F2C567]"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                    <p className="mt-2 text-center text-[11px] font-semibold text-[#9FB0C7]">
                      {completedInStage} / {card.totalLessons} lessons
                    </p>
                    <div className="mt-2 flex justify-center text-[#8FA1B8]">
                      <StageIcon className="size-4" />
                    </div>
                  </div>
                </button>
                {idx < stageCards.length - 1 ? (
                  <span className="pointer-events-none absolute -right-2.5 top-1/2 z-10 hidden -translate-y-1/2 text-[#F2C567] md:block">
                    <ArrowRight className="size-4" />
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Interactive 6-Module Curriculum Roadmap (Section 4 of Spec) */}
        <div className="mt-5 rounded-2xl border border-[#263449] bg-[#0B1220] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">
                Your Learning Roadmap · {passed.size} of {path.modules.length} modules completed
              </p>
              <p className="mt-0.5 text-xs text-[#9FB0C7]">
                Select any module below to inspect its lessons, study through video & slides, or take its mastery check.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <label className="flex items-center gap-1.5 text-[#9FB0C7]">
                Level:
                <select
                  value={store.level}
                  onChange={(e) =>
                    onUpdateCalibration({ level: e.target.value as JourneyLevel })
                  }
                  className="rounded-lg border border-[#263449] bg-[#141E2D] px-2 py-1 text-xs font-semibold text-[#F5F7FB]"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {path.modules.map((modItem, index) => {
              const isDone = passed.has(modItem.id);
              const isSelected = expandedModuleId === modItem.id;
              return (
                <div
                  key={modItem.id}
                  className={cn(
                    "flex flex-col justify-between rounded-xl border p-3 transition",
                    isDone
                      ? "border-emerald-500/40 bg-emerald-950/15"
                      : isSelected
                        ? "border-[#F2C567] bg-[#141E2D]"
                        : "border-[#263449] bg-[#111A29]/80 hover:border-[#F2C567]/40",
                  )}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpandedModuleId(modItem.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setExpandedModuleId(modItem.id);
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#F2C567]">
                        {index + 1}. {modItem.title}
                      </span>
                      <span className="rounded-full bg-[#0B1220] px-2 py-0.5 text-[10px] font-semibold text-[#9FB0C7]">
                        {modItem.lessonCountLabel ?? `${modItem.lessons.length} lessons`}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#B6C2D4]">{modItem.summary}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
                    <span className="text-[11px] font-semibold text-[#8FA1B8]">
                      {isDone ? "Verified ✓" : modItem.stage ?? "Module"}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenModule(modItem)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#F2C567] hover:underline"
                    >
                      Open lesson <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. POPULAR LEARNING PATHS GRID (Matches Screenshot 2) */}
      <section>
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display text-xl font-bold text-[#F5F7FB]">
            Popular learning paths
          </h2>
          <button
            type="button"
            onClick={onToggleCatalog}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#F2C567] hover:underline"
          >
            See all <ArrowRight className="size-3.5" />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {POPULAR_PATHS.map((card) => {
            const target = JOURNEY_PATHS.find((p) => p.id === card.id) ?? JOURNEY_PATHS[0]!;
            const active = path.id === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onSelectSubject(target)}
                className={cn(
                  "group overflow-hidden rounded-2xl border bg-[#111A29] text-left transition hover:-translate-y-0.5",
                  active
                    ? "border-[#F2C567] ring-1 ring-[#F2C567]"
                    : "border-[#263449] hover:border-[#F2C567]/60",
                )}
              >
                <div className="aspect-[16/10] w-full overflow-hidden bg-[#0B1220]">
                  <img
                    src={card.cover}
                    alt={card.subject}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-[#F5F7FB]">{card.subject}</p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-[#9FB0C7]">
                    {card.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function iconFor(id: string, gold = true) {
  const Icon = ICONS[id as keyof typeof ICONS] ?? BookOpen;
  return (
    <Icon className={cn("size-4 shrink-0", gold ? "text-[#F2C567]" : "text-current")} />
  );
}

function Shell({
  stepBadge,
  title,
  onBack,
  children,
}: {
  stepBadge?: string;
  title: string;
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.6rem] border border-[#2D3B50] bg-[#111A29] p-5 text-[#F5F7FB] shadow-xl md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#F2C567] hover:underline"
        >
          <ChevronLeft className="size-4" /> Back
        </button>
        {stepBadge ? (
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F2C567]">
            {stepBadge}
          </span>
        ) : null}
      </div>
      <h2 className="mt-2 font-display text-2xl font-bold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Row({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-[#2D3B50] bg-[#0B1220] p-3.5">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#F2C567]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#F5F7FB]">{value}</p>
      <p className="mt-1 text-xs text-[#A9B6C9]">{note}</p>
    </div>
  );
}
