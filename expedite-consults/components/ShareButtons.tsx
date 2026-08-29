"use client";
import { Copy, Facebook, Linkedin } from "lucide-react";

import { Svgs } from "./Svgs";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";
import { toast } from "sonner";
import { Button } from "./ui/button";

const ShareButtons = ({ url, title }: { url: string; title: string }) => {
	const shareUrl = encodeURIComponent(url);
	const shareTitle = encodeURIComponent(title);

	const handleCopy = () => {
		navigator.clipboard.writeText(url);
		toast("Copied to clipboard", {
			description: "You can now share this link with anyone.",
		});
	};

	return (
		<div className="flex gap-2 items-center">
			<a
				href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
				target="_blank"
				rel="noopener noreferrer"
				className="p-2 rounded-full bg-blue-500 hover:scale-[0.95] transition-transform duration-200"
			>
				<Facebook
					strokeWidth={1.2}
					className="hover:text-blue-600 stroke-none fill-white size-5.5 cursor-pointer"
				/>
			</a>
			<a
				href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
				target="_blank"
				rel="noopener noreferrer"
				className="p-2 rounded-full bg-black hover:scale-[0.95] transition-transform duration-200"
			>
				<Svgs.twitter className="hover:text-sky-500 stroke-black size-5.5 cursor-pointer" />
			</a>
			<a
				href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}`}
				target="_blank"
				rel="noopener noreferrer"
				className="p-2 rounded-full bg-blue-500 hover:scale-[0.95] transition-transform duration-200"
			>
				<Linkedin
					strokeWidth={1.2}
					className="hover:text-blue-700 stroke-none fill-white size-5.5 cursor-pointer"
				/>
			</a>

			<span className="w-[1px] h-6 bg-gray-300 mx-2" />

			<TooltipProvider delayDuration={0}>
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							onClick={handleCopy}
							className="p-2.5 rounded-full bg-gray-200 hover:scale-[0.95] transition-transform duration-200"
						>
							<Copy strokeWidth={1.5} className="size-4.5 cursor-pointer" />
						</button>
					</TooltipTrigger>
					<TooltipContent
						side="right"
						className="px-2 py-1 text-xs rounded-none"
					>
						Copy Link
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
};

export default ShareButtons;
