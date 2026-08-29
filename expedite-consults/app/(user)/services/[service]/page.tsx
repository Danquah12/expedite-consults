import { DynamicIcon } from "@/components/DynamicIcon";
import Insight from "@/components/Insight";
import MotionInView from "@/components/MotionInView";
import { portableComponents } from "@/components/PortableComponents";
import { routes } from "@/constant/routes";
import { urlFor } from "@/sanity/lib/image";
import getServicesBySlug from "@/sanity/lib/services/getServiceBySlug";
import * as LucideIcons from "lucide-react";
import { PortableText } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface ServicePageProps {
	params: Promise<{
		service: string;
	}>;
}

async function ServicePage({ params }: ServicePageProps) {
	const { service } = await params;

	const data = await getServicesBySlug(service);

	if (!data) {
		return (
			<div className="container mx-auto px-4 py-8 mt-16">
				<h1 className="text-4xl font-bold">Service not found</h1>
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
								name={data?.icon as keyof typeof LucideIcons}
								className="size-10 lg:size-16 shrink-0"
								style={{
									color: data.color?.hex ? data.color.hex : "#4fc0d4",
								}}
							/>
							<h2 className="text-2xl lg:text-4xl font-medium">{data?.name}</h2>
						</div>
						<div className="text-sm lg:text-base max-w-[550px] font-normal line-clamp-3">
							{data?.description}
						</div>
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
							<Link href={"#"} className="text-sm cursor-default">
								{data?.name}
							</Link>
						</div>
					</MotionInView>
				</div>
			</div>

			<div className="py-8 lg:py-18 relative space-y-6">
				<div className="container px-4 w-full h-full mx-auto flex flex-col lg:flex-row flex-1 gap-5 lg:gap-14 items-center">
					<MotionInView
						delay={0.3}
						direction="up"
						className="lg:flex-[0.5] flex flex-col gap-6 lg:gap-8"
					>
						<div>
							{data.serviceBrief && (
								<PortableText
									value={data.serviceBrief}
									components={portableComponents}
								/>
							)}
						</div>
					</MotionInView>
					<MotionInView
						direction="up"
						delay={0.3}
						className="relative lg:flex-[0.5] w-full min-h-[200px] md:min-h-[300px] lg:min-h-[400px] overflow-hidden "
					>
						{data.serviceImage && (
							<Image
								src={urlFor(data.serviceImage).url()}
								fill
								alt="img"
								priority
								sizes="(max-width: 768px) 100vw, 800px"
								className="object-cover"
							/>
						)}
					</MotionInView>
				</div>
			</div>

			{data.cyberSecurityServices?.length! > 0 && (
				<div className="py-8 lg:py-18 relative bg-primary/10">
					<div className="container px-4 w-full h-full mx-auto flex flex-col gap-5">
						<MotionInView
							direction="up"
							delay={0.4}
							className="flex flex-col gap-4 justify-center"
						>
							<h2 className="text-2xl lg:text-4xl font-semibold">
								Our {data?.name} Services
							</h2>

							<p className="text-sm lg:text-base text-muted-foreground max-w-[850px] font-normal">
								Comprehensive solutions tailored to meet your unique needs. Our
								services are designed to enhance efficiency, improve
								performance, and drive growth.
							</p>
						</MotionInView>

						<MotionInView
							direction="up"
							delay={0.5}
							className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-10 w-full "
						>
							{data.cyberSecurityServices?.map((service, i) => (
								<Link
									href={`${data?.slug?.current}/${service.slug?.current}`}
									key={i}
									className="flex flex-col gap-3 w-full overflow-hidden min-w-[300px] h-auto bg-background hover:scale-[1.02] shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 ease-in-out"
								>
									<div className="flex flex-col gap-4 p-5">
										<h2 className="text-base lg:text-xl text-secondary font-semibold">
											{service?.title}
										</h2>

										<p className="text-sm lg:text-base text-gray-600 line-clamp-4">
											{service?.description}
										</p>
									</div>

									<span className="inline-block text-sm bg-primary ml-auto self-start text-white px-4 py-2 font-semibold mt-auto pl-11 [clip-path:polygon(20%_0,100%_0,100%_100%,0%_100%)]">
										View Service
									</span>
								</Link>
							))}
						</MotionInView>
					</div>
				</div>
			)}
			{data.cyberSecurityFrameworks?.length! > 0 && (
				<div className="py-8 lg:py-18 relative">
					<div className="container px-4 w-full h-full mx-auto flex flex-col gap-5">
						<MotionInView
							direction="up"
							delay={0.4}
							className="flex flex-col gap-4 justify-center"
						>
							<h2 className="text-2xl lg:text-4xl font-semibold">
								Cyber Security Frameworks
							</h2>

							{/* <p className="text-sm lg:text-base text-muted-foreground max-w-[850px] font-normal">
								Comprehensive solutions tailored to meet your unique needs. Our
								services are designed to enhance efficiency, improve
								performance, and drive growth.
							</p> */}
						</MotionInView>

						<MotionInView
							direction="up"
							delay={0.5}
							className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-10 w-full "
						>
							{data.cyberSecurityFrameworks?.map((service, i) => (
								<Link
									href={`${data?.slug?.current}/${service.slug?.current}`}
									key={i}
									className="flex flex-col gap-3 w-full overflow-hidden min-w-[300px] h-auto bg-background hover:scale-[1.02] shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 ease-in-out"
								>
									<div className="flex flex-col gap-4 p-5">
										<h2 className="text-base lg:text-xl text-secondary font-semibold">
											{service?.title}
										</h2>

										<p className="text-sm lg:text-base text-gray-600 line-clamp-4">
											{service?.description}
										</p>
									</div>

									<span className="inline-block text-sm bg-primary ml-auto self-start text-white px-4 py-2 font-semibold mt-auto pl-11 [clip-path:polygon(20%_0,100%_0,100%_100%,0%_100%)]">
										View Service
									</span>
								</Link>
							))}
						</MotionInView>
					</div>
				</div>
			)}

			<div className="py-8 lg:py-18 relative">
				<div className="container px-4 w-full h-full mx-auto flex flex-col gap-5">
					<MotionInView
						direction="up"
						delay={0.4}
						className="flex flex-col gap-4 items-center justify-center"
					>
						<h2 className="text-2xl text-center lg:text-4xl text-primary font-semibold max-w-[750px]">
							Benefits of our {data?.name} Services
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
						{data?.benefits?.map((value, i) => (
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

			<div className="py-8 lg:py-18 relative space-y-6">
				<div className="container px-4 w-full h-full mx-auto flex flex-col lg:flex-row flex-1 gap-5 lg:gap-14 items-center">
					<MotionInView
						delay={0.3}
						direction="up"
						className="lg:flex-[0.5] flex flex-col"
					>
						<h1 className="text-2xl lg:text-4xl font-semibold relative">
							Why is <span className="text-primary">{data?.name}</span>{" "}
							Important?
						</h1>

						<div>
							{data.importanceOfService && (
								<PortableText
									value={data.importanceOfService}
									components={portableComponents}
								/>
							)}
						</div>
					</MotionInView>
					<MotionInView
						direction="up"
						delay={0.3}
						className="relative lg:flex-[0.5] w-full min-h-[200px] md:min-h-[300px] lg:min-h-[500px] overflow-hidden "
					>
						<Image
							src="/img9.jpeg"
							fill
							alt="img"
							priority
							sizes="(max-width: 768px) 100vw, 800px"
							className="object-cover"
						/>
					</MotionInView>
				</div>
			</div>

			<div className="py-8 lg:py-18 relative space-y-6">
				<div className="container px-4 w-full h-full mx-auto flex flex-col lg:flex-row flex-1 gap-5 lg:gap-14 items-center">
					<MotionInView
						direction="up"
						delay={0.3}
						className="relative lg:flex-[0.5] w-full min-h-[200px] md:min-h-[300px] lg:min-h-[500px] overflow-hidden"
					>
						<Image
							src="/img10.jpeg"
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
						className="lg:flex-[0.5] flex flex-col -order-1 lg:order-none"
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

			<Insight />
		</>
	);
}

export default ServicePage;
