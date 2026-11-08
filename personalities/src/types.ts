// Shared types for the personality seed data.

export type Gender = "male" | "female" | "non-binary" | "other"

export type Category =
  | "bollywood"
  | "hollywood"
  | "actors"
  | "singers"
  | "athletes"
  | "scientists"
  | "tech"
  | "models"
  | "creators"
  | "glamour"
  | "history"
  | "writers"
  | "artists"
  | "fantasy"
  | "icons"

/** Original, minimal shape (kept so existing code keeps compiling). */
export interface SeedPersonality {
  name: string
  gender: Gender
  category: Category
  tags: string[]
  description: string
}

/** Enriched record used by the generated seed files. */
export interface Personality extends SeedPersonality {
  /** Wikidata Q-id - stable unique key. */
  id: string
  /** Portrait URL (Wikimedia Commons), or null when no free image exists. */
  image: string | null
  /** How famous the person is (number of Wikipedia language editions). Use for difficulty tiers. */
  popularity: number
  /** Primary citizenship, English label. */
  country: string | null
  birthYear: number | null
  /** Raw occupations from Wikidata (English labels). */
  occupations: string[]
  /** Alternative names (Wikidata aliases) - handy for answer checking and search. */
  aliases: string[]
  /** "A+" = household name (80+ wiki editions, or 40+ with a famous body of work); "A" = clearly known. */
  tier: "A" | "A+"
  /** Sitelinks of the most famous thing this person is attached to (show/film/song/band/team). */
  workFame: number
  /** True for the opt-in categories (scientists, history): only used when explicitly requested. */
  optIn: boolean
  /** Survivors only: everyone is 70 or younger (age at death for the deceased). */
  age: number | null
  deathYear: number | null
  /** Looks signal: 2 = appearance is the profession (model/adult/pageant), 1 = visual performer, 0 = not. */
  beauty: 0 | 1 | 2
  /** True when the record belongs in the default kiss/marry/kill pool (visual, not opt-in). */
  visual: boolean
}
