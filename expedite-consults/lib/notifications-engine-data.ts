export interface CategorizedNotificationItem {
  id: string
  category: 'Social' | 'Career' | 'Marketplace' | 'Learning' | 'Security'
  subType:
    | 'Like'
    | 'Comment'
    | 'Repost'
    | 'Connection'
    | 'Job Match'
    | 'Application Update'
    | 'Recruiter Message'
    | 'Price Change'
    | 'Product Update'
    | 'New Product'
    | 'Order'
    | 'Trial Ending'
    | 'Course Reminder'
    | 'Certification Update'
    | 'Vulnerability Alert'
    | 'Security Advisory'
  actor: {
    name: string
    avatar?: string
    role?: string
    isVerified?: boolean
  }
  title: string
  description: string
  timestamp: string
  unread: boolean
  actionText: string
  targetTab: 'home' | 'jobs' | 'marketplace' | 'learning' | 'pulserooms' | 'messaging' | 'peerreview' | 'compensation'
  targetPayload?: string
  priority?: 'high' | 'normal' | 'critical'
}

export const INITIAL_CATEGORIZED_NOTIFICATIONS: CategorizedNotificationItem[] = [
  // 1. SECURITY
  {
    id: 'notif_sec_1',
    category: 'Security',
    subType: 'Security Advisory',
    actor: {
      name: 'CISA Alert Gateway',
      avatar: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&auto=format&fit=crop&q=80',
      role: 'Federal Cybersecurity Agency'
    },
    title: '🔴 Critical Security Advisory: CVE-2026-44921 Zero-Day Active Exploitation',
    description: 'Emergency directive issued for perimeter concentrators. Immediate micro-segmentation required within 24 hours.',
    timestamp: '15m ago',
    unread: true,
    actionText: 'View Threat Playbook',
    targetTab: 'pulserooms',
    priority: 'critical'
  },
  {
    id: 'notif_sec_2',
    category: 'Security',
    subType: 'Vulnerability Alert',
    actor: {
      name: 'AXIOM Autonomous Scanner',
      avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
      role: 'Automated Posture Engine'
    },
    title: 'Security Notice: New Nonce Verification Patch for MCP Tool Gateways',
    description: 'A formal patch is available to protect against indirect prompt injection vectors.',
    timestamp: '2h ago',
    unread: true,
    actionText: 'Apply Auto-PR Patch',
    targetTab: 'marketplace'
  },

  // 2. CAREER
  {
    id: 'notif_car_1',
    category: 'Career',
    subType: 'Application Update',
    actor: {
      name: 'Northrop Grumman',
      avatar: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80',
      role: 'Defense Talent Team'
    },
    title: 'Application Update: Interview Scheduled for Lead Defense Security Architect',
    description: 'Your technical panel interview with the VP of Engineering is confirmed for Thursday at 2:00 PM EST.',
    timestamp: '1h ago',
    unread: true,
    actionText: 'Open CareerTwin™ Prep',
    targetTab: 'jobs',
    priority: 'high'
  },
  {
    id: 'notif_car_2',
    category: 'Career',
    subType: 'Job Match',
    actor: {
      name: 'ConnectIn AI Matcher',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    },
    title: 'New 98% AI Job Match: Principal Cloud Security Architect @ Stripe ($385k TC)',
    description: 'Matches your verified Cilium eBPF, AWS GovCloud, and Zero Trust credentials.',
    timestamp: '4h ago',
    unread: true,
    actionText: 'Quick Apply with CareerTwin™',
    targetTab: 'jobs'
  },
  {
    id: 'notif_car_3',
    category: 'Career',
    subType: 'Recruiter Message',
    actor: {
      name: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      role: 'Talent Lead @ Northrop Grumman'
    },
    title: 'Recruiter Outreach: "We loved your Peer Review validation on Zero Trust Egress."',
    description: 'Sarah sent you a direct recruiter inquiry with salary details ($195k–$225k TC).',
    timestamp: '5h ago',
    unread: false,
    actionText: 'Reply in Messaging',
    targetTab: 'messaging'
  },

  // 3. MARKETPLACE
  {
    id: 'notif_mkt_1',
    category: 'Marketplace',
    subType: 'Trial Ending',
    actor: {
      name: 'AXIOM Cloud Suite',
      avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
      role: 'Enterprise Software'
    },
    title: 'Trial Alert: Your 14-Day Enterprise AXIOM Trial Ends in 3 Days',
    description: 'You have generated 142 automated PR fixes with 0 false positives during your staging evaluation.',
    timestamp: '3h ago',
    unread: true,
    actionText: 'Activate Commercial License',
    targetTab: 'marketplace',
    priority: 'high'
  },
  {
    id: 'notif_mkt_2',
    category: 'Marketplace',
    subType: 'New Product',
    actor: {
      name: 'Expedite Consults Product Lab',
      avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80'
    },
    title: 'New Product Launched: Expedite Strike & Fusion 2026 is Live in Marketplace!',
    description: 'Offensive AppSec platform with hybrid scanning, Checkmarx MCP server, and automated board dossiers.',
    timestamp: '1d ago',
    unread: false,
    actionText: 'Explore Product Page',
    targetTab: 'marketplace'
  },
  {
    id: 'notif_mkt_3',
    category: 'Marketplace',
    subType: 'Price Change',
    actor: {
      name: 'Fractional CISO Retainers',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'
    },
    title: 'Advisory Retainer Update: Special 15% discount for annual GovTech compliance retainers',
    description: 'Lock in certified FedRAMP 3PAO advisory retainers before Q4 regulatory deadlines.',
    timestamp: '2d ago',
    unread: false,
    actionText: 'View Retainer Pricing',
    targetTab: 'marketplace'
  },

  // 4. LEARNING
  {
    id: 'notif_lrn_1',
    category: 'Learning',
    subType: 'Course Reminder',
    actor: {
      name: 'ConnectIn Learning Hub',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80'
    },
    title: 'Course Reminder: Continue Step 3 of "Become a Cloud Security Engineer"',
    description: 'You are 65% through the AWS Organizations and EKS MicroVM security module.',
    timestamp: '6h ago',
    unread: true,
    actionText: 'Resume Module',
    targetTab: 'learning'
  },
  {
    id: 'notif_lrn_2',
    category: 'Learning',
    subType: 'Certification Update',
    actor: {
      name: 'ISC2 CISSP Practice Engine',
      avatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80'
    },
    title: 'Certification Update: 2026 CISSP Domain 3 & 4 Practice Questions Added',
    description: 'Updated questions covering continuous ATO evidence and eBPF socket security.',
    timestamp: '1d ago',
    unread: false,
    actionText: 'Take Practice Exam',
    targetTab: 'learning'
  },

  // 5. SOCIAL
  {
    id: 'notif_soc_1',
    category: 'Social',
    subType: 'Repost',
    actor: {
      name: 'Dr. Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      role: 'Chief AI Safety Scientist @ Stanford'
    },
    title: 'Dr. Elena Rostova reposted your architecture teardown on Cilium eBPF Mesh Security',
    description: '"Crucial reading for anyone deploying Kubernetes in high-compliance environments."',
    timestamp: '2h ago',
    unread: true,
    actionText: 'View Post & Discussion',
    targetTab: 'home'
  },
  {
    id: 'notif_soc_2',
    category: 'Social',
    subType: 'Connection',
    actor: {
      name: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      role: 'VP of Engineering @ CloudScale Global'
    },
    title: 'Marcus Vance endorsed you for "Zero Trust Architecture" and "AWS GovCloud"',
    description: 'Marcus confirmed your skill capabilities following your recent peer validation.',
    timestamp: '8h ago',
    unread: false,
    actionText: 'View Profile Endorsements',
    targetTab: 'home'
  },
  {
    id: 'notif_soc_3',
    category: 'Social',
    subType: 'Comment',
    actor: {
      name: 'David Sterling',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
      role: 'Principal Offensive Red Team Lead'
    },
    title: 'David Sterling commented on your post: "What was your observed MTTR reduction?"',
    description: 'Join the ongoing technical discussion with 58 comments.',
    timestamp: '1d ago',
    unread: false,
    actionText: 'Reply to Comment',
    targetTab: 'home'
  }
]
