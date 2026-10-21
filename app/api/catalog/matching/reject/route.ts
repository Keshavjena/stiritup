import { NextRequest, NextResponse } from "next/server"
import { recordRejectedMatch } from "@/lib/catalog/matching-pipeline"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { personId, provider, externalId, url, reason, rejectedBy } = body

    if (!personId || !url || !reason) {
      return NextResponse.json(
        { success: false, error: "personId, url, and reason are required" },
        { status: 400 }
      )
    }

    const rejection = recordRejectedMatch({
      personId,
      provider: provider || "wikimedia",
      externalId,
      url,
      reason,
      rejectedBy: rejectedBy || "admin"
    })

    return NextResponse.json({
      success: true,
      data: rejection
    })
  } catch (error: any) {
    console.error("Error in POST /api/catalog/matching/reject:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record rejected match" },
      { status: 500 }
    )
  }
}
