import {
  computeJourneyIndicators,
  depthLine,
  EMPTY_JOURNEY,
  evaluateProjectSubmission,
  generateNoctisTutorResponse,
  getJourneyLifecycleState,
  getLessonStatusState,
  getModuleStatusState,
  JOURNEY_PATHS,
  orchestratorBrief,
  pathForNamedCourse,
  readJourney,
  writeJourney,
  type JourneyIndicators,
  type JourneyLesson,
  type JourneyModule,
  type JourneyPath,
  type JourneySourceRef,
  type JourneyStore,
  type LessonStatusState,
  type ModuleStatusState,
  type NoctisGuideActionId,
} from "./journey-paths.ts";
import { readDiscoverJourneyState } from "./discover-journey-bridge.ts";

export type LearnFormatId =
  | "video"
  | "slides"
  | "practice"
  | "notes"
  | "labs"
  | "noctis";

export type LearnActivityType =
  | "lesson"
  | "module-list"
  | "practice"
  | "project"
  | "progress"
  | "noctis"
  | "certificate";

export type JourneyToLearnActionId =
  | "start-journey"
  | "select-module"
  | "select-lesson"
  | "continue-learning"
  | "practice-quiz"
  | "projects"
  | "my-progress"
  | "ask-noctis"
  | "certificate";

export const LEARN_FORMAT_CARDS: {
  id: LearnFormatId;
  label: string;
  description: string;
  badge: string;
}[] = [
  {
    id: "video",
    label: "Video lessons",
    description: "Narrated video script, visual cues, and synchronized transcript.",
    badge: "Video + Transcript",
  },
  {
    id: "slides",
    label: "Slide lessons",
    description: "Structured slide decks, key bullet points, and slide takeaways.",
    badge: "Slides + Notes",
  },
  {
    id: "practice",
    label: "Practice & quizzes",
    description: "Hands-on practice tasks, formal mastery checks, and answer rationales.",
    badge: "Verify Mastery",
  },
  {
    id: "notes",
    label: "Reading & notes",
    description: "Plain-language explanations, worked examples, diagrams, and vocabulary.",
    badge: "Study Guide",
  },
  {
    id: "labs",
    label: "Practical labs",
    description: "Applied lab exercises, simulations, and final project deliverables.",
    badge: "Hands-on Lab",
  },
  {
    id: "noctis",
    label: "Ask Noctis",
    description: "Lesson-aware AI tutor for simpler explanations, examples, and gap revision.",
    badge: "Context-Aware AI",
  },
];

export const JOURNEY_TO_LEARN_CONNECTIONS: {
  actionId: JourneyToLearnActionId;
  journeyAction: string;
  learnDestination: string;
}[] = [
  {
    actionId: "start-journey",
    journeyAction: "Start this journey",
    learnDestination: "Open the first available lesson",
  },
  {
    actionId: "select-module",
    journeyAction: "Select a roadmap module",
    learnDestination: "Open the module's lesson list",
  },
  {
    actionId: "select-lesson",
    journeyAction: "Select a lesson",
    learnDestination: "Open that lesson in the player",
  },
  {
    actionId: "continue-learning",
    journeyAction: "Continue learning",
    learnDestination: "Resume the last incomplete activity",
  },
  {
    actionId: "practice-quiz",
    journeyAction: "Practice & Quiz",
    learnDestination: "Open the lesson's assessment",
  },
  {
    actionId: "projects",
    journeyAction: "Projects",
    learnDestination: "Open the relevant project instructions",
  },
  {
    actionId: "my-progress",
    journeyAction: "My Progress",
    learnDestination: "Display the learner's progress and competency evidence",
  },
  {
    actionId: "ask-noctis",
    journeyAction: "Ask Noctis",
    learnDestination: "Open the assistant with the current lesson's context",
  },
  {
    actionId: "certificate",
    journeyAction: "Certificate",
    learnDestination: "Show completion requirements and eligible achievements",
  },
];

/**
 * C. Shared curriculum record
 * Journey and Learn must use the exact same Course ID, Journey ID, Module ID, Lesson ID,
 * Curriculum version, Assessment ID, and Learner progress record.
 */
export type SharedCurriculumRecord = {
  courseId: string;
  journeyId: string;
  moduleId: string;
  lessonId: string;
  curriculumVersion: string;
  assessmentId: string;
  projectId: string;
  journey: JourneyPath;
  module: JourneyModule;
  moduleIndex: number;
  lesson: JourneyLesson;
  lessonIndex: number;
};

export type LearnPositionState = {
  journeyId: string;
  moduleId: string;
  lessonId: string;
  activity: LearnActivityType;
  formatTab: LearnFormatId;
  updatedAt: string;
};

const POSITION_STORAGE_KEY = "noctis-learn-position-v1";

/**
 * Returns all available journeys without duplicating any course:
 * - Built-in curated journeys (JOURNEY_PATHS)
 * - Active custom journey in JourneyStore (if not already in JOURNEY_PATHS)
 * - Any custom journeys built from Discover
 */
export function listAllSharedJourneys(store: JourneyStore = readJourney()): JourneyPath[] {
  const map = new Map<string, JourneyPath>();
  for (const p of JOURNEY_PATHS) {
    map.set(p.id, p);
  }
  if (store.custom && store.custom.id && !map.has(store.custom.id)) {
    map.set(store.custom.id, store.custom);
  }
  return Array.from(map.values());
}

/**
 * Resolves a single JourneyPath by ID using the shared curriculum pool.
 * Never creates a duplicate copy of an existing journey.
 */
export function resolveJourneyById(
  journeyId: string,
  store: JourneyStore = readJourney(),
): JourneyPath | null {
  const cleanId = (journeyId || "").trim();
  if (!cleanId) return null;
  const all = listAllSharedJourneys(store);
  const direct = all.find((j) => j.id === cleanId);
  if (direct) return direct;
  if (store.activeId === cleanId && store.topic.trim()) {
    return pathForNamedCourse(store.topic);
  }
  return null;
}

/**
 * Resolves the active JourneyPath for the current user store.
 */
export function resolveActiveJourney(store: JourneyStore = readJourney()): JourneyPath {
  const byActive = resolveJourneyById(store.activeId, store);
  if (byActive) return byActive;
  if (store.topic.trim()) {
    return pathForNamedCourse(store.topic);
  }
  return JOURNEY_PATHS[0]!;
}

/**
 * Builds a SharedCurriculumRecord from a resolved journey, module, and lesson.
 */
export function buildSharedCurriculumRecord(
  journey: JourneyPath,
  modItem: JourneyModule,
  lesson: JourneyLesson,
): SharedCurriculumRecord {
  const moduleIndex = Math.max(
    0,
    journey.modules.findIndex((m) => m.id === modItem.id),
  );
  const lessonIndex = Math.max(
    0,
    modItem.lessons.findIndex((l) => l.id === lesson.id),
  );
  return {
    courseId: journey.id,
    journeyId: journey.id,
    moduleId: modItem.id,
    lessonId: lesson.id,
    curriculumVersion: lesson.version ?? "1.0.0",
    assessmentId: `assess-${journey.id}-${modItem.id}`,
    projectId: `project-${journey.id}`,
    journey,
    module: modItem,
    moduleIndex,
    lesson,
    lessonIndex,
  };
}

/**
 * Finds a lesson across all shared journeys and returns its canonical SharedCurriculumRecord.
 */
export function resolveLessonAcrossJourneys(
  lessonId: string,
  preferredJourneyId?: string,
  store: JourneyStore = readJourney(),
): SharedCurriculumRecord | null {
  const cleanLessonId = (lessonId || "").trim();
  if (!cleanLessonId) return null;

  const all = listAllSharedJourneys(store);
  const ordered = preferredJourneyId
    ? [
        ...all.filter((j) => j.id === preferredJourneyId),
        ...all.filter((j) => j.id !== preferredJourneyId),
      ]
    : [
        resolveActiveJourney(store),
        ...all.filter((j) => j.id !== store.activeId),
      ];

  for (const journey of ordered) {
    for (const modItem of journey.modules) {
      const lesson = modItem.lessons.find((l) => l.id === cleanLessonId);
      if (lesson) {
        return buildSharedCurriculumRecord(journey, modItem, lesson);
      }
    }
  }
  return null;
}

/**
 * G. Route & Server Access Validation
 * Verifies that the requested journey, module, and lesson exist and that
 * the selected lesson belongs to the requested course/journey and module.
 */
export function validateLearnRouteAccess(params: {
  journeyId?: string;
  moduleId?: string;
  lessonId?: string;
  store?: JourneyStore;
}): {
  valid: boolean;
  error?: string;
  record?: SharedCurriculumRecord;
} {
  const store = params.store ?? readJourney();

  if (params.lessonId) {
    const record = resolveLessonAcrossJourneys(
      params.lessonId,
      params.journeyId,
      store,
    );
    if (!record) {
      return {
        valid: false,
        error: `Lesson "${params.lessonId}" was not found in the shared curriculum.`,
      };
    }
    if (params.journeyId && record.journeyId !== params.journeyId) {
      return {
        valid: false,
        error: `Lesson "${params.lessonId}" does not belong to journey "${params.journeyId}".`,
      };
    }
    if (params.moduleId && record.moduleId !== params.moduleId) {
      return {
        valid: false,
        error: `Lesson "${params.lessonId}" does not belong to module "${params.moduleId}".`,
      };
    }
    return { valid: true, record };
  }

  if (params.journeyId) {
    const journey = resolveJourneyById(params.journeyId, store);
    if (!journey) {
      return {
        valid: false,
        error: `Journey "${params.journeyId}" was not found.`,
      };
    }
    if (params.moduleId) {
      const modItem = journey.modules.find((m) => m.id === params.moduleId);
      if (!modItem) {
        return {
          valid: false,
          error: `Module "${params.moduleId}" does not belong to journey "${params.journeyId}".`,
        };
      }
      const firstLesson = modItem.lessons[0] ?? journey.modules[0]!.lessons[0]!;
      return {
        valid: true,
        record: buildSharedCurriculumRecord(journey, modItem, firstLesson),
      };
    }
    const firstMod = journey.modules[0]!;
    const firstLesson = firstMod.lessons[0]!;
    return {
      valid: true,
      record: buildSharedCurriculumRecord(journey, firstMod, firstLesson),
    };
  }

  const activeJourney = resolveActiveJourney(store);
  const firstMod = activeJourney.modules[0]!;
  const firstLesson = firstMod.lessons[0]!;
  return {
    valid: true,
    record: buildSharedCurriculumRecord(activeJourney, firstMod, firstLesson),
  };
}

/**
 * Reads and writes the user's current position across Journey and Learn tabs.
 */
export function readLearnPosition(store: JourneyStore = readJourney()): LearnPositionState {
  const activeJourney = resolveActiveJourney(store);
  const passedSet = new Set(store.checks[activeJourney.id] ?? []);
  const viewedSet = new Set(store.lessonsViewed?.[activeJourney.id] ?? []);
  const practiceSet = new Set(store.practicesDone?.[activeJourney.id] ?? []);
  const revisionList = store.revisionQueue?.[activeJourney.id] ?? [];

  // Default intelligent next position in the active journey
  const revisionMod = activeJourney.modules.find((m) => revisionList.includes(m.id));
  const nextIncompleteMod =
    revisionMod ??
    activeJourney.modules.find((m) => !passedSet.has(m.id)) ??
    activeJourney.modules[0]!;
  const nextIncompleteLesson =
    nextIncompleteMod.lessons.find((l) => !practiceSet.has(l.id)) ??
    nextIncompleteMod.lessons.find((l) => !viewedSet.has(l.id)) ??
    nextIncompleteMod.lessons[0]!;

  const fallback: LearnPositionState = {
    journeyId: activeJourney.id,
    moduleId: nextIncompleteMod.id,
    lessonId: nextIncompleteLesson.id,
    activity: "lesson",
    formatTab: "video",
    updatedAt: "2026-10-22T00:00:00.000Z",
  };

  if (typeof window === "undefined") return fallback;
  try {
    const raw = JSON.parse(
      window.localStorage.getItem(POSITION_STORAGE_KEY) || "null",
    ) as Partial<LearnPositionState> | null;
    if (!raw || typeof raw !== "object") return fallback;

    // Validate that the stored position belongs to a valid journey/module/lesson
    const check = validateLearnRouteAccess({
      journeyId: raw.journeyId,
      moduleId: raw.moduleId,
      lessonId: raw.lessonId,
      store,
    });
    if (!check.valid || !check.record) return fallback;

    return {
      journeyId: check.record.journeyId,
      moduleId: check.record.moduleId,
      lessonId: check.record.lessonId,
      activity:
        raw.activity === "module-list" ||
        raw.activity === "practice" ||
        raw.activity === "project" ||
        raw.activity === "progress" ||
        raw.activity === "noctis" ||
        raw.activity === "certificate"
          ? raw.activity
          : "lesson",
      formatTab:
        raw.formatTab === "slides" ||
        raw.formatTab === "practice" ||
        raw.formatTab === "notes" ||
        raw.formatTab === "labs" ||
        raw.formatTab === "noctis"
          ? raw.formatTab
          : "video",
      updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : fallback.updatedAt,
    };
  } catch {
    return fallback;
  }
}

export function writeLearnPosition(
  patch: Partial<LearnPositionState>,
  store: JourneyStore = readJourney(),
): LearnPositionState {
  const current = readLearnPosition(store);
  const next: LearnPositionState = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
  }
  return next;
}

/**
 * Resolves the "Continue Learning" card state for the Learn homepage & Journey banner.
 */
export function resolveContinueLearningTarget(store: JourneyStore = readJourney()): {
  record: SharedCurriculumRecord;
  activity: LearnActivityType;
  formatTab: LearnFormatId;
  progressPct: number;
  masteryPct: number;
  lessonStatus: LessonStatusState;
  moduleStatus: ModuleStatusState;
  subtitle: string;
  buttonLabel: string;
  routeHref: string;
} {
  const activeJourney = resolveActiveJourney(store);
  const indicators = computeJourneyIndicators(activeJourney, store);
  const savedPos = readLearnPosition(store);

  // If savedPos is for the activeJourney and its module isn't completed yet, resume it;
  // otherwise find the first incomplete module/lesson in activeJourney.
  const passedSet = new Set(store.checks[activeJourney.id] ?? []);
  const practiceSet = new Set(store.practicesDone?.[activeJourney.id] ?? []);
  const revisionList = store.revisionQueue?.[activeJourney.id] ?? [];

  let targetMod: JourneyModule | undefined;
  let targetLesson: JourneyLesson | undefined;
  let activity: LearnActivityType = "lesson";
  let formatTab: LearnFormatId = "video";

  if (savedPos.journeyId === activeJourney.id) {
    const m = activeJourney.modules.find((mod) => mod.id === savedPos.moduleId);
    const l = m?.lessons.find((les) => les.id === savedPos.lessonId);
    if (m && l && !passedSet.has(m.id)) {
      targetMod = m;
      targetLesson = l;
      activity = savedPos.activity;
      formatTab = savedPos.formatTab;
    }
  }

  if (!targetMod || !targetLesson) {
    const revMod = activeJourney.modules.find((m) => revisionList.includes(m.id));
    targetMod =
      revMod ??
      activeJourney.modules.find((m) => !passedSet.has(m.id)) ??
      activeJourney.modules[activeJourney.modules.length - 1]!;
    targetLesson =
      targetMod.lessons.find((l) => !practiceSet.has(l.id)) ??
      targetMod.lessons[0]!;
    if (practiceSet.has(targetLesson.id) && !passedSet.has(targetMod.id)) {
      activity = "practice";
      formatTab = "practice";
    }
  }

  const record = buildSharedCurriculumRecord(activeJourney, targetMod, targetLesson);
  const lessonStatus = getLessonStatusState(activeJourney, targetMod, targetLesson, store);
  const moduleStatus = getModuleStatusState(activeJourney, record.moduleIndex, store);

  // Illustrative/actual progress percentage (shows at least 35% when active/in-progress so the progress bar is visible and informative)
  const rawProgress = indicators.learningProgressPct;
  const progressPct =
    rawProgress > 0
      ? rawProgress
      : (store.lessonsViewed?.[activeJourney.id]?.length ?? 0) > 0
        ? 35
        : store.seen
          ? 15
          : 0;

  const subtitle = `Your active Journey · ${activeJourney.subject} · Module ${record.moduleIndex + 1}, Lesson ${record.lessonIndex + 1}`;
  const buttonLabel =
    activity === "practice" || lessonStatus === "Awaiting Assessment"
      ? "Continue to practice & quiz →"
      : activity === "project"
        ? "Continue final project →"
        : "Continue lesson →";

  const routeHref =
    activity === "practice"
      ? `/learn/lessons/${record.lessonId}/practice`
      : activity === "project"
        ? `/learn/lessons/${record.lessonId}/project`
        : `/learn/lessons/${record.lessonId}`;

  return {
    record,
    activity,
    formatTab,
    progressPct,
    masteryPct: indicators.knowledgeMasteryPct,
    lessonStatus,
    moduleStatus,
    subtitle,
    buttonLabel,
    routeHref,
  };
}

/**
 * 3. Connect each action in Journey to Learn
 * Maps any of the 9 Journey actions to its exact Learn destination, updates LearnPositionState,
 * and returns the destination route + resolved curriculum record.
 */
export function resolveJourneyActionToLearn(
  actionId: JourneyToLearnActionId,
  options: {
    journey?: JourneyPath;
    moduleId?: string;
    lessonId?: string;
    store?: JourneyStore;
  } = {},
): {
  actionId: JourneyToLearnActionId;
  record: SharedCurriculumRecord;
  activity: LearnActivityType;
  formatTab: LearnFormatId;
  routePath: string;
  position: LearnPositionState;
  store: JourneyStore;
} {
  let currentStore = options.store ?? readJourney();
  const journey = options.journey ?? resolveActiveJourney(currentStore);

  // Ensure activeId and activeJourneys include this journey when starting or selecting
  const activeJourneys = Array.from(
    new Set([...(currentStore.activeJourneys ?? [currentStore.activeId]), journey.id]),
  );

  const passedSet = new Set(currentStore.checks[journey.id] ?? []);
  const firstAvailableMod =
    journey.modules.find((m) => !passedSet.has(m.id)) ?? journey.modules[0]!;

  const selectedMod =
    (options.moduleId
      ? journey.modules.find((m) => m.id === options.moduleId)
      : undefined) ?? firstAvailableMod;

  const selectedLesson =
    (options.lessonId
      ? selectedMod.lessons.find((l) => l.id === options.lessonId) ??
        journey.modules.flatMap((m) => m.lessons).find((l) => l.id === options.lessonId)
      : undefined) ?? selectedMod.lessons[0]!;

  const owningMod =
    journey.modules.find((m) => m.lessons.some((l) => l.id === selectedLesson.id)) ??
    selectedMod;

  let record = buildSharedCurriculumRecord(journey, owningMod, selectedLesson);
  let activity: LearnActivityType = "lesson";
  let formatTab: LearnFormatId = "video";
  let routePath = `/learn/lessons/${record.lessonId}`;

  switch (actionId) {
    case "start-journey": {
      const firstMod = journey.modules[0]!;
      const firstLesson = firstMod.lessons[0]!;
      record = buildSharedCurriculumRecord(journey, firstMod, firstLesson);
      activity = "lesson";
      formatTab = "video";
      routePath = `/learn/lessons/${firstLesson.id}`;
      const viewedForJourney = currentStore.lessonsViewed?.[journey.id] ?? [];
      currentStore = {
        ...currentStore,
        activeId: journey.id,
        subjectId: journey.id,
        topic: journey.subject,
        activeJourneys,
        seen: true,
        lessonsViewed: {
          ...(currentStore.lessonsViewed ?? {}),
          [journey.id]: viewedForJourney.includes(firstLesson.id)
            ? viewedForJourney
            : [...viewedForJourney, firstLesson.id],
        },
      };
      writeJourney(currentStore);
      break;
    }
    case "select-module": {
      activity = "module-list";
      formatTab = "video";
      routePath = `/learn/journeys/${journey.id}/modules/${owningMod.id}`;
      break;
    }
    case "select-lesson": {
      activity = "lesson";
      formatTab =
        selectedLesson.kind === "Slides"
          ? "slides"
          : selectedLesson.kind === "Notes"
            ? "notes"
            : selectedLesson.kind === "Practice"
              ? "practice"
              : "video";
      routePath = `/learn/lessons/${selectedLesson.id}`;
      const viewedForJourney = currentStore.lessonsViewed?.[journey.id] ?? [];
      if (!viewedForJourney.includes(selectedLesson.id)) {
        currentStore = {
          ...currentStore,
          activeId: journey.id,
          activeJourneys,
          seen: true,
          lessonsViewed: {
            ...(currentStore.lessonsViewed ?? {}),
            [journey.id]: [...viewedForJourney, selectedLesson.id],
          },
        };
        writeJourney(currentStore);
      }
      break;
    }
    case "continue-learning": {
      const target = resolveContinueLearningTarget(currentStore);
      record = target.record;
      activity = target.activity;
      formatTab = target.formatTab;
      routePath = target.routeHref;
      break;
    }
    case "practice-quiz": {
      activity = "practice";
      formatTab = "practice";
      routePath = `/learn/lessons/${record.lessonId}/practice`;
      break;
    }
    case "projects": {
      activity = "project";
      formatTab = "labs";
      routePath = `/learn/lessons/${record.lessonId}/project`;
      break;
    }
    case "my-progress": {
      activity = "progress";
      formatTab = "practice";
      routePath = `/learn/journeys/${journey.id}`;
      break;
    }
    case "ask-noctis": {
      activity = "noctis";
      formatTab = "noctis";
      routePath = `/learn/lessons/${record.lessonId}`;
      break;
    }
    case "certificate": {
      activity = "certificate";
      formatTab = "labs";
      routePath = `/learn/journeys/${journey.id}`;
      break;
    }
  }

  const position = writeLearnPosition(
    {
      journeyId: record.journeyId,
      moduleId: record.moduleId,
      lessonId: record.lessonId,
      activity,
      formatTab,
    },
    currentStore,
  );

  return {
    actionId,
    record,
    activity,
    formatTab,
    routePath,
    position,
    store: currentStore,
  };
}

/**
 * E. Progress Synchronisation
 * When the learner completes an activity in Learn:
 * - Save the activity result.
 * - Update the lesson status.
 * - Recalculate module and journey progress according to defined rules.
 * - Update the next recommended action.
 * - Reflect the same changes in Journey and My Progress.
 * - Do NOT treat opening a lesson or watching a video as proof of mastery.
 */
export function completeLearnActivity(
  store: JourneyStore,
  params: {
    journeyId: string;
    moduleId: string;
    lessonId: string;
    type: "view-lesson" | "complete-practice" | "submit-quiz" | "submit-project";
    practiceResponse?: string;
    quizChoice?: number;
    projectSubmission?: string;
  },
): {
  store: JourneyStore;
  indicators: JourneyIndicators;
  lessonStatus: LessonStatusState;
  moduleStatus: ModuleStatusState;
  quizPassed?: boolean;
  feedbackMessage: string;
  remediationRecommendation?: string;
  nextRecommendedAction: string;
} {
  const journey = resolveJourneyById(params.journeyId, store) ?? resolveActiveJourney(store);
  const modIndex = Math.max(
    0,
    journey.modules.findIndex((m) => m.id === params.moduleId),
  );
  const modItem = journey.modules[modIndex] ?? journey.modules[0]!;
  const lesson =
    modItem.lessons.find((l) => l.id === params.lessonId) ?? modItem.lessons[0]!;

  let nextStore: JourneyStore = {
    ...store,
    activeId: journey.id,
    subjectId: journey.id,
    seen: true,
    activeJourneys: Array.from(
      new Set([...(store.activeJourneys ?? [store.activeId]), journey.id]),
    ),
  };

  let quizPassed: boolean | undefined;
  let feedbackMessage = "";
  let remediationRecommendation: string | undefined;

  if (params.type === "view-lesson") {
    const viewed = nextStore.lessonsViewed?.[journey.id] ?? [];
    if (!viewed.includes(lesson.id)) {
      nextStore = {
        ...nextStore,
        lessonsViewed: {
          ...(nextStore.lessonsViewed ?? {}),
          [journey.id]: [...viewed, lesson.id],
        },
      };
    }
    feedbackMessage = `Recorded exposure for "${lesson.title}". Complete the practice activity and module quiz to prove mastery.`;
  } else if (params.type === "complete-practice") {
    const text = (params.practiceResponse ?? "").trim();
    const doneList = nextStore.practicesDone?.[journey.id] ?? [];
    const viewed = nextStore.lessonsViewed?.[journey.id] ?? [];
    nextStore = {
      ...nextStore,
      lessonsViewed: {
        ...(nextStore.lessonsViewed ?? {}),
        [journey.id]: viewed.includes(lesson.id) ? viewed : [...viewed, lesson.id],
      },
      practicesDone: {
        ...(nextStore.practicesDone ?? {}),
        [journey.id]: doneList.includes(lesson.id) ? doneList : [...doneList, lesson.id],
      },
      practiceDrafts: {
        ...(nextStore.practiceDrafts ?? {}),
        [journey.id]: {
          ...(nextStore.practiceDrafts?.[journey.id] ?? {}),
          [lesson.id]: text || lesson.doThis,
        },
      },
    };
    feedbackMessage = `Saved practical exercise for "${lesson.title}". Next step: complete the module mastery quiz.`;
  } else if (params.type === "submit-quiz") {
    const choice = params.quizChoice ?? -1;
    quizPassed = choice === modItem.check.answer;
    const viewed = nextStore.lessonsViewed?.[journey.id] ?? [];
    const baseViewed = viewed.includes(lesson.id) ? viewed : [...viewed, lesson.id];

    if (quizPassed) {
      const curChecks = nextStore.checks[journey.id] ?? [];
      const nextChecks = curChecks.includes(modItem.id)
        ? curChecks
        : [...curChecks, modItem.id];
      const cleanedRev = (nextStore.revisionQueue?.[journey.id] ?? []).filter(
        (id) => id !== modItem.id,
      );
      nextStore = {
        ...nextStore,
        lessonsViewed: {
          ...(nextStore.lessonsViewed ?? {}),
          [journey.id]: baseViewed,
        },
        checks: {
          ...nextStore.checks,
          [journey.id]: nextChecks,
        },
        revisionQueue: {
          ...(nextStore.revisionQueue ?? {}),
          [journey.id]: cleanedRev,
        },
      };
      feedbackMessage = `Correct! ${modItem.check.why}`;
    } else {
      const curRev = nextStore.revisionQueue?.[journey.id] ?? [];
      const nextRev = curRev.includes(modItem.id) ? curRev : [...curRev, modItem.id];
      nextStore = {
        ...nextStore,
        lessonsViewed: {
          ...(nextStore.lessonsViewed ?? {}),
          [journey.id]: baseViewed,
        },
        revisionQueue: {
          ...(nextStore.revisionQueue ?? {}),
          [journey.id]: nextRev,
        },
      };
      remediationRecommendation =
        modItem.check.remediation ??
        `Review "${lesson.title}" notes and worked example, then ask Noctis for a simpler step-by-step walkthrough before retrying.`;
      feedbackMessage = `Not quite. ${modItem.check.why}`;
    }
  } else if (params.type === "submit-project") {
    const submission = (params.projectSubmission ?? "").trim();
    nextStore = {
      ...nextStore,
      projects: {
        ...nextStore.projects,
        [journey.id]: submission,
      },
    };
    const evalResult = evaluateProjectSubmission(journey, submission);
    feedbackMessage = evalResult.verified
      ? `Project verified (${evalResult.scorePct}% rubric match)! Your Journey and Learn records are updated.`
      : `Project draft saved (${evalResult.scorePct}% rubric match). Address the remaining rubric criteria to verify completion.`;
  }

  writeJourney(nextStore);

  const indicators = computeJourneyIndicators(journey, nextStore);
  const lessonStatus = getLessonStatusState(journey, modItem, lesson, nextStore);
  const moduleStatus = getModuleStatusState(journey, modIndex, nextStore);
  const brief = orchestratorBrief(journey, nextStore);

  return {
    store: nextStore,
    indicators,
    lessonStatus,
    moduleStatus,
    quizPassed,
    feedbackMessage,
    remediationRecommendation,
    nextRecommendedAction: brief.nextActionLabel,
  };
}

/**
 * F. Authorised Lesson-Aware Noctis Context
 * When a learner asks a question in Learn or Journey, provides authorised context for:
 * - The active journey
 * - The current module and lesson
 * - Lesson objectives
 * - Relevant learning content
 * - Previous assessment results where appropriate
 * - The learner's outstanding knowledge gaps
 * Noctis can explain the current lesson without the user repeating its title.
 */
export type AuthorisedNoctisLessonContext = {
  journeyId: string;
  journeyTitle: string;
  subject: string;
  moduleId: string;
  moduleTitle: string;
  lessonId: string;
  lessonTitle: string;
  curriculumVersion: string;
  learnerLevel: string;
  lessonObjectives: string[];
  relevantContentSummary: string;
  previousAssessmentResults: {
    passedModules: string[];
    moduleCheckPassed: boolean;
    practicesCompletedCount: number;
    knowledgeMasteryPct: number;
  };
  outstandingKnowledgeGaps: string[];
  recommendedRevision: string | null;
  sources: JourneySourceRef[];
  tutorResponse: {
    heading: string;
    body: string;
    bullets: string[];
    citations: JourneySourceRef[];
    uncertaintyNote: string;
  };
  contextualPrompt: string;
};

export function buildAuthorisedNoctisLessonContext(
  record: SharedCurriculumRecord,
  store: JourneyStore = readJourney(),
  action: NoctisGuideActionId = "simpler",
  customLearnerQuestion?: string,
): AuthorisedNoctisLessonContext {
  const { journey, module: modItem, lesson } = record;
  const indicators = computeJourneyIndicators(journey, store);
  const passedSet = new Set(store.checks[journey.id] ?? []);
  const moduleCheckPassed = passedSet.has(modItem.id);

  const lessonObjectives =
    lesson.objectives && lesson.objectives.length > 0
      ? lesson.objectives
      : modItem.objectives && modItem.objectives.length > 0
        ? modItem.objectives
        : [lesson.doThis, modItem.summary];

  const outstandingKnowledgeGaps = [
    ...indicators.needsRevision.map((title) => `Needs revision: ${title}`),
    ...journey.modules
      .filter((m) => !passedSet.has(m.id) && !indicators.needsRevision.includes(m.title))
      .slice(0, 2)
      .map((m) => `Unverified module check: ${m.title}`),
  ];

  const recommendedRevision =
    indicators.needsRevision.length > 0
      ? `Prioritise revising "${indicators.needsRevision[0]}" and use the step-by-step worked example before retaking its mastery check.`
      : !moduleCheckPassed
        ? `Complete the hands-on activity ("${lesson.doThis}") and pass the "${modItem.title}" concept check.`
        : null;

  const tutorResponse = generateNoctisTutorResponse(
    action,
    journey,
    modItem,
    lesson,
    store,
  );

  const questionLine = customLearnerQuestion?.trim()
    ? `Learner question: "${customLearnerQuestion.trim()}"`
    : `Action requested: ${action} for current lesson "${lesson.title}".`;

  const contextualPrompt = [
    `[Authorised Noctis Lesson Context]`,
    `Active Journey: ${journey.title} (${journey.id})`,
    `Current Module: ${modItem.title} (${modItem.id})`,
    `Current Lesson: ${lesson.title} (${lesson.id}) · Version ${record.curriculumVersion}`,
    `Learner Level: ${store.level} (${depthLine(store.level)})`,
    `Lesson Objectives: ${lessonObjectives.join("; ")}`,
    `Assessment Status: ${indicators.passedChecksCount}/${indicators.totalModulesCount} module checks passed (${indicators.knowledgeMasteryPct}% mastery)`,
    `Outstanding Gaps: ${outstandingKnowledgeGaps.length ? outstandingKnowledgeGaps.join(" | ") : "None flagged"}`,
    questionLine,
  ].join("\n");

  return {
    journeyId: journey.id,
    journeyTitle: journey.title,
    subject: journey.subject,
    moduleId: modItem.id,
    moduleTitle: modItem.title,
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    curriculumVersion: record.curriculumVersion,
    learnerLevel: store.level,
    lessonObjectives,
    relevantContentSummary: lesson.notes ?? modItem.summary,
    previousAssessmentResults: {
      passedModules: indicators.skillsDemonstrated,
      moduleCheckPassed,
      practicesCompletedCount: indicators.practicesCompletedCount,
      knowledgeMasteryPct: indicators.knowledgeMasteryPct,
    },
    outstandingKnowledgeGaps,
    recommendedRevision,
    sources: journey.sources ?? [],
    tutorResponse,
    contextualPrompt,
  };
}

/**
 * Returns all lessons from the user's active journeys ("My Lessons" section on Learn homepage)
 * as well as recommended next/remediation lessons.
 */
export function getMyJourneyLessons(store: JourneyStore = readJourney()): {
  activeJourney: JourneyPath;
  allActiveJourneys: JourneyPath[];
  myLessons: {
    record: SharedCurriculumRecord;
    status: LessonStatusState;
    moduleStatus: ModuleStatusState;
    isCurrent: boolean;
  }[];
  recommendedLessons: {
    record: SharedCurriculumRecord;
    reason: string;
    priority: "revision" | "next" | "reinforce";
  }[];
} {
  const activeJourney = resolveActiveJourney(store);
  const pos = readLearnPosition(store);
  const activeIds = Array.from(
    new Set([activeJourney.id, ...(store.activeJourneys ?? [])]),
  );
  const allActiveJourneys = activeIds
    .map((id) => resolveJourneyById(id, store))
    .filter((j): j is JourneyPath => j !== null);

  const myLessons: {
    record: SharedCurriculumRecord;
    status: LessonStatusState;
    moduleStatus: ModuleStatusState;
    isCurrent: boolean;
  }[] = [];

  const recommendedLessons: {
    record: SharedCurriculumRecord;
    reason: string;
    priority: "revision" | "next" | "reinforce";
  }[] = [];

  for (const journey of allActiveJourneys) {
    const revisionList = store.revisionQueue?.[journey.id] ?? [];
    const passedSet = new Set(store.checks[journey.id] ?? []);

    journey.modules.forEach((modItem, modIdx) => {
      const modStatus = getModuleStatusState(journey, modIdx, store);
      modItem.lessons.forEach((lesson) => {
        const record = buildSharedCurriculumRecord(journey, modItem, lesson);
        const status = getLessonStatusState(journey, modItem, lesson, store);
        const isCurrent =
          pos.journeyId === journey.id && pos.lessonId === lesson.id;
        myLessons.push({
          record,
          status,
          moduleStatus: modStatus,
          isCurrent,
        });

        if (revisionList.includes(modItem.id)) {
          recommendedLessons.push({
            record,
            reason: `Flagged for revision in ${journey.subject} — review the worked example and retake the ${modItem.title} check.`,
            priority: "revision",
          });
        } else if (!passedSet.has(modItem.id) && recommendedLessons.length < 6) {
          recommendedLessons.push({
            record,
            reason: `Next unverified lesson in ${journey.subject} (${modItem.title}).`,
            priority: "next",
          });
        }
      });
    });
  }

  return {
    activeJourney,
    allActiveJourneys,
    myLessons,
    recommendedLessons: recommendedLessons.slice(0, 6),
  };
}
