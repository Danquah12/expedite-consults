import { cn } from "@/lib/utils";
import { GetInsightByCategoryQueryResult } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import { format } from "date-fns";
import Link from "next/link";
import React from "react";

import { InsightCard } from "./Cards";
import MotionInView from "./MotionInView";
import { routes } from "@/constant/routes";

const InsightPage = ({
	insight,
}: {
	insight: GetInsightByCategoryQueryResult;
}) => {
	const tops = insight.filter(
		(i) => i.isTopBlog === true || i.isTopNews === true
	);

	return (
		<>
			{tops[0] ? (
				<div
					style={{
						backgroundImage: tops[0].mainImage
							? `url(${urlFor(tops[0].mainImage).url()})`
							: "none",
					}}
					className="relative w-full z-[1] h-[550px] lg:h-[680px] bg-no-repeat bg-cover bg-center bg-blend-overlay flex flex-col gap-4 items-center justify-center"
				>
					<span className="absolute -z-[1] inset-0 bg-gradient-to-r from-secondary via-secondary to-transparent"></span>
					<div className="container flex items-end gap-5 w-full h-full px-4 pb-14 md:pb-24">
						<MotionInView
							scale={0.8}
							delay={0.3}
							className="max-w-[680px] font-medium text-white"
						>
							<span
								className={cn(
									"flex mb-4 text-xs px-2 py-1 pr-6 text-background w-fit [clip-path:polygon(0_0,100%_0,80%_100%,0%_100%)]",
									{
										"bg-purple-400": tops[0].category?.title === "Blogs",
										"bg-blue-400": tops[0].category?.title === "News",
									}
								)}
							>
								<span className="text-xs">
									Top {tops[0].category?.title == "Blogs" ? "Blog" : "News"}
								</span>
							</span>

							<h1 className="text-3xl lg:text-5xl leading-[1.2] line-clamp-2">
								{tops[0]?.title}
							</h1>
							<span
								aria-hidden="true"
								className="block my-5 rounded-full lg:my-6 w-full h-[1px] bg-gradient-to-r from-primary to-transparent"
							/>
							<div className="text-sm lg:text-base max-w-[550px] text-white font-normal line-clamp-3">
								{tops[0]?.description}
							</div>
							<span className="inline-block text-xs mt-4 items-center gap-1 text-primary px-3 py-1.5 rounded-full w-fit bg-gradient-to-r from-primary/10 to-primary/5">
								{format(new Date(tops[0]._createdAt), "d MMMM, yyyy")}
							</span>
							<div className="flex items-center gap-5 mt-8">
								{/* <Link
								href={"#"}
								className="font-normal text-sm lg:text-base mb-0 px-6 py-2.5 bg-gradient-to-tr from-primary to-primary/50 text-white hover:bg-gradient-to-tr hover:from-primary hover:to-primary transition-all duration-300"
							>
								Contact Us
							</Link> */}
								<Link
									href={`${routes.insight.url}/${tops[0].category?.slug?.current}/${tops[0].slug?.current}`}
									className="text-sm pr-11 [clip-path:polygon(0_0,100%_0,80%_100%,0%_100%)] text-secondary font-semibold lg:text-base mb-0 px-6 py-2.5 bg-white"
								>
									Read More
								</Link>
							</div>
						</MotionInView>
					</div>
				</div>
			) : (
				<div className="relative w-full z-[1] h-[300px] lg:h-[400px] bg-secondary/80 flex flex-col gap-4 items-center justify-center">
					<span className="absolute -z-[1] inset-0 bg-gradient-to-r from-secondary via-secondary to-transparent" />
					<div className="container flex items-end gap-5 w-full h-full px-4 pb-8 md:pb-16">
						<MotionInView
							scale={0.8}
							delay={0.3}
							className="max-w-[680px] text-white flex flex-col gap-4"
						>
							<h2 className="text-2xl lg:text-4xl font-medium">
								{insight[0].category?.title}
							</h2>
							<p className="text-sm lg:text-base max-w-[550px] font-normal">
								{insight[0].category?.description}
							</p>
						</MotionInView>
					</div>
				</div>
			)}

			<div className="w-full relative overflow-hidden">
				<div className="container relative w-full h-full px-4 py-8 lg:py-18 mx-auto flex flex-col gap-4">
					{insight.map(
						(insight, index) =>
							(insight.isTopBlog || insight.isTopNews) && (
								<MotionInView
									key={index}
									scale={0.8}
									delay={0.4}
									className="flex flex-col gap-4 self-start"
								>
									<h2 className="text-2xl lg:text-4xl text-primary font-semibold">
										{insight?.category?.title}
									</h2>
									<p className="text-sm lg:text-base text-muted-foreground max-w-[650px] font-normal">
										{insight?.category?.description}
									</p>
								</MotionInView>
							)
					)}

					<div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-10 w-full">
						{insight.map((list, i) => {
							return (
								<MotionInView key={list._id} scale={0.8} delay={0.6}>
									<InsightCard
										href={`${routes.insight.url}/${list.category?.slug?.current}/${list.slug?.current}`}
										insight={list}
										index={i}
									/>
								</MotionInView>
							);
						})}
					</div>
				</div>
			</div>
		</>
	);
};

export default InsightPage;
