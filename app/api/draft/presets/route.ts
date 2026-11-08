import { NextResponse } from "next/server"
import { DRAFT_PRESETS } from "@/lib/draft/presets"
import { DraftPreset } from "@/lib/draft/types"

// In-memory custom presets cache for session with bounded capacity
const MAX_CUSTOM_PRESETS = 50
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

    if (!preset || typeof preset.title !== "string" || !preset.title.trim() || !Array.isArray(preset.items) || preset.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid preset payload. Title and items array are required." },
        { status: 400 }
      )
    }

    if (preset.items.length > 100) {
      return NextResponse.json(
        { success: false, error: "Preset exceeds maximum limit of 100 items." },
        { status: 400 }
      )
    }

    const newPreset: DraftPreset = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: preset.title.trim().slice(0, 100),
      description: typeof preset.description === "string" ? preset.description.trim().slice(0, 300) : "Custom community draft preset",
      icon: typeof preset.icon === "string" ? preset.icon.slice(0, 10) : "⚡",
      theme: "custom",
      currencySymbol: typeof preset.currencySymbol === "string" ? preset.currencySymbol.slice(0, 5) : "$",
      currencyName: typeof preset.currencyName === "string" ? preset.currencyName.slice(0, 20) : "Points",
      startingBudget: Math.max(1, Math.min(100000, Number(preset.startingBudget) || 100)),
      minBidIncrement: Math.max(1, Math.min(1000, Number(preset.minBidIncrement) || 1)),
      timerSeconds: Math.max(0, Math.min(300, Number(preset.timerSeconds) || 15)),
      antiSnipingSeconds: Math.max(0, Math.min(60, Number(preset.antiSnipingSeconds) || 5)),
      rosterSlots: Array.isArray(preset.rosterSlots) && preset.rosterSlots.length > 0
        ? preset.rosterSlots.slice(0, 20)
        : [
            { id: "slot_1", name: "Slot 1", required: true },
            { id: "slot_2", name: "Slot 2", required: true },
            { id: "slot_3", name: "Slot 3", required: true },
            { id: "slot_4", name: "Slot 4", required: true },
            { id: "slot_5", name: "Slot 5", required: true },
          ],
      items: preset.items.slice(0, 100).map((item: any, idx: number) => ({
        id: item.id || `custom_item_${idx}_${Date.now()}`,
        name: typeof item.name === "string" ? item.name.trim().slice(0, 100) : `Item ${idx + 1}`,
        category: typeof item.category === "string" ? item.category.trim().slice(0, 50) : "General",
        subtitle: typeof item.subtitle === "string" ? item.subtitle.trim().slice(0, 100) : "Custom Draft Item",
        description: typeof item.description === "string" ? item.description.trim().slice(0, 200) : "",
        imageUrl: typeof item.imageUrl === "string" ? item.imageUrl.slice(0, 500) : "/placeholder-user.jpg",
        baseValuation: typeof item.baseValuation === "number" ? Math.max(0, item.baseValuation) : 15,
        stats: item.stats && typeof item.stats === "object" ? item.stats : { OVR: 85 },
        tags: Array.isArray(item.tags) ? item.tags.slice(0, 10) : [],
      })),
      scoringConfig: preset.scoringConfig || {
        budgetBonusPerUnit: 0.5,
        fullRosterBonus: 25,
        synergyMultiplier: 8,
      },
      isCustom: true,
    }

    if (customPresets.length >= MAX_CUSTOM_PRESETS) {
      customPresets.pop()
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
