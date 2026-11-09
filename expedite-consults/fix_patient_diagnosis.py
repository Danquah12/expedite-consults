import os

p = 'noctis-ai/src/components/noctis/NoctisPatientDiagnosisModal.tsx'
with open(p, 'r', encoding='utf-8') as f:
    content = f.read()

target = 'const tierText = (item.tier || (isPrimary ? "PRIMARY_HYPOTHESIS" : isMustNotMiss ? "MUST_NOT_MISS_RULEOUT" : "ALTERNATIVE")).replace(/_/g, " ");'

replacement = '''const isPrimary = (item as any)?.tier === "TIER_1_PRIMARY" || (item as any)?.category === "PRIMARY_HYPOTHESIS";
                  const isMustNotMiss = (item as any)?.tier === "TIER_2_MUST_NOT_MISS" || (item as any)?.category === "MUST_NOT_MISS_RULEOUT";
                  const rawTier = typeof (item as any)?.tier === "string" && (item as any)?.tier
                    ? (item as any).tier
                    : isPrimary
                    ? "PRIMARY_HYPOTHESIS"
                    : isMustNotMiss
                    ? "MUST_NOT_MISS_RULEOUT"
                    : "ALTERNATIVE";
                  const tierText = String(rawTier).replace(/_/g, " ");'''

# Find the lines
lines = content.split('\n')
new_lines = []
found = False
for line in lines:
    if 'const isPrimary = item.tier === "TIER_1_PRIMARY"' in line:
        continue
    if 'const isMustNotMiss = item.tier === "TIER_2_MUST_NOT_MISS"' in line:
        continue
    if 'const tierText = (item.tier || (isPrimary ?' in line:
        indent = line[:line.find('const tierText')]
        new_lines.append(indent + replacement.replace('\n                  ', '\n' + indent))
        found = True
    else:
        new_lines.append(line)

if found:
    with open(p, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))
    print('Successfully updated NoctisPatientDiagnosisModal.tsx')
else:
    print('Target not found')
