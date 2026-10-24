import { cn } from "@/lib/utils";
import { withSourceLinks } from "@/components/feed/EndHold";

function vibeLine(text: string) {
  return text.replace(/\s{2,}/g, " ").trim();
}

type Size = "feed" | "reel" | "tile" | "strip";

export function ClipCaption({
  kicker,
  body,
  meta,
  size = "feed",
  className,
}: {
  kicker?: string;
  body: string;
  meta?: string;
  size?: Size;
  className?: string;
}) {
  return (
    <div className={cn("pointer-events-none absolute inset-x-0 bottom-0 z-[8]", className)}>
      <div className={cn("clip-scrim absolute inset-0", size === "reel" ? "top-[-58%]" : size === "feed" ? "top-[-48%]" : "top-[-62%]")} />
      <div
        className={cn(
          "relative",
          size === "reel" && "px-4 pb-28 pr-16 pt-6",
          size === "feed" && "px-4 pb-3.5 pt-8",
          size === "tile" && "px-2 pb-2 pt-6",
          size === "strip" && "px-2 pb-2 pt-5",
        )}
      >
        {kicker ? (
          <p
            className={cn(
              "clip-kicker font-semibold uppercase tracking-[0.16em]",
              size === "reel" ? "text-[11px]" : "text-[10px]",
            )}
          >
            {vibeLine(kicker)}
          </p>
        ) : null}
        <p
          className={cn(
            "clip-type text-pretty font-semibold",
            size === "reel" && "mt-1.5 font-display text-[1.35rem] leading-[1.25] [text-wrap:balance]",
            size === "feed" && "mt-1 text-[15px] leading-snug [text-wrap:pretty]",
            size === "tile" && "mt-0.5 line-clamp-2 text-[11px] leading-snug",
            size === "strip" && "mt-0.5 line-clamp-3 font-display text-[12px] leading-snug [text-wrap:balance]",
            size === "reel" ? "line-clamp-4" : size === "feed" ? "line-clamp-3" : null,
          )}
        >
          {withSourceLinks(vibeLine(body))}
        </p>
        {meta ? (
          <p className={cn("clip-meta mt-1.5 truncate font-medium", size === "reel" ? "text-xs" : "text-[11px]")}>
            {meta}
          </p>
        ) : null}
      </div>
    </div>
  );
}
