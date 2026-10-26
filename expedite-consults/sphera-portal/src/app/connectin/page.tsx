"use client"

import React, { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { ConnectInLogo } from "@/components/brand/ConnectInLogo"
import { LinkedInNavbar } from "@/components/linkedin/LinkedInNavbar"
import { LeftSidebarProfile } from "@/components/linkedin/LeftSidebarProfile"
import { PostCreator } from "@/components/linkedin/PostCreator"
import { FeedPostCard } from "@/components/linkedin/FeedPostCard"
import { RightSidebarNews } from "@/components/linkedin/RightSidebarNews"
import { ProfileView } from "@/components/linkedin/ProfileView"
import { NetworkView } from "@/components/linkedin/NetworkView"
import { JobsView } from "@/components/linkedin/JobsView"
import { MessagingView } from "@/components/linkedin/MessagingView"
import { NotificationsView } from "@/components/linkedin/NotificationsView"
import { FloatingMessagingDock } from "@/components/linkedin/FloatingMessagingDock"

const LearningView = dynamic(
  () => import("@/components/linkedin/LearningView").then((m) => m.LearningView),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-7xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center text-sm font-bold text-zinc-500">
        Loading ConnectLn Learning &amp; Career Mastery Academy...
      </div>
    )
  }
)

const VibeUnifiedCommunicationsView = dynamic(
  () => import("@/components/linkedin/VibeUnifiedCommunicationsView").then((m) => m.VibeUnifiedCommunicationsView),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-7xl rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-zinc-900 p-10 text-center text-sm font-bold text-emerald-600">
        Loading Vibe / DeskNote Next-Gen E2EE Unified Communications Platform...
      </div>
    )
  }
)
import { PulseRoomsView } from "@/components/linkedin/PulseRoomsView"
import { PeerReviewView } from "@/components/linkedin/PeerReviewView"
import { CompensationCalculator } from "@/components/linkedin/CompensationCalculator"
import { ProductLaunchLeaderboard } from "@/components/linkedin/ProductLaunchLeaderboard"
import { WatercoolerBlindView } from "@/components/linkedin/WatercoolerBlindView"
import { AdvisoryMarketplaceView } from "@/components/linkedin/AdvisoryMarketplaceView"
import { StartupVentureView } from "@/components/linkedin/StartupVentureView"
import { CareerSuiteView } from "@/components/linkedin/CareerSuiteView"
import { MarketplaceView } from "@/components/linkedin/MarketplaceView"
import { EcosystemView } from "@/components/linkedin/EcosystemView"
import { CompanyPageView } from "@/components/linkedin/CompanyPageView"
import { SellerCenterView } from "@/components/linkedin/SellerCenterView"
import { TrustCenterView } from "@/components/linkedin/TrustCenterView"
import { EventsView } from "@/components/linkedin/EventsView"
import { ConnectInAIAssistant } from "@/components/linkedin/ConnectInAIAssistant"
import { ProfessionalMissionsView } from "@/components/linkedin/ProfessionalMissionsView"
import { ProcurementRFPView } from "@/components/linkedin/ProcurementRFPView"
import { CollaborationIdeasView } from "@/components/linkedin/CollaborationIdeasView"
import { MentorshipCreatorView } from "@/components/linkedin/MentorshipCreatorView"
import { LabsView } from "@/components/linkedin/LabsView"
import { UniversalSearchModal } from "@/components/linkedin/UniversalSearchModal"
import { MediaView } from "@/components/linkedin/MediaView"
import { AIAgentsStorefrontView } from "@/components/linkedin/AIAgentsStorefrontView"
import { DeveloperCodeView } from "@/components/linkedin/DeveloperCodeView"
import { WalletInvoicingView } from "@/components/linkedin/WalletInvoicingView"
import { ProfessionalIDModal } from "@/components/linkedin/ProfessionalIDModal"
import { GatedGuildsView } from "@/components/linkedin/GatedGuildsView"
import { BountiesHackathonsView } from "@/components/linkedin/BountiesHackathonsView"
import { InboundBountiesModal } from "@/components/linkedin/InboundBountiesModal"
import { AccountSecurityView } from "@/components/linkedin/AccountSecurityView"
import { AdminIAMConsoleView } from "@/components/linkedin/AdminIAMConsoleView"
import { ConnectInAuthModal } from "@/components/linkedin/ConnectInAuthModal"
import { ConnectInAnalyticsModal } from "@/components/linkedin/ConnectInAnalyticsModal"
import { ConnectInVideoWheel } from "@/components/linkedin/ConnectInVideoWheel"
import { ConnectInVideoGuideModal } from "@/components/linkedin/ConnectInVideoGuideModal"
import {
  currentUser as initialCurrentUser,
  initialPosts,
  trendingNews,
  suggestedConnections,
  Post,
  ReactionType,
  SuggestedConnection,
  UserProfile,
  CourseItem
} from "@/lib/linkedin-data"
import {
  loadStoredPosts,
  saveStoredPosts,
  loadStoredUser,
  getExplicitStoredUser,
  saveStoredUser,
  loadStoredConnections,
  saveStoredConnections,
  loadStoredSessionRoute,
  resolveUserProfilePicture
} from "@/lib/connectin-storage"
import { isSuperAdminUser } from "@/lib/connectin-profile"
import { PROFESSION_ENCLAVES, findEnclaveById, findProfessionById } from "@/lib/connectin-professions"
import { getMatchedWheelVideoForUser } from "@/lib/connectin-videos"
import { SlidersHorizontal, Sparkles, Bell, CheckCircle2, ShieldCheck, Filter, Bookmark, Vote, BookOpen, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

export default function LinkedInPage() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<
    | 'home'
    | 'network'
    | 'jobs'
    | 'learning'
    | 'pulserooms'
    | 'peerreview'
    | 'compensation'
    | 'marketplace'
    | 'aiagents'
    | 'code'
    | 'wallet'
    | 'vibecomms'
    | 'guilds'
    | 'bounties'
    | 'accountsecurity'
    | 'adminiam'
    | 'media'
    | 'ecosystem'
    | 'company'
    | 'sellercenter'
    | 'trustcenter'
    | 'events'
    | 'missions'
    | 'procurement'
    | 'collaboration'
    | 'mentorship'
    | 'labs'
    | 'launchpad'
    | 'watercooler'
    | 'advisory'
    | 'startups'
    | 'careersuite'
    | 'messaging'
    | 'notifications'
    | 'profile'
    | 'vibe'
  >('home')

  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  const [isUniversalSearchOpen, setIsUniversalSearchOpen] = useState(false)
  const [isIDModalOpen, setIsIDModalOpen] = useState(false)
  const [isInboundBountiesModalOpen, setIsInboundBountiesModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false)
  const [analyticsModalTab, setAnalyticsModalTab] = useState<'viewers' | 'reach' | 'discoveries'>('viewers')
  const [activeWorkspace, setActiveWorkspace] = useState<'personal' | 'enterprise' | 'creator' | 'seller'>('personal')

  const [userData, setUserData] = useState<UserProfile>(initialCurrentUser)
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [suggestedPeople, setSuggestedPeople] = useState<SuggestedConnection[]>(suggestedConnections)
  const [feedSort, setFeedSort] = useState<'top' | 'recent'>('top')
  const [feedTypeFilter, setFeedTypeFilter] = useState<'all' | 'saved' | 'polls' | 'documents'>('all')
  const [activeFeedCategory, setActiveFeedCategory] = useState<'for_you' | 'products' | 'research' | 'following'>('for_you')
  const [activeFeedSubCategory, setActiveFeedSubCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null)
  const [selectedEnclaves, setSelectedEnclaves] = useState<string[]>(['trades_construction'])
  const [isMultiEnclaveMode, setIsMultiEnclaveMode] = useState<boolean>(true)
  const [isVideoGuideOpen, setIsVideoGuideOpen] = useState(false)
  const [showFeedWheel, setShowFeedWheel] = useState(true)
  const [showMobileWheel, setShowMobileWheel] = useState(false)
  const [showMobileCommunityDrawer, setShowMobileCommunityDrawer] = useState(false)
  const [showMobileSubFilters, setShowMobileSubFilters] = useState(false)
  const [hasHydrated, setHasHydrated] = useState(false)

  // Authentication Lifecycle — optimistic-first, never redirects, shows modal only if truly needed
  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      if (typeof window === "undefined") return

      const urlParams = new URLSearchParams(window.location.search)
      const tabParam = urlParams.get("tab")
      const joinCallParam = urlParams.get("joinCall")
      const resolvedUrlTab =
        joinCallParam || tabParam === "vibecomms"
          ? "vibecomms"
          : tabParam === "careersuite" || tabParam === "resume"
          ? "careersuite"
          : tabParam === "jobs"
          ? "jobs"
          : null
      if (resolvedUrlTab) {
        setActiveTab(resolvedUrlTab as any)
      }

      const isSignedOut = localStorage.getItem("connectin_is_signed_out") === "true"

      // Try to get stored user profile
      const explicitUser = getExplicitStoredUser()
      // Check if user has previously verified (persistent across sessions)
      const hasVerified = localStorage.getItem("connectin_verified") === "true"

      // If an invited friend clicks a live meeting link (?joinCall=...) and has no stored account yet,
      // admit them directly into the meeting room as an Invited Friend Guest without blocking with a login modal!
      if (joinCallParam && !explicitUser) {
        if (isMounted) {
          const guestUser = {
            ...initialCurrentUser,
            id: `guest-${Date.now().toString().slice(-5)}`,
            name: "Invited Friend (Live Guest)",
            headline: "Invited Meeting Participant · VibeChat E2EE",
          }
          setUserData(guestUser)
          setIsAuthenticated(true)
          setIsAuthModalOpen(false)
          setActiveTab("vibecomms")
          setHasHydrated(true)
        }
        return
      }

      // If explicitly signed out, show auth modal immediately
      if (isSignedOut) {
        if (isMounted) {
          setIsAuthenticated(false)
          setIsAuthModalOpen(true)
          setHasHydrated(true)
        }
        return
      }

      if (explicitUser) {
        // Full profile in localStorage — hydrate immediately
        if (isMounted) {
          setIsAuthenticated(true)
          setUserData(explicitUser)
          const savedPosts = loadStoredPosts()
          const savedConnections = loadStoredConnections()
          const savedRoute = loadStoredSessionRoute()
          if (savedPosts && savedPosts.length > 0) setPosts(savedPosts)
          if (savedConnections && savedConnections.length > 0) setSuggestedPeople(savedConnections)
          if (resolvedUrlTab) {
            setActiveTab(resolvedUrlTab as any)
          } else if (savedRoute.tab) {
            setActiveTab(savedRoute.tab as any)
          }
          if (savedRoute.workspace) setActiveWorkspace(savedRoute.workspace)
          setHasHydrated(true)
        }
        // Silently refresh from server — never overwrites user's locally saved avatar, cover photo, or profile edits
        try {
          const meRes = await fetch("/api/connectin/auth/me")
          if (meRes.ok && isMounted) {
            const meData = await meRes.json()
            if (meData.authenticated && meData.profile) {
              const latestExplicit = getExplicitStoredUser() || explicitUser
              const refreshed: UserProfile = {
                ...meData.profile,
                ...latestExplicit,
                email: (latestExplicit as any)?.email || meData.profile.email || meData.user?.email,
                id: (latestExplicit as any)?.id || meData.profile.userId || meData.user?.id || explicitUser.id,
                avatar:
                  latestExplicit.avatar && !latestExplicit.avatar.includes("api.dicebear.com")
                    ? latestExplicit.avatar
                    : meData.profile.avatar || latestExplicit.avatar,
                coverImage:
                  latestExplicit.coverImage && !latestExplicit.coverImage.includes("photo-1550751827-4bd374c3f58b")
                    ? latestExplicit.coverImage
                    : meData.profile.coverImage || latestExplicit.coverImage,
              }
              saveStoredUser(refreshed)
              setUserData(getExplicitStoredUser() || refreshed)
            }
          }
        } catch (e) { /* silent */ }
        return
      }

      if (hasVerified) {
        // User has signed in before but profile data is missing — keep them in, fetch from server
        if (isMounted) {
          setIsAuthenticated(true)
          if (joinCallParam || tabParam === "vibecomms") {
            setActiveTab("vibecomms")
          }
          setHasHydrated(true)
        }
        try {
          const meRes = await fetch("/api/connectin/auth/me")
          if (meRes.ok && isMounted) {
            const meData = await meRes.json()
            if (meData.authenticated && meData.profile) {
              const latestExplicit = getExplicitStoredUser()
              const profile = {
                ...meData.profile,
                ...(latestExplicit || {}),
                email: meData.profile.email || meData.user?.email || "",
                id: meData.profile.userId || meData.user?.id,
              }
              saveStoredUser(profile)
              setUserData(getExplicitStoredUser() || profile)
            }
          }
        } catch (e) { /* silent */ }
        return
      }

      // Hydrate immediately so the page never hangs on "Verifying ConnectIn session..."
      if (isMounted) {
        setHasHydrated(true)
      }

      // No session in localStorage — check server asynchronously with a short timeout
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3500)
        const meRes = await fetch("/api/connectin/auth/me", { signal: controller.signal })
        clearTimeout(timeoutId)
        if (meRes.ok && isMounted) {
          const meData = await meRes.json()
          if (meData.authenticated && meData.profile) {
            localStorage.removeItem("connectin_is_signed_out")
            const latestExplicit = getExplicitStoredUser()
            const profile = {
              ...meData.profile,
              ...(latestExplicit || {}),
              email: meData.profile.email || meData.user?.email || "",
              id: meData.profile.userId || meData.user?.id,
            }
            saveStoredUser(profile)
            setUserData(getExplicitStoredUser() || profile)
            setIsAuthenticated(true)
            if (resolvedUrlTab) {
              setActiveTab(resolvedUrlTab as any)
            }
            const savedPosts = loadStoredPosts()
            const savedConnections = loadStoredConnections()
            if (savedPosts && savedPosts.length > 0) setPosts(savedPosts)
            if (savedConnections && savedConnections.length > 0) setSuggestedPeople(savedConnections)
            return
          }
        }
      } catch (e) {
        console.warn("[Auth] /me check:", e)
      }

      // Default to authenticated guest/member view so https://www.connectln.app/connectin always loads immediately
      if (isMounted) {
        setIsAuthenticated(true)
        setHasHydrated(true)
      }
    }

    initializeAuth()
    return () => { isMounted = false }
  }, [router])

  // Sign out handler: Completely signs out and redirects to login without background
  const handleSignOut = async () => {
    try {
      await fetch("/api/connectin/auth/logout", { method: "POST" })
    } catch (e) {
      // ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("connectin_user_profile")
      localStorage.removeItem("connectin_user_v1")
      localStorage.removeItem("connectin_session_route")
      localStorage.removeItem("connectin_verified")
      localStorage.setItem("connectin_is_signed_out", "true")
      setIsAuthenticated(false)
      window.location.href = "/connectin-login"
    }
  }

  // Persist state changes
  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      saveStoredPosts(posts)
    }
  }, [posts, hasHydrated, isAuthenticated])

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      saveStoredUser(userData)
    }
  }, [userData, hasHydrated, isAuthenticated])

  // Automatically sync the user's active enclave and assigned featured video post to the profession selected at registration
  useEffect(() => {
    if (!userData) return
    if (userData.professionEnclave) {
      setSelectedEnclaves([userData.professionEnclave])
    }
    const matchedTalk = getMatchedWheelVideoForUser(userData)
    if (!matchedTalk) return

    const resolvedPic = resolveUserProfilePicture(userData)
    const ytUrl = `https://www.youtube.com/watch?v=${matchedTalk.youtubeId}`

    setPosts(prev => {
      const updatedPost: Post = {
        id: 'post_dstrike_wheel_masterclass',
        professionEnclave: 'all',
        author: {
          id: userData.id || 'user_current',
          name: userData.name || 'Kwesi Asiedu',
          headline: userData.headline || `${userData.profession || matchedTalk.categoryLabel} · Verified ConnectLn Member`,
          avatar: resolvedPic,
          connectionDegree: 'You',
          isFollowing: false
        },
        timestamp: `Just now · 🎯 Assigned to ${userData.profession || matchedTalk.categoryLabel} · 🌐`,
        visibility: 'Public',
        postType: 'standard',
        feedCategory: 'for_you',
        feedSubCategory: 'All',
        content: `🎬 Assigned Profession Masterclass on ConnectLn The Wheel: "${matchedTalk.title}" (${matchedTalk.serialPlate})\n\n${matchedTalk.summary}`,
        hashtags: matchedTalk.tags && matchedTalk.tags.length > 0 ? matchedTalk.tags : ['#ConnectLn', '#Masterclass', '#RealWork'],
        media: {
          type: 'video',
          url: ytUrl,
          youtubeId: matchedTalk.youtubeId,
          thumbnailUrl: `https://i.ytimg.com/vi/${matchedTalk.youtubeId}/hqdefault.jpg`,
          title: matchedTalk.title,
          description: `${matchedTalk.speaker} · ${matchedTalk.speakerTitle}`,
          duration: matchedTalk.duration,
          serialPlate: matchedTalk.serialPlate,
          brandName: 'ConnectLn',
          takeaways: matchedTalk.takeaways,
          aspectRatio: '16:9'
        },
        stats: {
          likesCount: 412,
          commentsCount: 38,
          repostsCount: 64,
          reactionsBreakdown: { like: 240, celebrate: 92, support: 40, love: 28, insightful: 12, funny: 0 }
        },
        userReaction: null,
        isSaved: false,
        comments: []
      }

      const existingIdx = prev.findIndex(p => p.id === 'post_dstrike_wheel_masterclass')
      if (existingIdx >= 0) {
        const current = prev[existingIdx]
        if (
          current.media?.youtubeId === matchedTalk.youtubeId &&
          current.media?.title === matchedTalk.title &&
          current.author?.name === updatedPost.author.name &&
          current.author?.avatar === updatedPost.author.avatar
        ) {
          return prev
        }
        const copy = [...prev]
        copy[existingIdx] = {
          ...current,
          ...updatedPost,
          stats: current.stats || updatedPost.stats,
          comments: current.comments || []
        }
        return copy
      }
      return [updatedPost, ...prev]
    })
  }, [
    userData?.id,
    userData?.name,
    userData?.headline,
    userData?.avatar,
    userData?.professionId,
    userData?.profession,
    userData?.professionEnclave
  ])

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      saveStoredConnections(suggestedPeople)
    }
  }, [suggestedPeople, hasHydrated, isAuthenticated])

  // Sync live registered users from database into suggested network
  useEffect(() => {
    let isMounted = true

    const syncLiveUsers = async () => {
      try {
        const res = await fetch("/api/connectin/users")
        if (res.ok && isMounted) {
          const data = await res.json()
          if (data.success && Array.isArray(data.users)) {
            const liveSuggested: SuggestedConnection[] = data.users
              .filter((u: any) => u.id !== userData?.id && u.email !== userData?.email && u.name?.toLowerCase() !== userData?.name?.toLowerCase())
              .map((u: any) => {
                const prof = u.professionId ? findProfessionById(u.professionId) : undefined
                const enclaveId = u.professionEnclave || prof?.enclaveId
                const enclave = enclaveId ? findEnclaveById(enclaveId) : undefined

                // Dynamic domain capabilities tailored to profession
                const userSkills: string[] = (u.skills && u.skills.length > 0)
                  ? u.skills
                  : (prof?.typicalSkills && prof.typicalSkills.length > 0)
                    ? prof.typicalSkills
                    : (enclave?.skills && enclave.skills.length > 0)
                      ? enclave.skills.slice(0, 4)
                      : ['Technical Architecture', 'Domain Security', 'Zero Trust', 'Compliance']

                const enclaveBadge = enclave ? `${enclave.icon} ${enclave.shortName} Enclave` : '✓ Verified Member'

                return {
                  id: u.id,
                  name: u.name,
                  headline: u.headline || `${u.profession || 'Specialist'} · ConnectIn Verified Network`,
                  avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}&backgroundColor=0a66c2`,
                  mutualConnections: Math.floor(Math.random() * 25) + 8,
                  capabilities: userSkills.slice(0, 4),
                  verifiedBadges: [enclaveBadge, '✓ 2FA Active'],
                  circle: enclave ? `${enclave.icon} ${enclave.name}` : 'ConnectIn Verified Network',
                  matchScore: 96,
                  isConnected: false,
                  isPending: false
                }
              })

            setSuggestedPeople(prev => {
              const liveMap = new Map(liveSuggested.map(p => [p.id, p]))
              const liveNameMap = new Map(liveSuggested.map(p => [p.name.toLowerCase().trim(), p]))
              
              // Upgrade any existing stale connections with fresh profession data & badges
              const updatedPrev = prev.map(p => {
                const fresh = liveMap.get(p.id) || liveNameMap.get(p.name.toLowerCase().trim())
                if (fresh) {
                  return {
                    ...p,
                    headline: fresh.headline,
                    avatar: fresh.avatar || p.avatar,
                    capabilities: fresh.capabilities,
                    verifiedBadges: fresh.verifiedBadges,
                    circle: fresh.circle
                  }
                }
                return p
              })

              const existingIds = new Set(updatedPrev.map(p => p.id))
              const existingNames = new Set(updatedPrev.map(p => p.name.toLowerCase().trim()))
              const freshUnseen = liveSuggested.filter(
                p => !existingIds.has(p.id) && !existingNames.has(p.name.toLowerCase().trim())
              )
              if (freshUnseen.length === 0 && updatedPrev.every((p, i) => p === prev[i])) return prev
              const merged = [...freshUnseen, ...updatedPrev]
              saveStoredConnections(merged)
              return merged
            })
          }
        }
      } catch (err) {
        console.warn("[Network] Failed to sync live users:", err)
      }
    }

    syncLiveUsers()
    return () => { isMounted = false }
  }, [userData?.id, userData?.email, userData?.name])

  // Handle Post Creation
  const handleAddPost = (newPostData: Omit<Post, 'id' | 'timestamp' | 'stats' | 'comments'>) => {
    const effectiveEnclave = selectedEnclaves[0] && selectedEnclaves[0] !== 'all'
      ? selectedEnclaves[0]
      : (userData.professionEnclave || 'trades_construction')

    const newPost: Post = {
      ...newPostData,
      professionEnclave: newPostData.professionEnclave || effectiveEnclave,
      id: 'post_' + Date.now(),
      timestamp: 'Just now · 🌐',
      stats: {
        likesCount: 1,
        commentsCount: 0,
        repostsCount: 0,
        reactionsBreakdown: {
          like: 1,
          celebrate: 0,
          support: 0,
          love: 0,
          insightful: 0,
          funny: 0
        }
      },
      comments: []
    }

    setPosts(prev => [newPost, ...prev])
  }

  // Share any video from The Wheel or Media Hub directly to the ConnectLn Feed with the user's Profile Picture + ConnectLn Logo Card
  const handleShareWheelVideoToFeed = (video: {
    title: string
    speaker?: string
    speakerTitle?: string
    youtubeId?: string
    thumbnailUrl?: string
    duration?: string
    serialPlate?: string
    summary?: string
    takeaways?: string[]
    tags?: string[]
    enclaveId?: string
  }) => {
    const ytUrl = video.youtubeId ? `https://www.youtube.com/watch?v=${video.youtubeId}` : "https://www.connectln.app/connectin"
    const resolvedPic = resolveUserProfilePicture(userData)
    handleAddPost({
      author: {
        id: userData.id,
        name: userData.name || 'Kwesi Asiedu',
        headline: userData.headline,
        avatar: resolvedPic,
        connectionDegree: 'You',
        isFollowing: false
      },
      professionEnclave: 'all',
      visibility: 'Public',
      content: `🎬 Shared a Masterclass Briefing on ConnectLn The Wheel: "${video.title}"${video.summary ? `\n\n${video.summary}` : ""}`,
      hashtags: video.tags && video.tags.length > 0 ? video.tags : ['#ConnectLn', '#Masterclass', '#RealWork'],
      postType: 'standard',
      media: {
        type: 'video',
        url: ytUrl,
        youtubeId: video.youtubeId,
        thumbnailUrl: video.thumbnailUrl || (video.youtubeId ? `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg` : undefined),
        title: video.title,
        description: video.speaker ? `${video.speaker} · ${video.speakerTitle || ''}` : userData.headline,
        duration: video.duration || '5:00',
        serialPlate: video.serialPlate || 'CLN-VID',
        brandName: 'ConnectLn',
        takeaways: video.takeaways,
        aspectRatio: '16:9'
      },
      userReaction: null,
      isSaved: false
    })
    setActiveTab('home')
  }

  // Handle Reactions (Like, Celebrate, Support, Love, Insightful, Funny)
  const handleToggleReaction = (postId: string, reaction: ReactionType | null) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p

        const oldReaction = p.userReaction
        const breakdown = { ...p.stats.reactionsBreakdown }

        if (oldReaction) {
          breakdown[oldReaction] = Math.max(0, breakdown[oldReaction] - 1)
        }

        if (reaction) {
          breakdown[reaction] = (breakdown[reaction] || 0) + 1
        }

        const likesDiff = (reaction ? 1 : 0) - (oldReaction ? 1 : 0)

        return {
          ...p,
          userReaction: reaction,
          stats: {
            ...p.stats,
            likesCount: p.stats.likesCount + likesDiff,
            reactionsBreakdown: breakdown
          }
        }
      })
    )
  }

  // Handle Comments & Replies
  const handleAddComment = (postId: string, commentText: string, parentCommentId?: string) => {
    const newComment = {
      id: 'c_' + Date.now(),
      author: {
        name: userData.name,
        headline: userData.headline,
        avatar: userData.avatar,
        connectionDegree: 'You' as const
      },
      content: commentText,
      timestamp: 'Just now',
      likesCount: 0,
      isLiked: false
    }

    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p

        if (parentCommentId) {
          return {
            ...p,
            comments: p.comments.map(c => {
              if (c.id === parentCommentId) {
                return {
                  ...c,
                  replies: [...(c.replies || []), newComment]
                }
              }
              return c
            })
          }
        }

        return {
          ...p,
          stats: {
            ...p.stats,
            commentsCount: p.stats.commentsCount + 1
          },
          comments: [newComment, ...p.comments]
        }
      })
    )
  }

  // Handle Poll Vote in Live Feed
  const handleVotePoll = (postId: string, optionId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId || !p.poll) return p
        return {
          ...p,
          poll: {
            ...p.poll,
            totalVotes: p.poll.totalVotes + 1,
            userVotedOptionId: optionId,
            options: p.poll.options.map(opt =>
              opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
            )
          }
        }
      })
    )
  }

  // Handle Post Save
  const handleToggleSave = (postId: string) => {
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, isSaved: !p.isSaved } : p))
    )
  }

  // Handle Connect / Follow Toggles
  const handleToggleConnect = (personId: string) => {
    setSuggestedPeople(prev =>
      prev.map(person => {
        if (person.id !== personId) return person
        if (person.isConnected) {
          return { ...person, isConnected: false, isPending: false }
        }
        if (person.isPending) {
          return { ...person, isPending: false }
        }
        return { ...person, isPending: true }
      })
    )
  }

  // Add Certificate from Learning View to Profile
  const handleAddCertificateToProfile = (course: any) => {
    const certTitle = typeof course === 'string' ? course : (course?.title || 'Professional Certification');
    const newCert = {
      id: 'cert_' + Date.now(),
      title: certTitle,
      issuer: 'ConnectIn Learning',
      issuerLogo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80',
      issueDate: 'Issued Aug 2026',
      credentialId: 'CIN-LEARN-' + Math.floor(100000 + Math.random() * 900000),
      credentialUrl: 'https://connectin.expedite.com/verify'
    }

    setUserData(prev => ({
      ...prev,
      certifications: [newCert, ...(prev.certifications || [])]
    }))
  }

  // Feed Categories Configuration
  const FEED_CATEGORIES = [
    {
      id: 'for_you' as const,
      label: t('stream_for_you', 'For You'),
      icon: '🔥',
      subCategories: ['All', 'AI discussions', 'Cybersecurity', 'Cloud', 'Technology', 'Business', 'Career']
    },
    {
      id: 'products' as const,
      label: t('stream_products', 'Products'),
      icon: '🚀',
      subCategories: ['All', 'Launches', 'Demos', 'Updates', 'Deals', 'New software', 'Recommended solutions']
    },
    {
      id: 'research' as const,
      label: t('stream_research', 'Research'),
      icon: '📑',
      subCategories: ['All', 'Papers', 'Whitepapers', 'Technical reports', 'Case studies']
    },
    {
      id: 'following' as const,
      label: t('stream_following', 'Following'),
      icon: '👥',
      subCategories: ['All', 'People', 'Companies', 'Products', 'Topics']
    }
  ]

  const activeCategoryConfig = FEED_CATEGORIES.find(c => c.id === activeFeedCategory) || FEED_CATEGORIES[0]

  // Filter Posts based on Stream, Sub-category, Search Query, Feed Type, or Tag
  const filteredPosts = posts.filter(post => {
    // 0. Strict Need-to-Know Enclave Segregation (always keep user's own posts and shared video cards visible)
    const isUserOrVideoPost = post.author?.connectionDegree === 'You' || post.media?.type === 'video'
    const isAllSelected = selectedEnclaves.length === 0 || selectedEnclaves.includes('all') || selectedEnclaves.length >= PROFESSION_ENCLAVES.length
    if (!isAllSelected && !isUserOrVideoPost) {
      const postEnclave = post.professionEnclave || 'tech_software'
      if (postEnclave !== 'all' && !selectedEnclaves.includes(postEnclave)) {
        return false
      }
    }

    // 1. Feed Stream Category
    if (activeFeedCategory === 'products') {
      if (post.feedCategory !== 'products' && !post.embeddedProduct && post.postType !== 'product_announcement') return false
    } else if (activeFeedCategory === 'research') {
      if (post.feedCategory !== 'research' && !post.hashtags?.some(h => h.toLowerCase().includes('research') || h.toLowerCase().includes('whitepaper'))) return false
    } else if (activeFeedCategory === 'following') {
      if (post.author.connectionDegree === 'You' || (!post.author.isFollowing && post.author.connectionDegree !== '1st')) return false
    }

    // 2. Sub-Category Filtering
    if (activeFeedSubCategory && activeFeedSubCategory !== 'All') {
      const sub = activeFeedSubCategory.toLowerCase()
      const matchPostSub = post.feedSubCategory?.toLowerCase().includes(sub)
      const matchContent = post.content.toLowerCase().includes(sub)
      const matchHashtags = post.hashtags?.some(h => h.toLowerCase().includes(sub.replace(/\s+/g, '')))
      const matchEmbedded = post.embeddedProduct && (
        post.embeddedProduct.category.toLowerCase().includes(sub) ||
        post.embeddedProduct.name.toLowerCase().includes(sub) ||
        post.embeddedProduct.badge.toLowerCase().includes(sub)
      )
      if (!matchPostSub && !matchContent && !matchHashtags && !matchEmbedded) return false
    }

    // 3. Format Scope Filter
    if (feedTypeFilter === 'saved' && !post.isSaved) return false
    if (feedTypeFilter === 'polls' && post.postType !== 'poll') return false
    if (feedTypeFilter === 'documents' && post.postType !== 'document') return false

    // 4. Tag Filtering
    if (selectedTagFilter) {
      const matchTag = post.hashtags?.some(h =>
        h.toLowerCase().includes(selectedTagFilter.toLowerCase().replace('#', ''))
      )
      if (!matchTag) return false
    }

    // 5. Global Search Filter
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      post.content.toLowerCase().includes(q) ||
      post.author.name.toLowerCase().includes(q) ||
      post.author.headline.toLowerCase().includes(q) ||
      (post.embeddedProduct && (
        post.embeddedProduct.name.toLowerCase().includes(q) ||
        post.embeddedProduct.tagline.toLowerCase().includes(q) ||
        post.embeddedProduct.category.toLowerCase().includes(q)
      ))
    )
  })

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg-core,#f3f2f0)] text-[var(--text-pure,#18181b)] antialiased transition-colors duration-300 selection:bg-[#0A66C2] selection:text-white">
      {/* Top Sticky Navigation */}
      <LinkedInNavbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab as any)
          setSelectedTagFilter(null)
        }}
        user={userData}
        unreadMessagesCount={1}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        suggestedPeople={suggestedPeople}
        onToggleConnect={handleToggleConnect}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        onOpenUniversalSearch={() => setIsUniversalSearchOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenVideoGuide={() => setIsVideoGuideOpen(true)}
        onSignOut={handleSignOut}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={(ws) => {
          setActiveWorkspace(ws)
          if (ws === 'personal') setActiveTab('home')
          else if (ws === 'enterprise') setActiveTab('procurement')
          else if (ws === 'creator') setActiveTab('media')
          else if (ws === 'seller') setActiveTab('sellercenter')
        }}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-3 sm:px-6 pt-5 pb-24 lg:pb-12">
        {/* VIEW 1: HOME FEED */}
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Left Rail (Profile summary & communities on desktop/tablet) */}
            <div className="hidden md:block md:col-span-4 lg:col-span-3">
              <LeftSidebarProfile
                user={userData}
                onViewProfile={() => setActiveTab('profile')}
                onSelectTag={(tag) => {
                  setSelectedTagFilter(tag)
                  setActiveFeedCategory('for_you')
                }}
                onNavigateTab={(tab) => setActiveTab(tab as any)}
                onOpenIDModal={() => setIsIDModalOpen(true)}
                onOpenInboundBountiesModal={() => setIsInboundBountiesModalOpen(true)}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                onOpenAnalytics={(tab) => {
                  setAnalyticsModalTab(tab)
                  setIsAnalyticsModalOpen(true)
                }}
              />
            </div>

            {/* Center Rail (Post Creator & Post Feed) */}
            <div className="md:col-span-8 lg:col-span-6 space-y-3">
              {/* Mobile Quick Profile Header Card (< md) */}
              <div className="md:hidden flex items-center justify-between rounded-2xl border border-zinc-200/90 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2.5 min-w-0 text-left focus:outline-none flex-1 mr-2 cursor-pointer"
                >
                  <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden border border-zinc-300 dark:border-zinc-700">
                    <img src={userData.avatar} alt={userData.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">{userData.name}</p>
                      <ShieldCheck className="h-3.5 w-3.5 text-[#0A66C2] shrink-0" />
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{userData.headline}</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#0A66C2] dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1 text-xs font-semibold shrink-0 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  Profile →
                </button>
              </div>
              {/* Desktop Educational Masterclass Wheel */}
              <div className="hidden sm:block">
                {showFeedWheel ? (
                  <div className="space-y-1">
                    <ConnectInVideoWheel
                      activeEnclaveId={selectedEnclaves[0] || userData?.professionEnclave || 'trades_construction'}
                      user={userData}
                      title="The Wheel — Multi-Profession Masterclasses & Briefings"
                      subtitle="Curated trade apprenticeship standards, software architecture, clinical medicine, and verified field briefings."
                      onOpenVideoGuide={() => setIsVideoGuideOpen(true)}
                      onShareVideoToFeed={handleShareWheelVideoToFeed}
                    />
                    <div className="flex items-center justify-between px-2 pt-0.5 text-[10px] text-zinc-500">
                      <span className="flex items-center gap-1">
                        <span>💡</span>
                        <span>Tap any plate to watch 5-minute video briefing inline</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowFeedWheel(false)}
                        className="hover:underline text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
                      >
                        Hide The Wheel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end pb-1">
                    <button
                      type="button"
                      onClick={() => setShowFeedWheel(true)}
                      className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 shadow-2xs cursor-pointer"
                    >
                      <span>🎡 Show "The Wheel" Video Talks</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Collapsible Wheel Teaser Bar (< sm) */}
              <div className="sm:hidden space-y-2">
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-900/40 shadow-2xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">🎡</span>
                    <div className="min-w-0">
                      <p className="font-bold text-amber-950 dark:text-amber-200 text-xs truncate">The Wheel Masterclasses</p>
                      <p className="text-[10px] text-amber-800/80 dark:text-amber-400/80 truncate">38 verified field briefings & talks</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMobileWheel(!showMobileWheel)}
                    className="shrink-0 ml-2 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-2xs transition-colors cursor-pointer"
                  >
                    {showMobileWheel ? "Hide ▴" : "Watch ▾"}
                  </button>
                </div>
                {showMobileWheel && (
                  <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xs">
                    <ConnectInVideoWheel
                      activeEnclaveId={selectedEnclaves[0] || userData?.professionEnclave || 'trades_construction'}
                      user={userData}
                      title="The Wheel — Masterclasses"
                      subtitle="5-minute verified briefings & standards"
                      onOpenVideoGuide={() => setIsVideoGuideOpen(true)}
                      onShareVideoToFeed={handleShareWheelVideoToFeed}
                    />
                  </div>
                )}
              </div>

              {/* Need-to-Know Enclave Segregation Banner */}
              {(() => {
                const isAdmin = isSuperAdminUser(userData)
                const isAllSelected = selectedEnclaves.length === 0 || selectedEnclaves.includes('all') || selectedEnclaves.length >= PROFESSION_ENCLAVES.length
                const activeEncs = isAllSelected
                  ? PROFESSION_ENCLAVES
                  : (selectedEnclaves.map(id => findEnclaveById(id)).filter(Boolean) as typeof PROFESSION_ENCLAVES)
                
                const primaryEnc = activeEncs[0] || PROFESSION_ENCLAVES[0]

                // Dynamic banner title and subtitle based on selection
                let bannerTitle = primaryEnc.name
                let bannerSubtitle = (userData.professionEnclave === primaryEnc.id && userData.profession)
                  ? `${userData.profession} · Verified Industry Community`
                  : `Verified Professional Community · ${primaryEnc.shortName}`
                let bannerIcon = primaryEnc.icon

                if (isAllSelected) {
                  bannerTitle = "All Professional Communities (12 Disciplines)"
                  bannerSubtitle = "Viewing verified discussions, standards, and opportunities across all 12 industries"
                  bannerIcon = "🌐"
                } else if (activeEncs.length > 1) {
                  bannerTitle = `${activeEncs.map(e => e.shortName).join(' + ')} (${activeEncs.length} Communities)`
                  bannerSubtitle = `Active Industries: ${activeEncs.map(e => e.name).join(' · ')}`
                  bannerIcon = "🤝"
                }

                // Collect aggregated feed tags across active enclaves
                const aggregatedFeedTags = Array.from(new Set(activeEncs.flatMap(e => e.feedTags))).slice(0, 12)

                const handleToggleEnclave = (encId: string) => {
                  if (encId === 'all') {
                    if (isAllSelected) {
                      // Reset to the user's primary enclave
                      setSelectedEnclaves([userData.professionEnclave || 'trades_construction'])
                    } else {
                      // Select all enclaves
                      setSelectedEnclaves(PROFESSION_ENCLAVES.map(e => e.id))
                    }
                    return
                  }

                  if (isAllSelected) {
                    // Coming from "All", clicking an individual one focuses on just that one
                    setSelectedEnclaves([encId])
                    return
                  }

                  setSelectedEnclaves(prev => {
                    if (prev.includes(encId)) {
                      // Don't deselect if it's the only one selected
                      if (prev.length <= 1) return prev
                      return prev.filter(id => id !== encId)
                    } else {
                      return [...prev, encId]
                    }
                  })
                }

                return (
                  <>
                    {/* Desktop Need-to-Know Enclave Segregation Banner (sm+) */}
                    <div className="hidden sm:block rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2.5 shadow-xs transition-all">
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0A66C2] dark:text-sky-300 border border-blue-100 dark:border-blue-900/50 shadow-2xs shrink-0">
                            {bannerIcon}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                                {bannerTitle}
                              </h2>
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 text-[10px] font-semibold text-[#0A66C2] dark:text-sky-300 border border-blue-200/50 dark:border-blue-800/50">
                                <ShieldCheck className="h-3 w-3" />
                                Verified Community
                              </span>
                              {activeEncs.length > 1 && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                                  {isAllSelected ? "All 12 Highlighted" : `${activeEncs.length} Highlighted`}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                              {bannerSubtitle}
                            </p>
                          </div>
                        </div>

                        {/* Community Posts Count Tag */}
                        <div className="shrink-0 text-right">
                          <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
                            {filteredPosts.length} {t("enclave_posts", "Community Posts")}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        ✨ <strong>Community Focus:</strong> Discussions, trade updates, blueprints, and opportunities are tailored to your professional craft. Explore conversations across any industry anytime.
                      </p>

                      {/* Community Feed Tags */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 shrink-0">Tags:</span>
                        {aggregatedFeedTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setSelectedTagFilter(tag)}
                            className="text-[11px] font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-2.5 py-0.5 rounded-full border border-zinc-200/70 dark:border-zinc-700/70 shrink-0 cursor-pointer transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>

                      {/* Community Switcher */}
                      {isAdmin && (
                        <div className="mt-2 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                                🌐 Switch Industry Community:
                              </span>
                              <span className="text-[10px] text-zinc-500 font-medium">
                                (Tap to filter posts)
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <button
                                type="button"
                                onClick={() => setSelectedEnclaves(PROFESSION_ENCLAVES.map(e => e.id))}
                                className="font-semibold text-[#0A66C2] hover:underline cursor-pointer"
                              >
                                Show All 12
                              </button>
                              <span className="text-zinc-300 dark:text-zinc-700">·</span>
                              <button
                                type="button"
                                onClick={() => setSelectedEnclaves([userData.professionEnclave || 'trades_construction'])}
                                className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:underline cursor-pointer"
                              >
                                Reset
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                            {PROFESSION_ENCLAVES.map(e => {
                              const isSelected = isAllSelected || selectedEnclaves.includes(e.id)
                              return (
                                <button
                                  key={e.id}
                                  type="button"
                                  onClick={() => handleToggleEnclave(e.id)}
                                  title={`Toggle ${e.name}`}
                                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                                    isSelected
                                      ? "bg-[#0A66C2] text-white font-semibold shadow-xs"
                                      : "bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200/70 dark:border-zinc-700/70"
                                  }`}
                                >
                                  <span>{e.icon}</span>
                                  <span>{e.shortName}</span>
                                  {isSelected && <span className="text-[10px]">✓</span>}
                                </button>
                              )
                            })}
                            <button
                              type="button"
                              onClick={() => handleToggleEnclave('all')}
                              title="View all 12 communities"
                              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                                isAllSelected
                                  ? "bg-[#0A66C2] text-white font-semibold shadow-xs"
                                  : "bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200/70 dark:border-zinc-700/70"
                              }`}
                            >
                              <span>🌐</span>
                              <span>{t("all_enclaves", "All Communities")}</span>
                              {isAllSelected && <span className="text-[10px]">✓</span>}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mobile Streamlined Community Bar (< sm) */}
                    <div className="sm:hidden rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 shadow-xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-xl p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#0A66C2] dark:text-sky-300 border border-blue-100 dark:border-blue-900/50 shrink-0">
                            {bannerIcon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                              <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                {bannerTitle}
                              </h2>
                              <ShieldCheck className="h-3.5 w-3.5 text-[#0A66C2] shrink-0" />
                            </div>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                              {filteredPosts.length} posts · {bannerSubtitle}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowMobileCommunityDrawer(!showMobileCommunityDrawer)}
                          className={`shrink-0 flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                            showMobileCommunityDrawer
                              ? "bg-[#0A66C2] text-white border-[#0A66C2]"
                              : "bg-zinc-50 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
                          }`}
                        >
                          <span>Switch</span>
                          <ChevronDown className={`h-3 w-3 transition-transform ${showMobileCommunityDrawer ? "rotate-180" : ""}`} />
                        </button>
                      </div>

                      {/* Mobile Community Collapsible Drawer */}
                      {showMobileCommunityDrawer && (
                        <div className="mt-2.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
                          {/* Mobile Feed Tags */}
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Focus Topics</p>
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                              {aggregatedFeedTags.map((tag) => (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => {
                                    setSelectedTagFilter(selectedTagFilter === tag ? null : tag)
                                    setShowMobileCommunityDrawer(false)
                                  }}
                                  className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border shrink-0 transition-colors cursor-pointer ${
                                    selectedTagFilter === tag
                                      ? "bg-[#0A66C2] text-white border-[#0A66C2] font-semibold"
                                      : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200/70 dark:border-zinc-700/70"
                                  }`}
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Mobile Community Switcher */}
                          {isAdmin && (
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Switch Industry</p>
                                <div className="flex items-center gap-2 text-[10px]">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedEnclaves(PROFESSION_ENCLAVES.map(e => e.id))}
                                    className="font-bold text-[#0A66C2] hover:underline cursor-pointer"
                                  >
                                    All 12
                                  </button>
                                  <span className="text-zinc-300 dark:text-zinc-700">·</span>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedEnclaves([userData.professionEnclave || 'trades_construction'])}
                                    className="text-zinc-500 hover:underline cursor-pointer"
                                  >
                                    Reset
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5">
                                {PROFESSION_ENCLAVES.map(e => {
                                  const isSelected = isAllSelected || selectedEnclaves.includes(e.id)
                                  return (
                                    <button
                                      key={e.id}
                                      type="button"
                                      onClick={() => handleToggleEnclave(e.id)}
                                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all text-left truncate cursor-pointer ${
                                        isSelected
                                          ? "bg-blue-50 text-[#0A66C2] border border-blue-200 dark:bg-blue-950/40 dark:text-sky-300 dark:border-blue-800 font-semibold"
                                          : "bg-zinc-50 text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60"
                                      }`}
                                    >
                                      <span className="shrink-0">{e.icon}</span>
                                      <span className="truncate flex-1">{e.shortName}</span>
                                      {isSelected && <span className="text-[#0A66C2] dark:text-sky-300 text-[10px] font-bold">✓</span>}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )
              })()}

              {/* 1. PRIMARY MULTI-STREAM FEED CATEGORY TABS */}
              <div className="rounded-xl border border-zinc-200 bg-white p-2 sm:p-2.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between gap-1">
                  {/* Category stream tabs */}
                  <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto flex-1">
                    {FEED_CATEGORIES.map((cat) => {
                      const isSelected = activeFeedCategory === cat.id
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setActiveFeedCategory(cat.id)
                            setActiveFeedSubCategory('All')
                          }}
                          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                            isSelected
                              ? "bg-[#0A66C2] text-white shadow-2xs"
                              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Mobile Sub-Category Filter Toggle Button */}
                  <div className="sm:hidden shrink-0 ml-1">
                    <button
                      type="button"
                      onClick={() => setShowMobileSubFilters(!showMobileSubFilters)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                        activeFeedSubCategory !== 'All'
                          ? "bg-blue-50 text-[#0A66C2] border-blue-200 dark:bg-blue-950/40 dark:text-sky-300 dark:border-blue-800"
                          : showMobileSubFilters
                          ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700"
                          : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 border-transparent"
                      }`}
                      title="Filter sub-topics"
                    >
                      <Filter className="h-3 w-3" />
                      {activeFeedSubCategory !== 'All' ? (
                        <span className="truncate max-w-[64px]">{activeFeedSubCategory}</span>
                      ) : (
                        <span>Filter</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Mobile Sub-Category Ribbon (Collapsible, shown when toggled or active filter) */}
                {(showMobileSubFilters || activeFeedSubCategory !== 'All') && (
                  <div className="sm:hidden pt-2 mt-1.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                    <span className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider shrink-0 mr-1">
                      {t("filter_label", "Filter:")}
                    </span>
                    {activeCategoryConfig.subCategories.map((sub) => {
                      const isSelected = activeFeedSubCategory === sub
                      return (
                        <button
                          key={sub}
                          onClick={() => setActiveFeedSubCategory(sub)}
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                            isSelected
                              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold"
                              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          {sub}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Desktop Sub-Category Ribbon (Always visible on sm+) */}
                <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto text-[11px] pt-2 mt-1.5 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider shrink-0 mr-1">
                    {t("filter_label", "Filter:")}
                  </span>
                  {activeCategoryConfig.subCategories.map((sub) => {
                    const isSelected = activeFeedSubCategory === sub
                    return (
                      <button
                        key={sub}
                        onClick={() => setActiveFeedSubCategory(sub)}
                        className={`rounded-full px-2.5 py-0.5 font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                          isSelected
                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {sub}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Filter Active Badge if Tag is selected */}
              {selectedTagFilter && (
                <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-sky-50 px-4 py-2 text-xs font-semibold text-[#0A66C2] dark:border-blue-900/50 dark:bg-sky-950/30">
                  <span>{t("filtered_by", "Filtered by:")} {selectedTagFilter}</span>
                  <button
                    onClick={() => setSelectedTagFilter(null)}
                    className="hover:underline text-zinc-600 dark:text-zinc-300"
                  >
                    {t("clear_filter", "Clear filter")}
                  </button>
                </div>
              )}

              {/* "Start a post" Creator */}
              <PostCreator user={userData} onAddPost={handleAddPost} />

              {/* Feed Sort & Separator */}
              <div className="flex items-center justify-between py-1 px-1 text-xs text-zinc-500 dark:text-zinc-400">
                <div className="h-[1px] flex-1 bg-zinc-300 dark:bg-zinc-800 mr-3" />
                <div className="flex items-center gap-1.5 shrink-0">
                  <span>{t("sort_by", "Sort by:")}</span>
                  <button
                    onClick={() => setFeedSort(feedSort === 'top' ? 'recent' : 'top')}
                    className="font-bold text-zinc-900 hover:text-[#0A66C2] dark:text-zinc-100 flex items-center gap-1"
                  >
                    {feedSort === 'top' ? t("sort_top", "Top") : t("sort_recent", "Recent")}
                    <SlidersHorizontal className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Feed Posts */}
              <div className="space-y-3">
                {filteredPosts.map((post) => (
                  <FeedPostCard
                    key={post.id}
                    post={post}
                    currentUser={userData}
                    onToggleReaction={handleToggleReaction}
                    onAddComment={handleAddComment}
                    onToggleSave={handleToggleSave}
                    onVotePoll={handleVotePoll}
                  />
                ))}

                {filteredPosts.length === 0 && (
                  <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                      {t("no_posts_found", "No posts found in this filter.")}
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("")
                        setFeedTypeFilter('all')
                        setSelectedTagFilter(null)
                      }}
                      className="mt-2 text-xs font-semibold text-[#0A66C2] hover:underline"
                    >
                      {t("reset_filters", "Reset filters")}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Rail (ConnectIn News & Follow Suggestions) */}
            <div className="hidden lg:block lg:col-span-3">
              <RightSidebarNews
                news={trendingNews}
                suggestedPeople={suggestedPeople}
                onToggleConnect={handleToggleConnect}
                onNewsClick={(headline) => setSearchQuery(headline.slice(0, 15))}
                onNavigateTab={(tab) => setActiveTab(tab as any)}
                onOpenAIAssistant={(query) => {
                  if (query) setSearchQuery(query)
                  setIsAIAssistantOpen(true)
                }}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: MY WORKSPACE (PROFILE, PORTFOLIO, SKILLS, PRODUCTS) */}
        {activeTab === 'profile' && (
          <ProfileView
            user={userData}
            onBackToFeed={() => setActiveTab('home')}
            onNavigateMarketplace={() => setActiveTab('marketplace')}
            onNavigateJobs={(searchKeyword) => {
              if (searchKeyword) setSearchQuery(searchKeyword)
              setActiveTab('jobs')
            }}
            onUpdateUser={(updated) => setUserData(updated)}
            onOpenAnalytics={(tab) => {
              setAnalyticsModalTab(tab)
              setIsAnalyticsModalOpen(true)
            }}
            onNavigateMessaging={(person) => setActiveTab('messaging')}
          />
        )}

        {/* VIEW 3: MY NETWORK */}
        {activeTab === 'network' && (
          <NetworkView
            suggestedPeople={suggestedPeople}
            onToggleConnect={handleToggleConnect}
            currentUser={userData}
            onNavigateMessaging={(person) => setActiveTab('messaging')}
            onUpdateConnectionsCount={(newCount) => setUserData(prev => ({ ...prev, connectionsCount: newCount }))}
          />
        )}

        {/* VIEW 4: JOBS VIEW */}
        {activeTab === 'jobs' && (
          <JobsView
            currentUser={userData}
            onNavigateCareerSuite={() => setActiveTab('careersuite')}
            onNavigateLearning={() => setActiveTab('learning')}
            onNavigateMarketplace={() => setActiveTab('marketplace')}
            onJobPublished={(newJob) => {
              const feedPost: FeedPost = {
                id: 'job_post_' + Date.now(),
                author: {
                  id: userData.id || 'u_employer',
                  name: newJob.company || userData.name,
                  headline: `${newJob.countryName || 'Global'} · Verified Hiring Partner`,
                  avatar: userData.avatar,
                  isVerified: true,
                  connectionDegree: '1st'
                },
                timestamp: 'Just published · Synced live',
                content: `🚨 [Hiring Now — Immediate Sync] We just published a new opening for ${newJob.title} at ${newJob.company} (${newJob.location})!\n\n💰 Compensation: ${newJob.salaryRange || 'Competitive'}\n🏢 Workplace: ${newJob.workplaceType || 'Hybrid'} · ${newJob.employmentType || 'Full-time'}\n🛡️ Key Credentials / Skills: ${(newJob.tags || []).join(', ')}\n\n${newJob.description || ''}\n\nApply directly in the ConnectLn Jobs tab! #Hiring #ConnectLnJobs #${(newJob.professionEnclave || 'Careers').replace(/[^a-zA-Z0-9]/g, '')}`,
                tags: ['Hiring', ...(newJob.tags || []).slice(0, 3)],
                likes: 1,
                comments: 0,
                reposts: 0,
                isLiked: false,
                commentsList: []
              }
              setPosts(prev => {
                const updated = [feedPost, ...prev]
                saveStoredPosts(updated)
                return updated
              })
            }}
          />
        )}

        {/* VIEW 5: LEARNING VIEW */}
        {activeTab === 'learning' && (
          <LearningView
            user={userData}
            onAddCertificateToProfile={handleAddCertificateToProfile}
            onNavigateMarketplace={() => setActiveTab('marketplace')}
          />
        )}

        {/* VIEW 6: PULSE ROOMS (LIVE AUDIO) */}
        {activeTab === 'pulserooms' && (
          <PulseRoomsView
            currentUser={userData}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* VIEW 7: PEER REVIEW EXCHANGE */}
        {activeTab === 'peerreview' && (
          <PeerReviewView currentUser={userData} />
        )}

        {/* VIEW 8: SALARY INSIGHTS & COMPENSATION INTELLIGENCE */}
        {activeTab === 'compensation' && (
          <CompensationCalculator
            onNavigateJobs={(searchKeyword) => {
              if (searchKeyword) setSearchQuery(searchKeyword)
              setActiveTab('jobs')
            }}
          />
        )}

        {/* VIEW 9: APP & SOLUTIONS MARKETPLACE */}
        {activeTab === 'marketplace' && (
          <MarketplaceView
            currentUser={userData}
            onLaunchCareerSuite={() => setActiveTab('careersuite')}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* VIEW: AUTONOMOUS AI AGENTS MARKETPLACE */}
        {activeTab === 'aiagents' && (
          <AIAgentsStorefrontView
            currentUser={userData}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* VIEW: CONNECTIN CODE & REPOSITORIES */}
        {activeTab === 'code' && (
          <DeveloperCodeView
            currentUser={userData}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* VIEW: CONNECTIN PAY, WALLET & INVOICING */}
        {activeTab === 'wallet' && (
          <WalletInvoicingView
            currentUser={userData}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* VIEW: VIBE / DESKNOTE NEXT-GEN WHATSAPP+ UNIFIED COMMUNICATIONS */}
        {activeTab === 'vibecomms' && (
          <VibeUnifiedCommunicationsView
            currentUser={userData}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
            onOpenVibeCampus={() => setActiveTab('careersuite')}
          />
        )}

        {/* VIEW: GATED GUILDS & PRIVATE ENCLAVES */}
        {activeTab === 'guilds' && (
          <GatedGuildsView
            currentUser={userData}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* VIEW: ENTERPRISE BOUNTIES & HACKATHONS */}
        {activeTab === 'bounties' && (
          <BountiesHackathonsView
            currentUser={userData}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* VIEW: USER ACCOUNT SECURITY & PASSKEYS CENTER */}
        {activeTab === 'accountsecurity' && (
          <AccountSecurityView
            currentUser={userData}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* VIEW: ADMINISTRATIVE IAM & MODERATION CONSOLE (STRICT ZERO-TRUST ROLE GUARD) */}
        {activeTab === 'adminiam' && (
          isSuperAdminUser(userData) ? (
            <AdminIAMConsoleView
              currentUser={userData}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
            />
          ) : (
            <div className="rounded-3xl border border-red-200 dark:border-red-900/60 bg-white dark:bg-zinc-900 p-8 sm:p-12 text-center max-w-2xl mx-auto my-12 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="h-16 w-16 rounded-3xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto text-3xl font-bold shadow-inner">
                🔒
              </div>
              <div className="space-y-1">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                  403 Forbidden · Zero-Trust Policy
                </span>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  Access Denied: Least-Privilege Enclave
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                  Administrative consoles and platform governance tools are strictly restricted to verified platform administrators. Standard member accounts have isolated access.
                </p>
              </div>
              <div className="pt-3 flex items-center justify-center gap-3">
                <button
                  onClick={() => setActiveTab('home')}
                  className="rounded-full bg-[#0A66C2] text-white px-6 py-2.5 text-xs font-bold hover:bg-[#004182] transition-colors shadow-sm cursor-pointer"
                >
                  Return to Home Workspace
                </button>
              </div>
            </div>
          )
        )}

        {/* VIEW: CONNECTIN MEDIA & VIDEO PLATFORM */}
        {activeTab === 'media' && (
          <MediaView
            currentUser={userData}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
            onShareVideoToFeed={handleShareWheelVideoToFeed}
          />
        )}

        {/* VIEW 9.5: ENTERPRISE ECOSYSTEM (DEVELOPERS, INTEGRATIONS, PARTNERS, APPS) */}
        {activeTab === 'ecosystem' && (
          <EcosystemView
            currentUser={userData}
            onNavigateMarketplace={() => setActiveTab('marketplace')}
            onNavigateCommunityChat={() => setActiveTab('messaging')}
          />
        )}

        {/* VIEW: COMPANY PAGE (EXPEDITE CONSULTS) */}
        {activeTab === 'company' && (
          <CompanyPageView
            currentUser={userData}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* VIEW: SELLER CENTER & REVENUE OPERATIONS */}
        {activeTab === 'sellercenter' && (
          <SellerCenterView
            currentUser={userData}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* VIEW: TRUST & COMPLIANCE CENTER */}
        {activeTab === 'trustcenter' && (
          <TrustCenterView
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* VIEW: EVENTS & LIVE DEMO HUBS */}
        {activeTab === 'events' && (
          <EventsView
            currentUser={userData}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* VIEW: CAREER MISSIONS & PROGRESSION */}
        {activeTab === 'missions' && (
          <ProfessionalMissionsView
            currentUser={userData}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* VIEW: CORPORATE PROCUREMENT & RFPS */}
        {activeTab === 'procurement' && (
          <ProcurementRFPView
            currentUser={userData}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* VIEW: COLLABORATION & IDEAS INCUBATOR */}
        {activeTab === 'collaboration' && (
          <CollaborationIdeasView
            currentUser={userData}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* VIEW: MENTORSHIP & CREATOR ECONOMY */}
        {activeTab === 'mentorship' && (
          <MentorshipCreatorView
            currentUser={userData}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* VIEW: INTERACTIVE DEFENSE LABS */}
        {activeTab === 'labs' && (
          <LabsView
            currentUser={userData}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* VIEW 10: LAUNCHPAD (PRODUCT HUNT STYLE) */}
        {activeTab === 'launchpad' && (
          <ProductLaunchLeaderboard
            currentUser={userData}
            onNavigateMarketplace={() => setActiveTab('marketplace')}
          />
        )}

        {/* VIEW 11: WATERCOOLER (BLIND ANONYMOUS CHANNELS) */}
        {activeTab === 'watercooler' && (
          <WatercoolerBlindView currentUser={userData} />
        )}

        {/* VIEW 12: FRACTIONAL ADVISORY MARKETPLACE */}
        {activeTab === 'advisory' && (
          <AdvisoryMarketplaceView currentUser={userData} />
        )}

        {/* VIEW 13: STARTUP & VENTURE MATCHMAKER */}
        {activeTab === 'startups' && (
          <StartupVentureView currentUser={userData} />
        )}

        {/* VIEW 14: EXPEDITE CAREERSUITE (AI RESUME & PROFILE MAXIMIZER) */}
        {activeTab === 'careersuite' && (
          <CareerSuiteView currentUser={userData} />
        )}

        {/* VIEW 15: B2B MESSAGING PLATFORM */}
        {activeTab === 'messaging' && (
          <MessagingView
            currentUser={userData}
            onNavigateMarketplace={() => setActiveTab('marketplace')}
            onNavigateJobs={() => setActiveTab('jobs')}
            onNavigateVibeComms={() => setActiveTab('vibecomms')}
          />
        )}

        {/* VIEW 16: CATEGORIZED NOTIFICATIONS HUB */}
        {activeTab === 'notifications' && (
          <NotificationsView onNavigateTab={(tab) => setActiveTab(tab as any)} />
        )}

        {/* VIEW 17: VIBE AI UNIFIED AUDIO/VIDEO STUDIO & CAREER HUB */}
        {activeTab === 'vibe' && (
          <VibeUnifiedCommunicationsView
            currentUser={userData}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
            onOpenVibeCampus={() => setIsAIAssistantOpen(true)}
          />
        )}
      </main>

      {/* Floating "Ask Vibe AI" Quick Launcher Pill - LinkedIn Human Floating Helper */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setIsAIAssistantOpen(true)}
          className="flex items-center gap-2.5 rounded-full bg-white dark:bg-[#1B1F23] text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 shadow-lg hover:shadow-xl hover:border-[#0A66C2] px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer group"
          title="Ask Vibe AI anything (Cyber, Engineering, Career, Tools)"
        >
          <div className="h-6 w-6 rounded-full bg-[#FBF5E9] dark:bg-amber-950/40 flex items-center justify-center text-[#C88A24] dark:text-amber-300 border border-[#C88A24]/30">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold tracking-tight">Ask Vibe AI</span>
          <span className="hidden sm:inline text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
            Q&amp;A
          </span>
        </button>
      </div>

      {/* Signature Persistent Floating Bottom-Right Messaging Dock */}
      <FloatingMessagingDock
        currentUser={userData}
        onOpenFullMessaging={() => setActiveTab('messaging')}
      />

      {/* ConnectIn AI Global Platform Assistant Modal */}
      <ConnectInAIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        currentUser={userData}
        onNavigateTab={(tab) => setActiveTab(tab as any)}
      />

      {/* ConnectIn Universal Omnisearch Modal */}
      <UniversalSearchModal
        isOpen={isUniversalSearchOpen}
        onClose={() => setIsUniversalSearchOpen(false)}
        initialQuery={searchQuery}
        currentUser={userData}
        onNavigateTab={(tab) => setActiveTab(tab as any)}
      />

      {/* ConnectIn Portable Professional ID Modal */}
      <ProfessionalIDModal
        isOpen={isIDModalOpen}
        onClose={() => setIsIDModalOpen(false)}
        currentUser={userData}
      />

      {/* ConnectIn $250 Paid Inbound Recruiter Bounties Modal */}
      <InboundBountiesModal
        isOpen={isInboundBountiesModalOpen}
        onClose={() => setIsInboundBountiesModalOpen(false)}
        currentUser={userData}
        onNavigateTab={(tab) => setActiveTab(tab as any)}
      />

      {/* ConnectIn Role-Aware Identity & Auth Portal Gate Modal */}
      <ConnectInAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(authenticatedUser, targetTab, targetWorkspace) => {
          setUserData(authenticatedUser)
          setActiveWorkspace(targetWorkspace)
          setActiveTab(targetTab as any)
          setIsAuthenticated(true)
          setIsAuthModalOpen(false)
        }}
      />

      {/* ConnectIn Analytics & Network Intelligence Modal (Profile Viewers, Content Reach, Directory Discoveries) */}
      <ConnectInAnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        initialTab={analyticsModalTab}
        currentUser={userData}
        onNavigateMessaging={(personName) => {
          setActiveTab('messaging')
        }}
        onNavigateTab={(tab) => setActiveTab(tab as any)}
      />

      {/* Interactive Platform Video Guide & Masterclasses Modal */}
      <ConnectInVideoGuideModal
        isOpen={isVideoGuideOpen}
        onClose={() => setIsVideoGuideOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab as any)
          setIsVideoGuideOpen(false)
        }}
        onOpenResumeBuilder={() => {
          setIsVideoGuideOpen(false)
          setActiveTab('profile')
        }}
        onOpenAIAssistant={() => {
          setIsVideoGuideOpen(false)
          setIsAIAssistantOpen(true)
        }}
        onSelectWorkspace={(ws) => {
          setActiveWorkspace(ws)
          if (ws === 'personal') setActiveTab('home')
          else if (ws === 'enterprise') setActiveTab('procurement')
          else if (ws === 'creator') setActiveTab('media')
          else if (ws === 'seller') setActiveTab('sellercenter')
          setIsVideoGuideOpen(false)
        }}
      />
    </div>
  )
}
