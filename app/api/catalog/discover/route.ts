import { NextRequest, NextResponse } from "next/server"
import { discoverPeople } from "@/lib/catalog/service"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q") || searchParams.get("query") || ""
    const limit = parseInt(searchParams.get("limit") || "8", 10)

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        query: "",
        count: 0,
        candidates: []
      })
    }

    const candidates = await discoverPeople(query.trim(), limit)

    return NextResponse.json({
      success: true,
      query: query.trim(),
      count: candidates.length,
      candidates
    })
  } catch (error: any) {
    console.error("Error in GET /api/catalog/discover:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to discover candidates from Wikidata",
        candidates: []
      },
      { status: 500 }
    )
  }
}
