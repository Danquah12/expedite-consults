import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HomePage from "@/components/home/HomePage";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <HomePage />
      <Footer />
    </div>
  );
}
