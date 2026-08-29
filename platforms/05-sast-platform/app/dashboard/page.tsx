"use client";

import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DashboardContent from "@/components/dashboard/DashboardContent";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-24">
        <Suspense fallback={
          <div className="max-w-7xl mx-auto px-4 py-24 text-center" style={{ color: "var(--muted)" }}>
            Loading dashboard...
          </div>
        }>
          <DashboardContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
