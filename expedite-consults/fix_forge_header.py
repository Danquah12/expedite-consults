import os

p = 'noctis-ai/src/components/noctis/NoctisForgeTab.tsx'
with open(p, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix header pills
old_header = '''        <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4 bg-[#141414]">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              title={sidebarOpen ? "Hide Explorer sidebar" : "Show Explorer sidebar (Recents & Projects)"}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer",
                sidebarOpen
                  ? "bg-white/15 text-white"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              )}
            >
              <PanelLeft className="size-3.5" />
              <span>{sidebarOpen ? "Hide Explorer" : "Explorer"}</span>
              {!sidebarOpen && recents.length > 0 && (
                <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] text-zinc-400 font-mono">
                  {recents.length}
                </span>
              )}
            </button>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-zinc-500 font-medium">Target:</span>
              <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-[#e4b86a] border border-white/10 text-[11px]">
                {targetRepo}/{targetScope}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              XTRIKE Verified
            </span>
            <button
              type="button"
              onClick={() => setFactoryStudioOpen(true)}
              className="rounded-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 px-3 py-1 text-xs font-bold text-sky-300 flex items-center gap-1.5 transition shadow-xs"
            >
              <Sparkles className="size-3.5" />

              <span>Launch Factory Studio</span>
            </button>
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
        </header>'''

new_header = '''        <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-3 sm:px-4 bg-[#141414] gap-2 min-w-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink">
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              title={sidebarOpen ? "Hide Explorer sidebar" : "Show Explorer sidebar (Recents & Projects)"}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2 sm:px-2.5 py-1 text-xs font-medium transition cursor-pointer shrink-0 whitespace-nowrap",
                sidebarOpen
                  ? "bg-white/15 text-white"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              )}
            >
              <PanelLeft className="size-3.5 shrink-0" />
              <span>{sidebarOpen ? "Hide Explorer" : "Explorer"}</span>
              {!sidebarOpen && recents.length > 0 && (
                <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] text-zinc-400 font-mono">
                  {recents.length}
                </span>
              )}
            </button>
            <div className="h-4 w-px bg-white/10 shrink-0" />
            <div className="flex items-center gap-1 text-xs shrink-0 min-w-0">
              <span className="text-zinc-500 font-medium hidden sm:inline shrink-0">Target:</span>
              <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-[#e4b86a] border border-white/10 text-[11px] shrink-0 whitespace-nowrap truncate max-w-[125px] sm:max-w-none">
                {targetRepo}/{targetScope}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 sm:px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 shrink-0 whitespace-nowrap">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="hidden sm:inline">XTRIKE Verified</span>
              <span className="sm:hidden">Verified</span>
            </span>
            <button
              type="button"
              onClick={() => setFactoryStudioOpen(true)}
              className="rounded-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 px-2.5 sm:px-3 py-1 text-xs font-bold text-sky-300 flex items-center gap-1.5 transition shadow-xs shrink-0 whitespace-nowrap"
            >
              <Sparkles className="size-3.5 shrink-0" />
              <span className="hidden md:inline">Launch Factory Studio</span>
              <span className="md:hidden">Studio</span>
            </button>
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition shrink-0"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
        </header>'''

# Normalize newlines for comparison
norm_content = content.replace('\r\n', '\n')
norm_old_header = old_header.replace('\r\n', '\n')
norm_new_header = new_header.replace('\r\n', '\n')

assert norm_old_header in norm_content, 'Old header block not found in NoctisForgeTab.tsx'
norm_content = norm_content.replace(norm_old_header, norm_new_header, 1)

# Fix Architect &amp; Build
norm_content = norm_content.replace(
    'Architect &amp; Build Sovereign Systems',
    'Architect & Build Sovereign Systems'
)

with open(p, 'w', encoding='utf-8') as f:
    f.write(norm_content)

print('Successfully updated NoctisForgeTab.tsx!')
