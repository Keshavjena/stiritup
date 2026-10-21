import { NextRequest, NextResponse } from "next/server"
import { bulkAddPersons } from "@/lib/catalog/service"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { names, category, addedBy, gender } = body

    if (!names || typeof names !== "string" || !names.trim()) {
      return NextResponse.json(
        { success: false, error: "Please provide a non-empty string of comma-separated or newline-separated names." },
        { status: 400 }
      )
    }

    const result = bulkAddPersons({
      rawNames: names,
      category,
      addedBy,
      gender
    })

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    console.error("Error in /api/catalog/bulk-add:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process bulk additions" },
      { status: 500 }
    )
  }
}
