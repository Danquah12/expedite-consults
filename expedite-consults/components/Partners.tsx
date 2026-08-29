import { cn } from "@/lib/utils";
import { Marquee } from "./ui/marquee";
import Image from "next/image";
import MotionInView from "./MotionInView";
import getSiteSettings from "@/sanity/lib/others/getSiteSettings";
import { urlFor } from "@/sanity/lib/image";

// const MarqueeItem = ({ img }: { img: string }) => {
// 	return (
// 		<Image
// 			src={img}
// 			alt="img"
// 			width="200"
// 			height="60"
// 			className="w-[200px] h-[60px] object-contain mx-10 brightness-110 transition-all duration-300 ease-in-out"
// 		/>
// 	);
// };

export async function Partners() {
	const site = await getSiteSettings();

	return (
		<MotionInView
			direction="up"
			delay={0.4}
			className="w-full flex flex-col items-center justify-center px-4 py-8 lg:py-18"
		>
			<div className="flex flex-col items-center justify-center gap-6 lg:gap-8 mb-10">
				<h2 className="text-2xl lg:text-4xl text-center font-semibold max-w-[800px]">
					Our <span className="text-primary">Trusted</span> Partners
				</h2>

				<p className="text-sm lg:text-base text-center text-muted-foreground max-w-[650px] font-normal">
					We partner with leading institutions and innovators to deliver
					smarter, faster, and more impactful solutions — shaping the future of
					consulting together.
				</p>
			</div>
			<div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
				<Marquee className="[--duration:20s]">
					{site?.partnerImage?.map((partner, i) => (
						<Image
							key={i}
							src={
								site?.partnerImage ? urlFor(site?.partnerImage[i]).url() : ""
							}
							alt={partner?.alt ?? ""}
							width="200"
							height="60"
							className="w-[200px] h-[60px] object-contain mx-10 brightness-110 transition-all duration-300 ease-in-out"
						/>
					))}
				</Marquee>

				<div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
				<div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
			</div>
		</MotionInView>
	);
}
