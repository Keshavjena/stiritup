import { NextResponse } from "next/server"
import { DRAFT_PRESETS } from "@/lib/draft/presets"
import { DraftPreset } from "@/lib/draft/types"

// In-memory custom presets cache for session
const customPresets: DraftPreset[] = []

export async function GET() {
  try {
    const presets = [...DRAFT_PRESETS, ...customPresets]

    return NextResponse.json({
      success: true,
      presets,
      total: presets.length,
    })
  } catch (error) {
    console.error("Error fetching draft presets:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch draft presets" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { preset } = body

    if (!preset || !preset.title || !Array.isArray(preset.items) || preset.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid preset payload. Title and items array are required." },
        { status: 400 }
      )
    }

    const newPreset: DraftPreset = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: preset.title.trim(),
      description: preset.description?.trim() || "Custom community draft preset",
      icon: preset.icon || "⚡",
      theme: "custom",
      currencySymbol: preset.currencySymbol || "$",
      currencyName: preset.currencyName || "Points",
      startingBudget: Number(preset.startingBudget) || 100,
      minBidIncrement: Number(preset.minBidIncrement) || 1,
      timerSeconds: Number(preset.timerSeconds) || 15,
      antiSnipingSeconds: Number(preset.antiSnipingSeconds) || 5,
      rosterSlots: Array.isArray(preset.rosterSlots) && preset.rosterSlots.length > 0
        ? preset.rosterSlots
        : [
            { id: "slot_1", name: "Slot 1", required: true },
            { id: "slot_2", name: "Slot 2", required: true },
            { id: "slot_3", name: "Slot 3", required: true },
            { id: "slot_4", name: "Slot 4", required: true },
            { id: "slot_5", name: "Slot 5", required: true },
          ],
      items: preset.items.map((item: any, idx: number) => ({
        id: item.id || `custom_item_${idx}_${Date.now()}`,
        name: item.name || `Item ${idx + 1}`,
        category: item.category || "General",
        subtitle: item.subtitle || "Custom Draft Item",
        description: item.description || "",
        imageUrl: item.imageUrl || "/placeholder-user.jpg",
        baseValuation: Number(item.baseValuation) || 15,
        stats: item.stats && typeof item.stats === "object" ? item.stats : { OVR: 85 },
        tags: Array.isArray(item.tags) ? item.tags : [],
      })),
      scoringConfig: preset.scoringConfig || {
        budgetBonusPerUnit: 0.5,
        fullRosterBonus: 25,
        synergyMultiplier: 8,
      },
      isCustom: true,
    }

    customPresets.unshift(newPreset)

    return NextResponse.json({
      success: true,
      preset: newPreset,
    })
  } catch (error) {
    console.error("Error creating custom draft preset:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create custom draft preset" },
      { status: 500 }
    )
  }
}
