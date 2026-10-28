"use client"

import React, { useState, useEffect } from "react"
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
  HelpCircle,
  ChevronRight,
  Layers,
  ArrowRight,
  Shield,
  Zap,
  Activity,
  Award
} from "lucide-react"
import type { DraftItem, DraftTeam, DraftCurrentBid, DraftPreset } from "@/lib/draft/types"

interface DraftAuctionBlockProps {
  item: DraftItem | null
  preset: DraftPreset
  currentBid: DraftCurrentBid | null
  timeLeft: number
  timerActive: boolean
  phase: "nominating" | "bidding" | "sold" | "passed" | "completed" | "setup" | "paused"
  teams: DraftTeam[]
  activeTeamId: string
  isHost: boolean
  isSingleDeviceMode: boolean
  availableItems?: DraftItem[]
  soldItems?: any[]
  passedItemIds?: string[]
  nominatingTeam?: DraftTeam | null
  onNominate?: (itemId: string) => void
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
  availableItems = [],
  soldItems = [],
  passedItemIds = [],
  nominatingTeam,
  onNominate,
  onSelectActiveTeam,
  onPlaceBid,
  onHammerSold,
  onPassItem,
  onUndoBid,
  onNextItem
}: DraftAuctionBlockProps) {
  const [customBidAmount, setCustomBidAmount] = useState<string>("")
  const [bidError, setBidError] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)

  // Reset image error state whenever item changes
  useEffect(() => {
    setImageError(false)
  }, [item?.id])

  const activeTeam = teams.find((t) => t.id === activeTeamId) || teams[0]
  const currentBidAmount = currentBid?.amount || 0
  const minIncrement = preset.minBidIncrement || 1
  const minRequiredBid = currentBidAmount > 0 ? currentBidAmount + minIncrement : (preset.minStartingBid || 1)

  // Calculate remaining open slots
  const remainingSlots = activeTeam
    ? activeTeam.roster.filter((s) => !("item" in s) || !s.item).length
    : 0

  // Reserve needed so team can fill remaining slots
  const reserveNeeded = Math.max(0, (remainingSlots - 1) * minIncrement)
  const maxLegalBid = activeTeam ? Math.max(0, activeTeam.budget - reserveNeeded) : 0
  const hasEligibleSlot = activeTeam && item ? remainingSlots > 0 : false

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
      setBidError(
        `Cannot go All-In: Max legal bid (${preset.currencySymbol}${maxLegalBid}) is less than minimum required bid (${preset.currencySymbol}${minRequiredBid}).`
      )
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
      setBidError("No item currently on the block.")
      return
    }
    if (amount < minRequiredBid) {
      setBidError(`Bid must be at least ${preset.currencySymbol}${minRequiredBid}.`)
      return
    }
    if (amount > activeTeam.budget) {
      setBidError(`Insufficient budget (${preset.currencySymbol}${activeTeam.budget} remaining).`)
      return
    }
    if (amount > maxLegalBid) {
      setBidError(
        `Reserve rule: Must keep at least ${preset.currencySymbol}${reserveNeeded} to fill your other ${remainingSlots - 1} slot(s).`
      )
      return
    }
    if (!hasEligibleSlot) {
      setBidError("Your roster is already full! You cannot draft more items.")
      return
    }
    if (currentBid && currentBid.teamId === activeTeam.id) {
      setBidError("You currently hold the highest bid!")
      return
    }

    onPlaceBid(activeTeam.id, amount)
  }

  const handleMysteryDrop = () => {
    if (onNextItem) {
      onNextItem()
    } else if (availableItems && availableItems.length > 0 && onNominate) {
      onNominate(availableItems[0].id)
    }
  }

  // 10-Lot Mystery Track calculations
  const totalLots = 10
  const completedCount = soldItems.length + passedItemIds.length
  const isPostRound = phase === "sold" || phase === "passed"
  const currentLotNumber = isPostRound ? completedCount : Math.min(totalLots, completedCount + (item ? 1 : 0))
  const isUntimed = !preset.timerSeconds || preset.timerSeconds <= 0
  const isTensionTimer = !isUntimed && timeLeft <= 5 && timerActive

  return (
    <div className="relative w-full max-w-4xl mx-auto space-y-5 text-zinc-100">
      {/* 10-Lot Mystery Progression Track */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-[#0B0F17]/90 border border-zinc-800/80 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-400">
              10-Pick Mystery Track
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-extrabold text-amber-400">
              Lot {Math.max(1, currentLotNumber)} of {totalLots}
            </span>
          </div>
          <span className="text-[11px] font-medium text-zinc-400 hidden sm:inline">
            5 Picks Per Franchise • Untimed Draft
          </span>
        </div>

        {/* 10 Lot Progression Pills */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
          {Array.from({ length: totalLots }).map((_, idx) => {
            const lotIndex = idx + 1
            const isCompleted = isPostRound ? lotIndex < completedCount : lotIndex <= completedCount
            const isCurrent = isPostRound ? lotIndex === completedCount : Boolean(item && lotIndex === completedCount + 1)
            const isUpcoming = isPostRound ? lotIndex > completedCount : lotIndex > completedCount + 1

            // Sold vs Passed distinction
            const isSoldLot = idx < soldItems.length

            return (
              <div
                key={lotIndex}
                className={`relative p-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5 min-h-[52px] ${
                  isCurrent
                    ? isPostRound && phase === "passed"
                      ? "bg-zinc-800/60 border-zinc-500 text-zinc-300 ring-1 ring-zinc-500/40"
                      : isPostRound && phase === "sold"
                      ? "bg-emerald-950/40 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400/50"
                      : "bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/50"
                    : isCompleted
                    ? isSoldLot
                      ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                      : "bg-zinc-900 border-zinc-700/60 text-zinc-400"
                    : "bg-zinc-900/50 border-zinc-800/70 text-zinc-500"
                }`}
              >
                <span className="text-[9px] font-mono font-bold block uppercase tracking-wider">
                  Lot {lotIndex}
                </span>

                {isCurrent ? (
                  <span
                    className={`text-[10px] font-black flex items-center gap-1 ${
                      isPostRound && phase === "passed"
                        ? "text-zinc-300"
                        : isPostRound && phase === "sold"
                        ? "text-emerald-300"
                        : "text-amber-300"
                    }`}
                  >
                    {!isPostRound && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
                    {isPostRound ? (phase === "sold" ? "✓ Sold" : "Passed") : "Active"}
                  </span>
                ) : isCompleted ? (
                  <span
                    className={`text-[10px] font-extrabold truncate max-w-full ${
                      isSoldLot ? "text-emerald-400" : "text-zinc-400"
                    }`}
                  >
                    {isSoldLot ? "✓ Sold" : "Passed"}
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold text-zinc-500 flex items-center gap-0.5">
                    <HelpCircle className="w-3 h-3 text-zinc-600" /> ?
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Top Status Bar: Auction Mode & High Bid Spotlight */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
        {/* Auction Status / Clock Badge */}
        <div
          className={`sm:col-span-5 p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center gap-3.5 shadow-lg ${
            isTensionTimer
              ? "bg-gradient-to-r from-red-950/80 via-red-900/60 to-zinc-900 border-red-500 shadow-red-500/30 animate-pulse"
              : "bg-[#0B0F17]/90 border-zinc-800"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border transition shrink-0 ${
              isUntimed
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                : isTensionTimer
                ? "bg-red-500 text-white border-red-300 shadow-lg shadow-red-500/50"
                : "bg-amber-500/15 border-amber-500/40 text-amber-400"
            }`}
          >
            {isUntimed ? (
              <Activity className="w-6 h-6 animate-pulse text-emerald-400" />
            ) : (
              `${timeLeft}s`
            )}
          </div>
          <div>
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-zinc-400 block">
              {isUntimed ? "Auction Pace" : "Auction Clock"}
            </span>
            <span
              className={`text-xs font-bold block ${
                isUntimed
                  ? "text-emerald-400 flex items-center gap-1.5"
                  : isTensionTimer
                  ? "text-red-400 animate-bounce"
                  : timerActive
                  ? "text-amber-400"
                  : "text-zinc-400"
              }`}
            >
              {isUntimed
                ? "Untimed • Casual Bidding"
                : isTensionTimer
                ? "Final Calls Before Hammer!"
                : timerActive
                ? "Bidding in Progress"
                : "Awaiting Next Item"}
            </span>
          </div>
        </div>

        {/* Current High Bid Spotlight */}
        <div className="sm:col-span-7 p-3.5 sm:p-4 rounded-2xl bg-[#0B0F17]/90 border border-amber-500/30 flex items-center justify-between shadow-lg">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest uppercase text-amber-400">
                Winning Bid
              </span>
              {currentBid && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold">
                  Holding Lead
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2.5 mt-0.5">
              <span className="text-3xl font-black text-white tracking-tight">
                {preset.currencySymbol}{currentBidAmount}
              </span>
              {currentBid ? (
                <span className="text-xs sm:text-sm font-extrabold text-amber-300 truncate max-w-[150px] sm:max-w-[220px]">
                  by {currentBid.bidderName}
                </span>
              ) : (
                <span className="text-xs text-zinc-500 italic">No bids placed yet</span>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-wider">
              Min Raise
            </span>
            <span className="text-base sm:text-lg font-mono font-black text-amber-400">
              {preset.currencySymbol}{minRequiredBid}
            </span>
          </div>
        </div>
      </div>

      {/* Main Auction Block Stage: Smooth Card Reveal Animation */}
      {item ? (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative rounded-3xl bg-gradient-to-b from-[#0F172A] via-[#0B0F17] to-[#070A0F] border border-zinc-800 p-5 sm:p-7 shadow-2xl overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

          {/* Sold or Passed Overlay Banner */}
          <AnimatePresence>
            {phase === "sold" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 bg-black/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/30">
                  <Gavel className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-black tracking-widest text-emerald-400 uppercase block">
                    Hammer Dropped!
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">
                    SOLD!
                  </h2>
                  <p className="text-zinc-300 text-sm mt-1 max-w-md">
                    <strong>{item.name}</strong> was drafted by{" "}
                    <span className="text-amber-400 font-bold">{currentBid?.bidderName || "Winning Team"}</span>{" "}
                    for{" "}
                    <span className="font-mono text-emerald-300 font-bold">
                      {preset.currencySymbol}{currentBidAmount}
                    </span>
                    !
                  </p>
                </div>

                {isHost && (
                  <button
                    type="button"
                    onClick={onNextItem}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-sm shadow-xl shadow-amber-500/30 transition flex items-center gap-2 transform active:scale-95"
                  >
                    Reveal Next Mystery Pick <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            )}

            {phase === "passed" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 bg-black/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-3xl bg-zinc-800/80 border-2 border-zinc-600 flex items-center justify-center text-zinc-300 shadow-xl">
                  <SkipForward className="w-8 h-8 text-zinc-400" />
                </div>
                <div>
                  <span className="text-xs font-black tracking-widest text-zinc-400 uppercase block">
                    Lot Passed Unsold
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">
                    PASSED
                  </h2>
                  <p className="text-zinc-400 text-sm mt-1 max-w-md">
                    No winning bids were placed on <strong>{item.name}</strong>.
                  </p>
                </div>

                {isHost && (
                  <button
                    type="button"
                    onClick={onNextItem}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-sm shadow-xl shadow-amber-500/30 transition flex items-center gap-2 transform active:scale-95"
                  >
                    Reveal Next Mystery Pick <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Character / Celebrity Card with Verified Portrait */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-56 h-72 sm:w-64 sm:h-80 md:w-72 md:h-88 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl group bg-zinc-950 flex items-center justify-center">
                {!imageError && item.imageUrl ? (
                  <>
                    {/* Ambient Background Aura */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125 pointer-events-none transition-opacity duration-300"
                    />
                    {/* High-Resolution Uncropped Foreground */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      onError={() => setImageError(true)}
                      className="relative z-10 max-h-full max-w-full object-contain p-2 drop-shadow-2xl transition duration-500 group-hover:scale-105"
                    />
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-950/60 via-zinc-900 to-zinc-950 flex flex-col items-center justify-center p-4 text-center space-y-2 border border-indigo-500/20">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-3xl shadow-lg">
                      <Shield className="w-8 h-8 text-indigo-400" />
                    </div>
                    <span className="font-black text-white text-base leading-tight">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium line-clamp-1">
                      {item.subtitle || item.category}
                    </span>
                  </div>
                )}

                {/* Category Pill Overlay */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-400 shadow-md">
                  {item.category}
                </div>

                {/* Base Value Badge */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-[11px] font-mono text-zinc-300">
                  Est: {preset.currencySymbol}{item.baseValuation}
                </div>
              </div>
            </div>

            {/* Character Details, Attributes & Capabilities */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                    On The Block • Lot {currentLotNumber} of {totalLots}
                  </span>
                  {item.subtitle && (
                    <span className="text-[11px] text-zinc-400 font-medium truncate">
                      · {item.subtitle}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {item.name}
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Attributes Grid */}
              {item.stats && Object.keys(item.stats).length > 0 && (
                <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                    Ratings & Attributes
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(item.stats).map(([statKey, statVal]) => (
                      <div
                        key={statKey}
                        className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs"
                      >
                        <span className="text-zinc-400 truncate text-[11px]">{statKey}</span>
                        <span className="font-extrabold text-amber-300 font-mono">{statVal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-lg bg-zinc-800/80 text-[11px] text-zinc-300 border border-zinc-700/60 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        /* Empty Auction Stage / Next Mystery Item Ready */
        <div className="rounded-3xl bg-[#0B0F17]/70 border-2 border-dashed border-zinc-800 p-8 sm:p-10 text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-lg">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xl sm:text-2xl font-black text-white">
              The Mystery Block is Open!
            </h4>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
              Ready to reveal the next mystery contender from the {preset.title} pool.
            </p>
          </div>

          {availableItems && availableItems.length > 0 && onNominate && (
            <div className="flex items-center justify-center pt-2">
              <button
                type="button"
                onClick={handleMysteryDrop}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-sm shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2 transform active:scale-95"
              >
                <Sparkles className="w-4 h-4" /> Reveal Next Mystery Pick
              </button>
            </div>
          )}
        </div>
      )}

      {/* Interactive Bidding Console */}
      {phase !== "sold" && phase !== "completed" && item && (
        <div className="p-4 sm:p-5 rounded-3xl bg-[#0B0F17]/95 border border-zinc-800 space-y-3.5 shadow-xl">
          {/* Active Franchise Selector for Single Device Mode */}
          {isSingleDeviceMode && onSelectActiveTeam && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                  Active Team:
                </span>
                <select
                  value={activeTeamId}
                  onChange={(e) => onSelectActiveTeam(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-amber-400 font-extrabold text-xs focus:outline-none focus:border-amber-400"
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
                <span className="font-extrabold text-white font-mono">
                  {preset.currencySymbol}{maxLegalBid}
                </span>{" "}
                {remainingSlots > 1 && (
                  <span className="text-[10px] text-zinc-500">
                    (Reserving {preset.currencySymbol}{reserveNeeded} for other slots)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Quick Bid Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickBid(minIncrement)}
              disabled={!hasEligibleSlot || maxLegalBid < minRequiredBid}
              className="py-2.5 px-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white font-bold text-xs transition border border-zinc-700/80 disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center gap-0.5 shadow-sm"
            >
              <span className="text-amber-400 text-sm font-black">+{preset.currencySymbol}{minIncrement}</span>
              <span className="text-[10px] text-zinc-400 font-normal">Min Raise</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickBid(minIncrement * 2)}
              disabled={!hasEligibleSlot || maxLegalBid < currentBidAmount + minIncrement * 2}
              className="py-2.5 px-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white font-bold text-xs transition border border-zinc-700/80 disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center gap-0.5 shadow-sm"
            >
              <span className="text-amber-400 text-sm font-black">+{preset.currencySymbol}{minIncrement * 2}</span>
              <span className="text-[10px] text-zinc-400 font-normal">Quick Raise</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickBid(minIncrement * 5)}
              disabled={!hasEligibleSlot || maxLegalBid < currentBidAmount + minIncrement * 5}
              className="py-2.5 px-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white font-bold text-xs transition border border-zinc-700/80 disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center gap-0.5 shadow-sm"
            >
              <span className="text-amber-400 text-sm font-black">+{preset.currencySymbol}{minIncrement * 5}</span>
              <span className="text-[10px] text-zinc-400 font-normal">Power Raise</span>
            </button>

            {/* All-In Button */}
            <button
              type="button"
              onClick={handleAllInBid}
              disabled={!hasEligibleSlot || maxLegalBid < minRequiredBid}
              className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-red-600/20 to-amber-600/20 hover:from-red-600/40 hover:to-amber-600/40 active:scale-95 text-amber-300 font-bold text-xs transition border border-amber-500/40 disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center gap-0.5 shadow-sm"
            >
              <span className="text-amber-300 text-sm font-black">Max Legal</span>
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
                className="w-full px-2.5 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={!hasEligibleSlot || !customBidAmount}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition disabled:opacity-40 active:scale-95"
              >
                Bid
              </button>
            </form>
          </div>

          {/* Validation Warnings */}
          <AnimatePresence>
            {bidError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 shadow-lg"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{bidError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {!hasEligibleSlot && activeTeam && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                {activeTeam?.name}&apos;s roster is fully drafted ({activeTeam.roster.filter(s => !!s.item).length}/{preset.rosterSlots.length}). Squad complete!
              </span>
            </div>
          )}
        </div>
      )}

      {/* Host Controls Bar */}
      {isHost && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0B0F17]/95 border border-zinc-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Host Hammer:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(phase === "sold" || phase === "passed") ? (
              <button
                type="button"
                onClick={onNextItem}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95"
              >
                Next Mystery Pick <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onHammerSold}
                  disabled={!currentBid}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  <Gavel className="w-3.5 h-3.5" /> SOLD Hammer
                </button>

                <button
                  type="button"
                  onClick={onPassItem}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition flex items-center gap-1.5 active:scale-95"
                >
                  <SkipForward className="w-3.5 h-3.5" /> Pass Item
                </button>

                {currentBid && (
                  <button
                    type="button"
                    onClick={onUndoBid}
                    className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white font-medium text-xs transition flex items-center gap-1 active:scale-95"
                    title="Undo last bid"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Undo
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
