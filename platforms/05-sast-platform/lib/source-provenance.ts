/**
 * Source-provenance validation: confirms that a finding's file, line and snippet exist in the scanned
 * repository, and that the snippet's syntax / APIs belong to the file's language.
 * Self-contained (no imports) so it can be unit-tested directly.
 */
export type ProvenanceStatus = "VERIFIED" | "LINE_MISMATCH" | "FILE_NOT_FOUND" | "LANGUAGE_MISMATCH";

export interface ProvenanceResult {
  status: ProvenanceStatus;
  detail: string;
}

export type SyntaxFamily = "java" | "csharp" | "python" | "javascript" | "go" | "php" | "ruby" | "unknown";

export function familyFromPath(path: string): SyntaxFamily {
  const p = path.toLowerCase();
  if (p.endsWith(".cs")) return "csharp";
  if (/\.(java|kt|kts)$/.test(p)) return "java";
  if (p.endsWith(".py")) return "python";
  if (/\.(js|jsx|ts|tsx|mjs|cjs)$/.test(p)) return "javascript";
  if (p.endsWith(".go")) return "go";
  if (p.endsWith(".php")) return "php";
  if (p.endsWith(".rb")) return "ruby";
  return "unknown";
}

/** Strong, language-exclusive tokens. A token that belongs to a different family is a mismatch. */
const EXCLUSIVE: { family: SyntaxFamily; label: string; re: RegExp }[] = [
  { family: "java", label: "Java API", re: /\b(?:ObjectInputStream|ObjectInputFilter|ByteArrayInputStream|DocumentBuilderFactory|SAXParserFactory|PreparedStatement|java\.(?:io|util|sql|security|nio)\.|javax\.|Cipher\.getInstance|ZipEntry|Files\.(?:copy|readAllBytes|write)|Base64\.get(?:Url)?(?:De|En)coder|@GetMapping|@PostMapping|@RequestMapping|@PathVariable|@RequestParam|@RestController|HttpServletRequest|System\.getenv)\b/ },
  { family: "csharp", label: "C# syntax/API", re: /\b(?:using\s+System|namespace\s+[\w.]+\s*[;{]|SqlCommand|SqlConnection|Process\.Start|BinaryFormatter|\[Http(?:Get|Post|Put|Delete)\]|\[FromQuery\]|\[FromBody\]|IActionResult|ControllerBase|Request\.(?:Query|Form)\[|Marshal\.|XmlReader\.Create|File\.(?:ReadAllText|WriteAllText)|var\s+\w+\s*=\s*new\s+\w+)/ },
  { family: "python", label: "Python syntax/API", re: /(?:^|\n)\s*(?:def\s+\w+\s*\(|import\s+\w+\s*$|from\s+\w+\s+import\b)|\bpickle\.loads?\b|\bsubprocess\.\w+\(|\bos\.system\(|request\.args\b|\bself\.\w+\b/m },
  { family: "javascript", label: "JavaScript syntax/API", re: /\b(?:const|let)\s+\w+\s*=|=>\s*[{(]|\brequire\(|\bmodule\.exports\b|\bconsole\.log\(|\bprocess\.env\b|\breq\.(?:query|body|params)\b|\bres\.(?:send|json)\(/ },
];

/** Returns the set of families whose exclusive syntax appears in the text. */
export function detectSyntaxFamilies(text: string): SyntaxFamily[] {
  const found: SyntaxFamily[] = [];
  for (const e of EXCLUSIVE) if (e.re.test(text)) found.push(e.family);
  return found;
}

function norm(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/**
 * Validates one finding against the actual file content.
 * @param fileText full text of the file as scanned (undefined when the file is not in the scanned set)
 */
export function validateSourceProvenance(
  finding: { file: string; line: number; sink?: string; codeSnippet?: string; language?: string },
  fileText: string | undefined
): ProvenanceResult {
  if (fileText === undefined) {
    return { status: "FILE_NOT_FOUND", detail: `${finding.file} is not part of the scanned repository content.` };
  }
  const lines = fileText.split(/\r?\n/);
  if (finding.line < 1 || finding.line > lines.length) {
    return { status: "LINE_MISMATCH", detail: `line ${finding.line} is outside ${finding.file} (${lines.length} lines).` };
  }
  const expected = norm(finding.sink || "").split(" -> ")[0].slice(0, 60);
  if (expected.length >= 6) {
    const lo = Math.max(0, finding.line - 1 - 6);
    const hi = Math.min(lines.length, finding.line + 6);
    const window = norm(lines.slice(lo, hi).join(" "));
    if (!window.includes(expected)) {
      return { status: "LINE_MISMATCH", detail: `recorded sink "${expected}" does not appear within 6 lines of ${finding.file}:${finding.line}.` };
    }
  }
  if (finding.codeSnippet) {
    const snippetLines = finding.codeSnippet.split(/\r?\n/).map(norm).filter((l) => l.length > 8);
    const fileNorm = new Set(lines.map(norm));
    const missing = snippetLines.filter((l) => !fileNorm.has(l));
    if (snippetLines.length > 0 && missing.length / snippetLines.length > 0.34) {
      return {
        status: "LINE_MISMATCH",
        detail: `${missing.length}/${snippetLines.length} snippet lines do not exist in ${finding.file} (first: "${missing[0].slice(0, 60)}").`,
      };
    }
  }
  const fileFamily = familyFromPath(finding.file);
  if (fileFamily !== "unknown" && finding.codeSnippet) {
    const foreign = detectSyntaxFamilies(finding.codeSnippet).filter((f) => f !== fileFamily);
    // Embedded/generated mixes are rare; a foreign family with no native family present is a mismatch.
    const native = detectSyntaxFamilies(finding.codeSnippet).includes(fileFamily);
    if (foreign.length > 0 && !native) {
      return {
        status: "LANGUAGE_MISMATCH",
        detail: `${finding.file} is ${fileFamily} but the snippet uses ${foreign.join("/")} syntax.`,
      };
    }
  }
  return { status: "VERIFIED", detail: `${finding.file}:${finding.line} matches the scanned file content.` };
}

/** Checks remediation text/code against the source file's family (e.g., Java APIs on a C# file). */
export function remediationLanguageIssue(filePath: string, remediationCode: string): string | null {
  const fileFamily = familyFromPath(filePath);
  if (fileFamily === "unknown") return null;
  const fams = detectSyntaxFamilies(remediationCode);
  const foreign = fams.filter((f) => f !== fileFamily);
  if (foreign.length > 0 && !fams.includes(fileFamily)) {
    return `remediation uses ${foreign.join("/")} syntax but the file is ${fileFamily}`;
  }
  return null;
}
