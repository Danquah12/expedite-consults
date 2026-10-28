"use client"

import React, { useState, useEffect } from "react"
import {
  Briefcase,
  Building,
  Calendar,
  MapPin,
  Tag,
  Check,
  X
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ParsedExperience } from "@/lib/resume-parser"
import { useLanguage } from "@/context/LanguageContext"

interface ExperienceFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (experience: ParsedExperience) => void
  initialData?: ParsedExperience | null
}

export function ExperienceFormModal({
  isOpen,
  onClose,
  onSave,
  initialData
}: ExperienceFormModalProps) {
  const { t } = useLanguage()

  const [role, setRole] = useState("")
  const [company, setCompany] = useState("")
  const [employmentType, setEmploymentType] = useState("Full-time")
  const [duration, setDuration] = useState("")
  const [isCurrentRole, setIsCurrentRole] = useState(false)
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")

  useEffect(() => {
    if (initialData) {
      setRole(initialData.role || "")
      setCompany(initialData.company || "")
      setEmploymentType(initialData.employmentType || "Full-time")
      setDuration(initialData.duration || "")
      setIsCurrentRole(Boolean(initialData.duration?.toLowerCase().includes("present")))
      setLocation(initialData.location || "")
      setDescription(initialData.description || "")
      setSkills(initialData.skills || [])
    } else {
      setRole("")
      setCompany("")
      setEmploymentType("Full-time")
      setDuration("2023 – Present")
      setIsCurrentRole(true)
      setLocation("")
      setDescription("")
      setSkills([])
    }
  }, [initialData, isOpen])

  const handleAddSkill = () => {
    const trimmed = skillInput.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed])
      setSkillInput("")
    }
  }

  const handleRemoveSkill = (toRemove: string) => {
    setSkills(prev => prev.filter(s => s !== toRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!role.trim() || !company.trim()) return

    const effectiveDuration = isCurrentRole
      ? (duration.includes("Present") ? duration : `${duration.split(/[-–]/)[0]?.trim() || "2023"} – Present`)
      : duration

    const expToSave: ParsedExperience = {
      id: initialData?.id || 'exp_' + Date.now(),
      role: role.trim(),
      company: company.trim(),
      employmentType,
      duration: effectiveDuration || '2023 – Present',
      location: location.trim() || 'United States',
      description: description.trim() || `${role.trim()} leading key initiatives at ${company.trim()}.`,
      skills
    }

    onSave(expToSave)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0 border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl">
        <DialogHeader className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#0A66C2] text-white flex items-center justify-center">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {initialData ? "Edit Work Experience" : "Add Work Experience"}
              </DialogTitle>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Update your verified career position, responsibilities, and competencies.
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Job Title / Role *
            </label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Master Carpenter, Cloud Architect, Lead RN"
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Apex Builders, Expedite Consults"
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
              >
                <option value="Full-time">Full-time</option>
                <option value="Contract">Contract</option>
                <option value="Part-time">Part-time</option>
                <option value="Apprenticeship">Apprenticeship / Journeyman</option>
                <option value="Self-employed">Self-employed / Freelance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Duration / Period
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 2022 – Present · 3 yrs"
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Baltimore, MD (Hybrid)"
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
              />
            </div>
          </div>

          <div className="pt-0.5">
            <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={isCurrentRole}
                onChange={(e) => {
                  setIsCurrentRole(e.target.checked)
                  if (e.target.checked && !duration.includes("Present")) {
                    setDuration(duration ? `${duration} – Present` : "2023 – Present")
                  }
                }}
                className="rounded text-[#0A66C2] focus:ring-[#0A66C2]"
              />
              <span>I currently work in this role (Present Role)</span>
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Role Description &amp; Key Achievements
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your primary responsibilities, leadership, and accomplishments..."
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
            />
          </div>

          {/* Skills associated with role */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-[#0A66C2]" /> Role Skills &amp; Competencies
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {skills.map((sk) => (
                <span
                  key={sk}
                  className="rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1"
                >
                  <span>{sk}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(sk)}
                    className="text-zinc-400 hover:text-red-500 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}

              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddSkill()
                    }
                  }}
                  placeholder="+ Add skill"
                  className="w-28 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0A66C2]"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="text-xs font-bold text-[#0A66C2] px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-5 py-2 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              <span>{initialData ? "Save Changes" : "Add Experience"}</span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
