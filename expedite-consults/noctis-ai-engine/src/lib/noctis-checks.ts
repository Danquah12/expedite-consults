export function needsCurrent(question: string) {
  return /\b(laws?|regulations?|statutes?|prices?|priced|elections?|elected|vulnerabilit|cve-\d|software versions?|latest version|scientific discover|government polic|current events?|what happened|product specifications?|specifications?)\b/i.test(question);
}

export function assignRoles(question: string, verify: boolean) {
  return {
    classify: "code",
    retrieve: needsCurrent(question) ? "web" : "stored-notes",
    calculate: "calculator",
    draft: "gpt-4o",
    verify: verify || needsCurrent(question) ? "independent-auditor" : "none",
    safety: "code",
  } as const;
}

function yearsClaimed(draft: string) {
  return [...draft.matchAll(/\b(?:discovered|released|enacted|elected|priced|patched|disclosed)\s+in\s+(20\d\d)\b/gi)].map((hit) => hit[1] || "");
}

export function factFindings(question: string, draft: string, opened: string) {
  const found: string[] = [];
  const evidence = `${question}\n${opened}`;
  for (const year of yearsClaimed(draft)) {
    if (year && !evidence.includes(year)) found.push(`"${year}" was stated as a discovery or event date, but that year is not in the question or the opened pages. It is not an established fact.`);
  }
  const quotes = [...draft.matchAll(/"([^"]{24,180})"/g)].map((hit) => hit[1] || "").slice(0, 4);
  for (const quote of quotes) {
    if (opened && !opened.includes(quote.slice(0, 40))) found.push("A quotation is not in the pages opened for this answer.");
  }
  return found;
}

export function firewallFindings(draft: string, opened: string) {
  const found: string[] = [];
  const urls = [...draft.matchAll(/https?:\/\/[^\s)"']+/g)].map((hit) => hit[0]).slice(0, 6);
  for (const url of urls) {
    const bare = url.replace(/[),.]+$/g, "");
    if (!opened.includes(bare.slice(0, 48))) found.push(`A link was not opened for this answer: ${bare.slice(0, 80)}`);
  }
  if (!opened.trim() && /\([A-Z][A-Za-z]+,\s*20\d\d\)/.test(draft)) {
    found.push("A citation was written, but no page was opened. It is not a source.");
  }
  if (!opened.trim() && /\baccording to\b/i.test(draft) && needsCurrent(draft) && !/\b(unknown|not in the|was not opened)\b/i.test(draft)) {
    found.push("A current claim was attributed, but no page was opened.");
  }
  return found;
}
