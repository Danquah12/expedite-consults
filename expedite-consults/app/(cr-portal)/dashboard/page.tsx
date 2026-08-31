import Link from "next/link";
import { crReadClient } from "@/sanity/lib/write-client";
import { CRStatusBadge } from "@/components/cr/CRStatusBadge";
import { format } from "date-fns";

async function getDashboardData() {
	const [all, cabQueue, implementing, thisWeek] = await Promise.all([
		crReadClient.fetch<any[]>(
			`*[_type == "changeRequest"] | order(_createdAt desc)[0...100] {
        _id, chgNumber, state, changeType, category, priority, riskScore,
        shortDescription, requestor, assignedTo, plannedStartDate, cabDecision, _createdAt
      }`
		),
		crReadClient.fetch<number>(`count(*[_type == "changeRequest" && state == "approve"])`),
		crReadClient.fetch<number>(`count(*[_type == "changeRequest" && state == "implement"])`),
		crReadClient.fetch<number>(
			`count(*[_type == "changeRequest" && plannedStartDate >= $start && plannedStartDate <= $end])`,
			{
				start: new Date(Date.now()).toISOString(),
				end: new Date(Date.now() + 7 * 86400000).toISOString(),
			}
		),
	]);

	return { all, cabQueue, implementing, thisWeek };
}

const STATES = ["new","assess","plan","approve","scheduled","implement","review","closed"];

export default async function DashboardPage({
	searchParams,
}: {
	searchParams: Promise<{ state?: string; changeType?: string; category?: string }>;
}) {
	const sp = await searchParams;
	const { all, cabQueue, implementing, thisWeek } = await getDashboardData();

	// Client-side filtering (small dataset, < 100 items)
	let filtered = all;
	if (sp.state) filtered = filtered.filter(c => c.state === sp.state);
	if (sp.changeType) filtered = filtered.filter(c => c.changeType === sp.changeType);
	if (sp.category) filtered = filtered.filter(c => c.category === sp.category);

	const statCounts = STATES.reduce((acc, s) => {
		acc[s] = all.filter(c => c.state === s).length;
		return acc;
	}, {} as Record<string, number>);

	return (
		<div className="max-w-6xl mx-auto space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-[#030c1d]">Change Manager Dashboard</h1>
					<p className="text-sm text-slate-500 mt-1">Full CR oversight — approve, assign, and close changes</p>
				</div>
				<Link
					href="/portal/new"
					className="flex items-center gap-2 bg-[#030c1d] text-[#43bbd1] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#43bbd1] hover:text-[#030c1d] transition-colors text-sm"
				>
					➕ New CR
				</Link>
			</div>

			{/* Expedite Consults Digital Ecosystem Suite Launcher */}
			<div className="bg-gradient-to-r from-[#030c1d] via-[#091e42] to-[#030c1d] rounded-2xl p-6 text-white shadow-xl border border-[#43bbd1]/30 space-y-4">
				<div className="flex items-center justify-between flex-wrap gap-2">
					<div>
						<div className="flex items-center gap-2">
							<span className="text-[10px] font-black uppercase tracking-widest text-[#43bbd1] bg-[#43bbd1]/10 px-2.5 py-0.5 rounded-full border border-[#43bbd1]/20">
								Enterprise Ecosystem Suite
							</span>
						</div>
						<h2 className="text-xl font-black mt-1">Expedite Consults Portal — Digital Ecosystem</h2>
						<p className="text-xs text-slate-300 mt-0.5">
							Access TowsonSync Campus OS, VeritasLens™ AI, ConnectIn Network, and AXIOM Defense.
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
					<Link
						href="/campus"
						className="p-3.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-[#43bbd1]/50 transition group space-y-1.5"
					>
						<div className="flex items-center justify-between">
							<span className="text-xl group-hover:scale-110 transition">🎓</span>
							<span className="text-[10px] font-bold text-[#43bbd1]">Launch →</span>
						</div>
						<div className="font-bold text-sm text-white group-hover:text-[#43bbd1] transition">TowsonSync Campus</div>
						<p className="text-[11px] text-slate-400 leading-snug">Canvas Radar, OneCard, SafeWalk, & Admin Center.</p>
					</Link>

					<Link
						href="/veritaslens"
						className="p-3.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-[#43bbd1]/50 transition group space-y-1.5"
					>
						<div className="flex items-center justify-between">
							<span className="text-xl group-hover:scale-110 transition">🌐</span>
							<span className="text-[10px] font-bold text-[#43bbd1]">Launch →</span>
						</div>
						<div className="font-bold text-sm text-white group-hover:text-[#43bbd1] transition">VeritasLens™ AI</div>
						<p className="text-[11px] text-slate-400 leading-snug">Autonomous OSINT scrapers & entity intelligence.</p>
					</Link>

					<Link
						href="/connectin"
						className="p-3.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-[#43bbd1]/50 transition group space-y-1.5"
					>
						<div className="flex items-center justify-between">
							<span className="text-xl group-hover:scale-110 transition">💼</span>
							<span className="text-[10px] font-bold text-[#43bbd1]">Launch →</span>
						</div>
						<div className="font-bold text-sm text-white group-hover:text-[#43bbd1] transition">ConnectIn Network</div>
						<p className="text-[11px] text-slate-400 leading-snug">Global Engineering & enterprise talent mesh.</p>
					</Link>

					<Link
						href="https://14-exploitability-platform.vercel.app"
						target="_blank"
						rel="noopener noreferrer"
						className="p-3.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-[#43bbd1]/50 transition group space-y-1.5"
					>
						<div className="flex items-center justify-between">
							<span className="text-xl group-hover:scale-110 transition">⚡</span>
							<span className="text-[10px] font-bold text-[#43bbd1]">External ↗</span>
						</div>
						<div className="font-bold text-sm text-white group-hover:text-[#43bbd1] transition">AXIOM Cyber Suite</div>
						<p className="text-[11px] text-slate-400 leading-snug">Exploitability platform & cATO defense.</p>
					</Link>
				</div>
			</div>

			{/* Stat cards */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<StatCard label="Total CRs" value={all.length} icon="📋" color="bg-[#030c1d] text-white" />
				<StatCard label="Pending CAB" value={cabQueue} icon="⏳" color="bg-amber-50 border-amber-200" highlight={cabQueue > 0} />
				<StatCard label="Implementing" value={implementing} icon="🔧" color="bg-blue-50 border-blue-200" highlight={implementing > 0} />
				<StatCard label="This Week" value={thisWeek} icon="📅" color="bg-purple-50 border-purple-200" />
			</div>

			{/* State breakdown */}
			<div className="grid grid-cols-4 md:grid-cols-8 gap-2">
				{STATES.map(s => (
					<Link key={s} href={`/dashboard?state=${s}`}
						className={`rounded-lg p-2 text-center border hover:border-[#43bbd1] transition cursor-pointer ${sp.state === s ? "border-[#43bbd1] bg-[#43bbd1]/10" : "bg-white border-slate-200"}`}>
						<p className="text-lg font-bold text-[#030c1d]">{statCounts[s]}</p>
						<p className="text-[10px] text-slate-500 capitalize">{s}</p>
					</Link>
				))}
			</div>

			{/* Filters */}
			<div className="flex flex-wrap gap-3 items-center">
				<span className="text-sm font-semibold text-slate-500">Filter:</span>
				<FilterLinks param="state" options={STATES} current={sp.state} label="State" />
				<FilterLinks param="changeType" options={["standard","normal","emergency"]} current={sp.changeType} label="Type" />
				{(sp.state || sp.changeType || sp.category) && (
					<Link href="/dashboard" className="text-xs text-[#43bbd1] hover:underline px-2 py-1 rounded border border-[#43bbd1]">
						✕ Clear filters
					</Link>
				)}
			</div>

			{/* CR table */}
			<div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
				<div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
					<h2 className="text-sm font-bold text-slate-700">
						Change Requests ({filtered.length})
					</h2>
					<Link href="/dashboard/calendar" className="text-xs text-[#43bbd1] hover:underline font-semibold">
						📅 View Calendar →
					</Link>
				</div>

				{filtered.length === 0 ? (
					<div className="text-center py-16 text-slate-400">
						<p className="text-3xl mb-2">🔍</p>
						<p className="text-sm">No CRs match the current filters.</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="bg-slate-50 border-b border-slate-100">
									{["CHG #","Description","State","Type","Priority","Risk","Requestor","Planned Start","CAB",""].map(h => (
										<th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
											{h}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{filtered.map((cr, i) => (
									<tr key={cr._id} className={`border-b border-slate-50 hover:bg-slate-50 transition ${i % 2 === 0 ? "" : "bg-slate-25"}`}>
										<td className="px-4 py-3">
											<span className="font-mono text-xs font-bold text-[#43bbd1] bg-[#030c1d] px-2 py-0.5 rounded">
												{cr.chgNumber}
											</span>
										</td>
										<td className="px-4 py-3 max-w-[200px]">
											<p className="truncate text-slate-800 font-medium">{cr.shortDescription}</p>
											<p className="text-xs text-slate-400 truncate">{cr.category}</p>
										</td>
										<td className="px-4 py-3"><CRStatusBadge value={cr.state} type="state" /></td>
										<td className="px-4 py-3"><CRStatusBadge value={cr.changeType} type="changeType" /></td>
										<td className="px-4 py-3"><CRStatusBadge value={cr.priority} type="priority" /></td>
										<td className="px-4 py-3 text-center">
											<span className="font-bold text-slate-700">{cr.riskScore ?? "—"}</span>
										</td>
										<td className="px-4 py-3">
											<p className="text-xs text-slate-700">{cr.requestor?.name}</p>
										</td>
										<td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
											{cr.plannedStartDate ? format(new Date(cr.plannedStartDate), "MMM d, yyyy") : "TBD"}
										</td>
										<td className="px-4 py-3">
											{cr.cabDecision && <CRStatusBadge value={cr.cabDecision} type="cab" />}
										</td>
										<td className="px-4 py-3">
											<Link href={`/dashboard/${cr.chgNumber}`}
												className="text-xs text-[#43bbd1] font-semibold hover:underline whitespace-nowrap">
												Manage →
											</Link>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}

function StatCard({ label, value, icon, color, highlight }: {
	label: string; value: number; icon: string; color: string; highlight?: boolean;
}) {
	return (
		<div className={`rounded-xl p-4 border ${color} ${highlight ? "ring-2 ring-amber-400" : "border-slate-200"}`}>
			<div className="flex items-start justify-between">
				<p className="text-2xl font-bold">{value}</p>
				<span className="text-2xl">{icon}</span>
			</div>
			<p className="text-xs font-semibold opacity-70 mt-1">{label}</p>
		</div>
	);
}

function FilterLinks({ param, options, current, label }: {
	param: string; options: string[]; current?: string; label: string;
}) {
	return (
		<div className="flex items-center gap-1 flex-wrap">
			<span className="text-xs text-slate-400">{label}:</span>
			{options.map(opt => (
				<Link key={opt} href={`/dashboard?${param}=${opt}`}
					className={`text-xs px-2 py-1 rounded border capitalize transition ${current === opt ? "bg-[#030c1d] text-[#43bbd1] border-[#030c1d]" : "bg-white text-slate-600 border-slate-200 hover:border-[#43bbd1]"}`}>
					{opt}
				</Link>
			))}
		</div>
	);
}
