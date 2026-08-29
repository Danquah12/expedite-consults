import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { APISeverity, APICategory, HttpMethod, AuthType, BodyType } from "@/types/api";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function sevColor(s: APISeverity): string {
  return s === "Critical" ? "#ff3b30" : s === "High" ? "#ff9500" : s === "Medium" ? "#ffcc00" : s === "Low" ? "#34c759" : "#64748b";
}
export function sevBg(s: APISeverity): string {
  return s === "Critical" ? "rgba(255,59,48,0.1)" : s === "High" ? "rgba(255,149,0,0.1)" : s === "Medium" ? "rgba(255,204,0,0.1)" : "rgba(52,199,89,0.08)";
}
export function sevBorder(s: APISeverity): string {
  return s === "Critical" ? "rgba(255,59,48,0.35)" : s === "High" ? "rgba(255,149,0,0.35)" : s === "Medium" ? "rgba(255,204,0,0.3)" : "rgba(52,199,89,0.25)";
}
export function sevGlow(s: APISeverity): string {
  return s === "Critical" ? "rgba(255,59,48,0.2)" : s === "High" ? "rgba(255,149,0,0.15)" : "rgba(255,204,0,0.1)";
}

export function methodColor(m: HttpMethod): string {
  return m === "GET" ? "#3ddc84" : m === "POST" ? "#4fc3f7" : m === "PUT" ? "#ffb74d" : m === "DELETE" ? "#ef5350" : m === "PATCH" ? "#ce93d8" : m === "OPTIONS" ? "#80cbc4" : m === "HEAD" ? "#90a4ae" : "#90a4ae";
}
export function methodBg(m: HttpMethod): string {
  return m === "GET" ? "rgba(61,220,132,0.1)" : m === "POST" ? "rgba(79,195,247,0.1)" : m === "PUT" ? "rgba(255,183,77,0.1)" : m === "DELETE" ? "rgba(239,83,80,0.1)" : m === "PATCH" ? "rgba(206,147,216,0.1)" : "rgba(144,164,174,0.1)";
}
export function categoryIcon(c: APICategory): string {
  const icons: Record<APICategory, string> = {
    BOLA: "🔓", Auth: "🔑", "Data Exposure": "💾", "Rate Limiting": "⏱",
    "Mass Assignment": "📝", CORS: "🌐", Injection: "💉", JWT: "🔐", Schema: "📋",
  };
  return icons[c] || "⚠️";
}
export function apiTypeColor(t: string): string {
  return t === "REST" ? "#0d9488" : t === "GraphQL" ? "#e535ab" : t === "gRPC" ? "#7c3aed" : t === "SOAP" ? "#b45309" : "#0ea5e9";
}
export function authTypeLabel(a: AuthType): string {
  const labels: Record<AuthType, string> = {
    none: "No Auth", bearer: "Bearer Token", basic: "Basic Auth",
    apikey: "API Key", oauth2: "OAuth 2.0", jwt: "JWT", digest: "Digest", mtls: "mTLS",
  };
  return labels[a];
}
export function bodyTypeLabel(b: BodyType): string {
  const labels: Record<BodyType, string> = {
    json: "JSON", xml: "XML", "form-data": "Form Data", urlencoded: "URL Encoded",
    raw: "Raw", graphql: "GraphQL", binary: "Binary", none: "None",
  };
  return labels[b];
}
export function statusColor(s: number): string {
  return s >= 500 ? "#ff3b30" : s >= 400 ? "#ff9500" : s >= 300 ? "#4fc3f7" : s >= 200 ? "#3ddc84" : "#90a4ae";
}
export function formatBytes(b: number): string {
  if (b < 1024) return `${b}B`; if (b < 1048576) return `${(b / 1024).toFixed(1)}KB`; return `${(b / 1048576).toFixed(1)}MB`;
}
export function formatMs(ms: number): string { return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`; }
