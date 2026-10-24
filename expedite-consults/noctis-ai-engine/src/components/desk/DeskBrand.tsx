import { cn } from "@/lib/utils";

export function DeskMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("shrink-0", className)} role="img">
      <title>Desk</title>
      <rect width="32" height="32" rx="8" fill="#111113" />
      <rect x="1.25" y="1.25" width="29.5" height="29.5" rx="7" fill="none" stroke="#e4e4e7" strokeWidth="1.2" />
      <rect x="8" y="8" width="6.4" height="6.4" rx="1.2" fill="#e4e4e7" />
      <rect x="17.6" y="8" width="6.4" height="6.4" rx="1.2" fill="none" stroke="#e4e4e7" strokeWidth="1.2" />
      <rect x="8" y="17.6" width="6.4" height="6.4" rx="1.2" fill="none" stroke="#e4e4e7" strokeWidth="1.2" />
      <rect x="17.6" y="17.6" width="6.4" height="6.4" rx="1.2" fill="#e4e4e7" />
    </svg>
  );
}

export function DeskLockup({ className }: { className?: string }) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <DeskMark className="size-8" />
      <span className="min-w-0">
        <span className="block font-sans text-[15px] font-semibold leading-none tracking-tight">Desk</span>
        <span className="mt-1.5 block text-[10px] font-medium uppercase tracking-[0.18em] text-subtle">Noctis ops</span>
      </span>
    </span>
  );
}
