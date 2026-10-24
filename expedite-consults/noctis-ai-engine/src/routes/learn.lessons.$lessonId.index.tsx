import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { LearnDesk } from "@/components/learn/LearnDesk";
import type { LearnFormatId } from "@/lib/journey-learn-bridge";

export const Route = createFileRoute("/learn/lessons/$lessonId/")({
  validateSearch: (raw: Record<string, unknown>): {
    journeyId?: string;
    format?: LearnFormatId;
  } => ({
    journeyId: typeof raw.journeyId === "string" ? raw.journeyId : undefined,
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
  component: LearnLessonPage,
});

function LearnLessonPage() {
  const { lessonId } = Route.useParams();
  const search = Route.useSearch();
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl px-3 py-3 md:px-6 md:py-6">
        <LearnDesk
          initialJourneyId={search.journeyId}
          initialLessonId={lessonId}
          initialActivity="lesson"
          initialFormat={search.format ?? "video"}
        />
      </div>
    </AppShell>
  );
}
