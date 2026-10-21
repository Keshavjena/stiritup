import {
  DraftPreset,
  DraftState,
  DraftTeam,
  DraftItem,
  DraftCurrentBid,
  DraftRosterSlot,
  DraftSoldItemRecord,
  DraftActionLog,
} from "./types"

/**
 * Creates a new DraftState given a preset and participating player names
 */
export function createInitialDraftState(
  preset: DraftPreset,
  players: Array<{ id: string; name: string; isHost?: boolean } | string>,
  hostIndex = 0
): DraftState {
  const teams: Record<string, DraftTeam> = {}
  const nominationOrder: string[] = []

  players.forEach((p, idx) => {
    const id = typeof p === "string" ? `team_${idx}_${p.toLowerCase().replace(/[^a-z0-9]/g, "")}` : p.id
    const name = typeof p === "string" ? p : p.name
    const isHost = typeof p === "string" ? idx === hostIndex : Boolean(p.isHost)

    teams[id] = {
      id,
      name,
      budget: preset.startingBudget,
      initialBudget: preset.startingBudget,
      roster: [],
      votesReceived: 0,
      isHost,
    }
    nominationOrder.push(id)
  })

  // Deep clone items so each draft runs independently
  const itemPool: DraftItem[] = JSON.parse(JSON.stringify(preset.items))

  const initialLog: DraftActionLog = {
    id: `log_${Date.now()}`,
    type: "system",
    message: `Draft Arena initialized with preset "${preset.title}". ${players.length} teams registered with budget ${preset.currencySymbol}${preset.startingBudget} ${preset.currencyName}.`,
    timestamp: Date.now(),
  }

  return {
    presetId: preset.id,
    preset,
    status: "lobby",
    teams,
    itemPool,
    currentItem: null,
    currentItemIndex: -1,
    currentBid: null,
    bidHistory: [],
    timerActive: false,
    timeLeft: preset.timerSeconds,
    timerDuration: preset.timerSeconds,
    nominatedBy: null,
    nominationOrder,
    nominationIndex: 0,
    soldItems: [],
    passedItemIds: [],
    actionLogs: [initialLog],
  }
}

/**
 * Checks if a specific team has an available slot that can accept the given item
 */
export function findAvailableSlot(
  rosterSlots: DraftRosterSlot[],
  teamRoster: Array<{ slotId: string }>,
  item: DraftItem
): DraftRosterSlot | null {
  const filledSlotIds = new Set(teamRoster.map((r) => r.slotId))

  // 1. Try to find a slot that explicitly lists or matches the item's category
  for (const slot of rosterSlots) {
    if (!filledSlotIds.has(slot.id)) {
      if (slot.allowedCategories && slot.allowedCategories.length > 0) {
        if (slot.allowedCategories.includes(item.category)) {
          return slot
        }
      } else {
        // Generic slot (wildcard)
        return slot
      }
    }
  }

  // 2. Fallback to any open slot if no strict category restrictions block it
  for (const slot of rosterSlots) {
    if (!filledSlotIds.has(slot.id)) {
      return slot
    }
  }

  return null
}

/**
 * Validates whether a team is eligible to place a bid of `amount` on `item`
 */
export function canTeamBid(
  state: DraftState,
  teamId: string,
  bidAmount: number,
  item?: DraftItem | null
): { allowed: boolean; reason?: string } {
  const targetItem = item || state.currentItem
  if (!targetItem) {
    return { allowed: false, reason: "No item currently on the auction block." }
  }

  const team = state.teams[teamId]
  if (!team) {
    return { allowed: false, reason: "Team not found in this draft room." }
  }

  // Check if team roster is already full
  if (team.roster.length >= state.preset.rosterSlots.length) {
    return { allowed: false, reason: "Your roster is already full!" }
  }

  // Check slot eligibility
  const slot = findAvailableSlot(state.preset.rosterSlots, team.roster, targetItem)
  if (!slot) {
    return { allowed: false, reason: "No available roster slot for this item category." }
  }

  // Check if bid meets minimum increment
  const minRequiredBid = state.currentBid
    ? state.currentBid.amount + state.preset.minBidIncrement
    : state.preset.minBidIncrement

  if (bidAmount < minRequiredBid) {
    return {
      allowed: false,
      reason: `Bid must be at least ${state.preset.currencySymbol}${minRequiredBid}.`,
    }
  }

  // Check team available balance
  if (bidAmount > team.budget) {
    return {
      allowed: false,
      reason: `Insufficient budget! You have ${state.preset.currencySymbol}${team.budget} remaining.`,
    }
  }

  // Roster reservation rule: Ensure the team has at least 1 unit per remaining required slot!
  const remainingRequiredSlots = state.preset.rosterSlots.length - team.roster.length - 1
  const reservedBudget = remainingRequiredSlots * state.preset.minBidIncrement
  if (team.budget - bidAmount < reservedBudget) {
    return {
      allowed: false,
      reason: `You must reserve at least ${state.preset.currencySymbol}${reservedBudget} to fill your remaining ${remainingRequiredSlots} roster slot(s).`,
    }
  }

  return { allowed: true }
}

/**
 * Places a bid atomically on the current item
 */
export function placeBid(
  state: DraftState,
  bidderId: string,
  amount: number
): { success: boolean; state: DraftState; error?: string } {
  if (state.status !== "bidding") {
    return { success: false, state, error: "Auction is not currently accepting bids." }
  }

  const validation = canTeamBid(state, bidderId, amount, state.currentItem)
  if (!validation.allowed) {
    return { success: false, state, error: validation.reason }
  }

  const team = state.teams[bidderId]
  const newBid: DraftCurrentBid = {
    amount,
    bidderId,
    bidderName: team.name,
    timestamp: Date.now(),
  }

  // Anti-sniping rule: if bid placed with less than antiSnipingSeconds remaining, reset timer
  const updatedTimeLeft =
    state.timeLeft < state.preset.antiSnipingSeconds
      ? state.preset.antiSnipingSeconds
      : state.timeLeft

  const log: DraftActionLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: "bid",
    message: `${team.name} bid ${state.preset.currencySymbol}${amount} on ${state.currentItem?.name}`,
    timestamp: Date.now(),
  }

  const updatedState: DraftState = {
    ...state,
    currentBid: newBid,
    bidHistory: [newBid, ...state.bidHistory],
    timeLeft: updatedTimeLeft,
    timerActive: true,
    actionLogs: [log, ...state.actionLogs.slice(0, 49)],
  }

  return { success: true, state: updatedState }
}

/**
 * Nominates an item and starts the bidding round
 */
export function nominateItem(
  state: DraftState,
  itemId: string,
  nominatorId?: string
): { success: boolean; state: DraftState; error?: string } {
  const itemIndex = state.itemPool.findIndex((i) => i.id === itemId)
  if (itemIndex === -1) {
    return { success: false, state, error: "Item not found in pool." }
  }

  const item = state.itemPool[itemIndex]

  // Check if item was already sold
  if (state.soldItems.some((s) => s.item.id === itemId)) {
    return { success: false, state, error: "This item has already been sold." }
  }

  const nominator = nominatorId
    ? state.teams[nominatorId]?.name || "Host"
    : state.teams[state.nominationOrder[state.nominationIndex]]?.name || "Host"

  const log: DraftActionLog = {
    id: `log_${Date.now()}_nom`,
    type: "nominate",
    message: `${nominator} nominated ${item.name} for auction!`,
    timestamp: Date.now(),
  }

  const updatedState: DraftState = {
    ...state,
    currentItem: item,
    currentItemIndex: itemIndex,
    currentBid: null,
    bidHistory: [],
    status: "bidding",
    timerActive: true,
    timeLeft: state.preset.timerSeconds,
    nominatedBy: nominatorId || state.nominationOrder[state.nominationIndex] || null,
    actionLogs: [log, ...state.actionLogs.slice(0, 49)],
  }

  return { success: true, state: updatedState }
}

/**
 * Concludes the auction for the current item with a sale to the highest bidder
 */
export function sellCurrentItem(
  state: DraftState
): { success: boolean; state: DraftState; error?: string } {
  if (!state.currentItem) {
    return { success: false, state, error: "No item currently on the block." }
  }

  if (!state.currentBid) {
    // If no bids placed, pass the item instead
    return passCurrentItem(state)
  }

  const { bidderId, amount } = state.currentBid
  const team = state.teams[bidderId]
  if (!team) {
    return { success: false, state, error: "Winning bidder not found." }
  }

  const slot = findAvailableSlot(state.preset.rosterSlots, team.roster, state.currentItem)
  if (!slot) {
    return { success: false, state, error: "Winning team has no open slot for this item." }
  }

  const soldRecord: DraftSoldItemRecord = {
    item: state.currentItem,
    buyerId: bidderId,
    buyerName: team.name,
    price: amount,
    slotId: slot.id,
    timestamp: Date.now(),
  }

  const updatedTeamRoster = [
    ...team.roster,
    {
      item: state.currentItem,
      pricePaid: amount,
      slotId: slot.id,
      timestamp: Date.now(),
    },
  ]

  const updatedTeam: DraftTeam = {
    ...team,
    budget: team.budget - amount,
    roster: updatedTeamRoster,
  }

  const log: DraftActionLog = {
    id: `log_${Date.now()}_sold`,
    type: "sold",
    message: `🔨 SOLD! ${state.currentItem.name} acquired by ${team.name} for ${state.preset.currencySymbol}${amount}!`,
    timestamp: Date.now(),
  }

  const nextNominationIndex = (state.nominationIndex + 1) % state.nominationOrder.length

  const updatedState: DraftState = {
    ...state,
    status: "sold",
    timerActive: false,
    soldItems: [...state.soldItems, soldRecord],
    teams: {
      ...state.teams,
      [bidderId]: updatedTeam,
    },
    nominationIndex: nextNominationIndex,
    actionLogs: [log, ...state.actionLogs.slice(0, 49)],
  }

  return { success: true, state: updatedState }
}

/**
 * Passes the current item as unsold
 */
export function passCurrentItem(
  state: DraftState
): { success: boolean; state: DraftState } {
  if (!state.currentItem) {
    return { success: false, state }
  }

  const log: DraftActionLog = {
    id: `log_${Date.now()}_pass`,
    type: "passed",
    message: `No bids. ${state.currentItem.name} remains unsold.`,
    timestamp: Date.now(),
  }

  const nextNominationIndex = (state.nominationIndex + 1) % state.nominationOrder.length

  const updatedState: DraftState = {
    ...state,
    status: "passed",
    timerActive: false,
    passedItemIds: [...state.passedItemIds, state.currentItem.id],
    nominationIndex: nextNominationIndex,
    actionLogs: [log, ...state.actionLogs.slice(0, 49)],
  }

  return { success: true, state: updatedState }
}

/**
 * Advances to the next item or completes the draft if all teams have filled rosters
 */
export function advanceToNextItem(
  state: DraftState
): { success: boolean; state: DraftState; isDraftComplete: boolean } {
  // Check if all teams have filled their rosters
  const allRostersFull = Object.values(state.teams).every(
    (t) => t.roster.length >= state.preset.rosterSlots.length
  )

  // Check remaining unsold items
  const soldAndPassedIds = new Set([
    ...state.soldItems.map((s) => s.item.id),
    ...state.passedItemIds,
  ])
  const remainingItems = state.itemPool.filter((i) => !soldAndPassedIds.has(i.id))

  if (allRostersFull || remainingItems.length === 0) {
    const completeLog: DraftActionLog = {
      id: `log_${Date.now()}_done`,
      type: "system",
      message: `🎉 DRAFT COMPLETE! All rosters finalized. Calculating championship standings...`,
      timestamp: Date.now(),
    }

    return {
      success: true,
      state: {
        ...state,
        status: "completed",
        currentItem: null,
        currentBid: null,
        timerActive: false,
        actionLogs: [completeLog, ...state.actionLogs.slice(0, 49)],
      },
      isDraftComplete: true,
    }
  }

  // Pick the next unrevealed item in order
  const nextItem = remainingItems[0]
  const nextItemIndex = state.itemPool.findIndex((i) => i.id === nextItem.id)

  const log: DraftActionLog = {
    id: `log_${Date.now()}_next`,
    type: "system",
    message: `Next item on the block: ${nextItem.name} (${nextItem.category})`,
    timestamp: Date.now(),
  }

  const updatedState: DraftState = {
    ...state,
    status: "bidding",
    currentItem: nextItem,
    currentItemIndex: nextItemIndex,
    currentBid: null,
    bidHistory: [],
    timerActive: true,
    timeLeft: state.preset.timerSeconds,
    actionLogs: [log, ...state.actionLogs.slice(0, 49)],
  }

  return { success: true, state: updatedState, isDraftComplete: false }
}

/**
 * Undoes the last bid in the active round, reverting to previous bid
 */
export function undoLastBid(
  state: DraftState
): { success: boolean; state: DraftState; error?: string } {
  if (state.bidHistory.length === 0) {
    return { success: false, state, error: "No bids to undo." }
  }

  const removedBid = state.bidHistory[0]
  const previousBid = state.bidHistory[1] || null

  const log: DraftActionLog = {
    id: `log_${Date.now()}_undo`,
    type: "undo",
    message: `Host revoked bid of ${state.preset.currencySymbol}${removedBid.amount} by ${removedBid.bidderName}.`,
    timestamp: Date.now(),
  }

  const updatedState: DraftState = {
    ...state,
    currentBid: previousBid,
    bidHistory: state.bidHistory.slice(1),
    actionLogs: [log, ...state.actionLogs.slice(0, 49)],
  }

  return { success: true, state: updatedState }
}
