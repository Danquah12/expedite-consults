import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import SecretsPreview from "@/components/home/SecretsPreview";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <SecretsPreview />
      </main>
      <Footer />
    </div>
  );
}
