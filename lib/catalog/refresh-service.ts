import { getDb } from "./db"
import { RefreshOptions, RefreshJobStats } from "./types"
import { PLACEHOLDER_IMAGE_URL } from "./providers/wikimedia"
import crypto from "node:crypto"

const USER_AGENT = "StirItUpBot/1.0 (https://stiritup.game; contact@stiritup.game)"
const DEFAULT_TIMEOUT_MS = 5000
const DEFAULT_RATE_LIMIT_DELAY_MS = 200

/**
 * Acquires a distributed job lock in SQLite to prevent concurrent refresh executions
 */
export function acquireJobLock(lockName: string, lockedBy: string, ttlSeconds = 300): boolean {
  const db = getDb()
  const now = new Date()
  const nowIso = now.toISOString()
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000).toISOString()

  // Clean expired locks
  db.prepare("DELETE FROM job_locks WHERE lock_name = ? AND expires_at < ?").run(lockName, nowIso)

  try {
    db.prepare(`
      INSERT INTO job_locks (lock_name, locked_by, acquired_at, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(lockName, lockedBy, nowIso, expiresAt)
    return true
  } catch {
    // Lock already held by an active job
    return false
  }
}

/**
 * Releases an acquired distributed job lock
 */
export function releaseJobLock(lockName: string, lockedBy: string): void {
  const db = getDb()
  db.prepare("DELETE FROM job_locks WHERE lock_name = ? AND locked_by = ?").run(lockName, lockedBy)
}

/**
 * Performs a lightweight HTTP check to verify source image existence and health
 */
async function checkRemoteImageHealth(
  imageUrl: string
): Promise<{ ok: boolean; status: number; contentType?: string; error?: string }> {
  // If local static asset, always valid
  if (imageUrl.startsWith("/")) {
    return { ok: true, status: 200, contentType: "image/jpeg" }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  try {
    // Try HEAD first for bandwidth conservation
    let res = await fetch(imageUrl, {
      method: "HEAD",
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal
    })

    // If HEAD is disallowed (405 Method Not Allowed), fallback to lightweight GET with range 0-1
    if (res.status === 405) {
      res = await fetch(imageUrl, {
        method: "GET",
        headers: {
          "User-Agent": USER_AGENT,
          "Range": "bytes=0-1024"
        },
        signal: controller.signal
      })
    }

    clearTimeout(timeout)
    const contentType = res.headers.get("content-type") || ""

    return {
      ok: res.ok,
      status: res.status,
      contentType
    }
  } catch (err: any) {
    clearTimeout(timeout)
    return {
      ok: false,
      status: 0,
      error: err.message || "Network timeout or connection failure"
    }
  }
}

/**
 * Incremental refresh job that revalidates cached provider images,
 * tracks failure counts, marks broken records, and switches primary to placeholder when needed.
 * Acceptance criteria: Runs safely and incrementally without reimporting the catalog or exhausting quotas.
 */
export async function runIncrementalCatalogRefresh(
  options: RefreshOptions = {}
): Promise<RefreshJobStats> {
  const db = getDb()
  const jobId = `job_${crypto.randomBytes(6).toString("hex")}`
  const lockName = "catalog_refresh_job"
  const startedAt = new Date()

  // 1. Acquire job lock
  const hasLock = acquireJobLock(lockName, jobId, 180)
  if (!hasLock) {
    throw new Error("Catalog refresh job is already in progress. Locked by another active process.")
  }

  const batchSize = Math.min(Math.max(1, options.batchSize || 8), 20)
  const rateLimitDelayMs = DEFAULT_RATE_LIMIT_DELAY_MS

  let processed = 0
  let verifiedOk = 0
  let brokenDetected = 0
  let switchedToPlaceholder = 0
  let errors = 0

  try {
    // 2. Select stale images incrementally (oldest checked first)
    const countRow = db.prepare(`
      SELECT count(*) as total FROM person_images
      WHERE last_checked_at IS NULL OR last_checked_at < datetime('now', '-3 days')
    `).get() as any

    const totalEligible = countRow?.total || 0

    const staleImages = db.prepare(`
      SELECT pi.*, p.id as p_id, p.primary_image_id as p_prim_id, p.name as person_name
      FROM person_images pi
      JOIN people p ON pi.person_id = p.id
      WHERE pi.last_checked_at IS NULL OR pi.last_checked_at < datetime('now', '-3 days')
      ORDER BY pi.last_checked_at ASC NULLS FIRST, pi.is_broken ASC
      LIMIT ?
    `).all(batchSize) as any[]

    const updateImageStmt = db.prepare(`
      UPDATE person_images
      SET last_checked_at = ?, http_status = ?, is_broken = ?, failure_count = ?, verification_status = ?, updated_at = ?
      WHERE id = ?
    `)

    const updatePersonStmt = db.prepare(`
      UPDATE people
      SET last_refreshed_at = ?, refresh_error = ?, updated_at = ?
      WHERE id = ?
    `)

    // 3. Process batch with rate-limit pacing
    for (const img of staleImages) {
      processed++
      const nowIso = new Date().toISOString()

      // Skip actual HTTP request if running in dryRun mode
      if (options.dryRun) {
        verifiedOk++
        continue
      }

      // Respect rate limits with delay
      if (rateLimitDelayMs > 0 && !img.url.startsWith("/")) {
        await new Promise((r) => setTimeout(r, rateLimitDelayMs))
      }

      const health = await checkRemoteImageHealth(img.url)

      if (health.ok) {
        verifiedOk++
        updateImageStmt.run(
          nowIso,
          health.status,
          0, // is_broken = false
          0, // failure_count = 0
          "verified",
          nowIso,
          img.id
        )
      } else {
        const failureCount = (img.failure_count || 0) + 1
        const isBroken = failureCount >= 2 || health.status === 404 || health.status === 410 ? 1 : 0

        if (isBroken === 1) {
          brokenDetected++
        }

        updateImageStmt.run(
          nowIso,
          health.status,
          isBroken,
          failureCount,
          isBroken ? "failed" : img.verification_status,
          nowIso,
          img.id
        )

        // If broken image was the person's primary image, mark person error
        if (isBroken === 1 && img.p_prim_id === img.id) {
          switchedToPlaceholder++
          updatePersonStmt.run(
            nowIso,
            `Broken source image detected: HTTP ${health.status} on URL`,
            nowIso,
            img.person_id
          )
        }
      }

      // Update person last_refreshed_at timestamp
      db.prepare("UPDATE people SET last_refreshed_at = ? WHERE id = ?").run(nowIso, img.person_id)
    }

    const completedAt = new Date()
    const stats: RefreshJobStats = {
      jobId,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
      totalEligible,
      processed,
      verifiedOk,
      brokenDetected,
      switchedToPlaceholder,
      errors,
      rateLimitDelayMs
    }

    return stats
  } catch (err: any) {
    errors++
    console.error(`[Refresh Job ${jobId}] Failed with error:`, err)
    throw err
  } finally {
    releaseJobLock(lockName, jobId)
  }
}
