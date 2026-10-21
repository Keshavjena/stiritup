import { NextRequest, NextResponse } from "next/server"
import { fileCatalogReport, resolveCatalogReport } from "@/lib/catalog/moderation-service"
import { getDb } from "@/lib/catalog/db"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { targetType, targetId, reason, details, reporterEmail } = body

    if (!targetType || !targetId || !reason) {
      return NextResponse.json(
        { success: false, error: "targetType, targetId, and reason are required" },
        { status: 400 }
      )
    }

    const report = fileCatalogReport({
      targetType,
      targetId,
      reason,
      details,
      reporterEmail
    })

    return NextResponse.json({
      success: true,
      message: "Report received. Content has been queued for immediate compliance review.",
      report
    })
  } catch (error: any) {
    console.error("Error in POST /api/catalog/report:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit report" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const db = getDb()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || "pending"

    const rows = db
      .prepare("SELECT * FROM catalog_reports WHERE status = ? ORDER BY created_at DESC LIMIT 50")
      .all(status) as any[]

    return NextResponse.json({
      success: true,
      reports: rows
    })
  } catch (error: any) {
    console.error("Error in GET /api/catalog/report:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve reports" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { reportId, resolution, actionTaken } = body

    if (!reportId || !resolution || !actionTaken) {
      return NextResponse.json(
        { success: false, error: "reportId, resolution ('removed'|'dismissed'), and actionTaken are required" },
        { status: 400 }
      )
    }

    const resolved = resolveCatalogReport(reportId, resolution, actionTaken)

    return NextResponse.json({
      success: true,
      report: resolved
    })
  } catch (error: any) {
    console.error("Error in PATCH /api/catalog/report:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to resolve report" },
      { status: 500 }
    )
  }
}
