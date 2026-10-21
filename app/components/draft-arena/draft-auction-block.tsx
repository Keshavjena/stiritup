"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Gavel,
  Clock,
  Sparkles,
  RotateCcw,
  SkipForward,
  TrendingUp,
  AlertCircle,
  Coins,
  CheckCircle,
  ShieldAlert,
  Flame
} from "lucide-react"
import type { DraftItem, DraftTeam, DraftCurrentBid, DraftPreset } from "@/lib/draft/types"

interface DraftAuctionBlockProps {
  item: DraftItem | null
  preset: DraftPreset
  currentBid: DraftCurrentBid | null
  timeLeft: number
  timerActive: boolean
  phase: "nominating" | "bidding" | "sold" | "completed" | "setup" | "paused"
  teams: DraftTeam[]
  activeTeamId: string
  isHost: boolean
  isSingleDeviceMode: boolean
  onSelectActiveTeam?: (teamId: string) => void
  onPlaceBid: (teamId: string, amount: number) => void
  onHammerSold: () => void
  onPassItem: () => void
  onUndoBid: () => void
  onNextItem: () => void
}

export function DraftAuctionBlock({
  item,
  preset,
  currentBid,
  timeLeft,
  timerActive,
  phase,
  teams,
  activeTeamId,
  isHost,
  isSingleDeviceMode,
  onSelectActiveTeam,
  onPlaceBid,
  onHammerSold,
  onPassItem,
  onUndoBid,
  onNextItem
}: DraftAuctionBlockProps) {
  const [customBidAmount, setCustomBidAmount] = useState<string>("")
  const [bidError, setBidError] = useState<string | null>(null)

  const activeTeam = teams.find((t) => t.id === activeTeamId) || teams[0]
  const currentBidAmount = currentBid?.amount || 0
  const minIncrement = preset.minBidIncrement || 1
  const minRequiredBid = currentBidAmount > 0 ? currentBidAmount + minIncrement : (preset.minStartingBid || 1)

  // Calculate maximum legal bid for active team with roster reservation rule
  const remainingSlots = activeTeam ? activeTeam.roster.filter((s) => !s.item).length : 0
  const reserveNeeded = Math.max(0, (remainingSlots - 1) * minIncrement)
  const maxLegalBid = activeTeam ? Math.max(0, activeTeam.budget - reserveNeeded) : 0

  // Check if active team has an eligible open slot for this item's category
  const hasEligibleSlot = activeTeam && item
    ? activeTeam.roster.some(
        (s) =>
          !s.item &&
          (s.isWildcard ||
            (s.slotCategory || s.slotName || "").toLowerCase() === item.category.toLowerCase())
      )
    : false

  const handleQuickBid = (increment: number) => {
    setBidError(null)
    const targetAmount = Math.max(minRequiredBid, currentBidAmount + increment)
    executeBid(targetAmount)
  }

  const handleCustomBid = (e: React.FormEvent) => {
    e.preventDefault()
    setBidError(null)
    const amount = Number(customBidAmount)
    if (isNaN(amount) || amount <= 0) {
      setBidError("Please enter a valid bid amount.")
      return
    }
    executeBid(amount)
    setCustomBidAmount("")
  }

  const handleAllInBid = () => {
    setBidError(null)
    if (maxLegalBid < minRequiredBid) {
      setBidError("Max legal bid is lower than minimum required bid.")
      return
    }
    executeBid(maxLegalBid)
  }

  const executeBid = (amount: number) => {
    if (!activeTeam) {
      setBidError("No active team selected.")
      return
    }
    if (!item) {
      setBidError("No item currently on auction block.")
      return
    }
    if (amount < minRequiredBid) {
      setBidError(`Bid must be at least ${preset.currencySymbol}${minRequiredBid}.`)
      return
    }
    if (amount > activeTeam.budget) {
      setBidError(`Insufficient budget (${preset.currencySymbol}${activeTeam.budget} available).`)
      return
    }
    if (amount > maxLegalBid) {
      setBidError(
        `Reserve rule: Must keep at least ${preset.currencySymbol}${reserveNeeded} to fill your other ${remainingSlots - 1} slot(s).`
      )
      return
    }
    if (!hasEligibleSlot) {
      setBidError(`Roster full for category '${item.category}'.`)
      return
    }
    if (currentBid && currentBid.teamId === activeTeam.id) {
      setBidError("You currently hold the highest bid!")
      return
    }

    onPlaceBid(activeTeam.id, amount)
  }

  const isTensionTimer = timeLeft <= 5 && timerActive

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Status Bar: Timer & High Bidder */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        {/* Timer Card */}
        <div
          className={`p-4 rounded-2xl border transition flex items-center gap-3 ${
            isTensionTimer
              ? "bg-red-950/50 border-red-500/80 shadow-lg shadow-red-500/20 animate-pulse"
              : "bg-zinc-900/90 border-zinc-800"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border ${
              isTensionTimer
                ? "bg-red-500 text-white border-red-400"
                : "bg-amber-500/10 border-amber-500/30 text-amber-400"
            }`}
          >
            {timeLeft}s
          </div>
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 block">
              Auction Clock
            </span>
            <span className="text-xs text-zinc-300">
              {isTensionTimer ? "⚠️ Final countdown!" : timerActive ? "Bidding open" : "Paused / Awaiting"}
            </span>
          </div>
        </div>

        {/* Current High Bid Spotlight */}
        <div className="sm:col-span-2 p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-400 block">
              Current Highest Bid
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {preset.currencySymbol}{currentBidAmount}
              </span>
              {currentBid ? (
                <span className="text-xs font-bold text-amber-300 truncate max-w-[160px] sm:max-w-[220px]">
                  by {currentBid.bidderName}
                </span>
              ) : (
                <span className="text-xs text-zinc-400 italic">No bids yet</span>
              )}
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <span className="text-[10px] text-zinc-500 block uppercase">Min Next Bid</span>
            <span className="text-sm font-semibold text-zinc-300">
              {preset.currencySymbol}{minRequiredBid}
            </span>
          </div>
        </div>
      </div>

      {/* Main Auction Block Stage */}
      {item ? (
        <div className="relative rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 p-6 sm:p-8 shadow-2xl overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Item Portrait / Image */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-48 h-64 sm:w-56 sm:h-72 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl group">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                    <Sparkles className="w-12 h-12" />
                  </div>
                )}
                {/* Category Pill Overlay */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-400">
                  {item.category}
                </div>
              </div>
            </div>

            {/* Item Details & Stats */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    On The Block
                  </span>
                  {phase === "sold" && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                      SOLD!
                    </span>
                  )}
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {item.name}
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Stats Grid */}
              {item.stats && Object.keys(item.stats).length > 0 && (
                <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Attributes & Capabilities
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(item.stats).map(([statKey, statVal]) => (
                      <div
                        key={statKey}
                        className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs"
                      >
                        <span className="text-zinc-400 truncate text-[11px]">{statKey}</span>
                        <span className="font-bold text-amber-300 font-mono">{statVal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags / Synergies */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-zinc-800 text-[11px] text-zinc-300 border border-zinc-700/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-zinc-900/60 border border-dashed border-zinc-800 p-12 text-center space-y-3">
          <Gavel className="w-12 h-12 text-zinc-600 mx-auto" />
          <h4 className="text-lg font-bold text-white">Auction Block is Open</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Host or nominating team can nominate the next item from the pool to begin bidding.
          </p>
        </div>
      )}

      {/* Bidding Console */}
      {phase !== "sold" && phase !== "completed" && item && (
        <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
          {/* Single-Device Pass & Play Team Selector */}
          {isSingleDeviceMode && onSelectActiveTeam && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase">
                  Bidding As:
                </span>
                <select
                  value={activeTeamId}
                  onChange={(e) => onSelectActiveTeam(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-amber-400 font-bold text-xs focus:outline-none"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({preset.currencySymbol}{t.budget} left)
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-zinc-400">
                Max Legal Bid:{" "}
                <span className="font-bold text-white">
                  {preset.currencySymbol}{maxLegalBid}
                </span>{" "}
                <span className="text-[10px] text-zinc-500">
                  (Reserving {preset.currencySymbol}{reserveNeeded} for {remainingSlots - 1} slots)
                </span>
              </div>
            </div>
          )}

          {/* Quick Bid Increment Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickBid(minIncrement)}
              disabled={!hasEligibleSlot || maxLegalBid < minRequiredBid}
              className="py-3 px-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition border border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center gap-0.5"
            >
              <span className="text-amber-400 text-sm">+{preset.currencySymbol}{minIncrement}</span>
              <span className="text-[10px] text-zinc-400 font-normal">Min Raise</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickBid(minIncrement * 5)}
              disabled={!hasEligibleSlot || maxLegalBid < currentBidAmount + minIncrement * 5}
              className="py-3 px-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition border border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center gap-0.5"
            >
              <span className="text-amber-400 text-sm">+{preset.currencySymbol}{minIncrement * 5}</span>
              <span className="text-[10px] text-zinc-400 font-normal">Fast Raise</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickBid(minIncrement * 10)}
              disabled={!hasEligibleSlot || maxLegalBid < currentBidAmount + minIncrement * 10}
              className="py-3 px-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition border border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center gap-0.5"
            >
              <span className="text-amber-400 text-sm">+{preset.currencySymbol}{minIncrement * 10}</span>
              <span className="text-[10px] text-zinc-400 font-normal">Big Raise</span>
            </button>

            <button
              type="button"
              onClick={handleAllInBid}
              disabled={!hasEligibleSlot || maxLegalBid < minRequiredBid}
              className="py-3 px-3 rounded-2xl bg-gradient-to-r from-red-600/30 to-amber-600/30 hover:from-red-600/40 hover:to-amber-600/40 text-amber-300 font-bold text-xs transition border border-amber-500/40 disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center gap-0.5"
            >
              <span className="text-amber-300 text-sm flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-red-400" /> Max Legal
              </span>
              <span className="text-[10px] text-zinc-400 font-normal font-mono">
                {preset.currencySymbol}{maxLegalBid}
              </span>
            </button>

            {/* Custom Bid Input */}
            <form onSubmit={handleCustomBid} className="flex gap-1.5 col-span-2 sm:col-span-1">
              <input
                type="number"
                min={minRequiredBid}
                max={maxLegalBid}
                value={customBidAmount}
                onChange={(e) => setCustomBidAmount(e.target.value)}
                placeholder="Custom"
                className="w-full px-2.5 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!hasEligibleSlot || !customBidAmount}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition disabled:opacity-40"
              >
                Bid
              </button>
            </form>
          </div>

          {/* Validation Warnings / Error Banner */}
          {bidError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{bidError}</span>
            </motion.div>
          )}

          {!hasEligibleSlot && (
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                {activeTeam?.name} has no open roster slots matching &ldquo;{item.category}&rdquo;. You cannot bid on this item.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Host Controls Gavel Bar */}
      {isHost && (
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase">
              Host Controls:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {phase === "sold" ? (
              <button
                type="button"
                onClick={onNextItem}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                Next Item <SkipForward className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onHammerSold}
                  disabled={!currentBid}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Gavel className="w-3.5 h-3.5" /> SOLD Hammer 🔨
                </button>

                <button
                  type="button"
                  onClick={onPassItem}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition flex items-center gap-1.5"
                >
                  <SkipForward className="w-3.5 h-3.5" /> Pass Item
                </button>

                {currentBid && (
                  <button
                    type="button"
                    onClick={onUndoBid}
                    className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white font-medium text-xs transition flex items-center gap-1"
                    title="Undo last bid"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Undo Bid
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
