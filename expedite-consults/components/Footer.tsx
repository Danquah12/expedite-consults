import { routes } from "@/constant/routes";
import { GetServicesQueryResult } from "@/sanity.types";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { Svgs } from "./Svgs";
import { getLegal } from "@/sanity/lib/others/getLegal";
import getSiteSettings from "@/sanity/lib/others/getSiteSettings";

async function Footer({ services }: { services: GetServicesQueryResult }) {
	const legal = await getLegal();
	const site = await getSiteSettings();
	return (
		<footer className="bg-secondary/80 backdrop-blur-sm">
			<div className="container text-white mx-auto px-4 py-12 lg:py-20 flex flex-col gap-20">
				<div className="w-full flex flex-col lg:flex-row gap-12 lg:justify-between">
					<div className="flex flex-col gap-8 lg:border-r border-r-primary lg:pr-10">
						<Link
							href={routes.home}
							prefetch={false}
							className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
						>
							<Image
								src="/logo.jpg"
								className="w-[50px] h-[45px] lg:w-[60px] lg:h-[55px] flex-shrink-0"
								width={100}
								height={100}
								alt="logo"
							/>
							<span className="text-base lg:text-lg font-semibold text-white">
								Expedite Consults LLC
							</span>
						</Link>

						<p className="w-full md:w-[350px] text-[0.8rem] lg:text-sm">
							Trusted Cybersecurity Solutions | Building Confidence, Enhancing
							Resilience
						</p>

						{/* <div className="flex gap-3">
							<a
								href="https://www.facebook.com/riviaco?mibextid=ZbWKwL"
								target="_blank"
							>
								<Facebook className="w-[20px]" />
							</a>

							<a
								href="https://www.linkedin.com/company/riviacares/"
								target="_blank"
							>
								<Linkedin className="w-[20px]" />
							</a>
						</div> */}
					</div>

					<div className="flex lg:ml-8 flex-1 gap-8 flex-col lg:flex-row justify-end">
						<div className="basis-[25%] space-y-3 md:space-y-5">
							<h2 className="text-base font-semibold text-primary">Services</h2>

							<ul className="space-y-2">
								{services.map((service, index) => {
									return (
										<li key={index}>
											<Link
												className="text-[0.8rem] lg:text-sm"
												href={`${routes.services}/${service.slug?.current}`}
											>
												{service?.name}
											</Link>
										</li>
									);
								})}
							</ul>
						</div>
						<div className="basis-[25%] space-y-3 md:space-y-5">
							<h2 className="text-base font-semibold text-primary">
								Quick Links
							</h2>

							<ul className="space-y-2">
								<li>
									<Link
										className="text-[0.8rem] lg:text-sm"
										href={routes.about.url}
									>
										About Expedite Consults
									</Link>
								</li>
							</ul>
						</div>
						<div className="basis-[25%] space-y-3 md:space-y-5">
							<h2 className="text-base font-semibold text-primary">Contact</h2>

							<ul className="space-y-2">
								<li className="text-[0.8rem] lg:text-sm">
									<Link href={`tel:${site?.phone}`}>{site?.phone}</Link>
								</li>
								<li className="text-[0.8rem] lg:text-sm">
									<Link href={`mailto:${site?.email}`}>{site?.email}</Link>
								</li>
								<li className="text-[0.8rem] lg:text-sm flex items-center pt-2 gap-2">
									{site?.whatsapp && (
										<Link
											target="_blank"
											href={`https://wa.me/${site?.whatsapp}`}
											className="p-2 self-start rounded-full bg-green-500"
										>
											<Svgs.whatsapp className="size-4 fill-white" />
										</Link>
									)}

									{site?.socialLinks?.map((item, i) => {
										if (item.platform === "Linkedin") {
											return (
												<Link
													key={i}
													target="_blank"
													href={item.url ?? ""}
													className="p-2 self-start rounded-full bg-blue-400"
												>
													<Svgs.linkedin className="size-4 fill-white" />
												</Link>
											);
										}

										if (item.platform === "Twitter") {
											return (
												<Link
													key={i}
													target="_blank"
													href={item.url ?? ""}
													className="p-2 self-start rounded-full bg-black"
												>
													<Svgs.twitter className="size-4 fill-white" />
												</Link>
											);
										}
									})}
									{/* <Link
										target="_blank"
										href="https://www.linkedin.com/company/expedite-consults-llc/posts/?feedView=articles&viewAsMember=true"
										className="p-2 self-start rounded-full bg-blue-400"
									>
										<Svgs.linkedin className="size-4 fill-white" />
									</Link> */}
									{/* <Link
										target="_blank"
										href="#"
										className="p-2 self-start rounded-full bg-black"
									>
										<Svgs.twitter className="size-4 fill-white" />
									</Link> */}
								</li>
							</ul>
						</div>
						<div className="basis-[25%] space-y-3 md:space-y-5">
							<h2 className="text-base font-semibold text-primary">Legal</h2>

							<ul className="space-y-2">
								{legal.map((item, i) => (
									<li key={i}>
										<Link
											className="text-[0.8rem] lg:text-sm"
											href={`${routes.legal}/${item.slug?.current}`}
										>
											{item.title}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>

				<p className="text-[0.7rem] text-gray-100">
					&copy; {new Date().getFullYear()} Expedite Consults LLC. All rights
					reserved.
				</p>
			</div>
		</footer>
	);
}

export default Footer;
