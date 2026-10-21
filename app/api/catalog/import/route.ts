import { NextRequest, NextResponse } from "next/server"
import { importDiscoveredPerson } from "@/lib/catalog/service"
import { NormalizedPersonCandidate } from "@/lib/catalog/types"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const candidate = (body.candidate || body) as NormalizedPersonCandidate

    if (!candidate || !candidate.name) {
      return NextResponse.json(
        { success: false, error: "Candidate with valid name is required" },
        { status: 400 }
      )
    }

    const importedPerson = await importDiscoveredPerson(candidate)

    return NextResponse.json({
      success: true,
      data: importedPerson
    })
  } catch (error: any) {
    console.error("Error in POST /api/catalog/import:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to import person into catalog" },
      { status: 500 }
    )
  }
}
