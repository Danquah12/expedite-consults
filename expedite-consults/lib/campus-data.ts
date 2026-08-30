// lib/campus-data.ts
// Comprehensive domain models and seed dataset for The Campus Operating Platform
// Specializing in Towson University (TU) Digital Campus & Geographic Engine

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
  isLocationSharing?: boolean;
  locationShareExpiresAt?: string;
  activeCircleIds?: string[];
  ghostModeEnabled?: boolean;
  currentLocationName?: string;
}

export interface TowsonRoom {
  id: string;
  roomNumber: string;
  name: string;
  type: "Classroom" | "Lab" | "Study Pod" | "Auditorium" | "Restroom" | "Office" | "Lounge";
  capacity: number;
  hasAV: boolean;
  status: "Available" | "Class in Session" | "Reserved";
  currentClassOrEvent?: string;
}

export interface TowsonFloor {
  floorNumber: number;
  floorName: string;
  roomsCount: number;
  studySpacesCount: number;
  restrooms: string[];
  elevators: string[];
  emergencyExits: string[];
  rooms: TowsonRoom[];
}

export interface TowsonBuilding {
  id: string;
  name: string;
  code: string;
  shortCode: string;
  category: "Academic" | "Library" | "Student Life" | "Athletics" | "Dining" | "Residential" | "Administration";
  description: string;
  x: number; // Map percentage coordinate (0-100)
  y: number; // Map percentage coordinate (0-100)
  distanceFt: number;
  openHours: string;
  isOpenNow: boolean;
  occupancyPercent: number;
  todayEventsCount: number;
  studySpacesCount: number;
  classroomsCount: number;
  accessibleEntrance: string;
  floorsCount: number;
  floors: TowsonFloor[];
  image: string;
  icon: string;
}

export interface CircleMember {
  id: string;
  name: string;
  avatar: string;
  major: string;
  status: "on_campus" | "in_class" | "studying" | "offline";
  currentBuilding: string;
  currentFloor?: string;
  distanceFt: number;
  x: number;
  y: number;
  batteryPercent: number;
  lastUpdated: string;
  isSharingLocation: boolean;
}

export interface LocationCircle {
  id: string;
  name: string;
  icon: string;
  category: "Club" | "Study Group" | "Friends" | "Event Team" | "Dorm / Roommates";
  membersCount: number;
  activeSharingCount: number;
  members: CircleMember[];
  isUserMember: boolean;
}

export interface TowsonShuttle {
  id: string;
  routeName: string;
  routeColor: string;
  busNumber: string;
  nextStop: string;
  etaMinutes: number;
  occupancyStatus: "Seats Available" | "Standing Room" | "Full";
  currentCoordinates: { x: number; y: number };
  routePath: { x: number; y: number }[];
}

export interface TowsonParkingGarage {
  id: string;
  name: string;
  code: string;
  totalSpaces: number;
  openSpaces: number;
  status: "Available" | "Limited" | "Full";
  permitTypes: string[];
  evChargingAvailable: number;
  accessibleSpaces: number;
  x: number;
  y: number;
}

export interface SafetyBeacon {
  id: string;
  name: string;
  type: "Blue Light Phone" | "AED" | "Police HQ" | "Health Center" | "SafeWalk Desk";
  locationDescription: string;
  x: number;
  y: number;
  distanceFt: number;
  status: "Operational" | "Dispatch Ready";
  emergencyPhone: string;
}

export interface ScavengerHuntCheckpoint {
  id: string;
  title: string;
  clue: string;
  landmark: string;
  points: number;
  x: number;
  y: number;
  qrCodeToken: string;
  isVisited: boolean;
  badgeReward: string;
}

export interface NavigationStep {
  stepNumber: number;
  instruction: string;
  detail: string;
  icon: "walk" | "building" | "elevator" | "stairs" | "turn_left" | "turn_right" | "arrive";
  distanceFt: number;
  isDetourAvoidance?: boolean;
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

export interface CourseDeliverable {
  id: string;
  title: string;
  dueText: string;
  dueHoursLeft: number;
  points: number;
  type: "Lab" | "Project" | "Quiz" | "Exam" | "Homework";
  isSubmitted: boolean;
  activeStudyPodsCount?: number;
}

export interface CampusCourse {
  id: string;
  code: string;
  name: string;
  professor: string;
  professorAvatar?: string;
  imageUrl?: string;
  credits?: number;
  grade?: string;
  room?: string;
  schedule: string;
  studentsEnrolled: number;
  studyGroupsCount: number;
  reviewSessionsCount: number;
  tutorsCount: number;
  isEnrolled: boolean;
  nextAssignment?: string;
  deliverables?: CourseDeliverable[];
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

// 1. Initial Current User Profile (Towson Tiger)
export const defaultCurrentUser: UserProfile = {
  id: "usr-kwesi-asiedu",
  name: "Kwesi Asiedu",
  email: "k.asiedu@students.towson.edu",
  studentId: "#08412-TU-26",
  major: "Information Technology",
  minor: "Cybersecurity & Systems",
  gradYear: 2026,
  classStanding: "Junior",
  dormBuilding: "West Village, Marshall Hall #412",
  bio: "TU Cybersecurity enthusiast. Student researcher in autonomous cyber defense loops. Treasurer of Towson Cybersecurity Club.",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  isVerified: true,
  role: "STUDENT",
  interests: ["Cybersecurity", "AI", "Basketball", "Entrepreneurship"],
  goals: ["Find Study Partners", "Research Opportunities", "Project Partners"],
  eventsAttendedCount: 12,
  volunteerHoursLogged: 48,
  leadershipRoles: ["Towson Cybersecurity Club — Treasurer", "AI Research Society — Lead Builder"],
  achievements: ["🏆 TU Hackathon 1st Place Finalist", "🏆 Division of Student Affairs Service Award", "🏆 Tiger Trivia Champion"],
  projects: ["AI Security & Cyber Threat Detection", "Towson Distributed Mesh Network"],
  isLocationSharing: false,
  ghostModeEnabled: false,
  currentLocationName: "Freedom Square (Near Cook Library)",
};

// 2. Towson University Campus Buildings Dataset (Authentic TU Landmarks)
export const initialTowsonBuildings: TowsonBuilding[] = [
  {
    id: "bld-sc",
    name: "Science Complex",
    code: "SC-300",
    shortCode: "SC",
    category: "Academic",
    description: "320,000 sq ft flagship facility with state-of-the-art cybersecurity labs, planetarium, observatory, and 50 research suites.",
    x: 62,
    y: 36,
    distanceFt: 420,
    openHours: "7:00 AM - 11:00 PM",
    isOpenNow: true,
    occupancyPercent: 68,
    todayEventsCount: 3,
    studySpacesCount: 28,
    classroomsCount: 42,
    accessibleEntrance: "Ground Floor Atrium (South Entrance Ramp)",
    floorsCount: 5,
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80",
    icon: "🔬",
    floors: [
      {
        floorNumber: 1,
        floorName: "1st Floor · Atrium & Planetarium",
        roomsCount: 12,
        studySpacesCount: 8,
        restrooms: ["Rm 102 (M)", "Rm 103 (W)", "Rm 104 (Gender Neutral)"],
        elevators: ["Elevator Bank A", "Freight Elevator B"],
        emergencyExits: ["South Atrium Exit", "East Courtyard Exit"],
        rooms: [
          { id: "sc-101", roomNumber: "SC 101", name: "Watson Planetarium & Lecture Hall", type: "Auditorium", capacity: 160, hasAV: true, status: "Available" },
          { id: "sc-104", roomNumber: "SC 104", name: "Undergraduate Science Commons", type: "Lounge", capacity: 45, hasAV: true, status: "Available" },
          { id: "sc-112", roomNumber: "SC 112", name: "Biochemistry Teaching Lab", type: "Lab", capacity: 28, hasAV: true, status: "Class in Session", currentClassOrEvent: "CHEM 310" },
        ],
      },
      {
        floorNumber: 2,
        floorName: "2nd Floor · Department Classrooms",
        roomsCount: 14,
        studySpacesCount: 6,
        restrooms: ["Rm 202 (M)", "Rm 203 (W)"],
        elevators: ["Elevator Bank A"],
        emergencyExits: ["North Stairwell", "South Stairwell"],
        rooms: [
          { id: "sc-204", roomNumber: "SC 204", name: "Interactive Computing Studio", type: "Classroom", capacity: 36, hasAV: true, status: "Available" },
          { id: "sc-215", roomNumber: "SC 215", name: "Applied Physics Lab", type: "Lab", capacity: 30, hasAV: true, status: "Reserved", currentClassOrEvent: "PHYS 241" },
        ],
      },
      {
        floorNumber: 3,
        floorName: "3rd Floor · Cybersecurity & CIS Labs",
        roomsCount: 16,
        studySpacesCount: 10,
        restrooms: ["Rm 302 (M)", "Rm 303 (W)", "Rm 308 (Gender Neutral)"],
        elevators: ["Elevator Bank A"],
        emergencyExits: ["North Stairwell", "South Stairwell", "Skybridge to Smith"],
        rooms: [
          { id: "sc-304", roomNumber: "SC 304", name: "Autonomous Systems & Cyber Defense Lab", type: "Lab", capacity: 32, hasAV: true, status: "Available", currentClassOrEvent: "Cybersecurity Club CTF Prep" },
          { id: "sc-314", roomNumber: "SC 314", name: "Dr. Catherine Hayes Research Suite", type: "Office", capacity: 8, hasAV: true, status: "Available" },
          { id: "sc-320", roomNumber: "SC 320", name: "Quiet Study Pod 3B (Dual Monitors)", type: "Study Pod", capacity: 6, hasAV: true, status: "Available" },
        ],
      },
      {
        floorNumber: 4,
        floorName: "4th Floor · Graduate Research Suites",
        roomsCount: 10,
        studySpacesCount: 4,
        restrooms: ["Rm 402 (M)", "Rm 403 (W)"],
        elevators: ["Elevator Bank A"],
        emergencyExits: ["North Stairwell", "South Stairwell"],
        rooms: [
          { id: "sc-402", roomNumber: "SC 402", name: "AI Neural Network Sandbox", type: "Lab", capacity: 20, hasAV: true, status: "Reserved" },
        ],
      },
    ],
  },
  {
    id: "bld-cook",
    name: "Albert S. Cook Library",
    code: "COOK-24",
    shortCode: "COOK",
    category: "Library",
    description: "Central 24/7 research hub with Starbucks cafe, tech checkout, silent study zones, and peer tutoring lounge.",
    x: 48,
    y: 44,
    distanceFt: 180,
    openHours: "Open 24/7 (Midterms & Finals)",
    isOpenNow: true,
    occupancyPercent: 88,
    todayEventsCount: 2,
    studySpacesCount: 65,
    classroomsCount: 8,
    accessibleEntrance: "Main Plaza Entrance (Automatic Doors)",
    floorsCount: 4,
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80",
    icon: "📚",
    floors: [
      {
        floorNumber: 1,
        floorName: "Floor 1 · Starbucks & Collaborative Cafe",
        roomsCount: 8,
        studySpacesCount: 20,
        restrooms: ["Floor 1 West"],
        elevators: ["Central Elevator Bank"],
        emergencyExits: ["South Plaza Exit"],
        rooms: [
          { id: "ck-101", roomNumber: "CK 101", name: "Starbucks Coffee & Seating", type: "Lounge", capacity: 80, hasAV: false, status: "Available" },
          { id: "ck-105", roomNumber: "CK 105", name: "Tech Checkout & Help Desk", type: "Office", capacity: 10, hasAV: true, status: "Available" },
        ],
      },
      {
        floorNumber: 2,
        floorName: "Floor 2 · Group Study Pods & Tutoring",
        roomsCount: 16,
        studySpacesCount: 25,
        restrooms: ["Floor 2 East"],
        elevators: ["Central Elevator Bank"],
        emergencyExits: ["East Stairwell", "West Stairwell"],
        rooms: [
          { id: "ck-204", roomNumber: "CK Pod B", name: "CMSC 421 Exam Study Pod", type: "Study Pod", capacity: 8, hasAV: true, status: "Available", currentClassOrEvent: "Reserved by Kwesi Asiedu" },
          { id: "ck-210", roomNumber: "CK 210", name: "Writing Center & Peer Tutors", type: "Lounge", capacity: 30, hasAV: true, status: "Available" },
        ],
      },
      {
        floorNumber: 3,
        floorName: "Floor 3 · Silent Individual Study Zone",
        roomsCount: 12,
        studySpacesCount: 20,
        restrooms: ["Floor 3 Central"],
        elevators: ["Central Elevator Bank"],
        emergencyExits: ["East Stairwell", "West Stairwell"],
        rooms: [
          { id: "ck-301", roomNumber: "CK 301", name: "Silent Study Carrels (No Talking)", type: "Study Pod", capacity: 60, hasAV: false, status: "Available" },
        ],
      },
    ],
  },
  {
    id: "bld-union",
    name: "University Union",
    code: "UNION-100",
    shortCode: "UNION",
    category: "Student Life",
    description: "Heart of campus life featuring Chick-fil-A, Dunkin', Bento Sushi, SGA Senate Chamber, student organization offices, and Tiger Esports Arena.",
    x: 38,
    y: 58,
    distanceFt: 350,
    openHours: "7:00 AM - Midnight",
    isOpenNow: true,
    occupancyPercent: 82,
    todayEventsCount: 5,
    studySpacesCount: 30,
    classroomsCount: 6,
    accessibleEntrance: "West Entrance via Union Garage Skybridge",
    floorsCount: 3,
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80",
    icon: "🍔",
    floors: [
      {
        floorNumber: 1,
        floorName: "Floor 1 · Dining Marketplace & Food Court",
        roomsCount: 10,
        studySpacesCount: 15,
        restrooms: ["Food Court Restrooms"],
        elevators: ["Main Union Elevator"],
        emergencyExits: ["Main North Plaza Exit", "Bus Loop Exit"],
        rooms: [
          { id: "un-101", roomNumber: "UN 101", name: "Towson Food Court (Chick-fil-A / Dunkin)", type: "Lounge", capacity: 300, hasAV: false, status: "Available" },
          { id: "un-108", roomNumber: "UN 108", name: "Tiger Esports & Gaming Arena", type: "Lab", capacity: 40, hasAV: true, status: "Available" },
        ],
      },
      {
        floorNumber: 2,
        floorName: "Floor 2 · Student Affairs & Club Hubs",
        roomsCount: 14,
        studySpacesCount: 10,
        restrooms: ["Floor 2 Restrooms"],
        elevators: ["Main Union Elevator"],
        emergencyExits: ["West Skybridge Stairwell"],
        rooms: [
          { id: "un-204", roomNumber: "UN 204", name: "SGA Senate Chamber", type: "Auditorium", capacity: 90, hasAV: true, status: "Reserved", currentClassOrEvent: "Student Government Senate Meeting" },
          { id: "un-212", roomNumber: "UN 212", name: "African Student Association Office", type: "Office", capacity: 15, hasAV: true, status: "Available" },
        ],
      },
    ],
  },
  {
    id: "bld-7800",
    name: "7800 York Road",
    code: "YORK-7800",
    shortCode: "YORK",
    category: "Academic",
    description: "Home of Computer and Information Sciences (CIS), Cybersecurity Defense Labs, and Software Engineering project rooms.",
    x: 76,
    y: 22,
    distanceFt: 680,
    openHours: "7:30 AM - 10:00 PM",
    isOpenNow: true,
    occupancyPercent: 54,
    todayEventsCount: 2,
    studySpacesCount: 18,
    classroomsCount: 24,
    accessibleEntrance: "Main York Road Entrance (East Ramp)",
    floorsCount: 3,
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    icon: "💻",
    floors: [
      {
        floorNumber: 2,
        floorName: "Floor 2 · CIS Cybersecurity Labs",
        roomsCount: 12,
        studySpacesCount: 8,
        restrooms: ["Rm 204 (M)", "Rm 205 (W)"],
        elevators: ["Elevator Bank 1"],
        emergencyExits: ["South Stairwell"],
        rooms: [
          { id: "yr-214", roomNumber: "YR 214", name: "Network Defense Penetration Lab", type: "Lab", capacity: 35, hasAV: true, status: "Available", currentClassOrEvent: "IT 350 Network Defense" },
        ],
      },
    ],
  },
  {
    id: "bld-burdick",
    name: "Burdick Hall & Rec Center",
    code: "BURDICK-REC",
    shortCode: "BURDICK",
    category: "Athletics",
    description: "Expanded fitness center with rock climbing wall, indoor turf gym, Olympic pool, and fitness studios.",
    x: 28,
    y: 68,
    distanceFt: 520,
    openHours: "6:00 AM - 11:00 PM",
    isOpenNow: true,
    occupancyPercent: 74,
    todayEventsCount: 2,
    studySpacesCount: 8,
    classroomsCount: 4,
    accessibleEntrance: "Ground Floor Main Desk Ramp",
    floorsCount: 3,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80",
    icon: "🏋️",
    floors: [],
  },
  {
    id: "bld-secu",
    name: "SECU Arena & Unitas Stadium",
    code: "SECU-ARENA",
    shortCode: "SECU",
    category: "Athletics",
    description: "5,200-seat premier sports arena hosting Division I Basketball, concerts, commencement, and major festivals.",
    x: 18,
    y: 82,
    distanceFt: 920,
    openHours: "Event Days & Game Nights",
    isOpenNow: true,
    occupancyPercent: 91,
    todayEventsCount: 1,
    studySpacesCount: 0,
    classroomsCount: 0,
    accessibleEntrance: "Gates 1 & 3 (Elevator to concourse)",
    floorsCount: 2,
    image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=600&auto=format&fit=crop&q=80",
    icon: "🏀",
    floors: [],
  },
  {
    id: "bld-west-village",
    name: "West Village Commons & Dining",
    code: "WV-COMMONS",
    shortCode: "WV",
    category: "Residential",
    description: "West Village student residential village featuring all-you-care-to-eat dining, Starbucks, convenience store, and Marshall Hall suites.",
    x: 15,
    y: 35,
    distanceFt: 780,
    openHours: "7:00 AM - 11:00 PM",
    isOpenNow: true,
    occupancyPercent: 62,
    todayEventsCount: 1,
    studySpacesCount: 22,
    classroomsCount: 4,
    accessibleEntrance: "North Bridge Entrance",
    floorsCount: 3,
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=80",
    icon: "🏡",
    floors: [],
  },
];

// 3. TigerOrbit 360 — Privacy-Preserving Campus Orbits & Circles
export const initialTowsonCircles: LocationCircle[] = [
  {
    id: "circle-cyber",
    name: "Towson Cybersecurity Club",
    icon: "🛡️",
    category: "Club",
    membersCount: 12,
    activeSharingCount: 8,
    isUserMember: true,
    members: [
      {
        id: "m-kwesi",
        name: "Kwesi Asiedu (You)",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        major: "IT Junior",
        status: "on_campus",
        currentBuilding: "Freedom Square / Cook Library",
        currentFloor: "Ground",
        distanceFt: 0,
        x: 48,
        y: 48,
        batteryPercent: 88,
        lastUpdated: "Just now",
        isSharingLocation: true,
      },
      {
        id: "m-maya",
        name: "Maya Chen",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        major: "CS Senior",
        status: "studying",
        currentBuilding: "Science Complex",
        currentFloor: "3rd Floor (Rm 304)",
        distanceFt: 420,
        x: 62,
        y: 36,
        batteryPercent: 94,
        lastUpdated: "2m ago",
        isSharingLocation: true,
      },
      {
        id: "m-liam",
        name: "Liam Vance",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
        major: "Info Systems",
        status: "on_campus",
        currentBuilding: "University Union",
        currentFloor: "Food Court",
        distanceFt: 350,
        x: 38,
        y: 58,
        batteryPercent: 72,
        lastUpdated: "1m ago",
        isSharingLocation: true,
      },
      {
        id: "m-tyler",
        name: "Tyler Stone",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        major: "CS Senior",
        status: "studying",
        currentBuilding: "Cook Library",
        currentFloor: "2nd Floor (Pod B)",
        distanceFt: 180,
        x: 48,
        y: 44,
        batteryPercent: 65,
        lastUpdated: "4m ago",
        isSharingLocation: true,
      },
    ],
  },
  {
    id: "circle-study",
    name: "CMSC 421 OS Study Pod",
    icon: "📚",
    category: "Study Group",
    membersCount: 4,
    activeSharingCount: 3,
    isUserMember: true,
    members: [
      {
        id: "m-kwesi",
        name: "Kwesi Asiedu (You)",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        major: "IT Junior",
        status: "on_campus",
        currentBuilding: "Cook Library Pod B",
        distanceFt: 0,
        x: 48,
        y: 48,
        batteryPercent: 88,
        lastUpdated: "Just now",
        isSharingLocation: true,
      },
      {
        id: "m-maya",
        name: "Maya Chen",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        major: "CS Senior",
        status: "studying",
        currentBuilding: "Science Complex",
        distanceFt: 420,
        x: 62,
        y: 36,
        batteryPercent: 94,
        lastUpdated: "2m ago",
        isSharingLocation: true,
      },
    ],
  },
  {
    id: "circle-roommates",
    name: "West Village Marshall Hall Suite",
    icon: "🏡",
    category: "Dorm / Roommates",
    membersCount: 4,
    activeSharingCount: 2,
    isUserMember: true,
    members: [
      {
        id: "m-kwesi",
        name: "Kwesi Asiedu",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        major: "IT Junior",
        status: "on_campus",
        currentBuilding: "Freedom Square",
        distanceFt: 0,
        x: 48,
        y: 48,
        batteryPercent: 88,
        lastUpdated: "Just now",
        isSharingLocation: true,
      },
      {
        id: "m-liam",
        name: "Liam Vance",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
        major: "Info Systems",
        status: "on_campus",
        currentBuilding: "University Union",
        distanceFt: 350,
        x: 38,
        y: 58,
        batteryPercent: 72,
        lastUpdated: "1m ago",
        isSharingLocation: true,
      },
    ],
  },
];

// 4. Towson University Live GPS Shuttles (Tiger Ride Routes)
export const initialTowsonShuttles: TowsonShuttle[] = [
  {
    id: "shuttle-gold",
    routeName: "Gold Route (Campus Loop)",
    routeColor: "#f59e0b",
    busNumber: "Tiger Bus #14",
    nextStop: "University Union Transit Plaza",
    etaMinutes: 2,
    occupancyStatus: "Seats Available",
    currentCoordinates: { x: 42, y: 52 },
    routePath: [
      { x: 38, y: 58 },
      { x: 48, y: 44 },
      { x: 62, y: 36 },
      { x: 15, y: 35 },
      { x: 18, y: 82 },
    ],
  },
  {
    id: "shuttle-black",
    routeName: "Black Route (Towson Town Center)",
    routeColor: "#0f172a",
    busNumber: "Tiger Bus #08",
    nextStop: "Cook Library North Stop",
    etaMinutes: 5,
    occupancyStatus: "Standing Room",
    currentCoordinates: { x: 55, y: 38 },
    routePath: [
      { x: 48, y: 44 },
      { x: 76, y: 22 },
      { x: 88, y: 15 },
    ],
  },
  {
    id: "shuttle-west",
    routeName: "West Village Express",
    routeColor: "#6366f1",
    busNumber: "Tiger Bus #22",
    nextStop: "West Village Commons",
    etaMinutes: 8,
    occupancyStatus: "Seats Available",
    currentCoordinates: { x: 22, y: 40 },
    routePath: [
      { x: 15, y: 35 },
      { x: 28, y: 68 },
      { x: 38, y: 58 },
    ],
  },
];

// 5. Towson Parking Garages
export const initialTowsonParking: TowsonParkingGarage[] = [
  {
    id: "pkg-union",
    name: "Union Garage (Levels 1-6)",
    code: "UNION-GARAGE",
    totalSpaces: 1200,
    openSpaces: 184,
    status: "Available",
    permitTypes: ["Core Commuter (C)", "Visitor Hourly", "Faculty/Staff"],
    evChargingAvailable: 8,
    accessibleSpaces: 24,
    x: 35,
    y: 62,
  },
  {
    id: "pkg-towsontown",
    name: "Towsontown Garage",
    code: "TOWSONTOWN-GARAGE",
    totalSpaces: 950,
    openSpaces: 42,
    status: "Limited",
    permitTypes: ["Commuter (C)", "Evening Student"],
    evChargingAvailable: 4,
    accessibleSpaces: 18,
    x: 52,
    y: 28,
  },
  {
    id: "pkg-west-village",
    name: "West Village Garage",
    code: "WV-GARAGE",
    totalSpaces: 1400,
    openSpaces: 0,
    status: "Full",
    permitTypes: ["Resident Student (R)", "Overnight Permitted"],
    evChargingAvailable: 6,
    accessibleSpaces: 30,
    x: 12,
    y: 38,
  },
  {
    id: "pkg-glen",
    name: "Glen Garage",
    code: "GLEN-GARAGE",
    totalSpaces: 800,
    openSpaces: 112,
    status: "Available",
    permitTypes: ["Core Student", "Faculty/Staff"],
    evChargingAvailable: 4,
    accessibleSpaces: 16,
    x: 70,
    y: 50,
  },
];

// 6. Towson University Safety Mode Beacons (TUPD Blue Lights & SafeWalk)
export const initialTowsonSafetyBeacons: SafetyBeacon[] = [
  {
    id: "saf-blue-1",
    name: "Blue Light Phone #104 (Freedom Square)",
    type: "Blue Light Phone",
    locationDescription: "Between Cook Library & Lecture Hall Plaza",
    x: 46,
    y: 46,
    distanceFt: 90,
    status: "Operational",
    emergencyPhone: "(410) 704-4444",
  },
  {
    id: "saf-blue-2",
    name: "Blue Light Phone #212 (Science Walkway)",
    type: "Blue Light Phone",
    locationDescription: "Science Complex South Atrium Plaza",
    x: 60,
    y: 38,
    distanceFt: 380,
    status: "Operational",
    emergencyPhone: "(410) 704-4444",
  },
  {
    id: "saf-blue-3",
    name: "Blue Light Phone #088 (Union Skybridge)",
    type: "Blue Light Phone",
    locationDescription: "Connecting University Union to Union Garage",
    x: 36,
    y: 60,
    distanceFt: 340,
    status: "Operational",
    emergencyPhone: "(410) 704-4444",
  },
  {
    id: "saf-tupd",
    name: "Towson University Police HQ (TUPD)",
    type: "Police HQ",
    locationDescription: "TUPD Headquarters · 24/7 Dispatch Center",
    x: 82,
    y: 18,
    distanceFt: 840,
    status: "Dispatch Ready",
    emergencyPhone: "(410) 704-4444",
  },
  {
    id: "saf-health",
    name: "Ward & West Student Health Center",
    type: "Health Center",
    locationDescription: "Urgent care, medical triage & counseling center",
    x: 58,
    y: 66,
    distanceFt: 460,
    status: "Operational",
    emergencyPhone: "(410) 704-2466",
  },
];

// 7. Tiger Pride Map Scavenger & Treasure Hunt (Game Checkpoints)
export const initialTowsonScavengerCheckpoints: ScavengerHuntCheckpoint[] = [
  {
    id: "chk-1",
    title: "1. The Historic Towson Tiger Statue",
    clue: "Seek the bronze mascot guarding Freedom Square where students gather before classes.",
    landmark: "Freedom Square (Bronze Tiger Statue)",
    points: 250,
    x: 48,
    y: 47,
    qrCodeToken: "TU-TIGER-BRONZE-2026",
    isVisited: true,
    badgeReward: "🐾 Tiger Pride Pioneer",
  },
  {
    id: "chk-2",
    title: "2. The Science Complex Rooftop Planetarium",
    clue: "Look toward the stars from the top of TU's newest 320,000 sq ft research beacon.",
    landmark: "Science Complex (Planetarium Dome)",
    points: 300,
    x: 62,
    y: 36,
    qrCodeToken: "TU-SCI-PLANET-44",
    isVisited: false,
    badgeReward: "🔭 Quantum Explorer",
  },
  {
    id: "chk-3",
    title: "3. Burdick Hall 30-Foot Climbing Wall",
    clue: "Find the towering indoor peak inside campus recreation.",
    landmark: "Burdick Hall Rec Center",
    points: 250,
    x: 28,
    y: 68,
    qrCodeToken: "TU-BURDICK-PEAK-09",
    isVisited: false,
    badgeReward: "🧗 Summit Champion",
  },
  {
    id: "chk-4",
    title: "4. Step to the Clock Tower at Stephens Hall",
    clue: "The historic brick facade and clock tower that has chimed for generations of Tigers.",
    landmark: "Stephens Hall Clock Tower",
    points: 350,
    x: 54,
    y: 52,
    qrCodeToken: "TU-STEPHENS-CLOCK-1866",
    isVisited: false,
    badgeReward: "🏆 Master Campus Explorer",
  },
];

// 8. Turn-by-Turn Navigation Steps (Towson Route Simulator)
export const sampleTowsonRoute: NavigationStep[] = [
  {
    stepNumber: 1,
    instruction: "Start at Freedom Square (Tiger Statue)",
    detail: "Head Northeast along the paved University Mall path towards Science Complex.",
    icon: "walk",
    distanceFt: 180,
  },
  {
    stepNumber: 2,
    instruction: "Detour Alert: Avoid North Quad Repaving",
    detail: "Turn slightly right around Smith Hall to avoid active maintenance work.",
    icon: "turn_right",
    distanceFt: 140,
    isDetourAvoidance: true,
  },
  {
    stepNumber: 3,
    instruction: "Enter Science Complex via South Atrium",
    detail: "Accessible ramp & automatic double doors on the ground level.",
    icon: "building",
    distanceFt: 60,
  },
  {
    stepNumber: 4,
    instruction: "Take Elevator Bank A to Floor 3",
    detail: "Elevator located immediately past the Watson Planetarium entrance.",
    icon: "elevator",
    distanceFt: 30,
  },
  {
    stepNumber: 5,
    instruction: "Turn Left down CIS Hallway B",
    detail: "Pass Quiet Pod 3B and Dr. Hayes's office.",
    icon: "turn_left",
    distanceFt: 45,
  },
  {
    stepNumber: 6,
    instruction: "Arrive at SC 304 (Cybersecurity Defense Lab)",
    detail: "Autonomous Systems & Cyber Defense Lab is on your right.",
    icon: "arrive",
    distanceFt: 0,
  },
];

// 9. Initial Campus Reels (Vertical Video Engine)
export const initialCampusReels: CampusReel[] = [
  {
    id: "reel-1",
    title: "Autonomous battlebot arena test run in Towson Science Complex Lab 304! 🤖🔥",
    creatorName: "Towson Robotics Society",
    creatorHandle: "@TURobotics",
    creatorAvatar: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150&auto=format&fit=crop&q=80",
    videoUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
    audioTrack: "Original Sound — TU Science Complex",
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
    title: "Simulated penetration test demo on our Towson containerized honeypot cluster 🛡️💻",
    creatorName: "Towson Cybersecurity Club",
    creatorHandle: "@TUCyberClub",
    creatorAvatar: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80",
    videoUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    audioTrack: "Cyber Beats — TU Cyber Defense",
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
    title: "Cultural Night dance rehearsal sneak peek at University Union Ballroom! 🎉🌍",
    creatorName: "African Student Association",
    creatorHandle: "@ASA_Towson",
    creatorAvatar: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=150&auto=format&fit=crop&q=80",
    videoUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
    audioTrack: "Afrobeats Fusion — TU Festival Mix",
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

// 10. Towson Trivia Challenge
export const initialCampusGames: CampusGame[] = [
  {
    id: "game-towson-cyber",
    title: "Towson Tiger Tech & Cyber Challenge",
    category: "Trivia",
    description: "5 rapid-fire questions on Towson campus tech, network defense, and Cook Library systems. Earn points for the semester leaderboard!",
    icon: "🐯",
    highScore: 9420,
    activePlayersCount: 214,
    questions: [
      {
        id: "q1",
        question: "Which building houses the Cybersecurity & CIS Labs at Towson University?",
        options: ["Smith Hall", "7800 York Road & Science Complex", "Burdick Hall", "Stephens Hall"],
        correctIndex: 1,
        explanation: "7800 York Road and the new Science Complex house TU's premier cybersecurity and CIS labs.",
      },
      {
        id: "q2",
        question: "What is the emergency phone number for Towson University Police (TUPD)?",
        options: ["(410) 704-4444", "911 only", "(555) 019-9111", "(410) 555-0100"],
        correctIndex: 0,
        explanation: "TUPD 24/7 Emergency Dispatch is reachable at (410) 704-4444 and via any campus Blue Light phone.",
      },
      {
        id: "q3",
        question: "Where are the 24/7 quiet study pods located during midterms at Towson?",
        options: ["University Union Food Court", "Albert S. Cook Library Floors 2-3", "SECU Arena", "Glen Garage"],
        correctIndex: 1,
        explanation: "Cook Library floors remain open 24/7 for midterm and finals study sessions.",
      },
      {
        id: "q4",
        question: "What is the primary shuttle loop connecting West Village to University Union?",
        options: ["Gold Route (Campus Loop)", "Green Line", "Silver Metro", "Purple Connector"],
        correctIndex: 0,
        explanation: "The Gold Route provides continuous loops connecting Union, West Village, and SECU Arena.",
      },
      {
        id: "q5",
        question: "What is the bronze mascot landmark located at Freedom Square?",
        options: ["Bronze Eagle", "Towson Tiger", "Golden Bear", "Black Hawk"],
        correctIndex: 1,
        explanation: "The iconic bronze Towson Tiger statue stands proudly at Freedom Square outside Cook Library.",
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

// 11. Initial Towson Notifications
export const initialCampusNotifications: CampusNotification[] = [
  {
    id: "notif-1",
    type: "EVENT",
    title: "AI Security Keynote in TU Science Complex",
    body: "Dr. Marcus Vance's keynote in Science Complex Auditorium starts at 5:00 PM. Your QR pass is ready.",
    timeAgo: "20m ago",
    isRead: false,
    actionUrl: "events",
  },
  {
    id: "notif-2",
    type: "ORG",
    title: "African Student Association Announcement",
    body: "Amara Diallo posted: Cultural Night rehearsal schedule at University Union Ballroom is set!",
    timeAgo: "1h ago",
    isRead: false,
    actionUrl: "organizations",
  },
  {
    id: "notif-3",
    type: "SOCIAL",
    title: "Maya Chen shared location with Cybersecurity Club",
    body: "Maya Chen is currently in Science Complex Rm 304.",
    timeAgo: "2m ago",
    isRead: false,
    actionUrl: "campus",
  },
];

// 12. Default Notification Preferences
export const defaultNotificationPreferences: NotificationPreferences = {
  pushMessages: true,
  pushEventReminders: true,
  pushOrgAnnouncements: true,
  pushSocialLikes: false,
  emailImportantAnnouncements: true,
  emailSocialDigest: false,
};

// 13. Initial Live Activities (🔴 LIVE AT TOWSON UNIVERSITY)
export const initialLiveActivities: LiveCampusActivity[] = [
  {
    id: "live-1",
    title: "Towson Tigers Basketball vs Delaware",
    location: "SECU Arena",
    attendeesCount: 3200,
    category: "Sports",
    statusText: "4th Quarter • Tigers up by 4 (68-64)",
    icon: "🏀",
    linkTab: "events",
  },
  {
    id: "live-2",
    title: "Autonomous LLM Agent Workshop",
    location: "Science Complex Rm 304",
    attendeesCount: 84,
    category: "Workshop",
    statusText: "Hands-on cyber defense coding",
    icon: "💻",
    linkTab: "events",
  },
  {
    id: "live-3",
    title: "Campus Food Drive & Pantry Packing",
    location: "University Union North Loading Dock",
    attendeesCount: 31,
    category: "Volunteering",
    statusText: "31 active student volunteers",
    icon: "🤝",
    linkTab: "activities",
  },
  {
    id: "live-4",
    title: "SGA Student Budget Senate",
    location: "Union Chamber 204",
    attendeesCount: 62,
    category: "Governance",
    statusText: "Public debate on club surplus funding",
    icon: "🗳️",
    linkTab: "events",
  },
];

// 14. Initial Peer Matches ("FIND MY PEOPLE")
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
    sharedReason: "Both enrolled in CMSC 421 and members of Towson Cybersecurity Club",
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
    sharedReason: "Both interested in Cloud & frequent Burdick Hall gym",
    isConnected: true,
  },
];

// 15. Initial Quick Temporary Groups
export const initialQuickGroups: QuickGroup[] = [
  {
    id: "qg-1",
    name: "TU AI Hackathon Autonomous Defense Team",
    purpose: "Build zero-day containment agent for the Spring Hackathon",
    creator: "Kwesi Asiedu",
    membersCount: 4,
    expirationDate: "Expires May 15, 2026 (End of Semester)",
    isJoined: true,
  },
];

// 16. Initial Opportunities
export const initialCampusOpportunities: CampusOpportunity[] = [
  {
    id: "opp-1",
    title: "AI Autonomous Cyber Defense Research Fellowship",
    type: "Paid Research",
    departmentOrOrg: "TU Autonomous Security & Systems Lab (ASSL)",
    rewardOrPay: "$22.00 / hr + 3 Academic Credits",
    deadline: "Mar 15, 2026",
    description: "Paid undergraduate research position developing automated closed-loop defense agents under Dr. Catherine Hayes.",
    matchReason: "Matches your Major (IT), Cybersecurity interest, and Python skills",
    hasApplied: true,
  },
  {
    id: "opp-2",
    title: "Towson $10,000 Tiger Innovation Hackathon Prize",
    type: "Hackathon",
    departmentOrOrg: "Fisher College of Science and Mathematics",
    rewardOrPay: "$10,000 Prize Pool",
    deadline: "Apr 04, 2026",
    description: "48-hour campus hackathon in Science Complex with tracks in AI, Cybersecurity, and HealthTech.",
    matchReason: "Recommended because you are a Hackathon 1st Place Finalist",
    hasApplied: false,
  },
];

// 17. Initial Campus 311 Service Requests
export const initialServiceRequests: CampusServiceRequest[] = [
  {
    id: "req-1",
    ticketNumber: "#311-8492",
    category: "Wi-Fi & Network",
    location: "Cook Library 2nd Floor Pod B",
    description: "High packet loss and dropouts on TU-Secure Wi-Fi SSID near Pod B.",
    status: "In Progress",
    submittedTime: "2 hours ago",
  },
];

// 18. Initial Event Memories
export const initialEventMemories: EventMemory[] = [
  {
    id: "mem-1",
    eventTitle: "Annual Spring AI Hackathon 2026",
    date: "February 22, 2026",
    attendeesCount: 184,
    projectsBuiltCount: 32,
    photosCount: 426,
    aiGeneratedRecap:
      "Over 184 students converged in the University Union for 12 hours of rapid prototyping. 32 completed projects were demoed across autonomous security, campus sustainability, and accessible transit. Team 'CyberPulse' took first place with their automated honeypot mesh.",
    bannerUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80",
  },
];

// 19. Initial Office Hours
export const initialOfficeHours: OfficeHourSlot[] = [
  {
    id: "oh-1",
    professorName: "Dr. Catherine Hayes",
    professorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    department: "Department of Computer and Information Sciences",
    officeLocation: "Science Complex Rm 314",
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

// 20. Initial Campus Alerts
export const initialCampusAlerts: CampusAlert[] = [
  {
    id: "alt-1",
    level: "IMPORTANT",
    title: "SGA $10,000 Budget Allocation Poll Open",
    message: "Cast your vote on how campus recreational and technology funding should be distributed for next term.",
    department: "Student Affairs & SGA",
    timeAgo: "1 hour ago",
    actionLabel: "Vote in Poll",
    actionUrl: "poll",
  },
];

// 21. Initial Posts
export const initialCampusPosts: CampusPost[] = [
  {
    id: "p1",
    authorId: "org-asa",
    authorName: "African Student Association",
    authorMajor: "Cultural Student Org",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    clubName: "African Student Association",
    scope: "CAMPUS_WIDE",
    location: "University Union Ballroom",
    content:
      "🎉 Cultural Night is this Friday at 7:00 PM in the University Union! Experience live music, authentic African cuisines, cultural fashion runway, and student dance performances. Free admission for all Towson students!",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
    likesCount: 94,
    isLiked: false,
    commentsCount: 8,
    comments: [
      { id: "c1", authorId: "u2", author: "Kwesi Asiedu", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", text: "Can't wait! The food lineup at the Union looks incredible.", time: "15m ago" },
    ],
    timeAgo: "1 hour ago",
    isPinned: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "p2",
    authorId: "club-cs",
    authorName: "Towson Cybersecurity Club",
    authorMajor: "Academic & Technology",
    authorAvatar: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80",
    clubName: "Towson Cybersecurity Club",
    scope: "CLUB",
    location: "Science Complex Rm 304",
    content:
      "📚 Hands-on AI Workshop tomorrow at 5:00 PM in Science Complex Rm 304! We will build LLM agent workflows and explore cybersecurity defense loops. 35 students already attending. Bring your laptops!",
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80",
    likesCount: 64,
    isLiked: true,
    commentsCount: 3,
    comments: [],
    timeAgo: "2 hours ago",
    createdAt: new Date().toISOString(),
  },
];

// 22. Initial Events
export const initialCampusEvents: CampusEvent[] = [
  {
    id: "ev-1",
    title: "Keynote: Autonomous AI & Cyber Defense Architectures",
    clubName: "Towson Cybersecurity Club & CIS Dept",
    category: "Guest Speaker",
    location: "Science Complex Auditorium",
    buildingCode: "SC-101",
    dateMonth: "MAR",
    dateDay: "03",
    time: "Tuesday, 5:00 PM - 6:30 PM",
    capacity: 250,
    attendeesCount: 184,
    userRsvp: "GOING",
    recommendationReason: "Recommended because you follow Cybersecurity Club & attend CIS events",
    description: "Distinguished guest lecture on autonomous loop defense systems and generative security models in the Science Complex.",
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

// 23. Initial Organizations
export const initialCampusClubs: CampusClub[] = [
  {
    id: "org-asa",
    name: "African Student Association",
    category: "Cultural",
    membersCount: 220,
    isJoined: true,
    president: "Amara Diallo (Senior, Business)",
    description: "Celebrating African cultures, fostering student unity, community service, and academic excellence at Towson University.",
    logo: "🌍",
    banner: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80",
    nextEvent: "Cultural Night (Friday, 7 PM @ Union)",
    aboutText: "The African Student Association provides a welcoming space for cultural exchange, mentoring, professional networking, and social activities across TU.",
    leadership: [
      { role: "President", name: "Amara Diallo", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" },
      { role: "Vice President", name: "Kwesi Asiedu", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
    ],
    projects: [
      { id: "p1", title: "Pan-African Library Book Drive", description: "Collecting 500 STEM textbooks for youth outreach programs in Baltimore County.", status: "In Progress", lead: "Amara Diallo" },
    ],
    documents: [
      { id: "d1", name: "ASA Constitution & Bylaws 2026.pdf", type: "PDF", size: "1.2 MB", url: "#" },
    ],
  },
  {
    id: "org-cyber",
    name: "Towson Cybersecurity Club",
    category: "Academic",
    membersCount: 195,
    isJoined: true,
    president: "Maya Chen (Senior, CS)",
    description: "Competing in Collegiate Cyber Defense Competitions (CCDC), CTFs, and ethical hacking workshops at 7800 York & Science Complex.",
    logo: "🛡️",
    banner: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    nextEvent: "Capture The Flag Practice (Thu 6 PM @ SC 304)",
    aboutText: "We prepare TU students for industry careers in security architecture, penetration testing, digital forensics, and network operations.",
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

// 24. Initial Volunteer Activities
export const initialVolunteerActivities: VolunteerActivity[] = [
  {
    id: "vol-1",
    title: "Campus Food Drive & Pantry Distribution",
    category: "Food Drive",
    organizer: "Towson Student Community Service Council",
    organizerAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    location: "University Union North Loading Dock",
    date: "Saturday, Mar 08 • 9:00 AM - 3:00 PM",
    description: "Organizing 3,000 lbs of packaged food and fresh produce for commuter students and Baltimore food pantries.",
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

// 25. Initial Research Projects
export const initialResearchProjects: ResearchOpportunity[] = [
  {
    id: "res-1",
    title: "Autonomous Cyber Defense Loops & Zero-Day Containment",
    professor: "Dr. Catherine Hayes",
    professorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    department: "Department of Computer & Information Sciences",
    labName: "Autonomous Security & Systems Lab (Science Complex Rm 314)",
    openingsGrad: 2,
    openingsUndergrad: 1,
    requiredSkills: ["Python", "Machine Learning", "Cybersecurity", "Docker"],
    description: "Developing automated closed-loop defense agents capable of detecting and isolating anomalous network traffic.",
    compensation: "Paid ($22/hr) or 3 Academic Credits",
    hasApplied: true,
    applicationStatus: "Interview Scheduled",
  },
];

// 25b. Initial Campus Jobs
export const initialCampusJobs: CampusJob[] = [
  {
    id: "job-1",
    title: "Cook Library Student Technology Assistant",
    department: "Albert S. Cook Library · Tech Desk",
    type: "Student Assistant",
    payRate: "$16.50 / hr",
    hoursPerWeek: "12-15 hrs/week",
    location: "Cook Library 1st Floor",
    description: "Assist students and faculty with laptop checkout, dual display setup, printing, and general tech troubleshooting.",
    deadline: "Mar 10, 2026",
    hasApplied: false,
  },
];

// 26. Initial Study Pods & Courses
export const initialStudyPods: CourseStudyPod[] = [
  {
    id: "pod-1",
    courseCode: "COSC 421",
    courseName: "Operating Systems",
    topic: "Virtual Memory & Paging Exam Prep",
    roomLocation: "Albert S. Cook Library 2nd Floor, Pod B",
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
    code: "COSC 421",
    name: "Operating Systems & Kernel Architecture",
    professor: "Dr. Catherine Hayes",
    professorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    credits: 4.0,
    grade: "A (94%)",
    room: "Science Complex 204",
    schedule: "Mon/Wed 10:00 AM - 11:30 AM",
    studentsEnrolled: 342,
    studyGroupsCount: 12,
    reviewSessionsCount: 3,
    tutorsCount: 7,
    isEnrolled: true,
    nextAssignment: "Lab 3: Virtual Memory Pager (Due in 6h)",
    deliverables: [
      { id: "del-1", title: "Lab 3: Kernel Virtual Memory Paging", dueText: "Today at 11:59 PM", dueHoursLeft: 6, points: 100, type: "Lab", isSubmitted: false, activeStudyPodsCount: 4 },
      { id: "del-2", title: "Midterm Exam 1 (Ch 1-6)", dueText: "Wednesday, Mar 12", dueHoursLeft: 120, points: 200, type: "Exam", isSubmitted: false, activeStudyPodsCount: 8 },
    ],
    resources: [
      { id: "r1", title: "COSC 421 Midterm Study Guide 2026.pdf", type: "Past Exam Review", uploader: "Dr. Hayes", downloadsCount: 248, size: "1.4 MB" },
    ],
  },
  {
    id: "crs-2",
    code: "ITEC 385",
    name: "Autonomous Cyber Defense & Threat Hunting",
    professor: "Dr. Marcus Vance",
    professorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80",
    credits: 3.0,
    grade: "A (96%)",
    room: "7800 York Road Rm 314",
    schedule: "Tue/Thu 2:00 PM - 3:30 PM",
    studentsEnrolled: 185,
    studyGroupsCount: 8,
    reviewSessionsCount: 2,
    tutorsCount: 4,
    isEnrolled: true,
    nextAssignment: "Honeypot Attack Simulation (Due Friday)",
    deliverables: [
      { id: "del-3", title: "Project 2: Containerized Honeypot Mesh", dueText: "Friday at 5:00 PM", dueHoursLeft: 48, points: 150, type: "Project", isSubmitted: true, activeStudyPodsCount: 2 },
    ],
    resources: [
      { id: "r2", title: "Zero-Day Honeypot Setup Lab.pdf", type: "Notes", uploader: "Dr. Vance", downloadsCount: 192, size: "2.1 MB" },
    ],
  },
  {
    id: "crs-3",
    code: "COSC 484",
    name: "Web Application & Distributed Cloud Architecture",
    professor: "Prof. David Sterling",
    professorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80",
    credits: 3.0,
    grade: "A- (91%)",
    room: "Science Complex 118",
    schedule: "Friday 1:00 PM - 3:30 PM",
    studentsEnrolled: 260,
    studyGroupsCount: 9,
    reviewSessionsCount: 4,
    tutorsCount: 5,
    isEnrolled: true,
    nextAssignment: "Milestone 4: Next.js SSR Integration",
    deliverables: [
      { id: "del-4", title: "Milestone 4: Serverless API Architecture", dueText: "Sunday at 11:59 PM", dueHoursLeft: 96, points: 120, type: "Project", isSubmitted: false, activeStudyPodsCount: 5 },
    ],
    resources: [
      { id: "r3", title: "Next.js Fullstack Microservices.pdf", type: "Formula Sheet", uploader: "Prof. Sterling", downloadsCount: 310, size: "3.4 MB" },
    ],
  },
  {
    id: "crs-4",
    code: "MATH 274",
    name: "Discrete Mathematics & Algorithmic Logic",
    professor: "Dr. Elena Rostova",
    professorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
    credits: 4.0,
    grade: "B+ (88%)",
    room: "Smith Hall Rm 402",
    schedule: "Tue/Thu 11:00 AM - 12:30 PM",
    studentsEnrolled: 410,
    studyGroupsCount: 15,
    reviewSessionsCount: 5,
    tutorsCount: 8,
    isEnrolled: true,
    nextAssignment: "Problem Set 6: Graph Eulerian Circuits",
    deliverables: [
      { id: "del-5", title: "Problem Set 6: Graph Isomorphisms", dueText: "Tuesday at 11:00 AM", dueHoursLeft: 42, points: 50, type: "Homework", isSubmitted: false, activeStudyPodsCount: 3 },
    ],
    resources: [
      { id: "r4", title: "Graph Theory & Combinatorics Review.pdf", type: "Notes", uploader: "Dr. Rostova", downloadsCount: 280, size: "1.8 MB" },
    ],
  },
];

// 27. Initial Media Items
export const initialCampusMedia: CampusMediaItem[] = [
  {
    id: "med-1",
    title: "Keynote Lecture: Zero-Day Loops & Autonomous Cyber Defense",
    channelName: "Towson CIS Department",
    channelLogo: "🛡️",
    category: "Guest Lectures",
    duration: "48:20",
    viewsCount: 1420,
    likesCount: 180,
    thumbnailUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80",
    description: "Dr. Marcus Vance (DARPA Lab) presents autonomous loop defense systems, live containment architectures, and AI vulnerability analysis at the Science Complex.",
    publishedDate: "2 days ago",
  },
];

// 28. Initial Polls
export const initialCampusPolls: CampusPoll[] = [
  {
    id: "poll-1",
    question: "Where should Student Government allocate the $10,000 spring surplus budget?",
    organizer: "Towson Student Government Association (SGA)",
    scope: "Campus Wide",
    totalVotes: 842,
    userVotedOptionId: "opt-1",
    options: [
      { id: "opt-1", text: "A. Student Events & Cultural Festivals @ Union", votes: 380 },
      { id: "opt-2", text: "B. Burdick Recreation & Climbing Wall Upgrades", votes: 190 },
      { id: "opt-3", text: "C. Cook Library Quiet Pod Tech Displays", votes: 172 },
      { id: "opt-4", text: "D. Student Organization Travel Pool", votes: 100 },
    ],
  },
];

// 29. Initial Marketplace Items
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

// 30. Initial Chat Messages
export const initialChatMessages: ChatMessage[] = [
  {
    id: "1",
    conversationId: "#general-announcements",
    sender: "Towson Student Affairs",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    text: "📢 Reminder: Spring Career Fair at SECU Arena registration closes Friday at 5:00 PM. 120+ employers attending.",
    time: "2:00 PM",
    isMe: false,
    createdAt: new Date().toISOString(),
  },
];

// ─────────────────────────────────────────────────────────────
// 31. TUHOUSING DOMAIN MODELS & SEED DATASETS
// ─────────────────────────────────────────────────────────────

export interface HousingListing {
  id: string;
  title: string;
  propertyType: "Apartment" | "Shared House" | "Private Room" | "Sublease" | "University Dorm";
  address: string;
  neighborhood: string;
  monthlyRent: number;
  estimatedUtilities: number;
  estimatedTotalMonthly: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  distanceFromCampusMiles: number;
  walkTimeMinutes: number;
  bikeTimeMinutes: number;
  driveTimeMinutes: number;
  transitTimeMinutes: number;
  shuttleRouteName: string;
  nextShuttleEtaMinutes: number;
  isVerifiedLandlord: boolean;
  trustScorePercent: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  videoWalkthroughUrl?: string;
  hasVirtualTour: boolean;
  amenities: string[];
  availableMoveInDate: string;
  leaseDuration: string;
  landlordName: string;
  landlordContact: string;
  roomsAvailable: number;
  mapCoords: { x: number; y: number };
  isSaved: boolean;
  description: string;
}

export interface RoommateProfile {
  id: string;
  name: string;
  avatar: string;
  major: string;
  gradYear: number;
  classStanding: string;
  budgetMonthly: string;
  targetMoveIn: string;
  sleepSchedule: "Early Bird (10 PM - 6 AM)" | "Night Owl (1 AM - 9 AM)" | "Flexible";
  cleanliness: "Spotless / Super Neat" | "Moderate / Normal" | "Relaxed";
  studyHabits: "Quiet Study at Home" | "Library Person" | "Group Study Host";
  petPreference: "Loves Dogs/Cats" | "No Pets Allowed";
  compatibilityPercent: number;
  compatibilityTags: string[];
  bio: string;
  preferredLocations: string[];
  isConnected: boolean;
}

export interface HousingTourBooking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  tourDate: string;
  tourTimeSlot: string;
  tourType: "In-Person Guided Tour" | "Live Video Walkthrough";
  status: "Confirmed" | "Pending Landlord Confirmation";
  landlordName: string;
  contactNumber: string;
}

export interface HousingMaintenanceTicket {
  id: string;
  ticketNumber: string;
  propertyAddress: string;
  unitNumber: string;
  category: "Plumbing" | "Electrical" | "Heating / AC" | "Appliance" | "Lock & Key";
  urgency: "Standard" | "Urgent" | "Emergency";
  description: string;
  status: "Submitted" | "Assigned to Tech" | "In Progress" | "Resolved";
  submittedDate: string;
  assignedTech?: string;
}

export const initialHousingListings: HousingListing[] = [
  {
    id: "hse-1",
    title: "University Village Towson — 2BR Renovated Suite",
    propertyType: "Apartment",
    address: "201 E Joppa Rd, Towson, MD 21286",
    neighborhood: "Towson Town Center District",
    monthlyRent: 925,
    estimatedUtilities: 85,
    estimatedTotalMonthly: 1010,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 940,
    distanceFromCampusMiles: 0.7,
    walkTimeMinutes: 14,
    bikeTimeMinutes: 5,
    driveTimeMinutes: 3,
    transitTimeMinutes: 7,
    shuttleRouteName: "Tiger Bus Gold Route #14",
    nextShuttleEtaMinutes: 4,
    isVerifiedLandlord: true,
    trustScorePercent: 98,
    rating: 4.8,
    reviewsCount: 34,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80",
    ],
    videoWalkthroughUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80",
    hasVirtualTour: true,
    amenities: ["Furnished", "In-Unit Washer/Dryer", "High-Speed Wi-Fi", "Pet Friendly", "Fitness Center", "Gated Parking"],
    availableMoveInDate: "August 15, 2026",
    leaseDuration: "12 Months (Student Lease)",
    landlordName: "Towson Village Residential Mgmt",
    landlordContact: "(410) 825-4490",
    roomsAvailable: 1,
    mapCoords: { x: 55, y: 22 },
    isSaved: true,
    description: "Modern student apartment with individual leases, private bathroom per room, study lounge, and direct stop for the Towson Gold Shuttle.",
  },
  {
    id: "hse-2",
    title: "The Quarters at Towson Town Center — 4BR Shared House",
    propertyType: "Shared House",
    address: "8600 LaSalle Rd, Towson, MD 21286",
    neighborhood: "LaSalle Academic Corridor",
    monthlyRent: 780,
    estimatedUtilities: 60,
    estimatedTotalMonthly: 840,
    bedrooms: 4,
    bathrooms: 2,
    sqft: 1650,
    distanceFromCampusMiles: 1.1,
    walkTimeMinutes: 20,
    bikeTimeMinutes: 7,
    driveTimeMinutes: 4,
    transitTimeMinutes: 9,
    shuttleRouteName: "TU Express Shuttle #8",
    nextShuttleEtaMinutes: 8,
    isVerifiedLandlord: true,
    trustScorePercent: 95,
    rating: 4.6,
    reviewsCount: 19,
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
    ],
    hasVirtualTour: true,
    amenities: ["Free Parking (4 Cars)", "Backyard & BBQ", "Dishwasher", "Central AC", "Storage Shed"],
    availableMoveInDate: "July 1, 2026",
    leaseDuration: "12 Months",
    landlordName: "David Sterling (Verified TU Alum Owner)",
    landlordContact: "(410) 555-0192",
    roomsAvailable: 2,
    mapCoords: { x: 72, y: 18 },
    isSaved: false,
    description: "Spacious colonial student house with hard-wood floors, high-speed fiber internet, and quiet residential neighborhood 1 mile from Cook Library.",
  },
  {
    id: "hse-3",
    title: "Altus Towson Row — Modern Studio Suite",
    propertyType: "Apartment",
    address: "109 E Chesapeake Ave, Towson, MD 21286",
    neighborhood: "Downtown Towson Hub",
    monthlyRent: 1150,
    estimatedUtilities: 0,
    estimatedTotalMonthly: 1150,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 520,
    distanceFromCampusMiles: 0.5,
    walkTimeMinutes: 10,
    bikeTimeMinutes: 3,
    driveTimeMinutes: 2,
    transitTimeMinutes: 5,
    shuttleRouteName: "Tiger Bus Downtown Line",
    nextShuttleEtaMinutes: 2,
    isVerifiedLandlord: true,
    trustScorePercent: 99,
    rating: 4.9,
    reviewsCount: 48,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80",
    ],
    hasVirtualTour: true,
    amenities: ["All Utilities Included", "Rooftop Pool & Deck", "24/7 Study Lounge", "Amazon Hub Lockers", "Bicycle Storage"],
    availableMoveInDate: "August 1, 2026",
    leaseDuration: "10 or 12 Months",
    landlordName: "Towson Row Properties",
    landlordContact: "(410) 704-8800",
    roomsAvailable: 1,
    mapCoords: { x: 42, y: 15 },
    isSaved: false,
    description: "Luxury off-campus student high-rise right above Whole Foods and Target in Downtown Towson. 10-minute walk to Freedom Square.",
  },
];

export const initialRoommateProfiles: RoommateProfile[] = [
  {
    id: "rm-1",
    name: "Marcus Taylor",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    major: "Computer Science",
    gradYear: 2027,
    classStanding: "Sophomore",
    budgetMonthly: "$800 – $1,050/mo",
    targetMoveIn: "Fall 2026 (August)",
    sleepSchedule: "Night Owl (1 AM - 9 AM)",
    cleanliness: "Spotless / Super Neat",
    studyHabits: "Quiet Study at Home",
    petPreference: "Loves Dogs/Cats",
    compatibilityPercent: 94,
    compatibilityTags: ["✓ Same Budget Range", "✓ Similar CS Major Schedule", "✓ Shared Cleanliness Priority"],
    bio: "CS sophomore looking for 1 or 2 roommates for a 2-4BR apartment near Towson Town Center. Quiet during weeknights, into gaming and gym on weekends.",
    preferredLocations: ["University Village", "Towson Row", "The Quarters"],
    isConnected: false,
  },
  {
    id: "rm-2",
    name: "Sarah Jenkins",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    major: "Nursing & Health Professions",
    gradYear: 2026,
    classStanding: "Junior",
    budgetMonthly: "$900 – $1,200/mo",
    targetMoveIn: "July / August 2026",
    sleepSchedule: "Early Bird (10 PM - 6 AM)",
    cleanliness: "Spotless / Super Neat",
    studyHabits: "Library Person",
    petPreference: "No Pets Allowed",
    compatibilityPercent: 88,
    compatibilityTags: ["✓ Match on Quiet Hours", "✓ Target Move-in August", "✓ Verified TU Student"],
    bio: "TU Nursing junior with clinical rotations. Need a respectful, peaceful place to study and recharge.",
    preferredLocations: ["Altus Towson Row", "Cardiff Hall Apts"],
    isConnected: false,
  },
];

export const initialHousingTours: HousingTourBooking[] = [
  {
    id: "tour-1",
    propertyId: "hse-1",
    propertyTitle: "University Village Towson — 2BR Renovated Suite",
    propertyAddress: "201 E Joppa Rd, Towson, MD",
    tourDate: "Saturday, Mar 08, 2026",
    tourTimeSlot: "11:00 AM",
    tourType: "In-Person Guided Tour",
    status: "Confirmed",
    landlordName: "Towson Village Residential Mgmt",
    contactNumber: "(410) 825-4490",
  },
];

export const initialHousingMaintenanceTickets: HousingMaintenanceTicket[] = [
  {
    id: "maint-1",
    ticketNumber: "#TUH-9412",
    propertyAddress: "201 E Joppa Rd (Univ. Village)",
    unitNumber: "Apt 304-B",
    category: "Heating / AC",
    urgency: "Standard",
    description: "Thermostat fan making clicking noise during heating cycle.",
    status: "In Progress",
    submittedDate: "Yesterday at 3:15 PM",
    assignedTech: "Carlos M. (Facilities Tech #4)",
  },
];

// ─────────────────────────────────────────────────────────────
// 32. DIGITAL TIGER CARD WALLET & DINING DOLLARS
// ─────────────────────────────────────────────────────────────
export interface TigerWalletPass {
  studentName: string;
  studentId: string;
  major: string;
  classStanding: string;
  mealSwipesRemaining: number;
  diningDollarsBalance: number;
  retailPointsBalance: number;
  printQuotaBalance: number;
  dormAccessZone: string;
  barcodeNumber: string;
  lastUsedTime: string;
  lastUsedLocation: string;
}

export const initialTigerWalletPass: TigerWalletPass = {
  studentName: "Kwesi Asiedu",
  studentId: "#8492-KWESI",
  major: "Information Technology",
  classStanding: "Junior",
  mealSwipesRemaining: 14,
  diningDollarsBalance: 284.50,
  retailPointsBalance: 120.00,
  printQuotaBalance: 42.50,
  dormAccessZone: "West Village • Marshall Hall Suite 304",
  barcodeNumber: "2849201948201",
  lastUsedTime: "Today at 12:45 PM",
  lastUsedLocation: "Newell Dining Hall (1 Swipe)",
};

// ─────────────────────────────────────────────────────────────
// 33. LIVE CAMPUS FACILITY & DENSITY TELEMETRY
// ─────────────────────────────────────────────────────────────
export interface LiveFacilityDensity {
  id: string;
  facilityName: string;
  zoneName: string;
  occupancyPercent: number;
  statusLevel: "Quiet" | "Moderate" | "Busy" | "Peak";
  availableDesksOrSpots: number;
  icon: string;
  bestStudyTime: string;
}

export const initialFacilityDensities: LiveFacilityDensity[] = [
  {
    id: "fac-1",
    facilityName: "Albert S. Cook Library",
    zoneName: "Floor 2 & 3 Quiet Pods",
    occupancyPercent: 38,
    statusLevel: "Quiet",
    availableDesksOrSpots: 64,
    icon: "📚",
    bestStudyTime: "Now - 4:00 PM (Ideal study window)",
  },
  {
    id: "fac-2",
    facilityName: "Burdick Hall Fitness Center",
    zoneName: "Cardio & Free Weight Deck",
    occupancyPercent: 74,
    statusLevel: "Busy",
    availableDesksOrSpots: 18,
    icon: "🏋️",
    bestStudyTime: "Best after 7:30 PM",
  },
  {
    id: "fac-3",
    facilityName: "University Union Food Court",
    zoneName: "Dunkin' & Main Seating Atrium",
    occupancyPercent: 45,
    statusLevel: "Moderate",
    availableDesksOrSpots: 52,
    icon: "🍔",
    bestStudyTime: "Short lines right now",
  },
  {
    id: "fac-4",
    facilityName: "Science Complex Commons",
    zoneName: "3rd Floor Tech Collaboration Area",
    occupancyPercent: 22,
    statusLevel: "Quiet",
    availableDesksOrSpots: 35,
    icon: "🔬",
    bestStudyTime: "High-speed Wi-Fi & open screens",
  },
];

// ─────────────────────────────────────────────────────────────
// 34. TIGER SAFEWALK — VIRTUAL NIGHT ESCORT
// ─────────────────────────────────────────────────────────────
export interface SafeWalkSession {
  id: string;
  originName: string;
  destinationName: string;
  estimatedMinutes: number;
  guardianName: string;
  guardianAvatar: string;
  guardianPhone: string;
  status: "ACTIVE" | "ARRIVED" | "EMERGENCY_DISPATCHED";
  startedAt: string;
  currentProgressPercent: number;
}

export const initialSafeWalkSession: SafeWalkSession = {
  id: "sw-1",
  originName: "Albert S. Cook Library",
  destinationName: "West Village • Marshall Hall",
  estimatedMinutes: 8,
  guardianName: "Maya Chen (Cybersecurity Circle)",
  guardianAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  guardianPhone: "(410) 555-0182",
  status: "ACTIVE",
  startedAt: "3 mins ago",
  currentProgressPercent: 45,
};

// ─────────────────────────────────────────────────────────────
// 35. TOWSON ALUMNI MENTORSHIP & CAREER SYNC
// ─────────────────────────────────────────────────────────────
export interface AlumniMentor {
  id: string;
  name: string;
  gradYear: number;
  major: string;
  currentRole: string;
  company: string;
  location: string;
  avatar: string;
  industry: string;
  bio: string;
  isAvailableForCoffeeChat: boolean;
  matchedSkills: string[];
}

export const initialAlumniMentors: AlumniMentor[] = [
  {
    id: "alum-1",
    name: "Brandon Vance",
    gradYear: 2022,
    major: "Computer Science",
    currentRole: "Senior Cloud Security Engineer",
    company: "T. Rowe Price",
    location: "Baltimore, MD (Downtown)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    industry: "Financial Technology & Cyber",
    bio: "Former Towson Cybersecurity Club president. Passionate about helping TU undergraduates break into cloud zero-trust and enterprise threat hunting.",
    isAvailableForCoffeeChat: true,
    matchedSkills: ["AWS GovCloud", "Zero Trust", "Python", "Kubernetes"],
  },
  {
    id: "alum-2",
    name: "Dr. Rachel Sterling",
    gradYear: 2019,
    major: "Information Systems",
    currentRole: "Principal Cyber Defense Researcher",
    company: "Northrop Grumman",
    location: "Linthicum / Annapolis Junction",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    industry: "Aerospace & Defense Systems",
    bio: "TU IT alumna mentoring underrepresented students in AI-driven vulnerability management and DoD cATO compliance.",
    isAvailableForCoffeeChat: true,
    matchedSkills: ["Threat Intelligence", "DevSecOps", "Security Clearance prep"],
  },
  {
    id: "alum-3",
    name: "Darren O'Connor",
    gradYear: 2023,
    major: "Software Engineering",
    currentRole: "Fullstack AI Engineer",
    company: "Amazon Web Services (AWS)",
    location: "Arlington, VA (HQ2)",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    industry: "Cloud & Generative AI",
    bio: "Towson Hackathon winner now building agentic cloud pipelines. Offering resume reviews and mock technical interviews.",
    isAvailableForCoffeeChat: true,
    matchedSkills: ["Next.js", "TypeScript", "LLM Fine-Tuning", "DynamoDB"],
  },
];

