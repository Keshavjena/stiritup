"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  X,
  Crown,
  Copy,
  Check,
  Shield,
  Volume2,
  VolumeX,
  Sparkles,
  Trophy,
  Beer,
  Gamepad2,
  Flame,
  Radio
} from "lucide-react"

export interface LivePlayersSidebarProps {
  isOpen: boolean
  onClose: () => void
  roomCode?: string
  gameId: string
  gameName: string
  players: string[]
  currentPlayerIndex?: number
  myPlayerName?: string
  isHost?: boolean
  scores?: Record<string, number>
  sips?: Record<string, number>
  matureContent?: boolean
  soundEnabled?: boolean
  onToggleSound?: () => void
}

export function LivePlayersSidebar({
  isOpen,
  onClose,
  roomCode,
  gameId,
  gameName,
  players = [],
  currentPlayerIndex = 0,
  myPlayerName = "",
  isHost = false,
  scores = {},
  sips = {},
  matureContent = false,
  soundEnabled = true,
  onToggleSound
}: LivePlayersSidebarProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyRoom = () => {
    if (!roomCode) return
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Slide-over Rail */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-neutral-950 border-l border-zinc-800/90 z-50 flex flex-col shadow-2xl overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-850 flex items-center justify-between bg-zinc-900/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white tracking-tight">Live Session</h2>
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-800/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      {players.length} Active
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 truncate block max-w-[180px]">
                    {gameName}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              {/* Room Code Card */}
              {roomCode && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                      Room Code
                    </span>
                    <span className="font-mono text-base font-bold text-amber-400 tracking-wider">
                      {roomCode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyRoom}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Game Info Chips */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-850 flex items-center gap-2">
                  <Gamepad2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-zinc-500 block uppercase">Game</span>
                    <span className="text-zinc-200 font-semibold truncate block">{gameName}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-850 flex items-center gap-2">
                  {matureContent ? (
                    <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  ) : (
                    <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  )}
                  <div className="truncate">
                    <span className="text-[10px] text-zinc-500 block uppercase">Rating</span>
                    <span className="text-zinc-200 font-semibold truncate block">
                      {matureContent ? "Mature 18+" : "Casual"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Connected Players List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-zinc-500" />
                    Players Around ({players.length})
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-mono">Live Roster</span>
                </div>

                <div className="space-y-2">
                  {players.map((playerName, idx) => {
                    const isTurn = idx === currentPlayerIndex
                    const isMe = playerName.toLowerCase() === myPlayerName.toLowerCase()
                    const isRoomHost = idx === 0
                    const playerSips = sips[playerName] || 0
                    const playerScore = scores[playerName] || 0

                    return (
                      <div
                        key={playerName}
                        className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                          isTurn
                            ? "bg-amber-950/20 border-amber-500/40 shadow-sm"
                            : isMe
                            ? "bg-zinc-900/80 border-zinc-750"
                            : "bg-zinc-900/40 border-zinc-850"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                              isTurn
                                ? "bg-amber-500 text-black shadow-md shadow-amber-500/30"
                                : "bg-zinc-800 text-zinc-200 border border-zinc-700"
                            }`}
                          >
                            {playerName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-white truncate">
                                {playerName}
                              </span>
                              {isMe && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                                  You
                                </span>
                              )}
                              {isRoomHost && (
                                <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-500 block truncate">
                              {isTurn ? (
                                <span className="text-amber-400 font-semibold">Active Turn</span>
                              ) : (
                                "Connected"
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Player Metrics */}
                        <div className="flex items-center gap-2 text-right shrink-0">
                          {playerScore > 0 && (
                            <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-800/40">
                              <Trophy className="w-3 h-3 text-amber-400" />
                              {playerScore}
                            </span>
                          )}
                          {playerSips > 0 && (
                            <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-cyan-800/40">
                              <Beer className="w-3 h-3 text-cyan-300" />
                              {playerSips}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Sound & Controls */}
              {onToggleSound && (
                <div className="pt-3 border-t border-zinc-850 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-zinc-400 font-semibold">
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-zinc-600" />
                    )}
                    <span>Game Audio FX</span>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleSound}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition border ${
                      soundEnabled
                        ? "bg-zinc-800 border-zinc-700 text-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    }`}
                  >
                    {soundEnabled ? "Enabled" : "Muted"}
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-850 bg-zinc-900/60 text-center">
              <span className="text-[10px] text-zinc-500 font-mono block">
                Stir It Up • Multiplayer Sync Active
              </span>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
