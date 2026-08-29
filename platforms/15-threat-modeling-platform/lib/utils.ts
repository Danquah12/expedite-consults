import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Severity, Confidence, HttpMethod, VulnPlugin } from "@/types/dast";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function sevColor(s: Severity): string {
  return s === "Critical" ? "#ff3b30" : s === "High" ? "#ff9500" : s === "Medium" ? "#ffcc00" : s === "Low" ? "#34c759" : "#64748b";
}
export function sevBg(s: Severity): string {
  return s === "Critical" ? "rgba(255,59,48,0.1)" : s === "High" ? "rgba(255,149,0,0.1)" : s === "Medium" ? "rgba(255,204,0,0.1)" : s === "Low" ? "rgba(52,199,89,0.08)" : "rgba(100,116,139,0.06)";
}
export function sevBorder(s: Severity): string {
  return s === "Critical" ? "rgba(255,59,48,0.35)" : s === "High" ? "rgba(255,149,0,0.35)" : s === "Medium" ? "rgba(255,204,0,0.3)" : s === "Low" ? "rgba(52,199,89,0.25)" : "rgba(100,116,139,0.2)";
}

export function methodColor(m: HttpMethod): string {
  return m === "GET" ? "#3ddc84" : m === "POST" ? "#4fc3f7" : m === "PUT" ? "#ffb74d" : m === "DELETE" ? "#ef5350" : m === "PATCH" ? "#ce93d8" : "#90a4ae";
}
export function methodBg(m: HttpMethod): string {
  return m === "GET" ? "rgba(61,220,132,0.1)" : m === "POST" ? "rgba(79,195,247,0.1)" : m === "PUT" ? "rgba(255,183,77,0.1)" : m === "DELETE" ? "rgba(239,83,80,0.1)" : "rgba(206,147,216,0.1)";
}

export function statusColor(s: number): string {
  return s >= 500 ? "#ff3b30" : s >= 400 ? "#ff9500" : s >= 300 ? "#4fc3f7" : s >= 200 ? "#3ddc84" : "#90a4ae";
}

export function pluginColor(p: VulnPlugin): string {
  const map: Record<VulnPlugin, string> = {
    SQLi: "#ef5350", XSS: "#ffb74d", SSRF: "#4fc3f7", CSRF: "#ce93d8",
    IDOR: "#f48fb1", JWT: "#80cbc4", CORS: "#80deea", OpenRedirect: "#a5d6a7",
    PathTraversal: "#ffe082", XXE: "#ffcc80", SSTI: "#ef9a9a", CMDi: "#ff5252",
    LFI: "#ff8a65", Header: "#90a4ae", Auth: "#b39ddb",
  };
  return map[p] || "#90a4ae";
}

export function confidenceColor(c: Confidence): string {
  return c === "Confirmed" ? "#3ddc84" : c === "High" ? "var(--primary)" : c === "Medium" ? "#ffb74d" : "#90a4ae";
}

export function formatBytes(b: number): string {
  if (b < 1024) return `${b}B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)}KB`;
  return `${(b / 1048576).toFixed(1)}MB`;
}
