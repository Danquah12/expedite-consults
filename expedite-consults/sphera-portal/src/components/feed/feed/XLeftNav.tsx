"use client";

import { useState } from "react";
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
  PenSquare,
  CheckCircle2,
  Music,
  Heart,
  Bookmark,
  ChevronDown,
  ChevronRight,
  Globe
} from "lucide-react";

interface XLeftNavProps {
  activeTab: string;
  onSelectTab: (tab: "FYP" | "FOLLOWING" | "GOSPEL" | "CAMPUS") => void;
  onSelectGospelSubTab?: (subTab: "devotional" | "music" | "prayers" | "promises" | "media") => void;
  activeGospelSubTab?: string;
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
  onSelectGospelSubTab,
  activeGospelSubTab = "devotional",
  onOpenCompose,
  currentUser = {
    name: "Kwesi Asiedu",
    username: "kwesi",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  },
}: XLeftNavProps) {
  const pathname = usePathname();
  const [isGospelMenuOpen, setIsGospelMenuOpen] = useState(false);

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
      label: "Daily Inspiration",
      icon: BookOpen,
      href: "/feed",
      onClick: () => onSelectTab("GOSPEL"),
      isActive: activeTab === "GOSPEL",
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
      id: "campus",
      label: "Campus Hub",
      icon: GraduationCap,
      href: "/campus",
    },
    {
      id: "spaces",
      label: "Audio Spaces",
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
    <nav className="flex flex-col justify-between h-full p-2 sm:p-4 text-neutral-200">
      {/* Top Section */}
      <div className="space-y-2">
        {/* Clean Logo Header */}
        <Link
          href="/feed"
          className="w-11 h-11 rounded-xl hover:bg-neutral-800/60 flex items-center justify-center transition-colors mb-2 group"
          title="Community Feed"
        >
          <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-900 flex items-center justify-center font-black text-sm">
            E
          </div>
        </Link>

        {/* Navigation Items */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = item.isActive;

            const content = (
              <div
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-150 group ${
                  isSelected
                    ? "bg-neutral-800 text-white font-semibold"
                    : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isSelected ? "text-white" : "text-neutral-400"}`} />
                <span className="hidden xl:inline text-sm">
                  {item.label}
                </span>
              </div>
            );

            if (item.id === "gospel") {
              const isGospelActive = activeTab === "GOSPEL";
              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center">
                    <button
                      onClick={() => {
                        onSelectTab("GOSPEL");
                        setIsGospelMenuOpen(!isGospelMenuOpen);
                      }}
                      className="flex-1 text-left"
                    >
                      {content}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsGospelMenuOpen(!isGospelMenuOpen);
                      }}
                      className="hidden xl:flex items-center justify-center p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
                    >
                      {isGospelMenuOpen ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Gospel Sub-Menu */}
                  {isGospelMenuOpen && (
                    <div className="hidden xl:flex flex-col ml-6 pl-3 border-l border-neutral-800 space-y-1 py-1">
                      {[
                        { id: "devotional", label: "Daily Devotional", icon: BookOpen },
                        { id: "music", label: "Inspirational Music", icon: Music },
                        { id: "prayers", label: "Prayer Community", icon: Heart },
                        { id: "promises", label: "Scripture Library", icon: Bookmark },
                      ].map((sub) => {
                        const SubIcon = sub.icon;
                        const isSubActive = isGospelActive && activeGospelSubTab === sub.id;

                        return (
                          <button
                            key={sub.id}
                            onClick={() => {
                              onSelectTab("GOSPEL");
                              if (onSelectGospelSubTab) {
                                onSelectGospelSubTab(sub.id as any);
                              }
                            }}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left ${
                              isSubActive
                                ? "bg-neutral-800 text-white font-semibold"
                                : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <SubIcon className="w-3.5 h-3.5" />
                              <span>{sub.label}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

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

        {/* Human, Refined "New Post" Button */}
        <div className="pt-3">
          <button
            onClick={onOpenCompose}
            className="w-full h-10 rounded-xl bg-white text-neutral-900 hover:bg-neutral-200 font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 active:scale-98"
          >
            <PenSquare className="w-4 h-4" />
            <span className="hidden xl:inline">New Post</span>
          </button>
        </div>
      </div>

      {/* Bottom Profile Pill */}
      <div className="pt-4 border-t border-neutral-800/80">
        <Link
          href="/profile"
          className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-800/60 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover border border-neutral-700 flex-shrink-0"
            />
            <div className="hidden xl:block min-w-0">
              <span className="text-xs font-semibold text-white truncate block">
                {currentUser.name}
              </span>
              <span className="text-[11px] text-neutral-400 truncate block">
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
