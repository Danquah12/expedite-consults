import re

file_path = r"d:\Anti-gravity\expedite-consults\expedite-consults\noctis-ai\src\components\noctis\NoctisTerminal.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update imports
old_imp = 'import { Users } from "lucide-react";'
new_imp = 'import { createGitHubPrPackage } from "@/lib/noctis-github-dispatcher";\nimport { Users, ExternalLink } from "lucide-react";'
if old_imp in text:
    text = text.replace(old_imp, new_imp, 1)

# 2. Update case "pr":
old_pr = '''      case "pr":
        const prTitle = arg || `feat(remediation): apply sovereign security patch for ${artifactTitle}`;
        const mockDiff = `diff --git a/${artifactTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ts b/${artifactTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ts\\n+ // Sealed by Noctis Autonomous Engine\\n+ export const SOVEREIGN_PATCH_APPLIED = true;`;
        onCreatePr?.(prTitle, mockDiff);
        output = (
          <div className="space-y-1 text-xs font-mono">
            <p className="text-emerald-400 font-bold">[PR CREATED] Branch: patch/sovereign-remediation-${Date.now().toString().slice(-4)}</p>
            <p className="text-zinc-300">Title: "${prTitle}"</p>
            <p className="text-[#e4b86a]">Attestation Seal: SIG_NOCTIS_SOVEREIGN_9aef1c47d12...</p>
            <p className="text-zinc-400">Status: Verified clean test run (103/103 passed). Ready for review.</p>
          </div>
        );
        break;'''

new_pr = '''      case "pr":
      case "github":
        const targetTitle = arg || `fix(security): auto-remediation patch for ${artifactTitle}`;
        const prPackage = createGitHubPrPackage({
          repo: "Danquah12/noctis-ai",
          baseBranch: "main",
          filePath: `src/remediation/${artifactTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "patch"}.ts`,
          originalContent: "// Original unpatched implementation\\nexport const VULNERABLE = true;",
          patchedContent: activeCode || "// Sovereign auto-remediation patch\\nexport const SECURE = true;",
          prTitle: targetTitle,
        });
        onCreatePr?.(targetTitle, prPackage.unifiedDiff);
        output = (
          <div className="space-y-1.5 text-xs font-mono text-zinc-300">
            <p className="text-[#e4b86a] font-bold">[LIVE GITHUB PR PACKAGE GENERATED]</p>
            <p className="text-emerald-400 font-semibold">Branch: <span className="text-zinc-200">{prPackage.branch}</span></p>
            <p>Title: <span className="text-zinc-100 font-semibold">{prPackage.title}</span></p>
            <p>Commit SHA: <span className="text-cyan-400 font-mono">{prPackage.commitSha.slice(0, 16)}...</span></p>
            <p>Passport Seal: <span className="text-purple-400 break-all">{prPackage.passportDigest.slice(0, 32)}...</span></p>
            <div className="bg-black/40 border border-white/10 rounded p-2 text-zinc-400">
              <p className="text-emerald-300 font-semibold mb-1">Unified Diff Summary:</p>
              <pre className="overflow-x-auto text-[11px] text-zinc-300 font-mono">{prPackage.unifiedDiff.slice(0, 300)}...</pre>
            </div>
            <div className="pt-1">
              <a
                href={prPackage.compareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e4b86a] text-black font-semibold hover:bg-[#d4a85a] transition text-xs"
              >
                <GitPullRequest className="size-3.5" />
                Open 1-Click Pull Request on GitHub
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        );
        break;'''

if old_pr in text:
    text = text.replace(old_pr, new_pr, 1)
    print("Replaced old_pr successfully")
else:
    print("WARNING: old_pr was not exact match")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)
print("Finished updating NoctisTerminal")
