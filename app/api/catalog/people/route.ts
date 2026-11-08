import { NextRequest, NextResponse } from "next/server"
import { getPeople, upsertPerson } from "@/lib/catalog/service"
import { isAuthorizedAdmin } from "@/lib/security/auth"

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
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : ""
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Valid person name (max 100 chars) is required" },
        { status: 400 }
      )
    }

    const isAdmin = isAuthorizedAdmin(req)
    // Only authorized admins can directly write pre-approved records
    const status = isAdmin ? (body.moderationStatus || "approved") : "pending"

    const person = upsertPerson({
      name,
      gender: body.gender,
      category: typeof body.category === "string" ? body.category.trim().slice(0, 50) : body.category,
      tags: Array.isArray(body.tags) ? body.tags.slice(0, 20) : body.tags,
      provider: body.provider || "community",
      externalId: body.externalId,
      description: typeof body.description === "string" ? body.description.trim().slice(0, 500) : body.description,
      aliases: Array.isArray(body.aliases) ? body.aliases.slice(0, 20) : body.aliases,
      moderationStatus: status
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
