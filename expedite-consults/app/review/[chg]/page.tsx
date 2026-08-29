"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { CRTimeline } from "@/components/cr/CRTimeline";
import { CRStatusBadge } from "@/components/cr/CRStatusBadge";
import { format } from "date-fns";

type Decision = "approved" | "rejected" | "deferred";

interface Approval {
	chgNumber: string;
	approverName: string;
	approverEmail: string;
	decision: string;
	votedAt?: string;
	expiresAt: string;
}

export default function ReviewPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();
	const chg = params.chg as string;
	const token = searchParams.get("token") ?? "";
	const preselected = searchParams.get("decision") as Decision | null;

	const [cr, setCr] = useState<any>(null);
	const [approval, setApproval] = useState<Approval | null>(null);
	const [decision, setDecision] = useState<Decision | "">(preselected ?? "");
	const [comments, setComments] = useState("");
	const [status, setStatus] = useState<"loading" | "ready" | "submitting" | "done" | "error" | "already_voted" | "expired">("loading");
	const [errorMsg, setErrorMsg] = useState("");

	useEffect(() => {
		if (!token) { setStatus("error"); setErrorMsg("Missing token. Use the link from your email."); return; }

		Promise.all([
			fetch(`/api/cr/${chg}`).then(r => r.json()),
			fetch(`/api/cr/vote?token=${token}`).then(r => r.json()),
		]).then(([crData, approvalData]) => {
			if (crData.error) { setStatus("error"); setErrorMsg(crData.error); return; }
			if (approvalData.error) { setStatus("error"); setErrorMsg(approvalData.error); return; }

			setCr(crData);
			setApproval(approvalData);

			if (new Date(approvalData.expiresAt) < new Date()) {
				setStatus("expired"); return;
			}
			if (approvalData.decision !== "pending") {
				setStatus("already_voted"); return;
			}
			setStatus("ready");
		}).catch(() => { setStatus("error"); setErrorMsg("Failed to load CR data."); });
	}, [chg, token]);

	async function submitVote() {
		if (!decision) return;
		setStatus("submitting");
		try {
			const res = await fetch("/api/cr/vote", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token, decision, comments }),
			});
			const data = await res.json();
			if (!res.ok) { setStatus("error"); setErrorMsg(data.error); return; }
			setStatus("done");
		} catch {
			setStatus("error");
			setErrorMsg("Submission failed. Please try again.");
		}
	}

	const riskColor = cr?.riskScore >= 7 ? "text-red-500" : cr?.riskScore >= 4 ? "text-amber-500" : "text-green-500";

	// ── Loading ─────────────────────────────────────────────────────────────
	if (status === "loading") return (
		<div className="min-h-screen bg-[#030c1d] flex items-center justify-center">
			<div className="text-center">
				<p className="text-4xl mb-3 animate-spin">⚙️</p>
				<p className="text-white/50 text-sm">Loading change request…</p>
			</div>
		</div>
	);

	// ── Error ────────────────────────────────────────────────────────────────
	if (status === "error") return (
		<div className="min-h-screen bg-[#030c1d] flex items-center justify-center p-4">
			<div className="max-w-sm text-center">
				<p className="text-5xl mb-4">❌</p>
				<h1 className="text-xl font-bold text-white mb-2">Invalid Approval Link</h1>
				<p className="text-white/50 text-sm">{errorMsg}</p>
			</div>
		</div>
	);

	// ── Expired ──────────────────────────────────────────────────────────────
	if (status === "expired") return (
		<div className="min-h-screen bg-[#030c1d] flex items-center justify-center p-4">
			<div className="max-w-sm text-center">
				<p className="text-5xl mb-4">⏰</p>
				<h1 className="text-xl font-bold text-white mb-2">Approval Link Expired</h1>
				<p className="text-white/50 text-sm">This link expired on {approval?.expiresAt ? format(new Date(approval.expiresAt), "MMM d, yyyy") : ""}. Ask the Change Manager to resend it.</p>
			</div>
		</div>
	);

	// ── Already voted ────────────────────────────────────────────────────────
	if (status === "already_voted") {
		const icon = approval?.decision === "approved" ? "✅" : approval?.decision === "rejected" ? "❌" : "⏸️";
		return (
			<div className="min-h-screen bg-[#030c1d] flex items-center justify-center p-4">
				<div className="max-w-sm text-center">
					<p className="text-5xl mb-4">{icon}</p>
					<h1 className="text-xl font-bold text-white mb-2">Already Voted</h1>
					<p className="text-white/50 text-sm">
						You voted <strong className="text-white">{approval?.decision?.toUpperCase()}</strong> on{" "}
						{approval?.votedAt ? format(new Date(approval.votedAt), "MMM d, yyyy 'at' h:mm a") : "—"}.
					</p>
					<p className="text-white/30 text-xs mt-3">Contact the Change Manager if you need to change your vote.</p>
				</div>
			</div>
		);
	}

	// ── Done (submitted) ─────────────────────────────────────────────────────
	if (status === "done") {
		const icon = decision === "approved" ? "✅" : decision === "rejected" ? "❌" : "⏸️";
		const msg  = decision === "approved" ? "Your approval has been recorded." : decision === "rejected" ? "Your rejection has been recorded. The Change Manager has been notified." : "Your deferral has been recorded.";
		return (
			<div className="min-h-screen bg-[#030c1d] flex items-center justify-center p-4">
				<div className="max-w-sm text-center">
					<p className="text-5xl mb-4">{icon}</p>
					<h1 className="text-xl font-bold text-white mb-2">Vote Recorded — {decision.toUpperCase()}</h1>
					<p className="text-white/50 text-sm">{msg}</p>
					<p className="text-white/30 text-xs mt-4">CHG: {chg} · {format(new Date(), "MMM d, yyyy 'at' h:mm a")}</p>
				</div>
			</div>
		);
	}

	// ── Main review page ─────────────────────────────────────────────────────
	return (
		<div className="min-h-screen bg-slate-50">
			{/* Header */}
			<div className="bg-[#030c1d] px-6 py-4 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<span className="text-[#43bbd1] text-xl">⚙️</span>
					<div>
						<p className="text-sm font-bold text-white leading-none">IT Change Management</p>
						<p className="text-[10px] text-white/40">CAB Review Portal · ITIL v4</p>
					</div>
				</div>
				<div className="text-right">
					<p className="text-xs text-white/40">Reviewing as</p>
					<p className="text-xs font-semibold text-[#43bbd1]">{approval?.approverEmail}</p>
				</div>
			</div>

			<div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

				{/* CR Header card */}
				<div className="bg-[#030c1d] rounded-2xl p-6 text-white">
					<div className="flex items-start justify-between gap-4 flex-wrap">
						<div className="flex-1">
							<div className="flex items-center gap-2 mb-2 flex-wrap">
								<span className="font-mono text-sm bg-[#43bbd1]/20 text-[#43bbd1] px-2 py-0.5 rounded font-bold">{cr?.chgNumber}</span>
								<CRStatusBadge type="state" value={cr?.state} />
								<CRStatusBadge type="changeType" value={cr?.changeType} />
								<CRStatusBadge type="priority" value={cr?.priority} />
							</div>
							<h1 className="text-xl font-bold text-white">{cr?.shortDescription}</h1>
							<p className="text-sm text-white/50 mt-1">
								Submitted by {cr?.requestor?.name} · {cr?._createdAt ? format(new Date(cr._createdAt), "MMM d, yyyy") : ""}
							</p>
						</div>
						<div className="text-center bg-white/5 rounded-xl px-5 py-3 border border-white/10">
							<p className="text-xs text-white/40 uppercase tracking-wider">Risk Score</p>
							<p className={`text-4xl font-black ${riskColor}`}>{cr?.riskScore ?? "—"}</p>
							<p className="text-xs text-white/40">/10</p>
						</div>
					</div>
				</div>

				{/* Timeline */}
				{cr && <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
					<h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Change Lifecycle</h2>
					<CRTimeline currentPhase={cr.state} />
				</div>}

				{/* Details grid */}
				<div className="grid md:grid-cols-2 gap-6">
					<div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3">
						<h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Change Details</h2>
						{[
							["Category",        cr?.category],
							["Configuration Item", cr?.configurationItem],
							["Assignment Group", cr?.assignmentGroup],
							["Affected Users",   cr?.affectedUsers],
							["User Impact",      cr?.impactDescription],
						].map(([label, val]) => val && (
							<div key={label}>
								<p className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</p>
								<p className="text-sm text-slate-700 font-medium">{val}</p>
							</div>
						))}
					</div>
					<div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3">
						<h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Schedule</h2>
						{[
							["Planned Start", cr?.plannedStartDate ? format(new Date(cr.plannedStartDate), "MMM d, yyyy HH:mm") : null],
							["Planned End",   cr?.plannedEndDate   ? format(new Date(cr.plannedEndDate),   "MMM d, yyyy HH:mm") : null],
							["Change Type",   cr?.changeType],
							["Priority",      cr?.priority],
						].map(([label, val]) => val && (
							<div key={label}>
								<p className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</p>
								<p className="text-sm text-slate-700 font-medium">{val}</p>
							</div>
						))}
					</div>
				</div>

				{/* Plans */}
				{[
					{ label: "Description of Change", content: cr?.description, border: "border-[#43bbd1]" },
					{ label: "Implementation Plan",   content: cr?.implementationPlan, border: "border-blue-400" },
					{ label: "Backout / Rollback Plan", content: cr?.backoutPlan, border: "border-red-400" },
					{ label: "Test Plan",             content: cr?.testPlan, border: "border-green-400" },
				].filter(p => p.content).map(plan => (
					<div key={plan.label} className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 border-l-4 ${plan.border}`}>
						<h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{plan.label}</h2>
						<p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{plan.content}</p>
					</div>
				))}

				{/* ── Vote form ─────────────────────────────────────────────────── */}
				<div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100" id="vote">
					<h2 className="text-sm font-bold text-slate-800 mb-1">Cast Your Vote</h2>
					<p className="text-xs text-slate-400 mb-5">
						Voting as <span className="font-semibold text-slate-600">{approval?.approverName}</span> · {approval?.approverEmail}
					</p>

					{/* Decision selector */}
					<div className="grid grid-cols-3 gap-3 mb-5">
						{([
							{ value: "approved", label: "Approve", icon: "✅", bg: "bg-green-50 border-green-500 text-green-700" },
							{ value: "rejected", label: "Reject",  icon: "❌", bg: "bg-red-50 border-red-500 text-red-700"     },
							{ value: "deferred", label: "Defer",   icon: "⏸️", bg: "bg-amber-50 border-amber-500 text-amber-700" },
						] as const).map(opt => (
							<button
								key={opt.value}
								onClick={() => setDecision(opt.value)}
								className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 font-bold text-sm transition ${
									decision === opt.value ? opt.bg + " shadow-md scale-105" : "border-slate-200 text-slate-400 hover:border-slate-300"
								}`}
							>
								<span className="text-xl">{opt.icon}</span>
								{opt.label}
							</button>
						))}
					</div>

					{/* Comments */}
					<div className="mb-5">
						<label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
							Comments {decision === "rejected" || decision === "deferred" ? "(Required)" : "(Optional)"}
						</label>
						<textarea
							rows={3}
							value={comments}
							onChange={e => setComments(e.target.value)}
							placeholder="Provide justification, concerns, or conditions for your vote…"
							className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43bbd1] resize-none"
						/>
					</div>

					<button
						onClick={submitVote}
						disabled={!decision || status === "submitting" || ((decision === "rejected" || decision === "deferred") && !comments.trim())}
						className="w-full bg-[#030c1d] text-[#43bbd1] font-bold py-3 rounded-xl text-sm hover:bg-[#43bbd1] hover:text-[#030c1d] transition disabled:opacity-40"
					>
						{status === "submitting" ? "Submitting…" : decision ? `Submit ${decision.toUpperCase()} Vote →` : "Select a decision above"}
					</button>
					{(decision === "rejected" || decision === "deferred") && !comments.trim() && (
						<p className="text-xs text-amber-600 text-center mt-2">Comments are required for Reject/Defer votes.</p>
					)}
				</div>

				{/* Expiry note */}
				<p className="text-center text-xs text-slate-400">
					This approval link expires on {approval?.expiresAt ? format(new Date(approval.expiresAt), "MMMM d, yyyy") : ""}
				</p>
			</div>
		</div>
	);
}
