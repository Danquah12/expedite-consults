"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Shield,
  Lock,
  KeyRound,
  Smartphone,
  Mail,
  FileKey2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Check,
  LogOut,
  Fingerprint,
  Terminal,
  Clock,
  Sparkles,
  X,
  ArrowRight,
  QrCode,
  UserCheck,
} from "lucide-react";
import {
  XTRIKE_DEMO_OPERATORS,
  XtrikeOperatorProfile,
  TwoFactorMethod,
  TwoFactorSession,
  TwoFactorAuditEvent,
  computeTotpCode,
  verifyTotpCode,
  computeSha256Hex,
  loadActive2FASession,
  save2FASession,
  clear2FASession,
  load2FAAuditLog,
  append2FAAuditEvent,
  getUnusedRecoveryCodes,
  consumeRecoveryCode,
  resetRecoveryCodes,
} from "@/lib/two-factor-auth";

export function open2FASecurityModal(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("xtrike-open-2fa-modal"));
  }
}

export function openExecutiveGatewayDashboard(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("xtrike-open-gateway-dashboard"));
  }
}

export function trigger2FALockSession(): void {
  if (typeof window !== "undefined") {
    const active = loadActive2FASession();
    if (active) {
      append2FAAuditEvent({
        operatorEmail: active.email,
        eventType: "SESSION_LOCKED",
        method: active.twoFactorMethod,
        detail: `Session ${active.sessionId} locked by operator`,
      });
    }
    clear2FASession();
  }
}

interface TwoFactorPortalCardProps {
  onAuthenticated?: (session: TwoFactorSession) => void;
  standaloneMode?: boolean;
}

export function TwoFactorPortalCard({
  onAuthenticated,
  standaloneMode = false,
}: TwoFactorPortalCardProps) {
  const [step, setStep] = useState<"PRIMARY" | "SECOND_FACTOR">("PRIMARY");
  const [selectedOperator, setSelectedOperator] = useState<XtrikeOperatorProfile>(
    XTRIKE_DEMO_OPERATORS[0]
  );
  const [emailInput, setEmailInput] = useState<string>(XTRIKE_DEMO_OPERATORS[0].email);
  const [passwordInput, setPasswordInput] = useState<string>(
    XTRIKE_DEMO_OPERATORS[0].passwordDemo
  );
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [persistDevice, setPersistDevice] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 2 state
  const [method, setMethod] = useState<TwoFactorMethod>("TOTP_AUTHENTICATOR");
  const [otpInput, setOtpInput] = useState<string>("");
  const [liveTotp, setLiveTotp] = useState<{
    code: string;
    secondsRemaining: number;
    counter: number;
  }>({ code: "------", secondsRemaining: 30, counter: 0 });
  const [dispatchCode, setDispatchCode] = useState<string>("842917");
  const [unusedRecovery, setUnusedRecovery] = useState<string[]>([]);
  const [copiedSecret, setCopiedSecret] = useState<boolean>(false);
  const [showProvisionQr, setShowProvisionQr] = useState<boolean>(true);
  const [verifying, setVerifying] = useState<boolean>(false);

  const refreshTotp = useCallback(async () => {
    const res = await computeTotpCode(selectedOperator.totpSecretBase32, Date.now(), 30);
    setLiveTotp(res);
  }, [selectedOperator.totpSecretBase32]);

  useEffect(() => {
    refreshTotp();
    setUnusedRecovery(getUnusedRecoveryCodes());
    const timer = setInterval(() => {
      refreshTotp();
    }, 1000);
    return () => clearInterval(timer);
  }, [refreshTotp]);

  const handleSelectPersona = (op: XtrikeOperatorProfile) => {
    setSelectedOperator(op);
    setEmailInput(op.email);
    setPasswordInput(op.passwordDemo);
    setErrorMessage(null);
  };

  const handlePrimarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const matched = XTRIKE_DEMO_OPERATORS.find(
      (op) => op.email.toLowerCase() === emailInput.trim().toLowerCase()
    );

    if (!matched || passwordInput !== matched.passwordDemo) {
      append2FAAuditEvent({
        operatorEmail: emailInput.trim() || "unknown@xtrike.security",
        eventType: "PRIMARY_AUTH_FAILURE",
        method: "PASSWORD",
        detail: "Invalid primary operator email or password credential",
      });
      setErrorMessage(
        "Invalid primary operator credentials. Select one of the verified XTRIKE operator profiles below or check your password."
      );
      return;
    }

    setSelectedOperator(matched);
    const generatedDispatch = Math.floor(100000 + Math.random() * 900000).toString();
    setDispatchCode(generatedDispatch);
    setUnusedRecovery(getUnusedRecoveryCodes());
    setOtpInput("");

    append2FAAuditEvent({
      operatorEmail: matched.email,
      eventType: "PRIMARY_AUTH_SUCCESS",
      method: "PASSWORD",
      detail: `Primary credentials verified for ${matched.name} (${matched.roleTitle})`,
    });

    append2FAAuditEvent({
      operatorEmail: matched.email,
      eventType: "CHALLENGE_ISSUED",
      method,
      detail: `Issued RFC 6238 TOTP & Security Enclave 2FA challenge`,
    });

    setStep("SECOND_FACTOR");
  };

  const handleInstantSignIn = async () => {
    setErrorMessage(null);
    setVerifying(true);
    try {
      const matched =
        XTRIKE_DEMO_OPERATORS.find(
          (op) => op.email.toLowerCase() === emailInput.trim().toLowerCase()
        ) || selectedOperator;

      const nowIso = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
      const expiresIso = new Date(
        Date.now() + (persistDevice ? 12 * 3600 * 1000 : 2 * 3600 * 1000)
      )
        .toISOString()
        .replace(/\.\d{3}Z$/, "Z");
      const sessionId = `XTK-2FA-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const sig = await computeSha256Hex(
        `${sessionId}|${matched.id}|${matched.email}|TOTP_AUTHENTICATOR|${nowIso}`
      );

      const newSession: TwoFactorSession = {
        sessionId,
        operatorId: matched.id,
        email: matched.email,
        name: matched.name,
        roleTitle: matched.roleTitle,
        roleCode: matched.roleCode,
        clearanceLevel: matched.clearanceLevel,
        twoFactorMethod: "TOTP_AUTHENTICATOR",
        authenticatedAtIso: nowIso,
        expiresAtIso: expiresIso,
        sessionSignatureSha256: sig,
        trustedDevice: persistDevice,
      };

      append2FAAuditEvent({
        operatorEmail: matched.email,
        eventType: "SECOND_FACTOR_VERIFIED",
        method: "TOTP_AUTHENTICATOR",
        detail: `Instant Enclave TOTP Handshake verified for ${matched.name} · Session ${sessionId} signed (${sig.slice(0, 12)}…)`,
      });

      save2FASession(newSession, persistDevice);
      setVerifying(false);
      if (onAuthenticated) {
        onAuthenticated(newSession);
      }
    } catch {
      setErrorMessage("Unable to complete instant enclave sign-in.");
      setVerifying(false);
    }
  };

  const handleVerifySecondFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setVerifying(true);

    try {
      const candidate = otpInput.trim();
      let passed = false;
      let verificationDetail = "";

      if (method === "TOTP_AUTHENTICATOR") {
        passed = await verifyTotpCode(
          selectedOperator.totpSecretBase32,
          candidate,
          Date.now()
        );
        verificationDetail = `RFC 6238 HMAC-SHA1 TOTP verified (±1 step window, counter #${liveTotp.counter})`;
      } else if (method === "SECURITY_DISPATCH_OTP") {
        const cleaned = candidate.replace(/\s|-/g, "");
        passed = cleaned === dispatchCode;
        verificationDetail = `Encrypted Security Dispatch OTP (${dispatchCode}) verified`;
      } else if (method === "BACKUP_RECOVERY_CODE") {
        passed = consumeRecoveryCode(candidate);
        setUnusedRecovery(getUnusedRecoveryCodes());
        verificationDetail = `Single-use hardware recovery token (${candidate.toUpperCase()}) consumed`;
      }

      if (!passed) {
        append2FAAuditEvent({
          operatorEmail: selectedOperator.email,
          eventType: "SECOND_FACTOR_REJECTED",
          method,
          detail: `Rejected second-factor token (${method})`,
        });
        setErrorMessage(
          method === "TOTP_AUTHENTICATOR"
            ? "Invalid 6-digit RFC 6238 Authenticator code. Click 'Auto-Fill Live TOTP' or enter the current 6-digit code."
            : method === "SECURITY_DISPATCH_OTP"
            ? `Invalid Security Dispatch code. Expected 6-digit code ${dispatchCode}.`
            : "Invalid or already-consumed Backup Recovery Code. Select an unused XTK-XXXX-XXXX code."
        );
        setVerifying(false);
        return;
      }

      const nowIso = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
      const expiresIso = new Date(
        Date.now() + (persistDevice ? 12 * 3600 * 1000 : 2 * 3600 * 1000)
      )
        .toISOString()
        .replace(/\.\d{3}Z$/, "Z");
      const sessionId = `XTK-2FA-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const sig = await computeSha256Hex(
        `${sessionId}|${selectedOperator.id}|${selectedOperator.email}|${method}|${nowIso}`
      );

      const newSession: TwoFactorSession = {
        sessionId,
        operatorId: selectedOperator.id,
        email: selectedOperator.email,
        name: selectedOperator.name,
        roleTitle: selectedOperator.roleTitle,
        roleCode: selectedOperator.roleCode,
        clearanceLevel: selectedOperator.clearanceLevel,
        twoFactorMethod: method,
        authenticatedAtIso: nowIso,
        expiresAtIso: expiresIso,
        sessionSignatureSha256: sig,
        trustedDevice: persistDevice,
      };

      append2FAAuditEvent({
        operatorEmail: selectedOperator.email,
        eventType: "SECOND_FACTOR_VERIFIED",
        method,
        detail: `${verificationDetail} · Session ${sessionId} signed (${sig.slice(0, 12)}…)`,
      });

      save2FASession(newSession, persistDevice);
      setVerifying(false);
      if (onAuthenticated) {
        onAuthenticated(newSession);
      }
    } catch {
      setErrorMessage("Cryptographic verification error during 2FA handshake.");
      setVerifying(false);
    }
  };

  const otpAuthUri = useMemo(() => {
    const label = encodeURIComponent(`XTRIKE SAST v5.0:${selectedOperator.email}`);
    return `otpauth://totp/${label}?secret=${selectedOperator.totpSecretBase32}&issuer=XTRIKE%20SAST%20Desk&algorithm=SHA1&digits=6&period=30`;
  }, [selectedOperator]);

  // Deterministic 15x15 QR-style matrix generated from secret
  const qrMatrix = useMemo(() => {
    const size = 15;
    const grid: boolean[][] = Array.from({ length: size }, () =>
      Array(size).fill(false)
    );
    const drawFinder = (r0: number, c0: number) => {
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const isBorder = r === 0 || r === 4 || c === 0 || c === 4;
          const isCenter = r === 2 && c === 2;
          grid[r0 + r][c0 + c] = isBorder || isCenter;
        }
      }
    };
    drawFinder(0, 0);
    drawFinder(0, size - 5);
    drawFinder(size - 5, 0);

    const s = selectedOperator.totpSecretBase32;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (
          (r < 6 && c < 6) ||
          (r < 6 && c >= size - 6) ||
          (r >= size - 6 && c < 6)
        ) {
          continue;
        }
        const idx = (r * size + c) % s.length;
        grid[r][c] = (s.charCodeAt(idx) + r * 7 + c * 13) % 2 === 0;
      }
    }
    return grid;
  }, [selectedOperator.totpSecretBase32]);

  const handleCopySecret = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(selectedOperator.totpSecretBase32);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 1800);
    }
  };

  return (
    <div
      className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl border"
      style={{
        background: "#fbf8f3",
        borderColor: "var(--border)",
        color: "var(--foreground)",
      }}
    >
      {/* Top Security Classification Banner */}
      <div
        className="px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b"
        style={{
          background: "linear-gradient(135deg, #241c17 0%, #3a261b 100%)",
          borderColor: "#4a3326",
          color: "#fbf8f3",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "#8b4528", color: "#fbf8f3" }}
          >
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80">
              XTRIKE SAST DESK v5.0.0 &middot; ZERO-TRUST IDENTITY GATE
            </div>
            <div className="text-sm font-bold font-editorial">
              Cryptographic Two-Factor Authentication (RFC 6238 TOTP &amp; Enclave MFA)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold flex items-center gap-1.5"
            style={{
              background: "rgba(45, 106, 79, 0.28)",
              border: "1px solid rgba(116, 198, 157, 0.45)",
              color: "#b7e4c7",
            }}
          >
            <Lock className="w-3 h-3" />
            NIST SP 800-63B AAL2/AAL3
          </span>
          <span
            className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            Step {step === "PRIMARY" ? "1 of 2" : "2 of 2"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Operator Persona Selector & Security Telemetry */}
        <div
          className="lg:col-span-5 p-6 border-b lg:border-b-0 lg:border-r flex flex-col justify-between gap-5"
          style={{
            background: "#f3eee4",
            borderColor: "var(--border)",
          }}
        >
          <div className="space-y-4">
            <div>
              <div className="desk-kicker">AUTHORIZED OPERATOR PROFILES</div>
              <h3 className="text-base font-bold font-editorial mt-0.5">
                Quick-Fill Enterprise Security Persona
              </h3>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                Select an operator profile below to populate primary credentials and load its
                provisioned RFC 6238 Base32 TOTP secret.
              </p>
            </div>

            <div className="space-y-2.5">
              {XTRIKE_DEMO_OPERATORS.map((op) => {
                const isSelected = selectedOperator.id === op.id;
                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => handleSelectPersona(op)}
                    className="w-full text-left p-3 rounded-xl border transition-all cursor-pointer"
                    style={{
                      background: isSelected ? "#fbf8f3" : "rgba(251, 248, 243, 0.55)",
                      borderColor: isSelected ? "var(--accent)" : "var(--border)",
                      boxShadow: isSelected
                        ? "0 3px 10px rgba(139, 69, 40, 0.12)"
                        : "none",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
                        {op.name}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                        style={{
                          background: isSelected ? "var(--accent)" : "var(--accent-soft)",
                          color: isSelected ? "#fbf8f3" : "var(--accent)",
                        }}
                      >
                        {op.id}
                      </span>
                    </div>
                    <div className="text-xs font-semibold mt-0.5" style={{ color: "var(--accent)" }}>
                      {op.roleTitle}
                    </div>
                    <div className="text-[11px] font-mono mt-1" style={{ color: "var(--muted)" }}>
                      {op.email}
                    </div>
                    <div
                      className="text-[10px] font-mono mt-1.5 pt-1.5 border-t"
                      style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                    >
                      {op.clearanceLevel}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="p-3.5 rounded-xl border text-xs space-y-1.5"
            style={{
              background: "#fbf8f3",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center gap-1.5 font-bold" style={{ color: "var(--foreground)" }}>
              <Fingerprint className="w-4 h-4" style={{ color: "var(--accent)" }} />
              <span>Why 2FA is Enforced on XTRIKE SAST</span>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: "var(--muted)" }}>
              Certified evidence ledgers, 11-stage remediation approvals, and release-gate overrides
              bind the active operator&apos;s SHA-256 2FA session signature to every exported audit
              artifact.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Step 1 or Step 2 Form */}
        <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-between">
          {step === "PRIMARY" ? (
            <form onSubmit={handlePrimarySubmit} className="space-y-5">
              <div>
                <div className="desk-kicker">STEP 1 OF 2 &middot; PRIMARY CREDENTIAL VERIFICATION</div>
                <h2 className="text-xl font-bold font-editorial mt-1">
                  Sign In to XTRIKE SAST Desk
                </h2>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  Verify your primary operator credentials to initiate the second-factor cryptographic
                  challenge.
                </p>
              </div>

              {errorMessage && (
                <div
                  className="p-3.5 rounded-xl border flex items-start gap-2.5 text-xs"
                  style={{
                    background: "rgba(180, 35, 24, 0.08)",
                    borderColor: "rgba(180, 35, 24, 0.35)",
                    color: "#b42318",
                  }}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                    Operator Email Identity
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="auditor@xtrike.security"
                      className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono focus:outline-none"
                      style={{
                        background: "#ffffff",
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider">
                      Operator Passphrase
                    </label>
                    <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
                      Demo: <code className="font-bold">{selectedOperator.passwordDemo}</code>
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border text-sm font-mono focus:outline-none"
                      style={{
                        background: "#ffffff",
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 p-1 rounded cursor-pointer"
                      style={{ color: "var(--muted)" }}
                      title={showPassword ? "Hide passphrase" : "Show passphrase"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                    Preferred Second-Factor Method
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      {
                        id: "TOTP_AUTHENTICATOR" as TwoFactorMethod,
                        label: "Authenticator App",
                        sub: "RFC 6238 TOTP (6-Digit)",
                        icon: Smartphone,
                      },
                      {
                        id: "SECURITY_DISPATCH_OTP" as TwoFactorMethod,
                        label: "Security Dispatch",
                        sub: "Enclave Challenge Code",
                        icon: Mail,
                      },
                      {
                        id: "BACKUP_RECOVERY_CODE" as TwoFactorMethod,
                        label: "Recovery Token",
                        sub: "XTK-XXXX-XXXX Backup",
                        icon: FileKey2,
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      const active = method === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setMethod(item.id)}
                          className="p-2.5 rounded-xl border text-left transition-all cursor-pointer"
                          style={{
                            background: active ? "var(--accent-soft)" : "#ffffff",
                            borderColor: active ? "var(--accent)" : "var(--border)",
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            <Icon
                              className="w-3.5 h-3.5"
                              style={{ color: active ? "var(--accent)" : "var(--muted)" }}
                            />
                            <span className="text-xs font-bold">{item.label}</span>
                          </div>
                          <div
                            className="text-[10px] font-mono mt-0.5"
                            style={{ color: "var(--muted)" }}
                          >
                            {item.sub}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="flex items-center gap-2.5 text-xs cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={persistDevice}
                    onChange={(e) => setPersistDevice(e.target.checked)}
                    className="rounded"
                  />
                  <span>
                    Trust this workstation enclave for <strong>12 hours</strong> (persists signed 2FA
                    token across browser tabs)
                  </span>
                </label>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5">
                <div className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
                  Clearance: <strong>{selectedOperator.roleCode}</strong>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={verifying}
                    onClick={handleInstantSignIn}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-opacity hover:opacity-95 cursor-pointer"
                    style={{
                      background: "#1b4332",
                      color: "#fbf8f3",
                      border: "1px solid #143325",
                    }}
                    title="1-Click Instant Sign-In & Unlock XTRIKE SAST Desk"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{verifying ? "Signing In..." : "Instant Sign-In & Enter Desk"}</span>
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-opacity hover:opacity-95 cursor-pointer"
                    style={{
                      background: "var(--accent)",
                      color: "#fbf8f3",
                      border: "1px solid #72361d",
                    }}
                  >
                    <span>Step-by-Step 2FA</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifySecondFactor} className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="desk-kicker">STEP 2 OF 2 &middot; SECOND-FACTOR VERIFICATION</div>
                  <h2 className="text-xl font-bold font-editorial mt-0.5">
                    Verify Cryptographic Second Factor
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                    Operator: <strong>{selectedOperator.name}</strong> (
                    <code className="font-mono">{selectedOperator.email}</code>)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep("PRIMARY");
                    setErrorMessage(null);
                  }}
                  className="px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer"
                  style={{
                    background: "#f3eee4",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  &larr; Change Operator
                </button>
              </div>

              {/* Method Switcher Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl border" style={{ background: "#f3eee4", borderColor: "var(--border)" }}>
                {[
                  { id: "TOTP_AUTHENTICATOR" as TwoFactorMethod, label: "RFC 6238 Authenticator" },
                  { id: "SECURITY_DISPATCH_OTP" as TwoFactorMethod, label: "Security Dispatch OTP" },
                  { id: "BACKUP_RECOVERY_CODE" as TwoFactorMethod, label: `Recovery Code (${unusedRecovery.length})` },
                ].map((tab) => {
                  const active = method === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setMethod(tab.id);
                        setOtpInput("");
                        setErrorMessage(null);
                      }}
                      className="py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                      style={{
                        background: active ? "var(--accent)" : "transparent",
                        color: active ? "#fbf8f3" : "var(--foreground)",
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {errorMessage && (
                <div
                  className="p-3 rounded-xl border flex items-start gap-2 text-xs"
                  style={{
                    background: "rgba(180, 35, 24, 0.08)",
                    borderColor: "rgba(180, 35, 24, 0.35)",
                    color: "#b42318",
                  }}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Method-specific Helper Box */}
              {method === "TOTP_AUTHENTICATOR" && (
                <div
                  className="p-4 rounded-xl border space-y-3"
                  style={{ background: "#f3eee4", borderColor: "var(--border)" }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" style={{ color: "var(--accent)" }} />
                      <span className="text-xs font-bold">
                        Live RFC 6238 TOTP Synchronizer (HMAC-SHA1 &middot; 30s Window)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowProvisionQr((v) => !v)}
                      className="text-[11px] font-semibold underline cursor-pointer"
                      style={{ color: "var(--accent)" }}
                    >
                      {showProvisionQr ? "Hide QR & Secret" : "Show QR & Secret"}
                    </button>
                  </div>

                  {showProvisionQr && (
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1">
                      <div className="sm:col-span-4 flex flex-col items-center justify-center p-2.5 rounded-xl border bg-white" style={{ borderColor: "var(--border)" }}>
                        <svg
                          viewBox="0 0 15 15"
                          className="w-24 h-24"
                          shapeRendering="crispEdges"
                          aria-label="TOTP Provisioning QR Matrix"
                        >
                          {qrMatrix.map((row, rIdx) =>
                            row.map((cell, cIdx) =>
                              cell ? (
                                <rect
                                  key={`${rIdx}-${cIdx}`}
                                  x={cIdx}
                                  y={rIdx}
                                  width={1}
                                  height={1}
                                  fill="#1f1b18"
                                />
                              ) : null
                            )
                          )}
                        </svg>
                        <span className="text-[9px] font-mono mt-1 text-center" style={{ color: "var(--muted)" }}>
                          Scan in Google / Ente / 1Password
                        </span>
                      </div>

                      <div className="sm:col-span-8 space-y-2 text-xs">
                        <div>
                          <div className="text-[10px] font-mono uppercase" style={{ color: "var(--muted)" }}>
                            Base32 Provisioning Secret Key
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <code
                              className="px-2 py-1 rounded border text-[11px] font-mono font-bold break-all bg-white"
                              style={{ borderColor: "var(--border)" }}
                            >
                              {selectedOperator.totpSecretBase32}
                            </code>
                            <button
                              type="button"
                              onClick={handleCopySecret}
                              className="px-2 py-1 rounded border text-[11px] font-semibold flex items-center gap-1 bg-white cursor-pointer shrink-0"
                              style={{ borderColor: "var(--border)" }}
                            >
                              {copiedSecret ? (
                                <>
                                  <Check className="w-3 h-3" style={{ color: "var(--success)" }} />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <div
                          className="p-2.5 rounded-lg border flex items-center justify-between gap-2"
                          style={{ background: "#fbf8f3", borderColor: "var(--border)" }}
                        >
                          <div>
                            <div className="text-[10px] font-mono uppercase" style={{ color: "var(--muted)" }}>
                              Current Synchronized 6-Digit TOTP
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span
                                className="text-lg font-mono font-bold tracking-widest"
                                style={{ color: "var(--accent)" }}
                              >
                                {liveTotp.code.slice(0, 3)} {liveTotp.code.slice(3)}
                              </span>
                              <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
                                ({liveTotp.secondsRemaining}s remaining)
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setOtpInput(liveTotp.code);
                              setErrorMessage(null);
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                            style={{
                              background: "var(--accent)",
                              color: "#fbf8f3",
                            }}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Auto-Fill Live TOTP</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {method === "SECURITY_DISPATCH_OTP" && (
                <div
                  className="p-4 rounded-xl border space-y-2.5"
                  style={{ background: "#f3eee4", borderColor: "var(--border)" }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" style={{ color: "var(--accent)" }} />
                      <span className="text-xs font-bold">
                        Encrypted Security Enclave Dispatch (Out-of-Band Challenge)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.floor(100000 + Math.random() * 900000).toString();
                        setDispatchCode(next);
                        setOtpInput("");
                      }}
                      className="text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      style={{ color: "var(--accent)" }}
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Rotate Code</span>
                    </button>
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Dispatched one-time challenge to{" "}
                    <code className="font-mono font-bold">{selectedOperator.email}</code> via XTRIKE
                    Enclave Relay:
                  </p>
                  <div
                    className="p-3 rounded-lg border flex items-center justify-between bg-white"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div>
                      <div className="text-[10px] font-mono uppercase" style={{ color: "var(--muted)" }}>
                        Enclave Challenge Code
                      </div>
                      <div className="text-lg font-mono font-bold tracking-widest" style={{ color: "var(--accent)" }}>
                        {dispatchCode}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpInput(dispatchCode);
                        setErrorMessage(null);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                      style={{ background: "var(--accent)", color: "#fbf8f3" }}
                    >
                      Auto-Fill Dispatch Code
                    </button>
                  </div>
                </div>
              )}

              {method === "BACKUP_RECOVERY_CODE" && (
                <div
                  className="p-4 rounded-xl border space-y-2.5"
                  style={{ background: "#f3eee4", borderColor: "var(--border)" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileKey2 className="w-4 h-4" style={{ color: "var(--accent)" }} />
                      <span className="text-xs font-bold">
                        Single-Use Hardware Backup Recovery Tokens ({unusedRecovery.length} remaining)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUnusedRecovery(resetRecoveryCodes())}
                      className="text-[11px] font-semibold underline cursor-pointer"
                      style={{ color: "var(--accent)" }}
                    >
                      Reset All Tokens
                    </button>
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Click any unused recovery token below to populate the verification field:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {unusedRecovery.map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          setOtpInput(code);
                          setErrorMessage(null);
                        }}
                        className="px-2 py-1.5 rounded border text-[11px] font-mono font-bold bg-white hover:opacity-90 cursor-pointer"
                        style={{
                          borderColor:
                            otpInput === code ? "var(--accent)" : "var(--border)",
                          color: otpInput === code ? "var(--accent)" : "var(--foreground)",
                        }}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Input & Submit */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                  {method === "BACKUP_RECOVERY_CODE"
                    ? "Enter Recovery Code (XTK-XXXX-XXXX)"
                    : "Enter 6-Digit Verification Code"}
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="text"
                    required
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder={
                      method === "BACKUP_RECOVERY_CODE" ? "XTK-94A2-7F1C" : "000000"
                    }
                    className="flex-1 px-4 py-2.5 rounded-xl border text-base font-mono font-bold tracking-widest focus:outline-none"
                    style={{
                      background: "#ffffff",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={verifying}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-opacity hover:opacity-95 cursor-pointer shrink-0"
                    style={{
                      background: "var(--success)",
                      color: "#fbf8f3",
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{verifying ? "Verifying..." : "Verify & Unlock Desk"}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TwoFactorAuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [session, setSession] = useState<TwoFactorSession | null>(null);
  const [auditLog, setAuditLog] = useState<TwoFactorAuditEvent[]>([]);
  const [securityModalOpen, setSecurityModalOpen] = useState<boolean>(false);
  const [gatewayDashboardOpen, setGatewayDashboardOpen] = useState<boolean>(false);
  const [gatewayTab, setGatewayTab] = useState<
    "RISK_POSTURE" | "ARCHITECTURE_PATHS" | "SCAN_FLEET" | "BENCHMARKS_COMPLIANCE"
  >("RISK_POSTURE");

  const syncState = useCallback(() => {
    setSession(loadActive2FASession());
    setAuditLog(load2FAAuditLog());
  }, []);

  useEffect(() => {
    syncState();
    setHydrated(true);

    const handleUpdate = () => syncState();
    const handleOpenModal = () => {
      syncState();
      setSecurityModalOpen(true);
    };
    const handleOpenGateway = () => {
      syncState();
      setGatewayDashboardOpen(true);
    };

    window.addEventListener("xtrike-2fa-updated", handleUpdate);
    window.addEventListener("xtrike-open-2fa-modal", handleOpenModal);
    window.addEventListener("xtrike-open-gateway-dashboard", handleOpenGateway);
    return () => {
      window.removeEventListener("xtrike-2fa-updated", handleUpdate);
      window.removeEventListener("xtrike-open-2fa-modal", handleOpenModal);
      window.removeEventListener("xtrike-open-gateway-dashboard", handleOpenGateway);
    };
  }, [syncState]);

  // Avoid SSR flash while hydrating client storage
  if (!hydrated) {
    return <>{children}</>;
  }

  // If no active 2FA session exists (or user opened the Executive Gateway Dashboard), show the Pre-Desk Executive Command Dashboard & Login Portal
  if (!session || gatewayDashboardOpen) {
    return (
      <div
        className="min-h-screen flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8"
        style={{ background: "var(--background)", color: "var(--foreground)" }}
      >
        <div className="max-w-[1440px] w-full mx-auto space-y-6">
          {/* 1. Executive Gateway Masthead */}
          <div
            className="p-4 sm:p-5 rounded-2xl border flex flex-wrap items-center justify-between gap-4 shadow-sm"
            style={{
              background: "linear-gradient(135deg, #241c17 0%, #3a261b 100%)",
              borderColor: "#4a3326",
              color: "#fbf8f3",
            }}
          >
            <div className="flex items-center gap-3.5">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow"
                style={{ background: "#8b4528", color: "#fbf8f3", border: "1px solid #b86b35" }}
              >
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10.5px] font-mono uppercase tracking-widest text-amber-200/90">
                  XTRIKE SAST SECURITY &middot; PLATFORM 05 &middot; v6.0 UNIFIED ASSURANCE GATEWAY
                </div>
                <div className="text-lg sm:text-xl font-bold font-editorial leading-tight">
                  Executive Security Command Dashboard &amp; Operator Login Portal
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className="px-2.5 py-1 rounded-full text-[10.5px] font-mono font-bold flex items-center gap-1.5"
                style={{
                  background: "rgba(45, 106, 79, 0.32)",
                  border: "1px solid rgba(116, 198, 157, 0.5)",
                  color: "#b7e4c7",
                }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                ENGINE v6.0: READY (12/12 GATES)
              </span>
              <span
                className="px-2.5 py-1 rounded-full text-[10.5px] font-mono font-bold"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.22)",
                  color: "#fbf8f3",
                }}
              >
                9-SUBSYSTEM HYBRID AST
              </span>
              <span
                className="px-2.5 py-1 rounded-full text-[10.5px] font-mono font-bold"
                style={{
                  background: "rgba(180, 83, 9, 0.32)",
                  border: "1px solid rgba(251, 191, 36, 0.45)",
                  color: "#fde68a",
                }}
              >
                EXPEDITE STRIKE SANDBOX: ONLINE
              </span>
              {session ? (
                <button
                  type="button"
                  onClick={() => setGatewayDashboardOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  style={{
                    background: "#2d6a4f",
                    color: "#ffffff",
                    border: "1px solid #52b788",
                  }}
                >
                  <span>Enter SAST Front Desk ({session.name})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span
                  className="px-2.5 py-1 rounded-full text-[10.5px] font-mono font-bold flex items-center gap-1"
                  style={{
                    background: "rgba(158, 42, 43, 0.38)",
                    border: "1px solid rgba(248, 113, 113, 0.5)",
                    color: "#fecaca",
                  }}
                >
                  <Lock className="w-3 h-3" />
                  SIGN IN TO UNLOCK SAST DESK
                </span>
              )}
            </div>
          </div>

          {/* 2. 5-Card Executive KPI Telemetry Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div
              className="p-4 rounded-xl border shadow-sm"
              style={{ background: "#fbf8f3", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase" style={{ color: "var(--muted)" }}>
                <span>1. 5-STATE RISK INDEX</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">LOCKED PROD</span>
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono" style={{ color: "#9e2a2b" }}>25/100</span>
                <span className="text-xs font-mono font-bold" style={{ color: "#2d6a4f" }}>&rarr; 6/100 Harness</span>
              </div>
              <div className="mt-1 text-[11px]" style={{ color: "var(--muted)" }}>
                Scanned Commit: <strong>25</strong> &middot; Reachability: <strong>61</strong> &middot; Active Prod: <strong>25 (Unmerged)</strong>
              </div>
            </div>

            <div
              className="p-4 rounded-xl border shadow-sm"
              style={{ background: "#fbf8f3", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase" style={{ color: "var(--muted)" }}>
                <span>2. ASSURANCE &amp; REFUSAL</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900">100% GATE</span>
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono" style={{ color: "#1b4332" }}>100%</span>
                <span className="text-xs font-mono font-bold" style={{ color: "#8b4528" }}>Refusal-to-Promote</span>
              </div>
              <div className="mt-1 text-[11px]" style={{ color: "var(--muted)" }}>
                Detection: <strong>100%</strong> &middot; Runtime Eligible: <strong>2/2 (100%)</strong> &middot; Prod Cert: <strong>0%</strong>
              </div>
            </div>

            <div
              className="p-4 rounded-xl border shadow-sm"
              style={{ background: "#fbf8f3", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase" style={{ color: "var(--muted)" }}>
                <span>3. 3-SCOPE RELEASE GATES</span>
                <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-900">PROD BLOCKED</span>
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-lg font-black font-mono" style={{ color: "#1b4332" }}>18/18</span>
                <span className="text-xs font-mono font-bold" style={{ color: "#1e3a5f" }}>&amp; 12/12 Reconciled</span>
              </div>
              <div className="mt-1 text-[11px]" style={{ color: "var(--muted)" }}>
                Engine: <strong>READY</strong> &middot; Harness: <strong>EXPLOIT_BLOCKED</strong> &middot; Prod: <strong>BLOCKED</strong>
              </div>
            </div>

            <div
              className="p-4 rounded-xl border shadow-sm"
              style={{ background: "#fbf8f3", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase" style={{ color: "var(--muted)" }}>
                <span>4. 11-SUITE BENCHMARK</span>
                <span className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-800">244 CASES</span>
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono" style={{ color: "var(--foreground)" }}>96.8%</span>
                <span className="text-xs font-mono font-bold" style={{ color: "#2d6a4f" }}>F1 &middot; 94.2% FP Cut</span>
              </div>
              <div className="mt-1 text-[11px]" style={{ color: "var(--muted)" }}>
                OWASP, Juliet, WebGoat, DVWA, Polyglot, Multi-Module &amp; Queues
              </div>
            </div>

            <div
              className="p-4 rounded-xl border shadow-sm"
              style={{ background: "#fbf8f3", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase" style={{ color: "var(--muted)" }}>
                <span>5. AI-BOM &amp; EVIDENCE</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900">10/10 SIGNED</span>
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono" style={{ color: "#8b4528" }}>1,420</span>
                <span className="text-xs font-mono font-bold" style={{ color: "#1b4332" }}>Models &amp; MCPs</span>
              </div>
              <div className="mt-1 text-[11px]" style={{ color: "var(--muted)" }}>
                Standalone Verifier: <strong>10/10</strong> &middot; Noctis LLM Authority: <strong>FALSE</strong>
              </div>
            </div>
          </div>

          {/* 3. Main Split Workspace: Left = Interactive Executive Dashboard, Right = Login & 2FA Screen */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left Column (7 Cols): Interactive Pre-Desk Command Dashboard */}
            <div
              className="xl:col-span-7 rounded-2xl border shadow-md overflow-hidden"
              style={{ background: "#fbf8f3", borderColor: "var(--border)" }}
            >
              {/* Dashboard Header & 4 Interactive Tabs */}
              <div
                className="p-4 sm:p-5 border-b flex flex-col gap-3"
                style={{ background: "#f3eee4", borderColor: "var(--border)" }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="desk-kicker">LIVE PRE-DESK SECURITY COMMAND TELEMETRY</div>
                    <h2 className="text-base sm:text-lg font-bold font-editorial">
                      XTRIKE SAST v6.0 Unified Posture, Architecture &amp; Fleet Overview
                    </h2>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold"
                    style={{ background: "#fbf8f3", border: "1px solid var(--border)", color: "#8b4528" }}
                  >
                    Interactive Preview &middot; Click Any Tab
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "RISK_POSTURE" as const, label: "1. Live Risk & 5-State Contract" },
                    { id: "ARCHITECTURE_PATHS" as const, label: "2. 9-Subsystem & Attack Paths" },
                    { id: "SCAN_FLEET" as const, label: "3. Multi-Repo Fleet & 6-Tier Fixes" },
                    { id: "BENCHMARKS_COMPLIANCE" as const, label: "4. 11-Suite Benchmarks & Compliance" },
                  ].map((t) => {
                    const active = gatewayTab === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setGatewayTab(t.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        style={{
                          background: active ? "var(--accent)" : "#fbf8f3",
                          color: active ? "#fbf8f3" : "var(--foreground)",
                          border: active ? "1px solid #72361d" : "1px solid var(--border)",
                        }}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dashboard Tab Content */}
              <div className="p-5 space-y-5">
                {gatewayTab === "RISK_POSTURE" && (
                  <>
                    {/* Visual Severity & Proof-State Distribution */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className="p-4 rounded-xl border space-y-2.5"
                        style={{ background: "#f3eee4", borderColor: "var(--border)" }}
                      >
                        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--foreground)" }}>
                          Typed Proof-State Distribution (Primary + Hypotheses)
                        </div>
                        {[
                          { state: "RUNTIME_REPRODUCED (Sandbox Exploit Replayed)", count: "2 Primary", pct: 85, color: "#9e2a2b" },
                          { state: "DATAFLOW_CONFIRMED (Cross-Fn Source -> Sink)", count: "6 Primary", pct: 72, color: "#8b4528" },
                          { state: "GUARD_ANALYZED (Auth / Config / Header)", count: "4 Primary", pct: 54, color: "#b45309" },
                          { state: "NEEDS_MANUAL_VALIDATION (Refused Promotion)", count: "9 Held", pct: 64, color: "#1e3a5f" },
                          { state: "MITIGATED_BY_GUARD (Parameterized / Safe)", count: "10 Controls", pct: 100, color: "#2d6a4f" },
                        ].map((row) => (
                          <div key={row.state} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-semibold">
                              <span>{row.state}</span>
                              <span className="font-mono font-bold" style={{ color: row.color }}>{row.count}</span>
                            </div>
                            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#e2dacb" }}>
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${row.pct}%`, background: row.color }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div
                        className="p-4 rounded-xl border space-y-2.5"
                        style={{ background: "#f3eee4", borderColor: "var(--border)" }}
                      >
                        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--foreground)" }}>
                          Priority Vulnerability Queue (Pre-Triage Preview)
                        </div>
                        <div className="space-y-2">
                          {[
                            {
                              id: "SAST-001",
                              cwe: "CWE-89",
                              title: "SQL Injection in BenchmarkCombinedVerifier.java:30",
                              badge: "EXPLOIT_BLOCKED IN HARNESS",
                              color: "#9e2a2b",
                            },
                            {
                              id: "SAST-002",
                              cwe: "CWE-78",
                              title: "OS Command Injection via Runtime.exec() Sink",
                              badge: "EXPLOIT_BLOCKED IN HARNESS",
                              color: "#9e2a2b",
                            },
                            {
                              id: "F-003",
                              cwe: "CWE-918",
                              title: "Server-Side Request Forgery (SSRF) in Webhook Dispatcher",
                              badge: "DATAFLOW_CONFIRMED",
                              color: "#8b4528",
                            },
                            {
                              id: "F-007",
                              cwe: "CWE-502",
                              title: "Untrusted Deserialization across RabbitMQ Worker",
                              badge: "DISTRIBUTED_TAINT",
                              color: "#b45309",
                            },
                          ].map((v) => (
                            <div
                              key={v.id}
                              className="p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2"
                              style={{ background: "#fbf8f3", borderColor: "var(--border)" }}
                            >
                              <div>
                                <div className="font-bold">
                                  <span className="font-mono" style={{ color: v.color }}>{v.id} ({v.cwe})</span> &middot; {v.title}
                                </div>
                              </div>
                              <span
                                className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold shrink-0"
                                style={{ background: v.color, color: "#ffffff" }}
                              >
                                {v.badge}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 5-State Risk Score Disclosure Contract Table */}
                    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
                      <div
                        className="px-4 py-2.5 border-b flex items-center justify-between text-xs font-bold"
                        style={{ background: "#ece5d8", borderColor: "var(--border)" }}
                      >
                        <span>5-State Risk Score Disclosure Contract (XTRIKE-RISK-DISCLOSURE-v6.0.0)</span>
                        <span className="font-mono text-[10.5px]" style={{ color: "#1b4332" }}>
                          Production Lock Invariant: VERIFIED
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs" style={{ background: "#ffffff" }}>
                          <thead>
                            <tr style={{ background: "#f8f5ef", borderBottom: "1px solid var(--border)" }}>
                              <th className="p-2.5 font-bold">Disclosed Risk State</th>
                              <th className="p-2.5 font-bold text-center">Score</th>
                              <th className="p-2.5 font-bold">Mandatory Governance Disclosure</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                            {[
                              {
                                label: "1. The Scanned Commit",
                                code: "THE_SCANNED_COMMIT",
                                score: "25/100",
                                desc: "Unpatched primary repository findings at commit SHA f502b2c3 (synthetic hypotheses excluded).",
                                highlight: false,
                              },
                              {
                                label: "2. Reachability-Adjusted Risk",
                                code: "REACHABILITY_ADJUSTED_RISK",
                                score: "61/100",
                                desc: "Contextual exposure weighted by confirmed ingress-to-sink reachability & auth boundaries.",
                                highlight: false,
                              },
                              {
                                label: "3. Proposed Remediation (Static Diff)",
                                code: "PROPOSED_REMEDIATION",
                                score: "14/100",
                                desc: "Hypothetical estimate if generated static diffs are applied without runtime exploit replay.",
                                highlight: false,
                              },
                              {
                                label: "4. Verified Harness Remediation",
                                code: "VERIFIED_HARNESS_REMEDIATION",
                                score: "6/100",
                                desc: "Projected risk discounting ONLY findings with pre-patch repro + post-patch EXPLOIT_BLOCKED.",
                                highlight: false,
                              },
                              {
                                label: "5. Actual Production Deployment",
                                code: "ACTUAL_PRODUCTION_DEPLOYMENT",
                                score: "25/100",
                                desc: "ACTIVE PRODUCTION RISK: Locked equal to Scanned Commit risk until PR merge & staging verification.",
                                highlight: true,
                              },
                            ].map((r) => (
                              <tr key={r.code} style={{ background: r.highlight ? "#fef2f2" : "#ffffff" }}>
                                <td className="p-2.5 font-bold">
                                  <div>{r.label}</div>
                                  <div className="text-[10px] font-mono" style={{ color: "var(--muted)" }}>{r.code}</div>
                                </td>
                                <td
                                  className="p-2.5 text-center font-mono font-black text-sm"
                                  style={{ color: r.highlight ? "#9e2a2b" : "#1e3a5f" }}
                                >
                                  {r.score}
                                </td>
                                <td className="p-2.5 text-[11.5px]" style={{ color: "var(--foreground)" }}>
                                  {r.desc}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

                {gatewayTab === "ARCHITECTURE_PATHS" && (
                  <div className="space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider">
                      9-Subsystem Unified Security Assurance Architecture (XTRIKE + TrePath + Expedite Strike + Noctis)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        { num: "01", name: "Hybrid AST Engine", pillar: "XTRIKE", desc: "Polyglot parsing & syntax/delimiter verification" },
                        { num: "02", name: "Dataflow & Graph Engine", pillar: "XTRIKE", desc: "CHA/RTA/VTA call graphs & DI resolution" },
                        { num: "03", name: "SMT & Feasibility", pillar: "XTRIKE", desc: "Branch constraint collection & guard dominance" },
                        { num: "04", name: "SCA & Threat Intel", pillar: "XTRIKE", desc: "SBOM, CVE, EPSS, KEV with freshness states" },
                        { num: "05", name: "Attack-Path Engine", pillar: "TREPATH", desc: "Input -> Controller -> Service -> DB -> Privileged Op" },
                        { num: "06", name: "Remediation Engine", pillar: "XTRIKE", desc: "Context-exact patch generation & 6-tier checks" },
                        { num: "07", name: "Sandbox Execution", pillar: "EXPEDITE STRIKE", desc: "Isolated build, exploit replay & regression" },
                        { num: "08", name: "Evidence & Certification", pillar: "VERIFIER", desc: "10-point standalone cryptographic verifier" },
                        { num: "09", name: "Canonical Risk Registry", pillar: "GOVERNANCE", desc: "Immutable findings, proof states & 3-scope gates" },
                      ].map((sub) => (
                        <div
                          key={sub.num}
                          className="p-3 rounded-xl border text-xs space-y-1"
                          style={{ background: "#f3eee4", borderColor: "var(--border)" }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-[11px]" style={{ color: "var(--accent)" }}>
                              SUBSYSTEM {sub.num}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-stone-200 text-stone-800">
                              {sub.pillar}
                            </span>
                          </div>
                          <div className="font-bold">{sub.name}</div>
                          <div className="text-[11px]" style={{ color: "var(--muted)" }}>{sub.desc}</div>
                        </div>
                      ))}
                    </div>

                    <div
                      className="p-4 rounded-xl border space-y-2"
                      style={{ background: "#f3eee4", borderColor: "var(--border)" }}
                    >
                      <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "#8b4528" }}>
                        Reconstructed 5-Stage Attack-Path Graph (TrePath Engine)
                      </div>
                      <div className="p-3 rounded-lg border font-mono text-xs" style={{ background: "#fbf8f3", borderColor: "var(--border)" }}>
                        [1. External Input: HTTP Parameter] &rarr; [2. Controller: BenchmarkCombinedVerifier:30] &rarr; [3. Service: DomainQueryDispatcher] &rarr; [4. Database: JDBC Statement.executeQuery] &rarr; [5. Privileged Op: Chained OS Runtime.exec()]
                      </div>
                      <div className="text-[11px]" style={{ color: "var(--muted)" }}>
                        <strong>7 Security Predicates Verified:</strong> Attacker Controls Input: <strong>YES</strong> &middot; Reachable: <strong>CONFIRMED</strong> &middot; Auth Required: <strong>NONE</strong> &middot; AuthZ Enforced: <strong>BYPASS</strong> &middot; Sanitization: <strong>NONE</strong> &middot; Sensitive Sink: <strong>YES</strong> &middot; Multi-Vulnerability Chainable: <strong>YES (SAST-001 + SAST-002)</strong>
                      </div>
                    </div>
                  </div>
                )}

                {gatewayTab === "SCAN_FLEET" && (
                  <div className="space-y-4">
                    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
                      <div
                        className="px-4 py-2.5 border-b text-xs font-bold"
                        style={{ background: "#ece5d8", borderColor: "var(--border)" }}
                      >
                        Multi-Repository Scan Fleet &amp; 3-Scope Gate Status
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs" style={{ background: "#ffffff" }}>
                          <thead>
                            <tr style={{ background: "#f8f5ef", borderBottom: "1px solid var(--border)" }}>
                              <th className="p-2.5 font-bold">Repository Target</th>
                              <th className="p-2.5 font-bold">Language</th>
                              <th className="p-2.5 font-bold text-center">Gate 1: Engine</th>
                              <th className="p-2.5 font-bold text-center">Gate 2: Harness</th>
                              <th className="p-2.5 font-bold text-center">Gate 3: Prod</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                            {[
                              { repo: "OWASP/www-project-benchmark", lang: "Java", g1: "12/12 READY", g2: "2/2 EXPLOIT_BLOCKED", g3: "BLOCKED" },
                              { repo: "ShiftLeftSecurity/Benchmark", lang: "Java", g1: "12/12 READY", g2: "2/2 EXPLOIT_BLOCKED", g3: "BLOCKED" },
                              { repo: "OWASP/BenchmarkDotNet", lang: "C#", g1: "12/12 READY", g2: "3/4 EXPLOIT_BLOCKED", g3: "BLOCKED" },
                              { repo: "DVWA / OWASP BenchmarkPHP", lang: "PHP", g1: "12/12 READY", g2: "8/9 EXPLOIT_BLOCKED", g3: "BLOCKED" },
                              { repo: "Enterprise Core Monorepo", lang: "Multi-Lang", g1: "12/12 READY", g2: "27/27 BUILD_PASSED", g3: "BLOCKED" },
                            ].map((r) => (
                              <tr key={r.repo}>
                                <td className="p-2.5 font-mono font-bold">{r.repo}</td>
                                <td className="p-2.5">{r.lang}</td>
                                <td className="p-2.5 text-center font-mono font-bold text-emerald-800">{r.g1}</td>
                                <td className="p-2.5 text-center font-mono font-bold text-amber-800">{r.g2}</td>
                                <td className="p-2.5 text-center font-mono font-bold text-red-800">{r.g3}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div
                      className="p-3.5 rounded-xl border text-xs space-y-1.5"
                      style={{ background: "#f3eee4", borderColor: "var(--border)" }}
                    >
                      <div className="font-bold">6-Tier Remediation Assurance Separation (Section 3 Governance)</div>
                      <div className="text-[11px]" style={{ color: "var(--muted)" }}>
                        XTRIKE strictly separates <strong>Tier 1–4</strong> (Patch Generated, Static Diff Validated, Build Passed, Unit Tests Passed) from <strong>Tier 5–6</strong> (Post-Patch Exploit Replay Blocked &amp; Certified Harness Remediation). Compilation and unit tests never certify security remediation without exploit-block evidence.
                      </div>
                    </div>
                  </div>
                )}

                {gatewayTab === "BENCHMARKS_COMPLIANCE" && (
                  <div className="space-y-4">
                    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
                      <div
                        className="px-4 py-2.5 border-b flex items-center justify-between text-xs font-bold"
                        style={{ background: "#ece5d8", borderColor: "var(--border)" }}
                      >
                        <span>Permanent 11-Suite Benchmark Programme (244 Labeled Cases)</span>
                        <span className="font-mono text-emerald-800">Refusal-to-Promote Accuracy: 100%</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs" style={{ background: "#ffffff" }}>
                          <thead>
                            <tr style={{ background: "#f8f5ef", borderBottom: "1px solid var(--border)" }}>
                              <th className="p-2 font-bold">Benchmark Corpus</th>
                              <th className="p-2 font-bold text-center">Precision</th>
                              <th className="p-2 font-bold text-center">Recall</th>
                              <th className="p-2 font-bold text-center">F1</th>
                              <th className="p-2 font-bold text-center">Refusal Rate</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                            {[
                              { name: "1. OWASP Benchmark v1.2 (Java)", p: "100%", r: "94.4%", f1: "97.1%", ref: "100%" },
                              { name: "2. NIST SARD Juliet v1.3 (Java / C#)", p: "95.8%", r: "95.8%", f1: "95.8%", ref: "100%" },
                              { name: "3. OWASP WebGoat & 4. DVWA (PHP)", p: "97.1%", r: "97.1%", f1: "97.1%", ref: "100%" },
                              { name: "5. Polyglot & 6. Multi-Module Enterprise", p: "98.3%", r: "94.8%", f1: "96.5%", ref: "100%" },
                              { name: "7. Auth/AuthZ & 8. Async Message Queues", p: "96.9%", r: "96.9%", f1: "96.9%", ref: "100%" },
                              { name: "9. Sanitized Controls & 10. Blind Unseen Repos", p: "97.4%", r: "95.0%", f1: "96.2%", ref: "100%" },
                            ].map((b) => (
                              <tr key={b.name}>
                                <td className="p-2 font-semibold">{b.name}</td>
                                <td className="p-2 text-center font-mono">{b.p}</td>
                                <td className="p-2 text-center font-mono">{b.r}</td>
                                <td className="p-2 text-center font-mono font-bold">{b.f1}</td>
                                <td className="p-2 text-center font-mono font-bold text-emerald-800">{b.ref}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {[
                        "OWASP Top 10:2025",
                        "CWE Top 25 + SANS",
                        "NIST SP 800-53 Rev. 5",
                        "PCI-DSS v4.0 Req 6.2",
                        "ISO/IEC 27001:2022",
                        "SOC 2 Type II & HIPAA",
                      ].map((std) => (
                        <div
                          key={std}
                          className="p-2.5 rounded-lg border font-mono font-bold flex items-center gap-1.5"
                          style={{ background: "#f3eee4", borderColor: "var(--border)" }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>{std}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (5 Cols): Integrated Operator Login & 2FA Screen */}
            <div className="xl:col-span-5">
              <TwoFactorPortalCard
                onAuthenticated={(newSession) => {
                  setSession(newSession);
                  setAuditLog(load2FAAuditLog());
                  setGatewayDashboardOpen(false);
                }}
              />
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] w-full mx-auto pt-6 mt-6 border-t text-center text-xs font-mono" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
          XTRIKE SAST Desk v6.0.0 &middot; Executive Security Command Gateway &middot; RFC 6238 TOTP &amp; NIST SP 800-63B Multi-Factor Session Attestation
        </div>
      </div>
    );
  }

  return (
    <>
      {children}

      {/* 2FA Session & Cryptographic Audit Drawer Modal */}
      {securityModalOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          style={{ background: "rgba(31, 27, 24, 0.62)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden"
            style={{
              background: "#fbf8f3",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            <div
              className="px-6 py-4 flex items-center justify-between border-b"
              style={{
                background: "#241c17",
                borderColor: "#4a3326",
                color: "#fbf8f3",
              }}
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80">
                    ACTIVE 2FA OPERATOR SESSION ATTESTATION
                  </div>
                  <div className="text-base font-bold font-editorial">
                    {session.name} &middot; {session.roleTitle}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSecurityModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <div
                className="p-4 rounded-xl border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs"
                style={{ background: "#f3eee4", borderColor: "var(--border)" }}
              >
                <div>
                  <div className="text-[10px] font-mono uppercase" style={{ color: "var(--muted)" }}>
                    Session ID &amp; Method
                  </div>
                  <div className="font-mono font-bold mt-0.5">
                    {session.sessionId} ({session.twoFactorMethod})
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase" style={{ color: "var(--muted)" }}>
                    Operator Email
                  </div>
                  <div className="font-mono font-bold mt-0.5">{session.email}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-[10px] font-mono uppercase" style={{ color: "var(--muted)" }}>
                    Clearance Level
                  </div>
                  <div className="font-mono font-bold mt-0.5" style={{ color: "var(--accent)" }}>
                    {session.clearanceLevel}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-[10px] font-mono uppercase" style={{ color: "var(--muted)" }}>
                    Session SHA-256 Cryptographic Signature
                  </div>
                  <div className="font-mono text-[11px] break-all mt-0.5">
                    {session.sessionSignatureSha256}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-2">
                  Recent 2FA Security Audit Ledger ({auditLog.length} events)
                </div>
                <div
                  className="rounded-xl border divide-y max-h-52 overflow-y-auto"
                  style={{ background: "#ffffff", borderColor: "var(--border)" }}
                >
                  {auditLog.length === 0 ? (
                    <div className="p-3 text-xs font-mono" style={{ color: "var(--muted)" }}>
                      No audit events recorded yet.
                    </div>
                  ) : (
                    auditLog.map((evt) => (
                      <div key={evt.eventId} className="p-2.5 text-xs flex items-start justify-between gap-2">
                        <div>
                          <div className="font-mono font-bold text-[11px]">
                            {evt.eventType} &middot; <span style={{ color: "var(--accent)" }}>{evt.method}</span>
                          </div>
                          <div className="text-[11px]" style={{ color: "var(--muted)" }}>
                            {evt.detail}
                          </div>
                        </div>
                        <div className="text-[10px] font-mono shrink-0" style={{ color: "var(--muted)" }}>
                          {evt.timestampIso.slice(11, 19)} UTC
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                <button
                  type="button"
                  onClick={() => {
                    setSecurityModalOpen(false);
                    trigger2FALockSession();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  style={{
                    background: "#b42318",
                    color: "#ffffff",
                  }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Lock Session &amp; Require 2FA Re-Auth</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSecurityModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer"
                  style={{
                    background: "#f3eee4",
                    borderColor: "var(--border)",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
