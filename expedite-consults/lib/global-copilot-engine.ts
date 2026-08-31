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
      "What is the African Student Association (ASA)?",
      "Where is my CS 421 class and what's due tonight?",
      "Tell me about the Towson Cybersecurity Club.",
      "How much Dining Dollars & Meal Swipes do I have left?",
      "When is the next Tiger Ride shuttle arriving at Cook Library?",
      "Show me available 2-bedroom off-campus housing near West Village.",
    ],
  },
  {
    category: "✉️ Axiom Mail & Teams",
    prompts: [
      "Summarize my unread emails from Dr. Catherine Hayes.",
      "How do I schedule a meeting and start Teams video conference?",
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
  const query = (userQuery || "").toLowerCase().trim();

  // ─────────────────────────────────────────────────────────────
  // 1. SPECIFIC STUDENT ORGANIZATIONS & CLUBS
  // ─────────────────────────────────────────────────────────────

  // A. African Student Association (ASA)
  if (
    query.includes("african") ||
    query.includes("asa") ||
    query.includes("diallo") ||
    query.includes("cultural night") ||
    query.includes("cultural gala") ||
    query.includes("pan-african") ||
    query.includes("pan african")
  ) {
    return {
      category: "CAMPUS",
      text: "### 🌍 African Student Association (ASA) • Towson University\n\n- **Mission**: Celebrating African cultures, fostering student unity, professional mentorship, and academic excellence across Towson University.\n- **Executive Leadership**:\n  - **President**: **Amara Diallo** (Senior, Business)\n  - **Vice President**: **Kwesi Asiedu** (Senior, Computer Science)\n- **Active Membership**: **220 active student members**\n- **Headquarters / Office**: **University Union Room 212 (UN 212)**\n- **Key Initiatives & Events**:\n  1. **Annual Cultural Night & Gala**: Friday at 7:00 PM in the University Union Ballrooms (featuring authentic cuisine, traditional fashion showcase, and live performances).\n  2. **Pan-African Library Book Drive**: Collecting 500 STEM and foundational textbooks for youth outreach in Baltimore County.\n  3. **Bi-weekly General Body Meetings**: Thursdays at 6:30 PM in Union Room 302.",
      actions: [
        { label: "🏛️ View ASA in Organizations Tab", tab: "organizations", icon: "Users" },
        { label: "🎉 RSVP to Cultural Night Gala", tab: "events", icon: "Calendar" },
        { label: "📍 Locate Union Rm 212 on Map", tab: "map", icon: "MapPin" },
      ],
    };
  }

  // B. Towson Cybersecurity Club & CTF Prep
  if (
    query.includes("cyber") ||
    query.includes("cybersecurity") ||
    query.includes("maya chen") ||
    query.includes("ctf") ||
    query.includes("ccdc") ||
    query.includes("ethical hacking") ||
    query.includes("honeypot")
  ) {
    return {
      category: "CAMPUS",
      text: "### 🛡️ Towson Cybersecurity Club\n\n- **President**: **Maya Chen** (Senior, Computer Science)\n- **Treasurer**: **Kwesi Asiedu**\n- **Active Members**: **195 members**\n- **Meeting Lab**: **Science Complex Rm 304 (SC 304 - Autonomous Systems & Cyber Defense Lab)**\n- **Core Activities**: Collegiate Cyber Defense Competitions (CCDC), Capture The Flag (CTF) practices, containerized honeypot deployments, and industry penetration testing workshops.\n- **Next Session**: CTF Practice on Thursday at 6:00 PM in SC 304.",
      actions: [
        { label: "🏛️ Open Cybersecurity Club", tab: "organizations", icon: "Shield" },
        { label: "📍 View Science Complex 304 on Map", tab: "map", icon: "MapPin" },
      ],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 2. CAMPUS ACADEMICS, CANVAS & SCHEDULE
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
    query.includes("due") ||
    query.includes("grade") ||
    query.includes("gpa")
  ) {
    return {
      category: "CAMPUS",
      text: "### 📚 Academic Schedule & Canvas Deliverables\n\n- **Next Class**: **COSC 421 (Operating Systems & Architecture)** with **Dr. Catherine Hayes**\n- **Time & Location**: **10:00 AM – 11:15 AM** at **Science Complex Rm 304 (Cyber Defense Lab)**\n- **Pending Assignment**: **Lab 3: Virtual Memory & Page Replacement Pager** is due **Tonight at 11:59 PM (100 Points)**.\n- **Enrolled Courses**:\n  1. **COSC 421**: Operating Systems (Grade: A-)\n  2. **COSC 484**: Web-Based Architectures (Grade: A)\n  3. **COSC 450**: Network Defense & Cryptography (Grade: A)\n  4. **AIST 401**: Autonomous Systems & AI Lab (Grade: A)\n- **Study Pod**: 4 peers active right now in Cook Library Pod B.",
      actions: [
        { label: "📍 View Science Complex on Map", tab: "map", icon: "MapPin" },
        { label: "📝 Open Canvas Study Pods", tab: "campus", icon: "BookOpen" },
        { label: "✉️ Email Dr. Hayes", tab: "messages", app: "mail", modal: "compose", icon: "Mail" },
      ],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 3. TIGER ONECARD, DINING & WALLET
  // ─────────────────────────────────────────────────────────────
  if (
    query.includes("dining") ||
    query.includes("meal") ||
    query.includes("swipe") ||
    query.includes("wallet") ||
    query.includes("onecard") ||
    query.includes("balance") ||
    query.includes("food") ||
    query.includes("eat") ||
    query.includes("newell") ||
    query.includes("dunkin") ||
    query.includes("starbucks")
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

  // ─────────────────────────────────────────────────────────────
  // 4. TRANSIT, SHUTTLES, PARKING & GPS
  // ─────────────────────────────────────────────────────────────
  if (
    query.includes("shuttle") ||
    query.includes("bus") ||
    query.includes("tiger ride") ||
    query.includes("parking") ||
    query.includes("garage") ||
    query.includes("transit") ||
    query.includes("map") ||
    query.includes("directions") ||
    query.includes("navigation")
  ) {
    return {
      category: "CAMPUS",
      text: "### 🚌 Towson Tiger Ride & Campus Transit\n\n- **Tiger Ride Shuttle #14 (Gold Loop)**: Arriving in **4 minutes** at **Cook Library Stop** ➔ West Village.\n- **Tiger Ride Shuttle #08 (Black Route)**: Arriving in **9 minutes** at **Science Complex Plaza**.\n- **Parking Garages**:\n  - **Union Garage**: 78% Full (142 spots available)\n  - **West Village Garage**: 42% Full (380 spots available)\n  - **Towsontown Garage**: 91% Full (Limited)\n- **Turn-by-Turn GPS Guidance**: Bluetooth beacon routing active across all campus corridors.",
      actions: [
        { label: "🗺️ Open Live GPS Transit Map", tab: "map", icon: "Bus" },
        { label: "🧭 Turn-by-Turn Navigation", modal: "navigation", icon: "MapPin" },
      ],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 5. HOUSING & ROOMMATES
  // ─────────────────────────────────────────────────────────────
  if (
    query.includes("housing") ||
    query.includes("apartment") ||
    query.includes("roommate") ||
    query.includes("rent") ||
    query.includes("dorm") ||
    query.includes("sublease") ||
    query.includes("york")
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

  // ─────────────────────────────────────────────────────────────
  // 6. NOAA WEATHER & CAMPUS CONDITIONS
  // ─────────────────────────────────────────────────────────────
  if (
    query.includes("weather") ||
    query.includes("temperature") ||
    query.includes("rain") ||
    query.includes("noaa") ||
    query.includes("forecast") ||
    query.includes("sunny") ||
    query.includes("temp")
  ) {
    return {
      category: "CAMPUS",
      text: "### ☀️ Authoritative NOAA / NWS Campus Weather\n\n- **Current Conditions**: **82°F • Partly Sunny** at Towson Main Campus (Station KDMH).\n- **Humidity / Wind**: 44% Humidity • Wind 7 mph SW • UV Index: 6 (Moderate).\n- **Outdoor Safety**: Green status — Ideal for walking between Cook Library, Center for the Arts, and Science Complex.\n- **Dress Recommendation**: Light breathable apparel & sunglasses. Rain probability is low (<10%).",
      actions: [
        { label: "🌦️ Open Full NOAA Weather & Radar", modal: "weather", icon: "CloudSun" },
      ],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 7. CIVIC ENGAGEMENT, VOLUNTEERING & PASSPORT
  // ─────────────────────────────────────────────────────────────
  if (
    query.includes("volunteer") ||
    query.includes("service") ||
    query.includes("civic") ||
    query.includes("hours") ||
    query.includes("certificate") ||
    query.includes("tiger record") ||
    query.includes("passport")
  ) {
    return {
      category: "CAMPUS",
      text: "### 🤝 Civic Engagement, Volunteer Hours & Tiger Record\n\n- **Logged Volunteer Hours**: **48 verified hours** toward your official Tiger Record Certificate.\n- **Engagement Milestones**: 5 of 7 leadership milestones completed.\n- **Active Opportunities**:\n  1. **Campus Food Drive & Pantry Distribution**: +3.5 hours • Cook Library Plaza.\n  2. **Towson Green Campus Planting Initiative**: +4.0 hours • Glen Arboretum.",
      actions: [
        { label: "🤝 View Volunteer Opportunities", tab: "activities", icon: "Heart" },
        { label: "🏆 View Tiger Record & Passport", tab: "more", subView: "transcript", icon: "Award" },
      ],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 8. GENERAL CLUBS & ORGANIZATIONS
  // ─────────────────────────────────────────────────────────────
  if (
    query.includes("club") ||
    query.includes("organization") ||
    query.includes("org") ||
    query.includes("sga") ||
    query.includes("event") ||
    query.includes("gala")
  ) {
    return {
      category: "CAMPUS",
      text: "### 🎉 Campus Events, Student Organizations & Leadership\n\n- **Featured Organizations**:\n  1. **African Student Association (ASA)**: Cultural exchange, unity & youth mentorship (Union Rm 212).\n  2. **Towson Cybersecurity Club**: CCDC competitions & ethical hacking labs (Science Complex 304).\n  3. **Software Engineering Society**: Full-stack dev projects and hackathons.\n  4. **Student Government Association (SGA)**: Student advocacy and legislative funding.\n- **Upcoming Event**: **Towson Cyber Summit & Cultural Gala** at **7:00 PM** in the **University Union Ballrooms**.",
      actions: [
        { label: "🏛️ Browse Student Organizations", tab: "organizations", icon: "Users" },
        { label: "🎉 RSVP to Campus Events", tab: "events", icon: "Calendar" },
      ],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 9. AXIOM CONNECT MAIL & TEAMS DOMAIN
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
    query.includes("focus") ||
    query.includes("schedule")
  ) {
    return {
      category: "COMMUNICATIONS",
      text: "### 🎥 Axiom Teams Video Conferencing & Workload Copilot\n\n- **Active Standup Room**: **COSC 421 Architecture & Senior Capstone Sync**\n  - Meeting ID: AXM-492-831 (1080p60 WebRTC encrypted SFU grid).\n  - Features: Live AI Meeting Summaries, automatic decision capture, speaker spotlighting, screen sharing, and chat.\n- **Schedule Meeting Feature**: Click '+ Schedule Meeting' in the Calendar tab to auto-generate a 1080p Teams room with 'Join Teams' access.\n- **Viva Insights Copilot**: 3.5 hours of focus time logged today. Recommended: book 2 protected hours for Lab 3 coding.",
      actions: [
        { label: "🎥 Join Active Teams Meeting", tab: "messages", app: "meetings", icon: "Video" },
        { label: "📅 Schedule New Meeting", tab: "messages", app: "calendar", icon: "Calendar" },
        { label: "✨ Open Viva Insights & Analytics", tab: "messages", app: "mail", modal: "viva", icon: "Sparkles" },
      ],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 10. EXPEDITE CONSULTS ENTERPRISE CONSULTING DOMAIN
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
  // 11. VERITASLENS AI FACT & MEDIA VERIFICATION DOMAIN
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
  // 12. COMPREHENSIVE MULTI-DOMAIN OVERVIEW
  // ─────────────────────────────────────────────────────────────
  return {
    category: "GENERAL",
    text: "### ⚡ Expedite Consults & TowsonSync Ecosystem Copilot\n\nI am your unified multi-domain intelligent copilot across all parts of the platform:\n\n- 🎓 **TowsonSync Campus Hub**: Student clubs (African Student Association, Cybersecurity Club), classes, Canvas deadlines, Tiger OneCard balances ($428.50), off-campus housing ($925 West Village), Tiger Ride shuttles (4m ETA), and NOAA weather (82°F).\n- ✉️ **Axiom Connect Suite**: Outlook-style email with Sweep cleanup, WebRTC Teams video calls, Drive vaults, and cATO retention.\n- 🏢 **Expedite Consults Enterprise Portal**: Change Request (CR) approvals, Zero-Trust cybersecurity, and FedRAMP cATO modernization.\n- 🔍 **VeritasLens AI**: 14-newsroom live bias tracking and claim verification.\n\n*How can I help you today? Ask any question about student organizations, courses, emails, meetings, housing, or enterprise systems!*",
    actions: [
      { label: "🎓 Campus Command Center", tab: "home", icon: "Home" },
      { label: "🏛️ Student Organizations", tab: "organizations", icon: "Users" },
      { label: "✉️ Axiom Mail & Teams", tab: "messages", icon: "Mail" },
      { label: "🏢 Enterprise Portal", href: "/portal", icon: "Building" },
      { label: "🔍 VeritasLens AI", href: "/veritaslens", icon: "Sparkles" },
    ],
  };
}
