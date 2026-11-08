import { getDb } from "./db"
import { Person, PersonCard, KMKGameRound, WYRGameRound, Category, Gender } from "./types"
import { getPeople, seedInitialCatalog } from "./service"
import { PLACEHOLDER_IMAGE_URL } from "./providers/wikimedia"
import { CustomGameCard } from "@/lib/custom-game/types"

export const KMK_QUIRKY_SCENARIOS = [
  "You wake up handcuffed together in the back of an abandoned taco truck at 4 AM with no memory of the night before",
  "Trapped in an Ikea after closing. One helps you build a Swedish fortress, one loses their mind in the maze, and one summons an entity",
  "Your search history was projected onto a Times Square billboard. One takes the blame, one live-streams it, and one hired the hacker",
  "You crash a high-society masquerade ball in Monte Carlo. One charms security, one steals vintage champagne, and one knocks over the ice sculpture",
  "Stranded in an elevator for 6 hours with broken Wi-Fi. One tries to pry the doors with a spoon, one starts a rap battle, and one panics",
  "Cast in an unhinged 2000s reality TV house. One gives you butterflies, one leaks your DMs to TMZ, and one puts glitter in your shampoo",
  "Accidentally swapped suitcases at the airport. One has diamonds, one has a cursed wooden puppet, and one has 40 lbs of gummy bears",
  "Stuck on a 14-hour Greyhound bus with broken AC. One talks about crypto non-stop, one eats tuna out of a can, and one steals your pillow",
  "A genie grants you unlimited wealth, but you must co-host an unhinged podcast with one, fake your death with another, and ghost the third",
  "You enter a cooking showdown on live TV. One is your chaotic sous-chef, one sets the kitchen on fire, and one replaces salt with sugar",
  "Locked in a haunted escape room run by an eccentric billionaire. One solves all the puzzles, one screams at mannequins, and one turns off the lights"
]

export const KMK_DARK_SCENARIOS = [
  "The nuclear fallout sirens just sounded. One manages the bunker, one secretly hoards the rations, and one sacrifices you to the mutant horde",
  "A zombie outbreak hits your hotel floor. One fights with a golf club, one uses you as human bait to escape, and one is hiding a suspicious bite",
  "You're falsely convicted of high treason. One is your ruthless defense lawyer, one is your prison escape partner, and one is the judge who framed you",
  "An international cartel demands $20 million. One caused the mess, one negotiates your hostage release, and one secretly sold you out for a discount",
  "You accidentally signed a demon contract after 6 tequila shots. One finds a legal loophole, one offers moral support, and one is the debt collector",
  "Shipwrecked on an uncharted island ruled by an unhinged cult. One builds the raft, one tries to become cult leader, and one pushes you into the volcano",
  "Trapped in an underground vault during a 10-year ice age. One runs oxygen scrubbers, one sabotages the water filter, and one hoards emergency ice cream",
  "A cyber-syndicate wipes your identity from existence. One hacks you back into the grid, one steals your remaining identity, and one orchestrates the hit",
  "You're trapped in an opulent mansion during a high-stakes murder mystery. One is the detective, one is the accomplice, and one poisoned the dessert",
  "A secret society initiation banquet. One serves your wine, one slips a mysterious vial into your jacket, and one hooks you to a lie detector"
]

export const KMK_SPICY_SCENARIOS = [
  "VIP penthouse after-party in Monaco overlooking the yacht harbor. One whispers dark secrets on the balcony, one proposes midnight elopement, and one robs the vault",
  "An illicit heist at the Met Gala. One plans the diamond snatch, one creates a chaotic distraction on the red carpet, and one leaves you with the police",
  "Cursed to share a tiny studio apartment in Manhattan for 3 years. One leaves passive-aggressive notes, one cooks 5-star meals at 2 AM, and one steals your clothes",
  "A freak glitch in the multiverse swaps you into their inner circle. One covers your tracks, one suspects you're an imposter, and one challenges you to a duel",
  "Cast on an unhinged celebrity dating show. One takes you on a private helicopter date, one causes a fist fight at the cocktail party, and one is here for clout",
  "You're on a luxury yacht in the Bermuda Triangle during an eclipse. One reads tarot cards, one drives the speedboat, and one 'accidentally' pushes you overboard"
]

export const ALL_KMK_SCENARIOS = [
  ...KMK_QUIRKY_SCENARIOS,
  ...KMK_DARK_SCENARIOS,
  ...KMK_SPICY_SCENARIOS,
  "Choose your fate for Kiss, Marry, and Kill",
  "Choose between them - On a deserted island!",
  "Choose between them - During a 3 AM house party!",
  "Choose between them - Stuck in an elevator together!",
  "Choose between them - For a wild weekend trip to Las Vegas!",
  "Choose between them - At an exclusive VIP red carpet event!",
  "Choose between them - If you had to spend a 10-hour flight seated together!"
]

export const WYR_QUIRKY_TEMPLATES = [
  "Would you rather have {A} accidentally leak your entire search history to your family, OR have {B} manage your life savings for the next 5 years?",
  "Would you rather be falsely accused of an art heist with {A} as your only alibi, OR be locked in an escape room for 24 hours with {B}?",
  "Would you rather let {A} choose your next tattoo while you're blindfolded, OR let {B} write and deliver your wedding vows?",
  "Would you rather fight 10 duck-sized clones of {A} in an elevator, OR attempt to survive a high-speed police chase with {B} driving?",
  "Would you rather swap bodies with {A} during their most humiliating public scandal, OR have {B} show up as your blind date at your ex's wedding?",
  "Would you rather let {A} negotiate your ransom if kidnapped, OR let {B} cook every single meal you eat for the next 3 years?",
  "Would you rather be handcuffed to {A} at a music festival for 48 hours, OR have {B} narrate your internal thoughts out loud for a whole week?",
  "Would you rather have {A} as your sleep paralysis demon, OR have {B} haunt your Spotify Wrapped forever?",
  "Would you rather team up with {A} in a zombie outbreak knowing they refuse to run, OR with {B} who keeps trying to pet the zombies?",
  "Would you rather let {A} redecorate your apartment with zero budget limits and pure chaotic taste, OR let {B} ghostwrite your autobiography?",
  "Would you rather have {A} challenge you to an unhinged rap battle live on television, OR have {B} critique your high school photos on a podcast?",
  "Would you rather be stranded in a snowstorm cabin with {A} and one blanket, OR have {B} be your drill sergeant in bootcamp?",
  "Would you rather have {A} DJ your funeral with zero instructions, OR have {B} plan your bachelor/bachelorette party with an unlimited budget?",
  "Would you rather accidentally spill hot soup on {A} at an awards banquet, OR be stuck on a 16-hour flight seated in the middle between two clones of {B}?"
]

export const WYR_DARK_TEMPLATES = [
  "Would you rather be trapped in a nuclear bunker with {A} who hoards the water, OR with {B} who insists the radiation is a conspiracy?",
  "Would you rather have {A} be the undercover hitman sent to terminate you, OR have {B} be the interrogator at a black-site prison?",
  "Would you rather sacrifice {A} to escape a cannibalistic cult, OR sacrifice {B} to appease an angry volcanic deity?",
  "Would you rather let {A} perform emergency surgery on you with kitchen tools, OR let {B} guide you through an active minefield over a walkie-talkie?",
  "Would you rather have {A} discover your darkest unresolved crime, OR have {B} frame you for a catastrophic bank robbery?",
  "Would you rather sign a 20-year blood pact with {A} for limitless wealth, OR be haunted by the vindictive ghost of {B} for the rest of your life?",
  "Would you rather be thrown into an ancient Roman gladiator pit against {A}, OR be forced to play Russian roulette with {B}?",
  "Would you rather have {A} control the oxygen levels in your submarine, OR have {B} pack your parachute for a 15,000-foot skydive?"
]

export const ALL_WYR_TEMPLATES = [
  ...WYR_QUIRKY_TEMPLATES,
  ...WYR_DARK_TEMPLATES,
  "Would you rather spend a week stranded on a remote island with {A} OR {B}?",
  "Would you rather switch lives for an entire month with {A} OR {B}?",
  "Would you rather go on a cross-country road trip with {A} OR {B}?",
  "Would you rather have {A} OR {B} as your personal secret mentor?",
  "Would you rather be stuck in a locked escape room for 12 hours with {A} OR {B}?",
  "Would you rather co-star in an unhinged blockbuster movie with {A} OR {B}?",
  "Would you rather team up to survive a zombie apocalypse with {A} OR {B}?"
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
  scenarioMode?: "standard" | "quirky" | "dark" | "spicy" | "all"
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

    const scenarioPool = options.scenarioMode === "dark"
      ? KMK_DARK_SCENARIOS
      : options.scenarioMode === "spicy"
        ? KMK_SPICY_SCENARIOS
        : options.scenarioMode === "quirky"
          ? KMK_QUIRKY_SCENARIOS
          : ALL_KMK_SCENARIOS

    const scenario = scenarioPool[Math.floor(Math.random() * scenarioPool.length)]

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
  scenarioMode?: "standard" | "quirky" | "dark" | "spicy" | "all"
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

    const templatePool = options.scenarioMode === "dark"
      ? WYR_DARK_TEMPLATES
      : options.scenarioMode === "quirky"
        ? WYR_QUIRKY_TEMPLATES
        : ALL_WYR_TEMPLATES

    const rawTemplate = templatePool[Math.floor(Math.random() * templatePool.length)]
    const dilemmaText = rawTemplate.includes("{A}")
      ? rawTemplate.replace(/\{A\}/g, p1.name).replace(/\{B\}/g, p2.name)
      : `${rawTemplate} ${p1.name} OR ${p2.name}?`

    rounds.push({
      roundNumber: rounds.length + 1,
      scenario: dilemmaText,
      optionA: personToPersonCard(p1),
      optionB: personToPersonCard(p2)
    })
  }

  return rounds
}

export interface PersonalityCustomCardOptions {
  category?: string
  gender?: "female" | "male" | "mixed"
  count?: number
  style?: "quirky" | "dark" | "spicy" | "all"
}

/**
 * Generates custom game cards dynamically powered by the 18,000+ personality catalog.
 * Produces an engaging mix of:
 * - Personality Dilemma Cards (Option A vs Option B)
 * - Celebrity Vibe Checks & Room Pointing Votes
 * - Impersonation and Speed Roast Actions
 * - Apocalyptic & Chaotic KMK Trios
 */
export function generatePersonalityCustomCards(options: PersonalityCustomCardOptions = {}): CustomGameCard[] {
  seedInitialCatalog()

  const count = Math.min(Math.max(1, options.count || 10), 50)
  const style = options.style || "all"

  const result = getPeople({
    category: options.category === "all" ? undefined : options.category,
    gender: options.gender === "mixed" ? undefined : options.gender,
    hasImageOnly: true,
    sortBy: "random",
    limit: 500,
    moderationStatus: "approved"
  })

  const pool = result.items
  if (pool.length < 2) return []

  const cards: CustomGameCard[] = []
  const shuffled = shuffle(pool)
  let cursor = 0

  for (let i = 0; i < count; i++) {
    const p1 = shuffled[cursor % shuffled.length]
    cursor++
    const p2 = shuffled[cursor % shuffled.length]
    cursor++
    const p3 = shuffled[cursor % shuffled.length]
    cursor++

    const cardMode = i % 4 // Alternate card mechanisms for variety

    if (cardMode === 0) {
      // Dilemma Card
      const templateList = style === "dark"
        ? WYR_DARK_TEMPLATES
        : style === "quirky"
          ? WYR_QUIRKY_TEMPLATES
          : ALL_WYR_TEMPLATES
      const rawTemplate = templateList[i % templateList.length]
      const dilemmaText = rawTemplate.includes("{A}")
        ? rawTemplate.replace(/\{A\}/g, p1.name).replace(/\{B\}/g, p2.name)
        : `Would you rather spend 48 hours trapped in a vault with ${p1.name} OR ${p2.name}?`

      cards.push({
        id: `card_pers_dilemma_${Date.now()}_${i}`,
        title: `Dilemma: ${p1.name} vs ${p2.name}`,
        content: dilemmaText,
        type: "dilemma",
        sips: 2,
        target: "current",
        options: [p1.name, p2.name],
        tags: ["personality", p1.category, "dilemma"]
      })
    } else if (cardMode === 1) {
      // Vibe Check / Pointing Vote Card
      cards.push({
        id: `card_pers_vote_${Date.now()}_${i}`,
        title: `Celebrity Vibe Check: ${p1.name}`,
        content: `Who in this room gives off the biggest ${p1.name} energy? On the count of 3, everyone point. Most voted player drinks 2 sips!`,
        type: "vote",
        sips: 2,
        target: "point",
        tags: ["personality", p1.category, "vote"]
      })
    } else if (cardMode === 2) {
      // Speed Impression / Roast Action
      cards.push({
        id: `card_pers_action_${Date.now()}_${i}`,
        title: `Speed Impression: ${p1.name}`,
        content: `Give your most dramatic 20-second impression of ${p1.name} without saying their name. If the room doesn't guess it, drink 3 sips!`,
        type: "action",
        sips: 3,
        target: "current",
        timerSeconds: 20,
        tags: ["personality", p1.category, "action"]
      })
    } else {
      // Chaotic KMK Card
      const scenarioList = style === "dark"
        ? KMK_DARK_SCENARIOS
        : style === "spicy"
          ? KMK_SPICY_SCENARIOS
          : KMK_QUIRKY_SCENARIOS
      const scenario = scenarioList[i % scenarioList.length]

      cards.push({
        id: `card_pers_kmk_${Date.now()}_${i}`,
        title: `Apocalyptic KMK: ${p1.name}, ${p2.name}, ${p3.name}`,
        content: `${scenario}: ${p1.name}, ${p2.name}, and ${p3.name}. Make your Kiss, Marry, Kill choices out loud or take 3 sips!`,
        type: "action",
        sips: 3,
        target: "current",
        tags: ["personality", "kmk", p1.category]
      })
    }
  }

  return cards
}
