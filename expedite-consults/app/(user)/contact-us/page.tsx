import ContactForm from "@/components/ContactForm";
import MotionInView from "@/components/MotionInView";
import { Svgs } from "@/components/Svgs";
import getSiteSettings from "@/sanity/lib/others/getSiteSettings";
import { MapPin } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Contact Us | Expedite Consults LLC",
	description:
		"Have questions or need cybersecurity support? Reach out to Expedite Consults LLC — our team is ready to help you secure your digital assets and respond to threats quickly",
};

const page = async () => {
	const site = await getSiteSettings();
	return (
		<>
			<div className="relative w-full z-[1] h-[300px] lg:h-[400px] bg-[url(/img4.jpeg)] bg-no-repeat bg-cover bg-center bg-blend-overlay flex flex-col gap-4 items-center justify-center">
				<span className="absolute -z-[1] inset-0 bg-gradient-to-r from-secondary via-secondary to-transparent"></span>
				<div className="container flex items-end gap-5 w-full h-full px-4 pb-8 md:pb-16">
					<MotionInView
						scale={0.8}
						delay={0.3}
						className="max-w-[680px] text-white flex flex-col gap-4"
					>
						<h2 className="text-2xl lg:text-4xl font-medium">Contact Us</h2>
						<div className="text-sm lg:text-base max-w-[550px]  font-normal">
							We're here to help. Reach out to our team for expert support and
							guidance on your cybersecurity needs.
						</div>
					</MotionInView>
				</div>
			</div>

			<div className="container px-4 w-full h-full mx-auto flex flex-col flex-1 gap-5 my-12 lg:my-20">
				<MotionInView
					scale={0.8}
					delay={0.3}
					tag="h2"
					className="self-start font-semibold text-lg lg:text-2xl"
				>
					Location
				</MotionInView>
				<MotionInView
					direction="up"
					delay={0.3}
					className="relative w-full min-h-[200px] md:min-h-[300px] lg:min-h-[400px] overflow-hidden "
				>
					<iframe
						src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3095.783719127491!2d-76.80277092354018!3d39.11139393404839!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b7e70cf50d71b9%3A0xdbd65635979b8795!2s3%20Oak%20Run%20Rd%2C%20Laurel%2C%20MD%2020724%2C%20USA!5e0!3m2!1sen!2sgh!4v1746884600808!5m2!1sen!2sgh"
						loading="lazy"
						referrerPolicy="no-referrer-when-downgrade"
						className="w-full h-[280px] lg:h-[400px]"
					></iframe>
				</MotionInView>

				<MotionInView scale={0.8} delay={0.3} className="self-start">
					<Link
						target="_blank"
						href={site?.officeMap ?? ""}
						className="relative inline-flex gap-3 items-center mt-5 mr-auto overflow-hidden py-2 font-semibold bg-primary/10 hover:bg-primary/20 px-4"
					>
						<MapPin className="size-5 text-primary shrink-0" />
						<span className="text-sm lg:text-base">{site?.address ?? ""}</span>
					</Link>
				</MotionInView>
			</div>
			<div className="w-full bg-secondary/90 relative overflow-hidden py-8 lg:py-16">
				<span className="absolute rotate-45 top-1/2 -translate-y-1/2 -right-24 lg:right-[20%] w-[200px] h-[300%] bg-gradient-to-b from-primary/80 via-primary/50 to-primary/20"></span>
				<div className="container relative w-full h-full px-4 py-8 lg:py-18 mx-auto flex flex-col gap-4 items-center justify-center">
					<MotionInView
						direction="up"
						delay={0.4}
						className="flex flex-col w-full min-h-[200px] gap-8"
					>
						<div className="flex flex-col lg:flex-row gap-24 lg:gap-5">
							<div className="flex mt-6 flex-col gap-4 lg:gap-8 w-full">
								<h2 className="text-lg lg:text-xl font-semibold text-white">
									Contact Information
								</h2>

								<div className="flex w-full flex-col flex-wrap lg:flex-row gap-5 lg:gap-0">
									<div className="flex flex-col gap-3 w-full lg:w-auto">
										<small className="text-sm text-white">Whatsapp Us</small>
										<Link
											target="_blank"
											href={`https://wa.me/${site?.whatsapp ?? ""}`}
											className="group/button relative inline-flex items-center lg:pr-20 lg:[clip-path:polygon(0_0,100%_0,84%_100%,0%_100%)] justify-center overflow-hidden bg-gradient-to-tr from-green-500 to-green-500/50 backdrop-blur-lg px-6 py-2 font-semibold text-white transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl hover:shadow-primary/30"
										>
											<Svgs.whatsapp className="size-5 mr-3" />
											<span className="text-base lg:text-xl">Whatsapp Us</span>
											<div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
												<div className="relative h-full w-10 bg-white/30"></div>
											</div>
										</Link>
									</div>

									<div className="flex flex-col gap-3 w-full lg:w-auto">
										<small className="text-sm text-white lg:ml-auto">
											Call us
										</small>
										<Link
											href={`tel:${site?.phone}`}
											className="group/button relative inline-flex items-center lg:pr-20 lg:pl-20 lg:[clip-path:polygon(13%_0,100%_0,100%_100%,0%_100%)] justify-center overflow-hidden bg-gradient-to-tr from-primary to-primary/50 backdrop-blur-lg px-6 py-2 font-semibold text-white transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl hover:shadow-primary/30"
										>
											<span className="text-base lg:text-xl">
												{site?.phone ?? ""}
											</span>
											<div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
												<div className="relative h-full w-10 bg-white/30"></div>
											</div>
										</Link>
									</div>
								</div>
							</div>
							<div className="w-full">
								<div className="mb-12 mx-auto">
									<h2 className="text-2xl lg:text-4xl font-semibold text-primary mb-1">
										Get in Touch with Us
									</h2>
									<small className="text-sm text-white">
										Please complete the form, and our team will be in touch to
										discuss your requirements in more detail.
									</small>
								</div>
								<ContactForm />
							</div>
						</div>
					</MotionInView>
				</div>
			</div>
		</>
	);
};

export default page;
