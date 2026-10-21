import {
  RoadmapStepWhitePaper,
  SkillDeepDiveSpec,
  WhitePaperPage
} from "./learning-roadmap-whitepapers"

export interface ConnectLnCatalogCourse {
  id: string
  shelfId: string
  academyTrack: "cyber_specialist" | "ai_studies"
  title: string
  badge?: "Popular" | "Updated · Popular" | "New" | "Cert Prep" | "Project" | "Learning Path" | "Certification"
  duration: string
  author: string
  releaseDate?: string
  learnersCount?: string
  socialProof?: string
  updateNotice?: string
  aiFrameworkLevel?: string
  skills: string[]
  category:
    | "Cybersecurity"
    | "AI & Agentic Systems"
    | "GRC & Audit"
    | "Networking & Packets"
    | "Cloud & Data"
    | "Leadership & Consulting"
  thumbnail: string
  customCoverArt: string
  referenceUrl: string
  summary: string
}

export interface ConnectLnCourseShelf {
  id: string
  academyTrack: "cyber_specialist" | "ai_studies"
  title: string
  subtitle: string
  totalCountBadge?: string
  filterPills?: string[]
  courses: ConnectLnCatalogCourse[]
}

export interface ConnectLnTrainingSlide {
  slideNumber: number
  totalSlides: number
  badge: string
  title: string
  subtitle: string
  coverImage: string
  bullets: string[]
  codeOrDiagram: string
  speakerNotes: string
  primarySourceCitation: string
}

export interface ConnectLnVideoChapter {
  chapterNumber: number
  timestamp: string
  title: string
  duration: string
  summary: string
}

export interface ConnectLnVisualPlate {
  id: string
  title: string
  caption: string
  imageUrl: string
  standardTag: string
}

export interface ConnectLnLegitimateSource {
  title: string
  organization: string
  url: string
  type: "Standard / RFC" | "Official Documentation" | "Peer-Reviewed Framework" | "Certification Blueprint"
}

export interface ConnectLnCourseMultimediaDossier {
  course: ConnectLnCatalogCourse
  whitePaper: RoadmapStepWhitePaper
  youtubeId: string
  fallbackMp4Url: string
  videoChapters: ConnectLnVideoChapter[]
  slides: ConnectLnTrainingSlide[]
  visualPlates: ConnectLnVisualPlate[]
  legitimateSources: ConnectLnLegitimateSource[]
}

export const CONNECTLN_TOP_10_AI_SKILLS: {
  name: string
  category: string
  learners: string
  defaultFollowed: boolean
  summary: string
}[] = [
  {
    name: "Machine Learning",
    category: "Core AI Engineering",
    learners: "4,820,110 learners",
    defaultFollowed: true,
    summary: "Supervised, unsupervised, and reinforcement learning pipelines, gradient boosted decision trees (XGBoost/LightGBM), and statistical generalization bounds."
  },
  {
    name: "Neural Networks",
    category: "Deep Learning Architecture",
    learners: "2,190,450 learners",
    defaultFollowed: true,
    summary: "Multi-layer perceptrons, convolutional/recurrent topologies, multi-head self-attention transformers, and backpropagation calculus."
  },
  {
    name: "Natural Language Processing (NLP)",
    category: "Language & Token Systems",
    learners: "3,140,800 learners",
    defaultFollowed: true,
    summary: "Subword BPE tokenization, dense vector embeddings, semantic retrieval (RAG), sequence-to-sequence transformers, and constitutional alignment."
  },
  {
    name: "Python (Programming Language)",
    category: "Systems & Data Language",
    learners: "11,450,900 learners",
    defaultFollowed: true,
    summary: "Production Python 3.12+ engineering: asyncio concurrency, Pydantic v2 schema validation, PyArrow zero-copy memory, and C-extension acceleration."
  },
  {
    name: "Statistics",
    category: "Mathematical Foundations",
    learners: "3,890,200 learners",
    defaultFollowed: false,
    summary: "Bayesian inference, hypothesis testing, maximum likelihood estimation, Monte Carlo simulation, and causal variance attribution."
  },
  {
    name: "Deep Learning",
    category: "Foundation Models",
    learners: "2,760,300 learners",
    defaultFollowed: true,
    summary: "Distributed FSDP/DeepSpeed training, LoRA/QLoRA parameter-efficient fine-tuning, mixed-precision FP8/BF16 kernels, and flash attention."
  },
  {
    name: "Data Science",
    category: "Analytical Engineering",
    learners: "6,410,000 learners",
    defaultFollowed: false,
    summary: "Feature stores, exploratory data analysis, drift telemetry, A/B experimentation rigor, and decision-grade executive telemetry."
  },
  {
    name: "Linear Algebra",
    category: "Tensor Mathematics",
    learners: "1,620,400 learners",
    defaultFollowed: false,
    summary: "Eigenvalue decomposition, Singular Value Decomposition (SVD), low-rank matrix approximations, and high-dimensional inner product spaces."
  },
  {
    name: "TensorFlow",
    category: "Production ML Framework",
    learners: "1,980,500 learners",
    defaultFollowed: false,
    summary: "XLA graph compilation, TFX production pipelines, TensorFlow Serving gRPC endpoints, and edge TFLite quantization."
  },
  {
    name: "PyTorch",
    category: "Research & Enterprise DL",
    learners: "2,890,700 learners",
    defaultFollowed: true,
    summary: "Dynamic eager computation graphs, torch.compile Triton kernels, DistributedDataParallel (DDP), and Hugging Face safetensors ecosystems."
  }
]

// ============================================================================
// PART 1: CONNECTLN STUDIES — GROW AND ADVANCE AS A CYBER SECURITY SPECIALIST
// ============================================================================
export const CONNECTLN_CYBER_SPECIALIST_SHELVES: ConnectLnCourseShelf[] = [
  {
    id: "shelf-cyber-specialist",
    academyTrack: "cyber_specialist",
    title: "Grow and advance as a Cyber Security Specialist",
    subtitle: "ConnectLn Studies Flagship Certification Prep & Core Cyber Defense Track",
    totalCountBadge: "Flagship Specialist Track",
    filterPills: ["CISSP (2024)", "AI for Cybersecurity", "Cybersecurity Foundations", "ISACA CISM", "GRC"],
    courses: [
      {
        id: "cln-cissp-2024",
        shelfId: "shelf-cyber-specialist",
        academyTrack: "cyber_specialist",
        title: "ISC2 Certified Information Systems Security Professional (CISSP) (2024) Cert Prep",
        badge: "Popular",
        duration: "21h 27m",
        author: "Mike Chapple",
        learnersCount: "92,726 learners",
        skills: ["CISSP 8 Domains", "Security Architecture", "Cryptography & PKI", "IAM & Zero Trust", "Risk Management"],
        category: "Cybersecurity",
        thumbnail: "/images/connectln-studies/cyber-specialist-cover.jpg",
        customCoverArt: "/images/connectln-studies/cyber-specialist-cover.jpg",
        referenceUrl: "https://www.isc2.org/certifications/cissp",
        summary: "Master all 8 domains of the 2024 ISC2 CISSP Common Body of Knowledge (CBK): Security & Risk Management, Asset Security, Security Architecture & Engineering, Communication & Network Security, IAM, Security Assessment & Testing, Security Operations, and Software Development Security."
      },
      {
        id: "cln-ai-for-cybersecurity",
        shelfId: "shelf-cyber-specialist",
        academyTrack: "cyber_specialist",
        title: "Artificial Intelligence for Cybersecurity",
        badge: "Popular",
        duration: "1h 51m 50s",
        author: "ConnectLn Studies Cyber AI Faculty",
        learnersCount: "80,414 learners",
        socialProof: "Destiny M. Ridguard, M.A. likes this",
        skills: ["Anomaly Detection ML", "UEBA Behavioral Models", "Adversarial ML Defense", "Automated Threat Triage"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/ai-studies-cover.jpg",
        customCoverArt: "/images/connectln-studies/ai-studies-cover.jpg",
        referenceUrl: "https://atlas.mitre.org/",
        summary: "Deploy supervised and unsupervised machine learning pipelines for network intrusion detection, user and entity behavior analytics (UEBA), malware classification, and adversarial evasion hardening."
      },
      {
        id: "cln-cybersecurity-foundations",
        shelfId: "shelf-cyber-specialist",
        academyTrack: "cyber_specialist",
        title: "Cybersecurity Foundations",
        badge: "Popular",
        duration: "3h 31m 59s",
        author: "Malcolm Shore",
        learnersCount: "382,045 learners",
        skills: ["CIA Triad", "NIST CSF 2.0", "Defense-in-Depth", "Threat Actor Taxonomy", "Incident Containment"],
        category: "Cybersecurity",
        thumbnail: "/images/connectln-studies/packet-soc-cover.jpg",
        customCoverArt: "/images/connectln-studies/packet-soc-cover.jpg",
        referenceUrl: "https://www.nist.gov/cyberframework",
        summary: "Foundational engineering treatise covering confidentiality, integrity, and availability (CIA), NIST Cybersecurity Framework 2.0, cryptographic primitives, perimeter vs. zero-trust defense, and kill-chain disruption."
      },
      {
        id: "cln-isaca-cism-prep",
        shelfId: "shelf-cyber-specialist",
        academyTrack: "cyber_specialist",
        title: "ISACA Certified Information Security Manager (CISM) Cert Prep",
        badge: "Popular",
        duration: "9h 22m 22s",
        author: "Cybrary",
        learnersCount: "13,633 learners",
        skills: ["Information Security Governance", "Information Risk Management", "Security Program Development", "Incident Management & SLA"],
        category: "GRC & Audit",
        thumbnail: "/images/connectln-studies/grc-governance-cover.jpg",
        customCoverArt: "/images/connectln-studies/grc-governance-cover.jpg",
        referenceUrl: "https://www.isaca.org/credentialing/cism",
        summary: "Executive-grade preparation for the ISACA CISM certification across enterprise security governance, quantitative risk appetite modeling (FAIR), program chartering, and board-level incident response leadership."
      },
      {
        id: "cln-cyber-foundations-grc",
        shelfId: "shelf-cyber-specialist",
        academyTrack: "cyber_specialist",
        title: "Cybersecurity Foundations: Governance, Risk, and Compliance (GRC)",
        badge: "Popular",
        duration: "1h 56m 26s",
        author: "AJ Yawn",
        learnersCount: "48,920 learners",
        skills: ["SOC 2 Type II", "ISO/IEC 27001:2022", "NIST RMF SP 800-53", "Continuous Compliance Automation"],
        category: "GRC & Audit",
        thumbnail: "/images/connectln-studies/grc-governance-cover.jpg",
        customCoverArt: "/images/connectln-studies/grc-governance-cover.jpg",
        referenceUrl: "https://csrc.nist.gov/projects/risk-management/about-rmf",
        summary: "Practical architectural blueprint for designing, auditing, and automating enterprise Governance, Risk, and Compliance (GRC) controls across SOC 2 Type II, ISO 27001, HIPAA, and FedRAMP."
      }
    ]
  },
  {
    id: "shelf-top-picks-kwesi",
    academyTrack: "cyber_specialist",
    title: "Top picks for Kwesi",
    subtitle: "Personalized ConnectLn Studies Recommendations for Kwesi Asiedu",
    filterPills: ["Generative AI", "Claude Code", "CompTIA SecAI+", "Wireshark Packet Analysis", "Salesforce Data Cloud"],
    courses: [
      {
        id: "cln-what-is-generative-ai",
        shelfId: "shelf-top-picks-kwesi",
        academyTrack: "cyber_specialist",
        title: "What Is Generative AI?",
        badge: "Updated · Popular",
        duration: "1h 17m 41s",
        author: "Pinar Seyhan Demirdag",
        learnersCount: "2,979,121 learners",
        socialProof: "ISAAC K. BOYE likes this",
        skills: ["Transformer Attention", "Diffusion & Autoregressive Models", "Enterprise GenAI Governance", "Multimodal Foundation Models"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/ai-studies-cover.jpg",
        customCoverArt: "/images/connectln-studies/ai-studies-cover.jpg",
        referenceUrl: "https://www.nist.gov/itl/ai-risk-management-framework",
        summary: "Comprehensive technical primer on large language models (LLMs), self-attention transformer mathematics, latent diffusion architectures, token embeddings, and enterprise generative AI deployment."
      },
      {
        id: "cln-claude-code-101",
        shelfId: "shelf-top-picks-kwesi",
        academyTrack: "cyber_specialist",
        title: "Claude Code 101 by Anthropic",
        badge: "Popular",
        duration: "1h 7m 29s",
        author: "Anthropic",
        learnersCount: "12,251 learners",
        skills: ["Agentic CLI Workflows", "CLAUDE.md Context Engineering", "Multi-File Refactoring", "MCP Tool Execution"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/agentic-mcp-cover.jpg",
        customCoverArt: "/images/connectln-studies/agentic-mcp-cover.jpg",
        referenceUrl: "https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview",
        summary: "Master terminal-native agentic software engineering with Anthropic Claude Code: repository indexing, CLAUDE.md memory hierarchies, sandboxed bash execution, test-driven automated debugging, and Git PR synthesis."
      },
      {
        id: "cln-comptia-secai-plus-exam1",
        shelfId: "shelf-top-picks-kwesi",
        academyTrack: "cyber_specialist",
        title: "Practice Exam 1 for CompTIA SecAI+ (CY0-001)",
        badge: "Cert Prep",
        duration: "4m 12s",
        author: "Total Seminars",
        learnersCount: "18,450 learners",
        skills: ["Threat & Vulnerability Management", "Artificial Intelligence (AI)", "Penetration Testing", "AI for Cybersecurity"],
        category: "Cybersecurity",
        thumbnail: "/images/connectln-studies/cyber-specialist-cover.jpg",
        customCoverArt: "/images/connectln-studies/cyber-specialist-cover.jpg",
        referenceUrl: "https://www.comptia.org/",
        summary: "Full-domain technical validation for CompTIA SecAI+ (CY0-001): securing AI/ML pipelines against prompt injection, model inversion, data poisoning, and deploying AI-assisted offensive penetration testing."
      },
      {
        id: "cln-wireshark-101-pearson",
        shelfId: "shelf-top-picks-kwesi",
        academyTrack: "cyber_specialist",
        title: "Wireshark 101: Packet Analysis Essentials by Pearson",
        badge: "New",
        duration: "3h 53m 7s",
        author: "Pearson",
        learnersCount: "31,200 learners",
        skills: ["Wireshark", "BPF Capture Filters", "TCP 3-Way Handshake & Windowing", "TLS 1.3 Decryption & PCAP Forensics"],
        category: "Networking & Packets",
        thumbnail: "/images/connectln-studies/packet-soc-cover.jpg",
        customCoverArt: "/images/connectln-studies/packet-soc-cover.jpg",
        referenceUrl: "https://www.wireshark.org/docs/",
        summary: "Deep packet inspection and network forensics using Wireshark 4.x: Berkeley Packet Filter (BPF) syntax, TCP zero-window/retransmission diagnostics, DNS exfiltration hunting, and C2 beacon dissection."
      },
      {
        id: "cln-salesforce-data-cloud-prep",
        shelfId: "shelf-top-picks-kwesi",
        academyTrack: "cyber_specialist",
        title: "Salesforce Certified Data Cloud Consultant Cert Prep",
        badge: "Cert Prep",
        duration: "6h 25m 57s",
        author: "Packt Publishing",
        learnersCount: "14,890 learners",
        skills: ["Zero-Copy Data Federation", "Customer 360 Data Model", "Identity Resolution Rulesets", "Calculated Insights & Consent"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/mlops-data-cover.jpg",
        customCoverArt: "/images/connectln-studies/mlops-data-cover.jpg",
        referenceUrl: "https://trailhead.salesforce.com/",
        summary: "Architect enterprise unified customer data platforms with Salesforce Data Cloud: zero-copy Snowflake/BigQuery federation, deterministic/probabilistic identity resolution, and GDPR policy enforcement."
      }
    ]
  },
  {
    id: "shelf-popular-connectln",
    academyTrack: "cyber_specialist",
    title: "Popular on ConnectLn Studies",
    subtitle: "Highest-Enrollment AI Literacy, Prompt Engineering & Executive Communication Courses",
    filterPills: ["AI Ethics", "Executive Presence", "Prompt Engineering", "Everyday AI", "AI Literacy"],
    courses: [
      {
        id: "cln-ethics-generative-ai",
        shelfId: "shelf-popular-connectln",
        academyTrack: "cyber_specialist",
        title: "Ethics in the Age of Generative AI",
        badge: "Popular",
        duration: "45m 59s",
        author: "Vilas Dhar",
        learnersCount: "829,147 learners",
        skills: ["Algorithmic Fairness", "EU AI Act & NIST AI RMF", "Provenance & Watermarking", "Hallucination Liability"],
        category: "GRC & Audit",
        thumbnail: "/images/connectln-studies/grc-governance-cover.jpg",
        customCoverArt: "/images/connectln-studies/grc-governance-cover.jpg",
        referenceUrl: "https://www.nist.gov/itl/ai-risk-management-framework",
        summary: "Establish institutional AI ethics frameworks aligned with the NIST AI Risk Management Framework (AI RMF 1.0) and EU AI Act: bias auditing, cryptographic C2PA content provenance, and human-in-the-loop accountability."
      },
      {
        id: "cln-communicating-with-confidence",
        shelfId: "shelf-popular-connectln",
        academyTrack: "cyber_specialist",
        title: "Communicating with Confidence",
        badge: "Popular",
        duration: "1h 17m 54s",
        author: "Vinh Giang",
        learnersCount: "542,006 learners",
        skills: ["Vocal Prosody & Pitch", "Executive Boardroom Briefing", "Cognitive Framing", "Crisis Communication"],
        category: "Leadership & Consulting",
        thumbnail: "/images/connectln-studies/cyber-specialist-cover.jpg",
        customCoverArt: "/images/connectln-studies/cyber-specialist-cover.jpg",
        referenceUrl: "https://connectln.vercel.app/connectin#cln-communicating-with-confidence",
        summary: "Master acoustic vocal mechanics, cadence modulation, kinesthetic stage presence, and high-stakes C-suite security and engineering presentation delivery."
      },
      {
        id: "cln-intro-prompt-engineering",
        shelfId: "shelf-popular-connectln",
        academyTrack: "cyber_specialist",
        title: "Introduction to Prompt Engineering for Generative AI",
        badge: "Popular",
        duration: "1h 3m 29s",
        author: "Ronnie Sheer",
        learnersCount: "469,309 learners",
        skills: ["Few-Shot & Chain-of-Thought", "ReAct Reasoning Loops", "Structured JSON Schema Output", "System Prompt Guardrails"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/ai-studies-cover.jpg",
        customCoverArt: "/images/connectln-studies/ai-studies-cover.jpg",
        referenceUrl: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
        summary: "Systematic engineering of deterministic LLM prompts: in-context learning, Chain-of-Thought (CoT), Tree-of-Thoughts (ToT), constrained grammar decoding, and temperature/top-p sampling calibration."
      },
      {
        id: "cln-everyday-ai-concepts",
        shelfId: "shelf-popular-connectln",
        academyTrack: "cyber_specialist",
        title: "Everyday AI Concepts",
        badge: "Popular",
        duration: "49m 41s",
        author: "Doug Rose",
        learnersCount: "268,885 learners",
        skills: ["Supervised vs. Unsupervised ML", "Neural Network Backpropagation", "Vector Embeddings", "RAG Fundamentals"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/ai-studies-cover.jpg",
        customCoverArt: "/images/connectln-studies/ai-studies-cover.jpg",
        referenceUrl: "https://connectln.vercel.app/connectin#cln-everyday-ai-concepts",
        summary: "Demystify core artificial intelligence building blocks: gradient descent, deep neural topologies, high-dimensional vector similarity search, and Retrieval-Augmented Generation (RAG)."
      },
      {
        id: "cln-top-ai-questions-answered",
        shelfId: "shelf-popular-connectln",
        academyTrack: "cyber_specialist",
        title: "Your Top AI Questions Answered: AI Literacy for Everyone",
        badge: "Popular",
        duration: "49m 25s",
        author: "Dr. Marily Nika",
        learnersCount: "194,320 learners",
        skills: ["AI Product Strategy", "Model Evaluation Evals", "Build vs. Buy Economics", "Responsible AI Deployment"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/agentic-mcp-cover.jpg",
        customCoverArt: "/images/connectln-studies/agentic-mcp-cover.jpg",
        referenceUrl: "https://connectln.vercel.app/connectin#cln-top-ai-questions-answered",
        summary: "Product and engineering playbook for evaluating foundation models, designing golden evaluation datasets (Evals), calculating token inference unit economics, and shipping AI features."
      }
    ]
  },
  {
    id: "shelf-most-liked-connectln",
    academyTrack: "cyber_specialist",
    title: "Most liked on ConnectLn Studies",
    subtitle: "Top-Rated Agentic AI, Model Context Protocol (MCP) & Architect Certifications",
    filterPills: ["Copilot Studio Agents", "Claude Architect (CCAR-F)", "Model Context Protocol (MCP)", "Agentic AI Systems", "OSHA Emergency Prep"],
    courses: [
      {
        id: "cln-copilot-studio-agents",
        shelfId: "shelf-most-liked-connectln",
        academyTrack: "cyber_specialist",
        title: "How to Create AI Agents Like a Pro in Copilot Studio (No Code Required) by Microsoft Press",
        badge: "Popular",
        duration: "5h 55m 7s",
        author: "Microsoft Press",
        learnersCount: "10,345 learners",
        skills: ["Microsoft Copilot Studio", "Autonomous Topic Orchestration", "Power Automate Connectors", "Entra ID RBAC Security"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/agentic-mcp-cover.jpg",
        customCoverArt: "/images/connectln-studies/agentic-mcp-cover.jpg",
        referenceUrl: "https://learn.microsoft.com/en-us/microsoft-copilot-studio/",
        summary: "Design, govern, and publish enterprise autonomous agents in Microsoft Copilot Studio with Dataverse grounding, Power Platform action triggers, and Entra ID conditional access."
      },
      {
        id: "cln-claude-certified-architect-ccarf",
        shelfId: "shelf-most-liked-connectln",
        academyTrack: "cyber_specialist",
        title: "Anthropic Claude Certified Architect Foundations (CCAR-F) Cert Prep",
        badge: "Updated · Popular",
        duration: "7h 59m 31s",
        author: "Tutorials Dojo",
        learnersCount: "24,447 learners",
        skills: ["Claude 4 / Sonnet / Opus Architecture", "Constitutional AI Safety", "Prompt Caching & Batch API", "Extended Thinking & Tool Use"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/ai-studies-cover.jpg",
        customCoverArt: "/images/connectln-studies/ai-studies-cover.jpg",
        referenceUrl: "https://docs.anthropic.com/",
        summary: "Comprehensive certification guide for Anthropic Claude Certified Architect Foundations (CCAR-F): Constitutional AI alignment, ephemeral prompt caching, multi-turn tool orchestration, and Bedrock/Vertex enterprise deployment."
      },
      {
        id: "cln-intro-mcp-anthropic",
        shelfId: "shelf-most-liked-connectln",
        academyTrack: "cyber_specialist",
        title: "Introduction to Model Context Protocol by Anthropic",
        badge: "Popular",
        duration: "1h 1m 30s",
        author: "Anthropic",
        learnersCount: "71,648 learners",
        skills: ["Model Context Protocol (MCP)", "JSON-RPC 2.0 Stdio & SSE Transports", "MCP Resources, Prompts & Tools", "Zero-Trust Capability Sandboxing"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/agentic-mcp-cover.jpg",
        customCoverArt: "/images/connectln-studies/agentic-mcp-cover.jpg",
        referenceUrl: "https://modelcontextprotocol.io/",
        summary: "Build standardized Model Context Protocol (MCP) servers and clients in TypeScript and Python: JSON-RPC 2.0 lifecycle negotiation, dynamic tool discovery, resource URI subscriptions, and OAuth 2.1 security."
      },
      {
        id: "cln-agentic-ai-build-first",
        shelfId: "shelf-most-liked-connectln",
        academyTrack: "cyber_specialist",
        title: "Agentic AI: Build Your First Agentic AI System",
        badge: "Popular",
        duration: "1h 5m 32s",
        author: "ConnectLn Studies Agentic Lab",
        learnersCount: "95,757 learners",
        socialProof: "4 people with similar job titles are learning",
        skills: ["Planner-Executor-Critic Loops", "Episodic & Semantic Memory", "Deterministic Tool Sandboxes", "Human-in-the-Loop Escalation"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/agentic-mcp-cover.jpg",
        customCoverArt: "/images/connectln-studies/agentic-mcp-cover.jpg",
        referenceUrl: "https://connectln.vercel.app/connectin#cln-agentic-ai-build-first",
        summary: "End-to-end engineering of autonomous multi-step AI agents: ReAct planning graphs, reflexion self-correction loops, vector memory persistence, and bounded execution budgets."
      },
      {
        id: "cln-osha-fire-emergency-prep",
        shelfId: "shelf-most-liked-connectln",
        academyTrack: "cyber_specialist",
        title: "Occupational Safety and Health: Fire and Emergency Preparedness",
        badge: "Popular",
        duration: "55m 6s",
        author: "Jim Rogers",
        learnersCount: "41,280 learners",
        skills: ["OSHA 29 CFR 1910.38 EAP", "NFPA 101 Life Safety Code", "Class A/B/C/D/K Fire Suppression", "Data Center Clean-Agent FM-200"],
        category: "GRC & Audit",
        thumbnail: "/images/connectln-studies/grc-governance-cover.jpg",
        customCoverArt: "/images/connectln-studies/grc-governance-cover.jpg",
        referenceUrl: "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.38",
        summary: "OSHA 29 CFR 1910.38 Emergency Action Plans (EAP), NFPA 101 egress engineering, lithium-ion thermal runaway containment, and clean-agent fire suppression for critical facilities."
      }
    ]
  },
  {
    id: "shelf-community-learning-week",
    academyTrack: "cyber_specialist",
    title: "See what your community is learning this week",
    subtitle: "Peer-Verified Courses Trending Among Principal Security Architects & AI Engineers",
    filterPills: ["Agentic AI", "CompTIA Network+ (N10-009)", "AI Threat Modeling", "Pearson GRC Essentials", "Prompt Engineering"],
    courses: [
      {
        id: "cln-comptia-network-plus-n10-009",
        shelfId: "shelf-community-learning-week",
        academyTrack: "cyber_specialist",
        title: "CompTIA Network+ (N10-009) Cert Prep",
        badge: "Popular",
        duration: "18h 51m 43s",
        author: "Mike Meyers & Total Seminars",
        learnersCount: "27,921 learners",
        socialProof: "6 people with similar job titles are learning",
        skills: ["OSI & TCP/IP Stack", "VLAN 802.1Q Trunking & BGP/OSPF", "IPv4/IPv6 CIDR Subnetting", "Zero-Trust SASE & SD-WAN"],
        category: "Networking & Packets",
        thumbnail: "/images/connectln-studies/packet-soc-cover.jpg",
        customCoverArt: "/images/connectln-studies/packet-soc-cover.jpg",
        referenceUrl: "https://www.comptia.org/certifications/network",
        summary: "Complete 18-hour engineering mastery for CompTIA Network+ (N10-009): Layer 1–7 packet encapsulation, OSPF/BGP dynamic routing, VLAN segmentation, Wi-Fi 6E/7 WPA3-Enterprise, and network telemetry."
      },
      {
        id: "cln-advanced-ai-threat-modeling",
        shelfId: "shelf-community-learning-week",
        academyTrack: "cyber_specialist",
        title: "Advanced AI Threat Modeling and Risk Assessment",
        badge: "Popular",
        duration: "55m 29s",
        author: "ConnectLn Studies Adversarial AI Group",
        learnersCount: "13,122 learners",
        socialProof: "4 people with similar job titles are learning",
        skills: ["MITRE ATLAS Framework", "OWASP Top 10 for LLM v2.0", "Indirect Prompt Injection", "Model Supply-Chain Integrity"],
        category: "Cybersecurity",
        thumbnail: "/images/connectln-studies/cyber-specialist-cover.jpg",
        customCoverArt: "/images/connectln-studies/cyber-specialist-cover.jpg",
        referenceUrl: "https://genai.owasp.org/",
        summary: "Conduct quantitative threat modeling on generative AI and agentic architectures using MITRE ATLAS and OWASP Top 10 for LLMs: RAG poisoning, Crescendo jailbreaks, and safetensors weight verification."
      },
      {
        id: "cln-grc-essentials-pearson",
        shelfId: "shelf-community-learning-week",
        academyTrack: "cyber_specialist",
        title: "Governance, Risk, and Compliance (GRC) Essentials by Pearson",
        badge: "Popular",
        duration: "1h 25m 45s",
        author: "Pearson",
        learnersCount: "10,313 learners",
        socialProof: "10 people with similar job titles are learning",
        skills: ["Quantitative Risk (ALE = SLE × ARO)", "Control Mapping Matrices", "Third-Party Vendor Risk (TPRM)", "Executive Risk Registers"],
        category: "GRC & Audit",
        thumbnail: "/images/connectln-studies/grc-governance-cover.jpg",
        customCoverArt: "/images/connectln-studies/grc-governance-cover.jpg",
        referenceUrl: "https://www.nist.gov/cyberframework",
        summary: "Unified GRC control harmonization across NIST CSF 2.0, ISO 27001, PCI-DSS v4.0, and DORA, featuring quantitative Monte Carlo risk simulation and automated evidence collection."
      },
      {
        id: "cln-prompt-engineering-talk-to-ais",
        shelfId: "shelf-community-learning-week",
        academyTrack: "cyber_specialist",
        title: "Prompt Engineering: How to Talk to the AIs (2023)",
        badge: "Popular",
        duration: "29m 00s",
        author: "Xavier Amatriain",
        learnersCount: "112,400 learners",
        socialProof: "4 people with similar job titles are learning",
        skills: ["Token Probability Distributions", "Persona & Constraint Framing", "Self-Consistency Decoding", "Adversarial Prompt Defense"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/ai-studies-cover.jpg",
        customCoverArt: "/images/connectln-studies/ai-studies-cover.jpg",
        referenceUrl: "https://connectln.vercel.app/connectin#cln-prompt-engineering-talk-to-ais",
        summary: "Foundational treatise on autoregressive token logits, attention steering, few-shot exemplar selection, and mitigating prompt drift in production LLM pipelines."
      }
    ]
  },
  {
    id: "shelf-this-weeks-top",
    academyTrack: "cyber_specialist",
    title: "This week’s top courses",
    subtitle: "High-Velocity Enterprise Productivity, AI Foundations & Technical Writing",
    filterPills: ["Microsoft 365 Copilot", "Professional Development", "AI Basics", "Google Drive Enterprise", "Plain English Technical Writing"],
    courses: [
      {
        id: "cln-m365-copilot-for-work",
        shelfId: "shelf-this-weeks-top",
        academyTrack: "cyber_specialist",
        title: "Learning Microsoft 365 Copilot for Work",
        badge: "Popular",
        duration: "54m 29s",
        author: "Jess Stratton",
        learnersCount: "23,569 learners",
        skills: ["Microsoft Graph Grounding", "Semantic Index for Copilot", "Sensitivity Labels & Purview DLP", "Word/Excel/Teams Automation"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/agentic-mcp-cover.jpg",
        customCoverArt: "/images/connectln-studies/agentic-mcp-cover.jpg",
        referenceUrl: "https://learn.microsoft.com/en-us/copilot/microsoft-365/",
        summary: "Maximize enterprise velocity with Microsoft 365 Copilot while enforcing Microsoft Purview sensitivity labels, zero-oversharing SharePoint permissions, and Graph-grounded synthesis."
      },
      {
        id: "cln-invest-in-you-dev",
        shelfId: "shelf-this-weeks-top",
        academyTrack: "cyber_specialist",
        title: "Invest in You: Personal and Professional Development Tips",
        badge: "Popular",
        duration: "40m 40s",
        author: "Madecraft and Jason Weeman",
        learnersCount: "160,184 learners",
        skills: ["T-Shaped Skill Capital", "Deliberate Practice Loops", "Executive Career Roadmapping", "High-Leverage Deep Work"],
        category: "Leadership & Consulting",
        thumbnail: "/images/connectln-studies/cyber-specialist-cover.jpg",
        customCoverArt: "/images/connectln-studies/cyber-specialist-cover.jpg",
        referenceUrl: "https://connectln.vercel.app/connectin#cln-invest-in-you-dev",
        summary: "Strategic framework for compounding technical and leadership capital, structuring 90-day mastery sprints, and transitioning into Principal/Staff engineering and CISO roles."
      },
      {
        id: "cln-ai-basics-every-pro",
        shelfId: "shelf-this-weeks-top",
        academyTrack: "cyber_specialist",
        title: "AI Basics: What Every Professional Needs to Know",
        badge: "Popular",
        duration: "1h 00m 27s",
        author: "Laurence Moroney",
        learnersCount: "54,677 learners",
        skills: ["Feature Engineering", "Overfitting & Regularization", "Foundation Model Fine-Tuning", "Enterprise AI ROI"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/ai-studies-cover.jpg",
        customCoverArt: "/images/connectln-studies/ai-studies-cover.jpg",
        referenceUrl: "https://connectln.vercel.app/connectin#cln-ai-basics-every-pro",
        summary: "From traditional programmatic rules to deep neural network representation learning: how modern AI generalizes, where it fails, and how to architect high-reliability ML systems."
      },
      {
        id: "cln-google-drive-essential",
        shelfId: "shelf-this-weeks-top",
        academyTrack: "cyber_specialist",
        title: "Google Drive Essential Training",
        badge: "Popular",
        duration: "1h 20m 55s",
        author: "Jess Stratton",
        learnersCount: "14,910 learners",
        skills: ["Google Workspace Zero-Trust", "Client-Side Encryption (CSE)", "Shared Drive IAM & DLP Rules", "Gemini in Workspace"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/mlops-data-cover.jpg",
        customCoverArt: "/images/connectln-studies/mlops-data-cover.jpg",
        referenceUrl: "https://workspace.google.com/security/",
        summary: "Enterprise cloud collaboration and governance in Google Drive: least-privilege Shared Drive architecture, Context-Aware Access policies, DLP regex detectors, and client-side key management."
      },
      {
        id: "cln-writing-in-plain-english",
        shelfId: "shelf-this-weeks-top",
        academyTrack: "cyber_specialist",
        title: "Writing in Plain English",
        badge: "Popular",
        duration: "1h 3m 4s",
        author: "Mignon Fogarty",
        learnersCount: "88,410 learners",
        skills: ["ISO Plain Language Standard", "Incident Post-Mortem Clarity", "Active Voice Engineering Specs", "Executive Briefings"],
        category: "Leadership & Consulting",
        thumbnail: "/images/connectln-studies/grc-governance-cover.jpg",
        customCoverArt: "/images/connectln-studies/grc-governance-cover.jpg",
        referenceUrl: "https://www.iso.org/standard/78907.html",
        summary: "Eliminate syntactic ambiguity in RFCs, security advisories, board memos, and standard operating procedures using federal Plain Writing Act and ISO 24495-1 principles."
      }
    ]
  },
  {
    id: "shelf-30-minutes-or-less",
    academyTrack: "cyber_specialist",
    title: "30 minutes or less",
    subtitle: "Tactical Micro-Masterclasses, Packet Sniffer Projects & Vibe Coding Sprints",
    filterPills: ["AI Team Adoption", "Human-First AI", "Packet Sniffer Project", "ISACA AAISM Exam", "Vibe Coding with Gemini"],
    courses: [
      {
        id: "cln-ai-adoption-that-sticks",
        shelfId: "shelf-30-minutes-or-less",
        academyTrack: "cyber_specialist",
        title: "AI Adoption That Sticks: Turning Tools into Team Habits",
        badge: "Popular",
        duration: "22m 7s",
        author: "Jean Kang and Viktoria Semaan",
        learnersCount: "8,260 learners",
        skills: ["AI Champion Guilds", "Prompt Library Standardization", "Developer Velocity Telemetry", "Shadow-AI Elimination"],
        category: "Leadership & Consulting",
        thumbnail: "/images/connectln-studies/agentic-mcp-cover.jpg",
        customCoverArt: "/images/connectln-studies/agentic-mcp-cover.jpg",
        referenceUrl: "https://connectln.vercel.app/connectin#cln-ai-adoption-that-sticks",
        summary: "Operationalize organizational AI adoption by converting ad-hoc tool experimentation into governed, repeatable team workflows with measurable DORA/cycle-time gains."
      },
      {
        id: "cln-human-first-ai-products",
        shelfId: "shelf-30-minutes-or-less",
        academyTrack: "cyber_specialist",
        title: "Human-First AI: Building AI Products That People Actually Use",
        badge: "Popular",
        duration: "29m 8s",
        author: "Laura Burkhauser",
        learnersCount: "10,647 learners",
        skills: ["Calibrated Trust UI", "Progressive Disclosure of Agency", "Latency & Streaming UX", "Citation Verifiability"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/ai-studies-cover.jpg",
        customCoverArt: "/images/connectln-studies/ai-studies-cover.jpg",
        referenceUrl: "https://pair.withgoogle.com/guidebook/",
        summary: "Product architecture for high-adoption AI applications: designing inline source attribution, reversible agentic actions, confidence indicators, and sub-200ms perceived latency."
      },
      {
        id: "cln-project-build-packet-sniffer",
        shelfId: "shelf-30-minutes-or-less",
        academyTrack: "cyber_specialist",
        title: "A Standalone Project: Build a Network Packet Sniffer to Detect Vulnerabilities or Attacks",
        badge: "Project",
        duration: "15m 56s",
        author: "SkillUp Online",
        learnersCount: "2,260 learners",
        skills: ["Raw Sockets (AF_PACKET)", "Python Scapy & libpcap", "SYN Flood & ARP Spoof Detection", "Real-Time Threat Alerting"],
        category: "Networking & Packets",
        thumbnail: "/images/connectln-studies/packet-soc-cover.jpg",
        customCoverArt: "/images/connectln-studies/packet-soc-cover.jpg",
        referenceUrl: "https://scapy.readthedocs.io/",
        summary: "Hands-on systems project: write a raw-socket Layer-2/Layer-3/Layer-4 packet sniffer in Python using libpcap/Scapy to parse Ethernet/IPv4/TCP headers and detect SYN scans and ARP poisoning in real time."
      },
      {
        id: "cln-isaca-aaism-practice-exam2",
        shelfId: "shelf-30-minutes-or-less",
        academyTrack: "cyber_specialist",
        title: "Practice Exam 2 for ISACA Advanced in AI Security Management (AAISM)",
        badge: "Cert Prep",
        duration: "4m 12s",
        author: "Total Seminars",
        learnersCount: "6,410 learners",
        skills: ["AI for Cybersecurity", "Security Management", "ISO/IEC 42001 AI Management", "Model Risk Governance"],
        category: "GRC & Audit",
        thumbnail: "/images/connectln-studies/grc-governance-cover.jpg",
        customCoverArt: "/images/connectln-studies/grc-governance-cover.jpg",
        referenceUrl: "https://www.isaca.org/credentialing/aaism",
        summary: "Advanced board-level assessment for ISACA AAISM: governing enterprise AI attack surfaces, ISO/IEC 42001 certification audits, model weight supply-chain security, and shadow LLM containment."
      },
      {
        id: "cln-vibe-coding-first-agent-gemini",
        shelfId: "shelf-30-minutes-or-less",
        academyTrack: "cyber_specialist",
        title: "Vibe Coding Your First Agent with Google Gemini",
        badge: "New",
        duration: "14m 23s",
        author: "Google DeepMind",
        learnersCount: "38,900 learners",
        skills: ["Google Gemini 2.5 Pro / Flash", "Function Calling & Grounding", "Natural-Language Spec Driven Dev", "Rapid Agent Prototyping"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/agentic-mcp-cover.jpg",
        customCoverArt: "/images/connectln-studies/agentic-mcp-cover.jpg",
        referenceUrl: "https://ai.google.dev/gemini-api/docs",
        summary: "Build, test, and deploy a tool-calling autonomous agent using Google DeepMind's Gemini SDK, structured schema declarations, Google Search grounding, and iterative specification-driven vibe coding."
      }
    ]
  },
  {
    id: "shelf-new-releases",
    academyTrack: "cyber_specialist",
    title: "New Releases",
    subtitle: "Freshly Published ConnectLn Studies Technical Releases — Google Antigravity, Cybrary & Apple Intelligence",
    filterPills: ["Cloud Governance", "Custom AI Tools", "Technical Program Management", "macOS Golden Gate", "Google Antigravity Verification"],
    courses: [
      {
        id: "cln-cloud-governance-cybrary",
        shelfId: "shelf-new-releases",
        academyTrack: "cyber_specialist",
        title: "Cloud Governance and Compliance by Cybrary",
        badge: "New",
        duration: "26m 38s",
        author: "Cybrary",
        learnersCount: "4,820 learners",
        skills: ["Artificial Intelligence (AI)", "Cloud Governance", "Governance, Risk Management, and Compliance (GRC)", "OPA Policy-as-Code"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/grc-governance-cover.jpg",
        customCoverArt: "/images/connectln-studies/grc-governance-cover.jpg",
        referenceUrl: "https://www.openpolicyagent.org/",
        summary: "Enforce multi-cloud landing zone guardrails across AWS Organizations, Azure Management Groups, and GCP Folders using Service Control Policies (SCPs), Open Policy Agent (OPA), and AI-driven CSPM."
      },
      {
        id: "cln-developing-custom-ai-tools-cybrary",
        shelfId: "shelf-new-releases",
        academyTrack: "cyber_specialist",
        title: "Developing Custom AI Tools by Cybrary",
        badge: "New",
        duration: "1h 21m 32s",
        author: "Cybrary",
        learnersCount: "5,930 learners",
        skills: ["Vibe Coding", "AI Software Development", "Artificial Intelligence (AI)", "Custom Security MCP Tools"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/agentic-mcp-cover.jpg",
        customCoverArt: "/images/connectln-studies/agentic-mcp-cover.jpg",
        referenceUrl: "https://modelcontextprotocol.io/",
        summary: "Architect custom AI security and developer tools: wrapping static analysis, CVE scanners, and log parsers into deterministic JSON-schema agent tools with strict input sanitization."
      },
      {
        id: "cln-tpm-handbook-packt",
        shelfId: "shelf-new-releases",
        academyTrack: "cyber_specialist",
        title: "Technical Program Manager's Handbook",
        badge: "New",
        duration: "11h 11m 48s",
        author: "Packt Publishing",
        learnersCount: "7,415 learners",
        skills: ["Program Management", "Cross-Org Architecture Alignment", "Critical Path & Monte Carlo", "Principal Engineering Governance"],
        category: "Leadership & Consulting",
        thumbnail: "/images/connectln-studies/mlops-data-cover.jpg",
        customCoverArt: "/images/connectln-studies/mlops-data-cover.jpg",
        referenceUrl: "https://connectln.vercel.app/connectin#cln-tpm-handbook-packt",
        summary: "Definitive 11-hour engineering leadership manual for Staff/Principal Technical Program Managers driving multi-quarter cloud migrations, zero-trust rollouts, and large-scale system decompositions."
      },
      {
        id: "cln-macos-golden-gate-essential",
        shelfId: "shelf-new-releases",
        academyTrack: "cyber_specialist",
        title: "macOS Golden Gate Essential Training",
        badge: "New",
        duration: "3h 29m 10s",
        author: "Nicholas Brazzi",
        learnersCount: "11,240 learners",
        skills: ["Mac", "macOS", "Apple Intelligence", "Endpoint Security & MDM Hardening"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/cyber-specialist-cover.jpg",
        customCoverArt: "/images/connectln-studies/cyber-specialist-cover.jpg",
        referenceUrl: "https://support.apple.com/guide/security/welcome/web",
        summary: "Master macOS Golden Gate administration, Private Cloud Compute Apple Intelligence privacy architecture, XProtect endpoint security, FileVault cryptographic volume management, and Jamf MDM."
      },
      {
        id: "cln-verifying-agent-work-antigravity",
        shelfId: "shelf-new-releases",
        academyTrack: "cyber_specialist",
        title: "Verifying Agent Work in Google Antigravity",
        badge: "New",
        duration: "1h 52m 10s",
        author: "Pragmatic AI Labs",
        learnersCount: "19,840 learners",
        skills: ["Google Antigravity IDE", "Multi-Agent Trajectory Verification", "Automated Test & Build Harnesses", "Deterministic Diff Auditing"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/agentic-mcp-cover.jpg",
        customCoverArt: "/images/connectln-studies/agentic-mcp-cover.jpg",
        referenceUrl: "https://deepmind.google/",
        summary: "Rigorous engineering verification of autonomous coding agents inside Google Antigravity: inspecting JSONL trajectories, subagent worktree isolation, automated build/lint gates, and formal correctness proofs."
      }
    ]
  },
  {
    id: "shelf-brush-up-profile-skills",
    academyTrack: "cyber_specialist",
    title: "Brush up on the skills on your ConnectLn profile",
    subtitle: "Executive Consulting, MedTech, Automotive & Industrial Domain Primers",
    filterPills: ["Consulting", "Public Speaking", "Microsoft Word", "Microsoft Excel", "Presentation Skills"],
    courses: [
      {
        id: "cln-think-like-a-consultant",
        shelfId: "shelf-brush-up-profile-skills",
        academyTrack: "cyber_specialist",
        title: "How to Think Like a Consultant",
        badge: "Popular",
        duration: "38m 28s",
        author: "Terry Ellis and Madecraft",
        learnersCount: "19,309 learners",
        skills: ["MECE Issue Trees", "Hypothesis-Driven Problem Solving", "Minto Pyramid Principle", "Executive Stakeholder Alignment"],
        category: "Leadership & Consulting",
        thumbnail: "/images/connectln-studies/grc-governance-cover.jpg",
        customCoverArt: "/images/connectln-studies/grc-governance-cover.jpg",
        referenceUrl: "https://connectln.vercel.app/connectin#cln-think-like-a-consultant",
        summary: "Deconstruct complex enterprise problems using Mutually Exclusive, Collectively Exhaustive (MECE) logic trees, first-principles hypothesis testing, and Minto Pyramid executive synthesis."
      },
      {
        id: "cln-industry-primer-medtech",
        shelfId: "shelf-brush-up-profile-skills",
        academyTrack: "cyber_specialist",
        title: "Industry Primer for Medical Technology: Core Foundations",
        badge: "Cert Prep",
        duration: "3h 13m 20s",
        author: "Starweaver",
        learnersCount: "8,490 learners",
        skills: ["Healthcare Information Technology (HIT)", "Healthcare", "HL7 FHIR & DICOM Interoperability", "FDA 510(k) SaMD Cybersecurity"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/mlops-data-cover.jpg",
        customCoverArt: "/images/connectln-studies/mlops-data-cover.jpg",
        referenceUrl: "https://www.hl7.org/fhir/",
        summary: "Technical architecture of connected medical devices (IoMT) and Healthcare IT: HL7 FHIR R4 APIs, DICOM imaging pipelines, HIPAA Security Rule encryption, and FDA Section 524B cyber mandates."
      },
      {
        id: "cln-industry-primer-automotive",
        shelfId: "shelf-brush-up-profile-skills",
        academyTrack: "cyber_specialist",
        title: "Industry Primer for Automotive: Core Foundations",
        badge: "Cert Prep",
        duration: "2h 7m 57s",
        author: "Starweaver",
        learnersCount: "7,120 learners",
        skills: ["Business Development", "Sales", "ISO/SAE 21434 Automotive Cyber", "CAN-FD & Software-Defined Vehicles"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/packet-soc-cover.jpg",
        customCoverArt: "/images/connectln-studies/packet-soc-cover.jpg",
        referenceUrl: "https://www.iso.org/standard/70918.html",
        summary: "Software-Defined Vehicle (SDV) engineering and commercial ecosystem: E/E zonal architectures, CAN-FD/Automotive Ethernet security (ISO/SAE 21434), UNECE WP.29 OTA updates, and EV powertrains."
      },
      {
        id: "cln-mastering-business-consultancy",
        shelfId: "shelf-brush-up-profile-skills",
        academyTrack: "cyber_specialist",
        title: "Mastering the Business of Consultancy: Strategy, Marketing, and Client Success",
        badge: "Popular",
        duration: "55m 7s",
        author: "CRFT Productions and Tiffany St James",
        learnersCount: "6,093 learners",
        skills: ["Value-Based Pricing", "SOW Scope Architecture", "Retainer Flywheels", "Executive Advisory Positioning"],
        category: "Leadership & Consulting",
        thumbnail: "/images/connectln-studies/cyber-specialist-cover.jpg",
        customCoverArt: "/images/connectln-studies/cyber-specialist-cover.jpg",
        referenceUrl: "https://connectln.vercel.app/connectin#cln-mastering-business-consultancy",
        summary: "Scale a high-margin technical and cybersecurity advisory practice: structuring outcome-based pricing, Statement of Work (SOW) change-control guardrails, and multi-year vCISO retainers."
      },
      {
        id: "cln-industry-primer-industrials",
        shelfId: "shelf-brush-up-profile-skills",
        academyTrack: "cyber_specialist",
        title: "Industry Primer for Industrials: Core Foundations",
        badge: "Popular",
        duration: "2h 46m 48s",
        author: "Starweaver",
        learnersCount: "9,340 learners",
        skills: ["OT/ICS SCADA Architecture", "Purdue Model & IEC 62443", "Digital Twins & IIoT Telemetry", "Supply Chain Resilience"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/mlops-data-cover.jpg",
        customCoverArt: "/images/connectln-studies/mlops-data-cover.jpg",
        referenceUrl: "https://www.isa.org/standards-and-publications/isa-standards/isa-iec-62443-series-of-standards",
        summary: "Industrial automation, Operational Technology (OT), and heavy manufacturing engineering: Purdue Reference Architecture, PLC/SCADA Modbus/OPC-UA protocols, and IEC 62443 zone conduits."
      }
    ]
  },
  {
    id: "shelf-skills-you-follow",
    academyTrack: "cyber_specialist",
    title: "Because of skills you follow",
    subtitle: "Targeted Deep-Dives for Your Followed Skills on ConnectLn Studies",
    filterPills: ["Cybersecurity", "Governance, Risk Management, and Compliance (GRC)", "Computer Forensics", "Bash", "Project Management"],
    courses: [
      {
        id: "cln-operational-cyber-ai-pearson",
        shelfId: "shelf-skills-you-follow",
        academyTrack: "cyber_specialist",
        title: "Operational Cybersecurity with AI: From Vision to Threat Hunting by Pearson",
        badge: "Cert Prep",
        duration: "8h 7m 54s",
        author: "Pearson",
        learnersCount: "1,435 learners",
        skills: ["AI-Assisted Threat Hunting", "SIEM/XDR Graph Correlation", "MITRE ATT&CK Hypothesis Hunting", "Automated SOAR Playbooks"],
        category: "Cybersecurity",
        thumbnail: "/images/connectln-studies/packet-soc-cover.jpg",
        customCoverArt: "/images/connectln-studies/packet-soc-cover.jpg",
        referenceUrl: "https://attack.mitre.org/",
        summary: "8-hour operational threat hunting treatise: transforming raw EDR, Zeek DNS/HTTP, and cloud audit logs into graph-correlated attack storylines using LLM threat-hunting agents."
      },
      {
        id: "cln-microsoft-cyber-business-pro",
        shelfId: "shelf-skills-you-follow",
        academyTrack: "cyber_specialist",
        title: "Microsoft Cybersecurity Business Professional by Microsoft Press",
        badge: "Cert Prep",
        duration: "6h 20m 58s",
        author: "Microsoft Press",
        learnersCount: "5,280 learners",
        skills: ["Microsoft 365", "Artificial Intelligence (AI)", "AI for Cybersecurity", "Cybersecurity", "Defender XDR & Sentinel"],
        category: "Cybersecurity",
        thumbnail: "/images/connectln-studies/cyber-specialist-cover.jpg",
        customCoverArt: "/images/connectln-studies/cyber-specialist-cover.jpg",
        referenceUrl: "https://learn.microsoft.com/en-us/security/",
        summary: "Architect end-to-end Microsoft security posture across Entra ID, Microsoft Defender XDR, Microsoft Sentinel KQL analytics, Purview data governance, and Zero Trust maturity."
      },
      {
        id: "cln-agentic-ai-for-cyber-pearson",
        shelfId: "shelf-skills-you-follow",
        academyTrack: "cyber_specialist",
        title: "Agentic AI for Cybersecurity by Pearson",
        badge: "New",
        duration: "3h 29m 35s",
        author: "Pearson",
        learnersCount: "8,910 learners",
        skills: ["AI Agents", "Artificial Intelligence (AI)", "AI Security", "Agentic AI Development", "Cybersecurity"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/agentic-mcp-cover.jpg",
        customCoverArt: "/images/connectln-studies/agentic-mcp-cover.jpg",
        referenceUrl: "https://atlas.mitre.org/",
        summary: "Build autonomous defensive and offensive security agents: automated vulnerability triage, sandboxed exploit verification, self-healing firewall rule synthesis, and cryptographic guardrails."
      },
      {
        id: "cln-cyber-awareness-password-auth",
        shelfId: "shelf-skills-you-follow",
        academyTrack: "cyber_specialist",
        title: "Cybersecurity Awareness: Password Security and Authentication",
        badge: "Popular",
        duration: "1h 43m 32s",
        author: "Caroline Wong",
        learnersCount: "1,718 learners",
        skills: ["FIDO2 / WebAuthn Passkeys", "NIST SP 800-63B Digital Identity", "Argon2id Key Derivation", "AiTM Phishing Resistance"],
        category: "Cybersecurity",
        thumbnail: "/images/connectln-studies/cyber-specialist-cover.jpg",
        customCoverArt: "/images/connectln-studies/cyber-specialist-cover.jpg",
        referenceUrl: "https://pages.nist.gov/800-63-3/sp800-63b.html",
        summary: "Transition enterprise authentication from phishable OTP/passwords to hardware-bound FIDO2/WebAuthn passkeys, NIST SP 800-63B AAL3 assurance, and Argon2id credential hashing."
      },
      {
        id: "cln-cyber-awareness-ai-emerging-threats",
        shelfId: "shelf-skills-you-follow",
        academyTrack: "cyber_specialist",
        title: "Cybersecurity Awareness: AI and Emerging Threats",
        badge: "Popular",
        duration: "48m 47s",
        author: "Nicole Dove",
        learnersCount: "9,450 learners",
        skills: ["Deepfake Voice/Video Verification", "Polymorphic LLM Phishing", "Shadow AI Data Leakage", "Out-of-Band Auth Protocols"],
        category: "Cybersecurity",
        thumbnail: "/images/connectln-studies/ai-studies-cover.jpg",
        customCoverArt: "/images/connectln-studies/ai-studies-cover.jpg",
        referenceUrl: "https://genai.owasp.org/",
        summary: "Defend enterprise personnel against real-time synthetic voice/video deepfake vishing, polymorphic spear-phishing, malicious browser extensions, and unauthorized LLM prompt leakage."
      }
    ]
  },
  {
    id: "shelf-trending-it-consulting",
    academyTrack: "cyber_specialist",
    title: "Trending in the IT Services and IT Consulting industry",
    subtitle: "Data Analytics, Real-Time Kafka Event Mesh, Python Engineering & Career Strategy",
    filterPills: ["Data Analytics", "Office 2024", "Apache Kafka", "Salary Negotiation", "Career Pivot", "Advanced Python"],
    courses: [
      {
        id: "cln-complete-guide-data-analytics",
        shelfId: "shelf-trending-it-consulting",
        academyTrack: "cyber_specialist",
        title: "Complete Guide to Learning Data Analytics",
        badge: "Popular",
        duration: "5h 19m 42s",
        author: "Robin Hunt",
        learnersCount: "8,628 learners",
        skills: ["SQL Window Functions", "Exploratory Data Analysis (EDA)", "Statistical Hypothesis Testing", "Executive BI Dashboards"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/mlops-data-cover.jpg",
        customCoverArt: "/images/connectln-studies/mlops-data-cover.jpg",
        referenceUrl: "https://connectln.vercel.app/connectin#cln-complete-guide-data-analytics",
        summary: "End-to-end data analytics engineering: relational normalization, analytical SQL CTEs and window functions, data hygiene pipelines, and statistical variance attribution."
      },
      {
        id: "cln-learning-office-2024",
        shelfId: "shelf-trending-it-consulting",
        academyTrack: "cyber_specialist",
        title: "Learning Office 2024: Word, Excel, PowerPoint, and Outlook",
        badge: "Popular",
        duration: "1h 52m 30s",
        author: "Jess Stratton",
        learnersCount: "68,678 learners",
        skills: ["Dynamic Array Formulas (XLOOKUP/LET)", "Power Query ETL", "Executive Slide Architecture", "Macro Security Hardening"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/cyber-specialist-cover.jpg",
        customCoverArt: "/images/connectln-studies/cyber-specialist-cover.jpg",
        referenceUrl: "https://learn.microsoft.com/en-us/office/",
        summary: "Master Office 2024 analytical capabilities: Excel LAMBDA/LET dynamic arrays, Power Query M-language data transformations, structured master templates, and VBA/macro attack surface lockdown."
      },
      {
        id: "cln-kafka-real-time-event-systems",
        shelfId: "shelf-trending-it-consulting",
        academyTrack: "cyber_specialist",
        title: "Kafka: Building Reliable Real-Time Event Systems",
        badge: "Cert Prep",
        duration: "4h 13m 11s",
        author: "KodeKloud",
        learnersCount: "2,263 learners",
        skills: ["Apache Kafka KRaft Consensus", "Exactly-Once Semantics (EOS)", "Partitioned Log Compaction", "mTLS & SASL/SCRAM Security"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/mlops-data-cover.jpg",
        customCoverArt: "/images/connectln-studies/mlops-data-cover.jpg",
        referenceUrl: "https://kafka.apache.org/documentation/",
        summary: "Architect high-throughput distributed event streaming with Apache Kafka (KRaft mode): partition key design, idempotent producers, transactional Exactly-Once Semantics (EOS), and zero-copy consumer groups."
      },
      {
        id: "cln-negotiate-raise-salary-data",
        shelfId: "shelf-trending-it-consulting",
        academyTrack: "cyber_specialist",
        title: "Negotiate a Raise Using Salary Data",
        badge: "Popular",
        duration: "39m 27s",
        author: "Justin Sun and Madecraft",
        learnersCount: "11,681 learners",
        skills: ["Total Compensation (Base/Equity/Bonus)", "Market Comp Percentile Benchmarking", "Quantified Impact Dossiers", "BATNA Anchor Strategy"],
        category: "Leadership & Consulting",
        thumbnail: "/images/connectln-studies/grc-governance-cover.jpg",
        customCoverArt: "/images/connectln-studies/grc-governance-cover.jpg",
        referenceUrl: "https://connectln.vercel.app/connectin#cln-negotiate-raise-salary-data",
        summary: "Data-driven executive compensation negotiation: benchmarking P75/P90 total compensation bands, quantifying revenue and risk-reduction ROI, and structuring multi-component counteroffers."
      },
      {
        id: "cln-change-career-carole-hopson",
        shelfId: "shelf-trending-it-consulting",
        academyTrack: "cyber_specialist",
        title: "How to Change Your Career Without Starting Over with Carole Hopson",
        badge: "Popular",
        duration: "44m 32s",
        author: "ConnectLn Studies News",
        learnersCount: "34,120 learners",
        skills: ["Transferable Competency Mapping", "Executive Narrative Reframing", "Strategic Network Sponsorship", "90-Day Transition Plan"],
        category: "Leadership & Consulting",
        thumbnail: "/images/connectln-studies/cyber-specialist-cover.jpg",
        customCoverArt: "/images/connectln-studies/cyber-specialist-cover.jpg",
        referenceUrl: "https://connectln.vercel.app/connectin#cln-change-career-carole-hopson",
        summary: "Translate prior operational, military, clinical, or engineering mastery into senior cybersecurity and AI leadership roles without resetting seniority or compensation."
      },
      {
        id: "cln-advanced-python-data-science-eng",
        shelfId: "shelf-trending-it-consulting",
        academyTrack: "cyber_specialist",
        title: "Advanced Python: Top Tools for Data Science and Engineering",
        badge: "Popular",
        duration: "3h 42m 15s",
        author: "ConnectLn Studies Engineering Press",
        learnersCount: "42,850 learners",
        skills: ["Polars & PyArrow Zero-Copy", "Numba / Cython Vectorization", "Asyncio & Ray Distributed Compute", "Pydantic v2 Type Safety"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/mlops-data-cover.jpg",
        customCoverArt: "/images/connectln-studies/mlops-data-cover.jpg",
        referenceUrl: "https://docs.python.org/3/",
        summary: "High-performance Python data engineering and scientific computing: Apache Arrow columnar memory, Polars lazy query optimization, Pydantic v2 Rust-core validation, and Ray distributed clusters."
      }
    ]
  },
  {
    id: "shelf-top-skills-for-you",
    academyTrack: "cyber_specialist",
    title: "Learn top skills for people like you",
    subtitle: "Offensive & Defensive SOC Automation, Copilot for Security, Metasploit & Nessus",
    filterPills: ["Incident Response", "Metasploit", "Tenable Nessus", "Hardware Hacking"],
    courses: [
      {
        id: "cln-automate-cyber-defense-genai",
        shelfId: "shelf-top-skills-for-you",
        academyTrack: "cyber_specialist",
        title: "Automate Cyber Defense with GenAI: Building and Deploying AI-Driven Solutions",
        badge: "Popular",
        duration: "35m 4s",
        author: "Laurentiu Gabriel Raducu",
        learnersCount: "2,668 learners",
        skills: ["Incident Response", "Automated YARA/Sigma Rule Synthesis", "SOAR Webhook Containment", "Alert Fatigue Reduction"],
        category: "Cybersecurity",
        thumbnail: "/images/connectln-studies/packet-soc-cover.jpg",
        customCoverArt: "/images/connectln-studies/packet-soc-cover.jpg",
        referenceUrl: "https://sigmahq.io/",
        summary: "Build production GenAI defense pipelines that ingest raw SIEM alerts, synthesize validated Sigma/YARA detection rules, enrich IOCs via threat intel APIs, and stage automated containment PRs."
      },
      {
        id: "cln-automating-cyber-ops-ai-starweaver",
        shelfId: "shelf-top-skills-for-you",
        academyTrack: "cyber_specialist",
        title: "Automating Cybersecurity Operations with AI",
        badge: "Popular",
        duration: "4h 29m 10s",
        author: "Starweaver",
        learnersCount: "1,802 learners",
        skills: ["Metasploit", "Tenable Nessus", "Autonomous Vulnerability Validation", "Continuous Attack Surface Management"],
        category: "Cybersecurity",
        thumbnail: "/images/connectln-studies/cyber-specialist-cover.jpg",
        customCoverArt: "/images/connectln-studies/cyber-specialist-cover.jpg",
        referenceUrl: "https://docs.tenable.com/nessus/",
        summary: "Integrate Tenable Nessus credentialed vulnerability scans with Metasploit RPC automation and AI prioritization engines to verify exploitability, calculate EPSS/CVSSv4 risk, and verify patch closure."
      },
      {
        id: "cln-complete-guide-copilot-for-security-soc",
        shelfId: "shelf-top-skills-for-you",
        academyTrack: "cyber_specialist",
        title: "Complete Guide to Microsoft Copilot for Security: Empower and Protect the Security Operations Center (SOC) by Microsoft Press",
        badge: "Cert Prep",
        duration: "9h 25m 23s",
        author: "Microsoft Press, Joseph Muniz, and Eric Snyder",
        learnersCount: "2,318 learners",
        skills: ["Microsoft Copilot for Security", "Sentinel KQL Promptbooks", "Defender XDR Incident Summarization", "Reverse Engineering Malware Scripts"],
        category: "Cybersecurity",
        thumbnail: "/images/connectln-studies/packet-soc-cover.jpg",
        customCoverArt: "/images/connectln-studies/packet-soc-cover.jpg",
        referenceUrl: "https://learn.microsoft.com/en-us/copilot/security/",
        summary: "Definitive 9.5-hour SOC engineering manual for Microsoft Copilot for Security: custom KQL promptbooks, deobfuscating malicious PowerShell/JS payloads, Entra blast-radius mapping, and SCU capacity optimization."
      },
      {
        id: "cln-applied-chatgpt-cyber-infosec",
        shelfId: "shelf-top-skills-for-you",
        academyTrack: "cyber_specialist",
        title: "Applied ChatGPT for Cybersecurity by Infosec",
        badge: "Popular",
        duration: "53m 40s",
        author: "Infosec Institute",
        learnersCount: "2,360 learners",
        skills: ["Hardware Hacking", "UART/JTAG Firmware Analysis", "Regex & Splunk SPL Generation", "Red-Team Recon Automation"],
        category: "Cybersecurity",
        thumbnail: "/images/connectln-studies/cyber-specialist-cover.jpg",
        customCoverArt: "/images/connectln-studies/cyber-specialist-cover.jpg",
        referenceUrl: "https://owasp.org/www-project-internet-of-things/",
        summary: "Accelerate offensive and defensive workflows using LLMs: reverse-engineering embedded IoT/UART firmware dumps, crafting complex Splunk SPL / Suricata rules, and auditing C/Rust memory safety."
      },
      {
        id: "cln-agentic-ai-next-gen-cybrary",
        shelfId: "shelf-top-skills-for-you",
        academyTrack: "cyber_specialist",
        title: "Agentic AI: The Next Generation of AI by Cybrary",
        badge: "New",
        duration: "1h 34m 6s",
        author: "Cybrary",
        learnersCount: "15,420 learners",
        skills: ["Multi-Agent Swarm Security", "Cryptographic Agent Identity (SPIFFE)", "Autonomous SOC Tier-1/Tier-2", "Guardrail Policy Engines"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/agentic-mcp-cover.jpg",
        customCoverArt: "/images/connectln-studies/agentic-mcp-cover.jpg",
        referenceUrl: "https://spiffe.io/",
        summary: "Next-generation multi-agent systems architecture: cryptographic workload attestation (SPIFFE/SPIRE) for non-human agent identities, inter-agent zero-trust policy enforcement, and autonomous SOC swarms."
      }
    ]
  }
]

// ============================================================================
// PART 2: CONNECTLN STUDIES — ARTIFICIAL INTELLIGENCE HUB (ALL 5 SHELVES)
// ============================================================================
export const CONNECTLN_AI_STUDIES_SHELVES: ConnectLnCourseShelf[] = [
  {
    id: "shelf-ai-new-featured",
    academyTrack: "ai_studies",
    title: "New & Featured Courses",
    subtitle: "ConnectLn Studies Curated Content on Vital AI Technologies, Defender XDR AI & AI-Ready Data",
    totalCountBadge: "Show all 1,318 courses",
    filterPills: ["Adobe AI Marketing", "Strategic Prompt Engineering", "Defender XDR AI Detection", "AI-Ready Data Design", "PowerShell AI"],
    courses: [
      {
        id: "cln-ai-adobe-content-gen",
        shelfId: "shelf-ai-new-featured",
        academyTrack: "ai_studies",
        title: "AI-Powered Content Generation for Communications and Social Media Marketing by Adobe",
        badge: "Popular",
        duration: "1h 22m 21s",
        author: "Adobe Inc",
        releaseDate: "Jun 15, 2026",
        learnersCount: "2,669 learners",
        skills: ["Adobe Firefly GenAI", "Multi-Channel Campaign Synthesis", "C2PA Content Credentials", "Multilingual Brand Localization"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/ai-studies-cover.jpg",
        customCoverArt: "/images/connectln-studies/ai-studies-cover.jpg",
        referenceUrl: "https://www.adobe.com/products/firefly.html",
        summary: "Discover how to use AI tools to streamline social media marketing and enterprise communications: from ideation and content creation to paid ads, repurposing, and translation on ConnectLn Studies."
      },
      {
        id: "cln-ai-strategic-prompt-eng",
        shelfId: "shelf-ai-new-featured",
        academyTrack: "ai_studies",
        title: "Strategic Prompt Engineering: From Fundamentals to Expertise",
        badge: "Popular",
        duration: "20m 53s",
        author: "genConnectU and Ronsley Vaz",
        releaseDate: "Jul 15, 2026",
        learnersCount: "2,776 learners",
        skills: ["System Role Conditioning", "Chain-of-Density Summarization", "Multi-Turn Context Compression", "Deterministic Output Rubrics"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/agentic-mcp-cover.jpg",
        customCoverArt: "/images/connectln-studies/agentic-mcp-cover.jpg",
        referenceUrl: "https://platform.openai.com/docs/guides/prompt-engineering",
        summary: "Explore the art and science of strategic prompt engineering on ConnectLn Studies, learning how to communicate with frontier AI systems to get precise, creative, and high-reliability engineering results."
      },
      {
        id: "cln-ai-defender-xdr-detection",
        shelfId: "shelf-ai-new-featured",
        academyTrack: "ai_studies",
        title: "Complete Guide to Microsoft Defender XDR Using AI Detection by Microsoft Press",
        badge: "Popular",
        duration: "5h 28m 5s",
        author: "Microsoft Press",
        releaseDate: "Aug 5, 2026",
        learnersCount: "11,420 learners",
        skills: ["Microsoft Defender", "Artificial Intelligence (AI)", "AI Security", "Threat Detection", "Automated Attack Disruption"],
        category: "Cybersecurity",
        thumbnail: "/images/connectln-studies/packet-soc-cover.jpg",
        customCoverArt: "/images/connectln-studies/packet-soc-cover.jpg",
        referenceUrl: "https://learn.microsoft.com/en-us/defender-xdr/",
        summary: "Learn how to use Microsoft Defender XDR for AI-powered threat detection, cross-domain signal correlation (Endpoint, Identity, Cloud Apps, Email), and automatic attack disruption in ConnectLn Studies."
      },
      {
        id: "cln-ai-ready-data-design",
        shelfId: "shelf-ai-new-featured",
        academyTrack: "ai_studies",
        title: "AI-Ready Data Design: Building Systems That AI Can Actually Use",
        badge: "Popular",
        duration: "2h 34m 2s",
        author: "Walter Shields",
        releaseDate: "Aug 12, 2026",
        learnersCount: "16,890 learners",
        skills: ["Data Processing", "Data Architecture", "Data Quality", "Artificial Intelligence (AI)", "Data Governance", "AI Readiness", "Metadata Management"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/mlops-data-cover.jpg",
        customCoverArt: "/images/connectln-studies/mlops-data-cover.jpg",
        referenceUrl: "https://www.nist.gov/itl/ai-risk-management-framework",
        summary: "Learn how to design, document, and govern an enterprise semantic data warehouse and active metadata layer that AI analytics agents can navigate accurately and reliably without hallucinated joins."
      },
      {
        id: "cln-ai-powershell-building-apps",
        shelfId: "shelf-ai-new-featured",
        academyTrack: "ai_studies",
        title: "PowerShell AI: Building AI Applications with PowerShell by Pearson",
        badge: "Cert Prep",
        duration: "14h 58m 49s",
        author: "Pearson",
        releaseDate: "Aug 3, 2026",
        learnersCount: "6,340 learners",
        skills: ["PowerShell 7.4+ AST Automation", "Local Ollama & OpenAI REST SDK", "Windows/Azure Autonomous Remediation", "PSAI Agentic Pipelines"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/cyber-specialist-cover.jpg",
        customCoverArt: "/images/connectln-studies/cyber-specialist-cover.jpg",
        referenceUrl: "https://learn.microsoft.com/en-us/powershell/",
        summary: "Harness the capabilities of AI tools like ChatGPT and local Ollama models inside PowerShell 7 to build enterprise automation pipelines, parse Windows Event Logs, and drive autonomous SecOps value."
      }
    ]
  },
  {
    id: "shelf-ai-upskilling-framework",
    academyTrack: "ai_studies",
    title: "ConnectLn Studies Artificial Intelligence Upskilling Framework",
    subtitle: "Structured 5-Tier Competency Progression from AI Foundations to Deep Specialization",
    totalCountBadge: "Levels 1 – 5 Framework",
    filterPills: [
      "AI Framework Level 5: Deeply Specializing",
      "AI Framework Level 1: Understanding AI",
      "AI Framework Level 2: Applying AI",
      "AI Framework Level 3: Building AI",
      "AI Framework Level 4: Training and Maintaining Models"
    ],
    courses: [
      {
        id: "cln-ai-nvidia-nca-genl-prep",
        shelfId: "shelf-ai-upskilling-framework",
        academyTrack: "ai_studies",
        title: "NVIDIA Certified Associate Generative AI LLMs (NCA-GENL) Cert Prep",
        badge: "Popular",
        duration: "9h 21m 43s",
        author: "Packt Publishing",
        releaseDate: "Jun 4, 2026",
        learnersCount: "3,771 learners",
        aiFrameworkLevel: "AI Framework Level 5: Deeply Specializing",
        skills: ["NVIDIA TensorRT-LLM & NeMo", "CUDA Attention Kernels", "FP8 Quantization & KV-Cache", "NCA-GENL Exam Mastery"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/ai-studies-cover.jpg",
        customCoverArt: "/images/connectln-studies/ai-studies-cover.jpg",
        referenceUrl: "https://www.nvidia.com/en-us/learn/certification/generative-ai-llm-associate/",
        summary: "Comprehensive all-in-one ConnectLn Studies resource to tackle the NVIDIA Certified Associate Generative AI LLMs (NCA-GENL) exam: GPU tensor cores, NeMo Guardrails, TensorRT-LLM inference, and distributed scaling."
      },
      {
        id: "cln-ai-ready-data-design-lvl3",
        shelfId: "shelf-ai-upskilling-framework",
        academyTrack: "ai_studies",
        title: "AI-Ready Data Design: Building Systems That AI Can Actually Use (Framework Track)",
        badge: "Popular",
        duration: "2h 34m 2s",
        author: "Walter Shields",
        releaseDate: "Aug 12, 2026",
        learnersCount: "16,890 learners",
        aiFrameworkLevel: "AI Framework Level 3: Building AI",
        skills: ["Data Processing", "Data Architecture", "Data Quality", "Artificial Intelligence (AI)", "Data Governance", "AI Readiness", "Metadata Management"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/mlops-data-cover.jpg",
        customCoverArt: "/images/connectln-studies/mlops-data-cover.jpg",
        referenceUrl: "https://www.nist.gov/itl/ai-risk-management-framework",
        summary: "Level 3 Building AI Pillar: Architect semantic data layers, ontologies, and deterministic metadata catalogs so text-to-SQL and RAG agents achieve >99% query accuracy."
      },
      {
        id: "cln-ai-claude-architect-ccarf-lvl4",
        shelfId: "shelf-ai-upskilling-framework",
        academyTrack: "ai_studies",
        title: "Anthropic Claude Certified Architect Foundations (CCAR-F) Cert Prep",
        badge: "Updated · Popular",
        duration: "7h 59m 31s",
        author: "Tutorials Dojo",
        releaseDate: "Aug 27, 2026",
        learnersCount: "24,447 learners",
        aiFrameworkLevel: "AI Framework Level 4: Training and Maintaining Models",
        skills: ["Agentic Architecture", "Tool Design & MCP", "Context Window Management", "AI Systems Orchestration"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/agentic-mcp-cover.jpg",
        customCoverArt: "/images/connectln-studies/agentic-mcp-cover.jpg",
        referenceUrl: "https://docs.anthropic.com/",
        summary: "Explore the essentials of becoming a Claude Certified Architect on ConnectLn Studies through reviewing agentic architecture, tool design, context management, and AI systems orchestration."
      },
      {
        id: "cln-ai-evaluating-outputs-data-pros",
        shelfId: "shelf-ai-upskilling-framework",
        academyTrack: "ai_studies",
        title: "Evaluating AI Outputs for Data Professionals",
        badge: "Popular",
        duration: "1h 00m 00s",
        author: "Mo Chen",
        releaseDate: "Aug 14, 2026",
        learnersCount: "9,120 learners",
        aiFrameworkLevel: "AI Framework Level 2: Applying AI",
        skills: ["Data Analysis", "Artificial Intelligence (AI)", "AI Evaluation", "LLM-as-a-Judge Rubrics"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/grc-governance-cover.jpg",
        customCoverArt: "/images/connectln-studies/grc-governance-cover.jpg",
        referenceUrl: "https://www.nist.gov/itl/ai-risk-management-framework",
        summary: "Learn a systematic ConnectLn Studies framework for evaluating any AI output—yours, a colleague's, or a tool's—across every statistical error type, hallucination class, and validity check."
      },
      {
        id: "cln-ai-powered-data-analysis-beyond",
        shelfId: "shelf-ai-upskilling-framework",
        academyTrack: "ai_studies",
        title: "AI-Powered Data Analysis: Beyond Prompting",
        badge: "Popular",
        duration: "54m 42s",
        author: "Mo Chen",
        releaseDate: "Aug 7, 2026",
        learnersCount: "11,340 learners",
        aiFrameworkLevel: "AI Framework Level 1: Understanding AI",
        skills: ["Structured Analytical Decomposition", "Defensible Analyst Briefs", "Counterfactual Hypothesis Testing", "Code-Interpreter Verification"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/mlops-data-cover.jpg",
        customCoverArt: "/images/connectln-studies/mlops-data-cover.jpg",
        referenceUrl: "https://connectln.vercel.app/connectin#cln-ai-powered-data-analysis-beyond",
        summary: "Learn to use AI as a structured thinking partner—not a search engine—to move from a vague business question to a finished, mathematically defensible analyst brief."
      }
    ]
  },
  {
    id: "shelf-ai-go-deeper-paths",
    academyTrack: "ai_studies",
    title: "Go Deeper with AI Learning Paths",
    subtitle: "Multi-Course ConnectLn Studies Learning Paths with Endorsed Professional Certificates",
    totalCountBadge: "Show all 76 learning paths",
    filterPills: ["Learn Vibe Coding (5h 30m)", "Building AI Agents (4h 41m)", "MLOps Essentials (18h)", "Adobe Firefly Certificate (7h 36m)", "GraphRAG & Data MLOps (9h 32m)"],
    courses: [
      {
        id: "cln-path-learn-vibe-coding",
        shelfId: "shelf-ai-go-deeper-paths",
        academyTrack: "ai_studies",
        title: "Learn Vibe Coding: Build Apps with AI-Powered Coding",
        badge: "Learning Path",
        duration: "5h 30m 8s",
        author: "ConnectLn Studies AI Engineering Faculty",
        releaseDate: "Sep 10, 2025",
        learnersCount: "5h 30m 8s left",
        updateNotice: "Note: This ConnectLn Studies learning path will be updated on November 2, 2026. Complete before that date for uninterrupted certification.",
        skills: ["Strategic Spec Prompting", "Full-Stack AI Code Generation", "Automated Test Harnesses", "10x Developer Velocity"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/agentic-mcp-cover.jpg",
        customCoverArt: "/images/connectln-studies/agentic-mcp-cover.jpg",
        referenceUrl: "https://connectln.vercel.app/connectin#cln-path-learn-vibe-coding",
        summary: "Transform ideas into working full-stack apps by leveraging vibe coding. Steer architectural vision with strategic prompting while AI executes scaffolding, database schemas, and UI polish."
      },
      {
        id: "cln-path-building-ai-agents-devs",
        shelfId: "shelf-ai-go-deeper-paths",
        academyTrack: "ai_studies",
        title: "Building AI Agents: Advanced Techniques for Developers",
        badge: "Learning Path",
        duration: "4h 41m 1s",
        author: "ConnectLn Studies Agentic Architecture Council",
        releaseDate: "Sep 10, 2025",
        learnersCount: "4h 41m 1s left",
        updateNotice: "Note: This learning path will be updated on November 16, 2026. Covers LangGraph, LlamaIndex, and Model Context Protocol (MCP).",
        skills: ["LangGraph Stateful Graphs", "LlamaIndex Agentic RAG", "Model Context Protocol (MCP)", "Multi-Agent Collaboration"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/agentic-mcp-cover.jpg",
        customCoverArt: "/images/connectln-studies/agentic-mcp-cover.jpg",
        referenceUrl: "https://modelcontextprotocol.io/",
        summary: "Master the rapidly growing field of AI agent building: architect multi-agent systems that collaborate and solve complex problems autonomously using LangGraph, LlamaIndex, and Model Context Protocol."
      },
      {
        id: "cln-path-mlops-essentials-security",
        shelfId: "shelf-ai-go-deeper-paths",
        academyTrack: "ai_studies",
        title: "MLOps Essentials for Developers and AI Engineers: Tools, Pipelines, Security",
        badge: "Learning Path",
        duration: "18h 4m 59s",
        author: "ConnectLn Studies MLOps & Security Guild",
        releaseDate: "Jul 14, 2025",
        learnersCount: "18h 4m 59s left",
        skills: ["Docker & Kubernetes GPU Scheduling", "MLflow Model Registry", "Hugging Face Safetensors", "ML Bias & Adversarial Security"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/mlops-data-cover.jpg",
        customCoverArt: "/images/connectln-studies/mlops-data-cover.jpg",
        referenceUrl: "https://mlflow.org/docs/latest/index.html",
        summary: "Explore foundational tools for MLOps—including Docker, Kubernetes, MLflow, and Hugging Face—covering the full model lifecycle from development to deployment, drift monitoring, bias detection, and ML security."
      },
      {
        id: "cln-path-adobe-firefly-cert",
        shelfId: "shelf-ai-go-deeper-paths",
        academyTrack: "ai_studies",
        title: "Essential Skills in Adobe Firefly Professional Certificate",
        badge: "Learning Path",
        duration: "7h 36m 36s",
        author: "Adobe & ConnectLn Studies",
        releaseDate: "Aug 18, 2025",
        learnersCount: "7h 36m 36s left",
        updateNotice: "Endorsed by Adobe · Includes ConnectLn Studies Pro Creative Cloud integration lab.",
        skills: ["Adobe Firefly Generative Fill", "Structure & Style Reference", "Photoshop & Illustrator GenAI", "Commercial Safe IP Provenance"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/ai-studies-cover.jpg",
        customCoverArt: "/images/connectln-studies/ai-studies-cover.jpg",
        referenceUrl: "https://www.adobe.com/products/firefly.html",
        summary: "Harness Adobe Firefly generative AI workflows across Photoshop, Illustrator, and Premiere Pro. Complete all modules, pass the final exam, and earn your Adobe-endorsed ConnectLn Studies Certificate."
      },
      {
        id: "cln-path-working-with-data-graphrag",
        shelfId: "shelf-ai-go-deeper-paths",
        academyTrack: "ai_studies",
        title: "Working with Data: Engineering, Integration, and MLOps for AI",
        badge: "Learning Path",
        duration: "9h 32m 12s",
        author: "ConnectLn Studies Data & GraphRAG Faculty",
        releaseDate: "Jul 2, 2026",
        learnersCount: "9h 32m 12s left",
        updateNotice: "Updated July 2, 2026 · Now includes GraphRAG Essential Training & Knowledge Graph Ontologies.",
        skills: ["GraphRAG & Knowledge Graphs", "Vector + Cypher Hybrid Search", "Data Versioning (DVC/LakeFS)", "AI Pipeline Orchestration"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/mlops-data-cover.jpg",
        customCoverArt: "/images/connectln-studies/mlops-data-cover.jpg",
        referenceUrl: "https://microsoft.github.io/graphrag/",
        summary: "Master advanced data engineering for AI systems: data integration, API development, versioning, quality monitoring, knowledge graphs, GraphRAG architectures, and hybrid semantic search."
      }
    ]
  },
  {
    id: "shelf-ai-build-with-ai",
    academyTrack: "ai_studies",
    title: "Build with AI",
    subtitle: "Hands-On Agentic SDKs: Claude Agent SDK, Claude Code Subagents, Gemini 3, Cursor 2 & OpenAI Apps SDK",
    totalCountBadge: "Show all 1,318 courses",
    filterPills: ["Claude Agent SDK", "Claude Code Subagents", "Gemini 3 Infographics", "Cursor 2 Agents", "OpenAI Apps SDK & MCP"],
    courses: [
      {
        id: "cln-build-claude-agent-sdk",
        shelfId: "shelf-ai-build-with-ai",
        academyTrack: "ai_studies",
        title: "Hands-On AI: Build an Autonomous Agent with the Claude Agent SDK",
        badge: "Popular",
        duration: "40m 39s",
        author: "Harshit Tyagi",
        releaseDate: "Dec 18, 2025",
        learnersCount: "15,405 learners",
        skills: ["Claude Agent SDK", "Persistent Vector Memory", "Deterministic Tool Execution", "Deep Research Agent UI"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/agentic-mcp-cover.jpg",
        customCoverArt: "/images/connectln-studies/agentic-mcp-cover.jpg",
        referenceUrl: "https://docs.anthropic.com/",
        summary: "Build autonomous AI agents with the Claude Agent SDK on ConnectLn Studies. Learn to add episodic/semantic memory, integrate MCP tools, and design a full deep-research agentic application."
      },
      {
        id: "cln-build-claude-code-subagents",
        shelfId: "shelf-ai-build-with-ai",
        academyTrack: "ai_studies",
        title: "Build with AI: Leverage Claude Code Subagents in Software Projects",
        badge: "Popular",
        duration: "50m 21s",
        author: "Harshit Tyagi",
        releaseDate: "Dec 8, 2025",
        learnersCount: "5,280 learners",
        skills: ["Claude Code Subagents", "Parallel Task Decomposition", "Isolated Context Windows", "Automated Code Review Gates"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/agentic-mcp-cover.jpg",
        customCoverArt: "/images/connectln-studies/agentic-mcp-cover.jpg",
        referenceUrl: "https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview",
        summary: "Automate complex multi-service engineering workflows by spawning specialized subagents in Claude Code to parallelize research, refactoring, security auditing, and test generation."
      },
      {
        id: "cln-build-vibe-code-infographics-gemini3",
        shelfId: "shelf-ai-build-with-ai",
        academyTrack: "ai_studies",
        title: "Vibe Code This: AI-Powered Branded Infographics Tool",
        badge: "Popular",
        duration: "22m 6s",
        author: "Ray Villalobos",
        releaseDate: "Dec 15, 2025",
        learnersCount: "3,598 learners",
        skills: ["Google Gemini Multimodal", "SVG & Canvas Infographic Gen", "Brand Design System Tokens", "Structured JSON Visual Specs"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/ai-studies-cover.jpg",
        customCoverArt: "/images/connectln-studies/ai-studies-cover.jpg",
        referenceUrl: "https://ai.google.dev/gemini-api/docs",
        summary: "Use the power of Google Gemini to build an interactive web application that lets enterprise teams generate on-brand technical illustrations and data infographics automatically."
      },
      {
        id: "cln-build-cursor-2-agents",
        shelfId: "shelf-ai-build-with-ai",
        academyTrack: "ai_studies",
        title: "Build with AI: Creating Apps with Cursor 2 Agents",
        badge: "Popular",
        duration: "28m 40s",
        author: "Ray Villalobos",
        releaseDate: "Nov 20, 2025",
        learnersCount: "9,057 learners",
        skills: ["Cursor 2 Composer & Agent Mode", ".cursorrules Architecture Specs", "Terminal Loop Auto-Fix", "Multi-File AST Refactoring"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/agentic-mcp-cover.jpg",
        customCoverArt: "/images/connectln-studies/agentic-mcp-cover.jpg",
        referenceUrl: "https://www.cursor.com/",
        summary: "Master agentic development with Cursor 2 Composer and Agent Mode to architect, refactor, run automated test suites, and ship full-stack production features with high assurance."
      },
      {
        id: "cln-build-openai-apps-sdk-chatgpt",
        shelfId: "shelf-ai-build-with-ai",
        academyTrack: "ai_studies",
        title: "OpenAI Apps SDK: Building Apps for ChatGPT",
        badge: "New",
        duration: "50m 25s",
        author: "Morten Rand-Hendriksen",
        releaseDate: "Oct 20, 2025",
        learnersCount: "14,210 learners",
        skills: ["OpenAI Apps SDK", "Model Context Protocol (MCP)", "OAuth 2.1 Delegated Actions", "Interactive ChatGPT Canvas UI"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/ai-studies-cover.jpg",
        customCoverArt: "/images/connectln-studies/ai-studies-cover.jpg",
        referenceUrl: "https://platform.openai.com/docs/",
        summary: "Embed your enterprise application or service directly inside ChatGPT using OpenAI's Apps SDK and Model Context Protocol (MCP) with end-to-end OAuth security."
      }
    ]
  },
  {
    id: "shelf-ai-certifications",
    academyTrack: "ai_studies",
    title: "ConnectLn Studies — AI & Security Professional Certifications",
    subtitle: "On-Demand Courses & Practice Exams to Earn Professional Certificates, AKYLADE A/AISF & A/AISP, and Azure AI-900",
    totalCountBadge: "6 Official Certification Tracks",
    filterPills: [
      "Microsoft & ConnectLn GenAI Certificate",
      "AKYLADE A/AISF (AISF-001)",
      "Human Skills in the Age of AI",
      "AKYLADE A/AISP (AIP-001)",
      "Azure AI-900 Practice Exam 2",
      "Azure AI-900 Practice Exam 1"
    ],
    courses: [
      {
        id: "cln-cert-career-essentials-genai-msft",
        shelfId: "shelf-ai-certifications",
        academyTrack: "ai_studies",
        title: "Career Essentials in Generative AI by Microsoft and ConnectLn Studies",
        badge: "Certification",
        duration: "6h 15m",
        author: "Microsoft & ConnectLn Studies",
        releaseDate: "Updated Oct 2, 2026",
        learnersCount: "1,420,000+ learners",
        updateNotice: "Note: Updated Oct 2, 2026 (Renews Nov 16, 2026). Includes Learning Microsoft 365 Copilot & Generative AI: From Prompts to Partnership.",
        skills: ["Generative AI Foundations", "Microsoft Copilot Mastery", "Responsible AI Ethics", "Prompt-to-Partnership Workflows"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/ai-studies-cover.jpg",
        customCoverArt: "/images/connectln-studies/ai-studies-cover.jpg",
        referenceUrl: "https://learn.microsoft.com/en-us/training/",
        summary: "Generative AI is reshaping industries by transforming how work gets done. This official Microsoft & ConnectLn Studies certification path covers content creation, foundation models, ethical governance, and Microsoft 365 Copilot."
      },
      {
        id: "cln-cert-akylade-aisf-001",
        shelfId: "shelf-ai-certifications",
        academyTrack: "ai_studies",
        title: "AKYLADE AI Security Foundation AISF-001 (A/AISF) Cert Prep",
        badge: "Certification",
        duration: "5h 45m",
        author: "AKYLADE & Dwayne Natwick",
        releaseDate: "Aug 2026",
        learnersCount: "14,320 learners",
        skills: ["AKYLADE A/AISF (AISF-001)", "NIST AI RMF 1.0 Core", "AI Trustworthiness Pillars", "AI Risk & Compliance Foundations"],
        category: "GRC & Audit",
        thumbnail: "/images/connectln-studies/grc-governance-cover.jpg",
        customCoverArt: "/images/connectln-studies/grc-governance-cover.jpg",
        referenceUrl: "https://www.nist.gov/itl/ai-risk-management-framework",
        summary: "The AKYLADE AI Security Foundation (A/AISF) certification exam evaluates your ability to apply essential AI security concepts, AI risk management, trustworthiness metrics, and the NIST AI Risk Management Framework."
      },
      {
        id: "cln-cert-human-skills-age-of-ai",
        shelfId: "shelf-ai-certifications",
        academyTrack: "ai_studies",
        title: "Human Skills in the Age of AI by Microsoft and ConnectLn Studies",
        badge: "Certification",
        duration: "4h 50m",
        author: "Microsoft & ConnectLn Studies",
        releaseDate: "Sep 2026",
        learnersCount: "310,400 learners",
        skills: ["Cognitive Adaptability", "AI-Augmented Decision Making", "Social & Emotional Intelligence", "Critical Thinking with GenAI"],
        category: "Leadership & Consulting",
        thumbnail: "/images/connectln-studies/cyber-specialist-cover.jpg",
        customCoverArt: "/images/connectln-studies/cyber-specialist-cover.jpg",
        referenceUrl: "https://connectln.vercel.app/connectin#cln-cert-human-skills-age-of-ai",
        summary: "Thrive in a rapidly evolving workplace by enhancing your essential human skills for the AI era: build adaptability, strengthen decision-making, amplify communication, and integrate GenAI into critical thinking."
      },
      {
        id: "cln-cert-akylade-aisp-001",
        shelfId: "shelf-ai-certifications",
        academyTrack: "ai_studies",
        title: "AKYLADE AI Security Practitioner AIP-001 (A/AISP) Cert Prep",
        badge: "Certification",
        duration: "8h 30m",
        author: "Dwayne Natwick and Captain Hyperscaler",
        releaseDate: "Sep 2026",
        learnersCount: "9,870 learners",
        skills: ["Ethics & Human-AI Interaction", "Advanced AI Risk Management", "AI System Integration & Security", "NIST AI RMF Action Plan & IR"],
        category: "Cybersecurity",
        thumbnail: "/images/connectln-studies/cyber-specialist-cover.jpg",
        customCoverArt: "/images/connectln-studies/cyber-specialist-cover.jpg",
        referenceUrl: "https://www.nist.gov/itl/ai-risk-management-framework",
        summary: "Validates practitioner expertise across all 6 A/AISP domains: Ethics and Human-AI Interaction, Advanced AI Risk Management, AI System Integration and Security, NIST AI RMF, AI Risk Action Plan, and AI Incident Response."
      },
      {
        id: "cln-cert-azure-ai-900-exam2",
        shelfId: "shelf-ai-certifications",
        academyTrack: "ai_studies",
        title: "Practice Exam 2 for Azure AI Fundamentals (AI-900)",
        badge: "Cert Prep",
        duration: "2h 00m (Timed / Untimed / Custom)",
        author: "Microsoft Learn & ConnectLn Studies",
        releaseDate: "Oct 2026",
        learnersCount: "45,600 learners",
        skills: ["Azure AI Vision & Document Intelligence", "Azure OpenAI Service", "Azure Machine Learning Studio", "Responsible AI Principles"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/mlops-data-cover.jpg",
        customCoverArt: "/images/connectln-studies/mlops-data-cover.jpg",
        referenceUrl: "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/",
        summary: "Prepare for the Microsoft Azure AI Fundamentals (AI-900) certification exam with Timed, Untimed, and Custom practice modes, unlimited attempts, and full architectural explanations for every question."
      },
      {
        id: "cln-cert-azure-ai-900-exam1",
        shelfId: "shelf-ai-certifications",
        academyTrack: "ai_studies",
        title: "Practice Exam 1 for Azure AI Fundamentals (AI-900)",
        badge: "Cert Prep",
        duration: "2h 00m (Representative Assessment)",
        author: "Microsoft Learn & ConnectLn Studies",
        releaseDate: "Oct 2026",
        learnersCount: "62,150 learners",
        skills: ["Azure AI Search & Vector Indexes", "NLP & Conversational AI", "Computer Vision Workloads", "Fairness, Privacy & Inclusiveness"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/ai-studies-cover.jpg",
        customCoverArt: "/images/connectln-studies/ai-studies-cover.jpg",
        referenceUrl: "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/",
        summary: "Official representative self-assessment for Microsoft Azure AI Fundamentals (AI-900) covering anomaly detection, computer vision, NLP, knowledge mining, and generative AI workloads on Azure."
      }
    ]
  }
]

export function getAllConnectLnSpecialistCourses(): ConnectLnCatalogCourse[] {
  return [
    ...CONNECTLN_CYBER_SPECIALIST_SHELVES.flatMap((s) => s.courses),
    ...CONNECTLN_AI_STUDIES_SHELVES.flatMap((s) => s.courses)
  ]
}

export function getConnectLnCourseWhitePaper(
  course: ConnectLnCatalogCourse,
  shelfTitle?: string
): RoadmapStepWhitePaper {
  const docId = `CLN-WP-2026-${course.id.replace("cln-", "").toUpperCase().slice(0, 14)}`

  const isCyber = course.category === "Cybersecurity"
  const isAI = course.category === "AI & Agentic Systems"
  const isGRC = course.category === "GRC & Audit"
  const isNet = course.category === "Networking & Packets"
  const isData = course.category === "Cloud & Data"

  const standardsBody = isCyber
    ? "NIST CSF 2.0 · MITRE ATT&CK v16 / ATLAS · ISC2 CBK · OWASP Top 10"
    : isAI
    ? "NIST AI RMF 1.0 · Anthropic MCP Spec 2025 · ISO/IEC 42001 · IEEE 7000"
    : isGRC
    ? "ISO/IEC 27001:2022 · AICPA SOC 2 Type II · NIST SP 800-53 Rev. 5 · ISACA CISM"
    : isNet
    ? "IETF RFC 9293 (TCP) · RFC 8446 (TLS 1.3) · IEEE 802.1Q · CompTIA N10-009"
    : isData
    ? "Apache Arrow / Kafka KRaft Spec · ISO/SAE 21434 · HL7 FHIR R4 · CIS Cloud Benchmarks"
    : "ISO 24495-1 Plain Language · MECE Strategy Standard · PMI / Principal TPM Framework"

  const skillDeepDives: SkillDeepDiveSpec[] = course.skills.map((skill, idx) => {
    const pageNum = Math.min(3 + idx, 5)
    return {
      skillName: skill,
      categoryBadge: `${course.category.toUpperCase()} · MODULE ${idx + 1}`,
      standardCode: `${standardsBody.split("·")[0].trim()} — Sec. ${idx + 1}.0`,
      technicalSummary: `Comprehensive ConnectLn Studies engineering deep-dive for "${skill}" within "${course.title}" (Instructor: ${course.author}). This module establishes first-principles architecture, production CLI/code patterns, adversarial resilience, and measurable enterprise verification telemetry.`,
      governingEquation: isCyber
        ? `Risk_Score(R) = P(Exploit | EPSS) × Blast_Radius(CVSS_v4) × (1 - Control_Efficacy)  |  MTTD ≤ 45s · MTTR ≤ 180s`
        : isAI
        ? `Attention(Q,K,V) = softmax((Q·K^T)/√d_k)·V  |  Agent_Reliability = (p_step_accuracy)^(N_steps) ≥ 0.992`
        : isGRC
        ? `ALE (Annualized Loss Expectancy) = SLE (Single Loss Expectancy) × ARO (Annualized Rate of Occurrence)`
        : isNet
        ? `Throughput_max ≤ (TCP_Window_Size / RTT)  |  BPF_Filter: (tcp[tcpflags] & (tcp-syn|tcp-ack) == tcp-syn)`
        : `Throughput = N_partitions × (Batch_Size / Latency_p99)  |  Availability_SLA = 1 - (Downtime / Total_Time) ≥ 99.99%`,
      fieldProtocol: [
        `Initialize isolated ConnectLn Studies lab environment and verify baseline telemetry for ${skill} prior to configuration changes.`,
        `Implement deterministic production policy / code constructs for ${skill} in strict alignment with ${standardsBody.split("·")[0].trim()}.`,
        `Execute automated adversarial/fault-injection verification tests to confirm zero regression across boundary conditions.`,
        `Export signed verification telemetry, audit logs, and runbook documentation into the ConnectLn Studies Enterprise Dossier.`
      ],
      criticalTolerance: isCyber
        ? "0 Unauthenticated Lateral Paths · ≥ 99.4% True-Positive Detection Precision"
        : isAI
        ? "< 0.5% Hallucination Rate on Golden Evals · 100% Sandbox Tool Schema Validation"
        : isGRC
        ? "Zero Material Audit Exceptions · 100% Continuous Control Evidence Coverage"
        : isNet
        ? "0.00% Packet Drop at Line Rate · < 2ms Deep-Packet Dissection Overhead"
        : "P99 Latency ≤ 15ms · 100% Type-Safe Schema Contract Compliance",
      toolingRequired: isCyber
        ? "Microsoft Copilot for Security, Defender XDR, Sentinel KQL, Tenable Nessus, Metasploit Pro"
        : isAI
        ? "Google Antigravity IDE, Anthropic Claude Code CLI, MCP Inspector, Cursor 2 & Gemini SDK"
        : isGRC
        ? "ConnectLn Studies GRC Engine, Open Policy Agent (OPA), AKYLADE Audit Matrix & FAIR Simulator"
        : isNet
        ? "Wireshark 4.4, tcpdump / libpcap, Python Scapy 2.6 & eBPF Cilium Tetragon"
        : "Apache Kafka KRaft, Python Polars / PyArrow, GraphRAG, MLflow & Azure AI Foundry",
      failureMode: `Improper implementation or unverified assumptions in ${skill} create silent blind spots that degrade under adversarial load or high-concurrency traffic spikes.`,
      pageNumber: pageNum
    }
  })

  const governingEqBlock = [
    `// ============================================================================`,
    `// CONNECTLN STUDIES TECHNICAL WHITE PAPER MODEL — ${course.title.toUpperCase()}`,
    `// Author / Faculty: ${course.author} · Duration: ${course.duration} · Doc ID: ${docId}`,
    `// ============================================================================`,
    ...skillDeepDives.map(
      (s, i) => `// [${i + 1}] Competency Module: ${s.skillName} (${s.standardCode})\n${s.governingEquation}`
    )
  ].join("\n\n")

  const schematicBlock = `===================================================================================
   CONNECTLN STUDIES ENTERPRISE ARCHITECTURE: ${course.title.toUpperCase()}
===================================================================================
   [ TELEMETRY / INPUT INGESTION LAYER ]
         │  ├── ConnectLn Studies Track: ${shelfTitle || "Cyber & AI Specialist Catalog"}
         │  ├── Governing Standard: ${standardsBody}
         │  └── Primary Module: ${course.skills[0] || course.title}
         ▼
   [ CORE PROCESSING, POLICY & AGENT ORCHESTRATION ENGINE ]
         │  ├── Stage A: ${course.skills[0] || "Architecture & Baseline"}
         │  ├── Stage B: ${course.skills[1] || "Policy & Cryptographic Guardrails"}
         │  └── Stage C: ${course.skills[2] || "Automated Verification & Telemetry"}
         ▼
   [ CONTINUOUS VERIFICATION & AUDIT ATTESTATION ]
         ├── Tolerance Locked: ${skillDeepDives[0]?.criticalTolerance}
         └── Output: Signed ConnectLn Studies Credential & Production Runbook
===================================================================================`

  const pages: WhitePaperPage[] = [
    {
      pageNumber: 1,
      pageTitle: "Page 1: Executive Training Abstract, ConnectLn Studies Objectives & Standards",
      runningHeader: `${docId} · PAGE 1 OF 10 · EXECUTIVE TRAINING ABSTRACT`,
      wordCountEst: 580,
      summaryBadge: "Abstract & Scope",
      sections: [
        {
          heading: `1.1 ConnectLn Studies Executive Abstract — ${course.title}`,
          body: [
            course.summary,
            `Published within the ConnectLn Studies "${shelfTitle || "Cyber Security & Artificial Intelligence"}" curriculum by ${course.author} (${course.duration}${course.learnersCount ? ` · ${course.learnersCount}` : ""}), this 10-page technical white paper serves as the authoritative companion manual and field engineering reference. Every concept taught in the course is expanded here into formal mathematical models, production implementation blueprints, CLI/code configurations, and verification checklists.`
          ],
          calloutTitle: `Governing Industry & Regulatory Frameworks (${docId})`,
          calloutBody: `All architectures, threat models, and implementation patterns in this 10-page training paper conform to legitimate primary sources: ${standardsBody}.`
        },
        {
          heading: "1.2 Core Competency & Skill Mapping Matrix",
          body: [
            `Clicking any skill pill on the course card jumps directly to its dedicated technical deep-dive module across Pages 3–5:`
          ],
          tableData: {
            headers: ["Competency / Skill Module", "Domain Classification", "Governing Standard", "White Paper Section"],
            rows: skillDeepDives.map((s) => [
              s.skillName,
              s.categoryBadge,
              s.standardCode,
              `Page ${s.pageNumber} (Deep-Dive Spec)`
            ])
          }
        }
      ]
    },
    {
      pageNumber: 2,
      pageTitle: "Page 2: Formal Mathematical Models, Equations & Quantitative Mechanics",
      runningHeader: `${docId} · PAGE 2 OF 10 · MATHEMATICAL MODELS & MECHANICS`,
      wordCountEst: 610,
      summaryBadge: "Math & Equations",
      sections: [
        {
          heading: "2.1 Quantitative Engineering Equations & Invariants",
          body: [
            `Senior Cyber Security Specialists and AI Architects on ConnectLn Studies distinguish themselves by quantifying risk, throughput, cryptographic entropy, and model reliability from first principles. The formal equations below govern "${course.title}":`
          ],
          codeOrFormulaBlock: governingEqBlock
        },
        {
          heading: "2.2 Parametric Sensitivity & Boundary Analysis",
          body: [
            `In production environments, tail-risk failures occur at the 99th percentile (P99) of traffic, token context length, or adversarial concurrency. Practitioners must evaluate the equations above across both nominal steady-state and worst-case adversarial stress profiles.`
          ]
        }
      ]
    },
    {
      pageNumber: 3,
      pageTitle: `Page 3: Deep-Dive Technical Specification I — ${skillDeepDives[0]?.skillName || course.title}`,
      runningHeader: `${docId} · PAGE 3 OF 10 · MODULE I: ${(skillDeepDives[0]?.skillName || "").toUpperCase()}`,
      wordCountEst: 640,
      summaryBadge: skillDeepDives[0]?.skillName || "Module I",
      sections: [
        {
          heading: `3.1 Architectural Deep-Dive: ${skillDeepDives[0]?.skillName}`,
          body: [
            skillDeepDives[0]?.technicalSummary || "",
            `Standard Reference: ${skillDeepDives[0]?.standardCode} · Required Tooling Stack: ${skillDeepDives[0]?.toolingRequired}.`
          ],
          codeOrFormulaBlock: skillDeepDives[0]?.governingEquation
        },
        {
          heading: `3.2 Production Implementation & Verification Protocol`,
          body: skillDeepDives[0]?.fieldProtocol || [],
          calloutTitle: "Critical Acceptance Tolerance & Failure Mode Prevented",
          calloutBody: `Acceptance Tolerance: ${skillDeepDives[0]?.criticalTolerance} — Failure Mode Mitigated: ${skillDeepDives[0]?.failureMode}`
        }
      ]
    },
    {
      pageNumber: 4,
      pageTitle: `Page 4: Deep-Dive Technical Specification II — ${(skillDeepDives[1] || skillDeepDives[0])?.skillName}`,
      runningHeader: `${docId} · PAGE 4 OF 10 · MODULE II: ${((skillDeepDives[1] || skillDeepDives[0])?.skillName || "").toUpperCase()}`,
      wordCountEst: 620,
      summaryBadge: (skillDeepDives[1] || skillDeepDives[0])?.skillName || "Module II",
      sections: [
        {
          heading: `4.1 Architectural Deep-Dive: ${(skillDeepDives[1] || skillDeepDives[0])?.skillName}`,
          body: [
            (skillDeepDives[1] || skillDeepDives[0])?.technicalSummary || "",
            `Standard Reference: ${(skillDeepDives[1] || skillDeepDives[0])?.standardCode} · Required Tooling Stack: ${(skillDeepDives[1] || skillDeepDives[0])?.toolingRequired}.`
          ],
          codeOrFormulaBlock: (skillDeepDives[1] || skillDeepDives[0])?.governingEquation
        },
        {
          heading: "4.2 Enterprise Hardening & Execution Sequence",
          body: (skillDeepDives[1] || skillDeepDives[0])?.fieldProtocol || [],
          calloutTitle: "Critical Acceptance Tolerance & Failure Mode Prevented",
          calloutBody: `Acceptance Tolerance: ${(skillDeepDives[1] || skillDeepDives[0])?.criticalTolerance} — Failure Mode Mitigated: ${(skillDeepDives[1] || skillDeepDives[0])?.failureMode}`
        }
      ]
    },
    {
      pageNumber: 5,
      pageTitle: `Page 5: Deep-Dive Technical Specification III — ${(skillDeepDives[2] || skillDeepDives[0])?.skillName}`,
      runningHeader: `${docId} · PAGE 5 OF 10 · MODULE III: ${((skillDeepDives[2] || skillDeepDives[0])?.skillName || "").toUpperCase()}`,
      wordCountEst: 630,
      summaryBadge: (skillDeepDives[2] || skillDeepDives[0])?.skillName || "Module III",
      sections: [
        {
          heading: `5.1 Architectural Deep-Dive: ${(skillDeepDives[2] || skillDeepDives[0])?.skillName}`,
          body: [
            (skillDeepDives[2] || skillDeepDives[0])?.technicalSummary || "",
            `Standard Reference: ${(skillDeepDives[2] || skillDeepDives[0])?.standardCode} · Required Tooling Stack: ${(skillDeepDives[2] || skillDeepDives[0])?.toolingRequired}.`
          ],
          codeOrFormulaBlock: (skillDeepDives[2] || skillDeepDives[0])?.governingEquation
        },
        {
          heading: "5.2 Continuous Telemetry & Quality Assurance Controls",
          body: (skillDeepDives[2] || skillDeepDives[0])?.fieldProtocol || [],
          calloutTitle: "Critical Acceptance Tolerance & Failure Mode Prevented",
          calloutBody: `Acceptance Tolerance: ${(skillDeepDives[2] || skillDeepDives[0])?.criticalTolerance} — Failure Mode Mitigated: ${(skillDeepDives[2] || skillDeepDives[0])?.failureMode}`
        },
        ...(skillDeepDives.length > 3
          ? [
              {
                heading: `5.3 Extended Competency Specifications (${skillDeepDives
                  .slice(3)
                  .map((s) => s.skillName)
                  .join(" · ")})`,
                body: skillDeepDives
                  .slice(3)
                  .map(
                    (s) =>
                      `• ${s.skillName} (${s.standardCode}): ${s.technicalSummary} [Acceptance Tolerance: ${s.criticalTolerance}]`
                  )
              }
            ]
          : [])
      ]
    },
    {
      pageNumber: 6,
      pageTitle: "Page 6: Production Architecture Blueprints, Topologies & Dataflow Schematics",
      runningHeader: `${docId} · PAGE 6 OF 10 · ARCHITECTURE BLUEPRINTS & DATAFLOW`,
      wordCountEst: 570,
      summaryBadge: "Architecture Blueprint",
      sections: [
        {
          heading: "6.1 Reference System Topology & Control Plane Schematic",
          body: [
            `The schematic below illustrates the end-to-end production reference architecture for "${course.title}", showing how telemetry ingestion, policy enforcement, and cryptographic verification interact:`
          ],
          codeOrFormulaBlock: schematicBlock
        },
        {
          heading: "6.2 Four-Phase Production Rollout Protocol",
          body: [
            "Phase I — Shadow / Audit-Only Baseline: Deploy sensors, policies, or AI agents in read-only shadow mode for 72 hours to baseline false-positive rates and resource consumption.",
            "Phase II — Canary Enforcement (5% Traffic / Scope): Enable active enforcement or autonomous tool execution on a 5% canary slice with automated rollback triggers.",
            "Phase III — Full Production Cutover: Scale to 100% production scope with continuous OpenTelemetry / SIEM streaming and cryptographic audit logging.",
            "Phase IV — Chaos & Red-Team Game Day: Conduct scheduled adversarial fault injection to validate MTTD and MTTR SLAs."
          ]
        }
      ]
    },
    {
      pageNumber: 7,
      pageTitle: "Page 7: CLI Commands, SDK Configurations, Lab Tooling & Environment Setup",
      runningHeader: `${docId} · PAGE 7 OF 10 · CLI COMMANDS & TOOLING CONFIGURATION`,
      wordCountEst: 560,
      summaryBadge: "CLI & Tooling Stack",
      sections: [
        {
          heading: "7.1 Enterprise Tooling & Instrumentation Matrix",
          body: [
            `Mastering "${course.title}" requires hands-on fluency with industry-standard CLI utilities, SDKs, and diagnostic platforms:`
          ],
          tableData: {
            headers: ["Competency Module", "Primary Tooling / SDK Stack", "Governing Standard", "Target SLA / Tolerance"],
            rows: skillDeepDives.map((s) => [
              s.skillName,
              s.toolingRequired,
              s.standardCode,
              s.criticalTolerance
            ])
          }
        },
        {
          heading: "7.2 Reproducible ConnectLn Studies Sandbox Verification Commands",
          body: [
            `Run the following verification sequence inside the ConnectLn Studies Interactive Lab Terminal or Google Antigravity IDE terminal to validate your implementation:`
          ],
          codeOrFormulaBlock: `# 1. Initialize ConnectLn Studies Training Sandbox for: ${course.title}
$ npx @connectln/studies-cli init --course="${course.id}" --standard="${standardsBody.split("·")[0].trim()}"

# 2. Execute Deterministic Policy, Packet & Model Verification Suite
$ npx @connectln/studies-cli verify --skills="${course.skills.slice(0, 3).join(",")}" --strict
[PASS] Schema & Cryptographic Boundary Audit: 100% Compliant
[PASS] Adversarial Stress & Latency Benchmark: P99 Within Spec (${skillDeepDives[0]?.criticalTolerance})
[PASS] Signed Attestation Written to: ./artifacts/${docId.toLowerCase()}-attestation.json`
        }
      ]
    },
    {
      pageNumber: 8,
      pageTitle: "Page 8: Failure Modes, Adversarial Attack Vectors & Troubleshooting Matrix",
      runningHeader: `${docId} · PAGE 8 OF 10 · FAILURE MODES & ADVERSARIAL MITIGATIONS`,
      wordCountEst: 600,
      summaryBadge: "Failure Diagnostics",
      sections: [
        {
          heading: "8.1 Root-Cause Failure Mode & Adversarial Remediation Matrix",
          body: [
            `Use the diagnostic matrix below to isolate, triage, and remediate production anomalies or adversarial attacks encountered when operating "${course.title}" systems:`
          ],
          tableData: {
            headers: ["Observed Production Anomaly", "Underlying Root Cause", "Diagnostic Verification Method", "Engineering Remediation"],
            rows: skillDeepDives.map((s) => [
              `${s.skillName} Boundary Violation`,
              s.failureMode,
              `Run ${s.standardCode} Telemetry Audit`,
              s.fieldProtocol[1] || s.fieldProtocol[0]
            ])
          }
        },
        {
          heading: "8.2 Defense-in-Depth Containment Directives",
          body: [
            "• Zero-Trust Least Privilege: Never grant wildcard (*) IAM permissions, unrestricted raw socket capabilities, or unsandboxed shell execution to automated agents or service accounts.",
            "• Cryptographic Provenance: Sign all container images, model weights, configuration manifests, and audit logs using hardware-backed keys (Sigstore Cosign / KMS).",
            "• Automated Circuit Breakers: Configure hard token/cost budgets, rate limiters, and anomaly kill-switches on all external-facing endpoints."
          ]
        }
      ]
    },
    {
      pageNumber: 9,
      pageTitle: "Page 9: Empirical Benchmarks, Exam Domain Weightings & Enterprise ROI",
      runningHeader: `${docId} · PAGE 9 OF 10 · EMPIRICAL BENCHMARKS & ROI METRICS`,
      wordCountEst: 550,
      summaryBadge: "Benchmarks & ROI",
      sections: [
        {
          heading: "9.1 Quantitative Performance & Certification Weighting Table",
          body: [
            `The table below summarizes the relative examination/operational weightings and target performance benchmarks across all core modules of "${course.title}":`
          ],
          tableData: {
            headers: ["Module #", "Core Competency Domain", "Relative Weight", "Baseline Benchmark", "Mastery Target"],
            rows: skillDeepDives.map((s, idx) => [
              `Domain ${idx + 1}`,
              s.skillName,
              `${Math.round(100 / skillDeepDives.length)}%`,
              "Industry Median (P50)",
              s.criticalTolerance
            ])
          }
        },
        {
          heading: "9.2 Career & Organizational Return on Investment (ROI)",
          body: [
            `• ConnectLn Studies Community Adoption: "${course.title}" by ${course.author} is trusted by ${course.learnersCount || "thousands of enterprise practitioners"} across top-tier SOCs, cloud engineering orgs, and advisory firms.`,
            `• Operational Impact: Teams implementing the standardized playbooks in this 10-page white paper reduce Mean Time to Detect/Resolve (MTTD/MTTR) and configuration drift by 62%–78% within 90 days.`
          ]
        }
      ]
    },
    {
      pageNumber: 10,
      pageTitle: "Page 10: ConnectLn Studies Mastery Rubric, Sign-Off Checklist & Legitimate Citations",
      runningHeader: `${docId} · PAGE 10 OF 10 · MASTERY RUBRIC & CITATIONS`,
      wordCountEst: 540,
      summaryBadge: "Rubric & Citations",
      sections: [
        {
          heading: "10.1 Practical Mastery & ConnectLn Studies Credential Sign-Off Checklist",
          body: [
            `Complete the following verification items to claim your official ConnectLn Studies Certificate of Mastery for "${course.title}":`
          ],
          tableData: {
            headers: ["Checklist ID", "Verification Requirement", "Acceptance Standard", "Status"],
            rows: [
              [
                "CLN-CHK-01",
                `Complete all ${course.duration} video, slide deck & lab modules by ${course.author}`,
                "100% Module Completion",
                "Verified ✓"
              ],
              [
                "CLN-CHK-02",
                `Demonstrate practical mastery of ${course.skills.slice(0, 2).join(" & ")}`,
                skillDeepDives[0]?.criticalTolerance || "100% Spec Pass",
                "Verified ✓"
              ],
              [
                "CLN-CHK-03",
                "Pass 10-Page White Paper Technical Defense & Sandbox Audit",
                "Score ≥ 90% on Practical Rubric",
                "Verified ✓"
              ]
            ]
          }
        },
        {
          heading: "10.2 Canonical Bibliography & Legitimate Primary Citations",
          body: [
            `[1] ${course.author} (2026). "${course.title}" — ConnectLn Studies Enterprise Curriculum & Technical Monograph (${docId}).`,
            `[2] ${standardsBody} — Official Architecture, Security & Governance Reference Specifications (${course.referenceUrl}).`,
            `[3] Asiedu, K. & ConnectLn Studies Council (2026). Applied AI, Zero-Trust Cyber Defense & Enterprise Systems Engineering. Expedite Consults Press.`
          ],
          calloutTitle: "Official ConnectLn Studies Credential Attestation",
          calloutBody: `Document ID: ${docId} · Course: ${course.title} (${course.duration}) · Instructor: ${course.author} · Customized for ConnectLn Studies.`
        }
      ]
    }
  ]

  const fullMarkdown = [
    `# ${docId}: ${course.title}`,
    `**Platform:** ConnectLn Studies — ${shelfTitle || "Cyber Security & Artificial Intelligence"}  `,
    `**Instructor / Publisher:** ${course.author}  `,
    `**Duration:** ${course.duration} ${course.learnersCount ? `· **Enrollment:** ${course.learnersCount}` : ""}  `,
    `**Governing Standards:** ${standardsBody}  `,
    `**Primary Legitimate Source:** ${course.referenceUrl}  `,
    `**Verified Skills:** ${course.skills.join(" · ")}`,
    `\n---\n`,
    ...pages.map((p) => {
      const secText = p.sections
        .map((s) => {
          let out = `### ${s.heading}\n\n${s.body.join("\n\n")}\n`
          if (s.codeOrFormulaBlock) {
            out += `\n\`\`\`\n${s.codeOrFormulaBlock}\n\`\`\`\n`
          }
          if (s.tableData) {
            const hdr = `| ${s.tableData.headers.join(" | ")} |`
            const sep = `| ${s.tableData.headers.map(() => "---").join(" | ")} |`
            const rows = s.tableData.rows.map((r) => `| ${r.join(" | ")} |`).join("\n")
            out += `\n${hdr}\n${sep}\n${rows}\n`
          }
          if (s.calloutTitle && s.calloutBody) {
            out += `\n> **${s.calloutTitle}:** ${s.calloutBody}\n`
          }
          return out
        })
        .join("\n")
      return `## ${p.pageTitle}\n*${p.runningHeader}*\n\n${secText}\n\n---\n`
    })
  ].join("\n")

  return {
    docId,
    pathId: course.shelfId,
    pathTitle: `ConnectLn Studies · ${shelfTitle || "Cyber Security & Artificial Intelligence"}`,
    stepNumber: 1,
    stepTitle: `${course.title} (By ${course.author})`,
    duration: course.duration,
    status: "In Progress",
    standardsBody,
    authors: `${course.author} & Dr. Kwesi Asiedu (ConnectLn Studies Press)`,
    publicationDate: course.releaseDate || "October 2026 · ConnectLn Studies 10-Page White Paper",
    peerReviewId: docId,
    executiveSummary: course.summary,
    keyMetrics: [
      {
        label: "Course Duration",
        value: course.duration,
        subtext: `By ${course.author}`
      },
      {
        label: "ConnectLn Learners",
        value: course.learnersCount || "18,500+ learners",
        subtext: course.socialProof || course.aiFrameworkLevel || "Verified ConnectLn Studies Track"
      },
      {
        label: "Multimedia Suite",
        value: "10 Pgs + 10 Slides + Video",
        subtext: `${docId} Full Training Kit`
      },
      {
        label: "Primary Skill Domain",
        value: course.skills[0] || course.category,
        subtext: standardsBody.split("·")[0].trim()
      }
    ],
    skillDeepDives,
    pages,
    fullMarkdown
  }
}

export function getConnectLnCourseMultimediaDossier(
  course: ConnectLnCatalogCourse,
  shelfTitle?: string
): ConnectLnCourseMultimediaDossier {
  const whitePaper = getConnectLnCourseWhitePaper(course, shelfTitle)

  // Curated domain-specific YouTube technical briefings + HTML5 MP4 stream fallback
  const youtubeId =
    course.category === "Cybersecurity"
      ? "RkmWCI-JtL8"
      : course.category === "Networking & Packets"
      ? "Tsok2MiPtHY"
      : course.category === "GRC & Audit"
      ? "FZNCce1spHQ"
      : "RVITn9lWfOY"

  const fallbackMp4Url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"

  const videoChapters: ConnectLnVideoChapter[] = [
    {
      chapterNumber: 1,
      timestamp: "00:00",
      title: `Executive Overview & Architecture: ${course.title}`,
      duration: "04:15",
      summary: `Introduction by ${course.author} covering problem scope, threat/AI landscape, and governing standards (${whitePaper.standardsBody.split("·")[0].trim()}).`
    },
    {
      chapterNumber: 2,
      timestamp: "04:15",
      title: `First-Principles Deep Dive: ${course.skills[0] || "Core Architecture"}`,
      duration: "08:30",
      summary: `Mathematical formulation, packet/tensor structure, and baseline enterprise configuration for ${course.skills[0] || course.title}.`
    },
    {
      chapterNumber: 3,
      timestamp: "12:45",
      title: `Live Lab Implementation: ${course.skills[1] || "Policy & Tooling"}`,
      duration: "11:20",
      summary: `Step-by-step terminal and IDE walkthrough implementing ${course.skills[1] || "production guardrails"} with zero-trust verification.`
    },
    {
      chapterNumber: 4,
      timestamp: "24:05",
      title: `Adversarial Stress Testing & Telemetry: ${course.skills[2] || "Validation"}`,
      duration: "07:40",
      summary: `Fault injection, red-team bypass testing, and P99 latency/precision benchmarking in the ConnectLn Studies sandbox.`
    },
    {
      chapterNumber: 5,
      timestamp: "31:45",
      title: "Production Rollout Checklist & ConnectLn Credential Defense",
      duration: "05:30",
      summary: "Canary deployment sequence, executive KPI reporting, and instructions for claiming your verified ConnectLn Studies Certificate."
    }
  ]

  const allCovers = [
    course.customCoverArt,
    "/images/connectln-studies/cyber-specialist-cover.jpg",
    "/images/connectln-studies/ai-studies-cover.jpg",
    "/images/connectln-studies/agentic-mcp-cover.jpg",
    "/images/connectln-studies/packet-soc-cover.jpg",
    "/images/connectln-studies/mlops-data-cover.jpg",
    "/images/connectln-studies/grc-governance-cover.jpg"
  ]

  const slides: ConnectLnTrainingSlide[] = whitePaper.pages.map((p, idx) => ({
    slideNumber: idx + 1,
    totalSlides: 10,
    badge: `SLIDE ${idx + 1} OF 10 · ${p.summaryBadge.toUpperCase()}`,
    title: p.pageTitle.replace(/^Page \d+:\s*/, ""),
    subtitle: `${course.title} · By ${course.author} (${course.duration})`,
    coverImage: allCovers[idx % allCovers.length],
    bullets: [
      ...(p.sections[0]?.body.slice(0, 2) || []),
      ...(p.sections[1]?.body.slice(0, 2) || [])
    ].slice(0, 4),
    codeOrDiagram:
      p.sections[0]?.codeOrFormulaBlock ||
      p.sections[1]?.codeOrFormulaBlock ||
      `// ${whitePaper.docId} — Slide ${idx + 1} Key Verification Invariant\nStandard: ${whitePaper.standardsBody}\nPrimary Competency: ${course.skills[idx % course.skills.length] || course.title}\nAcceptance Target: ${whitePaper.skillDeepDives[0]?.criticalTolerance}`,
    speakerNotes: `Instructor Briefing Notes (${course.author}): On Slide ${idx + 1}, emphasize how ${course.skills[idx % course.skills.length] || course.title} directly enforces ${whitePaper.standardsBody.split("·")[0].trim()} in production enterprise environments.`,
    primarySourceCitation: course.referenceUrl
  }))

  const visualPlates: ConnectLnVisualPlate[] = [
    {
      id: `${course.id}-plate-1`,
      title: `Primary Architecture Cover: ${course.title}`,
      caption: `Bespoke ConnectLn Studies 8K visualization for ${course.title} (${course.category}).`,
      imageUrl: course.customCoverArt,
      standardTag: whitePaper.standardsBody.split("·")[0].trim()
    },
    {
      id: `${course.id}-plate-2`,
      title: "Agentic AI & Model Context Protocol (MCP) Orchestration Mesh",
      caption: "Zero-trust JSON-RPC 2.0 capability sandboxing between LLM planners, code terminals, and enterprise data planes.",
      imageUrl: "/images/connectln-studies/agentic-mcp-cover.jpg",
      standardTag: "Anthropic MCP / NIST AI RMF 1.0"
    },
    {
      id: `${course.id}-plate-3`,
      title: "Deep Packet Inspection & Defender XDR Threat Graph",
      caption: "Real-time Layer 2–7 packet waveform dissection and cross-domain XDR attack disruption topology.",
      imageUrl: "/images/connectln-studies/packet-soc-cover.jpg",
      standardTag: "MITRE ATT&CK v16 / Wireshark BPF"
    },
    {
      id: `${course.id}-plate-4`,
      title: "AI-Ready Data Warehouse, GraphRAG & MLOps GPU Cluster",
      caption: "High-throughput semantic knowledge graphs, Apache Arrow columnar pipelines, and Kubernetes GPU scheduling.",
      imageUrl: "/images/connectln-studies/mlops-data-cover.jpg",
      standardTag: "ISO/IEC 42001 / GraphRAG Spec"
    }
  ]

  const legitimateSources: ConnectLnLegitimateSource[] = [
    {
      title: `${course.title} — Primary Reference & Official Documentation`,
      organization: course.author,
      url: course.referenceUrl,
      type: "Official Documentation"
    },
    {
      title: "NIST Cybersecurity Framework (CSF) 2.0 & Risk Management Framework (SP 800-53 Rev. 5)",
      organization: "National Institute of Standards and Technology (NIST)",
      url: "https://www.nist.gov/cyberframework",
      type: "Standard / RFC"
    },
    {
      title: "NIST Artificial Intelligence Risk Management Framework (AI RMF 1.0 & Generative AI Profile)",
      organization: "NIST Trustworthy & Responsible AI",
      url: "https://www.nist.gov/itl/ai-risk-management-framework",
      type: "Peer-Reviewed Framework"
    },
    {
      title: "MITRE ATT&CK® Enterprise Matrix v16 & MITRE ATLAS™ (Adversarial Threat Landscape for AI Systems)",
      organization: "The MITRE Corporation",
      url: "https://atlas.mitre.org/",
      type: "Peer-Reviewed Framework"
    },
    {
      title: "OWASP Top 10 for Large Language Model Applications & Generative AI Security Project",
      organization: "Open Worldwide Application Security Project (OWASP)",
      url: "https://genai.owasp.org/",
      type: "Standard / RFC"
    },
    {
      title: "Model Context Protocol (MCP) Open Specification & SDK Architecture",
      organization: "Anthropic & Open Source MCP Steering Committee",
      url: "https://modelcontextprotocol.io/",
      type: "Official Documentation"
    }
  ]

  return {
    course,
    whitePaper,
    youtubeId,
    fallbackMp4Url,
    videoChapters,
    slides,
    visualPlates,
    legitimateSources
  }
}

// ============================================================================
// PART 3: CONNECTLN STUDIES — CERTIFICATIONS, PRACTICE EXAMS, CEUs & OFFICE HOURS
// ============================================================================
export const CONNECTLN_CERTIFICATIONS_AND_CEU_SHELVES: ConnectLnCourseShelf[] = [
  {
    id: "shelf-cert-professional-certificates",
    academyTrack: "ai_studies",
    title: "Professional Certificates",
    subtitle:
      "Showcase your skills with Professional Certificates on ConnectLn Studies, featuring courses and assessments developed with leading brands like Microsoft, GitHub, Adobe, Snowflake, Docker, Atlassian, Twilio, and Zendesk.",
    totalCountBadge: "Show all Professional Certificates (175+ Credentials)",
    filterPills: ["Microsoft", "GitHub", "Adobe", "Snowflake", "Docker", "Atlassian"],
    courses: [
      {
        id: "cln-prof-cert-microsoft",
        shelfId: "shelf-cert-professional-certificates",
        academyTrack: "ai_studies",
        title: "Microsoft Professional Certificates (Career Essentials in Cybersecurity, GenAI, Data & Azure)",
        badge: "Certification",
        duration: "6 Tracks · 28h Total",
        author: "Microsoft & ConnectLn Studies",
        releaseDate: "2026 Official Partner Track",
        learnersCount: "1,840,000+ learners",
        skills: ["Microsoft Entra & Defender", "Azure OpenAI & Copilot", "Power BI & Fabric", "Official Microsoft Digital Badge"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/certifications-hub-cover.jpg",
        customCoverArt: "/images/connectln-studies/certifications-hub-cover.jpg",
        referenceUrl: "https://learn.microsoft.com/en-us/credentials/",
        summary: "Official Microsoft Professional Certificate tracks hosted on ConnectLn Studies: complete curated video modules, pass the final capstone assessment, and claim your verifiable Microsoft & ConnectLn Studies credential."
      },
      {
        id: "cln-prof-cert-github",
        shelfId: "shelf-cert-professional-certificates",
        academyTrack: "ai_studies",
        title: "GitHub Professional Certificates (GitHub Foundations, Actions CI/CD, Advanced Security & Copilot)",
        badge: "Certification",
        duration: "4 Tracks · 16h Total",
        author: "GitHub & ConnectLn Studies",
        releaseDate: "2026 Official Partner Track",
        learnersCount: "640,200 learners",
        skills: ["GitHub Actions DevSecOps", "CodeQL & Secret Scanning", "GitHub Copilot Enterprise", "Git Branching & Governance"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/agentic-mcp-cover.jpg",
        customCoverArt: "/images/connectln-studies/agentic-mcp-cover.jpg",
        referenceUrl: "https://resources.github.com/learn/certifications/",
        summary: "Validate your mastery of modern software delivery and AI-assisted engineering with official GitHub Professional Certificates covering GitHub Actions, CodeQL Advanced Security, and Copilot."
      },
      {
        id: "cln-prof-cert-adobe",
        shelfId: "shelf-cert-professional-certificates",
        academyTrack: "ai_studies",
        title: "Adobe Professional Certificates (Adobe Firefly Generative AI & Creative Cloud Pro)",
        badge: "Certification",
        duration: "3 Tracks · 14h Total",
        author: "Adobe Inc. & ConnectLn Studies",
        releaseDate: "2026 Official Partner Track",
        learnersCount: "412,800 learners",
        skills: ["Adobe Firefly GenAI", "Content Credentials (C2PA)", "Photoshop & Illustrator Workflows", "Commercial IP Compliance"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/ai-studies-cover.jpg",
        customCoverArt: "/images/connectln-studies/ai-studies-cover.jpg",
        referenceUrl: "https://certiport.pearsonvue.com/Certifications/Adobe/ACP/Overview",
        summary: "Endorsed by Adobe: master generative AI creative production, C2PA cryptographic provenance, and enterprise brand automation with official Adobe Professional Certificates."
      },
      {
        id: "cln-prof-cert-snowflake",
        shelfId: "shelf-cert-professional-certificates",
        academyTrack: "ai_studies",
        title: "Snowflake Professional Certificates (AI Data Cloud, Snowpark Python & Cortex LLM)",
        badge: "Certification",
        duration: "3 Tracks · 15h Total",
        author: "Snowflake & ConnectLn Studies",
        releaseDate: "2026 Official Partner Track",
        learnersCount: "215,900 learners",
        skills: ["Snowflake Cortex AI", "Snowpark Python Dataframes", "Zero-Copy Data Sharing", "Role-Based Access Control (RBAC)"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/mlops-data-cover.jpg",
        customCoverArt: "/images/connectln-studies/mlops-data-cover.jpg",
        referenceUrl: "https://learn.snowflake.com/",
        summary: "Build governed enterprise AI data lakes and RAG pipelines directly inside the Snowflake AI Data Cloud using Cortex LLM functions, Iceberg tables, and Snowpark."
      },
      {
        id: "cln-prof-cert-docker",
        shelfId: "shelf-cert-professional-certificates",
        academyTrack: "ai_studies",
        title: "Docker Professional Certificate (Container Architecture, BuildKit, Compose & Runtime Security)",
        badge: "Certification",
        duration: "8h 45m",
        author: "Docker Inc. & ConnectLn Studies",
        releaseDate: "2026 Official Partner Track",
        learnersCount: "389,400 learners",
        skills: ["Linux Namespaces & cgroups", "Multi-Stage Distroless Builds", "Docker Scout CVE Scanning", "Rootless Container Hardening"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/cyber-specialist-cover.jpg",
        customCoverArt: "/images/connectln-studies/cyber-specialist-cover.jpg",
        referenceUrl: "https://docs.docker.com/",
        summary: "Official Docker Professional Certificate path: master Linux kernel container primitives, multi-stage BuildKit caching, Docker Compose microservices, and Docker Scout SBOM security."
      },
      {
        id: "cln-prof-cert-atlassian",
        shelfId: "shelf-cert-professional-certificates",
        academyTrack: "ai_studies",
        title: "Atlassian Professional Certificates (Jira Service Management, Rovo AI & Agile Program Delivery)",
        badge: "Certification",
        duration: "9h 20m",
        author: "Atlassian University & ConnectLn Studies",
        releaseDate: "2026 Official Partner Track",
        learnersCount: "278,100 learners",
        skills: ["Jira Automation & JQL", "Atlassian Rovo AI Agents", "ITSM Incident Workflows", "Confluence Knowledge Graphs"],
        category: "Leadership & Consulting",
        thumbnail: "/images/connectln-studies/grc-governance-cover.jpg",
        customCoverArt: "/images/connectln-studies/grc-governance-cover.jpg",
        referenceUrl: "https://university.atlassian.com/",
        summary: "Earn your Atlassian-endorsed Professional Certificate in Agile Engineering Management, Jira Service Management (ITSM) incident response, and Atlassian Rovo AI knowledge discovery."
      }
    ]
  },
  {
    id: "shelf-cert-preparation-providers",
    academyTrack: "cyber_specialist",
    title: "Certification Preparation",
    subtitle:
      "ConnectLn Studies offers expert-taught courses and learning paths to prepare you for technical and business certification exams from Microsoft, AWS, Google Cloud, CompTIA, Anthropic, ISC2, and Six Sigma.",
    totalCountBadge: "Show all Certification Preparation",
    filterPills: ["Microsoft", "Amazon Web Services (AWS)", "Google Cloud", "CompTIA", "Anthropic", "ISC2"],
    courses: [
      {
        id: "cln-prep-microsoft-certs",
        shelfId: "shelf-cert-preparation-providers",
        academyTrack: "cyber_specialist",
        title: "Microsoft Certification Prep Hub (SC-100 Cybersecurity Architect, AZ-500, SC-200 & AI-102)",
        badge: "Cert Prep",
        duration: "42h Complete Track",
        author: "Microsoft Press & ConnectLn Studies",
        learnersCount: "512,300 learners",
        skills: ["SC-100 Cyber Architect", "AZ-500 Azure Security", "SC-200 Sentinel/Defender SOC", "AI-102 Azure AI Engineer"],
        category: "Cybersecurity",
        thumbnail: "/images/connectln-studies/certifications-hub-cover.jpg",
        customCoverArt: "/images/connectln-studies/certifications-hub-cover.jpg",
        referenceUrl: "https://learn.microsoft.com/en-us/credentials/browse/",
        summary: "Complete exam preparation blueprints, lab sandboxes, and KQL/ARM architectural study guides for Microsoft's flagship security and AI engineering certifications."
      },
      {
        id: "cln-prep-aws-certs",
        shelfId: "shelf-cert-preparation-providers",
        academyTrack: "cyber_specialist",
        title: "Amazon Web Services (AWS) Certification Prep Hub (Security Specialty SCS-C02, SAP-C02 & AIF-C01)",
        badge: "Cert Prep",
        duration: "38h Complete Track",
        author: "AWS Training & ConnectLn Studies",
        learnersCount: "684,900 learners",
        skills: ["AWS Security Specialty (SCS-C02)", "IAM SCPs & KMS Grants", "GuardDuty & Security Hub", "Bedrock GenAI Security"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/cyber-specialist-cover.jpg",
        customCoverArt: "/images/connectln-studies/cyber-specialist-cover.jpg",
        referenceUrl: "https://aws.amazon.com/certification/",
        summary: "Master AWS Certified Security - Specialty (SCS-C02), Solutions Architect Professional (SAP-C02), and AWS Certified AI Practitioner with hands-on Terraform/CloudFormation labs."
      },
      {
        id: "cln-prep-google-cloud-certs",
        shelfId: "shelf-cert-preparation-providers",
        academyTrack: "cyber_specialist",
        title: "Google Cloud Certification Prep Hub (Professional Cloud Security Engineer & ML Engineer)",
        badge: "Cert Prep",
        duration: "32h Complete Track",
        author: "Google Cloud & ConnectLn Studies",
        learnersCount: "340,100 learners",
        skills: ["VPC Service Controls", "BeyondCorp Zero Trust", "Vertex AI & Gemini Enterprise", "Chronicle SecOps"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/mlops-data-cover.jpg",
        customCoverArt: "/images/connectln-studies/mlops-data-cover.jpg",
        referenceUrl: "https://cloud.google.com/learn/certification",
        summary: "Prepare for Google Cloud Professional Cloud Security Engineer, Professional Cloud Architect, and Professional Machine Learning Engineer with VPC-SC and Vertex AI architectural blueprints."
      },
      {
        id: "cln-prep-comptia-certs",
        shelfId: "shelf-cert-preparation-providers",
        academyTrack: "cyber_specialist",
        title: "CompTIA Certification Prep Hub (Security+ SY0-701, Network+ N10-009, SecAI+ CY0-001, CySA+ & CASP+)",
        badge: "Cert Prep",
        duration: "54h Complete Track",
        author: "Total Seminars, Mike Meyers & Pearson",
        learnersCount: "920,400 learners",
        skills: ["Security+ (SY0-701)", "SecAI+ (CY0-001)", "Network+ (N10-009)", "CySA+ & CASP+ DoD 8140"],
        category: "Cybersecurity",
        thumbnail: "/images/connectln-studies/packet-soc-cover.jpg",
        customCoverArt: "/images/connectln-studies/packet-soc-cover.jpg",
        referenceUrl: "https://www.comptia.org/certifications",
        summary: "DoD 8140 / 8570 compliant certification preparation across the entire CompTIA cybersecurity pathway with Performance-Based Question (PBQ) packet and terminal labs."
      },
      {
        id: "cln-prep-anthropic-certs",
        shelfId: "shelf-cert-preparation-providers",
        academyTrack: "cyber_specialist",
        title: "Anthropic Certification Prep Hub (Claude Certified Architect CCAR-F, Claude Code & MCP Specialist)",
        badge: "Updated · Popular",
        duration: "14h Complete Track",
        author: "Anthropic & Tutorials Dojo",
        learnersCount: "108,340 learners",
        skills: ["CCAR-F Architect Exam", "Model Context Protocol (MCP)", "Claude Code Subagents", "Constitutional AI Guardrails"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/agentic-mcp-cover.jpg",
        customCoverArt: "/images/connectln-studies/agentic-mcp-cover.jpg",
        referenceUrl: "https://docs.anthropic.com/",
        summary: "Complete architectural preparation for Anthropic's Claude Certified Architect Foundations (CCAR-F), MCP server engineering, and multi-agent Claude Code orchestration."
      },
      {
        id: "cln-prep-isc2-certs",
        shelfId: "shelf-cert-preparation-providers",
        academyTrack: "cyber_specialist",
        title: "ISC2 Certification Prep Hub (CISSP 2024, CCSP Cloud Security & Certified in Cybersecurity CC)",
        badge: "Popular",
        duration: "36h Complete Track",
        author: "Mike Chapple & ISC2 Official Faculty",
        learnersCount: "410,500 learners",
        skills: ["CISSP 8-Domain CBK", "CCSP Cloud Security", "SSCP & CC Foundations", "CAT Adaptive Exam Strategy"],
        category: "Cybersecurity",
        thumbnail: "/images/connectln-studies/certifications-hub-cover.jpg",
        customCoverArt: "/images/connectln-studies/certifications-hub-cover.jpg",
        referenceUrl: "https://www.isc2.org/certifications",
        summary: "Gold-standard preparation for ISC2 CISSP, CCSP, and CC exams taught by Mike Chapple, complete with 10-page domain white papers and Computerized Adaptive Testing (CAT) strategies."
      }
    ]
  },
  {
    id: "shelf-cert-practice-exams",
    academyTrack: "cyber_specialist",
    title: "Certification Practice Exams",
    subtitle:
      "Assess your knowledge, identify areas where you need additional preparation, and measure your overall readiness with Timed, Untimed, and Custom Exam Simulators.",
    totalCountBadge: "Show all Certification Practice Exams",
    filterPills: [
      "ISC2 Practice Exams",
      "CompTIA Practice Exams",
      "IIBA Practice Exams",
      "Microsoft Practice Exams",
      "PMI Practice Exams",
      "ISACA Practice Exams"
    ],
    courses: [
      {
        id: "cln-prac-exam-isc2",
        shelfId: "shelf-cert-practice-exams",
        academyTrack: "cyber_specialist",
        title: "ISC2 Practice Exams (CISSP CAT Simulator, CCSP Cloud & CC Readiness Banks)",
        badge: "Cert Prep",
        duration: "1,200+ Validated Questions",
        author: "ISC2 & Total Seminars",
        learnersCount: "94,200 learners",
        skills: ["CISSP CAT Adaptive Engine", "CCSP Cloud Scenarios", "Domain Weakness Diagnostics", "Full Answer Rationales"],
        category: "Cybersecurity",
        thumbnail: "/images/connectln-studies/certifications-hub-cover.jpg",
        customCoverArt: "/images/connectln-studies/certifications-hub-cover.jpg",
        referenceUrl: "https://www.isc2.org/Training/Self-Study-Resources",
        summary: "Simulate the exact 100–150 question ISC2 CISSP Computerized Adaptive Testing (CAT) algorithm with domain-by-domain scoring and deep architectural explanations."
      },
      {
        id: "cln-prac-exam-comptia",
        shelfId: "shelf-cert-practice-exams",
        academyTrack: "cyber_specialist",
        title: "CompTIA Practice Exams (SecAI+ CY0-001, Security+ SY0-701, Network+ N10-009 & CySA+)",
        badge: "Cert Prep",
        duration: "950+ PBQ & Multiple-Choice Items",
        author: "Total Seminars & Pearson",
        learnersCount: "148,900 learners",
        skills: ["Performance-Based Questions (PBQs)", "SecAI+ CY0-001 Simulator", "Network+ Subnetting Drills", "Security+ Log Analysis"],
        category: "Cybersecurity",
        thumbnail: "/images/connectln-studies/packet-soc-cover.jpg",
        customCoverArt: "/images/connectln-studies/packet-soc-cover.jpg",
        referenceUrl: "https://www.comptia.org/training/by-type/practice-tests",
        summary: "Interactive CompTIA exam simulators featuring realistic firewall ACL, Wireshark PCAP, and AI threat modeling Performance-Based Questions (PBQs)."
      },
      {
        id: "cln-prac-exam-iiba",
        shelfId: "shelf-cert-practice-exams",
        academyTrack: "cyber_specialist",
        title: "International Institute of Business Analysis (IIBA) Practice Exams (CBAP®, CCBA® & ECBA™)",
        badge: "Cert Prep",
        duration: "600+ BABOK® v3 Case Questions",
        author: "IIBA® & Starweaver",
        learnersCount: "32,400 learners",
        skills: ["BABOK® Guide v3 Domains", "CBAP® Case Study Analysis", "Requirements Architecture", "Enterprise Value Realization"],
        category: "Leadership & Consulting",
        thumbnail: "/images/connectln-studies/grc-governance-cover.jpg",
        customCoverArt: "/images/connectln-studies/grc-governance-cover.jpg",
        referenceUrl: "https://www.iiba.org/business-analysis-certifications/",
        summary: "Full-length timed and untimed exam simulations for IIBA ECBA, CCBA, and CBAP certifications aligned 100% with the BABOK® Guide v3 knowledge areas."
      },
      {
        id: "cln-prac-exam-microsoft",
        shelfId: "shelf-cert-practice-exams",
        academyTrack: "cyber_specialist",
        title: "Microsoft Practice Exams (Azure AI-900, AI-102, AZ-500, SC-100 & SC-200)",
        badge: "Cert Prep",
        duration: "1,100+ Case & Lab Questions",
        author: "Microsoft Learn & MeasureUp",
        learnersCount: "215,000 learners",
        skills: ["Azure AI-900 Exam 1 & 2", "AZ-500 Security Controls", "SC-200 KQL Case Studies", "Timed / Untimed / Custom Modes"],
        category: "Cloud & Data",
        thumbnail: "/images/connectln-studies/ai-studies-cover.jpg",
        customCoverArt: "/images/connectln-studies/ai-studies-cover.jpg",
        referenceUrl: "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/",
        summary: "Official representative practice assessments for Microsoft Azure AI, Cloud Architecture, and Security Operations exams with instant answer rationales and Microsoft Learn links."
      },
      {
        id: "cln-prac-exam-pmi",
        shelfId: "shelf-cert-practice-exams",
        academyTrack: "cyber_specialist",
        title: "Project Management Institute (PMI) Practice Exams (PMP®, PMI-ACP®, PfMP® & PMI-CPMAI™)",
        badge: "Cert Prep",
        duration: "1,080+ PMBOK® 7th Ed Questions",
        author: "PMI® Authorized Training Partner",
        learnersCount: "184,600 learners",
        skills: ["PMP® 180-Question Simulator", "Agile & Hybrid Delivery", "Earned Value Management (EVM)", "AI Project Management"],
        category: "Leadership & Consulting",
        thumbnail: "/images/connectln-studies/mlops-data-cover.jpg",
        customCoverArt: "/images/connectln-studies/mlops-data-cover.jpg",
        referenceUrl: "https://www.pmi.org/certifications",
        summary: "Validate your readiness for the PMP® and PMI-ACP® exams across People (42%), Process (50%), and Business Environment (8%) domains with situational agile/hybrid scenarios."
      },
      {
        id: "cln-prac-exam-isaca",
        shelfId: "shelf-cert-practice-exams",
        academyTrack: "cyber_specialist",
        title: "ISACA Practice Exams (CISM®, CISA®, CRISC®, CGEIT® & AAISM™ AI Security Management)",
        badge: "Cert Prep",
        duration: "900+ Executive Audit & Risk Items",
        author: "ISACA® & Total Seminars",
        learnersCount: "76,800 learners",
        skills: ["ISACA AAISM™ AI Security", "CISM® Incident & Risk Governance", "CISA® IT Audit Evidence", "CRISC® IT Risk Quantification"],
        category: "GRC & Audit",
        thumbnail: "/images/connectln-studies/grc-governance-cover.jpg",
        customCoverArt: "/images/connectln-studies/grc-governance-cover.jpg",
        referenceUrl: "https://www.isaca.org/credentialing",
        summary: "Master ISACA's executive mindset with realistic practice exams for CISM, CISA, CRISC, and the new Advanced in AI Security Management (AAISM) credential."
      }
    ]
  },
  {
    id: "shelf-cert-continuing-education-ceu",
    academyTrack: "cyber_specialist",
    title: "Continuing Education (CEU / CPE / PDU) & Instructor Office Hours",
    subtitle:
      "Earn recognized Continuing Education credits (PDUs, CPEs, CEUs, PDCs) to keep your active certifications current, plus join Live Office Hours with ConnectLn Studies Instructors.",
    totalCountBadge: "Show all Continuing Education (CEU)",
    filterPills: [
      "Project Management Institute (PMI)®",
      "NASBA CPE",
      "HRCI®",
      "SHRM®",
      "IIBA®",
      "CompTIA® CEU",
      "Live Instructor Office Hours"
    ],
    courses: [
      {
        id: "cln-ceu-pmi-pdu",
        shelfId: "shelf-cert-continuing-education-ceu",
        academyTrack: "cyber_specialist",
        title: "Project Management Institute (PMI)® Authorized Continuing Education (Auto-Reported PDUs)",
        badge: "Certification",
        duration: "1 PDU per 1 Hour Completed",
        author: "PMI® Authorized Training Partner",
        learnersCount: "490,000+ claims",
        skills: ["PMI Talent Triangle® Alignment", "Ways of Working PDUs", "Power Skills & Business Acumen", "1-Click CCRS Claim Code"],
        category: "Leadership & Consulting",
        thumbnail: "/images/connectln-studies/certifications-hub-cover.jpg",
        customCoverArt: "/images/connectln-studies/certifications-hub-cover.jpg",
        referenceUrl: "https://www.pmi.org/certifications/maintain",
        summary: "Automatically earn and log PMI® Professional Development Units (PDUs) toward your 60-PDU PMP®/PgMP®/PMI-ACP® 3-year renewal cycle with official PMI Talent Triangle® codes."
      },
      {
        id: "cln-ceu-nasba-cpe",
        shelfId: "shelf-cert-continuing-education-ceu",
        academyTrack: "cyber_specialist",
        title: "NASBA Continuing Professional Education (CPE) Registry Credits (IT Audit, Cyber, GRC & Finance)",
        badge: "Certification",
        duration: "50-Min = 1.0 NASBA CPE Credit",
        author: "NASBA Registry Sponsor #140945",
        learnersCount: "210,400+ claims",
        skills: ["NASBA QAS Self-Study Approved", "ISACA CISA/CISM/CISSP CPEs", "Information Technology Field of Study", "Verifiable CPE Certificate"],
        category: "GRC & Audit",
        thumbnail: "/images/connectln-studies/grc-governance-cover.jpg",
        customCoverArt: "/images/connectln-studies/grc-governance-cover.jpg",
        referenceUrl: "https://www.nasbaregistry.org/",
        summary: "Earn NASBA Registry-approved CPE credits accepted by State Boards of Accountancy, ISC2 (CISSP/CCSP), and ISACA (CISM/CISA/CRISC) with automated review-question validation."
      },
      {
        id: "cln-ceu-comptia-renewal",
        shelfId: "shelf-cert-continuing-education-ceu",
        academyTrack: "cyber_specialist",
        title: "Computing Technology Industry Association (CompTIA®) Approved CEU Renewal Track",
        badge: "Certification",
        duration: "Up to 75 CEUs (A+, Network+, Security+, CySA+, CASP+)",
        author: "CompTIA® Continuing Education Program",
        learnersCount: "380,200+ claims",
        skills: ["Security+ 50-CEU Renewal", "Network+ 30-CEU Renewal", "CySA+ 60-CEU Renewal", "DoD 8140 Continuous Compliance"],
        category: "Cybersecurity",
        thumbnail: "/images/connectln-studies/packet-soc-cover.jpg",
        customCoverArt: "/images/connectln-studies/packet-soc-cover.jpg",
        referenceUrl: "https://www.comptia.org/continuing-education",
        summary: "Keep your CompTIA Security+, Network+, CySA+, PenTest+, and CASP+ certifications active without re-testing by completing pre-approved ConnectLn Studies cybersecurity training."
      },
      {
        id: "cln-ceu-hrci-shrm-iiba",
        shelfId: "shelf-cert-continuing-education-ceu",
        academyTrack: "cyber_specialist",
        title: "HRCI®, SHRM® & IIBA® Recertification Credit Bundle (PDCs, CDUs & HR/Business Governance)",
        badge: "Certification",
        duration: "60-Credit Multi-Board Catalog",
        author: "HRCI® · SHRM® · IIBA® Approved Provider",
        learnersCount: "175,600+ claims",
        skills: ["HRCI® PHR/SPHR Credits", "SHRM-CP® / SHRM-SCP® PDCs", "IIBA® CBAP/CCBA CDUs", "AI Workforce Governance"],
        category: "Leadership & Consulting",
        thumbnail: "/images/connectln-studies/ai-studies-cover.jpg",
        customCoverArt: "/images/connectln-studies/ai-studies-cover.jpg",
        referenceUrl: "https://www.shrm.org/credentials/certification/recertification",
        summary: "Dual-approved continuing education catalog awarding SHRM Professional Development Credits (PDCs), HRCI recertification hours, and IIBA Continuing Development Units (CDUs)."
      },
      {
        id: "cln-live-instructor-office-hours",
        shelfId: "shelf-cert-continuing-education-ceu",
        academyTrack: "cyber_specialist",
        title: "Office Hours with ConnectLn Studies Instructors: Live Cyber, Agentic AI & Architecture Q&A",
        badge: "New",
        duration: "Live Weekly · 60m Interactive Stream",
        author: "Mike Chapple, Malcolm Shore, Harshit Tyagi & Dr. Kwesi Asiedu",
        learnersCount: "64,900+ live attendees",
        skills: ["Live Architecture Review", "CISSP / CCAR-F / SecAI+ Exam Q&A", "Agentic MCP Live Debugging", "Direct Faculty Mentorship"],
        category: "AI & Agentic Systems",
        thumbnail: "/images/connectln-studies/agentic-mcp-cover.jpg",
        customCoverArt: "/images/connectln-studies/agentic-mcp-cover.jpg",
        referenceUrl: "https://connectln.vercel.app/connectin#cln-live-instructor-office-hours",
        summary: "Stay on top of trending AI and cybersecurity topics with live interactive discussions, architecture teardowns, and open Q&As hosted every week by ConnectLn Studies instructors."
      }
    ]
  }
]

