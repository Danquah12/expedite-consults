import { BENCHMARK_32_REPOS } from "@/data/benchmark-repos";

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

export const SAMPLE_REPOS = BENCHMARK_32_REPOS.map((repo) => ({
  name: repo.name,
  ownerRepo: repo.ownerRepo,
  url: repo.url,
  category: repo.category,
  description: repo.description,
  language: repo.language,
  defaultBranch: repo.defaultBranch,
  defaultCommitSha: repo.defaultCommitSha,
  expectedFindings: repo.expectedFindings,
  keyCwes: repo.keyCwes,
}));

