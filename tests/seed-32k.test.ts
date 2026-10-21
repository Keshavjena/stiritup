import test from "node:test"
import assert from "node:assert/strict"
import { resetDbForTesting, getDb } from "../lib/catalog/db.ts"
import { seed32kCatalog } from "../lib/catalog/seed-32k.ts"
import { getPeople, checkPersonAnswer, pruneUnpopularCatalog } from "../lib/catalog/service.ts"
import { generateKMKRounds, generateWYRRounds } from "../lib/catalog/game-generator.ts"

test("Personality Seed Dataset (32k) & Smart Filtering (Scientists + History + Popular Only)", async (t) => {
  const db = resetDbForTesting()

  await t.test("seed32kCatalog ingests popular figures (popularity >= 40) plus ALL scientists and history", () => {
    // Ingest with default minPopularity = 40 (except scientists and history)
    const result = seed32kCatalog({ logProgress: false })
    assert.ok(result.totalProcessed >= 30000, `Expected >= 30,000 raw records parsed, got ${result.totalProcessed}`)
    assert.ok(result.insertedPeople >= 14000, `Expected >= 14,000 popular people inserted, got ${result.insertedPeople}`)
    assert.ok(result.insertedImages >= 14000, `Expected >= 14,000 portraits inserted, got ${result.insertedImages}`)

    // Check database counts
    const countPeople = db.prepare("SELECT count(*) as c FROM people").get() as any
    const countImages = db.prepare("SELECT count(*) as c FROM person_images").get() as any
    assert.ok(countPeople.c >= 14000)
    assert.ok(countImages.c >= 14000)
  })

  await t.test("All 15 dataset categories are represented and indexed", () => {
    const categoriesRow = db.prepare("SELECT DISTINCT category FROM people ORDER BY category ASC").all() as any[]
    const categories = categoriesRow.map((r) => r.category)

    const expectedCategories = [
      "actors", "artists", "athletes", "bollywood", "creators",
      "fantasy", "glamour", "history", "hollywood", "icons",
      "models", "scientists", "singers", "tech", "writers"
    ]

    for (const exp of expectedCategories) {
      assert.ok(categories.includes(exp), `Category ${exp} should be present in database`)
    }
  })

  await t.test("Filter rule verified: ALL scientists & history kept; non-scientists/non-history have popularity >= 40", () => {
    // 1. Scientists can have low or high popularity (all preserved)
    const sciLowPop = db.prepare("SELECT count(*) as c FROM people WHERE category = 'scientists' AND popularity < 40").get() as any
    assert.ok(sciLowPop.c > 0, "Lower-popularity scientists must be preserved")

    // 2. History figures can have low or high popularity (all preserved)
    const histLowPop = db.prepare("SELECT count(*) as c FROM people WHERE category = 'history' AND popularity < 40").get() as any
    assert.ok(histLowPop.c > 0, "Lower-popularity history figures must be preserved")

    // 3. For any other category, NO ONE with popularity < 40 should exist!
    const nonPopViolation = db.prepare("SELECT count(*) as c FROM people WHERE category NOT IN ('scientists', 'history') AND popularity < 40").get() as any
    assert.equal(nonPopViolation.c, 0, "No one under popularity 40 should exist outside scientists and history")
  })

  await t.test("pruneUnpopularCatalog function cleans up any unpopular non-exempt records", () => {
    // Add a test dummy low-popularity actor
    db.prepare(`
      INSERT INTO people (id, name, normalized_name, category, popularity, moderation_status, created_at, updated_at)
      VALUES ('p_test_obscure', 'Obscure Test Actor', 'obscure test actor', 'actors', 5, 'approved', '2026-01-01', '2026-01-01')
    `).run()

    const preCheck = db.prepare("SELECT id FROM people WHERE id = 'p_test_obscure'").get()
    assert.ok(preCheck, "Test obscure actor was inserted")

    // Run prune
    const pruneRes = pruneUnpopularCatalog({ minPopularity: 40 })
    assert.ok(pruneRes.deletedPeople >= 1)

    const postCheck = db.prepare("SELECT id FROM people WHERE id = 'p_test_obscure'").get()
    assert.equal(postCheck, undefined, "Obscure test actor must be pruned")
  })

  await t.test("Smart answer verification accepts canonical names and aliases", () => {
    const srkPerson = getPeople({ query: "Shah Rukh Khan", limit: 1 }).items[0]
    assert.ok(srkPerson, "Shah Rukh Khan must be found")

    // Exact name
    assert.equal(checkPersonAnswer("Shah Rukh Khan", srkPerson), true)
    // Lowercase
    assert.equal(checkPersonAnswer("shah rukh khan", srkPerson), true)
    // Punctuation / spacing insensitive
    assert.equal(checkPersonAnswer("Shah-Rukh-Khan!", srkPerson), true)
    // Alias SRK
    assert.equal(checkPersonAnswer("SRK", srkPerson), true)
    assert.equal(checkPersonAnswer("srk", srkPerson), true)
    // Alias King Khan
    assert.equal(checkPersonAnswer("King Khan", srkPerson), true)
    // Incorrect answer
    assert.equal(checkPersonAnswer("Tom Cruise", srkPerson), false)
  })

  await t.test("Game generators smartly use difficulty tiers and portrait prioritization", () => {
    const easyRounds = generateKMKRounds({ difficulty: "easy", count: 5 })
    assert.equal(easyRounds.length, 5)
    for (const round of easyRounds) {
      assert.equal(round.persons.length, 3)
      const ids = new Set(round.persons.map((p) => p.id))
      assert.equal(ids.size, 3)
      assert.ok(round.persons.some((p) => p.hasVerifiedPortrait))
    }

    const wyrRounds = generateWYRRounds({ category: "singers", count: 5 })
    assert.equal(wyrRounds.length, 5)
    for (const round of wyrRounds) {
      assert.ok(round.optionA.id !== round.optionB.id)
      assert.equal(round.optionA.category, "singers")
      assert.equal(round.optionB.category, "singers")
    }
  })
})
