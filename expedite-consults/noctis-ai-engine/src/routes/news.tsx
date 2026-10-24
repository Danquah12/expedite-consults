import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { NewsBroadcast } from "@/components/news/NewsBroadcast";

export const Route = createFileRoute("/news")({ component: NewsPage });

function NewsPage() {
  return (
    <AppShell>
      <NewsBroadcast />
    </AppShell>
  );
}
