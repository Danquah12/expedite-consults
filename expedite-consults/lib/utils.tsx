import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getSectionLabel = (key: string) => {
	switch (key) {
		case "about":
			return "About Us";
		case "insight":
			return "Insight";
		default:
			return key;
	}
};

export function highlightLastWord(text: string) {
	const words = text.trim().split(" ");
	if (words.length === 0) return null;

	const lastWord = words.pop();
	const firstPart = words.join(" ");

	return (
		<span>
			{firstPart && <span>{firstPart} </span>}
			<span className="text-primary">{lastWord}</span>
		</span>
	);
}
