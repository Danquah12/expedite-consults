"use client";
import { LucideIcon } from "lucide-react";
import React from "react";
import { ComponentType, SVGProps, useEffect, useState } from "react";
interface DynamicIconProps extends SVGProps<SVGSVGElement> {
	name: string;
	className?: string;
	fallback?: React.ReactNode;
}

export function DynamicIcon({
	name,
	className = "size-4 text-primary",
	fallback = null,
	...props
}: DynamicIconProps) {
	const [Icon, setIcon] = useState<ComponentType<
		SVGProps<SVGSVGElement>
	> | null>(null);

	useEffect(() => {
		const loadIcon = async () => {
			try {
				// Dynamically import the specific icon
				const module = await import("lucide-react");
				const icon = module[name as keyof typeof module] as LucideIcon;

				if (icon) {
					setIcon(() => icon);
				} else {
					console.warn(`Lucide icon "${name}" not found`);
				}
			} catch (error) {
				console.error("Error loading icon:", error);
			}
		};

		loadIcon();
	}, [name]);

	if (!Icon) return fallback;

	return <Icon className={className} {...props} />;
}
