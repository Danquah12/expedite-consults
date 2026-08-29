"use client"

import React, { useState } from "react"
import {
  ShieldCheck,
  Award,
  Layers,
  Star,
  CheckCircle2,
  MessageSquare,
  Plus,
  Send,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Cpu
} from "lucide-react"
import { peerReviewQueueData, PeerReviewItem } from "@/lib/nextgen-data"
import { UserProfile } from "@/lib/linkedin-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PeerReviewViewProps {
  currentUser: UserProfile
}

export function PeerReviewView({ currentUser }: PeerReviewViewProps) {
  const [items, setItems] = useState<PeerReviewItem[]>(peerReviewQueueData)
  const [activeItem, setActiveItem] = useState<PeerReviewItem | null>(null)
  const [reviewFeedback, setReviewFeedback] = useState("")
  const [reviewRating, setReviewRating] = useState(5)
  const [userReputationPoints, setUserReputationPoints] = useState(840)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeItem || !reviewFeedback.trim()) return

    const newReview = {
      reviewerName: currentUser.name,
      reviewerRole: currentUser.headline.split('|')[0].trim(),
      reviewerAvatar: currentUser.avatar,
      rating: reviewRating,
      feedback: reviewFeedback.trim(),
      timestamp: 'Just now'
    }

    setItems(prev =>
      prev.map(it =>
        it.id === activeItem.id
          ? {
              ...it,
              reviewsCount: it.reviewsCount + 1,
              reviews: [newReview, ...it.reviews]
            }
          : it
      )
    )

    setUserReputationPoints(prev => prev + activeItem.reputationBounty)
    setActiveItem(null)
    setReviewFeedback("")
  }

  const handleCreateSubmission = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const newItem: PeerReviewItem = {
      id: 'rev_' + Date.now(),
      author: {
        name: currentUser.name,
        role: currentUser.headline.split('|')[0].trim(),
        avatar: currentUser.avatar
      },
      title: newTitle.trim(),
      description: newDesc.trim(),
      submittedAt: 'Just now',
      reviewsCount: 0,
      status: 'Open for Review',
      reputationBounty: 150,
      reviews: []
    }

    setItems([newItem, ...items])
    setIsSubmitModalOpen(false)
    setNewTitle("")
    setNewDesc("")
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Banner */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-blue-400/20 px-2.5 py-0.5 text-xs font-bold text-sky-300 border border-blue-400/40">
              ⚡ ConnectIn Peer Architecture Protocol
            </span>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight">
              Peer Architecture & Code Review Exchange
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-sky-200 max-w-xl">
              Submit your technical blueprints for peer review by verified Staff & Principal engineers. Earn reputation tokens for high-rigor reviews.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-xs text-center border border-white/10 min-w-[130px]">
              <p className="text-2xl font-black text-amber-300">
                {userReputationPoints}
              </p>
              <p className="text-[11px] text-sky-200">Reputation Tokens</p>
            </div>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-[#0A66C2] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#004182] shadow-md transition-all"
            >
              <Plus className="h-4 w-4" /> Submit Blueprint
            </button>
          </div>
        </div>
      </div>

      {/* Review Queue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={item.author.avatar}
                    alt={item.author.name}
                    className="h-10 w-10 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-800"
                  />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                      {item.author.name}
                    </h4>
                    <p className="text-[11px] text-zinc-400">{item.author.role}</p>
                  </div>
                </div>

                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300">
                  +{item.reputationBounty} Tokens
                </span>
              </div>

              <h3 className="mt-3 font-bold text-sm sm:text-base text-zinc-900 leading-snug dark:text-zinc-100">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {item.description}
              </p>

              {item.diagramUrl && (
                <div className="mt-3 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-40">
                  <img
                    src={item.diagramUrl}
                    alt="Architecture Diagram"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Reviews Preview */}
              {item.reviews.length > 0 && (
                <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-xs dark:bg-zinc-800/60 space-y-1.5 border border-zinc-100 dark:border-zinc-800">
                  <span className="font-bold text-[11px] text-zinc-700 dark:text-zinc-300">
                    Latest Review from {item.reviews[0].reviewerName}:
                  </span>
                  <p className="text-zinc-600 dark:text-zinc-400 italic">
                    &ldquo;{item.reviews[0].feedback}&rdquo;
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">
                {item.reviewsCount} peer reviews completed · {item.submittedAt}
              </span>
              <button
                onClick={() => setActiveItem(item)}
                className="rounded-full bg-[#0A66C2] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#004182] shadow-xs"
              >
                Review Blueprint
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Review Submission Modal Dialog */}
      <Dialog open={Boolean(activeItem)} onOpenChange={() => setActiveItem(null)}>
        <DialogContent className="max-w-xl p-0 overflow-hidden sm:rounded-xl">
          <DialogHeader className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Submit Architecture Peer Review
            </DialogTitle>
          </DialogHeader>

          {activeItem && (
            <form onSubmit={handleSubmitReview} className="p-6 space-y-4 text-xs">
              <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60 space-y-1">
                <p className="font-bold text-zinc-900 dark:text-zinc-100">
                  {activeItem.title}
                </p>
                <p className="text-zinc-500">{activeItem.description}</p>
              </div>

              <div>
                <label className="font-bold text-zinc-800 dark:text-zinc-200">
                  Rating Topology & Resilience (1-5 Stars)
                </label>
                <div className="flex gap-2 mt-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`p-2 rounded-lg border flex items-center justify-center ${
                        reviewRating >= star
                          ? "border-amber-400 bg-amber-50 text-amber-500 dark:bg-amber-950"
                          : "border-zinc-300 text-zinc-300"
                      }`}
                    >
                      <Star className="h-5 w-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-800 dark:text-zinc-200">
                  Constructive Review & Threat Model Suggestions
                </label>
                <textarea
                  rows={4}
                  placeholder="Analyze potential single-points-of-failure, scalability limits, and cryptographic verification recommendations..."
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  required
                  className="mt-1 w-full rounded-md border border-zinc-300 bg-white p-3 text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="font-semibold text-emerald-600">
                  Reward: +{activeItem.reputationBounty} Tokens upon submission
                </span>
                <button
                  type="submit"
                  disabled={!reviewFeedback.trim()}
                  className="rounded-full bg-[#0A66C2] px-5 py-2 font-bold text-white hover:bg-[#004182]"
                >
                  Publish Review
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* New Blueprint Submission Modal */}
      <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden sm:rounded-xl">
          <DialogHeader className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Submit Your System Blueprint for Peer Review
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateSubmission} className="p-6 space-y-4 text-xs">
            <div>
              <label className="font-bold text-zinc-800 dark:text-zinc-200">
                Blueprint Title
              </label>
              <input
                type="text"
                placeholder="e.g. High-Availability Multi-Region Next.js Edge Routing"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-800 dark:text-zinc-200">
                Technical Overview & Questions for Reviewers
              </label>
              <textarea
                rows={4}
                placeholder="Describe your design decisions, throughput requirements, and what specific feedback you need..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                required
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white p-3 text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="rounded-full px-4 py-1.5 font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#0A66C2] px-5 py-1.5 font-bold text-white hover:bg-[#004182]"
              >
                Submit to Review Queue
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
