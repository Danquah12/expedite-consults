"use client";

import { useState, useEffect } from "react";
import { notFound, useRouter, useParams } from "next/navigation";
import { CRTimeline } from "@/components/cr/CRTimeline";
import { CRStatusBadge } from "@/components/cr/CRStatusBadge";
import { WorkNotesFeed } from "@/components/cr/WorkNotesFeed";
import { format } from "date-fns";

interface CR {
	_id: string;
	chgNumber: string;
	state: string;
	changeType: string;
	category: string;
	priority: string;
	riskScore: number;
	shortDescription: string;
	description: string;
	justification: string;
	implementationPlan: string;
	backoutPlan: string;
	testPlan: string;
	configurationItem: string;
	assignmentGroup: string;
	assignedTo: string;
	requestor: { name: string; email: string; department?: string };
	affectedUsers: string;
	affectedUserDetails: string;
	impactDescription: string;
	plannedStartDate: string;
	plannedEndDate: string;
	actualStartDate: string;
	actualEndDate: string;
	cabDecision: string;
	cabComments: string;
	approvals: any[];
	closeCode: string;
	closeNotes: string;
	pirRequired: boolean;
	pirDate: string;
	workNotes: any[];
	_createdAt: string;
}

const STATE_TRANSITIONS: Record<string, string[]> = {
	new:       ["assess"],
	assess:    ["plan", "new"],
	plan:      ["approve", "assess"],
	approve:   ["scheduled", "assess"],
	scheduled: ["implement", "approve"],
	implement: ["review", "scheduled"],
	review:    ["closed"],
	closed:    [],
};

export default function DashboardCRDetailPage() {
	const rawParams = useParams();
	const chg = rawParams.chg as string;
	const router = useRouter();
	const [cr, setCr] = useState<CR | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [activeTab, setActiveTab] = useState<"overview"|"plans"|"approve"|"notes"|"close">("overview");

	// CAB form
	const [cabDecision, setCabDecision] = useState("");
	const [cabComments, setCabComments] = useState("");
	const [stakeholderEmails, setStakeholderEmails] = useState("");

	// Work note form
	const [noteText, setNoteText] = useState("");
	const [noteAuthor, setNoteAuthor] = useState("Change Manager");
	const [noteType, setNoteType] = useState("work_note");

	// Assignment
	const [assignedTo, setAssignedTo] = useState("");
	const [assignedToEmail, setAssignedToEmail] = useState("");

	// Closure
	const [closeCode, setCloseCode] = useState("");
	const [closeNotes, setCloseNotes] = useState("");
	const [pirRequired, setPirRequired] = useState(false);
	const [pirDate, setPirDate] = useState("");

	// Approver management
	const [approvers, setApprovers] = useState<{ name: string; email: string }[]>([
		{ name: "", email: "" }
	]);
	const [votes, setVotes] = useState<any[]>([]);
	const [sendingApproval, setSendingApproval] = useState(false);

	useEffect(() => {
		fetch(`/api/cr/${chg}`)
			.then(r => r.json())
			.then(data => { setCr(data); setLoading(false); })
			.catch(() => setLoading(false));

		// Fetch individual votes
		fetch(`/api/cr/${chg}/votes`)
			.then(r => r.json())
			.then(data => { if (Array.isArray(data)) setVotes(data); })
			.catch(() => {});
	}, [chg]);

	async function sendApprovalRequests() {
		const valid = approvers.filter(a => a.email.trim() && a.name.trim());
		if (!valid.length) { alert("Add at least one approver with name and email."); return; }
		setSendingApproval(true);
		try {
			const res = await fetch(`/api/cr/${chg}/send-approval`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ approvers: valid }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);
			alert(`✅ Approval requests sent to ${valid.length} approver(s)`);
			// Refresh votes
			fetch(`/api/cr/${chg}/votes`).then(r => r.json()).then(d => { if (Array.isArray(d)) setVotes(d); });
		} catch (e) {
			alert(`Error: ${(e as Error).message}`);
		} finally {
			setSendingApproval(false);
		}
	}

	async function patchCR(body: object) {
		setSaving(true);
		try {
			const res = await fetch(`/api/cr/${chg}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);
			// Refresh
			const refreshed = await fetch(`/api/cr/${chg}`).then(r => r.json());
			setCr(refreshed);
		} catch (e) {
			alert(`Error: ${(e as Error).message}`);
		} finally {
			setSaving(false);
		}
	}

	async function handleStateTransition(newState: string) {
		if (!confirm(`Move CR to "${newState.toUpperCase()}"?`)) return;
		await patchCR({ state: newState, updatedBy: noteAuthor });
	}

	async function handleCABDecision() {
		if (!cabDecision) return alert("Select a decision.");
		await patchCR({
			cabDecision,
			cabComments,
			stakeholderEmails: stakeholderEmails.split(",").map(e => e.trim()).filter(Boolean),
			updatedBy: noteAuthor,
		});
		setCabDecision(""); setCabComments("");
	}

	async function handleAddNote() {
		if (!noteText.trim()) return;
		await patchCR({ workNote: noteText, updatedBy: noteAuthor, noteType });
		setNoteText("");
	}

	async function handleAssign() {
		if (!assignedTo.trim()) return;
		await patchCR({ assignedTo, assignedToEmail, updatedBy: noteAuthor });
		setAssignedTo(""); setAssignedToEmail("");
	}

	async function handleClose() {
		if (!closeCode) return alert("Select a close code.");
		if (!closeNotes.trim()) return alert("Close notes are required.");
		await patchCR({
			state: "closed",
			closeCode, closeNotes, pirRequired,
			pirDate: pirRequired ? pirDate : undefined,
			updatedBy: noteAuthor,
		});
	}

	if (loading) return <div className="flex items-center justify-center py-20 text-slate-400">Loading CR…</div>;
	if (!cr) return <div className="text-center py-20 text-red-500">CR not found.</div>;

	const nextStates = STATE_TRANSITIONS[cr.state] ?? [];
	const tabs = [
		{ key: "overview", label: "Overview",  icon: "📋" },
		{ key: "plans",    label: "Plans",     icon: "📝" },
		{ key: "approve",  label: "CAB/Approve",icon: "✅" },
		{ key: "notes",    label: "Work Notes", icon: "💬" },
		{ key: "close",    label: "Close CR",   icon: "🏁" },
	] as const;

	const inputCls = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#43bbd1] focus:border-[#43bbd1] transition bg-white";

	return (
		<div className="max-w-5xl mx-auto space-y-6">
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
							{cr.requestor?.name} · {cr.requestor?.email} · Submitted {format(new Date(cr._createdAt), "MMM d, yyyy")}
						</p>
					</div>
					<div className="text-center bg-white/10 rounded-xl px-5 py-3 flex-shrink-0">
						<p className="text-xs text-white/50">Risk</p>
						<p className="text-3xl font-bold text-[#43bbd1]">{cr.riskScore ?? "—"}</p>
						<p className="text-xs text-white/50">/10</p>
					</div>
				</div>

				{/* State transition buttons */}
				{nextStates.length > 0 && cr.state !== "closed" && (
					<div className="mt-5 pt-5 border-t border-white/10 flex items-center gap-3 flex-wrap">
						<span className="text-xs text-white/40">Advance state:</span>
						{nextStates.map(s => (
							<button
								key={s}
								onClick={() => handleStateTransition(s)}
								disabled={saving}
								className="px-4 py-1.5 bg-[#43bbd1] text-[#030c1d] text-xs font-bold rounded-lg hover:opacity-80 transition capitalize disabled:opacity-50"
							>
								→ {s.toUpperCase()}
							</button>
						))}
					</div>
				)}
			</div>

			{/* Timeline */}
			<div className="bg-white rounded-2xl border border-slate-200 p-6">
				<CRTimeline currentState={cr.state} />
			</div>

			{/* Tabs */}
			<div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
				{/* Tab bar */}
				<div className="flex border-b border-slate-100 overflow-x-auto">
					{tabs.map(tab => (
						<button
							key={tab.key}
							onClick={() => setActiveTab(tab.key)}
							className={`px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition border-b-2 ${
								activeTab === tab.key
									? "border-[#43bbd1] text-[#030c1d]"
									: "border-transparent text-slate-500 hover:text-slate-700"
							}`}
						>
							{tab.icon} {tab.label}
						</button>
					))}
				</div>

				<div className="p-6">
					{/* ── Overview tab ─────────────────────────────────────────────── */}
					{activeTab === "overview" && (
						<div className="space-y-5">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
								<div className="space-y-3">
									<h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assignment</h3>
									<Detail label="Assignment Group" value={cr.assignmentGroup || "—"} />
									<Detail label="Assigned To" value={cr.assignedTo || "Unassigned"} />
									<Detail label="Category" value={cr.category} />
									<Detail label="Config Item" value={cr.configurationItem || "—"} />
								</div>
								<div className="space-y-3">
									<h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Schedule</h3>
									<Detail label="Planned Start" value={cr.plannedStartDate ? format(new Date(cr.plannedStartDate), "MMM d, yyyy HH:mm") : "TBD"} />
									<Detail label="Planned End"   value={cr.plannedEndDate   ? format(new Date(cr.plannedEndDate),   "MMM d, yyyy HH:mm") : "TBD"} />
									<Detail label="Affected Users" value={cr.affectedUsers} />
									<Detail label="Impact" value={cr.impactDescription || "—"} />
								</div>
							</div>

							{/* Assign engineer */}
							<div className="border-t border-slate-100 pt-4">
								<h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Assign Engineer</h3>
								<div className="grid grid-cols-3 gap-3">
									<input value={assignedTo} onChange={e => setAssignedTo(e.target.value)} placeholder="Engineer name" className={inputCls} />
									<input value={assignedToEmail} onChange={e => setAssignedToEmail(e.target.value)} placeholder="Email (for notification)" className={inputCls} />
									<button onClick={handleAssign} disabled={saving} className="px-4 py-2 bg-[#030c1d] text-[#43bbd1] text-sm font-semibold rounded-lg hover:bg-[#43bbd1] hover:text-[#030c1d] transition disabled:opacity-50">
										Assign →
									</button>
								</div>
							</div>
						</div>
					)}

					{/* ── Plans tab ─────────────────────────────────────────────────── */}
					{activeTab === "plans" && (
						<div className="space-y-5">
							<PlanBlock title="📝 Description" content={cr.description} />
							<PlanBlock title="✅ Justification" content={cr.justification} />
							<PlanBlock title="🔧 Implementation Plan" content={cr.implementationPlan} />
							<PlanBlock title="🔙 Backout Plan" content={cr.backoutPlan} />
							<PlanBlock title="🧪 Test Plan" content={cr.testPlan} />
						</div>
					)}

					{/* ── CAB / Approve tab ─────────────────────────────────────────── */}
					{activeTab === "approve" && (
						<div className="space-y-6">

							{/* ── Vote tally ─────────────────────────────────────────────── */}
							{votes.length > 0 && (
								<div>
									<h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
										Individual Votes ({votes.filter(v => v.decision !== "pending").length}/{votes.length} cast)
									</h3>
									<div className="space-y-2">
										{votes.map((v: any) => {
											const icon = v.decision === "approved" ? "✅" : v.decision === "rejected" ? "❌" : v.decision === "deferred" ? "⏸️" : "⏳";
											const bg   = v.decision === "approved" ? "bg-green-50 border-green-200" : v.decision === "rejected" ? "bg-red-50 border-red-200" : v.decision === "deferred" ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200";
											return (
												<div key={v._id} className={`flex items-start gap-3 rounded-xl border p-3 ${bg}`}>
													<span className="text-lg mt-0.5">{icon}</span>
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2 flex-wrap">
															<span className="text-sm font-semibold text-slate-800">{v.approverName}</span>
															<span className="text-xs text-slate-400">{v.approverEmail}</span>
															<span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
																v.decision === "approved" ? "bg-green-100 text-green-700" :
																v.decision === "rejected" ? "bg-red-100 text-red-700" :
																v.decision === "deferred" ? "bg-amber-100 text-amber-700" :
																"bg-slate-100 text-slate-500"
															}`}>{v.decision}</span>
														</div>
														{v.comments && <p className="text-xs text-slate-600 mt-1 italic">"{v.comments}"</p>}
														{v.votedAt && <p className="text-[10px] text-slate-400 mt-0.5">{new Date(v.votedAt).toLocaleString()}</p>}
														{v.decision === "pending" && (
															<p className="text-[10px] text-slate-400 mt-0.5">Awaiting vote · Expires {new Date(v.expiresAt).toLocaleDateString()}</p>
														)}
													</div>
												</div>
											);
										})}
									</div>

									{/* Tally summary */}
									<div className="mt-3 flex items-center gap-4 text-sm font-semibold">
										<span className="text-green-600">✅ {votes.filter(v => v.decision === "approved").length} Approved</span>
										<span className="text-red-600">❌ {votes.filter(v => v.decision === "rejected").length} Rejected</span>
										<span className="text-amber-600">⏸️ {votes.filter(v => v.decision === "deferred").length} Deferred</span>
										<span className="text-slate-400">⏳ {votes.filter(v => v.decision === "pending").length} Pending</span>
									</div>
								</div>
							)}

							{/* ── Send approval requests ──────────────────────────────────── */}
							<div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
								<h3 className="text-sm font-bold text-slate-700">Send Approval Requests</h3>
								<p className="text-xs text-slate-500">Each approver receives a branded email with one-click Approve / Reject / Defer buttons and a full CR review link.</p>

								<div className="space-y-2">
									{approvers.map((a, i) => (
										<div key={i} className="grid grid-cols-5 gap-2">
											<input
												value={a.name}
												onChange={e => {
													const next = [...approvers];
													next[i] = { ...next[i], name: e.target.value };
													setApprovers(next);
												}}
												placeholder="Approver name"
												className={`col-span-2 ${inputCls}`}
											/>
											<input
												value={a.email}
												onChange={e => {
													const next = [...approvers];
													next[i] = { ...next[i], email: e.target.value };
													setApprovers(next);
												}}
												placeholder="approver@company.com"
												type="email"
												className={`col-span-2 ${inputCls}`}
											/>
											<button
												onClick={() => setApprovers(approvers.filter((_, j) => j !== i))}
												className="text-slate-400 hover:text-red-500 transition text-sm"
												title="Remove"
											>✕</button>
										</div>
									))}
								</div>

								<div className="flex items-center gap-3">
									<button
										onClick={() => setApprovers([...approvers, { name: "", email: "" }])}
										className="text-xs text-[#43bbd1] hover:underline"
									>+ Add approver</button>
									<button
										onClick={sendApprovalRequests}
										disabled={sendingApproval}
										className="px-5 py-2 bg-[#030c1d] text-[#43bbd1] font-bold rounded-lg text-sm hover:bg-[#43bbd1] hover:text-[#030c1d] transition disabled:opacity-50"
									>
										{sendingApproval ? "Sending…" : "📧 Send Approval Emails"}
									</button>
								</div>
							</div>

							{/* ── Manager final decision ──────────────────────────────────── */}
							<div className="border border-slate-200 rounded-xl p-4 space-y-4">
								<div>
									<h3 className="text-sm font-bold text-slate-700">Manager Final Decision</h3>
									<p className="text-xs text-slate-500 mt-0.5">Override or confirm the vote tally. This is the binding CAB decision that moves the CR forward.</p>
								</div>

								{cr.cabDecision && cr.cabDecision !== "pending" && (
									<div className={`rounded-xl p-3 border flex items-center gap-3 ${
										cr.cabDecision === "approved" ? "bg-green-50 border-green-200" :
										cr.cabDecision === "rejected" ? "bg-red-50 border-red-200" :
										"bg-amber-50 border-amber-200"
									}`}>
										<CRStatusBadge value={cr.cabDecision} type="cab" />
										<p className="text-sm text-slate-700">{cr.cabComments}</p>
									</div>
								)}

								<div className="grid grid-cols-3 gap-3">
									{["approved","rejected","deferred"].map(d => (
										<button
											key={d}
											onClick={() => setCabDecision(d)}
											className={`py-3 rounded-xl border-2 text-sm font-bold capitalize transition ${
												cabDecision === d
													? d === "approved" ? "bg-green-600 border-green-600 text-white"
													: d === "rejected" ? "bg-red-600 border-red-600 text-white"
													: "bg-amber-500 border-amber-500 text-white"
													: "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
											}`}
										>
											{d === "approved" ? "✅" : d === "rejected" ? "❌" : "⏸️"} {d}
										</button>
									))}
								</div>

								<textarea
									value={cabComments}
									onChange={e => setCabComments(e.target.value)}
									placeholder="Decision rationale, conditions, or deferral notes…"
									rows={3}
									className={inputCls}
								/>

								<input
									value={stakeholderEmails}
									onChange={e => setStakeholderEmails(e.target.value)}
									placeholder="Notify stakeholders (comma-separated emails)"
									className={inputCls}
								/>

								<button
									onClick={handleCABDecision}
									disabled={!cabDecision || saving}
									className="px-6 py-2.5 bg-[#030c1d] text-[#43bbd1] font-bold rounded-lg text-sm hover:bg-[#43bbd1] hover:text-[#030c1d] transition disabled:opacity-50"
								>
									{saving ? "Saving…" : "Record Final Decision →"}
								</button>
							</div>
						</div>
					)}

					{/* ── Work Notes tab ────────────────────────────────────────────── */}
					{activeTab === "notes" && (
						<div className="space-y-5">
							{/* Add note */}
							<div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
								<h3 className="text-sm font-bold text-slate-700">Add Work Note</h3>
								<div className="grid grid-cols-2 gap-3">
									<input value={noteAuthor} onChange={e => setNoteAuthor(e.target.value)} placeholder="Your name" className={inputCls} />
									<select value={noteType} onChange={e => setNoteType(e.target.value)} className={inputCls}>
										<option value="work_note">Work Note</option>
										<option value="status_update">Status Update</option>
										<option value="issue_alert">Issue Alert</option>
									</select>
								</div>
								<textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={4}
									placeholder="Enter work note…" className={inputCls} />
								<button onClick={handleAddNote} disabled={!noteText.trim() || saving}
									className="px-5 py-2 bg-[#030c1d] text-[#43bbd1] font-semibold text-sm rounded-lg hover:bg-[#43bbd1] hover:text-[#030c1d] transition disabled:opacity-50">
									{saving ? "Saving…" : "Add Note"}
								</button>
							</div>

							<WorkNotesFeed notes={cr.workNotes ?? []} />
						</div>
					)}

					{/* ── Close tab ─────────────────────────────────────────────────── */}
					{activeTab === "close" && (
						<div className="space-y-5">
							{cr.state === "closed" ? (
								<div className="text-center py-8 text-green-600">
									<p className="text-3xl mb-2">🏁</p>
									<p className="font-semibold">This CR is already closed.</p>
									<p className="text-sm text-slate-500 mt-1">Close code: {cr.closeCode?.replace(/_/g, " ")}</p>
								</div>
							) : (
								<>
									<div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
										⚠️ Closing this CR is final. Ensure validation is complete before proceeding.
									</div>

									<div>
										<label className="text-sm font-semibold text-slate-700 mb-2 block">Close Code *</label>
										<div className="grid grid-cols-3 gap-3">
											{[
												{ value: "successful", label: "✅ Successful" },
												{ value: "successful_with_issues", label: "⚠️ Successful with Issues" },
												{ value: "unsuccessful", label: "❌ Unsuccessful" },
											].map(opt => (
												<button key={opt.value} onClick={() => setCloseCode(opt.value)}
													className={`py-3 px-3 rounded-xl border-2 text-xs font-bold transition text-center ${closeCode === opt.value ? "bg-[#030c1d] border-[#43bbd1] text-[#43bbd1]" : "bg-white border-slate-200 text-slate-600"}`}>
													{opt.label}
												</button>
											))}
										</div>
									</div>

									<div>
										<label className="text-sm font-semibold text-slate-700 mb-1.5 block">Close Notes *</label>
										<textarea value={closeNotes} onChange={e => setCloseNotes(e.target.value)}
											rows={4} placeholder="Describe the outcome, any issues encountered, and lessons learned…"
											className={inputCls} />
									</div>

									<div className="flex items-center gap-3">
										<input type="checkbox" id="pir" checked={pirRequired} onChange={e => setPirRequired(e.target.checked)} className="accent-[#43bbd1]" />
										<label htmlFor="pir" className="text-sm font-semibold text-slate-700">PIR Required?</label>
										{pirRequired && (
											<input type="datetime-local" value={pirDate} onChange={e => setPirDate(e.target.value)} className={`${inputCls} max-w-xs`} />
										)}
									</div>

									<button onClick={handleClose} disabled={!closeCode || saving}
										className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700 transition disabled:opacity-50">
										{saving ? "Closing…" : "🏁 Close Change Request"}
									</button>
								</>
							)}
						</div>
					)}
				</div>
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

function PlanBlock({ title, content }: { title: string; content?: string }) {
	if (!content) return null;
	return (
		<div className="border-l-2 border-[#43bbd1] pl-4">
			<p className="text-xs font-bold text-slate-400 mb-1">{title}</p>
			<p className="text-sm text-slate-700 whitespace-pre-wrap">{content}</p>
		</div>
	);
}
