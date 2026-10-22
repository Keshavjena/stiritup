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
import { DraftWarRoomSidebar } from "./draft-war-room-sidebar"
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
  const [viewMode, setViewMode] = useState<"auction" | "full-rosters">("auction")
  const [activeTeamId, setActiveTeamId] = useState<string>("")
  const [isWarRoomDrawerOpen, setIsWarRoomDrawerOpen] = useState(false)
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
        let initialState = createInitialDraftState(preset, teams, 0)
        // Auto-nominate first mystery lot
        if (initialState.availableItemIds && initialState.availableItemIds.length > 0) {
          const firstId = initialState.availableItemIds[0]
          initialState = nominateItem(initialState, firstId).state
        }
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
      setViewMode("auction")
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

  // Current Nominated Item - prioritize nominatedItemId if present so item transitions cleanly
  const nominatedItem: DraftItem | null =
    (draftState?.nominatedItemId ? itemPool.find((i) => i.id === draftState.nominatedItemId) || null : null) ||
    draftState?.currentItem ||
    null

  // Exclude both sold items and passed items from availableItemIds
  const soldOrPassedIds = new Set([
    ...(draftState?.soldItems || []).map((s: any) => s.item?.id || s.itemId),
    ...(draftState?.passedItemIds || [])
  ])

  // Available Items in Pool
  const availableItemIds: string[] = (
    draftState?.availableItemIds && draftState.availableItemIds.length > 0
      ? draftState.availableItemIds
      : itemPool.map((i) => i.id)
  ).filter((id) => !soldOrPassedIds.has(id))

  const availableItems = itemPool.filter((i) => availableItemIds.includes(i.id))

  const currentNominatingTeam =
    teamsList[draftState?.nominatingTeamIndex || draftState?.nominationIndex || 0] || null

  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-100 font-sans selection:bg-amber-500/20 selection:text-amber-300 py-6 px-4 sm:px-6">
      {/* Top Navigation Bar */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between pb-5 border-b border-zinc-800/80 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={draftState ? handleResetDraft : onBack}
            className="p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Gavel className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base text-white tracking-tight">
                  Draft Arena
                </h1>
                {roomCode && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-zinc-900 text-amber-400 border border-zinc-800">
                    Room: {roomCode}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-zinc-400 block">
                {isMultiplayer ? "Live Multiplayer Sync" : "Single-Device Pass & Play"}
              </span>
            </div>
          </div>
        </div>

        {/* Live Presence & Header Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsWarRoomDrawerOpen(true)}
            className="py-1.5 px-3 rounded-full bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 text-xs font-semibold flex items-center gap-2 hover:bg-emerald-950/50 transition shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{players.length || 1} Live</span>
          </button>

          {draftState && (
            <button
              type="button"
              onClick={handleResetDraft}
              className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
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
        /* 3. Active Auction Workspace (Side-by-Side with War Room) */
        <div className="w-full max-w-7xl mx-auto space-y-4">
          {/* Workspace Controls */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 p-1 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <button
                type="button"
                onClick={() => setViewMode("auction")}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === "auction"
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Gavel className="w-3.5 h-3.5" />
                <span>Auction Arena</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("full-rosters")}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === "full-rosters"
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Team Rosters ({teamsList.length})</span>
              </button>
            </div>

            {/* Mobile War Room Trigger Button */}
            <button
              type="button"
              onClick={() => setIsWarRoomDrawerOpen(true)}
              className="lg:hidden py-1.5 px-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-200 hover:text-white flex items-center gap-2 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>War Room</span>
            </button>
          </div>

          {/* View Mode 1: Main Auction Block & Desktop Sidebar */}
          {viewMode === "auction" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (8 cols): Central 10-Lot Auction Block */}
              <div className="lg:col-span-8 space-y-4">
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
                  availableItems={availableItems}
                  soldItems={draftState.soldItems || []}
                  passedItemIds={draftState.passedItemIds || []}
                  nominatingTeam={currentNominatingTeam}
                  onNominate={handleNominate}
                  onSelectActiveTeam={setActiveTeamId}
                  onPlaceBid={handlePlaceBid}
                  onHammerSold={handleHammerSold}
                  onPassItem={handlePassItem}
                  onUndoBid={handleUndoBid}
                  onNextItem={handleNextItem}
                />
              </div>

              {/* Right Column (4 cols): Desktop Persistent War Room Sidebar */}
              <div className="lg:col-span-4 hidden lg:block sticky top-6">
                <DraftWarRoomSidebar
                  roomCode={roomCode}
                  players={players}
                  myPlayerName={myPlayerName}
                  isHost={isHost}
                  teams={teamsList}
                  preset={draftState.preset}
                  activeTeamId={activeTeamId}
                  onSelectTeam={setActiveTeamId}
                  actionLog={draftState.actionLog || []}
                  isOpen={true}
                  onClose={() => {}}
                />
              </div>
            </div>
          ) : (
            /* View Mode 2: Expanded Team Rosters & Synergies */
            <div className="space-y-4">
              <DraftTeamRosters
                teams={teamsList}
                preset={draftState.preset}
                activeTeamId={activeTeamId}
                onSelectTeam={setActiveTeamId}
              />
            </div>
          )}

          {/* Mobile Slide-Over War Room Drawer */}
          <DraftWarRoomSidebar
            roomCode={roomCode}
            players={players}
            myPlayerName={myPlayerName}
            isHost={isHost}
            teams={teamsList}
            preset={draftState.preset}
            activeTeamId={activeTeamId}
            onSelectTeam={setActiveTeamId}
            actionLog={draftState.actionLog || []}
            isOpen={isWarRoomDrawerOpen}
            onClose={() => setIsWarRoomDrawerOpen(false)}
          />
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
