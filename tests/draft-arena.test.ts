import test from "node:test"
import assert from "node:assert/strict"
import { DRAFT_PRESETS, DEFAULT_PRESETS, getPresetById } from "../lib/draft/presets"
import type { DraftPreset, DraftTeam, DraftItem } from "../lib/draft/types"
import {
  createInitialDraftState,
  nominateItem,
  placeBid,
  sellCurrentItem,
  passCurrentItem,
  advanceToNextItem,
  undoLastBid,
  canTeamBid,
  findAvailableSlot
} from "../lib/draft/engine"
import { calculateTeamScore, calculateDraftLeaderboard, calculateDraftScores } from "../lib/draft/scoring"
import { generateDraftShareSummary, generateDraftShareText } from "../lib/draft/sharing"

test("Epic B — Draft Arena: Reusable Auction Game Engine", async (t) => {
  // -------------------------------------------------------------
  // STIR-108: Configurable Draft Presets and Item Pools
  // -------------------------------------------------------------
  await t.test("STIR-108: Supports football squads, superheroes, celebrities, dream houses, and custom themes", () => {
    assert.ok(DEFAULT_PRESETS.length >= 4, "Should have at least 4 default presets")

    const football = getPresetById("football-legends")
    assert.ok(football, "Football legends preset should exist")
    assert.equal(football.theme, "football")
    assert.equal(football.currencySymbol, "$")
    assert.equal(football.startingBudget, 100)
    assert.ok(football.rosterSlots.length >= 6, "Football should have at least 6 roster slots")
    assert.ok(football.items.length >= 10, "Football should have at least 10 players")

    const superheroes = getPresetById("superheroes")
    assert.ok(superheroes, "Superheroes preset should exist")
    assert.ok(superheroes.rosterSlots.length >= 5, "Superheroes should have at least 5 slots")
    assert.equal(superheroes.currencySymbol, "⚡")

    const celebs = getPresetById("celebrity-icons")
    assert.ok(celebs, "Celebrity icons preset should exist")
    assert.equal(celebs.currencySymbol, "⭐")

    const estates = getPresetById("dream-estates")
    assert.ok(estates, "Dream estates preset should exist")
    assert.ok(estates.currencySymbol.includes("$"))

    // Engine is independent of themes: all presets satisfy the DraftPreset interface
    for (const preset of DEFAULT_PRESETS) {
      assert.ok(preset.id)
      assert.ok(preset.title)
      assert.ok(preset.startingBudget > 0)
      assert.ok(preset.minBidIncrement >= 1)
      assert.ok(preset.rosterSlots.length > 0)
      assert.ok(preset.items.length >= preset.rosterSlots.length)
    }
  })

  // -------------------------------------------------------------
  // STIR-109: Host-Controlled Auction Flow & Engine State Machine
  // -------------------------------------------------------------
  await t.test("STIR-109: Host-controlled auction state machine & single-device play", () => {
    const preset = getPresetById("football-legends")!
    const mockPlayers = [
      { id: "team-1", name: "Real Madrid FC", isHost: true },
      { id: "team-2", name: "Man City Blue", isHost: false }
    ]

    // 1. Initial State
    let state = createInitialDraftState(preset, mockPlayers)
    assert.equal(state.status, "lobby")
    assert.equal(Object.keys(state.teams).length, 2)
    assert.equal(state.itemPool.length, preset.items.length)
    assert.equal(state.currentBid, null)
    assert.equal(state.soldItems.length, 0)

    // Verify initial budgets
    assert.equal(state.teams["team-1"].budget, 100)
    assert.equal(state.teams["team-2"].budget, 100)

    // 2. Nominate Item
    const messi = preset.items.find((i) => i.name.toLowerCase().includes("messi"))!
    const nomResult = nominateItem(state, messi.id, "team-1")
    assert.ok(nomResult.success)
    state = nomResult.state
    assert.equal(state.status, "bidding")
    assert.equal(state.currentItem?.id, messi.id)
    assert.equal(state.timerActive, true)
    assert.equal(state.timeLeft, preset.timerSeconds)

    // 3. Bid Recording & Budget Reservation Rule
    // Team 1 places opening bid of 10
    let bidRes = placeBid(state, "team-1", 10)
    assert.ok(bidRes.success)
    state = bidRes.state
    assert.equal(state.currentBid?.amount, 10)
    assert.equal(state.currentBid?.bidderId, "team-1")

    // Team 2 bids 20
    bidRes = placeBid(state, "team-2", 20)
    assert.ok(bidRes.success)
    state = bidRes.state
    assert.equal(state.currentBid?.amount, 20)
    assert.equal(state.currentBid?.bidderId, "team-2")

    // Team 1 attempts bid lower than current + minIncrement ($20 + $1 = $21)
    bidRes = placeBid(state, "team-1", 20)
    assert.equal(bidRes.success, false)
    assert.match(bidRes.error || "", /at least/i)

    // Budget reservation test: Team 1 has 7 slots. Min increment is $1.
    // If team 1 bids $96, remaining budget would be $4, but they need to fill 6 more slots!
    // Reserve needed = 6 * $1 = $6. Max legal bid = $100 - $6 = $94.
    bidRes = placeBid(state, "team-1", 96)
    assert.equal(bidRes.success, false)
    assert.match(bidRes.error || "", /reserve/i)

    // 4. Anti-sniping timer reset
    state.timeLeft = 2 // 2 seconds left
    bidRes = placeBid(state, "team-1", 30)
    assert.ok(bidRes.success)
    state = bidRes.state
    assert.equal(state.timeLeft, preset.antiSnipingSeconds, "Timer should reset to anti-sniping duration on late bid")

    // 5. Host hammers SOLD
    const soldRes = sellCurrentItem(state)
    assert.ok(soldRes.success)
    state = soldRes.state
    assert.equal(state.status, "sold")
    assert.equal(state.soldItems.length, 1)
    assert.equal(state.soldItems[0].item?.id, messi.id)
    assert.equal(state.soldItems[0].price, 30)
    assert.equal(state.soldItems[0].buyerId, "team-1")

    // Verify Team 1 budget deducted and item placed in roster
    const team1 = state.teams["team-1"]
    assert.equal(team1.budget, 70) // 100 - 30
    const filledEntry = team1.roster.find((e) => e.item.id === messi.id)
    assert.ok(filledEntry, "Messi should be placed in Team 1 roster")
    assert.equal(filledEntry.pricePaid, 30)

    // Item must be marked as sold
    assert.ok(state.soldItems.some((s) => s.item?.id === messi.id), "Messi must be in sold list")

    // 6. Advance to next item
    const nextRes = advanceToNextItem(state)
    assert.ok(nextRes.success)
    state = nextRes.state
    assert.equal(state.status, "bidding")
    assert.ok(state.currentItem, "Next item should be on the auction block")
    assert.notEqual(state.currentItem?.id, messi.id, "Next item should not be Messi")
  })

  // -------------------------------------------------------------
  // STIR-110: Synchronized Multiplayer Draft & Atomic Actions
  // -------------------------------------------------------------
  await t.test("STIR-110: Roster eligibility & duplicate sale protection", () => {
    const preset = getPresetById("superheroes")!
    const mockPlayers = [
      { id: "team-a", name: "Avengers Assemble" },
      { id: "team-b", name: "Justice League" }
    ]

    let state = createInitialDraftState(preset, mockPlayers)
    const batman = preset.items.find((i) => i.id === "sh_batman")!
    const ironman = preset.items.find((i) => i.id === "sh_ironman")!

    // Team A buys Batman
    state = nominateItem(state, batman.id, "team-a").state
    state = placeBid(state, "team-a", 25).state
    state = sellCurrentItem(state).state

    const teamA = state.teams["team-a"]
    assert.equal(teamA.roster.length, 1)
    assert.equal(teamA.budget, 75)

    // Prevent duplicate sale: attempting to nominate Batman again should fail
    const dupNom = nominateItem(state, batman.id, "team-b")
    assert.equal(dupNom.success, false)
    assert.match(dupNom.error || "", /already been sold/i)

    // Nominate Ironman
    state = advanceToNextItem(state).state
    state = nominateItem(state, ironman.id, "team-b").state

    // Pass item test
    const passRes = passCurrentItem(state)
    assert.ok(passRes.success)
    state = passRes.state
    assert.equal(state.status, "passed")
    assert.ok(state.passedItemIds.includes(ironman.id))

    // Reveal next item after pass must NEVER show the passed item again
    const advanceAfterPass = advanceToNextItem(state)
    assert.ok(advanceAfterPass.success)
    state = advanceAfterPass.state
    assert.equal(state.status, "bidding")
    assert.notEqual(state.currentItem?.id, ironman.id, "Next revealed item must not be the passed item")
    assert.ok(!state.availableItemIds.includes(ironman.id), "Passed item must be excluded from availableItemIds")
  })

  // -------------------------------------------------------------
  // STIR-111: Draft Scoring, Synergies, and Social Sharing
  // -------------------------------------------------------------
  await t.test("STIR-111: Theme-specific scoring, tag synergies, audience voting, and share cards", () => {
    const preset = getPresetById("football-legends")!
    const mockPlayers = [
      { id: "team-1", name: "Galácticos FC" },
      { id: "team-2", name: "Camp Nou Legends" }
    ]

    const state = createInitialDraftState(preset, mockPlayers)

    // Assign items directly to simulate completed draft
    const team1 = state.teams["team-1"]
    const ronaldo = preset.items.find((i) => i.id === "fb_ronaldo")!
    const modric = preset.items.find((i) => i.id === "fb_modric")! // Shares tag "Real Madrid" or "UCL Legend"
    const ramos = preset.items.find((i) => i.id === "fb_ramos")! // Shares tag "Real Madrid"

    team1.roster = [
      { item: ronaldo, pricePaid: 35, slotId: "fwd_1", timestamp: Date.now() },
      { item: modric, pricePaid: 25, slotId: "mid_1", timestamp: Date.now() },
      { item: ramos, pricePaid: 20, slotId: "def_1", timestamp: Date.now() }
    ]
    team1.budget = 20 // 100 - 80

    // Add audience votes (STIR-111)
    const audienceVotes = {
      overall: { "team-1": 4, "team-2": 1 },
      aesthetic: { "team-1": 3, "team-2": 2 }
    }
    state.audienceVotes = audienceVotes

    // 1. Scoring Engine Test
    const score1 = calculateTeamScore(team1, preset, audienceVotes)
    assert.ok(score1.statScore > 0, "Base stat score should be positive")
    assert.ok(score1.budgetEfficiencyBonus! > 0, "Remaining $20 should yield budget efficiency bonus")
    assert.equal(score1.audienceVotes, 7, "Total audience votes should match (4 + 3)")

    // 2. Leaderboard Calculation
    const leaderboard = calculateDraftLeaderboard(state)
    assert.equal(leaderboard.length, 2)
    assert.equal(leaderboard[0].teamId, "team-1")
    assert.equal(leaderboard[0].rank, 1)

    // 3. Social Share Summary Card Test
    const shareText = generateDraftShareSummary(state, leaderboard)
    assert.ok(shareText.includes("DRAFT ARENA RESULTS"), "Share card should have title")
    assert.ok(shareText.includes("Galácticos FC"), "Share card should mention champion")
    assert.ok(shareText.includes("Cristiano Ronaldo"), "Share card should mention MVP signing")
  })
})
