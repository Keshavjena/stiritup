import { NextRequest, NextResponse } from "next/server"
import { generateKMKRounds, generateWYRRounds } from "@/lib/catalog/game-generator"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const gameId = searchParams.get("gameId") || "kiss-marry-kill"
    const category = searchParams.get("category") || "all"
    const gender = (searchParams.get("gender") || "female") as any
    const count = parseInt(searchParams.get("count") || "10", 10)

    if (gameId === "kiss-marry-kill") {
      const rounds = generateKMKRounds({
        category,
        gender,
        count
      })

      return NextResponse.json({
        success: true,
        gameId,
        count: rounds.length,
        rounds
      })
    }

    if (gameId === "would-you-rather") {
      const rounds = generateWYRRounds({
        category,
        gender,
        count
      })

      return NextResponse.json({
        success: true,
        gameId,
        count: rounds.length,
        rounds
      })
    }

    return NextResponse.json(
      { success: false, error: `Unsupported gameId: '${gameId}'. Expected 'kiss-marry-kill' or 'would-you-rather'.` },
      { status: 400 }
    )
  } catch (error: any) {
    console.error("Error in GET /api/catalog/games/round:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate game rounds" },
      { status: 500 }
    )
  }
}
