import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { LearnDesk } from "@/components/learn/LearnDesk";

export const Route = createFileRoute("/learn/journeys/$journeyId/")({
  component: LearnJourneyPage,
});

function LearnJourneyPage() {
  const { journeyId } = Route.useParams();
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl px-3 py-3 md:px-6 md:py-6">
        <LearnDesk initialJourneyId={journeyId} initialActivity="module-list" />
      </div>
    </AppShell>
  );
}
