with open("noctis-ai/src/components/noctis/NoctisDesk.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_btn = 'onClick={() => handleOpenSovereignSuite("noctis-science", "Evaluate genomics, CRISPR off-target cleavage scores, and molecular dynamics")}'
new_btn = 'onClick={() => setScienceModalOpen(true)}'

if old_btn not in content:
    print("Error: old_btn not found")
else:
    content = content.replace(old_btn, new_btn)
    print("Replaced old_btn successfully")

old_mount = '''      <NoctisDefenseModal
        open={defenseModalOpen}
        onClose={() => setDefenseModalOpen(false)}
        onOpenInCanvas={(md, title) => openInCanvas(title || "Noctis Defense Intelligence Briefing", md)}
        onInsertToChat={(text) => setDraft(text)}
      />'''

new_mount = '''      <NoctisDefenseModal
        open={defenseModalOpen}
        onClose={() => setDefenseModalOpen(false)}
        onOpenInCanvas={(md, title) => openInCanvas(title || "Noctis Defense Intelligence Briefing", md)}
        onInsertToChat={(text) => setDraft(text)}
      />
      <NoctisScienceModal
        open={scienceModalOpen}
        onClose={() => setScienceModalOpen(false)}
        onOpenInCanvas={(md, title) => openInCanvas(title || "Noctis Science Research Dossier", md)}
        onInsertToChat={(text) => setDraft(text)}
      />'''

if old_mount in content:
    content = content.replace(old_mount, new_mount)
    print("Mounted NoctisScienceModal successfully")
else:
    # Try normalizing newlines
    old_mount_crlf = old_mount.replace("\n", "\r\n")
    new_mount_crlf = new_mount.replace("\n", "\r\n")
    if old_mount_crlf in content:
        content = content.replace(old_mount_crlf, new_mount_crlf)
        print("Mounted NoctisScienceModal (CRLF) successfully")
    else:
        print("Error: old_mount not found")

with open("noctis-ai/src/components/noctis/NoctisDesk.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Done updating NoctisDesk.tsx")
