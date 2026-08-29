export interface SalaryInsightRole {
  id: string
  title: string
  category: 'Cybersecurity' | 'Cloud & DevOps' | 'AI & Data' | 'Executive & Leadership' | 'GovTech & Defense'
  location: string
  metroArea: string
  medianBase: number
  rangeBase: { min: number; max: number }
  medianTotalComp: number
  rangeTotalComp: { min: number; max: number }
  bonusAvg: number
  equityAvgAnnual: number
  c2cRateHourly: { min: number; max: number; median: number }
  w2RateHourly: { min: number; max: number; median: number }
  governmentGSEquivalent: {
    grade: string
    step: string
    baseScale: number
    localityAdjustment: string
    totalFederalPay: number
  }
  clearancePremiumBonus: number
  experienceLevel: 'Entry (1-3 yrs)' | 'Mid-Senior (4-7 yrs)' | 'Staff / Principal (8+ yrs)' | 'Executive (12+ yrs)'
  topPayingCompanies: { name: string; avgTC: string }[]
  matchingJobsCount: number
  skillsDemand: string[]
}

export interface LocalityComparison {
  city: string
  state: string
  costOfLivingIndex: number // 100 is US average
  localityAdjustmentPercent: number
  medianTechSalary: number
  taxRateEstimated: number
  rentIndex: number
}

export const SALARY_INSIGHTS_ROLES_DATA: SalaryInsightRole[] = [
  {
    id: 'role_isse_dc',
    title: 'Information System Security Engineer (ISSE)',
    category: 'GovTech & Defense',
    location: 'Washington, DC Metro',
    metroArea: 'DC / Northern Virginia / Maryland',
    medianBase: 175000,
    rangeBase: { min: 150000, max: 205000 },
    medianTotalComp: 195000,
    rangeTotalComp: { min: 165000, max: 235000 },
    bonusAvg: 18000,
    equityAvgAnnual: 25000,
    c2cRateHourly: { min: 120, max: 165, median: 145 },
    w2RateHourly: { min: 95, max: 130, median: 112 },
    governmentGSEquivalent: {
      grade: 'GS-14',
      step: 'Step 5',
      baseScale: 122198,
      localityAdjustment: '+33.26% (DC-MD-VA-WV-PA)',
      totalFederalPay: 162841
    },
    clearancePremiumBonus: 25000,
    experienceLevel: 'Mid-Senior (4-7 yrs)',
    topPayingCompanies: [
      { name: 'Northrop Grumman', avgTC: '$198,000' },
      { name: 'Expedite Consults', avgTC: '$215,000' },
      { name: 'Lockheed Martin', avgTC: '$189,000' },
      { name: 'Booz Allen Hamilton', avgTC: '$182,000' }
    ],
    matchingJobsCount: 42,
    skillsDemand: ['NIST SP 800-53', 'RMF', 'eMASS', 'STIGs', 'Zero Trust', 'TS/SCI']
  },
  {
    id: 'role_cloud_sec_arch_sf',
    title: 'Principal Cloud Security Architect',
    category: 'Cybersecurity',
    location: 'San Francisco, CA / Silicon Valley',
    metroArea: 'SF Bay Area',
    medianBase: 245000,
    rangeBase: { min: 215000, max: 295000 },
    medianTotalComp: 385000,
    rangeTotalComp: { min: 320000, max: 480000 },
    bonusAvg: 45000,
    equityAvgAnnual: 95000,
    c2cRateHourly: { min: 165, max: 240, median: 195 },
    w2RateHourly: { min: 130, max: 185, median: 155 },
    governmentGSEquivalent: {
      grade: 'GS-15',
      step: 'Step 8',
      baseScale: 156323,
      localityAdjustment: '+44.15% (San Jose-San Francisco-Oakland)',
      totalFederalPay: 191900 // Cap
    },
    clearancePremiumBonus: 15000,
    experienceLevel: 'Staff / Principal (8+ yrs)',
    topPayingCompanies: [
      { name: 'Stripe', avgTC: '$420,000' },
      { name: 'Snowflake', avgTC: '$395,000' },
      { name: 'AWS Cloud Security', avgTC: '$385,000' },
      { name: 'Datadog', avgTC: '$360,000' }
    ],
    matchingJobsCount: 28,
    skillsDemand: ['AWS Security', 'Kubernetes', 'eBPF', 'Terraform', 'Zero Trust', 'Cilium mTLS']
  },
  {
    id: 'role_devsecops_remote',
    title: 'Senior DevSecOps & Platform Engineer',
    category: 'Cloud & DevOps',
    location: 'Remote (United States)',
    metroArea: 'National Remote',
    medianBase: 195000,
    rangeBase: { min: 170000, max: 230000 },
    medianTotalComp: 265000,
    rangeTotalComp: { min: 220000, max: 320000 },
    bonusAvg: 25000,
    equityAvgAnnual: 45000,
    c2cRateHourly: { min: 135, max: 185, median: 160 },
    w2RateHourly: { min: 105, max: 145, median: 125 },
    governmentGSEquivalent: {
      grade: 'GS-14',
      step: 'Step 4',
      baseScale: 118458,
      localityAdjustment: '+16.82% (Rest of US)',
      totalFederalPay: 138383
    },
    clearancePremiumBonus: 18000,
    experienceLevel: 'Mid-Senior (4-7 yrs)',
    topPayingCompanies: [
      { name: 'GitLab', avgTC: '$285,000' },
      { name: 'HashiCorp', avgTC: '$275,000' },
      { name: 'Expedite Consults', avgTC: '$270,000' },
      { name: 'CrowdStrike', avgTC: '$260,000' }
    ],
    matchingJobsCount: 56,
    skillsDemand: ['CI/CD Hardening', 'GitHub Actions', 'Checkmarx', 'Trivy', 'Kubernetes', 'Golang']
  },
  {
    id: 'role_ciso_nyc',
    title: 'Chief Information Security Officer (CISO)',
    category: 'Executive & Leadership',
    location: 'New York, NY',
    metroArea: 'NYC Metropolitan Area',
    medianBase: 320000,
    rangeBase: { min: 275000, max: 410000 },
    medianTotalComp: 550000,
    rangeTotalComp: { min: 420000, max: 780000 },
    bonusAvg: 95000,
    equityAvgAnnual: 135000,
    c2cRateHourly: { min: 250, max: 400, median: 325 },
    w2RateHourly: { min: 200, max: 310, median: 255 },
    governmentGSEquivalent: {
      grade: 'SES (Senior Executive Service)',
      step: 'Tier 2',
      baseScale: 191900,
      localityAdjustment: 'Statutory Federal Cap',
      totalFederalPay: 221900
    },
    clearancePremiumBonus: 35000,
    experienceLevel: 'Executive (12+ yrs)',
    topPayingCompanies: [
      { name: 'Goldman Sachs', avgTC: '$680,000' },
      { name: 'JPMorgan Chase', avgTC: '$620,000' },
      { name: 'Morgan Stanley', avgTC: '$590,000' },
      { name: 'BlackRock', avgTC: '$560,000' }
    ],
    matchingJobsCount: 14,
    skillsDemand: ['Board Governance', 'SEC Cybersecurity Rules', 'Cyber Risk Quantification', 'Zero Trust', 'SOC 2 Type II']
  },
  {
    id: 'role_fedramp_lead_dc',
    title: 'FedRAMP & Continuous ATO (cATO) Compliance Lead',
    category: 'GovTech & Defense',
    location: 'Washington, DC / Northern Virginia',
    metroArea: 'DC Metro',
    medianBase: 185000,
    rangeBase: { min: 160000, max: 215000 },
    medianTotalComp: 220000,
    rangeTotalComp: { min: 185000, max: 260000 },
    bonusAvg: 20000,
    equityAvgAnnual: 35000,
    c2cRateHourly: { min: 130, max: 175, median: 150 },
    w2RateHourly: { min: 100, max: 135, median: 118 },
    governmentGSEquivalent: {
      grade: 'GS-14',
      step: 'Step 6',
      baseScale: 125938,
      localityAdjustment: '+33.26% (DC-MD-VA)',
      totalFederalPay: 167825
    },
    clearancePremiumBonus: 22000,
    experienceLevel: 'Mid-Senior (4-7 yrs)',
    topPayingCompanies: [
      { name: 'Palantir', avgTC: '$260,000' },
      { name: 'Expedite Consults', avgTC: '$240,000' },
      { name: 'Coalfire', avgTC: '$210,000' },
      { name: 'Leidos', avgTC: '$195,000' }
    ],
    matchingJobsCount: 31,
    skillsDemand: ['FedRAMP High', 'NIST 800-53', 'OSCAL', 'Continuous ATO', 'CSPM', 'AWS GovCloud']
  },
  {
    id: 'role_offensive_redteam_austin',
    title: 'Lead Penetration Tester & Offensive Red Teamer',
    category: 'Cybersecurity',
    location: 'Austin, TX',
    metroArea: 'Austin Metro',
    medianBase: 185000,
    rangeBase: { min: 155000, max: 220000 },
    medianTotalComp: 245000,
    rangeTotalComp: { min: 200000, max: 300000 },
    bonusAvg: 25000,
    equityAvgAnnual: 35000,
    c2cRateHourly: { min: 140, max: 190, median: 165 },
    w2RateHourly: { min: 110, max: 150, median: 130 },
    governmentGSEquivalent: {
      grade: 'GS-14',
      step: 'Step 4',
      baseScale: 118458,
      localityAdjustment: '+19.40% (Austin-Round Rock)',
      totalFederalPay: 141438
    },
    clearancePremiumBonus: 20000,
    experienceLevel: 'Mid-Senior (4-7 yrs)',
    topPayingCompanies: [
      { name: 'CrowdStrike', avgTC: '$275,000' },
      { name: 'Mandiant (Google Cloud)', avgTC: '$265,000' },
      { name: 'Dell SecureWorks', avgTC: '$230,000' }
    ],
    matchingJobsCount: 24,
    skillsDemand: ['OSCP / OSCE', 'Adversary Emulation', 'Cobalt Strike', 'Reverse Engineering', 'Burp Suite Pro']
  }
]

export const LOCALITY_COMPARISONS_DATA: LocalityComparison[] = [
  {
    city: 'Washington, DC',
    state: 'District of Columbia',
    costOfLivingIndex: 152,
    localityAdjustmentPercent: 33.26,
    medianTechSalary: 175000,
    taxRateEstimated: 0.28,
    rentIndex: 168
  },
  {
    city: 'San Francisco',
    state: 'California',
    costOfLivingIndex: 186,
    localityAdjustmentPercent: 44.15,
    medianTechSalary: 235000,
    taxRateEstimated: 0.35,
    rentIndex: 210
  },
  {
    city: 'New York City',
    state: 'New York',
    costOfLivingIndex: 194,
    localityAdjustmentPercent: 36.16,
    medianTechSalary: 220000,
    taxRateEstimated: 0.36,
    rentIndex: 235
  },
  {
    city: 'Austin',
    state: 'Texas',
    costOfLivingIndex: 118,
    localityAdjustmentPercent: 19.40,
    medianTechSalary: 178000,
    taxRateEstimated: 0.22,
    rentIndex: 125
  },
  {
    city: 'Seattle',
    state: 'Washington',
    costOfLivingIndex: 148,
    localityAdjustmentPercent: 30.15,
    medianTechSalary: 215000,
    taxRateEstimated: 0.23, // No state income tax
    rentIndex: 160
  },
  {
    city: 'Huntsville',
    state: 'Alabama (Defense Hub)',
    costOfLivingIndex: 94,
    localityAdjustmentPercent: 21.05,
    medianTechSalary: 155000,
    taxRateEstimated: 0.24,
    rentIndex: 82
  }
]
