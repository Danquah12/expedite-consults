import { InsightCard } from "@/components/Cards";
import InsightPage from "@/components/InsightPage";
import MotionInView from "@/components/MotionInView";
import { routes } from "@/constant/routes";
import { getInsightsByCategorySlug } from "@/sanity/lib/insights/getInsightsByCategorySlug";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
	title: "Cybersecurity News & Insights | Expedite Consults",
	description:
		"Explore the latest in cybersecurity trends, industry updates, and expert insights from Expedite Consults. Stay informed and ahead of emerging threats",
};

const page = async () => {
	const news = await getInsightsByCategorySlug("news");

	return <InsightPage insight={news} />;
};

export default page;
