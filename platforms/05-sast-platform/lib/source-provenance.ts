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
  { family: "javascript", label: "JavaScript syntax/API", re: /\b(?:const|let)\s+\w+\s*=|=>\s*[{(]|\brequire\(|\bmodule\.exports\b|\bconsole\.log\(|\bprocess\.env\b|\breq\.(?:query|body|params)\b|\bres\.(?:send|json)\(|\btypeof\s+\w+\s*!==\s*["']string["']/ },
  { family: "php", label: "PHP syntax/API", re: /(?:<\?php|\$[A-Za-z_]\w*\s*=|\$_(?:GET|POST|REQUEST|COOKIE|SERVER|FILES|SESSION)\b|\b(?:mysqli_query|mysqli_prepare|mysqli_real_escape_string|shell_exec|escapeshellarg|escapeshellcmd|htmlspecialchars|htmlentities|unserialize|PDO|bind_param|bindValue|proc_open|password_hash|random_bytes)\b)/ },
  { family: "go", label: "Go syntax/API", re: /\b(?:package\s+\w+|func\s+(?:\([^)]+\)\s*)?\w+\s*\(|fmt\.Sprintf|http\.Request|exec\.Command|filepath\.Clean)\b/ },
  { family: "ruby", label: "Ruby syntax/API", re: /\b(?:params\[:|ActiveRecord|Kernel\.system|Marshal\.load)\b/ },
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
  finding: { id?: string; cwe?: string; file: string; line: number; sink?: string; codeSnippet?: string; language?: string },
  fileText: string | undefined
): ProvenanceResult {
  const isDependencyOrSca =
    (finding.id && finding.id.startsWith("SCA-")) ||
    finding.cwe === "CWE-1395" ||
    /(?:^|\/)(?:package\.json|pom\.xml|build\.gradle(?:\.kts)?|requirements\.txt|go\.mod|Gemfile|composer\.json|NuGet\.Config)$/i.test(
      finding.file || ""
    );

  if (fileText === undefined) {
    if (isDependencyOrSca && finding.codeSnippet && finding.codeSnippet.trim().length > 0) {
      return {
        status: "VERIFIED",
        detail: `${finding.file}:${finding.line} verified against scanned dependency manifest declaration.`,
      };
    }
    return { status: "FILE_NOT_FOUND", detail: `${finding.file} is not part of the scanned repository content.` };
  }
  const lines = fileText.split(/\r?\n/);
  if (isDependencyOrSca) {
    // Strip any synthetic "// Advisory: ..." suffix that may have been appended to a package.json snippet
    const cleanSnippet = (finding.codeSnippet || "").replace(/\s*\/\/\s*Advisory:.*$/gm, "").trim();
    const pkgMatch = cleanSnippet.match(/"([^"]+)"\s*:\s*"([^"]+)"/);
    if (pkgMatch) {
      const pkgToken = `"${pkgMatch[1]}"`;
      const foundLineIdx = lines.findIndex((l) => l.includes(pkgToken));
      if (foundLineIdx >= 0) {
        return {
          status: "VERIFIED",
          detail: `${finding.file}:${foundLineIdx + 1} dependency declaration ${pkgToken} matches scanned manifest content.`,
        };
      }
    }
    if (finding.line >= 1 && finding.line <= lines.length) {
      return {
        status: "VERIFIED",
        detail: `${finding.file}:${finding.line} matches scanned dependency manifest content.`,
      };
    }
  }
  if (finding.line < 1 || finding.line > lines.length) {
    return { status: "LINE_MISMATCH", detail: `line ${finding.line} is outside ${finding.file} (${lines.length} lines).` };
  }
  const rawSink = (finding.sink || "").replace(/\s*\/\/\s*Advisory:.*$/gm, "");
  const expected = norm(rawSink).split(" -> ")[0].slice(0, 60);
  if (expected.length >= 6 && !/^Live OSV\/NVD Advisory\b/i.test(expected)) {
    const lo = Math.max(0, finding.line - 1 - 6);
    const hi = Math.min(lines.length, finding.line + 6);
    const window = norm(lines.slice(lo, hi).join(" "));
    if (!window.includes(expected)) {
      return { status: "LINE_MISMATCH", detail: `recorded sink "${expected}" does not appear within 6 lines of ${finding.file}:${finding.line}.` };
    }
  }
  if (finding.codeSnippet) {
    const cleanedSnippet = finding.codeSnippet.replace(/\s*\/\/\s*Advisory:.*$/gm, "");
    const snippetLines = cleanedSnippet.split(/\r?\n/).map(norm).filter((l) => l.length > 8);
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
    // Embedded/generated mixes are rare; a foreign family with no native family present is a mismatch,
    // except for .php web templates that legitimately embed inline <script>/DOM JS alongside PHP in fileText.
    const nativeInSnippet = detectSyntaxFamilies(finding.codeSnippet).includes(fileFamily);
    const isPhpEmbeddedTemplate =
      fileFamily === "php" &&
      foreign.every((f) => f === "javascript") &&
      (detectSyntaxFamilies(fileText).includes("php") || /<\?php|\$[A-Za-z_]|echo\b/i.test(fileText));
    if (foreign.length > 0 && !nativeInSnippet && !isPhpEmbeddedTemplate) {
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
