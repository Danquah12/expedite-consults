import { Link, useRouterState } from "@tanstack/react-router";
import { useFeedStore } from "@/lib/feed-store";
import { cn } from "@/lib/utils";
import { HALL_AREAS, primaryActive } from "@/lib/hall-nav";
import { vt } from "@/lib/locale";

export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const viewStyle = useFeedStore((s) => s.viewStyle);
  const openClinic = useFeedStore((s) => s.openClinic);
  const enterReels = useFeedStore((s) => s.enterReels);

  if (viewStyle === "theater" && path === "/") return null;

  const item = (active: boolean) =>
    cn(
      "relative flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
      active ? "text-fg" : "text-subtle",
    );

  return (
    <nav className="phone-chrome phone-dock fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <div className="dock-row mx-auto flex h-14 max-w-lg items-stretch justify-around px-1">
        {HALL_AREAS.filter((area) => area.id !== "profile").map((area) => {
          const Icon = area.icon;
          const active = primaryActive(path, area.to);
          return (
            <Link
              key={area.id}
              to={area.to}
              aria-current={active ? "page" : undefined}
              className={item(active)}
              onClick={() => {
                if (area.id === "discover") enterReels();
                if (area.to === "/") openClinic();
              }}
            >
              {active ? <span className="absolute top-1 h-0.5 w-4 rounded-full bg-primary" /> : null}
              <Icon className="size-5" />
              <span className="dock-label">{vt(area.label)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}