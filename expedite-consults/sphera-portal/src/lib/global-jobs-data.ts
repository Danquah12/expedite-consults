import { ALL_PROFESSIONS, ProfessionDefinition } from "@/lib/connectin-professions"

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
  professionId?: string
  domainCategory?: string
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
  isLiveFeed?: boolean
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
  professionEnclave?: string
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
  },
  {
    code: 'KE',
    name: 'Kenya',
    flag: '🇰🇪',
    languages: ['English', 'Kiswahili'],
    primaryLanguage: 'English / Kiswahili',
    currency: 'KES',
    currencySymbol: 'KSh ',
    hubs: ['All Hubs', 'Nairobi (Silicon Savannah)', 'Mombasa (Port & Maritime)', 'Kisumu', 'Nakuru (AgriTech)', 'Remote Kenya']
  },
  {
    code: 'MX',
    name: 'Mexico (México)',
    flag: '🇲🇽',
    languages: ['Español (Spanish)', 'English'],
    primaryLanguage: 'Español',
    currency: 'MXN',
    currencySymbol: 'MX$',
    hubs: ['All Hubs', 'Mexico City (CDMX)', 'Monterrey (Industrial & Nearshoring Hub)', 'Guadalajara (Jalisco Tech)', 'Querétaro (Aerospace Hub)', 'Remote Mexico']
  },
  {
    code: 'ES',
    name: 'Spain (España)',
    flag: '🇪🇸',
    languages: ['Español (Spanish)', 'Català', 'English'],
    primaryLanguage: 'Español',
    currency: 'EUR',
    currencySymbol: '€',
    hubs: ['All Hubs', 'Madrid', 'Barcelona (22@ District)', 'Bilbao (Industrial & Energy)', 'Valencia', 'Remote Spain']
  },
  {
    code: 'IT',
    name: 'Italy (Italia)',
    flag: '🇮🇹',
    languages: ['Italiano (Italian)', 'English'],
    primaryLanguage: 'Italiano',
    currency: 'EUR',
    currencySymbol: '€',
    hubs: ['All Hubs', 'Milan (Milano Mind & Fashion)', 'Rome (Roma)', 'Turin (Torino Aerospace & Auto)', 'Bologna (Packaging Valley)', 'Remote Italy']
  },
  {
    code: 'SE',
    name: 'Sweden (Sverige)',
    flag: '🇸🇪',
    languages: ['Svenska (Swedish)', 'English'],
    primaryLanguage: 'Svenska / English',
    currency: 'SEK',
    currencySymbol: 'kr ',
    hubs: ['All Hubs', 'Stockholm (Kista)', 'Gothenburg (Mobility & Maritime)', 'Malmö / Lund', 'Kiruna (Mining & Space)', 'Remote Sweden']
  },
  {
    code: 'CH',
    name: 'Switzerland (Schweiz / Suisse)',
    flag: '🇨🇭',
    languages: ['Deutsch', 'Français', 'Italiano', 'English'],
    primaryLanguage: 'Deutsch / Français',
    currency: 'CHF',
    currencySymbol: 'CHF ',
    hubs: ['All Hubs', 'Zurich (Zürich)', 'Geneva (Genève Horology & Finance)', 'Basel (Biotech & Pharma)', 'Lausanne (EPFL)', 'Remote Switzerland']
  },
  {
    code: 'IE',
    name: 'Ireland (Éire)',
    flag: '🇮🇪',
    languages: ['English', 'Gaeilge (Irish)'],
    primaryLanguage: 'English',
    currency: 'EUR',
    currencySymbol: '€',
    hubs: ['All Hubs', 'Dublin (Silicon Docks)', 'Cork (Biopharma & MedTech)', 'Galway', 'Limerick', 'Remote Ireland']
  },
  {
    code: 'PL',
    name: 'Poland (Polska)',
    flag: '🇵🇱',
    languages: ['Polski (Polish)', 'English'],
    primaryLanguage: 'Polski / English',
    currency: 'PLN',
    currencySymbol: 'zł ',
    hubs: ['All Hubs', 'Warsaw (Warszawa)', 'Kraków', 'Wrocław (Industrial & CNC)', 'Gdańsk (Shipbuilding & Port)', 'Remote Poland']
  },
  {
    code: 'KR',
    name: 'South Korea (대한민국)',
    flag: '🇰🇷',
    languages: ['한국어 (Korean)', 'English'],
    primaryLanguage: '한국어',
    currency: 'KRW',
    currencySymbol: '₩',
    hubs: ['All Hubs', 'Seoul (Gangnam / Pangyo)', 'Ulsan (Heavy Shipbuilding & Auto)', 'Incheon (Songdo Bio)', 'Busan (Port Logistics)', 'Remote Korea']
  },
  {
    code: 'SA',
    name: 'Saudi Arabia (السعودية)',
    flag: '🇸🇦',
    languages: ['العربية (Arabic)', 'English'],
    primaryLanguage: 'العربية / English',
    currency: 'SAR',
    currencySymbol: 'SAR ',
    hubs: ['All Hubs', 'Riyadh (KAFD)', 'NEOM / Oxagon (Clean Energy & Construction)', 'Jeddah (Red Sea Port)', 'Dhahran (Energy & Engineering)', 'Remote KSA']
  },
  {
    code: 'EG',
    name: 'Egypt (مصر)',
    flag: '🇪🇬',
    languages: ['العربية (Arabic)', 'English'],
    primaryLanguage: 'العربية / English',
    currency: 'EGP',
    currencySymbol: 'E£ ',
    hubs: ['All Hubs', 'Cairo (New Administrative Capital / Smart Village)', 'Alexandria (Mediterranean Port)', 'Suez Canal Maritime Zone', 'Luxor / Aswan (Heritage & Tourism)', 'Remote Egypt']
  }
]

export const GLOBAL_JOBS_CATALOG: GlobalJobItem[] = [
  // =========================================================================
  // 1. SKILLED TRADES & CONSTRUCTION (trades_construction)
  // =========================================================================
  {
    id: 'trade_1',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'trades_construction',
    domainCategory: 'Recommended',
    title: 'Master Heavy Timber Carpenter & Bents Lead',
    company: 'Turner Construction — Mass Timber Division',
    companyLogo: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&auto=format&fit=crop&q=80',
    location: 'Austin, TX (On-site)',
    hub: 'Austin, TX',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '2 hours ago',
    applicantsCount: 6,
    salaryRange: '$95,000 - $132,000 / yr',
    easyApply: true,
    requiredProductExperience: ['OSHA 30 Safety Certification', 'Procore BIM & Structural Timber Blueprints'],
    description: 'Lead fabrication and site erection of 40-foot clear-span Cross-Laminated Timber (CLT) and Douglas Fir heavy timber bents. Master mortise-and-tenon joinery, CNC Hundegger timber assembly, and crane rigging coordination.',
    requirements: ['8+ years heavy timber framing & structural carpentry experience', 'Proficiency with Festool Domino XL DF 700, Mafell beam saws & laser transits', 'OSHA 30 Job-Site Safety certification', 'Ability to interpret PE-stamped structural load diagrams'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.turnerconstruction.com/careers',
    source: 'Turner Construction Careers',
    tags: ['Timber Framing', 'Carpentry', 'Joinery', 'OSHA 30', 'Recommended']
  },
  {
    id: 'trade_2',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'trades_construction',
    domainCategory: 'Recommended',
    title: 'Architectural Finish Carpenter & Custom Millwork Foreman',
    company: 'DPR Construction — Self-Perform Craft',
    companyLogo: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=100&auto=format&fit=crop&q=80',
    location: 'Seattle, WA (On-site)',
    hub: 'Seattle, WA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '4 hours ago',
    applicantsCount: 11,
    salaryRange: '$92,000 - $124,000 / yr',
    easyApply: true,
    requiredProductExperience: ['AWI Architectural Woodwork Standards', 'Festool Dust-Free Precision Systems'],
    description: 'Deliver precision interior architectural finish carpentry, custom walnut acoustic wall paneling, monumental curved staircases, and compound coffered ceilings for commercial headquarters and hospital pavilions.',
    requirements: ['6+ years finish carpentry / custom architectural millwork', 'Precision compound miter, scribe-fitting, and coped joinery skills', 'Mastery of track saws, shaper cutters, and CAD shop drawings', 'Valid Journeyman Carpenter credential'],
    languageRequirement: 'English',
    applyUrl: 'https://www.dpr.com/company/careers',
    source: 'DPR Craft Careers',
    tags: ['Finish Carpentry', 'Carpentry', 'Millwork', 'Joinery', 'Recommended']
  },
  {
    id: 'trade_3',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'trades_construction',
    domainCategory: 'Full-time',
    title: 'Senior Commercial Superintendent (Structural & MEP Coordination)',
    company: 'Skanska USA Building',
    companyLogo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    location: 'Boston, MA (On-site)',
    hub: 'Boston, MA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '6 hours ago',
    applicantsCount: 14,
    salaryRange: '$130,000 - $168,000 / yr',
    easyApply: true,
    requiredProductExperience: ['Procore Construction Financials', 'OSHA 30 & Crane Lift Planning'],
    description: 'Oversee structural framing, concrete formwork, MEP rough-in, and trade subcontractor sequencing on a $65M life-sciences and commercial campus. Direct responsibility for OSHA 30 safety compliance, city inspections, and Critical Path Method (CPM) schedules.',
    requirements: ['10+ years commercial construction superintendent experience', 'OSHA 30 Certified + First Aid/CPR', 'Procore, Bluebeam Revu, and Primavera P6 proficiency', 'Proven record managing 15+ trade subcontractors on site'],
    languageRequirement: 'English',
    applyUrl: 'https://www.skanska.com/who-we-are/career/',
    source: 'Skanska Careers',
    tags: ['General Contracting', 'Framing', 'Construction', 'Prevailing Wage', 'Full-time']
  },
  {
    id: 'trade_4',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'trades_construction',
    domainCategory: 'Recommended',
    title: 'Master Industrial Electrician & 480V Switchgear Lead (NEC / PLC)',
    company: 'EMCOR Group Electrical Services',
    companyLogo: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=100&auto=format&fit=crop&q=80',
    location: 'Washington, DC / MD / VA (On-site)',
    hub: 'Washington, DC / MD / VA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '5 hours ago',
    applicantsCount: 9,
    salaryRange: '$105,000 - $145,000 / yr',
    easyApply: true,
    requiredProductExperience: ['NFPA 70E Arc-Flash Certification', 'Allen-Bradley Studio 5000 PLC & Fluke Thermal'],
    description: 'Install, commission, and troubleshoot 480V 3-phase industrial switchgear, backup diesel generator automatic transfer switches (ATS), and Allen-Bradley PLC motor control centers for mission-critical facilities.',
    requirements: ['Active Master or Journeyman Electrician License', 'Deep expertise in 2026 NEC Code, conduit bending, and transformer sizing', 'NFPA 70E Arc-Flash safety & Fluke power quality analyzer mastery'],
    languageRequirement: 'English',
    applyUrl: 'https://www.emcorgroup.com/careers',
    source: 'EMCOR Direct ATS',
    tags: ['Electrical & MEP', 'Electrician', 'NEC', 'PLC', 'Recommended']
  },
  {
    id: 'trade_5',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'trades_construction',
    domainCategory: 'Full-time',
    title: 'Commercial Master Plumber & Medical Gas Brazing Specialist',
    company: 'Comfort Systems USA',
    companyLogo: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY (On-site)',
    hub: 'New York, NY',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 8,
    salaryRange: '$102,000 - $138,000 / yr',
    easyApply: true,
    requiredProductExperience: ['ASSE 6010 Medical Gas Installer', 'IPC / UPC Commercial Isometric Blueprints'],
    description: 'Lead commercial cast-iron DWV sanitary systems, high-pressure domestic copper headers, hydronic boiler loops, and NFPA 99 medical gas piping installations across hospital and high-rise projects.',
    requirements: ['Licensed Master or Journeyman Plumber', 'ASSE 6010 Medical Gas & Backflow Prevention Assembly Tester certified', 'Expertise with Viega MegaPress/ProPress and silver-alloy brazing'],
    languageRequirement: 'English',
    applyUrl: 'https://comfortsystemsusa.com/careers/',
    source: 'Comfort Systems Careers',
    tags: ['Electrical & MEP', 'Plumbing', 'Pipefitting', 'HVAC', 'Full-time']
  },
  {
    id: 'trade_6',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'trades_construction',
    domainCategory: 'Contract',
    title: 'AWS 6G Certified Structural & High-Pressure Pipe Welder (TIG/SMAW)',
    company: 'Bechtel Infrastructure & Energy',
    companyLogo: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=100&auto=format&fit=crop&q=80',
    location: 'Austin, TX / Gulf Coast (On-site)',
    hub: 'Austin, TX',
    workplaceType: 'On-site',
    employmentType: 'Contract',
    postedTime: '1 day ago',
    applicantsCount: 15,
    salaryRange: '$58 - $78 / hr + $140/day Per Diem ($145,000+ eq.)',
    easyApply: true,
    requiredProductExperience: ['AWS D1.1 & ASME Section IX 6G X-Ray Certification', 'Lincoln Electric / Miller TIG Systems'],
    description: 'Perform X-ray quality GTAW (TIG) root and SMAW (Stick) fill/cap welds on carbon and stainless schedule 80 process piping and heavy structural steel moment frames.',
    requirements: ['Must pass 6G Monster Coupon X-ray and bend test', '5+ years structural and pressure vessel welding', 'TWIC card and OSHA 10/30 certification'],
    languageRequirement: 'English',
    applyUrl: 'https://www.bechtel.com/careers/',
    source: 'Bechtel Craft Portal',
    tags: ['Welding & Steel', 'Contract', 'AWS 6G', 'Construction']
  },
  {
    id: 'trade_7',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'trades_construction',
    domainCategory: 'Full-time',
    title: 'Senior Commercial HVAC Chiller & VRF Controls Technician',
    company: 'Trane Technologies Commercial Service',
    companyLogo: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=100&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA (On-site)',
    hub: 'San Francisco, CA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '2 days ago',
    applicantsCount: 12,
    salaryRange: '$98,000 - $135,000 / yr',
    easyApply: true,
    requiredProductExperience: ['EPA Section 608 Universal Certification', 'BACnet BAS & Centrifugal Chiller Diagnostics'],
    description: 'Commission, overhaul, and troubleshoot 500-ton centrifugal chillers, Mitsubishi/Daikin VRF heat recovery systems, and BACnet Building Automation Systems (BAS).',
    requirements: ['EPA 608 Universal Certification & NATE Commercial HVAC', '5+ years commercial chiller, cooling tower, and VRF troubleshooting', 'Valid driver license and clean safety record'],
    languageRequirement: 'English',
    applyUrl: 'https://careers.tranetechnologies.com/',
    source: 'Trane Technologies ATS',
    tags: ['Electrical & MEP', 'HVAC', 'Chillers', 'Full-time']
  },

  // =========================================================================
  // 2. AUTOMOTIVE, DIESEL & FLEET MECHANICS (automotive_mechanics)
  // =========================================================================
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
    salaryRange: '$115,000 - $160,000 / yr ($58 - $75 / flag hr)',
    easyApply: true,
    requiredProductExperience: ['ASE Master A1–A8 + L1 Certification', 'Snap-on ZEUS+ & 4-Channel PicoScope'],
    description: 'Lead dealership diagnostic bay and mentor apprentice technicians. Perform complex driveability diagnostics, CAN-FD oscilloscope waveform analysis, transmission teardowns, and hybrid powertrain service.',
    requirements: ['ASE Certified Master Automobile Technician (A1–A8) & L1', '8+ years dealership or premier independent diagnostic experience', 'Expertise with OEM J2534 pass-thru programming and PicoScope'],
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
    title: '800V High-Voltage EV Powertrain & Battery Diagnostic Specialist',
    company: 'Rivian Advanced Service Operations',
    companyLogo: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA (On-site)',
    hub: 'San Francisco, CA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '4 hours ago',
    applicantsCount: 12,
    salaryRange: '$125,000 - $165,000 / yr + Equity',
    easyApply: true,
    requiredProductExperience: ['ASE L3 Hybrid/EV Specialist', 'NFPA 70E High-Voltage Live-Pack Safety'],
    description: 'Diagnose and repair quad-motor 800V electric drivetrains, silicon-carbide inverters, thermal management heat pumps, and high-voltage DC contactors. Perform live battery pack module replacements.',
    requirements: ['NFPA 70E High Voltage Electrical Safety certified', 'ASE L3 Light Duty Hybrid/EV Specialist preferred', 'High proficiency with Fluke 1587 1000V insulation testers & CAN-bus decoders'],
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
    title: 'Heavy Duty Class 8 Diesel Master Technician (Cummins & Detroit)',
    company: 'Ryder System Fleet Maintenance',
    companyLogo: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=100&auto=format&fit=crop&q=80',
    location: 'Austin, TX (On-site)',
    hub: 'Austin, TX',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 10,
    salaryRange: '$95,000 - $132,000 / yr',
    easyApply: true,
    requiredProductExperience: ['ASE Master Medium/Heavy Truck T1–T8', 'Cummins INSITE & Detroit DiagnosticLink'],
    description: 'Maintain and diagnose Class 8 commercial tractor-trailers powered by Cummins X15 and Detroit DD15 engines. Deep expertise in Tier 4 Final SCR aftertreatment, DEF dosers, DPF regeneration, and Bendix/Wabco air brakes.',
    requirements: ['ASE Master Medium/Heavy Truck (T1–T8) or 5+ years heavy diesel experience', 'Cummins INSITE, Noregon JPRO, and Eaton Fuller transmission proficiency', 'CDL Class A or B preferred'],
    languageRequirement: 'English',
    applyUrl: 'https://ryder.com/careers',
    source: 'Ryder Fleet Careers',
    tags: ['Heavy Diesel', 'Automotive', 'Fleet', 'Full-time']
  },
  {
    id: 'auto_4',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'automotive_mechanics',
    domainCategory: 'Contract',
    title: 'Master European Diagnostic & ADAS Calibration Specialist',
    company: 'AutoNation Luxury & Performance Group',
    companyLogo: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=100&auto=format&fit=crop&q=80',
    location: 'Seattle, WA (On-site)',
    hub: 'Seattle, WA',
    workplaceType: 'On-site',
    employmentType: 'Contract',
    postedTime: '2 days ago',
    applicantsCount: 8,
    salaryRange: '$65 - $85 / flat hr ($135,000 - $175,000 eq.)',
    easyApply: true,
    requiredProductExperience: ['Autel MaxiSys IA900 ADAS Calibration', 'ODIS / ISTA / XENTRY OEM Diagnostics'],
    description: 'Dedicated diagnostic and ADAS calibration specialist resolving complex CAN-FD/FlexRay network dropouts and performing static/dynamic millimeter-wave radar and LiDAR windshield calibrations.',
    requirements: ['ASE Master Tech or European OEM Master Certified (BMW/Audi/Mercedes)', 'Mastery of 4-channel PicoScope and static/dynamic ADAS optical targets'],
    languageRequirement: 'English',
    applyUrl: 'https://jobs.autonation.com/',
    source: 'AutoNation Careers',
    tags: ['Master Diagnostics', 'Automotive', 'Contract', 'Flat-rate']
  },

  // =========================================================================
  // 3. AGRICULTURE, FORESTRY & NATURAL RESOURCES (agriculture_natural_resources)
  // =========================================================================
  {
    id: 'agri_1',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'agriculture_natural_resources',
    domainCategory: 'Recommended',
    title: 'Senior Precision Agronomist & Variable-Rate Crop Soil Scientist',
    company: 'Corteva Agriscience',
    companyLogo: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=100&auto=format&fit=crop&q=80',
    location: 'Austin, TX / Midwest Regional (Hybrid)',
    hub: 'Austin, TX',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '3 hours ago',
    applicantsCount: 9,
    salaryRange: '$96,000 - $132,000 / yr',
    easyApply: true,
    requiredProductExperience: ['Certified Crop Adviser (CCA)', 'John Deere Operations Center & GIS Prescription Mapping'],
    description: 'Direct multi-thousand-acre soil fertility trials, variable-rate nitrogen/seed prescription mapping, NDVI multispectral drone scouting, and Integrated Pest Management (IPM) programs.',
    requirements: ['B.S. or M.S. in Agronomy, Soil Science, or Plant Pathology', 'Active Certified Crop Adviser (CCA) credential', 'Proficiency with AgLeader SMS, Climate FieldView, and RTK GPS'],
    languageRequirement: 'English',
    applyUrl: 'https://careers.corteva.com/',
    source: 'Corteva Agriscience Careers',
    tags: ['Agronomy & Crops', 'Precision Ag', 'Soil Science', 'Recommended']
  },
  {
    id: 'agri_2',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'agriculture_natural_resources',
    domainCategory: 'Recommended',
    title: 'Autonomous Ag Equipment & RTK Guidance Field Engineer',
    company: 'John Deere Intelligent Solutions Group',
    companyLogo: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=100&auto=format&fit=crop&q=80',
    location: 'US Remote / Field Operations',
    hub: 'US Remote',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 15,
    salaryRange: '$105,000 - $142,000 / yr',
    easyApply: true,
    requiredProductExperience: ['StarFire RTK GPS & AutoTrac', 'ISOBUS CAN Telemetry & See & Spray™'],
    description: 'Deploy and support autonomous 8R/9R tractor fleets, StarFire RTK sub-inch guidance receivers, See & Spray™ computer-vision herbicide booms, and combine yield calibration telemetry.',
    requirements: ['4+ years in Precision Ag technology, Ag Engineering, or heavy equipment telemetry', 'Deep knowledge of ISOBUS 11783, CAN-bus, and electro-hydraulic valve control', 'FAA Part 107 Drone Pilot license a plus'],
    languageRequirement: 'English',
    applyUrl: 'https://careers.deere.com/',
    source: 'John Deere Careers',
    tags: ['Precision Ag', 'Autonomous Equipment', 'RTK GPS', 'Recommended']
  },
  {
    id: 'agri_3',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'agriculture_natural_resources',
    domainCategory: 'Full-time',
    title: 'Director of Cattle Ranch Operations & Rotational Grazing',
    company: 'Cargill Protein & Sustainable Rangelands',
    companyLogo: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=100&auto=format&fit=crop&q=80',
    location: 'Austin, TX / Great Plains (On-site)',
    hub: 'Austin, TX',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '2 days ago',
    applicantsCount: 7,
    salaryRange: '$92,000 - $125,000 / yr + Ranch Housing & Truck',
    easyApply: true,
    requiredProductExperience: ['BQA Beef Quality Assurance', 'RFID Herd Genetics & Pasture Hydrology'],
    description: 'Manage a 3,500-head cow-calf and stocker operation across 28,000 acres. Oversee rotational paddock grazing, EPD bull genetics, calving health protocols, and solar well water infrastructure.',
    requirements: ['7+ years commercial beef cattle or dairy herd management', 'Beef Quality Assurance (BQA) & bovine AI reproduction experience', 'Commodity hedging and hay/forage harvesting management'],
    languageRequirement: 'English / Spanish helpful',
    applyUrl: 'https://careers.cargill.com/',
    source: 'Cargill Careers',
    tags: ['Ranch & Livestock', 'Cattle Management', 'Full-time']
  },
  {
    id: 'agri_4',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'agriculture_natural_resources',
    domainCategory: 'Full-time',
    title: 'Senior Silviculture Forester & Timber Cruising Manager',
    company: 'Weyerhaeuser Timberlands',
    companyLogo: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=100&auto=format&fit=crop&q=80',
    location: 'Seattle, WA (Hybrid / Pacific NW)',
    hub: 'Seattle, WA',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '3 days ago',
    applicantsCount: 11,
    salaryRange: '$88,000 - $118,000 / yr',
    easyApply: true,
    requiredProductExperience: ['SAF Certified Forester (CF)', 'ArcGIS Pro & LiDAR Forest Inventory'],
    description: 'Direct sustainable Douglas Fir and Western Hemlock timberland harvest planning, LiDAR stand volume cruising, reforestation silviculture, and FSC/SFI environmental compliance.',
    requirements: ['B.S. in Forestry or Natural Resource Management', 'Society of American Foresters (SAF) Certified Forester preferred', 'ArcGIS Pro spatial analysis and Washington Forest Practices Act familiarity'],
    languageRequirement: 'English',
    applyUrl: 'https://www.weyerhaeuser.com/company/careers/',
    source: 'Weyerhaeuser Careers',
    tags: ['Forestry & Conservation', 'Timber Cruising', 'GIS', 'Full-time']
  },

  // =========================================================================
  // 4. PERSONAL SERVICES, FITNESS & WELLNESS (personal_services_wellness)
  // =========================================================================
  {
    id: 'well_1',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'personal_services_wellness',
    domainCategory: 'Recommended',
    title: 'Master Stylist, Colorist & Luxury Salon Studio Director',
    company: 'Ulta Beauty Pro Design & Flagship Salons',
    companyLogo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY (On-site)',
    hub: 'New York, NY',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '3 hours ago',
    applicantsCount: 14,
    salaryRange: '$85,000 - $135,000 / yr (Base + High-Tier Commission + Bonuses)',
    easyApply: true,
    requiredProductExperience: ['State Board Master Cosmetologist / Barber License', 'Balayage Color Formulation & Salon CRM'],
    description: 'Lead a flagship 14-chair luxury salon team. Specialize in dimensional balayage, corrective color chemistry, precision razor/shear cuts, and high-retention VIP client books.',
    requirements: ['Active State Board Master Cosmetologist or Master Barber License', '5+ years high-volume luxury salon or barbershop leadership', 'Expertise in Redken/Olaplex bond chemistry and Boulevard/Mindbody booking systems'],
    languageRequirement: 'English',
    applyUrl: 'https://careers.ultabeauty.com/',
    source: 'Ulta Beauty Careers',
    tags: ['Salon & Barbering', 'Cosmetology', 'Master Stylist', 'Recommended']
  },
  {
    id: 'well_2',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'personal_services_wellness',
    domainCategory: 'Recommended',
    title: 'Tier X Master Performance Coach & Biomechanics Specialist (CSCS)',
    company: 'Equinox Sports Clubs',
    companyLogo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA / New York, NY (On-site)',
    hub: 'San Francisco, CA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '6 hours ago',
    applicantsCount: 19,
    salaryRange: '$95,000 - $145,000 / yr',
    easyApply: true,
    requiredProductExperience: ['NSCA CSCS or NASM-CPT Certification', 'VO2 Max & DEXA Metabolic Programming'],
    description: 'Deliver elite 1-on-1 athletic strength periodization, functional movement screening (FMS), metabolic VO2 max conditioning, and longevity nutrition coaching for executive and athlete clientele.',
    requirements: ['NSCA Certified Strength & Conditioning Specialist (CSCS) or NASM-CPT', 'B.S. in Kinesiology or Exercise Science preferred', 'CPR/AED certified and proven personal training client retention'],
    languageRequirement: 'English',
    applyUrl: 'https://careers.equinox.com/',
    source: 'Equinox Talent Portal',
    tags: ['Fitness & Performance', 'CSCS', 'Personal Training', 'Recommended']
  },
  {
    id: 'well_3',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'personal_services_wellness',
    domainCategory: 'Full-time',
    title: 'Clinic Director & Orthopedic Physical Therapist (DPT, OCS)',
    company: 'ATI Physical Therapy & Sports Medicine',
    companyLogo: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=100&auto=format&fit=crop&q=80',
    location: 'Boston, MA (On-site)',
    hub: 'Boston, MA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 8,
    salaryRange: '$108,000 - $136,000 / yr + Sign-On Bonus',
    easyApply: true,
    requiredProductExperience: ['Doctor of Physical Therapy (DPT) License', 'Orthopedic Manual Therapy & Return-to-Sport'],
    description: 'Direct outpatient sports medicine rehabilitation, post-ACL/rotator cuff surgical recovery, dry needling, and neuromuscular return-to-sport biodex testing.',
    requirements: ['Doctor of Physical Therapy (DPT) with active state licensure', 'ABPTS Orthopedic Clinical Specialist (OCS) or sports residency a plus', '3+ years outpatient orthopedic physical therapy experience'],
    languageRequirement: 'English',
    applyUrl: 'https://careers.atipt.com/',
    source: 'ATI Careers',
    tags: ['Physical Therapy & Rehab', 'DPT', 'Sports Medicine', 'Full-time']
  },

  // =========================================================================
  // 5. CULINARY, HOSPITALITY & EVENTS (culinary_hospitality_events)
  // =========================================================================
  {
    id: 'hosp_1',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'culinary_hospitality_events',
    domainCategory: 'Recommended',
    title: 'Executive Chef & Multi-Outlet Culinary Director',
    company: 'Four Seasons Hotels and Resorts',
    companyLogo: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY / Austin, TX (On-site)',
    hub: 'New York, NY',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '4 hours ago',
    applicantsCount: 13,
    salaryRange: '$135,000 - $185,000 / yr + Executive Bonus',
    easyApply: true,
    requiredProductExperience: ['ServSafe Manager & HACCP Compliance', 'Sub-28% Prime Food Cost & Brigade Leadership'],
    description: 'Direct culinary operations across our signature fine-dining restaurant, 600-seat luxury ballroom banquet kitchen, and in-room dining. Lead a 45-person culinary brigade, seasonal farm-to-table menu engineering, and kitchen P&L.',
    requirements: ['8+ years luxury hotel or Michelin/James Beard restaurant leadership', 'Proven track record maintaining sub-28% food cost and sub-24% labor cost', 'ServSafe Manager & HACCP Food Safety certification'],
    languageRequirement: 'English (Spanish/French culinary fluency a plus)',
    applyUrl: 'https://www.fourseasons.com/careers/',
    source: 'Four Seasons Careers',
    tags: ['Culinary & Kitchen', 'Executive Chef', 'Hospitality', 'Recommended']
  },
  {
    id: 'hosp_2',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'culinary_hospitality_events',
    domainCategory: 'Recommended',
    title: 'Director of Hotel Operations & Guest Experience (RevPAR / ADR)',
    company: 'Marriott International — Luxury Collection',
    companyLogo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&auto=format&fit=crop&q=80',
    location: 'Washington, DC / MD / VA (On-site)',
    hub: 'Washington, DC / MD / VA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 17,
    salaryRange: '$120,000 - $160,000 / yr',
    easyApply: true,
    requiredProductExperience: ['Opera Cloud PMS & STR Benchmarking', 'Forbes 5-Star Guest Service Operations'],
    description: 'Oversee rooms division, front office, housekeeping, F&B outlets, and VIP diplomatic protocol for a 450-key luxury hotel. Drive RevPAR index growth, ADR yield optimization, and guest satisfaction scores.',
    requirements: ['6+ years full-service luxury hotel operations management', 'Mastery of Oracle Opera PMS, STR reports, and union labor scheduling', 'B.S. in Hospitality Management or equivalent experience'],
    languageRequirement: 'English',
    applyUrl: 'https://careers.marriott.com/',
    source: 'Marriott Global Careers',
    tags: ['Hotel & Resort Ops', 'Hospitality', 'Operations', 'Recommended']
  },
  {
    id: 'hosp_3',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'culinary_hospitality_events',
    domainCategory: 'Full-time',
    title: 'Senior Director of Corporate Events, Catering & Convention Production',
    company: 'Hilton Worldwide — Meetings & Conventions',
    companyLogo: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=100&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA (On-site)',
    hub: 'San Francisco, CA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '2 days ago',
    applicantsCount: 21,
    salaryRange: '$110,000 - $148,000 / yr + Commission',
    easyApply: true,
    requiredProductExperience: ['Certified Meeting Professional (CMP)', 'Delphi.fdc & Banquet Event Order (BEO) Execution'],
    description: 'Lead end-to-end production for 2,000+ attendee tech summits, gala banquets, and executive conferences. Manage $18M+ annual catering revenue, AV staging vendors, and BEO floor execution.',
    requirements: ['5+ years convention services, catering sales, or large-scale event production', 'CMP (Certified Meeting Professional) or CPCE certification preferred', 'Proficiency with Amadeus Delphi.fdc and Social Tables CAD floorplans'],
    languageRequirement: 'English',
    applyUrl: 'https://jobs.hilton.com/',
    source: 'Hilton Careers',
    tags: ['Events & Banquets', 'Catering', 'CMP', 'Full-time']
  },

  // =========================================================================
  // 6. COMMERCE, REAL ESTATE & SMALL BUSINESS (commerce_small_business)
  // =========================================================================
  {
    id: 'comm_1',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'commerce_small_business',
    domainCategory: 'Recommended',
    title: 'Vice President — Commercial Real Estate Investment Sales & Leasing',
    company: 'CBRE Capital Markets',
    companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY / Austin, TX (Hybrid)',
    hub: 'New York, NY',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '3 hours ago',
    applicantsCount: 16,
    salaryRange: '$150,000 - $320,000 / yr (Base + Deal Commission)',
    easyApply: true,
    requiredProductExperience: ['Active Real Estate Broker License & CCIM', 'ARGUS Enterprise Cash Flow & Cap-Rate Underwriting'],
    description: 'Originate and execute Class-A industrial logistics, multifamily, and retail investment property dispositions ($15M–$150M) and institutional NNN tenant representation leases.',
    requirements: ['Active State Real Estate Broker or Salesperson License', '5+ years commercial real estate brokerage, acquisitions, or leasing', 'Proficiency in ARGUS Enterprise, CoStar, and 1031 exchange underwriting'],
    languageRequirement: 'English',
    applyUrl: 'https://careers.cbre.com/',
    source: 'CBRE Global Careers',
    tags: ['Commercial Real Estate', 'Brokerage', 'CCIM', 'Recommended']
  },
  {
    id: 'comm_2',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'commerce_small_business',
    domainCategory: 'Recommended',
    title: 'Regional Director of Multi-Unit Retail & Omnichannel Operations',
    company: 'Costco Wholesale Regional Operations',
    companyLogo: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=100&auto=format&fit=crop&q=80',
    location: 'Seattle, WA (Hybrid)',
    hub: 'Seattle, WA',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 24,
    salaryRange: '$145,000 - $195,000 / yr + Bonus',
    easyApply: true,
    requiredProductExperience: ['Multi-Unit P&L ($100M+ Volume)', 'SAP Retail ERP & Inventory Shrinkage Control'],
    description: 'Direct full P&L, merchandising velocity, inventory turnover, and 800+ retail associates across a 12-warehouse regional district. Drive same-store sales growth and omnichannel fulfillment efficiency.',
    requirements: ['8+ years multi-unit retail district or high-volume store general management', 'Demonstrated mastery of EBITDA margin expansion, SKU rationalization, and loss prevention', 'Experience with SAP Retail, Manhattan WMS, or NetSuite POS'],
    languageRequirement: 'English',
    applyUrl: 'https://www.costco.com/jobs.html',
    source: 'Costco Careers',
    tags: ['Retail & Franchise Ops', 'Multi-Unit P&L', 'Operations', 'Recommended']
  },
  {
    id: 'comm_3',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'commerce_small_business',
    domainCategory: 'Full-time',
    title: 'Director of Global Supply Chain, Freight Logistics & Distribution',
    company: 'JLL Supply Chain & Industrial Solutions',
    companyLogo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&auto=format&fit=crop&q=80',
    location: 'Boston, MA / US Remote (Hybrid)',
    hub: 'Boston, MA',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '2 days ago',
    applicantsCount: 19,
    salaryRange: '$130,000 - $172,000 / yr',
    easyApply: true,
    requiredProductExperience: ['APICS CSCP / Customs Brokerage', 'Manhattan WMS & 3PL Cold-Chain Routing'],
    description: 'Optimize ocean/air freight forwarding, port drayage, customs tariff classification, and 3PL distribution center slotting for North American retail and industrial shippers.',
    requirements: ['7+ years supply chain, freight brokerage, or 3PL warehouse leadership', 'APICS CSCP or Licensed U.S. Customs Broker credential preferred', 'Expertise in TMS/WMS platforms and Incoterms 2020'],
    languageRequirement: 'English',
    applyUrl: 'https://www.jll.com/en/careers',
    source: 'JLL Careers',
    tags: ['Supply Chain & Logistics', 'Freight', 'Operations', 'Full-time']
  },

  // =========================================================================
  // 7. CREATIVE MEDIA, ARTS & ENTERTAINMENT (creative_media_arts)
  // =========================================================================
  {
    id: 'crea_1',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'creative_media_arts',
    domainCategory: 'Recommended',
    title: 'Senior Supervising Producer & Post-Production Showrunner',
    company: 'Netflix Original Studio Productions',
    companyLogo: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=100&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA / Los Angeles (Hybrid)',
    hub: 'San Francisco, CA',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '5 hours ago',
    applicantsCount: 32,
    salaryRange: '$165,000 - $230,000 / yr',
    easyApply: true,
    requiredProductExperience: ['DaVinci Resolve HDR & Avid Media Composer', 'RED V-Raptor / ARRI Alexa 8K Cinema Workflows'],
    description: 'Supervise production and post-production pipelines for global documentary and unscripted series. Oversee directors of photography, Avid/Premiere offline edit bays, DaVinci Resolve Dolby Vision color grading, and multi-language localization.',
    requirements: ['7+ years broadcast, streaming studio, or commercial film production leadership', 'Deep technical mastery of 16-bit RAW cinema workflows, Frame.io, and Dolby Vision mastering', 'Proven budget management on $5M+ productions'],
    languageRequirement: 'English',
    applyUrl: 'https://jobs.netflix.com/',
    source: 'Netflix Studio Jobs',
    tags: ['Film & Video Production', 'Director', 'Post-Production', 'Recommended']
  },
  {
    id: 'crea_2',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'creative_media_arts',
    domainCategory: 'Recommended',
    title: 'Staff Brand & Design Systems Creative Director',
    company: 'Adobe Creative Cloud Studio',
    companyLogo: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY / US Remote',
    hub: 'New York, NY',
    workplaceType: 'Remote',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 41,
    salaryRange: '$155,000 - $210,000 / yr',
    easyApply: true,
    requiredProductExperience: ['Figma Enterprise Design Tokens', 'Adobe Creative Cloud & Cinema 4D 3D Motion'],
    description: 'Lead visual identity systems, multi-platform Figma component libraries, 3D motion typography, and WCAG AAA accessible brand experiences across web and flagship live events.',
    requirements: ['8+ years brand design, art direction, and design systems leadership', 'Expert portfolio demonstrating typography, Figma auto-layout tokens, and Cinema 4D/After Effects motion', 'Experience leading multidisciplinary creative teams'],
    languageRequirement: 'English',
    applyUrl: 'https://www.adobe.com/careers.html',
    source: 'Adobe Careers',
    tags: ['Brand & Visual Design', 'Creative Director', 'Figma', 'Recommended']
  },
  {
    id: 'crea_3',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'creative_media_arts',
    domainCategory: 'Full-time',
    title: 'Lead Audio Mastering Engineer & Spatial Dolby Atmos Mixer',
    company: 'Spotify Studios & Live Audio',
    companyLogo: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY (Hybrid)',
    hub: 'New York, NY',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '2 days ago',
    applicantsCount: 18,
    salaryRange: '$125,000 - $168,000 / yr',
    easyApply: true,
    requiredProductExperience: ['Avid Pro Tools HDX & Dolby Atmos 7.1.4', 'Dante AoIP Networked Broadcast Audio'],
    description: 'Engineer, mix, and master original music sessions, spatial Dolby Atmos 7.1.4 releases, and flagship podcast broadcasts. Manage SSL/Neve analog consoles and Dante digital audio networks.',
    requirements: ['6+ years studio mixing/mastering or live FOH broadcast audio engineering', 'Expert certification in Avid Pro Tools HDX, Dolby Atmos Renderer, and iZotope RX', 'Deep understanding of LUFS loudness standards and studio acoustics'],
    languageRequirement: 'English',
    applyUrl: 'https://www.lifeatspotify.com/',
    source: 'Spotify Jobs',
    tags: ['Audio & Sound Engineering', 'Pro Tools', 'Dolby Atmos', 'Full-time']
  },
  {
    id: 'crea_4',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'creative_media_arts',
    domainCategory: 'Contract',
    title: 'NIC Certified American Sign Language (ASL) Conference & Medical Interpreter',
    company: 'Sorenson Communications',
    companyLogo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&auto=format&fit=crop&q=80',
    location: 'Washington, DC / US Remote',
    hub: 'Washington, DC / MD / VA',
    workplaceType: 'Remote',
    employmentType: 'Contract',
    postedTime: '1 day ago',
    applicantsCount: 9,
    salaryRange: '$65 - $95 / hr ($115,000 - $155,000 eq.)',
    easyApply: true,
    requiredProductExperience: ['RID NIC Certified ASL Interpreter', 'Medical / Legal / Federal Conference Interpreting'],
    description: 'Provide high-stakes simultaneous and consecutive American Sign Language (ASL) interpretation for federal briefings, medical consultations, executive keynotes, and VRS video relay.',
    requirements: ['Registry of Interpreters for the Deaf (RID) NIC, CI/CT, or BEI Master Certification', 'Strict adherence to NAD-RID Code of Professional Conduct and HIPAA confidentiality', '3+ years medical, legal, or diplomatic interpreting experience'],
    languageRequirement: 'Native/Fluent ASL & English',
    applyUrl: 'https://www.sorenson.com/about/careers/',
    source: 'Sorenson Careers',
    tags: ['ASL & Language Interpreting', 'Interpreter', 'Remote', 'Contract']
  },

  // =========================================================================
  // 8. HEALTHCARE, MEDICINE & CLINICAL SCIENCES (healthcare_medicine)
  // =========================================================================
  {
    id: 'health_pharmacist_1',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'healthcare_medicine',
    professionId: 'pharmacist',
    domainCategory: 'Pharmacy & Pharmacology',
    title: 'Director of Clinical Pharmacy & Antimicrobial Stewardship (PharmD, BCPS)',
    company: 'Johns Hopkins Hospital & Health System',
    companyLogo: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=100&auto=format&fit=crop&q=80',
    location: 'Baltimore, MD / Washington, DC (On-site / Hybrid)',
    hub: 'Washington, DC / MD / VA',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '1 hour ago',
    applicantsCount: 8,
    salaryRange: '$168,000 - $215,000 / yr + $20K Sign-On Bonus',
    easyApply: true,
    requiredProductExperience: ['Doctor of Pharmacy (PharmD) & BCPS / BCCCP', 'USP <797>/<800> Sterile IV Compounding & Epic Willow'],
    description: 'Lead clinical pharmacotherapy rounding across ICU and oncology units, oversee Vancomycin AUC/MIC Bayesian dosing, manage USP <797>/<800> sterile IV cleanroom compliance, and direct hospital-wide antimicrobial stewardship.',
    requirements: ['PharmD degree from an ACPE-accredited school of pharmacy', 'Active State Pharmacist License and PGY1/PGY2 residency or BCPS certification', 'Experience with Epic Willow, NIH DailyMed/OpenFDA formulary integration, and Pyxis/Omnicell'],
    languageRequirement: 'English',
    applyUrl: 'https://www.hopkinsmedicine.org/careers',
    source: 'Johns Hopkins Pharmacy Careers',
    tags: ['Pharmacy & Pharmacology', 'Pharmacist', 'PharmD', 'Allied Health & Biomedical', 'Recommended', 'Full-time']
  },
  {
    id: 'health_pharmtech_2',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'healthcare_medicine',
    professionId: 'pharmacy_technician',
    domainCategory: 'Pharmacy & Pharmacology',
    title: 'Lead Sterile Compounding & Oncology Pharmacy Technician (CPhT, CSPT)',
    company: 'Mayo Clinic Hospital Pharmacy',
    companyLogo: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=100&auto=format&fit=crop&q=80',
    location: 'Rochester, MN / Boston, MA (On-site)',
    hub: 'Boston, MA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '2 hours ago',
    applicantsCount: 14,
    salaryRange: '$64,000 - $86,000 / yr + Shift Differential',
    easyApply: true,
    requiredProductExperience: ['PTCB CPhT & CSPT Sterile Compounding', 'Pyxis MedStation & ISO Class 5 Cleanroom'],
    description: 'Prepare sterile parenteral nutrition (TPN), hazardous oncology IV admixtures under USP <800> negative-pressure hoods, and manage automated dispensing cabinet (Pyxis) narcotic vault audits.',
    requirements: ['Active PTCB Certified Pharmacy Technician (CPhT) and CSPT credential', '2+ years hospital inpatient sterile IV compounding experience', 'Strict adherence to aseptic garbing, fingertip media-fill testing, and DEA controlled substance logs'],
    languageRequirement: 'English',
    applyUrl: 'https://jobs.mayoclinic.org/',
    source: 'Mayo Clinic Pharmacy ATS',
    tags: ['Pharmacy & Pharmacology', 'Pharmacy Technician', 'CPhT', 'Allied Health & Biomedical', 'Recommended', 'Full-time']
  },
  {
    id: 'health_physician_3',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'healthcare_medicine',
    professionId: 'physician',
    domainCategory: 'Physicians & Surgeons',
    title: 'Board-Certified Attending Physician — Internal Medicine & Hospitalist (MD / DO)',
    company: 'Kaiser Permanente Medical Group',
    companyLogo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA / Oakland (On-site)',
    hub: 'San Francisco, CA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '2 hours ago',
    applicantsCount: 11,
    salaryRange: '$325,000 - $410,000 / yr + Full Partnership Track',
    easyApply: true,
    requiredProductExperience: ['ABIM Board Certified Internal Medicine (MD / DO)', 'Bedside POCUS Ultrasound & Epic Inpatient EHR'],
    description: 'Serve as Attending Hospitalist leading multidisciplinary inpatient rounding with clinical pharmacists, registered nurses, and case administrators. Perform bedside POCUS diagnostics, central line placements, and evidence-based acute care management.',
    requirements: ['MD or DO degree with ABIM/AOBIM Board Certification in Internal Medicine', 'Active Medical License and DEA Schedule II-V registration', 'Commitment to collaborative physician-nurse-pharmacist bedside rounding'],
    languageRequirement: 'English',
    applyUrl: 'https://careers.kaiserpermanente.org/',
    source: 'Kaiser Permanente Physician Recruiting',
    tags: ['Physicians & Surgeons', 'Doctor', 'Physician', 'MD', 'DO', 'Hospitalist', 'Recommended', 'Full-time']
  },
  {
    id: 'health_1',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'healthcare_medicine',
    professionId: 'surgeon_specialist_md',
    domainCategory: 'Physicians & Surgeons',
    title: 'Attending Orthopedic Trauma Surgeon & Clinical Chair (MD, FACS)',
    company: 'Johns Hopkins Medicine / Shock Trauma',
    companyLogo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80',
    location: 'Washington, DC / MD / VA (On-site)',
    hub: 'Washington, DC / MD / VA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '3 hours ago',
    applicantsCount: 4,
    salaryRange: '$480,000 - $690,000 / yr',
    easyApply: true,
    requiredProductExperience: ['ABOS Board Certified Orthopedic Surgery', 'Level 1 Trauma Pelvic & Acetabular Reconstruction'],
    description: 'Direct the Pelvic & Acetabular Fracture Reconstruction service at our Level 1 Trauma Center. Perform complex articular reconstruction, periprosthetic fractures, and lead clinical resident education.',
    requirements: ['MD/DO with ABOS Board Certification in Orthopedic Surgery', 'OTA-accredited Orthopedic Trauma Fellowship', 'Active Maryland / DC medical license & DEA registration'],
    languageRequirement: 'English',
    applyUrl: 'https://www.hopkinsmedicine.org/careers',
    source: 'Johns Hopkins Direct',
    tags: ['Physicians & Surgeons', 'Surgery', 'Orthopedic Surgery', 'Trauma & Emergency', 'Doctor', 'Recommended']
  },
  {
    id: 'health_2',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'healthcare_medicine',
    professionId: 'critical_care_er_nurse',
    domainCategory: 'Nursing & Advanced Practice',
    title: 'Emergency Trauma Resuscitation & ICU Charge Nurse (RN, CCRN, TNCC)',
    company: 'Massachusetts General Hospital - Level 1 Trauma',
    companyLogo: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=100&auto=format&fit=crop&q=80',
    location: 'Boston, MA (On-site)',
    hub: 'Boston, MA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '3 hours ago',
    applicantsCount: 9,
    salaryRange: '$124,000 - $156,000 / yr',
    easyApply: true,
    requiredProductExperience: ['AACN CCRN & ENA TNCC Certification', 'Epic ASAP Trauma Resuscitation & Belmont RI-2'],
    description: 'Lead Emergency Severity Index Level 1 and trauma bay resuscitations. Direct Rapid Infusion Catheter protocols, invasive hemodynamic monitoring, and Massive Transfusion Protocol (MTP) coordination.',
    requirements: ['BSN with active RN License', 'AACN CCRN and ENA TNCC certified', '4+ years Level 1 Trauma Center emergency or ICU nursing', 'ACLS, PALS, BLS certified'],
    languageRequirement: 'English',
    applyUrl: 'https://www.massgeneral.org/careers',
    source: 'MGH Talent ATS',
    tags: ['Nursing & Advanced Practice', 'Trauma & Emergency', 'Nursing', 'Critical Care', 'CCRN', 'Recommended']
  },
  {
    id: 'health_3',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'healthcare_medicine',
    professionId: 'critical_care_er_nurse',
    domainCategory: 'Nursing & Advanced Practice',
    title: 'Surgical Critical Care ICU Staff Nurse (RN — Travel / PRN)',
    company: 'Cleveland Clinic Foundation',
    companyLogo: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY (On-site)',
    hub: 'New York, NY',
    workplaceType: 'On-site',
    employmentType: 'Contract',
    postedTime: '4 hours ago',
    applicantsCount: 16,
    salaryRange: '$3,200 - $4,400 / week ($160,000+ eq.)',
    easyApply: true,
    requiredProductExperience: ['ECMO & CRRT Hemodynamic Management', 'CCRN Critical Care Nursing'],
    description: '13-week high-acuity surgical intensive care contract. Management of vasoactive drips, V-A/V-V ECMO, CRRT continuous renal replacement, and mechanical ventilation post-cardiothoracic surgery.',
    requirements: ['Active Compact RN License or NY RN license', 'CCRN certification preferred', '2+ years Cardiothoracic or Trauma ICU experience'],
    languageRequirement: 'English',
    applyUrl: 'https://my.clevelandclinic.org/careers',
    source: 'Cleveland Clinic Staffing',
    tags: ['Nursing & Advanced Practice', 'Critical Care', 'Nursing', 'Locum Tenens', 'Contract']
  },
  {
    id: 'health_np_pa_4',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'healthcare_medicine',
    professionId: 'nurse_practitioner_pa',
    domainCategory: 'Nursing & Advanced Practice',
    title: 'Acute Care Nurse Practitioner / Physician Assistant (DNP, APRN, PA-C)',
    company: 'Mount Sinai Health System',
    companyLogo: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY (Hybrid / Telehealth & Inpatient)',
    hub: 'New York, NY',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '5 hours ago',
    applicantsCount: 19,
    salaryRange: '$155,000 - $192,000 / yr',
    easyApply: true,
    requiredProductExperience: ['AGACNP-BC / FNP-BC or NCCPA PA-C License', 'Autonomous Prescribing & Diagnostic Workups'],
    description: 'Manage high-acuity Cardiology and Internal Medicine consult services, order and interpret diagnostic imaging/labs, prescribe pharmacotherapy, and conduct virtual follow-up clinics.',
    requirements: ['Master or Doctor of Nursing Practice (MSN/DNP) or Accredited PA-C degree', 'Active APRN or PA state license with DEA controlled substance authority', 'ACLS and BLS certification'],
    languageRequirement: 'English',
    applyUrl: 'https://careers.mountsinai.org/',
    source: 'Mount Sinai Advanced Practice',
    tags: ['Nursing & Advanced Practice', 'Nurse Practitioner', 'PA-C', 'Trauma & Emergency', 'Recommended', 'Full-time']
  },
  {
    id: 'health_rn_medsurg_8',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'healthcare_medicine',
    professionId: 'registered_nurse',
    domainCategory: 'Nursing & Advanced Practice',
    title: 'Registered Nurse — Inpatient Telemetry, Med-Surg & Step-Down (BSN, RN)',
    company: 'Stanford Health Care / Johns Hopkins Nursing',
    companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA / Palo Alto (On-site)',
    hub: 'San Francisco, CA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '2 hours ago',
    applicantsCount: 15,
    salaryRange: '$138,000 - $184,000 / yr + $15K Sign-On Bonus',
    easyApply: true,
    requiredProductExperience: ['Active RN License (BSN) & ACLS/BLS', 'Epic MAR Barcode Medication Admin & Central Line Care'],
    description: 'Deliver direct bedside nursing care for complex medical-surgical and cardiac telemetry patients. Administer high-alert IV infusions via Alaris smart pumps, manage central venous catheters (PICC/Port), perform comprehensive SBAR shift handoffs, and coordinate multidisciplinary discharge plans.',
    requirements: ['Bachelor of Science in Nursing (BSN) and active Registered Nurse (RN) license', 'Current AHA BLS and ACLS certifications', '1+ year acute care inpatient Med-Surg or Telemetry nursing experience'],
    languageRequirement: 'English',
    applyUrl: 'https://careers.stanfordhealthcare.org/',
    source: 'Stanford Health Care Nursing',
    tags: ['Nursing & Advanced Practice', 'Registered Nurse', 'RN', 'BSN', 'Recommended', 'Full-time']
  },
  {
    id: 'health_nursing_tech_7',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'healthcare_medicine',
    professionId: 'nursing_technician',
    domainCategory: 'Nursing & Advanced Practice',
    title: 'Certified Nursing Technician & Acute Patient Care Technician (PCT, CNA, CPCT-A)',
    company: 'NYU Langone Health & Cedars-Sinai Inpatient Nursing',
    companyLogo: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY / Washington, DC (On-site)',
    hub: 'New York, NY',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '1 hour ago',
    applicantsCount: 18,
    salaryRange: '$58,000 - $76,000 / yr + BSN Nursing Tuition Sponsorship',
    easyApply: true,
    requiredProductExperience: ['State CNA / NHA CPCT-A Nursing Technician Credential', '12-Lead ECG, Venipuncture Phlebotomy, Telemetry & Epic Rover'],
    description: 'Work directly alongside Registered Nurses (RNs) and Attending Physicians on high-acuity Med-Surg, Step-Down, and Emergency observation units. Perform Q4H vital signs, 12-lead ECG acquisition, blood glucose point-of-care testing, venipuncture phlebotomy, Foley catheter care, and sterile dressing assistance.',
    requirements: ['Active Certified Nursing Assistant (CNA), Patient Care Technician (CPCT/PCT), or Nursing Tech credential', 'AHA Basic Life Support (BLS) certification', 'Hands-on proficiency with 12-lead ECG, bladder scanners, and Epic Rover bedside charting'],
    languageRequirement: 'English',
    applyUrl: 'https://jobs.nyulangone.org/',
    source: 'NYU Langone Nursing Careers',
    tags: ['Nursing & Advanced Practice', 'Medical Aides & Clinical Support', 'Nursing Technician', 'PCT', 'CNA', 'Recommended', 'Full-time']
  },
  {
    id: 'health_lpn_9',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'healthcare_medicine',
    professionId: 'licensed_practical_nurse',
    domainCategory: 'Nursing & Advanced Practice',
    title: 'Licensed Practical / Vocational Nurse — Subacute Rehab & Wound Care (LPN / LVN)',
    company: 'Sutter Health & Encompass Health Rehabilitation Hospitals',
    companyLogo: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=100&auto=format&fit=crop&q=80',
    location: 'Austin, TX / Dallas (On-site)',
    hub: 'Austin, TX',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '3 hours ago',
    applicantsCount: 13,
    salaryRange: '$72,000 - $94,000 / yr + LPN-to-BSN Bridge Tuition',
    easyApply: true,
    requiredProductExperience: ['Active LPN / LVN State License & IV Therapy Certified', 'Negative Pressure Wound VAC, Tracheostomy & G-Tube Care'],
    description: 'Lead subacute skilled nursing medication passes, negative-pressure Wound VAC dressing changes, tracheostomy suctioning, enteral G-tube feedings, and supervise Nursing Technicians / CNAs on post-acute rehabilitation units.',
    requirements: ['Active Licensed Practical Nurse (LPN) or Licensed Vocational Nurse (LVN) license', 'IV Therapy certification and AHA BLS card', 'Strong clinical documentation skills in PointClickCare or Epic EHR'],
    languageRequirement: 'English',
    applyUrl: 'https://jobs.sutterhealth.org/',
    source: 'Sutter Health Nursing',
    tags: ['Nursing & Advanced Practice', 'LPN', 'LVN', 'Nursing', 'Recommended', 'Full-time']
  },
  {
    id: 'health_medaide_5',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'healthcare_medicine',
    professionId: 'medical_assistant_aide',
    domainCategory: 'Medical Aides & Clinical Support',
    title: 'Lead Certified Clinical Medical Assistant & Nursing Aide (CCMA, CNA, CPT)',
    company: 'Mass General Brigham Ambulatory & Specialty Clinics',
    companyLogo: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=100&auto=format&fit=crop&q=80',
    location: 'Boston, MA (On-site)',
    hub: 'Boston, MA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '2 hours ago',
    applicantsCount: 24,
    salaryRange: '$56,000 - $74,000 / yr + Tuition Assistance (RN Bridge)',
    easyApply: true,
    requiredProductExperience: ['NHA CCMA / AAMA CMA or State CNA License', '12-Lead ECG, Venipuncture Phlebotomy & Epic Rooming'],
    description: 'Perform rapid patient rooming, orthostatic vital signs triage, 12-lead ECG acquisition, CLSI order-of-draw venipuncture phlebotomy, CLIA-waived point-of-care testing, and sterile minor-procedure tray setup alongside physicians and RNs.',
    requirements: ['Certified Clinical Medical Assistant (CCMA/CMA), Certified Nursing Assistant (CNA), or Licensed Practical Nurse (LPN)', 'Certified Phlebotomy Technician (CPT) and AHA BLS certification', 'Proficiency in Epic ambulatory rooming and vaccine cold-chain logs'],
    languageRequirement: 'English',
    applyUrl: 'https://www.massgeneralbrigham.org/en/careers',
    source: 'MGB Clinical Support Careers',
    tags: ['Medical Aides & Clinical Support', 'Medical Assistant', 'CNA', 'Allied Health & Biomedical', 'Recommended', 'Full-time']
  },
  {
    id: 'health_medadmin_6',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'healthcare_medicine',
    professionId: 'medical_administrator',
    domainCategory: 'Medical & Hospital Administration',
    title: 'Chief Hospital Administrator & VP of Clinical Operations (MHA, MBA, FACHE)',
    company: 'HCA Healthcare / Academic Medical Center Network',
    companyLogo: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=100&auto=format&fit=crop&q=80',
    location: 'Washington, DC / Reston, VA (Hybrid)',
    hub: 'Washington, DC / MD / VA',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '3 hours ago',
    applicantsCount: 12,
    salaryRange: '$210,000 - $295,000 / yr + Executive Bonus',
    easyApply: true,
    requiredProductExperience: ['Master of Health Administration (MHA/MBA) & FACHE', 'Joint Commission (TJC) Accreditation, HIPAA & HL7 FHIR'],
    description: 'Direct hospital-wide clinical operations, inpatient bed-flow command center, nursing/pharmacy workforce budgets, Joint Commission accreditation surveys, HIPAA HITECH compliance, and CMS value-based revenue cycle performance.',
    requirements: ['Master of Health Administration (MHA), MBA, or MPH; FACHE credential strongly preferred', '7+ years progressive hospital or multi-specialty medical group leadership', 'Deep expertise in Joint Commission standards, CMS Star Ratings, and Epic/Cerner EHR financial governance'],
    languageRequirement: 'English',
    applyUrl: 'https://careers.hcahealthcare.com/',
    source: 'HCA Executive Recruiting',
    tags: ['Medical & Hospital Administration', 'Hospital Administrator', 'Recommended', 'Full-time']
  },
  {
    id: 'health_4',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'healthcare_medicine',
    professionId: 'dentist',
    domainCategory: 'Dental & Veterinary',
    title: 'Lead Doctor of Dental Surgery (DDS / DMD) — Implant & Prosthodontics',
    company: 'Mayo Clinic Dental Specialties',
    companyLogo: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=100&auto=format&fit=crop&q=80',
    location: 'Austin, TX / Rochester (On-site)',
    hub: 'Austin, TX',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 6,
    salaryRange: '$285,000 - $420,000 / yr',
    easyApply: true,
    requiredProductExperience: ['DDS/DMD State Dental License', 'CBCT 3D Guided Implantology & CEREC CAD/CAM'],
    description: 'Perform full-arch zygomatic and endosseous dental implant restorations, CBCT 3D surgical guide planning, CEREC same-day zirconia prosthetics, and complex oral rehabilitation.',
    requirements: ['DDS or DMD from a CODA-accredited dental school', 'Active Dental License and IV Moderate Sedation permit', 'Proficiency in 3Shape/CEREC digital dentistry and guided implant surgery'],
    languageRequirement: 'English',
    applyUrl: 'https://jobs.mayoclinic.org/',
    source: 'Mayo Clinic Careers',
    tags: ['Dental & Veterinary', 'Dentistry', 'Surgery', 'Full-time']
  },
  {
    id: 'health_5',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'healthcare_medicine',
    professionId: 'veterinarian',
    domainCategory: 'Dental & Veterinary',
    title: 'Medical Director & Small/Large Animal Veterinary Surgeon (DVM)',
    company: 'BluePearl Specialty + Emergency Pet Hospital',
    companyLogo: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=100&auto=format&fit=crop&q=80',
    location: 'Seattle, WA (On-site)',
    hub: 'Seattle, WA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '2 days ago',
    applicantsCount: 7,
    salaryRange: '$185,000 - $265,000 / yr + Signing Bonus',
    easyApply: true,
    requiredProductExperience: ['DVM Licensure & USDA Accreditation', 'Veterinary Orthopedic (TPLO) & Soft-Tissue Surgery'],
    description: 'Lead veterinary surgical and emergency critical care caseloads including TPLO cranial cruciate stabilization, emergency GDV gastropexy, diagnostic ultrasound, and clinical team mentorship.',
    requirements: ['Doctor of Veterinary Medicine (DVM/VMD) with active state license', 'DACVS board certification or 4+ years emergency/surgical veterinary experience', 'USDA APHIS Category II Accreditation'],
    languageRequirement: 'English',
    applyUrl: 'https://careers.bluepearlvet.com/',
    source: 'BluePearl Vet Careers',
    tags: ['Dental & Veterinary', 'Veterinary', 'Surgery', 'Full-time']
  },
  {
    id: 'health_surgtech_10',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'healthcare_medicine',
    professionId: 'surgical_sterile_tech',
    domainCategory: 'Diagnostic Imaging & Allied Health',
    title: 'Certified Surgical Technologist & Robotic OR Scrub Specialist (CST, CRCST)',
    company: 'Mayo Clinic Surgical Services & DaVinci Robotic Suite',
    companyLogo: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=100&auto=format&fit=crop&q=80',
    location: 'Boston, MA / Rochester (On-site)',
    hub: 'Boston, MA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '4 hours ago',
    applicantsCount: 9,
    salaryRange: '$78,000 - $104,000 / yr + Call Pay',
    easyApply: true,
    requiredProductExperience: ['NBSTSA Certified Surgical Technologist (CST) & CRCST', 'DaVinci Xi Robotic Scrub, Orthopedics & Cardiothoracic Trays'],
    description: 'Scrub in for complex orthopedic joint reconstructions, neurosurgery, and DaVinci Xi robotic procedures. Maintain sterile field integrity, manage Mayo stand instrumentation, execute sponge/sharp/instrument counts, and coordinate with Sterile Processing (SPD).',
    requirements: ['NBSTSA Certified Surgical Technologist (CST) credential', '2+ years Main OR scrub experience across orthopedics, general, or robotic surgery', 'Thorough knowledge of AORN sterile technique and AAMI ST79 sterilization standards'],
    languageRequirement: 'English',
    applyUrl: 'https://jobs.mayoclinic.org/',
    source: 'Mayo Clinic OR Careers',
    tags: ['Diagnostic Imaging & Allied Health', 'Medical Aides & Clinical Support', 'Surgical Technologist', 'CST', 'Recommended', 'Full-time']
  },
  {
    id: 'health_resp_11',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'healthcare_medicine',
    professionId: 'respiratory_therapist',
    domainCategory: 'Diagnostic Imaging & Allied Health',
    title: 'Registered Respiratory Therapist — Adult & Neonatal ICU Ventilation (RRT, ACCS)',
    company: 'UCSF Health & Children’s National Medical Center',
    companyLogo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&auto=format&fit=crop&q=80',
    location: 'Washington, DC / San Francisco, CA (On-site)',
    hub: 'Washington, DC / MD / VA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '4 hours ago',
    applicantsCount: 8,
    salaryRange: '$96,000 - $128,000 / yr + $10K Sign-On Bonus',
    easyApply: true,
    requiredProductExperience: ['NBRC Registered Respiratory Therapist (RRT / ACCS)', 'Hamilton-G5 / Servo-U Ventilators, ABGs & High-Frequency Oscillators'],
    description: 'Manage invasive and non-invasive mechanical ventilation in Medical, Trauma, and Neonatal ICUs. Perform arterial blood gas (ABG) punctures and analysis, assist with rapid sequence intubation (RSI) and bronchoscopy, and execute ARDSnet lung-protective weaning protocols.',
    requirements: ['NBRC Registered Respiratory Therapist (RRT) credential and state RCP license', 'ACLS, PALS, and NRP (Neonatal Resuscitation Program) certifications', 'Adult Critical Care Specialist (ACCS) or NPS credential preferred'],
    languageRequirement: 'English',
    applyUrl: 'https://www.ucsfhealth.org/careers',
    source: 'UCSF Allied Health Careers',
    tags: ['Diagnostic Imaging & Allied Health', 'Respiratory Therapist', 'RRT', 'Critical Care', 'Recommended', 'Full-time']
  },
  {
    id: 'health_radtech_12',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'healthcare_medicine',
    professionId: 'radiology_imaging_tech',
    domainCategory: 'Diagnostic Imaging & Allied Health',
    title: 'Lead CT / 3T MRI & Diagnostic Ultrasound Technologist (ARRT RT, RDMS)',
    company: 'Memorial Sloan Kettering Cancer Center',
    companyLogo: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY (On-site)',
    hub: 'New York, NY',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '5 hours ago',
    applicantsCount: 10,
    salaryRange: '$105,000 - $138,000 / yr',
    easyApply: true,
    requiredProductExperience: ['ARRT RT(R)(CT)(MR) or ARDMS RDMS', 'Siemens 3T Magnetom MRI, STAT Stroke CT & PACS DICOM'],
    description: 'Perform high-resolution oncology staging 3T MRI scans, STAT stroke CT perfusion angiography, and diagnostic vascular ultrasound. Enforce MRI Zone IV ferromagnetic safety screening, IV power-injector contrast protocols, and ALARA radiation standards.',
    requirements: ['ARRT Registered Technologist in Radiography, CT, or MRI — or ARDMS Registered Diagnostic Medical Sonographer', 'Active State Radiologic Technologist license & BLS certification', 'Experience with Siemens/GE cross-sectional scanners and Sectra PACS'],
    languageRequirement: 'English',
    applyUrl: 'https://careers.mskcc.org/',
    source: 'MSKCC Imaging Careers',
    tags: ['Diagnostic Imaging & Allied Health', 'Radiology Tech', 'MRI', 'Ultrasound', 'Recommended', 'Full-time']
  },
  {
    id: 'health_paramedic_13',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'healthcare_medicine',
    professionId: 'paramedic_emt',
    domainCategory: 'Medical Aides & Clinical Support',
    title: 'Critical Care Flight & Ground Paramedic / EMS Specialist (NRP, FP-C, EMT)',
    company: 'Boston MedFlight & Johns Hopkins Lifeline Critical Care Transport',
    companyLogo: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=100&auto=format&fit=crop&q=80',
    location: 'Boston, MA / Baltimore, MD (On-site)',
    hub: 'Boston, MA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '5 hours ago',
    applicantsCount: 11,
    salaryRange: '$84,000 - $114,000 / yr',
    easyApply: true,
    requiredProductExperience: ['NREMT Paramedic (NRP) & IBSC FP-C / CCP-C', '12-Lead STEMI Telemetry, Video Laryngoscopy RSI & Mobile ICU'],
    description: 'Deliver pre-hospital 911 trauma response and interfacility mobile ICU critical care transport. Perform video laryngoscopy endotracheal intubation, 12-lead ECG STEMI cath-lab transmission, chest decompression, and multi-pump vasoactive drip transport.',
    requirements: ['National Registered Paramedic (NRP) or State Paramedic / Advanced EMT license', 'ACLS, PALS, PHTLS/ITLS certified; IBSC FP-C or CCP-C preferred', '3+ years high-volume 911 EMS or critical care transport experience'],
    languageRequirement: 'English',
    applyUrl: 'https://www.bostonmedflight.org/careers/',
    source: 'Boston MedFlight EMS',
    tags: ['Medical Aides & Clinical Support', 'Paramedic', 'EMT', 'EMS', 'Trauma & Emergency', 'Recommended', 'Full-time']
  },
  {
    id: 'health_him_coding_14',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'healthcare_medicine',
    professionId: 'medical_billing_him',
    domainCategory: 'Medical & Hospital Administration',
    title: 'Senior Health Information & Inpatient DRG Medical Coding Administrator (RHIA, CPC, CCS)',
    company: 'Optum / Cleveland Clinic Revenue Cycle Integrity',
    companyLogo: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&auto=format&fit=crop&q=80',
    location: 'US Remote / Hybrid',
    hub: 'US Remote',
    workplaceType: 'Remote',
    employmentType: 'Full-time',
    postedTime: '6 hours ago',
    applicantsCount: 21,
    salaryRange: '$88,000 - $118,000 / yr (100% Remote)',
    easyApply: true,
    requiredProductExperience: ['AHIMA RHIA / CCS or AAPC CPC Credential', 'ICD-10-CM/PCS, MS-DRG Validation & Epic Resolute'],
    description: 'Audit complex inpatient surgical and ICU medical records for ICD-10-CM/PCS and CPT-4 accuracy, MS-DRG/APR-DRG severity-of-illness optimization, clinical documentation improvement (CDI) physician queries, and HIPAA privacy compliance.',
    requirements: ['Active AHIMA (RHIA, RHIT, CCS) or AAPC (CPC, CIC) certification', '4+ years inpatient hospital DRG coding or revenue integrity experience', 'Proficiency in 3M 360 Encompass, Epic Resolute, and CMS NCCI edits'],
    languageRequirement: 'English',
    applyUrl: 'https://careers.unitedhealthgroup.com/',
    source: 'Optum Health Administration',
    tags: ['Medical & Hospital Administration', 'Medical Coding', 'Health Information', 'Remote', 'Recommended', 'Full-time']
  },

  // =========================================================================
  // 9. EDUCATION, ACADEMIA & WORKFORCE TRAINING (education_workforce)
  // =========================================================================
  {
    id: 'edu_1',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'education_workforce',
    domainCategory: 'Recommended',
    title: 'Associate Professor & Principal Investigator (Applied AI & Systems)',
    company: 'Massachusetts Institute of Technology (MIT) / Academic Faculty',
    companyLogo: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=100&auto=format&fit=crop&q=80',
    location: 'Boston, MA (On-site / Hybrid)',
    hub: 'Boston, MA',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '4 hours ago',
    applicantsCount: 22,
    salaryRange: '$155,000 - $215,000 / yr',
    easyApply: true,
    requiredProductExperience: ['NSF / NIH / DARPA Principal Investigator Track', 'Graduate Doctoral Supervision & ABET Curriculum'],
    description: 'Lead a funded research laboratory, direct PhD/M.S. dissertation cohorts, publish in top-tier peer-reviewed venues, and teach graduate/undergraduate seminars.',
    requirements: ['Ph.D. or terminal doctorate in relevant discipline', 'Proven record of external grant funding (NSF, NIH, DoE, or DARPA) and high-impact publications', 'Excellence in university teaching and curriculum design'],
    languageRequirement: 'English',
    applyUrl: 'https://careers.mit.edu/',
    source: 'MIT Academic Careers',
    tags: ['Higher Education & Faculty', 'Professor', 'Research', 'Recommended']
  },
  {
    id: 'edu_2',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'education_workforce',
    domainCategory: 'Recommended',
    title: 'Lead K-12 STEM & AP Computer Science / Robotics Educator',
    company: 'Basis Independent & Charter Schools Network',
    companyLogo: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=100&auto=format&fit=crop&q=80',
    location: 'Washington, DC / MD / VA (On-site)',
    hub: 'Washington, DC / MD / VA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 15,
    salaryRange: '$78,000 - $108,000 / yr',
    easyApply: true,
    requiredProductExperience: ['State Teaching Certification & NBCT', 'NGSS STEM Pedagogy & IEP Differentiation'],
    description: 'Design and deliver project-based STEM, AP Physics/Computer Science, and FIRST Robotics lab instruction. Foster inclusive classroom mastery using Universal Design for Learning (UDL).',
    requirements: ['B.A./M.Ed. with active State Teacher Certification', '3+ years secondary STEM classroom teaching experience', 'Strong track record in student AP exam pass rates and IEP/504 collaboration'],
    languageRequirement: 'English',
    applyUrl: 'https://careers.basised.com/',
    source: 'BASIS Ed Careers',
    tags: ['K-12 & STEM Teaching', 'Education', 'Teacher', 'Recommended']
  },
  {
    id: 'edu_3',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'education_workforce',
    domainCategory: 'Full-time',
    title: 'Lead Vocational CTE Instructor (Skilled Trades, Welding & HVAC)',
    company: 'Lincoln Tech Career & Technical Institute',
    companyLogo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY / Austin, TX (On-site)',
    hub: 'New York, NY',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '2 days ago',
    applicantsCount: 11,
    salaryRange: '$84,000 - $112,000 / yr',
    easyApply: true,
    requiredProductExperience: ['NCCER Certified Master Trainer', 'OSHA 500 Outreach Trainer & Hands-On Shop Lab'],
    description: 'Train the next generation of apprentices in our 25,000 sq. ft. technical trade lab. Deliver hands-on instruction in blueprint reading, electrical/HVAC diagnostics, welding, and OSHA job-site safety.',
    requirements: ['5+ years Journeyman/Master field experience in Construction, Electrical, HVAC, or Automotive', 'NCCER Instructor or ASE/AWS certification', 'Passion for mentoring adult learners and trade apprentices'],
    languageRequirement: 'English',
    applyUrl: 'https://www.lincolntech.edu/careers',
    source: 'Lincoln Tech Careers',
    tags: ['Vocational & CTE Training', 'Trade Instructor', 'NCCER', 'Full-time']
  },

  // =========================================================================
  // 10. COMMUNITY, CIVIC, VETERANS & PROTECTIVE SERVICES (community_civic_security)
  // =========================================================================
  {
    id: 'civic_1',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'community_civic_security',
    domainCategory: 'Recommended',
    title: 'Regional Emergency Management & Disaster Response Director (ICS-400)',
    company: 'FEMA / Municipal Emergency Operations',
    companyLogo: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=100&auto=format&fit=crop&q=80',
    location: 'Washington, DC / MD / VA (Hybrid)',
    hub: 'Washington, DC / MD / VA',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '3 hours ago',
    applicantsCount: 18,
    salaryRange: '$118,000 - $154,000 / yr (GS-13 / GS-14 Eq.)',
    easyApply: true,
    requiredProductExperience: ['FEMA NIMS ICS-300/400 Certification', 'Certified Emergency Manager (CEM) & WebEOC'],
    description: 'Command multi-agency Emergency Operations Center (EOC) activations, hazard mitigation grants, mass-care logistics, and joint police/fire/EMS unified incident command.',
    requirements: ['FEMA NIMS ICS-100, 200, 300, 400, 700, and 800 certifications', '5+ years public safety, fire/EMS command, or military emergency operations', 'IAEM Certified Emergency Manager (CEM) preferred'],
    languageRequirement: 'English',
    applyUrl: 'https://www.usajobs.gov/',
    source: 'USAJOBS Federal Portal',
    tags: ['Public Safety & Emergency', 'FEMA', 'Emergency Management', 'Recommended']
  },
  {
    id: 'civic_2',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'community_civic_security',
    domainCategory: 'Recommended',
    title: 'Director of Defense Operations & DoD SkillBridge Military Program',
    company: 'Hiring Our Heroes / Cleared Veterans Alliance',
    companyLogo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    location: 'Washington, DC / US Remote',
    hub: 'US Remote',
    workplaceType: 'Remote',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 25,
    salaryRange: '$115,000 - $148,000 / yr',
    easyApply: true,
    requiredProductExperience: ['U.S. Military Officer / Senior NCO Background', 'DoD SkillBridge & PMP Operations Leadership'],
    description: 'Lead operational readiness, defense contractor workforce pipelines, and MOS/AFSC-to-civilian executive fellowships for transitioning service members and cleared veterans.',
    requirements: ['Honorable U.S. Military service (Officer, Warrant Officer, or Senior NCO) or DoD civilian equivalent', 'PMP certification or Joint Staff operational planning experience', 'Active Secret or TS/SCI clearance a plus'],
    languageRequirement: 'English',
    applyUrl: 'https://www.hiringourheroes.org/career-services/',
    source: 'Veterans Career Portal',
    tags: ['Veterans & Military Transition', 'Operations', 'Cleared', 'Recommended']
  },
  {
    id: 'civic_3',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'community_civic_security',
    domainCategory: 'Full-time',
    title: 'Vice President of Global Corporate Security & Executive Protection (CPP)',
    company: 'Allied Universal Risk Advisory & Protective Services',
    companyLogo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY (Hybrid)',
    hub: 'New York, NY',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '2 days ago',
    applicantsCount: 14,
    salaryRange: '$140,000 - $185,000 / yr',
    easyApply: true,
    requiredProductExperience: ['ASIS Certified Protection Professional (CPP)', 'GSOC Threat Intelligence & Executive Protection'],
    description: 'Direct physical security architecture, Global Security Operations Center (GSOC) threat monitoring, international travel risk, and C-suite executive protection details.',
    requirements: ['ASIS Board Certified Protection Professional (CPP) or PSP', '8+ years federal law enforcement, military special operations, or corporate security leadership', 'Expertise in LenelS2/Genetec access control and physical penetration testing'],
    languageRequirement: 'English',
    applyUrl: 'https://jobs.aus.com/',
    source: 'Allied Universal Careers',
    tags: ['Corporate Security & Protection', 'CPP', 'Executive Protection', 'Full-time']
  },

  // =========================================================================
  // 11. CAMPUS, STUDENTS & EARLY CAREER FELLOWS (campus_students)
  // =========================================================================
  {
    id: 'camp_1',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'campus_students',
    domainCategory: 'Recommended',
    title: '2026 Software & AI Engineering Intern / New Grad Rotational Fellow',
    company: 'Google Early Career & University Programs',
    companyLogo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA / New York, NY / Seattle, WA',
    hub: 'San Francisco, CA',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '2 hours ago',
    applicantsCount: 48,
    salaryRange: '$115,000 - $148,000 / yr (or $58/hr + Housing Stipend)',
    easyApply: true,
    requiredProductExperience: ['B.S. / M.S. CS or STEM Capstone Portfolio', 'Python / TypeScript / Data Structures & Algorithms'],
    description: 'Join a production engineering team building cloud-scale distributed systems and multimodal Gemini AI applications. Receive 1-on-1 senior staff mentorship and direct conversion path to full-time L3/L4 roles.',
    requirements: ['Currently pursuing or recently completed B.S., M.S., or Ph.D. in CS, Engineering, Data Science, or related field', 'Strong foundation in Python, C++, Java, or TypeScript', 'GitHub portfolio, hackathon projects, or undergraduate research experience'],
    languageRequirement: 'English',
    applyUrl: 'https://www.google.com/about/careers/applications/students/',
    source: 'Google University Recruiting',
    tags: ['Internships & Co-ops', 'New Grad Rotational', 'Early Career', 'Recommended']
  },
  {
    id: 'camp_2',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'campus_students',
    domainCategory: 'Recommended',
    title: 'Graduate Research Fellow & NASA Pathways STEM Scholar',
    company: 'NASA Jet Propulsion Laboratory / OSTEM Fellowships',
    companyLogo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100&auto=format&fit=crop&q=80',
    location: 'Washington, DC / US Remote / Pasadena',
    hub: 'Washington, DC / MD / VA',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 29,
    salaryRange: '$72,000 - $98,000 / yr + Full Tuition Grant',
    easyApply: true,
    requiredProductExperience: ['MATLAB / Python Scientific Computing', 'Peer-Reviewed Research & Lab Instrumentation'],
    description: 'Conduct funded graduate and undergraduate research in autonomous spacecraft navigation, earth-observation climate modeling, and cyber-physical telemetry.',
    requirements: ['Enrolled in an accredited undergraduate or graduate STEM degree program (3.2+ GPA)', 'Experience with Python, MATLAB, C++, or laboratory instrumentation', 'Strong technical writing and presentation skills'],
    languageRequirement: 'English',
    applyUrl: 'https://www.nasa.gov/learning-resources/internship-programs/',
    source: 'NASA Pathways Portal',
    tags: ['Research Fellowships', 'STEM Fellow', 'Academic', 'Recommended']
  },
  {
    id: 'camp_3',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'campus_students',
    domainCategory: 'Full-time',
    title: 'New Grad Leadership Development Program (Finance, Product & Ops)',
    company: 'Microsoft Aspire Early Career Program',
    companyLogo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=80',
    location: 'Seattle, WA / Austin, TX / Remote',
    hub: 'Seattle, WA',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '2 days ago',
    applicantsCount: 37,
    salaryRange: '$105,000 - $132,000 / yr + Relocation & Bonus',
    easyApply: true,
    requiredProductExperience: ['Business / Engineering / Finance Degree', 'SQL, PowerBI & Product Strategy Capstone'],
    description: '2-year accelerated rotational program across Product Management, Corporate Strategy, and Customer Success with executive coaching and global cohort summits.',
    requirements: ['B.A./B.S. or MBA/M.S. graduating in 2025 or 2026', 'Demonstrated campus leadership, case competition awards, or prior internship experience', 'Analytical proficiency in SQL, Excel financial modeling, or product design'],
    languageRequirement: 'English',
    applyUrl: 'https://careers.microsoft.com/v2/global/en/students',
    source: 'Microsoft University Careers',
    tags: ['New Grad Rotational', 'Product & Strategy', 'Full-time']
  },

  // =========================================================================
  // 12. SOFTWARE ENGINEERING, AI & DATA SCIENCE (tech_software)
  // =========================================================================
  {
    id: 'soft_1',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'tech_software',
    domainCategory: 'Recommended',
    title: 'Senior Frontend Systems Engineer (Next.js 16 & Turbopack)',
    company: 'Vercel',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    location: 'US Remote / San Francisco, CA',
    hub: 'US Remote',
    workplaceType: 'Remote',
    employmentType: 'Full-time',
    postedTime: '3 hours ago',
    applicantsCount: 38,
    salaryRange: '$185,000 - $235,000 / yr + Equity',
    easyApply: true,
    requiredProductExperience: ['Next.js 16 App Router & React 19 Server Actions', 'TypeScript, Rust/Turbopack & Edge Runtime'],
    description: 'Architect high-performance developer experience platforms with Next.js 16, React Server Components, streaming SSR, and global edge network caching.',
    requirements: ['5+ years React & TypeScript production engineering experience', 'Deep knowledge of Next.js App Router, Core Web Vitals, and distributed edge compute', 'Contributions to open-source or high-scale SaaS applications'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://vercel.com/careers',
    source: 'Vercel Greenhouse ATS',
    tags: ['Full-Stack & Systems', 'Next.js 16', 'React 19', 'Remote', 'Recommended']
  },
  {
    id: 'soft_2',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'tech_software',
    domainCategory: 'Recommended',
    title: 'Staff AI / LLM Agentic Systems Engineer (PyTorch & MCP)',
    company: 'OpenAI / Applied AI Engineering',
    companyLogo: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=100&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA (Hybrid)',
    hub: 'San Francisco, CA',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '5 hours ago',
    applicantsCount: 44,
    salaryRange: '$250,000 - $360,000 / yr + Equity',
    easyApply: true,
    requiredProductExperience: ['PyTorch Distributed Inference & vLLM', 'Model Context Protocol (MCP) & Multi-Agent Orchestration'],
    description: 'Build production multi-agent tool-calling infrastructure, low-latency vLLM/TensorRT inference clusters, and RLHF evaluation pipelines for frontier reasoning models.',
    requirements: ['6+ years production ML systems or distributed backend engineering', 'Expert proficiency in Python, PyTorch, CUDA/Triton kernels, and Rust/Go', 'Experience scaling high-throughput LLM APIs and RAG vector pipelines'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://openai.com/careers',
    source: 'OpenAI Ashby ATS',
    tags: ['AI & Machine Learning', 'PyTorch', 'LLM Agents', 'Recommended']
  },
  {
    id: 'soft_3',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'tech_software',
    domainCategory: 'Full-time',
    title: 'Principal Distributed Systems & Payment Ledger Engineer (Go / Rust)',
    company: 'Stripe Core Infrastructure',
    companyLogo: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=100&auto=format&fit=crop&q=80',
    location: 'Seattle, WA / New York, NY / Remote',
    hub: 'Seattle, WA',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 29,
    salaryRange: '$210,000 - $275,000 / yr',
    easyApply: true,
    requiredProductExperience: ['Go / Rust High-Concurrency Microservices', 'PostgreSQL Sharding, Kafka & 99.999% SLA'],
    description: 'Design and operate strongly consistent distributed financial ledgers processing over $1 Trillion in global payment volume with 99.999% availability.',
    requirements: ['7+ years backend systems engineering in Go, Rust, Java, or C++', 'Deep mastery of Raft/Paxos consensus, Kafka event streaming, and PostgreSQL internals', 'Experience debugging high-throughput multi-region cloud systems'],
    languageRequirement: 'English',
    applyUrl: 'https://stripe.com/jobs',
    source: 'Stripe Greenhouse ATS',
    tags: ['Full-Stack & Systems', 'Cloud & DevOps SRE', 'Golang', 'Rust', 'Full-time']
  },

  // =========================================================================
  // 13. CYBERSECURITY, SOC & OFFENSIVE SECURITY (tech_cybersecurity)
  // =========================================================================
  {
    id: 'us_1',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'tech_cybersecurity',
    domainCategory: 'Recommended',
    title: 'Lead Cloud Security Architect (Zero Trust & eBPF)',
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
    requiredProductExperience: ['Expedite Strike™ & Zero Trust Architecture', 'AWS Security Hub, eBPF & CISSP'],
    description: 'Lead zero-trust multi-cloud architectures across AWS, Azure, and GCP. Architect microVM sandboxing, eBPF kernel telemetry, and autonomous pentest validation.',
    requirements: ['10+ years in Cloud Infrastructure Security', 'Hands-on AWS Transit Gateway & mTLS', 'CISSP / CCSP or AWS Security Specialty', 'Zero Trust IAM Architecture'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://expedite-consults.vercel.app/launchpad',
    source: 'Expedite Direct ATS',
    tags: ['Zero Trust', 'Cybersecurity', 'AWS', 'eBPF', 'Recommended']
  },
  {
    id: 'us_2',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'tech_cybersecurity',
    domainCategory: 'Recommended',
    title: 'Staff AI Safety & Offensive Red Teaming Engineer',
    company: 'Anthropic',
    companyLogo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA (Hybrid / Remote)',
    hub: 'San Francisco, CA',
    workplaceType: 'Remote',
    employmentType: 'Full-time',
    postedTime: '2 days ago',
    applicantsCount: 42,
    salaryRange: '$240,000 - $310,000 / yr',
    easyApply: true,
    requiredProductExperience: ['Autonomous LLM Red-Teaming & OSCP/OSCE', 'Adversarial Guardrail Evaluation'],
    description: 'Develop automated red-teaming harnesses and adversarial prompt probes to evaluate frontier AI systems against autonomous cyber exploitation and sandbox escape.',
    requirements: ['PyTorch / Transformer architecture familiarity', 'Offensive security (OSCP/OSCE) & adversarial fuzzing experience', 'Published research or enterprise security audits'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://boards.greenhouse.io/anthropic',
    source: 'Greenhouse ATS',
    tags: ['Cybersecurity', 'AI Security', 'LLM Red Team', 'Remote', 'Recommended']
  },
  {
    id: 'us_3',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'tech_cybersecurity',
    domainCategory: 'Defense',
    title: 'Principal Cyber Threat Hunter & DFIR Lead',
    company: 'CrowdStrike Falcon OverWatch',
    companyLogo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=80',
    location: 'Austin, TX / US Remote',
    hub: 'Austin, TX',
    workplaceType: 'Remote',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 24,
    salaryRange: '$190,000 - $255,000 / yr',
    easyApply: true,
    requiredProductExperience: ['CrowdStrike Falcon EDR & Splunk ES', 'MITRE ATT&CK Threat Hunting & YARA/Sigma'],
    description: 'Proactively hunt nation-state adversary intrusions across global endpoints and cloud workloads. Author high-fidelity YARA/Sigma detections and lead memory forensics.',
    requirements: ['6+ years SOC Tier 3 Threat Hunting or DFIR Incident Response', 'GIAC GCFA, GNFA, or GCTI certification', 'Deep expertise in Windows/Linux internals and MITRE ATT&CK'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.crowdstrike.com/careers/',
    source: 'CrowdStrike Workday ATS',
    tags: ['Cybersecurity', 'Threat Hunting', 'SOC', 'Remote', 'Defense']
  },

  // =========================================================================
  // 14. LAW, GOVERNMENT & DEFENSE CONTRACTING (law_gov_defense)
  // =========================================================================
  {
    id: 'gov_1',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'law_gov_defense',
    domainCategory: 'Recommended',
    title: 'Principal DoD RMF / CMMC Level 3 Security Authorization Architect',
    company: 'Booz Allen Hamilton — National Defense',
    companyLogo: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&auto=format&fit=crop&q=80',
    location: 'Washington, DC / MD / VA (Hybrid)',
    hub: 'Washington, DC / MD / VA',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '3 hours ago',
    applicantsCount: 14,
    salaryRange: '$175,000 - $225,000 / yr',
    easyApply: true,
    clearanceRequired: 'Active Top Secret / SCI',
    requiredProductExperience: ['NIST SP 800-53 Rev 5 & eMASS ATO Packages', 'FedRAMP High & CMMC 2.0 Level 3'],
    description: 'Lead Continuous Authority to Operate (cATO) packages in eMASS/Xacta for DoD Impact Level 6 (IL6) and Intelligence Community ICD 503 cloud enclaves.',
    requirements: ['Active Top Secret / SCI clearance', 'DoD 8570/8140 IAM Level III (CISSP, CISM, or GSLC)', '7+ years leading NIST SP 800-53 Rev 5 assessments, SSPs, SARs, and POA&Ms'],
    languageRequirement: 'English (U.S. Citizenship Required)',
    applyUrl: 'https://careers.boozallen.com/',
    source: 'Booz Allen Careers',
    tags: ['Defense & Clearance', 'RMF & Compliance', 'GovTech', 'Recommended']
  },
  {
    id: 'gov_2',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'law_gov_defense',
    domainCategory: 'Recommended',
    title: 'Senior Corporate Counsel — Technology, Privacy & Federal Contracts (JD)',
    company: 'Lockheed Martin Legal & Government Affairs',
    companyLogo: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=100&auto=format&fit=crop&q=80',
    location: 'Washington, DC / MD / VA (Hybrid)',
    hub: 'Washington, DC / MD / VA',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 11,
    salaryRange: '$215,000 - $285,000 / yr + Bonus',
    easyApply: true,
    requiredProductExperience: ['Juris Doctor (JD) & Active Bar Admission', 'FAR / DFARS Procurement & IP Licensing'],
    description: 'Advise executive leadership on FAR/DFARS federal defense procurements, OTA agreements, ITAR/EAR export controls, AI data governance, and strategic M&A transactions.',
    requirements: ['Juris Doctor (J.D.) with active State Bar membership in good standing', '6+ years AmLaw 100 or defense/tech in-house legal counsel experience', 'Deep knowledge of FAR/DFARS, Bid Protests, and cybersecurity incident disclosure'],
    languageRequirement: 'English',
    applyUrl: 'https://www.lockheedmartinjobs.com/',
    source: 'Lockheed Martin Careers',
    tags: ['Corporate & Gov Counsel', 'Legal', 'Defense & Clearance', 'Recommended']
  },
  {
    id: 'gov_3',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'law_gov_defense',
    domainCategory: 'Government',
    title: 'Supervisory IT Program Manager & Digital Transformation Lead (GS-15)',
    company: 'U.S. Digital Service / Department of Defense',
    companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80',
    location: 'Washington, DC / US Remote',
    hub: 'Washington, DC / MD / VA',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '2 days ago',
    applicantsCount: 21,
    salaryRange: '$163,964 - $191,900 / yr (GS-15 Federal Scale)',
    easyApply: true,
    requiredProductExperience: ['FAC-P/PM Senior Level III or PMP', 'Federal IT Modernization & Zero Trust Mandate'],
    description: 'Direct a $120M federal cloud modernization portfolio. Prepare USAJOBS Executive Core Qualifications (ECQs) and oversee multi-vendor agile delivery teams.',
    requirements: ['1+ year specialized experience equivalent to GS-14 in federal or enterprise IT program management', 'PMP or DAWIA/FAC-P/PM Senior certification', 'Experience with OMB M-22-09 federal Zero Trust architecture mandates'],
    languageRequirement: 'English',
    applyUrl: 'https://www.usajobs.gov/',
    source: 'USAJOBS Official Feed',
    tags: ['Government', 'Federal GS', 'Program Management', 'Full-time']
  },

  // =========================================================================
  // 15. FINANCE, ACCOUNTING & FINTECH (finance_accounting)
  // =========================================================================
  {
    id: 'fin_1',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'finance_accounting',
    domainCategory: 'Recommended',
    title: 'Vice President — Corporate Controller & SEC Technical Accounting (CPA)',
    company: 'JPMorgan Chase & Co.',
    companyLogo: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY (Hybrid)',
    hub: 'New York, NY',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '3 hours ago',
    applicantsCount: 19,
    salaryRange: '$185,000 - $245,000 / yr + Bonus',
    easyApply: true,
    requiredProductExperience: ['Active CPA License & Big 4 Audit Pedigree', 'US GAAP / IFRS & SOX 404 Internal Controls'],
    description: 'Lead global multi-entity financial close, SEC 10-K/10-Q regulatory filings, ASC 606 revenue recognition, and Sarbanes-Oxley (SOX 404) audit readiness.',
    requirements: ['Active Certified Public Accountant (CPA) license', '8+ years progressive accounting leadership (Big 4 public accounting + corporate controllership)', 'Expertise in NetSuite/SAP S/4HANA and Workiva SEC reporting'],
    languageRequirement: 'English',
    applyUrl: 'https://careers.jpmorgan.com/',
    source: 'JPMorgan Careers',
    tags: ['CPA & Corporate Accounting', 'Controller', 'SOX 404', 'Recommended']
  },
  {
    id: 'fin_2',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'finance_accounting',
    domainCategory: 'Recommended',
    title: 'Senior Vice President — Private Equity & M&A Financial Modeling (CFA)',
    company: 'BlackRock Alternatives & Capital Markets',
    companyLogo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY / San Francisco, CA (Hybrid)',
    hub: 'New York, NY',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 33,
    salaryRange: '$210,000 - $340,000 / yr (Base + Performance Carry/Bonus)',
    easyApply: true,
    requiredProductExperience: ['CFA Charterholder / Series 79 & 63', '3-Statement LBO, DCF & M&A Accretion/Dilution'],
    description: 'Lead buy-side due diligence, 3-statement LBO and DCF valuation modeling, debt capital structuring, and portfolio board governance for middle-market software and infrastructure investments.',
    requirements: ['6+ years Investment Banking (M&A/LevFin) or Private Equity investment experience', 'CFA Charterholder or top-tier MBA preferred', 'Mastery of Bloomberg Terminal, Capital IQ, and complex Excel financial modeling'],
    languageRequirement: 'English',
    applyUrl: 'https://careers.blackrock.com/',
    source: 'BlackRock Talent Portal',
    tags: ['Investment Banking & PE', 'CFA', 'M&A Valuation', 'Recommended']
  },
  {
    id: 'fin_3',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'finance_accounting',
    domainCategory: 'Full-time',
    title: 'Director of FP&A, Strategic Finance & SaaS ARR Forecasting',
    company: 'Deloitte Strategic Finance & Advisory',
    companyLogo: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=100&auto=format&fit=crop&q=80',
    location: 'Austin, TX / Boston, MA / Remote',
    hub: 'Austin, TX',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '2 days ago',
    applicantsCount: 22,
    salaryRange: '$165,000 - $215,000 / yr',
    easyApply: true,
    requiredProductExperience: ['Anaplan / Adaptive Insights FP&A', 'SaaS Cohort Unit Economics (NRR, LTV/CAC, Rule of 40)'],
    description: 'Partner with C-suite leadership to drive annual operating plans (AOP), rolling 18-month cash flow forecasts, pricing strategy, and investor board decks.',
    requirements: ['7+ years Corporate FP&A, Strategic Finance, or Management Consulting', 'Advanced proficiency in Anaplan, Pigments, SQL, and Tableau/PowerBI', 'CPA or MBA a strong asset'],
    languageRequirement: 'English',
    applyUrl: 'https://apply.deloitte.com/',
    source: 'Deloitte Careers',
    tags: ['FP&A & Risk Audit', 'Strategic Finance', 'Full-time']
  },

  // =========================================================================
  // INTERNATIONAL HUBS (GHANA, GERMANY, UK, NIGERIA, CANADA, JAPAN, UAE, INDIA, AUSTRALIA)
  // =========================================================================
  {
    id: 'gh_1',
    countryCode: 'GH',
    countryName: 'Ghana',
    professionEnclave: 'tech_cybersecurity',
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
    description: 'Lead enterprise security operations, automated pentesting deployments, and cloud compliance for financial institutions across West Africa.',
    requirements: ['8+ years experience in network security and cloud infrastructure', 'Familiarity with Bank of Ghana Cyber & Information Security Directive (CISD)', 'AWS / Azure Certified Security Specialist'],
    languageRequirement: 'English (Official) · Twi proficiency a plus',
    applyUrl: 'https://expedite-consults.vercel.app/launchpad',
    source: 'Expedite Direct ATS',
    tags: ['Accra', 'Cybersecurity', 'CISD', 'FinTech', 'Recommended']
  },
  {
    id: 'gh_2',
    countryCode: 'GH',
    countryName: 'Ghana',
    professionEnclave: 'tech_software',
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
    requirements: ['5+ years experience in React, Node.js, and TypeScript', 'Integration with GhIPSS', 'PostgreSQL and Redis caching'],
    languageRequirement: 'English (Fluent)',
    applyUrl: 'https://hubtel.com/careers',
    source: 'Hubtel Talent Portal',
    tags: ['FinTech', 'MoMo', 'Next.js', 'Accra', 'Full-Stack & Systems']
  },
  {
    id: 'gh_3',
    countryCode: 'GH',
    countryName: 'Ghana',
    professionEnclave: 'finance_accounting',
    title: 'Head of Financial Control & Banking Audit (ICAG / ACCA)',
    company: 'Stanbic Bank Ghana',
    companyLogo: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&auto=format&fit=crop&q=80',
    location: 'Accra (Ridge Financial District)',
    hub: 'Accra (Airport City / East Legon)',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '3 days ago',
    applicantsCount: 9,
    salaryRange: 'GH₵ 550,000 - GH₵ 780,000 / yr',
    easyApply: true,
    description: 'Direct IFRS 9 financial reporting, Bank of Ghana prudential regulatory filings, and enterprise risk audits.',
    requirements: ['Chartered Accountant (ICAG, ACCA, or CPA)', '10+ years in commercial banking finance leadership', 'IFRS and Basel III capital adequacy mastery'],
    languageRequirement: 'English (Business Fluent)',
    applyUrl: 'https://www.stanbicbank.com.gh/careers',
    source: 'Standard Bank Group Careers',
    tags: ['Banking', 'CPA & Corporate Accounting', 'IFRS', 'Accra']
  },
  {
    id: 'gh_4',
    countryCode: 'GH',
    countryName: 'Ghana',
    professionEnclave: 'agriculture_natural_resources',
    title: 'AI & Precision Agronomy Lead (AgriTech & Supply Chain)',
    company: 'Farmerline Labs',
    companyLogo: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=100&auto=format&fit=crop&q=80',
    location: 'Kumasi (Tech City) / Remote Ghana',
    hub: 'Kumasi (Tech Hub)',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '2 days ago',
    applicantsCount: 21,
    salaryRange: 'GH₵ 220,000 - GH₵ 310,000 / yr',
    easyApply: true,
    description: 'Deploy predictive machine learning models for cocoa & grain yield forecasting, soil mapping, and supply chain traceability across West Africa.',
    requirements: ['Agronomy or Data Science degree', 'GeoJSON geospatial satellite imagery analysis', 'Fluency in English and Twi preferred'],
    languageRequirement: 'English & Twi',
    applyUrl: 'https://farmerline.co/careers',
    source: 'Farmerline ATS',
    tags: ['Agronomy & Crops', 'Precision Ag', 'Kumasi', 'AgriTech']
  },
  {
    id: 'gh_5',
    countryCode: 'GH',
    countryName: 'Ghana',
    professionEnclave: 'trades_construction',
    title: 'Senior Civil & Commercial Construction Site Superintendent',
    company: 'WBHO / Micheletti Civil Engineering Ghana',
    companyLogo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    location: 'Accra (Airport City) / Tema',
    hub: 'Accra (Airport City / East Legon)',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 16,
    salaryRange: 'GH₵ 280,000 - GH₵ 420,000 / yr',
    easyApply: true,
    description: 'Supervise structural reinforced concrete, heavy timber formwork, and MEP installations for commercial high-rise and industrial port facilities.',
    requirements: ['8+ years commercial construction & structural trade supervision', 'GhIE or master trade certification', 'AutoCAD / Procore project scheduling'],
    languageRequirement: 'English',
    applyUrl: 'https://www.wbho.co.za/careers/',
    source: 'WBHO Careers',
    tags: ['General Contracting', 'Construction', 'Accra', 'Full-time']
  },
  {
    id: 'de_1',
    countryCode: 'DE',
    countryName: 'Germany',
    professionEnclave: 'tech_cybersecurity',
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
    requirements: ['Expertise in AWS/Azure Cloud Security', 'Knowledge of BSI IT-Grundschutz & ISO 27001', 'Industrial IoT / OT security experience'],
    languageRequirement: 'Deutsch (C1/Fluent) & English (B2+)',
    applyUrl: 'https://jobs.siemens-energy.com',
    source: 'Siemens Careers',
    tags: ['Munich', 'BSI', 'NIS2', 'Zero Trust', 'Cybersecurity']
  },
  {
    id: 'de_2',
    countryCode: 'DE',
    countryName: 'Germany',
    professionEnclave: 'automotive_mechanics',
    title: 'Lead High-Voltage EV Powertrain & Prototype Diagnostic Meister',
    company: 'BMW Group Autonomous & EV Labs',
    companyLogo: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=100&auto=format&fit=crop&q=80',
    location: 'Munich (München Tech)',
    hub: 'Munich (München Tech)',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '2 days ago',
    applicantsCount: 19,
    salaryRange: '€88,000 - €118,000 / yr',
    easyApply: true,
    description: 'Commission and diagnose Neue Klasse 800V electric drive units, solid-state battery prototypes, and CAN-FD/Automotive Ethernet bus systems.',
    requirements: ['Kfz-Meister or Hochvolt-Experte Stufe 3E (DGUV 209-093)', 'Deep expertise in BMW ISTA, Esys, and PicoScope diagnostics'],
    languageRequirement: 'Deutsch & English',
    applyUrl: 'https://www.bmwgroup.jobs',
    source: 'BMW Group Careers',
    tags: ['EV Powertrain', 'Master Diagnostics', 'Munich', 'Automotive']
  },
  {
    id: 'gb_1',
    countryCode: 'GB',
    countryName: 'United Kingdom',
    professionEnclave: 'tech_cybersecurity',
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
    requirements: ['Proven track record in FinTech security', 'Deep knowledge of OAuth 2.0, mTLS, and HSM tokenization'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.revolut.com/careers',
    source: 'Lever ATS',
    tags: ['London', 'FinTech', 'AppSec', 'Zero Trust', 'Cybersecurity']
  },
  {
    id: 'ng_1',
    countryCode: 'NG',
    countryName: 'Nigeria',
    professionEnclave: 'tech_software',
    title: 'VP of Engineering & Payment Infrastructure',
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
    description: 'Scale payment infrastructure across 34 African nations, lead distributed engineering teams, and ensure 99.99% settlement uptime.',
    requirements: ['10+ years engineering leadership in payments/banking', 'Multi-region AWS & GCP infrastructure'],
    languageRequirement: 'English (Official)',
    applyUrl: 'https://flutterwave.com/careers',
    source: 'Greenhouse ATS',
    tags: ['Lagos', 'FinTech', 'Payments', 'Full-Stack & Systems']
  },
  {
    id: 'ca_1',
    countryCode: 'CA',
    countryName: 'Canada',
    professionEnclave: 'tech_cybersecurity',
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
    requirements: ['7+ years experience in Ruby, Go, or Python', 'Kubernetes cluster governance and Google Cloud IAM'],
    languageRequirement: 'English (Fluent) · French is a plus',
    applyUrl: 'https://www.shopify.com/careers',
    source: 'SmartRecruiters ATS',
    tags: ['Toronto', 'Shopify', 'GCP', 'eBPF', 'Cybersecurity']
  },
  {
    id: 'ae_1',
    countryCode: 'AE',
    countryName: 'United Arab Emirates',
    professionEnclave: 'tech_cybersecurity',
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
    requirements: ['12+ years in enterprise security architecture', 'Knowledge of UAE NESA / ISR compliance frameworks'],
    languageRequirement: 'English (Fluent) · Arabic a strong asset',
    applyUrl: 'https://www.dubaifuture.ae/careers',
    source: 'Dubai Government Careers',
    tags: ['Dubai', 'TaxFree', 'ZeroTrust', 'Cybersecurity']
  },
  // =========================================================================
  // 16. MANUFACTURING, PRECISION MACHINING, TEXTILE & PACKAGING (manufacturing_industrial)
  // =========================================================================
  {
    id: 'mfg_1',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'manufacturing_industrial',
    domainCategory: 'Recommended',
    title: 'Lead 5-Axis CNC Programmer & Master Tool-and-Die Maker',
    company: 'Haas Automation & Precision Aero-Tooling',
    companyLogo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&auto=format&fit=crop&q=80',
    location: 'Austin, TX (On-site)',
    hub: 'Austin, TX',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '1 hour ago',
    applicantsCount: 7,
    salaryRange: '$94,000 - $132,000 / yr',
    easyApply: true,
    requiredProductExperience: ['Mastercam 5-Axis & Fanuc G-Code', 'NIMS Certification & Zeiss CMM Metrology'],
    description: 'Program and set up 5-axis CNC machining centers (DMG MORI / Haas UMC-1000) and Wire EDM cells for tight-tolerance (±0.0002") titanium and Inconel tooling dies.',
    requirements: ['6+ years 5-axis CNC programming in Mastercam or Siemens NX', 'ASME Y14.5 GD&T blueprint mastery & CMM inspection', 'No 4-year degree required — NIMS or Journeyman Toolmaker card valued'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.haascnc.com/about/careers.html',
    source: 'Haas Automation Careers',
    tags: ['CNC Machining', 'Tool & Die', '5-Axis', 'Hands-On', 'STARs Friendly']
  },
  {
    id: 'mfg_2',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'manufacturing_industrial',
    domainCategory: 'Operations',
    title: 'Industrial Robotics Maintenance & ASNT Level III NDT Specialist',
    company: 'FANUC America & Rockwell Automation Partner Plant',
    companyLogo: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=100&auto=format&fit=crop&q=80',
    location: 'Seattle, WA (On-site)',
    hub: 'Seattle, WA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '3 hours ago',
    applicantsCount: 9,
    salaryRange: '$98,000 - $138,000 / yr',
    easyApply: true,
    requiredProductExperience: ['Allen-Bradley Studio 5000 PLC & FANUC R-30iB', 'ASNT Level II/III Ultrasonic Phased-Array NDT'],
    description: 'Maintain 6-axis robotic welding/palletizing cells, troubleshoot Allen-Bradley ControlLogix PLCs, and lead non-destructive ultrasonic/radiographic weld testing.',
    requirements: ['5+ years industrial robotics or PLC automation maintenance', 'ASNT NDT Level II/III certification in UT/RT/MT', 'Proficiency with servo drives, pneumatics, and Lean 5S'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.fanucamerica.com/careers',
    source: 'FANUC Careers',
    tags: ['Robotics', 'PLC Automation', 'NDT Testing', 'Quality Control']
  },
  {
    id: 'mfg_3',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'manufacturing_industrial',
    domainCategory: 'Craft & Production',
    title: 'Scientific Injection Molding, 3D Additive & High-Speed Packaging Lead',
    company: 'Corning Advanced Materials & Amcor Packaging',
    companyLogo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY (On-site)',
    hub: 'New York, NY',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '5 hours ago',
    applicantsCount: 11,
    salaryRange: '$86,000 - $118,000 / yr',
    easyApply: true,
    requiredProductExperience: ['RJG Master Molder I/II', 'EOS DMLS Metal 3D Printing & High-Speed Cartoning'],
    description: 'Lead scientific injection molding cavity-pressure optimization, metal laser sintering (DMLS) additive builds, glass/ceramic kiln schedules, and automated packaging lines.',
    requirements: ['RJG Scientific Molding certification or 5+ years process technician experience', 'Experience with KraussMaffei/Engel presses or industrial packaging machinery'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.corning.com/worldwide/en/careers.html',
    source: 'Corning Careers',
    tags: ['Injection Molding', '3D Printing', 'Packaging', 'Glass & Ceramics']
  },
  {
    id: 'mfg_4',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'manufacturing_industrial',
    domainCategory: 'Lifecycle & Craft',
    title: 'Master Footwear/Leather Pattern Technologist & MRO Equipment Refurbisher',
    company: 'New Balance Domestic Manufacturing & Caterpillar Reman',
    companyLogo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=80',
    location: 'Boston, MA (On-site)',
    hub: 'Boston, MA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '6 hours ago',
    applicantsCount: 8,
    salaryRange: '$82,000 - $114,000 / yr',
    easyApply: true,
    requiredProductExperience: ['Goodyear Welt & 3D Footwear Last Grading', 'ISO 55000 Asset Lifecycle & Spare Parts MRO'],
    description: 'Supervise domestic leather/footwear production stitching lines, industrial sewing machine calibration, and MRO industrial equipment lifecycle refurbishment.',
    requirements: ['5+ years industrial textile/leather/footwear production or MRO machinery overhaul', 'Strong mechanical aptitude with Juki/Pfaff industrial stitchers and hydraulic presses'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://jobs.newbalance.com/',
    source: 'New Balance Domestic Manufacturing',
    tags: ['Footwear & Leather', 'Textile Tech', 'Equipment Lifecycle', 'Hands-On']
  },

  // =========================================================================
  // 17. ENERGY, UTILITIES, MINING, WATER & SANITATION (energy_utilities_environment)
  // =========================================================================
  {
    id: 'energy_1',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'energy_utilities_environment',
    domainCategory: 'Recommended',
    title: 'Lead GWO Wind Turbine, NABCEP Solar & Megapack Battery Technician',
    company: 'NextEra Energy Resources & Ørsted Offshore Wind',
    companyLogo: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=100&auto=format&fit=crop&q=80',
    location: 'Austin, TX (On-site)',
    hub: 'Austin, TX',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '2 hours ago',
    applicantsCount: 8,
    salaryRange: '$96,000 - $135,000 / yr',
    easyApply: true,
    requiredProductExperience: ['GWO Basic Safety & Advanced Rescue', 'NABCEP PV Installation & 1500V DC Utility BESS'],
    description: 'Perform up-tower pitch/yaw hydraulic maintenance on 5MW wind turbines, commission 1500V DC utility solar arrays, and balance utility-scale lithium-iron-phosphate (LFP) battery storage.',
    requirements: ['GWO Working at Heights certification or NABCEP PV Installer credential', 'NFPA 70E high-voltage arc-flash qualification', 'Comfort climbing 300ft turbine towers'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://jobs.nexteraenergy.com/',
    source: 'NextEra Energy Careers',
    tags: ['Wind Turbine', 'Solar PV', 'Battery Storage', 'Renewable Energy']
  },
  {
    id: 'energy_2',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'energy_utilities_environment',
    domainCategory: 'Grid & Utilities',
    title: 'NERC Certified Electrical Grid Operator & 500kV Substation Relay Tech',
    company: 'Duke Energy & Dominion High-Voltage Grid Ops',
    companyLogo: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=100&auto=format&fit=crop&q=80',
    location: 'Washington, DC / MD / VA',
    hub: 'Washington, DC / MD / VA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '4 hours ago',
    applicantsCount: 5,
    salaryRange: '$115,000 - $156,000 / yr',
    easyApply: true,
    requiredProductExperience: ['NERC System Operator Certification', 'Schweitzer (SEL) Protective Relays & Doble Transformer Testing'],
    description: 'Direct real-time 500kV/230kV transmission switching, test SF6 circuit breakers and SEL protective relays, and coordinate hydroelectric/nuclear generation dispatch.',
    requirements: ['NERC Transmission/Balancing Operator certification or 5+ years substation relay experience', 'Proficiency with Doble power-factor testing and SCADA EMS'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.duke-energy.com/our-company/careers',
    source: 'Duke Energy Careers',
    tags: ['Electrical Grid', 'Substation Tech', 'NERC Certified', 'Power Plant']
  },
  {
    id: 'energy_3',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'energy_utilities_environment',
    domainCategory: 'Mining & Geology',
    title: 'Senior Geotechnical Mining Technician, Blasting Lead & Core Driller',
    company: 'Freeport-McMoRan & Newmont Mineral Exploration',
    companyLogo: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=100&auto=format&fit=crop&q=80',
    location: 'US Remote / Western Field Sites',
    hub: 'US Remote',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '5 hours ago',
    applicantsCount: 10,
    salaryRange: '$104,000 - $144,000 / yr',
    easyApply: true,
    requiredProductExperience: ['MSHA Part 48 Surface/Underground', 'Electronic Detonator Blasting & Diamond Core Logging'],
    description: 'Supervise diamond core drilling rigs, design controlled electronic blast patterns, monitor underground mine ventilation and slope stability, and coordinate land reclamation.',
    requirements: ['Current MSHA Part 48 certification & State Blaster License', '5+ years in hard-rock mining, quarry operations, or geotechnical drilling'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.fcx.com/careers',
    source: 'Freeport-McMoRan Careers',
    tags: ['Mining', 'Drilling & Blasting', 'Geotechnical', 'MSHA']
  },
  {
    id: 'energy_4',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'energy_utilities_environment',
    domainCategory: 'Water & Sanitation',
    title: 'Grade IV Water/Wastewater Plant Operator & HazMat Spill Response Lead',
    company: 'Veolia North America & Clean Harbors Environmental',
    companyLogo: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=100&auto=format&fit=crop&q=80',
    location: 'Boston, MA (On-site)',
    hub: 'Boston, MA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '6 hours ago',
    applicantsCount: 7,
    salaryRange: '$88,000 - $122,000 / yr',
    easyApply: true,
    requiredProductExperience: ['Grade IV Water/Wastewater Operator License', 'OSHA 40-Hour HAZWOPER & NASSCO Sewer CCTV'],
    description: 'Operate municipal membrane bioreactor (MBR) water treatment plants, oversee NASSCO robotic sewer inspections, and lead hazardous waste decontamination & recycling.',
    requirements: ['State Grade III/IV Water or Wastewater Operator License', '40-Hour HAZWOPER certification and SCADA pump station familiarity'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.veolianorthamerica.com/careers',
    source: 'Veolia Careers',
    tags: ['Water Treatment', 'Wastewater', 'Hazardous Waste', 'Environmental']
  },

  // =========================================================================
  // 18. SCIENCE, LABORATORY, METROLOGY & FIELD RESEARCH (science_laboratory_research)
  // =========================================================================
  {
    id: 'sci_1',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'science_laboratory_research',
    domainCategory: 'Recommended',
    title: 'Lead cGMP Bioprocess Manufacturing & HPLC Analytical Lab Technician',
    company: 'Genentech (Roche) & Thermo Fisher Scientific',
    companyLogo: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=100&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA (On-site)',
    hub: 'San Francisco, CA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '2 hours ago',
    applicantsCount: 12,
    salaryRange: '$89,000 - $126,000 / yr',
    easyApply: true,
    requiredProductExperience: ['cGMP Cleanroom & 2,000L Single-Use Bioreactors', 'Agilent HPLC / GC-MS & LIMS'],
    description: 'Execute upstream mammalian cell fermentation in ISO Class 5 cleanrooms, run HPLC/GC-MS purity assays, and maintain 21 CFR Part 11 electronic batch records.',
    requirements: ['Associate degree, biotech certificate, or 3+ years cGMP laboratory experience (STARs welcome)', 'Hands-on aseptic technique, chromatography, or ELISA/qPCR'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.gene.com/careers',
    source: 'Genentech Careers',
    tags: ['Biotech Lab', 'cGMP Pharma', 'HPLC', 'Microbiology', 'STARs Friendly']
  },
  {
    id: 'sci_2',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'science_laboratory_research',
    domainCategory: 'Materials & Forensics',
    title: 'ISO 17025 Metallurgical Materials Tester & Forensic Trace Technician',
    company: 'Element Materials Technology & Bode Cellmark Forensics',
    companyLogo: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=100&auto=format&fit=crop&q=80',
    location: 'Washington, DC / MD / VA',
    hub: 'Washington, DC / MD / VA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '4 hours ago',
    applicantsCount: 8,
    salaryRange: '$85,000 - $118,000 / yr',
    easyApply: true,
    requiredProductExperience: ['Instron Tensile/Charpy Metallurgy & SEM', 'ISO 17025 NIST Traceable Metrology Calibration'],
    description: 'Conduct destructive/non-destructive metallurgical failure analysis, SEM fractography, forensic trace evidence spectroscopy, and NIST-traceable instrument calibration.',
    requirements: ['3+ years in materials testing, chemical processing, or forensic crime lab operations', 'Familiarity with ASTM mechanical testing standards and ISO/IEC 17025 quality systems'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.element.com/careers',
    source: 'Element Materials Careers',
    tags: ['Materials Testing', 'Forensic Lab', 'Metrology', 'Chemical Tech']
  },
  {
    id: 'sci_3',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'science_laboratory_research',
    domainCategory: 'Field & Heritage Science',
    title: 'Field Archaeologist, Soil/Water Analyst & Museum Artifact Conservator',
    company: 'Smithsonian Institution & AECOM Cultural Resources',
    companyLogo: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY (Hybrid)',
    hub: 'New York, NY',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '7 hours ago',
    applicantsCount: 9,
    salaryRange: '$78,000 - $112,000 / yr',
    easyApply: true,
    requiredProductExperience: ['Section 106 Archaeological Field Survey & GIS', 'XRF Artifact Conservation & ICP-MS Soil/Water Analysis'],
    description: 'Lead Phase I–III archaeological excavations, perform XRF non-destructive pigment/metal conservation on museum collections, and analyze environmental soil/water cores.',
    requirements: ['Field school + 3 years CRM archaeological fieldwork or museum conservation experience', 'Proficiency with Leica total stations, ArcGIS Field Maps, and archival handling'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.si.edu/ofi',
    source: 'Smithsonian Careers',
    tags: ['Archaeology', 'Museum Conservation', 'Soil & Water Lab', 'Heritage']
  },

  // =========================================================================
  // 19. AVIATION, AEROSPACE, MARITIME & UNDERWATER OPS (aviation_aerospace_maritime)
  // =========================================================================
  {
    id: 'aero_1',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'aviation_aerospace_maritime',
    domainCategory: 'Recommended',
    title: 'Lead FAA A&P Aircraft Maintenance Engineer & Avionics Inspector (IA)',
    company: 'Delta TechOps & Gulfstream Aerospace Service',
    companyLogo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=100&auto=format&fit=crop&q=80',
    location: 'Seattle, WA (On-site)',
    hub: 'Seattle, WA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '1 hour ago',
    applicantsCount: 9,
    salaryRange: '$108,000 - $152,000 / yr',
    easyApply: true,
    requiredProductExperience: ['FAA Airframe & Powerplant (A&P) License', 'GE90 / LEAP Turbofan Borescope & Honeywell Primus Avionics'],
    description: 'Perform heavy C-check airframe inspections, high-bypass turbofan hot-section borescopes, and RVSM/autopilot avionics troubleshooting on widebody commercial aircraft.',
    requirements: ['Active FAA Airframe & Powerplant (A&P) certificate (Inspection Authorization IA preferred)', '5+ years FAR Part 121/145 line or base maintenance experience'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.delta.com/us/en/careers/overview',
    source: 'Delta TechOps Careers',
    tags: ['Aircraft Mechanic', 'FAA A&P', 'Avionics', 'Aviation']
  },
  {
    id: 'aero_2',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'aviation_aerospace_maritime',
    domainCategory: 'Space & Unmanned',
    title: 'Spacecraft Integration Technician & FAA Part 107 LiDAR Drone Lead',
    company: 'SpaceX Starship Build & Blue Origin Integration',
    companyLogo: 'https://images.unsplash.com/photo-1517976487468-f20514c44f53?w=100&auto=format&fit=crop&q=80',
    location: 'Austin, TX (On-site)',
    hub: 'Austin, TX',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '3 hours ago',
    applicantsCount: 14,
    salaryRange: '$102,000 - $145,000 / yr',
    easyApply: true,
    requiredProductExperience: ['NASA-STD-8739 Crimping/Harnessing & AS9100', 'Cryogenic Orbital Valve Rigging & Part 107 UAV LiDAR'],
    description: 'Assemble flight-critical liquid rocket propulsion harnesses, execute cleanroom satellite integration, and pilot heavy-lift UAVs for aerial LiDAR range telemetry.',
    requirements: ['4+ years aerospace integration, military aviation (MOS/AFSC), or composite structure fabrication', 'IPC/WHMA-A-620 or NASA-STD-8739 certification a strong plus'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.spacex.com/careers',
    source: 'SpaceX Careers',
    tags: ['Spacecraft Tech', 'Aerospace', 'Drone Pilot', 'Veteran Friendly']
  },
  {
    id: 'aero_3',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'aviation_aerospace_maritime',
    domainCategory: 'Maritime & Underwater',
    title: 'ADCI Commercial Diver, Underwater Welder & USCG Marine Engineer',
    company: 'Oceaneering International & Crowley Maritime Corp',
    companyLogo: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&auto=format&fit=crop&q=80',
    location: 'Boston, MA / Offshore Rotation',
    hub: 'Boston, MA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '4 hours ago',
    applicantsCount: 6,
    salaryRange: '$112,000 - $165,000 / yr',
    easyApply: true,
    requiredProductExperience: ['ADCI Commercial Diver Card & AWS D3.6 Underwater Welding', 'USCG STCW Marine Diesel & Port Gantry Operations'],
    description: 'Execute surface-supplied mixed-gas subsea structural repairs, AWS D3.6 wet/hyperbaric welding, ROV pipeline inspections, and marine propulsion overhauls.',
    requirements: ['Active ADCI Commercial Diver certification or USCG Merchant Mariner Credential (MMC)', 'TWIC card, current dive medical physical, and subsea NDT proficiency'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.oceaneering.com/careers/',
    source: 'Oceaneering Careers',
    tags: ['Commercial Diver', 'Underwater Welder', 'Maritime', 'Shipbuilding']
  },

  // =========================================================================
  // 20. TELECOM, ELECTRONICS REPAIR & FRONTIER TECH (telecom_digital_infrastructure)
  // =========================================================================
  {
    id: 'telecom_1',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'telecom_digital_infrastructure',
    domainCategory: 'Recommended',
    title: 'Lead FOA Fiber-Optic Splicer, 5G Tower Climber & AI Data Center Tech',
    company: 'Equinix Hyperscale & Crown Castle Fiber Infrastructure',
    companyLogo: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=100&auto=format&fit=crop&q=80',
    location: 'Washington, DC / MD / VA',
    hub: 'Washington, DC / MD / VA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '1 hour ago',
    applicantsCount: 8,
    salaryRange: '$95,000 - $134,000 / yr',
    easyApply: true,
    requiredProductExperience: ['FOA CFOT Ribbon Fusion Splicing & EXFO OTDR', 'Liquid-Cooled NVIDIA GPU Clusters & 480V UPS Systems'],
    description: 'Splice 864-count long-haul dark fiber trunks, perform bi-directional OTDR/CD/PMD testing, commission 5G C-band tower radios, and maintain liquid-cooled AI data center pods.',
    requirements: ['FOA CFOT / BICSI Technician credential or NWSA TTT-1/TTT-2 tower certification', 'Hands-on experience with Fujikura fusion splicers, EXFO OTDRs, and 3-phase PDU/UPS systems'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://careers.equinix.com/',
    source: 'Equinix Careers',
    tags: ['Fiber Optics', 'Data Center Tech', 'Tower Climber', '5G Telecom']
  },
  {
    id: 'telecom_2',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'telecom_digital_infrastructure',
    domainCategory: 'Precision Repair',
    title: 'IPC-7711 PCB Micro-Soldering Specialist, Semiconductor & Horology Tech',
    company: 'ASML Lithography Service & Rolex Watchmaking Atelier',
    companyLogo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY (On-site)',
    hub: 'New York, NY',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '3 hours ago',
    applicantsCount: 7,
    salaryRange: '$92,000 - $130,000 / yr',
    easyApply: true,
    requiredProductExperience: ['IPC-7711/7721 BGA Micro-Soldering & Oscilloscopes', 'EUV Lithography Optics / AWCI Mechanical Horology'],
    description: 'Perform component-level multilayer PCB BGA reballing under stereo microscopes, calibrate cleanroom semiconductor wafer steppers, and service precision mechanical instruments.',
    requirements: ['IPC-7711/7721 rework certification, military avionics 2M micro-miniature repair, or AWCI/WOSTEP training', 'Mastery of thermal imaging fault isolation, logic analyzers, and schematic boardviews'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.asml.com/en/careers',
    source: 'ASML / Precision Atelier Careers',
    tags: ['Micro-Soldering', 'PCB Repair', 'Semiconductor', 'Horology']
  },
  {
    id: 'telecom_3',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'telecom_digital_infrastructure',
    domainCategory: 'Emerging Frontier',
    title: '3D LiDAR Digital Twin Specialist, Autonomous Fleet & Battery Recycling Tech',
    company: 'Waymo Fleet Ops & Redwood Materials Circular Battery',
    companyLogo: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=100&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA (Hybrid)',
    hub: 'San Francisco, CA',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '4 hours ago',
    applicantsCount: 11,
    salaryRange: '$105,000 - $146,000 / yr',
    easyApply: true,
    requiredProductExperience: ['NavVis / Leica Terrestrial LiDAR Scan-to-BIM', 'Autonomous LiDAR/Radar Calibration & Li-Ion Hydrometallurgy'],
    description: 'Capture millimeter-accurate 3D reality point clouds for industrial digital twins, calibrate solid-state LiDAR/radar suites on autonomous EVs, and oversee battery black-mass recovery.',
    requirements: ['3+ years in reality capture (Matterport/Leica/Faro), autonomous vehicle operations, or battery sustainability', 'Familiarity with Revit Scan-to-BIM, ROS2 diagnostics, or ISO 14064 carbon accounting'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://waymo.com/careers/',
    source: 'Waymo & Redwood Careers',
    tags: ['Digital Twin', 'Autonomous Vehicles', 'Battery Recycling', '3D Scanning']
  },

  // =========================================================================
  // ADDITIONAL SPECIALIZED ROLES ACROSS EXISTING ENCLAVES (Categories 1–42)
  // =========================================================================
  {
    id: 'trade_mep_bim_6',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'trades_construction',
    domainCategory: 'MEP & Architecture',
    title: 'Master HVAC/R Chiller Tech, QEI Elevator Mechanic & BIM Quantity Surveyor',
    company: 'Trane Commercial MEP & Otis Elevator Engineering',
    companyLogo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY (On-site)',
    hub: 'New York, NY',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '2 hours ago',
    applicantsCount: 8,
    salaryRange: '$104,000 - $146,000 / yr',
    easyApply: true,
    requiredProductExperience: ['EPA 608 Universal & ASME A17.1 QEI Elevator', 'Revit BIM Clash Detection & RICS Quantity Surveying'],
    description: 'Commission centrifugal magnetic-bearing chillers, traction elevator hoistways, NFPA 13 fire sprinkler risers, and Revit BIM quantity takeoffs for high-rise commercial towers.',
    requirements: ['EPA 608 Universal, NEIEP/QEI elevator license, or RICS/Revit BIM coordination credentials', 'OSHA 30 and BACnet building automation experience'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://careers.tranetechnologies.com/',
    source: 'Trane & Otis Careers',
    tags: ['HVAC/R', 'Elevator Tech', 'BIM & Quantity Surveyor', 'Fire Sprinkler']
  },
  {
    id: 'auto_rail_customs_6',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'automotive_mechanics',
    domainCategory: 'Heavy Machinery & Rail',
    title: 'CAT Heavy Equipment Mechanic, FRA Rail Signal Tech & Licensed Customs Broker',
    company: 'Caterpillar Dealer Network & Union Pacific Rail / Maersk Cold-Chain',
    companyLogo: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=100&auto=format&fit=crop&q=80',
    location: 'Seattle, WA (On-site)',
    hub: 'Seattle, WA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '3 hours ago',
    applicantsCount: 7,
    salaryRange: '$96,000 - $136,000 / yr',
    easyApply: true,
    requiredProductExperience: ['CAT Electronic Technician (ET) & Hydraulic Excavators', 'FRA Positive Train Control (PTC) & US Customs Broker (LCB)'],
    description: 'Overhaul Caterpillar D10 dozers and hydraulic excavators, maintain FRA Positive Train Control (PTC) rail signals and rolling stock, and coordinate port cold-chain customs clearance.',
    requirements: ['5+ years heavy equipment hydraulics, locomotive diesel-electric, or licensed customs brokerage', 'ASE Master Medium/Heavy Truck or FRA Part 236 signal qualification'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.caterpillar.com/en/careers.html',
    source: 'Caterpillar & Rail Careers',
    tags: ['Heavy Equipment', 'Rail Signal Tech', 'Customs Broker', 'Cold-Chain']
  },
  {
    id: 'agri_hydro_wildlife_6',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'agriculture_natural_resources',
    domainCategory: 'Food Science & Wildlife',
    title: 'Vertical Hydroponics Lead, IFT Food Technologist & Wildlife Vet Tech (CVT)',
    company: 'Plenty Unlimited Vertical Farms & Cargill Food Science',
    companyLogo: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=100&auto=format&fit=crop&q=80',
    location: 'Austin, TX (On-site)',
    hub: 'Austin, TX',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '4 hours ago',
    applicantsCount: 9,
    salaryRange: '$84,000 - $118,000 / yr',
    easyApply: true,
    requiredProductExperience: ['Priva Climate/Hydroponic Dosing & DJI Multispectral Drones', 'HACCP / SQF Food Safety & CVT Wildlife Telemetry'],
    description: 'Manage automated vertical hydroponic nutrient-film towers, lead food fermentation & sensory shelf-life trials, and support wildlife habitat restoration & veterinary care.',
    requirements: ['Experience in controlled-environment agriculture (CEA), HACCP food science, or CVT veterinary/forestry fieldwork'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://careers.cargill.com/',
    source: 'Plenty & Cargill Careers',
    tags: ['Hydroponics', 'Food Science', 'Ag-Drone', 'Wildlife & Vet Tech']
  },
  {
    id: 'health_allied_bmet_6',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'healthcare_medicine',
    domainCategory: 'Allied Health & BMET',
    title: 'Surgical Technologist (CST), ARRT Radiographer, Paramedic & BMET Engineer',
    company: 'Mayo Clinic & GE HealthCare Clinical Engineering',
    companyLogo: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=100&auto=format&fit=crop&q=80',
    location: 'Boston, MA (On-site)',
    hub: 'Boston, MA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '2 hours ago',
    applicantsCount: 11,
    salaryRange: '$88,000 - $126,000 / yr',
    easyApply: true,
    requiredProductExperience: ['NBSTSA Surgical Tech / ARRT MRI-CT / NREMT Paramedic', 'AAMI CBET Biomedical Equipment & CRCST Sterile Processing'],
    description: 'Scrub complex robotic/orthopedic surgical cases, operate 3T MRI/CT scanners, calibrate ICU ventilators & linear accelerators (BMET), and manage sterile processing & ICD-10 coding.',
    requirements: ['Active CST, ARRT, NREMT Paramedic, AAMI CBET, or AAPC CPC certification', 'BLS/ACLS and hospital EHR/PACS proficiency'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://jobs.mayoclinic.org/',
    source: 'Mayo Clinic & GE HealthCare',
    tags: ['Surgical Tech', 'Radiology', 'Paramedic EMS', 'Biomedical BMET']
  },
  {
    id: 'wellness_turf_funeral_6',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'personal_services_wellness',
    domainCategory: 'Wellness, Sports & Memorial',
    title: 'Licensed Massage Therapist, Sports Turf Superintendent & Funeral Director',
    company: 'Equinox Tier-X Spa, PGA Tour Agronomy & Service Corporation Intl',
    companyLogo: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY (On-site)',
    hub: 'New York, NY',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '5 hours ago',
    applicantsCount: 8,
    salaryRange: '$82,000 - $120,000 / yr',
    easyApply: true,
    requiredProductExperience: ['NCBTMB Massage / OSHA Bloodborne Tattoo Artist', 'GCSAA Sports Turf Agronomy & NFDA Funeral Director License'],
    description: 'Deliver neuromuscular massage & medical spa aesthetics, manage stadium hybrid-turf rootzone agronomy & outdoor mountain guiding, or direct licensed memorial & bereavement services.',
    requirements: ['Active State LMT, Cosmetology/Body Art license, GCSAA turf credential, or State Funeral Director license'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://careers.equinox.com/',
    source: 'Equinox & Specialty Service Careers',
    tags: ['Massage & Spa', 'Tattoo & Nail Art', 'Sports Turf', 'Funeral Director']
  },
  {
    id: 'hosp_stage_pest_6',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'culinary_hospitality_events',
    domainCategory: 'Live Events & Culinary Craft',
    title: 'ETCP Arena Stage Rigger, Live FOH Sound Engineer & Artisan Baker/Butcher',
    company: 'Live Nation Touring Production & Tartine / Eataly Artisans',
    companyLogo: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=100&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA (On-site)',
    hub: 'San Francisco, CA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '3 hours ago',
    applicantsCount: 10,
    salaryRange: '$86,000 - $128,000 / yr',
    easyApply: true,
    requiredProductExperience: ['ETCP Arena Rigging, Dante FOH Sound & GrandMA3 Lighting', 'RBA Master Baker / Whole-Animal Butchery & CPO Pool/Pest IPM'],
    description: 'Rig 100-ton arena concert truss grids and L-Acoustics line arrays, lead artisan sourdough & dry-aged butchery programs, and oversee commercial pool/pest facility protection.',
    requirements: ['ETCP Rigging/Electrical certification, touring FOH/lighting experience, or master culinary/butchery craft portfolio'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.livenationentertainment.com/careers/',
    source: 'Live Nation & Culinary Guild Careers',
    tags: ['Stage Rigger', 'Live Sound & Lighting', 'Baker & Butcher', 'Pest & Pool']
  },
  {
    id: 'creative_upholstery_sign_6',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'creative_media_arts',
    domainCategory: 'Practical Design & Set Craft',
    title: 'Master Furniture Upholsterer, IATSE Film Set Builder & UL Sign Fabricator',
    company: 'Herman Miller Bespoke Studio & Sony Pictures Stage Operations',
    companyLogo: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY (On-site)',
    hub: 'New York, NY',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '4 hours ago',
    applicantsCount: 7,
    salaryRange: '$85,000 - $124,000 / yr',
    easyApply: true,
    requiredProductExperience: ['8-Way Hand-Tied Upholstery & Custom Furniture Joinery', 'IATSE Scenic Carpentry & UL48 Illuminated Channel Signage'],
    description: 'Craft heirloom upholstered furniture and museum display mounts, build soundstage film sets and props, and fabricate CNC illuminated architectural signage & vehicle wraps.',
    requirements: ['Demonstrated physical craft portfolio in upholstery, furniture making, scenic carpentry, or commercial signage'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.millerknoll.com/careers',
    source: 'MillerKnoll & Studio Craft Careers',
    tags: ['Upholstery', 'Furniture Maker', 'Film Set Builder', 'Sign Fabricator']
  },
  {
    id: 'comm_retail_support_6',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'commerce_small_business',
    domainCategory: 'Retail & Customer Ops',
    title: 'Multi-Store Retail Operations Lead, Visual Merchandiser & RMA Fulfillment Mgr',
    company: 'Costco Wholesale & Apple Retail Flagship Operations',
    companyLogo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&auto=format&fit=crop&q=80',
    location: 'Seattle, WA (On-site)',
    hub: 'Seattle, WA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '2 hours ago',
    applicantsCount: 13,
    salaryRange: '$84,000 - $122,000 / yr',
    easyApply: true,
    requiredProductExperience: ['Flagship Visual Merchandising & POS Shrink Control', 'Tier-3 Technical Customer Support & E-Commerce Reverse Logistics'],
    description: 'Lead flagship store supervisors and visual display merchandisers, direct B2B wholesale buyer accounts, and manage e-commerce fulfillment & warranty repair/returns centers.',
    requirements: ['4+ years retail store leadership, visual merchandising, wholesale distribution, or technical support management'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.costco.com/jobs.html',
    source: 'Costco & Flagship Retail Careers',
    tags: ['Retail Supervisor', 'Visual Merchandiser', 'Customer Support', 'Fulfillment']
  },
  {
    id: 'edu_accessibility_stars_6',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'education_workforce',
    domainCategory: 'Accessibility & STARs',
    title: 'RESNA Assistive Tech Specialist, Braille Transcriber & STARs Apprenticeship Lead',
    company: 'Perkins School for the Blind & Opportunity@Work Partner Network',
    companyLogo: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=100&auto=format&fit=crop&q=80',
    location: 'Boston, MA (Hybrid)',
    hub: 'Boston, MA',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '3 hours ago',
    applicantsCount: 8,
    salaryRange: '$80,000 - $115,000 / yr',
    easyApply: true,
    requiredProductExperience: ['LOC Unified English Braille (UEB) & RESNA ATP', 'Registered Apprenticeship (OJT) & Archival Preservation'],
    description: 'Configure eye-gaze AAC and rehabilitation equipment, transcribe STEM textbooks into Nemeth/UEB Braille, preserve indigenous/archival collections, and place non-degree STARs talent.',
    requirements: ['RESNA ATP, LOC Braille certification, Certified Archivist, or Workforce Apprenticeship coordination experience'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.perkins.org/careers/',
    source: 'Perkins & Opportunity@Work Network',
    tags: ['Assistive Tech', 'Braille Transcriber', 'Archivist', 'STARs Pathway']
  },
  {
    id: 'civic_fire_publicworks_6',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'community_civic_security',
    domainCategory: 'Public Safety & Municipal',
    title: 'Firefighter/USAR Captain, NBIS Bridge Inspector & Disaster Resilience Lead',
    company: 'FDNY / CAL FIRE Partner Agencies & Municipal Public Works Dept',
    companyLogo: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=100&auto=format&fit=crop&q=80',
    location: 'Washington, DC / MD / VA',
    hub: 'Washington, DC / MD / VA',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    postedTime: '2 hours ago',
    applicantsCount: 9,
    salaryRange: '$92,000 - $136,000 / yr',
    easyApply: true,
    requiredProductExperience: ['NFPA 1001 Firefighter / USAR Rope & Confined Space', 'FHWA NBIS Bridge & Dam Inspection / ASIS CPP Security'],
    description: 'Lead urban search-and-rescue (USAR) and fire suppression crews, inspect municipal bridges/dams and emergency backup generators, and coordinate 911 CAD disaster resilience.',
    requirements: ['NFPA 1001/1006, APCO 911 Dispatch, NBIS Bridge Team Leader, or ASIS CPP physical security credential'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.usajobs.gov/',
    source: 'Municipal & Federal Public Safety Portal',
    tags: ['Firefighter', 'Search & Rescue', 'Bridge Inspector', 'Disaster Resilience']
  },
  {
    id: 'law_paralegal_court_6',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'law_gov_defense',
    domainCategory: 'Legal & Compliance Support',
    title: 'Senior Litigation Paralegal, Realtime Court Reporter (RPR) & Contract Admin',
    company: 'Latham & Watkins LLP & Veritext Legal Solutions',
    companyLogo: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=100&auto=format&fit=crop&q=80',
    location: 'Washington, DC / MD / VA',
    hub: 'Washington, DC / MD / VA',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '3 hours ago',
    applicantsCount: 10,
    salaryRange: '$88,000 - $128,000 / yr',
    easyApply: true,
    requiredProductExperience: ['NALA Certified Paralegal & Relativity E-Discovery', 'NCRA RPR 225 WPM Stenography & NNA Notary Signing'],
    description: 'Manage federal PACER trial dockets and Relativity e-discovery databases, capture 225-WPM realtime deposition stenography, and administer commercial CLM contracts & permits.',
    requirements: ['NALA CP, NCRA Registered Professional Reporter (RPR), Certified Court Interpreter, or NNA Notary Signing Agent'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://www.lw.com/en/careers',
    source: 'Latham & Veritext Careers',
    tags: ['Paralegal', 'Court Reporter', 'E-Discovery', 'Contract Admin', 'Notary']
  },
  {
    id: 'fin_bookkeeper_claims_6',
    countryCode: 'US',
    countryName: 'United States',
    professionEnclave: 'finance_accounting',
    domainCategory: 'Accounting, Claims & Lending',
    title: 'Senior Bookkeeper/Payroll Lead (CPP), Catastrophe Claims Adjuster & Loan Officer',
    company: 'Travelers Catastrophe Response, ADP Payroll & Navy Federal Credit Union',
    companyLogo: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY (Hybrid)',
    hub: 'New York, NY',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '2 hours ago',
    applicantsCount: 12,
    salaryRange: '$84,000 - $124,000 / yr',
    easyApply: true,
    requiredProductExperience: ['AIPB Bookkeeping, ADP Multi-State Payroll (CPP) & IRS EA', 'Xactimate Catastrophe Claims & NMLS Mortgage Underwriting'],
    description: 'Manage full-cycle AP/AR bookkeeping and multi-state payroll tax compliance, scope property catastrophe claims in Xactimate, or underwrite credit union & microfinance loans.',
    requirements: ['AIPB Certified Bookkeeper, APA CPP, IRS Enrolled Agent, State All-Lines Adjuster License, or NMLS ID'],
    languageRequirement: 'Fluent English',
    applyUrl: 'https://careers.travelers.com/',
    source: 'Travelers & Credit Union Careers',
    tags: ['Bookkeeper', 'Payroll & Tax', 'Claims Adjuster', 'Loan Officer', 'Microfinance']
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
    interviewDate: 'Oct 29, 2026 at 2:00 PM EST'
  },
  {
    id: 'app_2',
    jobTitle: 'Master Heavy Timber Carpenter & Bents Lead',
    company: 'Turner Construction — Mass Timber Division',
    companyLogo: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&auto=format&fit=crop&q=80',
    location: 'Austin, TX (On-site)',
    salary: '$95,000 - $132,000 / yr',
    stage: 'offer',
    appliedDate: 'Applied 1 week ago',
    nextStep: 'Offer Letter Pending Review',
    recruiterName: 'Marcus Vance (Craft Superintendent)',
    productVerifiedMatch: 'OSHA 30 & Structural Timber Blueprint Verified',
    offerDetails: '$124,000 Base + $12,000 Site Completion Bonus + Full Union Benefits'
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
    jobTitle: 'Attending Orthopedic Trauma Surgeon & Clinical Chair',
    company: 'Johns Hopkins Medicine',
    companyLogo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80',
    location: 'Washington, DC / MD / VA',
    salary: '$480,000 - $690,000 / yr',
    stage: 'interview',
    appliedDate: 'Applied 4 days ago',
    nextStep: 'Surgical Chair Credentialing & Grand Rounds Presentation',
    recruiterName: 'Dr. Helena Vance (Clinical Faculty Search)',
    productVerifiedMatch: 'ABOS Board Certified & OTA Fellowship Verified'
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
    currentStatus: 'Open to Offers',
    professionEnclave: 'tech_cybersecurity'
  },
  {
    id: 'cand_2',
    name: 'Master Caleb Vance',
    headline: 'Master Heavy Timber Framer & Commercial Superintendent | OSHA 30 | 14 Yrs Craft Lead',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    location: 'Austin, TX / Nationwide Travel',
    clearance: 'TWIC & Federal Site Cleared',
    experienceYears: 14,
    capabilities: ['Heavy Timber Framing', 'Procore BIM', 'Commercial Framing', 'AWS 6G Welding'],
    verifiedProducts: ['OSHA 30 Outreach Verified ✓', 'Procore Superintendent Pro ✓', 'Festool Joinery Master ✓'],
    certifications: ['Master Carpenter', 'OSHA 30', 'NCCER Certified Crane Rigger'],
    matchScore: 99,
    currentStatus: 'Ready to Start',
    professionEnclave: 'trades_construction'
  },
  {
    id: 'cand_3',
    name: 'Dr. Elena Rostova, MD, FACS',
    headline: 'Attending Orthopedic Trauma Surgeon & Surgical Critical Care Director | ABOS Certified',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
    location: 'Boston, MA / Washington, DC',
    clearance: 'Active DEA & Multi-State Compact License',
    experienceYears: 12,
    capabilities: ['Pelvic & Acetabular Trauma', 'Articular Reconstruction', 'Level 1 Trauma Leadership'],
    verifiedProducts: ['Epic EHR Surgical Suite ✓', 'Stryker Mako Robotic-Arm Assisted ✓'],
    certifications: ['ABOS Board Certified', 'FACS', 'ATLS Instructor'],
    matchScore: 97,
    currentStatus: 'Open to Offers',
    professionEnclave: 'healthcare_medicine'
  },
  {
    id: 'cand_health_pharm_1',
    name: 'Dr. Amara Okafor, PharmD, BCPS',
    headline: 'Director of Clinical Pharmacy & Antimicrobial Stewardship | USP <797>/<800> Sterile IV Lead',
    avatar: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=200&auto=format&fit=crop&q=80',
    location: 'Baltimore, MD / Washington, DC',
    clearance: 'Active Multi-State Pharmacist License & BPS BCPS',
    experienceYears: 9,
    capabilities: ['Vancomycin AUC/MIC Pharmacokinetics', 'ICU & Oncology Dosing', 'USP <797>/<800> Cleanroom', 'Antimicrobial Stewardship'],
    verifiedProducts: ['Epic Willow Inpatient Pharmacy ✓', 'NIH DailyMed & OpenFDA Formulary ✓', 'Pyxis MedStation ES ✓'],
    certifications: ['Doctor of Pharmacy (PharmD)', 'BCPS Board Certified', 'APhA Immunization Certified'],
    matchScore: 99,
    currentStatus: 'Ready to Start',
    professionEnclave: 'healthcare_medicine'
  },
  {
    id: 'cand_health_rn_2',
    name: 'Clara Vance, BSN, RN, CCRN',
    headline: 'Emergency Trauma & Surgical ICU Charge Nurse | ECMO, CRRT & Hemodynamic Titration',
    avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&auto=format&fit=crop&q=80',
    location: 'Boston, MA / New York, NY',
    clearance: 'Active eNLC Multi-State Compact RN License',
    experienceYears: 8,
    capabilities: ['Level 1 Trauma Resuscitation', 'Vasoactive Drip Titration', 'CRRT & ECMO', 'SBAR Clinical Leadership'],
    verifiedProducts: ['Epic ASAP & ICU Flowsheets ✓', 'Alaris Smart Pump & Belmont Rapid Infuser ✓'],
    certifications: ['BSN, RN', 'AACN CCRN', 'ENA TNCC & ACLS/PALS'],
    matchScore: 98,
    currentStatus: 'Ready to Start',
    professionEnclave: 'healthcare_medicine'
  },
  {
    id: 'cand_health_pct_3',
    name: 'Devon Brooks, CPCT-A, CNA, CCMA',
    headline: 'Lead Certified Nursing Technician & Acute Patient Care Tech | 12-Lead ECG, Phlebotomy & Telemetry',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
    location: 'New York, NY / Philadelphia, PA',
    clearance: 'NHA CPCT-A, State CNA & CPT Phlebotomy Verified',
    experienceYears: 6,
    capabilities: ['Bedside Nursing Tech Support', '12-Lead ECG & Telemetry', 'CLSI Venipuncture Phlebotomy', 'Foley & Sterile Wound Assist'],
    verifiedProducts: ['Epic Rover Bedside Charting ✓', 'GE MAC 5500 12-Lead ECG ✓', 'CLIA Point-of-Care Analyzer ✓'],
    certifications: ['Certified Nursing Technician (CPCT-A)', 'State CNA', 'NHA CCMA & CPT'],
    matchScore: 96,
    currentStatus: 'Open to Offers',
    professionEnclave: 'healthcare_medicine'
  },
  {
    id: 'cand_health_admin_4',
    name: 'Victoria Sterling, MHA, MBA, FACHE',
    headline: 'VP of Hospital Clinical Operations & Medical Practice Administrator | Joint Commission & CMS Quality',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    location: 'Washington, DC / Reston, VA',
    clearance: 'Fellow of the American College of Healthcare Executives (FACHE)',
    experienceYears: 13,
    capabilities: ['Hospital Bed-Flow Command', 'Joint Commission (TJC) Surveys', 'HIPAA & HL7 FHIR Governance', 'Clinical Staffing & Revenue Cycle'],
    verifiedProducts: ['Epic Grand Central & Resolute ✓', 'CMS HCAHPS & DRG Analytics ✓'],
    certifications: ['FACHE', 'Master of Health Administration (MHA)', 'Lean Six Sigma Black Belt (Healthcare)'],
    matchScore: 97,
    currentStatus: 'Open to Offers',
    professionEnclave: 'healthcare_medicine'
  },
  {
    id: 'cand_4',
    name: 'Marcus Reyes, ASE L1/L3',
    headline: 'ASE World Class Master Technician & 800V High-Voltage EV Lead | PicoScope Specialist',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA / Seattle, WA',
    clearance: 'NFPA 70E Cat 4 High-Voltage Certified',
    experienceYears: 10,
    capabilities: ['800V EV Powertrains', 'CAN-FD Waveform Diagnostics', 'Cummins/Detroit Diesel'],
    verifiedProducts: ['Snap-on ZEUS+ Master ✓', 'PicoScope 4425A EV Kit ✓', 'Autel IA900 ADAS ✓'],
    certifications: ['ASE Master A1–A8', 'ASE L1 & L3 EV', 'EPA 609'],
    matchScore: 96,
    currentStatus: 'Interviewing',
    professionEnclave: 'automotive_mechanics'
  },
  {
    id: 'cand_5',
    name: 'Alexander Novak, JD, CISSP',
    headline: 'Principal DoD RMF / CMMC 2.0 Assessor & Federal Acquisition Counsel | TS/SCI',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    location: 'Washington, DC / Northern VA',
    clearance: 'Active Top Secret / SCI',
    experienceYears: 14,
    capabilities: ['NIST 800-53 Rev 5', 'FAR/DFARS Law', 'CMMC Level 3', 'FedRAMP High'],
    verifiedProducts: ['eMASS & Xacta 360 Verified ✓', 'FedRAMP 3PAO Suite ✓'],
    certifications: ['Active Bar Admission', 'CISSP-ISSAP', 'CCA (Certified CMMC Assessor)'],
    matchScore: 98,
    currentStatus: 'Ready to Start',
    professionEnclave: 'law_gov_defense'
  },
  {
    id: 'cand_6',
    name: 'Victoria Chen, CPA, CFA',
    headline: 'VP Corporate Controller & Private Equity M&A Valuation Lead | Ex-Deloitte & BlackRock',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    location: 'New York, NY',
    clearance: 'FINRA Series 79 & 63',
    experienceYears: 9,
    capabilities: ['US GAAP / SEC Reporting', 'LBO & DCF Modeling', 'SOX 404 Compliance', 'NetSuite ERP'],
    verifiedProducts: ['Bloomberg Terminal Certified ✓', 'Workiva SEC & Anaplan Pro ✓'],
    certifications: ['Active CPA', 'CFA Charterholder'],
    matchScore: 95,
    currentStatus: 'Open to Offers',
    professionEnclave: 'finance_accounting'
  }
]

/**
 * Dynamically returns profession-authentic skill & product recommendations for any job card
 */
export function getJobFlywheelRecommendation(job: GlobalJobItem): {
  primarySkill: string
  secondarySkill: string
  badgeText: string
} {
  if (job.requiredProductExperience && job.requiredProductExperience.length >= 2) {
    return {
      primarySkill: job.requiredProductExperience[0],
      secondarySkill: job.requiredProductExperience[1],
      badgeText: '✓ Verified Skill & Credential Fit'
    }
  }

  const enclave = job.professionEnclave || 'tech_cybersecurity'
  switch (enclave) {
    case 'trades_construction':
      return {
        primarySkill: 'OSHA 30 Job-Site Safety & Blueprint Reading',
        secondarySkill: 'Procore BIM / NEC / AWI Craft Standards',
        badgeText: '✓ Top Craft & Trade License Match'
      }
    case 'automotive_mechanics':
      return {
        primarySkill: 'ASE Master (A1–A8 / L1 / L3 High-Voltage EV)',
        secondarySkill: '4-Channel PicoScope & OEM J2534 Diagnostics',
        badgeText: '✓ Verified Shop & Diagnostic Fit'
      }
    case 'agriculture_natural_resources':
      return {
        primarySkill: 'Certified Crop Adviser (CCA) & Soil Analytics',
        secondarySkill: 'RTK Sub-Inch GPS & GIS Prescription Mapping',
        badgeText: '✓ Verified Ag & Land Operations Fit'
      }
    case 'personal_services_wellness':
      return {
        primarySkill: 'State Board Master Licensure / NSCA CSCS',
        secondarySkill: 'Biomechanical Rehab & High-Retention Client Care',
        badgeText: '✓ Verified Clinical & Studio Fit'
      }
    case 'culinary_hospitality_events':
      return {
        primarySkill: 'ServSafe Manager & HACCP Culinary Standards',
        secondarySkill: 'Sub-28% Prime Cost & Luxury RevPAR Operations',
        badgeText: '✓ Hospitality & Brigade Leadership Fit'
      }
    case 'commerce_small_business':
      return {
        primarySkill: 'Multi-Unit P&L & ARGUS / CCIM Underwriting',
        secondarySkill: 'SAP / NetSuite ERP & 3PL Supply Chain Velocity',
        badgeText: '✓ Commercial & Operations Fit'
      }
    case 'creative_media_arts':
      return {
        primarySkill: 'DaVinci Resolve HDR / Pro Tools HDX / Figma Tokens',
        secondarySkill: '8K Cinema Production & RID NIC ASL Interpreting',
        badgeText: '✓ Studio & Creative Production Fit'
      }
    case 'healthcare_medicine':
      return {
        primarySkill: 'Board Certification (ABMS) / AACN CCRN / ATLS',
        secondarySkill: 'Epic EHR Clinical Workflows & Trauma Protocols',
        badgeText: '✓ Verified Clinical & Licensure Fit'
      }
    case 'education_workforce':
      return {
        primarySkill: 'State Educator Credential / ABET & NCCER Curriculum',
        secondarySkill: 'Research Grant Leadership & STEM Lab Pedagogy',
        badgeText: '✓ Academic & Workforce Instruction Fit'
      }
    case 'community_civic_security':
      return {
        primarySkill: 'FEMA NIMS ICS-300/400 & ASIS CPP Protection',
        secondarySkill: 'DoD SkillBridge & Emergency Operations Command',
        badgeText: '✓ Public Safety & Mission Leadership Fit'
      }
    case 'campus_students':
      return {
        primarySkill: 'Capstone Engineering / Research Portfolio',
        secondarySkill: 'Technical Interview & Rotational Readiness',
        badgeText: '✓ Early Career & Fellowship Fit'
      }
    case 'tech_software':
      return {
        primarySkill: 'Next.js 16, TypeScript & Distributed Rust/Go Systems',
        secondarySkill: 'PyTorch LLM Agentic Orchestration & Kubernetes',
        badgeText: '✓ Staff Engineering & Systems Fit'
      }
    case 'law_gov_defense':
      return {
        primarySkill: 'NIST SP 800-53 Rev 5 (RMF) & CMMC 2.0 Level 3',
        secondarySkill: 'FAR/DFARS Federal Procurement & Active Clearance',
        badgeText: '✓ Cleared Defense & Legal Fit'
      }
    case 'finance_accounting':
      return {
        primarySkill: 'Active CPA / AIPB Bookkeeper / AIC Claims Adjuster',
        secondarySkill: '3-Statement LBO/DCF, Payroll (CPP) & Xactimate',
        badgeText: '✓ Finance, Tax & Claims Fit'
      }
    case 'manufacturing_industrial':
      return {
        primarySkill: 'NIMS 5-Axis CNC / Mastercam & ASME Y14.5 GD&T',
        secondarySkill: 'FANUC Robotics, ASNT NDT Level III & RJG Molding',
        badgeText: '✓ Verified Machining & Plant Fit'
      }
    case 'energy_utilities_environment':
      return {
        primarySkill: 'GWO Wind / NABCEP Solar & NERC Grid Operator',
        secondarySkill: 'MSHA Mining / Grade IV Water & 40-Hr HAZWOPER',
        badgeText: '✓ Verified Energy, Mining & Utility Fit'
      }
    case 'science_laboratory_research':
      return {
        primarySkill: 'cGMP Cleanroom Bioprocess & Agilent HPLC / GC-MS',
        secondarySkill: 'ISO 17025 Metrology, Forensic DNA & Section 106',
        badgeText: '✓ Verified Laboratory & Research Fit'
      }
    case 'aviation_aerospace_maritime':
      return {
        primarySkill: 'FAA Airframe & Powerplant (A&P) / NASA-STD-8739',
        secondarySkill: 'USCG STCW Marine Engineering & ADCI Commercial Diver',
        badgeText: '✓ Verified Aviation, Space & Maritime Fit'
      }
    case 'telecom_digital_infrastructure':
      return {
        primarySkill: 'FOA CFOT Fiber Splicing & NWSA 5G Tower Climbing',
        secondarySkill: 'IPC-7711 PCB Micro-Soldering & 3D LiDAR Digital Twins',
        badgeText: '✓ Verified Telecom, Repair & Frontier Fit'
      }
    default:
      return {
        primarySkill: 'Expedite Strike™ Autonomous Security & GICSP OT',
        secondarySkill: 'Zero Trust Cloud, SCADA Defense & eBPF Architecture',
        badgeText: '✓ Top 5% Applicant Fit'
      }
  }
}

export function getEnclaveSearchPlaceholder(enclaveId: string, countryName: string): string {
  switch (enclaveId) {
    case 'all':
      return `Search all 20 industries & 300+ professions in ${countryName} (e.g. Pharmacist, Doctor MD/DO, Nurse RN, Nursing Technician, Carpenter, CNC Machinist, CPA)...`
    case 'trades_construction':
      return `Search construction & MEP in ${countryName} (e.g. Timber Carpenter, Bricklayer, HVAC/R, Elevator Tech, BIM Quantity Surveyor)...`
    case 'automotive_mechanics':
      return `Search auto, heavy machinery & rail in ${countryName} (e.g. ASE Master Tech, 800V EV, CAT Excavator, Rail Signal, Customs Broker)...`
    case 'agriculture_natural_resources':
      return `Search agri, forestry & food science in ${countryName} (e.g. Agronomist, Hydroponics, Ag-Drone, Food Technologist, Wildlife Vet Tech)...`
    case 'personal_services_wellness':
      return `Search beauty, wellness, turf & memorial in ${countryName} (e.g. Barber, Massage LMT, Tattoo Artist, Sports Turf, Funeral Director)...`
    case 'culinary_hospitality_events':
      return `Search hospitality, live stage & property in ${countryName} (e.g. Chef, Baker/Butcher, ETCP Stage Rigger, Live Sound, Pest/Pool)...`
    case 'commerce_small_business':
      return `Search retail, sales & SMB in ${countryName} (e.g. Realtor, Store Supervisor, Visual Merchandiser, Customer Support, Fulfillment)...`
    case 'creative_media_arts':
      return `Search creative & practical design in ${countryName} (e.g. Upholsterer, Sign Fabricator, Set Builder, Filmmaker, Florist)...`
    case 'healthcare_medicine':
      return `Search medicine, pharmacy & nursing in ${countryName} (e.g. Pharmacist PharmD, Doctor MD/DO, Registered Nurse RN, Nursing Technician PCT/CNA, Medical Assistant, Hospital Admin)...`
    case 'education_workforce':
      return `Search education, accessibility & STARs in ${countryName} (e.g. Vocational Instructor, Braille Transcriber, Assistive Tech, Apprentice)...`
    case 'community_civic_security':
      return `Search public safety & municipal in ${countryName} (e.g. Firefighter, 911 Dispatcher, Bridge Inspector, Private Investigator, Veteran)...`
    case 'campus_students':
      return `Search student & early-career roles in ${countryName} (e.g. Polytechnic Fellow, Research Assistant, New Grad Rotational)...`
    case 'tech_software':
      return `Search software, AI workflows & no-code in ${countryName} (e.g. Next.js Engineer, AI Workflow Tech, Technical Writer, No-Code)...`
    case 'law_gov_defense':
      return `Search legal, paralegal & compliance in ${countryName} (e.g. Paralegal, Court Reporter, Notary, Contract Admin, Defense Counsel)...`
    case 'finance_accounting':
      return `Search finance, tax & claims in ${countryName} (e.g. Bookkeeper, Payroll CPP, Catastrophe Claims Adjuster, Loan Officer, CPA)...`
    case 'manufacturing_industrial':
      return `Search manufacturing & machining in ${countryName} (e.g. 5-Axis CNC Machinist, Tool & Die, FANUC Robotics, NDT Inspector, Molding)...`
    case 'energy_utilities_environment':
      return `Search energy, mining & water in ${countryName} (e.g. Wind Turbine Tech, Solar PV, Substation Operator, Miner, Water Plant)...`
    case 'science_laboratory_research':
      return `Search science, lab & biotech in ${countryName} (e.g. cGMP Bioprocess Tech, HPLC Analyst, Materials Tester, Forensic Lab, Archaeologist)...`
    case 'aviation_aerospace_maritime':
      return `Search aviation, space & maritime in ${countryName} (e.g. FAA A&P Mechanic, Avionics, Spacecraft Tech, Commercial Diver, Marine Engineer)...`
    case 'telecom_digital_infrastructure':
      return `Search telecom, micro-repair & frontier tech in ${countryName} (e.g. Fiber Splicer, Tower Climber, PCB Micro-Soldering, Watchmaker, Digital Twin)...`
    default:
      return `Search cybersecurity & OT security roles in ${countryName} (e.g. OT/SCADA Cyber Tech, Red Team, Cloud Security)...`
  }
}

export function getCountryShortLabel(country: CountryConfig): string {
  const map: Record<string, string> = {
    US: 'United States',
    GH: 'Ghana',
    DE: 'Germany',
    GB: 'United Kingdom',
    CA: 'Canada',
    FR: 'France',
    JP: 'Japan',
    NG: 'Nigeria',
    AU: 'Australia',
    SG: 'Singapore',
    NL: 'Netherlands',
    ZA: 'South Africa',
    IN: 'India',
    AE: 'UAE',
    BR: 'Brazil',
    KE: 'Kenya',
    MX: 'Mexico',
    ES: 'Spain',
    IT: 'Italy',
    SE: 'Sweden',
    CH: 'Switzerland',
    IE: 'Ireland',
    PL: 'Poland',
    KR: 'South Korea',
    SA: 'Saudi Arabia',
    EG: 'Egypt'
  }
  return map[country.code] || country.name
}

interface RegionalEmployerSpec {
  company: string
  applyUrl: string
  source: string
}

const US_EMPLOYERS_BY_ENCLAVE: Record<string, RegionalEmployerSpec[]> = {
  trades_construction: [
    { company: 'Turner Construction & AECOM Building Systems', applyUrl: 'https://www.turnerconstruction.com/careers', source: 'Turner Direct ATS' },
    { company: 'Bechtel Infrastructure & EMCOR Group MEP', applyUrl: 'https://www.bechtel.com/careers/', source: 'Bechtel Careers' },
    { company: 'Skanska USA & DPR Construction Craft Division', applyUrl: 'https://www.usa.skanska.com/careers/', source: 'Skanska Careers' }
  ],
  automotive_mechanics: [
    { company: 'Penske Truck Leasing, Caterpillar & Rivian Service Ops', applyUrl: 'https://penske.jobs/', source: 'Penske & OEM Careers' },
    { company: 'Union Pacific Rail, Cummins & BNSF Technical Ops', applyUrl: 'https://up.jobs/', source: 'Rail & Fleet ATS' }
  ],
  agriculture_natural_resources: [
    { company: 'John Deere Agronomy, Corteva & Plenty Vertical Farms', applyUrl: 'https://careers.deere.com/', source: 'Agri & Land Portal' },
    { company: 'Cargill Food Science, Weyerhaeuser & USDA Forest Partner', applyUrl: 'https://careers.cargill.com/', source: 'Cargill Careers' }
  ],
  personal_services_wellness: [
    { company: 'Equinox Tier X, Life Time Wellness & Service Corp International', applyUrl: 'https://careers.equinox.com/', source: 'Equinox & Studio ATS' },
    { company: 'PGA Tour Agronomy, Vail Resorts & Ulta Pro Flagship', applyUrl: 'https://jobs.vailresorts.com/', source: 'Wellness & Recreation Portal' }
  ],
  culinary_hospitality_events: [
    { company: 'Four Seasons Hotels, Marriott Luxury & Live Nation Arenas', applyUrl: 'https://jobs.fourseasons.com/', source: 'Hospitality & Live Events ATS' },
    { company: 'Compass Group Culinary, Ecolab & Rollins Orkin Commercial', applyUrl: 'https://www.ecolab.com/careers', source: 'Culinary & Facility Portal' }
  ],
  commerce_small_business: [
    { company: 'CBRE Commercial, Costco Wholesale & Prologis Supply Chain', applyUrl: 'https://www.cbre.com/careers', source: 'Commercial & Retail ATS' },
    { company: 'Target Omnichannel, DHL Supply Chain & Shopify Merchant Network', applyUrl: 'https://corporate.target.com/careers', source: 'Omnichannel Commerce Portal' }
  ],
  creative_media_arts: [
    { company: 'Netflix Studios, IATSE Stage Craft &Steinway/Fender Custom Shop', applyUrl: 'https://jobs.netflix.com/', source: 'Studio & Craft Portal' },
    { company: 'FASTSIGNS Commercial, Christie’s Fine Art & Sorenson ASL', applyUrl: 'https://www.sorenson.com/careers/', source: 'Creative & Language ATS' }
  ],
  healthcare_medicine: [
    { company: 'Mayo Clinic, Johns Hopkins Medicine & Kaiser Permanente', applyUrl: 'https://jobs.mayoclinic.org/', source: 'Clinical & Allied Health ATS' },
    { company: 'GE HealthCare Biomedical, Quest Diagnostics & Hanger Clinic', applyUrl: 'https://careers.gehealthcare.com/', source: 'Biomedical & Clinical Portal' }
  ],
  education_workforce: [
    { company: 'Lincoln Tech Workforce, Perkins School & Guild Education', applyUrl: 'https://www.lincolntech.edu/careers', source: 'Workforce & Education ATS' },
    { company: 'Smithsonian Archives, Year Up STARs & Vocational CTE Alliance', applyUrl: 'https://www.si.edu/ofi', source: 'Education & Inclusion Portal' }
  ],
  community_civic_security: [
    { company: 'FEMA / Municipal Fire-Rescue, AECOM Public Works & Allied Universal', applyUrl: 'https://www.usajobs.gov/', source: 'Public Safety & Municipal ATS' },
    { company: 'Pinkerton Protective Services, Hiring Our Heroes & Team Rubicon', applyUrl: 'https://pinkerton.com/careers', source: 'Civic & Security Portal' }
  ],
  campus_students: [
    { company: 'Salisbury University, NASA Pathways & National Labs Fellowships', applyUrl: 'https://www.salisbury.edu/', source: 'University & Fellowship Portal' }
  ],
  tech_software: [
    { company: 'Vercel, OpenAI, Stripe & Scale AI Engineering', applyUrl: 'https://vercel.com/careers', source: 'Tech & AI Direct ATS' }
  ],
  tech_cybersecurity: [
    { company: 'Expedite Consults, Dragos OT Security & CrowdStrike OverWatch', applyUrl: 'https://www.dragos.com/careers/', source: 'Cyber & OT Defense ATS' }
  ],
  law_gov_defense: [
    { company: 'Booz Allen Hamilton, Lockheed Martin & Veritext Legal Solutions', applyUrl: 'https://careers.boozallen.com/', source: 'Legal & Defense ATS' }
  ],
  finance_accounting: [
    { company: 'JPMorgan Chase, Chubb Claims, Intuit ProAdvisor & Navy Federal', applyUrl: 'https://careers.jpmorgan.com/', source: 'Finance, Tax & Claims ATS' }
  ],
  manufacturing_industrial: [
    { company: 'Haas Automation, FANUC Robotics, Corning & New Balance Manufacturing', applyUrl: 'https://www.haascnc.com/about/careers.html', source: 'Manufacturing & CNC Portal' }
  ],
  energy_utilities_environment: [
    { company: 'NextEra Energy, Duke Energy, Freeport-McMoRan & Veolia Water', applyUrl: 'https://jobs.nexteraenergy.com/', source: 'Energy, Mining & Water ATS' }
  ],
  science_laboratory_research: [
    { company: 'Genentech, Thermo Fisher Scientific, Element Materials & Smithsonian', applyUrl: 'https://jobs.thermofisher.com/', source: 'Laboratory & Science Portal' }
  ],
  aviation_aerospace_maritime: [
    { company: 'SpaceX, Delta TechOps, Huntington Ingalls Shipbuilding & Oceaneering', applyUrl: 'https://www.spacex.com/careers', source: 'Aviation, Space & Maritime ATS' }
  ],
  telecom_digital_infrastructure: [
    { company: 'Equinix Data Centers, Crown Castle Fiber, TSMC & Matterport LiDAR', applyUrl: 'https://careers.equinix.com/', source: 'Telecom, Repair & Frontier Portal' }
  ]
}

const REGIONAL_EMPLOYERS_BY_COUNTRY: Record<string, Record<string, RegionalEmployerSpec[]>> = {
  FR: {
    trades_construction: [
      { company: 'VINCI Construction France — Grands Projets & Bois', applyUrl: 'https://www.vinci.com/vinci.nsf/en/careers.htm', source: 'VINCI France Careers' },
      { company: 'Bouygues Bâtiment Île-de-France', applyUrl: 'https://www.bouygues-construction.com/en/careers', source: 'Bouygues Construction' },
      { company: 'Eiffage Génie Civil & Construction', applyUrl: 'https://www.eiffage.com/en/talent/join-us', source: 'Eiffage Recrutement' },
      { company: 'Equans France (Génie Électrique & CVC)', applyUrl: 'https://www.equans.fr/carrieres', source: 'Equans France' },
      { company: 'Saint-Gobain Architecture & Menuiserie', applyUrl: 'https://www.saint-gobain.com/en/careers', source: 'Saint-Gobain Careers' }
    ],
    automotive_mechanics: [
      { company: 'Renault Group — Ampère EV & Alpine Division', applyUrl: 'https://www.renaultgroup.com/en/talent/', source: 'Renault Group Talent' },
      { company: 'Stellantis Motorsport & SNCF Voyageurs Technicentre', applyUrl: 'https://www.stellantis.com/en/careers', source: 'Stellantis & SNCF France' },
      { company: 'Michelin Fleet & Mobilité Services', applyUrl: 'https://jobs.michelin.com/', source: 'Michelin Careers' }
    ],
    agriculture_natural_resources: [
      { company: 'InVivo Group & Soufflet Agriculture France', applyUrl: 'https://www.invivo-group.com/en/join-us', source: 'InVivo Agri France' },
      { company: 'Limagrain Field Seeds & Danone Food Science Paris', applyUrl: 'https://www.limagrain.com/en/careers', source: 'Limagrain & Danone Careers' },
      { company: 'Office National des Forêts (ONF France)', applyUrl: 'https://www.onf.fr/onf/+/34::nous-rejoindre.html', source: 'ONF France' }
    ],
    personal_services_wellness: [
      { company: 'L’Oréal Professionnel — Flagship Salon Paris', applyUrl: 'https://careers.loreal.com/', source: 'L’Oréal Careers' },
      { company: 'Club Med Spa & Chamonix Compagnie du Mont-Blanc', applyUrl: 'https://jobs.clubmed/', source: 'Club Med Talent' }
    ],
    culinary_hospitality_events: [
      { company: 'Accor Luxury & Raffles / Fairmont Paris', applyUrl: 'https://careers.accor.com/', source: 'Accor Heartist Portal' },
      { company: 'Hôtel Ritz Paris & Maison Poilâne Boulangerie', applyUrl: 'https://www.ritzparis.com/en-GB/careers', source: 'Ritz Paris Recrutement' },
      { company: 'GL events & Sodexo Live! Roland-Garros Production', applyUrl: 'https://fr.sodexo.com/carrieres.html', source: 'Sodexo Live France' }
    ],
    commerce_small_business: [
      { company: 'Unibail-Rodamco-Westfield & Galeries Lafayette Paris', applyUrl: 'https://www.urw.com/en/join-us', source: 'URW Paris Careers' },
      { company: 'Carrefour Group Supply Chain & Retail Ops', applyUrl: 'https://recrute.carrefour.fr/', source: 'Carrefour Recrutement' },
      { company: 'CMA CGM Global Logistics (Marseille / Paris)', applyUrl: 'https://www.cmacgm-group.com/en/careers', source: 'CMA CGM Careers' }
    ],
    creative_media_arts: [
      { company: 'Canal+ Group, StudioCanal & Mobilier National Paris', applyUrl: 'https://www.canalplusgroup.com/en/talent', source: 'Canal+ Talent' },
      { company: 'Ubisoft Paris & Ateliers Hermès Sellerie', applyUrl: 'https://www.ubisoft.com/en-us/company/careers', source: 'Ubisoft & Artisans Paris' }
    ],
    healthcare_medicine: [
      { company: 'AP-HP (Assistance Publique – Hôpitaux de Paris)', applyUrl: 'https://recrutement.aphp.fr/', source: 'AP-HP Recrutement' },
      { company: 'Institut Pasteur & Ramsay Santé France', applyUrl: 'https://www.pasteur.fr/en/careers', source: 'Institut Pasteur' },
      { company: 'Sanofi Clinical Research & Biologics', applyUrl: 'https://www.sanofi.com/en/careers', source: 'Sanofi Global Careers' }
    ],
    education_workforce: [
      { company: 'Sorbonne Université & Institut National des Jeunes Aveugles', applyUrl: 'https://www.sorbonne-universite.fr/en/university/careers', source: 'Sorbonne Recrutement' },
      { company: 'Compagnons du Devoir — Institut des Métiers', applyUrl: 'https://compagnons-du-devoir.com/', source: 'Compagnons du Devoir' }
    ],
    community_civic_security: [
      { company: 'Brigade de Sapeurs-Pompiers de Paris (BSPP) & Sécurité Civile', applyUrl: 'https://www.croix-rouge.fr/je-travaille-a-la-croix-rouge', source: 'Sécurité Civile & Croix-Rouge' },
      { company: 'Prosegur & Amarante Executive Protection Paris', applyUrl: 'https://www.amarante.com/en/careers/', source: 'Amarante Security' }
    ],
    campus_students: [
      { company: 'Station F Startup Campus & INRIA Fellowships', applyUrl: 'https://jobs.stationf.co/', source: 'Station F Jobs' },
      { company: 'Airbus Toulouse Early Career & VIE Program', applyUrl: 'https://www.airbus.com/en/careers/students-and-graduates', source: 'Airbus Graduates' }
    ],
    tech_software: [
      { company: 'Mistral AI Paris', applyUrl: 'https://mistral.ai/careers/', source: 'Mistral AI Lever ATS' },
      { company: 'Datadog Paris Engineering R&D Hub', applyUrl: 'https://careers.datadoghq.com/', source: 'Datadog Paris' },
      { company: 'Doctolib & Qonto Engineering (Station F)', applyUrl: 'https://careers.doctolib.fr/', source: 'Doctolib Careers' }
    ],
    tech_cybersecurity: [
      { company: 'Thales Cyber Defense & Schneider Electric OT Security', applyUrl: 'https://www.thalesgroup.com/en/career', source: 'Thales Cyber Careers' },
      { company: 'Orange Cyberdefense France', applyUrl: 'https://orangecyberdefense.com/global/careers/', source: 'Orange Cyberdefense' }
    ],
    law_gov_defense: [
      { company: 'Dassault Aviation & Thales Defense Systems', applyUrl: 'https://www.dassault-aviation.com/en/group/careers/', source: 'Dassault Careers' },
      { company: 'Gide Loyrette Nouel — Paralegal & Notariat Paris', applyUrl: 'https://www.gide.com/en/careers', source: 'Gide Avocats Paris' }
    ],
    finance_accounting: [
      { company: 'BNP Paribas & AXA Assurance Sinistres Paris', applyUrl: 'https://group.bnpparibas/en/careers', source: 'BNP Paribas & AXA Careers' },
      { company: 'Société Générale & Crédit Agricole Mutuel', applyUrl: 'https://careers.societegenerale.com/', source: 'Société Générale' }
    ],
    manufacturing_industrial: [
      { company: 'Safran Precision Machining & Schneider Electric Usine 4.0', applyUrl: 'https://www.safran-group.com/jobs', source: 'Safran Careers France' },
      { company: 'Saint-Gobain Glass & Michelin Robotics Clermont-Ferrand', applyUrl: 'https://www.saint-gobain.com/en/careers', source: 'Saint-Gobain & Michelin' }
    ],
    energy_utilities_environment: [
      { company: 'EDF (Électricité de France) & RTE Réseau de Transport', applyUrl: 'https://www.edf.fr/en/the-edf-group/join-us', source: 'EDF & RTE France' },
      { company: 'Veolia Eau & TotalEnergies Renewables France', applyUrl: 'https://www.veolia.com/en/careers', source: 'Veolia Recrutement' }
    ],
    science_laboratory_research: [
      { company: 'CNRS, Institut Pasteur & BioMérieux Marcy-l’Étoile', applyUrl: 'https://www.biomerieux.com/corp/en/careers.html', source: 'BioMérieux & CNRS' },
      { company: 'Musée du Louvre — Centre de Recherche et de Restauration', applyUrl: 'https://www.louvre.fr/en', source: 'Musée du Louvre Conservation' }
    ],
    aviation_aerospace_maritime: [
      { company: 'Airbus Commercial Aircraft Toulouse & ArianeGroup Space', applyUrl: 'https://www.airbus.com/en/careers', source: 'Airbus & ArianeGroup' },
      { company: 'Naval Group Shipbuilding & Bourbon Subsea Services Marseille', applyUrl: 'https://www.naval-group.com/en/join-us', source: 'Naval Group Careers' }
    ],
    telecom_digital_infrastructure: [
      { company: 'Orange Fiber Infrastructure & OVHcloud Data Centers', applyUrl: 'https://orange.jobs/', source: 'Orange & OVHcloud Jobs' },
      { company: 'STMicroelectronics Crolles & Cartier Horlogerie', applyUrl: 'https://www.st.com/content/st_com/en/about/careers/careers.html', source: 'STMicroelectronics France' }
    ]
  },
  DE: {
    trades_construction: [
      { company: 'HOCHTIEF & Ed. Züblin AG Bautechnik', applyUrl: 'https://www.hochtief.de/karriere', source: 'HOCHTIEF Karriere' },
      { company: 'STRABAG Deutschland & Viessmann Klimatechnik', applyUrl: 'https://karriere.strabag.com/', source: 'STRABAG Karriere' }
    ],
    automotive_mechanics: [
      { company: 'BMW Group Autonomous & EV Labs München', applyUrl: 'https://www.bmwgroup.jobs', source: 'BMW Group Careers' },
      { company: 'Mercedes-Benz, Porsche & Deutsche Bahn Instandhaltung', applyUrl: 'https://jobs.porsche.com/', source: 'Porsche & DB Karriere' }
    ],
    manufacturing_industrial: [
      { company: 'DMG MORI, KUKA Robotics Augsburg & Trumpf Werkzeugmaschinen', applyUrl: 'https://www.kuka.com/en-de/careers', source: 'KUKA & DMG MORI Karriere' },
      { company: 'Siemens Digital Industries & Carl Zeiss Jena', applyUrl: 'https://jobs.siemens.com/', source: 'Siemens Karriere' }
    ],
    energy_utilities_environment: [
      { company: 'RWE Renewables, E.ON Grid & Enercon Windenergie', applyUrl: 'https://www.rwe.com/en/careers/', source: 'RWE & E.ON Karriere' }
    ],
    science_laboratory_research: [
      { company: 'BioNTech Mainz, Bayer AG & Fraunhofer-Gesellschaft', applyUrl: 'https://www.biontech.com/int/en/home/careers.html', source: 'BioNTech & Fraunhofer' }
    ],
    aviation_aerospace_maritime: [
      { company: 'Lufthansa Technik Hamburg & MTU Aero Engines München', applyUrl: 'https://www.lufthansa-technik.com/en/careers', source: 'Lufthansa Technik' }
    ],
    telecom_digital_infrastructure: [
      { company: 'Deutsche Telekom Glasfaser, Infineon Dresden & A. Lange & Söhne', applyUrl: 'https://www.telekom.com/en/careers', source: 'Telekom & Infineon' }
    ],
    healthcare_medicine: [
      { company: 'Charité – Universitätsmedizin Berlin', applyUrl: 'https://karriere.charite.de/', source: 'Charité Berlin' },
      { company: 'Helios Kliniken & Siemens Healthineers', applyUrl: 'https://www.siemens-healthineers.com/careers', source: 'Siemens Healthineers' }
    ],
    tech_software: [
      { company: 'SAP SE & DeepL Engineering Germany', applyUrl: 'https://jobs.sap.com/', source: 'SAP Careers' },
      { company: 'Celonis & N26 Tech Hub Berlin', applyUrl: 'https://www.celonis.com/careers/', source: 'Celonis Careers' }
    ],
    finance_accounting: [
      { company: 'Deutsche Bank & Allianz Global Investors Frankfurt', applyUrl: 'https://careers.db.com/', source: 'Deutsche Bank Careers' }
    ]
  },
  GB: {
    trades_construction: [
      { company: 'Balfour Beatty & Mace Construction UK', applyUrl: 'https://www.balfourbeatty.com/careers/', source: 'Balfour Beatty UK' },
      { company: 'Kier Group & Laing O’Rourke Specialist Craft', applyUrl: 'https://www.laingorourke.com/careers/', source: 'Laing O’Rourke UK' }
    ],
    automotive_mechanics: [
      { company: 'Jaguar Land Rover (JLR) & Network Rail Signalling UK', applyUrl: 'https://www.jaguarlandrovercareers.com/', source: 'JLR & Network Rail UK' },
      { company: 'McLaren & Aston Martin Performance Service', applyUrl: 'https://careers.mclaren.com/', source: 'McLaren Careers' }
    ],
    manufacturing_industrial: [
      { company: 'Renishaw Precision CNC & JCB Heavy Manufacturing UK', applyUrl: 'https://www.renishaw.com/en/careers--1030', source: 'Renishaw UK Careers' }
    ],
    energy_utilities_environment: [
      { company: 'National Grid UK, SSE Renewables & Thames Water', applyUrl: 'https://jobs.nationalgrid.com/', source: 'National Grid UK' }
    ],
    science_laboratory_research: [
      { company: 'AstraZeneca Cambridge, Oxford Nanopore & British Museum Conservation', applyUrl: 'https://careers.astrazeneca.com/', source: 'AstraZeneca UK' }
    ],
    aviation_aerospace_maritime: [
      { company: 'Rolls-Royce Aerospace Derby, BAE Systems & Subsea7 Aberdeen', applyUrl: 'https://careers.rolls-royce.com/', source: 'Rolls-Royce UK' }
    ],
    telecom_digital_infrastructure: [
      { company: 'BT Openreach Fiber & ARM Ltd Cambridge', applyUrl: 'https://www.openreach.com/careers', source: 'Openreach & ARM UK' }
    ],
    healthcare_medicine: [
      { company: 'NHS Guy’s and St Thomas’ & Imperial College Healthcare', applyUrl: 'https://www.jobs.nhs.uk/', source: 'NHS Jobs Official' },
      { company: 'Bupa Cromwell Hospital London', applyUrl: 'https://careers.bupa.co.uk/', source: 'Bupa UK Careers' }
    ],
    tech_software: [
      { company: 'Google DeepMind London & Monzo Bank', applyUrl: 'https://www.deepmind.com/careers', source: 'DeepMind London' }
    ],
    finance_accounting: [
      { company: 'Barclays Investment Bank & Lloyd’s of London Claims', applyUrl: 'https://search.jobs.barclays/', source: 'Barclays & Lloyd’s' }
    ]
  },
  CA: {
    trades_construction: [
      { company: 'PCL Construction & EllisDon Mass Timber Canada', applyUrl: 'https://www.pcl.com/ca/en/careers', source: 'PCL Constructors' },
      { company: 'Aecon Group Infrastructure & Industrial MEP', applyUrl: 'https://www.aecon.com/careers', source: 'Aecon Canada' }
    ],
    manufacturing_industrial: [
      { company: 'Magna International & Linamar Precision Machining Ontario', applyUrl: 'https://www.magna.com/careers', source: 'Magna Canada' }
    ],
    energy_utilities_environment: [
      { company: 'Hydro-Québec, Ontario Power Generation & Teck Resources Mining', applyUrl: 'https://www.hydroquebec.com/emplois/', source: 'Hydro-Québec & Teck' }
    ],
    aviation_aerospace_maritime: [
      { company: 'Bombardier Aviation Montreal, Pratt & Whitney Canada & Irving Shipbuilding', applyUrl: 'https://bombardier.com/en/careers', source: 'Bombardier Canada' }
    ],
    healthcare_medicine: [
      { company: 'University Health Network (Toronto General Hospital)', applyUrl: 'https://www.uhn.ca/corporate/Careers', source: 'UHN Toronto Careers' }
    ],
    tech_software: [
      { company: 'Shopify & Cohere AI Toronto', applyUrl: 'https://cohere.com/careers', source: 'Cohere AI Careers' }
    ],
    finance_accounting: [
      { company: 'Royal Bank of Canada (RBC) & Desjardins Cooperative', applyUrl: 'https://jobs.rbc.com/', source: 'RBC Careers' }
    ]
  },
  GH: {
    trades_construction: [
      { company: 'WBHO Ghana & Consar Construction Ltd', applyUrl: 'https://www.wbho.co.za/careers/', source: 'WBHO Ghana Careers' },
      { company: 'CPS Ghana & Devtraco Plus MEP Engineering', applyUrl: 'https://devtracoplus.com/', source: 'Devtraco Ghana' }
    ],
    energy_utilities_environment: [
      { company: 'Volta River Authority (VRA), GRIDCo & Newmont Ahafo/Akyem Gold Mines', applyUrl: 'https://www.vra.com/', source: 'VRA & Newmont Ghana' },
      { company: 'Ghana Water Company Ltd (GWCL) & Bui Power Authority', applyUrl: 'https://buipower.com/', source: 'Bui Power Ghana' }
    ],
    aviation_aerospace_maritime: [
      { company: 'Ghana Ports and Harbours Authority (Tema/Takoradi) & Ghana Civil Aviation (GCAA)', applyUrl: 'https://www.ghanaports.gov.gh/', source: 'GPHA & GCAA Ghana' }
    ],
    telecom_digital_infrastructure: [
      { company: 'MTN Ghana Fiber Ops, Telecel & PAIX Accra Data Centre', applyUrl: 'https://www.mtn.com.gh/careers/', source: 'MTN & PAIX Ghana' }
    ],
    science_laboratory_research: [
      { company: 'Noguchi Memorial Institute for Medical Research & CSIR Ghana', applyUrl: 'https://noguchi.ug.edu.gh/', source: 'Noguchi Institute Accra' }
    ],
    healthcare_medicine: [
      { company: 'Nyaho Medical Centre & Korle-Bu Teaching Hospital Accra', applyUrl: 'https://nyahomedical.com/careers/', source: 'Nyaho Medical Careers' },
      { company: 'University of Ghana Medical Centre (UGMC)', applyUrl: 'https://ugmc.ug.edu.gh/', source: 'UGMC Accra' }
    ],
    automotive_mechanics: [
      { company: 'Toyota Ghana Company Ltd & Rana Motors EV/Fleet', applyUrl: 'https://www.toyotaghana.com/', source: 'Toyota Ghana Careers' }
    ]
  }
}

const DEFAULT_COUNTRY_CORPORATIONS: Record<string, { prefix: string; url: string }> = {
  JP: { prefix: 'Mitsubishi / Sony / Kajima Corporation Japan', url: 'https://www.sony.com/en/SonyInfo/Careers/' },
  NG: { prefix: 'Dangote Group / Julius Berger / NLNG / Flutterwave Nigeria', url: 'https://flutterwave.com/careers' },
  AU: { prefix: 'Lendlease / BHP Mining / Qantas Engineering / Ramsay Health Australia', url: 'https://www.lendlease.com/au/careers/' },
  SG: { prefix: 'CapitaLand / SIA Engineering / PSA Port / SingHealth Singapore', url: 'https://www.dbs.com/careers/' },
  NL: { prefix: 'Royal BAM / ASML / Port of Rotterdam / Boskalis Netherlands', url: 'https://www.asml.com/en/careers' },
  ZA: { prefix: 'Murray & Roberts / Anglo American Mining / Netcare / Sasol SA', url: 'https://www.standardbank.com/sbg/standard-bank-group/careers' },
  IN: { prefix: 'Larsen & Toubro (L&T) / Tata Group / Biocon / Apollo Hospitals India', url: 'https://www.larsentoubro.com/corporate/careers/' },
  AE: { prefix: 'Emaar / Emirates Engineering / ADNOC / Cleveland Clinic UAE', url: 'https://properties.emaar.com/en/careers/' },
  BR: { prefix: 'Embraer Aerospace / Vale Mining / Petrobras / Hospital Albert Einstein Brazil', url: 'https://embraer.com/global/en/careers' },
  KE: { prefix: 'Safaricom Fiber / Kenya Airways Technical / KenGen Geothermal / KPA Mombasa', url: 'https://www.safaricom.co.ke/careers' },
  MX: { prefix: 'CEMEX / Safran Querétaro Aerospace / Ternium Monterrey / Grupo México', url: 'https://www.cemex.com/careers' },
  ES: { prefix: 'ACS Dragados / Iberdrola Renewables / Airbus Getafe / Navantia Spain', url: 'https://www.iberdrola.com/talent' },
  IT: { prefix: 'Leonardo Aerospace / Webuild / Enel Green Power / Ferrari Maranello Italy', url: 'https://www.leonardocompany.com/en/careers' },
  SE: { prefix: 'Volvo Group / Atlas Copco / Vattenfall / Saab / Northvolt Sweden', url: 'https://www.volvogroup.com/en/careers.html' },
  CH: { prefix: 'ABB Robotics / Roche / Novartis / Rolex Horology / SBB Switzerland', url: 'https://careers.abb/' },
  IE: { prefix: 'ESB Networks / Pfizer Ringaskiddy / AerCap / Intel Leixlip Ireland', url: 'https://www.esb.ie/careers' },
  PL: { prefix: 'KGHM Polska Miedź / Orlen / Pratt & Whitney Rzeszów / Remontowa Poland', url: 'https://kghm.com/en/careers' },
  KR: { prefix: 'Hyundai Heavy Industries / Samsung Biologics / POSCO / Korean Air Tech', url: 'https://www.samsungbiologics.com/' },
  SA: { prefix: 'NEOM / Saudi Aramco / Red Sea Global / Ma’aden Mining KSA', url: 'https://www.neom.com/en-us/careers' },
  EG: { prefix: 'Orascom Construction / Suez Canal Authority / Elsewedy Electric Egypt', url: 'https://orascom.com/careers/' }
}

function convertUsdSalaryToCountry(usdRange: string, country: CountryConfig): string {
  if (country.code === 'US') return usdRange
  const matches = usdRange.match(/\d[\d,]*/g)
  if (!matches || matches.length === 0) {
    return `${country.currencySymbol}85,000 - ${country.currencySymbol}125,000 / yr`
  }
  const nums = matches.map(m => parseInt(m.replace(/,/g, ''), 10)).filter(n => !isNaN(n))
  const lowBase = nums[0] && nums[0] > 1000 ? nums[0] : 95000
  const highBase = nums[1] && nums[1] > 1000 ? nums[1] : Math.round(lowBase * 1.35)

  const multipliers: Record<string, number> = {
    FR: 0.78, // EUR France scale
    DE: 0.84, // EUR Germany scale
    NL: 0.85, // EUR Netherlands scale
    ES: 0.74, // EUR Spain scale
    IT: 0.75, // EUR Italy scale
    IE: 0.86, // EUR Ireland scale
    GB: 0.72, // GBP UK scale
    CA: 1.22, // CAD scale
    AU: 1.38, // AUD scale
    SG: 1.25, // SGD scale
    CH: 1.05, // CHF Switzerland scale
    SE: 7.8,  // SEK Sweden scale
    PL: 2.9,  // PLN Poland scale
    GH: 3.1,  // GHS local executive band
    NG: 320,  // NGN local band
    ZA: 9.5,  // ZAR local band
    KE: 38,   // KES local band
    EG: 14,   // EGP local band
    IN: 28,   // INR local band
    AE: 3.2,  // AED annual tax-free band
    SA: 3.3,  // SAR annual tax-free band
    JP: 95,   // JPY scale
    KR: 920,  // KRW scale
    BR: 2.8,  // BRL scale
    MX: 9.2   // MXN scale
  }
  const mult = multipliers[country.code] || 1
  const low = Math.round((lowBase * mult) / 1000) * 1000
  const high = Math.round((highBase * mult) / 1000) * 1000

  return `${country.currencySymbol}${low.toLocaleString()} - ${country.currencySymbol}${high.toLocaleString()} / yr`
}

const ENCLAVE_AVATAR_MAP: Record<string, string> = {
  trades_construction: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&auto=format&fit=crop&q=80',
  automotive_mechanics: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100&auto=format&fit=crop&q=80',
  agriculture_natural_resources: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=100&auto=format&fit=crop&q=80',
  personal_services_wellness: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&auto=format&fit=crop&q=80',
  culinary_hospitality_events: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&auto=format&fit=crop&q=80',
  commerce_small_business: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80',
  creative_media_arts: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=100&auto=format&fit=crop&q=80',
  healthcare_medicine: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&auto=format&fit=crop&q=80',
  education_workforce: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=100&auto=format&fit=crop&q=80',
  community_civic_security: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=100&auto=format&fit=crop&q=80',
  campus_students: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=100&auto=format&fit=crop&q=80',
  tech_software: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
  tech_cybersecurity: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
  law_gov_defense: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=100&auto=format&fit=crop&q=80',
  finance_accounting: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&auto=format&fit=crop&q=80',
  manufacturing_industrial: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&auto=format&fit=crop&q=80',
  energy_utilities_environment: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=100&auto=format&fit=crop&q=80',
  science_laboratory_research: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=100&auto=format&fit=crop&q=80',
  aviation_aerospace_maritime: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=100&auto=format&fit=crop&q=80',
  telecom_digital_infrastructure: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=100&auto=format&fit=crop&q=80'
}

/**
 * Generates a dedicated, localized job opening for any ProfessionDefinition in a target CountryConfig
 * so that EVERY SINGLE PROFESSION across all 20 enclaves and 42 categories has a listed job in EVERY region.
 */
function buildJobForProfessionInCountry(
  prof: ProfessionDefinition,
  country: CountryConfig,
  idx: number
): GlobalJobItem {
  const realHubs = country.hubs.filter(h => h !== 'All Hubs')
  const hub = realHubs.length > 0 ? realHubs[idx % realHubs.length] : country.name
  const isRemoteHub = hub.toLowerCase().includes('remote')
  const workplace: 'Remote' | 'Hybrid' | 'On-site' = isRemoteHub
    ? 'Remote'
    : idx % 3 === 0
    ? 'On-site'
    : 'Hybrid'

  const enc = prof.enclaveId
  const countryEmployerList =
    country.code === 'US'
      ? US_EMPLOYERS_BY_ENCLAVE[enc]
      : REGIONAL_EMPLOYERS_BY_COUNTRY[country.code]?.[enc]

  const chosenEmployer =
    countryEmployerList && countryEmployerList.length > 0
      ? countryEmployerList[idx % countryEmployerList.length]
      : null

  const fallbackCorp = DEFAULT_COUNTRY_CORPORATIONS[country.code]
  const usDefaultList = US_EMPLOYERS_BY_ENCLAVE[enc]
  const baseEmployerName =
    usDefaultList && usDefaultList.length > 0
      ? usDefaultList[idx % usDefaultList.length].company
      : 'Verified Regional Partner'

  const companyName = chosenEmployer
    ? chosenEmployer.company
    : fallbackCorp
    ? `${fallbackCorp.prefix.split('/')[idx % fallbackCorp.prefix.split('/').length].trim()} — ${prof.categoryName}`
    : `${baseEmployerName} (${country.name})`

  const applyUrl = chosenEmployer
    ? chosenEmployer.applyUrl
    : fallbackCorp
    ? fallbackCorp.url
    : usDefaultList?.[0]?.applyUrl || 'https://www.connectln.app/connectin'

  const source = chosenEmployer
    ? chosenEmployer.source
    : `${country.name} Verified Employer Portal`

  const baseUsdSalary =
    enc === 'tech_software' || enc === 'tech_cybersecurity' || enc === 'law_gov_defense'
      ? '$135,000 - $190,000 / yr'
      : enc === 'aviation_aerospace_maritime' || enc === 'energy_utilities_environment' || enc === 'finance_accounting'
      ? '$102,000 - $148,000 / yr'
      : '$84,000 - $124,000 / yr'

  const toolNames = (prof.tools || []).map(t => t.name)
  const topSkills = (prof.typicalSkills || []).slice(0, 4)

  return {
    id: `${country.code.toLowerCase()}_prof_${prof.id}`,
    countryCode: country.code,
    countryName: country.name,
    professionEnclave: prof.enclaveId,
    professionId: prof.id,
    domainCategory: prof.categoryName || 'Recommended',
    title: `${prof.title} — ${hub.split('(')[0].trim()}`,
    company: companyName,
    companyLogo: ENCLAVE_AVATAR_MAP[enc] || ENCLAVE_AVATAR_MAP.trades_construction,
    location: `${hub} (${workplace})`,
    hub,
    workplaceType: workplace,
    employmentType: idx % 5 === 4 ? 'Contract' : 'Full-time',
    postedTime: `${(idx % 6) + 1}h ago`,
    applicantsCount: ((idx * 7) % 24) + 3,
    salaryRange: convertUsdSalaryToCountry(baseUsdSalary, country),
    easyApply: true,
    requiredProductExperience: [
      toolNames[0] || `${prof.categoryName} Field Equipment`,
      topSkills.slice(0, 2).join(' & ') || 'Verified Practical Competency'
    ],
    description: `Active opening for a verified ${prof.title} in ${hub}, ${country.name}. ${prof.defaultHeadline}. Candidates with hands-on work portfolios, trade/clinical/technical licenses, equipment hours, or STARs alternative-route credentials (no 4-year degree gatekeeping) are prioritized.`,
    requirements: [
      ...topSkills.map(s => `Verified practical competency in ${s}`),
      `Hands-on portfolio, trade license, or field verification in ${prof.categoryName}`
    ],
    languageRequirement:
      country.languages.length > 1
        ? `${country.languages[0]} & ${country.languages[1]}`
        : country.primaryLanguage,
    applyUrl,
    source,
    tags: [
      prof.title,
      prof.categoryName,
      ...topSkills.slice(0, 3),
      hub.split(' ')[0].replace(/[,()]/g, ''),
      'Recommended'
    ]
  }
}

/**
 * Returns real, country-accurate jobs for ANY of the 26 countries and 20 profession enclaves,
 * AND guarantees that EVERY SINGLE PROFESSION in ALL_PROFESSIONS has a listed job in that region!
 */
export function getLocalizedJobsForCountryAndEnclave(
  countryCode: string = 'US',
  enclaveId: string = 'all',
  extraJobs: GlobalJobItem[] = []
): GlobalJobItem[] {
  const country = COUNTRIES_CONFIG.find(c => c.code === countryCode) || COUNTRIES_CONFIG[0]
  const realHubs = country.hubs.filter(h => h !== 'All Hubs')

  const allExplicit = [...extraJobs, ...GLOBAL_JOBS_CATALOG]

  // 1. Direct explicit matches for this exact country & enclave
  const directCountryMatches = allExplicit.filter(j => {
    const countryMatch = j.countryCode === countryCode
    const enclaveMatch = !enclaveId || enclaveId === 'all' || j.professionEnclave === enclaveId
    return countryMatch && enclaveMatch
  })

  // 2. For non-US countries, localize all curated GLOBAL_JOBS_CATALOG US templates
  let localizedFromTemplates: GlobalJobItem[] = []
  if (countryCode !== 'US') {
    const baseTemplates = GLOBAL_JOBS_CATALOG.filter(j => {
      if (j.countryCode !== 'US') return false
      if (!enclaveId || enclaveId === 'all') return true
      return j.professionEnclave === enclaveId
    })

    localizedFromTemplates = baseTemplates.map((tmpl, idx) => {
      const enc = tmpl.professionEnclave || 'trades_construction'
      const countryEmployerList = REGIONAL_EMPLOYERS_BY_COUNTRY[countryCode]?.[enc]
      const chosenEmployer =
        countryEmployerList && countryEmployerList.length > 0
          ? countryEmployerList[idx % countryEmployerList.length]
          : null

      const fallbackCorp = DEFAULT_COUNTRY_CORPORATIONS[countryCode]
      const hub = realHubs.length > 0 ? realHubs[idx % realHubs.length] : country.name
      const isRemoteHub = hub.toLowerCase().includes('remote')
      const workplace: 'Remote' | 'Hybrid' | 'On-site' = isRemoteHub ? 'Remote' : tmpl.workplaceType

      const companyName = chosenEmployer
        ? chosenEmployer.company
        : fallbackCorp
        ? `${tmpl.company.split('—')[0].trim()} (${country.name} Division)`
        : `${tmpl.company.split('—')[0].trim()} ${country.name}`

      const applyUrl = chosenEmployer
        ? chosenEmployer.applyUrl
        : fallbackCorp
        ? fallbackCorp.url
        : tmpl.applyUrl

      const source = chosenEmployer
        ? chosenEmployer.source
        : `${country.name} Direct Employer Portal`

      return {
        ...tmpl,
        id: `${countryCode.toLowerCase()}_${tmpl.id}`,
        countryCode: country.code,
        countryName: country.name,
        company: companyName,
        location: `${hub} (${workplace})`,
        hub,
        workplaceType: workplace,
        salaryRange: convertUsdSalaryToCountry(tmpl.salaryRange, country),
        languageRequirement:
          country.languages.length > 1
            ? `${country.languages[0]} & ${country.languages[1]}`
            : country.primaryLanguage,
        applyUrl,
        source,
        tags: [
          hub.split(' ')[0].replace(/[,()]/g, ''),
          ...tmpl.tags.filter(t => !['Austin', 'Seattle', 'Boston', 'New York', 'San Francisco', 'US Remote', 'DC Metro'].includes(t))
        ]
      }
    })
  }

  // 3. Guarantee that EVERY SINGLE PROFESSION in ALL_PROFESSIONS has a dedicated, localized job in this country!
  const matchingProfessions = ALL_PROFESSIONS.filter(p =>
    !enclaveId || enclaveId === 'all' ? true : p.enclaveId === enclaveId
  )
  const exhaustiveProfessionJobs: GlobalJobItem[] = matchingProfessions.map((prof, idx) =>
    buildJobForProfessionInCountry(prof, country, idx)
  )

  // Combine direct explicit jobs + localized templates + exhaustive per-profession jobs (deduplicated)
  const seenIds = new Set<string>()
  const merged: GlobalJobItem[] = []

  const combinedPool = [...directCountryMatches, ...localizedFromTemplates, ...exhaustiveProfessionJobs]
  const orderedPool =
    !enclaveId || enclaveId === 'all'
      ? [
          ...combinedPool.filter(j => j.professionEnclave === 'healthcare_medicine'),
          ...combinedPool.filter(j => j.professionEnclave !== 'healthcare_medicine')
        ]
      : combinedPool

  for (const item of orderedPool) {
    if (!seenIds.has(item.id)) {
      merged.push(item)
      seenIds.add(item.id)
    }
  }

  return merged
}

export function getEnclaveGlobalJobs(enclaveId?: string, countryCode: string = 'US'): GlobalJobItem[] {
  return getLocalizedJobsForCountryAndEnclave(countryCode, enclaveId || 'all')
}

