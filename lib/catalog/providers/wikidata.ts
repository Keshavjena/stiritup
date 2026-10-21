import { Gender, Category, NormalizedPersonCandidate } from "../types"

const WIKIDATA_API = "https://www.wikidata.org/w/api.php"
const USER_AGENT = "StirItUpBot/1.0 (https://stiritup.game; contact@stiritup.game)"
const DEFAULT_TIMEOUT_MS = 6000
const MAX_RETRIES = 3

// Server-side in-memory cache with TTL (1 hour)
interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const memoryCache = new Map<string, CacheEntry<any>>()
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

function getFromCache<T>(key: string): T | null {
  const entry = memoryCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key)
    return null
  }
  return entry.data as T
}

function setInCache<T>(key: string, data: T, ttlMs = CACHE_TTL_MS): void {
  // Prune cache if exceeding 500 items
  if (memoryCache.size > 500) {
    const oldestKey = memoryCache.keys().next().value
    if (oldestKey) memoryCache.delete(oldestKey)
  }
  memoryCache.set(key, { data, expiresAt: Date.now() + ttlMs })
}

export function clearWikidataCache(): void {
  memoryCache.clear()
}

/**
 * Resilient HTTP fetcher with User-Agent, AbortSignal timeout, and exponential backoff retry.
 */
async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<any> {
  let attempt = 0
  let delay = 300

  while (attempt < retries) {
    attempt++
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          "Accept": "application/json"
        },
        signal: controller.signal
      })

      clearTimeout(timeout)

      if (res.status === 429 || (res.status >= 500 && res.status <= 504)) {
        if (attempt >= retries) {
          throw new Error(`Wikidata HTTP ${res.status}: ${res.statusText}`)
        }
        const retryAfter = res.headers.get("Retry-After")
        const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : delay
        await new Promise((resolve) => setTimeout(resolve, waitTime))
        delay *= 2
        continue
      }

      if (!res.ok) {
        throw new Error(`Wikidata request failed with HTTP ${res.status}: ${res.statusText}`)
      }

      return await res.json()
    } catch (err: any) {
      clearTimeout(timeout)
      if (attempt >= retries) {
        throw err
      }
      await new Promise((resolve) => setTimeout(resolve, delay))
      delay *= 2
    }
  }

  throw new Error("Wikidata request exceeded maximum retries")
}

/**
 * Infer gender from Wikidata P21 claim
 */
function inferGender(claims: Record<string, any> = {}): Gender {
  const p21 = claims.P21
  if (!p21 || !Array.isArray(p21) || p21.length === 0) {
    return "unknown"
  }

  const qid = p21[0]?.mainsnak?.datavalue?.value?.id
  switch (qid) {
    case "Q6581072": // female
    case "Q1052281": // transgender female
      return "female"
    case "Q6581097": // male
    case "Q2449503": // transgender male
      return "male"
    case "Q1097630": // non-binary
    case "Q48270": // genderqueer
      return "non-binary"
    default:
      return "other"
  }
}

/**
 * Infer category from P31 (instance of), P106 (occupation), and P27 (country)
 */
function inferCategory(
  entity: any,
  description = ""
): { category: Category; isFictional: boolean } {
  const claims = entity.claims || {}
  const descLower = description.toLowerCase()

  // 1. Check if fictional character (P31 has Q95074 or anime/comic character)
  const p31Claims = claims.P31 || []
  const instanceIds = p31Claims.map((c: any) => c.mainsnak?.datavalue?.value?.id)
  const isFictional =
    instanceIds.includes("Q95074") || // fictional character
    instanceIds.includes("Q15632617") || // anime character
    instanceIds.includes("Q15773317") || // comic book character
    descLower.includes("fictional character") ||
    descLower.includes("anime character")

  if (isFictional) {
    return { category: "fantasy", isFictional: true }
  }

  // 2. Check occupations (P106)
  const p106Claims = claims.P106 || []
  const occupationIds = p106Claims.map((c: any) => c.mainsnak?.datavalue?.value?.id)

  // Check country of citizenship (P27)
  const p27Claims = claims.P27 || []
  const countryIds = p27Claims.map((c: any) => c.mainsnak?.datavalue?.value?.id)
  const isIndian = countryIds.includes("Q668") || descLower.includes("indian") || descLower.includes("bollywood")

  // Adult film actor (Q488111) / pornographic actor
  if (
    occupationIds.includes("Q488111") ||
    occupationIds.includes("Q4610556") ||
    descLower.includes("pornographic") ||
    descLower.includes("adult film")
  ) {
    return { category: "adultstars", isFictional: false }
  }

  // Singer / Musician / Popstar
  const isMusician =
    occupationIds.includes("Q177220") || // singer
    occupationIds.includes("Q639669") || // musician
    occupationIds.includes("Q2252262") || // rapper
    occupationIds.includes("Q753110") || // songwriter
    descLower.includes("singer") ||
    descLower.includes("musician") ||
    descLower.includes("rapper")

  if (isMusician && !descLower.includes("actor")) {
    return { category: "popstars", isFictional: false }
  }

  // Actor / Actress
  const isActor =
    occupationIds.includes("Q33999") || // actor
    occupationIds.includes("Q10800557") || // film actor
    descLower.includes("actor") ||
    descLower.includes("actress")

  if (isActor) {
    if (isIndian) {
      return { category: "bollywood", isFictional: false }
    }
    return { category: "hollywood", isFictional: false }
  }

  // Athletes
  const isAthlete =
    occupationIds.includes("Q2066131") || // athlete
    occupationIds.includes("Q937857") || // association football player
    occupationIds.includes("Q10833314") || // cricketer
    occupationIds.includes("Q3665646") || // basketball player
    descLower.includes("footballer") ||
    descLower.includes("cricketer") ||
    descLower.includes("basketball player")

  if (isAthlete) {
    return { category: "athletes", isFictional: false }
  }

  if (isMusician) {
    return { category: "popstars", isFictional: false }
  }

  return { category: "other", isFictional: false }
}

/**
 * Normalizes a raw Wikidata entity item into NormalizedPersonCandidate
 */
export function normalizeWikidataEntity(entity: any): NormalizedPersonCandidate {
  const entityId = entity.id

  // Label extraction
  const name =
    entity.labels?.en?.value ||
    (Object.values(entity.labels || {})[0] as any)?.value ||
    entityId

  // Description extraction
  const description = entity.descriptions?.en?.value || null

  // Aliases extraction
  const aliases: string[] = (entity.aliases?.en || [])
    .map((a: any) => a.value)
    .filter(Boolean)

  // Claims extraction
  const claims = entity.claims || {}

  // P18 image claims
  const p18Claims = claims.P18 || []
  const imageReferences: string[] = p18Claims
    .map((c: any) => c.mainsnak?.datavalue?.value)
    .filter((v: any): v is string => typeof v === "string" && v.length > 0)

  const gender = inferGender(claims)
  const { category, isFictional } = inferCategory(entity, description || "")

  return {
    provider: "wikidata",
    externalId: entityId,
    name,
    aliases,
    description,
    gender,
    category,
    imageReferences,
    hasPortrait: imageReferences.length > 0,
    isFictional
  }
}

/**
 * Searches Wikidata entities and retrieves full details including images, aliases, and labels.
 * Always returns candidates, even when they lack portraits.
 */
export async function searchWikidataPeople(
  query: string,
  options: { limit?: number; language?: string } = {}
): Promise<NormalizedPersonCandidate[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const limit = Math.min(Math.max(options.limit || 8, 1), 20)
  const cacheKey = `search:${trimmed.toLowerCase()}:${limit}`

  const cached = getFromCache<NormalizedPersonCandidate[]>(cacheKey)
  if (cached) {
    return cached
  }

  // 1. Search entity IDs
  const searchUrl = `${WIKIDATA_API}?action=wbsearchentities&search=${encodeURIComponent(
    trimmed
  )}&language=en&format=json&type=item&limit=${limit}`

  const searchData = await fetchWithRetry(searchUrl)
  const searchResults = searchData.search || []

  if (searchResults.length === 0) {
    setInCache(cacheKey, [])
    return []
  }

  const qids: string[] = searchResults.map((r: any) => r.id)

  // 2. Lookup entity details
  const detailsUrl = `${WIKIDATA_API}?action=wbgetentities&ids=${qids.join(
    "|"
  )}&languages=en&props=labels|descriptions|aliases|claims&format=json`

  const detailsData = await fetchWithRetry(detailsUrl)
  const entities = detailsData.entities || {}

  const normalizedCandidates: NormalizedPersonCandidate[] = []

  for (const qid of qids) {
    const rawEntity = entities[qid]
    if (!rawEntity) continue

    // Normalize entity (handles missing labels, descriptions, and missing portraits gracefully)
    const normalized = normalizeWikidataEntity(rawEntity)
    normalizedCandidates.push(normalized)
  }

  // Cache results
  setInCache(cacheKey, normalizedCandidates)

  return normalizedCandidates
}

/**
 * Looks up a single Wikidata entity by QID and returns normalized candidate
 */
export async function lookupWikidataPerson(qid: string): Promise<NormalizedPersonCandidate | null> {
  const cleanQid = qid.trim().toUpperCase()
  if (!cleanQid.startsWith("Q")) return null

  const cacheKey = `entity:${cleanQid}`
  const cached = getFromCache<NormalizedPersonCandidate>(cacheKey)
  if (cached) return cached

  const detailsUrl = `${WIKIDATA_API}?action=wbgetentities&ids=${cleanQid}&languages=en&props=labels|descriptions|aliases|claims&format=json`
  const detailsData = await fetchWithRetry(detailsUrl)
  const entity = detailsData.entities?.[cleanQid]

  if (!entity || entity.missing !== undefined) {
    return null
  }

  const normalized = normalizeWikidataEntity(entity)
  setInCache(cacheKey, normalized)
  return normalized
}
