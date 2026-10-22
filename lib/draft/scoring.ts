import { DraftPreset, DraftTeam, DraftScoreResult } from "./types"

/**
 * Calculates scores, bonuses, and rankings for all teams in a draft
 */
export function calculateDraftScores(
  preset: DraftPreset,
  teams: Record<string, DraftTeam>,
  votes: Record<string, string> = {} // voterId -> targetTeamId
): DraftScoreResult[] {
  // Aggregate peer/audience votes
  const voteTallies: Record<string, number> = {}
  Object.values(teams).forEach((t) => {
    voteTallies[t.id] = 0
  })

  Object.values(votes).forEach((targetTeamId) => {
    if (voteTallies[targetTeamId] !== undefined) {
      voteTallies[targetTeamId] += 1
    }
  })

  const results: DraftScoreResult[] = Object.values(teams).map((team) => {
    // 1. Stat Score: sum of item OVR or primary stat
    let statScore = 0
    const filledEntries = (team.roster || []).filter((entry) => entry && entry.item)

    filledEntries.forEach((entry) => {
      const stats = entry.item.stats || {}
      if (stats.OVR !== undefined) {
        statScore += stats.OVR
      } else {
        // Average or sum of available numeric stats
        const values = Object.values(stats)
        const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 80
        statScore += Math.round(avg)
      }
    })

    // 2. Full Roster Completion Bonus
    const requiredSlotCount = preset?.rosterSlots ? preset.rosterSlots.filter((s) => s.required).length : 5
    const filledRequiredCount = Math.min(filledEntries.length, requiredSlotCount)
    const isFullRoster = filledEntries.length >= (preset?.rosterSlots?.length || 5)
    const rosterBonus = isFullRoster ? preset?.scoringConfig?.fullRosterBonus || 25 : filledRequiredCount * 2

    // 3. Budget Efficiency Bonus
    const budgetBonusPerUnit = preset?.scoringConfig?.budgetBonusPerUnit || 0.5
    const budgetScore = Math.round((team.budget || 0) * budgetBonusPerUnit)

    // 4. Synergy Detection & Multiplier
    const tagCounts: Record<string, number> = {}
    filledEntries.forEach((entry) => {
      entry.item.tags?.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    const synergyMultiplier = preset?.scoringConfig?.synergyMultiplier || 8
    const synergiesFound: Array<{ tag: string; count: number; bonus: number }> = []
    let synergyScore = 0

    Object.entries(tagCounts).forEach(([tag, count]) => {
      if (count >= 2) {
        const bonus = (count - 1) * synergyMultiplier
        synergiesFound.push({ tag, count, bonus })
        synergyScore += bonus
      }
    })

    // 5. Audience / Peer Votes
    const votesCount = (team.votesReceived || 0) + (voteTallies[team.id] || 0)
    const votesScore = votesCount * 10

    // Total Score
    const totalScore = statScore + rosterBonus + budgetScore + synergyScore + votesScore

    return {
      teamId: team.id,
      teamName: team.name,
      rank: 1, // Will be sorted and updated below
      totalScore,
      statScore,
      budgetScore,
      rosterBonus,
      synergyScore,
      votesScore,
      synergiesFound,
      budgetRemaining: team.budget !== undefined ? team.budget : 0,
      itemsCount: filledEntries.length,
    }
  })

  // Sort descending by total score, secondary sort by budget remaining
  results.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore
    return b.budgetRemaining - a.budgetRemaining
  })

  // Assign ranks
  results.forEach((r, idx) => {
    r.rank = idx + 1
  })

  return results
}

/**
 * Calculates score for a single team
 */
export function calculateTeamScore(
  team: DraftTeam,
  preset: DraftPreset,
  audienceVotes?: Record<string, Record<string, number>>
): DraftScoreResult {
  const teamsMap: Record<string, DraftTeam> = { [team.id]: team }
  const votesFlat: Record<string, string> = {}
  if (audienceVotes) {
    let voterIdx = 0
    Object.values(audienceVotes).forEach((subVotes) => {
      Object.entries(subVotes).forEach(([tId, count]) => {
        for (let i = 0; i < count; i++) {
          votesFlat[`voter_${voterIdx++}`] = tId
        }
      })
    })
  }

  const results = calculateDraftScores(preset, teamsMap, votesFlat)
  const res = results[0]
  if (res) {
    res.ownerName = team.ownerName || team.name
    res.remainingBudget = team.budget
    res.budgetEfficiencyBonus = res.budgetScore
    res.synergyBonus = res.synergyScore
    res.audienceVotes = Object.values(votesFlat).filter((id) => id === team.id).length
  }
  return res
}

/**
 * Calculates sorted leaderboard for a DraftState
 */
export function calculateDraftLeaderboard(draftState: any): DraftScoreResult[] {
  const preset = draftState.preset
  let teamsMap: Record<string, DraftTeam> = {}
  if (Array.isArray(draftState.teams)) {
    draftState.teams.forEach((t: DraftTeam) => {
      teamsMap[t.id] = t
    })
  } else {
    teamsMap = draftState.teams || {}
  }

  const votesFlat: Record<string, string> = {}
  if (draftState.audienceVotes) {
    let voterIdx = 0
    Object.values(draftState.audienceVotes as Record<string, Record<string, number>>).forEach((subVotes) => {
      Object.entries(subVotes).forEach(([tId, count]) => {
        for (let i = 0; i < count; i++) {
          votesFlat[`voter_${voterIdx++}`] = tId
        }
      })
    })
  }

  const results = calculateDraftScores(preset, teamsMap, votesFlat)
  results.forEach((r) => {
    const t = teamsMap[r.teamId]
    r.ownerName = t?.ownerName || t?.name || r.teamName
    r.remainingBudget = t?.budget !== undefined ? t.budget : r.budgetRemaining
    r.budgetEfficiencyBonus = r.budgetScore
    r.synergyBonus = r.synergyScore
    r.audienceVotes = Object.values(votesFlat).filter((id) => id === r.teamId).length
  })
  return results
}
