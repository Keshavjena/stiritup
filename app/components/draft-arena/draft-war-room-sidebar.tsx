"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  Crown,
  Shield,
  Activity,
  Layers,
  Coins,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  Trophy,
  X
} from "lucide-react"
import type { DraftTeam, DraftActionLog, DraftPreset } from "@/lib/draft/types"

interface DraftWarRoomSidebarProps {
  roomCode?: string
  players: string[]
  myPlayerName?: string
  isHost?: boolean
  teams: DraftTeam[]
  activeTeamId?: string
  onSelectTeam?: (teamId: string) => void
  preset: DraftPreset
  actionLog?: any[]
  actionLogs?: any[]
  isOpen?: boolean
  onClose?: () => void
  isMobileDrawerOpen?: boolean
  onCloseMobileDrawer?: () => void
}

export function DraftWarRoomSidebar({
  roomCode,
  players = [],
  myPlayerName = "",
  isHost = false,
  teams = [],
  activeTeamId,
  onSelectTeam,
  preset,
  actionLog,
  actionLogs,
  isOpen,
  onClose,
  isMobileDrawerOpen,
  onCloseMobileDrawer
}: DraftWarRoomSidebarProps) {
  const effectiveLogs = actionLog || actionLogs || []
  const effectiveOpen = isOpen !== undefined ? isOpen : isMobileDrawerOpen
  const effectiveClose = onClose || onCloseMobileDrawer
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<"teams" | "players" | "activity">("teams")

  const handleCopyCode = () => {
    if (!roomCode) return
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Deduplicate and clean player list
  const playerList = Array.from(new Set(players.filter(Boolean)))
  const currencySymbol = preset.currencySymbol || "$"

  const content = (
    <div className="flex flex-col h-full bg-[#0B0F17]/95 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl text-zinc-200">
      {/* Top Header: Room & Live Player Presence */}
      <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-gradient-to-r from-zinc-900/90 to-zinc-950/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider uppercase text-white">
                War Room
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-extrabold text-emerald-400">
                {playerList.length} Live
              </span>
            </div>
            <span className="text-[11px] text-zinc-400 font-medium truncate block max-w-[160px]">
              {preset.title || "Mystery Draft"}
            </span>
          </div>
        </div>

        {/* Room Code Badge */}
        {roomCode && (
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 transition text-xs font-mono font-bold text-zinc-300"
            title="Click to copy room code"
          >
            <span>{roomCode}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
            )}
          </button>
        )}

        {/* Mobile close button */}
        {(onCloseMobileDrawer || onClose) && (
          <button
            type="button"
            onClick={effectiveClose}
            className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-3 p-1.5 m-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("teams")}
          className={`py-1.5 rounded-xl transition ${
            activeTab === "teams"
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Franchises
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("players")}
          className={`py-1.5 rounded-xl transition ${
            activeTab === "players"
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Players ({playerList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("activity")}
          className={`py-1.5 rounded-xl transition ${
            activeTab === "activity"
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Activity
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto px-3.5 pb-4 space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-800">
        {/* TEAMS / FRANCHISES TAB */}
        {activeTab === "teams" && (
          <div className="space-y-3">
            {teams.map((team, idx) => {
              const isMine =
                activeTeamId === team.id ||
                (team.ownerName && team.ownerName.toLowerCase() === myPlayerName.toLowerCase())

              const filledSlots = team.roster.filter((s) => !("item" in s) || Boolean(s.item))
              const totalSlots = preset.rosterSlots.length || 5
              const budgetPercent = Math.max(0, Math.min(100, (team.budget / (preset.startingBudget || 100)) * 100))

              return (
                <div
                  key={team.id}
                  className={`p-3.5 rounded-2xl border transition ${
                    isMine
                      ? "bg-indigo-950/30 border-indigo-500/40 shadow-lg shadow-indigo-500/10"
                      : "bg-zinc-900/60 border-zinc-800/80"
                  }`}
                >
                  {/* Franchise Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                          idx === 0
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        }`}
                      >
                        T{idx + 1}
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-extrabold text-white block truncate">
                          {team.name}
                        </span>
                        {team.ownerName && (
                          <span className="text-[10px] text-zinc-400 truncate block">
                            Led by {team.ownerName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-black text-amber-400">
                        {currencySymbol}{team.budget}
                      </span>
                      <span className="text-[10px] text-zinc-400 block">
                        {filledSlots.length}/{totalSlots} signed
                      </span>
                    </div>
                  </div>

                  {/* Budget Meter Bar */}
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden mb-3">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        idx === 0 ? "bg-amber-400" : "bg-cyan-400"
                      }`}
                      style={{ width: `${budgetPercent}%` }}
                    />
                  </div>

                  {/* Drafted Roster List */}
                  {filledSlots.length > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      {filledSlots.map((entry, slotIdx) => {
                        const item = entry.item || entry
                        return (
                          <div
                            key={item.id || slotIdx}
                            className="px-2.5 py-1.5 rounded-xl bg-zinc-950/70 border border-zinc-800/70 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-[10px] font-bold text-zinc-500">
                                #{slotIdx + 1}
                              </span>
                              <span className="font-bold text-zinc-200 truncate">
                                {item.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {item.stats?.OVR && (
                                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono font-bold text-zinc-300">
                                  {item.stats.OVR}
                                </span>
                              )}
                              <span className="font-mono text-[11px] text-emerald-400 font-bold">
                                {currencySymbol}{entry.pricePaid || item.baseValuation || 0}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-2 text-center text-[11px] text-zinc-500 italic">
                      No picks signed yet
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* PLAYERS PRESENCE TAB */}
        {activeTab === "players" && (
          <div className="space-y-2">
            {playerList.map((player, idx) => {
              const isMe = player.toLowerCase() === myPlayerName.toLowerCase()
              const isFirst = idx === 0 // Host

              return (
                <div
                  key={player}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 ${
                    isMe
                      ? "bg-zinc-800/80 border-indigo-500/40"
                      : "bg-zinc-900/60 border-zinc-800/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                      {player.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">
                          {player}
                        </span>
                        {isMe && (
                          <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-black uppercase">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        In Room
                      </span>
                    </div>
                  </div>

                  {isFirst && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                      <Crown className="w-3 h-3 text-amber-400" /> Host
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ACTIVITY LOG TAB */}
        {activeTab === "activity" && (
          <div className="space-y-2">
            {actionLogs && actionLogs.length > 0 ? (
              actionLogs.slice(-20).reverse().map((log: any, idx: number) => {
                const isBid = log.type === "bid"
                const isSold = log.type === "sold"
                const isPass = log.type === "pass" || log.type === "passed"

                return (
                  <div
                    key={log.id || idx}
                    className={`p-2.5 rounded-xl border text-xs leading-relaxed ${
                      isSold
                        ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                        : isBid
                        ? "bg-amber-950/20 border-amber-500/25 text-amber-200"
                        : isPass
                        ? "bg-zinc-900 border-zinc-800 text-zinc-400"
                        : "bg-zinc-900/60 border-zinc-800 text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                        {log.type}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500">
                        {new Date(log.timestamp || Date.now()).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit"
                        })}
                      </span>
                    </div>
                    <p className="font-medium text-xs">
                      {log.description || log.message || "Draft event recorded"}
                    </p>
                  </div>
                )
              })
            ) : (
              <div className="py-6 text-center text-xs text-zinc-500 italic">
                No draft activity recorded yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop / Large Screen Permanent Sidebar */}
      <div className="hidden lg:block w-full h-[660px] sticky top-4">
        {content}
      </div>

      {/* Mobile Slide-Over Drawer */}
      <AnimatePresence>
        {effectiveOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={effectiveClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden flex justify-end"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm h-full p-3"
            >
              {content}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
