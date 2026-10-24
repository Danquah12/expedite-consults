import { Link, useRouterState } from "@tanstack/react-router";
import { INTENTS } from "@/lib/learn";
import { cn } from "@/lib/utils";

export function IntentRail() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex flex-wrap gap-1.5">
      {INTENTS.map((intent) => {
        const href = `/i/${intent.id}`;
        const active = path === href;
        return (
          <Link
            key={intent.id}
            to="/i/$intent"
            params={{ intent: intent.id }}
            className={cn(
              "inline-flex min-h-9 shrink-0 items-center rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-border",
              active ? "bg-primary text-primary-fg" : "bg-elevated text-muted hover:text-fg",
            )}
          >
            {intent.label}
          </Link>
        );
      })}
    </div>
  );
}
