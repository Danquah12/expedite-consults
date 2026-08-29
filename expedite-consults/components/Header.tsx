"use client";

import { routes } from "@/constant/routes";
import { useScrollHeader } from "@/hooks/useScrollHeader";
import { cn } from "@/lib/utils";
import { Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import MobileNav from "./MobileNav";
import NavList from "./NavList";
import { GetServicesQueryResult } from "@/sanity.types";

export default function Header({
	services,
}: {
	services: GetServicesQueryResult;
}) {
	const isScrolled = useScrollHeader(50);

	return (
		<header
			className={cn(
				"fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b border-white/5",
				{
					"bg-secondary/40 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)]":
						isScrolled,
					"bg-transparent": !isScrolled,
				}
			)}
		>
			<div className="container mx-auto px-4">
				<div
					className={cn(
						"flex h-[120px] items-center justify-between gap-4 transition-all duration-300 ease-in-out",
						{
							"h-[80px]": isScrolled,
						}
					)}
				>
					<div className="flex items-center gap-4">
						<Link
							href={routes.home}
							prefetch={false}
							className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
						>
							<Image
								src="/logo.jpg"
								width={100}
								height={100}
								alt="logo"
								className="w-[50px] h-[45px] lg:w-[60px] lg:h-[55px] flex-shrink-0e"
							/>
							<span className="text-base lg:text-lg text-white font-semibold">
								Expedite Consults LLC
							</span>
						</Link>
					</div>

					<div className="flex items-center">
						<NavList services={services} />
					</div>
					<div className="lg:hidden flex items-center gap-4">
						<Link href="tel:+1-855-443-9733">
							<Phone
								className="size-7 text-primary fill-primary"
								strokeWidth={0.5}
							/>
						</Link>
						<MobileNav services={services} />
					</div>
				</div>
			</div>
		</header>
	);
}
