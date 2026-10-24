export const ROADMAP = [
  "Learn networking",
  "Security+",
  "Home lab",
  "SIEM skills",
  "SOC analyst role",
  "CySA+",
  "Security engineer",
] as const;

export const CERT_HUBS = [
  {
    id: "security-plus",
    name: "Security+",
    vendor: "CompTIA",
    difficulty: "Foundational",
    time: "About 8–12 weeks if you already know a network",
    cost: "Voucher price is on CompTIA. It changes.",
    prerequisites: "Network+ helps. It is not required.",
    href: "https://www.comptia.org/certifications/security",
    tips: "Name the control, then the attack. Do not memorize dumps.",
    jobs: "SOC analyst, junior security analyst",
  },
  {
    id: "cysa",
    name: "CySA+",
    vendor: "CompTIA",
    difficulty: "Intermediate",
    time: "About 8–12 weeks after Security+",
    cost: "Voucher price is on CompTIA. It changes.",
    prerequisites: "Security+ or equivalent experience.",
    href: "https://www.comptia.org/certifications/cybersecurity-analyst",
    tips: "Read the log before you pick the tool.",
    jobs: "SOC analyst, detection analyst",
  },
  {
    id: "cissp",
    name: "CISSP",
    vendor: "ISC2",
    difficulty: "Advanced",
    time: "Months, plus 5 years of paid work in 2 domains",
    cost: "Exam fee is on ISC2. It changes.",
    prerequisites: "Experience. A degree may waive one year. Official page decides.",
    href: "https://www.isc2.org/certifications/cissp",
    tips: "Think like the manager who has to sign the risk.",
    jobs: "Security engineer, architect, manager",
  },
  {
    id: "cism",
    name: "CISM",
    vendor: "ISACA",
    difficulty: "Advanced",
    time: "Months, plus management experience",
    cost: "Exam fee is on ISACA. It changes.",
    prerequisites: "See ISACA for the years they will count.",
    href: "https://www.isaca.org/credentialing/cism",
    tips: "Governance first. Tools second.",
    jobs: "Security manager",
  },
  {
    id: "pmp",
    name: "PMP",
    vendor: "PMI",
    difficulty: "Advanced",
    time: "35 contact hours plus project experience",
    cost: "Member and non-member fees differ. See PMI.",
    prerequisites: "Hours and education are on the PMI page.",
    href: "https://www.pmi.org/certifications/project-management-pmp",
    tips: "Answer as the project manager, not the technician.",
    jobs: "Project manager",
  },
  {
    id: "ccna",
    name: "CCNA",
    vendor: "Cisco",
    difficulty: "Intermediate",
    time: "About 8–16 weeks",
    cost: "Exam fee is on Cisco. It changes.",
    prerequisites: "None required. Networking practice helps.",
    href: "https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccna/index.html",
    tips: "Draw the packet path. Then pick the answer.",
    jobs: "Network engineer, network admin",
  },
  {
    id: "aws-saa",
    name: "AWS Solutions Architect Associate",
    vendor: "AWS",
    difficulty: "Intermediate",
    time: "About 8–12 weeks with a practice account",
    cost: "Exam fee is on AWS. It changes.",
    prerequisites: "Cloud Practitioner helps. It is not required.",
    href: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
    tips: "Choose the service that fits the constraint in the question.",
    jobs: "Cloud engineer, solutions architect",
  },
  {
    id: "az-104",
    name: "Azure Administrator",
    vendor: "Microsoft",
    difficulty: "Intermediate",
    time: "About 8–12 weeks. AZ-900 first if you are new.",
    cost: "Exam fee is on Microsoft. It changes.",
    prerequisites: "AZ-900 is the usual first step, not a hard gate.",
    href: "https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/",
    tips: "Identity, then network, then storage.",
    jobs: "Azure administrator",
  },
] as const;

export const BRIEFS = [
  {
    id: "cyber",
    field: "Cybersecurity",
    happened: "Agencies keep publishing known exploited vulnerabilities.",
    matters: "A listed flaw is already being used. Patch order changes.",
    careers: "Vulnerability analysts and SOC seats stay in demand.",
    skill: "Read a CVE, then name the control.",
    href: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
  },
  {
    id: "ai",
    field: "Artificial Intelligence",
    happened: "Teams are putting models next to company data.",
    matters: "The new risk is what the model is allowed to touch.",
    careers: "AI security and governance roles are opening beside classic SOC work.",
    skill: "Prompt injection and data access.",
    href: "https://www.nist.gov/itl/ai-risk-management-framework",
  },
  {
    id: "cloud",
    field: "Cloud",
    happened: "Identity, not the firewall, is the usual front door.",
    matters: "A stolen token looks like a normal login.",
    careers: "Cloud security and IAM engineers.",
    skill: "Least privilege and logging.",
    href: "https://skillbuilder.aws/",
  },
  {
    id: "care",
    field: "Healthcare",
    happened: "Clinics still run on records, devices, and downtime plans.",
    matters: "A ransomware hit stops care, not just email.",
    careers: "Clinical staff who can also speak security.",
    skill: "What must stay up, and who calls whom.",
    href: "https://www.hhs.gov/hipaa/for-professionals/security/index.html",
  },
  {
    id: "money",
    field: "Finance",
    happened: "Payment fraud and business email compromise stay common.",
    matters: "The control is verification, not a faster wire.",
    careers: "Fraud, audit, and security operations.",
    skill: "Confirm the request on a second channel.",
    href: "https://www.ic3.gov/",
  },
  {
    id: "build",
    field: "Construction and trades",
    happened: "Shops still hire people who can do the work and pass the test.",
    matters: "A credential plus hours beats a vague resume.",
    careers: "Electrician, HVAC, plumbing, welding.",
    skill: "The module, then the performance test.",
    href: "https://www.nccer.org/programs-crafts/",
  },
] as const;

export const DEMAND = [
  { skill: "Azure", outlook: "Cloud admin and security exams stay on Microsoft Learn.", href: "https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/" },
  { skill: "Splunk", outlook: "SOC teams still hire people who can read a search.", href: "https://www.splunk.com/en_us/training.html" },
  { skill: "Terraform", outlook: "Infrastructure as code shows up in cloud job posts.", href: "https://developer.hashicorp.com/terraform/tutorials" },
  { skill: "Python", outlook: "Scripting is the glue in security and data roles.", href: "https://www.python.org/" },
  { skill: "Zero Trust", outlook: "NIST 800-207 is the paper hiring managers name.", href: "https://csrc.nist.gov/publications/detail/sp/800-207/final" },
] as const;

export const MENTORS = [
  { title: "Day in the life of a SOC analyst", line: "Queue, one alert, a timeline, a ticket. Then the next alert." },
  { title: "How I would sit CISSP", line: "One domain a week. Write the decision, not the definition." },
  { title: "How a clinic day actually runs", line: "Vitals, the note, the handoff. The story comes after the numbers." },
  { title: "How a shop starts a business", line: "The license, the insurance, the first paying job. Then the logo." },
] as const;

export const MICROS = [
  { seconds: 60, title: "What is DNS?", line: "A name becomes a number. The resolver asks. The answer is cached. If the cache lies, you go to the wrong place." },
  { seconds: 90, title: "What is Zero Trust?", line: "Do not trust the network. Check the user, the device, and the request every time. Then give the smallest permission." },
  { seconds: 180, title: "How a firewall works", line: "A rule matches source, destination, and port. Allow or deny. What you did not write is usually denied. Logs tell you which rule fired." },
] as const;

export const CHALLENGES = [
  { id: "python-30", title: "30-day Python", days: 30, line: "One small script a day. Read it aloud before you run it." },
  { id: "sec-30", title: "30-day Security+", days: 30, line: "One objective a day from the official exam objectives." },
  { id: "code-100", title: "100-day coding", days: 100, line: "A function, a test, a note about what broke." },
] as const;

export const QUIZ = [
  { q: "DNS mainly does what?", options: ["Turns a name into an address", "Encrypts a disk", "Pays an invoice"], ok: 0, skill: "Networking" },
  { q: "Zero Trust checks identity when?", options: ["Every request", "Only at the VPN", "Once a year"], ok: 0, skill: "Security" },
  { q: "A firewall rule needs which pieces?", options: ["Source, destination, and port", "A logo and a slogan", "Only a password"], ok: 0, skill: "Security" },
  { q: "Python is most useful here as", options: ["A script that repeats a careful task", "A replacement for a firewall", "A salary"], ok: 0, skill: "Programming" },
  { q: "A project manager’s first job is", options: ["Name the decision and the owner", "Buy the newest tool", "Skip the risk"], ok: 0, skill: "Project Management" },
] as const;

export const PREP = {
  resume: "https://tuhousing.vercel.app/",
  linkedin: "https://www.linkedin.com/",
  questions: [
    "Tell me about a ticket you closed and what you checked first.",
    "A user cannot reach a site. What do you test, in order?",
    "You see a login from a new country. What do you do before you lock the account?",
  ],
  negotiate: [
    "Ask for the range before you name a number.",
    "Trade on the published wage for the title, not a rumor.",
    "If the base is fixed, ask about training, the cert voucher, or on-call pay.",
  ],
  linkedinTips: [
    "Headline is the job you want, not only the job you have.",
    "Three lines: what you run, what you fixed, what you are studying.",
    "One cert, one lab, one result. No keyword pile.",
  ],
} as const;

export const COACH_PATH = [
  { step: "Current state", line: "Help desk. You already reset passwords, image machines, and talk to people who are stuck." },
  { step: "Target", line: "Security engineer. You design the control, not only the ticket." },
  { step: "Gap", line: "Networking, logs, and a cert. You do not need to quit the desk to start." },
  { step: "Courses", line: "Network basics, then Security+ objectives, then a SIEM lab." },
  { step: "Videos", line: "Clinic films on networking, identity, and how a SIEM alert is read." },
  { step: "Certifications", line: "Network+ or the network half of Security+, then Security+, then CySA+." },
  { step: "Jobs", line: "SOC analyst is the usual seat between the desk and the engineer title." },
] as const;

export const NOTE_KINDS = ["Note", "Study guide", "Exam tip", "Lab", "Experience", "Template"] as const;

export const TOOLS = [
  { name: "Wireshark", group: "Cybersecurity", does: "Captures packets so you can see the conversation.", path: "Install it, capture your own DNS lookup, name each packet.", cert: "Network+, Security+", jobs: "SOC, network analyst", href: "https://www.wireshark.org/" },
  { name: "Burp Suite", group: "Cybersecurity", does: "Sits between you and a website so you can inspect the request.", path: "Community edition. One lab app. Change one parameter.", cert: "Security+", jobs: "App security, pentest", href: "https://portswigger.net/burp" },
  { name: "Splunk", group: "Cybersecurity", does: "Searches logs and raises the alert.", path: "Learn the search, then a simple correlation.", cert: "Splunk Core User, CySA+", jobs: "SOC analyst, detection", href: "https://www.splunk.com/en_us/training.html" },
  { name: "Elastic", group: "Cybersecurity", does: "Stores logs and lets you hunt in them.", path: "Load one day’s logs. Write one query.", cert: "Security+", jobs: "Detection engineer", href: "https://www.elastic.co/docs" },
  { name: "Nessus", group: "Cybersecurity", does: "Scans a host and lists the findings.", path: "Scan a lab machine you own. Rank what is actually reachable.", cert: "Security+", jobs: "Vulnerability analyst", href: "https://www.tenable.com/products/nessus" },
  { name: "Docker", group: "IT", does: "Runs an app in a box that is the same on every machine.", path: "Run one image. Read the Dockerfile.", cert: "None required", jobs: "Platform, DevOps", href: "https://docs.docker.com/get-started/" },
  { name: "Kubernetes", group: "IT", does: "Runs those boxes across machines.", path: "Pods, then a service, then a network policy.", cert: "CKA is optional", jobs: "Platform engineer", href: "https://kubernetes.io/docs/tutorials/" },
  { name: "Terraform", group: "IT", does: "Writes the cloud down so you can rebuild it.", path: "One resource. Plan. Apply. Destroy.", cert: "HashiCorp Terraform Associate", jobs: "Cloud engineer", href: "https://developer.hashicorp.com/terraform/tutorials" },
  { name: "ChatGPT", group: "AI", does: "Drafts and explains. You still check the claim.", path: "Ask it to quiz you. Verify every fact on the official page.", cert: "None", jobs: "Any desk that writes", href: "https://openai.com/chatgpt/" },
  { name: "Copilot", group: "AI", does: "Suggests code and text inside the editor.", path: "Accept one suggestion. Read it. Reject one.", cert: "None", jobs: "Developer", href: "https://github.com/features/copilot" },
  { name: "Claude", group: "AI", does: "Reads a long document and answers from it.", path: "Paste a public standard. Ask for the section, then open the PDF.", cert: "None", jobs: "Research, policy", href: "https://claude.ai/" },
  { name: "Midjourney", group: "AI", does: "Makes images from a sentence.", path: "One prompt for a diagram. Label it as generated.", cert: "None", jobs: "Design", href: "https://www.midjourney.com/" },
] as const;

export const JOURNEY = [
  { title: "Help desk", note: "Sample story, not a wage survey. Learn the ticket, the user, and the network path.", cert: "A+ or the network basics" },
  { title: "SOC analyst", note: "The usual next seat. You read alerts instead of only password resets.", cert: "Security+" },
  { title: "Security engineer", note: "You change the control, not only the ticket.", cert: "CySA+ or a cloud security exam" },
  { title: "Architect", note: "You draw the system and the risk the business will accept.", cert: "CISSP is common. Experience still decides." },
] as const;
