import { Celebrity, FEMALE_CELEBRITIES, MALE_CELEBRITIES } from "../game-data/celebrities"
import { Person } from "./types"
import { getPeople } from "./service"

/**
 * Converts a database Person record to the Celebrity interface
 * used by Kiss Marry Kill and other game generators.
 */
export function personToCelebrity(person: Person): Celebrity {
  const gender: "female" | "male" =
    person.gender === "female" ? "female" : "male"

  const allowedCategories = [
    "bollywood", "hollywood", "popstars", "singers", "adultstars", "glamour",
    "fantasy", "athletes", "scientists", "history", "tech", "writers",
    "artists", "actors", "creators", "models", "icons"
  ] as const
  const category = (allowedCategories.includes(person.category as any)
    ? person.category
    : "hollywood") as any

  return {
    name: person.name,
    gender,
    category,
    tags: person.tags
  }
}

/**
 * Retrieves celebrities from the database catalog if available,
 * seamlessly falling back to static lists if database is empty or unavailable.
 */
export function getCatalogCelebrities(
  gender?: "female" | "male" | "mixed",
  category?: string
): Celebrity[] {
  try {
    const result = getPeople({
      gender: gender === "mixed" ? undefined : gender,
      category: category === "all" ? undefined : category,
      limit: 100
    })

    if (result.items.length >= 3) {
      return result.items.map(personToCelebrity)
    }
  } catch (err) {
    console.warn("[Compatibility] Falling back to static celebrities:", err)
  }

  // Fallback to static lists
  let pool: Celebrity[] = []
  if (gender === "female") {
    pool = [...FEMALE_CELEBRITIES]
  } else if (gender === "male") {
    pool = [...MALE_CELEBRITIES]
  } else {
    pool = [...FEMALE_CELEBRITIES, ...MALE_CELEBRITIES]
  }

  if (category && category !== "all") {
    const filtered = pool.filter((c) => c.category === category)
    if (filtered.length >= 3) {
      return filtered
    }
  }

  return pool
}

/**
 * Trio of people with full image provenance and licenses for Kiss Marry Kill
 */
export interface KMKImageTrio {
  scenario: string
  persons: Array<{
    id: string
    name: string
    imageUrl: string
    thumbnailUrl: string
    license: string
    licenseUrl?: string | null
    author?: string | null
    sourceUrl: string
    attribution: string
  }>
}

export function generateImageKMKTrios(
  gender: "female" | "male" | "mixed" = "female",
  category: string = "all",
  count: number = 10
): KMKImageTrio[] {
  const result = getPeople({
    gender: gender === "mixed" ? undefined : gender,
    category: category === "all" ? undefined : category,
    limit: 100
  })

  const pool = result.items
  if (pool.length < 3) return []

  const trios: KMKImageTrio[] = []
  const usedKeys = new Set<string>()

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const copy = [...arr]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }

  let attempts = 0
  while (trios.length < count && attempts < 100) {
    attempts++
    const shuffled = shuffleArray(pool)
    const [a, b, c] = shuffled.slice(0, 3)
    const key = [a.id, b.id, c.id].sort().join("|")
    if (usedKeys.has(key)) continue
    usedKeys.add(key)

    const mapCandidate = (p: Person) => {
      const img = p.primaryImage || p.images?.[0]
      return {
        id: p.id,
        name: p.name,
        imageUrl: img?.url || "/placeholder-user.jpg",
        thumbnailUrl: img?.thumbnailUrl || img?.url || "/placeholder-user.jpg",
        license: img?.license || "Public Domain",
        licenseUrl: img?.licenseUrl || null,
        author: img?.author || null,
        sourceUrl: img?.sourceUrl || "/placeholder-user.jpg",
        attribution: img?.attribution || `Photo for ${p.name}`
      }
    }

    trios.push({
      scenario: `Choose between: ${a.name}, ${b.name}, and ${c.name} for Kiss, Marry, and Kill`,
      persons: [mapCandidate(a), mapCandidate(b), mapCandidate(c)]
    })
  }

  return trios
}
