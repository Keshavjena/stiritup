import { NextRequest, NextResponse } from "next/server"
import {
  getSubmissionsForReview,
  approveCommunitySubmission,
  rejectCommunitySubmission,
  removeCatalogContent
} from "@/lib/catalog/moderation-service"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = (searchParams.get("status") || "pending") as any

    const submissionsWithDuplicates = getSubmissionsForReview(status)

    return NextResponse.json({
      success: true,
      count: submissionsWithDuplicates.length,
      submissions: submissionsWithDuplicates
    })
  } catch (error: any) {
    console.error("Error in GET /api/catalog/moderation:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve submissions for review" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, submissionId, reason, targetType, targetId, reviewerId } = body

    if (action === "approve") {
      if (!submissionId) {
        return NextResponse.json(
          { success: false, error: "submissionId is required for approval" },
          { status: 400 }
        )
      }
      const result = approveCommunitySubmission(submissionId, reviewerId || "admin")
      return NextResponse.json({
        success: true,
        data: result
      })
    }

    if (action === "reject") {
      if (!submissionId || !reason) {
        return NextResponse.json(
          { success: false, error: "submissionId and rejection reason are required" },
          { status: 400 }
        )
      }
      const result = rejectCommunitySubmission(submissionId, reason, reviewerId || "admin")
      return NextResponse.json({
        success: true,
        data: result
      })
    }

    if (action === "remove") {
      if (!targetType || !targetId || !reason) {
        return NextResponse.json(
          { success: false, error: "targetType, targetId, and removal reason are required" },
          { status: 400 }
        )
      }
      const result = removeCatalogContent(targetType, targetId, reason, reviewerId || "admin")
      return NextResponse.json({
        success: true,
        data: result
      })
    }

    return NextResponse.json(
      { success: false, error: `Invalid action: '${action}'. Expected 'approve', 'reject', or 'remove'.` },
      { status: 400 }
    )
  } catch (error: any) {
    console.error("Error in POST /api/catalog/moderation:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process moderation action" },
      { status: 500 }
    )
  }
}
