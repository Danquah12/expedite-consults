import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ContainerSeverity, FixStatus, ImageStatus } from "@/types/container";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function sevColor(s: ContainerSeverity): string {
  return s === "Critical" ? "#ff3b30" : s === "High" ? "#ff9500" : s === "Medium" ? "#ffcc00" : s === "Low" ? "#34c759" : "#64748b";
}
export function sevBg(s: ContainerSeverity): string {
  return s === "Critical" ? "rgba(255,59,48,0.08)" : s === "High" ? "rgba(255,149,0,0.08)" : s === "Medium" ? "rgba(255,204,0,0.08)" : s === "Low" ? "rgba(52,199,89,0.06)" : "rgba(100,116,139,0.06)";
}
export function sevBorder(s: ContainerSeverity): string {
  return s === "Critical" ? "rgba(255,59,48,0.3)" : s === "High" ? "rgba(255,149,0,0.3)" : s === "Medium" ? "rgba(255,204,0,0.3)" : s === "Low" ? "rgba(52,199,89,0.2)" : "rgba(100,116,139,0.2)";
}
export function sevGlow(s: ContainerSeverity): string {
  return s === "Critical" ? "rgba(255,59,48,0.2)" : s === "High" ? "rgba(255,149,0,0.15)" : s === "Medium" ? "rgba(255,204,0,0.1)" : "rgba(52,199,89,0.08)";
}

export function statusColor(s: ImageStatus): string {
  return s === "Critical" ? "var(--critical)" : s === "Vulnerable" ? "var(--high)" : "var(--low)";
}
export function statusBg(s: ImageStatus): string {
  return s === "Critical" ? "rgba(255,59,48,0.08)" : s === "Vulnerable" ? "rgba(255,149,0,0.08)" : "rgba(52,199,89,0.06)";
}

export function fixStatusColor(f: FixStatus): string {
  return f === "Fixed" ? "var(--low)" : f === "Will Not Fix" ? "var(--muted)" : f === "Affected" ? "var(--critical)" : "var(--medium)";
}

export function formatBytes(b: number): string {
  if (b >= 1_073_741_824) return `${(b / 1_073_741_824).toFixed(1)} GB`;
  if (b >= 1_048_576)     return `${(b / 1_048_576).toFixed(0)} MB`;
  return `${(b / 1024).toFixed(0)} KB`;
}

export function shortDigest(d: string): string {
  return d.startsWith("sha256:") ? d.slice(7, 19) : d.slice(0, 12);
}
