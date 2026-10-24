export type BriefSubject = { name: string; test: RegExp };

export type CrewBriefSpec = {
  title: string;
  house: string;
  subjects: BriefSubject[];
};

export const CREW_BRIEFS: Record<string, CrewBriefSpec> = {
  bench: {
    title: "Science community",
    house: "Science",
    subjects: [
      { name: "Astronomy", test: /astro|planet|star|galaxy|\bnasa\b/i },
      { name: "Biology", test: /biolog|\bcell\b|\bdna\b|gene/i },
      { name: "Climate science", test: /climate|weather|carbon/i },
      { name: "Physics", test: /physics|gravity|quantum/i },
    ],
  },
  cyber: {
    title: "Cyber community",
    house: "Cybersecurity",
    subjects: [
      { name: "Authentication", test: /authenticat|password|credential/i },
      { name: "Malware", test: /malware|ransom|virus/i },
      { name: "Encryption", test: /encrypt|cipher|\btls\b/i },
      { name: "Incident response", test: /incident|containment/i },
    ],
  },
  civiccrew: {
    title: "Civics community",
    house: "Civics",
    subjects: [
      { name: "How laws are made", test: /bill|congress|statute/i },
      { name: "Courts", test: /court|ruling|opinion/i },
      { name: "Elections", test: /election|ballot|vote/i },
      { name: "Public claims", test: /claim|source|misinfo/i },
    ],
  },
  pulpit: {
    title: "Scripture community",
    house: "Bible",
    subjects: [
      { name: "Contextual reading", test: /context|covenant|canon/i },
      { name: "The Gospels", test: /gospel|jesus|sermon/i },
      { name: "The prophets", test: /prophet|isaiah|revelation/i },
    ],
  },
};

export function subjectsIn(text: string, subjects: BriefSubject[]) {
  return subjects.filter((subject) => subject.test.test(text)).map((subject) => subject.name);
}
