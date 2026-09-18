export interface EmailAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  from: {
    name: string;
    email: string;
    avatar?: string;
  };
  to: {
    name: string;
    email: string;
  }[];
  subject: string;
  preview: string;
  body: string;
  date: string;
  time: string;
  isUnread: boolean;
  isStarred: boolean;
  isFlagged: boolean;
  hasAttachment: boolean;
  attachments?: EmailAttachment[];
  folder: "inbox" | "sent" | "drafts" | "archive" | "spam" | "trash" | "snoozed";
  category: "primary" | "social" | "updates" | "promotions" | "security";
  labels: string[];
  securityStatus: {
    spfPass: boolean;
    dkimPass: boolean;
    dmarcPass: boolean;
    tlsEncrypted: boolean;
    threatScore: number; // 0 - 100
    verificationBadge?: string;
  };
  aiSummary?: string;
  suggestedAction?: {
    type: "CREATE_MEETING" | "REPLY" | "DOWNLOAD_DOC" | "PAY_INVOICE";
    label: string;
    meetingDetails?: {
      title: string;
      suggestedTime: string;
      durationMinutes: number;
    };
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // e.g. "2026-08-31T10:00:00"
  endTime: string;
  dateLabel: string;
  timeLabel: string;
  location?: string;
  meetingLink?: string;
  meetingId?: string;
  attendees: {
    name: string;
    email: string;
    avatar?: string;
    status: "ACCEPTED" | "TENTATIVE" | "DECLINED" | "INVITED";
  }[];
  category: "TEAM_SYNC" | "ONE_ON_ONE" | "LECTURE" | "CLIENT_DEMO" | "ALL_HANDS";
  color: string;
}

export interface TeamsMeetingParticipant {
  id: string;
  name: string;
  email: string;
  role: "HOST" | "PRESENTER" | "ATTENDEE";
  avatar: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isHandRaised: boolean;
  isSpeaking: boolean;
}

export interface TeamsMeetingSession {
  meetingId: string;
  title: string;
  hostName: string;
  passcode: string;
  joinUrl: string;
  status: "SCHEDULED" | "ACTIVE" | "ENDED";
  activeSpeaker: string;
  participants: TeamsMeetingParticipant[];
  chatMessages: {
    id: string;
    sender: string;
    time: string;
    text: string;
    isAiNote?: boolean;
  }[];
  liveCaptions: {
    speaker: string;
    text: string;
    timestamp: string;
  }[];
  aiSummaryNotes?: {
    overview: string;
    decisions: string[];
    actionItems: { assignee: string; task: string; due: string }[];
  };
}

export interface TeamsChannelPost {
  id: string;
  sender: {
    name: string;
    email: string;
    avatar: string;
    title: string;
  };
  timestamp: string;
  content: string;
  attachments?: { name: string; size: string; icon: string }[];
  reactions: { emoji: string; count: number; userReacted: boolean }[];
  repliesCount: number;
}

export interface TeamsChannel {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  unreadCount: number;
  membersCount: number;
  category: "ENGINEERING" | "CAMPUS" | "GOVERNANCE" | "PROJECTS";
  posts: TeamsChannelPost[];
}

export interface DriveFile {
  id: string;
  name: string;
  size: string;
  updatedAt: string;
  owner: string;
  type: "PDF" | "DOCX" | "IMAGE" | "CODE" | "SPREADSHEET";
  icon: string;
  sharedWith: string[];
  isStarred: boolean;
}

export interface ContactEntry {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  presence: "AVAILABLE" | "BUSY" | "IN_MEETING" | "AWAY" | "OFFLINE";
  phone: string;
}

/* ========================================================================= */
/* INITIAL SEED DATASETS */
/* ========================================================================= */

export const initialEmailMessages: EmailMessage[] = [
  {
    id: "mail-101",
    threadId: "th-101",
    from: {
      name: "Dr. Catherine Hayes",
      email: "catherine.hayes@towson.edu",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    },
    to: [
      { name: "Kwesi Asiedu", email: "kwesi@towson.edu" },
    ],
    subject: "COSC 421 / AXIOM Lab: Midterm Project Architecture & Sprint Sync",
    preview: "Can we schedule a 30-min Teams sync tomorrow at 2:00 PM to review your virtual memory pager simulation?",
    body: `Hi Kwesi,

Great progress on the OS kernel simulation repository. Your integration of the automated regression suite looks rock solid.

Can we schedule a quick 30-minute Axiom Teams sync tomorrow (Tuesday) at 2:00 PM to walk through the paging algorithms before the class presentation?

I've attached the grading rubric and research benchmark dataset below.

Best regards,
Dr. Catherine Hayes
Associate Professor & ASSL Cyber Lab Director
Towson University`,
    date: "Today",
    time: "9:42 AM",
    isUnread: true,
    isStarred: true,
    isFlagged: true,
    hasAttachment: true,
    attachments: [
      { id: "att-1", name: "COSC421_VirtualMemory_Rubric.pdf", size: "1.4 MB", type: "PDF" },
      { id: "att-2", name: "Kernel_Paging_Benchmark.csv", size: "480 KB", type: "CSV" },
    ],
    folder: "inbox",
    category: "primary",
    labels: ["Academics", "COSC 421", "Research"],
    securityStatus: {
      spfPass: true,
      dkimPass: true,
      dmarcPass: true,
      tlsEncrypted: true,
      threatScore: 0,
      verificationBadge: "VERIFIED_ACADEMIC_DOMAIN",
    },
    aiSummary: "Dr. Hayes praised your kernel paging simulation and requested a 30-minute Teams sync tomorrow at 2:00 PM.",
    suggestedAction: {
      type: "CREATE_MEETING",
      label: "Schedule Axiom Meeting (Tomorrow, 2:00 PM)",
      meetingDetails: {
        title: "COSC 421 Midterm Project Architecture Sync",
        suggestedTime: "Tomorrow at 2:00 PM",
        durationMinutes: 30,
      },
    },
  },
  {
    id: "mail-102",
    threadId: "th-102",
    from: {
      name: "Expedite Consults Security Operations",
      email: "security-ops@expediteconsults.com",
      avatar: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=150&auto=format&fit=crop&q=80",
    },
    to: [
      { name: "Kwesi Asiedu", email: "kwesi@expediteconsults.com" },
    ],
    subject: "🛡️ AXIOM Zero-Trust cATO Defense Pipeline: Deployment Health Notice",
    preview: "Automated vulnerability scan completed across 14 enterprise microservices. Zero critical CVEs found.",
    body: `Hello Team,

The automated VeritasLens™ and AXIOM cATO pipeline completed its continuous compliance audit across all 14 containerized nodes in cluster 'us-east-towson-alpha'.

Summary Metrics:
• Total Scanned Artifacts: 1,482
• High Severity Vulnerabilities: 0
• cATO Compliance Health: 99.98%
• TLS 1.3 Strict Cipher Enforced: 100%

Review full telemetry logs inside your Expedite Consults Security Dashboard.`,
    date: "Today",
    time: "8:15 AM",
    isUnread: true,
    isStarred: false,
    isFlagged: false,
    hasAttachment: false,
    folder: "inbox",
    category: "security",
    labels: ["Security", "AXIOM", "cATO"],
    securityStatus: {
      spfPass: true,
      dkimPass: true,
      dmarcPass: true,
      tlsEncrypted: true,
      threatScore: 0,
      verificationBadge: "AUTHENTICATED_ENTERPRISE_SYSTEM",
    },
    aiSummary: "Automated scan across 14 nodes passed with 0 vulnerabilities and 99.98% compliance.",
  },
  {
    id: "mail-103",
    threadId: "th-103",
    from: {
      name: "Marcus Vance (Dean of Students)",
      email: "mvance@towson.edu",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    to: [
      { name: "Kwesi Asiedu", email: "kwesi@towson.edu" },
      { name: "Darren Vance", email: "darren.vance@towson.edu" },
    ],
    subject: "Towson Spring Cyber Hackathon & SGA Grant Allocation ($1,500 Approved)",
    preview: "Your student charter and room reservation for Union Room 204 has been officially authorized.",
    body: `Kwesi & Darren,

I am pleased to confirm that the Student Government Association (SGA) has officially approved the $1,500 grant allocation for the upcoming Towson University Cyber CTF and Hackathon.

Reservation Details:
• Location: University Union Ballroom & Rm 204
• Date: April 14, 2026
• Catering Swipes Authorization: 150 student vouchers

Let me know if you require additional A/V equipment or TUPD security escorts.

Dean Marcus Vance
Towson University Division of Student Affairs`,
    date: "Yesterday",
    time: "4:30 PM",
    isUnread: false,
    isStarred: true,
    isFlagged: false,
    hasAttachment: true,
    attachments: [
      { id: "att-3", name: "SGA_Grant_Charter_Approval_2026.pdf", size: "820 KB", type: "PDF" },
    ],
    folder: "inbox",
    category: "primary",
    labels: ["SGA", "Hackathon", "Grants"],
    securityStatus: {
      spfPass: true,
      dkimPass: true,
      dmarcPass: true,
      tlsEncrypted: true,
      threatScore: 0,
      verificationBadge: "VERIFIED_FACULTY_LEADERSHIP",
    },
    aiSummary: "Dean Vance approved the $1,500 SGA grant and Union Rm 204 reservation for the Cyber CTF.",
  },
  {
    id: "mail-104",
    threadId: "th-104",
    from: {
      name: "T. Rowe Price Career Gateway",
      email: "talent-acquisition@troweprice.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    to: [
      { name: "Kwesi Asiedu", email: "kwesi@towson.edu" },
    ],
    subject: "Invitation to Interview: Cloud Security & SRE Intern (Summer 2026)",
    preview: "Your profile was matched via the Towson Alumni Mesh. We would like to invite you for a 45-min technical interview.",
    body: `Dear Kwesi,

Following your referral through the Towson University Alumni Mentorship Mesh, our Cloud Architecture team was extremely impressed by your experience with VeritasLens, cATO compliance, and Next.js microservices.

We would love to invite you for a 45-minute virtual technical discussion. Please select a time on our calendar that suits your schedule.

Warm regards,
Senior Technical Talent Partner
T. Rowe Price Enterprise Technology`,
    date: "Aug 29",
    time: "11:20 AM",
    isUnread: false,
    isStarred: true,
    isFlagged: true,
    hasAttachment: false,
    folder: "inbox",
    category: "primary",
    labels: ["Career", "Internships", "Interviews"],
    securityStatus: {
      spfPass: true,
      dkimPass: true,
      dmarcPass: true,
      tlsEncrypted: true,
      threatScore: 0,
      verificationBadge: "VERIFIED_CORPORATE_PARTNER",
    },
    aiSummary: "T. Rowe Price invited you for a 45-minute Cloud Security internship technical interview.",
  },
  {
    id: "mail-105",
    threadId: "th-105",
    from: {
      name: "Canvas LMS Notifications",
      email: "notifications@instructure.com",
      avatar: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80",
    },
    to: [
      { name: "Kwesi Asiedu", email: "kwesi@towson.edu" },
    ],
    subject: "Assignment Due in 6 Hours: Lab 3 - Virtual Memory Pager (COSC 421)",
    preview: "Reminder: Lab 3 Virtual Memory Pager is due tonight by 11:59 PM. Points: 100.",
    body: `This is an automated reminder that the following assignment is due soon:

Course: COSC 421 - Operating Systems
Assignment: Lab 3 - Virtual Memory Pager & Page Fault Simulator
Due Date: Tonight at 11:59 PM EDT
Points: 100 pts

Ensure you submit your source tarball and performance PDF before the deadline.`,
    date: "Today",
    time: "6:00 AM",
    isUnread: false,
    isStarred: false,
    isFlagged: false,
    hasAttachment: false,
    folder: "inbox",
    category: "updates",
    labels: ["Canvas", "Deadlines"],
    securityStatus: {
      spfPass: true,
      dkimPass: true,
      dmarcPass: true,
      tlsEncrypted: true,
      threatScore: 0,
    },
  },
  {
    id: "mail-106",
    threadId: "th-106",
    from: {
      name: "suspicious-bank-alert@net-security-fake.xyz",
      email: "support@net-security-fake.xyz",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    },
    to: [
      { name: "Kwesi Asiedu", email: "kwesi@towson.edu" },
    ],
    subject: "⚠️ URGENT: Your OneCard Account Access Is Suspended. Click to Verify",
    preview: "Your TU OneCard credentials require immediate re-authentication. Failure will result in deactivation.",
    body: `Dear User,

Your university card session was terminated due to suspicious activity. Click the link below to input your password and MFA code immediately:

http://phish-secure-login-fake.xyz/towson-onecard

TUPD Security Center`,
    date: "Aug 28",
    time: "2:14 PM",
    isUnread: false,
    isStarred: false,
    isFlagged: false,
    hasAttachment: false,
    folder: "spam",
    category: "security",
    labels: ["Quarantine", "Phishing"],
    securityStatus: {
      spfPass: false,
      dkimPass: false,
      dmarcPass: false,
      tlsEncrypted: false,
      threatScore: 98,
    },
    aiSummary: "⚠️ PHISHING ALERT: Domain failed SPF/DKIM verification. Links quarantined by AXIOM Zero-Trust.",
  },
];

export const initialCalendarEvents: CalendarEvent[] = [
  {
    id: "evt-1",
    title: "COSC 421: Operating Systems Lecture",
    description: "Memory virtualization, multi-level page tables, and TLB performance benchmarking.",
    startTime: "2026-08-31T10:00:00",
    endTime: "2026-08-31T11:15:00",
    dateLabel: "Today",
    timeLabel: "10:00 AM – 11:15 AM",
    location: "Science Complex Rm 304",
    meetingLink: "https://meet.axiom.com/COSC-421-LECTURE",
    meetingId: "COSC-421",
    attendees: [
      { name: "Dr. Catherine Hayes", email: "catherine.hayes@towson.edu", status: "ACCEPTED" },
      { name: "Kwesi Asiedu", email: "kwesi@towson.edu", status: "ACCEPTED" },
    ],
    category: "LECTURE",
    color: "bg-indigo-500",
  },
  {
    id: "evt-2",
    title: "Axiom Engineering Standup & SRE Sync",
    description: "Review sprint deliverables, cATO pipeline latency, and Vercel edge deployment status.",
    startTime: "2026-08-31T13:00:00",
    endTime: "2026-08-31T13:30:00",
    dateLabel: "Today",
    timeLabel: "1:00 PM – 1:30 PM",
    location: "Axiom Virtual Room 1",
    meetingLink: "https://meet.axiom.com/AXM-STANDUP-842",
    meetingId: "AXM-STANDUP-842",
    attendees: [
      { name: "Kwesi Asiedu", email: "kwesi@expediteconsults.com", status: "ACCEPTED" },
      { name: "Darren Vance", email: "darren@expediteconsults.com", status: "ACCEPTED" },
      { name: "Sarah Chen", email: "sarah.chen@expediteconsults.com", status: "ACCEPTED" },
    ],
    category: "TEAM_SYNC",
    color: "bg-amber-500",
  },
  {
    id: "evt-3",
    title: "Dr. Hayes Research Lab Mentorship",
    description: "Discuss virtual memory optimization papers and IEEE submission draft.",
    startTime: "2026-09-01T14:00:00",
    endTime: "2026-09-01T14:30:00",
    dateLabel: "Tomorrow",
    timeLabel: "2:00 PM – 2:30 PM",
    location: "ASSL Cyber Lab / Axiom Teams",
    meetingLink: "https://meet.axiom.com/HAYES-KWESI-SYNC",
    meetingId: "HAYES-KWESI-SYNC",
    attendees: [
      { name: "Dr. Catherine Hayes", email: "catherine.hayes@towson.edu", status: "ACCEPTED" },
      { name: "Kwesi Asiedu", email: "kwesi@towson.edu", status: "ACCEPTED" },
    ],
    category: "ONE_ON_ONE",
    color: "bg-purple-500",
  },
  {
    id: "evt-4",
    title: "Towson Cyber Summit & Cultural Night",
    description: "Keynote presentation on AI Zero-Trust architectures and campus networking.",
    startTime: "2026-08-31T19:00:00",
    endTime: "2026-08-31T21:30:00",
    dateLabel: "Today",
    timeLabel: "7:00 PM – 9:30 PM",
    location: "University Union Ballrooms",
    meetingLink: "https://meet.axiom.com/TOWSON-CYBER-GALA",
    meetingId: "TOWSON-CYBER-GALA",
    attendees: [
      { name: "Marcus Vance", email: "mvance@towson.edu", status: "ACCEPTED" },
      { name: "Kwesi Asiedu", email: "kwesi@towson.edu", status: "ACCEPTED" },
    ],
    category: "ALL_HANDS",
    color: "bg-emerald-500",
  },
];

export const initialActiveTeamsMeeting: TeamsMeetingSession = {
  meetingId: "AXM-492-831",
  title: "AXIOM Cyber Defense & TowsonSync Architecture Review",
  hostName: "Dr. Catherine Hayes",
  passcode: "849201",
  joinUrl: "https://meet.axiom.com/AXM-492-831",
  status: "ACTIVE",
  activeSpeaker: "Dr. Catherine Hayes",
  participants: [
    {
      id: "p-1",
      name: "Dr. Catherine Hayes",
      email: "catherine.hayes@towson.edu",
      role: "HOST",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
      isMuted: false,
      isVideoOn: true,
      isHandRaised: false,
      isSpeaking: true,
    },
    {
      id: "p-2",
      name: "Kwesi Asiedu (You)",
      email: "kwesi@towson.edu",
      role: "PRESENTER",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      isMuted: false,
      isVideoOn: true,
      isHandRaised: false,
      isSpeaking: false,
    },
    {
      id: "p-3",
      name: "Darren Vance",
      email: "darren.vance@towson.edu",
      role: "ATTENDEE",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
      isMuted: true,
      isVideoOn: true,
      isHandRaised: true,
      isSpeaking: false,
    },
    {
      id: "p-4",
      name: "Sarah Chen (Cloud Lead)",
      email: "sarah.chen@expediteconsults.com",
      role: "ATTENDEE",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80",
      isMuted: true,
      isVideoOn: false,
      isHandRaised: false,
      isSpeaking: false,
    },
  ],
  chatMessages: [
    {
      id: "mc-1",
      sender: "Dr. Catherine Hayes",
      time: "10:02 AM",
      text: "Good morning everyone. Let's review the kernel paging benchmark and live cATO telemetry.",
    },
    {
      id: "mc-2",
      sender: "Kwesi Asiedu",
      time: "10:03 AM",
      text: "I've uploaded the performance test results to the Axiom Drive folder. Paging latency dropped by 42%.",
    },
    {
      id: "mc-3",
      sender: "Darren Vance",
      time: "10:04 AM",
      text: "The SGA Grant for Union Rm 204 was also verified this morning.",
    },
    {
      id: "mc-4",
      sender: "🤖 Axiom AI Meeting Copilot",
      time: "10:05 AM",
      text: "📌 Decision recorded: Deploy staging kernel benchmarks to production cluster on Friday at 4 PM.",
      isAiNote: true,
    },
  ],
  liveCaptions: [
    {
      speaker: "Dr. Catherine Hayes",
      text: "The throughput numbers look remarkably stable across all 14 container nodes.",
      timestamp: "10:06:12 AM",
    },
    {
      speaker: "Kwesi Asiedu",
      text: "Yes, our automated Zero-Trust proxy handles the mutual TLS encryption with zero added overhead.",
      timestamp: "10:06:28 AM",
    },
  ],
  aiSummaryNotes: {
    overview: "Architecture sync discussing kernel memory optimization, cATO compliance verification, and SGA hackathon logistics.",
    decisions: [
      "Merge the virtual memory pager simulation into the main research branch.",
      "Finalize Union Rm 204 A/V checklist for the April 14 Cyber Hackathon.",
      "Enforce TLS 1.3 mutual handshake across all incoming API gateway endpoints.",
    ],
    actionItems: [
      { assignee: "Kwesi Asiedu", task: "Publish benchmark CSV report to Axiom Drive", due: "Today, 5:00 PM" },
      { assignee: "Darren Vance", task: "Submit catering voucher manifest to Dean Vance", due: "Tomorrow, 12:00 PM" },
      { assignee: "Dr. Catherine Hayes", task: "Authorize IEEE symposium paper preprint draft", due: "Thursday" },
    ],
  },
};

export const initialTeamsChannels: TeamsChannel[] = [
  {
    id: "ch-1",
    name: "general-announcements",
    description: "Company & university-wide notices, platform updates, and key milestones.",
    isPrivate: false,
    unreadCount: 0,
    membersCount: 420,
    category: "CAMPUS",
    posts: [
      {
        id: "post-1",
        sender: {
          name: "Dean Marcus Vance",
          email: "mvance@towson.edu",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          title: "Dean of Student Affairs",
        },
        timestamp: "Today at 8:30 AM",
        content: "Welcome to the Fall 2026 semester! All campus dining halls, Cook Library pods, and Tiger Ride shuttles are operating on full synchronized schedules. Don't miss the Cyber Summit tonight at 7 PM!",
        reactions: [
          { emoji: "🎉", count: 38, userReacted: true },
          { emoji: "🐯", count: 52, userReacted: false },
        ],
        repliesCount: 4,
      },
    ],
  },
  {
    id: "ch-2",
    name: "engineering-architecture",
    description: "Deep technical discussions on Next.js 16, PostgreSQL, Zero-Trust, and cATO pipelines.",
    isPrivate: true,
    unreadCount: 3,
    membersCount: 28,
    category: "ENGINEERING",
    posts: [
      {
        id: "post-2",
        sender: {
          name: "Kwesi Asiedu",
          email: "kwesi@expediteconsults.com",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          title: "Lead Architect",
        },
        timestamp: "Yesterday at 3:15 PM",
        content: "We have finalized the Axiom Connect workspace architecture. Combining Zoho vertical ribbons with Outlook tri-pane threading and Teams live WebRTC video room into one responsive interface.",
        attachments: [
          { name: "Axiom_Connect_System_Architecture.png", size: "2.1 MB", icon: "🖼️" },
        ],
        reactions: [
          { emoji: "🚀", count: 14, userReacted: true },
          { emoji: "⚡", count: 9, userReacted: true },
        ],
        repliesCount: 7,
      },
    ],
  },
  {
    id: "ch-3",
    name: "cyber-security-ops",
    description: "Real-time vulnerability feeds, SIEM monitoring, and incident response coordination.",
    isPrivate: true,
    unreadCount: 1,
    membersCount: 16,
    category: "GOVERNANCE",
    posts: [
      {
        id: "post-3",
        sender: {
          name: "Dr. Catherine Hayes",
          email: "catherine.hayes@towson.edu",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
          title: "Lab Director",
        },
        timestamp: "Aug 29 at 10:00 AM",
        content: "Zero-Trust authentication enforcement is now active on all incoming SMTP and IMAP channels. DMARC strict reject policy in effect.",
        reactions: [
          { emoji: "🛡️", count: 19, userReacted: true },
        ],
        repliesCount: 2,
      },
    ],
  },
];

export const initialDriveFiles: DriveFile[] = [
  {
    id: "df-1",
    name: "COSC421_VirtualMemory_Rubric.pdf",
    size: "1.4 MB",
    updatedAt: "Today, 9:42 AM",
    owner: "Dr. Catherine Hayes",
    type: "PDF",
    icon: "📄",
    sharedWith: ["Kwesi Asiedu", "ASSL Research Group"],
    isStarred: true,
  },
  {
    id: "df-2",
    name: "Axiom_Connect_Security_Architecture.docx",
    size: "3.8 MB",
    updatedAt: "Yesterday, 4:20 PM",
    owner: "Kwesi Asiedu",
    type: "DOCX",
    icon: "📝",
    sharedWith: ["Darren Vance", "Sarah Chen"],
    isStarred: true,
  },
  {
    id: "df-3",
    name: "SGA_Grant_Charter_Approval_2026.pdf",
    size: "820 KB",
    updatedAt: "Aug 29, 2026",
    owner: "Marcus Vance",
    type: "PDF",
    icon: "📑",
    sharedWith: ["Towson Cyber Club"],
    isStarred: false,
  },
  {
    id: "df-4",
    name: "Kernel_Paging_Benchmark_Dataset.csv",
    size: "480 KB",
    updatedAt: "Aug 28, 2026",
    owner: "Kwesi Asiedu",
    type: "SPREADSHEET",
    icon: "📊",
    sharedWith: ["Dr. Catherine Hayes"],
    isStarred: false,
  },
];

export const initialContactsList: ContactEntry[] = [
  {
    id: "ct-1",
    name: "Dr. Catherine Hayes",
    email: "catherine.hayes@towson.edu",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    role: "Associate Professor & Lab Director",
    department: "Computer & Information Sciences",
    presence: "IN_MEETING",
    phone: "(410) 704-2000",
  },
  {
    id: "ct-2",
    name: "Dean Marcus Vance",
    email: "mvance@towson.edu",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "Dean of Student Affairs",
    department: "Student Affairs & Administration",
    presence: "AVAILABLE",
    phone: "(410) 704-2055",
  },
  {
    id: "ct-3",
    name: "Darren Vance",
    email: "darren.vance@towson.edu",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "SGA Senator & Cyber President",
    department: "Information Technology",
    presence: "AVAILABLE",
    phone: "(410) 704-3310",
  },
  {
    id: "ct-4",
    name: "Sarah Chen",
    email: "sarah.chen@expediteconsults.com",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    role: "Senior Cloud & SRE Architect",
    department: "Expedite Consults Enterprise",
    presence: "BUSY",
    phone: "(202) 555-0199",
  },
];
