"use client"

import React, { useState, useEffect } from "react"
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
  saveStoredUser,
  loadStoredConnections,
  saveStoredConnections
} from "@/lib/connectin-storage"
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
    | 'launchpad'
    | 'watercooler'
    | 'advisory'
    | 'startups'
    | 'careersuite'
    | 'messaging'
    | 'notifications'
    | 'profile'
  >('home')

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

  // Persist state changes
  useEffect(() => {
    const savedPosts = loadStoredPosts()
    const savedUser = loadStoredUser()
    const savedConnections = loadStoredConnections()
    if (savedPosts && savedPosts.length > 0) setPosts(savedPosts)
    if (savedUser) setUserData(savedUser)
    if (savedConnections && savedConnections.length > 0) setSuggestedPeople(savedConnections)
    setHasHydrated(true)
  }, [])

  // Persist state changes
  useEffect(() => {
    if (hasHydrated) {
      saveStoredPosts(posts)
    }
  }, [posts, hasHydrated])

  useEffect(() => {
    if (hasHydrated) {
      saveStoredUser(userData)
    }
  }, [userData, hasHydrated])

  useEffect(() => {
    if (hasHydrated) {
      saveStoredConnections(suggestedPeople)
    }
  }, [suggestedPeople, hasHydrated])

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
  const handleAddCertificateToProfile = (course: CourseItem) => {
    const newCert = {
      id: 'cert_' + Date.now(),
      title: course.title,
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

  return (
    <div className="min-h-screen bg-[#F4F2EE] text-zinc-900 antialiased dark:bg-[#000000] dark:text-zinc-100 selection:bg-[#0A66C2] selection:text-white">
      {/* Top Sticky Navigation */}
      <LinkedInNavbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab)
          setSelectedTagFilter(null)
        }}
        user={userData}
        unreadMessagesCount={1}
        networkInvitesCount={2}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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
                onSelectTag={(tag) => setSelectedTagFilter(tag)}
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
              />
            </div>
          </div>
        )}

        {/* VIEW 2: PROFILE VIEW */}
        {activeTab === 'profile' && (
          <ProfileView
            user={userData}
            onBackToFeed={() => setActiveTab('home')}
          />
        )}

        {/* VIEW 3: MY NETWORK */}
        {activeTab === 'network' && (
          <NetworkView
            suggestedPeople={suggestedPeople}
            onToggleConnect={handleToggleConnect}
          />
        )}

        {/* VIEW 4: JOBS VIEW */}
        {activeTab === 'jobs' && (
          <JobsView
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
          />
        )}

        {/* VIEW 6: PULSE ROOMS (LIVE AUDIO) */}
        {activeTab === 'pulserooms' && (
          <PulseRoomsView currentUser={userData} />
        )}

        {/* VIEW 7: PEER REVIEW EXCHANGE */}
        {activeTab === 'peerreview' && (
          <PeerReviewView currentUser={userData} />
        )}

        {/* VIEW 8: TOTAL COMPENSATION SIMULATOR */}
        {activeTab === 'compensation' && <CompensationCalculator />}

        {/* VIEW 9: APP & SOLUTIONS MARKETPLACE */}
        {activeTab === 'marketplace' && (
          <MarketplaceView
            currentUser={userData}
            onLaunchCareerSuite={() => setActiveTab('careersuite')}
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

        {/* VIEW 15: MESSAGING VIEW */}
        {activeTab === 'messaging' && <MessagingView />}

        {/* VIEW 16: NOTIFICATIONS VIEW */}
        {activeTab === 'notifications' && <NotificationsView />}
      </main>

      {/* Signature Persistent Floating Bottom-Right Messaging Dock */}
      <FloatingMessagingDock currentUser={userData} />
    </div>
  )
}
