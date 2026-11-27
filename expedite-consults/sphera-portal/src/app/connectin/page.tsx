"use client"

import React, { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { ConnectInLogo } from "@/components/brand/ConnectInLogo"
import { ConnectLnNavbar } from "@/components/connectln/ConnectLnNavbar"
import { ConnectLn360LeftRail } from "@/components/connectln/ConnectLn360LeftRail"
import { ConnectLn360UniverseAppView } from "@/components/connectln/ConnectLn360UniverseAppView"
import { MeetingReminders } from "@/components/connectln/MeetingReminders"
import { ConnectLnIncomingCallBanner } from "@/components/connectln/ConnectLnIncomingCallBanner"
import { ConnectLnPhoneVerificationGate } from "@/components/connectln/ConnectLnPhoneVerificationGate"
import {
  ConnectLnWhatsAppCallModal,
  getMyLinkedConnectLnPhone,
} from "@/components/connectln/ConnectLnWhatsAppCallModal"
import { LeftSidebarProfile } from "@/components/connectln/LeftSidebarProfile"
import { ConnectLnSovereignSuiteHub } from "@/components/connectln/ConnectLnSovereignSuiteHub"
import { PostCreator } from "@/components/connectln/PostCreator"
import { FeedPostCard } from "@/components/connectln/FeedPostCard"
import { LinkedInStoriesStrip } from "@/components/connectln/LinkedInStoriesStrip"
import { RightSidebarNews } from "@/components/connectln/RightSidebarNews"
import { FloatingMessagingDock, DirectMessageRecipient } from "@/components/connectln/FloatingMessagingDock"

const tabLoadingFallback = (label: string) => () => (
  <div className="mx-auto max-w-7xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center text-sm font-bold text-zinc-500">
    Loading {label}...
  </div>
)

const ProfileView = dynamic(() => import("@/components/connectln/ProfileView").then((m) => m.ProfileView), { ssr: false, loading: tabLoadingFallback("Profile Workspace") })
const NetworkView = dynamic(() => import("@/components/connectln/NetworkView").then((m) => m.NetworkView), { ssr: false, loading: tabLoadingFallback("My Network") })
const JobsView = dynamic(() => import("@/components/connectln/JobsView").then((m) => m.JobsView), { ssr: false, loading: tabLoadingFallback("Verified Jobs & Opportunities") })
const MessagingView = dynamic(() => import("@/components/connectln/MessagingView").then((m) => m.MessagingView), { ssr: false, loading: tabLoadingFallback("Direct Messaging") })
const NotificationsView = dynamic(() => import("@/components/connectln/NotificationsView").then((m) => m.NotificationsView), { ssr: false, loading: tabLoadingFallback("Live Alerts") })
const LearningView = dynamic(() => import("@/components/connectln/LearningView").then((m) => m.LearningView), { ssr: false, loading: tabLoadingFallback("ConnectLn Learning & Career Mastery Academy") })
const VibeUnifiedCommunicationsView = dynamic(() => import("@/components/connectln/VibeUnifiedCommunicationsView").then((m) => m.VibeUnifiedCommunicationsView), { ssr: false, loading: tabLoadingFallback("Noctis Unified Communications") })
const PulseRoomsView = dynamic(() => import("@/components/connectln/PulseRoomsView").then((m) => m.PulseRoomsView), { ssr: false, loading: tabLoadingFallback("Pulse Audio Rooms") })
const PeerReviewView = dynamic(() => import("@/components/connectln/PeerReviewView").then((m) => m.PeerReviewView), { ssr: false, loading: tabLoadingFallback("Peer Review Exchange") })
const CompensationCalculator = dynamic(() => import("@/components/connectln/CompensationCalculator").then((m) => m.CompensationCalculator), { ssr: false, loading: tabLoadingFallback("Compensation Intelligence") })
const ProductLaunchLeaderboard = dynamic(() => import("@/components/connectln/ProductLaunchLeaderboard").then((m) => m.ProductLaunchLeaderboard), { ssr: false, loading: tabLoadingFallback("Launchpad") })
const WatercoolerBlindView = dynamic(() => import("@/components/connectln/WatercoolerBlindView").then((m) => m.WatercoolerBlindView), { ssr: false, loading: tabLoadingFallback("Watercooler") })
const AdvisoryMarketplaceView = dynamic(() => import("@/components/connectln/AdvisoryMarketplaceView").then((m) => m.AdvisoryMarketplaceView), { ssr: false, loading: tabLoadingFallback("Advisory Marketplace") })
const StartupVentureView = dynamic(() => import("@/components/connectln/StartupVentureView").then((m) => m.StartupVentureView), { ssr: false, loading: tabLoadingFallback("Venture Hub") })
const CareerSuiteView = dynamic(() => import("@/components/connectln/CareerSuiteView").then((m) => m.CareerSuiteView), { ssr: false, loading: tabLoadingFallback("Resume Prep & CareerSuite") })
const MarketplaceView = dynamic(() => import("@/components/connectln/MarketplaceView").then((m) => m.MarketplaceView), { ssr: false, loading: tabLoadingFallback("Marketplace") })
const EcosystemView = dynamic(() => import("@/components/connectln/EcosystemView").then((m) => m.EcosystemView), { ssr: false, loading: tabLoadingFallback("Ecosystem") })
const CompanyPageView = dynamic(() => import("@/components/connectln/CompanyPageView").then((m) => m.CompanyPageView), { ssr: false, loading: tabLoadingFallback("Company Directory") })
const SellerCenterView = dynamic(() => import("@/components/connectln/SellerCenterView").then((m) => m.SellerCenterView), { ssr: false, loading: tabLoadingFallback("Seller Center") })
const TrustCenterView = dynamic(() => import("@/components/connectln/TrustCenterView").then((m) => m.TrustCenterView), { ssr: false, loading: tabLoadingFallback("Trust Center") })
const EventsView = dynamic(() => import("@/components/connectln/EventsView").then((m) => m.EventsView), { ssr: false, loading: tabLoadingFallback("Events & Live Demos") })
const ConnectInAIAssistant = dynamic(() => import("@/components/connectln/ConnectInAIAssistant").then((m) => m.ConnectInAIAssistant), { ssr: false })
const ProfessionalMissionsView = dynamic(() => import("@/components/connectln/ProfessionalMissionsView").then((m) => m.ProfessionalMissionsView), { ssr: false, loading: tabLoadingFallback("Career Missions") })
const ProcurementRFPView = dynamic(() => import("@/components/connectln/ProcurementRFPView").then((m) => m.ProcurementRFPView), { ssr: false, loading: tabLoadingFallback("Procurement & RFPs") })
const CollaborationIdeasView = dynamic(() => import("@/components/connectln/CollaborationIdeasView").then((m) => m.CollaborationIdeasView), { ssr: false, loading: tabLoadingFallback("Collaboration Hub") })
const MentorshipCreatorView = dynamic(() => import("@/components/connectln/MentorshipCreatorView").then((m) => m.MentorshipCreatorView), { ssr: false, loading: tabLoadingFallback("Mentorship") })
const LabsView = dynamic(() => import("@/components/connectln/LabsView").then((m) => m.LabsView), { ssr: false, loading: tabLoadingFallback("Labs") })
const UniversalSearchModal = dynamic(() => import("@/components/connectln/UniversalSearchModal").then((m) => m.UniversalSearchModal), { ssr: false })
const MediaView = dynamic(() => import("@/components/connectln/MediaView").then((m) => m.MediaView), { ssr: false, loading: tabLoadingFallback("Media Studio") })
const AIAgentsStorefrontView = dynamic(() => import("@/components/connectln/AIAgentsStorefrontView").then((m) => m.AIAgentsStorefrontView), { ssr: false, loading: tabLoadingFallback("AI Agents Storefront") })
const DeveloperCodeView = dynamic(() => import("@/components/connectln/DeveloperCodeView").then((m) => m.DeveloperCodeView), { ssr: false, loading: tabLoadingFallback("Developer Code") })
const WalletInvoicingView = dynamic(() => import("@/components/connectln/WalletInvoicingView").then((m) => m.WalletInvoicingView), { ssr: false, loading: tabLoadingFallback("Wallet & Escrow") })
const ProfessionalIDModal = dynamic(() => import("@/components/connectln/ProfessionalIDModal").then((m) => m.ProfessionalIDModal), { ssr: false })
const GatedGuildsView = dynamic(() => import("@/components/connectln/GatedGuildsView").then((m) => m.GatedGuildsView), { ssr: false, loading: tabLoadingFallback("Guilds & Enclaves") })
const BountiesHackathonsView = dynamic(() => import("@/components/connectln/BountiesHackathonsView").then((m) => m.BountiesHackathonsView), { ssr: false, loading: tabLoadingFallback("Bounties") })
const InboundBountiesModal = dynamic(() => import("@/components/connectln/InboundBountiesModal").then((m) => m.InboundBountiesModal), { ssr: false })
const AccountSecurityView = dynamic(() => import("@/components/connectln/AccountSecurityView").then((m) => m.AccountSecurityView), { ssr: false, loading: tabLoadingFallback("Account & Security") })
const ConnectLnPlansBillingView = dynamic(() => import("@/components/connectln/ConnectLnPlansBillingView").then((m) => m.ConnectLnPlansBillingView), { ssr: false, loading: tabLoadingFallback("Plans & Billing") })
const AdminIAMConsoleView = dynamic(() => import("@/components/connectln/AdminIAMConsoleView").then((m) => m.AdminIAMConsoleView), { ssr: false, loading: tabLoadingFallback("Admin & Media Console") })
const ConnectInAuthModal = dynamic(() => import("@/components/connectln/ConnectInAuthModal").then((m) => m.ConnectInAuthModal), { ssr: false })
const ConnectInAnalyticsModal = dynamic(() => import("@/components/connectln/ConnectInAnalyticsModal").then((m) => m.ConnectInAnalyticsModal), { ssr: false })
import { ConnectInVideoWheel } from "@/components/connectln/ConnectInVideoWheel"
import { SkilledTradesLearnByDoingSection } from "@/components/connectln/SkilledTradesLearnByDoingSection"
const ConnectInVideoGuideModal = dynamic(() => import("@/components/connectln/ConnectInVideoGuideModal").then((m) => m.ConnectInVideoGuideModal), { ssr: false })
const VeteransAndFranchiseNetworksView = dynamic(() => import("@/components/connectln/VeteransAndFranchiseNetworksView").then((m) => m.VeteransAndFranchiseNetworksView), { ssr: false, loading: tabLoadingFallback("Veterans & Franchise Network") })
const WorkAndBusinessHubView = dynamic(() => import("@/components/connectln/WorkAndBusinessHubView").then((m) => m.WorkAndBusinessHubView), { ssr: false, loading: tabLoadingFallback("Work & Business Hub") })
import { WorkBusinessItemId } from "@/lib/work-business-data"
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
} from "@/lib/connectln-data"
import {
  loadStoredPosts,
  saveStoredPosts,
  loadStoredUser,
  getExplicitStoredUser,
  saveStoredUser,
  loadStoredConnections,
  saveStoredConnections,
  loadStoredSessionRoute,
  loadPersistentAvatar,
  resolveUserProfilePicture,
  trackUserActivity,
  loadStoredAdminUsers,
  loadStoredUserActivityLogs
} from "@/lib/connectin-storage"
import { isSuperAdminUser, createUniqueUserProfile, createFreshInvitedUserProfile, generatePersonalSignatureAvatar, isForeignPersonaAvatar } from "@/lib/connectin-profile"
import {
  compressAvatarForCallSignal,
  isPlaceholderCallAvatar,
  resolveAndCompressLocalCallerAvatar,
} from "@/lib/connectin-avatar-signal"
import {
  recordLiveProfileView,
  recordLiveContentReach,
  recordLiveDirectoryDiscovery
} from "@/lib/connectin-analytics"
import {
  loadUserFollowBundle,
  syncUserFollowBundleFromCloud,
  buildFollowedMemberPosts,
  normalizeFollowKey,
  UserFollowBundle
} from "@/lib/connectin-follow"
import {
  PROFESSION_ENCLAVES,
  ALL_PROFESSIONS,
  findEnclaveById,
  findProfessionById
} from "@/lib/connectin-professions"
import {
  HANDYMAN_250_FOLDERS,
  HANDYMAN_250_PROFESSIONS
} from "@/lib/connectin-handyman-250-professions"
import {
  getMatchedWheelVideoForUser,
  mapHandyman250IdToProfessionVideoKey,
  resolveProfessionForUser
} from "@/lib/connectin-videos"
import { buildProfessionTieredFeedPosts } from "@/lib/connectin-profession-feed"
import { ConnectLnStagedVideoModal } from "@/components/connectln/ConnectLnStagedVideoModal"
import { ConnectLnStudioSuiteView } from "@/components/connectln/studio/ConnectLnStudioSuiteView"
import { ConnectLnPowerAppsHub } from "@/components/connectln/ConnectLnPowerAppsHub"
import { LiveHarvestedMediaShowcase } from "@/components/connectln/LiveHarvestedMediaShowcase"
import {
  loadStoredHarvestedItems,
  saveStoredHarvestedItems,
  HARVESTER_EVENT_NAME,
  HarvestedMediaItem
} from "@/lib/connectin-media-harvester"
import { SlidersHorizontal, Sparkles, Bell, CheckCircle2, ShieldCheck, Filter, Bookmark, Vote, BookOpen, ExternalLink, ChevronDown, ChevronUp, RefreshCw } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import {
  applyInteractionToPost,
  getCurrentUserReactionKey,
  mergeCloudPostsAndInteractions,
  type PostBaselineSnapshot,
} from "@/lib/connectln-post-sync"
import type { PersistedPostInteractionDoc } from "@/lib/connectln-mongodb"

const NEUTRAL_UNAUTHENTICATED_USER = {
  ...initialCurrentUser,
  id: "guest_unauthenticated",
  userId: undefined,
  email: undefined,
  phone: undefined,
  role: "member",
  roles: ["member"],
  profession: undefined,
  professionId: undefined,
  professionCategory: undefined,
  professionEnclave: undefined,
  name: "ConnectLn Member",
  headline: "Sign in to connect and collaborate",
  avatar: "",
  coverImage: "",
  location: "",
  connectionsCount: 0,
  followersCount: 0,
  profileViews: 0,
  postImpressions: 0,
  searchAppearances: 0,
  profileStrength: 0,
  about: "",
  openToWork: {
    isOpen: false,
    roles: [],
    jobTypes: [],
    locations: [],
  },
  featured: [],
  experience: [],
  education: [],
  certifications: [],
  skills: [],
  recommendations: [],
}

export default function ConnectLnPage() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<
    | 'home'
    | 'network'
    | 'jobs'
    | 'veterans'
    | 'franchises'
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
    | 'workbusiness'
    | 'noctissocial'
    | 'noctisclinic'
    | 'docs'
    | 'sheets'
    | 'slides'
    | 'sign'
    | 'invoice'
    | 'boards'
    | 'forms'
    | 'powerapps'
    | 'plans'
  >('home')
  const [initialPowerAppId, setInitialPowerAppId] = useState<string | null>(null)
  useEffect(() => {
    const handleOpenPowerApp = (ev: Event) => {
      const appId = (ev as CustomEvent<{ appId?: string }>)?.detail?.appId || null
      setInitialPowerAppId(appId)
      setActiveTab('powerapps')
    }
    window.addEventListener('connectln_open_power_app', handleOpenPowerApp)
    return () => window.removeEventListener('connectln_open_power_app', handleOpenPowerApp)
  }, [])
  const [workBusinessSection, setWorkBusinessSection] = useState<WorkBusinessItemId>('find_work')

  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  const [aiInitialQuery, setAiInitialQuery] = useState<string>("")
  const [plansInitialParams, setPlansInitialParams] = useState<{
    planId?: string
    cycle?: "yearly" | "monthly"
    seats?: number
  }>({})
  const [isUniversalSearchOpen, setIsUniversalSearchOpen] = useState(false)
  const [isIDModalOpen, setIsIDModalOpen] = useState(false)
  const [isInboundBountiesModalOpen, setIsInboundBountiesModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false)
  const [analyticsModalTab, setAnalyticsModalTab] = useState<'viewers' | 'reach' | 'discoveries'>('viewers')
  const [networkInitialSubTab, setNetworkInitialSubTab] = useState<'connections' | 'invitations' | 'sent' | 'profile_viewers' | 'followers' | 'following' | 'pymk'>('connections')
  const [networkResetTrigger, setNetworkResetTrigger] = useState(0)
  const [activeWorkspace, setActiveWorkspace] = useState<'personal' | 'enterprise' | 'creator' | 'seller'>('personal')
  const [activeGlobalWhatsAppCall, setActiveGlobalWhatsAppCall] = useState<{
    callId: string
    callerName: string
    callerPhone?: string
    callerAvatar?: string
    mode: 'audio' | 'video'
  } | null>(null)
  const [studioHandoff, setStudioHandoff] = useState<{
    callId: string
    conversationId: string
    conversationName: string
    mode: 'audio' | 'video' | 'screenshare'
    avatar?: string
    subtitle?: string
    returnToMessaging?: boolean
  } | null>(null)
  const [messagingResumeCall, setMessagingResumeCall] = useState<{
    threadId: string
    mode: 'audio' | 'video'
    isScreenSharing?: boolean
    nonce: number
  } | null>(null)
  const [messagingInitialMode, setMessagingInitialMode] = useState<'chats' | 'calendar' | undefined>(undefined)

  const handleReturnFromStudioToMessaging = (opts?: {
    keepCallActive?: boolean
    mode?: 'audio' | 'video' | 'screenshare'
  }) => {
    let resolvedHandoff = studioHandoff
    if (typeof window !== 'undefined') {
      if (!resolvedHandoff) {
        try {
          const raw = sessionStorage.getItem('connectln_studio_handoff_v1')
          if (raw) resolvedHandoff = JSON.parse(raw)
        } catch {}
      }
      sessionStorage.removeItem('connectln_studio_handoff_v1')
      window.history.replaceState(null, '', '/connectin')
    }
    if (opts?.keepCallActive && resolvedHandoff) {
      setMessagingResumeCall({
        threadId: resolvedHandoff.conversationId || resolvedHandoff.callId,
        mode: opts.mode === 'audio' ? 'audio' : 'video',
        isScreenSharing: opts.mode === 'screenshare',
        nonce: Date.now(),
      })
    }
    setStudioHandoff(null)
    setActiveTab('messaging')
  }

  const COMMON_SURNAMES_LIST = [
    "asiedu", "mensah", "appiah", "owusu", "boateng", "osei", "amoah", "agyemang", "acheampong", "opoku",
    "koomson", "addo", "tetteh", "quaye", "baah", "nyarko", "frimpong", "ansah", "gyamfi", "baffour",
    "smith", "johnson", "williams", "brown", "jones", "miller", "davis", "wilson", "taylor", "anderson",
    "thomas", "jackson", "white", "harris", "martin", "thompson", "garcia", "martinez", "robinson", "clark"
  ]

  const deriveHumanNameFromEmailClient = (rawInput?: string): string => {
    const trimmed = (rawInput || "").trim()
    if (!trimmed) return ""
    const angleMatch = trimmed.match(/^([^<@]+)<([^>]+)>$/)
    if (angleMatch && angleMatch[1].trim()) {
      return angleMatch[1]
        .trim()
        .replace(/["']/g, "")
        .split(/\s+/)
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ")
    }
    const local = (trimmed.split("@")[0] || "").trim()
    if (!local) return ""
    const cleaned = local.replace(/[._-]+/g, " ").replace(/\d+/g, "").trim()
    if (!cleaned) return ""
    if (!cleaned.includes(" ")) {
      const lower = cleaned.toLowerCase()
      for (const surname of COMMON_SURNAMES_LIST) {
        if (lower.length > surname.length + 1 && lower.endsWith(surname)) {
          const first = lower.slice(0, lower.length - surname.length)
          return `${first.charAt(0).toUpperCase() + first.slice(1)} ${surname.charAt(0).toUpperCase() + surname.slice(1)}`
        }
        if (lower.length > surname.length + 1 && lower.startsWith(surname)) {
          const rest = lower.slice(surname.length)
          return `${rest.charAt(0).toUpperCase() + rest.slice(1)} ${surname.charAt(0).toUpperCase() + surname.slice(1)}`
        }
      }
    }
    return cleaned
      .split(/\s+/)
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ")
  }

  const isGenericInvitedPlaceholder = (nameStr?: string): boolean => {
    const n = (nameStr || "").trim().toLowerCase()
    if (!n) return true
    return (
      n === "invited member" ||
      n === "invited colleague" ||
      n === "invited friend" ||
      n === "invited guest" ||
      n.startsWith("invited colleague") ||
      n.startsWith("invited member") ||
      n.startsWith("invited friend")
    )
  }

  const resolveOutboundInviteRecord = (
    cidParam: string,
    emailParam: string,
    phoneParam: string,
    inviterName: string
  ): { name: string; email: string } => {
    if (typeof window === "undefined") return { name: "", email: "" }
    try {
      const rawOutbound = localStorage.getItem("connectin_my_outbound_invites_v2")
      if (!rawOutbound) return { name: "", email: "" }
      const parsedOutbound = JSON.parse(rawOutbound)
      if (!Array.isArray(parsedOutbound) || parsedOutbound.length === 0) return { name: "", email: "" }

      const normInviter = (inviterName || "").toLowerCase().trim()
      const normEmail = (emailParam || "").toLowerCase().trim()
      const normPhone = (phoneParam || "").replace(/[^\d+]/g, "")

      const cleanCandidateName = (rawName?: string) => {
        const cleaned = String(rawName || "")
          .replace(/^Invited Colleague\s*\(.*\)$/i, "")
          .trim()
        if (!cleaned || isGenericInvitedPlaceholder(cleaned)) return ""
        if (normInviter && cleaned.toLowerCase().trim() === normInviter) return ""
        if (/^[\d+\-\s()]+$/.test(cleaned)) return ""
        return cleaned
      }

      // 1. Match by cid, email, or phone
      for (const item of parsedOutbound) {
        if (!item) continue
        const matchCid = cidParam && cidParam !== "live" && item.cid === cidParam
        const matchEmail = normEmail && String(item.email || "").toLowerCase().trim() === normEmail
        const matchPhone = normPhone && normPhone.length >= 7 && String(item.phone || "").replace(/[^\d+]/g, "") === normPhone
        if (matchCid || matchEmail || matchPhone) {
          const candidate = cleanCandidateName(item.name) || deriveHumanNameFromEmailClient(item.email)
          if (candidate) {
            return { name: candidate, email: String(item.email || emailParam || "").trim() }
          }
        }
      }

      // 2. Match most recent user-sent outbound invite (excluding static seed items out_init_*)
      for (const item of parsedOutbound) {
        if (!item || String(item.id || "").startsWith("out_init_")) continue
        const candidate = cleanCandidateName(item.name) || deriveHumanNameFromEmailClient(item.email)
        if (candidate) {
          return { name: candidate, email: String(item.email || emailParam || "").trim() }
        }
      }
    } catch {
      // ignore
    }
    return { name: "", email: "" }
  }

  const [userData, setUserData] = useState<UserProfile>(() => {
    if (typeof window === "undefined") return initialCurrentUser
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const inviteParam = urlParams.get("invite")
      const invitedEmailParam = (urlParams.get("invitedEmail") || "").trim()
      const invitedNameParam = (urlParams.get("invitedName") || "").trim()
      const invitedPhoneParam = (urlParams.get("invitedPhone") || "").trim()
      const inviterParam = (urlParams.get("inviter") || "").trim()
      const refParam = (urlParams.get("ref") || "").trim()
      const cidParam = (urlParams.get("cid") || "").trim()
      const joinCallParam = urlParams.get("joinCall") || urlParams.get("call") || urlParams.get("waCall")

      const isInviteUrl = Boolean(
        !joinCallParam &&
        (inviteParam === "accept" ||
        invitedEmailParam ||
        invitedNameParam ||
        invitedPhoneParam ||
        inviterParam ||
        refParam ||
        cidParam)
      )

      if (isInviteUrl) {
        return createFreshInvitedUserProfile({
          name: invitedNameParam || "ConnectLn Member",
          email: ""
        })
      }

      const explicitStored = getExplicitStoredUser()
      if (explicitStored && !isGenericInvitedPlaceholder(explicitStored.name)) {
        return explicitStored
      }

      if (joinCallParam) {
        const guestName = invitedNameParam || deriveHumanNameFromEmailClient(invitedEmailParam) || "Live Call Participant"
        return {
          ...createFreshInvitedUserProfile({ name: guestName, email: "" }),
          id: `guest-${Date.now().toString().slice(-5)}`,
          name: guestName,
          avatar: generatePersonalSignatureAvatar({ name: guestName, email: "" }),
          headline: "Live Meeting Participant · NoctisChat E2EE"
        }
      }
    } catch {
      // ignore
    }
    return NEUTRAL_UNAUTHENTICATED_USER
  })
  const [inspectedMember, setInspectedMember] = useState<UserProfile | null>(null)
  const [composeRecipient, setComposeRecipient] = useState<DirectMessageRecipient | null>(null)

  const handleOpenDirectMessage = (personInput?: any) => {
    if (!personInput) {
      setActiveTab('messaging')
      return
    }
    if (typeof personInput === 'object' && personInput.name) {
      setComposeRecipient({
        id: personInput.id,
        name: personInput.name,
        headline: personInput.headline || 'Verified ConnectLn Professional · Championing Culture, Compliance & Connection',
        avatar: personInput.avatar
      })
      return
    }
    const nameStr = String(personInput).trim()
    const matchedSuggested = suggestedPeople.find(p => p.name.toLowerCase() === nameStr.toLowerCase())
    const matchedAdmin = loadStoredAdminUsers().find(u => u.name.toLowerCase() === nameStr.toLowerCase())
    if (inspectedMember && inspectedMember.name.toLowerCase() === nameStr.toLowerCase()) {
      setComposeRecipient({
        id: inspectedMember.id,
        name: inspectedMember.name,
        headline: inspectedMember.headline,
        avatar: inspectedMember.avatar
      })
    } else if (matchedSuggested) {
      setComposeRecipient({
        id: matchedSuggested.id,
        name: matchedSuggested.name,
        headline: matchedSuggested.headline,
        avatar: matchedSuggested.avatar
      })
    } else if (matchedAdmin) {
      setComposeRecipient({
        id: matchedAdmin.id,
        name: matchedAdmin.name,
        headline: matchedAdmin.headline || `${matchedAdmin.role} at ${matchedAdmin.company}`,
        avatar: matchedAdmin.avatar
      })
    } else {
      setComposeRecipient({
        name: nameStr,
        headline: 'Senior Talent & Clinical Operations Specialist, Championing Culture, Compliance & Connection'
      })
    }
  }
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
  const [showHomeTradeFolders, setShowHomeTradeFolders] = useState(false)
  const [selectedHomeTradeFolder, setSelectedHomeTradeFolder] = useState<number>(1)
  const [visibleMyPostsCount, setVisibleMyPostsCount] = useState(4)
  const [visibleStreamCount, setVisibleStreamCount] = useState(12)
  const feedLoadMoreRef = React.useRef<HTMLDivElement | null>(null)
  const [showMobileCommunityDrawer, setShowMobileCommunityDrawer] = useState(false)
  const [showMobileSubFilters, setShowMobileSubFilters] = useState(true)
  const [hasHydrated, setHasHydrated] = useState(false)
  const [harvestedHomeItems, setHarvestedHomeItems] = useState<HarvestedMediaItem[]>(() =>
    loadStoredHarvestedItems().filter(
      (i) => i.kind === "video" && Array.isArray(i.destinations) && i.destinations.includes("home")
    )
  )
  const [isSyncingFeedVideos, setIsSyncingFeedVideos] = useState(false)
  const [lastFeedVideoSyncNote, setLastFeedVideoSyncNote] = useState<string>("Auto-syncs every 15m")
  const lastLiveVideoSyncMsRef = React.useRef<number>(0)

  const getPostMediaDedupeSignature = (p: Post): string => {
    const yt = (p.media?.youtubeId || "").trim().toLowerCase()
    if (yt) return `yt:${yt}`
    const mTitle = (p.media?.title || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
    if (mTitle && mTitle.length >= 12) return `mtitle:${mTitle}`
    const mUrl = (p.media?.url || "").trim().toLowerCase()
    if (mUrl && !mUrl.includes("agentic_flywheel.mp4")) return `murl:${mUrl}`
    const bodyNorm = (p.content || "")
      .replace(/^⚡\s*\[[^\]]+\]\s*/u, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .slice(0, 90)
    return bodyNorm ? `body:${bodyNorm}` : `id:${p.id}`
  }

  const buildFeedPostFromHarvestedItem = (item: HarvestedMediaItem): Post => {
    const postId = `harvest_post_${item.id}`
    const parsedSyncMs = Date.parse(item.publishedAtIso || item.harvestedAtIso || "")
    const syncedAtMs =
      Number.isFinite(parsedSyncMs) && parsedSyncMs > 0
        ? parsedSyncMs
        : (Number(item.minuteSlot) || 0) * 60_000
    return {
      id: postId,
      isUserCreated: false,
      feedCategory: "for_you",
      feedSubCategory: item.category,
      createdAtIso: item.publishedAtIso || item.harvestedAtIso || new Date().toISOString(),
      author: {
        id: `hv_${item.minuteSlot}`,
        name: item.organization || item.authorName,
        headline: `${item.authorName} · ${item.authorRole}`,
        avatar: item.authorAvatar,
        connectionDegree: "1st",
      },
      timestamp: item.pulledAtLabel ? item.pulledAtLabel.replace(/^Pulled\s+/i, "") : "1h",
      visibility: "Public",
      postType: "standard",
      professionEnclave: item.enclaveId,
      content: item.summary,
      hashtags: [`#${item.category.replace(/[^a-zA-Z0-9]/g, "")}`],
      media:
        item.kind === "video"
          ? {
              type: "video",
              url:
                item.videoUrl ||
                (item.youtubeId ? `https://www.youtube.com/watch?v=${item.youtubeId}` : "/status-videos/agentic_flywheel.mp4"),
              youtubeId: item.youtubeId,
              thumbnailUrl: item.imageUrl,
              title: item.title,
              description: item.summary,
              duration: item.duration || "03:20",
              serialPlate: item.serialNumber,
            }
          : {
              type: "image",
              url: item.imageUrl,
              visualStyle: "editorial_podium",
              overlayTitle: item.title,
              overlaySubtitle: item.category,
              mastheadText: "CLN",
              title: item.title,
              description: item.summary,
            },
      stats: {
        likesCount: item.likesCount || 48,
        commentsCount: 6,
        repostsCount: 4,
        reactionsBreakdown: { like: 36, celebrate: 6, support: 2, love: 2, insightful: 2, funny: 0 },
      },
      userReaction: null,
      isSaved: false,
      comments: [],
      ...(syncedAtMs ? ({ syncedAtMs } as Record<string, any>) : {}),
    }
  }

  const handleSyncFreshFeedVideos = async () => {
    if (isSyncingFeedVideos) return
    setIsSyncingFeedVideos(true)
    try {
      const currentTopYtIds = harvestedHomeItems
        .slice(0, 4)
        .map((i) => i.youtubeId)
        .filter(Boolean)
      const res = await fetch("/api/connectin/media-harvester", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "pull_now",
          count: 6,
          destinations: ["home"],
          excludeYoutubeIds: currentTopYtIds,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        const pulled: HarvestedMediaItem[] = Array.isArray(data?.pulledItems) ? data.pulledItems : []
        const allServer: HarvestedMediaItem[] = Array.isArray(data?.telemetry?.items) ? data.telemetry.items : []
        const merged = saveStoredHarvestedItems([...pulled, ...allServer])
        const homeOnly = merged.filter(
          (i) => i.kind === "video" && Array.isArray(i.destinations) && i.destinations.includes("home")
        )
        setHarvestedHomeItems(homeOnly)
        lastLiveVideoSyncMsRef.current = Date.now()
        const timeLabel = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
        setLastFeedVideoSyncNote(`✓ Added ${pulled.length || homeOnly.slice(0, 5).length} new videos (${timeLabel}) · All videos kept`)
        setVisibleMyPostsCount((prev) => Math.max(prev, 5))
      }
    } catch {
      setLastFeedVideoSyncNote("Scheduled every 24h · All videos preserved")
    } finally {
      setIsSyncingFeedVideos(false)
    }
  }

  const baselinePostStatsRef = useRef<Map<string, PostBaselineSnapshot>>(new Map())
  const latestInteractionsRef = useRef<Record<string, PersistedPostInteractionDoc>>({})
  const lastPostInteractionWriteMsRef = useRef<Record<string, number>>({})

  // Cross-User Cloud Feed Sync (Posts, Comments, Replies, Reactions & Comment Likes) via MongoDB Atlas
  useEffect(() => {
    if (typeof window === "undefined") return
    let cancelled = false

    const syncFeedPostsFromCloud = async () => {
      try {
        const res = await fetch("/api/connectin/posts", { cache: "no-store" })
        if (!res.ok || cancelled) return
        const data = await res.json()
        const cloudPosts: Record<string, any>[] = Array.isArray(data?.posts) ? data.posts : []
        const interactions: Record<string, PersistedPostInteractionDoc> =
          data?.interactions && typeof data.interactions === "object" ? data.interactions : {}
        latestInteractionsRef.current = interactions

        const nowMs = Date.now()
        const skipPostIds = new Set<string>()
        for (const [pid, lastWriteMs] of Object.entries(lastPostInteractionWriteMsRef.current)) {
          const srvUpdated = Number(interactions[pid]?.updatedAtMs || 0)
          if (nowMs - lastWriteMs <= 4000 && srvUpdated < lastWriteMs) {
            skipPostIds.add(pid)
          }
        }

        if (cloudPosts.length === 0 && Object.keys(interactions).length === 0) return

        setPosts((prev) => {
          const merged = mergeCloudPostsAndInteractions({
            localPosts: prev,
            cloudPosts,
            interactions,
            baselineMap: baselinePostStatsRef.current,
            currentUser: userData,
            skipPostIds,
          })
          saveStoredPosts(merged)
          return merged
        })
      } catch {
        // ignore transient offline/network errors
      }
    }

    void syncFeedPostsFromCloud()
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        void syncFeedPostsFromCloud()
      }
    }
    window.addEventListener("focus", handleVisibilityOrFocus)
    const intervalId = window.setInterval(() => {
      if (typeof document === "undefined" || document.visibilityState === "visible") {
        void syncFeedPostsFromCloud()
      }
    }, 15000)

    return () => {
      cancelled = true
      window.removeEventListener("focus", handleVisibilityOrFocus)
      window.clearInterval(intervalId)
    }
  }, [userData.email, userData.id, userData.name])

  // Global 24-Hour Additive Media Scheduler — adds new videos every 24 hours and preserves all existing videos
  useEffect(() => {
    if (typeof window === "undefined") return

    const injectHarvestedHomeItemsIntoFeed = (allItems: HarvestedMediaItem[]) => {
      const homeItems = allItems.filter(
        (i) => i.kind === "video" && Array.isArray(i.destinations) && i.destinations.includes("home")
      )
      setHarvestedHomeItems(homeItems)
      if (homeItems.length === 0) return

      const candidates = homeItems.slice(0, 48)
      const freshById = new Map<string, Post>()
      for (const item of candidates) {
        const built = buildFeedPostFromHarvestedItem(item)
        freshById.set(built.id, built)
      }

      setPosts((prev) => {
        // Strictly additive: preserve all existing unique posts while refreshing synced metadata & placing newly published videos on top!
        const seenSigs = new Set<string>()
        const seenIds = new Set<string>()
        const freshAdditivePosts: Post[] = []
        const preservedPrev: Post[] = []

        for (const item of candidates) {
          const candidatePost = buildFeedPostFromHarvestedItem(item)
          const sig = getPostMediaDedupeSignature(candidatePost)
          if (!seenIds.has(candidatePost.id) && !seenSigs.has(sig)) {
            freshAdditivePosts.push(candidatePost)
            seenIds.add(candidatePost.id)
            seenSigs.add(sig)
          }
        }

        for (const p of prev) {
          if (!p || !p.id || seenIds.has(p.id)) continue
          const sig = getPostMediaDedupeSignature(p)
          if (p.id.startsWith("harvest_post_") && seenSigs.has(sig)) continue
          seenIds.add(p.id)
          seenSigs.add(sig)
          preservedPrev.push(freshById.get(p.id) || p)
        }

        const nextPosts = [...freshAdditivePosts, ...preservedPrev].slice(0, 500)
        saveStoredPosts(nextPosts)
        return nextPosts
      })
    }

    const LAST_24H_SYNC_KEY = "connectln_last_24h_sync_ms"
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000

    const syncHarvestedMediaTick = async (forceRefresh: boolean) => {
      try {
        const url = forceRefresh
          ? "/api/connectin/media-harvester?force=1"
          : "/api/connectin/media-harvester"
        const res = await fetch(url, { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        const incoming: HarvestedMediaItem[] = Array.isArray(data?.items) ? data.items : []
        if (incoming.length === 0) return

        // Additive merge: preserve every existing video while adding newly published videos on top
        const currentLocal = loadStoredHarvestedItems()
        const merged = saveStoredHarvestedItems([...incoming, ...currentLocal])
        injectHarvestedHomeItemsIntoFeed(merged)
        const nowMs = Date.now()
        lastLiveVideoSyncMsRef.current = nowMs
        try {
          window.localStorage.setItem(LAST_24H_SYNC_KEY, String(nowMs))
        } catch {}
        const timeLabel = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
        setLastFeedVideoSyncNote(`24h schedule active (${timeLabel}) · All videos preserved`)
      } catch {
        // ignore transient network errors
      }
    }

    const handleHarvesterUpdatedEvent = () => {
      const latest = loadStoredHarvestedItems()
      injectHarvestedHomeItemsIntoFeed(latest)
    }

    const handleCrossTabStorage = (e: StorageEvent) => {
      if (!e.key || e.key.includes("connectln_harvested_media")) {
        const latest = loadStoredHarvestedItems()
        injectHarvestedHomeItemsIntoFeed(latest)
      }
    }

    const handleWindowFocus = () => {
      const lastStored = Number(window.localStorage.getItem(LAST_24H_SYNC_KEY) || "0")
      if (Date.now() - Math.max(lastLiveVideoSyncMsRef.current, lastStored) >= TWENTY_FOUR_HOURS_MS) {
        syncHarvestedMediaTick(true)
      }
    }

    const lastStoredSync = Number(window.localStorage.getItem(LAST_24H_SYNC_KEY) || "0")
    const dueFor24hForce = Date.now() - lastStoredSync >= TWENTY_FOUR_HOURS_MS
    syncHarvestedMediaTick(dueFor24hForce)

    window.addEventListener(HARVESTER_EVENT_NAME, handleHarvesterUpdatedEvent)
    window.addEventListener("storage", handleCrossTabStorage)
    window.addEventListener("focus", handleWindowFocus)

    // Scheduled additive check every 24 hours (86,400,000 ms)
    const intervalId = window.setInterval(() => {
      syncHarvestedMediaTick(true)
    }, TWENTY_FOUR_HOURS_MS)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener(HARVESTER_EVENT_NAME, handleHarvesterUpdatedEvent)
      window.removeEventListener("storage", handleCrossTabStorage)
      window.removeEventListener("focus", handleWindowFocus)
    }
  }, [])

  // Ensure mobile and desktop browsers immediately run the latest ConnectLn release (2026.11.03.v5) without stale Service Workers or Cache Storage
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const iconHref = "/brand/connectln-icon-256.png?v=5"
      const existingIcons = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']")
      if (existingIcons.length > 0) {
        existingIcons.forEach(link => {
          link.type = "image/png"
          link.href = iconHref
        })
      } else {
        const link = document.createElement("link")
        link.rel = "icon"
        link.type = "image/png"
        link.href = iconHref
        document.head.appendChild(link)
      }
    } catch {
      // ignore DOM icon errors
    }
    const CURRENT_RELEASE_VERSION = "2026.11.11.gold-standard-5"
    try {
      const prevVersion = localStorage.getItem("connectln_release_version_v5")
      if (prevVersion !== CURRENT_RELEASE_VERSION) {
        localStorage.setItem("connectln_release_version_v5", CURRENT_RELEASE_VERSION)
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.getRegistrations().then(regs => {
            regs.forEach(r => r.unregister())
          }).catch(() => {})
        }
        if ("caches" in window) {
          caches.keys().then(keys => {
            keys.forEach(k => caches.delete(k))
          }).catch(() => {})
        }
        const mergedPosts = loadStoredPosts()
        if (mergedPosts && mergedPosts.length > 0) {
          setPosts(mergedPosts)
          saveStoredPosts(mergedPosts)
        }
      }
    } catch {
      // ignore storage errors
    }
  }, [])
  const [inviteClaimModal, setInviteClaimModal] = useState<{
    isOpen: boolean
    inviterName: string
    inviterHeadline: string
    recipientName: string
    recipientEmail: string
    recipientPhone: string
    professionId: string
  } | null>(null)

  const connectWithInviterInStorage = (_inviterName: string, _inviterHeadline?: string) => {
    // New users start with 0 connections, 0 sent invitations, and 0 received invitations until explicitly accepted
  }

  // Authentication Lifecycle — optimistic-first, never redirects, shows modal only if truly needed
  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      if (typeof window === "undefined") return

      const urlParams = new URLSearchParams(window.location.search)
      const tabParam = urlParams.get("tab")
      const pulseIdParam = (urlParams.get("pulseId") || "").trim()
      const pulseTitleParam = (urlParams.get("pulseTitle") || "").trim()
      const videoParam = (urlParams.get("video") || "").trim()
      const plateParam = (urlParams.get("plate") || "").trim()
      const postIdParam = (urlParams.get("postId") || "").trim()
      const postTitleParam = (urlParams.get("postTitle") || "").trim()
      const postAuthorParam = (urlParams.get("postAuthor") || "").trim()
      const waCallParam = (urlParams.get("waCall") || "").trim()
      const waCallModeParam = urlParams.get("mode") === "audio" ? "audio" : "video"
      const waCallerNameParam = (urlParams.get("callerName") || "ConnectLn Caller").trim()
      const waCallerPhoneParam = (urlParams.get("callerPhone") || "").trim()
      const rawWaCallerAvatar = (urlParams.get("callerAvatar") || "").trim()
      const waCallerAvatarParam =
        rawWaCallerAvatar &&
        (rawWaCallerAvatar.startsWith("https://") ||
          rawWaCallerAvatar.startsWith("http://") ||
          rawWaCallerAvatar.startsWith("/"))
          ? rawWaCallerAvatar
          : undefined
      const joinCallParam = urlParams.get("joinCall") || urlParams.get("call")
      const inviteParam = urlParams.get("invite")
      const invitedEmailParam = (urlParams.get("invitedEmail") || "").trim()
      const invitedNameParam = (urlParams.get("invitedName") || "").trim()
      const invitedPhoneParam = (urlParams.get("invitedPhone") || "").trim()
      const inviterParam = (urlParams.get("inviter") || "").trim()
      const inviterHeadlineParam = (urlParams.get("inviterHeadline") || "").trim()
      const refParam = (urlParams.get("ref") || "").trim()
      const cidParam = (urlParams.get("cid") || "").trim()

      const hasSharedContentLink = Boolean(
        pulseIdParam ||
        pulseTitleParam ||
        tabParam === "pulse" ||
        tabParam === "pulserooms" ||
        videoParam ||
        plateParam ||
        postIdParam
      )

      const resolvedUrlTab =
        joinCallParam || tabParam === "vibecomms"
          ? "vibecomms"
          : tabParam === "noctissocial" || tabParam === "noctis-social" || tabParam === "noctis.social"
          ? "noctissocial"
          : tabParam === "noctisclinic" || tabParam === "noctis-clinic" || tabParam === "noctis"
          ? "noctisclinic"
          : tabParam === "docs" || tabParam === "document" || tabParam === "documents" || tabParam === "studio"
          ? "docs"
          : tabParam === "sheets" || tabParam === "sheet" || tabParam === "spreadsheet" || tabParam === "spreadsheets"
          ? "sheets"
          : tabParam === "slides" || tabParam === "slide" || tabParam === "presentation" || tabParam === "presentations" || tabParam === "decks"
          ? "slides"
          : tabParam === "sign" || tabParam === "esign" || tabParam === "esignature" || tabParam === "signature" || tabParam === "power"
          ? "sign"
          : tabParam === "invoice" || tabParam === "invoices" || tabParam === "billing" || tabParam === "ledger" || tabParam === "estimates"
          ? "invoice"
          : tabParam === "boards" || tabParam === "board" || tabParam === "kanban" || tabParam === "tasks" || tabParam === "projects"
          ? "boards"
          : tabParam === "forms" || tabParam === "form" || tabParam === "survey" || tabParam === "surveys" || tabParam === "intake"
          ? "forms"
          : tabParam === "powerapps" || tabParam === "power"
          ? "powerapps"
          : pulseIdParam || pulseTitleParam || tabParam === "pulse" || tabParam === "pulserooms"
          ? "pulserooms"
          : videoParam || plateParam || postIdParam || tabParam === "home"
          ? "home"
          : tabParam === "workbusiness" || tabParam === "business" || tabParam === "rfps"
          ? "workbusiness"
          : tabParam === "accountsecurity" || tabParam === "security" || tabParam === "passkeys"
          ? "accountsecurity"
          : tabParam === "trustcenter" || tabParam === "trust"
          ? "trustcenter"
          : tabParam === "plans" || tabParam === "pricing" || tabParam === "subscription"
          ? "plans"
          : tabParam === "procurement"
          ? "procurement"
          : tabParam === "sellercenter"
          ? "sellercenter"
          : tabParam === "wallet"
          ? "wallet"
          : tabParam === "events"
          ? "events"
          : tabParam === "profile"
          ? "profile"
          : tabParam === "notifications"
          ? "notifications"
          : tabParam === "media"
          ? "media"
          : tabParam === "learning"
          ? "learning"
          : tabParam === "marketplace"
          ? "marketplace"
          : tabParam === "network"
          ? "network"
          : tabParam === "careersuite" || tabParam === "resume"
          ? "careersuite"
          : tabParam === "jobs"
          ? "jobs"
          : tabParam === "veterans"
          ? "veterans"
          : tabParam === "franchises"
          ? "franchises"
          : tabParam === "messaging" || tabParam === "calendar"
          ? "messaging"
          : null

      const isInvitationLink = Boolean(
        inviteParam === "accept" ||
        invitedEmailParam ||
        invitedNameParam ||
        invitedPhoneParam ||
        inviterParam ||
        refParam ||
        cidParam
      )

      // When a user clicks an invitation link from an email/SMS, force them to authenticate on /connectin-login with a fresh profile!
      // NEVER log them in using the inviter's credentials or session.
      if (isInvitationLink && !joinCallParam && !waCallParam && !hasSharedContentLink) {
        try {
          localStorage.removeItem("connectin_user_profile")
          localStorage.removeItem("connectin_user_v1")
          localStorage.removeItem("connectin_verified")
          localStorage.removeItem("connectin_persistent_avatar_v1")
          localStorage.setItem("connectin_is_signed_out", "true")
          sessionStorage.removeItem("connectin_authenticated")
        } catch {}
        fetch("/api/connectin/auth/logout", { method: "POST" }).catch(() => {})
        window.location.replace(`/connectin-login${window.location.search}`)
        return
      }

      if (waCallParam && isMounted) {
        setActiveGlobalWhatsAppCall({
          callId: waCallParam,
          callerName: waCallerNameParam,
          callerPhone: waCallerPhoneParam || undefined,
          callerAvatar: waCallerAvatarParam,
          mode: waCallModeParam,
        })
      }

      if (resolvedUrlTab) {
        setActiveTab(resolvedUrlTab as any)
        if (tabParam === "calendar" && isMounted) {
          setMessagingInitialMode("calendar")
        }
      }

      const askNoctisParam = (urlParams.get("askNoctis") || "").trim()
      if (askNoctisParam && isMounted) {
        setAiInitialQuery(askNoctisParam)
        setIsAIAssistantOpen(true)
      }

      const planParam = (urlParams.get("plan") || "").trim().toLowerCase()
      const cycleParam =
        urlParams.get("cycle") === "monthly"
          ? "monthly"
          : urlParams.get("cycle") === "yearly"
          ? "yearly"
          : undefined
      const seatsRaw = Number(urlParams.get("seats"))
      const seatsParam =
        Number.isFinite(seatsRaw) && seatsRaw >= 1 ? Math.min(500, Math.round(seatsRaw)) : undefined
      if ((planParam || cycleParam || seatsParam) && isMounted) {
        setPlansInitialParams({
          planId: planParam || undefined,
          cycle: cycleParam,
          seats: seatsParam,
        })
      }

      const isSignedOut = localStorage.getItem("connectin_is_signed_out") === "true"

      // Try to get stored user profile
      const explicitUser = getExplicitStoredUser()
      // Check if user has previously verified (persistent across sessions)
      const hasVerified = localStorage.getItem("connectin_verified") === "true"

      // If an invited friend clicks a live meeting or WhatsApp call link (?joinCall=... or ?waCall=...) and has no stored account yet,
      // admit them directly into the call without blocking with a login modal!
      if ((joinCallParam || waCallParam) && (!explicitUser || isSignedOut)) {
        if (isMounted) {
          const guestName = invitedNameParam || deriveHumanNameFromEmailClient(invitedEmailParam) || "Live Call Participant"
          const guestUser = {
            ...initialCurrentUser,
            id: `guest-${Date.now().toString().slice(-5)}`,
            name: guestName,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(guestName)}&backgroundColor=0a66c2`,
            headline: "Live Call Participant · ConnectLn E2EE",
          }
          setUserData(guestUser)
          setIsAuthenticated(true)
          setIsAuthModalOpen(false)
          if (joinCallParam && !waCallParam) {
            setActiveTab("vibecomms")
          }
          setHasHydrated(true)
        }
        return
      }

      // If someone opens a shared content link (Pulse card, video, or feed post), direct them straight to the content without blocking on login!
      if (hasSharedContentLink && (!explicitUser || isSignedOut)) {
        if (isMounted) {
          setUserData(NEUTRAL_UNAUTHENTICATED_USER)
          setIsAuthenticated(true)
          setIsAuthModalOpen(false)
          if (resolvedUrlTab) {
            setActiveTab(resolvedUrlTab as any)
          }
          setHasHydrated(true)
        }
        return
      }

      // If explicitly signed out, ensure neutral identity and redirect cleanly to the ConnectLn 360 Portal
      if (isSignedOut) {
        if (isMounted) {
          setUserData(NEUTRAL_UNAUTHENTICATED_USER)
          setIsAuthenticated(false)
          setHasHydrated(true)
          if (typeof window !== "undefined") {
            window.location.replace("/connectin-portal")
          }
        }
        return
      }

      if (explicitUser) {
        // Full profile in localStorage — hydrate immediately
        if (isMounted) {
          setIsAuthenticated(true)
          setUserData(explicitUser)
          const savedPosts = loadStoredPosts(explicitUser)
          const savedConnections = loadStoredConnections()
          const savedRoute = loadStoredSessionRoute()
          if (savedPosts && savedPosts.length > 0) setPosts(savedPosts)
          if (savedConnections && savedConnections.length > 0) setSuggestedPeople(savedConnections)
          if (resolvedUrlTab && (resolvedUrlTab !== 'adminiam' || isSuperAdminUser(explicitUser))) {
            setActiveTab(resolvedUrlTab as any)
          } else if (savedRoute.tab && (savedRoute.tab !== 'adminiam' || isSuperAdminUser(explicitUser))) {
            setActiveTab(savedRoute.tab as any)
          } else {
            setActiveTab('home')
          }
          if (savedRoute.workspace) setActiveWorkspace(savedRoute.workspace)
          setHasHydrated(true)
        }
        // Silently refresh from server — only if server session email AND name match active user, and never overwrites user's locally saved name, avatar, role, or cover photo
        try {
          const meRes = await fetch("/api/connectin/auth/me")
          if (meRes.ok && isMounted) {
            const meData = await meRes.json()
            if (meData.authenticated && meData.profile) {
              const latestExplicit = getExplicitStoredUser() || explicitUser
              const explicitEmail = ((latestExplicit as any)?.email || "").toLowerCase().trim()
              const serverEmail = (meData.profile.email || meData.user?.email || "").toLowerCase().trim()
              const explicitName = (latestExplicit.name || "").toLowerCase().trim()
              const serverName = (meData.profile.name || "").toLowerCase().trim()
              if (
                explicitName &&
                serverName &&
                explicitName === serverName &&
                (!explicitEmail || !serverEmail || explicitEmail === serverEmail)
              ) {
                const isAdmin = isSuperAdminUser({ name: latestExplicit.name || meData.profile.name, email: explicitEmail || serverEmail })
                const persistentCustomAvatar = loadPersistentAvatar({
                  id: (latestExplicit as any)?.id || meData.profile.userId || meData.user?.id || explicitUser.id,
                  email: explicitEmail || serverEmail,
                  name: latestExplicit.name || meData.profile.name,
                })
                const preferredAvatar =
                  persistentCustomAvatar ||
                  (latestExplicit.avatar && !latestExplicit.avatar.includes("api.dicebear.com") ? latestExplicit.avatar : "") ||
                  (meData.profile.avatar && !meData.profile.avatar.includes("api.dicebear.com") ? meData.profile.avatar : "") ||
                  latestExplicit.avatar ||
                  meData.profile.avatar
                const refreshed: UserProfile = {
                  ...meData.profile,
                  ...latestExplicit,
                  name: latestExplicit.name || meData.profile.name,
                  email: (latestExplicit as any)?.email || meData.profile.email || meData.user?.email,
                  id: (latestExplicit as any)?.id || meData.profile.userId || meData.user?.id || explicitUser.id,
                  professionId: latestExplicit.professionId || meData.profile.professionId,
                  profession: latestExplicit.profession || meData.profile.profession,
                  professionCategory: latestExplicit.professionCategory || meData.profile.professionCategory,
                  professionEnclave: latestExplicit.professionEnclave || meData.profile.professionEnclave,
                  role: isAdmin ? "admin" : "personal",
                  roles: isAdmin ? ["SUPER_ADMIN"] : ["NORMAL_USER"],
                  avatar: preferredAvatar,
                  coverImage:
                    latestExplicit.coverImage && !latestExplicit.coverImage.includes("photo-1550751827-4bd374c3f58b")
                      ? latestExplicit.coverImage
                      : meData.profile.coverImage || latestExplicit.coverImage,
                }
                saveStoredUser(refreshed)
                setUserData(getExplicitStoredUser() || refreshed)
              }
            }
          }
        } catch (e) { /* silent */ }
        return
      }

      if (hasVerified) {
        // User has signed in before but profile data is missing — keep them in, fetch from server
        if (isMounted) {
          setIsAuthenticated(true)
          if (resolvedUrlTab) {
            setActiveTab(resolvedUrlTab as any)
          }
          setHasHydrated(true)
        }
        try {
          const meRes = await fetch("/api/connectin/auth/me")
          if (meRes.ok && isMounted) {
            const meData = await meRes.json()
            if (meData.authenticated && meData.profile) {
              const latestExplicit = getExplicitStoredUser()
              const persistentCustomAvatar = loadPersistentAvatar({
                id: meData.profile.userId || meData.user?.id,
                email: meData.profile.email || meData.user?.email || "",
                name: latestExplicit?.name || meData.profile.name,
              })
              const profile = {
                ...meData.profile,
                ...(latestExplicit || {}),
                email: meData.profile.email || meData.user?.email || "",
                id: meData.profile.userId || meData.user?.id,
                avatar:
                  persistentCustomAvatar ||
                  (latestExplicit?.avatar && !latestExplicit.avatar.includes("api.dicebear.com") ? latestExplicit.avatar : "") ||
                  meData.profile.avatar ||
                  latestExplicit?.avatar,
              }
              saveStoredUser(profile)
              setUserData(getExplicitStoredUser() || profile)
            } else {
              localStorage.removeItem("connectin_verified")
              setUserData(NEUTRAL_UNAUTHENTICATED_USER)
              setIsAuthenticated(false)
              if (typeof window !== "undefined") {
                window.location.replace("/connectin-login")
              }
            }
          }
        } catch (e) { /* silent */ }
        return
      }

      // Check server session cleanly before finalizing hydration so fresh visits don't flash content while redirecting
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
            const persistentCustomAvatar = loadPersistentAvatar({
              id: meData.profile.userId || meData.user?.id,
              email: meData.profile.email || meData.user?.email || "",
              name: latestExplicit?.name || meData.profile.name,
            })
            const profile = {
              ...meData.profile,
              ...(latestExplicit || {}),
              email: meData.profile.email || meData.user?.email || "",
              id: meData.profile.userId || meData.user?.id,
              avatar:
                persistentCustomAvatar ||
                (latestExplicit?.avatar && !latestExplicit.avatar.includes("api.dicebear.com") ? latestExplicit.avatar : "") ||
                meData.profile.avatar ||
                latestExplicit?.avatar,
            }
            saveStoredUser(profile)
            const storedAfterSave = getExplicitStoredUser() || profile
            setUserData(storedAfterSave)
            setIsAuthenticated(true)
            setHasHydrated(true)
            if (resolvedUrlTab && (resolvedUrlTab !== 'adminiam' || isSuperAdminUser(storedAfterSave))) {
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

      // Require sign-in on fresh APK/device/browser visits without an active session
      if (isMounted) {
        setUserData(NEUTRAL_UNAUTHENTICATED_USER)
        setIsAuthenticated(false)
        setHasHydrated(true)
        if (typeof window !== "undefined") {
          window.location.replace("/connectin-login")
        }
      }
    }

    initializeAuth()
    return () => { isMounted = false }
  }, [router])

  // Direct Deep-Link Handler for Shared Feed Posts (?postId=...)
  useEffect(() => {
    if (typeof window === "undefined") return
    const urlParams = new URLSearchParams(window.location.search)
    const sharedPostId = (urlParams.get("postId") || "").trim()
    const sharedPostTitle = (urlParams.get("postTitle") || "").trim()
    const sharedPostAuthor = (urlParams.get("postAuthor") || "").trim()
    const sharedVideoId = (urlParams.get("video") || "").trim()
    if (!sharedPostId) return

    setActiveTab("home")
    setPosts((prev) => {
      const existing = prev.find((p) => p.id === sharedPostId)
      if (existing) {
        return [existing, ...prev.filter((p) => p.id !== sharedPostId)]
      }
      if (!sharedPostTitle) return prev
      const constructedPost: Post = {
        id: sharedPostId,
        author: {
          name: sharedPostAuthor || "ConnectLn Member",
          headline: "Shared via ConnectLn Direct Link",
          avatar: generatePersonalSignatureAvatar(sharedPostAuthor || "ConnectLn Member"),
          isVerified: true,
        },
        timestamp: "Shared just now",
        content: sharedPostTitle,
        likes: 42,
        commentsCount: 8,
        reposts: 12,
        userReaction: null,
        isSaved: false,
        comments: [],
        media: sharedVideoId
          ? {
              type: "video",
              url: `https://www.youtube.com/watch?v=${sharedVideoId}`,
              youtubeId: sharedVideoId,
              title: sharedPostTitle,
            }
          : undefined,
      }
      return [constructedPost, ...prev]
    })

    const timer = setTimeout(() => {
      const el = document.getElementById(`connectln-post-${sharedPostId}`)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [])

  // Hard guard: Normal users must never land on the adminiam tab
  const [focusedLearnLessonId, setFocusedLearnLessonId] = useState<string | null>(null)
  const [focusedLearnCategory, setFocusedLearnCategory] = useState<any>(null)

  useEffect(() => {
    if (activeTab === 'adminiam' && !isSuperAdminUser(userData)) {
      setActiveTab('home')
    }
  }, [activeTab, userData])

  // Sign out handler: Completely signs out and redirects to the ConnectLn 360 Portal
  const handleSignOut = async () => {
    trackUserActivity({
      actionType: 'USER_LOGOUT',
      actionLabel: 'Signed Out of Session',
      category: 'auth',
      targetTitle: 'ConnectLn Session',
      details: `Signed out from ${userData?.name || 'ConnectLn'}`
    })
    try {
      await fetch("/api/connectin/auth/logout", { method: "POST" })
    } catch (e) {
      // ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("connectin_user_profile")
      localStorage.removeItem("connectin_user_v1")
      localStorage.removeItem("connectin_session_route")
      localStorage.removeItem("connectin_active_tab_v1")
      localStorage.removeItem("connectin_verified")
      sessionStorage.removeItem("connectin_authenticated")
      localStorage.setItem("connectin_is_signed_out", "true")
      setIsAuthenticated(false)
      window.location.replace("/connectin-portal")
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

  // Automatically sync the user's active enclave and profession-tiered videos/stories to the profession selected at login
  useEffect(() => {
    if (!userData) return
    const resolvedProf = resolveProfessionForUser(userData)
    const targetEnclave = resolvedProf?.enclaveId || userData.professionEnclave
    if (targetEnclave) {
      setSelectedEnclaves([targetEnclave])
    }

    const tieredPosts = buildProfessionTieredFeedPosts({
      ...userData,
      professionId: resolvedProf?.id || userData.professionId,
      profession: userData.profession || resolvedProf?.title,
      professionEnclave: targetEnclave
    })
    if (!tieredPosts || tieredPosts.length === 0) return

    setPosts(prev => {
      const firstExisting = prev.find(p => p.id === 'post_dstrike_wheel_masterclass')
      const hasWrongEnclaveCatalog = prev.some(
        p =>
          p.id?.startsWith('post_prof_video_catalog_') &&
          targetEnclave &&
          p.professionEnclave &&
          p.professionEnclave !== targetEnclave
      )
      if (
        !hasWrongEnclaveCatalog &&
        firstExisting &&
        firstExisting.professionId === tieredPosts[0].professionId &&
        firstExisting.media?.youtubeId === tieredPosts[0].media?.youtubeId &&
        prev.some(p => p.id === tieredPosts[1]?.id)
      ) {
        return prev
      }

      const isUserCreatedPost = (p: Post) =>
        Boolean(
          p &&
            (p.isUserCreated ||
              p.id?.startsWith('user_post_') ||
              p.id?.startsWith('post_story_share_') ||
              (p.author?.connectionDegree === 'You' &&
                !p.isProfessionTiered &&
                p.id !== 'post_dstrike_wheel_masterclass' &&
                !p.id?.startsWith('post_prof_') &&
                p.id !== 'post_poll_1'))
        )

      const userCreatedInPrev = prev.filter(isUserCreatedPost)
      const userCreatedIds = new Set(userCreatedInPrev.map(p => p.id))
      const tieredIds = new Set(tieredPosts.map(tp => tp.id))
      const cleanedPrev = prev.filter(p => {
        if (userCreatedIds.has(p.id)) return false
        if (p.id === 'post_dstrike_wheel_masterclass') return false
        if (p.id.startsWith('post_prof_')) return false
        if (tieredIds.has(p.id)) return false
        return true
      })

      return [...userCreatedInPrev, ...tieredPosts, ...cleanedPrev]
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

  // Sync live registered users from database into suggested network & push active user heartbeat globally
  useEffect(() => {
    let isMounted = true

    const syncLiveUsers = async () => {
      try {
        // 1. Fire non-blocking heartbeat push of current user + local accounts (preserving compact real avatars)
        if (
          isAuthenticated === true &&
          userData &&
          userData.name &&
          userData.id !== "guest_unauthenticated" &&
          !String(userData.id || "").startsWith("guest-")
        ) {
          const clientTimezone =
            typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined
          const crispAvatar = await resolveAndCompressLocalCallerAvatar(userData, 60000).catch(
            () => undefined
          )
          const cloudCompactAvatar =
            crispAvatar && crispAvatar.startsWith("data:") && crispAvatar.length > 6500
              ? (await compressAvatarForCallSignal(crispAvatar, 6500).catch(() => undefined)) ||
                undefined
              : crispAvatar
          const localDir = loadStoredAdminUsers()
            .slice(0, 8)
            .map((bu) => ({
              ...bu,
              avatar:
                bu.avatar &&
                !isPlaceholderCallAvatar(bu.avatar) &&
                (!bu.avatar.startsWith("data:") || bu.avatar.length <= 6500)
                  ? bu.avatar
                  : undefined,
            }))
          const safeAvatar =
            cloudCompactAvatar ||
            (userData.avatar &&
            !isPlaceholderCallAvatar(userData.avatar) &&
            (!userData.avatar.startsWith("data:") || userData.avatar.length <= 6500)
              ? userData.avatar
              : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}&backgroundColor=0a66c2`)

          const linkedPhone = (userData as any).phone || getMyLinkedConnectLnPhone()
          if (crispAvatar && linkedPhone) {
            fetch("/api/connectin/calls/whatsapp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "register",
                phone: linkedPhone,
                name: userData.name,
                email: userData.email,
                avatar: crispAvatar,
                headline: userData.headline,
              }),
            }).catch(() => {})
          }

          const localActs = loadStoredUserActivityLogs()
            .slice(0, 12)
            .map(act => ({
              ...act,
              userAvatar:
                act.userAvatar && !act.userAvatar.startsWith("data:")
                  ? act.userAvatar
                  : safeAvatar
            }))

          fetch("/api/connectin/users", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: userData.id,
              userId: (userData as any).userId || userData.id,
              email: (userData as any).email,
              name: userData.name,
              role: (userData as any).role || "personal",
              headline: userData.headline,
              avatar: safeAvatar,
              coverImage: userData.coverImage && !userData.coverImage.startsWith("data:") ? userData.coverImage : undefined,
              location: userData.location,
              about: userData.about,
              skills: Array.isArray(userData.skills)
                ? userData.skills.map((s: any) => (typeof s === "string" ? s : s?.name)).filter(Boolean)
                : [],
              profession: userData.profession,
              professionId: userData.professionId,
              professionCategory: userData.professionCategory,
              professionEnclave: userData.professionEnclave,
              authProvider: (userData as any).authProvider || "Active Session",
              clientTimezone,
              batchUsers: localDir,
              batchActivities: localActs
            })
          }).catch(() => {})
        }

        // 2. Immediately pull all globally synced users from Cloud Sync Map
        const res = await fetch("/api/connectin/users", { cache: "no-store" })
        if (res.ok && isMounted) {
          const data = await res.json()
          if (data.success && Array.isArray(data.users)) {
            const seenLiveIds = new Set<string>()
            const seenLiveNames = new Set<string>()
            const liveSuggested: SuggestedConnection[] = []

            for (const u of data.users) {
              if (!u || !u.name) continue
              const normName = String(u.name).toLowerCase().trim()
              if (
                u.id === userData?.id ||
                normName === String(userData?.name || "").toLowerCase().trim() ||
                seenLiveNames.has(normName)
              ) {
                continue
              }
              seenLiveNames.add(normName)
              const uniqueId = seenLiveIds.has(u.id)
                ? `${u.id}_${normName.replace(/[^a-z0-9]/g, "")}`
                : u.id || `USR_${normName.replace(/[^a-z0-9]/g, "")}`
              seenLiveIds.add(uniqueId)

              const prof = u.professionId ? findProfessionById(u.professionId) : undefined
              const enclaveId = u.professionEnclave || prof?.enclaveId
              const enclave = enclaveId ? findEnclaveById(enclaveId) : undefined

              // Normalize skills strictly to string[] so capabilities never contains objects
              const normalizedRawSkills: string[] = Array.isArray(u.skills)
                ? u.skills
                    .map((s: any) => (typeof s === "string" ? s : s?.name ? String(s.name) : ""))
                    .filter(Boolean)
                : []

              const userSkills: string[] =
                normalizedRawSkills.length > 0
                  ? normalizedRawSkills
                  : prof?.typicalSkills && prof.typicalSkills.length > 0
                  ? prof.typicalSkills
                  : enclave?.skills && enclave.skills.length > 0
                  ? enclave.skills.slice(0, 4)
                  : ["Technical Architecture", "Domain Security", "Zero Trust", "Compliance"]

              const enclaveBadge = enclave ? `${enclave.icon} ${enclave.shortName} Enclave` : "✓ Verified Member"
              const cleanAvatar =
                u.avatar &&
                !u.avatar.startsWith("data:image/svg+xml") &&
                !isForeignPersonaAvatar(u.avatar, { name: u.name, email: u.email })
                  ? u.avatar
                  : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}&backgroundColor=0a66c2`

              liveSuggested.push({
                id: uniqueId,
                name: u.name,
                email: u.email || "",
                headline: u.headline || `${u.profession || "Specialist"} · ConnectIn Verified Network`,
                avatar: cleanAvatar,
                mutualConnections: 14,
                capabilities: userSkills.slice(0, 4).map(String),
                verifiedBadges: [enclaveBadge, "✓ 2FA Active"],
                circle: enclave ? `${enclave.icon} ${enclave.name}` : "ConnectIn Verified Network",
                matchScore: 96,
                isConnected: false,
                isPending: false
              })
            }

            setSuggestedPeople(prev => {
              const liveMap = new Map(liveSuggested.map(p => [p.id, p]))
              const liveNameMap = new Map(liveSuggested.map(p => [p.name.toLowerCase().trim(), p]))

              // Upgrade any existing connections with fresh profession data & sanitized string capabilities
              const updatedPrev = prev.map(p => {
                const fresh = liveMap.get(p.id) || liveNameMap.get(p.name.toLowerCase().trim())
                const safePrevCaps = Array.isArray(p.capabilities)
                  ? p.capabilities.map((c: any) => (typeof c === "string" ? c : String(c?.name || c || ""))).filter(Boolean)
                  : []
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
                return {
                  ...p,
                  capabilities: safePrevCaps
                }
              })

              const existingIds = new Set(updatedPrev.map(p => p.id))
              const existingNames = new Set(updatedPrev.map(p => p.name.toLowerCase().trim()))
              const freshUnseen = liveSuggested.filter(
                p => !existingIds.has(p.id) && !existingNames.has(p.name.toLowerCase().trim())
              )
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
  }, [userData?.id, userData?.email, userData?.name, userData?.avatar])

  // Open any clicked member's full Workspace & Identity
  const handleInspectMember = (memberInput: any) => {
    if (!memberInput) return
    const targetName = String(memberInput.name || "").trim()
    if (!targetName) return

    try {
      // If the user clicked on their own name/card, open their own workspace
      if (
        targetName.toLowerCase() === String(userData.name || "").toLowerCase().trim() ||
        (memberInput.id && memberInput.id === userData.id)
      ) {
        setInspectedMember(null)
        setActiveTab("profile")
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }

      const adminMatches = loadStoredAdminUsers()
      const matchedDir = adminMatches.find(
        a => a.name.toLowerCase().trim() === targetName.toLowerCase()
      )
      const matchedSuggested = suggestedPeople.find(
        s => s.name.toLowerCase().trim() === targetName.toLowerCase() || (memberInput.id && s.id === memberInput.id)
      )

      const rawHeadline = String(
        memberInput.headline ||
        memberInput.role ||
        matchedSuggested?.headline ||
        matchedDir?.headline ||
        "Verified Specialist · ConnectIn Network"
      )

      const rawCapabilities: string[] = (
        memberInput.capabilities ||
        (Array.isArray(memberInput.skills) ? memberInput.skills : matchedSuggested?.capabilities) ||
        []
      )
        .map((s: any) => (typeof s === "string" ? s : s?.name ? String(s.name) : ""))
        .filter(Boolean)

      const rawBadges: string[] = (
        memberInput.verifiedBadges || matchedSuggested?.verifiedBadges || []
      )
        .map((b: any) => String(b || ""))
        .filter(Boolean)

      const safeMemberEmail = `${targetName.toLowerCase().replace(/[^a-z0-9]/g, ".")}@connectin.app`
      const detectionText = `${rawHeadline} ${rawCapabilities.join(" ")} ${rawBadges.join(" ")} ${memberInput.circle || ""} ${matchedDir?.organization || ""}`

      const baseDetected = createUniqueUserProfile({
        id: memberInput.id || matchedSuggested?.id || matchedDir?.id || `member_${targetName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        name: targetName,
        email: safeMemberEmail,
        headline: detectionText,
        profession: memberInput.profession || undefined,
        location: memberInput.location || matchedDir?.location
      })

      const enclaveDef = baseDetected.professionEnclave ? findEnclaveById(baseDetected.professionEnclave) : undefined
      const cleanProfessionTitle =
        memberInput.profession ||
        baseDetected.profession ||
        rawHeadline.split("·")[0]?.split("@")[0]?.trim() ||
        "Verified Specialist"

      const rawSkillsSource =
        rawCapabilities.length > 0
          ? rawCapabilities
          : Array.isArray(baseDetected.skills)
          ? baseDetected.skills
          : ["Domain Architecture", "Verified Execution", "Zero Trust", "Strategic Leadership"]

      const resolvedSkills = rawSkillsSource.map((item: any, idx: number) => {
        const skillName = typeof item === "string" ? item : String(item?.name || "Verified Competency")
        return {
          name: skillName,
          endorsements: typeof item === "object" && item?.endorsements ? Number(item.endorsements) : Math.max(18, 52 - idx * 5),
          endorsers:
            typeof item === "object" && Array.isArray(item?.endorsers)
              ? item.endorsers
              : ["Verified Peer Network", "ConnectIn Guild"]
        }
      })

      const resolvedCompany =
        memberInput.company ||
        memberInput.org ||
        matchedDir?.organization ||
        (rawHeadline.includes("@") ? rawHeadline.split("@")[1]?.split("·")[0]?.trim() : "") ||
        enclaveDef?.name ||
        "ConnectIn Verified Enterprise"

      const resolvedLocation =
        memberInput.location ||
        matchedDir?.location ||
        baseDetected.location ||
        "United States · Verified Enclave"

      const candidateAvatar =
        memberInput.avatar ||
        matchedSuggested?.avatar ||
        matchedDir?.avatar ||
        ""

      const safeAvatar =
        candidateAvatar &&
        !candidateAvatar.startsWith("data:image/svg+xml") &&
        !isForeignPersonaAvatar(candidateAvatar, { name: targetName, email: safeMemberEmail })
          ? candidateAvatar
          : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(targetName)}&backgroundColor=0a66c2`

      const memberProfile: UserProfile = {
        ...baseDetected,
        id: memberInput.id || matchedSuggested?.id || matchedDir?.id || baseDetected.id,
        name: targetName,
        headline: rawHeadline,
        profession: cleanProfessionTitle,
        avatar: safeAvatar,
        coverImage:
          memberInput.coverImage ||
          matchedSuggested?.coverImage ||
          baseDetected.coverImage ||
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80",
        location: resolvedLocation,
        connectionsCount: memberInput.connectionsCount || matchedDir?.connectionsCount || baseDetected.connectionsCount || 640,
        about:
          memberInput.about ||
          `${targetName} is a verified ${cleanProfessionTitle} operating in the ${enclaveDef?.name || baseDetected.professionCategory || "ConnectIn"} community on ConnectIn. "${rawHeadline}". Specializing in ${resolvedSkills.map((s) => s.name).slice(0, 4).join(", ")}.`,
        skills: resolvedSkills,
        experience:
          Array.isArray(memberInput.experience) && memberInput.experience.length > 0
            ? memberInput.experience
            : [
                {
                  id: `exp_${targetName.replace(/[^a-zA-Z0-9]/g, "_")}_1`,
                  role: rawHeadline.split("·")[0]?.split("@")[0]?.trim() || cleanProfessionTitle,
                  company: resolvedCompany,
                  companyLogo: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=100&auto=format&fit=crop&q=80",
                  employmentType: "Full-time",
                  duration: "2022 - Present · 4 yrs",
                  location: resolvedLocation,
                  description: `Leading ${cleanProfessionTitle} operations, field standards, and verified deliverables across ${resolvedSkills.map((s) => s.name).slice(0, 3).join(", ")}.`,
                  skills: resolvedSkills.map((s) => s.name).slice(0, 4)
                },
                ...(Array.isArray(baseDetected.experience) ? baseDetected.experience.slice(1) : [])
              ]
      }

      setInspectedMember(memberProfile)
      setActiveTab("profile")
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
      // Record cross-user Credential & Dossier Check in Cloud Sync AND Live Telemetry so the target member sees who viewed their profile and the viewer's Content Reach increments live
      if (memberProfile.name && userData.name && memberProfile.name.toLowerCase() !== userData.name.toLowerCase()) {
        recordLiveProfileView({
          targetName: memberProfile.name,
          viewerName: userData.name,
          viewerHeadline: userData.headline || `${userData.profession || 'Verified ConnectLn Professional'} · ConnectLn Member`,
          viewerAvatar: userData.avatar || '',
          viewerCompany: userData.profession || 'ConnectLn Network',
          viewerLocation: userData.location || 'United States',
          viewVector: 'Profile & Dossier Inspection'
        })
      }
    } catch (err) {
      console.error("[ConnectIn] Failed to inspect member workspace:", err)
    }
  }

  // Handle Post Creation
  const handleAddPost = (newPostData: Omit<Post, 'id' | 'timestamp' | 'stats' | 'comments'>) => {
    const resolvedProf = resolveProfessionForUser(userData)
    const currentProfId = resolvedProf?.id || userData.professionId
    const effectiveEnclave = selectedEnclaves[0] && selectedEnclaves[0] !== 'all'
      ? selectedEnclaves[0]
      : (userData.professionEnclave || 'trades_construction')

    const newPostId = 'user_post_' + Date.now()
    const newPost: Post = {
      ...newPostData,
      isUserCreated: true,
      authorEmail: userData.email,
      createdAtMs: Date.now(),
      professionId: newPostData.professionId || currentProfId,
      professionEnclave: newPostData.professionEnclave || effectiveEnclave,
      feedCategory: newPostData.feedCategory || 'for_you',
      feedSubCategory: newPostData.feedSubCategory || 'All',
      id: newPostId,
      author: {
        ...newPostData.author,
        email: userData.email,
      },
      timestamp: 'Just now · 🌐',
      stats: {
        likesCount: 1,
        commentsCount: 0,
        repostsCount: 0,
        reactionsBreakdown: {
          like: newPostData.postType === 'celebration' ? 0 : 1,
          celebrate: newPostData.postType === 'celebration' ? 1 : 0,
          support: 0,
          love: 0,
          insightful: 0,
          funny: 0
        }
      },
      userReaction: newPostData.postType === 'celebration' ? 'celebrate' : newPostData.userReaction ?? null,
      comments: []
    }

    setActiveTab('home')
    setActiveFeedCategory('for_you')
    setActiveFeedSubCategory('All')
    setFeedTypeFilter('all')
    setSelectedTagFilter(null)
    setSearchQuery('')

    setPosts(prev => {
      const updated = [newPost, ...prev.filter(p => p.id !== newPostId)]
      saveStoredPosts(updated)
      return updated
    })

    // Persist newly created post to MongoDB Atlas so every ConnectLn user sees it in their feed
    fetch('/api/connectin/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        post: newPost,
        authorId: userData.id,
        authorName: newPost.author.name,
        authorEmail: userData.email,
        authorHeadline: newPost.author.headline,
        authorAvatar: newPost.author.avatar,
        content: newPost.content,
        feedCategory: newPost.feedCategory,
        feedSubCategory: newPost.feedSubCategory,
        hashtags: newPost.hashtags || [],
      }),
    }).catch(() => {})

    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const el = document.getElementById(`connectln-post-${newPostId}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 120)
    }

    if (userData?.name) {
      recordLiveContentReach({
        userName: userData.name,
        title: `Published ${newPost.media?.type ? newPost.media.type.toUpperCase() : newPost.postType ? newPost.postType.toUpperCase() : 'Feed Post'}: "${(newPost.content || '').slice(0, 60)}"`,
        category: 'Feed Post',
        actorName: userData.name
      })
    }
    trackUserActivity({
      actionType: 'POST_CREATED',
      actionLabel: `Published a New Post (${newPost.media?.type ? newPost.media.type.toUpperCase() : newPost.postType ? newPost.postType.toUpperCase() : 'Feed Post'})`,
      category: 'content',
      targetId: newPost.id,
      targetTitle: `Post by ${userData.name}`,
      details: (newPost.content || '').slice(0, 140),
      user: userData
    })
  }

  const handleDeletePost = (postId: string) => {
    setPosts(prev => {
      const updated = prev.filter(p => p.id !== postId)
      saveStoredPosts(updated)
      return updated
    })
    fetch(`/api/connectin/posts?id=${encodeURIComponent(postId)}`, {
      method: 'DELETE',
    }).catch(() => {})
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
    trackUserActivity({
      actionType: 'POST_SHARED',
      actionLabel: 'Shared Video from The Wheel to Feed',
      category: 'engagement',
      targetTitle: video.title,
      details: `Shared video "${video.title}" (${video.speaker || 'ConnectLn Masterclass'}) to Feed`,
      user: userData
    })
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
  const applySingleServerInteraction = (postId: string, interaction?: PersistedPostInteractionDoc | null) => {
    if (!interaction) return
    latestInteractionsRef.current = {
      ...latestInteractionsRef.current,
      [postId]: interaction,
    }
    const myKey = getCurrentUserReactionKey(userData)
    const myEmail = String(userData.email || '').trim().toLowerCase()
    const myName = String(userData.name || '').trim().toLowerCase()
    setPosts(prev => {
      const updated = prev.map(p =>
        p.id === postId
          ? applyInteractionToPost(p, interaction, baselinePostStatsRef.current, myKey, myEmail, myName)
          : p
      )
      saveStoredPosts(updated)
      return updated
    })
  }

  const handleToggleReaction = (postId: string, reaction: ReactionType | null) => {
    const targetPost = posts.find(p => p.id === postId)
    lastPostInteractionWriteMsRef.current[postId] = Date.now()
    if (reaction && userData?.name) {
      recordLiveContentReach({
        userName: userData.name,
        title: `Reacted (${reaction}) to post by ${targetPost?.author?.name || 'Member'}: "${(targetPost?.content || '').slice(0, 50)}"`,
        category: 'Feed Post',
        actorName: userData.name
      })
      if (targetPost?.author?.name && targetPost.author.name.toLowerCase() !== userData.name.toLowerCase()) {
        recordLiveContentReach({
          userName: targetPost.author.name,
          title: `${userData.name} reacted (${reaction}) to your post`,
          category: 'Feed Post',
          actorName: userData.name
        })
      }
    }
    setPosts(prev => {
      const updated = prev.map(p => {
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
      saveStoredPosts(updated)
      return updated
    })

    fetch('/api/connectin/posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'react',
        postId,
        reaction,
        userId: userData.id,
        userName: userData.name,
        userEmail: userData.email,
      }),
    })
      .then(async (res) => {
        if (!res.ok) return
        const data = await res.json()
        if (data?.interaction) {
          applySingleServerInteraction(postId, data.interaction)
        }
      })
      .catch(() => {})
  }

  // Handle Comments & Replies
  const handleAddComment = (postId: string, commentText: string, parentCommentId?: string) => {
    const targetPost = posts.find(p => p.id === postId)
    lastPostInteractionWriteMsRef.current[postId] = Date.now()
    if (userData?.name) {
      recordLiveContentReach({
        userName: userData.name,
        title: `Commented on post by ${targetPost?.author?.name || 'Member'}: "${commentText.slice(0, 50)}"`,
        category: 'Feed Post',
        actorName: userData.name
      })
      if (targetPost?.author?.name && targetPost.author.name.toLowerCase() !== userData.name.toLowerCase()) {
        recordLiveContentReach({
          userName: targetPost.author.name,
          title: `${userData.name} commented on your post: "${commentText.slice(0, 50)}"`,
          category: 'Feed Post',
          actorName: userData.name
        })
      }
    }
    const clientCommentId = `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    const resolvedAuthorAvatar = resolveUserProfilePicture(userData)
    const newComment = {
      id: clientCommentId,
      author: {
        name: userData.name,
        headline: userData.headline,
        avatar: resolvedAuthorAvatar,
        email: userData.email,
        connectionDegree: 'You' as const
      },
      content: commentText,
      timestamp: 'Just now',
      createdAtMs: Date.now(),
      likesCount: 0,
      isLiked: false
    }

    setPosts(prev => {
      const updated = prev.map(p => {
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
      saveStoredPosts(updated)
      return updated
    })

    fetch('/api/connectin/posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'comment',
        postId,
        commentId: clientCommentId,
        content: commentText,
        parentCommentId,
        author: {
          name: userData.name,
          headline: userData.headline,
          avatar: resolvedAuthorAvatar,
          email: userData.email,
        },
        userId: userData.id,
        userName: userData.name,
        userEmail: userData.email,
      }),
    })
      .then(async (res) => {
        if (!res.ok) return
        const data = await res.json()
        if (data?.interaction) {
          applySingleServerInteraction(postId, data.interaction)
        }
      })
      .catch(() => {})
  }

  // Handle Persistent Comment Likes across users
  const handleLikeComment = (postId: string, commentId: string) => {
    lastPostInteractionWriteMsRef.current[postId] = Date.now()
    setPosts(prev => {
      const updated = prev.map(p => {
        if (p.id !== postId) return p
        return {
          ...p,
          comments: p.comments.map(c => {
            if (c.id !== commentId) return c
            const nextLiked = !c.isLiked
            return {
              ...c,
              isLiked: nextLiked,
              likesCount: Math.max(0, Number(c.likesCount || 0) + (nextLiked ? 1 : -1)),
            }
          }),
        }
      })
      saveStoredPosts(updated)
      return updated
    })

    fetch('/api/connectin/posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'like_comment',
        postId,
        commentId,
        userId: userData.id,
        userName: userData.name,
        userEmail: userData.email,
      }),
    })
      .then(async (res) => {
        if (!res.ok) return
        const data = await res.json()
        if (data?.interaction) {
          applySingleServerInteraction(postId, data.interaction)
        }
      })
      .catch(() => {})
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
    const targetPost = posts.find(p => p.id === postId)
    const nextSaved = targetPost ? !targetPost.isSaved : true
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, isSaved: !p.isSaved } : p))
    )
    if (nextSaved && userData?.name) {
      recordLiveContentReach({
        userName: userData.name,
        title: `Saved & Reached Content by ${targetPost?.author?.name || 'Member'}: "${(targetPost?.content || '').slice(0, 50)}"`,
        category: 'Feed Post',
        actorName: userData.name
      })
    }
    trackUserActivity({
      actionType: 'POST_SAVED',
      actionLabel: nextSaved ? 'Bookmarked / Saved Post' : 'Removed Post Bookmark',
      category: 'engagement',
      targetId: postId,
      targetTitle: targetPost ? `Post by ${targetPost.author.name}` : postId,
      details: targetPost ? `Saved post: "${(targetPost.content || '').slice(0, 90)}..."` : 'Saved post to bookmarks',
      user: userData
    })
  }

  // Handle Repost & Quote Post to ConnectIn Network Feed
  const handleRepostPost = (originalPost: Post, quoteText?: string) => {
    // 1. Increment repost count on target post
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== originalPost.id) return p
        return {
          ...p,
          stats: {
            ...p.stats,
            repostsCount: (p.stats.repostsCount || 0) + 1
          }
        }
      })
    )

    // 2. Create newly reposted post
    const newPostId = 'repost_' + Date.now()
    const newPost: Post = {
      id: newPostId,
      isUserCreated: true,
      professionId: userData.professionId,
      professionEnclave: userData.professionEnclave || 'trades_construction',
      feedCategory: 'for_you',
      feedSubCategory: 'All',
      author: {
        id: 'usr_' + (userData.name || 'me').toLowerCase().replace(/\s+/g, '_'),
        name: userData.name,
        headline: userData.headline,
        avatar: userData.avatar,
        connectionDegree: 'You'
      },
      timestamp: 'Just now · 🌐',
      visibility: 'Public',
      content: quoteText ? quoteText : '',
      postType: 'standard',
      quotedPost: {
        id: originalPost.id,
        authorName: originalPost.author.name,
        authorHeadline: originalPost.author.headline,
        authorAvatar: originalPost.author.avatar,
        timestamp: originalPost.timestamp,
        content: originalPost.content
      },
      repostedBy: quoteText ? undefined : {
        name: userData.name,
        headline: userData.headline,
        avatar: userData.avatar
      },
      stats: {
        likesCount: 1,
        commentsCount: 0,
        repostsCount: 0,
        reactionsBreakdown: { like: 1, celebrate: 0, support: 0, love: 0, insightful: 0, funny: 0 }
      },
      userReaction: 'like',
      comments: []
    }

    setPosts(prev => {
      const updated = [newPost, ...prev]
      saveStoredPosts(updated)
      return updated
    })

    recordLiveContentReach({
      userName: userData.name,
      title: quoteText
        ? `Quoted post by ${originalPost.author.name}: "${quoteText.slice(0, 40)}..."`
        : `Reposted ${originalPost.author.name}'s post to network feed`,
      category: 'Feed Post',
      actorName: userData.name
    })

    if (originalPost.author?.name && originalPost.author.name.toLowerCase() !== userData.name.toLowerCase()) {
      recordLiveContentReach({
        userName: originalPost.author.name,
        title: `${userData.name} reposted your post to their network`,
        category: 'Feed Post',
        actorName: userData.name
      })
    }
  }

  // Handle Connect / Follow Toggles — sends an invitation first (moves to My Connections when Accepted)
  const handleToggleConnect = (personId: string) => {
    const normInput = String(personId || "").toLowerCase().trim()
    const targetPerson =
      suggestedPeople.find(p => p.id === personId || p.name.toLowerCase().trim() === normInput) ||
      (inspectedMember &&
      (inspectedMember.id === personId || String(inspectedMember.name || "").toLowerCase().trim() === normInput)
        ? {
            id: inspectedMember.id || `member_${normInput}`,
            name: inspectedMember.name,
            email: inspectedMember.email || "",
            headline: inspectedMember.headline || "Verified Professional · ConnectIn Member",
            avatar:
              inspectedMember.avatar ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(inspectedMember.name || "M")}&backgroundColor=0a66c2`,
            isConnected: false,
            isPending: false
          }
        : undefined)
    setSuggestedPeople(prev => {
      const updated = prev.map(person => {
        if (person.id !== personId && person.name.toLowerCase().trim() !== normInput) {
          return person
        }
        if (person.isConnected || person.isPending) {
          return { ...person, isConnected: false, isPending: false }
        }
        return { ...person, isConnected: false, isPending: true }
      })
      saveStoredConnections(updated)
      return updated
    })
    if (targetPerson && !targetPerson.isConnected && !targetPerson.isPending) {
      const itemCid = `cin_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`
      if (typeof window !== "undefined") {
        try {
          const emailPart = String(userData.email || "")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]/g, "_")
          const namePart = String(userData.name || "guest")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]/g, "_")
          const userScopeKey = `${emailPart}__${namePart}`
          const raw = localStorage.getItem(`connectin_outbound_v6_${userScopeKey}`)
          const existing = raw ? JSON.parse(raw) : []
          const newOut = {
            id: `out_${itemCid}`,
            cid: itemCid,
            name: targetPerson.name,
            headline: targetPerson.headline,
            avatar: targetPerson.avatar,
            sentAt: "Just now",
            status: "pending",
            type: "person"
          }
          const filtered = Array.isArray(existing)
            ? existing.filter((i: any) => i && i.id !== "out_1" && i.id !== "out_2" && String(i.name || "").toLowerCase().trim() !== targetPerson.name.toLowerCase().trim())
            : []
          localStorage.setItem(`connectin_outbound_v6_${userScopeKey}`, JSON.stringify([newOut, ...filtered]))
        } catch {}
      }
      const compactSenderAvatar =
        userData.avatar && !String(userData.avatar).startsWith("data:")
          ? userData.avatar
          : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name || "M")}&backgroundColor=0a66c2`
      const compactRecipientAvatar =
        targetPerson.avatar && !String(targetPerson.avatar).startsWith("data:")
          ? targetPerson.avatar
          : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(targetPerson.name || "M")}&backgroundColor=0a66c2`

      fetch("/api/connectin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "member_connect",
          cid: itemCid,
          recipientName: targetPerson.name,
          recipientEmail: (targetPerson as any).email || "",
          recipientHeadline: targetPerson.headline,
          recipientAvatar: compactRecipientAvatar,
          senderName: userData.name,
          senderEmail: userData.email || "",
          senderHeadline: userData.headline,
          senderAvatar: compactSenderAvatar
        })
      }).catch(() => {})
      if (targetPerson.name && userData.name) {
        recordLiveDirectoryDiscovery({
          userName: targetPerson.name,
          keyword: `Connection Invitation from ${userData.name} (${userData.profession || 'Verified Member'})`,
          searcherName: userData.name,
          searcherRole: userData.headline || userData.profession || 'Verified ConnectLn Member'
        })
        recordLiveContentReach({
          userName: userData.name,
          title: `Expanded Trade Network · Invited ${targetPerson.name}`,
          category: 'Profile',
          actorName: userData.name
        })
      }
      trackUserActivity({
        actionType: 'USER_INVITED',
        actionLabel: 'Sent Connection Invitation',
        category: 'network',
        targetId: personId,
        targetTitle: targetPerson.name,
        details: `Sent connection invitation to ${targetPerson.name} (${targetPerson.headline})`,
        user: userData
      })
    }
  }

  // Add Certificate from Learning View to Profile
  const handleAddCertificateToProfile = (course: any) => {
    const certTitle = typeof course === 'string' ? course : (course?.title || 'Professional Certification');
    const newCert = {
      id: 'cert_' + Date.now(),
      title: certTitle,
      issuer: 'ConnectIn Learning',
      issuerLogo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80',
      issueDate: `Issued ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
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

  // Filter & Tier Posts based on the User's Claimed Profession, Stream, Sub-category, Search Query, Feed Type, or Tag
  const resolvedUserProf = resolveProfessionForUser(userData)
  const activeProfId = resolvedUserProf?.id || userData?.professionId

  // Live Follow Graph state so followed members' eligible public posts immediately appear in the user's feed
  const [userFollowBundle, setUserFollowBundle] = useState<UserFollowBundle>(() =>
    loadUserFollowBundle(userData?.name)
  )

  useEffect(() => {
    if (!userData?.name) return
    const refreshFollow = () => {
      setUserFollowBundle(loadUserFollowBundle(userData.name))
    }
    refreshFollow()
    syncUserFollowBundleFromCloud(userData.name).then((cloudBundle) => {
      setUserFollowBundle(cloudBundle)
    })
    window.addEventListener('connectln-follow-updated', refreshFollow)
    return () => window.removeEventListener('connectln-follow-updated', refreshFollow)
  }, [userData?.name])

  const followedNamesSet = React.useMemo(() => {
    const s = new Set<string>()
    for (const f of userFollowBundle.following || []) {
      const k = normalizeFollowKey(f.name)
      if (k) s.add(k)
    }
    return s
  }, [userFollowBundle.following])

  const followedMemberSyntheticPosts = React.useMemo(
    () => buildFollowedMemberPosts(userFollowBundle.following || [], posts) as Post[],
    [userFollowBundle.following, posts]
  )

  const combinedFeedPosts = React.useMemo(() => {
    const seenIds = new Set<string>()
    const seenMediaSigs = new Set<string>()
    const merged: Post[] = []
    const activeEnclavePref = userData?.professionEnclave || "trades_construction"
    const isAllEnclavesSelected =
      selectedEnclaves.includes('all') || selectedEnclaves.length >= PROFESSION_ENCLAVES.length
    const enclaveMatchedHarvest = harvestedHomeItems.filter((i) =>
      isAllEnclavesSelected
        ? true
        : selectedEnclaves.length > 0
        ? selectedEnclaves.includes(i.enclaveId)
        : i.enclaveId === activeEnclavePref
    )
    const liveHarvestedPosts = enclaveMatchedHarvest
      .slice(0, 6)
      .map((item) => buildFeedPostFromHarvestedItem(item))
    const userCreatedPosts = posts.filter(
      (p) =>
        p &&
        !p.id?.startsWith('harvest_post_cln_hv_') &&
        !p.id?.startsWith('harvest_post_cln_auto_') &&
        !p.id?.startsWith('harvest_post_cln_pull_') &&
        (p.isUserCreated ||
          p.id?.startsWith('harvest_post_') ||
          (p.author?.connectionDegree === 'You' &&
            !p.isProfessionTiered &&
            p.id !== 'post_dstrike_wheel_masterclass' &&
            !p.id.startsWith('post_prof_')))
    )
    for (const p of [...userCreatedPosts, ...posts, ...followedMemberSyntheticPosts, ...liveHarvestedPosts]) {
      if (!p || !p.id || seenIds.has(p.id)) continue
      const mediaSig = getPostMediaDedupeSignature(p)
      if (seenMediaSigs.has(mediaSig)) continue
      seenIds.add(p.id)
      seenMediaSigs.add(mediaSig)
      const authorKey = normalizeFollowKey(p.author?.name)
      const isFollowed = Boolean(authorKey && followedNamesSet.has(authorKey))
      merged.push(
        isFollowed
          ? {
              ...p,
              author: {
                ...p.author,
                isFollowing: true
              }
            }
          : p
      )
    }
    return merged
  }, [
    harvestedHomeItems,
    followedMemberSyntheticPosts,
    posts,
    followedNamesSet,
    userData?.professionEnclave,
    activeProfId,
    selectedEnclaves,
  ])

  const handleSwitchActiveProfession = (profId: string) => {
    const prof = findProfessionById(profId)
    if (!prof) return
    const updatedUser: UserProfile = {
      ...userData,
      professionId: prof.id,
      profession: prof.title,
      professionCategory: prof.categoryName,
      professionEnclave: prof.enclaveId,
      headline: prof.defaultHeadline || `${prof.title} · Verified ConnectLn Member`
    }
    setUserData(updatedUser)
    saveStoredUser(updatedUser)
    setSelectedEnclaves([prof.enclaveId])
    setPosts(loadStoredPosts(updatedUser))
  }

  const isAllEnclavesSelected =
    selectedEnclaves.includes('all') || selectedEnclaves.length >= PROFESSION_ENCLAVES.length
  const hasEnclaveLiveSyncedVideo = combinedFeedPosts.some(
    (p) =>
      p.id?.startsWith('harvest_post_') &&
      p.media?.type === 'video' &&
      (isAllEnclavesSelected || selectedEnclaves.includes(p.professionEnclave || ''))
  )

  const filteredPosts = combinedFeedPosts
    .filter(post => {
      // Respect post privacy: only public / Anyone posts (or 1st-degree connection posts) are eligible via following
      const isLiveHarvestedPost = Boolean(post.id?.startsWith('harvest_post_'))
      const isUserOwnPost = Boolean(
        !isLiveHarvestedPost &&
          (post.isUserCreated ||
            post.id?.startsWith('user_post_') ||
            post.id?.startsWith('post_story_share_') ||
            post.author?.connectionDegree === 'You')
      )
      const isFollowedAuthor = Boolean(
        post.author?.isFollowing ||
        followedNamesSet.has(normalizeFollowKey(post.author?.name))
      )
      if (!isUserOwnPost && !isLiveHarvestedPost && post.visibility === 'Connections' && post.author?.connectionDegree !== '1st') {
        return false
      }

      // 0. Home Screen houses playable profession & live-synced videos scoped to the logged-in user's profession & active enclave
      const isActiveProfTiered = Boolean(
        activeProfId &&
        (post.professionId === activeProfId || post.targetProfessions?.includes(activeProfId))
      )
      const isPlayableVideoPost = post.media?.type === 'video'
      const postEnclave = post.professionEnclave || 'tech_software'
      const isAllSelected = isAllEnclavesSelected
      const matchesSelectedEnclave = postEnclave === 'all' || selectedEnclaves.includes(postEnclave)
      const isLiveSyncedEligible = Boolean(
        isLiveHarvestedPost &&
          isPlayableVideoPost &&
          (isAllSelected || matchesSelectedEnclave || !hasEnclaveLiveSyncedVideo)
      )
      const isProfessionCatalogVideo = Boolean(
        post.isProfessionTiered &&
          isPlayableVideoPost &&
          (isAllSelected || isActiveProfTiered || matchesSelectedEnclave)
      )
      if (!isAllSelected && activeFeedCategory === 'for_you' && !searchQuery && !selectedTagFilter) {
        if (!isUserOwnPost && !isFollowedAuthor && !isActiveProfTiered && !isProfessionCatalogVideo && !isLiveSyncedEligible) {
          return false
        }
      } else if (!isAllSelected && !isUserOwnPost && !isFollowedAuthor && !isActiveProfTiered && !isProfessionCatalogVideo && !isLiveSyncedEligible) {
        if (!matchesSelectedEnclave) {
          return false
        }
      }

      // On the default Home screen stream, keep ~99% playable videos (retain video posts + at most the single profession guide card; suppress legacy non-video static cards unless viewing Polls/Docs/Saved)
      if (
        activeFeedCategory === 'for_you' &&
        feedTypeFilter === 'all' &&
        !searchQuery &&
        !selectedTagFilter &&
        !isUserOwnPost &&
        !isPlayableVideoPost &&
        !post.id?.startsWith('post_prof_photo_guide_')
      ) {
        return false
      }

      // 1. Feed Stream Category
      if (activeFeedCategory === 'products') {
        if (post.feedCategory !== 'products' && !post.embeddedProduct && post.postType !== 'product_announcement') return false
      } else if (activeFeedCategory === 'research') {
        if (post.feedCategory !== 'research' && !post.hashtags?.some(h => h.toLowerCase().includes('research') || h.toLowerCase().includes('whitepaper'))) return false
      } else if (activeFeedCategory === 'following') {
        if (post.author.connectionDegree === 'You' || (!isFollowedAuthor && post.author.connectionDegree !== '1st')) return false
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
    .sort((a, b) => {
      const mappedActiveKey = mapHandyman250IdToProfessionVideoKey(activeProfId)
      const getSyncedTs = (p: Post) => {
        const direct = Number((p as any).syncedAtMs || 0)
        if (direct > 0) return direct
        const iso = Date.parse(String(p.createdAtIso || ''))
        return Number.isFinite(iso) ? iso : 0
      }
      const score = (p: Post) => {
        const isVideoBonus = p.media?.type === 'video' ? 15 : -10
        const isLiveSynced = Boolean(
          p.id?.startsWith('harvest_post_cln_custom_') || p.id?.startsWith('harvest_post_cln_live_')
        )
        const matchesUserEnclave = Boolean(
          p.professionEnclave &&
            (userData?.professionEnclave === p.professionEnclave ||
              selectedEnclaves.includes(p.professionEnclave))
        )
        // Fresh 24h live-synced videos matching the user's selected profession enclave rise straight to the top
        if (isLiveSynced && matchesUserEnclave) {
          return 145 + isVideoBonus
        }
        if (
          p.id?.startsWith('user_post_') ||
          p.id?.startsWith('post_story_share_') ||
          (!p.id?.startsWith('harvest_post_') &&
            (p.isUserCreated ||
              (p.author?.connectionDegree === 'You' &&
                !p.isProfessionTiered &&
                p.id !== 'post_dstrike_wheel_masterclass' &&
                !p.id.startsWith('post_prof_') &&
                p.id !== 'post_poll_1')))
        ) {
          return 125 + isVideoBonus
        }
        if (activeProfId && (p.professionId === activeProfId || p.targetProfessions?.includes(activeProfId))) {
          const primaryBoost =
            p.id === 'post_dstrike_wheel_masterclass' || p.id?.startsWith('post_prof_video_') ? 5 : 0
          return 100 + primaryBoost + isVideoBonus
        }
        if (mappedActiveKey && (p.professionId === mappedActiveKey || p.targetProfessions?.includes(mappedActiveKey))) {
          return 85 + isVideoBonus
        }
        if (isLiveSynced) {
          return 70 + isVideoBonus
        }
        if (matchesUserEnclave) {
          return 45 + isVideoBonus
        }
        if (p.id?.startsWith('harvest_post_') || p.isProfessionTiered) {
          return 20 + isVideoBonus
        }
        return isVideoBonus
      }
      const diff = score(b) - score(a)
      if (diff !== 0) return diff
      return getSyncedTs(b) - getSyncedTs(a)
    })

  const isUserCreatedFeedPost = (p: Post) =>
    Boolean(
      p &&
        !p.id?.startsWith('harvest_post_') &&
        (p.isUserCreated ||
          p.id?.startsWith('user_post_') ||
          p.id?.startsWith('post_story_share_') ||
          (p.author?.connectionDegree === 'You' &&
            !p.isProfessionTiered &&
            p.id !== 'post_dstrike_wheel_masterclass' &&
            !p.id?.startsWith('post_prof_') &&
            p.id !== 'post_poll_1'))
    )

  const myPublishedPosts = filteredPosts.filter(isUserCreatedFeedPost)
  const communityFeedPosts = filteredPosts.filter(p => !isUserCreatedFeedPost(p))
  const remainingStreamPosts = communityFeedPosts.slice(3)

  useEffect(() => {
    setVisibleStreamCount(12)
  }, [activeFeedCategory, activeFeedSubCategory, feedTypeFilter, selectedTagFilter, searchQuery, selectedEnclaves])

  useEffect(() => {
    if (activeTab !== 'home') return
    const node = feedLoadMoreRef.current
    if (!node || remainingStreamPosts.length <= visibleStreamCount || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleStreamCount((prev) => Math.min(remainingStreamPosts.length, prev + 12))
        }
      },
      { rootMargin: '400px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [activeTab, remainingStreamPosts.length, visibleStreamCount])

  if (!hasHydrated || isAuthenticated !== true) {
    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg-core,#f3f2f0)] text-[var(--text-pure,#18181b)] antialiased">
        <header
          className="sticky top-0 z-50 w-full border-b border-[#2a2723] bg-[#171513] text-[#F5F0EB]"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
            <ConnectInLogo size="sm" showSubtitle={true} className="text-[#F5F0EB]" />
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {isAuthenticated === false
                  ? "Redirecting to ConnectLn sign in..."
                  : "Connecting to your ConnectLn profile..."}
              </span>
            </div>
          </div>
        </header>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg-core,#f3f2f0)] text-[var(--text-pure,#18181b)] antialiased transition-colors duration-300 selection:bg-[#0A66C2] selection:text-white">
      {/* Meeting reminders (15 / 30 min before scheduled meetings) */}
      <MeetingReminders
        onOpenMessaging={() => setActiveTab('messaging' as any)}
        onOpenCalendar={() => {
          setMessagingInitialMode('calendar')
          setActiveTab('messaging' as any)
        }}
      />
      {/* Mandatory phone + 2FA for every account (incl. Google / Microsoft Entra ID SSO) */}
      {isAuthenticated === true && !isAuthModalOpen && (
        <ConnectLnPhoneVerificationGate
          viewerName={userData?.name}
          viewerEmail={userData?.email}
          viewerPhone={userData?.phone}
          viewerId={userData?.id}
          onSignOut={handleSignOut}
        />
      )}
      {/* Live Incoming Voice & Video Call Ringing Banner (signed-in users only) */}
      {isAuthenticated === true && !isAuthModalOpen && (
      <ConnectLnIncomingCallBanner
        viewerName={userData?.name}
        viewerEmail={userData?.email}
        viewerPhone={userData?.phone}
        viewerAvatar={userData?.avatar}
        isAlreadyInCallStudio={Boolean(activeGlobalWhatsAppCall)}
        onAcceptIncomingCall={(callId, callerName, mode, callerPhone, callerAvatar) => {
          setActiveGlobalWhatsAppCall({
            callId,
            callerName,
            callerPhone,
            callerAvatar,
            mode,
          })
        }}
      />
      )}
      {/* Global Full-Screen WhatsApp-Style Direct Voice & Video Call Modal */}
      {activeGlobalWhatsAppCall && (
        <ConnectLnWhatsAppCallModal
          key={activeGlobalWhatsAppCall.callId}
          open={true}
          onClose={() => {
            setActiveGlobalWhatsAppCall(null)
            if (typeof window !== 'undefined' && window.location.search.includes('waCall=')) {
              window.history.replaceState(null, '', '/connectin')
            }
          }}
          initialCallId={activeGlobalWhatsAppCall.callId}
          initialMode={activeGlobalWhatsAppCall.mode || 'video'}
          isIncomingAnswer={true}
          targetLabel={activeGlobalWhatsAppCall.callerName || 'ConnectLn Caller'}
          targetPhone={activeGlobalWhatsAppCall.callerPhone}
          targetAvatar={activeGlobalWhatsAppCall.callerAvatar}
          callerName={userData?.name || 'ConnectLn Member'}
          callerEmail={userData?.email}
          callerAvatar={userData?.avatar}
        />
      )}
      {/* Top Sticky Navigation */}
      <ConnectLnNavbar
        activeTab={activeTab}
        activeWorkBusinessItem={workBusinessSection}
        onSelectWorkBusinessItem={(itemId) => {
          setWorkBusinessSection(itemId)
          setActiveTab('workbusiness')
        }}
        onSelectTab={(tab) => {
          if (tab === 'profile') setInspectedMember(null)
          if (tab === 'network') {
            setNetworkInitialSubTab('connections')
            setNetworkResetTrigger((prev) => prev + 1)
          }
          setActiveTab(tab as any)
          setSelectedTagFilter(null)
          if (userData?.name) {
            const tabTelemetryMap: Record<string, { title: string; category: 'Learning' | 'Alerts' | 'Media' | 'Feed Post' | 'Jobs' | 'Marketplace' | 'Pulse' | 'Profile' }> = {
              learning: { title: 'Reached ConnectLn Learning & Trade Mastery Academy', category: 'Learning' },
              notifications: { title: 'Checked ConnectLn Live Alerts & Dispatch Signals', category: 'Alerts' },
              media: { title: 'Explored ConnectLn Media & Video Briefings', category: 'Media' },
              jobs: { title: 'Browsed Verified Trade & Career Opportunities (Jobs)', category: 'Jobs' },
              marketplace: { title: 'Visited ConnectLn Marketplace & Equipment Solutions', category: 'Marketplace' },
              pulserooms: { title: 'Joined ConnectLn Live Pulse Audio Rooms', category: 'Pulse' },
              vibe: { title: 'Opened ConnectLn Pulse & Unified Communications', category: 'Pulse' },
              messaging: { title: 'Opened ConnectLn Direct Messaging & Dispatch', category: 'Alerts' }
            }
            const mapped = tabTelemetryMap[String(tab)]
            if (mapped) {
              recordLiveContentReach({
                userName: userData.name,
                title: mapped.title,
                category: mapped.category,
                actorName: userData.name
              })
            }
          }
        }}
        user={userData}
        unreadMessagesCount={1}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        suggestedPeople={suggestedPeople}
        onToggleConnect={handleToggleConnect}
        onSelectMember={handleInspectMember}
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

      {/* Slim ConnectLn 360 Desktop Left App Rail */}
      <ConnectLn360LeftRail
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'profile') setInspectedMember(null)
          if (tab === 'network') {
            setNetworkInitialSubTab('connections')
            setNetworkResetTrigger((prev) => prev + 1)
          }
          setActiveTab(tab as any)
          setSelectedTagFilter(null)
        }}
        unreadMessagesCount={1}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        isAdminUser={isSuperAdminUser(userData)}
      />

      {/* Main Content Area (Shifted beside 68px Desktop Rail on lg+) */}
      <div className="lg:pl-[68px]">
      <main
        className={
          activeTab === 'messaging' ||
          activeTab === 'powerapps' ||
          activeTab === 'noctissocial' ||
          activeTab === 'noctisclinic' ||
          activeTab === 'docs' ||
          activeTab === 'sheets' ||
          activeTab === 'slides' ||
          activeTab === 'sign' ||
          activeTab === 'invoice' ||
          activeTab === 'boards' ||
          activeTab === 'forms'
            ? "mx-auto max-w-[1480px] px-2 sm:px-4 pt-3 pb-24 lg:pb-4"
            : "mx-auto max-w-7xl px-3 sm:px-6 pt-5 pb-24 lg:pb-12"
        }
      >
        {/* VIEW 1: HOME FEED */}
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Left Rail (Profile summary & communities on desktop/tablet) */}
            <div className="hidden md:block md:col-span-4 lg:col-span-3 min-w-0">
              <LeftSidebarProfile
                user={userData}
                onViewProfile={() => {
                  setInspectedMember(null)
                  setActiveTab('profile')
                }}
                onSelectTag={(tag) => {
                  setSelectedTagFilter(tag)
                  setActiveFeedCategory('for_you')
                }}
                onNavigateTab={(tab) => {
                  if (tab === 'profile') setInspectedMember(null)
                  if (tab === 'network') {
                    setNetworkInitialSubTab('connections')
                    setNetworkResetTrigger((prev) => prev + 1)
                  }
                  setActiveTab(tab as any)
                }}
                onOpenIDModal={() => setIsIDModalOpen(true)}
                onOpenInboundBountiesModal={() => setIsInboundBountiesModalOpen(true)}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                onOpenAnalytics={(tab) => {
                  if (tab === 'viewers') {
                    setNetworkInitialSubTab('profile_viewers')
                    setActiveTab('network')
                  } else {
                    setAnalyticsModalTab(tab)
                    setIsAnalyticsModalOpen(true)
                  }
                }}
              />
            </div>

            {/* Center Rail (Post Creator & Post Feed) */}
            <div className="md:col-span-8 lg:col-span-6 min-w-0 space-y-3">
              {/* Mobile Quick Profile Header Card (< md) */}
              <div className="md:hidden flex items-center justify-between rounded-2xl border border-zinc-200/90 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <button
                  type="button"
                  onClick={() => {
                    setInspectedMember(null)
                    setActiveTab('profile')
                  }}
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
                  onClick={() => {
                    setInspectedMember(null)
                    setActiveTab('profile')
                  }}
                  className="rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#0A66C2] dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1 text-xs font-semibold shrink-0 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  Profile →
                </button>
              </div>

              {/* Active Logged-In Profession Switcher & Feed Indicator */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 shadow-xs space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-[13px] font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                      Logged-In Profession Feed:{" "}
                      <span className="text-[#0A66C2] dark:text-sky-400">
                        {resolvedUserProf?.title || userData.profession || "Master Carpenter"}
                      </span>
                    </span>
                  </div>
                  <select
                    value={activeProfId || "carpenter"}
                    onChange={(e) => handleSwitchActiveProfession(e.target.value)}
                    className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] max-w-[240px] cursor-pointer"
                    title="Switch logged-in profession across 20 Trade Folders & all platform roles"
                  >
                    {HANDYMAN_250_FOLDERS.map((folder) => (
                      <optgroup
                        key={folder.folderId}
                        label={`📂 Folder ${folder.folderNumber}: ${folder.folderName} (${folder.roles.length})`}
                      >
                        {folder.roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            #{r.num} {r.title}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <optgroup label="🌐 All Other Platform Professions">
                      {ALL_PROFESSIONS.filter(
                        (p) => !HANDYMAN_250_PROFESSIONS.some((h) => h.id === p.id)
                      ).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Quick Profession Pills (with 20 Trade Folders Drawer Toggle) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 shrink-0 mr-1">
                    Quick View:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowHomeTradeFolders((prev) => !prev)}
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                      showHomeTradeFolders
                        ? "bg-[#0A66C2] text-white border-[#0A66C2] shadow-xs"
                        : "bg-sky-50 dark:bg-sky-950/50 text-[#0A66C2] dark:text-sky-300 border-sky-200 dark:border-sky-800 hover:bg-sky-100"
                    }`}
                  >
                    📂 20 Trade Folders (250) {showHomeTradeFolders ? "▴" : "▾"}
                  </button>
                  {[
                    { id: "carpenter", label: "🔨 Carpenter" },
                    { id: "plumber", label: "🔧 Plumber" },
                    { id: "electrician", label: "⚡ Electrician" },
                    { id: "welder", label: "🔥 Welder" },
                    { id: "hvac_refrigeration_tech", label: "❄️ HVAC" },
                    { id: "mechanic", label: "🚗 Auto Mechanic" },
                    { id: "painter", label: "🎨 Painter" },
                    { id: "registered_nurse", label: "🩺 Nurse (RN / Medical)" },
                    { id: "physician", label: "⚕️ Physician / Doctor" },
                    { id: "cybersecurity_architect", label: "🛡️ Cybersecurity" },
                    { id: "software_engineer", label: "💻 Software Engineer" }
                  ].map((item) => {
                    const isActive = activeProfId === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSwitchActiveProfession(item.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                          isActive
                            ? "bg-[#0A66C2] text-white shadow-xs"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {item.label}
                      </button>
                    )
                  })}
                </div>

                {/* Expandable Compact 20 Trade Folders Explorer */}
                {showHomeTradeFolders && (
                  <div className="rounded-xl border border-sky-200/80 dark:border-sky-800/60 bg-sky-50/40 dark:bg-sky-950/20 p-3 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-extrabold text-[#0A66C2] dark:text-sky-300">
                        📂 Synced 20 Trade &amp; Service Folders (250 Roles) — Click a folder to switch feed or open in Jobs:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            window.sessionStorage.setItem("connectln_jobs_trade_folder", String(selectedHomeTradeFolder))
                          } catch {}
                          setActiveTab("jobs")
                        }}
                        className="rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white px-2.5 py-1 text-[10.5px] font-bold cursor-pointer"
                      >
                        Open Folder #{selectedHomeTradeFolder} in Jobs Tab →
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {HANDYMAN_250_FOLDERS.map((folder) => {
                        const active = selectedHomeTradeFolder === folder.folderNumber
                        return (
                          <button
                            key={folder.folderId}
                            type="button"
                            onClick={() => setSelectedHomeTradeFolder(folder.folderNumber)}
                            className={`rounded-lg px-2 py-1 text-[10.5px] font-bold border transition-colors cursor-pointer ${
                              active
                                ? "bg-[#0A66C2] text-white border-[#0A66C2]"
                                : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:bg-sky-50"
                            }`}
                          >
                            {folder.icon} {folder.folderNumber}. {folder.folderName} ({folder.roles.length})
                          </button>
                        )
                      })}
                    </div>
                    {(() => {
                      const activeFolder = HANDYMAN_250_FOLDERS.find((f) => f.folderNumber === selectedHomeTradeFolder)
                      if (!activeFolder) return null
                      return (
                        <div className="flex flex-wrap gap-1 pt-1.5 border-t border-sky-200/60 dark:border-sky-800/50">
                          {activeFolder.roles.map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => {
                                handleSwitchActiveProfession(r.id)
                                setShowHomeTradeFolders(false)
                              }}
                              className={`rounded-md px-2 py-0.5 text-[10.5px] font-semibold cursor-pointer ${
                                activeProfId === r.id
                                  ? "bg-amber-600 text-white font-bold"
                                  : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-amber-50"
                              }`}
                            >
                              #{r.num} {r.title}
                            </button>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* Live Video Sync Control + Subtle Links to Trade Lessons & Learning Academy */}
                <div className="pt-1.5 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleSyncFreshFeedVideos}
                      disabled={isSyncingFeedVideos}
                      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-3 py-1 text-xs font-semibold text-[#191919] dark:text-zinc-100 transition-colors cursor-pointer disabled:opacity-60"
                      title="Pull fresh live videos from WSJ, This Old House, The B1M, Electrician U, Bloomberg, IBM & more"
                    >
                      <RefreshCw className={`h-3 w-3 ${isSyncingFeedVideos ? "animate-spin text-[#0A66C2]" : "text-zinc-600 dark:text-zinc-300"}`} />
                      <span>{isSyncingFeedVideos ? "Syncing..." : "Sync New Videos"}</span>
                    </button>
                    <span className="text-[11px] text-[#666666] dark:text-zinc-400">
                      {lastFeedVideoSyncNote}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById("home-skilled-trades-learn-by-doing")
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
                      }}
                      className="font-semibold text-zinc-700 dark:text-zinc-300 hover:text-[#0A66C2] transition-colors cursor-pointer"
                    >
                      Trade Lessons ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('learning')}
                      className="font-semibold text-[#0A66C2] dark:text-sky-400 hover:underline transition-colors cursor-pointer"
                    >
                      Learning Tab →
                    </button>
                  </div>
                </div>
              </div>

              {/* LinkedIn-Style Top "Start a post" Box */}
              <PostCreator user={userData} onAddPost={handleAddPost} />

              {/* Top Videos Tiered Strictly to the Selected Logged-In Profession */}
              {communityFeedPosts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[#0A66C2]/10 via-sky-50 to-amber-50/70 dark:from-sky-950/50 dark:via-zinc-900 dark:to-amber-950/30 border border-[#0A66C2]/25">
                    <span className="text-xs font-extrabold text-[#0A66C2] dark:text-sky-300 truncate">
                      🎥 Videos for Your Selected Profession:{" "}
                      <span className="text-zinc-900 dark:text-zinc-100">
                        {resolvedUserProf?.title || userData.profession || "Master Carpenter"}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-[#0A66C2] px-2.5 py-0.5 text-[10px] font-bold text-white">
                      Live 24h Sync · Tiered
                    </span>
                  </div>
                  {communityFeedPosts.slice(0, 3).map((post) => (
                    <FeedPostCard
                      key={post.id}
                      post={post}
                      currentUser={userData}
                      onToggleReaction={handleToggleReaction}
                      onAddComment={handleAddComment}
                      onLikeComment={handleLikeComment}
                      onToggleSave={handleToggleSave}
                      onVotePoll={handleVotePoll}
                      onSelectMember={handleInspectMember}
                      onDeletePost={handleDeletePost}
                      onRepost={handleRepostPost}
                    />
                  ))}
                </div>
              )}

              {/* ConnectLn Sovereign Operator Suite (TVR, #AFT/#SCO, PVR, WCD, PRT, FTT/TOR, ESH, BDP, EDW, BEX) */}
              <ConnectLnSovereignSuiteHub
                userName={userData?.name}
                userHeadline={userData?.headline}
                userPhone={userData?.phone}
              />

              {/* Clean Full-Bleed WSJ-Format Feed Video & Editorial Posts (Zero Duplicate 3-Card Widget Above!) */}
              {myPublishedPosts.length > 0 && (
                <div className="space-y-3">
                  {myPublishedPosts.slice(0, visibleMyPostsCount).map((post) => (
                    <FeedPostCard
                      key={post.id}
                      post={post}
                      currentUser={userData}
                      onToggleReaction={handleToggleReaction}
                      onAddComment={handleAddComment}
                      onLikeComment={handleLikeComment}
                      onToggleSave={handleToggleSave}
                      onVotePoll={handleVotePoll}
                      onSelectMember={handleInspectMember}
                      onDeletePost={handleDeletePost}
                      onRepost={handleRepostPost}
                    />
                  ))}
                  {myPublishedPosts.length > visibleMyPostsCount && (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => setVisibleMyPostsCount((prev) => prev + 6)}
                        className="rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-4 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 shadow-2xs cursor-pointer"
                      >
                        Show more synced &amp; published posts ({myPublishedPosts.length - visibleMyPostsCount} more)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Skilled Trades: Learn by Doing — Videos Only Showcase on the Home Feed */}
              <div id="home-skilled-trades-learn-by-doing" className="scroll-mt-20">
                <SkilledTradesLearnByDoingSection
                  user={userData}
                  mode="home_videos_only"
                  onOpenInLearnTab={(lessonId, category) => {
                    setFocusedLearnLessonId(lessonId || null)
                    setFocusedLearnCategory(category || null)
                    setActiveTab('learning')
                    if (typeof window !== 'undefined') {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                  }}
                />
              </div>

              {/* 4-Card Rounded LinkedIn Professional Stories, Framed Posters & Live Video Strip */}
              <LinkedInStoriesStrip
                currentUser={userData}
                onShareStoryToFeed={(story, mode) => {
                  const newPostId = 'post_story_share_' + Date.now()
                  const newPost: Post = {
                    id: newPostId,
                    isUserCreated: true,
                    professionEnclave: selectedEnclaves[0] || userData?.professionEnclave || 'all',
                    author: {
                      id: userData.id,
                      name: userData.name,
                      headline: userData.headline,
                      avatar: userData.avatar,
                      connectionDegree: 'You',
                      isFollowing: false
                    },
                    timestamp: 'Just now · 🌐',
                    visibility: 'Public',
                    postType: 'standard',
                    feedCategory: 'for_you',
                    feedSubCategory: 'All',
                    content: `${story.title} — ${story.subtitle}`,
                    hashtags: ['#ConnectLn', '#ProfessionalStories', '#Leadership'],
                    media:
                      mode === 'video'
                        ? {
                            type: 'video',
                            url: `https://www.youtube.com/watch?v=${story.youtubeId}`,
                            youtubeId: story.youtubeId,
                            thumbnailUrl: story.imageUrl,
                            title: story.title,
                            description: story.subtitle,
                            duration: story.duration
                          }
                        : {
                            type: 'image',
                            url: story.imageUrl,
                            visualStyle:
                              story.cardStyle === 'poster_frame'
                                ? 'poster_frame'
                                : story.cardStyle === 'news_portrait'
                                ? 'news_portrait'
                                : 'editorial_podium',
                            youtubeId: story.youtubeId,
                            duration: story.duration,
                            overlayTitle: story.title,
                            overlaySubtitle: story.subtitle,
                            title: story.title,
                            submitsText: story.submitsText || 'Shared via ConnectLn Stories'
                          },
                    stats: {
                      likesCount: 1,
                      commentsCount: 0,
                      repostsCount: 0,
                      reactionsBreakdown: { like: 1, celebrate: 0, support: 0, love: 0, insightful: 0, funny: 0 }
                    },
                    userReaction: null,
                    isSaved: false,
                    comments: []
                  }
                  const updated = [newPost, ...posts]
                  setPosts(updated)
                  saveStoredPosts(updated)
                  if (typeof window !== 'undefined') {
                    setTimeout(() => {
                      const el = document.getElementById(`connectln-post-${newPostId}`)
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }, 120)
                  }
                }}
              />

              {/* Unified Single-Instance Educational Masterclass Wheel (Responsive across mobile & desktop; avoids duplicate DOM trees) */}
              <div className="space-y-2">
                {!showFeedWheel ? (
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-900/40 shadow-2xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">🎡</span>
                      <div className="min-w-0">
                        <p className="font-bold text-amber-950 dark:text-amber-200 text-xs truncate">The Wheel — Multi-Profession Masterclasses</p>
                        <p className="text-[10px] text-amber-800/80 dark:text-amber-400/80 truncate">Masterclasses across {ALL_PROFESSIONS.length} Professions</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFeedWheel(true)}
                      className="shrink-0 ml-2 px-3 py-1 text-[11px] font-bold rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-2xs transition-colors cursor-pointer"
                    >
                      Show &ldquo;The Wheel&rdquo; ▾
                    </button>
                  </div>
                ) : (
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
                    {/* Unified Streamlined Community Bar (Collapsible across Desktop & Mobile — Zero Duplicate DOM) */}
                    <div className="rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 shadow-xs">
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

              {/* Feed Posts (Windowed Progressive Stream) */}
              <div className="space-y-3">
                {remainingStreamPosts.slice(0, visibleStreamCount).map((post) => (
                  <FeedPostCard
                    key={post.id}
                    post={post}
                    currentUser={userData}
                    onToggleReaction={handleToggleReaction}
                    onAddComment={handleAddComment}
                    onLikeComment={handleLikeComment}
                    onToggleSave={handleToggleSave}
                    onVotePoll={handleVotePoll}
                    onSelectMember={handleInspectMember}
                    onDeletePost={handleDeletePost}
                    onRepost={handleRepostPost}
                  />
                ))}

                {remainingStreamPosts.length > visibleStreamCount && (
                  <div ref={feedLoadMoreRef} className="flex justify-center py-2">
                    <button
                      type="button"
                      onClick={() => setVisibleStreamCount((prev) => prev + 8)}
                      className="rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-5 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-200 shadow-2xs transition-colors cursor-pointer"
                    >
                      Show more posts ({remainingStreamPosts.length - visibleStreamCount} remaining)
                    </button>
                  </div>
                )}

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
            <div className="hidden lg:block lg:col-span-3 min-w-0">
              <RightSidebarNews
                news={trendingNews}
                suggestedPeople={suggestedPeople}
                currentUser={userData}
                onToggleConnect={handleToggleConnect}
                onSelectMember={handleInspectMember}
                onNewsClick={(headline) => setSearchQuery(headline.slice(0, 15))}
                onNavigateTab={(tab) => {
                  if (tab === 'network') {
                    setNetworkInitialSubTab('connections')
                    setNetworkResetTrigger((prev) => prev + 1)
                  }
                  setActiveTab(tab as any)
                }}
                onOpenNetworkSubTab={(subTab) => {
                  setNetworkInitialSubTab(subTab)
                  setNetworkResetTrigger((prev) => prev + 1)
                  setActiveTab('network')
                }}
                onOpenAIAssistant={(query) => {
                  if (query) setSearchQuery(query)
                  setIsAIAssistantOpen(true)
                }}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: MY WORKSPACE (OR INSPECTED MEMBER WORKSPACE) */}
        {activeTab === 'profile' && (
          <ProfileView
            user={inspectedMember || userData}
            viewerUser={userData}
            isAdminViewer={isSuperAdminUser(userData)}
            isViewingOtherMember={Boolean(inspectedMember)}
            onReturnToOwnWorkspace={() => setInspectedMember(null)}
            onConnectMember={(idOrName) => handleToggleConnect(idOrName)}
            onBackToFeed={() => {
              if (inspectedMember) {
                setInspectedMember(null)
                setActiveTab('network')
              } else {
                setActiveTab('home')
              }
            }}
            onNavigateMarketplace={() => setActiveTab('marketplace')}
            onNavigateJobs={(searchKeyword) => {
              if (searchKeyword) setSearchQuery(searchKeyword)
              setActiveTab('jobs')
            }}
            onUpdateUser={(updated) => {
              if (inspectedMember) {
                setInspectedMember(updated)
                const updatedName = String(updated.name || '').trim().toLowerCase()
                setSuggestedPeople((prev) => {
                  const next = prev.map((p) => {
                    const pName = String(p.name || '').trim().toLowerCase()
                    if (p.id === updated.id || (updatedName && pName === updatedName)) {
                      return {
                        ...p,
                        name: updated.name || p.name,
                        headline: updated.headline || p.headline,
                        avatar: updated.avatar || p.avatar,
                      }
                    }
                    return p
                  })
                  saveStoredConnections(next)
                  return next
                })
              } else {
                setUserData(updated)
              }
            }}
            onOpenAnalytics={(tab) => {
              setAnalyticsModalTab(tab)
              setIsAnalyticsModalOpen(true)
            }}
            onNavigateMessaging={(person) => handleOpenDirectMessage(person)}
          />
        )}

        {/* VIEW 3: MY NETWORK */}
        {activeTab === 'network' && (
          <NetworkView
            suggestedPeople={suggestedPeople}
            onToggleConnect={handleToggleConnect}
            currentUser={userData}
            onSelectMember={handleInspectMember}
            onNavigateMessaging={(person) => handleOpenDirectMessage(person)}
            onUpdateConnectionsCount={(newCount) => setUserData(prev => ({ ...prev, connectionsCount: newCount }))}
            initialSubTab={networkInitialSubTab}
            resetTrigger={networkResetTrigger}
          />
        )}

        {/* VIEW 4: JOBS VIEW */}
        {activeTab === 'jobs' && (
          <JobsView
            currentUser={userData}
            onNavigateCareerSuite={() => setActiveTab('careersuite')}
            onNavigateLearning={() => setActiveTab('learning')}
            onNavigateMarketplace={() => setActiveTab('marketplace')}
            onNavigateMessaging={() => setActiveTab('messaging')}
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

        {/* VIEW 4.5: CONNECTLN VETERANS NETWORK & FRANCHISE NETWORK */}
        {(activeTab === 'veterans' || activeTab === 'franchises') && (
          <VeteransAndFranchiseNetworksView
            currentUser={userData}
            initialSection={activeTab === 'franchises' ? 'franchises' : 'veterans'}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
            onOpenDirectMessage={handleOpenDirectMessage}
          />
        )}

        {/* VIEW 4.8: CONNECTLN WORK & BUSINESS HUB (ALL 14 WORKSPACE & GROW WORKFLOWS) */}
        {activeTab === 'workbusiness' && (
          <WorkAndBusinessHubView
            currentUser={userData}
            initialSection={workBusinessSection}
            onNavigateTab={(tab) => {
              if (tab === 'network') {
                setNetworkInitialSubTab('connections')
                setNetworkResetTrigger((prev) => prev + 1)
              }
              setActiveTab(tab as any)
            }}
            onOpenWhoViewedMyProfile={() => {
              setNetworkInitialSubTab('profile_viewers')
              setNetworkResetTrigger((prev) => prev + 1)
              setActiveTab('network')
            }}
            onOpenAnalyticsModal={(tab) => {
              setAnalyticsModalTab(tab)
              setIsAnalyticsModalOpen(true)
            }}
            onOpenLearnTab={(lessonId, category) => {
              if (lessonId) setFocusedLearnLessonId(lessonId)
              if (category) setFocusedLearnCategory(category)
              setActiveTab('learning')
            }}
          />
        )}

        {/* VIEW 5: LEARNING VIEW */}
        {activeTab === 'learning' && (
          <LearningView
            user={userData}
            initialLearnByDoingLessonId={focusedLearnLessonId}
            initialLearnByDoingCategory={focusedLearnCategory}
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
            onOpenVibeCampus={() => setIsAIAssistantOpen(true)}
            studioHandoff={studioHandoff}
            onReturnToMessaging={handleReturnFromStudioToMessaging}
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

        {/* VIEW: CONNECTLN 360 PLANS & BILLING */}
        {activeTab === 'plans' && (
          <ConnectLnPlansBillingView
            currentUser={userData}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
            initialPlanId={plansInitialParams.planId}
            initialCycle={plansInitialParams.cycle}
            initialSeats={plansInitialParams.seats}
          />
        )}

        {/* VIEW: ADMINISTRATIVE IAM & MODERATION CONSOLE */}
        {activeTab === 'adminiam' && isSuperAdminUser(userData) && (
          <AdminIAMConsoleView
            currentUser={userData}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
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
            initialWorkspaceMode={messagingInitialMode}
            onPostToFeed={(content, repostOf) =>
              handleAddPost({
                author: {
                  id: userData.id,
                  name: userData.name,
                  headline: userData.headline,
                  avatar: userData.avatar,
                  connectionDegree: 'You',
                },
                visibility: 'Connections',
                content: repostOf ? `🔁 Reposted from ${repostOf}:\n\n"${content}"` : content,
                postType: 'standard',
              } as Omit<Post, 'id' | 'timestamp' | 'stats' | 'comments'>)
            }
            onNavigateMarketplace={() => setActiveTab('marketplace')}
            onNavigateJobs={() => setActiveTab('jobs')}
            resumeCallSession={messagingResumeCall}
            onConsumeResumeCall={() => setMessagingResumeCall(null)}
            onNavigateVibeComms={(handoff) => {
              if (handoff) {
                const payload = { ...handoff, returnToMessaging: true, ts: Date.now() }
                if (typeof window !== 'undefined') {
                  try {
                    sessionStorage.setItem('connectln_studio_handoff_v1', JSON.stringify(payload))
                    window.history.replaceState(
                      null,
                      '',
                      `/connectin?tab=vibecomms&joinCall=${encodeURIComponent(handoff.callId)}`
                    )
                  } catch {}
                }
                setStudioHandoff(payload)
              }
              setActiveTab('vibecomms')
            }}
          />
        )}

        {/* VIEW 16: CATEGORIZED NOTIFICATIONS HUB */}
        {activeTab === 'notifications' && (
          <NotificationsView
            onNavigateTab={(tab) => setActiveTab(tab as any)}
            currentUserName={userData.name}
            currentUserProfession={userData.headline}
            currentUserAvatar={userData.avatar}
            onPostToFeed={(content, repostOf) =>
              handleAddPost({
                author: {
                  id: userData.id,
                  name: userData.name,
                  headline: userData.headline,
                  avatar: userData.avatar,
                  connectionDegree: 'You',
                },
                visibility: 'Public',
                content: repostOf ? `🔁 Reposted Alert from ${repostOf}:\n\n${content}` : content,
                postType: 'standard',
              } as Omit<Post, 'id' | 'timestamp' | 'stats' | 'comments'>)
            }
          />
        )}

        {/* VIEW 17: NOCTIS UNIFIED AUDIO/VIDEO STUDIO & CAREER HUB */}
        {activeTab === 'vibe' && (
          <VibeUnifiedCommunicationsView
            currentUser={userData}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
            onOpenVibeCampus={() => setIsAIAssistantOpen(true)}
            studioHandoff={studioHandoff}
            onReturnToMessaging={handleReturnFromStudioToMessaging}
          />
        )}

        {/* VIEWS 18 & 19: CONNECTLN 360 UNIVERSE — NOCTIS SOCIAL & NOCTIS CLINIC */}
        {(activeTab === 'noctissocial' || activeTab === 'noctisclinic') && (
          <ConnectLn360UniverseAppView
            appId={activeTab}
            onSwitchApp={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* VIEWS 20–26: CONNECTLN 360 STUDIO & POWER APPS — ALL 20 APPS HUB + DOCS, SHEETS, SLIDES, SIGN, INVOICE, BOARDS & FORMS */}
        {activeTab === 'powerapps' && (
          <ConnectLnPowerAppsHub
            initialAppId={initialPowerAppId}
            onOpenStudioTab={(tab) => setActiveTab(tab)}
            onReturnHome={() => setActiveTab('home')}
          />
        )}
        {(activeTab === 'docs' || activeTab === 'sheets' || activeTab === 'slides' || activeTab === 'sign' || activeTab === 'invoice' || activeTab === 'boards' || activeTab === 'forms') && (
          <ConnectLnStudioSuiteView
            activeApp={activeTab}
            user={userData}
            onSwitchApp={(app) => setActiveTab(app)}
            onReturnHome={() => setActiveTab('home')}
            onShareToFeed={(payload) => {
              handleAddPost({
                author: {
                  id: userData.id || 'user_self',
                  name: userData.name || 'ConnectLn Member',
                  headline: userData.headline || 'Verified Member on ConnectLn',
                  avatar: userData.avatar || '',
                  email: userData.email,
                  connectionDegree: 'You',
                },
                visibility: 'Public',
                content: `${payload.appLabel}: ${payload.title}\n\n${payload.summary}`,
                hashtags: ['ConnectLnStudio', payload.appLabel.replace(/\s+/g, '')],
                postType: payload.slides && payload.slides.length > 0 ? 'document' : 'standard',
                document:
                  payload.slides && payload.slides.length > 0
                    ? {
                        title: payload.title,
                        totalPages: payload.slides.length,
                        slides: payload.slides,
                        fileType: payload.appLabel,
                      }
                    : undefined,
                feedCategory: 'for_you',
                feedSubCategory: 'All',
              })
            }}
          />
        )}
      </main>
      </div>

      {/* Unified Persistent Bottom-Right Dock (Messaging + Job Alerts + Ask Noctis; hidden on full Messaging, Studio & embedded 360 Universe apps) */}
      {activeTab !== 'messaging' &&
        activeTab !== 'noctissocial' &&
        activeTab !== 'noctisclinic' &&
        activeTab !== 'docs' &&
        activeTab !== 'sheets' &&
        activeTab !== 'slides' &&
        activeTab !== 'sign' &&
        activeTab !== 'invoice' &&
        activeTab !== 'boards' &&
        activeTab !== 'forms' && (
        <FloatingMessagingDock
          currentUser={userData}
          onOpenFullMessaging={() => setActiveTab('messaging')}
          onNavigateJobs={() => setActiveTab('jobs')}
          onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
          composeRecipient={composeRecipient}
          onCloseComposeRecipient={() => setComposeRecipient(null)}
          suppressAutoOpen={!!inspectedMember}
        />
      )}

      {/* ConnectIn AI Global Platform Assistant Modal */}
      {isAIAssistantOpen && (
        <ConnectInAIAssistant
          isOpen={isAIAssistantOpen}
          onClose={() => {
            setIsAIAssistantOpen(false)
            setAiInitialQuery("")
          }}
          currentUser={userData}
          onNavigateTab={(tab) => setActiveTab(tab as any)}
          initialQuery={aiInitialQuery}
        />
      )}

      {/* ConnectIn Universal Omnisearch Modal */}
      {isUniversalSearchOpen && (
        <UniversalSearchModal
          isOpen={isUniversalSearchOpen}
          onClose={() => setIsUniversalSearchOpen(false)}
          initialQuery={searchQuery}
          currentUser={userData}
          onNavigateTab={(tab) => setActiveTab(tab as any)}
          onSelectMember={handleInspectMember}
        />
      )}

      {/* ConnectIn Portable Professional ID Modal */}
      {isIDModalOpen && (
        <ProfessionalIDModal
          isOpen={isIDModalOpen}
          onClose={() => setIsIDModalOpen(false)}
          currentUser={userData}
        />
      )}

      {/* ConnectIn $250 Paid Inbound Recruiter Bounties Modal */}
      {isInboundBountiesModalOpen && (
        <InboundBountiesModal
          isOpen={isInboundBountiesModalOpen}
          onClose={() => setIsInboundBountiesModalOpen(false)}
          currentUser={userData}
          onNavigateTab={(tab) => setActiveTab(tab as any)}
        />
      )}

      {/* ConnectIn Role-Aware Identity & Auth Portal Gate Modal */}
      {isAuthModalOpen && (
        <ConnectInAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={(authenticatedUser, targetTab, targetWorkspace) => {
            setUserData(authenticatedUser)
            if (authenticatedUser.professionEnclave) {
              setSelectedEnclaves([authenticatedUser.professionEnclave])
            }
            setPosts(loadStoredPosts(authenticatedUser))
            setActiveWorkspace(targetWorkspace)
            setActiveTab(targetTab as any)
            setIsAuthenticated(true)
            setIsAuthModalOpen(false)
          }}
        />
      )}

      {/* ConnectIn Analytics & Network Intelligence Modal (Profile Viewers, Content Reach, Directory Discoveries) */}
      {isAnalyticsModalOpen && (
        <ConnectInAnalyticsModal
          isOpen={isAnalyticsModalOpen}
          onClose={() => setIsAnalyticsModalOpen(false)}
          initialTab={analyticsModalTab}
          currentUser={userData}
          onNavigateMessaging={(personName) => {
            setIsAnalyticsModalOpen(false)
            handleOpenDirectMessage(personName)
          }}
          onNavigateTab={(tab) => setActiveTab(tab as any)}
        />
      )}

      {/* Interactive Platform Video Guide & Masterclasses Modal */}
      {isVideoGuideOpen && (
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
      )}

      {/* Invitation Acceptance & Personal Profile Claim Modal (Ensures Invitee Joins as Their Own Identity, Never the Inviter) */}
      {inviteClaimModal?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#121110] p-6 text-white border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <ConnectInLogo size="sm" showSubtitle={true} className="text-white" />
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-[11px] font-bold text-emerald-300">
                  🤝 Personal Network Invite
                </span>
              </div>
              <h2 className="mt-4 text-xl font-black text-[#f2ede4]">
                {inviteClaimModal.inviterName} invited you to connect
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                Confirm your name and profession below so you join ConnectLn under your own profile and connect directly with <strong>{inviteClaimModal.inviterName}</strong>.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const finalRecipientName =
                  (inviteClaimModal.recipientName || "").trim() ||
                  deriveHumanNameFromEmailClient(inviteClaimModal.recipientEmail) ||
                  userData.name
                const finalRecipientEmail =
                  (inviteClaimModal.recipientEmail || "").trim() ||
                  `${finalRecipientName.toLowerCase().replace(/\s+/g, ".")}@connectln.app`
                const selectedProf = findProfessionById(inviteClaimModal.professionId)

                const customProfile = createUniqueUserProfile({
                  name: finalRecipientName,
                  email: finalRecipientEmail,
                  role: "personal",
                  professionId: selectedProf?.id || "cybersecurity_architect",
                  professionEnclave: selectedProf?.enclaveId || "tech_cybersecurity"
                })

                const claimedUser: UserProfile = {
                  ...customProfile,
                  id: `user_${Date.now().toString(36)}`,
                  name: finalRecipientName,
                  email: finalRecipientEmail,
                  profession: selectedProf?.title || customProfile.profession,
                  professionId: selectedProf?.id || customProfile.professionId,
                  professionCategory: selectedProf?.categoryName || customProfile.professionCategory,
                  professionEnclave: selectedProf?.enclaveId || customProfile.professionEnclave,
                  headline:
                    selectedProf?.defaultHeadline ||
                    `Verified ConnectLn Professional · Connected with ${inviteClaimModal.inviterName}`,
                  avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(finalRecipientName)}&backgroundColor=0a66c2`,
                  role: "personal",
                  roles: ["NORMAL_USER"],
                  connectionsCount: 1
                } as UserProfile

                saveStoredUser(claimedUser)
                connectWithInviterInStorage(inviteClaimModal.inviterName, inviteClaimModal.inviterHeadline)
                setUserData(claimedUser)
                setInviteClaimModal(null)
                const requestedUrlTab =
                  typeof window !== "undefined"
                    ? new URLSearchParams(window.location.search).get("tab")
                    : null
                setActiveTab(requestedUrlTab === "messaging" ? "messaging" : "network")

                if (typeof window !== "undefined") {
                  localStorage.setItem("connectin_verified", "true")
                  window.history.replaceState({}, "", window.location.pathname)
                }
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">
                  Your Full Name (Your ConnectLn Profile Name)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yaw Asiedu"
                  value={inviteClaimModal.recipientName}
                  onChange={(e) =>
                    setInviteClaimModal((prev) => (prev ? { ...prev, recipientName: e.target.value } : prev))
                  }
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-3.5 py-2.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">
                  Your Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. yaw.asiedu@gmail.com"
                  value={inviteClaimModal.recipientEmail}
                  onChange={(e) =>
                    setInviteClaimModal((prev) => (prev ? { ...prev, recipientEmail: e.target.value } : prev))
                  }
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">
                  Your Primary Profession / Discipline
                </label>
                <select
                  value={inviteClaimModal.professionId}
                  onChange={(e) =>
                    setInviteClaimModal((prev) => (prev ? { ...prev, professionId: e.target.value } : prev))
                  }
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                >
                  {PROFESSION_ENCLAVES.flatMap((enc) =>
                    enc.categories.flatMap((cat) =>
                      cat.professions.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                          {enc.badge} · {prof.title}
                        </option>
                      ))
                    )
                  )}
                </select>
              </div>

              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 p-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#0A66C2] text-white font-black flex items-center justify-center shrink-0 text-xs">
                  {(inviteClaimModal.inviterName || "K").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-emerald-900 dark:text-emerald-200 text-xs truncate">
                    1st-Degree Connection: {inviteClaimModal.inviterName}
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 truncate">
                    {inviteClaimModal.inviterHeadline}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-[#0A66C2] hover:bg-[#004182] py-3 px-5 text-sm font-black text-white shadow-lg transition-all cursor-pointer"
              >
                {inviteClaimModal.recipientName.trim()
                  ? `Join as ${inviteClaimModal.recipientName.trim()} & Connect →`
                  : `Accept Invitation & Join ConnectLn →`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated In-Platform ConnectLn Staged Video & "More Videos" Theater Player */}
      <ConnectLnStagedVideoModal user={userData} feedPosts={posts} />
    </div>
  )
}
