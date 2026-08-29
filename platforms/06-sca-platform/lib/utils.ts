import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Severity, LicenseRisk, VulnStatus } from "@/types/sca";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function severityColor(s: Severity): string {
  return s === "Critical" ? "text-red-400"
       : s === "High"     ? "text-orange-400"
       : s === "Medium"   ? "text-yellow-400"
       : "text-green-400";
}

export function severityHex(s: Severity): string {
  return s === "Critical" ? "var(--critical)"
       : s === "High"     ? "var(--high)"
       : s === "Medium"   ? "var(--medium)"
       : "var(--low)";
}

export function severityBgHex(s: Severity): string {
  return s === "Critical" ? "rgba(255,59,48,0.08)"
       : s === "High"     ? "rgba(255,149,0,0.08)"
       : s === "Medium"   ? "rgba(255,204,0,0.08)"
       : "rgba(52,199,89,0.06)";
}

export function severityBorderHex(s: Severity): string {
  return s === "Critical" ? "rgba(255,59,48,0.3)"
       : s === "High"     ? "rgba(255,149,0,0.3)"
       : s === "Medium"   ? "rgba(255,204,0,0.3)"
       : "rgba(52,199,89,0.2)";
}

export function severityGlow(s: Severity): string {
  return s === "Critical" ? "rgba(255,59,48,0.2)"
       : s === "High"     ? "rgba(255,149,0,0.15)"
       : s === "Medium"   ? "rgba(255,204,0,0.1)"
       : "rgba(52,199,89,0.1)";
}

export function licenseRiskColor(r: LicenseRisk): string {
  return r === "Copyleft"    ? "var(--high)"
       : r === "Proprietary" ? "var(--critical)"
       : r === "Unknown"     ? "var(--medium)"
       : "var(--low)";
}

export function licenseRiskBg(r: LicenseRisk): string {
  return r === "Copyleft"    ? "rgba(255,149,0,0.08)"
       : r === "Proprietary" ? "rgba(255,59,48,0.08)"
       : r === "Unknown"     ? "rgba(255,204,0,0.08)"
       : "rgba(52,199,89,0.06)";
}

export function statusColor(s: VulnStatus): string {
  return s === "Open"              ? "var(--critical)"
       : s === "Patched Available" ? "var(--primary)"
       : s === "No Fix"            ? "var(--high)"
       : "var(--muted)";
}

export function statusBg(s: VulnStatus): string {
  return s === "Open"              ? "rgba(255,59,48,0.08)"
       : s === "Patched Available" ? "rgba(0,212,255,0.08)"
       : s === "No Fix"            ? "rgba(255,149,0,0.08)"
       : "rgba(100,116,139,0.08)";
}

export function cvssColor(score: number): string {
  return score >= 9   ? "var(--critical)"
       : score >= 7   ? "var(--high)"
       : score >= 4   ? "var(--medium)"
       : "var(--low)";
}

export function epssLabel(epss: number): string {
  const pct = epss * 100;
  return pct > 10  ? `Very High (${pct.toFixed(1)}%)`
       : pct > 5   ? `High (${pct.toFixed(1)}%)`
       : pct > 1   ? `Medium (${pct.toFixed(1)}%)`
       : `Low (${pct.toFixed(2)}%)`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function ecosystemIcon(eco: string): string {
  const icons: Record<string, string> = {
    npm: "📦", Maven: "☕", PyPI: "🐍", NuGet: ".NET",
    Go: "🐹", RubyGems: "💎", Cargo: "🦀",
  };
  return icons[eco] || "📦";
}
