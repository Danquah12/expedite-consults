"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { calculateRiskScore } from "@/lib/cr-utils";

interface RiskDimension {
	key: "impact" | "downtime" | "complexity" | "reversibility";
	label: string;
	description: string;
	hints: string[];
}

const DIMENSIONS: RiskDimension[] = [
	{
		key: "impact",
		label: "Impact",
		description: "How many users/services are affected?",
		hints: ["1 – Minimal (1-2 users)", "2 – Small group", "3 – Department", "4 – Major service", "5 – Service-wide outage"],
	},
	{
		key: "downtime",
		label: "Downtime",
		description: "Expected service disruption?",
		hints: ["1 – No downtime", "2 – <15 min", "3 – 15–60 min", "4 – 1–4 hours", "5 – Extended outage"],
	},
	{
		key: "complexity",
		label: "Complexity",
		description: "How technically complex is this change?",
		hints: ["1 – Simple (one step)", "2 – A few steps", "3 – Multi-system", "4 – Complex dependencies", "5 – Highly complex"],
	},
	{
		key: "reversibility",
		label: "Reversibility",
		description: "Can the change be rolled back easily?",
		hints: ["1 – Instant rollback", "2 – Easy rollback", "3 – Moderate effort", "4 – Difficult", "5 – Irreversible"],
	},
];

const CHANGE_TYPE_COLOR: Record<string, string> = {
	standard:  "text-green-600 bg-green-50 border-green-200",
	normal:    "text-amber-600 bg-amber-50 border-amber-200",
	emergency: "text-red-600 bg-red-50 border-red-200",
};

interface RiskCalculatorProps {
	onChange?: (values: {
		impact: number; downtime: number; complexity: number; reversibility: number;
		score: number; changeType: "standard" | "normal" | "emergency";
	}) => void;
	className?: string;
}

export function RiskCalculator({ onChange, className }: RiskCalculatorProps) {
	const [values, setValues] = useState({ impact: 1, downtime: 1, complexity: 1, reversibility: 1 });

	const { score, changeType } = calculateRiskScore(
		values.impact, values.downtime, values.complexity, values.reversibility
	);

	function handleChange(key: keyof typeof values, val: number) {
		const next = { ...values, [key]: val };
		setValues(next);
		const result = calculateRiskScore(next.impact, next.downtime, next.complexity, next.reversibility);
		onChange?.({ ...next, ...result });
	}

	const scorePercent = (score / 10) * 100;
	const barColor = changeType === "emergency" ? "bg-red-500" : changeType === "normal" ? "bg-amber-500" : "bg-green-500";

	return (
		<div className={cn("space-y-6", className)}>
			{/* Dimensions */}
			{DIMENSIONS.map((dim) => (
				<div key={dim.key}>
					<div className="flex items-center justify-between mb-1">
						<label className="text-sm font-semibold text-slate-700">{dim.label}</label>
						<span className="text-xs text-slate-500 max-w-[200px] text-right">{dim.description}</span>
					</div>

					{/* Slider */}
					<div className="flex items-center gap-3">
						<input
							type="range"
							min={1}
							max={5}
							step={1}
							value={values[dim.key]}
							onChange={(e) => handleChange(dim.key, parseInt(e.target.value))}
							className="flex-1 accent-[#43bbd1]"
						/>
						<span className="w-6 text-center font-bold text-[#030c1d]">{values[dim.key]}</span>
					</div>

					{/* Hint */}
					<p className="mt-1 text-xs text-slate-500">
						{dim.hints[values[dim.key] - 1]}
					</p>
				</div>
			))}

			{/* Result */}
			<div className="rounded-xl border-2 p-4 space-y-3">
				<div className="flex items-center justify-between">
					<span className="text-sm font-semibold text-slate-700">Risk Score</span>
					<span className="text-2xl font-bold text-[#030c1d]">{score}<span className="text-sm text-slate-400">/10</span></span>
				</div>

				{/* Score bar */}
				<div className="w-full bg-slate-100 rounded-full h-2.5">
					<div
						className={cn("h-2.5 rounded-full transition-all duration-500", barColor)}
						style={{ width: `${scorePercent}%` }}
					/>
				</div>

				{/* Change type badge */}
				<div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold", CHANGE_TYPE_COLOR[changeType])}>
					{changeType === "standard"  && "🟢"}
					{changeType === "normal"    && "🟡"}
					{changeType === "emergency" && "🔴"}
					Change Type: {changeType.charAt(0).toUpperCase() + changeType.slice(1)}
				</div>

				<p className="text-xs text-slate-500">
					{changeType === "standard"  && "Auto-approved. No CAB review required."}
					{changeType === "normal"    && "Requires CAB review and approval."}
					{changeType === "emergency" && "Requires Emergency CAB (ECAB) — expedited approval."}
				</p>
			</div>
		</div>
	);
}
