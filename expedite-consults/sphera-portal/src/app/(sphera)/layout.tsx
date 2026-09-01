"use client";

import { SidebarNav } from "@/components/layout/SidebarNav";
import { RightWidgetSidebar } from "@/components/layout/RightWidgetSidebar";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { LiveStageDock } from "@/components/ui/LiveStageDock";

const mockUser = {
  name: "Kwesi Asiedu",
  username: "kwesi",
};

export default function SpheraLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--bg-core)",
        color: "var(--text-pure)",
        transition: "background-color 0.25s ease, color 0.25s ease",
      }}
    >
      {/* 250px Fixed Left Navigation Sidebar */}
      <SidebarNav user={mockUser} />

      {/* Main Fluid 3-Column Viewport — Starts strictly after Left Sidebar (250px) */}
      <div
        style={{
          marginLeft: "250px",
          width: "calc(100% - 250px)",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          gap: "36px",
          padding: "36px 36px 60px 36px",
          boxSizing: "border-box",
        }}
      >
        {/* Center Main Content Canvas */}
        <main style={{ flex: 1, minWidth: 0, maxWidth: "1020px" }}>
          {children}
        </main>

        {/* Right Intelligence & Live Widget Sidebar (320px) */}
        <RightWidgetSidebar />
      </div>

      {/* ⌘K Universal Spotlight Command Palette Modal */}
      <CommandPalette />

      {/* 🎙️ Global Live Stage / Study Lounge Floating Dock */}
      <LiveStageDock />
    </div>
  );
}
