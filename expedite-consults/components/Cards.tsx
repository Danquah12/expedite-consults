import { routes } from "@/constant/routes";
import { cn } from "@/lib/utils";
import {
	GetServicesQueryResult,
	internalGroqTypeReferenceTo,
	SanityImageCrop,
	SanityImageHotspot,
	Slug,
} from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import { formatDistanceToNow } from "date-fns";
import * as LucideIcons from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ComponentType, SVGProps } from "react";

import CountUpOnView from "./CountUpOnView";
import { DynamicIcon } from "./DynamicIcon";

interface InsightCardProps {
	index: number;
	href: string;
	insight: {
		_id: string;
		title: string | null;
		slug: Slug | null;

		mainImage: {
			asset?: {
				_ref: string;
				_type: "reference";
				_weak?: boolean;
				[internalGroqTypeReferenceTo]?: "sanity.imageAsset";
			};
			media?: unknown;
			hotspot?: SanityImageHotspot;
			crop?: SanityImageCrop;
			_type: "image";
		} | null;
		category: {
			_id: string;
			_type: "category";
			_createdAt: string;
			_updatedAt: string;
			_rev: string;
			title?: string;
			slug?: Slug;
			description?: string;
		} | null;
		publishedAt: string | null;
		description: Array<string | null> | null;
	};
	className?: string;
}

export function HomeCard({
	service,
	index,
}: {
	service: GetServicesQueryResult[number];
	index: number;
}) {
	return (
		<div className="group relative p-4 w-full min-w-[300px] h-[350px] lg:h-[450px] bg-secondary  flex flex-col items-center justify-center gap-4 overflow-hidden">
			<div className="flex flex-col items-center gap-4 w-full">
				<h2 className="text-xl max-w-[100px] text-center text-white font-semibold">
					{service?.name}
				</h2>
				<span
					style={{
						backgroundColor: service.color?.hex
							? `${service.color.hex}10`
							: "#4fc0d425",
					}}
					className={cn("p-6 bg-primary/10 rounded-full w-fit")}
				>
					<DynamicIcon
						strokeWidth={1.2}
						name={service.icon as keyof typeof LucideIcons}
						className="size-12 lg:size-16"
						style={{
							color: service.color?.hex ? service.color.hex : "#4fc0d4",
						}}
					/>
				</span>
			</div>

			<div className="absolute lg:-z-[1] lg:opacity-0 group-hover:opacity-100 group-hover:z-[1] transition-all duration-300 ease-in-out inset-0 bg-primary p-4 flex flex-col items-center justify-center gap-4">
				<DynamicIcon
					strokeWidth={1.2}
					name={service.icon as keyof typeof LucideIcons}
					className="size-12 lg:size-16 text-white"
				/>

				<div className="flex flex-col items-center  gap-2 w-full">
					<h2 className="text-xl text-white font-semibold">{service?.name}</h2>
					<p className="text-sm lg:text-base text-white text-center line-clamp-3">
						{service?.description}
					</p>
				</div>

				<Link
					href={`${routes.services}/${service.slug?.current}`}
					className="group/button relative mt-10 inline-flex items-center pr-11 [clip-path:polygon(0_0,100%_0,80%_100%,0%_100%)] justify-center overflow-hidden bg-gradient-to-tr from-secondary to-secondary/50 backdrop-blur-lg px-6 py-2 font-semibold text-white transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl hover:shadow-primary/30"
				>
					<span className="text-sm">Learn More</span>
					<div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
						<div className="relative h-full w-10 bg-white/30"></div>
					</div>
				</Link>
			</div>
		</div>
	);
}
export function NumberCard({
	number,
	title,
	index,
}: {
	number: number;
	title: string;
	index?: number;
}) {
	return (
		<div className="p-4 w-full min-w-[300px] bg-secondary  flex flex-col items-center justify-center gap-4 overflow-hidden">
			<div className="flex items-center justify-between lg:justify-center gap-4 w-full">
				<h2 className="text-base lg:text-xl text-center text-white font-semibold">
					{title}
				</h2>

				<CountUpOnView
					to={number}
					suffix="+"
					className="text-2xl lg:text-4xl font-bold text-primary"
				/>
			</div>
		</div>
	);
}
export function InsightCard({
	href,
	insight,
	index,
	className,
}: InsightCardProps) {
	return (
		<Link
			href={href}
			className={cn(
				"group w-full h-full bg-background shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col relative overflow-hidden transition-all duration-300 ease-in-out",
				className
			)}
		>
			<span
				className={cn(
					"absolute top-0 left-0 z-10 text-xs px-2 py-1 pr-6 bg-primary text-background w-fit [clip-path:polygon(0_0,100%_0,80%_100%,0%_100%)]",
					{
						"bg-purple-400": insight.category?.title === "Blogs",
						"bg-blue-400": insight.category?.title === "News",
					}
				)}
			>
				{insight.category?.title}
			</span>

			{insight && (
				<div className="relative overflow-hidden w-full h-[120px] lg:h-[180px] bg-gradient-to-br from-primary/5 to-primary/15 p-3 text-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
					<Image
						src={insight.mainImage ? urlFor(insight.mainImage).url() : ""}
						alt="insight"
						fill
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						className="object-cover group-hover:scale-110 transition-all duration-300 ease-in-out"
					/>
				</div>
			)}
			<div className="flex flex-col justify-between flex-1 gap-4">
				<div className="flex flex-col gap-2 w-full p-3">
					<h2 className="text-base lg:text-xl text-secondary font-semibold line-clamp-2">
						{insight?.title}
					</h2>

					<p className="text-xs lg:text-sm text-gray-600 line-clamp-2">
						{insight?.description}
					</p>
				</div>

				<div className="flex items-center justify-between w-full mt-auto">
					{insight?.publishedAt && (
						<span className="text-xs text-gray-500 p-3">
							{formatDistanceToNow(new Date(insight.publishedAt), {
								addSuffix: true,
							})}
						</span>
					)}
					<span className="mt-auto text-xs lg:text-sm text-white bg-primary px-3 pl-7 py-2 ml-auto [clip-path:polygon(20%_0,100%_0,100%_100%,0%_100%)]">
						Read More
					</span>
				</div>
			</div>
		</Link>
	);
}
