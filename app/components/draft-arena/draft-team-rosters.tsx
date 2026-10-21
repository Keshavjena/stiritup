"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Users, Coins, Sparkles, Check, ChevronDown, ChevronUp, Shield, Zap } from "lucide-react"
import type { DraftTeam, DraftPreset } from "@/lib/draft/types"
import { calculateTeamScore } from "@/lib/draft/scoring"

interface DraftTeamRostersProps {
  teams: DraftTeam[]
  preset: DraftPreset
  activeTeamId?: string
  onSelectTeam?: (teamId: string) => void
}

export function DraftTeamRosters({
  teams,
  preset,
  activeTeamId,
  onSelectTeam
}: DraftTeamRostersProps) {
  const [selectedTabTeamId, setSelectedTabTeamId] = useState<string>(activeTeamId || teams[0]?.id || "")

  const displayedTeam = teams.find((t) => t.id === selectedTabTeamId) || teams[0]
  const teamScore = displayedTeam ? calculateTeamScore(displayedTeam, preset) : null

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-zinc-900/80 border border-zinc-800 p-5 sm:p-6 space-y-6">
      {/* Header & Team Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white text-base">Team Rosters & Budgets</h3>
        </div>

        {/* Horizontal Scrollable Team Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {teams.map((team) => {
            const isSelected = team.id === displayedTeam?.id
            const filledCount = team.roster.filter((s) => !!s.item).length
            const totalCount = team.roster.length

            return (
              <button
                key={team.id}
                type="button"
                onClick={() => {
                  setSelectedTabTeamId(team.id)
                  if (onSelectTeam) onSelectTeam(team.id)
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 border ${
                  isSelected
                    ? "bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20"
                    : "bg-zinc-800/80 text-zinc-300 border-zinc-700/60 hover:bg-zinc-700"
                }`}
              >
                <span>{team.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                    isSelected ? "bg-black/20 text-black font-bold" : "bg-zinc-900 text-zinc-400"
                  }`}
                >
                  {filledCount}/{totalCount}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Team Overview Banner */}
      {displayedTeam && (
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-amber-400 block">
                Franchise Roster
              </span>
              <h4 className="text-xl font-bold text-white">{displayedTeam.name}</h4>
              <span className="text-xs text-zinc-400">Owner: {displayedTeam.ownerName || displayedTeam.name}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 block uppercase">Remaining Cap</span>
                <span className="text-lg font-black text-amber-400 font-mono">
                  {preset.currencySymbol}{displayedTeam.budget}
                </span>
              </div>

              {teamScore && (
                <div className="text-right pl-4 border-l border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block uppercase">Est. Score</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {teamScore.totalScore} pts
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Budget Bar */}
          <div>
            {(() => {
              const startBudget = displayedTeam.initialBudget || displayedTeam.startingBudget || preset.startingBudget
              return (
                <>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                    <span>Budget Spent: {preset.currencySymbol}{startBudget - displayedTeam.budget}</span>
                    <span>Available: {preset.currencySymbol}{displayedTeam.budget}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          ((startBudget - displayedTeam.budget) / startBudget) * 100
                        )}%`
                      }}
                    />
                  </div>
                </>
              )
            })()}
          </div>

          {/* Synergies Banner if any */}
          {teamScore && Boolean(teamScore.synergyBonus && teamScore.synergyBonus > 0) && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Active Synergies: <strong>+{teamScore.synergyBonus} pts</strong> bonus unlocked!
              </span>
            </div>
          )}
        </div>
      )}

      {/* Roster Slots Grid */}
      {displayedTeam && (
        <div className="space-y-3">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
            Roster Slots ({displayedTeam.roster.filter((s) => !!s.item).length} / {displayedTeam.roster.length} Signed)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayedTeam.roster.map((slot: any) => {
              const item = slot.item
              const presetSlot = preset.rosterSlots.find((rs) => rs.id === slot.slotId)
              const slotDisplayName = slot.slotName || presetSlot?.name || "Roster Slot"
              const slotCategoryName =
                slot.slotCategory || presetSlot?.allowedCategories?.[0] || presetSlot?.slotCategory || "Any"
              const isSlotWildcard = Boolean(slot.isWildcard || presetSlot?.isWildcard || !presetSlot?.required)

              if (item) {
                return (
                  <div
                    key={slot.slotId}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950 border border-emerald-500/30 shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-zinc-700 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                          <Shield className="w-5 h-5" />
                        </div>
                      )}
                      <div className="truncate">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                          {slotDisplayName}
                        </span>
                        <span className="font-bold text-white text-sm truncate block">{item.name}</span>
                        <span className="text-[10px] text-zinc-400">{item.category}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-zinc-500 block">Acquired</span>
                      <span className="text-xs font-bold text-amber-400 font-mono">
                        {preset.currencySymbol}{slot.pricePaid}
                      </span>
                    </div>
                  </div>
                )
              }

              // Empty Slot
              return (
                <div
                  key={slot.slotId}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950/40 border border-dashed border-zinc-800 text-zinc-500"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-center text-zinc-600 font-mono text-xs">
                      OPEN
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-zinc-300 block">{slotDisplayName}</span>
                      <span className="text-[10px] text-zinc-500">
                        Requires: {slotCategoryName} {isSlotWildcard ? "(Wildcard)" : ""}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-500">
                    Unfilled
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
