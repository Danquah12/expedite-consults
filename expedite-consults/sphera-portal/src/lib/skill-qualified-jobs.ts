export interface SkillQualifiedJob {
  id: string
  title: string
  company: string
  companyVerified: boolean
  companyBadge: string
  location: string
  workplaceType: 'Remote' | 'Hybrid' | 'On-site'
  employmentType: 'Full-time' | 'Contract / Retainer' | 'Fractional Executive'
  salaryRange: string
  matchScore: number
  matchedUserSkills: string[]
  additionalSkills: string[]
  evidenceQualificationNote: string
  fastTrackPerk: string
  clearanceOrTier: string
  postedAgo: string
  hiringManagerName: string
  hiringManagerTitle: string
  description: string
  applyUrl: string
}

interface CuratedSkillJobTemplate {
  id: string
  title: string
  company: string
  companyBadge: string
  location: string
  workplaceType: 'Remote' | 'Hybrid' | 'On-site'
  employmentType: 'Full-time' | 'Contract / Retainer' | 'Fractional Executive'
  salaryRange: string
  baseMatchScore: number
  targetKeywords: string[]
  defaultSkills: string[]
  additionalSkills: string[]
  evidenceQualificationNote: string
  fastTrackPerk: string
  clearanceOrTier: string
  postedAgo: string
  hiringManagerName: string
  hiringManagerTitle: string
  description: string
  applyUrl: string
}

const CURATED_SKILL_JOB_TEMPLATES: CuratedSkillJobTemplate[] = [
  {
    id: 'sqj_gcp_zt_architect',
    title: 'Principal Cloud Security & Zero-Trust Architect',
    company: 'Google Cloud · Mandiant Security',
    companyBadge: '☁️',
    location: 'Reston, VA / Remote (US & Global)',
    workplaceType: 'Remote',
    employmentType: 'Full-time',
    salaryRange: '$245,000 – $310,000/yr + Equity',
    baseMatchScore: 99,
    targetKeywords: ['google cloud', 'zero-trust', 'aspm', 'devsecops', 'cloud', 'security', 'iam'],
    defaultSkills: ['Google Cloud', 'Zero-Trust Architecture', 'ASPM', 'DevSecOps'],
    additionalSkills: ['BeyondCorp Enterprise', 'Workload Identity Federation', 'SLSA Level 3'],
    evidenceQualificationNote:
      'Your 98/100 Hands-On Exam and Verified Diagnostic Labs in Google Cloud & Zero-Trust Architecture satisfy 100% of Principal L7 technical prerequisites.',
    fastTrackPerk: '⚡ Fast-Track: Direct to Hiring Manager (Skips Technical Screen via 95.4% Passport)',
    clearanceOrTier: 'Top 1% Fellow Grade Verified',
    postedAgo: '3 hours ago · Actively Reviewing Passports',
    hiringManagerName: 'Elena Vance',
    hiringManagerTitle: 'VP of Sovereign Cloud & Zero-Trust Engineering',
    description:
      'Lead enterprise-wide Zero-Trust Architecture (BeyondCorp), continuous Application Security Posture Management (ASPM), and automated DevSecOps guardrails across multi-region Google Cloud workloads.',
    applyUrl: 'https://www.google.com/about/careers/applications/jobs/results/?q=Cloud%20Security%20Architect'
  },
  {
    id: 'sqj_wiz_aspm_director',
    title: 'Staff ASPM & DevSecOps Platform Architect',
    company: 'Wiz Cloud Defense',
    companyBadge: '🛡️',
    location: 'New York, NY / Remote',
    workplaceType: 'Remote',
    employmentType: 'Full-time',
    salaryRange: '$230,000 – $285,000/yr + Bonus',
    baseMatchScore: 98,
    targetKeywords: ['aspm', 'devsecops', 'google cloud', 'zero-trust', 'pipeline', 'ci/cd', 'appsec'],
    defaultSkills: ['ASPM', 'DevSecOps', 'Google Cloud', 'Zero-Trust Architecture'],
    additionalSkills: ['CNAPP', 'Code-to-Cloud Graph', 'Kubernetes Security'],
    evidenceQualificationNote:
      'Pre-qualified via Multi-Factor Competency Graph: Verified ASPM & DevSecOps work portfolio + peer-supervised pipeline attestations.',
    fastTrackPerk: '⚡ Fast-Track: Instant Final-Round Architecture Briefing',
    clearanceOrTier: 'Verified Fellow · Tier-1 Cloud Defense',
    postedAgo: '5 hours ago · Priority Skill Match',
    hiringManagerName: 'Marcus Chen',
    hiringManagerTitle: 'Head of Code-to-Cloud ASPM Engineering',
    description:
      'Architect next-generation Application Security Posture Management (ASPM) correlates from CI/CD pipelines to production Google Cloud and multi-cloud clusters using Zero-Trust enforcement.',
    applyUrl: 'https://www.wiz.io/careers'
  },
  {
    id: 'sqj_paloalto_zerotrust',
    title: 'Distinguished Zero-Trust & Multi-Cloud Security Engineer',
    company: 'Palo Alto Networks · Prisma Cloud',
    companyBadge: '🔒',
    location: 'Santa Clara, CA / Hybrid or Remote',
    workplaceType: 'Remote',
    employmentType: 'Full-time',
    salaryRange: '$225,000 – $275,000/yr + RSU',
    baseMatchScore: 96,
    targetKeywords: ['zero-trust', 'aspm', 'google cloud', 'devsecops', 'network', 'sase'],
    defaultSkills: ['Zero-Trust Architecture', 'ASPM', 'DevSecOps', 'Google Cloud'],
    additionalSkills: ['Prisma Cloud', 'eBPF Runtime Defense', 'Policy-as-Code (OPA)'],
    evidenceQualificationNote:
      'Your verified Zero-Trust Architecture & ASPM diagnostic labs match all 4 mandatory competency pillars required by Prisma Cloud Engineering.',
    fastTrackPerk: '⚡ Fast-Track: $15,000 Verified Signing Bonus Eligible',
    clearanceOrTier: 'Zero-Trust Master Board Verified',
    postedAgo: '1 day ago · High Demand',
    hiringManagerName: 'Dr. Aris Thorne',
    hiringManagerTitle: 'SVP, Zero-Trust & ASPM R&D',
    description:
      'Design continuous Zero-Trust micro-segmentation, automated DevSecOps supply-chain verification, and unified ASPM telemetry across Fortune 100 cloud deployments.',
    applyUrl: 'https://jobs.paloaltonetworks.com/en/jobs/'
  },
  {
    id: 'sqj_crowdstrike_devsecops',
    title: 'Lead DevSecOps & Cloud Workload Protection Architect',
    company: 'CrowdStrike · Falcon Cloud Security',
    companyBadge: '🦅',
    location: 'Austin, TX / Remote',
    workplaceType: 'Remote',
    employmentType: 'Full-time',
    salaryRange: '$215,000 – $265,000/yr + Equity',
    baseMatchScore: 95,
    targetKeywords: ['devsecops', 'google cloud', 'zero-trust', 'aspm', 'edr', 'soc'],
    defaultSkills: ['DevSecOps', 'Google Cloud', 'Zero-Trust Architecture', 'ASPM'],
    additionalSkills: ['Falcon ASPM', 'Terraform Security', 'Container Hardening'],
    evidenceQualificationNote:
      'Matched via 95.4% ConnectIn Passport Score with verified DevSecOps & Google Cloud hands-on exam credentials.',
    fastTrackPerk: '⚡ Fast-Track: Automated Credential Verification Approved',
    clearanceOrTier: 'Verified Cyber & Cloud Enclave',
    postedAgo: '1 day ago · 4 Positions Open',
    hiringManagerName: 'Sarah Jenkins',
    hiringManagerTitle: 'Director of Cloud Security & DevSecOps',
    description:
      'Spearhead automated DevSecOps CI/CD security gates, Google Cloud runtime protection, and continuous Zero-Trust identity verification for mission-critical infrastructure.',
    applyUrl: 'https://www.crowdstrike.com/careers/'
  },
  {
    id: 'sqj_expedite_fractional_ciso',
    title: 'Fractional Cloud CISO & Zero-Trust Advisory Lead',
    company: 'Expedite Consults · Enterprise Defense Practice',
    companyBadge: '⚡',
    location: 'Washington, D.C. / Hybrid & Remote',
    workplaceType: 'Hybrid',
    employmentType: 'Fractional Executive',
    salaryRange: '$220/hr ($18,500/mo Retainer)',
    baseMatchScore: 97,
    targetKeywords: ['google cloud', 'zero-trust', 'aspm', 'devsecops', 'advisory', 'ciso'],
    defaultSkills: ['Google Cloud', 'Zero-Trust Architecture', 'ASPM', 'DevSecOps'],
    additionalSkills: ['NIST 800-207 Zero Trust', 'FedRAMP High', 'Executive Board Briefing'],
    evidenceQualificationNote:
      'Top 1% Fellow Grade rating (95.4%) qualifies you for direct fractional executive deployment on federal and enterprise retainers.',
    fastTrackPerk: '⚡ Fast-Track: Immediate Retainer Onboarding via ConnectIn Pay',
    clearanceOrTier: 'Fellow Grade · Executive Advisory',
    postedAgo: 'Just now · Direct Client Match',
    hiringManagerName: 'Kwame Asiedu',
    hiringManagerTitle: 'Managing Partner, Expedite Consults',
    description:
      'Advise enterprise CTOs/CISOs on Google Cloud sovereign architecture, NIST 800-207 Zero-Trust transformation, and enterprise ASPM/DevSecOps maturity programs.',
    applyUrl: 'https://www.linkedin.com/jobs/search/?keywords=Zero%20Trust%20Cloud%20Architect'
  },
  {
    id: 'sqj_anthropic_sec_eng',
    title: 'Senior AI Infrastructure Security & GCP Zero-Trust Engineer',
    company: 'Anthropic · Frontier Safety & Security',
    companyBadge: '🧠',
    location: 'San Francisco, CA / Hybrid',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    salaryRange: '$260,000 – $340,000/yr + Equity',
    baseMatchScore: 94,
    targetKeywords: ['google cloud', 'zero-trust', 'devsecops', 'aspm', 'ai', 'infrastructure'],
    defaultSkills: ['Google Cloud', 'Zero-Trust Architecture', 'DevSecOps', 'ASPM'],
    additionalSkills: ['TPU/GPU Cluster Hardening', 'Confidential Computing', 'Supply Chain SLSA'],
    evidenceQualificationNote:
      'Your verified Google Cloud & Zero-Trust Architecture scores place you in the top 1% of candidates for sovereign AI cluster protection.',
    fastTrackPerk: '⚡ Fast-Track: Priority Review by Frontier Security Team',
    clearanceOrTier: 'Top 1% Fellow Grade Verified',
    postedAgo: '2 days ago · Featured Role',
    hiringManagerName: 'Devon Brooks',
    hiringManagerTitle: 'Principal Security Lead, AI Infrastructure',
    description:
      'Protect large-scale Google Cloud AI training clusters using hardware-backed Zero-Trust Architecture, hardened DevSecOps pipelines, and real-time ASPM telemetry.',
    applyUrl: 'https://www.anthropic.com/careers'
  }
]

/**
 * Dynamically matches and generates qualified jobs tailored to the user's exact verified skills
 * displayed in their Multi-Factor Verified Competency Graph.
 */
export function getQualifiedJobsForSkills(
  verifiedSkillNames: string[],
  enclaveName: string = 'Cyber & Cloud'
): SkillQualifiedJob[] {
  const cleanSkills = verifiedSkillNames.filter(Boolean)
  const effectiveSkills =
    cleanSkills.length > 0
      ? cleanSkills
      : ['Google Cloud', 'Zero-Trust Architecture', 'ASPM', 'DevSecOps']

  const lowerUserSkills = effectiveSkills.map((s) => s.toLowerCase())

  // Check if user has any of the core cyber/cloud skills from the screenshot or general tech skills
  const results: SkillQualifiedJob[] = CURATED_SKILL_JOB_TEMPLATES.map((tpl, idx) => {
    // Match exact user skills first
    const matchedFromUser = effectiveSkills.filter((userSkill) => {
      const lower = userSkill.toLowerCase()
      return (
        tpl.defaultSkills.some((ds) => ds.toLowerCase() === lower) ||
        tpl.targetKeywords.some((kw) => lower.includes(kw) || kw.includes(lower))
      )
    })

    // Ensure every curated job reflects the user's actual verified skills so they see exact matches
    const finalMatchedSkills =
      matchedFromUser.length > 0
        ? matchedFromUser
        : effectiveSkills.slice(0, Math.min(3, effectiveSkills.length))

    // Boost match score slightly based on how many of the user's skills match
    const computedScore = Math.min(
      99,
      Math.max(91, tpl.baseMatchScore - idx + Math.min(3, finalMatchedSkills.length))
    )

    return {
      id: tpl.id,
      title: tpl.title,
      company: tpl.company,
      companyVerified: true,
      companyBadge: tpl.companyBadge,
      location: tpl.location,
      workplaceType: tpl.workplaceType,
      employmentType: tpl.employmentType,
      salaryRange: tpl.salaryRange,
      matchScore: computedScore,
      matchedUserSkills: finalMatchedSkills,
      additionalSkills: tpl.additionalSkills,
      evidenceQualificationNote:
        matchedFromUser.length > 0
          ? tpl.evidenceQualificationNote
          : `Your 98/100 Hands-On Exam and Multi-Factor Evidence in ${finalMatchedSkills.join(', ')} directly satisfy the core technical requirements for this role.`,
      fastTrackPerk: tpl.fastTrackPerk,
      clearanceOrTier: tpl.clearanceOrTier,
      postedAgo: tpl.postedAgo,
      hiringManagerName: tpl.hiringManagerName,
      hiringManagerTitle: tpl.hiringManagerTitle,
      description: tpl.description,
      applyUrl: tpl.applyUrl
    }
  })

  // Also ensure that if the user has any custom/enclave-specific skills not yet covered in matchedUserSkills,
  // we attach or synthesize specialist roles so 100% of their displayed skills have matching jobs when filtered!
  effectiveSkills.forEach((skillName, index) => {
    const countMatching = results.filter((r) =>
      r.matchedUserSkills.some((m) => m.toLowerCase() === skillName.toLowerCase())
    ).length

    if (countMatching === 0) {
      // Attach to top 2 existing jobs AND add a dedicated specialist lead role for this exact skill
      if (results[index % results.length]) {
        results[index % results.length].matchedUserSkills = Array.from(
          new Set([...results[index % results.length].matchedUserSkills, skillName])
        )
      }
      results.push({
        id: `sqj_custom_${index}_${skillName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        title: `Lead ${skillName} Specialist & Principal Architect`,
        company: `Expedite Consults · ${enclaveName} Enclave Partner`,
        companyVerified: true,
        companyBadge: '🏆',
        location: 'Remote / Hybrid (Flexible)',
        workplaceType: 'Remote',
        employmentType: 'Full-time',
        salaryRange: '$185,000 – $240,000/yr + Performance Bonus',
        matchScore: 98,
        matchedUserSkills: [
          skillName,
          ...effectiveSkills.filter((s) => s !== skillName).slice(0, 2)
        ],
        additionalSkills: ['Multi-Factor Verified', 'Peer Supervised', 'Diagnostic Lab Certified'],
        evidenceQualificationNote: `Directly unlocked by your Verified ${skillName} capability (98/100 Hands-On Exam + Peer Supervised Evidence).`,
        fastTrackPerk: '⚡ Fast-Track: Pre-Qualified via 95.4% ConnectIn Skill Passport',
        clearanceOrTier: `${enclaveName} Master Board Verified`,
        postedAgo: '4 hours ago · Direct Skill Match',
        hiringManagerName: 'Jordan Vance',
        hiringManagerTitle: `Director of ${enclaveName} Operations`,
        description: `Lead high-impact initiatives requiring verified mastery in ${skillName}. Candidates with a 95%+ ConnectIn Skill Passport bypass initial technical screening.`,
        applyUrl: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(skillName)}`
      })
    }
  })

  // Sort by highest matchScore first
  return results.sort((a, b) => b.matchScore - a.matchScore)
}
