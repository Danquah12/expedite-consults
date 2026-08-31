import Link from "next/link";
import { crReadClient } from "@/sanity/lib/write-client";
import { CRStatusBadge } from "@/components/cr/CRStatusBadge";
import { format } from "date-fns";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

interface CR {
	_id: string;
	chgNumber: string;
	state: string;
	changeType: string;
	priority: string;
	riskScore: number;
	shortDescription: string;
	requestor: { name: string; email: string };
	plannedStartDate: string;
	cabDecision: string;
	_createdAt: string;
}

async function getMyCRs(email: string, isManager: boolean) {
	const filter = isManager
		? `*[_type == "changeRequest"]`
		: `*[_type == "changeRequest" && requestor.email == $email]`;

	return crReadClient.fetch<CR[]>(
		`${filter} | order(_createdAt desc)[0...50] {
      _id, chgNumber, state, changeType, priority, riskScore,
      shortDescription, requestor, plannedStartDate, cabDecision, _createdAt
    }`,
		{ email }
	);
}

const STATE_GROUPS = [
	{ label: "Active",   states: ["new","assess","plan","approve","scheduled","implement","review"] },
	{ label: "Closed",   states: ["closed"] },
];

export default async function PortalPage() {
	const session = await auth();
	if (!session?.user?.email) redirect("/login");

	const role = (session.user as any).role ?? "requestor";
	const crs = await getMyCRs(session.user.email, role === "manager");

	const active = crs.filter(c => c.state !== "closed");
	const closed = crs.filter(c => c.state === "closed");

	return (
		<div className="max-w-5xl mx-auto space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-[#030c1d]">My Change Requests</h1>
					<p className="text-sm text-slate-500 mt-1">
						{crs.length} total · {active.length} active · {closed.length} closed
					</p>
				</div>
				<Link
					href="/portal/new"
					className="flex items-center gap-2 bg-[#030c1d] text-[#43bbd1] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#43bbd1] hover:text-[#030c1d] transition-colors text-sm"
				>
					➕ Submit New CR
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

			{/* Empty state */}
			{crs.length === 0 && (
				<div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
					<p className="text-5xl mb-4">📋</p>
					<h2 className="text-lg font-semibold text-slate-700">No Change Requests yet</h2>
					<p className="text-sm text-slate-500 mt-1 mb-6">Submit your first CR to get started.</p>
					<Link
						href="/portal/new"
						className="inline-flex items-center gap-2 bg-[#030c1d] text-[#43bbd1] font-semibold px-6 py-3 rounded-lg hover:bg-[#43bbd1] hover:text-[#030c1d] transition-colors"
					>
						➕ Submit New CR
					</Link>
				</div>
			)}

			{/* Active CRs */}
			{active.length > 0 && (
				<section>
					<h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
						Active ({active.length})
					</h2>
					<div className="space-y-3">
						{active.map(cr => <CRCard key={cr._id} cr={cr} />)}
					</div>
				</section>
			)}

			{/* Closed CRs */}
			{closed.length > 0 && (
				<section>
					<h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
						Closed ({closed.length})
					</h2>
					<div className="space-y-3 opacity-70">
						{closed.map(cr => <CRCard key={cr._id} cr={cr} />)}
					</div>
				</section>
			)}
		</div>
	);
}

function CRCard({ cr }: { cr: CR }) {
	return (
		<Link href={`/portal/${cr.chgNumber}`} className="block group">
			<div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-[#43bbd1] hover:shadow-md transition-all">
				<div className="flex items-start justify-between gap-4 flex-wrap">
					{/* Left */}
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-2 flex-wrap">
							<span className="font-mono text-xs font-bold text-[#43bbd1] bg-[#030c1d] px-2 py-0.5 rounded">
								{cr.chgNumber}
							</span>
							<CRStatusBadge value={cr.state} type="state" />
							<CRStatusBadge value={cr.changeType} type="changeType" />
							<CRStatusBadge value={cr.priority} type="priority" />
						</div>
						<p className="text-sm font-semibold text-slate-800 truncate">{cr.shortDescription}</p>
						<p className="text-xs text-slate-500 mt-1">
							Submitted by {cr.requestor?.name ?? "Unknown"} ·{" "}
							{format(new Date(cr._createdAt), "MMM d, yyyy")}
						</p>
					</div>

					{/* Right */}
					<div className="text-right flex-shrink-0">
						{cr.plannedStartDate && (
							<p className="text-xs text-slate-500">
								Planned: {format(new Date(cr.plannedStartDate), "MMM d, yyyy")}
							</p>
						)}
						{cr.riskScore && (
							<p className="text-xs text-slate-400 mt-0.5">
								Risk: <span className="font-bold">{cr.riskScore}/10</span>
							</p>
						)}
						<p className="text-xs text-[#43bbd1] font-medium mt-2 group-hover:underline">
							View details →
						</p>
					</div>
				</div>
			</div>
		</Link>
	);
}
