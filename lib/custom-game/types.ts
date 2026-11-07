export type CustomCardType =
  | "action"      // Dare, physical or social challenge
  | "rule"        // Standing party rule / curse active across rounds
  | "vote"        // Point or vote for someone in the room
  | "dilemma"     // Option A vs Option B choice
  | "confession"  // Truth or secret confession
  | "trivia"      // Speed challenge with optional answer

export type CustomCardTarget =
  | "current"     // The active player whose turn it is
  | "all"         // Everyone in the room
  | "point"       // Everyone points at someone on 3
  | "rival"       // Current player picks someone to challenge
  | "two_players" // Two chosen players

export interface CustomGameCard {
  id: string
  content: string
  type: CustomCardType
  title?: string
  sips: number                // Sips penalty (0 = just for laughs, 1-3 = standard, 5 = shot!)
  target: CustomCardTarget
  timerSeconds?: number      // e.g. 15, 30, 60 or undefined for untimed
  options?: [string, string] // For dilemma type: [Option A, Option B]
  triviaAnswer?: string      // Hidden answer for trivia type
  submittedBy?: string       // Player who contributed the card
  isCurse?: boolean          // Standing rule that stays active
  tags?: string[]
}

export interface CustomGameDeck {
  id: string
  title: string
  description: string
  author?: string
  isMature: boolean
  defaultTimerDuration: number
  cards: CustomGameCard[]
  createdAt: string
  updatedAt: string
}

export interface CustomTemplatePreset {
  id: string
  title: string
  name: string
  description: string
  icon: string
  isMature: boolean
  category: string
  defaultTimerDuration: number
  cards: Omit<CustomGameCard, "id">[]
}
