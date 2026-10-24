"use client"

import React, { useState, useRef } from "react"
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
  RefreshCw
} from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { ResumeUploadModal } from "./ResumeUploadModal"
import { ExperienceFormModal } from "./ExperienceFormModal"
import { ParsedExperience, DEMO_RESUME_PRESETS } from "@/lib/resume-parser"
import { UserProfile } from "@/lib/linkedin-data"
import {
  WORKSPACE_PORTFOLIO_DATA,
  WORKSPACE_VERIFIED_SKILLS_DATA,
  WORKSPACE_CERTIFICATIONS_DATA,
  WORKSPACE_EXPERIENCE_DATA,
  WORKSPACE_PUBLICATIONS_DATA,
  WORKSPACE_REVIEWS_DATA,
  MY_PRODUCTS_DATA,
  VendorProductItem,
  getWorkspaceDataForEnclave
} from "@/lib/my-workspace-data"
import { findEnclaveById } from "@/lib/connectin-professions"
import { TradeEnclaveWidgets } from "./TradeEnclaveWidgets"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createUniqueUserProfile } from "@/lib/connectin-profile"
import { saveStoredUser, savePersistentAvatar, savePersistentCover } from "@/lib/connectin-storage"
import {
  ProfileViewerItem,
  ContentReachData,
  DirectoryDiscoveryData,
  loadStoredProfileViewers,
  saveStoredProfileViewers,
  loadStoredContentReach,
  loadStoredDirectoryDiscoveries,
  recordProfileView
} from "@/lib/connectin-analytics"
import { getQualifiedJobsForSkills, SkillQualifiedJob } from "@/lib/skill-qualified-jobs"

interface ProfileViewProps {
  user: UserProfile
  onBackToFeed?: () => void
  onNavigateMarketplace?: () => void
  onNavigateJobs?: (searchKeyword?: string) => void
  onUpdateUser?: (updated: UserProfile) => void
  onOpenAnalytics?: (tab: 'viewers' | 'reach' | 'discoveries') => void
  onNavigateMessaging?: (personName?: string) => void
}

export function ProfileView({
  user,
  onBackToFeed,
  onNavigateMarketplace,
  onNavigateJobs,
  onUpdateUser,
  onOpenAnalytics,
  onNavigateMessaging
}: ProfileViewProps) {
  const { t } = useLanguage()
  const effectiveEnclaveId = user.professionEnclave || 'trades_construction'
  const enclaveInfo = findEnclaveById(effectiveEnclaveId)
  const enclaveWorkspace = getWorkspaceDataForEnclave(effectiveEnclaveId)

  // Resume & Experience Builder State
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)
  const [isExpFormModalOpen, setIsExpFormModalOpen] = useState(false)
  const [editingExperience, setEditingExperience] = useState<ParsedExperience | null>(null)
  const [resumeSuccessBanner, setResumeSuccessBanner] = useState<string | null>(null)

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
    }
  ) => {
    const formattedNewExp = newExperiences.map(e => ({
      id: e.id,
      role: e.role,
      company: e.company,
      companyLogo: e.companyLogo || 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=100&auto=format&fit=crop&q=80',
      employmentType: e.employmentType || 'Full-time',
      duration: e.duration,
      location: e.location,
      description: e.description,
      skills: e.skills
    }))

    const finalExperiences = options.appendMode && user.experience && user.experience.length > 0
      ? [...user.experience, ...formattedNewExp]
      : formattedNewExp

    const updatedUser: UserProfile = {
      ...user,
      experience: finalExperiences,
      headline: options.updateHeadline && options.newHeadline ? options.newHeadline : user.headline,
      about: options.updateAbout && options.newAbout ? options.newAbout : user.about,
    }

    if (options.updateSkills && options.extractedSkills && options.extractedSkills.length > 0) {
      const existingSkillNames = (user.skills || []).map(s => s.name.toLowerCase())
      const additionalSkills = options.extractedSkills
        .filter(s => !existingSkillNames.includes(s.toLowerCase()))
        .map(s => ({ name: s, endorsements: 1, endorsers: ['Verified Resume NLP'] }))
      updatedUser.skills = [...(user.skills || []), ...additionalSkills]
    }

    saveStoredUser(updatedUser)
    if (onUpdateUser) {
      onUpdateUser(updatedUser)
    }

    // Immediately close modal and switch to the Experience section of the workspace
    setIsResumeModalOpen(false)
    setWorkspaceSection('experience')

    setResumeSuccessBanner(`🎉 Successfully saved ${newExperiences.length} career positions to your Workspace experience!`)
    setTimeout(() => setResumeSuccessBanner(null), 6000)

    // Smooth scroll down to the experience section
    if (typeof window !== "undefined") {
      setTimeout(() => {
        const el = document.getElementById("workspace-experience-section")
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }, 100)
    }
  }

  const handleSaveManualExperience = (exp: ParsedExperience) => {
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

    saveStoredUser(updatedUser)
    if (onUpdateUser) {
      onUpdateUser(updatedUser)
    }
    setEditingExperience(null)
  }

  const handleDeleteExperience = (expId: string) => {
    const nextExpList = (user.experience || []).filter(e => e.id !== expId)
    const updatedUser: UserProfile = {
      ...user,
      experience: nextExpList
    }
    saveStoredUser(updatedUser)
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

  // 9 Workspace Sub-Sections
  const [workspaceSection, setWorkspaceSection] = useState<
    'profile' | 'portfolio' | 'skills' | 'certifications' | 'experience' | 'publications' | 'reviews' | 'products' | 'analytics'
  >('profile')

  const [analyticsSubTab, setAnalyticsSubTab] = useState<'viewers' | 'reach' | 'discoveries'>('viewers')
  const [viewers, setViewers] = useState<ProfileViewerItem[]>(() => loadStoredProfileViewers())
  const [reachData, setReachData] = useState<ContentReachData>(() => loadStoredContentReach())
  const [discoveryData, setDiscoveryData] = useState<DirectoryDiscoveryData>(() => loadStoredDirectoryDiscoveries())
  const [viewerCategoryFilter, setViewerCategoryFilter] = useState<'all' | 'recruiter' | 'buyer' | 'peer' | 'executive'>('all')
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedTrendDay, setSelectedTrendDay] = useState<string | null>(null)

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

  // Photo & Cover Attachment State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
  const [photoModalTab, setPhotoModalTab] = useState<'avatar' | 'cover'>('avatar')
  const [customAvatarUrl, setCustomAvatarUrl] = useState("")
  const [customCoverUrl, setCustomCoverUrl] = useState("")
  const [photoSuccessMsg, setPhotoSuccessMsg] = useState<string | null>(null)

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

  const compressImageFile = (
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number = 0.86
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

  const handleUpdateAvatar = (newAvatarUrl: string) => {
    savePersistentAvatar(newAvatarUrl, user)
    const updated: UserProfile = {
      ...user,
      avatar: newAvatarUrl
    }
    saveStoredUser(updated)
    if (onUpdateUser) {
      onUpdateUser(updated)
    }
    setEditAvatar(newAvatarUrl)
    setPhotoSuccessMsg("Profile picture saved permanently to your isolated account vault!")
    setTimeout(() => setPhotoSuccessMsg(null), 4000)
    setIsPhotoModalOpen(false)
  }

  const handleUpdateCover = (newCoverUrl: string) => {
    savePersistentCover(newCoverUrl, user)
    const updated: UserProfile = {
      ...user,
      coverImage: newCoverUrl
    }
    saveStoredUser(updated)
    if (onUpdateUser) {
      onUpdateUser(updated)
    }
    setEditCover(newCoverUrl)
    setPhotoSuccessMsg("Cover photo saved permanently to your isolated account vault!")
    setTimeout(() => setPhotoSuccessMsg(null), 4000)
    setIsPhotoModalOpen(false)
  }

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await compressImageFile(file, 560, 560, 0.86)
    if (dataUrl) {
      handleUpdateAvatar(dataUrl)
    }
  }

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await compressImageFile(file, 1400, 500, 0.85)
    if (dataUrl) {
      handleUpdateCover(dataUrl)
    }
  }

  const handleEditAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await compressImageFile(file, 560, 560, 0.86)
    if (dataUrl) {
      setEditAvatar(dataUrl)
      savePersistentAvatar(dataUrl, user)
    }
  }

  const handleEditCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await compressImageFile(file, 1400, 500, 0.85)
    if (dataUrl) {
      setEditCover(dataUrl)
      savePersistentCover(dataUrl, user)
    }
  }

  // WhatsApp & Multi-Social Share State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  const getProfileSharePayload = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://sphera-portal.vercel.app"
    const profileUrl = `${origin}/connectin`
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

  // Developer / Company Products State
  const [myProducts, setMyProducts] = useState<VendorProductItem[]>(MY_PRODUCTS_DATA)
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)
  const [newProductName, setNewProductName] = useState("")
  const [newProductCategory, setNewProductCategory] = useState<'Software' | 'Training' | 'Services' | 'Enterprise Solutions'>('Software')
  const [newProductPrice, setNewProductPrice] = useState("")
  const [productAddedSuccess, setProductAddedSuccess] = useState(false)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
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
      savePersistentAvatar(resolvedAvatar, updated)
    }
    if (resolvedCover) {
      savePersistentCover(resolvedCover, updated)
    }

    saveStoredUser(updated)
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

  const handleEndorseSkill = (skillName: string) => {
    setSkills(prev =>
      prev.map(s => (s.name === skillName ? { ...s, endorsementsCount: s.endorsementsCount + 1 } : s))
    )
    setSkillEndorsementBonuses(prev => ({
      ...prev,
      [skillName]: (prev[skillName] || 0) + 1
    }))
    if (user.skills && user.skills.length > 0) {
      const updatedSkills = user.skills.map((s: any) => {
        const sName = typeof s === 'string' ? s : s.name
        if (sName === skillName) {
          const currentCount = typeof s === 'object' ? (s.endorsements || s.endorsementsCount || 52) : 52
          return {
            ...(typeof s === 'object' ? s : { name: sName, endorsers: [] }),
            name: sName,
            endorsements: currentCount + 1
          }
        }
        return s
      })
      const updatedUser: UserProfile = { ...user, skills: updatedSkills }
      saveStoredUser(updatedUser)
      if (onUpdateUser) onUpdateUser(updatedUser)
    }
  }

  const handleAddVerifiedSkill = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newVerifiedSkillName.trim()
    if (!trimmed) return
    const existingSkills = user.skills && user.skills.length > 0
      ? user.skills
      : enclaveWorkspace.verifiedSkills.map(vs => ({
          name: vs.name,
          endorsements: vs.endorsementsCount || 52,
          endorsers: [vs.verifiedBy]
        }))
    if (!existingSkills.some((s: any) => (typeof s === 'string' ? s : s.name).toLowerCase() === trimmed.toLowerCase())) {
      const updatedUser: UserProfile = {
        ...user,
        skills: [
          ...existingSkills,
          { name: trimmed, endorsements: 52, endorsers: [`${enclaveInfo?.name || 'ConnectIn'} Master Board`] }
        ]
      }
      saveStoredUser(updatedUser)
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

  const handleCreateProductListing = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProductName.trim()) return

    const newProd: VendorProductItem = {
      id: 'prod_' + Date.now(),
      name: newProductName.trim(),
      category: newProductCategory,
      icon: newProductCategory === 'Software' ? '🛡️' : newProductCategory === 'Training' ? '🎓' : '⚡',
      pricingModel: 'Monthly Subscription',
      price: newProductPrice.trim() || '$299 / mo',
      activeLicensesCount: 1,
      activeTrialsCount: 5,
      mrrOrRevenue: '$299 / mo MRR',
      rating: 5.0,
      reviewsCount: 1,
      status: 'Active Listing',
      leadsCount: 3
    }

    setMyProducts(prev => [newProd, ...prev])
    setProductAddedSuccess(true)
    setTimeout(() => {
      setIsAddProductModalOpen(false)
      setProductAddedSuccess(false)
      setNewProductName("")
      setNewProductPrice("")
    }, 1500)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20">
      {/* 1. TOP MY WORKSPACE COMMAND BAR */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 text-zinc-900 dark:text-zinc-100 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full px-3 py-0.5 text-xs font-semibold border flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/50 text-[#0A66C2] dark:text-sky-300 border-blue-200/60 dark:border-blue-800/60">
                <span>{enclaveInfo?.icon || '🛡️'}</span>
                <span>{enclaveInfo?.name || 'ConnectIn Professional Workspace'}</span>
              </span>
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                Verified Professional
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              My Workspace &amp; Identity
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Manage your professional profile, work experience, verified skills, certifications, peer reviews, and your seller listings.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 p-3.5 text-center min-w-[130px]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400">Seller MRR</span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">$122.7K</p>
              <span className="text-[10px] text-zinc-400">4 Active Listings</span>
            </div>
            <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 p-3.5 text-center min-w-[130px]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400">Rating</span>
              <p className="text-xl font-black text-amber-500">4.98 ⭐</p>
              <span className="text-[10px] text-zinc-400">127 Reviews</span>
            </div>
          </div>
        </div>

        {/* Workspace Sections Switcher Ribbon */}
        <div className="mt-5 pt-3.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'profile', label: '👤 Profile' },
            { id: 'analytics', label: '📊 Analytics' },
            { id: 'portfolio', label: '💼 Portfolio' },
            { id: 'skills', label: '🛡️ Skills' },
            { id: 'certifications', label: '📜 Certifications' },
            { id: 'experience', label: '🏛️ Experience' },
            { id: 'publications', label: '📑 Publications' },
            { id: 'reviews', label: '⭐ Reviews' },
            { id: 'products', label: '🛍️ My Products' }
          ].map((sec) => {
            const isSelected = workspaceSection === sec.id
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setWorkspaceSection(sec.id as any)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-[#0A66C2] text-white font-semibold shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 border border-zinc-200/70 dark:border-zinc-700/70"
                }`}
              >
                <span>{sec.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PROFILE IDENTITY VIEW */}
      {/* ========================================================================= */}
      {workspaceSection === 'profile' && (
        <div className="space-y-5">
          {photoSuccessMsg && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 p-3 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{photoSuccessMsg}</span>
              </span>
              <button onClick={() => setPhotoSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700 cursor-pointer">✕</button>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            {/* Banner Cover */}
            <div className="relative h-44 w-full bg-gradient-to-r from-[#0A66C2] via-indigo-700 to-purple-800 overflow-hidden group">
              <img
                src={user.coverImage || "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80"}
                alt="Banner"
                className="h-full w-full object-cover opacity-75"
              />
              {/* Button to attach / change cover picture */}
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
            </div>

            {/* Profile Avatar & Primary Details */}
            <div className="relative px-6 pb-6 pt-3">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <div className="relative group shrink-0 -mt-16">
                    <div className="relative h-28 w-28 rounded-2xl border-4 border-white bg-white shadow-xl overflow-hidden dark:border-zinc-900">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                      {/* Hover Overlay Button to Change Avatar */}
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
                    </div>

                    {/* Camera icon badge at bottom right */}
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoModalTab('avatar')
                        setIsPhotoModalOpen(true)
                      }}
                      className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white flex items-center justify-center shadow-md border-2 border-white dark:border-zinc-900 cursor-pointer transition-transform hover:scale-110"
                      title="Upload or Change Profile Photo"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                        {user.name}
                      </h2>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border flex items-center gap-1.5 ${enclaveInfo?.badgeBg || 'bg-blue-100 text-[#0A66C2] dark:bg-blue-950 dark:text-blue-300'}`}>
                        <span>{enclaveInfo?.icon || '🛡️'}</span>
                        <span>{user.profession || enclaveInfo?.shortName || 'Verified Member'}</span>
                      </span>
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        {enclaveInfo?.securityClearanceTier || 'Level 2 Verified'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                      {user.headline}
                    </p>
                    <p className="text-xs text-zinc-500 flex items-center gap-2 flex-wrap">
                      <span>📍 {user.location}</span>
                      <span>·</span>
                      <span className="text-[#0A66C2] font-semibold">{(user.connectionsCount ?? 0)} connections</span>
                      <span>·</span>
                      <span className="text-emerald-600 font-bold">{(user as any).clearanceLevel || "Cryptographically Verified"}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {/* Direct 1-Click WhatsApp Share Button */}
                  <button
                    type="button"
                    onClick={handleShareToWhatsApp}
                    className="rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white px-3.5 py-2 text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
                    title="Share profile directly to WhatsApp friends"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.181-.076.354.101.173.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.348 21.652l4.636-1.04A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.63 0-3.14-.492-4.404-1.336l-.315-.21-2.753.618.63-2.683-.231-.328A8.212 8.212 0 013.75 12c0-4.549 3.701-8.25 8.25-8.25s8.25 3.701 8.25 8.25-3.701 8.25-8.25 8.25z" />
                    </svg>
                    <span>Share on WhatsApp</span>
                  </button>

                  {/* Share Menu Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-3.5 py-2 text-xs font-bold border border-zinc-200 dark:border-zinc-700 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Share Profile Link & Channels"
                  >
                    <Share2 className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                    <span>Share</span>
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
                    className="rounded-full bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/60 px-4 py-2 text-xs font-bold text-[#0A66C2] dark:text-sky-300 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => setWorkspaceSection('products')}
                    className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Store className="h-3.5 w-3.5" />
                    <span>Manage My Products</span>
                  </button>
                </div>
              </div>

              {/* Bio & Statement */}
              <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  About &amp; Architectural Focus
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-4xl">
                  {user.about}
                </p>
              </div>

              {/* PROFESSIONAL REPUTATION INDEX & 5-LEVEL VERIFICATION HIERARCHY */}
              <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white shadow-md space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-mono text-purple-300 font-bold">
                        ⚡ Evidence-Based Credibility Index
                      </span>
                      <h4 className="text-base font-black text-white flex items-center gap-2">
                        <span>Professional Reputation Index</span>
                        <span className="text-emerald-400 font-mono text-lg">94 / 100</span>
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
                      <span className="rounded-md bg-white/10 px-2 py-1">Skills: <strong>96</strong></span>
                      <span className="rounded-md bg-white/10 px-2 py-1">Credentials: <strong>98</strong></span>
                      <span className="rounded-md bg-white/10 px-2 py-1">Projects: <strong>95</strong></span>
                      <span className="rounded-md bg-white/10 px-2 py-1">Experience: <strong>92</strong></span>
                      <span className="rounded-md bg-white/10 px-2 py-1">Reviews: <strong>91</strong></span>
                      <span className="rounded-md bg-white/10 px-2 py-1">Community: <strong>89</strong></span>
                    </div>
                  </div>

                  {/* 5-Level Verification Progression */}
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <span className="text-[10px] uppercase font-mono text-zinc-400">
                      5-Level Verification Progression:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-center text-[10px] font-mono">
                      <div className="rounded-lg bg-emerald-500/20 text-emerald-300 p-1.5 border border-emerald-500/40">1. Self-Reported ✓</div>
                      <div className="rounded-lg bg-emerald-500/20 text-emerald-300 p-1.5 border border-emerald-500/40">2. Assessment ✓</div>
                      <div className="rounded-lg bg-emerald-500/20 text-emerald-300 p-1.5 border border-emerald-500/40">3. Credentialed ✓</div>
                      <div className="rounded-lg bg-emerald-500/20 text-emerald-300 p-1.5 border border-emerald-500/40">4. Employer ✓</div>
                      <div className="rounded-lg bg-purple-500/30 text-purple-200 font-bold p-1.5 border border-purple-400/50">5. Fellow Verified ★</div>
                    </div>
                  </div>
                </div>

                {/* ANALYTICS & IDENTITY RADAR STRIP */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-[#0A66C2]" />
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        Live Analytics &amp; Identity Radar
                      </h4>
                    </div>
                    <button
                      onClick={() => setWorkspaceSection('analytics')}
                      className="text-xs font-bold text-[#0A66C2] dark:text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <span>Full Analytics Dashboard</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div
                      onClick={() => onOpenAnalytics ? onOpenAnalytics('viewers') : (setWorkspaceSection('analytics'), setAnalyticsSubTab('viewers'))}
                      className="rounded-xl border border-blue-200/80 dark:border-blue-900/50 bg-white dark:bg-zinc-800/80 p-3.5 space-y-1 hover:border-[#0A66C2] hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="font-semibold group-hover:text-[#0A66C2]">Profile Viewers</span>
                        <Eye className="h-3.5 w-3.5 text-[#0A66C2]" />
                      </div>
                      <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                        {(user.profileViews ?? 1428).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        +14.8% · 84 Unique Enterprises
                      </p>
                    </div>

                    <div
                      onClick={() => onOpenAnalytics ? onOpenAnalytics('reach') : (setWorkspaceSection('analytics'), setAnalyticsSubTab('reach'))}
                      className="rounded-xl border border-purple-200/80 dark:border-purple-900/50 bg-white dark:bg-zinc-800/80 p-3.5 space-y-1 hover:border-purple-500 hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="font-semibold group-hover:text-purple-600">Content Reach</span>
                        <TrendingUp className="h-3.5 w-3.5 text-purple-600" />
                      </div>
                      <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                        {(user.postImpressions ?? 9840).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                        +24.6% · Multi-Channel Broadcasts
                      </p>
                    </div>

                    <div
                      onClick={() => onOpenAnalytics ? onOpenAnalytics('discoveries') : (setWorkspaceSection('analytics'), setAnalyticsSubTab('discoveries'))}
                      className="rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-white dark:bg-zinc-800/80 p-3.5 space-y-1 hover:border-emerald-500 hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="font-semibold group-hover:text-emerald-600">Directory Discoveries</span>
                        <Search className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                      <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                        {(user.searchAppearances ?? 342).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        +18.2% · Talent Query Matches
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reconciled Trade Dispatch, Expiration Desk & Hall Invites for Trades Enclave */}
          {effectiveEnclaveId === 'trades_construction' && (
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
      {/* 📊 ANALYTICS, GRAPHS, TRENDS & USER INTELLIGENCE SUB-SECTION              */}
      {/* ========================================================================= */}
      {workspaceSection === 'analytics' && (() => {
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

        const scaledProfileViews = Math.round((user.profileViews ?? 340) * (analyticsTimeframe === '30d' ? 1 : tfMultiplier / 4.2))
        const scaledTotalReach = Math.round(reachData.totalReach * (analyticsTimeframe === '7d' ? 1 : tfMultiplier / 1.8))
        const scaledUniqueViewers = Math.round(reachData.uniqueViewers * (analyticsTimeframe === '7d' ? 1 : tfMultiplier / 1.8))
        const scaledDiscoveries = Math.round((user.searchAppearances ?? discoveryData.totalDiscoveries) * (analyticsTimeframe === '30d' ? 1 : tfMultiplier / 4.2))

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
            label: 'C-Suite, CTOs & VP Executives',
            percent: 38,
            count: Math.max(2, viewers.filter((v) => v.category === 'executive').length),
            color: 'bg-[#0A66C2]',
            badgeColor: 'text-[#0A66C2] dark:text-sky-400',
            intent: 'Executive Advisory & Architecture Leadership'
          },
          {
            id: 'buyer' as const,
            label: 'Enterprise Procurement & RFP Buyers',
            percent: 27,
            count: Math.max(1, viewers.filter((v) => v.category === 'buyer').length),
            color: 'bg-emerald-600',
            badgeColor: 'text-emerald-600 dark:text-emerald-400',
            intent: 'Vendor Roster & Contract Evaluation'
          },
          {
            id: 'recruiter' as const,
            label: 'Principal Technical Recruiters',
            percent: 21,
            count: Math.max(1, viewers.filter((v) => v.category === 'recruiter').length),
            color: 'bg-purple-600',
            badgeColor: 'text-purple-600 dark:text-purple-400',
            intent: 'Direct Principal / Fellow Hiring'
          },
          {
            id: 'peer' as const,
            label: 'Verified Fellows & Senior Peers',
            percent: 14,
            count: Math.max(3, viewers.filter((v) => v.category === 'peer').length),
            color: 'bg-amber-500',
            badgeColor: 'text-amber-600 dark:text-amber-400',
            intent: 'Whitepaper Citations & Peer Attestations'
          }
        ]

        // Inbound discovery channel breakdown
        const inboundVectors = [
          { channel: 'Enterprise Talent Directory Search', percent: 36, trend: '+28%', color: 'bg-[#0A66C2]' },
          { channel: 'RFP Proposal & Vendor Roster Desk', percent: 26, trend: '+19%', color: 'bg-emerald-600' },
          { channel: 'Feed Broadcasts & Technical Whitepapers', percent: 22, trend: '+34%', color: 'bg-purple-600' },
          { channel: 'Gated Enclave & Direct Passport Links', percent: 16, trend: '+15%', color: 'bg-amber-500' }
        ]

        return (
          <div className="space-y-6">
            {/* Top Intelligence Header Banner */}
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-sky-500/20 px-3 py-0.5 text-xs font-bold text-sky-300 border border-sky-400/30 flex items-center gap-1.5 w-fit">
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    ConnectIn Intelligence Radar · {tfLabel}
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-400/30">
                    📈 +24.6% Engagement Velocity
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Member Profile Views, Content Reach &amp; User Intelligence Analytics
                </h2>
                <p className="text-xs text-slate-200 max-w-2xl leading-relaxed opacity-90">
                  Interactive graphs, temporal trends, demographic segmentation, and organization-level analysis of the exact members inspecting your credentials and content.
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
                  84 Unique Enterprises · {tfLabel}
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
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
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
                    65.0%
                  </p>
                  <span className="rounded-full bg-amber-100 dark:bg-amber-950/70 px-2 py-0.5 text-[10px] font-black text-amber-800 dark:text-amber-300">
                    Top 1% Fellow
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
                  38% C-Suite/VP · 27% Enterprise Buyers
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
                    <span>Peak Traffic Window: Wednesday &amp; Thursday (9:00 AM – 2:00 PM EST)</span>
                  </p>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    Executive &amp; Defense Procurement activity spikes +46% mid-week following technical post broadcasts.
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
                    6 Core Sectors
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

              {/* Analysis Chart 3: Inbound Discovery Channels & Security Clearance Breakdown */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4">
                <div>
                  <h4 className="font-black text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Discovery Vectors &amp; Clearance Tiers</span>
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

                {/* Viewer Clearance & Trust Tier Distribution */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Inspecting User Trust &amp; Clearance Tiers
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/50 p-2">
                      <p className="text-sm font-black text-[#0A66C2] dark:text-sky-400">57%</p>
                      <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 block">
                        TS/SCI &amp; Poly
                      </span>
                    </div>
                    <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/50 p-2">
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">29%</p>
                      <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 block">
                        Secret / Buyer
                      </span>
                    </div>
                    <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/50 p-2">
                      <p className="text-sm font-black text-amber-600 dark:text-amber-400">14%</p>
                      <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 block">
                        Fellow Grade
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
                              {viewer.company} · Viewed via: <strong>{viewer.viewVector}</strong> ({viewer.viewedAt})
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
              const baseEndorsements = typeof s === 'object' ? (s.endorsements || s.endorsementsCount || 52) : 52
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
              endorsementsCount: (vs.endorsementsCount || 52) + (skillEndorsementBonuses[vs.name] || 0)
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
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-indigo-500/20 px-3 py-0.5 text-xs font-bold text-indigo-300 border border-indigo-400/40 flex items-center gap-1.5 w-fit">
                    <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
                    ConnectIn Verified Skill Passport · {enclaveInfo?.shortName || 'Trades'}
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5 w-fit">
                    <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
                    {allQualifiedJobs.length} Pre-Qualified Roles Unlocked
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white">
                  Multi-Factor Verified Competency Graph
                </h2>
                <p className="text-xs text-zinc-300 max-w-xl leading-relaxed">
                  Evidence-based verification combining proctored scenario exams, live trade/clinical diagnostic assessments, and peer superintendent attestations. Your verified graph automatically unlocks fast-track roles below.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="rounded-2xl bg-black/40 p-4 border border-white/15 text-center min-w-[165px] space-y-1">
                  <span className="text-[10px] uppercase font-mono text-zinc-400">Passport Score</span>
                  <p className="text-3xl font-black text-sky-400">95.4%</p>
                  <span className="text-[10px] text-emerald-400 font-bold block">Top 1% Fellow Grade</span>
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
                    Click any verified skill below to filter the jobs you directly qualify for based on your competency evidence.
                  </p>
                </div>

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
              </div>

              {showAddSkillInput && (
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

                      {/* Direct Skill-to-Jobs Qualification Footer */}
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
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ===================================================================== */}
            {/* 💼 JOBS YOU QUALIFY FOR BASED ON YOUR VERIFIED SKILLS                 */}
            {/* ===================================================================== */}
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
          </div>
        )
      })()}

      {/* ========================================================================= */}
      {/* 4. CERTIFICATIONS */}
      {/* ========================================================================= */}
      {workspaceSection === 'certifications' && (
        <div className="space-y-5">
          {/* Reconciled Trade Tickets & License Expiration Desk */}
          {effectiveEnclaveId === 'trades_construction' && (
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
      {/* 5. EXPERIENCE */}
      {/* ========================================================================= */}
      {workspaceSection === 'experience' && (
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
      {/* 8. 🛍️ MY PRODUCTS (DEVELOPER & COMPANY COMMERCIAL DESK) */}
      {/* ========================================================================= */}
      {workspaceSection === 'products' && (
        <div className="space-y-6">
          {/* Seller Performance Executive Strip */}
          <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 p-6 text-white shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="rounded-full bg-purple-500/30 px-3 py-0.5 text-xs font-bold text-purple-200 border border-purple-400/40">
                  Seller &amp; Developer Hub
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  My Products &amp; Storefront Management
                </h3>
                <p className="text-xs sm:text-sm text-purple-200">
                  Manage everything you sell through ConnectIn Marketplace: software subscriptions, masterclasses, and consulting retainers.
                </p>
              </div>

              <button
                onClick={() => setIsAddProductModalOpen(true)}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-4 py-2.5 text-xs font-black text-white shadow-md flex items-center gap-1.5 shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>+ List New Product</span>
              </button>
            </div>

            {/* Seller KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="rounded-xl bg-black/40 border border-white/15 p-3 text-center">
                <span className="text-[10px] text-zinc-400 uppercase font-mono">Total Monthly MRR</span>
                <p className="text-lg sm:text-xl font-black text-emerald-400">$122,790</p>
              </div>
              <div className="rounded-xl bg-black/40 border border-white/15 p-3 text-center">
                <span className="text-[10px] text-zinc-400 uppercase font-mono">Active Licenses</span>
                <p className="text-lg sm:text-xl font-black text-white">634 Units</p>
              </div>
              <div className="rounded-xl bg-black/40 border border-white/15 p-3 text-center">
                <span className="text-[10px] text-zinc-400 uppercase font-mono">Staging Trials</span>
                <p className="text-lg sm:text-xl font-black text-amber-300">44 Active</p>
              </div>
              <div className="rounded-xl bg-black/40 border border-white/15 p-3 text-center">
                <span className="text-[10px] text-zinc-400 uppercase font-mono">Sales Inquiries</span>
                <p className="text-lg sm:text-xl font-black text-sky-400">207 Leads</p>
              </div>
            </div>
          </div>

          {/* Active Product Listings Table */}
          <div className="space-y-4">
            <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Store className="h-5 w-5 text-purple-600" />
              <span>Your Active Marketplace Listings ({myProducts.length})</span>
            </h4>

            <div className="space-y-3">
              {myProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-purple-400 hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-2xl border border-purple-200 dark:bg-purple-950/40 dark:border-purple-900 shrink-0">
                      {prod.icon}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate">
                          {prod.name}
                        </h4>
                        <span className="rounded-full bg-purple-100 px-2 py-0.2 text-[10px] font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          {prod.category}
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {prod.status}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-500">
                        Pricing: <strong>{prod.price}</strong> ({prod.pricingModel}) · Rating: <strong>{prod.rating} ⭐ ({prod.reviewsCount})</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800">
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">Revenue / MRR</span>
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{prod.mrrOrRevenue}</p>
                      <p className="text-[10px] text-zinc-500">{prod.activeLicensesCount} licenses · {prod.leadsCount} leads</p>
                    </div>

                    <button
                      onClick={onNavigateMarketplace}
                      className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs"
                    >
                      View Live Page →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LIST NEW PRODUCT */}
      <Dialog
        open={isAddProductModalOpen}
        onOpenChange={(open) => {
          if (!open) setIsAddProductModalOpen(false)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Store className="h-5 w-5 text-purple-600" />
              <span>List New Product on Marketplace</span>
            </DialogTitle>
          </DialogHeader>

          {productAddedSuccess ? (
            <div className="py-6 text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Product Listing Created!
              </h4>
              <p className="text-xs text-zinc-500">
                Your product is now active in the ConnectIn Marketplace and ready to receive customer orders.
              </p>
            </div>
          ) : (
            <form onSubmit={handleCreateProductListing} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. AXIOM Cloud Defense Gateway"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">Category</label>
                <select
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value as any)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="Software">Software</option>
                  <option value="Training">Training</option>
                  <option value="Services">Services</option>
                  <option value="Enterprise Solutions">Enterprise Solutions</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">Pricing Tier</label>
                <input
                  type="text"
                  placeholder="e.g. $499 / mo or $199 one-time"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="rounded-lg bg-zinc-200 px-4 py-2 font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 font-bold text-white shadow-md hover:from-purple-500 hover:to-indigo-500"
                >
                  Publish Listing ✓
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
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => editAvatarFileInputRef.current?.click()}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[#0A66C2] text-white hover:bg-[#004182] flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="h-3 w-3" /> Upload File
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

      {/* Dedicated Profile & Cover Photo Attachment Dialog */}
      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="max-w-md rounded-3xl bg-white p-5 sm:p-6 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Camera className="h-5 w-5 text-[#0A66C2]" />
              <span>{photoModalTab === 'avatar' ? 'Attach Profile Picture' : 'Attach Cover Banner Photo'}</span>
            </DialogTitle>
          </DialogHeader>

          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 text-xs font-bold mt-2">
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
            <div className="space-y-4 pt-2">
              {/* Current Avatar Preview */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-[#0A66C2] shadow-lg">
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                </div>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-2">{user.name}</p>
                <p className="text-[11px] text-zinc-500">Live ConnectIn Profile Picture</p>
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
                  <span>Upload Photo from Computer / Phone</span>
                </button>
              </div>

              {/* Option 2: Enter direct image URL */}
              <div className="space-y-1.5 pt-1">
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
                        handleUpdateAvatar(customAvatarUrl.trim())
                        setCustomAvatarUrl("")
                      }
                    }}
                    disabled={!customAvatarUrl.trim()}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-black text-white text-xs font-bold cursor-pointer disabled:opacity-40"
                  >
                    Apply
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
              {/* Current Cover Preview */}
              <div className="p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <div className="relative h-24 w-full rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                  <img
                    src={user.coverImage || "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80"}
                    alt="Cover Banner"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 text-center mt-1.5">Live Profile Cover Banner</p>
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
                        handleUpdateCover(customCoverUrl.trim())
                        setCustomCoverUrl("")
                      }
                    }}
                    disabled={!customCoverUrl.trim()}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-black text-white text-xs font-bold cursor-pointer disabled:opacity-40"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Option 3: Executive Cover Presets */}
              <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">Choose Professional Banner Preset:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "DoD Cyber Ops", url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80" },
                    { name: "LinkedIn Blue", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80" },
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
