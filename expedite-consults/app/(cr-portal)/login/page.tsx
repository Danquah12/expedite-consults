"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";

type Step = "email" | "otp" | "done";

export default function LoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") ?? "/portal";

	const [step, setStep]     = useState<Step>("email");
	const [email, setEmail]   = useState("");
	const [otp, setOtp]       = useState("");
	const [devCode, setDevCode] = useState(""); // dev only
	const [loading, setLoading] = useState(false);
	const [error, setError]     = useState("");

	// Step 1 — send OTP
	async function handleSendOTP(e: React.FormEvent) {
		e.preventDefault();
		if (!email.trim()) return;
		setLoading(true); setError("");
		try {
			const res = await fetch("/api/auth/otp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error("Failed to send code");
			if (data.devCode) setDevCode(data.devCode); // dev mode: auto-show code
			setStep("otp");
		} catch {
			setError("Could not send code. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	// Step 2 — verify OTP and sign in
	async function handleVerify(e: React.FormEvent) {
		e.preventDefault();
		if (!otp.trim()) return;
		setLoading(true); setError("");
		try {
			const res = await signIn("credentials", {
				email,
				otp,
				redirect: false,
				callbackUrl,
			});
			if (res?.error) {
				setError("Invalid or expired code. Please try again.");
			} else {
				setStep("done");
				router.push(callbackUrl);
			}
		} catch {
			setError("Sign-in failed. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	const inputCls = "w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#43bbd1] focus:border-[#43bbd1] transition";

	return (
		<div className="min-h-screen bg-[#030c1d] flex items-center justify-center p-4">
			<div className="w-full max-w-sm">
				{/* Logo */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#43bbd1]/10 border border-[#43bbd1]/20 mb-4">
						<span className="text-3xl">⚙️</span>
					</div>
					<h1 className="text-2xl font-bold text-white">IT Change Management</h1>
					<p className="text-sm text-white/40 mt-1">CR Portal v2.0 · ITIL v4</p>
				</div>

				<div className="bg-white/5 border border-white/10 rounded-2xl p-6">
					{/* Step indicator */}
					<div className="flex items-center gap-2 mb-6">
						{["Email", "Verify"].map((label, i) => (
							<div key={label} className="flex items-center gap-2 flex-1">
								<div className={`flex items-center gap-1.5 flex-1 text-xs font-semibold px-2 py-1 rounded transition ${
									(i === 0 && step === "email") || (i === 1 && step === "otp")
										? "text-[#43bbd1]" : i === 0 && step !== "email"
										? "text-white/30 line-through" : "text-white/30"
								}`}>
									<span>{i === 0 ? "1" : "2"}</span> {label}
								</div>
								{i === 0 && <div className="w-4 h-px bg-white/10 flex-shrink-0" />}
							</div>
						))}
					</div>

					{/* ── Step 1: Email ───────────────────────────────────── */}
					{step === "email" && (
						<form onSubmit={handleSendOTP} className="space-y-4">
							<div>
								<label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">
									Work Email
								</label>
								<input
									type="email"
									value={email}
									onChange={e => setEmail(e.target.value)}
									placeholder="you@company.com"
									required
									autoFocus
									className={inputCls}
								/>
							</div>

							{error && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}

							<button
								type="submit"
								disabled={loading || !email.trim()}
								className="w-full bg-[#43bbd1] text-[#030c1d] font-bold py-3 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
							>
								{loading ? "Sending…" : "Send Code →"}
							</button>

							<p className="text-[11px] text-white/30 text-center pt-1">
								We'll email you a 6-digit sign-in code. No password needed.
							</p>
						</form>
					)}

					{/* ── Step 2: OTP Verify ──────────────────────────────── */}
					{step === "otp" && (
						<form onSubmit={handleVerify} className="space-y-4">
							<div className="text-center mb-2">
								<p className="text-sm text-white/60">
									Code sent to <span className="text-[#43bbd1] font-semibold">{email}</span>
								</p>
								<p className="text-xs text-white/30 mt-1">Check your inbox — expires in 30 minutes</p>
							</div>

							{/* DEV MODE banner — auto-shows the code on screen */}
							{devCode && (
								<div
									className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-3 text-center cursor-pointer"
									onClick={() => setOtp(devCode)}
									title="Click to auto-fill"
								>
									<p className="text-[10px] text-amber-400/70 uppercase tracking-wider font-bold mb-1">⚠️ Dev Mode — Click to fill</p>
									<p className="text-2xl font-bold tracking-[0.5em] text-amber-400">{devCode}</p>
								</div>
							)}

							<div>
								<label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">
									6-Digit Code
								</label>
								<input
									type="text"
									value={otp}
									onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
									placeholder="000000"
									maxLength={6}
									required
									autoFocus
									className={`${inputCls} text-center text-2xl font-bold tracking-[0.5em]`}
								/>
							</div>

							{error && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}

							<button
								type="submit"
								disabled={loading || otp.length < 6}
								className="w-full bg-[#43bbd1] text-[#030c1d] font-bold py-3 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
							>
								{loading ? "Verifying…" : "Sign In →"}
							</button>

							<button
								type="button"
								onClick={() => { setStep("email"); setOtp(""); setError(""); }}
								className="w-full text-xs text-white/30 hover:text-white/60 transition py-1"
							>
								← Use a different email
							</button>
						</form>
					)}

					{/* ── Done ────────────────────────────────────────────── */}
					{step === "done" && (
						<div className="text-center py-4">
							<p className="text-3xl mb-2">✅</p>
							<p className="text-sm font-semibold text-white">Signing you in…</p>
						</div>
					)}
				</div>

				<p className="text-center text-[10px] text-white/20 mt-6">
					Expedite Consults · IT Infrastructure Team
				</p>
			</div>
		</div>
	);
}
