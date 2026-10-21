"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import {
  Trophy,
  Award,
  Share2,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Sparkles,
  Heart,
  Flame,
  ThumbsUp,
  Zap,
  Users
} from "lucide-react"
import type { DraftState, DraftScoreResult } from "@/lib/draft/types"
import { calculateDraftLeaderboard } from "@/lib/draft/scoring"
import { generateDraftShareSummary } from "@/lib/draft/sharing"

interface DraftResultsViewProps {
  draftState: DraftState
  isHost: boolean
  onReplay: () => void
  onOpenVariantModal: () => void
  onCastVote?: (teamId: string, category: string) => void
  onExit: () => void
}

export function DraftResultsView({
  draftState,
  isHost,
  onReplay,
  onOpenVariantModal,
  onCastVote,
  onExit
}: DraftResultsViewProps) {
  const [copied, setCopied] = useState(false)
  const [myVotes, setMyVotes] = useState<Record<string, string>>({})

  // Calculate authoritative leaderboard
  const leaderboard: DraftScoreResult[] = calculateDraftLeaderboard(draftState)
  const champion = leaderboard[0]
  const runnerUp = leaderboard[1]
  const thirdPlace = leaderboard[2]

  const handleCopySummary = async () => {
    const summaryText = generateDraftShareSummary(draftState, leaderboard)
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(summaryText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handleNativeShare = async () => {
    const summaryText = generateDraftShareSummary(draftState, leaderboard)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `StirItUp Draft Arena: ${draftState.preset.title || draftState.preset.name}`,
          text: summaryText
        })
      } catch {
        handleCopySummary()
      }
    } else {
      handleCopySummary()
    }
  }

  const handleVote = (category: string, teamId: string) => {
    setMyVotes((prev) => ({ ...prev, [category]: teamId }))
    if (onCastVote) {
      onCastVote(teamId, category)
    }
  }

  const VOTING_CATEGORIES = [
    { id: "squad", label: "Best Overall Squad", icon: <Trophy className="w-4 h-4 text-amber-400" /> },
    { id: "aesthetic", label: "Best Theme & Vibe", icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
    { id: "steal", label: "Draft Steal of the Night", icon: <Zap className="w-4 h-4 text-emerald-400" /> },
    { id: "funny", label: "Most Chaotic Roster", icon: <Flame className="w-4 h-4 text-red-400" /> }
  ]

  const teamsList: any[] = Array.isArray(draftState.teams)
    ? draftState.teams
    : Object.values(draftState.teams || {})

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 text-zinc-100 py-4">
      {/* Champion Banner */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-500/10"
        >
          <Trophy className="w-4 h-4 text-amber-400" /> Auction Draft Concluded
        </motion.div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
          Draft Arena Champions
        </h2>
        <p className="text-zinc-400 text-sm max-w-md mx-auto">
          Theme: <strong>{draftState.preset.title || draftState.preset.name}</strong> · All slots signed & balances cleared!
        </p>
      </div>

      {/* Podium Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4">
        {/* 2nd Place */}
        {runnerUp && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="order-2 md:order-1 p-5 rounded-3xl bg-zinc-900/90 border border-zinc-700/60 text-center space-y-2 relative"
          >
            <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-zinc-600 flex items-center justify-center font-black text-zinc-300 text-sm mx-auto shadow-md">
              🥈 2nd
            </div>
            <h4 className="font-bold text-lg text-white truncate">{runnerUp.teamName}</h4>
            <span className="text-xs text-zinc-400 block">{runnerUp.ownerName}</span>
            <div className="pt-2 border-t border-zinc-800">
              <span className="text-xl font-black text-zinc-200 font-mono">
                {runnerUp.totalScore} pts
              </span>
            </div>
          </motion.div>
        )}

        {/* 1st Place Champion */}
        {champion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1.05, y: 0 }}
            className="order-1 md:order-2 p-6 rounded-3xl bg-gradient-to-b from-amber-950/70 via-zinc-900 to-zinc-950 border-2 border-amber-500 text-center space-y-3 relative shadow-2xl shadow-amber-500/20"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-black flex items-center justify-center font-black text-xl mx-auto shadow-lg shadow-amber-500/40">
              👑 1st
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block">
                Grand Champion
              </span>
              <h3 className="font-extrabold text-2xl text-white truncate">{champion.teamName}</h3>
              <span className="text-xs text-zinc-300">{champion.ownerName}</span>
            </div>
            <div className="pt-3 border-t border-amber-500/30">
              <span className="text-3xl font-black text-amber-400 font-mono block">
                {champion.totalScore} pts
              </span>
              <span className="text-[10px] text-zinc-400">
                Stat: {champion.statScore} · Synergies: +{champion.synergyBonus}
              </span>
            </div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {thirdPlace && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="order-3 p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 text-center space-y-2 relative"
          >
            <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-amber-700/50 flex items-center justify-center font-black text-amber-600 text-sm mx-auto shadow-md">
              🥉 3rd
            </div>
            <h4 className="font-bold text-lg text-white truncate">{thirdPlace.teamName}</h4>
            <span className="text-xs text-zinc-400 block">{thirdPlace.ownerName}</span>
            <div className="pt-2 border-t border-zinc-800">
              <span className="text-xl font-black text-zinc-200 font-mono">
                {thirdPlace.totalScore} pts
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Complete Leaderboard Breakdown */}
      <div className="rounded-3xl bg-zinc-900/80 border border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Full Draft Standings & Scores
          </h3>
          <span className="text-xs text-zinc-400">{leaderboard.length} Franchises</span>
        </div>

        <div className="divide-y divide-zinc-800/80">
          {leaderboard.map((entry) => (
            <div
              key={entry.teamId}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-800/30 transition"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-zinc-800 font-mono font-bold text-xs text-zinc-300 flex items-center justify-center shrink-0">
                  #{entry.rank}
                </span>
                <div>
                  <span className="font-bold text-white text-sm block">{entry.teamName}</span>
                  <span className="text-[11px] text-zinc-400">
                    Owner: {entry.ownerName} · Remaining Budget: {draftState.preset.currencySymbol}{entry.remainingBudget}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 block uppercase">Stats</span>
                  <span className="text-zinc-300">{entry.statScore}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 block uppercase">Synergy</span>
                  <span className="text-amber-400">+{entry.synergyBonus}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 block uppercase">Budget Eff</span>
                  <span className="text-emerald-400">+{entry.budgetEfficiencyBonus}</span>
                </div>
                <div className="text-right pl-3 border-l border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block uppercase">Total</span>
                  <span className="text-base font-bold text-white font-mono">{entry.totalScore}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audience / Peer Voting (STIR-111) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">
              Audience & Peer Awards
            </h3>
          </div>
          <span className="text-xs text-zinc-400">Cast your vote!</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {VOTING_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/90 space-y-3"
            >
              <div className="flex items-center gap-2">
                {cat.icon}
                <span className="font-bold text-white text-xs">{cat.label}</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {teamsList.map((team: any) => {
                  const isVoted = myVotes[cat.id] === team.id
                  const voteCount = draftState.audienceVotes?.[cat.id]?.[team.id] || 0

                  return (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => handleVote(cat.id, team.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 border ${
                        isVoted
                          ? "bg-amber-500 text-black border-amber-400 font-bold"
                          : "bg-zinc-900 text-zinc-300 border-zinc-700/60 hover:bg-zinc-800"
                      }`}
                    >
                      <span>{team.name}</span>
                      {voteCount > 0 && (
                        <span className="text-[10px] opacity-75 font-mono">({voteCount})</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Sharing & Replay Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <button
          type="button"
          onClick={handleNativeShare}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied Results Summary!" : "Share Results Card 📋"}
        </button>

        {isHost && (
          <>
            <button
              type="button"
              onClick={onReplay}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-sm transition flex items-center justify-center gap-2 border border-zinc-700"
            >
              <RotateCcw className="w-4 h-4" /> Draft Again
            </button>

            <button
              type="button"
              onClick={onOpenVariantModal}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-sm transition flex items-center justify-center gap-2 border border-zinc-700"
            >
              <Sliders className="w-4 h-4" /> Create Variant Theme
            </button>
          </>
        )}

        <button
          type="button"
          onClick={onExit}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-medium text-sm transition"
        >
          Exit Draft
        </button>
      </div>
    </div>
  )
}
