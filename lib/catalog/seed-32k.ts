import fs from "node:fs"
import path from "node:path"
import { getDb } from "./db"
import { normalizePersonName } from "./duplicate-detector"
import { A_PLUS_SCIENTISTS, A_PLUS_HISTORY } from "./expanded-dataset"

export interface Seed32kRecord {
  id: string
  name: string
  gender: string
  category: string
  tags: string[]
  description: string
  image: string | null
  popularity: number
  country: string | null
  birthYear: number | null
  occupations: string[]
  aliases: string[]
}

export function seed32kCatalog(options: {
  filePath?: string
  batchSize?: number
  logProgress?: boolean
  minPopularity?: number
} = {}): { totalProcessed: number; insertedPeople: number; insertedImages: number; timeTakenMs: number } {
  const startTime = Date.now()
  const db = getDb()

  const defaultPath = path.resolve(process.cwd(), "personalities/data/personalities.json")
  const jsonPath = options.filePath || defaultPath

  if (!fs.existsSync(jsonPath)) {
    return { totalProcessed: 0, insertedPeople: 0, insertedImages: 0, timeTakenMs: 0 }
  }

  const log = options.logProgress ?? false
  if (log) {
    console.log(`[Seed 32k] Reading dataset from ${jsonPath}...`)
  }

  const rawData = fs.readFileSync(jsonPath, "utf-8")
  const records: Seed32kRecord[] = JSON.parse(rawData)
  if (log) {
    console.log(`[Seed 32k] Parsed ${records.length.toLocaleString()} personality records.`)
  }

  const findExisting = db.prepare("SELECT id, primary_image_id FROM people WHERE normalized_name = ? LIMIT 1")
  const updateExisting = db.prepare(`
    UPDATE people SET
      external_id = COALESCE(external_id, ?),
      popularity = MAX(popularity, ?),
      country = COALESCE(country, ?),
      birth_year = COALESCE(birth_year, ?),
      occupations = CASE WHEN occupations = '[]' OR occupations IS NULL THEN ? ELSE occupations END,
      primary_image_id = COALESCE(primary_image_id, ?),
      updated_at = ?
    WHERE id = ?
  `)

  const upsertPerson = db.prepare(`
    INSERT INTO people (
      id, name, normalized_name, gender, category, tags, primary_image_id,
      provider, external_id, description, popularity, country, birth_year,
      occupations, aliases, moderation_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'wikidata', ?, ?, ?, ?, ?, ?, ?, 'approved', ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      normalized_name = excluded.normalized_name,
      gender = excluded.gender,
      category = excluded.category,
      tags = excluded.tags,
      primary_image_id = COALESCE(excluded.primary_image_id, people.primary_image_id),
      description = excluded.description,
      popularity = excluded.popularity,
      country = excluded.country,
      birth_year = excluded.birth_year,
      occupations = excluded.occupations,
      aliases = excluded.aliases,
      updated_at = excluded.updated_at
  `)

  const upsertImage = db.prepare(`
    INSERT INTO person_images (
      id, person_id, url, thumbnail_url, provider, external_id, source_url,
      license, license_url, author, attribution, is_primary, width, height,
      mime_type, file_size, verification_status, moderation_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, 'wikimedia', ?, ?, 'Wikimedia Commons (Free License)', NULL, NULL, ?, 1, 600, 600, 'image/jpeg', NULL, 'verified', 'approved', ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      url = excluded.url,
      thumbnail_url = excluded.thumbnail_url,
      attribution = excluded.attribution,
      updated_at = excluded.updated_at
  `)

  const now = new Date().toISOString()
  const batchSize = options.batchSize || 2000
  const minPopThreshold = options.minPopularity !== undefined ? options.minPopularity : 40
  let insertedPeople = 0
  let insertedImages = 0

  for (let i = 0; i < records.length; i += batchSize) {
    const chunk = records.slice(i, i + batchSize)
    db.exec("BEGIN TRANSACTION;")

    for (const item of chunk) {
      const normName = normalizePersonName(item.name)

      // Strict A-Tier / Popularity Rule:
      // 1. Scientists: keep ONLY A+ tier household names
      // 2. History: keep ONLY A+ tier household names
      // 3. Writers & Artists: keep only high popularity (>= 120) household icons
      // 4. Other categories: keep only popular figures (>= minPopThreshold)
      if (item.category === "scientists") {
        if (!A_PLUS_SCIENTISTS.includes(normName)) continue
      } else if (item.category === "history") {
        if (!A_PLUS_HISTORY.includes(normName)) continue
      } else if (item.category === "writers" || item.category === "artists") {
        if ((item.popularity || 0) < 120) continue
      } else {
        if ((item.popularity || 0) < minPopThreshold) continue
      }
      const existing = findExisting.get(normName) as any

      let targetPersonId = `p_${item.id}`
      const imageId = item.image ? `img_${item.id}` : null

      if (existing) {
        targetPersonId = existing.id
        updateExisting.run(
          item.id,
          item.popularity || 0,
          item.country || null,
          item.birthYear != null ? item.birthYear : null,
          JSON.stringify(item.occupations || []),
          imageId,
          now,
          existing.id
        )
      } else {
        upsertPerson.run(
          targetPersonId,
          item.name,
          normName,
          item.gender || "unknown",
          item.category || "other",
          JSON.stringify(item.tags || []),
          imageId,
          item.id,
          item.description || null,
          item.popularity || 0,
          item.country || null,
          item.birthYear != null ? item.birthYear : null,
          JSON.stringify(item.occupations || []),
          JSON.stringify(item.aliases || []),
          now,
          now
        )
      }
      insertedPeople++

      if (item.image && imageId) {
        const fullImageUrl = item.image.includes("?") ? item.image : `${item.image}?width=600`
        const thumbUrl = item.image.includes("?") ? item.image : `${item.image}?width=300`
        const attribution = `Portrait of ${item.name} via Wikimedia Commons`

        upsertImage.run(
          imageId,
          targetPersonId,
          fullImageUrl,
          thumbUrl,
          `commons_${item.id}`,
          item.image,
          attribution,
          now,
          now
        )
        insertedImages++
      }
    }

    db.exec("COMMIT;")
    if (log && ((i + batchSize) % 10000 === 0 || i + batchSize >= records.length)) {
      console.log(`[Seed 32k] Ingested ${Math.min(i + batchSize, records.length).toLocaleString()} / ${records.length.toLocaleString()} records...`)
    }
  }

  const timeTakenMs = Date.now() - startTime
  if (log) {
    console.log(`[Seed 32k] Ingested ${insertedPeople.toLocaleString()} people and ${insertedImages.toLocaleString()} portraits in ${(timeTakenMs / 1000).toFixed(2)}s.`)
  }

  return {
    totalProcessed: records.length,
    insertedPeople,
    insertedImages,
    timeTakenMs
  }
}
