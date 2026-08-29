import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Determines if an email belongs to a Change Manager.
 */
export function isManager(email: string): boolean {
	const managers = (process.env.CR_MANAGER_EMAIL ?? "")
		.split(",")
		.map((e) => e.trim().toLowerCase());
	return managers.includes(email.toLowerCase());
}

/**
 * Auth config using Credentials provider + JWT strategy.
 * No DB adapter required.
 *
 * Sign-in flow:
 * 1. User enters email on /login
 * 2. Server generates a short-lived token, emails it via Resend
 * 3. User enters the 6-digit code on /login/verify
 * 4. We validate the code and issue a JWT session
 *
 * For MVP simplicity, we use a single shared OTP store in memory.
 * In production, swap with Redis or Sanity-backed store.
 */

export const authConfig: NextAuthConfig = {
	providers: [
		Credentials({
			name: "Email OTP",
			credentials: {
				email: { label: "Email", type: "email" },
				otp:   { label: "One-Time Code", type: "text" },
			},
			async authorize(credentials) {
				const { email, otp } = credentials as { email: string; otp: string };
				if (!email || !otp) return null;

				// Validate OTP from the in-memory store
				const stored = otpStore.get(email.toLowerCase());
				if (!stored) return null;
				if (stored.expires < Date.now()) {
					otpStore.delete(email.toLowerCase());
					return null;
				}
				if (stored.code !== otp.trim()) return null;

				// Valid — consume the code
				otpStore.delete(email.toLowerCase());
				return { id: email, email, name: email.split("@")[0] };
			},
		}),
	],
	session: { strategy: "jwt" },
	secret: process.env.AUTH_SECRET,
	pages: {
		signIn: "/login",
		error:  "/login",
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user?.email) {
				token.role = isManager(user.email) ? "manager" : "requestor";
				token.email = user.email;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				(session.user as any).role  = token.role;
				(session.user as any).email = token.email;
			}
			return session;
		},
	},
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// ─── In-memory OTP store ──────────────────────────────────────────────────────
// Maps email → { code, expires }
// Fine for MVP (single server instance). Replace with Redis for production.
export const otpStore = new Map<string, { code: string; expires: number }>();

export function generateOTP(): string {
	return Math.floor(100000 + Math.random() * 900000).toString();
}
