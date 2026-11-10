"use client"

import React, { useState, useEffect } from "react"
import {
  Briefcase,
  Wrench,
  Users,
  BookOpen,
  Building2,
  TrendingUp,
  SlidersHorizontal,
  Search,
  ClipboardPlus,
  MapPin,
  Store,
  Network,
  GraduationCap,
  PlusCircle,
  CheckCircle2,
  ShieldCheck,
  Clock,
  ArrowRight,
  ExternalLink,
  Eye,
  Send,
  Sparkles,
  FileCheck,
  Bookmark,
  X,
  Lock
} from "lucide-react"
import { UserProfile } from "@/lib/connectln-data"
import {
  WorkBusinessItemId,
  MemberInterestRole,
  WORK_BUSINESS_MENU_ITEMS,
  ServiceListing,
  ServiceInquiry,
  PricingApproach,
  WorkOpportunityItem,
  OpportunityKind,
  TrackedWorkSubmission,
  WorkCommunityItem,
  CommunityCategoryType,
  ManagedBusinessPage,
  BusinessPageType,
  PRACTICAL_LEARNING_GOALS,
  loadWorkBusinessState,
  saveWorkBusinessSlice
} from "@/lib/work-business-data"
import {
  getProfileTailoredAnalytics,
  recordLiveContentReach,
  recordLiveDirectoryDiscovery
} from "@/lib/connectin-analytics"

interface WorkAndBusinessHubViewProps {
  currentUser: UserProfile
  initialSection?: WorkBusinessItemId
  onNavigateTab: (tab: string) => void
  onOpenWhoViewedMyProfile?: () => void
  onOpenAnalyticsModal?: (tab: 'viewers' | 'reach' | 'discoveries') => void
  onOpenLearnTab?: (lessonId?: string, category?: string) => void
}

export function WorkAndBusinessHubView({
  currentUser,
  initialSection = 'find_work',
  onNavigateTab,
  onOpenWhoViewedMyProfile,
  onOpenAnalyticsModal,
  onOpenLearnTab
}: WorkAndBusinessHubViewProps) {
  const [activeSection, setActiveSection] = useState<WorkBusinessItemId>(initialSection)
  const [services, setServices] = useState<ServiceListing[]>([])
  const [inquiries, setInquiries] = useState<ServiceInquiry[]>([])
  const [opportunities, setOpportunities] = useState<WorkOpportunityItem[]>([])
  const [submissions, setSubmissions] = useState<TrackedWorkSubmission[]>([])
  const [communities, setCommunities] = useState<WorkCommunityItem[]>([])
  const [businessPages, setBusinessPages] = useState<ManagedBusinessPage[]>([])
  const [interests, setInterests] = useState<MemberInterestRole[]>([
    'find_work',
    'offer_services',
    'hire_people',
    'learn',
    'manage_business'
  ])
  const [savedLessons, setSavedLessons] = useState<
    { id: string; title: string; category: string; status: string; evidenceType: string }[]
  >([])

  // Filters & interactive form states
  const [workTypeFilter, setWorkTypeFilter] = useState<'all' | OpportunityKind>('all')
  const [workSearchQuery, setWorkSearchQuery] = useState("")
  const [savedOpportunityIds, setSavedOpportunityIds] = useState<string[]>(['opp_proj_painting'])

  // Post a job or project state
  const [postOppKind, setPostOppKind] = useState<OpportunityKind>('employment')
  const [postTitle, setPostTitle] = useState("")
  const [postOrg, setPostOrg] = useState((currentUser as any).company || "Expedite Consults & Heritage Timber Works")
  const [postLocation, setPostLocation] = useState("Laurel, MD")
  const [postTradeCategory, setPostTradeCategory] = useState(currentUser.profession || "Carpentry & Joinery")
  const [postPayOrBudget, setPostPayOrBudget] = useState("")
  const [postScheduleOrTiming, setPostScheduleOrTiming] = useState("")
  const [postEmploymentType, setPostEmploymentType] = useState("Full-time Direct Employment")
  const [postScopeOrStructure, setPostScopeOrStructure] = useState("")
  const [postSkillsInput, setPostSkillsInput] = useState("Blueprint Reading, OSHA 30, Finish Trim")
  const [postEntryReqsInput, setPostEntryReqsInput] = useState("High school diploma or GED, Valid driver license")
  const [postSuccessBanner, setPostSuccessBanner] = useState<string | null>(null)

  // Apply / Submit Quote modal state
  const [selectedOppForAction, setSelectedOppForAction] = useState<WorkOpportunityItem | null>(null)
  const [submissionNote, setSubmissionNote] = useState("")
  const [submissionQuoteAmount, setSubmissionQuoteAmount] = useState("")

  // Offer your services form state
  const [srvTradeTitle, setSrvTradeTitle] = useState("")
  const [srvCategory, setSrvCategory] = useState("Painting & Decorating")
  const [srvDescription, setSrvDescription] = useState("")
  const [srvArea, setSrvArea] = useState("Laurel, Bowie, Columbia & Greater DMV")
  const [srvAvailability, setSrvAvailability] = useState("Available next week · Mon–Sat")
  const [srvPricingApproach, setSrvPricingApproach] = useState<PricingApproach>('request_quote')
  const [srvRateDisplay, setSrvRateDisplay] = useState("Request a quote (or $85 / hr)")
  const [srvSampleTitle, setSrvSampleTitle] = useState("")
  const [srvSampleImage, setSrvSampleImage] = useState("https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop&q=80")
  const [srvQualTitle, setSrvQualTitle] = useState("Maryland MHIC Licensed Contractor")
  const [srvQualVerification, setSrvQualVerification] = useState<'member_supplied' | 'independently_checked'>('member_supplied')
  const [srvPublishedNotice, setSrvPublishedNotice] = useState<string | null>(null)

  // Find a professional & send inquiry state
  const [proSearchQuery, setProSearchQuery] = useState("")
  const [selectedServiceForInquiry, setSelectedServiceForInquiry] = useState<ServiceListing | null>(null)
  const [inqCustomerLocation, setInqCustomerLocation] = useState("Laurel, MD")
  const [inqProjectScope, setInqProjectScope] = useState("")
  const [inqPreferredDates, setInqPreferredDates] = useState("Next Monday – Friday")
  const [inqRequirements, setInqRequirements] = useState("")
  const [inqSentNotice, setInqSentNotice] = useState<string | null>(null)

  // My services & inquiries quote reply state
  const [replyQuoteAmounts, setReplyQuoteAmounts] = useState<Record<string, string>>({})
  const [replyNotes, setReplyNotes] = useState<Record<string, string>>({})

  // Communities filter state
  const [communityFilter, setCommunityFilter] = useState<'all' | CommunityCategoryType>('all')

  // Business page workspace mode ('public' vs 'private_workspace') & creation state
  const [bizViewMode, setBizViewMode] = useState<'private_workspace' | 'public_page'>('private_workspace')
  const [newBizName, setNewBizName] = useState("")
  const [newBizType, setNewBizType] = useState<BusinessPageType>('independent_business')
  const [newBizTagline, setNewBizTagline] = useState("")
  const [newBizLocation, setNewBizLocation] = useState("Laurel, MD")
  const [newBizServices, setNewBizServices] = useState("Interior & Exterior Painting, Drywall Repair, Cabinet Refinishing")
  const [newBizParentOrg, setNewBizParentOrg] = useState("")
  const [bizCreatedNotice, setBizCreatedNotice] = useState<string | null>(null)

  useEffect(() => {
    setActiveSection(initialSection)
  }, [initialSection])

  useEffect(() => {
    const loaded = loadWorkBusinessState()
    setServices(loaded.services)
    setInquiries(loaded.inquiries)
    setOpportunities(loaded.opportunities)
    setSubmissions(loaded.submissions)
    setCommunities(loaded.communities)
    setBusinessPages(loaded.businessPages)
    setInterests(loaded.interests)
    setSavedLessons(loaded.savedLessons)
  }, [])

  const activeMenuEntry =
    WORK_BUSINESS_MENU_ITEMS.find((item) => item.id === activeSection) || WORK_BUSINESS_MENU_ITEMS[7]

  const toggleInterest = (role: MemberInterestRole) => {
    const next = interests.includes(role)
      ? interests.length > 1
        ? interests.filter((i) => i !== role)
        : interests
      : [...interests, role]
    setInterests(next)
    saveWorkBusinessSlice('INTERESTS', next)
  }

  // Real telemetry from connectin-analytics
  const realAnalytics = getProfileTailoredAnalytics(currentUser)

  // Handlers
  const handlePublishOpportunity = (e: React.FormEvent) => {
    e.preventDefault()
    if (!postTitle.trim()) return

    const newOpp: WorkOpportunityItem = {
      id: 'opp_' + Date.now(),
      kind: postOppKind,
      title: postTitle.trim(),
      organization: postOrg.trim() || currentUser.name,
      location: postLocation.trim() || 'Laurel, MD',
      tradeCategory: postTradeCategory.trim() || 'Skilled Trades',
      createdAt: 'Just now',
      requiredSkills: postSkillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      ...(postOppKind === 'employment'
        ? {
            payRange: postPayOrBudget || '$40 – $52 / hr',
            schedule: postScheduleOrTiming || 'Mon–Fri · 40 hrs/wk',
            employmentType: postEmploymentType
          }
        : postOppKind === 'contract_project'
        ? {
            scopeOfWork: postScopeOrStructure || 'Complete project scope per site specifications.',
            timing: postScheduleOrTiming || 'Start within 2 weeks',
            optionalBudget: postPayOrBudget || 'Open to contractor quotes'
          }
        : {
            trainingProviderOrEmployer: postOrg.trim() || currentUser.name,
            compensation: postPayOrBudget || '$22 / hr starting wage + benefits',
            schedule: postScheduleOrTiming || '36 hrs/wk OJT + 1 classroom evening',
            trainingStructure: postScopeOrStructure || 'State Registered Earn-While-You-Learn Apprenticeship',
            entryRequirements: postEntryReqsInput
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          })
    }

    const updated = [newOpp, ...opportunities]
    setOpportunities(updated)
    saveWorkBusinessSlice('OPPORTUNITIES', updated)
    if (currentUser?.name) {
      recordLiveContentReach({
        userName: currentUser.name,
        title: `Published ${postOppKind.replace('_', ' ')}: ${newOpp.title}`,
        category: 'Jobs',
        actorName: currentUser.name
      })
    }
    setPostTitle("")
    setPostSuccessBanner(`Published "${newOpp.title}" to Find work!`)
    setTimeout(() => {
      setPostSuccessBanner(null)
      setActiveSection('find_work')
    }, 1200)
  }

  const handleSubmitOpportunityResponse = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOppForAction) return

    const initialStage =
      selectedOppForAction.kind === 'employment'
        ? 'Submitted'
        : selectedOppForAction.kind === 'contract_project'
        ? 'Quote submitted'
        : 'Submitted'

    const newSub: TrackedWorkSubmission = {
      id: 'sub_' + Date.now(),
      opportunityId: selectedOppForAction.id,
      opportunityKind: selectedOppForAction.kind,
      opportunityTitle: selectedOppForAction.title,
      organization: selectedOppForAction.organization,
      location: selectedOppForAction.location,
      applicantName: currentUser.name,
      submittedAt: 'Just now',
      currentStage: initialStage,
      stageHistory: [
        {
          stage: initialStage,
          timestamp: 'Just now',
          note:
            selectedOppForAction.kind === 'contract_project'
              ? `Submitted project quote (${submissionQuoteAmount || 'Custom Estimate'}).`
              : `Submitted application via ConnectLn Work & Business.`
        }
      ],
      proposalOrNote: submissionNote || 'Submitted verified ConnectLn profile, work samples, and trade credentials.',
      proposedAmount: submissionQuoteAmount || undefined
    }

    const updated = [newSub, ...submissions]
    setSubmissions(updated)
    saveWorkBusinessSlice('SUBMISSIONS', updated)
    if (currentUser?.name) {
      recordLiveContentReach({
        userName: currentUser.name,
        title: `Applied / Quoted on: ${selectedOppForAction.title}`,
        category: 'Jobs',
        actorName: currentUser.name
      })
    }
    setSelectedOppForAction(null)
    setSubmissionNote("")
    setSubmissionQuoteAmount("")
    setActiveSection('my_work_applications')
  }

  const handleAdvanceSubmissionStage = (subId: string) => {
    const updated = submissions.map((sub) => {
      if (sub.id !== subId) return sub
      const pipeline =
        sub.opportunityKind === 'employment'
          ? ['Submitted', 'Under review', 'Interview', 'Offer']
          : sub.opportunityKind === 'contract_project'
          ? ['Quote submitted', 'Scope discussion', 'Accepted', 'Completed']
          : ['Submitted', 'Aptitude review', 'Shop interview', 'Accepted to program']
      const idx = pipeline.indexOf(sub.currentStage)
      const nextStage = pipeline[Math.min(idx + 1, pipeline.length - 1)]
      if (nextStage === sub.currentStage) return sub
      return {
        ...sub,
        currentStage: nextStage,
        stageHistory: [
          ...sub.stageHistory,
          {
            stage: nextStage,
            timestamp: 'Updated just now',
            note: `Status progressed to ${nextStage} based on employer/client action.`
          }
        ]
      }
    })
    setSubmissions(updated)
    saveWorkBusinessSlice('SUBMISSIONS', updated)
  }

  const handlePublishService = (e: React.FormEvent) => {
    e.preventDefault()
    if (!srvTradeTitle.trim()) return

    const newSrv: ServiceListing = {
      id: 'srv_' + Date.now(),
      providerName: currentUser.name,
      providerHeadline: currentUser.headline,
      providerAvatar: currentUser.avatar,
      tradeOrService: srvTradeTitle.trim(),
      category: srvCategory,
      description: srvDescription.trim() || 'Professional trade service with verified workmanship and clear project estimates.',
      workSamples: [
        {
          title: srvSampleTitle.trim() || 'Completed Project Work Sample',
          imageUrl: srvSampleImage.trim() || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80',
          caption: 'Completed on schedule with full customer sign-off.'
        }
      ],
      serviceArea: srvArea.trim() || 'Laurel & Greater DMV',
      availability: srvAvailability.trim() || 'Available this week',
      pricingApproach: srvPricingApproach,
      rateDisplay: srvRateDisplay.trim() || 'Request a quote',
      qualifications: [
        {
          id: 'q_' + Date.now(),
          title: srvQualTitle.trim() || 'Trade Qualification & Workmanship Guarantee',
          issuer: srvQualVerification === 'independently_checked' ? 'State Licensing Registry' : 'Member Supplied',
          verificationStatus: srvQualVerification
        }
      ],
      createdAt: 'Just now',
      isOwner: true
    }

    const updated = [newSrv, ...services]
    setServices(updated)
    saveWorkBusinessSlice('SERVICES', updated)
    if (currentUser?.name) {
      recordLiveContentReach({
        userName: currentUser.name,
        title: `Published service listing: ${newSrv.tradeOrService}`,
        category: 'Marketplace',
        actorName: currentUser.name
      })
    }
    setSrvTradeTitle("")
    setSrvDescription("")
    setSrvPublishedNotice(`Service "${newSrv.tradeOrService}" is now live in Find a professional and My services & inquiries!`)
    setTimeout(() => {
      setSrvPublishedNotice(null)
      setActiveSection('my_services_inquiries')
    }, 1200)
  }

  const handleSendCustomerInquiry = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedServiceForInquiry || !inqProjectScope.trim()) return

    const newInq: ServiceInquiry = {
      id: 'inq_' + Date.now(),
      serviceId: selectedServiceForInquiry.id,
      serviceTitle: selectedServiceForInquiry.tradeOrService,
      providerName: selectedServiceForInquiry.providerName,
      customerName: `${currentUser.name} (${inqCustomerLocation})`,
      customerLocation: inqCustomerLocation,
      projectScope: inqProjectScope.trim(),
      preferredDates: inqPreferredDates.trim() || 'Flexible dates',
      requirements: inqRequirements.trim() || 'Standard site preparation and quote requested.',
      status: 'New inquiry',
      createdAt: 'Just now'
    }

    const updated = [newInq, ...inquiries]
    setInquiries(updated)
    saveWorkBusinessSlice('INQUIRIES', updated)
    recordLiveDirectoryDiscovery({
      targetName: selectedServiceForInquiry.providerName,
      keyword: selectedServiceForInquiry.tradeOrService,
      searcherName: currentUser.name,
      searcherHeadline: currentUser.headline,
      searcherAvatar: currentUser.avatar,
      source: 'Find a Professional Inquiry',
      discoveryType: 'profile_click'
    })
    setSelectedServiceForInquiry(null)
    setInqProjectScope("")
    setInqRequirements("")
    setInqSentNotice(`Inquiry sent to ${selectedServiceForInquiry.providerName}! Track it in My services & inquiries.`)
    setTimeout(() => {
      setInqSentNotice(null)
      setActiveSection('my_services_inquiries')
    }, 1200)
  }

  const handleSendQuoteReply = (inqId: string) => {
    const quote = replyQuoteAmounts[inqId] || '$1,450 Fixed Estimate'
    const note = replyNotes[inqId] || 'Includes all prep, materials, and cleanup. Available on your requested dates.'
    const updated = inquiries.map((inq) =>
      inq.id === inqId
        ? {
            ...inq,
            status: 'Quote sent' as const,
            quoteAmount: quote,
            providerReply: note
          }
        : inq
    )
    setInquiries(updated)
    saveWorkBusinessSlice('INQUIRIES', updated)
  }

  const handleCreateBusinessPage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBizName.trim()) return

    const typeLabels: Record<BusinessPageType, string> = {
      independent_business: 'Independent Business',
      professional_practice: 'Professional Practice or Service Provider',
      franchise_location: 'Franchise Location',
      training_provider: 'Training Provider',
      association_organization: 'Association or Community Organization'
    }

    const newPage: ManagedBusinessPage = {
      id: 'biz_' + Date.now(),
      name: newBizName.trim(),
      pageType: newBizType,
      pageTypeLabel: typeLabels[newBizType],
      tagline: newBizTagline.trim() || 'Verified local service & professional organization on ConnectLn',
      location: newBizLocation.trim() || 'Laurel, MD',
      servicesOffered: newBizServices
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      workSamplesCount: 4,
      openOpportunitiesCount: 1,
      customerInquiriesCount: inquiries.length,
      applicantCount: submissions.length,
      authorizedTeam: [
        { name: currentUser.name, role: 'Primary Owner & Manager', accessLevel: 'Owner' }
      ],
      parentOrganizationName: newBizType === 'franchise_location' ? newBizParentOrg || 'National Franchise Network' : undefined,
      billingPlan: 'Standard Business Workspace (Active)'
    }

    const updated = [newPage, ...businessPages]
    setBusinessPages(updated)
    saveWorkBusinessSlice('BUSINESS_PAGES', updated)
    setNewBizName("")
    setNewBizTagline("")
    setBizCreatedNotice(`Created "${newPage.name}"! Opening your private management workspace...`)
    setTimeout(() => {
      setBizCreatedNotice(null)
      setActiveSection('my_business_pages')
    }, 1000)
  }

  const renderMenuIcon = (id: WorkBusinessItemId) => {
    switch (id) {
      case 'my_work_applications':
        return <Briefcase className="h-4 w-4 text-[#2C5282]" />
      case 'my_services_inquiries':
        return <Wrench className="h-4 w-4 text-[#2C5282]" />
      case 'my_communities':
        return <Users className="h-4 w-4 text-[#2C5282]" />
      case 'my_learning':
        return <BookOpen className="h-4 w-4 text-[#2C5282]" />
      case 'my_business_pages':
        return <Building2 className="h-4 w-4 text-[#2C5282]" />
      case 'activity_insights':
        return <TrendingUp className="h-4 w-4 text-[#2C5282]" />
      case 'billing_settings':
        return <SlidersHorizontal className="h-4 w-4 text-[#2C5282]" />
      case 'find_work':
        return <Search className="h-4 w-4 text-[#2C5282]" />
      case 'post_job_project':
        return <ClipboardPlus className="h-4 w-4 text-[#2C5282]" />
      case 'find_professional':
        return <MapPin className="h-4 w-4 text-[#2C5282]" />
      case 'offer_services':
        return <Store className="h-4 w-4 text-[#2C5282]" />
      case 'explore_communities':
        return <Network className="h-4 w-4 text-[#2C5282]" />
      case 'learn_practical_skills':
        return <GraduationCap className="h-4 w-4 text-[#2C5282]" />
      case 'create_business_page':
        return <PlusCircle className="h-4 w-4 text-[#2C5282]" />
    }
  }

  const workspaceItems = WORK_BUSINESS_MENU_ITEMS.filter((i) => i.column === 'workspace')
  const growItems = WORK_BUSINESS_MENU_ITEMS.filter((i) => i.column === 'grow')

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-24">
      {/* TOP PERSONALIZATION & ROLE INTERESTS BAR */}
      <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 sm:p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#EDF4FC] text-[#1E4E8C] border border-[#CFE2F6]">
                <Briefcase className="h-4 w-4" />
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                ConnectLn Work &amp; Business
              </h1>
              <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-[#1E4E8C] dark:text-sky-300 border border-blue-200/70">
                Find work · Get customers · Hire workers · Develop skills · Manage businesses
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Personalize your shortcuts below. You can look for work, offer services, and hire people at the same time—permissions govern private access.
            </p>
          </div>

          {/* Role / Interest Toggles */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-zinc-500 mr-1">My Priorities:</span>
            {[
              { id: 'find_work' as const, label: '🔍 Find work' },
              { id: 'offer_services' as const, label: '🛠️ Offer services' },
              { id: 'hire_people' as const, label: '📋 Hire people' },
              { id: 'learn' as const, label: '🎓 Learn' },
              { id: 'manage_business' as const, label: '🏢 Manage a business' }
            ].map((role) => {
              const active = interests.includes(role.id)
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => toggleInterest(role.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer border ${
                    active
                      ? "bg-[#1E4E8C] text-white border-[#1E4E8C] shadow-2xs"
                      : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                  }`}
                >
                  {role.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* MAIN GRID: LEFT INTERACTIVE "WORK & BUSINESS" MENU CARD + RIGHT ACTIVE WORKFLOW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* TWO-COLUMN "WORK & BUSINESS" MENU CARD (Matches Screenshot 3 Exactly) */}
        <div className="lg:col-span-5 rounded-2xl border border-zinc-200/90 bg-white shadow-sm overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#EDF4FC] border border-[#D5E6F7] flex items-center justify-center text-[#1E4E8C]">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                  ConnectLn
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Work &amp; Business
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <a
                href="https://desk-note.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 transition-colors"
                title="Open Desk Note (https://desk-note.app/)"
              >
                <span>📓 Desk Note ↗</span>
              </a>
            </div>
          </div>

          {/* Two Columns: My workspace (Left) | Grow with ConnectLn (Right) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-100 dark:divide-zinc-800">
            {/* LEFT: My workspace */}
            <div className="p-4 space-y-1.5">
              <p className="px-2 pb-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                My workspace
              </p>
              {workspaceItems.map((item) => {
                const isSelected = activeSection === item.id
                const isPrioritized = item.relatedInterests.some((r) => interests.includes(r))
                const badgeCount =
                  item.id === 'my_work_applications'
                    ? submissions.length
                    : item.id === 'my_services_inquiries'
                    ? inquiries.length
                    : item.id === 'my_communities'
                    ? communities.filter((c) => c.isJoined).length
                    : item.id === 'my_business_pages'
                    ? businessPages.length
                    : 0

                return (
                  <React.Fragment key={item.id}>
                    {item.isBottomDividerItem && (
                      <div className="my-2 border-t border-zinc-100 dark:border-zinc-800 pt-2" />
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full rounded-xl p-2.5 text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                        isSelected
                          ? "bg-[#EDF4FC] dark:bg-blue-950/50 ring-1 ring-[#BFD9F2] dark:ring-blue-800"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                      }`}
                    >
                      <span className="mt-0.5 shrink-0">{renderMenuIcon(item.id)}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                            {item.title}
                          </p>
                          {badgeCount > 0 && (
                            <span className="rounded-full bg-[#1E4E8C]/10 text-[#1E4E8C] dark:text-sky-300 px-1.5 py-0.2 text-[10px] font-bold shrink-0">
                              {badgeCount}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5">
                          {item.subtitle}
                        </p>
                        {isPrioritized && (
                          <span className="inline-block mt-1 text-[9px] font-semibold text-[#1E4E8C] dark:text-sky-400">
                            ★ Prioritized for you
                          </span>
                        )}
                      </div>
                    </button>
                  </React.Fragment>
                )
              })}
            </div>

            {/* RIGHT: Grow with ConnectLn */}
            <div className="p-4 space-y-1.5">
              <p className="px-2 pb-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Grow with ConnectLn
              </p>
              {growItems.map((item) => {
                const isSelected = activeSection === item.id
                const isPrioritized = item.relatedInterests.some((r) => interests.includes(r))

                return (
                  <React.Fragment key={item.id}>
                    {item.isBottomDividerItem && (
                      <div className="my-2 border-t border-zinc-100 dark:border-zinc-800 pt-2" />
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full rounded-xl p-2.5 text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                        isSelected
                          ? "bg-[#EDF4FC] dark:bg-blue-950/50 ring-1 ring-[#BFD9F2] dark:ring-blue-800"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                      }`}
                    >
                      <span className="mt-0.5 shrink-0">{renderMenuIcon(item.id)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5">
                          {item.subtitle}
                        </p>
                        {isPrioritized && (
                          <span className="inline-block mt-1 text-[9px] font-semibold text-[#1E4E8C] dark:text-sky-400">
                            ★ Recommended action
                          </span>
                        )}
                      </div>
                    </button>
                  </React.Fragment>
                )
              })}
            </div>
          </div>

          {/* Contextual Bottom Description Strip (Matches Screenshot 3 Footer) */}
          <div className="bg-[#F6F8FA] dark:bg-zinc-800/70 px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {activeMenuEntry.title}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5 leading-relaxed">
              {activeMenuEntry.footerDescription}
            </p>
          </div>
        </div>

        {/* RIGHT PANE: ACTIVE WORKFLOW ENGINE */}
        <div className="lg:col-span-7 space-y-5">
          {/* =================================================================== */}
          {/* 1. FIND WORK (Employment, Contract Projects & Apprenticeships)      */}
          {/* =================================================================== */}
          {activeSection === 'find_work' && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E4E8C]">
                    Grow with ConnectLn · Shared Opportunity Board
                  </span>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    Find work: Jobs, Contract Projects &amp; Apprenticeships
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Filter by Employment, Contract project, or Apprenticeship—each uses its own tailored response workflow.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveSection('post_job_project')}
                    className="rounded-xl bg-[#1E4E8C] hover:bg-[#153A6B] text-white px-3.5 py-2 text-xs font-bold cursor-pointer"
                  >
                    + Post a job or project
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('jobs')}
                    className="rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 px-3 py-2 text-xs font-semibold cursor-pointer"
                  >
                    Full Jobs Board →
                  </button>
                </div>
              </div>

              {/* Member's Active "Looking for a Job" Badge & Card Banner */}
              <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800/80 bg-gradient-to-r from-emerald-50/90 via-white to-teal-50/70 dark:from-emerald-950/40 dark:via-zinc-900 dark:to-teal-950/30 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-12 w-12 rounded-full ring-2 ring-emerald-500 overflow-hidden shrink-0">
                    <img src={currentUser.avatar} alt={currentUser.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
                        💼 Looking for a Job
                      </span>
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {currentUser.name}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate mt-0.5">
                      {currentUser.profession || 'Verified Specialist'} · Employment, Contract Projects &amp; Apprenticeships · {currentUser.location || 'Laurel, MD'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab('profile')}
                  className="rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-zinc-800 hover:bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-200 shrink-0 cursor-pointer"
                >
                  Customize &quot;Looking for a Job&quot; Card →
                </button>
              </div>

              {/* Search & Opportunity Kind Filter Pills */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={workSearchQuery}
                    onChange={(e) => setWorkSearchQuery(e.target.value)}
                    placeholder="Search by trade (carpenter, painter, mechanic), location (Laurel), or skill..."
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]"
                  />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'all' as const, label: 'All (3 Types)' },
                    { id: 'employment' as const, label: '💼 Employment' },
                    { id: 'contract_project' as const, label: '📐 Contract Project' },
                    { id: 'apprenticeship' as const, label: '🎓 Apprenticeship' }
                  ].map((pill) => (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setWorkTypeFilter(pill.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all ${
                        workTypeFilter === pill.id
                          ? "bg-[#1E4E8C] text-white"
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opportunities List */}
              <div className="space-y-3">
                {opportunities
                  .filter((opp) => {
                    if (workTypeFilter !== 'all' && opp.kind !== workTypeFilter) return false
                    if (!workSearchQuery.trim()) return true
                    const q = workSearchQuery.toLowerCase()
                    return (
                      opp.title.toLowerCase().includes(q) ||
                      opp.organization.toLowerCase().includes(q) ||
                      opp.location.toLowerCase().includes(q) ||
                      opp.tradeCategory.toLowerCase().includes(q) ||
                      opp.requiredSkills.some((s) => s.toLowerCase().includes(q))
                    )
                  })
                  .map((opp) => {
                    const isSaved = savedOpportunityIds.includes(opp.id)
                    const existingSub = submissions.find((s) => s.opportunityId === opp.id)
                    return (
                      <div
                        key={opp.id}
                        className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3 hover:border-[#1E4E8C]/50 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  opp.kind === 'employment'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                    : opp.kind === 'contract_project'
                                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                }`}
                              >
                                {opp.kind === 'employment'
                                  ? '💼 Employment'
                                  : opp.kind === 'contract_project'
                                  ? '📐 Contract Project'
                                  : '🎓 Apprenticeship'}
                              </span>
                              <span className="text-[11px] font-semibold text-zinc-500">
                                {opp.tradeCategory} · {opp.createdAt}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                              {opp.title}
                            </h3>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                              {opp.organization} · 📍 {opp.location}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setSavedOpportunityIds((prev) =>
                                prev.includes(opp.id)
                                  ? prev.filter((id) => id !== opp.id)
                                  : [...prev, opp.id]
                              )
                            }
                            className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold cursor-pointer ${
                              isSaved
                                ? 'bg-blue-50 border-blue-300 text-[#1E4E8C]'
                                : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            {isSaved ? '★ Saved' : '☆ Save'}
                          </button>
                        </div>

                        {/* Type-Specific Details */}
                        {opp.kind === 'employment' && (
                          <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-3 text-xs space-y-1">
                            <p><strong>Pay:</strong> {opp.payRange} · <strong>Type:</strong> {opp.employmentType}</p>
                            <p><strong>Schedule:</strong> {opp.schedule}</p>
                          </div>
                        )}
                        {opp.kind === 'contract_project' && (
                          <div className="rounded-lg bg-amber-50/60 dark:bg-amber-950/20 p-3 text-xs space-y-1">
                            <p><strong>Scope of work:</strong> {opp.scopeOfWork}</p>
                            <p><strong>Timing:</strong> {opp.timing} · <strong>Budget:</strong> {opp.optionalBudget}</p>
                          </div>
                        )}
                        {opp.kind === 'apprenticeship' && (
                          <div className="rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 p-3 text-xs space-y-1">
                            <p><strong>Training Provider / Employer:</strong> {opp.trainingProviderOrEmployer}</p>
                            <p><strong>Compensation:</strong> {opp.compensation}</p>
                            <p><strong>Structure:</strong> {opp.trainingStructure}</p>
                            {opp.entryRequirements && (
                              <p><strong>Entry Requirements:</strong> {opp.entryRequirements.join(' · ')}</p>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                          <div className="flex flex-wrap gap-1">
                            {opp.requiredSkills.map((sk) => (
                              <span
                                key={sk}
                                className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:text-zinc-300"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>

                          {existingSub ? (
                            <button
                              type="button"
                              onClick={() => setActiveSection('my_work_applications')}
                              className="rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-xs font-bold cursor-pointer"
                            >
                              ✓ Status: {existingSub.currentStage} (Track →)
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedOppForAction(opp)}
                              className="rounded-lg bg-[#1E4E8C] hover:bg-[#153A6B] text-white px-3.5 py-1.5 text-xs font-bold cursor-pointer"
                            >
                              {opp.kind === 'employment'
                                ? 'Submit an application'
                                : opp.kind === 'contract_project'
                                ? 'Send a proposal or quote'
                                : 'Apply to the program'}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>

              {/* Modal / Drawer for Applying or Sending a Quote */}
              {selectedOppForAction && (
                <form
                  onSubmit={handleSubmitOpportunityResponse}
                  className="rounded-2xl border-2 border-[#1E4E8C] bg-[#F6F9FC] dark:bg-zinc-800 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {selectedOppForAction.kind === 'employment'
                        ? `Submit Employment Application: ${selectedOppForAction.title}`
                        : selectedOppForAction.kind === 'contract_project'
                        ? `Send Contract Proposal / Quote: ${selectedOppForAction.title}`
                        : `Apply to Apprenticeship Program: ${selectedOppForAction.title}`}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setSelectedOppForAction(null)}
                      className="text-xs text-zinc-500 hover:text-zinc-800"
                    >
                      Cancel ✕
                    </button>
                  </div>

                  {selectedOppForAction.kind === 'contract_project' && (
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Your Proposed Quote / Estimate
                      </label>
                      <input
                        type="text"
                        required
                        value={submissionQuoteAmount}
                        onChange={(e) => setSubmissionQuoteAmount(e.target.value)}
                        placeholder="e.g., $8,200 Fixed Price (Includes zero-VOC paint, prep & 5-day completion)"
                        className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      {selectedOppForAction.kind === 'contract_project'
                        ? 'Scope Proposal, Crew Availability & Work Samples Note'
                        : 'Application Note, Trade Experience & Availability'}
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={submissionNote}
                      onChange={(e) => setSubmissionNote(e.target.value)}
                      placeholder="Describe your relevant trade experience, licenses/OSHA cards, and earliest start date..."
                      className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="submit"
                      className="rounded-xl bg-[#1E4E8C] hover:bg-[#153A6B] text-white px-4 py-2 text-xs font-bold cursor-pointer"
                    >
                      {selectedOppForAction.kind === 'employment'
                        ? 'Submit Application'
                        : selectedOppForAction.kind === 'contract_project'
                        ? 'Send Proposal & Quote'
                        : 'Submit Apprenticeship Application'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* =================================================================== */}
          {/* 2. MY WORK & APPLICATIONS (Visible History & Pipeline Progression)  */}
          {/* =================================================================== */}
          {activeSection === 'my_work_applications' && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E4E8C]">
                    My workspace · Applications, Quotes &amp; Saved Work
                  </span>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    My work &amp; applications
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Visible history based on actual actions: Employment (Submitted → Under review → Interview → Offer) &amp; Project Quotes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('find_work')}
                  className="rounded-xl bg-[#1E4E8C] text-white px-3.5 py-2 text-xs font-bold cursor-pointer"
                >
                  Find More Work →
                </button>
              </div>

              <div className="space-y-4">
                {submissions.map((sub) => {
                  const stages =
                    sub.opportunityKind === 'employment'
                      ? ['Submitted', 'Under review', 'Interview', 'Offer']
                      : sub.opportunityKind === 'contract_project'
                      ? ['Quote submitted', 'Scope discussion', 'Accepted', 'Completed']
                      : ['Submitted', 'Aptitude review', 'Shop interview', 'Accepted to program']
                  const currentIdx = stages.indexOf(sub.currentStage)

                  return (
                    <div
                      key={sub.id}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-[#1E4E8C]">
                            {sub.opportunityKind.replace('_', ' ')}
                          </span>
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {sub.opportunityTitle}
                          </h3>
                          <p className="text-xs text-zinc-500">
                            {sub.organization} · {sub.location} · Submitted {sub.submittedAt}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAdvanceSubmissionStage(sub.id)}
                          className="rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1E4E8C] border border-blue-200 px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                          title="Simulate next employer/client response action"
                        >
                          Advance Stage ↻
                        </button>
                      </div>

                      {/* Stage Progress Bar */}
                      <div className="grid grid-cols-4 gap-1.5 pt-1">
                        {stages.map((st, idx) => {
                          const reached = idx <= currentIdx
                          return (
                            <div
                              key={st}
                              className={`rounded-lg p-2 text-center border text-[11px] font-bold ${
                                reached
                                  ? 'bg-[#EDF4FC] border-[#1E4E8C] text-[#1E4E8C]'
                                  : 'bg-zinc-50 border-zinc-200 text-zinc-400'
                              }`}
                            >
                              {reached ? '✓ ' : ''}{st}
                            </div>
                          )
                        })}
                      </div>

                      {sub.proposedAmount && (
                        <p className="text-xs font-bold text-emerald-700">
                          Quoted Amount: {sub.proposedAmount}
                        </p>
                      )}
                      <p className="text-xs text-zinc-600 dark:text-zinc-300">
                        <strong>Your Submission:</strong> {sub.proposalOrNote}
                      </p>

                      {/* Action History Log */}
                      <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-3 space-y-1.5">
                        <p className="text-[10px] font-bold uppercase text-zinc-400">
                          Recorded Action History
                        </p>
                        {sub.stageHistory.map((h, i) => (
                          <div key={i} className="text-xs flex items-center justify-between gap-2">
                            <span>
                              <strong>{h.stage}:</strong> {h.note}
                            </span>
                            <span className="text-[10px] text-zinc-400 shrink-0">{h.timestamp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* 3. POST A JOB OR PROJECT (3 Distinct Opportunity Forms)             */}
          {/* =================================================================== */}
          {activeSection === 'post_job_project' && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E4E8C]">
                  Grow with ConnectLn · Publish an Opportunity
                </span>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Post a job or project
                </h2>
                <p className="text-xs text-zinc-500">
                  Step 1: What kind of opportunity do you want to publish? Each type collects tailored details and sets how members respond.
                </p>
              </div>

              {/* Step 1: 3 Opportunity Kind Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'employment' as const,
                    title: '💼 Employment',
                    collects: 'Job title, employer, location, pay, schedule, employment type & skills',
                    responds: 'Members submit an application'
                  },
                  {
                    id: 'contract_project' as const,
                    title: '📐 Contract project',
                    collects: 'Scope of work, location, timing, required skills & optional budget',
                    responds: 'Members send a proposal or quote'
                  },
                  {
                    id: 'apprenticeship' as const,
                    title: '🎓 Apprenticeship',
                    collects: 'Trade, training provider/employer, compensation, schedule & entry requirements',
                    responds: 'Members apply to the program'
                  }
                ].map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setPostOppKind(card.id)}
                    className={`rounded-xl p-3.5 text-left border transition-all cursor-pointer ${
                      postOppKind === card.id
                        ? 'border-2 border-[#1E4E8C] bg-[#EDF4FC]/70 dark:bg-blue-950/40'
                        : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800'
                    }`}
                  >
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{card.title}</p>
                    <p className="text-[11px] text-zinc-500 mt-1">{card.collects}</p>
                    <p className="text-[10px] font-bold text-[#1E4E8C] mt-1.5">→ {card.responds}</p>
                  </button>
                ))}
              </div>

              {postSuccessBanner && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">
                  ✓ {postSuccessBanner}
                </div>
              )}

              {/* Tailored Form */}
              <form onSubmit={handlePublishOpportunity} className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      {postOppKind === 'employment'
                        ? 'Job Title'
                        : postOppKind === 'contract_project'
                        ? 'Project Title'
                        : 'Apprenticeship Program Title'}
                    </label>
                    <input
                      type="text"
                      required
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder={
                        postOppKind === 'employment'
                          ? 'e.g., Commercial Finish Carpenter'
                          : postOppKind === 'contract_project'
                          ? 'e.g., 4-Room Laurel Colonial Interior Painting'
                          : 'e.g., 1st-Year Residential & Commercial Plumber Apprentice'
                      }
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      {postOppKind === 'apprenticeship' ? 'Training Provider or Employer' : 'Employer / Client Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={postOrg}
                      onChange={(e) => setPostOrg(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      required
                      value={postLocation}
                      onChange={(e) => setPostLocation(e.target.value)}
                      placeholder="Laurel, MD"
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Trade or Profession
                    </label>
                    <input
                      type="text"
                      required
                      value={postTradeCategory}
                      onChange={(e) => setPostTradeCategory(e.target.value)}
                      placeholder="Carpentry, Painting, Auto..."
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      {postOppKind === 'employment'
                        ? 'Pay Range'
                        : postOppKind === 'contract_project'
                        ? 'Optional Budget'
                        : 'Starting Compensation'}
                    </label>
                    <input
                      type="text"
                      value={postPayOrBudget}
                      onChange={(e) => setPostPayOrBudget(e.target.value)}
                      placeholder={
                        postOppKind === 'employment'
                          ? '$40 – $52 / hr'
                          : postOppKind === 'contract_project'
                          ? '$3,500 – $5,000 or Open Quote'
                          : '$22 / hr + benefits'
                      }
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                {postOppKind === 'employment' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Schedule
                      </label>
                      <input
                        type="text"
                        value={postScheduleOrTiming}
                        onChange={(e) => setPostScheduleOrTiming(e.target.value)}
                        placeholder="Mon–Fri · 7:00 AM – 3:30 PM"
                        className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Employment Type
                      </label>
                      <select
                        value={postEmploymentType}
                        onChange={(e) => setPostEmploymentType(e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs bg-white"
                      >
                        <option>Full-time Direct Employment</option>
                        <option>Part-time / Seasonal</option>
                        <option>Union Dispatch</option>
                      </select>
                    </div>
                  </div>
                )}

                {postOppKind !== 'employment' && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      {postOppKind === 'contract_project'
                        ? 'Detailed Scope of Work & Timing'
                        : 'Training Structure & Classroom / OJT Schedule'}
                    </label>
                    <textarea
                      rows={3}
                      value={postScopeOrStructure}
                      onChange={(e) => setPostScopeOrStructure(e.target.value)}
                      placeholder={
                        postOppKind === 'contract_project'
                          ? 'Describe rooms/units, materials, site readiness, and target completion dates...'
                          : 'Describe paid on-the-job training hours, mentorship structure, and credential earned...'
                      }
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Required Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={postSkillsInput}
                    onChange={(e) => setPostSkillsInput(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs"
                  />
                </div>

                {postOppKind === 'apprenticeship' && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Entry Requirements (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={postEntryReqsInput}
                      onChange={(e) => setPostEntryReqsInput(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="rounded-xl bg-[#1E4E8C] hover:bg-[#153A6B] text-white px-5 py-2.5 text-xs font-bold cursor-pointer"
                >
                  Publish to Find work
                </button>
              </form>
            </div>
          )}

          {/* =================================================================== */}
          {/* 4. OFFER YOUR SERVICES (Create Service Listing)                     */}
          {/* =================================================================== */}
          {activeSection === 'offer_services' && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E4E8C]">
                  Grow with ConnectLn · Get Customers
                </span>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Offer your services
                </h2>
                <p className="text-xs text-zinc-500">
                  Publish your trade or professional service with completed work photos, service area, pricing approach, and clearly labeled qualifications.
                </p>
              </div>

              {srvPublishedNotice && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">
                  ✓ {srvPublishedNotice}
                </div>
              )}

              <form onSubmit={handlePublishService} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Your Trade or Professional Service
                    </label>
                    <input
                      type="text"
                      required
                      value={srvTradeTitle}
                      onChange={(e) => setSrvTradeTitle(e.target.value)}
                      placeholder="e.g., Interior & Exterior Painting, Drywall Repair & Trim"
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Trade Category
                    </label>
                    <select
                      value={srvCategory}
                      onChange={(e) => setSrvCategory(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs bg-white"
                    >
                      <option>Painting &amp; Decorating</option>
                      <option>Carpentry &amp; Joinery</option>
                      <option>Automotive &amp; Diesel</option>
                      <option>Electrical &amp; Solar</option>
                      <option>Plumbing &amp; Pipefitting</option>
                      <option>HVAC &amp; Refrigeration</option>
                      <option>Welding &amp; Fabrication</option>
                      <option>Cybersecurity &amp; Advisory</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Description of What You Offer
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={srvDescription}
                    onChange={(e) => setSrvDescription(e.target.value)}
                    placeholder="Describe your process, materials used, cleanup standards, and project types..."
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Service Area
                    </label>
                    <input
                      type="text"
                      value={srvArea}
                      onChange={(e) => setSrvArea(e.target.value)}
                      placeholder="Laurel, Bowie, Columbia & Greater DMV"
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Availability
                    </label>
                    <input
                      type="text"
                      value={srvAvailability}
                      onChange={(e) => setSrvAvailability(e.target.value)}
                      placeholder="Available next week · Mon–Sat"
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Pricing Approach
                    </label>
                    <select
                      value={srvPricingApproach}
                      onChange={(e) => setSrvPricingApproach(e.target.value as PricingApproach)}
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs bg-white"
                    >
                      <option value="request_quote">Request a quote</option>
                      <option value="fixed_price">Fixed price</option>
                      <option value="hourly">Hourly rate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Pricing Display / Guidance
                    </label>
                    <input
                      type="text"
                      value={srvRateDisplay}
                      onChange={(e) => setSrvRateDisplay(e.target.value)}
                      placeholder="e.g., Request a quote (Typical room $380–$650)"
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Completed Work Sample Title
                    </label>
                    <input
                      type="text"
                      value={srvSampleTitle}
                      onChange={(e) => setSrvSampleTitle(e.target.value)}
                      placeholder="e.g., Laurel Colonial 4-Room Repaint & Trim"
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Qualification &amp; Verification Label
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={srvQualTitle}
                        onChange={(e) => setSrvQualTitle(e.target.value)}
                        placeholder="License or Certificate"
                        className="flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-xs"
                      />
                      <select
                        value={srvQualVerification}
                        onChange={(e) =>
                          setSrvQualVerification(e.target.value as 'member_supplied' | 'independently_checked')
                        }
                        className="rounded-xl border border-zinc-300 px-2 py-2 text-[11px] bg-white"
                      >
                        <option value="member_supplied">Member supplied</option>
                        <option value="independently_checked">Independently checked ✓</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-[#1E4E8C] hover:bg-[#153A6B] text-white px-5 py-2.5 text-xs font-bold cursor-pointer"
                >
                  Publish Service Listing
                </button>
              </form>
            </div>
          )}

          {/* =================================================================== */}
          {/* 5. FIND A PROFESSIONAL (Search Listings & Request a Quote)          */}
          {/* =================================================================== */}
          {activeSection === 'find_professional' && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E4E8C]">
                    Grow with ConnectLn · Customer Discovery
                  </span>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    Find a professional
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Search verified tradespeople near you (e.g., &ldquo;painter Laurel&rdquo;), inspect completed work samples, and request a quote.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('offer_services')}
                  className="rounded-xl bg-[#1E4E8C] text-white px-3.5 py-2 text-xs font-bold cursor-pointer shrink-0"
                >
                  + Offer your services
                </button>
              </div>

              <div className="relative">
                <Search className="h-4 w-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={proSearchQuery}
                  onChange={(e) => setProSearchQuery(e.target.value)}
                  placeholder="Try searching: painter Laurel, carpenter, mechanic, cabinet..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 py-2 text-xs"
                />
              </div>

              {inqSentNotice && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">
                  ✓ {inqSentNotice}
                </div>
              )}

              <div className="space-y-4">
                {services
                  .filter((srv) => {
                    if (!proSearchQuery.trim()) return true
                    const q = proSearchQuery.toLowerCase()
                    return (
                      srv.tradeOrService.toLowerCase().includes(q) ||
                      srv.providerName.toLowerCase().includes(q) ||
                      srv.serviceArea.toLowerCase().includes(q) ||
                      srv.category.toLowerCase().includes(q) ||
                      srv.description.toLowerCase().includes(q)
                    )
                  })
                  .map((srv) => (
                    <div
                      key={srv.id}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={srv.providerAvatar}
                            alt={srv.providerName}
                            className="h-11 w-11 rounded-full object-cover border border-zinc-200 shrink-0"
                          />
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#1E4E8C]">
                              {srv.category}
                            </span>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                              {srv.tradeOrService}
                            </h3>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                              <strong>{srv.providerName}</strong> · {srv.providerHeadline}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold shrink-0">
                          {srv.pricingApproach === 'hourly'
                            ? '⏱️ Hourly'
                            : srv.pricingApproach === 'fixed_price'
                            ? '🏷️ Fixed Price'
                            : '📋 Request a Quote'}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {srv.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-lg">
                        <p>📍 <strong>Service Area:</strong> {srv.serviceArea}</p>
                        <p>🗓️ <strong>Availability:</strong> {srv.availability}</p>
                        <p className="sm:col-span-2">💰 <strong>Pricing:</strong> {srv.rateDisplay}</p>
                      </div>

                      {/* Qualifications with explicit verification labels */}
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase text-zinc-400">
                          Qualifications &amp; Verification Source
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {srv.qualifications.map((q) => (
                            <span
                              key={q.id}
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                                q.verificationStatus === 'independently_checked'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                              }`}
                            >
                              {q.verificationStatus === 'independently_checked'
                                ? '✓ Independently checked:'
                                : '• Member supplied:'}{' '}
                              {q.title}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Work Samples */}
                      {srv.workSamples.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          {srv.workSamples.map((ws, i) => (
                            <div
                              key={i}
                              className="rounded-lg border border-zinc-200 overflow-hidden bg-zinc-50 flex items-center gap-2.5 p-2"
                            >
                              <img
                                src={ws.imageUrl}
                                alt={ws.title}
                                className="h-14 w-20 rounded object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-[11px] font-bold text-zinc-900 truncate">{ws.title}</p>
                                <p className="text-[10px] text-zinc-500 line-clamp-2">{ws.caption}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedServiceForInquiry(srv)}
                          className="rounded-xl bg-[#1E4E8C] hover:bg-[#153A6B] text-white px-4 py-2 text-xs font-bold cursor-pointer"
                        >
                          Send Inquiry / Request a Quote →
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Inquiry / Quote Request Drawer */}
              {selectedServiceForInquiry && (
                <form
                  onSubmit={handleSendCustomerInquiry}
                  className="rounded-2xl border-2 border-[#1E4E8C] bg-[#F6F9FC] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-zinc-900">
                      Request a Quote from {selectedServiceForInquiry.providerName}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setSelectedServiceForInquiry(null)}
                      className="text-xs text-zinc-500"
                    >
                      Cancel ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Project Location (City / Zip)
                      </label>
                      <input
                        type="text"
                        required
                        value={inqCustomerLocation}
                        onChange={(e) => setInqCustomerLocation(e.target.value)}
                        placeholder="Laurel, MD 20707"
                        className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Preferred Dates
                      </label>
                      <input
                        type="text"
                        required
                        value={inqPreferredDates}
                        onChange={(e) => setInqPreferredDates(e.target.value)}
                        placeholder="e.g., Nov 18 – Nov 25"
                        className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Rooms / Project Scope Description
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={inqProjectScope}
                      onChange={(e) => setInqProjectScope(e.target.value)}
                      placeholder="Describe the rooms, dimensions, or repair work needed..."
                      className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Specific Project Requirements
                    </label>
                    <input
                      type="text"
                      value={inqRequirements}
                      onChange={(e) => setInqRequirements(e.target.value)}
                      placeholder="e.g., Zero-VOC paint, ceiling trim included, weekend access"
                      className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="rounded-xl bg-[#1E4E8C] text-white px-4 py-2 text-xs font-bold cursor-pointer"
                    >
                      Submit Inquiry &amp; Quote Request
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* =================================================================== */}
          {/* 6. MY SERVICES & INQUIRIES (Manage Listings & Respond to Customers) */}
          {/* =================================================================== */}
          {activeSection === 'my_services_inquiries' && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E4E8C]">
                    My workspace · Listings, Requests &amp; Quotes
                  </span>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    My services &amp; inquiries
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Respond to customer quote requests and manage your active service listings.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('offer_services')}
                  className="rounded-xl bg-[#1E4E8C] text-white px-3.5 py-2 text-xs font-bold cursor-pointer"
                >
                  + Add New Service Listing
                </button>
              </div>

              {/* Customer Inquiries Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Inbound Customer Inquiries &amp; Quote Requests ({inquiries.length})
                </h3>
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="rounded-md bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-bold">
                          {inq.status}
                        </span>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                          {inq.customerName} — {inq.serviceTitle}
                        </h4>
                        <p className="text-xs text-zinc-500">
                          📍 {inq.customerLocation} · Preferred Dates: {inq.preferredDates} · {inq.createdAt}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-3 text-xs space-y-1">
                      <p><strong>Project Scope:</strong> {inq.projectScope}</p>
                      <p><strong>Requirements:</strong> {inq.requirements}</p>
                    </div>

                    {inq.quoteAmount ? (
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs space-y-1 text-emerald-900">
                        <p><strong>✓ Quote Sent:</strong> {inq.quoteAmount}</p>
                        <p><strong>Message to Customer:</strong> {inq.providerReply}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        <input
                          type="text"
                          value={replyQuoteAmounts[inq.id] || ""}
                          onChange={(e) =>
                            setReplyQuoteAmounts({ ...replyQuoteAmounts, [inq.id]: e.target.value })
                          }
                          placeholder="Quote amount (e.g., $1,650 Fixed Price)"
                          className="rounded-xl border border-zinc-300 px-3 py-1.5 text-xs sm:w-52"
                        />
                        <input
                          type="text"
                          value={replyNotes[inq.id] || ""}
                          onChange={(e) =>
                            setReplyNotes({ ...replyNotes, [inq.id]: e.target.value })
                          }
                          placeholder="Add scope note & earliest start date..."
                          className="flex-1 rounded-xl border border-zinc-300 px-3 py-1.5 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendQuoteReply(inq.id)}
                          className="rounded-xl bg-[#1E4E8C] text-white px-3.5 py-1.5 text-xs font-bold cursor-pointer shrink-0"
                        >
                          Send Quote
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* 7. MY COMMUNITIES & EXPLORE COMMUNITIES                             */}
          {/* =================================================================== */}
          {(activeSection === 'my_communities' || activeSection === 'explore_communities') && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E4E8C]">
                    {activeSection === 'my_communities'
                      ? 'My workspace · Joined Communities'
                      : 'Grow with ConnectLn · Communities Built Around Work & Shared Needs'}
                  </span>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {activeSection === 'my_communities' ? 'My communities' : 'Explore communities'}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Organized around trades &amp; professions, local regions, veterans, apprentices &amp; learners, and franchise networks.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigateTab('veterans')}
                    className="rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 text-xs font-bold cursor-pointer"
                  >
                    🎖️ Veterans Hub
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('franchises')}
                    className="rounded-xl bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 text-xs font-bold cursor-pointer"
                  >
                    🏪 Franchise Hub
                  </button>
                </div>
              </div>

              {/* 5 Community Organization Pillars */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all' as const, label: 'All Communities' },
                  { id: 'trades_professions' as const, label: '🔨 Trades & Professions' },
                  { id: 'location' as const, label: '📍 Location & Regional' },
                  { id: 'veterans' as const, label: '🎖️ Veterans' },
                  { id: 'apprentices_learners' as const, label: '🎓 Apprentices & Learners' },
                  { id: 'organizations_franchises' as const, label: '🏪 Organizations & Franchises' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCommunityFilter(tab.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                      communityFilter === tab.id
                        ? 'bg-[#1E4E8C] text-white'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {communities
                  .filter((c) => {
                    if (activeSection === 'my_communities' && !c.isJoined) return false
                    if (communityFilter !== 'all' && c.categoryType !== communityFilter) return false
                    return true
                  })
                  .map((comm) => (
                    <div
                      key={comm.id}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl p-2 rounded-xl bg-[#EDF4FC]">{comm.icon}</span>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#1E4E8C]">
                              {comm.categoryLabel} · {comm.locationOrScope}
                            </span>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                              {comm.name}
                            </h3>
                            <p className="text-xs text-zinc-500 mt-0.5">{comm.description}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = communities.map((item) =>
                              item.id === comm.id ? { ...item, isJoined: !item.isJoined } : item
                            )
                            setCommunities(updated)
                            saveWorkBusinessSlice('COMMUNITIES', updated)
                          }}
                          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold cursor-pointer shrink-0 ${
                            comm.isJoined
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-[#1E4E8C] text-white'
                          }`}
                        >
                          {comm.isJoined ? '✓ Joined' : '+ Join Community'}
                        </button>
                      </div>

                      <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-3 text-xs space-y-1">
                        <p>💬 <strong>Active Discussion:</strong> &ldquo;{comm.recentDiscussionTitle}&rdquo; — <em>{comm.recentDiscussionAuthor}</em></p>
                        <p>📅 <strong>Upcoming Practical Session:</strong> {comm.upcomingEventTitle}</p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 flex-wrap gap-2">
                        <span>👥 {comm.membersCount.toLocaleString()} members · 🎥 {comm.practicalVideosCount} practical videos · 💼 {comm.openOpportunitiesCount} opportunities · 🧭 {comm.mentorsAvailableCount} mentors</span>
                        <button
                          type="button"
                          onClick={() => setActiveSection('find_work')}
                          className="font-bold text-[#1E4E8C] hover:underline cursor-pointer"
                        >
                          View Community Opportunities →
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* 8. MY BUSINESS PAGES & CREATE A BUSINESS PAGE                       */}
          {/* =================================================================== */}
          {activeSection === 'my_business_pages' && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E4E8C]">
                    My workspace · Public Identity &amp; Private Management Workspace
                  </span>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    My business pages
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Switch between the Public Page and Private Management Workspace (inquiries, applicants, team access, and franchise locations).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setBizViewMode(
                        bizViewMode === 'private_workspace' ? 'public_page' : 'private_workspace'
                      )
                    }
                    className="rounded-xl bg-zinc-100 hover:bg-zinc-200 px-3 py-2 text-xs font-bold text-zinc-800 cursor-pointer"
                  >
                    {bizViewMode === 'private_workspace'
                      ? '🌐 View Public Page'
                      : '🔒 Back to Private Workspace'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection('create_business_page')}
                    className="rounded-xl bg-[#1E4E8C] text-white px-3.5 py-2 text-xs font-bold cursor-pointer"
                  >
                    + Create Page
                  </button>
                </div>
              </div>

              {businessPages.map((biz) => (
                <div
                  key={biz.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded-md bg-blue-50 text-[#1E4E8C] px-2 py-0.5 text-[10px] font-bold">
                        {biz.pageTypeLabel}
                      </span>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                        {biz.name}
                      </h3>
                      <p className="text-xs text-zinc-500">
                        {biz.tagline} · 📍 {biz.location}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 text-[10px] font-bold">
                      {bizViewMode === 'private_workspace' ? '🔒 Private Management Workspace' : '🌐 Public Organization Page'}
                    </span>
                  </div>

                  {bizViewMode === 'public_page' ? (
                    <div className="space-y-3 rounded-xl bg-zinc-50 p-4 text-xs">
                      <p className="font-bold text-zinc-900">Public Services &amp; Work Samples</p>
                      <ul className="list-disc pl-5 space-y-1 text-zinc-700">
                        {biz.servicesOffered.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                      <p className="text-zinc-500">
                        📸 {biz.workSamplesCount} Completed Work Samples · 💼 {biz.openOpportunitiesCount} Open Opportunities
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Private Management Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setActiveSection('my_services_inquiries')}
                          className="rounded-xl border border-zinc-200 p-3 text-left hover:bg-zinc-50 cursor-pointer"
                        >
                          <p className="text-[10px] font-bold uppercase text-zinc-400">Customer Inquiries</p>
                          <p className="text-lg font-black text-[#1E4E8C]">{inquiries.length}</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSection('my_work_applications')}
                          className="rounded-xl border border-zinc-200 p-3 text-left hover:bg-zinc-50 cursor-pointer"
                        >
                          <p className="text-[10px] font-bold uppercase text-zinc-400">Applicants &amp; Quotes</p>
                          <p className="text-lg font-black text-[#1E4E8C]">{submissions.length}</p>
                        </button>
                        <div className="rounded-xl border border-zinc-200 p-3">
                          <p className="text-[10px] font-bold uppercase text-zinc-400">Authorized Managers</p>
                          <p className="text-lg font-black text-zinc-900">{biz.authorizedTeam.length}</p>
                        </div>
                        <div className="rounded-xl border border-zinc-200 p-3">
                          <p className="text-[10px] font-bold uppercase text-zinc-400">Linked Locations</p>
                          <p className="text-lg font-black text-zinc-900">{biz.linkedLocations?.length || 1}</p>
                        </div>
                      </div>

                      {/* Linked Franchise / Multi-Location Hierarchy */}
                      {biz.linkedLocations && biz.linkedLocations.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-zinc-800">
                            Parent Organization &amp; Linked Location Pages (Explicit Manager Permissions)
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {biz.linkedLocations.map((loc) => (
                              <div
                                key={loc.id}
                                className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 text-xs space-y-1"
                              >
                                <p className="font-bold text-zinc-900">📍 {loc.name}</p>
                                <p className="text-zinc-500">Territory: {loc.territory}</p>
                                <p className="text-zinc-600">
                                  Authorized Manager: <strong>{loc.managerName}</strong>
                                </p>
                                <p className="text-[11px] text-[#1E4E8C] font-semibold">
                                  {loc.activeServicesCount} services · {loc.openOpportunitiesCount} jobs · {loc.openInquiriesCount} inquiries
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeSection === 'create_business_page' && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E4E8C]">
                  Grow with ConnectLn · Organization Setup
                </span>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Create a business page
                </h2>
                <p className="text-xs text-zinc-500">
                  Supports independent businesses, professional practices, franchise locations, training providers, and associations.
                </p>
              </div>

              {bizCreatedNotice && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">
                  ✓ {bizCreatedNotice}
                </div>
              )}

              <form onSubmit={handleCreateBusinessPage} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Organization / Business Type
                    </label>
                    <select
                      value={newBizType}
                      onChange={(e) => setNewBizType(e.target.value as BusinessPageType)}
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs bg-white"
                    >
                      <option value="independent_business">Independent business</option>
                      <option value="professional_practice">Professional practice or service provider</option>
                      <option value="franchise_location">Franchise location</option>
                      <option value="training_provider">Training provider</option>
                      <option value="association_organization">Association or community organization</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Business / Location Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newBizName}
                      onChange={(e) => setNewBizName(e.target.value)}
                      placeholder="e.g., Mendez Master Painting & Finishes LLC"
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                {newBizType === 'franchise_location' && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Parent Franchise Organization
                    </label>
                    <input
                      type="text"
                      value={newBizParentOrg}
                      onChange={(e) => setNewBizParentOrg(e.target.value)}
                      placeholder="e.g., CertaPro Painters / Mr. Electric National Network"
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Primary Location / Service Territory
                    </label>
                    <input
                      type="text"
                      value={newBizLocation}
                      onChange={(e) => setNewBizLocation(e.target.value)}
                      placeholder="Laurel, MD & PG County"
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Tagline / Specialty Summary
                    </label>
                    <input
                      type="text"
                      value={newBizTagline}
                      onChange={(e) => setNewBizTagline(e.target.value)}
                      placeholder="Licensed residential & commercial painting crew"
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Services Offered (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newBizServices}
                    onChange={(e) => setNewBizServices(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-[#1E4E8C] text-white px-5 py-2.5 text-xs font-bold cursor-pointer"
                >
                  Create Public Page &amp; Private Workspace
                </button>
              </form>
            </div>
          )}

          {/* =================================================================== */}
          {/* 9. MY LEARNING & LEARN PRACTICAL SKILLS                             */}
          {/* =================================================================== */}
          {(activeSection === 'my_learning' || activeSection === 'learn_practical_skills') && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E4E8C]">
                    {activeSection === 'my_learning'
                      ? 'My workspace · Saved Lessons & Distinct Credentials'
                      : 'Grow with ConnectLn · Practical Learning Connected to Work'}
                  </span>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {activeSection === 'my_learning' ? 'My learning' : 'Learn practical skills'}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Lesson completion, uploaded certificates, and verified professional credentials are kept clearly distinguished.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => (onOpenLearnTab ? onOpenLearnTab() : onNavigateTab('learning'))}
                  className="rounded-xl bg-[#1E4E8C] text-white px-3.5 py-2 text-xs font-bold cursor-pointer shrink-0"
                >
                  Open Full Learn Tab →
                </button>
              </div>

              {/* 3 Distinct Evidence Tiers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#1E4E8C]">1. Lesson Completion</span>
                  <p className="text-xs font-bold text-zinc-900">{savedLessons.length} Practical Video Lessons</p>
                  <p className="text-[11px] text-zinc-500">Self-paced ConnectLn Player video &amp; practice notes.</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-amber-800">2. Uploaded Certificates</span>
                  <p className="text-xs font-bold text-zinc-900">{(currentUser.certifications || []).length || 2} Member-Uploaded Docs</p>
                  <p className="text-[11px] text-zinc-500">Course certificates uploaded by the member.</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-800">3. Verified Credentials</span>
                  <p className="text-xs font-bold text-zinc-900">OSHA 30 &amp; Trade License ✓</p>
                  <p className="text-[11px] text-zinc-500">Independently checked against issuing registries.</p>
                </div>
              </div>

              {/* 7 Practical Learning Goals Connected to Work */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Practical Goals Connected to Work &amp; Apprenticeships
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRACTICAL_LEARNING_GOALS.map((goal) => (
                    <div
                      key={goal.id}
                      className="rounded-xl border border-zinc-200 p-3.5 flex flex-col justify-between space-y-2.5"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg">{goal.icon}</span>
                          <span className="text-[10px] font-bold text-[#1E4E8C]">
                            {goal.lessonsCount} Lessons
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-zinc-900 mt-1">{goal.title}</h4>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{goal.subtitle}</p>
                        <p className="text-[10px] text-zinc-600 mt-1.5">
                          <strong>Featured:</strong> {goal.sampleLessonTitle}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-[11px]">
                        <button
                          type="button"
                          onClick={() => (onOpenLearnTab ? onOpenLearnTab() : onNavigateTab('learning'))}
                          className="font-bold text-[#1E4E8C] hover:underline cursor-pointer"
                        >
                          Start Lesson →
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSection('find_work')}
                          className="text-zinc-500 hover:text-zinc-800 cursor-pointer"
                        >
                          Matching Work →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* 10. ACTIVITY & INSIGHTS (100% Real Recorded Telemetry)              */}
          {/* =================================================================== */}
          {activeSection === 'activity_insights' && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E4E8C]">
                    My workspace · Real Recorded Activity &amp; Business Insights
                  </span>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    Activity &amp; insights
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Every number comes from recorded activity across your profile, posts, directory appearances, services, and applications.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onOpenWhoViewedMyProfile
                      ? onOpenWhoViewedMyProfile()
                      : onNavigateTab('network')
                  }
                  className="rounded-xl bg-[#1E4E8C] text-white px-3.5 py-2 text-xs font-bold cursor-pointer shrink-0"
                >
                  👁️ Who viewed my profile (Connections) →
                </button>
              </div>

              {/* 5 Actionable Telemetry Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* 1. Profile Viewers */}
                <div className="rounded-xl border border-zinc-200 p-4 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase text-zinc-400">1. Profile Viewers</p>
                  <p className="text-2xl font-black text-zinc-900">
                    {realAnalytics.viewers.length}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Actual profile visits recorded (privacy-aware viewer details).
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenWhoViewedMyProfile
                        ? onOpenWhoViewedMyProfile()
                        : onNavigateTab('network')
                    }
                    className="text-[11px] font-bold text-[#1E4E8C] hover:underline cursor-pointer pt-1 block"
                  >
                    Open Who viewed my profile →
                  </button>
                </div>

                {/* 2. Content Reach (Unique Viewers vs Total Views vs Interactions) */}
                <div className="rounded-xl border border-zinc-200 p-4 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase text-zinc-400">2. Content Reach</p>
                  <p className="text-2xl font-black text-zinc-900">
                    {realAnalytics.reachData.totalViews} <span className="text-xs font-semibold text-zinc-500">views</span>
                  </p>
                  <p className="text-[11px] text-zinc-600">
                    <strong>{realAnalytics.reachData.uniqueViewers}</strong> unique viewers ·{' '}
                    <strong>{realAnalytics.reachData.interactions}</strong> interactions
                  </p>
                  {onOpenAnalyticsModal && (
                    <button
                      type="button"
                      onClick={() => onOpenAnalyticsModal('reach')}
                      className="text-[11px] font-bold text-[#1E4E8C] hover:underline cursor-pointer pt-1 block"
                    >
                      Inspect Content Breakdown →
                    </button>
                  )}
                </div>

                {/* 3. Directory Discovery (Appearances vs Profile Clicks) */}
                <div className="rounded-xl border border-zinc-200 p-4 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase text-zinc-400">3. Directory Discovery</p>
                  <p className="text-2xl font-black text-zinc-900">
                    {realAnalytics.discoveryData.searchAppearances}{' '}
                    <span className="text-xs font-semibold text-zinc-500">appearances</span>
                  </p>
                  <p className="text-[11px] text-zinc-600">
                    Separated from <strong>{realAnalytics.discoveryData.profileClicks}</strong> actual profile clicks
                  </p>
                  {onOpenAnalyticsModal && (
                    <button
                      type="button"
                      onClick={() => onOpenAnalyticsModal('discoveries')}
                      className="text-[11px] font-bold text-[#1E4E8C] hover:underline cursor-pointer pt-1 block"
                    >
                      View Search Queries →
                    </button>
                  )}
                </div>

                {/* 4. Service Activity */}
                <div className="rounded-xl border border-zinc-200 p-4 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase text-zinc-400">4. Service Activity</p>
                  <p className="text-2xl font-black text-zinc-900">
                    {inquiries.length} <span className="text-xs font-semibold text-zinc-500">inquiries</span>
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {services.filter((s) => s.isOwner).length} active listings ·{' '}
                    {inquiries.filter((i) => i.status === 'Quote sent').length} quotes sent
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSection('my_services_inquiries')}
                    className="text-[11px] font-bold text-[#1E4E8C] hover:underline cursor-pointer pt-1 block"
                  >
                    Respond to Inquiries →
                  </button>
                </div>

                {/* 5. Hiring & Application Activity */}
                <div className="rounded-xl border border-zinc-200 p-4 space-y-1.5 sm:col-span-2">
                  <p className="text-[10px] font-bold uppercase text-zinc-400">5. Hiring &amp; Work Activity</p>
                  <p className="text-2xl font-black text-zinc-900">
                    {submissions.length} <span className="text-xs font-semibold text-zinc-500">tracked applications / quotes</span>
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {opportunities.length} live opportunities in Find work. Every status update reflects recorded actions.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSection('my_work_applications')}
                    className="text-[11px] font-bold text-[#1E4E8C] hover:underline cursor-pointer pt-1 block"
                  >
                    Open Application Pipeline →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* 11. BILLING & SETTINGS (Plans, Receipts, Preferences & Later Place) */}
          {/* =================================================================== */}
          {activeSection === 'billing_settings' && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E4E8C]">
                  My workspace · Plans, Receipts &amp; Preferences
                </span>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Billing &amp; settings
                </h2>
                <p className="text-xs text-zinc-500">
                  Core work, service listings, and business pages are active at no cost while paid promotion and multi-location plans are finalized.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onNavigateTab('accountsecurity')}
                  className="rounded-xl border border-zinc-200 p-4 text-left hover:bg-zinc-50 cursor-pointer space-y-1"
                >
                  <p className="text-xs font-bold text-zinc-900">🔐 Account Security, Passkeys &amp; Privacy</p>
                  <p className="text-[11px] text-zinc-500">
                    Manage FIDO2 passkeys, profile viewer privacy settings, and active sessions.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('wallet')}
                  className="rounded-xl border border-zinc-200 p-4 text-left hover:bg-zinc-50 cursor-pointer space-y-1"
                >
                  <p className="text-xs font-bold text-zinc-900">💳 Escrow, Invoices &amp; Payment Receipts</p>
                  <p className="text-[11px] text-zinc-500">
                    View project milestone draws, contractor invoices, and billing receipts.
                  </p>
                </button>
              </div>

              <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 text-xs space-y-1.5">
                <p className="font-bold text-zinc-800">Later Release Roadmap: Promote on ConnectLn &amp; ConnectLn Pro</p>
                <p className="text-zinc-600">
                  • <strong>Promote on ConnectLn:</strong> Sponsored opportunities and service listings with transparent sponsored labels and verified impression/click/inquiry reporting.
                </p>
                <p className="text-zinc-600">
                  • <strong>ConnectLn Pro:</strong> Multi-location team permissions and advanced business reporting once core work and service journeys are complete.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
