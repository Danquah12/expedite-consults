/**
 * Shared fuzzy & prefix-prioritized member search matcher for ConnectLn
 * (Calls directory, In-call Add People / Invite, Mail & Chat, and Messaging Dock).
 */

export function isTokenEditDistanceAtMostOne(a: string, b: string): boolean {
  if (a === b) return true
  const la = a.length
  const lb = b.length
  if (Math.abs(la - lb) > 1) return false

  if (la === lb) {
    let diffs = 0
    for (let i = 0; i < la; i++) {
      if (a[i] !== b[i] && ++diffs > 1) return false
    }
    return true
  }

  const shorter = la < lb ? a : b
  const longer = la < lb ? b : a
  let i = 0
  let j = 0
  let skipped = false
  while (i < shorter.length && j < longer.length) {
    if (shorter[i] === longer[j]) {
      i++
      j++
    } else {
      if (skipped) return false
      skipped = true
      j++
    }
  }
  return true
}

export function scoreMemberSearchMatch(
  fields: Array<string | undefined | null>,
  rawQuery: string
): number {
  const query = String(rawQuery || "").trim().toLowerCase()
  if (!query) return 1

  const tokens = query.split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return 1

  const nonEmptyFields = fields
    .map((f) => String(f || "").trim().toLowerCase())
    .filter(Boolean)
  if (nonEmptyFields.length === 0) return 0

  let totalScore = 0

  for (const token of tokens) {
    const compactToken = token.replace(/[^a-z0-9]/g, "")
    let tokenBest = 0

    for (const field of nonEmptyFields) {
      const words = field.match(/[a-z0-9]+/g) || []
      for (const word of words) {
        if (word.startsWith(token)) {
          tokenBest = Math.max(tokenBest, 5)
        }
      }

      if (tokenBest < 3) {
        const compactField = field.replace(/[^a-z0-9]/g, "")
        if (
          field.includes(token) ||
          (compactToken.length >= 2 && compactField.includes(compactToken))
        ) {
          tokenBest = Math.max(tokenBest, 3)
        }
      }

      if (tokenBest < 1 && token.length >= 3) {
        for (const word of words) {
          if (
            isTokenEditDistanceAtMostOne(token, word) ||
            (word.length >= token.length &&
              isTokenEditDistanceAtMostOne(token, word.slice(0, token.length))) ||
            (word.length >= token.length + 1 &&
              isTokenEditDistanceAtMostOne(token, word.slice(0, token.length + 1)))
          ) {
            tokenBest = Math.max(tokenBest, 1)
            break
          }
        }
      }

      if (tokenBest === 5) break
    }

    if (tokenBest === 0) return 0
    totalScore += tokenBest
  }

  const primaryField = String(fields[0] || "").trim().toLowerCase()
  if (primaryField.startsWith(query)) {
    totalScore += 2
  }

  return totalScore
}

export function filterAndRankMembers<T>(
  items: T[],
  rawQuery: string,
  getFields: (item: T) => Array<string | undefined | null>
): T[] {
  const trimmed = String(rawQuery || "").trim()
  if (!trimmed) return items

  return items
    .map((item, idx) => ({
      item,
      idx,
      score: scoreMemberSearchMatch(getFields(item), trimmed),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.idx - b.idx)
    .map((entry) => entry.item)
}
