export interface DraftRosterSlot {
  id: string
  name: string
  required?: boolean
  allowedCategories?: string[]
  slotCategory?: string
  isWildcard?: boolean
}

export interface DraftItem {
  id: string
  name: string
  category: string
  imageUrl: string
  subtitle?: string
  description?: string
  baseValuation: number
  stats: Record<string, number>
  tags?: string[]
  provenance?: string
}

export interface DraftScoringConfig {
  statWeights?: Record<string, number>
  budgetBonusPerUnit?: number
  fullRosterBonus?: number
  synergyMultiplier?: number
  allowAudienceVoting?: boolean
}

export interface DraftPreset {
  id: string
  title: string
  name?: string
  description: string
  icon: string
  theme:
    | "starships"
    | "mythical"
    | "videogames"
    | "vehicles"
    | "realms"
    | "food"
    | "survival"
    | "anime"
    | "luxury"
    | "retro"
    | "superpowers"
    | "hypercars"
    | "pirates"
    | "football"
    | "superhero"
    | "custom"
    | string
  currencySymbol: string
  currencyName?: string
  startingBudget: number
  minStartingBid?: number
  minBidIncrement: number
  timerSeconds: number
  nominationTimerSeconds?: number
  antiSnipingSeconds: number
  rosterSlots: DraftRosterSlot[]
  items: DraftItem[]
  scoringConfig: DraftScoringConfig
  isCustom?: boolean
}

export interface DraftRosterEntry {
  item: DraftItem
  pricePaid: number
  slotId: string
  slotName?: string
  slotCategory?: string
  isWildcard?: boolean
  timestamp?: number
  acquiredAt?: number
}

export interface DraftTeam {
  id: string
  name: string
  ownerName?: string
  budget: number
  initialBudget?: number
  startingBudget?: number
  roster: DraftRosterEntry[]
  votesReceived?: number
  isHost?: boolean
}

export type DraftAuctionStatus =
  | "lobby"
  | "setup"
  | "nominating"
  | "bidding"
  | "sold"
  | "passed"
  | "paused"
  | "completed"

export interface DraftCurrentBid {
  amount: number
  bidderId: string
  teamId?: string
  bidderName: string
  timestamp: number
}

export interface DraftBidHistoryItem {
  amount: number
  bidderId: string
  bidderName: string
  timestamp: number
}

export interface DraftSoldItemRecord {
  item: DraftItem
  itemId?: string
  buyerId: string
  teamId?: string
  buyerName: string
  price: number
  slotId: string
  timestamp: number
}

export interface DraftActionLog {
  id: string
  type: "bid" | "sold" | "passed" | "pass" | "nominate" | "nomination" | "timer" | "undo" | "system" | "state_change"
  message: string
  description?: string
  timestamp: number
  teamId?: string
  itemId?: string
  amount?: number
}

export interface DraftState {
  id?: string
  presetId: string
  preset: DraftPreset
  status: DraftAuctionStatus
  phase?: "setup" | "nominating" | "bidding" | "sold" | "passed" | "paused" | "completed"
  teams: Record<string, any>
  itemPool: DraftItem[]
  pool?: DraftItem[]
  availableItemIds?: string[]
  currentItem: DraftItem | null
  currentItemIndex: number
  nominatedItemId?: string | null
  currentBid: DraftCurrentBid | null
  previousBid?: DraftCurrentBid | null
  bidHistory: DraftBidHistoryItem[]
  timerActive: boolean
  timeLeft: number
  timerDuration: number
  nominatedBy: string | null
  nominationOrder: string[]
  nominationIndex: number
  nominatingTeamIndex?: number
  soldItems: DraftSoldItemRecord[]
  passedItemIds: string[]
  actionLogs: DraftActionLog[]
  actionLog?: any[]
  audienceVotes?: Record<string, Record<string, number>>
  hostId?: string
}

export interface DraftScoreResult {
  teamId: string
  teamName: string
  ownerName?: string
  rank: number
  totalScore: number
  statScore: number
  budgetScore: number
  budgetEfficiencyBonus?: number
  rosterBonus: number
  synergyScore: number
  synergyBonus?: number
  votesScore: number
  audienceVotes?: number
  synergiesFound: Array<{ tag: string; count: number; bonus: number }>
  budgetRemaining: number
  remainingBudget?: number
  itemsCount: number
}
