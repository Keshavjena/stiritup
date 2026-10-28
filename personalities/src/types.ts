// Shared types for the personality seed data.

export type Gender = "male" | "female" | "non-binary" | "other"

export type Category =
  | "bollywood"
  | "hollywood"
  | "actors"
  | "singers"
  | "popstars"
  | "athletes"
  | "scientists"
  | "tech"
  | "models"
  | "creators"
  | "glamour"
  | "adultstars"
  | "onlyfans"
  | "f1"
  | "combat"
  | "wwe"
  | "viral"
  | "history"
  | "writers"
  | "artists"
  | "fantasy"
  | "anime"
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
}
