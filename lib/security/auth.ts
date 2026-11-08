import { NextRequest } from "next/server"

/**
 * Validates administrative authorization for sensitive mutations and moderation.
 * 
 * In production:
 *   - Requires ADMIN_API_KEY environment variable.
 *   - Fails closed (returns false) if ADMIN_API_KEY is not configured or mismatch.
 * 
 * In development / testing:
 *   - If ADMIN_API_KEY is set, enforces it strictly.
 *   - If ADMIN_API_KEY is unset, permits local development and tests while logging a warning.
 */
export function isAuthorizedAdmin(req: NextRequest): boolean {
  const adminSecret = process.env.ADMIN_API_KEY
  const authHeader = req.headers.get("authorization")
  const xApiKey = req.headers.get("x-api-key")

  if (adminSecret) {
    return authHeader === `Bearer ${adminSecret}` || xApiKey === adminSecret
  }

  // Production MUST have ADMIN_API_KEY defined — fail closed
  if (process.env.NODE_ENV === "production") {
    return false
  }

  // In non-production environments without ADMIN_API_KEY, permit local calls
  return true
}

/**
 * Validates cron / background worker authorization.
 */
export function isAuthorizedCron(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get("authorization")

  if (cronSecret) {
    return authHeader === `Bearer ${cronSecret}`
  }

  // Production MUST have CRON_SECRET defined — fail closed
  if (process.env.NODE_ENV === "production") {
    return false
  }

  return true
}

