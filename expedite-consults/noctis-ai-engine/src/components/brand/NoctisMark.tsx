import { cn } from "@/lib/utils";
import { vt } from "@/lib/locale";

/** noctis.social mark: an open ring with a single dot. Solid shapes, so it reads at 16px. */
export function NoctisMark({ className, title = "Noctis" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("noctis-mark shrink-0", className)} role="img">
      <title>{vt(title)}</title>
      <rect width="32" height="32" rx="8" fill="#0b1220" />
      <path
        d="M19.5 7H15.5A9 9 0 0 0 15.5 25H19.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="21.4" y="13.2" width="5.6" height="5.6" rx="1.8" fill="#ffffff" />
    </svg>
  );
}

export function NoctisLockup({
  kicker = "Clinic",
  className,
  markClass = "size-9",
}: {
  kicker?: string;
  className?: string;
  markClass?: string;
}) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <NoctisMark className={markClass} />
      <span className="min-w-0">
        <span className="block font-display text-lg font-semibold leading-none tracking-tight">noctis.social</span>
        {kicker ? (
          <span className="mt-1.5 block font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
            {vt(kicker)}
          </span>
        ) : null}
      </span>
    </span>
  );
}
