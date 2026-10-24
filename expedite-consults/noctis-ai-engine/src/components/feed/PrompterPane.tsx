import { useEffect, useRef } from "react";
import { displayWords } from "@/lib/prompter";
import { cn } from "@/lib/utils";

export function PrompterPane({
  script,
  cursor,
  mirror,
}: {
  script: string;
  cursor: number;
  mirror: boolean;
}) {
  const words = displayWords(script);
  const active = Math.min(cursor, Math.max(0, words.length - 1));
  const mark = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    mark.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [active]);

  if (!words.length) return null;

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-x-[18%] top-[18%] z-10 h-0.5 bg-primary/80" />
      <p className="absolute left-3 top-[18%] text-[10px] font-semibold uppercase tracking-wider text-primary">Lens</p>
      <div className="absolute inset-x-0 bottom-0 h-[42%] overflow-hidden bg-gradient-to-t from-bg/85 to-transparent">
        <p
          className={cn(
            "px-6 pb-8 pt-10 text-center text-xl font-semibold leading-relaxed text-caption transition-transform duration-200",
            mirror && "-scale-x-100",
          )}
        >
          {words.map((word, i) => (
            <span
              key={`${word}-${i}`}
              ref={i === active ? mark : undefined}
              className={cn("mx-0.5 inline-block", i === active ? "text-primary" : i < active ? "text-caption-muted" : "text-caption")}
            >
              {word}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}