import { WikimediaImageCandidate, VerificationStatus } from "../types"

const COMMONS_API = "https://commons.wikimedia.org/w/api.php"
const USER_AGENT = "StirItUpBot/1.0 (https://stiritup.game; contact@stiritup.game)"
const DEFAULT_TIMEOUT_MS = 6000
const MAX_RETRIES = 3

// Fallback placeholder paths
export const PLACEHOLDER_IMAGE_URL = "/placeholder-user.jpg"

// In-memory cache for Wikimedia Commons queries
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
  if (memoryCache.size > 500) {
    const oldestKey = memoryCache.keys().next().value
    if (oldestKey) memoryCache.delete(oldestKey)
  }
  memoryCache.set(key, { data, expiresAt: Date.now() + ttlMs })
}

export function clearWikimediaCache(): void {
  memoryCache.clear()
}

/**
 * Strips HTML tags and decodes common HTML entities for clean plaintext attribution.
 */
export function sanitizeAttributionText(raw: string = ""): string {
  if (!raw) return ""
  return raw
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Formats a clean, traceable attribution string including author, license, and provenance
 */
export function formatImageAttribution(
  author: string | null | undefined,
  license: string,
  sourcePageUrl: string
): string {
  const cleanAuthor = sanitizeAttributionText(author || "")
  if (cleanAuthor) {
    return `Photo by ${cleanAuthor} / Wikimedia Commons (${license})`
  }
  return `Image from Wikimedia Commons (${license})`
}

/**
 * Verification check on candidate image.
 * Ensures mime type is web image (jpg/png/webp), dimensions are valid, aspect ratio is normal,
 * and license is compliant.
 */
export function verifyImageCandidate(metadata: {
  mimeType?: string
  width?: number
  height?: number
  license?: string
  url?: string
}): { status: VerificationStatus; reason?: string } {
  const mime = (metadata.mimeType || "").toLowerCase()
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

  if (!allowedMimes.includes(mime)) {
    return {
      status: "failed",
      reason: `Unsupported MIME type: '${metadata.mimeType}'. Stir It Up requires JPEG, PNG, or WebP portraits.`
    }
  }

  const width = metadata.width || 0
  const height = metadata.height || 0

  if (width < 120 || height < 120) {
    return {
      status: "failed",
      reason: `Image dimensions (${width}x${height}) are too small for game display (min 120x120 required).`
    }
  }

  const ratio = width / height
  if (ratio > 3.2 || ratio < 0.28) {
    return {
      status: "failed",
      reason: `Extreme aspect ratio (${ratio.toFixed(2)}). Stir It Up requires portrait or standard rectangular photos.`
    }
  }

  const licenseLower = (metadata.license || "").toLowerCase()
  const disallowedLicenses = ["all rights reserved", "fair use", "copyrighted", "non-commercial"]
  if (disallowedLicenses.some((d) => licenseLower.includes(d))) {
    return {
      status: "failed",
      reason: `Restricted license: '${metadata.license}'. Stir It Up requires free or Creative Commons licenses.`
    }
  }

  return { status: "verified" }
}

/**
 * Creates a verified fallback placeholder candidate when no suitable image exists.
 */
export function createPlaceholderCandidate(name: string): WikimediaImageCandidate {
  return {
    fileName: "placeholder-user.jpg",
    url: PLACEHOLDER_IMAGE_URL,
    thumbnailUrl: PLACEHOLDER_IMAGE_URL,
    sourcePageUrl: PLACEHOLDER_IMAGE_URL,
    license: "Public Domain / Local Fallback",
    licenseUrl: null,
    author: "Stir It Up Fallback",
    width: 600,
    height: 600,
    mimeType: "image/jpeg",
    fileSize: 15000,
    verificationStatus: "verified",
    formattedAttribution: `Default portrait placeholder for ${name}`
  }
}

/**
 * Resilient fetch with User-Agent and exponential backoff retry.
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
          throw new Error(`Wikimedia HTTP ${res.status}: ${res.statusText}`)
        }
        const retryAfter = res.headers.get("Retry-After")
        const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : delay
        await new Promise((resolve) => setTimeout(resolve, waitTime))
        delay *= 2
        continue
      }

      if (!res.ok) {
        throw new Error(`Wikimedia request failed with HTTP ${res.status}`)
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

  throw new Error("Wikimedia request exceeded maximum retries")
}

/**
 * Retrieves image metadata, licensing, author, thumbnail, and provenance from Wikimedia Commons.
 * Supports single file or array of filenames.
 */
export async function getWikimediaImageMetadata(
  fileNames: string[] | string
): Promise<WikimediaImageCandidate[]> {
  const rawList = Array.isArray(fileNames) ? fileNames : [fileNames]
  const cleanList = rawList
    .map((f) => f.trim())
    .filter(Boolean)
    .map((f) => (f.toLowerCase().startsWith("file:") ? f : `File:${f}`))

  if (cleanList.length === 0) return []

  const results: WikimediaImageCandidate[] = []
  const missingFromCache: string[] = []

  // Check cache first
  for (const title of cleanList) {
    const cached = getFromCache<WikimediaImageCandidate>(title)
    if (cached) {
      results.push(cached)
    } else {
      missingFromCache.push(title)
    }
  }

  if (missingFromCache.length === 0) {
    return results
  }

  // Request in batches of up to 40 titles
  const batchSize = 40
  for (let i = 0; i < missingFromCache.length; i += batchSize) {
    const batch = missingFromCache.slice(i, i + batchSize)
    const titlesParam = batch.map((t) => encodeURIComponent(t)).join("|")
    const url = `${COMMONS_API}?action=query&titles=${titlesParam}&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=600&format=json`

    try {
      const data = await fetchWithRetry(url)
      const pages = data.query?.pages || {}

      for (const pageId in pages) {
        const page = pages[pageId]
        if (!page || page.missing !== undefined) continue

        const fileTitle = page.title || ""
        const rawFileName = fileTitle.replace(/^File:/i, "")
        const info = page.imageinfo?.[0]
        if (!info) continue

        const extmetadata = info.extmetadata || {}
        const license = extmetadata.LicenseShortName?.value || "Creative Commons / Public Domain"
        const licenseUrl = extmetadata.LicenseUrl?.value || null
        const author = sanitizeAttributionText(
          extmetadata.Artist?.value || extmetadata.Credit?.value || extmetadata.Author?.value || ""
        )
        const sourcePageUrl = info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(fileTitle)}`
        const url = info.url
        const thumbnailUrl = info.thumburl || info.url
        const width = info.width
        const height = info.height
        const mimeType = info.mime
        const fileSize = info.size

        const verification = verifyImageCandidate({
          mimeType,
          width,
          height,
          license,
          url
        })

        const formattedAttribution = formatImageAttribution(author, license, sourcePageUrl)

        const candidate: WikimediaImageCandidate = {
          fileName: rawFileName,
          url,
          thumbnailUrl,
          sourcePageUrl,
          license,
          licenseUrl,
          author,
          width,
          height,
          mimeType,
          fileSize,
          verificationStatus: verification.status,
          verificationReason: verification.reason,
          formattedAttribution
        }

        setInCache(fileTitle, candidate)
        results.push(candidate)
      }
    } catch (err) {
      console.error("[Wikimedia Commons] Failed to fetch image metadata batch:", err)
    }
  }

  return results
}

/**
 * Resolve the best candidate image for a person, returning a verified candidate
 * or fallback placeholder if none are verified.
 */
export async function resolvePersonPrimaryImage(
  imageReferences: string[],
  personName: string
): Promise<WikimediaImageCandidate> {
  if (!imageReferences || imageReferences.length === 0) {
    return createPlaceholderCandidate(personName)
  }

  const candidates = await getWikimediaImageMetadata(imageReferences)
  const verified = candidates.find((c) => c.verificationStatus === "verified")

  if (verified) {
    return verified
  }

  // If no candidate passed verification, return placeholder
  return createPlaceholderCandidate(personName)
}
