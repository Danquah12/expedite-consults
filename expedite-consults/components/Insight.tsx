import getAllInsights from "@/sanity/lib/insights/getAllInsights";
import React from "react";

import { InsightCard } from "./Cards";
import MotionInView from "./MotionInView";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { routes } from "@/constant/routes";

async function Insight() {
	const insights = await getAllInsights();

	if (insights.length > 0) {
		return (
			<div className="w-full bg-secondary/90 relative overflow-hidden">
				<span className="absolute rotate-45 top-1/2 -translate-y-1/2 right-[20%] w-[200px] h-[200%] bg-gradient-to-b from-primary/80 via-primary/50 to-primary/20"></span>
				<div className="container relative w-full h-full px-4 py-8 lg:py-18 mx-auto flex flex-col gap-4 items-center justify-center">
					{/* <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/55 dark:from-white/15 dark:to-black/40" />
					<div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" /> */}
					<MotionInView
						direction="up"
						delay={0.4}
						className="flex w-full items-center justify-between flex-wrap gap-8"
					>
						<div className="flex flex-col gap-2 lg:gap-4 max-w-[800px]">
							<h2 className="text-2xl lg:text-4xl font-semibold text-primary">
								Latest <span className="text-background">Insights</span>
							</h2>
							<p className="text-sm lg:text-base text-white max-w-[650px] font-normal">
								Explore our resources and stay ahead of the curve.
							</p>
						</div>
					</MotionInView>

					<ScrollArea className="w-full">
						<MotionInView
							direction="right"
							delay={0.4}
							className="mt-10 flex items-center gap-5 lg:gap-12 w-max"
						>
							{insights.slice(0, 5).map((insight, i) => {
								return (
									<InsightCard
										key={insight._id}
										href={`${routes.insight.url}/${insight.category?.slug?.current}/${insight.slug?.current}`}
										insight={insight}
										index={i}
										className="max-w-[330px]"
									/>
								);
							})}
						</MotionInView>

						<ScrollBar
							className="data-[orientation=horizontal]:h-1.5"
							data-state="hidden"
							orientation="horizontal"
						/>
					</ScrollArea>
				</div>
			</div>
		);
	}
}

export default Insight;
