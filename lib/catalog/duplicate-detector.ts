/**
 * Safe duplicate detection & name normalization for catalog entities
 */

export function normalizePersonName(name: string): string {
  if (!name) return ""
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents/diacritics
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"?]/g, " ") // Replace punctuation with space
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim()
}

export function extractBaseNameAndAliases(rawName: string): { baseName: string; aliases: string[] } {
  const aliases: string[] = []
  const trimmed = rawName.trim()

  // Detect patterns like "Nami (One Piece)" or "Batman (Bruce Wayne)"
  const parenMatch = trimmed.match(/^(.+?)\s*\((.+?)\)$/)
  if (parenMatch) {
    const main = parenMatch[1].trim()
    const inside = parenMatch[2].trim()
    aliases.push(trimmed)
    aliases.push(inside)
    return { baseName: main, aliases }
  }

  return { baseName: trimmed, aliases }
}

export interface DuplicateCheckResult {
  isDuplicate: boolean
  matchedPersonId?: string
  matchType?: "EXACT_EXTERNAL_ID" | "EXACT_NORMALIZED_NAME" | "ALIAS_MATCH" | "NONE"
  confidence: "HIGH" | "MEDIUM" | "NONE"
}

export function evaluateDuplicateMatch(
  candidate: {
    name: string
    provider?: string
    externalId?: string | null
    aliases?: string[]
  },
  existingPeople: Array<{
    id: string
    name: string
    normalizedName: string
    provider: string
    externalId?: string | null
    aliases?: string[]
  }>
): DuplicateCheckResult {
  // 1. Check exact Provider + External ID
  if (candidate.provider && candidate.externalId) {
    const extMatch = existingPeople.find(
      (p) => p.provider === candidate.provider && p.externalId === candidate.externalId
    )
    if (extMatch) {
      return {
        isDuplicate: true,
        matchedPersonId: extMatch.id,
        matchType: "EXACT_EXTERNAL_ID",
        confidence: "HIGH"
      }
    }
  }

  const candidateNorm = normalizePersonName(candidate.name)
  if (!candidateNorm) {
    return { isDuplicate: false, confidence: "NONE", matchType: "NONE" }
  }

  // 2. Check exact normalized name
  const nameMatch = existingPeople.find((p) => p.normalizedName === candidateNorm)
  if (nameMatch) {
    return {
      isDuplicate: true,
      matchedPersonId: nameMatch.id,
      matchType: "EXACT_NORMALIZED_NAME",
      confidence: "HIGH"
    }
  }

  // 3. Check aliases
  const candidateAliases = (candidate.aliases || []).map(normalizePersonName).filter(Boolean)

  for (const existing of existingPeople) {
    const existingNorm = existing.normalizedName
    if (candidateAliases.includes(existingNorm)) {
      return {
        isDuplicate: true,
        matchedPersonId: existing.id,
        matchType: "ALIAS_MATCH",
        confidence: "HIGH"
      }
    }

    const existingAliases = (existing.aliases || []).map(normalizePersonName).filter(Boolean)
    if (existingAliases.includes(candidateNorm)) {
      return {
        isDuplicate: true,
        matchedPersonId: existing.id,
        matchType: "ALIAS_MATCH",
        confidence: "HIGH"
      }
    }

    // Shared alias
    const sharedAlias = candidateAliases.find((ca) => existingAliases.includes(ca))
    if (sharedAlias) {
      return {
        isDuplicate: true,
        matchedPersonId: existing.id,
        matchType: "ALIAS_MATCH",
        confidence: "MEDIUM"
      }
    }
  }

  return {
    isDuplicate: false,
    confidence: "NONE",
    matchType: "NONE"
  }
}
