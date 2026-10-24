import { SOURCE } from "@/lib/source";

export type LicenseMark = "open" | "embed" | "partner" | "external" | "creator" | "restricted";
export type WorldId = "learn" | "heal" | "govern" | "discover" | "build" | "culture" | "events";
export type DeskId =
  | "universities"
  | "code"
  | "oer"
  | "careers"
  | "medical"
  | "government"
  | "law"
  | "finance"
  | "research"
  | "labs"
  | "space"
  | "climate"
  | "agriculture"
  | "cyber"
  | "professional"
  | "business"
  | "history"
  | "museums"
  | "faith"
  | "music"
  | "sports"
  | "conferences";

export type NetworkHouse = {
  id: string;
  name: string;
  world: WorldId;
  desk: DeskId;
  shelf: string;
  license: LicenseMark;
  href: string;
  blurb: string;
  youtubeId?: string;
  concepts: string[];
  papers?: { title: string; href: string }[];
  jobs?: string[];
};

export const LICENSE_LABEL: Record<LicenseMark, string> = {
  open: "Open license",
  embed: "Authorized embed",
  partner: "Partner path",
  external: "Open at source",
  creator: "Creator uploaded",
  restricted: "Restricted — do not copy",
};

export const WORLDS: { id: WorldId; label: string; hint: string }[] = [
  { id: "learn", label: "Learn", hint: "Schools and code" },
  { id: "heal", label: "Heal", hint: "Medicine" },
  { id: "govern", label: "Govern", hint: "Law and money" },
  { id: "discover", label: "Discover", hint: "Labs and space" },
  { id: "build", label: "Build", hint: "Cyber and firms" },
  { id: "culture", label: "Culture", hint: "History and art" },
  { id: "events", label: "Events", hint: "Conferences" },
];

export const DESKS: { id: DeskId; world: WorldId; label: string }[] = [
  { id: "universities", world: "learn", label: "Universities" },
  { id: "code", world: "learn", label: "Code academy" },
  { id: "oer", world: "learn", label: "Open texts" },
  { id: "careers", world: "learn", label: "Career academy" },
  { id: "medical", world: "heal", label: "Medicine" },
  { id: "government", world: "govern", label: "Agencies" },
  { id: "law", world: "govern", label: "Law" },
  { id: "finance", world: "govern", label: "Finance" },
  { id: "research", world: "discover", label: "Research" },
  { id: "labs", world: "discover", label: "National labs" },
  { id: "space", world: "discover", label: "Space" },
  { id: "climate", world: "discover", label: "Climate" },
  { id: "agriculture", world: "discover", label: "Food" },
  { id: "cyber", world: "build", label: "Cyber" },
  { id: "professional", world: "build", label: "Engineering" },
  { id: "business", world: "build", label: "Business" },
  { id: "history", world: "culture", label: "History" },
  { id: "museums", world: "culture", label: "Museums" },
  { id: "faith", world: "culture", label: "Faith" },
  { id: "music", world: "culture", label: "Music" },
  { id: "sports", world: "culture", label: "Sports science" },
  { id: "conferences", world: "events", label: "Conferences" },
];

export const TRUSTED: { label: string; world: WorldId; desk: DeskId }[] = [
  { label: "Universities", world: "learn", desk: "universities" },
  { label: "Research", world: "discover", desk: "research" },
  { label: "Medicine", world: "heal", desk: "medical" },
  { label: "Technology", world: "learn", desk: "code" },
  { label: "Cybersecurity", world: "build", desk: "cyber" },
  { label: "Space", world: "discover", desk: "space" },
  { label: "Science", world: "discover", desk: "labs" },
  { label: "Law", world: "govern", desk: "law" },
  { label: "Business", world: "build", desk: "business" },
];

const house = (
  id: string,
  name: string,
  desk: DeskId,
  shelf: string,
  license: LicenseMark,
  href: string,
  blurb: string,
  extra: Partial<Pick<NetworkHouse, "youtubeId" | "concepts" | "papers" | "jobs">> = {},
): NetworkHouse => ({
  id,
  name,
  world: DESKS.find((d) => d.id === desk)!.world,
  desk,
  shelf,
  license,
  href,
  blurb,
  concepts: extra.concepts ?? [blurb],
  youtubeId: extra.youtubeId,
  papers: extra.papers,
  jobs: extra.jobs,
});

export const NETWORK: NetworkHouse[] = [
  house("mit", "MIT OpenCourseWare", "universities", "Open courses", "open", "https://ocw.mit.edu/", "2,500+ courses. CC BY-NC-SA. Lectures, notes, and exams.", { youtubeId: "k6U-i4gXkLM", concepts: ["Computation", "Python", "Open license"], jobs: ["Software engineer", "Research assistant"] }),
  house("yale", "Yale Open Courses", "universities", "Open courses", "open", "https://oyc.yale.edu/", "Full lecture series, openly published.", { youtubeId: "P3FKHH2RzjI", concepts: ["Lecture series", "Psychology", "Open course"] }),
  house("harvard-online", "Harvard Online", "universities", "Open courses", "external", "https://www.harvardonline.harvard.edu/", "Harvard’s public online catalog. Open at Harvard."),
  house("harvard", "Harvard CS50", "universities", "Campus lectures", "embed", "https://cs50.harvard.edu/", "Lecture 0 from Harvard’s channel.", { youtubeId: "IDDmrzzB14M", concepts: ["Computational thinking", "Scratch", "C"], jobs: ["Software engineer"] }),
  house("stanford", "Stanford Online", "universities", "Campus lectures", "external", "https://online.stanford.edu/", "Seminars and professional education stay on Stanford."),
  house("berkeley", "UC Berkeley", "universities", "UC system", "embed", "https://www.youtube.com/@UCBerkeley", "Authorized campus channel. Lectures and research talks."),
  house("ucla", "UCLA", "universities", "UC system", "external", "https://www.ucla.edu/", "Campus lectures and research talks."),
  house("uc", "University of California", "universities", "UC system", "external", "https://www.universityofcalifornia.edu/", "Ten-campus system. Open each campus. We do not copy files."),
  house("ucsd", "UC San Diego", "universities", "UC system", "external", "https://ucsd.edu/", "Research lectures and public seminars."),
  house("ucdavis", "UC Davis", "universities", "UC system", "external", "https://www.ucdavis.edu/", "Agriculture, veterinary, and life sciences."),
  house("uci", "UC Irvine", "universities", "UC system", "external", "https://uci.edu/", "Campus lectures and research talks."),
  house("ucsb", "UC Santa Barbara", "universities", "UC system", "external", "https://www.ucsb.edu/", "Physics, materials, and public lectures."),
  house("gatech", "Georgia Tech", "universities", "Campus lectures", "external", "https://www.gatech.edu/", "OMSCS and engineering lectures."),
  house("cmu", "Carnegie Mellon", "universities", "Campus lectures", "external", "https://www.cmu.edu/", "CS, robotics, cybersecurity."),
  house("jhu", "Johns Hopkins", "universities", "Research campuses", "embed", "https://www.hopkinsmedicine.org/", "Medicine and public health. Also on Study.", { youtubeId: "ewHZm8ylly0", concepts: ["Diabetes", "Public health", "Clinical research"], jobs: ["Clinician", "Epidemiologist"] }),
  house("uw", "University of Washington", "universities", "Research campuses", "external", "https://www.washington.edu/", "Medicine, engineering, public health."),
  house("umich", "University of Michigan", "universities", "Research campuses", "external", "https://umich.edu/", "Open Michigan and professional schools."),
  house("columbia", "Columbia University", "universities", "Research campuses", "external", "https://www.columbia.edu/", "Seminars and research presentations."),
  house("cornell", "Cornell University", "universities", "Research campuses", "external", "https://www.cornell.edu/", "Engineering, agriculture, medicine."),
  house("princeton", "Princeton University", "universities", "Research campuses", "external", "https://www.princeton.edu/", "Public lectures and research."),
  house("duke", "Duke University", "universities", "Research campuses", "external", "https://www.duke.edu/", "Medicine, public policy, seminars."),
  house("penn", "University of Pennsylvania", "universities", "Research campuses", "external", "https://www.upenn.edu/", "Wharton, medicine, engineering."),
  house("utexas", "University of Texas", "universities", "Research campuses", "external", "https://www.utexas.edu/", "Public research university. Lectures stay on UT."),
  house("chicago", "University of Chicago", "universities", "Research campuses", "external", "https://www.uchicago.edu/", "Public lectures and research."),
  house("northwestern", "Northwestern", "universities", "Research campuses", "external", "https://www.northwestern.edu/", "Research and professional schools."),
  house("illinois", "University of Illinois", "universities", "Research campuses", "external", "https://illinois.edu/", "Engineering and open courseware."),
  house("purdue", "Purdue University", "universities", "Research campuses", "external", "https://www.purdue.edu/", "Engineering and public lectures."),
  house("umd", "University of Maryland", "universities", "Research campuses", "external", "https://www.umd.edu/", "Cybersecurity and engineering. Open at UMD."),
  house("wisconsin", "University of Wisconsin–Madison", "universities", "Research campuses", "external", "https://www.wisc.edu/", "Public research university."),
  house("uva", "University of Virginia", "universities", "Research campuses", "external", "https://www.virginia.edu/", "Public lectures and research."),
  house("oxford", "University of Oxford", "universities", "Global", "embed", "https://www.ox.ac.uk/", "Official Oxford lectures. We embed. We do not copy.", { youtubeId: "AufmV0P6mA0", concepts: ["Quantum mechanics", "Public lecture"] }),
  house("cambridge", "University of Cambridge", "universities", "Global", "external", "https://www.cam.ac.uk/", "Lectures stay on Cambridge."),
  house("imperial", "Imperial College London", "universities", "Global", "external", "https://www.imperial.ac.uk/", "Science, engineering, medicine."),
  house("ucl", "University College London", "universities", "Global", "external", "https://www.ucl.ac.uk/", "Public lectures and research."),
  house("lse", "London School of Economics", "universities", "Global", "external", "https://www.lse.ac.uk/", "Social science lectures."),
  house("edinburgh", "University of Edinburgh", "universities", "Global", "external", "https://www.ed.ac.uk/", "Research lectures."),
  house("kcl", "King's College London", "universities", "Global", "external", "https://www.kcl.ac.uk/", "Health and humanities."),
  house("toronto", "University of Toronto", "universities", "Global", "external", "https://www.utoronto.ca/", "Canadian research campus."),
  house("mcgill", "McGill University", "universities", "Global", "external", "https://www.mcgill.ca/", "Research lectures."),
  house("ubc", "University of British Columbia", "universities", "Global", "external", "https://www.ubc.ca/", "Public research university."),
  house("melbourne", "University of Melbourne", "universities", "Global", "external", "https://www.unimelb.edu.au/", "Australian research campus."),
  house("sydney", "University of Sydney", "universities", "Global", "external", "https://www.sydney.edu.au/", "Public lectures."),
  house("anu", "Australian National University", "universities", "Global", "external", "https://www.anu.edu.au/", "Research and public policy."),
  house("nus", "National University of Singapore", "universities", "Global", "external", "https://www.nus.edu.sg/", "Asian research campus."),
  house("hku", "University of Hong Kong", "universities", "Global", "external", "https://www.hku.hk/", "Research lectures."),
  house("eth", "ETH Zurich", "universities", "Global", "external", "https://ethz.ch/", "Science and engineering."),
  house("epfl", "EPFL", "universities", "Global", "external", "https://www.epfl.ch/", "Science and engineering."),
  house("tum", "Technical University of Munich", "universities", "Global", "external", "https://www.tum.de/", "Engineering and science."),
  house("amsterdam", "University of Amsterdam", "universities", "Global", "external", "https://www.uva.nl/", "Research lectures."),
  house("copenhagen", "University of Copenhagen", "universities", "Global", "external", "https://www.ku.dk/", "Research lectures."),
  house("tokyo", "University of Tokyo", "universities", "Global", "external", "https://www.u-tokyo.ac.jp/", "Research lectures."),
  house("yt-mit", "MIT on YouTube", "universities", "Lecture channels", "embed", "https://www.youtube.com/@MITOCW", "Authorized MIT OCW channel. We embed. We do not host a copy.", { youtubeId: "k6U-i4gXkLM" }),
  house("yt-stanford", "Stanford on YouTube", "universities", "Lecture channels", "external", "https://www.youtube.com/@stanford", "Authorized Stanford channel."),
  house("yt-harvard", "Harvard on YouTube", "universities", "Lecture channels", "embed", "https://www.youtube.com/@harvard", "Authorized Harvard channel.", { youtubeId: "IDDmrzzB14M" }),
  house("yt-yale", "Yale Courses", "universities", "Lecture channels", "external", "https://www.youtube.com/@YaleCourses", "Authorized Yale Open Courses channel."),
  house("yt-berkeley", "UC Berkeley on YouTube", "universities", "Lecture channels", "embed", "https://www.youtube.com/@UCBerkeley", "Authorized campus channel."),
  house("yt-gatech", "Georgia Tech on YouTube", "universities", "Lecture channels", "external", "https://www.youtube.com/@GeorgiaTech", "Authorized GT channel."),
  house("yt-jhu", "Johns Hopkins Medicine", "universities", "Lecture channels", "embed", "https://www.youtube.com/@JohnsHopkinsMedicine", "Clinical education channel. Also on Study.", { youtubeId: "ewHZm8ylly0" }),
  house("yt-duke", "Duke on YouTube", "universities", "Lecture channels", "external", "https://www.youtube.com/@DukeUniversity", "Authorized Duke channel."),
  house("yt-penn", "Penn on YouTube", "universities", "Lecture channels", "external", "https://www.youtube.com/@UniversityofPennsylvania", "Authorized Penn channel."),
  house("yt-columbia", "Columbia on YouTube", "universities", "Lecture channels", "external", "https://www.youtube.com/@columbiauniversity", "Authorized Columbia channel."),

  house("fccamp", "freeCodeCamp", "code", "Paths", "open", "https://www.freecodecamp.org/", "Full-stack path. Open curriculum.", { concepts: ["HTML", "JavaScript", "Projects"], jobs: ["Frontend engineer"] }),
  house("cs50code", "Harvard CS50", "code", "Paths", "embed", "https://cs50.harvard.edu/", "Computer science from zero.", { youtubeId: "IDDmrzzB14M", concepts: ["Algorithms", "C", "Python"] }),
  house("odin", "The Odin Project", "code", "Paths", "open", "https://www.theodinproject.com/", "Full-stack curriculum. Open.", { concepts: ["Git", "Ruby", "JavaScript"] }),
  house("fso", "Full Stack Open", "code", "Paths", "open", "https://fullstackopen.com/", "React, Node, GraphQL. University of Helsinki."),
  house("mdn", "MDN Web Docs", "code", "References", "open", "https://developer.mozilla.org/", "The web platform reference."),
  house("w3c", "W3C", "code", "References", "open", "https://www.w3.org/", "Web standards. Open specs."),
  house("khan-code", "Khan Academy CS", "code", "Foundations", "embed", "https://www.khanacademy.org/computing", "Computing from first principles.", { youtubeId: "kpCJyQ2usJ4" }),

  house("openstax", "OpenStax", "oer", "Textbooks", "open", "https://openstax.org/", "Peer-reviewed open textbooks. License on each book — usually CC BY."),
  house("opentext", "Open Textbook Library", "oer", "Textbooks", "open", "https://open.umn.edu/opentextbooks", "Open textbooks with a license mark on every title."),
  house("mit-oer", "MIT OpenCourseWare", "oer", "Courseware", "open", "https://ocw.mit.edu/", "2,500+ courses. CC BY-NC-SA. We link the original.", { youtubeId: "k6U-i4gXkLM", concepts: ["Open license", "Lectures", "Problem sets"] }),
  house("khan", "Khan Academy", "oer", "Courseware", "embed", "https://www.khanacademy.org/", "Structured units. We embed. We do not copy.", { youtubeId: "kpCJyQ2usJ4" }),
  house("openlearn", "OpenLearn", "oer", "Courseware", "open", "https://www.open.edu/openlearn/", "Open University free courses. License on each unit."),
  house("oercommons", "OER Commons", "oer", "Repositories", "open", "https://www.oercommons.org/", "Indexed open educational resources. Filter by license."),
  house("merlot", "MERLOT", "oer", "Repositories", "open", "https://www.merlot.org/", "Peer-reviewed teaching materials with license metadata."),
  house("oeglobal", "Open Education Global", "oer", "Repositories", "open", "https://www.oeglobal.org/", "OER network, awards, and open-practice resources."),
  house("skillscommons", "Skills Commons", "oer", "Repositories", "open", "https://www.skillscommons.org/", "Workforce and career OER. License on each item."),
  house("col", "Commonwealth of Learning", "oer", "Repositories", "open", "https://www.col.org/", "Open learning for the Commonwealth. License on each item."),
  house("archive", "Internet Archive", "oer", "Repositories", "open", "https://archive.org/details/movies?utm_source=chatgpt.com", "Moving Image Archive: public lectures, NASA reels, Prelinger films, and historic cinema. Check the item license.", {
    papers: [
      { title: "Internet Archive · Moving Image Archive (Movies)", href: "https://archive.org/details/movies?utm_source=chatgpt.com" },
      { title: "Library of Congress · National Screening Room", href: "https://www.loc.gov/collections/national-screening-room/?utm_source=chatgpt.com" },
    ],
    concepts: ["Moving Image Archive", "Public domain film", "Open lectures"],
  }),
  house("wikimedia", "Wikimedia Commons", "oer", "Repositories", "open", "https://commons.wikimedia.org/", "Media with a license on every file."),
  house("hathi", "HathiTrust", "oer", "Libraries", "open", "https://www.hathitrust.org/", "Digitized books. Check each item’s rights."),
  house("dpla", "Digital Public Library of America", "oer", "Libraries", "open", "https://dp.la/", "U.S. library and archive records."),
  house("europeana", "Europeana", "oer", "Libraries", "open", "https://www.europeana.eu/", "European cultural collections. License on each item."),

  house("comptia", "CompTIA", "careers", "Tech", "external", "https://www.comptia.org/", "IT certifications. Open at CompTIA.", { jobs: ["Help desk", "SOC analyst"] }),
  house("pmi", "PMI", "careers", "Operations", "external", "https://www.pmi.org/", "Project management paths."),
  house("nccer", "NCCER", "careers", "Trades", "external", "https://www.nccer.org/", "Construction crafts and assessments.", { jobs: ["Carpenter", "Electrician"] }),
  house("hvac", "HVAC Excellence", "careers", "Trades", "external", "https://www.hvacexcellence.org/", "HVAC training and credentials.", { jobs: ["HVAC technician"] }),
  house("ase", "ASE", "careers", "Trades", "external", "https://www.ase.com/", "Automotive service education.", { jobs: ["Auto technician"] }),
  house("faa-career", "FAA aviation", "careers", "Trades", "external", "https://www.faa.gov/education", "Aviation education. Open at FAA.", { jobs: ["Pilot", "A&P mechanic"] }),
  house("ncsbn", "NCSBN", "careers", "Health", "external", "https://www.ncsbn.org/", "Nursing licensure education.", { jobs: ["Nurse"] }),

  house("stanfordmed", "Stanford Medicine", "medical", "Academic medicine", "external", "https://med.stanford.edu/", "Grand rounds and research talks."),
  house("hms", "Harvard Medical School", "medical", "Academic medicine", "external", "https://hms.harvard.edu/", "Authorized HMS publications."),
  house("yalemed", "Yale School of Medicine", "medical", "Academic medicine", "external", "https://medicine.yale.edu/", "Clinical education and seminars."),
  house("ucsf", "UCSF", "medical", "Academic medicine", "external", "https://www.ucsf.edu/", "Health sciences campus."),
  house("uwmed", "UW School of Medicine", "medical", "Academic medicine", "external", "https://www.uwmedicine.org/", "Clinical education and research. Open at UW Medicine."),
  house("mayo", "Mayo Clinic", "medical", "Health systems", "external", "https://www.mayoclinic.org/", "Patient education. Open at Mayo."),
  house("cleveland", "Cleveland Clinic", "medical", "Health systems", "external", "https://my.clevelandclinic.org/", "Clinical education stays on their site."),
  house("aha", "American Heart Association", "medical", "Societies", "external", "https://www.heart.org/", "Guidelines and public education."),
  house("cancer", "American Cancer Society", "medical", "Societies", "external", "https://www.cancer.org/", "Patient and clinician resources."),
  house("ama", "American Medical Association", "medical", "Societies", "external", "https://www.ama-assn.org/", "Clinical policy and CME."),
  house("ana", "American Nurses Association", "medical", "Societies", "external", "https://www.nursingworld.org/", "Nursing practice and education."),
  house("facs", "American College of Surgeons", "medical", "Societies", "external", "https://www.facs.org/", "Surgical education and grand rounds."),
  house("acp", "American College of Physicians", "medical", "Societies", "external", "https://www.acponline.org/", "Internal medicine education."),
  house("aap", "American Academy of Pediatrics", "medical", "Societies", "external", "https://www.aap.org/", "Child health education."),
  house("acc", "American College of Cardiology", "medical", "Societies", "external", "https://www.acc.org/", "Cardiology education and guidelines."),
  house("psych", "American Psychiatric Association", "medical", "Societies", "external", "https://www.psychiatry.org/", "Psychiatric education. Open at APA."),
  house("apa", "American Psychological Association", "medical", "Societies", "external", "https://www.apa.org/", "Psychology education. Open at APA."),
  house("who", "World Health Organization", "medical", "Public health", "external", "https://www.who.int/", "Global health guidance."),
  house("cdc-med", "CDC", "medical", "Public health", "embed", "https://www.cdc.gov/", "Public-health films. Also on Study.", { youtubeId: "mjTMZ_sm0LQ", concepts: ["Hypertension", "Prevention"] }),
  house("fda-med", "FDA", "medical", "Public health", "external", "https://www.fda.gov/", "Drug and device education."),
  house("medline", "MedlinePlus", "medical", "Public health", "open", "https://medlineplus.gov/", "NIH consumer health. Public domain."),
  house("merck", "Merck Manuals", "medical", "Public health", "external", "https://www.merckmanuals.com/", "Clinical reference. Open at Merck."),
  house("khanmed", "Khan Academy Medicine", "medical", "Foundations", "embed", "https://www.khanacademy.org/science/health-and-medicine", "Body systems, anatomy, physiology, disease, infection, mental health.", { youtubeId: "kpCJyQ2usJ4", concepts: ["Body systems", "Anatomy", "Physiology", "Disease"] }),
  house("osmosis", "Osmosis", "medical", "Foundations", "external", "https://www.osmosis.org/", "Clinical explainers. Open at Osmosis."),
  house("medcram", "MedCram", "medical", "Foundations", "external", "https://www.medcram.com/", "Clinical lectures. Open at MedCram."),
  house("jhu-skills", "JHU clinical skills", "medical", "Clinical skills", "external", "https://www.hopkinsmedicine.org/", "Physical exam, nursing, and simulation. Open at Hopkins."),
  house("jhu-surgery", "JHU surgical grand rounds", "medical", "Clinical skills", "external", "https://www.hopkinsmedicine.org/surgery", "Surgical education lectures. Open at Hopkins."),
  house("ana-skills", "ANA nursing procedures", "medical", "Clinical skills", "external", "https://www.nursingworld.org/", "Nursing practice education."),

  house("nih", "NIH", "government", "Health", "embed", "https://www.nih.gov/", "Biomedical research. Also on Study.", { youtubeId: "ID-udHCLOKU", concepts: ["Biomedical research", "Clinical trials"] }),
  house("cdc", "CDC", "government", "Health", "embed", "https://www.cdc.gov/", "Public-health films. Also on Study.", { youtubeId: "mjTMZ_sm0LQ", concepts: ["Hypertension", "Prevention"] }),
  house("fda", "FDA", "government", "Health", "external", "https://www.fda.gov/", "Drug and device education."),
  house("nsf", "National Science Foundation", "government", "Science", "external", "https://www.nsf.gov/", "Funded research and education."),
  house("doe", "Department of Energy", "government", "Science", "external", "https://www.energy.gov/", "Energy science and national labs."),
  house("nasa-gov", "NASA", "government", "Science", "open", "https://www.nasa.gov/", "Mission film, lesson plans, data, and virtual tours. Public domain.", { youtubeId: "1C_zuHf6lP4", concepts: ["Missions", "Lesson plans", "Public domain"] }),
  house("noaa-gov", "NOAA", "government", "Earth", "open", "https://www.noaa.gov/", "Climate, oceans, weather. Public science."),
  house("usgs-gov", "USGS", "government", "Earth", "open", "https://www.usgs.gov/", "Earth science, maps, hazards."),
  house("epa-gov", "EPA", "government", "Earth", "external", "https://www.epa.gov/", "Environment and public health."),
  house("usda-gov", "USDA", "government", "Earth", "external", "https://www.usda.gov/", "Food, nutrition, agriculture."),
  house("nos-gov", "National Ocean Service", "government", "Earth", "open", "https://oceanservice.noaa.gov/", "Coasts, charts, and ocean science."),
  house("loc", "Library of Congress", "government", "Archives", "open", "https://www.loc.gov/collections/national-screening-room/?utm_source=chatgpt.com", "National Screening Room: historic motion pictures, public collections, lectures, and lesson plans.", {
    youtubeId: "63Ze_bpATac",
    papers: [
      { title: "Library of Congress · National Screening Room", href: "https://www.loc.gov/collections/national-screening-room/?utm_source=chatgpt.com" },
      { title: "Internet Archive · Moving Image Archive", href: "https://archive.org/details/movies?utm_source=chatgpt.com" },
    ],
    concepts: ["National Screening Room", "Archives", "Public lectures"],
  }),
  house("nara", "National Archives", "government", "Archives", "open", "https://www.archives.gov/", "Records, civics, history."),
  house("si-gov", "Smithsonian", "government", "Archives", "external", "https://www.si.edu/", "Museums, research, education."),
  house("dod-ed", "DoD public education", "government", "Education", "external", "https://www.defense.gov/", "Public-information resources only. Not classified material."),
  house("ed", "Department of Education", "government", "Education", "external", "https://www.ed.gov/", "Federal education resources."),
  house("fema", "FEMA", "government", "Safety", "external", "https://www.fema.gov/", "Emergency preparedness training."),
  house("ntsb", "NTSB", "government", "Safety", "external", "https://www.ntsb.gov/", "Accident investigation reports."),

  house("uscourts", "U.S. Courts", "law", "Courts", "open", "https://www.uscourts.gov/", "Federal court education."),
  house("scotus", "Supreme Court", "law", "Courts", "open", "https://www.supremecourt.gov/", "Opinions and educational resources."),
  house("doj", "Department of Justice", "law", "Agencies", "external", "https://www.justice.gov/", "Public legal education."),
  house("crs", "Congressional Research Service", "law", "Agencies", "open", "https://crsreports.congress.gov/", "Nonpartisan reports to Congress."),
  house("hls", "Harvard Law School", "law", "Schools", "external", "https://hls.harvard.edu/", "Public lectures. Open at HLS."),
  house("yls", "Yale Law School", "law", "Schools", "external", "https://law.yale.edu/", "Public scholarship. Open at Yale Law."),
  house("cali", "CALI", "law", "Education", "open", "https://www.cali.org/", "Open legal education lessons."),

  house("fed", "Federal Reserve", "finance", "Regulators", "open", "https://www.federalreserve.gov/", "Monetary policy education."),
  house("sec", "SEC", "finance", "Regulators", "open", "https://www.sec.gov/education", "Investor education."),
  house("finra", "FINRA", "finance", "Regulators", "external", "https://www.finra.org/", "Broker education and rules."),
  house("fdic", "FDIC", "finance", "Public money", "open", "https://www.fdic.gov/", "Deposit insurance education."),
  house("treasury", "U.S. Treasury", "finance", "Public money", "external", "https://home.treasury.gov/", "Public finance resources."),
  house("irs", "IRS", "finance", "Public money", "open", "https://www.irs.gov/", "Taxpayer education."),
  house("cfa", "CFA Institute", "finance", "Credentials", "external", "https://www.cfainstitute.org/", "Investment education. Open at CFA."),
  house("cfp", "CFP Board", "finance", "Credentials", "external", "https://www.cfp.net/", "Personal financial planning."),

  house("arxiv", "arXiv", "research", "Preprints", "open", "https://arxiv.org/", "Preprints. Paper first, video second.", { papers: [{ title: "arXiv", href: "https://arxiv.org/" }], concepts: ["Preprint", "Open access"] }),
  house("pubmed", "PubMed / NLM", "research", "Preprints", "open", "https://pubmed.ncbi.nlm.nih.gov/", "Literature. Link the original.", { papers: [{ title: "PubMed", href: "https://pubmed.ncbi.nlm.nih.gov/" }], concepts: ["Literature", "PMID"] }),
  house("nih-research", "NIH research", "research", "Agencies", "embed", "https://www.nih.gov/", "Biomedical papers, trials, and film.", { youtubeId: "ID-udHCLOKU", papers: [{ title: "NIH", href: "https://www.nih.gov/" }], concepts: ["Clinical trials", "Grants"] }),
  house("nasa-research", "NASA research", "research", "Agencies", "open", "https://science.nasa.gov/", "Mission papers, data, and public-domain film.", { youtubeId: "1C_zuHf6lP4", papers: [{ title: "NASA Science", href: "https://science.nasa.gov/" }], concepts: ["Missions", "Datasets"] }),
  house("nsf-research", "NSF", "research", "Agencies", "external", "https://www.nsf.gov/", "Funded research and education.", { papers: [{ title: "NSF awards", href: "https://www.nsf.gov/" }] }),
  house("cern", "CERN", "research", "Labs", "embed", "https://home.cern/", "Particle physics lectures, papers, and open data.", { youtubeId: "UDoIzvKumGI", papers: [{ title: "CERN CDS", href: "https://cds.cern.ch/" }], concepts: ["LHC", "Open data", "Particle physics"] }),
  house("hhmi", "HHMI BioInteractive", "research", "Labs", "embed", "https://www.biointeractive.org/", "Classroom science film. Also on Study.", { youtubeId: "rDDUpMlJhRM", concepts: ["Complex traits", "Genetics"] }),
  house("nasem", "National Academies", "research", "Labs", "external", "https://www.nationalacademies.org/", "Consensus reports and workshops.", { papers: [{ title: "National Academies", href: "https://nap.nationalacademies.org/" }] }),
  house("royalsoc", "Royal Society", "research", "Societies", "external", "https://royalsociety.org/", "Scientific papers and lectures."),
  house("aaas", "AAAS", "research", "Societies", "external", "https://www.aaas.org/", "Science policy and Science journal."),
  house("aip", "American Institute of Physics", "research", "Societies", "external", "https://www.aip.org/", "Physics education and history."),
  house("aps", "American Physical Society", "research", "Societies", "external", "https://www.aps.org/", "Physics research talks."),
  house("maxplanck", "Max Planck Society", "research", "Institutes", "external", "https://www.mpg.de/", "German research institutes."),
  house("wellcome", "Wellcome", "research", "Institutes", "external", "https://wellcome.org/", "Health research and open resources."),
  house("broad", "Broad Institute", "research", "Institutes", "external", "https://www.broadinstitute.org/", "Genomics research."),
  house("allen", "Allen Institute", "research", "Institutes", "external", "https://alleninstitute.org/", "Brain, cell, and immunology research."),
  house("salk", "Salk Institute", "research", "Institutes", "external", "https://www.salk.edu/", "Biological research lectures."),
  house("cshl", "Cold Spring Harbor Laboratory", "research", "Institutes", "external", "https://www.cshl.edu/", "Meetings and biology education."),
  house("doe-labs", "DOE national labs", "research", "Labs", "external", "https://www.energy.gov/national-laboratories", "Government laboratories. Full stack on Discover → National labs."),
  house("ieee-research", "IEEE Xplore", "research", "Societies", "external", "https://ieeexplore.ieee.org/", "Engineering papers and conference talks.", { papers: [{ title: "IEEE Xplore", href: "https://ieeexplore.ieee.org/" }] }),
  house("acm-research", "ACM Digital Library", "research", "Societies", "external", "https://dl.acm.org/", "Computing papers and talks.", { papers: [{ title: "ACM DL", href: "https://dl.acm.org/" }] }),
  house("nature", "Nature", "research", "Journals", "embed", "https://www.nature.com/", "Research film. Also on Study.", { youtubeId: "5AXApBbj1ps", papers: [{ title: "Nature", href: "https://www.nature.com/" }], concepts: ["Monoclonal antibodies", "Immunology"] }),
  house("campuses", "Research universities", "research", "Campuses", "external", "https://ocw.mit.edu/", "MIT, Stanford, JHU and the rest live on Learn → Universities."),

  house("lanl", "Los Alamos", "labs", "DOE labs", "external", "https://www.lanl.gov/", "Physics, computing, national security."),
  house("llnl", "Lawrence Livermore", "labs", "DOE labs", "external", "https://www.llnl.gov/", "Energy, high-performance computing."),
  house("ornl", "Oak Ridge", "labs", "DOE labs", "external", "https://www.ornl.gov/", "Neutrons, computing, materials."),
  house("sandia", "Sandia", "labs", "DOE labs", "external", "https://www.sandia.gov/", "Engineering and cybersecurity research."),
  house("anl", "Argonne", "labs", "DOE labs", "external", "https://www.anl.gov/", "Energy, AI, materials."),
  house("bnl", "Brookhaven", "labs", "DOE labs", "external", "https://www.bnl.gov/", "Nuclear and particle physics."),
  house("pnnl", "Pacific Northwest", "labs", "DOE labs", "external", "https://www.pnnl.gov/", "Earth, energy, security."),
  house("lbnl", "Lawrence Berkeley", "labs", "DOE labs", "external", "https://www.lbl.gov/", "Energy sciences and computing."),

  house("nasa", "NASA", "space", "Flight", "open", "https://www.nasa.gov/", "Public domain mission film.", { youtubeId: "1C_zuHf6lP4", concepts: ["Webb", "Infrared", "Public domain"] }),
  house("jpl", "JPL", "space", "Flight", "open", "https://www.jpl.nasa.gov/", "Robotic exploration. NASA JPL.", { youtubeId: "4czjS9h4Fpg", concepts: ["Mars", "Perseverance", "Public domain"] }),
  house("esa", "ESA", "space", "Flight", "external", "https://www.esa.int/", "European space missions."),
  house("eso", "European Southern Observatory", "space", "Observatories", "external", "https://www.eso.org/", "Ground telescopes and sky film."),
  house("nasm", "National Air and Space Museum", "space", "Museums", "external", "https://airandspace.si.edu/", "Flight and space exhibits."),
  house("faa", "FAA", "space", "Safety", "external", "https://www.faa.gov/", "Aviation safety education."),
  house("spacex", "SpaceX", "space", "Flight", "external", "https://www.spacex.com/", "Public mission film only. Authorized pages."),
  house("afrl", "Air Force Research Lab", "space", "Safety", "external", "https://www.afrl.af.mil/", "Public research. Not classified material."),

  house("noaa", "NOAA", "climate", "Earth system", "open", "https://www.noaa.gov/", "Climate, oceans, weather.", { youtubeId: "BJXTMqcA8-g", concepts: ["Climate", "Earth system"] }),
  house("nasa-earth", "NASA Earth Observatory", "climate", "Earth system", "open", "https://earthobservatory.nasa.gov/", "Earth from orbit. Public."),
  house("epa", "EPA", "climate", "Earth system", "external", "https://www.epa.gov/", "Environment and public health."),
  house("usgs", "USGS", "climate", "Earth system", "open", "https://www.usgs.gov/", "Earth science, maps, hazards."),
  house("nps", "National Park Service", "climate", "Places", "open", "https://www.nps.gov/", "Land, history, stewardship."),
  house("nos", "National Ocean Service", "climate", "Places", "open", "https://oceanservice.noaa.gov/", "Coasts and oceans."),

  house("usda", "USDA", "agriculture", "Agencies", "external", "https://www.usda.gov/", "Food, nutrition, agriculture."),
  house("fao", "FAO", "agriculture", "Agencies", "external", "https://www.fao.org/", "Global food and agriculture."),
  house("extension", "Extension", "agriculture", "Land grant", "open", "https://extension.org/", "Land-grant university outreach."),

  house("nist", "NIST", "cyber", "Standards", "embed", "https://www.nist.gov/cyberframework", "CSF, 800-53, RMF.", { youtubeId: "pPPiaGU12Og", concepts: ["Identify", "Protect", "Detect", "Respond", "Recover", "Govern"], papers: [{ title: "NIST CSF", href: "https://www.nist.gov/cyberframework" }], jobs: ["GRC analyst", "CISO"] }),
  house("net-fund", "Networking fundamentals", "cyber", "Foundations", "open", "https://www.cisa.gov/", "Packets, DNS, routing, segmentation. Open at CISA.", { youtubeId: "6UzRjq12VQg", concepts: ["TCP/IP", "DNS", "Segmentation"] }),
  house("linux-fund", "Linux fundamentals", "cyber", "Foundations", "external", "https://www.linuxfoundation.org/", "Shell, permissions, systemd. Open at Linux Foundation.", { youtubeId: "k6U-i4gXkLM" }),
  house("win-fund", "Windows fundamentals", "cyber", "Foundations", "open", "https://www.cisa.gov/", "AD, Event Log, least privilege. Open at CISA.", { youtubeId: "6UzRjq12VQg" }),
  house("py-fund", "Python for security", "cyber", "Foundations", "open", "https://ocw.mit.edu/", "Scripting, logs, APIs. MIT OCW Python is CC BY-NC-SA.", { youtubeId: "k6U-i4gXkLM" }),
  house("sec-fund", "Security fundamentals", "cyber", "Foundations", "embed", "https://www.nist.gov/cyberframework", "CIA, risk, controls. Start at CSF.", { youtubeId: "pPPiaGU12Og" }),
  house("forensics", "Digital forensics", "cyber", "Specialized", "open", "https://www.cisa.gov/", "Preserve, image, timeline. Open at CISA. Do not image systems you do not own.", { jobs: ["DFIR analyst"] }),
  house("owasp", "OWASP", "cyber", "Standards", "open", "https://owasp.org/", "Open security guidance. CC."),
  house("ieee-cyber", "IEEE", "cyber", "Standards", "external", "https://www.ieee.org/", "Cyber and computing standards. Open at IEEE."),
  house("cisa", "CISA", "cyber", "Agencies", "embed", "https://www.cisa.gov/", "Alerts, playbooks, free training.", { youtubeId: "6UzRjq12VQg", concepts: ["Phishing", "MFA", "Critical infrastructure"] }),
  house("isc2", "ISC2", "cyber", "Training", "external", "https://www.isc2.org/", "CISSP and professional cyber credentials."),
  house("isaca", "ISACA", "cyber", "Training", "external", "https://www.isaca.org/", "Audit, GRC, and cyber credentials."),
  house("nsa", "NSA Cybersecurity", "cyber", "Agencies", "external", "https://www.nsa.gov/Cybersecurity/", "Public guidance. Not classified material."),
  house("sans", "SANS", "cyber", "Training", "external", "https://www.sans.org/", "Professional cyber training."),
  house("csa", "Cloud Security Alliance", "cyber", "Training", "external", "https://cloudsecurityalliance.org/", "Cloud security guidance."),
  house("rmf", "NIST RMF", "cyber", "Academy", "external", "https://csrc.nist.gov/projects/risk-management", "Risk Management Framework. Course → lab → quiz → cert → job.", { concepts: ["Prepare", "Categorize", "Select", "Implement", "Assess", "Authorize", "Monitor"], papers: [{ title: "NIST RMF", href: "https://csrc.nist.gov/projects/risk-management" }], jobs: ["GRC analyst"] }),
  house("80053", "NIST 800-53", "cyber", "Academy", "external", "https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final", "Security and privacy controls.", { papers: [{ title: "SP 800-53", href: "https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final" }], jobs: ["Control assessor"] }),
  house("53b", "NIST 800-53B tailoring", "cyber", "NIST Academy", "open", "https://csrc.nist.gov/pubs/sp/800/53/b/upd1/final", "The baseline is the start. Every scope, overlay, parameter, compensate, or supplement needs a written rationale in the SSP.", { papers: [{ title: "SP 800-53B", href: "https://csrc.nist.gov/pubs/sp/800/53/b/upd1/final" }, { title: "SP 800-18 SSP", href: "https://csrc.nist.gov/pubs/sp/800/18/r1/final" }], concepts: ["Baseline", "Scoping", "Overlay", "Compensating control", "Rationale"], jobs: ["ISSO", "Control assessor"] }),
  house("53fam", "NIST 800-53 control families", "cyber", "NIST Academy", "open", "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final", "Twenty families. 800-53B selects a subset at Low, Moderate, or High. PT and SR are Rev. 5.", { papers: [{ title: "SP 800-53 Rev. 5", href: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final" }, { title: "SP 800-53B", href: "https://csrc.nist.gov/pubs/sp/800/53/b/upd1/final" }], concepts: ["AC", "IA", "AU", "SC", "SI", "SR", "PT", "CA"], jobs: ["ISSO"] }),
  house("53a", "NIST 800-53A assessment methods", "cyber", "NIST Academy", "open", "https://csrc.nist.gov/pubs/sp/800/53/a/r5/final", "Examine, Interview, Test. Depth and coverage. SAP then SAR. A scanner is evidence for Examine — not the whole assessment.", { papers: [{ title: "SP 800-53A Rev. 5", href: "https://csrc.nist.gov/pubs/sp/800/53/a/r5/final" }], concepts: ["Examine", "Interview", "Test", "SAP", "SAR"], jobs: ["Control assessor", "ISSO"] }),
  house("zta", "Zero Trust", "cyber", "Academy", "external", "https://www.nist.gov/publications/zero-trust-architecture", "NIST SP 800-207.", { papers: [{ title: "SP 800-207", href: "https://www.nist.gov/publications/zero-trust-architecture" }], jobs: ["Security architect"] }),
  house("fedramp", "FedRAMP", "cyber", "Academy", "external", "https://www.fedramp.gov/", "Cloud authorization for federal systems.", { jobs: ["FedRAMP 3PAO"] }),
  house("cmmc", "CMMC", "cyber", "Academy", "external", "https://www.acq.osd.mil/cmmc/", "DoD contractor cybersecurity.", { jobs: ["CMMC assessor"] }),
  house("soc", "SOC operations", "cyber", "Academy", "external", "https://www.cisa.gov/", "Detection and response in a security operations center.", { jobs: ["SOC analyst"] }),
  house("ir", "Incident response", "cyber", "Academy", "external", "https://www.cisa.gov/topics/cyber-threats-and-advisories/incident-response", "Contain, eradicate, recover.", { jobs: ["Incident responder"] }),
  house("siem", "SIEM / Splunk", "cyber", "Academy", "external", "https://www.splunk.com/en_us/training.html", "Log analytics. Open at the vendor. We do not copy labs."),
  house("pentest", "Penetration testing", "cyber", "Academy", "open", "https://owasp.org/www-project-web-security-testing-guide/", "OWASP testing guide.", { jobs: ["Pentester"] }),
  house("cloudsec", "Cloud security", "cyber", "Academy", "external", "https://cloudsecurityalliance.org/", "AWS, Azure, Kubernetes, DevSecOps."),
  house("dfir", "Digital forensics", "cyber", "Academy", "external", "https://www.cisa.gov/", "Forensics, malware, threat hunting.", { jobs: ["Forensic analyst"] }),
  house("aws-iam", "AWS IAM", "cyber", "AWS", "embed", "https://aws.amazon.com/iam/", "Identity, roles, policies, STS. Official AWS film.", { youtubeId: "qsF6Kauh2J4", concepts: ["IAM", "Policies", "Least privilege", "STS", "Cross-account"], jobs: ["Cloud security engineer"] }),
  house("aws-learn", "AWS Security Learning", "cyber", "AWS", "external", "https://aws.amazon.com/security/security-learning/", "Official paths: IAM, vuln mgmt, governance, network, IR. Open at AWS. We do not copy Skill Builder labs."),
  house("ms-learn", "Microsoft Learn Security", "cyber", "Azure", "external", "https://learn.microsoft.com/en-us/training/browse/?products=security", "Official Microsoft Learn security catalog and video library. Open at Microsoft."),
  house("aws-sso", "AWS IAM Identity Center", "cyber", "AWS", "embed", "https://aws.amazon.com/iam/identity-center/", "Workforce identity across accounts.", { youtubeId: "4yJp5-jGGNk", concepts: ["SSO", "Organizations", "Multi-account"] }),
  house("aws-guardduty", "Amazon GuardDuty", "cyber", "AWS", "embed", "https://aws.amazon.com/guardduty/", "Threat detection for accounts, containers, and AI workloads.", { youtubeId: "ng14ToMXnTA", concepts: ["CloudTrail", "VPC Flow", "EKS", "S3", "AI workloads"], jobs: ["SOC analyst"] }),
  house("aws-guard-ai", "GuardDuty for AI workloads", "cyber", "AWS", "embed", "https://aws.amazon.com/guardduty/", "Continuous monitoring of generative-AI stacks on AWS.", { youtubeId: "OTIbLAzVYyQ", concepts: ["GenAI", "Threat detection"] }),
  house("aws-sra", "AWS Security Reference Architecture", "cyber", "AWS", "external", "https://docs.aws.amazon.com/prescriptive-guidance/latest/security-reference-architecture/", "Multi-account security pattern. Open at AWS. We do not copy labs."),
  house("aws-eks", "AWS EKS security", "cyber", "AWS", "external", "https://docs.aws.amazon.com/eks/latest/userguide/security.html", "IAM, network, secrets, runtime. Open at AWS."),
  house("az-zerotrust", "Azure Zero Trust", "cyber", "Azure", "embed", "https://learn.microsoft.com/en-us/azure/security/fundamentals/zero-trust", "Verify explicitly. Least privilege. Assume breach.", { youtubeId: "PitpSDmUaXE", concepts: ["Entra ID", "Conditional Access", "Devices", "Identity"] }),
  house("az-entra", "Microsoft Entra ID", "cyber", "Azure", "external", "https://learn.microsoft.com/en-us/entra/fundamentals/whatis", "Workforce identity. Open at Microsoft Learn."),
  house("az-defender", "Defender for Cloud", "cyber", "Azure", "external", "https://learn.microsoft.com/en-us/azure/defender-for-cloud/", "CSPM and workload protection. Open at Microsoft."),
  house("az-sentinel", "Microsoft Sentinel", "cyber", "Azure", "external", "https://learn.microsoft.com/en-us/azure/sentinel/", "Cloud SIEM. Open at Microsoft Learn."),
  house("gcp-scc", "Security Command Center", "cyber", "Google Cloud", "embed", "https://cloud.google.com/security-command-center", "Risk, posture, and threat detection. Official Google Cloud film.", { youtubeId: "oL8nB5GHbd0", concepts: ["Posture", "Threats", "Multi-cloud"], jobs: ["Cloud security engineer"] }),
  house("gcp-beyondcorp", "BeyondCorp / Zero Trust", "cyber", "Google Cloud", "external", "https://cloud.google.com/beyondcorp", "Identity-aware access. Open at Google Cloud."),
  house("gcp-iam", "Google Cloud IAM", "cyber", "Google Cloud", "external", "https://cloud.google.com/iam/docs", "Workload Identity, least privilege. Open at Google Cloud."),
  house("k8s-sec", "Kubernetes security", "cyber", "Cloud-native", "embed", "https://www.cncf.io/", "Cluster defaults, RBAC, network policy, secrets. Official CNCF talk.", { youtubeId: "xdizlpIdrYw", concepts: ["RBAC", "NetworkPolicy", "etcd", "Pod security"], jobs: ["Platform engineer"] }),
  house("supply-chain", "Software supply chain", "cyber", "Cloud-native", "external", "https://www.cisa.gov/resources-tools/resources/securing-software-supply-chain", "CISA guidance. Open at CISA."),
  house("owasp-llm", "OWASP Top 10 for LLMs", "cyber", "AI security", "open", "https://genai.owasp.org/", "Prompt injection, data poisoning, supply chain, excessive agency. CC BY-SA.", { concepts: ["Prompt injection", "RAG", "Unbounded consumption", "Excessive agency"], jobs: ["AI security engineer"] }),
  house("nist-ai-rmf", "NIST AI RMF", "cyber", "AI security", "external", "https://www.nist.gov/itl/ai-risk-management-framework", "Govern, Map, Measure, Manage. Open at NIST.", { papers: [{ title: "AI RMF 1.0", href: "https://www.nist.gov/itl/ai-risk-management-framework" }], jobs: ["AI governance"] }),
  house("agentic", "Agentic AI security", "cyber", "AI agents", "external", "https://cloudsecurityalliance.org/", "Oversight of autonomous agents. Open at CSA. Gartner 2026: IAM for AI agents.", { jobs: ["AI security engineer"] }),
  house("agent-arch", "Agent architecture", "cyber", "AI agents", "open", "https://genai.owasp.org/", "Tools, memory, planners, MCP. Who the agent is, what it may call.", { concepts: ["Tools", "Memory", "Planner", "MCP"] }),
  house("agent-id", "Agent identity & authz", "cyber", "AI agents", "external", "https://pages.nist.gov/800-63-3/", "Agent identity, permissions, privilege escalation. Human-in-the-loop and kill switches.", { concepts: ["Agent identity", "Authorization", "Kill switch", "HITL"] }),
  house("agent-inject", "Agent injection & hijack", "cyber", "AI agents", "open", "https://genai.owasp.org/", "Prompt injection, indirect injection, memory poisoning, data injection, tool abuse.", { concepts: ["Prompt injection", "Indirect injection", "Memory poisoning", "Hijack"] }),
  house("agent-runtime", "Agent runtime & observability", "cyber", "AI agents", "external", "https://cloudsecurityalliance.org/", "Agent-to-agent comms, supply chain, runtime, observability. Multi-agent blast radius.", { concepts: ["A2A", "Observability", "Runtime", "Multi-agent"] }),
  house("mcp-sec", "MCP security", "cyber", "AI agents", "external", "https://modelcontextprotocol.io/", "Model Context Protocol: tool servers as an attack surface. Open at the spec."),
  house("nhi", "Non-human identity", "cyber", "NHI", "external", "https://cloudsecurityalliance.org/", "Service accounts, keys, workloads, bots, CI, cloud roles, agents. CSA 2026: IAM including NHI is the top cloud concern.", { concepts: ["Service account", "Workload identity", "API key"], jobs: ["IAM engineer"] }),
  house("workload-id", "Workload identity", "cyber", "NHI", "open", "https://spiffe.io/", "SPIFFE / SPIRE. Workloads prove who they are without long-lived keys.", { concepts: ["SPIFFE", "SPIRE", "mTLS"] }),
  house("managed-id", "Managed identities", "cyber", "NHI", "external", "https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview", "Azure managed identity. AWS IAM roles. No secret in the app.", { concepts: ["Managed identity", "Instance profile", "IRSA"] }),
  house("secrets-rot", "Secrets & short-lived creds", "cyber", "NHI", "open", "https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final", "Rotate, prefer short-lived, never commit. Certificates, API keys, CI tokens.", { concepts: ["Rotation", "Short-lived", "Certificates"] }),
  house("m2m", "Machine-to-machine auth", "cyber", "NHI", "external", "https://oauth.net/2/grant-types/client-credentials/", "Client credentials, mTLS, workload identity. Open at IETF / vendor."),
  house("id-gov", "Identity governance for NHI", "cyber", "NHI", "external", "https://pages.nist.gov/800-63-3/", "Least privilege, inventory, orphaned keys, human → machine → workload → agent.", { concepts: ["Least privilege", "Inventory", "Orphaned identity"] }),
  house("iam-fund", "IAM fundamentals", "cyber", "Identity", "external", "https://pages.nist.gov/800-63-3/", "NIST SP 800-63 digital identity. Attackers steal credentials more than they smash perimeters.", { papers: [{ title: "NIST SP 800-63", href: "https://pages.nist.gov/800-63-3/" }], concepts: ["IAL", "AAL", "FAL"], jobs: ["IAM engineer"] }),
  house("mfa", "Phishing-resistant MFA", "cyber", "Identity", "embed", "https://www.cisa.gov/MFA", "CISA: security keys beat SMS. Official CISA film.", { youtubeId: "XIlF2qkav5c", concepts: ["MFA", "Security key", "Authenticator", "Phishing resistance"] }),
  house("passkeys", "FIDO2 / Passkeys", "cyber", "Identity", "embed", "https://fidoalliance.org/passkeys/", "Passwordless FIDO credentials. Official FIDO Alliance film.", { youtubeId: "J60U2Gs83IE", concepts: ["FIDO2", "WebAuthn", "Passkeys"] }),
  house("oauth-oidc", "OAuth 2.0 / OpenID Connect", "cyber", "Identity", "external", "https://datatracker.ietf.org/doc/html/rfc6749", "Authorization (OAuth) vs authentication (OIDC). Open at IETF.", { papers: [{ title: "RFC 6749", href: "https://datatracker.ietf.org/doc/html/rfc6749" }, { title: "OpenID Connect", href: "https://openid.net/connect/" }], concepts: ["Access token", "Authorization code", "OIDC"] }),
  house("saml-ad", "SAML / Active Directory", "cyber", "Identity", "external", "https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/virtual-dc/active-directory-domain-services-overview", "Enterprise federation and AD. Open at Microsoft Learn.", { concepts: ["SAML", "Kerberos", "AD"] }),
  house("entra-ca", "Entra Conditional Access", "cyber", "Identity", "external", "https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview", "Signals → decision → enforce. Open at Microsoft Learn.", { concepts: ["Conditional Access", "JIT", "PIM"] }),
  house("pam", "Privileged Access Management", "cyber", "Identity", "external", "https://www.cisa.gov/news-events/cybersecurity-advisories", "Just-in-time, just-enough privilege. Open at CISA."),
  house("rbac-abac", "RBAC / ABAC", "cyber", "Identity", "external", "https://csrc.nist.gov/pubs/sp/800/162/final", "Roles vs attributes. NIST SP 800-162.", { papers: [{ title: "NIST SP 800-162", href: "https://csrc.nist.gov/pubs/sp/800-162/final" }], concepts: ["RBAC", "ABAC"] }),
  house("workload-id", "Workload & machine identity", "cyber", "Identity", "external", "https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html", "Service accounts, IAM roles, workload identity. Open at AWS / Google Cloud.", { concepts: ["Service account", "Workload identity", "Machine identity"] }),
  house("secrets", "Secrets management", "cyber", "Identity", "external", "https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final", "Keys, tokens, rotation. Open at NIST.", { concepts: ["KMS", "Rotation", "Least privilege"] }),
  house("mitre-attack", "MITRE ATT&CK", "cyber", "Blue team", "embed", "https://attack.mitre.org/", "Adversary tactics and techniques. Official MITRE film.", { youtubeId: "Yxv1suJYMI8", concepts: ["TTPs", "Tactics", "Techniques", "Detections"], jobs: ["SOC analyst", "Detection engineer"] }),
  house("soc-fund", "SOC fundamentals", "cyber", "Blue team", "external", "https://www.cisa.gov/", "Triage, investigation, escalate. Open at CISA.", { concepts: ["Alert triage", "Incident investigation", "Log analysis"], jobs: ["SOC analyst"] }),
  house("hunt", "Threat hunting", "cyber", "Blue team", "external", "https://www.cisa.gov/resources-tools", "Hypothesis → evidence → ATT&CK map. Open at CISA.", { concepts: ["Threat hunting", "IOC", "Telemetry"] }),
  house("detect-eng", "Detection engineering", "cyber", "Blue team", "external", "https://attack.mitre.org/", "Correlation rules mapped to ATT&CK.", { concepts: ["Detection engineering", "Correlation", "False positives"] }),
  house("windows-logs", "Windows & Linux logs", "cyber", "Blue team", "external", "https://www.cisa.gov/", "Event logs, syslog, auth. Open at CISA."),
  house("elastic-siem", "Elastic Security", "cyber", "Blue team", "external", "https://www.elastic.co/security", "Open at Elastic. We do not copy labs."),
  house("investigate", "Investigate this attack", "cyber", "Blue team", "open", "https://attack.mitre.org/", "Lab: given logs, name the ATT&CK technique, write the finding.", { concepts: ["Triage", "Timeline", "ATT&CK", "Report"], jobs: ["SOC analyst"] }),
  house("recon", "Recon & OSINT", "cyber", "Red team", "external", "https://www.cisa.gov/", "Passive collection. Do not scan systems you do not own.", { concepts: ["OSINT", "Reconnaissance"] }),
  house("nmap", "Nmap", "cyber", "Red team", "open", "https://nmap.org/", "Network discovery. Official docs. Practice only on systems you own.", { concepts: ["Nmap", "Ports"] }),
  house("web-pentest", "Web application testing", "cyber", "Red team", "open", "https://owasp.org/www-project-web-security-testing-guide/", "OWASP WSTG. Beginner → professional.", { concepts: ["WSTG", "Burp", "ZAP"], jobs: ["Pentester"] }),
  house("ad-attacks", "Active Directory attacks", "cyber", "Red team", "external", "https://attack.mitre.org/matrices/enterprise/windows/", "Privilege, lateral movement, credentials. Map to ATT&CK.", { concepts: ["Kerberoast", "Lateral movement"] }),
  house("cloud-pentest", "Cloud & container pentest", "cyber", "Red team", "external", "https://www.cisecurity.org/", "EKS/AKS/GKE attack paths. Authorized scope only."),
  house("owasp-top10", "OWASP Top 10", "cyber", "Web & API", "open", "https://owasp.org/www-project-top-ten/", "Broken access, injection, misconfiguration. CC.", { concepts: ["Broken access control", "Injection", "XSS", "SSRF"], jobs: ["AppSec engineer"] }),
  house("owasp-api", "OWASP API Security", "cyber", "Web & API", "open", "https://owasp.org/www-project-api-security/", "BOLA/IDOR, authn, authz, JWT, GraphQL, rate limits.", { concepts: ["BOLA", "IDOR", "JWT", "GraphQL"] }),
  house("asvs", "OWASP ASVS", "cyber", "Web & API", "open", "https://owasp.org/www-project-application-security-verification-standard/", "Verification levels for web apps."),
  house("pss", "Pod Security Standards", "cyber", "Kubernetes", "external", "https://kubernetes.io/docs/concepts/security/pod-security-standards/", "Privileged, baseline, restricted. Open at kubernetes.io."),
  house("falco", "Falco runtime security", "cyber", "Kubernetes", "embed", "https://falco.org/", "CNCF runtime detection. Official CNCF session.", { youtubeId: "DNQdqDr7DhM", concepts: ["eBPF", "Runtime", "Syscalls"] }),
  house("opa", "OPA / Gatekeeper / Kyverno", "cyber", "Kubernetes", "external", "https://www.openpolicyagent.org/", "Admission policy. Open at CNCF projects."),
  house("aks", "AKS security", "cyber", "Kubernetes", "external", "https://learn.microsoft.com/en-us/azure/aks/concepts-security", "Open at Microsoft Learn."),
  house("gke", "GKE security", "cyber", "Kubernetes", "external", "https://cloud.google.com/kubernetes-engine/docs/concepts/security-overview", "Open at Google Cloud."),
  house("ssdf", "NIST SSDF / DevSecOps", "cyber", "DevSecOps", "external", "https://csrc.nist.gov/Projects/ssdf", "Secure software development. Shift left without skipping ops.", { papers: [{ title: "NIST SSDF", href: "https://csrc.nist.gov/Projects/ssdf" }, { title: "SSDF for generative AI", href: "https://csrc.nist.gov/pubs/sp/800/218/a/final" }], concepts: ["CI/CD", "SAST", "SCA"], jobs: ["DevSecOps engineer"] }),
  house("slsa", "SLSA supply chain", "cyber", "DevSecOps", "open", "https://slsa.dev/", "Provenance levels. Open standard.", { concepts: ["Provenance", "Build integrity"] }),
  house("cicd", "Secure CI/CD", "cyber", "DevSecOps", "external", "https://owasp.org/www-project-top-10-ci-cd-security-risks/", "OWASP CI/CD Top 10. Pipeline as an attack surface.", { concepts: ["Pipeline", "Artifacts", "Secrets in CI"] }),
  house("github-sec", "GitHub security", "cyber", "DevSecOps", "external", "https://docs.github.com/en/code-security", "Dependabot, secret scanning, code scanning. Open at GitHub. We do not copy Advanced Security labs."),
  house("gitlab-sec", "GitLab security", "cyber", "DevSecOps", "external", "https://docs.gitlab.com/ee/user/application_security/", "SAST, DAST, dependency, container. Open at GitLab."),
  house("sast-dast", "SAST / DAST / SCA", "cyber", "DevSecOps", "open", "https://owasp.org/www-community/Source_Code_Analysis_Tools", "Static, dynamic, and composition analysis. OWASP tool lists.", { concepts: ["SAST", "DAST", "SCA", "Secrets scanning"] }),
  house("sbom", "SBOM", "cyber", "Supply chain", "open", "https://www.cisa.gov/sbom", "Ingredients list for software. CISA minimum elements, including AI SBOMs.", { papers: [{ title: "CISA SBOM", href: "https://www.cisa.gov/sbom" }], concepts: ["CycloneDX", "SPDX"] }),
  house("aibom", "AIBOM", "cyber", "Supply chain", "open", "https://www.cisa.gov/resources-tools/resources/software-bill-materials-ai-minimum-elements", "AI bill of materials. Model, data, tools — not just packages.", { papers: [{ title: "CISA AIBOM", href: "https://www.cisa.gov/resources-tools/resources/software-bill-materials-ai-minimum-elements" }] }),
  house("dep-attack", "Dependency attacks", "cyber", "Supply chain", "open", "https://openssf.org/", "Confusion, typosquat, poisoned packages, compromised repos. OpenSSF.", { concepts: ["Dependency confusion", "Typosquatting", "Malicious package"] }),
  house("sigstore", "Signing & provenance", "cyber", "Supply chain", "open", "https://www.sigstore.dev/", "Sigstore, code signing, artifact signing. SLSA sits next door.", { concepts: ["Sigstore", "Provenance", "Code signing"] }),
  house("third-party", "Third-party / OSS risk", "cyber", "Supply chain", "open", "https://www.cisa.gov/resources-tools/resources/secure-by-demand-guide-what-software-customers-should-demand-their", "Trusted repos, vendor demand, Gartner 2026–27 critical threat area.", { jobs: ["Supply-chain analyst"] }),
  house("model-prov", "Model provenance", "cyber", "AI supply chain", "external", "https://huggingface.co/docs/hub/security", "Where did this model come from? Hugging Face hub security. We do not copy models.", { concepts: ["Provenance", "Model card", "Integrity"] }),
  house("model-poison", "Poisoned models & data", "cyber", "AI supply chain", "open", "https://genai.owasp.org/", "Training-data poisoning, malicious weights, tainted artifacts. OWASP LLM.", { concepts: ["Data poisoning", "Malicious model", "Integrity"] }),
  house("model-sign", "Model signing & AIBOM", "cyber", "AI supply chain", "open", "https://www.cisa.gov/sbom", "Sign the artifact. List the ingredients. Third-party AI APIs and plugins are suppliers too."),
  house("ai-plugins", "AI plugins & tools", "cyber", "AI supply chain", "external", "https://modelcontextprotocol.io/", "Agents pull third-party tools. Treat each tool as a supplier."),
  house("api-rest", "REST & gateways", "cyber", "API academy", "open", "https://owasp.org/www-project-api-security/", "Inventory, discovery, shadow APIs. CSA 2026: insecure interfaces.", { concepts: ["REST", "Gateway", "Shadow API"] }),
  house("api-gql", "GraphQL & gRPC", "cyber", "API academy", "open", "https://owasp.org/www-project-api-security/", "Introspection, batching, protobuf surfaces. Same BOLA problem."),
  house("api-auth", "API authn / authz", "cyber", "API academy", "open", "https://oauth.net/2/", "OAuth, JWT, BOLA/IDOR. Broken object auth is still #1.", { concepts: ["OAuth", "JWT", "BOLA", "IDOR"] }),
  house("api-abuse", "API abuse & fuzzing", "cyber", "API academy", "open", "https://owasp.org/www-project-web-security-testing-guide/", "Rate limits, injection, pentest. Authorized scope only.", { jobs: ["API security engineer"] }),
  house("xcloud-iam", "Cross-cloud IAM", "cyber", "Multi-cloud", "external", "https://cloudsecurityalliance.org/", "Federated identity across AWS, Azure, GCP. CSA: hybrid policy is the hard part.", { concepts: ["Federation", "Cross-cloud IAM"] }),
  house("xcloud-net", "Multi-cloud networking", "cyber", "Multi-cloud", "external", "https://docs.aws.amazon.com/whitepapers/latest/aws-security-incident-response-guide/welcome.html", "Firewalls, segmentation, data sovereignty, migration. Open at the clouds."),
  house("cspm", "CSPM / cloud governance", "cyber", "Multi-cloud", "external", "https://learn.microsoft.com/en-us/azure/defender-for-cloud/", "Policy, posture, centralized logs, SIEM. Open at Microsoft / AWS / GCP."),
  house("cnapp", "CNAPP", "cyber", "CNAPP", "external", "https://www.gartner.com/en/information-technology/glossary/cloud-native-application-protection-platform-cnapp", "CSPM + CWPP + CIEM + K8s + IaC + runtime. One posture, not five tools.", { concepts: ["CSPM", "CWPP", "CIEM", "Runtime"] }),
  house("ciem", "CIEM", "cyber", "CNAPP", "external", "https://cloudsecurityalliance.org/", "Cloud infrastructure entitlement. Who can assume what."),
  house("cwpp", "CWPP / runtime", "cyber", "CNAPP", "external", "https://www.cncf.io/", "Workload protection, detection, attack-path. Open at CNCF / vendor."),
  house("cnapp-vendors", "CNAPP products", "cyber", "CNAPP", "external", "https://learn.microsoft.com/en-us/azure/defender-for-cloud/", "Wiz, Prisma Cloud, Defender for Cloud, Orca, Lacework, Falcon Cloud. Open at the vendor. We do not copy their labs."),
  house("attack-path", "Attack-path management", "cyber", "Attack path", "open", "https://attack.mitre.org/", "Vulnerability → privilege → lateral → crown jewel. Toxic combinations, CAASM, EASM.", { concepts: ["Attack graph", "Toxic combo", "Exposure"], jobs: ["Exposure analyst"] }),
  house("easm", "EASM", "cyber", "Exposure", "open", "https://www.cisa.gov/topics/cyber-threats-and-advisories", "External attack surface. Internet-facing assets first.", { concepts: ["EASM", "Internet-facing"] }),
  house("caasm", "CAASM", "cyber", "Exposure", "external", "https://www.cisa.gov/", "Cyber asset attack surface. Inventory, identity exposure, cloud exposure.", { concepts: ["CAASM", "Inventory"] }),
  house("ctem", "CTEM", "cyber", "Exposure", "external", "https://www.gartner.com/en/information-technology/glossary/continuous-threat-exposure-management-ctem", "Discover → Assess → Prioritize → Validate → Remediate → Monitor.", { jobs: ["Exposure manager"] }),
  house("zt-arch", "Zero Trust architecture", "cyber", "Zero Trust", "open", "https://www.nist.gov/publications/zero-trust-architecture", "NIST SP 800-207. Never trust, always verify — as architecture, not a slogan.", { papers: [{ title: "SP 800-207", href: "https://www.nist.gov/publications/zero-trust-architecture" }], concepts: ["Identity", "Device", "Workload", "App"] }),
  house("ztna", "ZTNA / SDP / SASE / SSE", "cyber", "Zero Trust", "external", "https://cloudsecurityalliance.org/", "Access, not a VPN. CSA program management + microsegmentation.", { concepts: ["ZTNA", "SDP", "SASE", "SSE"] }),
  house("microseg", "Microsegmentation", "cyber", "Zero Trust", "open", "https://www.cisa.gov/", "Stop the attacker who is already in. East-west, identity-based, K8s NetworkPolicy, security groups.", { concepts: ["East-west", "Workload seg", "NetworkPolicy"] }),
  house("confidential", "Confidential computing", "cyber", "Advanced", "open", "https://confidentialcomputing.io/", "TEEs, enclaves, confidential VMs/containers, attestation, data-in-use, confidential AI. Gartner 2026.", { concepts: ["TEE", "Enclave", "Attestation"], jobs: ["Cloud security engineer"] }),
  house("shor", "Quantum threat", "cyber", "PQC", "open", "https://csrc.nist.gov/projects/post-quantum-cryptography", "Shor, Grover, harvest-now-decrypt-later. Inventory crypto before you migrate.", { concepts: ["Shor", "Grover", "HNDL"] }),
  house("pq-algs", "ML-KEM / ML-DSA / SLH-DSA", "cyber", "PQC", "open", "https://csrc.nist.gov/projects/post-quantum-cryptography", "NIST PQC standards. Crypto-agility, PKI and TLS migration. Gartner: start now.", { concepts: ["ML-KEM", "ML-DSA", "Crypto-agility"] }),
  house("deepfake", "Deepfake & identity fraud", "cyber", "Fraud", "open", "https://www.cisa.gov/", "Voice clone, video impersonation, synthetic ID, recruitment fraud. Gartner 2026–27.", { concepts: ["Deepfake", "Synthetic identity", "BEC"], jobs: ["Fraud analyst"] }),
  house("lotc", "Living off the cloud", "cyber", "Cloud-native attacks", "external", "https://cloud.google.com/security/resources", "Abuse legitimate cloud APIs, tokens, storage, admin. Google 2026 threat research. No malware required.", { concepts: ["Token theft", "SaaS persistence", "Cloud-native"] }),
  house("saas-sec", "SaaS security / SSPM", "cyber", "SaaS", "external", "https://cloudsecurityalliance.org/", "M365, Workspace, Salesforce. OAuth apps, shadow SaaS, token theft, SaaS-to-SaaS.", { concepts: ["SSPM", "Shadow SaaS", "OAuth"] }),
  house("bec", "Business email compromise", "cyber", "Fraud", "open", "https://www.cisa.gov/news-events/news/business-email-compromise-bec", "CEO fraud, invoice fraud, OAuth phish, QR, vishing, AI-written BEC.", { jobs: ["SOC analyst"] }),
  house("win-dfir", "Windows / Linux forensics", "cyber", "DFIR", "open", "https://www.cisa.gov/", "Disk, memory, browser, timeline. Preserve first.", { jobs: ["DFIR analyst"] }),
  house("cloud-dfir", "Cloud / mobile / network DFIR", "cyber", "DFIR", "open", "https://www.cisa.gov/", "Logs as evidence. Chain of custody still applies in the cloud."),
  house("trivy", "Trivy / container scan", "cyber", "DevSecOps", "open", "https://trivy.dev/", "Open-source image, IaC, and secret scan. Open at Aqua/Trivy."),
  house("semgrep", "Semgrep", "cyber", "DevSecOps", "open", "https://semgrep.dev/", "Open-source SAST rules. Open at Semgrep. We do not copy paid rules."),
  house("tf-sec", "Terraform security", "cyber", "IaC", "external", "https://developer.hashicorp.com/terraform/cloud-docs/policy-enforcement", "State, secrets, misconfig. Open at HashiCorp.", { concepts: ["State file", "Remote backend", "Policy as code"] }),
  house("cfn-sec", "CloudFormation security", "cyber", "IaC", "external", "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/security.html", "Open at AWS."),
  house("bicep-sec", "ARM / Bicep security", "cyber", "IaC", "external", "https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/best-practices", "Open at Microsoft Learn."),
  house("checkov", "Checkov / Terrascan", "cyber", "IaC", "open", "https://www.checkov.io/", "Policy-as-code scanners. Open at source. We do not copy paid clouds."),
  house("iac-drift", "Infrastructure drift", "cyber", "IaC", "external", "https://developer.hashicorp.com/terraform/cli/commands/plan", "Plan vs apply vs live. Open at HashiCorp."),
  house("iso27001", "ISO 27001", "cyber", "GRC", "external", "https://www.iso.org/standard/27001", "ISMS. Buy the standard at ISO — we do not host it.", { jobs: ["GRC analyst"] }),
  house("soc2", "SOC 2", "cyber", "GRC", "external", "https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2", "Trust services criteria. Open at AICPA.", { jobs: ["IT auditor"] }),
  house("pci", "PCI DSS", "cyber", "GRC", "external", "https://www.pcisecuritystandards.org/", "Cardholder data. Open at the Council."),
  house("hipaa-sec", "HIPAA security rule", "cyber", "GRC", "open", "https://www.hhs.gov/hipaa/for-professionals/security/index.html", "ePHI. Open at HHS.", { jobs: ["Healthcare GRC"] }),
  house("audit", "Control assessment", "cyber", "GRC", "external", "https://csrc.nist.gov/publications/detail/sp/800-53a/rev-5/final", "NIST 800-53A assessor methods. Course → lab → quiz → cert → job.", { papers: [{ title: "SP 800-53A", href: "https://csrc.nist.gov/publications/detail/sp/800-53a/rev-5/final" }], jobs: ["Control assessor"] }),
  house("80037", "NIST SP 800-37", "cyber", "NIST Academy", "open", "https://csrc.nist.gov/pubs/sp/800/37/r2/final", "RMF for systems and organizations. Prepare → Categorize → Select → Implement → Assess → Authorize → Monitor.", { papers: [{ title: "SP 800-37 Rev. 2", href: "https://csrc.nist.gov/pubs/sp/800/37/r2/final" }], concepts: ["Prepare", "Categorize", "Select", "Implement", "Assess", "Authorize", "Monitor"], jobs: ["ISSO", "Authorizing official"] }),
  house("80030", "NIST SP 800-30", "cyber", "NIST Academy", "open", "https://csrc.nist.gov/pubs/sp/800/30/r1/final", "Guide for conducting risk assessments.", { papers: [{ title: "SP 800-30", href: "https://csrc.nist.gov/pubs/sp/800/30/r1/final" }], concepts: ["Likelihood", "Impact", "Risk"] }),
  house("80061", "NIST SP 800-61", "cyber", "NIST Academy", "open", "https://csrc.nist.gov/pubs/sp/800/61/r2/final", "Computer security incident handling.", { papers: [{ title: "SP 800-61", href: "https://csrc.nist.gov/pubs/sp/800/61/r2/final" }], jobs: ["Incident responder"] }),
  house("800171", "NIST SP 800-171", "cyber", "NIST Academy", "open", "https://csrc.nist.gov/pubs/sp/800/171/r3/final", "Protecting CUI in nonfederal systems. Feeds CMMC.", { papers: [{ title: "SP 800-171", href: "https://csrc.nist.gov/pubs/sp/800/171/r3/final" }], jobs: ["CMMC assessor"] }),
  house("800161", "NIST SP 800-161", "cyber", "NIST Academy", "open", "https://csrc.nist.gov/pubs/sp/800/161/r1/final", "Cybersecurity supply-chain risk management.", { papers: [{ title: "SP 800-161", href: "https://csrc.nist.gov/pubs/sp/800/161/r1/final" }] }),
  house("cis", "CIS Controls", "cyber", "Frameworks", "open", "https://www.cisecurity.org/controls", "Prioritized safeguards. Open at CIS.", { jobs: ["Security engineer"] }),
  house("cobit", "COBIT", "cyber", "Frameworks", "external", "https://www.isaca.org/resources/cobit", "IT governance. Open at ISACA. We do not host the paid book."),
  house("fisma", "FISMA", "cyber", "Federal", "open", "https://csrc.nist.gov/projects/risk-management/fisma-background", "Federal Information Security Modernization Act. Law that drives RMF.", { jobs: ["Federal ISSO"] }),
  house("ato", "ATO package lab", "cyber", "Federal", "open", "https://csrc.nist.gov/projects/risk-management", "Simulated lab: build an authorization package for a hypothetical federal system — SSP, SAP, SAR, POA&M, then ATO decision.", { concepts: ["SSP", "SAP", "SAR", "POA&M", "ATO"], jobs: ["ISSO", "ISSE", "SCA"] }),
  house("ssp", "SSP / SAP / SAR / POA&M", "cyber", "Federal", "open", "https://csrc.nist.gov/projects/risk-management", "The authorization artifacts. System Security Plan, assessment plan, assessment report, plan of action and milestones.", { concepts: ["SSP", "SAP", "SAR", "POA&M", "Continuous monitoring"] }),
  house("stigs", "DISA STIGs", "cyber", "Federal", "open", "https://public.cyber.mil/stigs/", "DoD security technical implementation guides. Open at cyber.mil.", { jobs: ["STIG reviewer"] }),
  house("cdm", "CDM", "cyber", "Federal", "open", "https://www.cisa.gov/cdm", "Continuous Diagnostics and Mitigation. Open at CISA."),
  house("tic", "TIC 3.0", "cyber", "Federal", "open", "https://www.cisa.gov/topics/cloud-security/trusted-internet-connections", "Trusted Internet Connections. Open at CISA."),
  house("emass", "eMASS / Xacta", "cyber", "Federal", "external", "https://www.disa.mil/", "Authorization tools. Open at DISA / vendor. We do not copy the product."),
  house("cve", "CVE / NVD", "cyber", "Vuln mgmt", "open", "https://nvd.nist.gov/", "Common Vulnerabilities and Exposures. Official NVD.", { concepts: ["CVE", "CWE"], jobs: ["Vulnerability analyst"] }),
  house("cvss", "CVSS", "cyber", "Vuln mgmt", "open", "https://www.first.org/cvss/", "Severity scores. Official FIRST.", { concepts: ["Base", "Temporal", "Environmental"] }),
  house("epss", "EPSS", "cyber", "Vuln mgmt", "open", "https://www.first.org/epss/", "Exploit Prediction Scoring System. Official FIRST.", { concepts: ["Likelihood of exploit"] }),
  house("kev", "CISA KEV", "cyber", "Vuln mgmt", "open", "https://www.cisa.gov/known-exploited-vulnerabilities-catalog", "Known Exploited Vulnerabilities. Patch these first.", { papers: [{ title: "KEV catalog", href: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog" }], concepts: ["KEV", "BOD", "Prioritization"] }),
  house("vuln-life", "Vulnerability lifecycle", "cyber", "Vuln mgmt", "open", "https://www.cisa.gov/topics/cyber-threats-and-advisories", "Scan → prioritize (KEV/EPSS/CVSS) → remediate or POA&M → accept residual risk → monitor.", { concepts: ["Scan", "Prioritize", "Remediate", "Exception", "Risk acceptance"] }),
  house("scanners", "Nessus / Qualys / Rapid7", "cyber", "Vuln mgmt", "external", "https://www.tenable.com/", "Scanners live at the vendor. We do not copy licensed plugins."),
  house("ai-vuln", "AI-assisted vuln mgmt", "cyber", "Vuln mgmt", "external", "https://www.cisa.gov/known-exploited-vulnerabilities-catalog", "Use KEV + EPSS + asset context. The model ranks. The analyst decides."),
  house("stix", "STIX / TAXII", "cyber", "Threat intel", "open", "https://oasis-open.github.io/cti-documentation/", "How intel is packaged and shared. OASIS CTI.", { concepts: ["STIX", "TAXII", "IOC", "TTP"] }),
  house("cti", "Threat intelligence", "cyber", "Threat intel", "open", "https://www.cisa.gov/topics/cyber-threats-and-advisories", "IOC vs TTP. Feeds inform hunting. MITRE ATT&CK is the common language.", { concepts: ["OSINT", "IOC", "TTP", "Feeds"], jobs: ["Threat intel analyst"] }),
  house("malware-fund", "Malware fundamentals", "cyber", "Malware", "open", "https://www.cisa.gov/stopransomware", "Families, persistence, C2. CISA StopRansomware.", { concepts: ["Ransomware", "Trojan", "RAT", "Botnet"], jobs: ["Malware analyst"] }),
  house("static-dyn", "Static & dynamic analysis", "cyber", "Malware", "external", "https://www.cisa.gov/", "PE, sandbox, internals. Practice on samples you are licensed to hold."),
  house("crypto-fund", "Cryptography fundamentals", "cyber", "Crypto", "open", "https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines", "Symmetric, asymmetric, hash, signatures, PKI, TLS.", { concepts: ["AES", "RSA/ECC", "SHA", "PKI", "TLS"], jobs: ["Crypto engineer"] }),
  house("kms-hsm", "KMS / HSM / keys", "cyber", "Crypto", "external", "https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final", "NIST key management. Cloud KMS is at AWS/Azure/GCP."),
  house("pqc", "Post-quantum cryptography", "cyber", "Crypto", "open", "https://csrc.nist.gov/projects/post-quantum-cryptography", "NIST PQC standards. AWS and others are migrating.", { papers: [{ title: "NIST PQC", href: "https://csrc.nist.gov/projects/post-quantum-cryptography" }], jobs: ["Crypto engineer"] }),
  house("net-seg", "Segmentation & Zero Trust net", "cyber", "Network", "external", "https://www.nist.gov/publications/zero-trust-architecture", "Microseg, SASE/SSE, SD-WAN. Start from SP 800-207.", { concepts: ["Firewall", "IDS/IPS", "NAC", "SASE"] }),
  house("dns-sec", "DNS / VPN / proxy", "cyber", "Network", "open", "https://www.cisa.gov/", "Name, path, and edge. Open at CISA."),
  house("masvs", "OWASP MASVS", "cyber", "Mobile", "open", "https://mas.owasp.org/", "Mobile Application Security Verification Standard. Android and iOS.", { concepts: ["MASVS", "MASTG", "Auth", "Storage"], jobs: ["Mobile security engineer"] }),
  house("mob-test", "Mobile app testing", "cyber", "Mobile", "open", "https://mas.owasp.org/MASTG/", "OWASP MASTG. Reverse engineering only on apps you own or have permission to test."),
  house("ics", "ICS / SCADA / PLC", "cyber", "OT / IoT", "open", "https://www.cisa.gov/topics/industrial-control-systems", "Industrial control. CISA ICS. Do not scan plants you do not own.", { concepts: ["SCADA", "PLC", "OT network"], jobs: ["OT security engineer"] }),
  house("80082", "NIST SP 800-82", "cyber", "OT / IoT", "open", "https://csrc.nist.gov/pubs/sp/800/82/r3/final", "Guide to ICS security.", { papers: [{ title: "SP 800-82", href: "https://csrc.nist.gov/pubs/sp/800/82/r3/final" }] }),
  house("iot", "IoT & smart building", "cyber", "OT / IoT", "open", "https://www.cisa.gov/topics/internet-things", "Default creds, firmware, segmentation. Open at CISA."),
  house("med-device", "Medical device security", "cyber", "OT / IoT", "open", "https://www.fda.gov/medical-devices/digital-health-center-excellence/cybersecurity", "FDA device cybersecurity. Open at FDA."),
  house("auto-sec", "Automotive security", "cyber", "OT / IoT", "external", "https://www.nhtsa.gov/vehicle-safety/cybersecurity-and-automated-vehicles", "Vehicle systems. Open at NHTSA."),
  house("stride", "Threat modeling / STRIDE", "cyber", "Secure build", "open", "https://owasp.org/www-community/Threat_Modeling", "Spoof, tamper, repudiate, info-disclose, DoS, elevation. Open at OWASP.", { concepts: ["STRIDE", "DFD", "Trust boundary"], jobs: ["AppSec engineer"] }),
  house("secure-code", "Secure coding", "cyber", "Secure build", "open", "https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/", "Memory, authn, authz, secrets, APIs. OWASP.", { concepts: ["Code review", "Memory safety", "Auth"] }),
  house("ir-tabletop", "Ransomware tabletop", "cyber", "Incident response", "open", "https://www.cisa.gov/stopransomware", "A ransomware attack just occurred. Walk: detect → triage → contain → investigate → eradicate → recover → lessons → report.", { concepts: ["Detection", "Triage", "Containment", "Investigation", "Eradication", "Recovery", "Lessons learned", "Reporting"], jobs: ["Incident responder"] }),
  house("nist-ir", "NIST IR playbook", "cyber", "Incident response", "open", "https://csrc.nist.gov/pubs/sp/800/61/r2/final", "800-61 handling guide. Same eight moves as the tabletop.", { papers: [{ title: "SP 800-61", href: "https://csrc.nist.gov/pubs/sp/800/61/r2/final" }] }),

  house("ieee", "IEEE", "professional", "Engineering", "external", "https://www.ieee.org/", "Engineering standards and talks."),
  house("asme", "ASME", "professional", "Engineering", "external", "https://www.asme.org/", "Mechanical engineering education."),
  house("asce", "ASCE", "professional", "Engineering", "external", "https://www.asce.org/", "Civil engineering practice."),
  house("sae", "SAE", "professional", "Engineering", "external", "https://www.sae.org/", "Mobility engineering."),
  house("acm", "ACM", "professional", "Computing", "external", "https://www.acm.org/", "Computing research and education."),
  house("linux", "Linux Foundation", "professional", "Computing", "external", "https://www.linuxfoundation.org/", "Open-source training. Open at LF."),
  house("cncf", "CNCF", "professional", "Computing", "external", "https://www.cncf.io/", "Cloud native projects and training."),

  house("yc", "Y Combinator", "business", "Startups", "external", "https://www.ycombinator.com/library", "Startup library. Open at YC."),
  house("gsb", "Stanford GSB", "business", "Schools", "external", "https://www.gsb.stanford.edu/", "Leadership and entrepreneurship."),
  house("hbs", "Harvard Business School", "business", "Schools", "external", "https://www.hbs.edu/", "Case method. Open at HBS."),
  house("sloan", "MIT Sloan", "business", "Schools", "external", "https://mitsloan.mit.edu/", "Management and analytics."),
  house("wharton", "Wharton", "business", "Schools", "external", "https://www.wharton.upenn.edu/", "Finance and business."),
  house("haas", "Berkeley Haas", "business", "Schools", "external", "https://haas.berkeley.edu/", "Entrepreneurship and leadership."),
  house("lbs", "London Business School", "business", "Schools", "external", "https://www.london.edu/", "Global business education."),
  house("insead", "INSEAD", "business", "Schools", "external", "https://www.insead.edu/", "International management."),
  house("sba", "SBA", "business", "Small business", "open", "https://www.sba.gov/", "U.S. small-business education."),
  house("score", "SCORE", "business", "Small business", "open", "https://www.score.org/", "Mentors for small firms."),
  house("amanet", "American Management Association", "business", "Societies", "external", "https://www.amanet.org/", "Management training. Open at AMA."),
  house("aicpa", "AICPA & CIMA", "business", "Accounting", "external", "https://www.aicpa-cima.com/", "Accounting and CPA education."),
  house("cfa-biz", "CFA Institute", "business", "Accounting", "external", "https://www.cfainstitute.org/", "Investment education. Open at CFA."),

  house("si", "Smithsonian", "history", "Public collections", "embed", "https://www.si.edu/", "Museums, research, education.", { youtubeId: "zbIVDyZ_I_8", concepts: ["American history", "Collections"] }),
  house("loc-hist", "Library of Congress · National Screening Room", "history", "Public collections", "open", "https://www.loc.gov/collections/national-screening-room/?utm_source=chatgpt.com", "National Screening Room historic films, American memory, and public lectures.", {
    papers: [
      { title: "National Screening Room", href: "https://www.loc.gov/collections/national-screening-room/?utm_source=chatgpt.com" },
      { title: "Internet Archive Movies", href: "https://archive.org/details/movies?utm_source=chatgpt.com" },
    ],
    concepts: ["National Screening Room", "American memory"],
  }),
  house("nara-hist", "National Archives", "history", "Public collections", "open", "https://www.archives.gov/", "Founding records and civics."),
  house("pbs", "PBS", "history", "Broadcast", "external", "https://www.pbs.org/", "Documentaries. Open at PBS."),
  house("unesco", "UNESCO", "history", "World", "external", "https://www.unesco.org/", "Heritage and education."),

  house("met", "The Met", "museums", "Art", "open", "https://www.metmuseum.org/", "Open access collection."),
  house("nga", "National Gallery of Art", "museums", "Art", "open", "https://www.nga.gov/", "Open images. Public domain."),
  house("moma", "MoMA", "museums", "Art", "external", "https://www.moma.org/", "Modern art. Open at MoMA."),
  house("british", "British Museum", "museums", "World", "external", "https://www.britishmuseum.org/", "World collections."),
  house("louvre", "Louvre", "museums", "World", "external", "https://www.louvre.fr/en", "Collections and virtual tours."),
  house("amnh", "American Museum of Natural History", "museums", "Science", "external", "https://www.amnh.org/", "Natural history and research."),
  house("nasm-m", "National Air and Space Museum", "museums", "Science", "external", "https://airandspace.si.edu/", "Flight and space exhibits."),
  house("ushmm", "Holocaust Memorial Museum", "museums", "History", "external", "https://www.ushmm.org/", "History education. Open at the museum."),
  house("nmaahc", "National Museum of African American History", "museums", "History", "external", "https://nmaahc.si.edu/", "African American history and culture."),

  house("bibleproject", "BibleProject", "faith", "Study", "embed", "https://bibleproject.com/", "Literary and historical reading.", { concepts: ["Genre", "Context", "Theme"] }),
  house("harvard-div", "Harvard Divinity", "faith", "Study", "external", "https://hds.harvard.edu/", "Comparative religion and theology."),
  house("sefaria", "Sefaria", "faith", "Study", "open", "https://www.sefaria.org/", "Jewish texts. Open library."),
  house("islamic", "Harvard Islamic Studies", "faith", "Study", "external", "https://islamicstudies.harvard.edu/", "Academic Islamic studies. Open at Harvard."),

  house("jazz", "Jazz at Lincoln Center", "music", "Study", "external", "https://www.jazz.org/", "Jazz history and education."),
  house("sfcm", "San Francisco Conservatory", "music", "Study", "external", "https://sfcm.edu/", "Performance and theory."),

  house("acsm", "ACSM", "sports", "Science", "external", "https://www.acsm.org/", "Exercise science and medicine."),
  house("nsca", "NSCA", "sports", "Science", "external", "https://www.nsca.com/", "Strength and conditioning."),

  house("neurips", "NeurIPS", "conferences", "Recorded", "external", "https://neurips.cc/", "AI research talks."),
  house("rsa", "RSA Conference", "conferences", "Keynotes", "external", "https://www.rsaconference.com/", "Security keynotes."),
  house("ieeeconf", "IEEE conferences", "conferences", "Recorded", "external", "https://www.ieee.org/conferences/", "Engineering symposiums."),
  house("ahasess", "AHA Scientific Sessions", "conferences", "Recorded", "external", "https://professional.heart.org/", "Cardiology research presentations."),
  house("defcon", "DEF CON", "conferences", "Recorded", "external", "https://www.defcon.org/", "Security talks. Open at DEF CON."),
  house("blackhat", "Black Hat", "conferences", "Upcoming", "external", "https://www.blackhat.com/", "Security briefings. Open at Black Hat. We embed only talks the conference publishes."),
  house("reinvent", "AWS re:Invent", "conferences", "Keynotes", "external", "https://aws.amazon.com/events/reinvent/", "Cloud security sessions. Open at AWS."),
  house("ignite", "Microsoft Ignite", "conferences", "Keynotes", "external", "https://www.microsoft.com/en-us/ignite", "Identity, cloud, and AI security. Open at Microsoft."),
  house("cloudnext", "Google Cloud Next", "conferences", "Keynotes", "external", "https://cloud.google.com/next", "GCP security and AI. Open at Google Cloud."),
  house("kubecon", "KubeCon + CloudNativeCon", "conferences", "Recorded", "external", "https://www.cncf.io/kubecon-cloudnativecon-events/", "CNCF recorded talks. Open at CNCF."),
  house("bsides", "BSides", "conferences", "Recorded", "external", "https://www.securitybsides.com/", "Community security talks. Open at BSides. Do not scrape attendee films."),
  house("sans-conf", "SANS conferences", "conferences", "Upcoming", "external", "https://www.sans.org/cyber-security-training-events/", "Paid professional events. Open at SANS. We do not copy courseware."),
  house("rsna", "RSNA", "conferences", "Workshops", "external", "https://www.rsna.org/", "Radiology education."),
  house("public-lectures", "University public lectures", "conferences", "Keynotes", "external", "https://ocw.mit.edu/", "Guest lectures live on Learn → Universities."),

  // Noctis Enterprise Engineering Fleet — 22 Badges (1,148 Topics)
  house("vt-k8s-22", "Kubernetes Cloud-Native & GitOps Infrastructure", "professional", "Cloud & DevOps", "embed", "https://vibetok-learning-hub.vercel.app/k8s", "8 Modules, 48 Topics. Declarative reconciliation, kube-apiserver, etcd Raft, Cilium eBPF, Istio Ambient, Argo CD GitOps, and Karpenter.", { concepts: ["kube-apiserver","eBPF Cilium","Istio Ambient Mesh","Argo CD GitOps","Operator SDK","Karpenter Autoscaling"], jobs: ["Platform Engineer","Site Reliability Engineer (SRE)","Cloud Architect","DevOps Engineer"] }),
  house("vt-sec-21", "Enterprise Cybersecurity Architecture, Threat Defense & Zero Trust", "cyber", "Architecture & Defenses", "embed", "https://vibetok-learning-hub.vercel.app/sec", "8 Modules, 48 Topics. NIST SP 800-207 Zero Trust, OWASP Top 10, API Hardening, Threat Modeling (STRIDE/PASTA), Ghidra Malware Reverse Engineering, Memory Forensics, and CISSP/Security+ Synthesis.", { concepts: ["Zero Trust Architecture","OWASP Top 10","Threat Modeling","Static/Dynamic Malware Analysis","Memory Forensics","CISSP Domains"], jobs: ["Cybersecurity Architect","Security Engineer","SOC Analyst","AppSec Specialist","Incident Responder"] }),
  house("vt-oo-20", "Object-Oriented Architecture, Enterprise Design Patterns & Clean Codecraft", "code", "Architecture & Patterns", "embed", "https://vibetok-learning-hub.vercel.app/oo", "8 Modules, 48 Topics. GRASP, SOLID mechanics, GoF patterns, Hexagonal Ports & Adapters, CQRS Outbox, Agentic MCP Connectors, and TDD.", { concepts: ["SOLID Principles","Hexagonal Architecture","CQRS Pattern","Domain-Driven Design","Model Context Protocol (MCP)","Mutation Testing"], jobs: ["Principal Software Engineer","Systems Architect","Lead Backend Developer"] }),
  house("vt-dl-19", "Deep Learning & Modern Neural Architectures", "code", "Deep Learning", "embed", "https://vibetok-learning-hub.vercel.app/dl", "8 Modules, 48 Topics. Reverse-mode Autograd, ConvNeXt, Swin Shifted Window Attention, Masked Autoencoders (MAE), DINOv2 Self-Distillation, and PyG Graph Neural Networks.", { concepts: ["Reverse Autograd","Vision Transformers","Masked Autoencoders","Contrastive Learning","Graph Neural Networks (GNNs)"], jobs: ["Deep Learning Engineer","Computer Vision Specialist","AI Research Scientist"] }),
  house("vt-dist-18", "Big Data Analytics & Distributed Feature Engineering", "code", "Distributed Systems", "embed", "https://vibetok-learning-hub.vercel.app/dist", "8 Modules, 48 Topics. Ray Core & KubeRay, Dask DAGs, Arrow Flight SQL, Feast Feature Store, DuckDB morsel parallelism, and Wasserstein transport drift.", { concepts: ["Ray Tasks & Actors","Feast Feature Store","Arrow Flight SQL","DuckDB Analytical","Feature Selection SHAP","Data Drift Profiling"], jobs: ["MLOps Engineer","Machine Learning Platform Engineer","Big Data Architect"] }),
  house("vt-stat-17", "Advanced Statistical Modeling, Causal Inference & Time-Series", "research", "Statistical Modeling", "embed", "https://vibetok-learning-hub.vercel.app/stat", "12 Modules, 72 Topics. Exponential dispersion GLMs, Pearl's SCMs & Do-Calculus, Bayesian Stan/PyMC MCMC, Kalman State-Space BSTS, Temporal Fusion Transformers, and Copula extreme value tails.", { concepts: ["Structural Causal Models (SCM)","Bayesian MCMC","Kalman Filtering","Temporal Fusion Transformers","Extreme Value Theory","Conformal Prediction"], jobs: ["Senior Data Scientist","Quantitative Researcher","Econometrician","Biostatistician"] }),
  house("vt-eda-16", "Exploratory Data Analysis & Modern Data Wrangling", "code", "Data Wrangling", "embed", "https://vibetok-learning-hub.vercel.app/eda", "8 Modules, 48 Topics. Rust-powered Polars query engine, Apache Arrow memory buffers, Little's MCAR missingness, FastMCD outlier geometry, and Population Stability Index.", { concepts: ["Polars Rust Core","Arrow In-Memory","Missingness Diagnostics","FastMCD Anomaly Isolation","Weight of Evidence (WoE)","Automated Profiling"], jobs: ["Analytics Engineer","Data Analyst","Data Wrangling Specialist"] }),
  house("vt-aiml-15", "AI & Machine Learning Systems", "code", "Machine Learning", "embed", "https://vibetok-learning-hub.vercel.app/aiml", "8 Modules, 48 Topics. Gradient Boosting, End-to-End MLOps Pipelines, Model Drift Monitoring, Hyperparameter Optimization, ONNX Runtime, and Triton Inference Server.", { concepts: ["Gradient Boosting","MLOps Lifecycle","Hyperparameter Optimization","Model Monitoring","Triton Inference Serving"], jobs: ["Machine Learning Engineer","AI Solutions Architect"] }),
  house("vt-sas-14", "Enterprise SAS 9.4 & Viya Cloud Analytics", "professional", "Enterprise Analytics", "embed", "https://vibetok-learning-hub.vercel.app/sas", "8 Modules, 48 Topics. DATA Step compiler internals, memory hash objects, PROC SQL, SAS Viya CAS in-memory engine, Macro facility, and regulatory risk scoring.", { concepts: ["DATA Step Compiler","In-Memory Hash Objects","SAS Viya Cloud CAS","Macro Processor","Credit Risk Analytics"], jobs: ["SAS Programmer","Risk Analytics Modeler","Statistical Programmer"] }),
  house("vt-pnd-13", "Enterprise Pandas 2.x & High-Performance Python", "code", "Python Engineering", "embed", "https://vibetok-learning-hub.vercel.app/pandas", "8 Modules, 48 Topics. PyArrow-backed DataFrames, Copy-on-Write (CoW) memory model, SIMD string processing, memory profiling, and high-throughput method chaining.", { concepts: ["PyArrow Backend","Copy-on-Write (CoW)","SIMD String Acceleration","Memory Allocations","Vectorized Pipelines"], jobs: ["Python Engineer","Data Engineer","Quant Developer"] }),
  house("vt-rdb-12", "Enterprise Relational Databases & Internals", "code", "Relational Databases", "embed", "https://vibetok-learning-hub.vercel.app/rdbms", "8 Modules, 48 Topics. ACID guarantees, Multi-Version Concurrency Control (MVCC), Write-Ahead Logging (WAL), B+ Tree page layouts, Cost-Based Optimizers, and Distributed 2PC.", { concepts: ["ACID MVCC Mechanics","B+ Tree Index Internals","WAL Buffer Pools","Cost-Based Query Optimization","Two-Phase Commit (2PC)"], jobs: ["Database Administrator (DBA)","Database Reliability Engineer","Backend Systems Engineer"] }),
  house("vt-nosql-11", "Enterprise NoSQL Systems & Polyglot Persistence", "code", "NoSQL & Distributed DBs", "embed", "https://vibetok-learning-hub.vercel.app/nosql", "8 Modules, 48 Topics. LSM-Trees & SSTables, Dynamo-style consistent hashing, Partition & Sort key design, Cassandra Quorum consistency, and Neo4j graph indexing.", { concepts: ["LSM-Tree Compaction","Consistent Hashing Ring","DynamoDB Access Patterns","Cassandra Tunable Consistency","Graph Traversal"], jobs: ["NoSQL Architect","Cloud Database Engineer","Distributed Systems Engineer"] }),
  house("vt-stream-10", "Streaming Systems & Event-Driven Messaging", "code", "Streaming & Event-Driven", "embed", "https://vibetok-learning-hub.vercel.app/stream", "8 Modules, 48 Topics. Event-time watermarks, Apache Flink Chandy-Lamport state snapshotting, tumbling/sliding windows, Apache Pulsar tiered storage, and Debezium CDC.", { concepts: ["Watermarks & Late Data","Flink Exactly-Once Processing","Stateful Windowing","Pulsar Tiered Architecture","Change Data Capture (CDC)"], jobs: ["Real-Time Streaming Engineer","Event-Driven Architect"] }),
  house("vt-lake-09", "Enterprise Data Lake & Open Table Lakehouses", "professional", "Lakehouse Engineering", "embed", "https://vibetok-learning-hub.vercel.app/lake", "8 Modules, 48 Topics. Apache Iceberg snapshot isolation, Delta Lake transaction log, Parquet column chunk encoding, S3/ADLS multipart commits, and Nessie git-like catalogs.", { concepts: ["Apache Iceberg Table Format","Delta Lake ACID Log","Parquet Columnar Encoding","Cloud Object Storage","Lakehouse Catalog Metastore"], jobs: ["Lakehouse Architect","Data Platform Engineer"] }),
  house("vt-kafka-08", "Apache Kafka & Enterprise Event Streaming", "code", "Event Streaming", "embed", "https://vibetok-learning-hub.vercel.app/kafka", "8 Modules, 48 Topics. KRaft metadata consensus, OS page cache zero-copy sendfile, cooperative sticky rebalancing, Kafka Streams stateful topologies, and Schema Registry.", { concepts: ["KRaft Quorum","Zero-Copy sendfile()","Consumer Group Rebalance","Kafka Streams State Stores","Schema Registry Avro"], jobs: ["Kafka Administrator","Event Streaming Architect","Distributed Infrastructure Engineer"] }),
  house("vt-usql-07", "Universal SQL & Multi-Engine Systems", "code", "SQL Query Engines", "embed", "https://vibetok-learning-hub.vercel.app/usql", "8 Modules, 48 Topics. ANSI SQL:2023, sophisticated window framing, recursive common table expressions, Trino distributed MPP federation, and DuckDB analytical vectorized execution.", { concepts: ["ANSI SQL:2023 Features","Advanced Window Framing","Recursive CTE Trees","Trino Distributed Querying","DuckDB Embedded Analytics"], jobs: ["Senior SQL Developer","Analytics Engineer","BI Architect"] }),
  house("vt-mssql-06", "Microsoft SQL Server & Database Internals", "professional", "Database Administration", "embed", "https://vibetok-learning-hub.vercel.app/mssql", "8 Modules, 48 Topics. Storage Engine page management (PFS/GAM/SGAM), Cardinality Estimation, workspace memory grants, Clustered Columnstore segments, and Always On Availability Groups.", { concepts: ["Engine Storage Allocation","Cardinality Estimator (CE)","Query Execution Memory Grants","Clustered Columnstore Compression","Always On AG Failover"], jobs: ["SQL Server DBA","Database Performance Tuner","Enterprise Data Architect"] }),
  house("vt-spark-05", "Apache Spark & Distributed Lakehouse Engineering", "code", "Big Data & Spark", "embed", "https://vibetok-learning-hub.vercel.app/spark", "8 Modules, 48 Topics. Catalyst query optimizer, Project Tungsten off-heap memory, Adaptive Query Execution (AQE), dynamic partition coalescing, and Structured Streaming stateful micro-batches.", { concepts: ["Catalyst Query Optimization","Tungsten Memory Layout","Adaptive Query Execution (AQE)","Skew Join Dynamic Splitting","Structured Streaming State"], jobs: ["Big Data Engineer","Apache Spark Specialist","Lakehouse Engineer"] }),
  house("vt-dw-04", "Modern Data Warehouse & Dimensional Modeling", "professional", "Data Warehousing", "embed", "https://vibetok-learning-hub.vercel.app/dw", "8 Modules, 48 Topics. Kimball Dimensional Modeling, Fact & Dimension hierarchies, Slowly Changing Dimensions (SCD Type 1/2/3/4/6), Snowflake immutable micro-partitions, and dbt semantic modeling.", { concepts: ["Kimball Dimensional Design","Fact & Dimension Taxonomy","Slowly Changing Dimensions (SCD)","Snowflake Micro-Partition Pruning","dbt Semantic Transformations"], jobs: ["Data Warehouse Architect","Analytics Engineer","Enterprise BI Architect"] }),
  house("vt-agent-03", "Agentic Systems & Retrieval-Augmented Generation (RAG)", "code", "Agentic AI", "embed", "https://vibetok-learning-hub.vercel.app/agent", "8 Modules, 48 Topics. ReAct reasoning loops, Dense vector embeddings, Hybrid sparse/dense retrieval (BM25 + Dense), ColBERT late-interaction token scoring, LangGraph cyclic state graphs, and structured tool calling.", { concepts: ["ReAct Agentic Loops","Hybrid BM25 + Vector Retrieval","ColBERT Late Interaction","LangGraph Cyclic State","Structured Function Calling"], jobs: ["AI Agent Engineer","RAG Systems Specialist","Applied AI Developer"] }),
  house("vt-genai-02", "Generative AI & Enterprise LLM Applications", "code", "Generative AI", "embed", "https://vibetok-learning-hub.vercel.app/genai", "8 Modules, 48 Topics. Multi-Head Scaled Dot-Product Attention, LoRA/QLoRA parameter-efficient fine-tuning, context window management, structured JSON decoding guardrails, and AWQ/GPTQ weight quantization.", { concepts: ["Transformer Attention Mathematics","LoRA / QLoRA Fine-Tuning","Context Window Engineering","Structured Output Guardrails","Weight Quantization (AWQ/GPTQ)"], jobs: ["Generative AI Engineer","LLM Application Developer","AI Product Architect"] }),
  house("vt-azure-01", "Enterprise Cloud Architecture & Azure Spatial Infrastructure", "professional", "Cloud Infrastructure", "embed", "https://vibetok-learning-hub.vercel.app/azure", "25 Modules, 116 Topics. Microsoft Cloud Adoption Framework (CAF), Enterprise Landing Zones, Hub-and-Spoke VNet architectures, Azure Private Link, Entra ID Conditional Access, and Bicep Infrastructure as Code.", { concepts: ["Cloud Adoption Framework (CAF)","Hub-and-Spoke VNet Topology","Azure Private Endpoints","Entra ID Governance","Bicep Infrastructure as Code"], jobs: ["Cloud Solutions Architect","Enterprise Infrastructure Engineer","Azure Administrator"] }),
];

export const PRESENTED_BY = SOURCE;

export function desksFor(world: WorldId) {
  return DESKS.filter((d) => d.world === world);
}

export function housesFor(desk: DeskId, shelf?: string | "all") {
  const list = NETWORK.filter((h) => h.desk === desk);
  if (!shelf || shelf === "all") return list;
  return list.filter((h) => h.shelf === shelf);
}

export function shelvesFor(desk: DeskId) {
  return [...new Set(NETWORK.filter((h) => h.desk === desk).map((h) => h.shelf))];
}

export function groupedHouses(desk: DeskId, shelf: string | "all") {
  const list = housesFor(desk, shelf);
  return shelvesFor(desk)
    .map((s) => ({ shelf: s, houses: list.filter((h) => h.shelf === s) }))
    .filter((g) => g.houses.length);
}

export function deskCount(desk: DeskId) {
  return NETWORK.filter((h) => h.desk === desk).length;
}

export function worldCount(world: WorldId) {
  return NETWORK.filter((h) => h.world === world).length;
}

export function askLecture(house: NetworkHouse, ask: string) {
  const bits = house.concepts.join(" · ");
  if (ask === "explain") return `${house.name}: ${house.blurb} Concepts: ${bits}.`;
  if (ask === "beginner") return `Beginner read of ${house.name}: start with “${house.concepts[0]}”, then the house itself. We do not copy their files.`;
  if (ask === "jobs") return house.jobs?.length ? `Roles that use this desk: ${house.jobs.join(", ")}.` : `This desk feeds research, teaching, and practice in ${house.shelf.toLowerCase()}.`;
  if (ask === "papers") return house.papers?.length ? house.papers.map((p) => p.title).join(" · ") : `Open ${house.name} for the primary literature. We link. We do not scrape.`;
  return `Drill ${house.name}. Hold the concepts: ${bits}. Then pass the echo on Study if this house has a film.`;
}

export type ChainStep = { step: string; label: string; href?: string };

export function researchChain(house: NetworkHouse): ChainStep[] | null {
  if (house.desk !== "research" && house.desk !== "labs" && !house.papers?.length) return null;
  const paper = house.papers?.[0];
  return [
    { step: "Paper", label: paper?.title ?? `${house.name} literature`, href: paper?.href ?? house.href },
    { step: "Author", label: house.name, href: house.href },
    { step: "Video", label: house.youtubeId ? "Watch the film" : "Open at source", href: house.href },
    { step: "Lecture", label: "Talks and seminars", href: house.href },
    { step: "Dataset", label: "Data at the house", href: house.href },
    { step: "Discussion", label: "Ask this house" },
    { step: "Courses", label: house.jobs?.length ? house.jobs.join(" · ") : "Related courses", href: house.href },
  ];
}

export function learningPath(house: NetworkHouse): ChainStep[] | null {
  const research = researchChain(house);
  if (research) return research;
  if (house.desk === "cyber" || house.desk === "careers") {
    const ato = house.shelf === "Federal" || house.id === "rmf" || house.id === "80037" || house.id === "ato";
    const ir = house.shelf === "Incident response" || house.id === "ir" || house.id === "ir-tabletop";
    return [
      { step: "Course", label: house.name, href: house.href },
      {
        step: "Lab",
        label: ato
          ? "Build an ATO package (hypothetical system)"
          : ir
            ? "Ransomware just hit — walk the eight moves"
            : "Practice at the house",
        href: house.href,
      },
      { step: "Quiz", label: "Ask this house" },
      { step: "Cert", label: "Credential path", href: house.href },
      { step: "Job", label: house.jobs?.length ? house.jobs.join(" · ") : "Roles on this desk" },
    ];
  }
  return null;
}
