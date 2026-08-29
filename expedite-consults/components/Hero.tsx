import React from "react";

import getSiteSettings from "@/sanity/lib/others/getSiteSettings";
import { urlFor } from "@/sanity/lib/image";
import HeroContent from "./HeroContent";

export default async function Hero() {
	const site = await getSiteSettings();

	return (
		<div
			style={{
				backgroundImage: site?.heroImage
					? `url(${urlFor(site?.heroImage).url()})`
					: "",
			}}
			className="relative w-full z-[1] h-[580px] lg:h-[750px] bg-[url(/hero.png)] bg-no-repeat bg-cover bg-center bg-blend-overlay flex flex-col gap-4 items-center justify-center pt-10"
		>
			<span className="absolute -z-[1] inset-0 bg-gradient-to-br from-secondary/90 via-secondary/70 to-transparent backdrop-blur-[2px]"></span>
			<div className="container flex items-center gap-5 w-full h-full px-4 xl:px-8">
				<HeroContent
					heroHeading={site?.heroHeading ?? ""}
					heroSubheading={site?.heroSubheading ?? ""}
				/>
			</div>
		</div>
	);
}
