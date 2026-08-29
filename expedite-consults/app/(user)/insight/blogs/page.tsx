import InsightPage from "@/components/InsightPage";
import { getInsightsByCategorySlug } from "@/sanity/lib/insights/getInsightsByCategorySlug";
import { Metadata } from "next";
import React from "react";

export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
	title: "Cybersecurity Insights & Industry Updates | Expedite Consults Blog",
	description:
		"Explore expert analysis, practical tips, and the latest trends in cybersecurity, cloud security, compliance, and more — straight from the team at Expedite Consults",
};

const page = async () => {
	const blogs = await getInsightsByCategorySlug("blogs");

	return <InsightPage insight={blogs} />;
};

export default page;
