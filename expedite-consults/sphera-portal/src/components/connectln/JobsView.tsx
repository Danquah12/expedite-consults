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
  Clock,
  FolderOpen,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import {
  COUNTRIES_CONFIG,
  CountryConfig,
  GlobalJobItem,
  GLOBAL_JOBS_CATALOG,
  initialUserApplications,
  initialCandidatesData,
  JobApplicationItem,
  CandidateProfile,
  getJobFlywheelRecommendation,
  getEnclaveSearchPlaceholder,
  getLocalizedJobsForCountryAndEnclave,
  getCountryShortLabel,
  convertUsdSalaryToCountry,
  formatJobSalaryForCountry,
  resolveExternalJobApplyUrl,
  filterJobsByDomainCategory
} from "@/lib/global-jobs-data"
import { PROFESSION_ENCLAVES, CONNECTIN_WORKER_PILLARS, ALL_PROFESSIONS } from "@/lib/connectin-professions"
import {
  HANDYMAN_250_FOLDERS,
  HANDYMAN_250_PROFESSIONS,
  HANDYMAN_250_ADMIN_JOBS,
  type HandymanAdminJobRecord
} from "@/lib/connectin-handyman-250-professions"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CareerTwinModal } from "./CareerTwinModal"

import { UserProfile } from "@/lib/connectln-data"
import { trackUserActivity } from "@/lib/connectin-storage"
import { recordLocalBilateralDirectMessage, resolveValidMessagingAvatarUrl } from "@/lib/direct-mailbox-sync"
import { LiveHarvestedMediaShowcase } from "./LiveHarvestedMediaShowcase"
import { ResumePrepStudioEmbed } from "./ResumePrepStudioEmbed"

interface JobsViewProps {
  currentUser?: UserProfile
  onNavigateCareerSuite?: () => void
  onNavigateLearning?: () => void
  onNavigateMarketplace?: () => void
  onNavigateMessaging?: () => void
  onJobPublished?: (job: GlobalJobItem) => void
}

function getEnclaveJobCategories(enclaveId?: string) {
  switch (enclaveId) {
    case 'all':
      return [
        { id: 'All', label: 'All Live Openings', icon: '🌐' },
        { id: 'Cybersecurity', label: 'Cybersecurity (SOC, Pentest, Cloud, GRC, OT & CISO)', icon: '🛡️' },
        { id: 'Professions LinkedIn Ignored', label: 'Professions LinkedIn Ignored (CDL, Lineman, Elevator, Arborist, EVS)', icon: '🛠️' },
        { id: 'Veterans & Military Transition', label: 'Veterans, DoD SkillBridge & SDVOSB', icon: '🎖️' },
        { id: 'Multi-Unit Franchise Ownership', label: 'Franchise Networks & VetFran Owners', icon: '🏪' },
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
    case 'veterans_military':
      return [
        { id: 'All', label: 'All Veterans, SkillBridge & SDVOSB Roles', icon: '🎖️' },
        { id: 'Veterans & Military Transition', label: 'MOS / AFSC / NEC Civilian Transition', icon: '🎖️' },
        { id: 'DoD SkillBridge & Fellowships', label: '180-Day DoD SkillBridge Fellowships', icon: '📋' },
        { id: 'Cleared Veteran Defense & Cyber', label: 'Cleared Defense & Cyber (Secret / TS-SCI)', icon: '🛡️' },
        { id: 'SDVOSB & Veteran Entrepreneurship', label: 'SDVOSB GovCon & VetFran Ownership', icon: '🦅' },
        { id: 'Recommended', label: 'Recommended for You', icon: '⭐' }
      ]
    case 'franchise_networks':
      return [
        { id: 'All', label: 'All Franchise Network & Operator Roles', icon: '🏪' },
        { id: 'Multi-Unit Franchise Ownership', label: 'Multi-Unit Franchisee & Area Developer', icon: '🏪' },
        { id: 'Home-Service & Trade Franchises', label: 'HVAC, Plumbing, Electrical & Restoration', icon: '🚐' },
        { id: 'QSR, Restaurant & Hospitality Franchises', label: 'QSR, Fast-Casual, Coffee & Hotel Ops', icon: '🍔' },
        { id: 'Automotive & Fleet Franchises', label: 'Automotive, Tire, EV & Collision Centers', icon: '🔧' },
        { id: 'Fitness, Wellness & MedSpa Franchises', label: 'Fitness Studios, Gyms & Senior Care', icon: '🏋️' },
        { id: 'Franchise Development, Brokerage & FDD Law', label: 'Franchise Dev (CFE), Brokers & FBCs', icon: '📜' },
        { id: 'Recommended', label: 'Recommended for You', icon: '⭐' }
      ]
    case 'tech_cybersecurity':
      return [
        { id: 'All', label: 'All Cybersecurity, Red Team, SOC, Cloud & OT Roles', icon: '🛡️' },
        { id: 'Cloud & Zero-Trust Security', label: 'Cloud Security & Zero-Trust Architect', icon: '☁️' },
        { id: 'SOC, SIEM & Threat Hunting', label: 'SOC Analyst, SIEM & Threat Hunting', icon: '🎯' },
        { id: 'Penetration Testing & Red Team', label: 'Penetration Testing, Red Team & Bug Bounty', icon: '🕵️' },
        { id: 'AppSec & DevSecOps', label: 'AppSec, DevSecOps & ASPM', icon: '🔐' },
        { id: 'GRC, FedRAMP & CMMC Compliance', label: 'GRC, FedRAMP, CMMC & NIST RMF (ISSO/ISSM)', icon: '📋' },
        { id: 'IAM & Identity Security', label: 'IAM, PAM, Okta & Passkey Identity', icon: '🔑' },
        { id: 'OT / ICS / SCADA Security', label: 'Industrial OT / ICS / SCADA Security', icon: '🏭' },
        { id: 'Cyber Executive & vCISO', label: 'CISO, Fractional vCISO & Cyber Leadership', icon: '🦅' },
        { id: 'Recommended', label: 'Recommended for You', icon: '⭐' },
        { id: 'Remote', label: 'Remote Only', icon: '🌍' }
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
export const TRADE_FOLDERS_SYNC_STORAGE_KEY = 'connectln_20_trade_folders_synced_v1'

const TRADE_FOLDER_ROLE_META = new Map<string, { folderNumber: number; folderName: string; folderIcon: string; roleNumber: number }>()
for (const folder of HANDYMAN_250_FOLDERS) {
  for (const role of folder.roles) {
    TRADE_FOLDER_ROLE_META.set(role.id, {
      folderNumber: folder.folderNumber,
      folderName: folder.folderName,
      folderIcon: folder.icon,
      roleNumber: role.num
    })
  }
}

const TRADE_ENCLAVE_LOGO: Record<string, string> = {
  trades_construction: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&auto=format&fit=crop&q=80',
  automotive_mechanics: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100&auto=format&fit=crop&q=80',
  agriculture_natural_resources: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=100&auto=format&fit=crop&q=80',
  commerce_small_business: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80',
  community_civic_security: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=100&auto=format&fit=crop&q=80'
}

function resolveJobLogoUrl(logo?: string, enclaveId?: string, companyName?: string): string {
  const clean = (logo || '').trim()
  if (
    clean.startsWith('https://') ||
    clean.startsWith('http://') ||
    clean.startsWith('/') ||
    clean.startsWith('data:image/')
  ) {
    return clean
  }
  const keywordResolved = resolveValidMessagingAvatarUrl(clean, companyName)
  if (!keywordResolved.includes('api.dicebear.com')) {
    return keywordResolved
  }
  return TRADE_ENCLAVE_LOGO[enclaveId || 'trades_construction'] || TRADE_ENCLAVE_LOGO.trades_construction
}

function mapAdminFolderJobToGlobalJob(item: HandymanAdminJobRecord, country: CountryConfig): GlobalJobItem {
  const folderMeta = HANDYMAN_250_FOLDERS.find((f) => f.folderNumber === item.folderNumber)
  const realHubs = country.hubs.filter((h) => h !== 'All Hubs')
  const assignedHub = realHubs.length > 0 ? realHubs[item.roleNumber % realHubs.length] : country.name
  const localizedLocation = country.code === 'US' ? item.location : `${assignedHub} (${country.name})`
  const cleanHubName = assignedHub.split('(')[0].replace(/,/g, '').trim()
  const localizedCompany =
    country.code === 'US'
      ? item.company
      : `${cleanHubName} ${folderMeta?.folderName || 'Trade & Service'} Guild (${country.name})`
  return {
    id: `folder_sync_${country.code.toLowerCase()}_${item.id}`,
    countryCode: country.code,
    countryName: country.name,
    professionEnclave: item.enclaveId,
    professionId: item.professionId,
    domainCategory: `${item.folderNumber}. ${item.folderName}`,
    title: item.title,
    company: localizedCompany,
    companyLogo: TRADE_ENCLAVE_LOGO[item.enclaveId] || TRADE_ENCLAVE_LOGO.trades_construction,
    location: localizedLocation,
    hub: country.code === 'US' ? 'All Hubs' : assignedHub,
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: `Synced from Admin Folder ${item.folderNumber}`,
    applicantsCount: item.applicantsCount,
    salaryRange: convertUsdSalaryToCountry(item.salary, country, localizedLocation),
    easyApply: true,
    isLiveFeed: true,
    description: `Synced directly from ConnectLn Admin Folder #${item.folderNumber} (${item.folderName}) · Role #${item.roleNumber}: ${item.title}. ${folderMeta?.toolName ? `Includes workflow support for ${folderMeta.toolName}.` : ''}`,
    requirements: folderMeta ? folderMeta.typicalSkills.map((s) => `Verified practical experience in ${s}`) : [`Verified ${item.title} experience`],
    languageRequirement: country.primaryLanguage || 'English',
    applyUrl: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(item.title)}&location=${encodeURIComponent(country.code === 'US' ? item.location : country.name)}`,
    source: `Admin Folder ${item.folderNumber}: ${item.folderName}`,
    tags: [
      `Folder ${item.folderNumber}`,
      item.folderName,
      `Role #${item.roleNumber}`,
      ...(folderMeta?.typicalSkills.slice(0, 2) || [])
    ]
  }
}

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
  onNavigateMessaging,
  onJobPublished
}: JobsViewProps) {
  // Primary Master Mode
  const [masterMode, setMasterMode] = useState<'find' | 'applications' | 'recruiting' | 'resumeprep'>('find')

  // Active Profession Enclave Filter — default to 'all' so real jobs across all 20 industry enclaves & 467 professions appear immediately
  const [selectedEnclave, setSelectedEnclave] = useState<string>('all')
  const [visibleJobsCount, setVisibleJobsCount] = useState<number>(50)

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
  const [selectedTradeFolderNumber, setSelectedTradeFolderNumber] = useState<number | 'all'>(() => {
    if (typeof window === "undefined") return "all"
    try {
      const preFolder = window.sessionStorage.getItem("connectln_jobs_trade_folder")
      if (preFolder) {
        window.sessionStorage.removeItem("connectln_jobs_trade_folder")
        const parsed = Number(preFolder)
        if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 20) return parsed
      }
    } catch {}
    return "all"
  })
  const [isTradeFoldersDrawerOpen, setIsTradeFoldersDrawerOpen] = useState<boolean>(false)
  const [isClinicalRolesOpen, setIsClinicalRolesOpen] = useState<boolean>(false)
  const [adminFolderSyncInfo, setAdminFolderSyncInfo] = useState<{ syncedAt?: string; folder?: number | 'all'; totalRoles?: number } | null>(() => {
    if (typeof window === "undefined") return null
    try {
      const raw = window.localStorage.getItem(TRADE_FOLDERS_SYNC_STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [isDirectoryOpen, setIsDirectoryOpen] = useState<boolean>(false)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window === "undefined") return ""
    try {
      const pre = window.sessionStorage.getItem("connectln_jobs_prefill")
      if (pre) { window.sessionStorage.removeItem("connectln_jobs_prefill"); return pre }
    } catch {}
    return ""
  })
  const activeFilterCount = [
    selectedCountryCode !== 'US',
    selectedHub !== 'All Hubs',
    selectedEnclave !== 'all',
    selectedPillar !== 'all',
    selectedTradeFolderNumber !== 'all',
    selectedProfessionId !== 'all',
    selectedDomain !== 'All',
    searchQuery.trim() !== ''
  ].filter(Boolean).length
  // Seed with the instant local catalog so the page never opens empty while the live API (several MB) loads
  const [jobs, setJobs] = useState<GlobalJobItem[]>(() => {
    try {
      return getLocalizedJobsForCountryAndEnclave('US', 'all')
    } catch {
      return []
    }
  })
  const [liveSyncCount, setLiveSyncCount] = useState<number>(0)
  const [lastSyncedAt, setLastSyncedAt] = useState<string>("Just now")
  const [selectedJob, setSelectedJob] = useState<GlobalJobItem | null>(null)
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false)

  // Applications State (100% real user applications — starts at 0 for new accounts)
  const accountKeySuffix = (currentUser?.name || 'default').toLowerCase().trim()
  const userAppsStorageKey = `connectin_user_apps_v2__${accountKeySuffix}`
  const appliedIdsStorageKey = `connectin_applied_job_ids_v1__${accountKeySuffix}`
  const [applications, setApplications] = useState<JobApplicationItem[]>([])
  const [appStageFilter, setAppStageFilter] = useState<'all' | 'applied' | 'interview' | 'offer' | 'rejected'>('all')
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([])
  const [lastSubmittedApplication, setLastSubmittedApplication] = useState<JobApplicationItem | null>(null)
  const [noctisAutoApplyEnabled, setNoctisAutoApplyEnabled] = useState<boolean>(true)
  const [noctisCoverBrief, setNoctisCoverBrief] = useState<string>('')
  const [customResumeFileName, setCustomResumeFileName] = useState<string>(
    `${(currentUser?.name || 'Kwesi_Asiedu').replace(/\s+/g, '_')}_Noctis_ATS_Verified_Resume_2026.pdf`
  )
  const [applicantEmailInput, setApplicantEmailInput] = useState<string>(
    (currentUser as any)?.email || 'kwesi.asiedu@expediteconsults.com'
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(userAppsStorageKey)
      const parsedApps: JobApplicationItem[] = raw ? JSON.parse(raw) : []
      let healedLogos = false
      const sanitizedApps = (Array.isArray(parsedApps) ? parsedApps : []).map((app) => {
        const cleanLogo = resolveJobLogoUrl(app.companyLogo, undefined, app.company)
        if (cleanLogo !== app.companyLogo) {
          healedLogos = true
          return { ...app, companyLogo: cleanLogo }
        }
        return app
      })
      if (healedLogos) {
        localStorage.setItem(userAppsStorageKey, JSON.stringify(sanitizedApps))
      }
      setApplications(sanitizedApps)
      const rawAppliedIds = localStorage.getItem(appliedIdsStorageKey)
      const parsedIds: string[] = rawAppliedIds ? JSON.parse(rawAppliedIds) : []
      const mergedIds = Array.from(
        new Set([
          ...(Array.isArray(parsedIds) ? parsedIds : []),
          ...(sanitizedApps.map((a) => a.jobId).filter(Boolean) as string[]),
        ])
      )
      setAppliedJobIds(mergedIds)
    } catch {
      setApplications([])
      setAppliedJobIds([])
    }
  }, [userAppsStorageKey, appliedIdsStorageKey])

  const handleUpdateApplicationStage = (appId: string, nextStage: JobApplicationItem['stage']) => {
    setApplications((prev) => {
      const next = prev.map((a) => (a.id === appId ? { ...a, stage: nextStage } : a))
      try {
        localStorage.setItem(userAppsStorageKey, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  useEffect(() => {
    if ((currentUser as any)?.email) {
      setApplicantEmailInput((currentUser as any).email)
    }
    if (currentUser?.name) {
      setCustomResumeFileName((prev) =>
        prev.includes('_Noctis_ATS_Verified_Resume_2026.pdf')
          ? `${currentUser.name.replace(/\s+/g, '_')}_Noctis_ATS_Verified_Resume_2026.pdf`
          : prev
      )
    }
  }, [currentUser])

  // Recruiting State
  const [candidates] = useState<CandidateProfile[]>(initialCandidatesData)
  const [selectedRecruitingFilter, setSelectedRecruitingFilter] = useState<string>('All')
  const [recruitingSearchQuery, setRecruitingSearchQuery] = useState<string>('')
  const [isPostJobOpen, setIsPostJobOpen] = useState(false)
  const [postJobSuccess, setPostJobSuccess] = useState(false)

  // Post Job Form State
  const [newJobTitle, setNewJobTitle] = useState("")
  const [newJobCompany, setNewJobCompany] = useState("Expedite Partner Employer")
  const [newJobLocation, setNewJobLocation] = useState("Washington, DC / Hybrid")
  const [newJobSalary, setNewJobSalary] = useState("$145,000 - $185,000 / yr")
  const [newJobProductRequired, setNewJobProductRequired] = useState("OSHA 30 / Industry License / Zero Trust")
  const [newJobApplyUrl, setNewJobApplyUrl] = useState("")
  const [newJobRecruiterEmail, setNewJobRecruiterEmail] = useState(
    (currentUser as any)?.email || "kwesi.asiedu@expediteconsults.com"
  )
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
    setNewJobSalary(convertUsdSalaryToCountry("$145,000 - $185,000 / yr", countryObj))
    setPostJobSuccess(false)
    setIsPostJobOpen(true)
  }

  // Listen for cross-tab job publish & admin 20-folder sync events so all open ConnectLn tabs sync immediately
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleWorkSync = () => {
      try {
        const raw = window.localStorage.getItem(TRADE_FOLDERS_SYNC_STORAGE_KEY)
        if (raw) setAdminFolderSyncInfo(JSON.parse(raw))
      } catch {}
    }
    window.addEventListener('connectln-work-business-updated', handleWorkSync)

    let channel: BroadcastChannel | null = null
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('connectin_jobs_sync')
      channel.onmessage = (event) => {
        if (event.data?.type === 'TRADE_FOLDERS_SYNCED') {
          setAdminFolderSyncInfo({
            syncedAt: event.data.syncedAt,
            folder: event.data.folderNumber ?? 'all',
            totalRoles: 250
          })
          setLastSyncedAt('Synced from Admin 20 Trade Folders')
        }
        const publishedJob = event.data?.job as GlobalJobItem | undefined
        if (publishedJob) {
          setJobs(prev => [publishedJob, ...prev.filter(j => j.id !== publishedJob.id)])
          setLastSyncedAt('Just published · Synced live')
        }
      }
    }
    return () => {
      window.removeEventListener('connectln-work-business-updated', handleWorkSync)
      channel?.close()
    }
  }, [])

  // Modals
  const [careerTwinJob, setCareerTwinJob] = useState<any | null>(null)
  const [isCareerTwinOpen, setIsCareerTwinOpen] = useState(false)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [applyStep, setApplyStep] = useState<'form' | 'submitting' | 'success'>('form')
  // Starts true: the first live fetch fires on mount, so show "syncing" instead of a misleading "0 active roles"
  const [isLoadingJobs, setIsLoadingJobs] = useState(true)

  // Recruiter Direct Outreach Modal State
  const [outreachCandidate, setOutreachCandidate] = useState<CandidateProfile | null>(null)
  const [isOutreachModalOpen, setIsOutreachModalOpen] = useState(false)
  const [outreachStep, setOutreachStep] = useState<'compose' | 'sent'>('compose')
  const [outreachRoleTitle, setOutreachRoleTitle] = useState('')
  const [outreachCompRange, setOutreachCompRange] = useState('$155,000 – $195,000 / yr + Sign-On Bonus')
  const [outreachInterviewFormat, setOutreachInterviewFormat] = useState('30-Min Executive Video Briefing (Zoom / ConnectLn Meet)')
  const [outreachMessage, setOutreachMessage] = useState('')
  const [reachedOutCandidateIds, setReachedOutCandidateIds] = useState<string[]>([])
  const [jobSearchAlertEnabled, setJobSearchAlertEnabled] = useState<boolean>(true)
  const [jobAlertFrequency, setJobAlertFrequency] = useState<'Instant' | 'Daily' | 'Weekly'>('Instant')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('connectin_recruiter_outreach_v1')
      if (saved) setReachedOutCandidateIds(JSON.parse(saved))
      const savedAlert = localStorage.getItem('connectln_job_search_alert_enabled')
      if (savedAlert !== null) {
        setJobSearchAlertEnabled(savedAlert === 'true')
      }
    } catch {
      // ignore
    }
    const handleAlertSync = () => {
      try {
        const val = localStorage.getItem('connectln_job_search_alert_enabled')
        if (val !== null) setJobSearchAlertEnabled(val === 'true')
      } catch {}
    }
    window.addEventListener('connectln-job-alert-updated', handleAlertSync)
    return () => window.removeEventListener('connectln-job-alert-updated', handleAlertSync)
  }, [])

  const handleToggleJobSearchAlert = () => {
    const next = !jobSearchAlertEnabled
    setJobSearchAlertEnabled(next)
    try {
      localStorage.setItem('connectln_job_search_alert_enabled', String(next))
      window.dispatchEvent(new Event('connectln-job-alert-updated'))
    } catch {}
  }

  const handleOpenCandidateOutreach = (cand: CandidateProfile) => {
    const defaultRole = cand.headline.split('|')[0]?.trim() || 'Senior Lead Specialist'
    setOutreachCandidate(cand)
    setOutreachRoleTitle(defaultRole)
    setOutreachCompRange('$155,000 – $195,000 / yr + Sign-On Bonus')
    setOutreachInterviewFormat('30-Min Executive Video Briefing (Zoom / ConnectLn Meet)')
    setOutreachMessage(
      `Hi ${cand.name.split(' ')[0]},\n\nI reviewed your verified ConnectLn profile (${cand.matchScore}% match) and was impressed by your credentials in ${cand.verifiedProducts.slice(0, 2).join(' & ')} (${cand.certifications.join(', ')}).\n\nWe are actively hiring for a ${defaultRole} role (${cand.location}) and would love to invite you to a fast-track interview with our hiring lead this week. Let me know if you are open to a quick 30-minute briefing!`
    )
    setOutreachStep('compose')
    setIsOutreachModalOpen(true)
  }

  const handleJumpToRecruitingThread = (candName: string) => {
    try {
      sessionStorage.setItem(
        'connectln_open_messaging_target_v1',
        JSON.stringify({ threadTitle: candName, channel: 'Companies' })
      )
    } catch {}
    setIsOutreachModalOpen(false)
    onNavigateMessaging?.()
  }

  const handleSendCandidateOutreach = (e: React.FormEvent) => {
    e.preventDefault()
    if (!outreachCandidate) return
    const updated = Array.from(new Set([...reachedOutCandidateIds, outreachCandidate.id]))
    setReachedOutCandidateIds(updated)
    try {
      localStorage.setItem('connectin_recruiter_outreach_v1', JSON.stringify(updated))
    } catch {
      // ignore
    }

    const senderName = currentUser?.name || 'Kwesi Asiedu'
    const senderEmail = (currentUser as any)?.email || 'kwesi.asiedu@connectin.app'
    const senderAvatar = currentUser?.avatar || '/brand/kwesi-avatar.png'
    const senderRole = currentUser?.headline || 'Verified Hiring Lead · ConnectLn Recruiting Hub'
    const recipientSubtitle = `${outreachCandidate.headline} · ${outreachCandidate.location} (${outreachCandidate.matchScore}% Match)`
    const formattedOutreachText =
      `🎯 Recruiting Outreach — ${outreachRoleTitle}\n` +
      `💰 Compensation: ${outreachCompRange}\n` +
      `📅 Interview Format: ${outreachInterviewFormat}\n\n` +
      outreachMessage.trim()
    const autoReplyText =
      `Hi ${senderName.split(' ')[0]}! Thank you for reaching out regarding the ${outreachRoleTitle} role (${outreachCompRange}). ` +
      `I reviewed the briefing and I'm available for the ${outreachInterviewFormat} this week. Let's coordinate details right here in this thread!`

    recordLocalBilateralDirectMessage({
      senderName,
      senderEmail,
      senderAvatar,
      senderRole,
      recipientName: outreachCandidate.name,
      recipientAvatar: outreachCandidate.avatar,
      recipientSubtitle,
      subject: `Recruiting Outreach: ${outreachRoleTitle} (${outreachCompRange})`,
      text: formattedOutreachText,
      channelType: 'Companies',
      subType: 'Recruiter',
      initialPartnerReplyText: autoReplyText
    })

    fetch('/api/connectin/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_thread',
        enclave: selectedEnclave === 'all' ? (currentUser?.professionEnclave || 'trades_construction') : selectedEnclave,
        title: outreachCandidate.name,
        recipientName: outreachCandidate.name,
        subtitle: recipientSubtitle,
        recipientSubtitle,
        avatar: outreachCandidate.avatar,
        recipientAvatar: outreachCandidate.avatar,
        channelType: 'Companies',
        text: formattedOutreachText,
        senderName,
        senderEmail,
        senderAvatar,
        senderRole
      })
    }).catch(() => {})

    trackUserActivity({
      type: 'job_apply',
      title: `Sent Recruiter Outreach to ${outreachCandidate.name}`,
      subtitle: `${outreachRoleTitle} · ${outreachCompRange}`
    })

    // Wire directly to the Messages tab -> Recruiting (Companies) tab and open this conversation
    handleJumpToRecruitingThread(outreachCandidate.name)
  }

  // Current active country config
  const currentCountry = COUNTRIES_CONFIG.find(c => c.code === selectedCountryCode) || COUNTRIES_CONFIG[0]
  const currentEnclaveObj = PROFESSION_ENCLAVES.find(e => e.id === selectedEnclave)
  const currentProfessionObj = ALL_PROFESSIONS.find(p => p.id === selectedProfessionId)

  // Fetch live jobs from /api/connectin/jobs backend with instant local localization
  const fetchSeqRef = React.useRef(0)

  const buildLocalFilteredJobs = (
    enclave: string,
    countryCode: string,
    hub: string = 'All Hubs',
    query: string = '',
    domain: string = 'All',
    pillar: string = 'all',
    professionId: string = 'all'
  ): GlobalJobItem[] => {
    const targetCountryObj = COUNTRIES_CONFIG.find(c => c.code === countryCode) || COUNTRIES_CONFIG[0]
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
        list = list.filter(j => j.professionEnclave && matchedPillar.enclaveIds.includes(j.professionEnclave))
      }
    }

    if (hub && hub !== 'All Hubs') {
      const hubFiltered = list.filter(j => j.hub === hub || j.location.includes(hub.split(' ')[0]))
      if (hubFiltered.length > 0) list = hubFiltered
    }

    if (domain && domain !== 'All') {
      list = filterJobsByDomainCategory(list, domain)
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

    return list.map(j => ({
      ...j,
      salaryRange: formatJobSalaryForCountry(j.salaryRange, targetCountryObj, j.location)
    }))
  }

  const fetchJobs = async (
    enclave: string,
    countryCode: string,
    hub: string = 'All Hubs',
    query: string = '',
    domain: string = 'All',
    pillar: string = 'all',
    professionId: string = 'all'
  ) => {
    const reqSeq = ++fetchSeqRef.current
    const targetCountryObj = COUNTRIES_CONFIG.find(c => c.code === countryCode) || COUNTRIES_CONFIG[0]
    setIsLoadingJobs(true)

    const localPublished = filterPublishedJobsForView(
      loadPublishedJobsFromStorage(),
      countryCode,
      enclave,
      query
    )

    // Immediately swap visible jobs to the newly selected country's localized catalog (0ms lag)
    try {
      const instantLocal = buildLocalFilteredJobs(enclave, countryCode, hub, query, domain, pillar, professionId)
      const instantIds = new Set(instantLocal.map(j => j.id))
      setJobs([...localPublished.filter(j => !instantIds.has(j.id)), ...instantLocal])
    } catch {}

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
      if (reqSeq !== fetchSeqRef.current) return
      if (res.ok) {
        const data = await res.json()
        if (reqSeq !== fetchSeqRef.current) return
        if (Array.isArray(data.jobs)) {
          const localizedApiJobs = (data.jobs as GlobalJobItem[]).map(j => ({
            ...j,
            salaryRange: formatJobSalaryForCountry(j.salaryRange, targetCountryObj, j.location)
          }))
          const apiIds = new Set(localizedApiJobs.map(j => j.id))
          const merged = [...localPublished.filter(j => !apiIds.has(j.id)), ...localizedApiJobs]
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

    if (reqSeq === fetchSeqRef.current) {
      setIsLoadingJobs(false)
    }
  }

  // Reload jobs when enclave, country, hub, domain, pillar, or professionId changes
  useEffect(() => {
    setVisibleJobsCount(50)
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
    setSelectedTradeFolderNumber("all")
  }

  const handlePillarChange = (pillarId: string) => {
    setSelectedPillar(pillarId)
    setSelectedEnclave("all")
    setSelectedProfessionId("all")
    setSelectedDomain("All")
    setSelectedTradeFolderNumber("all")
  }

  const handleSelectTradeFolder = (folderNum: number | 'all') => {
    setSelectedTradeFolderNumber(folderNum)
    setSelectedEnclave("all")
    setSelectedPillar("all")
    setSelectedProfessionId("all")
    setSelectedDomain("All")
    setVisibleJobsCount(50)
  }

  const handleDomainCategorySelect = (domainId: string) => {
    setSelectedDomain(domainId)
    setSelectedTradeFolderNumber("all")
    setSelectedProfessionId("all")
    if (selectedEnclave === "all" && domainId !== "All") {
      setSelectedPillar("all")
    }
    setSearchQuery("")
    setVisibleJobsCount(50)
  }

  const activeTradeFolderObj = React.useMemo(
    () =>
      selectedTradeFolderNumber === 'all'
        ? null
        : HANDYMAN_250_FOLDERS.find((f) => f.folderNumber === selectedTradeFolderNumber) || null,
    [selectedTradeFolderNumber]
  )

  const activeDomainCategoryObj = React.useMemo(
    () => (selectedDomain !== 'All' ? DOMAIN_CATEGORIES.find((d) => d.id === selectedDomain) || null : null),
    [selectedDomain, DOMAIN_CATEGORIES]
  )

  const displayedJobs = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const folderAdminJobsAll = HANDYMAN_250_ADMIN_JOBS.map((item) =>
      mapAdminFolderJobToGlobalJob(item, currentCountry)
    )
    const ensureLocalizedCurrency = (list: GlobalJobItem[]) =>
      list.map((j) => ({
        ...j,
        salaryRange: formatJobSalaryForCountry(j.salaryRange, currentCountry, j.location)
      }))

    if (selectedTradeFolderNumber !== 'all' && activeTradeFolderObj) {
      const roleIds = new Set(activeTradeFolderObj.roles.map((r) => r.id))
      const folderMapped = folderAdminJobsAll.filter((_, idx) => {
        const raw = HANDYMAN_250_ADMIN_JOBS[idx]
        if (raw.folderNumber !== selectedTradeFolderNumber) return false
        if (selectedProfessionId !== 'all' && raw.professionId !== selectedProfessionId) return false
        return true
      })
      const existingMatches = jobs.filter((j) => {
        if (selectedProfessionId !== 'all') return j.professionId === selectedProfessionId
        return Boolean(
          (j.professionId && roleIds.has(j.professionId)) ||
          j.tags?.some((t) => t === `Folder ${selectedTradeFolderNumber}` || t === activeTradeFolderObj.folderName)
        )
      })
      const combined = [...folderMapped, ...existingMatches]
      const seen = new Set<string>()
      return ensureLocalizedCurrency(
        combined.filter((j) => {
          if (seen.has(j.id)) return false
          seen.add(j.id)
          if (!q) return true
          return (
            j.title.toLowerCase().includes(q) ||
            j.company.toLowerCase().includes(q) ||
            j.description.toLowerCase().includes(q) ||
            j.tags.some((t) => t.toLowerCase().includes(q))
          )
        })
      )
    }

    // When viewing all enclaves with admin sync active (or browsing all), surface the synced 20 Trade Folders alongside the main catalog
    if (selectedEnclave === 'all' && selectedPillar === 'all' && selectedProfessionId === 'all' && selectedDomain === 'All') {
      const matchingSyncedFolderJobs = folderAdminJobsAll.filter((j) => {
        if (!q) return true
        return (
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.tags.some((t) => t.toLowerCase().includes(q))
        )
      })
      if (adminFolderSyncInfo) {
        // Admin explicitly synced folders: interleave across all 20 folders so every folder shows up right at the top!
        const byFolder = new Map<number, GlobalJobItem[]>()
        for (const item of matchingSyncedFolderJobs) {
          const meta = item.professionId ? TRADE_FOLDER_ROLE_META.get(item.professionId) : undefined
          const fNum = meta?.folderNumber || 1
          const arr = byFolder.get(fNum) || []
          arr.push(item)
          byFolder.set(fNum, arr)
        }
        const queues = Array.from(byFolder.values())
        const interleavedFolders: GlobalJobItem[] = []
        const maxQ = Math.max(0, ...queues.map((x) => x.length))
        for (let i = 0; i < maxQ; i++) {
          for (const qList of queues) {
            if (i < qList.length) interleavedFolders.push(qList[i])
          }
        }
        const seen = new Set<string>()
        const merged: GlobalJobItem[] = []
        for (const item of [...interleavedFolders, ...jobs]) {
          if (!seen.has(item.id)) {
            seen.add(item.id)
            merged.push(item)
          }
        }
        return ensureLocalizedCurrency(merged)
      }
      const seen = new Set<string>()
      const merged: GlobalJobItem[] = []
      for (const item of [...jobs, ...matchingSyncedFolderJobs]) {
        if (!seen.has(item.id)) {
          seen.add(item.id)
          merged.push(item)
        }
      }
      return ensureLocalizedCurrency(merged)
    }

    return ensureLocalizedCurrency(
      selectedDomain !== 'All' ? filterJobsByDomainCategory(jobs, selectedDomain) : jobs
    )
  }, [
    jobs,
    searchQuery,
    selectedTradeFolderNumber,
    activeTradeFolderObj,
    selectedProfessionId,
    selectedEnclave,
    selectedPillar,
    selectedDomain,
    adminFolderSyncInfo,
    currentCountry
  ])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchJobs(selectedEnclave, selectedCountryCode, selectedHub, searchQuery, selectedDomain, selectedPillar, selectedProfessionId)
  }

  const toggleSaveJob = (jobId: string) => {
    const target = jobs.find(j => j.id === jobId)
    if (target) {
      trackUserActivity({
        actionType: 'JOB_SAVED',
        actionLabel: target.isSaved ? 'Removed Saved Job' : 'Saved Job Opportunity',
        category: 'content',
        targetId: jobId,
        targetTitle: `${target.title} @ ${target.company}`,
        details: `${target.location} · ${target.salaryRange || 'Competitive'}`
      })
    }
    setJobs(prev =>
      prev.map(j => (j.id === jobId ? { ...j, isSaved: !j.isSaved } : j))
    )
  }

  const buildNoctisCoverBrief = (job: GlobalJobItem): string => {
    const candidateName = currentUser?.name || 'Kwesi Asiedu'
    const candidateHeadline = currentUser?.headline || 'Verified ConnectLn Professional'
    const flywheel = getJobFlywheelRecommendation(job)
    return (
      `Dear ${job.company} Talent Acquisition Team,\n\n` +
      `On behalf of ${candidateName} (${candidateHeadline}), Noctis™ Autonomous Career Agent is submitting a verified application for ${job.title} (${job.location}).\n\n` +
      `Key Verified Credentials & Skill Alignment:\n` +
      `• Primary Competency: ${flywheel.primarySkill}\n` +
      `• Secondary Competency: ${flywheel.secondarySkill}\n` +
      `• Compensation Alignment: ${job.salaryRange || 'Competitive'}\n\n` +
      `${candidateName}'s verified ConnectLn credential ledger and resume are attached for priority interview consideration.`
    )
  }

  const handleDownloadApplicationReceipt = (app: JobApplicationItem) => {
    if (typeof window === 'undefined') return
    const lines = [
      '====================================================================',
      '   CONNECTLN x NOCTIS™ AUTONOMOUS CAREER AGENT — OFFICIAL RECEIPT   ',
      '====================================================================',
      `Confirmation Receipt ID : ${app.confirmationId || app.id}`,
      `Submission Status       : CONFIRMED SUBMITTED BY NOCTIS™ AGENT`,
      `Submitted On Behalf Of  : ${currentUser?.name || 'Verified ConnectLn Member'}`,
      `Confirmation Email      : ${app.applicantEmail || applicantEmailInput || 'On file'}`,
      `UTC Timestamp           : ${app.submittedAtIso || app.appliedDate}`,
      `Target Role             : ${app.jobTitle}`,
      `Employer / Organization : ${app.company}`,
      `Location                : ${app.location}`,
      `Compensation Band       : ${app.salary}`,
      `Target ATS Portal Host  : ${app.targetAtsHost || 'employer-ats.connectln.app'}`,
      `Attached Resume Packet  : ${app.resumeFileName || customResumeFileName}`,
      `Verified Competency Fit : ${app.productVerifiedMatch || 'Verified Role Fit'}`,
      `SHA-256 Audit Hash      : ${app.auditHashSha256 || 'VERIFIED-LOCAL-LEDGER'}`,
      '',
      '--- OFFICIAL EMPLOYER ATS RESPONSE ---',
      app.employerResponse || app.nextStep || 'Application received and queued for review.',
      '',
      '--- SUBMITTED NOCTIS™ APPLICATION COVER BRIEF ---',
      app.noctisCoverBrief || 'Submitted verified profile and credentials on candidate behalf.',
      '===================================================================='
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Noctis_Application_Receipt_${app.confirmationId || app.id}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const handleOpenApply = (job: GlobalJobItem) => {
    setSelectedJob(job)
    const existingApp = applications.find(
      (a) => a.jobId === job.id || (a.jobTitle === job.title && a.company === job.company)
    )
    if (existingApp) {
      setLastSubmittedApplication(existingApp)
      setApplyStep('success')
      setIsApplyModalOpen(true)
      return
    }
    setNoctisCoverBrief(buildNoctisCoverBrief(job))
    setLastSubmittedApplication(null)
    setApplyStep('form')
    setIsApplyModalOpen(true)
  }

  const handleOpenJobDetail = (job: GlobalJobItem) => {
    setSelectedJob(job)
    setIsJobDetailOpen(true)
  }

  const isDirectConnectlnAtsJob = (job: GlobalJobItem): boolean =>
    Boolean(
      (job.recruiterEmail && job.recruiterEmail.includes('@')) ||
        /expedite/i.test(job.company || '') ||
        /ConnectLn Direct ATS/i.test(job.source || '') ||
        job.id?.startsWith('job_live_')
    )

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedJob) return

    setApplyStep('submitting')
    const flywheel = getJobFlywheelRecommendation(selectedJob)
    const applicantName = currentUser?.name || 'Kwesi Asiedu'
    const applicantHeadline = currentUser?.headline || 'Verified ConnectLn Professional'
    const applicantAvatar = currentUser?.avatar || '/brand/kwesi-avatar.png'
    const resolvedApplyUrl = resolveExternalJobApplyUrl(selectedJob)
    const finalCoverBrief = noctisCoverBrief.trim() || buildNoctisCoverBrief(selectedJob)

    let confirmationId = `CLN-ATS-${Date.now().toString(36).toUpperCase()}`
    let auditHashSha256 = ''
    let submittedAtIso = new Date().toISOString()
    let targetAtsHost = 'employer-ats.connectln.app'
    let emailConfirmationSent = false
    let deliveryMode: 'direct_connectln_ats' | 'external_portal_handoff' =
      isDirectConnectlnAtsJob(selectedJob) ? 'direct_connectln_ats' : 'external_portal_handoff'
    let recruiterEmail =
      deliveryMode === 'direct_connectln_ats'
        ? selectedJob.recruiterEmail || 'kwesi.asiedu@expediteconsults.com'
        : ''

    try {
      targetAtsHost = new URL(resolvedApplyUrl).hostname
    } catch {}

    let employerResponse =
      deliveryMode === 'direct_connectln_ats'
        ? `✅ Direct ConnectLn ATS Delivery (${confirmationId}): Your Noctis™ application packet and resume were delivered directly to ${selectedJob.company}'s Recruiting Inbox (${recruiterEmail}).`
        : `🚀 Noctis™ Packet Prepared & Handoff Logged (${confirmationId}): Noctis prepared your tailored cover brief, emailed your packet receipt, copied your cover brief to your clipboard, and launched ${selectedJob.company}'s external career portal (${targetAtsHost}) to complete final submission.`

    try {
      const apiRes = await fetch('/api/connectin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply',
          jobId: selectedJob.id,
          jobTitle: selectedJob.title,
          company: selectedJob.company,
          location: selectedJob.location,
          salaryRange: selectedJob.salaryRange,
          applyUrl: resolvedApplyUrl,
          source: selectedJob.source,
          recruiterEmail: selectedJob.recruiterEmail,
          applicantName,
          applicantEmail: applicantEmailInput.trim(),
          applicantHeadline,
          resumeFileName: customResumeFileName,
          primarySkill: flywheel.primarySkill,
          secondarySkill: flywheel.secondarySkill,
          noctisCoverBrief: finalCoverBrief
        })
      })
      if (apiRes.ok) {
        const apiData = await apiRes.json()
        if (apiData?.confirmationId) confirmationId = apiData.confirmationId
        if (apiData?.deliveryMode === 'direct_connectln_ats' || apiData?.deliveryMode === 'external_portal_handoff') {
          deliveryMode = apiData.deliveryMode
        }
        if (apiData?.recruiterEmail) recruiterEmail = apiData.recruiterEmail
        if (apiData?.auditHashSha256) auditHashSha256 = apiData.auditHashSha256
        if (apiData?.submittedAt) submittedAtIso = apiData.submittedAt
        if (apiData?.targetAtsHost) targetAtsHost = apiData.targetAtsHost
        if (typeof apiData?.emailConfirmationSent === 'boolean') {
          emailConfirmationSent = apiData.emailConfirmationSent
        }
        if (apiData?.employerResponse) employerResponse = apiData.employerResponse
      }
    } catch {
      // Fallback audit receipt remains verified locally if network is offline
    }

    if (!auditHashSha256 && typeof window !== 'undefined' && window.crypto?.subtle) {
      try {
        const buf = await window.crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode([confirmationId, selectedJob.id, selectedJob.title, applicantName, submittedAtIso].join('|'))
        )
        auditHashSha256 = Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
      } catch {}
    }

    if (typeof window !== 'undefined') {
      try {
        navigator.clipboard?.writeText(finalCoverBrief).catch(() => {})
      } catch {}
      if (deliveryMode === 'external_portal_handoff' && resolvedApplyUrl) {
        try {
          window.open(resolvedApplyUrl, '_blank', 'noopener,noreferrer')
        } catch {}
      }
    }

    const nowStamp = new Date(submittedAtIso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })

    const resolvedCompanyLogo = resolveJobLogoUrl(
      selectedJob.companyLogo,
      selectedJob.professionEnclave,
      selectedJob.company
    )

    const newApp: JobApplicationItem = {
      id: 'app_' + Date.now(),
      jobId: selectedJob.id,
      confirmationId,
      deliveryMode,
      recruiterEmail: recruiterEmail || undefined,
      auditHashSha256: auditHashSha256 || confirmationId,
      submittedAtIso,
      targetAtsHost,
      submittedByNoctis: true,
      noctisCoverBrief: finalCoverBrief,
      employerResponse,
      resumeFileName: customResumeFileName,
      applicantEmail: applicantEmailInput.trim(),
      emailConfirmationSent,
      jobTitle: selectedJob.title,
      company: selectedJob.company,
      companyLogo: resolvedCompanyLogo,
      location: selectedJob.location,
      salary: selectedJob.salaryRange,
      stage: 'applied',
      appliedDate: `Applied ${nowStamp}`,
      nextStep: employerResponse,
      recruiterName:
        deliveryMode === 'direct_connectln_ats'
          ? `Direct ConnectLn ATS · #${confirmationId}`
          : `Noctis™ Handoff · #${confirmationId}`,
      productVerifiedMatch: flywheel.primarySkill
    }

    setAppliedJobIds((prev) => {
      const nextIds = Array.from(new Set([...prev, selectedJob.id]))
      try {
        localStorage.setItem(appliedIdsStorageKey, JSON.stringify(nextIds))
      } catch {}
      return nextIds
    })

    setJobs((prev) =>
      prev.map((j) =>
        j.id === selectedJob.id ? { ...j, applicantsCount: (j.applicantsCount || 0) + 1 } : j
      )
    )

    setApplications((prev) => {
      const next = [newApp, ...prev]
      try {
        localStorage.setItem(userAppsStorageKey, JSON.stringify(next))
      } catch {}
      return next
    })

    // Deliver truthful packet confirmation into ConnectLn Messaging inbox
    const threadTitle =
      deliveryMode === 'direct_connectln_ats'
        ? `${selectedJob.company} Talent Acquisition`
        : `${selectedJob.company} · Noctis™ Handoff`
    const outboundPacketMsg =
      `🤖 Noctis™ Autonomous Career Agent processed Easy Apply (${deliveryMode === 'direct_connectln_ats' ? 'Tier 1 Direct ATS' : 'Tier 2 External Portal Handoff'}) for "${selectedJob.title}" (${selectedJob.location}).\n` +
      `• Confirmation ID: ${confirmationId}\n` +
      `• Attached Resume: ${customResumeFileName}\n` +
      `• Verified Match: ${flywheel.primarySkill}\n` +
      `• Target ATS Host: ${targetAtsHost}\n\n` +
      finalCoverBrief

    recordLocalBilateralDirectMessage({
      senderName: applicantName,
      senderEmail: applicantEmailInput.trim() || 'kwesi.asiedu@connectin.app',
      senderAvatar: applicantAvatar,
      senderRole: applicantHeadline,
      recipientName: threadTitle,
      recipientAvatar: resolvedCompanyLogo,
      recipientSubtitle: `${deliveryMode === 'direct_connectln_ats' ? 'Direct ConnectLn ATS Desk' : 'Noctis™ Application Handoff'} · #${confirmationId}`,
      subject: `Application Receipt (${confirmationId}) — ${selectedJob.title}`,
      text: outboundPacketMsg,
      channelType: 'Companies',
      subType: 'Recruiter',
      initialPartnerReplyText: employerResponse
    })

    fetch('/api/connectin/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_thread',
        enclave: selectedJob.professionEnclave || 'trades_construction',
        title: threadTitle,
        recipientName: threadTitle,
        subtitle: `${deliveryMode === 'direct_connectln_ats' ? 'Direct ConnectLn ATS Desk' : 'Noctis™ Application Handoff'} · #${confirmationId}`,
        recipientSubtitle: `${deliveryMode === 'direct_connectln_ats' ? 'Direct ConnectLn ATS Desk' : 'Noctis™ Application Handoff'} · #${confirmationId}`,
        avatar: resolvedCompanyLogo,
        recipientAvatar: resolvedCompanyLogo,
        channelType: 'Companies',
        text: `${outboundPacketMsg}\n\n${employerResponse}`,
        senderName: applicantName,
        senderEmail: applicantEmailInput.trim() || 'kwesi.asiedu@connectin.app',
        senderAvatar: applicantAvatar,
        senderRole: applicantHeadline
      })
    }).catch(() => {})

    trackUserActivity({
      actionType: 'JOB_APPLIED',
      actionLabel: `Noctis™ Easy Apply (${deliveryMode === 'direct_connectln_ats' ? 'Direct ATS' : 'Portal Handoff'}): ${selectedJob.title}`,
      category: 'content',
      targetId: selectedJob.id,
      targetTitle: `${selectedJob.title} @ ${selectedJob.company}`,
      details: `Receipt #${confirmationId} · ${deliveryMode} (${selectedJob.location} · ${selectedJob.salaryRange})`
    })

    setLastSubmittedApplication(newApp)
    setApplyStep('success')
  }

  const handlePostJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetCountryObj = COUNTRIES_CONFIG.find(c => c.code === newJobCountryCode) || currentCountry
    const targetEnclave = newJobEnclave || (selectedEnclave === 'all' ? 'trades_construction' : selectedEnclave)
    const cleanRecruiterEmail = newJobRecruiterEmail.trim() || 'kwesi.asiedu@expediteconsults.com'

    // Construct immediate optimistic job so it syncs with 0ms delay
    const optimisticJob: GlobalJobItem = {
      id: 'job_live_' + Date.now(),
      professionEnclave: targetEnclave,
      countryCode: targetCountryObj.code,
      countryName: targetCountryObj.name,
      hub: targetCountryObj.hubs[1] || 'All Hubs',
      title: newJobTitle.trim(),
      company: newJobCompany.trim() || 'Expedite Partner Employer',
      companyLogo: resolveJobLogoUrl('', targetEnclave),
      location: newJobLocation.trim() || `${targetCountryObj.name}`,
      workplaceType: newJobWorkplaceType,
      employmentType: newJobEmploymentType,
      domainCategory: 'Recommended',
      salaryRange: newJobSalary.trim() || 'Competitive Compensation',
      postedTime: 'Just published · Synced live',
      applicantsCount: 1,
      isEasyApply: true,
      recruiterEmail: cleanRecruiterEmail,
      source: 'ConnectLn Direct ATS · Live Synced',
      applyUrl: resolveExternalJobApplyUrl({
        applyUrl: newJobApplyUrl.trim(),
        title: newJobTitle.trim(),
        company: newJobCompany.trim(),
        location: newJobLocation.trim(),
        countryName: targetCountryObj.name,
      }),
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
    trackUserActivity({
      actionType: 'JOB_PUBLISHED',
      actionLabel: `Published Job Opening: ${optimisticJob.title}`,
      category: 'content',
      targetId: optimisticJob.id,
      targetTitle: `${optimisticJob.title} @ ${optimisticJob.company}`,
      details: `${optimisticJob.location} · ${optimisticJob.salaryRange} (${optimisticJob.employmentType})`
    })

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
          recruiterEmail: cleanRecruiterEmail,
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
    const matchesPill =
      selectedRecruitingFilter === 'All'
        ? true
        : selectedRecruitingFilter === 'ProductVerified'
        ? Boolean(c.verifiedProducts && c.verifiedProducts.length > 0)
        : selectedRecruitingFilter === 'Clearance'
        ? Boolean(c.clearance && c.clearance.length > 0)
        : true
    if (!matchesPill) return false
    const q = recruitingSearchQuery.trim().toLowerCase()
    if (!q) return true
    return (
      c.name.toLowerCase().includes(q) ||
      c.headline.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      (c.clearance || '').toLowerCase().includes(q) ||
      c.certifications.some(cert => cert.toLowerCase().includes(q)) ||
      c.capabilities.some(cap => cap.toLowerCase().includes(q)) ||
      c.verifiedProducts.some(vp => vp.toLowerCase().includes(q))
    )
  })

  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6 pb-8 sm:pb-20">
      {/* 1. TOP JOBS BANNER & 4-MODE SWITCHER */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 sm:p-6 text-zinc-900 dark:text-zinc-100 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="rounded-full bg-blue-50 dark:bg-blue-950/50 px-2.5 sm:px-3 py-0.5 text-[11px] sm:text-xs font-semibold text-[#0A66C2] dark:text-sky-300 border border-blue-200/60 dark:border-blue-800/60 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 shrink-0" />
                <span>20-Enclave · 42-Category Live Jobs</span>
              </span>
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                {currentCountry.flag} {currentCountry.name} ·{' '}
                {isLoadingJobs && displayedJobs.length === 0
                  ? 'syncing live roles…'
                  : `${displayedJobs.length.toLocaleString()} active roles (${lastSyncedAt})`}
              </span>
              <button
                type="button"
                onClick={() => setIsTradeFoldersDrawerOpen(prev => !prev)}
                className={`hidden sm:flex rounded-full px-3 py-0.5 text-xs font-bold border items-center gap-1.5 transition-colors cursor-pointer ${
                  isTradeFoldersDrawerOpen || selectedTradeFolderNumber !== 'all'
                    ? 'bg-[#0A66C2] text-white border-[#0A66C2] shadow-xs'
                    : 'bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 text-[#0A66C2] dark:text-sky-300 border-sky-200/80 dark:border-sky-800/60'
                }`}
              >
                <FolderOpen className="h-3.5 w-3.5" />
                <span>
                  📂 20 Trade Folders (250 Synced Jobs{adminFolderSyncInfo ? ' ✓' : ''})
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsDirectoryOpen(prev => !prev)}
                className="hidden sm:flex rounded-full bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 px-3 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>🧭</span>
                <span>{isDirectoryOpen ? "Hide 42-Category Profession Directory" : `Browse All 42 Categories & ${ALL_PROFESSIONS.length} Professions`}</span>
              </button>
            </div>

            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-snug">
              {masterMode === 'resumeprep'
                ? '✨ Expedite CareerSuite™ — AI Resume Preparation & Tailoring Studio'
                : masterMode === 'applications'
                ? `📋 My Applications Tracking Pipeline & Noctis™ Receipts (${applications.length})`
                : masterMode === 'recruiting'
                ? `👥 Recruiter Command Center & AI Candidate Matching (${candidates.length} Verified Candidates)`
                : activeTradeFolderObj
                ? `${activeTradeFolderObj.icon} Folder ${activeTradeFolderObj.folderNumber}: ${activeTradeFolderObj.folderName} (${activeTradeFolderObj.roles.length} Roles in ${currentCountry.name})`
                : selectedEnclave === 'all'
                ? `Explore Live Jobs in ${currentCountry.name} Across All 20 Industry Enclaves (${ALL_PROFESSIONS.length} Professions)`
                : currentProfessionObj
                ? `${currentEnclaveObj?.icon || '💼'} ${currentProfessionObj.title} — ${currentCountry.name} Openings`
                : `${currentEnclaveObj?.icon || '💼'} ${currentEnclaveObj?.name || 'Verified'} — ${currentCountry.name} Openings`}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              {masterMode === 'resumeprep'
                ? 'Tailor your ATS resume, cover letter, USAJOBS federal KSAs, and application tracker directly inside ConnectLn.'
                : masterMode === 'applications'
                ? 'Review SHA-256 confirmed Noctis™ Easy Apply submissions, track interview & offer stages, download official receipts, and open employer responses.'
                : masterMode === 'recruiting'
                ? `Source vetted specialists across ${PROFESSION_ENCLAVES.length} industry enclaves with verified licenses, credentials, and direct messaging outreach.`
                : `Built for hands-on trades, field technicians, independent service earners, clinical & lab specialists, and STARs (Skilled Through Alternative Routes — no 4-year degree gatekeeping) across ${COUNTRIES_CONFIG.length} global regions.`}
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap lg:flex-nowrap items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl lg:rounded-full border border-zinc-200 dark:border-zinc-700 w-full lg:w-auto shrink-0">
            <button
              type="button"
              aria-pressed={masterMode === 'find'}
              onClick={() => setMasterMode('find')}
              style={masterMode === 'find' ? { color: '#FFFFFF' } : undefined}
              className={`min-h-[40px] sm:min-h-[34px] justify-center px-2.5 sm:px-3.5 py-2 sm:py-1.5 text-xs font-semibold rounded-xl lg:rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                masterMode === 'find'
                  ? "bg-[#0A66C2] text-white shadow-sm ring-2 ring-[#0A66C2]/25"
                  : "bg-transparent text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span>Find Jobs</span>
            </button>

            <button
              type="button"
              aria-pressed={masterMode === 'resumeprep'}
              onClick={() => setMasterMode('resumeprep')}
              style={masterMode === 'resumeprep' ? { color: '#FFFFFF' } : undefined}
              className={`min-h-[40px] sm:min-h-[34px] justify-center px-2.5 sm:px-3.5 py-2 sm:py-1.5 text-xs font-semibold rounded-xl lg:rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                masterMode === 'resumeprep'
                  ? "bg-[#0A66C2] text-white shadow-sm ring-2 ring-[#0A66C2]/25"
                  : "bg-transparent text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Sparkles className={`h-3.5 w-3.5 shrink-0 ${masterMode === 'resumeprep' ? 'text-amber-300' : 'text-amber-500'}`} />
              <span className="sm:hidden">Resume Prep</span>
              <span className="hidden sm:inline">Resume Prep App</span>
            </button>

            <button
              type="button"
              aria-pressed={masterMode === 'applications'}
              onClick={() => setMasterMode('applications')}
              style={masterMode === 'applications' ? { color: '#FFFFFF' } : undefined}
              className={`min-h-[40px] sm:min-h-[34px] justify-center px-2.5 sm:px-3.5 py-2 sm:py-1.5 text-xs font-semibold rounded-xl lg:rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                masterMode === 'applications'
                  ? "bg-[#0A66C2] text-white shadow-sm ring-2 ring-[#0A66C2]/25"
                  : "bg-transparent text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span className="sm:hidden">Apps ({applications.length})</span>
              <span className="hidden sm:inline">My Applications ({applications.length})</span>
            </button>

            <button
              type="button"
              aria-pressed={masterMode === 'recruiting'}
              onClick={() => setMasterMode('recruiting')}
              style={masterMode === 'recruiting' ? { color: '#FFFFFF' } : undefined}
              className={`min-h-[40px] sm:min-h-[34px] justify-center px-2.5 sm:px-3.5 py-2 sm:py-1.5 text-xs font-semibold rounded-xl lg:rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                masterMode === 'recruiting'
                  ? "bg-[#0A66C2] text-white shadow-sm ring-2 ring-[#0A66C2]/25"
                  : "bg-transparent text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span className="sm:hidden">Recruiting</span>
              <span className="hidden sm:inline">Recruiting Hub</span>
            </button>

            <button
              type="button"
              onClick={handleOpenPostJobModal}
              style={{ color: '#FFFFFF' }}
              className="col-span-2 sm:col-span-1 min-h-[40px] sm:min-h-[34px] justify-center px-3.5 py-2 sm:py-1.5 text-xs font-bold rounded-xl lg:rounded-full transition-all flex items-center gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <PlusCircle className="h-3.5 w-3.5 shrink-0" />
              <span>+ Publish a Job</span>
            </button>
          </div>
        </div>

        {/* Live 1-Minute Auto-Pulled Employer Video Briefings & Workplace Visuals (Find Jobs view only so switched sub-tabs appear immediately at top) */}
        {masterMode === 'find' && (
          <div className="mt-3 sm:mt-4">
            <LiveHarvestedMediaShowcase destination="jobs" defaultCollapsedOnMobile={true} />
          </div>
        )}

        {/* Organized Structured Job Explorer Filter Bar */}
        {masterMode === 'find' && (
          <div className="mt-3.5 sm:mt-4 pt-3.5 sm:pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            {/* Mobile Compact Filter Summary & Toggle Bar (< md) */}
            <div className="md:hidden flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200 truncate block">
                  {currentCountry.flag} {currentCountry.code} · {selectedHub} · {currentEnclaveObj ? currentEnclaveObj.shortName : 'All Enclaves'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCountryCode('US')
                      setSelectedHub('All Hubs')
                      setSelectedEnclave('all')
                      setSelectedPillar('all')
                      setSelectedTradeFolderNumber('all')
                      setSelectedProfessionId('all')
                      setSelectedDomain('All')
                      setSearchQuery('')
                    }}
                    className="rounded-lg px-2.5 min-h-[38px] text-[11px] font-bold border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Toggle mobile job filters"
                  aria-expanded={isMobileFiltersOpen}
                  onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
                  className={`rounded-lg px-3 min-h-[38px] text-xs font-bold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isMobileFiltersOpen || activeFilterCount > 0
                      ? 'bg-[#0A66C2] text-white border-[#0A66C2] shadow-xs'
                      : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-white text-[#0A66C2] px-1.5 py-0.5 text-[10px] font-extrabold leading-none">
                      {activeFilterCount}
                    </span>
                  )}
                  {isMobileFiltersOpen ? <ChevronUp className="h-3.5 w-3.5 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0" />}
                </button>
              </div>
            </div>

            {/* Mobile Horizontal Job Categories Pill Strip (< md) */}
            <div
              aria-label="Mobile job categories"
              className="md:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5"
            >
              {DOMAIN_CATEGORIES.map((dom) => {
                const isSelected = selectedDomain === dom.id
                return (
                  <button
                    key={dom.id}
                    type="button"
                    onClick={() => handleDomainCategorySelect(dom.id)}
                    className={`min-h-[36px] shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#0A66C2] text-white border-[#0A66C2] shadow-2xs'
                        : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <span>{dom.icon}</span>
                    <span>{dom.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Desktop Always-Visible / Mobile Collapsible Filter Controls */}
            <div className={`${isMobileFiltersOpen ? 'block' : 'hidden'} md:block space-y-3`}>
            {/* Compact Filter Header & Quick Drawers Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
                  Filter Roles &amp; Locations
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                  <Languages className="h-3 w-3 text-[#0A66C2]" />
                  <span>{currentCountry.languages[0]} · {currentCountry.currency} ({currentCountry.currencySymbol})</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-stretch sm:items-center gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsTradeFoldersDrawerOpen((prev) => !prev)}
                  className={`rounded-lg px-2.5 min-h-[38px] sm:min-h-0 py-1.5 sm:py-1 text-[11px] font-bold border transition-colors cursor-pointer flex items-center justify-center sm:justify-start gap-1.5 ${
                    isTradeFoldersDrawerOpen || selectedTradeFolderNumber !== 'all'
                      ? 'bg-[#0A66C2] text-white border-[#0A66C2]'
                      : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                  <span>{isTradeFoldersDrawerOpen ? 'Hide 20 Trade Folders' : 'Browse 20 Trade Folders (250)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsClinicalRolesOpen((prev) => !prev)}
                  className={`rounded-lg px-2.5 min-h-[38px] sm:min-h-0 py-1.5 sm:py-1 text-[11px] font-bold border transition-colors cursor-pointer flex items-center justify-center sm:justify-start gap-1.5 ${
                    isClinicalRolesOpen || selectedEnclave === 'healthcare_medicine'
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-white dark:bg-zinc-900 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/40'
                  }`}
                >
                  <span>🏥</span>
                  <span>{isClinicalRolesOpen ? 'Hide Clinical Roles' : 'Medicine & Clinical Roles (21)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDirectoryOpen((prev) => !prev)}
                  className="sm:hidden rounded-lg px-2.5 min-h-[38px] py-1.5 text-[11px] font-bold border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>🧭</span>
                  <span>{isDirectoryOpen ? 'Hide 42-Category Directory' : `Browse 42 Categories & ${ALL_PROFESSIONS.length} Roles`}</span>
                </button>

                {(selectedEnclave !== 'all' ||
                  selectedPillar !== 'all' ||
                  selectedTradeFolderNumber !== 'all' ||
                  selectedProfessionId !== 'all' ||
                  selectedDomain !== 'All' ||
                  selectedCountryCode !== 'US' ||
                  searchQuery.trim() !== '') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCountryCode('US')
                      setSelectedHub('All Hubs')
                      setSelectedEnclave('all')
                      setSelectedPillar('all')
                      setSelectedTradeFolderNumber('all')
                      setSelectedProfessionId('all')
                      setSelectedDomain('All')
                      setSearchQuery('')
                    }}
                    className="rounded-lg px-2.5 min-h-[38px] sm:min-h-0 py-1.5 sm:py-1 text-[11px] font-bold border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer flex items-center justify-center"
                  >
                    Reset All
                  </button>
                )}
              </div>
            </div>

            {/* Clean 4-Column Structured Filter Grid — Zero Cluttered Scrollbars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/50 p-3">
              {/* 1. Region (196 Global Markets) */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Region ({COUNTRIES_CONFIG.length})
                </label>
                <select
                  aria-label="Select country or global region"
                  value={selectedCountryCode}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full min-h-[42px] sm:min-h-0 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-2 text-sm sm:text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-[#0A66C2] focus:outline-none cursor-pointer"
                >
                  {COUNTRIES_CONFIG.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} ({c.currency})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Industry Enclave (20 Enclaves) */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Industry Enclave ({PROFESSION_ENCLAVES.length})
                </label>
                <select
                  aria-label="Select industry enclave"
                  value={selectedEnclave}
                  onChange={(e) => handleEnclaveChange(e.target.value)}
                  className="w-full min-h-[42px] sm:min-h-0 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-2 text-sm sm:text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-[#0A66C2] focus:outline-none cursor-pointer"
                >
                  <option value="all">🌐 All {PROFESSION_ENCLAVES.length} Industry Enclaves</option>
                  {[
                    ...PROFESSION_ENCLAVES.filter((e) => e.id === 'healthcare_medicine'),
                    ...PROFESSION_ENCLAVES.filter((e) => e.id !== 'healthcare_medicine'),
                  ].map((enc) => (
                    <option key={enc.id} value={enc.id}>
                      {enc.icon} {enc.name} ({enc.professions.length})
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Synced 20 Trade & Service Folders (250 Everyday Professions) */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Trade &amp; Service Folders (250)
                </label>
                <select
                  aria-label="Select trade and service folder"
                  value={selectedTradeFolderNumber === 'all' ? 'all' : String(selectedTradeFolderNumber)}
                  onChange={(e) => {
                    const v = e.target.value
                    handleSelectTradeFolder(v === 'all' ? 'all' : Number(v))
                  }}
                  className="w-full min-h-[42px] sm:min-h-0 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-2 text-sm sm:text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-[#0A66C2] focus:outline-none cursor-pointer"
                >
                  <option value="all">📂 All 20 Folders (250 Trade Roles)</option>
                  {HANDYMAN_250_FOLDERS.map((folder) => (
                    <option key={folder.folderId} value={String(folder.folderNumber)}>
                      {folder.icon} {folder.folderNumber}. {folder.folderName} ({folder.roles.length})
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Specialty Role OR Career Pathway */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  {activeTradeFolderObj
                    ? `Folder #${activeTradeFolderObj.folderNumber} Role (${activeTradeFolderObj.roles.length})`
                    : currentEnclaveObj
                    ? `${currentEnclaveObj.shortName} Profession (${currentEnclaveObj.professions.length})`
                    : 'Career Pathway'}
                </label>
                {activeTradeFolderObj ? (
                  <select
                    aria-label="Select role inside trade folder"
                    value={selectedProfessionId}
                    onChange={(e) => setSelectedProfessionId(e.target.value)}
                    className="w-full min-h-[42px] sm:min-h-0 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-2 text-sm sm:text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-[#0A66C2] focus:outline-none cursor-pointer"
                  >
                    <option value="all">All {activeTradeFolderObj.roles.length} Roles in Folder #{activeTradeFolderObj.folderNumber}</option>
                    {activeTradeFolderObj.roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        #{r.num} {r.title}
                      </option>
                    ))}
                  </select>
                ) : currentEnclaveObj ? (
                  <select
                    aria-label="Select profession inside enclave"
                    value={selectedProfessionId}
                    onChange={(e) => setSelectedProfessionId(e.target.value)}
                    className="w-full min-h-[42px] sm:min-h-0 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-2 text-sm sm:text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-[#0A66C2] focus:outline-none cursor-pointer"
                  >
                    <option value="all">All {currentEnclaveObj.professions.length} {currentEnclaveObj.shortName} Roles</option>
                    {currentEnclaveObj.professions.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    aria-label="Select career pathway"
                    value={selectedPillar}
                    onChange={(e) => handlePillarChange(e.target.value)}
                    className="w-full min-h-[42px] sm:min-h-0 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-2 text-sm sm:text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-[#0A66C2] focus:outline-none cursor-pointer"
                  >
                    <option value="all">🌍 All Career Pathways</option>
                    {CONNECTIN_WORKER_PILLARS.map((pillar) => (
                      <option key={pillar.id} value={pillar.id}>
                        {pillar.icon} {pillar.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* 5. Mobile Regional Hub Selector (< md) */}
              <div className="space-y-1 md:hidden">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Regional Hub ({currentCountry.name})
                </label>
                <select
                  aria-label="Select regional hub"
                  value={selectedHub}
                  onChange={(e) => setSelectedHub(e.target.value)}
                  className="w-full min-h-[42px] rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:border-[#0A66C2] focus:outline-none cursor-pointer"
                >
                  {currentCountry.hubs.map((hub) => (
                    <option key={hub} value={hub}>
                      {hub}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            </div>

            {/* CLEAN COLLAPSIBLE 20 TRADE & SERVICE FOLDERS GRID */}
            {isTradeFoldersDrawerOpen && (
              <div className="rounded-xl border border-sky-200 dark:border-sky-800/70 bg-sky-50/40 dark:bg-sky-950/20 p-3.5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-sky-200/70 dark:border-sky-800/50">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-extrabold text-[#0A66C2] dark:text-sky-300 flex items-center gap-1.5">
                      <FolderOpen className="h-3.5 w-3.5" />
                      <span>20 Synced Trade &amp; Service Folders (250 Everyday Professions)</span>
                    </span>
                    {adminFolderSyncInfo && (
                      <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold">
                        ✓ Synced Platform-Wide
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectTradeFolder('all')}
                      className={`rounded-md px-2 py-0.5 text-[11px] font-bold border cursor-pointer ${
                        selectedTradeFolderNumber === 'all'
                          ? 'bg-[#0A66C2] text-white border-[#0A66C2]'
                          : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700'
                      }`}
                    >
                      All 20 Folders
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTradeFoldersDrawerOpen(false)}
                      className="text-[11px] font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 cursor-pointer"
                    >
                      Close ×
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 max-h-72 sm:max-h-none overflow-y-auto pr-0.5">
                  {HANDYMAN_250_FOLDERS.map((folder) => {
                    const active = selectedTradeFolderNumber === folder.folderNumber
                    return (
                      <button
                        key={folder.folderId}
                        type="button"
                        onClick={() => handleSelectTradeFolder(folder.folderNumber)}
                        className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[11px] font-semibold border transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#0A66C2] text-white border-[#0A66C2] shadow-2xs'
                            : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:bg-sky-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <span className="truncate flex items-center gap-1.5">
                          <span>{folder.icon}</span>
                          <span className="truncate">{folder.folderNumber}. {folder.folderName}</span>
                        </span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold shrink-0 ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          {folder.roles.length}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {activeTradeFolderObj && (
                  <div className="pt-2 border-t border-sky-200/70 dark:border-sky-800/50 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                        Folder #{activeTradeFolderObj.folderNumber}: {activeTradeFolderObj.folderName} ({activeTradeFolderObj.roles.length} Roles)
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedProfessionId('all')}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold cursor-pointer ${
                          selectedProfessionId === 'all'
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                            : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700'
                        }`}
                      >
                        Show All {activeTradeFolderObj.roles.length} Roles
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeTradeFolderObj.roles.map((r) => {
                        const isRoleActive = selectedProfessionId === r.id
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setSelectedProfessionId(isRoleActive ? 'all' : r.id)}
                            className={`rounded-md px-2 py-1 text-[10.5px] font-semibold transition-colors cursor-pointer ${
                              isRoleActive
                                ? 'bg-amber-600 text-white font-bold shadow-2xs'
                                : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-amber-50'
                            }`}
                          >
                            #{r.num} {r.title}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CLEAN COLLAPSIBLE MEDICINE & CLINICAL ROLES PANEL */}
            {(isClinicalRolesOpen || selectedEnclave === 'healthcare_medicine') && (
              <div className="rounded-xl border border-teal-200 dark:border-teal-800/70 bg-teal-50/40 dark:bg-teal-950/20 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-teal-200/70 dark:border-teal-800/50">
                  <span className="text-xs font-extrabold text-teal-800 dark:text-teal-200 flex items-center gap-1.5">
                    <span>🏥</span>
                    <span>Medicine, Pharmacy, Physicians, Nursing &amp; Allied Clinical Roles</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsClinicalRolesOpen(false)}
                    className="text-[11px] font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 cursor-pointer"
                  >
                    Hide ×
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-56 sm:max-h-none overflow-y-auto">
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
                    { id: 'veterinarian', label: '🐾 Veterinarians (DVM)', profId: 'veterinarian', domain: 'All' },
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
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-teal-700 text-white shadow-2xs'
                            : 'bg-white dark:bg-zinc-900 text-teal-900 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800/60'
                        }`}
                      >
                        {medRole.label}
                      </button>
                    )
                  })}
                </div>
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
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: FIND JOBS (MULTI-PROFESSION LIVE BACKEND SYNC) */}
      {/* ========================================================================= */}
      {masterMode === 'find' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Rail: Domain Categories & Hubs (desktop & tablet >= md; moved to horizontal bar & Hub select on mobile) */}
          <div className="hidden md:block md:col-span-4 lg:col-span-3 space-y-4">
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
                      type="button"
                      onClick={() => handleDomainCategorySelect(dom.id)}
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
              <h4 key={currentCountry.code} className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#0A66C2]" />
                <span>{currentCountry.name} Hubs</span>
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
          <div className="md:col-span-8 lg:col-span-9 flex flex-col gap-4">
            {/* Top Job Search Alert Toggle Bar */}
            <div
              id="connectln-job-search-alert-top-bar"
              className={`order-2 md:order-1 rounded-2xl border-2 p-3.5 sm:p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                jobSearchAlertEnabled
                  ? 'border-[#0A66C2] bg-blue-50/80 dark:bg-blue-950/30 dark:border-blue-700'
                  : 'border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A66C2] text-white text-xs font-black shrink-0 mt-0.5">
                  🔔
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      Job search alert for{' '}
                      {searchQuery
                        ? `"${searchQuery}"`
                        : activeTradeFolderObj
                        ? activeTradeFolderObj.folderName
                        : activeDomainCategoryObj
                        ? activeDomainCategoryObj.label
                        : currentProfessionObj
                        ? currentProfessionObj.title
                        : currentEnclaveObj?.name || 'All 20 Industry Enclaves & Verified Roles'}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                        jobSearchAlertEnabled
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {jobSearchAlertEnabled ? '✓ Alert ON' : 'Alert OFF'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    ConnectLn Job Alerts: Get notified as soon as new roles get posted at companies you like ({currentCountry?.name || 'Global & Local'}).
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-blue-200/60 dark:border-blue-800/50 shrink-0">
                <select
                  value={jobAlertFrequency}
                  onChange={(e) => setJobAlertFrequency(e.target.value as any)}
                  className="flex-1 sm:flex-initial min-h-[38px] sm:min-h-0 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
                >
                  <option value="Instant">Instant Alerts</option>
                  <option value="Daily">Daily Digest</option>
                  <option value="Weekly">Weekly Summary</option>
                </select>

                <button
                  type="button"
                  role="switch"
                  aria-checked={jobSearchAlertEnabled}
                  onClick={handleToggleJobSearchAlert}
                  className="flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {jobSearchAlertEnabled ? 'On' : 'Off'}
                  </span>
                  <span
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      jobSearchAlertEnabled ? 'bg-[#0A66C2]' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        jobSearchAlertEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </span>
                </button>
              </div>
            </div>

            {/* Search Header */}
            <div className="order-1 md:order-2 rounded-xl border border-zinc-200 bg-white p-3 sm:p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="min-h-[42px] relative flex-1 flex items-center rounded-lg bg-zinc-50 px-3 py-2 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800/80">
                  <Search className="h-4 w-4 text-zinc-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder={getEnclaveSearchPlaceholder(selectedEnclave, currentCountry.name)}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100"
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

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="submit"
                    disabled={isLoadingJobs}
                    className="flex-1 sm:flex-initial min-h-[42px] rounded-lg bg-[#0A66C2] px-5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#004182] transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    {isLoadingJobs ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    <span>Search</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fetchJobs(selectedEnclave, selectedCountryCode, selectedHub, searchQuery, selectedDomain)}
                    title="Sync latest live job openings"
                    className="min-h-[42px] rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoadingJobs ? "animate-spin text-[#0A66C2]" : ""}`} />
                    <span className="sm:hidden">Sync</span>
                    <span className="hidden sm:inline">Sync Live</span>
                  </button>
                </div>
              </form>

              <div key={currentCountry.code} className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 flex-wrap gap-2">
                <span>
                  Region: <strong>{currentCountry.flag} {currentCountry.name}</strong> ·{' '}
                  {activeTradeFolderObj ? (
                    <>Folder: <strong>{activeTradeFolderObj.icon} Folder {activeTradeFolderObj.folderNumber}: {activeTradeFolderObj.folderName}</strong></>
                  ) : activeDomainCategoryObj ? (
                    <>Category: <strong>{activeDomainCategoryObj.icon} {activeDomainCategoryObj.label}</strong></>
                  ) : (
                    <>Profession: <strong>{currentProfessionObj ? currentProfessionObj.title : currentEnclaveObj ? currentEnclaveObj.name : `All 20 Enclaves (${ALL_PROFESSIONS.length} Professions)`}</strong></>
                  )}{' '}
                  · Hub: <strong>{selectedHub}</strong>
                </span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {displayedJobs.length.toLocaleString()} real openings in {currentCountry.name}
                </span>
              </div>
            </div>

            {/* Jobs List */}
            <div className="order-3 rounded-xl border border-zinc-200 bg-white p-3 sm:p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              {displayedJobs.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                    No openings found for this filter in {currentCountry.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Try viewing all 20 Trade Folders / Enclaves or resetting your category filters.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        setSelectedDomain("All")
                        setSelectedHub("All Hubs")
                        setSearchQuery("")
                        setSelectedTradeFolderNumber("all")
                      }}
                      className="rounded-full bg-[#0A66C2] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#004182] cursor-pointer"
                    >
                      Reset Filters
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEnclave("all")
                        setSelectedTradeFolderNumber("all")
                        setSelectedDomain("All")
                        setSelectedHub("All Hubs")
                        setSearchQuery("")
                      }}
                      className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-4 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 cursor-pointer"
                    >
                      Show All Professions &amp; Folders
                    </button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {displayedJobs.slice(0, visibleJobsCount).map((job) => {
                    const isApplied = appliedJobIds.includes(job.id)
                    const flywheel = getJobFlywheelRecommendation(job)
                    const jobEnclaveObj = PROFESSION_ENCLAVES.find(e => e.id === job.professionEnclave)
                    const tradeFolderMeta = job.professionId ? TRADE_FOLDER_ROLE_META.get(job.professionId) : undefined

                    return (
                      <div
                        key={job.id}
                        className="py-4 first:pt-0 last:pb-0 flex flex-col lg:flex-row lg:items-start justify-between gap-3.5 lg:gap-4 group"
                      >
                        <div className="flex-1 min-w-0 space-y-2.5">
                          {/* Identity Header Row: Logo + Title/Company/Meta + Mobile Top-Right Bookmark */}
                          <div className="flex items-start gap-3">
                            <img
                              src={resolveJobLogoUrl(job.companyLogo, job.professionEnclave)}
                              alt={job.company}
                              onError={(e) => {
                                e.currentTarget.onerror = null
                                e.currentTarget.src = TRADE_ENCLAVE_LOGO.trades_construction
                              }}
                              className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl object-cover border border-zinc-200 shrink-0 dark:border-zinc-800"
                            />

                            <div className="min-w-0 flex-1 space-y-1">
                              <h4
                                onClick={() => handleOpenJobDetail(job)}
                                className="font-bold text-sm sm:text-base text-zinc-900 hover:text-[#0A66C2] hover:underline cursor-pointer dark:text-zinc-100 leading-snug"
                              >
                                {job.title}
                              </h4>

                              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                                {job.company} · <span className="text-zinc-400">{job.source}</span>
                              </p>

                              <div className="flex items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                                <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                                  <MapPin className="h-3.5 w-3.5 text-[#0A66C2] shrink-0" />
                                  {job.location}
                                </span>
                                {job.salaryRange && (
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatJobSalaryForCountry(job.salaryRange, currentCountry, job.location)}
                                  </span>
                                )}
                                <span>{job.postedTime}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleSaveJob(job.id)}
                              aria-label={job.isSaved ? "Remove saved job" : "Save job"}
                              className={`lg:hidden shrink-0 flex h-9 w-9 items-center justify-center rounded-full border transition-colors cursor-pointer ${
                                job.isSaved
                                  ? "text-[#0A66C2] bg-sky-50 border-sky-200 dark:bg-sky-950 dark:border-sky-800"
                                  : "text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 hover:text-zinc-700"
                              }`}
                            >
                              <Bookmark className={`h-4 w-4 ${job.isSaved ? "fill-[#0A66C2]" : ""}`} />
                            </button>
                          </div>

                          {/* Full-Width Details Block */}
                          <div className="space-y-2 lg:pl-[60px]">
                            {(tradeFolderMeta || jobEnclaveObj || job.clearanceRequired || job.isLiveFeed) && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {tradeFolderMeta && (
                                  <span className="rounded-md bg-sky-100/80 dark:bg-sky-950/70 px-2 py-0.5 text-[10px] font-extrabold text-[#0A66C2] dark:text-sky-300 border border-sky-300/70 dark:border-sky-700">
                                    {tradeFolderMeta.folderIcon} Folder {tradeFolderMeta.folderNumber}: {tradeFolderMeta.folderName} · #{tradeFolderMeta.roleNumber}
                                  </span>
                                )}
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
                            )}

                            {/* 🔥 PROFESSION-ALIGNED SKILL, CREDENTIAL & LEARNING CONNECTION */}
                            <div className="rounded-lg bg-gradient-to-r from-purple-50/70 to-sky-50/70 border border-purple-200/80 p-2.5 sm:p-3 dark:bg-purple-950/20 dark:border-purple-900/40 space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] flex-wrap gap-1">
                                <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                                  <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                  Credential &amp; Skill Connection:
                                </span>
                                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                                  {flywheel.badgeText}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                This employer recommends proficiency in <strong>{flywheel.primarySkill}</strong> or <strong>{flywheel.secondarySkill}</strong>.
                              </p>
                              <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-stretch sm:items-center gap-1.5 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onNavigateLearning) onNavigateLearning()
                                  }}
                                  className="min-h-[34px] sm:min-h-0 rounded bg-white px-2.5 py-1.5 sm:py-0.5 text-[11px] sm:text-[10px] font-bold text-[#0A66C2] border border-blue-200 shadow-2xs hover:bg-sky-50 dark:bg-zinc-800 dark:border-zinc-700 text-left sm:text-center cursor-pointer"
                                >
                                  🎓 Take Masterclass →
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onNavigateMarketplace) onNavigateMarketplace()
                                  }}
                                  className="min-h-[34px] sm:min-h-0 rounded bg-white px-2.5 py-1.5 sm:py-0.5 text-[11px] sm:text-[10px] font-bold text-purple-700 border border-purple-200 shadow-2xs hover:bg-purple-50 dark:bg-zinc-800 dark:border-zinc-700 text-left sm:text-center cursor-pointer"
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
                              <div className="flex flex-wrap gap-1.5 pt-1">
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

                        {/* Actions Footer (Mobile-first 2x2 stacked primary + secondary; Desktop right-aligned column) */}
                        <div className="flex flex-col gap-2 w-full lg:w-auto lg:items-end lg:shrink-0 pt-1 lg:pt-0">
                          <div className="order-2 lg:order-1 grid grid-cols-2 lg:flex lg:items-center gap-2 w-full lg:w-auto">
                            <button
                              type="button"
                              onClick={() => handleTailorResumeForJob(job)}
                              className="min-h-[36px] lg:min-h-0 justify-center rounded-full bg-emerald-50 px-3 py-1.5 lg:py-1 text-xs font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 transition-all flex items-center gap-1 cursor-pointer"
                              title="Tailor your resume & cover letter for this job using the embedded Resume Preparation App"
                            >
                              <FileText className="h-3.5 w-3.5 lg:h-3 lg:w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span className="truncate">Tailor Resume</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setCareerTwinJob(job)
                                setIsCareerTwinOpen(true)
                              }}
                              className="min-h-[36px] lg:min-h-0 justify-center rounded-full bg-purple-50 px-3 py-1.5 lg:py-1 text-xs font-bold text-purple-700 border border-purple-200 hover:bg-purple-100 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300 transition-all flex items-center gap-1 cursor-pointer"
                              title="Noctis AI Interview Prep: 25+ Tailored Interview Questions & Sample Answers for this Job"
                            >
                              <Sparkles className="h-3.5 w-3.5 lg:h-3 lg:w-3 text-amber-500 shrink-0" />
                              <span className="sm:hidden truncate">CareerTwin Prep</span>
                              <span className="hidden sm:inline">CareerTwin™ Prep (25+ Qs)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleSaveJob(job.id)}
                              aria-label={job.isSaved ? "Remove saved job" : "Save job"}
                              className={`hidden lg:inline-flex rounded-full p-1.5 transition-colors cursor-pointer ${
                                job.isSaved
                                  ? "text-[#0A66C2] bg-sky-50 dark:bg-sky-950"
                                  : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                              }`}
                            >
                              <Bookmark className={`h-4 w-4 ${job.isSaved ? "fill-[#0A66C2]" : ""}`} />
                            </button>
                          </div>

                          <div className={`order-1 lg:order-2 grid ${job.applyUrl ? 'grid-cols-2' : 'grid-cols-1'} lg:flex lg:items-center gap-2 w-full lg:w-auto`}>
                            {isApplied ? (
                              <button
                                type="button"
                                onClick={() => handleOpenApply(job)}
                                title="Click to view Official ATS Confirmation Receipt & Audit Evidence"
                                className="min-h-[40px] lg:min-h-0 justify-center rounded-full bg-emerald-50 px-3.5 py-2 lg:py-1.5 text-xs font-bold text-emerald-700 border border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Check className="h-3.5 w-3.5 lg:h-3 lg:w-3 shrink-0" />
                                <span className="sm:hidden truncate">Applied · Receipt</span>
                                <span className="hidden sm:inline">Applied by Noctis · View Receipt</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenApply(job)}
                                className="min-h-[40px] lg:min-h-0 justify-center rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-3.5 py-2 lg:py-1.5 text-xs font-bold text-[#0A66C2] dark:text-sky-300 hover:bg-sky-100 transition-colors cursor-pointer flex items-center"
                              >
                                Easy Apply
                              </button>
                            )}

                            {job.applyUrl && (
                              <a
                                href={resolveExternalJobApplyUrl(job)}
                                target="_blank"
                                rel="noreferrer"
                                className="min-h-[40px] lg:min-h-0 justify-center rounded-full bg-[#0A66C2] px-4 py-2 lg:py-1.5 text-xs font-bold text-white hover:bg-[#004182] transition-colors flex items-center gap-1 shadow-xs"
                              >
                                <span>Apply on Site</span>
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {displayedJobs.length > visibleJobsCount && (
                    <div className="pt-5 pb-2 flex flex-col items-center justify-center gap-2 text-center">
                      <p className="text-xs text-zinc-500">
                        Showing <strong>{visibleJobsCount.toLocaleString()}</strong> of <strong>{displayedJobs.length.toLocaleString()}</strong> verified real openings across{' '}
                        {activeTradeFolderObj
                          ? `Folder ${activeTradeFolderObj.folderNumber}: ${activeTradeFolderObj.folderName}`
                          : selectedEnclave === 'all'
                          ? `all 20 Trade Folders, 20 enclaves & ${ALL_PROFESSIONS.length} professions`
                          : currentEnclaveObj?.name || 'this profession'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setVisibleJobsCount((prev) => prev + 60)}
                        className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-6 py-2 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        Load 60 More Real Openings ({(displayedJobs.length - visibleJobsCount).toLocaleString()} remaining) →
                      </button>
                    </div>
                  )}

                  {/* Bottom Job Search Alert Toggle Bar */}
                  <div
                    id="connectln-job-search-alert-bar"
                    className={`mt-4 rounded-2xl border-2 p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      jobSearchAlertEnabled
                        ? 'border-[#0A66C2] bg-blue-50/70 dark:bg-blue-950/30 dark:border-blue-700'
                        : 'border-zinc-200 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A66C2] text-white text-xs font-black shrink-0 mt-0.5">
                        🔔
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            Job search alert for {searchQuery ? `"${searchQuery}"` : currentEnclaveObj?.name || (currentUser as any)?.profession || currentUser?.headline || 'Your Target Roles'}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                              jobSearchAlertEnabled
                                ? 'bg-emerald-600 text-white'
                                : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                            }`}
                          >
                            {jobSearchAlertEnabled ? 'Alert ON' : 'Alert OFF'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          Get notified as soon as new roles get posted at companies you like ({currentCountry?.name || 'Global & Local'}).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-blue-200/60 dark:border-blue-800/50 shrink-0">
                      <select
                        value={jobAlertFrequency}
                        onChange={(e) => setJobAlertFrequency(e.target.value as any)}
                        className="flex-1 sm:flex-initial min-h-[38px] sm:min-h-0 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
                      >
                        <option value="Instant">Instant Alerts</option>
                        <option value="Daily">Daily Digest</option>
                        <option value="Weekly">Weekly Summary</option>
                      </select>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={jobSearchAlertEnabled}
                        onClick={handleToggleJobSearchAlert}
                        className="flex items-center gap-2 cursor-pointer shrink-0"
                      >
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          {jobSearchAlertEnabled ? 'On' : 'Off'}
                        </span>
                        <span
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            jobSearchAlertEnabled ? 'bg-[#0A66C2]' : 'bg-zinc-300 dark:bg-zinc-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform ${
                              jobSearchAlertEnabled ? 'translate-x-5.5' : 'translate-x-1'
                            }`}
                          />
                        </span>
                      </button>
                    </div>
                  </div>
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
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
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
                  className={`min-h-[34px] shrink-0 rounded-full px-3 py-1 font-bold transition-all whitespace-nowrap cursor-pointer ${
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

          {filteredApplications.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-[#0A66C2] border border-sky-200 dark:bg-sky-950/40 dark:border-sky-800">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {applications.length === 0
                  ? 'No Applications Submitted Yet'
                  : `No Applications in "${appStageFilter === 'rejected' ? 'Archived' : appStageFilter}" Stage`}
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                {applications.length === 0
                  ? 'Use Noctis™ Easy Apply on any opening in Find Jobs to submit directly to the employer inbox or launch your prepared packet, receive an email receipt, and track every stage here.'
                  : 'Switch stage filters or return to all applications to manage your interview pipeline.'}
              </p>
              <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                {applications.length > 0 && appStageFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setAppStageFilter('all')}
                    className="rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-4 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer"
                  >
                    View All ({applications.length}) Applications
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMasterMode('find')}
                  style={{ color: '#FFFFFF' }}
                  className="rounded-full bg-[#0A66C2] hover:bg-[#004182] px-5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Browse Open Roles &amp; Apply with Noctis™</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    {/* Stage Badge Header */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
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
                        {app.submittedByNoctis && (
                          <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                            {app.deliveryMode === 'direct_connectln_ats'
                              ? '🤖 Tier 1 · Direct ConnectLn ATS'
                              : '🚀 Tier 2 · Noctis Packet & Portal Handoff'}
                          </span>
                        )}
                        {app.confirmationId && (
                          <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
                            #{app.confirmationId}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">{app.appliedDate}</span>
                    </div>

                    {/* Company & Role */}
                    <div className="flex items-start gap-3">
                      <img
                        src={resolveJobLogoUrl(app.companyLogo, undefined, app.company)}
                        alt={app.company}
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = TRADE_ENCLAVE_LOGO.trades_construction
                        }}
                        className="h-10 w-10 rounded-lg object-cover border border-zinc-200 shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                          {app.jobTitle}
                        </h4>
                        <p className="text-xs text-zinc-500 font-medium">{app.company} · {app.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {app.salary}
                      </p>
                      <select
                        aria-label={`Update pipeline stage for ${app.jobTitle}`}
                        value={app.stage}
                        onChange={(e) => handleUpdateApplicationStage(app.id, e.target.value as JobApplicationItem['stage'])}
                        className="rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-bold text-zinc-700 dark:text-zinc-200 cursor-pointer"
                      >
                        <option value="applied">Stage: Applied</option>
                        <option value="interview">Stage: Interview</option>
                        <option value="offer">Stage: Offer</option>
                        <option value="rejected">Stage: Archived</option>
                      </select>
                    </div>

                    {/* Official Employer Response & Audit Proof */}
                    <div className="rounded-lg bg-zinc-50 p-2.5 text-xs dark:bg-zinc-800/60 space-y-1.5 border border-zinc-200/70 dark:border-zinc-700/70">
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        {app.employerResponse
                          ? app.deliveryMode === 'direct_connectln_ats'
                            ? 'Direct ConnectLn ATS Confirmation:'
                            : 'Noctis™ Packet & External Handoff Status:'
                          : 'Next Step:'}
                      </p>
                      <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {app.employerResponse || app.nextStep}
                      </p>
                      {app.auditHashSha256 && (
                        <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 pt-0.5 truncate">
                          SHA-256 Proof: {app.auditHashSha256.slice(0, 24)}…
                        </p>
                      )}
                      {app.offerDetails && (
                        <p className="text-[11px] font-bold text-emerald-600 pt-1">
                          📦 Package: {app.offerDetails}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2">
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full">
                      <button
                        type="button"
                        onClick={() => {
                          setCareerTwinJob({
                            title: app.jobTitle,
                            company: app.company,
                            location: app.location,
                            salaryRange: app.salary,
                            description: `Interview preparation for ${app.jobTitle} at ${app.company}.`
                          })
                          setIsCareerTwinOpen(true)
                        }}
                        className="min-h-[36px] justify-center rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                        <span className="truncate">Interview Prep</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleTailorResumeForJob({
                            id: app.jobId || app.id,
                            countryCode: selectedCountryCode,
                            countryName: currentCountry.name,
                            professionEnclave: 'trades_construction',
                            domainCategory: 'Recommended',
                            title: app.jobTitle,
                            company: app.company,
                            companyLogo: resolveJobLogoUrl(app.companyLogo, undefined, app.company),
                            location: app.location,
                            hub: currentCountry.hubs[1] || 'All Hubs',
                            workplaceType: 'Hybrid',
                            employmentType: 'Full-time',
                            postedTime: app.appliedDate,
                            applicantsCount: 1,
                            salaryRange: app.salary,
                            easyApply: true,
                            description: app.noctisCoverBrief || `Application for ${app.jobTitle} at ${app.company}.`,
                            requirements: app.productVerifiedMatch ? [app.productVerifiedMatch] : [],
                            languageRequirement: 'English',
                            applyUrl: '',
                            source: 'My Applications',
                            tags: app.productVerifiedMatch ? [app.productVerifiedMatch] : []
                          })
                        }}
                        className="min-h-[36px] justify-center rounded-full bg-sky-50 border border-sky-200 px-2.5 py-1 text-[11px] font-bold text-[#0A66C2] hover:bg-sky-100 flex items-center cursor-pointer"
                      >
                        <span className="truncate">✨ Tailor Resume</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadApplicationReceipt(app)}
                        className="min-h-[36px] justify-center rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 flex items-center cursor-pointer"
                      >
                        <span className="truncate">📄 Receipt</span>
                      </button>

                      {onNavigateMessaging && (
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              sessionStorage.setItem(
                                'connectln_open_messaging_target_v1',
                                JSON.stringify({
                                  threadTitle:
                                    app.deliveryMode === 'direct_connectln_ats'
                                      ? `${app.company} Talent Acquisition`
                                      : `${app.company} · Noctis™ Handoff`,
                                  channel: 'Companies'
                                })
                              )
                            } catch {}
                            onNavigateMessaging()
                          }}
                          className="min-h-[36px] justify-center rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 flex items-center cursor-pointer"
                        >
                          <span className="truncate">💬 Messaging</span>
                        </button>
                      )}
                    </div>

                    <span className="text-[11px] text-zinc-400">
                      {app.recruiterName || 'Talent Ops'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                Find talent across all {PROFESSION_ENCLAVES.length} industry enclaves with verified licenses, certifications, and high skill-match rankings.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:flex w-full sm:w-auto items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setMasterMode('find')}
                className="min-h-[38px] justify-center flex items-center rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-3 sm:px-3.5 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-200 cursor-pointer"
              >
                <span className="truncate">← Back to Jobs</span>
              </button>
              <button
                type="button"
                onClick={handleOpenPostJobModal}
                style={{ color: '#FFFFFF' }}
                className="min-h-[38px] justify-center rounded-xl bg-[#0A66C2] px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#004182] transition-colors flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4 shrink-0" />
                <span className="truncate">Post Job</span>
              </button>
            </div>
          </div>

          {/* Candidate Filter Ribbon & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <span className="font-bold text-zinc-400 uppercase text-[10px] shrink-0">Filter Talent:</span>
              {[
                { id: 'All', label: `All Verified Candidates (${candidates.length})` },
                { id: 'ProductVerified', label: '⚡ License & Tool Verified' },
                { id: 'Clearance', label: '🛡️ Active Clearance / Board Certified' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedRecruitingFilter(f.id)}
                  className={`min-h-[34px] shrink-0 rounded-full px-3 py-1 font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedRecruitingFilter === f.id
                      ? "bg-[#0A66C2] text-white shadow-2xs"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={recruitingSearchQuery}
              onChange={(e) => setRecruitingSearchQuery(e.target.value)}
              placeholder="Search candidates by skill, license, city..."
              className="w-full sm:w-64 min-h-[38px] rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200"
            />
          </div>

          {/* AI Candidate Cards Grid */}
          {filteredCandidates.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                No verified candidates matched your current filter or search.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedRecruitingFilter('All')
                  setRecruitingSearchQuery('')
                }}
                className="rounded-full bg-[#0A66C2] px-4 py-1.5 text-xs font-bold text-white cursor-pointer"
                style={{ color: '#FFFFFF' }}
              >
                Reset Recruiting Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCandidates.map((cand) => (
              <div
                key={cand.id}
                className="rounded-xl border border-zinc-200 bg-white p-3.5 sm:p-5 shadow-xs hover:border-purple-500/50 hover:shadow-lg transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <img
                        src={cand.avatar}
                        alt={cand.name}
                        className="h-12 w-12 rounded-full object-cover border-2 border-purple-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
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
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <span className="text-[11px] text-zinc-500 font-medium">
                    Certifications: {cand.certifications.join(', ')}
                  </span>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
                    {reachedOutCandidateIds.includes(cand.id) && (
                      <button
                        type="button"
                        onClick={() => handleJumpToRecruitingThread(cand.name)}
                        style={{ color: '#FFFFFF' }}
                        className="flex-1 sm:flex-initial justify-center min-h-[38px] rounded-full bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <Check className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">💬 Recruiting Messages</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenCandidateOutreach(cand)}
                      style={{ color: '#FFFFFF' }}
                      className="flex-1 sm:flex-initial justify-center min-h-[38px] rounded-full bg-[#0A66C2] hover:bg-[#004182] px-4 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-2xs"
                    >
                      <Send className="h-3 w-3 shrink-0" />
                      <span>{reachedOutCandidateIds.includes(cand.id) ? "Message Again" : "Reach Out"}</span>
                    </button>
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}
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
          style={
            isResumeFullscreen
              ? {
                  paddingTop: "max(env(safe-area-inset-top, 0px), 12px)",
                  paddingBottom: "max(env(safe-area-inset-bottom, 0px), 12px)",
                }
              : undefined
          }
        >
          {/* Control Header Bar */}
          <div className="rounded-2xl border border-emerald-200/90 dark:border-emerald-900/60 bg-gradient-to-r from-emerald-50/90 via-teal-50/80 to-sky-50/90 dark:from-emerald-950/50 dark:via-teal-950/40 dark:to-sky-950/40 p-3.5 sm:p-4 shadow-xs">
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

              <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
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
                  className="w-full sm:w-auto sm:max-w-[260px] min-h-[38px] truncate rounded-full border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200"
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
                  onClick={() => {
                    setIsResumeFullscreen(false)
                    setMasterMode('find')
                  }}
                  className="min-h-[36px] rounded-full bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                >
                  ← Back to Find Jobs
                </button>

                <button
                  type="button"
                  onClick={() => setResumeIframeKey((prev) => prev + 1)}
                  className="min-h-[36px] rounded-full bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Reload Resume Preparation App"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Reload</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsResumeFullscreen((prev) => !prev)}
                  className="min-h-[36px] rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer shadow-xs"
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
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5 line-clamp-2 sm:truncate">
                    Paste the copied job description into <strong>Resume Tailor → Step 2 (Target Job Description)</strong> below to generate your ATS-optimized resume &amp; cover letter.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => handleTailorResumeForJob(tailorTargetJob)}
                    className="flex-1 sm:flex-initial justify-center min-h-[36px] rounded-full bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
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

          {/* In-App ATS Resume Tailor + CSP-Sandboxed External Studio */}
          <ResumePrepStudioEmbed
            currentUser={currentUser}
            targetJob={tailorTargetJob}
            iframeKey={resumeIframeKey}
            onReloadIframe={() => setResumeIframeKey((prev) => prev + 1)}
            isFullscreen={isResumeFullscreen}
          />
        </div>
      )}

      {/* JOB DETAILS & DIRECT APPLICATION MODAL */}
      <Dialog open={isJobDetailOpen} onOpenChange={setIsJobDetailOpen}>
        <DialogContent className="max-w-2xl w-[calc(100vw-1.5rem)] max-h-[88dvh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
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
                    💰 {formatJobSalaryForCountry(selectedJob.salaryRange, currentCountry, selectedJob.location)}
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

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsJobDetailOpen(false)
                      handleTailorResumeForJob(selectedJob)
                    }}
                    className="w-full sm:w-auto justify-center min-h-[40px] rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Tailor Resume in Prep App</span>
                  </button>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setIsJobDetailOpen(false)
                        handleOpenApply(selectedJob)
                      }}
                      className="w-full sm:w-auto justify-center min-h-[40px] rounded-full bg-sky-50 border border-sky-200 px-4 py-2 text-xs font-bold text-[#0A66C2] hover:bg-sky-100 flex items-center cursor-pointer"
                    >
                      Easy Apply on ConnectIn
                    </button>

                    {selectedJob.applyUrl && (
                      <a
                        href={resolveExternalJobApplyUrl(selectedJob)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto justify-center min-h-[40px] rounded-full bg-[#0A66C2] px-5 py-2 text-xs font-bold text-white hover:bg-[#004182] flex items-center gap-1.5 shadow-xs"
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
        <DialogContent className="max-w-lg w-[calc(100vw-1.5rem)] max-h-[88dvh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        setNewJobSalary(convertUsdSalaryToCountry("$145,000 - $185,000 / yr", cObj))
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  Recruiter / Hiring Desk Email (Receives Tier 1 Easy Apply Packets)
                </label>
                <input
                  type="email"
                  placeholder="recruiting@company.com"
                  value={newJobRecruiterEmail}
                  onChange={(e) => setNewJobRecruiterEmail(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700"
                />
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

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsPostJobOpen(false)}
                  className="w-full sm:w-auto min-h-[40px] rounded-full px-4 py-1.5 font-bold text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto min-h-[40px] rounded-full bg-[#0A66C2] px-5 py-2 font-bold text-white hover:bg-[#004182] cursor-pointer"
                >
                  Publish &amp; Sync Immediately
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* EASY APPLY MODAL — NOCTIS AUTONOMOUS APPLICATION AGENT */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="max-w-xl w-[calc(100vw-1.5rem)] max-h-[88dvh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
          {selectedJob && (() => {
            const jobFlywheel = getJobFlywheelRecommendation(selectedJob)
            const previewDirectAts = isDirectConnectlnAtsJob(selectedJob)
            const resolvedDeliveryMode = lastSubmittedApplication?.deliveryMode || (previewDirectAts ? 'direct_connectln_ats' : 'external_portal_handoff')
            const isTier1Direct = resolvedDeliveryMode === 'direct_connectln_ats'
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 text-xs text-[#0A66C2] font-semibold">
                      <Building className="h-3.5 w-3.5" />
                      <span>{selectedJob.company} ({selectedJob.countryName})</span>
                    </div>
                    <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-300">
                      {previewDirectAts
                        ? '🤖 Tier 1 · Direct ConnectLn ATS Delivery'
                        : '🚀 Tier 2 · Noctis Packet + External Portal Launch'}
                    </span>
                  </div>
                  <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {applyStep === 'success'
                      ? `${isTier1Direct ? 'Direct ATS Receipt' : 'Packet Prepared & Handoff'} — ${selectedJob.title}`
                      : `Noctis™ Easy Apply: ${selectedJob.title}`}
                  </DialogTitle>
                </DialogHeader>

                {applyStep === 'form' ? (
                  <form onSubmit={handleSubmitApplication} className="space-y-3.5 pt-1 text-xs">
                    <div className="rounded-xl bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 dark:from-indigo-950/50 dark:via-sky-950/40 dark:to-emerald-950/40 border border-sky-200 dark:border-sky-800 p-3 space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                          {previewDirectAts
                            ? '🤖 Noctis™ Will Deliver Directly to Hiring Inbox & ConnectLn ATS'
                            : '🚀 Noctis™ Will Prep Your Packet, Copy Brief, Email Receipt & Open Employer Site'}
                        </span>
                        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                          <input
                            type="checkbox"
                            checked={noctisAutoApplyEnabled}
                            onChange={(e) => setNoctisAutoApplyEnabled(e.target.checked)}
                            className="accent-[#0A66C2]"
                          />
                          <span>Save Proof Receipt</span>
                        </label>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {previewDirectAts ? (
                          <>
                            This role accepts direct ConnectLn ATS delivery. Noctis emails your verified resume packet directly to{' '}
                            <strong>{selectedJob.recruiterEmail || 'the hiring desk'}</strong> (CC to your receipt email &amp; Expedite Consults), logs a SHA-256 receipt, and opens a company thread in <strong>Messaging</strong>.
                          </>
                        ) : (
                          <>
                            <strong>{selectedJob.company}</strong> hosts its own external career application portal. Clicking submit emails your tailored packet receipt, copies your Noctis™ cover brief to your clipboard, logs the role in <strong>My Applications</strong>, and <strong>automatically opens the external employer site</strong> so you can finish submitting there.
                          </>
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-0.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                          Submitting Candidate
                        </p>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">
                          {currentUser?.name || "Kwesi Asiedu"}
                        </p>
                        <p className="text-[11px] text-zinc-500 line-clamp-1">
                          {currentUser?.headline || "Verified Professional"}
                        </p>
                      </div>

                      <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                          Confirmation Receipt Email
                        </label>
                        <input
                          type="email"
                          required
                          value={applicantEmailInput}
                          onChange={(e) => setApplicantEmailInput(e.target.value)}
                          placeholder="you@domain.com"
                          className="w-full rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2 py-1 text-xs font-medium text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        Attached Verified Resume Packet
                      </label>
                      <div className="flex items-center justify-between gap-2 rounded-lg border border-zinc-300 p-2.5 dark:border-zinc-700 flex-wrap">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-[#0A66C2] shrink-0" />
                          <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                            {customResumeFileName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <label className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 cursor-pointer">
                            <span>Attach PDF/DOCX</span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file?.name) setCustomResumeFileName(file.name)
                              }}
                            />
                          </label>
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
                    </div>

                    <div className="rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-2.5 space-y-0.5">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                        Verified Credential &amp; KSA Fit Included in Submission
                      </p>
                      <p className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                        • {jobFlywheel.primarySkill}
                      </p>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
                        • {jobFlywheel.secondarySkill}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          Noctis™ Autonomous Cover Brief &amp; ATS Packet
                        </label>
                        <button
                          type="button"
                          onClick={() => setNoctisCoverBrief(buildNoctisCoverBrief(selectedJob))}
                          className="text-[11px] font-bold text-[#0A66C2] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>✨ Regenerate with Noctis AI</span>
                        </button>
                      </div>
                      <textarea
                        rows={5}
                        required
                        value={noctisCoverBrief}
                        onChange={(e) => setNoctisCoverBrief(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 leading-relaxed"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      {selectedJob.applyUrl ? (
                        <a
                          href={resolveExternalJobApplyUrl(selectedJob)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-[#0A66C2] hover:underline flex items-center gap-1"
                        >
                          <span>Or apply manually on {selectedJob.company}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      ) : <span />}

                      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setIsApplyModalOpen(false)}
                          className="w-full sm:w-auto justify-center min-h-[40px] rounded-full px-4 py-1.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100 flex items-center cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          style={{ color: '#FFFFFF' }}
                          className="w-full sm:w-auto justify-center min-h-[40px] rounded-full bg-[#0A66C2] px-5 py-2 text-xs font-bold text-white hover:bg-[#004182] flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Sparkles className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {previewDirectAts
                              ? '🤖 Deliver Directly via Noctis™ ATS'
                              : '🚀 Prepare Packet, Copy & Launch Employer Site'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </form>
                ) : applyStep === 'submitting' ? (
                  <div className="py-6 space-y-4">
                    <div className="flex items-center justify-center gap-2.5 text-[#0A66C2] font-extrabold text-sm">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>
                        {previewDirectAts
                          ? 'Noctis™ is delivering your application directly to the Hiring Desk...'
                          : 'Noctis™ is preparing your packet & launching the employer portal...'}
                      </span>
                    </div>
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 p-4 space-y-2 text-xs">
                      <p className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-300">
                        <Check className="h-4 w-4" />
                        <span>1. Compiling Verified Profile &amp; Resume ({customResumeFileName})</span>
                      </p>
                      <p className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-300">
                        <Check className="h-4 w-4" />
                        <span>2. Attaching KSA Matrix ({jobFlywheel.primarySkill})</span>
                      </p>
                      <p className="flex items-center gap-2 font-semibold text-[#0A66C2]">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>
                          {previewDirectAts
                            ? `3. Emailing Verified Packet directly to ${selectedJob.company} Recruiting Inbox`
                            : `3. Dispatching Receipt Email, Copying Cover Brief & Opening ${selectedJob.company} Portal`}
                        </span>
                      </p>
                      <p className="flex items-center gap-2 text-zinc-500">
                        <Clock className="h-3.5 w-3.5" />
                        <span>4. Recording Cryptographic SHA-256 Receipt &amp; My Applications Entry</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-3 space-y-3.5 text-xs">
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-3.5 flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0">
                        <Check className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-sm text-emerald-900 dark:text-emerald-200">
                            {isTier1Direct
                              ? 'Direct Application Delivered to Hiring Inbox!'
                              : 'Noctis™ Packet Prepared, Copied & Employer Site Launched!'}
                          </h4>
                          {lastSubmittedApplication?.confirmationId && (
                            <span className="rounded-full bg-white dark:bg-zinc-900 border border-emerald-400 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
                              #{lastSubmittedApplication.confirmationId}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                          {isTier1Direct ? (
                            <>
                              Delivered directly for <strong>{selectedJob.title}</strong> at <strong>{selectedJob.company}</strong>. Logged to your <strong>My Applications Pipeline</strong> and delivered to <strong>ConnectLn Messaging</strong>.
                            </>
                          ) : (
                            <>
                              Your tailored Noctis™ cover brief for <strong>{selectedJob.title}</strong> was <strong>copied to your clipboard</strong>, emailed to your receipt inbox, logged to <strong>My Applications</strong>, and opened at <strong>{lastSubmittedApplication?.targetAtsHost || 'the employer portal'}</strong> to submit directly with {selectedJob.company}.
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Concrete Audit & Verification Evidence */}
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 p-3 space-y-1.5">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                        Concrete Submission Verification &amp; Audit Proof
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                        <p><strong className="text-zinc-700 dark:text-zinc-200">Confirmation ID:</strong> <span className="font-mono">{lastSubmittedApplication?.confirmationId}</span></p>
                        <p>
                          <strong className="text-zinc-700 dark:text-zinc-200">Delivery Tier:</strong>{' '}
                          {isTier1Direct ? 'Tier 1 · Direct ConnectLn ATS' : 'Tier 2 · Packet + External Launch'}
                        </p>
                        <p><strong className="text-zinc-700 dark:text-zinc-200">Target ATS Host:</strong> <span className="font-mono">{lastSubmittedApplication?.targetAtsHost || 'employer-ats.connectln.app'}</span></p>
                        <p><strong className="text-zinc-700 dark:text-zinc-200">UTC Timestamp:</strong> <span className="font-mono">{lastSubmittedApplication?.submittedAtIso || lastSubmittedApplication?.appliedDate}</span></p>
                        {lastSubmittedApplication?.recruiterEmail && (
                          <p className="sm:col-span-2"><strong className="text-zinc-700 dark:text-zinc-200">Delivered To Employer Email:</strong> {lastSubmittedApplication.recruiterEmail}</p>
                        )}
                        <p className="sm:col-span-2"><strong className="text-zinc-700 dark:text-zinc-200">Resume &amp; Skills Transmitted:</strong> {lastSubmittedApplication?.resumeFileName || customResumeFileName} · {lastSubmittedApplication?.productVerifiedMatch || jobFlywheel.primarySkill}</p>
                        {lastSubmittedApplication?.auditHashSha256 && (
                          <p className="sm:col-span-2 font-mono text-[10px] text-zinc-600 dark:text-zinc-400 break-all">
                            <strong className="font-sans text-zinc-700 dark:text-zinc-200">SHA-256 Proof Hash:</strong> {lastSubmittedApplication.auditHashSha256}
                          </p>
                        )}
                        <p className="sm:col-span-2 text-[10px] text-zinc-600 dark:text-zinc-400">
                          <strong>Email Receipt Status:</strong>{' '}
                          {lastSubmittedApplication?.emailConfirmationSent
                            ? `Dispatched to ${lastSubmittedApplication.applicantEmail}`
                            : `Archived in My Applications & Messaging (${lastSubmittedApplication?.applicantEmail || applicantEmailInput})`}
                        </p>
                      </div>
                    </div>

                    {/* Honest Status Box */}
                    {lastSubmittedApplication?.employerResponse && (
                      <div className="rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/80 dark:bg-sky-950/30 p-3 space-y-1">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#0A66C2] dark:text-sky-300">
                          {isTier1Direct
                            ? `Direct ConnectLn ATS Confirmation (${selectedJob.company})`
                            : `Noctis™ Packet & External Handoff Summary (${selectedJob.company})`}
                        </p>
                        <p className="text-[11px] text-zinc-800 dark:text-zinc-200 leading-relaxed">
                          {lastSubmittedApplication.employerResponse}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-stretch sm:items-center justify-center gap-2 pt-1">
                      {lastSubmittedApplication?.noctisCoverBrief && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(lastSubmittedApplication.noctisCoverBrief || '').catch(() => {})
                          }}
                          className="justify-center min-h-[38px] rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 px-3.5 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center cursor-pointer"
                        >
                          📋 Copy Cover Brief
                        </button>
                      )}
                      {lastSubmittedApplication && (
                        <button
                          type="button"
                          onClick={() => handleDownloadApplicationReceipt(lastSubmittedApplication)}
                          className="justify-center min-h-[38px] rounded-full bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>📄 Download Official Receipt (.txt)</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            sessionStorage.setItem(
                              'connectln_open_messaging_target_v1',
                              JSON.stringify({
                                threadTitle: isTier1Direct
                                  ? `${selectedJob.company} Talent Acquisition`
                                  : `${selectedJob.company} · Noctis™ Handoff`,
                                channel: 'Companies'
                              })
                            )
                          } catch {}
                          setIsApplyModalOpen(false)
                          onNavigateMessaging?.()
                        }}
                        className="justify-center min-h-[38px] rounded-full bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-3.5 py-2 text-xs font-bold text-indigo-700 flex items-center cursor-pointer"
                      >
                        💬 View Response in Messaging →
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsApplyModalOpen(false)
                          setMasterMode('applications')
                        }}
                        className="justify-center min-h-[38px] rounded-full bg-sky-50 border border-sky-200 hover:bg-sky-100 px-3.5 py-2 text-xs font-bold text-[#0A66C2] flex items-center cursor-pointer"
                      >
                        📋 View in My Applications ({applications.length})
                      </button>
                      {selectedJob.applyUrl && (
                        <a
                          href={resolveExternalJobApplyUrl(selectedJob)}
                          target="_blank"
                          rel="noreferrer"
                          className="justify-center min-h-[38px] rounded-full bg-zinc-100 dark:bg-zinc-800 px-3.5 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 flex items-center gap-1"
                        >
                          <span>Open Employer Portal</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsApplyModalOpen(false)}
                        className="justify-center min-h-[38px] rounded-full bg-[#0A66C2] px-5 py-2 text-xs font-bold text-white hover:bg-[#004182] flex items-center cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* RECRUITER DIRECT OUTREACH & INTERVIEW INVITATION MODAL */}
      <Dialog open={isOutreachModalOpen} onOpenChange={setIsOutreachModalOpen}>
        <DialogContent className="max-w-lg w-[calc(100vw-1.5rem)] max-h-[88dvh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
          {outreachCandidate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <img
                    src={outreachCandidate.avatar}
                    alt={outreachCandidate.name}
                    className="h-11 w-11 rounded-full object-cover border border-purple-300 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <DialogTitle className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                        Reach Out to {outreachCandidate.name}
                      </DialogTitle>
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        🎯 {outreachCandidate.matchScore}% Match
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                      {outreachCandidate.headline} · {outreachCandidate.location}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              {outreachStep === 'compose' ? (
                <form onSubmit={handleSendCandidateOutreach} className="space-y-3.5 pt-2 text-xs">
                  <div className="rounded-xl bg-purple-50/70 border border-purple-200/80 p-3 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-purple-800">
                      Verified Licenses, Tools &amp; Certifications Matched:
                    </p>
                    <p className="font-semibold text-zinc-800">
                      {outreachCandidate.verifiedProducts.join(' · ')} ({outreachCandidate.certifications.join(', ')})
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">
                      Target Role / Position Title
                    </label>
                    <input
                      type="text"
                      required
                      value={outreachRoleTitle}
                      onChange={(e) => setOutreachRoleTitle(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 dark:text-zinc-300">
                        Compensation &amp; Bonus Briefing
                      </label>
                      <input
                        type="text"
                        required
                        value={outreachCompRange}
                        onChange={(e) => setOutreachCompRange(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 dark:text-zinc-300">
                        Interview Format
                      </label>
                      <select
                        value={outreachInterviewFormat}
                        onChange={(e) => setOutreachInterviewFormat(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                      >
                        <option value="30-Min Executive Video Briefing (Zoom / ConnectLn Meet)">30-Min Executive Video Briefing</option>
                        <option value="Direct Hiring Manager Phone Call (15 Min)">Direct Hiring Manager Call (15 Min)</option>
                        <option value="On-Site / Technical Walkthrough & Offer Review">On-Site / Technical Walkthrough</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <label className="font-bold text-zinc-700 dark:text-zinc-300">
                        Direct Recruiter InMail &amp; Calendar Invitation
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setOutreachMessage(
                            `Hi ${outreachCandidate.name.split(' ')[0]},\n\nYour verified background in ${outreachCandidate.capabilities.join(', ')} and active ${outreachCandidate.certifications.join(', ')} credentials stood out immediately (${outreachCandidate.matchScore}% match).\n\nWe are extending a priority interview invitation for ${outreachRoleTitle} (${outreachCompRange}). Are you available for a ${outreachInterviewFormat} this Thursday or Friday?`
                          )
                        }
                        className="text-[11px] font-bold text-[#0A66C2] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>✨ Polish with Noctis AI</span>
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      required
                      value={outreachMessage}
                      onChange={(e) => setOutreachMessage(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 p-2.5 text-xs text-zinc-900 leading-relaxed dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                    />
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsOutreachModalOpen(false)}
                      className="w-full sm:w-auto justify-center min-h-[40px] rounded-full px-4 py-1.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100 flex items-center cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ color: '#FFFFFF' }}
                      className="w-full sm:w-auto justify-center min-h-[40px] rounded-full bg-[#0A66C2] hover:bg-[#004182] px-5 py-2 text-xs font-bold text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5 shrink-0" />
                      <span>Send &amp; Open in Recruiting Messages →</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-5 text-center space-y-3 text-xs">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <Check className="h-6 w-6" />
                  </div>
                  <h4 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                    Direct Recruiting Invitation Sent to {outreachCandidate.name}!
                  </h4>
                  <p className="text-zinc-600 dark:text-zinc-300 max-w-md mx-auto leading-relaxed">
                    Your invitation for <strong>{outreachRoleTitle}</strong> ({outreachCompRange}) and a calendar booking link for a <strong>{outreachInterviewFormat}</strong> have been delivered to {outreachCandidate.name}&apos;s ConnectLn Inbox.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOutreachModalOpen(false)}
                      style={{ color: '#FFFFFF' }}
                      className="rounded-full bg-[#0A66C2] hover:bg-[#004182] px-6 py-2 text-xs font-bold text-white cursor-pointer"
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
