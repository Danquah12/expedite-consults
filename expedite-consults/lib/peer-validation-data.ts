export interface ExpertReviewer {
  id: string
  name: string
  specialtyTitle: string
  headline: string
  avatar: string
  rating: number
  reviewsCompletedCount: number
  techStack: string[]
  reviewTypes: ('Product' | 'Architecture' | 'Code' | 'Security' | 'Research' | 'Resume')[]
  pricePerReview: string
  turnaroundTime: string
  badge: string
  bio: string
}

export interface ValidationSubmission {
  id: string
  type: 'Product' | 'Architecture' | 'Code' | 'Security' | 'Research' | 'Resume'
  title: string
  author: {
    name: string
    role: string
    avatar: string
    company?: string
  }
  summary: string
  artifactType: 'Architecture Diagram' | 'Code Snippet' | 'Research PDF' | 'Product URL' | 'Technical Resume'
  artifactPreview?: string
  codeSnippet?: string
  submittedAt: string
  status: 'Open for Review' | 'In Review' | 'Reviewed & Approved' | 'Revisions Requested'
  assignedExpert?: string
  bountyPoints: number
  cashBounty?: string
  rubricScores?: {
    security: number
    scalability: number
    modularity: number
    costEfficiency: number
  }
  reviews: {
    reviewerName: string
    reviewerRole: string
    reviewerAvatar: string
    rating: number
    formalVerdict: 'Reviewed & Approved ✓' | 'Changes Requested ⚠️' | 'Conditionally Approved'
    detailedFeedback: string
    rubricRatings: { criteria: string; score: number }[]
    timestamp: string
  }[]
}

export const VALIDATION_TYPES = [
  { id: 'All', label: 'All Reviews', icon: '⭐' },
  { id: 'Architecture', label: '🏛️ Architecture Review', icon: '🏛️' },
  { id: 'Security', label: '🛡️ Security Review', icon: '🛡️' },
  { id: 'Code', label: '💻 Code Review', icon: '💻' },
  { id: 'Product', label: '🛍️ Product Review', icon: '🛍️' },
  { id: 'Research', label: '📑 Research Review', icon: '📑' },
  { id: 'Resume', label: '📄 Resume Review', icon: '📄' }
]

export const VERIFIED_EXPERT_REVIEWERS: ExpertReviewer[] = [
  {
    id: 'exp_1',
    name: 'Alex Taylor',
    specialtyTitle: 'Cloud Security & Zero Trust Reviewer',
    headline: 'Principal Cloud & Security Architect | Expedite Senior Fellow',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    rating: 4.98,
    reviewsCompletedCount: 127,
    techStack: ['AWS', 'Azure', 'GCP', 'Kubernetes', 'eBPF', 'NIST 800-207'],
    reviewTypes: ['Architecture', 'Security', 'Product'],
    pricePerReview: '$150 / review',
    turnaroundTime: '24 - 48 Hours',
    badge: '🏆 Top Rated Fellow',
    bio: 'Former Fortune 500 CISO and lead architect of enterprise zero-trust cloud transformations. Validates cloud perimeter elimination and threat modeling.'
  },
  {
    id: 'exp_2',
    name: 'Dr. Elena Rostova',
    specialtyTitle: 'AI Safety & Research Paper Reviewer',
    headline: 'Chief AI Safety Scientist | Stanford AI Labs Fellow',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviewsCompletedCount: 84,
    techStack: ['PyTorch', 'Anthropic MCP', 'LLM Guardrails', 'Formal Verification'],
    reviewTypes: ['Research', 'Product', 'Code'],
    pricePerReview: '$200 / review',
    turnaroundTime: '48 Hours',
    badge: '⭐ Stanford Fellow',
    bio: 'Author of 18+ peer-reviewed papers on multi-agent alignment and prompt containment. Validates algorithmic proofs and LLM tool bindings.'
  },
  {
    id: 'exp_3',
    name: 'David Sterling',
    headline: 'Principal Offensive Red Team Lead | Ex-DARPA Contractor',
    specialtyTitle: 'Offensive Exploit & Code Reviewer',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    rating: 4.95,
    reviewsCompletedCount: 96,
    techStack: ['Rust', 'C/C++', 'Go', 'OSCP / OSCE', 'Firecracker MicroVMs'],
    reviewTypes: ['Security', 'Code', 'Product'],
    pricePerReview: '$175 / review',
    turnaroundTime: '24 Hours',
    badge: '🎯 OSCP / OSCE Lead',
    bio: 'Specialist in low-level memory safety, API fuzzing, and automated weaponized exploit validation. Inspects critical microservice codebases.'
  },
  {
    id: 'exp_4',
    name: 'Alexander Novak',
    specialtyTitle: 'FedRAMP & DoD RMF Reviewer',
    headline: 'Head of Infrastructure Security & FedRAMP 3PAO Lead',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    rating: 4.98,
    reviewsCompletedCount: 112,
    techStack: ['NIST 800-53 Rev 5', 'FedRAMP High', 'cATO', 'DoD Zero Trust'],
    reviewTypes: ['Architecture', 'Security', 'Resume'],
    pricePerReview: '$250 / review',
    turnaroundTime: '48 Hours',
    badge: '🏛️ FedRAMP 3PAO Lead',
    bio: 'Navigated 40+ SaaS applications to federal Authority to Operate. Validates cloud compliance documentation, SSPs, and continuous telemetry pipelines.'
  },
  {
    id: 'exp_5',
    name: 'Marcus Vance',
    specialtyTitle: 'Executive Technical Resume & Career Reviewer',
    headline: 'VP of Engineering @ CloudScale Global · Ex-AWS Hiring Partner',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    rating: 4.96,
    reviewsCompletedCount: 148,
    techStack: ['ATS Systems', 'Executive Hiring', 'Staff / Principal Rubrics'],
    reviewTypes: ['Resume'],
    pricePerReview: '$95 / review',
    turnaroundTime: '24 Hours',
    badge: '👔 Ex-AWS VP',
    bio: 'Hired over 200+ Principal Architects and Security Directors. Provides line-by-line ATS optimization and executive positioning audits.'
  }
]

export const VALIDATION_SUBMISSIONS_DATA: ValidationSubmission[] = [
  {
    id: 'val_1',
    type: 'Architecture',
    title: 'Multi-Region Zero Trust Egress Topology on AWS EKS & Cilium eBPF',
    author: {
      name: 'Samantha Wei',
      role: 'Staff Infrastructure Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      company: 'FinScale Network'
    },
    summary: 'Seeking peer review on our cross-region Kubernetes egress gateway eliminating traditional NAT instances in favor of Cilium eBPF mTLS mesh and WireGuard tunnels.',
    artifactType: 'Architecture Diagram',
    artifactPreview: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    submittedAt: '3h ago',
    status: 'Reviewed & Approved',
    assignedExpert: 'Alex Taylor',
    bountyPoints: 200,
    cashBounty: '$150 Bounty Paid',
    rubricScores: {
      security: 9.8,
      scalability: 9.5,
      modularity: 9.2,
      costEfficiency: 9.6
    },
    reviews: [
      {
        reviewerName: 'Alex Taylor',
        reviewerRole: 'Principal Cloud & Security Architect',
        reviewerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        formalVerdict: 'Reviewed & Approved ✓',
        detailedFeedback: 'Superb architecture. The use of Cilium ClusterMesh with WireGuard encryption at the socket layer directly addresses the double-NAT latency overhead while guaranteeing cryptographic isolation between pods. Approved for production staging.',
        rubricRatings: [
          { criteria: 'Zero Trust Network Segmentation', score: 10 },
          { criteria: 'High Availability & Failover', score: 9 },
          { criteria: 'Observability & Telemetry', score: 10 }
        ],
        timestamp: '1h ago'
      }
    ]
  },
  {
    id: 'val_2',
    type: 'Product',
    title: 'AXIOM AI-Powered Cyber Suite: Hybrid Scanning & Blast Radius Benchmark',
    author: {
      name: 'Expedite Consults Core Labs',
      role: 'Product Engineering Squad',
      avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
      company: 'Expedite Consults'
    },
    summary: 'Independent validation request evaluating AXIOM’s autonomous exploit verification speed against 100 benchmark CVEs and false positive reduction accuracy.',
    artifactType: 'Product URL',
    submittedAt: '5h ago',
    status: 'Reviewed & Approved',
    assignedExpert: 'David Sterling',
    bountyPoints: 300,
    rubricScores: {
      security: 9.9,
      scalability: 9.7,
      modularity: 9.6,
      costEfficiency: 9.8
    },
    reviews: [
      {
        reviewerName: 'David Sterling',
        reviewerRole: 'Principal Offensive Red Team Lead',
        reviewerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        formalVerdict: 'Reviewed & Approved ✓',
        detailedFeedback: 'Benchmark test executed against 100 vulnerable microservices. AXIOM successfully verified 98 genuine attack chains without executing false positive alerts, and generated passing remediation PRs in under 2 minutes.',
        rubricRatings: [
          { criteria: 'Exploit Accuracy & False Positives', score: 10 },
          { criteria: 'Auto-PR Code Quality', score: 9.8 },
          { criteria: 'Blast Radius Graph Resolution', score: 10 }
        ],
        timestamp: '2h ago'
      }
    ]
  },
  {
    id: 'val_3',
    type: 'Code',
    title: 'Rust & WebAssembly Enclave Gateway for MCP Server Token Validation',
    author: {
      name: 'Devon Hughes',
      role: 'Senior Rust Systems Engineer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      company: 'QuantumEnclave'
    },
    summary: 'Need a security code review on this 80-line Rust module enforcing Ed25519 signature checks on incoming Model Context Protocol tool requests.',
    artifactType: 'Code Snippet',
    codeSnippet: `pub fn verify_mcp_tool_request(
    public_key: &[u8; 32],
    payload: &[u8],
    signature: &[u8; 64]
) -> Result<ValidatedToolCall, SecurityError> {
    let verifying_key = VerifyingKey::from_bytes(public_key)
        .map_err(|_| SecurityError::InvalidPublicKey)?;
    let sig = Signature::from_bytes(signature);
    
    verifying_key.verify(payload, &sig)
        .map_err(|_| SecurityError::SignatureMismatch)?;
        
    // Enforce parameter nonce freshness
    let call = serde_json::from_slice::<ToolCallPayload>(payload)
        .map_err(|_| SecurityError::MalformedPayload)?;
    if is_nonce_replayed(call.nonce) {
        return Err(SecurityError::ReplayDetected);
    }
    
    Ok(ValidatedToolCall::from(call))
}`,
    submittedAt: '1d ago',
    status: 'Open for Review',
    bountyPoints: 180,
    reviews: []
  },
  {
    id: 'val_4',
    type: 'Security',
    title: 'FedRAMP High Continuous Authorization (cATO) Architecture Plan',
    author: {
      name: 'Kavita Patel',
      role: 'Director of Cloud Governance',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      company: 'CyberNova'
    },
    summary: 'Requesting formal security review of our continuous automated evidence streaming architecture for NIST 800-53 Rev 5 control compliance.',
    artifactType: 'Architecture Diagram',
    artifactPreview: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    submittedAt: '1d ago',
    status: 'In Review',
    assignedExpert: 'Alexander Novak',
    bountyPoints: 250,
    reviews: []
  },
  {
    id: 'val_5',
    type: 'Resume',
    title: 'Principal Cloud Security Architect & CISO Track Resume Review',
    author: {
      name: 'Jordan Rivera',
      role: 'Senior Cloud Security Lead',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
    },
    summary: 'Targeting VP of Security / CISO roles in FinTech. Looking for feedback on executive framing, quantified metric impact, and ATS optimization.',
    artifactType: 'Technical Resume',
    submittedAt: '2d ago',
    status: 'Reviewed & Approved',
    assignedExpert: 'Marcus Vance',
    bountyPoints: 120,
    reviews: [
      {
        reviewerName: 'Marcus Vance',
        reviewerRole: 'VP of Engineering @ CloudScale Global',
        reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        formalVerdict: 'Reviewed & Approved ✓',
        detailedFeedback: 'Excellent technical depth. I restructured your bullet points to lead with business metrics (e.g. "Eliminated $420k in annual VPN overhead") rather than implementation details. ATS pass rate increased to 99%.',
        rubricRatings: [
          { criteria: 'Executive Framing & Metrics', score: 9.8 },
          { criteria: 'ATS Keyword Optimization', score: 10 },
          { criteria: 'Technical Rigor Clarity', score: 9.5 }
        ],
        timestamp: '1d ago'
      }
    ]
  }
]
