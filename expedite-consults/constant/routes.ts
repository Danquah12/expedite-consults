// routes
export const routes = {
	home: "/",
	about: {
		title: "About Us",
		url: "/about-us",
	},
	expedite: {
		title: "Why Expedite Consults?",
		url: "/why-expedite",
	},
	services: "/services",
	insight: {
		title: "Insight",
		url: "/insight",
	},
	veritaslens: {
		title: "VeritasLens AI",
		url: "/veritaslens",
	},
	incidentResponse: "/incident-response",
	legal: "/legal",
	assessment: "/assessment",
	launchpad: {
		title: "Digital Ecosystem Launchpad",
		url: "/launchpad",
	},
	ecosystem: {
		title: "Digital Ecosystem",
		url: "/ecosystem",
	},
	connectin: {
		title: "ConnectIn Professional OS",
		url: "/connectin",
	},
	connectinLogin: {
		title: "ConnectIn IAM & Security",
		url: "/connectin-login",
	},
	campus: {
		title: "Digital Campus (CampusSync)",
		url: "/campus",
	},
	campusLogin: {
		title: "Student Verification & Onboarding",
		url: "/campus/login",
	},
	contact: {
		title: "Contact Us",
		url: "/contact-us",
	},
};

export const subroutes = {
	about: [
		{
			title: "About Us (Overview)",
			url: routes.about.url,
		},
		{
			title: "Why Expedite Consults?",
			url: routes.expedite.url,
		},
	],
	insight: [
		{
			title: "🚀 Digital Ecosystem Launchpad",
			url: "/launchpad",
		},
		{
			title: "💼 ConnectIn Professional OS",
			url: "/connectin",
		},
		{
			title: "VeritasLens Media Intelligence",
			url: "/veritaslens",
		},
		{
			title: "🎓 Digital Campus Platform",
			url: "/campus",
		},
		{
			title: "Blogs",
			url: routes.insight.url + "/blogs",
		},
		{
			title: "News",
			url: routes.insight.url + "/news",
		},
		{
			title: "🔐 Student Verification & Onboarding",
			url: "/campus/login",
		},
	],
};
