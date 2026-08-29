import { notFound } from "next/navigation";
import { crReadClient } from "@/sanity/lib/write-client";
import { CRTimeline } from "@/components/cr/CRTimeline";
import { CRStatusBadge } from "@/components/cr/CRStatusBadge";
import { WorkNotesFeed } from "@/components/cr/WorkNotesFeed";
import { format } from "date-fns";

async function getCR(chg: string) {
	return crReadClient.fetch(
		`*[_type == "changeRequest" && chgNumber == $chg][0]`,
		{ chg }
	);
}

export default async function PortalCRDetailPage({
	params,
}: {
	params: Promise<{ chg: string }>;
}) {
	const { chg } = await params;
	const cr = await getCR(chg);
	if (!cr) notFound();

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Header */}
			<div className="bg-[#030c1d] rounded-2xl p-6 text-white">
				<div className="flex items-start justify-between gap-4 flex-wrap">
					<div>
						<div className="flex items-center gap-2 mb-2 flex-wrap">
							<span className="font-mono text-lg font-bold text-[#43bbd1]">{cr.chgNumber}</span>
							<CRStatusBadge value={cr.state} type="state" />
							<CRStatusBadge value={cr.changeType} type="changeType" />
							<CRStatusBadge value={cr.priority} type="priority" />
						</div>
						<h1 className="text-xl font-bold">{cr.shortDescription}</h1>
						<p className="text-sm text-white/50 mt-1">
							Submitted by {cr.requestor?.name} · {format(new Date(cr._createdAt), "MMMM d, yyyy")}
						</p>
					</div>
					{cr.riskScore && (
						<div className="text-center bg-white/10 rounded-xl px-5 py-3">
							<p className="text-xs text-white/50">Risk Score</p>
							<p className="text-3xl font-bold text-[#43bbd1]">{cr.riskScore}</p>
							<p className="text-xs text-white/50">/10</p>
						</div>
					)}
				</div>
			</div>

			{/* Timeline */}
			<div className="bg-white rounded-2xl border border-slate-200 p-6">
				<h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-5">Change Lifecycle</h2>
				<CRTimeline currentState={cr.state} />
			</div>

			{/* CAB Decision banner */}
			{cr.cabDecision && cr.cabDecision !== "pending" && (
				<div className={`rounded-xl p-4 border flex items-center gap-3 ${
					cr.cabDecision === "approved" ? "bg-green-50 border-green-200" :
					cr.cabDecision === "rejected" ? "bg-red-50 border-red-200" :
					"bg-amber-50 border-amber-200"
				}`}>
					<CRStatusBadge value={cr.cabDecision} type="cab" />
					{cr.cabComments && (
						<p className="text-sm text-slate-700">{cr.cabComments}</p>
					)}
				</div>
			)}

			{/* Details grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Change details */}
				<div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
					<h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Change Details</h2>
					<Detail label="Category" value={cr.category?.replace(/-/g, " ")} />
					<Detail label="Configuration Item" value={cr.configurationItem || "—"} />
					<Detail label="Assignment Group" value={cr.assignmentGroup || "—"} />
					<Detail label="Assigned To" value={cr.assignedTo || "Unassigned"} />
					<Detail label="Affected Users" value={cr.affectedUsers} />
					{cr.affectedUserDetails && <Detail label="Affected Details" value={cr.affectedUserDetails} />}
				</div>

				{/* Schedule */}
				<div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
					<h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Schedule</h2>
					<Detail
						label="Planned Start"
						value={cr.plannedStartDate ? format(new Date(cr.plannedStartDate), "MMM d, yyyy HH:mm") : "TBD"}
					/>
					<Detail
						label="Planned End"
						value={cr.plannedEndDate ? format(new Date(cr.plannedEndDate), "MMM d, yyyy HH:mm") : "TBD"}
					/>
					{cr.actualStartDate && (
						<Detail label="Actual Start" value={format(new Date(cr.actualStartDate), "MMM d, yyyy HH:mm")} />
					)}
					{cr.actualEndDate && (
						<Detail label="Actual End" value={format(new Date(cr.actualEndDate), "MMM d, yyyy HH:mm")} />
					)}
					{cr.impactDescription && <Detail label="User Impact" value={cr.impactDescription} />}
				</div>
			</div>

			{/* Plans */}
			<div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
				<h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Plans</h2>
				<PlanSection title="📋 Description" content={cr.description} />
				<PlanSection title="✅ Justification" content={cr.justification} />
				<PlanSection title="🔧 Implementation Plan" content={cr.implementationPlan} />
				<PlanSection title="🔙 Backout Plan" content={cr.backoutPlan} />
				<PlanSection title="🧪 Test Plan" content={cr.testPlan} />
			</div>

			{/* Closure */}
			{cr.state === "closed" && (
				<div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
					<h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Closure</h2>
					<Detail label="Close Code" value={cr.closeCode?.replace(/_/g, " ")} />
					<Detail label="Close Notes" value={cr.closeNotes || "—"} />
					{cr.pirRequired && <Detail label="PIR Date" value={cr.pirDate ? format(new Date(cr.pirDate), "MMM d, yyyy HH:mm") : "TBD"} />}
				</div>
			)}

			{/* Work Notes */}
			<div className="bg-white rounded-2xl border border-slate-200 p-6">
				<h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
					Work Notes ({cr.workNotes?.length ?? 0})
				</h2>
				<WorkNotesFeed notes={cr.workNotes ?? []} />
			</div>
		</div>
	);
}

function Detail({ label, value }: { label: string; value?: string }) {
	return (
		<div>
			<p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
			<p className="text-sm text-slate-800 mt-0.5 capitalize">{value || "—"}</p>
		</div>
	);
}

function PlanSection({ title, content }: { title: string; content?: string }) {
	if (!content) return null;
	return (
		<div className="border-l-2 border-[#43bbd1] pl-4">
			<p className="text-xs font-semibold text-slate-500 mb-1">{title}</p>
			<p className="text-sm text-slate-700 whitespace-pre-wrap">{content}</p>
		</div>
	);
}
