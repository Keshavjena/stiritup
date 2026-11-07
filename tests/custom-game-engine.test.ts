import test from "node:test"
import assert from "node:assert/strict"
import { CUSTOM_GAME_TEMPLATES } from "../lib/custom-game/templates"
import {
  createDeckFromTemplate,
  createBlankDeck,
  inferCardDetails,
  parseBulkTextIntoCards,
  validateCustomDeck,
  exportDeckToJson,
  importDeckFromJson,
  convertCustomCardsToGameContent
} from "../lib/custom-game/engine"
import { CustomGameDeck } from "../lib/custom-game/types"

test("Custom Game Builder Engine Suite", async (t) => {
  await t.test("Prebuilt templates exist, load cleanly, and contain rich mechanisms", () => {
    assert.ok(CUSTOM_GAME_TEMPLATES.length >= 5, "Must have at least 5 curated templates")

    for (const tmpl of CUSTOM_GAME_TEMPLATES) {
      assert.ok(tmpl.id, "Template must have an id")
      assert.ok(tmpl.title, "Template must have a title")
      assert.ok(tmpl.cards.length >= 10, `${tmpl.title} must have at least 10 cards`)

      const types = new Set(tmpl.cards.map((c) => c.type))
      assert.ok(types.size >= 3, `${tmpl.title} must have at least 3 distinct card types`)

      for (const card of tmpl.cards) {
        assert.ok(card.content && card.content.length > 5, "Card must have meaningful content")
        assert.ok(["action", "rule", "vote", "dilemma", "confession", "trivia"].includes(card.type))
        assert.ok(typeof card.sips === "number" && card.sips >= 0)
        assert.ok(["current", "all", "point", "rival", "two_players"].includes(card.target))
        if (card.type === "dilemma" && card.options) {
          assert.equal(card.options.length, 2, "Dilemmas must have exactly 2 options")
        }
      }
    }
  })

  await t.test("createDeckFromTemplate instantiates a fully valid playable deck", () => {
    const deck = createDeckFromTemplate("wild-house-party")
    assert.equal(deck.title, "Wild House Party")
    assert.ok(deck.cards.length >= 12)
    assert.ok(deck.cards.every((c) => c.id && c.id.startsWith("card_")))

    const validation = validateCustomDeck(deck)
    assert.equal(validation.isValid, true)
    assert.equal(validation.errors.length, 0)
  })

  await t.test("Card inference detects mechanisms, options, and drink penalties", () => {
    const dilemma = inferCardDetails("Would you rather drink pickle juice or eat a raw onion?")
    assert.equal(dilemma.type, "dilemma")
    assert.deepEqual(dilemma.options, ["drink pickle juice", "eat a raw onion"])

    const vote = inferCardDetails("Point at the person most likely to spend all their savings on shoes.")
    assert.equal(vote.type, "vote")
    assert.equal(vote.target, "point")

    const confession = inferCardDetails("Never have I ever ghosted a date.")
    assert.equal(confession.type, "confession")
    assert.equal(confession.target, "all")

    const shotAction = inferCardDetails("Do 20 pushups right now or take a shot penalty!")
    assert.equal(shotAction.type, "action")
    assert.equal(shotAction.sips, 5)

    const curse = inferCardDetails("Curse of the Penguin: Must waddle when walking for the rest of the game.")
    assert.equal(curse.type, "rule")
  })

  await t.test("Bulk paste parser creates distinct cards from multi-line text input", () => {
    const rawPasted = `
      1. Take 2 sips if you arrived late tonight
      2. Would you rather have no internet for a week or no shower for a week?
      3. Point at the loudest person in this room
      4. Never have I ever skipped a workout to eat pizza
    `

    const cards = parseBulkTextIntoCards(rawPasted)
    assert.equal(cards.length, 4)
    assert.equal(cards[0].content, "Take 2 sips if you arrived late tonight")
    assert.equal(cards[0].sips, 2)
    assert.equal(cards[1].type, "dilemma")
    assert.equal(cards[2].type, "vote")
    assert.equal(cards[3].type, "confession")
  })

  await t.test("Deck validation rejects empty or invalid decks and accepts valid ones", () => {
    const emptyDeck = createBlankDeck("Empty")
    const emptyValidation = validateCustomDeck(emptyDeck)
    assert.equal(emptyValidation.isValid, false)
    assert.ok(emptyValidation.errors.length > 0)

    const blankTitleDeck: CustomGameDeck = {
      ...createDeckFromTemplate("wild-house-party"),
      title: ""
    }
    const blankValidation = validateCustomDeck(blankTitleDeck)
    assert.equal(blankValidation.isValid, false)

    const validDeck = createDeckFromTemplate("spicy-confessions")
    assert.equal(validateCustomDeck(validDeck).isValid, true)
  })

  await t.test("JSON export and import works losslessly with schema sanitization", () => {
    const original = createDeckFromTemplate("stan-wars")
    const exportedJson = exportDeckToJson(original)
    assert.ok(typeof exportedJson === "string")
    assert.ok(exportedJson.includes("stan-wars") || exportedJson.includes("Pop-Culture"))

    const imported = importDeckFromJson(exportedJson)
    assert.ok(imported)
    assert.equal(imported.title, original.title)
    assert.equal(imported.cards.length, original.cards.length)
    assert.equal(imported.cards[0].content, original.cards[0].content)

    // Robust handling of malformed input
    assert.equal(importDeckFromJson("not json"), null)
    assert.equal(importDeckFromJson("{}")?.title, "Imported Deck")
  })

  await t.test("convertCustomCardsToGameContent creates synchronized questions with tags and penalties", () => {
    const deck = createDeckFromTemplate("friend-group-roast")
    const { questions, customCards } = convertCustomCardsToGameContent(deck.cards)

    assert.equal(questions.length, deck.cards.length)
    assert.equal(customCards.length, deck.cards.length)

    // Checks that prefixes matching mechanisms are injected for backwards compatibility
    assert.ok(questions.some((q) => q.startsWith("[VOTE]")))
    assert.ok(questions.some((q) => q.startsWith("[DILEMMA]")))
    assert.ok(questions.some((q) => q.includes("sips")))
  })
})
