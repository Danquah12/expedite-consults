import React from "react";
import Insight from "@/components/Insight";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { routes, subroutes } from "@/constant/routes";
import { urlFor } from "@/sanity/lib/image";
import getInsightBySlug from "@/sanity/lib/insights/getInsightBySlug";
import { ArrowLeft, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "next-sanity";
import { portableComponents } from "@/components/PortableComponents";
import { format } from "date-fns";
import ShareButtons from "@/components/ShareButtons";

interface BlogPageProps {
	params: Promise<{
		slug: string;
	}>;
}

async function BlogPage({ params }: BlogPageProps) {
	const { slug } = await params;

	const blog = await getInsightBySlug(slug);

	if (!blog) {
		return (
			<div className="container mx-auto px-4 py-8 mt-16">
				<h1 className="text-4xl font-bold">Blog not found</h1>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="relative min-h-[350px] md:min-h-[480px] w-full">
				{/* {course.image && (
					<Image
						src={urlFor(course.image).url() || ""}
						alt={course.title || "Course Title"}
						fill
						className="object-cover"
						priority
					/>
				)} */}

				<Image
					src={blog.mainImage ? urlFor(blog.mainImage).url() : ""}
					alt={blog.title || "Title"}
					fill
					className="object-cover"
					priority
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-secondary to-secondary/60" />
				<div className="absolute inset-0 container mx-auto px-4 flex flex-col justify-end pb-8 lg:pb-16">
					<Link
						href={subroutes.insight[0].url}
						prefetch={false}
						className="text-white text-xs lg:text-sm mb-8 flex items-center hover:text-primary transition-colors w-fit"
					>
						<ArrowLeft className="mr-2 size-4" />
						Back to Blogs
					</Link>
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
						<div>
							<h1 className="text-2xl md:text-4xl font-bold text-white mb-4 w-full max-w-4xl">
								{blog?.title}
							</h1>

							<span className="inline-block text-xs mt-4 items-center gap-1 pr-7 text-primary px-3 py-1.5 [clip-path:polygon(0_0,100%_0,80%_100%,0%_100%)] w-fit bg-gradient-to-r from-primary/10 to-primary/5">
								{format(new Date(blog._createdAt), "d MMMM, yyyy")}
							</span>

							<span className="inline-block text-xs mt-4 items-center gap-1 text-background px-3 py-1.5 w-fit bg-gradient-to-r from-purple-500/80 to-purple-500/50 pl-6 [clip-path:polygon(32%_0,100%_0,100%_100%,0%_100%)]">
								{blog.category?.title}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Content Section */}
			<div className="container mx-auto px-4 py-12 mb-6">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
					{/* Main Content */}
					<div className="lg:col-span-2">
						<TracingBeam className="rounded-lg pl-6 md:pl-0">
							{blog.body && (
								<PortableText
									value={blog.body}
									components={portableComponents}
								/>
							)}
						</TracingBeam>
					</div>

					{/* Sidebar */}
					<div>
						<div className="bg-card sticky top-24">
							<div className="w-full p-4 border border-border">
								<h2 className="text-lg font-bold mb-4">Author</h2>

								<div>
									<div className="flex items-center gap-3 mb-4">
										<div className="relative h-12 w-12">
											<Image
												src={
													blog.author?.image
														? urlFor(blog.author.image).url()
														: ""
												}
												alt={"Course Instructor"}
												fill
												sizes="(max-width: 768px) 100vw, 800px"
												className="rounded-full object-cover"
											/>
										</div>
										<div>
											<div className="font-medium text-sm">
												{blog.author?.name}
											</div>
											<div className="text-xs text-muted-foreground">
												Author
											</div>
										</div>
									</div>

									{blog.author?.bio && (
										<div className="text-sm text-muted-foreground">
											<PortableText value={blog.author?.bio} />
										</div>
									)}
								</div>
							</div>

							{/* share socials */}
							<div className="w-full p-4 flex items-center gap-2 mt-4">
								<p className="text-sm">Share this post:</p>
								<ShareButtons
									url={`${process.env.NEXT_PUBLIC_BASE_URL}/${routes.insight.url}/blogs/${blog.slug?.current}`}
									title={blog?.title ?? ""}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<Insight />
		</div>
	);
}

export default BlogPage;
