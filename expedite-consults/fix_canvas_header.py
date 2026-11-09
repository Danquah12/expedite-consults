import os

p = 'noctis-ai/src/components/noctis/NoctisCanvas.tsx'
with open(p, 'r', encoding='utf-8') as f:
    content = f.read()

old_header = '''      {/* Top Header Bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4 bg-[#1a1a1a]">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
              modeBadge.color
            )}
          >
            <ModeIcon className="size-3.5" />
            {modeBadge.label}
          </span>
          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={() => {
                setEditingTitle(false);
                if (titleDraft.trim()) onTitleChange(titleDraft.trim());
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditingTitle(false);
                  if (titleDraft.trim()) onTitleChange(titleDraft.trim());
                } else if (e.key === "Escape") {
                  setTitleDraft(title);
                  setEditingTitle(false);
                }
              }}
              className="h-7 w-48 sm:w-64 rounded-lg bg-black/40 px-2 text-sm font-semibold text-zinc-100 outline-none ring-1 ring-[#e4b86a]"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingTitle(true)}
              className="group flex max-w-[200px] sm:max-w-xs items-center gap-1.5 truncate text-left text-sm font-semibold text-zinc-200 hover:text-white"
              title="Click to rename artifact"
            >
              <span className="truncate">{title || "Noctis Artifact"}</span>
              <Pencil className="size-3 shrink-0 text-zinc-500 group-hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>

        {/* View Toggles & Actions */}
        <div className="flex items-center gap-1.5">
          {/* View mode switcher */}
          <div className="hidden sm:inline-flex rounded-full bg-black/30 p-0.5 text-xs ring-1 ring-white/10">
            <button
              type="button"
              onClick={() => setView("preview")}
              className={cn(
                "rounded-full px-2.5 py-1 font-medium transition",
                view === "preview" ? "bg-white/15 text-white" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => setView("edit")}
              className={cn(
                "rounded-full px-2.5 py-1 font-medium transition",
                view === "edit" ? "bg-white/15 text-white" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setView("split")}
              className={cn(
                "rounded-full px-2.5 py-1 font-medium transition",
                view === "split" ? "bg-white/15 text-white" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Split
            </button>
            <button
              type="button"
              onClick={() => setView("diff")}
              className={cn(
                "rounded-full px-2.5 py-1 font-medium transition flex items-center gap-1",
                view === "diff" ? "bg-white/15 text-white" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <GitCompare className="size-3" />
              Diff
            </button>
          </div>

          {/* Undo / Redo */}
          <button
            type="button"
            disabled={historyIndex <= 0}
            onClick={handleUndo}
            title="Undo edit"
            className="grid size-8 place-items-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
          >
            <Undo2 className="size-4" />
          </button>
          <button
            type="button"
            disabled={historyIndex >= history.length - 1}
            onClick={handleRedo}
            title="Redo edit"
            className="grid size-8 place-items-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
          >
            <Redo2 className="size-4" />
          </button>'''

new_header = '''      {/* Top Header Bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-3 sm:px-4 bg-[#1a1a1a] gap-2 min-w-0">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2 sm:px-2.5 py-0.5 text-xs font-semibold shrink-0 whitespace-nowrap",
              modeBadge.color
            )}
          >
            <ModeIcon className="size-3.5 shrink-0" />
            <span className="hidden sm:inline">{modeBadge.label}</span>
          </span>
          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={() => {
                setEditingTitle(false);
                if (titleDraft.trim()) onTitleChange(titleDraft.trim());
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditingTitle(false);
                  if (titleDraft.trim()) onTitleChange(titleDraft.trim());
                } else if (e.key === "Escape") {
                  setTitleDraft(title);
                  setEditingTitle(false);
                }
              }}
              className="h-7 flex-1 min-w-0 max-w-sm rounded-lg bg-black/40 px-2 text-sm font-semibold text-zinc-100 outline-none ring-1 ring-[#e4b86a]"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingTitle(true)}
              className="group flex flex-1 min-w-0 items-center gap-1.5 truncate text-left text-sm font-semibold text-zinc-200 hover:text-white"
              title={`${title || "Noctis Artifact"} (Click to rename)`}
            >
              <span className="truncate">{title || "Noctis Artifact"}</span>
              <Pencil className="size-3 shrink-0 text-zinc-500 group-hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>

        {/* View Toggles & Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* View mode switcher */}
          <div className="inline-flex rounded-full bg-black/30 p-0.5 text-xs ring-1 ring-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setView("preview")}
              className={cn(
                "rounded-full px-2 sm:px-2.5 py-1 font-medium transition whitespace-nowrap",
                view === "preview" ? "bg-white/15 text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => setView("edit")}
              className={cn(
                "rounded-full px-2 sm:px-2.5 py-1 font-medium transition whitespace-nowrap",
                view === "edit" ? "bg-white/15 text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setView("split")}
              className={cn(
                "hidden md:inline-flex rounded-full px-2 sm:px-2.5 py-1 font-medium transition whitespace-nowrap",
                view === "split" ? "bg-white/15 text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Split
            </button>
            <button
              type="button"
              onClick={() => setView("diff")}
              className={cn(
                "hidden lg:inline-flex rounded-full px-2 sm:px-2.5 py-1 font-medium transition items-center gap-1 whitespace-nowrap",
                view === "diff" ? "bg-white/15 text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <GitCompare className="size-3 shrink-0" />
              Diff
            </button>
          </div>

          {/* Undo / Redo - shown only when editing */}
          {(view === "edit" || view === "split") && (
            <>
              <button
                type="button"
                disabled={historyIndex <= 0}
                onClick={handleUndo}
                title="Undo edit"
                className="grid size-8 place-items-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-30 shrink-0"
              >
                <Undo2 className="size-4" />
              </button>
              <button
                type="button"
                disabled={historyIndex >= history.length - 1}
                onClick={handleRedo}
                title="Redo edit"
                className="grid size-8 place-items-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-30 shrink-0"
              >
                <Redo2 className="size-4" />
              </button>
            </>
          )}'''

norm_content = content.replace('\r\n', '\n')
norm_old_header = old_header.replace('\r\n', '\n')
norm_new_header = new_header.replace('\r\n', '\n')

assert norm_old_header in norm_content, 'Old header not found in NoctisCanvas.tsx'
norm_content = norm_content.replace(norm_old_header, norm_new_header, 1)

with open(p, 'w', encoding='utf-8') as f:
    f.write(norm_content)

print('Successfully updated NoctisCanvas.tsx header!')
