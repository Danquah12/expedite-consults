export interface CountryConfig {
  code: string
  name: string
  flag: string
  languages: string[]
  primaryLanguage: string
  currency: string
  currencySymbol: string
  hubs: string[]
}

export interface GlobalJobItem {
  id: string
  countryCode: string
  countryName: string
  title: string
  company: string
  companyLogo: string
  location: string
  hub: string
  workplaceType: 'Remote' | 'Hybrid' | 'On-site'
  employmentType: 'Full-time' | 'Contract'
  professionEnclave?: string
  domainCategory?: 'Recommended' | 'Government' | 'Defense' | 'Cybersecurity' | 'Remote' | 'Contract' | 'Full-time'
  requiredProductExperience?: string[]
  recommendedLearningCourse?: {
    title: string
    provider: string
    url?: string
  }
  postedTime: string
  applicantsCount: number
  salaryRange: string
  easyApply: boolean
  isSaved?: boolean
  description: string
  requirements: string[]
  languageRequirement: string
  applyUrl: string
  source: string
  tags: string[]
  clearanceRequired?: string
}

export interface JobApplicationItem {
  id: string
  jobTitle: string
  company: string
  companyLogo: string
  location: string
  salary: string
  stage: 'applied' | 'interview' | 'offer' | 'rejected'
  appliedDate: string
  nextStep?: string
  recruiterName?: string
  productVerifiedMatch?: string
  interviewDate?: string
  offerDetails?: string
}

export interface CandidateProfile {
  id: string
  name: string
  headline: string
  avatar: string
  location: string
  clearance?: string
  experienceYears: number
  capabilities: string[]
  verifiedProducts: string[]
  certifications: string[]
  matchScore: number
  currentStatus: 'Open to Offers' | 'Interviewing' | 'Ready to Start'
}

export const COUNTRIES_CONFIG: CountryConfig[] = [
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    languages: ['English', 'Spanish'],
    primaryLanguage: 'English',
    currency: 'USD',
    currencySymbol: '$',
    hubs: ['All Hubs', 'New York, NY', 'San Francisco, CA', 'Washington, DC / MD / VA', 'Austin, TX', 'Seattle, WA', 'Boston, MA', 'US Remote']
  },
  {
    code: 'GH',
    name: 'Ghana',
    flag: '🇬🇭',
    languages: ['English (Official)', 'Twi', 'Ga', 'Fante', 'Ewe'],
    primaryLanguage: 'English',
    currency: 'GHS',
    currencySymbol: 'GH₵',
    hubs: ['All Hubs', 'Accra (Airport City / East Legon)', 'Kumasi (Tech Hub)', 'Tema', 'Takoradi', 'Remote Ghana']
  },
  {
    code: 'DE',
    name: 'Germany (Deutschland)',
    flag: '🇩🇪',
    languages: ['Deutsch (German)', 'English'],
    primaryLanguage: 'Deutsch',
    currency: 'EUR',
    currencySymbol: '€',
    hubs: ['All Hubs', 'Berlin (Silicon Allee)', 'Munich (München Tech)', 'Frankfurt (FinTech)', 'Hamburg', 'Remote Germany']
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    languages: ['English', 'Welsh', 'Scots'],
    primaryLanguage: 'English',
    currency: 'GBP',
    currencySymbol: '£',
    hubs: ['All Hubs', 'London (Tech City)', 'Manchester', 'Cambridge / Oxford Corridor', 'Edinburgh', 'UK Remote']
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    languages: ['English', 'Français (French)'],
    primaryLanguage: 'English / French',
    currency: 'CAD',
    currencySymbol: 'CA$',
    hubs: ['All Hubs', 'Toronto, ON', 'Vancouver, BC', 'Montreal, QC', 'Ottawa, ON (GovTech)', 'Canada Remote']
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    languages: ['Français (French)', 'English'],
    primaryLanguage: 'Français',
    currency: 'EUR',
    currencySymbol: '€',
    hubs: ['All Hubs', 'Paris (Station F)', 'Lyon', 'Toulouse (AeroTech)', 'Sophia Antipolis', 'Remote France']
  },
  {
    code: 'JP',
    name: 'Japan (日本)',
    flag: '🇯🇵',
    languages: ['日本語 (Japanese)', 'English'],
    primaryLanguage: '日本語',
    currency: 'JPY',
    currencySymbol: '¥',
    hubs: ['All Hubs', 'Tokyo (Roppongi / Shibuya)', 'Osaka', 'Fukuoka (Startup City)', 'Yokohama', 'Remote Japan']
  },
  {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    languages: ['English (Official)', 'Yoruba', 'Igbo', 'Hausa'],
    primaryLanguage: 'English',
    currency: 'NGN',
    currencySymbol: '₦',
    hubs: ['All Hubs', 'Lagos (Yaba / Victoria Island)', 'Abuja (Federal Tech)', 'Port Harcourt', 'Ibadan', 'Remote Nigeria']
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    languages: ['English'],
    primaryLanguage: 'English',
    currency: 'AUD',
    currencySymbol: 'A$',
    hubs: ['All Hubs', 'Sydney, NSW', 'Melbourne, VIC', 'Brisbane, QLD', 'Canberra, ACT (GovCyber)', 'Australia Remote']
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    languages: ['English', 'Mandarin (中文)', 'Malay', 'Tamil'],
    primaryLanguage: 'English',
    currency: 'SGD',
    currencySymbol: 'S$',
    hubs: ['All Hubs', 'Downtown Core / Marina Bay', 'One-North (Biopolis & Fusionopolis)', 'Changi Business Park', 'Remote Singapore']
  },
  {
    code: 'NL',
    name: 'Netherlands (Nederland)',
    flag: '🇳🇱',
    languages: ['Nederlands (Dutch)', 'English'],
    primaryLanguage: 'Nederlands',
    currency: 'EUR',
    currencySymbol: '€',
    hubs: ['All Hubs', 'Amsterdam', 'Eindhoven (Brainport / High Tech)', 'Rotterdam', 'The Hague (Cyber Security Hub)', 'Remote Netherlands']
  },
  {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    languages: ['English', 'isiZulu', 'isiXhosa', 'Afrikaans'],
    primaryLanguage: 'English',
    currency: 'ZAR',
    currencySymbol: 'R',
    hubs: ['All Hubs', 'Cape Town (Silicon Cape)', 'Johannesburg (Sandton)', 'Pretoria / Tshwane', 'Durban', 'Remote South Africa']
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    languages: ['English', 'Hindi (हिन्दी)', 'Kannada', 'Tamil', 'Telugu'],
    primaryLanguage: 'English / Hindi',
    currency: 'INR',
    currencySymbol: '₹',
    hubs: ['All Hubs', 'Bengaluru (Silicon Valley of India)', 'Hyderabad (Cyberabad)', 'Pune', 'Gurugram / NCR', 'Remote India']
  },
  {
    code: 'AE',
    name: 'United Arab Emirates (الإمارات)',
    flag: '🇦🇪',
    languages: ['العربية (Arabic)', 'English'],
    primaryLanguage: 'English / Arabic',
    currency: 'AED',
    currencySymbol: 'AED ',
    hubs: ['All Hubs', 'Dubai (DIFC / Internet City)', 'Abu Dhabi (Hub71)', 'Sharjah', 'Remote UAE']
  },
  {
    code: 'BR',
    name: 'Brazil (Brasil)',
    flag: '🇧🇷',
    languages: ['Português (Portuguese)', 'English'],
    primaryLanguage: 'Português',
    currency: 'BRL',
    currencySymbol: 'R$',
    hubs: ['All Hubs', 'São Paulo (Faria Lima)', 'Rio de Janeiro', 'Florianópolis (Silicon Island)', 'Belo Horizonte', 'Remote Brazil']
  }
]

export const GLOBAL_JOBS_CATALOG: GlobalJobItem[] = [
  // ================= SKILLED TRADES & CARPENTRY ENCLAVE =================
  {
    id: 'trade_1',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'trades_construction',
    domainCategory: 'Recommended',
    title: 'Master Heavy Timber Carpenter & Bents Lead',
    company: 'Heritage Timber Framing Guild',
    companyLogo: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&auto=format&fit=crop&q=80',
    location: 'Austin, TX (On-site)',
    hub: 'Austin, TX',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '2 hours ago',
    applicantsCount: 6,
    salaryRange: '$95,000 - $130,000 / yr',
    easyApply: true,
    description: 'Lead fabrication and site erection of 40-foot clear-span Douglas Fir timber frame bents. Master mortise-and-tenon joinery with draw-bored white oak pegs. Read structural timber plans and coordinate crane picks.',
    requirements: ['8+ years heavy timber framing experience', 'Proficiency with Festool Domino XL DF 700 & beam saws', 'OSHA 30 Job-Site Safety certification', 'Ability to interpret PE-stamped load diagrams'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.heritagetimber.com/careers',
    source: 'Heritage Guild Direct',
    tags: ['Timber Framing', 'Carpentry', 'Joinery', 'OSHA 30', 'Recommended']
  },
  {
    id: 'trade_2',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'trades_construction',
    domainCategory: 'Recommended',
    title: 'Architectural Finish Joiner & Custom Millwork Lead',
    company: 'Craftsman Architectural Woodworking',
    companyLogo: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=100&auto=format&fit=crop&q=80',
    location: 'Seattle, WA (On-site)',
    hub: 'Seattle, WA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '5 hours ago',
    applicantsCount: 11,
    salaryRange: '$88,000 - $118,000 / yr',
    easyApply: true,
    description: 'Precision interior architectural finish carpentry, custom walnut wall paneling, curved staircases, and compound coffered ceilings for luxury commercial and residential estates.',
    requirements: ['6+ years finish carpentry / custom cabinetry', 'Precision compound miter and coped joinery skills', 'Mastery of Festool track saws and Domino system', 'Blueprint cut-list calculation'],
    languageRequirement: 'English',
    applyUrl: 'https://www.craftsmanwood.com/careers',
    source: 'Craftsman Direct',
    tags: ['Finish Carpentry', 'Carpentry', 'Millwork', 'Joinery']
  },
  {
    id: 'trade_3',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'trades_construction',
    domainCategory: 'Full-time',
    title: 'Commercial Framing & Site Superintendent',
    company: 'Turner & DPR Construction Alliance',
    companyLogo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    location: 'Boston, MA (On-site)',
    hub: 'Boston, MA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 14,
    salaryRange: '$120,000 - $155,000 / yr',
    easyApply: false,
    description: 'Oversee structural wood framing, steel stud installation, and trade subcontractor coordination on a $42M multi-use commercial center. Direct responsibility for OSHA 30 job-site safety, inspections, and milestone progress draws.',
    requirements: ['10+ years commercial framing and superintendent experience', 'OSHA 30 Certified + CPR/First Aid', 'Procore / PlanGrid BIM coordination', 'Subcontractor trade management'],
    languageRequirement: 'English',
    applyUrl: 'https://www.turnerconstruction.com/careers',
    source: 'Turner Direct ATS',
    tags: ['General Contracting', 'Framing', 'Construction', 'Prevailing Wage']
  },
  {
    id: 'trade_4',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'trades_construction',
    domainCategory: 'Contract',
    title: 'Journeyman Timber Framer & Post-and-Beam Rigger',
    company: 'High Country Timberworks',
    companyLogo: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&auto=format&fit=crop&q=80',
    location: 'US Remote / Travel',
    hub: 'US Remote',
    workplaceType: 'On-site',
    employmentType: 'Contract',
    postedTime: '2 days ago',
    applicantsCount: 8,
    salaryRange: '$45 - $65 / hr ($90,000 - $130,000 eq.)',
    easyApply: true,
    description: 'Travel erection crew framing large-scale glulam and heavy timber municipal pavilions across the Pacific Northwest and Rocky Mountain region. Per-diem provided.',
    requirements: ['Valid Journeyman trade card', 'OSHA 10 or 30', 'Rigging and crane signaling certification'],
    languageRequirement: 'English',
    applyUrl: 'https://www.highcountrytimber.com/careers',
    source: 'Timber Guild Board',
    tags: ['Apprentice', 'Timber Framing', 'Carpentry', 'Contract']
  },

  // ================= HEALTHCARE & MEDICINE ENCLAVE =================
  {
    id: 'health_1',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'healthcare_medicine',
    domainCategory: 'Recommended',
    title: 'Attending Orthopedic Trauma Surgeon & Clinical Chair',
    company: 'Johns Hopkins Medicine / Shock Trauma',
    companyLogo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80',
    location: 'Washington, DC / MD / VA (On-site)',
    hub: 'Washington, DC / MD / VA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '3 hours ago',
    applicantsCount: 4,
    salaryRange: '$480,000 - $690,000 / yr',
    easyApply: false,
    description: 'Direct the Pelvic & Acetabular Fracture Reconstruction service at our Level 1 Trauma Center. Perform complex articular reconstruction, periprosthetic fractures, and participate in clinical orthobiologic trials.',
    requirements: ['MD/DO with ABOS Board Certification in Orthopedic Surgery', 'OTA-accredited Orthopedic Trauma Fellowship', 'Active Maryland / DC medical license', 'Demonstrated clinical research record'],
    languageRequirement: 'English',
    applyUrl: 'https://www.hopkinsmedicine.org/careers',
    source: 'Johns Hopkins Direct',
    tags: ['Surgery', 'Orthopedic Surgery', 'Trauma & Emergency', 'Hospitalist', 'Recommended']
  },
  {
    id: 'health_2',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'healthcare_medicine',
    domainCategory: 'Recommended',
    title: 'Emergency Trauma Resuscitation Nurse Lead (RN, CCRN, TNCC)',
    company: 'Massachusetts General Hospital - Level 1 Trauma',
    companyLogo: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=100&auto=format&fit=crop&q=80',
    location: 'Boston, MA (On-site)',
    hub: 'Boston, MA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '4 hours ago',
    applicantsCount: 9,
    salaryRange: '$120,000 - $152,000 / yr',
    easyApply: true,
    description: 'Lead Emergency Severity Index Level 1 and trauma bay resuscitations. Direct Rapid Infusion Catheter (Belmont RI-2) protocols, arterial line access, and Massive Transfusion Protocol (MTP) blood delivery.',
    requirements: ['BSN with active MA RN License', 'AACN CCRN and ENA TNCC certified', '4+ years Level 1 Trauma Center emergency nursing', 'ACLS, PALS, BLS certified'],
    languageRequirement: 'English',
    applyUrl: 'https://www.massgeneral.org/careers',
    source: 'MGH Talent ATS',
    tags: ['Trauma & Emergency', 'Nursing', 'Critical Care', 'CCRN', 'Recommended']
  },
  {
    id: 'health_3',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'healthcare_medicine',
    domainCategory: 'Contract',
    title: 'Surgical Critical Care ICU Staff Nurse (Travel / PRN)',
    company: 'Cleveland Clinic Foundation',
    companyLogo: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY (Hybrid)',
    hub: 'New York, NY',
    workplaceType: 'On-site',
    employmentType: 'Contract',
    postedTime: '1 day ago',
    applicantsCount: 16,
    salaryRange: '$3,100 - $4,200 / week ($150,000+ eq.)',
    easyApply: true,
    description: '13-week high-acuity surgical intensive care travel contract. Management of hemodynamic instability, ECMO, mechanical ventilation, and multi-organ failure post-cardiothoracic surgery.',
    requirements: ['Active Compact RN License or NY RN license', 'CCRN or CMC certification preferred', '2+ years Cardiothoracic or Trauma ICU experience'],
    languageRequirement: 'English',
    applyUrl: 'https://my.clevelandclinic.org/careers',
    source: 'Cleveland Clinic Staffing',
    tags: ['Critical Care', 'Nursing', 'Locum Tenens', 'Contract']
  },
  {
    id: 'health_4',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'healthcare_medicine',
    domainCategory: 'Contract',
    title: 'Locum Tenens Acute Care Trauma Surgeon',
    company: 'Envision Healthcare / Medical Staffing',
    companyLogo: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=100&auto=format&fit=crop&q=80',
    location: 'Austin, TX (On-site)',
    hub: 'Austin, TX',
    workplaceType: 'On-site',
    employmentType: 'Contract',
    postedTime: '2 days ago',
    applicantsCount: 5,
    salaryRange: '$3,400 - $4,600 / 24-hr shift',
    easyApply: true,
    description: 'Provide 24-hour in-house Level 2 Trauma coverage and emergency general surgery call. Full malpractice insurance and private travel/lodging provided.',
    requirements: ['Board Certified General Surgery (ABMS/ABS)', 'Surgical Critical Care fellowship a plus', 'ATLS instructor status preferred'],
    languageRequirement: 'English',
    applyUrl: 'https://www.envisionhealth.com/careers',
    source: 'Envision Direct',
    tags: ['Surgery', 'Locum Tenens', 'Trauma & Emergency']
  },

  // ================= AUTOMOTIVE & FLEET MECHANICS ENCLAVE =================
  {
    id: 'auto_1',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'automotive_mechanics',
    domainCategory: 'Recommended',
    title: 'ASE World Class Master Automobile Technician & Shop Foreman',
    company: 'Penske Automotive Group',
    companyLogo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY (On-site)',
    hub: 'New York, NY',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '2 hours ago',
    applicantsCount: 7,
    salaryRange: '$110,000 - $155,000 / yr ($55 - $72 / flag hr)',
    easyApply: true,
    description: 'Lead dealership diagnostic bay and mentor apprentice technicians. Perform complex driveability diagnostics, CAN-FD scope analysis, transmission teardowns, and high-voltage hybrid powertrain service.',
    requirements: ['ASE Certified Master Automobile Technician (A1–A8)', 'ASE L1 Advanced Engine Performance certification', '8+ years dealership or premier independent experience', 'Expertise with Snap-on ZEUS+ and PicoScope'],
    languageRequirement: 'English',
    applyUrl: 'https://www.penskeautomotive.com/careers',
    source: 'Penske Direct',
    tags: ['Master Diagnostics', 'Automotive', 'ASE', 'Shop Foreman', 'Recommended']
  },
  {
    id: 'auto_2',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'automotive_mechanics',
    domainCategory: 'Recommended',
    title: '800V High-Voltage EV Powertrain & Inverter Diagnostic Specialist',
    company: 'Rivian Advanced Service Operations',
    companyLogo: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA (On-site)',
    hub: 'San Francisco, CA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '4 hours ago',
    applicantsCount: 12,
    salaryRange: '$125,000 - $165,000 / yr',
    easyApply: true,
    description: 'Diagnose and repair dual-motor and quad-motor 800V electric drivetrains, silicon-carbide inverters, and high-voltage DC contactors. Perform live pack de-energization using NFPA 70E Category 4 PPE.',
    requirements: ['NFPA 70E High Voltage Electrical Safety certified', 'ASE L3 Light Duty Hybrid/EV Specialist', 'High proficiency with 1000V insulation testers & CAN-bus decoders'],
    languageRequirement: 'English',
    applyUrl: 'https://rivian.com/careers',
    source: 'Rivian ATS',
    tags: ['EV Powertrain', 'Automotive', 'Diagnostics', 'High-Voltage', 'Recommended']
  },
  {
    id: 'auto_3',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'automotive_mechanics',
    domainCategory: 'Full-time',
    title: 'Heavy Duty Commercial Fleet Diesel Lead (Cummins & Detroit)',
    company: 'Ryder Fleet Maintenance Services',
    companyLogo: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=100&auto=format&fit=crop&q=80',
    location: 'Austin, TX (On-site)',
    hub: 'Austin, TX',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 10,
    salaryRange: '$92,000 - $128,000 / yr',
    easyApply: true,
    description: 'Maintain and diagnose Class 8 commercial tractor-trailers powered by Cummins X15 and Detroit DD15 engines. Deep expertise in SCR aftertreatment, DEF dosers, DPF regeneration, and Wabco air brakes.',
    requirements: ['ASE Master Medium/Heavy Truck (T1–T8)', 'Cummins INSITE and Detroit Diagnostic Link software proficiency', 'Commercial Driver License (CDL Class A) preferred'],
    languageRequirement: 'English',
    applyUrl: 'https://ryder.com/careers',
    source: 'Ryder Fleet Careers',
    tags: ['Heavy Diesel', 'Automotive', 'Fleet', 'Flat-rate']
  },
  {
    id: 'auto_4',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'automotive_mechanics',
    domainCategory: 'Contract',
    title: 'Master Diagnostic Technician (PicoScope & CAN-FD Specialist)',
    company: 'Audi & Porsche Performance Center',
    companyLogo: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=100&auto=format&fit=crop&q=80',
    location: 'Seattle, WA (On-site)',
    hub: 'Seattle, WA',
    workplaceType: 'On-site',
    employmentType: 'Contract',
    postedTime: '2 days ago',
    applicantsCount: 8,
    salaryRange: '$65 - $85 / flat hr ($130,000 - $170,000 eq.)',
    easyApply: true,
    description: 'Dedicated diagnostic contractor resolving stubborn intermittent electrical faults, CAN-FD communication dropouts, and FlexRay bus glitches on German luxury and performance vehicles.',
    requirements: ['ASE Master Tech or European OEM Master Certified', 'Mastery of 4-channel PicoScope and current clamps', 'ODIS and VCDS diagnostic suites'],
    languageRequirement: 'English',
    applyUrl: 'https://www.audi.com/careers',
    source: 'Audi Master Tech Portal',
    tags: ['Master Diagnostics', 'Automotive', 'Flat-rate']
  },

  // ================= UNITED STATES TECH & CYBERSECURITY =================
  {
    id: 'us_1',
    countryCode: 'US',
    countryName: 'United States',
    title: 'Lead Cloud Security Architect',
    company: 'Expedite Consults',
    companyLogo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY (Hybrid)',
    hub: 'New York, NY',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 18,
    salaryRange: '$195,000 - $240,000 / yr',
    easyApply: true,
    description: 'Lead zero-trust multi-cloud architectures across AWS, Azure, and GCP. Architect microVM sandboxing, eBPF telemetry, and autonomous pentest validation.',
    requirements: ['10+ years in Cloud Infrastructure Security', 'Hands-on AWS Transit Gateway & mTLS', 'CISSP / CCSP or AWS Security Specialty', 'Zero Trust IAM Architecture'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.expediteconsults.com/careers',
    source: 'Expedite Direct ATS',
    tags: ['Zero Trust', 'AWS', 'eBPF', 'Kubernetes']
  },
  {
    id: 'us_2',
    countryCode: 'US',
    countryName: 'United States',
    title: 'Staff AI Safety & Red Teaming Engineer',
    company: 'Anthropic',
    companyLogo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA (Hybrid / Remote)',
    hub: 'San Francisco, CA',
    workplaceType: 'Remote',
    employmentType: 'Full-time',
    postedTime: '2 days ago',
    applicantsCount: 42,
    salaryRange: '$240,000 - $310,000 / yr',
    easyApply: false,
    description: 'Develop automated red-teaming harnesses and adversarial prompt probes to evaluate LLM guardrails against jailbreaks and multi-agent loops.',
    requirements: ['PyTorch / Transformer architecture familiarity', 'Adversarial evaluation & fuzzing experience', 'Published research or industry security audits'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://boards.greenhouse.io/anthropic',
    source: 'Greenhouse ATS',
    tags: ['AI Security', 'LLM Red Team', 'Python', 'San Francisco']
  },
  {
    id: 'us_3',
    countryCode: 'US',
    countryName: 'United States',
    title: 'Principal Cyber Threat Hunter (Defense & GovTech)',
    company: 'Palantir Technologies',
    companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80',
    location: 'Washington, DC / Northern VA',
    hub: 'Washington, DC / MD / VA',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '3 days ago',
    applicantsCount: 24,
    salaryRange: '$210,000 - $285,000 / yr',
    easyApply: false,
    description: 'Hunt advanced persistent threats (APTs) across critical US national security infrastructure and federated government multi-tenant enclave networks.',
    requirements: ['Active US Security Clearance (Secret / TS/SCI eligible)', 'Deep packet analysis & memory forensics', 'YARA, Sigma, and STIX 2.1 rule creation'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.palantir.com/careers',
    source: 'Greenhouse ATS',
    tags: ['Threat Hunting', 'DC Metro', 'GovTech', 'Defense'],
    clearanceRequired: 'US Secret / TS-SCI Eligible'
  },
  {
    id: 'us_4',
    countryCode: 'US',
    countryName: 'United States',
    title: 'Senior Frontend Systems Engineer (Next.js 16 & Turbopack)',
    company: 'Vercel Ecosystem Labs',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    location: 'US Remote (Nationwide)',
    hub: 'US Remote',
    workplaceType: 'Remote',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 58,
    salaryRange: '$180,000 - $225,000 / yr',
    easyApply: true,
    description: 'Help build high-performance web platforms with Next.js 16, React Server Actions, optimistic UI mutations, and Tailwind CSS v4 design tokens.',
    requirements: ['5+ years React & TypeScript production experience', 'Deep knowledge of Next.js App Router and SSR streaming', 'Web performance profiling & Core Web Vitals'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://vercel.com/careers',
    source: 'Greenhouse ATS',
    tags: ['Next.js 16', 'React 19', 'TypeScript', 'US Remote']
  },

  // ================= GHANA =================
  {
    id: 'gh_1',
    countryCode: 'GH',
    countryName: 'Ghana',
    title: 'Lead Cloud Infrastructure & Cybersecurity Lead',
    company: 'Expedite Consults Africa HQ',
    companyLogo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
    location: 'Accra (Airport City / East Legon)',
    hub: 'Accra (Airport City / East Legon)',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 14,
    salaryRange: 'GH₵ 350,000 - GH₵ 480,000 / yr',
    easyApply: true,
    description: 'Lead enterprise security operations, automated pentesting deployments, and cloud compliance for financial institutions across West Africa and Pan-African expansion.',
    requirements: ['8+ years experience in network security and cloud infrastructure', 'Familiarity with Bank of Ghana Cyber & Information Security Directive (CISD)', 'AWS / Azure Certified Security Specialist', 'Zero Trust network design'],
    languageRequirement: 'English (Official) · Twi proficiency a plus',
    applyUrl: 'https://www.expediteconsults.com/careers',
    source: 'Expedite Direct ATS',
    tags: ['Accra', 'Cybersecurity', 'CISD', 'FinTech']
  },
  {
    id: 'gh_2',
    countryCode: 'GH',
    countryName: 'Ghana',
    title: 'Senior FinTech Fullstack Engineer (Next.js & Mobile Money APIs)',
    company: 'Hubtel Payments',
    companyLogo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=80',
    location: 'Accra (Cantonments)',
    hub: 'Accra (Airport City / East Legon)',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '2 days ago',
    applicantsCount: 38,
    salaryRange: 'GH₵ 240,000 - GH₵ 360,000 / yr',
    easyApply: true,
    description: 'Build high-throughput payment gateways, mobile money webhook listeners (MTN MoMo, Telecel Cash), and real-time merchant settlement dashboards.',
    requirements: ['5+ years experience in React, Node.js, and TypeScript', 'Integration with Ghana Interbank Payment and Settlement Systems (GhIPSS)', 'PostgreSQL and high-concurrency Redis caching'],
    languageRequirement: 'English (Fluent)',
    applyUrl: 'https://hubtel.com/careers',
    source: 'Hubtel Talent Portal',
    tags: ['FinTech', 'MoMo', 'Next.js', 'Accra']
  },
  {
    id: 'gh_3',
    countryCode: 'GH',
    countryName: 'Ghana',
    title: 'Head of Information Security (CISO)',
    company: 'Stanbic Bank Ghana',
    companyLogo: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&auto=format&fit=crop&q=80',
    location: 'Accra (Ridge Financial District)',
    hub: 'Accra (Airport City / East Legon)',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '3 days ago',
    applicantsCount: 9,
    salaryRange: 'GH₵ 600,000 - GH₵ 850,000 / yr',
    easyApply: false,
    description: 'Direct the defense strategy for national banking infrastructure, regulatory audits, SOC operations, and incident response readiness.',
    requirements: ['CISSP, CISM, or CISA certification', '12+ years in financial banking security leadership', 'Strong understanding of PCI-DSS and ISO 27001'],
    languageRequirement: 'English (Business Fluent)',
    applyUrl: 'https://www.stanbicbank.com.gh/careers',
    source: 'Standard Bank Group Careers',
    tags: ['Banking', 'CISO', 'ISO27001', 'Accra']
  },
  {
    id: 'gh_4',
    countryCode: 'GH',
    countryName: 'Ghana',
    title: 'AI & Data Science Lead (AgriTech & Logistics)',
    company: 'Farmerline Labs',
    companyLogo: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=100&auto=format&fit=crop&q=80',
    location: 'Kumasi (Tech City) / Remote Ghana',
    hub: 'Kumasi (Tech Hub)',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '4 days ago',
    applicantsCount: 21,
    salaryRange: 'GH₵ 220,000 - GH₵ 310,000 / yr',
    easyApply: true,
    description: 'Deploy predictive machine learning models for agricultural weather forecasting, supply chain optimization, and offline Voice-SMS systems for farmers.',
    requirements: ['Python, PyTorch, and GeoJSON geospatial analysis', 'Experience with offline-first edge compute', 'Spoken communication in Twi or local dialects is a major asset'],
    languageRequirement: 'English (Fluent) & Twi / Fante preferred',
    applyUrl: 'https://farmerline.co/careers',
    source: 'Farmerline ATS',
    tags: ['AI', 'DataScience', 'Kumasi', 'AgriTech']
  },
  {
    id: 'gh_5',
    countryCode: 'GH',
    countryName: 'Ghana',
    title: 'Senior DevOps & Site Reliability Engineer',
    company: 'Paystack / Stripe Ghana',
    companyLogo: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=100&auto=format&fit=crop&q=80',
    location: 'Remote Ghana (Accra / Kumasi / Takoradi)',
    hub: 'Remote Ghana',
    workplaceType: 'Remote',
    employmentType: 'Full-time',
    postedTime: '2 days ago',
    applicantsCount: 45,
    salaryRange: 'GH₵ 300,000 - GH₵ 440,000 / yr',
    easyApply: true,
    description: 'Scale multi-region Kubernetes clusters, automated rollback systems, and zero-downtime database migrations for millions of Pan-African checkout sessions.',
    requirements: ['Terraform, Docker, Kubernetes, and AWS ECS/EKS', 'Observability with Datadog and Prometheus', 'Golang or Node.js backend debugging'],
    languageRequirement: 'English (Fluent)',
    applyUrl: 'https://paystack.com/careers',
    source: 'Paystack Careers',
    tags: ['DevOps', 'Kubernetes', 'RemoteGhana', 'FinTech']
  },

  // ================= GERMANY =================
  {
    id: 'de_1',
    countryCode: 'DE',
    countryName: 'Germany',
    title: 'Senior Cloud Security Architect (Zero Trust & BSI IT-Grundschutz)',
    company: 'Siemens Energy Cyber',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=80',
    location: 'Munich (München) / Berlin (Hybrid)',
    hub: 'Munich (München Tech)',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 22,
    salaryRange: '€95,000 - €125,000 / yr',
    easyApply: true,
    description: 'Design zero-trust cloud architectures for critical European energy grids adhering to German BSI C5 and NIS2 cybersecurity standards.',
    requirements: ['Expertise in AWS/Azure Cloud Security', 'Knowledge of BSI IT-Grundschutz & ISO 27001', 'Experience in industrial IoT / OT security is a plus'],
    languageRequirement: 'Deutsch (C1/Fluent) & English (B2+)',
    applyUrl: 'https://jobs.siemens-energy.com',
    source: 'Siemens Careers',
    tags: ['Munich', 'BSI', 'NIS2', 'Zero Trust']
  },
  {
    id: 'de_2',
    countryCode: 'DE',
    countryName: 'Germany',
    title: 'Staff AI Engineer (Automotive LLMs & Perception)',
    company: 'BMW Group Tech Labs',
    companyLogo: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=100&auto=format&fit=crop&q=80',
    location: 'Munich / Berlin (Silicon Allee)',
    hub: 'Berlin (Silicon Allee)',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '3 days ago',
    applicantsCount: 37,
    salaryRange: '€105,000 - €140,000 / yr',
    easyApply: false,
    description: 'Develop on-device edge multimodal models and autonomous driving perception layers with C++20 and PyTorch TensorRT.',
    requirements: ['MSc/PhD in Computer Science or Robotics', 'C++20, CUDA, PyTorch, ROS2', 'Experience in real-time inference optimization'],
    languageRequirement: 'English (Fluent) · German helpful',
    applyUrl: 'https://www.bmwgroup.jobs',
    source: 'BMW Careers',
    tags: ['Berlin', 'AI', 'AutonomousDriving', 'CUDA']
  },
  {
    id: 'de_3',
    countryCode: 'DE',
    countryName: 'Germany',
    title: 'Lead Fullstack Platform Engineer (Next.js & Rust)',
    company: 'N26 Mobile Bank',
    companyLogo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=80',
    location: 'Berlin (Alexanderplatz)',
    hub: 'Berlin (Silicon Allee)',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '2 days ago',
    applicantsCount: 51,
    salaryRange: '€85,000 - €115,000 / yr',
    easyApply: true,
    description: 'Build micro-frontend banking modules with Next.js App Router and high-concurrency ledger backends in Rust and Kotlin.',
    requirements: ['5+ years TypeScript & React architecture', 'Experience in BaFin regulated FinTech environments', 'Kafka stream processing'],
    languageRequirement: 'English (Working Language)',
    applyUrl: 'https://n26.com/en-de/careers',
    source: 'Greenhouse ATS',
    tags: ['Berlin', 'FinTech', 'Next.js', 'Rust']
  },

  // ================= UNITED KINGDOM =================
  {
    id: 'gb_1',
    countryCode: 'GB',
    countryName: 'United Kingdom',
    title: 'Principal AppSec / Threat Modeling Lead',
    company: 'Revolut Global',
    companyLogo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&auto=format&fit=crop&q=80',
    location: 'London (Canary Wharf) / UK Remote',
    hub: 'London (Tech City)',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 39,
    salaryRange: '£110,000 - £150,000 / yr',
    easyApply: true,
    description: 'Lead application security, automated SAST/DAST verification, and cryptographic vault security for over 45M retail and business accounts.',
    requirements: ['Proven track record in FinTech security', 'Deep knowledge of OAuth 2.0, mTLS, and HSM tokenization', 'Python, Go, or Java code review'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.revolut.com/careers',
    source: 'Lever ATS',
    tags: ['London', 'FinTech', 'AppSec', 'Zero Trust']
  },
  {
    id: 'gb_2',
    countryCode: 'GB',
    countryName: 'United Kingdom',
    title: 'Senior AI Research Scientist (Agent Safety)',
    company: 'Google DeepMind UK',
    companyLogo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&auto=format&fit=crop&q=80',
    location: 'London (King\'s Cross)',
    hub: 'London (Tech City)',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '2 days ago',
    applicantsCount: 68,
    salaryRange: '£130,000 - £180,000 / yr',
    easyApply: false,
    description: 'Pioneer alignment benchmarks and multi-agent game-theoretic containment protocols for frontier artificial general intelligence systems.',
    requirements: ['PhD in ML, AI, or Mathematics', 'Strong publication record at NeurIPS, ICML, or ICLR', 'JAX, PyTorch, distributed TPU cluster scaling'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.deepmind.com/careers',
    source: 'Google Careers',
    tags: ['London', 'DeepMind', 'AI Research', 'JAX']
  },

  // ================= NIGERIA =================
  {
    id: 'ng_1',
    countryCode: 'NG',
    countryName: 'Nigeria',
    title: 'VP of Engineering & Cyber Defense',
    company: 'Flutterwave',
    companyLogo: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=100&auto=format&fit=crop&q=80',
    location: 'Lagos (Victoria Island) / Remote Nigeria',
    hub: 'Lagos (Yaba / Victoria Island)',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 28,
    salaryRange: '₦ 45,000,000 - ₦ 70,000,000 / yr',
    easyApply: true,
    description: 'Scale payment infrastructure across 34 African nations, lead SOC operations, and protect against global fraud vectors.',
    requirements: ['10+ years engineering leadership in payments/banking', 'Deep knowledge of CBN regulatory guidelines and ISO 27001', 'Multi-region AWS & GCP infrastructure'],
    languageRequirement: 'English (Official)',
    applyUrl: 'https://flutterwave.com/careers',
    source: 'Greenhouse ATS',
    tags: ['Lagos', 'FinTech', 'Payments', 'CyberDefense']
  },
  {
    id: 'ng_2',
    countryCode: 'NG',
    countryName: 'Nigeria',
    title: 'Senior Frontend Engineer (Next.js & Web3)',
    company: 'Kuda Bank (The Bank of the Free)',
    companyLogo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=80',
    location: 'Lagos (Yaba Tech Cluster)',
    hub: 'Lagos (Yaba / Victoria Island)',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '3 days ago',
    applicantsCount: 54,
    salaryRange: '₦ 24,000,000 - ₦ 38,000,000 / yr',
    easyApply: true,
    description: 'Build consumer banking web dashboards with instantaneous optimistic state updates, biometric WebAuthn security, and offline support.',
    requirements: ['5+ years React, Next.js, and TypeScript', 'Experience building accessible, mobile-first banking UI', 'State management with Zustand and TanStack Query'],
    languageRequirement: 'English (Fluent)',
    applyUrl: 'https://kuda.com/careers',
    source: 'Kuda Careers',
    tags: ['Lagos', 'Next.js', 'FinTech', 'React']
  },

  // ================= CANADA =================
  {
    id: 'ca_1',
    countryCode: 'CA',
    countryName: 'Canada',
    title: 'Senior Staff Cloud Security Engineer',
    company: 'Shopify Core Infrastructure',
    companyLogo: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=100&auto=format&fit=crop&q=80',
    location: 'Toronto, ON / Ottawa / Canada Remote',
    hub: 'Toronto, ON',
    workplaceType: 'Remote',
    employmentType: 'Full-time',
    postedTime: '2 days ago',
    applicantsCount: 36,
    salaryRange: 'CA$ 175,000 - CA$ 230,000 / yr',
    easyApply: true,
    description: 'Harden cloud commerce infrastructure powering over $200B in GMV. Implement automated secrets rotation, eBPF telemetry, and multi-tenant isolation.',
    requirements: ['7+ years experience in Ruby, Go, or Python', 'Kubernetes cluster governance and Google Cloud IAM', 'Experience with Black Friday/Cyber Monday scale traffic'],
    languageRequirement: 'English (Fluent) · French is a plus',
    applyUrl: 'https://www.shopify.com/careers',
    source: 'SmartRecruiters ATS',
    tags: ['Toronto', 'Shopify', 'GCP', 'eBPF']
  },

  // ================= JAPAN =================
  {
    id: 'jp_1',
    countryCode: 'JP',
    countryName: 'Japan',
    title: 'Principal Autonomous Defense & AI Engineer',
    company: 'Sony AI & Cyber Robotics',
    companyLogo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80',
    location: 'Tokyo (Roppongi / Minato-ku)',
    hub: 'Tokyo (Roppongi / Shibuya)',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 16,
    salaryRange: '¥14,000,000 - ¥19,500,000 / yr',
    easyApply: false,
    description: 'Develop cyber-physical containment protocols and automated penetration testing agents for connected robotics and gaming infrastructure.',
    requirements: ['C++20, Rust, Python, PyTorch', 'Deep knowledge of kernel isolation and hardware enclave security (TrustZone / SGX)', 'Bilingual Japanese & English capability'],
    languageRequirement: '日本語 (Business Fluent) & English (Fluent)',
    applyUrl: 'https://ai.sony/careers/',
    source: 'Sony Careers Portal',
    tags: ['Tokyo', 'Robotics', 'AI Defense', 'C++']
  },

  // ================= UNITED ARAB EMIRATES =================
  {
    id: 'ae_1',
    countryCode: 'AE',
    countryName: 'United Arab Emirates',
    title: 'Chief Information Security Architect',
    company: 'Dubai Future Foundation / Cyber Enclave',
    companyLogo: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=100&auto=format&fit=crop&q=80',
    location: 'Dubai (DIFC / Emirates Towers)',
    hub: 'Dubai (DIFC / Internet City)',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 22,
    salaryRange: 'AED 45,000 - AED 65,000 / month (Tax-Free)',
    easyApply: true,
    description: 'Design next-generation autonomous cyber defense grids for smart city infrastructure and AI-driven government digital services.',
    requirements: ['12+ years in enterprise security architecture', 'Knowledge of UAE NESA / ISR compliance frameworks', 'Zero Trust and sovereign cloud deployments'],
    languageRequirement: 'English (Fluent) · Arabic a strong asset',
    applyUrl: 'https://www.dubaifuture.ae/careers',
    source: 'Dubai Government Careers',
    tags: ['Dubai', 'TaxFree', 'ZeroTrust', 'SmartCity']
  },

  // ================= INDIA =================
  {
    id: 'in_1',
    countryCode: 'IN',
    countryName: 'India',
    title: 'Staff Security & Cloud Platform Architect',
    company: 'Infosys Enterprise Cloud Cyber',
    companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80',
    location: 'Bengaluru (Electronic City) / Hyderabad',
    hub: 'Bengaluru (Silicon Valley of India)',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '2 days ago',
    applicantsCount: 67,
    salaryRange: '₹ 45,00,000 - ₹ 70,00,000 / yr',
    easyApply: true,
    description: 'Architect multi-cloud security transformations, automated vulnerability management engines, and DevSecOps pipelines for Fortune 500 enterprises.',
    requirements: ['10+ years in AWS/Azure/GCP cloud security', 'Hands-on experience in Terraform, Kubernetes, and HashiCorp Vault', 'Certifications: CISSP, AWS Solutions Architect Pro'],
    languageRequirement: 'English (Fluent) & Hindi',
    applyUrl: 'https://www.infosys.com/careers',
    source: 'Infosys Talent Gateway',
    tags: ['Bengaluru', 'CloudSecurity', 'Kubernetes', 'DevSecOps']
  },

  // ================= AUSTRALIA =================
  {
    id: 'au_1',
    countryCode: 'AU',
    countryName: 'Australia',
    title: 'Senior Cloud Security Engineer (Essential Eight Compliance)',
    company: 'Atlassian Cyber Labs',
    companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&auto=format&fit=crop&q=80',
    location: 'Sydney, NSW (Hybrid) / Australia Remote',
    hub: 'Sydney, NSW',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 31,
    salaryRange: 'A$ 180,000 - A$ 235,000 / yr + Super',
    easyApply: true,
    description: 'Implement automated ASD Essential Eight controls, identity access management guardrails, and microVM containment across global SaaS products.',
    requirements: ['5+ years cloud security engineering experience', 'Deep knowledge of AWS IAM and Australian ASD Essential Eight framework', 'Python / Go automation scripting'],
    languageRequirement: 'English (Fluent)',
    applyUrl: 'https://www.atlassian.com/company/careers',
    source: 'Greenhouse ATS',
    tags: ['Sydney', 'EssentialEight', 'AWS', 'Atlassian']
  }
]

export const initialUserApplications: JobApplicationItem[] = [
  {
    id: 'app_1',
    jobTitle: 'Principal Cyber Threat Hunter (TS/SCI Eligible)',
    company: 'Palantir Technologies',
    companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80',
    location: 'Washington, DC / Northern VA',
    salary: '$210,000 - $285,000 / yr',
    stage: 'interview',
    appliedDate: 'Applied 3 days ago',
    nextStep: 'Final Architecture Defense Panel (Thu, 2:00 PM EST)',
    recruiterName: 'Sarah Jenkins (GovTech Talent Lead)',
    productVerifiedMatch: 'Expedite Strike & Fusion 2026 Certified',
    interviewDate: 'Sept 4, 2026 at 2:00 PM EST'
  },
  {
    id: 'app_2',
    jobTitle: 'Lead Cloud Security Architect',
    company: 'Expedite Consults',
    companyLogo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY (Hybrid)',
    salary: '$195,000 - $240,000 / yr',
    stage: 'offer',
    appliedDate: 'Applied 1 week ago',
    nextStep: 'Offer Letter Pending Review',
    recruiterName: 'Elena Rostova (Hiring Partner)',
    productVerifiedMatch: 'Zero Trust & eBPF Telemetry Verified',
    offerDetails: '$225,000 Base + $45,000 Annual Bonus + 0.35% Equity'
  },
  {
    id: 'app_3',
    jobTitle: 'Staff AI Safety & Red Teaming Engineer',
    company: 'Anthropic',
    companyLogo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA (Remote)',
    salary: '$240,000 - $310,000 / yr',
    stage: 'applied',
    appliedDate: 'Applied 2 days ago',
    nextStep: 'Technical Resume Screening in Progress',
    recruiterName: 'Anthropic Talent Ops',
    productVerifiedMatch: 'Multi-Agent Sandbox Security'
  },
  {
    id: 'app_4',
    jobTitle: 'Senior DevSecOps & eBPF Security Engineer',
    company: 'Booz Allen Cyber',
    companyLogo: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&auto=format&fit=crop&q=80',
    location: 'McLean, VA / DC Corridor',
    salary: '$185,000 - $235,000 / yr',
    stage: 'applied',
    appliedDate: 'Applied 4 days ago',
    nextStep: 'Under Hiring Manager Review',
    recruiterName: 'David Vance',
    productVerifiedMatch: 'RMF Level III & NIST 800-53'
  },
  {
    id: 'app_5',
    jobTitle: 'Senior Cloud Threat Detection Engineer',
    company: 'CrowdStrike',
    companyLogo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=80',
    location: 'Austin, TX (Remote)',
    salary: '$190,000 - $245,000 / yr',
    stage: 'rejected',
    appliedDate: 'Applied 2 weeks ago',
    nextStep: 'Position Filled Internally',
    recruiterName: 'CrowdStrike Talent Team'
  }
]

export const initialCandidatesData: CandidateProfile[] = [
  {
    id: 'cand_1',
    name: 'Kavita Patel',
    headline: 'Director of Cloud Governance & Zero Trust Architect | Ex-AWS',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    location: 'New York, NY (Hybrid / Remote)',
    clearance: 'Secret Eligible',
    experienceYears: 11,
    capabilities: ['Cloud Security', 'Zero Trust', 'DevSecOps', 'RMF'],
    verifiedProducts: ['Expedite Strike 2026 Verified ✓', 'Checkmarx MCP ✓', 'AWS Security Hub Pro ✓'],
    certifications: ['CISSP', 'CCSP', 'AWS Security Specialty'],
    matchScore: 98,
    currentStatus: 'Open to Offers'
  },
  {
    id: 'cand_2',
    name: 'David Sterling',
    headline: 'Principal AI Security & Autonomous Red Team Lead | OSCP / OSCE',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA / Remote',
    clearance: 'None (Commercial Focus)',
    experienceYears: 8,
    capabilities: ['AI Security', 'Penetration Testing', 'Cloud Security'],
    verifiedProducts: ['ÆGIS SOC Pentest Verified ✓', 'Llama Guardrail Suite ✓'],
    certifications: ['OSCP', 'OSCE', 'PyTorch Security Certified'],
    matchScore: 94,
    currentStatus: 'Interviewing'
  },
  {
    id: 'cand_3',
    name: 'Alexander Novak',
    headline: 'Head of Infrastructure Security & FedRAMP RMF Lead',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    location: 'Washington, DC / Northern VA',
    clearance: 'Active Top Secret / SCI',
    experienceYears: 14,
    capabilities: ['RMF', 'Zero Trust', 'Cloud Security', 'GovTech'],
    verifiedProducts: ['FedRAMP 3PAO Automated Suite ✓', 'NIST 800-53 Engine ✓'],
    certifications: ['CISSP-ISSAP', 'RMF Level III Lead', 'CISM'],
    matchScore: 97,
    currentStatus: 'Ready to Start'
  },
  {
    id: 'cand_4',
    name: 'Grace Hopper-Bellingham',
    headline: 'Staff DevSecOps & eBPF Telemetry Engineer',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    location: 'Boston, MA / US Remote',
    clearance: 'Confidential',
    experienceYears: 7,
    capabilities: ['DevSecOps', 'Cloud Security', 'Next.js / Kubernetes'],
    verifiedProducts: ['KernelGuard eBPF Engine ✓', 'Next.js 16 Turbopack Pro ✓'],
    certifications: ['CKS (Certified Kubernetes Security)', 'AWS DevOps Pro'],
    matchScore: 91,
    currentStatus: 'Open to Offers'
  }
]

export function getEnclaveGlobalJobs(enclaveId?: string): GlobalJobItem[] {
  const enclave = enclaveId || 'tech_cybersecurity'
  return GLOBAL_JOBS_CATALOG.filter(j => {
    if (enclave === 'trades_construction') {
      return j.professionEnclave === 'trades_construction' ||
             j.tags.some(t => ['Carpentry', 'Construction', 'Framing', 'Timber', 'Joinery'].includes(t)) ||
             j.title.toLowerCase().includes('carpenter') || j.title.toLowerCase().includes('framing')
    }
    if (enclave === 'healthcare_medicine') {
      return j.professionEnclave === 'healthcare_medicine' ||
             j.tags.some(t => ['Surgery', 'Nursing', 'Trauma', 'Clinical', 'Medicine', 'Hospital'].includes(t)) ||
             j.title.toLowerCase().includes('surgeon') || j.title.toLowerCase().includes('nurse') || j.title.toLowerCase().includes('doctor')
    }
    if (enclave === 'automotive_mechanics') {
      return j.professionEnclave === 'automotive_mechanics' ||
             j.tags.some(t => ['Automotive', 'Diagnostic', 'EV', 'Powertrain', 'Mechanic'].includes(t)) ||
             j.title.toLowerCase().includes('diagnostic') || j.title.toLowerCase().includes('technician') || j.title.toLowerCase().includes('mechanic')
    }
    return j.professionEnclave === enclave ||
           (!j.professionEnclave && !['trades_construction', 'healthcare_medicine', 'automotive_mechanics'].includes(enclave))
  })
}
