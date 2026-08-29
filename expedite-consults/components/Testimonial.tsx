import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import getTestimonial from "@/sanity/lib/others/getTestimonials";

import MotionInView from "./MotionInView";

export async function Testimonials() {
	const testimonials = await getTestimonial();

	if (testimonials.length > 0) {
		return (
			<div className="container overflow-hidden relative bg-primary/10 w-full h-full px-4 lg:px-14 py-8 lg:py-16 my-16 mx-auto flex flex-col lg:flex-row lg:items-center gap-6">
				<MotionInView scale={0.8} delay={0.4} className="flex flex-col gap-4">
					<h2 className="text-2xl lg:text-4xl font-semibold">
						What Our <span className="text-primary">Clients</span> Say
					</h2>
					<p className="text-sm lg:text-base text-muted-foreground max-w-[650px] font-normal">
						Discover the positive impact our clients have had on their
						businesses with our cutting-edge solutions.
					</p>
				</MotionInView>
				<MotionInView scale={0.8} delay={0.4} className="flex flex-col gap-4">
					<AnimatedTestimonials testimonials={testimonials} />
				</MotionInView>
			</div>
		);
	}
}
