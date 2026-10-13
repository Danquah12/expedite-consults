import fs from "fs";

let content = fs.readFileSync("lib/ecosystemData.ts", "utf8");

// 1. Update ECOSYSTEM_PILLARS counts
content = content.replace(/id:\s*"all",[\s\S]*?count:\s*\d+,/m, `id: "all",
    title: "All Ecosystem Applications",
    shortName: "All Apps",
    tagline: "Unified index of all 65+ cloud platforms, specialized studios, microservices, and portals with global Vercel URLs",
    icon: "LayoutGrid",
    gradient: "from-blue-600 to-cyan-500",
    borderGlow: "rgba(59, 130, 246, 0.4)",
    count: 65,`);

content = content.replace(/id:\s*"cyber-defense",[\s\S]*?count:\s*\d+,/m, `id: "cyber-defense",
    title: "Autonomous Cyber Defense & AST Suite",
    shortName: "Cyber Defense & Strike",
    tagline: "Static & dynamic analysis, Expedite Strike, Ægis RMF, Ægis SOC, threat modeling, malware sandbox & attack paths",
    icon: "ShieldAlert",
    gradient: "from-cyan-500 to-blue-600",
    borderGlow: "rgba(6, 182, 212, 0.4)",
    count: 22,`);

content = content.replace(/id:\s*"enterprise-portals",[\s\S]*?count:\s*\d+,/m, `id: "enterprise-portals",
    title: "Core Enterprise Portals & Gateways",
    shortName: "Enterprise Portals",
    tagline: "Consulting advisory, client portals, DeskNote, TruePlace Real Estate, Housing Credit Intelligence, VeritasLens AI & governance",
    icon: "Building2",
    gradient: "from-indigo-600 to-violet-600",
    borderGlow: "rgba(99, 102, 241, 0.4)",
    count: 10,`);

content = content.replace(/id:\s*"sphera-ecosystem",[\s\S]*?count:\s*\d+,/m, `id: "sphera-ecosystem",
    title: "Sphera Social & Collaborative Studio",
    shortName: "Sphera Studio",
    tagline: "15 simulation worlds, VibeTok short video streaming, verified practitioner social graph & FastAPI backend",
    icon: "Layers",
    gradient: "from-purple-500 to-pink-500",
    borderGlow: "rgba(168, 85, 247, 0.4)",
    count: 7,`);

content = content.replace(/id:\s*"connectin-os",[\s\S]*?count:\s*\d+,/m, `id: "connectin-os",
    title: "ConnectIn Professional Super App",
    shortName: "ConnectIn OS",
    tagline: "30 roadmap pillars, verified reputation graph, standalone cloud, B2B procurement, defense labs & 2FA IAM",
    icon: "Workflow",
    gradient: "from-emerald-500 to-teal-600",
    borderGlow: "rgba(16, 185, 129, 0.4)",
    count: 5,`);

content = content.replace(/id:\s*"campus-ecosystem",[\s\S]*?count:\s*\d+,/m, `id: "campus-ecosystem",
    title: "Campus & Student Operating Platform",
    shortName: "CampusSync",
    tagline: "18-module campus ecosystem, Salisbury CampusSync, TigerOrbit 360 live radar, OneCard wallet & TUHousing",
    icon: "GraduationCap",
    gradient: "from-amber-500 to-orange-500",
    borderGlow: "rgba(245, 158, 11, 0.4)",
    count: 4,`);

content = content.replace(/id:\s*"talent-commerce",[\s\S]*?count:\s*\d+,/m, `id: "talent-commerce",
    title: "Talent, Commerce & Standalone Apps",
    shortName: "Talent & Commerce",
    tagline: "CareerOrbit AI talent matcher, VibeTok Learning Hub, BAZAAR marketplace & Axiom encrypted mail suite",
    icon: "Sparkles",
    gradient: "from-rose-500 to-pink-600",
    borderGlow: "rgba(244, 63, 94, 0.4)",
    count: 4,`);

content = content.replace(/id:\s*"social-impact",[\s\S]*?count:\s*\d+,/m, `id: "social-impact",
    title: "Global Social Impact & Initiatives",
    shortName: "Social Impact",
    tagline: "Accra-Helsinki circular economy initiative, CSRTA E-Waste sustainability survey, SkillHands & housing",
    icon: "Globe",
    gradient: "from-green-500 to-emerald-600",
    borderGlow: "rgba(34, 197, 94, 0.4)",
    count: 5,`);

// 2. Add App 1: platform-aegis-rmf (Cyber Defense)
const aegisRmfCode = `  {
    id: "platform-aegis-rmf",
    name: "Ægis RMF — Risk Management & Compliance Engine",
    codeName: "Ægis RMF",
    pillar: "cyber-defense",
    categoryLabel: "Automated NIST RMF 2.0 & Continuous Authorization",
    description: "Continuous automated Risk Management Framework (RMF) lifecycle orchestration: Categorize, Select, Implement, Assess, Authorize, and Monitor NIST SP 800-53 r5 controls with OSCAL data models and live vulnerability telemetry.",
    badge: "Vercel Live",
    status: "PROD_ACTIVE",
    vercelUrl: "https://aegis-rmf.vercel.app",
    mirrorVercelUrl: "https://aegis-rmf-1ovi.vercel.app",
    githubRepo: "Danquah12/aegis-rmf",
    githubUrl: "https://github.com/Danquah12/expedite-consults",
    techStack: ["Next.js", "NIST SP 800-37", "OSCAL", "Continuous Monitoring", "TailwindCSS"],
    features: ["Automated Control Assessment", "OSCAL Control Catalogs", "Continuous ATO Readiness", "Live Vulnerability Telemetry"],
    icon: "ShieldCheck",
    accentColor: "#10b981",
    stats: { label: "Controls Covered", value: "NIST 800-53 r5" },
  },
`;

content = content.replace(
  '// PILLAR 2: CORE ENTERPRISE PORTALS & GATEWAYS',
  `${aegisRmfCode}  // PILLAR 2: CORE ENTERPRISE PORTALS & GATEWAYS`
);

// 3. Add App 2: desk-note-workspace (Enterprise Portals)
const deskNoteCode = `  {
    id: "desk-note-workspace",
    name: "DeskNote Collaborative Research & Notetaking Canvas",
    codeName: "DeskNote",
    pillar: "enterprise-portals",
    categoryLabel: "Smart Markdown Knowledge Base & Whiteboard",
    description: "Zero-distraction digital desktop for research synthesis, rich markdown note-taking, infinite canvas sketching, and cross-team knowledge graph linking with offline-first local storage.",
    badge: "Vercel Live",
    status: "PROD_ACTIVE",
    vercelUrl: "https://desk-note-kwesi-asiedus-projects.vercel.app",
    mirrorVercelUrl: "https://desk-note-lwqq.vercel.app",
    githubRepo: "Danquah12/desk-note",
    githubUrl: "https://github.com/Danquah12/desk-note",
    techStack: ["Next.js", "Tiptap Markdown", "IndexedDB Offline", "Tailwind CSS"],
    features: ["Real-Time Markdown Editor", "Bi-directional Wiki Links", "Offline-First Storage", "Export PDF & LaTeX"],
    icon: "Layout",
    accentColor: "#6366f1",
    stats: { label: "Sync Engine", value: "Offline-First" },
  },
`;

content = content.replace(
  '// PILLAR 3: SPHERA SOCIAL & COLLABORATIVE STUDIO ECOSYSTEM',
  `${deskNoteCode}  // PILLAR 3: SPHERA SOCIAL & COLLABORATIVE STUDIO ECOSYSTEM`
);

// 4. Add App 3: vibe-tok-platform (Sphera Ecosystem)
const vibeTokCode = `  {
    id: "vibe-tok-platform",
    name: "VibeTok Social & Short-Form Video Stream",
    codeName: "VibeTok",
    pillar: "sphera-ecosystem",
    categoryLabel: "Short-Form Video & Audio Simulation",
    description: "High-throughput vertical video and live audio streaming social platform with real-time comments, sound syncing, creator virtual gifting, and discovery algorithms.",
    badge: "Vercel Live",
    status: "PROD_ACTIVE",
    vercelUrl: "https://vibe-tok-kwesi-asiedus-projects.vercel.app",
    mirrorVercelUrl: "https://vibe-tok-6ln6-kwesi-asiedus-projects.vercel.app",
    githubRepo: "Danquah12/vibe-tok",
    githubUrl: "https://github.com/Danquah12/vibe-tok",
    techStack: ["Next.js 16", "WebRTC / HLS", "Edge Media Delivery", "Framer Motion"],
    features: ["Vertical Short-Form Stream", "Live Stage Audio", "Creator Tips & Badges", "Dynamic Hashtags"],
    icon: "Smartphone",
    accentColor: "#ec4899",
    stats: { label: "Edge Delivery", value: "Ultra-Low Latency" },
  },
`;

content = content.replace(
  '// PILLAR 4: CONNECTIN PROFESSIONAL SUPER APP',
  `${vibeTokCode}  // PILLAR 4: CONNECTIN PROFESSIONAL SUPER APP`
);

// 5. Add App 4: connectln-standalone (ConnectIn OS)
const connectlnCode = `  {
    id: "connectln-standalone",
    name: "ConnectIn Standalone Professional Network",
    codeName: "ConnectIn Standalone",
    pillar: "connectin-os",
    categoryLabel: "Autonomous Standalone Professional Graph",
    description: "Independent high-availability production deployment of ConnectIn professional platform featuring talent discovery, job listings, marketplace bids, and corporate networking.",
    badge: "Vercel Live",
    status: "PROD_ACTIVE",
    vercelUrl: "https://connectln.vercel.app",
    githubRepo: "Danquah12/connectin",
    githubUrl: "https://github.com/Danquah12/expedite-consults",
    techStack: ["Next.js 16", "Tailwind 4", "Turbopack", "Lucide Icons"],
    features: ["Verified Member Graph", "Autonomous Marketplace", "Real-Time B2B Messaging", "Job Board Search"],
    icon: "Workflow",
    accentColor: "#0284c7",
    stats: { label: "Deployment", value: "Standalone Cloud" },
  },
`;

content = content.replace(
  '// PILLAR 5: CAMPUS & STUDENT OPERATING PLATFORM',
  `${connectlnCode}  // PILLAR 5: CAMPUS & STUDENT OPERATING PLATFORM`
);

// 6. Add App 5: campus-salisbury (Campus Ecosystem)
const salisburyCode = `  {
    id: "campus-salisbury",
    name: "Salisbury University CampusSync Portal",
    codeName: "Salisbury Campus",
    pillar: "campus-ecosystem",
    categoryLabel: "Campus & Student Operating Platform",
    description: "Official Salisbury University Sea Gull student operating portal with real-time course registration, campus shuttle tracking, dining hall menus, and campus security.",
    badge: "Vercel Live",
    status: "PROD_ACTIVE",
    vercelUrl: "https://20-salisbury-campus-kwesi-asiedus-projects.vercel.app",
    internalRoute: "/salisbury",
    githubRepo: "Danquah12/expedite-consults",
    githubUrl: "https://github.com/Danquah12/expedite-consults/tree/main/app/salisbury",
    techStack: ["Next.js 16", "CampusSync Graph", "Student Identity", "Real-Time Bus API"],
    features: ["Sea Gull Shuttle Live GPS", "OneCard Student Balance", "Dining Menus & Hours", "Collegiate Events RSVP"],
    icon: "GraduationCap",
    accentColor: "#dc2626",
    stats: { label: "Campus Network", value: "Salisbury Univ" },
  },
`;

content = content.replace(
  '// PILLAR 6: TALENT, COMMERCE & STANDALONE APPS',
  `${salisburyCode}  // PILLAR 6: TALENT, COMMERCE & STANDALONE APPS`
);

// 7. Add App 6: vibetok-learning-hub (Talent & Commerce)
const vibetokLearnCode = `  {
    id: "vibetok-learning-hub",
    name: "VibeTok Interactive Microlearning Hub",
    codeName: "VibeTok Learn",
    pillar: "talent-commerce",
    categoryLabel: "Bite-Sized Video Learning & Career Skills",
    description: "AI-curated short-form educational video stream teaching cloud security, software architecture, DevOps pipelines, and STEM concepts in 60-second interactive snippets.",
    badge: "Vercel Live",
    status: "PROD_ACTIVE",
    vercelUrl: "https://vibetok-learning-hub.vercel.app",
    githubRepo: "Danquah12/vibetok-learning-hub",
    githubUrl: "https://github.com/Danquah12/vibetok-learning-hub",
    techStack: ["Next.js", "HLS Video Streaming", "Interactive Quizzes", "AI Summarizer"],
    features: ["Vertical Video Feed", "Micro-Credentials", "Interactive Skill Challenges", "Creator Monetization"],
    icon: "Video",
    accentColor: "#f43f5e",
    stats: { label: "Learning Modules", value: "250+ Lessons" },
  },
`;

content = content.replace(
  '// PILLAR 7: GLOBAL SOCIAL IMPACT & SPECIALTY INITIATIVES',
  `${vibetokLearnCode}  // PILLAR 7: GLOBAL SOCIAL IMPACT & SPECIALTY INITIATIVES`
);

// 8. Add App 7: accra-helsinki-initiative (Social Impact)
const accraHelsinkiCode = `  {
    id: "accra-helsinki-initiative",
    name: "Accra-Helsinki Global Circular Economy & Climate Initiative",
    codeName: "Accra-Helsinki",
    pillar: "social-impact",
    categoryLabel: "Global Sustainability & Circular Tech Partnership",
    description: "International cross-border sustainability platform connecting Nordic clean-tech innovation with West African urban circular economy projects, e-waste tracking, and climate credits.",
    badge: "Vercel Live",
    status: "PROD_ACTIVE",
    vercelUrl: "https://accra-helsinki.org",
    mirrorVercelUrl: "https://accra-helsinki.vercel.app",
    customDomain: "https://accra-helsinki.org",
    githubRepo: "Danquah12/accra-helsinki",
    githubUrl: "https://github.com/Danquah12/accra-helsinki",
    techStack: ["Next.js", "GeoJSON Climate Tracking", "Carbon Accounting", "Multilingual"],
    features: ["Cross-Border Climate Action", "E-Waste Traceability Ledger", "Nordic Clean-Tech Pilots", "ESG Impact Reporting"],
    icon: "Globe",
    accentColor: "#10b981",
    stats: { label: "Global Reach", value: "Accra ⇄ Helsinki" },
  },
];
`;

content = content.replace(/\s*\];\s*$/, `\n${accraHelsinkiCode}`);

fs.writeFileSync("lib/ecosystemData.ts", content, "utf8");
console.log("Successfully updated lib/ecosystemData.ts with all missing Vercel apps!");
