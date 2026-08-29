import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Severity } from "@/types/sast";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function severityColor(severity: Severity): string {
  switch (severity) {
    case "Critical": return "text-red-400";
    case "High":     return "text-orange-400";
    case "Medium":   return "text-yellow-400";
    case "Low":      return "text-green-400";
  }
}

export function severityBg(severity: Severity): string {
  switch (severity) {
    case "Critical": return "bg-red-500/15 border-red-500/30";
    case "High":     return "bg-orange-500/15 border-orange-500/30";
    case "Medium":   return "bg-yellow-500/15 border-yellow-500/30";
    case "Low":      return "bg-green-500/15 border-green-500/30";
  }
}

export function severityDot(severity: Severity): string {
  switch (severity) {
    case "Critical": return "bg-red-500";
    case "High":     return "bg-orange-500";
    case "Medium":   return "bg-yellow-500";
    case "Low":      return "bg-green-500";
  }
}

export function severityRing(severity: Severity): string {
  switch (severity) {
    case "Critical": return "ring-red-500/40";
    case "High":     return "ring-orange-500/40";
    case "Medium":   return "ring-yellow-500/40";
    case "Low":      return "ring-green-500/40";
  }
}

export function confidenceLabel(confidence: number): string {
  if (confidence >= 0.9) return "Very High";
  if (confidence >= 0.75) return "High";
  if (confidence >= 0.5) return "Medium";
  return "Low";
}

export function epssLabel(epss: number): string {
  const pct = (epss * 100).toFixed(1);
  return `${pct}%`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function riskScoreColor(score: number): string {
  if (score >= 75) return "text-red-400";
  if (score >= 50) return "text-orange-400";
  if (score >= 25) return "text-yellow-400";
  return "text-green-400";
}

export function riskScoreBg(score: number): string {
  if (score >= 75) return "bg-red-500";
  if (score >= 50) return "bg-orange-500";
  if (score >= 25) return "bg-yellow-500";
  return "bg-green-500";
}
