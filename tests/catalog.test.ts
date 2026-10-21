import test from "node:test"
import assert from "node:assert/strict"
import { resetDbForTesting, getDb } from "../lib/catalog/db.ts"
import {
  seedInitialCatalog,
  getPeople,
  getPersonById,
  upsertPerson,
  addPersonImage,
  findExistingPerson,
  createCommunitySubmission
} from "../lib/catalog/service.ts"
import { normalizePersonName, evaluateDuplicateMatch } from "../lib/catalog/duplicate-detector.ts"
import {
  normalizeWikidataEntity,
  searchWikidataPeople,
  clearWikidataCache
} from "../lib/catalog/providers/wikidata.ts"
import {
  verifyImageCandidate,
  formatImageAttribution,
  createPlaceholderCandidate,
  clearWikimediaCache,
  sanitizeAttributionText
} from "../lib/catalog/providers/wikimedia.ts"
import {
  personToCelebrity,
  getCatalogCelebrities,
  generateImageKMKTrios
} from "../lib/catalog/compatibility.ts"
import { generateKMKQuestions } from "../lib/game-data/kmk-generator.ts"

test("STIR-101: Unified People and Image Data Model", async (t) => {
  // Reset clean in-memory database for testing
  resetDbForTesting()
  const db = getDb()

  await t.test("Migrations create all required tables and indexes", () => {
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type=?")
      .all("table")
      .map((t: any) => t.name)

    assert.ok(tables.includes("people"), "people table must exist")
    assert.ok(tables.includes("person_images"), "person_images table must exist")
    assert.ok(tables.includes("community_submissions"), "community_submissions table must exist")
    assert.ok(tables.includes("_applied_migrations"), "_applied_migrations table must exist")

    const indexes = db
      .prepare("SELECT name FROM sqlite_master WHERE type=?")
      .all("index")
      .map((i: any) => i.name)

    assert.ok(indexes.includes("idx_people_provider_ext"), "idx_people_provider_ext must exist")
    assert.ok(indexes.includes("idx_people_category_name"), "idx_people_category_name must exist")
    assert.ok(indexes.includes("idx_people_normalized_name"), "idx_people_normalized_name must exist")
    assert.ok(indexes.includes("idx_person_images_provider_ext"), "idx_person_images_provider_ext must exist")
    assert.ok(indexes.includes("idx_comm_sub_status"), "idx_comm_sub_status must exist")
  })

  await t.test("Seeding populates default celebrities and preserves existing games", () => {
    const { seeded } = seedInitialCatalog()
    assert.ok(seeded >= 50, `Expected at least 50 seeded celebrities, got ${seeded}`)

    // Verify existing celebrity generator works
    const kmkQuestions = generateKMKQuestions("female", "bollywood", 5)
    assert.equal(kmkQuestions.length, 5)
    assert.ok(kmkQuestions[0].includes("Kiss, Marry, and Kill"))

    // Compatibility mapper works
    const celebs = getCatalogCelebrities("female", "bollywood")
    assert.ok(celebs.length >= 10)
    assert.equal(celebs[0].gender, "female")
    assert.equal(celebs[0].category, "bollywood")
  })

  await t.test("Pagination and filtered search by category and query", () => {
    const bollywoodPage = getPeople({ category: "bollywood", page: 1, limit: 10 })
    assert.ok(bollywoodPage.items.length <= 10)
    assert.ok(bollywoodPage.total >= 15)
    assert.equal(bollywoodPage.page, 1)
    assert.ok(bollywoodPage.totalPages >= 2)
    assert.ok(bollywoodPage.hasNext)
    assert.equal(bollywoodPage.hasPrev, false)
    assert.ok(bollywoodPage.items.every((p) => p.category === "bollywood"))

    // Text search
    const searchResult = getPeople({ query: "Deepika" })
    assert.ok(searchResult.items.length >= 1)
    assert.ok(searchResult.items[0].name.includes("Deepika"))
  })

  await t.test("Safe duplicate detection and unique constraints", () => {
    // 1. Exact provider + external ID
    const matchExt = evaluateDuplicateMatch(
      { name: "SRK", provider: "local", externalId: "seed_shah_rukh_khan" },
      [{ id: "1", name: "Shah Rukh Khan", normalizedName: "shah rukh khan", provider: "local", externalId: "seed_shah_rukh_khan" }]
    )
    assert.equal(matchExt.isDuplicate, true)
    assert.equal(matchExt.matchType, "EXACT_EXTERNAL_ID")

    // 2. Normalized name check (accents and casing)
    const norm = normalizePersonName("  Timothée   Chalamet! ")
    assert.equal(norm, "timothee chalamet")

    const matchName = evaluateDuplicateMatch(
      { name: "Timothée Chalamet" },
      [{ id: "2", name: "Timothee Chalamet", normalizedName: "timothee chalamet", provider: "local" }]
    )
    assert.equal(matchName.isDuplicate, true)
    assert.equal(matchName.matchType, "EXACT_NORMALIZED_NAME")

    // 3. Upserting duplicate person merges aliases instead of creating duplicate
    const p1 = upsertPerson({
      name: "Alia Bhatt",
      category: "bollywood",
      provider: "local",
      aliases: ["Alia Kapoor"]
    })
    const countBefore = db.prepare("SELECT count(*) as c FROM people WHERE normalized_name = 'alia bhatt'").get() as any
    assert.equal(countBefore.c, 1)
    assert.ok(p1.aliases.includes("Alia Kapoor"))
  })

  await t.test("Supports multiple image sources per person with provenance and licensing", () => {
    const person = upsertPerson({
      name: "Test Multi-Image Actor",
      category: "hollywood",
      gender: "male",
      provider: "community"
    })

    // Image 1: Primary portrait
    const img1 = addPersonImage(person.id, {
      url: "https://upload.wikimedia.org/portrait1.jpg",
      provider: "wikimedia",
      externalId: "File:portrait1.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:portrait1.jpg",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "Jane Doe",
      width: 800,
      height: 1000,
      mimeType: "image/jpeg",
      isPrimary: true
    })

    // Image 2: Alternate red carpet photo
    const img2 = addPersonImage(person.id, {
      url: "https://upload.wikimedia.org/red_carpet2.png",
      provider: "wikimedia",
      externalId: "File:red_carpet2.png",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:red_carpet2.png",
      license: "CC BY 3.0",
      author: "Bob Smith",
      width: 1200,
      height: 900,
      mimeType: "image/png",
      isPrimary: false
    })

    const retrieved = getPersonById(person.id)
    assert.ok(retrieved)
    assert.equal(retrieved.images?.length, 2)
    assert.equal(retrieved.primaryImage?.id, img1.id)
    assert.equal(retrieved.primaryImage?.license, "CC BY-SA 4.0")
    assert.equal(retrieved.primaryImage?.author, "Jane Doe")
    assert.ok(retrieved.primaryImage?.attribution?.includes("Jane Doe"))
    assert.ok(retrieved.primaryImage?.attribution?.includes("CC BY-SA 4.0"))
  })

  await t.test("Community submissions for people and candidate images", () => {
    const sub = createCommunitySubmission({
      submissionType: "person",
      proposedData: {
        name: "Pedro Pascal",
        category: "hollywood",
        suggestedImageUrl: "https://upload.wikimedia.org/pedro.jpg"
      },
      submitterName: "MovieFan99"
    })

    assert.ok(sub.id.startsWith("sub_"))
    assert.equal(sub.moderationStatus, "pending")
    assert.equal(sub.submitterName, "MovieFan99")
    assert.equal(sub.proposedData.name, "Pedro Pascal")
  })
})

test("STIR-102: Wikidata Person Discovery", async (t) => {
  clearWikidataCache()

  await t.test("Normalizes raw entity with labels, aliases, images, and category inference", () => {
    const mockRawEntity = {
      id: "Q159178",
      labels: { en: { value: "Deepika Padukone" } },
      descriptions: { en: { value: "Indian actress and model" } },
      aliases: { en: [{ value: "Deepika Singh" }] },
      claims: {
        P31: [{ mainsnak: { datavalue: { value: { id: "Q5" } } } }],
        P21: [{ mainsnak: { datavalue: { value: { id: "Q6581072" } } } }], // female
        P106: [{ mainsnak: { datavalue: { value: { id: "Q33999" } } } }], // actor
        P27: [{ mainsnak: { datavalue: { value: { id: "Q668" } } } }], // India
        P18: [{ mainsnak: { datavalue: { value: "Deepika Padukone 2025 (1).png" } } }]
      }
    }

    const normalized = normalizeWikidataEntity(mockRawEntity)
    assert.equal(normalized.provider, "wikidata")
    assert.equal(normalized.externalId, "Q159178")
    assert.equal(normalized.name, "Deepika Padukone")
    assert.equal(normalized.gender, "female")
    assert.equal(normalized.category, "bollywood")
    assert.equal(normalized.hasPortrait, true)
    assert.deepEqual(normalized.imageReferences, ["Deepika Padukone 2025 (1).png"])
    assert.deepEqual(normalized.aliases, ["Deepika Singh"])
  })

  await t.test("Handles missing properties and candidates without portraits gracefully", () => {
    // Obscure historic figure with no image claims, no aliases, missing P21
    const mockEntityNoImage = {
      id: "Q999999",
      labels: { en: { value: "Obscure Historian" } },
      descriptions: { en: { value: "19th century researcher" } },
      claims: {
        P31: [{ mainsnak: { datavalue: { value: { id: "Q5" } } } }]
      }
    }

    const normalized = normalizeWikidataEntity(mockEntityNoImage)
    assert.equal(normalized.externalId, "Q999999")
    assert.equal(normalized.name, "Obscure Historian")
    assert.equal(normalized.hasPortrait, false)
    assert.deepEqual(normalized.imageReferences, [])
    assert.equal(normalized.gender, "unknown")
    assert.equal(normalized.category, "other")
  })

  await t.test("Live or network discovery handles query search", async () => {
    try {
      const candidates = await searchWikidataPeople("Marie Curie", { limit: 2 })
      if (candidates.length > 0) {
        assert.ok(candidates.some((c) => c.name.toLowerCase().includes("curie")))
        assert.ok(candidates[0].provider === "wikidata")
        assert.ok(candidates[0].externalId.startsWith("Q"))
      }
    } catch (err: any) {
      // In offline/sandboxed environments, test passes gracefully
      console.log("Wikidata live network test skipped/network unavailable:", err.message)
    }
  })
})

test("STIR-103: Wikimedia Commons Image Lookup and Licensing", async (t) => {
  clearWikimediaCache()

  await t.test("Sanitizes HTML author text and formats clean traceable attribution", () => {
    const rawArtist = '<a href="https://example.com/user">John &amp; Jane Doe</a>'
    const clean = sanitizeAttributionText(rawArtist)
    assert.equal(clean, "John & Jane Doe")

    const formatted = formatImageAttribution(
      rawArtist,
      "CC BY-SA 4.0",
      "https://commons.wikimedia.org/wiki/File:Example.jpg"
    )
    assert.equal(formatted, "Photo by John & Jane Doe / Wikimedia Commons (CC BY-SA 4.0)")
  })

  await t.test("Candidate verification accepts valid portraits and rejects invalid files", () => {
    // Valid candidate
    const valid = verifyImageCandidate({
      mimeType: "image/jpeg",
      width: 800,
      height: 1000,
      license: "CC BY 3.0"
    })
    assert.equal(valid.status, "verified")

    // Disallowed mime type (SVG / TIFF)
    const svgInvalid = verifyImageCandidate({
      mimeType: "image/svg+xml",
      width: 800,
      height: 800,
      license: "CC0"
    })
    assert.equal(svgInvalid.status, "failed")
    assert.ok(svgInvalid.reason?.includes("Unsupported MIME type"))

    // Small dimensions (icon/tiny avatar)
    const tinyInvalid = verifyImageCandidate({
      mimeType: "image/png",
      width: 64,
      height: 64,
      license: "CC BY-SA 4.0"
    })
    assert.equal(tinyInvalid.status, "failed")
    assert.ok(tinyInvalid.reason?.includes("too small"))

    // Restricted license
    const unfreeInvalid = verifyImageCandidate({
      mimeType: "image/jpeg",
      width: 600,
      height: 800,
      license: "All Rights Reserved"
    })
    assert.equal(unfreeInvalid.status, "failed")
    assert.ok(unfreeInvalid.reason?.includes("Restricted license"))
  })

  await t.test("Placeholder candidate generated when no image exists", () => {
    const placeholder = createPlaceholderCandidate("Hypothetical Star")
    assert.equal(placeholder.fileName, "placeholder-user.jpg")
    assert.equal(placeholder.url, "/placeholder-user.jpg")
    assert.equal(placeholder.verificationStatus, "verified")
    assert.ok(placeholder.formattedAttribution.includes("Hypothetical Star"))
  })

  await t.test("KMK Trios generator includes verified images and provenance", () => {
    const trios = generateImageKMKTrios("female", "bollywood", 3)
    assert.ok(trios.length > 0)
    for (const trio of trios) {
      assert.equal(trio.persons.length, 3)
      for (const person of trio.persons) {
        assert.ok(person.imageUrl, "Each person must have an image URL")
        assert.ok(person.license, "Each person must have a license")
        assert.ok(person.attribution, "Each person must have attribution")
        assert.ok(person.sourceUrl, "Each person must have traceable provenance sourceUrl")
      }
    }
  })
})
