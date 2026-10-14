"use client"

import React, { useState, useEffect } from "react"
import {
  Sparkles,
  Bot,
  Send,
  X,
  Search,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  ShoppingBag,
  GraduationCap,
  Award,
  Zap,
  Layers,
  HelpCircle,
  TrendingUp,
  Cpu
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UserProfile } from "@/lib/linkedin-data"

interface ConnectInAIAssistantProps {
  isOpen: boolean
  onClose: () => void
  currentUser: UserProfile
  onNavigateTab: (tab: string) => void
}

interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  text: string
  suggestedCards?: {
    title: string
    category: string
    actionText: string
    targetTab: string
    matchPercent?: string
  }[]
  comparisonTable?: {
    headers: string[]
    rows: { feature: string; val1: string; val2: string; val3: string }[]
  }
}

function getInitialAIMessage(currentUser: UserProfile): ChatMessage {
  const enclaveId = currentUser.professionEnclave || 'tech_cybersecurity'
  const firstName = currentUser.name.split(' ')[0]

  if (enclaveId === 'trades_construction') {
    return {
      id: 'msg_welcome',
      sender: 'assistant',
      text: `Hello ${firstName}! I am **ConnectIn AI**, your trade intelligence copilot. I can search architectural woodworking & heavy timber jobs, compare industrial machinery (Festool, Mafell, SawStop), verify OSHA/ANSI compliance, or match master craftsmen and sub-contractors.`,
      suggestedCards: [
        {
          title: "🔨 Find Master Carpenter & Timber Framing Jobs >$95K",
          category: "Trade Intelligence",
          actionText: "View 12 Matched Jobs",
          targetTab: "jobs",
          matchPercent: "98% Match"
        },
        {
          title: "🪚 Compare Festool Domino XL vs Mafell Duo-Doweler",
          category: "Tool Matrix",
          actionText: "Open Tool Spec",
          targetTab: "marketplace",
          matchPercent: "Spec Matrix"
        },
        {
          title: "📐 OSHA 1926 Heavy Timber Rigging Checklist",
          category: "Safety Advisor",
          actionText: "Open Safety Guide",
          targetTab: "pulse",
          matchPercent: "ANSI / OSHA"
        },
        {
          title: "⭐ Connect with Master Joinery Craftsmen ($85-$120/hr)",
          category: "Guild Booking",
          actionText: "Browse Guild",
          targetTab: "network",
          matchPercent: "Verified Guild"
        }
      ]
    }
  }

  if (enclaveId === 'healthcare_medicine') {
    return {
      id: 'msg_welcome',
      sender: 'assistant',
      text: `Hello ${firstName}! I am **ConnectIn AI**, your clinical and healthcare intelligence assistant. I can search acute care and surgical positions, compare FDA-cleared diagnostic equipment, analyze clinical certifications (BLS/ACLS/BC/BE), or connect with top medical specialists.`,
      suggestedCards: [
        {
          title: "🩺 Find Acute Care & Specialist Roles >$140K",
          category: "Clinical Intelligence",
          actionText: "View 16 Matched Roles",
          targetTab: "jobs",
          matchPercent: "99% Match"
        },
        {
          title: "🔬 Compare Butterfly iQ3 Ultrasound vs GE Vscan Air",
          category: "Equipment Matrix",
          actionText: "Open Clinical Spec",
          targetTab: "marketplace",
          matchPercent: "FDA Cleared"
        },
        {
          title: "📋 View CDC & AHA 2026 Clinical Guideline Updates",
          category: "Clinical Radar",
          actionText: "Open Advisory",
          targetTab: "pulse",
          matchPercent: "CDC / AHA"
        },
        {
          title: "⭐ Consult with Board-Certified Medical Fellows",
          category: "Peer Consults",
          actionText: "Browse Specialists",
          targetTab: "network",
          matchPercent: "Board Certified"
        }
      ]
    }
  }

  if (enclaveId === 'automotive_mechanics') {
    return {
      id: 'msg_welcome',
      sender: 'assistant',
      text: `Hello ${firstName}! I am **ConnectIn AI**, your master diagnostic and automotive engineering assistant. I can match master technician openings, compare high-voltage EV diagnostic rigs (Snap-on, Autel, Bosch), check NHTSA/OEM technical service bulletins, or connect with ASE master mechanics.`,
      suggestedCards: [
        {
          title: "⚡ Find Master EV Diagnostic Tech Roles >$110K",
          category: "Diagnostic Intelligence",
          actionText: "View 10 Matched Jobs",
          targetTab: "jobs",
          matchPercent: "98% Match"
        },
        {
          title: "🔧 Compare Snap-on ZEUS+ vs Autel MaxiSys Ultra EV",
          category: "Diagnostic Rig Matrix",
          actionText: "Open Rig Comparison",
          targetTab: "marketplace",
          matchPercent: "Lab Scope"
        },
        {
          title: "🔋 High-Voltage EV Battery Pack Diagnostics Lab",
          category: "Technical Lab",
          actionText: "Launch Simulation",
          targetTab: "learning",
          matchPercent: "800V Safety"
        },
        {
          title: "⭐ Network with ASE World Class Certified Technicians",
          category: "Master Guild",
          actionText: "Browse Technicians",
          targetTab: "network",
          matchPercent: "ASE Master"
        }
      ]
    }
  }

  // tech_cybersecurity or default
  return {
    id: 'msg_welcome',
    sender: 'assistant',
    text: `Hello ${firstName}! I am **ConnectIn AI**, your platform-wide intelligence assistant. I can search across jobs, compare enterprise software, match verified experts, or configure customized solution blueprints for your organization.`,
    suggestedCards: [
      {
        title: "💼 Find Cybersecurity Jobs Paying >$180K",
        category: "Career Intelligence",
        actionText: "View 14 Matched Jobs",
        targetTab: "jobs",
        matchPercent: "98% Match"
      },
      {
        title: "🛡️ Compare AXIOM vs Snyk vs CrowdStrike",
        category: "Software Matrix",
        actionText: "Open Comparison",
        targetTab: "marketplace",
        matchPercent: "Feature Match"
      },
      {
        title: "🎯 Recommend Vulnerability Tool for 5,000 Users",
        category: "AI Product Advisor",
        actionText: "Run Questionnaire",
        targetTab: "marketplace",
        matchPercent: "Advisor Engine"
      },
      {
        title: "⭐ Find Verified AWS Security Experts ($150-$175/hr)",
        category: "Expert Booking",
        actionText: "Browse Experts",
        targetTab: "peerreview",
        matchPercent: "Top Rated"
      }
    ]
  }
}

function getEnclaveAIPlaceholder(enclaveId?: string): string {
  if (enclaveId === 'trades_construction') {
    return "Ask anything: 'Find framing jobs >$90k', 'Compare Festool vs Mafell', 'OSHA scaffolding guidelines'..."
  }
  if (enclaveId === 'healthcare_medicine') {
    return "Ask anything: 'Find trauma nurse roles', 'Compare Butterfly iQ3 vs GE', '2026 ACLS protocols'..."
  }
  if (enclaveId === 'automotive_mechanics') {
    return "Ask anything: 'Find master EV tech roles', 'Compare Snap-on vs Autel', 'CAN bus scope setup'..."
  }
  return "Ask anything: 'Find jobs >$180k', 'Compare AXIOM vs Snyk', 'Recommend pentesting tools'..."
}

export function ConnectInAIAssistant({
  isOpen,
  onClose,
  currentUser,
  onNavigateTab
}: ConnectInAIAssistantProps) {
  const [query, setQuery] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>(() => [getInitialAIMessage(currentUser)])
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    setMessages([getInitialAIMessage(currentUser)])
  }, [currentUser.name, currentUser.professionEnclave])

  const handleSendPrompt = (promptText: string) => {
    if (!promptText.trim()) return

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: promptText
    }

    setMessages(prev => [...prev, userMsg])
    setQuery("")
    setIsTyping(true)

    setTimeout(() => {
      let reply: ChatMessage
      const lower = promptText.toLowerCase()
      const enclaveId = currentUser.professionEnclave || 'tech_cybersecurity'

      if (enclaveId === 'trades_construction') {
        if (lower.includes('focus') || lower.includes('week') || lower.includes('copilot') || lower.includes('what should i do')) {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `📊 **Your Personal Trade & Craftsmanship Weekly Briefing:**

• **Builder Inbound:** You have **2 custom builders** actively reviewing your Master Woodworking & Finish portfolio.
• **Active Bids:** **1 bid** awaiting client sign-off (Aspen High-End Timber Framing, $120K).
• **Trade Trends:** **Mass Timber CLT Joinery & CNC Router Tooling** are in highest trade market demand this week.

🎯 **My Recommended High-Impact Actions:**
1. Complete the **Heavy Timber Joinery & Glulam Construction** module (+350 XP).
2. Inspect the **Festool Domino XL DF 700 Joiner Kit** in Marketplace (10% trade guild rebate).
3. Connect with **2 Master Craftsmen** in the Timber Framers Guild discussion.`,
            suggestedCards: [
              {
                title: "Heavy Timber Joinery & Glulam Construction",
                category: "Trade Masterclass",
                actionText: "Open Module",
                targetTab: "learning",
                matchPercent: "+350 XP"
              },
              {
                title: "Inspect Festool Domino XL System ($1,650)",
                category: "Trade Marketplace",
                actionText: "View Equipment",
                targetTab: "marketplace",
                matchPercent: "98% Fit"
              }
            ]
          }
        } else if (lower.includes('compare') || lower.includes('festool') || lower.includes('tool') || lower.includes('machinery') || lower.includes('axiom') || lower.includes('snyk')) {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `Here is the trade equipment comparison between **Festool Domino XL DF 700**, **Mafell Duo-Doweler DDF 40**, and **Traditional Mortiser**:`,
            comparisonTable: {
              headers: ["Capability / Spec", "Festool Domino XL", "Mafell Duo-Doweler", "Hollow Chisel Mortiser"],
              rows: [
                { feature: "Mortise / Tenon Speed", val1: "✓ < 60s per joint", val2: "✓ High Precision", val3: "— 5-8 min per joint" },
                { feature: "Max Tenon Dimensions", val1: "14 x 140 mm", val2: "16 x 60 mm", val3: "Custom Size" },
                { feature: "Jobsite Portability", val1: "✓ Handheld Systainer", val2: "✓ Handheld Systainer", val3: "— Heavy Stationary" },
                { feature: "HEPA Dust Extraction", val1: "✓ CT 26/36 Integrated", val2: "✓ Vacuum Port", val3: "Partial Hookup" },
                { feature: "Pro Contractor Price", val1: "$1,650 Complete", val2: "$1,890 Complete", val3: "$2,400+ Machine" }
              ]
            },
            suggestedCards: [
              {
                title: "Inspect Festool Domino XL in Marketplace",
                category: "Marketplace Product",
                actionText: "View Tool Details",
                targetTab: "marketplace",
                matchPercent: "98% Match"
              }
            ]
          }
        } else if (lower.includes('missing') || lower.includes('skill') || lower.includes('learn') || lower.includes('gap')) {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `🔍 **ConnectIn AI Trade Skill Gap Analysis:**
Target Specialization: **Master Heavy Timber Project Lead & Architectural Joiner ($115K Base)**

Your Current Match Rate: **91%**

⚠️ **Recommended Skill Enhancements:**
1. **Mass Timber CLT Connection Hardware** — High demand in commercial mass timber builds.
2. **5-Axis CNC Woodworking Router Toolpath Scripting** — Increasing in luxury custom millwork.
3. **OSHA 1926 Heavy Timber Rigging & Fall Restraint** — Required for multi-story timber erection.

💡 **1-Click Remediation Plan:** Complete the **Heavy Timber Joinery & Glulam Construction** course to reach **99% match**.`,
            suggestedCards: [
              {
                title: "Heavy Timber Joinery & Glulam Construction",
                category: "Certification Track",
                actionText: "Start Learning",
                targetTab: "learning",
                matchPercent: "+8% Match Fix"
              },
              {
                title: "View Master Timber Framer Requisition ($115K)",
                category: "Target Job",
                actionText: "Inspect Job",
                targetTab: "jobs",
                matchPercent: "91% Current"
              }
            ]
          }
        } else if (lower.includes('job') || lower.includes('career') || lower.includes('pay') || lower.includes('salary') || lower.includes('95k') || lower.includes('180k')) {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `I found **12 verified trade positions** matching your carpentry & joinery craftsmanship:

• **Master Carpenter & Historic Joiner** @ TimberCraft Architectural ($92K–$115K) · Denver, CO
• **Lead Finish Carpenter & Millwork Supervisor** @ HighEnd Custom Millwork ($88K–$105K) · Boston, MA
• **Mass Timber Construction Lead** @ Mass Timber Structures Inc ($110K–$130K) · Seattle, WA`,
            suggestedCards: [
              {
                title: "Browse All 12 Trade Jobs",
                category: "Direct Apply",
                actionText: "Go to Jobs",
                targetTab: "jobs",
                matchPercent: "Top Matches"
              }
            ]
          }
        } else if (lower.includes('network') || lower.includes('who should i') || lower.includes('connect')) {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `🤝 **Trade Guild & Master Craftsmen Networking Recommendations:**

ConnectIn AI analyzed active craftspeople and project managers in your trade guild:

1. **Frank Kowalski** (Master Timber Framer & Guild Inspector) — Mass timber structural engineering specialist.
2. **Sarah Lin** (Architectural Woodwork Institute Certified Lead) — Commercial millwork superintendent.
3. **Gustavo Hernandez** (Lead Restoration Carpenter) — Historic preservation specialist.`,
            suggestedCards: [
              {
                title: "Connect with Frank Kowalski (Timber Framer)",
                category: "Guild Synergy",
                actionText: "View Profile & Connect",
                targetTab: "network",
                matchPercent: "99% Synergy"
              }
            ]
          }
        } else {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `I processed your trade inquiry for "${promptText}". ConnectIn AI has indexed relevant woodworking machinery, OSHA/ANSI safety codes, and trade apprenticeships across our ecosystem.`,
            suggestedCards: [
              {
                title: "Explore Trade Tools & Machinery",
                category: "Trade Equipment",
                actionText: "View Tools",
                targetTab: "marketplace",
                matchPercent: "Recommended"
              },
              {
                title: "Heavy Timber Joinery Masterclass",
                category: "Craftsmanship Labs",
                actionText: "View Learning",
                targetTab: "learning",
                matchPercent: "Practice Modules"
              }
            ]
          }
        }
      } else if (enclaveId === 'healthcare_medicine') {
        if (lower.includes('focus') || lower.includes('week') || lower.includes('copilot') || lower.includes('what should i do')) {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `📊 **Your Clinical AI Weekly Briefing:**

• **Hospital Inbound:** You have **3 clinical recruiters** reviewing your board certifications and state license status.
• **Active Inquiries:** **2 hospital centers** (Johns Hopkins & Cleveland Clinic) requested your credentialing dossier.
• **Clinical Trends:** **Point-of-Care Ultrasound (POCUS) & ECMO Specialist Certification** are the highest requested clinical credentials this month.

🎯 **My Recommended High-Impact Actions:**
1. Review the **CDC/AHA 2026 Severe Sepsis Early Protocol Update** in Pulse.
2. Complete the **Point-of-Care Ultrasound (POCUS) FAST Protocol** CME course (+400 XP).
3. Evaluate the **Butterfly iQ3 Handheld Ultrasound** in Marketplace (institutional CME pricing).`,
            suggestedCards: [
              {
                title: "Point-of-Care Ultrasound (POCUS) FAST Protocol",
                category: "Clinical CME Course",
                actionText: "Start Course",
                targetTab: "learning",
                matchPercent: "25 AMA PRA Category 1"
              },
              {
                title: "Butterfly iQ3 Ultrasound System ($2,899)",
                category: "Medical Device",
                actionText: "View Device",
                targetTab: "marketplace",
                matchPercent: "FDA 510(k)"
              }
            ]
          }
        } else if (lower.includes('compare') || lower.includes('ultrasound') || lower.includes('device') || lower.includes('equipment') || lower.includes('axiom') || lower.includes('snyk')) {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `Here is the clinical equipment comparison between **Butterfly iQ3**, **GE Vscan Air CL**, and **Philips Lumify**:`,
            comparisonTable: {
              headers: ["Clinical Parameter", "Butterfly iQ3", "GE Vscan Air CL", "Philips Lumify"],
              rows: [
                { feature: "Transducer Tech", val1: "Ultrasound-on-Chip (Single)", val2: "Dual-Probe (Curved+Linear)", val3: "Dedicated Transducers" },
                { feature: "Imaging Presets", val1: "30+ Clinical Presets", val2: "Abdominal/Vascular/Cardiac", val3: "Organ-Specific Presets" },
                { feature: "Battery Runtime", val1: "2+ Hours Continuous", val2: "50 min Continuous", val3: "Draws from Tablet" },
                { feature: "Cloud / PACS Sync", val1: "✓ HIPAA Cloud PACS", val2: "✓ GE Sound Checks", val3: "✓ Philips Cloud" },
                { feature: "Institutional Price", val1: "$2,899 + $420/yr", val2: "$4,500 One-Time", val3: "$6,200 Hardware" }
              ]
            },
            suggestedCards: [
              {
                title: "Inspect Butterfly iQ3 in Marketplace",
                category: "Medical Marketplace",
                actionText: "View Device",
                targetTab: "marketplace",
                matchPercent: "99% Match"
              }
            ]
          }
        } else if (lower.includes('missing') || lower.includes('skill') || lower.includes('learn') || lower.includes('gap')) {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `🔍 **ConnectIn AI Clinical Credential Analysis:**
Target Role: **Lead Trauma Nurse Specialist / Advanced Practitioner ($145K Base)**

Your Current Match Rate: **94%**

⚠️ **Recommended Credential Enhancements:**
1. **POCUS Focused Assessment with Sonography in Trauma (FAST)** — Required for Level 1 Trauma triage.
2. **ECMO Primer & Cannulation Management** — Emerging requirement in tertiary ICU centers.
3. **Advanced Trauma Life Support (ATLS) 10th Ed Audit** — High clinical preference.

💡 **1-Click Remediation Plan:** Complete the **POCUS FAST Protocol Masterclass** to reach **100% credential match**.`,
            suggestedCards: [
              {
                title: "Point-of-Care Ultrasound FAST Protocol",
                category: "Clinical Track",
                actionText: "Start Learning",
                targetTab: "learning",
                matchPercent: "+6% Gap Fix"
              },
              {
                title: "View Trauma Nurse Lead Requisition ($145K)",
                category: "Target Role",
                actionText: "Inspect Opening",
                targetTab: "jobs",
                matchPercent: "94% Current"
              }
            ]
          }
        } else if (lower.includes('job') || lower.includes('career') || lower.includes('pay') || lower.includes('salary') || lower.includes('140k') || lower.includes('180k')) {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `I found **16 active clinical positions** matching your verified healthcare license:

• **Lead Trauma Clinical Nurse Specialist** @ Johns Hopkins Hospital ($135K–$160K) · Baltimore, MD
• **Nurse Practitioner - Critical Care ICU** @ Mayo Clinic ($145K–$175K) · Rochester, MN
• **Clinical Nurse Specialist - Cardiothoracic ICU** @ Cleveland Clinic ($140K–$165K) · Cleveland, OH`,
            suggestedCards: [
              {
                title: "Browse All 16 Clinical Jobs",
                category: "Direct Apply",
                actionText: "Go to Jobs",
                targetTab: "jobs",
                matchPercent: "Top Matches"
              }
            ]
          }
        } else if (lower.includes('network') || lower.includes('who should i') || lower.includes('connect')) {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `🤝 **High-Value Clinical Networking Recommendations:**

ConnectIn AI matched your specialty with board-certified physicians and clinical department leads:

1. **Dr. Angela Vance, MD** (Chief of Orthopedic Surgery) — Surgical innovations and minimally invasive robotics.
2. **Elena Rostova, RN, CCRN** (Lead Trauma Nurse Coordinator) — Level 1 trauma resuscitation protocols.
3. **Dr. Samuel Green, MD** (Cardiothoracic Critical Care Lead) — ECMO management & cardiac support.`,
            suggestedCards: [
              {
                title: "Connect with Dr. Angela Vance, MD",
                category: "Clinical Synergy",
                actionText: "View Profile & Connect",
                targetTab: "network",
                matchPercent: "99% Synergy"
              }
            ]
          }
        } else {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `I processed your clinical inquiry for "${promptText}". ConnectIn AI has indexed relevant FDA-cleared diagnostic equipment, CME certification tracks, and hospital networks.`,
            suggestedCards: [
              {
                title: "Explore Medical Devices & Diagnostic Kits",
                category: "Medical Marketplace",
                actionText: "View Equipment",
                targetTab: "marketplace",
                matchPercent: "Recommended"
              },
              {
                title: "Explore Clinical Continuing Education (CME)",
                category: "Clinical Tracks",
                actionText: "View Learning",
                targetTab: "learning",
                matchPercent: "Accredited CME"
              }
            ]
          }
        }
      } else if (enclaveId === 'automotive_mechanics') {
        if (lower.includes('focus') || lower.includes('week') || lower.includes('copilot') || lower.includes('what should i do')) {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `📊 **Your Master Automotive Diagnostic AI Weekly Briefing:**

• **Shop Director Inbound:** You have **2 EV Fleet Directors** actively reviewing your ASE Master & High-Voltage credentials.
• **Active Opportunities:** **1 Master Tech Lead** opening at Rivian Service Engineering ($115K).
• **Diagnostic Trends:** **High-Voltage Battery Cell Balancing & CAN-FD Bus Troubleshooting** are in top demand.

🎯 **My Recommended High-Impact Actions:**
1. Complete the **High-Voltage EV Battery Pack Diagnostics & Cell Balancing** course (+400 XP).
2. Inspect the **Snap-on ZEUS+ Diagnostic Workstation** in Marketplace (ASE trade discount).
3. Review the **NHTSA EV High-Voltage Isolation Fault Advisory** in Pulse.`,
            suggestedCards: [
              {
                title: "High-Voltage EV Battery Pack Diagnostics",
                category: "Automotive Masterclass",
                actionText: "Start Course",
                targetTab: "learning",
                matchPercent: "+400 XP"
              },
              {
                title: "Snap-on ZEUS+ Diagnostic System ($14,500)",
                category: "Diagnostic Tool",
                actionText: "View Workstation",
                targetTab: "marketplace",
                matchPercent: "Top Diagnostic Rig"
              }
            ]
          }
        } else if (lower.includes('compare') || lower.includes('snap-on') || lower.includes('scanner') || lower.includes('diagnostic') || lower.includes('axiom') || lower.includes('snyk')) {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `Here is the professional diagnostic scan tool comparison between **Snap-on ZEUS+**, **Autel MaxiSys Ultra EV**, and **Bosch ADS 625**:`,
            comparisonTable: {
              headers: ["Diagnostic Spec", "Snap-on ZEUS+", "Autel MaxiSys Ultra EV", "Bosch ADS 625"],
              rows: [
                { feature: "Lab Scope Capability", val1: "✓ 4-Channel High-Speed", val2: "✓ 4-Channel VCMI", val3: "— 2-Channel Standard" },
                { feature: "EV Battery State-of-Health", val1: "✓ Deep Cell Balancing", val2: "✓ High-Voltage Specialized", val3: "Partial EV PIDs" },
                { feature: "OEM Network Topology", val1: "✓ Fast Color-Coded Bus", val2: "✓ Interactive CAN Tree", val3: "✓ Module List View" },
                { feature: "Fast-Track Guided Tests", val1: "✓ SureTrack 2.5B Records", val2: "✓ Guided Fault Analysis", val3: "✓ Bosch Direct-Hit" },
                { feature: "Professional Price", val1: "$14,500 Complete Cart", val2: "$5,299 Scan Tool", val3: "$4,100 Scan Tool" }
              ]
            },
            suggestedCards: [
              {
                title: "Inspect Snap-on ZEUS+ in Marketplace",
                category: "Diagnostic Rig",
                actionText: "View Equipment",
                targetTab: "marketplace",
                matchPercent: "Master Tech Pick"
              }
            ]
          }
        } else if (lower.includes('missing') || lower.includes('skill') || lower.includes('learn') || lower.includes('gap')) {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `🔍 **ConnectIn AI Automotive Certification Gap Analysis:**
Target Specialization: **Master EV Diagnostic Specialist & Shop Lead ($120K Base)**

Your Current Match Rate: **92%**

⚠️ **Recommended Credential Enhancements:**
1. **SAE J2534 Pass-Thru ECU Reflashing & CAN-FD Decoding** — High demand across all modern OEMs.
2. **800V High-Voltage Battery Pack Teardown & Contactors** — Crucial for Porsche Taycan / Hyundai E-GMP.
3. **ADAS Dynamic & Static Radar Target Alignment** — Mandatory post-collision procedure.

💡 **1-Click Remediation Plan:** Complete the **High-Voltage EV Battery Diagnostics Masterclass** to reach **99% match**.`,
            suggestedCards: [
              {
                title: "High-Voltage EV Battery Pack Diagnostics",
                category: "Certification Track",
                actionText: "Start Learning",
                targetTab: "learning",
                matchPercent: "+7% Gap Fix"
              },
              {
                title: "View Master EV Tech Requisition ($120K)",
                category: "Target Role",
                actionText: "Inspect Opening",
                targetTab: "jobs",
                matchPercent: "92% Current"
              }
            ]
          }
        } else if (lower.includes('job') || lower.includes('career') || lower.includes('pay') || lower.includes('salary') || lower.includes('110k') || lower.includes('180k')) {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `I found **10 active diagnostic technician positions** matching your verified ASE certifications:

• **Master EV Diagnostic Specialist** @ Rivian Service & Engineering ($105K–$130K) · Palo Alto, CA
• **Shop Lead / Master Technician** @ Precision German & Euro Auto ($95K–$120K) · Austin, TX
• **Advanced ADAS & Diagnostic Field Specialist** @ Mobile Diagnostic Solutions ($88K–$110K) · Chicago, IL`,
            suggestedCards: [
              {
                title: "Browse All 10 Diagnostic Jobs",
                category: "Direct Apply",
                actionText: "Go to Jobs",
                targetTab: "jobs",
                matchPercent: "Top Matches"
              }
            ]
          }
        } else if (lower.includes('network') || lower.includes('who should i') || lower.includes('connect')) {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `🤝 **High-Value Automotive Diagnostics Networking Recommendations:**

ConnectIn AI matched your diagnostic masteries with ASE World Class Technicians and shop owners:

1. **Marcus Miller, ASE L1/L3** (Master Diagnostic Technician) — High-voltage EV powertrain and CAN-FD diagnostics.
2. **Dave Ramirez** (Master Transmission & Drivetrain Specialist) — Dual-clutch and hybrid planetary gear systems.
3. **Kenji Sato** (ADAS Sensor Calibration Lead) — Radar, LiDAR, and stereoscopic camera aiming.`,
            suggestedCards: [
              {
                title: "Connect with Marcus Miller (ASE Master)",
                category: "Diagnostic Synergy",
                actionText: "View Profile & Connect",
                targetTab: "network",
                matchPercent: "99% Synergy"
              }
            ]
          }
        } else {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `I processed your automotive diagnostic inquiry for "${promptText}". ConnectIn AI has indexed relevant OEM technical service bulletins, diagnostic rigs, and ASE recertification modules.`,
            suggestedCards: [
              {
                title: "Explore Diagnostic Scanners & Oscilloscopes",
                category: "Diagnostic Equipment",
                actionText: "View Equipment",
                targetTab: "marketplace",
                matchPercent: "Recommended"
              },
              {
                title: "High-Voltage EV Battery Pack Diagnostics",
                category: "Automotive Masterclasses",
                actionText: "View Learning",
                targetTab: "learning",
                matchPercent: "Practice Modules"
              }
            ]
          }
        }
      } else {
        // Tech & Cybersecurity default
        if (lower.includes('focus') || lower.includes('week') || lower.includes('copilot') || lower.includes('what should i do')) {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `📊 **Your Personal Professional AI Weekly Briefing:**

• **Recruiter Inbound:** You have **3 recruiters** actively reviewing your cleared Zero Trust profile.
• **Applications:** **2 applications** awaiting response (Northrop Grumman & Stripe).
• **Skill Trends:** Your **AWS GovCloud & eBPF skills** are in the top 3% of market demand this week.

🎯 **My Recommended High-Impact Actions:**
1. Complete the **Kubernetes Cilium eBPF Lab** (+400 XP) to reach 100% on your Career Mission.
2. Submit your profile to the new **Lead Cloud Security Architect** opening ($235K).
3. Connect with **2 Fellow reviewers** discussing the CISA CVE advisory.`,
            suggestedCards: [
              {
                title: "Launch Kubernetes Cilium eBPF Lab",
                category: "Career Mission #1",
                actionText: "Open Lab Sandbox",
                targetTab: "labs",
                matchPercent: "+400 XP"
              },
              {
                title: "Apply to Lead Cloud Security Architect ($235K)",
                category: "Recruiter Match",
                actionText: "1-Click Apply",
                targetTab: "jobs",
                matchPercent: "98% Match"
              }
            ]
          }
        } else if (lower.includes('apply') && (lower.includes('1') || lower.includes('3') || lower.includes('action'))) {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `⚡ **Action Executed by ConnectIn Agent:**

I have pre-populated your **Verified Professional Identity**, **TS/SCI Clearance Attestation**, and **Terraform Multi-Account Portfolio Dossier** for:
1. **Lead Cloud Security Architect** @ Northrop Grumman ($225K TC)
2. **Staff AI Security Engineer** @ Stripe ($385K TC)

Would you like to finalize and dispatch with 1 click?`,
            suggestedCards: [
              {
                title: "Confirm & Submit 2 Applications",
                category: "Agent Action",
                actionText: "Submit Applications",
                targetTab: "jobs",
                matchPercent: "Instant Dispatch"
              }
            ]
          }
        } else if (lower.includes('compare') || lower.includes('axiom')) {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `Here is the comprehensive enterprise comparison between **AXIOM AI Cyber Suite**, **Expedite Strike**, and traditional scanners:`,
            comparisonTable: {
              headers: ["Feature / Capability", "AXIOM Cyber Suite", "Expedite Strike 2026", "Legacy Scanners"],
              rows: [
                { feature: "Autonomous Pentesting", val1: "✓ Full Mesh", val2: "✓ Exploit Graph", val3: "— Manual" },
                { feature: "AI-BOM LLM Scanner", val1: "✓ Token Guardrails", val2: "✓ Checkmarx MCP", val3: "— None" },
                { feature: "cATO OSCAL Exports", val1: "✓ Automated", val2: "✓ Continuous Sync", val3: "— Static PDF" },
                { feature: "GovCloud Ingress Support", val1: "✓ FIPS 140-3", val2: "✓ FIPS 140-3", val3: "Partial" },
                { feature: "Monthly Starting Price", val1: "$499 / mo", val2: "$499 / mo", val3: "$2,500+ / mo" }
              ]
            },
            suggestedCards: [
              {
                title: "Launch AXIOM 14-Day Free Evaluation",
                category: "Marketplace Product",
                actionText: "Start Free Trial",
                targetTab: "marketplace",
                matchPercent: "98% Match"
              }
            ]
          }
        } else if (lower.includes('missing') || lower.includes('skills am i missing')) {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `🔍 **ConnectIn AI Skill Gap Analysis:**
Target Role: **Lead Cloud Security Architect ($235K Base Requisition)**

Your Current Match Rate: **84%**

⚠️ **Missing or Under-Verified Skills:**
1. **Kubernetes Cilium eBPF Micro-Segmentation** — Missing practical lab validation.
2. **NIST SP 800-53 Rev 5 Machine OSCAL Generation** — Certified, but missing live deployment telemetry proof.
3. **Ed25519 Token Signing for Model Context Protocol (MCP)** — Emerging requirement (+320% job mentions).

💡 **1-Click Remediation Plan:** Complete the **Kubernetes Cilium eBPF Lab** (+400 XP) to raise your match rate to **98%**.`,
            suggestedCards: [
              {
                title: "Launch Cilium eBPF Micro-Segmentation Lab",
                category: "Interactive Practice Sandbox",
                actionText: "Launch MicroVM",
                targetTab: "labs",
                matchPercent: "+14% Gap Fix"
              },
              {
                title: "View Target Job Description ($235K)",
                category: "Target Requisition",
                actionText: "Inspect Job",
                targetTab: "jobs",
                matchPercent: "84% Current"
              }
            ]
          }
        } else if (lower.includes('learn next') || lower.includes('what should i learn')) {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `🎓 **Personalized Career Learning Recommendation:**

Based on your verified TS/SCI clearance and senior architect trajectory, here is your highest ROI learning path for 2026:

1. **Continuous cATO with OSCAL & WebAssembly** (High Demand, Low Supply)
2. **eBPF Linux Kernel Probes for Zero-Trust Pod Isolation** (Top 1% Architect Skill)
3. **Model Context Protocol (MCP) Prompt Injection Defense** (Critical AI Security Trend)

Would you like to enroll in the **DoD cATO Masterclass** or launch the **eBPF Sandbox**?`,
            suggestedCards: [
              {
                title: "DoD cATO & Automated OSCAL Masterclass",
                category: "Verified Certification Track",
                actionText: "Start Masterclass",
                targetTab: "learning",
                matchPercent: "Top Recommendation"
              },
              {
                title: "Interactive eBPF Kernel Defense Lab",
                category: "Hands-On MicroVM",
                actionText: "Launch Lab",
                targetTab: "labs",
                matchPercent: "+400 XP"
              }
            ]
          }
        } else if (lower.includes('network with') || lower.includes('who should i network')) {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `🤝 **High-Value Professional Networking Recommendations:**

ConnectIn AI analyzed the graph for mutual clearance levels, shared publications, and complementary skillsets:

1. **Dr. Sarah Jenkins** (Senior Fellow, Former Federal CISO) — Mutual interest in FedRAMP cATO & OSCAL standards.
2. **Marcus Vance** (VP of Security Architecture @ Defense Contractor) — Actively hiring 3 Principal Cloud Architects.
3. **Elena Rostova** (AppSec Fellow & OpenOSCAL Founder) — Seeking a co-founder for an AI-BOM validation project.`,
            suggestedCards: [
              {
                title: "Connect with Dr. Sarah Jenkins (Senior Fellow)",
                category: "Mutual Clearance Match",
                actionText: "View Profile & Connect",
                targetTab: "network",
                matchPercent: "99% Synergy"
              },
              {
                title: "Inspect Elena's Co-Founder Pitch",
                category: "Collaboration & Ideas",
                actionText: "Open Pitch",
                targetTab: "collaboration",
                matchPercent: "AI Safety ML"
              }
            ]
          }
        } else if (lower.includes('expert') || lower.includes('aws security expert')) {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `⭐ **Matched 3 Verified AWS Security Experts Available for 1:1 Architecture Teardowns:**

1. **Alex Taylor (You / Fellow Grade)** — 94.8% Skill Passport, TS/SCI Attestation ($175 / hr).
2. **Col. Raymond Sterling** (Principal Cloud Architect @ Expedite Consults) — 4.99 ★ (94 Audits, $200 / hr).
3. **Dr. Sarah Jenkins** (Former Federal CISO) — Board presentations & FedRAMP authorizations ($250 / mo retainer).`,
            suggestedCards: [
              {
                title: "Book 45-Min Architecture Teardown with Col. Sterling",
                category: "Verified Expert Session",
                actionText: "Book Session",
                targetTab: "mentorship",
                matchPercent: "4.99 ★ (94 Reviews)"
              }
            ]
          }
        } else if (lower.includes('problem') || lower.includes('solve') || lower.includes('product') || lower.includes('vulnerability') || lower.includes('recommend')) {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `🎯 **ConnectIn AI Solutions & Product Matcher:**

To solve your business problem, ConnectIn recommends combining **Software + Services + Experts + Learning**:

• **Software:** **AXIOM AI-Powered Cyber Suite** ($499/mo) — Autonomous pentest & eBPF blast-radius mapping.
• **Services:** **Expedite Strike cATO Readiness SOW** — 18-day fixed-scope compliance package.
• **Expert:** **Dr. Sarah Jenkins** — Fractional CISO oversight.
• **Learning:** **DoD Continuous Authorization Masterclass** for your engineering team.`,
            suggestedCards: [
              {
                title: "Launch AXIOM 14-Day Free Evaluation",
                category: "Recommended Software",
                actionText: "Start Free Trial",
                targetTab: "marketplace",
                matchPercent: "96% Match"
              },
              {
                title: "Request SOW Proposal & RFP Quote",
                category: "Services & SOW",
                actionText: "Open RFP Desk",
                targetTab: "procurement",
                matchPercent: "Fixed Scope"
              }
            ]
          }
        } else if (lower.includes('job') || lower.includes('180k') || lower.includes('career')) {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `I found **14 active high-compensation positions** matching your verified clearance and Zero-Trust skillset:

• **Lead Cloud Security Architect** @ Northrop Grumman ($195K–$225K TC) · Washington, DC / Remote
• **Principal Cloud & Zero Trust Architect** @ Expedite Consults ($245K TC) · DC Metro
• **Staff AI Security Engineer** @ Stripe ($385K TC) · San Francisco / Remote`,
            suggestedCards: [
              {
                title: "Browse All 14 Matching Jobs",
                category: "Direct Apply",
                actionText: "Go to Jobs",
                targetTab: "jobs",
                matchPercent: "Top Matches"
              }
            ]
          }
        } else {
          reply = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: `I processed your request for "${promptText}". ConnectIn AI has indexed relevant verified experts, technical courses, and enterprise solutions across our ecosystem.`,
            suggestedCards: [
              {
                title: "Explore Solutions Hub",
                category: "Business Outcomes",
                actionText: "View Solutions",
                targetTab: "marketplace",
                matchPercent: "Recommended"
              },
              {
                title: "Explore Interactive Hands-On Labs",
                category: "Technical Masterclasses",
                actionText: "View Learning",
                targetTab: "learning",
                matchPercent: "Practice Labs"
              }
            ]
          }
        }
      }

      setMessages(prev => [...prev, reply])
      setIsTyping(false)
    }, 600)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-4 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-sky-400 flex items-center justify-center text-white shadow-md">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>ConnectIn AI</span>
                <span className="rounded-full bg-purple-500/30 px-2 py-0.2 text-[9px] font-mono text-purple-200 border border-purple-400/40">
                  v2026.1 Platform Agent
                </span>
              </DialogTitle>
              <p className="text-[11px] text-zinc-300">
                Intelligent assistant across Professional, Knowledge &amp; Commerce layers
              </p>
            </div>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                  msg.sender === 'user'
                    ? "bg-[#0A66C2] text-white font-medium"
                    : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Comparison Table View */}
                {msg.comparisonTable && (
                  <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-300 dark:border-zinc-700">
                    <table className="w-full text-left text-[11px] border-collapse bg-white dark:bg-zinc-900">
                      <thead>
                        <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-b border-zinc-300 dark:border-zinc-700 font-bold">
                          {msg.comparisonTable.headers.map((h, i) => (
                            <th key={i} className="p-2">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                        {msg.comparisonTable.rows.map((r, i) => (
                          <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                            <td className="p-2 font-sans font-semibold text-zinc-900 dark:text-zinc-100">{r.feature}</td>
                            <td className="p-2 text-purple-600 dark:text-purple-400 font-bold">{r.val1}</td>
                            <td className="p-2 text-indigo-600 dark:text-indigo-400 font-bold">{r.val2}</td>
                            <td className="p-2 text-zinc-400">{r.val3}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Suggested Action Cards */}
                {msg.suggestedCards && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                    {msg.suggestedCards.map((c, i) => (
                      <div
                        key={i}
                        className="rounded-xl bg-white dark:bg-zinc-900 p-2.5 border border-zinc-200 dark:border-zinc-700 space-y-1.5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-zinc-400">
                            <span className="font-mono">{c.category}</span>
                            {c.matchPercent && (
                              <span className="font-bold text-emerald-600">{c.matchPercent}</span>
                            )}
                          </div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                            {c.title}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            onClose()
                            onNavigateTab(c.targetTab)
                          }}
                          className="rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white py-1 px-2 text-center text-[10px] font-bold transition-colors"
                        >
                          {c.actionText} →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs italic">
              <Sparkles className="h-3.5 w-3.5 animate-spin text-purple-500" />
              <span>ConnectIn AI is synthesizing platform recommendations...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder={getEnclaveAIPlaceholder(currentUser.professionEnclave)}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendPrompt(query)
            }}
            className="flex-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 px-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100"
          />
          <button
            onClick={() => handleSendPrompt(query)}
            disabled={!query.trim()}
            className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white p-2.5 transition-all disabled:opacity-40 shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
