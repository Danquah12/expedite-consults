"use client"

import React, { useState, useMemo } from "react"
import {
  Shield,
  Store,
  Award,
  Briefcase,
  Users,
  Sparkles,
  DollarSign,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ExternalLink,
  Search,
  MapPin,
  Building2,
  Handshake,
  MessageSquare,
  SlidersHorizontal,
  Flag,
  Lock,
  TrendingUp,
  Layers,
  ChevronRight,
  PlusCircle,
  Check
} from "lucide-react"
import { UserProfile } from "@/lib/connectln-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface VeteransAndFranchiseNetworksViewProps {
  currentUser?: UserProfile
  initialSection?: "veterans" | "franchises" | "bridge" | "ai_matching" | "ecosystem"
  onNavigateTab?: (tab: string) => void
  onOpenDirectMessage?: (recipient: { id?: string; name: string; headline: string; avatar?: string }) => void
}

// ─── 1. SPECIALIZED VETERAN CATEGORIES (10 CATEGORIES) ──────────────────────
const VETERAN_CATEGORIES = [
  "All Veteran Tracks",
  "Veteran Entrepreneurs",
  "Veteran-Owned Businesses",
  "Military-to-Civilian Career Transition",
  "Veteran Technology Professionals",
  "Veteran Cybersecurity Professionals",
  "Veteran Investors",
  "Veteran Consultants",
  "Veteran Mentors",
  "Veteran Franchise Owners",
  "Veteran Nonprofit Organizations"
]

// ─── 2. FRANCHISE INDUSTRY CATEGORIES (18 CATEGORIES) ───────────────────────
const FRANCHISE_CATEGORIES = [
  "All Industries",
  "Food and Restaurants",
  "Fast Food",
  "Coffee Shops",
  "Healthcare and Wellness",
  "Senior Care",
  "Education and Tutoring",
  "Automotive Services",
  "Cleaning Services",
  "Real Estate",
  "Fitness and Gyms",
  "Retail",
  "Home Improvement",
  "Transportation and Logistics",
  "Childcare",
  "Technology Services",
  "Business Consulting",
  "Hotels and Hospitality",
  "Beauty and Personal Care"
]

// ─── 3. AI MILITARY SKILLS TRANSLATOR PRESETS ───────────────────────────────
interface MilitaryTranslationPreset {
  id: string
  code: string
  branch: string
  militaryTitle: string
  summary: string
  militarySkills: string[]
  civilianRoles: Array<{
    title: string
    matchScore: number
    salaryBand: string
    demandLevel: string
  }>
  skillGaps: string[]
  recommendedTraining: Array<{
    title: string
    provider: string
    duration: string
    funding: string
  }>
  matchingFranchiseCategories: string[]
}

const MILITARY_TRANSLATION_PRESETS: MilitaryTranslationPreset[] = [
  {
    id: "logistics_92a",
    code: "MOS 92A / 88N / 0402 / LSS",
    branch: "U.S. Army / Marines / Navy / Air Force",
    militaryTitle: "Military Logistics & Supply Chain Specialist",
    summary: "Directed multi-theater supply lines, warehouse inventory accountability ($45M+ property book), tactical convoy dispatch, and vendor procurement under austere deadlines.",
    militarySkills: [
      "GCSS-Army / ERP Inventory Accountability",
      "Multi-Modal Freight & Fleet Dispatch",
      "Hazardous Materials & Cold-Chain Storage",
      "Vendor Contract Compliance & Readiness",
      "Cross-Functional Team Leadership (25+ Personnel)"
    ],
    civilianRoles: [
      { title: "Supply Chain Manager", matchScore: 98, salaryBand: "$112,000 - $148,000 / yr", demandLevel: "High Demand" },
      { title: "Logistics Director", matchScore: 96, salaryBand: "$135,000 - $175,000 / yr", demandLevel: "Urgent Fill" },
      { title: "Operations Manager", matchScore: 95, salaryBand: "$105,000 - $142,000 / yr", demandLevel: "High Demand" },
      { title: "Program Manager", matchScore: 92, salaryBand: "$120,000 - $160,000 / yr", demandLevel: "Active Hiring" },
      { title: "Procurement Specialist", matchScore: 91, salaryBand: "$92,000 - $125,000 / yr", demandLevel: "High Demand" }
    ],
    skillGaps: [
      "Commercial SAP S/4HANA / Oracle NetSuite Civilian Terminology",
      "GAAP Commercial Inventory Costing & 3PL SLA Negotiation"
    ],
    recommendedTraining: [
      { title: "APICS Certified Supply Chain Professional (CSCP)", provider: "ASCM / Army COOL", duration: "8 Weeks", funding: "GI Bill / DoD COOL Covered" },
      { title: "Lean Six Sigma Black Belt (LSSBB)", provider: "IVMF Onward to Opportunity (O2O)", duration: "6 Weeks", funding: "100% Free for Veterans" },
      { title: "SBA Boots to Business: Logistics & Franchise Operations", provider: "U.S. SBA & VetFran", duration: "2-Day Intensive", funding: "No-Cost Federal Program" }
    ],
    matchingFranchiseCategories: ["Transportation and Logistics", "Home Improvement", "Automotive Services", "Cleaning Services"]
  },
  {
    id: "cyber_17c",
    code: "MOS 17C / 25B / AFSC 1B4X1 / CTN",
    branch: "U.S. Cyber Command / Army / Air Force / Navy",
    militaryTitle: "Cyber Operations, C4ISR & Information Warfare Specialist",
    summary: "Executed defensive/offensive cyber operations, SIEM threat hunting, NIST RMF continuous ATO accreditation, and zero-trust enclave hardening across classified DoD networks.",
    militarySkills: [
      "Active TS/SCI Clearance & Zero-Trust Architecture",
      "Defensive Cyberspace Operations (DCO) & Incident Response",
      "NIST SP 800-53 RMF / eMASS Continuous ATO",
      "Vulnerability Assessment & Red/Blue Team Operations",
      "Tactical SATCOM & Cryptographic Key Management"
    ],
    civilianRoles: [
      { title: "Principal Zero-Trust Cybersecurity Architect", matchScore: 99, salaryBand: "$168,000 - $225,000 / yr", demandLevel: "Critical Need" },
      { title: "Cloud Security & DevSecOps Lead", matchScore: 96, salaryBand: "$155,000 - $205,000 / yr", demandLevel: "High Demand" },
      { title: "Threat Intelligence & SOC Manager", matchScore: 95, salaryBand: "$145,000 - $190,000 / yr", demandLevel: "Urgent Fill" },
      { title: "Federal GovCon RMF / CMMC Practice Lead", matchScore: 94, salaryBand: "$140,000 - $185,000 / yr", demandLevel: "High Demand" },
      { title: "OT / ICS Industrial Security Specialist", matchScore: 91, salaryBand: "$135,000 - $178,000 / yr", demandLevel: "Active Hiring" }
    ],
    skillGaps: [
      "Commercial Cloud Cost FinOps (AWS/Azure/GCP Commercial Tenants)",
      "SEC Cyber Risk Governance & Commercial SOC2 / ISO 27001 Auditing"
    ],
    recommendedTraining: [
      { title: "CISSP / GIAC GICSP Industrial Cyber Certification", provider: "SANS VetSuccess / IVMF", duration: "10 Weeks", funding: "DoD COOL / VA VET TEC" },
      { title: "CMMC Certified Assessor & GovCon SDVOSB Capture", provider: "SBA VBOC & Cyber AB", duration: "4 Weeks", funding: "Veteran Scholarship" }
    ],
    matchingFranchiseCategories: ["Technology Services", "Business Consulting", "Education and Tutoring"]
  },
  {
    id: "medic_68w",
    code: "MOS 68W / Navy HM / AFSC 4N0X1",
    branch: "U.S. Army / U.S. Navy / U.S. Air Force",
    militaryTitle: "Combat Medic, Hospital Corpsman & Emergency Trauma Specialist",
    summary: "Delivered emergency trauma stabilization, primary clinical care, immunization readiness, and field clinic operations for 800+ personnel.",
    militarySkills: [
      "Tactical Combat Casualty Care (TCCC) & NREMT",
      "Clinical Triage, Phlebotomy & IV Therapy",
      "Medical Clinic Operations & HIPAA Readiness",
      "Emergency Evacuation & Flight Line Medevac",
      "Patient Advocacy & Behavioral Health Support"
    ],
    civilianRoles: [
      { title: "Clinical Operations & Emergency Department Manager", matchScore: 96, salaryBand: "$98,000 - $138,000 / yr", demandLevel: "Urgent Fill" },
      { title: "Registered Nurse (BSN Bridge) / Physician Assistant Pathway", matchScore: 95, salaryBand: "$94,000 - $145,000 / yr", demandLevel: "Critical Need" },
      { title: "Medical Device Clinical Field Specialist", matchScore: 93, salaryBand: "$105,000 - $150,000 / yr", demandLevel: "High Demand" },
      { title: "Senior Care & Healthcare Franchise Operations Director", matchScore: 92, salaryBand: "$92,000 - $130,000 / yr", demandLevel: "High Demand" },
      { title: "Paramedic Supervisor / EMS Battalion Chief", matchScore: 90, salaryBand: "$85,000 - $118,000 / yr", demandLevel: "Active Hiring" }
    ],
    skillGaps: [
      "State Civilian RN / LPN / PA Reciprocity Licensing Exam",
      "Commercial Medicare/Medicaid ICD-10 Revenue Cycle Billing"
    ],
    recommendedTraining: [
      { title: "Military Medic/Corpsman-to-BSN / PA Accelerated Bridge", provider: "VA Health Professions Scholarship", duration: "12–18 Months", funding: "Post-9/11 GI Bill + Stipend" },
      { title: "Certified Medical Practice Executive (CMPE)", provider: "MGMA / DoD SkillBridge", duration: "8 Weeks", funding: "SkillBridge Sponsored" }
    ],
    matchingFranchiseCategories: ["Healthcare and Wellness", "Senior Care", "Fitness and Gyms"]
  },
  {
    id: "aviation_mech_15t",
    code: "MOS 15T / AFSC 2A / Navy AD/AM/ETN",
    branch: "U.S. Air Force / Navy / Marines / Army Aviation",
    militaryTitle: "Aviation Maintenance, Naval Nuclear & Heavy Mechanical Technician",
    summary: "Maintained rotary/fixed-wing aircraft, gas turbine propulsion, avionics, and high-voltage nuclear/electrical distribution with zero safety incidents.",
    militarySkills: [
      "Turbine Powerplant, Hydraulics & Avionics Troubleshooting",
      "High-Voltage Electrical & Preventive Maintenance (PMS)",
      "Root-Cause Failure Analysis & Blueprint Schematics",
      "Quality Assurance Inspection (QAR / CDQAR)",
      "OSHA / NAVOSH Lockout-Tagout (LOTO) Safety"
    ],
    civilianRoles: [
      { title: "FAA A&P Lead Aircraft Maintenance Technician", matchScore: 98, salaryBand: "$108,000 - $152,000 / yr", demandLevel: "Critical Need" },
      { title: "Hyperscale Data Center Critical Facilities Engineer", matchScore: 96, salaryBand: "$118,000 - $162,000 / yr", demandLevel: "Urgent Fill" },
      { title: "Regional Maintenance & Fleet Engineering Director", matchScore: 94, salaryBand: "$115,000 - $155,000 / yr", demandLevel: "High Demand" },
      { title: "Multi-Unit Home Service / HVAC / Auto Franchise Owner", matchScore: 93, salaryBand: "$120,000 - $210,000 / yr (Owner)", demandLevel: "VetFran Priority" },
      { title: "NERC Substation & Renewable Grid Commissioning Lead", matchScore: 91, salaryBand: "$112,000 - $148,000 / yr", demandLevel: "High Demand" }
    ],
    skillGaps: [
      "FAA Form 8610-2 Airframe & Powerplant (A&P) Oral & Practical Sign-Off",
      "Commercial ServiceTitan Dispatch & Multi-Tech P&L Management"
    ],
    recommendedTraining: [
      { title: "FAA Part 65 Military-to-A&P Fast-Track Prep", provider: "JSAMTCC / AF COOL", duration: "2 Weeks", funding: "100% DoD COOL Funded" },
      { title: "VetFran Home-Service & Automotive Franchise Academy", provider: "IFA Foundation & VetFran", duration: "4 Weeks", funding: "Free for Transitioning Vets" }
    ],
    matchingFranchiseCategories: ["Home Improvement", "Automotive Services", "Cleaning Services", "Real Estate"]
  },
  {
    id: "combat_arms_11b",
    code: "MOS 11B / 18X / 0311 / O-3 Tactical Command",
    branch: "U.S. Army / Marine Corps / Special Operations",
    militaryTitle: "Combat Arms, Tactical Operations & Mission Command Leader",
    summary: "Led 40–150 personnel in high-stress operational environments, managing training readiness, risk mitigation, operational planning (MDMP), and multi-million-dollar organizational assets.",
    militarySkills: [
      "Mission Command & High-Stakes Decision Making",
      "Military Decision Making Process (MDMP) & Operations Planning",
      "Personnel Development, Recruiting & Retention",
      "Physical Security, Threat Assessment & Crisis Response",
      "SOP Execution & Multi-Unit Coordination"
    ],
    civilianRoles: [
      { title: "Operations Director / Regional General Manager", matchScore: 97, salaryBand: "$125,000 - $172,000 / yr", demandLevel: "High Demand" },
      { title: "Enterprise Project / Program Manager (PMP)", matchScore: 95, salaryBand: "$118,000 - $158,000 / yr", demandLevel: "Urgent Fill" },
      { title: "Multi-Unit Franchise Owner / Area Developer", matchScore: 95, salaryBand: "$115,000 - $240,000 / yr (Owner)", demandLevel: "VetFran Priority" },
      { title: "Corporate Security & Executive Protection Director", matchScore: 93, salaryBand: "$122,000 - $165,000 / yr", demandLevel: "Active Hiring" },
      { title: "Construction / Field Operations Superintendent", matchScore: 91, salaryBand: "$105,000 - $145,000 / yr", demandLevel: "High Demand" }
    ],
    skillGaps: [
      "Commercial P&L Financial Statements (EBITDA, COGS, SGA)",
      "PMI PMP Agile/Scrum Corporate Governance Framework"
    ],
    recommendedTraining: [
      { title: "Project Management Professional (PMP)® Bootcamp", provider: "IVMF Syracuse University (O2O)", duration: "6 Weeks", funding: "100% Free for Veterans" },
      { title: "Veterans Business Battle & Entrepreneurship Fellowship", provider: "Rice University / SBA VBOC", duration: "8 Weeks", funding: "Fellowship Grant" }
    ],
    matchingFranchiseCategories: ["Fitness and Gyms", "Food and Restaurants", "Fast Food", "Home Improvement", "Cleaning Services"]
  }
]

// ─── 4. VETERAN PROFILES, MENTORS & ENTREPRENEURS DIRECTORY ─────────────────
interface VeteranMemberProfile {
  id: string
  name: string
  branch: string
  rankAndCode: string
  category: string
  headline: string
  location: string
  avatar: string
  verificationStatus: "Optional Military Verified (Privacy-Safe)" | "SBA VetCert SDVOSB Verified" | "VetFran Multi-Unit Owner"
  openToBusinessOwnership: boolean
  investmentBudget?: string
  skills: string[]
  mentorshipOffer: string
}

const VETERAN_PROFILES: VeteranMemberProfile[] = [
  {
    id: "vet_1",
    name: "Marcus Vance, PMP (USMC Ret.)",
    branch: "U.S. Marine Corps",
    rankAndCode: "Maj (O-4) · MOS 0402 Logistics Officer",
    category: "Veteran Franchise Owners",
    headline: "Multi-Unit Home Service Franchise Owner (6 Locations) & VetFran Mentor · Former USMC Logistics Officer",
    location: "Austin, TX",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80",
    verificationStatus: "VetFran Multi-Unit Owner",
    openToBusinessOwnership: true,
    investmentBudget: "$150,000 - $350,000",
    skills: ["Multi-Unit Franchise P&L", "VetFran SBA 7(a) Acquisition", "ServiceTitan Dispatch", "USMC Logistics Transition"],
    mentorshipOffer: "1-on-1 FDD Item 19 review & SBA Veteran Loan guidance for transitioning officers/NCOs"
  },
  {
    id: "vet_2",
    name: "Elena Rostova, CISSP (USAF Veteran)",
    branch: "U.S. Air Force",
    rankAndCode: "MSgt (E-7) · AFSC 1B4X1 Cyber Warfare",
    category: "Veteran Cybersecurity Professionals",
    headline: "Founder & CEO @ Aegis Valor SDVOSB · Zero-Trust C4ISR & DoD SkillBridge Host Employer (TS/SCI)",
    location: "Arlington, VA (Pentagon Corridor)",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80",
    verificationStatus: "SBA VetCert SDVOSB Verified",
    openToBusinessOwnership: true,
    investmentBudget: "$250,000+",
    skills: ["SBA VetCert SDVOSB", "FAR 19.14 Sole-Source", "NIST RMF cATO", "DoD SkillBridge Host"],
    mentorshipOffer: "Mentoring veterans on SDVOSB federal contracting & cleared cyber transition"
  },
  {
    id: "vet_3",
    name: "Devon Brooks (U.S. Army Veteran)",
    branch: "U.S. Army",
    rankAndCode: "SFC (E-7) · MOS 92A Automated Logistical Specialist",
    category: "Military-to-Civilian Career Transition",
    headline: "Transitioning Logistics & Fleet Operations Leader · Seeking Supply Chain Director or $100k Budget Franchise",
    location: "Norfolk, VA / Charlotte, NC",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80",
    verificationStatus: "Optional Military Verified (Privacy-Safe)",
    openToBusinessOwnership: true,
    investmentBudget: "$100,000",
    skills: ["Supply Chain Management", "Fleet Maintenance Readiness", "OSHA 30", "SBA Boots to Business Grad"],
    mentorshipOffer: "Peer lead for 180-day DoD SkillBridge cohort & MOS 92A/88M transition group"
  },
  {
    id: "vet_4",
    name: "Cmdr.Grant Holloway (U.S. Navy Ret.)",
    branch: "U.S. Navy",
    rankAndCode: "CDR (O-5) · Naval Reactors / Submarine Engineering",
    category: "Veteran Investors",
    headline: "Managing Partner @ Valor Frontier Capital · Investing in Veteran-Led Startups, SDVOSBs & Multi-Unit Franchises",
    location: "San Diego, CA",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80",
    verificationStatus: "Optional Military Verified (Privacy-Safe)",
    openToBusinessOwnership: true,
    investmentBudget: "$500,000+",
    skills: ["Veteran Angel Investing", "Franchise Area Development", "SBA Rollup Co-Investing", "Veterans Business Battle Judge"],
    mentorshipOffer: "Pitch deck & franchise capital stack reviews for Veteran Founders"
  },
  {
    id: "vet_5",
    name: "Dr. Simone Carter, DNP (U.S. Army 68W Vet)",
    branch: "U.S. Army",
    rankAndCode: "SSG (E-6) · Former 68W Combat Medic",
    category: "Veteran Entrepreneurs",
    headline: "Owner of 3 Senior Home-Care & Wellness Franchise Locations · 68W Medic-to-Healthcare Entrepreneur",
    location: "Atlanta, GA",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80",
    verificationStatus: "VetFran Multi-Unit Owner",
    openToBusinessOwnership: true,
    investmentBudget: "$100,000 - $200,000",
    skills: ["Senior Care Franchise Ops", "VA Community Care Network Billing", "CNA/RN Hiring", "VetFran Ambassador"],
    mentorshipOffer: "Helping 68W Medics & Navy Corpsmen launch healthcare & senior-care franchises"
  },
  {
    id: "vet_6",
    name: "Carlos Mendez (USCG Veteran)",
    branch: "U.S. Coast Guard",
    rankAndCode: "MKC (E-7) · Chief Machinery Technician",
    category: "Veteran Mentors",
    headline: "SCORE Certified Veteran Business Mentor & Commercial HVAC/Marine Service Founder",
    location: "Tampa, FL",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80",
    verificationStatus: "SBA VetCert SDVOSB Verified",
    openToBusinessOwnership: true,
    investmentBudget: "$100,000 - $250,000",
    skills: ["SCORE Franchise & SMB Advisory", "EPA 608 / Commercial HVAC", "Maritime Diesel", "B2B Service Contracts"],
    mentorshipOffer: "Free weekly SCORE & VBOC business plan reviews for transitioning mechanics & tradespeople"
  }
]

// ─── 5. FRANCHISE DIRECTORY & OPPORTUNITIES (WITH FDD & VETFRAN DATA) ───────
export interface FranchiseListingItem {
  id: string
  brandName: string
  industryCategory: string
  headline: string
  logo: string
  minLiquidCapital: number
  minNetWorth: number
  totalInvestmentMin: number
  totalInvestmentMax: number
  initialFranchiseFee: number
  royaltyFee: string
  vetFranIncentive: string
  fddItem19Status: string
  availableTerritories: string[]
  veteranOwnersCount: number
  isResaleAvailable?: boolean
  resalePrice?: string
  supplierPartners: string[]
}

const FRANCHISE_OPPORTUNITIES: FranchiseListingItem[] = [
  {
    id: "fran_neighborly_trades",
    brandName: "Neighborly Home & Commercial Trade Brands (Mr. Electric / Mr. Rooter / Aire Serv)",
    industryCategory: "Home Improvement",
    headline: "Recession-Resilient Residential & Commercial MEP Service Franchise System with Built-In National Accounts",
    logo: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=160&auto=format&fit=crop&q=80",
    minLiquidCapital: 65000,
    minNetWorth: 175000,
    totalInvestmentMin: 92000,
    totalInvestmentMax: 215000,
    initialFranchiseFee: 45000,
    royaltyFee: "5% – 6% of Gross Sales",
    vetFranIncentive: "Advertised Incentive: 20% off Initial Franchise Fee ($9,000 savings) for Qualified Veterans (5-Star VetFran Member)",
    fddItem19Status: "FDD Item 19 Financial Performance Representation Included (2026 Filing Verified)",
    availableTerritories: ["Texas", "Virginia / DC", "Florida", "North Carolina", "Georgia", "Ohio", "Arizona"],
    veteranOwnersCount: 142,
    isResaleAvailable: true,
    resalePrice: "$185,000 (Existing 4-Van Territory in Richmond, VA)",
    supplierPartners: ["ServiceTitan Dispatch", "Ferguson Plumbing/HVAC Supply", "Ford Pro Commercial Fleet"]
  },
  {
    id: "fran_servpro_restoration",
    brandName: "Premier Disaster Restoration & Commercial Mitigation Franchise",
    industryCategory: "Cleaning Services",
    headline: "24/7 Insurance-Backed Water, Fire, Storm & Biohazard Restoration with National Insurance Carrier DRP Feeds",
    logo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=160&auto=format&fit=crop&q=80",
    minLiquidCapital: 75000,
    minNetWorth: 200000,
    totalInvestmentMin: 98000,
    totalInvestmentMax: 245000,
    initialFranchiseFee: 52000,
    royaltyFee: "4% – 7% Tiered Royalty",
    vetFranIncentive: "Advertised Incentive: 25% Military Discount on Initial Franchise Fee ($13,000 savings)",
    fddItem19Status: "FDD Item 19 Gross Volume Quartiles Disclosed in Section 19",
    availableTerritories: ["Maryland", "Pennsylvania", "Tennessee", "Colorado", "Washington", "Midwest Hubs"],
    veteranOwnersCount: 98,
    isResaleAvailable: false,
    supplierPartners: ["Xactimate Estimating", "Phoenix Restoration Equipment", "Ecolab Bio-Clean"]
  },
  {
    id: "fran_senior_care_valor",
    brandName: "Honor & Home-Stead Senior In-Home Care Network",
    industryCategory: "Senior Care",
    headline: "Non-Medical & Skilled Senior In-Home Care Franchise · Approved for VA Community Care Network & Long-Term Care",
    logo: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=160&auto=format&fit=crop&q=80",
    minLiquidCapital: 55000,
    minNetWorth: 150000,
    totalInvestmentMin: 78000,
    totalInvestmentMax: 145000,
    initialFranchiseFee: 49000,
    royaltyFee: "5% Continuing Royalty",
    vetFranIncentive: "Advertised Incentive: 20% off Franchise Fee ($9,800 off) + VA Aid & Attendance Billing Playbook",
    fddItem19Status: "FDD Item 19 Disclosed (Median & Top Quartile Agency Revenue)",
    availableTerritories: ["Georgia", "Florida", "Virginia", "California", "New York", "Illinois"],
    veteranOwnersCount: 76,
    isResaleAvailable: true,
    resalePrice: "$140,000 (Active 38-Client Agency in Jacksonville, FL)",
    supplierPartners: ["AxisCare Home Care CRM", "McKesson Medical Supplies", "ADP Caregiver Payroll"]
  },
  {
    id: "fran_auto_fleet_caliber",
    brandName: "Driven Fleet, Brake, Tire & EV Diagnostic Center Franchise",
    industryCategory: "Automotive Services",
    headline: "High-Bay B2B Commercial Fleet & Consumer Automotive Repair with National Fleet Management Billing",
    logo: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=160&auto=format&fit=crop&q=80",
    minLiquidCapital: 90000,
    minNetWorth: 280000,
    totalInvestmentMin: 145000,
    totalInvestmentMax: 380000,
    initialFranchiseFee: 40000,
    royaltyFee: "5% of Gross Revenue",
    vetFranIncentive: "Advertised Incentive: 50% off First Unit Franchise Fee ($20,000 off) for Honorably Discharged Veterans",
    fddItem19Status: "FDD Item 19 Average Repair Order (ARO) & Bay Revenue Disclosed",
    availableTerritories: ["Texas", "Indiana", "North Carolina", "Missouri", "Arizona", "Nevada"],
    veteranOwnersCount: 64,
    isResaleAvailable: true,
    resalePrice: "$295,000 (Turnkey 8-Bay Shop in San Antonio, TX)",
    supplierPartners: ["Snap-on Industrial", "Hunter Engineering Alignment", "NAPA Commercial ProLink"]
  },
  {
    id: "fran_coffee_qsr_bunker",
    brandName: "Valor Roast Specialty Coffee & Drive-Thru Café",
    industryCategory: "Coffee Shops",
    headline: "Compact 900 sq. ft. Double-Lane Drive-Thru & Roastery Café Built for High Morning Commuter Throughput",
    logo: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=160&auto=format&fit=crop&q=80",
    minLiquidCapital: 80000,
    minNetWorth: 250000,
    totalInvestmentMin: 115000,
    totalInvestmentMax: 310000,
    initialFranchiseFee: 35000,
    royaltyFee: "5.5% Royalty + 1.5% Brand Fund",
    vetFranIncentive: "Advertised Incentive: $10,000 off Initial Franchise Fee + Equipment Lease Rebate",
    fddItem19Status: "FDD Item 19 Drive-Thru Unit Economics & COGS Disclosed",
    availableTerritories: ["Southeast US", "Mid-Atlantic", "Midwest", "Mountain West"],
    veteranOwnersCount: 51,
    isResaleAvailable: false,
    supplierPartners: ["La Marzocco Commercial Espresso", "Toast QSR Drive-Thru POS", "Sysco Specialty Beverage"]
  },
  {
    id: "fran_tactical_fitness_gym",
    brandName: "Iron Forge Strength, Functional Fitness & Recovery Studio",
    industryCategory: "Fitness and Gyms",
    headline: "24/7 Smart-Access Strength Training, Physical Therapy Recovery & Recurring EFT Membership Model",
    logo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=160&auto=format&fit=crop&q=80",
    minLiquidCapital: 70000,
    minNetWorth: 200000,
    totalInvestmentMin: 95000,
    totalInvestmentMax: 260000,
    initialFranchiseFee: 39500,
    royaltyFee: "6% Continuing Royalty",
    vetFranIncentive: "Advertised Incentive: 30% off Initial Franchise Fee + Free Presale Marketing Playbook",
    fddItem19Status: "FDD Item 19 Member EFT Retention & Studio EBITDA Disclosed",
    availableTerritories: ["Florida", "Texas", "Virginia", "California", "South Carolina", "Tennessee"],
    veteranOwnersCount: 83,
    isResaleAvailable: true,
    resalePrice: "$165,000 (480 Active EFT Members in Tampa, FL)",
    supplierPartners: ["Rogue Commercial Outfitting", "ClubReady / Mindbody CRM", "Normatec Recovery Systems"]
  },
  {
    id: "fran_cyber_msp_tech",
    brandName: "ShieldPoint Managed IT, Cybersecurity & CMMC Franchise",
    industryCategory: "Technology Services",
    headline: "B2B Managed Service Provider (MSP) & CMMC Compliance Franchise Serving SMBs, Medical Clinics & Contractors",
    logo: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=160&auto=format&fit=crop&q=80",
    minLiquidCapital: 45000,
    minNetWorth: 120000,
    totalInvestmentMin: 68000,
    totalInvestmentMax: 118000,
    initialFranchiseFee: 38000,
    royaltyFee: "6% of Monthly Recurring Revenue (MRR)",
    vetFranIncentive: "Advertised Incentive: 25% off Franchise Fee for Cyber/IT Veterans ($9,500 off)",
    fddItem19Status: "FDD Item 19 B2B Monthly Recurring Contract Metrics Disclosed",
    availableTerritories: ["Nationwide US Metro Territories", "UK", "Canada", "Australia"],
    veteranOwnersCount: 47,
    isResaleAvailable: false,
    supplierPartners: ["CrowdStrike Falcon MSP", "ConnectWise PSA", "Pax8 Cloud Marketplace"]
  },
  {
    id: "fran_logistics_3pl_freight",
    brandName: "Vanguard Final-Mile, Freight Brokerage & 3PL Franchise",
    industryCategory: "Transportation and Logistics",
    headline: "Asset-Light Freight Brokerage & Final-Mile Commercial Delivery Franchise with National Shipper Contracts",
    logo: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=160&auto=format&fit=crop&q=80",
    minLiquidCapital: 50000,
    minNetWorth: 140000,
    totalInvestmentMin: 72000,
    totalInvestmentMax: 135000,
    initialFranchiseFee: 42000,
    royaltyFee: "5% Gross Margin Share",
    vetFranIncentive: "Advertised Incentive: 25% Military Fee Waiver ($10,500 off) for Logistics MOS Veterans",
    fddItem19Status: "FDD Item 19 Gross Freight Margin & Lane Volume Disclosed",
    availableTerritories: ["All Major Port, Rail & Interstate Corridors"],
    veteranOwnersCount: 69,
    isResaleAvailable: false,
    supplierPartners: ["DAT Freight Analytics", "McLeod TMS Software", "WEX Commercial Fleet Cards"]
  }
]

// ─── 6. EXTERNAL PARTNERSHIPS & RESOURCE INTEGRATIONS ───────────────────────
const EXTERNAL_PARTNERSHIPS = [
  {
    name: "U.S. Small Business Administration (SBA) — Boots to Business",
    category: "Veteran Business Support & Training",
    description: "Entrepreneurship education and training program offered by the SBA as part of the DoD Transition Assistance Program (TAP), plus SBA VetCert (SDVOSB/VOSB) and 7(a) Veteran Advantage loans.",
    url: "https://www.sba.gov/counseling/boots-to-business/",
    badge: "Official Federal Resource"
  },
  {
    name: "VetFran (International Franchise Association)",
    category: "Veteran-Friendly Franchise Opportunities",
    description: "Connects transitioning service members, veterans, and military spouses with 650+ IFA member franchise brands offering financial discounts, mentorship, and franchise ownership pathways.",
    url: "https://www.franchise.org/franchising-for-veterans/",
    badge: "650+ Franchise Brands"
  },
  {
    name: "SCORE Business Mentorship",
    category: "Free 1-on-1 Business & Franchise Mentorship",
    description: "Nation's largest network of volunteer, expert business mentors providing free, confidential business plan reviews, FDD financial modeling, and startup advisory.",
    url: "https://www.score.org/",
    badge: "10,000+ Mentors"
  },
  {
    name: "Veterans Business Outreach Centers (VBOC)",
    category: "Regional Veteran Entrepreneurship Support",
    description: "One-stop hubs across the U.S. providing transition assistance, feasibility analysis, concept assessments, and federal contracting registration.",
    url: "https://www.sba.gov/local-assistance/resource-partners/veterans-business-outreach-center-vboc-program",
    badge: "Regional Hubs"
  },
  {
    name: "Institute for Veterans and Military Families (IVMF — Syracuse University)",
    category: "Entrepreneurship Education & Industry Certifications",
    description: "Delivers no-cost industry certifications (PMP, Six Sigma, Cyber) via Onward to Opportunity (O2O) and national entrepreneurship bootcamps (STRIVE, EBV, V-WISE).",
    url: "https://ivmf.syracuse.edu/",
    badge: "No-Cost Certs & Bootcamps"
  },
  {
    name: "International Franchise Association (IFA)",
    category: "Franchise Industry Standards & CFE Governance",
    description: "Global trade association promoting ethical franchising, FDD transparency, Certified Franchise Executive (CFE) credentials, and franchisee-franchisor alignment.",
    url: "https://www.franchise.org/",
    badge: "Industry Standard"
  }
]

// ─── 7. BROADER BUSINESS & PROFESSIONAL NETWORKS ECOSYSTEM (10 NETWORKS) ─────
const ECOSYSTEM_COMMUNITY_MODULES = [
  { id: "veterans", icon: "🎖️", name: "Veterans Networks", status: "Active Core Module", members: "18,400+ Verified", desc: "Military-to-civilian transition, MOS translator, SDVOSB contracting & VetFran ownership." },
  { id: "franchises", icon: "🏪", name: "Franchise Networks", status: "Active Core Module", members: "14,200+ Verified", desc: "Franchisors, multi-unit franchisees, FDD Item 19 analytics, resales, lenders & suppliers." },
  { id: "minority_business", icon: "🌍", name: "Minority Business Networks (MBE / 8a)", status: "Configurable Module Ready", members: "9,800+ Verified", desc: "NMSDC MBE certification, SBA 8(a) business development, supplier diversity RFPs & growth capital." },
  { id: "women_entrepreneurs", icon: "👩‍💼", name: "Women Entrepreneurs Networks (WOSB / WBENC)", status: "Configurable Module Ready", members: "11,500+ Verified", desc: "WBENC & SBA WOSB contracting, female founder venture syndicates & executive board placement." },
  { id: "small_business", icon: "🛠️", name: "Small Business & Main Street Networks", status: "Configurable Module Ready", members: "24,600+ Verified", desc: "Local service contractors, independent retailers, SBA 504 commercial real estate & B2B bartering." },
  { id: "investor_networks", icon: "📈", name: "Investor & Private Capital Networks", status: "Configurable Module Ready", members: "6,300+ Verified", desc: "Accredited angel syndicates, multi-unit franchise PE rollups, search funds (ETA) & family offices." },
  { id: "startup_founders", icon: "🚀", name: "Startup & Founder Networks", status: "Configurable Module Ready", members: "15,100+ Verified", desc: "Technical co-founder matching, SBIR/STTR dual-use defense grants & customer discovery." },
  { id: "nonprofit_networks", icon: "🤝", name: "Nonprofit & Civic Impact Networks", status: "Configurable Module Ready", members: "5,400+ Verified", desc: "501(c)(3) VSOs, foundation grantmakers, CSR corporate sponsors & board governance." },
  { id: "professional_associations", icon: "🏛️", name: "Professional Associations & Guilds", status: "Configurable Module Ready", members: "31,000+ Verified", desc: "Trade unions, state licensing boards, continuing education CEU tracking & peer credentialing." },
  { id: "international_business", icon: "🌐", name: "International Business & Export Networks", status: "Configurable Module Ready", members: "12,900+ Verified", desc: "Cross-border master franchising, EXIM Bank trade finance, customs brokers & 46-country hubs." }
]

const DEVELOPER_ARCHITECTURE_ENGINES = [
  { module: "Veterans Engine", components: "Veteran profiles, service history, MOS/AFSC/NEC skills translation, optional privacy-safe verification", status: "Live" },
  { module: "Franchise Engine", components: "Franchisor directory, FDD Item 7/19 opportunities, multi-unit franchisee profiles, resales & suppliers", status: "Live" },
  { module: "Opportunity Engine", components: "Veteran jobs, franchise investments, SDVOSB set-aside contracts & business acquisitions", status: "Live" },
  { module: "Mentorship Engine", components: "Veteran & franchise mentor registration, 1-on-1 matching, FDD validation calls & SCORE/VBOC sessions", status: "Live" },
  { module: "AI Matching Engine", components: "7-way recommendation & ranking across Veteran→Employer, Veteran→Franchise, Investor→Franchise & Suppliers", status: "Live" },
  { module: "Organization Engine", components: "VSO associations, franchisor systems, SBA/VetFran resource partners & vendor co-ops", status: "Live" },
  { module: "Verification Engine", components: "Optional privacy-conscious military verification (no raw DD-214 exposure) & FTC 14-day FDD compliance", status: "Live" },
  { module: "Messaging Engine", components: "Direct messaging with veteran franchise owners, franchisor discovery days & community groups", status: "Live" },
  { module: "Analytics Engine", components: "Engagement, transition conversions, franchise inquiry pipelines & network growth telemetry", status: "Live" }
]

export function VeteransAndFranchiseNetworksView({
  currentUser,
  initialSection = "veterans",
  onNavigateTab,
  onOpenDirectMessage
}: VeteransAndFranchiseNetworksViewProps) {
  const [activeSection, setActiveSection] = useState<"veterans" | "franchises" | "bridge" | "ai_matching" | "ecosystem">(initialSection)

  // Veterans Network State
  const [selectedVetCategory, setSelectedVetCategory] = useState<string>("All Veteran Tracks")
  const [selectedMosPresetId, setSelectedMosPresetId] = useState<string>("logistics_92a")
  const [customMosInput, setCustomMosInput] = useState<string>("")
  const [vetOwnershipReady, setVetOwnershipReady] = useState<boolean>(true)
  const [vetPrivacyVerified, setVetPrivacyVerified] = useState<boolean>(true)

  // Franchise Network State
  const [selectedFranchiseIndustry, setSelectedFranchiseIndustry] = useState<string>("All Industries")
  const [franchiseSubView, setFranchiseSubView] = useState<"directory" | "resales" | "suppliers" | "financing">("directory")

  // Shared Bridge (Veteran Franchise & Business Opportunities) State
  const [bridgeBudgetMax, setBridgeBudgetMax] = useState<number>(100000)
  const [bridgeLocation, setBridgeLocation] = useState<string>("All Locations")
  const [bridgeIndustry, setBridgeIndustry] = useState<string>("All Industries")
  const [comparedIds, setComparedIds] = useState<string[]>(["fran_neighborly_trades", "fran_senior_care_valor"])

  // Modals (FTC 14-Day FDD Viewer & Report Misleading Opportunity)
  const [fddModalListing, setFddModalListing] = useState<FranchiseListingItem | null>(null)
  const [reportModalTarget, setReportModalTarget] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState<string>("Unverified earnings claim / Missing FDD Item 19 support")
  const [reportSubmitted, setReportSubmitted] = useState<boolean>(false)

  // Sync when initialSection prop changes (e.g. clicking Veterans vs Franchises in top navbar)
  React.useEffect(() => {
    setActiveSection(initialSection)
  }, [initialSection])

  const activeMosPreset = useMemo(() => {
    if (customMosInput.trim()) {
      const q = customMosInput.toLowerCase()
      const found = MILITARY_TRANSLATION_PRESETS.find(
        (p) =>
          p.code.toLowerCase().includes(q) ||
          p.militaryTitle.toLowerCase().includes(q) ||
          p.militarySkills.some((s) => s.toLowerCase().includes(q))
      )
      if (found) return found
    }
    return MILITARY_TRANSLATION_PRESETS.find((p) => p.id === selectedMosPresetId) || MILITARY_TRANSLATION_PRESETS[0]
  }, [selectedMosPresetId, customMosInput])

  const filteredVeterans = useMemo(() => {
    if (selectedVetCategory === "All Veteran Tracks") return VETERAN_PROFILES
    return VETERAN_PROFILES.filter((v) => v.category === selectedVetCategory)
  }, [selectedVetCategory])

  const filteredFranchises = useMemo(() => {
    return FRANCHISE_OPPORTUNITIES.filter((f) => {
      if (selectedFranchiseIndustry !== "All Industries" && f.industryCategory !== selectedFranchiseIndustry) {
        return false
      }
      if (franchiseSubView === "resales" && !f.isResaleAvailable) {
        return false
      }
      return true
    })
  }, [selectedFranchiseIndustry, franchiseSubView])

  const bridgeMatchedFranchises = useMemo(() => {
    return FRANCHISE_OPPORTUNITIES.filter((f) => {
      const budgetMatch = f.minLiquidCapital <= bridgeBudgetMax
      const indMatch = bridgeIndustry === "All Industries" || f.industryCategory === bridgeIndustry
      const locMatch =
        bridgeLocation === "All Locations" ||
        f.availableTerritories.some((t) => t.toLowerCase().includes(bridgeLocation.toLowerCase()))
      return budgetMatch && indMatch && locMatch
    })
  }, [bridgeBudgetMax, bridgeIndustry, bridgeLocation])

  const toggleCompareFranchise = (id: string) => {
    setComparedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(-3)))
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20">
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* TOP COMMAND HEADER & 5-PILLAR ECOSYSTEM NAVIGATION                          */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-0.5 text-[11px] font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>🎖️</span>
                <span>ConnectLn Core Community Networks</span>
              </span>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-0.5 text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>FTC 14-Day FDD &amp; Privacy-Safe Verification Active</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              {activeSection === "veterans" && "🎖️ ConnectLn Veterans Network — Careers, Mentorship & Veteran Businesses"}
              {activeSection === "franchises" && "🏪 ConnectLn Franchise Network — Franchisors, Multi-Unit Owners, Investors & Suppliers"}
              {activeSection === "bridge" && "🤝 Veteran Franchise & Business Opportunities — Shared Ownership Bridge"}
              {activeSection === "ai_matching" && "🤖 Unified AI Matching Engine & Military Skills Translator"}
              {activeSection === "ecosystem" && "🌐 ConnectLn Business & Professional Networks Ecosystem (10 Core Communities)"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Dedicated core communities connecting transitioning service members, veterans, SDVOSB founders, multi-unit franchise owners, franchisors, accredited investors, and verified supply-chain partners on one unified identity, messaging, and AI matching infrastructure.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateTab?.("jobs")}
              className="rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Briefcase className="h-3.5 w-3.5 text-amber-400" />
              <span>Veteran &amp; Franchise Jobs</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab?.("messaging")}
              className="rounded-full bg-[#0A66C2] hover:bg-[#004182] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Open Network Messaging</span>
            </button>
          </div>
        </div>

        {/* 5 Core Ecosystem Tabs */}
        <div className="mt-5 pt-4 border-t border-white/15 flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "veterans", icon: "🎖️", label: "1. Veterans Network", badge: "MOS Translator + 10 Tracks" },
            { id: "franchises", icon: "🏪", label: "2. Franchise Network", badge: "18 Industries + FDD Vault" },
            { id: "bridge", icon: "🤝", label: "3. Veteran Franchise & Business Bridge", badge: "$100k Budget Matcher" },
            { id: "ai_matching", icon: "🤖", label: "4. AI Matching Engine", badge: "7-Way Matcher" },
            { id: "ecosystem", icon: "🌐", label: "5. 10-Network Ecosystem & Partnerships", badge: "SBA · VetFran · SCORE" }
          ].map((tab) => {
            const isSelected = activeSection === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as any)}
                className={`rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 border-amber-300 shadow-md"
                    : "bg-slate-800/80 text-slate-200 border-white/10 hover:bg-slate-700/80"
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    isSelected ? "bg-slate-950/20 text-slate-950" : "bg-white/10 text-amber-300"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: CONNECTLN VETERANS NETWORK                                       */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {activeSection === "veterans" && (
        <div className="space-y-6">
          {/* Privacy-Conscious Optional Military Verification & Ownership Readiness Bar */}
          <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/25 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 font-bold text-lg shadow-xs">
                🛡️
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                    Privacy-Conscious Optional Military Credential &amp; Business Ownership Profile
                  </h3>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    Zero Raw DD-214 / SSN Storage
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300">
                  Military-service verification on ConnectLn is strictly optional and privacy-preserving. Sensitive military documents are never exposed publicly.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap shrink-0">
              <button
                type="button"
                onClick={() => setVetPrivacyVerified(!vetPrivacyVerified)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  vetPrivacyVerified
                    ? "bg-emerald-600 text-white border-emerald-700"
                    : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border-zinc-300"
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                <span>{vetPrivacyVerified ? "✓ Optional Veteran Badge Active" : "Enable Optional Veteran Badge"}</span>
              </button>

              <button
                type="button"
                onClick={() => setVetOwnershipReady(!vetOwnershipReady)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  vetOwnershipReady
                    ? "bg-[#0A66C2] text-white border-[#004182]"
                    : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border-zinc-300"
                }`}
              >
                <Store className="h-3.5 w-3.5" />
                <span>{vetOwnershipReady ? "✓ Interested in Business / Franchise Ownership" : "Indicate Franchise Interest"}</span>
              </button>
            </div>
          </div>

          {/* FEATURED AI TOOL: MILITARY SKILLS TRANSLATOR */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    ⚡ AI-Powered Military Skills Translator
                  </span>
                  <span className="text-xs text-zinc-500">MOS · AFSC · NEC · USMC · USCG Crosswalk</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
                  Translate Military Experience into Civilian Careers, Skill Gaps &amp; Franchise Paths
                </h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Maps your actual military specialty to high-paying civilian roles, identifies exact credential gaps, and recommends funded training.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-80">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customMosInput}
                    onChange={(e) => setCustomMosInput(e.target.value)}
                    placeholder="Type MOS/AFSC (e.g. 92A, Logistics, 17C, 68W, 15T)..."
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#0A66C2]"
                  />
                </div>
              </div>
            </div>

            {/* Preset MOS Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[11px] font-bold text-zinc-500 shrink-0">Select Military Specialty:</span>
              {MILITARY_TRANSLATION_PRESETS.map((preset) => {
                const isSelected = activeMosPreset.id === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedMosPresetId(preset.id)
                      setCustomMosInput("")
                    }}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200"
                    }`}
                  >
                    {preset.code} · {preset.militaryTitle}
                  </button>
                )
              })}
            </div>

            {/* Translation Output Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
              {/* Left Column: Military Experience & Identified Skill Gaps */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/50 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                      {activeMosPreset.code}
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-500">{activeMosPreset.branch}</span>
                  </div>
                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                    {activeMosPreset.militaryTitle}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {activeMosPreset.summary}
                  </p>
                  <div className="pt-1 space-y-1">
                    <p className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200">Verified Military Competencies:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {activeMosPreset.militarySkills.map((sk) => (
                        <span
                          key={sk}
                          className="rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300"
                        >
                          ✓ {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Skill Gaps & Recommended Training */}
                <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 p-4 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0A66C2] dark:text-sky-300 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Skill Gap Analysis &amp; Recommended Training</span>
                  </h4>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200">Civilian Bridge Gaps to Close:</p>
                    <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                      {activeMosPreset.skillGaps.map((gap) => (
                        <li key={gap} className="flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200">Recommended Funded Credentials:</p>
                    {activeMosPreset.recommendedTraining.map((tr) => (
                      <div
                        key={tr.title}
                        className="rounded-lg bg-white dark:bg-zinc-900 border border-blue-200/70 dark:border-zinc-800 p-2.5 flex items-center justify-between gap-2"
                      >
                        <div>
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{tr.title}</p>
                          <p className="text-[11px] text-zinc-500">
                            {tr.provider} · {tr.duration}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 shrink-0">
                          {tr.funding}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Top 5 Civilian Role Recommendations + Franchise Match */}
              <div className="lg:col-span-7 space-y-4">
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span>Recommended Civilian Roles for {activeMosPreset.militaryTitle}</span>
                    </h4>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      5 Direct Civilian Matches
                    </span>
                  </div>

                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {activeMosPreset.civilianRoles.map((role) => (
                      <div key={role.title} className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{role.title}</span>
                            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                              {role.matchScore}% Competency Match
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500">
                            Compensation Band: <strong className="text-emerald-600 dark:text-emerald-400">{role.salaryBand}</strong> · {role.demandLevel}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (typeof window !== "undefined") {
                              window.sessionStorage.setItem("connectln_jobs_prefill", role.title)
                            }
                            onNavigateTab?.("jobs")
                          }}
                          className="rounded-full bg-[#0A66C2] hover:bg-[#004182] px-3.5 py-1.5 text-xs font-bold text-white transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
                        >
                          View {role.title} Jobs →
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Matching Franchise Ownership Categories for this MOS */}
                  <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-xl">
                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <span>🏪</span>
                        <span>Matching Franchise Ownership Sectors for Your Military Background:</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {activeMosPreset.matchingFranchiseCategories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setBridgeIndustry(cat)
                              setActiveSection("bridge")
                            }}
                            className="rounded-md bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-700 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 dark:text-amber-300 hover:bg-amber-100 cursor-pointer"
                          >
                            {cat} →
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveSection("bridge")}
                      className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 text-xs font-extrabold shrink-0 cursor-pointer shadow-xs"
                    >
                      Explore Veteran Franchise Bridge →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 10 SPECIALIZED VETERAN CATEGORIES FILTER & DIRECTORY */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                  🎖️ ConnectLn Veterans Directory, Mentors, SDVOSB Founders &amp; Franchise Owners
                </h2>
                <p className="text-xs text-zinc-500">
                  Filter across all 10 specialized veteran categories to connect with peers, mentors, investors, and veteran franchise owners.
                </p>
              </div>
              <span className="text-xs font-bold text-[#0A66C2]">
                {filteredVeterans.length} Featured Veteran Leaders
              </span>
            </div>

            {/* 10 Specialized Veteran Categories Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5">
              {VETERAN_CATEGORIES.map((cat) => {
                const isSelected = selectedVetCategory === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedVetCategory(cat)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                      isSelected
                        ? "bg-[#0A66C2] text-white border-[#0A66C2]"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200"
                    }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>

            {/* Veteran Profiles Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVeterans.map((vet) => (
                <div
                  key={vet.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900 p-4 flex flex-col justify-between gap-3 hover:border-[#0A66C2] transition-all shadow-2xs"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3">
                      <img
                        src={vet.avatar}
                        alt={vet.name}
                        className="h-12 w-12 rounded-xl object-cover border-2 border-amber-500 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="inline-block rounded bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 dark:text-amber-300 mb-1">
                          {vet.branch} · {vet.category}
                        </span>
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {vet.name}
                        </h3>
                        <p className="text-[11px] font-mono text-zinc-500 truncate">{vet.rankAndCode}</p>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {vet.headline}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-[#0A66C2]" />
                        {vet.location}
                      </span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        🛡️ {vet.verificationStatus}
                      </span>
                    </div>

                    <div className="rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 p-2 text-[11px] text-zinc-700 dark:text-zinc-300">
                      <strong className="text-[#0A66C2] dark:text-sky-300">Mentorship &amp; Advisory:</strong> {vet.mentorshipOffer}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {vet.skills.map((s) => (
                        <span
                          key={s}
                          className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-200/70 dark:border-zinc-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenDirectMessage?.({
                          id: vet.id,
                          name: vet.name,
                          headline: vet.headline,
                          avatar: vet.avatar
                        })
                      }
                      className="flex-1 rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white py-1.5 px-3 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Message Veteran
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("bridge")}
                      className="rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 py-1.5 px-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 cursor-pointer"
                    >
                      Request Mentorship
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: CONNECTLN FRANCHISE NETWORK                                      */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {activeSection === "franchises" && (
        <div className="space-y-6">
          {/* Mandatory FTC 14-Calendar-Day FDD & Non-Endorsement Compliance Notice */}
          <div className="rounded-xl border border-blue-200 dark:border-blue-800/70 bg-blue-50/80 dark:bg-blue-950/30 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-zinc-700 dark:text-zinc-200">
                <p className="font-extrabold text-zinc-900 dark:text-white">
                  FTC Franchise Rule Compliance, FDD 14-Day Disclosure &amp; Non-Endorsement Notice
                </p>
                <p className="leading-relaxed">
                  Under the U.S. Federal Trade Commission (FTC) Franchise Rule, franchisors must furnish a complete <strong>Franchise Disclosure Document (FDD) at least 14 calendar days</strong> before you sign any binding agreement or make any payment. ConnectLn distinguishes advertised VetFran incentives from verified FDD Item 7/19 financial terms, does not endorse any franchise system, and never guarantees profitability.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setReportSubmitted(false)
                setReportModalTarget("General Franchise Network Listing")
              }}
              className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer self-start md:self-center"
            >
              <Flag className="h-3.5 w-3.5" />
              <span>Report Misleading Opportunity</span>
            </button>
          </div>

          {/* Franchise Sub-Navigation + 18 Industry Categories */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  🏪 ConnectLn Franchise Directory, Opportunities, Resales, Suppliers &amp; Financing
                </h2>
                <p className="text-xs text-zinc-500">
                  Browse verified franchise systems, inspect FDD Item 7 &amp; Item 19 disclosures, connect with existing franchisees, and discover approved suppliers.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 flex-wrap">
                {[
                  { id: "directory", label: "🏪 Franchise Opportunities" },
                  { id: "resales", label: "🔄 Existing Franchise Resales" },
                  { id: "suppliers", label: "📦 Approved Suppliers & Vendors" },
                  { id: "financing", label: "🏦 SBA & Franchise Financing" }
                ].map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setFranchiseSubView(sub.id as any)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      franchiseSubView === sub.id
                        ? "bg-[#0A66C2] text-white shadow-2xs"
                        : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900"
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            {/* All 18 Franchise Industry Categories Filter Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5">
              <span className="text-[11px] font-bold text-zinc-500 shrink-0 mr-1">18 Industries:</span>
              {FRANCHISE_CATEGORIES.map((ind) => {
                const isSelected = selectedFranchiseIndustry === ind
                return (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => setSelectedFranchiseIndustry(ind)}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200"
                    }`}
                  >
                    {ind}
                  </button>
                )
              })}
            </div>

            {/* Franchise Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
              {filteredFranchises.map((fran) => (
                <div
                  key={fran.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900 p-4 sm:p-5 flex flex-col justify-between gap-4 hover:border-[#0A66C2] transition-all shadow-2xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={fran.logo}
                          alt={fran.brandName}
                          className="h-13 w-13 rounded-xl object-cover border border-zinc-300 dark:border-zinc-700 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="rounded bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-extrabold text-[#0A66C2] dark:text-sky-300">
                              {fran.industryCategory}
                            </span>
                            <span className="rounded bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                              🎖️ {fran.veteranOwnersCount} Veteran Franchisees
                            </span>
                            {fran.isResaleAvailable && (
                              <span className="rounded bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                                🔄 Resale Available
                              </span>
                            )}
                          </div>
                          <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 mt-1">
                            {fran.brandName}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {fran.headline}
                    </p>

                    {/* Verified FDD Item 5, 6, 7 Financial Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 p-3 text-xs">
                      <div>
                        <p className="text-[10px] text-zinc-500 font-semibold">Liquid Capital Req.</p>
                        <p className="font-extrabold text-emerald-600 dark:text-emerald-400">
                          ${fran.minLiquidCapital.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-500 font-semibold">Total Investment (Item 7)</p>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">
                          ${(fran.totalInvestmentMin / 1000).toFixed(0)}k – ${(fran.totalInvestmentMax / 1000).toFixed(0)}k
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-500 font-semibold">Franchise Fee (Item 5)</p>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">
                          ${fran.initialFranchiseFee.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-500 font-semibold">Royalty (Item 6)</p>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">{fran.royaltyFee}</p>
                      </div>
                    </div>

                    {/* Distinguish Advertised VetFran Incentive vs. Verified FDD Terms */}
                    <div className="rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-2.5 space-y-1 text-[11px]">
                      <p className="font-bold text-amber-900 dark:text-amber-300">
                        🎖️ {fran.vetFranIncentive}
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        📄 <strong>Verified FDD Status:</strong> {fran.fddItem19Status}
                      </p>
                      {fran.isResaleAvailable && fran.resalePrice && (
                        <p className="text-emerald-700 dark:text-emerald-400 font-bold">
                          🔄 Active Franchise Transfer/Resale: {fran.resalePrice}
                        </p>
                      )}
                    </div>

                    {/* Supplier & Vendor Ecosystem */}
                    <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                      <span className="font-bold text-zinc-500">Approved Suppliers:</span>
                      {fran.supplierPartners.map((sp) => (
                        <span
                          key={sp}
                          className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300"
                        >
                          {sp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setFddModalListing(fran)}
                        className="rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Inspect FDD (14-Day Rule)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onOpenDirectMessage?.({
                            name: `${fran.brandName} Franchise Development Director`,
                            headline: `Verified Franchisor · ${fran.industryCategory} · FDD Item 19 & VetFran Desk`
                          })
                        }
                        className="rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white px-3 py-1.5 text-xs font-bold cursor-pointer"
                      >
                        Contact Franchisor
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setReportSubmitted(false)
                        setReportModalTarget(fran.brandName)
                      }}
                      className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Flag className="h-3 w-3" />
                      <span>Report</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: SHARED BRIDGE — VETERAN FRANCHISE & BUSINESS OPPORTUNITIES       */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {activeSection === "bridge" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 px-3 py-0.5 text-[11px] font-extrabold text-amber-800 dark:text-amber-300 border border-amber-300">
                  🤝 Shared Ecosystem Bridge
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
                  Veteran Franchise &amp; Business Opportunity Matcher
                </h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Filter franchise opportunities by your liquid investment budget (e.g., $100,000), location, and industry — and compare verified FDD requirements side by side.
                </p>
              </div>

              {/* Interactive Budget & Industry Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2">
                  <label className="block text-[10px] font-bold uppercase text-zinc-500">
                    Your Liquid Investment Budget
                  </label>
                  <select
                    value={bridgeBudgetMax}
                    onChange={(e) => setBridgeBudgetMax(Number(e.target.value))}
                    className="bg-transparent text-xs font-extrabold text-emerald-600 dark:text-emerald-400 focus:outline-none cursor-pointer"
                  >
                    <option value={60000}>Up to $60,000 Liquid Capital</option>
                    <option value={80000}>Up to $80,000 Liquid Capital</option>
                    <option value={100000}>Up to $100,000 Liquid Capital (Recommended)</option>
                    <option value={150000}>Up to $150,000 Liquid Capital</option>
                    <option value={300000}>Up to $300,000+ Liquid Capital</option>
                  </select>
                </div>

                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2">
                  <label className="block text-[10px] font-bold uppercase text-zinc-500">
                    Preferred Industry
                  </label>
                  <select
                    value={bridgeIndustry}
                    onChange={(e) => setBridgeIndustry(e.target.value)}
                    className="bg-transparent text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
                  >
                    {FRANCHISE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Matched Opportunities for Budget */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Found <strong className="text-emerald-600">{bridgeMatchedFranchises.length} veteran-friendly franchises</strong> matching your <strong>${bridgeBudgetMax.toLocaleString()}</strong> liquid capital budget:
                </p>
                <span className="text-[11px] text-zinc-500">
                  Note: Advertised VetFran incentives are shown separately from verified FDD Item 7 investment ranges. No profitability is promised.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bridgeMatchedFranchises.map((item) => {
                  const isCompared = comparedIds.includes(item.id)
                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl border p-4 flex flex-col justify-between gap-3 transition-all ${
                        isCompared
                          ? "border-[#0A66C2] bg-blue-50/30 dark:bg-blue-950/20 ring-1 ring-[#0A66C2]/30"
                          : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">
                            Min Liquid: ${item.minLiquidCapital.toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleCompareFranchise(item.id)}
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border cursor-pointer ${
                              isCompared
                                ? "bg-[#0A66C2] text-white border-[#0A66C2]"
                                : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300"
                            }`}
                          >
                            {isCompared ? "✓ Comparing" : "+ Compare"}
                          </button>
                        </div>

                        <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                          {item.brandName}
                        </h3>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
                          Total FDD Item 7 Investment: <strong>${item.totalInvestmentMin.toLocaleString()} – ${item.totalInvestmentMax.toLocaleString()}</strong>
                        </p>
                        <p className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold">
                          🎖️ {item.vetFranIncentive}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          👥 {item.veteranOwnersCount} existing Veteran Franchise Owners on ConnectLn
                        </p>
                      </div>

                      <div className="pt-2 border-t border-zinc-200/70 dark:border-zinc-800 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFddModalListing(item)}
                          className="flex-1 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 py-1.5 px-2.5 text-[11px] font-bold cursor-pointer"
                        >
                          Review FDD Terms
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onOpenDirectMessage?.({
                              name: `Veteran Franchisee Peer Group (${item.brandName})`,
                              headline: `${item.veteranOwnersCount} Verified Veteran Owners · Validation & Mentorship`
                            })
                          }
                          className="rounded-lg bg-[#0A66C2] text-white py-1.5 px-2.5 text-[11px] font-bold cursor-pointer"
                        >
                          Ask Vet Owners
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4: UNIFIED AI MATCHING ENGINE (7 MATCHING CAPABILITIES)             */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {activeSection === "ai_matching" && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-sm space-y-5">
          <div>
            <span className="rounded-full bg-purple-100 dark:bg-purple-950/60 px-3 py-0.5 text-[11px] font-extrabold text-purple-800 dark:text-purple-300 border border-purple-300">
              🤖 Unified Dual-Community AI Matching Engine
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
              7-Way AI Matching Across Veterans, Employers, Franchisors, Franchisees, Investors &amp; Suppliers
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Evaluates professional experience, military skills/qualifications, location, investment budget, industry interests, career objectives, and business ownership readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                capability: "1. Veteran to Employer",
                desc: "Matches military MOS/AFSC/NEC experience, clearance level, and leadership scope to civilian jobs.",
                example: "MOS 92A Logistics → Supply Chain Director at Prologis / Penske (98% Match)",
                actionLabel: "Open Veteran Job Matches",
                onClick: () => onNavigateTab?.("jobs")
              },
              {
                capability: "2. Veteran to Mentor",
                desc: "Connects transitioning service members with veteran entrepreneurs and senior civilian executives.",
                example: "Matched with Maj. Marcus Vance (USMC Ret.) — 6-Unit Franchise Owner",
                actionLabel: "Connect with Veteran Mentors",
                onClick: () => setActiveSection("veterans")
              },
              {
                capability: "3. Veteran to Franchise",
                desc: "Matches liquid budget ($60k–$300k+), technical background, and target territory to VetFran franchises.",
                example: "$100,000 Budget + MEP/Logistics → Neighborly / Senior Care Franchise",
                actionLabel: "Launch Franchise Budget Matcher",
                onClick: () => setActiveSection("bridge")
              },
              {
                capability: "4. Franchisee to Supplier",
                desc: "Connects franchise owners with pre-negotiated POS, fleet, HVAC, equipment, and foodservice vendors.",
                example: "Matched with ServiceTitan Dispatch, Ford Pro Fleet & Sysco Co-Op",
                actionLabel: "Browse Franchise Suppliers",
                onClick: () => {
                  setFranchiseSubView("suppliers")
                  setActiveSection("franchises")
                }
              },
              {
                capability: "5. Investor to Franchise",
                desc: "Identifies multi-unit area development and franchise resale opportunities based on EBITDA criteria.",
                example: "Valor Frontier Capital → 4-Unit Automotive & Restoration Rollup",
                actionLabel: "View Multi-Unit & Resales",
                onClick: () => {
                  setFranchiseSubView("resales")
                  setActiveSection("franchises")
                }
              },
              {
                capability: "6. Franchisor to Franchisee",
                desc: "Connects ethical franchisors (with verified FDD filings) to pre-qualified veteran and civilian operators.",
                example: "Discovery Day Qualification: Net Worth, Liquidity & Operations Fit",
                actionLabel: "Open Franchise Directory",
                onClick: () => setActiveSection("franchises")
              },
              {
                capability: "7. Veteran to Training",
                desc: "Recommends GI Bill, DoD COOL, SBA Boots to Business, and IVMF O2O certifications to close skill gaps.",
                example: "Recommended: APICS CSCP, PMP Bootcamp & SBA Boots to Business",
                actionLabel: "Open Skills Translator",
                onClick: () => setActiveSection("veterans")
              }
            ].map((m) => (
              <div
                key={m.capability}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 p-4 flex flex-col justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">{m.capability}</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300">{m.desc}</p>
                  <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                    ⚡ Live Match: {m.example}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={m.onClick}
                  className="rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white py-1.5 px-3 text-xs font-bold transition-colors cursor-pointer"
                >
                  {m.actionLabel} →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5: EXTERNAL PARTNERSHIPS & 10-NETWORK MODULAR ECOSYSTEM             */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {activeSection === "ecosystem" && (
        <div className="space-y-6">
          {/* External Partnerships (SBA Boots to Business, VetFran, IFA, SCORE, VBOC, IVMF) */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                🏛️ Official External Resource &amp; Partnership Hub (SBA, VetFran, IFA, SCORE, VBOC &amp; IVMF)
              </h2>
              <p className="text-xs text-zinc-500">
                Direct resource integrations connecting ConnectLn members with federal entrepreneurship training, veteran franchise incentives, and free mentorship.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {EXTERNAL_PARTNERSHIPS.map((partner) => (
                <div
                  key={partner.name}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <span className="inline-block rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 text-[10px] font-bold text-[#0A66C2] dark:text-sky-300 border border-blue-200">
                      {partner.badge} · {partner.category}
                    </span>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{partner.name}</h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">{partner.description}</p>
                  </div>
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 py-1.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <span>Open Official Resource</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* 10 Modular Business & Professional Networks Ecosystem */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                🌐 ConnectLn Modular Business &amp; Professional Networks Architecture (10 Core Communities)
              </h2>
              <p className="text-xs text-zinc-500">
                Built as independent, configurable community modules sharing ConnectLn’s identity, messaging, universal search, events, and AI matching infrastructure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ECOSYSTEM_COMMUNITY_MODULES.map((mod) => (
                <div
                  key={mod.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3.5 flex items-start justify-between gap-3 bg-zinc-50/40 dark:bg-zinc-800/30"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{mod.icon}</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">{mod.name}</h4>
                        <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                          {mod.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">{mod.desc}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-zinc-500 shrink-0">{mod.members}</span>
                </div>
              ))}
            </div>

            {/* 9 Core Developer Engine Modules Table */}
            <div className="pt-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 mb-2">
                9 Core Platform Engine Modules (Shared Infrastructure)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {DEVELOPER_ARCHITECTURE_ENGINES.map((eng) => (
                  <div
                    key={eng.module}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 bg-white dark:bg-zinc-900"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">{eng.module}</span>
                      <span className="text-[10px] font-bold text-emerald-600">● {eng.status}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">{eng.components}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 1: FTC 14-DAY FDD DISCLOSURE & COMPLIANCE VIEWER ───────────────── */}
      <Dialog open={!!fddModalListing} onOpenChange={(open) => !open && setFddModalListing(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold">
              📜 Franchise Disclosure Document (FDD) &amp; FTC 14-Day Compliance Summary
            </DialogTitle>
          </DialogHeader>
          {fddModalListing && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 p-3 space-y-1">
                <p className="font-extrabold text-amber-900 dark:text-amber-200">
                  ⚠️ Mandatory U.S. FTC 14-Calendar-Day Cooling-Off Warning
                </p>
                <p className="text-zinc-700 dark:text-zinc-300">
                  Under federal law (16 CFR Part 436), you must receive the official Franchise Disclosure Document (FDD) at least <strong>14 calendar days</strong> before signing any franchise agreement or paying any money to the franchisor or an affiliate.
                </p>
              </div>

              <div className="space-y-2 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3.5">
                <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                  {fddModalListing.brandName}
                </h4>
                <p className="text-zinc-600 dark:text-zinc-300">
                  • <strong>FDD Item 5 (Initial Franchise Fee):</strong> ${fddModalListing.initialFranchiseFee.toLocaleString()}
                </p>
                <p className="text-zinc-600 dark:text-zinc-300">
                  • <strong>FDD Item 6 (Continuing Royalty):</strong> {fddModalListing.royaltyFee}
                </p>
                <p className="text-zinc-600 dark:text-zinc-300">
                  • <strong>FDD Item 7 (Estimated Initial Investment Range):</strong> ${fddModalListing.totalInvestmentMin.toLocaleString()} – ${fddModalListing.totalInvestmentMax.toLocaleString()}
                </p>
                <p className="text-zinc-600 dark:text-zinc-300">
                  • <strong>FDD Item 19 (Financial Performance Representation):</strong> {fddModalListing.fddItem19Status}
                </p>
                <p className="text-amber-800 dark:text-amber-300 font-semibold">
                  • <strong>Advertised Military Incentive (Distinct from FDD):</strong> {fddModalListing.vetFranIncentive}
                </p>
              </div>

              <p className="text-[11px] text-zinc-500">
                Disclaimer: ConnectLn does not endorse any franchise system and never guarantees financial return or profitability. Always review the complete 23-Item FDD with a qualified franchise attorney and CPA.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFddModalListing(null)}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = fddModalListing
                    setFddModalListing(null)
                    onOpenDirectMessage?.({
                      name: `${target.brandName} FDD Compliance Desk`,
                      headline: `Request Official 23-Item FDD Packet (14-Day Disclosure Receipt)`
                    })
                  }}
                  className="rounded-lg bg-[#0A66C2] text-white px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  Request Official FDD Packet
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── MODAL 2: REPORT MISLEADING OPPORTUNITY ──────────────────────────────── */}
      <Dialog open={!!reportModalTarget} onOpenChange={(open) => !open && setReportModalTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold flex items-center gap-2">
              <Flag className="h-4 w-4 text-rose-600" />
              <span>Report Misleading Franchise or Business Opportunity</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            {reportSubmitted ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-900 space-y-1">
                <p className="font-extrabold">✓ Compliance Report Logged</p>
                <p>
                  Our Verification &amp; FDD Compliance Engine has flagged <strong>{reportModalTarget}</strong> for audit. Thank you for protecting the ConnectLn Veterans &amp; Franchise community.
                </p>
              </div>
            ) : (
              <>
                <p className="text-zinc-600 dark:text-zinc-300">
                  Reporting: <strong>{reportModalTarget}</strong>
                </p>
                <label className="block font-bold text-zinc-700 dark:text-zinc-200">
                  Reason for Compliance Flag:
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-xs"
                >
                  <option value="Unverified earnings claim / Missing FDD Item 19 support">
                    Unverified earnings claim / Missing FDD Item 19 support
                  </option>
                  <option value="Failure to provide FDD 14 calendar days prior">
                    Failure to provide FDD 14 calendar days prior
                  </option>
                  <option value="Inaccurate VetFran military discount representation">
                    Inaccurate VetFran military discount representation
                  </option>
                  <option value="Predatory fee or misleading territory exclusivity">
                    Predatory fee or misleading territory exclusivity
                  </option>
                </select>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalTarget(null)}
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportSubmitted(true)}
                    className="rounded-lg bg-rose-600 text-white px-4 py-1.5 font-bold cursor-pointer"
                  >
                    Submit Compliance Report
                  </button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
