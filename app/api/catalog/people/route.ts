import { NextRequest, NextResponse } from "next/server"
import { getPeople, upsertPerson } from "@/lib/catalog/service"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category") || undefined
    const gender = searchParams.get("gender") || undefined
    const query = searchParams.get("query") || searchParams.get("q") || undefined
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const provider = searchParams.get("provider") || undefined
    const minPopStr = searchParams.get("minPopularity")
    const minPopularity = minPopStr !== null ? parseInt(minPopStr, 10) : undefined
    const maxPopStr = searchParams.get("maxPopularity")
    const maxPopularity = maxPopStr !== null ? parseInt(maxPopStr, 10) : undefined
    const hasImageOnly = searchParams.get("hasImageOnly") === "true" || undefined
    const sortBy = (searchParams.get("sortBy") as any) || undefined
    const sortOrder = (searchParams.get("sortOrder") as any) || undefined

    const result = getPeople({
      category,
      gender,
      query,
      page,
      limit,
      provider,
      minPopularity,
      maxPopularity,
      hasImageOnly,
      sortBy,
      sortOrder
    })

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error: any) {
    console.error("Error in GET /api/catalog/people:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch people catalog" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Person name is required" },
        { status: 400 }
      )
    }

    const person = upsertPerson({
      name: body.name,
      gender: body.gender,
      category: body.category,
      tags: body.tags,
      provider: body.provider || "community",
      externalId: body.externalId,
      description: body.description,
      aliases: body.aliases,
      moderationStatus: body.moderationStatus || "approved"
    })

    return NextResponse.json({
      success: true,
      data: person
    })
  } catch (error: any) {
    console.error("Error in POST /api/catalog/people:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create person" },
      { status: 500 }
    )
  }
}
