import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ReelsPlayer } from "@/components/reels/ReelsPlayer";

export const Route = createFileRoute("/reels")({ component: ReelsPage });

function ReelsPage() {
  return (
    <AppShell>
      <ReelsPlayer />
    </AppShell>
  );
}
