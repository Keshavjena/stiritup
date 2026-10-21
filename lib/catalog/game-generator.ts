import { getDb } from "./db"
import { Person, PersonCard, KMKGameRound, WYRGameRound, Category, Gender } from "./types"
import { getPeople, seedInitialCatalog } from "./service"
import { PLACEHOLDER_IMAGE_URL } from "./providers/wikimedia"

const KMK_SCENARIOS = [
  "Choose your fate for Kiss, Marry, and Kill",
  "Choose between them - On a deserted island!",
  "Choose between them - During a 3 AM house party!",
  "Choose between them - Stuck in an elevator together!",
  "Choose between them - For a wild weekend trip to Las Vegas!",
  "Choose between them - At an exclusive VIP red carpet event!",
  "Choose between them - If you had to spend a 10-hour flight seated together!"
]

const WYR_SCENARIOS = [
  "Would you rather spend a week stranded on a remote island with",
  "Would you rather switch lives for an entire month with",
  "Would you rather go on a cross-country road trip with",
  "Would you rather have as your personal secret mentor",
  "Would you rather be stuck in a locked escape room for 12 hours with",
  "Would you rather co-star in an unhinged blockbuster movie with",
  "Would you rather team up to survive a zombie apocalypse with"
]

/**
 * Maps a catalog Person to a clean PersonCard with verified fallback handling
 */
export function personToPersonCard(person: Person): PersonCard {
  const primaryImg = person.primaryImage || person.images?.find((img) => img.isPrimary) || person.images?.[0]
  const isImageValid = Boolean(
    primaryImg &&
    primaryImg.verificationStatus === "verified" &&
    !primaryImg.isBroken &&
    primaryImg.url &&
    primaryImg.url !== PLACEHOLDER_IMAGE_URL &&
    !primaryImg.url.includes("placeholder-user")
  )

  const imageUrl = isImageValid ? primaryImg!.url : PLACEHOLDER_IMAGE_URL
  const thumbnailUrl = isImageValid ? primaryImg!.thumbnailUrl || primaryImg!.url : PLACEHOLDER_IMAGE_URL
  const license = primaryImg?.license || "Public Domain / Fallback"
  const author = primaryImg?.author || null
  const sourceUrl = primaryImg?.sourceUrl || PLACEHOLDER_IMAGE_URL
  const attribution = primaryImg?.attribution || `Portrait for ${person.name}`

  return {
    id: person.id,
    name: person.name,
    category: person.category,
    gender: person.gender || null,
    imageUrl,
    thumbnailUrl,
    hasVerifiedPortrait: Boolean(isImageValid),
    license,
    licenseUrl: primaryImg?.licenseUrl || null,
    author,
    sourceUrl,
    attribution
  }
}

/**
 * Shuffles an array safely (Fisher-Yates)
 */
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Generates Kiss Marry Kill rounds with 3 distinct person objects per round.
 * Integrates approved community entries, prevents duplicate persons in the same round,
 * and gracefully works even when one or more portraits are unavailable.
 */
export function generateKMKRounds(options: {
  gender?: "female" | "male" | "mixed"
  category?: string
  count?: number
  excludeIds?: string[]
  difficulty?: "easy" | "medium" | "hard" | "all"
  minPopularity?: number
} = {}): KMKGameRound[] {
  seedInitialCatalog()

  const count = Math.min(Math.max(1, options.count || 20), 50)
  const excludeSet = new Set(options.excludeIds || [])

  // Smart popularity threshold: easy (60+), medium/default (25+), hard/all (0+)
  const minPop = typeof options.minPopularity === "number"
    ? options.minPopularity
    : options.difficulty === "easy"
      ? 60
      : options.difficulty === "hard" || options.difficulty === "all"
        ? 0
        : 25

  // Retrieve approved people from shared catalog (includes approved community entries)
  let result = getPeople({
    gender: options.gender === "mixed" ? undefined : options.gender,
    category: options.category === "all" ? undefined : options.category,
    minPopularity: minPop > 0 ? minPop : undefined,
    sortBy: "random",
    limit: 2000,
    moderationStatus: "approved"
  })

  let pool = result.items.filter((p) => p.moderationStatus === "approved" && !excludeSet.has(p.id))

  // If filtered pool is too small with minPopularity, drop popularity threshold to 0
  if (pool.length < 3 && minPop > 0) {
    result = getPeople({
      gender: options.gender === "mixed" ? undefined : options.gender,
      category: options.category === "all" ? undefined : options.category,
      sortBy: "random",
      limit: 2000,
      moderationStatus: "approved"
    })
    pool = result.items.filter((p) => p.moderationStatus === "approved" && !excludeSet.has(p.id))
  }

  if (pool.length < 3) {
    // If category pool is still too small, fallback to all approved people
    const fallback = getPeople({ limit: 2000, moderationStatus: "approved", sortBy: "random" })
    pool = fallback.items.filter((p) => !excludeSet.has(p.id))
  }

  if (pool.length < 3) return []

  // Split pool by verified portrait availability
  const withPortrait = pool.filter((p) => personToPersonCard(p).hasVerifiedPortrait)
  const allShuffled = shuffle(pool)

  const rounds: KMKGameRound[] = []
  const usedKeys = new Set<string>()

  let attempts = 0
  let poolCursor = 0
  let verifiedCursor = 0

  while (rounds.length < count && attempts < 500) {
    attempts++

    const selected: Person[] = []
    // Weave in verified portraits in initial rounds if available
    if (withPortrait.length > 0 && verifiedCursor < withPortrait.length && rounds.length % 2 === 0) {
      selected.push(withPortrait[verifiedCursor % withPortrait.length])
      verifiedCursor++
    }

    // Fill remaining slots from the full randomized pool of scientists, stars, anime, etc.
    while (selected.length < 3) {
      if (poolCursor >= allShuffled.length) {
        poolCursor = 0
        allShuffled.splice(0, allShuffled.length, ...shuffle(pool))
      }
      const candidate = allShuffled[poolCursor++]
      if (!selected.some((s) => s.id === candidate.id)) {
        selected.push(candidate)
      }
    }

    const [p1, p2, p3] = selected

    // Ensure 3 distinct persons
    if (!p1 || !p2 || !p3 || p1.id === p2.id || p2.id === p3.id || p1.id === p3.id) {
      continue
    }

    const key = [p1.id, p2.id, p3.id].sort().join("|")
    if (usedKeys.has(key)) continue
    usedKeys.add(key)

    const scenario = KMK_SCENARIOS[Math.floor(Math.random() * KMK_SCENARIOS.length)]

    rounds.push({
      roundNumber: rounds.length + 1,
      scenario: `${scenario}: ${p1.name}, ${p2.name}, and ${p3.name}`,
      persons: [
        personToPersonCard(p1),
        personToPersonCard(p2),
        personToPersonCard(p3)
      ]
    })
  }

  return rounds
}

/**
 * Generates Would You Rather rounds with 2 distinct person objects for dilemma choices.
 * Supports image cards, category filters, and fallback placeholders.
 */
export function generateWYRRounds(options: {
  category?: string
  gender?: string
  count?: number
  excludeIds?: string[]
  difficulty?: "easy" | "medium" | "hard" | "all"
  minPopularity?: number
} = {}): WYRGameRound[] {
  seedInitialCatalog()

  const count = Math.min(Math.max(1, options.count || 20), 50)
  const excludeSet = new Set(options.excludeIds || [])

  const minPop = typeof options.minPopularity === "number"
    ? options.minPopularity
    : options.difficulty === "easy"
      ? 60
      : options.difficulty === "hard" || options.difficulty === "all"
        ? 0
        : 25

  let result = getPeople({
    gender: options.gender === "mixed" || options.gender === "all" ? undefined : options.gender,
    category: options.category === "all" ? undefined : options.category,
    minPopularity: minPop > 0 ? minPop : undefined,
    sortBy: "random",
    limit: 2000,
    moderationStatus: "approved"
  })

  let pool = result.items.filter((p) => p.moderationStatus === "approved" && !excludeSet.has(p.id))

  if (pool.length < 2 && minPop > 0) {
    result = getPeople({
      gender: options.gender === "mixed" || options.gender === "all" ? undefined : options.gender,
      category: options.category === "all" ? undefined : options.category,
      sortBy: "random",
      limit: 2000,
      moderationStatus: "approved"
    })
    pool = result.items.filter((p) => p.moderationStatus === "approved" && !excludeSet.has(p.id))
  }

  if (pool.length < 2) {
    const fallback = getPeople({ limit: 2000, moderationStatus: "approved", sortBy: "random" })
    pool = fallback.items.filter((p) => !excludeSet.has(p.id))
  }

  if (pool.length < 2) return []

  const rounds: WYRGameRound[] = []
  const usedKeys = new Set<string>()
  const allShuffled = shuffle(pool)
  let poolCursor = 0

  let attempts = 0
  while (rounds.length < count && attempts < 500) {
    attempts++
    if (poolCursor >= allShuffled.length - 1) {
      poolCursor = 0
      allShuffled.splice(0, allShuffled.length, ...shuffle(pool))
    }
    const p1 = allShuffled[poolCursor++]
    const p2 = allShuffled[poolCursor++]

    if (!p1 || !p2 || p1.id === p2.id) continue

    const key = [p1.id, p2.id].sort().join("|")
    if (usedKeys.has(key)) continue
    usedKeys.add(key)

    const scenarioPrefix = WYR_SCENARIOS[Math.floor(Math.random() * WYR_SCENARIOS.length)]

    rounds.push({
      roundNumber: rounds.length + 1,
      scenario: `${scenarioPrefix} ${p1.name} OR ${p2.name}?`,
      optionA: personToPersonCard(p1),
      optionB: personToPersonCard(p2)
    })
  }

  return rounds
}
