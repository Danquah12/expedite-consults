"use client"

import React, { useState, useRef, useEffect } from "react"
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Edit3,
  Plus,
  Share2,
  ExternalLink,
  Award,
  Eye,
  TrendingUp,
  Search,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  FileText,
  Star,
  MessageSquarePlus,
  Check,
  ShoppingBag,
  Store,
  Layers,
  Code2,
  Globe,
  DollarSign,
  Users,
  Shield,
  Zap,
  Key,
  FolderGit2,
  BarChart3,
  Tag,
  ArrowRight,
  Trash2,
  Upload,
  Camera,
  Image as ImageIcon,
  RefreshCw,
  Phone,
  Mail,
  Clock,
  Calendar,
  Copy,
  Building2,
  ChevronDown,
  ChevronUp,
  Lock
} from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { ResumeUploadModal } from "./ResumeUploadModal"
import { ExperienceFormModal } from "./ExperienceFormModal"
import { ParsedExperience, DEMO_RESUME_PRESETS } from "@/lib/resume-parser"
import { UserProfile } from "@/lib/connectln-data"
import {
  WORKSPACE_PORTFOLIO_DATA,
  WORKSPACE_VERIFIED_SKILLS_DATA,
  WORKSPACE_CERTIFICATIONS_DATA,
  WORKSPACE_EXPERIENCE_DATA,
  WORKSPACE_PUBLICATIONS_DATA,
  WORKSPACE_REVIEWS_DATA,
  MY_PRODUCTS_DATA,
  VendorProductItem,
  getWorkspaceDataForEnclave,
  getTailoredUserProductsAndBusiness,
  PersonalBusinessWebsiteData,
  BusinessWebsiteOffering,
  BusinessThemeColor
} from "@/lib/my-workspace-data"
import { findEnclaveById } from "@/lib/connectin-professions"
import { TradeEnclaveWidgets } from "./TradeEnclaveWidgets"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createUniqueUserProfile, isSuperAdminUser } from "@/lib/connectin-profile"
import { saveStoredUser, loadStoredUser, savePersistentAvatar, savePersistentCover, trackUserActivity, resolveUserProfilePicture as resolveSharePhoto } from "@/lib/connectin-storage"
import { buildSharePreviewUrl, useSharePic } from "@/lib/connectin-share"
import { recordLocalBilateralDirectMessage } from "@/lib/direct-mailbox-sync"
import {
  ProfileViewerItem,
  ContentReachData,
  DirectoryDiscoveryData,
  loadStoredProfileViewers,
  saveStoredProfileViewers,
  loadStoredContentReach,
  loadStoredDirectoryDiscoveries,
  recordProfileView,
  recordLiveVouch,
  getProfileTailoredAnalytics,
  syncLiveUserTelemetryFromCloud,
  formatProfileViewDateTime
} from "@/lib/connectin-analytics"
import { getQualifiedJobsForSkills, SkillQualifiedJob } from "@/lib/skill-qualified-jobs"
import { playHumanVoiceTag, recordRealHumanVoiceTag } from "@/lib/connectin-voice-tag"

interface ProfileViewProps {
  user: UserProfile
  viewerUser?: UserProfile
  isAdminViewer?: boolean
  isViewingOtherMember?: boolean
  onReturnToOwnWorkspace?: () => void
  onConnectMember?: (memberIdOrName: string) => void
  onBackToFeed?: () => void
  onNavigateMarketplace?: () => void
  onNavigateJobs?: (searchKeyword?: string) => void
  onUpdateUser?: (updated: UserProfile) => void
  onOpenAnalytics?: (tab: 'viewers' | 'reach' | 'discoveries') => void
  onNavigateMessaging?: (person?: any) => void
}

export function ProfileView({
  user,
  viewerUser,
  isAdminViewer = false,
  isViewingOtherMember = false,
  onReturnToOwnWorkspace,
  onConnectMember,
  onBackToFeed,
  onNavigateMarketplace,
  onNavigateJobs,
  onUpdateUser,
  onOpenAnalytics,
  onNavigateMessaging
}: ProfileViewProps) {
  const { t } = useLanguage()

  const activeViewer = React.useMemo(() => viewerUser || loadStoredUser(), [viewerUser])
  const isAccountOwner = React.useMemo(() => {
    if (!isViewingOtherMember) return true
    if (!activeViewer || !user) return false
    const viewerName = String(activeViewer.name || '').trim().toLowerCase()
    const targetName = String(user.name || '').trim().toLowerCase()
    if (viewerName && targetName && viewerName === targetName) return true
    const viewerEmail = String((activeViewer as any).email || '').trim().toLowerCase()
    const targetEmail = String((user as any).email || '').trim().toLowerCase()
    if (viewerEmail && targetEmail && viewerEmail === targetEmail) return true
    return false
  }, [isViewingOtherMember, activeViewer, user])

  const hasAdminAccess = React.useMemo(() => {
    if (isAdminViewer) return true
    if (!activeViewer) return false
    return (
      isSuperAdminUser(activeViewer) ||
      (activeViewer as any).role === 'admin' ||
      (Array.isArray((activeViewer as any).roles) &&
        (activeViewer as any).roles.includes('SUPER_ADMIN'))
    )
  }, [isAdminViewer, activeViewer])

  const canManageWorkspace = isAccountOwner || hasAdminAccess
  const isAdminManagingOtherMember = !isAccountOwner && hasAdminAccess
  const tailoredWorkspaceProfile = React.useMemo(
    () => getTailoredUserProductsAndBusiness(user),
    [user.id, user.name, user.headline, user.profession, user.professionId, user.professionEnclave, user.location, (user as any).company, user.about, user.phone]
  )
  const effectiveEnclaveId = tailoredWorkspaceProfile.resolution.enclaveId
  const enclaveInfo = findEnclaveById(effectiveEnclaveId)
  const enclaveWorkspace = getWorkspaceDataForEnclave(effectiveEnclaveId)
  const resolvedDisplayProfession =
    !user.profession ||
    (user.profession === 'Licensed Master Electrician' &&
      tailoredWorkspaceProfile.resolution.subArchetype !== 'electrical')
      ? tailoredWorkspaceProfile.resolution.professionTitle
      : user.profession

  const userWorkspaceStorageKey = React.useMemo(
    () =>
      String(user.id || user.email || user.name || 'default')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_'),
    [user.id, user.email, user.name]
  )

  const stableWorkspaceNameKey = React.useMemo(
    () =>
      String(user.name || user.email || user.id || 'default')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '_'),
    [user.name, user.email, user.id]
  )

  const safeSetWorkspaceLocalStorage = React.useCallback((key: string, value: string) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, value)
    } catch {
      // Free bulky caches if browser 5MB localStorage quota is full, then retry
      try {
        localStorage.removeItem('connectin_posts_v1')
        localStorage.removeItem('connectln_harvested_media_v1')
        localStorage.removeItem('connectin_user_activity_logs_v1')
        localStorage.removeItem('connectin_admin_users_v1')
        localStorage.removeItem('connectin_accounts_vault_v1')
        localStorage.setItem(key, value)
      } catch (err) {
        console.error(`Failed to persist ${key}`, err)
      }
    }
  }, [])

  // Resume & Experience Builder State
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)
  const [isExpFormModalOpen, setIsExpFormModalOpen] = useState(false)
  const [editingExperience, setEditingExperience] = useState<ParsedExperience | null>(null)
  const [resumeSuccessBanner, setResumeSuccessBanner] = useState<string | null>(null)
  const [isRecordingProfileVoiceTag, setIsRecordingProfileVoiceTag] = useState(false)

  const syncPublicProfileToCloud = (profileToSync: UserProfile) => {
    if (!canManageWorkspace || typeof window === 'undefined') return
    try {
      fetch('/api/connectin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profileToSync.id,
          name: profileToSync.name,
          headline: profileToSync.headline,
          location: profileToSync.location,
          about: profileToSync.about,
          avatar: profileToSync.avatar,
          coverImage: profileToSync.coverImage,
          skills: (profileToSync.skills || []).map((s: any) =>
            typeof s === 'string' ? s : s?.name
          ).filter(Boolean),
          profession: profileToSync.profession,
          professionId: profileToSync.professionId,
          professionCategory: profileToSync.professionCategory,
          professionEnclave: profileToSync.professionEnclave
        })
      }).catch(() => {})
    } catch {
      // ignore offline error
    }
  }

  const persistWorkspaceUserProfile = (updatedProfile: UserProfile) => {
    if (isAccountOwner) {
      saveStoredUser(updatedProfile)
    }
    if (canManageWorkspace) {
      syncPublicProfileToCloud(updatedProfile)
    }
  }

  const handleApplyResumeExperience = (
    newExperiences: ParsedExperience[],
    options: {
      updateHeadline?: boolean
      newHeadline?: string
      updateAbout?: boolean
      newAbout?: string
      updateSkills?: boolean
      extractedSkills?: string[]
      appendMode?: boolean
      fileName?: string
      candidateName?: string
    }
  ) => {
    if (!canManageWorkspace) return
    const formattedNewExp = newExperiences.map(e => ({
      id: e.id,
      role: e.role,
      company: e.company,
      companyLogo: e.companyLogo || 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=100&auto=format&fit=crop&80',
      employmentType: e.employmentType || 'Full-time',
      duration: e.duration,
      location: e.location,
      description: e.description,
      skills: e.skills
    }))

    const finalExperiences = options.appendMode && user.experience && user.experience.length > 0
      ? [...user.experience, ...formattedNewExp]
      : formattedNewExp

    const normalizedExistingSkills = (user.skills || []).map((s: any) =>
      typeof s === 'string'
        ? { name: s, endorsements: 0, endorsers: ['Verified Resume NLP'] }
        : { ...s, name: String(s?.name || '') }
    ).filter(s => s.name.trim().length > 0)

    let mergedSkills = normalizedExistingSkills
    if (options.updateSkills && options.extractedSkills && options.extractedSkills.length > 0) {
      const existingSkillNames = normalizedExistingSkills.map(s => s.name.toLowerCase())
      const additionalSkills = options.extractedSkills
        .filter(s => Boolean(s) && !existingSkillNames.includes(String(s).toLowerCase()))
        .map(s => ({ name: String(s), endorsements: 0, endorsers: ['Verified Resume NLP'] }))
      mergedSkills = [...normalizedExistingSkills, ...additionalSkills]
    }

    const uploadedResumeMeta = {
      fileName: options.fileName || 'Uploaded_Resume.pdf',
      uploadedAt: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
      positionsCount: finalExperiences.length,
      skillsCount: mergedSkills.length,
      candidateName: options.candidateName || user.name
    }

    const updatedUser: UserProfile = {
      ...user,
      experience: finalExperiences,
      headline: options.updateHeadline && options.newHeadline ? options.newHeadline : user.headline,
      about: options.updateAbout && options.newAbout ? options.newAbout : user.about,
      skills: mergedSkills,
      ...({ uploadedResume: uploadedResumeMeta } as any)
    }

    persistWorkspaceUserProfile(updatedUser)
    trackUserActivity({
      actionType: 'RESUME_UPLOADED',
      actionLabel: 'Uploaded & Applied Resume to Profile',
      category: 'profile',
      targetTitle: uploadedResumeMeta.fileName,
      details: `Applied ${finalExperiences.length} career positions & ${mergedSkills.length} skills from "${uploadedResumeMeta.fileName}"`,
      user: updatedUser
    })
    if (onUpdateUser) {
      onUpdateUser(updatedUser)
    }

    // Immediately close modal and exit to the Profile section so the user can view the updated profile and uploaded resume
    setIsResumeModalOpen(false)
    setWorkspaceSection('profile')

    setResumeSuccessBanner(
      `✓ Resume "${uploadedResumeMeta.fileName}" saved & applied to your Profile! Updated ${finalExperiences.length} career positions and ${mergedSkills.length} verified skills.`
    )
    setTimeout(() => setResumeSuccessBanner(null), 9000)

    // Smooth scroll to the uploaded resume & experience section on the Profile view
    if (typeof window !== "undefined") {
      setTimeout(() => {
        const el =
          document.getElementById("profile-uploaded-resume-section") ||
          document.getElementById("workspace-experience-section")
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }, 120)
    }
  }

  const handleSaveManualExperience = (exp: ParsedExperience) => {
    if (!canManageWorkspace) return
    const formattedExp = {
      id: exp.id,
      role: exp.role,
      company: exp.company,
      companyLogo: exp.companyLogo || 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=100&auto=format&fit=crop&q=80',
      employmentType: exp.employmentType || 'Full-time',
      duration: exp.duration,
      location: exp.location,
      description: exp.description,
      skills: exp.skills
    }

    let nextExpList: any[] = []
    if (editingExperience) {
      nextExpList = (user.experience || []).map(e => (e.id === exp.id ? formattedExp : e))
    } else {
      nextExpList = [formattedExp, ...(user.experience || [])]
    }

    const updatedUser: UserProfile = {
      ...user,
      experience: nextExpList
    }

    persistWorkspaceUserProfile(updatedUser)
    if (onUpdateUser) {
      onUpdateUser(updatedUser)
    }
    setEditingExperience(null)
  }

  const handleDeleteExperience = (expId: string) => {
    if (!canManageWorkspace) return
    const nextExpList = (user.experience || []).filter(e => e.id !== expId)
    const updatedUser: UserProfile = {
      ...user,
      experience: nextExpList
    }
    persistWorkspaceUserProfile(updatedUser)
    if (onUpdateUser) {
      onUpdateUser(updatedUser)
    }
  }

  const handleQuickPresetImport = (presetId: string) => {
    const preset = DEMO_RESUME_PRESETS.find(p => p.id === presetId)
    if (!preset) return
    handleApplyResumeExperience(preset.parsed.experiences, {
      updateHeadline: true,
      newHeadline: preset.parsed.headline,
      updateAbout: true,
      newAbout: preset.parsed.about,
      updateSkills: true,
      extractedSkills: preset.parsed.skills,
      appendMode: false
    })
  }

  // 9 Workspace Sub-Sections (Products integrated directly into Personal Business Website)
  const [workspaceSection, setWorkspaceSection] = useState<
    'profile' | 'portfolio' | 'skills' | 'certifications' | 'experience' | 'publications' | 'reviews' | 'business' | 'analytics'
  >('profile')
  const [isMemberConnected, setIsMemberConnected] = useState<boolean>(false)

  const [analyticsSubTab, setAnalyticsSubTab] = useState<'viewers' | 'reach' | 'discoveries'>('viewers')
  const [telemetryTick, setTelemetryTick] = useState(0)
  const tailoredAnalytics = React.useMemo(() => getProfileTailoredAnalytics(user), [
    user.id,
    user.name,
    user.headline,
    user.profession,
    user.professionEnclave,
    user.location,
    user.profileViews,
    user.postImpressions,
    user.searchAppearances,
    user.connectionsCount,
    user.skills,
    telemetryTick
  ])
  const [viewers, setViewers] = useState<ProfileViewerItem[]>(() => getProfileTailoredAnalytics(user).viewers)
  const reachData = tailoredAnalytics.reachData
  const discoveryData = tailoredAnalytics.discoveryData
  const [viewerCategoryFilter, setViewerCategoryFilter] = useState<'all' | 'recruiter' | 'buyer' | 'peer' | 'executive'>('all')
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedTrendDay, setSelectedTrendDay] = useState<string | null>(null)

  useEffect(() => {
    setWorkspaceSection('profile')
    setIsMemberConnected(false)
    setViewers(getProfileTailoredAnalytics(user).viewers)
    if (user?.name) {
      syncLiveUserTelemetryFromCloud(user.name).then(() => {
        setTelemetryTick(v => v + 1)
        setViewers(getProfileTailoredAnalytics(user).viewers)
      }).catch(() => {})
    }
  }, [user.id, user.name, user.professionEnclave, user.profession])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleUpdate = () => {
      setTelemetryTick(v => v + 1)
      setViewers(getProfileTailoredAnalytics(user).viewers)
    }
    window.addEventListener('connectln-telemetry-updated', handleUpdate)
    return () => window.removeEventListener('connectln-telemetry-updated', handleUpdate)
  }, [user])

  const handleToggleViewerConnect = (viewerId: string) => {
    setViewers(prev => {
      const updated = prev.map(v => {
        if (v.id !== viewerId) return v
        if (v.isConnected) return { ...v, isConnected: false, isPending: false }
        if (v.isPending) return { ...v, isPending: false }
        return { ...v, isPending: true }
      })
      saveStoredProfileViewers(updated)
      return updated
    })
  }

  // Photo & Cover Attachment + Interactive Trim/Crop State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
  const [photoModalTab, setPhotoModalTab] = useState<'avatar' | 'cover'>('avatar')
  const [customAvatarUrl, setCustomAvatarUrl] = useState("")
  const [customCoverUrl, setCustomCoverUrl] = useState("")
  const [photoSuccessMsg, setPhotoSuccessMsg] = useState<string | null>(null)

  // Avatar Trim / Fit Controls
  const [pendingAvatarSrc, setPendingAvatarSrc] = useState<string | null>(null)
  const [avatarZoom, setAvatarZoom] = useState<number>(1)
  const [avatarOffsetX, setAvatarOffsetX] = useState<number>(0)
  const [avatarOffsetY, setAvatarOffsetY] = useState<number>(0)
  const [avatarRotate, setAvatarRotate] = useState<number>(0)
  const [isDraggingAvatar, setIsDraggingAvatar] = useState<boolean>(false)
  const avatarDragStartRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null)

  // Cover Trim / Fit Controls
  const [pendingCoverSrc, setPendingCoverSrc] = useState<string | null>(null)
  const [coverZoom, setCoverZoom] = useState<number>(1)
  const [coverOffsetX, setCoverOffsetX] = useState<number>(0)
  const [coverOffsetY, setCoverOffsetY] = useState<number>(0)
  const [isDraggingCover, setIsDraggingCover] = useState<boolean>(false)
  const coverDragStartRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null)

  const resetAvatarTrimControls = (src: string | null = null) => {
    setPendingAvatarSrc(src)
    setAvatarZoom(1)
    setAvatarOffsetX(0)
    setAvatarOffsetY(0)
    setAvatarRotate(0)
  }

  const resetCoverTrimControls = (src: string | null = null) => {
    setPendingCoverSrc(src)
    setCoverZoom(1)
    setCoverOffsetX(0)
    setCoverOffsetY(0)
  }

  const avatarFileInputRef = useRef<HTMLInputElement>(null)
  const coverFileInputRef = useRef<HTMLInputElement>(null)
  const editAvatarFileInputRef = useRef<HTMLInputElement>(null)
  const editCoverFileInputRef = useRef<HTMLInputElement>(null)

  // Edit Profile Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [editName, setEditName] = useState(user.name)
  const [editHeadline, setEditHeadline] = useState(user.headline)
  const [editLocation, setEditLocation] = useState(user.location)
  const [editAbout, setEditAbout] = useState(user.about)
  const [editAvatar, setEditAvatar] = useState(user.avatar)
  const [editCover, setEditCover] = useState(user.coverImage || "")
  const [editSavedSuccess, setEditSavedSuccess] = useState(false)

  // "Looking for a Job" Badge & Card State (ConnectLn replacement for LinkedIn #OPENTOWORK)
  const [jobBadgeStatus, setJobBadgeStatus] = useState<'Looking for a Job' | 'Looking for Projects' | 'Available for Hire' | 'Booked'>('Looking for a Job')
  const [jobCardRoles, setJobCardRoles] = useState<string>(
    `${resolvedDisplayProfession}, Lead Consultant & Project Manager`
  )
  const [jobCardWorkTypes, setJobCardWorkTypes] = useState<string>(
    'Full-time Employment · Contract Projects · Advisory'
  )
  const [jobCardLocations, setJobCardLocations] = useState<string>(
    `${user.location || 'Laurel, MD'} · On-site, Hybrid & Remote`
  )
  const [jobCardStartTiming, setJobCardStartTiming] = useState<string>(
    'Immediate Start · Verified Credentials Ready'
  )
  const [isEditingJobCard, setIsEditingJobCard] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const loadJobCardState = () => {
      try {
        const keySuffix = (user.name || 'default').toLowerCase()
        const savedStatus = localStorage.getItem(`connectin_availability_v1__${keySuffix}`)
        if (
          savedStatus === 'Looking for a Job' ||
          savedStatus === 'Looking for Projects' ||
          savedStatus === 'Available for Hire' ||
          savedStatus === 'Booked'
        ) {
          setJobBadgeStatus(savedStatus)
        } else if (savedStatus === 'Open' || savedStatus === 'Open to Shifts') {
          setJobBadgeStatus('Looking for a Job')
        }
        const rawCard = localStorage.getItem(`connectin_looking_for_job_card_v1__${keySuffix}`)
        const isCarpenterRole = tailoredWorkspaceProfile.resolution.subArchetype === 'carpentry_handyman'
        if (rawCard) {
          const parsed = JSON.parse(rawCard)
          if (parsed.roles) {
            const hasStaleCarpenter =
              /master carpenter/i.test(String(parsed.roles)) && !isCarpenterRole
            setJobCardRoles(
              hasStaleCarpenter
                ? `${resolvedDisplayProfession}, Lead Consultant & Project Manager`
                : parsed.roles
            )
          }
          if (parsed.workTypes) setJobCardWorkTypes(parsed.workTypes)
          if (parsed.locations) setJobCardLocations(parsed.locations)
          if (parsed.startTiming) setJobCardStartTiming(parsed.startTiming)
        } else {
          setJobCardRoles(`${resolvedDisplayProfession}, Lead Consultant & Project Manager`)
          setJobCardLocations(`${user.location || 'Laurel, MD'} · On-site, Hybrid & Remote`)
        }
      } catch {}
    }
    loadJobCardState()
    window.addEventListener('connectln-job-status-updated', loadJobCardState)
    return () => window.removeEventListener('connectln-job-status-updated', loadJobCardState)
  }, [user?.name, user?.profession, user?.location, resolvedDisplayProfession, tailoredWorkspaceProfile.resolution.subArchetype])

  const handleSaveJobCard = (nextStatus?: 'Looking for a Job' | 'Looking for Projects' | 'Available for Hire' | 'Booked') => {
    if (!canManageWorkspace) return
    const statusToSave = nextStatus || jobBadgeStatus
    setJobBadgeStatus(statusToSave)
    try {
      const keySuffix = (user.name || 'default').toLowerCase()
      localStorage.setItem(`connectin_availability_v1__${keySuffix}`, statusToSave)
      localStorage.setItem(
        `connectin_looking_for_job_card_v1__${keySuffix}`,
        JSON.stringify({
          roles: jobCardRoles,
          workTypes: jobCardWorkTypes,
          locations: jobCardLocations,
          startTiming: jobCardStartTiming
        })
      )
      window.dispatchEvent(new Event('connectln-job-status-updated'))
    } catch {}
    setIsEditingJobCard(false)
    setPhotoSuccessMsg(`✓ "Looking for a Job" badge & card updated (${statusToSave})`)
    setTimeout(() => setPhotoSuccessMsg(null), 3500)
  }

  const compressImageFile = (
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number = 0.9
  ): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const rawDataUrl = event.target?.result as string
        if (!rawDataUrl || typeof window === 'undefined') {
          resolve(rawDataUrl || '')
          return
        }
        const img = new window.Image()
        img.onload = () => {
          try {
            let width = img.width
            let height = img.height
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height)
              width = Math.round(width * ratio)
              height = Math.round(height * ratio)
            }
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height)
              const compressed = canvas.toDataURL('image/jpeg', quality)
              resolve(compressed)
              return
            }
          } catch {}
          resolve(rawDataUrl)
        }
        img.onerror = () => resolve(rawDataUrl)
        img.src = rawDataUrl
      }
      reader.readAsDataURL(file)
    })
  }

  const renderTrimmedImageToDataUrl = (
    sourceUrl: string,
    targetWidth: number,
    targetHeight: number,
    zoom: number,
    offsetX: number,
    offsetY: number,
    rotateDeg: number,
    previewWidth: number,
    previewHeight: number
  ): Promise<string> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !sourceUrl) {
        resolve(sourceUrl)
        return
      }
      // If no trim/zoom/pan/rotation was applied, return source directly
      if (zoom === 1 && offsetX === 0 && offsetY === 0 && rotateDeg === 0) {
        resolve(sourceUrl)
        return
      }
      const img = new window.Image()
      if (!sourceUrl.startsWith('data:')) {
        img.crossOrigin = 'anonymous'
      }
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = targetWidth
          canvas.height = targetHeight
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve(sourceUrl)
            return
          }
          // Subtle neutral background when zoomed out (< 1x) to fit full portrait
          ctx.fillStyle = '#1e293b'
          ctx.fillRect(0, 0, targetWidth, targetHeight)

          const baseScale = Math.max(targetWidth / img.width, targetHeight / img.height)
          const drawW = img.width * baseScale
          const drawH = img.height * baseScale

          const scaleFactorX = targetWidth / previewWidth
          const scaleFactorY = targetHeight / previewHeight

          ctx.save()
          ctx.translate(
            targetWidth / 2 + offsetX * scaleFactorX,
            targetHeight / 2 + offsetY * scaleFactorY
          )
          ctx.scale(zoom, zoom)
          if (rotateDeg !== 0) {
            ctx.rotate((rotateDeg * Math.PI) / 180)
          }
          ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
          ctx.restore()

          const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9)
          resolve(croppedDataUrl)
        } catch {
          resolve(sourceUrl)
        }
      }
      img.onerror = () => resolve(sourceUrl)
      img.src = sourceUrl
    })
  }

  const handleUpdateAvatar = (newAvatarUrl: string) => {
    if (!canManageWorkspace) return
    if (isAccountOwner) savePersistentAvatar(newAvatarUrl, user)
    const updated: UserProfile = {
      ...user,
      avatar: newAvatarUrl
    }
    persistWorkspaceUserProfile(updated)
    trackUserActivity({
      actionType: 'PROFILE_UPDATED',
      actionLabel: 'Updated & Trimmed Profile Picture',
      category: 'profile',
      targetTitle: user.name,
      details: 'Saved trimmed & fitted profile picture to account vault',
      user: updated
    })
    if (onUpdateUser) {
      onUpdateUser(updated)
    }
    setEditAvatar(newAvatarUrl)
    resetAvatarTrimControls(null)
    setPhotoSuccessMsg("Profile picture trimmed & saved permanently to your profile!")
    setTimeout(() => setPhotoSuccessMsg(null), 4000)
    setIsPhotoModalOpen(false)
  }

  const handleSaveTrimmedAvatar = async () => {
    const activeSrc = pendingAvatarSrc || user.avatar
    const trimmedDataUrl = await renderTrimmedImageToDataUrl(
      activeSrc,
      360,
      360,
      avatarZoom,
      avatarOffsetX,
      avatarOffsetY,
      avatarRotate,
      144,
      144
    )
    handleUpdateAvatar(trimmedDataUrl)
  }

  const handleUpdateCover = (newCoverUrl: string) => {
    if (!canManageWorkspace) return
    if (isAccountOwner) savePersistentCover(newCoverUrl, user)
    const updated: UserProfile = {
      ...user,
      coverImage: newCoverUrl
    }
    persistWorkspaceUserProfile(updated)
    if (onUpdateUser) {
      onUpdateUser(updated)
    }
    setEditCover(newCoverUrl)
    resetCoverTrimControls(null)
    setPhotoSuccessMsg("Cover banner trimmed & saved permanently to your profile!")
    setTimeout(() => setPhotoSuccessMsg(null), 4000)
    setIsPhotoModalOpen(false)
  }

  const handleSaveTrimmedCover = async () => {
    const activeSrc = pendingCoverSrc || user.coverImage || "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80"
    const trimmedDataUrl = await renderTrimmedImageToDataUrl(
      activeSrc,
      1000,
      340,
      coverZoom,
      coverOffsetX,
      coverOffsetY,
      0,
      360,
      112
    )
    handleUpdateCover(trimmedDataUrl)
  }

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await compressImageFile(file, 360, 360, 0.82)
    if (dataUrl) {
      // Load into interactive Trim & Fit editor AND immediately persist so refreshing never loses the uploaded photo!
      setPendingAvatarSrc(dataUrl)
      setAvatarZoom(1)
      setAvatarOffsetX(0)
      setAvatarOffsetY(0)
      setAvatarRotate(0)
      if (isAccountOwner) savePersistentAvatar(dataUrl, user)
      const updated: UserProfile = { ...user, avatar: dataUrl }
      persistWorkspaceUserProfile(updated)
      if (onUpdateUser) {
        onUpdateUser(updated)
      }
      setEditAvatar(dataUrl)
      setPhotoSuccessMsg("✓ Profile picture uploaded & saved! Adjust zoom/fit below or close anytime.")
    }
    e.target.value = ""
  }

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await compressImageFile(file, 1000, 340, 0.80)
    if (dataUrl) {
      setPendingCoverSrc(dataUrl)
      setCoverZoom(1)
      setCoverOffsetX(0)
      setCoverOffsetY(0)
      if (isAccountOwner) savePersistentCover(dataUrl, user)
      const updated: UserProfile = { ...user, coverImage: dataUrl }
      persistWorkspaceUserProfile(updated)
      if (onUpdateUser) {
        onUpdateUser(updated)
      }
      setEditCover(dataUrl)
      setPhotoSuccessMsg("✓ Cover banner uploaded & saved! Adjust zoom/fit below or close anytime.")
    }
    e.target.value = ""
  }

  const handleEditAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await compressImageFile(file, 360, 360, 0.82)
    if (dataUrl) {
      setEditAvatar(dataUrl)
      if (isAccountOwner) savePersistentAvatar(dataUrl, user)
      const updated: UserProfile = { ...user, avatar: dataUrl }
      persistWorkspaceUserProfile(updated)
      if (onUpdateUser) {
        onUpdateUser(updated)
      }
    }
  }

  const handleEditCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await compressImageFile(file, 1000, 340, 0.80)
    if (dataUrl) {
      setEditCover(dataUrl)
      if (isAccountOwner) savePersistentCover(dataUrl, user)
      const updated: UserProfile = { ...user, coverImage: dataUrl }
      persistWorkspaceUserProfile(updated)
      if (onUpdateUser) {
        onUpdateUser(updated)
      }
    }
  }

  // WhatsApp & Multi-Social Share State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  const profileSharePic = useSharePic(resolveSharePhoto(user as any))
  const getProfileSharePayload = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://sphera-portal.vercel.app"
    const profileUrl = buildSharePreviewUrl({
      to: `/connectin`,
      title: `${user.name} on ConnectLn`,
      sharerName: user.name,
      pic: profileSharePic,
      subtitle: user.headline || "",
    })
    const headlineSnippet = user.headline || "ConnectIn Professional"
    const shareText = `👋 Connect with ${user.name} on ConnectIn!\n\n🏛️ ${headlineSnippet}\n📍 ${user.location}\n\nView full verified portfolio & career experience:\n${profileUrl}`
    return { origin, profileUrl, headlineSnippet, shareText }
  }

  const handleShareToWhatsApp = () => {
    const { shareText } = getProfileSharePayload()
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareText).catch(() => {})
    }
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`
    window.open(whatsappUrl, "_blank")
    setPhotoSuccessMsg("Opening WhatsApp & copied profile link to clipboard!")
    setTimeout(() => setPhotoSuccessMsg(null), 4000)
  }

  const handleShareToFacebook = () => {
    const { profileUrl, shareText } = getProfileSharePayload()
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}&quote=${encodeURIComponent(shareText)}`
    window.open(fbUrl, "_blank", "width=600,height=500")
  }

  const handleShareToTwitter = () => {
    const { profileUrl, headlineSnippet } = getProfileSharePayload()
    const text = `Connect with ${user.name} on ConnectIn (${headlineSnippet}):`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`
    window.open(twitterUrl, "_blank", "width=600,height=500")
  }

  const handleShareToInstagram = async () => {
    const { shareText } = getProfileSharePayload()
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText)
      }
    } catch {}
    setPhotoSuccessMsg("Profile info & link copied to clipboard! Opening Instagram...")
    setTimeout(() => setPhotoSuccessMsg(null), 4000)
    window.open("https://www.instagram.com/", "_blank")
  }

  const handleShareToLinkedIn = () => {
    const { profileUrl } = getProfileSharePayload()
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`
    window.open(linkedinUrl, "_blank", "width=600,height=500")
  }

  const handleShareToEmail = () => {
    const { profileUrl, shareText } = getProfileSharePayload()
    const subject = `Connect with ${user.name} on ConnectIn`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareText)}`, "_blank")
  }

  const handleCopyProfileLink = async () => {
    const { profileUrl } = getProfileSharePayload()
    try {
      await navigator.clipboard.writeText(profileUrl)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 3000)
    } catch {}
  }

  // Developer / Company Products & Personal Business Website State
  const [managedOfferings, setManagedOfferings] = useState<BusinessWebsiteOffering[]>(
    () => tailoredWorkspaceProfile.business.offerings
  )
  const [editingOfferingId, setEditingOfferingId] = useState<string | null>(null)
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)
  const [newProductName, setNewProductName] = useState("")
  const [newProductCategory, setNewProductCategory] = useState<VendorProductItem['category']>('Services')
  const [newProductPrice, setNewProductPrice] = useState("")
  const [newProductBillingUnit, setNewProductBillingUnit] = useState("Flat Rate / Package")
  const [newProductTurnaround, setNewProductTurnaround] = useState("Same-Week Availability")
  const [newProductDescription, setNewProductDescription] = useState("")
  const [newProductDeliverables, setNewProductDeliverables] = useState("")
  const [productAddedSuccess, setProductAddedSuccess] = useState(false)

  // Personal Business Website State & Customizations
  const [businessOverrides, setBusinessOverrides] = useState<Partial<PersonalBusinessWebsiteData>>({})
  const [businessCategoryFilter, setBusinessCategoryFilter] = useState<string>('All')
  const [openBusinessFaqIdx, setOpenBusinessFaqIdx] = useState<number | null>(0)
  const [siteUrlCopied, setSiteUrlCopied] = useState(false)
  const [isBusinessPreviewMode, setIsBusinessPreviewMode] = useState(false)
  const [isEditWebsiteModalOpen, setIsEditWebsiteModalOpen] = useState(false)
  const [editWebsiteName, setEditWebsiteName] = useState("")
  const [editWebsiteSlug, setEditWebsiteSlug] = useState("")
  const [editWebsiteHeadline, setEditWebsiteHeadline] = useState("")
  const [editWebsiteSubheadline, setEditWebsiteSubheadline] = useState("")
  const [editWebsiteTagline, setEditWebsiteTagline] = useState("")
  const [editWebsiteBannerUrl, setEditWebsiteBannerUrl] = useState("")
  const [editWebsiteTheme, setEditWebsiteTheme] = useState<BusinessThemeColor>('blue')
  const [editWebsiteServiceArea, setEditWebsiteServiceArea] = useState("")
  const [editWebsiteHours, setEditWebsiteHours] = useState("")
  const [editWebsitePhone, setEditWebsitePhone] = useState("")
  const [editWebsiteEmail, setEditWebsiteEmail] = useState("")
  const [editWebsiteLicense, setEditWebsiteLicense] = useState("")
  const [editWebsiteAbout, setEditWebsiteAbout] = useState("")
  const [editWebsiteMission, setEditWebsiteMission] = useState("")
  const [editWebsiteOfferingsDraft, setEditWebsiteOfferingsDraft] = useState<BusinessWebsiteOffering[]>([])
  const [websiteSavedSuccess, setWebsiteSavedSuccess] = useState(false)
  const hydratedWorkspaceKeyRef = useRef<string | null>(null)

  // Business Website Booking / Request Quote State
  const [quoteClientName, setQuoteClientName] = useState("")
  const [quoteClientEmail, setQuoteClientEmail] = useState("")
  const [quoteSelectedOffering, setQuoteSelectedOffering] = useState("")
  const [quotePreferredDate, setQuotePreferredDate] = useState("")
  const [quoteNotes, setQuoteNotes] = useState("")
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false)
  const [quoteSubmittedReceipt, setQuoteSubmittedReceipt] = useState<{
    id: string
    service: string
    clientName: string
    preferredDate: string
    contact?: string
    notes?: string
    emailDispatched?: boolean
    emailRecipients?: string[]
    emailMessageId?: string
    emailError?: string
  } | null>(null)

  const businessWebsite: PersonalBusinessWebsiteData = React.useMemo(
    () => ({
      ...tailoredWorkspaceProfile.business,
      ...businessOverrides,
      domainSlug: businessOverrides.domainSlug || tailoredWorkspaceProfile.business.domainSlug,
      domainUrl: `https://${businessOverrides.domainSlug || tailoredWorkspaceProfile.business.domainSlug}.conectln.com`,
      emailDisplay:
        businessOverrides.emailDisplay ||
        tailoredWorkspaceProfile.business.emailDisplay
    }),
    [tailoredWorkspaceProfile.business, businessOverrides]
  )

  const allWebsiteOfferings: BusinessWebsiteOffering[] = managedOfferings

  const myProducts: VendorProductItem[] = React.useMemo(
    () =>
      managedOfferings.map((off) => ({
        id: off.id,
        name: off.title,
        category: off.productCategory,
        icon: off.icon,
        pricingModel: off.billingUnit,
        price: off.price,
        activeLicensesCount: off.activeClientsCount,
        activeTrialsCount: Math.max(4, Math.round(off.leadsCount * 0.6)),
        mrrOrRevenue: off.revenueLabel,
        rating: off.rating,
        reviewsCount: off.reviewsCount,
        status: 'Active Listing',
        leadsCount: off.leadsCount,
        description: off.description,
        turnaround: off.turnaround
      })),
    [managedOfferings]
  )

  const writeOfferingsToStorage = React.useCallback(
    (nextOfferings: BusinessWebsiteOffering[]) => {
      const serialized = JSON.stringify(nextOfferings)
      safeSetWorkspaceLocalStorage(`connectin_managed_offerings_v2_${stableWorkspaceNameKey}`, serialized)
      safeSetWorkspaceLocalStorage(`connectin_managed_offerings_v1_${userWorkspaceStorageKey}`, serialized)
    },
    [safeSetWorkspaceLocalStorage, stableWorkspaceNameKey, userWorkspaceStorageKey]
  )

  const writeWebsiteOverridesToStorage = React.useCallback(
    (nextOverrides: Partial<PersonalBusinessWebsiteData>) => {
      const serialized = JSON.stringify(nextOverrides)
      safeSetWorkspaceLocalStorage(`connectin_business_website_v2_${stableWorkspaceNameKey}`, serialized)
      safeSetWorkspaceLocalStorage(`connectin_business_website_v1_${userWorkspaceStorageKey}`, serialized)
    },
    [safeSetWorkspaceLocalStorage, stableWorkspaceNameKey, userWorkspaceStorageKey]
  )

  const persistManagedOfferings = (
    updater:
      | BusinessWebsiteOffering[]
      | ((prev: BusinessWebsiteOffering[]) => BusinessWebsiteOffering[])
  ) => {
    setManagedOfferings((prev) => {
      const nextOfferings = typeof updater === 'function' ? updater(prev) : updater
      writeOfferingsToStorage(nextOfferings)
      return nextOfferings
    })
  }

  useEffect(() => {
    if (hydratedWorkspaceKeyRef.current === stableWorkspaceNameKey) {
      return
    }
    hydratedWorkspaceKeyRef.current = stableWorkspaceNameKey

    let loadedOfferings: BusinessWebsiteOffering[] | null = null
    let loadedLegacyCustom: VendorProductItem[] = []
    let loadedSiteOverrides: Partial<PersonalBusinessWebsiteData> = {}
    if (typeof window !== 'undefined') {
      try {
        const rawManaged =
          localStorage.getItem(`connectin_managed_offerings_v2_${stableWorkspaceNameKey}`) ||
          localStorage.getItem(`connectin_managed_offerings_v1_${userWorkspaceStorageKey}`)
        if (rawManaged) {
          const parsed = JSON.parse(rawManaged)
          if (Array.isArray(parsed)) loadedOfferings = parsed
        }
      } catch {}
      if (!loadedOfferings) {
        try {
          const rawProds = localStorage.getItem(`connectin_custom_products_v1_${userWorkspaceStorageKey}`)
          if (rawProds) {
            const parsed = JSON.parse(rawProds)
            if (Array.isArray(parsed)) loadedLegacyCustom = parsed
          }
        } catch {}
      }
      try {
        const rawSite =
          localStorage.getItem(`connectin_business_website_v2_${stableWorkspaceNameKey}`) ||
          localStorage.getItem(`connectin_business_website_v1_${userWorkspaceStorageKey}`)
        if (rawSite) {
          const parsed = JSON.parse(rawSite)
          if (parsed && typeof parsed === 'object') loadedSiteOverrides = parsed
        }
      } catch {}
    }

    if (loadedOfferings) {
      setManagedOfferings(loadedOfferings)
      setQuoteSelectedOffering(loadedOfferings[0]?.title || '')
    } else {
      const legacyMapped: BusinessWebsiteOffering[] = loadedLegacyCustom.map((p) => ({
        id: p.id,
        title: p.name,
        category: p.category,
        productCategory: p.category,
        price: p.price,
        billingUnit: p.pricingModel || 'Flat Rate / Plan',
        turnaround: p.turnaround || 'Available Now',
        popular: true,
        icon: p.icon || '✨',
        description:
          p.description ||
          `Direct service & marketplace offering by ${tailoredWorkspaceProfile.business.businessName}.`,
        deliverables: [
          `Direct fulfillment by ${user.name}`,
          'Transparent upfront pricing & SLA',
          'Synced with ConnectLn Marketplace protection'
        ],
        ctaLabel: 'Book / Request Quote',
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        activeClientsCount: p.activeLicensesCount,
        revenueLabel: p.mrrOrRevenue,
        leadsCount: p.leadsCount
      }))
      const combined = [...legacyMapped, ...tailoredWorkspaceProfile.business.offerings]
      setManagedOfferings(combined)
      setQuoteSelectedOffering(combined[0]?.title || '')
    }

    setBusinessOverrides(loadedSiteOverrides)
    setBusinessCategoryFilter('All')
    setQuoteSubmittedReceipt(null)
    setIsBusinessPreviewMode(false)
  }, [stableWorkspaceNameKey, userWorkspaceStorageKey, tailoredWorkspaceProfile, user.name])

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canManageWorkspace) return
    if (!editName.trim()) return

    const resolvedAvatar = editAvatar.trim() || user.avatar
    const resolvedCover = editCover.trim() || user.coverImage

    const updated: UserProfile = {
      ...user,
      name: editName.trim(),
      headline: editHeadline.trim(),
      location: editLocation.trim(),
      about: editAbout.trim(),
      avatar: resolvedAvatar,
      ...(resolvedCover ? { coverImage: resolvedCover } : {})
    }

    if (resolvedAvatar && !resolvedAvatar.includes("api.dicebear.com")) {
      if (isAccountOwner) savePersistentAvatar(resolvedAvatar, updated)
    }
    if (resolvedCover) {
      if (isAccountOwner) savePersistentCover(resolvedCover, updated)
    }

    persistWorkspaceUserProfile(updated)
    if (onUpdateUser) {
      onUpdateUser(updated)
    }

    setEditSavedSuccess(true)
    setTimeout(() => {
      setEditSavedSuccess(false)
      setIsEditProfileOpen(false)
    }, 1000)
  }

  // Skill Endorsement & Qualified Jobs Matching State
  const [skills, setSkills] = useState(WORKSPACE_VERIFIED_SKILLS_DATA)
  const [skillEndorsementBonuses, setSkillEndorsementBonuses] = useState<Record<string, number>>({})
  const [selectedSkillJobFilter, setSelectedSkillJobFilter] = useState<string>('all')
  const [workplaceJobFilter, setWorkplaceJobFilter] = useState<'all' | 'Remote' | 'Hybrid' | 'Fractional Executive'>('all')
  const [appliedSkillJobIds, setAppliedSkillJobIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem('connectin_skill_applied_jobs_v1')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [savedSkillJobIds, setSavedSkillJobIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem('connectin_skill_saved_jobs_v1')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [lastAppliedJobToast, setLastAppliedJobToast] = useState<SkillQualifiedJob | null>(null)
  const [inspectingSkillJob, setInspectingSkillJob] = useState<SkillQualifiedJob | null>(null)
  const [showAddSkillInput, setShowAddSkillInput] = useState(false)
  const [newVerifiedSkillName, setNewVerifiedSkillName] = useState("")
  const [hasVouchedForMember, setHasVouchedForMember] = useState(false)

  const handleEndorseSkill = (skillName: string) => {
    setSkills(prev =>
      prev.map(s => (s.name === skillName ? { ...s, endorsementsCount: (s.endorsementsCount || 0) + 1 } : s))
    )
    setSkillEndorsementBonuses(prev => ({
      ...prev,
      [skillName]: (prev[skillName] || 0) + 1
    }))
    const endorserViewer = loadStoredUser()
    const voucherName =
      endorserViewer?.name && endorserViewer.name.toLowerCase() !== user.name.toLowerCase()
        ? endorserViewer.name
        : 'Commander Robert Hayes'
    const voucherHeadline =
      endorserViewer?.name && endorserViewer.name.toLowerCase() !== user.name.toLowerCase()
        ? endorserViewer.headline
        : 'Platform IAM & Guild Verification Director · ConnectLn'
    recordLiveVouch({
      targetName: user.name,
      voucherName,
      voucherHeadline,
      voucherAvatar:
        endorserViewer?.name && endorserViewer.name.toLowerCase() !== user.name.toLowerCase()
          ? endorserViewer.avatar
          : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
      voucherCompany: (endorserViewer as any)?.company || 'ConnectLn Verified Guild',
      voucherRelation: 'Verified Skill & Craftsmanship Vouch',
      skillOrCredential: skillName,
      note: `${voucherName} vouched for ${user.name}'s verified proficiency in "${skillName}".`
    })
    if (user.skills && user.skills.length > 0) {
      const updatedSkills = user.skills.map((s: any) => {
        const sName = typeof s === 'string' ? s : s.name
        if (sName === skillName) {
          const currentCount = typeof s === 'object' ? (s.endorsements ?? s.endorsementsCount ?? 0) : 0
          return {
            ...(typeof s === 'object' ? s : { name: sName, endorsers: [] }),
            name: sName,
            endorsements: currentCount + 1
          }
        }
        return s
      })
      const updatedUser: UserProfile = { ...user, skills: updatedSkills }
      persistWorkspaceUserProfile(updatedUser)
      if (onUpdateUser) onUpdateUser(updatedUser)
    }
  }

  const handleAddVerifiedSkill = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canManageWorkspace) return
    const trimmed = newVerifiedSkillName.trim()
    if (!trimmed) return
    const existingSkills = user.skills && user.skills.length > 0
      ? user.skills
      : enclaveWorkspace.verifiedSkills.map(vs => ({
          name: vs.name,
          endorsements: 0,
          endorsers: [vs.verifiedBy]
        }))
    if (!existingSkills.some((s: any) => (typeof s === 'string' ? s : s.name).toLowerCase() === trimmed.toLowerCase())) {
      const updatedUser: UserProfile = {
        ...user,
        skills: [
          ...existingSkills,
          { name: trimmed, endorsements: 0, endorsers: [`${enclaveInfo?.name || 'ConnectIn'} Master Board`] }
        ]
      }
      persistWorkspaceUserProfile(updatedUser)
      if (onUpdateUser) onUpdateUser(updatedUser)
    }
    setNewVerifiedSkillName("")
    setShowAddSkillInput(false)
    setSelectedSkillJobFilter(trimmed)
  }

  const handleToggleApplySkillJob = (job: SkillQualifiedJob) => {
    setAppliedSkillJobIds(prev => {
      const exists = prev.includes(job.id)
      const next = exists ? prev.filter(id => id !== job.id) : [...prev, job.id]
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('connectin_skill_applied_jobs_v1', JSON.stringify(next))
        } catch {}
      }
      if (!exists) {
        setLastAppliedJobToast(job)
      }
      return next
    })
  }

  const handleToggleSaveSkillJob = (jobId: string) => {
    setSavedSkillJobIds(prev => {
      const next = prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('connectin_skill_saved_jobs_v1', JSON.stringify(next))
        } catch {}
      }
      return next
    })
  }

  const handleOpenAddProductModal = () => {
    if (!canManageWorkspace) return
    setEditingOfferingId(null)
    setNewProductName("")
    setNewProductCategory('Services')
    setNewProductPrice("")
    setNewProductBillingUnit("Flat Rate / Package")
    setNewProductTurnaround("Same-Week Availability")
    setNewProductDescription("")
    setNewProductDeliverables(
      `Direct fulfillment by ${user.name}\nTransparent upfront pricing & SLA\nConnectLn Marketplace escrow protection`
    )
    setProductAddedSuccess(false)
    setIsAddProductModalOpen(true)
  }

  const handleOpenEditProductModal = (offering: BusinessWebsiteOffering) => {
    if (!canManageWorkspace) return
    setEditingOfferingId(offering.id)
    setNewProductName(offering.title)
    setNewProductCategory(offering.productCategory || 'Services')
    setNewProductPrice(offering.price)
    setNewProductBillingUnit(offering.billingUnit ?? '')
    setNewProductTurnaround(offering.turnaround ?? '')
    setNewProductDescription(offering.description || '')
    setNewProductDeliverables((offering.deliverables || []).join('\n'))
    setProductAddedSuccess(false)
    setIsAddProductModalOpen(true)
  }

  const handleDeleteProductOffering = (offeringId: string) => {
    if (!canManageWorkspace) return
    persistManagedOfferings((prev) => prev.filter((o) => o.id !== offeringId))
    setPhotoSuccessMsg('✓ Listing removed from your Business Page & Marketplace catalog.')
    setTimeout(() => setPhotoSuccessMsg(null), 4000)
  }

  const handleResetDefaultCatalog = () => {
    if (!canManageWorkspace) return
    setBusinessOverrides({})
    persistManagedOfferings(tailoredWorkspaceProfile.business.offerings)
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`connectin_business_website_v2_${stableWorkspaceNameKey}`)
        localStorage.removeItem(`connectin_managed_offerings_v2_${stableWorkspaceNameKey}`)
        localStorage.removeItem(`connectin_business_website_v1_${userWorkspaceStorageKey}`)
        localStorage.removeItem(`connectin_managed_offerings_v1_${userWorkspaceStorageKey}`)
        localStorage.removeItem(`connectin_custom_products_v1_${userWorkspaceStorageKey}`)
      } catch {}
    }
    setPhotoSuccessMsg('✓ Business Website and Products restored to your profession defaults.')
    setTimeout(() => setPhotoSuccessMsg(null), 4000)
  }

  const handleCreateProductListing = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canManageWorkspace) return
    const trimmedTitle = newProductName.trim()
    if (!trimmedTitle) return

    const parsedDeliverables = newProductDeliverables
      .split(/\r?\n|,/)
      .map((s) => s.trim())
      .filter(Boolean)

    const fallbackDeliverables = [
      `Direct fulfillment by ${user.name}`,
      'Transparent upfront pricing & SLA',
      'Synced with ConnectLn Marketplace protection'
    ]

    const iconForCategory =
      newProductCategory === 'Software'
        ? '🛡️'
        : newProductCategory === 'Training'
        ? '🎓'
        : newProductCategory === 'Clinical Services'
        ? '🩺'
        : newProductCategory === 'Trade Plans' || newProductCategory === 'Maintenance Plans'
        ? '🛠️'
        : newProductCategory === 'Diagnostics'
        ? '📊'
        : '⚡'

    if (editingOfferingId) {
      const targetId = editingOfferingId
      const trimmedPrice = newProductPrice.trim()
      const trimmedBilling = newProductBillingUnit.trim()
      const trimmedTurnaround = newProductTurnaround.trim()
      const trimmedDesc = newProductDescription.trim()

      persistManagedOfferings((prev) =>
        prev.map((item) => {
          if (item.id !== targetId) return item
          const editedCategoryChanged = newProductCategory !== item.productCategory
          return {
            ...item,
            title: trimmedTitle,
            category: editedCategoryChanged ? newProductCategory : (item.category || newProductCategory),
            productCategory: newProductCategory,
            icon: editedCategoryChanged ? iconForCategory : item.icon,
            price: trimmedPrice || item.price,
            billingUnit: trimmedBilling,
            turnaround: trimmedTurnaround,
            description:
              trimmedDesc ||
              `Direct service & marketplace offering by ${businessWebsite.businessName}.`,
            deliverables: parsedDeliverables.length > 0 ? parsedDeliverables : fallbackDeliverables,
            revenueLabel: trimmedPrice || item.revenueLabel
          }
        })
      )
      setQuoteSelectedOffering(trimmedTitle)
      setPhotoSuccessMsg(`✓ Updated "${trimmedTitle}" live on your Business Page!`)
      setTimeout(() => setPhotoSuccessMsg(null), 4500)
    } else {
      const priceStr = newProductPrice.trim() || '$299'
      const newOffering: BusinessWebsiteOffering = {
        id: 'prod_' + Date.now(),
        title: trimmedTitle,
        category: newProductCategory,
        productCategory: newProductCategory,
        price: priceStr,
        billingUnit:
          newProductBillingUnit.trim() ||
          (priceStr.toLowerCase().includes('/ mo') ? 'Monthly Plan' : 'Direct Service / Package'),
        turnaround: newProductTurnaround.trim() || 'Available Now',
        popular: true,
        icon: iconForCategory,
        description:
          newProductDescription.trim() ||
          `Direct service & marketplace offering by ${businessWebsite.businessName}.`,
        deliverables: parsedDeliverables.length > 0 ? parsedDeliverables : fallbackDeliverables,
        ctaLabel: 'Book / Order Now',
        rating: 5.0,
        reviewsCount: 1,
        activeClientsCount: 1,
        revenueLabel: `${priceStr} Listed`,
        leadsCount: 1
      }
      persistManagedOfferings((prev) => [newOffering, ...prev])
      setBusinessCategoryFilter('All')
      setQuoteSelectedOffering(newOffering.title)
      setPhotoSuccessMsg(`✓ Published "${newOffering.title}" live on your Business Page & Marketplace!`)
      setTimeout(() => setPhotoSuccessMsg(null), 4500)
    }

    setIsAddProductModalOpen(false)
    setProductAddedSuccess(false)
    setEditingOfferingId(null)
    setNewProductName("")
    setNewProductPrice("")
    setNewProductDescription("")
    setNewProductDeliverables("")
  }

  const handleOpenEditWebsiteModal = () => {
    if (!canManageWorkspace) return
    setEditWebsiteName(businessWebsite.businessName)
    setEditWebsiteSlug(businessWebsite.domainSlug)
    setEditWebsiteHeadline(businessWebsite.heroHeadline)
    setEditWebsiteSubheadline(businessWebsite.heroSubheadline)
    setEditWebsiteTagline(businessWebsite.tagline)
    setEditWebsiteBannerUrl(businessWebsite.heroBannerImage)
    setEditWebsiteTheme(businessWebsite.themeColor)
    setEditWebsiteServiceArea(businessWebsite.serviceArea)
    setEditWebsiteHours(businessWebsite.operatingHours)
    setEditWebsitePhone(businessWebsite.phoneDisplay)
    setEditWebsiteEmail(businessWebsite.emailDisplay)
    setEditWebsiteLicense(businessWebsite.licenseNumber)
    setEditWebsiteAbout(businessWebsite.aboutStory)
    setEditWebsiteMission(businessWebsite.missionStatement)
    setEditWebsiteOfferingsDraft(managedOfferings.map((o) => ({ ...o })))
    setWebsiteSavedSuccess(false)
    setIsEditWebsiteModalOpen(true)
  }

  const handleSaveWebsiteCustomization = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canManageWorkspace) return
    if (!editWebsiteName.trim()) return
    const cleanSlug =
      editWebsiteSlug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '') || tailoredWorkspaceProfile.business.domainSlug

    const nextOverrides: Partial<PersonalBusinessWebsiteData> = {
      businessName: editWebsiteName.trim(),
      domainSlug: cleanSlug,
      domainUrl: `https://${cleanSlug}.conectln.com`,
      heroHeadline: editWebsiteHeadline.trim() || tailoredWorkspaceProfile.business.heroHeadline,
      heroSubheadline: editWebsiteSubheadline.trim() || tailoredWorkspaceProfile.business.heroSubheadline,
      tagline: editWebsiteTagline.trim() || tailoredWorkspaceProfile.business.tagline,
      heroBannerImage: editWebsiteBannerUrl.trim() || tailoredWorkspaceProfile.business.heroBannerImage,
      themeColor: editWebsiteTheme,
      serviceArea: editWebsiteServiceArea.trim() || tailoredWorkspaceProfile.business.serviceArea,
      operatingHours: editWebsiteHours.trim() || tailoredWorkspaceProfile.business.operatingHours,
      phoneDisplay: editWebsitePhone.trim() || tailoredWorkspaceProfile.business.phoneDisplay,
      emailDisplay: editWebsiteEmail.trim() || `hello@${cleanSlug}.conectln.com`,
      licenseNumber: editWebsiteLicense.trim() || tailoredWorkspaceProfile.business.licenseNumber,
      aboutStory: editWebsiteAbout.trim() || tailoredWorkspaceProfile.business.aboutStory,
      missionStatement: editWebsiteMission.trim() || tailoredWorkspaceProfile.business.missionStatement
    }
    setBusinessOverrides(nextOverrides)
    writeWebsiteOverridesToStorage(nextOverrides)

    if (editWebsiteOfferingsDraft.length > 0) {
      const draftById = new Map(editWebsiteOfferingsDraft.map((d) => [d.id, d]))
      persistManagedOfferings((prev) =>
        prev.map((item) => {
          const draft = draftById.get(item.id)
          if (!draft) return item
          const nextTitle = draft.title.trim() || item.title
          const nextPrice = draft.price.trim() || item.price
          return {
            ...item,
            title: nextTitle,
            price: nextPrice,
            billingUnit: draft.billingUnit.trim(),
            turnaround: draft.turnaround.trim(),
            revenueLabel: nextPrice !== item.price ? nextPrice : item.revenueLabel
          }
        })
      )
    }

    setWebsiteSavedSuccess(false)
    setIsEditWebsiteModalOpen(false)
    setPhotoSuccessMsg('✓ Business Website & Product Pricing saved live on your page!')
    setTimeout(() => setPhotoSuccessMsg(null), 4500)
  }

  const handleCopyWebsiteUrl = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(businessWebsite.domainUrl)
      }
      setSiteUrlCopied(true)
      setTimeout(() => setSiteUrlCopied(false), 2600)
    } catch {}
  }

  const handleSelectWebsiteOffering = (offeringTitle: string) => {
    setQuoteSelectedOffering(offeringTitle)
    setQuoteSubmittedReceipt(null)
    if (typeof document !== 'undefined') {
      document.getElementById('business-site-booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleSubmitBusinessQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quoteClientName.trim() || !quoteClientEmail.trim() || isSubmittingQuote) return
    setIsSubmittingQuote(true)
    const refId = `REQ-${Math.floor(10000 + Math.random() * 89999)}`
    const selectedService = quoteSelectedOffering || allWebsiteOfferings[0]?.title || businessWebsite.professionTitle
    const cleanName = quoteClientName.trim()
    const cleanContact = quoteClientEmail.trim()
    const cleanDate = quotePreferredDate || 'Earliest Available Slot'
    const cleanScope = quoteNotes.trim() || `Direct booking & upfront estimate request for ${selectedService}`
    const ownerEmail = (user as any)?.email || 'kwesi.asiedu@expediteconsults.com'

    let emailDispatched = false
    let emailRecipients: string[] = [
      'kasiedu@expedite-consults.com',
      'kasiedu@expediteconsults.com',
      'kwesi.asiedu@expediteconsults.com',
    ]
    let emailMessageId: string | undefined
    let emailError: string | undefined

    try {
      const res = await fetch('/api/connectin/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_quote',
          referenceId: refId,
          businessId: businessWebsite.domainSlug || 'biz_expedite_consults',
          businessName: businessWebsite.businessName,
          ownerName: user.name,
          ownerEmail,
          serviceTitle: selectedService,
          customerName: cleanName,
          customerContact: cleanContact,
          customerEmail: cleanContact,
          customerLocation: businessWebsite.serviceArea,
          projectScope: cleanScope,
          preferredDate: cleanDate,
          estimatedBudget: 'Requesting Itemized Quote',
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (typeof data?.emailDispatched === 'boolean') emailDispatched = data.emailDispatched
        if (Array.isArray(data?.emailRecipients) && data.emailRecipients.length > 0) {
          emailRecipients = data.emailRecipients
        }
        if (data?.emailMessageId) emailMessageId = data.emailMessageId
        if (data?.emailError) emailError = data.emailError
      }
    } catch {
      // Fallback: continue logging locally & to Messaging
    }

    const deskTitle = `${businessWebsite.businessName} Booking Desk`
    const bookingText =
      `📅 Direct Booking & Quote Request (#${refId})\n` +
      `• Client: ${cleanName} (${cleanContact})\n` +
      `• Service: ${selectedService}\n` +
      `• Preferred Date: ${cleanDate}\n` +
      `• Project Scope: ${cleanScope}`
    const autoReplyText =
      `✅ Official Booking Receipt (#${refId}): Thank you, ${cleanName}! ${businessWebsite.businessName} received your request for "${selectedService}" (${cleanDate}) and dispatched email confirmation${emailDispatched ? ` (${emailMessageId || 'Delivered'})` : ''} to ${emailRecipients.join(', ')}. Expected response: ${businessWebsite.responseTime}.`

    recordLocalBilateralDirectMessage({
      senderName: cleanName,
      senderEmail: cleanContact.includes('@') ? cleanContact : 'guest@connectin.app',
      senderAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=0a66c2`,
      senderRole: 'Prospective Client',
      recipientName: deskTitle,
      recipientAvatar: user.avatar,
      recipientSubtitle: `${businessWebsite.businessName} · Official Booking & Quote Desk`,
      subject: `Booking & Quote Request (#${refId}) — ${selectedService}`,
      text: bookingText,
      channelType: 'Companies',
      subType: 'Recruiter',
      initialPartnerReplyText: autoReplyText,
    })

    fetch('/api/connectin/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_thread',
        title: deskTitle,
        recipientName: deskTitle,
        recipientEmail: emailRecipients.join(','),
        subtitle: `${businessWebsite.businessName} · Official Booking & Quote Desk`,
        recipientSubtitle: `${businessWebsite.businessName} · Official Booking & Quote Desk`,
        avatar: user.avatar,
        recipientAvatar: user.avatar,
        channelType: 'Companies',
        text: `${bookingText}\n\n${autoReplyText}`,
        senderName: cleanName,
        senderEmail: cleanContact.includes('@') ? cleanContact : 'guest@connectin.app',
        senderRole: 'Prospective Client',
      }),
    }).catch(() => {})

    trackUserActivity({
      actionType: 'BUSINESS_QUOTE_REQUESTED' as any,
      actionLabel: `Sent Booking & Quote Request (#${refId}): ${selectedService}`,
      category: 'engagement',
      targetId: refId,
      targetTitle: `${businessWebsite.businessName} · ${selectedService}`,
      details: `${cleanName} (${cleanContact}) · Email dispatched=${emailDispatched} to ${emailRecipients.join(', ')}`,
    })

    setQuoteSubmittedReceipt({
      id: refId,
      service: selectedService,
      clientName: cleanName,
      preferredDate: cleanDate,
      contact: cleanContact,
      notes: cleanScope,
      emailDispatched,
      emailRecipients,
      emailMessageId,
      emailError,
    })
    setQuoteNotes("")
    setIsSubmittingQuote(false)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20">
      {/* 0. MEMBER WORKSPACE INSPECTION BANNER (Shown when viewing another member's workspace) */}
      {isViewingOtherMember && (
        <div className="rounded-2xl border-2 border-[#0A66C2]/40 bg-gradient-to-r from-blue-50 via-white to-indigo-50/70 dark:from-blue-950/40 dark:via-zinc-900 dark:to-indigo-950/30 p-3.5 sm:p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-11 w-11 rounded-full object-cover border-2 border-[#0A66C2] shrink-0 shadow-xs"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-full bg-[#0A66C2] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  Viewing Member Workspace
                </span>
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                  {user.name}
                </span>
                {isAdminManagingOtherMember ? (
                  <span className="rounded-full bg-purple-700 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                    🛡️ Admin Manage Mode (Edit &amp; Delete Enabled)
                  </span>
                ) : !canManageWorkspace ? (
                  <span className="rounded-full bg-zinc-200 dark:bg-zinc-800 px-2.5 py-0.5 text-[10px] font-extrabold text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
                    🔒 Read-Only Visitor View
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 truncate mt-0.5">
                {user.headline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {isAdminManagingOtherMember && (
              <button
                type="button"
                onClick={() => {
                  setWorkspaceSection('business')
                  setTimeout(() => handleOpenEditWebsiteModal(), 60)
                }}
                className="rounded-xl bg-purple-700 hover:bg-purple-800 text-white px-3.5 py-2 text-xs font-extrabold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Member Business &amp; Products</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                const endorserViewer = loadStoredUser()
                const voucherName = endorserViewer?.name || 'Kwesi Asiedu'
                const primarySkill =
                  user.profession ||
                  (Array.isArray((user as any).capabilities) && (user as any).capabilities[0]) ||
                  'Verified Professional Craftsmanship'
                recordLiveVouch({
                  targetName: user.name,
                  voucherName,
                  voucherHeadline: endorserViewer?.headline || 'Verified ConnectLn Professional',
                  voucherAvatar: endorserViewer?.avatar,
                  voucherCompany: (endorserViewer as any)?.company || 'ConnectLn Network',
                  voucherRelation: 'Direct Peer & Dossier Vouch',
                  skillOrCredential: String(primarySkill),
                  note: `${voucherName} directly vouched for ${user.name}'s work quality, credentials, and execution in ${primarySkill}.`
                })
                setHasVouchedForMember(true)
              }}
              className={`rounded-xl px-3.5 py-2 text-xs font-extrabold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                hasVouchedForMember
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              <span>{hasVouchedForMember ? `✓ Vouched for ${user.name.split(' ')[0]} (Alert Sent)` : `🤝 Vouch for ${user.name.split(' ')[0]}`}</span>
            </button>
            {onReturnToOwnWorkspace && (
              <button
                type="button"
                onClick={onReturnToOwnWorkspace}
                className="rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 px-3.5 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>👤 My Own Workspace</span>
              </button>
            )}
            {onBackToFeed && (
              <button
                type="button"
                onClick={onBackToFeed}
                className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer"
              >
                ← Back to Network / Feed
              </button>
            )}
          </div>
        </div>
      )}

      {/* 1. TOP WORKSPACE COMMAND BAR */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 text-zinc-950 dark:text-zinc-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full px-3.5 py-1 text-xs sm:text-sm font-bold border flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 text-[#0A66C2] dark:text-sky-300 border-blue-200 dark:border-blue-800">
                <span>{enclaveInfo?.icon || '🛡️'}</span>
                <span>{enclaveInfo?.name || 'ConnectIn Professional Workspace'}</span>
              </span>
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                ✓ Verified Professional
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
              {isViewingOtherMember ? `${user.name}'s Workspace & Identity` : 'My Workspace & Identity'}
            </h1>
            <p className="text-sm sm:text-base font-medium text-zinc-800 dark:text-zinc-200 max-w-2xl leading-relaxed">
              {isViewingOtherMember
                ? `Explore ${user.name}'s verified professional profile, work experience, verified skills, certifications, peer reviews, and Business Website.`
                : 'Manage your professional profile, work experience, verified skills, certifications, peer reviews, and your Business Website & Products.'}
            </p>
          </div>

          {/* Quick Metrics Reflecting User Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-wrap">
            {canManageWorkspace && (
              <div
                onClick={() => setWorkspaceSection('analytics')}
                className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 hover:border-[#0A66C2] p-3.5 text-center min-w-[125px] cursor-pointer transition-all"
                title="Open Profile Analytics"
              >
                <span className="text-xs uppercase font-extrabold tracking-wider text-zinc-700 dark:text-zinc-200">
                  Profile Views
                </span>
                <p className="text-xl sm:text-2xl font-black text-[#0A66C2] dark:text-sky-400">
                  {tailoredAnalytics.effectiveProfileViews.toLocaleString()}
                </p>
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {viewers.length} Direct Viewers
                </span>
              </div>
            )}
            <div
              onClick={() => setWorkspaceSection('profile')}
              className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 p-3.5 text-center min-w-[125px] cursor-pointer transition-all"
            >
              <span className="text-xs uppercase font-extrabold tracking-wider text-zinc-700 dark:text-zinc-200">
                Connections
              </span>
              <p className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400">
                {(user.connectionsCount ?? 0).toLocaleString()}
              </p>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Verified Network
              </span>
            </div>
            <div
              onClick={() => setWorkspaceSection('skills')}
              className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 hover:border-amber-500 p-3.5 text-center min-w-[125px] cursor-pointer transition-all"
              title="View Verified Skills & Endorsements"
            >
              <span className="text-xs uppercase font-extrabold tracking-wider text-zinc-700 dark:text-zinc-200">
                Verified Skills
              </span>
              <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                {(user.skills?.length || enclaveWorkspace.verifiedSkills.length || 6)} ⭐
              </p>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {enclaveInfo?.shortName || 'Domain'} Verified
              </span>
            </div>
          </div>
        </div>

        {/* Workspace Sections Switcher Ribbon */}
        <div className="mt-5 pt-4 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'profile', label: '👤 Profile' },
            ...(canManageWorkspace ? [{ id: 'analytics', label: '📊 Analytics' }] : []),
            { id: 'portfolio', label: '💼 Portfolio' },
            { id: 'skills', label: '🛡️ Skills' },
            { id: 'certifications', label: '📜 Certifications' },
            ...(canManageWorkspace ? [{ id: 'experience', label: '🏛️ Experience' }] : []),
            { id: 'publications', label: '📑 Publications' },
            { id: 'reviews', label: '⭐ Reviews' },
            { id: 'business', label: isViewingOtherMember ? `🌐 ${user.name.split(' ')[0]}'s Business` : '🌐 My Business' }
          ].map((sec) => {
            const isSelected = workspaceSection === sec.id
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setWorkspaceSection(sec.id as any)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-[#0A66C2] text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300/80 dark:border-zinc-700"
                }`}
              >
                <span>{sec.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {photoSuccessMsg && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-400 dark:border-emerald-700 p-3.5 text-emerald-900 dark:text-emerald-100 text-sm font-bold flex items-center justify-between shadow-sm animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{photoSuccessMsg}</span>
          </span>
          <button
            type="button"
            onClick={() => setPhotoSuccessMsg(null)}
            className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 cursor-pointer font-bold px-1.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. PROFILE IDENTITY VIEW */}
      {/* ========================================================================= */}
      {workspaceSection === 'profile' && (
        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            {/* Banner Cover */}
            <div className="relative h-44 w-full bg-gradient-to-r from-[#0A66C2] via-indigo-700 to-purple-800 overflow-hidden group">
              <img
                src={user.coverImage || "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80"}
                alt="Banner"
                className="h-full w-full object-cover opacity-75"
              />
              {/* Button to attach / change cover picture (Owner or Admin only) */}
              {canManageWorkspace && (
                <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoModalTab('cover')
                      setIsPhotoModalOpen(true)
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md border border-white/25 text-xs font-semibold shadow-lg transition-all cursor-pointer"
                    title="Change Cover Banner Photo"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>Change Cover</span>
                  </button>
                </div>
              )}
            </div>

            {/* Profile Avatar, Action Bar & Full-Width Executive Identity Block */}
            <div className="relative px-6 pb-6 pt-3">
              {/* Row 1: Overlapping Avatar on Left + Action Toolbar on Right (never squeezes identity text!) */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="relative group shrink-0 -mt-16 w-fit">
                  <div
                    className={`relative h-28 w-28 sm:h-32 sm:w-32 rounded-2xl bg-white shadow-xl overflow-hidden ${
                      jobBadgeStatus !== 'Booked'
                        ? 'border-4 border-emerald-500 ring-2 ring-white dark:ring-zinc-900'
                        : 'border-4 border-white dark:border-zinc-900'
                    }`}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                    {/* Hover Overlay Button to Change Avatar (Owner or Admin only) */}
                    {canManageWorkspace && (
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoModalTab('avatar')
                          setIsPhotoModalOpen(true)
                        }}
                        className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer backdrop-blur-2xs"
                        title="Attach or change profile photo"
                      >
                        <Camera className="h-6 w-6 mb-1 text-white" />
                        <span className="text-[10px] font-bold">Change Photo</span>
                      </button>
                    )}
                  </div>

                  {/* ConnectLn "Looking for a Job" Avatar Badge Ribbon */}
                  <button
                    type="button"
                    onClick={() => {
                      if (canManageWorkspace) {
                        const order: Array<'Looking for a Job' | 'Looking for Projects' | 'Available for Hire' | 'Booked'> = [
                          'Looking for a Job',
                          'Looking for Projects',
                          'Available for Hire',
                          'Booked'
                        ]
                        const next = order[(order.indexOf(jobBadgeStatus) + 1) % order.length]
                        handleSaveJobCard(next)
                      }
                    }}
                    title={canManageWorkspace ? 'Click to cycle Looking for a Job badge' : undefined}
                    className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider shadow-md border z-10 ${
                      canManageWorkspace ? 'cursor-pointer transition-transform hover:scale-105' : 'cursor-default'
                    } ${
                      jobBadgeStatus === 'Booked'
                        ? 'bg-amber-600 text-white border-amber-300'
                        : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-emerald-200'
                    }`}
                  >
                    {jobBadgeStatus === 'Looking for a Job'
                      ? '💼 Looking for a Job'
                      : jobBadgeStatus === 'Looking for Projects'
                      ? '🔨 Looking for Projects'
                      : jobBadgeStatus === 'Available for Hire'
                      ? '✅ Available for Hire'
                      : '⏳ Booked'}
                  </button>

                  {/* Camera icon badge at top right of avatar (Owner or Admin only) */}
                  {canManageWorkspace && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoModalTab('avatar')
                        setIsPhotoModalOpen(true)
                      }}
                      className="absolute -top-1.5 -right-1.5 h-7 w-7 rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white flex items-center justify-center shadow-md border-2 border-white dark:border-zinc-900 cursor-pointer transition-transform hover:scale-110 z-10"
                      title="Upload or Change Profile Photo"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Primary Profile Action Toolbar */}
                <div className="flex items-center gap-2.5 flex-wrap sm:justify-end pt-2 sm:pt-0">
                  {isViewingOtherMember ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMemberConnected(true)
                          if (onConnectMember) onConnectMember(user.id || user.name)
                          setPhotoSuccessMsg(`✓ Connection request sent to ${user.name}!`)
                          setTimeout(() => setPhotoSuccessMsg(null), 4000)
                        }}
                        className={`rounded-full px-4 py-2.5 text-sm font-extrabold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                          isMemberConnected
                            ? "bg-emerald-600 text-white"
                            : "bg-[#0A66C2] hover:bg-[#004182] text-white"
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{isMemberConnected ? `Invitation Sent ✓` : `+ Connect with ${user.name.split(' ')[0]}`}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onNavigateMessaging && onNavigateMessaging(user)}
                        className="rounded-full bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 hover:bg-sky-100 px-4 py-2.5 text-sm font-extrabold text-[#0A66C2] dark:text-sky-300 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <MessageSquarePlus className="h-4 w-4" />
                        <span>Message {user.name.split(' ')[0]}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setWorkspaceSection('business')}
                        className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Globe className="h-4 w-4" />
                        <span>{user.name.split(' ')[0]}&apos;s Business &amp; Shop</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setWorkspaceSection('portfolio')}
                        className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Briefcase className="h-4 w-4" />
                        <span>Portfolio</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleShareToWhatsApp}
                        className="rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-2.5 text-sm font-extrabold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>Share on WhatsApp</span>
                      </button>

                      {hasAdminAccess && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditName(user.name)
                            setEditHeadline(user.headline)
                            setEditLocation(user.location)
                            setEditAbout(user.about)
                            setEditAvatar(user.avatar)
                            setEditCover(user.coverImage || "")
                            setIsEditProfileOpen(true)
                          }}
                          className="rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-400 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/60 px-4 py-2.5 text-sm font-extrabold text-purple-900 dark:text-purple-200 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Edit3 className="h-4 w-4" />
                          <span>Edit Member Profile</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setWorkspaceSection('business')}
                        className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Globe className="h-4 w-4" />
                        <span>My Business Website &amp; Shop</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditName(user.name)
                          setEditHeadline(user.headline)
                          setEditLocation(user.location)
                          setEditAbout(user.about)
                          setEditAvatar(user.avatar)
                          setEditCover(user.coverImage || "")
                          setIsEditProfileOpen(true)
                        }}
                        className="rounded-full bg-sky-50 dark:bg-sky-950/40 border border-sky-400 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/60 px-4 py-2.5 text-sm font-extrabold text-[#004182] dark:text-sky-300 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>Edit Profile</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsResumeModalOpen(true)}
                        className="rounded-full bg-linear-to-r from-sky-600 to-[#0A66C2] hover:from-sky-500 hover:to-[#004182] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Upload Resume</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleShareToWhatsApp}
                        className="rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-2.5 text-sm font-extrabold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Share profile directly to WhatsApp friends"
                      >
                        <span>WhatsApp Share</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsShareModalOpen(true)}
                        className="rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-4 py-2.5 text-sm font-extrabold border border-zinc-300 dark:border-zinc-700 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Share Profile Link & Channels"
                      >
                        <Share2 className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                        <span>Share</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Row 2: Full-Width Executive Profile Identity Typography & Badges */}
              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950 dark:text-white">
                    {user.name}
                  </h2>

                  <span
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 px-3 py-1 text-xs sm:text-sm font-bold text-[#004182] dark:text-sky-300 border border-blue-300 dark:border-blue-800"
                    title="Cryptographically Verified Identity"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Verified</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      void playHumanVoiceTag({
                        userName: user.name || 'Kwesi Asiedu',
                        userHeadline: user.headline,
                      })
                    }}
                    className="px-3 py-1 rounded-full bg-zinc-100 hover:bg-blue-50 dark:bg-zinc-800 dark:hover:bg-blue-950/60 border border-zinc-300 dark:border-zinc-700 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer transition-all hover:scale-105"
                    title={`VOICE-TAG (Human Voice) — Hear ${user.name}'s name pronunciation`}
                  >
                    <span>🔊</span>
                    <span>Voice Tag</span>
                  </button>

                  {canManageWorkspace && (
                    <button
                      type="button"
                      disabled={isRecordingProfileVoiceTag}
                      onClick={async () => {
                        setIsRecordingProfileVoiceTag(true)
                        await recordRealHumanVoiceTag(user.name || 'Kwesi Asiedu', 4000)
                        setIsRecordingProfileVoiceTag(false)
                      }}
                      className={`px-3 py-1 rounded-full border flex items-center justify-center text-xs sm:text-sm font-bold cursor-pointer transition-all ${
                        isRecordingProfileVoiceTag
                          ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                          : 'bg-zinc-100 hover:bg-emerald-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-emerald-800 dark:text-emerald-300'
                      }`}
                      title={
                        isRecordingProfileVoiceTag
                          ? 'Recording your real human voice (4s)...'
                          : 'Record your own real human voice (4s)'
                      }
                    >
                      {isRecordingProfileVoiceTag ? '⏺️ Rec...' : '🎙️ Record'}
                    </button>
                  )}

                  <span
                    onClick={() => canManageWorkspace && setIsEditingJobCard(!isEditingJobCard)}
                    className={`rounded-full px-3.5 py-1 text-xs sm:text-sm font-extrabold border inline-flex items-center gap-1.5 shadow-2xs ${
                      canManageWorkspace ? 'cursor-pointer' : ''
                    } ${
                      jobBadgeStatus === 'Booked'
                        ? 'bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500'
                    }`}
                    title="ConnectLn Opportunity Status Badge"
                  >
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    <span>{jobBadgeStatus}</span>
                  </span>
                </div>

                <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 max-w-4xl leading-snug">
                  {user.headline}
                </p>

                <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
                  <span className={`rounded-full px-3.5 py-1.5 text-sm font-bold border inline-flex items-center gap-1.5 ${enclaveInfo?.badgeBg || 'bg-blue-50 text-[#004182] border-blue-300 dark:bg-blue-950 dark:text-blue-200'}`}>
                    <span>{enclaveInfo?.icon || '🛡️'}</span>
                    <span>{resolvedDisplayProfession}</span>
                  </span>
                  <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
                    {enclaveInfo?.securityClearanceTier || 'Level 2 Verified'}
                  </span>
                  <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-3.5 py-1.5 text-sm font-bold text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>{user.location}</span>
                  </span>
                  <span className="rounded-full bg-sky-50 dark:bg-sky-950/50 px-3.5 py-1.5 text-sm font-extrabold text-[#004182] dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                    {(user.connectionsCount ?? 0).toLocaleString()} Connections
                  </span>
                </div>
              </div>

              {/* Row 3: Embedded Business Website & Products Storefront Spotlight Card */}
              <div className="mt-5 rounded-2xl border-2 border-zinc-300/80 dark:border-zinc-700 bg-gradient-to-r from-slate-50 via-white to-blue-50/60 dark:from-zinc-900 dark:via-zinc-900 dark:to-blue-950/30 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      <Globe className="h-3.5 w-3.5" />
                      <span>Official Business Website &amp; Shop</span>
                    </span>
                    <span className="text-xs sm:text-sm font-mono font-bold text-zinc-700 dark:text-zinc-300 truncate">
                      {businessWebsite.domainUrl}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white">
                    {businessWebsite.businessName}
                  </h3>
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {allWebsiteOfferings.slice(0, 3).map((off) => (
                      <span
                        key={off.id}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 shadow-2xs"
                      >
                        <span>{off.icon}</span>
                        <span>{off.title}</span>
                        <span className="font-black text-emerald-700 dark:text-emerald-400">· {off.price}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {canManageWorkspace && (
                    <button
                      type="button"
                      onClick={() => {
                        setWorkspaceSection('business')
                        setTimeout(() => handleOpenEditWebsiteModal(), 60)
                      }}
                      className="rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-sm font-extrabold text-zinc-900 dark:text-zinc-100 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit Page &amp; Products</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setWorkspaceSection('business')}
                    className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] px-5 py-2.5 text-sm font-extrabold text-white shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Visit Business Website &amp; Products →</span>
                  </button>
                </div>
              </div>

              {/* CONNECTLN "LOOKING FOR A JOB" SHOWCASE CARD (Replaces LinkedIn's generic Open to Work box) */}
              <div className="mt-5 rounded-2xl border-2 border-emerald-500/70 dark:border-emerald-700/70 bg-gradient-to-r from-emerald-50 via-teal-50/70 to-sky-50/70 dark:from-emerald-950/40 dark:via-zinc-900 dark:to-teal-950/30 p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 px-3.5 py-1 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white shadow-xs">
                        <Briefcase className="h-4 w-4" />
                        <span>{jobBadgeStatus}</span>
                      </span>
                      <span className="rounded-full bg-white dark:bg-zinc-800 px-3 py-1 text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        ✓ Verified ConnectLn Job &amp; Project Seeker Card
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      <div className="rounded-xl bg-white dark:bg-zinc-900/90 border border-emerald-300 dark:border-emerald-800/70 p-3.5">
                        <p className="text-xs font-mono font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                          Target Roles &amp; Specialties
                        </p>
                        <p className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white mt-1 leading-snug">
                          {jobCardRoles}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white dark:bg-zinc-900/90 border border-emerald-300 dark:border-emerald-800/70 p-3.5">
                        <p className="text-xs font-mono font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                          Opportunity Types
                        </p>
                        <p className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white mt-1 leading-snug">
                          {jobCardWorkTypes}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white dark:bg-zinc-900/90 border border-emerald-300 dark:border-emerald-800/70 p-3.5">
                        <p className="text-xs font-mono font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                          Location &amp; Availability
                        </p>
                        <p className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white mt-1 leading-snug">
                          {jobCardLocations} · {jobCardStartTiming}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                    {canManageWorkspace && (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsEditingJobCard(!isEditingJobCard)}
                          className="rounded-xl bg-white dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-zinc-700 text-emerald-900 dark:text-emerald-200 border border-emerald-400 dark:border-emerald-700 px-4 py-2.5 text-sm font-extrabold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                          <span>{isEditingJobCard ? 'Close Editor' : 'Customize Job Card'}</span>
                        </button>
                        {!isViewingOtherMember && (
                          <button
                            type="button"
                            onClick={() => onNavigateJobs && onNavigateJobs(resolvedDisplayProfession || '')}
                            className="rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 text-sm font-extrabold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <span>Browse Matching Jobs →</span>
                          </button>
                        )}
                      </>
                    )}
                    {isViewingOtherMember && (
                      <button
                        type="button"
                        onClick={() => onNavigateMessaging && onNavigateMessaging(user)}
                        className="rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 text-sm font-extrabold shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquarePlus className="h-4 w-4" />
                        <span>Invite {user.name.split(' ')[0]} to Apply</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Editor for "Looking for a Job" Badge & Card */}
                {isEditingJobCard && canManageWorkspace && (
                  <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                    <div>
                      <label className="block text-xs font-extrabold text-zinc-800 dark:text-zinc-200 mb-1">
                        Badge Status
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {(['Looking for a Job', 'Looking for Projects', 'Available for Hire', 'Booked'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setJobBadgeStatus(st)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold border cursor-pointer transition-all ${
                              jobBadgeStatus === st
                                ? 'bg-emerald-700 text-white border-emerald-700'
                                : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-zinc-800 dark:text-zinc-200 mb-1">
                        Target Roles &amp; Specialties
                      </label>
                      <input
                        type="text"
                        value={jobCardRoles}
                        onChange={(e) => setJobCardRoles(e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-950 dark:text-zinc-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-zinc-800 dark:text-zinc-200 mb-1">
                        Opportunity Types (Employment / Contract / Advisory)
                      </label>
                      <input
                        type="text"
                        value={jobCardWorkTypes}
                        onChange={(e) => setJobCardWorkTypes(e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-950 dark:text-zinc-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-zinc-800 dark:text-zinc-200 mb-1">
                        Preferred Locations &amp; Start Availability
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={jobCardLocations}
                          onChange={(e) => setJobCardLocations(e.target.value)}
                          placeholder="Locations"
                          className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-950 dark:text-zinc-100"
                        />
                        <input
                          type="text"
                          value={jobCardStartTiming}
                          onChange={(e) => setJobCardStartTiming(e.target.value)}
                          placeholder="Start timing"
                          className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-950 dark:text-zinc-100"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsEditingJobCard(false)}
                        className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveJobCard()}
                        className="rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Save &quot;Looking for a Job&quot; Card
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bio & Statement */}
              <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <h3 className="font-black text-lg sm:text-xl text-zinc-950 dark:text-white">
                  About &amp; Professional Focus
                </h3>
                <p className="text-base sm:text-[17px] font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed max-w-4xl whitespace-pre-line">
                  {user.about}
                </p>
              </div>

              {/* PROFESSIONAL REPUTATION INDEX & 5-LEVEL VERIFICATION HIERARCHY */}
              <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="rounded-2xl border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 sm:p-6 text-zinc-950 dark:text-white shadow-md space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs uppercase font-mono text-[#004182] dark:text-sky-300 font-extrabold">
                        ⚡ Evidence-Based Credibility Index
                      </span>
                      <h4 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white flex items-center gap-2">
                        <span>Professional Reputation Index</span>
                        <span className="text-emerald-700 dark:text-emerald-300 font-mono text-xl sm:text-2xl font-black">94 / 100</span>
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm font-mono">
                      <span className="rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 font-bold">Skills: <strong>96</strong></span>
                      <span className="rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 font-bold">Credentials: <strong>98</strong></span>
                      <span className="rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 font-bold">Projects: <strong>95</strong></span>
                      <span className="rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 font-bold">Experience: <strong>92</strong></span>
                      <span className="rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 font-bold">Reviews: <strong>91</strong></span>
                      <span className="rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 font-bold">Community: <strong>89</strong></span>
                    </div>
                  </div>

                  {/* 5-Level Verification Progression */}
                  <div className="pt-2.5 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                    <span className="text-xs uppercase font-mono text-zinc-800 dark:text-zinc-200 font-extrabold">
                      5-Level Verification Progression:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono font-bold">
                      <div className="rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-200 p-2 border border-emerald-400 dark:border-emerald-700">1. Self-Reported ✓</div>
                      <div className="rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-200 p-2 border border-emerald-400 dark:border-emerald-700">2. Assessment ✓</div>
                      <div className="rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-200 p-2 border border-emerald-400 dark:border-emerald-700">3. Credentialed ✓</div>
                      <div className="rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-200 p-2 border border-emerald-400 dark:border-emerald-700">4. Employer ✓</div>
                      <div className="rounded-lg bg-purple-100 dark:bg-purple-950/70 text-purple-950 dark:text-purple-200 font-extrabold p-2 border border-purple-400 dark:border-purple-700">5. Fellow Verified ★</div>
                    </div>
                  </div>
                </div>

                {/* ANALYTICS & IDENTITY RADAR STRIP (Owner or Admin only) */}
                {canManageWorkspace && (
                <div className="rounded-2xl border border-zinc-300/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 p-5 space-y-3.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-[#0A66C2]" />
                      <h4 className="font-extrabold text-base text-zinc-950 dark:text-white">
                        Live Analytics &amp; Identity Radar
                      </h4>
                    </div>
                    <button
                      onClick={() => setWorkspaceSection('analytics')}
                      className="text-sm font-extrabold text-[#004182] dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Full Analytics Dashboard</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div
                      onClick={() => onOpenAnalytics ? onOpenAnalytics('viewers') : (setWorkspaceSection('analytics'), setAnalyticsSubTab('viewers'))}
                      className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-zinc-800/90 p-4 space-y-1.5 hover:border-[#0A66C2] hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-sm text-zinc-800 dark:text-zinc-200">
                        <span className="font-bold group-hover:text-[#0A66C2]">Profile Viewers</span>
                        <Eye className="h-4 w-4 text-[#0A66C2]" />
                      </div>
                      <p className="text-2xl font-black text-zinc-950 dark:text-white">
                        {tailoredAnalytics.effectiveProfileViews.toLocaleString()}
                      </p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                        {tailoredAnalytics.effectiveProfileViews > 0 ? `✓ ${tailoredAnalytics.effectiveProfileViews} Live Viewer(s)` : "0 Live Viewers"}
                      </p>
                    </div>

                    <div
                      onClick={() => onOpenAnalytics ? onOpenAnalytics('reach') : (setWorkspaceSection('analytics'), setAnalyticsSubTab('reach'))}
                      className="rounded-xl border border-purple-200 dark:border-purple-900/60 bg-white dark:bg-zinc-800/90 p-4 space-y-1.5 hover:border-purple-500 hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-sm text-zinc-800 dark:text-zinc-200">
                        <span className="font-bold group-hover:text-purple-600">Content Reach</span>
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                      </div>
                      <p className="text-2xl font-black text-zinc-950 dark:text-white">
                        {tailoredAnalytics.effectiveTotalReach.toLocaleString()}
                      </p>
                      <p className="text-xs text-purple-700 dark:text-purple-400 font-bold">
                        {tailoredAnalytics.effectiveTotalReach > 0 ? `✓ ${tailoredAnalytics.effectiveTotalReach} Live Content & Module Event(s)` : "0 Content & Module Reach"}
                      </p>
                    </div>

                    <div
                      onClick={() => onOpenAnalytics ? onOpenAnalytics('discoveries') : (setWorkspaceSection('analytics'), setAnalyticsSubTab('discoveries'))}
                      className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-zinc-800/90 p-4 space-y-1.5 hover:border-emerald-500 hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-sm text-zinc-800 dark:text-zinc-200">
                        <span className="font-bold group-hover:text-emerald-600">Directory Discoveries</span>
                        <Search className="h-4 w-4 text-emerald-600" />
                      </div>
                      <p className="text-2xl font-black text-zinc-950 dark:text-white">
                        {tailoredAnalytics.effectiveDiscoveries.toLocaleString()}
                      </p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                        {tailoredAnalytics.effectiveDiscoveries > 0 ? `✓ ${tailoredAnalytics.effectiveDiscoveries} Live Directory Match(es)` : "0 Directory Discoveries"}
                      </p>
                    </div>
                  </div>
                </div>
                )}
              </div>
            </div>
          </div>

          {/* UPLOADED RESUME & WORK EXPERIENCE SECTION DIRECTLY ON PROFILE (Owner or Admin only) */}
          {canManageWorkspace && (
          <div
            id="profile-uploaded-resume-section"
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5"
          >
            {resumeSuccessBanner && (
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 p-4 text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{resumeSuccessBanner}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setResumeSuccessBanner(null)}
                  className="text-emerald-600 hover:text-emerald-800 p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Header & Uploaded Resume Status Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Briefcase className="h-5 w-5 text-[#0A66C2]" />
                  <h3 className="font-black text-lg sm:text-xl text-zinc-950 dark:text-white">
                    Uploaded Resume &amp; Work Experience ({user.experience?.length || 0})
                  </h3>
                  {(user as any).uploadedResume?.fileName && (
                    <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-3 py-1 text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{(user as any).uploadedResume.fileName}</span>
                      {(user as any).uploadedResume.uploadedAt && (
                        <span className="text-xs font-medium opacity-80">· Synced {(user as any).uploadedResume.uploadedAt}</span>
                      )}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Your extracted resume positions, accomplishments, and verified skills applied directly to your Profile.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsResumeModalOpen(true)}
                  className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-4 py-2 text-sm font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>{(user as any).uploadedResume?.fileName ? "Update Resume" : "Upload Resume"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingExperience(null)
                    setIsExpFormModalOpen(true)
                  }}
                  className="rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-4 py-2 text-sm font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Position</span>
                </button>
              </div>
            </div>

            {user.experience && user.experience.length > 0 ? (
              <div className="space-y-4">
                {user.experience.map((exp, i) => (
                  <div
                    key={exp.id || i}
                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-5 space-y-2.5 relative group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-base sm:text-lg text-zinc-950 dark:text-white">
                            {exp.role}
                          </h4>
                          {exp.duration?.includes('Present') && (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                              Current Role
                            </span>
                          )}
                        </div>
                        <p className="text-sm sm:text-base font-bold text-[#004182] dark:text-sky-400">
                          {exp.company}
                        </p>
                        <p className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          {exp.duration} · {exp.location}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExperience({
                              id: exp.id || 'exp_' + i,
                              role: exp.role,
                              company: exp.company,
                              employmentType: exp.employmentType || 'Full-time',
                              duration: exp.duration,
                              location: exp.location,
                              description: exp.description,
                              skills: exp.skills || []
                            })
                            setIsExpFormModalOpen(true)
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          title="Edit position"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExperience(exp.id)}
                          className="p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-950/50 text-zinc-500 hover:text-red-600 cursor-pointer"
                          title="Delete position"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line">
                      {exp.description}
                    </p>

                    {exp.skills && exp.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {exp.skills.map((sk: string) => (
                          <span
                            key={sk}
                            className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-1 text-xs font-bold text-zinc-900 dark:text-zinc-200"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-6 text-center space-y-3">
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                  No work experience uploaded yet. Upload your resume to automatically build your profile experience and skills.
                </p>
                <button
                  type="button"
                  onClick={() => setIsResumeModalOpen(true)}
                  className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-5 py-2 text-xs font-bold shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span>Upload Resume (Auto-Build)</span>
                </button>
              </div>
            )}
          </div>
          )}

          {/* Reconciled Trade Dispatch, Expiration Desk & Hall Invites for Trades Enclave (Owner or Admin only) */}
          {canManageWorkspace && effectiveEnclaveId === 'trades_construction' && (
            <div className="pt-2">
              <TradeEnclaveWidgets
                user={user}
                onNavigateTab={(tab) => {
                  if (tab === 'wallet' || tab === 'certifications') {
                    setWorkspaceSection('certifications')
                  }
                }}
                variant="profile"
              />
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📊 ANALYTICS, GRAPHS, TRENDS & USER INTELLIGENCE SUB-SECTION (Owner only) */}
      {/* ========================================================================= */}
      {workspaceSection === 'analytics' && canManageWorkspace && (() => {
        const tfMultiplier =
          analyticsTimeframe === '7d'
            ? 1
            : analyticsTimeframe === '30d'
            ? 4.2
            : analyticsTimeframe === '90d'
            ? 11.8
            : 44.5

        const tfLabel =
          analyticsTimeframe === '7d'
            ? 'Last 7 Days'
            : analyticsTimeframe === '30d'
            ? 'Last 30 Days'
            : analyticsTimeframe === '90d'
            ? 'Last 90 Days'
            : 'Last 12 Months'

        const scaledProfileViews = tailoredAnalytics.effectiveProfileViews
        const scaledTotalReach = tailoredAnalytics.effectiveTotalReach
        const scaledUniqueViewers = tailoredAnalytics.effectiveUniqueViewers
        const scaledDiscoveries = tailoredAnalytics.effectiveDiscoveries

        const userTopSkillNames = (Array.isArray(user.skills) && user.skills.length > 0
          ? user.skills.map((s: any) => (typeof s === 'string' ? s : s?.name)).filter(Boolean)
          : enclaveWorkspace.verifiedSkills.map((vs) => vs.name)
        ).slice(0, 4)

        // Daily trend series scaled by timeframe
        const trendSeries = reachData.dailyTrends.map((d, idx) => {
          const factor = analyticsTimeframe === '7d' ? 1 : analyticsTimeframe === '30d' ? 3.8 : analyticsTimeframe === '90d' ? 10.5 : 38
          const reachVal = Math.round(d.reach * factor)
          const uniqueVal = Math.round(d.uniqueViewers * factor)
          const profileViewsVal = Math.round((d.uniqueViewers * 0.24 + (idx % 2 === 0 ? 45 : 28)) * factor)
          return {
            day: d.day,
            reach: reachVal,
            uniqueViewers: uniqueVal,
            profileViews: profileViewsVal
          }
        })

        const maxReachVal = Math.max(...trendSeries.map((t) => t.reach), 1)
        const activeDayData =
          trendSeries.find((t) => t.day === selectedTrendDay) ||
          trendSeries[2] ||
          trendSeries[0]

        // SVG Polyline coordinates (viewBox 0 0 700 210)
        const chartWidth = 640
        const chartHeight = 155
        const chartLeft = 35
        const chartTop = 20

        const reachPoints = trendSeries.map((item, i) => {
          const x = chartLeft + (i / Math.max(1, trendSeries.length - 1)) * chartWidth
          const y = chartTop + chartHeight - (item.reach / maxReachVal) * chartHeight
          return { x, y, ...item }
        })

        const uniquePoints = trendSeries.map((item, i) => {
          const x = chartLeft + (i / Math.max(1, trendSeries.length - 1)) * chartWidth
          const y = chartTop + chartHeight - (item.uniqueViewers / maxReachVal) * chartHeight
          return { x, y, ...item }
        })

        const profileViewPoints = trendSeries.map((item, i) => {
          const x = chartLeft + (i / Math.max(1, trendSeries.length - 1)) * chartWidth
          const y = chartTop + chartHeight - ((item.profileViews * 2.2) / maxReachVal) * chartHeight
          return { x, y, ...item }
        })

        const reachPolyline = reachPoints.map((p) => `${p.x},${p.y}`).join(' ')
        const reachAreaPath = `M ${reachPoints[0].x},${chartTop + chartHeight} L ${reachPoints.map((p) => `${p.x},${p.y}`).join(' L ')} L ${reachPoints[reachPoints.length - 1].x},${chartTop + chartHeight} Z`
        const uniquePolyline = uniquePoints.map((p) => `${p.x},${p.y}`).join(' ')
        const profilePolyline = profileViewPoints.map((p) => `${p.x},${p.y}`).join(' ')

        // Filtered viewers based on persona category
        const filteredViewersList =
          viewerCategoryFilter === 'all'
            ? viewers
            : viewers.filter((v) => v.category === viewerCategoryFilter)

        // Persona distribution breakdown
        const personaDistribution = [
          {
            id: 'executive' as const,
            label: `Executives & ${enclaveInfo?.shortName || 'Domain'} Directors`,
            percent: 38,
            count: Math.max(2, viewers.filter((v) => v.category === 'executive').length),
            color: 'bg-[#0A66C2]',
            badgeColor: 'text-[#0A66C2] dark:text-sky-400',
            intent: `Executive Leadership & ${user.profession || enclaveInfo?.shortName || 'Domain'} Advisory`
          },
          {
            id: 'buyer' as const,
            label: 'Enterprise Procurement & Contract Buyers',
            percent: 27,
            count: Math.max(1, viewers.filter((v) => v.category === 'buyer').length),
            color: 'bg-emerald-600',
            badgeColor: 'text-emerald-600 dark:text-emerald-400',
            intent: 'Vendor Roster & Contract Evaluation'
          },
          {
            id: 'recruiter' as const,
            label: `Principal ${enclaveInfo?.shortName || 'Technical'} Recruiters`,
            percent: 21,
            count: Math.max(1, viewers.filter((v) => v.category === 'recruiter').length),
            color: 'bg-purple-600',
            badgeColor: 'text-purple-600 dark:text-purple-400',
            intent: `Direct ${user.profession || 'Specialist'} Hiring`
          },
          {
            id: 'peer' as const,
            label: 'Verified Fellows & Senior Peers',
            percent: 14,
            count: Math.max(2, viewers.filter((v) => v.category === 'peer').length),
            color: 'bg-amber-500',
            badgeColor: 'text-amber-600 dark:text-amber-400',
            intent: 'Skill Endorsements & Peer Collaboration'
          }
        ]

        // Inbound discovery channel breakdown
        const inboundVectors = [
          { channel: `${enclaveInfo?.shortName || 'Enterprise'} Talent Directory Search`, percent: 36, trend: '+28%', color: 'bg-[#0A66C2]' },
          { channel: 'Contract, Bid & Partner Roster Desk', percent: 26, trend: '+19%', color: 'bg-emerald-600' },
          { channel: 'Feed Broadcasts & Case Study Publications', percent: 22, trend: '+34%', color: 'bg-purple-600' },
          { channel: `Gated ${enclaveInfo?.shortName || 'Professional'} Enclave & Passport Links`, percent: 16, trend: '+15%', color: 'bg-amber-500' }
        ]

        return (
          <div className="space-y-6">
            {/* Top Intelligence Header Banner Reflecting Active User Profile */}
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-5 sm:p-6 text-white shadow-xl space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-sky-500/20 px-3 py-0.5 text-xs font-bold text-sky-300 border border-sky-400/30 flex items-center gap-1.5 w-fit">
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                      ConnectIn Intelligence Radar · {tfLabel}
                    </span>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-400/30">
                      {enclaveInfo?.icon || '🛡️'} {enclaveInfo?.name || 'Verified Enclave'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {user.name}&apos;s Profile Views, Content Reach &amp; Intelligence Analytics
                  </h2>
                  <p className="text-xs text-slate-200 max-w-2xl leading-relaxed opacity-90">
                    Real-time telemetry tailored to <strong className="text-white">{user.name}</strong> ({user.headline || user.profession || 'Verified Specialist'}) — tracking exact member inspections, search queries matching your verified skills, and organization reach.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Timeframe Switcher */}
                  <div className="flex items-center gap-1 bg-black/40 p-1.5 rounded-xl border border-white/15 text-xs font-bold">
                    {(['7d', '30d', '90d', '1y'] as const).map((tf) => (
                      <button
                        key={tf}
                        type="button"
                        onClick={() => setAnalyticsTimeframe(tf)}
                        className={`px-2.5 py-1.5 rounded-lg transition-all uppercase cursor-pointer ${
                          analyticsTimeframe === tf
                            ? "bg-sky-500 text-white shadow-xs"
                            : "text-slate-300 hover:text-white"
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>

                  {/* Sub-Tab Switcher */}
                  <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/15 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setAnalyticsSubTab('viewers')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        analyticsSubTab === 'viewers' ? "bg-white text-zinc-900 shadow-xs" : "text-slate-200 hover:text-white"
                      }`}
                    >
                      <Eye className="h-3.5 w-3.5 text-[#0A66C2]" />
                      <span>Viewers ({viewers.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnalyticsSubTab('reach')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        analyticsSubTab === 'reach' ? "bg-white text-zinc-900 shadow-xs" : "text-slate-200 hover:text-white"
                      }`}
                    >
                      <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                      <span>Reach</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnalyticsSubTab('discoveries')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        analyticsSubTab === 'discoveries' ? "bg-white text-zinc-900 shadow-xs" : "text-slate-200 hover:text-white"
                      }`}
                    >
                      <Search className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Discoveries</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* User Profile Identity & Verified Skills Strip inside Analytics */}
              <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-12 w-12 rounded-full object-cover border-2 border-sky-400 shrink-0 shadow-sm"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm text-white truncate">{user.name}</span>
                      <span className="rounded-full bg-sky-500/30 border border-sky-300/40 px-2 py-0.5 text-[10px] font-bold text-sky-200">
                        {user.profession || enclaveInfo?.shortName || 'Verified Member'}
                      </span>
                      <span className="text-[11px] text-slate-300 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-sky-400" />
                        {user.location?.split('·')[0]?.trim() || 'United States'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 truncate mt-0.5">{user.headline}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-sky-300 mr-1">
                    Indexed Skills:
                  </span>
                  {userTopSkillNames.map((sk) => (
                    <span
                      key={sk}
                      className="rounded-full bg-black/35 border border-white/15 px-2.5 py-0.5 text-[10px] font-semibold text-white"
                    >
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 4 Executive KPI Cards with Mini Sparkline Trend Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => setAnalyticsSubTab('viewers')}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs hover:border-[#0A66C2] transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-bold">Profile Inspections</span>
                  <Eye className="h-4 w-4 text-[#0A66C2]" />
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                    {scaledProfileViews.toLocaleString()}
                  </p>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                    ↑ +14.8%
                  </span>
                </div>
                <div className="flex items-end gap-1 h-7 pt-1">
                  {[42, 58, 86, 74, 68, 92, 100].map((v, i) => (
                    <div
                      key={i}
                      style={{ height: `${v}%` }}
                      className="flex-1 rounded-t bg-[#0A66C2]/80 dark:bg-sky-500/80"
                    />
                  ))}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {viewers.length} Direct Verified Viewers · {tfLabel}
                </p>
              </div>

              <div
                onClick={() => setAnalyticsSubTab('reach')}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs hover:border-purple-500 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-bold">Content Reach &amp; Syndication</span>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                    {scaledTotalReach.toLocaleString()}
                  </p>
                  <span className="rounded-full bg-purple-100 dark:bg-purple-950/70 px-2 py-0.5 text-[10px] font-black text-purple-700 dark:text-purple-300">
                    ↑ +{reachData.weeklyChangePercent}%
                  </span>
                </div>
                <div className="flex items-end gap-1 h-7 pt-1">
                  {[50, 68, 100, 84, 74, 48, 62].map((v, i) => (
                    <div
                      key={i}
                      style={{ height: `${v}%` }}
                      className="flex-1 rounded-t bg-purple-600/80 dark:bg-purple-500/80"
                    />
                  ))}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {scaledUniqueViewers.toLocaleString()} Unique Readers · {reachData.engagementRate}% Eng. Rate
                </p>
              </div>

              <div
                onClick={() => setAnalyticsSubTab('discoveries')}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs hover:border-emerald-500 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-bold">Search Query Discoveries</span>
                  <Search className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                    {scaledDiscoveries.toLocaleString()}
                  </p>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                    ↑ +{discoveryData.weeklyChangePercent}%
                  </span>
                </div>
                <div className="flex items-end gap-1 h-7 pt-1">
                  {[38, 52, 69, 85, 78, 91, 100].map((v, i) => (
                    <div
                      key={i}
                      style={{ height: `${v}%` }}
                      className="flex-1 rounded-t bg-emerald-600/80 dark:bg-emerald-500/80"
                    />
                  ))}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate" title={discoveryData.topSearchKeywords[0]?.keyword}>
                  Top Query: &ldquo;{discoveryData.topSearchKeywords[0]?.keyword}&rdquo;
                </p>
              </div>

              <div
                onClick={() => setWorkspaceSection('skills')}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs hover:border-amber-500 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-bold">Decision-Maker Ratio</span>
                  <BarChart3 className="h-4 w-4 text-amber-500" />
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                    {tailoredAnalytics.decisionMakerRatio}
                  </p>
                  <span className="rounded-full bg-amber-100 dark:bg-amber-950/70 px-2 py-0.5 text-[10px] font-black text-amber-800 dark:text-amber-300">
                    {tailoredAnalytics.standingBadge}
                  </span>
                </div>
                <div className="flex items-end gap-1 h-7 pt-1">
                  {[60, 65, 72, 80, 85, 92, 96].map((v, i) => (
                    <div
                      key={i}
                      style={{ height: `${v}%` }}
                      className="flex-1 rounded-t bg-amber-500/85"
                    />
                  ))}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {(user.connectionsCount ?? 0).toLocaleString()} Verified Connections
                </p>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* 📈 INTERACTIVE MULTI-METRIC TREND GRAPH & COMPARATIVE BAR CHART       */}
            {/* ===================================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left 7 Cols: SVG Multi-Series Area & Line Trend Graph */}
              <div className="lg:col-span-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-[#0A66C2]" />
                      <span>Multi-Vector Trajectory Graph ({tfLabel})</span>
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Tracks Content Reach, Unique Verified Viewers, and Direct Profile Inspections over time.
                    </p>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-3 text-[11px] font-bold shrink-0 flex-wrap">
                    <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                      <span className="h-2.5 w-2.5 rounded-full bg-purple-600 inline-block" />
                      Reach
                    </span>
                    <span className="flex items-center gap-1.5 text-[#0A66C2] dark:text-sky-400">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#0A66C2] inline-block" />
                      Unique Users
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
                      Profile Views
                    </span>
                  </div>
                </div>

                {/* SVG Line & Area Chart */}
                <div className="w-full overflow-x-auto">
                  <svg
                    viewBox="0 0 700 205"
                    className="w-full h-48 sm:h-52 select-none"
                    role="img"
                    aria-label="Profile views and reach trend chart"
                  >
                    <defs>
                      <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#9333ea" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#9333ea" stopOpacity="0.02" />
                      </linearGradient>
                      <linearGradient id="uniqueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0A66C2" stopOpacity="0.24" />
                        <stop offset="100%" stopColor="#0A66C2" stopOpacity="0.01" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((step, idx) => {
                      const y = chartTop + step * chartHeight
                      const val = Math.round(maxReachVal * (1 - step))
                      return (
                        <g key={idx}>
                          <line
                            x1={chartLeft}
                            y1={y}
                            x2={chartLeft + chartWidth}
                            y2={y}
                            stroke="currentColor"
                            className="text-zinc-200 dark:text-zinc-800"
                            strokeDasharray="4 4"
                            strokeWidth="1"
                          />
                          <text
                            x={chartLeft - 6}
                            y={y + 3}
                            textAnchor="end"
                            className="fill-zinc-400 text-[9px] font-mono"
                          >
                            {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                          </text>
                        </g>
                      )
                    })}

                    {/* Area Under Reach Curve */}
                    <path d={reachAreaPath} fill="url(#reachGrad)" />

                    {/* Lines */}
                    <polyline
                      fill="none"
                      stroke="#9333ea"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={reachPolyline}
                    />
                    <polyline
                      fill="none"
                      stroke="#0A66C2"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={uniquePolyline}
                    />
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.2"
                      strokeDasharray="5 3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={profilePolyline}
                    />

                    {/* Interactive Data Points */}
                    {reachPoints.map((pt, idx) => {
                      const uPt = uniquePoints[idx]
                      const pPt = profileViewPoints[idx]
                      const isSelected = activeDayData.day === pt.day
                      return (
                        <g
                          key={pt.day}
                          onClick={() => setSelectedTrendDay(pt.day)}
                          className="cursor-pointer"
                        >
                          {isSelected && (
                            <line
                              x1={pt.x}
                              y1={chartTop}
                              x2={pt.x}
                              y2={chartTop + chartHeight}
                              stroke="#0A66C2"
                              strokeWidth="1.5"
                              strokeDasharray="3 3"
                            />
                          )}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isSelected ? 6 : 4}
                            className="fill-purple-600 stroke-white dark:stroke-zinc-900"
                            strokeWidth="2"
                          />
                          <circle
                            cx={uPt.x}
                            cy={uPt.y}
                            r={isSelected ? 5.5 : 3.5}
                            className="fill-[#0A66C2] stroke-white dark:stroke-zinc-900"
                            strokeWidth="2"
                          />
                          <circle
                            cx={pPt.x}
                            cy={pPt.y}
                            r={isSelected ? 5 : 3}
                            className="fill-emerald-500 stroke-white dark:stroke-zinc-900"
                            strokeWidth="1.5"
                          />
                          <text
                            x={pt.x}
                            y={chartTop + chartHeight + 18}
                            textAnchor="middle"
                            className={`text-[10px] font-mono ${
                              isSelected
                                ? "fill-[#0A66C2] dark:fill-sky-400 font-black"
                                : "fill-zinc-500 dark:fill-zinc-400 font-semibold"
                            }`}
                          >
                            {pt.day}
                          </text>
                        </g>
                      )
                    })}
                  </svg>
                </div>

                {/* Selected Point Telemetry Bar */}
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-3 border border-zinc-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[#0A66C2] text-white px-2 py-0.5 text-[10px] font-black uppercase">
                      {activeDayData.day} Snapshot
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                      (Click any node on the graph to inspect)
                    </span>
                  </div>
                  <div className="flex items-center gap-4 font-mono text-xs font-bold">
                    <span className="text-purple-600 dark:text-purple-400">
                      Reach: {activeDayData.reach.toLocaleString()}
                    </span>
                    <span className="text-[#0A66C2] dark:text-sky-400">
                      Unique Users: {activeDayData.uniqueViewers.toLocaleString()}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Profile Views: {activeDayData.profileViews.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right 5 Cols: Comparative Daily Bar Chart & Peak Velocity Analysis */}
              <div className="lg:col-span-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                    <span>Daily Cohort Volume Comparison</span>
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Side-by-side comparison of Total Impressions vs. Unique Verified Professionals.
                  </p>
                </div>

                {/* Interactive Vertical Grouped Bars */}
                <div className="grid grid-cols-7 gap-2 items-end h-44 pt-4 px-1 border-b border-zinc-200 dark:border-zinc-800">
                  {trendSeries.map((item) => {
                    const reachHeight = Math.max(12, Math.round((item.reach / maxReachVal) * 100))
                    const uniqueHeight = Math.max(10, Math.round((item.uniqueViewers / maxReachVal) * 100))
                    const isSelected = activeDayData.day === item.day
                    return (
                      <div
                        key={item.day}
                        onClick={() => setSelectedTrendDay(item.day)}
                        className="flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
                      >
                        <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white">
                          {item.reach >= 1000 ? `${(item.reach / 1000).toFixed(1)}k` : item.reach}
                        </span>
                        <div className="w-full flex items-end justify-center gap-1 h-32">
                          <div
                            style={{ height: `${reachHeight}%` }}
                            className={`w-2.5 sm:w-3 rounded-t transition-all ${
                              isSelected
                                ? "bg-purple-600 shadow-sm"
                                : "bg-purple-500/75 group-hover:bg-purple-600"
                            }`}
                            title={`Reach: ${item.reach.toLocaleString()}`}
                          />
                          <div
                            style={{ height: `${uniqueHeight}%` }}
                            className={`w-2.5 sm:w-3 rounded-t transition-all ${
                              isSelected
                                ? "bg-[#0A66C2] shadow-sm"
                                : "bg-[#0A66C2]/75 group-hover:bg-[#0A66C2]"
                            }`}
                            title={`Unique Users: ${item.uniqueViewers.toLocaleString()}`}
                          />
                        </div>
                        <span
                          className={`text-[10px] font-mono pb-1 ${
                            isSelected
                              ? "font-black text-[#0A66C2] dark:text-sky-400"
                              : "font-semibold text-zinc-500 dark:text-zinc-400"
                          }`}
                        >
                          {item.day}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-900/50 p-3 text-xs space-y-1">
                  <p className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    <span>Peak Traffic Window: Wednesday &amp; Thursday (9:00 AM – 2:00 PM)</span>
                  </p>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    {tailoredAnalytics.peakTrafficNote}
                  </p>
                </div>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* 🧠 3-COLUMN USER DEMOGRAPHICS, PERSONA & ENTERPRISE ANALYSIS CHARTS   */}
            {/* ===================================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Analysis Chart 1: Viewer Persona & Decision-Maker Segmentation */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-[#0A66C2]" />
                      <span>User Persona Segmentation</span>
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Role &amp; seniority analysis of users inspecting you
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 text-[10px] font-bold text-[#0A66C2] dark:text-sky-300">
                    100% Verified IDs
                  </span>
                </div>

                {/* Stacked Horizontal Distribution Bar */}
                <div className="h-3.5 w-full rounded-full overflow-hidden flex gap-0.5 bg-zinc-100 dark:bg-zinc-800 p-0.5">
                  {personaDistribution.map((seg) => (
                    <div
                      key={seg.id}
                      style={{ width: `${seg.percent}%` }}
                      className={`${seg.color} h-full first:rounded-l-full last:rounded-r-full transition-all`}
                      title={`${seg.label}: ${seg.percent}%`}
                    />
                  ))}
                </div>

                {/* Persona Breakdown Rows */}
                <div className="space-y-3 pt-1">
                  {personaDistribution.map((seg) => {
                    const isSelected = viewerCategoryFilter === seg.id
                    return (
                      <div
                        key={seg.id}
                        onClick={() => {
                          setViewerCategoryFilter(isSelected ? 'all' : seg.id)
                          setAnalyticsSubTab('viewers')
                        }}
                        className={`rounded-xl p-2.5 border transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#0A66C2] bg-blue-50/40 dark:bg-sky-950/30"
                            : "border-zinc-100 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                            <span className={`h-2.5 w-2.5 rounded-full ${seg.color}`} />
                            {seg.label}
                          </span>
                          <span className={`font-mono ${seg.badgeColor}`}>{seg.percent}%</span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <div
                            style={{ width: `${seg.percent}%` }}
                            className={`h-full rounded-full ${seg.color}`}
                          />
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 flex items-center justify-between">
                          <span>Primary Intent: {seg.intent}</span>
                          <span className="font-semibold text-[#0A66C2] dark:text-sky-400">
                            {isSelected ? "Filtered ✓" : "Filter →"}
                          </span>
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Analysis Chart 2: Top Organizations Inspecting Your Credentials */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-purple-600" />
                      <span>Top Inspecting Enterprises</span>
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Organizations with the highest viewer concentration
                    </p>
                  </div>
                  <span className="rounded-full bg-purple-50 dark:bg-purple-950 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                    {enclaveInfo?.shortName || 'Domain'} Sectors
                  </span>
                </div>

                <div className="space-y-3">
                  {reachData.topCompanies.map((comp) => (
                    <div key={comp.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 truncate">
                          <span>{comp.logo}</span>
                          <span className="truncate">{comp.name}</span>
                        </span>
                        <span className="font-mono font-bold text-purple-600 dark:text-purple-400 shrink-0">
                          {comp.percentage}% ({comp.count.toLocaleString()})
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, comp.percentage * 3.2)}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                  <span>Enterprise Domain Verification</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">✓ 100% Corporate SSO</span>
                </div>
              </div>

              {/* Analysis Chart 3: Inbound Discovery Channels & Credential Tier Breakdown */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4">
                <div>
                  <h4 className="font-black text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Discovery Vectors &amp; Credential Tiers</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    How users discover your profile &amp; their verification tier
                  </p>
                </div>

                {/* Discovery Vectors */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Inbound Attribution Channels
                  </span>
                  {inboundVectors.map((vec) => (
                    <div key={vec.channel} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                          {vec.channel}
                        </span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                          {vec.percent}% ({vec.trend})
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          style={{ width: `${vec.percent * 2.4}%` }}
                          className={`h-full rounded-full ${vec.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Viewer Credential & Trust Tier Distribution */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Inspecting User Credential &amp; Trust Tiers
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/50 p-2">
                      <p className="text-sm font-black text-[#0A66C2] dark:text-sky-400">
                        {tailoredAnalytics.credentialTiers[0]?.percent ?? 56}%
                      </p>
                      <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 block truncate">
                        {tailoredAnalytics.credentialTiers[0]?.label || 'Verified ID'}
                      </span>
                    </div>
                    <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/50 p-2">
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {tailoredAnalytics.credentialTiers[1]?.percent ?? 29}%
                      </p>
                      <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 block truncate">
                        {tailoredAnalytics.credentialTiers[1]?.label || 'Buyer / Lead'}
                      </span>
                    </div>
                    <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/50 p-2">
                      <p className="text-sm font-black text-amber-600 dark:text-amber-400">
                        {tailoredAnalytics.credentialTiers[2]?.percent ?? 15}%
                      </p>
                      <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 block truncate">
                        {tailoredAnalytics.credentialTiers[2]?.label || 'Fellow Grade'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* SUB-TAB 1: VIEWERS (WITH PERSONA FILTER & USER INTENT SCORE)          */}
            {/* ===================================================================== */}
            {analyticsSubTab === 'viewers' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Eye className="h-4 w-4 text-[#0A66C2]" />
                      <span>Verified Profile Viewers ({filteredViewersList.length})</span>
                    </h3>

                    {/* Persona Filter Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap pl-1">
                      {([
                        { id: 'all', label: `All (${viewers.length})` },
                        { id: 'executive', label: 'Executives' },
                        { id: 'buyer', label: 'Enterprise Buyers' },
                        { id: 'recruiter', label: 'Recruiters' },
                        { id: 'peer', label: 'Peers' }
                      ] as const).map((pill) => (
                        <button
                          key={pill.id}
                          type="button"
                          onClick={() => setViewerCategoryFilter(pill.id)}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                            viewerCategoryFilter === pill.id
                              ? "bg-[#0A66C2] text-white shadow-2xs"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          }`}
                        >
                          {pill.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenAnalytics && onOpenAnalytics('viewers')}
                    className="text-xs font-bold text-[#0A66C2] dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Full Radar Modal</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-3">
                  {filteredViewersList.map((viewer, idx) => {
                    const alignmentScore = 98 - idx * 2
                    return (
                      <div
                        key={viewer.id}
                        className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#0A66C2] transition-all"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img src={viewer.avatar} alt={viewer.name} className="h-12 w-12 rounded-2xl object-cover shrink-0" />
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{viewer.name}</h4>
                              <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2 py-0.2 text-[10px] font-bold text-[#0A66C2] dark:text-sky-300">
                                {viewer.clearanceLevel}
                              </span>
                              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.2 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                                {alignmentScore}% Skill Match Intent
                              </span>
                            </div>
                            <p className="text-xs text-zinc-500 truncate">{viewer.headline}</p>
                            <p className="text-[11px] text-zinc-400">
                              {viewer.company} · Viewed via: <strong>{viewer.viewVector}</strong> · 🗓️ <strong>{formatProfileViewDateTime(viewer.createdAtIso, viewer.viewedAt)}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => onNavigateMessaging && onNavigateMessaging(viewer.name)}
                            className="rounded-full border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            Message
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleViewerConnect(viewer.id)}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                              viewer.isConnected
                                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
                                : viewer.isPending
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-[#0A66C2] text-white hover:bg-[#004182]"
                            }`}
                          >
                            {viewer.isConnected ? "Connected" : viewer.isPending ? "Pending" : "Connect"}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* SUB-TAB 2: CONTENT REACH & AUDIENCE ROLE ANALYSIS                     */}
            {/* ===================================================================== */}
            {analyticsSubTab === 'reach' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Audience Job Roles Breakdown Chart */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
                  <h3 className="font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span>Reader Job Titles &amp; Functional Roles</span>
                  </h3>
                  <div className="space-y-3">
                    {reachData.topJobRoles.map((jr) => (
                      <div key={jr.role} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">{jr.role}</span>
                          <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                            {jr.percentage}%
                          </span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <div
                            style={{ width: `${jr.percentage * 2.5}%` }}
                            className="h-full rounded-full bg-purple-600"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Performing Posts & Whitepapers */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
                  <h3 className="font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span>Top Performing Publications &amp; Broadcasts</span>
                  </h3>
                  <div className="space-y-3">
                    {reachData.topPosts.map((post) => (
                      <div
                        key={post.id}
                        className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-3 space-y-1.5 bg-zinc-50/50 dark:bg-zinc-800/40"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded bg-purple-100 dark:bg-purple-950 px-2 py-0.5 text-[10px] font-bold text-purple-800 dark:text-purple-300">
                            {post.category}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">{post.date}</span>
                        </div>
                        <p className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                          {post.title}
                        </p>
                        <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 pt-0.5">
                          <span>Reach: <strong className="text-purple-600 dark:text-purple-400">{post.reach.toLocaleString()}</strong></span>
                          <span>Engagements: <strong className="text-emerald-600 dark:text-emerald-400">{post.engagements}</strong></span>
                          <span>Reposts: <strong>{post.reposts}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* SUB-TAB 3: DIRECTORY DISCOVERIES & KEYWORD VELOCITY CHARTS            */}
            {/* ===================================================================== */}
            {analyticsSubTab === 'discoveries' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
                  <h3 className="font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Search className="h-4 w-4 text-emerald-600" />
                    <span>Exact Keywords Surfacing Your Credentials</span>
                  </h3>
                  <div className="space-y-3">
                    {discoveryData.topSearchKeywords.map((kw, i) => (
                      <div key={kw.keyword} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                            {i + 1}. &ldquo;{kw.keyword}&rdquo;
                          </span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {kw.occurrences} hits ({kw.growth})
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <div
                            style={{ width: `${Math.min(100, Math.round((kw.occurrences / 120) * 100))}%` }}
                            className="h-full rounded-full bg-emerald-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
                  <h3 className="font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-[#0A66C2]" />
                    <span>Organizations Running Talent &amp; RFP Queries</span>
                  </h3>
                  <div className="space-y-3">
                    {discoveryData.searchingCompanies.map((sc) => (
                      <div key={sc.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                            <span>{sc.logo}</span>
                            <span>{sc.name}</span>
                          </span>
                          <span className="font-mono font-bold text-[#0A66C2] dark:text-sky-400">
                            {sc.percentage}% ({sc.searchesCount} queries)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <div
                            style={{ width: `${Math.min(100, sc.percentage * 3)}%` }}
                            className="h-full rounded-full bg-[#0A66C2]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* ========================================================================= */}
      {/* 2. PORTFOLIO (COMPLETED PROJECTS) */}
      {/* ========================================================================= */}
      {workspaceSection === 'portfolio' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-indigo-600" />
              <span>{enclaveInfo?.name || 'Completed'} Portfolio &amp; Projects ({enclaveWorkspace.portfolio.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {enclaveWorkspace.portfolio.map((proj) => (
              <div
                key={proj.id}
                className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-xs hover:border-indigo-500 hover:shadow-lg transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 w-full overflow-hidden bg-slate-950">
                    <img src={proj.coverImage} alt="" className="h-full w-full object-cover opacity-80" />
                    <div className="absolute top-3 left-3 rounded-full bg-black/75 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white border border-white/20">
                      {proj.category}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>{proj.clientOrOrg}</span>
                      <span className="font-mono">{proj.completionDate}</span>
                    </div>

                    <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 leading-snug">
                      {proj.title}
                    </h4>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {proj.summary}
                    </p>

                    <div className="rounded-xl bg-indigo-50/50 p-2.5 text-xs text-indigo-900 dark:bg-indigo-950/20 dark:text-indigo-300 font-semibold border border-indigo-100 dark:border-indigo-900">
                      ⚡ Key Result: {proj.metrics}
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.techStack.map((tech) => (
                        <span key={tech} className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-mono text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VERIFIED SKILL PASSPORT, EVIDENCE GRAPH & SKILL-QUALIFIED JOBS         */}
      {/* ========================================================================= */}
      {workspaceSection === 'skills' && (() => {
        const activeSkillsList = (user.skills && user.skills.length > 0)
          ? user.skills.map((s: any) => {
              const sName = typeof s === 'string' ? s : s.name
              const baseEndorsements = typeof s === 'object' ? (s.endorsements ?? s.endorsementsCount ?? 0) : 0
              return {
                name: sName,
                category: (enclaveInfo?.shortName || 'Trades') as any,
                endorsementsCount: baseEndorsements,
                isVerified: true,
                verifiedBy: `${enclaveInfo?.name || 'ConnectIn'} Master Board`,
                proficiencyLevel: 'Expert (Top 1%)' as const
              }
            })
          : enclaveWorkspace.verifiedSkills.map((vs) => ({
              ...vs,
              endorsementsCount: skillEndorsementBonuses[vs.name] || 0
            }))

        const verifiedSkillNames = activeSkillsList.map((s) => s.name)
        const allQualifiedJobs = getQualifiedJobsForSkills(
          verifiedSkillNames,
          enclaveInfo?.shortName || 'Cyber & Cloud'
        )

        const filteredQualifiedJobs = allQualifiedJobs.filter((job) => {
          const matchesSkill =
            selectedSkillJobFilter === 'all' ||
            job.matchedUserSkills.some(
              (ms) => ms.toLowerCase() === selectedSkillJobFilter.toLowerCase()
            )
          const matchesWorkplace =
            workplaceJobFilter === 'all' ||
            job.workplaceType === workplaceJobFilter ||
            job.employmentType === workplaceJobFilter
          return matchesSkill && matchesWorkplace
        })

        return (
          <div className="space-y-6">
            {/* Top Skill Passport Overview Card */}
            <div className="rounded-2xl border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 text-zinc-950 dark:text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-blue-100 dark:bg-indigo-950/70 px-3 py-1 text-xs font-extrabold text-zinc-950 dark:text-indigo-200 border border-blue-300 dark:border-indigo-700 flex items-center gap-1.5 w-fit">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#0A66C2] dark:text-sky-400" />
                    ConnectIn Verified Skill Passport · {enclaveInfo?.shortName || 'Trades'}
                  </span>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-3 py-1 text-xs font-extrabold text-emerald-950 dark:text-emerald-200 border border-emerald-400 dark:border-emerald-700 flex items-center gap-1.5 w-fit">
                    <Briefcase className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                    {allQualifiedJobs.length} Pre-Qualified Roles Unlocked
                  </span>
                </div>
                <h2 className="text-2xl font-black text-zinc-950 dark:text-white">
                  Multi-Factor Verified Competency Graph
                </h2>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200 max-w-xl leading-relaxed">
                  Evidence-based verification combining proctored scenario exams, live trade/clinical diagnostic assessments, and peer superintendent attestations. Your verified graph automatically unlocks fast-track roles below.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-800 p-4 border border-zinc-300 dark:border-zinc-700 text-center min-w-[165px] space-y-1">
                  <span className="text-xs uppercase font-mono font-bold text-zinc-800 dark:text-zinc-300">Passport Score</span>
                  <p className="text-3xl font-black text-[#004182] dark:text-sky-400">95.4%</p>
                  <span className="text-xs text-emerald-800 dark:text-emerald-400 font-extrabold block">Top 1% Fellow Grade</span>
                </div>
              </div>
            </div>

            {/* Verified Skill Capabilities & Multi-Factor Evidence */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    <span>Verified Skill Capabilities &amp; Multi-Factor Evidence</span>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {isViewingOtherMember
                      ? `Verified capabilities and multi-factor competency evidence for ${user.name}.`
                      : "Click any verified skill below to filter the jobs you directly qualify for based on your competency evidence."}
                  </p>
                </div>

                {canManageWorkspace && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowAddSkillInput(!showAddSkillInput)}
                      className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Verified Skill</span>
                    </button>
                  </div>
                )}
              </div>

              {showAddSkillInput && canManageWorkspace && (
                <form
                  onSubmit={handleAddVerifiedSkill}
                  className="rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/40 dark:bg-indigo-950/30 p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                >
                  <input
                    type="text"
                    value={newVerifiedSkillName}
                    onChange={(e) => setNewVerifiedSkillName(e.target.value)}
                    placeholder="Enter a skill to verify & match jobs (e.g., Kubernetes, Cloud IAM, Splunk, Threat Hunting)..."
                    className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#0A66C2]"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Verify &amp; Match Jobs
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddSkillInput(false)}
                      className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSkillsList.map((skill) => {
                  const matchingJobsCount = allQualifiedJobs.filter((j) =>
                    j.matchedUserSkills.some((m) => m.toLowerCase() === skill.name.toLowerCase())
                  ).length
                  const isSelectedFilter =
                    selectedSkillJobFilter.toLowerCase() === skill.name.toLowerCase()

                  return (
                    <div
                      key={skill.name}
                      className={`rounded-2xl border p-4 transition-all space-y-3 ${
                        isSelectedFilter
                          ? "border-[#0A66C2] bg-blue-50/40 dark:border-sky-500 dark:bg-sky-950/25 shadow-sm"
                          : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-indigo-300 dark:hover:border-indigo-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                              {skill.name}
                            </h4>
                            <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Verified ✓
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500">
                            Validated by: <strong>{skill.verifiedBy}</strong>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleEndorseSkill(skill.name)}
                          className="rounded-lg bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 px-2.5 py-1 text-[11px] font-bold text-zinc-800 dark:text-zinc-100 hover:bg-[#0A66C2] hover:text-white transition-all shadow-xs shrink-0 cursor-pointer"
                        >
                          + Endorse ({skill.endorsementsCount})
                        </button>
                      </div>

                      {/* 4-Factor Evidence Breakdown */}
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
                        <span className="text-emerald-600 dark:text-emerald-400">✓ Hands-On Exam: 98/100</span>
                        <span className="text-sky-600 dark:text-sky-400">✓ Diagnostic Labs</span>
                        <span className="text-purple-600 dark:text-purple-400">✓ Work Portfolio</span>
                        <span className="text-amber-600 dark:text-amber-400">✓ Peer Supervised</span>
                      </div>

                      {/* Direct Skill-to-Jobs Qualification Footer (Owner or Admin only) */}
                      {canManageWorkspace && (
                        <div className="flex items-center justify-between pt-0.5">
                          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5" />
                            <span>Qualifies you for <strong>{matchingJobsCount}</strong> open roles</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSkillJobFilter(
                                isSelectedFilter ? 'all' : skill.name
                              )
                              if (typeof window !== 'undefined') {
                                const el = document.getElementById('skill-qualified-jobs-section')
                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                              }
                            }}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                              isSelectedFilter
                                ? "bg-[#0A66C2] text-white"
                                : "text-[#0A66C2] dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                            }`}
                          >
                            <span>{isSelectedFilter ? "Showing Matches ✓" : "Filter Jobs by Skill →"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ===================================================================== */}
            {/* 💼 JOBS YOU QUALIFY FOR BASED ON YOUR VERIFIED SKILLS (Owner or Admin) */}
            {/* ===================================================================== */}
            {canManageWorkspace && (
            <div
              id="skill-qualified-jobs-section"
              className="rounded-2xl border border-emerald-500/30 bg-white dark:bg-zinc-900 p-6 shadow-md space-y-5"
            >
              {/* Header & Summary */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-3 py-0.5 text-[11px] font-black text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      Pre-Qualified via 95.4% Skill Passport
                    </span>
                    <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 text-[11px] font-bold text-[#0A66C2] dark:text-sky-300 border border-blue-200 dark:border-blue-900">
                      ⚡ Skip Technical Screen Eligible
                    </span>
                  </div>
                  <h3 className="font-black text-lg sm:text-xl text-zinc-900 dark:text-zinc-100 flex items-center gap-2 pt-1">
                    <Briefcase className="h-5 w-5 text-[#0A66C2]" />
                    <span>Jobs You Qualify For Based on Your Verified Skills ({filteredQualifiedJobs.length})</span>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
                    Matched directly against your verified skills ({verifiedSkillNames.join(", ")}) and 4-factor competency evidence (98/100 Hands-On Exam, Diagnostic Labs, Work Portfolio, and Peer Supervision).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {onNavigateJobs && (
                    <button
                      type="button"
                      onClick={() =>
                        onNavigateJobs(
                          selectedSkillJobFilter !== 'all'
                            ? selectedSkillJobFilter
                            : verifiedSkillNames[0] || ''
                        )
                      }
                      className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white px-4 py-2.5 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Explore All in Jobs Hub</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Instant Passport Application Confirmation Banner */}
              {lastAppliedJobToast && (
                <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200">
                        Verified Skill Passport Sent to {lastAppliedJobToast.company}!
                      </p>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300">
                        You applied for <strong>{lastAppliedJobToast.title}</strong> with your <strong>95.4% Multi-Factor Competency Graph</strong> ({lastAppliedJobToast.matchedUserSkills.join(', ')}). Hiring Manager: <strong>{lastAppliedJobToast.hiringManagerName}</strong> ({lastAppliedJobToast.hiringManagerTitle}).
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {onNavigateMessaging && (
                      <button
                        type="button"
                        onClick={() => onNavigateMessaging(lastAppliedJobToast.hiringManagerName)}
                        className="rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Message Hiring Manager
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setLastAppliedJobToast(null)}
                      className="text-emerald-700 dark:text-emerald-300 hover:underline text-xs font-bold px-2 py-1 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* Interactive Skill & Workplace Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mr-1">
                    Filter by Verified Skill:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSkillJobFilter('all')}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                      selectedSkillJobFilter === 'all'
                        ? "bg-[#0A66C2] text-white shadow-2xs"
                        : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-[#0A66C2]"
                    }`}
                  >
                    All Qualified ({allQualifiedJobs.length})
                  </button>
                  {verifiedSkillNames.map((skName) => {
                    const isSelected = selectedSkillJobFilter.toLowerCase() === skName.toLowerCase()
                    return (
                      <button
                        key={skName}
                        type="button"
                        onClick={() => setSelectedSkillJobFilter(isSelected ? 'all' : skName)}
                        className={`rounded-full px-3 py-1 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? "bg-emerald-600 text-white shadow-2xs"
                            : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500"
                        }`}
                      >
                        <span className="text-emerald-500 dark:text-emerald-400">{isSelected ? "✓" : "⚡"}</span>
                        <span>{skName}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Workplace / Mode Filter */}
                <div className="flex items-center gap-1 shrink-0">
                  {(['all', 'Remote', 'Hybrid', 'Fractional Executive'] as const).map((wp) => (
                    <button
                      key={wp}
                      type="button"
                      onClick={() => setWorkplaceJobFilter(wp)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                        workplaceJobFilter === wp
                          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                          : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                      }`}
                    >
                      {wp === 'all' ? 'All Modes' : wp === 'Fractional Executive' ? 'Fractional' : wp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Qualified Jobs Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredQualifiedJobs.map((job) => {
                  const isApplied = appliedSkillJobIds.includes(job.id)
                  const isSaved = savedSkillJobIds.includes(job.id)

                  return (
                    <div
                      key={job.id}
                      className={`rounded-2xl border p-5 transition-all flex flex-col justify-between gap-4 ${
                        isApplied
                          ? "border-emerald-400 bg-emerald-50/20 dark:border-emerald-700 dark:bg-emerald-950/15"
                          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 hover:border-[#0A66C2] dark:hover:border-sky-500 hover:shadow-md"
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Top Match & Tier Ribbon */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/90 px-3 py-0.5 text-xs font-black text-emerald-800 dark:text-emerald-300 border border-emerald-300/70 dark:border-emerald-700 flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            {job.matchScore}% Verified Skill Match
                          </span>
                          <span className="text-[11px] font-mono font-semibold text-zinc-400">
                            {job.postedAgo}
                          </span>
                        </div>

                        {/* Title & Company */}
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xl border border-slate-700 shadow-xs">
                            {job.companyBadge}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <h4 className="font-black text-base text-zinc-900 dark:text-zinc-100 leading-snug">
                              {job.title}
                            </h4>
                            <p className="text-xs font-bold text-[#0A66C2] dark:text-sky-400 flex items-center gap-1.5 flex-wrap">
                              <span>{job.company}</span>
                              {job.companyVerified && (
                                <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 text-[10px] font-bold text-[#0A66C2] dark:text-sky-300">
                                  Verified Partner ✓
                                </span>
                              )}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap text-[11px] text-zinc-500 dark:text-zinc-400 pt-0.5">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-zinc-400" />
                                {job.location}
                              </span>
                              <span>·</span>
                              <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.2 font-semibold text-zinc-700 dark:text-zinc-300">
                                {job.workplaceType}
                              </span>
                              <span>·</span>
                              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                {job.employmentType}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Compensation & Fast-Track Banner */}
                        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/70 p-3 border border-zinc-200/80 dark:border-zinc-700/70 space-y-1.5">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {job.salaryRange}
                            </span>
                            <span className="rounded-md bg-indigo-100/80 dark:bg-indigo-950/80 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:text-indigo-300">
                              {job.clearanceOrTier}
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                            {job.fastTrackPerk}
                          </p>
                        </div>

                        {/* Matched Verified Skills from User's Competency Graph */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                            Your Qualifying Verified Skills ({job.matchedUserSkills.length} Matched):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {job.matchedUserSkills.map((mSkill) => (
                              <span
                                key={mSkill}
                                onClick={() => setSelectedSkillJobFilter(mSkill)}
                                className="rounded-lg bg-emerald-100/90 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1 cursor-pointer hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors"
                              >
                                <span>✓ {mSkill}</span>
                                <span className="text-[9px] font-mono opacity-75">(98/100)</span>
                              </span>
                            ))}
                            {job.additionalSkills.map((addSkill) => (
                              <span
                                key={addSkill}
                                className="rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-400"
                              >
                                + {addSkill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Evidence Qualification Explanation */}
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed bg-blue-50/50 dark:bg-blue-950/20 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
                          🛡️ <strong>Why You Qualify:</strong> {job.evidenceQualificationNote}
                        </p>
                      </div>

                      {/* Action Footer */}
                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleApplySkillJob(job)}
                            className={`rounded-xl px-4 py-2 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                              isApplied
                                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                : "bg-[#0A66C2] hover:bg-[#004182] text-white"
                            }`}
                          >
                            {isApplied ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Applied with Skill Passport ✓</span>
                              </>
                            ) : (
                              <>
                                <Zap className="h-3.5 w-3.5 text-amber-300" />
                                <span>1-Click Apply with Passport</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setInspectingSkillJob(job)}
                            className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
                          >
                            Role Spec
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleSaveSkillJob(job.id)}
                            className={`rounded-xl border px-2.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                              isSaved
                                ? "border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
                            }`}
                            title="Save Qualified Role"
                          >
                            {isSaved ? "★ Saved" : "☆ Save"}
                          </button>

                          <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-2 text-zinc-500 hover:text-[#0A66C2] dark:hover:text-sky-400 transition-colors"
                            title="Open External Employer Career Portal"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Role Spec Modal when inspecting a specific qualified job */}
              {inspectingSkillJob && (
                <Dialog open={!!inspectingSkillJob} onOpenChange={(open) => !open && setInspectingSkillJob(null)}>
                  <DialogContent className="sm:max-w-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-lg font-black text-zinc-900 dark:text-zinc-100">
                        <span>{inspectingSkillJob.companyBadge}</span>
                        <span>{inspectingSkillJob.title}</span>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-3 py-0.5 text-xs font-black text-emerald-800 dark:text-emerald-300">
                          {inspectingSkillJob.matchScore}% Verified Skill Match
                        </span>
                        <span className="font-bold text-[#0A66C2] dark:text-sky-400">
                          {inspectingSkillJob.company}
                        </span>
                        <span>·</span>
                        <span>{inspectingSkillJob.location}</span>
                      </div>

                      <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3.5 border border-zinc-200 dark:border-zinc-700 space-y-1">
                        <p className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                          Compensation: {inspectingSkillJob.salaryRange}
                        </p>
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                          {inspectingSkillJob.fastTrackPerk}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Hiring Lead: <strong>{inspectingSkillJob.hiringManagerName}</strong> ({inspectingSkillJob.hiringManagerTitle})
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <h5 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs uppercase tracking-wider">
                          Role Overview &amp; Technical Mandate
                        </h5>
                        <p className="leading-relaxed">{inspectingSkillJob.description}</p>
                      </div>

                      <div className="space-y-1.5">
                        <h5 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs uppercase tracking-wider">
                          Matched Competency Graph Evidence
                        </h5>
                        <p className="text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl text-emerald-900 dark:text-emerald-200">
                          {inspectingSkillJob.evidenceQualificationNote}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {inspectingSkillJob.matchedUserSkills.map((sk) => (
                            <span
                              key={sk}
                              className="rounded-lg bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300"
                            >
                              ✓ {sk} (Verified 98/100)
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                        <a
                          href={inspectingSkillJob.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5"
                        >
                          <span>External Portal</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            if (!appliedSkillJobIds.includes(inspectingSkillJob.id)) {
                              handleToggleApplySkillJob(inspectingSkillJob)
                            }
                            setInspectingSkillJob(null)
                          }}
                          className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white px-5 py-2 text-xs font-black cursor-pointer"
                        >
                          {appliedSkillJobIds.includes(inspectingSkillJob.id)
                            ? "Already Applied with Passport ✓"
                            : "⚡ Submit 95.4% Skill Passport Now"}
                        </button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            )}
          </div>
        )
      })()}

      {/* ========================================================================= */}
      {/* 4. CERTIFICATIONS */}
      {/* ========================================================================= */}
      {workspaceSection === 'certifications' && (
        <div className="space-y-5">
          {/* Reconciled Trade Tickets & License Expiration Desk (Owner or Admin only) */}
          {canManageWorkspace && effectiveEnclaveId === 'trades_construction' && (
            <TradeEnclaveWidgets
              user={user}
              onNavigateTab={() => setWorkspaceSection('certifications')}
              variant="tickets_only"
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {((user.certifications && user.certifications.length > 0)
              ? user.certifications.map((cert) => ({
                  name: cert.title,
                  issuingBody: cert.issuer,
                  badgeIcon: '📜',
                  issueDate: cert.issueDate,
                  credentialId: cert.credentialId,
                  verificationUrl: cert.credentialUrl,
                  isVerifiedBadge: true
                }))
              : enclaveWorkspace.certifications
            ).map((cert) => (
              <div
                key={cert.credentialId}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex items-start gap-4"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-2xl border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 shrink-0">
                  {cert.badgeIcon || '📜'}
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                    {cert.name}
                  </h4>
                  <p className="text-xs text-zinc-500 font-semibold">{cert.issuingBody}</p>
                  <p className="text-[11px] text-zinc-400">{cert.issueDate}</p>
                  <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                    Credential ID: {cert.credentialId} · Verified Badge ✓
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. EXPERIENCE (Owner or Admin only) */}
      {/* ========================================================================= */}
      {workspaceSection === 'experience' && canManageWorkspace && (
        <div id="workspace-experience-section" className="space-y-4">
          {/* Header Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>{t("experience_header", "Work Experience")}</span>
                {user.experience && user.experience.length > 0 && (
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-[#0A66C2] dark:text-sky-300">
                    {user.experience.length}
                  </span>
                )}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t("experience_subheader", "Verified career history, operational responsibilities, and enclave accomplishments.")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsResumeModalOpen(true)}
                className="rounded-full bg-linear-to-r from-sky-600 to-[#0A66C2] hover:from-sky-500 hover:to-[#004182] text-white px-4 py-2 text-xs font-bold shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Upload Resume</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingExperience(null)
                  setIsExpFormModalOpen(true)
                }}
                className="rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 px-3.5 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Position</span>
              </button>
            </div>
          </div>

          {/* Reconciled Hall Invites & Peer Vouches (Trades Enclave) */}
          {effectiveEnclaveId === 'trades_construction' && (
            <div className="pt-1">
              <TradeEnclaveWidgets
                user={user}
                onNavigateTab={() => setWorkspaceSection('experience')}
                variant="invites_only"
              />
            </div>
          )}

          {/* Success Banner */}
          {resumeSuccessBanner && (
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{resumeSuccessBanner}</span>
              </div>
              <button
                type="button"
                onClick={() => setResumeSuccessBanner(null)}
                className="text-emerald-600 hover:text-emerald-800 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {user.experience && user.experience.length > 0 ? (
            <div className="space-y-4">
              {user.experience.map((exp, i) => (
                <div
                  key={exp.id || i}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3 relative group transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                          {exp.role}
                        </h4>
                        {exp.duration?.includes('Present') && (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40">
                            Present Role
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-[#0A66C2]">{exp.company}</p>
                      <p className="text-xs text-zinc-400">{exp.duration} · {exp.location}</p>
                    </div>

                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingExperience({
                            id: exp.id || 'exp_' + i,
                            role: exp.role,
                            company: exp.company,
                            employmentType: exp.employmentType || 'Full-time',
                            duration: exp.duration,
                            location: exp.location,
                            description: exp.description,
                            skills: exp.skills || []
                          })
                          setIsExpFormModalOpen(true)
                        }}
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                        title="Edit position"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-red-50 dark:hover:bg-red-950/50 text-zinc-400 hover:text-red-500 cursor-pointer transition-colors"
                        title="Delete position"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {exp.description}
                  </p>

                  {exp.skills && exp.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {exp.skills.map((sk: string) => (
                        <span key={sk} className="rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-linear-to-b from-zinc-50/80 to-blue-50/30 dark:from-zinc-900/60 dark:to-blue-950/20 p-8 sm:p-12 text-center space-y-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white dark:bg-zinc-800 shadow-md border border-zinc-200 dark:border-zinc-700 text-[#0A66C2]">
                <FileText className="h-8 w-8 text-[#0A66C2]" />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
                  Build Your Experience from Your Resume
                </h4>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Upload your resume in PDF, Word, or text format. Our parser extracts your career history, companies, dates, achievements, and verified skills into your profile experience.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResumeModalOpen(true)}
                  className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-6 py-2.5 text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>Upload Resume (Auto-Build)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingExperience(null)
                    setIsExpFormModalOpen(true)
                  }}
                  className="rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 px-5 py-2.5 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Position Manually</span>
                </button>
              </div>

              {/* Quick 1-Click Samples for Immediate Testing */}
              <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800 max-w-xl mx-auto space-y-2">
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Or test immediately with 1-click verified enclave presets:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickPresetImport('trades_carpenter')}
                    className="px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-200 dark:border-amber-800 text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>🔨 Master Carpenter &amp; Superintendent</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetImport('cyber_security')}
                    className="px-3 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-200 border border-sky-200 dark:border-sky-800 text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>🛡️ Cyber Security Architect</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetImport('healthcare_nurse')}
                    className="px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>🩺 Trauma ICU Charge Nurse</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. PUBLICATIONS & TECHNICAL SPECS */}
      {/* ========================================================================= */}
      {workspaceSection === 'publications' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enclaveWorkspace.publications.map((pub, i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 text-[10px] font-bold text-[#0A66C2] dark:text-sky-300 border border-blue-200 dark:border-blue-900">
                    {pub.type}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">{pub.date}</span>
                </div>
                <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 leading-snug">
                  {pub.title}
                </h4>
                <p className="text-xs text-zinc-500 font-semibold">{pub.publisher}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {pub.summary}
                </p>
                <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span>Peer Citations: <strong>{pub.citationsCount}</strong></span>
                  <span className="text-[#0A66C2] font-bold cursor-pointer hover:underline">Read Spec Sheet →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. PEER REVIEWS */}
      {/* ========================================================================= */}
      {workspaceSection === 'reviews' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(user.recommendations && user.recommendations.length > 0
              ? user.recommendations.map((rev) => ({
                  reviewerName: rev.authorName,
                  reviewerRole: rev.authorHeadline,
                  reviewerAvatar: rev.authorAvatar,
                  rating: 5,
                  date: rev.date,
                  reviewType: 'Peer Review' as const,
                  comment: rev.text
                }))
              : enclaveWorkspace.reviews
            ).map((rev, i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={rev.reviewerAvatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">{rev.reviewerName}</h4>
                      <p className="text-[11px] text-zinc-500">{rev.reviewerRole}</p>
                    </div>
                  </div>
                  <span className="text-amber-500 font-bold text-xs">★★★★★</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 italic leading-relaxed">
                  "{rev.comment}"
                </p>
                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span>{rev.reviewType}</span>
                  <span>{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. 🌐 PERSONAL BUSINESS WEBSITE & INTEGRATED PRODUCTS STOREFRONT */}
      {/* ========================================================================= */}
      {workspaceSection === 'business' && (() => {
        const themeMap: Record<
          BusinessThemeColor,
          {
            btnPrimary: string
            badgeBg: string
            accentText: string
            borderHighlight: string
            softPanel: string
            heroAccent: string
          }
        > = {
          emerald: {
            btnPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
            badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
            accentText: 'text-emerald-600 dark:text-emerald-400',
            borderHighlight: 'border-emerald-500 ring-2 ring-emerald-500/20',
            softPanel: 'from-emerald-50 via-white to-teal-50/60 dark:from-emerald-950/30 dark:via-zinc-900 dark:to-teal-950/20',
            heroAccent: 'from-emerald-600 to-teal-700'
          },
          blue: {
            btnPrimary: 'bg-[#0A66C2] hover:bg-[#004182] text-white shadow-blue-600/20',
            badgeBg: 'bg-blue-50 text-[#0A66C2] border-blue-200 dark:bg-blue-950/60 dark:text-sky-300 dark:border-blue-800',
            accentText: 'text-[#0A66C2] dark:text-sky-400',
            borderHighlight: 'border-[#0A66C2] ring-2 ring-blue-500/20',
            softPanel: 'from-blue-50 via-white to-sky-50/60 dark:from-blue-950/30 dark:via-zinc-900 dark:to-sky-950/20',
            heroAccent: 'from-[#0A66C2] to-indigo-700'
          },
          amber: {
            btnPrimary: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20',
            badgeBg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
            accentText: 'text-amber-600 dark:text-amber-400',
            borderHighlight: 'border-amber-500 ring-2 ring-amber-500/20',
            softPanel: 'from-amber-50 via-white to-orange-50/60 dark:from-amber-950/30 dark:via-zinc-900 dark:to-orange-950/20',
            heroAccent: 'from-amber-600 to-orange-700'
          },
          purple: {
            btnPrimary: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20',
            badgeBg: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
            accentText: 'text-purple-600 dark:text-purple-400',
            borderHighlight: 'border-purple-500 ring-2 ring-purple-500/20',
            softPanel: 'from-purple-50 via-white to-indigo-50/60 dark:from-purple-950/30 dark:via-zinc-900 dark:to-indigo-950/20',
            heroAccent: 'from-purple-600 to-indigo-700'
          },
          rose: {
            btnPrimary: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20',
            badgeBg: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
            accentText: 'text-rose-600 dark:text-rose-400',
            borderHighlight: 'border-rose-500 ring-2 ring-rose-500/20',
            softPanel: 'from-rose-50 via-white to-orange-50/60 dark:from-rose-950/30 dark:via-zinc-900 dark:to-orange-950/20',
            heroAccent: 'from-rose-600 to-pink-700'
          },
          teal: {
            btnPrimary: 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20',
            badgeBg: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800',
            accentText: 'text-teal-600 dark:text-teal-400',
            borderHighlight: 'border-teal-500 ring-2 ring-teal-500/20',
            softPanel: 'from-teal-50 via-white to-cyan-50/60 dark:from-teal-950/30 dark:via-zinc-900 dark:to-cyan-950/20',
            heroAccent: 'from-teal-600 to-emerald-700'
          }
        }
        const activeTheme = themeMap[businessWebsite.themeColor || 'blue']
        const uniqueCategories = ['All', ...Array.from(new Set(allWebsiteOfferings.map((o) => o.category)))]
        const visibleOfferings =
          businessCategoryFilter === 'All'
            ? allWebsiteOfferings
            : allWebsiteOfferings.filter((o) => o.category === businessCategoryFilter)

        const scrollToSiteSection = (elementId: string) => {
          if (typeof document !== 'undefined') {
            document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }

        const showOwnerControls = canManageWorkspace && !isBusinessPreviewMode

        return (
        <div className="space-y-4 animate-in fade-in">
          {/* OWNER / ADMIN SELF-SERVICE MANAGEMENT STUDIO BAR */}
          {canManageWorkspace && (
            <div className="rounded-2xl border-2 border-emerald-400/80 dark:border-emerald-700 bg-gradient-to-r from-emerald-50 via-white to-sky-50 dark:from-emerald-950/40 dark:via-zinc-900 dark:to-sky-950/30 p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white ${
                      isAdminManagingOtherMember ? 'bg-purple-700' : 'bg-emerald-700'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>
                      {isAdminManagingOtherMember
                        ? `🛡️ Admin Management Studio · Editing ${user.name}'s Business Page`
                        : '100% Self-Service Owner Studio'}
                    </span>
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-300">
                    {isAdminManagingOtherMember
                      ? 'Admin Edit & Delete Access Enabled'
                      : '✓ Instant Live Publishing — No Expedite Consults approval needed'}
                  </span>
                </div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                  Manage {isAdminManagingOtherMember ? `${user.name}'s` : 'your own'} page anytime: edit headline, banner photo, domain slug, pricing, and add, update, or delete products directly below.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <button
                  type="button"
                  onClick={handleOpenEditWebsiteModal}
                  className="rounded-xl bg-zinc-950 dark:bg-zinc-100 hover:opacity-90 px-4 py-2.5 text-sm font-extrabold text-white dark:text-zinc-900 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Page &amp; Banner</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddProductModal}
                  className={`rounded-xl px-4 py-2.5 text-sm font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm ${activeTheme.btnPrimary}`}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Product / Service</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsBusinessPreviewMode(!isBusinessPreviewMode)}
                  className="rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 border border-zinc-300 dark:border-zinc-700 px-3.5 py-2.5 text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="h-4 w-4 text-[#0A66C2]" />
                  <span>{isBusinessPreviewMode ? 'Exit Preview (Show Edit Buttons)' : 'Preview as Visitor'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetDefaultCatalog}
                  className="rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1 cursor-pointer"
                  title="Restore profession default template"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Reset Defaults</span>
                </button>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden">
          {/* A. WEBSITE BROWSER ADDRESS BAR CHROME */}
          <div className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-0 max-w-xl rounded-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-xs sm:text-sm shadow-2xs">
                <Lock className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {businessWebsite.domainUrl}
                </span>
                <span className="ml-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 shrink-0">
                  LIVE SITE
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                type="button"
                onClick={handleCopyWebsiteUrl}
                className="rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-50 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 cursor-pointer"
              >
                {siteUrlCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                <span>{siteUrlCopied ? 'Website URL Copied ✓' : 'Copy Site Link'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-50 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                <span>Share Website</span>
              </button>
            </div>
          </div>

          {/* B. WEBSITE TOP NAVIGATION BAR */}
          <header
            id="business-site-top"
            className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-5 sm:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`relative h-12 w-12 rounded-xl bg-gradient-to-br ${activeTheme.heroAccent} p-0.5 shadow-sm shrink-0`}>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full rounded-[10px] object-cover bg-white"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-zinc-950 dark:text-white truncate">
                    {businessWebsite.businessName}
                  </h2>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-xs font-extrabold text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0">
                    ✓ Verified Business
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
                  {businessWebsite.professionTitle} · License #{businessWebsite.licenseNumber}
                </p>
              </div>
            </div>

            <nav className="flex items-center gap-1 sm:gap-2 flex-wrap text-sm font-bold text-zinc-800 dark:text-zinc-200">
              <button
                type="button"
                onClick={() => scrollToSiteSection('business-site-services')}
                className="px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                Services &amp; Shop
              </button>
              <button
                type="button"
                onClick={() => scrollToSiteSection('business-site-about')}
                className="px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                About
              </button>
              <button
                type="button"
                onClick={() => scrollToSiteSection('business-site-gallery')}
                className="px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                Gallery
              </button>
              <button
                type="button"
                onClick={() => scrollToSiteSection('business-site-reviews')}
                className="px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                Reviews &amp; FAQ
              </button>
              <button
                type="button"
                onClick={() => scrollToSiteSection('business-site-booking')}
                className={`ml-1 rounded-xl px-4 py-2 text-sm font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-[1.02] ${activeTheme.btnPrimary}`}
              >
                <Calendar className="h-4 w-4" />
                <span>Book / Request Quote</span>
              </button>
            </nav>
          </header>

          {/* C. WEBSITE FULL-BLEED HERO LANDING SECTION */}
          <section className="relative min-h-[360px] sm:min-h-[400px] flex flex-col justify-between overflow-hidden bg-slate-900 text-white">
            <img
              src={businessWebsite.heroBannerImage}
              alt={businessWebsite.businessName}
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-slate-900/55" />

            <div className="relative z-10 px-6 sm:px-10 pt-10 pb-8 max-w-4xl space-y-5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-3.5 py-1 text-xs sm:text-sm font-bold text-white">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  <span>{businessWebsite.insuredStatus}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 px-3.5 py-1 text-xs sm:text-sm font-bold text-zinc-100">
                  <MapPin className="h-4 w-4 text-sky-300" />
                  <span>{businessWebsite.location}</span>
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.12]">
                  {businessWebsite.heroHeadline}
                </h1>
                <p className="text-base sm:text-lg text-zinc-100 max-w-2xl leading-relaxed font-medium">
                  {businessWebsite.heroSubheadline}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap pt-1">
                <button
                  type="button"
                  onClick={() => scrollToSiteSection('business-site-booking')}
                  className={`rounded-xl px-5 py-3.5 text-sm sm:text-base font-extrabold shadow-lg flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.02] ${activeTheme.btnPrimary}`}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Book Appointment / Get Estimate</span>
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSiteSection('business-site-services')}
                  className="rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/35 px-5 py-3.5 text-sm sm:text-base font-extrabold text-white flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>What We Sell &amp; Pricing ({allWebsiteOfferings.length})</span>
                </button>

                {onNavigateMessaging && (
                  <button
                    type="button"
                    onClick={() => onNavigateMessaging(user)}
                    className="rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/25 px-5 py-3.5 text-sm sm:text-base font-bold text-white flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <MessageSquarePlus className="h-4 w-4 text-sky-300" />
                    <span>Chat With {user.name.split(' ')[0]}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Hero Trust & Metrics Bar */}
            <div className="relative z-10 bg-black/65 backdrop-blur-md border-t border-white/20 px-6 sm:px-10 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">Customer Rating</span>
                <p className="text-base sm:text-lg font-black text-amber-300">
                  ★ {businessWebsite.rating} / 5.0 <span className="text-xs sm:text-sm font-semibold text-zinc-200">({businessWebsite.reviewsCount} reviews)</span>
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">Track Record</span>
                <p className="text-base sm:text-lg font-black text-white">{businessWebsite.completedJobsCount}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">Response SLA</span>
                <p className="text-base sm:text-lg font-black text-emerald-300">{businessWebsite.responseTime}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">Coverage Area</span>
                <p className="text-sm sm:text-base font-bold text-white truncate">{businessWebsite.serviceArea}</p>
              </div>
            </div>
          </section>

          {/* D. "WHAT WE SELL & OFFER" — WEBSITE SERVICES & MARKETPLACE STOREFRONT */}
          <section id="business-site-services" className="px-6 sm:px-10 py-10 space-y-6 bg-zinc-50/70 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-bold ${activeTheme.badgeBg}`}>
                  <Store className="h-4 w-4" />
                  <span>Services, Packages &amp; Marketplace Storefront</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white">
                  What We Sell &amp; Offer
                </h2>
                <p className="text-sm sm:text-base font-medium text-zinc-800 dark:text-zinc-200">
                  Transparent, upfront offerings tailored to {businessWebsite.businessName}. All packages sync seamlessly with ConnectLn Marketplace protection.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {uniqueCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setBusinessCategoryFilter(cat)}
                    className={`rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      businessCategoryFilter === cat
                        ? activeTheme.btnPrimary
                        : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {visibleOfferings.map((off) => (
                <div
                  key={off.id}
                  className={`relative rounded-2xl bg-white dark:bg-zinc-900 border p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-xl ${
                    off.popular ? activeTheme.borderHighlight : 'border-zinc-300/80 dark:border-zinc-800'
                  }`}
                >
                  {off.popular && (
                    <span className={`absolute -top-3 right-5 rounded-full px-3 py-0.5 text-xs font-black uppercase tracking-wider shadow-sm ${activeTheme.btnPrimary}`}>
                      ⭐ Most Popular
                    </span>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-2xl border border-zinc-300 dark:border-zinc-700 shrink-0">
                        {off.icon}
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-bold ${activeTheme.badgeBg}`}>
                        {off.category}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white leading-snug">
                        {off.title}
                      </h3>
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
                        {off.description}
                      </p>
                    </div>

                    <div
                      role={showOwnerControls ? 'button' : undefined}
                      tabIndex={showOwnerControls ? 0 : undefined}
                      onClick={showOwnerControls ? () => handleOpenEditProductModal(off) : undefined}
                      onKeyDown={
                        showOwnerControls
                          ? (e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                handleOpenEditProductModal(off)
                              }
                            }
                          : undefined
                      }
                      title={showOwnerControls ? 'Click to edit price, billing unit, or turnaround live' : undefined}
                      className={`rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300/80 dark:border-zinc-700 p-3.5 flex flex-wrap items-baseline justify-between gap-2 ${
                        showOwnerControls
                          ? 'cursor-pointer hover:border-[#0A66C2] hover:ring-2 hover:ring-[#0A66C2]/20 transition-all group/price'
                          : ''
                      }`}
                    >
                      <div className="flex items-baseline flex-wrap gap-x-1.5">
                        <span className={`text-2xl sm:text-3xl font-black ${activeTheme.accentText}`}>{off.price}</span>
                        {off.billingUnit && (
                          <span className="text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300">
                            {off.billingUnit}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {off.turnaround && (
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-300 dark:border-zinc-700">
                            ⏱️ {off.turnaround}
                          </span>
                        )}
                        {showOwnerControls && (
                          <span className="text-[11px] font-extrabold text-[#0A66C2] dark:text-sky-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-md opacity-85 group-hover/price:opacity-100">
                            ✎ Edit Price
                          </span>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-2 pt-1">
                      {off.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-200">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-5 mt-5 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectWebsiteOffering(off.title)}
                        className={`flex-1 rounded-xl py-2.5 px-4 text-sm font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-transform hover:scale-[1.01] shadow-sm ${activeTheme.btnPrimary}`}
                      >
                        <span>{off.ctaLabel}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={onNavigateMarketplace}
                        className="rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer"
                        title="Open in ConnectLn Marketplace"
                      >
                        Market ↗
                      </button>
                    </div>
                    {showOwnerControls && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditProductModal(off)}
                          className="flex-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 py-1.5 px-3 text-xs font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Edit Item</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProductOffering(off.id)}
                          className="rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 py-1.5 px-3 text-xs font-extrabold text-rose-800 dark:text-rose-300 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Integrated Marketplace Products & Storefront Desk inside Business Page */}
            <div id="business-site-marketplace" className="pt-4 space-y-4">
              <div className="rounded-2xl border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 sm:p-6 text-zinc-950 dark:text-white shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950/70 px-3.5 py-1 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-950 dark:text-amber-200 border-2 border-amber-400 dark:border-amber-700">
                      {businessWebsite.industryLabel} · Marketplace Catalog
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white">
                      {isViewingOtherMember
                        ? `${user.name.split(' ')[0]}'s Active Marketplace Products (${myProducts.length})`
                        : `Your Marketplace Products & Storefront Inventory (${myProducts.length})`}
                    </h3>
                    <p className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-200">
                      Every product, plan, and service listed here appears on both this Business Website and the ConnectLn Marketplace.
                    </p>
                  </div>

                  {canManageWorkspace && (
                    <button
                      type="button"
                      onClick={handleOpenAddProductModal}
                      className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-4 py-2.5 text-sm font-black text-white shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>List New Product / Service</span>
                    </button>
                  )}
                </div>

                {canManageWorkspace && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 p-3.5 text-center">
                      <span className="text-xs text-zinc-900 dark:text-zinc-300 uppercase font-mono font-extrabold">Top Revenue Stream</span>
                      <p className="text-sm sm:text-base font-black text-emerald-800 dark:text-emerald-400 truncate">{myProducts[0]?.mrrOrRevenue || 'Active'}</p>
                    </div>
                    <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 p-3.5 text-center">
                      <span className="text-xs text-zinc-900 dark:text-zinc-300 uppercase font-mono font-extrabold">Active Units / Clients</span>
                      <p className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white">
                        {myProducts.reduce((s, p) => s + (p.activeLicensesCount || 0), 0).toLocaleString()} Active
                      </p>
                    </div>
                    <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 p-3.5 text-center">
                      <span className="text-xs text-zinc-900 dark:text-zinc-300 uppercase font-mono font-extrabold">Active Bookings / Trials</span>
                      <p className="text-lg sm:text-xl font-black text-amber-800 dark:text-amber-300">
                        {myProducts.reduce((s, p) => s + (p.activeTrialsCount || 0), 0)} Active
                      </p>
                    </div>
                    <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 p-3.5 text-center">
                      <span className="text-xs text-zinc-900 dark:text-zinc-300 uppercase font-mono font-extrabold">Customer Leads</span>
                      <p className="text-lg sm:text-xl font-black text-[#004182] dark:text-sky-300">
                        {myProducts.reduce((s, p) => s + (p.leadsCount || 0), 0)} Leads
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {managedOfferings.map((off) => (
                  <div
                    key={off.id}
                    className="rounded-2xl border border-zinc-300 bg-white p-4 sm:p-5 shadow-xs hover:border-purple-500 transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-2xl border border-purple-200 dark:bg-purple-950/40 dark:border-purple-900 shrink-0">
                        {off.icon}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-base text-zinc-950 dark:text-white">{off.title}</h4>
                          <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-900 dark:bg-purple-950 dark:text-purple-200">
                            {off.category}
                          </span>
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                            Active Listing
                          </span>
                        </div>
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                          <strong>{off.price}</strong> ({off.billingUnit}) · Rating: <strong>{off.rating} ⭐ ({off.reviewsCount})</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                      <div className="text-right mr-2">
                        <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">{off.revenueLabel}</p>
                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{off.activeClientsCount} booked · {off.leadsCount} leads</p>
                      </div>
                      {showOwnerControls && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEditProductModal(off)}
                            className="rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-zinc-100 cursor-pointer flex items-center gap-1"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProductOffering(off.id)}
                            className="rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 px-3 py-2 text-xs sm:text-sm font-extrabold text-rose-800 cursor-pointer flex items-center gap-1"
                            title="Delete offering"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => handleSelectWebsiteOffering(off.title)}
                        className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold shadow-xs cursor-pointer ${activeTheme.btnPrimary}`}
                      >
                        Order / Book
                      </button>
                      <button
                        type="button"
                        onClick={onNavigateMarketplace}
                        className="rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3.5 py-2 text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer"
                      >
                        Market ↗
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* E. WHY CHOOSE US + ABOUT OUR BUSINESS + CREDENTIALS */}
          <section id="business-site-about" className="px-6 sm:px-10 py-10 space-y-8 border-b border-zinc-200 dark:border-zinc-800">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 space-y-4">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-bold ${activeTheme.badgeBg}`}>
                  <Building2 className="h-4 w-4" />
                  <span>About {businessWebsite.businessName}</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white leading-tight">
                  Why Customers &amp; Partners Trust Us
                </h2>
                <p className="text-base font-medium text-zinc-900 dark:text-zinc-200 leading-relaxed">
                  {businessWebsite.aboutStory}
                </p>
                <blockquote className={`rounded-2xl border bg-gradient-to-br p-5 text-sm sm:text-base font-bold italic text-zinc-950 dark:text-zinc-100 ${activeTheme.softPanel} border-zinc-300 dark:border-zinc-700`}>
                  &ldquo;{businessWebsite.missionStatement}&rdquo;
                  <footer className="mt-2.5 not-italic flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full object-cover" />
                    <span>{user.name} · Founder &amp; {businessWebsite.professionTitle}</span>
                  </footer>
                </blockquote>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {businessWebsite.valueProps.map((vp, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-2 shadow-2xs"
                    >
                      <div className="text-2xl">{vp.icon}</div>
                      <h3 className="text-base font-extrabold text-zinc-950 dark:text-white">{vp.title}</h3>
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">{vp.description}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/70 p-5 space-y-3">
                  <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                    Verified Licenses, Compliance &amp; Business Guarantees
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {businessWebsite.credentialsBadges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 shadow-2xs"
                      >
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <span>{badge}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* F. WORK PORTFOLIO & PHOTO GALLERY */}
          <section id="business-site-gallery" className="px-6 sm:px-10 py-10 space-y-6 bg-zinc-50/70 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white">
                  Recent Work &amp; Business Showcase
                </h2>
                <p className="text-sm sm:text-base font-medium text-zinc-800 dark:text-zinc-200">
                  Verified field work, diagnostics, and client deliveries from {businessWebsite.businessName}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWorkspaceSection('portfolio')}
                className={`text-sm font-extrabold flex items-center gap-1 cursor-pointer hover:underline ${activeTheme.accentText}`}
              >
                <span>See Full Portfolio ({enclaveWorkspace.portfolio.length})</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {businessWebsite.gallery.map((item, idx) => (
                <div
                  key={idx}
                  className="group rounded-2xl overflow-hidden border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="relative h-48 overflow-hidden bg-zinc-900">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 rounded-full bg-black/80 backdrop-blur-md px-3 py-1 text-xs font-bold text-white border border-white/25">
                      {item.badge}
                    </span>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <h3 className="font-extrabold text-base text-zinc-950 dark:text-white">{item.title}</h3>
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* G. VERIFIED CLIENT REVIEWS & INTERACTIVE FAQ */}
          <section id="business-site-reviews" className="px-6 sm:px-10 py-10 border-b border-zinc-200 dark:border-zinc-800">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-zinc-950 dark:text-white">
                    Verified Customer Reviews
                  </h2>
                  <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                    ★★★★★ {businessWebsite.rating} ({businessWebsite.reviewsCount})
                  </span>
                </div>
                <div className="space-y-3">
                  {businessWebsite.testimonials.map((tItem, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-extrabold text-base text-zinc-950 dark:text-white">{tItem.clientName}</p>
                          <p className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300">{tItem.clientRole}</p>
                        </div>
                        <span className="text-amber-500 text-sm font-bold">★★★★★</span>
                      </div>
                      <p className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 italic leading-relaxed">
                        &ldquo;{tItem.quote}&rdquo;
                      </p>
                      <p className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400">Verified ConnectLn Client · {tItem.date}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-black text-zinc-950 dark:text-white">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-2.5">
                  {businessWebsite.faqs.map((faq, idx) => {
                    const isOpen = openBusinessFaqIdx === idx
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenBusinessFaqIdx(isOpen ? null : idx)}
                          className="w-full px-4 py-4 text-left flex items-center justify-between gap-3 font-extrabold text-sm sm:text-base text-zinc-950 dark:text-white cursor-pointer"
                        >
                          <span>{faq.question}</span>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 shrink-0 text-zinc-700 dark:text-zinc-300" />
                          ) : (
                            <ChevronDown className="h-5 w-5 shrink-0 text-zinc-700 dark:text-zinc-300" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 text-sm sm:text-base font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed border-t border-zinc-200 dark:border-zinc-800 pt-3">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* H. INTERACTIVE WEBSITE BOOKING / REQUEST A QUOTE SECTION */}
          <section
            id="business-site-booking"
            className={`px-6 sm:px-10 py-10 bg-gradient-to-br ${activeTheme.softPanel}`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 space-y-4">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-bold ${activeTheme.badgeBg}`}>
                  <Calendar className="h-4 w-4" />
                  <span>Direct Booking &amp; Free Estimate</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white">
                  Schedule With {businessWebsite.businessName}
                </h2>
                <p className="text-sm sm:text-base font-medium text-zinc-800 dark:text-zinc-200">
                  Book an appointment, request an exact upfront estimate, or inquire about custom contracts directly from our website.
                </p>

                <div className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3.5 text-sm shadow-sm">
                  <div className="flex items-start gap-2.5">
                    <Clock className={`h-5 w-5 shrink-0 mt-0.5 ${activeTheme.accentText}`} />
                    <div>
                      <p className="font-extrabold text-zinc-950 dark:text-white">Hours of Operation</p>
                      <p className="font-medium text-zinc-800 dark:text-zinc-200">{businessWebsite.operatingHours}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin className={`h-5 w-5 shrink-0 mt-0.5 ${activeTheme.accentText}`} />
                    <div>
                      <p className="font-extrabold text-zinc-950 dark:text-white">Service Coverage</p>
                      <p className="font-medium text-zinc-800 dark:text-zinc-200">{businessWebsite.serviceArea}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Phone className={`h-5 w-5 shrink-0 mt-0.5 ${activeTheme.accentText}`} />
                    <div>
                      <p className="font-extrabold text-zinc-950 dark:text-white">Direct Business Line</p>
                      <p className="font-medium text-zinc-800 dark:text-zinc-200">{businessWebsite.phoneDisplay}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Mail className={`h-5 w-5 shrink-0 mt-0.5 ${activeTheme.accentText}`} />
                    <div>
                      <p className="font-extrabold text-zinc-950 dark:text-white">Business Email &amp; Web</p>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200 font-mono text-xs sm:text-sm break-all">{businessWebsite.emailDisplay}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-lg">
                {quoteSubmittedReceipt ? (
                  <div className="py-6 text-center space-y-3.5">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-black text-zinc-950 dark:text-white">
                      Request Sent to {businessWebsite.businessName}!
                    </h3>
                    <p className="text-sm sm:text-base font-medium text-zinc-800 dark:text-zinc-200 max-w-lg mx-auto">
                      Confirmation <strong>#{quoteSubmittedReceipt.id}</strong> for{' '}
                      <strong>{quoteSubmittedReceipt.service}</strong> on{' '}
                      <strong>{quoteSubmittedReceipt.preferredDate}</strong> has been logged for{' '}
                      <strong>{quoteSubmittedReceipt.clientName}</strong>. Expected response: {businessWebsite.responseTime}.
                    </p>
                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 text-left text-xs space-y-1 max-w-lg mx-auto">
                      <p className="font-extrabold text-emerald-900 dark:text-emerald-200">
                        {quoteSubmittedReceipt.emailDispatched
                          ? '✅ Email Confirmation Dispatched'
                          : '📬 Booking Logged to ConnectLn Messaging & Business Inbox'}
                      </p>
                      {quoteSubmittedReceipt.emailRecipients && quoteSubmittedReceipt.emailRecipients.length > 0 && (
                        <p className="text-zinc-700 dark:text-zinc-300 break-all">
                          <strong>Notified Recipients:</strong> {quoteSubmittedReceipt.emailRecipients.join(', ')}
                        </p>
                      )}
                      {quoteSubmittedReceipt.emailMessageId && (
                        <p className="font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                          <strong>Resend Message ID:</strong> {quoteSubmittedReceipt.emailMessageId}
                        </p>
                      )}
                      {quoteSubmittedReceipt.emailError && !quoteSubmittedReceipt.emailDispatched && (
                        <p className="text-[11px] text-amber-700 dark:text-amber-300">
                          <strong>Email Status:</strong> {quoteSubmittedReceipt.emailError}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuoteSubmittedReceipt(null)}
                      className="rounded-xl bg-zinc-900 dark:bg-zinc-100 px-5 py-2.5 text-sm font-bold text-white dark:text-zinc-900 cursor-pointer"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitBusinessQuote} className="space-y-4 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="font-extrabold text-zinc-900 dark:text-zinc-100">Your Name / Organization</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Jordan Rivera"
                          value={quoteClientName}
                          onChange={(e) => setQuoteClientName(e.target.value)}
                          className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2.5 text-sm font-medium text-zinc-950 dark:text-zinc-100"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-extrabold text-zinc-900 dark:text-zinc-100">Email or Phone Number</label>
                        <input
                          type="text"
                          required
                          placeholder="you@email.com or (555) 123-4567"
                          value={quoteClientEmail}
                          onChange={(e) => setQuoteClientEmail(e.target.value)}
                          className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2.5 text-sm font-medium text-zinc-950 dark:text-zinc-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="font-extrabold text-zinc-900 dark:text-zinc-100">Select Service / Product</label>
                        <select
                          value={quoteSelectedOffering || allWebsiteOfferings[0]?.title || ''}
                          onChange={(e) => setQuoteSelectedOffering(e.target.value)}
                          className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2.5 text-sm font-medium text-zinc-950 dark:text-zinc-100"
                        >
                          {allWebsiteOfferings.map((o) => (
                            <option key={o.id} value={o.title}>
                              {o.title} ({o.price})
                            </option>
                          ))}
                          <option value={`Custom ${businessWebsite.professionTitle} Project`}>
                            Custom {businessWebsite.professionTitle} Request
                          </option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-extrabold text-zinc-900 dark:text-zinc-100">Preferred Date / Timing</label>
                        <input
                          type="date"
                          value={quotePreferredDate}
                          onChange={(e) => setQuotePreferredDate(e.target.value)}
                          className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2.5 text-sm font-medium text-zinc-950 dark:text-zinc-100"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-extrabold text-zinc-900 dark:text-zinc-100">Project Scope / Appointment Details</label>
                      <textarea
                        rows={3}
                        placeholder={`Tell ${user.name.split(' ')[0]} what you need help with, location details, or any urgency...`}
                        value={quoteNotes}
                        onChange={(e) => setQuoteNotes(e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2.5 text-sm font-medium text-zinc-950 dark:text-zinc-100"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingQuote}
                      className={`w-full rounded-xl py-3.5 px-5 text-sm sm:text-base font-extrabold shadow-md cursor-pointer transition-transform hover:scale-[1.01] disabled:opacity-60 ${activeTheme.btnPrimary}`}
                    >
                      {isSubmittingQuote
                        ? `Sending Request & Email Notification to ${businessWebsite.businessName}...`
                        : `Send Booking & Quote Request to ${businessWebsite.businessName} →`}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>

          {/* I. AUTHENTIC WEBSITE FOOTER */}
          <footer className="bg-slate-950 text-zinc-200 px-6 sm:px-10 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-extrabold text-white text-base">{businessWebsite.businessName}</p>
              <p className="text-xs sm:text-sm text-zinc-300">
                © 2026 {businessWebsite.businessName} · Self-Managed Official Business Website on ConnectLn ({businessWebsite.domainSlug}.conectln.com)
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap text-xs sm:text-sm font-bold">
              <button type="button" onClick={() => scrollToSiteSection('business-site-top')} className="hover:text-white cursor-pointer">
                Back to Top
              </button>
              <button type="button" onClick={() => scrollToSiteSection('business-site-services')} className="hover:text-white cursor-pointer">
                Services &amp; Products
              </button>
              <button type="button" onClick={() => scrollToSiteSection('business-site-marketplace')} className="hover:text-white cursor-pointer">
                Marketplace Storefront
              </button>
              <button type="button" onClick={() => setWorkspaceSection('profile')} className="hover:text-white cursor-pointer">
                Owner Profile
              </button>
            </div>
          </footer>
          </div>
        </div>
        )
      })()}

      {/* MODAL: CUSTOMIZE PERSONAL BUSINESS WEBSITE (OWNER SELF-SERVICE) */}
      <Dialog
        open={isEditWebsiteModalOpen}
        onOpenChange={(open) => {
          if (!open) setIsEditWebsiteModalOpen(false)
        }}
      >
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-zinc-950 dark:text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-600" />
              <span>Edit Your Business Website (Instant Live Publish)</span>
            </DialogTitle>
          </DialogHeader>

          {websiteSavedSuccess ? (
            <div className="py-8 text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check className="h-6 w-6" />
              </div>
              <h4 className="font-extrabold text-base text-zinc-950 dark:text-white">
                Business Website Updated &amp; Published Live!
              </h4>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                All branding, banner, domain URL, and business details updated immediately — no admin request required.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSaveWebsiteCustomization} className="space-y-3.5 text-sm pt-1">
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                ✓ 100% Self-Service: Changes you save below publish directly to your live Business Website immediately.
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-zinc-900 dark:text-zinc-100">Business Name</label>
                <input
                  type="text"
                  required
                  value={editWebsiteName}
                  onChange={(e) => setEditWebsiteName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm font-bold text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold text-zinc-900 dark:text-zinc-100">Website Subdomain</label>
                  <div className="flex items-center rounded-lg border border-zinc-300 dark:border-zinc-700 overflow-hidden bg-zinc-50 dark:bg-zinc-800">
                    <input
                      type="text"
                      value={editWebsiteSlug}
                      onChange={(e) => setEditWebsiteSlug(e.target.value)}
                      className="flex-1 bg-transparent p-2.5 text-zinc-950 dark:text-zinc-100 font-mono text-xs font-bold outline-none"
                    />
                    <span className="px-2.5 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 border-l border-zinc-300 dark:border-zinc-700">.conectln.com</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-zinc-900 dark:text-zinc-100">Website Theme Color</label>
                  <select
                    value={editWebsiteTheme}
                    onChange={(e) => setEditWebsiteTheme(e.target.value as BusinessThemeColor)}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm font-semibold text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="emerald">Emerald Green</option>
                    <option value="blue">ConnectLn Classic Blue</option>
                    <option value="amber">Master Trades Amber</option>
                    <option value="teal">Clinical Teal</option>
                    <option value="purple">Executive Purple</option>
                    <option value="rose">Studio Rose</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-zinc-900 dark:text-zinc-100">Website Hero Headline</label>
                <input
                  type="text"
                  value={editWebsiteHeadline}
                  onChange={(e) => setEditWebsiteHeadline(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm font-medium text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-zinc-900 dark:text-zinc-100">Hero Subheadline / Welcome Message</label>
                <textarea
                  rows={2}
                  value={editWebsiteSubheadline}
                  onChange={(e) => setEditWebsiteSubheadline(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm font-medium text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-zinc-900 dark:text-zinc-100">Hero Background Banner Image URL</label>
                <input
                  type="url"
                  value={editWebsiteBannerUrl}
                  onChange={(e) => setEditWebsiteBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-xs font-mono text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Veterinary', url: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1200&auto=format&fit=crop&q=80' },
                    { label: 'Cyber / Tech', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80' },
                    { label: 'Craft / Trades', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80' },
                    { label: 'Automotive / EV', url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1200&auto=format&fit=crop&q=80' },
                    { label: 'Healthcare', url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop&q=80' }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setEditWebsiteBannerUrl(preset.url)}
                      className="rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold text-zinc-900 dark:text-zinc-100">Service Coverage Area</label>
                  <input
                    type="text"
                    value={editWebsiteServiceArea}
                    onChange={(e) => setEditWebsiteServiceArea(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm font-medium text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-zinc-900 dark:text-zinc-100">Business Phone Line</label>
                  <input
                    type="text"
                    value={editWebsitePhone}
                    onChange={(e) => setEditWebsitePhone(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm font-medium text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold text-zinc-900 dark:text-zinc-100">Business Email</label>
                  <input
                    type="text"
                    value={editWebsiteEmail}
                    onChange={(e) => setEditWebsiteEmail(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm font-medium text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-zinc-900 dark:text-zinc-100">License / Reg #</label>
                  <input
                    type="text"
                    value={editWebsiteLicense}
                    onChange={(e) => setEditWebsiteLicense(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm font-mono font-bold text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-zinc-900 dark:text-zinc-100">Operating Hours</label>
                <input
                  type="text"
                  value={editWebsiteHours}
                  onChange={(e) => setEditWebsiteHours(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm font-medium text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-zinc-900 dark:text-zinc-100">About Your Business Story</label>
                <textarea
                  rows={3}
                  value={editWebsiteAbout}
                  onChange={(e) => setEditWebsiteAbout(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm font-medium text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-zinc-900 dark:text-zinc-100">Mission Quote</label>
                <input
                  type="text"
                  value={editWebsiteMission}
                  onChange={(e) => setEditWebsiteMission(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm font-medium text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              {/* Inline Products & Pricing Editor right inside Edit Page modal */}
              {editWebsiteOfferingsDraft.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between gap-2">
                    <label className="font-extrabold text-zinc-950 dark:text-white flex items-center gap-1.5">
                      <ShoppingBag className="h-4 w-4 text-purple-600" />
                      <span>Products &amp; Pricing on Your Page ({editWebsiteOfferingsDraft.length})</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditWebsiteModalOpen(false)
                        handleOpenAddProductModal()
                      }}
                      className="text-xs font-extrabold text-[#0A66C2] dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      + Add New Product
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {editWebsiteOfferingsDraft.map((draft, idx) => (
                      <div
                        key={draft.id}
                        className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold text-zinc-700 dark:text-zinc-300">
                            {draft.icon} Item #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditWebsiteModalOpen(false)
                              handleOpenEditProductModal(draft)
                            }}
                            className="text-xs font-bold text-[#0A66C2] dark:text-sky-400 hover:underline cursor-pointer"
                          >
                            Full Item Details →
                          </button>
                        </div>
                        <input
                          type="text"
                          value={draft.title}
                          onChange={(e) => {
                            const val = e.target.value
                            setEditWebsiteOfferingsDraft((prev) =>
                              prev.map((item) => (item.id === draft.id ? { ...item, title: val } : item))
                            )
                          }}
                          placeholder="Product or service title"
                          className="w-full rounded-lg border border-zinc-300 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-sm font-bold text-zinc-950 dark:border-zinc-700 dark:text-zinc-100"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={draft.price}
                            onChange={(e) => {
                              const val = e.target.value
                              setEditWebsiteOfferingsDraft((prev) =>
                                prev.map((item) => (item.id === draft.id ? { ...item, price: val } : item))
                              )
                            }}
                            placeholder="Price (e.g. $499 / mo)"
                            className="rounded-lg border border-zinc-300 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-black text-emerald-700 dark:text-emerald-400 dark:border-zinc-700"
                          />
                          <input
                            type="text"
                            value={draft.billingUnit}
                            onChange={(e) => {
                              const val = e.target.value
                              setEditWebsiteOfferingsDraft((prev) =>
                                prev.map((item) => (item.id === draft.id ? { ...item, billingUnit: val } : item))
                              )
                            }}
                            placeholder="Billing unit"
                            className="rounded-lg border border-zinc-300 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100 dark:border-zinc-700"
                          />
                          <input
                            type="text"
                            value={draft.turnaround}
                            onChange={(e) => {
                              const val = e.target.value
                              setEditWebsiteOfferingsDraft((prev) =>
                                prev.map((item) => (item.id === draft.id ? { ...item, turnaround: val } : item))
                              )
                            }}
                            placeholder="Turnaround / Timing"
                            className="rounded-lg border border-zinc-300 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100 dark:border-zinc-700"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditWebsiteModalOpen(false)}
                  className="rounded-lg bg-zinc-200 px-4 py-2.5 text-sm font-bold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-sm font-extrabold text-white shadow-md cursor-pointer"
                >
                  Save &amp; Publish Live ✓
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL: ADD OR EDIT PRODUCT / SERVICE ON BUSINESS PAGE & MARKETPLACE */}
      <Dialog
        open={isAddProductModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddProductModalOpen(false)
            setEditingOfferingId(null)
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-zinc-950 dark:text-white flex items-center gap-2">
              <Store className="h-5 w-5 text-purple-600" />
              <span>{editingOfferingId ? 'Update Product / Service Listing' : 'Add Product or Service Listing'}</span>
            </DialogTitle>
          </DialogHeader>

          {productAddedSuccess ? (
            <div className="py-6 text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check className="h-6 w-6" />
              </div>
              <h4 className="font-extrabold text-base text-zinc-950 dark:text-white">
                {editingOfferingId ? 'Listing Updated Live!' : 'Listing Published to Business Page & Marketplace!'}
              </h4>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Your offering is synced live across your Profile, Business Website, and ConnectLn Marketplace.
              </p>
            </div>
          ) : (
            <form onSubmit={handleCreateProductListing} className="space-y-3.5 text-sm pt-1">
              <div className="space-y-1">
                <label className="font-extrabold text-zinc-900 dark:text-zinc-100">Product or Service Title</label>
                <input
                  type="text"
                  placeholder={`e.g. Custom ${businessWebsite.professionTitle} Package`}
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm font-bold text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold text-zinc-900 dark:text-zinc-100">Category</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm font-semibold text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="Services">Services</option>
                    <option value="Trade Plans">Trade &amp; Service Plans</option>
                    <option value="Clinical Services">Clinical / Veterinary Services</option>
                    <option value="Maintenance Plans">Maintenance &amp; Retainer Plans</option>
                    <option value="Diagnostics">Diagnostics &amp; Inspections</option>
                    <option value="Consultations">Consultations &amp; Advisory</option>
                    <option value="Training">Training &amp; Workshops</option>
                    <option value="Software">Software</option>
                    <option value="Enterprise Solutions">Turnkey / Enterprise Solutions</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-zinc-900 dark:text-zinc-100">Pricing / Rate</label>
                  <input
                    type="text"
                    placeholder="e.g. $175 or $49 / mo"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    required
                    className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm font-bold text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold text-zinc-900 dark:text-zinc-100">Billing Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. Per Visit, Monthly Plan, Flat Rate"
                    value={newProductBillingUnit}
                    onChange={(e) => setNewProductBillingUnit(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm font-medium text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-zinc-900 dark:text-zinc-100">Turnaround / Timing</label>
                  <input
                    type="text"
                    placeholder="e.g. Same-Day / 2–3 Days"
                    value={newProductTurnaround}
                    onChange={(e) => setNewProductTurnaround(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm font-medium text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-zinc-900 dark:text-zinc-100">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe what you deliver, warranty/SLA, and how customers benefit..."
                  value={newProductDescription}
                  onChange={(e) => setNewProductDescription(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm font-medium text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-zinc-900 dark:text-zinc-100">Key Deliverables (One per line)</label>
                <textarea
                  rows={3}
                  placeholder={"Full on-site / diagnostic inspection\nUpfront written guarantee\nFollow-up review included"}
                  value={newProductDeliverables}
                  onChange={(e) => setNewProductDeliverables(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm font-medium text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddProductModalOpen(false)
                    setEditingOfferingId(null)
                  }}
                  className="rounded-lg bg-zinc-200 px-4 py-2.5 text-sm font-bold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-md hover:from-purple-500 hover:to-indigo-500 cursor-pointer"
                >
                  {editingOfferingId ? 'Save Changes Live ✓' : 'Publish Listing Live ✓'}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Profile & Identity Modal */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="max-w-lg rounded-2xl bg-white p-6 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-[#0A66C2]" />
              <span>Edit Identity &amp; Profile</span>
            </DialogTitle>
          </DialogHeader>

          {editSavedSuccess ? (
            <div className="py-8 text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Profile Updated Successfully!</h3>
              <p className="text-xs text-zinc-500">Your updated identity and details have been synchronized across ConnectIn.</p>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-4 pt-2 text-xs">
              {/* Profile Photo & Cover Attachment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5 text-[#0A66C2]" /> Profile Avatar Photo
                  </label>
                  <div className="flex items-center gap-2">
                    <img src={editAvatar || user.avatar} alt="Avatar" className="h-10 w-10 rounded-full object-cover border-2 border-[#0A66C2] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={editAvatar}
                        onChange={(e) => setEditAvatar(e.target.value)}
                        placeholder="https://... or choose file"
                        className="w-full text-[11px] rounded-lg border border-zinc-300 p-1.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => editAvatarFileInputRef.current?.click()}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[#0A66C2] text-white hover:bg-[#004182] flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="h-3 w-3" /> Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditProfileOpen(false)
                        setPhotoModalTab('avatar')
                        setIsPhotoModalOpen(true)
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1 cursor-pointer"
                    >
                      ✂️ Trim &amp; Fit
                    </button>
                    <input
                      type="file"
                      ref={editAvatarFileInputRef}
                      onChange={handleEditAvatarFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-[#0A66C2]" /> Cover Banner Image
                  </label>
                  <div className="flex items-center gap-2">
                    <img src={editCover || user.coverImage || "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80"} alt="Cover" className="h-10 w-16 rounded-md object-cover border border-zinc-300 dark:border-zinc-700 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={editCover}
                        onChange={(e) => setEditCover(e.target.value)}
                        placeholder="https://... or choose file"
                        className="w-full text-[11px] rounded-lg border border-zinc-300 p-1.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => editCoverFileInputRef.current?.click()}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-zinc-700 text-white hover:bg-zinc-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="h-3 w-3" /> Upload File
                    </button>
                    <input
                      type="file"
                      ref={editCoverFileInputRef}
                      onChange={handleEditCoverFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Emmanuel Asiedu"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">Professional Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Principal Cloud Security Architect &amp; Zero Trust Lead"
                  value={editHeadline}
                  onChange={(e) => setEditHeadline(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Washington DC-Baltimore Area · Cryptographically Verified"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">About / Bio</label>
                <textarea
                  rows={4}
                  placeholder="Describe your architectural background, career accomplishments, and technical specialties..."
                  value={editAbout}
                  onChange={(e) => setEditAbout(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="rounded-lg bg-zinc-200 px-4 py-2 font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0A66C2] hover:bg-[#004182] px-5 py-2 font-bold text-white shadow-md transition-colors cursor-pointer"
                >
                  Save Profile ✓
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dedicated Profile & Cover Photo Attachment + Interactive Trim/Fit Dialog */}
      <Dialog
        open={isPhotoModalOpen}
        onOpenChange={(open) => {
          setIsPhotoModalOpen(open)
          if (!open) {
            setIsDraggingAvatar(false)
            setIsDraggingCover(false)
          }
        }}
      >
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-5 sm:p-6 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Camera className="h-5 w-5 text-[#0A66C2]" />
              <span>{photoModalTab === 'avatar' ? 'Attach & Trim Profile Picture' : 'Attach & Trim Cover Banner'}</span>
            </DialogTitle>
          </DialogHeader>

          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 text-xs font-bold mt-1">
            <button
              type="button"
              onClick={() => setPhotoModalTab('avatar')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                photoModalTab === 'avatar'
                  ? "bg-white dark:bg-zinc-900 text-[#0A66C2] dark:text-sky-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              👤 Profile Photo
            </button>
            <button
              type="button"
              onClick={() => setPhotoModalTab('cover')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                photoModalTab === 'cover'
                  ? "bg-white dark:bg-zinc-900 text-[#0A66C2] dark:text-sky-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              🖼️ Cover Banner
            </button>
          </div>

          {photoModalTab === 'avatar' ? (
            <div className="space-y-3.5 pt-1">
              {/* Interactive Draggable & Zoomable Circular Crop Frame */}
              <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div
                  onMouseDown={(e) => {
                    e.preventDefault()
                    setIsDraggingAvatar(true)
                    avatarDragStartRef.current = {
                      x: e.clientX,
                      y: e.clientY,
                      startX: avatarOffsetX,
                      startY: avatarOffsetY
                    }
                  }}
                  onMouseMove={(e) => {
                    if (!isDraggingAvatar || !avatarDragStartRef.current) return
                    const dx = e.clientX - avatarDragStartRef.current.x
                    const dy = e.clientY - avatarDragStartRef.current.y
                    setAvatarOffsetX(Math.max(-90, Math.min(90, Math.round(avatarDragStartRef.current.startX + dx))))
                    setAvatarOffsetY(Math.max(-90, Math.min(90, Math.round(avatarDragStartRef.current.startY + dy))))
                  }}
                  onMouseUp={() => setIsDraggingAvatar(false)}
                  onMouseLeave={() => setIsDraggingAvatar(false)}
                  onTouchStart={(e) => {
                    const touch = e.touches[0]
                    if (!touch) return
                    setIsDraggingAvatar(true)
                    avatarDragStartRef.current = {
                      x: touch.clientX,
                      y: touch.clientY,
                      startX: avatarOffsetX,
                      startY: avatarOffsetY
                    }
                  }}
                  onTouchMove={(e) => {
                    if (!isDraggingAvatar || !avatarDragStartRef.current) return
                    const touch = e.touches[0]
                    if (!touch) return
                    const dx = touch.clientX - avatarDragStartRef.current.x
                    const dy = touch.clientY - avatarDragStartRef.current.y
                    setAvatarOffsetX(Math.max(-90, Math.min(90, Math.round(avatarDragStartRef.current.startX + dx))))
                    setAvatarOffsetY(Math.max(-90, Math.min(90, Math.round(avatarDragStartRef.current.startY + dy))))
                  }}
                  onTouchEnd={() => setIsDraggingAvatar(false)}
                  className="relative h-36 w-36 rounded-full overflow-hidden border-4 border-[#0A66C2] shadow-lg bg-slate-800 cursor-grab active:cursor-grabbing select-none touch-none"
                  title="Drag photo with mouse or finger to reposition inside circle"
                >
                  <img
                    src={pendingAvatarSrc || user.avatar}
                    alt={user.name}
                    draggable={false}
                    style={{
                      transform: `translate(${avatarOffsetX}px, ${avatarOffsetY}px) scale(${avatarZoom}) rotate(${avatarRotate}deg)`,
                      transformOrigin: "center center"
                    }}
                    className="h-full w-full object-cover pointer-events-none transition-transform duration-75"
                  />
                  {/* Subtle framing crosshair ring */}
                  <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/30" />
                </div>

                <div className="text-center">
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{user.name}</p>
                  <p className="text-[11px] text-[#0A66C2] dark:text-sky-400 font-semibold">
                    ✋ Drag photo to reposition · Zoom {Math.round(avatarZoom * 100)}%
                  </p>
                </div>

                {/* 1-Click Quick Fit Presets */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 w-full pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarZoom(0.82)
                      setAvatarOffsetX(0)
                      setAvatarOffsetY(14)
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs cursor-pointer transition-all"
                    title="Zoom out slightly and shift down so your full head and glasses fit cleanly in the circle"
                  >
                    ✨ Fit Full Headshot
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarZoom(0.68)
                      setAvatarOffsetX(0)
                      setAvatarOffsetY(10)
                    }}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-[#0A66C2] dark:text-sky-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold cursor-pointer transition-all"
                  >
                    🖼️ Fit Whole Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarRotate((prev) => (prev + 90) % 360)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-200/80 dark:bg-zinc-700 hover:bg-zinc-300 text-zinc-700 dark:text-zinc-200 text-[11px] font-bold cursor-pointer transition-all"
                  >
                    🔄 Rotate 90°
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarZoom(1)
                      setAvatarOffsetX(0)
                      setAvatarOffsetY(0)
                      setAvatarRotate(0)
                    }}
                    className="px-2.5 py-1 rounded-lg bg-zinc-200/80 dark:bg-zinc-700 hover:bg-zinc-300 text-zinc-700 dark:text-zinc-200 text-[11px] font-bold cursor-pointer transition-all"
                  >
                    ↺ Reset
                  </button>
                </div>

                {/* Fine-Tune Trim Sliders (Zoom, Vertical Position, Horizontal Position) */}
                <div className="w-full space-y-2 pt-1.5 border-t border-zinc-200/70 dark:border-zinc-700/70 text-[11px]">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between font-bold text-zinc-700 dark:text-zinc-300">
                      <span>🔍 Zoom / Trim to Fit</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setAvatarZoom(z => Math.max(0.55, Number((z - 0.08).toFixed(2))))}
                          className="h-5 w-5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 font-black flex items-center justify-center cursor-pointer"
                        >
                          −
                        </button>
                        <span className="font-mono text-[10px] w-10 text-center">{Math.round(avatarZoom * 100)}%</span>
                        <button
                          type="button"
                          onClick={() => setAvatarZoom(z => Math.min(2.4, Number((z + 0.08).toFixed(2))))}
                          className="h-5 w-5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 font-black flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0.55"
                      max="2.4"
                      step="0.02"
                      value={avatarZoom}
                      onChange={(e) => setAvatarZoom(parseFloat(e.target.value))}
                      className="w-full accent-[#0A66C2] cursor-pointer h-1.5"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between font-semibold text-zinc-600 dark:text-zinc-300">
                        <span>↕️ Up / Down</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setAvatarOffsetY(y => Math.max(-90, y - 6))}
                            className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-[10px] font-bold cursor-pointer"
                            title="Move photo up"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => setAvatarOffsetY(y => Math.min(90, y + 6))}
                            className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-[10px] font-bold cursor-pointer"
                            title="Move photo down so forehead fits"
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="-90"
                        max="90"
                        step="1"
                        value={avatarOffsetY}
                        onChange={(e) => setAvatarOffsetY(parseInt(e.target.value, 10))}
                        className="w-full accent-[#0A66C2] cursor-pointer h-1.5"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between font-semibold text-zinc-600 dark:text-zinc-300">
                        <span>↔️ Left / Right</span>
                        <span className="font-mono text-[10px] text-zinc-400">{avatarOffsetX}px</span>
                      </div>
                      <input
                        type="range"
                        min="-90"
                        max="90"
                        step="1"
                        value={avatarOffsetX}
                        onChange={(e) => setAvatarOffsetX(parseInt(e.target.value, 10))}
                        className="w-full accent-[#0A66C2] cursor-pointer h-1.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Save & Apply Trimmed Photo Button */}
                <button
                  type="button"
                  onClick={handleSaveTrimmedAvatar}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Save &amp; Apply Fitted Picture to Profile ✓</span>
                </button>
              </div>

              {/* Option 1: Upload from device */}
              <div>
                <input
                  type="file"
                  ref={avatarFileInputRef}
                  onChange={handleAvatarFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload New Photo from Computer / Phone</span>
                </button>
              </div>

              {/* Option 2: Enter direct image URL */}
              <div className="space-y-1.5 pt-0.5">
                <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">Or Paste Image URL:</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customAvatarUrl.trim()) {
                        const url = customAvatarUrl.trim()
                        setPendingAvatarSrc(url)
                        if (isAccountOwner) savePersistentAvatar(url, user)
                        const updated: UserProfile = { ...user, avatar: url }
                        persistWorkspaceUserProfile(updated)
                        if (onUpdateUser) {
                          onUpdateUser(updated)
                        }
                        setCustomAvatarUrl("")
                      }
                    }}
                    disabled={!customAvatarUrl.trim()}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-black text-white text-xs font-bold cursor-pointer disabled:opacity-40"
                  >
                    Load
                  </button>
                </div>
              </div>

              {/* Option 3: Executive Headshot Presets */}
              <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">Choose Executive Preset:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: "Cyber Arch", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80" },
                    { name: "Principal Eng", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80" },
                    { name: "Executive", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80" },
                    { name: "Craftsman", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80" },
                    { name: "Clinical Lead", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80" },
                    { name: "Initials Badge", url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=0a66c2` }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleUpdateAvatar(preset.url)}
                      className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-[#0A66C2] flex flex-col items-center gap-1 transition-all cursor-pointer hover:bg-blue-50 dark:hover:bg-zinc-800"
                    >
                      <img src={preset.url} alt={preset.name} className="h-10 w-10 rounded-full object-cover" />
                      <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[80px]">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {/* Interactive Draggable & Zoomable Cover Preview */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div
                  onMouseDown={(e) => {
                    e.preventDefault()
                    setIsDraggingCover(true)
                    coverDragStartRef.current = {
                      x: e.clientX,
                      y: e.clientY,
                      startX: coverOffsetX,
                      startY: coverOffsetY
                    }
                  }}
                  onMouseMove={(e) => {
                    if (!isDraggingCover || !coverDragStartRef.current) return
                    const dx = e.clientX - coverDragStartRef.current.x
                    const dy = e.clientY - coverDragStartRef.current.y
                    setCoverOffsetX(Math.max(-140, Math.min(140, Math.round(coverDragStartRef.current.startX + dx))))
                    setCoverOffsetY(Math.max(-100, Math.min(100, Math.round(coverDragStartRef.current.startY + dy))))
                  }}
                  onMouseUp={() => setIsDraggingCover(false)}
                  onMouseLeave={() => setIsDraggingCover(false)}
                  className="relative h-28 w-full rounded-xl overflow-hidden border-2 border-[#0A66C2] bg-slate-800 cursor-grab active:cursor-grabbing select-none"
                >
                  <img
                    src={pendingCoverSrc || user.coverImage || "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80"}
                    alt="Cover Banner"
                    draggable={false}
                    style={{
                      transform: `translate(${coverOffsetX}px, ${coverOffsetY}px) scale(${coverZoom})`,
                      transformOrigin: "center center"
                    }}
                    className="h-full w-full object-cover pointer-events-none transition-transform duration-75"
                  />
                </div>
                <p className="text-[11px] text-[#0A66C2] dark:text-sky-400 font-semibold text-center">
                  ✋ Drag banner to reposition · Zoom {Math.round(coverZoom * 100)}%
                </p>

                {/* Cover Trim Sliders */}
                <div className="space-y-2 pt-1 border-t border-zinc-200/70 dark:border-zinc-700/70 text-[11px]">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between font-bold text-zinc-700 dark:text-zinc-300">
                      <span>🔍 Banner Zoom / Fit</span>
                      <span className="font-mono text-[10px]">{Math.round(coverZoom * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="2.4"
                      step="0.02"
                      value={coverZoom}
                      onChange={(e) => setCoverZoom(parseFloat(e.target.value))}
                      className="w-full accent-[#0A66C2] cursor-pointer h-1.5"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <span className="font-semibold text-zinc-600 dark:text-zinc-300">↕️ Vertical Fit</span>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        step="1"
                        value={coverOffsetY}
                        onChange={(e) => setCoverOffsetY(parseInt(e.target.value, 10))}
                        className="w-full accent-[#0A66C2] cursor-pointer h-1.5"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="font-semibold text-zinc-600 dark:text-zinc-300">↔️ Horizontal Fit</span>
                      <input
                        type="range"
                        min="-140"
                        max="140"
                        step="1"
                        value={coverOffsetX}
                        onChange={(e) => setCoverOffsetX(parseInt(e.target.value, 10))}
                        className="w-full accent-[#0A66C2] cursor-pointer h-1.5"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveTrimmedCover}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Save &amp; Apply Fitted Banner to Profile ✓</span>
                </button>
              </div>

              {/* Option 1: Upload from device */}
              <div>
                <input
                  type="file"
                  ref={coverFileInputRef}
                  onChange={handleCoverFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Cover Banner from Computer / Phone</span>
                </button>
              </div>

              {/* Option 2: Enter direct image URL */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">Or Paste Banner URL:</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customCoverUrl}
                    onChange={(e) => setCustomCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customCoverUrl.trim()) {
                        setPendingCoverSrc(customCoverUrl.trim())
                        setCustomCoverUrl("")
                      }
                    }}
                    disabled={!customCoverUrl.trim()}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-black text-white text-xs font-bold cursor-pointer disabled:opacity-40"
                  >
                    Load
                  </button>
                </div>
              </div>

              {/* Option 3: Executive Cover Presets */}
              <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">Choose Professional Banner Preset:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "DoD Cyber Ops", url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80" },
                    { name: "Classic Blue", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80" },
                    { name: "Blueprint Architecture", url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&auto=format&fit=crop&q=80" },
                    { name: "Enterprise Campus", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80" }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleUpdateCover(preset.url)}
                      className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-[#0A66C2] flex flex-col items-center gap-1 transition-all cursor-pointer hover:bg-blue-50 dark:hover:bg-zinc-800"
                    >
                      <img src={preset.url} alt={preset.name} className="h-12 w-full rounded-lg object-cover" />
                      <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 truncate w-full text-center">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resume Upload & Experience Builder Modal */}
      <ResumeUploadModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        onApplyExperience={handleApplyResumeExperience}
        currentHeadline={user.headline}
        currentEnclave={effectiveEnclaveId}
      />

      {/* Share Profile Dialog (WhatsApp, LinkedIn, Copy, etc.) */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="max-w-md rounded-3xl bg-white p-5 sm:p-6 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Share2 className="h-5 w-5 text-[#0A66C2]" />
              <span>Share Profile &amp; Workspace</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs">
            {/* User Card Preview */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
              <img
                src={user.avatar}
                alt={user.name}
                className="h-12 w-12 rounded-full object-cover border-2 border-[#0A66C2] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">{user.name}</p>
                <p className="text-[11px] text-zinc-500 truncate">{user.headline}</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Verified ConnectIn Member</p>
              </div>
            </div>

            {/* 1-Click Branded Social Networks Grid */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">Choose Social Channel to Share:</label>
              
              <div className="grid grid-cols-2 gap-2">
                {/* 1. WhatsApp */}
                <button
                  type="button"
                  onClick={handleShareToWhatsApp}
                  className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.181-.076.354.101.173.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.348 21.652l4.636-1.04A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.63 0-3.14-.492-4.404-1.336l-.315-.21-2.753.618.63-2.683-.231-.328A8.212 8.212 0 013.75 12c0-4.549 3.701-8.25 8.25-8.25s8.25 3.701 8.25 8.25-3.701 8.25-8.25 8.25z" />
                  </svg>
                  <span>WhatsApp</span>
                </button>

                {/* 2. Facebook */}
                <button
                  type="button"
                  onClick={handleShareToFacebook}
                  className="py-2.5 px-3 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </button>

                {/* 3. X (formerly Twitter) */}
                <button
                  type="button"
                  onClick={handleShareToTwitter}
                  className="py-2.5 px-3 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] border border-zinc-800"
                >
                  <span className="font-black text-sm">𝕏</span>
                  <span>Post on 𝕏</span>
                </button>

                {/* 4. Instagram */}
                <button
                  type="button"
                  onClick={handleShareToInstagram}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-95 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span>Instagram</span>
                </button>

                {/* 5. LinkedIn */}
                <button
                  type="button"
                  onClick={handleShareToLinkedIn}
                  className="py-2.5 px-3 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="font-black text-sm">in</span>
                  <span>LinkedIn</span>
                </button>

                {/* 6. Email */}
                <button
                  type="button"
                  onClick={handleShareToEmail}
                  className="py-2.5 px-3 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>✉️</span>
                  <span>Email / Mail</span>
                </button>
              </div>
            </div>

            {/* Quick Copy Link Box */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">Copy Direct Profile Link:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== "undefined" ? `${window.location.origin}/connectin` : "https://sphera-portal.vercel.app/connectin"}
                  className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 font-mono"
                />
                <button
                  type="button"
                  onClick={handleCopyProfileLink}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1 ${
                    shareCopied ? "bg-emerald-600" : "bg-[#0A66C2] hover:bg-[#004182]"
                  }`}
                >
                  {shareCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <span>Copy</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Add / Edit Experience Modal */}
      <ExperienceFormModal
        isOpen={isExpFormModalOpen}
        onClose={() => {
          setIsExpFormModalOpen(false)
          setEditingExperience(null)
        }}
        onSave={handleSaveManualExperience}
        initialData={editingExperience}
      />
    </div>
  )
}
