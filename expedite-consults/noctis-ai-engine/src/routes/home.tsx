import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { JourneyDesk } from "@/components/journey/JourneyDesk";

export const Route = createFileRoute("/home")({ component: HomePage });

function HomePage() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl px-3 py-3 md:px-6 md:py-6">
        <JourneyDesk />
      </div>
    </AppShell>
  );
}
