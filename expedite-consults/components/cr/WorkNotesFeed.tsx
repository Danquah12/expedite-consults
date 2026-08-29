"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface WorkNote {
	_key?: string;
	author: string;
	authorEmail?: string;
	note: string;
	timestamp: string;
	type?: string;
}

const NOTE_STYLE: Record<string, { icon: string; border: string; bg: string }> = {
	work_note:     { icon: "💬", border: "border-l-slate-300",   bg: "bg-white" },
	status_update: { icon: "📊", border: "border-l-blue-400",    bg: "bg-blue-50/50" },
	issue_alert:   { icon: "⚠️", border: "border-l-red-400",     bg: "bg-red-50/50" },
	system_event:  { icon: "⚙️", border: "border-l-slate-200",   bg: "bg-slate-50" },
};

function initials(name: string) {
	return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export function WorkNotesFeed({ notes, className }: { notes: WorkNote[]; className?: string }) {
	if (!notes?.length) {
		return (
			<div className={cn("text-center py-12 text-slate-400", className)}>
				<p className="text-3xl mb-2">📋</p>
				<p className="text-sm">No work notes yet.</p>
			</div>
		);
	}

	const sorted = [...notes].sort(
		(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
	);

	return (
		<div className={cn("space-y-3", className)}>
			{sorted.map((note, i) => {
				const style = NOTE_STYLE[note.type ?? "work_note"] ?? NOTE_STYLE.work_note;
				const isSystem = note.type === "system_event";

				return (
					<div
						key={note._key ?? i}
						className={cn(
							"rounded-lg border border-l-4 p-4",
							style.border,
							style.bg,
							isSystem && "opacity-75"
						)}
					>
						<div className="flex items-start gap-3">
							{/* Avatar */}
							<div className={cn(
								"w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
								isSystem ? "bg-slate-200 text-slate-500" : "bg-[#030c1d] text-[#43bbd1]"
							)}>
								{isSystem ? "⚙️" : initials(note.author)}
							</div>

							{/* Content */}
							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between gap-2 flex-wrap">
									<div className="flex items-center gap-2">
										<span className="text-sm font-semibold text-slate-800">{note.author}</span>
										<span className="text-xs">{style.icon}</span>
										<span className="text-xs text-slate-400 capitalize">
											{(note.type ?? "work_note").replace(/_/g, " ")}
										</span>
									</div>
									<span className="text-xs text-slate-400 whitespace-nowrap">
										{format(new Date(note.timestamp), "MMM d, yyyy HH:mm")}
									</span>
								</div>
								<p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{note.note}</p>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
