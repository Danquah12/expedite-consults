"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Home, Compass, PlusSquare, Bell, Search,
  User, Settings, LogOut, Loader2,
} from "lucide-react";
import { cn, formatCount } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const navItems = [
  { label: "Feed",          href: "/feed",          icon: Home },
  { label: "Explore",       href: "/explore",        icon: Compass },
  { label: "Search",        href: "/search",         icon: Search },
  { label: "Notifications", href: "/notifications",  icon: Bell },
  { label: "Settings",      href: "/settings",       icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { setIsCreatePostOpen, unreadCount } = useAppStore();

  if (status === "loading") {
    return (
      <aside className="hidden md:flex w-64 xl:w-72 flex-col fixed inset-y-0 left-0 border-r border-zinc-800 bg-black px-4 py-6">
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
        </div>
      </aside>
    );
  }

  const username = (session?.user as any)?.username ?? session?.user?.name;

  return (
    <aside className="hidden md:flex w-64 xl:w-72 flex-col fixed inset-y-0 left-0 border-r border-zinc-800 bg-black px-4 py-6 z-40">
      {/* Logo */}
      <Link href="/feed" className="px-3 mb-8">
        <span className="text-2xl font-bold text-violet-500 font-[family-name:var(--font-space)]">
          sphera
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          const isNotif = href === "/notifications";
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-4 px-3 py-3 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-violet-500/10 text-violet-400"
                  : "text-gray-400 hover:bg-zinc-900 hover:text-white"
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {isNotif && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-violet-600 rounded-full text-[10px] font-bold flex items-center justify-center text-white px-1">
                    {formatCount(unreadCount)}
                  </span>
                )}
              </div>
              <span>{label}</span>
            </Link>
          );
        })}

        {/* Create */}
        <button
          onClick={() => setIsCreatePostOpen(true)}
          className="flex w-full items-center gap-4 px-3 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-zinc-900 hover:text-white transition-colors"
        >
          <PlusSquare className="w-5 h-5" />
          <span>Create</span>
        </button>
      </nav>

      {/* Profile */}
      {session?.user && (
        <div className="border-t border-zinc-800 pt-4 space-y-1">
          <Link
            href={`/profile/${username}`}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors",
              pathname.startsWith("/profile") && pathname.includes(username ?? "")
                ? "bg-violet-500/10 text-violet-400"
                : "text-gray-400 hover:bg-zinc-900 hover:text-white"
            )}
          >
            {session.user.image ? (
              <img
                src={session.user.image}
                alt="Avatar"
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-violet-700 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {session.user.name?.[0]?.toUpperCase() ?? "S"}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {session.user.name}
              </p>
              <p className="truncate text-xs text-gray-500">@{username}</p>
            </div>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
            className="flex w-full items-center gap-4 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}
