"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusSquare, Bell, User } from "lucide-react";
import { cn, formatCount } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useSession } from "next-auth/react";

const mobileNavItems = [
  { label: "Feed",    href: "/feed",          icon: Home },
  { label: "Explore", href: "/explore",        icon: Compass },
  { label: "Create",  href: "#",               icon: PlusSquare, isCreate: true },
  { label: "Notifs",  href: "/notifications",  icon: Bell,       isNotif: true },
  { label: "Profile", href: "/profile",        icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const { setIsCreatePostOpen, unreadCount } = useAppStore();
  const { data: session } = useSession();
  const username = (session?.user as any)?.username;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-black border-t border-zinc-800 z-50 flex items-center justify-around px-2 py-2 safe-bottom">
      {mobileNavItems.map(({ label, href, icon: Icon, isCreate, isNotif }) => {
        const finalHref = label === "Profile" ? `/profile/${username ?? ""}` : href;
        const isActive = pathname.startsWith(finalHref) && finalHref !== "#";

        if (isCreate) {
          return (
            <button
              key="create"
              onClick={() => setIsCreatePostOpen(true)}
              className="flex flex-col items-center gap-1 p-2 text-gray-400 active:text-white"
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px]">{label}</span>
            </button>
          );
        }

        return (
          <Link
            key={href}
            href={finalHref}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-colors",
              isActive ? "text-violet-400" : "text-gray-400 active:text-white"
            )}
          >
            <div className="relative">
              <Icon className="w-6 h-6" />
              {isNotif && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] bg-violet-600 rounded-full text-[9px] font-bold flex items-center justify-center text-white px-0.5">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px]">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
