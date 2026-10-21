import { NextRequest, NextResponse } from "next/server"
import { runIncrementalCatalogRefresh } from "@/lib/catalog/refresh-service"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    // If CRON_SECRET is configured, check bearer token
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
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
