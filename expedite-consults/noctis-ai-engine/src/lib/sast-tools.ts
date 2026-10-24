export type SastTool = {
  id: string;
  title: string;
  kind: "open" | "vendor" | "list";
  line: string;
  when: string;
  href: string;
  student: string;
};

/** Official SAST study list. We link. We do not vendor their engines. AXIOM is the lab app. */
export const SAST_TOOLS: SastTool[] = [
  {
    id: "owasp-list",
    title: "OWASP Source Code Analysis Tools",
    kind: "list",
    line: "The catalog. Names, languages, licenses. Start here so you are not married to one vendor.",
    when: "Before you pick a scanner.",
    href: "https://owasp.org/www-community/Source_Code_Analysis_Tools",
    student: "Name three tools and the language each covers.",
  },
  {
    id: "samate",
    title: "NIST SAMATE",
    kind: "list",
    line: "How SAST is measured. Juliet test suite, SARD. A tool that cannot find Juliet bugs is theatre.",
    when: "When someone claims 100% coverage.",
    href: "https://www.nist.gov/itl/ssd/software-quality-group/samate",
    student: "One sentence: what is a true positive on a SARD case.",
  },
  {
    id: "semgrep",
    title: "Semgrep",
    kind: "open",
    line: "Pattern + dataflow rules. Fast. You can read the rule. Good for teaching taint.",
    when: "Python / JS / Go labs. Custom clinic rules.",
    href: "https://semgrep.dev/docs/",
    student: "One rule ID, one hit, why it is taint not a regex.",
  },
  {
    id: "codeql",
    title: "GitHub CodeQL",
    kind: "open",
    line: "Query the code as a database. Strong on Java/JS dataflow. GitHub-hosted for public repos.",
    when: "When the finding needs a path, not a line.",
    href: "https://codeql.github.com/docs/",
    student: "One query pack, one alert, the source → sink path.",
  },
  {
    id: "sonar",
    title: "SonarQube",
    kind: "open",
    line: "Quality + security gates in CI. Noise if you turn every info on. Quality profile is the lesson.",
    when: "PR gate. Teach 'fail the build on blocker, not on info'.",
    href: "https://docs.sonarsource.com/sonarqube-server/latest/analyzing-source-code/",
    student: "Which severity fails the clinic gate, and why.",
  },
  {
    id: "bandit",
    title: "Bandit (Python)",
    kind: "open",
    line: "AST walk for Python. pickle, yaml.load, assert. Pair with Semgrep, don't stop at Bandit.",
    when: "Python services on the range.",
    href: "https://bandit.readthedocs.io/",
    student: "One B-id (e.g. B301 pickle) and the fix.",
  },
  {
    id: "spotbugs",
    title: "SpotBugs / Find Security Bugs",
    kind: "open",
    line: "Java bytecode. Deserialization, SQL, crypto. Maps cleanly to A08 / A05.",
    when: "clinic Java session cookie / ObjectInputStream.",
    href: "https://find-sec-bugs.github.io/",
    student: "One bug type, one class, why SAST saw it and DAST would not.",
  },
  {
    id: "eslint",
    title: "ESLint security plugins",
    kind: "open",
    line: "JS/TS at edit time. Prototype pollution, eval, innerHTML. Not a full SAST.",
    when: "Frontend clinic app.",
    href: "https://eslint.org/docs/latest/",
    student: "One rule that would have caught the merge into Object.prototype.",
  },
  {
    id: "code-review",
    title: "OWASP Code Review Guide",
    kind: "list",
    line: "Humans still beat scanners on business logic (A06). SAST does not replace review.",
    when: "After the scan, before the report.",
    href: "https://owasp.org/www-project-code-review-guide/",
    student: "One issue SAST will miss that a reviewer must catch.",
  },
];

export const SAST_VENDORS = [
  { label: "Checkmarx docs", href: "https://checkmarx.com/resource/documents/" },
  { label: "GitHub Advanced Security", href: "https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning" },
  { label: "Snyk Code", href: "https://docs.snyk.io/scan-with-snyk/snyk-code" },
] as const;

export const SAST_LAW = [
  "Range repo only. Never point a scanner at a production org you do not own.",
  "Sort by reachability. Twelve thousand findings is not a report.",
  "One true positive + a fix beats a PDF of noise.",
] as const;