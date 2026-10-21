import { NextRequest, NextResponse } from "next/server"
import { getPersonById, addPersonImage } from "@/lib/catalog/service"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const person = getPersonById(id)

    if (!person) {
      return NextResponse.json(
        { success: false, error: "Person not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: person
    })
  } catch (error: any) {
    console.error("Error in GET /api/catalog/people/[id]:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve person" },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const person = getPersonById(id)

    if (!person) {
      return NextResponse.json(
        { success: false, error: "Person not found" },
        { status: 404 }
      )
    }

    const body = await req.json()
    if (!body.url) {
      return NextResponse.json(
        { success: false, error: "Image URL is required" },
        { status: 400 }
      )
    }

    const image = addPersonImage(id, {
      url: body.url,
      thumbnailUrl: body.thumbnailUrl || body.url,
      provider: body.provider || "wikimedia",
      externalId: body.externalId,
      sourceUrl: body.sourceUrl,
      license: body.license || "Creative Commons",
      licenseUrl: body.licenseUrl,
      author: body.author,
      attribution: body.attribution,
      isPrimary: body.isPrimary ?? false,
      width: body.width,
      height: body.height,
      mimeType: body.mimeType,
      fileSize: body.fileSize
    })

    const updatedPerson = getPersonById(id)

    return NextResponse.json({
      success: true,
      data: {
        image,
        person: updatedPerson
      }
    })
  } catch (error: any) {
    console.error("Error in POST /api/catalog/people/[id]:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add person image" },
      { status: 500 }
    )
  }
}
