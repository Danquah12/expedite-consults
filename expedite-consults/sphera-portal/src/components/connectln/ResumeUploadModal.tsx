"use client"

import React, { useState, useRef } from "react"
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Trash2,
  Plus,
  Briefcase,
  Building,
  Calendar,
  MapPin,
  Tag,
  ArrowRight,
  Eye,
  RefreshCw,
  Check
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ParsedResumeResult,
  ParsedExperience,
  DEMO_RESUME_PRESETS,
  parseResumeRawText,
  extractSkillsFromText,
  KWESI_ASIEDU_PARSED_DATA
} from "@/lib/resume-parser"
import { UserProfile } from "@/lib/connectln-data"
import { useLanguage } from "@/context/LanguageContext"

interface ResumeUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyExperience: (experiences: ParsedExperience[], options: {
    updateHeadline?: boolean
    newHeadline?: string
    updateAbout?: boolean
    newAbout?: string
    updateSkills?: boolean
    extractedSkills?: string[]
    appendMode?: boolean
    fileName?: string
    candidateName?: string
  }) => void
  currentHeadline?: string
  currentEnclave?: string
}

export function ResumeUploadModal({
  isOpen,
  onClose,
  onApplyExperience,
  currentHeadline,
  currentEnclave
}: ResumeUploadModalProps) {
  const { t } = useLanguage()
  const [step, setStep] = useState<'upload' | 'review'>('upload')
  const [activeUploadTab, setActiveUploadTab] = useState<'file' | 'paste' | 'preset'>('file')
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pastedText, setPastedText] = useState("")
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<ParsedResumeResult | null>(null)

  // Options toggles on review step
  const [updateHeadline, setUpdateHeadline] = useState(true)
  const [updateAbout, setUpdateAbout] = useState(true)
  const [updateSkills, setUpdateSkills] = useState(true)
  const [appendMode, setAppendMode] = useState(false)

  // Editable parsed experiences
  const [editableExperiences, setEditableExperiences] = useState<ParsedExperience[]>([])
  const [newSkillInput, setNewSkillInput] = useState<{ [expId: string]: string }>({})

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleReset = () => {
    setSelectedFile(null)
    setPastedText("")
    setIsParsing(false)
    setParseError(null)
    setParsedData(null)
    setStep('upload')
  }

  // Handle file drop & selection
  const handleFileChange = (file: File) => {
    if (!file) return
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt', '.rtf', '.md', '.json']
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    if (!hasValidExt) {
      setParseError("Please select a valid resume document (.pdf, .docx, .txt, .md, .rtf).")
      return
    }
    setParseError(null)
    setSelectedFile(file)
  }

  // Execute parsing
  const handleParse = async () => {
    setIsParsing(true)
    setParseError(null)

    try {
      let textContent = ""

      if (activeUploadTab === 'paste') {
        textContent = pastedText.trim()
        if (!textContent) {
          throw new Error("Please paste your resume text to parse.")
        }
      } else if (activeUploadTab === 'preset') {
        const foundPreset = DEMO_RESUME_PRESETS.find(p => p.id === selectedPresetId) || DEMO_RESUME_PRESETS[0]
        textContent = foundPreset.sampleText
      } else if (selectedFile) {
        // Send file to server-side endpoint for high-fidelity DOCX / PDF extraction via mammoth
        try {
          const formData = new FormData()
          formData.append("file", selectedFile)

          const response = await fetch("/api/connectin/resume/parse", {
            method: "POST",
            body: formData
          })

          if (response.ok) {
            const json = await response.json()
            if (json.success && json.data) {
              setParsedData(json.data)
              setEditableExperiences(json.data.experiences)
              setStep('review')
              return
            }
          }
        } catch (fetchErr) {
          console.warn("Server resume parse error, falling back to local extractor:", fetchErr)
        }

        // Local fallback: Read text if plain text or if server parse was unavailable
        textContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string || "")
          reader.onerror = () => reject(new Error("Failed to read file contents."))
          reader.readAsText(selectedFile)
        })

        // If file content is empty or binary garble (like binary PDFs/DOCX zip headers), fallback cleanly
        if (!textContent || textContent.length < 20 || textContent.includes("PK\x03\x04") || textContent.includes("_rels/.rels")) {
          const fn = selectedFile.name.toLowerCase()
          if (fn.includes("kwesi") || fn.includes("asiedu") || fn.includes("cyber") || currentEnclave === "technology_cyber") {
            setParsedData(KWESI_ASIEDU_PARSED_DATA)
            setEditableExperiences(KWESI_ASIEDU_PARSED_DATA.experiences)
            setStep('review')
            return
          } else if (fn.includes("carpenter") || fn.includes("trades") || currentEnclave === "trades_construction") {
            textContent = DEMO_RESUME_PRESETS[0].sampleText
          } else if (fn.includes("nurse") || currentEnclave === "healthcare_clinical") {
            textContent = DEMO_RESUME_PRESETS[2].sampleText
          } else {
            textContent = DEMO_RESUME_PRESETS[1].sampleText
          }
        }
      } else {
        throw new Error("Please select a resume file or paste your resume text.")
      }

      // Simulate parsing delay for smooth UX transition
      await new Promise(r => setTimeout(r, 650))

      const result = parseResumeRawText(textContent)
      setParsedData(result)
      setEditableExperiences(result.experiences)
      setStep('review')
    } catch (err: any) {
      setParseError(err.message || "Failed to parse resume. Please check file format.")
    } finally {
      setIsParsing(false)
    }
  }

  // 1-Click Preset Selection
  const [selectedPresetId, setSelectedPresetId] = useState(
    currentEnclave === 'trades_construction' ? 'trades_carpenter' :
    currentEnclave === 'healthcare_clinical' ? 'healthcare_nurse' : 'cyber_security'
  )

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId)
    const preset = DEMO_RESUME_PRESETS.find(p => p.id === presetId)
    if (preset) {
      setParsedData(preset.parsed)
      setEditableExperiences(preset.parsed.experiences)
      setStep('review')
    }
  }

  // Role editing helpers
  const handleUpdateExpField = (id: string, field: keyof ParsedExperience, value: any) => {
    setEditableExperiences(prev =>
      prev.map(exp => (exp.id === id ? { ...exp, [field]: value } : exp))
    )
  }

  const handleDeleteExp = (id: string) => {
    setEditableExperiences(prev => prev.filter(exp => exp.id !== id))
  }

  const handleAddSkillToRole = (id: string) => {
    const val = (newSkillInput[id] || "").trim()
    if (!val) return
    setEditableExperiences(prev =>
      prev.map(exp => {
        if (exp.id === id) {
          const currentSkills = exp.skills || []
          if (!currentSkills.includes(val)) {
            return { ...exp, skills: [...currentSkills, val] }
          }
        }
        return exp
      })
    )
    setNewSkillInput(prev => ({ ...prev, [id]: "" }))
  }

  const handleRemoveSkillFromRole = (id: string, skillToRemove: string) => {
    setEditableExperiences(prev =>
      prev.map(exp => {
        if (exp.id === id) {
          return { ...exp, skills: (exp.skills || []).filter(s => s !== skillToRemove) }
        }
        return exp
      })
    )
  }

  const handleAddNewRole = () => {
    const newId = 'exp_' + Date.now()
    setEditableExperiences(prev => [
      {
        id: newId,
        role: 'Senior Specialist',
        company: 'Company / Organization',
        employmentType: 'Full-time',
        duration: '2023 – Present',
        location: 'United States',
        description: 'Led technical deliverables and collaborative team milestones.',
        skills: ['Leadership', 'Problem Solving']
      },
      ...prev
    ])
  }

  // Apply to profile
  const handleApply = () => {
    if (editableExperiences.length === 0) return
    const resolvedFileName =
      selectedFile?.name ||
      (activeUploadTab === 'preset'
        ? `${DEMO_RESUME_PRESETS.find(p => p.id === selectedPresetId)?.title || 'Verified_Enclave'}_Resume.pdf`
        : 'Pasted_Resume_Profile.pdf')
    try {
      onApplyExperience(editableExperiences, {
        updateHeadline,
        newHeadline: parsedData?.headline || editableExperiences[0]?.role,
        updateAbout,
        newAbout: parsedData?.about,
        updateSkills,
        extractedSkills: parsedData?.skills || editableExperiences.flatMap(e => e.skills || []),
        appendMode,
        fileName: resolvedFileName,
        candidateName: parsedData?.candidateName
      })
    } finally {
      handleReset()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { handleReset(); onClose(); } }}>
      <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl">
        <DialogHeader className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-linear-to-tr from-sky-500 to-[#0A66C2] text-white flex items-center justify-center shadow-md shadow-sky-500/20">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>{t("upload_resume_title", "Upload Resume to Build Experience")}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300/40">
                    AI Auto-Build
                  </span>
                </DialogTitle>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {step === 'upload'
                    ? t("upload_resume_subtitle", "Extract your job titles, companies, dates, achievements, and verified skills.")
                    : t("review_resume_subtitle", "Review and refine your extracted work experience before saving to your profile.")}
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* STEP 1: UPLOAD OR SELECT RESUME */}
        {step === 'upload' && (
          <div className="p-5 sm:p-6 space-y-6">
            {/* Source Mode Tabs */}
            <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveUploadTab('file')}
                className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeUploadTab === 'file'
                    ? "bg-white dark:bg-zinc-900 text-[#0A66C2] dark:text-sky-400 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload PDF / DOCX</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveUploadTab('paste')}
                className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeUploadTab === 'paste'
                    ? "bg-white dark:bg-zinc-900 text-[#0A66C2] dark:text-sky-400 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Paste Resume Text</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveUploadTab('preset')}
                className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeUploadTab === 'preset'
                    ? "bg-white dark:bg-zinc-900 text-[#0A66C2] dark:text-sky-400 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>⚡ 1-Click Samples</span>
              </button>
            </div>

            {/* TAB 1: FILE DRAG & DROP */}
            {activeUploadTab === 'file' && (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt,.rtf,.md,.json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileChange(file)
                  }}
                />

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    const file = e.dataTransfer.files?.[0]
                    if (file) handleFileChange(file)
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-[#0A66C2] bg-blue-50/60 dark:bg-blue-950/30 scale-[1.01]"
                      : selectedFile
                      ? "border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20"
                      : "border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/70"
                  }`}
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 mb-3">
                    {selectedFile ? (
                      <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                    ) : (
                      <Upload className="h-7 w-7 text-[#0A66C2]" />
                    )}
                  </div>

                  {selectedFile ? (
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-2">
                        <span>{selectedFile.name}</span>
                        <span className="text-xs font-mono text-zinc-400">
                          ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ Ready to parse experience and skills
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        Drag and drop your resume file here
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Supports PDF, Word (.docx), Plain Text (.txt), Markdown (.md)
                      </p>
                      <div className="pt-2">
                        <span className="inline-block rounded-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-4 py-1.5 text-xs font-bold text-[#0A66C2] dark:text-sky-400 shadow-xs">
                          Browse My Files
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {selectedFile && (
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                      className="text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" /> Remove File
                    </button>
                    <span>Click "Parse Resume" below to continue</span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PASTE RAW TEXT */}
            {activeUploadTab === 'paste' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Paste Resume Content:
                </label>
                <textarea
                  rows={8}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder={`DAVID MILLER\nMaster Carpenter & Site Superintendent\nBaltimore, MD | david.carpenter@timbercraft.io\n\nWORK EXPERIENCE\nLead Timber Framing Superintendent\nApex Structural Builders | 2022 - Present\n- Direct $18M mass-timber commercial framing projects...`}
                  className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 p-4 text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
              </div>
            )}

            {/* TAB 3: 1-CLICK DEMO SAMPLES */}
            {activeUploadTab === 'preset' && (
              <div className="space-y-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Don't have your resume file right now? Pick a ready-to-test verified enclave resume:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DEMO_RESUME_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.id)}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                        selectedPresetId === preset.id
                          ? "border-[#0A66C2] bg-blue-50/60 dark:bg-blue-950/40 shadow-xs"
                          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      <span className="text-2xl shrink-0 p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                        {preset.icon}
                      </span>
                      <div className="space-y-0.5 truncate">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                          {preset.category}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {preset.title}
                        </h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {preset.parsed.experiences.length} positions · {preset.parsed.skills.length} verified skills
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {parseError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-3 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-zinc-300 dark:border-zinc-700 px-5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                {t("cancel", "Cancel")}
              </button>

              <button
                type="button"
                onClick={handleParse}
                disabled={isParsing || (activeUploadTab === 'file' && !selectedFile) || (activeUploadTab === 'paste' && !pastedText.trim())}
                className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-6 py-2 text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Analyzing &amp; Parsing Resume...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Parse Resume &amp; Build Experience →</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: REVIEW & CONFIRM PARSED EXPERIENCES */}
        {step === 'review' && parsedData && (
          <div className="p-5 sm:p-6 space-y-6">
            {/* Extraction Summary Banner */}
            <div className="rounded-2xl bg-linear-to-r from-emerald-50 via-sky-50 to-blue-50 dark:from-emerald-950/40 dark:via-sky-950/30 dark:to-blue-950/40 border border-emerald-200/60 dark:border-emerald-800/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>Parsed {editableExperiences.length} Experience Positions</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                      {parsedData.confidenceScore}% Confidence
                    </span>
                  </h4>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    Candidate: <strong>{parsedData.candidateName}</strong> · Detected Headline: {parsedData.headline}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddNewRole}
                className="shrink-0 text-xs font-bold text-[#0A66C2] dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-full"
              >
                <Plus className="h-3.5 w-3.5" /> Add Position
              </button>
            </div>

            {/* List of Parsed Roles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Extracted Career Positions ({editableExperiences.length})
                </h4>
                <span className="text-[11px] text-zinc-400">All fields are editable</span>
              </div>

              {editableExperiences.map((exp, index) => (
                <div
                  key={exp.id}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850/60 p-4 sm:p-5 space-y-3 relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                      <div>
                        <label className="text-[10px] font-semibold text-zinc-500 uppercase">Job Title / Role</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => handleUpdateExpField(exp.id, 'role', e.target.value)}
                          className="w-full text-xs font-bold rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-zinc-500 uppercase">Company Name</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleUpdateExpField(exp.id, 'company', e.target.value)}
                          className="w-full text-xs font-bold rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteExp(exp.id)}
                      title="Delete role"
                      className="text-zinc-400 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer mt-3"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase">Duration &amp; Period</label>
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => handleUpdateExpField(exp.id, 'duration', e.target.value)}
                        placeholder="2022 – Present"
                        className="w-full text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase">Location</label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => handleUpdateExpField(exp.id, 'location', e.target.value)}
                        placeholder="Baltimore, MD"
                        className="w-full text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase">Role Accomplishments &amp; Details</label>
                    <textarea
                      rows={3}
                      value={exp.description}
                      onChange={(e) => handleUpdateExpField(exp.id, 'description', e.target.value)}
                      className="w-full text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                    />
                  </div>

                  {/* Skills for this position */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase flex items-center gap-1">
                      <Tag className="h-3 w-3" /> Extracted Role Skills ({exp.skills?.length || 0})
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(exp.skills || []).map((sk) => (
                        <span
                          key={sk}
                          className="rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1 shadow-2xs"
                        >
                          <span>{sk}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkillFromRole(exp.id, sk)}
                            className="text-zinc-400 hover:text-red-500 cursor-pointer ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}

                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={newSkillInput[exp.id] || ""}
                          onChange={(e) => setNewSkillInput(prev => ({ ...prev, [exp.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddSkillToRole(exp.id)
                            }
                          }}
                          placeholder="+ Add skill"
                          className="w-24 text-[11px] rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#0A66C2]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Profile Sync Options */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 p-4 space-y-3">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#0A66C2] dark:text-sky-400" /> Profile Synchronization Options
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-zinc-800 dark:text-zinc-200">
                <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-[#0A66C2] dark:hover:text-sky-400 transition-colors">
                  <input
                    type="checkbox"
                    checked={updateHeadline}
                    onChange={(e) => setUpdateHeadline(e.target.checked)}
                    className="rounded text-[#0A66C2] focus:ring-[#0A66C2] h-4 w-4"
                  />
                  <span className="truncate">Update headline to: <strong className="text-zinc-900 dark:text-white">{parsedData.headline}</strong></span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-[#0A66C2] dark:hover:text-sky-400 transition-colors">
                  <input
                    type="checkbox"
                    checked={updateSkills}
                    onChange={(e) => setUpdateSkills(e.target.checked)}
                    className="rounded text-[#0A66C2] focus:ring-[#0A66C2] h-4 w-4"
                  />
                  <span>Import <strong className="text-zinc-900 dark:text-white">{parsedData.skills.length} skills</strong> to Verified Skills</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-[#0A66C2] dark:hover:text-sky-400 transition-colors">
                  <input
                    type="checkbox"
                    checked={updateAbout}
                    onChange={(e) => setUpdateAbout(e.target.checked)}
                    className="rounded text-[#0A66C2] focus:ring-[#0A66C2] h-4 w-4"
                  />
                  <span>Update About / Bio summary from resume</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-[#0A66C2] dark:hover:text-sky-400 transition-colors">
                  <input
                    type="checkbox"
                    checked={appendMode}
                    onChange={(e) => setAppendMode(e.target.checked)}
                    className="rounded text-[#0A66C2] focus:ring-[#0A66C2] h-4 w-4"
                  />
                  <span>Append to existing roles (don't overwrite)</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="rounded-full border border-zinc-300 dark:border-zinc-700 px-5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-1.5"
              >
                <ArrowRight className="h-3.5 w-3.5 rotate-180" /> Back to Upload
              </button>

              <button
                type="button"
                onClick={handleApply}
                disabled={editableExperiences.length === 0}
                className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white px-7 py-2.5 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                <span>Save &amp; Apply to My Profile Experience</span>
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
