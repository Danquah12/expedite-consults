import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import EngineBar from "@/components/home/EngineBar";
import HowItWorks from "@/components/home/HowItWorks";
import FalsePositiveSection from "@/components/home/FalsePositiveSection";
import ComplianceMap from "@/components/home/ComplianceMap";
import CTASection from "@/components/home/CTASection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SAST Platform — Static Application Security Testing",
  description:
    "Multi-engine static analysis with CodeQL, Semgrep, Joern, and AI-driven false positive reduction. Find real vulnerabilities before attackers do.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <EngineBar />
        <HowItWorks />
        <FalsePositiveSection />
        <ComplianceMap />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
