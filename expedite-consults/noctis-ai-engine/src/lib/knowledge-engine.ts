import type { StudyCard } from "@/lib/knowledge-types";

export type KnowledgeCategoryId =
  | "bible"
  | "science"
  | "engineering"
  | "cybersecurity"
  | "mathematics"
  | "health"
  | "history"
  | "geography"
  | "technology"
  | "finance"
  | "agriculture"
  | "environment"
  | "civics"
  | "career"
  | "general";

type Record = {
  id: string;
  category: KnowledgeCategoryId;
  title: string;
  keys: string[];
  fact: string;
  steps: string[];
  source: string;
  href: string;
  passage: string;
};

export const KNOWLEDGE_CATEGORIES: {
  id: KnowledgeCategoryId;
  label: string;
  line: string;
  caution: string;
  starters: { label: string; q: string }[];
}[] = [
  { id: "bible", label: "Bible", line: "The King James text on this desk is the verse record. These cards only point at it.", caution: "", starters: [{ label: "What this shelf holds", q: "What does the Bible shelf hold?" }] },
  { id: "science", label: "Science", line: "Curated science definitions. The linked page is the check.", caution: "", starters: [{ label: "Photosynthesis", q: "What is photosynthesis?" }, { label: "Scientific method", q: "What is the scientific method?" }] },
  { id: "engineering", label: "Engineering", line: "Definitions for study. Not a design approval.", caution: "This is a study definition, not a design approval.", starters: [{ label: "Ohm's law", q: "What is Ohm's law?" }, { label: "SI units", q: "What are SI units?" }] },
  { id: "cybersecurity", label: "Cybersecurity", line: "Definitions and where to look. Exploit code is not stored.", caution: "", starters: [{ label: "CIA triad", q: "What is the CIA triad?" }, { label: "Phishing", q: "What is phishing?" }] },
  { id: "mathematics", label: "Mathematics", line: "Definitions and formulas. A numeric result still comes from the calculator.", caution: "", starters: [{ label: "Pythagorean theorem", q: "What is the Pythagorean theorem?" }, { label: "Order of operations", q: "What is the order of operations?" }] },
  { id: "health", label: "Medicine and health education", line: "Health education only. Not a diagnosis or a treatment.", caution: "Health education only. This is not a diagnosis or a treatment. A clinician decides care.", starters: [{ label: "Handwashing", q: "Why does handwashing matter?" }, { label: "Not a diagnosis", q: "Can this desk diagnose an illness?" }] },
  { id: "history", label: "History", line: "A few dated events with a page to check.", caution: "", starters: [{ label: "Apollo 11", q: "When did Apollo 11 land on the Moon?" }, { label: "Magna Carta", q: "What is the Magna Carta?" }] },
  { id: "geography", label: "Geography", line: "Earth facts with a page to check.", caution: "", starters: [{ label: "Equator", q: "What is the equator?" }, { label: "Continents", q: "How many continents are there?" }] },
  { id: "technology", label: "Technology", line: "How common computing ideas are defined.", caution: "", starters: [{ label: "CPU", q: "What is a CPU?" }, { label: "Internet", q: "What is the internet?" }] },
  { id: "finance", label: "Finance education", line: "Ideas for study. Not investment advice.", caution: "Finance education only. This is not investment, tax, or credit advice.", starters: [{ label: "Compound interest", q: "What is compound interest?" }, { label: "Budget", q: "What is a budget?" }] },
  { id: "agriculture", label: "Agriculture", line: "Farming ideas for study, not a local crop prescription.", caution: "Agriculture education. Local soil and rules still decide what to plant.", starters: [{ label: "Crop rotation", q: "What is crop rotation?" }, { label: "Soil", q: "Why does soil matter in farming?" }] },
  { id: "environment", label: "Environment", line: "Earth-system ideas with a page to check.", caution: "", starters: [{ label: "Greenhouse effect", q: "What is the greenhouse effect?" }, { label: "Water cycle", q: "What is the water cycle?" }] },
  { id: "civics", label: "Law and civics education", line: "How a government is described. Not legal advice.", caution: "Civics education only. This is not legal advice.", starters: [{ label: "Branches", q: "What are the three branches of the US government?" }, { label: "Not legal advice", q: "Can this desk give legal advice?" }] },
  { id: "career", label: "Career education", line: "How to show work you have done. Not a job offer.", caution: "Career education. A posting or an employer decides a job, not this card.", starters: [{ label: "Resume", q: "What belongs on a resume?" }, { label: "Proof of work", q: "What is proof of work on a career record?" }] },
  { id: "general", label: "General knowledge", line: "The shelf used when a question names no other category.", caution: "", starters: [{ label: "What the shelves are", q: "What knowledge categories does Vibe keep?" }] },
];

const RECORDS: Record[] = [
  { id: "bible-shelf", category: "bible", title: "Bible shelf", keys: ["bible shelf", "what does the bible shelf"], fact: "The Bible shelf stores the King James text. A verse answer quotes that text. A sermon is marked as a note, not as scripture.", steps: ["Ask for a book, chapter, and verse.", "The quote comes from the stored King James file.", "A sermon or a paper is not a verse."], source: "Bible Gateway, KJV", href: "https://www.biblegateway.com/versions/King-James-Version-KJV-Bible/", passage: "The King James Version is the text this desk quotes." },
  { id: "photo", category: "science", title: "Photosynthesis", keys: ["photosynthesis"], fact: "Photosynthesis is the process plants and some other organisms use to turn light, water, and carbon dioxide into sugars, releasing oxygen.", steps: ["Light is the energy input.", "Carbon dioxide and water are the materials.", "Sugar is stored energy. Oxygen is released."], source: "Wikipedia, Photosynthesis", href: "https://en.wikipedia.org/wiki/Photosynthesis", passage: "Photosynthesis uses light energy to build sugars from carbon dioxide and water." },
  { id: "method", category: "science", title: "Scientific method", keys: ["scientific method"], fact: "The scientific method is a way of testing an idea: observe, ask, form a hypothesis, test, and compare the result with the hypothesis.", steps: ["State the question.", "Say what would count as a failed test.", "Keep the result even when it disagrees with the guess."], source: "Wikipedia, Scientific method", href: "https://en.wikipedia.org/wiki/Scientific_method", passage: "A hypothesis is kept only while tests agree with it." },
  { id: "newton", category: "science", title: "Newton's laws", keys: ["newton's laws", "newtons laws", "newton’s laws"], fact: "Newton's first law: a body keeps its motion unless a net force changes it. The second: force equals mass times acceleration. The third: forces come in pairs.", steps: ["No net force means no change in motion.", "F = ma relates force, mass, and acceleration.", "A push on one body is matched by a push the other way."], source: "Wikipedia, Newton's laws of motion", href: "https://en.wikipedia.org/wiki/Newton%27s_laws_of_motion", passage: "The three laws describe force and motion." },
  { id: "dna", category: "science", title: "DNA", keys: ["what is dna", "deoxyribonucleic"], fact: "DNA stores biological information in a sequence of bases. Cells use that sequence when they build proteins.", steps: ["The sequence is the stored information.", "A gene is a stretch of that sequence with a job.", "This card does not identify a person or a condition."], source: "Wikipedia, DNA", href: "https://en.wikipedia.org/wiki/DNA", passage: "DNA is the molecule that carries genetic information." },
  { id: "si", category: "engineering", title: "SI units", keys: ["si units", "international system of units"], fact: "SI is the international system of units. Length is the metre, mass is the kilogram, time is the second, and electric current is the ampere.", steps: ["Write the unit beside every number.", "Do not mix a metre with a foot in one formula.", "A study answer is not a built design."], source: "NIST, SI units", href: "https://www.nist.gov/pml/owm/metric-si/si-units", passage: "The metre, kilogram, second, and ampere are SI base units." },
  { id: "ohm", category: "engineering", title: "Ohm's law", keys: ["ohm's law", "ohms law", "ohm’s law"], fact: "Ohm's law says voltage equals current times resistance: V = IR. It describes a resistive circuit, not every electrical device.", steps: ["V is voltage, I is current, R is resistance.", "Keep the units: volts, amperes, ohms.", "A real circuit can leave this simple case."], source: "Wikipedia, Ohm's law", href: "https://en.wikipedia.org/wiki/Ohm%27s_law", passage: "V = IR for a resistive relationship." },
  { id: "fos", category: "engineering", title: "Factor of safety", keys: ["factor of safety", "safety factor"], fact: "A factor of safety is how much stronger a design is than the load it must carry. The number is chosen. It is not a guarantee.", steps: ["Capacity divided by the expected load is the simple form.", "A higher factor covers uncertainty.", "This card does not approve a structure."], source: "Wikipedia, Factor of safety", href: "https://en.wikipedia.org/wiki/Factor_of_safety", passage: "Factor of safety compares strength with the applied load." },
  { id: "cia", category: "cybersecurity", title: "CIA triad", keys: ["cia triad", "confidentiality integrity availability"], fact: "The CIA triad names three security goals: confidentiality, integrity, and availability. Confidentiality limits who can read. Integrity limits who can change. Availability keeps the service up.", steps: ["Say which goal failed.", "A leak is confidentiality.", "A changed record is integrity. An outage is availability."], source: "NIST glossary, confidentiality", href: "https://csrc.nist.gov/glossary/term/confidentiality", passage: "Confidentiality means information is not disclosed to unauthorized parties." },
  { id: "phish", category: "cybersecurity", title: "Phishing", keys: ["phishing"], fact: "Phishing is a message that pretends to be trusted so a person will reveal a secret or open a harmful link.", steps: ["Check the sender and the real domain.", "Do not give a password because a message asked.", "Report it. Do not forward the link."], source: "CISA, Recognize and report phishing", href: "https://www.cisa.gov/secure-our-world/recognize-and-report-phishing", passage: "Phishing tries to trick a person into giving access." },
  { id: "least", category: "cybersecurity", title: "Least privilege", keys: ["least privilege"], fact: "Least privilege means an account or a program gets only the access its job needs, and no more.", steps: ["Name the job.", "Grant only that access.", "Remove access when the job ends."], source: "NIST glossary, least privilege", href: "https://csrc.nist.gov/glossary/term/least_privilege", passage: "Least privilege restricts access to what is required for the job." },
  { id: "pythag", category: "mathematics", title: "Pythagorean theorem", keys: ["pythagorean", "pythagoras"], fact: "In a right triangle, the square of the hypotenuse equals the sum of the squares of the other two sides: a² + b² = c².", steps: ["Use it only for a right angle.", "c is the side opposite the right angle.", "Ask Calculate when you want the number computed."], source: "Wikipedia, Pythagorean theorem", href: "https://en.wikipedia.org/wiki/Pythagorean_theorem", passage: "a² + b² = c² in a right triangle." },
  { id: "pemdas", category: "mathematics", title: "Order of operations", keys: ["order of operations", "pemdas"], fact: "Order of operations evaluates parentheses, then exponents, then multiplication and division from left to right, then addition and subtraction from left to right.", steps: ["Parentheses first.", "Multiplication does not outrank division. They share a step.", "The calculator follows this order."], source: "Wikipedia, Order of operations", href: "https://en.wikipedia.org/wiki/Order_of_operations", passage: "Grouping, exponents, then multiplication and division, then addition and subtraction." },
  { id: "quad", category: "mathematics", title: "Quadratic formula", keys: ["quadratic formula"], fact: "For ax² + bx + c = 0, with a not zero, x = (-b ± sqrt(b² − 4ac)) / (2a). The part under the square root is the discriminant.", steps: ["Identify a, b, and c.", "If the discriminant is negative, there is no real root.", "Ask Calculate to evaluate a written expression."], source: "Wikipedia, Quadratic formula", href: "https://en.wikipedia.org/wiki/Quadratic_formula", passage: "The quadratic formula solves ax² + bx + c = 0." },
  { id: "hands", category: "health", title: "Handwashing", keys: ["handwashing", "wash your hands", "washing hands"], fact: "Washing hands with soap and water removes germs that cause illness. It is a public-health practice, not a treatment for a person who is already sick.", steps: ["Wet, soap, scrub, rinse, dry.", "This does not diagnose a symptom.", "A sick person needs a clinician, not this card."], source: "CDC, Handwashing", href: "https://www.cdc.gov/handwashing/", passage: "Handwashing is a way to avoid getting sick and spreading germs." },
  { id: "diagnose", category: "health", title: "Not a diagnosis", keys: ["diagnose", "diagnosis", "am i sick", "what illness"], fact: "This desk does not diagnose an illness, name a drug, or replace a clinician. It can teach a public-health idea and point at a health authority.", steps: ["Do not enter symptoms for a diagnosis.", "Use a licensed clinician for a person.", "Emergency symptoms need emergency care, not a card."], source: "World Health Organization", href: "https://www.who.int/", passage: "Personal care is decided by a clinician, not by a study card." },
  { id: "vaccine", category: "health", title: "Vaccines, as education", keys: ["what is a vaccine", "what are vaccines"], fact: "A vaccine trains the immune system to recognize a germ. Schedules and medical decisions belong to health authorities and clinicians, not to this card.", steps: ["This is a definition.", "It does not say what a person should receive.", "Check a health authority for a schedule."], source: "WHO, Vaccines and immunization", href: "https://www.who.int/health-topics/vaccines-and-immunization", passage: "Vaccines protect people from specific diseases." },
  { id: "apollo", category: "history", title: "Apollo 11", keys: ["apollo 11"], fact: "Apollo 11 landed people on the Moon on July 20, 1969. Neil Armstrong and Buzz Aldrin walked on the surface. Michael Collins stayed in orbit.", steps: ["The date is July 20, 1969.", "Two astronauts walked. One remained in orbit.", "Check the NASA or archive page before adding a detail."], source: "Wikipedia, Apollo 11", href: "https://en.wikipedia.org/wiki/Apollo_11", passage: "Apollo 11 was the first crewed landing on the Moon." },
  { id: "magna", category: "history", title: "Magna Carta", keys: ["magna carta"], fact: "Magna Carta is a charter agreed in England in 1215. It limited the king's freedom to act without the law. Later readers treated it as a root of the idea that a ruler is under the law.", steps: ["The year is 1215.", "It was a political charter, not a modern constitution.", "Do not add a clause that is not on the source page."], source: "Wikipedia, Magna Carta", href: "https://en.wikipedia.org/wiki/Magna_Carta", passage: "Magna Carta was agreed by King John of England in 1215." },
  { id: "equator", category: "geography", title: "Equator", keys: ["equator"], fact: "The equator is the circle around the Earth halfway between the North Pole and the South Pole. Latitude there is 0 degrees.", steps: ["It divides the globe into northern and southern hemispheres.", "Latitude is 0°.", "Climate near it is not one single weather report."], source: "Wikipedia, Equator", href: "https://en.wikipedia.org/wiki/Equator", passage: "The equator is the line of 0 degrees latitude." },
  { id: "continents", category: "geography", title: "Continents", keys: ["how many continents", "seven continents"], fact: "A common geographic model counts seven continents: Africa, Antarctica, Asia, Europe, North America, Australia, and South America. Other models group Europe with Asia, or the Americas together.", steps: ["Say which model you are using.", "The seven-continent model is the one taught in many schools.", "A border on a map is a convention, not a fact of the rock."], source: "Wikipedia, Continent", href: "https://en.wikipedia.org/wiki/Continent", passage: "Continent counts differ by the model in use." },
  { id: "cpu", category: "technology", title: "CPU", keys: ["what is a cpu", "central processing unit"], fact: "A CPU, the central processing unit, carries out the instructions of a program. It is one part of a computer, not the memory and not the storage.", steps: ["Instructions are fetched and executed.", "Memory holds data the CPU is using.", "Storage keeps data when the power is off."], source: "Wikipedia, Central processing unit", href: "https://en.wikipedia.org/wiki/Central_processing_unit", passage: "The CPU executes program instructions." },
  { id: "internet", category: "technology", title: "Internet", keys: ["what is the internet", "what is internet"], fact: "The internet is a network of networks that moves data using shared protocols. The web is one service on it, not the whole network.", steps: ["A protocol is a shared rule for sending data.", "The web uses those connections for pages.", "A website being down is not the internet being gone."], source: "Wikipedia, Internet", href: "https://en.wikipedia.org/wiki/Internet", passage: "The internet connects networks so they can exchange data." },
  { id: "compound", category: "finance", title: "Compound interest", keys: ["compound interest"], fact: "Compound interest is interest added to the principal, so later interest is calculated on a larger amount. This definition is not a recommendation to borrow or to invest.", steps: ["Principal is the starting amount.", "The rate and the time change the result.", "A product, a tax, and a fee are not in this card."], source: "Investor.gov glossary", href: "https://www.investor.gov/introduction-investing/investing-basics/glossary", passage: "Compound interest builds on earlier interest as well as principal." },
  { id: "budget", category: "finance", title: "Budget", keys: ["what is a budget", "what is budgeting"], fact: "A budget is a plan that lists money coming in and money going out. It is a record of choices. It is not a credit decision or a tax filing.", steps: ["Write income.", "Write the costs.", "The difference is what the plan has left, before surprises."], source: "Investor.gov", href: "https://www.investor.gov/introduction-investing/investing-basics", passage: "A budget compares income with spending." },
  { id: "rotation", category: "agriculture", title: "Crop rotation", keys: ["crop rotation"], fact: "Crop rotation means growing different crops in the same field in sequence, so the soil is not asked for the same thing every season.", steps: ["The sequence is the practice.", "It is not a planting order for one farm.", "Local soil, water, and rules decide the crop."], source: "Wikipedia, Crop rotation", href: "https://en.wikipedia.org/wiki/Crop_rotation", passage: "Rotation changes the crop grown on a field over time." },
  { id: "soil", category: "agriculture", title: "Soil", keys: ["why does soil", "soil matter"], fact: "Soil holds water, air, and nutrients that a crop uses. Poor structure or missing nutrients shows up as a weak crop. A lab or an extension service tests a field. This card does not.", steps: ["Soil is not just dirt.", "A test beats a guess.", "This desk does not prescribe a fertilizer rate."], source: "USDA", href: "https://www.usda.gov/", passage: "Soil condition is part of whether a crop can grow." },
  { id: "greenhouse", category: "environment", title: "Greenhouse effect", keys: ["greenhouse effect"], fact: "The greenhouse effect is the warming of a planet's surface because some gases in the air hold heat that would otherwise leave. On Earth those gases include carbon dioxide and water vapor.", steps: ["The effect is a physical process.", "A weather report for one day is not this definition.", "Check NASA's climate page before adding a number."], source: "NASA, What is the greenhouse effect?", href: "https://climate.nasa.gov/faq/19/what-is-the-greenhouse-effect/", passage: "Greenhouse gases slow the loss of heat from the surface." },
  { id: "water", category: "environment", title: "Water cycle", keys: ["water cycle", "hydrologic cycle"], fact: "The water cycle moves water by evaporation, condensation, precipitation, and collection. The same water is reused. It is not created in the cycle.", steps: ["Evaporation lifts water into the air.", "Condensation builds clouds.", "Precipitation returns water to the surface."], source: "Wikipedia, Water cycle", href: "https://en.wikipedia.org/wiki/Water_cycle", passage: "The water cycle circulates water between surface and atmosphere." },
  { id: "branches", category: "civics", title: "Three branches", keys: ["three branches", "branches of the us government", "branches of government"], fact: "The United States government is described as three branches: legislative, which makes statutes; executive, which carries them out; and judicial, which decides cases. This is civics education, not advice on a person's case.", steps: ["Congress is the legislative branch.", "The presidency is the executive branch.", "The courts are the judicial branch."], source: "USA.gov, Branches of government", href: "https://www.usa.gov/branches-of-government", passage: "Legislative, executive, and judicial powers are separated." },
  { id: "legal", category: "civics", title: "Not legal advice", keys: ["legal advice", "is this legal", "can i sue"], fact: "This desk does not give legal advice, read a contract for a person, or say how a case will end. It can explain a public civic idea and point at an official page.", steps: ["Do not paste a private case for a ruling.", "A lawyer or a legal-aid office advises a person.", "A statute page is the text. This card is not."], source: "USA.gov", href: "https://www.usa.gov/", passage: "Official government pages are the place to start. A person still needs a lawyer for a case." },
  { id: "resume", category: "career", title: "Resume", keys: ["what belongs on a resume", "what is a resume"], fact: "A resume is a short record of work, education, and skills a person can show. Each line should be something they can explain. It is not a promise that an employer will hire them.", steps: ["Name the role, the place, and the dates.", "State the work that was done.", "Leave off a claim that cannot be shown."], source: "CareerOneStop", href: "https://www.careeronestop.org/", passage: "A resume is the person's own record of work and study." },
  { id: "proof", category: "career", title: "Proof of work", keys: ["proof of work on a career", "career record"], fact: "Proof of work on a career record is evidence that the person did the job: a date, a role, a result, or a person who shared the work. A title alone is not the proof.", steps: ["Write what was done.", "Keep a date and a result.", "A shared job can be confirmed by someone who was there."], source: "CareerOneStop", href: "https://www.careeronestop.org/", passage: "A career claim is stronger when the work can be shown." },
  { id: "shelves", category: "general", title: "Knowledge shelves", keys: ["knowledge categories", "what knowledge categories"], fact: "Vibe keeps separate shelves: Bible, Science, Engineering, Cybersecurity, Mathematics, Health education, History, Geography, Technology, Finance education, Agriculture, Environment, Civics, Career education, and General knowledge.", steps: ["Name the shelf or the topic.", "A curated card is returned when the topic is on that shelf.", "A topic with no card is not guessed from this engine."], source: "Vibe knowledge shelves", href: "https://www.nist.gov/", passage: "Each shelf is its own list. A miss on one shelf does not borrow a fact from another." },
];

function asksForShelf(question: string, label: string, id: string) {
  const rest = question
    .toLowerCase()
    .replace(label.toLowerCase(), " ")
    .replace(id, " ")
    .replace(/[^a-z]+/g, " ")
    .trim();
  const skip = new Set(["what", "is", "the", "does", "do", "you", "have", "on", "about", "shelf", "shelves", "categories", "category", "in", "a", "of", "vibe", "keep", "holds", "hold"]);
  return rest.split(" ").filter((word) => word && !skip.has(word)).length === 0;
}

function score(question: string, row: Record) {
  const hay = question.toLowerCase();
  return row.keys.reduce((sum, key) => (hay.includes(key) ? sum + 2 : sum), 0);
}

export function curatedCard(question: string): StudyCard | null {
  const q = question.trim();
  if (q.length < 8) return null;
  const ranked = RECORDS.map((row) => ({ row, score: score(q, row) }))
    .filter((item) => item.score >= 2)
    .sort((a, b) => b.score - a.score);
  const best = ranked[0]?.row;
  if (best) {
    const shelf = KNOWLEDGE_CATEGORIES.find((row) => row.id === best.category)!;
    return {
      question: q,
      sentence: best.fact,
      domain: best.category,
      confidence: "supported",
      steps: best.steps,
      evidence: [{ source: best.source, type: shelf.label, relevance: "Curated card", href: best.href, passage: best.passage }],
      next: RECORDS.filter((row) => row.category === best.category && row.id !== best.id).map((row) => row.title).slice(0, 4),
      note: [`Curated ${shelf.label} card.`, shelf.caution, "The link is the page to check. Nothing was added from outside this card."].filter(Boolean).join(" "),
    };
  }
  const shelf = KNOWLEDGE_CATEGORIES.find((row) => {
    const hay = q.toLowerCase();
    return hay.includes(row.label.toLowerCase()) || hay.includes(row.id);
  });
  if (!shelf || !asksForShelf(q, shelf.label, shelf.id)) return null;
  const titles = RECORDS.filter((row) => row.category === shelf.id).map((row) => row.title);
  if (!titles.length) return null;
  return {
    question: q,
    sentence: `${shelf.label} has these curated cards: ${titles.join(", ")}.`,
    domain: shelf.id,
    confidence: "supported",
    steps: titles.map((title) => `Ask: ${title}`),
    evidence: [],
    next: titles,
    note: [shelf.line, shelf.caution, "No single card matched, so the shelf list is the answer. A fact was not guessed."].filter(Boolean).join(" "),
  };
}
