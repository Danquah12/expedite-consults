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

		const envFrom = process.env.RESEND_FORM_EMAIL;
		const fromAddress = (envFrom && !envFrom.includes("resend.dev"))
			? (envFrom.includes("<") ? envFrom : `ConnectIn Security <${envFrom}>`)
			: "ConnectIn Security <auth@expediteconsults.com>";

		await resend.emails.send({
			from: fromAddress,
			to: email,
			subject: `🔐 ConnectIn Security: Your Sign-In Code is ${code}`,
			html: `
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="utf-8">
					<style>
						body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #ffffff; margin: 0; padding: 0; }
						.container { max-width: 540px; margin: 30px auto; background: #0f172a; border-radius: 20px; border: 1px solid #1e293b; overflow: hidden; }
						.header { background: linear-gradient(135deg, #0A66C2 0%, #4338ca 100%); padding: 36px 24px; text-align: center; }
						.logo { font-size: 32px; font-weight: 900; color: #ffffff; letter-spacing: -1px; margin: 0; }
						.content { padding: 36px 28px; text-align: center; }
						.badge { display: inline-block; background: rgba(16, 185, 129, 0.2); color: #34d399; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(52, 211, 153, 0.3); margin-bottom: 16px; }
						.greeting { font-size: 18px; font-weight: 700; color: #f8fafc; margin-bottom: 8px; }
						.text { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
						.otp-box { background: #020617; border: 2px solid #0A66C2; border-radius: 16px; padding: 20px; margin: 0 auto 24px; display: inline-block; }
						.otp-code { font-size: 38px; font-weight: 900; color: #38bdf8; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace; }
						.footer { border-top: 1px solid #1e293b; padding: 20px; text-align: center; font-size: 11px; color: #64748b; background: #020617; }
					</style>
				</head>
				<body>
					<div class="container">
						<div class="header">
							<h1 class="logo">Connect<span style="color:#38bdf8;">In</span></h1>
							<p style="color: #e2e8f0; font-size: 12px; margin: 6px 0 0 0;">Autonomous AI-Powered Professional Network</p>
						</div>
						<div class="content">
							<span class="badge">🔒 Cryptographic Identity Verification</span>
							<h2 class="greeting">Hello!</h2>
							<p class="text">
								Enter the following single-use verification code to complete your sign-in:
							</p>
							
							<div class="otp-box">
								<span class="otp-code">${code}</span>
							</div>

							<p class="text" style="font-size: 11px;">
								This code is valid for <strong>10 minutes</strong>. If you did not initiate this request, please ignore this email.
							</p>
						</div>
						<div class="footer">
							<p style="margin:0 0 4px 0;">Expedite Consults LLC · 100% Zero-Trust Identity Infrastructure</p>
							<p style="margin:0;">Washington DC · Baltimore · GovCloud Defense Enclaves</p>
						</div>
					</div>
				</body>
				</html>
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
