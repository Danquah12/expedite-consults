import { Bell, BellRing } from "lucide-react";
import { useFeedStore } from "@/lib/feed-store";
import { cn } from "@/lib/utils";

export function SubscribeBell({ username, postId, className }: { username: string; postId?: string; className?: string }) {
  const on = useFeedStore((s) => s.bells.includes(username));
  return (
    <button
      type="button"
      aria-label={on ? "Subscribed" : "Subscribe"}
      aria-pressed={on}
      onMouseDown={(event) => event.preventDefault()}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        useFeedStore.getState().toggleBell(username, postId);
      }}
      className={cn("inline-flex min-h-9 items-center gap-1 rounded-full px-2 text-xs font-semibold", on ? "text-primary" : "text-muted", className)}
    >
      {on ? <BellRing className="size-4" /> : <Bell className="size-4" />}
      {on ? "Subscribed" : "Subscribe"}
    </button>
  );
}
