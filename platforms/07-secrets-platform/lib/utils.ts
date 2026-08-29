import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SecretSeverity, SecretStatus, ValidationState } from "@/types/secrets";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function severityColor(s: SecretSeverity): string {
  return s === "Critical" ? "#ff3b30" : s === "High" ? "#ff9500" : s === "Medium" ? "#ffcc00" : "#34c759";
}
export function severityBg(s: SecretSeverity): string {
  return s === "Critical" ? "rgba(255,59,48,0.08)" : s === "High" ? "rgba(255,149,0,0.08)" : s === "Medium" ? "rgba(255,204,0,0.08)" : "rgba(52,199,89,0.06)";
}
export function severityBorder(s: SecretSeverity): string {
  return s === "Critical" ? "rgba(255,59,48,0.3)" : s === "High" ? "rgba(255,149,0,0.3)" : s === "Medium" ? "rgba(255,204,0,0.3)" : "rgba(52,199,89,0.2)";
}
export function severityGlow(s: SecretSeverity): string {
  return s === "Critical" ? "rgba(255,59,48,0.2)" : s === "High" ? "rgba(255,149,0,0.15)" : s === "Medium" ? "rgba(255,204,0,0.1)" : "rgba(52,199,89,0.1)";
}

export function statusColor(s: SecretStatus): string {
  return s === "Active" ? "var(--critical)" : s === "Revoked" ? "var(--low)" : s === "False Positive" ? "var(--muted)" : "var(--medium)";
}
export function statusBg(s: SecretStatus): string {
  return s === "Active" ? "rgba(255,59,48,0.1)" : s === "Revoked" ? "rgba(52,199,89,0.08)" : s === "False Positive" ? "rgba(100,116,139,0.08)" : "rgba(255,204,0,0.08)";
}

export function validationColor(v: ValidationState): string {
  return v === "Verified Live"    ? "var(--critical)"
       : v === "Verified Revoked" ? "var(--low)"
       : v === "Unverified"       ? "var(--medium)"
       : "var(--muted)";
}

export function entropyColor(score: number): string {
  return score >= 5 ? "var(--critical)" : score >= 4 ? "var(--high)" : score >= 3 ? "var(--medium)" : "var(--low)";
}

export function maskSecret(value: string): string {
  if (value.length <= 8) return "•".repeat(value.length);
  return value.slice(0, 4) + "•".repeat(Math.min(16, value.length - 8)) + value.slice(-4);
}

export function formatAge(days: number): string {
  return days >= 365 ? `${Math.floor(days / 365)}y ${Math.floor((days % 365) / 30)}m`
       : days >= 30  ? `${Math.floor(days / 30)}mo`
       : `${days}d`;
}

export function locationIcon(loc: string): string {
  const icons: Record<string, string> = {
    "Source Code": "📄", "Config File": "⚙️", "CI/CD": "🔄",
    "Docker Image": "🐳", "IaC": "🏗️", "Git History": "📜",
  };
  return icons[loc] || "📁";
}
