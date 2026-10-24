export const CALDERA_HREF = "https://caldera.readthedocs.io/";
export const CALDERA_GIT = "https://github.com/mitre/caldera";
export const CALDERA_GETTING = "https://caldera.readthedocs.io/en/latest/Getting-started.html";

export const CALDERA_LAW = [
  "CALDERA's C2 and agents run only on range VMs you own. Not the school Wi-Fi, not a friend's laptop.",
  "An operation is an ATT&CK story. If you cannot name the technique IDs, you do not press start.",
  "The product is the detection: which log, which alert, which miss — not a pretty red dashboard.",
] as const;

export const CALDERA_PARTS = [
  { title: "Core", line: "Async C2 server, REST API, web UI. You log in as red or blue." },
  { title: "Agent", line: "Sandcat (auto), Manx (manual). Installed on the target VM in the ROE only." },
  { title: "Ability", line: "One ATT&CK-mapped action. Stockpile and Atomic ship the library." },
  { title: "Adversary", line: "An ordered set of abilities. That is the threat profile." },
  { title: "Operation", line: "Run the adversary against agents. Pause. Read facts. Stop." },
  { title: "Fact / planner", line: "What the agent learned. The planner picks the next ability." },
] as const;

export const CALDERA_PLUGINS = [
  { id: "stockpile", title: "Stockpile", line: "Default TTPs. Start here.", href: "https://github.com/mitre/stockpile" },
  { id: "atomic", title: "Atomic", line: "Red Canary Atomic Red Team tests, mapped into abilities.", href: "https://github.com/redcanaryco/atomic-red-team" },
  { id: "sandcat", title: "Sandcat", line: "Default agent. Go binary. Lab VMs only.", href: "https://github.com/mitre/sandcat" },
  { id: "manx", title: "Manx", line: "Manual terminal for a human red teamer inside Caldera.", href: "https://github.com/mitre/manx" },
  { id: "compass", title: "Compass", line: "ATT&CK coverage visualization after the op.", href: "https://github.com/mitre/compass" },
  { id: "debrief", title: "Debrief", line: "Operation narrative. This is the student write-up seed.", href: "https://github.com/mitre/debrief" },
  { id: "emu", title: "Emu", line: "CTID adversary emulation plans (high-fidelity profiles).", href: "https://github.com/mitre/emu" },
  { id: "response", title: "Response", line: "Blue: automated IR on the same agents.", href: "https://github.com/mitre/response" },
] as const;

export const CALDERA_STUDENT = [
  {
    id: "profile",
    name: "Adversary profile",
    student: "Three abilities. Each has an ATT&CK ID. No Impact/ransomware abilities.",
    study: "T1078 valid accounts → T1552.005 IMDS → T1530 data from cloud storage. Stop.",
  },
  {
    id: "scope",
    name: "Range ROE",
    student: "Which VMs get an agent. C2 bound to the lab net. No 0.0.0.0 on a public NIC.",
    study: "clinic-range-01 and -02. Server on 10.10.0.5. Agents never on the EHR.",
  },
  {
    id: "detect",
    name: "Purple result",
    student: "For each ability: log source, would SOC see it, miss or hit.",
    study: "IMDS hop: no CloudTrail on the instance role. Miss. That is the finding.",
  },
] as const;