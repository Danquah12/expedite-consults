"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, CheckCircle2, LogOut, ArrowRight, KeyRound } from "lucide-react";
import { TwoFactorPortalCard, trigger2FALockSession } from "@/components/auth/TwoFactorAuthGate";
import { loadActive2FASession, TwoFactorSession } from "@/lib/two-factor-auth";

export default function LoginPage() {
  const router = useRouter();
  const [activeSession, setActiveSession] = useState<TwoFactorSession | null>(null);

  useEffect(() => {
    setActiveSession(loadActive2FASession());
    const sync = () => setActiveSession(loadActive2FASession());
    window.addEventListener("xtrike-2fa-updated", sync);
    return () => window.removeEventListener("xtrike-2fa-updated", sync);
  }, []);

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div
        className="p-6 rounded-2xl border flex flex-wrap items-center justify-between gap-4"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="space-y-1">
          <div className="desk-kicker">XTRIKE SAST DESK v5.0.0 &middot; OPERATOR ACCESS CONTROL</div>
          <h1 className="text-2xl font-bold font-editorial flex items-center gap-2.5">
            <KeyRound className="w-6 h-6" style={{ color: "var(--accent)" }} />
            <span>Two-Factor Authentication (2FA) &amp; Session Attestation Portal</span>
          </h1>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            RFC 6238 Time-Based One-Time Password (TOTP), Security Enclave Dispatch OTP, and
            Single-Use Hardware Recovery Token verification for certified SAST operations.
          </p>
        </div>

        {activeSession && (
          <div className="flex flex-wrap items-center gap-2.5">
            <div
              className="px-3.5 py-2 rounded-xl border text-xs flex items-center gap-2"
              style={{
                background: "rgba(45, 106, 79, 0.1)",
                borderColor: "rgba(45, 106, 79, 0.35)",
                color: "#2d6a4f",
              }}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <div>
                <div className="font-bold">
                  2FA Verified: {activeSession.name} ({activeSession.roleTitle})
                </div>
                <div className="text-[10px] font-mono">
                  Session {activeSession.sessionId} &middot; {activeSession.twoFactorMethod}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                trigger2FALockSession();
                setActiveSession(null);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              style={{
                background: "#b42318",
                color: "#ffffff",
              }}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Session</span>
            </button>

            <Link
              href="/dashboard"
              className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
              style={{
                background: "var(--accent)",
                color: "#fbf8f3",
                textDecoration: "none",
              }}
            >
              <span>Open Triage Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Interactive 2FA Portal Card */}
      <TwoFactorPortalCard
        standaloneMode
        onAuthenticated={(session) => {
          setActiveSession(session);
          router.push("/dashboard");
        }}
      />
    </div>
  );
}
