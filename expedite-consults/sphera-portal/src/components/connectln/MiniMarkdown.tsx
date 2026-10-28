"use client"

import React from "react"

/** Tiny dependency-free markdown renderer for Noctis replies: headings, bold/italic/code, lists, quotes, tables, fences. */

function inline(text: string, keyBase: string): React.ReactNode[] {
  const out: React.ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|`[^`]+`|_[^_\s][^_]*_|\*[^*\s][^*]*\*)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const tok = m[0]
    const key = `${keyBase}-${i++}`
    if (tok.startsWith("**")) out.push(<strong key={key} className="font-bold">{tok.slice(2, -2)}</strong>)
    else if (tok.startsWith("`")) out.push(<code key={key} className="rounded bg-zinc-200/70 dark:bg-zinc-700 px-1 py-0.5 font-mono text-[11px]">{tok.slice(1, -1)}</code>)
    else out.push(<em key={key}>{tok.slice(1, -1)}</em>)
    last = m.index + tok.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export function MiniMarkdown({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n")
  const nodes: React.ReactNode[] = []
  let i = 0
  let k = 0
  while (i < lines.length) {
    const line = lines[i]
    if (/^```/.test(line)) {
      const buf: string[] = []
      i++
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++])
      i++
      nodes.push(<pre key={k++} className="my-2 overflow-x-auto rounded-lg bg-zinc-900 text-zinc-100 p-3 text-[11px] font-mono">{buf.join("\n")}</pre>)
      continue
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line)
    if (h) {
      const level = h[1].length
      const cls = level === 1 ? "text-base font-extrabold mt-1 mb-1.5" : level === 2 ? "text-[13px] font-bold mt-3 mb-1 text-[#0A66C2] dark:text-sky-400" : "text-xs font-bold mt-2 mb-1"
      nodes.push(<div key={k++} className={cls}>{inline(h[2], `h${k}`)}</div>)
      i++
      continue
    }
    if (/^>\s?/.test(line)) {
      const buf: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""))
      nodes.push(<div key={k++} className="my-2 border-l-4 border-[#0A66C2]/60 bg-[#0A66C2]/5 pl-3 py-1.5 rounded-r-md italic">{inline(buf.join(" "), `q${k}`)}</div>)
      continue
    }
    if (/^\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const cells = (l: string) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim())
      const head = cells(line)
      i += 2
      const rows: string[][] = []
      while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]))
      nodes.push(
        <div key={k++} className="my-2 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead><tr className="bg-zinc-100 dark:bg-zinc-800">{head.map((c, j) => <th key={j} className="p-2 font-bold">{inline(c, `th${j}`)}</th>)}</tr></thead>
            <tbody>{rows.map((r, ri) => <tr key={ri} className="border-t border-zinc-200 dark:border-zinc-700">{r.map((c, ci) => <td key={ci} className="p-2">{inline(c, `td${ri}-${ci}`)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )
      continue
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+\.\s+/, ""))
      nodes.push(
        <ol key={k++} className="my-1.5 space-y-2">
          {items.map((t, j) => (
            <li key={j} className="flex gap-2">
              <span className="shrink-0 h-5 w-5 rounded-full bg-[#0A66C2] text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{j + 1}</span>
              <span className="min-w-0">{inline(t, `ol${j}`)}</span>
            </li>
          ))}
        </ol>
      )
      continue
    }
    if (/^\s*[-*•]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*•]\s+/, ""))
      nodes.push(
        <ul key={k++} className="my-1.5 space-y-1 list-disc pl-5">
          {items.map((t, j) => <li key={j}>{inline(t, `ul${j}`)}</li>)}
        </ul>
      )
      continue
    }
    if (!line.trim()) { i++; continue }
    nodes.push(<p key={k++} className="my-1 whitespace-pre-line">{inline(line, `p${k}`)}</p>)
    i++
  }
  return <div className="space-y-0.5">{nodes}</div>
}
