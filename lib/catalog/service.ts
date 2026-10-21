import { getDb } from "./db"
import {
  Person,
  PersonImage,
  NormalizedPersonCandidate,
  CatalogSearchParams,
  PaginatedResult,
  CommunitySubmission,
  Category,
  Gender
} from "./types"
import { normalizePersonName, evaluateDuplicateMatch, extractBaseNameAndAliases } from "./duplicate-detector"
import { searchWikidataPeople, lookupWikidataPerson } from "./providers/wikidata"
import {
  resolvePersonPrimaryImage,
  verifyImageCandidate,
  formatImageAttribution,
  PLACEHOLDER_IMAGE_URL
} from "./providers/wikimedia"
import { FEMALE_CELEBRITIES, MALE_CELEBRITIES } from "../game-data/celebrities"
import { EXPANDED_PERSONALITIES } from "./expanded-dataset"
import { seed32kCatalog } from "./seed-32k"
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
 * Hydrates database rows into Person objects with linked images
 */
function mapPersonRow(row: any, images: PersonImage[] = []): Person {
  const primaryImage = images.find((img) => img.id === row.primary_image_id) || images[0] || null

  return {
    id: row.id,
    name: row.name,
    normalizedName: row.normalized_name,
    gender: (row.gender as Gender) || null,
    category: (row.category as Category) || "other",
    tags: parseJsonSafe<string[]>(row.tags, []),
    primaryImageId: row.primary_image_id || null,
    provider: row.provider,
    externalId: row.external_id || null,
    description: row.description || null,
    popularity: row.popularity != null ? Number(row.popularity) : 0,
    country: row.country || null,
    birthYear: row.birth_year != null ? Number(row.birth_year) : null,
    occupations: parseJsonSafe<string[]>(row.occupations, []),
    aliases: parseJsonSafe<string[]>(row.aliases, []),
    moderationStatus: row.moderation_status,
    lastRefreshedAt: row.last_refreshed_at || null,
    refreshError: row.refresh_error || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    primaryImage,
    images
  }
}

function mapImageRow(row: any): PersonImage {
  return {
    id: row.id,
    personId: row.person_id,
    url: row.url,
    thumbnailUrl: row.thumbnail_url || null,
    provider: row.provider,
    externalId: row.external_id || null,
    sourceUrl: row.source_url || null,
    license: row.license || "unknown",
    licenseUrl: row.license_url || null,
    author: row.author || null,
    attribution: row.attribution || null,
    isPrimary: Boolean(row.is_primary),
    width: row.width || null,
    height: row.height || null,
    mimeType: row.mime_type || null,
    fileSize: row.file_size || null,
    verificationStatus: row.verification_status,
    verificationDetails: row.verification_details || null,
    moderationStatus: row.moderation_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

/**
 * Seed the catalog with the initial 54 celebrities from lib/game-data/celebrities.ts
 * Guarantees 100% compatibility with existing games.
 */
export function seedInitialCatalog(): { seeded: number; existing: number } {
  const db = getDb()

  const countRow = db.prepare("SELECT count(*) as total FROM people WHERE provider = 'local'").get() as any
  if (countRow && countRow.total > 0) {
    seedExpandedPersonalities()
    return { seeded: 0, existing: countRow.total }
  }

  const allCelebrities = [
    ...FEMALE_CELEBRITIES.map((c) => ({ ...c, gender: "female" as const })),
    ...MALE_CELEBRITIES.map((c) => ({ ...c, gender: "male" as const }))
  ]

  const insertPerson = db.prepare(`
    INSERT INTO people (
      id, name, normalized_name, gender, category, tags, primary_image_id,
      provider, external_id, description, aliases, moderation_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertImage = db.prepare(`
    INSERT INTO person_images (
      id, person_id, url, thumbnail_url, provider, external_id, source_url,
      license, license_url, author, attribution, is_primary, width, height,
      mime_type, file_size, verification_status, moderation_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  let seededCount = 0
  const now = new Date().toISOString()

  for (const celeb of allCelebrities) {
    const { baseName, aliases } = extractBaseNameAndAliases(celeb.name)
    const norm = normalizePersonName(baseName)
    const personId = generateId("p_local")
    const imageId = generateId("img_local")

    // Default placeholder attribution for initial seed
    const sourceUrl = PLACEHOLDER_IMAGE_URL
    const attribution = `Default portrait for ${celeb.name} (Seed Catalog)`

    insertPerson.run(
      personId,
      celeb.name,
      norm,
      celeb.gender,
      celeb.category,
      JSON.stringify(celeb.tags || []),
      imageId,
      "local",
      `seed_${norm.replace(/\s+/g, "_")}`,
      `${celeb.category.toUpperCase()} personality`,
      JSON.stringify(aliases),
      "approved",
      now,
      now
    )

    insertImage.run(
      imageId,
      personId,
      PLACEHOLDER_IMAGE_URL,
      PLACEHOLDER_IMAGE_URL,
      "local",
      `seed_img_${norm.replace(/\s+/g, "_")}`,
      sourceUrl,
      "Public Domain / Local Seed",
      null,
      "Stir It Up Seed",
      attribution,
      1,
      600,
      600,
      "image/jpeg",
      15000,
      "verified",
      "approved",
      now,
      now
    )

    seededCount++
  }

  console.log(`[Catalog Service] Seeded ${seededCount} celebrities into people catalog.`)
  seedExpandedPersonalities()
  return { seeded: seededCount, existing: 0 }
}

/**
 * Seeds expanded personalities (scientists, tech icons, anime characters, athletes, etc.)
 * with safe deduplication.
 */
export function seedExpandedPersonalities(): { added: number; existing: number } {
  const db = getDb()
  const checkStmt = db.prepare("SELECT id FROM people WHERE normalized_name = ? LIMIT 1")
  const insertPerson = db.prepare(`
    INSERT INTO people (
      id, name, normalized_name, gender, category, tags, primary_image_id,
      provider, external_id, description, aliases, moderation_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insertImage = db.prepare(`
    INSERT INTO person_images (
      id, person_id, url, thumbnail_url, provider, external_id, source_url,
      license, license_url, author, attribution, is_primary, width, height,
      mime_type, file_size, verification_status, moderation_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  let added = 0
  const now = new Date().toISOString()

  for (const person of EXPANDED_PERSONALITIES) {
    const { baseName, aliases } = extractBaseNameAndAliases(person.name)
    const norm = normalizePersonName(baseName)
    const existing = checkStmt.get(norm)
    if (existing) continue

    const personId = generateId("p_exp")
    const imageId = generateId("img_exp")

    insertPerson.run(
      personId,
      person.name,
      norm,
      person.gender,
      person.category,
      JSON.stringify(person.tags || []),
      imageId,
      "local",
      `exp_${norm.replace(/\s+/g, "_")}`,
      person.description,
      JSON.stringify(aliases),
      "approved",
      now,
      now
    )

    insertImage.run(
      imageId,
      personId,
      PLACEHOLDER_IMAGE_URL,
      PLACEHOLDER_IMAGE_URL,
      "local",
      `exp_img_${norm.replace(/\s+/g, "_")}`,
      PLACEHOLDER_IMAGE_URL,
      "Public Domain / Expanded Seed",
      null,
      "Stir It Up Expanded Catalog",
      `Default portrait for ${person.name}`,
      1,
      600,
      600,
      "image/jpeg",
      15000,
      "verified",
      "approved",
      now,
      now
    )
    added++
  }

  if (added > 0) {
    console.log(`[Catalog Service] Seeded ${added} expanded personalities into catalog.`)
  }

  const isTest = process.env.NODE_ENV === "test" || process.argv.some((a) => a.includes("test"))
  const totalCountRow = db.prepare("SELECT count(*) as total FROM people").get() as any
  if (!isTest && totalCountRow && totalCountRow.total < 1000) {
    try {
      const res32k = seed32kCatalog({ logProgress: false })
      if (res32k.insertedPeople > 0) {
        console.log(`[Catalog Service] Auto-ingested ${res32k.insertedPeople} records from 32k personality dataset.`)
      }
    } catch {
      // Non-fatal if dataset file is not present in minimal environments
    }
  }

  return { added, existing: EXPANDED_PERSONALITIES.length - added }
}

export interface BulkAddResult {
  added: Array<{ id: string; name: string; category: string }>
  skippedDuplicates: string[]
  totalAdded: number
}

/**
 * Bulk adds comma-separated or newline-separated names to the catalog with safe deduplication.
 */
export function bulkAddPersons(input: {
  rawNames: string
  category?: string
  addedBy?: string
  gender?: Gender
}): BulkAddResult {
  const db = getDb()
  seedInitialCatalog()

  if (!input.rawNames || !input.rawNames.trim()) {
    return { added: [], skippedDuplicates: [], totalAdded: 0 }
  }

  // Split on commas or newlines, e.g. "Albert Einstein, Marie Curie\nNikola Tesla"
  const rawList = input.rawNames
    .split(/[,;\n\r]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  const added: Array<{ id: string; name: string; category: string }> = []
  const skippedDuplicates: string[] = []
  const seenInBatch = new Set<string>()

  const checkExisting = db.prepare(`
    SELECT id, name FROM people
    WHERE normalized_name = ? OR name COLLATE NOCASE = ?
    LIMIT 1
  `)

  const insertPerson = db.prepare(`
    INSERT INTO people (
      id, name, normalized_name, gender, category, tags, primary_image_id,
      provider, external_id, description, aliases, moderation_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertImage = db.prepare(`
    INSERT INTO person_images (
      id, person_id, url, thumbnail_url, provider, external_id, source_url,
      license, license_url, author, attribution, is_primary, width, height,
      mime_type, file_size, verification_status, moderation_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const now = new Date().toISOString()
  const fallbackCat = (input.category?.toLowerCase() || "other") as Category
  const fallbackGender = input.gender || "unknown"

  for (const rawName of rawList) {
    const { baseName, aliases } = extractBaseNameAndAliases(rawName)
    const norm = normalizePersonName(baseName)

    if (!norm) continue

    // Intra-batch duplicate check
    if (seenInBatch.has(norm)) {
      skippedDuplicates.push(rawName)
      continue
    }
    seenInBatch.add(norm)

    // Database duplicate check
    const existing = checkExisting.get(norm, baseName) as any
    if (existing) {
      skippedDuplicates.push(rawName)
      continue
    }

    // Auto-detect obvious categories
    let cat: Category = fallbackCat
    const lower = baseName.toLowerCase()
    if (lower.includes("einstein") || lower.includes("curie") || lower.includes("tesla") || lower.includes("newton") || lower.includes("scientist") || lower.includes("hawking")) {
      cat = "scientists"
    } else if (lower.includes("jobs") || lower.includes("musk") || lower.includes("gates") || lower.includes("zuck")) {
      cat = "tech"
    }

    const personId = generateId("p_custom")
    const imageId = generateId("img_custom")

    insertPerson.run(
      personId,
      baseName,
      norm,
      fallbackGender,
      cat,
      JSON.stringify(["custom", input.addedBy || "party"]),
      imageId,
      "community",
      `custom_${norm.replace(/\s+/g, "_")}`,
      `Custom added personality: ${baseName}`,
      JSON.stringify(aliases),
      "approved",
      now,
      now
    )

    insertImage.run(
      imageId,
      personId,
      PLACEHOLDER_IMAGE_URL,
      PLACEHOLDER_IMAGE_URL,
      "community",
      `custom_img_${norm.replace(/\s+/g, "_")}`,
      PLACEHOLDER_IMAGE_URL,
      "Public Domain / Custom Entry",
      null,
      input.addedBy || "Party Host",
      `Portrait for ${baseName}`,
      1,
      600,
      600,
      "image/jpeg",
      15000,
      "verified",
      "approved",
      now,
      now
    )

    added.push({ id: personId, name: baseName, category: cat })
  }

  return {
    added,
    skippedDuplicates,
    totalAdded: added.length
  }
}

/**
 * Get paginated list of people with search and filtering
 */
export function getPeople(params: CatalogSearchParams = {}): PaginatedResult<Person> {
  const db = getDb()
  // Ensure default catalog is seeded
  seedInitialCatalog()

  const page = Math.max(1, params.page || 1)
  const limit = Math.min(Math.max(1, params.limit || 20), 5000)
  const offset = (page - 1) * limit

  const whereClauses: string[] = []
  const queryParams: any[] = []

  if (params.category && params.category !== "all") {
    const cat = params.category.toLowerCase().trim()
    if (cat === "adultstars" || cat === "glamour") {
      whereClauses.push("p.category IN ('glamour', 'adultstars')")
    } else if (cat === "popstars" || cat === "singers") {
      whereClauses.push("p.category IN ('singers', 'popstars')")
    } else if (cat === "fantasy" || cat === "anime" || cat === "gaming") {
      whereClauses.push("p.category IN ('fantasy', 'anime', 'gaming')")
    } else if (cat === "hollywood" || cat === "actors") {
      whereClauses.push("p.category IN ('hollywood', 'actors')")
    } else {
      whereClauses.push("p.category = ?")
      queryParams.push(cat)
    }
  }

  if (params.gender && params.gender !== "all" && params.gender !== "mixed") {
    whereClauses.push("p.gender = ?")
    queryParams.push(params.gender.toLowerCase())
  }

  if (params.moderationStatus) {
    whereClauses.push("p.moderation_status = ?")
    queryParams.push(params.moderationStatus)
  } else {
    // Default to approved only for general games & catalog browsing
    whereClauses.push("p.moderation_status = 'approved'")
  }

  if (params.provider) {
    whereClauses.push("p.provider = ?")
    queryParams.push(params.provider)
  }

  if (typeof params.minPopularity === "number") {
    whereClauses.push("p.popularity >= ?")
    queryParams.push(params.minPopularity)
  }

  if (typeof params.maxPopularity === "number") {
    whereClauses.push("p.popularity <= ?")
    queryParams.push(params.maxPopularity)
  }

  if (params.hasImageOnly) {
    whereClauses.push("p.primary_image_id IS NOT NULL")
  }

  if (params.query && params.query.trim()) {
    const q = params.query.trim()
    const norm = normalizePersonName(q)
    whereClauses.push("(p.name LIKE ? OR p.normalized_name LIKE ? OR p.aliases LIKE ?)")
    queryParams.push(`%${q}%`, `%${norm}%`, `%${norm}%`)
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : ""

  // Dynamic sorting
  let orderBySql = "ORDER BY p.name ASC"
  if (params.sortBy === "popularity") {
    const dir = params.sortOrder === "asc" ? "ASC" : "DESC"
    orderBySql = `ORDER BY p.popularity ${dir}, p.name ASC`
  } else if (params.sortBy === "random") {
    orderBySql = "ORDER BY RANDOM()"
  } else if (params.sortBy === "name" && params.sortOrder === "desc") {
    orderBySql = "ORDER BY p.name DESC"
  }

  // Count total matching
  const countRow = db.prepare(`SELECT count(*) as total FROM people p ${whereSql}`).get(...queryParams) as any
  const total = countRow?.total || 0

  // Fetch paginated results with primary image joined
  const peopleRows = db
    .prepare(
      `
    SELECT p.* FROM people p
    ${whereSql}
    ${orderBySql}
    LIMIT ? OFFSET ?
  `
    )
    .all(...queryParams, limit, offset) as any[]

  if (peopleRows.length === 0) {
    return {
      items: [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasNext: false,
      hasPrev: page > 1
    }
  }

  const personIds = peopleRows.map((r) => r.id)
  const placeholders = personIds.map(() => "?").join(",")
  const imageRows = db
    .prepare(
      `
    SELECT * FROM person_images
    WHERE person_id IN (${placeholders})
    ORDER BY is_primary DESC, created_at DESC
  `
    )
    .all(...personIds) as any[]

  const imagesByPerson = new Map<string, PersonImage[]>()
  for (const imgRow of imageRows) {
    const mapped = mapImageRow(imgRow)
    if (!imagesByPerson.has(mapped.personId)) {
      imagesByPerson.set(mapped.personId, [])
    }
    imagesByPerson.get(mapped.personId)!.push(mapped)
  }

  const items = peopleRows.map((r) => mapPersonRow(r, imagesByPerson.get(r.id) || []))
  const totalPages = Math.ceil(total / limit) || 1

  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  }
}

/**
 * Retrieve a single person with all candidate images and provenance details
 */
export function getPersonById(id: string): Person | null {
  const db = getDb()
  const row = db.prepare("SELECT * FROM people WHERE id = ?").get(id) as any
  if (!row) return null

  const imageRows = db
    .prepare(
      `
    SELECT * FROM person_images
    WHERE person_id = ?
    ORDER BY is_primary DESC, created_at DESC
  `
    )
    .all(id) as any[]

  const images = imageRows.map(mapImageRow)
  return mapPersonRow(row, images)
}

/**
 * Safe duplicate detection: Finds an existing person by provider/externalId, normalized name, or aliases
 */
export function findExistingPerson(candidate: {
  name: string
  provider?: string
  externalId?: string | null
  aliases?: string[]
}): Person | null {
  const db = getDb()

  // 1. Direct query by provider and external_id
  if (candidate.provider && candidate.externalId) {
    const row = db
      .prepare("SELECT * FROM people WHERE provider = ? AND external_id = ?")
      .get(candidate.provider, candidate.externalId) as any
    if (row) {
      return getPersonById(row.id)
    }
  }

  // 2. Direct query by exact normalized name
  const norm = normalizePersonName(candidate.name)
  if (norm) {
    const row = db.prepare("SELECT * FROM people WHERE normalized_name = ?").get(norm) as any
    if (row) {
      return getPersonById(row.id)
    }
  }

  // 3. Evaluate across existing people using duplicate detector
  const candidatesRows = db
    .prepare("SELECT id, name, normalized_name, provider, external_id, aliases FROM people")
    .all() as any[]

  const existingPeople = candidatesRows.map((r) => ({
    id: r.id,
    name: r.name,
    normalizedName: r.normalized_name,
    provider: r.provider,
    externalId: r.external_id,
    aliases: parseJsonSafe<string[]>(r.aliases, [])
  }))

  const match = evaluateDuplicateMatch(candidate, existingPeople)
  if (match.isDuplicate && match.matchedPersonId) {
    return getPersonById(match.matchedPersonId)
  }

  return null
}

/**
 * Adds an image source to a person with provenance & verification
 */
export function addPersonImage(
  personId: string,
  image: {
    url: string
    thumbnailUrl?: string | null
    provider: "wikimedia" | "local" | "community" | "external"
    externalId?: string | null
    sourceUrl?: string | null
    license: string
    licenseUrl?: string | null
    author?: string | null
    attribution?: string | null
    isPrimary?: boolean
    width?: number | null
    height?: number | null
    mimeType?: string | null
    fileSize?: number | null
    verificationStatus?: "verified" | "unverified" | "failed"
    verificationDetails?: string | null
    moderationStatus?: "pending" | "approved" | "rejected"
  }
): PersonImage {
  const db = getDb()
  const imageId = generateId("img")
  const now = new Date().toISOString()

  // Run verification if not already performed
  const verification =
    image.verificationStatus ||
    verifyImageCandidate({
      mimeType: image.mimeType || undefined,
      width: image.width || undefined,
      height: image.height || undefined,
      license: image.license,
      url: image.url
    }).status

  const formattedAttribution =
    image.attribution ||
    formatImageAttribution(image.author, image.license, image.sourceUrl || image.url)

  const isPrimary = image.isPrimary ? 1 : 0

  // Check if image with this provider and external_id already exists
  if (image.provider && image.externalId) {
    const existing = db
      .prepare("SELECT * FROM person_images WHERE provider = ? AND external_id = ?")
      .get(image.provider, image.externalId) as any
    if (existing) {
      if (isPrimary === 1) {
        db.prepare("UPDATE person_images SET is_primary = 0 WHERE person_id = ?").run(personId)
        db.prepare("UPDATE person_images SET is_primary = 1, updated_at = ? WHERE id = ?").run(now, existing.id)
        db.prepare("UPDATE people SET primary_image_id = ?, updated_at = ? WHERE id = ?").run(
          existing.id,
          now,
          personId
        )
      }
      return mapImageRow(db.prepare("SELECT * FROM person_images WHERE id = ?").get(existing.id))
    }
  }

  if (isPrimary === 1) {
    // Unset current primary images for this person
    db.prepare("UPDATE person_images SET is_primary = 0 WHERE person_id = ?").run(personId)
  }

  db.prepare(`
    INSERT INTO person_images (
      id, person_id, url, thumbnail_url, provider, external_id, source_url,
      license, license_url, author, attribution, is_primary, width, height,
      mime_type, file_size, verification_status, verification_details,
      moderation_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    imageId,
    personId,
    image.url,
    image.thumbnailUrl || image.url,
    image.provider,
    image.externalId || null,
    image.sourceUrl || null,
    image.license,
    image.licenseUrl || null,
    image.author || null,
    formattedAttribution,
    isPrimary,
    image.width || null,
    image.height || null,
    image.mimeType || null,
    image.fileSize || null,
    verification,
    image.verificationDetails || null,
    image.moderationStatus || "approved",
    now,
    now
  )

  if (isPrimary === 1) {
    db.prepare("UPDATE people SET primary_image_id = ?, updated_at = ? WHERE id = ?").run(
      imageId,
      now,
      personId
    )
  }

  const createdRow = db.prepare("SELECT * FROM person_images WHERE id = ?").get(imageId) as any
  return mapImageRow(createdRow)
}

/**
 * Creates or updates a person record safely, avoiding duplicate entries
 */
export function upsertPerson(input: {
  name: string
  gender?: Gender | null
  category?: Category
  tags?: string[]
  provider: "local" | "wikidata" | "community"
  externalId?: string | null
  description?: string | null
  aliases?: string[]
  moderationStatus?: "approved" | "pending" | "rejected"
}): Person {
  const db = getDb()

  // Safe duplicate check
  const existing = findExistingPerson({
    name: input.name,
    provider: input.provider,
    externalId: input.externalId,
    aliases: input.aliases
  })

  const now = new Date().toISOString()

  if (existing) {
    // Merge aliases and update description if missing
    const mergedAliases = Array.from(new Set([...existing.aliases, ...(input.aliases || [])]))

    // If incoming is from wikidata and existing has a local seed externalId, upgrade to official Wikidata QID
    const shouldUpgradeExternalId = input.provider === "wikidata" && input.externalId && 
      (!existing.externalId || existing.externalId.startsWith("exp_") || existing.externalId.startsWith("seed_"))

    db.prepare(`
      UPDATE people 
      SET 
        aliases = ?,
        description = COALESCE(description, ?),
        provider = CASE WHEN ? THEN ? ELSE provider END,
        external_id = CASE WHEN ? THEN ? ELSE external_id END,
        updated_at = ?
      WHERE id = ?
    `).run(
      JSON.stringify(mergedAliases),
      input.description || null,
      shouldUpgradeExternalId ? 1 : 0,
      input.provider,
      shouldUpgradeExternalId ? 1 : 0,
      input.externalId || existing.externalId || null,
      now,
      existing.id
    )

    return getPersonById(existing.id)!
  }

  const personId = generateId("p")
  const { baseName, aliases: extractedAliases } = extractBaseNameAndAliases(input.name)
  const norm = normalizePersonName(baseName)
  const allAliases = Array.from(new Set([...(input.aliases || []), ...extractedAliases]))

  db.prepare(`
    INSERT INTO people (
      id, name, normalized_name, gender, category, tags,
      provider, external_id, description, aliases, moderation_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    personId,
    input.name,
    norm,
    input.gender || null,
    input.category || "other",
    JSON.stringify(input.tags || []),
    input.provider,
    input.externalId || null,
    input.description || null,
    JSON.stringify(allAliases),
    input.moderationStatus || "approved",
    now,
    now
  )

  return getPersonById(personId)!
}

/**
 * Real-time person discovery using Wikidata and Wikimedia Commons.
 * Normalizes candidates and retrieves candidate image metadata with provenance and licenses.
 * Includes people without portraits as per acceptance criteria.
 */
export async function discoverPeople(
  query: string,
  limit = 10
): Promise<NormalizedPersonCandidate[]> {
  const candidates = await searchWikidataPeople(query, { limit })

  // Parallel resolve primary candidate images for each candidate
  const resolvedCandidates = await Promise.all(
    candidates.map(async (candidate) => {
      if (candidate.hasPortrait && candidate.imageReferences.length > 0) {
        try {
          const img = await resolvePersonPrimaryImage(candidate.imageReferences, candidate.name)
          return {
            ...candidate,
            primaryCandidateImage: img
          }
        } catch (err) {
          console.error(`Failed to resolve image for candidate ${candidate.name}:`, err)
          return {
            ...candidate,
            primaryCandidateImage: null
          }
        }
      }

      // No portrait: return candidate with primaryCandidateImage null
      return {
        ...candidate,
        primaryCandidateImage: null
      }
    })
  )

  return resolvedCandidates
}

/**
 * Ingests a discovered candidate into the local catalog.
 * Verifies image candidate, creates person record with duplicate detection,
 * and links primary image with provenance and license attribution.
 */
export async function importDiscoveredPerson(
  candidate: NormalizedPersonCandidate
): Promise<Person> {
  const person = upsertPerson({
    name: candidate.name,
    gender: candidate.gender,
    category: candidate.category,
    provider: "wikidata",
    externalId: candidate.externalId,
    description: candidate.description,
    aliases: candidate.aliases,
    moderationStatus: "approved"
  })

  // If candidate has candidate image or image references, verify and attach
  if (candidate.primaryCandidateImage && candidate.primaryCandidateImage.url !== PLACEHOLDER_IMAGE_URL) {
    const img = candidate.primaryCandidateImage
    addPersonImage(person.id, {
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
      width: img.width,
      height: img.height,
      mimeType: img.mimeType,
      fileSize: img.fileSize,
      verificationStatus: img.verificationStatus
    })
  } else if (candidate.imageReferences && candidate.imageReferences.length > 0) {
    const img = await resolvePersonPrimaryImage(candidate.imageReferences, candidate.name)
    addPersonImage(person.id, {
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
      width: img.width,
      height: img.height,
      mimeType: img.mimeType,
      fileSize: img.fileSize,
      verificationStatus: img.verificationStatus
    })
  } else if (!person.primaryImageId) {
    // Attach default verified placeholder
    addPersonImage(person.id, {
      url: PLACEHOLDER_IMAGE_URL,
      thumbnailUrl: PLACEHOLDER_IMAGE_URL,
      provider: "local",
      license: "Public Domain / Fallback",
      sourceUrl: PLACEHOLDER_IMAGE_URL,
      author: "Stir It Up Fallback",
      attribution: `Default portrait for ${candidate.name}`,
      isPrimary: true,
      verificationStatus: "verified"
    })
  }

  return getPersonById(person.id)!
}

/**
 * Community submission creation
 */
export function createCommunitySubmission(input: {
  submissionType: "person" | "image" | "edit" | "tag"
  personId?: string | null
  proposedData: Record<string, any>
  submitterName?: string | null
  submitterIp?: string | null
}): CommunitySubmission {
  const db = getDb()
  const id = generateId("sub")
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO community_submissions (
      id, submission_type, person_id, proposed_data,
      submitter_name, submitter_ip, moderation_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
  `).run(
    id,
    input.submissionType,
    input.personId || null,
    JSON.stringify(input.proposedData),
    input.submitterName || null,
    input.submitterIp || null,
    now,
    now
  )

  const row = db.prepare("SELECT * FROM community_submissions WHERE id = ?").get(id) as any
  return {
    id: row.id,
    submissionType: row.submission_type,
    personId: row.person_id,
    proposedData: parseJsonSafe(row.proposed_data, {}),
    submitterName: row.submitter_name,
    submitterIp: row.submitter_ip,
    moderationStatus: row.moderation_status,
    moderationNotes: row.moderation_notes,
    reviewerId: row.reviewer_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

/**
 * Smart answer verification for trivia, quizzes, and games using canonical names and aliases.
 * Matches exact, lowercase, and normalized alphanumeric strings.
 */
export function checkPersonAnswer(guess: string, person: Person): boolean {
  if (!guess || !person) return false
  const cleanGuess = guess.trim().toLowerCase()
  const normGuess = cleanGuess.replace(/[^a-z0-9]/g, "")
  if (!normGuess) return false

  const candidates = [person.name, ...(person.aliases || [])]
  return candidates.some((candidate) => {
    const cleanCand = candidate.trim().toLowerCase()
    const normCand = cleanCand.replace(/[^a-z0-9]/g, "")
    return cleanCand === cleanGuess || normCand === normGuess
  })
}

/**
 * Permanently prunes unpopular figures from the catalog:
 * Preserves ALL figures in 'scientists' and 'history',
 * and removes figures with popularity < minPopularity (default 40) across all other categories.
 */
export function pruneUnpopularCatalog(options: { minPopularity?: number } = {}): {
  deletedPeople: number
  deletedImages: number
  remainingPeople: number
  remainingImages: number
} {
  const db = getDb()
  const minPop = typeof options.minPopularity === "number" ? options.minPopularity : 40

  db.exec("BEGIN TRANSACTION;")
  try {
    // 1. Delete associated images first
    const imgDeleteRes = db.prepare(`
      DELETE FROM person_images
      WHERE person_id IN (
        SELECT id FROM people
        WHERE category NOT IN ('scientists', 'history')
          AND (popularity < ? OR popularity IS NULL)
      )
    `).run(minPop)

    // 2. Delete people
    const peopleDeleteRes = db.prepare(`
      DELETE FROM people
      WHERE category NOT IN ('scientists', 'history')
        AND (popularity < ? OR popularity IS NULL)
    `).run(minPop)

    db.exec("COMMIT;")

    const countPeople = db.prepare("SELECT count(*) as c FROM people").get() as any
    const countImages = db.prepare("SELECT count(*) as c FROM person_images").get() as any

    return {
      deletedPeople: Number(peopleDeleteRes.changes),
      deletedImages: Number(imgDeleteRes.changes),
      remainingPeople: countPeople.c,
      remainingImages: countImages.c
    }
  } catch (err) {
    db.exec("ROLLBACK;")
    throw err
  }
}


