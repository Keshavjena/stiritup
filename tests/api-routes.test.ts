import test from "node:test"
import assert from "node:assert/strict"
import { NextRequest } from "next/server"
import { GET as getPeopleRoute, POST as postPeopleRoute } from "../app/api/catalog/people/route"
import { GET as getPersonByIdRoute, POST as postImageToPersonRoute } from "../app/api/catalog/people/[id]/route"
import { GET as discoverRoute } from "../app/api/catalog/discover/route"
import { POST as importRoute } from "../app/api/catalog/import/route"
import { POST as submissionsRoute, GET as getSubmissionsRoute } from "../app/api/catalog/submissions/route"
import { resetDbForTesting } from "../lib/catalog/db"

test("Catalog API Routes Integration", async (t) => {
  resetDbForTesting()

  await t.test("GET /api/catalog/people with pagination and category filter", async () => {
    const req = new NextRequest("http://localhost:3000/api/catalog/people?category=bollywood&page=1&limit=5")
    const res = await getPeopleRoute(req)
    const json = await res.json()

    assert.equal(res.status, 200)
    assert.equal(json.success, true)
    assert.ok(json.items.length <= 5)
    assert.ok(json.total > 0)
    assert.equal(json.page, 1)
    assert.ok(json.items.every((p: any) => p.category === "bollywood"))
  })

  await t.test("POST /api/catalog/people creates new person safely", async () => {
    const req = new NextRequest("http://localhost:3000/api/catalog/people", {
      method: "POST",
      body: JSON.stringify({
        name: "Cillian Murphy",
        gender: "male",
        category: "hollywood",
        provider: "community"
      })
    })
    const res = await postPeopleRoute(req)
    const json = await res.json()

    assert.equal(res.status, 200)
    assert.equal(json.success, true)
    assert.equal(json.data.name, "Cillian Murphy")
    assert.equal(json.data.category, "hollywood")
  })

  await t.test("GET /api/catalog/people/[id] and POST image with attribution", async () => {
    // 1. Get first person from catalog
    const listReq = new NextRequest("http://localhost:3000/api/catalog/people?limit=1")
    const listRes = await getPeopleRoute(listReq)
    const listJson = await listRes.json()
    const targetPerson = listJson.items[0]

    // 2. Fetch person by ID
    const getReq = new NextRequest(`http://localhost:3000/api/catalog/people/${targetPerson.id}`)
    const getRes = await getPersonByIdRoute(getReq, { params: Promise.resolve({ id: targetPerson.id }) })
    const getJson = await getRes.json()

    assert.equal(getRes.status, 200)
    assert.equal(getJson.data.id, targetPerson.id)

    // 3. Attach a new image source to person
    const imgReq = new NextRequest(`http://localhost:3000/api/catalog/people/${targetPerson.id}`, {
      method: "POST",
      body: JSON.stringify({
        url: "https://upload.wikimedia.org/portrait-new.jpg",
        provider: "wikimedia",
        externalId: "File:portrait-new.jpg",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:portrait-new.jpg",
        license: "CC BY-SA 4.0",
        author: "Photojournalist Dave",
        width: 1000,
        height: 1200,
        mimeType: "image/jpeg",
        isPrimary: true
      })
    })
    const imgRes = await postImageToPersonRoute(imgReq, { params: Promise.resolve({ id: targetPerson.id }) })
    const imgJson = await imgRes.json()

    assert.equal(imgRes.status, 200)
    assert.equal(imgJson.success, true)
    assert.equal(imgJson.data.image.license, "CC BY-SA 4.0")
    assert.equal(imgJson.data.image.isPrimary, true)
    assert.ok(imgJson.data.image.attribution.includes("Photojournalist Dave"))
  })

  await t.test("GET /api/catalog/discover returns candidates with and without portraits", async () => {
    const req = new NextRequest("http://localhost:3000/api/catalog/discover?q=Deepika+Padukone&limit=2")
    const res = await discoverRoute(req)
    const json = await res.json()

    assert.equal(res.status, 200)
    assert.equal(json.success, true)
    assert.ok(Array.isArray(json.candidates))

    if (json.candidates.length > 0) {
      const first = json.candidates[0]
      assert.ok(first.name)
      assert.ok(first.externalId)
      assert.ok(typeof first.hasPortrait === "boolean")
    }
  })

  await t.test("POST /api/catalog/import imports candidate into DB catalog", async () => {
    const req = new NextRequest("http://localhost:3000/api/catalog/import", {
      method: "POST",
      body: JSON.stringify({
        candidate: {
          provider: "wikidata",
          externalId: "Q11703",
          name: "Ada Lovelace",
          aliases: ["Augusta Ada King"],
          description: "English mathematician and writer",
          gender: "female",
          category: "other",
          imageReferences: [],
          hasPortrait: false
        }
      })
    })
    const res = await importRoute(req)
    const json = await res.json()

    assert.equal(res.status, 200)
    assert.equal(json.success, true)
    assert.equal(json.data.name, "Ada Lovelace")
    assert.equal(json.data.externalId, "Q11703")
    assert.ok(json.data.primaryImage, "Fallback placeholder should be attached for person without portrait")
  })

  await t.test("Community submissions endpoint POST and GET", async () => {
    const postReq = new NextRequest("http://localhost:3000/api/catalog/submissions", {
      method: "POST",
      body: JSON.stringify({
        submissionType: "person",
        proposedData: {
          name: "Zendaya",
          suggestedCategory: "hollywood"
        },
        submitterName: "CommunityFan"
      })
    })
    const postRes = await submissionsRoute(postReq)
    const postJson = await postRes.json()
    assert.equal(postRes.status, 200)
    assert.equal(postJson.success, true)
    assert.equal(postJson.data.submissionType, "person")

    const getReq = new NextRequest("http://localhost:3000/api/catalog/submissions")
    const getRes = await getSubmissionsRoute(getReq)
    const getJson = await getRes.json()
    assert.equal(getRes.status, 200)
    assert.ok(getJson.submissions.length >= 1)
  })
})
