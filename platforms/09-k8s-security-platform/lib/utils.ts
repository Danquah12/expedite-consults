import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { K8sSeverity, FindingCategory, ClusterStatus } from "@/types/k8s";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function sevColor(s: K8sSeverity): string {
  return s === "Critical" ? "#ff3b30" : s === "High" ? "#ff9500" : s === "Medium" ? "#ffcc00" : s === "Low" ? "#34c759" : "#64748b";
}
export function sevBg(s: K8sSeverity): string {
  return s === "Critical" ? "rgba(255,59,48,0.08)" : s === "High" ? "rgba(255,149,0,0.08)" : s === "Medium" ? "rgba(255,204,0,0.08)" : s === "Low" ? "rgba(52,199,89,0.06)" : "rgba(100,116,139,0.06)";
}
export function sevBorder(s: K8sSeverity): string {
  return s === "Critical" ? "rgba(255,59,48,0.3)" : s === "High" ? "rgba(255,149,0,0.3)" : s === "Medium" ? "rgba(255,204,0,0.3)" : s === "Low" ? "rgba(52,199,89,0.2)" : "rgba(100,116,139,0.2)";
}
export function sevGlow(s: K8sSeverity): string {
  return s === "Critical" ? "rgba(255,59,48,0.2)" : s === "High" ? "rgba(255,149,0,0.15)" : s === "Medium" ? "rgba(255,204,0,0.1)" : "rgba(52,199,89,0.08)";
}

export function clusterStatusColor(s: ClusterStatus): string {
  return s === "At Risk" ? "var(--critical)" : s === "Warning" ? "var(--high)" : "var(--low)";
}
export function clusterStatusBg(s: ClusterStatus): string {
  return s === "At Risk" ? "rgba(255,59,48,0.08)" : s === "Warning" ? "rgba(255,149,0,0.08)" : "rgba(52,199,89,0.06)";
}

export function categoryIcon(c: FindingCategory): string {
  const icons: Record<FindingCategory, string> = {
    "Misconfiguration": "⚙️", "RBAC": "🔑", "Network": "🌐",
    "Workload": "📦", "Secret": "🔒", "Supply Chain": "⛓️",
  };
  return icons[c] || "⚠️";
}

export function categoryColor(c: FindingCategory): string {
  return c === "RBAC" ? "#a78bfa" : c === "Network" ? "var(--primary)" : c === "Secret" ? "var(--critical)" : c === "Supply Chain" ? "var(--high)" : "var(--medium)";
}
