import React from "react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
	return (
		<div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto space-y-8 bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-2xl shadow-2xl">
				<div className="border-b border-slate-800 pb-6 flex flex-wrap items-center justify-between gap-4">
					<div>
						<h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Privacy Policy</h1>
						<p className="text-sm text-slate-400 mt-1">Last Updated: August 26, 2026 | Expedite Consults LLC & VeritasLens</p>
					</div>
					<Link
						href="/veritaslens"
						className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded-lg border border-slate-700 transition"
					>
						← Back to Platform
					</Link>
				</div>

				<section className="space-y-3 text-sm text-slate-300 leading-relaxed">
					<h2 className="text-lg font-bold text-white uppercase font-mono tracking-wider text-cyan-400">
						1. Introduction & Scope
					</h2>
					<p>
						Expedite Consults LLC (&ldquo;Expedite Consults&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) provides enterprise IT consulting, change intelligence, and the VeritasLens multi-modal media verification platform (&ldquo;Services&rdquo;). This Privacy Policy explains how we collect, process, store, and safeguard data in full compliance with the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and third-party platform policies including LinkedIn and Meta developer terms.
					</p>
				</section>

				<section className="space-y-3 text-sm text-slate-300 leading-relaxed">
					<h2 className="text-lg font-bold text-white uppercase font-mono tracking-wider text-cyan-400">
						2. Information We Collect
					</h2>
					<ul className="list-disc pl-6 space-y-2">
						<li>
							<strong>User Provided Data:</strong> Business contact information, names, email addresses, and organizational credentials provided during platform onboarding or demo inquiries.
						</li>
						<li>
							<strong>Third-Party Platform OAuth Tokens:</strong> When utilizing automated social syndication features (e.g. Share on LinkedIn or Meta Graph API), we temporarily store access tokens strictly for user-authorized publishing requests.
						</li>
						<li>
							<strong>Platform Telemetry:</strong> Anonymized interaction logs, browser telemetry, and performance metrics to ensure uptime and platform stability.
						</li>
					</ul>
				</section>

				<section className="space-y-3 text-sm text-slate-300 leading-relaxed">
					<h2 className="text-lg font-bold text-white uppercase font-mono tracking-wider text-cyan-400">
						3. How Data is Used
					</h2>
					<p>
						We use collected data solely to deliver the contracted services, authenticate corporate users, verify public media claims against empirical statutory records, and execute user-directed syndication workflows. <strong>We do not sell, rent, or monetize your personal information to third parties.</strong>
					</p>
				</section>

				<section className="space-y-3 text-sm text-slate-300 leading-relaxed">
					<h2 className="text-lg font-bold text-white uppercase font-mono tracking-wider text-cyan-400">
						4. Data Security & Encryption
					</h2>
					<p>
						All communication with our servers is protected using TLS 1.3 encryption. API tokens, secret keys, and customer data are stored using SOC2-compliant encrypted key management services with multi-factor administrative access controls.
					</p>
				</section>

				<section className="space-y-3 text-sm text-slate-300 leading-relaxed">
					<h2 className="text-lg font-bold text-white uppercase font-mono tracking-wider text-cyan-400">
						5. Contact & Data Subject Rights
					</h2>
					<p>
						You have the right to inspect, correct, or delete your personal data at any time. For questions regarding this Privacy Policy or our compliance practices, contact our Data Privacy Office at:
					</p>
					<div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
						<div><strong>Company:</strong> Expedite Consults LLC</div>
						<div><strong>Email:</strong> <a href="mailto:privacy@expediteconsults.com" className="text-cyan-400 underline">privacy@expediteconsults.com</a></div>
						<div><strong>Website:</strong> <a href="https://portal.expediteconsults.com" className="text-cyan-400 underline">https://portal.expediteconsults.com</a></div>
					</div>
				</section>
			</div>
		</div>
	);
}
