import Link from "next/link";
import MotionInView from "./MotionInView";
import { Globe } from "./Globe";
import { Briefcase, FileCheck2, ShieldCheck, Target } from "lucide-react";

export function WhyUS() {
	return (
		<div className="container overflow-hidden relative rounded-4xl w-full h-full px-4 py-8 lg:py-16 my-16 mx-auto flex flex-col lg:flex-row lg:items-center gap-16">
			<MotionInView
				scale={0.8}
				delay={0.4}
				className="flex flex-col gap-4 max-w-[400px] w-full"
			>
				<h2 className="text-2xl lg:text-4xl font-semibold">
					Why Expedite <span className="text-primary">Consults</span>?
				</h2>
				<p className="text-sm lg:text-base text-muted-foreground max-w-[650px] font-normal">
					Discover why businesses trust Expedite Consults — expert advice,
					tailored strategies, and a commitment to your success.
				</p>

				<Link
					href={"#"}
					className="font-normal self-start text-sm mt-4 lg:text-base mb-0 rounded-md px-6 py-2.5 bg-gradient-to-tr from-primary to-primary/50 text-white hover:bg-gradient-to-tr hover:from-primary hover:to-primary transition-all duration-300"
				>
					Request a Free Consultation
				</Link>
			</MotionInView>
			<div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-5">
				<MotionInView
					scale={0.8}
					delay={0.5}
					className="w-full md:col-span-3 h-[180px] lg:h-[300px] z-10 bg-gradient-to-br from-primary/50 to-primary/0 relative p-4 lg:p-6 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
				>
					<div className="flex lg:flex-col lg:items-start items-center gap-3">
						<span className="p-2 bg-secondary self-start rounded-full w-fit shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
							<ShieldCheck className="size-5 text-primary" />
						</span>
						<h2 className="text-lg lg:text-2xl font-semibold">
							Certified Cybersecurity Experts
						</h2>
					</div>
					<p className="text-sm lg:text-base text-gray-700 mt-4">
						Our team holds top industry certifications, ensuring your systems
						are protected by trusted cybersecurity professionals.
					</p>

					<Globe className="top-10 -right-40 -z-10" />
				</MotionInView>
				<MotionInView
					scale={0.8}
					delay={0.6}
					className="w-full md:col-span-2 h-[180px] lg:h-[300px] z-10 bg-gradient-to-bl from-purple-300/50 to-primary/0 relative p-4 lg:p-6 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
				>
					<div className="flex lg:flex-col lg:items-start items-center gap-3">
						<span className="p-2 bg-secondary self-start rounded-full w-fit shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
							<Briefcase className="size-5 text-[#c98bff]" />
						</span>
						<h2 className="text-lg lg:text-2xl font-semibold">
							Hands-On Federal and Commercial Experience
						</h2>
					</div>
					<p className="text-sm lg:text-base text-gray-700 mt-4">
						We bring proven expertise from both federal and commercial sectors,
						delivering solutions that meet rigorous standards and real-world
						demands.
					</p>
				</MotionInView>
				<MotionInView
					scale={0.8}
					delay={0.7}
					className="w-full md:col-span-2 h-[180px] lg:h-[300px] z-10 bg-gradient-to-tr from-[#64cad8] to-primary/0 relative p-4 lg:p-6 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
				>
					<div className="flex lg:flex-col lg:items-start items-center gap-3">
						<span className="p-2 bg-secondary self-start rounded-full w-fit shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
							<Target className="size-5 text-[#64cddb]" />
						</span>
						<h2 className="text-lg lg:text-2xl font-semibold">
							Results-Driven, Client-Focused
						</h2>
					</div>
					<p className="text-sm lg:text-base text-gray-700 mt-4">
						We prioritize your goals, delivering measurable results with a
						strong commitment to your success.
					</p>
				</MotionInView>
				<MotionInView
					scale={0.8}
					delay={0.8}
					className="w-full md:col-span-3 h-[180px] lg:h-[300px] z-10 bg-gradient-to-tl from-gray-500/50 to-primary/0 relative p-4 lg:p-6 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
				>
					<div className="flex lg:flex-col lg:items-start items-center gap-3">
						<span className="p-2 bg-secondary self-start rounded-full w-fit shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
							<FileCheck2 className="size-5 text-gray-600" />
						</span>
						<h2 className="text-lg lg:text-2xl font-semibold">
							Compliance Expertise
						</h2>
					</div>
					<div className="flex flex-wrap gap-2 mt-2">
						<span className="text-xs bg-gray-300 px-3 py-1 rounded-full">
							NIST 800-53
						</span>
						<span className="text-xs bg-gray-300 px-3 py-1 rounded-full">
							FedRAMP
						</span>
						<span className="text-xs bg-gray-300 px-3 py-1 rounded-full">
							PCI DSS
						</span>
						<span className="text-xs bg-gray-300 px-3 py-1 rounded-full">
							ISO 27001
						</span>
					</div>
					<p className="text-sm lg:text-base text-gray-700 mt-4">
						We navigate complex regulations with precision, ensuring your
						organization meets all cybersecurity and industry compliance
						standards.
					</p>
				</MotionInView>
			</div>
		</div>
	);
}
