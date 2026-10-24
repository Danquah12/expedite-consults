import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { authEnabled } from "@/lib/auth/client";
import { writeDeskHold } from "@/lib/auth/desk-hold";
import { deskSignIn, getDesk } from "@/lib/admin-api";
import { requestDeskPasswordReset, resetDeskPassword } from "@/lib/auth/password-reset";
import { DeskLockup } from "@/components/desk/DeskBrand";

export const Route = createFileRoute("/desk/login")({
  component: DeskLogin,
});

function DeskLogin() {
  const [mode, setMode] = useState<"in" | "forgot" | "reset">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("out") === "1") {
      writeDeskHold(null);
      setHeld(false);
      return;
    }
    void getDesk()
      .then((next) => {
        if (next.holdToken) writeDeskHold(next.holdToken);
        setHeld(true);
      })
      .catch(() => setHeld(false));
  }, []);

  if (held) return <Navigate to="/desk" />;

  async function onEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!authEnabled || busy) return;
    const data = new FormData(e.currentTarget);
    const typedEmail = String(data.get("email") || email).trim();
    const typedPassword = String(data.get("password") || password);
    const typedAgain = String(data.get("again") || again);
    setEmail(typedEmail);
    setPassword(typedPassword);
    setAgain(typedAgain);
    setBusy(true);
    setErr(null);
    try {
      if (mode !== "reset" && !typedEmail.includes("@")) throw new Error("Enter the operator email.");
      if (mode !== "forgot" && typedPassword.length < 8) throw new Error("The password needs at least 8 characters.");
      if (mode === "forgot") {
        const { token } = await requestDeskPasswordReset({ data: { email: typedEmail } });
        setResetToken(token);
        setPassword("");
        setAgain("");
        setMode("reset");
        setBusy(false);
        return;
      }
      if (mode === "reset") {
        if (typedPassword !== typedAgain) throw new Error("Those passwords do not match");
        if (!resetToken) throw new Error("Reset expired. Start again.");
        const { token } = await resetDeskPassword({ data: { token: resetToken, password: typedPassword } });
        writeDeskHold(token);
        window.location.href = "/desk";
        return;
      }
      const { token } = await deskSignIn({ data: { email: typedEmail, password: typedPassword } });
      writeDeskHold(token);
      window.location.href = "/desk";
    } catch (caught) {
      setErr(caught instanceof Error ? caught.message : "Could not sign in");
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden flex-col justify-between border-r border-border px-12 py-14 lg:flex">
        <DeskLockup />
        <div className="max-w-md">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-subtle">Staff plane</p>
          <h1 className="mt-3 font-sans text-4xl font-semibold tracking-tight">Command Noctis without living in it.</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Desk is a separate operator console. Members never see it. Live counts, ledger, trust, and MFA sit here — wired to the same Noctis data plane.
          </p>
        </div>
        <p className="text-xs text-subtle">Authenticator MFA after sign-in · 12-hour staff window</p>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <DeskLockup />
          </div>
          <h2 className="mt-8 font-sans text-2xl font-semibold tracking-tight lg:mt-0">
            {mode === "in" ? "Operator sign-in" : "New Desk password"}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {mode === "forgot"
              ? "Enter the operator email. You can choose a new Desk password next. Noctis stays signed in."
              : mode === "reset"
                ? "Choose a new password for this operator account. This does not sign Noctis out."
                : "Admin portal only. Signing in or out here does not change a Noctis member session."}
          </p>
          {mode === "in" ? (
            <p className="mt-2 text-xs leading-relaxed text-subtle">
              Google and X are not enabled for this address. Use your operator email and password.
            </p>
          ) : null}
          {authEnabled ? (
            <>
            <form onSubmit={onEmail} noValidate className="mt-6 space-y-2">
                {mode !== "reset" ? (
                <input
                  name="email"
                  className="min-h-11 w-full rounded-xl bg-elevated px-3 text-sm"
                  placeholder="Work email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
                ) : null}
                {mode !== "forgot" ? (
                <input
                  name="password"
                  className="min-h-11 w-full rounded-xl bg-elevated px-3 text-sm"
                  placeholder={mode === "reset" ? "New password" : "Password"}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "reset" ? "new-password" : "current-password"}
                />
                ) : null}
                {mode === "reset" ? (
                <input
                  name="again"
                  className="min-h-11 w-full rounded-xl bg-elevated px-3 text-sm"
                  placeholder="Repeat new password"
                  type="password"
                  value={again}
                  onChange={(e) => setAgain(e.target.value)}
                  autoComplete="new-password"
                />
                ) : null}
                {err ? <p role="alert" className="rounded-xl bg-live/10 px-3 py-3 text-sm font-medium text-live">{err}</p> : null}
                <button
                  type="submit"
                  disabled={busy}
                  className="flex min-h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-fg disabled:opacity-60"
                >
                  {busy ? "Working…" : mode === "forgot" ? "Continue" : mode === "reset" ? "Save password and enter Desk" : "Enter Desk"}
                </button>
            </form>
            <button
              type="button"
              onClick={() => {
                setMode((m) => (m === "in" ? "forgot" : "in"));
                setErr(null);
                setResetToken(null);
              }}
              className="mt-4 w-full text-center text-xs font-semibold text-fg underline-offset-4 hover:underline"
            >
              {mode === "in" ? "Forgot password?" : "Back to sign in"}
            </button>
            </>
          ) : (
            <p className="mt-6 text-sm text-muted">Sign-in is disabled.</p>
          )}
          <p className="mt-8 text-xs text-subtle">
            Members register on Noctis, not here.{" "}
            <a href="/login" target="vibetok-clinic" className="font-semibold text-fg underline-offset-4 hover:underline">
              Open the clinic
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
