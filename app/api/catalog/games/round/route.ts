import { NextRequest, NextResponse } from "next/server"
import { generateKMKRounds, generateWYRRounds, generatePersonalityCustomCards } from "@/lib/catalog/game-generator"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const gameId = searchParams.get("gameId") || "kiss-marry-kill"
    const category = searchParams.get("category") || "all"
    const gender = (searchParams.get("gender") || "female") as any
    const count = parseInt(searchParams.get("count") || "10", 10)
    const scenarioMode = (searchParams.get("scenarioMode") || "all") as any

    if (gameId === "kiss-marry-kill") {
      const rounds = generateKMKRounds({
        category,
        gender,
        count,
        scenarioMode
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
        count,
        scenarioMode
      })

      return NextResponse.json({
        success: true,
        gameId,
        count: rounds.length,
        rounds
      })
    }

    if (gameId === "custom-cards" || gameId === "custom") {
      const style = (searchParams.get("style") || scenarioMode || "all") as any
      const cards = generatePersonalityCustomCards({
        category,
        gender,
        count,
        style
      })

      return NextResponse.json({
        success: true,
        gameId,
        count: cards.length,
        cards
      })
    }

    return NextResponse.json(
      { success: false, error: `Unsupported gameId: '${gameId}'. Expected 'kiss-marry-kill', 'would-you-rather', or 'custom-cards'.` },
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
