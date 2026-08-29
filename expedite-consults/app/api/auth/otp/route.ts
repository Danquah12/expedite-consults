import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { otpStore, generateOTP } from "@/auth";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
	try {
		const { email } = await req.json();
		if (!email || typeof email !== "string") {
			return NextResponse.json({ error: "Email required" }, { status: 400 });
		}

		const code = generateOTP();
		const expires = Date.now() + 30 * 60 * 1000; // 30 minutes

		// Store in memory
		otpStore.set(email.toLowerCase(), { code, expires });

		// ── DEV MODE: print code to terminal so you don't need real email ──
		if (process.env.NODE_ENV === "development") {
			console.log(`\n🔑 OTP for ${email}: \x1b[36m${code}\x1b[0m  (expires in 30 min)\n`);
		}

		await resend.emails.send({
			from: process.env.RESEND_FORM_EMAIL ?? "onboarding@resend.dev",
			to: email,
			subject: "Your IT Change Management Portal Sign-In Code",
			html: `
				<div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#030c1d;color:#fff;border-radius:12px;overflow:hidden;">
					<div style="background:#030c1d;padding:32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.1);">
						<p style="color:#43bbd1;font-size:28px;margin:0;">⚙️</p>
						<h1 style="color:#fff;font-size:18px;margin:8px 0 4px;">IT Change Management Portal</h1>
						<p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0;">CR Portal v2.0 · ITIL v4</p>
					</div>
					<div style="padding:32px;text-align:center;">
						<p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0 0 24px;">Your one-time sign-in code:</p>
						<div style="background:rgba(67,187,209,0.1);border:2px solid #43bbd1;border-radius:12px;padding:24px;display:inline-block;margin:0 auto;">
							<span style="color:#43bbd1;font-size:42px;font-weight:900;letter-spacing:12px;">${code}</span>
						</div>
						<p style="color:rgba(255,255,255,0.4);font-size:12px;margin:24px 0 0;">
							This code expires in <strong>10 minutes</strong>.<br/>
							If you didn't request this, you can safely ignore it.
						</p>
					</div>
				</div>
			`,
		});

		return NextResponse.json({
			success: true,
			...(process.env.NODE_ENV === "development" ? { devCode: code } : {}),
		});
	} catch (e) {
		console.error("[POST /api/auth/otp]", e);
		return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
	}
}
