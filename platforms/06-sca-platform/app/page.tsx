import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import StatsOverview from "@/components/home/StatsOverview";
import FindingsTable from "@/components/home/FindingsTable";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <StatsOverview />
        <FindingsTable />
      </main>
      <Footer />
    </div>
  );
}
