import { Link, useRouterState } from "@tanstack/react-router";
import { areaFor, MOBILE_TABS, primaryActive, wingIsActive } from "@/lib/hall-nav";
import { useFeedStore } from "@/lib/feed-store";
import { vt } from "@/lib/locale";
import { cn } from "@/lib/utils";

export function MobileHallBar({ plain = false }: { plain?: boolean }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const enterReels = useFeedStore((s) => s.enterReels);
  const openClinic = useFeedStore((s) => s.openClinic);

  return (
    <nav
      aria-label="Hall tabs"
      className={
        plain
          ? "phone-hall relative z-50 shrink-0 bg-black/55 backdrop-blur-md"
          : "phone-chrome phone-hall sticky top-[calc(3rem+env(safe-area-inset-top))] z-40 border-b border-border bg-bg/90 backdrop-blur-md sm:top-[calc(3.5rem+env(safe-area-inset-top))]"
      }
    >
      <div className="hall-tabs flex gap-1 overflow-x-auto px-2 py-1.5 sm:px-3">
        {MOBILE_TABS.map((item) => {
          const Icon = item.icon;
          const active = primaryActive(path, item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              hash={item.hash ?? (item.to === "/" ? "feed" : "")}
              aria-current={active ? "page" : undefined}
              title={vt(item.blurb)}
              onClick={() => {
                if (item.to === "/") openClinic();
                if (item.to === "/reels") enterReels();
              }}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold",
                "min-h-11 snap-start",
                active ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
              )}
            >
              <Icon className="size-3.5 shrink-0" />
              {vt(item.label)}
            </Link>
          );
        })}
      </div>
      {(() => {
        const wing = areaFor(path)?.tabs ?? [];
        if (wing.length < 2) return null;
        return (
        <div className="flex gap-1 overflow-x-auto border-t border-border px-2 py-1.5">
          {wing.map((item) => {
            const on = wingIsActive(path, item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                hash={item.hash ?? (item.to === "/" ? "feed" : "")}
                aria-current={on ? "page" : undefined}
                onClick={() => {
                  if (item.to === "/") openClinic();
                  if (item.to === "/reels") enterReels();
                }}
                className={cn(
                  "inline-flex min-h-9 shrink-0 items-center rounded-full px-3 text-[12px] font-semibold",
                  on ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
                )}
              >
                {vt(item.label)}
              </Link>
            );
          })}
        </div>
        );
      })()}
    </nav>
  );
}
