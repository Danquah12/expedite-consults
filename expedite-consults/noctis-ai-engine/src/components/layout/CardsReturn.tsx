import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { rememberedDoor, type DoorId } from "@/lib/door-board";
import { vt } from "@/lib/locale";

export function CardsReturn({ className, onClick }: { className?: string; onClick?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [door, setDoor] = useState<DoorId | undefined>();
  useEffect(() => {
    setDoor(rememberedDoor());
  }, [path]);
  if (path === "/start") return null;
  return (
    <Link
      to="/start"
      search={door ? { door } : {}}
      aria-label={vt("Back to cards")}
      onClick={onClick}
      className={className}
    >
      <ChevronLeft className="size-4 shrink-0" />
      {vt("Cards")}
    </Link>
  );
}
