import { FAQs } from "@/constant";
import React from "react";

import MotionInView from "./MotionInView";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "./ui/accordion";

function FAQ() {
	return (
		<section className="container relative w-full h-full px-8 py-8 lg:py-18 mx-auto flex flex-col gap-4 items-center justify-center my-6">
			<MotionInView
				direction="up"
				delay={0.4}
				className="flex flex-col gap-4 items-center mb-8 justify-center"
			>
				<h2 className="text-2xl lg:text-4xl text-center font-semibold">
					Frequently Asked Questions
				</h2>
				<p className="text-sm lg:text-base text-center text-muted-foreground max-w-[650px] font-normal">
					Got questions? We've got answers. Here’s everything you need to know
					about working with Expedite Consults LLC.{" "}
				</p>
			</MotionInView>

			<MotionInView direction="up" delay={0.4}>
				<Accordion
					type="single"
					className="w-full lg:w-[800px] lg:space-y-4"
					defaultValue="item-1"
					collapsible
					data-aos="fade-up"
				>
					{FAQs.map((item) => (
						<AccordionItem key={item.value} value={item.value}>
							<AccordionTrigger className="text-left text-base lg:text-lg focus:no-underline hover:no-underline cursor-pointer">
								{item.title}
							</AccordionTrigger>
							<AccordionContent className="text-sm lg:text-base text-gray-600">
								{item.content}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</MotionInView>
		</section>
	);
}

export default FAQ;
