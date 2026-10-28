"use client"

import React, { useState, useEffect } from "react"
import {
  Briefcase,
  Search,
  MapPin,
  Bookmark,
  Sparkles,
  Building,
  ExternalLink,
  Send,
  X,
  Loader2,
  RefreshCw,
  Zap,
  Check,
  FileText,
  Languages,
  PlusCircle,
  Users,
  Target,
  Clock
} from "lucide-react"
import {
  COUNTRIES_CONFIG,
  GlobalJobItem,
  GLOBAL_JOBS_CATALOG,
  initialUserApplications,
  initialCandidatesData,
  JobApplicationItem,
  CandidateProfile,
  getJobFlywheelRecommendation,
  getEnclaveSearchPlaceholder,
  getLocalizedJobsForCountryAndEnclave,
  getCountryShortLabel
} from "@/lib/global-jobs-data"
import { PROFESSION_ENCLAVES, CONNECTIN_WORKER_PILLARS, ALL_PROFESSIONS } from "@/lib/connectin-professions"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CareerTwinModal } from "./CareerTwinModal"

import { UserProfile } from "@/lib/linkedin-data"

interface JobsViewProps {
  currentUser?: UserProfile
  onNavigateCareerSuite?: () => void
  onNavigateLearning?: () => void
  onNavigateMarketplace?: () => void
  onJobPublished?: (job: GlobalJobItem) => void
}

function getEnclaveJobCategories(enclaveId?: string) {
  switch (enclaveId) {
    case 'all':
      return [
        { id: 'All', label: 'All Live Openings', icon: '🌐' },
        { id: 'Herbal, Botanical & Integrative Medicine', label: 'Herbal & Botanical Medicine (RH-AHG/ND)', icon: '🌿' },
        { id: 'Dentistry & Oral Surgery', label: 'Dentists & Oral Surgery (DDS/DMD/RDH)', icon: '🦷' },
        { id: 'Solar Energy & Photovoltaic Systems', label: 'Solar PV Technicians & Microgrids', icon: '☀️' },
        { id: 'DirecTV, Satellite Dish, Cable & AV Systems', label: 'DirecTV, Satellite Dish, Cable & AV Techs', icon: '📡' },
        { id: 'Lawyers & Legal Counsel', label: 'Lawyers & Trial Attorneys (JD / Esq.)', icon: '⚖️' },
        { id: 'Judges, Judiciary & Magistrates', label: 'Judges, Magistrates & ALJs', icon: '👩‍⚖️' },
        { id: 'Pharmacy & Pharmacology', label: 'Pharmacy (PharmD & CPhT)', icon: '💊' },
        { id: 'Physicians & Surgeons', label: 'Doctors & Surgeons (MD/DO)', icon: '🩺' },
        { id: 'Nursing & Advanced Practice', label: 'Nurses (RN, CCRN, NP, LPN)', icon: '❤️‍🩹' },
        { id: 'Nursing Technician', label: 'Nursing Techs & PCTs (PCT, CNA)', icon: '🩺' },
        { id: 'Medical Aides & Clinical Support', label: 'Medical Aides & EMS (CCMA, CNA, EMT)', icon: '🩹' },
        { id: 'Diagnostic Imaging & Allied Health', label: 'Surgical, Radiology, Resp & Lab Techs', icon: '🩻' },
        { id: 'Medical & Hospital Administration', label: 'Medical & Hospital Admin (MHA/FACHE)', icon: '📋' },
        { id: 'Recommended', label: 'Recommended for You', icon: '⭐' },
        { id: 'Remote', label: 'Remote Roles', icon: '🌍' },
        { id: 'Full-time', label: 'Full-time Direct Hire', icon: '💼' }
      ]
    case 'trades_construction':
      return [
        { id: 'All', label: 'All Trade & MEP Openings', icon: '🔨' },
        { id: 'Recommended', label: 'Recommended for You', icon: '⭐' },
        { id: 'Timber Framing', label: 'Timber Framing & Bents', icon: '🌲' },
        { id: 'Finish Carpentry', label: 'Architectural Finish & Millwork', icon: '🪵' },
        { id: 'Electrical & MEP', label: 'Electrical, HVAC, Elevator & Boiler', icon: '⚡' },
        { id: 'Welding & Steel', label: 'Welding & Structural Steel', icon: '🔥' },
        { id: 'Architecture & BIM', label: 'BIM, Surveying & Quantity Takeoffs', icon: '📐' },
        { id: 'General Contracting', label: 'Commercial Superintendent', icon: '🏗️' },
        { id: 'Contract', label: 'Trade Contract & Per-Diem', icon: '📜' }
      ]
    case 'manufacturing_industrial':
      return [
        { id: 'All', label: 'All Manufacturing Openings', icon: '🏭' },
        { id: 'Recommended', label: 'Recommended for You', icon: '⭐' },
        { id: 'CNC Machining', label: '5-Axis CNC & Tool & Die', icon: '⚙️' },
        { id: 'Robotics & PLC', label: 'PLC Mechatronics & Robotics', icon: '🤖' },
        { id: 'Lean & Quality', label: 'Lean Six Sigma & CMM Quality', icon: '📏' },
        { id: 'Packaging & Textiles', label: 'Packaging, Footwear & Textiles', icon: '👟' },
        { id: 'Full-time', label: 'Full-time', icon: '💼' }
      ]
    case 'energy_utilities_environment':
      return [
        { id: 'All', label: 'All Solar, Energy, Mining & Water Roles', icon: '☀️' },
        { id: 'Solar Energy & Photovoltaic Systems', label: 'Solar PV Technicians, Inverters & Powerwall', icon: '☀️' },
        { id: 'Recommended', label: 'Recommended for You', icon: '⭐' },
        { id: 'Wind & Renewables', label: 'GWO Wind Turbine & Offshore', icon: '🌬️' },
        { id: 'Grid & Utilities', label: 'NERC Grid & High-Voltage Substations', icon: '⚡' },
        { id: 'Mining & Geology', label: 'Mining, Drilling & Geology', icon: '⛏️' },
        { id: 'Water & Sanitation', label: 'Water Treatment & Waste Recovery', icon: '💧' },
        { id: 'Full-time', label: 'Full-time', icon: '💼' }
      ]
    case 'science_laboratory_research':
      return [
        { id: 'All', label: 'All Lab, Biotech & Science Roles', icon: '🔬' },
        { id: 'Recommended', label: 'Recommended for You', icon: '⭐' },
        { id: 'Biotech & Pharma', label: 'cGMP Bioprocess & Cell Culture', icon: '🧬' },
        { id: 'Analytical Chemistry', label: 'HPLC / GC-MS & Materials Testing', icon: '🧪' },
        { id: 'Forensics & Field Science', label: 'Forensic DNA, Archaeology & Museum', icon: '🏺' },
        { id: 'Full-time', label: 'Full-time', icon: '💼' }
      ]
    case 'aviation_aerospace_maritime':
      return [
        { id: 'All', label: 'All Aviation, Space & Marine Roles', icon: '✈️' },
        { id: 'Recommended', label: 'Recommended for You', icon: '⭐' },
        { id: 'Aircraft Maintenance', label: 'FAA A&P / EASA B1-B2 & Avionics', icon: '🛩️' },
        { id: 'Spacecraft & Drones', label: 'Spacecraft Assembly & Part 107 UAV', icon: '🛰️' },
        { id: 'Maritime & Subsea', label: 'Merchant Marine, Shipyard & Diving', icon: '🚢' },
        { id: 'Full-time', label: 'Full-time', icon: '💼' }
      ]
    case 'telecom_digital_infrastructure':
      return [
        { id: 'All', label: 'All DirecTV, Satellite, Fiber & AV Roles', icon: '📡' },
        { id: 'DirecTV, Satellite Dish, Cable & AV Systems', label: 'DirecTV, Satellite Dish, Starlink, Cable & Pro-AV', icon: '📡' },
        { id: 'Recommended', label: 'Recommended for You', icon: '⭐' },
        { id: 'Fiber & 5G Telecom', label: 'OSP Fiber Splicing & Tower Rigging', icon: '🗼' },
        { id: 'Data Center Infrastructure', label: 'Hyperscale AI Data Center Ops', icon: '🖥️' },
        { id: 'Precision Micro-Repair', label: 'PCB Micro-Soldering & Horology', icon: '🔬' },
        { id: 'Full-time', label: 'Full-time', icon: '💼' }
      ]
    case 'automotive_mechanics':
      return [
        { id: 'All', label: 'All Auto, Heavy & Rail Openings', icon: '🔧' },
        { id: 'Recommended', label: 'Recommended for You', icon: '⭐' },
        { id: 'Master Diagnostics', label: 'ASE Master Diagnostics', icon: '⚡' },
        { id: 'EV Powertrain', label: '800V High-Voltage EV', icon: '🔋' },
        { id: 'Heavy Diesel', label: 'Commercial Fleet & Caterpillar', icon: '🚛' },
        { id: 'Rail & Freight Customs', label: 'Rail Signal, Locomotive & Customs', icon: '🚆' },
        { id: 'Full-time', label: 'Full-time', icon: '💼' }
      ]
    case 'agriculture_natural_resources':
      return [
        { id: 'All', label: 'All Ag, Food & Wildlife Openings', icon: '🌾' },
        { id: 'Recommended', label: 'Recommended for You', icon: '⭐' },
        { id: 'Agronomy & Crops', label: 'Agronomy & Soil Science', icon: '🌱' },
        { id: 'Precision Ag', label: 'Precision Ag & RTK Robotics', icon: '🛰️' },
        { id: 'Hydroponics & Food Science', label: 'Vertical Farming, Dairy & Wildlife', icon: '🥬' },
        { id: 'Forestry & Conservation', label: 'Arborist, Forestry & Timber', icon: '🌲' },
        { id: 'Full-time', label: 'Full-time', icon: '💼' }
      ]
    case 'personal_services_wellness':
      return [
        { id: 'All', label: 'All Wellness, Turf & Memorial Roles', icon: '💈' },
        { id: 'Recommended', label: 'Recommended for You', icon: '⭐' },
        { id: 'Salon & Barbering', label: 'Master Stylist, Barber & Tattoo', icon: '✂️' },
        { id: 'Fitness & Performance', label: 'Strength (CSCS) & Massage Rehab', icon: '🏋️' },
        { id: 'Turf, Outdoor & Memorial', label: 'Sports Turf, Outdoor & Funeral Dir.', icon: '⛳' },
        { id: 'Full-time', label: 'Full-time', icon: '💼' }
      ]
    case 'culinary_hospitality_events':
      return [
        { id: 'All', label: 'All Culinary, Stage & Property Roles', icon: '🍳' },
        { id: 'Recommended', label: 'Recommended for You', icon: '⭐' },
        { id: 'Culinary & Kitchen', label: 'Executive Chef, Baker & Butcher', icon: '👨‍🍳' },
        { id: 'Hotel & Resort Ops', label: 'Hotel GM & Sommelier Beverage', icon: '🏨' },
        { id: 'Stage Rigging & Property', label: 'ETCP Stage Rigging & Pest/Pool Ops', icon: '🎭' },
        { id: 'Full-time', label: 'Full-time', icon: '💼' }
      ]
    case 'commerce_small_business':
      return [
        { id: 'All', label: 'All Retail, Sales & Supply Chain', icon: '🏢' },
        { id: 'Recommended', label: 'Recommended for You', icon: '⭐' },
        { id: 'Commercial Real Estate', label: 'Commercial Real Estate & Leasing', icon: '🏙️' },
        { id: 'Retail & Franchise Ops', label: 'Multi-Unit Retail & Merchandising', icon: '🛍️' },
        { id: 'Supply Chain & Logistics', label: 'Supply Chain, 3PL & Reverse Logistics', icon: '📦' },
        { id: 'Full-time', label: 'Full-time', icon: '💼' }
      ]
    case 'creative_media_arts':
      return [
        { id: 'All', label: 'All Creative, Craft & Set Roles', icon: '🎬' },
        { id: 'Recommended', label: 'Recommended for You', icon: '⭐' },
        { id: 'Film & Video Production', label: 'Film, Video & Post-Production', icon: '🎥' },
        { id: 'Specialty Craft & Set Design', label: 'Upholstery, Signage & Set Building', icon: '🪑' },
        { id: 'Audio & Sound Engineering', label: 'Audio & Dolby Atmos Mixing', icon: '🎚️' },
        { id: 'ASL & Language Interpreting', label: 'Certified ASL & Interpreting', icon: '🤟' },
        { id: 'Remote', label: 'Remote Only', icon: '🌍' }
      ]
    case 'healthcare_medicine':
      return [
        { id: 'All', label: 'All Clinical, Herbal, Dental, Pharmacy & Health Roles', icon: '🏥' },
        { id: 'Herbal, Botanical & Integrative Medicine', label: 'Herbal Medicine & Phytotherapy (RH-AHG / ND)', icon: '🌿' },
        { id: 'Dentistry & Oral Surgery', label: 'Dentists, Oral Surgeons & Hygienists (DDS/DMD/RDH)', icon: '🦷' },
        { id: 'Pharmacy & Pharmacology', label: 'Pharmacists & Pharmacy Techs (PharmD & CPhT)', icon: '💊' },
        { id: 'Physicians & Surgeons', label: 'Doctors, Physicians & Surgeons (MD/DO)', icon: '🩺' },
        { id: 'Nursing & Advanced Practice', label: 'Nurses (RN, CCRN, NP, LPN)', icon: '❤️‍🩹' },
        { id: 'Nursing Technician', label: 'Nursing Technicians & PCTs (PCT, CNA)', icon: '🩺' },
        { id: 'Medical Aides & Clinical Support', label: 'Medical Assistants, CNAs & EMS (CCMA, EMT)', icon: '🩹' },
        { id: 'Diagnostic Imaging & Allied Health', label: 'Surgical, Radiology, Resp & Lab Techs', icon: '🩻' },
        { id: 'Medical & Hospital Administration', label: 'Medical & Hospital Admin (MHA/FACHE/CPC)', icon: '📋' },
        { id: 'Recommended', label: 'Recommended for You', icon: '⭐' },
        { id: 'Locum Tenens', label: 'Locum Tenens & Travel PRN', icon: '🌍' }
      ]
    case 'education_workforce':
      return [
        { id: 'All', label: 'All Education, Accessibility & STARs', icon: '🎓' },
        { id: 'Recommended', label: 'Recommended for You', icon: '⭐' },
        { id: 'Higher Education & Faculty', label: 'University Faculty & Research', icon: '🏛️' },
        { id: 'K-12 & STEM Teaching', label: 'K-12 & AP STEM Educators', icon: '📚' },
        { id: 'Vocational & CTE Training', label: 'Vocational Trade Instructors', icon: '🛠️' },
        { id: 'Accessibility & STARs', label: 'Braille, Assistive Tech & Archives', icon: '♿' }
      ]
    case 'community_civic_security':
      return [
        { id: 'All', label: 'All Fire, Public Works & Security', icon: '🚒' },
        { id: 'Recommended', label: 'Recommended for You', icon: '⭐' },
        { id: 'Public Safety & Emergency', label: 'Firefighter, 911 & FEMA Command', icon: '🚨' },
        { id: 'Municipal & Bridge Inspection', label: 'Bridge Inspection & Traffic Signals', icon: '🌉' },
        { id: 'Veterans & Military Transition', label: 'Veterans & DoD SkillBridge', icon: '🎖️' },
        { id: 'Corporate Security & Protection', label: 'Executive Protection & Access Control', icon: '🛡️' }
      ]
    case 'campus_students':
      return [
        { id: 'All', label: 'All Student, Apprentice & STARs', icon: '🎒' },
        { id: 'Recommended', label: 'Recommended for You', icon: '⭐' },
        { id: 'Internships & Co-ops', label: 'Internships & Paid Apprenticeships', icon: '🚀' },
        { id: 'Research Fellowships', label: 'Graduate & STEM Fellowships', icon: '🔬' },
        { id: 'New Grad Rotational', label: 'New Grad & Alternative Route Cohorts', icon: '🎯' }
      ]
    case 'tech_software':
      return [
        { id: 'All', label: 'All Software, AI & No-Code Roles', icon: '💻' },
        { id: 'Recommended', label: 'Recommended for You', icon: '⭐' },
        { id: 'Full-Stack & Systems', label: 'Full-Stack & Distributed Systems', icon: '⚡' },
        { id: 'AI & Machine Learning', label: 'AI / LLM, Prompt Ops & Automation', icon: '🤖' },
        { id: 'Cloud & DevOps SRE', label: 'Cloud Infrastructure & SRE', icon: '☁️' },
        { id: 'Remote', label: 'Remote Only', icon: '🌍' }
      ]
    case 'law_gov_defense':
      return [
        { id: 'All', label: 'All Lawyers, Judges & Legal Roles', icon: '⚖️' },
        { id: 'Lawyers & Legal Counsel', label: 'Lawyers & Trial Attorneys (JD / Esq.)', icon: '⚖️' },
        { id: 'Judges, Judiciary & Magistrates', label: 'Judges, Magistrates, ALJs & Law Clerks', icon: '👩‍⚖️' },
        { id: 'Corporate & Gov Counsel', label: 'General Counsel, M&A & IP Lawyers', icon: '📜' },
        { id: 'Paralegal & Court Ops', label: 'Paralegals, Court Reporters & Notaries', icon: '🖋️' },
        { id: 'Defense & Clearance', label: 'Cleared Defense (Secret / TS-SCI)', icon: '🛡️' },
        { id: 'Government', label: 'Federal GS & Judiciary Admin', icon: '🏛️' },
        { id: 'Recommended', label: 'Recommended for You', icon: '⭐' }
      ]
    case 'finance_accounting':
      return [
        { id: 'All', label: 'All Finance, Bookkeeping & Claims', icon: '📊' },
        { id: 'Recommended', label: 'Recommended for You', icon: '⭐' },
        { id: 'CPA & Corporate Accounting', label: 'Controller & SEC Accounting (CPA)', icon: '🧾' },
        { id: 'Bookkeeping, Payroll & Claims', label: 'Bookkeeper, Payroll & Claims Adjuster', icon: '💼' },
        { id: 'Investment Banking & PE', label: 'Private Equity & M&A (CFA)', icon: '📈' },
        { id: 'FP&A & Risk Audit', label: 'Strategic FP&A & SOX Audit', icon: '🏦' }
      ]
    default:
      return [
        { id: 'All', label: 'All Cyber, OT & Tech Openings', icon: '🌐' },
        { id: 'Recommended', label: 'Recommended for You', icon: '⭐' },
        { id: 'Cybersecurity', label: 'Cybersecurity, OT/SCADA & AppSec', icon: '🔐' },
        { id: 'Defense', label: 'Defense & Clearance', icon: '🛡️' },
        { id: 'Government', label: 'Government & Public Sector', icon: '🏛️' },
        { id: 'Remote', label: 'Remote Only', icon: '🌍' },
        { id: 'Contract', label: 'Contract & Fractional', icon: '📜' },
        { id: 'Full-time', label: 'Full-time', icon: '💼' }
      ]
  }
}

const PUBLISHED_JOBS_STORAGE_KEY = 'connectin_published_jobs_v1'

function loadPublishedJobsFromStorage(): GlobalJobItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(PUBLISHED_JOBS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function savePublishedJobToStorage(job: GlobalJobItem): GlobalJobItem[] {
  if (typeof window === 'undefined') return [job]
  try {
    const existing = loadPublishedJobsFromStorage().filter(j => j.id !== job.id)
    const updated = [job, ...existing]
    window.localStorage.setItem(PUBLISHED_JOBS_STORAGE_KEY, JSON.stringify(updated))
    return updated
  } catch {
    return [job]
  }
}

function filterPublishedJobsForView(
  published: GlobalJobItem[],
  countryCode: string,
  enclave: string,
  query: string
): GlobalJobItem[] {
  return published.filter(j => {
    const countryMatch = !countryCode || j.countryCode === countryCode
    const enclaveMatch = !enclave || enclave === 'all' || j.professionEnclave === enclave
    const queryMatch =
      !query.trim() ||
      j.title.toLowerCase().includes(query.toLowerCase()) ||
      j.company.toLowerCase().includes(query.toLowerCase()) ||
      j.description.toLowerCase().includes(query.toLowerCase())
    return countryMatch && enclaveMatch && queryMatch
  })
}

export function JobsView({
  currentUser,
  onNavigateLearning,
  onNavigateMarketplace,
  onJobPublished
}: JobsViewProps) {
  // Primary Master Mode
  const [masterMode, setMasterMode] = useState<'find' | 'applications' | 'recruiting' | 'resumeprep'>('find')

  // Active Profession Enclave Filter (Default to 'all' so Herbal Medicine, Dentists, Solar Technicians, DirecTV/Satellite Techs, Lawyers, Judges, Pharmacists, Doctors, Nurses & Nursing Techs are all visible immediately at the top)
  const [selectedEnclave, setSelectedEnclave] = useState<string>(
    currentUser?.professionEnclave && currentUser.professionEnclave !== 'trades_construction'
      ? currentUser.professionEnclave
      : 'all'
  )

  useEffect(() => {
    if (currentUser?.professionEnclave && currentUser.professionEnclave !== 'trades_construction') {
      setSelectedEnclave(currentUser.professionEnclave)
      setSelectedDomain("All")
    }
  }, [currentUser?.professionEnclave])

  // Resume Preparation App (https://tuhousing.vercel.app/) State
  const [tailorTargetJob, setTailorTargetJob] = useState<GlobalJobItem | null>(null)
  const [copiedJobDesc, setCopiedJobDesc] = useState(false)
  const [resumeIframeKey, setResumeIframeKey] = useState(0)
  const [isResumeFullscreen, setIsResumeFullscreen] = useState(false)

  const handleTailorResumeForJob = (job: GlobalJobItem) => {
    setTailorTargetJob(job)
    const fullSpec = `Job Title: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location}\nSalary: ${job.salaryRange || 'Competitive'}\n\nDescription:\n${job.description}\n\nRequirements:\n${(job.requirements || []).join('\n• ')}\n\nSkills & Tags: ${(job.tags || []).join(', ')}`
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(fullSpec).catch(() => {})
      setCopiedJobDesc(true)
      setTimeout(() => setCopiedJobDesc(false), 3500)
    }
    setMasterMode('resumeprep')
  }

  const DOMAIN_CATEGORIES = getEnclaveJobCategories(selectedEnclave)

  // Find Jobs Filters
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("US")
  const [selectedHub, setSelectedHub] = useState<string>("All Hubs")
  const [selectedDomain, setSelectedDomain] = useState<string>("All")
  const [selectedPillar, setSelectedPillar] = useState<string>("all")
  const [selectedProfessionId, setSelectedProfessionId] = useState<string>("all")
  const [isDirectoryOpen, setIsDirectoryOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window === "undefined") return ""
    try {
      const pre = window.sessionStorage.getItem("connectln_jobs_prefill")
      if (pre) { window.sessionStorage.removeItem("connectln_jobs_prefill"); return pre }
    } catch {}
    return ""
  })
  const [jobs, setJobs] = useState<GlobalJobItem[]>([])
  const [liveSyncCount, setLiveSyncCount] = useState<number>(0)
  const [lastSyncedAt, setLastSyncedAt] = useState<string>("Just now")
  const [selectedJob, setSelectedJob] = useState<GlobalJobItem | null>(null)
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false)

  // Applications State
  const [applications, setApplications] = useState<JobApplicationItem[]>(initialUserApplications)
  const [appStageFilter, setAppStageFilter] = useState<'all' | 'applied' | 'interview' | 'offer' | 'rejected'>('all')

  // Recruiting State
  const [candidates] = useState<CandidateProfile[]>(initialCandidatesData)
  const [selectedRecruitingFilter, setSelectedRecruitingFilter] = useState<string>('All')
  const [isPostJobOpen, setIsPostJobOpen] = useState(false)
  const [postJobSuccess, setPostJobSuccess] = useState(false)

  // Post Job Form State
  const [newJobTitle, setNewJobTitle] = useState("")
  const [newJobCompany, setNewJobCompany] = useState("Expedite Partner Employer")
  const [newJobLocation, setNewJobLocation] = useState("Washington, DC / Hybrid")
  const [newJobSalary, setNewJobSalary] = useState("$145,000 - $185,000 / yr")
  const [newJobProductRequired, setNewJobProductRequired] = useState("OSHA 30 / Industry License / Zero Trust")
  const [newJobApplyUrl, setNewJobApplyUrl] = useState("")
  const [newJobDescription, setNewJobDescription] = useState("")
  const [newJobCountryCode, setNewJobCountryCode] = useState<string>("US")
  const [newJobEnclave, setNewJobEnclave] = useState<string>("trades_construction")
  const [newJobWorkplaceType, setNewJobWorkplaceType] = useState<'On-site' | 'Hybrid' | 'Remote'>('Hybrid')
  const [newJobEmploymentType, setNewJobEmploymentType] = useState<'Full-time' | 'Contract' | 'Part-time'>('Full-time')

  // Keep Post Job defaults aligned with currently selected Country & Enclave when modal opens
  const handleOpenPostJobModal = () => {
    setNewJobCountryCode(selectedCountryCode || "US")
    setNewJobEnclave(selectedEnclave === 'all' ? 'trades_construction' : selectedEnclave)
    const countryObj = COUNTRIES_CONFIG.find(c => c.code === selectedCountryCode) || COUNTRIES_CONFIG[0]
    setNewJobLocation(`${countryObj.hubs[1] || countryObj.name} (${countryObj.name})`)
    setPostJobSuccess(false)
    setIsPostJobOpen(true)
  }

  // Listen for cross-tab job publish events so all open ConnectLn tabs sync immediately
  useEffect(() => {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return
    const channel = new BroadcastChannel('connectin_jobs_sync')
    channel.onmessage = (event) => {
      const publishedJob = event.data?.job as GlobalJobItem | undefined
      if (publishedJob) {
        setJobs(prev => [publishedJob, ...prev.filter(j => j.id !== publishedJob.id)])
        setLastSyncedAt('Just published · Synced live')
      }
    }
    return () => channel.close()
  }, [])

  // Modals
  const [careerTwinJob, setCareerTwinJob] = useState<any | null>(null)
  const [isCareerTwinOpen, setIsCareerTwinOpen] = useState(false)
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([])
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [applyStep, setApplyStep] = useState<'form' | 'success'>('form')
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)

  // Current active country config
  const currentCountry = COUNTRIES_CONFIG.find(c => c.code === selectedCountryCode) || COUNTRIES_CONFIG[0]
  const currentEnclaveObj = PROFESSION_ENCLAVES.find(e => e.id === selectedEnclave)
  const currentProfessionObj = ALL_PROFESSIONS.find(p => p.id === selectedProfessionId)

  // Fetch live jobs from /api/connectin/jobs backend with instant local fallback
  const fetchJobs = async (
    enclave: string,
    countryCode: string,
    hub: string = 'All Hubs',
    query: string = '',
    domain: string = 'All',
    pillar: string = 'all',
    professionId: string = 'all'
  ) => {
    setIsLoadingJobs(true)
    const localPublished = filterPublishedJobsForView(
      loadPublishedJobsFromStorage(),
      countryCode,
      enclave,
      query
    )
    try {
      const params = new URLSearchParams({
        enclave,
        country: countryCode,
        hub,
        domain,
        pillar,
        professionId,
        q: query
      })
      const res = await fetch(`/api/connectin/jobs?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.jobs)) {
          const apiIds = new Set(data.jobs.map((j: GlobalJobItem) => j.id))
          const merged = [...localPublished.filter(j => !apiIds.has(j.id)), ...data.jobs]
          setJobs(merged)
          setLiveSyncCount(data.liveExternalCount || 0)
          setLastSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
          setIsLoadingJobs(false)
          return
        }
      }
    } catch (err) {
      console.warn("Backend job sync fallback triggered:", err)
    }

    // Local fallback if offline — strictly localized to the selected country & profession
    try {
      let list = getLocalizedJobsForCountryAndEnclave(countryCode, enclave)

      if (professionId && professionId !== 'all') {
        const targetProf = ALL_PROFESSIONS.find(p => p.id === professionId)
        const profFiltered = list.filter(j => {
          if (j.professionId === professionId) return true
          if (targetProf) {
            const titleWords = targetProf.title.toLowerCase().split(/[\s/&,-]+/).filter(w => w.length > 3)
            return titleWords.some(w => j.title.toLowerCase().includes(w) || j.tags.some(t => t.toLowerCase().includes(w)))
          }
          return false
        })
        if (profFiltered.length > 0) list = profFiltered
      }

      if (pillar && pillar !== 'all' && enclave === 'all') {
        const matchedPillar = CONNECTIN_WORKER_PILLARS.find(p => p.id === pillar)
        if (matchedPillar) {
          list = list.filter(j => matchedPillar.enclaveIds.includes(j.professionEnclave))
        }
      }

      if (hub && hub !== 'All Hubs') {
        const hubFiltered = list.filter(j => j.hub === hub || j.location.includes(hub.split(' ')[0]))
        if (hubFiltered.length > 0) list = hubFiltered
      }

      if (domain && domain !== 'All') {
        list = list.filter(j => {
          if (domain === 'Remote') return j.workplaceType === 'Remote' || j.tags.includes('Remote')
          if (domain === 'Contract') return j.employmentType === 'Contract' || j.tags.includes('Contract')
          if (domain === 'Full-time') return j.employmentType === 'Full-time'
          if (domain === 'Recommended') return j.domainCategory === 'Recommended' || j.tags.includes('Recommended')
          return (
            j.domainCategory === domain ||
            j.tags.some(t => t.toLowerCase().includes(domain.toLowerCase())) ||
            j.title.toLowerCase().includes(domain.toLowerCase()) ||
            j.description.toLowerCase().includes(domain.toLowerCase())
          )
        })
      }

      if (query.trim()) {
        const q = query.toLowerCase()
        list = list.filter(
          j =>
            j.title.toLowerCase().includes(q) ||
            j.company.toLowerCase().includes(q) ||
            j.description.toLowerCase().includes(q) ||
            j.tags.some(t => t.toLowerCase().includes(q))
        )
      }

      const existingIds = new Set(list.map(j => j.id))
      setJobs([...localPublished.filter(j => !existingIds.has(j.id)), ...list])
    } finally {
      setIsLoadingJobs(false)
    }
  }

  // Reload jobs when enclave, country, hub, domain, pillar, or professionId changes
  useEffect(() => {
    fetchJobs(selectedEnclave, selectedCountryCode, selectedHub, searchQuery, selectedDomain, selectedPillar, selectedProfessionId)
  }, [selectedEnclave, selectedCountryCode, selectedHub, selectedDomain, selectedPillar, selectedProfessionId])

  const handleCountryChange = (newCode: string) => {
    setSelectedCountryCode(newCode)
    setSelectedHub("All Hubs")
  }

  const handleEnclaveChange = (newEnclave: string) => {
    setSelectedEnclave(newEnclave)
    setSelectedProfessionId("all")
    setSelectedDomain("All")
  }

  const handlePillarChange = (pillarId: string) => {
    setSelectedPillar(pillarId)
    setSelectedEnclave("all")
    setSelectedProfessionId("all")
    setSelectedDomain("All")
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchJobs(selectedEnclave, selectedCountryCode, selectedHub, searchQuery, selectedDomain, selectedPillar, selectedProfessionId)
  }

  const toggleSaveJob = (jobId: string) => {
    setJobs(prev =>
      prev.map(j => (j.id === jobId ? { ...j, isSaved: !j.isSaved } : j))
    )
  }

  const handleOpenApply = (job: GlobalJobItem) => {
    setSelectedJob(job)
    setApplyStep('form')
    setIsApplyModalOpen(true)
  }

  const handleOpenJobDetail = (job: GlobalJobItem) => {
    setSelectedJob(job)
    setIsJobDetailOpen(true)
  }

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedJob) {
      setAppliedJobIds(prev => [...prev, selectedJob.id])
      const flywheel = getJobFlywheelRecommendation(selectedJob)
      const newApp: JobApplicationItem = {
        id: 'app_' + Date.now(),
        jobTitle: selectedJob.title,
        company: selectedJob.company,
        companyLogo: selectedJob.companyLogo,
        location: selectedJob.location,
        salary: selectedJob.salaryRange,
        stage: 'applied',
        appliedDate: 'Just now',
        nextStep: 'Application submitted · Synced with Employer ATS',
        productVerifiedMatch: flywheel.primarySkill
      }
      setApplications(prev => [newApp, ...prev])
      setApplyStep('success')
    }
  }

  const handlePostJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetCountryObj = COUNTRIES_CONFIG.find(c => c.code === newJobCountryCode) || currentCountry
    const targetEnclave = newJobEnclave || (selectedEnclave === 'all' ? 'trades_construction' : selectedEnclave)

    // Construct immediate optimistic job so it syncs with 0ms delay
    const optimisticJob: GlobalJobItem = {
      id: 'job_live_' + Date.now(),
      professionEnclave: targetEnclave,
      countryCode: targetCountryObj.code,
      countryName: targetCountryObj.name,
      hub: targetCountryObj.hubs[1] || 'All Hubs',
      title: newJobTitle.trim(),
      company: newJobCompany.trim() || 'Expedite Partner Employer',
      companyLogo: (newJobCompany.trim() || 'EX').substring(0, 2).toUpperCase(),
      location: newJobLocation.trim() || `${targetCountryObj.name}`,
      workplaceType: newJobWorkplaceType,
      employmentType: newJobEmploymentType,
      domainCategory: 'Recommended',
      salaryRange: newJobSalary.trim() || 'Competitive Compensation',
      postedTime: 'Just published · Synced live',
      applicantsCount: 1,
      isEasyApply: true,
      applyUrl: newJobApplyUrl.trim() || 'https://www.connectln.app/connectin',
      tags: [newJobProductRequired || 'Verified Role', 'Hiring Now', 'Immediate Sync', targetEnclave],
      description: newJobDescription.trim() || `Immediate opening for ${newJobTitle} at ${newJobCompany} in ${newJobLocation}.`,
      requirements: [
        `Practical experience or certification in ${newJobProductRequired}`,
        'Verified professional portfolio or trade/industry credentials'
      ],
      isSaved: false
    }

    // 1. Immediately persist to localStorage & prepend to UI state (0ms latency)
    savePublishedJobToStorage(optimisticJob)
    setSelectedCountryCode(targetCountryObj.code)
    setSelectedEnclave(targetEnclave)
    setSelectedProfessionId("all")
    setMasterMode('find')
    setJobs(prev => [optimisticJob, ...prev.filter(j => j.id !== optimisticJob.id)])
    setLastSyncedAt('Just published · Synced live')
    setPostJobSuccess(true)

    // 2. Broadcast across all open ConnectLn tabs
    if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel('connectin_jobs_sync')
        channel.postMessage({ type: 'JOB_PUBLISHED', job: optimisticJob })
        channel.close()
      } catch {}
    }

    // 3. Immediately sync to ConnectLn Home Feed
    onJobPublished?.(optimisticJob)

    // 4. Sync with backend /api/connectin/jobs
    try {
      const res = await fetch('/api/connectin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode: targetCountryObj.code,
          countryName: targetCountryObj.name,
          professionEnclave: targetEnclave,
          workplaceType: newJobWorkplaceType,
          employmentType: newJobEmploymentType,
          title: newJobTitle,
          company: newJobCompany,
          location: newJobLocation,
          salaryRange: newJobSalary,
          requiredProduct: newJobProductRequired,
          applyUrl: newJobApplyUrl,
          description: newJobDescription
        })
      })
      const data = await res.json()
      if (data?.job) {
        savePublishedJobToStorage(data.job)
        setJobs(prev => [data.job, ...prev.filter(j => j.id !== optimisticJob.id && j.id !== data.job.id)])
      }
    } catch {
      // Optimistic job is already saved and live in state
    }

    setTimeout(() => {
      setPostJobSuccess(false)
      setIsPostJobOpen(false)
      setNewJobTitle("")
      setNewJobDescription("")
    }, 900)
  }

  const filteredApplications = applications.filter(a => {
    if (appStageFilter === 'all') return true
    return a.stage === appStageFilter
  })

  const filteredCandidates = candidates.filter(c => {
    if (selectedRecruitingFilter === 'All') return true
    if (selectedRecruitingFilter === 'ProductVerified') return c.verifiedProducts && c.verifiedProducts.length > 0
    if (selectedRecruitingFilter === 'Clearance') return c.clearance && c.clearance.length > 0
    return true
  })

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20">
      {/* 1. TOP JOBS BANNER & 4-MODE SWITCHER */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 text-zinc-900 dark:text-zinc-100 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-blue-50 dark:bg-blue-950/50 px-3 py-0.5 text-xs font-semibold text-[#0A66C2] dark:text-sky-300 border border-blue-200/60 dark:border-blue-800/60 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                ConnectIn 20-Enclave · 42-Category Live Job Network
              </span>
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {currentCountry.flag} {currentCountry.name} · {jobs.length} active roles ({lastSyncedAt})
              </span>
              <button
                type="button"
                onClick={() => setIsDirectoryOpen(prev => !prev)}
                className="rounded-full bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 px-3 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>🧭</span>
                <span>{isDirectoryOpen ? "Hide 42-Category Profession Directory" : `Browse All 42 Categories & ${ALL_PROFESSIONS.length} Professions`}</span>
              </button>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {selectedEnclave === 'all'
                ? `Explore Live Jobs in ${currentCountry.name} Across All 20 Industry Enclaves (${ALL_PROFESSIONS.length} Professions)`
                : currentProfessionObj
                ? `${currentEnclaveObj?.icon || '💼'} ${currentProfessionObj.title} — ${currentCountry.name} Openings`
                : `${currentEnclaveObj?.icon || '💼'} ${currentEnclaveObj?.name || 'Verified'} — ${currentCountry.name} Openings`}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              Built for hands-on trades, field technicians, independent service earners, clinical &amp; lab specialists, and STARs (Skilled Through Alternative Routes — no 4-year degree gatekeeping) across {COUNTRIES_CONFIG.length} global regions.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-full border border-zinc-200 dark:border-zinc-700 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setMasterMode('find')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                masterMode === 'find'
                  ? "bg-[#0A66C2] text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              <span>Find Jobs</span>
            </button>

            <button
              type="button"
              onClick={() => setMasterMode('resumeprep')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                masterMode === 'resumeprep'
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Resume Prep App</span>
            </button>

            <button
              type="button"
              onClick={() => setMasterMode('applications')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                masterMode === 'applications'
                  ? "bg-[#0A66C2] text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>My Applications ({applications.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setMasterMode('recruiting')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                masterMode === 'recruiting'
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Recruiting Hub</span>
            </button>

            <button
              type="button"
              onClick={handleOpenPostJobModal}
              className="px-3.5 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer bg-[#0A66C2] hover:bg-[#004182] text-white shadow-xs"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>+ Publish a Job</span>
            </button>
          </div>
        </div>

        {/* Dynamic Profession Enclave Switcher + Worker Pillars + Country Ribbon (Visible in Find Jobs Mode) */}
        {masterMode === 'find' && (
          <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
            {/* 3 CORE WORKER PILLARS BAR */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 shrink-0 mr-1">
                Pathway:
              </span>
              <button
                type="button"
                onClick={() => handlePillarChange('all')}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  selectedPillar === 'all' && selectedEnclave === 'all'
                    ? "bg-[#0A66C2] text-white shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 border border-zinc-200/70 dark:border-zinc-700/70"
                }`}
              >
                <span>🌍</span>
                <span>All Career Pathways</span>
              </button>
              {CONNECTIN_WORKER_PILLARS.map((pillar) => {
                const isSelected = selectedPillar === pillar.id && selectedEnclave === 'all'
                return (
                  <button
                    key={pillar.id}
                    type="button"
                    onClick={() => handlePillarChange(pillar.id)}
                    title={pillar.subtitle}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600 text-white font-semibold shadow-xs"
                        : "bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/70 dark:border-emerald-800/60"
                    }`}
                  >
                    <span>{pillar.icon}</span>
                    <span>{pillar.title}</span>
                  </button>
                )
              })}
            </div>

            {/* ALL 20 PROFESSIONS SWITCHER BAR (Healthcare & Medicine First) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 text-xs">
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 shrink-0 mr-1">
                Enclave:
              </span>
              <button
                type="button"
                onClick={() => handleEnclaveChange('all')}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  selectedEnclave === 'all'
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 border border-zinc-200/70 dark:border-zinc-700/70"
                }`}
              >
                <span>🌐</span>
                <span>All {PROFESSION_ENCLAVES.length} Industry Enclaves</span>
              </button>

              {[
                ...PROFESSION_ENCLAVES.filter((e) => e.id === 'healthcare_medicine'),
                ...PROFESSION_ENCLAVES.filter((e) => e.id !== 'healthcare_medicine')
              ].map((enc) => {
                const isSelected = selectedEnclave === enc.id
                return (
                  <button
                    key={enc.id}
                    type="button"
                    onClick={() => handleEnclaveChange(enc.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-[#0A66C2] text-white font-semibold shadow-xs"
                        : enc.id === 'healthcare_medicine'
                        ? "bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-700 font-semibold hover:bg-teal-100"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 border border-zinc-200/70 dark:border-zinc-700/70"
                    }`}
                  >
                    <span>{enc.icon}</span>
                    <span>{enc.shortName}</span>
                  </button>
                )
              })}
            </div>

            {/* DEDICATED MEDICINE, PHARMACY, DOCTORS, NURSES & NURSING TECHNICIANS QUICK-FILTER BAR */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 text-xs pt-1 border-t border-teal-100 dark:border-teal-900/50">
              <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 shrink-0 mr-1 flex items-center gap-1">
                <span>🏥</span>
                <span>Medicine &amp; Clinical Roles:</span>
              </span>
              {[
                { id: 'all_med', label: '🏥 All Medicine & Healthcare', profId: 'all', domain: 'All' },
                { id: 'pharmacist', label: '💊 Pharmacists (PharmD)', profId: 'pharmacist', domain: 'All' },
                { id: 'pharmacy_technician', label: '🧪 Pharmacy Techs (CPhT)', profId: 'pharmacy_technician', domain: 'All' },
                { id: 'physician', label: '🩺 Doctors & Physicians (MD/DO)', profId: 'physician', domain: 'All' },
                { id: 'surgeon_specialist_md', label: '🔪 Surgeons (MD, FACS)', profId: 'surgeon_specialist_md', domain: 'All' },
                { id: 'registered_nurse', label: '❤️‍🩹 Registered Nurses (BSN, RN)', profId: 'registered_nurse', domain: 'All' },
                { id: 'critical_care_er_nurse', label: '🚨 ICU & Trauma Nurses (CCRN)', profId: 'critical_care_er_nurse', domain: 'All' },
                { id: 'nurse_practitioner_pa', label: '📋 Nurse Practitioners & PAs (APRN/PA-C)', profId: 'nurse_practitioner_pa', domain: 'All' },
                { id: 'licensed_practical_nurse', label: '🩹 LPN / LVN Nurses', profId: 'licensed_practical_nurse', domain: 'All' },
                { id: 'nursing_technician', label: '🩺 Nursing Technicians (PCT / CNA)', profId: 'nursing_technician', domain: 'All' },
                { id: 'medical_assistant_aide', label: '💉 Medical Assistants & Aides (CCMA/CNA)', profId: 'medical_assistant_aide', domain: 'All' },
                { id: 'surgical_sterile_tech', label: '🔪 Surgical & Sterile Techs (CST/CRCST)', profId: 'surgical_sterile_tech', domain: 'All' },
                { id: 'respiratory_therapist', label: '🫁 Respiratory Therapists (RRT)', profId: 'respiratory_therapist', domain: 'All' },
                { id: 'radiology_imaging_tech', label: '🩻 Radiology, CT/MRI & Ultrasound Techs', profId: 'radiology_imaging_tech', domain: 'All' },
                { id: 'clinical_lab_phlebotomy_tech', label: '🧬 Clinical Lab & Phlebotomy Techs (MLS/CPT)', profId: 'clinical_lab_phlebotomy_tech', domain: 'All' },
                { id: 'paramedic_emt', label: '🚑 Paramedics & EMTs (NRP)', profId: 'paramedic_emt', domain: 'All' },
                { id: 'medical_administrator', label: '🏥 Medical & Hospital Admin (MHA/FACHE)', profId: 'medical_administrator', domain: 'All' },
                { id: 'medical_billing_him', label: '📊 Medical Coding & Health Info (RHIA/CPC)', profId: 'medical_billing_him', domain: 'All' },
                { id: 'physical_occupational_therapist', label: '🏃 Physical & Occupational Therapy (DPT/OTR)', profId: 'physical_occupational_therapist', domain: 'All' },
                { id: 'dentist', label: '🦷 Dentists (DDS/DMD)', profId: 'dentist', domain: 'All' },
                { id: 'veterinarian', label: '🐾 Veterinarians (DVM)', profId: 'veterinarian', domain: 'All' }
              ].map((medRole) => {
                const isActive =
                  selectedEnclave === 'healthcare_medicine' &&
                  selectedProfessionId === medRole.profId
                return (
                  <button
                    key={medRole.id}
                    type="button"
                    onClick={() => {
                      setSelectedEnclave('healthcare_medicine')
                      setSelectedProfessionId(medRole.profId)
                      setSelectedDomain(medRole.domain)
                      setSearchQuery('')
                    }}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-teal-600 text-white shadow-xs"
                        : "bg-teal-50/80 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200/80 dark:border-teal-800/60"
                    }`}
                  >
                    {medRole.label}
                  </button>
                )
              })}
            </div>

            {/* INDIVIDUAL PROFESSIONS BAR FOR SELECTED ENCLAVE */}
            {selectedEnclave !== 'all' && selectedEnclave !== 'healthcare_medicine' && currentEnclaveObj && currentEnclaveObj.professions.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 text-xs pt-1 border-t border-zinc-100/80 dark:border-zinc-800/80">
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 shrink-0 mr-1">
                  Profession ({currentEnclaveObj.professions.length}):
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedProfessionId('all')}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedProfessionId === 'all'
                      ? "bg-[#0A66C2] text-white shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700"
                  }`}
                >
                  All {currentEnclaveObj.shortName} Professions ({currentEnclaveObj.professions.length})
                </button>
                {currentEnclaveObj.professions.map((prof) => {
                  const isProfSelected = selectedProfessionId === prof.id
                  return (
                    <button
                      key={prof.id}
                      type="button"
                      onClick={() => setSelectedProfessionId(prof.id)}
                      title={`${prof.categoryName} · Skills: ${prof.typicalSkills.join(', ')}`}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                        isProfSelected
                          ? "bg-amber-600 text-white font-semibold shadow-xs"
                          : "bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200/70 dark:border-amber-800/60"
                      }`}
                    >
                      {prof.title}
                    </button>
                  )
                })}
              </div>
            )}

            {/* EXPANDABLE 5-TIER TAXONOMY & 42-CATEGORY PROFESSION DIRECTORY */}
            {isDirectoryOpen && (
              <div className="rounded-xl border border-amber-200/90 dark:border-amber-800/70 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/70 dark:border-amber-800/50 pb-2.5">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span>🧭</span>
                      <span>5-Tier Profession &amp; Capability Directory (20 Industry Enclaves · 42 Categories · {ALL_PROFESSIONS.length} Specializations)</span>
                    </h3>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      Structured as <strong>Industry → Profession → Specialization → Verified Capabilities → Live Jobs in {currentCountry.name}</strong>. Click any specialization to filter roles immediately.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDirectoryOpen(false)}
                    className="self-start sm:self-auto rounded-lg px-2.5 py-1 text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 cursor-pointer"
                  >
                    Close Directory
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
                  {PROFESSION_ENCLAVES.map((enc) => (
                    <div
                      key={enc.id}
                      className={`rounded-xl border p-3 transition-all bg-white dark:bg-zinc-900 ${
                        selectedEnclave === enc.id
                          ? "border-[#0A66C2] ring-1 ring-[#0A66C2]/30"
                          : "border-zinc-200/80 dark:border-zinc-800"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            handleEnclaveChange(enc.id)
                            setSearchQuery("")
                          }}
                          className="text-left font-bold text-xs text-zinc-900 dark:text-zinc-100 hover:text-[#0A66C2] flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{enc.icon}</span>
                          <span>{enc.name}</span>
                        </button>
                        <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">
                          {enc.professions.length} roles
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-2 line-clamp-1">
                        {enc.tagline}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {enc.professions.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => {
                              setSelectedEnclave(enc.id)
                              setSelectedProfessionId(sub.id)
                              setSelectedDomain("All")
                              setSearchQuery("")
                              setIsDirectoryOpen(false)
                            }}
                            title={`Category: ${sub.categoryName} | Skills: ${sub.typicalSkills.join(', ')} | Tools: ${sub.tools.map(t => t.name).join(', ')}`}
                            className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer text-left ${
                              selectedProfessionId === sub.id
                                ? "bg-[#0A66C2] text-white font-semibold"
                                : "bg-zinc-100 dark:bg-zinc-800 hover:bg-[#0A66C2] hover:text-white text-zinc-700 dark:text-zinc-300"
                            }`}
                          >
                            {sub.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Country / Region Ribbon (18 Global Regions) */}
            <div className="flex items-center justify-between gap-4 flex-wrap pt-1 border-t border-zinc-100/80 dark:border-zinc-800/80">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 shrink-0">
                  Region ({COUNTRIES_CONFIG.length}):
                </span>
                {COUNTRIES_CONFIG.map((c) => {
                  const isSelected = selectedCountryCode === c.code
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleCountryChange(c.code)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-[#0A66C2] text-white font-semibold shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 border border-zinc-200/70 dark:border-zinc-700/70"
                      }`}
                    >
                      <span>{c.flag}</span>
                      <span>{getCountryShortLabel(c)}</span>
                    </button>
                  )
                })}
              </div>

              <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium flex items-center gap-1.5 shrink-0">
                <Languages className="h-3.5 w-3.5 text-[#0A66C2]" />
                {currentCountry.languages[0]} · {currentCountry.currency} ({currentCountry.currencySymbol})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: FIND JOBS (MULTI-PROFESSION LIVE BACKEND SYNC) */}
      {/* ========================================================================= */}
      {masterMode === 'find' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Rail: Domain Categories & Hubs */}
          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            {/* Resume Preparation App Card (Top of Left Rail) — Embedded Single Portal */}
            <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-teal-50/70 to-sky-50/80 p-4 shadow-xs dark:border-emerald-900/50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-sky-950/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Resume Prep App
                </span>
                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                  Embedded Studio
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                AI Resume Tailor, ATS Fit Score, Corporate &amp; USAJOBS Federal KSAs, Profile Maximizer &amp; Job Tracker — embedded in one unified portal.
              </p>
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => setMasterMode('resumeprep')}
                  className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-xs font-bold text-white shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Open Resume Prep App</span>
                </button>
              </div>
            </div>

            {/* Domain Categories */}
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-[#0A66C2]" />
                {currentEnclaveObj ? `${currentEnclaveObj.shortName} Categories` : 'Job Categories'}
              </h3>
              <div className="space-y-1 text-xs">
                {DOMAIN_CATEGORIES.map((dom) => {
                  const isSelected = selectedDomain === dom.id
                  return (
                    <button
                      key={dom.id}
                      onClick={() => setSelectedDomain(dom.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#0A66C2] text-white shadow-2xs"
                          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{dom.icon}</span>
                        <span>{dom.label}</span>
                      </span>
                      {isSelected && <Check className="h-3 w-3 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Regional Centers */}
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
              <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#0A66C2]" />
                {currentCountry.name} Hubs
              </h4>
              <div className="space-y-1 pt-1">
                {currentCountry.hubs.map((hub) => {
                  const isSelected = selectedHub === hub
                  return (
                    <button
                      key={hub}
                      onClick={() => setSelectedHub(hub)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs"
                          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <span className="truncate">{hub}</span>
                      {isSelected && <Check className="h-3 w-3 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Main Job Results Feed */}
          <div className="md:col-span-8 lg:col-span-9 space-y-4">
            {/* Search Header */}
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 flex items-center rounded-lg bg-zinc-50 px-3 py-2 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800/80">
                  <Search className="h-4 w-4 text-zinc-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder={getEnclaveSearchPlaceholder(selectedEnclave, currentCountry.name)}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("")
                        fetchJobs(selectedEnclave, selectedCountryCode, selectedHub, "", selectedDomain)
                      }}
                      className="text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoadingJobs}
                  className="rounded-lg bg-[#0A66C2] px-5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#004182] transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {isLoadingJobs ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  <span>Search</span>
                </button>

                <button
                  type="button"
                  onClick={() => fetchJobs(selectedEnclave, selectedCountryCode, selectedHub, searchQuery, selectedDomain)}
                  title="Sync latest live job openings"
                  className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoadingJobs ? "animate-spin text-[#0A66C2]" : ""}`} />
                  <span className="hidden sm:inline">Sync Live</span>
                </button>
              </form>

              <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 flex-wrap gap-2">
                <span>
                  Region: <strong>{currentCountry.flag} {currentCountry.name}</strong> · Profession: <strong>{currentEnclaveObj ? currentEnclaveObj.name : 'All 15 Professions'}</strong> · Hub: <strong>{selectedHub}</strong>
                </span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {jobs.length} real openings in {currentCountry.name}
                </span>
              </div>
            </div>

            {/* Jobs List */}
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              {jobs.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                    No openings found for this filter in {currentCountry.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Try viewing All 15 Professions or resetting your category filters.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        setSelectedDomain("All")
                        setSelectedHub("All Hubs")
                        setSearchQuery("")
                      }}
                      className="rounded-full bg-[#0A66C2] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#004182] cursor-pointer"
                    >
                      Reset Filters
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEnclave("all")
                        setSelectedDomain("All")
                        setSelectedHub("All Hubs")
                        setSearchQuery("")
                      }}
                      className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-4 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 cursor-pointer"
                    >
                      Show All 15 Professions
                    </button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {jobs.map((job) => {
                    const isApplied = appliedJobIds.includes(job.id)
                    const flywheel = getJobFlywheelRecommendation(job)
                    const jobEnclaveObj = PROFESSION_ENCLAVES.find(e => e.id === job.professionEnclave)

                    return (
                      <div
                        key={job.id}
                        className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4 group"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <img
                            src={job.companyLogo}
                            alt={job.company}
                            className="h-12 w-12 rounded-lg object-cover border border-zinc-200 shrink-0 dark:border-zinc-800"
                          />

                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4
                                onClick={() => handleOpenJobDetail(job)}
                                className="font-bold text-sm sm:text-base text-zinc-900 hover:text-[#0A66C2] hover:underline cursor-pointer dark:text-zinc-100 leading-snug"
                              >
                                {job.title}
                              </h4>
                              {jobEnclaveObj && (
                                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#0A66C2] border border-blue-200 dark:bg-blue-950/60 dark:border-blue-800 dark:text-sky-300">
                                  {jobEnclaveObj.icon} {jobEnclaveObj.shortName}
                                </span>
                              )}
                              {job.clearanceRequired && (
                                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300">
                                  🛡️ {job.clearanceRequired}
                                </span>
                              )}
                              {job.isLiveFeed && (
                                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300">
                                  ⚡ Live Feed
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                              {job.company} · <span className="text-zinc-400">{job.source}</span>
                            </p>

                            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                              <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                                <MapPin className="h-3.5 w-3.5 text-[#0A66C2]" />
                                {job.location}
                              </span>
                              {job.salaryRange && (
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                  {job.salaryRange}
                                </span>
                              )}
                              <span>{job.postedTime}</span>
                            </div>

                            {/* 🔥 PROFESSION-ALIGNED SKILL, CREDENTIAL & LEARNING CONNECTION */}
                            <div className="rounded-lg bg-gradient-to-r from-purple-50/70 to-sky-50/70 border border-purple-200/80 p-2.5 my-2 dark:bg-purple-950/20 dark:border-purple-900/40 space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] flex-wrap gap-1">
                                <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                                  Credential &amp; Skill Connection:
                                </span>
                                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                                  {flywheel.badgeText}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                                This employer recommends proficiency in <strong>{flywheel.primarySkill}</strong> or <strong>{flywheel.secondarySkill}</strong>.
                              </p>
                              <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onNavigateLearning) onNavigateLearning()
                                  }}
                                  className="rounded bg-white px-2 py-0.5 text-[10px] font-bold text-[#0A66C2] border border-blue-200 shadow-2xs hover:bg-sky-50 dark:bg-zinc-800 dark:border-zinc-700 cursor-pointer"
                                >
                                  🎓 Take Masterclass →
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onNavigateMarketplace) onNavigateMarketplace()
                                  }}
                                  className="rounded bg-white px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200 shadow-2xs hover:bg-purple-50 dark:bg-zinc-800 dark:border-zinc-700 cursor-pointer"
                                >
                                  🛍️ Explore Tools in Marketplace →
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 pt-0.5 leading-relaxed">
                              {job.description}
                            </p>

                            {/* Tags */}
                            {job.tags && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {job.tags.map((t) => (
                                  <span
                                    key={t}
                                    className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions Right Side */}
                        <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleTailorResumeForJob(job)}
                              className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 transition-all flex items-center gap-1 cursor-pointer"
                              title="Tailor your resume & cover letter for this job using the embedded Resume Preparation App"
                            >
                              <FileText className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Tailor Resume</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setCareerTwinJob(job)
                                setIsCareerTwinOpen(true)
                              }}
                              className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 border border-purple-200 hover:bg-purple-100 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300 transition-all flex items-center gap-1 cursor-pointer"
                              title="AI Interview Simulation"
                            >
                              <Sparkles className="h-3 w-3 text-amber-500" />
                              <span>CareerTwin™ Prep</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleSaveJob(job.id)}
                              className={`rounded-full p-1.5 transition-colors cursor-pointer ${
                                job.isSaved
                                  ? "text-[#0A66C2] bg-sky-50 dark:bg-sky-950"
                                  : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                              }`}
                            >
                              <Bookmark className={`h-4 w-4 ${job.isSaved ? "fill-[#0A66C2]" : ""}`} />
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isApplied ? (
                              <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-600 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                <span>Applied</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenApply(job)}
                                className="rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-3.5 py-1.5 text-xs font-bold text-[#0A66C2] dark:text-sky-300 hover:bg-sky-100 transition-colors cursor-pointer"
                              >
                                Easy Apply
                              </button>
                            )}

                            {job.applyUrl && (
                              <a
                                href={job.applyUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full bg-[#0A66C2] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#004182] transition-colors flex items-center gap-1 shadow-xs"
                              >
                                <span>Apply on Site</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: MY APPLICATIONS PIPELINE (KANBAN TRACKER) */}
      {/* ========================================================================= */}
      {masterMode === 'applications' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#0A66C2]" />
                <span>My Applications Tracking Pipeline</span>
              </h2>
              <p className="text-xs text-zinc-500">
                Track real-time status across recruiter reviews, interview panels, and formal offers.
              </p>
            </div>

            {/* Stage Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {[
                { id: 'all', label: `All (${applications.length})` },
                { id: 'applied', label: `Applied (${applications.filter(a => a.stage === 'applied').length})` },
                { id: 'interview', label: `Interview (${applications.filter(a => a.stage === 'interview').length})` },
                { id: 'offer', label: `Offer (${applications.filter(a => a.stage === 'offer').length})` },
                { id: 'rejected', label: `Archived (${applications.filter(a => a.stage === 'rejected').length})` }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setAppStageFilter(pill.id as any)}
                  className={`rounded-full px-3 py-1 font-bold transition-all whitespace-nowrap cursor-pointer ${
                    appStageFilter === pill.id
                      ? "bg-[#0A66C2] text-white shadow-2xs"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  {/* Stage Badge Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        app.stage === 'offer'
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                          : app.stage === 'interview'
                          ? "bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-950 dark:text-purple-300"
                          : app.stage === 'rejected'
                          ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          : "bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-950 dark:text-sky-300"
                      }`}
                    >
                      {app.stage === 'interview' ? '🎙️ Interview Stage' : app.stage === 'offer' ? '🎉 Offer Received' : app.stage === 'rejected' ? 'Archived' : '📤 Applied'}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">{app.appliedDate}</span>
                  </div>

                  {/* Company & Role */}
                  <div className="flex items-start gap-3">
                    <img
                      src={app.companyLogo}
                      alt={app.company}
                      className="h-10 w-10 rounded-lg object-cover border border-zinc-200 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                        {app.jobTitle}
                      </h4>
                      <p className="text-xs text-zinc-500 font-medium">{app.company} · {app.location}</p>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {app.salary}
                  </p>

                  {/* Next Step Note */}
                  <div className="rounded-lg bg-zinc-50 p-2.5 text-xs dark:bg-zinc-800/60 space-y-1">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      Next Step:
                    </p>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      {app.nextStep}
                    </p>
                    {app.offerDetails && (
                      <p className="text-[11px] font-bold text-emerald-600 pt-1">
                        📦 Package: {app.offerDetails}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setCareerTwinJob({
                        title: app.jobTitle,
                        company: app.company,
                        description: `Interview preparation for ${app.jobTitle} at ${app.company}.`
                      })
                      setIsCareerTwinOpen(true)
                    }}
                    className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>Interview Prep</span>
                  </button>

                  <span className="text-[11px] text-zinc-400">
                    {app.recruiterName || 'Talent Ops'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: RECRUITING HUB (AI CANDIDATE MATCHING + POST JOB) */}
      {/* ========================================================================= */}
      {masterMode === 'recruiting' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>Recruiter Command Center &amp; AI Candidate Matching</span>
              </h2>
              <p className="text-xs text-zinc-500">
                Find talent across all 15 professions with verified licenses, certifications, and high skill-match rankings.
              </p>
            </div>

            <button
              onClick={() => setIsPostJobOpen(true)}
              className="rounded-xl bg-[#0A66C2] px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#004182] transition-colors flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post New Job Opening</span>
            </button>
          </div>

          {/* Candidate Filter Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            <span className="font-bold text-zinc-400 uppercase text-[10px] shrink-0">Filter Talent:</span>
            {[
              { id: 'All', label: 'All Verified Candidates' },
              { id: 'ProductVerified', label: '⚡ License & Tool Verified' },
              { id: 'Clearance', label: '🛡️ Active Clearance / Board Certified' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedRecruitingFilter(f.id)}
                className={`rounded-full px-3 py-1 font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedRecruitingFilter === f.id
                    ? "bg-[#0A66C2] text-white shadow-2xs"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* AI Candidate Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCandidates.map((cand) => (
              <div
                key={cand.id}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-purple-500/50 hover:shadow-lg transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <img
                        src={cand.avatar}
                        alt={cand.name}
                        className="h-12 w-12 rounded-full object-cover border-2 border-purple-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                            {cand.name}
                          </h4>
                          <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[9px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                            {cand.currentStatus}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                          {cand.headline}
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          📍 {cand.location} · {cand.experienceYears} yrs experience {cand.clearance && `· 🛡️ ${cand.clearance}`}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                      🎯 {cand.matchScore}% Match
                    </span>
                  </div>

                  {/* Verified Products Badge List */}
                  <div className="space-y-1 pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      Verified Credentials, Licenses &amp; Lab Experience:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {cand.verifiedProducts.map((vp, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-200 dark:bg-purple-950 dark:text-purple-300"
                        >
                          {vp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Capabilities Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {cand.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recruiter Action Buttons */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-medium">
                    Certifications: {cand.certifications.join(', ')}
                  </span>

                  <button
                    onClick={() => {
                      alert(`Direct recruiting invitation sent to ${cand.name}. Calendar link and salary briefing dispatched.`)
                    }}
                    className="rounded-full bg-[#0A66C2] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#004182] transition-colors cursor-pointer"
                  >
                    Reach Out
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 4: RESUME PREPARATION & AI TAILORING STUDIO (tuhousing.vercel.app) */}
      {/* ========================================================================= */}
      {masterMode === 'resumeprep' && (
        <div
          className={
            isResumeFullscreen
              ? "fixed inset-0 z-50 bg-zinc-950/95 p-3 sm:p-5 flex flex-col gap-3 overflow-hidden"
              : "space-y-4"
          }
        >
          {/* Control Header Bar */}
          <div className="rounded-2xl border border-emerald-200/90 dark:border-emerald-900/60 bg-gradient-to-r from-emerald-50/90 via-teal-50/80 to-sky-50/90 dark:from-emerald-950/50 dark:via-teal-950/40 dark:to-sky-950/40 p-4 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Resume Preparation App
                  </span>
                  <span className="rounded-full bg-white/80 dark:bg-zinc-900/80 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    ATS Resume Tailor · Cover Letter · USAJOBS Federal KSAs · Job Tracker
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Expedite CareerSuite™ — AI Resume Preparation &amp; Tailoring Studio
                </h2>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Quick Job Selector to Copy Job Description for Tailoring */}
                <select
                  value={tailorTargetJob?.id || ""}
                  onChange={(e) => {
                    const found =
                      jobs.find((j) => j.id === e.target.value) ||
                      GLOBAL_JOBS_CATALOG.find((j) => j.id === e.target.value)
                    if (found) {
                      handleTailorResumeForJob(found)
                    }
                  }}
                  className="rounded-full border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200 max-w-[260px] truncate"
                >
                  <option value="">⚡ Select a job to copy for tailoring...</option>
                  {(jobs.length > 0 ? jobs : GLOBAL_JOBS_CATALOG).map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} — {j.company}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setResumeIframeKey((prev) => prev + 1)}
                  className="rounded-full bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Reload Resume Preparation App"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Reload</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsResumeFullscreen((prev) => !prev)}
                  className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  {isResumeFullscreen ? "Exit Fullscreen" : "⛶ Expand Fullscreen"}
                </button>
              </div>
            </div>

            {/* Active Target Job Helper Bar */}
            {tailorTargetJob && (
              <div className="mt-3 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white/85 dark:bg-zinc-900/85 rounded-xl p-3 border">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                      TARGET ROLE SELECTED
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                      {tailorTargetJob.title}
                    </span>
                    <span className="text-xs text-zinc-500">at {tailorTargetJob.company}</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5 truncate">
                    Paste the copied job description into <strong>Resume Tailor → Step 2 (Target Job Description)</strong> below to generate your ATS-optimized resume &amp; cover letter.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleTailorResumeForJob(tailorTargetJob)}
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    {copiedJobDesc ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Copied Job Description!</span>
                      </>
                    ) : (
                      <>
                        <FileText className="h-3.5 w-3.5" />
                        <span>Copy Job Description</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTailorTargetJob(null)}
                    className="rounded-full p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    title="Clear target job"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Embedded Live Resume Preparation App (https://tuhousing.vercel.app/) */}
          <div
            className={`rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-lg bg-white dark:bg-zinc-900 ${
              isResumeFullscreen ? "flex-1 min-h-[75vh]" : "h-[840px]"
            }`}
          >
            <iframe
              key={resumeIframeKey}
              src="https://tuhousing.vercel.app/"
              title="Expedite CareerSuite — AI-Powered Resume Preparation & Tailoring App"
              className="w-full h-full border-0"
              allow="camera; microphone; clipboard-write; clipboard-read; downloads"
            />
          </div>
        </div>
      )}

      {/* JOB DETAILS & DIRECT APPLICATION MODAL */}
      <Dialog open={isJobDetailOpen} onOpenChange={setIsJobDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedJob && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 text-xs text-[#0A66C2] font-semibold">
                  <Building className="h-3.5 w-3.5" />
                  <span>{selectedJob.company} · {selectedJob.location}</span>
                </div>
                <DialogTitle className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {selectedJob.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-2 text-xs sm:text-sm">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="rounded-full bg-emerald-50 dark:bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    💰 {selectedJob.salaryRange}
                  </span>
                  <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    📍 {selectedJob.workplaceType} · {selectedJob.employmentType}
                  </span>
                  <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-3 py-1 text-xs font-medium text-[#0A66C2] dark:text-sky-300">
                    Source: {selectedJob.source}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Role Overview</h4>
                  <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {selectedJob.description}
                  </p>
                </div>

                {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Key Qualifications &amp; Requirements</h4>
                    <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-300">
                      {selectedJob.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setIsJobDetailOpen(false)
                      handleTailorResumeForJob(selectedJob)
                    }}
                    className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Tailor Resume in Prep App</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsJobDetailOpen(false)
                        handleOpenApply(selectedJob)
                      }}
                      className="rounded-full bg-sky-50 border border-sky-200 px-4 py-2 text-xs font-bold text-[#0A66C2] hover:bg-sky-100 cursor-pointer"
                    >
                      Easy Apply on ConnectIn
                    </button>

                    {selectedJob.applyUrl && (
                      <a
                        href={selectedJob.applyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-[#0A66C2] px-5 py-2 text-xs font-bold text-white hover:bg-[#004182] flex items-center gap-1.5 shadow-xs"
                      >
                        <span>Apply on Employer Site</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* POST NEW JOB MODAL */}
      <Dialog open={isPostJobOpen} onOpenChange={setIsPostJobOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-[#0A66C2]" />
              <span>Publish New Role on ConnectLn (Instant Global Sync)</span>
            </DialogTitle>
          </DialogHeader>

          {postJobSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Job Published &amp; Synced Live!
              </h4>
              <p className="text-xs text-zinc-500">
                Your opening is now live at the top of the ConnectLn Jobs feed and Home Feed.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePostJobSubmit} className="space-y-3.5 pt-2 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Electrician, Attending Surgeon, Staff AI Engineer"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Country / Region</label>
                  <select
                    value={newJobCountryCode}
                    onChange={(e) => {
                      const code = e.target.value
                      setNewJobCountryCode(code)
                      const cObj = COUNTRIES_CONFIG.find(c => c.code === code)
                      if (cObj) {
                        setNewJobLocation(`${cObj.hubs[1] || cObj.name} (${cObj.name})`)
                      }
                    }}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700"
                  >
                    {COUNTRIES_CONFIG.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Industry Enclave</label>
                  <select
                    value={newJobEnclave}
                    onChange={(e) => setNewJobEnclave(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700"
                  >
                    {PROFESSION_ENCLAVES.map(enc => (
                      <option key={enc.id} value={enc.id}>
                        {enc.icon} {enc.shortLabel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Company</label>
                  <input
                    type="text"
                    required
                    value={newJobCompany}
                    onChange={(e) => setNewJobCompany(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Salary Band</label>
                  <input
                    type="text"
                    required
                    value={newJobSalary}
                    onChange={(e) => setNewJobSalary(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Workplace Type</label>
                  <select
                    value={newJobWorkplaceType}
                    onChange={(e) => setNewJobWorkplaceType(e.target.value as any)}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700"
                  >
                    <option value="On-site">On-site / Field</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Employment Type</label>
                  <select
                    value={newJobEmploymentType}
                    onChange={(e) => setNewJobEmploymentType(e.target.value as any)}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract / Project</option>
                    <option value="Part-time">Part-time / Shift</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Location / City</label>
                  <input
                    type="text"
                    required
                    value={newJobLocation}
                    onChange={(e) => setNewJobLocation(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">External Apply URL</label>
                  <input
                    type="url"
                    placeholder="https://company.com/careers"
                    value={newJobApplyUrl}
                    onChange={(e) => setNewJobApplyUrl(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">
                  Required License / Credential / Tool Experience
                </label>
                <input
                  type="text"
                  value={newJobProductRequired}
                  onChange={(e) => setNewJobProductRequired(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">Job Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe responsibilities, required licenses/certifications, and team setup..."
                  value={newJobDescription}
                  onChange={(e) => setNewJobDescription(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsPostJobOpen(false)}
                  className="rounded-full px-4 py-1.5 font-bold text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#0A66C2] px-5 py-2 font-bold text-white hover:bg-[#004182] cursor-pointer"
                >
                  Publish &amp; Sync Immediately
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* EASY APPLY MODAL */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="max-w-lg">
          {selectedJob && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 text-xs text-[#0A66C2] font-semibold">
                  <Building className="h-3.5 w-3.5" />
                  <span>{selectedJob.company} ({selectedJob.countryName})</span>
                </div>
                <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Apply for {selectedJob.title}
                </DialogTitle>
              </DialogHeader>

              {applyStep === 'form' ? (
                <form onSubmit={handleSubmitApplication} className="space-y-4 pt-2">
                  <div className="rounded-lg bg-zinc-50 p-3 text-xs dark:bg-zinc-800/60 space-y-1">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Submitting as {currentUser?.name || "Verified Professional"}
                    </p>
                    <p className="text-zinc-500">
                      {currentUser?.headline || "Verified Professional"} | {(currentUser as any)?.email || "verified.member@expediteconsults.com"}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Resume Version
                    </label>
                    <div className="flex items-center justify-between rounded-lg border border-zinc-300 p-2.5 text-xs dark:border-zinc-700">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#0A66C2]" />
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {currentUser?.name ? `${currentUser.name.replace(/\s+/g, '_')}_Verified_Resume_2026.pdf` : 'Verified_Resume_2026.pdf'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsApplyModalOpen(false)
                          handleTailorResumeForJob(selectedJob)
                        }}
                        className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                      >
                        ✨ Tailor in Prep App
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    {selectedJob.applyUrl ? (
                      <a
                        href={selectedJob.applyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-[#0A66C2] hover:underline flex items-center gap-1"
                      >
                        <span>Or apply on {selectedJob.company} portal</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : <span />}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsApplyModalOpen(false)}
                        className="rounded-full px-4 py-1.5 text-xs font-bold text-zinc-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-full bg-[#0A66C2] px-5 py-1.5 text-xs font-bold text-white hover:bg-[#004182] flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Submit Application</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="py-6 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    Application Submitted!
                  </h4>
                  <p className="text-xs text-zinc-500">
                    Added to your Applications Pipeline. You can track progress under &ldquo;My Applications&rdquo;.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    {selectedJob.applyUrl && (
                      <a
                        href={selectedJob.applyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 flex items-center gap-1.5"
                      >
                        <span>Open Official Employer Portal</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => setIsApplyModalOpen(false)}
                      className="rounded-full bg-[#0A66C2] px-5 py-2 text-xs font-bold text-white hover:bg-[#004182] cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* CAREERTWIN INTERVIEW PREP MODAL */}
      {careerTwinJob && (
        <CareerTwinModal
          isOpen={isCareerTwinOpen}
          onClose={() => setIsCareerTwinOpen(false)}
          job={careerTwinJob}
        />
      )}
    </div>
  )
}
