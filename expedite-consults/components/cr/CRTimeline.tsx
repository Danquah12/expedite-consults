"use client";

import { cn } from "@/lib/utils";
import { CR_PHASES, getPhaseIndex } from "@/lib/cr-utils";

const PHASE_ICONS: Record<string, string> = {
	new:       "📋",
	assess:    "🔍",
	plan:      "📝",
	approve:   "✅",
	scheduled: "📅",
	implement: "🔧",
	review:    "✔️",
	closed:    "🏁",
};

interface CRTimelineProps {
	currentState: string;
	className?: string;
}

export function CRTimeline({ currentState, className }: CRTimelineProps) {
	const currentIndex = getPhaseIndex(currentState);

	return (
		<div className={cn("w-full", className)}>
			{/* Desktop: horizontal stepper */}
			<div className="hidden md:flex items-center w-full">
				{CR_PHASES.map((phase, i) => {
					const done = i < currentIndex;
					const active = i === currentIndex;
					const upcoming = i > currentIndex;

					return (
						<div key={phase.key} className="flex-1 flex items-center">
							<div className="flex flex-col items-center flex-1">
								{/* Step circle */}
								<div
									className={cn(
										"w-9 h-9 rounded-full flex items-center justify-center text-base font-bold border-2 transition-all",
										done    && "bg-[#43bbd1] border-[#43bbd1] text-[#030c1d]",
										active  && "bg-[#030c1d] border-[#43bbd1] text-[#43bbd1] ring-4 ring-[#43bbd1]/20",
										upcoming && "bg-white border-slate-200 text-slate-400"
									)}
								>
									{done ? "✓" : PHASE_ICONS[phase.key]}
								</div>
								{/* Label */}
								<div className="mt-2 text-center">
									<p className={cn(
										"text-xs font-semibold",
										done    && "text-[#43bbd1]",
										active  && "text-[#030c1d]",
										upcoming && "text-slate-400"
									)}>
										{phase.label}
									</p>
									<p className="text-[10px] text-slate-400">Phase {phase.phase}</p>
								</div>
							</div>

							{/* Connector line */}
							{i < CR_PHASES.length - 1 && (
								<div className={cn(
									"h-0.5 flex-1 mx-1 rounded-full transition-all",
									i < currentIndex ? "bg-[#43bbd1]" : "bg-slate-200"
								)} />
							)}
						</div>
					);
				})}
			</div>

			{/* Mobile: vertical list */}
			<div className="md:hidden space-y-3">
				{CR_PHASES.map((phase, i) => {
					const done = i < currentIndex;
					const active = i === currentIndex;

					return (
						<div key={phase.key} className="flex items-start gap-3">
							{/* Circle */}
							<div className={cn(
								"w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 flex-shrink-0 mt-0.5",
								done    && "bg-[#43bbd1] border-[#43bbd1] text-[#030c1d]",
								active  && "bg-[#030c1d] border-[#43bbd1] text-[#43bbd1]",
								!done && !active && "bg-white border-slate-200 text-slate-400"
							)}>
								{done ? "✓" : PHASE_ICONS[phase.key]}
							</div>
							{/* Text */}
							<div>
								<p className={cn(
									"text-sm font-semibold",
									active && "text-[#030c1d]",
									done   && "text-[#43bbd1]",
									!done && !active && "text-slate-400"
								)}>
									Phase {phase.phase}: {phase.label}
								</p>
								{active && (
									<p className="text-xs text-[#43bbd1] font-medium mt-0.5">← Current phase</p>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
