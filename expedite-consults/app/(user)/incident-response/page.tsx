import MotionInView from "@/components/MotionInView";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";
import { AlertOctagon, ShieldAlert, PhoneCall, Clock } from "lucide-react";

export const metadata: Metadata = {
	title: "24/7 Cybersecurity Incident Response | Expedite Consults LLC",
	description:
		"Get immediate support from certified experts with Expedite Consults’ 24/7 Incident Response services. We help contain threats fast and restore security without delay.",
};

const page = () => {
	return (
		<>
			<div className="relative w-full z-[1] min-h-[500px] lg:min-h-[600px] bg-[url(/img4.jpeg)] bg-no-repeat bg-cover bg-center bg-blend-overlay flex flex-col items-center justify-center pt-20">
				<span className="absolute -z-[1] inset-0 bg-gradient-to-br from-red-950/95 via-secondary/95 to-transparent backdrop-blur-[2px]"></span>

				{/* Animated glowing background element */}
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/20 blur-[120px] rounded-full point-events-none animate-pulse"></div>

				<div className="container relative z-10 flex flex-col items-center text-center gap-8 w-full px-4 pb-8 md:pb-16 mt-10">
					<MotionInView
						direction="up"
						delay={0.2}
						className="flex items-center gap-2 mb-2 text-red-400 px-5 py-2 rounded-full w-fit bg-red-950/50 border border-red-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.2)]"
					>
						<div className="relative flex h-3 w-3">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
							<span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
						</div>
						<span className="text-xs font-bold tracking-widest uppercase">Emergency Support Team</span>
					</MotionInView>

					<MotionInView
						direction="up"
						delay={0.3}
						className="max-w-[800px] text-white flex flex-col items-center gap-6"
					>
						<h2 className="text-4xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
							24/7 Incident <span className="text-red-500">Response</span>
						</h2>
						<div className="text-base lg:text-xl max-w-[650px] font-medium text-white/90 leading-relaxed shadow-sm">
							Rapid, around-the-clock containment and remediation for security breaches. Minimize impact, restore operations, and secure your infrastructure fast.
						</div>
					</MotionInView>
				</div>
			</div>

			<div className="w-full bg-secondary/95 relative overflow-hidden border-t border-red-900/30">
				<span className="absolute -rotate-12 top-0 -right-24 lg:right-[10%] w-[300px] h-full bg-gradient-to-b from-red-900/10 via-primary/5 to-transparent pointer-events-none"></span>

				<div className="container relative w-full h-full px-4 py-16 lg:py-24 mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20 items-center justify-between">

					<MotionInView
						direction="right"
						delay={0.4}
						className="flex flex-col flex-1 w-full gap-8 relative z-10"
					>
						<div className="flex flex-col gap-4 max-w-[600px]">
							<div className="inline-flex items-center gap-2 text-red-500 font-semibold mb-2">
								<ShieldAlert className="size-6" />
								<span>Immediate Action Required</span>
							</div>
							<h2 className="text-3xl lg:text-5xl font-bold text-white leading-tight">
								Under active <span className="text-red-400">attack?</span>
								<br />Every second counts.
							</h2>
							<p className="text-base lg:text-lg text-white/80 mt-4 leading-relaxed">
								Expedite Consults' elite cybersecurity specialists are on standby 24/7 to conduct a thorough investigation, halt active threats, and implement a tailored remediation plan.
							</p>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
								<div className="flex items-start gap-3 bg-white/5 p-4 rounded-lg border border-white/10">
									<Clock className="size-6 text-primary shrink-0 mt-0.5" />
									<div>
										<h4 className="font-semibold text-white">Rapid Triage</h4>
										<p className="text-sm text-white/60 mt-1">Immediate threat assessment and containment.</p>
									</div>
								</div>
								<div className="flex items-start gap-3 bg-white/5 p-4 rounded-lg border border-white/10">
									<AlertOctagon className="size-6 text-primary shrink-0 mt-0.5" />
									<div>
										<h4 className="font-semibold text-white">Eradication</h4>
										<p className="text-sm text-white/60 mt-1">Complete removal of malicious actors.</p>
									</div>
								</div>
							</div>
						</div>
					</MotionInView>

					<MotionInView
						direction="left"
						delay={0.5}
						className="flex-1 w-full max-w-[500px]"
					>
						<div className="bg-gradient-to-br from-red-950/80 to-secondary border border-red-500/30 p-8 lg:p-12 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.15)] relative overflow-hidden backdrop-blur-sm">
							<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-900"></div>

							<div className="flex flex-col items-center text-center gap-6">
								<div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 mb-2">
									<PhoneCall className="size-10 text-red-500" />
								</div>

								<h3 className="text-2xl font-bold text-white">Emergency Hotline</h3>
								<p className="text-white/70 text-sm">Call us directly for immediate incident response activation.</p>

								<Link
									href="tel:1-855-443-9733"
									className="group/button w-full relative inline-flex items-center justify-center overflow-hidden bg-red-600 hover:bg-red-500 p-4 rounded-lg font-bold text-white transition-all duration-300 shadow-lg shadow-red-900/50"
								>
									<span className="text-2xl tracking-wider">+1-855-443-9733</span>
									<div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-150%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(150%)]">
										<div className="relative h-full w-10 bg-white/20"></div>
									</div>
								</Link>
								<p className="text-xs text-white/50 uppercase tracking-widest mt-2">Available 24/7/365</p>
							</div>
						</div>
					</MotionInView>
				</div>
			</div>
		</>
	);
};

export default page;
