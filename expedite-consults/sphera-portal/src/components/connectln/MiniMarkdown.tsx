"use client"

import React from "react"

/**
 * Rich dependency-free Executive & Technical Telemetry Markdown Renderer for Noctis replies.
 * Supports:
 * - Nested bold + inline code (**`...`** and `**...**`) with semantic status badges
 * - Inline & display LaTeX math ($\le 11.0\%$, $\ge$, $\approx$, $\times$, $\pm$, $\rightarrow$, etc.)
 * - Hierarchical headings (# / ## / ### Title (ENGINE-ID) / #### 1. Section)
 * - Subsystem / Standards metadata strips (**Subsystem Domain:** `...` · **Standards:** ...)
 * - Structured key-value telemetry bullet lists (- **Key:** **`Value`** details)
 * - Tables, blockquotes, ordered lists, and clean stripping of raw `noctis-dashboard` JSON blocks
 */

export function normalizeLatexFragment(raw: string): string {
  return raw
    .replace(/\\(?:le|leq)\b/g, "≤")
    .replace(/\\(?:ge|geq)\b/g, "≥")
    .replace(/\\(?:ne|neq)\b/g, "≠")
    .replace(/\\approx\b/g, "≈")
    .replace(/\\equiv\b/g, "≡")
    .replace(/\\sim\b/g, "∼")
    .replace(/\\times\b/g, "×")
    .replace(/\\cdot\b/g, "·")
    .replace(/\\div\b/g, "÷")
    .replace(/\\pm\b/g, "±")
    .replace(/\\mp\b/g, "∓")
    .replace(/\\(?:to|rightarrow)\b/g, "→")
    .replace(/\\leftarrow\b/g, "←")
    .replace(/\\leftrightarrow\b/g, "↔")
    .replace(/\\(?:Rightarrow|implies)\b/g, "⇒")
    .replace(/\\infty\b/g, "∞")
    .replace(/\\partial\b/g, "∂")
    .replace(/\\nabla\b/g, "∇")
    .replace(/\\sum\b/g, "∑")
    .replace(/\\prod\b/g, "∏")
    .replace(/\\int\b/g, "∫")
    .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2")
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\mathrm\{([^}]+)\}/g, "$1")
    .replace(/\\mathbf\{([^}]+)\}/g, "$1")
    .replace(/\\alpha\b/g, "α")
    .replace(/\\beta\b/g, "β")
    .replace(/\\gamma\b/g, "γ")
    .replace(/\\Gamma\b/g, "Γ")
    .replace(/\\delta\b/g, "δ")
    .replace(/\\Delta\b/g, "Δ")
    .replace(/\\epsilon\b/g, "ε")
    .replace(/\\varepsilon\b/g, "ε")
    .replace(/\\zeta\b/g, "ζ")
    .replace(/\\eta\b/g, "η")
    .replace(/\\theta\b/g, "θ")
    .replace(/\\Theta\b/g, "Θ")
    .replace(/\\kappa\b/g, "κ")
    .replace(/\\lambda\b/g, "λ")
    .replace(/\\Lambda\b/g, "Λ")
    .replace(/\\mu\b/g, "μ")
    .replace(/\\nu\b/g, "ν")
    .replace(/\\xi\b/g, "ξ")
    .replace(/\\pi\b/g, "π")
    .replace(/\\Pi\b/g, "Π")
    .replace(/\\rho\b/g, "ρ")
    .replace(/\\sigma\b/g, "σ")
    .replace(/\\Sigma\b/g, "Σ")
    .replace(/\\tau\b/g, "τ")
    .replace(/\\phi\b/g, "φ")
    .replace(/\\Phi\b/g, "Φ")
    .replace(/\\chi\b/g, "χ")
    .replace(/\\psi\b/g, "ψ")
    .replace(/\\Psi\b/g, "Ψ")
    .replace(/\\omega\b/g, "ω")
    .replace(/\\Omega\b/g, "Ω")
    .replace(/\\%/g, "%")
    .replace(/\\_/g, "_")
    .replace(/\\&/g, "&")
    .replace(/\\#/g, "#")
    .replace(/\\,/g, " ")
    .replace(/\\;/g, " ")
    .replace(/\\quad\b/g, "  ")
    .replace(/\^\{2\}|\^2\b/g, "²")
    .replace(/\^\{3\}|\^3\b/g, "³")
    .replace(/\^\{-1\}/g, "⁻¹")
    .replace(/\^\{([^}]+)\}/g, "^$1")
    .replace(/_\{([^}]+)\}/g, "_$1")
    .replace(/\s+/g, " ")
    .trim()
}

export function preprocessNoctisMarkdown(rawText: string): string {
  if (!rawText) return ""
  return rawText
    .replace(/\r\n/g, "\n")
    // Strip raw noctis-dashboard JSON blocks so they don't clutter executive output
    .replace(/```noctis-dashboard[\s\S]*?```/gi, "")
    // Convert display math $$...$$ into clean inline math tokens
    .replace(/\$\$([\s\S]*?)\$\$/g, (_, expr) => `\`${normalizeLatexFragment(expr)}\``)
    // Also normalize bare LaTeX macros outside $...$ if any leaked
    .replace(/\\(?:le|leq)\b/g, "≤")
    .replace(/\\(?:ge|geq)\b/g, "≥")
    .replace(/\\(?:ne|neq)\b/g, "≠")
    .replace(/\\approx\b/g, "≈")
    .replace(/\\times\b/g, "×")
    .replace(/\\pm\b/g, "±")
    .replace(/\\%/g, "%")
    .trim()
}

function getTelemetryBadgeClass(val: string): string {
  const upper = val.toUpperCase()
  if (
    upper.includes("SECURE") ||
    upper.includes("NEGATIVE (SECURE") ||
    upper.includes("VERIFIED") ||
    upper.includes("PASS") ||
    upper.includes("NOMINAL") ||
    upper.includes("ONLINE") ||
    upper.includes("ACTIVE") ||
    upper.includes("COMPLIANT")
  ) {
    return "inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/90 dark:border-emerald-800 px-2 py-0.5 font-mono text-[11px] font-bold tracking-tight shadow-2xs"
  }
  if (
    upper.includes("BREACH") ||
    upper.includes("CRITICAL") ||
    upper.includes("ALERT") ||
    upper.includes("FAIL") ||
    upper.includes("HIGH RISK")
  ) {
    return "inline-flex items-center rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200/90 dark:border-rose-800 px-2 py-0.5 font-mono text-[11px] font-bold tracking-tight shadow-2xs"
  }
  if (upper.includes("WARN") || upper.includes("ELEVATED") || upper.includes("PENDING")) {
    return "inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/90 dark:border-amber-800 px-2 py-0.5 font-mono text-[11px] font-bold tracking-tight shadow-2xs"
  }
  return "inline-flex items-center rounded-md bg-[#F4EFE6] dark:bg-zinc-800 text-[#292521] dark:text-zinc-100 border border-[#E2D9C5] dark:border-zinc-700 px-2 py-0.5 font-mono text-[11px] font-bold tracking-tight shadow-2xs"
}

function inline(text: string, keyBase: string): React.ReactNode[] {
  const out: React.ReactNode[] = []
  // Match order:
  // 1. **`...`** (bold wrapping inline code)
  // 2. `**...**` (inline code wrapping bold)
  // 3. $...$ (inline LaTeX math)
  // 4. **...** (bold text, which may still contain inline `code` or $math$)
  // 5. `...` (standard inline code)
  // 6. _..._ or *...* (italic)
  const re =
    /(\*\*`[^`]+`\*\*|`\*\*[^*]+\*\*`|\$[^$\n]+\$|\*\*[^*]+\*\*|`[^`]+`|_[^_\s][^_]*_|\*[^*\s][^*]*\*)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) {
      out.push(normalizeLatexFragment(text.slice(last, m.index)))
    }
    const tok = m[0]
    const key = `${keyBase}-${i++}`

    if (tok.startsWith("**`") && tok.endsWith("`**")) {
      const inner = normalizeLatexFragment(tok.slice(3, -3))
      out.push(
        <code key={key} className={getTelemetryBadgeClass(inner)}>
          {inner}
        </code>
      )
    } else if (tok.startsWith("`**") && tok.endsWith("**`")) {
      const inner = normalizeLatexFragment(tok.slice(3, -3))
      out.push(
        <code key={key} className={getTelemetryBadgeClass(inner)}>
          {inner}
        </code>
      )
    } else if (tok.startsWith("$") && tok.endsWith("$") && tok.length > 2) {
      const mathContent = normalizeLatexFragment(tok.slice(1, -1))
      out.push(
        <span
          key={key}
          className="inline-flex items-center rounded bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200/80 dark:border-zinc-700 px-1.5 py-0.5 font-mono text-[11px] font-semibold"
        >
          {mathContent}
        </span>
      )
    } else if (tok.startsWith("**") && tok.endsWith("**")) {
      const inner = tok.slice(2, -2)
      // If the bold text itself contains backticks or $math$, recursively parse it
      if (inner.includes("`") || inner.includes("$")) {
        out.push(
          <strong key={key} className="font-bold text-slate-900 dark:text-white">
            {inline(inner, `${key}-b`)}
          </strong>
        )
      } else {
        out.push(
          <strong key={key} className="font-bold text-slate-900 dark:text-white">
            {normalizeLatexFragment(inner)}
          </strong>
        )
      }
    } else if (tok.startsWith("`") && tok.endsWith("`")) {
      const inner = normalizeLatexFragment(tok.slice(1, -1))
      out.push(
        <code
          key={key}
          className="rounded-md bg-[#F4EFE6]/90 dark:bg-zinc-800 text-[#5C3A21] dark:text-amber-300 border border-[#E6DEC8] dark:border-zinc-700 px-1.5 py-0.5 font-mono text-[11px] font-semibold"
        >
          {inner}
        </code>
      )
    } else {
      out.push(
        <em key={key} className="italic">
          {normalizeLatexFragment(tok.slice(1, -1))}
        </em>
      )
    }
    last = m.index + tok.length
  }
  if (last < text.length) {
    out.push(normalizeLatexFragment(text.slice(last)))
  }
  return out
}

function renderHeading(level: number, rawHeading: string, key: number): React.ReactNode {
  const cleaned = rawHeading.replace(/^\*\*|\*\*$/g, "").trim()

  // Extract trailing engine/module code like (NOCTIS-QUANTUM-CRYPTO-001)
  const codeMatch = /^(.*?)\s*\(([A-Z0-9]+(?:-[A-Z0-9_]+){1,})\)\s*$/.exec(cleaned)

  if (level <= 3 && codeMatch) {
    const titlePart = codeMatch[1].trim()
    const codeBadge = codeMatch[2].trim()
    return (
      <div
        key={key}
        className="mt-2 mb-2.5 rounded-xl bg-gradient-to-r from-[#292521] via-[#3A2E25] to-[#292521] text-[#FAF7F2] px-3.5 py-2.5 shadow-2xs border border-[#5C3A21]/40 flex flex-wrap items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-xs sm:text-[13px] font-extrabold tracking-tight leading-snug">
            {inline(titlePart, `h-title-${key}`)}
          </span>
        </div>
        <span className="inline-flex items-center rounded-md bg-white/10 border border-white/20 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-amber-200 shrink-0">
          {codeBadge}
        </span>
      </div>
    )
  }

  // Check for numbered subsection heading like "#### 1. Quantum Key Distribution Telemetry"
  const numberedSub = /^(\d+)\.\s+(.*)$/.exec(cleaned)
  if (level >= 3 && numberedSub) {
    const secNum = numberedSub[1]
    const secTitle = numberedSub[2]
    return (
      <div
        key={key}
        className="mt-3.5 mb-1.5 pb-1 border-b border-[#E6DEC8] dark:border-zinc-700 flex items-center gap-2"
      >
        <span className="inline-flex h-5 w-5 rounded-md bg-[#6B4226] text-white font-mono text-[10px] font-extrabold items-center justify-center shrink-0">
          {secNum}
        </span>
        <span className="text-xs sm:text-[13px] font-extrabold text-[#292521] dark:text-zinc-100 tracking-tight">
          {inline(secTitle, `h-sec-${key}`)}
        </span>
      </div>
    )
  }

  if (level === 1) {
    return (
      <div
        key={key}
        className="text-sm sm:text-base font-extrabold text-[#292521] dark:text-white mt-2 mb-1.5 pb-1 border-b border-[#E6DEC8] dark:border-zinc-700"
      >
        {inline(cleaned, `h1-${key}`)}
      </div>
    )
  }

  if (level === 2) {
    return (
      <div
        key={key}
        className="text-xs sm:text-[13px] font-extrabold text-[#5C3A21] dark:text-amber-300 mt-3 mb-1.5 pb-1 border-b border-[#E6DEC8]/80 dark:border-zinc-700"
      >
        {inline(cleaned, `h2-${key}`)}
      </div>
    )
  }

  if (level === 3) {
    return (
      <div
        key={key}
        className="text-xs sm:text-[13px] font-extrabold text-[#292521] dark:text-zinc-100 mt-2.5 mb-1.5 flex items-center gap-1.5"
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#6B4226] shrink-0" />
        <span>{inline(cleaned, `h3-${key}`)}</span>
      </div>
    )
  }

  return (
    <div
      key={key}
      className="text-xs font-extrabold uppercase tracking-wider text-[#6B4226] dark:text-amber-400 mt-2.5 mb-1 pb-0.5 border-b border-[#E6DEC8]/60 dark:border-zinc-700"
    >
      {inline(cleaned, `h4-${key}`)}
    </div>
  )
}

function renderBulletItem(itemText: string, itemIdx: number, listKey: number): React.ReactNode {
  // Check if bullet has a bold key-value prefix: "**Key Label:** rest of value" or "**Key Label**: rest"
  const kvMatch = /^\*\*([^*:]+?)(?::\*\*|\*\*:)\s*(.*)$/.exec(itemText.trim())
  if (kvMatch) {
    const label = kvMatch[1].trim()
    const rest = kvMatch[2].trim()
    return (
      <li
        key={itemIdx}
        className="rounded-lg bg-[#FAF7F2]/80 dark:bg-zinc-800/50 border border-[#ECE5D5] dark:border-zinc-700/70 px-2.5 py-1.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 text-xs leading-relaxed"
      >
        <span className="font-extrabold text-[#4A3525] dark:text-zinc-200 shrink-0 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#6B4226] shrink-0" />
          <span>{normalizeLatexFragment(label)}:</span>
        </span>
        <span className="text-slate-700 dark:text-zinc-300 min-w-0 break-words">
          {inline(rest, `ul-kv-${listKey}-${itemIdx}`)}
        </span>
      </li>
    )
  }

  return (
    <li
      key={itemIdx}
      className="flex items-start gap-2 text-xs leading-relaxed text-slate-700 dark:text-zinc-300 py-0.5"
    >
      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#6B4226] shrink-0" />
      <span className="min-w-0 break-words">{inline(itemText, `ul-${listKey}-${itemIdx}`)}</span>
    </li>
  )
}

export function MiniMarkdown({ text }: { text: string }) {
  const normalized = preprocessNoctisMarkdown(text)
  const lines = normalized.split("\n")
  const nodes: React.ReactNode[] = []
  let i = 0
  let k = 0

  while (i < lines.length) {
    const line = lines[i]

    // Fenced code blocks
    if (/^\s*```/.test(line)) {
      const lang = line.replace(/^\s*```/, "").trim().toLowerCase()
      const buf: string[] = []
      i++
      while (i < lines.length && !/^\s*```/.test(lines[i])) {
        buf.push(lines[i++])
      }
      i++
      // Skip noctis-dashboard raw blocks if any slipped through
      if (lang === "noctis-dashboard") continue
      nodes.push(
        <pre
          key={k++}
          className="my-2 overflow-x-auto rounded-xl bg-[#292521] text-[#FAF7F2] border border-[#5C3A21]/40 p-3 text-[11px] font-mono leading-relaxed"
        >
          {buf.join("\n")}
        </pre>
      )
      continue
    }

    // Horizontal rule
    if (/^\s*(?:---|\*\*\*|___)\s*$/.test(line)) {
      nodes.push(<hr key={k++} className="my-2.5 border-[#E6DEC8] dark:border-zinc-700" />)
      i++
      continue
    }

    // Headings (# to ####)
    const h = /^\s*(#{1,4})\s+(.*)$/.exec(line)
    if (h) {
      nodes.push(renderHeading(h[1].length, h[2], k++))
      i++
      continue
    }

    // Metadata strip line (e.g., "**Subsystem Domain:** `QUANTUM_CRYPTOGRAPHY_QKD` · **Standards:** ...")
    if (line.includes("·") && /^\s*\*\*[^*]+:\*\*/.test(line)) {
      const segments = line.split(/\s*·\s*/).filter(Boolean)
      nodes.push(
        <div
          key={k++}
          className="my-2 rounded-lg bg-[#F4EFE6]/85 dark:bg-zinc-800/80 border border-[#E2D9C5] dark:border-zinc-700 px-3 py-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]"
        >
          {segments.map((seg, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-[#A39684] font-bold">·</span>}
              <span className="inline-flex flex-wrap items-center gap-1 text-slate-700 dark:text-zinc-200">
                {inline(seg.trim(), `meta-${k}-${idx}`)}
              </span>
            </React.Fragment>
          ))}
        </div>
      )
      i++
      continue
    }

    // Blockquotes
    if (/^\s*>\s?/.test(line)) {
      const buf: string[] = []
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        buf.push(lines[i++].replace(/^\s*>\s?/, ""))
      }
      nodes.push(
        <div
          key={k++}
          className="my-2 border-l-4 border-[#6B4226] bg-[#FAF7F2] dark:bg-zinc-800/60 pl-3 pr-2.5 py-2 rounded-r-lg text-xs italic text-slate-700 dark:text-zinc-300"
        >
          {inline(buf.join(" "), `q${k}`)}
        </div>
      )
      continue
    }

    // Markdown Tables
    if (/^\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const cells = (l: string) =>
        l
          .trim()
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((c) => c.trim())
      const head = cells(line)
      i += 2
      const rows: string[][] = []
      while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) {
        rows.push(cells(lines[i++]))
      }
      nodes.push(
        <div
          key={k++}
          className="my-2.5 overflow-x-auto rounded-xl border border-[#E2D9C5] dark:border-zinc-700 shadow-2xs"
        >
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-[#F4EFE6] dark:bg-zinc-800 text-[#292521] dark:text-zinc-100">
                {head.map((c, j) => (
                  <th key={j} className="p-2 font-extrabold border-b border-[#E2D9C5] dark:border-zinc-700">
                    {inline(c, `th${j}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr
                  key={ri}
                  className="border-t border-[#ECE5D5] dark:border-zinc-700 odd:bg-white even:bg-[#FAF7F2]/60 dark:odd:bg-zinc-900 dark:even:bg-zinc-800/40"
                >
                  {r.map((c, ci) => (
                    <td key={ci} className="p-2 align-top">
                      {inline(c, `td${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    }

    // Ordered lists
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i++].replace(/^\s*\d+\.\s+/, ""))
      }
      const listKey = k++
      nodes.push(
        <ol key={listKey} className="my-2 space-y-1.5">
          {items.map((t, j) => (
            <li
              key={j}
              className="flex items-start gap-2.5 rounded-lg bg-[#FAF7F2]/70 dark:bg-zinc-800/40 border border-[#ECE5D5]/80 dark:border-zinc-700/60 px-2.5 py-1.5 text-xs leading-relaxed"
            >
              <span className="shrink-0 h-5 w-5 rounded-md bg-[#6B4226] text-white text-[10px] font-mono font-extrabold flex items-center justify-center mt-0.5">
                {j + 1}
              </span>
              <span className="min-w-0 break-words">{inline(t, `ol-${listKey}-${j}`)}</span>
            </li>
          ))}
        </ol>
      )
      continue
    }

    // Unordered bullet lists (- / * / •)
    if (/^\s*[-*•]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) {
        items.push(lines[i++].replace(/^\s*[-*•]\s+/, ""))
      }
      const listKey = k++
      nodes.push(
        <ul key={listKey} className="my-1.5 space-y-1.5">
          {items.map((t, j) => renderBulletItem(t, j, listKey))}
        </ul>
      )
      continue
    }

    if (!line.trim()) {
      i++
      continue
    }

    nodes.push(
      <p key={k++} className="my-1 text-xs leading-relaxed text-slate-700 dark:text-zinc-300 break-words">
        {inline(line, `p${k}`)}
      </p>
    )
    i++
  }

  return <div className="space-y-1">{nodes}</div>
}
