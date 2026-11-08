import { NextRequest, NextResponse } from "next/server"
import { runIncrementalCatalogRefresh } from "@/lib/catalog/refresh-service"
import { isAuthorizedCron } from "@/lib/security/auth"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorizedCron(req)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid or missing cron secret" },
        { status: 401 }
      )
    }

    let body: any = {}
    try {
      body = await req.json()
    } catch {
      // Body may be empty in automated cron calls
    }

    const batchSize = parseInt(body.batchSize || "8", 10)
    const dryRun = Boolean(body.dryRun)

    const stats = await runIncrementalCatalogRefresh({
      batchSize,
      dryRun
    })

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error: any) {
    console.error("Error in POST /api/catalog/refresh:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute catalog refresh" },
      { status: 500 }
    )
  }
}
