"use client"

import React, { useState, useEffect } from "react"
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
import { LearningView } from "@/components/linkedin/LearningView"
import { NotificationsView } from "@/components/linkedin/NotificationsView"
import { FloatingMessagingDock } from "@/components/linkedin/FloatingMessagingDock"
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
  loadStoredSessionRoute
} from "@/lib/connectin-storage"
import { isSuperAdminUser } from "@/lib/connectin-profile"
import { SlidersHorizontal, Sparkles, Bell, CheckCircle2, ShieldCheck, Filter, Bookmark, Vote, BookOpen } from "lucide-react"

export default function LinkedInPage() {
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
  const [hasHydrated, setHasHydrated] = useState(false)

  // Authentication Lifecycle — optimistic-first, never redirects, shows modal only if truly needed
  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      if (typeof window === "undefined") return

      const isSignedOut = localStorage.getItem("connectin_is_signed_out") === "true"

      // If explicitly signed out, show auth modal immediately
      if (isSignedOut) {
        if (isMounted) {
          setIsAuthenticated(false)
          setIsAuthModalOpen(true)
          setHasHydrated(true)
        }
        return
      }

      // Try to get stored user profile
      const explicitUser = getExplicitStoredUser()
      // Check if user has previously verified (persistent across sessions)
      const hasVerified = localStorage.getItem("connectin_verified") === "true"

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
          if (savedRoute.tab) setActiveTab(savedRoute.tab as any)
          if (savedRoute.workspace) setActiveWorkspace(savedRoute.workspace)
          setHasHydrated(true)
        }
        // Silently refresh from server — never triggers modal or redirect
        try {
          const meRes = await fetch("/api/connectin/auth/me")
          if (meRes.ok && isMounted) {
            const meData = await meRes.json()
            if (meData.authenticated && meData.profile) {
              const refreshed = {
                ...meData.profile,
                email: meData.profile.email || meData.user?.email || (explicitUser as any)?.email,
                id: meData.profile.userId || meData.user?.id || (explicitUser as any)?.id || (explicitUser as any)?.userId || explicitUser.id,
              }
              saveStoredUser(refreshed)
              setUserData(refreshed)
            }
          }
        } catch (e) { /* silent */ }
        return
      }

      if (hasVerified) {
        // User has signed in before but profile data is missing — keep them in, fetch from server
        if (isMounted) {
          setIsAuthenticated(true)
          setHasHydrated(true)
        }
        try {
          const meRes = await fetch("/api/connectin/auth/me")
          if (meRes.ok && isMounted) {
            const meData = await meRes.json()
            if (meData.authenticated && meData.profile) {
              const profile = {
                ...meData.profile,
                email: meData.profile.email || meData.user?.email || "",
                id: meData.profile.userId || meData.user?.id,
              }
              saveStoredUser(profile)
              setUserData(profile)
            }
          }
        } catch (e) { /* silent */ }
        return
      }

      // No session anywhere — check server one more time (NextAuth OAuth)
      try {
        const meRes = await fetch("/api/connectin/auth/me")
        if (meRes.ok && isMounted) {
          const meData = await meRes.json()
          if (meData.authenticated && meData.profile) {
            localStorage.removeItem("connectin_is_signed_out")
            const profile = {
              ...meData.profile,
              email: meData.profile.email || meData.user?.email || "",
              id: meData.profile.userId || meData.user?.id,
            }
            saveStoredUser(profile)
            setUserData(profile)
            setIsAuthenticated(true)
            setHasHydrated(true)
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

      // Truly no session — show modal in-page (no redirect)
      if (isMounted) {
        setIsAuthenticated(false)
        setIsAuthModalOpen(true)
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
              .map((u: any) => ({
                id: u.id,
                name: u.name,
                headline: u.headline || `${u.role ? u.role.toUpperCase() : 'Member'} · ConnectIn Verified Network`,
                avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}&backgroundColor=0a66c2`,
                mutualConnections: Math.floor(Math.random() * 25) + 8,
                capabilities: ['Cloud Security', 'GovCloud', 'Zero Trust', 'Compliance'],
                verifiedBadges: ['✓ Verified Member', '✓ 2FA Active'],
                circle: 'ConnectIn Verified Network',
                matchScore: 96,
                isConnected: false,
                isPending: false
              }))

            setSuggestedPeople(prev => {
              const existingIds = new Set(prev.map(p => p.id))
              const existingNames = new Set(prev.map(p => p.name.toLowerCase().trim()))
              const fresh = liveSuggested.filter(
                p => !existingIds.has(p.id) && !existingNames.has(p.name.toLowerCase().trim())
              )
              if (fresh.length === 0) return prev
              const merged = [...fresh, ...prev]
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
    const newPost: Post = {
      ...newPostData,
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

    setPosts([newPost, ...posts])
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
      label: 'For You',
      icon: '🔥',
      subCategories: ['All', 'AI discussions', 'Cybersecurity', 'Cloud', 'Technology', 'Business', 'Career']
    },
    {
      id: 'products' as const,
      label: 'Products',
      icon: '🚀',
      subCategories: ['All', 'Launches', 'Demos', 'Updates', 'Deals', 'New software', 'Recommended solutions']
    },
    {
      id: 'research' as const,
      label: 'Research',
      icon: '📑',
      subCategories: ['All', 'Papers', 'Whitepapers', 'Technical reports', 'Case studies']
    },
    {
      id: 'following' as const,
      label: 'Following',
      icon: '👥',
      subCategories: ['All', 'People', 'Companies', 'Products', 'Topics']
    }
  ]

  const activeCategoryConfig = FEED_CATEGORIES.find(c => c.id === activeFeedCategory) || FEED_CATEGORIES[0]

  // Filter Posts based on Stream, Sub-category, Search Query, Feed Type, or Tag
  const filteredPosts = posts.filter(post => {
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

  if (isAuthenticated === null && !hasHydrated) {
    return (
      <div className="min-h-screen bg-[#F4F2EE] dark:bg-[#000000] flex flex-col items-center justify-center gap-3">
        <ConnectInLogo size="lg" showSubtitle={true} className="animate-pulse" />
        <p className="text-xs text-zinc-500 font-mono mt-2">Verifying ConnectIn session...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F2EE] text-zinc-900 antialiased dark:bg-[#000000] dark:text-zinc-100 selection:bg-[#0A66C2] selection:text-white">
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
      <main className="mx-auto max-w-7xl px-3 sm:px-6 pt-5">
        {/* VIEW 1: HOME FEED */}
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Left Rail (Profile summary & communities) */}
            <div className="md:col-span-4 lg:col-span-3">
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
              {/* 1. PRIMARY MULTI-STREAM FEED CATEGORY TABS */}
              <div className="rounded-xl border border-zinc-200 bg-white p-2.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
                <div className="flex items-center justify-between gap-1 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full">
                    {FEED_CATEGORIES.map((cat) => {
                      const isSelected = activeFeedCategory === cat.id
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setActiveFeedCategory(cat.id)
                            setActiveFeedSubCategory('All')
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
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
                </div>

                {/* Dynamic Sub-Category Filter Ribbon */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pt-0.5">
                  <span className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider shrink-0 mr-1">
                    Filter:
                  </span>
                  {activeCategoryConfig.subCategories.map((sub) => {
                    const isSelected = activeFeedSubCategory === sub
                    return (
                      <button
                        key={sub}
                        onClick={() => setActiveFeedSubCategory(sub)}
                        className={`rounded-full px-2.5 py-0.5 font-semibold transition-colors whitespace-nowrap ${
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
                  <span>Filtered by: {selectedTagFilter}</span>
                  <button
                    onClick={() => setSelectedTagFilter(null)}
                    className="hover:underline text-zinc-600 dark:text-zinc-300"
                  >
                    Clear filter
                  </button>
                </div>
              )}

              {/* "Start a post" Creator */}
              <PostCreator user={userData} onAddPost={handleAddPost} />

              {/* Feed Sort & Separator */}
              <div className="flex items-center justify-between py-1 px-1 text-xs text-zinc-500 dark:text-zinc-400">
                <div className="h-[1px] flex-1 bg-zinc-300 dark:bg-zinc-800 mr-3" />
                <div className="flex items-center gap-1.5 shrink-0">
                  <span>Sort by:</span>
                  <button
                    onClick={() => setFeedSort(feedSort === 'top' ? 'recent' : 'top')}
                    className="font-bold text-zinc-900 hover:text-[#0A66C2] dark:text-zinc-100 flex items-center gap-1"
                  >
                    {feedSort === 'top' ? 'Top' : 'Recent'}
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
                      No posts found in this filter.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("")
                        setFeedTypeFilter('all')
                        setSelectedTagFilter(null)
                      }}
                      className="mt-2 text-xs font-semibold text-[#0A66C2] hover:underline"
                    >
                      Reset filters
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
            onNavigateMarketplace={() => setActiveTab('marketplace')}
            onNavigateJobs={() => setActiveTab('jobs')}
          />
        )}

        {/* VIEW 16: CATEGORIZED NOTIFICATIONS HUB */}
        {activeTab === 'notifications' && (
          <NotificationsView onNavigateTab={(tab) => setActiveTab(tab as any)} />
        )}
      </main>

      {/* Signature Persistent Floating Bottom-Right Messaging Dock */}
      <FloatingMessagingDock currentUser={userData} />

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
    </div>
  )
}
