"use client";

import { motion, type MotionProps } from "framer-motion";
import React from "react";
import type { JSX } from "react";

type MotionInViewProps = MotionProps & {
	children: React.ReactNode;
	direction?: "up" | "down" | "left" | "right";
	delay?: number;
	duration?: number; // 👈 add this
	scale?: number;
	tag?: keyof JSX.IntrinsicElements;
	className?: string;
};

export default function MotionInView({
	className,
	children,
	direction,
	delay = 0,
	duration = 0.5, // 👈 default to 0.8s
	scale,
	tag: Tag = "div",
	...rest
}: MotionInViewProps) {
	const offset = 100;

	const variants = {
		hidden: {
			opacity: 0,
			scale: scale ?? 1,
			x: direction === "left" ? -offset : direction === "right" ? offset : 0,
			y: direction === "up" ? offset : direction === "down" ? -offset : 0,
		},
		visible: {
			opacity: 1,
			scale: 1,
			x: 0,
			y: 0,
			transition: {
				delay,
				duration,
				ease: "easeOut",
			},
		},
	};

	const MotionTag = motion[Tag as keyof typeof motion] as React.FC<
		React.ComponentPropsWithoutRef<typeof motion.div>
	>;

	return (
		<MotionTag
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true }}
			variants={variants}
			className={className}
			{...rest}
		>
			{children}
		</MotionTag>
	);
}
