import { getDb } from "./db"
import {
  Person,
  NormalizedPersonCandidate,
  RankedMatchCandidate,
  ImageMatchResult,
  RejectedMatch,
  MatchConfidence
} from "./types"
import { searchWikidataPeople, lookupWikidataPerson } from "./providers/wikidata"
import { resolvePersonPrimaryImage } from "./providers/wikimedia"
import { normalizePersonName } from "./duplicate-detector"
import { getPersonById, addPersonImage } from "./service"
import crypto from "node:crypto"

function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`
}

/**
 * Retrieves all rejected image matches for a person
 */
export function getRejectedMatches(personId: string): RejectedMatch[] {
  const db = getDb()
  const rows = db
    .prepare("SELECT * FROM rejected_image_matches WHERE person_id = ? ORDER BY created_at DESC")
    .all(personId) as any[]

  return rows.map((r) => ({
    id: r.id,
    personId: r.person_id,
    provider: r.provider,
    externalId: r.external_id || null,
    url: r.url,
    reason: r.reason || null,
    rejectedBy: r.rejected_by || "system",
    createdAt: r.created_at
  }))
}

/**
 * Stores a rejected image match to avoid repeatedly suggesting or attaching it
 */
export function recordRejectedMatch(input: {
  personId: string
  provider: "wikidata" | "wikimedia" | "local" | "community" | "external"
  externalId?: string | null
  url: string
  reason: string
  rejectedBy?: string
}): RejectedMatch {
  const db = getDb()
  const id = generateId("rej")
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO rejected_image_matches (
      id, person_id, provider, external_id, url, reason, rejected_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.personId,
    input.provider,
    input.externalId || null,
    input.url,
    input.reason,
    input.rejectedBy || "system",
    now
  )

  return {
    id,
    personId: input.personId,
    provider: input.provider,
    externalId: input.externalId || null,
    url: input.url,
    reason: input.reason,
    rejectedBy: input.rejectedBy || "system",
    createdAt: now
  }
}

/**
 * Multi-factor ranking algorithm that evaluates candidate identity against target person.
 * Never assumes a matching name alone proves image identity.
 */
export function rankCandidateIdentity(
  target: Person,
  candidate: NormalizedPersonCandidate,
  rejectedMatches: RejectedMatch[] = []
): RankedMatchCandidate {
  let nameMatchScore = 0
  let entityTypeScore = 0
  let categoryScore = 0
  let metadataScore = 0
  let aliasBonus = 0
  let penalties = 0

  const targetNorm = normalizePersonName(target.name)
  const candidateNorm = normalizePersonName(candidate.name)
  const targetAliases = (target.aliases || []).map(normalizePersonName)
  const candidateAliases = (candidate.aliases || []).map(normalizePersonName)

  // 1. Name Match Scoring (max 35 pts)
  if (targetNorm === candidateNorm) {
    nameMatchScore = 35
  } else if (targetAliases.includes(candidateNorm) || candidateAliases.includes(targetNorm)) {
    nameMatchScore = 30
    aliasBonus = 5
  } else if (candidateNorm.includes(targetNorm) || targetNorm.includes(candidateNorm)) {
    nameMatchScore = 20
  } else {
    nameMatchScore = 5
  }

  // 2. Entity Type Scoring (max 20 pts)
  const targetIsFantasy = target.category === "fantasy"
  if (targetIsFantasy && candidate.isFictional) {
    entityTypeScore = 20
  } else if (!targetIsFantasy && !candidate.isFictional) {
    entityTypeScore = 20
  } else {
    // Mismatch in fictional status (e.g. real actor vs anime character with same name)
    entityTypeScore = 5
    penalties += 20
  }

  // Check for disambiguation or non-person concepts in description
  const descLower = (candidate.description || "").toLowerCase()
  if (
    descLower.includes("disambiguation") ||
    descLower.includes("filmography") ||
    descLower.includes("album") ||
    descLower.includes("song") ||
    descLower.includes("genus")
  ) {
    penalties += 40
  }

  // 3. Category & Occupation Alignment (max 25 pts)
  if (target.category === candidate.category) {
    categoryScore = 25
  } else if (
    (target.category === "hollywood" && candidate.category === "bollywood") ||
    (target.category === "bollywood" && candidate.category === "hollywood")
  ) {
    categoryScore = 15 // Close film industry overlap
  } else if (target.category === "popstars" && descLower.includes("singer")) {
    categoryScore = 20
  } else if (candidate.category !== "other") {
    categoryScore = 10
  } else {
    categoryScore = 5
  }

  // Check gender consistency
  if (target.gender && candidate.gender && candidate.gender !== "unknown") {
    if (target.gender !== candidate.gender) {
      penalties += 45 // Severe penalty for gender mismatch
    }
  }

  // 4. Portrait & Image Metadata (max 20 pts)
  if (candidate.hasPortrait && candidate.imageReferences.length > 0) {
    metadataScore += 15
    if (candidate.primaryCandidateImage?.verificationStatus === "verified") {
      metadataScore += 5
    }
  } else {
    metadataScore = 0
  }

  // Check prior rejection list
  const primaryImgUrl = candidate.primaryCandidateImage?.url || ""
  const matchedRejection = rejectedMatches.find(
    (rej) =>
      rej.externalId === candidate.externalId ||
      (primaryImgUrl && rej.url === primaryImgUrl)
  )

  const isRejectedPreviously = Boolean(matchedRejection)
  if (isRejectedPreviously) {
    penalties += 60 // Heavy penalty for previously rejected portrait
  }

  // Compute final score clamped to 0..100
  const rawScore = nameMatchScore + entityTypeScore + categoryScore + metadataScore + aliasBonus - penalties
  const score = Math.max(0, Math.min(100, rawScore))

  // Determine Confidence
  let confidence: MatchConfidence = "MISMATCHED"
  let requiresHumanReview = false
  let reasoning = ""

  if (isRejectedPreviously) {
    confidence = "MISMATCHED"
    reasoning = `Candidate previously rejected: ${matchedRejection?.reason || "Mismatched portrait"}`
  } else if (penalties >= 35 || score < 50) {
    confidence = "MISMATCHED"
    reasoning = `Low match score (${score}/100) or high penalty (${penalties} pts). Likely different entity or wrong gender.`
  } else if (score >= 82) {
    confidence = "HIGH"
    reasoning = `Strong multi-factor match (${score}/100): exact name match, aligned category (${candidate.category}), and verified portrait.`
  } else {
    confidence = "AMBIGUOUS"
    requiresHumanReview = true
    reasoning = `Ambiguous match (${score}/100): matching name but uncertain entity distinction or potential namesake. Human review required.`
  }

  return {
    candidate,
    score,
    confidence,
    scoreBreakdown: {
      nameMatchScore,
      entityTypeScore,
      categoryScore,
      metadataScore,
      aliasBonus,
      penalties
    },
    isRejectedPreviously,
    rejectionReason: matchedRejection?.reason || undefined,
    requiresHumanReview,
    reasoning
  }
}

/**
 * Searches providers using the canonical name and aliases, ranks candidates,
 * flags ambiguous matches for review, and prevents publishing mismatched portraits.
 */
export async function matchImageForPerson(
  personId: string,
  options: { autoAttachHighConfidence?: boolean } = {}
): Promise<ImageMatchResult> {
  const person = getPersonById(personId)
  if (!person) {
    throw new Error(`Person with ID ${personId} not found`)
  }

  const rejectedMatches = getRejectedMatches(personId)

  // 1. Search providers with canonical name and prominent aliases
  const searchTerms = [person.name, ...(person.aliases || [])].filter(Boolean)
  const candidateMap = new Map<string, NormalizedPersonCandidate>()

  for (const term of searchTerms) {
    try {
      const results = await searchWikidataPeople(term, { limit: 5 })
      for (const res of results) {
        if (!candidateMap.has(res.externalId)) {
          candidateMap.set(res.externalId, res)
        }
      }
    } catch (err) {
      console.error(`Search failed for term "${term}":`, err)
    }
  }

  const rawCandidates = Array.from(candidateMap.values())

  // Parallel resolve primary candidate image metadata for image-backed candidates
  await Promise.all(
    rawCandidates.map(async (c) => {
      if (c.hasPortrait && c.imageReferences.length > 0 && !c.primaryCandidateImage) {
        try {
          c.primaryCandidateImage = await resolvePersonPrimaryImage(c.imageReferences, c.name)
        } catch {
          c.primaryCandidateImage = null
        }
      }
    })
  )

  // 2. Rank candidates using multi-factor identity scoring
  const ranked = rawCandidates
    .map((c) => rankCandidateIdentity(person, c, rejectedMatches))
    .sort((a, b) => b.score - a.score)

  // 3. Ambiguity check: if top 2 candidates have very close scores, flag as ambiguous!
  if (ranked.length >= 2 && ranked[0].score >= 70 && ranked[1].score >= 65) {
    const diff = ranked[0].score - ranked[1].score
    if (diff < 15) {
      ranked[0].confidence = "AMBIGUOUS"
      ranked[0].requiresHumanReview = true
      ranked[0].reasoning += ` Ambiguous match: close competitor entity (${ranked[1].candidate.name} - ${ranked[1].candidate.externalId}) with score ${ranked[1].score}.`
    }
  }

  const topCandidate = ranked[0] || null

  // 4. Acceptance Criteria: NEVER automatically publish ambiguous or mismatched portraits
  if (!topCandidate || topCandidate.confidence === "MISMATCHED") {
    return {
      personId: person.id,
      personName: person.name,
      status: "no_match",
      selectedCandidate: topCandidate,
      rankedCandidates: ranked
    }
  }

  if (topCandidate.confidence === "AMBIGUOUS") {
    // If ambiguous, we flag for human review and NEVER auto-publish as approved primary
    return {
      personId: person.id,
      personName: person.name,
      status: "ambiguous_review_needed",
      selectedCandidate: topCandidate,
      rankedCandidates: ranked
    }
  }

  // 5. High Confidence Match: safe to auto-attach if requested
  let attachedImage = null
  if (options.autoAttachHighConfidence && topCandidate.candidate.primaryCandidateImage) {
    const img = topCandidate.candidate.primaryCandidateImage
    attachedImage = addPersonImage(person.id, {
      url: img.url,
      thumbnailUrl: img.thumbnailUrl,
      provider: "wikimedia",
      externalId: img.fileName,
      sourceUrl: img.sourcePageUrl,
      license: img.license,
      licenseUrl: img.licenseUrl,
      author: img.author,
      attribution: img.formattedAttribution,
      isPrimary: true,
      verificationStatus: img.verificationStatus,
      moderationStatus: "approved"
    })
  }

  return {
    personId: person.id,
    personName: person.name,
    status: "matched",
    selectedCandidate: topCandidate,
    rankedCandidates: ranked,
    attachedImage
  }
}
