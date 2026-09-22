"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  Bus,
  BookOpen,
  Users,
  Home,
  ShoppingBag,
  Sparkles,
  Shield,
  Search,
  Bell,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Heart,
  Share2,
  Filter,
  DollarSign,
  Coffee,
  AlertCircle,
  ExternalLink,
  Car,
  Phone,
  Bookmark,
  Plus,
  Compass,
  ArrowUpRight,
  UserCheck,
  Check,
  Building2,
} from "lucide-react";

export interface UniversityConfig {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  mascot: string;
  mascotEmoji: string;
  location: string;
  primaryColor: string; // e.g. "amber-500", "rose-600", "blue-600"
  primaryBg: string; // e.g. "bg-amber-500"
  primaryText: string; // e.g. "text-amber-500"
  primaryBorder: string; // e.g. "border-amber-500"
  accentGradient: string; // e.g. "from-amber-500 to-yellow-400"
  heroImage: string;
  stats: {
    enrolledStudents: string;
    activeClubs: string;
    transitRoutes: string;
    diningOpen: string;
  };
  featuredBuildings: {
    id: string;
    name: string;
    code: string;
    type: "Academic" | "Library" | "Student Center" | "Dining" | "Athletics";
    floors: number;
    hours: string;
    status: "Open Now" | "Closing Soon" | "Card Access Only";
    popularFor: string;
  }[];
  shuttleRoutes: {
    id: string;
    name: string;
    routeColor: string;
    nextArrival: string;
    stopsCount: number;
    frequency: string;
    status: "On Time" | "5 min delay" | "High Capacity";
    driverStatus: string;
  }[];
  parkingGarages: {
    name: string;
    occupancyPct: number;
    availableSpots: number;
    permitRequired: string;
  }[];
  diningHalls: {
    name: string;
    location: string;
    hours: string;
    mealPeriod: "Breakfast" | "Lunch" | "Dinner" | "Late Night";
    status: "Open" | "Busy" | "Closing Soon";
    capacityPct: number;
    popularStation: string;
  }[];
  courses: {
    code: string;
    title: string;
    credits: number;
    instructor: string;
    instructorEmail: string;
    schedule: string;
    room: string;
    building: string;
    nextAssignment: string;
    dueDate: string;
    officeHours: string;
    classmatesCount: number;
  }[];
  events: {
    id: string;
    title: string;
    organization: string;
    category: "Academic" | "Social" | "Career" | "Athletics" | "Arts";
    date: string;
    time: string;
    location: string;
    attendeesCount: number;
    image: string;
    isRsvpd?: boolean;
  }[];
  posts: {
    id: string;
    author: string;
    major: string;
    avatar: string;
    timeAgo: string;
    content: string;
    likes: number;
    commentsCount: number;
    tag: string;
  }[];
  housing: {
    id: string;
    title: string;
    rentPerMonth: number;
    beds: number;
    baths: number;
    distanceFromCampus: string;
    address: string;
    furnished: boolean;
    utilitiesIncluded: boolean;
    availableSemester: string;
    image: string;
  }[];
  marketplace: {
    id: string;
    title: string;
    price: number;
    seller: string;
    category: "Textbooks" | "Electronics" | "Furniture" | "Apparel";
    condition: "Like New" | "Good" | "Fair";
    timeAgo: string;
    image: string;
  }[];
}

interface CampusPortalLayoutProps {
  config: UniversityConfig;
}

export function CampusPortalLayout({ config }: CampusPortalLayoutProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "academics" | "transit" | "student-life" | "housing">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsCount, setNotificationsCount] = useState(3);
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set());
  const [rsvpdEventIds, setRsvpdEventIds] = useState<Set<string>>(new Set(["ev-1"]));
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [housingMaxRent, setHousingMaxRent] = useState(1200);
  const [marketCategory, setMarketCategory] = useState("ALL");
  const [showToast, setShowToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const toggleBookmark = (id: string) => {
    const next = new Set(bookmarkedItems);
    if (next.has(id)) {
      next.delete(id);
      triggerToast("Removed from saved items");
    } else {
      next.add(id);
      triggerToast("Saved to your student backpack");
    }
    setBookmarkedItems(next);
  };

  const toggleRsvp = (id: string) => {
    const next = new Set(rsvpdEventIds);
    if (next.has(id)) {
      next.delete(id);
      triggerToast("RSVP cancelled");
    } else {
      next.add(id);
      triggerToast("RSVP confirmed! Added to your calendar");
    }
    setRsvpdEventIds(next);
  };

  const toggleLike = (id: string) => {
    const next = new Set(likedPostIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setLikedPostIds(next);
  };

  const filteredHousing = config.housing.filter((h) => h.rentPerMonth <= housingMaxRent);
  const filteredMarket = config.marketplace.filter((m) => marketCategory === "ALL" || m.category === marketCategory);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090a0f] text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-slate-800 selection:text-white dark:selection:bg-slate-200 dark:selection:text-black">
      
      {/* ── Toast Notification ──────────────────────────────────────── */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700/40 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{showToast}</span>
        </div>
      )}

      {/* ── Top University Brand Bar ─────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-[#0f1117]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & University Switcher */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${config.accentGradient} flex items-center justify-center text-white shadow-md shadow-slate-900/10 dark:shadow-none`}>
              <GraduationCap className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  {config.name}
                </h1>
                <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-semibold border border-slate-200 dark:border-zinc-700">
                  {config.mascot} {config.mascotEmoji}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                Spring 2026 Academic Portal • {config.location}
              </p>
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 w-64 text-xs focus-within:ring-2 focus-within:ring-slate-400 dark:focus-within:ring-zinc-600">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses, buildings, shuttles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 text-xs"
              />
            </div>

            {/* Quick Multi-Campus Directory */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 text-[11px] font-semibold">
              <a href="/campus" className={`px-2.5 py-1 rounded-lg transition ${config.id === "towson" ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs" : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"}`}>
                Towson
              </a>
              <a href="/umd" className={`px-2.5 py-1 rounded-lg transition ${config.id === "umd" ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs" : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"}`}>
                UMD
              </a>
              <a href="/umbc" className={`px-2.5 py-1 rounded-lg transition ${config.id === "umbc" ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs" : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"}`}>
                UMBC
              </a>
              <a href="/salisbury" className={`px-2.5 py-1 rounded-lg transition ${config.id === "salisbury" ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs" : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"}`}>
                Salisbury
              </a>
              <a href="/hopkins" className={`px-2.5 py-1 rounded-lg transition ${config.id === "hopkins" ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs" : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"}`}>
                JHU
              </a>
            </div>

            <a
              href="/feed"
              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <span>Social FYP</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </header>

      {/* ── Sub-Navigation Tabs ─────────────────────────────────────── */}
      <nav className="bg-white dark:bg-[#0f1117] border-b border-slate-200/80 dark:border-zinc-800/80 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none">
          {[
            { id: "overview", label: "Dashboard & Pulse", icon: Compass },
            { id: "academics", label: "Courses & Academics", icon: BookOpen, badge: `${config.courses.length}` },
            { id: "transit", label: "Campus Map & Shuttles", icon: Bus },
            { id: "student-life", label: "Student Life & Events", icon: Calendar, badge: `${config.events.length}` },
            { id: "housing", label: "Housing & Marketplace", icon: Home },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                    : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/70"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? "bg-white/20 dark:bg-black/20 text-white dark:text-black" : "bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Main Content Area ────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 1: OVERVIEW & DASHBOARD                                    */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Hero Welcome Banner */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-gradient-to-r from-slate-900 via-slate-800 to-zinc-900 text-white p-6 sm:p-8 shadow-xl">
              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[11px] font-semibold backdrop-blur-md border border-white/10">
                    Welcome back, Kwesi
                  </span>
                  <span className="text-slate-400 text-xs">• Today is Tuesday, March 24</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Good Morning, Tiger! 🎓
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  You have <span className="text-amber-400 font-bold">2 classes</span> today, an upcoming midterm assignment due Thursday, and the <span className="text-white font-bold">{config.shuttleRoutes[0]?.name}</span> is arriving in 4 minutes.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab("academics")}
                    className="px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                  >
                    <span>View Today's Schedule</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveTab("transit")}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition backdrop-blur-md"
                  >
                    Check Shuttles & Dining
                  </button>
                </div>
              </div>

              {/* Decorative Subtle Background Elements */}
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/5 to-transparent pointer-events-none hidden md:block" />
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#12141c] border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Campus Population
                </span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {config.stats.enrolledStudents}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Full Term Active</span>
                </p>
              </div>

              <div className="bg-white dark:bg-[#12141c] border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Active Student Clubs
                </span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {config.stats.activeClubs}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                  Chartered & Recognized
                </p>
              </div>

              <div className="bg-white dark:bg-[#12141c] border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Transit Shuttles
                </span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {config.stats.transitRoutes}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  All Routes Running
                </p>
              </div>

              <div className="bg-white dark:bg-[#12141c] border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Dining Hall Status
                </span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {config.stats.diningOpen}
                </p>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  Lunch Service Open
                </p>
              </div>
            </div>

            {/* Dual Column: Today's Classes + Campus Pulse Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left 2 Cols: Schedule & Quick Hubs */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Today's Class Schedule */}
                <div className="bg-white dark:bg-[#12141c] border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Enrolled Courses (Spring 2026)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        {config.courses.length} courses registered • 15.0 Total Credits
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("academics")}
                      className="text-xs font-bold text-slate-700 dark:text-zinc-300 hover:underline flex items-center gap-1"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {config.courses.map((course, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-slate-300 dark:hover:border-zinc-700"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-mono">
                              {course.code}
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate max-w-[240px]">
                              {course.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {course.schedule}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {course.building} Room {course.room}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:text-right">
                          <div className="text-left sm:text-right">
                            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 block">
                              Due: {course.nextAssignment}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {course.dueDate}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Campus Highlights & Live Dining Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Dining Hours Card */}
                  <div className="bg-white dark:bg-[#12141c] border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Campus Dining</h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        Open Now
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {config.diningHalls.slice(0, 3).map((hall, idx) => (
                        <div key={idx} className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800/60 last:border-0 last:pb-0">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-zinc-200">{hall.name}</p>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400">{hall.hours}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                              {hall.capacityPct}% Full
                            </span>
                            <span className="text-[10px] text-slate-400 block">{hall.popularStation}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shuttles Live Status */}
                  <div className="bg-white dark:bg-[#12141c] border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bus className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Live Shuttles</h4>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                        GPS Active
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {config.shuttleRoutes.slice(0, 3).map((route, idx) => (
                        <div key={idx} className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800/60 last:border-0 last:pb-0">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-zinc-200">{route.name}</p>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400">{route.frequency}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg">
                              {route.nextArrival}
                            </span>
                            <span className="text-[10px] text-slate-400 block">{route.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Right 1 Col: Campus Discussions & Student Board */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-[#12141c] border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
                      <span>Campus Board</span>
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                      Verified Students
                    </span>
                  </div>

                  <div className="space-y-3">
                    {config.posts.map((post) => (
                      <div
                        key={post.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/60 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={post.avatar}
                              alt={post.author}
                              className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-zinc-700"
                            />
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white leading-none block">
                                {post.author}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                                {post.major} • {post.timeAgo}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                            {post.tag}
                          </span>
                        </div>

                        <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                          {post.content}
                        </p>

                        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-zinc-400">
                          <button
                            onClick={() => toggleLike(post.id)}
                            className={`flex items-center gap-1 transition ${likedPostIds.has(post.id) ? "text-rose-500 font-bold" : "hover:text-slate-900 dark:hover:text-white"}`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${likedPostIds.has(post.id) ? "fill-rose-500" : ""}`} />
                            <span>{post.likes + (likedPostIds.has(post.id) ? 1 : 0)}</span>
                          </button>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{post.commentsCount} comments</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Campus Safety Quick Assistance */}
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-3xl p-5 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold">
                    <Shield className="w-4 h-4" />
                    <span>Campus Safety & SafeWalk</span>
                  </div>
                  <p className="text-rose-700 dark:text-rose-400 text-[11px] leading-relaxed">
                    Need an escort across campus after dark or emergency assistance? Student escorts are available 24/7.
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono font-bold text-rose-900 dark:text-rose-200">
                      📞 (410) 704-SAFE
                    </span>
                    <button
                      onClick={() => triggerToast("Dispatching SafeWalk Request...")}
                      className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition shadow-xs"
                    >
                      Request SafeWalk
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 2: COURSES & ACADEMICS                                    */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "academics" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Academic Schedule & Course Lounges
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Manage syllabus deliverables, join study pods, and book faculty office hours.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerToast("Synced with Google Calendar & Outlook")}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-800 dark:text-zinc-200 text-xs font-bold border border-slate-200 dark:border-zinc-700 transition"
                >
                  📅 Sync Calendar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.courses.map((course, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#12141c] border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-mono">
                        {course.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                        {course.credits}.0 Credits
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {course.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                        Instructor: <span className="font-semibold text-slate-700 dark:text-zinc-300">{course.instructor}</span>
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/60 dark:border-zinc-800 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{course.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{course.building} • Room {course.room}</span>
                      </div>
                      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold pt-1 border-t border-slate-200/60 dark:border-zinc-800">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{course.nextAssignment} ({course.dueDate})</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      👥 {course.classmatesCount} Classmates
                    </span>
                    <button
                      onClick={() => triggerToast(`Connecting to ${course.code} Study Pod...`)}
                      className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-900 dark:text-white text-xs font-bold transition"
                    >
                      Join Study Pod
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 3: CAMPUS MAP & TRANSIT                                   */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "transit" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Campus Navigation, Shuttles & Parking
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Real-time GPS shuttle tracking, garage space counters, and building directories.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Transit Live GPS Online</span>
                </span>
              </div>
            </div>

            {/* Shuttle Routes Tracker */}
            <div className="bg-white dark:bg-[#12141c] border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bus className="w-4 h-4 text-cyan-500" />
                <span>Active University Shuttle Routes</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {config.shuttleRoutes.map((shuttle) => (
                  <div
                    key={shuttle.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {shuttle.name}
                      </span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-lg">
                        {shuttle.nextArrival}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                      <span>{shuttle.stopsCount} Stops • {shuttle.frequency}</span>
                      <span className="font-semibold text-slate-700 dark:text-zinc-300">{shuttle.status}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Driver Status: {shuttle.driverStatus}</span>
                      <button
                        onClick={() => triggerToast(`Viewing Live Route: ${shuttle.name}`)}
                        className="text-slate-900 dark:text-white font-bold hover:underline"
                      >
                        Track Map &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parking Garages Availability */}
            <div className="bg-white dark:bg-[#12141c] border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-amber-500" />
                <span>Garage Parking Availability</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {config.parkingGarages.map((garage, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{garage.name}</span>
                      <span className={`font-black ${garage.occupancyPct > 85 ? "text-rose-500" : "text-emerald-500"}`}>
                        {garage.occupancyPct}% Full
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${garage.occupancyPct > 85 ? "bg-rose-500" : "bg-emerald-500"}`}
                        style={{ width: `${garage.occupancyPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 pt-1">
                      <span>{garage.availableSpots} spots open</span>
                      <span>{garage.permitRequired}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Building Directory */}
            <div className="bg-white dark:bg-[#12141c] border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
                <span>Academic & Campus Facilities</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {config.featuredBuildings.map((bldg) => (
                  <div
                    key={bldg.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{bldg.name}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                        {bldg.code}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-zinc-400">{bldg.type} • {bldg.floors} Floors • {bldg.hours}</p>
                    <p className="text-slate-600 dark:text-zinc-300 font-medium">Popular: {bldg.popularFor}</p>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{bldg.status}</span>
                      <button
                        onClick={() => triggerToast(`Opening floor plans for ${bldg.name}...`)}
                        className="text-slate-900 dark:text-white font-bold hover:underline"
                      >
                        Floor Map &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 4: STUDENT LIFE & EVENTS                                  */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "student-life" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Student Life, Organizations & Events
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Discover campus activities, RSVP for club meetups, and explore campus organizations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerToast("Registered organization creation portal opening...")}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Host an Event</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.events.map((event) => {
                const isRsvpd = rsvpdEventIds.has(event.id);
                return (
                  <div
                    key={event.id}
                    className="bg-white dark:bg-[#12141c] border border-slate-200/90 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="relative h-44 w-full bg-slate-100 dark:bg-zinc-900 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white font-bold text-[10px]">
                        {event.category}
                      </span>
                    </div>

                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                          {event.organization}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                          {event.title}
                        </h4>
                        <div className="space-y-1 text-xs text-slate-600 dark:text-zinc-300">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{event.date} • {event.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-zinc-400">
                          👥 {event.attendeesCount + (isRsvpd ? 1 : 0)} Attending
                        </span>
                        <button
                          onClick={() => toggleRsvp(event.id)}
                          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            isRsvpd
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                              : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90"
                          }`}
                        >
                          {isRsvpd ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Attending</span>
                            </>
                          ) : (
                            <span>RSVP Now</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 5: HOUSING & MARKETPLACE                                  */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "housing" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Housing Subleases */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Verified Student Housing & Subleases
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Find off-campus apartments, summer subleases, and verified student roommates.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">Max Rent: ${housingMaxRent}/mo</span>
                  <input
                    type="range"
                    min="600"
                    max="2000"
                    step="50"
                    value={housingMaxRent}
                    onChange={(e) => setHousingMaxRent(Number(e.target.value))}
                    className="accent-slate-900 dark:accent-white cursor-pointer w-32"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHousing.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-[#12141c] border border-slate-200/90 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition"
                  >
                    <div className="relative h-44 w-full bg-slate-100 dark:bg-zinc-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      <span className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-slate-900/90 text-white font-extrabold text-sm backdrop-blur-md">
                        ${item.rentPerMonth} <span className="text-xs font-normal text-slate-300">/ mo</span>
                      </span>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">{item.address} • {item.distanceFromCampus}</p>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-zinc-300 font-medium">
                        <span>🛏️ {item.beds} Bed</span>
                        <span>•</span>
                        <span>🚿 {item.baths} Bath</span>
                        <span>•</span>
                        <span>{item.furnished ? "🛋️ Furnished" : "Unfurnished"}</span>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                          {item.availableSemester}
                        </span>
                        <button
                          onClick={() => triggerToast(`Contacting property manager for ${item.title}...`)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition"
                        >
                          Book Tour / Inquire
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Marketplace */}
            <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Student Marketplace & Textbooks
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Buy and sell textbooks, electronics, and dorm items safely with verified campus peers.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
                  {["ALL", "Textbooks", "Electronics", "Furniture", "Apparel"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setMarketCategory(cat)}
                      className={`px-3 py-1 rounded-xl transition ${marketCategory === cat ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMarket.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-[#12141c] border border-slate-200/90 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs p-3 space-y-2 flex flex-col justify-between"
                  >
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white font-black text-xs">
                        ${item.price}
                      </span>
                    </div>

                    <div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">{item.title}</h5>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        <span>{item.condition}</span>
                        <span>{item.timeAgo}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => triggerToast(`Messaging ${item.seller} for ${item.title}...`)}
                      className="w-full py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white text-[11px] font-bold transition"
                    >
                      Message Seller
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ── Minimalist Clean Footer ─────────────────────────────────── */}
      <footer className="mt-16 border-t border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#0f1117] py-8 text-xs text-slate-500 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-zinc-200">{config.name} Student Hub</span>
            <span>•</span>
            <span>Accredited Campus Network</span>
          </div>
          <p className="text-slate-400 dark:text-zinc-500">
            Expedite Consults Collegiate Graph • Built for Students & Faculty
          </p>
        </div>
      </footer>

    </div>
  );
}
