import { servicesData } from "@/constant";
import React from "react";

import { HomeCard } from "./Cards";
import MotionInView from "./MotionInView";
import Link from "next/link";
import { routes } from "@/constant/routes";
import getServices from "@/sanity/lib/services/getServices";

async function Services() {
	const services = await getServices();
	return (
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
						Our Services
					</h2>
					<p className="text-sm lg:text-base text-center text-muted-foreground max-w-[650px] font-normal">
						Comprehensive solutions tailored to meet your unique needs. Our
						services are designed to enhance efficiency, improve performance,
						and drive growth.
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

			<MotionInView
				direction="up"
				delay={0.5}
				className="mt-10 container mx-auto flex w-full"
			>
				<Link
					href={routes.contact.url}
					className="group/button relative mx-auto inline-flex items-center pr-16 [clip-path:polygon(0_0,100%_0,80%_100%,0%_100%)] justify-center overflow-hidden bg-gradient-to-tr from-primary to-primary/50 backdrop-blur-lg px-6 py-2 font-semibold text-white transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl hover:shadow-primary/30"
				>
					<span className="text-base lg:text-lg">Get in touch with us</span>
					<div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
						<div className="relative h-full w-10 bg-white/30"></div>
					</div>
				</Link>
			</MotionInView>
		</div>
	);
}

export default Services;
