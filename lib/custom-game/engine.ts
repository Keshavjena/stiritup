import { CustomCardType, CustomGameCard, CustomGameDeck } from "./types"
import { CUSTOM_GAME_TEMPLATES } from "./templates"

const STORAGE_KEY_DECKS = "stir_custom_decks_v1"
const STORAGE_KEY_ACTIVE = "stir_active_custom_deck_v1"

/**
 * Creates a unique card ID
 */
export function generateCardId(prefix = "card"): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`
}

/**
 * Creates a new deck from a template or a clean slate
 */
export function createDeckFromTemplate(templateId = "wild-house-party"): CustomGameDeck {
  const template = CUSTOM_GAME_TEMPLATES.find((t) => t.id === templateId) || CUSTOM_GAME_TEMPLATES[0]

  const now = new Date().toISOString()
  const cards: CustomGameCard[] = template.cards.map((card, idx) => ({
    ...card,
    id: `card_${idx + 1}_${Math.random().toString(36).substring(2, 7)}`
  }))

  return {
    id: `deck_${template.id}_${Date.now().toString(36)}`,
    title: template.title,
    description: template.description,
    isMature: template.isMature,
    defaultTimerDuration: template.defaultTimerDuration,
    cards,
    createdAt: now,
    updatedAt: now
  }
}

/**
 * Creates an empty blank custom deck
 */
export function createBlankDeck(title = "My Party Deck"): CustomGameDeck {
  const now = new Date().toISOString()
  return {
    id: `deck_custom_${Date.now().toString(36)}`,
    title,
    description: "Custom user-crafted party game rules and challenges.",
    isMature: true,
    defaultTimerDuration: 30,
    cards: [],
    createdAt: now,
    updatedAt: now
  }
}

/**
 * Automatically infers card mechanism, options, and sips from raw text
 */
export function inferCardDetails(text: string): {
  type: CustomCardType
  sips: number
  target: CustomGameCard["target"]
  options?: [string, string]
} {
  const lower = text.toLowerCase()

  // Sips detection (e.g. "take 2 sips", "drink 3", "finish drink", "take a shot")
  let sips = 1
  if (lower.includes("take a shot") || lower.includes("finish your drink") || lower.includes("down your drink")) {
    sips = 5
  } else if (lower.includes("3 sips") || lower.includes("drink 3")) {
    sips = 3
  } else if (lower.includes("2 sips") || lower.includes("drink 2")) {
    sips = 2
  } else if (lower.includes("1 sip") || lower.includes("drink 1")) {
    sips = 1
  }

  // Type inference
  if (lower.startsWith("would you rather") || lower.includes(" or ") && lower.includes("would you")) {
    // Extract Option A and Option B if format matches "Would you rather [A] or [B]"
    const match = text.match(/would you rather\s+(.+?)\s+or\s+(.+?)[\?\.!]?$/i)
    const options: [string, string] | undefined = match && match[1] && match[2]
      ? [match[1].trim(), match[2].trim()]
      : undefined
    return { type: "dilemma", sips, target: "current", options }
  }

  if (lower.startsWith("who is most likely") || lower.startsWith("point at the person") || lower.includes("point at")) {
    return { type: "vote", sips: sips || 2, target: "point" }
  }

  if (lower.startsWith("never have i ever") || lower.includes("confess") || lower.includes("secret")) {
    return { type: "confession", sips: sips || 1, target: "all" }
  }

  if (lower.includes("curse") || lower.includes("for the rest of the game") || lower.includes("for the next round") || lower.includes("rule:")) {
    return { type: "rule", sips: sips || 1, target: "all" }
  }

  if (lower.includes("name 5") || lower.includes("in 10 seconds") || lower.includes("trivia") || lower.includes("rapid fire")) {
    return { type: "trivia", sips: sips || 2, target: "current" }
  }

  return { type: "action", sips: sips || 2, target: "current" }
}

/**
 * Bulk text parser: Converts a multi-line pasted string into full CustomGameCards
 */
export function parseBulkTextIntoCards(
  rawText: string,
  defaultType?: CustomCardType,
  defaultSips?: number
): CustomGameCard[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("//") && !l.startsWith("#"))

  return lines.map((line, idx) => {
    // Remove leading numbering like "1. ", "1) ", "- "
    const cleanContent = line.replace(/^\d+[\.\)]\s*/, "").replace(/^[-*]\s*/, "").trim()
    const inferred = inferCardDetails(cleanContent)

    return {
      id: generateCardId(`bulk_${idx + 1}`),
      content: cleanContent,
      type: defaultType || inferred.type,
      sips: defaultSips !== undefined ? defaultSips : inferred.sips,
      target: inferred.target,
      options: inferred.options,
      isCurse: inferred.type === "rule",
      tags: ["bulk-added"]
    }
  })
}

/**
 * Validates a custom deck before starting the game
 */
export function validateCustomDeck(deck?: Partial<CustomGameDeck> | null): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!deck) {
    return { isValid: false, errors: ["No custom deck provided."] }
  }

  if (!deck.title || deck.title.trim().length === 0) {
    errors.push("Deck must have a title.")
  }

  if (!deck.cards || !Array.isArray(deck.cards) || deck.cards.length === 0) {
    errors.push("Deck must contain at least 1 prompt card.")
  } else {
    deck.cards.forEach((card, idx) => {
      if (!card.content || card.content.trim().length === 0) {
        errors.push(`Card #${idx + 1} has empty text content.`)
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Exports a deck to formatted JSON
 */
export function exportDeckToJson(deck: CustomGameDeck): string {
  return JSON.stringify(deck, null, 2)
}

/**
 * Imports a deck from a JSON string with safe schema sanitization
 */
export function importDeckFromJson(jsonStr: string): CustomGameDeck | null {
  try {
    const parsed = JSON.parse(jsonStr)
    if (!parsed || typeof parsed !== "object") return null

    const title = typeof parsed.title === "string" ? parsed.title.trim() : "Imported Deck"
    const description = typeof parsed.description === "string" ? parsed.description : ""
    const isMature = Boolean(parsed.isMature)
    const defaultTimerDuration = typeof parsed.defaultTimerDuration === "number" ? parsed.defaultTimerDuration : 30

    const rawCards = Array.isArray(parsed.cards) ? parsed.cards : []
    const cards: CustomGameCard[] = rawCards
      .filter((c: any) => c && typeof c.content === "string" && c.content.trim().length > 0)
      .map((c: any, idx: number) => {
        const inferred = inferCardDetails(c.content)
        return {
          id: typeof c.id === "string" ? c.id : generateCardId(`imp_${idx + 1}`),
          content: c.content.trim(),
          type: (["action", "rule", "vote", "dilemma", "confession", "trivia"].includes(c.type)
            ? c.type
            : inferred.type) as CustomCardType,
          title: typeof c.title === "string" ? c.title : undefined,
          sips: typeof c.sips === "number" ? Math.max(0, Math.min(10, c.sips)) : inferred.sips,
          target: (["current", "all", "point", "rival", "two_players"].includes(c.target)
            ? c.target
            : inferred.target) as CustomGameCard["target"],
          timerSeconds: typeof c.timerSeconds === "number" ? c.timerSeconds : undefined,
          options: Array.isArray(c.options) && c.options.length === 2 ? [String(c.options[0]), String(c.options[1])] : inferred.options,
          triviaAnswer: typeof c.triviaAnswer === "string" ? c.triviaAnswer : undefined,
          submittedBy: typeof c.submittedBy === "string" ? c.submittedBy : undefined,
          isCurse: Boolean(c.isCurse || c.type === "rule"),
          tags: Array.isArray(c.tags) ? c.tags.map(String) : []
        }
      })

    const now = new Date().toISOString()
    return {
      id: typeof parsed.id === "string" ? parsed.id : `deck_imported_${Date.now().toString(36)}`,
      title,
      description,
      isMature,
      defaultTimerDuration,
      cards: cards.length > 0 ? cards : createDeckFromTemplate("wild-house-party").cards,
      createdAt: now,
      updatedAt: now
    }
  } catch (err) {
    console.error("Failed to parse deck JSON:", err)
    return null
  }
}

/**
 * Saves a deck to browser localStorage
 */
export function saveDeckToStorage(deck: CustomGameDeck): void {
  if (typeof window === "undefined") return
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DECKS)
    const existing: CustomGameDeck[] = raw ? JSON.parse(raw) : []
    const updated = [deck, ...existing.filter((d) => d.id !== deck.id)].slice(0, 20)
    localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(updated))
    localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(deck))
  } catch (err) {
    console.warn("Could not save custom deck to localStorage:", err)
  }
}

/**
 * Loads all saved decks from localStorage
 */
export function loadSavedDecksFromStorage(): CustomGameDeck[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DECKS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Loads the last active deck from localStorage or creates default
 */
export function loadActiveDeckFromStorage(): CustomGameDeck {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ACTIVE)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && Array.isArray(parsed.cards) && parsed.cards.length > 0) {
          return parsed
        }
      }
    } catch {}
  }
  return createDeckFromTemplate("wild-house-party")
}

/**
 * Converts custom cards into serialized question texts for backward-compatible room state
 */
export function convertCustomCardsToGameContent(cards: CustomGameCard[]): {
  questions: string[]
  customCards: CustomGameCard[]
} {
  const questions = cards.map((card) => {
    let prefix = ""
    if (card.type === "rule") prefix = "[RULE] "
    else if (card.type === "vote") prefix = "[VOTE] "
    else if (card.type === "dilemma") prefix = "[DILEMMA] "
    else if (card.type === "confession") prefix = "[CONFESSION] "
    else if (card.type === "trivia") prefix = "[SPEED] "
    else if (card.type === "action") prefix = "[DARE] "

    let penalty = ""
    if (card.sips >= 5) penalty = " (Shot Penalty!)"
    else if (card.sips > 0) penalty = ` (${card.sips} ${card.sips === 1 ? "sip" : "sips"})`

    return `${prefix}${card.content}${penalty}`
  })

  return {
    questions,
    customCards: cards
  }
}
