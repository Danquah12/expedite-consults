import os

p = 'noctis-ai/src/components/noctis/NoctisDesk.tsx'
with open(p, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add AlertCircle, AlertTriangle, Info to lucide imports if not present
if 'AlertCircle' not in content:
    content = content.replace(
        'import { Activity, ArrowUp, Bot, Boxes,',
        'import { Activity, AlertCircle, AlertTriangle, Info, ArrowUp, Bot, Boxes,'
    )

# 2. Add break-all break-words to <code> in inlineHtml
old_code_tag = 'held.push(`<code class="rounded bg-[#e4b86a]/15 px-1.5 py-0.5 font-mono text-[13px] text-[#e4b86a]">${code}</code>`);'
new_code_tag = 'held.push(`<code class="rounded bg-[#e4b86a]/15 px-1.5 py-0.5 font-mono text-[12px] sm:text-[13px] text-[#e4b86a] break-all break-words">${code}</code>`);'
assert old_code_tag in content, 'old_code_tag not found'
content = content.replace(old_code_tag, new_code_tag, 1)

# 3. Add alert block parser right before pure blockquote parser
alert_parser_code = '''        // Markdown Alert callouts: [!NOTE], [!TIP], [!IMPORTANT], [!WARNING], [!CAUTION]
        const alertMatch = paragraph.match(/^>?\\s*\\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\\]\\s*([\\s\\S]*)$/i);
        if (alertMatch) {
          const alertType = alertMatch[1].toUpperCase();
          const alertRemaining = alertMatch[2];
          const alertLines = alertRemaining
            ? alertRemaining.split(/\\r?\\n/).map((l) => l.replace(/^>\\s?/, "").trim()).filter(Boolean)
            : [];

          const alertConfig: Record<string, { icon: any; title: string; border: string; bg: string; text: string; badgeBg: string }> = {
            NOTE: { icon: Info, title: "Note", border: "border-sky-500/40", bg: "bg-sky-950/20", text: "text-sky-300", badgeBg: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
            TIP: { icon: Sparkles, title: "Tip", border: "border-emerald-500/40", bg: "bg-emerald-950/20", text: "text-emerald-300", badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
            IMPORTANT: { icon: AlertCircle, title: "Important", border: "border-[#e4b86a]/50", bg: "bg-amber-950/30", text: "text-[#e4b86a]", badgeBg: "bg-[#e4b86a]/20 text-[#e4b86a] border-[#e4b86a]/40" },
            WARNING: { icon: AlertTriangle, title: "Warning", border: "border-amber-500/50", bg: "bg-amber-950/30", text: "text-amber-300", badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
            CAUTION: { icon: ShieldAlert, title: "Caution", border: "border-rose-500/50", bg: "bg-rose-950/25", text: "text-rose-300", badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
          };

          const cfg = alertConfig[alertType] || alertConfig.NOTE;
          const AlertIcon = cfg.icon;

          return (
            <div
              key={`${index}-${p}`}
              className={cn("my-3 rounded-2xl border p-4 shadow-lg backdrop-blur-xs space-y-2.5", cfg.border, cfg.bg)}
            >
              <div className="flex items-center gap-2">
                <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider", cfg.badgeBg)}>
                  <AlertIcon className="size-3.5 shrink-0" />
                  {cfg.title}
                </span>
              </div>
              <div className="space-y-1.5 text-xs sm:text-sm text-zinc-100 leading-relaxed break-words">
                {alertLines.map((line, aIdx) => (
                  <p key={aIdx} dangerouslySetInnerHTML={{ __html: inlineHtml(line) }} />
                ))}
              </div>
            </div>
          );
        }

        // Pure Blockquote (e.g., Scripture Reading or Spoken Manuscript Opening)'''

old_quote_marker = '        // Pure Blockquote (e.g., Scripture Reading or Spoken Manuscript Opening)'
assert old_quote_marker in content, 'old_quote_marker not found'
content = content.replace(old_quote_marker, alert_parser_code, 1)

# 4. Add solid background to top header and Dual-Plane bar
old_header_tag = '<header className="relative z-30 flex h-14 shrink-0 items-center justify-center border-b border-white/10">'
new_header_tag = '<header className="relative z-30 flex h-14 shrink-0 items-center justify-center border-b border-white/10 bg-[#12151c]">'
assert old_header_tag in content, 'old_header_tag not found'
content = content.replace(old_header_tag, new_header_tag, 1)

old_dp_tag = '<div className="flex h-11 shrink-0 items-center justify-between border-b border-white/10 px-2.5 sm:px-4 bg-black/20 backdrop-blur-sm gap-2">'
new_dp_tag = '<div className="flex h-11 shrink-0 items-center justify-between border-b border-white/10 px-2.5 sm:px-4 bg-[#0e1118] gap-2">'
assert old_dp_tag in content, 'old_dp_tag not found'
content = content.replace(old_dp_tag, new_dp_tag, 1)

with open(p, 'w', encoding='utf-8') as f:
    f.write(content)

print('Successfully updated NoctisDesk.tsx!')
