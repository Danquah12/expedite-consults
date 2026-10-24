import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { MusicHall } from "@/components/music/MusicHall";

export const Route = createFileRoute("/music")({ component: MusicPage });

function MusicPage() {
  return (
    <AppShell>
      <MusicHall />
    </AppShell>
  );
}
