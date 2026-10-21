import { NextRequest, NextResponse } from "next/server"
import { matchImageForPerson, recordRejectedMatch, getRejectedMatches } from "@/lib/catalog/matching-pipeline"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { personId, autoAttachHighConfidence } = body

    if (!personId) {
      return NextResponse.json(
        { success: false, error: "personId is required" },
        { status: 400 }
      )
    }

    const matchResult = await matchImageForPerson(personId, {
      autoAttachHighConfidence: Boolean(autoAttachHighConfidence)
    })

    return NextResponse.json({
      success: true,
      data: matchResult
    })
  } catch (error: any) {
    console.error("Error in POST /api/catalog/matching:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute matching pipeline" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const personId = searchParams.get("personId")

    if (!personId) {
      return NextResponse.json(
        { success: false, error: "personId is required" },
        { status: 400 }
      )
    }

    const rejections = getRejectedMatches(personId)

    return NextResponse.json({
      success: true,
      personId,
      rejectedMatches: rejections
    })
  } catch (error: any) {
    console.error("Error in GET /api/catalog/matching:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve rejected matches" },
      { status: 500 }
    )
  }
}
