export type VendorCategory =
  | "all"
  | "publishing_platforms"
  | "code_opensource"
  | "cloud_ai_vendors"
  | "cyber_governance"
  | "universities_moocs"
  | "trades_medical_industry"

export interface LearningVendorQuickLink {
  label: string
  url: string
  badge?: string
}

export interface LearningVendorSource {
  id: string
  name: string
  shortName: string
  category: Exclude<VendorCategory, "all">
  categoryLabel: string
  tagline: string
  description: string
  logoText: string
  accentGradient: string
  badgeText: string
  officialUrl: string
  searchUrlTemplate: string // Uses {query} placeholder
  popularTopics: string[]
  quickLinks: LearningVendorQuickLink[]
  supportsCeus: boolean
  ceuBadge?: string
  featuredFlagship?: boolean
  defaultConnected?: boolean
}

export const VENDOR_CATEGORY_TABS: { id: VendorCategory; label: string; countBadge: string }[] = [
  { id: "all", label: "All Learning Vendors", countBadge: "28 Sources" },
  { id: "publishing_platforms", label: "O'Reilly · LinkedIn Learning · Pluralsight", countBadge: "Core" },
  { id: "code_opensource", label: "GitHub · Open Source · Interactive Code", countBadge: "Code & Git" },
  { id: "cloud_ai_vendors", label: "Microsoft · AWS · Google · NVIDIA · AI", countBadge: "Cloud & AI" },
  { id: "cyber_governance", label: "ISC2 · SANS · CompTIA · HTB · PMI", countBadge: "Cyber & Certs" },
  { id: "universities_moocs", label: "Coursera · edX · MIT · Harvard", countBadge: "University" },
  { id: "trades_medical_industry", label: "OSHA · NCCER · ASE · Medscape · CFA", countBadge: "Trades & Clinical" },
]

export const LEARNING_VENDOR_SOURCES: LearningVendorSource[] = [
  // ============================================================================
  // 1. FLAGSHIP PUBLISHING & ENTERPRISE LEARNING PLATFORMS
  // ============================================================================
  {
    id: "oreilly-media",
    name: "O'Reilly Media Learning",
    shortName: "O'Reilly",
    category: "publishing_platforms",
    categoryLabel: "Books, Live Training & Cloud Sandboxes",
    tagline: "The gold standard for technical books, live instructor cohorts, interactive labs & architecture certification prep.",
    description:
      "Access 60,000+ O'Reilly technical books, early-release manuscripts, live expert training events, interactive Kubernetes/Cloud sandboxes, and full certification prep tracks.",
    logoText: "O'REILLY",
    accentGradient: "from-red-600 via-rose-600 to-orange-600",
    badgeText: "OFFICIAL PUBLISHING & LABS",
    officialUrl: "https://www.oreilly.com/online-learning/",
    searchUrlTemplate: "https://www.oreilly.com/search/?q={query}",
    popularTopics: [
      "Designing Data-Intensive Applications",
      "AI Engineering & LLM Agents",
      "Kubernetes & Cloud Native",
      "Zero Trust Security Architecture",
      "Rust & Systems Programming",
    ],
    quickLinks: [
      { label: "O'Reilly Learning Portal", url: "https://learning.oreilly.com/", badge: "Sign In / Launch" },
      { label: "AI & LLM Books & Courses", url: "https://www.oreilly.com/topics/ai-ml/", badge: "AI & ML" },
      { label: "Software Architecture", url: "https://www.oreilly.com/topics/software-architecture/", badge: "Architecture" },
      { label: "Security & Cert Prep", url: "https://www.oreilly.com/topics/security/", badge: "Security" },
    ],
    supportsCeus: true,
    ceuBadge: "ISC2 CPE · CompTIA CEU · PMI PDU",
    featuredFlagship: true,
    defaultConnected: true,
  },
  {
    id: "linkedin-learning",
    name: "LinkedIn Learning",
    shortName: "LinkedIn Learning",
    category: "publishing_platforms",
    categoryLabel: "Role Guides, Career Paths & Professional Certs",
    tagline: "21,000+ expert-led courses across software, business, leadership, AI, and official certification prep.",
    description:
      "Connect directly to LinkedIn Learning role guides, NASBA/PMI/ISC2-accredited CEU courses, Microsoft/Atlassian/GitHub professional certificates, and executive leadership tracks.",
    logoText: "in Learning",
    accentGradient: "from-[#0A66C2] via-blue-700 to-sky-600",
    badgeText: "LINKEDIN LEARNING HUB",
    officialUrl: "https://www.linkedin.com/learning/",
    searchUrlTemplate: "https://www.linkedin.com/learning/search?keywords={query}",
    popularTopics: [
      "Generative AI & Copilot Productivity",
      "Cloud & Cybersecurity Career Paths",
      "Executive Leadership & Product Management",
      "PMP, CISSP & CompTIA Exam Prep",
      "Full-Stack TypeScript & Python",
    ],
    quickLinks: [
      { label: "LinkedIn Learning Home", url: "https://www.linkedin.com/learning/", badge: "Launch" },
      { label: "Role Guides & Career Paths", url: "https://www.linkedin.com/learning/role-guides", badge: "Paths" },
      { label: "Professional Certificates", url: "https://www.linkedin.com/learning/ topics/professional-certifications", badge: "Certificates" },
      { label: "Artificial Intelligence Track", url: "https://www.linkedin.com/learning/topics/artificial-intelligence", badge: "AI" },
    ],
    supportsCeus: true,
    ceuBadge: "PMI PDU · NASBA CPE · HRCI · CompTIA",
    featuredFlagship: true,
    defaultConnected: true,
  },
  {
    id: "github-learning",
    name: "GitHub Skills, Docs & Open Source",
    shortName: "GitHub",
    category: "code_opensource",
    categoryLabel: "Interactive Git Repositories, Actions & Copilot Labs",
    tagline: "Learn by building inside real GitHub repositories with automated GitHub Actions grading & open-source roadmaps.",
    description:
      "Master Git workflows, CI/CD pipelines with GitHub Actions, GitHub Copilot agentic coding, DevSecOps CodeQL scanning, and curated open-source engineering roadmaps.",
    logoText: "GitHub",
    accentGradient: "from-zinc-900 via-slate-800 to-indigo-950",
    badgeText: "GITHUB SKILLS & REPOS",
    officialUrl: "https://skills.github.com/",
    searchUrlTemplate: "https://github.com/search?q={query}&type=repositories",
    popularTopics: [
      "GitHub Copilot & Agentic Workflows",
      "GitHub Actions CI/CD Automation",
      "System Design Primer & Roadmaps",
      "GitHub Advanced Security & CodeQL",
      "Awesome AI Agents & LLM Repos",
    ],
    quickLinks: [
      { label: "GitHub Skills Interactive Courses", url: "https://skills.github.com/", badge: "Interactive" },
      { label: "GitHub Certifications Portal", url: "https://resources.github.com/learn/certifications/", badge: "Certs" },
      { label: "Curated Learning Collections", url: "https://github.com/topics/learning", badge: "Repos" },
      { label: "Developer Roadmaps (roadmap.sh)", url: "https://roadmap.sh/", badge: "Roadmaps" },
    ],
    supportsCeus: true,
    ceuBadge: "GitHub Verified Badges & Credly",
    featuredFlagship: true,
    defaultConnected: true,
  },
  {
    id: "pluralsight-acg",
    name: "Pluralsight Skills & A Cloud Guru",
    shortName: "Pluralsight",
    category: "publishing_platforms",
    categoryLabel: "Skill IQ Assessments & Live Cloud Sandboxes",
    tagline: "Deep-dive enterprise engineering paths, Skill IQ benchmarking, and disposable AWS/Azure/GCP sandboxes.",
    description:
      "Benchmark your engineering mastery with Pluralsight Skill IQ and Role IQ, and spin up real hands-on cloud environments via A Cloud Guru without risking production bills.",
    logoText: "PLURALSIGHT",
    accentGradient: "from-pink-600 via-rose-600 to-purple-700",
    badgeText: "SKILL IQ & CLOUD LABS",
    officialUrl: "https://www.pluralsight.com/",
    searchUrlTemplate: "https://www.pluralsight.com/search?q={query}",
    popularTopics: [
      "AWS / Azure / GCP Hands-On Sandboxes",
      "C# / .NET / Go / Rust Architecture",
      "Cybersecurity Red & Blue Team Paths",
      "Kubernetes & Terraform Automation",
    ],
    quickLinks: [
      { label: "Pluralsight Skills", url: "https://www.pluralsight.com/product/skills", badge: "Skills" },
      { label: "Cloud Guru Sandboxes", url: "https://www.pluralsight.com/cloud-guru", badge: "Cloud" },
      { label: "Cybersecurity Tracks", url: "https://www.pluralsight.com/browse/information-cyber-security", badge: "Security" },
    ],
    supportsCeus: true,
    ceuBadge: "CompTIA · ISC2 · PMI Approved",
    featuredFlagship: true,
    defaultConnected: false,
  },

  // ============================================================================
  // 2. CLOUD, AI & SOFTWARE VENDOR ACADEMIES
  // ============================================================================
  {
    id: "microsoft-learn",
    name: "Microsoft Learn & Applied Skills",
    shortName: "Microsoft Learn",
    category: "cloud_ai_vendors",
    categoryLabel: "Azure, AI Foundry, Security & GitHub Certifications",
    tagline: "Official free interactive documentation, Azure sandboxes, Applied Skills labs, and Microsoft Certification tracks.",
    description:
      "Complete guided learning modules with free built-in Azure Cloud Shell sandboxes across Azure Architecture (AZ-104/305), Cybersecurity (SC-100/AZ-500), and Azure AI Engineer (AI-102).",
    logoText: "Microsoft",
    accentGradient: "from-sky-600 via-blue-600 to-indigo-700",
    badgeText: "OFFICIAL VENDOR ACADEMY",
    officialUrl: "https://learn.microsoft.com/en-us/training/",
    searchUrlTemplate: "https://learn.microsoft.com/en-us/search/?terms={query}",
    popularTopics: [
      "AZ-500 & SC-100 Cybersecurity Architect",
      "AI-102 Azure AI & Copilot Studio",
      "AZ-305 Azure Solutions Architect",
      "Microsoft Applied Skills Interactive Labs",
    ],
    quickLinks: [
      { label: "Microsoft Learn Catalog", url: "https://learn.microsoft.com/en-us/training/browse/", badge: "Catalog" },
      { label: "Credentials & Certifications", url: "https://learn.microsoft.com/en-us/credentials/", badge: "Certs" },
      { label: "AI & Copilot Learning Hub", url: "https://learn.microsoft.com/en-us/ai/", badge: "AI Hub" },
    ],
    supportsCeus: true,
    ceuBadge: "Official Microsoft Credentials",
    featuredFlagship: true,
    defaultConnected: true,
  },
  {
    id: "aws-skill-builder",
    name: "AWS Skill Builder & AWS Workshops",
    shortName: "AWS Skill Builder",
    category: "cloud_ai_vendors",
    categoryLabel: "AWS Cloud Quest, Jam Labs & Architect Certifications",
    tagline: "600+ digital courses, AWS SimuLearn, Cloud Quest role-playing labs, and official AWS Certification practice exams.",
    description:
      "Train directly with Amazon Web Services architects on Solutions Architecture, AWS Security Specialty, Amazon Bedrock Generative AI, and open-source AWS Workshops.",
    logoText: "AWS",
    accentGradient: "from-amber-500 via-orange-600 to-slate-900",
    badgeText: "OFFICIAL AWS TRAINING",
    officialUrl: "https://explore.skillbuilder.aws/",
    searchUrlTemplate: "https://explore.skillbuilder.aws/learn/public/catalog/view/1?ctldoc_search_text={query}",
    popularTopics: [
      "AWS Certified Solutions Architect (SAA/SAP)",
      "AWS Certified Security – Specialty (SCS-C02)",
      "Generative AI with Amazon Bedrock",
      "Self-Paced AWS Workshops (workshops.aws)",
    ],
    quickLinks: [
      { label: "AWS Skill Builder", url: "https://explore.skillbuilder.aws/", badge: "Portal" },
      { label: "Hands-On AWS Workshops", url: "https://workshops.aws/", badge: "Free Labs" },
      { label: "AWS Certification Paths", url: "https://aws.amazon.com/certification/", badge: "Certs" },
    ],
    supportsCeus: true,
    ceuBadge: "AWS Credly Digital Badges",
    featuredFlagship: true,
    defaultConnected: true,
  },
  {
    id: "google-cloud-skills-boost",
    name: "Google Cloud Skills Boost & DeepMind",
    shortName: "Google Cloud",
    category: "cloud_ai_vendors",
    categoryLabel: "Qwiklabs Sandboxes, Vertex AI & Kubernetes",
    tagline: "Official Google Cloud Qwiklabs hands-on labs, Gemini/Vertex AI credentials, and SRE/GKE architecture.",
    description:
      "Earn Google Cloud Skill Badges with real temporary GCP console credentials, master Kubernetes (GKE), Chronicle SecOps, and Google DeepMind AI courses.",
    logoText: "Google Cloud",
    accentGradient: "from-blue-600 via-emerald-600 to-amber-500",
    badgeText: "QWIKLABS & VERTEX AI",
    officialUrl: "https://www.cloudskillsboost.google/",
    searchUrlTemplate: "https://www.cloudskillsboost.google/catalog?keywords={query}",
    popularTopics: [
      "Generative AI & Vertex AI Studio",
      "Google Cloud Professional Architect & Security",
      "Kubernetes Engine (GKE) & Istio Service Mesh",
      "Google Cybersecurity Certificate",
    ],
    quickLinks: [
      { label: "Cloud Skills Boost Catalog", url: "https://www.cloudskillsboost.google/catalog", badge: "Labs" },
      { label: "Google AI Learning Paths", url: "https://www.cloudskillsboost.google/paths", badge: "AI Paths" },
      { label: "Google Cloud Certifications", url: "https://cloud.google.com/learn/certification", badge: "Certs" },
    ],
    supportsCeus: true,
    ceuBadge: "Google Cloud Skill Badges",
    featuredFlagship: false,
    defaultConnected: false,
  },
  {
    id: "nvidia-dli",
    name: "NVIDIA Deep Learning Institute (DLI)",
    shortName: "NVIDIA DLI",
    category: "cloud_ai_vendors",
    categoryLabel: "GPU Accelerated Computing, CUDA & LLM Training",
    tagline: "Hands-on GPU cloud workstations in the browser for LLMs, RAG, CUDA C++/Python, and robotics simulation.",
    description:
      "Launch fully configured NVIDIA H100/A100 GPU Jupyter notebooks in the cloud to train transformers, build NeMo guardrails, and earn NVIDIA DLI certificates.",
    logoText: "NVIDIA",
    accentGradient: "from-lime-600 via-emerald-600 to-slate-900",
    badgeText: "GPU & AI WORKSTATIONS",
    officialUrl: "https://www.nvidia.com/en-us/training/",
    searchUrlTemplate: "https://www.nvidia.com/en-us/training/find-training/?q={query}",
    popularTopics: [
      "Generative AI & LLM Deployment (NIM / TensorRT)",
      "Accelerated Computing with CUDA Python/C++",
      "RAG Agents & NeMo Guardrails",
      "Digital Twins & Isaac Robotics",
    ],
    quickLinks: [
      { label: "NVIDIA Self-Paced Catalog", url: "https://www.nvidia.com/en-us/training/online/", badge: "Courses" },
      { label: "NVIDIA Certifications", url: "https://www.nvidia.com/en-us/training/certification/", badge: "Certs" },
    ],
    supportsCeus: true,
    ceuBadge: "NVIDIA DLI Verified Certificates",
    featuredFlagship: false,
    defaultConnected: false,
  },
  {
    id: "huggingface-deeplearning-ai",
    name: "DeepLearning.AI, Hugging Face & Anthropic",
    shortName: "DeepLearning.AI & HF",
    category: "cloud_ai_vendors",
    categoryLabel: "Open-Weight LLMs, Agentic Workflows & MCP",
    tagline: "Short courses by Andrew Ng, Hugging Face open-source NLP/RLHF courses, and Anthropic Claude engineering guides.",
    description:
      "Master fine-tuning open-weight models (Llama, Qwen, DeepSeek), multi-agent orchestration, Model Context Protocol (MCP), and computer vision.",
    logoText: "HF · DL.AI",
    accentGradient: "from-amber-500 via-rose-500 to-indigo-700",
    badgeText: "FRONTIER AI LABS",
    officialUrl: "https://www.deeplearning.ai/short-courses/",
    searchUrlTemplate: "https://huggingface.co/docs?search={query}",
    popularTopics: [
      "Agentic AI Design Patterns",
      "Hugging Face LLM, Agents & RL Courses",
      "Anthropic Prompt Engineering & MCP",
      "OpenAI Cookbook & Evals",
    ],
    quickLinks: [
      { label: "DeepLearning.AI Short Courses", url: "https://www.deeplearning.ai/short-courses/", badge: "Free Courses" },
      { label: "Hugging Face Learn Hub", url: "https://huggingface.co/learn", badge: "HF Courses" },
      { label: "Anthropic Interactive Courses", url: "https://github.com/anthropics/courses", badge: "Anthropic" },
      { label: "OpenAI Cookbook", url: "https://cookbook.openai.com/", badge: "OpenAI" },
    ],
    supportsCeus: true,
    ceuBadge: "DeepLearning.AI & HF Certificates",
    featuredFlagship: false,
    defaultConnected: true,
  },
  {
    id: "linux-foundation-cncf",
    name: "Linux Foundation, CNCF & Red Hat",
    shortName: "Linux Foundation",
    category: "cloud_ai_vendors",
    categoryLabel: "Kubernetes (CKA/CKAD/CKS), Linux Kernel & eBPF",
    tagline: "Vendor-neutral cloud-native infrastructure, Linux kernel engineering, and performance-based Kubernetes certifications.",
    description:
      "Official training and hands-on exam simulators for Certified Kubernetes Administrator (CKA), CKAD, CKS, Linux System Administration, and OpenSSF secure software.",
    logoText: "LF / CNCF",
    accentGradient: "from-blue-800 via-indigo-800 to-slate-900",
    badgeText: "KUBERNETES & LINUX",
    officialUrl: "https://training.linuxfoundation.org/",
    searchUrlTemplate: "https://training.linuxfoundation.org/full-catalog/?_sft_search={query}",
    popularTopics: [
      "CKA / CKAD / CKS Kubernetes Security",
      "Linux Kernel Internals & eBPF Tracing",
      "Red Hat Enterprise Linux (RHCSA / RHCE)",
      "FinOps & OpenTelemetry Observability",
    ],
    quickLinks: [
      { label: "Linux Foundation Catalog", url: "https://training.linuxfoundation.org/full-catalog/", badge: "Catalog" },
      { label: "Red Hat Developer Learning", url: "https://developers.redhat.com/learn", badge: "Red Hat" },
    ],
    supportsCeus: true,
    ceuBadge: "LF & CNCF Verified Credentials",
    featuredFlagship: false,
    defaultConnected: false,
  },
  {
    id: "cisco-hashicorp",
    name: "Cisco Networking Academy & HashiCorp",
    shortName: "Cisco & HashiCorp",
    category: "cloud_ai_vendors",
    categoryLabel: "CCNA/CCNP Routing, Zero Trust & Terraform IaC",
    tagline: "Packet Tracer network labs, Cisco CyberOps, and official HashiCorp Terraform & Vault infrastructure tutorials.",
    description:
      "Build enterprise BGP/OSPF/SD-WAN topologies in Cisco NetAcad and automate multi-cloud infrastructure and secrets management with HashiCorp Developer tutorials.",
    logoText: "CISCO · HCP",
    accentGradient: "from-cyan-600 via-blue-700 to-purple-800",
    badgeText: "NETWORKING & IAC",
    officialUrl: "https://www.netacad.com/",
    searchUrlTemplate: "https://developer.hashicorp.com/tutorials/library?product={query}",
    popularTopics: [
      "Cisco CCNA & CCNP Enterprise / Security",
      "Terraform Infrastructure as Code Associate",
      "HashiCorp Vault Secrets Management",
      "Packet Tracer Network Simulators",
    ],
    quickLinks: [
      { label: "Cisco Networking Academy", url: "https://www.netacad.com/", badge: "NetAcad" },
      { label: "Cisco U. Technical Learning", url: "https://u.cisco.com/", badge: "Cisco U." },
      { label: "HashiCorp Developer Tutorials", url: "https://developer.hashicorp.com/tutorials", badge: "Terraform/Vault" },
    ],
    supportsCeus: true,
    ceuBadge: "Cisco CE Credits & HashiCorp Certs",
    featuredFlagship: false,
    defaultConnected: false,
  },

  // ============================================================================
  // 3. CODE, OPEN SOURCE & DEVELOPER PLATFORMS
  // ============================================================================
  {
    id: "freecodecamp-odin",
    name: "freeCodeCamp, MDN & Frontend Masters",
    shortName: "freeCodeCamp & MDN",
    category: "code_opensource",
    categoryLabel: "Interactive Browser Coding & Full-Stack Curricula",
    tagline: "3,000+ hours of free interactive coding challenges, MDN Web Docs specifications, and deep engineering workshops.",
    description:
      "Write production code directly in the browser across Responsive Web Design, JavaScript/TypeScript Algorithms, Python Data Science, Information Security, and Relational Databases.",
    logoText: "fCC · MDN",
    accentGradient: "from-slate-800 via-emerald-700 to-teal-800",
    badgeText: "OPEN-SOURCE CODING",
    officialUrl: "https://www.freecodecamp.org/learn",
    searchUrlTemplate: "https://www.freecodecamp.org/news/search/?query={query}",
    popularTopics: [
      "Full-Stack JavaScript, React & Next.js",
      "Python Scientific Computing & Machine Learning",
      "MDN Web APIs & Browser Internals",
      "Backend APIs, SQL & Microservices",
    ],
    quickLinks: [
      { label: "freeCodeCamp Curriculum", url: "https://www.freecodecamp.org/learn", badge: "3,000h Free" },
      { label: "MDN Web Docs Curriculum", url: "https://developer.mozilla.org/en-US/curriculum/", badge: "MDN" },
      { label: "Frontend Masters", url: "https://frontendmasters.com/courses/", badge: "Workshops" },
      { label: "LeetCode Algorithms", url: "https://leetcode.com/problemset/", badge: "Practice" },
    ],
    supportsCeus: true,
    ceuBadge: "Verified Open-Source Certifications",
    featuredFlagship: false,
    defaultConnected: false,
  },

  // ============================================================================
  // 4. CYBERSECURITY, DEFENSE & GOVERNANCE AUTHORITIES
  // ============================================================================
  {
    id: "isc2-sans-comptia",
    name: "ISC2, SANS Institute & CompTIA Hub",
    shortName: "ISC2 · SANS · CompTIA",
    category: "cyber_governance",
    categoryLabel: "CISSP, CCSP, GIAC, Security+ & DoD 8140 Compliance",
    tagline: "Authoritative cybersecurity certification bodies, SANS DFIR reading rooms, and CompTIA CertMaster labs.",
    description:
      "Connect directly to ISC2 official CPE webinars and CISSP/CCSP study portals, SANS Whitepaper Reading Room, and CompTIA Security+/CySA+/CASP+ training.",
    logoText: "ISC2 · SANS",
    accentGradient: "from-emerald-700 via-teal-700 to-slate-900",
    badgeText: "CYBER AUTHORITIES",
    officialUrl: "https://www.isc2.org/training",
    searchUrlTemplate: "https://www.sans.org/search/?q={query}",
    popularTopics: [
      "CISSP & CCSP Security Architecture",
      "CompTIA Security+ (SY0-701) & CASP+",
      "SANS GIAC Incident Response & Forensics",
      "DoD 8140 / 8570 Baseline Certifications",
    ],
    quickLinks: [
      { label: "ISC2 Training & CPE Webinars", url: "https://www.isc2.org/training", badge: "ISC2" },
      { label: "SANS Reading Room & Courses", url: "https://www.sans.org/white-papers/", badge: "SANS" },
      { label: "CompTIA CertMaster Learn", url: "https://www.comptia.org/training", badge: "CompTIA" },
    ],
    supportsCeus: true,
    ceuBadge: "Official CPE / CEU Issuing Authorities",
    featuredFlagship: true,
    defaultConnected: true,
  },
  {
    id: "tryhackme-htb-offsec",
    name: "TryHackMe, Hack The Box & OffSec",
    shortName: "HTB · TryHackMe · OffSec",
    category: "cyber_governance",
    categoryLabel: "Live Offensive & Defensive Cyber Ranges (OSCP)",
    tagline: "Browser-based Kali Linux attack boxes, Active Directory labs, SOC simulator rooms, and OffSec OSCP proving grounds.",
    description:
      "Practice real-world penetration testing, red-team exploitation, malware reverse engineering, and SIEM threat hunting in isolated virtual networks.",
    logoText: "HTB · THM",
    accentGradient: "from-lime-500 via-emerald-700 to-zinc-900",
    badgeText: "LIVE CYBER RANGES",
    officialUrl: "https://tryhackme.com/",
    searchUrlTemplate: "https://tryhackme.com/hacktivities?search={query}",
    popularTopics: [
      "OSCP (PEN-200) Offensive Security Prep",
      "SOC Level 1 & Level 2 Threat Hunting",
      "Active Directory Kerberoasting & PrivEsc",
      "OWASP Top 10 & PortSwigger Web Security Academy",
    ],
    quickLinks: [
      { label: "TryHackMe Cyber Rooms", url: "https://tryhackme.com/hacktivities", badge: "TryHackMe" },
      { label: "Hack The Box Academy", url: "https://academy.hackthebox.com/", badge: "HTB Academy" },
      { label: "PortSwigger Web Security Labs", url: "https://portswigger.net/web-security/all-labs", badge: "Free Web Labs" },
      { label: "OffSec Proving Grounds", url: "https://www.offsec.com/labs/", badge: "OSCP" },
    ],
    supportsCeus: true,
    ceuBadge: "CPE Transcripts for ISC2 & CompTIA",
    featuredFlagship: false,
    defaultConnected: false,
  },
  {
    id: "isaca-pmi-nist",
    name: "ISACA, PMI, NIST & DoD Cyber Exchange",
    shortName: "ISACA · PMI · NIST",
    category: "cyber_governance",
    categoryLabel: "CISM, CISA, PMP, NIST AI RMF & RMF cATO",
    tagline: "Executive governance, IT audit, PMP project leadership, and federal NIST 800-53 / AI RMF publications.",
    description:
      "Access official NIST Computer Security Resource Center (CSRC) special publications, DoD Cyber Exchange STIG/RMF training, ISACA CISM/CISA, and PMI PMP PDU courses.",
    logoText: "NIST · PMI",
    accentGradient: "from-indigo-700 via-slate-800 to-blue-900",
    badgeText: "GOVERNANCE & FEDERAL",
    officialUrl: "https://csrc.nist.gov/publications",
    searchUrlTemplate: "https://csrc.nist.gov/publications/search?keywords={query}",
    popularTopics: [
      "NIST SP 800-53 Rev. 5 & OSCAL cATO",
      "NIST AI Risk Management Framework (AI RMF)",
      "ISACA CISM, CISA & CRISC Audit",
      "PMI PMP & Agile ACP Leadership",
    ],
    quickLinks: [
      { label: "NIST CSRC Publications", url: "https://csrc.nist.gov/publications", badge: "NIST" },
      { label: "DoD Cyber Exchange Training", url: "https://public.cyber.mil/training/", badge: "DoD Cyber" },
      { label: "ISACA Learning Portal", url: "https://www.isaca.org/training-and-events", badge: "ISACA" },
      { label: "PMI eLearning & PDUs", url: "https://www.pmi.org/learning", badge: "PMI" },
    ],
    supportsCeus: true,
    ceuBadge: "PMI PDU · ISACA CPE · DoD Certificates",
    featuredFlagship: false,
    defaultConnected: false,
  },

  // ============================================================================
  // 5. UNIVERSITIES, MOOCS & RESEARCH CONSORTIA
  // ============================================================================
  {
    id: "coursera-edx-mit",
    name: "Coursera, edX, MIT OpenCourseWare & Harvard",
    shortName: "Coursera · edX · MIT",
    category: "universities_moocs",
    categoryLabel: "University MicroMasters, Stanford, MIT & Ivy League",
    tagline: " Accredited university specializations, MIT OpenCourseWare lecture notes/videos, and Harvard CS50.",
    description:
      "Connect to Stanford Machine Learning, MIT OpenCourseWare engineering syllabi, Harvard CS50, and executive MicroMasters certificates on Coursera and edX.",
    logoText: "MIT · edX",
    accentGradient: "from-blue-700 via-indigo-700 to-rose-700",
    badgeText: "UNIVERSITY & MOOCS",
    officialUrl: "https://www.coursera.org/",
    searchUrlTemplate: "https://www.coursera.org/search?query={query}",
    popularTopics: [
      "Stanford & DeepLearning.AI Machine Learning",
      "MIT OpenCourseWare (6.006 Algorithms & 6.824 Distributed Systems)",
      "Harvard CS50 Computer Science & Cybersecurity",
      "Wharton & Harvard Business Strategy",
    ],
    quickLinks: [
      { label: "Coursera Catalog", url: "https://www.coursera.org/browse", badge: "Coursera" },
      { label: "edX University Courses", url: "https://www.edx.org/search", badge: "edX" },
      { label: "MIT OpenCourseWare", url: "https://ocw.mit.edu/", badge: "MIT Free" },
      { label: "Harvard CS50 Portal", url: "https://cs50.harvard.edu/", badge: "Harvard" },
    ],
    supportsCeus: true,
    ceuBadge: "University Verified Certificates & CEUs",
    featuredFlagship: true,
    defaultConnected: false,
  },

  // ============================================================================
  // 6. TRADES, HEALTHCARE, AUTOMOTIVE & INDUSTRY AUTHORITIES
  // ============================================================================
  {
    id: "trades-osha-nccer-autodesk",
    name: "OSHA, NCCER, Procore & Autodesk Academy",
    shortName: "OSHA · NCCER · Autodesk",
    category: "trades_medical_industry",
    categoryLabel: "Construction Trades, Master Carpentry, NEC & BIM/CAD",
    tagline: "Official OSHA 10/30 safety credentials, NCCER craft training, Procore field certificates, and Autodesk Revit/AutoCAD.",
    description:
      "Connect tradesmen, general contractors, and civil engineers directly to NCCER apprenticeship curricula, OSHA safety standards, Procore Construction OS, and Autodesk CAD/BIM tutorials.",
    logoText: "NCCER · OSHA",
    accentGradient: "from-amber-600 via-orange-700 to-stone-800",
    badgeText: "TRADES & CONSTRUCTION",
    officialUrl: "https://www.nccer.org/",
    searchUrlTemplate: "https://www.osha.gov/search?keys={query}",
    popularTopics: [
      "OSHA 10 & OSHA 30 Construction Safety",
      "NCCER Carpentry, Electrical (NEC) & HVAC",
      "Autodesk AutoCAD, Revit BIM & Fusion 360",
      "Procore Certified Construction Manager",
    ],
    quickLinks: [
      { label: "NCCER Craft Training", url: "https://www.nccer.org/", badge: "NCCER" },
      { label: "OSHA Training & Standards", url: "https://www.osha.gov/training", badge: "OSHA" },
      { label: "Procore Free Certifications", url: "https://learn.procore.com/", badge: "Procore" },
      { label: "Autodesk Learn & Certs", url: "https://www.autodesk.com/learn", badge: "CAD/BIM" },
    ],
    supportsCeus: true,
    ceuBadge: "NCCER Registry · AIA LU · OSHA Cards",
    featuredFlagship: false,
    defaultConnected: false,
  },
  {
    id: "healthcare-medscape-nejm-aacn",
    name: "Medscape CME, NEJM Knowledge+ & PubMed",
    shortName: "Medscape · NEJM · PubMed",
    category: "trades_medical_industry",
    categoryLabel: "Physician AMA PRA Category 1 CME, Nursing CEUs & Clinical Trials",
    tagline: "Accredited medical continuing education, surgical board prep, critical care nursing CEUs, and NCBI PubMed literature.",
    description:
      "Access AMA PRA Category 1 CME activities, American Heart Association ACLS/BLS guidelines, AACN critical care nursing modules, and live PubMed clinical evidence.",
    logoText: "CME · NEJM",
    accentGradient: "from-teal-600 via-cyan-700 to-blue-800",
    badgeText: "MEDICAL & CLINICAL CME",
    officialUrl: "https://www.medscape.org/",
    searchUrlTemplate: "https://pubmed.ncbi.nlm.nih.gov/?term={query}",
    popularTopics: [
      "AMA PRA Category 1 Physician CME",
      "AACN CCRN & Trauma Nursing (TNCC) CEUs",
      "NEJM Board Review & Clinical Cases",
      "PubMed & Cochrane Clinical Evidence",
    ],
    quickLinks: [
      { label: "Medscape Free CME/CE", url: "https://www.medscape.org/", badge: "Free CME" },
      { label: "PubMed Clinical Search", url: "https://pubmed.ncbi.nlm.nih.gov/", badge: "PubMed" },
      { label: "NEJM Knowledge+", url: "https://knowledgeplus.nejm.org/", badge: "Board Prep" },
      { label: "AACN Nursing CE Portal", url: "https://www.aacn.org/education/ce-activities", badge: "Nursing CE" },
    ],
    supportsCeus: true,
    ceuBadge: "AMA PRA Cat 1 · ANCC Nursing CE",
    featuredFlagship: false,
    defaultConnected: false,
  },
  {
    id: "automotive-ase-pico-sae",
    name: "ASE Campus, PicoScope Library & SAE International",
    shortName: "ASE · PicoScope · SAE",
    category: "trades_medical_industry",
    categoryLabel: "Master Automotive Technician (A1–A8), EV High-Voltage & CAN-FD",
    tagline: "Official ASE study guides, PicoScope automotive waveform library, and SAE EV battery & J1939 standards.",
    description:
      "Prepare for ASE Master Technician certifications (A1–A9, L1, L3 Light Duty Hybrid/EV), study real oscilloscope waveforms, and access SAE mobility engineering standards.",
    logoText: "ASE · SAE",
    accentGradient: "from-red-700 via-amber-600 to-zinc-900",
    badgeText: "AUTOMOTIVE & EV",
    officialUrl: "https://www.ase.com/ase-study-guides",
    searchUrlTemplate: "https://www.sae.org/search/?qt={query}",
    popularTopics: [
      "ASE A1–A8 Master Technician Study Guides",
      "ASE L3 High-Voltage Hybrid/EV Specialist",
      "PicoScope Automotive Waveform Diagnostics",
      "SAE J1939 Heavy-Duty & CAN-FD Protocols",
    ],
    quickLinks: [
      { label: "Official ASE Study Guides", url: "https://www.ase.com/ase-study-guides", badge: "ASE" },
      { label: "PicoScope Auto Library", url: "https://www.picoauto.com/library", badge: "Waveforms" },
      { label: "SAE Professional Development", url: "https://www.sae.org/learn/", badge: "SAE" },
    ],
    supportsCeus: true,
    ceuBadge: "ASE Credentials & SAE CEUs",
    featuredFlagship: false,
    defaultConnected: false,
  },
  {
    id: "finance-cfa-aicpa-bloomberg",
    name: "CFA Institute, AICPA-CIMA & Corporate Finance Institute",
    shortName: "CFA · AICPA · CFI",
    category: "trades_medical_industry",
    categoryLabel: "Quantitative Finance, CPA CPE, Financial Modeling & FinTech",
    tagline: "Institutional finance credentials, NASBA CPA CPE credits, financial modeling, and capital markets training.",
    description:
      "Connect to CFA Institute learning ecosystems, AICPA CPA continuing professional education, and Corporate Finance Institute (CFI) FMVA modeling tracks.",
    logoText: "CFA · CPA",
    accentGradient: "from-emerald-800 via-teal-800 to-slate-900",
    badgeText: "FINANCE & ACCOUNTING",
    officialUrl: "https://www.cfainstitute.org/",
    searchUrlTemplate: "https://corporatefinanceinstitute.com/?s={query}",
    popularTopics: [
      "CFA Level I, II & III Portfolio Management",
      "AICPA & NASBA Accredited CPA CPE",
      "Financial Modeling & Valuation (FMVA)",
      "Algorithmic Trading & Quantitative Risk",
    ],
    quickLinks: [
      { label: "CFA Institute Learning", url: "https://www.cfainstitute.org/programs/cfa", badge: "CFA" },
      { label: "AICPA-CIMA CPE Learning", url: "https://www.aicpa-cima.com/cpe-learning", badge: "CPA CPE" },
      { label: "Corporate Finance Institute", url: "https://corporatefinanceinstitute.com/", badge: "CFI" },
    ],
    supportsCeus: true,
    ceuBadge: "NASBA CPE · CFA PL Credits",
    featuredFlagship: false,
    defaultConnected: false,
  },
]

/**
 * Helper to generate deep vendor search links for any course, certification, or skill topic
 */
export function getVendorTopicSearchLinks(topicQuery: string) {
  const encoded = encodeURIComponent(topicQuery.trim())
  return [
    {
      vendorId: "oreilly-media",
      name: "O'Reilly Media",
      shortLabel: "O'Reilly",
      url: `https://www.oreilly.com/search/?q=${encoded}`,
      badgeClass: "bg-red-50 text-red-700 border-red-200 hover:bg-red-600 hover:text-white dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
    },
    {
      vendorId: "linkedin-learning",
      name: "LinkedIn Learning",
      shortLabel: "LinkedIn Learning",
      url: `https://www.linkedin.com/learning/search?keywords=${encoded}`,
      badgeClass: "bg-blue-50 text-[#0A66C2] border-blue-200 hover:bg-[#0A66C2] hover:text-white dark:bg-blue-950/50 dark:text-sky-300 dark:border-blue-800",
    },
    {
      vendorId: "github-learning",
      name: "GitHub Repositories & Labs",
      shortLabel: "GitHub",
      url: `https://github.com/search?q=${encoded}&type=repositories`,
      badgeClass: "bg-zinc-100 text-zinc-800 border-zinc-300 hover:bg-zinc-900 hover:text-white dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700",
    },
    {
      vendorId: "microsoft-learn",
      name: "Microsoft Learn",
      shortLabel: "MS Learn",
      url: `https://learn.microsoft.com/en-us/search/?terms=${encoded}`,
      badgeClass: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-600 hover:text-white dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800",
    },
    {
      vendorId: "coursera-edx-mit",
      name: "Coursera",
      shortLabel: "Coursera",
      url: `https://www.coursera.org/search?query=${encoded}`,
      badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
    },
  ]
}
