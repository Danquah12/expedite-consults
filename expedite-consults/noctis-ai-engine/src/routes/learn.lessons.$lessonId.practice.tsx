import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { LearnDesk } from "@/components/learn/LearnDesk";

export const Route = createFileRoute("/learn/lessons/$lessonId/practice")({
  validateSearch: (raw: Record<string, unknown>): { journeyId?: string } => ({
    journeyId: typeof raw.journeyId === "string" ? raw.journeyId : undefined,
  }),
  component: LearnLessonPracticePage,
});

function LearnLessonPracticePage() {
  const { lessonId } = Route.useParams();
  const search = Route.useSearch();
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl px-3 py-3 md:px-6 md:py-6">
        <LearnDesk
          initialJourneyId={search.journeyId}
          initialLessonId={lessonId}
          initialActivity="practice"
          initialFormat="practice"
        />
      </div>
    </AppShell>
  );
}
