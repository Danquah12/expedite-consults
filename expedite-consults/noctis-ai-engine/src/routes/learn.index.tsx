import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { LearnDesk } from "@/components/learn/LearnDesk";
import type { LearnActivityType, LearnFormatId } from "@/lib/journey-learn-bridge";

export const Route = createFileRoute("/learn/")({
  validateSearch: (raw: Record<string, unknown>): {
    journeyId?: string;
    moduleId?: string;
    lessonId?: string;
    view?: LearnActivityType;
    format?: LearnFormatId;
  } => ({
    journeyId: typeof raw.journeyId === "string" ? raw.journeyId : undefined,
    moduleId: typeof raw.moduleId === "string" ? raw.moduleId : undefined,
    lessonId: typeof raw.lessonId === "string" ? raw.lessonId : undefined,
    view:
      raw.view === "lesson" ||
      raw.view === "module-list" ||
      raw.view === "practice" ||
      raw.view === "project" ||
      raw.view === "progress" ||
      raw.view === "noctis" ||
      raw.view === "certificate"
        ? raw.view
        : undefined,
    format:
      raw.format === "video" ||
      raw.format === "slides" ||
      raw.format === "practice" ||
      raw.format === "notes" ||
      raw.format === "labs" ||
      raw.format === "noctis"
        ? raw.format
        : undefined,
  }),
  component: LearnIndexPage,
});

function LearnIndexPage() {
  const search = Route.useSearch();
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl px-3 py-3 md:px-6 md:py-6">
        <LearnDesk
          initialJourneyId={search.journeyId}
          initialModuleId={search.moduleId}
          initialLessonId={search.lessonId}
          initialActivity={search.view}
          initialFormat={search.format}
        />
      </div>
    </AppShell>
  );
}
