import About from "@/components/About";
import AdSection from "@/components/AdSection";
import ExpediteCheckObservabilityHub from "@/components/ExpediteCheckObservabilityHub";
import FAQ from "@/components/FAQ";
import Hero from "@/components/Hero";
import Insight from "@/components/Insight";
import { Partners } from "@/components/Partners";
import Services from "@/components/Services";
import { Testimonials } from "@/components/Testimonial";

export default function Home() {
	return (
		<>
			{/* Expedite Check / Monitor / Pulse / Noctis Observe — Full-Stack Hybrid Observability & Security Suite */}
			<ExpediteCheckObservabilityHub />

			{/* Hero Section */}
			<Hero />

			{/* Services */}
			<Services />

			{/* Partners */}
			<Partners />

			{/* About Us  */}
			<About />

			{/* <WhyUS /> */}

			{/* Insight */}
			<Insight />

			{/* Testimonials */}
			<Testimonials />

			<AdSection />

			{/* FAQ */}
			<FAQ />
		</>
	);
}
