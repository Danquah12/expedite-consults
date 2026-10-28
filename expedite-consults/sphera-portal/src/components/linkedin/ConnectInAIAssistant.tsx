"use client"

import React, { useState, useEffect, useRef } from "react"
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
  Cpu,
  RefreshCw,
  Maximize2,
  Minimize2,
  ExternalLink,
  Copy,
  Check,
  Globe
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { UserProfile } from "@/lib/linkedin-data"
import { useLanguage } from "@/context/LanguageContext"
import { LanguageSwitcher } from "@/components/language/LanguageSwitcher"
import { getLocalizedInitialMessage, getLocalizedAIAnswer } from "@/lib/translations/ai-responses"
import { findConnectLnTopic, connectLnOverview } from "@/lib/connectln-knowledge"
import { PROFESSION_ENCLAVES } from "@/lib/connectin-professions"

interface ConnectInAIAssistantProps {
  isOpen: boolean
  onClose: () => void
  currentUser: UserProfile
  onNavigateTab: (tab: string) => void
  initialMode?: 'vibe' | 'chat'
  initialQuery?: string
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

const VIBE_QUICK_CHIPS = [
  { emoji: "🛡️", label: "DoD Zero Trust", prompt: "Explain the core pillars of DoD Zero Trust Architecture and how to implement them." },
  { emoji: "📄", label: "Resume Strategy", prompt: "How do I optimize my cybersecurity resume for senior federal contracts?" },
  { emoji: "🔒", label: "NIST 800-53", prompt: "Summarize key NIST 800-53 Rev. 5 controls required for RMF ATO authorization." },
  { emoji: "⚡", label: "SecOps Automation", prompt: "What are best practices for automating ACAS Nessus scans and POA&M tracking?" },
  { emoji: "☁️", label: "AWS GovCloud", prompt: "What is required to achieve FedRAMP Moderate or High in AWS GovCloud?" },
  { emoji: "💻", label: "Code Assistant", prompt: "Write a Python script to parse Nessus XML scans and export open high-risk findings." },
]

function getLocalizedChips(lang: string) {
  if (lang === 'es') {
    return [
      { emoji: "🛡️", label: "DoD Zero Trust", prompt: "Explica los pilares clave de la arquitectura Zero Trust del DoD y cómo implementarlos." },
      { emoji: "📄", label: "Optimizar CV", prompt: "¿Cómo optimizo mi currículum para puestos de liderazgo y contratos federales?" },
      { emoji: "🔒", label: "NIST 800-53", prompt: "Resume los controles clave de NIST 800-53 Rev. 5 para la autorización RMF ATO." },
      { emoji: "⚡", label: "Automatización SecOps", prompt: "¿Cuáles son las mejores prácticas para automatizar escaneos de vulnerabilidades y POA&M?" },
      { emoji: "☁️", label: "AWS GovCloud", prompt: "¿Qué se requiere para alcanzar FedRAMP High en AWS GovCloud?" },
      { emoji: "💻", label: "Script de Seguridad", prompt: "Escribe un script en Python para analizar reportes Nessus y extraer hallazgos críticos." },
    ]
  }
  if (lang === 'fr') {
    return [
      { emoji: "🛡️", label: "DoD Zero Trust", prompt: "Expliquez les piliers de l'architecture Zero Trust et leur mise en œuvre." },
      { emoji: "📄", label: "Optimisation de CV", prompt: "Comment optimiser mon CV pour des contrats fédéraux et postes de direction ?" },
      { emoji: "🔒", label: "NIST 800-53", prompt: "Résumez les contrôles essentiels de NIST 800-53 pour l'autorisation RMF ATO." },
      { emoji: "⚡", label: "Automatisation SecOps", prompt: "Quelles sont les meilleures pratiques pour automatiser les scans ACAS Nessus et le suivi POA&M ?" },
      { emoji: "☁️", label: "AWS GovCloud", prompt: "Quelles sont les exigences pour FedRAMP High sur AWS GovCloud ?" },
      { emoji: "💻", label: "Assistant Code", prompt: "Écrivez un script Python pour analyser les scans Nessus et exporter les failles critiques." },
    ]
  }
  if (lang === 'de') {
    return [
      { emoji: "🛡️", label: "DoD Zero Trust", prompt: "Erläutern Sie die Kernsäulen der Zero Trust-Architektur und deren Implementierung." },
      { emoji: "📄", label: "Lebenslauf-Tipps", prompt: "Wie optimiere ich meinen Lebenslauf für leitende Positionen im Sicherheitsbereich?" },
      { emoji: "🔒", label: "NIST 800-53", prompt: "Fassen Sie wichtige NIST 800-53 Rev. 5-Kontrollen für RMF ATO zusammen." },
      { emoji: "⚡", label: "SecOps-Automatisierung", prompt: "Best Practices für automatisierte Schwachstellenscans und POA&M-Tracking." },
      { emoji: "☁️", label: "AWS GovCloud", prompt: "Anforderungen für FedRAMP High in AWS GovCloud." },
      { emoji: "💻", label: "Code-Assistent", prompt: "Schreiben Sie ein Python-Skript zur Analyse von Nessus-Scans und Schwachstellen." },
    ]
  }
  if (lang === 'ar') {
    return [
      { emoji: "🛡️", label: "DoD Zero Trust", prompt: "اشرح الركائز الأساسية لهندسة نموذج الثقة الصفرية Zero Trust وكيفية تطبيقها." },
      { emoji: "📄", label: "تطوير السيرة الذاتية", prompt: "كيف أقوم بتحسين سيرتي الذاتية للحصول على عقود ومناصب قيادية في الأمن السيبراني؟" },
      { emoji: "🔒", label: "NIST 800-53", prompt: "لخّص ضوابط إطار عمل NIST 800-53 المطلوبة لترخيص RMF ATO." },
      { emoji: "⚡", label: "أتمتة العمليات الأمنية", prompt: "ما هي أفضل الممارسات لأتمتة فحص الثغرات وإدارة خطط العمل والمعالجة POA&M؟" },
      { emoji: "☁️", label: "أمن السحابة GovCloud", prompt: "ما هي متطلبات تحقيق الامتثال لمعيار FedRAMP High في AWS GovCloud؟" },
      { emoji: "💻", label: "مساعد البرمجة", prompt: "اكتب سكريبت بلغة بايثون لتحليل نتائج فحص Nessus واستخراج الثغرات عالية الخطورة." },
    ]
  }
  return VIBE_QUICK_CHIPS
}

export function ConnectInAIAssistant({
  isOpen,
  onClose,
  currentUser,
  onNavigateTab,
  initialMode = 'chat',
  initialQuery = ""
}: ConnectInAIAssistantProps) {
  const { language, t } = useLanguage()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [mode, setMode] = useState<'vibe' | 'chat'>('chat')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const [isIframeLoading, setIsIframeLoading] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null)
  const [query, setQuery] = useState(initialQuery || "")
  const [messages, setMessages] = useState<ChatMessage[]>(() => [getLocalizedInitialMessage(currentUser, language) as ChatMessage])
  const [isTyping, setIsTyping] = useState(false)

  // Sync active language to embedded Vibe iframe
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          { type: 'SET_LANGUAGE', lang: language, locale: language },
          '*'
        )
      } catch {}
    }
  }, [language, iframeKey])

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode)
    }
  }, [initialMode, isOpen])

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery)
    }
  }, [initialQuery])

  useEffect(() => {
    setMessages([getLocalizedInitialMessage(currentUser, language) as ChatMessage])
  }, [currentUser.name, currentUser.professionEnclave, language])

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

    // Local scripted answers: used for localized replies and as the fallback if Noctis is unreachable
    const runLocal = () => {
      // Check for localized responses first
      const localized = getLocalizedAIAnswer(promptText, language, currentUser)
      if (localized) {
        setMessages(prev => [...prev, localized as ChatMessage])
        setIsTyping(false)
        return
      }

      let reply: ChatMessage
      const lower = promptText.toLowerCase()
      const enclaveId = currentUser.professionEnclave || 'tech_cybersecurity'

      // ConnectLn platform Q&A: answer from the knowledge base for platform/how-to questions
      const kbTopic = findConnectLnTopic(promptText)
      const asksPlatform = /connect\s?l[ni]|this (app|platform|site)|how (do|does|can|to)|where (is|can|do)|what (is|are|does)|tell me (about|everything)|everything about|features?/.test(lower)
      if (kbTopic && asksPlatform) {
        const wantsAll = /everything|all features|overview|full tour|tour/.test(lower)
        const topicReply: ChatMessage = {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: `📘 **${wantsAll ? 'ConnectLn — Full Overview' : kbTopic.title}**\n\n${wantsAll ? connectLnOverview() : kbTopic.answer()}`,
          suggestedCards: kbTopic.tab
            ? [{ title: kbTopic.title, category: 'ConnectLn Guide', actionText: kbTopic.tabLabel || 'Open', targetTab: kbTopic.tab, matchPercent: 'Platform Help' }]
            : undefined
        }
        setMessages(prev => [...prev, topicReply])
        setIsTyping(false)
        return
      }

      if (lower.includes('zero trust')) {
        reply = {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: `🛡️ **DoD Zero Trust Architecture — 7 Core Pillars & Implementation Blueprint:**\n\n1. **User Pillar:** Phishing-resistant MFA (FIDO2 / WebAuthn / CAC-PIV) + continuous behavioral risk scoring.\n2. **Device Pillar:** Endpoint EDR telemetry, hardware TPM attestation, and real-time compliance enforcement.\n3. **Network & Environment:** Cilium eBPF micro-segmentation, software-defined perimeter (SDP), and mutual TLS (mTLS) everywhere.\n4. **Application & Workload:** Container image signing (Cosign/SLSA), immutable microVMs, and API gateway policy enforcement.\n5. **Data Pillar:** Data tagging, FIPS 140-3 encryption at rest/in transit, and automated DLP guardrails.\n6. **Visibility & Analytics:** Centralized SIEM/SOAR telemetry + UEBA anomaly detection.\n7. **Automation & Orchestration:** Machine-readable OSCAL continuous ATO (cATO) pipelines.`,
          suggestedCards: [
            {
              title: "Browse Zero Trust & Security Jobs",
              category: "Live Requisitions",
              actionText: "Open Jobs",
              targetTab: "jobs",
              matchPercent: "98% Match"
            },
            {
              title: "Launch Zero Trust & eBPF Lab",
              category: "Interactive Lab",
              actionText: "Open Labs",
              targetTab: "labs",
              matchPercent: "+400 XP"
            }
          ]
        }
      } else if (lower.includes('resume') || lower.includes('currículum') || lower.includes('lebenslauf') || lower.includes('سيرتي')) {
        reply = {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: `📄 **ConnectIn Executive & Technical Resume Optimization Strategy:**\n\n1. **Quantified Impact First:** Lead every bullet with measurable outcomes (e.g., *"Reduced MTTR by 64% across 40+ production nodes"* or *"Delivered $4.2M commercial timber build 3 weeks ahead of schedule"*).\n2. **Verified Licenses & Tool Matrix:** Explicitly list your active credentials (OSHA 30, ASE Master, CISSP, FAA A&P, State License) and exact equipment/software stack so ATS parsers rank you in the top 5%.\n3. **Federal & Enterprise KSAs:** Mirror the exact keywords from the requisition's required qualifications.\n4. **1-Click Tailoring:** Use the **Vibe AI Career Studio (Live)** tab right here or inside the **Jobs → Resume Prep App** tab to auto-tailor your resume to any job description!`,
          suggestedCards: [
            {
              title: "Open Embedded Resume Prep App",
              category: "AI Resume Tailor",
              actionText: "Go to Jobs & Resume Studio",
              targetTab: "jobs",
              matchPercent: "ATS 99%"
            }
          ]
        }
      } else if (lower.includes('nist 800-53') || lower.includes('rmf') || lower.includes('ato')) {
        reply = {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: `🔒 **NIST SP 800-53 Rev. 5 — High-Priority Controls for RMF & Continuous ATO (cATO):**\n\n• **AC-2 / AC-3 / AC-6 (Access Control):** Automated account lifecycle, least privilege, and privileged access management (PAM).\n• **AU-2 / AU-6 / AU-12 (Audit & Accountability):** Immutable centralized audit logging and automated SIEM correlation.\n• **CM-2 / CM-6 / CM-8 (Configuration Management):** DISA STIG / CIS benchmark baseline enforcement via Infrastructure-as-Code.\n• **IA-2(1)(2) / IA-5 (Identification & Authentication):** Hardware token / FIDO2 MFA for all privileged and non-privileged accounts.\n• **RA-5 / SI-2 / SI-4 (Vulnerability & Flaw Remediation):** Continuous ACAS/Nessus + container scanning with automated POA&M generation in OSCAL format.`,
          suggestedCards: [
            {
              title: "Explore Compliance & GRC Courses",
              category: "Masterclass",
              actionText: "Open Learning",
              targetTab: "learning",
              matchPercent: "NIST Rev. 5"
            }
          ]
        }
      } else if (lower.includes('secops') || lower.includes('nessus') || lower.includes('poa&m') || lower.includes('automat')) {
        reply = {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: `⚡ **SecOps Automation — ACAS/Nessus & Continuous POA&M Pipeline Best Practices:**\n\n1. **Automated Scan Orchestration:** Trigger credentialed Nessus/Nuclei scans on every CI/CD merge and nightly across production subnets.\n2. **Machine-Readable OSCAL Ingestion:** Convert \`.nessus\` XML and SARIF findings directly into NIST OSCAL Assessment Results JSON.\n3. **Auto-Prioritization by EPSS + CISA KEV:** Cross-reference CVEs against the CISA Known Exploited Vulnerabilities (KEV) catalog before opening critical tickets.\n4. **Closed-Loop POA&M Sync:** Auto-close POA&M milestones when verification scans confirm patch deployment.`,
          suggestedCards: [
            {
              title: "Inspect Autonomous Security Agents",
              category: "AI Agents",
              actionText: "Open AI Agents",
              targetTab: "aiagents",
              matchPercent: "Auto-POA&M"
            }
          ]
        }
      } else if (lower.includes('govcloud') || lower.includes('fedramp')) {
        reply = {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: `☁️ **AWS GovCloud (US) — FedRAMP Moderate / High & DoD IL4/IL5 Readiness Checklist:**\n\n• **Cryptographic Boundary:** Enforce FIPS 140-3 validated endpoints (\`*.us-gov-west-1.amazonaws.com\`) and AWS KMS Customer Managed Keys (CMKs).\n• **Network Isolation:** Zero public IPs on compute nodes; route all ingress through AWS WAF + ALB + PrivateLink VPC Endpoints.\n• **Identity Federation:** SAML 2.0 / OIDC federation with hardware MFA and strict IAM Permission Boundaries.\n• **Continuous Compliance:** AWS Security Hub (FSBP + NIST 800-53 standards enabled), AWS Config conformance packs, and GuardDuty threat detection.`,
          suggestedCards: [
            {
              title: "Find Cleared Cloud & GovCloud Jobs",
              category: "Jobs Network",
              actionText: "View Openings",
              targetTab: "jobs",
              matchPercent: "FedRAMP / IL5"
            }
          ]
        }
      } else if (lower.includes('python') || lower.includes('script') || lower.includes('code')) {
        reply = {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: `💻 **Python Automation Script — Parse Nessus \`.nessus\` XML for Critical/High Findings:**\n\n\`\`\`python\nimport xml.etree.ElementTree as ET\nimport csv\n\ndef export_high_findings(nessus_file: str, out_csv: str):\n    tree = ET.parse(nessus_file)\n    root = tree.getroot()\n    with open(out_csv, 'w', newline='', encoding='utf-8') as f:\n        writer = csv.writer(f)\n        writer.writerow(['Host', 'PluginID', 'Severity', 'PluginName', 'CVE'])\n        for host in root.findall('.//ReportHost'):\n            host_name = host.attrib.get('name', 'unknown')\n            for item in host.findall('ReportItem'):\n                sev = int(item.attrib.get('severity', '0'))\n                if sev >= 3:  # 3 = High, 4 = Critical\n                    cve = item.findtext('cve', 'N/A')\n                    writer.writerow([\n                        host_name,\n                        item.attrib.get('pluginID'),\n                        'Critical' if sev == 4 else 'High',\n                        item.attrib.get('pluginName'),\n                        cve\n                    ])\n\`\`\`\n\nYou can run or customize this directly in the **ConnectIn Code & Repositories** workspace.`,
          suggestedCards: [
            {
              title: "Open ConnectIn Code Workspace",
              category: "Developer Hub",
              actionText: "Open Code",
              targetTab: "code",
              matchPercent: "Python / DevSecOps"
            }
          ]
        }
      } else if (enclaveId === 'trades_construction') {
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
            text: kbTopic
              ? `📘 **${kbTopic.title}**\n\n${kbTopic.answer()}`
              : `I processed your request for "${promptText}". ConnectIn AI has indexed relevant verified experts, technical courses, and enterprise solutions across our ${PROFESSION_ENCLAVES.length}-enclave ecosystem.\n\nTip: ask me anything about ConnectLn — for example *"What can I do on ConnectLn?"*, *"How do I get verified?"* or *"Which professions are supported?"*`,
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
    }

    // Localized (non-English canned) answers stay local
    if (getLocalizedAIAnswer(promptText, language, currentUser)) {
      setTimeout(runLocal, 450)
      return
    }

    // Ask Noctis via the ConnectLn server bridge so the user never leaves ConnectLn
    const history = messages
      .filter(m => (m.sender === 'user' || m.sender === 'assistant') && typeof m.text === 'string' && m.text)
      .slice(-6)
      .map(m => ({ role: m.sender as 'user' | 'assistant', content: m.text }))
    const kbForCard = findConnectLnTopic(promptText)
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 28000)
    fetch('/api/connectin/noctis', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        question: promptText,
        history,
        language,
        profile: { name: currentUser.name, profession: currentUser.professionEnclave }
      }),
      signal: ctrl.signal
    })
      .then(async res => {
        const data = await res.json().catch(() => null)
        if (!res.ok || !data?.text) throw new Error(data?.error || 'no answer')
        const noctisReply: ChatMessage = {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: data.text,
          suggestedCards: kbForCard?.tab
            ? [{ title: kbForCard.title, category: 'ConnectLn Guide', actionText: kbForCard.tabLabel || 'Open', targetTab: kbForCard.tab, matchPercent: 'Platform Help' }]
            : undefined
        }
        setMessages(prev => [...prev, noctisReply])
        setIsTyping(false)
      })
      .catch(() => runLocal())
      .finally(() => clearTimeout(timer))
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "p-0 overflow-hidden rounded-2xl flex flex-col transition-all duration-300 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1D2226] text-zinc-900 dark:text-zinc-100 shadow-2xl",
          isFullscreen
            ? "!max-w-[97vw] !w-[97vw] !h-[95vh] !max-h-[95vh]"
            : "!max-w-5xl !w-[94vw] !h-[86vh] !max-h-[86vh]"
        )}
      >
        {/* Header - LinkedIn Executive Slate */}
        <div className="bg-[#1B1F23] dark:bg-[#14181B] px-5 py-3.5 text-white flex items-center justify-between border-b border-zinc-800 shrink-0 gap-3">
          {/* Brand & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-[#0A66C2]/20 border border-[#0A66C2]/40 flex items-center justify-center text-white shadow-xs shrink-0">
              <Sparkles className="h-4 w-4 text-[#70B5F9]" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="font-bold text-sm text-white flex items-center gap-2 truncate">
                <span>Noctis Intelligence</span>
                <a
                  href="https://dstrike.app/noctis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 px-2 py-0.5 text-[9px] font-mono text-emerald-300 border border-emerald-500/30 shrink-0"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  dstrike.app/noctis ↗
                </a>
              </DialogTitle>
              <p className="text-[11px] text-zinc-400 truncate">
                Noctis Q&amp;A, Prediction Desk &amp; Technical Analysis
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="hidden sm:flex items-center bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-700/60 shrink-0">
            <button
              onClick={() => setMode('chat')}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                mode === 'chat'
                  ? "bg-[#0A66C2] text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Bot className="h-3.5 w-3.5" />
              ConnectIn Copilot
            </button>
            <button
              onClick={() => setMode('vibe')}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                mode === 'vibe'
                  ? "bg-[#0A66C2] text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Noctis Live (dstrike.app/noctis)
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 shrink-0 pr-6">
            {/* Global Multi-Language Switcher */}
            <LanguageSwitcher compact={true} align="right" />

            {mode === 'vibe' && (
              <button
                onClick={() => {
                  setIsIframeLoading(true)
                  setIframeKey(k => k + 1)
                }}
                className="h-8 w-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors border border-zinc-700/60 cursor-pointer"
                title="Reload Noctis"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors border border-zinc-700/60 cursor-pointer"
              title={isFullscreen ? "Minimize" : "Maximize / Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
            <a
              href="https://dstrike.app/noctis"
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 w-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors border border-zinc-700/60 cursor-pointer"
              title="Open Noctis (https://dstrike.app/noctis) in New Window"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Quick Sparks Strip - Always Visible & Executes Immediately */}
        <div className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1 shrink-0">
            <Zap className="h-3 w-3 text-[#0A66C2]" /> Suggested Prompts:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {getLocalizedChips(language).map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  navigator.clipboard?.writeText(chip.prompt)
                  setCopiedPrompt(chip.label)
                  setTimeout(() => setCopiedPrompt(null), 2000)
                  setMode('chat')
                  handleSendPrompt(chip.prompt)
                }}
                className="rounded-full bg-white dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-1 whitespace-nowrap text-xs transition-colors flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 cursor-pointer shadow-2xs"
                title={`Click to run prompt: "${chip.prompt}"`}
              >
                <span>{chip.emoji}</span>
                <span className="font-medium">{chip.label}</span>
                {copiedPrompt === chip.label ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1">✓ Sent</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        {mode === 'vibe' ? (
          <div className="relative flex-1 w-full h-full bg-white dark:bg-zinc-950 flex flex-col min-h-0">
            {/* Mobile Tab switcher */}
            <div className="sm:hidden flex items-center justify-around bg-zinc-100 dark:bg-zinc-900 p-1 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <button
                onClick={() => setMode('chat')}
                className="px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1 text-zinc-600 dark:text-zinc-400"
              >
                <Bot className="h-3 w-3" />
                Copilot
              </button>
              <button
                onClick={() => setMode('vibe')}
                className="px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1 bg-[#0A66C2] text-white"
              >
                <Sparkles className="h-3 w-3 text-amber-300" />
                Noctis Live
              </button>
            </div>

            {/* Live Noctis Iframe */}
            <div className="relative flex-1 w-full h-full min-h-0 bg-white dark:bg-zinc-950">
              {isIframeLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 dark:bg-zinc-950/95 text-zinc-900 dark:text-zinc-100 gap-3 p-4">
                  <div className="relative h-12 w-12 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-zinc-200 dark:border-zinc-800 border-t-[#0A66C2] animate-spin" />
                    <Sparkles className="h-5 w-5 text-[#0A66C2]" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Connecting to Noctis (https://dstrike.app/noctis)...</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading Noctis Intelligence &amp; Prediction Desk</p>
                  </div>
                </div>
              )}

              <iframe
                ref={iframeRef}
                key={`${iframeKey}_${language}`}
                src="https://dstrike.app/noctis"
                className="w-full h-full border-0 bg-white dark:bg-zinc-950"
                allow="camera; microphone; display-capture; autoplay; clipboard-write; fullscreen"
                onLoad={() => setIsIframeLoading(false)}
                title="Noctis — https://dstrike.app/noctis"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-[#1D2226]">
            {/* Mobile Tab switcher */}
            <div className="sm:hidden flex items-center justify-around bg-zinc-100 dark:bg-zinc-800 p-1 border-b border-zinc-200 dark:border-zinc-700 shrink-0">
              <button
                onClick={() => setMode('chat')}
                className="px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1 bg-[#0A66C2] text-white"
              >
                <Bot className="h-3 w-3" />
                Copilot
              </button>
              <button
                onClick={() => setMode('vibe')}
                className="px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1 text-zinc-600 dark:text-zinc-400"
              >
                <Sparkles className="h-3 w-3 text-amber-300" />
                Career AI Studio
              </button>
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
                        : "bg-zinc-50 text-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/80"
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* Comparison Table View */}
                    {msg.comparisonTable && (
                      <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <table className="w-full text-left text-[11px] border-collapse bg-white dark:bg-zinc-900">
                          <thead>
                            <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-700 font-bold">
                              {msg.comparisonTable.headers.map((h, i) => (
                                <th key={i} className="p-2">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                            {msg.comparisonTable.rows.map((r, i) => (
                              <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                <td className="p-2 font-sans font-semibold text-zinc-900 dark:text-zinc-100">{r.feature}</td>
                                <td className="p-2 text-[#0A66C2] dark:text-sky-400 font-bold">{r.val1}</td>
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
                            className="rounded-xl bg-white dark:bg-zinc-900 p-2.5 border border-zinc-200 dark:border-zinc-700 space-y-1.5 flex flex-col justify-between shadow-2xs"
                          >
                            <div>
                              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                                <span className="font-mono">{c.category}</span>
                                {c.matchPercent && (
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{c.matchPercent}</span>
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
                              className="rounded-md bg-[#0A66C2] hover:bg-[#004182] text-white py-1 px-2.5 text-center text-[10px] font-semibold transition-colors cursor-pointer"
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
                <div className="flex items-center gap-2 text-zinc-500 text-xs italic">
                  <Sparkles className="h-3.5 w-3.5 animate-spin text-[#0A66C2]" />
                  <span>ConnectIn AI is synthesizing platform recommendations...</span>
                </div>
              )}
            </div>

            {/* Input Bar - LinkedIn Style */}
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1D2226] flex items-center gap-2 shrink-0">
              <input
                type="text"
                placeholder={getEnclaveAIPlaceholder(currentUser.professionEnclave)}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendPrompt(query)
                }}
                className="flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-xs text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100 border border-transparent focus:border-[#0A66C2] focus:bg-white dark:focus:bg-zinc-900 transition-all"
              />
              <button
                onClick={() => handleSendPrompt(query)}
                disabled={!query.trim()}
                className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white p-2.5 transition-all disabled:opacity-40 shrink-0 cursor-pointer shadow-xs"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
