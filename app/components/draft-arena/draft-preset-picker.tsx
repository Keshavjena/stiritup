"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import {
  Trophy,
  Shield,
  Star,
  Home,
  Sparkles,
  Plus,
  Trash2,
  Users,
  Clock,
  Coins,
  ChevronRight,
  Gavel,
  Sliders
} from "lucide-react"
import { DEFAULT_PRESETS } from "@/lib/draft/presets"
import type { DraftPreset, DraftTeam } from "@/lib/draft/types"
import { DraftCustomThemeModal } from "./draft-custom-theme-modal"

interface DraftPresetPickerProps {
  initialPresets?: DraftPreset[]
  players: string[]
  isHost: boolean
  onStartDraft: (preset: DraftPreset, teams: DraftTeam[]) => void
}

const THEME_ICONS: Record<string, React.ReactNode> = {
  football: <Trophy className="w-5 h-5 text-emerald-400" />,
  superheroes: <Shield className="w-5 h-5 text-amber-400" />,
  celebrities: <Star className="w-5 h-5 text-purple-400" />,
  "dream-houses": <Home className="w-5 h-5 text-cyan-400" />,
  custom: <Sparkles className="w-5 h-5 text-amber-300" />
}

const THEME_GRADIENTS: Record<string, string> = {
  football: "from-emerald-950/60 to-zinc-950 border-emerald-500/30 hover:border-emerald-500/60",
  superheroes: "from-amber-950/60 to-zinc-950 border-amber-500/30 hover:border-amber-500/60",
  celebrities: "from-purple-950/60 to-zinc-950 border-purple-500/30 hover:border-purple-500/60",
  "dream-houses": "from-cyan-950/60 to-zinc-950 border-cyan-500/30 hover:border-cyan-500/60",
  custom: "from-zinc-900 to-zinc-950 border-zinc-700 hover:border-amber-400/60"
}

export function DraftPresetPicker({
  initialPresets = DEFAULT_PRESETS,
  players,
  isHost,
  onStartDraft
}: DraftPresetPickerProps) {
  const [presets, setPresets] = useState<DraftPreset[]>(initialPresets)
  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPresets[0]?.id || "football-legends")
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)

  // Teams setup
  const [teams, setTeams] = useState<DraftTeam[]>(() => {
    if (players && players.length >= 2) {
      return players.map((p, idx) => ({
        id: `team-${idx + 1}`,
        name: `${p}'s Franchise`,
        ownerName: p,
        budget: 100,
        initialBudget: 100,
        startingBudget: 100,
        roster: []
      }))
    }
    return [
      { id: "team-1", name: "Apex Dynasty", ownerName: "Player 1", budget: 100, initialBudget: 100, startingBudget: 100, roster: [] },
      { id: "team-2", name: "Nova Syndicate", ownerName: "Player 2", budget: 100, initialBudget: 100, startingBudget: 100, roster: [] },
      { id: "team-3", name: "Vanguard Elite", ownerName: "Player 3", budget: 100, initialBudget: 100, startingBudget: 100, roster: [] }
    ]
  })

  const [newTeamName, setNewTeamName] = useState("")

  const selectedPreset = presets.find((p) => p.id === selectedPresetId) || presets[0]

  const handleAddTeam = () => {
    if (!newTeamName.trim()) return
    const newTeam: DraftTeam = {
      id: `team-${Date.now()}`,
      name: newTeamName.trim(),
      ownerName: newTeamName.trim(),
      budget: selectedPreset.startingBudget,
      initialBudget: selectedPreset.startingBudget,
      startingBudget: selectedPreset.startingBudget,
      roster: []
    }
    setTeams((prev) => [...prev, newTeam])
    setNewTeamName("")
  }

  const handleRemoveTeam = (teamId: string) => {
    if (teams.length <= 2) return
    setTeams((prev) => prev.filter((t) => t.id !== teamId))
  }

  const handleCustomPresetSaved = (customPreset: DraftPreset) => {
    setPresets((prev) => [customPreset, ...prev])
    setSelectedPresetId(customPreset.id)
  }

  const handleLaunch = () => {
    if (!selectedPreset) return
    // Ensure teams have correct starting budget
    const finalTeams = teams.map((t) => ({
      ...t,
      budget: selectedPreset.startingBudget,
      startingBudget: selectedPreset.startingBudget
    }))
    onStartDraft(selectedPreset, finalTeams)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 text-zinc-100">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wide uppercase">
          <Gavel className="w-3.5 h-3.5" /> Reusable Auction Engine · Epic B
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Draft Arena Setup
        </h2>
        <p className="text-zinc-400 text-sm max-w-lg mx-auto">
          Choose a premier theme, configure team franchises, and compete in high-stakes auction bidding.
        </p>
      </div>

      {/* Preset Selection Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            1. Select Draft Theme
          </h3>
          <button
            type="button"
            onClick={() => setIsCustomModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition font-medium"
          >
            <Sliders className="w-3.5 h-3.5" /> Custom Theme Creator
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {presets.map((preset) => {
            const isSelected = preset.id === selectedPresetId
            const icon = THEME_ICONS[preset.theme] || THEME_ICONS.custom
            const gradient = THEME_GRADIENTS[preset.theme] || THEME_GRADIENTS.custom

            return (
              <motion.div
                key={preset.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPresetId(preset.id)}
                className={`relative cursor-pointer p-5 rounded-2xl border transition bg-gradient-to-b ${gradient} ${
                  isSelected ? "ring-2 ring-amber-400 shadow-xl shadow-amber-500/10" : "opacity-85"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
                    {icon}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                    {preset.currencySymbol}{preset.startingBudget}
                  </span>
                </div>

                <h4 className="font-bold text-base text-white mb-1">
                  {preset.title || preset.name}
                </h4>
                <p className="text-xs text-zinc-400 line-clamp-2 mb-3">{preset.description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-zinc-400">
                  <span>{preset.rosterSlots.length} Slots</span>
                  <span>{preset.items.length} Items</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Selected Theme Details Banner */}
      {selectedPreset && (
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Theme Specifications
              </span>
              <h4 className="text-lg font-bold text-white">
                {selectedPreset.title || selectedPreset.name}
              </h4>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                Budget: {selectedPreset.currencySymbol}{selectedPreset.startingBudget}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Timer: {selectedPreset.timerSeconds || selectedPreset.nominationTimerSeconds}s
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs text-zinc-400 block mb-2 font-medium">Required Roster Positions:</span>
            <div className="flex flex-wrap gap-2">
              {selectedPreset.rosterSlots.map((slot) => (
                <span
                  key={slot.id}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700 text-xs text-zinc-200"
                >
                  {slot.name} {(slot.isWildcard || !slot.required) && <span className="text-amber-400 text-[10px] ml-1">(Wildcard)</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Teams Setup */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            2. Participating Franchises ({teams.length} Teams)
          </h3>
          <span className="text-xs text-zinc-500">Min 2 teams required</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {teams.map((team, idx) => (
            <div
              key={team.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                  #{idx + 1}
                </div>
                <div className="truncate">
                  <span className="font-semibold text-white text-sm block truncate">{team.name}</span>
                  <span className="text-[10px] text-zinc-400">
                    Cap: {selectedPreset.currencySymbol}{selectedPreset.startingBudget}
                  </span>
                </div>
              </div>

              {teams.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveTeam(team.id)}
                  className="text-zinc-500 hover:text-red-400 p-1 transition"
                  title="Remove team"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Team Input */}
        <div className="flex gap-2 max-w-md">
          <input
            type="text"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTeam()}
            placeholder="Add new team / franchise..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={handleAddTeam}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-semibold text-xs transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Team
          </button>
        </div>
      </div>

      {/* Start Button */}
      <div className="pt-4 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleLaunch}
          disabled={!isHost || teams.length < 2}
          className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-base shadow-xl shadow-amber-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Gavel className="w-5 h-5" /> Start Auction Arena Draft
          <ChevronRight className="w-5 h-5 ml-1" />
        </button>

        {!isHost && (
          <p className="text-xs text-amber-400/80">Only the room host can start the draft.</p>
        )}
      </div>

      {/* Custom Theme Creator Modal */}
      <DraftCustomThemeModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSave={handleCustomPresetSaved}
      />
    </div>
  )
}
