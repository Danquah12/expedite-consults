"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export interface TestimonialItem {
	name?: string;
	designation?: string;
	quote?: string;
	src?: string;
	image?: any;
}

export const AnimatedTestimonials = ({
	testimonials = [],
	autoplay = false,
}: {
	testimonials: TestimonialItem[];
	autoplay?: boolean;
}) => {
	const [active, setActive] = useState(0);

	const handleNext = () => {
		if (!testimonials.length) return;
		setActive((prev) => (prev + 1) % testimonials.length);
	};

	const handlePrev = () => {
		if (!testimonials.length) return;
		setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
	};

	useEffect(() => {
		if (autoplay && testimonials.length > 1) {
			const interval = setInterval(handleNext, 5000);
			return () => clearInterval(interval);
		}
	}, [autoplay, testimonials.length]);

	if (!testimonials.length) return null;
	const current = testimonials[active] || {};

	return (
		<div className="mx-auto max-w-sm px-4 lg:py-16 font-sans antialiased md:max-w-4xl md:px-8 lg:px-12 bg-gradient-to-b from-transparent to-primary/70 lg:from-primary/20 lg:bg-gradient-to-br shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl">
			<div className="relative grid grid-cols-1 gap-14 md:grid-cols-2">
				<div>
					<div className="relative h-80 w-full rounded-2xl overflow-hidden bg-zinc-900 shadow-lg">
						<img
							src={current.src || (typeof current.image === "string" ? current.image : "") || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"}
							alt={current.name ?? "Testimonial"}
							className="h-full w-full object-cover object-center transition-all duration-500"
						/>
					</div>
				</div>

				<div className="flex flex-col justify-between py-4">
					<div className="transition-opacity duration-300">
						<h3 className="text-xl lg:text-2xl font-bold text-zinc-900 dark:text-white">
							{current.name}
						</h3>
						<p className="text-sm text-zinc-500 dark:text-zinc-400">
							{current.designation}
						</p>

						<p className="mt-6 text-sm lg:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
							&ldquo;{current.quote}&rdquo;
						</p>
					</div>

					<div className="flex gap-4 pt-8 md:pt-0">
						<button
							onClick={handlePrev}
							aria-label="Previous testimonial"
							className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
						>
							<ArrowLeft className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
						</button>
						<button
							onClick={handleNext}
							aria-label="Next testimonial"
							className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
						>
							<ArrowRight className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
