"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { routes, subroutes } from "@/constant/routes";
import { cn, getSectionLabel } from "@/lib/utils";
import { GetServicesQueryResult } from "@/sanity.types";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { motion } from "framer-motion";
import {
	AlignLeft,
	ArrowUpFromDot,
	ChevronLeft,
	Dot,
	LucideIcon,
	X,
	TriangleAlert,
	ShieldAlert
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { DynamicIcon } from "./DynamicIcon";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "./ui/accordion";

export default function MobileNav({
	services,
}: {
	services: GetServicesQueryResult;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [submenu, setSubmenu] = useState<null | {
		title: string | undefined;
		links: { title: string; href: string; parent: string }[];
		links2: { title: string; href: string; parent: string }[];
		icon: string | LucideIcon | undefined;
		color: string | undefined;
	}>(null);

	const handleBack = () => setSubmenu(null);

	const transition = {
		type: "tween",
		ease: [0.33, 1, 0.68, 1], // standard ease-out
		duration: 0.4,
	};

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					className="rounded-none bg-secondary/50 backdrop-blur-md border-primary"
				>
					<AlignLeft className="h-5 w-5 text-primary" />
					<span className="sr-only">Toggle navigation menu</span>
				</Button>
			</SheetTrigger>

			<SheetContent
				side="left"
				className="w-full sm:max-w-[400px] max-w-full overflow-hidden bg-secondary/90 backdrop-blur-md border-r border-primary"
			>
				<SheetClose className="ml-auto border p-1.5 absolute z-10 rounded-none bg-secondary/50 backdrop-blur-md border-primary right-3 top-3">
					<X className="h-5 w-5 !block text-primary" />
				</SheetClose>

				<VisuallyHidden>
					<SheetHeader>
						<SheetTitle>Edit profile</SheetTitle>
						<SheetDescription>
							Make changes to your profile here. Click save when you're done.
						</SheetDescription>
					</SheetHeader>
				</VisuallyHidden>

				{/* Smooth animated container */}
				<div className="relative w-full h-full overflow-y-auto overflow-x-hidden text-white">
					{/* Main Panel */}
					<motion.div
						initial={false}
						animate={{ x: submenu ? "-100%" : "0%", opacity: submenu ? 0 : 1 }}
						transition={transition}
						className="absolute top-0 left-0 w-full px-5 h-full flex flex-col"
					>
						<h2 className="text-lg font-semibold pt-5 pb-8">Menu</h2>

						<div className="flex flex-col gap-3 mb-4">
							<h2 className="text-sm font-semibold text-primary">
								What We Offer
							</h2>
							<div className="flex flex-col gap-3">
								{services.map((service) => (
									<Button
										key={service?.name}
										variant="ghost"
										onClick={() =>
											setSubmenu({
												title: service?.name ?? "",
												links:
													service?.cyberSecurityServices?.map((item) => ({
														title: item.title ?? "", // provide a default value if title is null
														href: `${routes.services}/${service.slug?.current}/${item.slug?.current}`,
														parent: `${routes.services}/${service.slug?.current}`,
													})) ?? [],
												links2:
													service?.cyberSecurityFrameworks?.map((item) => ({
														title: item.title ?? "", // provide a default value if title is null
														href: `${routes.services}/${service.slug?.current}/${item.slug?.current}`,
														parent: `${routes.services}/${service.slug?.current}`,
													})) ?? [],
												icon: service?.icon ?? "",
												color: service?.color?.hex ?? "",
											})
										}
										className="justify-between w-full rounded-none hover:bg-primary/10 hover:text-white"
									>
										<div className="flex text-sm items-center gap-3">
											<DynamicIcon
												strokeWidth={1.2}
												name={service.icon as keyof typeof LucideIcons}
												className="size-4"
												style={{
													color: service.color?.hex
														? service.color.hex
														: "#4fc0d4",
												}}
											/>
											<span>{service?.name}</span>
										</div>
										<ChevronLeft className="rotate-180 w-4 h-4" />
									</Button>
								))}

								<hr className="border-primary/20" />

								<Link
									href={routes.services}
									onClick={() => setIsOpen(false)}
									className="w-full mt-auto font-semibold px-4 py-3 text-sm flex items-center justify-between gap-3 transition-colors hover:bg-primary/10 hover:text-white"
								>
									<div className="flex text-sm items-center gap-3">
										<LucideIcons.LayoutGrid className="size-4 text-primary" />
										<span>View All Services</span>
									</div>
									<ChevronLeft className="rotate-180 w-4 h-4" />
								</Link>
							</div>
						</div>
						<Accordion
							type="single"
							collapsible
							className="w-full mt-4 space-y-4 pb-6"
						>
							{Object.entries(subroutes).map(([key, value]) => (
								<AccordionItem key={key} value={key} className="border-b-0">
									<AccordionTrigger
										className={cn(
											"focus:no-underline hover:no-underline !flex !items-center hover:!bg-primary/10 hover:!text-white !justify-between !rounded-none bg-primary/10 text-sm !font-medium text-primary",
											buttonVariants({ variant: "ghost" })
										)}
									>
										{getSectionLabel(key)}
									</AccordionTrigger>
									<AccordionContent className="flex flex-col gap-2 pb-0 pt-3 border-l border-l-primary/10 rounded-bl-md">
										{/* const isActive = pathname.startsWith(sub.href); */}

										{value.map((item, i) => {
											return (
												<Link
													key={i}
													onClick={() => setIsOpen(false)}
													href={item.url}
													className={cn(
														"w-full flex !rounded-none !pl-4 hover:!bg-secondary/10 hover:!text-white",
														buttonVariants({
															variant: "ghost",
															// variant: `${isActive ? "secondary" : "ghost"}`,
														})
													)}
												>
													<p className="mr-auto font-medium text-sm flex items-center gap-3">
														<ArrowUpFromDot className="rotate-90 size-3.5 text-primary" />
														{item.title}
													</p>
												</Link>
											);
										})}
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>

						{/* Quick Links */}
						<div className="flex flex-col gap-2 mb-6">
							<Link
								href={routes.launchpad.url}
								onClick={() => setIsOpen(false)}
								className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-cyan-300 font-bold rounded-md border border-cyan-500/50 hover:from-cyan-600/40 hover:to-blue-600/40 transition-colors text-sm shadow-[0_0_15px_rgba(6,182,212,0.2)]"
							>
								<span className="text-base">🚀</span>
								Digital Ecosystem Launchpad
							</Link>
							<Link
								href={routes.connectin.url}
								onClick={() => setIsOpen(false)}
								className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900 text-slate-200 font-medium rounded-md border border-slate-700 hover:bg-slate-800 transition-colors text-sm"
							>
								<span className="text-base">💼</span>
								ConnectIn Professional OS
							</Link>
							<Link
								href={routes.campus.url}
								onClick={() => setIsOpen(false)}
								className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-950/40 text-indigo-300 font-medium rounded-md border border-indigo-500/30 hover:bg-indigo-900/40 transition-colors text-sm"
							>
								<span className="text-base">🎓</span>
								Digital Campus Platform
							</Link>
							<Link
								href={routes.incidentResponse}
								onClick={() => setIsOpen(false)}
								className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 text-red-400 font-medium rounded-md border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm"
							>
								<TriangleAlert className="size-4" />
								24/7 Incident Response
							</Link>
							<Link
								href={routes.assessment}
								onClick={() => setIsOpen(false)}
								className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/20 text-blue-400 font-medium rounded-md border border-blue-500/30 hover:bg-blue-600/30 transition-colors text-sm"
							>
								<LucideIcons.ShieldAlert className="size-4" />
								Free Compliance Assessment
							</Link>
						</div>

						{/* contact us */}
						<div className="w-full pb-10">
							<Link
								href={routes.contact.url}
								onClick={() => setIsOpen(false)}
								className="w-full font-semibold px-4 py-3 text-sm flex items-center justify-between gap-3 bg-primary transition-colors hover:bg-primary/10 hover:text-white"
							>
								{routes.contact.title}
							</Link>
						</div>
					</motion.div>

					{/* Submenu Panel */}
					<motion.div
						drag="x"
						dragConstraints={{ left: 0, right: 0 }}
						onDragEnd={(event, info) => {
							if (info.offset.x > 100) handleBack(); // swipe right to go back
						}}
						initial={false}
						animate={{ x: submenu ? "0%" : "100%", opacity: submenu ? 1 : 0 }}
						transition={transition}
						className="absolute top-0 left-0 px-5 w-full h-full flex flex-col"
					>
						<div className="flex items-center gap-2 pt-5 pb-8">
							<Button
								className="!p-1.5 !py-2.5 bg-transparent rounded-none hover:bg-transparent hover:text-white !px-0"
								variant="ghost"
								size="sm"
								onClick={handleBack}
							>
								<ChevronLeft className="size-5" />
								<span className="text-sm">Back</span>
							</Button>
						</div>

						<Link
							href={submenu?.links[0]?.parent ?? ""}
							onClick={() => setIsOpen(false)}
							className="flex text-sm items-center gap-2 mb-4"
						>
							{submenu?.icon && (
								<DynamicIcon
									strokeWidth={1.2}
									name={submenu.icon as keyof typeof LucideIcons}
									className="size-4"
									style={{
										color: submenu.color ? submenu.color : "#4fc0d4",
									}}
								/>
							)}
							<h2 className="text-base text-primary font-semibold ">
								{submenu?.title}
							</h2>
						</Link>

						<div className="flex items-center text-sm font-medium text-primary/70 after:flex-1 mb-4 after:border-t after:border-gray-200 after:ms-3">
							Services
						</div>
						<div className="flex flex-col gap-1.5 bg-primary/20 py-4">
							{submenu?.links?.map((link) => (
								<Link
									key={link.title}
									href={link.href}
									onClick={() => setIsOpen(false)}
								>
									<Button
										variant="ghost"
										className="w-full px-1.5 rounded-none hover:bg-secondary/10 hover:text-white justify-start text-left"
									>
										<div className="flex text-sm items-center gap-2">
											<Dot className="size-6 text-primary" />
											<span>{link.title}</span>
										</div>
									</Button>
								</Link>
							))}
							{submenu?.links2?.map((link) => (
								<Link
									key={link.title}
									href={link.href}
									onClick={() => setIsOpen(false)}
								>
									<Button
										variant="ghost"
										className="w-full px-1.5 rounded-none hover:bg-secondary/10 hover:text-white justify-start text-left"
									>
										<div className="flex text-sm items-center gap-2">
											<Dot className="size-6 text-primary" />
											<span>{link.title}</span>
										</div>
									</Button>
								</Link>
							))}
						</div>
					</motion.div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
