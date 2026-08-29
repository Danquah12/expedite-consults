import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { IaCSeverity, IaCCategory, IaCFramework, CloudProvider } from "@/types/iac";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function sevColor(s: IaCSeverity): string {
  return s === "Critical" ? "#ff3b30" : s === "High" ? "#ff9500" : s === "Medium" ? "#ffcc00" : s === "Low" ? "#34c759" : "#64748b";
}
export function sevBg(s: IaCSeverity): string {
  return s === "Critical" ? "rgba(255,59,48,0.08)" : s === "High" ? "rgba(255,149,0,0.08)" : s === "Medium" ? "rgba(255,204,0,0.08)" : s === "Low" ? "rgba(52,199,89,0.06)" : "rgba(100,116,139,0.06)";
}
export function sevBorder(s: IaCSeverity): string {
  return s === "Critical" ? "rgba(255,59,48,0.3)" : s === "High" ? "rgba(255,149,0,0.3)" : s === "Medium" ? "rgba(255,204,0,0.3)" : s === "Low" ? "rgba(52,199,89,0.2)" : "rgba(100,116,139,0.2)";
}
export function sevGlow(s: IaCSeverity): string {
  return s === "Critical" ? "rgba(255,59,48,0.2)" : s === "High" ? "rgba(255,149,0,0.15)" : s === "Medium" ? "rgba(255,204,0,0.1)" : "rgba(52,199,89,0.08)";
}

export function providerColor(p: CloudProvider): string {
  return p === "AWS" ? "#ff9900" : p === "Azure" ? "#0089d6" : p === "GCP" ? "#4285f4" : "var(--primary)";
}
export function providerBg(p: CloudProvider): string {
  return p === "AWS" ? "rgba(255,153,0,0.08)" : p === "Azure" ? "rgba(0,137,214,0.08)" : p === "GCP" ? "rgba(66,133,244,0.08)" : "rgba(249,115,22,0.08)";
}

export function frameworkColor(f: IaCFramework): string {
  return f === "Terraform" ? "#7b42bc" : f === "CloudFormation" ? "#ff9900" : f === "Pulumi" ? "#f26e7e" : f === "Ansible" ? "#e00" : "#64748b";
}

export function categoryIcon(c: IaCCategory): string {
  const icons: Record<IaCCategory, string> = {
    "Network": "🌐", "IAM": "🔑", "Encryption": "🔒", "Logging": "📋",
    "Storage": "🗄️", "Compute": "💻", "Database": "🛢️", "Compliance": "📜",
  };
  return icons[c] || "⚙️";
}
