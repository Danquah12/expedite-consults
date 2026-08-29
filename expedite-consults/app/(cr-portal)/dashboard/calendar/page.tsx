import { crReadClient } from "@/sanity/lib/write-client";
import Link from "next/link";
import { CRStatusBadge } from "@/components/cr/CRStatusBadge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday } from "date-fns";

async function getScheduledCRs() {
	return crReadClient.fetch<any[]>(
		`*[_type == "changeRequest" && plannedStartDate != null && state in ["scheduled","implement"]] {
      _id, chgNumber, shortDescription, changeType, priority, riskScore,
      plannedStartDate, plannedEndDate, state, requestor
    } | order(plannedStartDate asc)`
	);
}

const TYPE_COLOR: Record<string, string> = {
	standard:  "bg-green-100 text-green-700 border-green-200",
	normal:    "bg-amber-100 text-amber-700 border-amber-200",
	emergency: "bg-red-100 text-red-700 border-red-200",
};

export default async function CalendarPage() {
	const crs = await getScheduledCRs();
	const now = new Date();
	const monthStart = startOfMonth(now);
	const monthEnd = endOfMonth(now);
	const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

	// Map date string to CRs on that day
	const crsByDay: Record<string, typeof crs> = {};
	for (const cr of crs) {
		const key = format(new Date(cr.plannedStartDate), "yyyy-MM-dd");
		if (!crsByDay[key]) crsByDay[key] = [];
		crsByDay[key].push(cr);
	}

	// Pad calendar grid for starting weekday
	const startPad = getDay(monthStart); // 0=Sun

	return (
		<div className="max-w-6xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-[#030c1d]">Change Calendar</h1>
					<p className="text-sm text-slate-500 mt-1">
						Scheduled maintenance windows for {format(now, "MMMM yyyy")}
					</p>
				</div>
				<div className="flex items-center gap-3 text-xs flex-wrap">
					<span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-200 inline-block" /> Standard</span>
					<span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-200 inline-block" /> Normal</span>
					<span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-200 inline-block" /> Emergency</span>
				</div>
			</div>

			{/* Calendar grid */}
			<div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
				{/* Day headers */}
				<div className="grid grid-cols-7 border-b border-slate-100">
					{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
						<div key={d} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
							{d}
						</div>
					))}
				</div>

				{/* Calendar cells */}
				<div className="grid grid-cols-7">
					{/* Start padding */}
					{Array.from({ length: startPad }).map((_, i) => (
						<div key={`pad-${i}`} className="border-b border-r border-slate-50 p-2 min-h-[90px] bg-slate-25" />
					))}

					{days.map((day) => {
						const key = format(day, "yyyy-MM-dd");
						const dayCRs = crsByDay[key] ?? [];
						const today = isToday(day);

						return (
							<div
								key={key}
								className={`border-b border-r border-slate-50 p-2 min-h-[90px] ${today ? "bg-[#43bbd1]/5" : ""}`}
							>
								<p className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
									today ? "bg-[#030c1d] text-[#43bbd1]" : "text-slate-500"
								}`}>
									{format(day, "d")}
								</p>
								<div className="space-y-1">
									{dayCRs.slice(0, 3).map(cr => (
										<Link
											key={cr._id}
											href={`/dashboard/${cr.chgNumber}`}
											className={`block px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border hover:opacity-80 transition ${TYPE_COLOR[cr.changeType] ?? "bg-slate-100 text-slate-600"}`}
										>
											{cr.chgNumber}
										</Link>
									))}
									{dayCRs.length > 3 && (
										<p className="text-[10px] text-slate-400 pl-1">+{dayCRs.length - 3} more</p>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Upcoming list */}
			<div className="bg-white rounded-2xl border border-slate-200">
				<div className="px-6 py-4 border-b border-slate-100">
					<h2 className="text-sm font-bold text-slate-700">
						Upcoming Maintenance Windows ({crs.length})
					</h2>
				</div>

				{crs.length === 0 ? (
					<div className="text-center py-12 text-slate-400">
						<p className="text-3xl mb-2">📅</p>
						<p className="text-sm">No changes scheduled.</p>
					</div>
				) : (
					<div className="divide-y divide-slate-50">
						{crs.map(cr => (
							<Link
								key={cr._id}
								href={`/dashboard/${cr.chgNumber}`}
								className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition"
							>
								<div className="text-center w-14 flex-shrink-0">
									<p className="text-xs text-slate-400">{format(new Date(cr.plannedStartDate), "MMM")}</p>
									<p className="text-2xl font-bold text-[#030c1d]">{format(new Date(cr.plannedStartDate), "d")}</p>
									<p className="text-xs text-slate-400">{format(new Date(cr.plannedStartDate), "HH:mm")}</p>
								</div>

								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 flex-wrap mb-1">
										<span className="font-mono text-xs font-bold text-[#43bbd1] bg-[#030c1d] px-2 py-0.5 rounded">
											{cr.chgNumber}
										</span>
										<CRStatusBadge value={cr.changeType} type="changeType" />
										<CRStatusBadge value={cr.state} type="state" />
									</div>
									<p className="text-sm font-semibold text-slate-800 truncate">{cr.shortDescription}</p>
									<p className="text-xs text-slate-400 mt-0.5">
										{cr.requestor?.name} ·{" "}
										{cr.plannedEndDate
											? `Until ${format(new Date(cr.plannedEndDate), "HH:mm")}`
											: "End TBD"}
									</p>
								</div>

								{cr.riskScore && (
									<div className="text-center flex-shrink-0">
										<p className="text-xs text-slate-400">Risk</p>
										<p className="text-xl font-bold text-[#030c1d]">{cr.riskScore}</p>
									</div>
								)}

								<span className="text-[#43bbd1] text-sm font-semibold">→</span>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
