"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  BookOpen,
  Bell,
  Mail,
  Shield,
  GraduationCap,
  Radio,
  User,
  MoreHorizontal,
  Feather,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface XLeftNavProps {
  activeTab: string;
  onSelectTab: (tab: "FYP" | "FOLLOWING" | "GOSPEL" | "CAMPUS") => void;
  onOpenCompose?: () => void;
  currentUser?: {
    name: string;
    username: string;
    avatarUrl: string;
  };
}

export function XLeftNav({
  activeTab,
  onSelectTab,
  onOpenCompose,
  currentUser = {
    name: "Kwesi Asiedu",
    username: "kwesi",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  },
}: XLeftNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      href: "/feed",
      onClick: () => onSelectTab("FYP"),
      isActive: activeTab !== "GOSPEL" && pathname === "/feed",
    },
    {
      id: "gospel",
      label: "Gospel Menu",
      icon: BookOpen,
      href: "/feed",
      onClick: () => onSelectTab("GOSPEL"),
      isActive: activeTab === "GOSPEL",
      isSpecial: true,
      badge: "NEW",
    },
    {
      id: "explore",
      label: "Explore",
      icon: Search,
      href: "/search",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      href: "/notifications",
    },
    {
      id: "messages",
      label: "Messages",
      icon: Mail,
      href: "/messages",
    },
    {
      id: "veritaslens",
      label: "Grok & VeritasLens",
      icon: Shield,
      href: "/veritaslens",
    },
    {
      id: "campus",
      label: "Campus OS",
      icon: GraduationCap,
      href: "/campus",
    },
    {
      id: "spaces",
      label: "Spaces & Audio",
      icon: Radio,
      href: "/spaces",
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      href: "/profile",
    },
  ];

  return (
    <nav className="flex flex-col justify-between h-full p-2 sm:p-4 text-white">
      {/* Top Section */}
      <div className="space-y-1 sm:space-y-2">
        {/* Twitter / X & SpheraNet Logo */}
        <Link
          href="/feed"
          className="w-12 h-12 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors mb-2 group"
          title="SpheraNet"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-white to-sky-400 p-0.5 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
              <span className="font-black text-lg text-white font-mono">𝕏</span>
            </div>
          </div>
        </Link>

        {/* Navigation Items */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = item.isActive;
            const isSpecial = item.isSpecial;

            const content = (
              <div
                className={`flex items-center gap-4 px-3.5 py-3 rounded-full transition-all duration-200 group ${
                  isSelected
                    ? isSpecial
                      ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                      : "bg-white/15 text-white font-bold"
                    : isSpecial
                    ? "text-amber-400 hover:bg-amber-500/10 font-bold"
                    : "text-neutral-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 group-hover:scale-110 transition-transform ${isSpecial ? "text-amber-400" : ""}`} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-black">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="hidden xl:inline text-base tracking-wide">
                  {item.label}
                </span>
              </div>
            );

            if (item.onClick) {
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className="w-full text-left"
                >
                  {content}
                </button>
              );
            }

            return (
              <Link key={item.id} href={item.href} className="block">
                {content}
              </Link>
            );
          })}
        </div>

        {/* Prominent Post Button */}
        <div className="pt-4">
          <button
            onClick={onOpenCompose}
            className="w-full h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-base shadow-lg shadow-amber-500/25 transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
          >
            <Feather className="w-5 h-5 xl:hidden" />
            <span className="hidden xl:inline">Post</span>
          </button>
        </div>
      </div>

      {/* Bottom Profile Pill */}
      <div className="pt-4">
        <Link
          href="/profile"
          className="flex items-center justify-between p-2.5 rounded-full hover:bg-white/10 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover border border-white/10 flex-shrink-0"
            />
            <div className="hidden xl:block min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-white truncate block">
                  {currentUser.name}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20 flex-shrink-0" />
              </div>
              <span className="text-xs text-neutral-500 truncate block">
                @{currentUser.username}
              </span>
            </div>
          </div>
          <MoreHorizontal className="w-4 h-4 text-neutral-500 hidden xl:block" />
        </Link>
      </div>
    </nav>
  );
}
