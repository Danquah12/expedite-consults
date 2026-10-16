export interface ParsedExperience {
  id: string
  role: string
  company: string
  companyLogo?: string
  employmentType?: string
  duration: string
  location: string
  description: string
  skills: string[]
}

export interface ParsedEducation {
  id: string
  school: string
  schoolLogo?: string
  degree: string
  fieldOfStudy: string
  duration: string
}

export interface ParsedResumeResult {
  candidateName: string
  headline: string
  email?: string
  phone?: string
  location?: string
  about?: string
  experiences: ParsedExperience[]
  skills: string[]
  education: ParsedEducation[]
  confidenceScore: number
}

// ─────────────────────────────────────────────────────────────────────────────
// 1-CLICK DEMO RESUMES FOR INSTANT TESTING & ENCLAVE BUILDING
// ─────────────────────────────────────────────────────────────────────────────
export const KWESI_ASIEDU_PARSED_DATA: ParsedResumeResult = {
  candidateName: 'Kwesi Asiedu',
  headline: 'Cybersecurity Leader | DoD, Pentagon & DTSA | Zero Trust • SecOps • RMF | TS/SCI',
  email: 'asiedudanquah@gmail.com',
  phone: '+1 (240) 555-0192',
  location: 'Washington DC-Baltimore Area',
  about: 'Cybersecurity Leader & Principal Security Architect with 14+ years directing DoD/Pentagon programs, FBI systems, U.S. Department of State Diplomatic Security Red Teams, and KPMG enterprise engagements. Proven expert in Zero Trust Architecture, RMF Lifecycle & ATO, Vulnerability Management, Advanced Penetration Testing, and Multi-Cloud Security Governance across mission-critical defense environments.',
  confidenceScore: 100,
  skills: [
    'Zero Trust Architecture', 'RMF & ATO', 'Security Operations', 'Vulnerability Management',
    'Incident Response', 'Threat Detection & Monitoring', 'Security Automation', 'Cloud Security',
    'Risk Management', 'Security Architecture', 'ISSM/ISSE/ISSO', 'Team Leadership',
    'Top Secret / SCI', 'ACAS', 'Nessus', 'Snyk', 'Splunk', 'QRadar', 'XACTA', 'eMASS',
    'Burp Suite', 'Metasploit', 'Power BI', 'Python', 'Bash', 'AWS', 'Azure', 'GCP',
    'NIST RMF', 'NIST 800-53', 'STIG Compliance', 'Cobalt Strike', 'Threat Hunting',
    'Adversary Emulation', 'FedRAMP', 'ISO 27001', 'FISMA', 'SAST', 'DAST', 'Cisco Nexus'
  ],
  education: [
    {
      id: 'kwesi_edu_1',
      school: 'Johns Hopkins University',
      degree: 'Master of Science',
      fieldOfStudy: 'Cybersecurity & Information Assurance',
      duration: 'Graduated'
    }
  ],
  experiences: [
    {
      id: 'kwesi_exp_1',
      role: 'Cybersecurity Leader | DoD, Pentagon & DTSA | Zero Trust • SecOps • RMF | TS/SCI',
      company: 'Syneren Technologies Corporation',
      companyLogo: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&auto=format&fit=crop&q=80',
      employmentType: 'Contract',
      duration: 'Mar 2026 – Present · 8 mos',
      location: 'United States · On-site',
      description: 'Lead cybersecurity initiatives supporting DoD/Pentagon programs, driving the adoption of Zero Trust principles, RMF compliance, and enterprise security operations. Provide leadership and strategic oversight for vulnerability management, incident response, threat detection, security monitoring, and risk management activities across mission-critical environments. Partner with engineering, infrastructure, compliance, and program stakeholders to strengthen organizational security posture and ensure alignment with federal cybersecurity requirements and business objectives. Lead the implementation of security automation and process optimization initiatives to enhance operational efficiency, scalability, and security visibility. Advise senior leadership, ISSMs, ISSOs, and Authorizing Officials on cybersecurity strategy, risk-based decision making, RMF authorization activities, and security governance. Drive continuous monitoring, vulnerability remediation, POA&M management, and compliance efforts in accordance with NIST RMF, NIST 800-53, and DoD cybersecurity standards. Mentor and develop cybersecurity professionals while fostering a culture of accountability, collaboration, technical excellence, and continuous improvement.',
      skills: ['Zero Trust Architecture', 'RMF & ATO', 'Security Operations', 'Vulnerability Management', 'Incident Response', 'Threat Detection & Monitoring', 'Security Automation', 'Cloud Security', 'Risk Management', 'Security Architecture', 'ISSM/ISSE/ISSO', 'Team Leadership', 'Top Secret / SCI']
    },
    {
      id: 'kwesi_exp_2',
      role: 'Lead Cybersecurity Engineer (ISSE) | RMF, ATO & Vulnerability Management | FBI',
      company: 'Open Systems Technology (OST) · FBI',
      companyLogo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80',
      employmentType: 'Contract',
      duration: 'Dec 2025 – Mar 2026 · 4 mos',
      location: 'Washington DC-Baltimore Area · On-site',
      description: 'Served as the senior cybersecurity technical authority and ISSE Lead, supporting ISSO functions across multiple FBI systems and providing guidance to cybersecurity engineering teams on risk-informed security decisions and ATO activities. Led SAST, DAST, web application, infrastructure, and advanced penetration testing efforts, validating attack paths and mapping findings to NIST 800-53 controls to support Authorization to Operate (ATO) decisions. Managed the full POA&M lifecycle, including documentation, risk-based prioritization, remediation tracking, and closure activities, reducing enterprise vulnerability exposure by 40% within 60 days. Authored and maintained RMF artifacts, including SSPs, SARs, and POA&Ms within XACTA, ensuring traceability between vulnerabilities, control deficiencies, remediation efforts, and compliance requirements. Developed Python and Bash automation solutions for vulnerability scanning, compliance validation, and remediation tracking. Designed executive-level Power BI dashboards providing real-time visibility into vulnerability trends, compliance posture, and organizational risk exposure. Collaborated with DevOps and infrastructure teams to implement secure configurations across Linux (RHEL/CentOS) and cloud environments (AWS and Azure), applying DISA STIG requirements and validating compliance through SCAP scanning.',
      skills: ['ACAS', 'Nessus', 'Snyk', 'AWS GuardDuty', 'AWS Inspector', 'Splunk', 'QRadar', 'ServiceNow', 'XACTA', 'eMASS', 'Burp Suite', 'Metasploit', 'Power BI', 'Python', 'Bash', 'AWS', 'Azure', 'NIST RMF', 'NIST 800-53']
    },
    {
      id: 'kwesi_exp_3',
      role: 'Cybersecurity SME (ISSE) | Federal Security, RMF & Cloud Compliance',
      company: 'Linea Solutions',
      companyLogo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=80',
      employmentType: 'Contract',
      duration: 'Feb 2025 – Dec 2025 · 11 mos',
      location: 'United States · Remote',
      description: 'Provided strategic cybersecurity advisory services to federal clients, supporting secure system modernization efforts and maintaining alignment with evolving federal and DoD cybersecurity requirements. Advised stakeholders on Risk Management Framework (RMF) implementation, vulnerability management programs, STIG compliance, and continuous monitoring strategies to strengthen organizational security posture. Supported cloud security and compliance initiatives, including FedRAMP readiness planning and security governance for AWS, Azure, and GCP environments. Assisted organizations in preparing for Cybersecurity Compliance and Risk Inspections (CCRIs) by evaluating security controls, identifying compliance gaps, and recommending remediation strategies. Provided guidance on NIST SP 800-53 Rev. 5 controls, Zero Trust Architecture principles, risk management practices, and authorization requirements within federal environments.',
      skills: ['RMF', 'NIST 800-53 Rev. 5', 'Zero Trust Architecture', 'Vulnerability Management', 'Continuous Monitoring', 'STIG Compliance', 'CCRI Readiness', 'FedRAMP', 'Cloud Security (AWS, Azure, GCP)', 'Risk Management', 'Security Compliance']
    },
    {
      id: 'kwesi_exp_4',
      role: 'Cybersecurity Lead (ISSE/ISSO) | RMF, Pen Testing & Cloud Security | DHS/CISA',
      company: 'ALTA IT Services, LLC · DHS/CISA',
      companyLogo: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=100&auto=format&fit=crop&q=80',
      employmentType: 'Contract',
      duration: 'Nov 2024 – Feb 2025 · 4 mos',
      location: 'United States · Remote',
      description: 'Served as the Subject Matter Expert (SME) ISSE and Acting ISSO for multiple DHS/CISA systems, leading full lifecycle Risk Management Framework (RMF) implementation and driving system authorization efforts. Independently achieved and maintained Authorization to Operate (ATO) status by managing RMF activities, coordinating security assessments, and ensuring continuous monitoring readiness. Authored and maintained security documentation, including System Security Plans (SSPs), Security Assessment Reports (SARs), Contingency Plans, and POA&Ms. Led vulnerability management and advanced penetration testing activities utilizing ACAS/Nessus, SCAP, STIG assessments, and exploitability analysis to support risk-based remediation. Partnered with development and engineering teams to integrate security throughout the SDLC, supporting secure architecture design and threat modeling. Leveraged ServiceNow, Splunk, and QRadar to automate compliance monitoring, reporting, and security workflows.',
      skills: ['ACAS', 'Nessus', 'SCAP', 'STIG Viewer', 'Burp Suite', 'Metasploit', 'Splunk', 'QRadar', 'ServiceNow', 'AWS', 'Azure', 'GCP', 'NIST RMF', 'NIST 800-53', 'Top Secret Clearance']
    },
    {
      id: 'kwesi_exp_5',
      role: 'Red Team Lead | Penetration Testing, Adversary Simulation & Cloud Security',
      company: 'SkyePoint Decisions, Inc. · U.S. Department of State (Diplomatic Security)',
      companyLogo: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=100&auto=format&fit=crop&q=80',
      employmentType: 'Contract',
      duration: 'Oct 2023 – Nov 2024 · 1 yr 2 mos',
      location: 'Washington DC-Baltimore Area · Remote',
      description: 'Led Red Cell penetration testing and adversary simulation operations supporting the U.S. Department of State’s Diplomatic Security division, identifying and validating real-world attack paths across enterprise environments. Conducted advanced penetration testing across applications, networks, cloud platforms, and enterprise infrastructure, leveraging manual exploitation, attack path analysis, and adversary emulation to support risk-informed security decisions and ATO activities. Performed security assessments aligned with NIST 800-53 and RMF requirements, translating offensive security findings into actionable remediation strategies. Led risk assessments across AWS, Azure, Microsoft 365, and on-premises environments. Executed SAST and DAST assessments against web applications and APIs, combining vulnerability intelligence, exploitability analysis, and Tenable/Nessus findings. Conducted proactive threat hunting and incident response investigations. Developed Python-based security automation tools to streamline vulnerability detection, scan orchestration, compliance validation, and reporting processes.',
      skills: ['Burp Suite', 'Metasploit', 'Cobalt Strike', 'Nmap', 'Nessus', 'Tenable', 'OWASP ZAP', 'Python', 'AWS', 'Azure', 'Microsoft 365', 'Threat Hunting', 'Adversary Emulation', 'NIST 800-53', 'RMF', 'Top Secret Clearance']
    },
    {
      id: 'kwesi_exp_6',
      role: 'Cybersecurity Manager | Security Advisory, Penetration Testing & Risk Management',
      company: 'KPMG US',
      companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80',
      employmentType: 'Full-time',
      duration: 'Dec 2021 – Mar 2023 · 1 yr 4 mos',
      location: 'Washington, District of Columbia, United States · Remote',
      description: 'Led enterprise cybersecurity and penetration testing engagements for Fortune 500, federal, and DoD clients, delivering risk-based security solutions aligned with business and regulatory requirements. Managed and mentored cross-functional teams of 10+ cybersecurity professionals responsible for penetration testing, vulnerability management, compliance assessments, and security advisory services. Directed security assessments across web applications, APIs, cloud environments, IoT platforms, wireless networks, and enterprise infrastructure. Advised executive stakeholders on cybersecurity strategy, risk management, and security governance, translating technical findings into actionable business decisions and remediation roadmaps. Guided organizations through compliance and security initiatives supporting NIST 800-53, FISMA, FedRAMP, ISO 27001, SOX, GDPR, and CIS framework requirements. Partnered with clients to develop Statements of Work (SOWs), define engagement scope, conduct third-party risk assessments, and align security investments with organizational objectives.',
      skills: ['NIST 800-53', 'NIST CSF', 'FISMA', 'FedRAMP', 'ISO 27001', 'SOX', 'GDPR', 'CIS Controls', 'Incident Response', 'Team Leadership', 'Security Advisory']
    },
    {
      id: 'kwesi_exp_7',
      role: 'Penetration Testing Lead | Application Security & Security Assessments | NIAID',
      company: 'Softworld, a Kelly Company · NIAID',
      companyLogo: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=100&auto=format&fit=crop&q=80',
      employmentType: 'Contract',
      duration: 'Jan 2020 – Dec 2021 · 2 yrs',
      location: 'United States · Hybrid',
      description: 'Led enterprise penetration testing and security assessment operations supporting NIAID, managing both onshore manual testing teams and offshore automated testing teams across a portfolio of more than 200 applications. Directed penetration testing engagements across web applications, APIs, mobile applications, networks, and social engineering scenarios, ensuring compliance with NIST 800-53, FedRAMP, and HIPAA requirements. Managed Security Integration Testing (SIT) and User Acceptance Testing (UAT) security activities for over 200 software applications. Conducted SAST and DAST assessments using both manual and automated methodologies, performing threat modeling and attack surface analysis. Evaluated PKI-enabled applications to validate cryptographic implementations and certificate management processes. Collaborated closely with software development and engineering teams to validate findings, perform root-cause analysis, and drive timely remediation of security vulnerabilities.',
      skills: ['Burp Suite', 'Metasploit', 'Nmap', 'Nessus', 'OWASP ZAP', 'Veracode', 'Checkmarx', 'Python', 'SAST', 'DAST', 'Threat Modeling', 'PKI', 'NIST 800-53', 'FedRAMP', 'HIPAA']
    },
    {
      id: 'kwesi_exp_8',
      role: 'Senior Cybersecurity Engineer | Security Operations, RMF & Cloud Security',
      company: 'IBM Promontory Financial Group',
      companyLogo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100&auto=format&fit=crop&q=80',
      employmentType: 'Full-time',
      duration: 'Feb 2018 – Sep 2021 · 3 yrs 8 mos',
      location: 'Washington DC · Hybrid',
      description: 'Led enterprise cybersecurity operations supporting more than 1,500 personnel and 30,000+ customers across cloud and on-premises environments for a global financial services organization. Directed vulnerability management, penetration testing, and continuous monitoring programs across enterprise networks, applications, and data center environments. Executed Risk Management Framework (RMF) activities, including system categorization, security control selection, control assessments, and authorization support in alignment with NIST 800-53 and FISMA requirements. Implemented cloud security solutions leveraging AWS IAM, Single Sign-On (SSO), Multi-Factor Authentication (MFA), and Cloud Access Security Broker (CASB) technologies. Led global incident response and security operations activities, coordinating the detection, containment, investigation, and remediation of cybersecurity incidents. Developed and maintained security documentation, including SSPs, SARs, and POA&Ms.',
      skills: ['Nessus', 'Splunk', 'QRadar', 'ServiceNow', 'AWS', 'Burp Suite', 'Metasploit', 'Nmap', 'McAfee', 'Cisco ASA', 'NIST 800-53', 'FISMA', 'RMF', 'CASB', 'IAM & SSO']
    },
    {
      id: 'kwesi_exp_9',
      role: 'Cybersecurity Consultant | Vulnerability Management, Penetration Testing & Compliance',
      company: 'Expedite Consults LLC',
      companyLogo: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=100&auto=format&fit=crop&q=80',
      employmentType: 'Contract',
      duration: 'Jul 2017 – May 2018 · 11 mos',
      location: 'Remote / United States · Remote',
      description: 'Led vulnerability management, penetration testing, and compliance initiatives for public and private sector clients, helping organizations strengthen security posture and reduce operational risk. Directed internal and external security assessments across applications, networks, cloud environments, and supporting infrastructure. Conducted penetration testing and security validation activities aligned with NIST, CIS Controls, and ISO 27001 cybersecurity frameworks. Advised stakeholders on security governance, compliance readiness, risk management, and cybersecurity best practices. Developed compliance reporting dashboards and security metrics, providing leadership with visibility into vulnerability trends, remediation progress, and overall security posture.',
      skills: ['Vulnerability Management', 'Penetration Testing', 'Security Assessments', 'Compliance & Governance', 'NIST Frameworks', 'CIS Controls', 'ISO 27001', 'Risk Management', 'Security Metrics', 'Audit Readiness']
    },
    {
      id: 'kwesi_exp_10',
      role: 'Senior Penetration Tester | Offensive Security & Vulnerability Management',
      company: 'Evolver',
      companyLogo: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=100&auto=format&fit=crop&q=80',
      employmentType: 'Contract',
      duration: 'Aug 2017 – Feb 2018 · 7 mos',
      location: 'Virginia, United States',
      description: 'Conducted penetration testing and vulnerability assessments for federal and government agency clients, managing engagements from planning and scoping through validation, reporting, and remediation support. Executed black-box, gray-box, and white-box penetration testing across web applications, internal networks, wireless environments, and enterprise infrastructure to identify and validate security vulnerabilities. Performed adversary emulation and attack simulations to uncover exploitable weaknesses, assess security controls, and evaluate organizational resilience against real-world threats. Analyzed vulnerabilities and security findings to develop risk-based remediation recommendations.',
      skills: ['Burp Suite', 'Metasploit', 'Nmap', 'Nessus', 'Wireshark', 'Aircrack-ng', 'Web Application Security', 'Network Security', 'Wireless Security', 'Vulnerability Assessment', 'Penetration Testing']
    },
    {
      id: 'kwesi_exp_11',
      role: 'Lead Network Security Engineer | Enterprise Security & Network Architecture',
      company: 'Agile1Tech Corporation',
      companyLogo: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=100&auto=format&fit=crop&q=80',
      employmentType: 'Contract',
      duration: 'Jan 2012 – Aug 2017 · 5 yrs 8 mos',
      location: 'United States · Remote',
      description: 'Led the design, implementation, and security of enterprise network infrastructure supporting WAN, LAN, and WLAN environments, as well as Physical Access Control Systems (PACS), Electronic Security Systems (ESS), and Building Automation Systems (BAS). Served as Technical and Project Lead for enterprise security initiatives involving intrusion prevention, web security, traffic management, and network monitoring solutions across government and commercial environments. Designed, deployed, and maintained secure VPN connectivity while supporting and monitoring more than 250 Cisco network devices operating across complex OSPF and BGP enterprise networks. Directed the migration of remote offices to a modern MPLS infrastructure and implemented Cisco Nexus technologies, including FabricPath, vPC+, and Virtual Device Contexts (VDCs). Implemented network segmentation, access control policies, and traffic management solutions using ACLs, Route Maps, and IP Prefix Lists.',
      skills: ['Cisco Nexus', 'Cisco ASA/PIX', 'OSPF', 'BGP', 'MPLS', 'VPN', 'Cisco FabricPath', 'vPC+', 'VDC', 'Radware', 'McAfee Intrushield IDS/IPS', 'Websense', 'Network Security', 'Penetration Testing', 'Vulnerability Management']
    }
  ]
}

export const DEMO_RESUME_PRESETS: {
  id: string
  title: string
  category: string
  icon: string
  sampleText: string
  parsed: ParsedResumeResult
}[] = [
  {
    id: 'kwesi_asiedu_cyber',
    title: 'Kwesi Asiedu (DoD & Pentagon Cybersecurity Leader)',
    category: 'Defense, Intelligence & Pentagon Enclave',
    icon: '🛡️',
    sampleText: `KWESI ASIEDU
Cybersecurity Leader | DoD, Pentagon & DTSA | Zero Trust • SecOps • RMF | TS/SCI
Washington DC-Baltimore Area | asiedudanquah@gmail.com | (240) 555-0192

PROFESSIONAL SUMMARY
Cybersecurity Leader & Principal Security Architect with 14+ years directing DoD/Pentagon programs, FBI systems, U.S. Department of State Diplomatic Security Red Teams, and KPMG enterprise engagements. Proven expert in Zero Trust Architecture, RMF Lifecycle & ATO, Vulnerability Management, Advanced Penetration Testing, and Multi-Cloud Security Governance across mission-critical defense environments.

WORK EXPERIENCE
[Cybersecurity Leader | DoD, Pentagon & DTSA | Zero Trust • SecOps • RMF | TS/SCISyneren Technologies Corporation · ContractMar 2026 - Present · 8 mosUnited States · On-site](https://www.linkedin.com/)Lead cybersecurity initiatives supporting DoD/Pentagon programs...`,
    parsed: KWESI_ASIEDU_PARSED_DATA
  },
  {
    id: 'trades_carpenter',
    title: 'Master Carpenter & Site Superintendent',
    category: 'Trades & Construction Enclave',
    icon: '🔨',
    sampleText: `DAVID MILLER
Master Tradesman & Site Superintendent (Level 2)
Baltimore, MD | david.carpenter@timbercraft.io | (410) 555-0182

PROFESSIONAL SUMMARY
Master Carpenter and Construction Site Superintendent with 14+ years of hands-on leadership directing heavy timber framing, commercial architectural millwork, historic restorations, and multi-story commercial job sites. Proven record of zero-incident OSHA records, subcontractor orchestration, and delivering multi-million dollar structural projects on schedule.

WORK EXPERIENCE

Lead Timber Framing Superintendent & Site Foreman
Apex Structural Builders | Baltimore, MD
2022 – Present
- Direct on-site operations for $18M+ mass-timber and heavy wood commercial framing projects across the Mid-Atlantic corridor.
- Supervise 32 union tradesmen, carpenters, riggers, and apprentices with a spotless 100% OSHA safety compliance track record.
- Coordinate directly with structural engineers and architects to resolve BIM/CAD framing conflicts prior to crane assembly.
- Implemented lean material tracking reducing high-grade dimensional lumber wastage by 22%.
Skills: Heavy Timber Framing, OSHA 30, Bluebeam Revu, CAD/BIM Layout, Rigging, Structural Framing, Subcontractor Management

Senior Finish Carpenter & Millwork Crew Lead
Heritage Craft Woodworks | Annapolis, MD
2018 – 2022
- Led custom architectural millwork fabrication and installation for historic commercial preservation landmarks and luxury estates.
- Fabricated complex compound-miter crown mouldings, curved staircases, coffered ceiling systems, and custom casework.
- Mentored 8 apprentice carpenters through state journeyman certification programs.
Skills: Custom Millwork, Architectural Woodworking, CNC Routing, Cabinetry, Blueprint Reading, Quality Assurance

Commercial Framing Carpenter & Site Layout Specialist
Mid-Atlantic Commercial Interiors | Columbia, MD
2014 – 2018
- Executed laser-guided interior layout, light-gauge steel stud framing, and acoustic baffle ceiling assemblies.
- Partnered with drywall, MEP, and HVAC trades to maintain inspection readiness ahead of city code reviews.
Skills: Metal Stud Framing, Laser Layout, Acoustic Ceilings, Drywall Integration, Jobsite Safety

EDUCATION & APPRENTICESHIP
Maryland Department of Labor – Bureau of Apprenticeship
Journeyman Carpenter Certification & Carpentry Red Seal | 2010 – 2014

CERTIFICATIONS
- OSHA 30-Hour Construction Safety
- Procore Certified: Superintendent
- First Aid, CPR & AED Certified`,
    parsed: {
      candidateName: 'David Miller',
      headline: 'Master Carpenter & Site Superintendent (Level 2)',
      email: 'david.carpenter@timbercraft.io',
      phone: '(410) 555-0182',
      location: 'Baltimore, MD',
      about: 'Master Carpenter and Construction Site Superintendent with 14+ years of hands-on leadership directing heavy timber framing, commercial architectural millwork, historic restorations, and multi-story commercial job sites. Proven record of zero-incident OSHA records, subcontractor orchestration, and delivering multi-million dollar structural projects on schedule.',
      confidenceScore: 98,
      skills: [
        'Heavy Timber Framing',
        'OSHA 30',
        'Bluebeam Revu',
        'CAD/BIM Layout',
        'Rigging',
        'Structural Framing',
        'Subcontractor Management',
        'Custom Millwork',
        'Architectural Woodworking',
        'Cabinetry',
        'Blueprint Reading',
        'Quality Assurance',
        'Laser Layout'
      ],
      education: [
        {
          id: 'edu_1',
          school: 'Maryland Department of Labor – Bureau of Apprenticeship',
          degree: 'Journeyman Carpenter Certification',
          fieldOfStudy: 'Carpentry & Architectural Millwork',
          duration: '2010 – 2014'
        }
      ],
      experiences: [
        {
          id: 'exp_1',
          role: 'Lead Timber Framing Superintendent & Site Foreman',
          company: 'Apex Structural Builders',
          employmentType: 'Full-time',
          duration: '2022 – Present · 4 yrs',
          location: 'Baltimore, MD',
          description: 'Direct on-site operations for $18M+ mass-timber and heavy wood commercial framing projects across the Mid-Atlantic corridor. Supervise 32 union tradesmen, carpenters, riggers, and apprentices with a spotless 100% OSHA safety compliance track record. Coordinate directly with structural engineers and architects to resolve BIM/CAD framing conflicts prior to crane assembly. Implemented lean material tracking reducing lumber wastage by 22%.',
          skills: ['Heavy Timber Framing', 'OSHA 30', 'Bluebeam Revu', 'CAD/BIM Layout', 'Structural Framing', 'Subcontractor Management']
        },
        {
          id: 'exp_2',
          role: 'Senior Finish Carpenter & Millwork Crew Lead',
          company: 'Heritage Craft Woodworks',
          employmentType: 'Full-time',
          duration: '2018 – 2022 · 4 yrs',
          location: 'Annapolis, MD',
          description: 'Led custom architectural millwork fabrication and installation for historic commercial preservation landmarks and luxury estates. Fabricated complex compound-miter crown mouldings, curved staircases, coffered ceiling systems, and custom casework. Mentored 8 apprentice carpenters through state journeyman certification programs.',
          skills: ['Custom Millwork', 'Architectural Woodworking', 'Cabinetry', 'Blueprint Reading', 'Quality Assurance']
        },
        {
          id: 'exp_3',
          role: 'Commercial Framing Carpenter & Site Layout Specialist',
          company: 'Mid-Atlantic Commercial Interiors',
          employmentType: 'Full-time',
          duration: '2014 – 2018 · 4 yrs',
          location: 'Columbia, MD',
          description: 'Executed laser-guided interior layout, light-gauge steel stud framing, and acoustic baffle ceiling assemblies. Partnered with drywall, MEP, and HVAC trades to maintain inspection readiness ahead of city code reviews.',
          skills: ['Metal Stud Framing', 'Laser Layout', 'Acoustic Ceilings', 'Jobsite Safety']
        }
      ]
    }
  },
  {
    id: 'cyber_security',
    title: 'Principal Cloud & Zero Trust Security Architect',
    category: 'Defense & Cybersecurity Enclave',
    icon: '🛡️',
    sampleText: `ALEX TAYLOR
Principal Cloud & Zero Trust Security Architect
Washington, DC Metro | alex.taylor@sphera.internal | (202) 555-0144

PROFESSIONAL SUMMARY
Principal Cybersecurity Architect with 12+ years designing FedRAMP High, DoD IL5/IL6, and zero-trust cloud architectures. Specialized in Kubernetes runtime protection, eBPF micro-segmentation, and cryptographically verified AI agent pipelines.

WORK EXPERIENCE

Principal Cloud Security Architect
Expedite Consults | Washington, DC (Hybrid)
2023 – Present
- Architected enterprise-grade zero trust frameworks across AWS GovCloud and Azure Government, safeguarding 500,000+ endpoints.
- Authored NIST SP 800-207 Zero Trust migration blueprint adopted across 4 major federal civilian and defense initiatives.
- Developed automated boundary authorization pipelines delivering 100% FedRAMP High audit readiness in record 4 months.
Skills: Zero Trust Architecture, FedRAMP High, AWS GovCloud, Kubernetes Security, eBPF, NIST SP 800-207

Lead DevSecOps & Security Architect
Northrop Grumman Mission Systems | Northern Virginia
2020 – 2023
- Spearheaded DevSecOps container hardening, software bill of materials (SBOM) scanning, and IL5 cloud compliance.
- Reduced time-to-ATO (Authority to Operate) from 9 months to 3 weeks via automated policy-as-code validations.
- Managed 14 security engineers across secure software lifecycle and adversary emulation.
Skills: DevSecOps, Docker/K8s Hardening, Policy as Code, CI/CD Security, Threat Modeling, Terraform

Senior Information Security Engineer
Booz Allen Hamilton | McLean, VA
2016 – 2020
- Built automated SIEM threat detection playbooks and incident response runbooks for National Security sector clients.
- Led penetration testing and red-team simulations identifying critical privilege escalation vectors.
Skills: Threat Detection, Splunk, Incident Response, Red Teaming, Python, Cryptography

EDUCATION
Johns Hopkins University | Baltimore, MD
Master of Science in Cybersecurity | 2014 – 2016
University of Maryland, College Park
Bachelor of Science in Computer Science | 2010 – 2014`,
    parsed: {
      candidateName: 'Alex Taylor',
      headline: 'Principal Cloud & Zero Trust Security Architect',
      email: 'alex.taylor@sphera.internal',
      phone: '(202) 555-0144',
      location: 'Washington, DC Metro',
      about: 'Principal Cybersecurity Architect with 12+ years designing FedRAMP High, DoD IL5/IL6, and zero-trust cloud architectures. Specialized in Kubernetes runtime protection, eBPF micro-segmentation, and cryptographically verified AI agent pipelines.',
      confidenceScore: 99,
      skills: [
        'Zero Trust Architecture',
        'FedRAMP High',
        'AWS GovCloud',
        'Kubernetes Security',
        'eBPF',
        'NIST SP 800-207',
        'DevSecOps',
        'Policy as Code',
        'CI/CD Security',
        'Threat Modeling',
        'Terraform',
        'Incident Response'
      ],
      education: [
        {
          id: 'edu_1',
          school: 'Johns Hopkins University',
          degree: 'Master of Science',
          fieldOfStudy: 'Cybersecurity Engineering',
          duration: '2014 – 2016'
        },
        {
          id: 'edu_2',
          school: 'University of Maryland, College Park',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          duration: '2010 – 2014'
        }
      ],
      experiences: [
        {
          id: 'exp_1',
          role: 'Principal Cloud Security Architect',
          company: 'Expedite Consults',
          employmentType: 'Full-time',
          duration: '2023 – Present · 3 yrs',
          location: 'Washington, DC (Hybrid)',
          description: 'Architected enterprise-grade zero trust frameworks across AWS GovCloud and Azure Government, safeguarding 500,000+ endpoints. Authored NIST SP 800-207 Zero Trust migration blueprint adopted across 4 major federal initiatives. Delivered 100% FedRAMP High audit readiness in record 4 months.',
          skills: ['Zero Trust Architecture', 'FedRAMP High', 'AWS GovCloud', 'Kubernetes Security', 'eBPF', 'NIST SP 800-207']
        },
        {
          id: 'exp_2',
          role: 'Lead DevSecOps & Security Architect',
          company: 'Northrop Grumman Mission Systems',
          employmentType: 'Full-time',
          duration: '2020 – 2023 · 3 yrs',
          location: 'Northern Virginia',
          description: 'Spearheaded DevSecOps container hardening, software bill of materials (SBOM) scanning, and IL5 cloud compliance. Reduced time-to-ATO from 9 months to 3 weeks via automated policy-as-code validations. Managed 14 security engineers across secure software lifecycle.',
          skills: ['DevSecOps', 'Docker/K8s Hardening', 'Policy as Code', 'CI/CD Security', 'Threat Modeling', 'Terraform']
        },
        {
          id: 'exp_3',
          role: 'Senior Information Security Engineer',
          company: 'Booz Allen Hamilton',
          employmentType: 'Full-time',
          duration: '2016 – 2020 · 4 yrs',
          location: 'McLean, VA',
          description: 'Built automated SIEM threat detection playbooks and incident response runbooks for National Security sector clients. Led penetration testing and red-team simulations identifying critical privilege escalation vectors.',
          skills: ['Threat Detection', 'Splunk', 'Incident Response', 'Red Teaming', 'Python', 'Cryptography']
        }
      ]
    }
  },
  {
    id: 'healthcare_nurse',
    title: 'Trauma ICU Charge Nurse & Clinical Care Lead',
    category: 'Healthcare & Clinical Enclave',
    icon: '🩺',
    sampleText: `ELENA ROSTOVA, RN, BSN
Trauma ICU Charge Nurse & Clinical Care Lead
Baltimore, MD | elena.nurse@hopkinsmedicine.org | (443) 555-0199

PROFESSIONAL SUMMARY
Compassionate, board-certified Critical Care Registered Nurse (CCRN) with 9+ years managing Level 1 trauma resuscitation, surgical intensive care units, and clinical care teams. Proven expert in hemodynamic stabilization, ventilator titration, ECMO therapies, and bedside mentorship.

WORK EXPERIENCE

Trauma ICU Charge Nurse & Clinical Unit Educator
The Johns Hopkins Hospital | Baltimore, MD
2021 – Present
- Supervise 24-bed Level 1 adult Trauma ICU coordinating admissions, bed throughput, and interdisciplinary rounds.
- Lead code blue and rapid response teams with 94% ROSC survival rate on acute cardiac/respiratory arrests.
- Train and onboard 15+ resident nurses and clinical specialists annually on arterial line insertion, CRRT, and ECMO management.
Skills: Critical Care Nursing (CCRN), Trauma Resuscitation, ECMO, Hemodynamic Monitoring, Epic EHR, Clinical Leadership

Emergency Department Staff Nurse (Level 1 Trauma)
University of Maryland Medical Center | Baltimore, MD
2017 – 2021
- Triaged and stabilized high-acuity trauma victims (gunshot wounds, blunt trauma, acute stroke, myocardial infarction).
- Collaborated closely with attending trauma surgeons and anesthesiologists during emergency bedside thoracotomies.
Skills: Emergency Nursing, Triage (ESI), ACLS / PALS, Rapid Sequence Intubation, Patient Advocacy

Medical-Surgical Staff Nurse
Mercy Medical Center | Baltimore, MD
2015 – 2017
- Provided postoperative acute care for general surgery, orthopedic, and cardiovascular telemetry patients.
Skills: Postoperative Care, IV Pharmacology, Telemetry Monitoring, Patient Education

EDUCATION
Johns Hopkins University School of Nursing
Bachelor of Science in Nursing (BSN), Magna Cum Laude | 2011 – 2015`,
    parsed: {
      candidateName: 'Elena Rostova, RN, BSN',
      headline: 'Trauma ICU Charge Nurse & Clinical Care Lead',
      email: 'elena.nurse@hopkinsmedicine.org',
      phone: '(443) 555-0199',
      location: 'Baltimore, MD',
      about: 'Compassionate, board-certified Critical Care Registered Nurse (CCRN) with 9+ years managing Level 1 trauma resuscitation, surgical intensive care units, and clinical care teams. Proven expert in hemodynamic stabilization, ventilator titration, ECMO therapies, and bedside mentorship.',
      confidenceScore: 97,
      skills: [
        'Critical Care Nursing (CCRN)',
        'Trauma Resuscitation',
        'ECMO',
        'Hemodynamic Monitoring',
        'Epic EHR',
        'Clinical Leadership',
        'Emergency Nursing',
        'Triage (ESI)',
        'ACLS / PALS',
        'Patient Advocacy',
        'Postoperative Care'
      ],
      education: [
        {
          id: 'edu_1',
          school: 'Johns Hopkins University School of Nursing',
          degree: 'Bachelor of Science in Nursing (BSN)',
          fieldOfStudy: 'Nursing Practice',
          duration: '2011 – 2015'
        }
      ],
      experiences: [
        {
          id: 'exp_1',
          role: 'Trauma ICU Charge Nurse & Clinical Unit Educator',
          company: 'The Johns Hopkins Hospital',
          employmentType: 'Full-time',
          duration: '2021 – Present · 5 yrs',
          location: 'Baltimore, MD',
          description: 'Supervise 24-bed Level 1 adult Trauma ICU coordinating admissions, bed throughput, and interdisciplinary rounds. Lead code blue and rapid response teams with 94% ROSC survival rate on acute cardiac/respiratory arrests. Train and onboard 15+ resident nurses and clinical specialists annually on ECMO and CRRT.',
          skills: ['Critical Care Nursing (CCRN)', 'Trauma Resuscitation', 'ECMO', 'Hemodynamic Monitoring', 'Epic EHR', 'Clinical Leadership']
        },
        {
          id: 'exp_2',
          role: 'Emergency Department Staff Nurse (Level 1 Trauma)',
          company: 'University of Maryland Medical Center',
          employmentType: 'Full-time',
          duration: '2017 – 2021 · 4 yrs',
          location: 'Baltimore, MD',
          description: 'Triaged and stabilized high-acuity trauma victims (gunshot wounds, blunt trauma, acute stroke, myocardial infarction). Collaborated closely with attending trauma surgeons and anesthesiologists during emergency bedside procedures.',
          skills: ['Emergency Nursing', 'Triage (ESI)', 'ACLS / PALS', 'Rapid Sequence Intubation', 'Patient Advocacy']
        },
        {
          id: 'exp_3',
          role: 'Medical-Surgical Staff Nurse',
          company: 'Mercy Medical Center',
          employmentType: 'Full-time',
          duration: '2015 – 2017 · 2 yrs',
          location: 'Baltimore, MD',
          description: 'Provided postoperative acute care for general surgery, orthopedic, and cardiovascular telemetry patients with focus on patient recovery and medication safety.',
          skills: ['Postoperative Care', 'IV Pharmacology', 'Telemetry Monitoring', 'Patient Education']
        }
      ]
    }
  },
  {
    id: 'software_engineer',
    title: 'Senior Full-Stack & Distributed Systems Engineer',
    category: 'Engineering & Software Enclave',
    icon: '🧑‍💻',
    sampleText: `MARCUS CHEN
Senior Full-Stack & Distributed Systems Engineer
San Francisco, CA | marcus.chen@techdev.io | (415) 555-0129

PROFESSIONAL SUMMARY
Senior Full-Stack Software Engineer with 8+ years building high-concurrency web platforms, microservice architectures, and real-time distributed systems using Next.js, React, Node.js, TypeScript, Go, and PostgreSQL.

WORK EXPERIENCE

Senior Full-Stack Software Engineer
NextGen Cloud Solutions | San Francisco, CA
2022 – Present
- Architected sub-50ms serverless edge rendering pipeline serving 40M+ monthly active requests with 99.99% uptime.
- Led migration from monolithic Express API to Next.js App Router and GraphQL federation, reducing page TTFB by 48%.
- Designed real-time collaborative workspace with WebSockets and CRDT synchronization.
Skills: Next.js, React, TypeScript, GraphQL, Node.js, Tailwind CSS, Redis, WebSockets

Full-Stack Software Engineer
OmniPay Financial Infrastructure | San Francisco, CA
2019 – 2022
- Developed PCI-DSS compliant payment processing engine handling $1.2B in annual transaction volume.
- Implemented idempotency keys and distributed locking mechanisms in Redis preventing double-charging events.
Skills: Go, PostgreSQL, Redis, Docker, Kubernetes, AWS, RESTful APIs

Junior Software Developer
Bay Area Web Labs | Oakland, CA
2017 – 2019
- Built responsive client web portals and automated CI/CD deployment pipelines using GitHub Actions.
Skills: JavaScript, React, HTML5/CSS3, Git, Jest

EDUCATION
University of California, Berkeley
Bachelor of Science in Electrical Engineering & Computer Science (EECS) | 2013 – 2017`,
    parsed: {
      candidateName: 'Marcus Chen',
      headline: 'Senior Full-Stack & Distributed Systems Engineer',
      email: 'marcus.chen@techdev.io',
      phone: '(415) 555-0129',
      location: 'San Francisco, CA',
      about: 'Senior Full-Stack Software Engineer with 8+ years building high-concurrency web platforms, microservice architectures, and real-time distributed systems using Next.js, React, Node.js, TypeScript, Go, and PostgreSQL.',
      confidenceScore: 99,
      skills: [
        'Next.js',
        'React',
        'TypeScript',
        'GraphQL',
        'Node.js',
        'Tailwind CSS',
        'Redis',
        'WebSockets',
        'Go',
        'PostgreSQL',
        'Docker',
        'Kubernetes',
        'AWS',
        'CI/CD'
      ],
      education: [
        {
          id: 'edu_1',
          school: 'University of California, Berkeley',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Electrical Engineering & Computer Science (EECS)',
          duration: '2013 – 2017'
        }
      ],
      experiences: [
        {
          id: 'exp_1',
          role: 'Senior Full-Stack Software Engineer',
          company: 'NextGen Cloud Solutions',
          employmentType: 'Full-time',
          duration: '2022 – Present · 4 yrs',
          location: 'San Francisco, CA',
          description: 'Architected sub-50ms serverless edge rendering pipeline serving 40M+ monthly active requests with 99.99% uptime. Led migration from monolithic Express API to Next.js App Router and GraphQL federation, reducing page TTFB by 48%. Designed real-time collaborative workspace with WebSockets.',
          skills: ['Next.js', 'React', 'TypeScript', 'GraphQL', 'Node.js', 'Tailwind CSS', 'Redis', 'WebSockets']
        },
        {
          id: 'exp_2',
          role: 'Full-Stack Software Engineer',
          company: 'OmniPay Financial Infrastructure',
          employmentType: 'Full-time',
          duration: '2019 – 2022 · 3 yrs',
          location: 'San Francisco, CA',
          description: 'Developed PCI-DSS compliant payment processing engine handling $1.2B in annual transaction volume. Implemented idempotency keys and distributed locking mechanisms in Redis preventing double-charging events.',
          skills: ['Go', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'RESTful APIs']
        },
        {
          id: 'exp_3',
          role: 'Junior Software Developer',
          company: 'Bay Area Web Labs',
          employmentType: 'Full-time',
          duration: '2017 – 2019 · 2 yrs',
          location: 'Oakland, CA',
          description: 'Built responsive client web portals and automated CI/CD deployment pipelines using GitHub Actions. Maintained unit test suites with Jest reaching 92% code coverage.',
          skills: ['JavaScript', 'React', 'HTML5/CSS3', 'Git', 'Jest']
        }
      ]
    }
  }
]

// ─────────────────────────────────────────────────────────────────────────────
// DICTIONARY OF KNOWN SKILL KEYWORDS FOR INTELLIGENT AUTO-TAGGING
// ─────────────────────────────────────────────────────────────────────────────
const COMMON_SKILLS_DICTIONARY = [
  // Trades & Construction
  'Heavy Timber Framing', 'Timber Framing', 'Carpentry', 'Finish Carpentry', 'Custom Millwork',
  'Cabinetry', 'Architectural Woodworking', 'Drywall', 'Metal Stud Framing', 'Roofing',
  'Masonry', 'Concrete Finishing', 'Plumbing', 'Pipefitting', 'HVAC', 'Refrigeration',
  'Electrical', 'High Voltage', 'Welding', 'MIG Welding', 'TIG Welding', 'Arc Welding',
  'Heavy Equipment Operation', 'Excavation', 'Rigging', 'Crane Operation', 'OSHA 10', 'OSHA 30',
  'Bluebeam Revu', 'CAD', 'BIM', 'Blueprint Reading', 'Jobsite Safety', 'Laser Layout',
  'Subcontractor Management', 'Cost Estimating', 'Project Scheduling', 'Punch List',
  
  // Cybersecurity & Defense
  'Zero Trust Architecture', 'Zero Trust', 'FedRAMP', 'FedRAMP High', 'DoD IL5', 'DoD IL6',
  'NIST SP 800-207', 'NIST 800-53', 'FISMA', 'CMMC', 'Kubernetes Security', 'eBPF', 'Cilium',
  'DevSecOps', 'Threat Modeling', 'Cloud Security', 'AWS GovCloud', 'Azure Government',
  'Splunk', 'SIEM', 'SOAR', 'Incident Response', 'Penetration Testing', 'Red Teaming',
  'Vulnerability Management', 'SAST', 'DAST', 'Docker Hardening', 'Terraform', 'Cryptography',
  'Identity Governance', 'IAM', 'Single Sign-On', 'PKI', 'WebAssembly',
  
  // Healthcare & Clinical
  'Critical Care Nursing', 'CCRN', 'Trauma Resuscitation', 'Emergency Nursing', 'Triage',
  'ECMO', 'CRRT', 'Hemodynamic Monitoring', 'Ventilator Management', 'Arterial Lines',
  'ACLS', 'BLS', 'PALS', 'TNCC', 'Epic EHR', 'Cerner', 'Meditech', 'Patient Advocacy',
  'Pharmacology', 'IV Therapy', 'Wound Care', 'Infection Control', 'Clinical Leadership',
  'Telehealth', 'HIPAA Compliance', 'Surgical Pre-op', 'Telemetry',
  
  // Software Engineering & Tech
  'Next.js', 'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Go', 'Golang',
  'Rust', 'Java', 'C++', 'C#', '.NET', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
  'GraphQL', 'RESTful APIs', 'Microservices', 'Docker', 'Kubernetes', 'AWS', 'Google Cloud',
  'Azure', 'CI/CD', 'GitHub Actions', 'Tailwind CSS', 'WebSockets', 'Kafka', 'RabbitMQ',
  'Elasticsearch', 'Linux', 'Git', 'Agile', 'Scrum', 'System Architecture'
]

// ─────────────────────────────────────────────────────────────────────────────
// INTELLIGENT RESUME TEXT PARSER ENGINE
// ─────────────────────────────────────────────────────────────────────────────
export function parseResumeRawText(text: string): ParsedResumeResult {
  if (!text || text.trim().length === 0) {
    return {
      candidateName: 'Verified Professional',
      headline: 'ConnectIn Professional Member',
      experiences: [],
      skills: [],
      education: [],
      confidenceScore: 0
    }
  }

  // Check if text matches any demo preset keywords first
  const cleanLower = text.toLowerCase()
  if (cleanLower.includes('david miller') || (cleanLower.includes('carpenter') && cleanLower.includes('apex structural'))) {
    return DEMO_RESUME_PRESETS[0].parsed
  }
  if (cleanLower.includes('alex taylor') || (cleanLower.includes('zero trust') && cleanLower.includes('expedite consults'))) {
    return DEMO_RESUME_PRESETS[1].parsed
  }
  if (cleanLower.includes('elena rostova') || (cleanLower.includes('trauma') && cleanLower.includes('johns hopkins hospital'))) {
    return DEMO_RESUME_PRESETS[2].parsed
  }
  if (cleanLower.includes('marcus chen') || (cleanLower.includes('nextgen cloud') && cleanLower.includes('full-stack'))) {
    return DEMO_RESUME_PRESETS[3].parsed
  }

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

  // 1. Candidate Name: First non-empty line usually
  const candidateName = lines[0]?.slice(0, 50) || 'Verified Member'
  
  // 2. Candidate Headline / Title: Second non-empty line or detected role
  let headline = lines[1]?.slice(0, 80) || 'Experienced Professional'
  if (headline.includes('@') || headline.includes('http') || headline.includes('|') || /\d{3}/.test(headline)) {
    // If line 2 is contact info, pick title from first job
    headline = 'Specialized Professional'
  }

  // 3. Contact info extraction
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
  const email = emailMatch ? emailMatch[0] : undefined
  const phone = phoneMatch ? phoneMatch[0] : undefined

  // 4. Location extraction
  let location: string | undefined = undefined
  const locMatch = text.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}(\s+Metro)?)/)
  if (locMatch) {
    location = locMatch[0].trim()
  }

  // 5. Professional Summary / About
  let about = ''
  const summaryHeaderIdx = lines.findIndex(l => /^(PROFESSIONAL SUMMARY|SUMMARY|PROFILE|ABOUT ME|OBJECTIVE)/i.test(l))
  if (summaryHeaderIdx !== -1) {
    const summaryLines: string[] = []
    for (let i = summaryHeaderIdx + 1; i < lines.length && i < summaryHeaderIdx + 6; i++) {
      if (/^(WORK EXPERIENCE|EXPERIENCE|EMPLOYMENT|EDUCATION|SKILLS|CERTIFICATIONS)/i.test(lines[i])) break
      summaryLines.push(lines[i])
    }
    about = summaryLines.join(' ')
  }

  // 6. Work Experience Section Extraction
  const experiences: ParsedExperience[] = []
  const expHeaderIdx = lines.findIndex(l => /^(WORK EXPERIENCE|EXPERIENCE|EMPLOYMENT HISTORY|PROFESSIONAL EXPERIENCE)/i.test(l))
  
  if (expHeaderIdx !== -1) {
    let currentRole = ''
    let currentCompany = ''
    let currentDuration = ''
    let currentLocation = ''
    let currentBullets: string[] = []
    let currentSkills: string[] = []

    const finalizeCurrent = () => {
      if (currentRole || currentCompany) {
        experiences.push({
          id: 'exp_' + Math.random().toString(36).substr(2, 9),
          role: currentRole || 'Team Member / Specialist',
          company: currentCompany || 'Enterprise Organization',
          employmentType: 'Full-time',
          duration: currentDuration || '2021 – Present',
          location: currentLocation || location || 'United States',
          description: currentBullets.join(' ').trim() || `${currentRole} delivering key operational milestones, team mentorship, and domain quality execution.`,
          skills: currentSkills.length > 0 ? currentSkills : extractSkillsFromText(currentBullets.join(' ') + ' ' + currentRole)
        })
      }
      currentRole = ''
      currentCompany = ''
      currentDuration = ''
      currentLocation = ''
      currentBullets = []
      currentSkills = []
    }

    const datePattern = /(19|20)\d{2}\s*[-–—]\s*(Present|(19|20)\d{2})/i

    for (let i = expHeaderIdx + 1; i < lines.length; i++) {
      const line = lines[i]
      if (/^(EDUCATION|SKILLS|CERTIFICATIONS|PUBLICATIONS|PROJECTS|AWARDS)/i.test(line)) {
        finalizeCurrent()
        break
      }

      // Check if line looks like "Company | Location" or "Role | Company | Date"
      if (datePattern.test(line)) {
        // Line contains dates!
        const dateMatch = line.match(datePattern)
        currentDuration = dateMatch ? dateMatch[0] : '2022 – Present'
        const parts = line.split(/[|·•]/).map(p => p.trim())
        if (parts.length > 1) {
          if (!currentRole && parts[0]) currentRole = parts[0]
          if (!currentCompany && parts[1] && !datePattern.test(parts[1])) currentCompany = parts[1]
        }
      } else if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
        // Bullet point
        currentBullets.push(line.replace(/^[-•*]\s*/, ''))
      } else if (line.toLowerCase().startsWith('skills:')) {
        // Explicit skills tag in role
        const rawSkills = line.replace(/^skills:\s*/i, '').split(/[,;]/).map(s => s.trim()).filter(Boolean)
        currentSkills.push(...rawSkills)
      } else if (!currentRole) {
        currentRole = line
      } else if (!currentCompany) {
        if (line.includes('|')) {
          const compParts = line.split('|').map(p => p.trim())
          currentCompany = compParts[0]
          if (compParts[1]) currentLocation = compParts[1]
        } else {
          currentCompany = line
        }
      } else if (line.length < 80 && !line.endsWith('.')) {
        // Might be next role starting!
        finalizeCurrent()
        currentRole = line
      } else {
        currentBullets.push(line)
      }
    }
    finalizeCurrent()
  }

  // If no structured experience found via headers, create at least 1 well-formed experience
  if (experiences.length === 0) {
    experiences.push({
      id: 'exp_' + Date.now(),
      role: headline !== 'Specialized Professional' ? headline : 'Professional Specialist',
      company: 'Industry Organization',
      employmentType: 'Full-time',
      duration: '2022 – Present · Active',
      location: location || 'United States',
      description: about || text.slice(0, 250) + '...',
      skills: extractSkillsFromText(text).slice(0, 6)
    })
  }

  // 7. Extract global skills
  const skills = extractSkillsFromText(text)

  // 8. Education
  const education: ParsedEducation[] = []
  const eduHeaderIdx = lines.findIndex(l => /^(EDUCATION|ACADEMIC BACKGROUND|UNIVERSITY)/i.test(l))
  if (eduHeaderIdx !== -1) {
    for (let i = eduHeaderIdx + 1; i < lines.length && i < eduHeaderIdx + 6; i++) {
      const line = lines[i]
      if (/^(SKILLS|CERTIFICATIONS|PROJECTS)/i.test(line)) break
      if (line.length > 5 && !line.startsWith('-')) {
        education.push({
          id: 'edu_' + i,
          school: line.split(/[|·,-]/)[0]?.trim() || 'Accredited Institution',
          degree: line.includes('Bachelor') ? 'Bachelor of Science' : line.includes('Master') ? 'Master of Science' : 'Professional Certification',
          fieldOfStudy: 'Specialized Discipline',
          duration: 'Graduated'
        })
      }
    }
  }

  return {
    candidateName,
    headline: experiences[0]?.role || headline,
    email,
    phone,
    location,
    about: about || `Experienced ${experiences[0]?.role || 'professional'} with proven background in ${experiences[0]?.company || 'industry leadership'}.`,
    experiences,
    skills: skills.length > 0 ? skills : ['Leadership', 'Problem Solving', 'Project Management'],
    education,
    confidenceScore: Math.min(99, 80 + experiences.length * 6)
  }
}

// Helper to match skills against text
export function extractSkillsFromText(text: string): string[] {
  if (!text) return []
  const found: Set<string> = new Set()
  const lowerText = ' ' + text.toLowerCase().replace(/[^a-z0-9+#.\s]/g, ' ') + ' '

  for (const skill of COMMON_SKILLS_DICTIONARY) {
    const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`\\b${escaped}\\b`, 'i')
    if (regex.test(lowerText)) {
      found.add(skill)
    }
  }

  return Array.from(found)
}
