import test from "node:test"
import assert from "node:assert/strict"
import { NextRequest } from "next/server"
import { isAuthorizedAdmin, isAuthorizedCron } from "../lib/security/auth"
import { POST as bulkAddRoute } from "../app/api/catalog/bulk-add/route"
import { POST as draftPresetsRoute } from "../app/api/draft/presets/route"
import { POST as postPeopleRoute } from "../app/api/catalog/people/route"
import { resetDbForTesting } from "../lib/catalog/db"

test("Defensive Security Verification Suite", async (t) => {
  resetDbForTesting()

  await t.test("isAuthorizedAdmin fails closed when ADMIN_API_KEY is missing in production", () => {
    const origEnv = process.env.NODE_ENV
    const origKey = process.env.ADMIN_API_KEY
    try {
      process.env.NODE_ENV = "production"
      delete process.env.ADMIN_API_KEY

      const req = new NextRequest("http://localhost:3000/api/catalog/moderation")
      assert.equal(isAuthorizedAdmin(req), false)

      const fakeReq = new NextRequest("http://localhost:3000/api/catalog/moderation", {
        headers: { authorization: "Bearer invalid-key" }
      })
      assert.equal(isAuthorizedAdmin(fakeReq), false)
    } finally {
      process.env.NODE_ENV = origEnv
      if (origKey !== undefined) process.env.ADMIN_API_KEY = origKey
    }
  })

  await t.test("isAuthorizedAdmin accepts valid Bearer token matching ADMIN_API_KEY", () => {
    const origKey = process.env.ADMIN_API_KEY
    try {
      process.env.ADMIN_API_KEY = "super-secret-admin-token-123"

      const req = new NextRequest("http://localhost:3000/api/catalog/moderation", {
        headers: { authorization: "Bearer super-secret-admin-token-123" }
      })
      assert.equal(isAuthorizedAdmin(req), true)

      const badReq = new NextRequest("http://localhost:3000/api/catalog/moderation", {
        headers: { authorization: "Bearer wrong-token" }
      })
      assert.equal(isAuthorizedAdmin(badReq), false)
    } finally {
      if (origKey !== undefined) process.env.ADMIN_API_KEY = origKey
      else delete process.env.ADMIN_API_KEY
    }
  })

  await t.test("isAuthorizedCron fails closed in production when CRON_SECRET is missing or invalid", () => {
    const origEnv = process.env.NODE_ENV
    const origSecret = process.env.CRON_SECRET
    try {
      process.env.NODE_ENV = "production"
      delete process.env.CRON_SECRET

      const req = new NextRequest("http://localhost:3000/api/catalog/refresh")
      assert.equal(isAuthorizedCron(req), false)

      process.env.CRON_SECRET = "cron-token-xyz"
      const validReq = new NextRequest("http://localhost:3000/api/catalog/refresh", {
        headers: { authorization: "Bearer cron-token-xyz" }
      })
      assert.equal(isAuthorizedCron(validReq), true)
    } finally {
      process.env.NODE_ENV = origEnv
      if (origSecret !== undefined) process.env.CRON_SECRET = origSecret
      else delete process.env.CRON_SECRET
    }
  })

  await t.test("POST /api/catalog/bulk-add rejects oversized payload > 10,000 characters", async () => {
    const giantString = "A".repeat(10001)
    const req = new NextRequest("http://localhost:3000/api/catalog/bulk-add", {
      method: "POST",
      body: JSON.stringify({ names: giantString })
    })

    const res = await bulkAddRoute(req)
    assert.equal(res.status, 413)
    const json = await res.json()
    assert.equal(json.success, false)
    assert.ok(json.error.includes("Payload too large"))
  })

  await t.test("POST /api/draft/presets rejects presets exceeding 100 items", async () => {
    const items = Array.from({ length: 101 }, (_, i) => ({ name: `Item ${i}` }))
    const req = new NextRequest("http://localhost:3000/api/draft/presets", {
      method: "POST",
      body: JSON.stringify({
        preset: {
          title: "Huge Preset",
          items
        }
      })
    })

    const res = await draftPresetsRoute(req)
    assert.equal(res.status, 400)
    const json = await res.json()
    assert.equal(json.success, false)
    assert.ok(json.error.includes("100 items"))
  })

  await t.test("POST /api/catalog/people forces moderationStatus to pending when unauthenticated in production", async () => {
    const origEnv = process.env.NODE_ENV
    const origKey = process.env.ADMIN_API_KEY
    try {
      process.env.NODE_ENV = "production"
      delete process.env.ADMIN_API_KEY

      const req = new NextRequest("http://localhost:3000/api/catalog/people", {
        method: "POST",
        body: JSON.stringify({
          name: "Unapproved User Candidate",
          category: "creators",
          moderationStatus: "approved"
        })
      })

      const res = await postPeopleRoute(req)
      const json = await res.json()
      assert.equal(res.status, 200)
      assert.equal(json.success, true)
      assert.equal(json.data.moderationStatus, "pending")
    } finally {
      process.env.NODE_ENV = origEnv
      if (origKey !== undefined) process.env.ADMIN_API_KEY = origKey
    }
  })
})

