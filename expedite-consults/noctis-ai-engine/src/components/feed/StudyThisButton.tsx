import { GraduationCap } from "lucide-react";
import { useFeedStore } from "@/lib/feed-store";
import { cn } from "@/lib/utils";

export function StudyThisButton({ postId, className, quiet }: { postId: string; className?: string; quiet?: boolean }) {
  const openModal = useFeedStore((s) => s.openModal);
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg",
        className,
      )}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        openModal({ type: "lesson", postId });
      }}
    >
      {quiet ? null : <GraduationCap className="size-3.5" />}
      Study this
    </button>
  );
}
