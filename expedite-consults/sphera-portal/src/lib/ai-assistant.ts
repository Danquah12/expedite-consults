export type AITone =
  | 'thought_leader'
  | 'technical'
  | 'executive'
  | 'hiring'
  | 'celebration'
  | 'poll_builder'

export interface AIGeneratedResult {
  content: string
  hashtags: string[]
  suggestedPollQuestion?: string
  suggestedPollOptions?: string[]
  suggestedCelebration?: {
    type: 'new_job' | 'anniversary' | 'certificate' | 'project'
    badge: string
    headline: string
  }
}

export function getProfessionAITopics(profession?: string, enclave?: string): string[] {
  const prof = (profession || "").toLowerCase()
  const enc = (enclave || "").toLowerCase()

  if (prof.includes("carpenter") || prof.includes("timber") || prof.includes("wood") || enc.includes("trades")) {
    return [
      "Precision Mortise & Tenon Joinery Standards on Heavy Timber Frames",
      "Completed Custom Architectural Millwork & Coffered Ceiling Installation",
      "Jobsite Safety, Moisture Control & Structural Load Tolerances",
      "Hiring Experienced Journeyman & Apprentice Finish Carpenters",
      "How CNC Routing & Laser Layout Complement Master Hand Craftsmanship"
    ]
  }

  if (prof.includes("nurse") || prof.includes("physician") || prof.includes("medical") || enc.includes("healthcare")) {
    return [
      "Level 1 Trauma Triage & Rapid Handoff Protocols in High-Acuity Units",
      "Reducing Clinical Burnout Through Smarter Shift Handoff Workflows",
      "Hiring CCRN / Emergency Department Clinical Nurses",
      "Celebrating 100% Patient Safety & Joint Commission Accreditation",
      "Evidence-Based Critical Care & Multidisciplinary Rounds"
    ]
  }

  if (prof.includes("electric") || prof.includes("plumb") || prof.includes("hvac") || prof.includes("mechanic")) {
    return [
      "NEC 2026 Load Calculations & High-Voltage Lockout/Tagout (LOTO)",
      "Diagnostics First: Why Oscilloscope Waveforms Beat Parts-Swapping",
      "Completed Commercial Microgrid & Three-Phase Switchgear Commissioning",
      "Hiring Licensed Journeyman Technicians & Field Apprentices"
    ]
  }

  return [
    "Autonomous AI Defense Loops & Deterministic Sandboxing",
    "Zero Trust Architecture on GovCloud & Kubernetes",
    "Delivering High-Reliability Systems & Field Excellence in 2026",
    "Hiring Lead Specialists & Verified Practitioners",
    "Celebrating a Major Client Project Delivery & Team Milestone"
  ]
}

export function generateAIPost(
  topic: string,
  tone: AITone,
  userContext?: { name?: string; profession?: string; headline?: string }
): AIGeneratedResult {
  const profLabel = userContext?.profession || "Verified Professional"
  const cleanTopic =
    topic.trim() ||
    (profLabel.toLowerCase().includes("carpenter")
      ? "Precision Heavy Timber Joinery & Structural Craftsmanship"
      : "Operational Excellence, Safety & Field Leadership")

  const baseTag = `#${profLabel.replace(/[^a-zA-Z0-9]/g, "") || "ConnectLn"}`

  if (tone === 'poll_builder') {
    return {
      content: `📊 Quick pulse check for fellow ${profLabel}s and project leads across the ConnectLn network:\n\nWhen delivering on "${cleanTopic}", where are you seeing the biggest day-to-day bottleneck right now?\n\nVote in the poll below and share your field experience in the comments 👇`,
      hashtags: [baseTag, '#ConnectLnPoll', '#FieldStandards', '#BestPractices', '#RealWork'],
      suggestedPollQuestion: `What is the #1 priority for ${cleanTopic.slice(0, 65)}?`,
      suggestedPollOptions: [
        'Precision Specs & Quality Control',
        'Skilled Crew & Apprentice Training',
        'Tooling, Materials & Supply Chain',
        'Safety & Code Compliance'
      ]
    }
  }

  if (tone === 'thought_leader') {
    return {
      content: `🚀 The standard around ${cleanTopic} is evolving faster than ever.

In my work as a ${profLabel}, the difference between average output and lasting quality always comes down to fundamentals, preparation, and disciplined execution before the first cut or deployment is ever made.

Here are 3 principles driving real results in 2026:

1️⃣ Measure Twice, Verify Early — eliminate rework at the blueprint stage
2️⃣ Invest in Craft & Continuous Mastery — tools amplify skill, they never replace it
3️⃣ Document & Share Proof of Work — transparent standards build client trust

What is the #1 lesson you're applying on your projects this week? Let's discuss below 👇`,
      hashtags: [baseTag, '#Leadership', '#Craftsmanship', '#ProfessionalStandards', '#ConnectLn']
    }
  }

  if (tone === 'technical') {
    return {
      content: `⚡ Field & Technical Breakdown: ${cleanTopic}

When executing under tight tolerances and real-world load conditions, shortcuts always show up later. Here is the checklist we enforce on every job:

🔹 Strict pre-inspection of materials, tolerances, and layout geometry
🔹 Repeatable verification checkpoints at every stage of assembly
🔹 Full compliance documentation and peer sign-off before handoff

💡 Pro Tip: Precision on step one saves ten hours of correction on step ten.

Save this post 📌 for your next project briefing or crew walkthrough.`,
      hashtags: [baseTag, '#TechnicalStandards', '#QualityControl', '#ProofOfWork', '#FieldEngineering']
    }
  }

  if (tone === 'hiring') {
    return {
      content: `📢 WE ARE HIRING / EXPANDING OUR CREW!

Due to growing project demand, we are looking for dependable, skilled professionals to join our upcoming work around:

🔹 ${cleanTopic}
🔹 Experienced ${profLabel} & Field Leads
🔹 Dedicated Apprentices ready for hands-on mentorship

What we offer:
✔️ Competitive pay, clear scope & on-time draws
✔️ High-trust team culture that respects real skill
✔️ Long-term pipeline of verified contracts

👉 Comment below or send me a direct message on ConnectLn to connect!`,
      hashtags: [baseTag, '#Hiring', '#OpenToWork', '#SkilledTrades', '#CareerOpportunity']
    }
  }

  if (tone === 'celebration') {
    return {
      content: `🎉 Milestone Achieved: ${cleanTopic}!

Proud to share this milestone with my ConnectLn community. Every completed project and earned credential is the result of hard work, attention to detail, and great partners in the field.

Thank you to everyone who collaborated on making this happen — onto the next build! 🚀`,
      hashtags: [baseTag, '#Milestone', '#ProudWork', '#Teamwork', '#ConnectLn'],
      suggestedCelebration: {
        type: 'project',
        badge: '🏆',
        headline: `Milestone: ${cleanTopic.slice(0, 70)}`
      }
    }
  }

  // Executive default
  return {
    content: `📊 Executive & Project Briefing: ${cleanTopic}

Delivering high-value outcomes in 2026 requires aligning field execution with clear scheduling, cost discipline, and zero-compromise safety.

Key takeaways from our latest project review:
• Clear upfront scope and verified credentials reduce project delays by over 40%.
• Direct collaboration between specialists eliminates costly change orders.

Reach out via ConnectLn messaging if you'd like to review our full project blueprint or discuss upcoming contracts.`,
    hashtags: [baseTag, '#ProjectManagement', '#ExecutiveBrief', '#Operations', '#ConnectLn']
  }
}
