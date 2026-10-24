import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const FILE_CANDIDATES = ["/workspace/.env", resolve(process.cwd(), ".env")];

function readFileEnv(): Record<string, string> {
  const found: Record<string, string> = {};
  for (const path of FILE_CANDIDATES) {
    let text = "";
    try {
      text = readFileSync(path, "utf8");
    } catch {
      continue;
    }
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const cut = trimmed.indexOf("=");
      const key = trimmed.slice(0, cut).trim();
      let value = trimmed.slice(cut + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (key && !found[key]) found[key] = value;
    }
    if (Object.keys(found).length > 0) break;
  }
  return found;
}

export function env(key: string): string | undefined {
  const live = process.env[key]?.trim();
  if (live) return live;
  const stored = readFileEnv()[key]?.trim();
  return stored || undefined;
}

/**
 * Workspace preview vs deployed app. The deployer writes GROK_PROJECT_ID on
 * every publish; the sandbox preview never has it. Single source of truth for
 * the split — gate audience, gate endpoints and connector-token semantics all
 * key off this predicate.
 */
export function isWorkspacePreview(): boolean {
  return !env("GROK_PROJECT_ID");
}
