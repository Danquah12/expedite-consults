"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RiskCalculator } from "@/components/cr/RiskCalculator";

// ── Zod schema ────────────────────────────────────────────────────────────────

const CRSchema = z.object({
	// Step 1
	shortDescription: z.string().min(5, "Must be at least 5 characters").max(200),
	description: z.string().min(10, "Please provide a fuller description"),
	justification: z.string().min(10, "Justification is required"),
	category: z.string().min(1, "Select a category"),
	priority: z.string().min(1, "Select a priority"),
	configurationItem: z.string().optional(),
	assignmentGroup: z.string().optional(),
	// Step 2
	implementationPlan: z.string().min(10, "Implementation plan is required"),
	backoutPlan: z.string().min(10, "Backout plan is required"),
	testPlan: z.string().min(10, "Test plan is required"),
	// Step 3
	plannedStartDate: z.string().min(1, "Planned start date is required"),
	plannedEndDate: z.string().min(1, "Planned end date is required"),
	affectedUsers: z.string().min(1, "Select affected user scope"),
	affectedUserDetails: z.string().optional(),
	impactDescription: z.string().min(10, "Describe the user impact"),
	// Requestor
	requestorName: z.string().min(2, "Name is required"),
	requestorEmail: z.string().email("Valid email required"),
	requestorDepartment: z.string().optional(),
});

type CRFormValues = z.infer<typeof CRSchema>;

const CATEGORIES = [
	{ value: "servers",      label: "Servers & Infrastructure" },
	{ value: "network",      label: "Network & Firewalls" },
	{ value: "applications", label: "Applications & Databases" },
	{ value: "cloud",        label: "Cloud & Virtualization" },
	{ value: "security",     label: "Security & Compliance" },
	{ value: "end-user",     label: "End-User Systems" },
	{ value: "email",        label: "Email & Collaboration" },
	{ value: "integrations", label: "Integrations" },
];

const PRIORITIES = [
	{ value: "low",      label: "Low" },
	{ value: "medium",   label: "Medium" },
	{ value: "high",     label: "High" },
	{ value: "critical", label: "Critical" },
];

const AFFECTED_USERS = [
	{ value: "none",       label: "No User Impact" },
	{ value: "group",      label: "Specific Group" },
	{ value: "department", label: "Department Only" },
	{ value: "all",        label: "All Users" },
];

const STEPS = [
	{ num: 1, label: "Details",  icon: "📋" },
	{ num: 2, label: "Plans",    icon: "📝" },
	{ num: 3, label: "Schedule", icon: "📅" },
];

// ── Input / Textarea helpers ───────────────────────────────────────────────────

function Field({ label, error, children, hint }: { label: string; error?: string; children: React.ReactNode; hint?: string }) {
	return (
		<div>
			<label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
			{children}
			{hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
			{error && <p className="mt-1 text-xs text-red-600">{error}</p>}
		</div>
	);
}

const inputCls = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#43bbd1] focus:border-[#43bbd1] transition bg-white";

// ── Main Component ────────────────────────────────────────────────────────────

export default function NewCRPage() {
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [submitting, setSubmitting] = useState(false);
	const [riskData, setRiskData] = useState({
		impact: 1, downtime: 1, complexity: 1, reversibility: 1, score: 1, changeType: "standard" as const,
	});

	const {
		register,
		handleSubmit,
		trigger,
		formState: { errors },
	} = useForm<CRFormValues>({ resolver: zodResolver(CRSchema) });

	async function nextStep() {
		const stepFields: Record<number, (keyof CRFormValues)[]> = {
			1: ["shortDescription","description","justification","category","priority","requestorName","requestorEmail"],
			2: ["implementationPlan","backoutPlan","testPlan"],
		};
		const valid = await trigger(stepFields[step]);
		if (valid) setStep(s => s + 1);
	}

	async function onSubmit(data: CRFormValues) {
		setSubmitting(true);
		try {
			const res = await fetch("/api/cr", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					shortDescription: data.shortDescription,
					description: data.description,
					justification: data.justification,
					category: data.category,
					priority: data.priority,
					configurationItem: data.configurationItem,
					assignmentGroup: data.assignmentGroup,
					implementationPlan: data.implementationPlan,
					backoutPlan: data.backoutPlan,
					testPlan: data.testPlan,
					plannedStartDate: data.plannedStartDate,
					plannedEndDate: data.plannedEndDate,
					affectedUsers: data.affectedUsers,
					affectedUserDetails: data.affectedUserDetails,
					impactDescription: data.impactDescription,
					requestor: {
						name: data.requestorName,
						email: data.requestorEmail,
						department: data.requestorDepartment,
					},
					riskAssessment: riskData,
				}),
			});

			const result = await res.json();
			if (!res.ok) throw new Error(result.error);
			router.push(`/portal/${result.chgNumber}`);
		} catch (e) {
			console.error(e);
			alert("Failed to submit CR. Please try again.");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="max-w-2xl mx-auto">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-2xl font-bold text-[#030c1d]">Submit New Change Request</h1>
				<p className="text-sm text-slate-500 mt-1">Complete all three steps to submit your CR for review.</p>
			</div>

			{/* Step indicators */}
			<div className="flex items-center gap-2 mb-8">
				{STEPS.map((s, i) => (
					<div key={s.num} className="flex items-center gap-2 flex-1">
						<div className={`flex items-center gap-2 flex-1 rounded-lg px-3 py-2 border transition-all ${
							step === s.num
								? "bg-[#030c1d] border-[#43bbd1] text-white"
								: step > s.num
								? "bg-[#43bbd1]/10 border-[#43bbd1] text-[#030c1d]"
								: "bg-white border-slate-200 text-slate-400"
						}`}>
							<span className="text-base">{s.icon}</span>
							<span className="text-xs font-semibold hidden sm:block">{s.label}</span>
							<span className="text-xs ml-auto font-bold">{s.num}</span>
						</div>
						{i < STEPS.length - 1 && <div className="w-4 h-px bg-slate-200 flex-shrink-0" />}
					</div>
				))}
			</div>

			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">

					{/* ── Step 1: Details ─────────────────────────────────────────────── */}
					{step === 1 && (
						<>
							<h2 className="text-base font-bold text-[#030c1d] pb-2 border-b border-slate-100">
								📋 Step 1: Change Details
							</h2>

							<Field label="Short Description *" error={errors.shortDescription?.message}>
								<input {...register("shortDescription")} placeholder="Brief one-line summary of the change" className={inputCls} />
							</Field>

							<Field label="Description *" error={errors.description?.message}>
								<textarea {...register("description")} rows={4} placeholder="Full description of what will be changed" className={inputCls} />
							</Field>

							<Field label="Justification *" error={errors.justification?.message}>
								<textarea {...register("justification")} rows={3} placeholder="Business reason for this change" className={inputCls} />
							</Field>

							<div className="grid grid-cols-2 gap-4">
								<Field label="Category *" error={errors.category?.message}>
									<select {...register("category")} className={inputCls}>
										<option value="">Select…</option>
										{CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
									</select>
								</Field>

								<Field label="Priority *" error={errors.priority?.message}>
									<select {...register("priority")} className={inputCls}>
										<option value="">Select…</option>
										{PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
									</select>
								</Field>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<Field label="Configuration Item (CMDB)" error={errors.configurationItem?.message}
									hint="Server name, app name, etc.">
									<input {...register("configurationItem")} placeholder="e.g. WEB-PROD-01" className={inputCls} />
								</Field>
								<Field label="Assignment Group" error={errors.assignmentGroup?.message}>
									<input {...register("assignmentGroup")} placeholder="e.g. Windows Server Team" className={inputCls} />
								</Field>
							</div>

							<div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
								<Field label="Your Name *" error={errors.requestorName?.message}>
									<input {...register("requestorName")} placeholder="Full name" className={inputCls} />
								</Field>
								<Field label="Your Email *" error={errors.requestorEmail?.message}>
									<input {...register("requestorEmail")} type="email" placeholder="you@company.com" className={inputCls} />
								</Field>
								<Field label="Department">
									<input {...register("requestorDepartment")} placeholder="e.g. IT Operations" className={inputCls} />
								</Field>
							</div>
						</>
					)}

					{/* ── Step 2: Plans ────────────────────────────────────────────────── */}
					{step === 2 && (
						<>
							<h2 className="text-base font-bold text-[#030c1d] pb-2 border-b border-slate-100">
								📝 Step 2: Implementation & Plans
							</h2>

							<Field label="Implementation Plan *" error={errors.implementationPlan?.message}
								hint="Step-by-step instructions for implementing the change">
								<textarea {...register("implementationPlan")} rows={6} placeholder="1. Stop the service&#10;2. Apply patch&#10;3. Restart service&#10;..." className={inputCls} />
							</Field>

							<Field label="Backout Plan *" error={errors.backoutPlan?.message}
								hint="How will you reverse this change if it fails?">
								<textarea {...register("backoutPlan")} rows={4} placeholder="1. Restore from backup&#10;2. Roll back configuration..." className={inputCls} />
							</Field>

							<Field label="Test Plan *" error={errors.testPlan?.message}
								hint="How will you verify the change was successful?">
								<textarea {...register("testPlan")} rows={4} placeholder="1. Verify service is running&#10;2. Test user login..." className={inputCls} />
							</Field>

							{/* Risk Calculator */}
							<div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
								<h3 className="text-sm font-bold text-slate-700 mb-4">⚖️ Risk Assessment</h3>
								<RiskCalculator onChange={setRiskData} />
							</div>
						</>
					)}

					{/* ── Step 3: Schedule ─────────────────────────────────────────────── */}
					{step === 3 && (
						<>
							<h2 className="text-base font-bold text-[#030c1d] pb-2 border-b border-slate-100">
								📅 Step 3: Schedule & Impact
							</h2>

							<div className="grid grid-cols-2 gap-4">
								<Field label="Planned Start Date/Time *" error={errors.plannedStartDate?.message}>
									<input {...register("plannedStartDate")} type="datetime-local" className={inputCls} />
								</Field>
								<Field label="Planned End Date/Time *" error={errors.plannedEndDate?.message}>
									<input {...register("plannedEndDate")} type="datetime-local" className={inputCls} />
								</Field>
							</div>

							<Field label="Affected Users *" error={errors.affectedUsers?.message}>
								<select {...register("affectedUsers")} className={inputCls}>
									<option value="">Select scope…</option>
									{AFFECTED_USERS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
								</select>
							</Field>

							<Field label="Affected Group / Department Details" error={errors.affectedUserDetails?.message}
								hint="Specific department, group name, or user list">
								<input {...register("affectedUserDetails")} placeholder="e.g. Finance Department, or leave blank for all" className={inputCls} />
							</Field>

							<Field label="Impact Description *" error={errors.impactDescription?.message}
								hint="What will users experience during the change window?">
								<textarea {...register("impactDescription")} rows={3} placeholder="e.g. Users will be unable to access the VPN for approximately 30 minutes." className={inputCls} />
							</Field>

							{/* Summary card */}
							<div className="bg-[#030c1d] rounded-xl p-4 text-white space-y-2">
								<p className="text-xs font-semibold text-[#43bbd1] uppercase tracking-wider">Risk Summary</p>
								<div className="flex items-center gap-3">
									<span className="text-2xl font-bold">{riskData.score}/10</span>
									<span className={`px-3 py-1 rounded-full text-xs font-bold ${
										riskData.changeType === "emergency" ? "bg-red-600" :
										riskData.changeType === "normal" ? "bg-amber-500 text-slate-900" :
										"bg-green-600"
									}`}>
										{riskData.changeType.toUpperCase()} CHANGE
									</span>
								</div>
								<p className="text-xs text-white/50">
									{riskData.changeType === "standard"  && "Auto-approved — No CAB review needed."}
									{riskData.changeType === "normal"    && "Will be presented to CAB for review."}
									{riskData.changeType === "emergency" && "ECAB will be convened for expedited approval."}
								</p>
							</div>
						</>
					)}
				</div>

				{/* Navigation buttons */}
				<div className="flex items-center justify-between mt-6">
					<button
						type="button"
						onClick={() => setStep(s => s - 1)}
						className={`px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition ${step === 1 ? "invisible" : ""}`}
					>
						← Back
					</button>

					{step < 3 ? (
						<button
							type="button"
							onClick={nextStep}
							className="px-6 py-2.5 bg-[#030c1d] text-[#43bbd1] font-semibold rounded-lg text-sm hover:bg-[#43bbd1] hover:text-[#030c1d] transition"
						>
							Next →
						</button>
					) : (
						<button
							type="submit"
							disabled={submitting}
							className="px-6 py-2.5 bg-[#43bbd1] text-[#030c1d] font-bold rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
						>
							{submitting ? "Submitting…" : "✅ Submit Change Request"}
						</button>
					)}
				</div>
			</form>
		</div>
	);
}
