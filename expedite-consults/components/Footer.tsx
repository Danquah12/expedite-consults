import { routes } from "@/constant/routes";
import { GetServicesQueryResult } from "@/sanity.types";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Svgs } from "./Svgs";

interface FooterProps {
	services?: GetServicesQueryResult;
}

export default function Footer({ services }: FooterProps) {
	const currentYear = new Date().getFullYear();

	const serviceLinks = [
		{ name: "Cybersecurity Consultancy", href: "/services/cybersecurity-consultancy" },
		{ name: "AI Security", href: "/services/ai-security" },
		{ name: "Managed Security", href: "/services/managed-security" },
		{ name: "Penetration Testing", href: "/services/penetration-testing" },
		{ name: "Data Privacy", href: "/services/data-privacy" },
	];

	const ecosystemLinks = [
		{
			name: "🚀 Launchpad (All 34 Apps)",
			href: routes.launchpad.url,
			highlight: true,
		},
		{
			name: "ConnectIn Professional OS",
			href: routes.connectin.url,
		},
		{
			name: "Digital Campus Platform",
			href: routes.campus.url,
		},
		{
			name: "About Expedite Consults",
			href: routes.about.url,
		},
	];

	return (
		<footer className="bg-[#242d3c] border-t border-slate-700/50 text-white">
			<div className="container mx-auto px-4 py-12 lg:py-16">
				<div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-between">
					{/* Left Brand Block with Cyan Vertical Line Divider */}
					<div className="flex flex-col gap-4 lg:pr-10 lg:border-r border-[#00c2cb] max-w-sm shrink-0">
						<Link
							href={routes.home}
							prefetch={false}
							className="flex items-center space-x-3 hover:opacity-95 transition-opacity"
						>
							<Image
								src="/logo-icon.png"
								className="w-[46px] h-[46px] lg:w-[52px] lg:h-[52px] rounded-sm object-contain flex-shrink-0"
								width={100}
								height={100}
								alt="Expedite Consults LLC logo"
							/>
							<span className="text-base lg:text-lg font-bold text-white tracking-tight">
								Expedite Consults LLC
							</span>
						</Link>

						<p className="text-xs lg:text-[13px] text-slate-300 leading-relaxed font-normal">
							Trusted Cybersecurity Solutions | Building Confidence, Enhancing Resilience
						</p>
					</div>

					{/* 4 Navigation Columns */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-10 flex-1 w-full">
						{/* Column 1: Services */}
						<div className="space-y-3">
							<h2 className="text-sm lg:text-base font-semibold text-[#00c2cb] tracking-wide">
								Services
							</h2>
							<ul className="space-y-2 text-xs lg:text-sm">
								{serviceLinks.map((service, index) => (
									<li key={index}>
										<Link
											href={service.href}
											className="text-slate-300 hover:text-white transition-colors"
										>
											{service.name}
										</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Column 2: Digital Ecosystem */}
						<div className="space-y-3">
							<h2 className="text-sm lg:text-base font-semibold text-[#00c2cb] tracking-wide">
								Digital Ecosystem
							</h2>
							<ul className="space-y-2 text-xs lg:text-sm">
								{ecosystemLinks.map((item, index) => (
									<li key={index}>
										<Link
											href={item.href}
											className={
												item.highlight
													? "text-[#00c2cb] font-semibold hover:underline flex items-center gap-1.5 transition-colors"
													: "text-slate-300 hover:text-white transition-colors"
											}
										>
											{item.name}
										</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Column 3: Contact */}
						<div className="space-y-3">
							<h2 className="text-sm lg:text-base font-semibold text-[#00c2cb] tracking-wide">
								Contact
							</h2>
							<ul className="space-y-2 text-xs lg:text-sm">
								<li>
									<Link
										href="tel:1-855-443-9733"
										className="text-slate-300 hover:text-white transition-colors block"
									>
										1-855-443-9733
									</Link>
								</li>
								<li>
									<Link
										href="mailto:kasiedu@expedite-consults.com"
										className="text-slate-300 hover:text-white transition-colors block break-all"
									>
										kasiedu@expedite-consults.com
									</Link>
								</li>
								<li className="pt-1 flex items-center gap-3">
									<Link
										target="_blank"
										rel="noopener noreferrer"
										href="https://wa.me/12402607898"
										aria-label="WhatsApp"
										className="size-8 rounded-full bg-[#25D366] hover:brightness-110 flex items-center justify-center transition-all shadow-md shrink-0"
									>
										<Svgs.whatsapp className="size-4 fill-white" />
									</Link>
									<Link
										target="_blank"
										rel="noopener noreferrer"
										href="https://www.linkedin.com/company/expedite-consults-llc/"
										aria-label="LinkedIn"
										className="size-8 rounded-full bg-[#0A66C2] hover:brightness-110 flex items-center justify-center transition-all shadow-md shrink-0"
									>
										<Svgs.linkedin className="size-4 fill-white" />
									</Link>
								</li>
							</ul>
						</div>

						{/* Column 4: Legal */}
						<div className="space-y-3">
							<h2 className="text-sm lg:text-base font-semibold text-[#00c2cb] tracking-wide">
								Legal
							</h2>
							<ul className="space-y-2 text-xs lg:text-sm">
								<li>
									<Link
										href="https://expediteconsults.com"
										target="_blank"
										rel="noopener noreferrer"
										className="text-[#00c2cb] hover:underline font-medium inline-block"
									>
										Expediteconsults.com
									</Link>
								</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Bottom Copyright */}
				<div className="mt-12 pt-6 border-t border-slate-700/40 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
					<p>
						&copy; {currentYear} Expedite Consults LLC. All rights reserved.
					</p>
					<p className="text-slate-500">
						Building Confidence, Enhancing Resilience
					</p>
				</div>
			</div>
		</footer>
	);
}
