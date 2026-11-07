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
 * High-entropy Fisher-Yates array shuffle
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
 * Guarantees:
 * 1. Fresh session start: Shuffled starting pool with randomized entry cursor.
 * 2. Strict anti-consecutive: Zero personalities from round N-1 can appear in round N.
 * 3. Recent LRU memory: Deprioritizes personalities seen in the last 15-20 picks to maximize variety.
 */
export function generateKMKRounds(options: {
  gender?: "female" | "male" | "mixed"
  category?: string
  count?: number
  excludeIds?: string[]
  difficulty?: "easy" | "medium" | "hard" | "all"
  minPopularity?: number
  seed?: string | number
} = {}): KMKGameRound[] {
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
    gender: options.gender === "mixed" ? undefined : options.gender,
    category: options.category === "all" ? undefined : options.category,
    minPopularity: minPop > 0 ? minPop : undefined,
    sortBy: "random",
    limit: 2000,
    moderationStatus: "approved"
  })

  let pool = result.items.filter((p) => p.moderationStatus === "approved" && !excludeSet.has(p.id))

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
    const fallback = getPeople({
      category: options.category === "all" ? undefined : options.category,
      limit: 2000,
      moderationStatus: "approved",
      sortBy: "random"
    })
    pool = fallback.items.filter((p) => !excludeSet.has(p.id))
  }

  if (pool.length < 3) return []

  // Ensure portraits and general pools are thoroughly and unpredictably shuffled
  const withPortrait = shuffle(pool.filter((p) => personToPersonCard(p).hasVerifiedPortrait))
  const allShuffled = shuffle(pool)

  const rounds: KMKGameRound[] = []
  const usedTrioKeys = new Set<string>()

  // Strict anti-consecutive set & sliding LRU memory
  let lastRoundIds = new Set<string>()
  const recentHistoryQueue: string[] = []
  const LRU_MAX = Math.min(18, Math.max(3, Math.floor(pool.length / 2)))

  let attempts = 0
  let poolCursor = Math.floor(Math.random() * allShuffled.length)
  let portraitCursor = withPortrait.length > 0 ? Math.floor(Math.random() * withPortrait.length) : 0

  while (rounds.length < count && attempts < 1000) {
    attempts++

    const recentHistorySet = new Set(recentHistoryQueue)
    const selected: Person[] = []

    const canPick = (candidate: Person, strictOnly = false): boolean => {
      if (selected.some((s) => s.id === candidate.id)) return false
      // STRICT: Never allow any personality from the immediate previous round
      if (lastRoundIds.has(candidate.id)) return false
      // LRU: Avoid personalities seen in recent rounds if pool is sufficiently large
      if (!strictOnly && recentHistorySet.has(candidate.id)) return false
      return true
    }

    // Try to weave in 1 verified portrait if available and valid
    if (withPortrait.length > 0) {
      for (let pAttempt = 0; pAttempt < withPortrait.length; pAttempt++) {
        const candidate = withPortrait[(portraitCursor + pAttempt) % withPortrait.length]
        if (canPick(candidate)) {
          selected.push(candidate)
          portraitCursor = (portraitCursor + pAttempt + 1) % withPortrait.length
          break
        }
      }
    }

    // Fill remaining slots from randomized pool
    let passAttempts = 0
    while (selected.length < 3 && passAttempts < allShuffled.length) {
      passAttempts++
      if (poolCursor >= allShuffled.length) {
        poolCursor = 0
        allShuffled.splice(0, allShuffled.length, ...shuffle(pool))
      }
      const candidate = allShuffled[poolCursor++]
      if (canPick(candidate)) {
        selected.push(candidate)
      }
    }

    // Fallback: If LRU window was too restrictive for a small category pool, relax LRU (but NEVER relax lastRoundIds!)
    if (selected.length < 3) {
      for (const candidate of allShuffled) {
        if (selected.length >= 3) break
        if (canPick(candidate, true)) {
          selected.push(candidate)
        }
      }
    }

    if (selected.length < 3) continue

    const [p1, p2, p3] = selected
    if (!p1 || !p2 || !p3 || p1.id === p2.id || p2.id === p3.id || p1.id === p3.id) {
      continue
    }

    const trioKey = [p1.id, p2.id, p3.id].sort().join("|")
    if (usedTrioKeys.has(trioKey)) continue
    usedTrioKeys.add(trioKey)

    // Update anti-consecutive trackers
    lastRoundIds = new Set([p1.id, p2.id, p3.id])
    recentHistoryQueue.push(p1.id, p2.id, p3.id)
    while (recentHistoryQueue.length > LRU_MAX) {
      recentHistoryQueue.shift()
    }

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
 * Guarantees:
 * 1. Fresh session start: Shuffled starting pool with randomized entry cursor.
 * 2. Strict anti-consecutive: Zero personalities from round N-1 can appear in round N.
 * 3. Recent LRU memory: Deprioritizes personalities seen in the last 10 picks.
 */
export function generateWYRRounds(options: {
  category?: string
  gender?: string
  count?: number
  excludeIds?: string[]
  difficulty?: "easy" | "medium" | "hard" | "all"
  minPopularity?: number
  seed?: string | number
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
    const fallback = getPeople({
      category: options.category === "all" ? undefined : options.category,
      limit: 2000,
      moderationStatus: "approved",
      sortBy: "random"
    })
    pool = fallback.items.filter((p) => !excludeSet.has(p.id))
  }

  if (pool.length < 2) return []

  const rounds: WYRGameRound[] = []
  const usedPairKeys = new Set<string>()
  const allShuffled = shuffle(pool)

  let lastRoundIds = new Set<string>()
  const recentHistoryQueue: string[] = []
  const LRU_MAX = Math.min(10, Math.max(2, Math.floor(pool.length / 2)))

  let poolCursor = Math.floor(Math.random() * allShuffled.length)
  let attempts = 0

  while (rounds.length < count && attempts < 1000) {
    attempts++

    const recentHistorySet = new Set(recentHistoryQueue)
    const selected: Person[] = []

    const canPick = (candidate: Person, strictOnly = false): boolean => {
      if (selected.some((s) => s.id === candidate.id)) return false
      // STRICT: Never allow any personality from the immediate previous round
      if (lastRoundIds.has(candidate.id)) return false
      // LRU: Avoid recently chosen personalities
      if (!strictOnly && recentHistorySet.has(candidate.id)) return false
      return true
    }

    let passAttempts = 0
    while (selected.length < 2 && passAttempts < allShuffled.length) {
      passAttempts++
      if (poolCursor >= allShuffled.length) {
        poolCursor = 0
        allShuffled.splice(0, allShuffled.length, ...shuffle(pool))
      }
      const candidate = allShuffled[poolCursor++]
      if (canPick(candidate)) {
        selected.push(candidate)
      }
    }

    // Fallback if LRU too strict for smaller category
    if (selected.length < 2) {
      for (const candidate of allShuffled) {
        if (selected.length >= 2) break
        if (canPick(candidate, true)) {
          selected.push(candidate)
        }
      }
    }

    if (selected.length < 2) continue

    const [p1, p2] = selected
    if (!p1 || !p2 || p1.id === p2.id) continue

    const pairKey = [p1.id, p2.id].sort().join("|")
    if (usedPairKeys.has(pairKey)) continue
    usedPairKeys.add(pairKey)

    // Update anti-consecutive trackers
    lastRoundIds = new Set([p1.id, p2.id])
    recentHistoryQueue.push(p1.id, p2.id)
    while (recentHistoryQueue.length > LRU_MAX) {
      recentHistoryQueue.shift()
    }

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
