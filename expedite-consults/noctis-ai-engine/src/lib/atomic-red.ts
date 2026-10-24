export const ATOMIC_HREF = "https://www.atomicredteam.io/";
export const ATOMIC_GIT = "https://github.com/redcanaryco/atomic-red-team";
export const ATOMIC_INVOKE = "https://github.com/redcanaryco/invoke-atomicredteam";
export const ATOMIC_CALDERA = "https://github.com/mitre/atomic";
export const ATOMIC_WIKI = "https://github.com/redcanaryco/invoke-atomicredteam/wiki";

export const ATOMIC_LAW = [
  "An atomic is a small, ATT&CK-tagged test. Read the YAML before you run it.",
  "Range VM only. EDR must be checking in. Cleanup is part of the lab, not optional.",
  "Never Invoke-AtomicTest All. Never skip -Cleanup. Never run Impact/ransomware atomics.",
] as const;

export const ATOMIC_PATHS = [
  {
    id: "yaml",
    title: "The atomics library",
    line: "One folder per technique (Txxxx). YAML = executor, input args, prereqs, cleanup. Markdown is the human copy.",
    href: ATOMIC_GIT,
  },
  {
    id: "invoke",
    title: "Path A — Invoke-AtomicRedTeam",
    line: "PowerShell runner on the range VM. ShowDetails → GetPrereqs → Invoke-AtomicTest Txxxx -TestNumbers n → Cleanup.",
    href: ATOMIC_INVOKE,
  },
  {
    id: "caldera",
    title: "Path B — CALDERA Atomic plugin",
    line: "The same YAML imported as Caldera abilities. You pick them in an adversary profile. Agents still only on ROE VMs.",
    href: ATOMIC_CALDERA,
  },
] as const;

export const ATOMIC_FLOW = [
  { n: "1", title: "Pick the ID", line: "From ATT&CK / your threat diagram. Open atomics/Txxxx/Txxxx.yaml. Read elevation and cleanup." },
  { n: "2", title: "Show, don't run", line: "Invoke-AtomicTest Txxxx -ShowDetails. If you cannot explain the command, you do not run it." },
  { n: "3", title: "Prereqs on the range", line: "GetPrereqs on the lab VM only. Install-AtomicRedTeam -noPayloads when you are studying." },
  { n: "4", title: "One test number", line: "Invoke-AtomicTest Txxxx -TestNumbers n. Not All. Watch EDR/SIEM in the other window." },
  { n: "5", title: "Cleanup + detect", line: "Cleanup always. Write: log source, hit or miss, which atomic GUID." },
] as const;

export const ATOMIC_CLINIC = [
  {
    tech: "T1059.001",
    title: "PowerShell",
    student: "Which test number, what it echoes, which log (4104 / EDR).",
    study: "clinic jump box. Encoded command atomic. SOC: did 4104 fire?",
  },
  {
    tech: "T1082",
    title: "System Information Discovery",
    student: "Low impact. Good first atomic. Who saw hostname/whoami?",
    study: "Range-01. Discovery only. Compass coverage after Caldera import.",
  },
  {
    tech: "T1552.001",
    title: "Credentials in Files",
    student: "Search path on the lab disk only. No prod shares.",
    study: "clinic-range home dir. Finding is the file, not a dump of secrets off-box.",
  },
] as const;