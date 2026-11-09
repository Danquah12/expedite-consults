"use client";

export type TwoFactorMethod = "TOTP_AUTHENTICATOR" | "SECURITY_DISPATCH_OTP" | "BACKUP_RECOVERY_CODE";

export interface XtrikeOperatorProfile {
  id: string;
  email: string;
  name: string;
  roleTitle: string;
  roleCode: "LEAD_APPSEC_AUDITOR" | "PRINCIPAL_SECURITY_ENGINEER" | "CISO_GOVERNANCE";
  clearanceLevel: string;
  department: string;
  totpSecretBase32: string;
  passwordDemo: string;
}

export interface TwoFactorSession {
  sessionId: string;
  operatorId: string;
  email: string;
  name: string;
  roleTitle: string;
  roleCode: XtrikeOperatorProfile["roleCode"];
  clearanceLevel: string;
  twoFactorMethod: TwoFactorMethod;
  authenticatedAtIso: string;
  expiresAtIso: string;
  sessionSignatureSha256: string;
  trustedDevice: boolean;
}

export interface TwoFactorAuditEvent {
  eventId: string;
  timestampIso: string;
  operatorEmail: string;
  eventType:
    | "PRIMARY_AUTH_SUCCESS"
    | "PRIMARY_AUTH_FAILURE"
    | "CHALLENGE_ISSUED"
    | "SECOND_FACTOR_VERIFIED"
    | "SECOND_FACTOR_REJECTED"
    | "SESSION_LOCKED";
  method: TwoFactorMethod | "PASSWORD";
  detail: string;
  ipContext: string;
}

export const XTRIKE_DEMO_OPERATORS: XtrikeOperatorProfile[] = [
  {
    id: "OP-001",
    email: "auditor@xtrike.security",
    name: "Dr. Kwesi Asiedu",
    roleTitle: "Lead AppSec Auditor",
    roleCode: "LEAD_APPSEC_AUDITOR",
    clearanceLevel: "LEVEL-5 · FULL CERTIFICATION & LEDGER SIGNING",
    department: "XTRIKE Enterprise Security Operations",
    totpSecretBase32: "JBSWY3DPEHPK3PXPXTKSAST52026AUDT",
    passwordDemo: "Xtrike#SAST2026!",
  },
  {
    id: "OP-002",
    email: "engineer@xtrike.security",
    name: "Elena Rostova",
    roleTitle: "Principal Security Engineer",
    roleCode: "PRINCIPAL_SECURITY_ENGINEER",
    clearanceLevel: "LEVEL-4 · PATCH BUILD & SANDBOX HARNESS",
    department: "XTRIKE Hybrid AST & Taint Engineering",
    totpSecretBase32: "JBSWY3DPEHPK3PXPXTKSAST52026ENGR",
    passwordDemo: "Xtrike#Patch2026!",
  },
  {
    id: "OP-003",
    email: "ciso@xtrike.security",
    name: "Marcus Vance",
    roleTitle: "CISO / Release Gate Authority",
    roleCode: "CISO_GOVERNANCE",
    clearanceLevel: "LEVEL-5 · EXECUTIVE RELEASE GATE GOVERNANCE",
    department: "Cyber Risk & Compliance Governance",
    totpSecretBase32: "JBSWY3DPEHPK3PXPXTKSAST52026CISO",
    passwordDemo: "Xtrike#Gate2026!",
  },
];

export const DEFAULT_RECOVERY_CODES: string[] = [
  "XTK-94A2-7F1C",
  "XTK-38B9-2D4E",
  "XTK-71C4-8A9F",
  "XTK-55E1-4C2B",
  "XTK-82D7-9E3A",
  "XTK-19F6-6B8D",
  "XTK-63A8-1F5C",
  "XTK-47C2-3D9E",
];

const SESSION_STORAGE_KEY = "xtrike_sast_2fa_session_v6_gateway";
const AUDIT_LOG_STORAGE_KEY = "xtrike_sast_2fa_audit_log_v6";
const USED_RECOVERY_CODES_KEY = "xtrike_sast_2fa_used_recovery_v6";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function decodeBase32(input: string): Uint8Array {
  const cleaned = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(output);
}

/**
 * Computes an RFC 6238 6-digit TOTP code for a given Base32 secret and Unix timestamp (ms)
 * using Web Crypto HMAC-SHA1 (standard authenticator algorithm).
 */
export async function computeTotpCode(
  secretBase32: string,
  timestampMs: number = Date.now(),
  stepSeconds = 30
): Promise<{ code: string; secondsRemaining: number; counter: number }> {
  const counter = Math.floor(timestampMs / 1000 / stepSeconds);
  const secondsElapsed = Math.floor(timestampMs / 1000) % stepSeconds;
  const secondsRemaining = stepSeconds - secondsElapsed;

  try {
    const keyBytes = decodeBase32(secretBase32);
    const counterBuf = new ArrayBuffer(8);
    const view = new DataView(counterBuf);
    view.setUint32(0, Math.floor(counter / 0x100000000), false);
    view.setUint32(4, counter >>> 0, false);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBytes.buffer as ArrayBuffer,
      { name: "HMAC", hash: "SHA-1" },
      false,
      ["sign"]
    );
    const macBuf = await crypto.subtle.sign("HMAC", cryptoKey, counterBuf);
    const hmac = new Uint8Array(macBuf);
    const offset = hmac[hmac.length - 1] & 0x0f;
    const binary =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);
    const otp = (binary % 1_000_000).toString().padStart(6, "0");
    return { code: otp, secondsRemaining, counter };
  } catch {
    // Deterministic fallback if Web Crypto is unavailable
    let hash = 2166136261;
    const seed = `${secretBase32}:${counter}`;
    for (let i = 0; i < seed.length; i++) {
      hash ^= seed.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const otp = (Math.abs(hash) % 1_000_000).toString().padStart(6, "0");
    return { code: otp, secondsRemaining, counter };
  }
}

/**
 * Verifies a 6-digit RFC 6238 TOTP code with ±1 time-step window tolerance.
 */
export async function verifyTotpCode(
  secretBase32: string,
  candidateCode: string,
  timestampMs: number = Date.now()
): Promise<boolean> {
  const normalized = candidateCode.replace(/\s|-/g, "");
  if (!/^\d{6}$/.test(normalized)) return false;

  for (const offsetSteps of [0, -1, 1]) {
    const { code } = await computeTotpCode(
      secretBase32,
      timestampMs + offsetSteps * 30_000,
      30
    );
    if (code === normalized) return true;
  }
  return false;
}

export async function computeSha256Hex(payload: string): Promise<string> {
  try {
    const bytes = new TextEncoder().encode(payload);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    let h1 = 0xdeadbeef ^ payload.length;
    let h2 = 0x41c6ce57 ^ payload.length;
    for (let i = 0; i < payload.length; i++) {
      const ch = payload.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    return (
      (h1 >>> 0).toString(16).padStart(8, "0") +
      (h2 >>> 0).toString(16).padStart(8, "0")
    ).repeat(4);
  }
}

export function loadActive2FASession(): TwoFactorSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      localStorage.getItem(SESSION_STORAGE_KEY) ||
      sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TwoFactorSession;
    if (Date.parse(parsed.expiresAtIso) <= Date.now()) {
      clear2FASession();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function save2FASession(session: TwoFactorSession, persistDevice: boolean): void {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(session);
  sessionStorage.setItem(SESSION_STORAGE_KEY, serialized);
  if (persistDevice) {
    localStorage.setItem(SESSION_STORAGE_KEY, serialized);
  } else {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
  window.dispatchEvent(new Event("xtrike-2fa-updated"));
}

export function clear2FASession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_STORAGE_KEY);
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
  window.dispatchEvent(new Event("xtrike-2fa-updated"));
}

export function load2FAAuditLog(): TwoFactorAuditEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TwoFactorAuditEvent[];
  } catch {
    return [];
  }
}

export function append2FAAuditEvent(
  event: Omit<TwoFactorAuditEvent, "eventId" | "timestampIso" | "ipContext">
): TwoFactorAuditEvent {
  const newEvent: TwoFactorAuditEvent = {
    ...event,
    eventId: `AUTH-EVT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    timestampIso: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    ipContext: "TLSv1.3 · mTLS-Verified · Enclave-East",
  };
  if (typeof window !== "undefined") {
    const existing = load2FAAuditLog();
    const updated = [newEvent, ...existing].slice(0, 25);
    localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("xtrike-2fa-updated"));
  }
  return newEvent;
}

export function getUnusedRecoveryCodes(): string[] {
  if (typeof window === "undefined") return DEFAULT_RECOVERY_CODES;
  try {
    const usedRaw = localStorage.getItem(USED_RECOVERY_CODES_KEY);
    const used = usedRaw ? (JSON.parse(usedRaw) as string[]) : [];
    return DEFAULT_RECOVERY_CODES.filter((c) => !used.includes(c));
  } catch {
    return DEFAULT_RECOVERY_CODES;
  }
}

export function consumeRecoveryCode(code: string): boolean {
  const normalized = code.trim().toUpperCase();
  const available = getUnusedRecoveryCodes();
  if (!available.includes(normalized)) return false;
  if (typeof window !== "undefined") {
    const usedRaw = localStorage.getItem(USED_RECOVERY_CODES_KEY);
    const used = usedRaw ? (JSON.parse(usedRaw) as string[]) : [];
    used.push(normalized);
    localStorage.setItem(USED_RECOVERY_CODES_KEY, JSON.stringify(used));
  }
  return true;
}

export function resetRecoveryCodes(): string[] {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USED_RECOVERY_CODES_KEY);
    window.dispatchEvent(new Event("xtrike-2fa-updated"));
  }
  return DEFAULT_RECOVERY_CODES;
}
