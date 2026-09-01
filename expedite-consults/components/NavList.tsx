"use client";

import { servicesData } from "@/constant";
import { useScrollHeader } from "@/hooks/useScrollHeader";
import { cn, getSectionLabel } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Dot, LayoutGrid, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import * as LucideIcons from "lucide-react";
import { ComponentType, SVGProps } from "react";
import { HoveredLink, Menu, MenuItem } from "./ui/navbar-menu";
import { routes, subroutes } from "@/constant/routes";
import { GetServicesQueryResult } from "@/sanity.types";
import { DynamicIcon } from "./DynamicIcon";

// import { HoveredLink, Menu, MenuItem, ProductItem } from "./ui/navbar-menu";
const NavList = ({ services }: { services: GetServicesQueryResult }) => {
	const [active, setActive] = useState<string | null>(null);
	const [activeIndex, setActiveIndex] = useState(0);
	const isScrolled = useScrollHeader(50);

	return (
		<div className="flex flex-col">
			<div
				className={cn("ml-auto transition-all duration-300 ease-in-out", {
					hidden: isScrolled,
				})}
			>
				<div className="flex items-center gap-2.5 ml-auto mt-8">
					<Link
						href={routes.launchpad.url}
						className={cn(
							"hidden lg:flex items-center gap-2 text-white font-bold text-sm bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-4 py-1.5 border border-cyan-400/50 rounded-full hover:from-cyan-500 hover:to-indigo-500 transition-all duration-300 shadow-[0_0_18px_rgba(6,182,212,0.4)] hover:shadow-[0_0_24px_rgba(6,182,212,0.6)]"
						)}
					>
						<span className="text-xs">🚀</span>
						Ecosystem Launchpad
					</Link>
					<Link
						href={routes.connectin.url}
						className={cn(
							"hidden lg:flex items-center gap-1.5 text-white font-medium text-sm bg-slate-900/90 px-3.5 py-1.5 border border-slate-700 rounded-full hover:bg-slate-800 hover:border-cyan-500/50 transition-all duration-300"
						)}
					>
						<span className="text-xs">💼</span>
						ConnectIn OS
					</Link>
					<Link
						href={routes.campus.url}
						className={cn(
							"hidden lg:flex items-center gap-1.5 text-white font-medium text-sm bg-indigo-950/80 px-3.5 py-1.5 border border-indigo-500/40 rounded-full hover:bg-indigo-900 transition-all duration-300"
						)}
					>
						<span className="text-xs">🎓</span>
						Campus
					</Link>
					<Link
						href={routes.incidentResponse}
						className={cn(
							"hidden xl:flex items-center gap-2 text-white text-sm bg-primary/10 px-3.5 py-1.5 border border-primary/10 rounded-full hover:bg-primary/20 transition-all duration-300"
						)}
					>
						<TriangleAlert className="size-4 shrink-0" />
						24/7 SOC
					</Link>
					<Link
						href={routes.assessment}
						className={cn(
							"hidden lg:flex items-center gap-2 text-white font-medium text-sm bg-blue-600/80 px-4 py-1.5 border border-blue-500/50 rounded-full hover:bg-blue-500 transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]"
						)}
					>
						Free Assessment
					</Link>
				</div>
			</div>

			<Menu setActive={setActive}>
				<MenuItem
					setActive={setActive}
					active={active}
					item="Services"
					position="right"
				>
					<motion.div
						key={activeIndex}
						layout // 👈 This enables smooth height transitions
						transition={{ duration: 0.1 }}
						className="text-sm grid grid-cols-3 max-w-[850px] w-full gap-6"
					>
						{/* Left Side: Buttons */}
						<div className="col-span-1">
							<h2 className="font-semibold mb-3 text-sm text-primary">
								What We Offer
							</h2>
							<div className="flex flex-col gap-10 h-auto">
								<div className="flex flex-col gap-2">
									{services.map((service, index) => {
										return (
											<Link
												href={`${routes.services}/${service.slug?.current}`}
												key={index}
												onMouseEnter={() => setActiveIndex(index)}
												className={`w-full font-semibold px-4 py-3 text-sm flex items-center justify-between gap-3 transition-colors ${activeIndex === index ? "bg-accent" : ""
													}`}
											>
												<div className="flex items-center gap-2">
													{/* <serviceData.icon className="size-4 text-primary" /> */}

													<DynamicIcon
														name={service.icon as keyof typeof LucideIcons}
														className="size-4"
														style={{
															color: service.color?.hex
																? service.color.hex
																: "#4fc0d4",
														}}
													/>
													<span className="text-sm">{service.name}</span>
												</div>
												{/* <span>{service.title}</span> */}

												{activeIndex === index ? (
													<ChevronRight className="size-4" />
												) : null}
											</Link>
										);
									})}
								</div>

								<hr />

								<Link
									href={routes.services}
									className="w-full mt-auto font-semibold px-4 py-3 text-sm flex items-center justify-between gap-3 transition-colors hover:bg-accent"
								>
									<div className="flex items-center gap-2">
										<LayoutGrid className="size-4 text-primary" />
										<span className="text-sm">View All Services</span>
									</div>
									{/* <span>{service.title}</span> */}

									{/* <ChevronRight className="size-4" /> */}
								</Link>
							</div>
						</div>

						{/* Right Side: Animated Content */}
						<div className="col-span-2">
							<AnimatePresence mode="wait">
								<motion.div
									key={activeIndex}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.3 }}
									className="w-full flex flex-col gap-3"
								>
									<div className="relative overflow-hidden min-w-[540px] w-full bg-gradient-to-br from-primary/5 to-primary/15 p-3 text-sm">
										<span
											aria-hidden="true"
											className="absolute w-[50px] h-[170%] right-3 -top-5 bg-primary/20 rotate-[25deg] -z-10"
										></span>
										<Link
											href={`${routes.services}/${services[activeIndex].slug?.current}`}
											className="flex items-center gap-2 justify-between font-semibold text-base mb-2 text-primary group"
										>
											<span className="group-hover:underline">
												{services[activeIndex].name}
											</span>
											<ChevronRight className="size-4" />
										</Link>
										<p className="line-clamp-3 text-sm text-gray-600">
											{services[activeIndex].description}
										</p>
									</div>

									<div className="flex flex-col gap-3 mt-2">
										<div className="flex items-center text-sm font-medium text-primary/70 after:flex-1 after:border-t after:border-gray-200 after:ms-3">
											Services
										</div>
										<div className="w-full flex flex-col flex-wrap max-h-[300px] h-full gap-5 mt-2 pb-3 p-3 bg-gray-50">
											{/* {servicesData[activeIndex].links.map((link, idx) => (
												<Link
													key={idx}
													href={link.href}
													className="font-medium hover:text-primary flex items-center gap-1 text-sm text-gray-600 transition-colors"
												>
													<Dot />
													{link.title}
												</Link>
											))} */}
											{services?.[activeIndex].cyberSecurityServices?.map(
												(item, idx) => (
													<Link
														key={idx}
														href={`${routes.services}/${services[activeIndex].slug?.current}/${item.slug?.current}`}
														className="font-medium hover:text-primary flex items-center gap-1 text-sm text-gray-600 transition-colors"
													>
														<Dot />
														{item.title}
													</Link>
												)
											)}
											{services?.[activeIndex].cyberSecurityFrameworks?.map(
												(item, idx) => (
													<Link
														key={idx}
														href={`${routes.services}/${services[activeIndex].slug?.current}/${item.slug?.current}`}
														className="font-medium hover:text-primary flex items-center gap-1 text-sm text-gray-600 transition-colors"
													>
														<Dot />
														{item.title}
													</Link>
												)
											)}
										</div>
									</div>
								</motion.div>
							</AnimatePresence>
						</div>
					</motion.div>
				</MenuItem>

				{Object.entries(subroutes).map(([key, value]) => (
					<MenuItem
						key={key}
						setActive={setActive}
						active={active}
						item={getSectionLabel(key)}
					>
						<div className="flex flex-col space-y-4 text-sm min-w-[100px]">
							{value.map((link, idx) => (
								<HoveredLink key={idx} href={link.url}>
									{link.title}
								</HoveredLink>
							))}
						</div>
					</MenuItem>
				))}

				{/* <Link
					href={"/about-us"}
					className={cn(
						"cursor-pointer hover:opacity-[0.9] text-white flex items-center gap-1.5 text-sm"
					)}
				>
					About Us
				</Link> */}
				<Link
					href={routes.contact.url}
					className="group/button relative ml-10 inline-flex items-center pr-11 [clip-path:polygon(0_0,100%_0,80%_100%,0%_100%)] justify-center overflow-hidden bg-gradient-to-tr from-primary to-primary/50 backdrop-blur-lg px-6 py-2 font-semibold text-white transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl hover:shadow-primary/30"
				>
					<span className="text-sm">{routes.contact.title}</span>
					<div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
						<div className="relative h-full w-10 bg-white/30"></div>
					</div>
				</Link>
			</Menu>
		</div>
	);
};

export default NavList;
