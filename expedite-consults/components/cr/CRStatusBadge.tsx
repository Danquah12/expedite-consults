"use client";

import { cn } from "@/lib/utils";

const STATE_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
	new:       { label: "New",        color: "bg-slate-100 text-slate-700 border-slate-300",    dot: "bg-slate-500" },
	assess:    { label: "Assess",     color: "bg-amber-100 text-amber-700 border-amber-300",    dot: "bg-amber-500" },
	plan:      { label: "Plan",       color: "bg-blue-100 text-blue-700 border-blue-300",       dot: "bg-blue-500" },
	approve:   { label: "Approve",    color: "bg-purple-100 text-purple-700 border-purple-300", dot: "bg-purple-500" },
	scheduled: { label: "Scheduled",  color: "bg-indigo-100 text-indigo-700 border-indigo-300", dot: "bg-indigo-500" },
	implement: { label: "Implement",  color: "bg-cyan-100 text-cyan-700 border-cyan-300",       dot: "bg-cyan-500" },
	review:    { label: "Review",     color: "bg-orange-100 text-orange-700 border-orange-300", dot: "bg-orange-500" },
	closed:    { label: "Closed",     color: "bg-green-100 text-green-700 border-green-300",    dot: "bg-green-500" },
};

const RISK_CONFIG: Record<string, { label: string; color: string }> = {
	standard:  { label: "Standard",  color: "bg-green-100 text-green-700 border-green-300" },
	normal:    { label: "Normal",    color: "bg-amber-100 text-amber-700 border-amber-300" },
	emergency: { label: "Emergency", color: "bg-red-100 text-red-700 border-red-300" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
	low:      { label: "Low",      color: "bg-slate-100 text-slate-600 border-slate-200" },
	medium:   { label: "Medium",   color: "bg-blue-100 text-blue-700 border-blue-200" },
	high:     { label: "High",     color: "bg-orange-100 text-orange-700 border-orange-200" },
	critical: { label: "Critical", color: "bg-red-100 text-red-700 border-red-300 font-bold" },
};

const CAB_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
	pending:  { label: "Pending CAB",  color: "bg-slate-100 text-slate-600 border-slate-200",  icon: "⏳" },
	approved: { label: "CAB Approved", color: "bg-green-100 text-green-700 border-green-300",  icon: "✅" },
	rejected: { label: "CAB Rejected", color: "bg-red-100 text-red-700 border-red-300",        icon: "❌" },
	deferred: { label: "CAB Deferred", color: "bg-amber-100 text-amber-700 border-amber-300",  icon: "⏸️" },
};

interface BadgeProps {
	value: string;
	type?: "state" | "changeType" | "priority" | "cab";
	className?: string;
}

export function CRStatusBadge({ value, type = "state", className }: BadgeProps) {
	const config =
		type === "state"      ? STATE_CONFIG[value] :
		type === "changeType" ? RISK_CONFIG[value] :
		type === "priority"   ? PRIORITY_CONFIG[value] :
		CAB_CONFIG[value];

	if (!config) return null;

	const base = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border";

	if (type === "state") {
		const s = config as typeof STATE_CONFIG[string];
		return (
			<span className={cn(base, s.color, className)}>
				<span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
				{s.label}
			</span>
		);
	}

	if (type === "cab") {
		const c = config as typeof CAB_CONFIG[string];
		return (
			<span className={cn(base, c.color, className)}>
				<span>{c.icon}</span>
				{c.label}
			</span>
		);
	}

	return (
		<span className={cn(base, config.color, className)}>
			{config.label}
		</span>
	);
}
