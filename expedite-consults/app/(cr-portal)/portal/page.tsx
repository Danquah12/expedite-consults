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
