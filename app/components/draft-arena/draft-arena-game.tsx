"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Gavel,
  ArrowLeft,
  Volume2,
  VolumeX,
  Sparkles,
  Users,
  Clock,
  Layers,
  ChevronRight,
  RotateCcw,
  Sliders,
  Send,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import type { DraftPreset, DraftTeam, DraftState, DraftItem } from "@/lib/draft/types"
import { DEFAULT_PRESETS } from "@/lib/draft/presets"
import {
  createInitialDraftState,
  nominateItem,
  placeBid,
  sellCurrentItem,
  passCurrentItem,
  advanceToNextItem,
  undoLastBid
} from "@/lib/draft/engine"
import { useSocket } from "@/hooks/useSocket"
import { DraftPresetPicker } from "./draft-preset-picker"
import { DraftAuctionBlock } from "./draft-auction-block"
import { DraftTeamRosters } from "./draft-team-rosters"
import { DraftResultsView } from "./draft-results-view"
import { DraftCustomThemeModal } from "./draft-custom-theme-modal"

interface DraftArenaGameProps {
  roomCode?: string
  players: string[]
  myPlayerName?: string
  isHost?: boolean
  onBack: () => void
  darkMode: boolean
  soundEnabled: boolean
  playSound: (type: "click" | "success" | "transition") => void
  matureContent?: boolean
}

export function DraftArenaGame({
  roomCode,
  players = [],
  myPlayerName = "",
  isHost = true,
  onBack,
  darkMode,
  soundEnabled,
  playSound
}: DraftArenaGameProps) {
  const socket = useSocket()
  const isMultiplayer = Boolean(roomCode && socket)

  // Local or Authoritative Draft State
  const [draftState, setDraftState] = useState<DraftState | null>(null)
  const [activeTab, setActiveTab] = useState<"auction" | "rosters" | "pool">("auction")
  const [activeTeamId, setActiveTeamId] = useState<string>("")
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false)
  const [serverBidError, setServerBidError] = useState<string | null>(null)

  // Timer Ref for Local Single-Device Mode
  const localTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Sync multiplayer socket events (STIR-110)
  useEffect(() => {
    if (!socket || !isMultiplayer) return

    const handleStateSync = (syncedState: DraftState | null) => {
      setDraftState(syncedState)
      if (syncedState && !activeTeamId) {
        const teamsList: any[] = Array.isArray(syncedState.teams)
          ? syncedState.teams
          : Object.values(syncedState.teams || {})
        const matched = teamsList.find(
          (t: any) => (t.ownerName || t.name || "").toLowerCase() === myPlayerName.toLowerCase()
        )
        setActiveTeamId(matched ? matched.id : teamsList[0]?.id || "")
      }
    }

    const handleBidPlaced = (payload: any) => {
      playSound("click")
      if (payload?.timeLeft !== undefined && draftState) {
        setDraftState((prev) => (prev ? { ...prev, timeLeft: payload.timeLeft } : null))
      }
    }

    const handleItemSold = () => {
      playSound("success")
    }

    const handleItemPassed = () => {
      playSound("transition")
    }

    const handleBidError = (err: { message: string }) => {
      setServerBidError(err.message)
      setTimeout(() => setServerBidError(null), 3500)
    }

    const handleTimerTick = (data: { timeLeft: number }) => {
      setDraftState((prev) => (prev ? { ...prev, timeLeft: data.timeLeft } : null))
    }

    socket.on("draft-state-sync", handleStateSync)
    socket.on("draft-bid-placed", handleBidPlaced)
    socket.on("draft-item-sold", handleItemSold)
    socket.on("draft-item-passed", handleItemPassed)
    socket.on("draft-bid-error", handleBidError)
    socket.on("draft-timer-tick", handleTimerTick)

    // Request authoritative state
    socket.emit("request-game-state", roomCode)

    return () => {
      socket.off("draft-state-sync", handleStateSync)
      socket.off("draft-bid-placed", handleBidPlaced)
      socket.off("draft-item-sold", handleItemSold)
      socket.off("draft-item-passed", handleItemPassed)
      socket.off("draft-bid-error", handleBidError)
      socket.off("draft-timer-tick", handleTimerTick)
    }
  }, [socket, isMultiplayer, roomCode, myPlayerName, playSound, activeTeamId, draftState])

  // Local Single-Device Mode Timer (STIR-109)
  useEffect(() => {
    if (isMultiplayer) return // Server handles countdown in multiplayer mode

    if (draftState?.timerActive && draftState.phase === "bidding") {
      localTimerRef.current = setInterval(() => {
        setDraftState((prev) => {
          if (!prev || !prev.timerActive) return prev
          if (prev.timeLeft > 1) {
            return { ...prev, timeLeft: prev.timeLeft - 1 }
          }
          // Timer reached 0
          if (prev.currentBid) {
            playSound("success")
            return sellCurrentItem(prev).state
          } else {
            playSound("transition")
            return passCurrentItem(prev).state
          }
        })
      }, 1000)
    } else {
      if (localTimerRef.current) {
        clearInterval(localTimerRef.current)
        localTimerRef.current = null
      }
    }

    return () => {
      if (localTimerRef.current) {
        clearInterval(localTimerRef.current)
        localTimerRef.current = null
      }
    }
  }, [draftState?.timerActive, draftState?.phase, isMultiplayer, playSound])

  // Initialize Draft
  const handleStartDraft = useCallback(
    (preset: DraftPreset, teams: DraftTeam[]) => {
      playSound("transition")
      if (isMultiplayer && socket) {
        socket.emit("draft-action", roomCode, {
          type: "init-draft",
          payload: { preset, teams }
        })
      } else {
        const initialState = createInitialDraftState(preset, teams, 0)
        setDraftState(initialState)
        setActiveTeamId(teams[0]?.id || "")
      }
    },
    [isMultiplayer, socket, roomCode, playSound]
  )

  // Nominate an item from pool
  const handleNominate = useCallback(
    (itemId: string) => {
      playSound("click")
      if (isMultiplayer && socket) {
        socket.emit("draft-action", roomCode, {
          type: "nominate-item",
          payload: { itemId, teamId: activeTeamId }
        })
      } else {
        setDraftState((prev) => (prev ? nominateItem(prev, itemId).state : null))
      }
      setActiveTab("auction")
    },
    [isMultiplayer, socket, roomCode, activeTeamId, playSound]
  )

  // Place a bid
  const handlePlaceBid = useCallback(
    (teamId: string, amount: number) => {
      playSound("click")
      const teamsList: any[] = Array.isArray(draftState?.teams)
        ? draftState?.teams
        : Object.values(draftState?.teams || {})
      const currentTeam = teamsList.find((t: any) => t.id === teamId)
      const bidderName = currentTeam?.name || myPlayerName || "Bidder"

      if (isMultiplayer && socket) {
        socket.emit("draft-action", roomCode, {
          type: "place-bid",
          payload: { teamId, amount, bidderName }
        })
      } else {
        setDraftState((prev) => {
          if (!prev) return null
          const res = placeBid(prev, teamId, amount)
          if (!res.success) {
            setServerBidError(res.error || "Invalid bid.")
            setTimeout(() => setServerBidError(null), 3000)
            return prev
          }
          return res.state
        })
      }
    },
    [isMultiplayer, socket, roomCode, draftState?.teams, myPlayerName, playSound]
  )

  // Host Hammers SOLD
  const handleHammerSold = useCallback(() => {
    playSound("success")
    if (isMultiplayer && socket) {
      socket.emit("draft-action", roomCode, { type: "sold-item" })
    } else {
      setDraftState((prev) => (prev ? sellCurrentItem(prev).state : null))
    }
  }, [isMultiplayer, socket, roomCode, playSound])

  // Host Passes Item
  const handlePassItem = useCallback(() => {
    playSound("transition")
    if (isMultiplayer && socket) {
      socket.emit("draft-action", roomCode, { type: "pass-item" })
    } else {
      setDraftState((prev) => (prev ? passCurrentItem(prev).state : null))
    }
  }, [isMultiplayer, socket, roomCode, playSound])

  // Host Undoes Bid
  const handleUndoBid = useCallback(() => {
    playSound("click")
    if (isMultiplayer && socket) {
      socket.emit("draft-action", roomCode, { type: "undo-bid" })
    } else {
      setDraftState((prev) => (prev ? undoLastBid(prev).state : null))
    }
  }, [isMultiplayer, socket, roomCode, playSound])

  // Advance to Next Item / Nominations
  const handleNextItem = useCallback(() => {
    playSound("click")
    if (isMultiplayer && socket) {
      socket.emit("draft-action", roomCode, { type: "next-item" })
    } else {
      setDraftState((prev) => (prev ? advanceToNextItem(prev).state : null))
    }
  }, [isMultiplayer, socket, roomCode, playSound])

  // Audience / Peer Voting (STIR-111)
  const handleCastVote = useCallback(
    (teamId: string, category: string) => {
      playSound("click")
      if (isMultiplayer && socket) {
        socket.emit("draft-action", roomCode, {
          type: "vote-roster",
          payload: { voterName: myPlayerName, teamId, category }
        })
      } else {
        setDraftState((prev) => {
          if (!prev) return null
          const nextVotes = { ...prev.audienceVotes }
          if (!nextVotes[category]) nextVotes[category] = {}
          nextVotes[category][teamId] = (nextVotes[category][teamId] || 0) + 1
          return { ...prev, audienceVotes: nextVotes }
        })
      }
    },
    [isMultiplayer, socket, roomCode, myPlayerName, playSound]
  )

  // Replay Draft
  const handleReplay = useCallback(() => {
    playSound("transition")
    if (draftState) {
      const teamsList: any[] = Array.isArray(draftState.teams)
        ? draftState.teams
        : Object.values(draftState.teams || {})
      const resetTeams = teamsList.map((t: any) => ({
        ...t,
        budget: draftState.preset.startingBudget,
        initialBudget: draftState.preset.startingBudget,
        startingBudget: draftState.preset.startingBudget,
        roster: []
      }))
      handleStartDraft(draftState.preset, resetTeams)
    }
  }, [draftState, handleStartDraft, playSound])

  const handleResetDraft = useCallback(() => {
    playSound("transition")
    if (isMultiplayer && socket) {
      socket.emit("draft-action", roomCode, { type: "reset-draft" })
    } else {
      setDraftState(null)
    }
  }, [isMultiplayer, socket, roomCode, playSound])

  const teamsList: any[] = Array.isArray(draftState?.teams)
    ? draftState.teams
    : Object.values(draftState?.teams || {})

  const itemPool: DraftItem[] = draftState?.pool || draftState?.itemPool || draftState?.preset.items || []

  // Current Nominated Item
  const nominatedItem: DraftItem | null =
    draftState?.currentItem ||
    (draftState?.nominatedItemId ? itemPool.find((i) => i.id === draftState.nominatedItemId) || null : null)

  // Available Items in Pool
  const availableItemIds: string[] =
    draftState?.availableItemIds ||
    itemPool
      .filter((i) => !draftState?.soldItems?.some((s) => (s.item?.id === i.id) || s.itemId === i.id))
      .map((i) => i.id)

  const availableItems = itemPool.filter((i) => availableItemIds.includes(i.id))

  const currentNominatingTeam =
    teamsList[draftState?.nominatingTeamIndex || draftState?.nominationIndex || 0] || null

  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-100 font-sans selection:bg-amber-500/20 selection:text-amber-300 py-6 px-4 sm:px-6">
      {/* Top Navigation Bar */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between pb-6 border-b border-zinc-800/80 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={draftState ? handleResetDraft : onBack}
            className="p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Gavel className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight flex items-center gap-2">
                Draft Arena
                {roomCode && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-zinc-800 text-amber-400 border border-zinc-700">
                    Room: {roomCode}
                  </span>
                )}
              </h1>
              <span className="text-[11px] text-zinc-400">
                {isMultiplayer ? "Live Multiplayer Sync" : "Single-Device Pass & Play"}
              </span>
            </div>
          </div>
        </div>

        {/* Action log / Ticker preview */}
        {draftState && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 hidden sm:inline">
              Available: <strong>{availableItems.length}</strong> items
            </span>
          </div>
        )}
      </div>

      {/* Global Toast / Error Alert */}
      <AnimatePresence>
        {serverBidError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-md mx-auto mb-4 p-3 rounded-2xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center gap-2 shadow-xl shadow-red-950/50"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{serverBidError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Router */}
      {!draftState ? (
        /* 1. Setup & Preset Selection */
        <DraftPresetPicker
          players={players}
          isHost={isHost}
          onStartDraft={handleStartDraft}
        />
      ) : draftState.phase === "completed" ? (
        /* 2. Completed Draft Results & Podium */
        <DraftResultsView
          draftState={draftState}
          isHost={isHost}
          onReplay={handleReplay}
          onOpenVariantModal={() => setIsVariantModalOpen(true)}
          onCastVote={handleCastVote}
          onExit={onBack}
        />
      ) : (
        /* 3. Active Auction Workspace */
        <div className="w-full max-w-4xl mx-auto space-y-6">
          {/* View Tab Switcher */}
          <div className="flex items-center justify-between p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab("auction")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === "auction"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Gavel className="w-3.5 h-3.5" /> Auction Block
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("rosters")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === "rosters"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Team Rosters ({draftState.teams.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("pool")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === "pool"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Item Pool ({availableItems.length})
            </button>
          </div>

          {/* Nomination Alert Header if in Nominating phase */}
          {draftState.phase === "nominating" && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 to-zinc-900 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    Nomination Turn
                  </span>
                  <span className="font-bold text-sm text-white">
                    {currentNominatingTeam ? currentNominatingTeam.name : "Host"} is on the clock to nominate!
                  </span>
                </div>
              </div>

              {availableItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleNominate(availableItems[0].id)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                >
                  Quick Nominate: {availableItems[0].name} <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Tab 1: Central Auction Block */}
          {activeTab === "auction" && (
            <DraftAuctionBlock
              item={nominatedItem}
              preset={draftState.preset}
              currentBid={draftState.currentBid}
              timeLeft={draftState.timeLeft}
              timerActive={draftState.timerActive}
              phase={(draftState.phase || draftState.status || "nominating") as any}
              teams={teamsList}
              activeTeamId={activeTeamId}
              isHost={isHost}
              isSingleDeviceMode={!isMultiplayer}
              onSelectActiveTeam={setActiveTeamId}
              onPlaceBid={handlePlaceBid}
              onHammerSold={handleHammerSold}
              onPassItem={handlePassItem}
              onUndoBid={handleUndoBid}
              onNextItem={handleNextItem}
            />
          )}

          {/* Tab 2: All Team Rosters & Synergies */}
          {activeTab === "rosters" && (
            <DraftTeamRosters
              teams={teamsList}
              preset={draftState.preset}
              activeTeamId={activeTeamId}
              onSelectTeam={setActiveTeamId}
            />
          )}

          {/* Tab 3: Item Pool & Nomination Drawer */}
          {activeTab === "pool" && (
            <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">Auction Pool Catalog</h3>
                  <p className="text-xs text-zinc-400">
                    Select an item to nominate to the central auction block
                  </p>
                </div>
                <span className="text-xs font-mono text-amber-400">
                  {availableItems.length} remaining / {itemPool.length} total
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {itemPool.map((item) => {
                  const isAvailable = availableItemIds.includes(item.id)
                  const isNominated =
                    draftState.currentItem?.id === item.id || draftState.nominatedItemId === item.id
                  const soldRecord = draftState.soldItems.find(
                    (s: any) => s.item?.id === item.id || s.itemId === item.id
                  )
                  const winningTeam = soldRecord
                    ? teamsList.find((t: any) => t.id === (soldRecord.buyerId || soldRecord.teamId))
                    : null

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition flex flex-col justify-between ${
                        isNominated
                          ? "bg-amber-950/40 border-amber-500 shadow-md shadow-amber-500/10"
                          : isAvailable
                          ? "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                          : "bg-zinc-950/40 border-zinc-900 opacity-60"
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover border border-zinc-700 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                            <Sparkles className="w-5 h-5" />
                          </div>
                        )}
                        <div className="truncate">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                            {item.category}
                          </span>
                          <span className="font-bold text-white text-sm truncate block">{item.name}</span>
                          <span className="text-[11px] text-zinc-400 line-clamp-1">{item.description}</span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                        {isAvailable ? (
                          <button
                            type="button"
                            onClick={() => handleNominate(item.id)}
                            className="w-full py-1.5 rounded-xl bg-zinc-800 hover:bg-amber-500 hover:text-black text-amber-400 font-bold transition text-xs flex items-center justify-center gap-1"
                          >
                            Nominate Item <Gavel className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-zinc-500 italic">
                            Sold to {winningTeam?.name || "Team"} for {draftState.preset.currencySymbol}{soldRecord?.price}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Live Action Feed Ticker */}
          {draftState.actionLog && draftState.actionLog.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Live Auction Hall Feed:
              </span>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {draftState.actionLog.slice(-4).reverse().map((log) => (
                  <div key={log.id} className="text-zinc-400 flex items-center gap-2">
                    <span className="text-amber-500 text-[10px]">●</span>
                    <span className="text-zinc-300 font-medium">{log.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Variant Modal if requested */}
      {draftState && (
        <DraftCustomThemeModal
          isOpen={isVariantModalOpen}
          initialPreset={draftState.preset}
          onClose={() => setIsVariantModalOpen(false)}
          onSave={(variant) => {
            handleStartDraft(variant, teamsList)
          }}
        />
      )}
    </div>
  )
}
