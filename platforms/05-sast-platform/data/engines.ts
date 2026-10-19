export const ENGINES = [
  {
    name: "XTRIKE AST-Query",
    vendor: "XTRIKE Core",
    description: "Semantic AST code analysis — traces data flows across the entire codebase",
    color: "#8b4528",
    icon: "🔍",
    strengths: ["Taint analysis", "XQL Query Language", "Inter-procedural analysis"],
  },
  {
    name: "XTRIKE PatternGuard",
    vendor: "XTRIKE Core",
    description: "Single-pass token-indexed engine with 400+ enterprise security plugins",
    color: "#8b4528",
    icon: "🛡",
    strengths: ["Fast O(1) scanning", "Custom AST rules", "10-language polyglot"],
  },
  {
    name: "XTRIKE GraphCPG",
    vendor: "XTRIKE Graph Lab",
    description: "Code Property Graph (CPG) analysis for deep vulnerability detection",
    color: "#8b4528",
    icon: "⚡",
    strengths: ["CPG analysis", "Call graph", "Vulnerability patterns"],
  },
  {
    name: "XTRIKE TaintFlow",
    vendor: "XTRIKE Core",
    description: "Custom taint-tracking engine for source-to-sink path verification",
    color: "#46a36e",
    icon: "🔀",
    strengths: ["Source tracking", "Sink validation", "Sanitizer dominance"],
  },
];

export const LANGUAGES = [
  "Java", "Python", "Node.js", "TypeScript",
  "Go", "C#", "PHP", "Ruby", "Kotlin", "Swift",
];

export const SAMPLE_REPOS = [
  {
    name: "XTRIKE-Java-Core",
    url: "https://github.com/WebGoat/WebGoat",
    description: "Enterprise Java banking & API reference target",
    language: "Java",
    expectedFindings: 27,
  },
  {
    name: "XTRIKE-PHP-Portal",
    url: "https://github.com/digininja/DVWA",
    description: "Legacy PHP web portal reference target",
    language: "PHP",
    expectedFindings: 22,
  },
  {
    name: "XTRIKE-Node-Commerce",
    url: "https://github.com/juice-shop/juice-shop",
    description: "Modern Node.js & TypeScript microservice target",
    language: "Node.js",
    expectedFindings: 19,
  },
];
