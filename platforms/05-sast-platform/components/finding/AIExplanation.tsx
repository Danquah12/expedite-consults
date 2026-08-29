"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import type { SASTFinding } from "@/types/sast";

type Props = { finding: SASTFinding };

// Pre-written AI explanations keyed by CWE prefix
const AI_EXPLANATIONS: Record<string, { plain: string; analogy: string; devTip: string }> = {
  "CWE-89": {
    plain: "Your application takes text typed by a user and directly drops it into a database query without checking it first. A malicious user can type special characters that break out of the intended query and run their own commands — like being able to change the subject of a letter just by inserting your own sentences.",
    analogy: "Imagine a restaurant order slip that goes directly to the kitchen. If a customer writes 'Burger; also give me everything in the fridge', an untrained cook might do exactly that. SQL injection works the same way — the database doesn't know the difference between instructions and data.",
    devTip: "Always use parameterized queries or prepared statements. Never concatenate user input directly into SQL strings. Modern ORMs like Hibernate or JPA handle this automatically.",
  },
  "CWE-502": {
    plain: "Your application converts untrusted data back into objects without checking whether those objects are safe. An attacker can craft a specially malformed payload that, when processed, executes arbitrary code on your server.",
    analogy: "It's like accepting a USB drive from a stranger and running every program on it automatically. The drive might look like a document, but it's actually malware.",
    devTip: "Never deserialize data from untrusted sources without a type allowlist. Use JSON instead of native serialization. If you must deserialize, use a safe deserialization library with class filtering.",
  },
  "CWE-918": {
    plain: "Your server makes HTTP requests to URLs provided by users, without validating whether those URLs point to internal systems. An attacker can make your server call internal APIs, cloud metadata endpoints, or services behind your firewall that should never be publicly accessible.",
    analogy: "Like giving a delivery person the ability to walk into any room in your building just because they have a note saying 'go to room X'. They could go to your server room, accounting office — anywhere.",
    devTip: "Maintain an allowlist of permitted domains. Block requests to 169.254.x.x (cloud metadata), 10.x.x.x, 172.16-31.x.x, and 192.168.x.x. Use a DNS resolver that rejects private IPs.",
  },
  "CWE-611": {
    plain: "Your application parses XML from external sources without disabling external entity processing. An attacker can include a reference to an external file path or URL, causing your server to read sensitive local files or make internal network requests.",
    analogy: "Like receiving a form that says 'fill in field X by reading the contents of /etc/passwd from your server.' The parser obediently does it.",
    devTip: "Disable external entity processing in your XML parser. In Java, set `XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES` to false. Use JSON instead of XML where possible.",
  },
  "CWE-639": {
    plain: "Your application lets users access records by guessing or incrementing an ID in the URL, without checking whether the logged-in user actually owns that record. User 123 can access user 124's data just by changing the number.",
    analogy: "Like a hotel where room 302 can open room 303's door just because they're neighbors. The hotel doesn't check whose key it is — just that a key was used.",
    devTip: "Always verify object ownership server-side. Never rely on the client to enforce access control. Apply row-level security in your ORM or add a `.where(ownerId = currentUser.id)` check.",
  },
  "CWE-347": {
    plain: "Your application accepts JSON Web Tokens but doesn't properly verify the cryptographic signature — or accepts the 'none' algorithm, which means no signature at all. An attacker can forge a token claiming to be any user, including an admin.",
    analogy: "Like accepting a passport that has 'signature: none' in the signature field. Anyone could print one and claim to be anyone.",
    devTip: "Always specify the exact algorithm expected (e.g., `HS256`). Reject tokens with `alg: none`. Use a battle-tested JWT library and keep your secret keys in a secrets manager.",
  },
  "CWE-22": {
    plain: "User-supplied input is used to construct a file path without sanitizing directory traversal sequences like `../`. An attacker can escape the intended directory and read sensitive files anywhere on the filesystem.",
    analogy: "Like an elevator where you type the floor number yourself — and someone types `-50` to access the underground vault that isn't on the public directory.",
    devTip: "Resolve file paths to their canonical form and verify they still start with the expected base directory. Use `Path.toRealPath()` in Java or `os.path.realpath()` in Python.",
  },
  "CWE-798": {
    plain: "A secret key, API token, or password is hardcoded directly in the source code. Anyone who can read the code — including via a public GitHub repo — has full access to whatever that secret protects.",
    analogy: "Like writing your house key code on the outside of the door. Convenient, but anyone walking by can read it.",
    devTip: "Move all secrets to environment variables or a secrets manager (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault). Rotate the exposed credential immediately — assume it has already been compromised.",
  },
  "DEFAULT": {
    plain: "This vulnerability allows an attacker to manipulate your application in an unintended way. The underlying issue is that data from an untrusted source is being used in a sensitive operation without proper validation or sanitization.",
    analogy: "Like taking instructions from a stranger and following them without question. Your application trusts input it shouldn't.",
    devTip: "Apply the principle of least privilege, validate all inputs at the point of entry, and use parameterized or safe APIs that separate data from instructions.",
  },
};

function getExplanation(cwe: string) {
  const key = Object.keys(AI_EXPLANATIONS).find(k => cwe.includes(k.replace("CWE-", "")));
  return AI_EXPLANATIONS[key || "DEFAULT"];
}

export default function AIExplanation({ finding: f }: Props) {
  const [open, setOpen] = useState(false);
  const [tab,  setTab]  = useState<"plain" | "analogy" | "devTip">("plain");
  const expl = getExplanation(f.cwe);

  const TABS = [
    { key: "plain",   label: "Plain English" },
    { key: "analogy", label: "Real-World Analogy" },
    { key: "devTip",  label: "Developer Tip" },
  ] as const;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(167,139,250,0.3)", background: "rgba(167,139,250,0.04)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 transition-colors hover:bg-white/5"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.4)" }}
          >
            <Sparkles className="w-4 h-4" style={{ color: "#a78bfa" }} />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-white">AI Explanation</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>Plain English · Analogy · Dev Tip</div>
          </div>
        </div>
        {open
          ? <ChevronUp  className="w-4 h-4" style={{ color: "var(--muted)" }} />
          : <ChevronDown className="w-4 h-4" style={{ color: "var(--muted)" }} />}
      </button>

      {open && (
        <div className="px-6 pb-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: tab === t.key ? "rgba(167,139,250,0.2)" : "transparent",
                  border: `1px solid ${tab === t.key ? "rgba(167,139,250,0.5)" : "var(--border)"}`,
                  color: tab === t.key ? "#a78bfa" : "var(--muted)",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div
            className="rounded-xl p-4 text-sm leading-relaxed"
            style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--muted)" }}
          >
            {tab === "plain"   && <><span className="text-white font-semibold">What's happening: </span>{expl.plain}</>}
            {tab === "analogy" && <><span className="text-white font-semibold">Think of it like this: </span>{expl.analogy}</>}
            {tab === "devTip"  && <><span className="text-white font-semibold">How to fix it: </span>{expl.devTip}</>}
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
            <Sparkles className="w-3 h-3" style={{ color: "#a78bfa" }} />
            AI-generated explanation for {f.cwe} · Always verify with your security team
          </div>
        </div>
      )}
    </div>
  );
}
