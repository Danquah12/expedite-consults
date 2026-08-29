export const ENGINES = [
  {
    name: "CodeQL",
    vendor: "GitHub",
    description: "Semantic code analysis — traces data flows across the entire codebase",
    color: "#6e40c9",
    icon: "🔍",
    strengths: ["Taint analysis", "Query language", "Inter-procedural analysis"],
  },
  {
    name: "PatternGuard AST",
    vendor: "PatternGuard AST Inc.",
    description: "Pattern-matching engine with 3000+ community security rules",
    color: "#1f8dd6",
    icon: "🛡",
    strengths: ["Fast scanning", "Custom rules", "Multi-language"],
  },
  {
    name: "Joern",
    vendor: "ShiftLeft / Open Source",
    description: "Code Property Graph (CPG) analysis for deep vulnerability detection",
    color: "#00d4ff",
    icon: "⚡",
    strengths: ["CPG analysis", "Call graph", "Vulnerability patterns"],
  },
  {
    name: "DataFlow",
    vendor: "Internal",
    description: "Custom taint-tracking engine for source-to-sink path verification",
    color: "#34d399",
    icon: "🔀",
    strengths: ["Source tracking", "Sink validation", "Sanitizer detection"],
  },
];

export const LANGUAGES = [
  "Java", "Python", "Node.js", "TypeScript",
  "Go", "C#", "PHP", "Ruby", "Kotlin", "Swift",
];

export const SAMPLE_REPOS = [
  {
    name: "WebGoat",
    url: "https://github.com/WebGoat/WebGoat",
    description: "Deliberately insecure Java app",
    language: "Java",
    expectedFindings: 27,
  },
  {
    name: "DVWA",
    url: "https://github.com/digininja/DVWA",
    description: "Damn Vulnerable Web Application",
    language: "PHP",
    expectedFindings: 22,
  },
  {
    name: "Juice Shop",
    url: "https://github.com/juice-shop/juice-shop",
    description: "OWASP's modern insecure app",
    language: "Node.js",
    expectedFindings: 19,
  },
];
