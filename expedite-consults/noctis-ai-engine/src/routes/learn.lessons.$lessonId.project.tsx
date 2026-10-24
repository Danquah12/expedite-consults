import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { LearnDesk } from "@/components/learn/LearnDesk";

export const Route = createFileRoute("/learn/lessons/$lessonId/project")({
  validateSearch: (raw: Record<string, unknown>): { journeyId?: string } => ({
    journeyId: typeof raw.journeyId === "string" ? raw.journeyId : undefined,
  }),
  component: LearnLessonProjectPage,
});

function LearnLessonProjectPage() {
  const { lessonId } = Route.useParams();
  const search = Route.useSearch();
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl px-3 py-3 md:px-6 md:py-6">
        <LearnDesk
          initialJourneyId={search.journeyId}
          initialLessonId={lessonId}
          initialActivity="project"
          initialFormat="labs"
        />
      </div>
    </AppShell>
  );
}
