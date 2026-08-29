import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";

export const Icon = ({
	Icon,
	className,
	strokeWidth,
}: {
	Icon: LucideIcon;
	className?: string;
	strokeWidth?: number;
}) => {
	return (
		<Icon
			strokeWidth={strokeWidth}
			className={cn(
				"text-neutral-500 dark:text-neutral-200 h-5 w-5 flex-shrink-0",
				className
			)}
		/>
	);
};
