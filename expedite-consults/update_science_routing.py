with open("noctis-ai/src/lib/noctis-desk.server.ts", "r", encoding="utf-8") as f:
    content = f.read()

target = "const report = retrievalReport(kept, latest);\n  if (report) return { text: report };"
replacement = """const report = retrievalReport(kept, latest);
  if (report) return { text: report };

  if (/\\b(schwarzschild|de broglie|henderson-?hasselbalch|lorentz factor|relativistic lorentz|melting temp.*(?:dna|primer)|dna.*melting temp|hubble.*recession|event horizon radius)\\b/i.test(latest)) {
    const { solveScienceQuestion, formatScienceResponse } = await import("@/lib/noctis-universal-science-engine");
    const sol = solveScienceQuestion(latest);
    return { text: formatScienceResponse(sol) };
  }"""

if target in content:
    content = content.replace(target, replacement)
    print("Replaced target LF")
else:
    target_crlf = target.replace("\n", "\r\n")
    replacement_crlf = replacement.replace("\n", "\r\n")
    if target_crlf in content:
        content = content.replace(target_crlf, replacement_crlf)
        print("Replaced target CRLF")
    else:
        print("Target not found")

with open("noctis-ai/src/lib/noctis-desk.server.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated noctis-desk.server.ts")
