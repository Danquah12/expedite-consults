import MotionInView from "@/components/MotionInView";
import { portableComponents } from "@/components/PortableComponents";
import { getLegalBySlug } from "@/sanity/lib/others/getLegal";
import { PortableText } from "next-sanity";
import React from "react";

interface LegalPageProps {
	params: Promise<{
		legal: string;
	}>;
}

async function LegalPage({ params }: LegalPageProps) {
	const { legal } = await params;

	const data = await getLegalBySlug(legal);

	if (!data) {
		if (legal === 'privacy' || legal === 'privacy-policy') {
			return (
				<div className="container mx-auto px-4 py-16 max-w-4xl text-slate-100 space-y-8">
					<div className="border-b border-slate-800 pb-6">
						<h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Privacy Policy</h1>
						<p className="text-sm text-slate-400">Last updated: August 26, 2026 | Expedite Consults LLC & VeritasLens</p>
					</div>

					<section className="space-y-4 text-sm text-slate-300 leading-relaxed">
						<h2 className="text-xl font-bold text-white">1. Introduction</h2>
						<p>
							Expedite Consults LLC (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates the Expedite Consults and VeritasLens platforms (&ldquo;Services&rdquo;). We respect your privacy and are committed to protecting your personal data in accordance with global privacy standards, including GDPR and CCPA.
						</p>
					</section>

					<section className="space-y-4 text-sm text-slate-300 leading-relaxed">
						<h2 className="text-xl font-bold text-white">2. Information We Collect</h2>
						<p>We collect information you provide directly to us when using our services:</p>
						<ul className="list-disc pl-6 space-y-2">
							<li><strong>Account & Contact Data:</strong> Name, business email address, organization name, and authentication credentials.</li>
							<li><strong>Usage & Telemetry:</strong> Log data, browser type, operating system, and interaction analytics within VeritasLens dashboards.</li>
							<li><strong>API & Social Integration Data:</strong> Authorization tokens required to publish content to authorized third-party platforms such as LinkedIn upon explicit user action.</li>
						</ul>
					</section>

					<section className="space-y-4 text-sm text-slate-300 leading-relaxed">
						<h2 className="text-xl font-bold text-white">3. How We Use Your Information</h2>
						<p>We process your information for the following legitimate purposes:</p>
						<ul className="list-disc pl-6 space-y-2">
							<li>To deliver, maintain, and optimize the VeritasLens news verification and media intelligence pipeline.</li>
							<li>To authenticate authorized corporate users and execute automated syndication workflows requested by the user.</li>
							<li>To ensure brand safety, platform security, and compliance with statutory regulations.</li>
						</ul>
					</section>

					<section className="space-y-4 text-sm text-slate-300 leading-relaxed">
						<h2 className="text-xl font-bold text-white">4. Data Sharing and Third Parties</h2>
						<p>
							We do not sell, rent, or monetize your personal information. We only transmit data to third-party providers (such as LinkedIn API, Meta Graph API, and hosting infrastructure) when necessary to execute user-initiated publishing actions or comply with applicable legal obligations.
						</p>
					</section>

					<section className="space-y-4 text-sm text-slate-300 leading-relaxed">
						<h2 className="text-xl font-bold text-white">5. Data Security & Retention</h2>
						<p>
							All data in transit and at rest is secured using industry-standard TLS 1.3 encryption and SOC2-compliant cloud infrastructure. Tokens and sensitive secrets are stored securely in encrypted key vaults.
						</p>
					</section>

					<section className="space-y-4 text-sm text-slate-300 leading-relaxed">
						<h2 className="text-xl font-bold text-white">6. Contact Us</h2>
						<p>
							If you have any questions regarding this Privacy Policy or wish to exercise your data subject rights, please contact our data privacy officer at <a href="mailto:privacy@expediteconsults.com" className="text-cyan-400 underline">privacy@expediteconsults.com</a> or visit <a href="https://portal.expediteconsults.com" className="text-cyan-400 underline">https://portal.expediteconsults.com</a>.
						</p>
					</section>
				</div>
			);
		}

		return (
			<div className="container mx-auto px-4 py-8 mt-16 text-slate-100">
				<h1 className="text-4xl font-bold">Legal Document Not Found</h1>
			</div>
		);
	}

	return (
		<>
			<div className="relative w-full z-[1] h-[300px] lg:h-[430px] bg-[url(/img8.jpeg)] bg-no-repeat bg-cover bg-center bg-blend-overlay flex flex-col gap-4 items-center justify-center">
				<span className="absolute -z-[1] inset-0 bg-gradient-to-r from-secondary via-secondary to-transparent"></span>
				<div className="container flex items-end gap-5 w-full h-full px-4 pb-8 md:pb-16">
					<MotionInView
						scale={0.8}
						delay={0.3}
						className="max-w-[680px] text-white flex flex-col gap-4"
					>
						<div className="flex items-center gap-2">
							<h2 className="text-2xl lg:text-4xl font-medium">
								{data?.title}
							</h2>
						</div>
						{/* <div className="text-sm lg:text-base max-w-[550px]  font-normal">
						</div> */}
					</MotionInView>
				</div>
			</div>
			<div className="container  py-8 lg:py-18 relative w-full h-full px-4 mx-auto flex flex-col gap-4 items-center justify-center">
				{/* <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/55 dark:from-white/15 dark:to-black/40" />
													<div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" /> */}
				<span className="absolute w-[100px] aspect-square top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary rounded-full blur-[142px] "></span>
				<MotionInView direction="up" delay={0.4}>
					{data?.body && (
						<PortableText value={data.body} components={portableComponents} />
					)}
				</MotionInView>
			</div>
		</>
	);
}

export default LegalPage;
// import React from "react";
