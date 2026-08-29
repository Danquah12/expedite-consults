import AdSection from "@/components/AdSection";
import { Icon } from "@/components/Icon";
import MotionInView from "@/components/MotionInView";
import {
	Binoculars,
	ShieldCheck,
	Star,
	Target,
	TrendingUp,
	Zap,
} from "lucide-react";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
	title: "About Expedite Consults LLC | Trusted Cybersecurity Experts",
	description:
		"Discover Expedite Consults’ mission, vision, and values. Learn how our trusted cybersecurity professionals safeguard digital assets and drive secure innovation.",
};

const values = [
	{
		icon: ShieldCheck,
		title: "Integrity",
		description:
			"Integrity is at the heart of everything we do. We hold ourselves accountable to our values and principles.",
	},
	{
		icon: Star,
		title: "Excellence",
		description:
			"Excellence is our way of life. We strive for excellence in everything we do, from our work to our relationships.",
	},
	{
		icon: Zap,
		title: "Innovation",
		description:
			"Innovation is our driving force. We embrace change, adapt, and innovate to stay ahead of the curve. Staying ahead of the threat landscape with modern solutions.",
	},
	{
		icon: TrendingUp,
		title: "Client Success",
		description:
			" Building long-term partnerships based on measurable impact. We prioritize client success above all else.",
	},
];

const page = () => {
	return (
		<>
			<div className="relative w-full z-[1] min-h-[400px] lg:min-h-[500px] bg-[url(/img3.jpeg)] bg-no-repeat bg-cover bg-center bg-blend-overlay flex flex-col items-center justify-center pt-20">
				<span className="absolute -z-[1] inset-0 bg-gradient-to-br from-secondary/95 via-secondary/80 to-transparent backdrop-blur-[2px]"></span>

				<div className="container flex flex-col items-center text-center gap-6 w-full px-4 pb-8 md:pb-16 mt-10">
					<MotionInView
						direction="up"
						delay={0.2}
						className="flex items-center gap-2 mb-2 text-primary px-5 py-2 rounded-full w-fit bg-primary/10 border border-primary/20 backdrop-blur-md shadow-[0_0_15px_rgba(67,187,209,0.15)]"
					>
						<Star className="size-4" />
						<span className="text-xs font-bold tracking-widest uppercase">Our Story</span>
					</MotionInView>

					<MotionInView
						direction="up"
						delay={0.3}
						className="max-w-[800px] text-white flex flex-col items-center gap-6"
					>
						<h2 className="text-4xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
							About Us
						</h2>
						<div className="text-base lg:text-xl max-w-[650px] font-medium text-white/90 leading-relaxed">
							A trusted cybersecurity partner dedicated to protecting your
							digital future with expertise, innovation, and unwavering
							commitment.
						</div>
					</MotionInView>
				</div>
			</div>

			<div className="w-full bg-secondary/5 relative overflow-hidden">
				<div className="container py-16 lg:py-24 relative w-full h-full px-4 mx-auto flex flex-col gap-4 items-center justify-center">
					<span className="absolute w-[300px] aspect-square top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></span>

					<MotionInView
						direction="up"
						delay={0.4}
						className="flex flex-col gap-6 items-center justify-center max-w-[900px] relative z-10"
					>
						<h2 className="text-3xl lg:text-5xl text-center text-secondary font-bold tracking-tight">
							Built on Trust. <span className="text-primary">Driven by Security.</span>
						</h2>
						<div className="w-20 h-1 bg-gradient-to-r from-primary to-transparent rounded-full my-2"></div>
						<p className="text-base lg:text-lg text-center text-gray-600 font-medium leading-relaxed">
							At Expedite Consults LLC, cybersecurity isn’t just what we do — it’s
							who we are. Founded on the principles of trust, excellence, and
							innovation, we are committed to protecting critical systems,
							securing digital assets, and empowering businesses to thrive
							securely in a connected world.
						</p>
					</MotionInView>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 w-full">
				<MotionInView
					direction="right"
					delay={0.4}
					className="relative overflow-hidden z-[1] w-full min-w-[300px] h-[350px] lg:h-[500px] bg-secondary p-8 lg:p-16 flex flex-col justify-center gap-6 group"
				>
					<span className="absolute -z-[1] inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
					<div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 backdrop-blur-sm mb-2 shadow-[0_0_30px_rgba(67,187,209,0.2)]">
						<Binoculars strokeWidth={1.5} className="text-primary size-8" />
					</div>

					<div className="flex flex-col gap-4 w-full">
						<h2 className="text-3xl lg:text-5xl text-white font-bold tracking-tight">
							Our Vision
						</h2>
						<p className="text-base lg:text-xl text-white/80 max-w-[500px] leading-relaxed">
							To be a trusted global leader in cybersecurity—safeguarding
							innovation, enabling resilience, and shaping a safer digital
							future for all.
						</p>
					</div>
				</MotionInView>

				<MotionInView
					direction="left"
					delay={0.5}
					className="relative overflow-hidden z-[1] w-full min-w-[300px] h-[350px] lg:h-[500px] bg-primary p-8 lg:p-16 flex flex-col justify-center gap-6 group"
				>
					<span className="absolute -z-[1] inset-0 bg-gradient-to-tl from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
					<div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-sm mb-2 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
						<Target strokeWidth={1.5} className="text-white size-8" />
					</div>

					<div className="flex flex-col gap-4 w-full">
						<h2 className="text-3xl lg:text-5xl text-white font-bold tracking-tight">
							Our Mission
						</h2>
						<p className="text-base lg:text-xl text-white/90 max-w-[500px] leading-relaxed">
							To deliver cutting-edge cybersecurity and risk management
							solutions that empower organizations to operate securely,
							confidently, and without compromise.
						</p>
					</div>
				</MotionInView>
			</div>

			<div className="w-full bg-slate-50 relative overflow-hidden">
				<div className="container py-16 lg:py-24 relative w-full h-full px-4 mx-auto flex flex-col gap-12 items-center">
					<MotionInView
						direction="up"
						delay={0.3}
						className="flex flex-col gap-4 items-center text-center max-w-[800px]"
					>
						<h2 className="text-3xl lg:text-5xl text-secondary font-bold tracking-tight">
							Our Core Values
						</h2>
						<div className="w-20 h-1 bg-gradient-to-r from-primary to-transparent rounded-full my-2"></div>
						<p className="text-base lg:text-lg text-gray-600 font-medium leading-relaxed">
							Our values guide every decision we make — fostering trust, driving
							innovation, and upholding the highest standards in cybersecurity.
						</p>
					</MotionInView>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 w-full">
						{values.map((value, i) => (
							<MotionInView
								direction="up"
								delay={i * 0.1 + 0.4}
								key={i}
								className="group p-8 w-full h-full bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 flex flex-col items-center text-center gap-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-2"
							>
								<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
								<div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
									<Icon
										Icon={value.icon}
										strokeWidth={1.5}
										className="size-8 text-primary group-hover:text-secondary transition-colors"
									/>
								</div>

								<div className="flex flex-col gap-3 w-full">
									<h3 className="text-xl text-secondary font-bold">
										{value.title}
									</h3>
									<p className="text-sm text-gray-500 leading-relaxed font-medium">
										{value.description}
									</p>
								</div>
							</MotionInView>
						))}
					</div>
				</div>
			</div>

			<AdSection />
		</>
	);
};

export default page;
