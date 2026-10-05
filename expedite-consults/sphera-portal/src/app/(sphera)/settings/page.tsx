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
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* ── Settings Header ───────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Security & Account Settings
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage passkeys, active sessions, appearance, and account preferences.
          </p>
        </div>

        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
          <ShieldCheck size={14} /> Security Active
        </span>
      </div>

      {/* ── Theme & Appearance Quick Switcher ─────────────────────── */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-white">Theme & Appearance</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Active mode: <strong className="text-zinc-200">{themeLabel}</strong>
          </p>
        </div>

        <div className="flex gap-2">
          {[
            { id: "dark", label: "Dark" },
            { id: "light", label: "Light" },
            { id: "blue", label: "Midnight Blue" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                theme === t.id
                  ? "bg-white text-zinc-950 font-semibold border-white shadow-xs"
                  : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Passkeys / Biometrics ─────────────────────────────────── */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <Fingerprint size={20} className="text-zinc-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Biometric Passkeys & Security Keys</h3>
              <p className="text-xs text-zinc-400">Sign in securely using Touch ID, Face ID, Windows Hello, or hardware key.</p>
            </div>
          </div>

          <button
            onClick={handleRegisterPasskey}
            disabled={isRegistering}
            className="px-4 py-1.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Fingerprint size={14} />
            <span>{isRegistering ? "Verifying..." : "+ Add Passkey"}</span>
          </button>
        </div>

        {registerSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>New passkey successfully registered to your account!</span>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {passkeys.map((pk) => (
            <div
              key={pk.id}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <KeyRound size={16} className="text-zinc-400" />
                <div>
                  <h4 className="text-xs font-semibold text-white">{pk.name}</h4>
                  <p className="text-[11px] text-zinc-400">Added: {pk.addedDate} · Last used: {pk.lastUsed}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-md">
                  {pk.type}
                </span>
                <button
                  onClick={() => deletePasskey(pk.id)}
                  className="text-zinc-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Active Login Sessions ─────────────────────────────────── */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <Laptop size={20} className="text-zinc-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Active Login Sessions</h3>
              <p className="text-xs text-zinc-400">Devices currently signed into your account.</p>
            </div>
          </div>

          <button
            onClick={revokeAllSessions}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 text-xs font-semibold transition-colors cursor-pointer"
          >
            Revoke Other Sessions
          </button>
        </div>

        {sessionsRevoked && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-medium flex items-center gap-2">
            <AlertOctagon size={16} />
            <span>Terminated other active sessions across secondary browsers.</span>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 flex justify-between items-center"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-white">{s.device}</h4>
                  {s.isCurrent && (
                    <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded">
                      CURRENT DEVICE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">📍 {s.location} · IP: {s.ip}</p>
              </div>

              <span className={`text-xs font-medium ${s.isCurrent ? "text-emerald-400" : "text-zinc-500"}`}>
                {s.lastActive}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Data Export ───────────────────────────────────────────── */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Download size={18} className="text-zinc-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Export Account Data</h3>
            <p className="text-xs text-zinc-400">Download your profile data, posts, and contacts in JSON format.</p>
          </div>
        </div>

        <button className="px-4 py-1.5 rounded-xl bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white border border-zinc-700 text-xs font-medium transition-colors cursor-pointer">
          Download Archive ↓
        </button>
      </div>
    </div>
  );
}
