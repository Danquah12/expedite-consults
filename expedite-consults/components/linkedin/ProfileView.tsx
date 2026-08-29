"use client"

import React, { useState } from "react"
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
  ArrowRight
} from "lucide-react"
import { UserProfile } from "@/lib/linkedin-data"
import {
  WORKSPACE_PORTFOLIO_DATA,
  WORKSPACE_VERIFIED_SKILLS_DATA,
  WORKSPACE_CERTIFICATIONS_DATA,
  WORKSPACE_EXPERIENCE_DATA,
  WORKSPACE_PUBLICATIONS_DATA,
  WORKSPACE_REVIEWS_DATA,
  MY_PRODUCTS_DATA,
  VendorProductItem
} from "@/lib/my-workspace-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ProfileViewProps {
  user: UserProfile
  onBackToFeed?: () => void
  onNavigateMarketplace?: () => void
}

export function ProfileView({
  user,
  onBackToFeed,
  onNavigateMarketplace
}: ProfileViewProps) {
  // 8 Workspace Sub-Sections
  const [workspaceSection, setWorkspaceSection] = useState<
    'profile' | 'portfolio' | 'skills' | 'certifications' | 'experience' | 'publications' | 'reviews' | 'products'
  >('profile')

  // Developer / Company Products State
  const [myProducts, setMyProducts] = useState<VendorProductItem[]>(MY_PRODUCTS_DATA)
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)
  const [newProductName, setNewProductName] = useState("")
  const [newProductCategory, setNewProductCategory] = useState<'Software' | 'Training' | 'Services' | 'Enterprise Solutions'>('Software')
  const [newProductPrice, setNewProductPrice] = useState("")
  const [productAddedSuccess, setProductAddedSuccess] = useState(false)

  // Skill Endorsement State
  const [skills, setSkills] = useState(WORKSPACE_VERIFIED_SKILLS_DATA)

  const handleEndorseSkill = (skillName: string) => {
    setSkills(prev =>
      prev.map(s => (s.name === skillName ? { ...s, endorsementsCount: s.endorsementsCount + 1 } : s))
    )
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
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-indigo-500/20 px-3 py-0.5 text-xs font-bold text-indigo-300 border border-indigo-400/40 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
                ConnectIn Developer &amp; Professional Workspace
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                TS/SCI Polygraph Verified · Fellow Grade
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              My Workspace
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Manage your professional identity, completed technical portfolios, verified skills &amp; certifications, peer reviews, and your <strong>commercial products &amp; seller storefront</strong>.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl bg-black/40 border border-white/15 p-3.5 text-center min-w-[140px]">
              <span className="text-[10px] uppercase font-mono text-purple-300">Seller MRR</span>
              <p className="text-xl font-black text-emerald-400">$122.7K</p>
              <span className="text-[10px] text-zinc-400">4 Active Listings</span>
            </div>
            <div className="rounded-2xl bg-black/40 border border-white/15 p-3.5 text-center min-w-[140px]">
              <span className="text-[10px] uppercase font-mono text-indigo-300">Expert Reviewer</span>
              <p className="text-xl font-black text-amber-300">4.98 ⭐</p>
              <span className="text-[10px] text-zinc-400">127 Reviews Done</span>
            </div>
          </div>
        </div>

        {/* 8 Workspace Sections Switcher Ribbon */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'profile', label: '👤 Profile', icon: ShieldCheck },
            { id: 'portfolio', label: '💼 Portfolio', icon: FolderGit2 },
            { id: 'skills', label: '🛡️ Verified Skills', icon: Zap },
            { id: 'certifications', label: '📜 Certifications', icon: Award },
            { id: 'experience', label: '🏛️ Experience', icon: Briefcase },
            { id: 'publications', label: '📑 Publications', icon: FileText },
            { id: 'reviews', label: '⭐ Peer Reviews', icon: Star },
            { id: 'products', label: '🛍️ My Products (Seller Desk)', icon: Store, isHighlight: true }
          ].map((sec) => {
            const isSelected = workspaceSection === sec.id
            return (
              <button
                key={sec.id}
                onClick={() => setWorkspaceSection(sec.id as any)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? sec.isHighlight
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-extrabold"
                      : "bg-white text-zinc-950 shadow-md font-extrabold"
                    : sec.isHighlight
                    ? "bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 border border-purple-400/40"
                    : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
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
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            {/* Banner Cover */}
            <div className="relative h-44 w-full bg-gradient-to-r from-[#0A66C2] via-indigo-700 to-purple-800">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80"
                alt="Banner"
                className="h-full w-full object-cover opacity-50"
              />
            </div>

            {/* Profile Avatar & Primary Details */}
            <div className="relative px-6 pb-6 pt-0">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 gap-4">
                <div className="flex items-end gap-4">
                  <div className="relative h-28 w-28 rounded-2xl border-4 border-white bg-white shadow-xl overflow-hidden dark:border-zinc-900 shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="space-y-1 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                        {user.name}
                      </h2>
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-[#0A66C2] dark:bg-blue-950 dark:text-blue-300 flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verified Fellow
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                      {user.headline}
                    </p>
                    <p className="text-xs text-zinc-500 flex items-center gap-2">
                      <span>📍 {user.location}</span>
                      <span>·</span>
                      <span className="text-[#0A66C2] font-semibold">{user.connectionsCount} connections</span>
                      <span>·</span>
                      <span className="text-emerald-600 font-bold">TS/SCI Polygraph Active</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setWorkspaceSection('products')}
                    className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md flex items-center gap-1.5"
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
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PORTFOLIO (COMPLETED PROJECTS) */}
      {/* ========================================================================= */}
      {workspaceSection === 'portfolio' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-indigo-600" />
              <span>Completed Engineering Projects &amp; Architectures ({WORKSPACE_PORTFOLIO_DATA.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {WORKSPACE_PORTFOLIO_DATA.map((proj) => (
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
      {/* 3. VERIFIED SKILLS */}
      {/* ========================================================================= */}
      {workspaceSection === 'skills' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                <span>Verified Skill Capability Graph</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map((skill) => (
                <div
                  key={skill.name}
                  className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {skill.name}
                      </h4>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Verified ✓
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      Validated by: <strong>{skill.verifiedBy}</strong>
                    </p>
                    <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                      {skill.proficiencyLevel} · {skill.endorsementsCount} endorsements
                    </span>
                  </div>

                  <button
                    onClick={() => handleEndorseSkill(skill.name)}
                    className="rounded-lg bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 px-3 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-100 hover:bg-[#0A66C2] hover:text-white transition-all shadow-xs"
                  >
                    + Endorse ({skill.endorsementsCount})
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CERTIFICATIONS */}
      {/* ========================================================================= */}
      {workspaceSection === 'certifications' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WORKSPACE_CERTIFICATIONS_DATA.map((cert) => (
              <div
                key={cert.credentialId}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex items-start gap-4"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-2xl border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 shrink-0">
                  {cert.badgeIcon}
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
        <div className="space-y-4">
          {WORKSPACE_EXPERIENCE_DATA.map((exp, i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    {exp.role}
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold text-[#0A66C2]">{exp.company}</p>
                  <p className="text-xs text-zinc-400">{exp.period} · {exp.location}</p>
                </div>
                {exp.isCurrent && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Present Role
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {exp.description}
              </p>

              <div className="space-y-1 text-xs pt-1">
                <p className="font-bold text-zinc-700 dark:text-zinc-300">Key Security &amp; Architectural Milestones:</p>
                <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
                  {exp.achievements.map((ach, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. PUBLICATIONS */}
      {/* ========================================================================= */}
      {workspaceSection === 'publications' && (
        <div className="space-y-4">
          {WORKSPACE_PUBLICATIONS_DATA.map((pub, i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                  {pub.type}
                </span>
                <span className="text-xs text-zinc-400 font-mono">{pub.citationsCount} Citations</span>
              </div>

              <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                {pub.title}
              </h4>
              <p className="text-xs text-zinc-500">{pub.publisher} · {pub.date}</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">{pub.summary}</p>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. PEER REVIEWS */}
      {/* ========================================================================= */}
      {workspaceSection === 'reviews' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WORKSPACE_REVIEWS_DATA.map((rev, i) => (
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

                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    <span>{rev.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 italic leading-relaxed">
                  "{rev.comment}"
                </p>
                <span className="text-[10px] text-zinc-400 font-mono">{rev.reviewType} · {rev.date}</span>
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
    </div>
  )
}
