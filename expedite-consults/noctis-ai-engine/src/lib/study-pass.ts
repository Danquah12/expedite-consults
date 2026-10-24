import { COURSE_GROUPS } from "./course-catalog.ts";

export type StudyLink = { name: string; href: string };
export type StudyAsk = { label: string; ask: string };

type Pack = { test: RegExp; vendor: string; href: string; free: StudyLink[]; pass: string };

const PACKS: Pack[] = [
  { test: /\b(aws certified|amazon web services|cloud practitioner|solutions architect|aws cloud)\b/i, vendor: "Amazon Web Services", href: "https://aws.amazon.com/certification/", free: [{ name: "AWS Skill Builder", href: "https://skillbuilder.aws/" }], pass: "Read the exam guide on the AWS certification page. Use the free Skill Builder course. The badge comes from AWS, not from Noctis." },
  { test: /\b(azure|microsoft 365|az-\d|sc-\d|dp-\d|pl-\d|ai-\d|power bi|microsoft)\b/i, vendor: "Microsoft", href: "https://learn.microsoft.com/credentials/", free: [{ name: "Microsoft Learn", href: "https://learn.microsoft.com/training/" }], pass: "Follow the official learning path, then the practice assessment on Microsoft Learn. The credential comes from Microsoft." },
  { test: /\b(splunk)\b/i, vendor: "Splunk", href: "https://www.splunk.com/en_us/training.html", free: [{ name: "Splunk training", href: "https://www.splunk.com/en_us/training.html" }], pass: "Use Splunk's own training and exam outline. Do not treat a Noctis check as the Splunk exam." },
  { test: /\b(google cloud|cloud digital leader|associate cloud engineer)\b/i, vendor: "Google Cloud", href: "https://cloud.google.com/learn/certification", free: [{ name: "Google Cloud Skills Boost", href: "https://www.cloudskillsboost.google/" }], pass: "Use the exam guide on the Google Cloud certification page and the free labs that the guide names." },
  { test: /\b(comptia|security\+|network\+|cysa\+|pentest\+|linux\+|a\+)/i, vendor: "CompTIA", href: "https://www.comptia.org/certifications", free: [{ name: "Professor Messer", href: "https://www.professormesser.com/" }, { name: "CompTIA", href: "https://www.comptia.org/certifications" }], pass: "Use the official exam objectives. Watch a free objective-by-objective course. The certification comes from CompTIA." },
  { test: /\b(cissp|sscp|ccsp|isc2|certified in cybersecurity)\b/i, vendor: "(ISC)2", href: "https://www.isc2.org/certifications", free: [{ name: "Certified in Cybersecurity", href: "https://www.isc2.org/landing/1mcc" }], pass: "Read the official exam outline. One Million Certified in Cybersecurity is the free entry path. The credential comes from (ISC)2." },
  { test: /\b(cisa|cism|crisc|isaca)\b/i, vendor: "ISACA", href: "https://www.isaca.org/credentialing", free: [{ name: "ISACA credentialing", href: "https://www.isaca.org/credentialing" }], pass: "Use the ISACA exam candidate guide. Experience rules apply. Noctis cannot grant the credential." },
  { test: /\b(ceh|ethical hacker|ec-council)\b/i, vendor: "EC-Council", href: "https://www.eccouncil.org/train-certify/", free: [{ name: "OWASP", href: "https://owasp.org/www-project-top-ten/" }, { name: "PortSwigger Academy", href: "https://portswigger.net/web-security" }], pass: "The exam is from EC-Council. Practise only on systems you are allowed to test. The free labs are PortSwigger and the OWASP notes." },
  { test: /\b(oscp|offsec|pentest)\b/i, vendor: "OffSec", href: "https://www.offsec.com/", free: [{ name: "PortSwigger Academy", href: "https://portswigger.net/web-security" }], pass: "OffSec publishes the exam rules. Practise the listed skills. Do not attack a system you do not own or have permission to test." },
  { test: /\b(giac|gsec|gcih|gcia)\b/i, vendor: "GIAC", href: "https://www.giac.org/", free: [{ name: "NIST Cybersecurity Framework", href: "https://www.nist.gov/cyberframework" }], pass: "Use the GIAC exam objectives. NIST is a free reference, not the exam." },
  { test: /\b(cisco|ccna|ccnp|ccie|cyberops)\b/i, vendor: "Cisco", href: "https://www.cisco.com/site/us/en/learn/training-certifications/certifications/index.html", free: [{ name: "Cisco Networking Academy", href: "https://www.netacad.com/" }], pass: "Use the Cisco exam topics and the free Networking Academy course. The certification comes from Cisco." },
  { test: /\b(palo alto)\b/i, vendor: "Palo Alto Networks", href: "https://www.paloaltonetworks.com/services/education", free: [{ name: "Palo Alto education", href: "https://www.paloaltonetworks.com/services/education" }], pass: "Register from the vendor education page. Use their blueprint, not a guessed outline." },
  { test: /\b(fortinet)\b/i, vendor: "Fortinet", href: "https://www.fortinet.com/training-certification", free: [{ name: "Fortinet training", href: "https://www.fortinet.com/training-certification" }], pass: "Use the Fortinet certification track on their training page." },
  { test: /\b(red hat|rhcsa)\b/i, vendor: "Red Hat", href: "https://www.redhat.com/en/services/certification", free: [{ name: "Red Hat documentation", href: "https://docs.redhat.com/" }], pass: "The performance exam is from Red Hat. Practise the objectives on a system you control." },
  { test: /\b(linux foundation|kubernetes|docker|container)\b/i, vendor: "Linux Foundation", href: "https://training.linuxfoundation.org/", free: [{ name: "Kubernetes docs", href: "https://kubernetes.io/docs/tutorials/" }, { name: "Docker getting started", href: "https://docs.docker.com/get-started/" }], pass: "Use the official docs for the labs and the Linux Foundation page if you want their exam." },
  { test: /\b(github)\b/i, vendor: "GitHub", href: "https://skills.github.com/", free: [{ name: "GitHub Skills", href: "https://skills.github.com/" }], pass: "Finish the free GitHub Skills courses. They are exercises, not a licence." },
  { test: /\b(salesforce)\b/i, vendor: "Salesforce", href: "https://trailhead.salesforce.com/", free: [{ name: "Trailhead", href: "https://trailhead.salesforce.com/" }], pass: "Trailhead modules are free. The credential exam is booked with Salesforce." },
  { test: /\b(sap)\b/i, vendor: "SAP", href: "https://learning.sap.com/", free: [{ name: "SAP Learning", href: "https://learning.sap.com/" }], pass: "Use the learning journey on SAP Learning. The certification exam is separate." },
  { test: /\b(servicenow)\b/i, vendor: "ServiceNow", href: "https://www.servicenow.com/services/training-and-certification.html", free: [{ name: "ServiceNow training", href: "https://www.servicenow.com/services/training-and-certification.html" }], pass: "Follow the ServiceNow training path for the exam you named." },
  { test: /\b(pmp|capm|prince2|project management institute|\bpmi\b)\b/i, vendor: "Project Management Institute", href: "https://www.pmi.org/certifications", free: [{ name: "PMI certifications", href: "https://www.pmi.org/certifications" }], pass: "PMI sets the hours and the exam. Read the handbook before you pay." },
  { test: /\b(scrum|product owner)\b/i, vendor: "Scrum.org", href: "https://www.scrum.org/", free: [{ name: "Scrum Guide", href: "https://scrumguides.org/" }], pass: "Read the Scrum Guide, then the Scrum.org assessment page. The guide is free. The exam is not granted here." },
  { test: /\b(shrm|phr|sphr)\b/i, vendor: "SHRM", href: "https://www.shrm.org/credentials", free: [{ name: "SHRM credentials", href: "https://www.shrm.org/credentials" }], pass: "Use the SHRM exam content outline. Eligibility is on their page." },
  { test: /\b(cfa|cfp|financial analyst)\b/i, vendor: "CFA Institute", href: "https://www.cfainstitute.org/programs", free: [{ name: "CFA Institute programs", href: "https://www.cfainstitute.org/programs" }], pass: "The program rules, ethics, and exam windows are on the CFA Institute site." },
  { test: /\b(ase |ase\b|automotive|auto mechanic|brakes|engine repair|diesel)\b/i, vendor: "ASE", href: "https://www.ase.com/", free: [{ name: "ASE", href: "https://www.ase.com/" }], pass: "ASE publishes the test list and the work-experience rule. Practise on vehicles you are allowed to service." },
  { test: /\b(osha|workshop safety|jobsite safety|forklift)\b/i, vendor: "OSHA", href: "https://www.osha.gov/training", free: [{ name: "OSHA Training", href: "https://www.osha.gov/training" }, { name: "NCCER programs", href: "https://www.nccer.org/programs-crafts/" }], pass: "An OSHA 10 or OSHA 30 card comes from an OSHA-authorized trainer. It is not a contractor licence. Craft credentials are separate and come from NCCER. Noctis does not issue either card." },
  { test: /\b(building inspection|building codes|building permits)\b/i, vendor: "International Code Council", href: "https://www.iccsafe.org/credentialing/contractor-trades/", free: [{ name: "ICC contractor and trades exams", href: "https://www.iccsafe.org/credentialing/contractor-trades/" }, { name: "NCCER programs", href: "https://www.nccer.org/programs-crafts/" }], pass: "ICC writes inspector and contractor exams that many cities and states use. ICC does not issue the licence. Ask that city or state which exam they require. The fee and the passing score are on the ICC bulletin." },
  { test: /\b(electrical theory|residential wiring|commercial wiring|electrician|electrical(?! engineering))\b/i, vendor: "NCCER", href: "https://www.nccer.org/programs-crafts/", free: [{ name: "NCCER programs", href: "https://www.nccer.org/programs-crafts/" }, { name: "NASCLA exams", href: "https://www.nascla.org/apply-nascla-exams" }, { name: "NFPA", href: "https://www.nfpa.org/" }], pass: "NCCER Electrical is the craft course. The licence exam is chosen by the state and may be a NASCLA or ICC electrician exam. The code book is the NFPA National Electrical Code. Noctis does not issue the licence." },
  { test: /\b(plumbing|pipe installation|pipefitting|drainage|water supply)\b/i, vendor: "NCCER", href: "https://www.nccer.org/programs-crafts/", free: [{ name: "NCCER programs", href: "https://www.nccer.org/programs-crafts/" }, { name: "ICC contractor and trades exams", href: "https://www.iccsafe.org/credentialing/contractor-trades/" }], pass: "NCCER Plumbing is the craft course. The plumber licence comes from the state. Some states use an ICC plumbing exam. Noctis does not issue the licence." },
  { test: /\b(roofing|shingles|flashing|roof framing|roof installation)\b/i, vendor: "NCCER", href: "https://www.nccer.org/programs-crafts/", free: [{ name: "NCCER programs", href: "https://www.nccer.org/programs-crafts/" }, { name: "National Roofing Contractors Association", href: "https://www.nrca.net/" }, { name: "OSHA Training", href: "https://www.osha.gov/training" }], pass: "NCCER has the craft curriculum. NRCA is the roofing association, not a licence board. Fall protection starts with OSHA. Any roofing contractor licence comes from the state or city." },
  { test: /\b(crane|rigging)\b/i, vendor: "NCCCO", href: "https://www.nccco.org/nccco/certifications/crane-inspector", free: [{ name: "NCCCO", href: "https://www.nccco.org/nccco/certifications/crane-inspector" }, { name: "OSHA Training", href: "https://www.osha.gov/training" }], pass: "Construction crane operators need a certification by crane type. NCCCO (CCO) is one accredited exam body. OSHA sets that requirement. Noctis does not issue the card." },
  { test: /\b(solar|photovoltaic)\b/i, vendor: "NABCEP", href: "https://coursecatalog.nabcep.org/", free: [{ name: "NABCEP course catalog", href: "https://coursecatalog.nabcep.org/" }, { name: "NFPA", href: "https://www.nfpa.org/" }, { name: "OSHA Training", href: "https://www.osha.gov/training" }], pass: "NABCEP is the solar practitioner exam. Roof work still starts with OSHA, and the electrical rules are in the NFPA National Electrical Code. Noctis does not issue the certificate." },
  { test: /\b(fire sprinklers?|fire alarm|fire protection)\b/i, vendor: "International Code Council", href: "https://www.iccsafe.org/credentialing/contractor-trades/", free: [{ name: "ICC contractor and trades exams", href: "https://www.iccsafe.org/credentialing/contractor-trades/" }, { name: "NFPA", href: "https://www.nfpa.org/" }], pass: "ICC lists fire-suppression contractor exams used by some states. The design standard is an NFPA code. Confirm the exam name with the state before you pay. Noctis does not issue the licence." },
  { test: /\b(masonry|bricklaying|brick|block laying|plastering|concrete|formwork|carpentry|framing|drywall|blueprint|construction|general contracting|estimating|site supervision|ironwork|glazing|flooring|painting|insulation|heavy equipment|reinforcement|apprenticeship|nccer|surveying|building maintenance)\b/i, vendor: "NCCER", href: "https://www.nccer.org/craft-catalog/construction-technology/", free: [{ name: "NCCER Construction Technology", href: "https://www.nccer.org/craft-catalog/construction-technology/" }, { name: "NCCER programs", href: "https://www.nccer.org/programs-crafts/" }, { name: "NASCLA exams", href: "https://www.nascla.org/apply-nascla-exams" }, { name: "ICC contractor and trades exams", href: "https://www.iccsafe.org/credentialing/contractor-trades/" }, { name: "OSHA Training", href: "https://www.osha.gov/training" }], pass: "NCCER Construction Technology is the craft course for construction fundamentals. A contractor licence is separate: many states accept a NASCLA exam or an ICC contractor exam, then the state issues the licence. OSHA is the safety start. Noctis does not issue a licence. Length, price, and passing score stay on those pages." },
  { test: /\b(hvac|nate|refrigeration|air conditioning|heating|ventilation)\b/i, vendor: "NATE", href: "https://natex.org/", free: [{ name: "NATE", href: "https://natex.org/" }, { name: "EPA Section 608", href: "https://www.epa.gov/section608" }], pass: "NATE certifies HVAC technicians. Handling refrigerant in the United States also requires EPA Section 608. A state mechanical licence is separate. Noctis does not issue either card." },
  { test: /\b(mig|tig|stick welding|flux-cored|american welding society|welding)\b/i, vendor: "American Welding Society", href: "https://www.aws.org/certification/", free: [{ name: "American Welding Society", href: "https://www.aws.org/certification/" }], pass: "The welder qualification is from the American Welding Society or the employer code. Practise the process named in the lesson. Noctis does not issue the qualification." },
  { test: /\b(epa 608|refrigerant)\b/i, vendor: "U.S. EPA", href: "https://www.epa.gov/section608", free: [{ name: "EPA Section 608", href: "https://www.epa.gov/section608" }], pass: "Section 608 certification is required to handle refrigerant in the United States. Use the EPA page for the rule." },
  { test: /\b(cdl|truck|commercial driver)\b/i, vendor: "FMCSA", href: "https://www.fmcsa.dot.gov/registration/commercial-drivers-license", free: [{ name: "Commercial driver's license", href: "https://www.fmcsa.dot.gov/registration/commercial-drivers-license" }], pass: "The license is issued by the state. Use the state motor vehicle agency and the FMCSA page. Noctis cannot issue a CDL." },
  { test: /\b(drone|remote pilot|part 107)\b/i, vendor: "Federal Aviation Administration", href: "https://www.faa.gov/uas/commercial_operators/become_a_drone_pilot", free: [{ name: "Become a drone pilot", href: "https://www.faa.gov/uas/commercial_operators/become_a_drone_pilot" }], pass: "Study the FAA remote-pilot materials and take their test. Noctis does not issue the certificate." },
  { test: /\b(cpr|first aid|emt|cna|phlebotomy)\b/i, vendor: "American Red Cross", href: "https://www.redcross.org/take-a-class", free: [{ name: "Red Cross classes", href: "https://www.redcross.org/take-a-class" }], pass: "A clinical licence or card comes from the training body or the state. Book the official class. Do not treat this page as medical instruction for a patient." },
  { test: /\b(python|javascript|typescript|react|html|css|web design|sql|postgres)\b/i, vendor: "", href: "", free: [{ name: "MDN", href: "https://developer.mozilla.org/" }, { name: "freeCodeCamp", href: "https://www.freecodecamp.org/" }, { name: "Python tutorial", href: "https://docs.python.org/3/tutorial/" }], pass: "Build the small page or program in the lesson. There is no single licence. Use the official docs and a free course, then show the working result." },
  { test: /\b(bible|ephesians|genesis|gospel|psalm|proverb)\b/i, vendor: "", href: "", free: [{ name: "Bible Gateway", href: "https://www.biblegateway.com/" }, { name: "BibleProject", href: "https://bibleproject.com/" }], pass: "Read the passage on Bible Gateway. Use BibleProject for context. Do not add a verse that is not in the passage." },
  { test: /\b(algebra|calculus|physics|chemistry|biology|math)\b/i, vendor: "", href: "", free: [{ name: "Khan Academy", href: "https://www.khanacademy.org/" }, { name: "OpenStax", href: "https://openstax.org/" }, { name: "MIT OpenCourseWare", href: "https://ocw.mit.edu/" }], pass: "Work the problems, not only the video. Use Khan Academy or an OpenStax book. Check the answer by doing the problem again." },
  { test: /\b(climate|environment|earth science|ocean|weather)\b/i, vendor: "", href: "", free: [{ name: "NOAA Education", href: "https://www.noaa.gov/education" }, { name: "NASA learning", href: "https://www.nasa.gov/learning-resources/" }], pass: "Use NOAA or NASA for the measurement. Say when a number is from that page and when it is not." },
  { test: /\b(cyber|security|owasp|vulnerability)\b/i, vendor: "NIST", href: "https://www.nist.gov/cyberframework", free: [{ name: "NIST Cybersecurity Framework", href: "https://www.nist.gov/cyberframework" }, { name: "OWASP Top 10", href: "https://owasp.org/www-project-top-ten/" }], pass: "Name the control from NIST or OWASP. Practise only in a lab you are allowed to use. A named certification still comes from its vendor." },
];

const GENERAL: Pack = {
  test: /$^/,
  vendor: "",
  href: "",
  free: [
    { name: "Khan Academy", href: "https://www.khanacademy.org/" },
    { name: "MIT OpenCourseWare", href: "https://ocw.mit.edu/" },
    { name: "OpenStax", href: "https://openstax.org/" },
  ],
  pass: "No official exam body was matched. Do not invent a registration link. Study from the free pages, then check the official body for this trade or certificate before you pay.",
};

export function matchStudy(question: string): Pack {
  const text = catalogContext(question);
  return PACKS.find((pack) => pack.test.test(text)) ?? GENERAL;
}

function catalogContext(question: string) {
  const asked = question.replace(/\s+/g, " ").trim();
  const extra: string[] = [];
  for (const group of COURSE_GROUPS) {
    for (const track of group.tracks) {
      for (const course of track.courses) {
        if (course.length < 4) continue;
        const name = course.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (new RegExp(`\\b${name}\\b`, "i").test(asked)) extra.push(group.name, track.name);
      }
    }
  }
  return `${extra.join(" ")} ${asked}`.replace(/\s+/g, " ").trim();
}

export function studyBrief(question: string) {
  const pack = matchStudy(question);
  const vendor = pack.vendor
    ? `Official vendor: ${pack.vendor} — ${pack.href}`
    : "Official vendor: none matched. Do not invent a registration link.";
  const free = pack.free.map((link) => `${link.name} — ${link.href}`).join("\n");
  return `${vendor}\nFree resources:\n${free}\nHow to pass: ${pack.pass}`;
}

export function studyAsks(question: string): StudyAsk[] {
  const subject = question.replace(/\s+/g, " ").trim().slice(0, 140) || "this subject";
  const brief = studyBrief(subject);
  const rule = "Answer in study-board form. Cite only the references below. Do not invent another URL.";
  return [
    {
      label: "Exam",
      ask: `Exam sheet for ${subject}: who gives it, where I register, what it covers, and what I must practise. If length, price, or passing score is not on the vendor page, write "not on record." Do not invent a URL. Noctis does not issue this exam.\n${brief}`,
    },
    { label: "Certification vendor", ask: `Who is the official vendor for ${subject}, and where do I register?\n${rule}\n${brief}` },
    { label: "Free resources", ask: `What free resources can I use to study ${subject}?\n${rule}\n${brief}` },
    { label: "How to pass", ask: `What do I have to practise to pass ${subject}?\n${rule}\n${brief}` },
  ];
}
