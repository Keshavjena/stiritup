import { DraftPreset, DraftScoreResult, DraftTeam } from "./types"

/**
 * Generates an eye-catching, formatted social sharing text block for WhatsApp, X (Twitter), Discord, or Clipboard
 */
export function generateDraftShareText(
  preset: DraftPreset,
  results: DraftScoreResult[],
  teams: Record<string, DraftTeam>
): string {
  const winner = results[0]
  const runnerUp = results[1]
  const third = results[2]

  const medals = ["👑", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"]

  let text = `🏆 STIR IT UP — DRAFT ARENA RESULTS 🏆\n`
  text += `Theme: ${preset.icon} ${preset.title}\n\n`

  if (winner) {
    const winnerTeam = teams[winner.teamId]
    const filledRoster = (winnerTeam?.roster || []).filter((r) => r && r.item)
    const topPick = [...filledRoster].sort((a, b) => (b.pricePaid || 0) - (a.pricePaid || 0))[0]
    text += `👑 CHAMPION: ${winner.teamName} — ${winner.totalScore} PTS\n`
    text += `   Left: ${preset.currencySymbol}${winner.budgetRemaining} ${preset.currencyName || ""}\n`
    if (topPick && topPick.item) {
      text += `   MVP Signing: ${topPick.item.name} (${preset.currencySymbol}${topPick.pricePaid})\n`
    }
    text += `\n`
  }

  text += `📊 Leaderboard:\n`
  results.forEach((r, idx) => {
    const icon = medals[idx] || "⭐"
    text += `${icon} #${r.rank} ${r.teamName}: ${r.totalScore} pts (${r.itemsCount} picks, ${preset.currencySymbol}${r.budgetRemaining} left)\n`
  })

  text += `\n⚡ Play the high-stakes live auction game at Stir It Up!`
  return text
}

export interface AnonymousDraftMetric {
  presetId: string
  teamCount: number
  totalBidsPlaced: number
  totalItemsSold: number
  durationSeconds: number
  timestamp: number
}

// In-memory anonymous aggregation to track usage without collecting PII
const draftMetricsStore: AnonymousDraftMetric[] = []

export function trackDraftCompletion(metric: AnonymousDraftMetric) {
  draftMetricsStore.push(metric)
  if (draftMetricsStore.length > 500) {
    draftMetricsStore.shift()
  }
}

export function getDraftMetricsSummary() {
  return {
    totalDraftsCompleted: draftMetricsStore.length,
    recentDrafts: draftMetricsStore.slice(-10),
  }
}

/**
 * Formats a shareable text card for clipboard or native share sheet
 */
export function generateDraftShareSummary(draftState: any, leaderboard: DraftScoreResult[]): string {
  let teamsMap: Record<string, DraftTeam> = {}
  if (Array.isArray(draftState.teams)) {
    draftState.teams.forEach((t: DraftTeam) => {
      teamsMap[t.id] = t
    })
  } else {
    teamsMap = draftState.teams || {}
  }
  return generateDraftShareText(draftState.preset, leaderboard, teamsMap)
}
