// lib/global-copilot-engine.ts

export interface CopilotAction {
  label: string;
  tab?: "home" | "map" | "housing" | "campus" | "organizations" | "events" | "activities" | "messages" | "more";
  subView?: string;
  app?: "mail" | "calendar" | "teams" | "meetings" | "drive" | "contacts" | "ai";
  modal?: "wallet" | "weather" | "navigation" | "311" | "compose" | "sweep" | "viva" | "policy";
  href?: string;
  icon?: string;
}

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  timestamp: string;
  category?: "CAMPUS" | "COMMUNICATIONS" | "ENTERPRISE" | "VERITAS" | "GENERAL";
  actions?: CopilotAction[];
}

export const COPILOT_SUGGESTIONS = [
  {
    category: "🎓 Campus & Academics",
    prompts: [
      "Where is my CS 421 class and what's due tonight?",
      "How much Dining Dollars & Meal Swipes do I have left?",
      "When is the next Tiger Ride shuttle arriving at Cook Library?",
      "Show me available 2-bedroom off-campus housing near West Village.",
      "What are the top student organizations for Computer Science?",
    ],
  },
  {
    category: "✉️ Axiom Mail & Teams",
    prompts: [
      "Summarize my unread emails from Dr. Catherine Hayes.",
      "How do I start a live Teams video conference?",
      "Clean up my inbox: how does the Outlook Sweep rule work?",
      "What is our enterprise 7-Year cATO Zero-Trust email retention policy?",
      "Book 2 hours of focus time using Viva Insights.",
    ],
  },
  {
    category: "🏢 Enterprise & Portal",
    prompts: [
      "What is Expedite Consults' Change Request (CR) workflow?",
      "Explain FedRAMP High and Continuous Authorization (cATO) services.",
      "How does Expedite Consults help organizations migrate to Zero-Trust architecture?",
      "Tell me about Expedite Consults Incident Response and Cloud Security advisory.",
    ],
  },
  {
    category: "🔍 VeritasLens AI",
    prompts: [
      "How does VeritasLens detect media bias across 14 newsrooms?",
      "What is the VeritasLens automated claim verification pipeline?",
      "How can media organizations syndicate verified claim intelligence?",
    ],
  },
];

export function generateGlobalCopilotResponse(userQuery: string): {
  text: string;
  category: CopilotMessage["category"];
  actions?: CopilotAction[];
} {
  const query = (userQuery || "").toLowerCase();

  // ─────────────────────────────────────────────────────────────
  // 1. CAMPUS & ACADEMICS DOMAIN
  // ─────────────────────────────────────────────────────────────
  if (
    query.includes("cs 421") ||
    query.includes("cosc 421") ||
    query.includes("class") ||
    query.includes("lecture") ||
    query.includes("course") ||
    query.includes("professor") ||
    query.includes("dr. hayes") ||
    query.includes("dr hayes") ||
    query.includes("lab 3") ||
    query.includes("assignment") ||
    query.includes("due")
  ) {
    return {
      category: "CAMPUS",
      text: "### 📚 Academic Schedule & Canvas Deliverables\n\n- **Next Class**: **COSC 421 (Operating Systems & Architecture)** with **Dr. Catherine Hayes**\n- **Time & Location**: **10:00 AM – 11:15 AM** at **Science Complex Rm 304 (Cyber Defense Lab)**\n- **Pending Assignment**: **Lab 3: Virtual Memory & Page Replacement Pager** is due **Tonight at 11:59 PM (100 Points)**.\n- **Study Pod**: 4 peers from your cohort are active right now in Cook Library Pod B.",
      actions: [
        { label: "📍 View Science Complex on Map", tab: "map", icon: "MapPin" },
        { label: "📝 Open Canvas Study Pods", tab: "campus", icon: "BookOpen" },
        { label: "✉️ Email Dr. Hayes", tab: "messages", app: "mail", modal: "compose", icon: "Mail" },
      ],
    };
  }

  if (
    query.includes("dining") ||
    query.includes("meal") ||
    query.includes("swipe") ||
    query.includes("wallet") ||
    query.includes("onecard") ||
    query.includes("balance") ||
    query.includes("food") ||
    query.includes("eat") ||
    query.includes("newell")
  ) {
    return {
      category: "CAMPUS",
      text: "### 💳 Tiger OneCard Digital Wallet & Dining Status\n\n- **Meal Swipes Remaining**: **14 Swipes** (Resets Sunday at midnight)\n- **Dining Dollars**: **$428.50** (Accepted at all campus dining halls, Dunkin', and Starbucks)\n- **Retail Points**: **$185.00** (University Bookstore & concessions)\n- **Print Quota**: **$34.25** (Cook Library Printing Stations)\n- **Today's Dining Special**: **Maryland Crab Cakes & Tiger Crisp Salad** at **Newell Dining Hall** ($9.50 / 1 Meal Swipe).",
      actions: [
        { label: "💳 Open Digital OneCard Wallet", modal: "wallet", icon: "CreditCard" },
        { label: "📍 Find Newell Dining on Map", tab: "map", icon: "MapPin" },
      ],
    };
  }

  if (
    query.includes("shuttle") ||
    query.includes("bus") ||
    query.includes("tiger ride") ||
    query.includes("parking") ||
    query.includes("garage") ||
    query.includes("transport")
  ) {
    return {
      category: "CAMPUS",
      text: "### 🚌 Towson Tiger Ride & Campus Transit\n\n- **Tiger Ride Shuttle #14 (Gold Loop)**: Arriving in **4 minutes** at **Cook Library Stop** ➔ West Village.\n- **Tiger Ride Shuttle #08 (Black Route)**: Arriving in **9 minutes** at **Science Complex Plaza**.\n- **Parking Garages**:\n  - **Union Garage**: 78% Full (142 spots available)\n  - **West Village Garage**: 42% Full (380 spots available)\n  - **Towsontown Garage**: 91% Full (Limited)",
      actions: [
        { label: "🗺️ Open Live GPS Transit Map", tab: "map", icon: "Bus" },
        { label: "📍 Locate Nearest Parking Garage", tab: "map", icon: "MapPin" },
      ],
    };
  }

  if (
    query.includes("housing") ||
    query.includes("apartment") ||
    query.includes("roommate") ||
    query.includes("rent") ||
    query.includes("dorm") ||
    query.includes("sublease")
  ) {
    return {
      category: "CAMPUS",
      text: "### 🏠 Off-Campus Housing & Verified Roommate Matches\n\n- **3 New Housing Matches Found** within 1.0 mile of campus:\n  1. **West Village 2-Bed Sublease**: $925/mo • 0.3 mi away • Washer/Dryer, Pool & Fiber Internet included.\n  2. **The York Apartments (201 E Joppa)**: $840/mo • Shuttle stop right outside.\n  3. **Towson Townhomes 3-Bed**: $780/mo • Walk to Science Complex.\n- **Roommate Compatibility**: 94% match with Marcus Rivera (Senior CS major, Quiet hours 11 PM).",
      actions: [
        { label: "🏠 Explore Housing Listings", tab: "housing", icon: "Home" },
        { label: "👥 View Roommate Profiles", tab: "housing", icon: "Users" },
      ],
    };
  }

  if (
    query.includes("weather") ||
    query.includes("temperature") ||
    query.includes("rain") ||
    query.includes("noaa") ||
    query.includes("forecast") ||
    query.includes("sunny")
  ) {
    return {
      category: "CAMPUS",
      text: "### ☀️ Authoritative NOAA / NWS Campus Weather\n\n- **Current Conditions**: **82°F • Partly Sunny** at Towson Main Campus (Station KDMH).\n- **Humidity / Wind**: 44% Humidity • Wind 7 mph SW • UV Index: 6 (Moderate).\n- **Outdoor Safety**: Green status — Ideal for walking between Cook Library, Center for the Arts, and Science Complex.\n- **Dress Recommendation**: Light breathable apparel & sunglasses. Rain probability is low (<10%).",
      actions: [
        { label: "🌦️ Open Full NOAA Weather & Radar", modal: "weather", icon: "CloudSun" },
      ],
    };
  }

  if (
    query.includes("club") ||
    query.includes("organization") ||
    query.includes("sga") ||
    query.includes("event") ||
    query.includes("gala") ||
    query.includes("volunteer") ||
    query.includes("service")
  ) {
    return {
      category: "CAMPUS",
      text: "### 🎉 Campus Events, Organizations & Leadership\n\n- **Tonight's Highlight**: **Towson Cyber Summit & Cultural Gala** at **7:00 PM** in the **University Union Ballrooms** (Free catering + Campus XP).\n- **Key Clubs**: African Student Association (ASA), Towson Cybersecurity Club, Software Engineering Society, Robotics Lab.\n- **Civic Record**: You have logged **48 verified volunteer hours** toward your official Tiger Record Certificate.",
      actions: [
        { label: "🎉 RSVP to Campus Events", tab: "events", icon: "Calendar" },
        { label: "🤝 View Volunteer Opportunities", tab: "activities", icon: "Heart" },
        { label: "🏛️ Browse Student Organizations", tab: "organizations", icon: "Users" },
      ],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 2. AXIOM CONNECT MAIL & TEAMS DOMAIN
  // ─────────────────────────────────────────────────────────────
  if (
    query.includes("mail") ||
    query.includes("email") ||
    query.includes("inbox") ||
    query.includes("unread") ||
    query.includes("draft") ||
    query.includes("sweep") ||
    query.includes("clean") ||
    query.includes("retention") ||
    query.includes("cato") ||
    query.includes("policy")
  ) {
    return {
      category: "COMMUNICATIONS",
      text: "### ✉️ Axiom Connect Webmail & Security Operations\n\n- **Inbox Status**: You have **2 unread emails** (Dr. Hayes COSC 421 benchmark dataset & T. Rowe Price interview confirmation).\n- **Outlook Command Ribbon Capabilities**:\n  - **🧹 Sweep**: Automates inbox rules to keep only the newest email from frequent senders.\n  - **💬 Share to Teams**: Instantly cross-posts email conversations to persistent #general-announcements or #engineering-architecture.\n  - **🛡️ 7-Year cATO Vault Policy**: SHA-256 cryptographic compliance for zero-trust academic & research data.\n  - **⚡ Quick Steps**: 1-click forward to advisor, create Canvas task, or star & archive.",
      actions: [
        { label: "✉️ Open Axiom Mail & Teams", tab: "messages", icon: "Mail" },
        { label: "✍️ Compose New Email", tab: "messages", app: "mail", modal: "compose", icon: "Send" },
        { label: "🧹 Launch Inbox Sweep Rule", tab: "messages", app: "mail", modal: "sweep", icon: "Wind" },
      ],
    };
  }

  if (
    query.includes("teams") ||
    query.includes("meeting") ||
    query.includes("video") ||
    query.includes("conference") ||
    query.includes("call") ||
    query.includes("webrtc") ||
    query.includes("viva") ||
    query.includes("insights") ||
    query.includes("focus")
  ) {
    return {
      category: "COMMUNICATIONS",
      text: "### 🎥 Axiom Teams Video Conferencing & Workload Copilot\n\n- **Active Standup Room**: **COSC 421 Architecture & Senior Capstone Sync**\n  - Meeting ID: AXM-492-831 (1080p60 WebRTC encrypted SFU grid).\n  - Features: Live AI Meeting Summaries, automatic decision capture, speaker spotlighting, screen sharing, and chat.\n- **Viva Insights Copilot**: 3.5 hours of focus time logged today. Recommended: book 2 protected hours for Lab 3 coding.",
      actions: [
        { label: "🎥 Join Active Teams Meeting", tab: "messages", app: "meetings", icon: "Video" },
        { label: "✨ Open Viva Insights & Analytics", tab: "messages", app: "mail", modal: "viva", icon: "Sparkles" },
      ],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 3. EXPEDITE CONSULTS ENTERPRISE CONSULTING DOMAIN
  // ─────────────────────────────────────────────────────────────
  if (
    query.includes("expedite") ||
    query.includes("consult") ||
    query.includes("change request") ||
    query.includes(" cr ") ||
    query.includes("cr-") ||
    query.includes("fedramp") ||
    query.includes("zero trust") ||
    query.includes("zero-trust") ||
    query.includes("compliance") ||
    query.includes("advisory") ||
    query.includes("incident") ||
    query.includes("cybersecurity")
  ) {
    return {
      category: "ENTERPRISE",
      text: "### 🏢 Expedite Consults — Enterprise IT & Cyber Architecture\n\nExpedite Consults delivers tier-1 digital transformation, zero-trust cybersecurity, and compliance governance:\n\n1. **Change Request (CR) Governance Platform**: Multi-stage voting, automated rollback validation, and cryptographic audit logs (e.g. CR-892 Zero-Trust IAM Migration).\n2. **FedRAMP & cATO Fast-Track**: Continuous Authorization to Operate pipelines reducing ATO timelines from 18 months to weeks.\n3. **Zero-Trust Perimeters**: Identity-aware proxy, micro-segmentation, and automated DLP encryption across multicloud clusters.\n4. **Incident Response & SOC 2**: 24/7 autonomous threat detection and SOC remediation.",
      actions: [
        { label: "🏢 Open Expedite Consults Portal", href: "/portal", icon: "ExternalLink" },
        { label: "🛡️ View Services & Solutions", href: "/services", icon: "Shield" },
        { label: "📑 Check Change Request Dashboard", href: "/dashboard", icon: "Layers" },
      ],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 4. VERITASLENS AI FACT & MEDIA VERIFICATION DOMAIN
  // ─────────────────────────────────────────────────────────────
  if (
    query.includes("veritas") ||
    query.includes("veritaslens") ||
    query.includes("bias") ||
    query.includes("fact") ||
    query.includes("verification") ||
    query.includes("claim") ||
    query.includes("newsroom")
  ) {
    return {
      category: "VERITAS",
      text: "### 🔍 VeritasLens — Autonomous Media Verification Engine\n\n- **14 Newsroom Real-Time Clustering**: Monitors national, international, and independent broadcasts simultaneously.\n- **Multi-Vector Fact Verification**: Cross-examines statutory claims against government archives, academic journals, and primary documentation.\n- **Blindspot & Bias Detection**: Pinpoints ideological coverage gaps with quantifiable political spectrum distribution scores.\n- **Live Syndication API**: Enables publishers to verify breaking news in sub-500ms intervals.",
      actions: [
        { label: "🔍 Open VeritasLens Verification Suite", href: "/veritaslens", icon: "Sparkles" },
        { label: "📊 Run Automated Claim Sync", href: "/api/veritaslens/sync", icon: "RefreshCw" },
      ],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 5. COMPREHENSIVE MULTI-DOMAIN OVERVIEW
  // ─────────────────────────────────────────────────────────────
  return {
    category: "GENERAL",
    text: "### ⚡ Expedite Consults & TowsonSync Ecosystem Copilot\n\nI am your unified multi-domain intelligent copilot across all parts of the platform:\n\n- 🎓 **TowsonSync Campus Hub**: Classes, Canvas deadlines, Tiger OneCard balances ($428.50), off-campus housing ($925 West Village), Tiger Ride shuttles (4m ETA), and NOAA weather (82°F).\n- ✉️ **Axiom Connect Suite**: Outlook-style email with Sweep cleanup, WebRTC Teams video calls, Drive vaults, and cATO retention.\n- 🏢 **Expedite Consults Enterprise Portal**: Change Request (CR) approvals, Zero-Trust cybersecurity, and FedRAMP cATO modernization.\n- 🔍 **VeritasLens AI**: 14-newsroom live bias tracking and claim verification.\n\n*How can I help you today? Ask any question about your courses, emails, meetings, housing, or enterprise systems!*",
    actions: [
      { label: "🎓 Campus Command Center", tab: "home", icon: "Home" },
      { label: "✉️ Axiom Mail & Teams", tab: "messages", icon: "Mail" },
      { label: "🏢 Enterprise Portal", href: "/portal", icon: "Building" },
      { label: "🔍 VeritasLens AI", href: "/veritaslens", icon: "Sparkles" },
    ],
  };
}
