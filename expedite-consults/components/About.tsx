import { servicesData } from "@/constant";
import React from "react";

import { HomeCard, NumberCard } from "./Cards";
import MotionInView from "./MotionInView";
import Image from "next/image";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { routes } from "@/constant/routes";

const stats = [
	{
		number: 500,
		title: "Projects Completed",
	},
	{
		number: 1000,
		title: "Happy Clients",
	},
	{
		number: 200,
		title: "Awards Won",
	},
];

function About() {
	return (
		<div className="py-8 lg:py-18 relative space-y-6">
			{/* <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-black/55 dark:from-white/15 dark:to-black/40" />
			<div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background/20" /> */}
			<MotionInView
				direction="up"
				delay={0.3}
				className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 w-full"
			>
				{stats.map((stat, i) => {
					return <NumberCard key={i} {...stat} />;
				})}
			</MotionInView>
			<div className="container px-4 w-full h-full mx-auto flex flex-col lg:flex-row flex-1 gap-5 lg:gap-14 items-center">
				<MotionInView
					direction="up"
					delay={0.3}
					className="relative lg:flex-[0.5] w-full min-h-[200px] md:min-h-[300px] lg:min-h-[400px] overflow-hidden "
				>
					<Image
						src="/img.jpg"
						fill
						alt="img"
						priority
						sizes="(max-width: 768px) 100vw, 800px"
						className="object-cover"
					/>
				</MotionInView>
				<MotionInView
					delay={0.3}
					direction="up"
					className="lg:flex-[0.5] flex flex-col gap-6 lg:gap-8"
				>
					<h1 className="text-2xl lg:text-4xl font-semibold relative">
						About Expedite <span className="text-primary"> Consults LLC</span>
					</h1>

					<p className="text-sm md:text-base">
						At Expedite Consults, we specialize in delivering smart, scalable
						solutions that empower schools, institutions, and organizations to
						streamline their operations, enhance learning experiences, and
						embrace digital transformation. With a focus on innovation,
						reliability, and user-friendly design, we offer tailored consulting
						and technology services that help our clients save time, improve
						efficiency, and stay ahead in a fast-evolving world. Whether you're
						modernizing your learning platform or optimizing internal systems,
						we're here to make it simple—and fast
					</p>

					<div className="flex gap-3">
						{/* <Link
							href="/become-a-partner"
							className={cn(
								"!rounded-full !py-6 !px-6 !text-sm lg:!text-base",
								buttonVariants()
							)}
						>
							Get in touch
						</Link> */}

						{/* <Link
							href={"#"}
							className="font-normal ml-auto text-sm text-primary mb-0 rounded-md px-6 py-2.5 bg-gray-200/50"
						>
							Read More
						</Link> */}
						<Link
							href={routes.about.url}
							className="group/button relative ml-auto inline-flex items-center pr-11 [clip-path:polygon(0_0,100%_0,80%_100%,0%_100%)] justify-center overflow-hidden bg-gradient-to-tr from-primary to-primary/50 backdrop-blur-lg px-6 py-2 font-semibold text-white transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl hover:shadow-primary/30"
						>
							<span className="text-sm">Read More</span>
							<div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
								<div className="relative h-full w-10 bg-white/30"></div>
							</div>
						</Link>
					</div>
				</MotionInView>
			</div>
		</div>
	);
}

export default About;
