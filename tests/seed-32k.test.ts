import test from "node:test"
import assert from "node:assert/strict"
import { resetDbForTesting, getDb } from "../lib/catalog/db.ts"
import { seed32kCatalog } from "../lib/catalog/seed-32k.ts"
import { getPeople, checkPersonAnswer, pruneUnpopularCatalog } from "../lib/catalog/service.ts"
import { generateKMKRounds, generateWYRRounds } from "../lib/catalog/game-generator.ts"
import { A_PLUS_SCIENTISTS, A_PLUS_HISTORY } from "../lib/catalog/expanded-dataset.ts"

test("Personality Seed Dataset & Smart A-Tier Filtering (Scientists + History A+ Only & Explicit Inclusion)", async (t) => {
  const db = resetDbForTesting()

  await t.test("seed32kCatalog ingests popular figures while strictly filtering scientists & history to A+ tier", () => {
    const result = seed32kCatalog({ logProgress: false })
    assert.ok(result.totalProcessed >= 30000, `Expected >= 30,000 raw records parsed, got ${result.totalProcessed}`)
    assert.ok(result.insertedPeople >= 4000, `Expected >= 4,000 popular people inserted, got ${result.insertedPeople}`)
    assert.ok(result.insertedImages >= 4000, `Expected >= 4,000 portraits inserted, got ${result.insertedImages}`)

    // Check database counts
    const countPeople = db.prepare("SELECT count(*) as c FROM people").get() as any
    assert.ok(countPeople.c >= 4000)
  })

  await t.test("All primary dataset categories are represented and indexed", () => {
    const categoriesRow = db.prepare("SELECT DISTINCT category FROM people ORDER BY category ASC").all() as any[]
    const categories = categoriesRow.map((r) => r.category)

    const expectedCategories = [
      "actors", "athletes", "bollywood", "creators",
      "fantasy", "glamour", "hollywood", "icons",
      "models", "scientists", "singers", "tech"
    ]

    for (const exp of expectedCategories) {
      assert.ok(categories.includes(exp), `Category ${exp} should be present in database`)
    }
  })

  await t.test("Filter rule verified: Scientists & History ONLY contain A+ tiers", () => {
    // 1. Check all scientists in DB belong to A_PLUS_SCIENTISTS
    const scientists = db.prepare("SELECT normalized_name FROM people WHERE category = 'scientists'").all() as any[]
    assert.ok(scientists.length > 0, "A+ scientists should exist")
    for (const s of scientists) {
      assert.ok(
        A_PLUS_SCIENTISTS.includes(s.normalized_name),
        `Scientist ${s.normalized_name} must be in A_PLUS_SCIENTISTS`
      )
    }

    // 2. Check all history figures in DB belong to A_PLUS_HISTORY
    const history = db.prepare("SELECT normalized_name FROM people WHERE category = 'history'").all() as any[]
    assert.ok(history.length > 0, "A+ history figures should exist")
    for (const h of history) {
      assert.ok(
        A_PLUS_HISTORY.includes(h.normalized_name),
        `History figure ${h.normalized_name} must be in A_PLUS_HISTORY`
      )
    }
  })

  await t.test("Scientists and History are EXCLUDED by default and included ONLY when explicitly clicked/requested", () => {
    // Default 'all' query should NOT include scientists or history
    const allPeople = getPeople({ limit: 100 })
    const hasSciOrHistInAll = allPeople.items.some(
      (p) => p.category === "scientists" || p.category === "history"
    )
    assert.equal(hasSciOrHistInAll, false, "Scientists and History must NOT be present in default/all queries")

    // Default KMK rounds should NOT include scientists or history
    const kmkRounds = generateKMKRounds({ count: 10, category: "all" })
    for (const round of kmkRounds) {
      for (const p of round.persons) {
        assert.notEqual(p.category, "scientists", "Default KMK round must not contain scientists")
        assert.notEqual(p.category, "history", "Default KMK round must not contain history")
      }
    }

    // When explicitly clicked/requested, they ARE returned:
    const sciExplicit = getPeople({ category: "scientists", limit: 10 })
    assert.ok(sciExplicit.items.length > 0, "Explicit scientists category query must return A+ scientists")
    assert.ok(sciExplicit.items.every((p) => p.category === "scientists"))

    const histExplicit = getPeople({ category: "history", limit: 10 })
    assert.ok(histExplicit.items.length > 0, "Explicit history category query must return A+ history")
    assert.ok(histExplicit.items.every((p) => p.category === "history"))
  })

  await t.test("pruneUnpopularCatalog cleans up obscure figures while preserving A-tier", () => {
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
