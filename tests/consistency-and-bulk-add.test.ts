import test from "node:test"
import assert from "node:assert/strict"
import { resetDbForTesting, getDb } from "../lib/catalog/db"
import { seedInitialCatalog, seedExpandedPersonalities, bulkAddPersons, getPeople } from "../lib/catalog/service"
import { generateKMKRounds, generateWYRRounds } from "../lib/catalog/game-generator"
import { NextRequest } from "next/server"
import { POST as bulkAddRoute } from "../app/api/catalog/bulk-add/route"

test("Consistency, Expanded Catalog (100s/1000s) & Bulk Comma-Separated Values", async (t) => {
  resetDbForTesting()
  seedInitialCatalog()

  await t.test("Catalog expands to hundreds of figures across scientists, tech, and anime", () => {
    const db = getDb()
    const countRow = db.prepare("SELECT count(*) as total FROM people").get() as any
    // Total should now be > 200 personalities!
    assert.ok(countRow.total >= 200, `Expected at least 200 personalities, got ${countRow.total}`)

    // Check specific scientists and tech icons exist
    const einstein = db.prepare("SELECT * FROM people WHERE normalized_name = 'albert einstein'").get() as any
    assert.ok(einstein, "Albert Einstein should exist in catalog")
    assert.equal(einstein.category, "scientists")

    const curie = db.prepare("SELECT * FROM people WHERE normalized_name = 'marie curie'").get() as any
    assert.ok(curie, "Marie Curie should exist in catalog")
    assert.equal(curie.category, "scientists")

    const jobs = db.prepare("SELECT * FROM people WHERE normalized_name = 'steve jobs'").get() as any
    assert.ok(jobs, "Steve Jobs should exist in catalog")
    assert.equal(jobs.category, "tech")
  })

  await t.test("KMK and WYR generators draw from entire expanded pool with huge variety", () => {
    const rounds = generateKMKRounds({ count: 10 })
    assert.equal(rounds.length, 10)

    const allPersonNames = new Set<string>()
    for (const r of rounds) {
      assert.equal(r.persons.length, 3)
      for (const p of r.persons) {
        allPersonNames.add(p.name)
      }
    }

    // In 10 rounds (30 slots), we should have high diversity (at least 20 distinct persons)
    assert.ok(allPersonNames.size >= 20, `Expected diverse names across rounds, got ${allPersonNames.size}`)
  })

  await t.test("bulkAddPersons adds comma-separated names and safely skips duplicates", () => {
    // 1. Add fresh batch of comma-separated names
    const result1 = bulkAddPersons({
      rawNames: "Nikola Tesla, J. Robert Oppenheimer, Ada Lovelace, Walter White, Heisenberg (Breaking Bad), Shrek",
      category: "scientists",
      addedBy: "PartyHost"
    })

    // Tesla, Oppenheimer, Lovelace, Shrek, Walter White are already in expanded catalog,
    // so they should be detected as duplicates and skipped!
    assert.ok(result1.skippedDuplicates.length >= 3, "Known names should be identified as duplicates")

    // 2. Add brand new custom names
    const result2 = bulkAddPersons({
      rawNames: "Dr. Strange, Tony Montana, Legolas Greenleaf, Dr. Strange, Tony Montana",
      category: "fantasy",
      addedBy: "PlayerDave"
    })

    // Intra-batch and DB deduplication
    assert.ok(result2.added.some((p) => p.name.includes("Dr. Strange")))
    assert.ok(result2.added.some((p) => p.name.includes("Tony Montana")))
    assert.ok(result2.skippedDuplicates.includes("Dr. Strange") || result2.skippedDuplicates.includes("Tony Montana"))
  })

  await t.test("POST /api/catalog/bulk-add API endpoint processes comma-separated input", async () => {
    const req = new NextRequest("http://localhost:3000/api/catalog/bulk-add", {
      method: "POST",
      body: JSON.stringify({
        names: "Rick Sanchez, Morty Smith, Captain Jack Sparrow, Rick Sanchez",
        category: "anime",
        addedBy: "PartyUser1"
      })
    })

    const res = await bulkAddRoute(req)
    const json = await res.json()

    assert.equal(res.status, 200)
    assert.equal(json.success, true)
    assert.ok(json.data.totalAdded >= 1)
    assert.ok(json.data.skippedDuplicates.includes("Rick Sanchez") || json.data.skippedDuplicates.length >= 1)
  })
})
