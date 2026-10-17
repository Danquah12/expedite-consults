"use client";

import { Suspense } from "react";
import DashboardContent from "@/components/dashboard/DashboardContent";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main
        className="flex-1"
        style={{
          paddingTop: 96,
          paddingBottom: 96,
        }}
      >
        <Suspense
          fallback={
            <div
              style={{
                maxWidth: 1360,
                margin: "0 auto",
                padding: "96px 24px",
                textAlign: "center",
                color: "var(--muted)",
              }}
            >
              Loading security dashboard...
            </div>
          }
        >
          <DashboardContent />
        </Suspense>
      </main>
    </div>
  );
}
