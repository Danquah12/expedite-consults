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
  Check
} from "lucide-react"
import { UserProfile } from "@/lib/linkedin-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProofOfWorkSandbox } from "./ProofOfWorkSandbox"
import { BentoPortfolioView } from "./BentoPortfolioView"

interface ProfileViewProps {
  user: UserProfile
  onBackToFeed?: () => void
}

export function ProfileView({ user, onBackToFeed }: ProfileViewProps) {
  const [profileLayout, setProfileLayout] = useState<'classic' | 'bento'>('classic')
  const [skillsList, setSkillsList] = useState(user.skills)
  const [recommendationsList, setRecommendationsList] = useState(user.recommendations)
  const [activeRecTab, setActiveRecTab] = useState<'received' | 'given'>('received')
  const [isAskRecModalOpen, setIsAskRecModalOpen] = useState(false)
  const [recColleague, setRecColleague] = useState("")
  const [recMessage, setRecMessage] = useState("")
  const [recSubmitted, setRecSubmitted] = useState(false)

  const handleEndorse = (skillName: string) => {
    setSkillsList(prev =>
      prev.map(s => (s.name === skillName ? { ...s, endorsements: s.endorsements + 1 } : s))
    )
  }

  const handleSendRecRequest = (e: React.FormEvent) => {
    e.preventDefault()
    setRecSubmitted(true)
    setTimeout(() => {
      setIsAskRecModalOpen(false)
      setRecSubmitted(false)
      setRecColleague("")
      setRecMessage("")
    }, 1500)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-12">
      {/* Layout Mode Switcher Bar */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-2.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 pl-2">
          Profile Presentation Mode:
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setProfileLayout('classic')}
            className={`rounded-lg px-3.5 py-1 text-xs font-bold transition-all ${
              profileLayout === 'classic'
                ? "bg-[#0A66C2] text-white shadow-xs"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            Classic Profile
          </button>
          <button
            onClick={() => setProfileLayout('bento')}
            className={`rounded-lg px-3.5 py-1 text-xs font-bold transition-all flex items-center gap-1 ${
              profileLayout === 'bento'
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            <span>🍱 Bento Showcase (Read.cv Style)</span>
          </button>
        </div>
      </div>

      {profileLayout === 'bento' ? (
        <BentoPortfolioView user={user} />
      ) : (
        <>
      {/* Top Header Card */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {/* Cover Photo */}
        <div className="relative h-44 sm:h-56 w-full bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-900">
          <img
            src={user.coverImage}
            alt="Cover"
            className="h-full w-full object-cover opacity-75"
          />
          <button className="absolute right-4 top-4 rounded-full bg-white/80 p-2 text-zinc-700 backdrop-blur-xs hover:bg-white transition-colors dark:bg-zinc-900/80 dark:text-zinc-200">
            <Edit3 className="h-4 w-4" />
          </button>
        </div>

        {/* Profile Info Row */}
        <div className="relative px-6 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 mb-4 gap-4">
            <div className="relative h-32 w-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden dark:border-zinc-900">
              <img
                src={user.avatar}
                alt={user.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-[#0A66C2]/90 py-0.5 text-center text-[10px] font-bold text-white uppercase tracking-wider">
                #OPEN_TO_WORK
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="rounded-full bg-[#0A66C2] px-5 py-1.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#004182] transition-colors shadow-xs">
                Open to
              </button>
              <button className="rounded-full border border-[#0A66C2] px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-colors">
                Add profile section
              </button>
              <button className="rounded-full border border-zinc-400 p-1.5 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {user.name}
              </h1>
              <ShieldCheck className="h-5 w-5 text-[#0A66C2]" />
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-[#0A66C2] dark:bg-blue-950/40">
                1st
              </span>
            </div>

            <p className="mt-1 text-sm sm:text-base text-zinc-800 dark:text-zinc-200">
              {user.headline}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                {user.location}
              </span>
              <span className="font-semibold text-[#0A66C2] hover:underline cursor-pointer">
                {user.connectionsCount}+ connections
              </span>
              <span>·</span>
              <span>{user.followersCount.toLocaleString()} followers</span>
            </div>
          </div>

          {/* Open To Work Callout Box */}
          {user.openToWork.isOpen && (
            <div className="mt-5 rounded-xl border border-blue-200 bg-sky-50/60 p-3.5 dark:border-blue-900/50 dark:bg-sky-950/20">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                    Open to work
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                    {user.openToWork.roles.join(' · ')}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {user.openToWork.locations.join(' · ')} ({user.openToWork.jobTypes.join(', ')})
                  </p>
                </div>
                <button className="rounded-full p-1 text-zinc-500 hover:bg-sky-100 dark:hover:bg-sky-900/40">
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Strength Meter (All-Star 100%) */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              Profile Strength: All-Star
            </h3>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            100% Completed
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          Members with All-Star profiles receive up to 40x more recruiter inboxes and search impressions.
        </p>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div className="h-full rounded-full bg-gradient-to-r from-[#0A66C2] to-emerald-500 w-full" />
        </div>
      </div>

      {/* Featured Items Carousel */}
      {user.featured && user.featured.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Featured Publications & Blueprints
            </h3>
            <button className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user.featured.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-800/40 flex flex-col justify-between"
              >
                <div>
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-32 w-full object-cover"
                  />
                  <div className="p-3.5 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A66C2]">
                      {item.type}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-zinc-900 leading-snug dark:text-zinc-100 line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="text-xs text-zinc-600 line-clamp-2 dark:text-zinc-400">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 pt-0 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-200/60 dark:border-zinc-700/60 mt-2">
                  <span>{item.engagement}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-500 hover:text-[#0A66C2] cursor-pointer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Proof-of-Work Architecture Sandbox */}
      <ProofOfWorkSandbox />

      {/* Analytics Dashboard */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
          Analytics
        </h3>
        <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
          <Eye className="h-3.5 w-3.5" /> Private to you
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
            <div className="flex items-center gap-2 text-zinc-500">
              <Eye className="h-4 w-4 text-[#0A66C2]" />
              <span className="text-xs font-semibold">Profile viewers</span>
            </div>
            <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {user.profileViews.toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium">↑ 18% past 7 days</p>
          </div>

          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
            <div className="flex items-center gap-2 text-zinc-500">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold">Post impressions</span>
            </div>
            <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {user.postImpressions.toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium">↑ 42% this month</p>
          </div>

          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
            <div className="flex items-center gap-2 text-zinc-500">
              <Search className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-semibold">Search appearances</span>
            </div>
            <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {user.searchAppearances.toLocaleString()}
            </p>
            <p className="text-[11px] text-zinc-500">Found by top tech recruiters</p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
            About
          </h3>
          <button className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <Edit3 className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-3 text-xs sm:text-sm text-zinc-700 leading-relaxed dark:text-zinc-300 whitespace-pre-line">
          {user.about}
        </p>
      </div>

      {/* Experience Timeline */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
            Experience
          </h3>
          <div className="flex items-center gap-1">
            <button className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <Plus className="h-4 w-4" />
            </button>
            <button className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <Edit3 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-6">
          {user.experience.map((exp) => (
            <div key={exp.id} className="flex items-start gap-4">
              <img
                src={exp.companyLogo}
                alt={exp.company}
                className="h-12 w-12 rounded-md object-cover ring-1 ring-zinc-200 dark:ring-zinc-800"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {exp.role}
                </h4>
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {exp.company} · {exp.employmentType}
                </p>
                <p className="text-[11px] text-zinc-400">{exp.duration}</p>
                <p className="text-[11px] text-zinc-400">{exp.location}</p>
                <p className="mt-2 text-xs text-zinc-700 leading-normal dark:text-zinc-300">
                  {exp.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Licenses & Certifications */}
      {user.certifications && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-600" />
              Licenses & Certifications
            </h3>
            <button className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 space-y-5">
            {user.certifications.map((cert) => (
              <div key={cert.id} className="flex items-start gap-4">
                <img
                  src={cert.issuerLogo}
                  alt={cert.issuer}
                  className="h-12 w-12 rounded-md object-cover ring-1 ring-zinc-200 dark:ring-zinc-800"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {cert.title}
                  </h4>
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {cert.issuer}
                  </p>
                  <p className="text-[11px] text-zinc-400">{cert.issueDate}</p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Credential ID: <span className="font-mono">{cert.credentialId}</span>
                  </p>
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    Show credential <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Received & Given */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 gap-3">
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
            Recommendations
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAskRecModalOpen(true)}
              className="flex items-center gap-1 text-xs font-semibold text-[#0A66C2] hover:underline"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" /> Ask for a recommendation
            </button>
          </div>
        </div>

        {/* Rec Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveRecTab('received')}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
              activeRecTab === 'received'
                ? "bg-[#0A66C2] text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            Received ({recommendationsList.filter(r => r.type === 'received').length})
          </button>
          <button
            onClick={() => setActiveRecTab('given')}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
              activeRecTab === 'given'
                ? "bg-[#0A66C2] text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            Given (0)
          </button>
        </div>

        {/* Recommendations List */}
        <div className="space-y-4 divide-y divide-zinc-100 dark:divide-zinc-800">
          {recommendationsList
            .filter(r => r.type === activeRecTab)
            .map((rec) => (
              <div key={rec.id} className="pt-4 space-y-2">
                <div className="flex items-start gap-3">
                  <img
                    src={rec.authorAvatar}
                    alt={rec.authorName}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {rec.authorName}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {rec.authorHeadline}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {rec.date} · {rec.relationship}
                    </p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed dark:text-zinc-300 pl-14">
                  &ldquo;{rec.text}&rdquo;
                </p>
              </div>
            ))}
        </div>
      </div>
      </>
      )}

      {/* Ask for Recommendation Modal Dialog */}
      <Dialog open={isAskRecModalOpen} onOpenChange={setIsAskRecModalOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden sm:rounded-xl">
          <DialogHeader className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Ask for a recommendation
            </DialogTitle>
          </DialogHeader>

          {recSubmitted ? (
            <div className="p-8 text-center space-y-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Request Sent!
              </h4>
              <p className="text-xs text-zinc-500">
                Your recommendation request has been delivered to your colleague.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendRecRequest} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Who do you want to ask?
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Elena Rostova or Marcus Vance"
                  value={recColleague}
                  onChange={(e) => setRecColleague(e.target.value)}
                  required
                  className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Personalize your message
                </label>
                <textarea
                  rows={4}
                  defaultValue="Hi! Would you be willing to write a brief recommendation regarding our joint cybersecurity and cloud architecture work at Expedite?"
                  className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAskRecModalOpen(false)}
                  className="rounded-full px-4 py-1.5 font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#0A66C2] px-5 py-1.5 font-semibold text-white hover:bg-[#004182]"
                >
                  Send Request
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
