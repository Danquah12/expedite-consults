import AdSection from "@/components/AdSection";
import { HomeCard } from "@/components/Cards";
import MotionInView from "@/components/MotionInView";
import { Testimonials } from "@/components/Testimonial";
import { WHY_EXPEDITE } from "@/constant";
import getServices from "@/sanity/lib/services/getServices";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
	title: "Why Choose Expedite Consults | Trusted Cybersecurity Experts",
	description:
		"Discover what sets Expedite Consults apart — from hands-on federal experience to certified cybersecurity expertise and a commitment to client success.",
};

const page = async () => {
	const services = await getServices();
	return (
		<>
			<div className="relative w-full z-[1] h-[300px] lg:h-[400px] bg-secondary/80 flex flex-col gap-4 items-center justify-center">
				<span className="absolute -z-[1] inset-0 bg-gradient-to-r from-secondary via-secondary to-transparent"></span>
				<div className="container flex items-end gap-5 w-full h-full px-4 pb-8 md:pb-16">
					<MotionInView
						scale={0.8}
						delay={0.3}
						className="max-w-[680px] text-white flex flex-col gap-4"
					>
						<h2 className="text-2xl lg:text-4xl font-medium">
							Our Clients Rely on Us to Safeguard Their Business — <br />
							<span className="text-primary">Here’s What Sets Us Apart.</span>
						</h2>
						{/* <div className="text-sm lg:text-base max-w-[550px]  font-normal">
							Explore the values, expertise, and commitment that make Expedite
							Consults your trusted cybersecurity partner.
						</div> */}
					</MotionInView>
				</div>
			</div>
			<div className="w-full bg-secondary/90 relative overflow-hidden">
				{/* <span className="absolute rotate-45 top-1/2 -translate-y-1/2 -right-24 lg:right-[20%] w-[200px] h-[300%] bg-gradient-to-b from-primary/80 via-primary/50 to-primary/20"></span> */}
				<div className="container relative w-full h-full px-4 py-8 lg:py-18 mx-auto flex flex-col gap-4 items-center justify-center">
					{/* <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/55 dark:from-white/15 dark:to-black/40" />
							<div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" /> */}
					<MotionInView
						scale={0.8}
						delay={0.3}
						className="max-w-[680px] text-white flex flex-col gap-4"
					>
						<h2 className="text-2xl lg:text-4xl text-center font-medium">
							Why Expedite Consult?
						</h2>
						<div className="text-sm lg:text-base max-w-[750px] text-center font-normal">
							At Expedite Consults, we bring a unique blend of real-world
							experience, technical excellence, and client-centered service.
							From proactive risk assessments to rapid incident response, our
							team is driven by a single goal — to protect what matters most to
							your organization
						</div>
					</MotionInView>

					<section className="grid grid-cols-1 gap-y-14 mt-10 sm:grid-cols-2 sm:gap-x-12 lg:grid-cols-3 lg:gap-x-20 lg:gap-y-20 w-full wfull lg:p-8 mx-auto">
						{WHY_EXPEDITE.map((item) => (
							<MotionInView
								scale={0.8}
								delay={0.3}
								key={item.title}
								className="text-center md:flex md:items-start md:text-left lg:block lg:text-center"
							>
								<div className="md:flex-shrink-0 flex justify-center">
									<div className="flex items-center justify-center rounded-full text-primary">
										{
											<item.icon
												className="size-12 lg:size-16"
												strokeWidth={1.2}
											/>
										}
									</div>
								</div>

								<div className="mt-6 md:ml-4 md:mt-0 lg:ml-0 lg:mt-6">
									<h3 className="text-base font-semibold text-background">
										{item.title}
									</h3>
									<p className="mt-3 text-sm text-background">
										{item.description}
									</p>
								</div>
							</MotionInView>
						))}
					</section>
				</div>
			</div>

			<Testimonials />

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
							Discover More About Our Services
						</h2>
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
