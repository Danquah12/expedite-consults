export type AITone = 'thought_leader' | 'technical' | 'executive' | 'hiring' | 'celebration'

export interface AIGeneratedResult {
  content: string
  hashtags: string[]
  suggestedPollQuestion?: string
  suggestedPollOptions?: string[]
}

const toneTemplates: Record<AITone, { prefix: string; style: string }> = {
  thought_leader: {
    prefix: "🚀 The future of enterprise technology is shifting faster than ever.",
    style: "Inspiring, forward-looking, high-engagement hook with call to action."
  },
  technical: {
    prefix: "⚡ Deep-dive breakdown for engineering leaders and architects:",
    style: "Rigorous, metric-backed, architectural points with code/system insights."
  },
  executive: {
    prefix: "📊 Strategic insights for C-Suite and Advisory boards:",
    style: "Focus on ROI, risk mitigation, governance, and organizational velocity."
  },
  hiring: {
    prefix: "📢 WE ARE HIRING! Expedite Consults is expanding our team.",
    style: "Compelling culture highlights, role clarity, and candidate incentives."
  },
  celebration: {
    prefix: "🎉 Thrilled to celebrate an exciting milestone with our community!",
    style: "Grateful, energetic, acknowledging team collaboration and growth."
  }
}

export function generateAIPost(topic: string, tone: AITone): AIGeneratedResult {
  const cleanTopic = topic.trim() || "Autonomous AI Defense and Cloud Scalability"

  if (tone === 'thought_leader') {
    return {
      content: `🚀 The paradigm around ${cleanTopic} is undergoing a massive shift.

Most organizations are still treating it as an incremental optimization, but the teams winning in 2026 are treating it as a foundational architecture.

Here are 3 key principles we've seen drive 10x ROI:

1️⃣ Proactive Governance over Reactive Patching
2️⃣ Autonomous Loops with Deterministic Containment
3️⃣ Empowering Cross-Functional Squads with Real-Time Visibility

What is the biggest roadblock your team is seeing this quarter? Let's discuss in the comments 👇`,
      hashtags: ['#Leadership', '#Innovation', '#TechStrategy', '#CloudArchitecture', '#FutureOfWork']
    }
  }

  if (tone === 'technical') {
    return {
      content: `⚡ Technical Architecture Breakdown: ${cleanTopic}

When scaling distributed systems under high concurrency, standard patterns break down. Here is how we engineered resilience:

🔹 Zero-Bundle Server Actions to eliminate client payload bloat
🔹 Ephemeral Sandbox Containment for untrusted tool invocations
🔹 Sub-5ms TTFB using Edge caching and selective tag revalidation

💡 Pro Tip: Never expose raw mutation endpoints when server-side orchestration can handle deterministic validation natively.

Slide deck summary coming next week! Save this post 📌 for your next engineering sprint.`,
      hashtags: ['#Nextjs', '#CyberSecurity', '#CloudEngineering', '#SystemDesign', '#TypeScript']
    }
  }

  if (tone === 'hiring') {
    return {
      content: `📢 WE ARE EXPANDING OUR SQUAD!

Due to rapid client growth in our Cyber Advisory & AI Resilience practice, we are actively looking for exceptional talent in:

🔹 ${cleanTopic} (Principal / Lead)
🔹 Senior Next.js & Full-Stack Systems Engineer (Remote)
🔹 SOC 2 & Enterprise Cloud Security Consultant

What we offer:
✔️ Top-tier compensation & equity
✔️ Direct impact with Fortune 100 leaders
✔️ Unlimited learning & conference stipend

👉 Drop a comment or message me directly for a confidential conversation!`,
      hashtags: ['#Hiring', '#TechJobs', '#CyberSecurityCareers', '#RemoteWork', '#OpenToWork']
    }
  }

  if (tone === 'celebration') {
    return {
      content: `🎉 Milestone Achieved: ${cleanTopic}!

Huge shoutout to the entire engineering and advisory squad at Expedite Consults for making this possible. 

Building complex, high-resilience systems takes relentless focus, curiosity, and deep collaboration. Couldn't be prouder of what we've shipped together.

Onwards and upwards! 🚀`,
      hashtags: ['#Milestone', '#Teamwork', '#EngineeringExcellence', '#Gratitude', '#CompanyCulture']
    }
  }

  // Executive default
  return {
    content: `📊 Executive Briefing: Navigating ${cleanTopic} in 2026.

As enterprise infrastructure modernizes, C-suite leaders must balance innovation velocity with zero-trust risk posture.

Key takeaway from our latest advisory briefing:
• 84% of cyber breaches in 2026 stem from misconfigured cross-cloud trust boundaries.
• Investing in autonomous defense loops yields a 65% reduction in mean-time-to-resolution (MTTR).

Read our full whitepaper on the Expedite advisory portal or DM for the executive slide deck.`,
    hashtags: ['#CISO', '#CyberSecurity', '#EnterpriseStrategy', '#RiskManagement', '#BoardGovernance']
  }
}
