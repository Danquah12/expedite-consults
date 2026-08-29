import AdSection from "@/components/AdSection";
import { DynamicIcon } from "@/components/DynamicIcon";
import MotionInView from "@/components/MotionInView";
import { portableComponents } from "@/components/PortableComponents";
import { routes } from "@/constant/routes";
import { urlFor } from "@/sanity/lib/image";
import {
	getSecurityFrameworkByContentSlug,
	getSecurityFrameworkBySlug,
} from "@/sanity/lib/services/getSecurityFrameworkBySlug";
import {
	getServicesByContentSlug,
	getServicesContentBySlug,
} from "@/sanity/lib/services/getServiceContentBySlug";

import * as LucideIcons from "lucide-react";
import { PortableText } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface ServiceContentPageProps {
	params: Promise<{
		slug: string;
	}>;
}

async function ServiceContentPage({ params }: ServiceContentPageProps) {
	const { slug } = await params;

	const data =
		(await getServicesContentBySlug(slug)) ||
		(await getSecurityFrameworkBySlug(slug));

	const service =
		(await getServicesByContentSlug(slug)) ||
		(await getSecurityFrameworkByContentSlug(slug));

	if (!data) {
		return (
			<div className="container mx-auto px-4 py-8 mt-16">
				<h1 className="text-4xl font-bold">News not found</h1>
			</div>
		);
	}

	return (
		<>
			<div className="relative w-full z-[1] h-[300px] lg:h-[430px] bg-[url(/img5.jpeg)] bg-no-repeat bg-cover bg-center bg-blend-overlay flex flex-col gap-4 items-center justify-center">
				<span className="absolute -z-[1] inset-0 bg-gradient-to-r from-secondary via-primary to-transparent"></span>
				<div className="container flex items-end gap-5 w-full h-full px-4 pb-8 md:pb-16">
					<MotionInView
						scale={0.8}
						delay={0.3}
						className="max-w-[680px] text-white flex flex-col gap-4"
					>
						<div className="flex items-center gap-2">
							<DynamicIcon
								strokeWidth={1.2}
								name={service?.icon as keyof typeof LucideIcons}
								className="size-10 lg:size-16 shrink-0"
								style={{
									color: service?.color?.hex ? service?.color.hex : "#4fc0d4",
								}}
							/>
							<h2 className="text-2xl lg:text-4xl font-medium">
								{data?.title}
							</h2>
						</div>
						{/* <div className="text-sm lg:text-base max-w-[550px]  font-normal">
							{data?.description}
						</div> */}
					</MotionInView>
				</div>
			</div>
			{/* breadcrumb */}
			<div className="w-full bg-gradient-to-r from-secondary via-secondary to-primary">
				<div className="container h-full mx-auto flex items-center justify-start px-4 py-4">
					<MotionInView
						scale={0.8}
						delay={0.3}
						className="max-w-[680px] text-white flex flex-col gap-4"
					>
						<div className="flex items-center gap-2 flex-wrap">
							<Link href={routes.home} className="text-sm">
								Home
							</Link>
							<LucideIcons.ChevronRight className="size-3" />
							<Link href={routes.services} className="text-sm">
								Services
							</Link>
							<LucideIcons.ChevronRight className="size-3" />
							<Link
								href={`${routes.services}/${service?.slug?.current}`}
								className="text-sm"
							>
								{service?.name}
							</Link>
							<LucideIcons.ChevronRight className="size-3" />
							<Link href={"#"} className="text-sm cursor-default">
								{data?.title}
							</Link>
						</div>
					</MotionInView>
				</div>
			</div>

			<div className="container  py-8 lg:py-18 relative w-full h-full px-4 mx-auto flex flex-col gap-4 items-center justify-center">
				{/* <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/55 dark:from-white/15 dark:to-black/40" />
										<div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" /> */}
				<span className="absolute w-[100px] aspect-square top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary rounded-full blur-[142px] "></span>
				<MotionInView
					direction="up"
					delay={0.4}
					className="flex flex-col gap-4 items-center justify-center"
				>
					<h2 className="text-2xl lg:text-4xl text-center text-primary font-semibold">
						Service Summary
					</h2>
					<div>
						{data.serviceSummary && (
							<PortableText
								value={data.serviceSummary}
								components={portableComponents}
							/>
						)}
					</div>
				</MotionInView>
			</div>

			<div className="py-8 lg:py-18 relative bg-gradient-to-b lg:bg-gradient-to-r from-primary via-primary to-secondary">
				<div className="container px-4 w-full h-full mx-auto flex flex-col lg:flex-row flex-1 gap-5 lg:gap-14 items-center">
					<MotionInView
						delay={0.3}
						direction="up"
						className="lg:flex-[0.5] flex flex-col gap-6 lg:gap-8 text-white"
					>
						<h1 className="text-2xl lg:text-4xl font-semibold relative">
							Key Challenges Addressed
						</h1>

						<div>
							{data.keyChallenges && (
								<PortableText
									value={data.keyChallenges}
									components={portableComponents}
								/>
							)}
						</div>
					</MotionInView>
					<MotionInView
						direction="up"
						delay={0.3}
						className="relative lg:flex-[0.5] w-full h-auto overflow-hidden"
					>
						{data.keyChallengeImage && (
							<Image
								src={urlFor(data.keyChallengeImage).url()}
								alt="img"
								width={100}
								height={100}
								priority
								sizes="100vw"
								className="object-cover w-full h-[240px] lg:h-full"
							/>
						)}
					</MotionInView>
				</div>
			</div>

			<div className="py-8 lg:py-18 relative">
				<div className="container px-4 w-full h-full mx-auto flex flex-col gap-5">
					<MotionInView
						direction="up"
						delay={0.4}
						className="flex flex-col gap-4 items-center justify-center"
					>
						<h2 className="text-2xl text-center lg:text-4xl text-primary font-semibold max-w-[750px]">
							Benefits of our Services
						</h2>
						{/* <p className="text-sm lg:text-base text-center text-muted-foreground max-w-[850px] font-normal">
										Comprehensive solutions tailored to meet your unique needs. Our
										services are designed to enhance efficiency, improve performance,
										and drive growth.
									</p> */}
					</MotionInView>

					<MotionInView
						direction="up"
						delay={0.5}
						className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-10 w-full "
					>
						{data.benefits?.map((value: { icon?: string; name?: string; description?: string }, i: number) => (
							<MotionInView
								delay={i * 0.1 + 0.3}
								scale={0.8}
								key={i}
								className="p-4 py-10 w-full min-w-[300px] h-full bg-background shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col items-center gap-4 relative overflow-hidden transition-all duration-300 ease-in-out"
							>
								<DynamicIcon
									strokeWidth={1.2}
									name={value?.icon as keyof typeof LucideIcons}
									className="size-12 lg:size-16 text-primary shrink-0"
								/>

								<div className="flex flex-col gap-2 w-full">
									<h2 className="text-base text-center lg:text-xl text-secondary font-semibold">
										{value?.name}
									</h2>

									<p className="text-xs text-center lg:text-sm text-gray-600">
										{value.description}
									</p>
								</div>
							</MotionInView>
						))}
					</MotionInView>
				</div>
			</div>

			<div className="py-8 lg:py-18 relative bg-gradient-to-t lg:bg-gradient-to-r from-primary via-secondary to-secondary">
				<div className="container px-4 w-full h-full mx-auto flex flex-col lg:flex-row flex-1 gap-5 lg:gap-14">
					<MotionInView
						direction="up"
						delay={0.3}
						className="relative lg:flex-[0.5] w-full h-auto overflow-hidden "
					>
						{data.howItWorksImage && (
							<Image
								src={urlFor(data.howItWorksImage).url()}
								alt="img"
								width={100}
								height={100}
								priority
								sizes="100vw"
								className="object-cover w-full h-[240px] lg:h-full"
							/>
						)}
					</MotionInView>
					<MotionInView
						delay={0.3}
						direction="up"
						className="lg:flex-[0.5] flex flex-col gap-6 lg:gap-8 text-white lg:order-none -order-1"
					>
						<h1 className="text-2xl lg:text-4xl font-semibold relative">
							How it Works
						</h1>

						<div>
							{data.howItWorks && (
								<PortableText
									value={data.howItWorks}
									components={portableComponents}
								/>
							)}
						</div>
					</MotionInView>
				</div>
			</div>
			<AdSection />
		</>
	);
}

export default ServiceContentPage;
