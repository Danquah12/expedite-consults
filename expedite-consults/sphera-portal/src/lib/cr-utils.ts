import { crReadClient } from "@/sanity/lib/write-client";

/**
 * Generate the next CHG number by querying Sanity for the highest existing one.
 * Returns a padded string like "CHG0000042".
 */
export async function generateChgNumber(): Promise<string> {
	const existing = await crReadClient.fetch<string[]>(
		`*[_type == "changeRequest"] | order(chgNumber desc)[0].chgNumber`
	);

	const last = existing?.[0] ?? null;
	let nextNum = 1;

	if (last && /^CHG\d+$/.test(last)) {
		nextNum = parseInt(last.replace("CHG", ""), 10) + 1;
	}

	return `CHG${String(nextNum).padStart(7, "0")}`;
}

/**
 * Calculate risk score (1–10) from the four assessment dimensions.
 * If score >= 7  → Emergency
 * If score >= 4  → Normal
 * Otherwise      → Standard
 */
export function calculateRiskScore(
	impact: number,
	downtime: number,
	complexity: number,
	reversibility: number
): { score: number; changeType: "standard" | "normal" | "emergency" } {
	const raw = (impact + downtime + complexity + reversibility) / 4;
	const score = Math.round(raw * 2) / 2; // round to nearest 0.5

	let changeType: "standard" | "normal" | "emergency" = "standard";
	if (score >= 7) changeType = "emergency";
	else if (score >= 4) changeType = "normal";

	return { score, changeType };
}

/**
 * Map CR state to a human-readable label.
 */
export const CR_STATE_LABELS: Record<string, string> = {
	new: "New",
	assess: "Assess",
	plan: "Plan",
	approve: "Approve",
	scheduled: "Scheduled",
	implement: "Implement",
	review: "Review",
	closed: "Closed",
};

/**
 * Ordered list of CR lifecycle phases (for the stepper UI).
 */
export const CR_PHASES = [
	{ key: "new", label: "Initiation", phase: 1 },
	{ key: "assess", label: "Assessment", phase: 2 },
	{ key: "plan", label: "Planning", phase: 3 },
	{ key: "approve", label: "Approval", phase: 4 },
	{ key: "scheduled", label: "Pre-Change", phase: 5 },
	{ key: "implement", label: "Implementation", phase: 6 },
	{ key: "review", label: "Validation", phase: 7 },
	{ key: "closed", label: "Closure", phase: 8 },
];

export function getPhaseIndex(state: string): number {
	return CR_PHASES.findIndex((p) => p.key === state);
}
