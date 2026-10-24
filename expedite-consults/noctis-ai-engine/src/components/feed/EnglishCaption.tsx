import type { Hear } from "@/lib/english-hear";
import { phraseAt } from "@/lib/english-hear";
import { cn } from "@/lib/utils";

/** Broadcast-style caption: language named, one English thought, high contrast, two lines. */
export function EnglishCaption({
  hear,
  time,
  className,
}: {
  hear: Hear | null;
  time: number;
  className?: string;
}) {
  if (!hear) return null;
  return (
    <div className={cn("pointer-events-none absolute inset-x-0 top-8 z-40 flex justify-center px-4", className)}>
      <p className="max-w-[36rem] rounded-md bg-black/88 px-3 py-1.5 text-center text-[15px] font-medium leading-snug text-white [text-wrap:balance]">
        <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200">{hear.tongue} · English</span>
        <span className="line-clamp-2">{phraseAt(hear, time)}</span>
      </p>
    </div>
  );
}
