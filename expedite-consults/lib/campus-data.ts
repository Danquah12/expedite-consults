// lib/campus-data.ts
// Comprehensive domain models and seed dataset for The Campus Operating Platform

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  studentId: string;
  major: string;
  minor?: string;
  gradYear: number;
  classStanding: "Freshman" | "Sophomore" | "Junior" | "Senior" | "Graduate";
  dormBuilding: string;
  bio: string;
  avatar: string;
  coverImage?: string;
  isVerified: boolean;
  role: "STUDENT" | "CLUB_LEAD" | "FACULTY" | "ADMIN";
  interests: string[];
  goals: string[];
  eventsAttendedCount: number;
  volunteerHoursLogged: number;
  leadershipRoles: string[];
  achievements: string[];
  projects: string[];
}

export interface CampusReel {
  id: string;
  title: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  videoUrl: string;
  thumbnailUrl: string;
  audioTrack: string;
  duration: string;
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  isSaved: boolean;
  resolution: "1080p" | "720p" | "480p";
  category: "Robotics" | "Cybersecurity" | "Campus Life" | "Athletics";
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CampusGame {
  id: string;
  title: string;
  category: "Trivia" | "Chess" | "Quiz" | "Puzzle";
  description: string;
  icon: string;
  highScore: number;
  activePlayersCount: number;
  questions: TriviaQuestion[];
  leaderboard: { rank: number; studentName: string; score: number; major: string; avatar: string }[];
}

export interface CampusNotification {
  id: string;
  type: "SOCIAL" | "ORG" | "EVENT" | "ACTIVITY" | "MESSAGE" | "SYSTEM";
  title: string;
  body: string;
  timeAgo: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface NotificationPreferences {
  pushMessages: boolean;
  pushEventReminders: boolean;
  pushOrgAnnouncements: boolean;
  pushSocialLikes: boolean;
  emailImportantAnnouncements: boolean;
  emailSocialDigest: boolean;
}

export interface ContentReport {
  id: string;
  entityId: string;
  entityType: "POST" | "REEL" | "COMMENT";
  reason: "Spam" | "Harassment" | "Academic Dishonesty" | "Inappropriate";
  details: string;
  reporterId: string;
  timestamp: string;
}

export interface LiveCampusActivity {
  id: string;
  title: string;
  location: string;
  attendeesCount: number;
  category: "Sports" | "Workshop" | "Career" | "Governance" | "Volunteering";
  statusText: string;
  icon: string;
  linkTab: "events" | "activities" | "messages";
}

export interface PeerMatch {
  id: string;
  name: string;
  major: string;
  year: string;
  avatar: string;
  compatibilityScore: number;
  interests: string[];
  goals: string[];
  sharedReason: string;
  isConnected: boolean;
}

export interface QuickGroup {
  id: string;
  name: string;
  purpose: string;
  creator: string;
  membersCount: number;
  expirationDate: string;
  isJoined: boolean;
}

export interface CampusOpportunity {
  id: string;
  title: string;
  type: "Job / Work-Study" | "Paid Research" | "Scholarship" | "Hackathon" | "Fellowship";
  departmentOrOrg: string;
  rewardOrPay: string;
  deadline: string;
  description: string;
  matchReason: string;
  hasApplied: boolean;
}

export interface CampusServiceRequest {
  id: string;
  ticketNumber: string;
  category: "Wi-Fi & Network" | "Classroom AV" | "Lighting & Electrical" | "Facilities & Restroom";
  location: string;
  description: string;
  status: "Submitted" | "Assigned" | "In Progress" | "Resolved";
  submittedTime: string;
}

export interface EventMemory {
  id: string;
  eventTitle: string;
  date: string;
  attendeesCount: number;
  projectsBuiltCount: number;
  photosCount: number;
  aiGeneratedRecap: string;
  bannerUrl: string;
}

export interface OfficeHourSlot {
  id: string;
  professorName: string;
  professorAvatar: string;
  department: string;
  officeLocation: string;
  dateDay: string;
  timeRange: string;
  slots: { id: string; time: string; isBooked: boolean; bookedBy?: string }[];
}

export interface CampusAlert {
  id: string;
  title: string;
  message: string;
  level: "NORMAL" | "IMPORTANT" | "URGENT" | "EMERGENCY";
  department: string;
  timeAgo: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface PostComment {
  id: string;
  authorId: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
  likesCount?: number;
}

export interface CampusPost {
  id: string;
  authorId: string;
  authorName: string;
  authorMajor: string;
  authorAvatar: string;
  clubName?: string;
  scope: "CAMPUS_WIDE" | "CLUB" | "DEPARTMENT";
  location: string;
  content: string;
  imageUrl?: string;
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
  comments: PostComment[];
  timeAgo: string;
  isPinned?: boolean;
  createdAt: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  clubName: string;
  category: "Guest Speaker" | "Sports Game" | "Coding Workshop" | "Art Exhibition" | "Cultural Festival" | "Academic";
  location: string;
  buildingCode: string;
  dateMonth: string;
  dateDay: string;
  time: string;
  capacity: number;
  attendeesCount: number;
  userRsvp: "GOING" | "INTERESTED" | null;
  description: string;
  speakers?: { name: string; title: string; avatar: string }[];
  agenda?: { time: string; topic: string }[];
  imageUrl: string;
  recommendationReason?: string;
  createdAt: string;
}

export interface CampusClub {
  id: string;
  name: string;
  category: "Student Org" | "Academic" | "Cultural" | "Sports" | "Professional" | "Volunteer" | "Greek";
  membersCount: number;
  isJoined: boolean;
  president: string;
  description: string;
  logo: string;
  banner: string;
  nextEvent?: string;
  aboutText: string;
  leadership: { role: string; name: string; avatar: string }[];
  projects: { id: string; title: string; description: string; status: "In Progress" | "Recruiting" | "Completed"; lead: string }[];
  documents: { id: string; name: string; type: string; size: string; url: string }[];
}

export interface VolunteerShiftRole {
  id: string;
  name: string;
  spotsNeeded: number;
  spotsFilled: number;
  hoursCredit: number;
  isClaimed: boolean;
}

export interface VolunteerActivity {
  id: string;
  title: string;
  category: "Campus Cleanup" | "Food Drive" | "Orientation" | "Fundraiser" | "Community Service";
  organizer: string;
  organizerAvatar: string;
  location: string;
  date: string;
  description: string;
  progressPercent: number;
  goalMetric: string;
  currentMetric: string;
  tasks: string[];
  roles: VolunteerShiftRole[];
  status: "Recruiting" | "In Progress" | "Completed";
}

export interface ResearchOpportunity {
  id: string;
  title: string;
  professor: string;
  professorAvatar: string;
  department: string;
  labName: string;
  openingsGrad: number;
  openingsUndergrad: number;
  requiredSkills: string[];
  description: string;
  compensation: string;
  hasApplied: boolean;
  applicationStatus?: "Under Review" | "Interview Scheduled" | "Accepted";
}

export interface CampusJob {
  id: string;
  title: string;
  department: string;
  type: "Work-Study" | "Student Assistant" | "Graduate Assistant" | "Internship";
  payRate: string;
  hoursPerWeek: string;
  location: string;
  description: string;
  deadline: string;
  hasApplied: boolean;
}

export interface CourseStudyPod {
  id: string;
  courseCode: string;
  courseName: string;
  topic: string;
  roomLocation: string;
  meetingTime: string;
  maxMembers: number;
  currentMembers: number;
  organizer: string;
  organizerAvatar: string;
  isJoined: boolean;
}

export interface CampusCourse {
  id: string;
  code: string;
  name: string;
  professor: string;
  schedule: string;
  studentsEnrolled: number;
  studyGroupsCount: number;
  reviewSessionsCount: number;
  tutorsCount: number;
  isEnrolled: boolean;
  resources: { id: string; title: string; type: "Notes" | "Past Exam Review" | "Formula Sheet" | "Syllabus"; uploader: string; downloadsCount: number; size: string }[];
}

export interface CampusMediaItem {
  id: string;
  title: string;
  channelName: string;
  channelLogo: string;
  category: "Guest Lectures" | "Podcasts" | "Student Journalism" | "Athletics";
  duration: string;
  viewsCount: number;
  likesCount: number;
  thumbnailUrl: string;
  description: string;
  publishedDate: string;
}

export interface CampusPoll {
  id: string;
  question: string;
  organizer: string;
  scope: "Campus Wide" | "Student Gov" | "Class of 2027";
  totalVotes: number;
  userVotedOptionId?: string;
  options: { id: string; text: string; votes: number }[];
}

export interface MarketItem {
  id: string;
  title: string;
  price: number;
  category: "Textbooks" | "Dorm Gear" | "Electronics" | "Tutoring Service" | "Student Business";
  condition: string;
  seller: string;
  sellerMajor: string;
  imageUrl: string;
  status: "Available" | "Reserved" | "Sold";
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: string;
  avatar: string;
  text: string;
  time: string;
  isMe: boolean;
  createdAt: string;
}

export interface MapLocationPin {
  id: string;
  name: string;
  code: string;
  type: "event" | "study" | "food" | "dining" | "emergency";
  title: string;
  description: string;
  x: number;
  y: number;
  activityCount: string;
  hours: string;
  icon: string;
}

// 1. Initial Current User Profile
export const defaultCurrentUser: UserProfile = {
  id: "usr-kwesi-asiedu",
  name: "Kwesi Asiedu",
  email: "k.asiedu@state.edu",
  studentId: "#9412-IT-26",
  major: "Information Technology",
  minor: "Cybersecurity & Systems",
  gradYear: 2026,
  classStanding: "Junior",
  dormBuilding: "North Quad, West Hall #304",
  bio: "IT & Cybersecurity enthusiast. Student researcher in autonomous cyber defense loops. Treasurer of Cybersecurity Club.",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  isVerified: true,
  role: "STUDENT",
  interests: ["Cybersecurity", "AI", "Basketball", "Entrepreneurship"],
  goals: ["Find Study Partners", "Research Opportunities", "Project Partners"],
  eventsAttendedCount: 12,
  volunteerHoursLogged: 48,
  leadershipRoles: ["Cybersecurity Club — Treasurer", "AI Research Society — Lead Builder"],
  achievements: ["🏆 Hackathon 1st Place Finalist", "🏆 University Volunteer Recognition", "🏆 Trivia Champion"],
  projects: ["AI Security & Cyber Threat Detection", "Campus Distributed Mesh Network"],
};

// 2. Initial Campus Reels (Vertical Video Engine)
export const initialCampusReels: CampusReel[] = [
  {
    id: "reel-1",
    title: "Autonomous battlebot arena test run in Engineering Lab 204! 🤖🔥",
    creatorName: "Autonomous Robotics Society",
    creatorHandle: "@RoboticsSociety",
    creatorAvatar: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150&auto=format&fit=crop&q=80",
    videoUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
    audioTrack: "Original Sound — State Univ Robotics Lab",
    duration: "0:28",
    likesCount: 2450,
    isLiked: false,
    commentsCount: 183,
    sharesCount: 340,
    savesCount: 92,
    isSaved: false,
    resolution: "1080p",
    category: "Robotics",
  },
  {
    id: "reel-2",
    title: "Simulated live penetration test demo on our containerized honeypot cluster 🛡️💻",
    creatorName: "Cybersecurity Club",
    creatorHandle: "@CybersecurityClub",
    creatorAvatar: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80",
    videoUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    audioTrack: "Cyber Beats — Synth Defenses",
    duration: "0:42",
    likesCount: 1820,
    isLiked: true,
    commentsCount: 94,
    sharesCount: 210,
    savesCount: 140,
    isSaved: true,
    resolution: "1080p",
    category: "Cybersecurity",
  },
  {
    id: "reel-3",
    title: "Cultural Night dance rehearsal sneak peek for Friday! Don't miss it 🎉🌍",
    creatorName: "African Student Association",
    creatorHandle: "@ASA_State",
    creatorAvatar: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=150&auto=format&fit=crop&q=80",
    videoUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
    audioTrack: "Afrobeats Fusion — Festival Mix",
    duration: "0:35",
    likesCount: 3100,
    isLiked: false,
    commentsCount: 240,
    sharesCount: 520,
    savesCount: 88,
    isSaved: false,
    resolution: "1080p",
    category: "Campus Life",
  },
];

// 3. Initial Campus Games & Trivia Platform
export const initialCampusGames: CampusGame[] = [
  {
    id: "game-cyber-challenge",
    title: "Cybersecurity & Campus Tech Challenge",
    category: "Trivia",
    description: "5 rapid-fire questions on network defense, zero-day containment, and campus systems. Earn points for the semester leaderboard!",
    icon: "🛡️",
    highScore: 9420,
    activePlayersCount: 214,
    questions: [
      {
        id: "q1",
        question: "Which port does HTTPS standard traffic default to?",
        options: ["Port 80", "Port 443", "Port 22", "Port 8080"],
        correctIndex: 1,
        explanation: "HTTPS standard encrypted communication operates over TCP Port 443.",
      },
      {
        id: "q2",
        question: "What is a zero-day vulnerability?",
        options: [
          "A bug with 0 days of downtime",
          "A flaw discovered before a vendor patch is available",
          "A server operating without a reboot",
          "A password with 0 characters",
        ],
        correctIndex: 1,
        explanation: "Zero-day refers to security holes disclosed before developers have released a fix.",
      },
      {
        id: "q3",
        question: "Where is the 24/7 quiet study pod center located on campus?",
        options: ["Student Union", "Main Library Floors 2-4", "Engineering Lab", "North Dorm Hall"],
        correctIndex: 1,
        explanation: "Main Library floors 2-4 remain open 24/7 for midterm study sessions.",
      },
      {
        id: "q4",
        question: "What is the primary objective of a honeypot in network defense?",
        options: [
          "To speed up Wi-Fi bandwidth",
          "To lure and analyze malicious attacker traffic",
          "To store student passwords",
          "To block spam emails only",
        ],
        correctIndex: 1,
        explanation: "Honeypots are decoy servers designed to trap and monitor unauthorized access attempts.",
      },
      {
        id: "q5",
        question: "Which student organization hosts the annual Collegiate Cyber Defense practice?",
        options: ["Debate Society", "Cybersecurity & InfoSec Club", "Chess Guild", "Business Council"],
        correctIndex: 1,
        explanation: "The Cybersecurity & InfoSec Club leads CCDC competition testbeds.",
      },
    ],
    leaderboard: [
      { rank: 1, studentName: "Kwesi Asiedu", score: 9420, major: "Information Technology", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
      { rank: 2, studentName: "Maya Chen", score: 8920, major: "Computer Science", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
      { rank: 3, studentName: "Liam Vance", score: 8410, major: "Information Systems", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80" },
      { rank: 4, studentName: "Tyler Stone", score: 7850, major: "Computer Science", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
    ],
  },
];

// 4. Initial Campus Notifications (Central Notification Center)
export const initialCampusNotifications: CampusNotification[] = [
  {
    id: "notif-1",
    type: "EVENT",
    title: "AI Security Keynote Starts in 2 Hours",
    body: "Dr. Marcus Vance's keynote in Student Union Auditorium begins at 5:00 PM. Your QR pass is ready.",
    timeAgo: "20m ago",
    isRead: false,
    actionUrl: "events",
  },
  {
    id: "notif-2",
    type: "ORG",
    title: "African Student Association Announcement",
    body: "Amara Diallo posted: Cultural Night volunteer schedule has been finalized!",
    timeAgo: "1h ago",
    isRead: false,
    actionUrl: "organizations",
  },
  {
    id: "notif-3",
    type: "SOCIAL",
    title: "Maya Chen liked your post",
    body: "Maya Chen and 3 others upvoted your project update.",
    timeAgo: "2h ago",
    isRead: true,
    actionUrl: "home",
  },
  {
    id: "notif-4",
    type: "ACTIVITY",
    title: "Volunteer Shift Confirmed",
    body: "You are confirmed for Food Drive Distribution & Packing (Saturday, 9 AM). +4 hours.",
    timeAgo: "3h ago",
    isRead: true,
    actionUrl: "activities",
  },
  {
    id: "notif-5",
    type: "SYSTEM",
    title: "SGA $10,000 Budget Ballot Open",
    body: "Public campus poll for Student Government funding allocation is now accepting votes.",
    timeAgo: "5h ago",
    isRead: true,
    actionUrl: "home",
  },
];

// 5. Initial Notification Preferences
export const defaultNotificationPreferences: NotificationPreferences = {
  pushMessages: true,
  pushEventReminders: true,
  pushOrgAnnouncements: true,
  pushSocialLikes: false,
  emailImportantAnnouncements: true,
  emailSocialDigest: false,
};

// 6. Initial Live Activities (🔴 LIVE ON CAMPUS)
export const initialLiveActivities: LiveCampusActivity[] = [
  {
    id: "live-1",
    title: "Varsity Basketball vs Metro Tech",
    location: "Varsity Arena",
    attendeesCount: 1200,
    category: "Sports",
    statusText: "4th Quarter • Tie Game (72-72)",
    icon: "🏀",
    linkTab: "events",
  },
  {
    id: "live-2",
    title: "Autonomous LLM Agent Workshop",
    location: "Engineering Lab 102",
    attendeesCount: 84,
    category: "Workshop",
    statusText: "Hands-on coding session",
    icon: "💻",
    linkTab: "events",
  },
  {
    id: "live-3",
    title: "Campus Food Drive & Pantry Packing",
    location: "Union Loading Dock",
    attendeesCount: 31,
    category: "Volunteering",
    statusText: "31 active student volunteers",
    icon: "🤝",
    linkTab: "activities",
  },
  {
    id: "live-4",
    title: "Student Government Budget Senate",
    location: "Senate Chamber 204",
    attendeesCount: 62,
    category: "Governance",
    statusText: "Public floor debate",
    icon: "🗳️",
    linkTab: "events",
  },
];

// 7. Initial Peer Matches ("FIND MY PEOPLE")
export const initialPeerMatches: PeerMatch[] = [
  {
    id: "peer-1",
    name: "Maya Chen",
    major: "Computer Science",
    year: "Senior",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    compatibilityScore: 96,
    interests: ["Cybersecurity", "AI", "CTF Competitions"],
    goals: ["Find Study Partners", "Research Opportunities"],
    sharedReason: "Both taking CMSC 421 and members of Cybersecurity Club",
    isConnected: false,
  },
  {
    id: "peer-2",
    name: "Liam Vance",
    major: "Information Systems",
    year: "Junior",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    compatibilityScore: 91,
    interests: ["Entrepreneurship", "Basketball", "Cloud Architecture"],
    goals: ["Project Partners", "Find Friends"],
    sharedReason: "Both interested in Entrepreneurship & frequent Student Center gym",
    isConnected: true,
  },
];

// 8. Initial Quick Temporary Groups
export const initialQuickGroups: QuickGroup[] = [
  {
    id: "qg-1",
    name: "AI Hackathon Autonomous Defense Team",
    purpose: "Build our zero-day containment agent for the Spring Hackathon",
    creator: "Kwesi Asiedu",
    membersCount: 4,
    expirationDate: "Expires May 15, 2026 (End of Semester)",
    isJoined: true,
  },
];

// 9. Initial Opportunities
export const initialCampusOpportunities: CampusOpportunity[] = [
  {
    id: "opp-1",
    title: "AI Autonomous Cyber Defense Research Fellowship",
    type: "Paid Research",
    departmentOrOrg: "Autonomous Security & Systems Lab (ASSL)",
    rewardOrPay: "$22.00 / hr + 3 Credits",
    deadline: "Mar 15, 2026",
    description: "Paid undergraduate research position developing automated closed-loop defense agents under Dr. Catherine Hayes.",
    matchReason: "Matches your Major (IT), Cybersecurity interest, and Python skills",
    hasApplied: true,
  },
  {
    id: "opp-2",
    title: "State University $10,000 Spring Hackathon Prize",
    type: "Hackathon",
    departmentOrOrg: "College of Engineering & IT",
    rewardOrPay: "$10,000 Prize Pool",
    deadline: "Apr 04, 2026",
    description: "48-hour campus hackathon with tracks in AI, Cybersecurity, HealthTech, and Sustainability.",
    matchReason: "Recommended because you are a Hackathon 1st Place Finalist",
    hasApplied: false,
  },
];

// 10. Initial Campus 311 Service Requests
export const initialServiceRequests: CampusServiceRequest[] = [
  {
    id: "req-1",
    ticketNumber: "#311-8492",
    category: "Wi-Fi & Network",
    location: "Main Library 3rd Floor Pods",
    description: "High packet loss and dropouts on eduroam Wi-Fi SSID near Pod B.",
    status: "In Progress",
    submittedTime: "2 hours ago",
  },
];

// 11. Initial Event Memories
export const initialEventMemories: EventMemory[] = [
  {
    id: "mem-1",
    eventTitle: "Annual Spring AI Hackathon 2026",
    date: "February 22, 2026",
    attendeesCount: 184,
    projectsBuiltCount: 32,
    photosCount: 426,
    aiGeneratedRecap:
      "Over 184 students converged in the Student Center for 12 hours of rapid prototyping. 32 completed projects were demoed across autonomous security, campus sustainability, and accessible transit. Team 'CyberPulse' took first place with their automated honeypot mesh.",
    bannerUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80",
  },
];

// 12. Initial Office Hours
export const initialOfficeHours: OfficeHourSlot[] = [
  {
    id: "oh-1",
    professorName: "Dr. Catherine Hayes",
    professorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    department: "Department of Computer Science & IT",
    officeLocation: "Engineering Hall Rm 312",
    dateDay: "Monday, Mar 03",
    timeRange: "2:00 PM - 4:00 PM (15-min slots)",
    slots: [
      { id: "s1", time: "2:00 PM - 2:15 PM", isBooked: true, bookedBy: "Liam Vance" },
      { id: "s2", time: "2:15 PM - 2:30 PM", isBooked: false },
      { id: "s3", time: "2:30 PM - 2:45 PM", isBooked: false },
      { id: "s4", time: "2:45 PM - 3:00 PM", isBooked: true, bookedBy: "Kwesi Asiedu" },
    ],
  },
];

// 13. Initial Campus Emergency / Important Alerts
export const initialCampusAlerts: CampusAlert[] = [
  {
    id: "alt-1",
    level: "IMPORTANT",
    title: "Student Government $10,000 Budget Allocation Poll Open",
    message: "Cast your vote on how campus recreational and technology funding should be distributed for next term.",
    department: "Student Affairs & SGA",
    timeAgo: "1 hour ago",
    actionLabel: "Vote in Poll",
    actionUrl: "poll",
  },
];

// 14. Initial Posts
export const initialCampusPosts: CampusPost[] = [
  {
    id: "p1",
    authorId: "org-asa",
    authorName: "African Student Association",
    authorMajor: "Cultural Student Org",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    clubName: "African Student Association",
    scope: "CAMPUS_WIDE",
    location: "Student Center Main Hall",
    content:
      "🎉 Cultural Night is this Friday at 7:00 PM! Experience live music, traditional cuisine, cultural dances, and community performances. Free admission for all students and guests.",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
    likesCount: 94,
    isLiked: false,
    commentsCount: 8,
    comments: [
      { id: "c1", authorId: "u2", author: "Kwesi Asiedu", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", text: "Can't wait! The food lineup looks incredible.", time: "15m ago" },
    ],
    timeAgo: "1 hour ago",
    isPinned: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "p2",
    authorId: "club-cs",
    authorName: "Computer Science Club",
    authorMajor: "Academic & Technology",
    authorAvatar: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80",
    clubName: "Computer Science Club",
    scope: "CLUB",
    location: "Engineering Lab 102",
    content:
      "📚 Hands-on AI Workshop tomorrow at 5:00 PM! We will build LLM agent workflows and explore cybersecurity defense loops. 35 students already attending. Bring your laptops!",
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80",
    likesCount: 64,
    isLiked: true,
    commentsCount: 3,
    comments: [],
    timeAgo: "2 hours ago",
    createdAt: new Date().toISOString(),
  },
];

// 15. Initial Events
export const initialCampusEvents: CampusEvent[] = [
  {
    id: "ev-1",
    title: "Keynote: Autonomous AI & Cyber Defense Architectures",
    clubName: "Cybersecurity Club & CS Dept",
    category: "Guest Speaker",
    location: "Student Union Auditorium",
    buildingCode: "SU-AUD",
    dateMonth: "MAR",
    dateDay: "03",
    time: "Tuesday, 5:00 PM - 6:30 PM",
    capacity: 250,
    attendeesCount: 184,
    userRsvp: "GOING",
    recommendationReason: "Recommended because you follow Cybersecurity Club & attended 2 AI events",
    description: "Distinguished guest lecture on autonomous loop defense systems and generative security models.",
    speakers: [
      { name: "Dr. Marcus Vance", title: "Principal AI Security Architect, DARPA Lab", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" }
    ],
    agenda: [
      { time: "5:00 PM", topic: "Opening remarks & speaker introduction" },
      { time: "5:15 PM", topic: "Keynote presentation: Zero-Day Loop Defenses" },
    ],
    imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
];

// 16. Initial Organizations
export const initialCampusClubs: CampusClub[] = [
  {
    id: "org-asa",
    name: "African Student Association",
    category: "Cultural",
    membersCount: 220,
    isJoined: true,
    president: "Amara Diallo (Senior, Business)",
    description: "Celebrating African cultures, fostering student unity, community service, and academic excellence.",
    logo: "🌍",
    banner: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80",
    nextEvent: "Cultural Night (Friday, 7 PM)",
    aboutText: "The African Student Association provides a welcoming space for cultural exchange, mentoring, professional networking, and social activities across campus.",
    leadership: [
      { role: "President", name: "Amara Diallo", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" },
      { role: "Vice President", name: "Kwesi Asiedu", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
    ],
    projects: [
      { id: "p1", title: "Pan-African Library Book Drive", description: "Collecting 500 STEM textbooks for youth outreach programs.", status: "In Progress", lead: "Amara Diallo" },
    ],
    documents: [
      { id: "d1", name: "ASA Constitution & Bylaws 2026.pdf", type: "PDF", size: "1.2 MB", url: "#" },
    ],
  },
  {
    id: "org-cyber",
    name: "Cybersecurity & InfoSec Club",
    category: "Academic",
    membersCount: 195,
    isJoined: true,
    president: "Maya Chen (Senior, CS)",
    description: "Competing in Collegiate Cyber Defense Competitions (CCDC), CTFs, and ethical hacking workshops.",
    logo: "🛡️",
    banner: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    nextEvent: "Capture The Flag Practice (Thu 6 PM)",
    aboutText: "We prepare students for industry careers in security architecture, penetration testing, digital forensics, and network operations.",
    leadership: [
      { role: "President", name: "Maya Chen", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
      { role: "Treasurer", name: "Kwesi Asiedu", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" }
    ],
    projects: [
      { id: "p3", title: "Autonomous Honeypot Cluster", description: "Deploying containerized traps to analyze live campus scan traffic.", status: "In Progress", lead: "Kwesi Asiedu" }
    ],
    documents: [
      { id: "d3", name: "CCDC Competition Blueprint.pdf", type: "PDF", size: "2.8 MB", url: "#" }
    ],
  },
];

// 17. Initial Volunteer Activities
export const initialVolunteerActivities: VolunteerActivity[] = [
  {
    id: "vol-1",
    title: "Campus Food Drive & Pantry Distribution",
    category: "Food Drive",
    organizer: "Student Community Service Council",
    organizerAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    location: "Student Union North Loading Dock",
    date: "Saturday, Mar 08 • 9:00 AM - 3:00 PM",
    description: "Organizing 3,000 lbs of packaged food and fresh produce for commuter students and regional food banks.",
    progressPercent: 65,
    goalMetric: "32 Volunteers",
    currentMetric: "21 Registered",
    tasks: ["Unload delivery trucks", "Sort produce & canned items", "Package family boxes", "Check in student recipients"],
    status: "Recruiting",
    roles: [
      { id: "r1", name: "Shift Coordinator", spotsNeeded: 2, spotsFilled: 2, hoursCredit: 6, isClaimed: false },
      { id: "r2", name: "Loading & Setup", spotsNeeded: 8, spotsFilled: 6, hoursCredit: 4, isClaimed: false },
      { id: "r3", name: "Distribution & Packing", spotsNeeded: 15, spotsFilled: 10, hoursCredit: 4, isClaimed: true },
    ],
  },
];

// 18. Initial Research Opportunities
export const initialResearchProjects: ResearchOpportunity[] = [
  {
    id: "res-1",
    title: "Autonomous Cyber Defense Loops & Zero-Day Containment",
    professor: "Dr. Catherine Hayes",
    professorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    department: "Computer Science & Information Tech",
    labName: "Autonomous Security & Systems Lab (ASSL)",
    openingsGrad: 2,
    openingsUndergrad: 1,
    requiredSkills: ["Python", "Machine Learning", "Cybersecurity", "Docker"],
    description: "Developing automated closed-loop defense agents capable of detecting and isolating anomalous network traffic.",
    compensation: "Paid ($22/hr) or 3 Academic Credits",
    hasApplied: true,
    applicationStatus: "Interview Scheduled",
  },
];

// 19. Initial Campus Jobs
export const initialCampusJobs: CampusJob[] = [
  {
    id: "job-1",
    title: "Student IT Systems Support Specialist",
    department: "University Information Technology Services",
    type: "Work-Study",
    payRate: "$18.50 / hr",
    hoursPerWeek: "15 - 20 hrs",
    location: "IT Helpdesk, Science Complex Rm 104",
    description: "Assisting students and faculty with network connectivity, campus SSO authentication, hardware diagnostics, and classroom AV setups.",
    deadline: "Mar 15, 2026",
    hasApplied: false,
  },
];

// 20. Initial Study Pods & Courses
export const initialStudyPods: CourseStudyPod[] = [
  {
    id: "pod-1",
    courseCode: "CMSC 421",
    courseName: "Operating Systems",
    topic: "Virtual Memory & Paging Exam Prep",
    roomLocation: "Main Library 3rd Floor, Pod B",
    meetingTime: "Today at 4:30 PM",
    maxMembers: 6,
    currentMembers: 4,
    organizer: "Kwesi Asiedu",
    organizerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    isJoined: true,
  },
];

export const initialCampusCourses: CampusCourse[] = [
  {
    id: "crs-1",
    code: "CMSC 421",
    name: "Operating Systems & Kernel Architecture",
    professor: "Dr. Catherine Hayes",
    schedule: "Mon/Wed 10:00 AM - 11:30 AM • Hall B",
    studentsEnrolled: 342,
    studyGroupsCount: 12,
    reviewSessionsCount: 3,
    tutorsCount: 7,
    isEnrolled: true,
    resources: [
      { id: "r1", title: "CMSC 421 Midterm Study Guide 2026.pdf", type: "Past Exam Review", uploader: "Dr. Hayes", downloadsCount: 248, size: "1.4 MB" },
    ],
  },
];

// 21. Initial Campus Media Items
export const initialCampusMedia: CampusMediaItem[] = [
  {
    id: "med-1",
    title: "Keynote Lecture: Zero-Day Loops & Autonomous Cyber Defense",
    channelName: "Department of Computer Science & Cybersecurity",
    channelLogo: "🛡️",
    category: "Guest Lectures",
    duration: "48:20",
    viewsCount: 1420,
    likesCount: 180,
    thumbnailUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80",
    description: "Dr. Marcus Vance (DARPA Lab) presents autonomous loop defense systems, live containment architectures, and AI vulnerability analysis.",
    publishedDate: "2 days ago",
  },
];

// 22. Initial Campus Polls
export const initialCampusPolls: CampusPoll[] = [
  {
    id: "poll-1",
    question: "Where should Student Government allocate the $10,000 spring surplus budget?",
    organizer: "Student Government Association (SGA)",
    scope: "Campus Wide",
    totalVotes: 842,
    userVotedOptionId: "opt-1",
    options: [
      { id: "opt-1", text: "A. Student Events & Cultural Festivals", votes: 380 },
      { id: "opt-2", text: "B. Recreation & Fitness Upgrades", votes: 190 },
      { id: "opt-3", text: "C. Campus Technology & Laptop Grants", votes: 172 },
      { id: "opt-4", text: "D. Student Club Funding Pool", votes: 100 },
    ],
  },
];

// 23. Initial Marketplace Items
export const initialMarketplaceItems: MarketItem[] = [
  {
    id: "m1",
    title: "Operating Systems: Three Easy Pieces (Hardcover)",
    price: 35,
    category: "Textbooks",
    condition: "Like New • Clean margins",
    seller: "Tyler Stone",
    sellerMajor: "CS Senior",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80",
    status: "Available",
  },
];

// 24. Initial Chat Messages
export const initialChatMessages: ChatMessage[] = [
  {
    id: "1",
    conversationId: "#general-announcements",
    sender: "Dean of Student Affairs",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    text: "📢 Reminder: Campus Spring Career Fair registration closes Friday at 5:00 PM. 120+ employers registered.",
    time: "2:00 PM",
    isMe: false,
    createdAt: new Date().toISOString(),
  },
];
