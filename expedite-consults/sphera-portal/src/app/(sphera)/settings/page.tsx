"use client";

import { useState } from "react";
import {
  KeyRound, ShieldCheck, Fingerprint, Smartphone, Laptop,
  Lock, Trash2, CheckCircle2, AlertOctagon, Download,
  Globe, Eye, Bell, Moon, Sun, Sparkles, RefreshCw
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface Passkey {
  id: string;
  name: string;
  type: "Biometric" | "Hardware Security Key";
  addedDate: string;
  lastUsed: string;
}

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent?: boolean;
}

const initialPasskeys: Passkey[] = [
  { id: "pk-1", name: "MacBook Pro Touch ID", type: "Biometric", addedDate: "Aug 15, 2026", lastUsed: "Today at 9:42 AM" },
  { id: "pk-2", name: "iPhone 15 Pro Max Face ID", type: "Biometric", addedDate: "Aug 20, 2026", lastUsed: "Yesterday at 11:20 PM" },
  { id: "pk-3", name: "YubiKey 5C NFC (Backup)", type: "Hardware Security Key", addedDate: "Jul 10, 2026", lastUsed: "2 weeks ago" },
];

const initialSessions: ActiveSession[] = [
  { id: "sess-1", device: "Chrome 128 on Windows 11", location: "Bethesda, MD, USA", ip: "172.56.21.94", lastActive: "Active Now", isCurrent: true },
  { id: "sess-2", device: "Sphera Native App on iOS 19", location: "College Park, MD, USA", ip: "198.16.24.11", lastActive: "2 hours ago" },
  { id: "sess-3", device: "Safari 18 on macOS Sequoia", location: "Washington, DC, USA", ip: "142.250.190.46", lastActive: "Yesterday" },
];

export default function SettingsPage() {
  const [passkeys, setPasskeys] = useState(initialPasskeys);
  const [sessions, setSessions] = useState(initialSessions);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [sessionsRevoked, setSessionsRevoked] = useState(false);
  const { theme, setTheme, themeLabel } = useTheme();

  const handleRegisterPasskey = () => {
    setIsRegistering(true);
    setTimeout(() => {
      const newPk: Passkey = {
        id: `pk-${Date.now()}`,
        name: "Windows Hello Biometrics",
        type: "Biometric",
        addedDate: "Just now",
        lastUsed: "Active",
      };
      setPasskeys(prev => [...prev, newPk]);
      setIsRegistering(false);
      setRegisterSuccess(true);
      setTimeout(() => setRegisterSuccess(false), 3000);
    }, 1200);
  };

  const revokeAllSessions = () => {
    setSessions(prev => prev.filter(s => s.isCurrent));
    setSessionsRevoked(true);
    setTimeout(() => setSessionsRevoked(false), 4000);
  };

  const deletePasskey = (id: string) => {
    setPasskeys(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "28px", paddingBottom: "48px" }}>
      {/* ── Settings Header ───────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "900", color: "var(--text-pure)", margin: 0 }}>
            Security Enclave & System Settings
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
            FIDO2 WebAuthn passkeys, hardware keys, active sessions, and privacy preferences.
          </p>
        </div>

        <span style={{ fontSize: "11px", fontWeight: "900", color: "#10b981", backgroundColor: "rgba(16,185,129,0.15)", padding: "4px 12px", borderRadius: "9999px", display: "flex", alignItems: "center", gap: "6px" }}>
          <ShieldCheck size={14} /> Zero-Trust Compliant
        </span>
      </div>

      {/* ── Theme & Appearance Quick Switcher ─────────────────────── */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "20px",
          padding: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h3 style={{ fontSize: "15px", fontWeight: "900", color: "var(--text-pure)", margin: 0 }}>Visual Theme & Canvas Mode</h3>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>
            Currently active: <strong style={{ color: "var(--accent-cyan)" }}>{themeLabel}</strong>
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { id: "dark", label: "🌑 Obsidian Black" },
            { id: "light", label: "☀️ Solar White" },
            { id: "blue", label: "🌌 Sapphire Blue" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id as any)}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: theme === t.id ? "900" : "600",
                backgroundColor: theme === t.id ? "var(--accent-cyan)" : "var(--bg-input)",
                color: theme === t.id ? "#08090d" : "var(--text-pure)",
                border: "1px solid var(--border-subtle)",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── FIDO2 / WebAuthn Biometric Passkeys ────────────────────── */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "20px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Fingerprint size={22} color="var(--accent-cyan)" />
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "900", color: "var(--text-pure)", margin: 0 }}>FIDO2 / WebAuthn Hardware Passkeys</h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>Sign in instantly with Touch ID, Face ID, Windows Hello, or YubiKey without passwords.</p>
            </div>
          </div>

          <button
            onClick={handleRegisterPasskey}
            disabled={isRegistering}
            style={{
              background: "linear-gradient(135deg, #00d4ff, #0284c7)",
              color: "#08090d",
              border: "none",
              borderRadius: "12px",
              padding: "10px 20px",
              fontSize: "12px",
              fontWeight: "900",
              cursor: "pointer",
              boxShadow: "0 0 15px rgba(0, 212, 255, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Fingerprint size={16} />
            <span>{isRegistering ? "Verifying Sensor..." : "+ Add Passkey"}</span>
          </button>
        </div>

        {registerSuccess && (
          <div style={{ padding: "10px 16px", backgroundColor: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "10px", color: "#10b981", fontSize: "12px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={16} />
            <span>New WebAuthn Passkey successfully linked to your Sphera Enclave!</span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {passkeys.map((pk) => (
            <div
              key={pk.id}
              style={{
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "14px",
                padding: "14px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <KeyRound size={18} color="var(--accent-cyan)" />
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-pure)", margin: 0 }}>{pk.name}</h4>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>Added: {pk.addedDate} · Last used: {pk.lastUsed}</p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "10px", fontWeight: "800", color: "#10b981", backgroundColor: "rgba(16,185,129,0.15)", padding: "2px 8px", borderRadius: "6px" }}>
                  {pk.type}
                </span>
                <button
                  onClick={() => deletePasskey(pk.id)}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Active Session Manager & Kill Switch ───────────────────── */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "20px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Laptop size={22} color="#f59e0b" />
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "900", color: "var(--text-pure)", margin: 0 }}>Active Login Sessions</h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>Manage devices currently authenticated into your account.</p>
            </div>
          </div>

          <button
            onClick={revokeAllSessions}
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              color: "#ef4444",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "12px",
              padding: "10px 18px",
              fontSize: "12px",
              fontWeight: "900",
              cursor: "pointer",
            }}
          >
            Revoke All Other Sessions
          </button>
        </div>

        {sessionsRevoked && (
          <div style={{ padding: "10px 16px", backgroundColor: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", color: "#ef4444", fontSize: "12px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertOctagon size={16} />
            <span>Terminated all other active sessions across mobile and secondary browsers.</span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {sessions.map((s) => (
            <div
              key={s.id}
              style={{
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "14px",
                padding: "14px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h4 style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-pure)", margin: 0 }}>{s.device}</h4>
                  {s.isCurrent && (
                    <span style={{ fontSize: "9px", fontWeight: "900", color: "#10b981", backgroundColor: "rgba(16,185,129,0.15)", padding: "2px 6px", borderRadius: "6px" }}>
                      CURRENT DEVICE
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>📍 {s.location} · IP: {s.ip}</p>
              </div>

              <span style={{ fontSize: "11px", fontWeight: "700", color: s.isCurrent ? "#10b981" : "var(--text-muted)" }}>
                {s.lastActive}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Decentralized Data Export ─────────────────────────────── */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "20px",
          padding: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Download size={20} color="var(--accent-cyan)" />
          <div>
            <h3 style={{ fontSize: "14px", fontWeight: "900", color: "var(--text-pure)", margin: 0 }}>Export Social Graph & Identity Data</h3>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>Download your verified credentials, followers, and message archives in zero-trust encrypted JSON.</p>
          </div>
        </div>

        <button
          style={{
            backgroundColor: "var(--bg-input)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-pure)",
            borderRadius: "10px",
            padding: "8px 18px",
            fontSize: "12px",
            fontWeight: "800",
            cursor: "pointer",
          }}
        >
          Download JSON Archive ↓
        </button>
      </div>
    </div>
  );
}
