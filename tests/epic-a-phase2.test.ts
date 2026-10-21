import test from "node:test"
import assert from "node:assert/strict"
import { resetDbForTesting, getDb } from "../lib/catalog/db.ts"
import {
  seedInitialCatalog,
  getPeople,
  getPersonById,
  upsertPerson
} from "../lib/catalog/service.ts"
import {
  rankCandidateIdentity,
  recordRejectedMatch,
  getRejectedMatches,
  matchImageForPerson
} from "../lib/catalog/matching-pipeline.ts"
import {
  validateSubmissionInput,
  createCommunityPersonSubmission,
  getSubmissionsForReview,
  approveCommunitySubmission,
  rejectCommunitySubmission,
  removeCatalogContent,
  fileCatalogReport,
  resolveCatalogReport
} from "../lib/catalog/moderation-service.ts"
import {
  generateKMKRounds,
  generateWYRRounds,
  personToPersonCard
} from "../lib/catalog/game-generator.ts"
import {
  acquireJobLock,
  releaseJobLock,
  runIncrementalCatalogRefresh
} from "../lib/catalog/refresh-service.ts"
import { NormalizedPersonCandidate } from "../lib/catalog/types.ts"

test("STIR-104: Source-Aware Image Matching Pipeline", async (t) => {
  resetDbForTesting()
  seedInitialCatalog()

  const targetPerson = upsertPerson({
    name: "Chris Evans",
    category: "hollywood",
    gender: "male",
    provider: "local",
    description: "American actor famous for Captain America"
  })

  await t.test("Never assumes matching name alone proves image identity", () => {
    // Candidate 1: Exact actor Chris Evans
    const actorCandidate: NormalizedPersonCandidate = {
      provider: "wikidata",
      externalId: "Q178348",
      name: "Chris Evans",
      aliases: ["Christopher Robert Evans"],
      description: "American actor",
      gender: "male",
      category: "hollywood",
      imageReferences: ["Chris_Evans_2023.jpg"],
      hasPortrait: true,
      primaryCandidateImage: {
        fileName: "Chris_Evans_2023.jpg",
        url: "https://upload.wikimedia.org/chris.jpg",
        thumbnailUrl: "https://upload.wikimedia.org/chris_thumb.jpg",
        sourcePageUrl: "https://commons.wikimedia.org/wiki/File:Chris_Evans_2023.jpg",
        license: "CC BY-SA 4.0",
        author: "Photographer",
        verificationStatus: "verified",
        formattedAttribution: "Photo by Photographer"
      }
    }

    // Candidate 2: Namesake British presenter Chris Evans (different category / nationality)
    const presenterCandidate: NormalizedPersonCandidate = {
      provider: "wikidata",
      externalId: "Q335372",
      name: "Chris Evans",
      aliases: ["Christopher James Evans"],
      description: "English television presenter and radio DJ",
      gender: "male",
      category: "other",
      imageReferences: ["Chris_Evans_Radio.jpg"],
      hasPortrait: true
    }

    const rankActor = rankCandidateIdentity(targetPerson, actorCandidate)
    const rankPresenter = rankCandidateIdentity(targetPerson, presenterCandidate)

    assert.ok(rankActor.score > rankPresenter.score, "Actor candidate must rank significantly higher than non-actor namesake")
    assert.equal(rankActor.confidence, "HIGH")
    assert.notEqual(rankPresenter.confidence, "HIGH")
  })

  await t.test("Flags ambiguous matches for human review and never auto-publishes", () => {
    // Candidate with same name but ambiguous category and conflicting gender
    const ambiguousCandidate: NormalizedPersonCandidate = {
      provider: "wikidata",
      externalId: "Q777777",
      name: "Chris Evans",
      aliases: [],
      description: "British author",
      gender: "unknown",
      category: "other",
      imageReferences: ["Author_Photo.jpg"],
      hasPortrait: true
    }

    const rankAmbiguous = rankCandidateIdentity(targetPerson, ambiguousCandidate)
    assert.equal(rankAmbiguous.confidence, "AMBIGUOUS")
    assert.equal(rankAmbiguous.requiresHumanReview, true)
    assert.ok(rankAmbiguous.reasoning.includes("Ambiguous"))
  })

  await t.test("Stores rejected matches and avoids repeatedly suggesting them", () => {
    const candidateUrl = "https://upload.wikimedia.org/bad_chris.jpg"

    // Record rejected match
    const rejection = recordRejectedMatch({
      personId: targetPerson.id,
      provider: "wikimedia",
      externalId: "Q9999",
      url: candidateUrl,
      reason: "Wrong person / Different Chris Evans",
      rejectedBy: "reviewer_1"
    })

    assert.ok(rejection.id)
    const rejections = getRejectedMatches(targetPerson.id)
    assert.equal(rejections.length, 1)
    assert.equal(rejections[0].url, candidateUrl)

    // Re-evaluating this candidate should now be flagged as previously rejected
    const previouslyRejectedCandidate: NormalizedPersonCandidate = {
      provider: "wikidata",
      externalId: "Q9999",
      name: "Chris Evans",
      aliases: [],
      gender: "male",
      category: "hollywood",
      imageReferences: ["bad_chris.jpg"],
      hasPortrait: true,
      primaryCandidateImage: {
        fileName: "bad_chris.jpg",
        url: candidateUrl,
        thumbnailUrl: candidateUrl,
        sourcePageUrl: "https://commons.wikimedia.org/wiki/File:bad_chris.jpg",
        license: "CC BY 3.0",
        verificationStatus: "verified",
        formattedAttribution: "Attribution"
      }
    }

    const rankResult = rankCandidateIdentity(targetPerson, previouslyRejectedCandidate, rejections)
    assert.equal(rankResult.isRejectedPreviously, true)
    assert.equal(rankResult.confidence, "MISMATCHED")
  })
})

test("STIR-105: Community Submissions, Moderation & Takedowns", async (t) => {
  resetDbForTesting()
  seedInitialCatalog()

  await t.test("Submission input validation enforces name, category, and consent", () => {
    // Missing consent
    const noConsent = validateSubmissionInput({
      name: "Valid Name",
      category: "hollywood",
      consentConfirmed: false
    })
    assert.equal(noConsent.isValid, false)
    assert.ok(noConsent.error?.includes("consent"))

    // Invalid category
    const invalidCat = validateSubmissionInput({
      name: "Valid Name",
      category: "invalid_category" as any,
      consentConfirmed: true
    })
    assert.equal(invalidCat.isValid, false)

    // Valid input
    const valid = validateSubmissionInput({
      name: "Florence Pugh",
      category: "hollywood",
      consentConfirmed: true,
      imageUrl: "https://upload.wikimedia.org/florence.jpg"
    })
    assert.equal(valid.isValid, true)
  })

  await t.test("Community submissions never enter the public game catalog before approval", () => {
    const sub = createCommunityPersonSubmission({
      name: "Pending Indie Celebrity",
      category: "hollywood",
      consentConfirmed: true,
      submitterName: "FanUser"
    })

    assert.equal(sub.moderationStatus, "pending")

    // Query active catalog: pending submission MUST NOT be in public results!
    const publicResults = getPeople({ query: "Pending Indie Celebrity" })
    assert.equal(publicResults.items.length, 0, "Pending community submissions must never be served publicly")
  })

  await t.test("Admin review provides duplicate suggestions and approval workflow", () => {
    // Submit an existing celebrity name
    createCommunityPersonSubmission({
      name: "Shah Rukh Khan",
      category: "bollywood",
      consentConfirmed: true
    })

    const reviewQueue = getSubmissionsForReview("pending")
    assert.ok(reviewQueue.length >= 1)

    const srkReview = reviewQueue.find((item) => item.submission.proposedData.name === "Shah Rukh Khan")
    assert.ok(srkReview, "Should find pending submission")
    assert.ok(srkReview.duplicateSuggestions.length >= 1, "Must detect potential duplicate of existing catalog star")

    // Approve a new valid submission
    const newSub = createCommunityPersonSubmission({
      name: "Anya Taylor-Joy",
      category: "hollywood",
      consentConfirmed: true,
      imageUrl: "https://upload.wikimedia.org/anya.jpg"
    })

    const approvalResult = approveCommunitySubmission(newSub.id, "moderator_test")
    assert.equal(approvalResult.submission.moderationStatus, "approved")
    assert.equal(approvalResult.person.name, "Anya Taylor-Joy")

    // Now it MUST appear in the public catalog
    const activePublic = getPeople({ query: "Anya Taylor-Joy" })
    assert.equal(activePublic.items.length, 1)
  })

  await t.test("Removal workflow ensures removed content is no longer served", () => {
    // 1. Create approved person
    const person = upsertPerson({
      name: "Takedown Candidate",
      category: "hollywood",
      provider: "community",
      moderationStatus: "approved"
    })

    assert.ok(getPeople({ query: "Takedown Candidate" }).items.length > 0)

    // 2. Remove content
    removeCatalogContent("person", person.id, "Privacy takedown requested by representative")

    // 3. Verify removed person is NEVER served in public queries
    const activeList = getPeople({ query: "Takedown Candidate" })
    assert.equal(activeList.items.length, 0, "Removed content must never be served")

    const personRecord = getPersonById(person.id)
    assert.equal(personRecord?.moderationStatus, "removed")
  })

  await t.test("Reporting workflow handles severe privacy/copyright reports", () => {
    const person = upsertPerson({
      name: "Flagged Public Star",
      category: "popstars",
      provider: "community",
      moderationStatus: "approved"
    })

    const report = fileCatalogReport({
      targetType: "person",
      targetId: person.id,
      reason: "privacy_violation",
      details: "Private individual requested removal"
    })

    assert.equal(report.status, "pending")

    // Content should immediately be flagged
    const flaggedPerson = getPersonById(person.id)
    assert.equal(flaggedPerson?.moderationStatus, "flagged")

    // Resolve report with removal
    const resolved = resolveCatalogReport(report.id, "removed", "Confirmed takedown")
    assert.equal(resolved.status, "resolved")
    assert.equal(getPersonById(person.id)?.moderationStatus, "removed")
  })
})

test("STIR-106: Image Cards for Kiss Marry Kill and Would You Rather", async (t) => {
  resetDbForTesting()
  seedInitialCatalog()

  await t.test("Generates 3 distinct PersonCard objects for Kiss Marry Kill rounds", () => {
    const rounds = generateKMKRounds({ count: 5, category: "bollywood" })
    assert.ok(rounds.length > 0)

    for (const round of rounds) {
      assert.equal(round.persons.length, 3, "KMK round must have exactly 3 persons")
      const [p1, p2, p3] = round.persons
      assert.notEqual(p1.id, p2.id, "Duplicate prevention: Person 1 and 2 must differ")
      assert.notEqual(p2.id, p3.id, "Duplicate prevention: Person 2 and 3 must differ")
      assert.notEqual(p1.id, p3.id, "Duplicate prevention: Person 1 and 3 must differ")

      for (const p of round.persons) {
        assert.ok(p.name)
        assert.ok(p.imageUrl)
        assert.ok(p.thumbnailUrl)
        assert.ok(p.license)
      }
    }
  })

  await t.test("Generates 2 distinct PersonCard objects for Would You Rather rounds", () => {
    const rounds = generateWYRRounds({ count: 5, category: "hollywood" })
    assert.ok(rounds.length > 0)

    for (const round of rounds) {
      assert.ok(round.optionA)
      assert.ok(round.optionB)
      assert.notEqual(round.optionA.id, round.optionB.id, "Duplicate prevention: Option A and B must differ")
      assert.ok(round.scenario.includes("Would you rather"))
    }
  })

  await t.test("Works gracefully even when one or more portraits are unavailable", () => {
    // Person with missing portrait
    const personNoImage = upsertPerson({
      name: "Star Without Photo",
      category: "other",
      provider: "community",
      moderationStatus: "approved"
    })

    const card = personToPersonCard(personNoImage)
    assert.equal(card.hasVerifiedPortrait, false)
    assert.equal(card.imageUrl, "/placeholder-user.jpg")
    assert.ok(card.name)
  })
})

test("STIR-107: Scheduled Incremental Refresh and Revalidation", async (t) => {
  resetDbForTesting()
  seedInitialCatalog()

  await t.test("Distributed job lock prevents concurrent executions", () => {
    const lock1 = acquireJobLock("test_job", "worker_1", 60)
    assert.equal(lock1, true, "First worker should acquire lock")

    const lock2 = acquireJobLock("test_job", "worker_2", 60)
    assert.equal(lock2, false, "Second worker should be blocked while lock is active")

    releaseJobLock("test_job", "worker_1")
    const lock3 = acquireJobLock("test_job", "worker_2", 60)
    assert.equal(lock3, true, "Worker 2 should acquire lock after release")
    releaseJobLock("test_job", "worker_2")
  })

  await t.test("Incremental refresh processes stale records without reimporting catalog", async () => {
    const stats = await runIncrementalCatalogRefresh({
      batchSize: 5,
      dryRun: true // tests logic without making real HTTP calls
    })

    assert.ok(stats.jobId)
    assert.ok(stats.processed <= 5)
    assert.ok(stats.verifiedOk <= 5)
    assert.equal(stats.errors, 0)
  })
})
