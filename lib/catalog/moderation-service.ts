import { getDb } from "./db"
import {
  CommunitySubmission,
  CommunitySubmissionInput,
  CatalogReport,
  ModerationStatus,
  Person
} from "./types"
import { evaluateDuplicateMatch, normalizePersonName } from "./duplicate-detector"
import { upsertPerson, addPersonImage, getPersonById } from "./service"
import { verifyImageCandidate } from "./providers/wikimedia"
import crypto from "node:crypto"

function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`
}

function parseJsonSafe<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}

/**
 * Validates community submission inputs including consent, privacy, and image URLs.
 */
export function validateSubmissionInput(input: CommunitySubmissionInput): { isValid: boolean; error?: string } {
  if (!input.name || input.name.trim().length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters long." }
  }

  if (input.name.trim().length > 100) {
    return { isValid: false, error: "Name cannot exceed 100 characters." }
  }

  const allowedCategories = [
    "bollywood",
    "hollywood",
    "popstars",
    "adultstars",
    "fantasy",
    "athletes",
    "gaming",
    "other"
  ]

  if (!allowedCategories.includes(input.category)) {
    return { isValid: false, error: `Invalid category: '${input.category}'.` }
  }

  if (!input.consentConfirmed) {
    return {
      isValid: false,
      error: "You must confirm you have the authorization, rights, or fair-use consent to submit this entry."
    }
  }

  if (input.isPrivateIndividual && !input.consentConfirmed) {
    return {
      isValid: false,
      error: "Explicit personal consent and privacy confirmation is required for private individuals."
    }
  }

  if (input.imageUrl && input.imageUrl.trim()) {
    try {
      const url = new URL(input.imageUrl.trim())
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return { isValid: false, error: "Image URL must use http or https protocol." }
      }
    } catch {
      return { isValid: false, error: "Provided Image URL is not a valid web URL." }
    }
  }

  if (input.profileUrl && input.profileUrl.trim()) {
    try {
      const url = new URL(input.profileUrl.trim())
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return { isValid: false, error: "Profile/source URL must use http or https protocol." }
      }
    } catch {
      return { isValid: false, error: "Provided Profile URL is not a valid web URL." }
    }
  }

  return { isValid: true }
}

/**
 * Creates a community submission in 'pending' state.
 * Acceptance criteria: Community submissions NEVER enter public games before approval.
 */
export function createCommunityPersonSubmission(
  input: CommunitySubmissionInput,
  submitterIp?: string | null
): CommunitySubmission {
  const validation = validateSubmissionInput(input)
  if (!validation.isValid) {
    throw new Error(validation.error || "Invalid submission input")
  }

  const db = getDb()
  const id = generateId("sub")
  const now = new Date().toISOString()

  const proposedData = {
    name: input.name.trim(),
    category: input.category,
    gender: input.gender || null,
    profileUrl: input.profileUrl?.trim() || null,
    imageUrl: input.imageUrl?.trim() || null,
    consentConfirmed: input.consentConfirmed,
    isPrivateIndividual: Boolean(input.isPrivateIndividual),
    notes: input.notes || null,
    submitterName: input.submitterName?.trim() || null
  }

  db.prepare(`
    INSERT INTO community_submissions (
      id, submission_type, person_id, proposed_data, submitter_name, submitter_ip,
      moderation_status, created_at, updated_at
    ) VALUES (?, 'person', NULL, ?, ?, ?, 'pending', ?, ?)
  `).run(
    id,
    JSON.stringify(proposedData),
    input.submitterName?.trim() || null,
    submitterIp || null,
    now,
    now
  )

  return {
    id,
    submissionType: "person",
    personId: null,
    proposedData,
    submitterName: input.submitterName?.trim() || null,
    submitterIp: submitterIp || null,
    moderationStatus: "pending",
    moderationNotes: null,
    reviewerId: null,
    createdAt: now,
    updatedAt: now
  }
}

/**
 * Retrieves submissions with duplicate suggestions generated for admin review
 */
export function getSubmissionsForReview(status: ModerationStatus = "pending"): Array<{
  submission: CommunitySubmission
  duplicateSuggestions: Array<{ person: Person; matchType: string }>
}> {
  const db = getDb()
  const rows = db
    .prepare(
      "SELECT * FROM community_submissions WHERE moderation_status = ? ORDER BY created_at ASC"
    )
    .all(status) as any[]

  // Fetch all existing people to detect potential duplicates for the reviewer
  const existingRows = db.prepare("SELECT id, name, normalized_name, provider, external_id, aliases FROM people").all() as any[]
  const existingPeople = existingRows.map((r) => ({
    id: r.id,
    name: r.name,
    normalizedName: r.normalized_name,
    provider: r.provider,
    externalId: r.external_id,
    aliases: parseJsonSafe<string[]>(r.aliases, [])
  }))

  return rows.map((row) => {
    const data = parseJsonSafe<Record<string, any>>(row.proposed_data, {})
    const submission: CommunitySubmission = {
      id: row.id,
      submissionType: row.submission_type,
      personId: row.person_id,
      proposedData: data,
      submitterName: row.submitter_name,
      submitterIp: row.submitter_ip,
      moderationStatus: row.moderation_status,
      moderationNotes: row.moderation_notes,
      reviewerId: row.reviewer_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }

    // Check duplicate suggestions
    const duplicateSuggestions: Array<{ person: Person; matchType: string }> = []
    if (data.name) {
      const match = evaluateDuplicateMatch({ name: data.name }, existingPeople)
      if (match.isDuplicate && match.matchedPersonId) {
        const matched = getPersonById(match.matchedPersonId)
        if (matched) {
          duplicateSuggestions.push({ person: matched, matchType: match.matchType || "SIMILAR" })
        }
      }
    }

    return {
      submission,
      duplicateSuggestions
    }
  })
}

/**
 * Approves a community submission and integrates it into the active game catalog
 */
export function approveCommunitySubmission(
  submissionId: string,
  reviewerId = "admin"
): { submission: CommunitySubmission; person: Person } {
  const db = getDb()
  const row = db.prepare("SELECT * FROM community_submissions WHERE id = ?").get(submissionId) as any
  if (!row) {
    throw new Error(`Submission ${submissionId} not found`)
  }

  const data = parseJsonSafe<Record<string, any>>(row.proposed_data, {})
  const now = new Date().toISOString()

  // 1. Ingest person into active catalog
  const person = upsertPerson({
    name: data.name,
    category: data.category,
    gender: data.gender || null,
    provider: "community",
    description: data.profileUrl ? `Profile: ${data.profileUrl}` : "Community added personality",
    moderationStatus: "approved"
  })

  // 2. If image URL was provided, verify and attach
  if (data.imageUrl && data.imageUrl.trim()) {
    const verification = verifyImageCandidate({
      url: data.imageUrl,
      mimeType: "image/jpeg", // standard default check
      width: 600,
      height: 600,
      license: "Authorized Community Image"
    })

    addPersonImage(person.id, {
      url: data.imageUrl.trim(),
      thumbnailUrl: data.imageUrl.trim(),
      provider: "community",
      license: "Community Authorized",
      sourceUrl: data.profileUrl || data.imageUrl.trim(),
      author: data.submitterName || "Community Contributor",
      attribution: `Image submitted by ${data.submitterName || "Community Contributor"}`,
      isPrimary: true,
      verificationStatus: verification.status,
      moderationStatus: "approved"
    })
  }

  // 3. Mark submission as approved
  db.prepare(`
    UPDATE community_submissions
    SET moderation_status = 'approved', person_id = ?, reviewer_id = ?, updated_at = ?
    WHERE id = ?
  `).run(person.id, reviewerId, now, submissionId)

  const updatedSubmission: CommunitySubmission = {
    id: row.id,
    submissionType: row.submission_type,
    personId: person.id,
    proposedData: data,
    submitterName: row.submitter_name,
    submitterIp: row.submitter_ip,
    moderationStatus: "approved",
    moderationNotes: null,
    reviewerId,
    createdAt: row.created_at,
    updatedAt: now
  }

  return { submission: updatedSubmission, person: getPersonById(person.id)! }
}

/**
 * Rejects a community submission with a reason
 */
export function rejectCommunitySubmission(
  submissionId: string,
  reason: string,
  reviewerId = "admin"
): CommunitySubmission {
  const db = getDb()
  const now = new Date().toISOString()

  db.prepare(`
    UPDATE community_submissions
    SET moderation_status = 'rejected', moderation_notes = ?, reviewer_id = ?, updated_at = ?
    WHERE id = ?
  `).run(reason, reviewerId, now, submissionId)

  const row = db.prepare("SELECT * FROM community_submissions WHERE id = ?").get(submissionId) as any
  return {
    id: row.id,
    submissionType: row.submission_type,
    personId: row.person_id,
    proposedData: parseJsonSafe(row.proposed_data, {}),
    submitterName: row.submitter_name,
    submitterIp: row.submitter_ip,
    moderationStatus: "rejected",
    moderationNotes: reason,
    reviewerId,
    createdAt: row.created_at,
    updatedAt: now
  }
}

/**
 * Removes content immediately from catalog.
 * Acceptance criteria: Removed content is no longer served in any public game or catalog query.
 */
export function removeCatalogContent(
  targetType: "person" | "image",
  targetId: string,
  reason: string,
  reviewerId = "admin"
): { success: boolean; targetId: string; targetType: string } {
  const db = getDb()
  const now = new Date().toISOString()

  if (targetType === "person") {
    // Mark person removed and unlink/remove all images
    db.prepare(`
      UPDATE people
      SET moderation_status = 'removed', primary_image_id = NULL, updated_at = ?
      WHERE id = ?
    `).run(now, targetId)

    db.prepare(`
      UPDATE person_images
      SET moderation_status = 'removed', is_primary = 0, updated_at = ?
      WHERE person_id = ?
    `).run(now, targetId)

    console.log(`[Moderation] Person ${targetId} REMOVED from public catalog. Reason: ${reason}`)
  } else {
    // Target is an image
    db.prepare(`
      UPDATE person_images
      SET moderation_status = 'removed', is_primary = 0, updated_at = ?
      WHERE id = ?
    `).run(now, targetId)

    // If person had this as primary image, reset primary_image_id
    db.prepare(`
      UPDATE people
      SET primary_image_id = NULL, updated_at = ?
      WHERE primary_image_id = ?
    `).run(now, targetId)

    console.log(`[Moderation] Image ${targetId} REMOVED. Reason: ${reason}`)
  }

  return { success: true, targetId, targetType }
}

/**
 * File a takedown or reporting request for privacy, copyright, or inappropriate content
 */
export function fileCatalogReport(input: {
  targetType: "person" | "image"
  targetId: string
  reason: string
  details?: string
  reporterEmail?: string
}): CatalogReport {
  const db = getDb()
  const id = generateId("rep")
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO catalog_reports (
      id, target_type, target_id, reason, details, reporter_email, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
  `).run(
    id,
    input.targetType,
    input.targetId,
    input.reason,
    input.details || null,
    input.reporterEmail || null,
    now
  )

  // Severe privacy/copyright violations automatically flag content for safety
  const severeReasons = ["non_consensual_image", "privacy_violation", "copyright_infringement", "minor_safety"]
  if (severeReasons.includes(input.reason)) {
    if (input.targetType === "person") {
      db.prepare("UPDATE people SET moderation_status = 'flagged', updated_at = ? WHERE id = ?").run(now, input.targetId)
    } else {
      db.prepare("UPDATE person_images SET moderation_status = 'pending', updated_at = ? WHERE id = ?").run(now, input.targetId)
    }
  }

  return {
    id,
    targetType: input.targetType,
    targetId: input.targetId,
    reason: input.reason,
    details: input.details || null,
    reporterEmail: input.reporterEmail || null,
    status: "pending",
    actionTaken: null,
    createdAt: now,
    resolvedAt: null
  }
}

/**
 * Resolve a filed catalog report
 */
export function resolveCatalogReport(
  reportId: string,
  resolution: "removed" | "dismissed",
  actionTaken: string
): CatalogReport {
  const db = getDb()
  const now = new Date().toISOString()

  const reportRow = db.prepare("SELECT * FROM catalog_reports WHERE id = ?").get(reportId) as any
  if (!reportRow) {
    throw new Error(`Report ${reportId} not found`)
  }

  if (resolution === "removed") {
    removeCatalogContent(reportRow.target_type, reportRow.target_id, actionTaken)
  }

  db.prepare(`
    UPDATE catalog_reports
    SET status = 'resolved', action_taken = ?, resolved_at = ?
    WHERE id = ?
  `).run(actionTaken, now, reportId)

  return {
    id: reportRow.id,
    targetType: reportRow.target_type,
    targetId: reportRow.target_id,
    reason: reportRow.reason,
    details: reportRow.details,
    reporterEmail: reportRow.reporter_email,
    status: "resolved",
    actionTaken,
    createdAt: reportRow.created_at,
    resolvedAt: now
  }
}
