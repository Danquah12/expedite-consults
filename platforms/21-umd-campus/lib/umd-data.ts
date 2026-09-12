// lib/campus-data.ts
// Comprehensive domain models and seed dataset for The Campus Operating Platform
// Specializing in University of Maryland, College Park (TU) Digital Campus & Geographic Engine

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

export interface UmdRoom {
  id: string;
  roomNumber: string;
  name: string;
  type: "Classroom" | "Lab" | "Study Pod" | "Auditorium" | "Restroom" | "Office" | "Lounge";
  capacity: number;
  hasAV: boolean;
  status: "Available" | "Class in Session" | "Reserved";
  currentClassOrEvent?: string;
}

export interface UmdFloor {
  floorNumber: number;
  floorName: string;
  roomsCount: number;
  studySpacesCount: number;
  restrooms: string[];
  elevators: string[];
  emergencyExits: string[];
  rooms: UmdRoom[];
}

export interface UmdBuilding {
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
  floors: UmdFloor[];
  image: string;
  icon: string;
}

export interface MemberLocationTimelineEntry {
  time: string;
  location: string;
  activity: string;
  icon: string;
  duration?: string;
  speedMph?: number;
}

export interface CirclePlaceAlert {
  id: string;
  placeName: string;
  icon: string;
  radiusMeters: number;
  coordinates: { x: number; y: number };
  notifyOnArrival: boolean;
  notifyOnDeparture: boolean;
  membersWatched: string[];
}

export interface DrivingSafetyScore {
  overallScore: number;
  topSpeedMph: number;
  hardBrakingEvents: number;
  rapidAccelerations: number;
  phoneUsageMinutes: number;
  lastTripDistanceMiles: number;
}

export interface CircleMember {
  id: string;
  name: string;
  avatar: string;
  major: string;
  status: "on_campus" | "in_class" | "studying" | "driving" | "walking" | "offline";
  currentBuilding: string;
  currentFloor?: string;
  exactRoom?: string;
  distanceFt: number;
  distanceMiles?: number;
  x: number;
  y: number;
  batteryPercent: number;
  isCharging?: boolean;
  lastUpdated: string;
  isSharingLocation: boolean;
  privacyMode?: "precise" | "bubble" | "paused";
  speedMph?: number;
  movementType?: "stationary" | "walking" | "driving" | "transit";
  wifiSignal?: string;
  timeline?: MemberLocationTimelineEntry[];
  drivingScore?: DrivingSafetyScore;
  breadcrumbTrail?: { x: number; y: number; timestamp: string }[];
}

export interface LocationCircle {
  id: string;
  name: string;
  icon: string;
  inviteCode?: string;
  category: "Club" | "Study Group" | "Friends" | "Event Team" | "Dorm / Roommates" | "Family";
  membersCount: number;
  activeSharingCount: number;
  members: CircleMember[];
  places?: CirclePlaceAlert[];
  isUserMember: boolean;
  isAdmin?: boolean;
}

export interface UmdShuttle {
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

export interface UmdParkingGarage {
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
  category: "Guest Speaker" | "Sports Game" | "Coding Workshop" | "Art Exhibition" | "Cultural Festival" | "Academic" | "Athletics" | "Concert" | "Career Fair" | "Hackathon" | "Tradition" | "Student Org";
  location: string;
  buildingCode: string;
  dateMonth: string;
  dateDay: string;
  time: string;
  capacity: number;
  attendeesCount: number;
  userRsvp: "GOING" | "INTERESTED" | null;
  description: string;
  ticketPrice?: string;
  ticketStatus?: "Available" | "Selling Fast" | "Sold Out" | "Free Student Pass";
  tags?: string[];
  weatherRequirement?: "Indoor" | "Outdoor" | "Hybrid";
  ticketCode?: string;
  gateEntrance?: string;
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
  meetingTime?: string;
  meetingLocation?: string;
  foundedYear?: number;
  tags?: string[];
  contactEmail?: string;
  instagram?: string;
  discordUrl?: string;
  dues?: string;
  sgaBudget?: number;
  council?: "SGA" | "IFC" | "NPHC" | "PHA" | "MGC" | "Academic Senate" | "Club Sports";
  status?: "Active" | "Recruiting" | "Featured";
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

// 1. Initial Current User Profile (UMD College Park Terrapin)
export const defaultCurrentUser: UserProfile = {
  id: "usr-kwesi-asiedu",
  name: "Kwesi Asiedu",
  email: "k.asiedu@students.umd.edu",
  studentId: "#11849-UMD-26",
  major: "Information Technology",
  minor: "Cybersecurity & Systems",
  gradYear: 2026,
  classStanding: "Junior",
  dormBuilding: "Terrapin Square, Marshall Hall #412",
  bio: "UMD College Park Cybersecurity enthusiast. Student researcher in autonomous cyber defense loops. Treasurer of UMD College Park Cybersecurity Club.",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  isVerified: true,
  role: "STUDENT",
  interests: ["Cybersecurity", "AI", "Basketball", "Entrepreneurship"],
  goals: ["Find Study Partners", "Research Opportunities", "Project Partners"],
  eventsAttendedCount: 12,
  volunteerHoursLogged: 48,
  leadershipRoles: ["UMD College Park Cybersecurity Club — Treasurer", "AI Research Society — Lead Builder"],
  achievements: ["🏆 UMD Hackathon 1st Place Finalist", "🏆 Division of Student Affairs Service Award", "🏆 Terrapin Trivia Champion"],
  projects: ["AI Security & Cyber Threat Detection", "UMD College Park Distributed Mesh Network"],
  isLocationSharing: false,
  ghostModeEnabled: false,
  currentLocationName: "Red Square (Near Adele H. Stamp Student Union (The Stamp) (PAGAC))",
};

// 2. University of Maryland, College Park Campus Buildings Dataset (Authentic UMD Landmarks)
export const initialUmdBuildings: UmdBuilding[] = [
  {
    id: "bld-sc",
    name: "Brendan Iribe Center for Computer Science",
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
    name: "Albert S. Adele H. Stamp Student Union (The Stamp) (PAGAC)",
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
    name: "Adele H. Stamp Student Union (GSU)",
    code: "UNION-100",
    shortCode: "UNION",
    category: "Student Life",
    description: "Heart of campus life featuring Chick-fil-A, Cool Beans Coffee (PAGAC), Chesapeake Roasting Co., SGA Senate Chamber, student organization offices, and Terrapin Esports Arena.",
    x: 38,
    y: 58,
    distanceFt: 350,
    openHours: "7:00 AM - Midnight",
    isOpenNow: true,
    occupancyPercent: 82,
    todayEventsCount: 5,
    studySpacesCount: 30,
    classroomsCount: 6,
    accessibleEntrance: "West Entrance via Terrapin Square Garage Skybridge",
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
          { id: "un-101", roomNumber: "UN 101", name: "UMD College Park Food Court (Chick-fil-A / Dunkin)", type: "Lounge", capacity: 300, hasAV: false, status: "Available" },
          { id: "un-108", roomNumber: "UN 108", name: "Terrapin Esports & Gaming Arena", type: "Lab", capacity: 40, hasAV: true, status: "Available" },
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
    name: "Discovery District & Innovation Hub",
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
    accessibleEntrance: "Main Bateman Street Entrance (East Ramp)",
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
    id: "bld-eppley-erc",
    name: "Eppley Recreation Center (ERC) (PAC) & Rec Center",
    code: "EPPLEY-ERC",
    shortCode: "EPPLEY-ERC",
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
    name: "Terrapin Stadium & Terrapin Stadium",
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
    name: "Terrapin Square Commons & Dining",
    code: "WV-COMMONS",
    shortCode: "WV",
    category: "Residential",
    description: "Terrapin Square student residential village featuring all-you-care-to-eat dining, Starbucks, convenience store, and Marshall Hall suites.",
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

// 3. TerpOrbit 360 — Privacy-Preserving Campus Orbits & Circles (Life360 Suite)
export const initialUmdPlaces: CirclePlaceAlert[] = [
  {
    id: "place-library",
    placeName: "Albert S. Adele H. Stamp Student Union (The Stamp) (PAGAC)",
    icon: "📚",
    radiusMeters: 100,
    coordinates: { x: 48, y: 48 },
    notifyOnArrival: true,
    notifyOnDeparture: true,
    membersWatched: ["ALL"],
  },
  {
    id: "place-union",
    placeName: "Adele H. Stamp Student Union (GSU)",
    icon: "🍕",
    radiusMeters: 120,
    coordinates: { x: 38, y: 58 },
    notifyOnArrival: true,
    notifyOnDeparture: true,
    membersWatched: ["ALL"],
  },
  {
    id: "place-science",
    placeName: "Brendan Iribe Center for Computer Science",
    icon: "🔬",
    radiusMeters: 110,
    coordinates: { x: 62, y: 36 },
    notifyOnArrival: true,
    notifyOnDeparture: true,
    membersWatched: ["ALL"],
  },
  {
    id: "place-gym",
    placeName: "Eppley Recreation Center (ERC) (PAC) & Rec Center",
    icon: "🏋️",
    radiusMeters: 100,
    coordinates: { x: 50, y: 72 },
    notifyOnArrival: true,
    notifyOnDeparture: true,
    membersWatched: ["ALL"],
  },
  {
    id: "place-dorm",
    placeName: "University Village Apt 304",
    icon: "🏠",
    radiusMeters: 150,
    coordinates: { x: 82, y: 22 },
    notifyOnArrival: true,
    notifyOnDeparture: true,
    membersWatched: ["ALL"],
  },
  {
    id: "place-garage",
    placeName: "South Parking Garage",
    icon: "🅿️",
    radiusMeters: 120,
    coordinates: { x: 26, y: 76 },
    notifyOnArrival: true,
    notifyOnDeparture: false,
    membersWatched: ["ALL"],
  },
];

export const initialUmdCircles: LocationCircle[] = [
  {
    id: "circle-cyber",
    name: "UMD College Park Cybersecurity Club",
    icon: "🛡️",
    inviteCode: "UMD-9X4K",
    category: "Club",
    membersCount: 12,
    activeSharingCount: 8,
    isUserMember: true,
    isAdmin: true,
    places: initialUmdPlaces,
    members: [
      {
        id: "m-kwesi",
        name: "Kwesi Asiedu (You)",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        major: "IT Junior",
        status: "on_campus",
        currentBuilding: "Red Square / Adele H. Stamp Student Union (The Stamp) (PAGAC)",
        currentFloor: "Ground Floor",
        exactRoom: "Commons Lounge",
        distanceFt: 0,
        distanceMiles: 0,
        x: 48,
        y: 48,
        batteryPercent: 88,
        isCharging: false,
        speedMph: 0,
        movementType: "stationary",
        wifiSignal: "eduroam 5GHz (100%)",
        privacyMode: "precise",
        lastUpdated: "Just now",
        isSharingLocation: true,
        drivingScore: {
          overallScore: 98,
          topSpeedMph: 24,
          hardBrakingEvents: 0,
          rapidAccelerations: 0,
          phoneUsageMinutes: 0,
          lastTripDistanceMiles: 1.8,
        },
        timeline: [
          { time: "8:15 AM", location: "University Village (Joppa Rd)", activity: "Departed Dorm", icon: "🏠", duration: "10m" },
          { time: "8:35 AM", location: "South Parking Garage", activity: "Parked Car (2.1 mi)", icon: "🚗", duration: "5m", speedMph: 22 },
          { time: "9:00 AM – 11:30 AM", location: "Liberal Arts Bldg (LA 2210)", activity: "Cyber Ethics Lecture", icon: "🏛️", duration: "2h 30m" },
          { time: "11:45 AM – 1:00 PM", location: "Adele H. Stamp Student Union (GSU) Food Court", activity: "Lunch at Chick-fil-A", icon: "🍕", duration: "1h 15m" },
          { time: "1:15 PM – Present", location: "Adele H. Stamp Student Union (The Stamp) (PAGAC) Ground Floor", activity: "Studying & Capstone Research", icon: "📚", duration: "Active" },
        ],
        breadcrumbTrail: [
          { x: 82, y: 22, timestamp: "8:15 AM" },
          { x: 26, y: 76, timestamp: "8:35 AM" },
          { x: 32, y: 44, timestamp: "9:00 AM" },
          { x: 38, y: 58, timestamp: "11:45 AM" },
          { x: 48, y: 48, timestamp: "1:15 PM" },
        ],
      },
      {
        id: "m-maya",
        name: "Maya Chen",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        major: "CS Senior",
        status: "studying",
        currentBuilding: "Brendan Iribe Center for Computer Science",
        currentFloor: "3rd Floor",
        exactRoom: "Room SC 304",
        distanceFt: 420,
        distanceMiles: 0.08,
        x: 62,
        y: 36,
        batteryPercent: 94,
        isCharging: true,
        speedMph: 2.8,
        movementType: "walking",
        wifiSignal: "eduroam 5GHz (95%)",
        privacyMode: "precise",
        lastUpdated: "2m ago",
        isSharingLocation: true,
        drivingScore: {
          overallScore: 95,
          topSpeedMph: 30,
          hardBrakingEvents: 1,
          rapidAccelerations: 0,
          phoneUsageMinutes: 0,
          lastTripDistanceMiles: 3.2,
        },
        timeline: [
          { time: "8:45 AM", location: "Terrapin Square Quad", activity: "Departed Residence Hall", icon: "🏠", duration: "10m" },
          { time: "9:00 AM – 11:30 AM", location: "Brendan Iribe Center for Computer Science SC 304", activity: "Operating Systems Lab", icon: "🔬", duration: "2h 30m" },
          { time: "11:45 AM – 12:30 PM", location: "Adele H. Stamp Student Union (GSU) Starbucks", activity: "Coffee Break with Study Pod", icon: "☕", duration: "45m" },
          { time: "12:45 PM – Present", location: "Brendan Iribe Center for Computer Science 3rd Floor", activity: "Algorithms Study Session", icon: "💻", duration: "Active" },
        ],
        breadcrumbTrail: [
          { x: 20, y: 35, timestamp: "8:45 AM" },
          { x: 62, y: 36, timestamp: "9:00 AM" },
          { x: 38, y: 58, timestamp: "11:45 AM" },
          { x: 62, y: 36, timestamp: "12:45 PM" },
        ],
      },
      {
        id: "m-liam",
        name: "Liam Vance",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
        major: "Info Systems",
        status: "on_campus",
        currentBuilding: "Adele H. Stamp Student Union (GSU)",
        currentFloor: "2nd Floor",
        exactRoom: "Food Court Lounge",
        distanceFt: 350,
        distanceMiles: 0.07,
        x: 38,
        y: 58,
        batteryPercent: 72,
        isCharging: false,
        speedMph: 0,
        movementType: "stationary",
        wifiSignal: "eduroam (UMD) (94%)",
        privacyMode: "precise",
        lastUpdated: "1m ago",
        isSharingLocation: true,
        drivingScore: {
          overallScore: 92,
          topSpeedMph: 35,
          hardBrakingEvents: 2,
          rapidAccelerations: 1,
          phoneUsageMinutes: 1,
          lastTripDistanceMiles: 4.5,
        },
        timeline: [
          { time: "9:30 AM", location: "Millennium Hall Dorm", activity: "Left Apartment", icon: "🏠", duration: "8m" },
          { time: "10:00 AM – 12:00 PM", location: "Tydings Hall Rm 102", activity: "Business Info Tech Class", icon: "🏛️", duration: "2h" },
          { time: "12:15 PM – Present", location: "Adele H. Stamp Student Union (GSU) 2nd Floor", activity: "Lunch & SGA Project Meeting", icon: "🍕", duration: "Active" },
        ],
        breadcrumbTrail: [
          { x: 75, y: 30, timestamp: "9:30 AM" },
          { x: 36, y: 46, timestamp: "10:00 AM" },
          { x: 38, y: 58, timestamp: "12:15 PM" },
        ],
      },
      {
        id: "m-tyler",
        name: "Tyler Stone",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        major: "CS Senior",
        status: "studying",
        currentBuilding: "Adele H. Stamp Student Union (The Stamp) (PAGAC)",
        currentFloor: "2nd Floor",
        exactRoom: "Study Pod B-12",
        distanceFt: 180,
        distanceMiles: 0.03,
        x: 48,
        y: 44,
        batteryPercent: 65,
        isCharging: false,
        speedMph: 0,
        movementType: "stationary",
        wifiSignal: "eduroam 5GHz (98%)",
        privacyMode: "precise",
        lastUpdated: "4m ago",
        isSharingLocation: true,
        drivingScore: {
          overallScore: 99,
          topSpeedMph: 22,
          hardBrakingEvents: 0,
          rapidAccelerations: 0,
          phoneUsageMinutes: 0,
          lastTripDistanceMiles: 0.8,
        },
        timeline: [
          { time: "10:00 AM", location: "UMD Residential Towers", activity: "Walked to Quad", icon: "🚶", duration: "12m" },
          { time: "10:30 AM – 1:00 PM", location: "Center for the Arts", activity: "Digital Audio Synthesis Studio", icon: "🎭", duration: "2h 30m" },
          { time: "1:15 PM – Present", location: "Adele H. Stamp Student Union (The Stamp) (PAGAC) 2nd Floor Pod B", activity: "Cybersecurity Capture the Flag Prep", icon: "🛡️", duration: "Active" },
        ],
        breadcrumbTrail: [
          { x: 60, y: 70, timestamp: "10:00 AM" },
          { x: 42, y: 68, timestamp: "10:30 AM" },
          { x: 48, y: 44, timestamp: "1:15 PM" },
        ],
      },
    ],
  },
  {
    id: "circle-roommates",
    name: "Univ. Village Roommates (Apt 304)",
    icon: "🏡",
    inviteCode: "VILLAGE-304",
    category: "Dorm / Roommates",
    membersCount: 3,
    activeSharingCount: 3,
    isUserMember: true,
    isAdmin: true,
    places: initialUmdPlaces,
    members: [
      {
        id: "m-kwesi",
        name: "Kwesi Asiedu (You)",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        major: "IT Junior",
        status: "on_campus",
        currentBuilding: "Adele H. Stamp Student Union (The Stamp) (PAGAC)",
        currentFloor: "Ground Floor",
        exactRoom: "Commons",
        distanceFt: 0,
        x: 48,
        y: 48,
        batteryPercent: 88,
        isCharging: false,
        speedMph: 0,
        movementType: "stationary",
        wifiSignal: "eduroam 5GHz (100%)",
        privacyMode: "precise",
        lastUpdated: "Just now",
        isSharingLocation: true,
      },
      {
        id: "m-liam",
        name: "Liam Vance",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
        major: "Info Systems",
        status: "on_campus",
        currentBuilding: "Adele H. Stamp Student Union (GSU)",
        currentFloor: "2nd Floor",
        exactRoom: "Food Court",
        distanceFt: 350,
        x: 38,
        y: 58,
        batteryPercent: 72,
        isCharging: false,
        speedMph: 0,
        movementType: "stationary",
        wifiSignal: "eduroam (UMD) (94%)",
        privacyMode: "precise",
        lastUpdated: "1m ago",
        isSharingLocation: true,
      },
      {
        id: "m-marcus",
        name: "Marcus Sterling",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        major: "Finance Junior",
        status: "driving",
        currentBuilding: "En Route to University Village",
        currentFloor: "Bateman Street Northbound",
        exactRoom: "In Vehicle",
        distanceFt: 4200,
        distanceMiles: 0.8,
        x: 78,
        y: 28,
        batteryPercent: 45,
        isCharging: true,
        speedMph: 24,
        movementType: "driving",
        wifiSignal: "5G Ultra Wideband",
        privacyMode: "precise",
        lastUpdated: "Just now",
        isSharingLocation: true,
        drivingScore: {
          overallScore: 94,
          topSpeedMph: 32,
          hardBrakingEvents: 1,
          rapidAccelerations: 0,
          phoneUsageMinutes: 0,
          lastTripDistanceMiles: 5.1,
        },
        timeline: [
          { time: "11:00 AM", location: "Robert H. Smith School of Business (Van Munching Hall) (CBE)", activity: "Finance Midterm Exam", icon: "🏛️", duration: "1h 30m" },
          { time: "1:00 PM", location: "Eppley Recreation Center (ERC) (PAC) Gym", activity: "Weight Training Session", icon: "🏋️", duration: "1h" },
          { time: "2:15 PM – Present", location: "Driving Northbound York Rd", activity: "Headed home to Apt 304", icon: "🚗", duration: "Active", speedMph: 24 },
        ],
      },
    ],
  },
  {
    id: "circle-study",
    name: "CMSC 421 OS Study Pod",
    icon: "📚",
    inviteCode: "OS-421",
    category: "Study Group",
    membersCount: 4,
    activeSharingCount: 4,
    isUserMember: true,
    isAdmin: false,
    places: initialUmdPlaces,
    members: [
      {
        id: "m-kwesi",
        name: "Kwesi Asiedu (You)",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        major: "IT Junior",
        status: "on_campus",
        currentBuilding: "Adele H. Stamp Student Union (The Stamp) (PAGAC) Pod B",
        currentFloor: "2nd Floor",
        exactRoom: "Pod B-12",
        distanceFt: 0,
        x: 48,
        y: 48,
        batteryPercent: 88,
        isCharging: false,
        lastUpdated: "Just now",
        isSharingLocation: true,
      },
      {
        id: "m-maya",
        name: "Maya Chen",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        major: "CS Senior",
        status: "studying",
        currentBuilding: "Brendan Iribe Center for Computer Science",
        currentFloor: "3rd Floor",
        exactRoom: "Room 304",
        distanceFt: 420,
        x: 62,
        y: 36,
        batteryPercent: 94,
        isCharging: true,
        lastUpdated: "2m ago",
        isSharingLocation: true,
      },
      {
        id: "m-tyler",
        name: "Tyler Stone",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        major: "CS Senior",
        status: "studying",
        currentBuilding: "Adele H. Stamp Student Union (The Stamp) (PAGAC)",
        currentFloor: "2nd Floor",
        exactRoom: "Pod B-12",
        distanceFt: 180,
        x: 48,
        y: 44,
        batteryPercent: 65,
        isCharging: false,
        lastUpdated: "4m ago",
        isSharingLocation: true,
      },
    ],
  },
];

export const initialUmdShuttles: UmdShuttle[] = [
  {
    id: "shuttle-gold",
    routeName: "Gold Route (Campus Loop)",
    routeColor: "#f59e0b",
    busNumber: "Terrapin Bus #14",
    nextStop: "Adele H. Stamp Student Union (GSU) Transit Plaza",
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
    routeName: "Black Route (UMD College Park Town Center)",
    routeColor: "#0f172a",
    busNumber: "Terrapin Bus #08",
    nextStop: "Adele H. Stamp Student Union (The Stamp) (PAGAC) North Stop",
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
    routeName: "Terrapin Square Express",
    routeColor: "#6366f1",
    busNumber: "Terrapin Bus #22",
    nextStop: "Terrapin Square Commons",
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

// 5. UMD College Park Parking Garages
export const initialUmdParking: UmdParkingGarage[] = [
  {
    id: "pkg-union",
    name: "Terrapin Square Garage (Levels 1-6)",
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
    id: "pkg-umdtown",
    name: "UMD College Parktown Garage",
    code: "REGENTS-DR-GARAGE",
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
    name: "Terrapin Square Garage",
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
    name: "Mowatt Lane Garage",
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

// 6. University of Maryland, College Park Safety Mode Beacons (UMPD Blue Lights & SafeWalk)
export const initialUmdSafetyBeacons: SafetyBeacon[] = [
  {
    id: "saf-blue-1",
    name: "Blue Light Phone #104 (Red Square)",
    type: "Blue Light Phone",
    locationDescription: "Between Adele H. Stamp Student Union (The Stamp) (PAGAC) & Lecture Hall Plaza",
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
    locationDescription: "Brendan Iribe Center for Computer Science South Atrium Plaza",
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
    locationDescription: "Connecting Adele H. Stamp Student Union (GSU) to Terrapin Square Garage",
    x: 36,
    y: 60,
    distanceFt: 340,
    status: "Operational",
    emergencyPhone: "(410) 704-4444",
  },
  {
    id: "saf-tupd",
    name: "University of Maryland, College Park Police HQ (UMPD)",
    type: "Police HQ",
    locationDescription: "UMPD Headquarters · 24/7 Dispatch Center",
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

// 7. Terrapin Pride Map Scavenger & Treasure Hunt (Game Checkpoints)
export const initialUmdScavengerCheckpoints: ScavengerHuntCheckpoint[] = [
  {
    id: "chk-1",
    title: "1. The Historic UMD College Park Terrapin Statue",
    clue: "Seek the bronze mascot guarding Red Square where students gather before classes.",
    landmark: "Red Square (Bronze Terrapin Statue)",
    points: 250,
    x: 48,
    y: 47,
    qrCodeToken: "UMD-TERP-GOLD-2026",
    isVisited: true,
    badgeReward: "🐾 Terrapin Pride Pioneer",
  },
  {
    id: "chk-2",
    title: "2. The Brendan Iribe Center for Computer Science Rooftop Planetarium",
    clue: "Look toward the stars from the top of TU's newest 320,000 sq ft research beacon.",
    landmark: "Brendan Iribe Center for Computer Science (Planetarium Dome)",
    points: 300,
    x: 62,
    y: 36,
    qrCodeToken: "UMD-SCI-PLANET-44",
    isVisited: false,
    badgeReward: "🔭 Quantum Explorer",
  },
  {
    id: "chk-3",
    title: "3. Eppley Recreation Center (ERC) (PAC) 30-Foot Climbing Wall",
    clue: "Find the towering indoor peak inside campus recreation.",
    landmark: "Eppley Recreation Center (ERC) (PAC) Rec Center",
    points: 250,
    x: 28,
    y: 68,
    qrCodeToken: "UMD-EPPLEY-ERC-PEAK-09",
    isVisited: false,
    badgeReward: "🧗 Summit Champion",
  },
  {
    id: "chk-4",
    title: "4. Step to the Clock Tower at Robert H. Smith School of Business (Van Munching Hall)",
    clue: "The historic brick facade and clock tower that has chimed for generations of Terrapins.",
    landmark: "Robert H. Smith School of Business (Van Munching Hall) Clock Tower",
    points: 350,
    x: 54,
    y: 52,
    qrCodeToken: "UMD-CLOCK-1866",
    isVisited: false,
    badgeReward: "🏆 Master Campus Explorer",
  },
];

// 8. Turn-by-Turn Navigation Steps (UMD College Park Route Simulator)
export const sampleUmdRoute: NavigationStep[] = [
  {
    stepNumber: 1,
    instruction: "Start at Red Square (Terrapin Statue)",
    detail: "Head Northeast along the paved University Mall path towards Brendan Iribe Center for Computer Science.",
    icon: "walk",
    distanceFt: 180,
  },
  {
    stepNumber: 2,
    instruction: "Detour Alert: Avoid North Quad Repaving",
    detail: "Turn slightly right around Devilbiss Hall to avoid active maintenance work.",
    icon: "turn_right",
    distanceFt: 140,
    isDetourAvoidance: true,
  },
  {
    stepNumber: 3,
    instruction: "Enter Brendan Iribe Center for Computer Science via South Atrium",
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
    title: "Autonomous battlebot arena test run in UMD College Park Brendan Iribe Center for Computer Science Lab 304! 🤖🔥",
    creatorName: "UMD College Park Robotics Society",
    creatorHandle: "@TURobotics",
    creatorAvatar: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150&auto=format&fit=crop&q=80",
    videoUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
    audioTrack: "Original Sound — SU Brendan Iribe Center for Computer Science",
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
    title: "Simulated penetration test demo on our UMD College Park containerized honeypot cluster 🛡️💻",
    creatorName: "UMD College Park Cybersecurity Club",
    creatorHandle: "@TUCyberClub",
    creatorAvatar: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80",
    videoUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    audioTrack: "Cyber Beats — UMD Cyber Defense",
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
    title: "Cultural Night dance rehearsal sneak peek at Adele H. Stamp Student Union (GSU) Ballroom! 🎉🌍",
    creatorName: "African Student Association",
    creatorHandle: "@ASA_UMD College Park",
    creatorAvatar: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=150&auto=format&fit=crop&q=80",
    videoUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
    audioTrack: "Afrobeats Fusion — UMD Festival Mix",
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

// 10. UMD College Park Trivia Challenge
export const initialCampusGames: CampusGame[] = [
  {
    id: "game-umd-cyber",
    title: "UMD College Park Terrapin Tech & Cyber Challenge",
    category: "Trivia",
    description: "5 rapid-fire questions on UMD College Park campus tech, network defense, and Adele H. Stamp Student Union (The Stamp) (PAGAC) systems. Earn points for the semester leaderboard!",
    icon: "🐯",
    highScore: 9420,
    activePlayersCount: 214,
    questions: [
      {
        id: "q1",
        question: "Which building houses the Cybersecurity & CIS Labs at University of Maryland, College Park?",
        options: ["Devilbiss Hall", "Discovery District & Innovation Hub & Brendan Iribe Center for Computer Science", "Eppley Recreation Center (ERC) (PAC)", "Robert H. Smith School of Business (Van Munching Hall)"],
        correctIndex: 1,
        explanation: "Discovery District & Innovation Hub and the new Brendan Iribe Center for Computer Science house TU's premier cybersecurity and CIS labs.",
      },
      {
        id: "q2",
        question: "What is the emergency phone number for University of Maryland, College Park Police (UMPD)?",
        options: ["(410) 704-4444", "911 only", "(555) 019-9111", "(410) 555-0100"],
        correctIndex: 0,
        explanation: "UMPD 24/7 Emergency Dispatch is reachable at (410) 704-4444 and via any campus Blue Light phone.",
      },
      {
        id: "q3",
        question: "Where are the 24/7 quiet study pods located during midterms at UMD College Park?",
        options: ["Adele H. Stamp Student Union (GSU) Food Court", "Albert S. Adele H. Stamp Student Union (The Stamp) (PAGAC) Floors 2-3", "Terrapin Stadium", "Mowatt Lane Garage"],
        correctIndex: 1,
        explanation: "Adele H. Stamp Student Union (The Stamp) (PAGAC) floors remain open 24/7 for midterm and finals study sessions.",
      },
      {
        id: "q4",
        question: "What is the primary shuttle loop connecting Terrapin Square to Adele H. Stamp Student Union (GSU)?",
        options: ["Gold Route (Campus Loop)", "Green Line", "Silver Metro", "Purple Connector"],
        correctIndex: 0,
        explanation: "The Gold Route provides continuous loops connecting Union, Terrapin Square, and Terrapin Stadium.",
      },
      {
        id: "q5",
        question: "What is the bronze mascot landmark located at Red Square?",
        options: ["Bronze Eagle", "UMD College Park Terrapin", "Golden Bear", "Black Hawk"],
        correctIndex: 1,
        explanation: "The iconic bronze UMD College Park Terrapin statue stands proudly at Red Square outside Adele H. Stamp Student Union (The Stamp) (PAGAC).",
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

// 11. Initial UMD College Park Notifications
export const initialCampusNotifications: CampusNotification[] = [
  {
    id: "notif-1",
    type: "EVENT",
    title: "AI Security Keynote in SU Brendan Iribe Center for Computer Science",
    body: "Dr. Marcus Vance's keynote in Brendan Iribe Center for Computer Science Auditorium starts at 5:00 PM. Your QR pass is ready.",
    timeAgo: "20m ago",
    isRead: false,
    actionUrl: "events",
  },
  {
    id: "notif-2",
    type: "ORG",
    title: "African Student Association Announcement",
    body: "Amara Diallo posted: Cultural Night rehearsal schedule at Adele H. Stamp Student Union (GSU) Ballroom is set!",
    timeAgo: "1h ago",
    isRead: false,
    actionUrl: "organizations",
  },
  {
    id: "notif-3",
    type: "SOCIAL",
    title: "Maya Chen shared location with Cybersecurity Club",
    body: "Maya Chen is currently in Brendan Iribe Center for Computer Science Rm 304.",
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

// 13. Initial Live Activities (🔴 LIVE AT UMD UNIVERSITY)
export const initialLiveActivities: LiveCampusActivity[] = [
  {
    id: "live-1",
    title: "UMD College Park Terrapins Basketball vs Delaware",
    location: "Terrapin Stadium",
    attendeesCount: 3200,
    category: "Sports",
    statusText: "4th Quarter • Terrapins up by 4 (68-64)",
    icon: "🏀",
    linkTab: "events",
  },
  {
    id: "live-2",
    title: "Autonomous LLM Agent Workshop",
    location: "Brendan Iribe Center for Computer Science Rm 304",
    attendeesCount: 84,
    category: "Workshop",
    statusText: "Hands-on cyber defense coding",
    icon: "💻",
    linkTab: "events",
  },
  {
    id: "live-3",
    title: "Campus Food Drive & Pantry Packing",
    location: "Adele H. Stamp Student Union (GSU) North Loading Dock",
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
    sharedReason: "Both enrolled in CMSC 421 and members of UMD College Park Cybersecurity Club",
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
    sharedReason: "Both interested in Cloud & frequent Eppley Recreation Center (ERC) (PAC) gym",
    isConnected: true,
  },
];

// 15. Initial Quick Temporary Groups
export const initialQuickGroups: QuickGroup[] = [
  {
    id: "qg-1",
    name: "UMD AI Hackathon Autonomous Defense Team",
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
    departmentOrOrg: "UMD Autonomous Cyber Lab (ASSL)",
    rewardOrPay: "$22.00 / hr + 3 Academic Credits",
    deadline: "Mar 15, 2026",
    description: "Paid undergraduate research position developing automated closed-loop defense agents under Dr. Catherine Hayes.",
    matchReason: "Matches your Major (IT), Cybersecurity interest, and Python skills",
    hasApplied: true,
  },
  {
    id: "opp-2",
    title: "UMD College Park $10,000 Terrapin Innovation Hackathon Prize",
    type: "Hackathon",
    departmentOrOrg: "Fisher College of Science and Mathematics",
    rewardOrPay: "$10,000 Prize Pool",
    deadline: "Apr 04, 2026",
    description: "48-hour campus hackathon in Brendan Iribe Center for Computer Science with tracks in AI, Cybersecurity, and HealthTech.",
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
    location: "Adele H. Stamp Student Union (The Stamp) (PAGAC) 2nd Floor Pod B",
    description: "High packet loss and dropouts on UMD-Secure Wi-Fi SSID near Pod B.",
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
      "Over 184 students converged in the Adele H. Stamp Student Union (GSU) for 12 hours of rapid prototyping. 32 completed projects were demoed across autonomous security, campus sustainability, and accessible transit. Team 'CyberPulse' took first place with their automated honeypot mesh.",
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
    officeLocation: "Brendan Iribe Center for Computer Science Rm 314",
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
    location: "Adele H. Stamp Student Union (GSU) Ballroom",
    content:
      "🎉 Cultural Night is this Friday at 7:00 PM in the Adele H. Stamp Student Union (GSU)! Experience live music, authentic African cuisines, cultural fashion runway, and student dance performances. Free admission for all UMD College Park students!",
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
    authorName: "UMD College Park Cybersecurity Club",
    authorMajor: "Academic & Technology",
    authorAvatar: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80",
    clubName: "UMD College Park Cybersecurity Club",
    scope: "CLUB",
    location: "Brendan Iribe Center for Computer Science Rm 304",
    content:
      "📚 Hands-on AI Workshop tomorrow at 5:00 PM in Brendan Iribe Center for Computer Science Rm 304! We will build LLM agent workflows and explore cybersecurity defense loops. 35 students already attending. Bring your laptops!",
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
    clubName: "UMD College Park Cybersecurity Club & CIS Dept",
    category: "Guest Speaker",
    location: "Brendan Iribe Center for Computer Science Auditorium (SC-101)",
    buildingCode: "SC-101",
    dateMonth: "MAR",
    dateDay: "03",
    time: "Tuesday, 5:00 PM - 6:30 PM",
    capacity: 250,
    attendeesCount: 184,
    userRsvp: "GOING",
    ticketPrice: "Free with TerpID",
    ticketStatus: "Available",
    tags: ["Cybersecurity", "AI Agents", "NSA CAE-CD", "Keynote", "Networking"],
    weatherRequirement: "Indoor",
    ticketCode: "UMD-TKT-8492-CYBER",
    gateEntrance: "Brendan Iribe Center for Computer Science North Lobby Entrance",
    recommendationReason: "Recommended because you follow Cybersecurity Club & attend CIS events",
    description: "Distinguished guest lecture on autonomous loop defense systems, agentic offensive testing, and generative security models in the Brendan Iribe Center for Computer Science Auditorium.",
    speakers: [
      { name: "Dr. Marcus Vance", title: "Principal AI Security Architect, DARPA Cyber Labs", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
      { name: "Maya Chen", title: "UMD Cyber Club President & NSA Cyber Scholar", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" }
    ],
    agenda: [
      { time: "5:00 PM", topic: "Doors Open & Student Networking Reception (Catered)" },
      { time: "5:15 PM", topic: "Opening remarks & speaker introduction by Dr. Michael O'Leary" },
      { time: "5:30 PM", topic: "Keynote presentation: Autonomous Loop Defenses & Zero-Day Containment" },
      { time: "6:15 PM", topic: "Live Audience Q&A + Resume Hand-off to Government Recruiters" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ev-2",
    title: "CAA Men's Basketball: UMD College Park Terrapins vs. Delaware Blue Hens (Gold Rush Game)",
    clubName: "UMD College Park Athletics & Doc's Army",
    category: "Athletics",
    location: "Terrapin Stadium Main Court",
    buildingCode: "SECU-01",
    dateMonth: "MAR",
    dateDay: "06",
    time: "Friday, 7:00 PM - 9:30 PM",
    capacity: 5200,
    attendeesCount: 4180,
    userRsvp: "GOING",
    ticketPrice: "Free for All UMD Students",
    ticketStatus: "Selling Fast",
    tags: ["Basketball", "Division-I", "CAA", "Gold Rush", "Doc's Army", "Free T-Shirts"],
    weatherRequirement: "Indoor",
    ticketCode: "UMD-TKT-9912-HOOPS",
    gateEntrance: "Terrapin Stadium Gate 1 (Student Section Pass)",
    recommendationReason: "Rivalry Gold Rush Game — Free Gold T-Shirts to first 1,500 students in Doc's Army section!",
    description: "The UMD College Park Terrapins host the Delaware Blue Hens in a pivotal CAA regular season showdown. Wear Gold! Concessions discounts and halftime student half-court shot for $10,000 tuition.",
    speakers: [
      { name: "Pat Skerry", title: "UMD College Park Men's Basketball Head Coach", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" }
    ],
    agenda: [
      { time: "5:30 PM", topic: "Doc's Army Pre-Game Student Tailgate (Free Pizza & Face Painting)" },
      { time: "6:15 PM", topic: "Terrapin Stadium Student Gates Open" },
      { time: "7:00 PM", topic: "Tip-Off: UMD College Park Terrapins vs. Delaware" },
      { time: "8:00 PM", topic: "Halftime $10,000 Tuition Shootout & Dance Team Showcase" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ev-3",
    title: "TerpHacks 2026: 24-Hour Autonomous AI & Web3 Hackathon",
    clubName: "WiCS, Cyber Club & Major League Hacking",
    category: "Hackathon",
    location: "Brendan Iribe Center for Computer Science & Discovery District & Innovation Hub",
    buildingCode: "SC-304",
    dateMonth: "MAR",
    dateDay: "14",
    time: "Saturday 10:00 AM - Sunday 10:00 AM",
    capacity: 350,
    attendeesCount: 290,
    userRsvp: "GOING",
    ticketPrice: "Free (Includes 4 Meals & Swag)",
    ticketStatus: "Available",
    tags: ["Hackathon", "Coding", "AI Agents", "Prizes", "MLH", "Sponsors"],
    weatherRequirement: "Indoor",
    ticketCode: "UMD-TKT-3304-HACKS",
    gateEntrance: "Brendan Iribe Center for Computer Science Center Atrium",
    recommendationReason: "$15,000 in sponsor prize bounties from Google Cloud, Northrop Grumman & T. Rowe Price!",
    description: "University of Maryland, College Park's flagship annual 24-hour hackathon. Build software, AI agents, mobile apps, or hardware hacks with mentors, free meals, Red Bull stations, and recruiting booths.",
    speakers: [
      { name: "Elena Rostova", title: "Lead Hackathon Director, WiCS", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" },
      { name: "Devon Brooks", title: "VP of Technology, UMD College Park Software Guild", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80" }
    ],
    agenda: [
      { time: "10:00 AM", topic: "Check-in, Sponsor Booths & Team Formation" },
      { time: "12:00 PM", topic: "Hacking Officially Begins (Lunch Provided)" },
      { time: "4:00 PM", topic: "Autonomous AI Agent Workshop with Google Cloud" },
      { time: "12:00 AM", topic: "Midnight Pizza & Super Smash Bros Tournament" },
      { time: "9:00 AM", topic: "Code Freeze & Sponsor Expo Judging" },
      { time: "11:30 AM", topic: "Awards Ceremony & $15,000 Prize Distribution" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ev-4",
    title: "Terrapinfest 2026: Spring Music Festival, Carnival & Concert",
    clubName: "Campus Activities Board (CAB)",
    category: "Concert",
    location: "Terrapin Stadium Lawn & Adele H. Stamp Student Union (GSU) Beach",
    buildingCode: "BURD-01",
    dateMonth: "APR",
    dateDay: "25",
    time: "Saturday, 1:00 PM - 10:00 PM",
    capacity: 6000,
    attendeesCount: 4320,
    userRsvp: "GOING",
    ticketPrice: "Free Student Admission (Wristband Required)",
    ticketStatus: "Selling Fast",
    tags: ["Terrapinfest", "Concert", "Carnival", "Food Trucks", "Tradition", "Spring"],
    weatherRequirement: "Outdoor",
    ticketCode: "UMD-TKT-7714-TFEST",
    gateEntrance: "Terrapin Stadium Lawn South Entrance (ID Check)",
    recommendationReason: "UMD College Park's biggest tradition of the year! Live national headliners, ferris wheel, carnival games, and 12 local Baltimore food trucks.",
    description: "The biggest music and arts celebration of the spring semester. Featuring two outdoor stages, carnival rides, inflatable obstacle courses, laser tag, and national hip-hop & indie headliners.",
    speakers: [
      { name: "Brianna Jenkins", title: "CAB Executive Concerts Director", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" }
    ],
    agenda: [
      { time: "1:00 PM", topic: "Carnival Gates Open: Rides, Inflatables & Food Truck Concourse" },
      { time: "3:00 PM", topic: "Local Student Bands & Battle of the Bands Winner Showcase" },
      { time: "6:00 PM", topic: "Main Stage Opener: National Indie/Pop Touring Artist" },
      { time: "8:00 PM", topic: "Headline Act: Live Stadium Concert Performance" },
      { time: "9:45 PM", topic: "Grand Finale Fireworks Show over Minnegan Field" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ev-5",
    title: "Spring 2026 Mega STEM, Healthcare & Business Career Fair",
    clubName: "University of Maryland, College Park Career Center",
    category: "Career Fair",
    location: "Terrapin Stadium Concourse & Arena Floor",
    buildingCode: "SECU-02",
    dateMonth: "MAR",
    dateDay: "18",
    time: "Wednesday, 11:00 AM - 3:30 PM",
    capacity: 2000,
    attendeesCount: 1450,
    userRsvp: "GOING",
    ticketPrice: "Free for All Students & Alumni",
    ticketStatus: "Available",
    tags: ["Careers", "Internships", "STEM", "Healthcare", "Business", "Fortune 500"],
    weatherRequirement: "Indoor",
    ticketCode: "UMD-TKT-1102-FAIR",
    gateEntrance: "Terrapin Stadium Main Concourse Entrance",
    recommendationReason: "120+ top employers actively hiring for Summer 2026 internships and full-time new grad roles.",
    description: "Connect with recruiters from Amazon, Lockheed Martin, Johns Hopkins Medicine, T. Rowe Price, Stanley Black & Decker, Under Armour, NSA, and CareFirst. Professional headshots available on site.",
    speakers: [
      { name: "David Henderson", title: "Director of Employer Relations, University Career Center @ Hornbake Library", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80" }
    ],
    agenda: [
      { time: "11:00 AM", topic: "Doors Open & Free LinkedIn Professional Headshots Station" },
      { time: "12:00 PM", topic: "Tech & Defense Industry Rapid Pitch Sessions" },
      { time: "1:30 PM", topic: "Healthcare & Biotech Networking Roundtables" },
      { time: "3:00 PM", topic: "Same-Day On-Site Interview Slot Scheduling" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ev-6",
    title: "Annual Pan-African Gala, Fashion Showcase & Banquet",
    clubName: "African Student Association (ASA)",
    category: "Cultural Festival",
    location: "Adele H. Stamp Student Union (GSU) Ballrooms (UU-300)",
    buildingCode: "UU-300",
    dateMonth: "MAR",
    dateDay: "27",
    time: "Friday, 7:00 PM - 11:00 PM",
    capacity: 400,
    attendeesCount: 380,
    userRsvp: "GOING",
    ticketPrice: "$10 Students / $20 Guests",
    ticketStatus: "Selling Fast",
    tags: ["Cultural", "Gala", "Fashion Show", "African Cuisine", "Afrobeats", "Dance"],
    weatherRequirement: "Indoor",
    ticketCode: "UMD-TKT-5512-GALA",
    gateEntrance: "Adele H. Stamp Student Union (GSU) 3rd Floor Ballroom Entrance",
    recommendationReason: "UMD College Park's most celebrated cultural formal! Features traditional 3-course dinner, runway fashion show, and live Afrobeats orchestra.",
    description: "An unforgettable evening celebrating African heritage, student excellence, and diaspora unity. Formal African attire or black-tie requested. Includes gourmet multi-nation buffet.",
    speakers: [
      { name: "Amara Diallo", title: "ASA President & Master of Ceremonies", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" }
    ],
    agenda: [
      { time: "7:00 PM", topic: "Red Carpet Arrival & Photo Booth" },
      { time: "7:45 PM", topic: "Dinner Banquet: Jollof, Suya, Injera & Plantains" },
      { time: "8:45 PM", topic: "Pan-African Runway Fashion Showcase" },
      { time: "9:30 PM", topic: "ASA Excellence Awards & Senior Recognition" },
      { time: "10:00 PM", topic: "Open Dance Floor with DJ Kwame" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ev-7",
    title: "NCAA Women's Lacrosse: UMD College Park Terrapins vs. Drexel Dragons (Senior Night)",
    clubName: "UMD College Park Athletics",
    category: "Athletics",
    location: "Johnny Terrapin Stadium",
    buildingCode: "UNITAS-01",
    dateMonth: "APR",
    dateDay: "10",
    time: "Friday, 6:00 PM - 8:30 PM",
    capacity: 11198,
    attendeesCount: 1850,
    userRsvp: "INTERESTED",
    ticketPrice: "Free with Student TerpID",
    ticketStatus: "Available",
    tags: ["Lacrosse", "Division-I", "Senior Night", "CAA", "Terrapins"],
    weatherRequirement: "Outdoor",
    ticketCode: "UMD-TKT-6601-LAX",
    gateEntrance: "Terrapin Stadium West Gate",
    recommendationReason: "Senior Night under the lights! Free UMD College Park Lacrosse bucket hats to first 500 students.",
    description: "Cheer on the nationally ranked UMD College Park Terrapins Women's Lacrosse team in their premier CAA conference match against rival Drexel.",
    speakers: [
      { name: "Kristen Carr", title: "UMD College Park Women's Lacrosse Head Coach", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" }
    ],
    agenda: [
      { time: "5:30 PM", topic: "Senior Class Player Ceremony & Family Tribute" },
      { time: "6:00 PM", topic: "Opening Faceoff: UMD College Park vs. Drexel" },
      { time: "7:15 PM", topic: "Halftime Youth Lacrosse Scrimmage" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ev-8",
    title: "Wall Street Quantitative Trading & AI Investment Forum",
    clubName: "UMD College Park Investment Group (TIG)",
    category: "Academic",
    location: "Robert H. Smith School of Business (Van Munching Hall) Trading Room (SH-212)",
    buildingCode: "SH-212",
    dateMonth: "MAR",
    dateDay: "25",
    time: "Wednesday, 6:00 PM - 7:30 PM",
    capacity: 75,
    attendeesCount: 68,
    userRsvp: "GOING",
    ticketPrice: "Free (RSVP Required)",
    ticketStatus: "Selling Fast",
    tags: ["Finance", "Trading", "Wall Street", "Bloomberg", "Quant", "Investing"],
    weatherRequirement: "Indoor",
    ticketCode: "UMD-TKT-9911-TIG",
    gateEntrance: "Robert H. Smith School of Business (Van Munching Hall) 2nd Floor Trading Suite",
    recommendationReason: "Exclusive hands-on workshop utilizing live Bloomberg Terminals and Python algorithmic backtesting models.",
    description: "Learn how hedge funds and asset managers utilize machine learning for alpha generation, risk parity modeling, and high-frequency execution.",
    speakers: [
      { name: "Zachary Cohen", title: "Portfolio Manager, UMD College Park Investment Group", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
      { name: "Nadia Farooq", title: "Head of Quant Research, TIG", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" }
    ],
    agenda: [
      { time: "6:00 PM", topic: "Bloomberg Terminal Setup & Portfolio Architecture" },
      { time: "6:30 PM", topic: "Building a Python Momentum Factor Strategy" },
      { time: "7:15 PM", topic: "Live Trading Simulation & Q&A" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ev-9",
    title: "Outdoor Starlight Cinema: Summer Blockbuster Lawn Screening",
    clubName: "Campus Activities Board (CAB)",
    category: "Tradition",
    location: "Adele H. Stamp Student Union (GSU) Amphitheater & Lawn",
    buildingCode: "UU-AMPH",
    dateMonth: "APR",
    dateDay: "17",
    time: "Friday, 8:00 PM - 10:30 PM",
    capacity: 800,
    attendeesCount: 520,
    userRsvp: "INTERESTED",
    ticketPrice: "Free (Free Popcorn & Candy)",
    ticketStatus: "Available",
    tags: ["Movies", "Outdoors", "Free Food", "Social", "Amphitheater"],
    weatherRequirement: "Outdoor",
    ticketCode: "UMD-TKT-4419-FILM",
    gateEntrance: "Union Amphitheater Lower Lawn",
    recommendationReason: "Massive 40-foot inflatable 4K projection screen under the stars. Free gourmet popcorn & hot chocolate!",
    description: "Bring blankets and lawn chairs for a relaxing outdoor movie night on the Union Amphitheater lawn. Weather backup location is Potomac Lounge.",
    speakers: [],
    agenda: [
      { time: "7:30 PM", topic: "Lawn Opens: Popcorn Machine, Cotton Candy & Trivia" },
      { time: "8:00 PM", topic: "Movie Screening Begins" },
      { time: "10:15 PM", topic: "Post-Movie Raffle for 5 Free Regal Movie Passes" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ev-10",
    title: "Greek Life Spring Step, Stroll & Unity Showcase",
    clubName: "National Pan-Hellenic Council (NPHC) & MGC",
    category: "Cultural Festival",
    location: "Potomac Lounge (Adele H. Stamp Student Union (GSU))",
    buildingCode: "UU-POTOMAC",
    dateMonth: "APR",
    dateDay: "04",
    time: "Saturday, 6:30 PM - 9:30 PM",
    capacity: 500,
    attendeesCount: 470,
    userRsvp: "GOING",
    ticketPrice: "$5 Students / $10 General",
    ticketStatus: "Selling Fast",
    tags: ["Greek Life", "NPHC", "Divine Nine", "Step Show", "Stroll", "Tradition"],
    weatherRequirement: "Indoor",
    ticketCode: "UMD-TKT-2201-STEP",
    gateEntrance: "Potomac Lounge 2nd Floor Entrance",
    recommendationReason: "The most electrifying Greek tradition of the semester! High-energy step and stroll routines from all 9 NPHC chapters.",
    description: "Watch the Divine Nine and Multicultural Greek Council chapters compete for the 2026 Campus Unity Trophy in synchronized stepping, stroll exhibitions, and crowd interaction.",
    speakers: [
      { name: "Cameron Sterling", title: "NPHC President & Alpha Phi Alpha Leader", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
      { name: "Imani Robinson", title: "Delta Sigma Theta Chapter President", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" }
    ],
    agenda: [
      { time: "6:00 PM", topic: "Doors Open & DJ Hype Mix" },
      { time: "6:30 PM", topic: "National Anthem & Council Introductions" },
      { time: "7:00 PM", topic: "Round 1: Stroll Exhibition & History Vignettes" },
      { time: "8:15 PM", topic: "Round 2: Step Championship Competition" },
      { time: "9:15 PM", topic: "Judge Deliberation & Trophy Presentation" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  }
];

// 23. Initial Organizations
export const initialCampusClubs: CampusClub[] = [
  {
    id: "org-asa",
    name: "African Student Association (ASA)",
    category: "Cultural",
    membersCount: 220,
    isJoined: true,
    president: "Amara Diallo (Senior, Business)",
    description: "Celebrating African heritage, fostering student unity, community service, and academic excellence at University of Maryland, College Park.",
    logo: "🌍",
    banner: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
    nextEvent: "Annual Pan-African Gala (Friday 7 PM @ Union Ballroom)",
    aboutText: "The African Student Association provides a welcoming, empowering space for cultural exchange, alumni mentorship, academic excellence, and philanthropic initiatives across the greater Baltimore community.",
    meetingTime: "Thursdays @ 6:00 PM",
    meetingLocation: "Adele H. Stamp Student Union (GSU) Rm 320",
    foundedYear: 1994,
    tags: ["Cultural", "Pan-African", "Mentorship", "Community Service", "Gala"],
    contactEmail: "asa@umd.edu",
    instagram: "@umd_asa",
    discordUrl: "https://discord.gg/umd-asa",
    dues: "$15 / Semester",
    sgaBudget: 6800,
    council: "SGA",
    status: "Featured",
    leadership: [
      { role: "President", name: "Amara Diallo", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" },
      { role: "Vice President", name: "Kwesi Asiedu", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
      { role: "Treasurer", name: "Zainab Koroma", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" },
      { role: "Events Director", name: "Kofi Mensah", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" }
    ],
    projects: [
      { id: "p1", title: "Pan-African Library Book Drive", description: "Collecting 500 STEM and literature textbooks for Baltimore youth outreach centers.", status: "In Progress", lead: "Amara Diallo" },
      { id: "p2", title: "Taste of Africa Food Festival", description: "Showcasing cuisines from 14 African nations in collaboration with Campus Dining.", status: "Recruiting", lead: "Kofi Mensah" }
    ],
    documents: [
      { id: "d1", name: "ASA Constitution & Bylaws 2026.pdf", type: "PDF", size: "1.2 MB", url: "#" },
      { id: "d2", name: "Cultural Night Sponsorship Deck.pdf", type: "PDF", size: "3.4 MB", url: "#" }
    ],
  },
  {
    id: "org-cyber",
    name: "UMD College Park Cybersecurity Club",
    category: "Academic",
    membersCount: 195,
    isJoined: true,
    president: "Maya Chen (Senior, Computer Science)",
    description: "Competing in Mid-Atlantic CCDC, national CTFs, penetration testing labs, and offensive/defensive security workshops.",
    logo: "🛡️",
    banner: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    nextEvent: "Capture The Flag (CTF) Practice (Thu 6 PM @ SC 304)",
    aboutText: "We prepare UMD students for top-tier careers in cyber defense, malware analysis, cloud security, and ethical hacking through hands-on virtual cyber range challenges and industry guest speakers.",
    meetingTime: "Wednesdays @ 5:30 PM",
    meetingLocation: "Brendan Iribe Center for Computer Science Rm 304 & Cyber Range",
    foundedYear: 2012,
    tags: ["Cybersecurity", "CTF", "CCDC", "Ethical Hacking", "NSA CAE-CD"],
    contactEmail: "cybersec@umd.edu",
    instagram: "@umdcyber",
    discordUrl: "https://discord.gg/umd-cyber",
    dues: "$0 / Free for all UMD students",
    sgaBudget: 12500,
    council: "Academic Senate",
    status: "Featured",
    leadership: [
      { role: "President", name: "Maya Chen", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
      { role: "VP / Red Team Lead", name: "Alex Rivera", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
      { role: "Blue Team Coach", name: "Marcus Vance", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80" },
      { role: "Treasurer", name: "Devon Brooks", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80" }
    ],
    projects: [
      { id: "p3", title: "Autonomous Honeypot Cluster", description: "Deploying cloud sensor honeypots to capture live zero-day exploits across university subnets.", status: "In Progress", lead: "Maya Chen" },
      { id: "p4", title: "Spring MACCDC Competition Team", description: "Training 8-student defensive team for collegiate cyber defense finals.", status: "In Progress", lead: "Alex Rivera" }
    ],
    documents: [
      { id: "d3", name: "UMD Cyber Lab Safety & Ethics Agreement.pdf", type: "PDF", size: "450 KB", url: "#" },
      { id: "d4", name: "CCDC Blue Team Playbook 2026.pdf", type: "PDF", size: "4.8 MB", url: "#" }
    ],
  },
  {
    id: "org-bsu",
    name: "Black Student Union (BSU)",
    category: "Cultural",
    membersCount: 410,
    isJoined: false,
    president: "Jordan Washington (Senior, Political Science)",
    description: "The official unifying organization advocating for Black students, promoting academic excellence, civic awareness, and cultural enrichment.",
    logo: "✊🏾",
    banner: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80",
    nextEvent: "Town Hall on Campus Climate (Tuesday 6:30 PM @ Union 210)",
    aboutText: "Founded in 1969, the UMD College Park BSU empowers students through social activism, career development, community service, and cultural solidarity.",
    meetingTime: "Tuesdays @ 6:30 PM",
    meetingLocation: "Adele H. Stamp Student Union (GSU) Ballroom West",
    foundedYear: 1969,
    tags: ["Cultural", "Advocacy", "Leadership", "Black History", "Networking"],
    contactEmail: "bsu@umd.edu",
    instagram: "@umdbsu",
    discordUrl: "https://discord.gg/umd-bsu",
    dues: "$10 / Year",
    sgaBudget: 14000,
    council: "SGA",
    status: "Featured",
    leadership: [
      { role: "President", name: "Jordan Washington", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
      { role: "Vice President", name: "Destiny Taylor", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" },
      { role: "Secretary", name: "Tariq Edwards", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" }
    ],
    projects: [
      { id: "p5", title: "Black Alumni Mentorship Pipeline", description: "Matching 100 undergraduates with UMD alumni in Fortune 500 & government sectors.", status: "In Progress", lead: "Destiny Taylor" },
      { id: "p6", title: "Freshman Transition Summit", description: "Orientation and academic success workshop series for incoming freshmen.", status: "Completed", lead: "Jordan Washington" }
    ],
    documents: [
      { id: "d5", name: "BSU Constitution 2026.pdf", type: "PDF", size: "890 KB", url: "#" }
    ],
  },
  {
    id: "org-wics",
    name: "Women in Computer Science (WiCS)",
    category: "Academic",
    membersCount: 140,
    isJoined: true,
    president: "Sophia Alami (Junior, Software Engineering)",
    description: "Empowering women and non-binary students in tech through technical workshops, Grace Hopper conference grants, and industry mentorship.",
    logo: "💻",
    banner: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
    nextEvent: "AI & Full-Stack Web Development Bootcamp (Sat 11 AM @ 7800 York)",
    aboutText: "WiCS strives to bridge the gender gap in computing fields by hosting mock technical interviews, hackathons, and corporate networking events with top tech employers.",
    meetingTime: "Mondays @ 5:00 PM",
    meetingLocation: "Discovery District & Innovation Hub Rm 425",
    foundedYear: 2016,
    tags: ["STEM", "Coding", "Diversity in Tech", "Grace Hopper", "Mentorship"],
    contactEmail: "wics@umd.edu",
    instagram: "@umd_wics",
    discordUrl: "https://discord.gg/umd-wics",
    dues: "$0 / Free",
    sgaBudget: 8500,
    council: "Academic Senate",
    status: "Active",
    leadership: [
      { role: "President", name: "Sophia Alami", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" },
      { role: "VP of Tech Workshops", name: "Elena Rostova", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" }
    ],
    projects: [
      { id: "p7", title: "Grace Hopper 2026 Travel Cohort", description: "Securing corporate sponsorship to send 12 students to the GHC tech conference.", status: "In Progress", lead: "Sophia Alami" }
    ],
    documents: [
      { id: "d6", name: "WiCS Tech Interview Cheat Sheet.pdf", type: "PDF", size: "2.1 MB", url: "#" }
    ],
  },
  {
    id: "org-sga",
    name: "Student Government Association (SGA)",
    category: "Professional",
    membersCount: 85,
    isJoined: false,
    president: "Kendall Hughes (Senior, Economics & Law)",
    description: "The primary representative governing body for 20,000+ UMD undergraduate students, overseeing policy, campus initiatives, and student org allocations.",
    logo: "🏛️",
    banner: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80",
    nextEvent: "Weekly Senate Legislative Session (Tuesday 5 PM @ Union 324)",
    aboutText: "SGA works directly with University President, Provost, and Board of Regents to champion student interests, safety, dining improvements, mental health, and equitable funding.",
    meetingTime: "Tuesdays @ 5:00 PM",
    meetingLocation: "Adele H. Stamp Student Union (GSU) Senate Chambers (Rm 324)",
    foundedYear: 1921,
    tags: ["Governance", "Student Advocacy", "Legislation", "Appropriations", "Leadership"],
    contactEmail: "sga@umd.edu",
    instagram: "@umd_sga",
    discordUrl: "https://discord.gg/umd-sga",
    dues: "$0 / Student Fee Funded",
    sgaBudget: 1240000,
    council: "SGA",
    status: "Featured",
    leadership: [
      { role: "Student Body President", name: "Kendall Hughes", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
      { role: "VP of Senate", name: "Liam Vance", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80" },
      { role: "Treasurer", name: "Chloe Patel", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" }
    ],
    projects: [
      { id: "p8", title: "Campus Free Laundry & Period Equity Bill", description: "Successfully funded free laundry detergent pods and menstrual products across all academic halls.", status: "Completed", lead: "Kendall Hughes" },
      { id: "p9", title: "Shuttle Late-Night SafeRide Extension", description: "Expanding Gold Route operations to 3:00 AM on weekends.", status: "In Progress", lead: "Liam Vance" }
    ],
    documents: [
      { id: "d7", name: "SGA Constitution 105th Edition.pdf", type: "PDF", size: "3.2 MB", url: "#" },
      { id: "d8", name: "Fiscal Year 2026 Student Activity Budget.pdf", type: "PDF", size: "5.1 MB", url: "#" }
    ],
  },
  {
    id: "org-tig",
    name: "UMD College Park Investment Group (TIG)",
    category: "Professional",
    membersCount: 175,
    isJoined: false,
    president: "Zachary Cohen (Senior, Finance)",
    description: "Undergraduate student-managed investment fund actively managing $250,000 of UMD endowment assets across equities, fixed income, and REITs.",
    logo: "📈",
    banner: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80",
    nextEvent: "Stock Pitch & Sector Pitch Deck Reviews (Wednesday 7 PM @ Robert H. Smith School of Business (Van Munching Hall))",
    aboutText: "TIG provides rigorous training in financial modeling, DCF valuation, equity research, Bloomberg Terminal proficiency, and Wall Street interview preparation.",
    meetingTime: "Wednesdays @ 7:00 PM",
    meetingLocation: "Robert H. Smith School of Business (Van Munching Hall) Rm 212 (Trading Room)",
    foundedYear: 2005,
    tags: ["Finance", "Investing", "Wall Street", "Bloomberg", "Equity Research"],
    contactEmail: "tig@umd.edu",
    instagram: "@umdinvestmentgroup",
    discordUrl: "https://discord.gg/umd-tig",
    dues: "$20 / Semester",
    sgaBudget: 9200,
    council: "Professional",
    status: "Active",
    leadership: [
      { role: "Portfolio Manager", name: "Zachary Cohen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
      { role: "Head of Research", name: "Nadia Farooq", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" }
    ],
    projects: [
      { id: "p10", title: "Q1 2026 Equity Portfolio Rebalance", description: "Pitching $45k allocation into semiconductor and cybersecurity infrastructure ETFs.", status: "In Progress", lead: "Zachary Cohen" }
    ],
    documents: [
      { id: "d9", name: "TIG Valuation & DCF Template 2026.xlsx", type: "XLSX", size: "1.4 MB", url: "#" }
    ],
  },
  {
    id: "org-apa",
    name: "Alpha Phi Alpha Fraternity Inc. (Eta Zeta Chapter)",
    category: "Greek",
    membersCount: 42,
    isJoined: false,
    president: "Cameron Sterling (Senior, Health Science)",
    description: "The first intercollegiate Greek-letter fraternity established for African American Men. First of All, Servants of All, We Shall Transcend All.",
    logo: "🔱",
    banner: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80",
    nextEvent: "Black & Gold Informational & Stroll Showcase (Friday 7 PM @ Terrapin Square)",
    aboutText: "Chartered at University of Maryland, College Park on January 15, 1971, the Eta Zeta chapter develops leaders, promotes brotherhood and academic excellence, while providing service and advocacy for our communities.",
    meetingTime: "Sundays @ 5:00 PM",
    meetingLocation: "Adele H. Stamp Student Union (GSU) Multipurpose Rm",
    foundedYear: 1971,
    tags: ["Greek Life", "NPHC", "Divine Nine", "Brotherhood", "Philanthropy", "Leadership"],
    contactEmail: "etazeta1906@umd.edu",
    instagram: "@umd_alphas",
    discordUrl: "#",
    dues: "$120 / Semester",
    sgaBudget: 4200,
    council: "NPHC",
    status: "Featured",
    leadership: [
      { role: "Chapter President", name: "Cameron Sterling", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
      { role: "Vice President", name: "Elijah Scott", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" }
    ],
    projects: [
      { id: "p11", title: "A Voteless People is a Hopeless People", description: "Campus-wide voter registration drive registering 800+ student voters.", status: "In Progress", lead: "Cameron Sterling" },
      { id: "p12", title: "Go-to-High-School, Go-to-College Mentorship", description: "Weekly tutoring sessions at Loch Raven High School.", status: "In Progress", lead: "Elijah Scott" }
    ],
    documents: [
      { id: "d10", name: "Eta Zeta Spring Informational Packet.pdf", type: "PDF", size: "2.8 MB", url: "#" }
    ],
  },
  {
    id: "org-dst",
    name: "Delta Sigma Theta Sorority Inc. (Lambda Beta Chapter)",
    category: "Greek",
    membersCount: 48,
    isJoined: false,
    president: "Imani Robinson (Senior, Mass Communications)",
    description: "An organization of college-educated women committed to the constructive development of its members and to public service with a primary focus on the Black community.",
    logo: "🐘",
    banner: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80",
    nextEvent: "Crimson & Cream Women in Leadership Panel (Thursday 6 PM @ Union)",
    aboutText: "Chartered at University of Maryland, College Park in 1973, Lambda Beta focuses on Educational Development, Economic Development, International Awareness, Physical and Mental Health, and Political Awareness & Involvement.",
    meetingTime: "Sundays @ 6:30 PM",
    meetingLocation: "Adele H. Stamp Student Union (GSU) Rm 204",
    foundedYear: 1973,
    tags: ["Greek Life", "NPHC", "Divine Nine", "Sisterhood", "Public Service"],
    contactEmail: "lambdabeta_dst@umd.edu",
    instagram: "@umd_deltas",
    discordUrl: "#",
    dues: "$125 / Semester",
    sgaBudget: 4500,
    council: "NPHC",
    status: "Featured",
    leadership: [
      { role: "President", name: "Imani Robinson", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" },
      { role: "Vice President", name: "Khadija Cole", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" }
    ],
    projects: [
      { id: "p13", title: "Red Cross Blood Drive & Sickle Cell Awareness", description: "Hosting campus blood collection drive reaching 150 pints.", status: "In Progress", lead: "Imani Robinson" }
    ],
    documents: [
      { id: "d11", name: "Lambda Beta Chapter History & Philanthropy.pdf", type: "PDF", size: "1.9 MB", url: "#" }
    ],
  },
  {
    id: "org-laso",
    name: "Latin American Student Organization (LASO)",
    category: "Cultural",
    membersCount: 185,
    isJoined: false,
    president: "Mateo Hernandez (Junior, Business Administration)",
    description: "Fostering cultural pride, community advocacy, and academic support for Latinx/Hispanic students and allies across University of Maryland, College Park.",
    logo: "💃🏽",
    banner: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=80",
    nextEvent: "Noche Latina: Bailes, Comida & Música (Sat 8 PM @ Potomac Lounge)",
    aboutText: "LASO provides a home away from home with festive social gatherings, salsa dance workshops, DACA/Immigration advocacy forums, and Spanish/Portuguese study circles.",
    meetingTime: "Wednesdays @ 6:00 PM",
    meetingLocation: "Adele H. Stamp Student Union (GSU) Rm 314",
    foundedYear: 1988,
    tags: ["Cultural", "Latinx", "Dance", "Advocacy", "Bilingual", "Socials"],
    contactEmail: "laso@umd.edu",
    instagram: "@umd_laso",
    discordUrl: "https://discord.gg/umd-laso",
    dues: "$10 / Year",
    sgaBudget: 5500,
    council: "SGA",
    status: "Active",
    leadership: [
      { role: "President", name: "Mateo Hernandez", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
      { role: "VP of Culture", name: "Valentina Gomez", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" }
    ],
    projects: [
      { id: "p14", title: "Hispanic Heritage Month Fiesta", description: "Campus-wide festival celebrating 20+ Latin American nations.", status: "Completed", lead: "Mateo Hernandez" }
    ],
    documents: [
      { id: "d12", name: "LASO Bylaws 2026.pdf", type: "PDF", size: "750 KB", url: "#" }
    ],
  },
  {
    id: "org-esports",
    name: "UMD College Park Terrapins Esports & Gaming",
    category: "Sports",
    membersCount: 340,
    isJoined: true,
    president: "Austin Reed (Senior, Computer Science)",
    description: "Competitive collegiate esports teams in Valorant, League of Legends, Rocket League, Smash Bros, and casual gaming LAN parties.",
    logo: "🎮",
    banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
    nextEvent: "Super Smash Bros Ultimate LAN Tournament (Friday 6 PM @ Eppley Recreation Center (ERC) Rm 110)",
    aboutText: "We host competitive scrims in the Iribe Virtual Reality & Esports Lab, compete in NACE Starleague, and hold open game nights with VR setups, consoles, and PC rigs.",
    meetingTime: "Fridays @ 6:00 PM",
    meetingLocation: "Eppley Recreation Center (ERC) (PAC) Esports Arena & Lounge",
    foundedYear: 2017,
    tags: ["Esports", "Gaming", "Valorant", "Smash Bros", "LAN", "Twitch"],
    contactEmail: "esports@umd.edu",
    instagram: "@tuesports",
    discordUrl: "https://discord.gg/umd-esports",
    dues: "$0 / Free",
    sgaBudget: 11000,
    council: "Club Sports",
    status: "Featured",
    leadership: [
      { role: "President", name: "Austin Reed", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80" },
      { role: "Tournament Director", name: "Samira Khan", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" }
    ],
    projects: [
      { id: "p15", title: "Mid-Atlantic Collegiate Invitational", description: "Hosting 16 regional universities for a $5,000 prize pool Valorant championship.", status: "In Progress", lead: "Austin Reed" }
    ],
    documents: [
      { id: "d13", name: "Iribe Virtual Reality & Esports Lab Rules & Hardware Guide.pdf", type: "PDF", size: "1.1 MB", url: "#" }
    ],
  },
  {
    id: "org-towerlight",
    name: "The Towerlight (Student News)",
    category: "Student Org",
    membersCount: 65,
    isJoined: false,
    president: "Hannah Sterling (Editor-in-Chief)",
    description: "The independent student news organization serving the University of Maryland, College Park community since 1921 with award-winning investigative journalism.",
    logo: "📰",
    banner: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80",
    nextEvent: "Pitch Meeting & Editorial Board (Mondays 4 PM @ Media Center)",
    aboutText: "The Towerlight is student-run and editorially independent, reporting on campus politics, arts, culture, sports, faculty affairs, and breaking news.",
    meetingTime: "Mondays @ 4:00 PM",
    meetingLocation: "Adele H. Stamp Student Union (GSU) Media Suite Rm 208",
    foundedYear: 1921,
    tags: ["Journalism", "Media", "Photography", "Podcasting", "Publishing"],
    contactEmail: "editor@thetowerlight.com",
    instagram: "@thetowerlight",
    discordUrl: "#",
    dues: "$0 / Paid Staff Roles",
    sgaBudget: 22000,
    council: "SGA",
    status: "Active",
    leadership: [
      { role: "Editor-in-Chief", name: "Hannah Sterling", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
      { role: "Managing Editor", name: "Noah Campbell", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" }
    ],
    projects: [
      { id: "p16", title: "Campus Housing Affordability Investigation", description: "Multi-part investigative series examining off-campus rent trends.", status: "In Progress", lead: "Hannah Sterling" }
    ],
    documents: [
      { id: "d14", name: "Towerlight Style Guide & Code of Ethics.pdf", type: "PDF", size: "850 KB", url: "#" }
    ],
  },
  {
    id: "org-premed",
    name: "Pre-Medical & Health Professions Society",
    category: "Academic",
    membersCount: 310,
    isJoined: false,
    president: "Ananya Sharma (Senior, Biology & Pre-Med)",
    description: "Preparing students for medical school (MD/DO), dental, PA, pharmacy, and nursing programs through MCAT study pods and shadowing.",
    logo: "🩺",
    banner: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
    nextEvent: "Johns Hopkins & UMD Med Student Panel (Wednesday 6 PM @ Devilbiss Hall)",
    aboutText: "We connect aspiring healthcare professionals with physician shadowing rotations at GBMC and St. Joseph Medical Center, suture clinics, and CPR certifications.",
    meetingTime: "Bi-Weekly Wednesdays @ 6:00 PM",
    meetingLocation: "Devilbiss Hall Rm 356",
    foundedYear: 1982,
    tags: ["Pre-Med", "Healthcare", "MCAT", "Shadowing", "Biology", "Clinical"],
    contactEmail: "premed@umd.edu",
    instagram: "@umd_premed",
    discordUrl: "https://discord.gg/umd-premed",
    dues: "$15 / Year",
    sgaBudget: 6200,
    council: "Academic Senate",
    status: "Active",
    leadership: [
      { role: "President", name: "Ananya Sharma", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" },
      { role: "Clinical Shadowing Coordinator", name: "Brian Kelly", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" }
    ],
    projects: [
      { id: "p17", title: "Spring Free Clinic Volunteering in West Baltimore", description: "Mobile vitals screening and preventative health education.", status: "In Progress", lead: "Ananya Sharma" }
    ],
    documents: [
      { id: "d15", name: "Medical School Application Timeline & Checklist.pdf", type: "PDF", size: "1.6 MB", url: "#" }
    ],
  },
  {
    id: "org-cab",
    name: "Campus Activities Board (CAB)",
    category: "Student Org",
    membersCount: 90,
    isJoined: false,
    president: "Brianna Jenkins (Senior, Communications)",
    description: "The premier student-run programming board responsible for major campus concerts, Homecoming, Terrapinfest, comedians, and outdoor movies.",
    logo: "🎪",
    banner: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80",
    nextEvent: "Terrapinfest Spring Music Festival Artist Reveal (Friday 12 PM @ Beach)",
    aboutText: "CAB creates unforgettable college memories by programming over 50 campus-wide concerts, comedy nights, novelties, and spirit traditions each year.",
    meetingTime: "Wednesdays @ 5:00 PM",
    meetingLocation: "Adele H. Stamp Student Union (GSU) CAB Suite",
    foundedYear: 1968,
    tags: ["Events", "Concerts", "Terrapinfest", "Homecoming", "Entertainment"],
    contactEmail: "cab@umd.edu",
    instagram: "@umdcab",
    discordUrl: "#",
    dues: "$0 / Student Fee Funded",
    sgaBudget: 380000,
    council: "SGA",
    status: "Featured",
    leadership: [
      { role: "Executive Director", name: "Brianna Jenkins", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" },
      { role: "Concerts Chair", name: "Trevor Nelson", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" }
    ],
    projects: [
      { id: "p18", title: "Terrapinfest 2026 Headliner Production", description: "Planning outdoor stadium stage, security, and food truck concourse for 6,000 attendees.", status: "In Progress", lead: "Brianna Jenkins" }
    ],
    documents: [
      { id: "d16", name: "CAB Event Planning Playbook 2026.pdf", type: "PDF", size: "2.4 MB", url: "#" }
    ],
  },
  {
    id: "org-ama",
    name: "American Marketing Association (AMA UMD College Park)",
    category: "Professional",
    membersCount: 120,
    isJoined: false,
    president: "Lucas Meyers (Senior, Marketing)",
    description: "Developing future CMOs and marketing executives through real-world client brand consulting, digital ad campaigns, and national competitions.",
    logo: "🎯",
    banner: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80",
    nextEvent: "Digital Ad Agency Field Trip to Under Armour HQ (Thursday 1 PM)",
    aboutText: "AMA UMD College Park is an affiliated collegiate chapter of the American Marketing Association providing certified training in Google Analytics, HubSpot, and SEO.",
    meetingTime: "Thursdays @ 5:00 PM",
    meetingLocation: "Robert H. Smith School of Business (Van Munching Hall) Rm 110",
    foundedYear: 1978,
    tags: ["Marketing", "Branding", "Social Media", "Advertising", "SEO"],
    contactEmail: "amaumd@gmail.com",
    instagram: "@amaumd",
    discordUrl: "#",
    dues: "$30 / Year (National AMA Membership)",
    sgaBudget: 5800,
    council: "Professional",
    status: "Active",
    leadership: [
      { role: "President", name: "Lucas Meyers", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
      { role: "Agency Director", name: "Kayla Higgins", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" }
    ],
    projects: [
      { id: "p19", title: "UMD College Park Local Business Re-Branding Challenge", description: "Student marketing teams designing digital advertising packages for 5 local restaurants.", status: "In Progress", lead: "Lucas Meyers" }
    ],
    documents: [
      { id: "d17", name: "AMA Collegiate Case Competition Brief.pdf", type: "PDF", size: "1.7 MB", url: "#" }
    ],
  },
  {
    id: "org-glen",
    name: "Environmental Action & Wicomico River Greenway Guardians",
    category: "Volunteer",
    membersCount: 130,
    isJoined: true,
    president: "Cora Sterling (Junior, Environmental Science)",
    description: "Protecting UMD College Park's 12-acre Wicomico River Greenway forest ecosystem, native species restoration, and campus sustainability initiatives.",
    logo: "🌲",
    banner: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80",
    nextEvent: "Washington Quad & Peace Garden Restoration & Native Tree Planting (Saturday 10 AM @ Washington Quad & Peace Garden Pavilion)",
    aboutText: "We maintain nature trails, eliminate invasive English ivy, monitor UMD College Park Run stream water quality, and champion university zero-waste compost goals.",
    meetingTime: "Bi-Weekly Saturdays @ 10:00 AM",
    meetingLocation: "Wicomico River Greenway Forest Pavilion",
    foundedYear: 2001,
    tags: ["Environment", "Sustainability", "Forestry", "Conservation", "Volunteer"],
    contactEmail: "environment@umd.edu",
    instagram: "@umd_green",
    discordUrl: "https://discord.gg/umd-green",
    dues: "$0 / Free",
    sgaBudget: 4900,
    council: "SGA",
    status: "Active",
    leadership: [
      { role: "President", name: "Cora Sterling", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" },
      { role: "Trail Operations Lead", name: "Darius Miller", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80" }
    ],
    projects: [
      { id: "p20", title: "UMD College Park Run Native Wetland Buffer Zone", description: "Planting 250 native ferns and red maple saplings to prevent stormwater runoff erosion.", status: "In Progress", lead: "Cora Sterling" }
    ],
    documents: [
      { id: "d18", name: "Wicomico River Greenway Flora & Fauna Field Guide.pdf", type: "PDF", size: "3.9 MB", url: "#" }
    ],
  },
  {
    id: "org-akpsi",
    name: "Alpha Kappa Psi (Omega Kappa Chapter)",
    category: "Greek",
    membersCount: 74,
    isJoined: false,
    president: "Jason Wu (Senior, Business Analytics)",
    description: "The oldest and largest co-ed professional business fraternity recognized worldwide for developing principled business leaders.",
    logo: "💼",
    banner: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
    nextEvent: "Spring Professional Rush & Case Competition (Wednesday 7 PM @ Tydings Hall)",
    aboutText: "Open to all majors, AKPsi provides professional resume workshops, corporate networking trips to NYC and DC, alumni mentorship, and philanthropic service.",
    meetingTime: "Sundays @ 7:00 PM",
    meetingLocation: "Robert H. Smith School of Business (Van Munching Hall) Rm 310",
    foundedYear: 2006,
    tags: ["Greek Life", "Business", "Co-Ed", "Professional", "Consulting", "Wall Street"],
    contactEmail: "akpsi.omegakappa@gmail.com",
    instagram: "@umd_akpsi",
    discordUrl: "#",
    dues: "$95 / Semester",
    sgaBudget: 5100,
    council: "Professional",
    status: "Active",
    leadership: [
      { role: "President", name: "Jason Wu", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
      { role: "VP of Membership", name: "Maria Santos", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" }
    ],
    projects: [
      { id: "p21", title: "Wall Street Professional Trek to NYC", description: "Visiting Goldman Sachs, Bloomberg, and JPMorgan offices with 20 student members.", status: "In Progress", lead: "Jason Wu" }
    ],
    documents: [
      { id: "d19", name: "AKPsi Professional Rush Guide 2026.pdf", type: "PDF", size: "2.3 MB", url: "#" }
    ],
  }
];

// 24. Initial Volunteer Activities (Enriched Civic Engagement Dataset)
export const initialVolunteerActivities: VolunteerActivity[] = [
  {
    id: "vol-1",
    title: "Campus Food Drive & Baltimore Pantry Distribution",
    category: "Food Drive",
    organizer: "UMD College Park Student Community Service Council & FoodShare",
    organizerAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    location: "Adele H. Stamp Student Union (GSU) North Loading Dock & Food Hub",
    date: "Saturday, Mar 08 • 9:00 AM - 2:00 PM",
    description: "Organizing and packaging 3,000 lbs of fresh produce and nutritious shelf-stable meals for food-insecure commuter students and Baltimore community pantries.",
    progressPercent: 68,
    goalMetric: "32 Volunteers",
    currentMetric: "22 Registered",
    tasks: [
      "Unload supply delivery trucks from Maryland Food Bank",
      "Sort produce, dairy, and canned staples",
      "Assemble balanced family-size food hampers",
      "Manage contactless student check-in & distribution desk",
    ],
    status: "Recruiting",
    roles: [
      { id: "r1", name: "Shift Coordinator", spotsNeeded: 2, spotsFilled: 2, hoursCredit: 5, isClaimed: false },
      { id: "r2", name: "Heavy Loading & Setup", spotsNeeded: 10, spotsFilled: 7, hoursCredit: 4, isClaimed: false },
      { id: "r3", name: "Packing & Sorting Assembly", spotsNeeded: 15, spotsFilled: 11, hoursCredit: 4, isClaimed: true },
      { id: "r4", name: "Recipient Check-In & Greeting", spotsNeeded: 5, spotsFilled: 2, hoursCredit: 3.5, isClaimed: false },
    ],
  },
  {
    id: "vol-2",
    title: "Wicomico River Greenway Native Species Restoration & Trail Cleanup",
    category: "Campus Cleanup",
    organizer: "UMD Environmental Alliance & Wicomico River Greenway Board",
    organizerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    location: "Wicomico River Greenway Trailhead (Near Tydings Hall)",
    date: "Sunday, Mar 09 • 10:00 AM - 1:30 PM",
    description: "Removing invasive English ivy and multiflora rose while planting 120 Maryland native saplings across the 12-acre Wicomico River Greenway forest sanctuary.",
    progressPercent: 80,
    goalMetric: "25 Volunteers",
    currentMetric: "20 Registered",
    tasks: [
      "Identify and eradicate invasive vine patches",
      "Dig planting beds and mulch native oak saplings",
      "Reinforce wood trail borders and erosion swales",
      "Collect and catalog recyclable litter along Paint Branch Creek",
    ],
    status: "Recruiting",
    roles: [
      { id: "r201", name: "Tree Planting Crew", spotsNeeded: 12, spotsFilled: 10, hoursCredit: 3.5, isClaimed: false },
      { id: "r202", name: "Invasive Species Team", spotsNeeded: 8, spotsFilled: 7, hoursCredit: 3.5, isClaimed: false },
      { id: "r203", name: "Trail & Creek Custodian", spotsNeeded: 5, spotsFilled: 3, hoursCredit: 3.5, isClaimed: false },
    ],
  },
  {
    id: "vol-3",
    title: "Baltimore Youth Cyber & STEM Coding Weekend Lab",
    category: "Community Service",
    organizer: "UMD College Park Cybersecurity Club & Baltimore City Schools",
    organizerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    location: "Brendan Iribe Center for Computer Science Computer Lab SC-314",
    date: "Saturday, Mar 15 • 10:00 AM - 2:00 PM",
    description: "1-on-1 hands-on mentoring for local middle & high school students learning Python programming, password defense, and autonomous robotics fundamentals.",
    progressPercent: 55,
    goalMetric: "20 Mentors",
    currentMetric: "11 Registered",
    tasks: [
      "Guide students through interactive Python Turtle & Pygame exercises",
      "Demonstrate basic cyber hygiene and safe browsing concepts",
      "Assist with Raspberry Pi robotics setup",
      "Host Q&A panel on collegiate computing majors",
    ],
    status: "Recruiting",
    roles: [
      { id: "r301", name: "1-on-1 Code Mentor", spotsNeeded: 14, spotsFilled: 8, hoursCredit: 4, isClaimed: false },
      { id: "r302", name: "Hardware & Lab Assistant", spotsNeeded: 4, spotsFilled: 2, hoursCredit: 4, isClaimed: false },
      { id: "r303", name: "Student Host & Speaker", spotsNeeded: 2, spotsFilled: 1, hoursCredit: 4, isClaimed: false },
    ],
  },
  {
    id: "vol-4",
    title: "Maryland SPCA & Shelter Animal Companion Enrichment",
    category: "Community Service",
    organizer: "UMD College Park Pre-Veterinary Society & MD SPCA",
    organizerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    location: "Kenilworth Rescue Center & UMD Campus Quad",
    date: "Saturday, Mar 22 • 11:00 AM - 3:30 PM",
    description: "Assisting rescue shelter staff with canine socialization, outdoor walking, grooming, feline stimulation toys, and public adoption matching.",
    progressPercent: 90,
    goalMetric: "18 Volunteers",
    currentMetric: "16 Registered",
    tasks: [
      "Conduct guided canine enrichment walks on safe trail loops",
      "Craft interactive puzzle feeders and braided rope toys",
      "Assist prospective adopters with pet introductions",
      "Sanitize recovery kennels and exercise yards",
    ],
    status: "Recruiting",
    roles: [
      { id: "r401", name: "Canine Handler & Walker", spotsNeeded: 8, spotsFilled: 8, hoursCredit: 4.5, isClaimed: true },
      { id: "r402", name: "Adoption Event Ambassador", spotsNeeded: 6, spotsFilled: 5, hoursCredit: 4.5, isClaimed: false },
      { id: "r403", name: "Shelter Care Assistant", spotsNeeded: 4, spotsFilled: 3, hoursCredit: 4.5, isClaimed: false },
    ],
  },
  {
    id: "vol-5",
    title: "Senior Living Digital Literacy & Smartphone Workshop",
    category: "Community Service",
    organizer: "SGA Student Outreach & UMD College Park Senior Center",
    organizerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    location: "UMD College Park Senior Center (Washington Ave)",
    date: "Wednesday, Mar 12 • 1:30 PM - 4:30 PM",
    description: "Empowering elderly community members with modern smartphone navigation, telehealth portal access, spam call filtering, and video calling family.",
    progressPercent: 75,
    goalMetric: "12 Volunteers",
    currentMetric: "9 Registered",
    tasks: [
      "Provide patient, 1-on-1 assistance with iOS / Android settings",
      "Teach online patient portal login and pharmacy refill requests",
      "Install and configure spam call & phishing SMS blockers",
      "Set up FaceTime and Zoom family photo sharing",
    ],
    status: "Recruiting",
    roles: [
      { id: "r501", name: "1-on-1 Tech Coach", spotsNeeded: 10, spotsFilled: 7, hoursCredit: 3, isClaimed: false },
      { id: "r502", name: "Presentation Co-Host", spotsNeeded: 2, spotsFilled: 2, hoursCredit: 3, isClaimed: false },
    ],
  },
  {
    id: "vol-6",
    title: "American Red Cross Blood & Bone Marrow Donor Drive",
    category: "Fundraiser",
    organizer: "UMD Pre-Med Association & Red Cross Greater Chesapeake",
    organizerAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    location: "Eppley Recreation Center (ERC) (PAC) Multipurpose Activity Gym",
    date: "Thursday, Mar 20 • 9:00 AM - 4:00 PM",
    description: "Coordinating donor intake, hydration/recovery hospitality, and swab testing for the National Be The Match Bone Marrow Registry.",
    progressPercent: 60,
    goalMetric: "24 Volunteers",
    currentMetric: "15 Registered",
    tasks: [
      "Check in registered donors and manage scheduling queue",
      "Monitor donor recovery lounge and distribute refreshments",
      "Administer cheek swab kits for Bone Marrow Registry",
      "Maintain sterile check-in stations and donor gift bags",
    ],
    status: "Recruiting",
    roles: [
      { id: "r601", name: "Morning Shift (9am-12:30pm)", spotsNeeded: 12, spotsFilled: 8, hoursCredit: 3.5, isClaimed: false },
      { id: "r602", name: "Afternoon Shift (12:30pm-4pm)", spotsNeeded: 12, spotsFilled: 7, hoursCredit: 3.5, isClaimed: false },
    ],
  },
  {
    id: "vol-7",
    title: "UMD College Park Community Clean-Up & Bateman Street Corridor Spruce",
    category: "Campus Cleanup",
    organizer: "UMD College Park Town & Gown Student Civic Coalition",
    organizerAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    location: "South Campus Gateway & Bateman Street Sidewalks",
    date: "Sunday, Mar 16 • 9:30 AM - 12:30 PM",
    description: "Beautifying pedestrian avenues connecting campus to Downtown UMD College Park with street sweeping, flower bed mulching, and graffiti removal.",
    progressPercent: 85,
    goalMetric: "30 Volunteers",
    currentMetric: "26 Registered",
    tasks: [
      "Sweep and pick up debris along York Rd pedestrian paths",
      "Mulch roadside tree wells and replant native pansies",
      "Clean safety signage and blue light surrounds",
      "Sort glass, aluminum, and compostable organics",
    ],
    status: "Recruiting",
    roles: [
      { id: "r701", name: "Street Clean Crew", spotsNeeded: 20, spotsFilled: 18, hoursCredit: 3, isClaimed: false },
      { id: "r702", name: "Landscape & Planting Crew", spotsNeeded: 10, spotsFilled: 8, hoursCredit: 3, isClaimed: false },
    ],
  },
  {
    id: "vol-8",
    title: "Reading Partners Baltimore Elementary Literacy Coaching",
    category: "Community Service",
    organizer: "UMD College Park College of Education Outreach",
    organizerAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    location: "UMD College Park Elementary Partner School (Free Shuttle Provided)",
    date: "Friday, Mar 14 • 1:00 PM - 3:30 PM",
    description: "Providing structured 1-on-1 phonics and reading comprehension tutoring to elementary students falling below grade-level literacy.",
    progressPercent: 70,
    goalMetric: "15 Coaches",
    currentMetric: "11 Registered",
    tasks: [
      "Follow structured curriculum reading modules with paired student",
      "Guide vocabulary flashcards and phonics exercises",
      "Log student reading milestone progress notes",
      "Provide positive praise and motivational sticker tracking",
    ],
    status: "Recruiting",
    roles: [
      { id: "r801", name: "1-on-1 Reading Coach", spotsNeeded: 15, spotsFilled: 11, hoursCredit: 2.5, isClaimed: false },
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
    labName: "Autonomous Security & Systems Lab (Brendan Iribe Center for Computer Science Rm 314)",
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
    title: "Adele H. Stamp Student Union (The Stamp) (PAGAC) Student Technology Assistant",
    department: "Albert S. Adele H. Stamp Student Union (The Stamp) (PAGAC) · Tech Desk",
    type: "Student Assistant",
    payRate: "$16.50 / hr",
    hoursPerWeek: "12-15 hrs/week",
    location: "Adele H. Stamp Student Union (The Stamp) (PAGAC) 1st Floor",
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
    roomLocation: "Albert S. Adele H. Stamp Student Union (The Stamp) (PAGAC) 2nd Floor, Pod B",
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
    room: "Brendan Iribe Center for Computer Science 204",
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
    room: "Discovery District & Innovation Hub Rm 314",
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
    room: "Brendan Iribe Center for Computer Science 118",
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
    room: "Devilbiss Hall Rm 402",
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
    channelName: "UMD College Park CIS Department",
    channelLogo: "🛡️",
    category: "Guest Lectures",
    duration: "48:20",
    viewsCount: 1420,
    likesCount: 180,
    thumbnailUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80",
    description: "Dr. Marcus Vance (DARPA Lab) presents autonomous loop defense systems, live containment architectures, and AI vulnerability analysis at the Brendan Iribe Center for Computer Science.",
    publishedDate: "2 days ago",
  },
];

// 28. Initial Polls
export const initialCampusPolls: CampusPoll[] = [
  {
    id: "poll-1",
    question: "Where should Student Government allocate the $10,000 spring surplus budget?",
    organizer: "UMD College Park Student Government Association (SGA)",
    scope: "Campus Wide",
    totalVotes: 842,
    userVotedOptionId: "opt-1",
    options: [
      { id: "opt-1", text: "A. Student Events & Cultural Festivals @ Union", votes: 380 },
      { id: "opt-2", text: "B. Eppley Recreation Center (ERC) & Fitness Suites Upgrades", votes: 190 },
      { id: "opt-3", text: "C. Adele H. Stamp Student Union (The Stamp) (PAGAC) Quiet Pod Tech Displays", votes: 172 },
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
    sender: "UMD College Park Student Affairs",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    text: "📢 Reminder: Spring Career Fair at Terrapin Stadium registration closes Friday at 5:00 PM. 120+ employers attending.",
    time: "2:00 PM",
    isMe: false,
    createdAt: new Date().toISOString(),
  },
];

// ─────────────────────────────────────────────────────────────
// 31. TERPHOUSING DOMAIN MODELS & SEED DATASETS
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
    title: "University Village UMD College Park — 2BR Renovated Suite",
    propertyType: "Apartment",
    address: "201 E Joppa Rd, UMD College Park, MD 21286",
    neighborhood: "UMD College Park Town Center District",
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
    shuttleRouteName: "Terrapin Bus Gold Route #14",
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
    landlordName: "UMD College Park Village Residential Mgmt",
    landlordContact: "(410) 825-4490",
    roomsAvailable: 1,
    mapCoords: { x: 55, y: 22 },
    isSaved: true,
    description: "Modern student apartment with individual leases, private bathroom per room, study lounge, and direct stop for the UMD College Park Gold Shuttle.",
  },
  {
    id: "hse-2",
    title: "The Quarters at UMD College Park Town Center — 4BR Shared House",
    propertyType: "Shared House",
    address: "8600 LaSalle Rd, UMD College Park, MD 21286",
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
    shuttleRouteName: "Shuttle-UM Route 104 Express",
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
    landlordName: "David Sterling (Verified Verified UMD Alum Owner)",
    landlordContact: "(410) 555-0192",
    roomsAvailable: 2,
    mapCoords: { x: 72, y: 18 },
    isSaved: false,
    description: "Spacious colonial student house with hard-wood floors, high-speed fiber internet, and quiet residential neighborhood 1 mile from Adele H. Stamp Student Union (The Stamp) (PAGAC).",
  },
  {
    id: "hse-3",
    title: "Altus UMD College Park Row — Modern Studio Suite",
    propertyType: "Apartment",
    address: "109 E Chesapeake Ave, UMD College Park, MD 21286",
    neighborhood: "Downtown UMD College Park Hub",
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
    shuttleRouteName: "Terrapin Bus Downtown Line",
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
    landlordName: "UMD College Park Row Properties",
    landlordContact: "(410) 704-8800",
    roomsAvailable: 1,
    mapCoords: { x: 42, y: 15 },
    isSaved: false,
    description: "Luxury off-campus student high-rise right above Whole Foods and Target in Downtown UMD College Park. 10-minute walk to Red Square.",
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
    bio: "CS sophomore looking for 1 or 2 roommates for a 2-4BR apartment near UMD College Park Town Center. Quiet during weeknights, into gaming and gym on weekends.",
    preferredLocations: ["University Village", "UMD College Park Row", "The Quarters"],
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
    compatibilityTags: ["✓ Match on Quiet Hours", "✓ Target Move-in August", "✓ Verified UMD Student"],
    bio: "UMD Nursing junior with clinical rotations. Need a respectful, peaceful place to study and recharge.",
    preferredLocations: ["Altus UMD College Park Row", "Cardiff Hall Apts"],
    isConnected: false,
  },
];

export const initialHousingTours: HousingTourBooking[] = [
  {
    id: "tour-1",
    propertyId: "hse-1",
    propertyTitle: "University Village UMD College Park — 2BR Renovated Suite",
    propertyAddress: "201 E Joppa Rd, UMD College Park, MD",
    tourDate: "Saturday, Mar 08, 2026",
    tourTimeSlot: "11:00 AM",
    tourType: "In-Person Guided Tour",
    status: "Confirmed",
    landlordName: "UMD College Park Village Residential Mgmt",
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
// 32. DIGITAL TERPID WALLET & DINING DOLLARS
// ─────────────────────────────────────────────────────────────
export interface TerpIDPass {
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

export const initialTerpIDPass: TerpIDPass = {
  studentName: "Kwesi Asiedu",
  studentId: "#8492-KWESI",
  major: "Information Technology",
  classStanding: "Junior",
  mealSwipesRemaining: 14,
  diningDollarsBalance: 284.50,
  retailPointsBalance: 120.00,
  printQuotaBalance: 42.50,
  dormAccessZone: "Terrapin Square • Marshall Hall Suite 304",
  barcodeNumber: "2849201948201",
  lastUsedTime: "Today at 12:45 PM",
  lastUsedLocation: "Terrapin Square Grill (1 Swipe)",
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
    facilityName: "Albert S. Adele H. Stamp Student Union (The Stamp) (PAGAC)",
    zoneName: "Floor 2 & 3 Quiet Pods",
    occupancyPercent: 38,
    statusLevel: "Quiet",
    availableDesksOrSpots: 64,
    icon: "📚",
    bestStudyTime: "Now - 4:00 PM (Ideal study window)",
  },
  {
    id: "fac-2",
    facilityName: "Eppley Recreation Center (ERC) (PAC) Fitness Center",
    zoneName: "Cardio & Free Weight Deck",
    occupancyPercent: 74,
    statusLevel: "Busy",
    availableDesksOrSpots: 18,
    icon: "🏋️",
    bestStudyTime: "Best after 7:30 PM",
  },
  {
    id: "fac-3",
    facilityName: "Adele H. Stamp Student Union (GSU) Food Court",
    zoneName: "Cool Beans Coffee (PAGAC) & Main Seating Atrium",
    occupancyPercent: 45,
    statusLevel: "Moderate",
    availableDesksOrSpots: 52,
    icon: "🍔",
    bestStudyTime: "Short lines right now",
  },
  {
    id: "fac-4",
    facilityName: "Brendan Iribe Center for Computer Science Commons",
    zoneName: "3rd Floor Tech Collaboration Area",
    occupancyPercent: 22,
    statusLevel: "Quiet",
    availableDesksOrSpots: 35,
    icon: "🔬",
    bestStudyTime: "High-speed Wi-Fi & open screens",
  },
];

// ─────────────────────────────────────────────────────────────
// 34. TERP SAFEWALK — VIRTUAL NIGHT ESCORT
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
  originName: "Albert S. Adele H. Stamp Student Union (The Stamp) (PAGAC)",
  destinationName: "Terrapin Square • Marshall Hall",
  estimatedMinutes: 8,
  guardianName: "Maya Chen (Cybersecurity Circle)",
  guardianAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  guardianPhone: "(410) 555-0182",
  status: "ACTIVE",
  startedAt: "3 mins ago",
  currentProgressPercent: 45,
};

// ─────────────────────────────────────────────────────────────
// 35. UMD ALUMNI MENTORSHIP & CAREER SYNC
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
    bio: "Former UMD College Park Cybersecurity Club president. Passionate about helping UMD undergraduates break into cloud zero-trust and enterprise threat hunting.",
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
    bio: "UMD IT alumna mentoring underrepresented students in AI-driven vulnerability management and DoD cATO compliance.",
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
    bio: "UMD College Park Hackathon winner now building agentic cloud pipelines. Offering resume reviews and mock technical interviews.",
    isAvailableForCoffeeChat: true,
    matchedSkills: ["Next.js", "TypeScript", "LLM Fine-Tuning", "DynamoDB"],
  },
];

// ─────────────────────────────────────────────────────────────
// 36. TERPSYNC IDENTITY PERSONAS & ROLE-BASED ACCESS CONTROL (RBAC)
// ─────────────────────────────────────────────────────────────
export type UserRole = "STUDENT" | "FACULTY" | "CLUB_LEAD" | "STAFF" | "ADMIN";

export const initialCampusPersonas: UserProfile[] = [
  {
    id: "usr-1",
    name: "Kwesi Asiedu",
    email: "kasiedu@students.umd.edu",
    studentId: "#8492-KWESI",
    major: "Information Technology",
    minor: "Cybersecurity & Autonomous Systems",
    gradYear: 2026,
    classStanding: "Senior",
    dormBuilding: "Marshall Hall (Terrapin Square)",
    bio: "Undergraduate researcher focused on Cloud Security, Autonomous Perimeter Defense, and Zero-Trust campus architectures. SGA Technology Liaison.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    isVerified: true,
    role: "STUDENT",
    interests: ["Cloud Security", "Full-Stack Dev", "Zero Trust", "AI Agents", "Campus Gov"],
    goals: ["Present Research at CyberSummit 2026", "Complete Senior Capstone", "Lead HackUMD College Park"],
    eventsAttendedCount: 28,
    volunteerHoursLogged: 42.5,
    leadershipRoles: ["SGA Tech Chair", "Cybersecurity Club Vice President"],
    achievements: ["Dean's List 5x", "UMD College Park Innovator Grant 2025", "Certified Terrapin Leader"],
    projects: ["UMD College ParkSync Platform", "AXIOM Zero-Trust Suite", "Campus Beacon Map"],
    isLocationSharing: true,
    ghostModeEnabled: false,
    currentLocationName: "Albert S. Adele H. Stamp Student Union (The Stamp) (PAGAC) • 3rd Floor",
  },
  {
    id: "usr-2",
    name: "Dr. Catherine Hayes",
    email: "chayes@umd.edu",
    studentId: "#FAC-2091",
    major: "Faculty / Computer Science",
    minor: "Director, ASSL Research Lab",
    gradYear: 2012,
    classStanding: "Graduate",
    dormBuilding: "Faculty Commons • Brendan Iribe Center for Computer Science",
    bio: "Associate Professor of Computer & Information Sciences. Principal Investigator for the UMD College Park Autonomous Security Systems Lab.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
    isVerified: true,
    role: "FACULTY",
    interests: ["Adversarial AI", "DoD Security", "Undergraduate Research", "Curriculum Design"],
    goals: ["Publish IEEE Cyber Paper", "Expand NSF Student Grants"],
    eventsAttendedCount: 45,
    volunteerHoursLogged: 60,
    leadershipRoles: ["Faculty Senate Member", "Cyber Curriculum Chair"],
    achievements: ["UMD College Park Excellence in Teaching 2024", "NSF Career Award"],
    projects: ["Autonomous Threat Mitigation", "Secure Microkernel Architecture"],
    isLocationSharing: true,
    ghostModeEnabled: false,
    currentLocationName: "Brendan Iribe Center for Computer Science Rm 304",
  },
  {
    id: "usr-3",
    name: "Darren Vance",
    email: "dvance2@students.umd.edu",
    studentId: "#8210-DARREN",
    major: "Cybersecurity Operations",
    gradYear: 2026,
    classStanding: "Senior",
    dormBuilding: "Carroll Hall",
    bio: "UMD College Park Cybersecurity Club President & SGA Senator. Passionate about collegiate cyber defense competitions and student advocacy.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    isVerified: true,
    role: "CLUB_LEAD",
    interests: ["Red Teaming", "CTF Competitions", "Student Orgs", "Campus Radio"],
    goals: ["Qualify for National CCDC", "Host 500-student TerpCTF"],
    eventsAttendedCount: 36,
    volunteerHoursLogged: 55,
    leadershipRoles: ["Cybersecurity Club President", "SGA Senator"],
    achievements: ["Mid-Atlantic CCDC Finalist", "Student Leadership Award"],
    projects: ["TerpCTF Cyber Range", "Student Discord Bot"],
    isLocationSharing: true,
    ghostModeEnabled: false,
    currentLocationName: "Adele H. Stamp Student Union (GSU) Food Court",
  },
  {
    id: "usr-4",
    name: "Dean Marcus Vance",
    email: "mvance@umd.edu",
    studentId: "#ADM-001",
    major: "Student Affairs & Security Ops",
    minor: "Chief Administration Officer",
    gradYear: 2004,
    classStanding: "Graduate",
    dormBuilding: "Administration Building Rm 400",
    bio: "Executive Administrator for University of Maryland, College Park Digital Campus Operations, Emergency Preparedness & Student Life Systems.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
    isVerified: true,
    role: "ADMIN",
    interests: ["Campus Safety", "Institutional Policy", "Emergency Management", "Student Welfare"],
    goals: ["Achieve 100% Digital UMD College ParkSync Campus Coverage", "Zero Safety Incident Tolerance"],
    eventsAttendedCount: 120,
    volunteerHoursLogged: 150,
    leadershipRoles: ["Dean of Student Affairs", "Emergency Management Council Chair"],
    achievements: ["State of Maryland Higher Ed Leadership Medal", "UMPD Commendation"],
    projects: ["UMD College ParkSync Master Campus Mesh", "Blue Light Digital Beacon Network"],
    isLocationSharing: false,
    ghostModeEnabled: true,
    currentLocationName: "Administration Building",
  },
];

// ─────────────────────────────────────────────────────────────
// 37. TERPSYNC ADMINISTRATION CENTER DATASETS
// ─────────────────────────────────────────────────────────────
export interface AdminVerificationRequest {
  id: string;
  applicantName: string;
  email: string;
  studentOrFacultyId: string;
  departmentOrMajor: string;
  submittedAt: string;
  idCardImageUrl: string;
  type: "STUDENT" | "FACULTY" | "ORGANIZATION_CHARTER" | "LANDLORD";
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export const initialAdminVerifications: AdminVerificationRequest[] = [
  {
    id: "ver-1",
    applicantName: "Aiden Vance",
    email: "avance5@students.umd.edu",
    studentOrFacultyId: "#9021-AIDEN",
    departmentOrMajor: "B.S. Cyber Operations '27",
    submittedAt: "12 mins ago",
    idCardImageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80",
    type: "STUDENT",
    status: "PENDING",
  },
  {
    id: "ver-2",
    applicantName: "Dr. Evelyn Reed",
    email: "ereed@umd.edu",
    studentOrFacultyId: "#FAC-4019",
    departmentOrMajor: "Department of Physics & Astronomy",
    submittedAt: "1 hour ago",
    idCardImageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
    type: "FACULTY",
    status: "PENDING",
  },
  {
    id: "ver-3",
    applicantName: "UMD College Park Robotics & Autonomous Drone Club",
    email: "robotics@clubs.umd.edu",
    studentOrFacultyId: "#ORG-883",
    departmentOrMajor: "Student Government Association",
    submittedAt: "3 hours ago",
    idCardImageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&auto=format&fit=crop&q=80",
    type: "ORGANIZATION_CHARTER",
    status: "PENDING",
  },
  {
    id: "ver-4",
    applicantName: "The York UMD College Park Student Residences",
    email: "leasing@theyorkumd.com",
    studentOrFacultyId: "#LL-5012",
    departmentOrMajor: "Verified Off-Campus Housing Provider",
    submittedAt: "5 hours ago",
    idCardImageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&auto=format&fit=crop&q=80",
    type: "LANDLORD",
    status: "PENDING",
  },
];

export interface AdminSecurityAuditLog {
  id: string;
  timestamp: string;
  eventType: "AUTH_LOGIN" | "ROLE_ELEVATION" | "SAFEWALK_ALERT" | "CONTENT_MODERATION" | "ID_VERIFICATION" | "UMPD_DISPATCH";
  severity: "INFO" | "WARNING" | "CRITICAL";
  actor: string;
  details: string;
  ipAddress: string;
}

export const initialAdminAuditLogs: AdminSecurityAuditLog[] = [
  {
    id: "log-1",
    timestamp: "Just now",
    eventType: "SAFEWALK_ALERT",
    severity: "INFO",
    actor: "Kwesi Asiedu (#8492)",
    details: "SafeWalk escort initiated: Adele H. Stamp Student Union (The Stamp) (PAGAC) ➔ Marshall Hall Dorm (Companion: Maya Chen)",
    ipAddress: "10.24.88.19 (Campus WiFi-eduroam)",
  },
  {
    id: "log-2",
    timestamp: "4 mins ago",
    eventType: "AUTH_LOGIN",
    severity: "INFO",
    actor: "Dr. Catherine Hayes (#FAC-2091)",
    details: "Duo MFA 2-Factor Authentication verified successfully from Brendan Iribe Center for Computer Science Lab",
    ipAddress: "10.24.12.44 (Faculty Ethernet)",
  },
  {
    id: "log-3",
    timestamp: "18 mins ago",
    eventType: "CONTENT_MODERATION",
    severity: "WARNING",
    actor: "Automated AI Guardrail",
    details: "Spam listing flagged in Marketplace ('Unverified Crypto Mining Rig') - auto-quarantined",
    ipAddress: "192.168.1.1 (Internal System)",
  },
  {
    id: "log-4",
    timestamp: "32 mins ago",
    eventType: "ID_VERIFICATION",
    severity: "INFO",
    actor: "Dean Marcus Vance (#ADM-001)",
    details: "Approved verified student badge for 14 incoming transfer students",
    ipAddress: "10.24.1.2 (Admin Office)",
  },
  {
    id: "log-5",
    timestamp: "1 hour ago",
    eventType: "UMPD_DISPATCH",
    severity: "INFO",
    actor: "TerpOrbit Blue Light #04",
    details: "Routine 24h health-check beacon ping passed (Burgett Quad)",
    ipAddress: "10.24.99.4 (IoT Safety Beacon)",
  },
];

export interface AdminSystemHealth {
  apiLatencyMs: number;
  databaseSyncStatus: string;
  activeSessionsCount: number;
  cpuLoadPercent: number;
  memoryUsagePercent: number;
  uptimePercent: number;
  tupdBeaconHealth: string;
  noaaApiStatus: string;
}

export const initialAdminSystemHealth: AdminSystemHealth = {
  apiLatencyMs: 14,
  databaseSyncStatus: "100% Synced (Neon Serverless Postgres)",
  activeSessionsCount: 4892,
  cpuLoadPercent: 18,
  memoryUsagePercent: 32,
  uptimePercent: 99.98,
  tupdBeaconHealth: "24/24 Blue Light Beacons Operational",
  noaaApiStatus: "Connected (api.weather.gov)",
};

