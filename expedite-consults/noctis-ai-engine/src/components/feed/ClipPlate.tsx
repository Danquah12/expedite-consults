import { cn } from "@/lib/utils";

type PlateTone = "feed" | "reel" | "tile" | "stage" | "dock";

export function ClipPlate({
  children,
  className,
  tone = "feed",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: PlateTone;
}) {
  return (
    <div data-plate={tone} className={cn("clip-plate", className)}>
      {children}
    </div>
  );
}
