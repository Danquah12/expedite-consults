import React from "react";
import Link from "next/link";

export default function TermsOfUsePage() {
	return (
		<div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto space-y-8 bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-2xl shadow-2xl">
				<div className="border-b border-slate-800 pb-6 flex flex-wrap items-center justify-between gap-4">
					<div>
						<h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Terms of Use</h1>
						<p className="text-sm text-slate-400 mt-1">Last Updated: November 2, 2026 | Expedite Consults LLC</p>
					</div>
					<Link
						href="/"
						className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded-lg border border-slate-700 transition"
					>
						← Back to Home
					</Link>
				</div>

				<section className="space-y-3 text-sm text-slate-300 leading-relaxed">
					<h2 className="text-lg font-bold text-white uppercase font-mono tracking-wider text-cyan-400">
						1. Acceptance of Terms
					</h2>
					<p>
						Welcome to Expedite Consults LLC (&ldquo;Expedite Consults&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). By accessing or using our websites, software platforms, digital portals, or engaging our cybersecurity and IT advisory services (&ldquo;Services&rdquo;), you agree to comply with and be bound by these Terms of Use. If you do not agree, please refrain from using our platforms and services.
					</p>
				</section>

				<section className="space-y-3 text-sm text-slate-300 leading-relaxed">
					<h2 className="text-lg font-bold text-white uppercase font-mono tracking-wider text-cyan-400">
						2. Professional Cybersecurity & Consulting Services
					</h2>
					<p>
						Expedite Consults delivers high-assurance cybersecurity solutions, including Cybersecurity Consultancy, AI Security & Governance, Managed Security Operations, Penetration Testing, and Data Privacy Advisory. Specific technical engagements, penetration tests, and vulnerability assessments are governed by dedicated Master Services Agreements (MSAs), Statements of Work (SOWs), and Rules of Engagement (RoE).
					</p>
				</section>

				<section className="space-y-3 text-sm text-slate-300 leading-relaxed">
					<h2 className="text-lg font-bold text-white uppercase font-mono tracking-wider text-cyan-400">
						3. Permitted Platform Use & Prohibited Activities
					</h2>
					<p>
						You agree to access our platforms solely for legitimate corporate evaluations and authorized business purposes. You agree not to:
					</p>
					<ul className="list-disc pl-6 space-y-2">
						<li>Conduct unauthorized penetration tests, denial-of-service simulations, or automated data harvesting against our production infrastructure without prior written authorization.</li>
						<li>Attempt to decompile, reverse engineer, or disassemble any software engines or proprietary algorithms hosted by Expedite Consults LLC.</li>
						<li>Circumvent or attempt to circumvent authentication protocols, role-based access controls, or cryptographic boundaries.</li>
					</ul>
				</section>

				<section className="space-y-3 text-sm text-slate-300 leading-relaxed">
					<h2 className="text-lg font-bold text-white uppercase font-mono tracking-wider text-cyan-400">
						4. Intellectual Property
					</h2>
					<p>
						All trademarks, service marks, platform interfaces, architectural designs, proprietary codebases, and intellectual assets displayed across our websites remain the exclusive property of Expedite Consults LLC and its licensors.
					</p>
				</section>

				<section className="space-y-3 text-sm text-slate-300 leading-relaxed">
					<h2 className="text-lg font-bold text-white uppercase font-mono tracking-wider text-cyan-400">
						5. Disclaimer & Limitation of Liability
					</h2>
					<p>
						Our online content and platform previews are provided &ldquo;as is&rdquo; without warranties of any kind, whether express or implied. To the maximum extent permitted by law, Expedite Consults LLC disclaims liability for any indirect, special, incidental, or consequential damages resulting from the use or inability to use our platforms.
					</p>
				</section>

				<section className="space-y-3 text-sm text-slate-300 leading-relaxed">
					<h2 className="text-lg font-bold text-white uppercase font-mono tracking-wider text-cyan-400">
						6. Contact & Legal Notices
					</h2>
					<p>
						For questions regarding these Terms of Use or official corporate notices, please contact us:
					</p>
					<div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
						<div><strong>Company:</strong> Expedite Consults LLC</div>
						<div><strong>Phone:</strong> <a href="tel:1-855-443-9733" className="text-cyan-400 underline">1-855-443-9733</a></div>
						<div><strong>Email:</strong> <a href="mailto:kasiedu@expedite-consults.com" className="text-cyan-400 underline">kasiedu@expedite-consults.com</a></div>
						<div><strong>Website:</strong> <a href="https://expedite-consults.com" className="text-cyan-400 underline">https://expedite-consults.com</a></div>
					</div>
				</section>
			</div>
		</div>
	);
}
