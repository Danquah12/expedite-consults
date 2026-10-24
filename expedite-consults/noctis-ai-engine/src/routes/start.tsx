import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { DoorBoard } from "@/components/layout/DoorBoard";
import { NoctisDesk } from "@/components/noctis/NoctisDesk";
import { isDoorId, rememberDoor, type DoorId } from "@/lib/door-board";

export const Route = createFileRoute("/start")({
  validateSearch: (search: Record<string, unknown>): { door?: DoorId } => {
    return { door: isDoorId(search.door) ? search.door : undefined };
  },
  component: StartPage,
});

function StartPage() {
  const { door } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [isStandaloneAiHost, setIsStandaloneAiHost] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.location.hostname.toLowerCase().includes("noctis-ai") ||
        window.location.hostname.toLowerCase().includes("noctis-engine"))
  );
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window.location.hostname.toLowerCase().includes("noctis-ai") ||
        window.location.hostname.toLowerCase().includes("noctis-engine"))
    ) {
      setIsStandaloneAiHost(true);
    }
    if (door) rememberDoor(door);
  }, [door]);

  if (isStandaloneAiHost && !door) {
    return (
      <AppShell>
        <NoctisDesk />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <DoorBoard door={door} onDoor={(next) => void navigate({ search: { door: next }, replace: true })} />
    </AppShell>
  );
}