import { FEMALE_CELEBRITIES, MALE_CELEBRITIES, Celebrity } from "./celebrities"
import { getCatalogCelebrities } from "../catalog/compatibility"

export type KMKGender = "female" | "male" | "mixed"
export type KMKCategory = 
  | "all" 
  | "bollywood" 
  | "hollywood" 
  | "singers"
  | "popstars" 
  | "athletes"
  | "f1"
  | "combat"
  | "wwe"
  | "scientists"
  | "history"
  | "tech"
  | "writers"
  | "artists"
  | "actors"
  | "fantasy" 
  | "glamour"
  | "adultstars" 
  | "creators"
  | "models"
  | "icons"
  | "viral"

const FLAVOR_SCENARIOS = [
  "",
  " - On a deserted island!",
  " - During a 3 AM house party!",
  " - If you were stuck in an elevator together!",
  " - For a wild weekend trip to Las Vegas!",
  " - At a VIP lounge event!",
  " - If you had to spend a 10-hour flight seated together!"
]

export function generateKMKQuestions(
  gender: KMKGender = "female",
  category: KMKCategory = "all",
  count: number = 30
): string[] {
  let pool: Celebrity[] = []

  try {
    pool = getCatalogCelebrities(gender, category)
  } catch {
    // Direct static fallback
    if (gender === "female") {
      pool = [...FEMALE_CELEBRITIES]
    } else if (gender === "male") {
      pool = [...MALE_CELEBRITIES]
    } else {
      pool = [...FEMALE_CELEBRITIES, ...MALE_CELEBRITIES]
    }

    if (category !== "all") {
      const filtered = pool.filter((c) => c.category === category)
      if (filtered.length >= 3) {
        pool = filtered
      }
    } else {
      // Exclude scientists and history by default in 'all'
      pool = pool.filter((c) => c.category !== "scientists" && c.category !== "history")
    }
  }

  const questions: string[] = []
  const usedTrios = new Set<string>()

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const copy = [...arr]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }

  let attempts = 0
  while (questions.length < count && attempts < 200) {
    attempts++
    const shuffledPool = shuffleArray(pool)
    if (shuffledPool.length < 3) break

    const [a, b, c] = shuffledPool.slice(0, 3)
    const key = [a.name, b.name, c.name].sort().join("|")

    if (usedTrios.has(key)) continue
    usedTrios.add(key)

    const flavor = FLAVOR_SCENARIOS[Math.floor(Math.random() * FLAVOR_SCENARIOS.length)]
    questions.push(`Choose between: ${a.name}, ${b.name}, and ${c.name} for Kiss, Marry, and Kill${flavor}`)
  }

  return questions
}
