import { NextResponse } from "next/server"
import { DRAFT_PRESETS } from "@/lib/draft/presets"
import { DraftPreset, DraftItem } from "@/lib/draft/types"
import { getPeople } from "@/lib/catalog/service"

// In-memory custom presets cache for session
const customPresets: DraftPreset[] = []

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeCatalog = searchParams.get("includeCatalog") === "true"

    let presets = [...DRAFT_PRESETS, ...customPresets]

    // If requested, enrich the celebrity preset with dynamic figures from DB catalog
    if (includeCatalog) {
      try {
        const catalogPeople = getPeople({ limit: 20 })
        if (catalogPeople.items && catalogPeople.items.length > 0) {
          const dynamicItems: DraftItem[] = catalogPeople.items.map((p: any) => {
            const primaryImg = p.primaryImage || p.images?.[0]
            return {
              id: `db_${p.id}`,
              name: p.name,
              category: p.category || "Celebrity",
              subtitle: p.description || p.category,
              description: p.description || `${p.name} from public catalog`,
              imageUrl: primaryImg?.thumbnailUrl || primaryImg?.url || "/placeholder-user.jpg",
              baseValuation: Math.max(10, Math.min(30, Math.round((p.popularityScore || 50) / 3))),
              stats: {
                Fame: p.popularityScore || 75,
                Influence: Math.min(99, (p.popularityScore || 70) + 5),
                Charisma: 85,
                OVR: Math.min(99, Math.max(70, p.popularityScore || 80)),
              },
              tags: [p.category, ...(p.tags || [])],
              provenance: primaryImg?.sourcePageUrl,
            }
          })

          presets = presets.map((preset) => {
            if (preset.id === "celebrity-icons") {
              return {
                ...preset,
                items: [...preset.items, ...dynamicItems],
              }
            }
            return preset
          })
        }
      } catch (err) {
        console.warn("Could not enrich presets from DB catalog:", err)
      }
    }

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
