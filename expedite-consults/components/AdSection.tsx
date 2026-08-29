import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import React from "react";

import MotionInView from "./MotionInView";
import { routes } from "@/constant/routes";

export default function AdSection() {
	return (
		<div className="relative w-full z-[1] h-[300px] lg:h-[400px] bg-[url(/img2.jpeg)] bg-no-repeat bg-cover bg-center bg-blend-overlay flex flex-col gap-4 items-center justify-center px-4">
			<span className="absolute -z-[1] inset-0 bg-gradient-to-r from-primary via-primary to-transparent"></span>
			<div className="container flex items-center gap-5 w-full h-full px-4">
				<MotionInView
					direction="left"
					delay={0.3}
					className="flex flex-col gap-6"
				>
					<h2 className="text-3xl lg:text-5xl max-w-[680px] font-medium text-white">
						Talk to The Team
					</h2>
					<div className="text-sm lg:text-base max-w-[550px] text-white font-normal">
						Whether you're facing immediate challenges or planning for long-term
						security goals, our consultants at Expedite Consults are ready to
						support you every step of the way.
					</div>

					<Link
						href={routes.contact.url}
						className="group/button self-start relative inline-flex items-center pr-16 mt-5 [clip-path:polygon(0_0,100%_0,80%_100%,0%_100%)] justify-center overflow-hidden bg-gradient-to-tr from-secondary to-secondary/50 backdrop-blur-lg px-6 py-2 font-semibold text-white transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl hover:shadow-primary/30"
					>
						<span className="text-sm lg:text-lg">Get in touch</span>
						<div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
							<div className="relative h-full w-10 bg-white/30"></div>
						</div>
					</Link>
				</MotionInView>
			</div>
		</div>
	);
}
