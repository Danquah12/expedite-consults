import type { ReactNode } from "react";
import { HallRail } from "@/components/layout/HallRail";
import { LiveSidebar } from "@/components/feed/LiveSidebar";
import { cn } from "@/lib/utils";

export function ClinicFrame({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="clinic-shell flex items-start justify-between gap-2 py-2 md:gap-3 md:py-4 xl:gap-4 xl:py-5">
      <HallRail />
      <div
        className={cn(
          "flex min-w-0 w-full flex-1 flex-col gap-3 md:gap-4 xl:gap-5",
          wide ? "music-lane xl:max-w-none" : "xl:max-w-[46rem] 2xl:max-w-[46rem]",
        )}
      >
        {children}
      </div>
      <LiveSidebar />
    </div>
  );
}
