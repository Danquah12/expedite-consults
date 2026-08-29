import {
	AlarmClock,
	Award,
	BadgeCheck,
	BookOpen,
	Brain,
	FileCode,
	FlaskConical,
	GraduationCap,
	Leaf,
	Lock,
	RefreshCw,
	Share2,
	ShieldCheck,
	ShieldHalf,
	UserPlus,
	Users,
} from "lucide-react";

// data/services.ts
export const servicesData = [
	{
		title: "Cybersecurity Consultancy",
		icon: ShieldCheck,
		description:
			"We offer comprehensive cybersecurity services including audits, assessments, and regulatory compliance support.",
		href: "/services/cybersecurity-consultancy",
		links: [
			{
				title: "ISO 27001 Audits",
				href: "/services/cybersecurity-consultancy/iso-27001-audits",
			},
			{
				title: "Risk Assessment",
				href: "/services/cybersecurity-consultancy/risk-assessment",
			},
			{
				title: "Cyber Maturity Evaluation",
				href: "/services/cybersecurity-consultancy/cyber-maturity-evaluation",
			},
		],
	},
	{
		title: "Managed Security",
		icon: ShieldHalf,
		description:
			"Full-cycle security solutions managed by experts to ensure your systems are secure 24/7.",
		href: "/services/managed-security",
		links: [
			{
				title: "ISO 27701 Consultancy",
				href: "/services/managed-security/iso-27701-consultancy",
			},
			{
				title: "Data Privacy Maturity Framework",
				href: "/services/managed-security/data-privacy-maturity-framework",
			},
			{
				title: "Data Privacy Officer as a Service",
				href: "/services/managed-security/dpo-as-a-service",
			},
			{
				title: "GDPR Data Mapping",
				href: "/services/managed-security/gdpr-data-mapping",
			},
			{
				title: "Managed Data Loss Prevention",
				href: "/services/managed-security/data-loss-prevention",
			},
			{
				title: "Data Privacy Audit",
				href: "/services/managed-security/data-privacy-audit",
			},
		],
	},
	{
		title: "Data Privacy",
		icon: Lock,
		description:
			"We help organizations stay compliant and maintain the highest levels of data protection.",
		href: "/services/data-privacy",
		links: [
			{ title: "DPO Services", href: "/services/data-privacy/dpo-services" },
			{
				title: "Privacy Impact Assessments",
				href: "/services/data-privacy/privacy-impact-assessments",
			},
			{
				title: "Policy Drafting",
				href: "/services/data-privacy/policy-drafting",
			},
		],
	},
	{
		title: "Penetration Testing",
		icon: FlaskConical,
		description:
			"Simulated attacks to identify vulnerabilities before hackers do.",
		href: "/services/penetration-testing",
		links: [
			{
				title: "Network Pen Testing",
				href: "/services/penetration-testing/network",
			},
			{
				title: "Web App Testing",
				href: "/services/penetration-testing/web-app",
			},
			{
				title: "Red Team Exercises",
				href: "/services/penetration-testing/red-team",
			},
		],
	},
	{
		title: "Training",
		icon: BookOpen,
		description:
			"Simulated attacks to identify vulnerabilities before hackers do.",
		href: "/services/penetration-testing",
		links: [
			{
				title: "Network Pen Testing",
				href: "/services/penetration-testing/network",
			},
			{
				title: "Web App Testing",
				href: "/services/penetration-testing/web-app",
			},
			{
				title: "Red Team Exercises",
				href: "/services/penetration-testing/red-team",
			},
		],
	},
];

export const WHY_EXPEDITE = [
	{
		icon: Users,
		title: "170+ Security Specialists",
		description:
			"Our highly-skilled team brings diverse experience across all cybersecurity disciplines and industry sectors.",
	},
	{
		icon: BadgeCheck,
		title: "Highly Accredited",
		description:
			"Certified by NCSC, CREST, ASSURE, IASME Consortium, Cyber Essentials Plus, ISO27001, ISO9001, and a PCI DSS QSA company.",
	},
	{
		icon: Brain,
		title: "Strategic Insight and Technical Expertise",
		description:
			"Combining cybersecurity consulting with hands-on technical support to deliver both protection and contextual guidance.",
	},
	{
		icon: UserPlus,
		title: "An Extension of Your Team",
		description:
			"We work with you — not just for you — acting as a seamless extension of your in-house security team.",
	},
	{
		icon: RefreshCw,
		title: "Agile and Responsive Delivery",
		description:
			"Automation and integration drive efficiency and value through agile, responsive solutions.",
	},
	{
		icon: FileCode,
		title: "Flexible Commercial Models",
		description:
			"We offer flexible agreements that adapt to your business needs — not rigid time and materials billing.",
	},
	{
		icon: AlarmClock,
		title: "24/7 MDR & Security Operations Centre",
		description:
			"Always-on protection, trusted by critical national infrastructure organizations across the UK.",
	},
	{
		icon: ShieldCheck,
		title: "Trusted by Microsoft",
		description:
			"Member of the Microsoft Intelligent Security Association, recognized by CEO Satya Nadella for advanced security specializations.",
	},
	{
		icon: Lock,
		title: "Dedicated to Cyber Security",
		description:
			"Cybersecurity is all we do — and we deliver unmatched scale, capability, and expertise.",
	},
	{
		icon: GraduationCap,
		title: "Developing Cyber Skills for the Future",
		description:
			"We invest in future talent through apprenticeships, internships, and educational partnerships across the UK.",
	},
	{
		icon: Share2,
		title: "Cyber Security for the Wider Good",
		description:
			"We actively share knowledge and threat intelligence to help strengthen the broader digital ecosystem.",
	},
	{
		icon: Leaf,
		title: "Committed to Sustainability",
		description:
			"As a carbon-negative company, we plant 12 trees per new hire and reduce our footprint across all operations.",
	},
	{
		icon: Award,
		title: "Award-Winning",
		description:
			"Named Cyber Business of the Year and Tech Company of the Year at major industry awards in 2021.",
	},
];

// Accordion
export const FAQs = [
	{
		value: "item-1" as const,
		title: "What services does Expedite Consults offer?",
		content:
			"We offer strategic consulting, process optimization, digital transformation, and tailored business solutions.",
	},
	{
		value: "item-2" as const,
		title: "Who can benefit from working with Expedite Consults?",
		content:
			"We work with businesses of all sizes, from startups to established enterprises, across various industries.",
	},
	{
		value: "item-3" as const,
		title: "How is Expedite Consults different from other firms?",
		content:
			"We blend deep industry expertise with a hands-on, personalized approach to deliver faster, smarter results.",
	},
	{
		value: "item-4" as const,
		title: "What’s the process to get started?",
		content:
			"Simply reach out through our contact form or schedule a consultation. We'll discuss your needs and craft a custom plan.",
	},
	{
		value: "item-5" as const,
		title: "Do you offer ongoing support after project delivery?",
		content:
			"Yes! We offer post-project support and optimization services to ensure long-term success.",
	},
];
