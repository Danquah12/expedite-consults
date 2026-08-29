import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { MobileSeverity, MobileCategory, MobilePlatform } from "@/types/mobile";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function sevColor(s: MobileSeverity): string {
  return s === "Critical" ? "#ff3b30" : s === "High" ? "#ff9500" : s === "Medium" ? "#ffcc00" : s === "Low" ? "#34c759" : "#64748b";
}
export function sevBg(s: MobileSeverity): string {
  return s === "Critical" ? "rgba(255,59,48,0.08)" : s === "High" ? "rgba(255,149,0,0.08)" : s === "Medium" ? "rgba(255,204,0,0.08)" : s === "Low" ? "rgba(52,199,89,0.06)" : "rgba(100,116,139,0.06)";
}
export function sevBorder(s: MobileSeverity): string {
  return s === "Critical" ? "rgba(255,59,48,0.3)" : s === "High" ? "rgba(255,149,0,0.3)" : s === "Medium" ? "rgba(255,204,0,0.3)" : s === "Low" ? "rgba(52,199,89,0.2)" : "rgba(100,116,139,0.2)";
}
export function sevGlow(s: MobileSeverity): string {
  return s === "Critical" ? "rgba(255,59,48,0.2)" : s === "High" ? "rgba(255,149,0,0.15)" : "rgba(255,204,0,0.1)";
}

export function platformColor(p: MobilePlatform): string {
  return p === "iOS" ? "#a2aaad" : p === "Android" ? "#3ddc84" : p === "React Native" ? "#61dafb" : p === "Flutter" ? "#54c5f8" : "#ec4899";
}
export function platformBg(p: MobilePlatform): string {
  return p === "iOS" ? "rgba(162,170,173,0.1)" : p === "Android" ? "rgba(61,220,132,0.08)" : p === "React Native" ? "rgba(97,218,251,0.08)" : p === "Flutter" ? "rgba(84,197,248,0.08)" : "rgba(236,72,153,0.08)";
}

export function categoryIcon(c: MobileCategory): string {
  const icons: Record<MobileCategory, string> = {
    "Data Storage": "🗄️", "Cryptography": "🔐", "Authentication": "🔑",
    "Network": "🌐", "Code Quality": "📝", "Permissions": "⚠️",
    "Binary": "💾", "Reverse Engineering": "🔍",
  };
  return icons[c] || "📱";
}
