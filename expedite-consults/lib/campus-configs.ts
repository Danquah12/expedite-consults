import { UniversityConfig } from "@/components/campus/CampusPortalLayout";

// ── 1. TOWSON UNIVERSITY CONFIGURATION ────────────────────────────────────────
export const towsonConfig: UniversityConfig = {
  id: "towson",
  name: "Towson University",
  shortName: "Towson",
  tagline: "Inspiring Greatness • Maryland's Premier Public University",
  mascot: "Tigers",
  mascotEmoji: "🐯",
  location: "Towson, Maryland",
  primaryColor: "amber-500",
  primaryBg: "bg-amber-500",
  primaryText: "text-amber-500",
  primaryBorder: "border-amber-500",
  accentGradient: "from-amber-500 via-amber-600 to-yellow-500",
  heroImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80",
  stats: {
    enrolledStudents: "22,400+",
    activeClubs: "280+",
    transitRoutes: "6 Active Routes",
    diningOpen: "4 Open (West Village / Newell)",
  },
  featuredBuildings: [
    { id: "b1", name: "Albert S. Cook Library", code: "CK", type: "Library", floors: 5, hours: "Open 24/7 (Floors 1-2)", status: "Open Now", popularFor: "Late night quiet study pods & 24h printing" },
    { id: "b2", name: "Science Complex", code: "SC", type: "Academic", floors: 5, hours: "7:00 AM - 10:00 PM", status: "Open Now", popularFor: "Planetarium, chemistry research & study atrium" },
    { id: "b3", name: "College of Liberal Arts", code: "LA", type: "Academic", floors: 4, hours: "7:30 AM - 9:30 PM", status: "Open Now", popularFor: "Writing center, philosophy lounge & cafe" },
    { id: "b4", name: "University Union", code: "UU", type: "Student Center", floors: 3, hours: "7:00 AM - 11:00 PM", status: "Open Now", popularFor: "Student SGA, food court, career center & bookstore" },
    { id: "b5", name: "SECU Arena & Burdick Hall", code: "BK", type: "Athletics", floors: 3, hours: "6:00 AM - 11:00 PM", status: "Open Now", popularFor: "Rock climbing wall, gym, pool & basketball" },
    { id: "b6", name: "West Village Dining Commons", code: "WV", type: "Dining", floors: 2, hours: "7:30 AM - 10:00 PM", status: "Open Now", popularFor: "All-you-care-to-eat dining & allergen station" },
  ],
  shuttleRoutes: [
    [
      { id: "t-gold", name: "Gold Route (Main Campus Loop)", routeColor: "#f59e0b", nextArrival: "3 mins", stopsCount: 8, frequency: "Every 7 mins", status: "On Time", driverStatus: "Active • Unit 204" },
      { id: "t-black", name: "Black Route (West Village Express)", routeColor: "#18181b", nextArrival: "6 mins", stopsCount: 5, frequency: "Every 10 mins", status: "On Time", driverStatus: "Active • Unit 209" },
      { id: "t-off", name: "Off-Campus / Towson Town Center", routeColor: "#3b82f6", nextArrival: "11 mins", stopsCount: 12, frequency: "Every 15 mins", status: "On Time", driverStatus: "Active • Unit 118" },
    ][0],
    { id: "t-black", name: "Black Route (West Village Express)", routeColor: "#18181b", nextArrival: "6 mins", stopsCount: 5, frequency: "Every 10 mins", status: "On Time", driverStatus: "Active • Unit 209" },
    { id: "t-off", name: "Off-Campus / Towson Town Center", routeColor: "#3b82f6", nextArrival: "11 mins", stopsCount: 12, frequency: "Every 15 mins", status: "On Time", driverStatus: "Active • Unit 118" },
  ],
  parkingGarages: [
    { name: "Union Garage", occupancyPct: 82, availableSpots: 140, permitRequired: "Commuter / Core Permit" },
    { name: "West Village Garage", occupancyPct: 64, availableSpots: 320, permitRequired: "Resident & Commuter" },
    { name: "Glen Garage", occupancyPct: 45, availableSpots: 410, permitRequired: "Faculty & Staff / Commuter" },
    { name: "Towsontown Garage", occupancyPct: 91, availableSpots: 48, permitRequired: "Core Permit Required" },
  ],
  diningHalls: [
    { name: "West Village Commons Dining", location: "West Village 2nd Floor", hours: "7:30 AM - 9:00 PM", mealPeriod: "Lunch", status: "Open", capacityPct: 62, popularStation: "Fresh Sauté & Grill" },
    { name: "Newell Dining Hall", location: "Old Campus Upper Deck", hours: "8:00 AM - 8:30 PM", mealPeriod: "Lunch", status: "Open", capacityPct: 78, popularStation: "Artisan Pizza & Salads" },
    { name: "Union Food Market", location: "University Union 1st Floor", hours: "10:30 AM - 10:00 PM", mealPeriod: "Lunch", status: "Busy", capacityPct: 88, popularStation: "Chick-fil-A & Sushi Lab" },
  ],
  courses: [
    { code: "COSC 336", title: "Database Management Systems", credits: 3, instructor: "Dr. Cheryl Brown", instructorEmail: "cbrown@towson.edu", schedule: "Tue / Thu · 9:30 AM", room: "312", building: "7800 York Rd", nextAssignment: "SQL Relational Algebra Lab", dueDate: "Thursday", officeHours: "Wed 2-4 PM", classmatesCount: 34 },
    { code: "COSC 412", title: "Software Engineering Project", credits: 3, instructor: "Prof. Michael O'Leary", instructorEmail: "moleary@towson.edu", schedule: "Mon / Wed · 2:00 PM", room: "204", building: "Science Complex", nextAssignment: "Sprint 2 Architecture Review", dueDate: "Friday", officeHours: "Mon 4-5 PM", classmatesCount: 28 },
    { code: "MATH 330", title: "Introduction to Statistical Methods", credits: 4, instructor: "Dr. Russell Goodman", instructorEmail: "rgoodman@towson.edu", schedule: "Tue / Thu · 12:30 PM", room: "118", building: "Smith Hall", nextAssignment: "Hypothesis Testing Homework 4", dueDate: "Next Tue", officeHours: "Tue 3-5 PM", classmatesCount: 42 },
    { code: "COMM 131", title: "Public Speaking & Rhetoric", credits: 3, instructor: "Prof. Sarah Miller", instructorEmail: "smiller@towson.edu", schedule: "Wed · 6:00 PM", room: "102", building: "Liberal Arts", nextAssignment: "Persuasive Presentation Deck", dueDate: "Next Wed", officeHours: "Wed 4-5 PM", classmatesCount: 22 },
  ],
  events: [
    { id: "ev-1", title: "Towson Spring Career & Internship Fair", organization: "TU Career Center", category: "Career", date: "Thursday, March 26", time: "11:00 AM - 3:00 PM", location: "SECU Arena Floor", attendeesCount: 420, image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80" },
    { id: "ev-2", title: "Tiger Hackathon 2026 Kickoff", organization: "TU Software Development Club", category: "Academic", date: "Friday, March 27", time: "5:30 PM", location: "Science Complex Atrium", attendeesCount: 180, image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80" },
    { id: "ev-3", title: "Men's Lacrosse vs. Hofstra", organization: "Towson Athletics", category: "Athletics", date: "Saturday, March 28", time: "1:00 PM", location: "Johnny Unitas Stadium", attendeesCount: 850, image: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=600&auto=format&fit=crop&q=80" },
  ],
  posts: [
    { id: "p1", author: "Maya Patel", major: "Computer Science '27", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", timeAgo: "2h ago", content: "Cook Library 4th floor quiet study room is open if anyone needs a quiet spot for COSC 336 midterms! 📚💻", likes: 24, commentsCount: 6, tag: "Academics" },
    { id: "p2", author: "Devon Clark", major: "Business Admin '26", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", timeAgo: "4h ago", content: "West Village dining just put out fresh made-to-order stir fry. Line is moving fast today! 🍜", likes: 18, commentsCount: 3, tag: "Dining" },
    { id: "p3", author: "Zoe Washington", major: "Nursing '26", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80", timeAgo: "6h ago", content: "Looking for 1 roommate for a 3B/2B apartment at University Village starting June 1st. Utilities included! DM me. 🏡", likes: 31, commentsCount: 9, tag: "Housing" },
  ],
  housing: [
    { id: "h1", title: "University Village — 2 Bed / 2 Bath", rentPerMonth: 940, beds: 2, baths: 2, distanceFromCampus: "0.4 miles (5 min shuttle)", address: "201 E Joppa Rd, Towson, MD", furnished: true, utilitiesIncluded: true, availableSemester: "Available Summer/Fall 2026", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80" },
    { id: "h2", title: "The Winthrop Off-Campus Suite", rentPerMonth: 1120, beds: 1, baths: 1, distanceFromCampus: "0.8 miles (Direct shuttle stop)", address: "913 Southerly Rd, Towson, MD", furnished: true, utilitiesIncluded: false, availableSemester: "Available Fall 2026", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80" },
    { id: "h3", title: "Towson Place Townhomes Private Room", rentPerMonth: 780, beds: 3, baths: 2, distanceFromCampus: "1.1 miles (8 min bike)", address: "1408 Putty Hill Ave, Towson, MD", furnished: false, utilitiesIncluded: true, availableSemester: "Immediate Move-In", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop&q=80" },
  ],
  marketplace: [
    { id: "m1", title: "Calculus: Early Transcendentals (8th Ed)", price: 45, seller: "Marcus K.", category: "Textbooks", condition: "Like New", timeAgo: "3h ago", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80" },
    { id: "m2", title: "TI-84 Plus CE Graphing Calculator", price: 60, seller: "Ashley R.", category: "Electronics", condition: "Good", timeAgo: "5h ago", image: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=400&auto=format&fit=crop&q=80" },
    { id: "m3", title: "Ergonomic Desk Chair (Mesh back)", price: 40, seller: "Brandon L.", category: "Furniture", condition: "Good", timeAgo: "1d ago", image: "https://images.unsplash.com/photo-1580481077197-203598730999?w=400&auto=format&fit=crop&q=80" },
    { id: "m4", title: "Towson Tigers Champion Hoodie (Size L)", price: 25, seller: "Jordan M.", category: "Apparel", condition: "Like New", timeAgo: "1d ago", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&auto=format&fit=crop&q=80" },
  ]
};

// ── 2. UNIVERSITY OF MARYLAND (UMD) CONFIGURATION ──────────────────────────────
export const umdConfig: UniversityConfig = {
  id: "umd",
  name: "University of Maryland, College Park",
  shortName: "UMD",
  tagline: "Fear the Turtle • Maryland's Flagship Research University",
  mascot: "Terrapins",
  mascotEmoji: "🐢",
  location: "College Park, Maryland",
  primaryColor: "rose-600",
  primaryBg: "bg-rose-600",
  primaryText: "text-rose-600",
  primaryBorder: "border-rose-600",
  accentGradient: "from-rose-600 via-red-600 to-amber-500",
  heroImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&auto=format&fit=crop&q=80",
  stats: {
    enrolledStudents: "41,200+",
    activeClubs: "520+",
    transitRoutes: "18 Shuttle-UM Routes",
    diningOpen: "The Diner & 251 North",
  },
  featuredBuildings: [
    { id: "u1", name: "Brendan Iribe Center for CS & AI", code: "IRB", type: "Academic", floors: 6, hours: "Open 24/7 (CS Major Card Access)", status: "Open Now", popularFor: "Rooftop gardens, maker space & hacker lounge" },
    { id: "u2", name: "McKeldin Library", code: "MCK", type: "Library", floors: 7, hours: "Open 24 Hours", status: "Open Now", popularFor: "Late night study, Footnotes cafe & overlooking McKeldin Mall" },
    { id: "u3", name: "Adele H. Stamp Student Union", code: "STAMP", type: "Student Center", floors: 4, hours: "7:00 AM - Midnight", status: "Open Now", popularFor: "Bowling alley, TerpZone, food court & art gallery" },
    { id: "u4", name: "A. James Clark Hall (Bioengineering)", code: "CLK", type: "Academic", floors: 5, hours: "7:00 AM - 10:00 PM", status: "Open Now", popularFor: "Biotech labs & engineering innovation collaborative" },
    { id: "u5", name: "Eppley Recreation Center (ERC)", code: "ERC", type: "Athletics", floors: 3, hours: "6:00 AM - Midnight", status: "Open Now", popularFor: "Olympic pool, indoor track, weight rooms & sauna" },
    { id: "u6", name: "The Diner (Ellicott Community)", code: "DNR", type: "Dining", floors: 2, hours: "7:00 AM - 10:00 PM", status: "Open Now", popularFor: "Stir-fry wok, deli, gluten-free pantry & dessert bar" },
  ],
  shuttleRoutes: [
    { id: "um-104", name: "104 College Park Metro Shuttle", routeColor: "#dc2626", nextArrival: "2 mins", stopsCount: 4, frequency: "Every 6 mins", status: "On Time", driverStatus: "Active • Unit 412" },
    { id: "um-105", name: "105 Campus Connector", routeColor: "#f59e0b", nextArrival: "5 mins", stopsCount: 14, frequency: "Every 8 mins", status: "On Time", driverStatus: "Active • Unit 309" },
    { id: "um-111", name: "111 Silver Spring Express", routeColor: "#2563eb", nextArrival: "14 mins", stopsCount: 18, frequency: "Every 20 mins", status: "On Time", driverStatus: "Active • Unit 215" },
  ],
  parkingGarages: [
    { name: "Regents Drive Garage", occupancyPct: 88, availableSpots: 92, permitRequired: "Student Commuter (Lot 1)" },
    { name: "Stadium Drive Garage", occupancyPct: 71, availableSpots: 240, permitRequired: "Visitor & Permit Holders" },
    { name: "Mowatt Lane Garage", occupancyPct: 59, availableSpots: 380, permitRequired: "South Campus Resident" },
    { name: "Terrapin Main Lot", occupancyPct: 94, availableSpots: 22, permitRequired: "Faculty & Special Event" },
  ],
  diningHalls: [
    { name: "The Yahentamitsi Dining Hall", location: "Heritage Community", hours: "7:00 AM - 9:30 PM", mealPeriod: "Lunch", status: "Open", capacityPct: 74, popularStation: "Fire Roasted Hearth & Smoker" },
    { name: "The Diner", location: "North Campus Ellicott", hours: "7:00 AM - 10:00 PM", mealPeriod: "Lunch", status: "Open", capacityPct: 82, popularStation: "Custom Pasta & Asian Wok" },
    { name: "251 North", location: "Denton Community", hours: "11:00 AM - 8:30 PM", mealPeriod: "Lunch", status: "Open", capacityPct: 55, popularStation: "All-You-Care-To-Eat Specialty Buffet" },
  ],
  courses: [
    { code: "CMSC 351", title: "Algorithms & Computational Complexity", credits: 4, instructor: "Dr. Justin Wyss-Gallifent", instructorEmail: "justin@cs.umd.edu", schedule: "Mon / Wed / Fri · 10:00 AM", room: "0105", building: "Iribe Center", nextAssignment: "Dynamic Programming Midterm Problem Set", dueDate: "Friday", officeHours: "Mon 1-3 PM", classmatesCount: 220 },
    { code: "CMSC 420", title: "Advanced Data Structures", credits: 3, instructor: "Dr. Dave Mount", instructorEmail: "mount@cs.umd.edu", schedule: "Tue / Thu · 11:00 AM", room: "1115", building: "Iribe Center", nextAssignment: "KD-Tree Spatial Indexing Project", dueDate: "Thursday", officeHours: "Tue 2-4 PM", classmatesCount: 88 },
    { code: "ENEE 244", title: "Digital Logic Design", credits: 3, instructor: "Dr. Manoj Franklin", instructorEmail: "franklin@umd.edu", schedule: "Mon / Wed · 1:00 PM", room: "1202", building: "Clark Hall", nextAssignment: "Verilog Finite State Machine Lab", dueDate: "Next Mon", officeHours: "Wed 3-5 PM", classmatesCount: 65 },
    { code: "ECON 200", title: "Principles of Microeconomics", credits: 3, instructor: "Dr. John Straub", instructorEmail: "straub@econ.umd.edu", schedule: "Tue / Thu · 2:00 PM", room: "0200", building: "Tydings Hall", nextAssignment: "Market Equilibrium Quiz 3", dueDate: "Next Tue", officeHours: "Thu 11 AM", classmatesCount: 310 },
  ],
  events: [
    { id: "ue-1", title: "Bitcamp 2026: East Coast Flagship Hackathon", organization: "Bitcamp Organizing Committee", category: "Academic", date: "April 10 - 12", time: "All Weekend", location: "XFINITY Center", attendeesCount: 1400, image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80" },
    { id: "ue-2", title: "Terps Basketball vs. Michigan State", organization: "Maryland Athletics", category: "Athletics", date: "Wednesday, March 25", time: "7:00 PM", location: "XFINITY Center Court", attendeesCount: 17950, image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&q=80" },
    { id: "ue-3", title: "Engineering & Robotics Spring Expo", organization: "Clark School of Engineering", category: "Career", date: "Thursday, March 26", time: "1:00 PM - 5:00 PM", location: "Kim Engineering Building", attendeesCount: 520, image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=80" },
  ],
  posts: [
    { id: "up1", author: "Alex Ramos", major: "Computer Engineering '26", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", timeAgo: "1h ago", content: "Iribe Center 3rd floor lounge is hosting an impromptu CMSC 351 review session for anyone struggling with Graph DP! Come through. 💻🔥", likes: 48, commentsCount: 14, tag: "Academics" },
    { id: "up2", author: "Priya Sharma", major: "Bioengineering '27", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80", timeAgo: "3h ago", content: "The Yahentamitsi dining hall has fresh smoked brisket today! Definitely best dining hall on campus. 🥩", likes: 36, commentsCount: 8, tag: "Dining" },
    { id: "up3", author: "Ethan Reed", major: "Finance '26", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80", timeAgo: "5h ago", content: "Subleasing 1 bedroom in a 4B/2B apartment at Terrapin Row for Summer 2026. Pool view, gym, 2 mins from campus! DM for details. 🏢", likes: 29, commentsCount: 11, tag: "Housing" },
  ],
  housing: [
    { id: "uh1", title: "Terrapin Row — 4 Bed / 2 Bath Luxury Suite", rentPerMonth: 1080, beds: 4, baths: 2, distanceFromCampus: "Adjacent to South Campus", address: "4205 Knox Rd, College Park, MD", furnished: true, utilitiesIncluded: true, availableSemester: "Summer / Fall 2026", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80" },
    { id: "uh2", title: "The Varsity Apartments — 2 Bed / 2 Bath", rentPerMonth: 1250, beds: 2, baths: 2, distanceFromCampus: "Across from CS Iribe Center", address: "8150 Baltimore Ave, College Park, MD", furnished: true, utilitiesIncluded: true, availableSemester: "Fall 2026", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80" },
    { id: "uh3", title: "Landmark College Park Private Room", rentPerMonth: 980, beds: 3, baths: 3, distanceFromCampus: "0.3 miles from McKeldin Mall", address: "4500 College Ave, College Park, MD", furnished: true, utilitiesIncluded: false, availableSemester: "Immediate Move-In", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80" },
  ],
  marketplace: [
    { id: "um1", title: "Introduction to Algorithms (CLRS 4th Edition)", price: 55, seller: "Kiran N.", category: "Textbooks", condition: "Like New", timeAgo: "2h ago", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80" },
    { id: "um2", title: "Apple iPad Air (5th Gen, 64GB) + Pencil", price: 380, seller: "Samantha V.", category: "Electronics", condition: "Like New", timeAgo: "4h ago", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&auto=format&fit=crop&q=80" },
    { id: "um3", title: "Maryland Terps Official Under Armour Jersey", price: 35, seller: "Tyler W.", category: "Apparel", condition: "Good", timeAgo: "1d ago", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&auto=format&fit=crop&q=80" },
  ]
};

// ── 3. UMBC CONFIGURATION ──────────────────────────────────────────────────────
export const umbcConfig: UniversityConfig = {
  id: "umbc",
  name: "University of Maryland, Baltimore County",
  shortName: "UMBC",
  tagline: "Grit & Greatness • An Honors University in Maryland",
  mascot: "Retrievers",
  mascotEmoji: "🐕",
  location: "Baltimore, Maryland",
  primaryColor: "amber-500",
  primaryBg: "bg-amber-500",
  primaryText: "text-amber-500",
  primaryBorder: "border-amber-500",
  accentGradient: "from-amber-500 via-yellow-500 to-zinc-900",
  heroImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80",
  stats: {
    enrolledStudents: "14,100+",
    activeClubs: "260+",
    transitRoutes: "7 Retriever Transit Routes",
    diningOpen: "True Grit's & Commons",
  },
  featuredBuildings: [
    { id: "um1", name: "Albin O. Kuhn Library & Gallery", code: "AOK", type: "Library", floors: 7, hours: "Open 24/5", status: "Open Now", popularFor: "7th floor quiet panorama & digital media lab" },
    { id: "um2", name: "Information Technology & Engineering (ITE)", code: "ITE", type: "Academic", floors: 4, hours: "7:00 AM - 11:00 PM", status: "Open Now", popularFor: "Cybersecurity defense labs, AI research & computer labs" },
    { id: "um3", name: "The Commons Student Center", code: "COMM", type: "Student Center", floors: 3, hours: "7:30 AM - Midnight", status: "Open Now", popularFor: "Gamers lounge, food court, student life & bookstore" },
    { id: "um4", name: "Interdisciplinary Life Sciences (ILSB)", code: "ILSB", type: "Academic", floors: 4, hours: "7:00 AM - 9:30 PM", status: "Open Now", popularFor: "Bio-discovery labs, atrium study & team meeting pods" },
    { id: "um5", name: "Chesapeake Employers Insurance Arena", code: "ARENA", type: "Athletics", floors: 3, hours: "6:00 AM - 10:30 PM", status: "Open Now", popularFor: "NCAA Division I basketball, fitness & intramurals" },
    { id: "um6", name: "True Grit's Dining Hall", code: "TG", type: "Dining", floors: 2, hours: "7:30 AM - 9:00 PM", mealPeriod: "Lunch", status: "Open Now", popularFor: "Rotisserie grill, salad bar, vegan kitchen & bakery" },
  ],
  shuttleRoutes: [
    { id: "rt-arbutus", name: "Arbutus & MARC Station Route", routeColor: "#f59e0b", nextArrival: "4 mins", stopsCount: 6, frequency: "Every 10 mins", status: "On Time", driverStatus: "Active • Unit 108" },
    { id: "rt-bwi", name: "BWI / Tech Park Route", routeColor: "#10b981", nextArrival: "8 mins", stopsCount: 8, frequency: "Every 15 mins", status: "On Time", driverStatus: "Active • Unit 202" },
    { id: "rt-catonsville", name: "Catonsville Connector", routeColor: "#3b82f6", nextArrival: "12 mins", stopsCount: 10, frequency: "Every 20 mins", status: "On Time", driverStatus: "Active • Unit 305" },
  ],
  parkingGarages: [
    { name: "Administration Garage", occupancyPct: 78, availableSpots: 110, permitRequired: "Faculty / Staff & Commuter" },
    { name: "Walker Garage", occupancyPct: 62, availableSpots: 240, permitRequired: "Walker Resident" },
    { name: "Commons Garage", occupancyPct: 89, availableSpots: 45, permitRequired: "Student Commuter A/B" },
    { name: "Stadium Lot", occupancyPct: 35, availableSpots: 520, permitRequired: "General Student Parking" },
  ],
  diningHalls: [
    { name: "True Grit's Dining Hall", location: "Terrace Community", hours: "7:30 AM - 9:00 PM", mealPeriod: "Lunch", status: "Open", capacityPct: 68, popularStation: "All-Day Omelets & Sauté Wok" },
    { name: "The Commons Food Court", location: "The Commons 1st Floor", hours: "10:00 AM - 11:00 PM", mealPeriod: "Lunch", status: "Busy", capacityPct: 85, popularStation: "Halal Shack & Starbucks" },
    { name: "The Skylight Room", location: "The Commons 3rd Floor", hours: "11:30 AM - 2:00 PM", mealPeriod: "Lunch", status: "Open", capacityPct: 45, popularStation: "Chef's Table Buffet" },
  ],
  courses: [
    { code: "CMSC 341", title: "Data Structures & Modern Algorithms", credits: 3, instructor: "Dr. Jeremy Dixon", instructorEmail: "jdixon@umbc.edu", schedule: "Tue / Thu · 10:00 AM", room: "104", building: "ITE Building", nextAssignment: "Project 3: Balanced Red-Black Trees", dueDate: "Friday", officeHours: "Tue 1-3 PM", classmatesCount: 160 },
    { code: "CMSC 421", title: "Principles of Operating Systems", credits: 3, instructor: "Dr. Jason Lovelace", instructorEmail: "lovelace@umbc.edu", schedule: "Mon / Wed · 1:00 PM", room: "228", building: "ITE Building", nextAssignment: "Kernel Process Scheduler Lab", dueDate: "Thursday", officeHours: "Wed 3-5 PM", classmatesCount: 75 },
    { code: "MATH 221", title: "Introduction to Linear Algebra", credits: 3, instructor: "Dr. Kathleen Hoffman", instructorEmail: "khoffman@umbc.edu", schedule: "Tue / Thu · 1:00 PM", room: "101", building: "Math & Psychology", nextAssignment: "Eigenvectors & Matrix Factorization", dueDate: "Next Tue", officeHours: "Thu 11 AM", classmatesCount: 55 },
  ],
  events: [
    { id: "ube-1", title: "UMBC Hackathon 2026: RetrieverHacks", organization: "Computer Science Education Club", category: "Academic", date: "April 18 - 19", time: "9:00 AM Kickoff", location: "ILSB Atrium", attendeesCount: 380, image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80" },
    { id: "ube-2", title: "Undergraduate Research Symposium (URCAD)", organization: "Office of Undergraduate Research", category: "Academic", date: "Wednesday, April 22", time: "10:00 AM - 4:00 PM", location: "AOK Library Gallery", attendeesCount: 650, image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80" },
    { id: "ube-3", title: "Retrievers Men's Lacrosse vs. Stony Brook", organization: "UMBC Athletics", category: "Athletics", date: "Saturday, March 28", time: "3:00 PM", location: "UMBC Stadium", attendeesCount: 1200, image: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=600&auto=format&fit=crop&q=80" },
  ],
  posts: [
    { id: "ubp1", author: "Tariq Edwards", major: "Information Systems '26", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", timeAgo: "1h ago", content: "AOK Library 7th floor view over Baltimore is beautiful this afternoon. Quietest spot on campus to get work done! 📚🌇", likes: 32, commentsCount: 5, tag: "Campus Life" },
    { id: "ubp2", author: "Hannah Lin", major: "Cybersecurity '27", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", timeAgo: "4h ago", content: "Halal Shack at The Commons has zero line right now if anyone is grabbing lunch! 🥙", likes: 21, commentsCount: 4, tag: "Dining" },
  ],
  housing: [
    { id: "ubh1", title: "Walker Avenue Apartments — 4 Bed / 2 Bath", rentPerMonth: 890, beds: 4, baths: 2, distanceFromCampus: "On Campus (Walker Loop)", address: "1000 Hilltop Circle, Baltimore, MD", furnished: true, utilitiesIncluded: true, availableSemester: "Fall 2026", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80" },
    { id: "ubh2", title: "Westland Gardens Off-Campus Townhouse", rentPerMonth: 720, beds: 3, baths: 2, distanceFromCampus: "1.2 miles (Arbutus Shuttle)", address: "4715 Southwestern Blvd, Baltimore, MD", furnished: false, utilitiesIncluded: false, availableSemester: "Immediate Move-In", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop&q=80" },
  ],
  marketplace: [
    { id: "ubm1", title: "Linear Algebra & Its Applications (Lay 5th Ed)", price: 40, seller: "Darius K.", category: "Textbooks", condition: "Like New", timeAgo: "3h ago", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80" },
    { id: "ubm2", title: "Logitech MX Master 3S Wireless Mouse", price: 50, seller: "Chen W.", category: "Electronics", condition: "Like New", timeAgo: "1d ago", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&auto=format&fit=crop&q=80" },
  ]
};

// ── 4. SALISBURY UNIVERSITY CONFIGURATION ──────────────────────────────────────
export const salisburyConfig: UniversityConfig = {
  id: "salisbury",
  name: "Salisbury University",
  shortName: "Salisbury",
  tagline: "Make Tomorrow Yours • Maryland's Eastern Shore University",
  mascot: "Sea Gulls",
  mascotEmoji: "🦅",
  location: "Salisbury, Maryland",
  primaryColor: "rose-800",
  primaryBg: "bg-rose-800",
  primaryText: "text-rose-800",
  primaryBorder: "border-rose-800",
  accentGradient: "from-rose-800 via-rose-900 to-amber-500",
  heroImage: "https://images.unsplash.com/photo-1525921429624-479b6a26d84d?w=1200&auto=format&fit=crop&q=80",
  stats: {
    enrolledStudents: "8,200+",
    activeClubs: "140+",
    transitRoutes: "4 Campus Trolley Routes",
    diningOpen: "Commons & Guerrieri",
  },
  featuredBuildings: [
    { id: "sb1", name: "Patricia R. Guerrieri Academic Commons", code: "AC", type: "Library", floors: 4, hours: "Open 24/5", status: "Open Now", popularFor: "4-story sunlit atrium, study towers & cafe" },
    { id: "sb2", name: "Richard A. Henson Science Hall", code: "HS", type: "Academic", floors: 3, hours: "7:00 AM - 10:00 PM", status: "Open Now", popularFor: "Geology labs, physics observatory & computer labs" },
    { id: "sb3", name: "Guerrieri Student Union", code: "GSU", type: "Student Center", floors: 2, hours: "7:30 AM - 11:00 PM", status: "Open Now", popularFor: "Cool Beans cafe, student SGA & pool tables" },
    { id: "sb4", name: "Franklin P. Perdue Hall", code: "PH", type: "Academic", floors: 3, hours: "7:00 AM - 9:30 PM", status: "Open Now", popularFor: "School of Business, mock trading floor & executive lounge" },
    { id: "sb5", name: "Maggs Physical Activities Center", code: "MAGGS", type: "Athletics", floors: 2, hours: "6:00 AM - 10:00 PM", status: "Open Now", popularFor: "Swimming pool, indoor courts & cardio fitness" },
    { id: "sb6", name: "Salisbury Commons Dining Hall", code: "COMMONS", type: "Dining", floors: 2, hours: "7:30 AM - 8:30 PM", status: "Open Now", popularFor: "Farm-to-table Eastern shore seafood & grill" },
  ],
  shuttleRoutes: [
    { id: "su-main", name: "Sea Gull Main Campus Loop", routeColor: "#881337", nextArrival: "3 mins", stopsCount: 5, frequency: "Every 8 mins", status: "On Time", driverStatus: "Active • Trolley 1" },
    { id: "su-square", name: "Sea Gull Square & Downtown", routeColor: "#f59e0b", nextArrival: "7 mins", stopsCount: 7, frequency: "Every 12 mins", status: "On Time", driverStatus: "Active • Trolley 2" },
  ],
  parkingGarages: [
    { name: "Sea Gull Square Garage", occupancyPct: 75, availableSpots: 180, permitRequired: "Student Resident & Retail" },
    { name: "Wayne Street Parking Deck", occupancyPct: 58, availableSpots: 290, permitRequired: "Commuter & Staff" },
  ],
  diningHalls: [
    { name: "Salisbury Commons Dining", location: "Main Quad", hours: "7:30 AM - 8:30 PM", mealPeriod: "Lunch", status: "Open", capacityPct: 65, popularStation: "Eastern Shore Crab Bisque & Sauté" },
    { name: "Cool Beans Coffee & Bakery", location: "Academic Commons 1st Floor", hours: "7:30 AM - 10:00 PM", mealPeriod: "Lunch", status: "Busy", capacityPct: 80, popularStation: "Artisan Lattes & Pastries" },
  ],
  courses: [
    { code: "COSC 250", title: "Microcomputer Organization & Assembly", credits: 4, instructor: "Dr. Steven Lauterburg", instructorEmail: "slauterburg@salisbury.edu", schedule: "Mon / Wed · 11:00 AM", room: "214", building: "Henson Hall", nextAssignment: "ARM Assembly Bitwise Operations", dueDate: "Thursday", officeHours: "Mon 2-4 PM", classmatesCount: 30 },
    { code: "MGMT 320", title: "Management & Organizational Behavior", credits: 3, instructor: "Dr. Sarah Egan", instructorEmail: "segan@salisbury.edu", schedule: "Tue / Thu · 2:00 PM", room: "112", building: "Perdue Hall", nextAssignment: "Case Study: Leadership Dynamics", dueDate: "Next Tue", officeHours: "Thu 1-3 PM", classmatesCount: 45 },
  ],
  events: [
    { id: "se-1", title: "Sea Gull Spring Fest & Quad Fair", organization: "Student Government Association", category: "Social", date: "Friday, April 17", time: "12:00 PM - 5:00 PM", location: "Red Square / Main Quad", attendeesCount: 950, image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=600&auto=format&fit=crop&q=80" },
    { id: "se-2", title: "Sea Gulls Baseball vs. Christopher Newport", organization: "Salisbury Athletics", category: "Athletics", date: "Saturday, March 28", time: "1:00 PM", location: "Sea Gull Baseball Stadium", attendeesCount: 450, image: "https://images.unsplash.com/photo-1508344928928-7165b67de128?w=600&auto=format&fit=crop&q=80" },
  ],
  posts: [
    { id: "sp1", author: "Caleb Miller", major: "Environmental Science '26", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80", timeAgo: "2h ago", content: "Academic Commons 3rd floor study rooms have incredible sunlight today. Best campus library in the state! 🦅📚", likes: 27, commentsCount: 4, tag: "Campus Life" },
  ],
  housing: [
    { id: "sh1", title: "Sea Gull Square — 4 Bed / 2 Bath", rentPerMonth: 820, beds: 4, baths: 2, distanceFromCampus: "On Campus (Across from Academic Commons)", address: "1300 S Salisbury Blvd, Salisbury, MD", furnished: true, utilitiesIncluded: true, availableSemester: "Fall 2026", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80" },
  ],
  marketplace: [
    { id: "sm1", title: "Calculus with Applications (Lial 11th Ed)", price: 35, seller: "Brooke T.", category: "Textbooks", condition: "Good", timeAgo: "1d ago", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80" },
  ]
};

// ── 5. JOHNS HOPKINS UNIVERSITY (JHU) CONFIGURATION ───────────────────────────
export const hopkinsConfig: UniversityConfig = {
  id: "hopkins",
  name: "Johns Hopkins University",
  shortName: "Johns Hopkins",
  tagline: "Knowledge for the World • America's First Research University",
  mascot: "Blue Jays",
  mascotEmoji: "🐦",
  location: "Baltimore, Maryland (Homewood Campus)",
  primaryColor: "blue-700",
  primaryBg: "bg-blue-700",
  primaryText: "text-blue-700",
  primaryBorder: "border-blue-700",
  accentGradient: "from-blue-700 via-blue-800 to-sky-500",
  heroImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80",
  stats: {
    enrolledStudents: "28,000+",
    activeClubs: "400+",
    transitRoutes: "9 Homewood & East Baltimore Shuttles",
    diningOpen: "Hopkins Cafe & FFC",
  },
  featuredBuildings: [
    { id: "jb1", name: "Brody Learning Commons", code: "BLC", type: "Library", floors: 5, hours: "Open 24/7", status: "Open Now", popularFor: "Glass study cubes, conservatory atrium & quiet research" },
    { id: "jb2", name: "Milton S. Eisenhower Library", code: "MSE", type: "Library", floors: 6, hours: "Open 24/7", status: "Open Now", popularFor: "Special collections, rare manuscripts & humanities stacks" },
    { id: "jb3", name: "Malone Hall (CS & Robotics)", code: "MLN", type: "Academic", floors: 4, hours: "7:00 AM - 11:00 PM", status: "Open Now", popularFor: "LCSR surgical robotics, language & cybersecurity lab" },
    { id: "jb4", name: "Gilman Hall", code: "GIL", type: "Academic", floors: 4, hours: "7:30 AM - 9:30 PM", status: "Open Now", popularFor: "Historic clock tower, humanities classrooms & archaeology museum" },
    { id: "jb5", name: "Ralph S. O'Connor Center", code: "O'CON", type: "Athletics", floors: 3, hours: "6:00 AM - 11:00 PM", status: "Open Now", popularFor: "Climbing wall, varsity gym, lap pool & squash courts" },
    { id: "jb6", name: "Fresh Food Cafe (FFC)", code: "FFC", type: "Dining", floors: 2, hours: "7:00 AM - 9:00 PM", status: "Open Now", popularFor: "All-you-care-to-eat organic farm-to-table cuisine" },
  ],
  shuttleRoutes: [
    { id: "j-blue", name: "Homewood - Peabody - JHMI Express", routeColor: "#1d4ed8", nextArrival: "3 mins", stopsCount: 8, frequency: "Every 8 mins", status: "On Time", driverStatus: "Active • Unit 501" },
    { id: "j-night", name: "Night Ride Homewood Escort", routeColor: "#0284c7", nextArrival: "5 mins", stopsCount: 12, frequency: "On Demand", status: "On Time", driverStatus: "Active • Unit 104" },
  ],
  parkingGarages: [
    { name: "San Martin Garage", occupancyPct: 68, availableSpots: 340, permitRequired: "Homewood Permit" },
    { name: "South Garage (Mason Hall)", occupancyPct: 84, availableSpots: 80, permitRequired: "Visitor & Faculty Permit" },
  ],
  diningHalls: [
    { name: "Hopkins Cafe", location: "Charles Commons 2nd Floor", hours: "7:00 AM - 9:00 PM", mealPeriod: "Lunch", status: "Open", capacityPct: 70, popularStation: "Fresh Mediterranean & Wok" },
    { name: "Levering Kitchens", location: "Levering Hall", hours: "11:00 AM - 8:00 PM", mealPeriod: "Lunch", status: "Open", capacityPct: 82, popularStation: "Custom Burrito & Grill" },
  ],
  courses: [
    { code: "EN.601.428", title: "Neurosymbolic AI & Machine Learning", credits: 3, instructor: "Dr. Benjamin Van Durme", instructorEmail: "vandurme@jhu.edu", schedule: "Tue / Thu · 10:30 AM", room: "228", building: "Malone Hall", nextAssignment: "LLM Hallucination Benchmark Project", dueDate: "Thursday", officeHours: "Tue 2-4 PM", classmatesCount: 48 },
    { code: "EN.580.421", title: "Principles of Neuroengineering", credits: 3, instructor: "Dr. Nitish Thakor", instructorEmail: "nthakor@jhu.edu", schedule: "Mon / Wed · 1:30 PM", room: "110", building: "Clark Hall", nextAssignment: "Neural Prosthetics Signal Processing", dueDate: "Friday", officeHours: "Wed 3-5 PM", classmatesCount: 35 },
  ],
  events: [
    { id: "je-1", title: "JHU MedTech & AI Venture Showcase", organization: "Hopkins FastForward & Tech Ventures", category: "Career", date: "Wednesday, April 8", time: "1:00 PM - 5:00 PM", location: "Mason Hall Auditorium", attendeesCount: 420, image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80" },
    { id: "je-2", title: "Blue Jays Men's Lacrosse vs. Syracuse", organization: "Johns Hopkins Athletics", category: "Athletics", date: "Saturday, April 11", time: "2:00 PM", location: "Homewood Field", attendeesCount: 8500, image: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=600&auto=format&fit=crop&q=80" },
  ],
  posts: [
    { id: "jp1", author: "Dr. Sarah Chen", major: "Biomedical Engineering '26", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", timeAgo: "1h ago", content: "Brody Learning Commons Level B quiet reading room is open. Coffee available at Daily Grind on Level Q! ☕📚", likes: 45, commentsCount: 7, tag: "Campus Life" },
  ],
  housing: [
    { id: "jh1", title: "The Academy on Charles — 2 Bed / 2 Bath", rentPerMonth: 1290, beds: 2, baths: 2, distanceFromCampus: "0.1 miles (Directly across Homewood)", address: "3100 St Paul St, Baltimore, MD", furnished: true, utilitiesIncluded: true, availableSemester: "Summer / Fall 2026", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80" },
  ],
  marketplace: [
    { id: "jm1", title: "Molecular Biology of the Cell (Alberts 7th Ed)", price: 65, seller: "Elena R.", category: "Textbooks", condition: "Like New", timeAgo: "4h ago", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80" },
  ]
};
