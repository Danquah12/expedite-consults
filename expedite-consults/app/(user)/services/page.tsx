import AdSection from "@/components/AdSection";
import { HomeCard } from "@/components/Cards";
import MotionInView from "@/components/MotionInView";
import getServices from "@/sanity/lib/services/getServices";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
	title: "Services | Expedite Consults LLC",
	description:
		"Explore Expedite Consults LLC’s expert cybersecurity services — from penetration testing and cloud security to risk management and compliance — tailored to protect and empower your organization.",
};

const page = async () => {
	const services = await getServices();
	return (
		<>
			<div className="relative w-full z-[1] h-[300px] lg:h-[400px] bg-[url(/img5.jpeg)] bg-no-repeat bg-cover bg-center bg-blend-overlay flex flex-col gap-4 items-center justify-center">
				<span className="absolute -z-[1] inset-0 bg-gradient-to-r from-secondary via-secondary to-transparent"></span>
				<div className="container flex items-end gap-5 w-full h-full px-4 pb-8 md:pb-16">
					<MotionInView
						scale={0.8}
						delay={0.3}
						className="max-w-[680px] text-white flex flex-col gap-4"
					>
						<h2 className="text-3xl lg:text-5xl font-medium">Services</h2>
						<div className="text-sm lg:text-base max-w-[550px]  font-normal">
							Safeguard your organization with our expert cybersecurity
							solutions — tailored services that detect, defend, and deliver
							lasting protection
						</div>
					</MotionInView>
				</div>
			</div>

			<div className="w-full py-8 lg:py-18">
				<div className="container relative w-full h-full px-4 mx-auto flex flex-col gap-4 items-center justify-center">
					{/* <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/55 dark:from-white/15 dark:to-black/40" />
				<div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" /> */}
					<span className="absolute w-[100px] aspect-square top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary rounded-full blur-[142px] "></span>
					<MotionInView
						direction="up"
						delay={0.4}
						className="flex flex-col gap-4 items-center justify-center"
					>
						<h2 className="text-2xl lg:text-4xl text-center text-primary font-semibold">
							Secure Today, Protect Tomorrow
						</h2>
						<p className="text-sm lg:text-base text-center text-muted-foreground max-w-[650px] font-normal">
							Explore Expedite Consults’ full range of cybersecurity services —
							from risk assessments and compliance to cloud and incident
							response. We deliver tailored solutions that keep your
							organization resilient in a rapidly evolving digital landscape.
						</p>
					</MotionInView>
				</div>
				<MotionInView
					direction="up"
					delay={0.5}
					className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-1 w-full"
				>
					{services.map((service, i) => {
						return <HomeCard key={i} service={service} index={i} />;
					})}
				</MotionInView>
			</div>

			<AdSection />
		</>
	);
};

export default page;
