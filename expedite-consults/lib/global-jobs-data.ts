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
  // ================= UNITED STATES =================
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
