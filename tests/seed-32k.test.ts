import test from "node:test"
import assert from "node:assert/strict"
import { resetDbForTesting, getDb } from "../lib/catalog/db.ts"
import { seed32kCatalog } from "../lib/catalog/seed-32k.ts"
import { getPeople, checkPersonAnswer, pruneUnpopularCatalog } from "../lib/catalog/service.ts"
import { generateKMKRounds, generateWYRRounds } from "../lib/catalog/game-generator.ts"

test("Personality Seed Dataset & Pure Pop-Culture Catalog (Scientists, History, Tech & Writers Purged + Anti-Consecutive Randomisation)", async (t) => {
  const db = resetDbForTesting()

  await t.test("seed32kCatalog ingests popular figures while completely skipping non-entertainment categories", () => {
    const result = seed32kCatalog({ logProgress: false })
    assert.ok(result.totalProcessed >= 30000, `Expected >= 30,000 raw records parsed, got ${result.totalProcessed}`)
    assert.ok(result.insertedPeople >= 4000, `Expected >= 4,000 popular people inserted, got ${result.insertedPeople}`)
    assert.ok(result.insertedImages >= 4000, `Expected >= 4,000 portraits inserted, got ${result.insertedImages}`)

    // Check database counts
    const countPeople = db.prepare("SELECT count(*) as c FROM people").get() as any
    assert.ok(countPeople.c >= 4000)
  })

  await t.test("All primary pop-culture categories are represented and indexed", () => {
    const categoriesRow = db.prepare("SELECT DISTINCT category FROM people ORDER BY category ASC").all() as any[]
    const categories = categoriesRow.map((r) => r.category)

    const expectedCategories = [
      "actors", "athletes", "bollywood", "creators",
      "fantasy", "glamour", "hollywood", "icons",
      "models", "singers"
    ]

    for (const exp of expectedCategories) {
      assert.ok(categories.includes(exp), `Category ${exp} should be present in database`)
    }
  })

  await t.test("Forbidden non-entertainment categories (scientists, history, tech, writers, artists) are completely absent", () => {
    const forbidden = ["scientists", "history", "tech", "writers", "artists"]
    for (const f of forbidden) {
      const count = db.prepare("SELECT count(*) as c FROM people WHERE category = ?").get(f) as any
      assert.equal(count.c, 0, `Category ${f} must have 0 people in active catalog`)
    }
  })

  await t.test("Anti-consecutive randomisation: KMK rounds NEVER contain identical personalities in consecutive rounds", () => {
    const kmkRounds = generateKMKRounds({ count: 20, category: "all" })
    assert.ok(kmkRounds.length >= 10, "Should generate rounds successfully")

    for (let i = 0; i < kmkRounds.length; i++) {
      const round = kmkRounds[i]
      const ids = round.persons.map((p) => p.id)
      const names = round.persons.map((p) => p.name)

      // 3 distinct persons inside each round
      assert.equal(new Set(ids).size, 3, `Round ${i} must have 3 distinct person IDs`)
      assert.equal(new Set(names).size, 3, `Round ${i} must have 3 distinct person names`)

      // STRICT anti-consecutive: ZERO overlap between round i and round i - 1
      if (i > 0) {
        const prevRound = kmkRounds[i - 1]
        const prevIds = new Set(prevRound.persons.map((p) => p.id))
        const prevNames = new Set(prevRound.persons.map((p) => p.name))

        for (const p of round.persons) {
          assert.equal(
            prevIds.has(p.id),
            false,
            `Person ${p.name} (id: ${p.id}) in round ${i} MUST NOT appear in immediate previous round ${i - 1}`
          )
          assert.equal(
            prevNames.has(p.name),
            false,
            `Person ${p.name} in round ${i} MUST NOT appear in immediate previous round ${i - 1}`
          )
        }
      }
    }
  })

  await t.test("Anti-consecutive randomisation: WYR rounds NEVER contain identical personalities in consecutive rounds", () => {
    const wyrRounds = generateWYRRounds({ count: 20, category: "all" })
    assert.ok(wyrRounds.length >= 10, "Should generate WYR rounds successfully")

    for (let i = 0; i < wyrRounds.length; i++) {
      const round = wyrRounds[i]
      assert.notEqual(round.optionA.id, round.optionB.id, `Round ${i} Option A and B must be distinct`)

      // STRICT anti-consecutive: ZERO overlap with previous round
      if (i > 0) {
        const prev = wyrRounds[i - 1]
        const prevIds = new Set([prev.optionA.id, prev.optionB.id])
        assert.equal(prevIds.has(round.optionA.id), false, `Option A (${round.optionA.name}) in round ${i} was in round ${i-1}`)
        assert.equal(prevIds.has(round.optionB.id), false, `Option B (${round.optionB.name}) in round ${i} was in round ${i-1}`)
      }
    }
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
      assert.ok(["singers", "popstars"].includes(round.optionA.category))
      assert.ok(["singers", "popstars"].includes(round.optionB.category))
    }
  })
})
