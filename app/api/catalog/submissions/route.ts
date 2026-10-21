import { NextRequest, NextResponse } from "next/server"
import { createCommunitySubmission } from "@/lib/catalog/service"
import { getDb } from "@/lib/catalog/db"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.submissionType || !body.proposedData) {
      return NextResponse.json(
        { success: false, error: "submissionType and proposedData are required" },
        { status: 400 }
      )
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null

    const submission = createCommunitySubmission({
      submissionType: body.submissionType,
      personId: body.personId || null,
      proposedData: body.proposedData,
      submitterName: body.submitterName || null,
      submitterIp: ip
    })

    return NextResponse.json({
      success: true,
      data: submission
    })
  } catch (error: any) {
    console.error("Error in POST /api/catalog/submissions:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create community submission" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const db = getDb()
    const rows = db
      .prepare(
        "SELECT * FROM community_submissions ORDER BY created_at DESC LIMIT 50"
      )
      .all() as any[]

    const submissions = rows.map((r) => ({
      id: r.id,
      submissionType: r.submission_type,
      personId: r.person_id,
      proposedData: JSON.parse(r.proposed_data || "{}"),
      submitterName: r.submitter_name,
      moderationStatus: r.moderation_status,
      moderationNotes: r.moderation_notes,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }))

    return NextResponse.json({
      success: true,
      submissions
    })
  } catch (error: any) {
    console.error("Error in GET /api/catalog/submissions:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve submissions" },
      { status: 500 }
    )
  }
}
