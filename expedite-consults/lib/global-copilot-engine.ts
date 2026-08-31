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
      "What facilities are inside Burdick Hall and Cook Library?",
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
      "What is CR-892 Zero-Trust IAM Migration?",
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

interface KnowledgeEntry {
  id: string;
  keywords: string[];
  category: CopilotMessage["category"];
  title: string;
  text: string;
  actions: CopilotAction[];
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // ── 1. STUDENT CLUBS & ORGANIZATIONS ─────────────────────────────
  {
    id: "org-asa",
    keywords: ["african", "asa", "african student association", "african students", "amara", "diallo", "cultural night", "cultural gala", "pan-african", "pan african", "book drive", "un 212", "union 212"],
    category: "CAMPUS",
    title: "African Student Association (ASA)",
    text: "### 🌍 African Student Association (ASA) • Towson University\n\n- **Mission**: Celebrating African cultures, fostering student unity, professional mentorship, and academic excellence across Towson University.\n- **Executive Leadership**:\n  - **President**: **Amara Diallo** (Senior, Business Administration)\n  - **Vice President**: **Kwesi Asiedu** (Senior, Computer Science)\n- **Active Membership**: **220 active student members**\n- **Headquarters / Office**: **University Union Room 212 (UN 212)**\n- **Signature Programs & Events**:\n  1. **Annual Cultural Night & Gala**: Friday at 7:00 PM in the University Union Ballrooms (featuring authentic cuisine, traditional fashion showcase, and live performances).\n  2. **Pan-African Library Book Drive**: Collecting 500 STEM and foundational textbooks for youth outreach in Baltimore County.\n  3. **Bi-weekly General Body Meetings**: Thursdays at 6:30 PM in Union Room 302.",
    actions: [
      { label: "🏛️ View ASA in Organizations Tab", tab: "organizations", icon: "Users" },
      { label: "🎉 RSVP to Cultural Night Gala", tab: "events", icon: "Calendar" },
      { label: "📍 Locate Union Rm 212 on Map", tab: "map", icon: "MapPin" },
    ],
  },
  {
    id: "org-cyber",
    keywords: ["cyber", "cybersecurity", "cybersecurity club", "security club", "maya chen", "ccdc", "ctf", "ethical hacking", "honeypot", "penetration testing", "sc 304", "cyber defense"],
    category: "CAMPUS",
    title: "Towson Cybersecurity Club",
    text: "### 🛡️ Towson Cybersecurity Club\n\n- **President**: **Maya Chen** (Senior, Computer Science)\n- **Treasurer**: **Kwesi Asiedu**\n- **Active Members**: **195 members**\n- **Headquarters & Lab**: **Science Complex Rm 304 (SC 304 - Autonomous Systems & Cyber Defense Lab)**\n- **Core Activities**: Collegiate Cyber Defense Competitions (CCDC), Capture The Flag (CTF) practices, containerized honeypot deployments, and industry penetration testing workshops.\n- **Next Practice**: CTF Practice on Thursday at 6:00 PM in SC 304.",
    actions: [
      { label: "🏛️ Open Cybersecurity Club", tab: "organizations", icon: "Shield" },
      { label: "📍 View Science Complex 304 on Map", tab: "map", icon: "MapPin" },
    ],
  },
  {
    id: "org-ses",
    keywords: ["software engineering", "software engineering society", "ses", "hackathon", "full stack", "coding club", "developer", "programming club", "dev club"],
    category: "CAMPUS",
    title: "Software Engineering Society (SES)",
    text: "### 💻 Software Engineering Society (SES)\n\n- **Focus**: Full-stack application engineering, open-source development, resume reviews, and hackathon team formation.\n- **Members**: **160 members**\n- **Meeting Space**: 7800 York Road, Room 204\n- **Upcoming Event**: Towson 48-Hour Fall Hackathon with tracks in AI, Cloud Architecture, and HealthTech.",
    actions: [
      { label: "🏛️ Browse Student Organizations", tab: "organizations", icon: "Users" },
      { label: "📍 View 7800 York Road on Map", tab: "map", icon: "MapPin" },
    ],
  },
  {
    id: "org-sga",
    keywords: ["sga", "student government", "senate", "advocacy", "funding", "saf", "allocations", "representation"],
    category: "CAMPUS",
    title: "Student Government Association (SGA)",
    text: "### 🏛️ Student Government Association (SGA)\n\n- **Mission**: Representing 20,000+ Towson University students, allocating student activity funding (SAF), and advocating for academic and campus improvements.\n- **Headquarters**: University Union, Suite 230\n- **Senate Meetings**: Tuesdays at 5:00 PM in Union Ballroom B.",
    actions: [
      { label: "🏛️ Browse Student Organizations", tab: "organizations", icon: "Users" },
      { label: "📍 Locate University Union on Map", tab: "map", icon: "MapPin" },
    ],
  },

  // ── 2. ACADEMICS, COURSES & CANVAS ───────────────────────────────
  {
    id: "course-cosc421",
    keywords: ["cosc 421", "cs 421", "operating systems", "os class", "catherine hayes", "dr. hayes", "dr hayes", "lab 3", "virtual memory", "pager", "paging", "assignment due"],
    category: "CAMPUS",
    title: "COSC 421: Operating Systems & Architecture",
    text: "### 📚 COSC 421: Operating Systems & Architecture\n\n- **Instructor**: **Dr. Catherine Hayes** (catherine.hayes@towson.edu)\n- **Schedule**: **Mondays & Wednesdays • 10:00 AM – 11:15 AM**\n- **Location**: **Science Complex Rm 304 (Cyber Defense Lab)**\n- **Deliverable Due Tonight**: **Lab 3: Virtual Memory & Page Replacement Pager** (100 Points, Due 11:59 PM EDT).\n- **Study Pod**: 4 classmates active now in Cook Library Pod B (Grade average: 92.4%).",
    actions: [
      { label: "📍 View Science Complex 304 on Map", tab: "map", icon: "MapPin" },
      { label: "📝 Open Canvas Study Pods", tab: "campus", icon: "BookOpen" },
      { label: "✉️ Email Dr. Hayes", tab: "messages", app: "mail", modal: "compose", icon: "Mail" },
    ],
  },
  {
    id: "course-cosc484",
    keywords: ["cosc 484", "cs 484", "web development", "web architecture", "react", "next.js", "nextjs", "cloud computing"],
    category: "CAMPUS",
    title: "COSC 484: Web-Based Architectures",
    text: "### 🌐 COSC 484: Web-Based Architectures\n\n- **Focus**: Distributed client-server systems, modern React/Next.js frameworks, REST & GraphQL APIs, and cloud containerization.\n- **Schedule**: Tuesdays & Thursdays • 2:00 PM – 3:15 PM in 7800 York Road Rm 112.\n- **Current Grade**: A (95.8%).",
    actions: [
      { label: "📝 View Enrolled Courses", tab: "campus", icon: "BookOpen" },
      { label: "📍 View 7800 York on Map", tab: "map", icon: "MapPin" },
    ],
  },
  {
    id: "course-general",
    keywords: ["course", "courses", "class", "classes", "transcript", "schedule", "grades", "gpa", "major", "enrolled", "credits"],
    category: "CAMPUS",
    title: "Student Academic Record & Course Load",
    text: "### 🧑‍🎓 Student Academic Record (Kwesi Asiedu)\n\n- **Major**: B.S. Computer Science • Class of 2026 (Senior Standing)\n- **Student ID**: `0982341` (Digital Towson OneCard Active)\n- **Cumulative GPA**: **3.88 / 4.00** (Dean's List Honors)\n- **Active Enrolled Courses** (15 Credits):\n  1. **COSC 421**: Operating Systems & Architecture (3.0 cr • Dr. Hayes)\n  2. **COSC 484**: Web-Based Architectures (3.0 cr • Prof. Miller)\n  3. **COSC 450**: Network Defense & Cryptography (3.0 cr • Dr. Acharya)\n  4. **AIST 401**: Autonomous Systems & AI Lab (3.0 cr • Dr. Thorne)\n  5. **ENGL 310**: Technical Writing for Engineers (3.0 cr)",
    actions: [
      { label: "📚 View Academic Hub", tab: "campus", icon: "BookOpen" },
      { label: "🏆 View Tiger Record & Passport", tab: "more", subView: "transcript", icon: "Award" },
    ],
  },

  // ── 3. CAMPUS BUILDINGS & FACILITIES ─────────────────────────────
  {
    id: "bld-science",
    keywords: ["science complex", "sc 304", "sc 210", "sc 415", "science building", "chemistry", "physics", "biology lab", "cyber lab", "planetarium"],
    category: "CAMPUS",
    title: "Towson Science Complex",
    text: "### 🔬 Towson Science Complex\n\n- **Overview**: 320,000 sq. ft. state-of-the-art facility opened in 2021. Home to CIS Cyber Labs, Physics Planetarium, Molecular Biology suites, and rooftop observatory.\n- **Key Rooms**:\n  - **SC 304**: Autonomous Systems & Cyber Defense Lab (Cybersecurity Club / COSC 421)\n  - **SC 210**: 180-seat Science Lecture Amphitheater\n  - **SC 415**: Bioinformatics & High-Performance Computing Cluster\n- **Amenities**: Café, quiet study lounges with panoramic campus views, and outdoor plaza.",
    actions: [
      { label: "📍 View Science Complex on Map", tab: "map", icon: "MapPin" },
      { label: "🧭 Turn-by-Turn GPS Directions", modal: "navigation", icon: "Navigation" },
    ],
  },
  {
    id: "bld-union",
    keywords: ["university union", "union", "ballroom", "ballrooms", "food court", "student activities", "asa office", "union 212", "susquehanna", "student center"],
    category: "CAMPUS",
    title: "University Union",
    text: "### 🏛️ University Union (Student Command Center)\n\n- **Overview**: 300,000 sq. ft. campus hub for student life, cultural programming, dining, and administration.\n- **Key Locations**:\n  - **Ballrooms (3rd Floor)**: Host of tonight's Cyber Summit & Cultural Gala (7:00 PM)\n  - **UN 212**: African Student Association (ASA) Headquarters\n  - **UN 230**: Student Government Association (SGA) Suites\n  - **Ground Floor**: Susquehanna Food Court, Dunkin', University Bookstore, and OneCard Services.",
    actions: [
      { label: "📍 View University Union on Map", tab: "map", icon: "MapPin" },
      { label: "🎉 View Events in Union", tab: "events", icon: "Calendar" },
    ],
  },
  {
    id: "bld-library",
    keywords: ["cook library", "albert s cook", "library", "study rooms", "printing", "pods", "24/7 study", "quiet floor", "research desk"],
    category: "CAMPUS",
    title: "Albert S. Cook Library",
    text: "### 📚 Albert S. Cook Library\n\n- **Hours**: 24/7 Access on Floors 1 & 2 for Towson students with OneCard.\n- **Key Zones**:\n  - **Floor 2**: Collaborative Study Pods (Cook Pod B active now), Print Quota Stations ($34.25 available), Tech Help Desk\n  - **Floor 3**: High-Density Stacks & Quiet Zone\n  - **Floor 4**: Silent Individual Study Carrels & University Archives\n- **Transit Stop**: Cook Library Stop (Tiger Ride Shuttle #14 arriving in 4 minutes).",
    actions: [
      { label: "📍 View Cook Library on Map", tab: "map", icon: "MapPin" },
      { label: "🚌 Check Shuttle ETA to Library", tab: "map", icon: "Bus" },
    ],
  },
  {
    id: "bld-burdick",
    keywords: ["burdick", "burdick hall", "gym", "fitness", "pool", "climbing wall", "rec", "recreation", "basketball", "workout"],
    category: "CAMPUS",
    title: "Burdick Hall Campus Recreation",
    text: "### 🏋️ Burdick Hall (Campus Recreation & Wellness)\n\n- **Facilities**: 33-foot indoor rock climbing pinnacle, Olympic-sized swimming pool, 5 hardwood basketball courts, American Ninja Warrior fitness course, and sprint track.\n- **Hours**: 6:00 AM – 11:00 PM Daily (Swipe OneCard for entry).\n- **Density Status**: 48% capacity (Moderate crowd, plenty of cardio and free weights open).",
    actions: [
      { label: "📍 View Burdick Hall on Map", tab: "map", icon: "MapPin" },
    ],
  },
  {
    id: "bld-arts",
    keywords: ["center for the arts", "arts center", "cfa", "music", "theater", "theatre", "dance", "concert hall", "gallery", "art"],
    category: "CAMPUS",
    title: "Center for the Arts (CFA)",
    text: "### 🎨 Center for the Arts\n\n- **Facilities**: 500-seat Harold J. Kaplan Concert Hall, Mainstage Theatre, Dance Studios, and Holtzman Art Gallery.\n- **Upcoming Events**: Fall Symphony Showcase and Towson Student Film Showcase.",
    actions: [
      { label: "📍 View Center for the Arts on Map", tab: "map", icon: "MapPin" },
      { label: "🎉 Browse Campus Arts Events", tab: "events", icon: "Calendar" },
    ],
  },

  // ── 4. TIGER ONECARD & CAMPUS DINING ────────────────────────────
  {
    id: "wallet-dining",
    keywords: ["dining", "food", "meal", "swipes", "onecard", "wallet", "balance", "dollars", "newell", "west village dining", "dunkin", "starbucks", "points", "print quota"],
    category: "CAMPUS",
    title: "Tiger OneCard Digital Wallet & Dining Status",
    text: "### 💳 Tiger OneCard Digital Wallet & Dining Status\n\n- **Meal Swipes Remaining**: **14 Swipes** (Resets Sunday at midnight)\n- **Dining Dollars Balance**: **$428.50** (Tax-free at all on-campus dining halls, food courts, and cafes)\n- **Retail Points**: **$185.00** (Accepted at Bookstore, vending machines, and select off-campus partners)\n- **Print Quota**: **$34.25** (Black/White: $0.05/page, Color: $0.15/page)\n- **Today's Dining Specials**:\n  - **Newell Dining Hall**: Maryland Crab Cakes & Tiger Crisp Salad ($9.50 / 1 Meal Swipe)\n  - **West Village Dining**: Hand-Tossed Artisanal Flatbreads & Mediterranean Bowl\n  - **Susquehanna (Union)**: Panda Express, Chick-fil-A, Dunkin', and Bento Sushi.",
    actions: [
      { label: "💳 Open Digital OneCard Wallet", modal: "wallet", icon: "CreditCard" },
      { label: "📍 Find Newell Dining on Map", tab: "map", icon: "MapPin" },
    ],
  },

  // ── 5. TRANSIT, SHUTTLES & PARKING ──────────────────────────────
  {
    id: "transit-shuttles",
    keywords: ["shuttle", "shuttles", "tiger ride", "bus", "parking", "garage", "garages", "union garage", "west village garage", "towsontown", "gps", "transit", "eta"],
    category: "CAMPUS",
    title: "Tiger Ride Transit & Parking Garages",
    text: "### 🚌 Tiger Ride Transit & Campus Parking Garages\n\n- **Live Shuttle ETAs**:\n  - **Tiger Ride Gold Loop (#14)**: **4 mins away** • Cook Library Stop ➔ West Village Commons\n  - **Tiger Ride Black Route (#08)**: **9 mins away** • Science Complex Plaza ➔ 7800 York Road\n  - **Tiger Ride Express (#02)**: **14 mins away** • Union ➔ Towson Town Center Mall\n- **Live Parking Garage Occupancy**:\n  - **Union Garage**: 78% Full (142 vacant spots)\n  - **West Village Garage**: 42% Full (380 vacant spots)\n  - **Towsontown Garage**: 91% Full (Limited parking - South tier recommended)\n- **Tiger GPS Live Tracking**: Real-time GPS beacon positioning active on campus map.",
    actions: [
      { label: "🗺️ Open Live GPS Transit Map", tab: "map", icon: "Bus" },
      { label: "🧭 Turn-by-Turn GPS Navigation", modal: "navigation", icon: "Navigation" },
    ],
  },

  // ── 6. CAMPUS SAFETY & BEACONS ──────────────────────────────────
  {
    id: "campus-safety",
    keywords: ["safety", "security", "emergency", "beacon", "beacons", "blue light", "safewalk", "police", "tupd", "escort", "911", "danger", "safe"],
    category: "CAMPUS",
    title: "Towson Campus Safety & Emergency Response",
    text: "### 🛡️ Campus Safety & Emergency Services\n\n- **TUPD Emergency Dispatch**: **(410) 704-4444** (Available 24/7/365)\n- **Non-Emergency Line**: (410) 704-2134\n- **Emergency Blue Light Beacons**: 42 illuminated safety stations located across campus pathways with 1-button direct 911 dispatch.\n- **SafeWalk Escort Service**: Free student safety escorts between any campus building, dorm, or parking garage 24/7.",
    actions: [
      { label: "📍 View Safety Beacons on Map", tab: "map", icon: "Shield" },
      { label: "📞 Request SafeWalk Escort", tab: "more", subView: "safety", icon: "PhoneCall" },
    ],
  },

  // ── 7. HOUSING & OFF-CAMPUS APARTMENTS ──────────────────────────
  {
    id: "housing-roommates",
    keywords: ["housing", "apartment", "apartments", "dorm", "dorms", "roommate", "roommates", "rent", "sublease", "lease", "west village housing", "the york", "towson townhomes"],
    category: "CAMPUS",
    title: "Off-Campus Housing & Roommate Matching",
    text: "### 🏠 Off-Campus Housing & Verified Roommate Matches\n\n- **Featured Listings (Within 1.0 Mile)**:\n  1. **West Village 2-Bed Sublease**: **$925/mo** • 0.3 mi away • Washer/dryer in unit, pool, fitness gym & fiber internet included.\n  2. **The York Apartments (201 E Joppa)**: **$840/mo** • 0.6 mi away • Direct Tiger Ride shuttle stop outside.\n  3. **Towson Townhomes 3-Bed**: **$780/mo** • 0.9 mi away • 5-min walk to Science Complex.\n- **Roommate Compatibility**: **94% compatibility match** with Marcus Rivera (Senior CS major, Quiet hours 11:00 PM, Non-smoker).",
    actions: [
      { label: "🏠 Explore Housing Listings", tab: "housing", icon: "Home" },
      { label: "👥 View Roommate Profiles", tab: "housing", icon: "Users" },
    ],
  },

  // ── 8. NOAA WEATHER FORECAST ────────────────────────────────────
  {
    id: "noaa-weather",
    keywords: ["weather", "temperature", "forecast", "noaa", "nws", "rain", "sunny", "radar", "clothing", "humid", "wind", "cold", "hot"],
    category: "CAMPUS",
    title: "Authoritative NOAA Campus Weather & Radar",
    text: "### ☀️ Authoritative NOAA / NWS Campus Weather\n\n- **Station**: Towson Main Campus (KDMH Meteorologic Node)\n- **Current Temperature**: **82°F • Partly Sunny**\n- **Humidity & Wind**: 44% Humidity • Wind 7 mph SW • UV Index: 6 (Moderate)\n- **Clothing Recommendation**: Light apparel & sunglasses. Rain probability is <10%.\n- **7-Day Forecast**: Mild autumn weather with highs of 78–84°F throughout the week.",
    actions: [
      { label: "🌦️ Open Full NOAA Weather & Radar", modal: "weather", icon: "CloudSun" },
    ],
  },

  // ── 9. CIVIC ENGAGEMENT, VOLUNTEERING & PASSPORT ────────────────
  {
    id: "civic-passport",
    keywords: ["volunteer", "service", "civic", "hours", "certificate", "tiger record", "passport", "community service", "diploma", "leadership record"],
    category: "CAMPUS",
    title: "Civic Engagement, Volunteer Hours & Tiger Record",
    text: "### 🤝 Civic Engagement & Official Tiger Record\n\n- **Logged Volunteer Hours**: **48 verified hours** toward your official Tiger Record Leadership Certificate.\n- **Milestones Completed**: **5 of 7 leadership milestones** verified.\n- **Official Verification Hash**: `0x9f4a...81c2` (Cryptographically verified student leadership record).\n- **Active Opportunities**:\n  1. **Campus Food Drive & Pantry Distribution**: +3.5 hours • Cook Library Plaza\n  2. **Towson Green Campus Planting Initiative**: +4.0 hours • Glen Arboretum.",
    actions: [
      { label: "🤝 View Volunteer Opportunities", tab: "activities", icon: "Heart" },
      { label: "🏆 Download Official Service Certificate", tab: "more", subView: "transcript", icon: "Award" },
    ],
  },

  // ── 10. AXIOM CONNECT MAIL & SECURITY ───────────────────────────
  {
    id: "axiom-mail",
    keywords: ["mail", "email", "inbox", "compose", "unread", "dr. hayes email", "sweep", "clean inbox", "cato", "retention", "phishing", "spam", "outlook ribbon", "viva", "insights", "focus time"],
    category: "COMMUNICATIONS",
    title: "Axiom Connect Webmail & Outlook Ribbon Suite",
    text: "### ✉️ Axiom Connect Webmail & Security Operations\n\n- **Inbox Telemetry**: You have **2 unread emails** (Dr. Hayes COSC 421 benchmark dataset & T. Rowe Price interview confirmation).\n- **Outlook Modern Ribbon Commands**:\n  - **🧹 Sweep**: Automate inbox cleanup rules to keep only the newest email from frequent senders.\n  - **💬 Share to Teams**: 1-click cross-posting of email threads into `#general-announcements` or `#engineering-architecture`.\n  - **🛡️ 7-Year cATO Zero-Trust Retention**: SHA-256 cryptographic compliance for academic and research data.\n  - **✨ Viva Insights**: AI workload optimization, automatic meeting summary capture, and focus time reservation.",
    actions: [
      { label: "✉️ Open Axiom Mail & Teams", tab: "messages", icon: "Mail" },
      { label: "✍️ Compose New Email", tab: "messages", app: "mail", modal: "compose", icon: "Send" },
      { label: "🧹 Launch Inbox Sweep Rule", tab: "messages", app: "mail", modal: "sweep", icon: "Wind" },
    ],
  },

  // ── 11. AXIOM TEAMS VIDEO CONFERENCING & CALENDAR ───────────────
  {
    id: "axiom-teams",
    keywords: ["teams", "meeting", "video", "conference", "call", "schedule", "calendar", "webrtc", "join teams", "screen share", "camera", "mic", "meet now"],
    category: "COMMUNICATIONS",
    title: "Axiom Teams WebRTC Video Conferencing & Calendar",
    text: "### 🎥 Axiom Teams Video Conferencing & Calendar\n\n- **Active Standup Room**: **COSC 421 Architecture & Senior Capstone Sync**\n  - Meeting ID: `AXM-492-831` (1080p60 WebRTC encrypted SFU grid).\n  - Features: Live AI Meeting Summaries, speaker spotlighting, screen sharing, and in-call chat.\n- **Scheduling Meetings**: Click '+ Schedule Meeting' on the Calendar tab to auto-generate a 1080p Teams room and invite attendees.\n- **Teams Channels**: Persistent collaboration threads in `#general-announcements` and `#engineering-architecture`.",
    actions: [
      { label: "🎥 Join Active Teams Meeting", tab: "messages", app: "meetings", icon: "Video" },
      { label: "📅 Schedule New Meeting", tab: "messages", app: "calendar", icon: "Calendar" },
    ],
  },

  // ── 12. EXPEDITE CONSULTS ENTERPRISE CONSULTING & CR ────────────
  {
    id: "enterprise-portal",
    keywords: ["expedite", "expedite consults", "change request", "cr", "cr-892", "cr-410", "cr-105", "portal", "dashboard", "fedramp", "cato", "zero trust", "zero-trust", "advisory", "cybersecurity", "soc 2", "cloud migration"],
    category: "ENTERPRISE",
    title: "Expedite Consults — Enterprise IT & Cyber Architecture",
    text: "### 🏢 Expedite Consults — Enterprise IT & Cyber Architecture\n\nExpedite Consults is an elite enterprise digital transformation and zero-trust cybersecurity consultancy:\n\n1. **Change Request (CR) Governance Platform**: Multi-stage stakeholder voting, automated rollback validation, and immutable audit logs (e.g. `CR-892` Zero-Trust IAM Migration & `CR-410` Multi-Region Sharding).\n2. **FedRAMP & Continuous Authorization (cATO)**: Automated compliance pipelines that reduce ATO authorization timelines from 18 months to weeks.\n3. **Zero-Trust Multi-Cloud Architecture**: Identity-aware perimeter proxies, microsegmentation, and automated DLP encryption across AWS, Azure, and GCP.\n4. **Incident Response & 24/7 Autonomous SOC**: Real-time threat detection and AI-assisted remediation.",
    actions: [
      { label: "🏢 Open Expedite Consults Portal", href: "/portal", icon: "ExternalLink" },
      { label: "🛡️ View Services & Solutions", href: "/services", icon: "Shield" },
      { label: "📑 Check Change Request Dashboard", href: "/dashboard", icon: "Layers" },
    ],
  },

  // ── 13. VERITASLENS AI FACT & MEDIA VERIFICATION ────────────────
  {
    id: "veritaslens-ai",
    keywords: ["veritas", "veritaslens", "fact", "facts", "media", "bias", "verification", "claim", "claims", "newsroom", "syndication", "misinformation", "truth"],
    category: "VERITAS",
    title: "VeritasLens — Autonomous Media Verification Engine",
    text: "### 🔍 VeritasLens — Autonomous Media Verification Engine\n\n- **14 Newsroom Real-Time Clustering**: Monitors national, international, and independent newsrooms simultaneously.\n- **Multi-Vector Statutory Verification**: Cross-examines breaking claims against government archives, academic journals, and primary documentation.\n- **Blindspot & Bias Spectrum Index**: Calculates political distribution scores and highlights unaddressed reporting angles.\n- **Live Syndication API**: Enables publishers to verify breaking claims in sub-500ms intervals.",
    actions: [
      { label: "🔍 Open VeritasLens Suite", href: "/veritaslens", icon: "Sparkles" },
      { label: "📊 Run Automated Claim Sync", href: "/api/veritaslens/sync", icon: "RefreshCw" },
    ],
  },
];

export function generateGlobalCopilotResponse(userQuery: string): {
  text: string;
  category: CopilotMessage["category"];
  actions?: CopilotAction[];
} {
  const query = (userQuery || "").toLowerCase().trim();
  if (!query) {
    return {
      category: "GENERAL",
      text: "### ⚡ Global Copilot Ready\n\nAsk any question across **TowsonSync Campus Hub**, **Axiom Connect Mail & Teams**, **Expedite Consults Enterprise**, or **VeritasLens AI**!",
      actions: [
        { label: "🎓 Campus Command Center", tab: "home", icon: "Home" },
        { label: "✉️ Axiom Mail & Teams", tab: "messages", icon: "Mail" },
        { label: "🏢 Enterprise Portal", href: "/portal", icon: "Building" },
      ],
    };
  }

  // 1. Direct Keyword Score Matching
  let bestEntry: KnowledgeEntry | null = null;
  let highestScore = 0;

  const queryWords = query.split(/\s+/).filter((w) => w.length > 1);

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;

    // Check exact phrase matches in keywords
    for (const kw of entry.keywords) {
      if (query === kw) {
        score += 50;
      } else if (query.includes(kw)) {
        score += 20 + kw.length;
      }
    }

    // Check individual word matches
    for (const w of queryWords) {
      for (const kw of entry.keywords) {
        if (kw.includes(w)) {
          score += 5;
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestEntry = entry;
    }
  }

  // If a strong match was found (score >= 10), return that authoritative entry
  if (bestEntry && highestScore >= 10) {
    return {
      category: bestEntry.category,
      text: bestEntry.text,
      actions: bestEntry.actions,
    };
  }

  // 2. Fuzzy Semantic Fallback Synthesizer:
  // If the query was broad or not directly matched, gather top 3 relevant entries and synthesize a comprehensive answer
  const ranked = [...KNOWLEDGE_BASE]
    .map((e) => {
      let sc = 0;
      for (const w of queryWords) {
        if (e.text.toLowerCase().includes(w) || e.title.toLowerCase().includes(w)) {
          sc += 3;
        }
      }
      return { entry: e, score: sc };
    })
    .sort((a, b) => b.score - a.score);

  const topMatches = ranked.slice(0, 3).filter((r) => r.score > 0);

  if (topMatches.length > 0) {
    const combinedActions: CopilotAction[] = [];
    topMatches.forEach((m) => {
      m.entry.actions.forEach((act) => {
        if (!combinedActions.some((a) => a.label === act.label)) {
          combinedActions.push(act);
        }
      });
    });

    const summaryItems = topMatches.map(
      (m) => `• **${m.entry.title}** (${m.entry.category}): ${m.entry.text.split("\n\n")[1]?.slice(0, 140) || m.entry.title}...`
    );

    return {
      category: "GENERAL",
      text: `### ⚡ Expedite Consults & TowsonSync Ecosystem Answer\n\nHere is what I found across our platform matching **"${userQuery}"**:\n\n${summaryItems.join(
        "\n\n"
      )}\n\n*Select any direct action jumper below to navigate directly:*`,
      actions: combinedActions.slice(0, 4),
    };
  }

  // 3. Complete Universal Fallback
  return {
    category: "GENERAL",
    text: `### ⚡ Expedite Consults & TowsonSync Ecosystem Copilot\n\nI searched the entire website for **"${userQuery}"**. Here is how you can navigate the key areas of the platform:\n\n- 🎓 **TowsonSync Campus**: Classes, Canvas deadlines, Student Clubs (African Student Association, Cybersecurity Club), OneCard dining dollars ($428.50), Off-campus housing ($925 West Village), Tiger Ride shuttles (4m ETA), and NOAA weather (82°F).\n- ✉️ **Axiom Connect**: Modern webmail with Sweep rules, WebRTC Teams video conference rooms, Drive vaults, and cATO retention.\n- 🏢 **Expedite Consults Enterprise**: Change Request (CR) approvals, Zero-Trust cybersecurity, and FedRAMP cATO modernization.\n- 🔍 **VeritasLens AI**: 14-newsroom live bias tracking and statutory claim verification.`,
    actions: [
      { label: "🎓 Campus Command Center", tab: "home", icon: "Home" },
      { label: "🏛️ Student Organizations", tab: "organizations", icon: "Users" },
      { label: "✉️ Axiom Mail & Teams", tab: "messages", icon: "Mail" },
      { label: "🏢 Enterprise Portal", href: "/portal", icon: "Building" },
      { label: "🔍 VeritasLens AI", href: "/veritaslens", icon: "Sparkles" },
    ],
  };
}
