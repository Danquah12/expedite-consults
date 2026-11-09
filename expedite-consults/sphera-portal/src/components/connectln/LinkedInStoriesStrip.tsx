"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Play,
  Pause,
  RotateCw,
  Plus,
  X,
  Download,
  ThumbsUp,
  MessageSquare,
  Share2,
  Video,
  Image as ImageIcon,
  Sparkles,
  Check
} from "lucide-react"
import { UserProfile } from "@/lib/connectln-data"
import { resolveUserProfilePicture } from "@/lib/connectin-storage"
import { ConnectLnStudioPlayer } from "./ConnectLnStudioPlayer"

export interface LinkedInStoryItem {
  id: string
  authorName: string
  authorHeadline: string
  authorAvatar: string
  badgeText: string
  cardStyle: 'podium' | 'poster_frame' | 'news_portrait' | 'field_action'
  title: string
  subtitle: string
  imageUrl: string
  youtubeId: string
  duration: string
  likes: number
  comments: number
  submitsText?: string
  sealText?: string
  reelCategory?: 'cyber' | 'ignored' | 'veterans' | 'clinical_trades'
}

const INITIAL_LINKEDIN_STORIES: LinkedInStoryItem[] = [
  {
    id: 'story_lbd_speed_square',
    authorName: 'This Old House · Skilled Trades: Learn by Doing',
    authorHeadline: 'Carpentry Basics: Marking and Checking Angles (Using a Speed Square)',
    authorAvatar: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&auto=format&fit=crop&q=80',
    badgeText: 'CARPENTRY #1',
    cardStyle: 'field_action',
    title: 'Carpentry Basics: Marking and Checking Angles — Using a Speed Square',
    subtitle: 'Original Creator: This Old House · Mark 90° & 45° Angles on Scrap Wood',
    imageUrl: 'https://i.ytimg.com/vi/gNhWpuWvtEA/hqdefault.jpg',
    youtubeId: 'gNhWpuWvtEA',
    duration: '',
    likes: 1940,
    comments: 214,
    sealText: 'LBD',
    reelCategory: 'clinical_trades'
  },
  {
    id: 'story_lbd_welding_miller',
    authorName: 'Miller Welders · Skilled Trades: Learn by Doing',
    authorHeadline: 'Welding Basics: Comparing MIG, Stick & TIG Welding for Beginners',
    authorAvatar: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&auto=format&fit=crop&q=80',
    badgeText: 'WELDING 101',
    cardStyle: 'field_action',
    title: 'Welding Basics for Beginners: Compare MIG, Stick & TIG Applications',
    subtitle: 'Original Creator: Miller Welders · Hands-On Process Comparison',
    imageUrl: 'https://i.ytimg.com/vi/OWThL97tq3k/hqdefault.jpg',
    youtubeId: 'OWThL97tq3k',
    duration: '',
    likes: 1820,
    comments: 196,
    sealText: 'MIG',
    reelCategory: 'ignored'
  },
  {
    id: 'story_lbd_clamps_thisoldhouse',
    authorName: 'This Old House · Skilled Trades: Learn by Doing',
    authorHeadline: 'Carpentry Basics: Choosing the Right Clamp & Protecting Wood Surfaces',
    authorAvatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
    badgeText: 'CARPENTRY #2',
    cardStyle: 'field_action',
    title: 'Carpentry Basics: Choosing and Using Clamps Without Marring Wood',
    subtitle: 'Original Creator: This Old House · Bar, Pipe, C-Clamp & Quick-Grip Guide',
    imageUrl: 'https://i.ytimg.com/vi/GHiOk_8mlq0/hqdefault.jpg',
    youtubeId: 'GHiOk_8mlq0',
    duration: '',
    likes: 1690,
    comments: 175,
    sealText: 'CLMP',
    reelCategory: 'clinical_trades'
  },
  {
    id: 'story_cyber_soc_redteam',
    authorName: 'Tariq Al-Mansoor, OSCP & Alex Taylor, CISSP',
    authorHeadline: 'Principal Red Team Operator, SOC Tier-3 & Cloud Zero-Trust Cadre',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    badgeText: 'CYBER OPS 2026',
    cardStyle: 'podium',
    title: 'Inside Ægis Autonomous SOC: Live Red-Team Adversary Emulation, eBPF Kernel Defense & CMMC 2.0 cATO',
    subtitle: 'Live Cyber Briefing · SOC, Pentest, Cloud, GRC & OT/SCADA',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000&auto=format&fit=crop&q=80',
    youtubeId: 'L_Guz73e6fw',
    duration: '4:35',
    likes: 1640,
    comments: 198,
    sealText: 'SOC',
    reelCategory: 'cyber'
  },
  {
    id: 'story_ignored_lineman_elevator_cdl',
    authorName: 'Essential Masters Guild (IBEW · IUEC · CDL Class A)',
    authorHeadline: 'Professions LinkedIn Ignored · 500kV Linemen, Elevator Mechanics & Heavy-Haul Drivers',
    authorAvatar: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&auto=format&fit=crop&q=80',
    badgeText: 'ESSENTIAL MASTERS',
    cardStyle: 'field_action',
    title: 'Professions LinkedIn Ignored: 500kV Storm Linemen, High-Rise Elevator Constructors & 19-Axle CDL Heavy-Haul',
    subtitle: 'Verified Field Proof-of-Work · $115K–$245K Essential Careers',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1000&auto=format&fit=crop&q=80',
    youtubeId: 'zu6p3_df20A',
    duration: '5:20',
    likes: 2180,
    comments: 264,
    sealText: 'PRO',
    reelCategory: 'ignored'
  },
  {
    id: 'story_veterans_skillbridge_sdvosb',
    authorName: 'Maj. Marcus Vance (USMC Ret.) & MSgt. Elena Rostova',
    authorHeadline: 'DoD SkillBridge, SBA VetCert SDVOSB & VetFran Multi-Unit Network',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    badgeText: 'VETERAN COMMAND',
    cardStyle: 'news_portrait',
    title: 'Military-to-Civilian Command: MOS 17C Cyber, 88M CDL, 12P Lineman & 68W Medic Direct Hiring & VetFran Ownership',
    subtitle: '180-DAY DOD SKILLBRIDGE · SDVOSB SOLE-SOURCE',
    imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1000&auto=format&fit=crop&q=80',
    youtubeId: 'OWThL97tq3k',
    duration: '',
    likes: 1890,
    comments: 215,
    sealText: 'VET',
    reelCategory: 'veterans'
  },
  {
    id: 'story_clinical_field_action',
    authorName: 'Elena Rostova, RN, CCRN & Field Leads',
    authorHeadline: 'Level 1 Clinical Nursing, Mass Timber & 800V EV Operations',
    authorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    badgeText: 'LIVE IN ACTION',
    cardStyle: 'field_action',
    title: 'Frontline Professionals in Action: Clinical Nursing Rounds, Mass Timber & Solar Microgrids',
    subtitle: 'Verified Hands-On Photo & Video Reel',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1000&auto=format&fit=crop&q=80',
    youtubeId: 'gNhWpuWvtEA',
    duration: '',
    likes: 930,
    comments: 81,
    reelCategory: 'clinical_trades'
  },
  {
    id: 'story_cyber_ot_scada_dfir',
    authorName: 'James Kowalski, GICSP & Dr. Liam O’Connor',
    authorHeadline: 'OT/ICS SCADA Grid Defense, DFIR Malware Reverse Engineering & IAM',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    badgeText: 'OT & DFIR LAB',
    cardStyle: 'poster_frame',
    title: 'Zero-Day OT Grid Defense',
    subtitle: 'Protecting Substations, PLC Firmware & Active Directory from Ransomware',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80',
    youtubeId: 'L_Guz73e6fw',
    duration: '4:15',
    likes: 1320,
    comments: 147,
    submitsText: '412 Security Architects downloaded playbook',
    reelCategory: 'cyber'
  },
  {
    id: 'story_ignored_arborist_fishing_evs',
    authorName: 'Capt. Erik Lindqvist & ISA Master Arborists',
    authorHeadline: 'Offshore Crab/Lobster Captains, Crane Tree Surgeons, Hospital EVS & 75-Ton Rotator Tow',
    authorAvatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
    badgeText: 'FIELD REEL',
    cardStyle: 'field_action',
    title: 'Unsung Masters: Crane Tree Removal, Bering Sea Crab Captains, OR Bio-Decontamination & 75-Ton Highway Recovery',
    subtitle: 'Real Trades & Essential Work · Zero Corporate Fluff',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&auto=format&fit=crop&q=80',
    youtubeId: 'f4cT6_t7690',
    duration: '4:55',
    likes: 1750,
    comments: 209,
    sealText: 'IGN',
    reelCategory: 'ignored'
  },
  {
    id: 'story_podium_keynote',
    authorName: 'The Wall Street & Capitol Summit',
    authorHeadline: 'National Infrastructure, Clinical & Executive Keynote Feed',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    badgeText: 'KEYNOTE 2026',
    cardStyle: 'podium',
    title: 'Sen. & Industry Leaders Announce $42B Skilled Trades, Clinical Nursing & AI Grid Pact',
    subtitle: 'Live Podium Address · Washington, D.C.',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80',
    youtubeId: 'GHiOk_8mlq0',
    duration: '',
    likes: 842,
    comments: 94,
    reelCategory: 'clinical_trades'
  },
  {
    id: 'story_fisher_poster',
    authorName: 'Expedite Wealth & Advisory',
    authorHeadline: '321,009 followers · Promoted Executive Guide',
    authorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
    badgeText: 'FREE GUIDE',
    cardStyle: 'poster_frame',
    title: '7 Income Streams',
    subtitle: 'to Help Professionals & Practice Owners Build $1,000,000+ Contracts',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80',
    youtubeId: 'f4bJ211169A',
    duration: '4:12',
    likes: 618,
    comments: 52,
    submitsText: '148 others have submitted · Free Blueprint',
    reelCategory: 'veterans'
  },
  {
    id: 'story_icj_news_portrait',
    authorName: 'Global Bench & Legal Times',
    authorHeadline: 'International Court of Justice & Federal Chambers',
    authorAvatar: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80',
    badgeText: 'NEWS',
    cardStyle: 'news_portrait',
    title: "Justice Phoebe Okowa Re-Elected as Judge of the ICJ After Tight UN Security Council Vote",
    subtitle: 'NOV 04, 2026 · ICJ HAGUE',
    imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1000&auto=format&fit=crop&q=80',
    youtubeId: 'aircAruvnKk',
    duration: '2:58',
    likes: 1204,
    comments: 136,
    sealText: 'ICJ',
    reelCategory: 'clinical_trades'
  }
]

interface LinkedInStoriesStripProps {
  currentUser: UserProfile
  onShareStoryToFeed?: (story: LinkedInStoryItem, mode: 'photo' | 'video') => void
}

export function LinkedInStoriesStrip({
  currentUser,
  onShareStoryToFeed
}: LinkedInStoriesStripProps) {
  const [stories, setStories] = useState<LinkedInStoryItem[]>(INITIAL_LINKEDIN_STORIES)
  const [activeStory, setActiveStory] = useState<LinkedInStoryItem | null>(null)
  const [viewMode, setViewMode] = useState<'photo' | 'video'>('photo')
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({})
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newStoryTitle, setNewStoryTitle] = useState("")
  const [newStorySubtitle, setNewStorySubtitle] = useState("")
  const [newStoryStyle, setNewStoryStyle] = useState<'podium' | 'poster_frame' | 'news_portrait' | 'field_action'>('news_portrait')
  const [newStoryImageUrl, setNewStoryImageUrl] = useState("https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1000&auto=format&fit=crop&q=80")
  const [sharedBanner, setSharedBanner] = useState(false)
  const [clockwiseSlot, setClockwiseSlot] = useState<number>(0)
  const [isRotatingClockwise, setIsRotatingClockwise] = useState<boolean>(true)
  const [isHoverPaused, setIsHoverPaused] = useState<boolean>(false)
  const [reelFilter, setReelFilter] = useState<'all' | 'cyber' | 'ignored' | 'veterans' | 'clinical_trades'>('all')

  const displayedStories = reelFilter === 'all'
    ? stories
    : stories.filter((s) => s.reelCategory === reelFilter)

  const userAvatar = resolveUserProfilePicture(currentUser)

  // Step cards & spotlight highlight clockwise (pure top-level state updates)
  const stepClockwise = useCallback(() => {
    setClockwiseSlot((prevSlot) => (prevSlot + 1) % 4)
    setStories((prevStories) => {
      if (prevStories.length <= 1) return prevStories
      return [prevStories[prevStories.length - 1], ...prevStories.slice(0, prevStories.length - 1)]
    })
  }, [])

  useEffect(() => {
    if (!isRotatingClockwise || isHoverPaused || activeStory || isAddModalOpen) return
    const timer = setInterval(() => {
      stepClockwise()
    }, 3500)
    return () => clearInterval(timer)
  }, [isRotatingClockwise, isHoverPaused, activeStory, isAddModalOpen, stepClockwise])

  const handleCreateStory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStoryTitle.trim()) return
    const created: LinkedInStoryItem = {
      id: 'story_user_' + Date.now(),
      authorName: currentUser.name || 'Verified Professional',
      authorHeadline: currentUser.headline || 'Verified ConnectLn Member',
      authorAvatar: userAvatar,
      badgeText: newStoryStyle === 'poster_frame' ? 'FREE GUIDE' : newStoryStyle === 'news_portrait' ? 'NEWS' : 'KEYNOTE 2026',
      cardStyle: newStoryStyle,
      title: newStoryTitle.trim(),
      subtitle: newStorySubtitle.trim() || 'NOV 04, 2026 · CONNECTLN LIVE',
      imageUrl: newStoryImageUrl.trim() || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1000&auto=format&fit=crop&q=80',
      youtubeId: '9mwE1Aih9uU',
      duration: '3:30',
      likes: 42,
      comments: 7,
      sealText: 'CLN'
    }
    setStories((prev) => [created, ...prev])
    setIsAddModalOpen(false)
    setNewStoryTitle("")
    setNewStorySubtitle("")
    setActiveStory(created)
    setViewMode('photo')
  }

  return (
    <div
      onMouseEnter={() => setIsHoverPaused(true)}
      onMouseLeave={() => setIsHoverPaused(false)}
      className="rounded-xl border border-emerald-500/40 bg-white p-3.5 shadow-2xs dark:border-emerald-500/30 dark:bg-zinc-900 space-y-2.5"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#0A66C2]/10 text-[#0A66C2] dark:bg-sky-500/20 dark:text-sky-400">
            <RotateCw
              className={`h-3.5 w-3.5 ${isRotatingClockwise && !isHoverPaused ? "animate-spin" : ""}`}
              style={{ animationDuration: "4s" }}
            />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                Professional Stories, Keynotes &amp; Live Action Reels
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300/70 dark:border-emerald-800 px-2 py-0.2 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {isHoverPaused ? "Paused on Hover" : isRotatingClockwise ? "Moving Clockwise ↻" : "Manual Mode"}
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
              Click any card to view full-resolution photo or watch live video briefing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={stepClockwise}
            title="Step clockwise now"
            className="rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 px-2.5 py-1 text-[10px] font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCw className="h-3 w-3 text-emerald-600" />
            <span>Step ↻</span>
          </button>
          <button
            type="button"
            onClick={() => setIsRotatingClockwise((prev) => !prev)}
            title={isRotatingClockwise ? "Pause clockwise motion" : "Resume clockwise motion"}
            className="rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 p-1.5 text-zinc-700 dark:text-zinc-200 cursor-pointer transition-colors"
          >
            {isRotatingClockwise ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-full bg-[#0A66C2] hover:bg-[#004182] px-3 py-1 text-[11px] font-bold text-white flex items-center gap-1 shadow-2xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Post Story / Poster</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills for Reels */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: '🌐 All Live Reels (9)' },
          { id: 'cyber', label: '🛡️ Cybersecurity & Red Team' },
          { id: 'ignored', label: '🛠️ Professions LinkedIn Ignored' },
          { id: 'veterans', label: '🎖️ Veterans & SkillBridge' },
          { id: 'clinical_trades', label: '🏥 Clinical, Legal & Trades' },
        ].map((pill) => (
          <button
            key={pill.id}
            type="button"
            onClick={() => {
              setReelFilter(pill.id as any)
              setClockwiseSlot(0)
            }}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer ${
              reelFilter === pill.id
                ? "bg-[#0A66C2] text-white shadow-2xs"
                : "border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* 4-Card Rounded LinkedIn Story Strip (Moving Clockwise) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {(displayedStories.length > 0 ? displayedStories : stories).slice(0, 4).map((story, idx) => {
          const isClockwiseSpotlight = idx === clockwiseSlot
          return (
            <div
              key={story.id}
              onClick={() => {
                setActiveStory(story)
                setViewMode('photo')
              }}
              className={`group relative h-52 sm:h-56 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ${
                isClockwiseSpotlight
                  ? "ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/20 -translate-y-0.5"
                  : "border border-zinc-200/90 dark:border-zinc-700/80 shadow-xs hover:shadow-md"
              }`}
            >
              {/* Card Variant 1: Framed Poster Style (Matches Fisher Investments 7 Income Streams Card) */}
              {story.cardStyle === 'poster_frame' ? (
                <div className="h-full w-full bg-white flex flex-col justify-between border-[5px] border-[#E10600] p-2.5 relative overflow-hidden">
                  <div className="space-y-1 z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-base leading-none">🇺🇸</span>
                      <span className="rounded bg-red-50 px-1.5 py-0.5 text-[8px] font-extrabold text-[#E10600] uppercase">
                        {story.badgeText}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-zinc-900 leading-tight">
                      {story.title}
                    </h4>
                    <p className="text-[9px] text-zinc-600 leading-snug line-clamp-2">
                      {story.subtitle}
                    </p>
                  </div>

                  <div className="relative h-24 w-full rounded overflow-hidden my-1">
                    <img
                      src={story.imageUrl}
                      alt={story.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="pt-1 border-t border-zinc-200 flex items-center justify-between text-[9px] font-bold text-[#0A66C2]">
                    <span className="truncate text-zinc-500 font-medium">Free Guide</span>
                    <span className="flex items-center gap-0.5 shrink-0">
                      <Download className="h-2.5 w-2.5" /> Download
                    </span>
                  </div>
                </div>
              ) : story.cardStyle === 'news_portrait' ? (
                /* Card Variant 2: News / ICJ Judge Portrait Style (Matches Kenya Times Phoebe Okowa Card) */
                <div className="h-full w-full relative bg-zinc-900 border-b-4 border-[#E10600]">
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/30" />

                  {/* Top Masthead & Circular Emblem */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                    <img
                      src={story.authorAvatar}
                      alt={story.authorName}
                      className="h-6 w-6 rounded-full object-cover ring-2 ring-[#E10600]"
                    />
                    <span className="text-[8px] font-extrabold text-white/90 uppercase tracking-wider bg-black/50 px-1.5 py-0.5 rounded">
                      {story.subtitle.split('·')[0]}
                    </span>
                  </div>

                  {/* Middle Right Official Seal */}
                  {story.sealText && (
                    <div className="absolute right-2 top-11 h-8 w-8 rounded-full bg-white/95 text-[#0A66C2] flex items-center justify-center font-black text-[9px] shadow-md border border-sky-200">
                      {story.sealText}
                    </div>
                  )}

                  {/* Bottom News Box */}
                  <div className="absolute bottom-2 left-2 right-2 space-y-1">
                    <div className="flex items-center">
                      <span className="bg-[#E10600] text-white text-[8px] font-black uppercase px-1.5 py-0.5 tracking-wider">
                        {story.badgeText}
                      </span>
                      <div className="h-[2px] flex-1 bg-[#E10600]" />
                    </div>
                    <div className="bg-black/80 p-1.5 rounded-xs">
                      <p style={{ color: "#FFFFFF" }} className="text-[10px] font-extrabold leading-tight line-clamp-3">
                        {story.title}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Card Variant 3: WSJ Podium / Live Action Style (Matches WSJ Susan Collins Podium Card) */
                <div className="h-full w-full relative bg-zinc-900">
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

                  {/* Top Author Pill & Video Play Indicator */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-xs rounded-full pr-2 pl-0.5 py-0.5 border border-white/15">
                      <img
                        src={story.authorAvatar}
                        alt={story.authorName}
                        className="h-5 w-5 rounded-full object-cover ring-1 ring-white"
                      />
                      <span style={{ color: "#FFFFFF" }} className="text-[9px] font-bold truncate max-w-[90px]">
                        {story.authorName}
                      </span>
                    </div>
                    <span style={{ color: "#FFFFFF" }} className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0A66C2] shadow-md">
                      <Play className="h-3 w-3 fill-current ml-0.5" />
                    </span>
                  </div>

                  {/* Bottom Editorial Serif Headline */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 space-y-0.5">
                    <span style={{ color: "#7DD3FC" }} className="text-[8px] font-extrabold tracking-widest uppercase block">
                      {story.badgeText}
                    </span>
                    <p style={{ color: "#FFFFFF" }} className="font-serif text-[11px] sm:text-xs font-bold leading-snug line-clamp-3 drop-shadow-xs">
                      {story.title}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ===================================================================== */}
      {/* INTERACTIVE STORY / PHOTO / LIVE VIDEO MODAL                          */}
      {/* ===================================================================== */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl space-y-0">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={activeStory.authorAvatar}
                  alt={activeStory.authorName}
                  className="h-9 w-9 rounded-full object-cover border border-zinc-300 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    {activeStory.authorName}
                  </h4>
                  <p className="text-[11px] text-zinc-500 truncate">
                    {activeStory.authorHeadline}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Switch between Professional Photo & Live Video */}
                <button
                  type="button"
                  onClick={() => setViewMode('photo')}
                  className={`rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    viewMode === 'photo'
                      ? "bg-[#0A66C2] text-white"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Photo Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('video')}
                  className={`rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    viewMode === 'video'
                      ? "bg-[#E10600] text-white"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Watch Video ({activeStory.duration})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStory(null)}
                  className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Media Content */}
            {viewMode === 'video' ? (
              <div className="aspect-video w-full bg-black">
                <ConnectLnStudioPlayer
                  youtubeId={activeStory.youtubeId}
                  title={activeStory.title}
                  serialPlate={activeStory.badgeText || "CLN-STORY"}
                  speaker={activeStory.authorName}
                  durationLabel={activeStory.duration}
                  className="h-full w-full"
                />
              </div>
            ) : (
              <div className="relative w-full max-h-[440px] overflow-hidden bg-zinc-950 flex items-center justify-center">
                <img
                  src={activeStory.imageUrl}
                  alt={activeStory.title}
                  className="w-full max-h-[440px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                  <span className="inline-block rounded bg-[#E10600] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                    {activeStory.badgeText}
                  </span>
                  <h3 className="text-base sm:text-xl font-bold leading-snug">
                    {activeStory.title}
                  </h3>
                  <p className="text-xs text-zinc-200">{activeStory.subtitle}</p>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="p-4 bg-white dark:bg-zinc-900 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setLikedIds((prev) => ({ ...prev, [activeStory.id]: !prev[activeStory.id] }))
                  }
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${
                    likedIds[activeStory.id]
                      ? "bg-sky-50 border-[#0A66C2] text-[#0A66C2]"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200"
                  }`}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>{activeStory.likes + (likedIds[activeStory.id] ? 1 : 0)} Likes</span>
                </button>
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {activeStory.comments} comments
                </span>
              </div>

              <div className="flex items-center gap-2">
                {onShareStoryToFeed && (
                  <button
                    type="button"
                    onClick={() => {
                      onShareStoryToFeed(activeStory, viewMode)
                      setSharedBanner(true)
                      setTimeout(() => {
                        setSharedBanner(false)
                        setActiveStory(null)
                      }, 1200)
                    }}
                    className="rounded-full bg-[#0A66C2] hover:bg-[#004182] px-4 py-1.5 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    {sharedBanner ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                    <span>{sharedBanner ? "Shared to Home Feed!" : "Share to Home Feed"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CREATE NEW PROFESSIONAL STORY / FRAMED POSTER MODAL                   */}
      {/* ===================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Publish a Professional Story or Framed Poster Card
              </h4>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStory} className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">LinkedIn Visual Format</label>
                <select
                  value={newStoryStyle}
                  onChange={(e) => setNewStoryStyle(e.target.value as any)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2"
                >
                  <option value="news_portrait">📰 News &amp; Portrait Overlay (Kenya Times / ICJ Style)</option>
                  <option value="poster_frame">📕 Red-Framed Guide Poster (Fisher 7 Income Streams Style)</option>
                  <option value="podium">🎙️ Editorial Podium Keynote (Wall Street Journal Style)</option>
                  <option value="field_action">🎬 Hands-On Field &amp; Clinical Action Reel</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">Headline Overlay</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7 Contract Streams for Verified Engineers & Clinical Leaders"
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">Subtitle / Kicker</label>
                <input
                  type="text"
                  placeholder="e.g. NOV 04, 2026 · LIVE BRIEFING"
                  value={newStorySubtitle}
                  onChange={(e) => setNewStorySubtitle(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">Photo URL</label>
                <input
                  type="url"
                  value={newStoryImageUrl}
                  onChange={(e) => setNewStoryImageUrl(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-full px-4 py-1.5 font-semibold text-zinc-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#0A66C2] px-5 py-1.5 font-bold text-white hover:bg-[#004182] cursor-pointer"
                >
                  Publish Story Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
