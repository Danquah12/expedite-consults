"use client";

import { useEffect, useRef } from "react";
import {
	motion,
	useMotionValue,
	useTransform,
	animate,
	useInView,
} from "framer-motion";

type CountUpOnViewProps = {
	from?: number;
	to: number;
	duration?: number;
	className?: string;
	decimals?: number;
	suffix?: string;
};

export default function CountUpOnView({
	from = 0,
	to,
	duration = 2,
	className = "",
	decimals = 0,
	suffix = "",
}: CountUpOnViewProps) {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true });

	const count = useMotionValue(from);
	const rounded = useTransform(count, (latest) => latest.toFixed(decimals));

	useEffect(() => {
		if (isInView) {
			animate(count, to, { duration, ease: "easeOut" });
		}
	}, [isInView, count, to, duration]);

	return (
		<span ref={ref} className={className}>
			<motion.span>{rounded}</motion.span>
			{suffix}
		</span>
	);
}
