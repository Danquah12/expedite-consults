export const STAGES = [
  { id: "assess", label: "Assess" },
  { id: "teach", label: "Teach" },
  { id: "practice", label: "Practice" },
  { id: "quiz", label: "Quiz" },
  { id: "evaluate", label: "Evaluate" },
  { id: "weakness", label: "Weakness" },
  { id: "remediate", label: "Remediate" },
  { id: "advance", label: "Advance" },
] as const;

export type StageId = (typeof STAGES)[number]["id"];

type Check = { id: string; prompt: string; ok: string; no: string; miss: string; fix: string };

export type LoopLesson = {
  id: string;
  track: string;
  title: string;
  assess: Check;
  teach: string;
  practice: Check;
  quiz: Check[];
};

export const LOOP_LESSONS: LoopLesson[] = [
  {
    id: "cyber-privilege",
    track: "Cyber",
    title: "Least privilege",
    assess: {
      id: "assess",
      prompt: "Least privilege means an account gets…",
      ok: "Only the access the job needs",
      no: "Admin first, lock it down later",
      miss: "The baseline missed least privilege.",
      fix: "Least privilege is only the access the job needs. Extra access is not a head start.",
    },
    teach: "Least privilege means an account or a program gets only the access its job needs, and no more. Confidentiality, integrity, and availability are the three goals. This is the definition, not a lab you have passed.",
    practice: {
      id: "practice",
      prompt: "A contractor left. Their access key still works. What is first?",
      ok: "Disable the key, then see what it was used for",
      no: "Leave it until the next review",
      miss: "The practice step left a live key in place.",
      fix: "A key that still works after the person leaves is access with no job. Disable it first.",
    },
    quiz: [
      {
        id: "q1",
        prompt: "A policy allows every action on every resource. What failed?",
        ok: "Least privilege",
        no: "The name of the server",
        miss: "A wildcard allow was not read as a least-privilege failure.",
        fix: "Action * on Resource * is more access than a job needs. That is a least-privilege failure.",
      },
      {
        id: "q2",
        prompt: "Which goal fails when the service is down?",
        ok: "Availability",
        no: "Confidentiality",
        miss: "Availability was confused with confidentiality.",
        fix: "Availability means the service stays up. A leak is confidentiality. A changed record is integrity.",
      },
    ],
  },
  {
    id: "cyber-cve",
    track: "Cyber",
    title: "What a CVE points at",
    assess: {
      id: "assess",
      prompt: "A CVE is…",
      ok: "An identifier for a known vulnerability",
      no: "Exploit code stored on this desk",
      miss: "A CVE was treated as exploit code.",
      fix: "A CVE is an id. The record is the NVD page. Exploit code is not stored here.",
    },
    teach: "The chain is CVE → vulnerability → affected software → attack technique → mitigation. The CVE names the vulnerability. The record says which software is affected. The technique is how it is used. The mitigation is the patch or the control. This chain is not the NVD page.",
    practice: {
      id: "practice",
      prompt: "Where do you read the official description of a CVE id?",
      ok: "The NVD page for that id",
      no: "A chat answer with no record",
      miss: "The official record was skipped.",
      fix: "Open the NVD page for the id. A summary is not the record.",
    },
    quiz: [
      {
        id: "q1",
        prompt: "What sits between the vulnerability and the mitigation on this chain?",
        ok: "Affected software and the attack technique",
        no: "A person's password",
        miss: "The middle of the chain was skipped.",
        fix: "Vulnerability is in affected software, which an attack technique can use, which a mitigation meets.",
      },
      {
        id: "q2",
        prompt: "Does this desk store exploit code?",
        ok: "No",
        no: "Yes, under the CVE",
        miss: "Exploit code was assumed to be stored.",
        fix: "Exploit code is not stored. The chain stops at the relationship and the public record.",
      },
    ],
  },
  {
    id: "bible-ephesians",
    track: "Bible",
    title: "Ephesians on the chain",
    assess: {
      id: "assess",
      prompt: "This chain's letter is…",
      ok: "Ephesians",
      no: "A verse the chain did not name",
      miss: "The letter on the chain was missed.",
      fix: "The chain is Paul → Ephesians → church → grace → faith → salvation. The letter is Ephesians.",
    },
    teach: "Paul is linked to the letter to the Ephesians. That letter addresses the church. Grace, faith, and salvation are taught together at Ephesians 2:8. This chain points at that verse. It is not the verse, and it is not a sermon.",
    practice: {
      id: "practice",
      prompt: "You want the words, not the chain. What do you open?",
      ok: "Ephesians 2:8 in the King James text",
      no: "The chain note, and treat it as scripture",
      miss: "The chain was treated as the verse.",
      fix: "Open Ephesians 2:8. The chain only points there.",
    },
    quiz: [
      {
        id: "q1",
        prompt: "Grace, faith, and salvation on this chain are named in…",
        ok: "Ephesians 2:8",
        no: "A chapter the chain did not name",
        miss: "The verse the chain points at was missed.",
        fix: "The chain points at Ephesians 2:8 for grace, faith, and salvation.",
      },
      {
        id: "q2",
        prompt: "Is the chain itself scripture?",
        ok: "No. It is a relationship. The verse is the text.",
        no: "Yes. The chain is the verse.",
        miss: "The relationship was treated as scripture.",
        fix: "The King James text is the verse. The chain is only how the ideas are connected.",
      },
    ],
  },
  {
    id: "science-photo",
    track: "Science",
    title: "Photosynthesis",
    assess: {
      id: "assess",
      prompt: "Photosynthesis mainly…",
      ok: "Uses light to build sugars from carbon dioxide and water",
      no: "Burns sugar to make light",
      miss: "The direction of photosynthesis was reversed.",
      fix: "Light, water, and carbon dioxide go in. Sugar is stored. Oxygen is released.",
    },
    teach: "Photosynthesis is how plants and some other organisms turn light, water, and carbon dioxide into sugars, and release oxygen. The curated card is the definition. A page you open is the check.",
    practice: {
      id: "practice",
      prompt: "What is released?",
      ok: "Oxygen",
      no: "Carbon dioxide as the product",
      miss: "Oxygen was not named as the release.",
      fix: "Oxygen is released. Carbon dioxide is an input.",
    },
    quiz: [
      {
        id: "q1",
        prompt: "What is the energy input?",
        ok: "Light",
        no: "The sugar already stored",
        miss: "Light was not named as the input.",
        fix: "Light is the energy. Sugar is what gets built.",
      },
      {
        id: "q2",
        prompt: "Which two materials are inputs besides light?",
        ok: "Water and carbon dioxide",
        no: "Oxygen and sugar",
        miss: "The inputs were swapped with the products.",
        fix: "Water and carbon dioxide are inputs. Sugar and oxygen are the results.",
      },
    ],
  },
  {
    id: "eng-vectors",
    track: "Engineering",
    title: "Vectors",
    assess: {
      id: "assess",
      prompt: "A vector has…",
      ok: "A size and a direction",
      no: "Only a size",
      miss: "A vector was treated as a plain number.",
      fix: "A vector has magnitude and direction. A force with no direction is not a vector.",
    },
    teach: "A vector has a magnitude and a direction. Speed is a size. Velocity is a speed with a direction, so it is a vector. A force also has a size and a direction. Adding forces means adding those directions, not only the numbers.",
    practice: {
      id: "practice",
      prompt: "Two forces pull in opposite directions. What do you need besides their sizes?",
      ok: "Their directions",
      no: "Only the larger number",
      miss: "Direction was left out of the force.",
      fix: "Opposite directions do not add as two plain numbers. The direction decides whether they add or cancel.",
    },
    quiz: [
      {
        id: "q1",
        prompt: "Which one is a vector?",
        ok: "A force of 10 newtons to the left",
        no: "A mass of 10 kilograms",
        miss: "Mass was treated as a vector.",
        fix: "Mass is a size only. A force with a direction is a vector.",
      },
      {
        id: "q2",
        prompt: "Why does this sit before the next forces step?",
        ok: "Forces are vectors. Direction was the missing piece.",
        no: "The numbers were too large.",
        miss: "The gap was not named.",
        fix: "The gap is vectors. Finish this lesson before the next forces step.",
      },
    ],
  },
  {
    id: "engineering-ohm",
    track: "Engineering",
    title: "Ohm's law",
    assess: {
      id: "assess",
      prompt: "Ohm's law says…",
      ok: "Voltage equals current times resistance",
      no: "Voltage equals resistance divided by mass",
      miss: "V = IR was missed.",
      fix: "V = IR. Volts, amperes, and ohms. It describes a resistive circuit, not every device.",
    },
    teach: "Ohm's law: voltage equals current times resistance, V = IR. Keep the units. A real circuit can leave this simple case. This is a study definition, not a design approval.",
    practice: {
      id: "practice",
      prompt: "Which unit is resistance?",
      ok: "Ohms",
      no: "Metres",
      miss: "The resistance unit was missed.",
      fix: "Resistance is in ohms. Current is in amperes. Voltage is in volts.",
    },
    quiz: [
      {
        id: "q1",
        prompt: "In V = IR, I is…",
        ok: "Current",
        no: "The length of the wire in metres",
        miss: "I was not read as current.",
        fix: "I is current. R is resistance. V is voltage.",
      },
      {
        id: "q2",
        prompt: "Does this law approve a built circuit?",
        ok: "No. It is a study definition.",
        no: "Yes. The formula is the approval.",
        miss: "A formula was treated as a design approval.",
        fix: "The formula teaches the relationship. It does not approve a design.",
      },
    ],
  },
];

export const LOOP_TRACKS = ["Cyber", "Bible", "Science", "Engineering"] as const;

const KEY = "vibetok-learner-loop";

export type LoopSave = {
  lessonId: string;
  stage: StageId;
  misses: string[];
  passed: string[];
};

function empty(track: string): LoopSave {
  const first = LOOP_LESSONS.find((lesson) => lesson.track === track) ?? LOOP_LESSONS[0];
  return { lessonId: first.id, stage: "assess", misses: [], passed: [] };
}

export function loadLoop(track: string): LoopSave {
  if (typeof localStorage === "undefined") return empty(track);
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, LoopSave>;
    const saved = all[track];
    if (!saved || !LOOP_LESSONS.some((lesson) => lesson.id === saved.lessonId)) return empty(track);
    return saved;
  } catch {
    return empty(track);
  }
}

export function saveLoop(track: string, row: LoopSave) {
  if (typeof localStorage === "undefined") return;
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, LoopSave>;
    all[track] = row;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* the lesson still moves on this screen */
  }
}

export function lessonById(id: string) {
  return LOOP_LESSONS.find((lesson) => lesson.id === id) ?? LOOP_LESSONS[0];
}

export function nextLesson(current: LoopLesson) {
  const same = LOOP_LESSONS.filter((lesson) => lesson.track === current.track);
  const at = same.findIndex((lesson) => lesson.id === current.id);
  return same[at + 1] ?? null;
}

export function missesFor(lesson: LoopLesson, wrongIds: string[]) {
  const checks = [lesson.assess, lesson.practice, ...lesson.quiz];
  return checks.filter((check) => wrongIds.includes(check.id));
}
